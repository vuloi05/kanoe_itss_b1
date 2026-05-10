"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PartnerBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Trang chủ", icon: "dashboard", href: "/partner/home" },
    { name: "Tin nhắn", icon: "chat", href: "/partner/messages" },
    { name: "Cài đặt", icon: "settings", href: "/partner/settings" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-safe h-16 bg-white dark:bg-primary border-t border-surface-container-low/15 shadow-[0_-12px_32px_-4px_rgba(9,41,79,0.06)] rounded-t-lg">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center px-4 py-1.5 transition-all duration-300 scale-95 active:scale-90 ${
              isActive
                ? "bg-primary-container text-white rounded-2xl"
                : "text-secondary dark:text-surface-container-low/60"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={
                isActive
                  ? { fontVariationSettings: '"FILL" 1' }
                  : undefined
              }
            >
              {item.icon}
            </span>
            <span className="font-body text-[10px] font-medium">
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
