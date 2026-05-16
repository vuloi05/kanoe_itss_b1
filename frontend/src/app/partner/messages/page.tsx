"use client";
import Image from "next/image";
import PartnerNavbar from "@/components/layout/PartnerNavbar";
import PartnerBottomNav from "@/components/layout/PartnerBottomNav";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Conversation {
  name: string;
  lastMsg: string;
  time: string;
  avatar?: string;
  initial?: string;
}

interface ChatMessage {
  from: "student" | "me";
  text: string;
  subtext?: string;
  time: string;
  avatar?: string;
}

const conversations: Conversation[] = [
  {
    name: "Sakura-san / サクラさん",
    lastMsg: "Chào buổi sáng! / おはよう!",
    time: "2m",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBaUdXqZeM0gxCfmnYD2hIc_9ZHFpD8y-H73-C4Lujru4RvhoXNyZeqoi3McBvJqU_Rq1p-xpoagTPYuz4weU962XdhJugCE-7zMFUQMTABB_eeD6fM6FKB0Gtt2p9m5QJEYoseY5aSDH8_zzIKmMOjJCzB-S46FaedwJHJj-34dUfBeF4YZzGCjFGIzosS5poIanXSM4XLy-6GhJUwXxXMObf5Rin-zBCss5GbUlZhA0bthLb1DdjByqTDTSE22D3ror8J1y_ZbQU",
  },
  {
    name: "Kenji / 健二",
    lastMsg: "Cảm ơn bạn. / ありがとう。",
    time: "1h",
    initial: "K",
  },
  {
    name: "Minh Anh / ミン・アン",
    lastMsg: "Hẹn gặp lại! / またね！",
    time: "",
    initial: "M",
  },
];

const chatMessages: ChatMessage[] = [
  {
    from: "student",
    text: "Chào buổi sáng! Bạn có rảnh để hướng dẫn mình về cách phát âm dấu ngã không?",
    subtext:
      "おはよう！私の「dấu ngã（波声）」の発音を教えてもらう時間はありますか？",
    time: "09:15 AM",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBCAIKKSTItQX-fCN8RH1dVJLN1wl_X8MYjQvucUOcqMHv32iJZZVzjX1N3XL21QYlWQBr-TC6G5pmZJsi3S1f_zy0ePUrYG3MRkbmiuXnPpXKpwnZHFuVaoAxcN0ujh1ThvjFE4S0zVpg19d9jVVlYhHptx8FR0yRXWFRcxEh_nkT8txQo0fqj8hT5b25sbdov9mIUdkCJaZnY4DSO_x-7mVNeUMj0SDeUpncFHzetBOLvqyGleiBM8qn78TPq4HaCkLW2_kvKFPg",
  },
  {
    from: "me",
    text: "Chào Sakura-san! Tất nhiên rồi. Chúng ta có thể luyện tập qua video call nhé.",
    subtext:
      "サクラさん、こんにちは！もちろんです。ビデオ通話で練習しましょう。",
    time: "09:18 AM",
  },
];

export default function PartnerMessagesPage() {
  const [activeConv, setActiveConv] = useState(0);
  const { t } = useLanguage();

  return (
    <div className="bg-background text-on-background font-body min-h-screen flex flex-col">
      <PartnerNavbar />

      <main className="flex-grow flex overflow-hidden mt-[64px]">
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
                key={idx}
                onClick={() => setActiveConv(idx)}
                className={`w-full text-left transition-all cursor-pointer ${
                  activeConv === idx
                    ? "p-3 bg-surface-container-lowest rounded-xl engawa-shadow"
                    : "p-3 hover:bg-surface-variant/30 rounded-xl"
                }`}
              >
                <div className="flex items-center gap-3">
                  {conv.avatar ? (
                    <Image
                      className="w-12 h-12 rounded-full object-cover shrink-0"
                      src={conv.avatar}
                      alt={conv.name}
                      width={48}
                      height={48}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold shrink-0">
                      {conv.initial}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span
                        className={`truncate ${
                          activeConv === idx
                            ? "font-bold text-primary"
                            : "font-semibold text-secondary"
                        }`}
                      >
                        {conv.name}
                      </span>
                      <span
                        className={`text-[10px] shrink-0 ml-2 ${
                          activeConv === idx ? "text-secondary" : "text-outline"
                        }`}
                      >
                        {conv.time}
                      </span>
                    </div>
                    <p
                      className={`text-xs truncate ${
                        activeConv === idx
                          ? "text-on-surface-variant"
                          : "text-outline"
                      }`}
                    >
                      {conv.lastMsg}
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
                {conversations[activeConv].avatar ? (
                  <Image
                    className="w-10 h-10 rounded-full object-cover"
                    src={conversations[activeConv].avatar!}
                    alt={conversations[activeConv].name}
                    width={40}
                    height={40}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold">
                    {conversations[activeConv].initial}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div>
                <h3 className="font-bold text-primary font-headline">
                  {conversations[activeConv].name}
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
          <div className="flex-1 overflow-y-auto p-8 space-y-8 flex flex-col">
            {chatMessages.map((msg, idx) =>
              msg.from === "student" ? (
                <div key={idx} className="flex gap-4 max-w-[80%]">
                  {msg.avatar ? (
                    <Image
                      className="w-8 h-8 rounded-full object-cover mt-1 shrink-0"
                      src={msg.avatar}
                      alt=""
                      width={32}
                      height={32}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 mt-1">
                      <span className="material-symbols-outlined text-sm text-primary">
                        person
                      </span>
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="bg-surface-container-low p-4 rounded-2xl rounded-tl-none">
                      <p className="text-sm leading-relaxed">
                        {msg.text}
                        {msg.subtext && (
                          <span className="text-xs text-secondary mt-1 block">
                            {msg.subtext}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="text-[10px] text-outline px-1">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  key={idx}
                  className="flex flex-col items-end gap-2 self-end max-w-[80%]"
                >
                  <div className="lotus-gradient p-4 rounded-2xl rounded-tr-none text-white engawa-shadow">
                    <p className="text-sm leading-relaxed">
                      {msg.text}
                      {msg.subtext && (
                        <span className="text-xs text-on-primary-container mt-1 block">
                          {msg.subtext}
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="text-[10px] text-outline px-1">
                    {msg.time}
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
                <button className="p-2 lotus-gradient text-white rounded-full hover:scale-105 transition-transform cursor-pointer">
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
