"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/lib/auth";
import { matchingApi } from "@/lib/api";
import { subscribeToTokenBalance } from "@/lib/events";

interface ProfileDropdownProps {
  settingsPath: string;
}

export default function ProfileDropdown({ settingsPath }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
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

  // Fetch token balance when dropdown is opened
  useEffect(() => {
    if (open && user) {
      matchingApi.getBalance()
        .then(res => setBalance(res.tokenBalance))
        .catch(err => console.error("Failed to fetch balance", err));
    }
  }, [open, user]);

  // Subscribe to token balance updates
  useEffect(() => {
    const unsubscribe = subscribeToTokenBalance((newBalance) => {
      setBalance(newBalance);
    });
    return () => unsubscribe();
  }, []);

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
        <div className="absolute right-0 mt-2 w-[280px] bg-white dark:bg-slate-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-black/5 dark:ring-white/10 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header Profile Section */}
          <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="relative w-[44px] h-[44px] rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 flex items-center justify-center text-lg font-semibold shrink-0 shadow-sm border border-slate-100 dark:border-slate-600">
                {user?.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={displayName}
                    fill
                    className="object-cover"
                    sizes="44px"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-[#0f284e] dark:text-stone-100 truncate tracking-tight">
                  {displayName}
                </p>
              </div>
            </div>
          </div>

          {/* Account Settings Item */}
          <button
            onClick={handleSettings}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700"
          >
            <div className="w-[36px] h-[36px] rounded-full bg-[#f1f5f9] dark:bg-slate-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px] text-slate-700 dark:text-slate-200">account_circle</span>
            </div>
            <span className="text-[14px] font-bold text-[#0f284e] dark:text-stone-200">
              {t("Tài khoản", "アカウント")}
            </span>
          </button>

          {/* Balance Item */}
          <div className="w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-slate-100 dark:border-slate-700">
            <div className="w-[36px] h-[36px] rounded-full bg-[#f1f5f9] dark:bg-slate-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px] text-slate-700 dark:text-slate-200">account_balance_wallet</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-[#0f284e] dark:text-stone-200">
                {t("Số dư / 残高", "残高 / Số dư")}
              </span>
              <span className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
                {balance !== null ? balance : "..."} Tokens
              </span>
            </div>
          </div>

          {/* Logout Item */}
          <button
            onClick={handleLogout}
            className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors rounded-b-2xl group"
          >
            <div className="w-[36px] h-[36px] rounded-full bg-[#f1f5f9] dark:bg-slate-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-red-50 dark:group-hover:bg-red-900/30 transition-colors">
              <span className="material-symbols-outlined text-[20px] text-slate-700 dark:text-slate-200 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">logout</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-[#0f284e] dark:text-stone-200 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                {t("Đăng xuất", "ログアウト")}
              </span>
              <span className="text-[12px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                {t(
                  "Hãy xoá cookie nếu không được điều hướng trở lại ứng dụng sau khi đăng xuất.",
                  "ログアウト後にアプリへリダイレクトされない場合はCookieを削除してください。"
                )}
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
