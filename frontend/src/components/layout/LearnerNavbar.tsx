"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function LearnerNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { name: "Trang chủ / ホーム", href: "/learner/home" },
    { name: "Tìm đối tác / マッチング", href: "/learner/matching" },
    { name: "Luyện tập / ラボ", href: "/learner/lessons" },
    { name: "Cài đặt / 設定", href: "/learner/settings" },
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
        <button
          onClick={() => router.push("/learner/settings")}
          className="p-2 rounded-full text-secondary dark:text-stone-400 hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors duration-300 cursor-pointer"
        >
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </header>
  );
}
