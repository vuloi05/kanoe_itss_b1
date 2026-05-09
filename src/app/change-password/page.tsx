"use client";
import Link from "next/link";

export default function ChangePasswordPage() {
  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/learner/settings" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm mb-8"><span className="material-symbols-outlined text-sm">arrow_back</span>Quay lại Cài đặt</Link>
        <h1 className="font-headline text-3xl font-bold text-primary mb-2">Đổi mật khẩu<br/><span className="text-on-surface-variant font-medium text-xl italic">パスワードの変更</span></h1>
        <p className="text-on-surface-variant mb-10">Nhập mật khẩu hiện tại và mật khẩu mới.</p>
        <form className="space-y-8">
          <div><label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Mật khẩu hiện tại</label><input className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-3" placeholder="••••••••" type="password"/></div>
          <div><label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Mật khẩu mới</label><input className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-3" placeholder="••••••••" type="password"/></div>
          <div><label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Xác nhận mật khẩu mới</label><input className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-3" placeholder="••••••••" type="password"/></div>
          <button className="w-full bg-primary text-on-primary py-4 rounded-xl font-headline font-bold hover:bg-primary-container transition-all" type="submit">Cập nhật mật khẩu / パスワードを更新</button>
        </form>
      </div>
    </div>
  );
}
