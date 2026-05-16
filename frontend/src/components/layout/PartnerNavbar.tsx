"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import ProfileDropdown from "@/components/common/ProfileDropdown";

export default function PartnerNavbar() {
  const pathname = usePathname();

  const { t } = useLanguage();

  const navLinks = [
    { name: t("Trang chủ / ホーム", "ホーム / Trang chủ"), href: "/partner/home" },
    { name: t("Tin nhắn / メッセージ", "メッセージ / Tin nhắn"), href: "/partner/messages" },
    { name: t("Cài đặt / 設定", "設定 / Cài đặt"), href: "/partner/settings" },
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
        <LanguageSwitcher />
        <ProfileDropdown settingsPath="/partner/settings" />
      </div>
    </header>
  );
}
