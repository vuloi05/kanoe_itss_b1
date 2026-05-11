"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { authApi, ApiException } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError(t("Mật khẩu không khớp.", "パスワードが一致しません。"));
      return;
    }
    if (!token) {
      setError(t("Token không hợp lệ.", "無効なトークンです。"));
      return;
    }
    setIsLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiException ? err.message : t("Đã xảy ra lỗi. Vui lòng thử lại.", "エラーが発生しました。もう一度お試しください。"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-10 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-primary tracking-[0.1em] font-headline">VietImmerse</Link>
          <LanguageSwitcher />
        </div>
        <h1 className="font-headline text-3xl font-bold text-primary mb-2">{t("Đặt lại mật khẩu", "パスワードの再設定")}</h1>
        <p className="text-on-surface-variant mb-10">{t("Nhập mật khẩu mới cho tài khoản của bạn.", "新しいパスワードを入力してください。")}</p>
        {success ? (
          <div className="space-y-6">
            <div className="p-6 bg-primary-container text-on-primary-container rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-2xl">check_circle</span>
                <h3 className="font-headline font-bold text-lg">{t("Đặt lại mật khẩu thành công!", "パスワードの再設定が完了しました！")}</h3>
              </div>
              <p className="text-sm">{t("Bạn có thể đăng nhập với mật khẩu mới.", "新しいパスワードでログインできます。")}</p>
            </div>
            <Link href="/login" className="block w-full bg-primary text-on-primary py-4 rounded-xl font-headline font-bold text-center hover:bg-primary-container transition-all">{t("Đăng nhập", "ログイン")}</Link>
          </div>
        ) : (
          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm font-medium flex items-center gap-3">
                <span className="material-symbols-outlined text-error text-xl">error</span>
                {error}
              </div>
            )}
            <div><label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">{t("Mật khẩu mới", "新しいパスワード")}</label><input className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-3" placeholder="••••••••" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} disabled={isLoading}/></div>
            <div><label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">{t("Xác nhận mật khẩu mới", "新しいパスワード（確認）")}</label><input className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-3" placeholder="••••••••" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} disabled={isLoading}/></div>
            <button className="w-full bg-primary text-on-primary py-4 rounded-xl font-headline font-bold hover:bg-primary-container transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3" type="submit" disabled={isLoading}>
              {isLoading ? (<><div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />{t("Đang cập nhật...", "更新中...")}</>) : t("Đặt lại mật khẩu", "リセット")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-surface"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
