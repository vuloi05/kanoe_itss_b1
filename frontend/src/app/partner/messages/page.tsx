"use client";
import PartnerNavbar from "@/components/layout/PartnerNavbar";
import PartnerBottomNav from "@/components/layout/PartnerBottomNav";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const conversations = [
  {name:"Sato Kenji",lastMsg:"Cảm ơn chị! Hẹn gặp lại buổi sau.",time:"11:00",unread:0},
  {name:"Yamamoto Aya",lastMsg:"Em muốn hỏi về thanh điệu...",time:"09:30",unread:3},
  {name:"Takahashi Ryo",lastMsg:"Bài học hôm nay rất hay ạ!",time:"Hôm qua",unread:0},
];
const msgs = [
  {from:"student",text:"Chào chị! Em muốn hỏi về thanh điệu ạ.",time:"09:25"},
  {from:"me",text:"Chào em! Được chứ, em hỏi đi nhé.",time:"09:26"},
  {from:"student",text:"Thanh hỏi và thanh ngã khác nhau thế nào ạ?",time:"09:28"},
  {from:"me",text:"Thanh hỏi đi xuống rồi lên (ˀ). Thanh ngã đi lên rồi bẻ gãy (~). Chị sẽ đọc mẫu nhé!",time:"09:30"},
  {from:"student",text:"Em muốn hỏi về thanh điệu...",time:"09:30"},
];

export default function PartnerMessagesPage() {
  const [activeConv, setActiveConv] = useState(1);
  const { t } = useLanguage();
  return (
    <div className="bg-background text-on-background font-body min-h-screen pb-20 md:pb-0">
      <PartnerNavbar />
      <main className="max-w-6xl mx-auto flex h-[calc(100vh-64px)]">
        <div className="w-80 border-r border-surface-container-high bg-surface-container-lowest hidden md:flex flex-col">
          <div className="p-4 border-b border-surface-container-high"><h2 className="font-headline font-bold text-primary">{t("Tin nhắn", "メッセージ")}</h2></div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((c,i)=>(
              <button key={i} onClick={()=>setActiveConv(i)} className={`w-full p-4 flex items-center gap-3 hover:bg-surface-container-low transition-colors text-left ${activeConv===i?'bg-surface-container-low border-l-2 border-secondary':''}`}>
                <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-on-secondary-container text-sm">person</span></div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between"><span className="font-bold text-primary text-sm truncate">{c.name}</span><span className="text-[10px] text-on-surface-variant">{c.time}</span></div>
                  <p className="text-xs text-on-surface-variant truncate">{c.lastMsg}</p>
                </div>
                {c.unread>0 && <span className="w-5 h-5 bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center">{c.unread}</span>}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-surface-container-high flex items-center gap-3"><div className="w-8 h-8 bg-secondary-container rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-on-secondary-container text-sm">person</span></div><span className="font-headline font-bold text-primary">{conversations[activeConv].name}</span></div>
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {msgs.map((m,i)=>(
              <div key={i} className={`flex ${m.from==='me'?'justify-end':'justify-start'}`}>
                <div className={`max-w-xs px-4 py-3 rounded-2xl text-sm ${m.from==='me'?'bg-secondary text-on-secondary rounded-br-sm':'bg-surface-container-low text-on-surface rounded-bl-sm'}`}>
                  <p>{m.text}</p><span className={`text-[10px] mt-1 block ${m.from==='me'?'text-on-secondary/60 text-right':'text-on-surface-variant'}`}>{m.time}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-surface-container-high">
            <div className="flex gap-2"><input className="flex-1 bg-surface-container-low border-none rounded-full py-3 pl-4 pr-10 text-sm focus:ring-2 focus:ring-secondary/50 placeholder:text-outline" placeholder={t("Nhập tin nhắn...", "メッセージを入力...")} type="text"/><button className="w-10 h-10 bg-secondary text-on-secondary rounded-full flex items-center justify-center hover:opacity-90 transition-all"><span className="material-symbols-outlined text-sm">send</span></button></div>
          </div>
        </div>
      </main>
      <PartnerBottomNav />
    </div>
  );
}
