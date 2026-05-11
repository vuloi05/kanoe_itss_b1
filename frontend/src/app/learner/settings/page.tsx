"use client";
import LearnerNavbar from "@/components/layout/LearnerNavbar";
import LearnerBottomNav from "@/components/layout/LearnerBottomNav";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LearnerSettingsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  return (
    <div className="bg-[#FAFAFA] dark:bg-slate-950 text-on-background font-body min-h-screen pb-20 md:pb-0">
      <LearnerNavbar />
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-8 mt-16 md:mt-20">
        
        {/* Header section */}
        <div>
          <h1 className="font-headline text-[32px] font-extrabold text-[#112340] dark:text-blue-100 mb-1">
            {t("Cài đặt", "設定")}
          </h1>
          <p className="text-[#64748B] dark:text-slate-400 text-sm">
            {t("Quản lý hành trình ngôn ngữ của bạn tại Hà Nội.", "ハノイでの言語の旅を管理しましょう。")}
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Top Left: Profile */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-[24px] p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-[120px] h-[120px] rounded-2xl overflow-hidden bg-slate-200">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kenji&backgroundColor=c0aede" alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <button className="absolute -bottom-3 -right-3 w-10 h-10 bg-[#112340] hover:bg-[#1E3A8A] text-white rounded-full flex items-center justify-center transition-colors shadow-lg border-2 border-white dark:border-slate-900">
                <span className="material-symbols-outlined text-[20px]">edit</span>
              </button>
            </div>
            
            <div className="flex-1 space-y-6">
              <div>
                <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                  {t("HỌ VÀ TÊN", "氏名")}
                </p>
                <h2 className="text-[24px] font-extrabold text-[#112340] dark:text-white">Tanaka Yuki</h2>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                  {t("EMAIL", "メール")}
                </p>
                <p className="text-[#334155] dark:text-slate-300 text-[15px]">tanaka.yuki@vietimmerse.com</p>
              </div>
            </div>
          </div>

          {/* Top Right: Level */}
          <div className="lg:col-span-5 bg-[#F8FAFC] dark:bg-slate-900 rounded-[24px] p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="font-headline text-[20px] font-bold text-[#112340] dark:text-white mb-6">
                {t("Trình độ", "レベル")}
              </h3>
              
              <div className="grid grid-cols-3 gap-3 mb-8">
                <button className="py-3 px-2 bg-white dark:bg-slate-800 rounded-xl flex flex-col items-center justify-center border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors shadow-sm">
                  <span className="font-bold text-[#112340] dark:text-white text-[15px]">V1</span>
                  <span className="text-[11px] text-[#94A3B8]">Basic</span>
                </button>
                <button className="py-3 px-2 bg-[#112340] text-white rounded-xl flex flex-col items-center justify-center shadow-md">
                  <span className="font-bold text-[15px]">V2</span>
                  <span className="text-[11px] text-blue-200">Inter</span>
                </button>
                <button className="py-3 px-2 bg-white dark:bg-slate-800 rounded-xl flex flex-col items-center justify-center border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors shadow-sm">
                  <span className="font-bold text-[#112340] dark:text-white text-[15px]">V3</span>
                  <span className="text-[11px] text-[#94A3B8]">Adv</span>
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-[13px] font-medium text-[#64748B] dark:text-slate-400">Hanoi Dialect Mastery</span>
                <span className="text-[15px] font-bold text-[#112340] dark:text-white">64%</span>
              </div>
              <div className="h-2 w-full bg-[#E2E8F0] dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-[#112340] dark:bg-blue-500 rounded-full w-[64%]"></div>
              </div>
            </div>
          </div>

          {/* Bottom Left: Stats */}
          <div className="lg:col-span-7 bg-[#F4F4F5] dark:bg-slate-900 rounded-[24px] p-8 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
            {/* Background decorative shape */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/40 dark:bg-slate-800/40 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <h3 className="font-headline text-[20px] font-bold text-[#112340] dark:text-white mb-1">
                {t("Kết quả học tập", "学習履歴")}
              </h3>
              <p className="text-[#64748B] dark:text-slate-400 text-[13px] mb-8">
                {t("Tóm tắt tiến độ Tones Miền Bắc của bạn.", "Northern Tonesでの進捗の概要。")}
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm flex flex-col justify-center">
                  <span className="text-[28px] font-extrabold text-[#112340] dark:text-white leading-tight">12</span>
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wide mt-1">DAYSSTREAK</span>
                  <span className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">{t("Chuỗi ngày", "継続日数")}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm flex flex-col justify-center">
                  <span className="text-[28px] font-extrabold text-[#112340] dark:text-white leading-tight">840</span>
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wide mt-1">VOCAB</span>
                  <span className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">{t("Từ vựng", "単語数")}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm flex flex-col justify-center">
                  <span className="text-[28px] font-extrabold text-[#112340] dark:text-white leading-tight">92%</span>
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wide mt-1">TONE ACC.</span>
                  <span className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">{t("Phát âm", "声調精度")}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm flex flex-col justify-center">
                  <span className="text-[28px] font-extrabold text-[#112340] dark:text-white leading-tight">24</span>
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wide mt-1">HOURS</span>
                  <span className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">{t("Thời gian", "学習時間")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Right: Actions */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Link href="/change-password" className="flex items-center p-6 bg-white dark:bg-slate-900 rounded-[24px] shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-800 transition-all group cursor-pointer">
              <div className="w-14 h-14 bg-[#FDE68A] text-[#B45309] rounded-2xl flex items-center justify-center mr-6 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[28px]">lock</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#112340] dark:text-white text-[16px] mb-1 group-hover:text-primary transition-colors">
                  {t("Đổi mật khẩu", "パスワード変更")}
                </h3>
                <p className="text-[12px] text-[#94A3B8]">{t("Thay đổi lần cuối 3 tháng trước", "最終変更: 3ヶ月前")}</p>
              </div>
              <span className="material-symbols-outlined text-[#CBD5E1] group-hover:text-[#94A3B8] transition-colors">chevron_right</span>
            </Link>

            <button onClick={()=>router.push("/login")} className="flex items-center p-6 bg-[#FFE4E6] dark:bg-rose-950/30 rounded-[24px] shadow-sm hover:shadow-md hover:bg-[#FECDD3] dark:hover:bg-rose-900/40 border border-rose-100 dark:border-rose-900/50 transition-all group text-left">
              <div className="w-14 h-14 bg-[#FDA4AF] text-[#BE123C] rounded-2xl flex items-center justify-center mr-6 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[28px]">logout</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#9F1239] dark:text-rose-400 text-[16px]">
                  {t("Đăng xuất", "ログアウト")}
                </h3>
              </div>
            </button>
          </div>

        </div>
      </main>
      <LearnerBottomNav />
    </div>
  );
}
