"use client";
import LearnerNavbar from "@/components/layout/LearnerNavbar";
import LearnerBottomNav from "@/components/layout/LearnerBottomNav";
import Link from "next/link";

const lessons = [
  {id:1,title:"Tại quán phở",jp:"フォー屋で",level:"A1",progress:100,icon:"ramen_dining"},
  {id:2,title:"Đi chợ Đồng Xuân",jp:"ドンスアン市場で",level:"A1",progress:75,icon:"storefront"},
  {id:3,title:"Gọi xe ôm",jp:"バイクタクシーに乗る",level:"A2",progress:40,icon:"two_wheeler"},
  {id:4,title:"Tại quán bún chả",jp:"ブンチャー屋で",level:"A2",progress:0,icon:"restaurant"},
  {id:5,title:"Hỏi đường phố cổ",jp:"旧市街で道を聞く",level:"B1",progress:0,icon:"map"},
];

export default function LessonsPage() {
  return (
    <div className="bg-background text-on-background font-body min-h-screen pb-20 md:pb-0">
      <LearnerNavbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="font-headline text-3xl font-extrabold text-primary mb-2">Danh sách bài học</h1>
        <p className="text-on-surface-variant mb-8">レッスン一覧 / Chọn bài học để bắt đầu luyện tập</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lessons.map(l=>(
            <div key={l.id} className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all group border border-surface-container-high/50">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-primary-container rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-on-primary-container text-2xl">{l.icon}</span></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1"><span className="text-[10px] font-bold uppercase tracking-widest text-secondary bg-secondary-container px-2 py-0.5 rounded-full">{l.level}</span></div>
                  <h3 className="font-headline font-bold text-primary text-lg">{l.title}</h3>
                  <p className="text-sm text-secondary">{l.jp}</p>
                </div>
              </div>
              <div className="mt-4"><div className="h-1.5 bg-surface-container-low rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full transition-all" style={{width:`${l.progress}%`}}></div></div><p className="text-[10px] text-on-surface-variant mt-1 text-right">{l.progress}% hoàn thành</p></div>
              <Link href={`/learner/lessons/${l.id}`} className="mt-4 w-full py-3 bg-primary text-white rounded-xl font-headline font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2">
                {l.progress>0?"Tiếp tục / 続ける":"Bắt đầu / 始める"}<span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          ))}
        </div>
      </main>
      <LearnerBottomNav />
    </div>
  );
}
