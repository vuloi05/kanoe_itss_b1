"use client";

import LearnerNavbar from "@/components/layout/LearnerNavbar";
import LearnerBottomNav from "@/components/layout/LearnerBottomNav";
import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePresence } from "@/contexts/PresenceContext";
import { useAuth } from "@/lib/auth";
import { messageApi, bookingApi, type ConversationDto } from "@/lib/api";
import { ensureConnected, getSignalRConnection } from "@/lib/signalr";
import { useSearchParams } from "next/navigation";
import {
  type LocalMessage,
  formatMessageTime,
  formatConversationTime,
  generateTempId,
  useOfflineQueue,
  useLazyLoadMessages,
  isMeetLink,
  autoResizeTextarea,
  normalizeLessonStatus,
} from "@/lib/chatUtils";
import MessagePreviewRow from "@/components/messages/MessagePreviewRow";

export default function LearnerMessagesPage() {
  const [activeConvIdx, setActiveConvIdx] = useState(0);
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const { user } = useAuth();
  const { t } = useLanguage();
  const { isUserOnline } = usePresence();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Booking state
  const [toast, setToast] = useState<{message:string; type:"success"|"error"|"warning"} | null>(null);
  const [declineModalId, setDeclineModalId] = useState<string|null>(null);
  const [acceptingId, setAcceptingId] = useState<string|null>(null);
  const [decliningId, setDecliningId] = useState<string|null>(null);

  const showToast = (message: string, type: "success" | "error" | "warning") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const searchParams = useSearchParams();

  const { isOnline, enqueue } = useOfflineQueue(setMessages, setConversations);

  // Lazy load hook
  const { sentinelRef, isLoadingMore, hasMore, resetPagination } =
    useLazyLoadMessages(conversations[activeConvIdx]?.conversationId, setMessages);

  // Fetch conversations on load
  useEffect(() => {
    messageApi
      .getConversations()
      .then((data) => {
        setConversations(data);
        // Auto-select conversation if redirected from matching page (spec §4.5)
        const convParam = searchParams.get("conv");
        if (convParam) {
          const idx = data.findIndex((c: ConversationDto) => c.conversationId === convParam);
          if (idx >= 0) setActiveConvIdx(idx);
        }
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        setMessages((data as LocalMessage[]).map(m => m.lessonStatus ? { ...m, lessonStatus: normalizeLessonStatus(m.lessonStatus) } : m));
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



    // Subscribe to SignalR conversation events
    let mounted = true;
    const setupSignalR = async () => {
      const conn = await ensureConnected();
      await conn.invoke("JoinConversation", activeConv.conversationId).catch(console.error);

      conn.on("ReceiveMessage", (newMsg: LocalMessage) => {
        if (!mounted) return;
        newMsg._sendStatus = "sent";
        setMessages((prev) => {
          const withoutTemp = prev.filter(
            (m) => !(m._tempId && m.content === newMsg.content && m.senderId === newMsg.senderId)
          );
          if (withoutTemp.find((m) => m.messageId === newMsg.messageId))
            return withoutTemp;
          return [newMsg, ...withoutTemp];
        });

        setConversations((prev) => {
          const copy = [...prev];
          const idx = copy.findIndex(
            (c) => c.conversationId === newMsg.conversationId
          );
          if (idx >= 0) {
            copy[idx].lastMessage = newMsg.content;
            copy[idx].lastMessageTime = newMsg.timestamp;
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
        setConversations(prev => {
          const copy = [...prev];
          const idx = copy.findIndex(c => c.conversationId === newMsg.conversationId);
          if (idx >= 0) {
            copy[idx].lastMessage = newMsg.content || t("Yêu cầu học thử", "体験レッスンリクエスト");
            copy[idx].lastMessageType = newMsg.type;
            copy[idx].lastMessageTime = newMsg.timestamp;
          }
          return copy;
        });
        showToast(t("Đề xuất buổi học mới!", "新しいレッスンの提案！"), "success");
      });

      conn.on("LessonCancelled", (data: { lesson_request_id: string; new_status: string }) => {
        if (!mounted) return;
        const status = normalizeLessonStatus(data.new_status);
        setMessages(prev => prev.map(m => m.lessonRequestId === data.lesson_request_id ? { ...m, lessonStatus: status } : m));
        showToast(t("Đối tác đã hủy buổi học.", "パートナーがレッスンをキャンセルしました。"), "warning");
      });
    };
    setupSignalR().catch(console.error);

    return () => {
      mounted = false;
      const conn = getSignalRConnection();
      conn.off("ReceiveMessage");
      conn.off("LessonRequestCreated");
      conn.off("LessonCancelled");
      conn.invoke("LeaveConversation", activeConv.conversationId).catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConv, activeConvIdx]);

  useEffect(() => {
    // Scroll messages container directly to avoid bubbling scroll to parent section
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  }, [messages]);

  // Send message handler with optimistic UI + offline queue
  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !activeConv) return;

    const txt = inputText.trim();
    setInputText("");
    // Reset textarea height after send
    if (textareaRef.current) textareaRef.current.style.height = '52px';

    // Optimistic: add bubble immediately
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
          copy[idx].lastMessageTime = newMsg.timestamp;
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

  // Format date from yyyy-MM-dd string (used by LESSON_REQUEST messages)
  const formatDateDisplay = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const daysJa = ["日", "月", "火", "水", "木", "金", "土"];
    return t(
      `${days[d.getDay()]}, ${d.toLocaleDateString("vi-VN")}`,
      `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日(${daysJa[d.getDay()]})`
    );
  };

  // Accept lesson request
  const handleAccept = async (bookingId: string) => {
    setAcceptingId(bookingId);
    try {
      await bookingApi.acceptLessonRequest(bookingId);
      setMessages(prev => prev.map(m => m.lessonRequestId === bookingId ? { ...m, lessonStatus: "ACCEPTED" } : m));
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
      setMessages(prev => prev.map(m => m.lessonRequestId === bookingId ? { ...m, lessonStatus: "DECLINED" } : m));
      setDeclineModalId(null);
      showToast(t("Đã từ chối lịch hẹn.", "レッスンを辞退しました。"), "warning");
    } catch {
      showToast(t("Có lỗi xảy ra, vui lòng thử lại.", "エラーが発生しました。"), "error");
    } finally {
      setDecliningId(null);
    }
  };

  return (
    <div className="bg-background text-on-background font-body h-screen flex flex-col overflow-hidden pt-[79px]">
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
        <div className="bg-amber-500 text-white text-center py-2 text-sm font-bold flex items-center justify-center gap-2 shrink-0">
          <span className="material-symbols-outlined text-base">wifi_off</span>
          {t("Mất kết nối mạng", "ネットワーク接続なし")}
        </div>
      )}

      {/* Full-height layout below navbar */}
      <main className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Column: Chat List (30%) */}
        <aside className="w-[30%] bg-surface-container-low flex-col border-r border-outline-variant/10 hidden md:flex overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-bold text-primary mb-6 font-headline">
              {t("Tin nhắn", "メッセージ")}
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
                    <div className="relative shrink-0">
                      <div
                        className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center font-bold text-primary ${
                          activeConvIdx === idx
                            ? "bg-primary-container"
                            : "bg-surface-variant"
                        }`}
                      >
                        {(() => {
                          const avatarSrc = conv.partnerAvatarUrl
                            || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(conv.partnerName)}&backgroundColor=c0aede`;
                          return (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              alt={conv.partnerName}
                              className="w-full h-full object-cover"
                              src={avatarSrc}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          );
                        })()}
                      </div>
                      <div 
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          isUserOnline(conv.partnerId) ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
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
                        {conv.unreadCount > 0 && (
                          <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center shrink-0 ml-1">
                            {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                          </span>
                        )}
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
              ))}
            </div>
          </div>
        </aside>

        {/* Right Column: Conversation View (70%) */}
        <section className="w-full md:w-[70%] flex flex-col bg-surface overflow-hidden relative">
          {/* Conversation Header */}
          <div className="px-8 py-4 bg-surface flex justify-between items-center z-10 border-b border-outline-variant/10 shrink-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-container flex items-center justify-center font-bold text-on-primary-container text-sm">
                  {(() => {
                    const avatarSrc = activeConv?.partnerAvatarUrl
                      || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(activeConv?.partnerName || "user")}&backgroundColor=c0aede`;
                    return (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt={activeConv?.partnerName}
                        className="w-full h-full object-cover"
                        src={avatarSrc}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    );
                  })()}
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
                <h3 className="font-bold text-primary font-headline">
                  {activeConv?.partnerName}
                </h3>
                {activeConv && (
                  <p className="text-xs text-secondary flex items-center gap-1">
                    <span 
                      className={`inline-block w-2 h-2 rounded-full ${
                        isUserOnline(activeConv.partnerId) ? "bg-green-500" : "bg-gray-400"
                      }`} 
                    />
                    {isUserOnline(activeConv.partnerId) ? "Online / オンライン" : "Offline / オフライン"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#f9f9f7] flex flex-col-reverse min-h-0">
            <div ref={messagesEndRef} />
            {messages.map((msg) => {
              // 1. Render LESSON_REQUEST card inline
              if (msg.type === "LESSON_REQUEST") {
                const isPending = msg.lessonStatus === "PENDING";
                const isAccepted = msg.lessonStatus === "ACCEPTED" || msg.lessonStatus === "CONFIRMED";
                const statusBadge = isAccepted
                  ? { label: t("Đã xác nhận", "確認済み"), color: "bg-emerald-100 text-emerald-700" }
                  : msg.lessonStatus === "PENDING"
                  ? { label: t("Chờ xác nhận", "確認待ち"), color: "bg-amber-100 text-amber-700" }
                  : msg.lessonStatus === "CANCELLED"
                  ? { label: t("Đã hủy", "キャンセル済み"), color: "bg-red-100 text-red-700" }
                  : msg.lessonStatus === "DECLINED"
                  ? { label: t("Đã từ chối", "辞退した"), color: "bg-red-100 text-red-700" }
                  : null;
                const isProcessing = acceptingId === msg.lessonRequestId || decliningId === msg.lessonRequestId;
                const lessonDateTime = msg.lessonDate && msg.lessonStartTime ? new Date(`${msg.lessonDate}T${msg.lessonStartTime}:00+07:00`) : null;
                const isTimeToAccept = lessonDateTime ? new Date() >= lessonDateTime : true;

                return (
                  <div key={msg.messageId} className="w-full max-w-md my-2 self-center flex flex-col">
                    <div className="bg-surface-container border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
                      <div className="p-1 bg-secondary text-white text-[10px] text-center font-bold tracking-widest uppercase">
                        {t("Đề xuất buổi học mới", "新しいレッスンの提案")}
                      </div>
                      <div className="p-4 sm:p-6 flex items-start gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0">
                          <span className="material-symbols-outlined">auto_stories</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-primary text-base font-headline">
                              {t("Lesson Request", "レッスンリクエスト")}
                            </h4>
                            {statusBadge && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge.color}`}>{statusBadge.label}</span>}
                          </div>
                          <div className="space-y-1.5 mb-4">
                            {msg.content && (
                              <div className="flex items-center gap-2 text-sm text-on-surface font-semibold mb-2">
                                <span className="material-symbols-outlined text-sm text-primary">label</span>
                                <span>{msg.content}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                              <span className="material-symbols-outlined text-sm">calendar_today</span>
                              <span>{msg.lessonDate ? formatDateDisplay(msg.lessonDate) : ""}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                              <span className="material-symbols-outlined text-sm">schedule</span>
                              <span>{msg.lessonStartTime} - {msg.lessonEndTime} ({msg.lessonDuration}m) (GMT+7)</span>
                            </div>
                          </div>
                          {isPending && (
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                disabled={isProcessing || !isTimeToAccept}
                                onClick={() => handleAccept(msg.lessonRequestId!)}
                                className="py-2 text-xs font-bold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-0.5"
                                title={!isTimeToAccept ? t("Nút Accept sẽ mở khi đến giờ học", "レッスン時間になると承認ボタンが有効になります") : ""}
                              >
                                <div className="flex items-center gap-1.5">
                                  {acceptingId === msg.lessonRequestId && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                  {t("Accept", "承認")}
                                </div>
                                {!isTimeToAccept && (
                                  <span className="text-[8px] font-normal opacity-80">{t("Mở khi đến giờ học", "レッスン時間に開く")}</span>
                                )}
                              </button>
                              <button
                                disabled={isProcessing}
                                onClick={() => setDeclineModalId(msg.lessonRequestId!)}
                                className="py-2 text-xs font-bold text-secondary border border-outline-variant/20 rounded-lg hover:bg-surface-variant transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {t("Decline", "辞退")}
                              </button>
                            </div>
                          )}
                          {!isPending && (
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                disabled
                                className="py-2 text-xs font-bold text-white bg-primary/40 rounded-lg cursor-not-allowed opacity-50 flex items-center justify-center gap-1.5"
                              >
                                {t("Accept", "承認")}
                              </button>
                              <button
                                disabled
                                className="py-2 text-xs font-bold text-secondary/50 border border-outline-variant/10 rounded-lg cursor-not-allowed opacity-50"
                              >
                                {t("Decline", "辞退")}
                              </button>
                            </div>
                          )}

                          {msg.lessonStatus === "DECLINED" && (
                            <div className="flex items-center gap-2 text-red-500 mt-2">
                              <span className="material-symbols-outlined text-lg">cancel</span>
                              <span className="text-xs font-bold">{t("Đã từ chối", "辞退済み")}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                </div>
                );
              }

              // 2. System reminder message
              if (msg.content?.startsWith("Nhắc nhở: Lịch học")) {
                return (
                  <div key={msg.messageId} className="w-full flex justify-center my-4 transition-all">
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-amber-50 border border-amber-200/60 rounded-full shadow-sm max-w-[85%]">
                      <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-amber-500 text-sm animate-pulse">notifications_active</span>
                      </div>
                      <span className="text-amber-900 text-[11px] sm:text-xs font-semibold leading-relaxed">{msg.content}</span>
                    </div>
                  </div>
                );
              }

              // 3. Normal text / meet link messages
              return msg.senderId !== user?.userId ? (
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
                    <div className="bg-surface-container-high text-on-surface px-5 py-3 rounded-tr-xl rounded-br-xl rounded-bl-xl leading-relaxed">
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      {msg.contentTranslated && (
                        <p className="text-xs text-secondary mt-1 whitespace-pre-wrap">
                          {msg.contentTranslated}
                        </p>
                      )}
                    </div>
                  )}
                  <span className="text-[10px] text-outline mt-1 ml-1">
                    {formatMessageTime(msg.timestamp, t)}
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
                        <p className="text-[11px] text-on-primary-container mt-1 italic whitespace-pre-wrap">
                          {msg.contentTranslated}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex items-center mt-1 mr-1">
                    <span className="text-[10px] text-outline">
                      {formatMessageTime(msg.timestamp, t)}
                    </span>
                    {renderStatusIcon(msg)}
                  </div>
                </div>
              );
            })}

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
                  {t("Đã tải hết lịch sử", "全履歴を読み込みました")}
                </span>
              </div>
            )}
            {hasMore && !isLoadingMore && <div ref={sentinelRef} className="h-1" />}
          </div>

          {/* Message Input Area */}
          <div className="px-8 py-6 bg-surface border-t border-outline-variant/10 shrink-0">
            <div className="relative flex items-center">
              <textarea
                ref={textareaRef}
                className="w-full bg-surface-container-low border-none rounded-2xl px-6 py-4 pr-14 text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline/60 resize-none overflow-hidden"
                placeholder={t(
                  "Viết tin nhắn... / メッセージを入力...",
                  "メッセージを入力... / Viết tin nhắn..."
                )}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  autoResizeTextarea(e.target);
                }}
                onKeyDown={handleKeyDown}
                rows={1}
                style={{ height: '52px', minHeight: '52px', maxHeight: '160px' }}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim()}
                className={`absolute right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg cursor-pointer ${
                  inputText.trim()
                    ? "bg-primary text-on-primary hover:scale-105 active:scale-95 shadow-primary/20"
                    : "bg-outline/30 text-outline cursor-not-allowed"
                }`}
              >
                <span className="material-symbols-outlined text-lg">send</span>
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
        const msg = messages.find(m => m.lessonRequestId === declineModalId);
        if (!msg) return null;
        return (
          <div className="fixed inset-0 z-[200] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => !decliningId && setDeclineModalId(null)} />
            <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-amber-600">help_outline</span>
                </div>
                <h3 className="font-bold text-primary font-headline">
                  {t("Xác nhận từ chối", "辞退確認")}
                </h3>
              </div>
              <p className="text-sm text-secondary mb-2">
                {t("Bạn có chắc muốn từ chối lịch hẹn này không?", "このレッスンを辞退しますか？")}
              </p>
              <div className="p-3 bg-surface-container rounded-xl mb-5 text-xs text-on-surface-variant space-y-1">
                <div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">calendar_today</span>{msg.lessonDate ? formatDateDisplay(msg.lessonDate) : ""}</div>
                <div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">schedule</span>{msg.lessonStartTime} - {msg.lessonEndTime} ({msg.lessonDuration}m)</div>
              </div>
              <div className="flex gap-3">
                <button disabled={!!decliningId} onClick={() => setDeclineModalId(null)} className="flex-1 py-2.5 text-sm font-bold text-secondary border border-outline-variant/30 rounded-xl hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-50">
                  {t("Hủy bỏ", "キャンセル")}
                </button>
                <button disabled={!!decliningId} onClick={() => confirmDecline(declineModalId)} className="flex-1 py-2.5 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                  {decliningId === declineModalId && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {t("Xác nhận từ chối", "辞退する")}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
