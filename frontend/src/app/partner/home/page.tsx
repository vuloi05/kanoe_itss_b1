"use client";
import PartnerNavbar from "@/components/layout/PartnerNavbar";
import PartnerBottomNav from "@/components/layout/PartnerBottomNav";
import Link from "next/link";

export default function PartnerHomePage() {
  return (
    <div className="bg-background text-on-background font-body min-h-screen pb-20 md:pb-0">
      <PartnerNavbar />
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome */}
        <div className="bg-secondary p-8 rounded-3xl text-on-secondary">
          <p className="text-sm text-on-secondary/70 uppercase tracking-widest font-bold mb-2">Xin chào đối tác / パートナーさんへ</p>
          <h1 className="font-headline text-3xl font-extrabold mb-4">Quản lý buổi học của bạn</h1>
          <p className="text-on-secondary/80 text-sm max-w-md mb-6">今日のセッションを確認し、学習者との交流を管理しましょう。</p>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{label:"Học viên",val:"8",sub:"学習者",icon:"people"},{label:"Buổi học",val:"24",sub:"セッション",icon:"event"},{label:"Đánh giá",val:"4.9★",sub:"評価",icon:"star"},{label:"Thu nhập",val:"2.4M",sub:"収入(VND)",icon:"payments"}].map(s=>(
            <div key={s.label} className="bg-surface-container-lowest p-5 rounded-2xl text-center shadow-sm">
              <span className="material-symbols-outlined text-secondary text-2xl mb-2">{s.icon}</span>
              <span className="block text-2xl font-headline font-extrabold text-primary">{s.val}</span>
              <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{s.label}</span>
              <span className="block text-[10px] text-secondary">{s.sub}</span>
            </div>
          ))}
        </div>
        {/* Upcoming sessions */}
        <div>
          <h2 className="font-headline font-bold text-xl text-primary mb-4">Buổi học sắp tới / 予定されたセッション</h2>
          <div className="space-y-3">
            {[{name:"Sato Kenji",time:"14:00 - 15:00",topic:"Bài 4: Tại quán bún chả"},{name:"Yamamoto Aya",time:"16:00 - 17:00",topic:"Bài 2: Đi chợ Đồng Xuân"}].map((s,i)=>(
              <div key={i} className="bg-surface-container-lowest p-5 rounded-2xl flex items-center justify-between shadow-sm border border-surface-container-high/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-on-primary-container">person</span></div>
                  <div><h3 className="font-bold text-primary">{s.name}</h3><p className="text-sm text-on-surface-variant">{s.topic}</p></div>
                </div>
                <div className="text-right"><span className="text-sm font-bold text-secondary">{s.time}</span><br/><span className="text-[10px] text-on-surface-variant">Hôm nay</span></div>
              </div>
            ))}
          </div>
        </div>
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/partner/messages" className="bg-surface-container-low p-6 rounded-2xl hover:shadow-lg transition-all group flex items-center gap-4">
            <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">chat</span>
            <div><h3 className="font-headline font-bold text-primary">Tin nhắn / メッセージ</h3><p className="text-sm text-on-surface-variant">Liên hệ với học viên</p></div>
          </Link>
          <Link href="/partner/settings" className="bg-surface-container-low p-6 rounded-2xl hover:shadow-lg transition-all group flex items-center gap-4">
            <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">settings</span>
            <div><h3 className="font-headline font-bold text-primary">Cài đặt / 設定</h3><p className="text-sm text-on-surface-variant">Quản lý tài khoản đối tác</p></div>
          </Link>
        </div>
      </main>
      <PartnerBottomNav />
    </div>
  );
}
