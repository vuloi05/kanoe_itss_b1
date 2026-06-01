"use client";
import LearnerNavbar from "@/components/layout/LearnerNavbar";
import LearnerBottomNav from "@/components/layout/LearnerBottomNav";
import AvatarUploadModal from "@/components/common/AvatarUploadModal";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { authApi } from "@/lib/api";

/**
 * Compute a human-readable relative time string from a UTC ISO date.
 * Returns separate Vietnamese / Japanese strings.
 */
function getRelativeTime(isoDate: string): { vi: string; ja: string } {
  const then = new Date(isoDate).getTime();
  const now = Date.now();
  const diffMs = now - then;

  // Guard against future dates or clock skew
  if (diffMs < 0) return { vi: "Vừa xong", ja: "たった今" };

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return { vi: `${years} năm trước`, ja: `${years}年前` };
  if (months > 0) return { vi: `${months} tháng trước`, ja: `${months}ヶ月前` };
  if (days > 0) return { vi: `${days} ngày trước`, ja: `${days}日前` };
  if (hours > 0) return { vi: `${hours} giờ trước`, ja: `${hours}時間前` };
  if (minutes > 0) return { vi: `${minutes} phút trước`, ja: `${minutes}分前` };
  return { vi: "Vừa xong", ja: "たった今" };
}

export default function LearnerSettingsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { logout, user, updateUser } = useAuth();
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const currentLevel = user?.currentLevel ?? "V1";

  const [passwordChangedLabel, setPasswordChangedLabel] = useState<{ vi: string; ja: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    authApi.getProfile()
      .then((profile) => {
        if (cancelled) return;

        // Sync fresh profile into auth context so currentLevel is accurate
        updateUser(profile);

        if (profile.passwordChangedAt) {
          setPasswordChangedLabel(getRelativeTime(profile.passwordChangedAt));
        }
      })
      .catch(() => {
        // Silently fail – the label will show fallback text
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const passwordSubtext = passwordChangedLabel
    ? t(`Thay đổi lần cuối ${passwordChangedLabel.vi}`, `最終変更: ${passwordChangedLabel.ja}`)
    : t("Chưa từng đổi mật khẩu", "パスワード未変更");

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
                <Image
                  src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || "User"}&backgroundColor=c0aede`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  width={120}
                  height={120}
                  unoptimized
                />
              </div>
              <button
                onClick={() => setShowAvatarModal(true)}
                className="absolute -bottom-3 -right-3 w-10 h-10 bg-[#112340] hover:bg-[#1E3A8A] text-white rounded-full flex items-center justify-center transition-colors shadow-lg border-2 border-white dark:border-slate-900"
              >
                <span className="material-symbols-outlined text-[20px]">edit</span>
              </button>
            </div>
            
            <div className="flex-1 space-y-6">
              <div>
                <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                  {t("HỌ VÀ TÊN", "氏名")}
                </p>
                <h2 className="text-[24px] font-extrabold text-[#112340] dark:text-white">
                  {user?.displayName || "Loading..."}
                </h2>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                  {t("EMAIL", "メール")}
                </p>
                <p className="text-[#334155] dark:text-slate-300 text-[15px]">{user?.email || "Loading..."}</p>
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
                {[
                  { id: "v1", label: "V1", subtitle: t("Basic", "ビギナー") },
                  { id: "v2", label: "V2", subtitle: t("Inter", "中級") },
                  { id: "v3", label: "V3", subtitle: t("Adv", "上級") },
                ].map((levelOption) => {
                  const isActive = currentLevel.toLowerCase() === levelOption.id;
                  return (
                    <button
                      key={levelOption.id}
                      type="button"
                      className={`py-3 px-2 rounded-xl flex flex-col items-center justify-center transition-colors shadow-sm ${
                        isActive
                          ? "bg-[#112340] text-white shadow-md"
                          : "bg-white dark:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-[#112340] dark:text-white"
                      }`}
                    >
                      <span className={`font-bold text-[15px] ${isActive ? "" : "text-[#112340] dark:text-white"}`}>
                        {levelOption.label}
                      </span>
                      <span className={`text-[11px] ${isActive ? "text-blue-200" : "text-[#94A3B8]"}`}>
                        {levelOption.subtitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-[13px] font-medium text-[#64748B] dark:text-slate-400">Hanoi Dialect Mastery</span>
                <span className="text-[15px] font-bold text-[#112340] dark:text-white">{user?.masteryPercentage ?? 0}%</span>
              </div>
              <div className="h-2 w-full bg-[#E2E8F0] dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-[#112340] dark:bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${user?.masteryPercentage ?? 0}%` }}></div>
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
                  <span className="text-[28px] font-extrabold text-[#112340] dark:text-white leading-tight">{user?.currentStreak ?? 0}</span>
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wide mt-1">DAYSSTREAK</span>
                  <span className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">{t("Chuỗi ngày", "継続日数")}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm flex flex-col justify-center">
                  <span className="text-[28px] font-extrabold text-[#112340] dark:text-white leading-tight">{user?.learnedVocabCount ?? 0}</span>
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wide mt-1">VOCAB</span>
                  <span className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">{t("Từ vựng", "単語数")}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm flex flex-col justify-center">
                  <span className="text-[28px] font-extrabold text-[#112340] dark:text-white leading-tight">{user?.averageToneAccuracy ?? 0}%</span>
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wide mt-1">TONE ACC.</span>
                  <span className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">{t("Phát âm", "声調精度")}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm flex flex-col justify-center">
                  <span className="text-[28px] font-extrabold text-[#112340] dark:text-white leading-tight">{user?.totalStudyHours ?? 0}</span>
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wide mt-1">HOURS</span>
                  <span className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">{t("Thời gian", "学習時間")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Right: Actions */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Link href="/learner/wallet" className="flex items-center p-6 bg-white dark:bg-slate-900 rounded-[24px] shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-800 transition-all group cursor-pointer">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-yellow-50 dark:from-amber-900/40 dark:to-yellow-900/20 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-105 transition-transform">
                <span className="text-[28px]">🪙</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#112340] dark:text-white text-[16px] mb-1 group-hover:text-primary transition-colors">
                  {t("Ví Token", "トークンウォレット")}
                </h3>
                <p className="text-[12px] text-[#94A3B8]">{t("Xem số dư & lịch sử giao dịch", "残高と取引履歴を確認")}</p>
              </div>
              <span className="material-symbols-outlined text-[#CBD5E1] group-hover:text-[#94A3B8] transition-colors">chevron_right</span>
            </Link>

            <Link href="/change-password" className="flex items-center p-6 bg-white dark:bg-slate-900 rounded-[24px] shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-800 transition-all group cursor-pointer">
              <div className="w-14 h-14 bg-[#FDE68A] text-[#B45309] rounded-2xl flex items-center justify-center mr-6 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[28px]">lock</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#112340] dark:text-white text-[16px] mb-1 group-hover:text-primary transition-colors">
                  {t("Đổi mật khẩu", "パスワード変更")}
                </h3>
                <p className="text-[12px] text-[#94A3B8]">{passwordSubtext}</p>
              </div>
              <span className="material-symbols-outlined text-[#CBD5E1] group-hover:text-[#94A3B8] transition-colors">chevron_right</span>
            </Link>

            <button onClick={()=>{ logout(); router.push("/login"); }} className="flex items-center p-6 bg-[#FFE4E6] dark:bg-rose-950/30 rounded-[24px] shadow-sm hover:shadow-md hover:bg-[#FECDD3] dark:hover:bg-rose-900/40 border border-rose-100 dark:border-rose-900/50 transition-all group text-left">
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

      {/* Avatar Upload Modal */}
      <AvatarUploadModal
        open={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        onSuccess={(avatarUrl) => updateUser({ avatarUrl })}
        currentAvatarUrl={user?.avatarUrl}
      />
    </div>
  );
}