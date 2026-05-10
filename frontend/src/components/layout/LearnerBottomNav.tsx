"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LearnerBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Cá nhân", icon: "dashboard", href: "/learner/home" },
    { name: "Bài học", icon: "menu_book", href: "/learner/lessons" },
    { name: "Luyện tập", icon: "record_voice_over", href: "/learner/matching" },
    { name: "Hồ sơ", icon: "person", href: "/learner/settings" },
  ];

  return (
    <footer className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 bg-[#f9f9f7] dark:bg-slate-950 border-t border-surface-container-low dark:border-slate-800 shadow-[0_-4px_20px_-4px_rgba(9,41,79,0.06)]">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center px-4 py-1.5 transition-all duration-300 ease-in-out ${
              isActive
                ? "bg-primary-container text-white rounded-xl scale-95"
                : "text-secondary dark:text-slate-500 hover:bg-surface-container-low"
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-body text-[10px] font-medium tracking-tight">
              {item.name}
            </span>
          </Link>
        );
      })}
    </footer>
  );
}
