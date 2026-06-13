"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import ProfileDropdown from "@/components/common/ProfileDropdown";

import { useState, useEffect } from "react";
import { matchingApi } from "@/lib/api";
import { subscribeToTokenBalance } from "@/lib/events";

export default function LearnerNavbar() {
  const pathname = usePathname();

  const { t } = useLanguage();

  // Fetch token balance from backend
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  useEffect(() => {
    matchingApi.getBalance()
      .then((data) => setTokenBalance(data.tokenBalance))
      .catch(() => setTokenBalance(0));
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToTokenBalance((newBalance) => {
      setTokenBalance(newBalance);
    });
    return () => unsubscribe();
  }, []);

  const navLinks = [
    { name: t("Trang chủ", "ホーム"), href: "/learner/home" },
    { name: t("Tìm đối tác", "マッチング"), href: "/learner/matching" },
    { name: t("Luyện tập", "ラボ"), href: "/learner/lessons" },
    { name: t("Cài đặt", "設定"), href: "/learner/settings" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-[#f9f9f7] dark:bg-slate-900 border-b border-surface-container-low dark:border-slate-800 font-headline tracking-wide">
      <div className="flex items-center gap-8">
        <Link
          href="/learner/home"
          className="text-xl font-bold text-primary dark:text-blue-200 tracking-wide"
        >
          VietImmerse
        </Link>
      </div>
      <div className="flex items-center gap-6">
        <nav className="hidden md:flex gap-8 items-center mr-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-headline tracking-wide font-bold hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors duration-300 px-3 py-1 rounded-lg ${
                pathname === link.href || pathname.startsWith(link.href + "/")
                  ? "text-primary dark:text-blue-400"
                  : "text-secondary dark:text-stone-400"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Token Balance Badge */}
        <div
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/20 border border-amber-200/60 dark:border-amber-700/40 cursor-default select-none"
          title={t("Số dư Token", "トークン残高")}
        >
          <span className="text-base leading-none">🪙</span>
          <span className="text-sm font-bold text-amber-700 dark:text-amber-300 tabular-nums">
            {tokenBalance !== null ? tokenBalance.toLocaleString() : "—"}
          </span>
        </div>

        <LanguageSwitcher />
        <ProfileDropdown settingsPath="/learner/settings" />
      </div>
    </header>
  );
}
