"use client";
import PartnerNavbar from "@/components/layout/PartnerNavbar";
import PartnerBottomNav from "@/components/layout/PartnerBottomNav";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PartnerHomePage() {
  const { t } = useLanguage();
  return (
    <div className="bg-background text-on-background font-body min-h-screen pb-20 md:pb-0">
      <PartnerNavbar />
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome */}
        <div className="bg-secondary p-8 rounded-3xl text-on-secondary">
          <p className="text-sm text-on-secondary/70 uppercase tracking-widest font-bold mb-2">{t("Xin chào đối tác", "パートナーさんへ")}</p>
          <h1 className="font-headline text-3xl font-extrabold mb-4">{t("Quản lý buổi học của bạn", "セッションを管理する")}</h1>
          <p className="text-on-secondary/80 text-sm max-w-md mb-6">{t("Kiểm tra các buổi học hôm nay và quản lý việc tương tác với học viên.", "今日のセッションを確認し、学習者との交流を管理しましょう。")}</p>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{label:t("Học viên", "学習者"),val:"8",icon:"people"},{label:t("Buổi học", "セッション"),val:"24",icon:"event"},{label:t("Đánh giá", "評価"),val:"4.9★",icon:"star"},{label:t("Thu nhập", "収入(VND)"),val:"2.4M",icon:"payments"}].map(s=>(
            <div key={s.label} className="bg-surface-container-lowest p-5 rounded-2xl text-center shadow-sm">
              <span className="material-symbols-outlined text-secondary text-2xl mb-2">{s.icon}</span>
              <span className="block text-2xl font-headline font-extrabold text-primary">{s.val}</span>
              <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-1">{s.label}</span>
            </div>
          ))}
        </div>
        {/* Upcoming sessions */}
        <div>
          <h2 className="font-headline font-bold text-xl text-primary mb-4">{t("Buổi học sắp tới", "予定されたセッション")}</h2>
          <div className="space-y-3">
            {[{name:"Sato Kenji",time:"14:00 - 15:00",topic:"Bài 4: Tại quán bún chả"},{name:"Yamamoto Aya",time:"16:00 - 17:00",topic:"Bài 2: Đi chợ Đồng Xuân"}].map((s,i)=>(
              <div key={i} className="bg-surface-container-lowest p-5 rounded-2xl flex items-center justify-between shadow-sm border border-surface-container-high/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-on-primary-container">person</span></div>
                  <div><h3 className="font-bold text-primary">{s.name}</h3><p className="text-sm text-on-surface-variant">{s.topic}</p></div>
                </div>
                <div className="text-right"><span className="text-sm font-bold text-secondary">{s.time}</span><br/><span className="text-[10px] text-on-surface-variant">{t("Hôm nay", "今日")}</span></div>
              </div>
            ))}
          </div>
        </div>
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/partner/messages" className="bg-surface-container-low p-6 rounded-2xl hover:shadow-lg transition-all group flex items-center gap-4">
            <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">chat</span>
            <div><h3 className="font-headline font-bold text-primary">{t("Tin nhắn", "メッセージ")}</h3><p className="text-sm text-on-surface-variant">{t("Liên hệ với học viên", "学習者と連絡する")}</p></div>
          </Link>
          <Link href="/partner/settings" className="bg-surface-container-low p-6 rounded-2xl hover:shadow-lg transition-all group flex items-center gap-4">
            <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">settings</span>
            <div><h3 className="font-headline font-bold text-primary">{t("Cài đặt", "設定")}</h3><p className="text-sm text-on-surface-variant">{t("Quản lý tài khoản đối tác", "パートナーアカウントを管理する")}</p></div>
          </Link>
        </div>
      </main>
      <PartnerBottomNav />
    </div>
  );
}
