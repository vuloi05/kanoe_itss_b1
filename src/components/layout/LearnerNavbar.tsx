"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function LearnerNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { name: "Trang chủ / ホーム", href: "/learner/home" },
    { name: "Bài học / レッスン", href: "/learner/lessons" },
    { name: "Ghép cặp / マッチング", href: "/learner/matching" },
    { name: "Tin nhắn / メッセージ", href: "/learner/messages" },
    { name: "Cài đặt / 設定", href: "/learner/settings" },
  ];

  return (
    <header className="bg-[#f9f9f7] dark:bg-slate-900 flex justify-between items-center w-full px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link
          href="/learner/home"
          className="text-xl font-bold text-primary dark:text-blue-200 font-headline tracking-wide"
        >
          VietImmerse
        </Link>
        <nav className="hidden md:flex gap-2 items-center font-headline tracking-wide text-[11px] uppercase">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1 rounded-lg transition-colors duration-300 ${
                pathname === link.href || pathname.startsWith(link.href + "/")
                  ? "text-primary dark:text-blue-400 font-bold border-b-2 border-secondary"
                  : "text-secondary dark:text-stone-400 hover:bg-surface-container-low dark:hover:bg-slate-800"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/learner/settings")}
          className="material-symbols-outlined text-primary dark:text-blue-400 cursor-pointer hover:bg-surface-container-low dark:hover:bg-slate-800 p-2 rounded-full transition-colors duration-300"
        >
          account_circle
        </button>
      </div>
    </header>
  );
}
