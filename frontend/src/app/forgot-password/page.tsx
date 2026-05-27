"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { useForgotPassword } from "@/hooks/useForgotPassword";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const {
    step,
    email,
    timer,
    isTimerActive,
    register,
    handleSubmit,
    errors,
    isLoading,
    serverError,
    successMessage,
    onRequestOtp,
    onVerifyOtp,
    onResendOtp,
    onResetPassword,
    resetFlow,
  } = useForgotPassword();

  // OTP Verification States
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
  const [otpError, setOtpError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password Reset States
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");

  // Clear OTP fields when modal is shown or reset
  useEffect(() => {
    if (step === "otp") {
      setOtpValues(Array(6).fill(""));
      setOtpError("");
      // Focus on first input box
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 300);
    }
  }, [step]);

  // Format countdown timer (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle OTP Input changes
  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    const value = element.value.replace(/[^0-9]/g, ""); // Allow only numeric digits
    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all digits are entered
    const completedOtp = newOtp.join("");
    if (completedOtp.length === 6) {
      submitOtpCode(completedOtp);
    }
  };

  // Handle OTP input KeyDown (for Backspace)
  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      const newOtp = [...otpValues];
      // If current box is empty, delete previous and focus it
      if (!otpValues[index]) {
        if (index > 0) {
          newOtp[index - 1] = "";
          setOtpValues(newOtp);
          inputRefs.current[index - 1]?.focus();
        }
      } else {
        newOtp[index] = "";
        setOtpValues(newOtp);
      }
      setOtpError("");
    }
  };

  // Handle OTP copy-paste
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split("");
      setOtpValues(newOtp);
      inputRefs.current[5]?.focus();
      submitOtpCode(pastedData);
    }
  };

  // Submit OTP Code to verify
  const submitOtpCode = async (code: string) => {
    setOtpError("");
    try {
      await onVerifyOtp(code);
    } catch (err: any) {
      setOtpError(err?.message || t("Mã OTP không hợp lệ.", "無効なOTPコードです。"));
      // Clear fields on error to let user re-try
      setOtpValues(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    }
  };

  // Handle Resubmit New Password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");

    if (newPassword.length < 8) {
      setResetError(t("Mật khẩu phải dài ít nhất 8 ký tự.", "パスワードは8文字以上である必要があります。"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError(t("Mật khẩu xác nhận không khớp.", "確認用パスワードが一致しません。"));
      return;
    }

    await onResetPassword(newPassword);
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-surface font-body text-on-surface relative">
      
      {/* Background Section (Lake & Slogan) */}
      <section className="relative w-full md:w-1/2 lg:w-3/5 h-64 md:h-auto overflow-hidden">
        <div className="absolute inset-0 bg-primary/40 z-10"></div>
        <Image 
          className="absolute inset-0 w-full h-full object-cover" 
          alt="Hoan Kiem Lake" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4NAYyN5r12cV5HVXXRY5Y6pY0GHQk0fRHo0L2dbMtl4sQ3M6wCCcEWGj9EynQ7n5dMSLFN5DCntjFf2HejStjdajAdis5CNKeZAfF2f8DIflaHE86FHTiVuyE2lMz4vTGZYljk8UOPvN7P_kC24FV6xtoB8Pwdm3y4PdwYJRPjoh8LF3MPo8YS4k62wk5fyglmnWExda5HQf7OEq30y67umGP6N1hPxRx1iIXyuvlcsv7hQ0TWHxRGCyPfon8TTbM2xfq8dyqTIU" 
          fill 
          sizes="(max-width: 768px) 100vw, 60vw" 
          priority
        />
        <div className="relative z-20 h-full flex flex-col justify-between p-8 md:p-16">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lotus-gradient rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl" style={{fontVariationSettings:'"FILL" 1'}}>spa</span>
              </div>
              <span className="font-headline font-bold text-xl tracking-wide text-white">VietImmerse</span>
            </div>
            <div className="bg-white/10 rounded-xl backdrop-blur-sm">
              <LanguageSwitcher />
            </div>
          </div>
          <div className="max-w-xl">
            <h1 className="font-headline font-extrabold text-4xl md:text-5xl text-white leading-tight">
              {t("Gắn kết sâu sắc hơn với miền Bắc", "北部の心と繋がる。")}
            </h1>
          </div>
          <div className="text-white/60 text-sm tracking-widest uppercase">Northern Vietnamese Dialect Mastery</div>
        </div>
      </section>

      {/* Interactive Form Section */}
      <section className="w-full md:w-1/2 lg:w-2/5 bg-surface-container-lowest flex items-center justify-center p-8 md:p-12 lg:p-20 relative">
        <div className="w-full max-w-md">
          
          <Link 
            href="/login" 
            onClick={resetFlow}
            className="inline-flex items-center text-secondary hover:text-primary transition-colors mb-12 font-medium group"
          >
            <span className="material-symbols-outlined mr-2 group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span className="text-sm">{t("Quay lại Đăng nhập", "ログインに戻る")}</span>
          </Link>

          {/* STEP 1: Enter email to request OTP */}
          {step === "request" && (
            <>
              <div className="mb-10">
                <h2 className="font-headline text-3xl font-bold text-primary mb-4">
                  {t("Quên mật khẩu?", "パスワードをお忘れですか？")}
                </h2>
                <p className="text-on-surface-variant leading-relaxed">
                  {t("Nhập email của bạn để nhận mã xác thực OTP khôi phục mật khẩu.", "パスワード再設定用のOTP認証コードを送信します。")}
                </p>
              </div>

              <form className="space-y-8" onSubmit={handleSubmit(onRequestOtp)}>
                {serverError && (
                  <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm font-medium flex items-center gap-3">
                    <span className="material-symbols-outlined text-error text-xl">error</span>
                    {serverError}
                  </div>
                )}

                <div className="relative group">
                  <label className="block text-xs font-bold tracking-widest text-primary uppercase mb-2">
                    {t("EMAIL KHAI BÁO", "ご登録のメールアドレス")}
                  </label>
                  <input
                    className={`w-full bg-transparent border-0 border-b py-3 px-0 focus:ring-0 placeholder:text-outline-variant/60 ${errors.email ? "border-error focus:border-error" : "border-outline-variant focus:border-primary"}`}
                    placeholder="example@email.com"
                    type="text"
                    disabled={isLoading}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="mt-2 text-xs text-error font-medium">{errors.email.message}</p>
                  )}
                </div>

                <button 
                  className="w-full bg-primary text-on-primary py-4 rounded-xl font-headline font-bold hover:bg-primary-container transition-all shadow-lg flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed" 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                      {t("Đang xử lý...", "送信中...")}
                    </>
                  ) : (
                    <>
                      <span>{t("Gửi mã xác thực OTP", "OTPコードを送信")}</span>
                      <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">send</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* STEP 3: Enter new password (after OTP verified) */}
          {step === "reset" && (
            <>
              <div className="mb-10">
                <h2 className="font-headline text-3xl font-bold text-primary mb-4">
                  {t("Đặt lại mật khẩu", "パスワードの再設定")}
                </h2>
                <p className="text-on-surface-variant leading-relaxed">
                  {t("Tạo mật khẩu mới an toàn cho tài khoản của bạn.", "アカウントの新しいパスワードを入力してください。")}
                </p>
              </div>

              <form className="space-y-8" onSubmit={handleResetSubmit}>
                {(resetError || serverError) && (
                  <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm font-medium flex items-center gap-3">
                    <span className="material-symbols-outlined text-error text-xl">error</span>
                    {resetError || serverError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                    {t("Mật khẩu mới", "新しいパスワード")}
                  </label>
                  <input 
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-3" 
                    placeholder="••••••••" 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    required 
                    minLength={8} 
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                    {t("Xác nhận mật khẩu", "パスワードの確認")}
                  </label>
                  <input 
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-3" 
                    placeholder="••••••••" 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    minLength={8} 
                    disabled={isLoading}
                  />
                </div>

                <button 
                  className="w-full bg-primary text-on-primary py-4 rounded-xl font-headline font-bold hover:bg-primary-container transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3" 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                      {t("Đang cập nhật...", "更新中...")}
                    </>
                  ) : (
                    t("Đặt lại mật khẩu", "パスワードをリセット")
                  )}
                </button>
              </form>
            </>
          )}

          {/* STEP 4: Success confirmation screen */}
          {step === "success" && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="text-center p-8 bg-primary-container/30 border border-primary/20 rounded-3xl">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-4xl font-bold">check_circle</span>
                </div>
                <h3 className="font-headline font-extrabold text-2xl text-primary mb-3">
                  {t("Đặt lại thành công!", "パスワード再設定完了！")}
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  {t("Mật khẩu của bạn đã được cập nhật thành công. Hãy đăng nhập để tiếp tục học tiếng Việt miền Bắc.", "パスワードが正常に更新されました。ログインして学習を再 khai してください。")}
                </p>
              </div>
              <Link 
                href="/login" 
                onClick={resetFlow}
                className="block w-full bg-primary text-on-primary py-4 rounded-xl font-headline font-bold text-center hover:bg-primary-container transition-all shadow-lg"
              >
                {t("Đăng nhập ngay", "今すぐログイン")}
              </Link>
            </div>
          )}

          {/* Footer Contact Info */}
          {step !== "success" && (
            <div className="mt-16 pt-8 border-t border-surface-container flex flex-col items-center gap-4">
              <p className="text-sm text-on-surface-variant text-center">{t("Cần hỗ trợ thêm?", "ヘルプが必要ですか？")}</p>
              <a className="text-primary font-bold text-sm hover:underline" href="#">{t("Liên hệ Trung tâm hỗ trợ", "サポートセンターへ連絡")}</a>
            </div>
          )}

        </div>
      </section>

      {/* PREMIUM GLASSMORPHISM OTP POPUP MODAL (Renders during STEP 2) */}
      {step === "otp" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col items-center text-center">
            
            {/* Close modal button */}
            <button 
              onClick={resetFlow}
              className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-full transition-all"
              title={t("Hủy bỏ", "キャンセル")}
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>

            {/* Verification Header Logo */}
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 animate-pulse">
              <span className="material-symbols-outlined text-3xl font-bold">mail</span>
            </div>

            <h3 className="font-headline font-bold text-2xl text-primary mb-2">
              {t("Nhập mã OTP", "OTPコードを入力")}
            </h3>
            
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
              {t("Mã OTP gồm 6 chữ số đã được gửi đến email:", "6桁の認証コードを次のアドレスに送信しました:")}<br/>
              <strong className="text-primary">{email}</strong>
            </p>

            {/* Error notifications */}
            {(otpError || serverError) && (
              <div className="w-full p-4 mb-6 bg-error-container text-on-error-container rounded-2xl text-xs font-semibold flex items-center gap-3">
                <span className="material-symbols-outlined text-error text-lg">error</span>
                <span className="text-left leading-tight">{otpError || serverError}</span>
              </div>
            )}

            {/* Resend success notice */}
            {successMessage && !otpError && !serverError && (
              <div className="w-full p-4 mb-6 bg-primary-container text-on-primary-container rounded-2xl text-xs font-semibold flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                <span className="text-left leading-tight">{successMessage}</span>
              </div>
            )}

            {/* 6 Digit OTP input fields */}
            <div className="flex gap-2 justify-center mb-6 w-full max-w-[320px]">
              {otpValues.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  disabled={isLoading}
                  onChange={(e) => handleOtpChange(e.target, idx)}
                  onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                  onPaste={handleOtpPaste}
                  className="w-12 h-14 text-center text-xl font-bold bg-surface-container rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-primary outline-none"
                />
              ))}
            </div>

            {/* Timer countdown visual indicator */}
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-amber-600 text-lg animate-spin" style={{ animationDuration: '6s' }}>schedule</span>
              <span className="text-xs font-semibold text-amber-600">
                {t("Mã hết hạn trong: ", "コードの有効期限: ")}
                <span className="font-mono text-sm font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {formatTime(timer)}
                </span>
              </span>
            </div>

            {/* Action Buttons (Resend / Verify manually) */}
            <div className="w-full pt-4 border-t border-outline-variant/30 flex flex-col gap-4 items-center">
              
              <div className="text-sm">
                <span className="text-on-surface-variant">
                  {t("Chưa nhận được mã? ", "コードが届かない場合 ")}
                </span>
                {timer > 0 ? (
                  <span className="text-secondary opacity-60 font-semibold cursor-not-allowed">
                    {t(`Gửi lại sau (${timer}s)`, `再送信まで (${timer}秒)`)}
                  </span>
                ) : (
                  <button
                    onClick={onResendOtp}
                    disabled={isLoading}
                    className="text-primary hover:text-primary-container font-bold hover:underline focus:outline-none transition-all disabled:opacity-50"
                  >
                    {t("Gửi lại mã OTP", "コードを再送信")}
                  </button>
                )}
              </div>

              <button
                onClick={resetFlow}
                className="text-xs text-on-surface-variant hover:text-error transition-all font-semibold uppercase tracking-wider mt-2"
              >
                {t("Hủy bỏ giao dịch", "取引をキャンセル")}
              </button>

            </div>

          </div>
        </div>
      )}

    </main>
  );
}
