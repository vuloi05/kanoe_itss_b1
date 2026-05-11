"use client";
import PartnerNavbar from "@/components/layout/PartnerNavbar";
import PartnerBottomNav from "@/components/layout/PartnerBottomNav";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PartnerSettingsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  return (
    <div className="bg-background text-on-background font-body min-h-screen pb-20 md:pb-0">
      <PartnerNavbar />
      <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        <h1 className="font-headline text-3xl font-extrabold text-primary mb-2">{t("Cài đặt đối tác", "パートナー設定")}</h1>
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex items-center gap-6">
          <div className="w-20 h-20 bg-secondary-container rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-on-secondary-container text-3xl">person</span></div>
          <div><h2 className="font-headline font-bold text-primary text-xl">Nguyễn Thị Lan</h2><p className="text-sm text-on-surface-variant">lan.nguyen@email.com</p><p className="text-xs text-secondary mt-1">{t("Đối tác", "パートナー")} • Ba Đình, Hà Nội</p></div>
        </div>
        <div className="space-y-2">
          {[
            {icon:"person",label:t("Chỉnh sửa hồ sơ", "プロフィール編集"),href:"#"},
            {icon:"calendar_month",label:t("Lịch trình dạy", "スケジュール管理"),href:"#"},
            {icon:"payments",label:t("Thu nhập & Thanh toán", "収入と支払い"),href:"#"},
            {icon:"notifications",label:t("Thông báo", "通知設定"),href:"#"},
            {icon:"lock",label:t("Đổi mật khẩu", "パスワード変更"),href:"/change-password"},
            {icon:"help",label:t("Trung tâm hỗ trợ", "ヘルプセンター"),href:"#"},
          ].map(item=>(
            <Link key={item.label} href={item.href} className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-container-low transition-all group">
              <div className="w-10 h-10 bg-surface-container-low rounded-xl flex items-center justify-center group-hover:bg-secondary group-hover:text-on-secondary transition-colors"><span className="material-symbols-outlined text-on-surface-variant group-hover:text-on-secondary">{item.icon}</span></div>
              <span className="flex-1 font-medium text-on-surface">{item.label}</span>
              <span className="material-symbols-outlined text-outline-variant text-sm">chevron_right</span>
            </Link>
          ))}
        </div>
        <button onClick={()=>router.push("/login")} className="w-full flex items-center justify-center gap-2 p-4 text-error font-bold hover:bg-error-container rounded-xl transition-all">
          <span className="material-symbols-outlined">logout</span>{t("Đăng xuất", "ログアウト")}
        </button>
      </main>
      <PartnerBottomNav />
    </div>
  );
}
