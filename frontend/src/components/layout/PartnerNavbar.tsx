"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import ProfileDropdown from "@/components/common/ProfileDropdown";

import { useState, useEffect } from "react";
import { matchingApi } from "@/lib/api";

export default function PartnerNavbar() {
  const pathname = usePathname();

  const { t } = useLanguage();

  // Fetch token balance from backend
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  useEffect(() => {
    matchingApi.getBalance()
      .then((data) => setTokenBalance(data.tokenBalance))
      .catch(() => setTokenBalance(0));
  }, []);

  const navLinks = [
    { name: t("Trang chủ", "ホーム"), href: "/partner/home" },
    { name: t("Tin nhắn", "メッセージ"), href: "/partner/messages" },
    { name: t("Cài đặt", "設定"), href: "/partner/settings" },
  ];

  return (
    <header className="bg-[#f9f9f7] dark:bg-slate-900 flex justify-between items-center w-full px-8 py-4 sticky top-0 z-50 font-headline tracking-wide">
      <div className="flex items-center gap-8">
        <Link
          href="/partner/home"
          className="text-xl font-bold text-[#09294f] dark:text-blue-200"
        >
          VietImmerse
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors duration-300 ${
                pathname === link.href || pathname.startsWith(link.href + "/")
                  ? "text-[#09294f] border-b-2 border-[#715a3e] pb-1 font-bold"
                  : "text-[#715a3e] hover:text-[#09294f]"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
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
        <ProfileDropdown settingsPath="/partner/settings" />
      </div>
    </header>
  );
}
