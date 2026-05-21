"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth, ApiException } from "@/lib/auth";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import SelectPicker from "@/components/common/SelectPicker";

// --- Zod Schema ---

const AGE_OPTIONS = ["18-24", "25-30", "31-40", "40+"] as const;
const JOB_OPTIONS = ["Giáo viên", "Công chức", "Đầu bếp", "Dịch vụ", "Khác"] as const;

const partnerSignupSchema = z.object({
  displayName: z.string().min(1, "Vui lòng nhập họ và tên."),
  email: z
    .string()
    .min(1, "Vui lòng nhập email.")
    .email("Email không đúng định dạng."),
  phone: z
    .string()
    .min(1, "Vui lòng nhập số điện thoại.")
    .regex(/^[0-9\s+()-]{8,15}$/, "Số điện thoại không hợp lệ."),
  age: z.enum(AGE_OPTIONS, { error: "Vui lòng chọn độ tuổi." }),
  job: z.enum(JOB_OPTIONS, { error: "Vui lòng chọn công việc." }),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu.")
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự."),
});

type PartnerSignupFormData = z.infer<typeof partnerSignupSchema>;

// --- Mapped options for SelectPicker ---

const agePickerOptions = AGE_OPTIONS.map((v) => ({ value: v, label: v }));
const jobPickerOptions = JOB_OPTIONS.map((v) => ({ value: v, label: v }));

// --- Component ---

export default function PartnerSignupPage() {
  const router = useRouter();
  const { registerPartner } = useAuth();
  const { t } = useLanguage();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PartnerSignupFormData>({
    resolver: zodResolver(partnerSignupSchema),
    defaultValues: {
      displayName: "",
      email: "",
      phone: "",
      age: undefined,
      job: undefined,
      password: "",
    },
  });

  const onSubmit = async (data: PartnerSignupFormData) => {
    setServerError("");
    try {
      await registerPartner({
        email: data.email,
        password: data.password,
        displayName: data.displayName,
        phone: data.phone || undefined,
        ageRange: data.age,
        job: data.job,
      });
      router.push("/partner/home");
    } catch (err) {
      setServerError(
        err instanceof ApiException ? err.message : "Đã xảy ra lỗi. Vui lòng thử lại."
      );
    }
  };

  const inputBaseClass =
    "w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-1 py-3 text-lg placeholder:text-outline/30 disabled:opacity-50";

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen selection:bg-primary-fixed-dim">
      <header className="bg-[#f9f9f7] sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-6 py-4">
          <Link href="/" className="font-headline text-xl font-bold text-primary tracking-[0.1em]">
            VietImmerse
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="relative flex flex-col md:flex-row h-[calc(100vh-64px)] bg-pattern">
        {/* Left: Hero Image + Text — fixed, no scroll */}
        <section className="hidden md:flex md:w-5/12 relative overflow-hidden bg-primary-container p-12 flex-col justify-end flex-shrink-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
            <Image
              alt="Vietnamese Landscape"
              className="w-full h-full object-cover grayscale brightness-50"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpebGwCDGVJDgoZq6fWhioBr9O9aEhN78wstH7sadhzOOWWuoFmFxL1LRp6PlIInYhFbiEeZA2bm4DaLfrQvbO_J22NFitadECEBpCCOfEuBLcoEGgr3jHJp9JwJH6ld6UkNvPTM6tXJiurZNsNWk0AAUQpg50nn89NfnW7pebsPwYNq9LyO6uEsGvADhk_wTlHuv9R1-1_JsMKBc-VFduYbtjGpsj14Ns11sGLSiBoM2cmgp18TsXJr-oQvx8ctPk6re3L-cl7ux7"
              fill
              sizes="(max-width: 768px) 100vw, 42vw"
            />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="w-16 h-16 bg-secondary flex items-center justify-center rounded-full mb-8">
              <span
                className="material-symbols-outlined text-surface-bright text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                spa
              </span>
            </div>
            <h1 className="font-headline text-4xl font-extrabold text-surface-bright leading-tight">
              {t("Trở thành đối tác", "パートナーになる")}
            </h1>
            <p className="text-surface-container-high text-lg leading-relaxed max-w-md">
              {t(
                "Chia sẻ ngôn ngữ và văn hóa bản địa của bạn với cộng đồng người Nhật.",
                "あなたの言語と文化を日本人のコミュニティに共有しましょう。"
              )}
            </p>
          </div>
        </section>

        {/* Right: Form — scrollable independently */}
        <section className="flex-1 flex flex-col items-center overflow-y-auto p-6 md:p-12 lg:p-24 bg-surface">
          <div className="w-full max-w-lg py-4">
            <form className="space-y-8" onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Server error banner */}
              {serverError && (
                <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm font-medium flex items-center gap-3">
                  <span className="material-symbols-outlined text-error text-xl">error</span>
                  {serverError}
                </div>
              )}

              {/* Họ và tên */}
              <div className="relative group">
                <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2 ml-1">
                  {t("Họ và tên", "氏名")}
                </label>
                <input
                  className={`${inputBaseClass} ${errors.displayName ? "border-error focus:border-error" : ""}`}
                  placeholder="Nguyen Van A"
                  type="text"
                  disabled={isSubmitting}
                  {...register("displayName")}
                />
                {errors.displayName && (
                  <p className="mt-2 text-xs text-error font-medium">{errors.displayName.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="relative group">
                <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2 ml-1">
                  {t("Email", "メールアドレス")}
                </label>
                <input
                  className={`${inputBaseClass} ${errors.email ? "border-error focus:border-error" : ""}`}
                  placeholder="example@mail.com"
                  type="email"
                  disabled={isSubmitting}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-2 text-xs text-error font-medium">{errors.email.message}</p>
                )}
              </div>

              {/* Số điện thoại */}
              <div className="relative group">
                <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2 ml-1">
                  {t("Số điện thoại", "電話番号")}
                </label>
                <input
                  className={`${inputBaseClass} ${errors.phone ? "border-error focus:border-error" : ""}`}
                  placeholder="(+84) 091 234 5678"
                  type="tel"
                  disabled={isSubmitting}
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="mt-2 text-xs text-error font-medium">{errors.phone.message}</p>
                )}
              </div>

              {/* Độ tuổi & Công việc — inline 2 columns with SelectPicker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Độ tuổi */}
                <div className="relative group">
                  <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2 ml-1">
                    {t("Độ tuổi", "年齢")}
                  </label>
                  <Controller
                    name="age"
                    control={control}
                    render={({ field }) => (
                      <SelectPicker
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        options={agePickerOptions}
                        placeholder={t("Chọn độ tuổi", "年齢を選択")}
                        hasError={!!errors.age}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                  {errors.age && (
                    <p className="mt-2 text-xs text-error font-medium">{errors.age.message}</p>
                  )}
                </div>

                {/* Công việc */}
                <div className="relative group">
                  <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2 ml-1">
                    {t("Công việc", "職業")}
                  </label>
                  <Controller
                    name="job"
                    control={control}
                    render={({ field }) => (
                      <SelectPicker
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        options={jobPickerOptions}
                        placeholder={t("Chọn công việc", "職業を選択")}
                        hasError={!!errors.job}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                  {errors.job && (
                    <p className="mt-2 text-xs text-error font-medium">{errors.job.message}</p>
                  )}
                </div>
              </div>

              {/* Giọng bản địa — read-only */}
              <div className="bg-surface-container-low p-6 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-semibold tracking-wider mb-1 uppercase text-on-surface-variant">
                      {t("Giọng bản địa", "方言")}
                    </label>
                    <p className="font-headline text-xl font-bold text-primary">
                      {t("Miền Bắc", "北部")}
                    </p>
                  </div>
                  <span
                    className="material-symbols-outlined text-secondary text-3xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                </div>
              </div>

              {/* Mật khẩu */}
              <div className="relative group">
                <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2 ml-1">
                  {t("Mật khẩu", "パスワード")}
                </label>
                <input
                  className={`${inputBaseClass} ${errors.password ? "border-error focus:border-error" : ""}`}
                  placeholder="••••••••"
                  type="password"
                  disabled={isSubmitting}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="mt-2 text-xs text-error font-medium">{errors.password.message}</p>
                )}
              </div>

              {/* Submit button */}
              <button
                className="w-full bg-primary text-on-primary py-5 rounded-xl font-headline font-bold text-lg shadow-lg hover:bg-primary-container hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                    {t("Đang đăng ký...", "登録中...")}
                  </>
                ) : (
                  <>
                    {t("Đăng ký làm đối tác", "パートナーとして登録する")}
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>

              <p className="text-center text-on-surface-variant text-sm mt-8">
                {t("Đã là đối tác?", "すでにパートナーですか？")}{" "}
                <Link className="text-secondary font-bold hover:underline" href="/login">
                  {t("Đăng nhập tại đây", "ログインはこちら")}
                </Link>
              </p>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
