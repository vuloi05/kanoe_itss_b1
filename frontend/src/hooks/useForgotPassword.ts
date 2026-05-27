"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi, ApiException } from "@/lib/api";

// --- Schemas ---

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập email.")
    .email("Email không đúng định dạng."),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export type ForgotPasswordStep = "request" | "otp" | "reset" | "success";

// --- Hook ---

export function useForgotPassword() {
  const [step, setStep] = useState<ForgotPasswordStep>("request");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Countdown timer for OTP (300 seconds = 5 minutes)
  const [timer, setTimer] = useState(300);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  // Manage timer countdown
  useEffect(() => {
    if (isTimerActive && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerActive, timer]);

  const startTimer = () => {
    setTimer(300);
    setIsTimerActive(true);
  };

  // Step 1: Request OTP
  const onRequestOtp = async (data: ForgotPasswordFormData) => {
    setServerError("");
    setIsLoading(true);
    try {
      const res = await authApi.forgotPassword({ email: data.email });
      setEmail(data.email);
      setSuccessMessage(res.message || "Mã OTP đã được gửi đến email của bạn.");
      setStep("otp");
      startTimer();
    } catch (err) {
      if (err instanceof ApiException) {
        setServerError(err.message);
      } else {
        setServerError("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const onVerifyOtp = async (otpCode: string) => {
    setServerError("");
    setIsLoading(true);
    try {
      const res = await authApi.verifyOtp({ email, otp: otpCode });
      setResetToken(res.resetToken);
      setStep("reset");
      // Stop the timer when verified
      setIsTimerActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } catch (err) {
      if (err instanceof ApiException) {
        setServerError(err.message);
      } else {
        setServerError("Mã OTP không chính xác hoặc đã hết hạn.");
      }
      throw err; // throw so component can handle UI states (like clearing input)
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP code
  const onResendOtp = async () => {
    if (isTimerActive) return; // Prevent spamming resend
    setServerError("");
    setIsLoading(true);
    try {
      const res = await authApi.forgotPassword({ email });
      setSuccessMessage(res.message || "Mã OTP mới đã được gửi.");
      startTimer();
    } catch (err) {
      if (err instanceof ApiException) {
        setServerError(err.message);
      } else {
        setServerError("Không thể gửi lại mã OTP lúc này.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const onResetPassword = async (newPassword: string) => {
    setServerError("");
    setIsLoading(true);
    try {
      await authApi.resetPassword({ token: resetToken, newPassword });
      setStep("success");
    } catch (err) {
      if (err instanceof ApiException) {
        setServerError(err.message);
      } else {
        setServerError("Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetFlow = () => {
    setStep("request");
    setEmail("");
    setResetToken("");
    setServerError("");
    setSuccessMessage("");
    setValue("email", "");
    setIsTimerActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return {
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
  };
}
