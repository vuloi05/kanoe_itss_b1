"use client";

import PartnerNavbar from "@/components/layout/PartnerNavbar";
import PartnerBottomNav from "@/components/layout/PartnerBottomNav";
import AvatarUploadModal from "@/components/common/AvatarUploadModal";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/lib/auth";
import { useState, useEffect, useRef } from "react";
import { authApi, userApi, matchingApi } from "@/lib/api";

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
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [bankName, setBankName] = useState<string>("Vietcombank");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);

  const [passwordChangedLabel, setPasswordChangedLabel] = useState<{
    vi: string;
    ja: string;
  } | null>(null);

  // ── Token balance state ──
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);

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

    matchingApi
      .getBalance()
      .then((data) => {
        if (!cancelled) setTokenBalance(data.tokenBalance);
      })
      .catch(() => {
        // Silently fail – balance will show skeleton
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
                <div className="lg:col-span-1 flex flex-col items-center">
                  <div className="w-48 h-48 rounded-full overflow-hidden bg-surface-container relative group cursor-pointer border-4 border-surface-container-lowest engawa-shadow">
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

                {/* ── Rút Token Card ── */}
                <div className="p-6 bg-surface-container-lowest rounded-xl engawa-shadow space-y-4">
                  {/* Header */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">payments</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-primary font-headline">
                        {t("Rút Token", "トークンの換金")}
                      </h3>
                      <p className="text-xs text-secondary">
                        {t("Rút Token thành tiền", "トークンの換金")}
                      </p>
                    </div>
                  </div>

                  {/* Balance */}
                  <div className="bg-surface-container-low p-4 rounded-xl">
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1 font-label">
                      {t("Số dư hiện tại", "現在の残高")}
                    </p>
                    <p className="text-2xl font-bold text-primary tabular-nums">
                      {tokenBalance !== null ? (
                        <>{tokenBalance.toLocaleString()} Tokens</>
                      ) : (
                        <span className="inline-block w-32 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                      )}
                    </p>
                  </div>

                  {/* Withdraw button */}
                  <button
                    onClick={() => setIsWithdrawModalOpen(true)}
                    className="block w-full text-center bg-primary text-white py-3 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-primary/90 transition-all duration-300 font-label"
                    id="btn-withdraw-token"
                  >
                    {t("Rút tiền", "換金する")}
                  </button>

                  {/* Info note */}
                  <p className="text-[10px] text-center text-on-surface-variant italic">
                    {t(
                      "1 Token = 1,000 VNĐ. Xử lý trong 24-48h.",
                      "1トークン = 1,000 VNĐ。24〜48時間以内に処理されます。"
                    )}
                  </p>
                </div>
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
          className={`fixed top-6 right-6 z-[999] flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl text-white text-sm font-medium transition-all duration-500 animate-[slideInRight_0.4s_ease-out] ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          {toast.message}
        </div>
      )}

      {/* Withdraw Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111418]/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] w-full max-w-[420px] p-8 relative shadow-2xl animate-[fadeInUp_0.3s_ease-out]">
            {/* Close */}
            <button 
              onClick={() => setIsWithdrawModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            {/* Title */}
            <div className="mb-6">
              <h2 className="text-[28px] font-bold text-[#142c48] mb-1 leading-tight">{t("Rút Token", "トークンの換金")}</h2>
              <p className="text-[13px] text-[#142c48]/70 font-medium">{t("Rút Token thành tiền", "トークンを現金に換金します")}</p>
            </div>

            {/* Balance Card */}
            <div className="bg-[#fcfcfa] border-l-[3px] border-[#a67c52] rounded-xl p-4 flex gap-4 items-center mb-6 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-[#f4ebd8] flex items-center justify-center text-[#a67c52]">
                <span className="material-symbols-outlined text-xl">toll</span>
              </div>
              <div>
                <p className="text-[9px] font-bold text-[#a67c52] uppercase mb-1 tracking-wider">
                  {t("Số dư hiện tại", "現在の残高")}
                </p>
                <p className="text-[15px] font-bold text-[#142c48]">
                  {tokenBalance?.toLocaleString() || "1,250"} {t("Tokens", "トークン")}
                </p>
              </div>
            </div>

            <div className="space-y-6 mb-8">
              {/* Amount */}
              <div>
                <p className="text-[9px] font-bold text-[#142c48]/50 mb-2 uppercase tracking-wider">{t("Số lượng muốn rút", "換金額")}</p>
                <div className="flex justify-between items-end border-b border-gray-200 pb-2">
                  <input 
                    type="number" 
                    value={withdrawAmount} 
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="text-lg font-semibold text-[#142c48] bg-transparent outline-none w-full"
                  />
                  <span className="text-[10px] font-bold text-[#a67c52] uppercase tracking-wider mb-1">{t("TOKENS", "トークン")}</span>
                </div>
              </div>

              {/* Bank Name */}
              <div className="relative">
                <p className="text-[9px] font-bold text-[#142c48]/50 mb-2 uppercase tracking-wider">{t("Tên ngân hàng", "銀行名")}</p>
                <div 
                  className="border-b border-gray-200 pb-2 flex items-center justify-between cursor-pointer group"
                  onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                >
                  <span className="text-base font-semibold text-[#142c48]">
                    {bankName}
                  </span>
                  <span 
                    className="material-symbols-outlined text-[#142c48]/50 text-xl transition-transform duration-200 group-hover:text-[#142c48]" 
                    style={{ transform: isBankDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    expand_more
                  </span>
                </div>

                {/* Custom Dropdown List */}
                {isBankDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsBankDropdownOpen(false)}></div>
                    <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 max-h-48 overflow-y-auto animate-[fadeInUp_0.15s_ease-out]">
                      {["Vietcombank", "Techcombank", "MBBank", "BIDV", "VietinBank", "Agribank"].map((bank) => (
                        <div 
                          key={bank}
                          className={`px-4 py-3 text-sm font-semibold cursor-pointer hover:bg-primary/5 transition-colors ${bank === bankName ? 'text-primary bg-primary/5' : 'text-[#142c48]/80'}`}
                          onClick={() => {
                            setBankName(bank);
                            setIsBankDropdownOpen(false);
                          }}
                        >
                          {bank}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Account Number */}
              <div>
                <p className="text-[9px] font-bold text-[#142c48]/50 mb-2 uppercase tracking-wider">{t("Số tài khoản", "口座番号")}</p>
                <div className="border-b border-gray-200 pb-2">
                  <input 
                    type="text" 
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder={t("Nhập số tài khoản", "口座番号を入力")}
                    className="text-base font-semibold text-[#142c48] bg-transparent outline-none w-full"
                  />
                </div>
              </div>
            </div>

            {/* Exchange Value */}
            <div className="bg-[#1e3a5f] rounded-xl p-4 text-center mb-8 shadow-inner">
              <p className="text-[10px] text-white/60 uppercase tracking-widest mb-1.5 font-medium">{t("Giá trị quy đổi", "換算額")}</p>
              <p className="text-[22px] font-bold text-white tracking-wide">{(parseInt(withdrawAmount || "0", 10) * 1000).toLocaleString()} VNĐ</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button 
                onClick={() => setIsWithdrawModalOpen(false)}
                className="flex-1 py-3.5 rounded-xl border border-gray-200 bg-white text-[#8a684b] text-xs font-bold transition-all hover:bg-gray-50 text-center shadow-sm"
              >
                {t("Hủy", "キャンセル")}
              </button>
              <button 
                onClick={() => {
                  showToast("error", t("Tính năng đang phát triển!", "この機能は開発中です！"));
                }}
                className="flex-[1.5] py-3.5 rounded-xl bg-[#1e3a5f] text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#1e3a5f]/90 transition-all shadow-md"
              >
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span className="text-left leading-tight text-[12px]">{t("Xác nhận rút tiền", "換金を確定する")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
