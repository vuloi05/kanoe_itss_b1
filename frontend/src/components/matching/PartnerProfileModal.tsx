"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { type PartnerDto } from "@/lib/api";

interface PartnerProfileModalProps {
  partner: PartnerDto | null;
  onClose: () => void;
  onConnect: (partner: PartnerDto) => void;
}

export default function PartnerProfileModal({
  partner,
  onClose,
  onConnect,
}: PartnerProfileModalProps) {
  const { t } = useLanguage();
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!partner) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [partner, onClose]);

  useEffect(() => {
    if (partner) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [partner]);

  if (!partner) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) {
      onClose();
    }
  };

  const dicebearUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
    partner.displayName
  )}&backgroundColor=c0aede`;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-amber-400" />
        
        <div className="p-6 text-center">
          <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4 border-4 border-surface-container bg-surface-container-lowest">
            <img
              src={partner.avatarUrl || dicebearUrl}
              alt={partner.displayName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = dicebearUrl;
              }}
            />
          </div>
          
          <h2 className="text-2xl font-headline font-bold text-primary mb-2">
            {partner.displayName}
          </h2>
          
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {partner.isOnline ? (
              <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-bold">
                {t("Online", "オンライン")}
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-full font-bold">
                {t("Offline", "オフライン")}
              </span>
            )}
            {partner.ageRange && (
              <span className="bg-surface-container-low text-primary text-xs px-2.5 py-1 rounded-full font-medium">
                {partner.ageRange}
              </span>
            )}
            <span className="bg-surface-container-low text-primary text-xs px-2.5 py-1 rounded-full font-medium">
              {partner.job || "—"}
            </span>
          </div>
          
          <div className="bg-surface-container-lowest dark:bg-slate-700/50 rounded-2xl p-4 text-left mb-6 shadow-inner">
            <h4 className="text-xs uppercase tracking-wider font-bold text-secondary mb-2">
              {t("Giới thiệu", "自己紹介")}
            </h4>
            <p className="text-sm text-on-surface-variant dark:text-stone-300 leading-relaxed whitespace-pre-wrap">
              {partner.bio || t("Chưa cập nhật tiểu sử.", "未設定")}
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-outline-variant/40 dark:border-slate-600 text-on-surface-variant font-headline font-bold text-sm hover:bg-surface-container-low transition-all"
            >
              {t("Đóng", "閉じる")}
            </button>
            <button
              onClick={() => {
                onClose();
                onConnect(partner);
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-on-primary font-headline font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">
                {partner.hasConversation ? "send" : "group_add"}
              </span>
              {partner.hasConversation ? t("Nhắn tin", "メッセージ") : t("Kết nối", "接続する")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
