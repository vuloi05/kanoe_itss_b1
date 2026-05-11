"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

export default function PartnerNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const { t } = useLanguage();

  const navLinks = [
    { name: t("Trang chủ", "ホーム"), href: "/partner/home" },
    { name: t("Tin nhắn", "メッセージ"), href: "/partner/messages" },
    { name: t("Cài đặt", "設定"), href: "/partner/settings" },
  ];

  return (
    <header className="bg-[#f9f9f7] dark:bg-slate-900 flex justify-between items-center w-full px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link
          href="/partner/home"
          className="text-xl font-bold text-primary dark:text-blue-200 font-headline tracking-wide"
        >
          VietImmerse
        </Link>
        <nav className="hidden md:flex items-center gap-8 font-headline tracking-wide text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors duration-300 ${
                pathname === link.href || pathname.startsWith(link.href + "/")
                  ? "text-primary dark:text-blue-300 border-b-2 border-secondary pb-1 font-bold"
                  : "text-secondary hover:text-primary"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <button
          onClick={() => router.push("/partner/settings")}
          className="material-symbols-outlined text-primary dark:text-blue-400 cursor-pointer hover:bg-surface-container-low p-2 rounded-full transition-colors"
        >
          account_circle
        </button>
        <button
          onClick={() => router.push("/login")}
          className="hidden md:flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error-container rounded-lg transition-colors font-medium"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          {t("Đăng xuất", "ログアウト")}
        </button>
      </div>
    </header>
  );
}
