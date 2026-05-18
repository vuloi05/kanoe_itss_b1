"use client";
import Image from "next/image";
import PartnerNavbar from "@/components/layout/PartnerNavbar";
import PartnerBottomNav from "@/components/layout/PartnerBottomNav";
import { useState, useCallback, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePresence } from "@/contexts/PresenceContext";
import { useAuth } from "@/lib/auth";
import { messageApi, bookingApi, type ConversationDto, type MessageDto, type BookingDto } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import {
  type LocalMessage,
  formatMessageTime,
  formatConversationTime,
  generateTempId,
  useOfflineQueue,
  useLazyLoadMessages,
  isMeetLink,
} from "@/lib/chatUtils";

export default function PartnerMessagesPage() {
  const [activeConvIdx, setActiveConvIdx] = useState(0);
  const [showSchedulePanel, setShowSchedulePanel] = useState(false);
  // Booking form state
  const [bookingDate, setBookingDate] = useState("");
  const [bookingHour, setBookingHour] = useState("09:00");
  const [bookingMinute, setBookingMinute] = useState("00");
  const [bookingDuration, setBookingDuration] = useState("30");
  const [dateError, setDateError] = useState("");
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

  // Offline queue hook
  const { isOnline, enqueue } = useOfflineQueue(setMessages, setConversations as any);

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
      setMessages(data as LocalMessage[]);
      if (activeConv.unreadCount > 0) {
        messageApi.markAsRead(activeConv.conversationId).catch(console.error);
        setConversations(prev => prev.map((c, i) => i === activeConvIdx ? { ...c, unreadCount: 0 } : c));
      }
    }).catch(console.error);

    // Subscribe to Supabase Realtime
    // Load bookings for this conversation
    bookingApi.getBookingsForConversation(activeConv.conversationId)
      .then(data => setBookingCards(data))
      .catch(console.error);

    const channel = supabase.channel(`conversation-${activeConv.conversationId}`);
    channel.on("broadcast", { event: "new_message" }, (payload: any) => {
      const newMsg = payload.payload.message as LocalMessage;
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
    })
    // Listen for lesson lifecycle events
    .on("broadcast", { event: "lesson_accepted" }, (payload: any) => {
      const booking = payload.payload.booking as BookingDto;
      setBookingCards(prev => prev.map(c => c.bookingId === booking.bookingId ? { ...c, status: booking.status } : c));
      showToast(t("Học viên đã xác nhận lịch hẹn!", "学習者がレッスンを承認しました！"), "success");
    })
    .on("broadcast", { event: "lesson_declined" }, (payload: any) => {
      const booking = payload.payload.booking as BookingDto;
      setBookingCards(prev => prev.map(c => c.bookingId === booking.bookingId ? { ...c, removing: true } : c));
      setTimeout(() => setBookingCards(prev => prev.filter(c => c.bookingId !== booking.bookingId)), 300);
      showToast(t("Học viên đã từ chối lịch hẹn.", "学習者がレッスンを辞退しました。"), "warning");
    })
    .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConv, activeConvIdx]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Optimistic send with offline queue
  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !activeConv) return;
    const txt = inputText.trim();
    setInputText("");

    // Optimistic: show bubble immediately
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
          copy[idx].lastMessageTime = newMsg.sentAt;
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

  // Show toast helper
  const showToast = (message: string, type: "success" | "error" | "warning") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

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
    if (!bookingDate) {
      setDateError(t("Vui lòng chọn ngày học", "日付を選択してください"));
      return;
    }
    const today = new Date(); today.setHours(0,0,0,0);
    if (new Date(bookingDate + "T00:00:00") < today) {
      setDateError(t("Ngày không được là ngày trong quá khứ", "過去の日付は選択できません"));
      return;
    }
    if (!activeConv) return;
    setIsSubmitting(true);
    try {
      const startTimeStr = `${bookingHour.split(":")[0]}:${bookingMinute}`;
      const result = await bookingApi.createLessonRequest({
        learnerId: activeConv.learnerId,
        date: bookingDate,
        startTime: startTimeStr,
        durationMinutes: parseInt(bookingDuration),
      });
      setBookingCards(prev => [result, ...prev]);
      // Reset form
      setBookingDate(""); setBookingHour("09:00"); setBookingMinute("00"); setBookingDuration("30");
      setShowSchedulePanel(false);
      showToast(t("Đã gửi yêu cầu đặt lịch!", "リクエストを送信しました！"), "success");
    } catch (err: any) {
      const msg = err?.message || "";
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
        <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-500 text-white text-center py-2 text-sm font-bold flex items-center justify-center gap-2 animate-[slideInRight_0.3s_ease-out]">
          <span className="material-symbols-outlined text-base">wifi_off</span>
          {t("Mất kết nối mạng / ネットワーク接続なし", "ネットワーク接続なし / Mất kết nối mạng")}
        </div>
      )}

      <main className="flex-grow flex overflow-hidden">
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
                  {t("Tin nhắn / メッセージ", "メッセージ / Tin nhắn")}
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
                      <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold">
                        {conv.learnerName.charAt(0)}
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
                        <span
                          className={`text-[10px] shrink-0 ml-2 ${
                            activeConvIdx === idx ? "text-secondary" : "text-outline"
                          }`}
                        >
                          {formatConversationTime(conv.lastMessageTime, t)}
                        </span>
                      </div>
                      <p
                        className={`text-xs truncate ${
                          activeConvIdx === idx
                            ? "text-on-surface-variant"
                            : "text-outline"
                        } ${conv.unreadCount > 0 ? "font-bold text-primary" : ""}`}
                      >
                        {conv.lastMessage || t("Chưa có tin nhắn", "メッセージなし")}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Center Column: Chat Canvas */}
        <section className="flex-1 flex flex-col bg-white relative overflow-hidden">
          {/* Chat Header */}
          <div className="px-8 py-4 bg-surface-container-low/50 flex items-center justify-between border-b border-outline-variant/10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold">
                  {activeConv?.learnerName?.charAt(0)}
                </div>
                <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
                  activeConv && isUserOnline(activeConv.learnerId) ? "bg-emerald-500" : "bg-gray-400"
                }`} />
              </div>
              <div>
                <h3 className="font-bold text-primary font-headline flex items-center gap-2">
                  {activeConv?.learnerName}
                  {activeConv && (
                    <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      isUserOnline(activeConv.learnerId)
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {isUserOnline(activeConv.learnerId) ? "Online" : "Offline"}
                    </span>
                  )}
                </h3>
                <p className="text-[10px] text-secondary tracking-wider uppercase font-bold">
                  {t(
                    "Học viên tích cực / アクティブラーナー • Level N3",
                    "アクティブラーナー / Học viên tích cực • Level N3"
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-secondary">
              <span className="material-symbols-outlined cursor-pointer hover:text-primary">
                more_vert
              </span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 flex flex-col-reverse">
            <div ref={messagesEndRef} />
            {messages.map((msg) =>
              msg.senderId !== user?.userId ? (
                // ── Received message (left-aligned) ──
                <div key={msg.messageId} className="flex gap-4 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 mt-1">
                    <span className="material-symbols-outlined text-sm text-primary">
                      person
                    </span>
                  </div>
                  <div className="space-y-1">
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
                      <div className="bg-surface-container-low p-4 rounded-2xl rounded-tl-none border border-outline-variant/10">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                        {msg.contentTranslated && (
                          <p className="text-xs text-outline italic mt-1.5 whitespace-pre-wrap">
                            {msg.contentTranslated}
                          </p>
                        )}
                      </div>
                    )}
                    <span className="text-[10px] text-outline px-1 block">
                      {formatMessageTime(msg.sentAt, t)}
                    </span>
                  </div>
                </div>
              ) : (
                // ── Sent message (right-aligned) ──
                <div
                  key={msg.messageId}
                  className={`flex flex-col items-end gap-1 self-end max-w-[80%] transition-opacity ${
                    msg._sendStatus === "failed" ? "opacity-70" : ""
                  }`}
                >
                  {isMeetLink(msg.content) ? (
                    <a href={msg.content.trim()} target="_blank" rel="noopener noreferrer" className="block min-w-[240px] max-w-[280px] lotus-gradient engawa-shadow rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow no-underline text-white">
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
                    <div className="lotus-gradient p-4 rounded-2xl rounded-tr-none text-white engawa-shadow">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      {msg.contentTranslated && (
                        <p className="text-xs text-white/70 italic mt-1.5 whitespace-pre-wrap">
                          {msg.contentTranslated}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex items-center px-1">
                    <span className="text-[10px] text-outline">
                      {formatMessageTime(msg.sentAt, t)}
                    </span>
                    {msg.senderId === user?.userId && (
                      msg._sendStatus === "queued" ? (
                        <span className="material-symbols-outlined text-[12px] text-amber-400 ml-1" title={t("Đang chờ gửi", "送信待ち")}>hourglass_empty</span>
                      ) : msg._sendStatus === "sending" ? (
                        <span className="material-symbols-outlined text-[12px] text-outline ml-1">schedule</span>
                      ) : msg._sendStatus === "failed" ? (
                        <button
                          onClick={() => msg._tempId && handleRetry(msg._tempId)}
                          className="ml-1 flex items-center gap-0.5 text-[10px] text-error hover:text-red-700 cursor-pointer transition-colors"
                        >
                          <span className="material-symbols-outlined text-[12px]">error</span>
                          <span className="underline">{t("Thử lại", "リトライ")}</span>
                        </button>
                      ) : (
                        <span className="material-symbols-outlined text-[12px] text-outline ml-1">done</span>
                      )
                    )}
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

            {/* Empty state */}
            {bookingCards.length === 0 && (
              <div className="self-center text-center py-4">
                <span className="material-symbols-outlined text-3xl text-outline-variant mb-1">event_busy</span>
                <p className="text-xs text-outline-variant">{t("Chưa có đề xuất buổi học nào.", "レッスンの提案はまだありません。")}</p>
              </div>
            )}

            {/* Dynamic Booking Cards */}
            {bookingCards.map(card => {
              const statusBadge = card.status === "confirmed"
                ? { label: t("Đã xác nhận", "確認済み"), color: "bg-emerald-100 text-emerald-700" }
                : card.status === "pending"
                ? { label: t("Chờ xác nhận", "確認待ち"), color: "bg-amber-100 text-amber-700" }
                : null;
              return (
              <div key={card.bookingId} className={`self-center w-full max-w-md transition-all duration-300 ${card.removing ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
                <div className="bg-surface-container border border-outline-variant/30 rounded-2xl overflow-hidden engawa-shadow">
                  <div className="p-1 bg-secondary text-white text-[10px] text-center font-bold tracking-widest uppercase">
                    {t("Đề xuất buổi học mới", "新しいレッスンの提案")}
                  </div>
                  <div className="p-6 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0">
                      <span className="material-symbols-outlined">auto_stories</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-primary text-base font-headline">
                          {card.status === "confirmed" ? t("Đã xác nhận", "確認済み") : t("Yêu cầu đã gửi", "リクエスト送信済み")}
                        </h4>
                        {statusBadge && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge.color}`}>{statusBadge.label}</span>}
                      </div>
                      <p className="text-xs text-secondary mb-3">
                        {card.status === "confirmed" ? t("Học viên đã xác nhận", "学習者が承認しました") : t("Chờ học viên xác nhận", "学習者の承認待ち")}
                      </p>
                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm">calendar_today</span>
                          <span>{formatBookingDate(card.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          <span>{formatBookingTime(card.startTime)} - {formatBookingTime(card.endTime)} ({card.durationMinutes}m) (GMT+7)</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {card.status === "pending" && (
                          <button disabled={cancellingId === card.bookingId} onClick={() => setCancelModalId(card.bookingId)} className="flex-1 py-2 text-xs font-bold text-error border border-error/20 rounded-lg hover:bg-error/5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                            {cancellingId === card.bookingId ? t("Đang hủy...", "処理中...") : t("Hủy", "キャンセル")}
                          </button>
                        )}
                        {card.status === "confirmed" && card.meetingUrl && (
                          <a href={card.meetingUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 text-xs font-bold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors cursor-pointer flex items-center justify-center gap-1.5 no-underline">
                            <span className="material-symbols-outlined text-[14px]">videocam</span>
                            {t("Vào lớp", "入室")}
                          </a>
                        )}
                        <button disabled={cancellingId === card.bookingId} onClick={() => setDetailModalId(card.bookingId)} className="flex-1 py-2 text-xs font-bold text-primary bg-surface-container-highest rounded-lg hover:bg-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                          {t("Chi tiết", "詳細")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>

          {/* Chat Input Area */}
          <div className="p-4 px-6 bg-[#f4f4f2] border-t border-outline-variant/10">
            <div className="w-full bg-white rounded-2xl flex items-end px-5 py-2 engawa-shadow border border-outline-variant/10">
              <button className="p-2 text-secondary hover:text-primary transition-colors cursor-pointer mb-0.5">
                <span className="material-symbols-outlined">add_circle</span>
              </button>
              <textarea
                className="flex-1 border-none focus:ring-0 bg-transparent text-sm placeholder-outline px-4 py-2 resize-none min-h-[40px] max-h-[100px]"
                placeholder={t(
                  "Nhập tin nhắn... / メッセージを入力...",
                  "メッセージを入力... / Nhập tin nhắn..."
                )}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <div className="flex items-center gap-2 border-l border-outline-variant/20 pl-4 ml-2">
                <button
                  onClick={toggleSchedulePanel}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all group cursor-pointer ${
                    showSchedulePanel
                      ? "bg-secondary text-white"
                      : "bg-secondary/10 text-secondary hover:bg-secondary hover:text-white"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    calendar_month
                  </span>
                  <span>
                    {t("Đặt buổi học / 予約", "予約 / Đặt buổi học")}
                  </span>
                </button>
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className={`p-2 rounded-full transition-all cursor-pointer ${
                    inputText.trim()
                      ? "lotus-gradient text-white hover:scale-105"
                      : "bg-outline/30 text-outline cursor-not-allowed"
                  }`}
                >
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>
          </div>

          {/* Decorative Lotus */}
          <div className="absolute bottom-32 -right-16 opacity-5 pointer-events-none select-none">
            <svg
              fill="none"
              height="400"
              viewBox="0 0 200 200"
              width="400"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 20C100 20 80 70 30 70C80 70 100 120 100 120C100 120 120 70 170 70C120 70 100 20 100 20Z"
                fill="#09294f"
              />
              <path
                d="M100 180C100 180 85 140 50 140C85 140 100 100 100 100C100 100 115 140 150 140C115 140 100 180 100 180Z"
                fill="#715a3e"
              />
            </svg>
          </div>
        </section>

        {/* Scheduling Panel Overlay Backdrop */}
        {showSchedulePanel && (
          <div
            className="fixed inset-0 bg-black/20 z-40 transition-opacity"
            onClick={() => setShowSchedulePanel(false)}
          />
        )}

        {/* Right Column: Scheduling Panel (Slide-in/out) */}
        <aside
          className={`fixed top-0 right-0 h-full w-80 bg-[#f9f9f7] p-6 overflow-y-auto border-l border-outline-variant/10 z-50 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl ${
            showSchedulePanel ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Close button */}
          <button
            onClick={() => setShowSchedulePanel(false)}
            className="absolute top-4 right-4 p-1 text-secondary hover:text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          <h4 className="font-bold text-primary mb-2 flex items-center gap-2 font-headline">
            <span className="material-symbols-outlined text-xl">
              event_available
            </span>
            {t(
              "Đặt thời gian học / 授業時間をセットする",
              "授業時間をセットする / Đặt thời gian học"
            )}
          </h4>
          <p className="text-[10px] text-secondary mb-6 font-medium leading-tight">
            {t(
              "Chọn thời gian rảnh của bạn để học cùng Sakura-san.",
              "空き時間を選択してサクラさんと学習しましょう。"
            )}
            <br />
            {t(
              "空き時間を選択してサクラさんと学習しましょう。",
              "Chọn thời gian rảnh của bạn để học cùng Sakura-san."
            )}
          </p>

          <div className="space-y-6">
            <div className="space-y-4">
              {/* Date Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-outline-variant uppercase tracking-wider">
                  {t("Ngày học / 日付", "日付 / Ngày học")}
                </label>
                <input
                  className={`w-full bg-[#f0f0ee] rounded-xl px-4 py-3 text-sm focus:ring-primary focus:border-primary ${dateError ? "border-2 border-red-400" : "border-transparent"}`}
                  type="date"
                  value={bookingDate}
                  onChange={(e) => { setBookingDate(e.target.value); setDateError(""); }}
                />
                {dateError && <p className="text-red-500 text-[11px] font-medium mt-1">{dateError}</p>}
              </div>

              {/* Start Time */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-outline-variant uppercase tracking-wider">
                  {t("Bắt đầu / 開始時間", "開始時間 / Bắt đầu")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select className="bg-[#f0f0ee] border-transparent rounded-xl px-3 py-3 text-sm focus:ring-primary" value={bookingHour} onChange={e => setBookingHour(e.target.value)}>
                    {Array.from({length:15},(_,i)=>i+7).map(h => <option key={h} value={`${String(h).padStart(2,"0")}:00`}>{String(h).padStart(2,"0")}:00</option>)}
                  </select>
                  <select className="bg-[#f0f0ee] border-transparent rounded-xl px-3 py-3 text-sm focus:ring-primary" value={bookingMinute} onChange={e => setBookingMinute(e.target.value)}>
                    <option value="00">00</option>
                    <option value="15">15</option>
                    <option value="30">30</option>
                    <option value="45">45</option>
                  </select>
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-outline-variant uppercase tracking-wider">
                  {t("Thời lượng / 期間", "期間 / Thời lượng")}
                </label>
                <select className="w-full bg-[#f0f0ee] border-transparent rounded-xl px-4 py-3 text-sm focus:ring-primary" value={bookingDuration} onChange={e => setBookingDuration(e.target.value)}>
                  <option value="30">{t("30 phút / 30分", "30分 / 30 phút")}</option>
                  <option value="45">{t("45 phút / 45分", "45分 / 45 phút")}</option>
                  <option value="60">{t("60 phút / 60分", "60分 / 60 phút")}</option>
                  <option value="75">{t("75 phút / 75分", "75分 / 75 phút")}</option>
                  <option value="90">{t("90 phút / 90分", "90分 / 90 phút")}</option>
                  <option value="105">{t("105 phút / 105分", "105分 / 105 phút")}</option>
                  <option value="120">{t("120 phút / 120分", "120分 / 120 phút")}</option>
                </select>
              </div>

              {/* Summary */}
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <p className="text-[10px] text-primary font-bold mb-1">
                  {t("TỔNG KẾT / まとめ", "まとめ / TỔNG KẾT")}
                </p>
                <p className="text-xs text-secondary leading-relaxed">
                  {bookingDate ? formatDateDisplay(bookingDate) : t("Chưa chọn ngày", "日付未選択")}
                  <br />
                  {`${bookingHour.split(":")[0]}:${bookingMinute}`} - {calcEndTime(bookingHour, bookingMinute, bookingDuration)} ({bookingDuration}m)
                </p>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleBookingSubmit}
                disabled={isSubmitting}
                className={`w-full py-3 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all text-sm cursor-pointer ${
                  isSubmitting ? "bg-gray-400 cursor-not-allowed" : "lotus-gradient hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {isSubmitting ? t("Đang gửi...", "送信中...") : t("Xác nhận / セットする", "セットする / Xác nhận")}
              </button>
            </div>

            {/* History Section */}
            <div className="pt-6 border-t border-outline-variant/20">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-outline-variant uppercase">
                  {t("Lịch sử / 最近の履歴", "最近の履歴 / Lịch sử")}
                </span>
                <span className="material-symbols-outlined text-sm text-outline-variant">
                  history
                </span>
              </div>
              <div className="space-y-3">
                {bookingCards.filter(c => c.status === "confirmed").map(card => {
                  const now = new Date();
                  const start = new Date(card.startTime);
                  const end = new Date(card.endTime);
                  
                  let stateLabel = "";
                  let stateColor = "";
                  let stateIcon = "";

                  if (end < now) {
                    stateLabel = t("Hoàn thành / 完了", "完了 / Hoàn thành");
                    stateColor = "bg-emerald-100 text-emerald-700";
                    stateIcon = "check_circle";
                  } else if (start > now) {
                    stateLabel = t("Sắp tới / 予定", "予定 / Sắp tới");
                    stateColor = "bg-blue-100 text-blue-700";
                    stateIcon = "event_note";
                  } else {
                    stateLabel = t("Đang diễn ra / 進行中", "進行中 / Đang diễn ra");
                    stateColor = "bg-amber-100 text-amber-700";
                    stateIcon = "play_circle";
                  }

                  // Short date like "25 Oct"
                  const dateStr = start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

                  return (
                    <div key={card.bookingId} className="p-3 bg-white border border-outline-variant/10 rounded-xl flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stateColor}`}>
                        <span className="material-symbols-outlined text-base">
                          {stateIcon}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-primary">
                          {stateLabel}
                        </p>
                        <p className="text-[10px] text-secondary">{dateStr} • {card.durationMinutes}m</p>
                      </div>
                    </div>
                  );
                })}
                {bookingCards.filter(c => c.status === "confirmed").length === 0 && (
                  <p className="text-xs text-secondary text-center italic mt-2">
                    {t("Chưa có lịch sử", "履歴なし")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Mobile Bottom Nav */}
      <PartnerBottomNav />

      {/* Cancel Confirmation Modal */}
      {cancelModalId && (() => {
        const card = bookingCards.find(c => c.bookingId === cancelModalId);
        if (!card) return null;
        return (
          <div className="fixed inset-0 z-[200] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => !cancellingId && setCancelModalId(null)} />
            <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-600">event_busy</span>
                </div>
                <h3 className="font-bold text-primary font-headline">
                  {t("Xác nhận hủy", "キャンセル確認")}
                </h3>
              </div>
              <p className="text-sm text-secondary mb-2">
                {t("Bạn có chắc muốn hủy buổi học này không?", "このレッスンをキャンセルしますか？")}
              </p>
              <div className="p-3 bg-surface-container rounded-xl mb-5 text-xs text-on-surface-variant space-y-1">
                <div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">calendar_today</span>{formatBookingDate(card.startTime)}</div>
                <div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">schedule</span>{formatBookingTime(card.startTime)} - {formatBookingTime(card.endTime)} ({card.durationMinutes}m)</div>
              </div>
              <div className="flex gap-3">
                <button disabled={!!cancellingId} onClick={() => setCancelModalId(null)} className="flex-1 py-2.5 text-sm font-bold text-secondary border border-outline-variant/30 rounded-xl hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-50">
                  {t("Không", "いいえ")}
                </button>
                <button disabled={!!cancellingId} onClick={() => confirmCancel(card.bookingId)} className="flex-1 py-2.5 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                  {cancellingId === card.bookingId && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {t("Xác nhận hủy", "はい")}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Detail Modal */}
      {detailModalId && (() => {
        const card = bookingCards.find(c => c.bookingId === detailModalId);
        if (!card) return null;
        const statusMap: Record<string, { label: string; color: string }> = {
          pending: { label: t("Chờ xác nhận", "確認待ち"), color: "bg-amber-100 text-amber-700" },
          confirmed: { label: t("Đã xác nhận", "確認済み"), color: "bg-emerald-100 text-emerald-700" },
          cancelled: { label: t("Đã hủy", "キャンセル済み"), color: "bg-red-100 text-red-700" },
        };
        const st = statusMap[card.status] || statusMap.pending;
        return (
          <div className="fixed inset-0 z-[200] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDetailModalId(null)} />
            <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl z-10">
              <button onClick={() => setDetailModalId(null)} className="absolute top-4 right-4 p-1 text-secondary hover:text-primary cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined">auto_stories</span>
                </div>
                <div>
                  <h3 className="font-bold text-primary font-headline text-base">{t("Chi tiết buổi học", "レッスン詳細")}</h3>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${st.color}`}>{st.label}</span>
                </div>
              </div>
              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-3 p-3 bg-surface-container rounded-xl">
                  <span className="material-symbols-outlined text-primary text-lg">person</span>
                  <div><p className="text-[10px] text-outline-variant font-bold uppercase">{t("Học viên", "学習者")}</p><p className="text-sm font-semibold text-primary">{card.learnerName}</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-surface-container rounded-xl">
                  <span className="material-symbols-outlined text-primary text-lg">calendar_today</span>
                  <div><p className="text-[10px] text-outline-variant font-bold uppercase">{t("Ngày học", "日付")}</p><p className="text-sm font-semibold text-primary">{formatBookingDate(card.startTime)}</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-surface-container rounded-xl">
                  <span className="material-symbols-outlined text-primary text-lg">schedule</span>
                  <div><p className="text-[10px] text-outline-variant font-bold uppercase">{t("Thời gian", "時間")}</p><p className="text-sm font-semibold text-primary">{formatBookingTime(card.startTime)} - {formatBookingTime(card.endTime)} ({card.durationMinutes}m)</p></div>
                </div>
                {card.notes && (
                  <div className="flex items-start gap-3 p-3 bg-surface-container rounded-xl">
                    <span className="material-symbols-outlined text-primary text-lg mt-0.5">description</span>
                    <div><p className="text-[10px] text-outline-variant font-bold uppercase">{t("Ghi chú", "メモ")}</p><p className="text-sm text-secondary">{card.notes}</p></div>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                {card.status === "pending" && (
                  <button onClick={() => { setDetailModalId(null); setCancelModalId(card.bookingId); }} className="flex-1 py-2.5 text-sm font-bold text-error border border-error/20 rounded-xl hover:bg-error/5 transition-colors cursor-pointer">
                    {t("Hủy buổi học", "キャンセル")}
                  </button>
                )}
                <button onClick={() => setDetailModalId(null)} className="flex-1 py-2.5 text-sm font-bold text-primary bg-surface-container-highest rounded-xl hover:bg-surface-container transition-colors cursor-pointer">
                  {t("Đóng", "閉じる")}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
