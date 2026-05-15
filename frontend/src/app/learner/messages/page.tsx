"use client";
import Image from "next/image";
import LearnerNavbar from "@/components/layout/LearnerNavbar";
import LearnerBottomNav from "@/components/layout/LearnerBottomNav";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Conversation {
  name: string;
  lastMsg: string;
  time: string;
  avatar: string;
  online?: boolean;
}

interface ChatMessage {
  from: "partner" | "me";
  text: string;
  subtext?: string;
  time: string;
}

const conversations: Conversation[] = [
  {
    name: "Linh Chi / リン・チー",
    lastMsg: "Chào bạn! Rất vui được gặp... / 初めまして！お会い...",
    time: "19:02",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCcRIndFOlW7wXeV-CLVZUfuscuqi3-G9TREAi9VISX3n6qHGpzcnc5Gwhu383eionE7kFgbQlYcRCY7NVLtvyU8iCs4_g1MR476HWmSMb_7bXrMTrwIGDyaJ1duOtv6FFr3MiiJtlqKcTtbIgBURHDFpXBFzUvcMT9SI17taj5bkY9J2TjXC94p0t2Pwd_l9DXiMaXDrSwF-Oz670i0tvP7GvGkVCyazhBuG47rgDGDLRujjm_vPugqtA6GhnMUOpkhfXQf405NQo",
    online: true,
  },
  {
    name: "Takeshi / タケシ",
    lastMsg: "Cảm ơn vì buổi học hôm... / 昨日のレッスンありがと...",
    time: "Hôm qua",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDOkg5MBETD5FafPOcFCZuGY1cXeY-f6vGPFIi_rDRSdBhsUjhbSU3NJkUGp-TwMZI5Vs3OMC4-G5ujFKqFHRodSz7RnD_5KErmDH8R1PZ0c6HcYDQm60YXSsSLx5_KM59xYdyB1lxdLxCSOQa017ZblreIAacLD7oYsPPrnnKN58_H58e2QuXRB5PTNol8r1kUBoOWCAFg3Af7tcN3U7eCOyY90ynokMsTrn1HUoQscO62Fu0i14AfvfkAFmBcHOjMCQPk07Ir0mU",
  },
  {
    name: "Hương Giang / フォン・ジャン",
    lastMsg: "Bạn có rảnh vào tối... / 今週の土曜日の夜は...",
    time: "24/02",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDu0YYj69WT8kuLRHsEdE3AcOmM4DHDfJsK-XltmTQr4ujAtIbPUQ608MXYG1xQBh4MWmoi2NDU0QKMs17TVR3w-T_wYwHtEvU-8y09LcO19qzjrI2Cqs0VmpX6uZWsmtpAkxttxEuyRn01Yzd5nMCPyXZ6Z_m0rmECkwKRSZ6ava_tlgo-bvSVanGhtbkC6O3UtHjkstKQXyZ7fqrwQsHbyWM76raPw9oMUjM_IKFCrB8AC818NaP8W1a0b_Try3AAwxXGDflvao0",
  },
];

const chatMessages: ChatMessage[] = [
  {
    from: "partner",
    text: "Chào bạn! Rất vui được gặp bạn trên VietImmerse.",
    subtext: "初めまして！VietImmerseでお会いできて嬉しいです。",
    time: "18:45",
  },
  {
    from: "me",
    text: "Chào Linh Chi! Mình cũng rất vui. Mình muốn học thêm về cách phát âm tiếng Việt miền Bắc.",
    subtext:
      "リン・チーさん、こんにちは！私も嬉しいです。北部ベトナム語の発音についてもっと学びたいと思っています。",
    time: "18:48",
  },
  {
    from: "partner",
    text: "Rất sẵn lòng! Mình có thể giúp bạn. Bạn có muốn đặt một buổi học thử không?",
    subtext: "もちろんです！お手伝いできますよ。体験レッスンを予約しませんか？",
    time: "18:52",
  },
];

export default function LearnerMessagesPage() {
  const [activeConv, setActiveConv] = useState(0);
  const { t } = useLanguage();

  const activeConversation = conversations[activeConv];

  return (
    <div className="bg-background text-on-background font-body min-h-screen flex flex-col">
      <LearnerNavbar />

      {/* Full-height layout below navbar */}
      <main className="flex-grow flex overflow-hidden mt-[64px]">
        {/* Left Column: Chat List (30%) */}
        <aside className="w-[30%] bg-surface-container-low flex-col border-r border-outline-variant/10 hidden md:flex">
          <div className="p-6">
            <h2 className="text-xl font-bold text-primary mb-6 font-headline">
              {t("Tin nhắn / メッセージ", "メッセージ / Tin nhắn")}
            </h2>
            <div className="space-y-2">
              {conversations.map((conv, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveConv(idx)}
                  className={`w-full text-left transition-all cursor-pointer ${
                    activeConv === idx
                      ? "p-4 bg-surface-container-lowest rounded-xl shadow-sm border-l-4 border-primary"
                      : "p-4 hover:bg-surface-container-high rounded-xl"
                  }`}
                >
                  <div
                    className={`flex items-center space-x-4 ${
                      activeConv !== idx ? "opacity-70" : ""
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full overflow-hidden shrink-0 ${
                        activeConv === idx
                          ? "bg-primary-container"
                          : "bg-surface-variant"
                      }`}
                    >
                      <Image
                        className="w-full h-full object-cover"
                        src={conv.avatar}
                        alt={conv.name}
                        width={48}
                        height={48}
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start">
                        <p
                          className={`leading-tight truncate ${
                            activeConv === idx
                              ? "font-bold text-primary"
                              : "font-semibold text-on-surface"
                          }`}
                        >
                          {conv.name}
                        </p>
                        <span className="text-[10px] text-outline shrink-0 ml-2">
                          {conv.time}
                        </span>
                      </div>
                      <p
                        className={`text-xs mt-1 truncate ${
                          activeConv === idx
                            ? "text-secondary"
                            : "text-on-surface-variant"
                        }`}
                      >
                        {conv.lastMsg}
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
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <Image
                  className="w-full h-full object-cover"
                  src={activeConversation.avatar}
                  alt={activeConversation.name}
                  width={40}
                  height={40}
                />
              </div>
              <div>
                <h3 className="font-bold text-primary font-headline">
                  {activeConversation.name}
                </h3>
                {activeConversation.online && (
                  <p className="text-xs text-secondary flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    Online / オンライン
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-grow overflow-y-auto p-8 space-y-8 bg-[#f9f9f7]">
            {chatMessages.map((msg, idx) =>
              msg.from === "partner" ? (
                // Partner message
                <div
                  key={idx}
                  className="flex flex-col items-start max-w-[80%]"
                >
                  <div className="bg-surface-container-high text-on-surface px-5 py-3 rounded-tr-xl rounded-br-xl rounded-bl-xl leading-relaxed">
                    <p className="text-sm">{msg.text}</p>
                    {msg.subtext && (
                      <p className="text-xs text-secondary mt-1">
                        {msg.subtext}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-outline mt-1 ml-1">
                    {msg.time}
                  </span>
                </div>
              ) : (
                // User message
                <div
                  key={idx}
                  className="flex flex-col items-end max-w-[80%] ml-auto"
                >
                  <div className="bg-primary text-on-primary px-5 py-3 rounded-tl-xl rounded-bl-xl rounded-br-xl leading-relaxed">
                    <p className="text-sm">{msg.text}</p>
                    {msg.subtext && (
                      <p className="text-[11px] text-on-primary-container mt-1 italic">
                        {msg.subtext}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-outline mt-1 mr-1">
                    {msg.time}
                  </span>
                </div>
              )
            )}

            {/* Lesson Request Card (Bento Style) */}
            <div className="max-w-[420px] w-full mx-auto">
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-primary-container/10 px-6 py-3 flex justify-between items-center border-b border-outline-variant/10">
                  <h4 className="text-sm font-bold text-primary tracking-tight font-headline">
                    Lesson Request / レッスンリクエスト
                  </h4>
                  <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Pending / 保留中
                  </span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="material-symbols-outlined text-primary text-xl">
                      calendar_today
                    </span>
                    <div>
                      <p className="text-sm font-bold text-on-surface">
                        {t(
                          "Thứ Ba, 24/02 / 2月24日 (火)",
                          "2月24日 (火) / Thứ Ba, 24/02"
                        )}
                      </p>
                      <p className="text-xs text-secondary">
                        Hà Nội, Việt Nam
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="material-symbols-outlined text-primary text-xl">
                      schedule
                    </span>
                    <div>
                      <p className="text-sm font-bold text-on-surface">
                        19:00 - 20:00
                      </p>
                      <p className="text-xs text-secondary">(Hanoi Time)</p>
                    </div>
                  </div>
                  <div className="pt-4 grid grid-cols-2 gap-3">
                    <button className="bg-primary text-on-primary py-2.5 px-4 rounded-lg text-xs font-bold transition-all hover:bg-primary-container active:scale-95 cursor-pointer">
                      Accept Request / 承認
                    </button>
                    <button className="bg-surface-container text-secondary py-2.5 px-4 rounded-lg text-xs font-bold border border-outline-variant/20 transition-all hover:bg-surface-variant active:scale-95 cursor-pointer">
                      Decline / 辞退
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Classroom Link (Accepted State) */}
            <div className="max-w-[420px] w-full mx-auto opacity-60">
              <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                    <span className="material-symbols-outlined">
                      video_chat
                    </span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-on-surface">
                      Join Classroom (Google Meet)
                    </p>
                    <p className="text-[10px] text-secondary">クラスに入る</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline text-sm">
                  open_in_new
                </span>
              </div>
            </div>
          </div>

          {/* Message Input Area */}
          <div className="px-8 py-6 bg-surface border-t border-outline-variant/10">
            <div className="relative flex items-center">
              <input
                className="w-full bg-surface-container-low border-none rounded-full px-6 py-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline/60"
                placeholder={t(
                  "Viết tin nhắn... / メッセージを入力...",
                  "メッセージを入力... / Viết tin nhắn..."
                )}
                type="text"
              />
              <button className="absolute right-3 w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 cursor-pointer">
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
    </div>
  );
}
