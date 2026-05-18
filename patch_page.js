const fs = require('fs');
const file = 'c:\\DU_AN\\kanoe_itss_b1\\frontend\\src\\app\\partner\\messages\\page.tsx';
let content = fs.readFileSync(file, 'utf8');

const startStr = "{messages.map((msg) =>\n              msg.senderId !== user?.userId ? (";
const endStr = "          {/* Chat Input Area */}";

const startIndex = content.indexOf("{messages.map((msg) =>");
const endIndex = content.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
  console.log('Could not find start or end bounds');
  process.exit(1);
}

const replacement = `{messages.map((msg) => {
              // 1. Nếu là LESSON_REQUEST
              if (msg.type === "LESSON_REQUEST") {
                const isPartner = msg.senderId === user?.userId;
                const statusBadge = msg.lessonStatus === "CONFIRMED" || msg.lessonStatus === "ACCEPTED"
                  ? { label: t("Đã xác nhận", "確認済み"), color: "bg-emerald-100 text-emerald-700" }
                  : msg.lessonStatus === "PENDING"
                  ? { label: t("Chờ xác nhận", "確認待ち"), color: "bg-amber-100 text-amber-700" }
                  : msg.lessonStatus === "CANCELLED"
                  ? { label: t("Đã hủy", "キャンセル済み"), color: "bg-red-100 text-red-700" }
                  : msg.lessonStatus === "DECLINED"
                  ? { label: t("Đã từ chối", "辞退した"), color: "bg-red-100 text-red-700" }
                  : null;

                return (
                  <div key={msg.messageId} className={\`w-full max-w-md my-2 \${isPartner ? "self-end" : "self-start"}\`}>
                    <div className="bg-surface-container border border-outline-variant/30 rounded-2xl overflow-hidden engawa-shadow">
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
                              {msg.lessonStatus === "CONFIRMED" || msg.lessonStatus === "ACCEPTED" ? t("Đã xác nhận", "確認済み") : t("Yêu cầu đã gửi", "リクエスト送信済み")}
                            </h4>
                            {statusBadge && <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full \${statusBadge.color}\`}>{statusBadge.label}</span>}
                          </div>
                          <p className="text-xs text-secondary mb-3">
                            {msg.lessonStatus === "CONFIRMED" || msg.lessonStatus === "ACCEPTED" ? t("Học viên đã xác nhận", "学習者が承認しました") : t("Chờ học viên xác nhận", "学習者の承認待ち")}
                          </p>
                          <div className="space-y-1.5 mb-4">
                            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                              <span className="material-symbols-outlined text-sm">calendar_today</span>
                              <span>{msg.lessonDate ? formatDateDisplay(msg.lessonDate) : ""}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                              <span className="material-symbols-outlined text-sm">schedule</span>
                              <span>{msg.lessonStartTime} - {msg.lessonEndTime} ({msg.lessonDuration}m) (GMT+7)</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
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

              // 2. Normal text message
              const isMe = msg.senderId === user?.userId;
              return isMe ? (
                // Sent message (right-aligned)
                <div
                  key={msg.messageId}
                  className={\`flex flex-col items-end gap-1 self-end max-w-[80%] transition-opacity \${
                    msg._sendStatus === "failed" ? "opacity-70" : ""
                  }\`}
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
                  {t("Đã tải hết lịch sử / 全履歴を読み込みました", "全履歴を読み込みました / Đã tải hết lịch sử")}
                </span>
              </div>
            )}
            {hasMore && !isLoadingMore && <div ref={sentinelRef} className="h-1" />}
          </div>
`;

const newContent = content.substring(0, startIndex) + replacement + "\n" + content.substring(endIndex);
fs.writeFileSync(file, newContent, 'utf8');
console.log('Patched page.tsx successfully');
