"use client";

import { type LocalMessage, formatMessageTime, isMeetLink, autoResizeTextarea } from "@/lib/chatUtils";
import { type ConversationDto } from "@/lib/api";

export interface ChatAreaProps {
  messages: LocalMessage[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  activeConv: ConversationDto | undefined;
  t: (vi: string, ja: string) => string;
  isUserOnline: (userId: string) => boolean;
  cancellingId: string | null;
  setCancelModalId: (id: string | null) => void;
  setDetailModalId: (id: string | null) => void;
  formatDateDisplay: (dateStr: string) => string;
  handleRetry: (tempId: string) => void;
  isLoadingMore: boolean;
  hasMore: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sentinelRef: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  messagesEndRef: any;
  toggleSchedulePanel: () => void;
  showSchedulePanel: boolean;
  inputText: string;
  setInputText: (text: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleSend: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export default function ChatArea({
  messages,
  user,
  activeConv,
  t,
  isUserOnline,
  cancellingId,
  setCancelModalId,
  setDetailModalId,
  formatDateDisplay,
  handleRetry,
  isLoadingMore,
  hasMore,
  sentinelRef,
  messagesEndRef,
  toggleSchedulePanel,
  showSchedulePanel,
  inputText,
  setInputText,
  handleKeyDown,
  handleSend,
  textareaRef,
}: ChatAreaProps) {
  return (
    <section className="flex-1 flex flex-col bg-white relative overflow-hidden">
      {/* Chat Header */}
      <div className="px-8 py-4 bg-surface flex items-center justify-between border-b border-outline-variant/10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm">
              {(() => {
                const avatarSrc = activeConv?.partnerAvatarUrl
                  || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(activeConv?.learnerName || "user")}&backgroundColor=c0aede`;
                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={activeConv?.learnerName}
                    className="w-full h-full object-cover"
                    src={avatarSrc}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                );
              })()}
            </div>
            <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
              activeConv && isUserOnline(activeConv.learnerId) ? "bg-green-500" : "bg-gray-400"
            }`} />
          </div>
          <div>
            <h3 className="font-bold text-primary font-headline">
              {activeConv?.learnerName}
            </h3>
            <p className="text-xs text-secondary flex items-center gap-1">
              <span className={`inline-block w-2 h-2 rounded-full ${
                activeConv && isUserOnline(activeConv.learnerId) ? "bg-green-500" : "bg-gray-400"
              }`} />
              {activeConv && isUserOnline(activeConv.learnerId) ? "Online / オンライン" : "Offline / オフライン"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#f9f9f7] flex flex-col-reverse min-h-0">
        <div ref={messagesEndRef} />
        {messages.map((msg) => {
          // 1. Nếu là LESSON_REQUEST
          if (msg.type === "LESSON_REQUEST") {
            const isPartner = msg.senderId === user?.userId;
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

            return (
              <div key={msg.messageId} className={`w-full max-w-md my-2 flex flex-col ${isPartner ? "self-end" : "self-start"}`}>
                <div className="bg-surface-container border border-outline-variant/30 rounded-2xl overflow-hidden engawa-shadow">
                  <div className="p-1 bg-secondary text-white text-[10px] text-center font-bold tracking-widest uppercase">
                    {t("Đề xuất buổi học mới", "新しいレッスンの提案")}
                  </div>
                  <div className="p-4 sm:p-6 flex flex-col gap-4">
                    <div className="flex items-start gap-4">
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
                        <p className="text-xs text-secondary mb-3">
                          {isAccepted ? t("Học viên đã xác nhận", "学習者が承認しました")
                            : msg.lessonStatus === "DECLINED" ? t("Học viên đã từ chối", "学習者が辞退しました")
                            : msg.lessonStatus === "CANCELLED" ? t("Đã hủy", "キャンセル済み")
                            : t("Chờ học viên xác nhận", "学習者の承認待ち")}
                        </p>
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
                          {msg.meetingUrl && (
                            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                              <span className="material-symbols-outlined text-sm">videocam</span>
                              <a
                                href={msg.meetingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary font-semibold hover:underline truncate"
                              >
                                {msg.meetingUrl}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Buttons span full width */}
                    <div className="flex gap-2 w-full mt-1">
                      {msg.lessonStatus === "PENDING" && (
                        <button disabled={cancellingId === msg.lessonRequestId} onClick={() => setCancelModalId(msg.lessonRequestId!)} className="flex-1 py-2 text-xs font-bold text-error border border-error/20 rounded-lg hover:bg-error/5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                          {cancellingId === msg.lessonRequestId ? t("Đang hủy...", "処理中...") : t("Hủy", "キャンセル")}
                        </button>
                      )}
                      <button onClick={() => setDetailModalId(msg.lessonRequestId!)} className="flex-1 py-2 text-xs font-bold text-primary bg-surface-container-highest rounded-lg hover:bg-white transition-colors cursor-pointer">
                        {t("Chi tiết", "詳細")}
                      </button>
                    </div>
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
                    <span className="material-symbols-outlined text-amber-500 text-sm animate-[wiggle_2s_ease-in-out_infinite]">notifications_active</span>
                  </div>
                  <span className="text-amber-900 text-[11px] sm:text-xs font-semibold leading-relaxed">{msg.content}</span>
                </div>
              </div>
            );
          }

          // 3. Normal text message
          const isMe = msg.senderId === user?.userId;
          return isMe ? (
            // Sent message (right-aligned)
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
                    <div className="text-[10px] text-white/80 text-center break-all">{msg.content.trim()}</div>
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
                  {formatMessageTime(msg.timestamp, t)}
                </span>
                {msg._sendStatus === "queued" ? (
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
                )}
              </div>
            </div>
          ) : (
            // Received message (left-aligned)
            <div key={msg.messageId} className="flex gap-4 max-w-[80%] self-start">
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
                  {formatMessageTime(msg.timestamp, t)}
                </span>
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

      {/* Chat Input Area */}
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
          <div className="absolute right-3 flex items-center gap-2">
            <button
              onClick={toggleSchedulePanel}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                showSchedulePanel
                  ? "bg-secondary text-white"
                  : "bg-secondary/10 text-secondary hover:bg-secondary hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                calendar_month
              </span>
              <span>
                {t("Đặt buổi học", "予約")}
              </span>
            </button>
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg cursor-pointer ${
                inputText.trim()
                  ? "bg-primary text-on-primary hover:scale-105 active:scale-95 shadow-primary/20"
                  : "bg-outline/30 text-outline cursor-not-allowed"
              }`}
            >
              <span className="material-symbols-outlined text-lg">send</span>
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
  );
}
