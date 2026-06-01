"use client";

import PartnerNavbar from "@/components/layout/PartnerNavbar";
import PartnerBottomNav from "@/components/layout/PartnerBottomNav";
import { useState, useCallback, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePresence } from "@/contexts/PresenceContext";
import { useAuth } from "@/lib/auth";
import { messageApi, bookingApi, type ConversationDto, type BookingDto } from "@/lib/api";
import { ensureConnected, getSignalRConnection } from "@/lib/signalr";
import {
  type LocalMessage,
  formatConversationTime,
  generateTempId,
  useOfflineQueue,
  useLazyLoadMessages,
  isMeetLinkStrict,
  normalizeLessonStatus,
} from "@/lib/chatUtils";
import ChatArea from "./components/ChatArea";
import SchedulePanel from "./components/SchedulePanel";
import MessagePreviewRow from "@/components/messages/MessagePreviewRow";

export default function PartnerMessagesPage() {
  const [activeConvIdx, setActiveConvIdx] = useState(0);
  const [showSchedulePanel, setShowSchedulePanel] = useState(false);
  // Booking form state
  const [bookingDate, setBookingDate] = useState("");
  const [bookingHour, setBookingHour] = useState("09:00");
  const [bookingMinute, setBookingMinute] = useState("00");
  const [bookingDuration, setBookingDuration] = useState("30");
  const [bookingTitle, setBookingTitle] = useState("");
  const [bookingMeetingLink, setBookingMeetingLink] = useState("");
  const [dateError, setDateError] = useState("");
  const [meetingLinkError, setMeetingLinkError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Toast state
  const [toast, setToast] = useState<{message:string; type:"success"|"error"|"warning"} | null>(null);
  // Booking cards from API
  const [bookingCards, setBookingCards] = useState<(BookingDto & { removing?: boolean })[]>([]);
  // Modal states
  const [cancelModalId, setCancelModalId] = useState<string|null>(null);
  const [detailModalId, setDetailModalId] = useState<string|null>(null);
  const [cancellingId, setCancellingId] = useState<string|null>(null);

  const toggleSchedulePanel = useCallback(() => {
    setShowSchedulePanel(prev => !prev);
    setDateError("");
  }, []);
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const { user } = useAuth();
  const { t } = useLanguage();
  const { isUserOnline } = usePresence();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Show toast helper (declared before useEffect that uses it)
  const showToast = (message: string, type: "success" | "error" | "warning") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const { isOnline, enqueue } = useOfflineQueue(setMessages, setConversations);

  // Lazy load hook
  const { sentinelRef, isLoadingMore, hasMore, resetPagination } =
    useLazyLoadMessages(conversations[activeConvIdx]?.conversationId, setMessages);

  // Fetch conversations on load
  useEffect(() => {
    messageApi.getConversations().then(data => {
      setConversations(data);
    }).catch(console.error);
  }, []);

  const activeConv = conversations[activeConvIdx];

  // Fetch messages and subscribe to Realtime when activeConv changes
  useEffect(() => {
    if (!activeConv) return;
    
    // Reset pagination for new conversation
    resetPagination();
    
    // Fetch initial messages (page 1)
    messageApi.getMessages(activeConv.conversationId, 1, 50).then(data => {
      setMessages((data as LocalMessage[]).map(m => m.lessonStatus ? { ...m, lessonStatus: normalizeLessonStatus(m.lessonStatus) } : m));
      if (activeConv.unreadCount > 0) {
        messageApi.markAsRead(activeConv.conversationId).catch(console.error);
        setConversations(prev => prev.map((c, i) => i === activeConvIdx ? { ...c, unreadCount: 0 } : c));
      }
    }).catch(console.error);

    // Fetch booking cards so cancel/detail modals work for existing bookings
    bookingApi.getBookingsForConversation(activeConv.conversationId)
      .then(data => setBookingCards(data))
      .catch(console.error);

    // Subscribe to SignalR conversation events
    let mounted = true;
    const setupSignalR = async () => {
      const conn = await ensureConnected();
      await conn.invoke("JoinConversation", activeConv.conversationId).catch(console.error);

      conn.on("ReceiveMessage", (newMsg: LocalMessage) => {
        if (!mounted) return;
        newMsg._sendStatus = "sent";
        setMessages(prev => {
          const withoutTemp = prev.filter(
            m => !(m._tempId && m.content === newMsg.content && m.senderId === newMsg.senderId)
          );
          if (withoutTemp.find(m => m.messageId === newMsg.messageId)) return withoutTemp;
          return [newMsg, ...withoutTemp];
        });
        
        setConversations(prev => {
          const copy = [...prev];
          const idx = copy.findIndex(c => c.conversationId === newMsg.conversationId);
          if (idx >= 0) {
            copy[idx].lastMessage = newMsg.content || t("Tin nhắn mới", "新着メッセージ");
            copy[idx].lastMessageTime = newMsg.timestamp || newMsg.timestamp;
          }
          return copy;
        });
      });

      conn.on("LessonRequestCreated", (newMsg: LocalMessage) => {
        if (!mounted) return;
        setMessages(prev => {
          if (prev.find(m => m.messageId === newMsg.messageId)) return prev;
          return [newMsg, ...prev];
        });
        showToast(t("Có yêu cầu buổi học mới!", "新しいレッスンリクエストがあります！"), "success");
      });

      conn.on("LessonAccepted", (data: { lesson_request_id: string; new_status: string }) => {
        if (!mounted) return;
        const status = normalizeLessonStatus(data.new_status);
        setMessages(prev => prev.map(m => m.lessonRequestId === data.lesson_request_id ? { ...m, lessonStatus: status } : m));
        showToast(t("Học viên đã xác nhận lịch hẹn!", "学習者がレッスンを承認しました！"), "success");
      });

      conn.on("LessonDeclined", (data: { lesson_request_id: string; new_status: string }) => {
        if (!mounted) return;
        const status = normalizeLessonStatus(data.new_status);
        setMessages(prev => prev.map(m => m.lessonRequestId === data.lesson_request_id ? { ...m, lessonStatus: status } : m));
        showToast(t("Học viên đã từ chối lịch hẹn.", "学習者がレッスンを辞退しました。"), "warning");
      });

      conn.on("LessonCancelled", (data: { lesson_request_id: string; new_status: string }) => {
        if (!mounted) return;
        const status = normalizeLessonStatus(data.new_status);
        setMessages(prev => prev.map(m => m.lessonRequestId === data.lesson_request_id ? { ...m, lessonStatus: status } : m));
        showToast(t("Lịch hẹn đã bị hủy.", "レッスンがキャンセルされました。"), "warning");
      });
    };
    setupSignalR().catch(console.error);

    return () => {
      mounted = false;
      const conn = getSignalRConnection();
      conn.off("ReceiveMessage");
      conn.off("LessonRequestCreated");
      conn.off("LessonAccepted");
      conn.off("LessonDeclined");
      conn.off("LessonCancelled");
      conn.invoke("LeaveConversation", activeConv.conversationId).catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConv, activeConvIdx]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Optimistic send with offline queue
  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !activeConv) return;
    const txt = inputText.trim();
    setInputText("");
    // Reset textarea height after send
    if (textareaRef.current) textareaRef.current.style.height = '52px';

    // Optimistic: show bubble immediately
    const tempId = generateTempId();
    const optimisticMsg: LocalMessage = {
      messageId: tempId,
      conversationId: activeConv.conversationId,
      senderId: user?.userId || "",
      content: txt,
      contentTranslated: null,
      isRead: false,
      timestamp: new Date().toISOString(),
      type: "TEXT",
      _sendStatus: isOnline ? "sending" : "queued",
      _tempId: tempId,
    };
    setMessages(prev => [optimisticMsg, ...prev]);

    // If offline → enqueue for later
    if (!isOnline) {
      enqueue(tempId, activeConv.conversationId, txt);
      return;
    }

    try {
      const newMsg = await messageApi.sendMessage(activeConv.conversationId, txt);
      // Replace optimistic with server response
      setMessages(prev =>
        prev.map(m =>
          m._tempId === tempId ? { ...newMsg, _sendStatus: "sent" as const } : m
        )
      );
      // Update conversation list
      setConversations(prev => {
        const copy = [...prev];
        const idx = copy.findIndex(c => c.conversationId === activeConv.conversationId);
        if (idx >= 0) {
          copy[idx].lastMessage = txt;
          copy[idx].lastMessageTime = newMsg.timestamp;
        }
        return copy;
      });
    } catch {
      // Network might have dropped mid-request
      if (!navigator.onLine) {
        enqueue(tempId, activeConv.conversationId, txt);
      } else {
        setMessages(prev =>
          prev.map(m =>
            m._tempId === tempId ? { ...m, _sendStatus: "failed" } : m
          )
        );
      }
    }
  }, [inputText, activeConv, user, isOnline, enqueue]);

  // Retry failed message
  const handleRetry = useCallback(async (tempId: string) => {
    const failedMsg = messages.find(m => m._tempId === tempId);
    if (!failedMsg || !activeConv) return;
    setMessages(prev => prev.map(m => m._tempId === tempId ? { ...m, _sendStatus: "sending" } : m));
    try {
      const newMsg = await messageApi.sendMessage(activeConv.conversationId, failedMsg.content);
      setMessages(prev => prev.map(m => m._tempId === tempId ? { ...newMsg, _sendStatus: "sent" as const } : m));
    } catch {
      setMessages(prev => prev.map(m => m._tempId === tempId ? { ...m, _sendStatus: "failed" } : m));
    }
  }, [messages, activeConv]);

  // Keyboard: Enter = send, Shift+Enter = newline
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Show toast is declared above (before useEffect)


  // Compute end time from start + duration
  const calcEndTime = (hour: string, minute: string, dur: string) => {
    const totalMin = parseInt(hour.split(":")[0]) * 60 + parseInt(minute) + parseInt(dur);
    const h = Math.floor(totalMin / 60) % 24;
    const m = totalMin % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  // Format date for display
  const formatDateDisplay = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const daysJa = ["日", "月", "火", "水", "木", "金", "土"];
    return t(
      `${days[d.getDay()]}, ${d.toLocaleDateString("vi-VN")}`,
      `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日(${daysJa[d.getDay()]})`
    );
  };

  // Format a UTC ISO string to Hanoi Time date display
  const formatBookingDate = (utcIso: string) => {
    const d = new Date(utcIso);
    // Convert to Hanoi Time (UTC+7)
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

  // Format a UTC ISO string to Hanoi Time HH:MM
  const formatBookingTime = (utcIso: string) => {
    const d = new Date(utcIso);
    const hanoi = new Date(d.getTime() + 7 * 60 * 60 * 1000);
    return `${String(hanoi.getUTCHours()).padStart(2, "0")}:${String(hanoi.getUTCMinutes()).padStart(2, "0")}`;
  };

  // Handle booking submit via real API
  const handleBookingSubmit = async () => {
    setDateError("");
    setMeetingLinkError("");
    let hasError = false;
    if (!bookingDate) {
      setDateError(t("Vui lòng chọn ngày học", "日付を選択してください"));
      hasError = true;
    } else {
      const today = new Date(); today.setHours(0,0,0,0);
      const selectedDate = new Date(bookingDate + "T00:00:00");
      if (selectedDate < today) {
        setDateError(t("Ngày không được là ngày trong quá khứ", "過去の日付は選択できません"));
        hasError = true;
      } else if (selectedDate.getTime() === today.getTime()) {
        // §9.2: Validate past hours when date is today
        const now = new Date();
        const selectedHour = parseInt(bookingHour.split(":")[0]);
        const selectedMinute = parseInt(bookingMinute);
        const selectedTotalMin = selectedHour * 60 + selectedMinute;
        const currentTotalMin = now.getHours() * 60 + now.getMinutes();
        if (selectedTotalMin <= currentTotalMin) {
          setDateError(t("Giờ bắt đầu phải sau giờ hiện tại", "開始時間は現在時刻より後にしてください"));
          hasError = true;
        }
      }
    }
    if (!bookingMeetingLink.trim()) {
      setMeetingLinkError(t("Vui lòng nhập link meeting", "ミーティングリンクを入力してください"));
      hasError = true;
    } else if (!isMeetLinkStrict(bookingMeetingLink)) {
      // §9.3: Validate Google Meet URL pattern
      setMeetingLinkError(t(
        "Link phải đúng định dạng Google Meet (VD: https://meet.google.com/abc-defg-hij)",
        "Google Meetの正しいURL形式を入力してください（例：https://meet.google.com/abc-defg-hij）"
      ));
      showToast(t("Link Google Meet không hợp lệ", "Google MeetのURLが無効です"), "error");
      hasError = true;
    }
    if (hasError) return;
    if (!activeConv) return;
    setIsSubmitting(true);
    try {
      const startTimeStr = `${bookingHour.split(":")[0]}:${bookingMinute}`;
      const result = await bookingApi.createLessonRequest({
        learnerId: activeConv.learnerId,
        date: bookingDate,
        startTime: startTimeStr,
        durationMinutes: parseInt(bookingDuration),
        notes: bookingTitle || undefined,
        meetingUrl: bookingMeetingLink || undefined,
      });
      setBookingCards(prev => [result, ...prev]);
      // Reset form
      setBookingDate(""); setBookingHour("09:00"); setBookingMinute("00"); setBookingDuration("30"); setBookingTitle(""); setBookingMeetingLink(""); setMeetingLinkError("");
      setShowSchedulePanel(false);
      showToast(t("Đã gửi yêu cầu đặt lịch!", "リクエストを送信しました！"), "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("conflict") || msg.includes("Conflict")) {
        showToast(t("Trùng lịch với buổi học khác!", "他のレッスンとスケジュールが重複しています！"), "warning");
      } else {
        showToast(t("Có lỗi xảy ra, vui lòng thử lại.", "エラーが発生しました。もう一度お試しください。"), "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel booking via real API
  const confirmCancel = async (bookingId: string) => {
    setCancellingId(bookingId);
    try {
      await bookingApi.cancelLessonRequest(bookingId);
      // Fade-out animation then remove
      setBookingCards(prev => prev.map(c => c.bookingId === bookingId ? {...c, removing: true} : c));
      setTimeout(() => {
        setBookingCards(prev => prev.filter(c => c.bookingId !== bookingId));
      }, 300);
      setCancelModalId(null);
      showToast(t("Đã hủy buổi học", "キャンセルしました"), "warning");
    } catch {
      showToast(t("Hủy thất bại, vui lòng thử lại.", "キャンセルに失敗しました。もう一度お試しください。"), "error");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="bg-background text-on-background font-body h-screen flex flex-col overflow-hidden">
      <PartnerNavbar />

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
        <div className="bg-amber-500 text-white text-center py-2 text-sm font-bold flex items-center justify-center gap-2 shrink-0">
          <span className="material-symbols-outlined text-base">wifi_off</span>
          {t("Mất kết nối mạng", "ネットワーク接続なし")}
        </div>
      )}

      <main className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Column: Conversations List */}
        <aside className="hidden md:flex flex-col h-full w-80 bg-[#f4f4f2] p-4 border-r border-outline-variant/10 text-sm">
          <div className="mb-6 px-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container overflow-hidden">
                <span className="material-symbols-outlined text-lg">
                  person
                </span>
              </div>
              <div>
                <h2 className="font-bold text-primary text-base leading-tight font-headline">
                  {t("Tin nhắn", "メッセージ")}
                </h2>
                <p className="text-secondary text-xs">Hanoi x Tokyo</p>
              </div>
            </div>
          </div>

          <div className="space-y-1 flex-1 overflow-y-auto">
            {conversations.map((conv, idx) => {
              return (
                <button
                  key={conv.conversationId}
                  onClick={() => setActiveConvIdx(idx)}
                  className={`w-full text-left transition-all cursor-pointer ${
                    activeConvIdx === idx
                      ? "p-3 bg-surface-container-lowest rounded-xl engawa-shadow"
                      : "p-3 hover:bg-surface-variant/30 rounded-xl"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center text-primary font-bold">
                        {(() => {
                          const avatarSrc = conv.partnerAvatarUrl
                            || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(conv.learnerName)}&backgroundColor=c0aede`;
                          return (
                            <img
                              alt={conv.learnerName}
                              className="w-full h-full object-cover"
                              src={avatarSrc}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          );
                        })()}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full ${
                        isUserOnline(conv.learnerId) ? "bg-emerald-500" : "bg-gray-400"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <span
                          className={`truncate ${
                            activeConvIdx === idx
                              ? "font-bold text-primary"
                              : "font-semibold text-secondary"
                          }`}
                        >
                          {conv.learnerName}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {conv.unreadCount > 0 && (
                          <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center">
                            {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                          </span>
                        )}
                        <span
                          className={`text-[10px] shrink-0 ${
                            activeConvIdx === idx ? "text-secondary" : "text-outline"
                          }`}
                        >
                          {formatConversationTime(conv.lastMessageTime, t)}
                        </span>
                        </div>
                      </div>
                      <MessagePreviewRow
                        lastMessage={conv.lastMessage}
                        lastMessageType={conv.lastMessageType}
                        unreadCount={conv.unreadCount}
                        active={activeConvIdx === idx}
                        t={t}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Center Column: Chat Canvas */}
        <ChatArea
          messages={messages}
          user={user}
          activeConv={activeConv}
          t={t}
          isUserOnline={isUserOnline}
          cancellingId={cancellingId}
          setCancelModalId={setCancelModalId}
          setDetailModalId={setDetailModalId}
          formatDateDisplay={formatDateDisplay}
          handleRetry={handleRetry}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          sentinelRef={sentinelRef}
          messagesEndRef={messagesEndRef}
          toggleSchedulePanel={toggleSchedulePanel}
          showSchedulePanel={showSchedulePanel}
          inputText={inputText}
          setInputText={setInputText}
          handleKeyDown={handleKeyDown}
          handleSend={handleSend}
          textareaRef={textareaRef}
        />

        {/* Right Column: Scheduling Panel & Modals */}
        <SchedulePanel
          showSchedulePanel={showSchedulePanel}
          setShowSchedulePanel={setShowSchedulePanel}
          t={t}
          bookingDate={bookingDate}
          setBookingDate={setBookingDate}
          dateError={dateError}
          setDateError={setDateError}
          bookingHour={bookingHour}
          setBookingHour={setBookingHour}
          bookingMinute={bookingMinute}
          setBookingMinute={setBookingMinute}
          bookingDuration={bookingDuration}
          setBookingDuration={setBookingDuration}
          bookingTitle={bookingTitle}
          setBookingTitle={setBookingTitle}
          bookingMeetingLink={bookingMeetingLink}
          meetingLinkError={meetingLinkError}
          setMeetingLinkError={setMeetingLinkError}
          setBookingMeetingLink={setBookingMeetingLink}
          isSubmitting={isSubmitting}
          handleBookingSubmit={handleBookingSubmit}
          bookingCards={bookingCards}
          formatDateDisplay={formatDateDisplay}
          formatBookingDate={formatBookingDate}
          formatBookingTime={formatBookingTime}
          calcEndTime={calcEndTime}
          cancelModalId={cancelModalId}
          setCancelModalId={setCancelModalId}
          detailModalId={detailModalId}
          setDetailModalId={setDetailModalId}
          cancellingId={cancellingId}
          confirmCancel={confirmCancel}
        />
      </main>

      {/* Mobile Bottom Nav */}
      <PartnerBottomNav />
    </div>
  );
}
