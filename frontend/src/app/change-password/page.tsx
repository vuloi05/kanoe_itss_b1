"use client";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { authApi, ApiException } from "@/lib/api";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

function ChangePasswordForm() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const backPath = user?.role === "partner" ? "/partner/settings" : "/learner/settings";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới không khớp.");
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
      setError(err instanceof ApiException ? err.message : "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href={backPath} className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm mb-8"><span className="material-symbols-outlined text-sm">arrow_back</span>Quay lại Cài đặt</Link>
        <h1 className="font-headline text-3xl font-bold text-primary mb-2">Đổi mật khẩu<br/><span className="text-on-surface-variant font-medium text-xl italic">パスワードの変更</span></h1>
        <p className="text-on-surface-variant mb-10">Nhập mật khẩu hiện tại và mật khẩu mới.</p>
        {success && (
          <div className="p-4 bg-primary-container text-on-primary-container rounded-xl text-sm font-medium flex items-center gap-3 mb-8">
            <span className="material-symbols-outlined text-xl">check_circle</span>
            Đổi mật khẩu thành công!
          </div>
        )}
        <form className="space-y-8" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm font-medium flex items-center gap-3">
              <span className="material-symbols-outlined text-error text-xl">error</span>
              {error}
            </div>
          )}
          <div><label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Mật khẩu hiện tại</label><input className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-3" placeholder="••••••••" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required disabled={isLoading}/></div>
          <div><label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Mật khẩu mới</label><input className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-3" placeholder="••••••••" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} disabled={isLoading}/></div>
          <div><label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Xác nhận mật khẩu mới</label><input className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-3" placeholder="••••••••" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} disabled={isLoading}/></div>
          <button className="w-full bg-primary text-on-primary py-4 rounded-xl font-headline font-bold hover:bg-primary-container transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3" type="submit" disabled={isLoading}>
            {isLoading ? (<><div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />Đang cập nhật...</>) : "Cập nhật mật khẩu / パスワードを更新"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <ProtectedRoute>
      <ChangePasswordForm />
    </ProtectedRoute>
  );
}
