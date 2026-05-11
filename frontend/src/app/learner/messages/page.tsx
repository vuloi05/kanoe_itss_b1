"use client";
import LearnerNavbar from "@/components/layout/LearnerNavbar";
import LearnerBottomNav from "@/components/layout/LearnerBottomNav";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const conversations = [
  {name:"Nguyễn Thị Lan",lastMsg:"Hôm nay mình luyện đoạn hội thoại mới nhé!",time:"10:30",unread:2},
  {name:"Trần Văn Minh",lastMsg:"Bạn phát âm tốt lắm rồi đó 👍",time:"Hôm qua",unread:0},
];
const messages = [
  {from:"partner",text:"Chào bạn! Hôm nay mình luyện bài gì nhỉ?",time:"10:25"},
  {from:"me",text:"Chào chị Lan! Mình muốn luyện bài Bún Chả ạ.",time:"10:26"},
  {from:"partner",text:"Tuyệt! Bắt đầu nhé. Chị sẽ đọc trước, bạn nghe rồi nói theo.",time:"10:28"},
  {from:"partner",text:"\"Em ơi, em dùng bún chả hay bún nem?\"",time:"10:29"},
  {from:"me",text:"\"Cho em một suất bún chả nhé.\"",time:"10:30"},
  {from:"partner",text:"Hôm nay mình luyện đoạn hội thoại mới nhé!",time:"10:30"},
];

export default function LearnerMessagesPage() {
  const [activeConv, setActiveConv] = useState(0);
  const { t } = useLanguage();
  return (
    <div className="bg-background text-on-background font-body min-h-screen pb-20 md:pb-0">
      <LearnerNavbar />
      <main className="max-w-6xl mx-auto flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div className="w-80 border-r border-surface-container-high bg-surface-container-lowest hidden md:flex flex-col">
          <div className="p-4 border-b border-surface-container-high"><h2 className="font-headline font-bold text-primary">{t("Tin nhắn", "メッセージ")}</h2></div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((c,i)=>(
              <button key={i} onClick={()=>setActiveConv(i)} className={`w-full p-4 flex items-center gap-3 hover:bg-surface-container-low transition-colors text-left ${activeConv===i?'bg-surface-container-low border-l-2 border-primary':''}`}>
                <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-on-primary-container text-sm">person</span></div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between"><span className="font-bold text-primary text-sm truncate">{c.name}</span><span className="text-[10px] text-on-surface-variant">{c.time}</span></div>
                  <p className="text-xs text-on-surface-variant truncate">{c.lastMsg}</p>
                </div>
                {c.unread>0 && <span className="w-5 h-5 bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center">{c.unread}</span>}
              </button>
            ))}
          </div>
        </div>
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-surface-container-high flex items-center gap-3"><div className="w-8 h-8 bg-primary-container rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-on-primary-container text-sm">person</span></div><span className="font-headline font-bold text-primary">{conversations[activeConv].name}</span></div>
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((m,i)=>(
              <div key={i} className={`flex ${m.from==='me'?'justify-end':'justify-start'}`}>
                <div className={`max-w-xs px-4 py-3 rounded-2xl text-sm ${m.from==='me'?'bg-primary text-on-primary rounded-br-sm':'bg-surface-container-low text-on-surface rounded-bl-sm'}`}>
                  <p>{m.text}</p><span className={`text-[10px] mt-1 block ${m.from==='me'?'text-on-primary/60 text-right':'text-on-surface-variant'}`}>{m.time}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-surface-container-high">
            <div className="flex gap-2"><input className="flex-1 bg-surface-container-low border-none rounded-full py-3 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary/50 placeholder:text-outline" placeholder={t("Nhập tin nhắn...", "メッセージを入力...")} type="text"/><button className="w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center hover:opacity-90 transition-all"><span className="material-symbols-outlined text-sm">send</span></button></div>
          </div>
        </div>
      </main>
      <LearnerBottomNav />
    </div>
  );
}
