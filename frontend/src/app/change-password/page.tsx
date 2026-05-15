"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { authApi, ApiException } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

function ChangePasswordForm() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const backPath = user?.role === "partner" ? "/partner/settings" : "/learner/settings";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError(t("Mật khẩu mới không khớp.", "新しいパスワードが一致しません。"));
      return;
    }

    setIsLoading(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof ApiException ? err.message : t("Đã xảy ra lỗi. Vui lòng thử lại.", "エラーが発生しました。もう一度お試しください。"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full max-w-6xl min-h-[700px] bg-surface-container-lowest flex flex-col md:flex-row overflow-hidden md:rounded-[24px] shadow-[0_12px_32px_-4px_rgba(9,41,79,0.06)] relative">
      {/* Left Side: Branded Artistic Image */}
      <section className="hidden md:flex md:w-5/12 bg-primary relative overflow-hidden">
        <Image
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity"
          alt="Hanoi Old Quarter at dusk"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBA3X9tc0W9muriyslIGeDXbDGAyqGpA3jAfBB5MBQ1e-t3dtZGaQZ0y-bBClmtoxbgCP3wd1brb7GRpgp-f38iSAwIok_Idd4aL6Zbp6XAuvOtilb7ud48Ffekwl9AS8aYPWPsvUa9RyPUsc8REo6XD8bb9CJ1woQ1_oob6MdLo33sIARWUTtAXZU39CoNW0HvEOvWk6C61BE-8P435qJVmNPI_bIBzLN4_fh7KKmCmA8Lc5eAQfqz_8jYoQZCpB-qcIXifbcNlhs"
          fill
          sizes="(max-width: 768px) 100vw, 42vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
        <div className="relative z-10 p-12 flex flex-col justify-between h-full text-white">
          <div>
            <h1 className="font-headline font-extrabold text-3xl tracking-tight text-white mb-2">VietImmerse</h1>
            <div className="h-1 w-12 bg-secondary rounded-full" />
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-secondary text-4xl" style={{ fontVariationSettings: '"FILL" 1' }}>auto_awesome</span>
              <p className="font-headline font-medium text-lg leading-snug">
                {t("Hành trình ngôn ngữ", "言語の旅")}
              </p>
            </div>
            <p className="text-on-primary/70 max-w-xs leading-relaxed text-sm">
              {t("Khám phá vẻ đẹp của phương ngữ miền Bắc thông qua trải nghiệm học tập tinh tế.", "洗練された学習体験を通じて北部方言の美しさを発見する。")}
            </p>
          </div>
        </div>
        {/* Lotus Decorative Motif */}
        <div className="absolute bottom-[-10%] right-[-10%] opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[300px]" style={{ fontVariationSettings: '"FILL" 1' }}>filter_vintage</span>
        </div>
      </section>

      {/* Right Side: Change Password Form */}
      <section className="w-full md:w-7/12 flex flex-col justify-center items-center p-8 md:p-16" style={{ background: "linear-gradient(135deg, rgba(9, 41, 79, 0.03) 0%, rgba(113, 90, 62, 0.03) 100%)" }}>
        <div className="w-full max-w-md">
          {/* Header Branding Mobile */}
          <div className="md:hidden mb-12 text-center">
            <h1 className="font-headline font-extrabold text-2xl tracking-tight text-primary">VietImmerse</h1>
          </div>

          {/* Top navigation bar */}
          <div className="flex justify-between items-center mb-6">
            <Link
              href={backPath}
              className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors duration-300 font-body text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>{t("Quay lại Cài đặt", "設定に戻る")}</span>
            </Link>
            <LanguageSwitcher />
          </div>

          {/* Form Header */}
          <header className="mb-10 text-left">
            <h2 className="font-headline font-bold text-2xl text-primary tracking-tight mb-2">
              {t("Đổi mật khẩu", "パスワードの変更")}
            </h2>
          </header>

          {success && (
            <div className="p-4 bg-primary-container text-on-primary-container rounded-xl text-sm font-medium flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-xl">check_circle</span>
              {t("Đổi mật khẩu thành công!", "パスワードが正常に変更されました！")}
            </div>
          )}

          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm font-medium flex items-center gap-3">
                <span className="material-symbols-outlined text-error text-xl">error</span>
                {error}
              </div>
            )}

            {/* Current Password Field */}
            <div className="relative group">
              <div className="flex items-center border-b border-outline-variant group-focus-within:border-primary transition-all duration-300 py-2">
                <span className="material-symbols-outlined text-outline group-focus-within:text-primary mr-3 transition-colors">key</span>
                <input
                  className="block w-full appearance-none bg-transparent border-none focus:ring-0 text-on-surface text-base py-1 px-0 font-body placeholder-transparent peer"
                  id="current_password"
                  placeholder=" "
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <label
                  className="absolute left-9 top-3 text-outline transition-all duration-300 pointer-events-none text-sm peer-focus:text-xs peer-focus:-translate-y-6 peer-focus:text-primary peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-primary"
                  htmlFor="current_password"
                >
                  {t("Mật khẩu hiện tại", "現在のパスワード")}
                </label>
                <button
                  className="text-outline hover:text-primary transition-colors"
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showCurrentPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            {/* New Password Field */}
            <div className="relative group">
              <div className="flex items-center border-b border-outline-variant group-focus-within:border-primary transition-all duration-300 py-2">
                <span className="material-symbols-outlined text-outline group-focus-within:text-primary mr-3 transition-colors">lock</span>
                <input
                  className="block w-full appearance-none bg-transparent border-none focus:ring-0 text-on-surface text-base py-1 px-0 font-body placeholder-transparent peer"
                  id="new_password"
                  placeholder=" "
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={isLoading}
                />
                <label
                  className="absolute left-9 top-3 text-outline transition-all duration-300 pointer-events-none text-sm peer-focus:text-xs peer-focus:-translate-y-6 peer-focus:text-primary peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-primary"
                  htmlFor="new_password"
                >
                  {t("Mật khẩu mới", "新しいパスワード")}
                </label>
                <button
                  className="text-outline hover:text-primary transition-colors"
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showNewPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="relative group">
              <div className="flex items-center border-b border-outline-variant group-focus-within:border-primary transition-all duration-300 py-2">
                <span className="material-symbols-outlined text-outline group-focus-within:text-primary mr-3 transition-colors">verified_user</span>
                <input
                  className="block w-full appearance-none bg-transparent border-none focus:ring-0 text-on-surface text-base py-1 px-0 font-body placeholder-transparent peer"
                  id="confirm_password"
                  placeholder=" "
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={isLoading}
                />
                <label
                  className="absolute left-9 top-3 text-outline transition-all duration-300 pointer-events-none text-sm peer-focus:text-xs peer-focus:-translate-y-6 peer-focus:text-primary peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-primary"
                  htmlFor="confirm_password"
                >
                  {t("Xác nhận mật khẩu mới", "新しいパスワードの確認")}
                </label>
                <button
                  className="text-outline hover:text-primary transition-colors"
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirmPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-6">
              <button
                className="w-full bg-primary text-white py-4 px-6 rounded-xl font-headline font-bold text-base hover:bg-primary-container transition-all duration-300 shadow-[0_12px_32px_-4px_rgba(9,41,79,0.1)] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                    {t("Đang cập nhật...", "更新中...")}
                  </>
                ) : (
                  <>
                    <span>{t("Cập nhật mật khẩu", "パスワードを更新する")}</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      </section>
    </main>
  );
}

export default function ChangePasswordPage() {
  return (
    <ProtectedRoute>
      <div className="bg-background font-body text-on-surface min-h-screen flex items-center justify-center p-0 md:p-6 overflow-x-hidden">
        <ChangePasswordForm />
      </div>
    </ProtectedRoute>
  );
}
