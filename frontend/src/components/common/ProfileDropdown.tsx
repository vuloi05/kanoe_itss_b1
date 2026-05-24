"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/lib/auth";

interface ProfileDropdownProps {
  settingsPath: string;
}

export default function ProfileDropdown({ settingsPath }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { t } = useLanguage();
  const { logout, user } = useAuth();

  const displayName = user?.displayName || t("Người dùng", "ユーザー");
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSettings = () => {
    setOpen(false);
    router.push(settingsPath);
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
    router.push("/login");
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 rounded-full text-secondary dark:text-stone-400 hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors duration-300 cursor-pointer"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="material-symbols-outlined">account_circle</span>
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-4 border-b border-outline-variant dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 flex items-center justify-center text-base font-semibold">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-on-surface dark:text-stone-100 truncate">
                  {displayName}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSettings}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-on-surface dark:text-stone-200 hover:bg-surface-container-low dark:hover:bg-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            {t("Tài khoản", "アカウント")}
          </button>

          <div className="mx-3 my-1 border-t border-outline-variant dark:border-slate-700" />

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-error hover:bg-error-container dark:hover:bg-red-900/30 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            {t("Đăng xuất", "ログアウト")}
          </button>

          <p className="px-4 pb-4 pt-2 text-xs text-secondary dark:text-stone-400">
            {t(
              "Hãy xoá cookie nếu không được điều hướng trở lại ứng dụng sau khi đăng xuất.",
              "ログアウト後にアプリへリダイレクトされない場合はCookieを削除してください。"
            )}
          </p>
        </div>
      )}
    </div>
  );
}
