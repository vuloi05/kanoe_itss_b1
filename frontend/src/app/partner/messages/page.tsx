"use client";
import Image from "next/image";
import PartnerNavbar from "@/components/layout/PartnerNavbar";
import PartnerBottomNav from "@/components/layout/PartnerBottomNav";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { messageApi, type ConversationDto, type MessageDto } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export default function PartnerMessagesPage() {
  const [activeConvIdx, setActiveConvIdx] = useState(0);
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [inputText, setInputText] = useState("");
  const { user } = useAuth();
  const { t } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    
    // Fetch initial messages
    messageApi.getMessages(activeConv.conversationId).then(data => {
      setMessages(data);
      if (activeConv.unreadCount > 0) {
        messageApi.markAsRead(activeConv.conversationId).catch(console.error);
        setConversations(prev => prev.map((c, i) => i === activeConvIdx ? { ...c, unreadCount: 0 } : c));
      }
    }).catch(console.error);

    // Subscribe to Supabase Realtime
    const channel = supabase.channel(`conversation-${activeConv.conversationId}`);
    channel.on("broadcast", { event: "new_message" }, (payload) => {
      const newMsg = payload.payload.message as MessageDto;
      setMessages(prev => {
        // Prevent duplicating the message if we already optimistically added it
        if (prev.find(m => m.messageId === newMsg.messageId)) return prev;
        return [newMsg, ...prev];
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
    }).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConv, activeConvIdx]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !activeConv) return;
    try {
      const txt = inputText;
      setInputText("");
      const newMsg = await messageApi.sendMessage(activeConv.conversationId, txt);
      
      // Optimistic update if backend doesn't broadcast to sender, but usually it does.
      // We rely on broadcast to avoid duplicate, or just append it and check ID to deduplicate.
      // We will rely on the API response to append, and ignore duplicate in broadcast.
      setMessages(prev => {
        if (prev.find(m => m.messageId === newMsg.messageId)) return prev;
        return [newMsg, ...prev];
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-background text-on-background font-body h-screen flex flex-col overflow-hidden">
      <PartnerNavbar />

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
            {conversations.map((conv, idx) => (
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
                  <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold shrink-0">
                    {conv.learnerName.charAt(0)}
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
                        {conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                      </span>
                    </div>
                    <p
                      className={`text-xs truncate ${
                        activeConvIdx === idx
                          ? "text-on-surface-variant"
                          : "text-outline"
                      } ${conv.unreadCount > 0 ? "font-bold text-primary" : ""}`}
                    >
                      {conv.lastMessage || "Chưa có tin nhắn"}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Schedule Button */}
          <div className="mt-4 pt-4 border-t border-outline-variant/20">
            <button className="w-full py-3 bg-surface-container-low border-2 border-primary/10 text-primary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-all cursor-pointer">
              <span className="material-symbols-outlined text-lg">event</span>
              {t("Lịch trình / スケジュール", "スケジュール / Lịch trình")}
            </button>
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
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div>
                <h3 className="font-bold text-primary font-headline">
                  {activeConv?.learnerName}
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
            {messages.map((msg, idx) =>
              msg.senderId !== user?.userId ? (
                <div key={msg.messageId} className="flex gap-4 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 mt-1">
                    <span className="material-symbols-outlined text-sm text-primary">
                      person
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-surface-container-low p-4 rounded-2xl rounded-tl-none">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                    <span className="text-[10px] text-outline px-1 block">
                      {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  key={msg.messageId}
                  className="flex flex-col items-end gap-2 self-end max-w-[80%]"
                >
                  <div className="lotus-gradient p-4 rounded-2xl rounded-tr-none text-white engawa-shadow">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                  <span className="text-[10px] text-outline px-1 block">
                    {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )
            )}

            {/* Lesson Request Sent Card */}
            <div className="self-center w-full max-w-md">
              <div className="bg-surface-container border border-outline-variant/30 rounded-2xl overflow-hidden engawa-shadow">
                <div className="p-1 bg-secondary text-white text-[10px] text-center font-bold tracking-widest uppercase">
                  {t(
                    "Đề xuất buổi học mới / 新しいレッスンの提案",
                    "新しいレッスンの提案 / Đề xuất buổi học mới"
                  )}
                </div>
                <div className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0">
                    <span className="material-symbols-outlined">
                      auto_stories
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-primary text-base font-headline">
                      {t(
                        "Yêu cầu đã gửi / リクエスト送信済み",
                        "リクエスト送信済み / Yêu cầu đã gửi"
                      )}
                    </h4>
                    <p className="text-xs text-secondary mb-3">
                      {t(
                        "Chờ đối tác xác nhận / パートナーの承認待ち",
                        "パートナーの承認待ち / Chờ đối tác xác nhận"
                      )}
                    </p>
                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <span className="material-symbols-outlined text-sm">
                          calendar_today
                        </span>
                        <span>
                          {t(
                            "Thứ Sáu, 27/10/2023 / 2023年10月27日(金)",
                            "2023年10月27日(金) / Thứ Sáu, 27/10/2023"
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <span className="material-symbols-outlined text-sm">
                          schedule
                        </span>
                        <span>15:00 - 15:45 (GMT+7)</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 text-xs font-bold text-error border border-error/20 rounded-lg hover:bg-error/5 transition-colors cursor-pointer">
                        {t("Hủy / キャンセル", "キャンセル / Hủy")}
                      </button>
                      <button className="flex-1 py-2 text-xs font-bold text-primary bg-surface-container-highest rounded-lg hover:bg-white transition-colors cursor-pointer">
                        {t("Chi tiết / 詳細", "詳細 / Chi tiết")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Input Area */}
          <div className="p-4 px-6 bg-[#f4f4f2] border-t border-outline-variant/10">
            <div className="w-full bg-white rounded-full flex items-center px-5 py-2 engawa-shadow border border-outline-variant/10">
              <button className="p-2 text-secondary hover:text-primary transition-colors cursor-pointer">
                <span className="material-symbols-outlined">add_circle</span>
              </button>
              <input
                className="flex-1 border-none focus:ring-0 bg-transparent text-sm placeholder-outline px-4"
                placeholder={t(
                  "Nhập tin nhắn... / メッセージを入力...",
                  "メッセージを入力... / Nhập tin nhắn..."
                )}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <div className="flex items-center gap-2 border-l border-outline-variant/20 pl-4 ml-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-full text-xs font-bold hover:bg-secondary hover:text-white transition-all group cursor-pointer">
                  <span className="material-symbols-outlined text-sm">
                    calendar_month
                  </span>
                  <span>
                    {t("Đặt buổi học / 予約", "予約 / Đặt buổi học")}
                  </span>
                </button>
                <button onClick={handleSend} className="p-2 lotus-gradient text-white rounded-full hover:scale-105 transition-transform cursor-pointer">
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

        {/* Right Column: Scheduling Panel */}
        <aside className="hidden xl:flex flex-col w-80 bg-[#f9f9f7] p-6 overflow-y-auto border-l border-outline-variant/10">
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
                  className="w-full bg-[#f0f0ee] border-transparent rounded-xl px-4 py-3 text-sm focus:ring-primary focus:border-primary"
                  type="date"
                />
              </div>

              {/* Start Time */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-outline-variant uppercase tracking-wider">
                  {t("Bắt đầu / 開始時間", "開始時間 / Bắt đầu")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select className="bg-[#f0f0ee] border-transparent rounded-xl px-3 py-3 text-sm focus:ring-primary">
                    <option>09:00</option>
                    <option>10:00</option>
                    <option defaultChecked>15:00</option>
                    <option>19:00</option>
                  </select>
                  <select className="bg-[#f0f0ee] border-transparent rounded-xl px-3 py-3 text-sm focus:ring-primary">
                    <option>00</option>
                    <option>15</option>
                    <option defaultChecked>30</option>
                    <option>45</option>
                  </select>
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-outline-variant uppercase tracking-wider">
                  {t("Thời lượng / 期間", "期間 / Thời lượng")}
                </label>
                <select className="w-full bg-[#f0f0ee] border-transparent rounded-xl px-4 py-3 text-sm focus:ring-primary">
                  <option>{t("30 phút / 30分", "30分 / 30 phút")}</option>
                  <option defaultChecked>
                    {t("45 phút / 45分", "45分 / 45 phút")}
                  </option>
                  <option>{t("60 phút / 60分", "60分 / 60 phút")}</option>
                  <option>{t("90 phút / 90分", "90分 / 90 phút")}</option>
                </select>
              </div>

              {/* Summary */}
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <p className="text-[10px] text-primary font-bold mb-1">
                  {t("TỔNG KẾT / まとめ", "まとめ / TỔNG KẾT")}
                </p>
                <p className="text-xs text-secondary leading-relaxed">
                  {t("Thứ Sáu, 27/10/2023", "2023年10月27日(金)")}
                  <br />
                  15:30 - 16:15 (45m)
                </p>
              </div>

              {/* Confirm Button */}
              <button className="w-full py-3 lotus-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm cursor-pointer">
                {t("Xác nhận / セットする", "セットする / Xác nhận")}
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
                <div className="p-3 bg-white border border-outline-variant/10 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <span className="material-symbols-outlined text-base">
                      check_circle
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-primary">
                      {t("Đã hoàn thành / 完了", "完了 / Đã hoàn thành")}
                    </p>
                    <p className="text-[10px] text-secondary">25 Oct • 30m</p>
                  </div>
                </div>
                <div className="p-3 bg-white border border-outline-variant/10 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                    <span className="material-symbols-outlined text-base">
                      event_note
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-primary">
                      {t("Sắp tới / 次回", "次回 / Sắp tới")}
                    </p>
                    <p className="text-[10px] text-secondary">27 Oct • 45m</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Mobile Bottom Nav */}
      <PartnerBottomNav />
    </div>
  );
}
