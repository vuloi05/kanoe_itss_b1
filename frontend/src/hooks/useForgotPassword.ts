"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi, ApiException } from "@/lib/api";

// --- Schema ---

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập email.")
    .email("Email không đúng định dạng."),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// --- Hook ---

export function useForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setServerError("");
    setIsLoading(true);

    try {
      await authApi.forgotPassword({ email: data.email });
      setIsSuccess(true);
    } catch (err) {
      if (err instanceof ApiException) {
        // .NET API returns structured error; surface the message directly
        setServerError(err.message);
      } else {
        setServerError("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    isLoading,
    isSuccess,
    serverError,
    onSubmit,
  };
}
