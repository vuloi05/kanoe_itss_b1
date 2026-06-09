"use client";

import LearnerNavbar from "@/components/layout/LearnerNavbar";
import LearnerBottomNav from "@/components/layout/LearnerBottomNav";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { matchingApi, paymentApi, type TransactionHistoryDto, type CreatePaymentLinkResponse } from "@/lib/api";
import TopUpTokenModal from "@/components/common/TopUpTokenModal";
import PaymentCheckoutModal from "@/components/common/PaymentCheckoutModal";
import { useToast } from "@/contexts/ToastContext";

// ─── Date formatter ────────────────────────────────────────────
function formatTxDate(iso: string, locale: "vi" | "ja"): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Relative time for recent transactions
  if (diffMins < 1) return locale === "vi" ? "Vừa xong" : "たった今";
  if (diffMins < 60)
    return locale === "vi" ? `${diffMins} phút trước` : `${diffMins}分前`;
  if (diffHours < 24)
    return locale === "vi" ? `${diffHours} giờ trước` : `${diffHours}時間前`;
  if (diffDays < 7)
    return locale === "vi" ? `${diffDays} ngày trước` : `${diffDays}日前`;

  // Absolute date for older
  return date.toLocaleDateString(locale === "vi" ? "vi-VN" : "ja-JP", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function WalletPage() {
  const { t, lang } = useLanguage();
  const { addToast } = useToast();

  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<TransactionHistoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showPaymentCheckout, setShowPaymentCheckout] = useState(false);
  const [paymentData, setPaymentData] = useState<CreatePaymentLinkResponse | null>(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([matchingApi.getBalance(), matchingApi.getTransactions()])
      .then(([balanceData, txData]) => {
        if (mounted) {
          setBalance(balanceData.tokenBalance);
          setTransactions(txData);
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Error");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="bg-[#FAFAFA] dark:bg-slate-950 text-on-background font-body min-h-screen pb-20 md:pb-0">
      <LearnerNavbar />
      <main className="max-w-4xl mx-auto px-6 py-12 mt-16 md:mt-20 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
          <Link
            href="/learner/settings"
            className="hover:text-primary transition-colors"
          >
            {t("Cài đặt", "設定")}
          </Link>
          <span className="material-symbols-outlined text-[14px]">
            chevron_right
          </span>
          <span className="text-[#112340] dark:text-white font-medium">
            {t("Ví Token", "トークンウォレット")}
          </span>
        </div>

        {/* ─── Wallet Hero Card ─── */}
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#112340] via-[#1E3A5F] to-[#0F172A] p-8 md:p-10 shadow-xl">
          {/* Decorative circles */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/[0.04] rounded-full" />
          <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-amber-400/[0.06] rounded-full blur-xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-amber-400/80 text-sm font-medium uppercase tracking-widest">
                {t("Số dư khả dụng", "利用可能残高")}
              </span>
            </div>

            {/* Balance */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-5xl md:text-6xl font-extrabold text-white tabular-nums tracking-tight">
                {loading ? (
                  <span className="inline-block w-32 h-14 bg-white/10 rounded-xl animate-pulse" />
                ) : (
                  (balance ?? 0).toLocaleString()
                )}
              </span>
              <span className="text-3xl">🪙</span>
            </div>

            {/* Quick stats + Top-up button */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl">
                <span className="material-symbols-outlined text-amber-300 text-lg">
                  toll
                </span>
                <span className="text-white/80 text-sm font-medium">
                  {t("Chi phí kết nối:", "接続コスト:")}
                  <span className="text-amber-300 font-bold ml-1">100 🪙</span>
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl">
                <span className="material-symbols-outlined text-green-300 text-lg">
                  handshake
                </span>
                <span className="text-white/80 text-sm font-medium">
                  {t("Đối tác nhận:", "パートナー受取:")}
                  <span className="text-green-300 font-bold ml-1">70%</span>
                </span>
              </div>

              {/* ── Nạp Token button ── */}
              <button
                onClick={() => setShowTopUp(true)}
                className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#112340] font-headline font-bold text-sm rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-lg">
                  add_circle
                </span>
                {t("Nạp Token", "チャージ")}
              </button>
            </div>
          </div>
        </div>

        {/* ─── Transaction History ─── */}
        <div className="bg-white dark:bg-slate-900 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          {/* Section header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">
                  receipt_long
                </span>
              </div>
              <div>
                <h2 className="font-headline text-lg font-bold text-[#112340] dark:text-white">
                  {t("Lịch sử giao dịch", "取引履歴")}
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  {loading
                    ? "..."
                    : t(
                        `${transactions.length} giao dịch`,
                        `${transactions.length}件の取引`
                      )}
                </p>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-8 py-5 animate-pulse"
                >
                  <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
                    <div className="h-3 bg-slate-50 dark:bg-slate-800/50 rounded w-1/4" />
                  </div>
                  <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-16" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="px-8 py-12 text-center">
              <span className="material-symbols-outlined text-4xl text-red-300 mb-3 block">
                error
              </span>
              <p className="text-sm text-[#94A3B8]">{error}</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && transactions.length === 0 && (
            <div className="px-8 py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-[#CBD5E1]">
                  account_balance_wallet
                </span>
              </div>
              <p className="text-[#94A3B8] font-medium">
                {t("Chưa có giao dịch nào.", "取引はまだありません。")}
              </p>
              <p className="text-xs text-[#CBD5E1] mt-1">
                {t(
                  "Kết nối với đối tác để bắt đầu!",
                  "パートナーとつながって始めましょう！"
                )}
              </p>
            </div>
          )}

          {/* Transaction list */}
          {!loading && !error && transactions.length > 0 && (
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {transactions.map((tx) => {
                const isDebit = tx.type === "debit";
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-4 px-8 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                        {tx.counterpartyAvatarUrl ? (
                          <Image
                            src={tx.counterpartyAvatarUrl}
                            alt={tx.counterpartyName}
                            width={44}
                            height={44}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#94A3B8]">
                            <span className="material-symbols-outlined text-xl">
                              person
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Type indicator dot */}
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center ${
                          isDebit ? "bg-red-400" : "bg-emerald-400"
                        }`}
                      >
                        <span className="material-symbols-outlined text-white text-[10px] font-bold">
                          {isDebit ? "remove" : "add"}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#112340] dark:text-white truncate">
                        {isDebit
                          ? t(
                              `Kết nối với ${tx.counterpartyName}`,
                              `${tx.counterpartyName}に接続`
                            )
                          : t(
                              `Nhận từ ${tx.counterpartyName}`,
                              `${tx.counterpartyName}から受取`
                            )}
                      </p>
                      <p className="text-xs text-[#94A3B8] mt-0.5">
                        {formatTxDate(
                          tx.createdAt,
                          lang === "ja" ? "ja" : "vi"
                        )}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="text-right shrink-0">
                      <span
                        className={`text-sm font-bold tabular-nums ${
                          isDebit
                            ? "text-red-500 dark:text-red-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {isDebit ? "−" : "+"}
                        {tx.amount.toLocaleString()} 🪙
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ── Top-up Token Modal ── */}
      <TopUpTokenModal
        isOpen={showTopUp}
        tokenBalance={balance ?? 0}
        onClose={() => setShowTopUp(false)}
        onConfirm={async (amount, method, discountCode) => {
          if (method === "bank_transfer") {
            try {
              const res = await paymentApi.createPaymentLink(amount, method, discountCode);
              if (res.isFree) {
                // Update balance immediately
                const newBalance = await matchingApi.getBalance();
                setBalance(newBalance.tokenBalance);
                addToast(res.message || "Áp dụng mã thành công!", "success");
              } else if (res.qrCode) {
                setPaymentData(res);
                setShowPaymentCheckout(true);
              } else if (res.checkoutUrl) {
                window.location.href = res.checkoutUrl;
              }
            } catch (err) {
              console.error("Lỗi khi tạo payment link:", err);
              addToast("Có lỗi xảy ra khi tạo link thanh toán.", "error");
            }
          } else {
            console.log(`Top-up: ${amount} tokens via ${method}`);
            addToast(t(`Đã gửi yêu cầu nạp ${amount} tokens qua ${method}`, `${method}経由で${amount}トークンのチャージをリクエストしました`), "success");
          }
          setShowTopUp(false);
        }}
      />

      {/* ── Payment Checkout Modal ── */}
      <PaymentCheckoutModal
        isOpen={showPaymentCheckout}
        paymentData={paymentData}
        initialTokenBalance={balance ?? 0}
        onClose={() => setShowPaymentCheckout(false)}
        onSuccess={(newBalance) => {
          setBalance(newBalance);
          setShowPaymentCheckout(false);
          addToast(t("Nạp Token thành công! Số dư của bạn đã được cập nhật.", "トークンのチャージが完了しました！残高が更新されました。"), "success");
        }}
      />

      <LearnerBottomNav />
    </div>
  );
}
