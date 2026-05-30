"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

// ─── Constants ──────────────────────────────────────────────────
const CONNECTION_COST = 100;
const REVENUE_SPLIT = { partner: 70, platform: 30 } as const;

interface TokenConfirmModalProps {
  isOpen: boolean;
  partnerName: string;
  tokenBalance: number;
  isProcessing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function TokenConfirmModal({
  isOpen,
  partnerName,
  tokenBalance,
  isProcessing,
  onConfirm,
  onCancel,
}: TokenConfirmModalProps) {
  const { t } = useLanguage();
  const backdropRef = useRef<HTMLDivElement>(null);

  const hasEnoughTokens = tokenBalance >= CONNECTION_COST;
  const remainingAfter = tokenBalance - CONNECTION_COST;

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isProcessing) onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isProcessing, onCancel]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current && !isProcessing) {
      onCancel();
    }
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="token-modal-title"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header — gradient accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-amber-400" />

        <div className="px-6 pt-6 pb-2">
          {/* Icon + Title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-50 dark:from-amber-900/40 dark:to-yellow-900/20 flex items-center justify-center shrink-0">
              <span className="text-2xl">🪙</span>
            </div>
            <div>
              <h2
                id="token-modal-title"
                className="text-lg font-headline font-bold text-on-surface dark:text-stone-100"
              >
                {t("Yêu cầu kết nối", "接続リクエスト")}
              </h2>
              <p className="text-xs text-on-surface-variant dark:text-stone-400">
                {t("Kết nối trả phí bằng Token", "トークンで有料接続")}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="bg-surface-container-lowest dark:bg-slate-700/50 rounded-2xl p-4 mb-4">
            <p className="text-sm text-on-surface dark:text-stone-200 leading-relaxed">
              {t(
                `Bạn sẽ sử dụng `,
                `接続リクエストを送信するために `
              )}
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {CONNECTION_COST} Token
              </span>
              {t(
                ` để gửi lời mời nhắn tin đến `,
                ` を使用して `
              )}
              <span className="font-bold text-primary dark:text-blue-300">
                {partnerName}
              </span>
              {t(". Bạn có chắc chắn không?", " に接続しますか？")}
            </p>

            {/* Revenue breakdown (subtle info) */}
            <div className="mt-3 pt-3 border-t border-outline-variant/30 dark:border-slate-600/50">
              <div className="flex items-center justify-between text-xs text-on-surface-variant dark:text-stone-400">
                <span>{t("Đối tác nhận", "パートナー受取")}</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  +{REVENUE_SPLIT.partner} 🪙
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-on-surface-variant dark:text-stone-400 mt-1">
                <span>{t("Phí nền tảng", "プラットフォーム手数料")}</span>
                <span className="font-medium">{REVENUE_SPLIT.platform} 🪙</span>
              </div>
            </div>
          </div>

          {/* Balance info */}
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-xs text-on-surface-variant dark:text-stone-400">
              {t("Số dư hiện tại", "現在の残高")}
            </span>
            <span className="text-sm font-bold text-amber-700 dark:text-amber-300 tabular-nums">
              {tokenBalance.toLocaleString()} 🪙
            </span>
          </div>
          {hasEnoughTokens && (
            <div className="flex items-center justify-between px-1 mb-4">
              <span className="text-xs text-on-surface-variant dark:text-stone-400">
                {t("Số dư sau giao dịch", "取引後の残高")}
              </span>
              <span className="text-sm font-bold text-on-surface-variant dark:text-stone-300 tabular-nums">
                {remainingAfter.toLocaleString()} 🪙
              </span>
            </div>
          )}

          {/* Insufficient balance warning */}
          {!hasEnoughTokens && (
            <div className="flex items-center gap-2 px-3 py-2.5 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl">
              <span className="material-symbols-outlined text-red-500 text-lg">
                error
              </span>
              <p className="text-xs font-bold text-red-600 dark:text-red-400">
                {t(
                  "Bạn không đủ Token. Vui lòng nạp thêm.",
                  "トークンが不足しています。チャージしてください。"
                )}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 py-3 px-4 rounded-xl border border-outline-variant/40 dark:border-slate-600 text-on-surface-variant dark:text-stone-300 font-headline font-bold text-sm hover:bg-surface-container-low dark:hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("Hủy", "キャンセル")}
          </button>
          <button
            onClick={onConfirm}
            disabled={!hasEnoughTokens || isProcessing}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-on-primary font-headline font-bold text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-400 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <span className="material-symbols-outlined text-lg animate-spin">
                  progress_activity
                </span>
                {t("Đang xử lý...", "処理中...")}
              </>
            ) : (
              <>
                <span className="text-base">🪙</span>
                {t("Xác nhận kết nối", "接続を確認")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export { CONNECTION_COST };
