import React, { useEffect, useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { CreatePaymentLinkResponse, matchingApi } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

const BANK_BINS: Record<string, { shortName: string; name: string }> = {
  "970422": { shortName: "MBBank", name: "Ngân hàng TMCP Quân đội" },
  "970436": { shortName: "Vietcombank", name: "Ngân hàng TMCP Ngoại Thương Việt Nam" },
  "970415": { shortName: "VietinBank", name: "Ngân hàng TMCP Công thương Việt Nam" },
  "970418": { shortName: "BIDV", name: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam" },
  "970405": { shortName: "Agribank", name: "Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam" },
  "970407": { shortName: "Techcombank", name: "Ngân hàng TMCP Kỹ thương Việt Nam" },
  "970432": { shortName: "VPBank", name: "Ngân hàng TMCP Việt Nam Thịnh Vượng" },
  "970423": { shortName: "TPBank", name: "Ngân hàng TMCP Tiên Phong" },
};

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  paymentData: CreatePaymentLinkResponse | null;
  initialTokenBalance: number;
  onClose: () => void;
  onSuccess: (newBalance: number) => void;
}

export default function PaymentCheckoutModal({
  isOpen,
  paymentData,
  initialTokenBalance,
  onClose,
  onSuccess,
}: PaymentCheckoutModalProps) {
  const { t } = useLanguage();
  const backdropRef = useRef<HTMLDivElement>(null);
  
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes = 300 seconds
  const [isExpired, setIsExpired] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  
  // Reset state when modal opens
  if (isOpen && !prevIsOpen) {
    setPrevIsOpen(true);
    setTimeLeft(300);
    setIsExpired(false);
    setCopiedField(null);
  } else if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }

  // Ref to hold the interval ID for polling
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && paymentData) {
      // Countdown timer
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Polling for balance update
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const res = await matchingApi.getBalance();
          if (res.tokenBalance > initialTokenBalance) {
            // Payment successful!
            clearInterval(timer);
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            onSuccess(res.tokenBalance);
          }
        } catch {
          // ignore polling errors
        }
      }, 3000);

      return () => {
        clearInterval(timer);
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      };
    }
  }, [isOpen, paymentData, initialTokenBalance, onSuccess]);

  if (!isOpen || !paymentData) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  const bankInfo = paymentData?.bin ? BANK_BINS[paymentData.bin] : null;
  const bankDisplay = bankInfo ? `${bankInfo.shortName} - ${bankInfo.name}` : paymentData?.bin;

  return (
    <div 
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-[850px] bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors z-20"
        >
          <span className="material-symbols-outlined text-[20px] text-slate-500">close</span>
        </button>

        {/* LEFT SIDE: QR Code & Timer */}
        <div className="w-full md:w-[45%] bg-white dark:bg-slate-900 p-8 md:p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
          <div className="mb-8 text-center">
            <h2 className="font-headline font-bold text-[#112340] dark:text-white text-xl mb-1">{t("Mã QR Thanh toán", "QRコード決済")}</h2>
            <p className="text-sm text-[#94A3B8]">{t("Sử dụng App ngân hàng để quét", "銀行アプリを使用してスキャン")}</p>
          </div>

          <div className="bg-white p-2 rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-700 relative">
            {isExpired && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-[24px]">
                <span className="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
                <p className="font-bold text-[#112340]">Mã đã hết hạn</p>
              </div>
            )}
            <QRCodeSVG 
              value={paymentData?.qrCode || ""} 
              size={200} 
              level="H" 
              includeMargin={true} 
              className="rounded-[16px]"
            />
          </div>

          <div className="mt-8 flex flex-col items-center">
            <span className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider mb-1">{t("Thời gian còn lại", "残り時間")}</span>
            <div className={`text-3xl font-bold font-mono tabular-nums ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-[#112340] dark:text-white'}`}>
              {timeString}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Payment Details */}
        <div className="w-full md:w-[55%] bg-white dark:bg-slate-900 p-8 md:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="font-headline font-bold text-[#112340] dark:text-white text-xl mb-1">{t("Chi tiết thanh toán", "支払い詳細")}</h3>
            <p className="text-sm text-[#94A3B8]">{t("Hoặc chuyển khoản thủ công theo thông tin", "または以下の情報に従って手動で振込を行ってください")}</p>
          </div>

          <div className="space-y-0 divide-y divide-slate-100 dark:divide-slate-800 border-t border-b border-slate-100 dark:border-slate-800">
            {/* Bank Name */}
            <div className="py-4 flex items-center justify-between">
              <div>
                <span className="block text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider mb-0.5">{t("NGÂN HÀNG", "銀行名")}</span>
                <span className="block font-bold text-sm text-[#112340] dark:text-white">{bankDisplay}</span>
              </div>
            </div>

            {/* Account Number */}
            <div className="py-4 flex items-center justify-between">
              <div>
                <span className="block text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider mb-0.5">{t("SỐ TÀI KHOẢN", "口座番号")}</span>
                <span className="block font-bold text-base text-[#112340] dark:text-white font-mono">{paymentData?.accountNumber}</span>
                <span className="block text-[13px] text-slate-500 mt-0.5 uppercase">{paymentData?.accountName}</span>
              </div>
              <button 
                onClick={() => copyToClipboard(paymentData?.accountNumber || "", "account")}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-[#94A3B8] hover:text-[#112340] dark:hover:text-white transition-colors"
                title="Copy"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {copiedField === "account" ? "check" : "content_copy"}
                </span>
              </button>
            </div>

            {/* Amount */}
            <div className="py-4 flex items-center justify-between">
              <div>
                <span className="block text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider mb-0.5">{t("SỐ TIỀN", "金額")}</span>
                <span className="block font-bold text-base text-[#112340] dark:text-white">{paymentData?.amount?.toLocaleString()} VNĐ</span>
              </div>
              <button 
                onClick={() => copyToClipboard(paymentData?.amount?.toString() || "", "amount")}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-[#94A3B8] hover:text-[#112340] dark:hover:text-white transition-colors"
                title="Copy"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {copiedField === "amount" ? "check" : "content_copy"}
                </span>
              </button>
            </div>
          </div>

          {/* Transfer Content - Using Hero Card styling */}
          <div className="mt-6 bg-gradient-to-br from-[#112340] via-[#1E3A5F] to-[#0F172A] rounded-2xl p-5 flex items-center justify-between shadow-lg">
            <div>
              <span className="block text-[10px] font-medium text-white/50 uppercase tracking-wider mb-1">{t("NỘI DUNG CHUYỂN KHOẢN", "振込内容")}</span>
              <span className="block font-bold text-2xl text-white font-mono tracking-widest">{paymentData?.description}</span>
              <span className="block text-[11px] text-amber-300/80 mt-1">{t("* Bắt buộc nhập chính xác nội dung này", "* この内容を正確に入力してください")}</span>
            </div>
            <button 
              onClick={() => copyToClipboard(paymentData?.description || "", "content")}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2 backdrop-blur-sm"
            >
              <span className="material-symbols-outlined text-[18px]">
                {copiedField === "content" ? "check" : "content_copy"}
              </span>
              {copiedField === "content" ? t("Đã copy", "コピー済") : t("Copy", "コピー")}
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[#94A3B8]">
            <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
            <span>{t("Hệ thống đang chờ nhận tiền...", "支払いを確認しています...")}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
