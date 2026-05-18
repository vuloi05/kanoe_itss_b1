"use client";
import LearnerNavbar from "@/components/layout/LearnerNavbar";
import LearnerBottomNav from "@/components/layout/LearnerBottomNav";
import { useState, useEffect, useRef, useCallback, type Dispatch, type SetStateAction } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePresence } from "@/contexts/PresenceContext";
import { useAuth } from "@/lib/auth";
import { messageApi, bookingApi, type ConversationDto, type BookingDto } from "@/lib/api";
import {
  type LocalMessage,
  formatMessageTime,
  formatConversationTime,
  generateTempId,
  useOfflineQueue,
  useLazyLoadMessages,
  isMeetLink,
} from "@/lib/chatUtils";
import { useSignalR, type BookingEventPayload } from "@/hooks/useSignalR";

export default function LearnerMessagesPage() {
  const [activeConvIdx, setActiveConvIdx] = useState(0);
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const { user } = useAuth();
  const { t } = useLanguage();
  const { isUserOnline } = usePresence();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Booking state
  const [bookingCards, setBookingCards] = useState<BookingDto[]>([]);
  const [toast, setToast] = useState<{message:string; type:"success"|"error"|"warning"} | null>(null);
  const [declineModalId, setDeclineModalId] = useState<string|null>(null);
  const [acceptingId, setAcceptingId] = useState<string|null>(null);
  const [decliningId, setDecliningId] = useState<string|null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" | "warning") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Offline queue hook
  const { isOnline, enqueue } = useOfflineQueue(setMessages, setConversations as Dispatch<SetStateAction<ConversationDto[]>>);

  // Lazy load hook
  const { sentinelRef, isLoadingMore, hasMore, resetPagination } =
    useLazyLoadMessages(conversations[activeConvIdx]?.conversationId, setMessages);

  // Fetch conversations on load
  useEffect(() => {
    messageApi
      .getConversations()
      .then((data) => setConversations(data))
      .catch(console.error);
  }, []);

  // Set up SignalR hook
  const handleReceiveMessage = useCallback((newMsg: LocalMessage) => {
    newMsg._sendStatus = "sent";
    setMessages(prev => {
      // Replace optimistic temp message if server ACK arrives
      const withoutTemp = prev.filter(
        m => !(m._tempId && m.content === newMsg.content && m.senderId === newMsg.senderId)
      );
      if (withoutTemp.find(m => m.messageId === newMsg.messageId)) return withoutTemp;
      return [newMsg, ...withoutTemp];
    });
    
    // Update last message in conversation list
    setConversations(prev => {
      const copy = [...prev];
      const idx = copy.findIndex(c => c.conversationId === newMsg.conversationId);
      if (idx >= 0) {
        copy[idx].lastMessage = newMsg.content;
        copy[idx].lastMessageTime = newMsg.sentAt;
      }
      return copy;
    });
  }, []);

  // Handler: booking lifecycle events pushed by BookingService via SignalR
  const handleReceiveBookingEvent = useCallback((payload: BookingEventPayload) => {
    const { eventType, booking } = payload;

    if (eventType === "lesson_request") {
      // Add new booking card if it doesn't already exist
      setBookingCards(prev => {
        if (prev.find(b => b.bookingId === booking.bookingId)) return prev;
        return [booking, ...prev];
      });
      showToast(t("Đề xuất buổi học mới!", "新しいレッスンの提案！"), "success");
    } else if (eventType === "lesson_cancelled") {
      // Remove the cancelled booking card from the list
      setBookingCards(prev => prev.filter(b => b.bookingId !== booking.bookingId));
      showToast(t("Đối tác đã hủy buổi học.", "パートナーがレッスンをキャンセルしました。"), "warning");
    }
  }, [showToast, t]);

  const { startConnection, stopConnection } = useSignalR({
    getToken: () => localStorage.getItem("auth_token"),
    onReceiveMessage: handleReceiveMessage,
    onReceiveBookingEvent: handleReceiveBookingEvent,
  });

  const activeConv = conversations[activeConvIdx];

  // Fetch messages and subscribe to Realtime when activeConv changes
  useEffect(() => {
    if (!activeConv) return;

    // Reset pagination for new conversation
    resetPagination();

    // Fetch initial messages (page 1)
    messageApi
      .getMessages(activeConv.conversationId, 1, 50)
      .then((data) => {
        setMessages(data as LocalMessage[]);
        if (activeConv.unreadCount > 0) {
          messageApi
            .markAsRead(activeConv.conversationId)
            .catch(console.error);
          setConversations((prev) =>
            prev.map((c, i) =>
              i === activeConvIdx ? { ...c, unreadCount: 0 } : c
            )
          );
        }
      })
      .catch(console.error);

    // Load bookings for this conversation
    bookingApi.getBookingsForConversation(activeConv.conversationId)
      .then(data => setBookingCards(data))
      .catch(console.error);

    // Connect to SignalR
    startConnection();

    return () => {
      stopConnection();
    };
  }, [activeConv, activeConvIdx, resetPagination, startConnection, stopConnection]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message handler with optimistic UI + offline queue
  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !activeConv) return;

    const txt = inputText.trim();
    setInputText("");

    // Optimistic: add bubble immediately
    const tempId = generateTempId();
    const optimisticMsg: LocalMessage = {
      messageId: tempId,
      conversationId: activeConv.conversationId,
      senderId: user?.userId || "",
      content: txt,
      contentTranslated: null,
      isRead: false,
      sentAt: new Date().toISOString(),
      _sendStatus: isOnline ? "sending" : "queued",
      _tempId: tempId,
    };
    setMessages((prev) => [optimisticMsg, ...prev]);

    // If offline → enqueue for later
    if (!isOnline) {
      enqueue(tempId, activeConv.conversationId, txt);
      return;
    }

    try {
      const newMsg = await messageApi.sendMessage(
        activeConv.conversationId,
        txt
      );
      // Replace optimistic message with server response
      setMessages((prev) =>
        prev.map((m) =>
          m._tempId === tempId
            ? { ...newMsg, _sendStatus: "sent" as const }
            : m
        )
      );
      // Update conversation list
      setConversations((prev) => {
        const copy = [...prev];
        const idx = copy.findIndex(
          (c) => c.conversationId === activeConv.conversationId
        );
        if (idx >= 0) {
          copy[idx].lastMessage = txt;
          copy[idx].lastMessageTime = newMsg.sentAt;
        }
        return copy;
      });
    } catch {
      // Network might have dropped mid-request → enqueue
      if (!navigator.onLine) {
        enqueue(tempId, activeConv.conversationId, txt);
      } else {
        // Mark as failed
        setMessages((prev) =>
          prev.map((m) =>
            m._tempId === tempId ? { ...m, _sendStatus: "failed" } : m
          )
        );
      }
    }
  }, [inputText, activeConv, user, isOnline, enqueue]);

  // Retry failed message
  const handleRetry = useCallback(
    async (tempId: string) => {
      const failedMsg = messages.find((m) => m._tempId === tempId);
      if (!failedMsg || !activeConv) return;

      // Set back to sending
      setMessages((prev) =>
        prev.map((m) =>
          m._tempId === tempId ? { ...m, _sendStatus: "sending" } : m
        )
      );

      try {
        const newMsg = await messageApi.sendMessage(
          activeConv.conversationId,
          failedMsg.content
        );
        setMessages((prev) =>
          prev.map((m) =>
            m._tempId === tempId
              ? { ...newMsg, _sendStatus: "sent" as const }
              : m
          )
        );
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m._tempId === tempId ? { ...m, _sendStatus: "failed" } : m
          )
        );
      }
    },
    [messages, activeConv]
  );

  // Keyboard handler: Enter = send, Shift+Enter = newline
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  /** Render status icon for sent messages */
  const renderStatusIcon = (msg: LocalMessage) => {
    if (msg.senderId !== user?.userId) return null;
    switch (msg._sendStatus) {
      case "queued":
        return (
          <span className="material-symbols-outlined text-[12px] text-amber-300 ml-1" title={t("Đang chờ gửi", "送信待ち")}>
            hourglass_empty
          </span>
        );
      case "sending":
        return (
          <span className="material-symbols-outlined text-[12px] text-white/60 ml-1">
            schedule
          </span>
        );
      case "failed":
        return (
          <button
            onClick={() => msg._tempId && handleRetry(msg._tempId)}
            className="ml-1 flex items-center gap-0.5 text-[10px] text-red-300 hover:text-red-100 cursor-pointer transition-colors"
            title={t("Thử lại", "リトライ")}
          >
            <span className="material-symbols-outlined text-[12px]">error</span>
            <span className="underline">{t("Thử lại", "リトライ")}</span>
          </button>
        );
      case "sent":
      default:
        return (
          <span className="material-symbols-outlined text-[12px] text-white/60 ml-1">
            done
          </span>
        );
    }
  };

  // ─── Booking Helpers ───────────────────────────────────────

  // Format a UTC ISO string to Hanoi Time date display
  const formatBookingDate = (utcIso: string) => {
    const d = new Date(utcIso);
    const hanoi = new Date(d.getTime() + 7 * 60 * 60 * 1000);
    const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const daysJa = ["日", "月", "火", "水", "木", "金", "土"];
    const dd = String(hanoi.getUTCDate()).padStart(2, "0");
    const mm = String(hanoi.getUTCMonth() + 1).padStart(2, "0");
    const yyyy = hanoi.getUTCFullYear();
    return t(
      `${days[hanoi.getUTCDay()]}, ${dd}/${mm}/${yyyy}`,
      `${yyyy}年${hanoi.getUTCMonth()+1}月${hanoi.getUTCDate()}日(${daysJa[hanoi.getUTCDay()]})`
    );
  };

  const formatBookingTime = (utcIso: string) => {
    const d = new Date(utcIso);
    const hanoi = new Date(d.getTime() + 7 * 60 * 60 * 1000);
    return `${String(hanoi.getUTCHours()).padStart(2, "0")}:${String(hanoi.getUTCMinutes()).padStart(2, "0")}`;
  };

  // Accept lesson request
  const handleAccept = async (bookingId: string) => {
    setAcceptingId(bookingId);
    try {
      const result = await bookingApi.acceptLessonRequest(bookingId);
      setBookingCards(prev => prev.map(b => b.bookingId === bookingId ? { ...b, status: result.status } : b));
      showToast(t("Đã xác nhận lịch hẹn!", "レッスンを承認しました！"), "success");
    } catch {
      showToast(t("Có lỗi xảy ra, vui lòng thử lại.", "エラーが発生しました。"), "error");
    } finally {
      setAcceptingId(null);
    }
  };

  // Decline lesson request
  const confirmDecline = async (bookingId: string) => {
    setDecliningId(bookingId);
    try {
      await bookingApi.declineLessonRequest(bookingId);
      setBookingCards(prev => prev.filter(b => b.bookingId !== bookingId));
      setDeclineModalId(null);
      showToast(t("Đã từ chối lịch hẹn.", "レッスンを辞退しました。"), "warning");
    } catch {
      showToast(t("Có lỗi xảy ra, vui lòng thử lại.", "エラーが発生しました。"), "error");
    } finally {
      setDecliningId(null);
    }
  };

  return (
    <div className="bg-background text-on-background font-body min-h-screen flex flex-col">
      <LearnerNavbar />

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 right-6 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-bold flex items-center gap-2 animate-[slideInRight_0.3s_ease-out] ${
          toast.type === "success" ? "bg-emerald-500 text-white" : toast.type === "warning" ? "bg-amber-500 text-white" : "bg-red-500 text-white"
        }`}>
          <span className="material-symbols-outlined text-lg">{toast.type === "success" ? "check_circle" : toast.type === "warning" ? "info" : "error"}</span>
          {toast.message}
        </div>
      )}

      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-[64px] left-0 right-0 z-50 bg-amber-500 text-white text-center py-2 text-sm font-bold flex items-center justify-center gap-2 animate-[slideInRight_0.3s_ease-out]">
          <span className="material-symbols-outlined text-base">wifi_off</span>
          {t("Mất kết nối mạng / ネットワーク接続なし", "ネットワーク接続なし / Mất kết nối mạng")}
        </div>
      )}

      {/* Full-height layout below navbar */}
      <main className={`flex-grow flex overflow-hidden ${!isOnline ? "mt-[104px]" : "mt-[64px]"}`}>
        {/* Left Column: Chat List (30%) */}
        <aside className="w-[30%] bg-surface-container-low flex-col border-r border-outline-variant/10 hidden md:flex">
          <div className="p-6">
            <h2 className="text-xl font-bold text-primary mb-6 font-headline">
              {t("Tin nhắn / メッセージ", "メッセージ / Tin nhắn")}
            </h2>
            <div className="space-y-2">
              {conversations.map((conv, idx) => (
                <button
                  key={conv.conversationId}
                  onClick={() => setActiveConvIdx(idx)}
                  className={`w-full text-left transition-all cursor-pointer ${
                    activeConvIdx === idx
                      ? "p-4 bg-surface-container-lowest rounded-xl shadow-sm border-l-4 border-primary"
                      : "p-4 hover:bg-surface-container-high rounded-xl"
                  }`}
                >
                  <div
                    className={`flex items-center space-x-4 ${
                      activeConvIdx !== idx ? "opacity-70" : ""
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold text-primary ${
                        activeConvIdx === idx
                          ? "bg-primary-container"
                          : "bg-surface-variant"
                      }`}
                    >
                      {conv.partnerName.charAt(0)}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start">
                        <p
                          className={`leading-tight truncate ${
                            activeConvIdx === idx
                              ? "font-bold text-primary"
                              : "font-semibold text-on-surface"
                          }`}
                        >
                          {conv.partnerName}
                        </p>
                        <span className="text-[10px] text-outline shrink-0 ml-2">
                          {formatConversationTime(conv.lastMessageTime, t)}
                        </span>
                      </div>
                      <p
                        className={`text-xs mt-1 truncate ${
                          activeConvIdx === idx
                            ? "text-secondary"
                            : "text-on-surface-variant"
                        } ${conv.unreadCount > 0 ? "font-bold text-primary" : ""}`}
                      >
                        {conv.lastMessage || t("Chưa có tin nhắn", "メッセージなし")}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Column: Conversation View (70%) */}
        <section className="w-full md:w-[70%] flex flex-col bg-surface overflow-hidden relative">
          {/* Conversation Header */}
          <div className="px-8 py-4 bg-surface flex justify-between items-center z-10">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center font-bold text-primary">
                  {activeConv?.partnerName?.charAt(0)}
                </div>
                {activeConv && (
                  <div 
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      isUserOnline(activeConv.partnerId) ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                )}
              </div>
              <div>
                <h3 className="font-bold text-primary font-headline flex items-center gap-2">
                  {activeConv?.partnerName}
                </h3>
                {activeConv && (
                  <p className="text-xs text-on-surface-variant flex items-center gap-1">
                    <span 
                      className={`inline-block w-2 h-2 rounded-full ${
                        isUserOnline(activeConv.partnerId) ? "bg-green-500" : "bg-gray-400"
                      }`} 
                    />
                    {isUserOnline(activeConv.partnerId) ? t("Đang hoạt động", "オンライン") : t("Ngoại tuyến", "オフライン")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-grow overflow-y-auto p-8 space-y-4 bg-[#f9f9f7] flex flex-col-reverse">
            <div ref={messagesEndRef} />
            {messages.map((msg) =>
              msg.senderId !== user?.userId ? (
                // ── Received message (left-aligned, white bg) ──
                <div
                  key={msg.messageId}
                  className="flex flex-col items-start max-w-[80%]"
                >
                  {isMeetLink(msg.content) ? (
                    <a href={msg.content.trim()} target="_blank" rel="noopener noreferrer" className="block min-w-[240px] max-w-[280px] bg-surface border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow no-underline text-on-surface">
                      <div className="bg-primary/10 px-4 py-2 border-b border-outline-variant/10 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">videocam</span>
                        <span className="text-xs font-bold text-primary">Google Meet</span>
                      </div>
                      <div className="p-4 flex flex-col items-center justify-center space-y-2">
                        <div className="text-sm font-semibold">{t("Join Classroom", "クラスに入る")}</div>
                        <div className="text-[10px] text-outline text-center break-all">{msg.content.trim()}</div>
                        <div className="mt-2 w-full py-1.5 bg-primary text-on-primary rounded text-xs font-bold flex items-center justify-center gap-1 hover:bg-primary/90 transition-colors">
                          {t("Tham gia", "参加する")}
                          <span className="material-symbols-outlined text-sm">open_in_new</span>
                        </div>
                      </div>
                    </a>
                  ) : (
                    <div className="bg-surface-container-high text-on-surface px-5 py-3 rounded-tr-xl rounded-br-xl rounded-bl-xl leading-relaxed border border-outline-variant/10">
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      {msg.contentTranslated && (
                        <p className="text-xs text-outline italic mt-1 whitespace-pre-wrap">
                          {msg.contentTranslated}
                        </p>
                      )}
                    </div>
                  )}
                  <span className="text-[10px] text-outline mt-1 ml-1">
                    {formatMessageTime(msg.sentAt, t)}
                  </span>
                </div>
              ) : (
                // ── Sent message (right-aligned, primary bg) ──
                <div
                  key={msg.messageId}
                  className={`flex flex-col items-end max-w-[80%] ml-auto transition-opacity ${
                    msg._sendStatus === "failed" ? "opacity-70" : ""
                  }`}
                >
                  {isMeetLink(msg.content) ? (
                    <a href={msg.content.trim()} target="_blank" rel="noopener noreferrer" className="block min-w-[240px] max-w-[280px] bg-primary text-on-primary rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow no-underline">
                      <div className="bg-white/20 px-4 py-2 border-b border-white/10 flex items-center gap-2">
                        <span className="material-symbols-outlined text-white text-lg">videocam</span>
                        <span className="text-xs font-bold text-white">Google Meet</span>
                      </div>
                      <div className="p-4 flex flex-col items-center justify-center space-y-2">
                        <div className="text-sm font-semibold">{t("Join Classroom", "クラスに入る")}</div>
                        <div className="text-[10px] text-white/70 text-center break-all">{msg.content.trim()}</div>
                        <div className="mt-2 w-full py-1.5 bg-white text-primary rounded text-xs font-bold flex items-center justify-center gap-1 hover:bg-white/90 transition-colors">
                          {t("Tham gia", "参加する")}
                          <span className="material-symbols-outlined text-sm">open_in_new</span>
                        </div>
                      </div>
                    </a>
                  ) : (
                    <div className="bg-primary text-on-primary px-5 py-3 rounded-tl-xl rounded-bl-xl rounded-br-xl leading-relaxed">
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      {msg.contentTranslated && (
                        <p className="text-xs text-white/70 italic mt-1 whitespace-pre-wrap">
                          {msg.contentTranslated}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex items-center mt-1 mr-1">
                    <span className="text-[10px] text-outline">
                      {formatMessageTime(msg.sentAt, t)}
                    </span>
                    {renderStatusIcon(msg)}
                  </div>
                </div>
              )
            )}

            {/* Lazy Load: sentinel + spinner (visual top in flex-col-reverse) */}
            {isLoadingMore && (
              <div className="flex justify-center py-4">
                <div className="flex items-center gap-2 text-outline text-xs">
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  {t("Đang tải thêm...", "読み込み中...")}
                </div>
              </div>
            )}
            {!hasMore && messages.length > 0 && (
              <div className="flex justify-center py-3">
                <span className="text-[11px] text-outline/60 bg-surface-container-high/50 px-4 py-1.5 rounded-full">
                  {t("Đã tải hết lịch sử / 全履歴を読み込みました", "全履歴を読み込みました / Đã tải hết lịch sử")}
                </span>
              </div>
            )}
            {hasMore && !isLoadingMore && <div ref={sentinelRef} className="h-1" />}

            {/* Dynamic Lesson Request Booking Cards */}
            {bookingCards.map(card => {
              const isPending = card.status === "pending";
              const isConfirmed = card.status === "confirmed";
              const statusBadge = isConfirmed
                ? { label: t("Đã xác nhận / 承認済み", "承認済み / Đã xác nhận"), color: "bg-emerald-100 text-emerald-700" }
                : { label: t("Pending / 保留中", "保留中 / Pending"), color: "bg-secondary-container text-on-secondary-container" };
              const isProcessing = acceptingId === card.bookingId || decliningId === card.bookingId;
              return (
                <div key={card.bookingId} className="max-w-[420px] w-full mx-auto">
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-primary-container/10 px-6 py-3 flex justify-between items-center border-b border-outline-variant/10">
                      <h4 className="text-sm font-bold text-primary tracking-tight font-headline">
                        {t("Lesson Request / レッスンリクエスト", "レッスンリクエスト / Lesson Request")}
                      </h4>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-start space-x-3">
                        <span className="material-symbols-outlined text-primary text-xl">calendar_today</span>
                        <div>
                          <p className="text-sm font-bold text-on-surface">{formatBookingDate(card.startTime)}</p>
                          <p className="text-xs text-secondary">Hà Nội, Việt Nam</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="material-symbols-outlined text-primary text-xl">schedule</span>
                        <div>
                          <p className="text-sm font-bold text-on-surface">{formatBookingTime(card.startTime)} - {formatBookingTime(card.endTime)}</p>
                          <p className="text-xs text-secondary">(Hanoi Time) · {card.durationMinutes}m</p>
                        </div>
                      </div>
                      {isPending && (
                        <div className="pt-4 grid grid-cols-2 gap-3">
                          <button
                            disabled={isProcessing}
                            onClick={() => handleAccept(card.bookingId)}
                            className="bg-primary text-on-primary py-2.5 px-4 rounded-lg text-xs font-bold transition-all hover:bg-primary-container active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                          >
                            {acceptingId === card.bookingId && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            {t("Accept / 承認", "承認 / Accept")}
                          </button>
                          <button
                            disabled={isProcessing}
                            onClick={() => setDeclineModalId(card.bookingId)}
                            className="bg-surface-container text-secondary py-2.5 px-4 rounded-lg text-xs font-bold border border-outline-variant/20 transition-all hover:bg-surface-variant active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {t("Decline / 辞退", "辞退 / Decline")}
                          </button>
                        </div>
                      )}
                      {isConfirmed && (
                        <div className="pt-3">
                          {card.meetingUrl ? (
                            <a href={card.meetingUrl} target="_blank" rel="noopener noreferrer" className="w-full py-2.5 bg-green-500 text-white rounded-lg text-xs font-bold transition-all hover:bg-green-600 flex items-center justify-center gap-1.5 no-underline">
                              <span className="material-symbols-outlined text-[16px]">videocam</span>
                              {t("Tham gia lớp học / クラスに参加", "クラスに参加 / Tham gia lớp học")}
                            </a>
                          ) : (
                            <div className="flex items-center gap-2 text-emerald-600">
                              <span className="material-symbols-outlined text-lg">check_circle</span>
                              <span className="text-xs font-bold">{t("Đã xác nhận - chờ link lớp học", "承認済み - 授業リンク待ち")}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Input Area — textarea for Shift+Enter newlines */}
          <div className="px-8 py-6 bg-surface border-t border-outline-variant/10">
            <div className="relative flex items-end">
              <textarea
                className="w-full bg-surface-container-low border-none rounded-2xl px-6 py-4 pr-14 text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline/60 resize-none min-h-[52px] max-h-[120px]"
                placeholder={t(
                  "Viết tin nhắn... / メッセージを入力...",
                  "メッセージを入力... / Viết tin nhắn..."
                )}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim()}
                className={`absolute right-3 bottom-2 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg cursor-pointer ${
                  inputText.trim()
                    ? "bg-primary text-on-primary hover:scale-105 active:scale-95 shadow-primary/20"
                    : "bg-outline/30 text-outline cursor-not-allowed"
                }`}
              >
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </div>
            <div className="flex space-x-6 mt-4 ml-4">
              <button className="flex items-center space-x-1 text-outline hover:text-primary transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-xl">
                  image
                </span>
                <span className="text-[10px] font-medium uppercase tracking-widest">
                  Photo
                </span>
              </button>
              <button className="flex items-center space-x-1 text-outline hover:text-primary transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-xl">mic</span>
                <span className="text-[10px] font-medium uppercase tracking-widest">
                  Voice
                </span>
              </button>
              <button className="flex items-center space-x-1 text-outline hover:text-primary transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-xl">
                  attachment
                </span>
                <span className="text-[10px] font-medium uppercase tracking-widest">
                  File
                </span>
              </button>
            </div>
          </div>

          {/* Decorative Lotus Motif */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 opacity-[0.03] pointer-events-none select-none rotate-12">
            <svg
              className="text-primary"
              fill="currentColor"
              viewBox="0 0 100 100"
            >
              <path d="M50 0 C60 30 90 40 100 50 C90 60 60 70 50 100 C40 70 10 60 0 50 C10 40 40 30 50 0" />
            </svg>
          </div>
        </section>
      </main>

      <LearnerBottomNav />

      {/* Decline Confirmation Modal */}
      {declineModalId && (() => {
        const card = bookingCards.find(b => b.bookingId === declineModalId);
        if (!card) return null;
        return (
          <div className="fixed inset-0 z-[200] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => !decliningId && setDeclineModalId(null)} />
            <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-amber-600">help_outline</span>
                </div>
                <h3 className="font-bold text-primary font-headline">
                  {t("Xác nhận từ chối / 辞退確認", "辞退確認 / Xác nhận từ chối")}
                </h3>
              </div>
              <p className="text-sm text-secondary mb-2">
                {t("Bạn có chắc muốn từ chối lịch hẹn này không?", "このレッスンを辞退しますか？")}
              </p>
              <div className="p-3 bg-surface-container rounded-xl mb-5 text-xs text-on-surface-variant space-y-1">
                <div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">calendar_today</span>{formatBookingDate(card.startTime)}</div>
                <div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">schedule</span>{formatBookingTime(card.startTime)} - {formatBookingTime(card.endTime)} ({card.durationMinutes}m)</div>
              </div>
              <div className="flex gap-3">
                <button disabled={!!decliningId} onClick={() => setDeclineModalId(null)} className="flex-1 py-2.5 text-sm font-bold text-secondary border border-outline-variant/30 rounded-xl hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-50">
                  {t("Hủy bỏ / キャンセル", "キャンセル / Hủy bỏ")}
                </button>
                <button disabled={!!decliningId} onClick={() => confirmDecline(card.bookingId)} className="flex-1 py-2.5 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                  {decliningId === card.bookingId && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {t("Xác nhận từ chối / 辞退する", "辞退する / Xác nhận từ chối")}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
