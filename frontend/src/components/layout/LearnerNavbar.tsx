"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import ProfileDropdown from "@/components/common/ProfileDropdown";

export default function LearnerNavbar() {
  const pathname = usePathname();

  const { t } = useLanguage();

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
        <LanguageSwitcher />
        <ProfileDropdown settingsPath="/learner/settings" />
      </div>
    </header>
  );
}
