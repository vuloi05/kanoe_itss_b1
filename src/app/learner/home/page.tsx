"use client";
import LearnerNavbar from "@/components/layout/LearnerNavbar";
import LearnerBottomNav from "@/components/layout/LearnerBottomNav";
import Link from "next/link";

export default function LearnerHomePage() {
  return (
    <div className="bg-background text-on-background font-body min-h-screen pb-20 md:pb-0">
      <LearnerNavbar />
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome */}
        <div className="bg-primary p-8 rounded-3xl text-on-primary">
          <p className="text-sm text-on-primary-container/80 uppercase tracking-widest font-bold mb-2">Chào mừng trở lại / おかえりなさい</p>
          <h1 className="font-headline text-3xl font-extrabold mb-4">Sẵn sàng luyện tập hôm nay?</h1>
          <p className="text-on-primary-container text-sm max-w-md mb-6">今日もハノイ方言のリスニングを鍛えましょう。前回の続きから始められます。</p>
          <Link href="/learner/lessons" className="inline-flex items-center gap-2 bg-secondary text-on-secondary px-6 py-3 rounded-xl font-headline font-bold hover:opacity-90 transition-all">Tiếp tục học / 学習を続ける<span className="material-symbols-outlined text-sm">arrow_forward</span></Link>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{label:"Chuỗi ngày",val:"12",sub:"日連続",icon:"local_fire_department"},{label:"Bài đã học",val:"24",sub:"レッスン完了",icon:"menu_book"},{label:"Độ chính xác",val:"85%",sub:"精度",icon:"target"},{label:"Giờ luyện tập",val:"36h",sub:"練習時間",icon:"schedule"}].map(s=>(
            <div key={s.label} className="bg-surface-container-lowest p-5 rounded-2xl text-center shadow-sm">
              <span className="material-symbols-outlined text-primary text-2xl mb-2">{s.icon}</span>
              <span className="block text-2xl font-headline font-extrabold text-primary">{s.val}</span>
              <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{s.label}</span>
              <span className="block text-[10px] text-secondary">{s.sub}</span>
            </div>
          ))}
        </div>
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/learner/lessons" className="bg-surface-container-low p-6 rounded-2xl hover:shadow-lg transition-all group">
            <span className="material-symbols-outlined text-primary text-3xl mb-4 group-hover:scale-110 transition-transform block">menu_book</span>
            <h3 className="font-headline font-bold text-primary mb-1">Bài học / レッスン</h3>
            <p className="text-sm text-on-surface-variant">Tiếp tục các bài học listening của bạn</p>
          </Link>
          <Link href="/learner/matching" className="bg-surface-container-low p-6 rounded-2xl hover:shadow-lg transition-all group">
            <span className="material-symbols-outlined text-primary text-3xl mb-4 group-hover:scale-110 transition-transform block">group</span>
            <h3 className="font-headline font-bold text-primary mb-1">Ghép cặp / マッチング</h3>
            <p className="text-sm text-on-surface-variant">Tìm đối tác luyện tập phù hợp</p>
          </Link>
          <Link href="/learner/messages" className="bg-surface-container-low p-6 rounded-2xl hover:shadow-lg transition-all group">
            <span className="material-symbols-outlined text-primary text-3xl mb-4 group-hover:scale-110 transition-transform block">chat</span>
            <h3 className="font-headline font-bold text-primary mb-1">Tin nhắn / メッセージ</h3>
            <p className="text-sm text-on-surface-variant">Liên hệ với đối tác của bạn</p>
          </Link>
        </div>
      </main>
      <LearnerBottomNav />
    </div>
  );
}
