"use client";
import LearnerNavbar from "@/components/layout/LearnerNavbar";
import LearnerBottomNav from "@/components/layout/LearnerBottomNav";
import Link from "next/link";

export default function LessonDetailPage() {
  return (
    <div className="bg-background text-on-background font-body min-h-screen pb-24">
      <LearnerNavbar />
      <main className="pt-4 px-4 md:px-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-surface-container-lowest rounded-3xl p-8 relative overflow-hidden">
            <span className="text-secondary font-label tracking-widest uppercase text-xs">Scene 04 • Level A2</span>
            <h2 className="text-3xl font-headline font-extrabold text-primary mt-2 mb-1">At a Bun Cha Stall</h2>
            <p className="text-on-surface-variant italic">Bún Chả屋で / Bun Cha-ya de</p>
          </div>
          <div className="space-y-4">
            <div className="flex justify-end mb-4 gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-full hover:opacity-90 transition-all shadow-sm active:scale-95"><span className="material-symbols-outlined text-sm">visibility_off</span><span className="text-[10px] font-bold uppercase tracking-wider">Bật/Tắt phụ đề</span></button>
            </div>
            {/* Dialogue */}
            <div className="bg-surface-container-low rounded-xl p-6 hover:bg-surface-container transition-all">
              <div className="flex justify-between items-start mb-2"><span className="font-bold text-primary text-xs tracking-tighter">BÁN HÀNG / 店員</span><span className="material-symbols-outlined text-outline-variant text-sm">volume_up</span></div>
              <p className="text-lg text-primary font-medium">Em ơi, em dùng bún chả hay bún nem?</p>
              <p className="text-sm text-secondary mt-1">お姉さん、ブンチャーにしますか、それともブンネムにしますか？</p>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-6 ring-2 ring-primary ring-offset-4 ring-offset-background shadow-sm">
              <div className="flex justify-between items-start mb-2"><span className="font-bold text-primary text-xs tracking-tighter">BẠN / あなた (Active)</span><span className="material-symbols-outlined text-primary text-sm" style={{fontVariationSettings:"'FILL' 1"}}>volume_up</span></div>
              <div className="flex flex-wrap gap-x-2 items-end">
                {["Cho","em","một","suất","bún","chả","nhé."].map((w,i)=>(<div key={i} className="group relative"><span className="text-xs text-on-surface-variant block text-center opacity-60">{w.replace(".","")}</span><span className={`text-2xl font-headline font-bold text-primary ${i===3?"underline decoration-secondary decoration-2 underline-offset-8":""} ${i===5?"underline decoration-error decoration-2 underline-offset-8":""}`}>{w}</span></div>))}
              </div>
              <p className="text-sm text-secondary mt-4">ブンチャーを一つください。</p>
            </div>
            <div className="bg-surface-container-low rounded-xl p-6 opacity-60">
              <span className="font-bold text-primary text-xs tracking-tighter">BÁN HÀNG / 店員</span>
              <p className="text-lg text-primary font-medium mt-2">Có ngay! Đợi chị một chút.</p>
              <p className="text-sm text-secondary mt-1">すぐ行きます！ちょっと待ってね。</p>
            </div>
          </div>
          <Link href="/learner/lessons" className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors font-medium"><span className="material-symbols-outlined text-sm">arrow_back</span>Quay lại danh sách bài học</Link>
        </div>
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-primary-container text-on-primary rounded-3xl p-8 shadow-xl relative overflow-hidden min-h-[400px] flex flex-col justify-between">
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8"><div><h3 className="font-headline font-bold text-xl text-on-primary-container">Voice Lab</h3><p className="text-xs text-on-primary-container/80 tracking-widest uppercase">Shadowing Active</p></div><div className="bg-surface-container-lowest/10 px-3 py-1 rounded-full text-xs font-bold border border-on-primary-container/20">AI v2.4</div></div>
              <div className="flex items-center justify-center gap-1.5 h-32 px-4">
                {[30,60,45,80,20,55,75,40,65,30,90,50,35].map((h,i)=>(<div key={i} className="waveform-bar w-1.5 rounded-full" style={{animationDelay:`${i*0.1}s`,height:`${h}%`,backgroundColor:i%2===0?'var(--on-primary-container)':'var(--secondary-fixed)'}}></div>))}
              </div>
              <p className="mt-8 text-center text-sm text-on-primary-container/90">Analyzing Pitch & Nasality...</p>
            </div>
            <div className="relative z-10 flex items-center justify-center gap-8 mt-4">
              <button className="w-12 h-12 rounded-full border border-on-primary-container/30 flex items-center justify-center hover:bg-on-primary-container/10 transition-colors"><span className="material-symbols-outlined text-on-primary-container">replay</span></button>
              <button className="w-20 h-20 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95"><span className="material-symbols-outlined text-4xl" style={{fontVariationSettings:"'FILL' 1"}}>mic</span></button>
              <button className="w-12 h-12 rounded-full border border-on-primary-container/30 flex items-center justify-center hover:bg-on-primary-container/10 transition-colors"><span className="material-symbols-outlined text-on-primary-container">play_arrow</span></button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[{val:"82%",label:"Accuracy",jp:"精度"},{val:"7.5",label:"Fluency",jp:"流暢さ"},{val:"90%",label:"Completeness",jp:"完成度"},{val:"68%",label:"Prosody",jp:"韻律"}].map(s=>(<div key={s.label} className="bg-surface-container-lowest p-5 rounded-3xl text-center shadow-sm"><span className="block text-2xl font-headline font-extrabold text-primary">{s.val}</span><span className="block text-[10px] font-bold text-primary uppercase tracking-wider">{s.label}</span><span className="block text-[10px] text-secondary">{s.jp}</span></div>))}
          </div>
        </div>
      </main>
      <LearnerBottomNav />
    </div>
  );
}
