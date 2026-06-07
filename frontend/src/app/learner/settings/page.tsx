"use client";
import LearnerNavbar from "@/components/layout/LearnerNavbar";
import LearnerBottomNav from "@/components/layout/LearnerBottomNav";
import AvatarUploadModal from "@/components/common/AvatarUploadModal";
import TopUpTokenModal from "@/components/common/TopUpTokenModal";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { authApi, matchingApi, paymentApi, type CreatePaymentLinkResponse } from "@/lib/api";
import PaymentCheckoutModal from "@/components/common/PaymentCheckoutModal";
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
  const [showTopUp, setShowTopUp] = useState(false);
  const [showPaymentCheckout, setShowPaymentCheckout] = useState(false);
  const [paymentData, setPaymentData] = useState<CreatePaymentLinkResponse | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);

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

    matchingApi.getBalance()
      .then((data) => {
        if (!cancelled) setTokenBalance(data.tokenBalance);
      })
      .catch(() => {
        // Fallback: balance stays null
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

        {/* Bento Grid Layout — matches legacy design */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Row 1 Left: Profile */}
          <section className="md:col-span-7 bg-white dark:bg-slate-900 rounded-xl p-8 flex flex-col sm:flex-row items-center gap-8 border-none transition-all duration-300">
            <div className="relative group">
              <div className="w-[120px] h-[120px] rounded-full overflow-hidden bg-slate-200">
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
                className="absolute bottom-0 right-0 w-9 h-9 bg-[#112340] hover:bg-[#1E3A8A] text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
            </div>
            
            <div className="flex-1 space-y-4 w-full">
              <div>
                <label className="block text-xs text-[#44474d] dark:text-slate-400 uppercase tracking-widest mb-1">
                  {t("HỌ VÀ TÊN", "氏名")}
                </label>
                <h2 className="text-xl font-headline font-bold text-[#112340] dark:text-white">
                  {user?.displayName || "Loading..."}
                </h2>
              </div>
              <div>
                <label className="block text-xs text-[#44474d] dark:text-slate-400 uppercase tracking-widest mb-1">
                  {t("EMAIL", "メール")}
                </label>
                <p className="text-[#334155] dark:text-slate-300 text-[15px]">{user?.email || "Loading..."}</p>
              </div>
            </div>
          </section>

          {/* Row 1 Right: Level */}
          <section className="md:col-span-5 bg-[#f4f4f2] dark:bg-slate-900 rounded-xl p-8 space-y-6">
            <h3 className="font-headline text-xl font-bold text-[#112340] dark:text-white">
              {t("Trình độ", "レベル")}
            </h3>
            
            <div className="grid grid-cols-3 gap-2">
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
                    className={`flex flex-col items-center justify-center p-3 rounded-xl font-bold transition-all ${
                      isActive
                        ? "bg-[#112340] text-white shadow-md"
                        : "bg-white dark:bg-slate-800 text-[#64748B] hover:bg-[#112340]/10 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span className="text-xs">{levelOption.label}</span>
                    <span className={`text-[10px] ${isActive ? "opacity-80" : "opacity-60"}`}>
                      {levelOption.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>

            <div>
              <div className="pt-4 border-t border-slate-200/40 dark:border-slate-700/40" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#715a3e] dark:text-slate-400">Hanoi Dialect Mastery</span>
                <span className="font-headline font-bold text-[#09294f] dark:text-white">{user?.masteryPercentage ?? 0}%</span>
              </div>
              <div className="w-full h-2 bg-[#e2e3e1] dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${user?.masteryPercentage ?? 0}%`,
                    background: "linear-gradient(135deg, #09294f 0%, #243f67 100%)",
                  }}
                />
              </div>
            </div>
          </section>

          {/* Row 2 Left: Learning Stats */}
          <section className="md:col-span-8 bg-[#f4f4f2] dark:bg-slate-900 rounded-xl p-8 relative overflow-hidden">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="mb-8">
                <h3 className="font-headline text-xl font-bold text-[#09294f] dark:text-white mb-2">
                  {t("Kết quả học tập", "学習履歴")}
                </h3>
                <p className="text-sm text-[#715a3e] dark:text-slate-400">
                  {t("Tóm tắt tiến độ Tones Miền Bắc của bạn.", "Northern Tonesでの進捗の概要。")}
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl">
                  <span className="block text-2xl font-bold text-[#09294f] dark:text-white">{user?.currentStreak ?? 0}</span>
                  <span className="block text-xs text-[#715a3e] font-label uppercase tracking-tighter leading-tight">
                    {t("DAYSSTREAK", "DAYSSTREAK")}<br />{t("Chuỗi ngày", "継続日数")}
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl">
                  <span className="block text-2xl font-bold text-[#09294f] dark:text-white">{user?.learnedVocabCount ?? 0}</span>
                  <span className="block text-xs text-[#715a3e] font-label uppercase tracking-tighter leading-tight">
                    {t("VOCAB", "VOCAB")}<br />{t("Từ vựng", "単語数")}
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl">
                  <span className="block text-2xl font-bold text-[#09294f] dark:text-white">{user?.averageToneAccuracy ?? 0}%</span>
                  <span className="block text-xs text-[#715a3e] font-label uppercase tracking-tighter leading-tight">
                    {t("TONE ACC.", "TONE ACC.")}<br />{t("Phát âm", "声調精度")}
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl">
                  <span className="block text-2xl font-bold text-[#09294f] dark:text-white">{(user?.totalStudyHours ?? 0).toFixed(1)}</span>
                  <span className="block text-xs text-[#715a3e] font-label uppercase tracking-tighter leading-tight">
                    {t("HOURS", "HOURS")}<br />{t("Giờ học", "学習時間")}
                  </span>
                </div>
              </div>
            </div>

            {/* Decorative subtle background */}
            <div className="absolute -right-12 -bottom-12 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-[16rem]">eco</span>
            </div>
          </section>

          {/* Row 2 Right: Token Balance */}
          <section className="md:col-span-4 bg-[#f4f4f2] dark:bg-slate-900 rounded-xl p-8 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="font-headline text-xl font-bold text-[#09294f] dark:text-white mb-2">
                {t("Số dư Token", "トークン残高")}
              </h3>
              <p className="text-sm text-[#715a3e] dark:text-slate-400">
                {t("Số dư ví ảo cho phiên premium.", "プレミアムセッション用の仮想残高。")}
              </p>
            </div>

            <div className="py-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-[#09294f] dark:text-white font-headline">
                  {tokenBalance !== null ? tokenBalance.toLocaleString() : "—"}
                </span>
                <span className="text-lg font-bold text-[#715a3e] font-headline uppercase tracking-wide">Tokens</span>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setShowTopUp(true)}
                className="w-full flex items-center justify-center gap-2 bg-[#09294f] hover:bg-[#243f67] text-white py-3 px-6 rounded-xl font-bold font-headline transition-all shadow-md group"
              >
                <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">add_circle</span>
                <span>{t("Nạp Token", "チャージする")}</span>
              </button>
              <div className="flex items-center gap-2 text-[11px] text-[#715a3e] opacity-60 font-medium">
                <span className="material-symbols-outlined text-sm">info</span>
                <span>{t("1 Token = 1,000 VNĐ", "1トークン = 1,000ドン")}</span>
              </div>
            </div>
          </section>

          {/* Row 3: Security / Actions */}
          <section className="md:col-span-4 space-y-4">
            <Link
              href="/change-password"
              className="block bg-white dark:bg-slate-900 rounded-xl p-6 border border-[#c4c6cd]/10 dark:border-slate-800 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-4 cursor-pointer">
                <div className="p-2 rounded-lg bg-[#fdddb9] text-[#786044]">
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-headline font-bold text-[#09294f] dark:text-white text-sm">
                    {t("Đổi mật khẩu", "パスワード変更")}
                  </h4>
                  <p className="text-[10px] text-[#715a3e]">{passwordSubtext}</p>
                </div>
                <span className="material-symbols-outlined text-[#715a3e] opacity-40 group-hover:translate-x-1 transition-transform">chevron_right</span>
              </div>
            </Link>

            <button
              onClick={() => { logout(); router.push("/login"); }}
              className="w-full bg-[#ffdad6] dark:bg-rose-950/30 rounded-xl p-6 hover:shadow-sm transition-all group cursor-pointer text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-[#93000a]/10 text-[#ba1a1a]">
                  <span className="material-symbols-outlined">logout</span>
                </div>
                <div className="flex-1 text-[#93000a] dark:text-rose-400 font-headline font-bold text-sm">
                  {t("Đăng xuất", "ログアウト")}
                </div>
              </div>
            </button>
          </section>
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

      {/* Top-up Token Modal */}
      <TopUpTokenModal
        isOpen={showTopUp}
        tokenBalance={tokenBalance ?? 0}
        onClose={() => setShowTopUp(false)}
        onConfirm={async (amount, method, discountCode) => {
          if (method === "bank_transfer") {
            try {
              const res = await paymentApi.createPaymentLink(amount, method, discountCode);
              if (res.isFree) {
                const newBalance = await matchingApi.getBalance();
                setTokenBalance(newBalance.tokenBalance);
                alert(res.message || "Áp dụng mã thành công!");
              } else if (res.qrCode) {
                setPaymentData(res);
                setShowPaymentCheckout(true);
              } else if (res.checkoutUrl) {
                window.location.href = res.checkoutUrl;
              }
            } catch (err) {
              console.error("Lỗi khi tạo payment link:", err);
              alert("Có lỗi xảy ra khi tạo link thanh toán.");
            }
          } else {
            console.log(`Top-up: ${amount} tokens via ${method}`);
            alert(t(`Đã gửi yêu cầu nạp ${amount} tokens qua ${method}`, `${method}経由で${amount}トークンのチャージをリクエストしました`));
          }
          setShowTopUp(false);
        }}
      />

      {/* Payment Checkout Modal */}
      <PaymentCheckoutModal
        isOpen={showPaymentCheckout}
        paymentData={paymentData}
        initialTokenBalance={tokenBalance ?? 0}
        onClose={() => setShowPaymentCheckout(false)}
        onSuccess={(newBalance) => {
          setTokenBalance(newBalance);
          setShowPaymentCheckout(false);
          alert(t("Nạp Token thành công! Số dư của bạn đã được cập nhật.", "トークンのチャージが完了しました！残高が更新されました。"));
        }}
      />
    </div>
  );
}