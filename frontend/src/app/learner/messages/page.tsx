"use client";
import Image from "next/image";
import LearnerNavbar from "@/components/layout/LearnerNavbar";
import LearnerBottomNav from "@/components/layout/LearnerBottomNav";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { messageApi, type ConversationDto, type MessageDto } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export default function LearnerMessagesPage() {
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
      
      setMessages(prev => {
        if (prev.find(m => m.messageId === newMsg.messageId)) return prev;
        return [newMsg, ...prev];
      });
    } catch (error) {
      console.error(error);
    }
  };

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
                          {conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                        </span>
                      </div>
                      <p
                        className={`text-xs mt-1 truncate ${
                          activeConvIdx === idx
                            ? "text-secondary"
                            : "text-on-surface-variant"
                        } ${conv.unreadCount > 0 ? "font-bold text-primary" : ""}`}
                      >
                        {conv.lastMessage || "Chưa có tin nhắn"}
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
              <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center font-bold text-primary">
                {activeConv?.partnerName?.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-primary font-headline">
                  {activeConv?.partnerName}
                </h3>
              </div>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-grow overflow-y-auto p-8 space-y-8 bg-[#f9f9f7] flex flex-col-reverse">
            <div ref={messagesEndRef} />
            {messages.map((msg, idx) =>
              msg.senderId !== user?.userId ? (
                // Partner message
                <div
                  key={msg.messageId}
                  className="flex flex-col items-start max-w-[80%]"
                >
                  <div className="bg-surface-container-high text-on-surface px-5 py-3 rounded-tr-xl rounded-br-xl rounded-bl-xl leading-relaxed">
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <span className="text-[10px] text-outline mt-1 ml-1">
                    {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ) : (
                // User message
                <div
                  key={msg.messageId}
                  className="flex flex-col items-end max-w-[80%] ml-auto"
                >
                  <div className="bg-primary text-on-primary px-5 py-3 rounded-tl-xl rounded-bl-xl rounded-br-xl leading-relaxed">
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <span className="text-[10px] text-outline mt-1 mr-1">
                    {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button onClick={handleSend} className="absolute right-3 w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 cursor-pointer">
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
