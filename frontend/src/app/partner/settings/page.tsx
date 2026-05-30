"use client";

import PartnerNavbar from "@/components/layout/PartnerNavbar";
import PartnerBottomNav from "@/components/layout/PartnerBottomNav";
import AvatarUploadModal from "@/components/common/AvatarUploadModal";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/lib/auth";
import { useState, useEffect, useRef } from "react";
import { authApi, userApi } from "@/lib/api";

/**
 * Compute a human-readable relative time string from a UTC ISO date.
 * Returns separate Vietnamese / Japanese strings.
 */
function getRelativeTime(isoDate: string): { vi: string; ja: string } {
  const then = new Date(isoDate).getTime();
  const now = Date.now();
  const diffMs = now - then;

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

const BIO_MAX_LENGTH = 2000;
const NAME_MAX_LENGTH = 100;

export default function PartnerSettingsPage() {
  const { t } = useLanguage();
  const { user, updateUser } = useAuth();
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [activeSection, setActiveSection] = useState<SidebarSection>("profile");

  const [passwordChangedLabel, setPasswordChangedLabel] = useState<{
    vi: string;
    ja: string;
  } | null>(null);

  // ── Profile inline editing state ──
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nameText, setNameText] = useState("");
  const [bioText, setBioText] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [originalBio, setOriginalBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    authApi
      .getProfile()
      .then((profile) => {
        if (cancelled) return;
        if (profile.passwordChangedAt) {
          setPasswordChangedLabel(getRelativeTime(profile.passwordChangedAt));
        }
        const serverName = profile.displayName ?? "";
        const serverBio = profile.bio ?? "";
        setNameText(serverName);
        setBioText(serverBio);
        setOriginalName(serverName);
        setOriginalBio(serverBio);
      })
      .catch(() => {
        // Silently fail – fallback values stay
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-focus name input when entering edit mode
  useEffect(() => {
    if (isEditingProfile && nameInputRef.current) {
      nameInputRef.current.focus();
      const len = nameInputRef.current.value.length;
      nameInputRef.current.setSelectionRange(len, len);
    }
  }, [isEditingProfile]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleStartEdit = () => {
    setOriginalName(nameText);
    setOriginalBio(bioText);
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setNameText(originalName);
    setBioText(originalBio);
    setIsEditingProfile(false);
  };

  const handleSaveProfile = async () => {
    const trimmedName = nameText.trim();
    const trimmedBio = bioText.trim();

    if (!trimmedName) {
      showToast("error", t("Họ tên không được để trống.", "名前は空にできません。"));
      return;
    }

    // No-op if nothing changed
    if (trimmedName === originalName.trim() && trimmedBio === originalBio.trim()) {
      setIsEditingProfile(false);
      return;
    }

    setIsSaving(true);
    try {
      const result = await userApi.updateProfile({ name: trimmedName, bio: trimmedBio });
      const newName = result.displayName ?? trimmedName;
      const newBio = result.bio ?? trimmedBio;
      setNameText(newName);
      setBioText(newBio);
      setOriginalName(newName);
      setOriginalBio(newBio);
      updateUser({ displayName: newName, bio: newBio });
      setIsEditingProfile(false);
      showToast("success", t("🎉 Cập nhật hồ sơ thành công!", "🎉 プロフィールを更新しました！"));
    } catch {
      showToast("error", t("Không thể lưu thay đổi. Vui lòng thử lại.", "変更を保存できませんでした。もう一度お試しください。"));
    } finally {
      setIsSaving(false);
    }
  };

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
                <svg className="w-32 h-32 fill-primary" viewBox="0 0 100 100">
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
              {/* ── Section Header — Edit button lives here ── */}
              <div className="flex items-end justify-between mb-8 border-b border-outline-variant/20 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-primary font-headline">
                    {t("Hồ sơ đối tác", "パートナープロフィール")}
                  </h2>
                  <p className="text-secondary/70 text-sm italic">
                    {t("Partner Profile", "パートナープロフィール")}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container text-on-primary text-xs font-bold tracking-wider uppercase">
                    <span
                      className="material-symbols-outlined text-sm"
                      style={{ fontVariationSettings: '"FILL" 1' }}
                    >
                      verified
                    </span>
                    {t("Xác minh giọng Bắc", "北部訛り認定済")}
                  </span>

                  {/* Global Edit / Cancel toggle */}
                  {!isEditingProfile ? (
                    <button
                      onClick={handleStartEdit}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-primary border border-primary/30 hover:bg-primary hover:text-white transition-all duration-300"
                      id="btn-edit-profile"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      {t("Chỉnh sửa", "編集")}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/40">
                      <span className="material-symbols-outlined text-sm">edit_note</span>
                      {t("Đang chỉnh sửa", "編集中")}
                    </span>
                  )}
                </div>
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
                    {t("Thay đổi ảnh đại diện", "プロフィール写真を変更")}
                  </p>
                </div>

                {/* Profile Fields */}
                <div className="lg:col-span-2 space-y-6">
                  {/* ── Name Field ── */}
                  <div className="group">
                    <label className="block text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">
                      {t("Họ tên", "フルネーム")}
                    </label>

                    {isEditingProfile ? (
                      <input
                        ref={nameInputRef}
                        type="text"
                        value={nameText}
                        onChange={(e) => setNameText(e.target.value)}
                        maxLength={NAME_MAX_LENGTH}
                        className="w-full bg-transparent border-b-2 border-primary/40 focus:border-primary focus:ring-0 transition-all duration-300 py-2 text-lg font-medium text-primary outline-none"
                        placeholder={t("Nhập họ tên", "名前を入力")}
                      />
                    ) : (
                      <p className="py-2 text-lg font-medium text-primary border-b border-outline-variant/30">
                        {nameText || user?.displayName || "—"}
                      </p>
                    )}
                  </div>

                  {/* ── Bio Field ── */}
                  <div className="group">
                    <label className="block text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">
                      {t("Giới thiệu bản thân", "自己紹介")}
                    </label>

                    {isEditingProfile ? (
                      <div>
                        <textarea
                          value={bioText}
                          onChange={(e) => setBioText(e.target.value)}
                          maxLength={BIO_MAX_LENGTH}
                          className="w-full bg-surface-container-low border-2 border-primary/30 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 p-4 text-sm leading-relaxed text-on-surface-variant outline-none resize-none"
                          rows={5}
                          placeholder={t(
                            "Hãy giới thiệu bản thân để học viên hiểu thêm về bạn...",
                            "自己紹介を書いて、生徒にもっと知ってもらいましょう..."
                          )}
                        />
                        <p className="mt-1 text-right text-[10px] text-secondary/60 tabular-nums">
                          {bioText.length}/{BIO_MAX_LENGTH}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-surface-container-low rounded-xl p-4 text-sm leading-relaxed text-on-surface-variant min-h-[6rem] whitespace-pre-wrap">
                        {bioText || (
                          <span className="italic text-secondary/50">
                            {t("Chưa có giới thiệu...", "自己紹介がまだありません...")}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ── Action buttons (only visible in edit mode) ── */}
                  <div
                    className={`flex justify-end gap-3 transition-all duration-300 ${
                      isEditingProfile
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2 pointer-events-none h-0 overflow-hidden"
                    }`}
                  >
                    <button
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="px-6 py-2.5 rounded-full text-sm font-medium text-secondary bg-surface-container hover:bg-surface-container-high transition-all duration-200 disabled:opacity-50"
                    >
                      {t("Hủy", "キャンセル")}
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-primary hover:bg-primary/90 transition-all duration-200 engawa-shadow flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      id="btn-save-profile"
                    >
                      {isSaving ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                          {t("Đang lưu...", "保存中...")}
                        </>
                      ) : (
                        <>
                          {t("Lưu thay đổi", "変更を保存")}
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                            <polyline points="17 21 17 13 7 13 7 21" />
                            <polyline points="7 3 7 8 15 8" />
                          </svg>
                        </>
                      )}
                    </button>
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
                {/* Token Wallet Card */}
                <Link
                  href="/partner/wallet"
                  className="p-6 bg-surface-container-lowest rounded-xl engawa-shadow flex items-center justify-between group cursor-pointer hover:bg-primary transition-colors duration-300 md:col-span-2"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-yellow-50 dark:from-amber-900/40 dark:to-yellow-900/20 flex items-center justify-center group-hover:bg-primary-container transition-colors">
                      <span className="text-2xl">🪙</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-primary group-hover:text-white">
                        {t("Ví Token", "トークンウォレット")}
                      </h3>
                      <p className="text-xs text-secondary group-hover:text-white/70">
                        {t("Xem số dư & lịch sử nhận tiền", "残高と受取履歴を確認")}
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant group-hover:text-white">
                    chevron_right
                  </span>
                </Link>

                {/* Email Card (Read-only) */}
                <div className="p-6 bg-surface-container-lowest rounded-xl engawa-shadow flex items-center justify-between cursor-default">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">mail</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-primary">
                        {t("Email", "メール")}
                      </h3>
                      <p className="text-xs text-secondary">
                        {user?.email || "Loading..."}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <span className="material-symbols-outlined text-base">lock</span>
                    <span className="text-[10px] font-medium uppercase tracking-wider hidden sm:inline">
                      {t("Cố định", "固定")}
                    </span>
                  </div>
                </div>

                {/* Change Password Card */}
                <Link
                  href="/change-password"
                  className="p-6 bg-surface-container-lowest rounded-xl engawa-shadow flex items-center justify-between group cursor-pointer hover:bg-primary transition-colors duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined">lock_reset</span>
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

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl text-white text-sm font-medium transition-all duration-500 animate-[slideUp_0.4s_ease-out] ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          {toast.message}
        </div>
      )}
    </div>
  );
}
