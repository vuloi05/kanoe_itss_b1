"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

// ─── Constants ──────────────────────────────────────────────────
const TOKEN_RATE = 1000; // 1 Token = 1,000 VNĐ

const TOKEN_PACKAGES = [
  { amount: 500, price: 500_000 },
  { amount: 1000, price: 1_000_000 },
  { amount: 2000, price: 2_000_000 },
  { amount: 5000, price: 5_000_000 },
] as const;

type PaymentMethod = "momo" | "zalopay" | "credit_card" | "bank_transfer";

const PAYMENT_METHODS: {
  id: PaymentMethod;
  labelVi: string;
  labelJa: string;
  icon: string;
  color: string;
}[] = [
  {
    id: "momo",
    labelVi: "MoMo",
    labelJa: "MoMo",
    icon: "account_balance_wallet",
    color: "#A50064",
  },
  {
    id: "zalopay",
    labelVi: "ZaloPay",
    labelJa: "ZaloPay",
    icon: "payments",
    color: "#008FE5",
  },
  {
    id: "credit_card",
    labelVi: "Credit Card",
    labelJa: "クレジットカード",
    icon: "credit_card",
    color: "#334155",
  },
  {
    id: "bank_transfer",
    labelVi: "Bank Transfer",
    labelJa: "銀行振込",
    icon: "account_balance",
    color: "#334155",
  },
];

// ─── Membership tier based on balance ───────────────────────────
function getMembershipTier(
  balance: number,
  t: (vi: string, ja: string) => string
): { label: string; color: string } {
  if (balance >= 5000)
    return { label: t("Diamond Member", "ダイヤモンド会員"), color: "#6366F1" };
  if (balance >= 2000)
    return { label: t("Platinum Member", "プラチナ会員"), color: "#0EA5E9" };
  if (balance >= 1000)
    return { label: t("Gold Member", "ゴールド会員"), color: "#D97706" };
  return { label: t("Silver Member", "シルバー会員"), color: "#94A3B8" };
}

// ─── Format VNĐ ─────────────────────────────────────────────────
function formatVND(amount: number): string {
  return amount.toLocaleString("vi-VN") + " VNĐ";
}

function formatPriceShort(amount: number): string {
  if (amount >= 1_000_000) return `${amount / 1_000_000},000kVNĐ`;
  return `${amount / 1_000}kVNĐ`;
}

// ─── Component ──────────────────────────────────────────────────
interface TopUpTokenModalProps {
  isOpen: boolean;
  tokenBalance: number;
  onClose: () => void;
  onConfirm: (amount: number, method: PaymentMethod, discountCode?: string) => void;
}

export default function TopUpTokenModal({
  isOpen,
  tokenBalance,
  onClose,
  onConfirm,
}: TopUpTokenModalProps) {
  const { t } = useLanguage();
  const backdropRef = useRef<HTMLDivElement>(null);

  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("momo");
  const [isProcessing, setIsProcessing] = useState(false);

  // Track previous isOpen to detect open transition (React "adjusting state during render" pattern)
  const [prevIsOpen, setPrevIsOpen] = useState(false);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setSelectedPackage(null);
      setCustomAmount("");
      setDiscountCode("");
      setSelectedMethod("momo");
      setIsProcessing(false);
    }
  }

  // Derive final token amount from selection or custom input
  const tokenAmount = selectedPackage ?? (parseInt(customAmount) || 0);
  const isFree = discountCode.trim().toUpperCase() === "DOMIXI";
  const totalVND = isFree ? 0 : tokenAmount * TOKEN_RATE;

  const tier = getMembershipTier(tokenBalance, t);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isProcessing) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current && !isProcessing) onClose();
  };

  const handleSelectPackage = useCallback((amount: number) => {
    setSelectedPackage(amount);
    setCustomAmount("");
  }, []);

  const handleCustomAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, "");
      setCustomAmount(value);
      // Clear package selection when typing custom amount
      if (value) setSelectedPackage(null);
    },
    []
  );

  const handleConfirm = async () => {
    if (tokenAmount <= 0) return;
    setIsProcessing(true);
    try {
      await onConfirm(tokenAmount, selectedMethod, discountCode);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="topup-modal-title"
    >
      <div className="w-full max-w-[520px] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-h-[90vh] flex flex-col">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700 shrink-0">
          <div>
            <h2
              id="topup-modal-title"
              className="text-xl font-headline font-bold text-[#112340] dark:text-white"
            >
              {t("Nạp Token", "トークンのチャージ")}
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              {t("Nạp thêm token vào ví", "ウォレットにトークンをチャージ")}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px] text-slate-400">
              close
            </span>
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {/* ── Balance & Tier bar ── */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#112340] via-[#1E3A5F] to-[#0F172A] rounded-2xl">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <span className="text-xl">🪙</span>
              </div>
              <div>
                <p className="text-[10px] text-white/50 uppercase tracking-wider font-medium">
                  {t("SỐ DƯ HIỆN TẠI", "現在の残高")}
                </p>
                <p className="text-xl font-bold text-white tabular-nums">
                  {tokenBalance.toLocaleString()} Tokens
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/50 uppercase tracking-wider font-medium">
                {t("HẠNG THẺ", "ランク")}
              </p>
              <p
                className="text-sm font-bold"
                style={{ color: tier.color }}
              >
                {tier.label}
              </p>
            </div>
          </div>

          {/* ── Token packages ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-headline font-bold text-[#112340] dark:text-white">
                {t("Chọn gói Token", "パッケージの選択")}
              </h3>
              <span className="text-[11px] text-[#94A3B8]">
                1 Token = 1,000 VNĐ
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {TOKEN_PACKAGES.map((pkg) => (
                <button
                  key={pkg.amount}
                  onClick={() => handleSelectPackage(pkg.amount)}
                  className={`relative flex flex-col items-center py-4 px-2 rounded-2xl border-2 transition-all duration-200 ${
                    selectedPackage === pkg.amount
                      ? "border-[#112340] dark:border-blue-400 bg-[#112340]/5 dark:bg-blue-500/10 shadow-md"
                      : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-sm"
                  }`}
                >
                  <span
                    className={`text-lg font-bold tabular-nums ${
                      selectedPackage === pkg.amount
                        ? "text-[#112340] dark:text-blue-300"
                        : "text-[#112340] dark:text-white"
                    }`}
                  >
                    {pkg.amount.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-[#94A3B8] mt-0.5">
                    Tokens
                  </span>
                  <span
                    className={`text-[11px] font-semibold mt-1.5 ${
                      selectedPackage === pkg.amount
                        ? "text-[#112340] dark:text-blue-300"
                        : "text-[#D97706]"
                    }`}
                  >
                    {formatPriceShort(pkg.price)}
                  </span>
                  {/* Selected indicator */}
                  {selectedPackage === pkg.amount && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#112340] dark:bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-[14px]">
                        check
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Custom amount ── */}
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
            <input
              type="text"
              inputMode="numeric"
              placeholder={t(
                "Nhập số lượng khác",
                "他の金額を入力"
              )}
              value={customAmount}
              onChange={handleCustomAmountChange}
              className="flex-1 bg-transparent text-sm text-[#112340] dark:text-white placeholder:text-[#94A3B8] outline-none font-medium"
            />
            <span className="text-sm text-[#94A3B8] font-medium shrink-0">
              Tokens
            </span>
          </div>

          {/* ── Discount code ── */}
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
            <span className="material-symbols-outlined text-[#94A3B8]">local_activity</span>
            <input
              type="text"
              placeholder={t("Nhập mã giảm giá (nếu có)", "割引コードを入力")}
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              className="flex-1 bg-transparent text-sm text-[#112340] dark:text-white placeholder:text-[#94A3B8] outline-none font-medium uppercase"
            />
          </div>

          {/* ── Payment methods ── */}
          <div>
            <h3 className="text-sm font-headline font-bold text-[#112340] dark:text-white mb-3">
              {t("Phương thức thanh toán", "お支払い方法")}
            </h3>

            <div className="grid grid-cols-4 gap-2.5">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`flex flex-col items-center gap-2 py-3 px-2 rounded-2xl border-2 transition-all duration-200 ${
                    selectedMethod === method.id
                      ? "border-[#112340] dark:border-blue-400 bg-[#112340]/5 dark:bg-blue-500/10 shadow-md"
                      : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor:
                        selectedMethod === method.id
                          ? method.color
                          : `${method.color}15`,
                    }}
                  >
                    <span
                      className="material-symbols-outlined text-xl"
                      style={{
                        color:
                          selectedMethod === method.id
                            ? "#FFFFFF"
                            : method.color,
                      }}
                    >
                      {method.icon}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-medium leading-tight text-center ${
                      selectedMethod === method.id
                        ? "text-[#112340] dark:text-blue-300"
                        : "text-[#64748B] dark:text-slate-400"
                    }`}
                  >
                    {t(method.labelVi, method.labelJa)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Total ── */}
          <div className="flex items-start justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
            <div>
              <p className="text-xs text-[#94A3B8] uppercase tracking-wider font-medium">
                {t("TỔNG CỘNG", "合計金額")}
              </p>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                {t(
                  "Hệ thống sẽ chuyển hướng đến trang thanh toán an toàn.",
                  "安全な決済ページへリダイレクトされます。"
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#112340] dark:text-white tabular-nums">
                {tokenAmount > 0 ? (isFree ? "0 VNĐ" : formatVND(totalVND)) : "0 VNĐ"}
              </p>
              {isFree && tokenAmount > 0 && (
                <p className="text-[11px] text-green-600 font-bold mb-1">
                  Đã áp dụng mã giảm giá 100%
                </p>
              )}
              <p className="text-[11px] text-[#94A3B8]">
                {t("Thanh toán một lần", "一回払い")}
              </p>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-3 px-6 py-5 border-t border-slate-100 dark:border-slate-700 shrink-0">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 py-3.5 px-4 rounded-xl border border-slate-200 dark:border-slate-600 text-[#112340] dark:text-slate-300 font-headline font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("Hủy", "キャンセル")}
          </button>
          <button
            onClick={handleConfirm}
            disabled={tokenAmount <= 0 || isProcessing}
            className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#112340] to-[#1E3A5F] text-white font-headline font-bold text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                <span className="material-symbols-outlined text-lg">
                  verified
                </span>
                {t("Xác nhận thanh toán", "支払いを確定する")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
