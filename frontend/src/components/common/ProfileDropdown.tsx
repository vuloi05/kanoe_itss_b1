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
  const [isDark, setIsDark] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { t } = useLanguage();
  const { logout } = useAuth();

  // Sync dark state from <html> class on mount
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

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

  const toggleDarkMode = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

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
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface dark:text-stone-200 hover:bg-surface-container-low dark:hover:bg-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isDark ? "light_mode" : "dark_mode"}
            </span>
            {isDark
              ? t("Chế độ sáng", "ライトモード")
              : t("Chế độ tối", "ダークモード")}
          </button>

          <div className="mx-3 my-1 border-t border-outline-variant dark:border-slate-700" />

          {/* Settings */}
          <button
            onClick={handleSettings}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface dark:text-stone-200 hover:bg-surface-container-low dark:hover:bg-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            {t("Cài đặt", "設定")}
          </button>

          <div className="mx-3 my-1 border-t border-outline-variant dark:border-slate-700" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error-container dark:hover:bg-red-900/30 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            {t("Đăng xuất", "ログアウト")}
          </button>
        </div>
      )}
    </div>
  );
}
