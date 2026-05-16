"use client";

import PartnerNavbar from "@/components/layout/PartnerNavbar";
import PartnerBottomNav from "@/components/layout/PartnerBottomNav";
import AvatarUploadModal from "@/components/common/AvatarUploadModal";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { authApi } from "@/lib/api";

/**
 * Compute a human-readable relative time string from a UTC ISO date.
 * Returns separate Vietnamese / Japanese strings.
 */
function getRelativeTime(isoDate: string): { vi: string; ja: string } {
  const then = new Date(isoDate).getTime();
  const now = Date.now();
  const diffMs = now - then;

  // Guard against future dates or clock skew
  if (diffMs < 0) return { vi: "Vừa xong", ja: "たった今" };

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return { vi: `${years} năm trước`, ja: `${years}年前` };
  if (months > 0) return { vi: `${months} tháng trước`, ja: `${months}ヶ月前` };
  if (days > 0) return { vi: `${days} ngày trước`, ja: `${days}日前` };
  if (hours > 0) return { vi: `${hours} giờ trước`, ja: `${hours}時間前` };
  if (minutes > 0) return { vi: `${minutes} phút trước`, ja: `${minutes}分前` };
  return { vi: "Vừa xong", ja: "たった今" };
}

type SidebarSection = "profile" | "security";

export default function PartnerSettingsPage() {
  const { t } = useLanguage();
  const { user, updateUser } = useAuth();
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [activeSection, setActiveSection] = useState<SidebarSection>("profile");

  const [passwordChangedLabel, setPasswordChangedLabel] = useState<{
    vi: string;
    ja: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    authApi
      .getProfile()
      .then((profile) => {
        if (!cancelled && profile.passwordChangedAt) {
          setPasswordChangedLabel(getRelativeTime(profile.passwordChangedAt));
        }
      })
      .catch(() => {
        // Silently fail – the label will show fallback text
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const passwordSubtext = passwordChangedLabel
    ? t(
        `Cập nhật ${passwordChangedLabel.vi}`,
        `${passwordChangedLabel.ja}に更新`
      )
    : t("Chưa từng đổi mật khẩu", "パスワード未変更");

  const handleScrollTo = (section: SidebarSection) => {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-background text-on-surface min-h-screen pb-20 md:pb-0">
      <PartnerNavbar />

      <main className="max-w-7xl mx-auto px-6 pt-12 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* ── Sidebar Navigation ── */}
          <aside className="md:col-span-3">
            <div className="sticky top-24 space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-primary mb-2 tracking-tight font-headline">
                  {t("Cài đặt", "設定")}
                </h1>
                <p className="text-secondary text-sm font-medium tracking-widest uppercase">
                  {t("Settings", "設定")}
                </p>
              </div>

              <nav className="flex flex-col gap-1">
                <button
                  onClick={() => handleScrollTo("profile")}
                  className={`group flex items-center gap-4 py-3 px-4 rounded-xl transition-all duration-300 text-left ${
                    activeSection === "profile"
                      ? "bg-surface-container-lowest engawa-shadow text-primary font-semibold"
                      : "text-secondary hover:bg-surface-container-low"
                  }`}
                >
                  <span className="material-symbols-outlined">person_pin</span>
                  <div className="flex flex-col">
                    <span className="text-sm">
                      {t("Hồ sơ đối tác", "パートナープロフィール")}
                    </span>
                    <span className="text-[10px] opacity-60 font-normal">
                      {t("Partner Profile", "パートナープロフィール")}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => handleScrollTo("security")}
                  className={`group flex items-center gap-4 py-3 px-4 rounded-xl transition-all duration-300 text-left ${
                    activeSection === "security"
                      ? "bg-surface-container-lowest engawa-shadow text-primary font-semibold"
                      : "text-secondary hover:bg-surface-container-low"
                  }`}
                >
                  <span className="material-symbols-outlined">shield_lock</span>
                  <div className="flex flex-col">
                    <span className="text-sm">
                      {t("Tài khoản & Bảo mật", "アカウントとセキュリティ")}
                    </span>
                    <span className="text-[10px] opacity-60 font-normal">
                      {t("Account & Security", "アカウントとセキュリティ")}
                    </span>
                  </div>
                </button>
              </nav>

              {/* Decorative Lotus Motif */}
              <div className="pt-8 opacity-10 hidden md:block">
                <svg
                  className="w-32 h-32 fill-primary"
                  viewBox="0 0 100 100"
                >
                  <path d="M50 10C50 10 30 40 30 60C30 75 40 85 50 85C60 85 70 75 70 60C70 40 50 10 50 10Z" />
                  <path d="M50 20C50 20 65 45 65 60C65 70 58 78 50 78C42 78 35 70 35 60C35 45 50 20 50 20Z" />
                </svg>
              </div>
            </div>
          </aside>

          {/* ── Main Content Area ── */}
          <div className="md:col-span-9 space-y-16">
            {/* Section: Partner Profile */}
            <section className="scroll-mt-24" id="profile">
              <div className="flex items-end justify-between mb-8 border-b border-outline-variant/20 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-primary font-headline">
                    {t("Hồ sơ đối tác", "パートナープロフィール")}
                  </h2>
                  <p className="text-secondary/70 text-sm italic">
                    {t("Partner Profile", "パートナープロフィール")}
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container text-on-primary text-xs font-bold tracking-wider uppercase">
                  <span
                    className="material-symbols-outlined text-sm"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    verified
                  </span>
                  {t(
                    "Xác minh giọng Bắc",
                    "北部訛り認定済"
                  )}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Avatar */}
                <div className="lg:col-span-1">
                  <div className="aspect-square rounded-full overflow-hidden bg-surface-container relative group cursor-pointer border-4 border-surface-container-lowest engawa-shadow">
                    <Image
                      src={
                        user?.avatarUrl ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || "Partner"}&backgroundColor=c0aede`
                      }
                      alt="Partner Avatar"
                      className="w-full h-full object-cover"
                      width={300}
                      height={300}
                      unoptimized
                    />
                    <button
                      onClick={() => setShowAvatarModal(true)}
                      className="absolute inset-0 bg-primary/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-white text-3xl">
                        photo_camera
                      </span>
                    </button>
                  </div>
                  <p className="text-center mt-4 text-xs text-secondary font-medium uppercase tracking-widest">
                    {t(
                      "Thay đổi ảnh đại diện",
                      "プロフィール写真を変更"
                    )}
                  </p>
                </div>

                {/* Profile Fields */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="group">
                    <label className="block text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">
                      {t("Họ tên", "フルネーム")}
                    </label>
                    <input
                      className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary focus:ring-0 transition-all duration-300 py-2 text-lg font-medium text-primary outline-none"
                      type="text"
                      defaultValue={user?.displayName || ""}
                      placeholder={t("Nhập họ tên", "名前を入力")}
                    />
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">
                      {t("Giới thiệu bản thân", "自己紹介")}
                    </label>
                    <textarea
                      className="w-full bg-surface-container-low border-none rounded-xl focus:ring-1 focus:ring-primary/20 transition-all duration-300 p-4 text-sm leading-relaxed text-on-surface-variant outline-none resize-none"
                      rows={4}
                      defaultValue={t(
                        "Xin chào! Tôi là người Hà Nội gốc với hơn 5 năm kinh nghiệm dạy tiếng Việt cho người Nhật. Tôi tập trung vào việc chuẩn hóa phát âm và ngữ điệu đặc trưng của miền Bắc...",
                        "こんにちは！ハノイ出身で、日本人にベトナム語を教えて5年以上の経験があります。北部特有の発音とイントネーションの標準化に力を入れています..."
                      )}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Account & Security */}
            <section className="scroll-mt-24" id="security">
              <div className="mb-8 border-b border-outline-variant/20 pb-4">
                <h2 className="text-2xl font-bold text-primary font-headline">
                  {t("Tài khoản & Bảo mật", "アカウントとセキュリティ")}
                </h2>
                <p className="text-secondary/70 text-sm italic">
                  {t("Account & Security", "アカウントとセキュリティ")}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email Card */}
                <div className="p-6 bg-surface-container-lowest rounded-xl engawa-shadow flex items-center justify-between group cursor-pointer hover:bg-primary transition-colors duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined">mail</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-primary group-hover:text-white">
                        {t("Email", "メール")}
                      </h3>
                      <p className="text-xs text-secondary group-hover:text-white/70">
                        {user?.email || "Loading..."}
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant group-hover:text-white">
                    chevron_right
                  </span>
                </div>

                {/* Change Password Card */}
                <Link
                  href="/change-password"
                  className="p-6 bg-surface-container-lowest rounded-xl engawa-shadow flex items-center justify-between group cursor-pointer hover:bg-primary transition-colors duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined">
                        lock_reset
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-primary group-hover:text-white">
                        {t("Đổi mật khẩu", "パスワード変更")}
                      </h3>
                      <p className="text-xs text-secondary group-hover:text-white/70">
                        {passwordSubtext}
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant group-hover:text-white">
                    chevron_right
                  </span>
                </Link>
              </div>
            </section>

            {/* Save Action */}
            <div className="flex justify-end pt-8">
              <button className="bg-primary text-white px-10 py-4 rounded-full font-bold text-sm tracking-widest uppercase hover:bg-primary/90 transition-all duration-300 engawa-shadow flex items-center gap-2">
                <span>
                  {t("Lưu thay đổi", "変更を保存")}
                </span>
                <span className="material-symbols-outlined text-sm">save</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <PartnerBottomNav />

      {/* Avatar Upload Modal */}
      <AvatarUploadModal
        open={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        onSuccess={(avatarUrl) => updateUser({ avatarUrl })}
        currentAvatarUrl={user?.avatarUrl}
      />
    </div>
  );
}
