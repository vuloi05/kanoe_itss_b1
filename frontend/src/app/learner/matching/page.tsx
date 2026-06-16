"use client";
import LearnerNavbar from "@/components/layout/LearnerNavbar";
import LearnerBottomNav from "@/components/layout/LearnerBottomNav";
import SelectPicker from "@/components/common/SelectPicker";
import TokenConfirmModal, { CONNECTION_COST } from "@/components/matching/TokenConfirmModal";
import PartnerProfileModal from "@/components/matching/PartnerProfileModal";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { partnerApi, matchingApi, type PartnerDto, messageApi } from "@/lib/api";

// ─── Hardcoded job filter options (spec §4.2) ─────────────────
const JOB_OPTIONS = [
  { value: "all", vi: "Tất cả", ja: "すべて" },
  { value: "Giáo viên", vi: "Giáo viên", ja: "教師" },
  { value: "Công chức", vi: "Công chức", ja: "公務員" },
  { value: "Đầu bếp", vi: "Đầu bếp", ja: "料理人" },
  { value: "Dịch vụ", vi: "Dịch vụ", ja: "サービス業" },
  { value: "Khác", vi: "Khác", ja: "その他" },
];

const KNOWN_JOBS = JOB_OPTIONS.filter((o) => o.value !== "all" && o.value !== "Khác").map((o) => o.value);

export default function MatchingPage() {
  const { t } = useLanguage();
  const router = useRouter();

  // ── Data state ──
  const [partners, setPartners] = useState<PartnerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Filter state (draft — not applied until "Tìm kiếm") ──
  const [draftAge, setDraftAge] = useState("all");
  const [draftJob, setDraftJob] = useState("all");
  const [draftStatus, setDraftStatus] = useState("all");
  const [draftConnection, setDraftConnection] = useState("all");

  // ── Applied filter state ──
  const [ageFilter, setAgeFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [connectionFilter, setConnectionFilter] = useState("all");

  // Track broken avatar URLs to show fallback
  const [brokenAvatars, setBrokenAvatars] = useState<Set<string>>(new Set());

  // ── Unread counts mapping (conversationId -> unreadCount) ──
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // ── Per-button loading state for "Nhắn tin" ──
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  // ── Token Economy state — fetched from backend ──
  const [tokenBalance, setTokenBalance] = useState(0);
  const [modalPartner, setModalPartner] = useState<PartnerDto | null>(null);
  const [isModalProcessing, setIsModalProcessing] = useState(false);
  
  // ── Profile Modal state ──
  const [viewingPartner, setViewingPartner] = useState<PartnerDto | null>(null);

  // ── Toast ──
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Fetch partners + token balance on mount ──
  useEffect(() => {
    let mounted = true;

    Promise.all([
      partnerApi.getPartners(),
      matchingApi.getBalance(),
      messageApi.getConversations(),
    ])
      .then(([partnerData, balanceData, conversations]) => {
        if (mounted) {
          setPartners(partnerData);
          setTokenBalance(balanceData.tokenBalance);
          const unreadMap: Record<string, number> = {};
          conversations.forEach((c) => {
            unreadMap[c.conversationId] = c.unreadCount;
          });
          setUnreadCounts(unreadMap);
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message || t("Đã xảy ra lỗi.", "エラーが発生しました。"));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Apply filters (spec §4.2: only on button click) ──
  const applyFilters = () => {
    setAgeFilter(draftAge);
    setJobFilter(draftJob);
    setStatusFilter(draftStatus);
    setConnectionFilter(draftConnection);
  };

  // ── Filter logic (client-side) ──
  const filteredPartners = partners.filter((p) => {
    if (ageFilter !== "all" && p.ageRange !== ageFilter) return false;
    if (statusFilter === "online" && !p.isOnline) return false;
    if (statusFilter === "offline" && p.isOnline) return false;
    if (connectionFilter === "connected" && !p.hasConversation) return false;
    if (connectionFilter === "not_connected" && p.hasConversation) return false;
    if (jobFilter !== "all") {
      if (jobFilter === "Khác") {
        if (p.job && KNOWN_JOBS.includes(p.job)) return false;
      } else {
        if (p.job !== jobFilter) return false;
      }
    }
    return true;
  });

  // ── Handle "Nhắn tin" click — show modal for new connections ──
  const handleMessageClick = (partner: PartnerDto) => {
    if (partner.hasConversation && partner.conversationId) {
      router.push(`/learner/messages?conv=${partner.conversationId}`);
      return;
    }
    setModalPartner(partner);
  };

  // ── Handle modal confirmation — call backend API for atomic transaction ──
  const handleConfirmConnection = async () => {
    if (!modalPartner) return;
    setIsModalProcessing(true);
    setSendingTo(modalPartner.userId);

    try {
      const result = await matchingApi.connect(modalPartner.userId);

      // Reflect server-side balance
      setTokenBalance(result.remainingBalance);

      // Update local partner data so button reflects the new conversation
      setPartners((prev) =>
        prev.map((p) =>
          p.userId === modalPartner.userId
            ? { ...p, hasConversation: true, conversationId: result.conversationId }
            : p
        )
      );

      setModalPartner(null);
      showToast(
        t(
          "🎉 Kết nối thành công! Đang chuyển đến tin nhắn...",
          "🎉 接続成功！メッセージに移動中..."
        ),
        "success"
      );

      setTimeout(() => {
        router.push(`/learner/messages?conv=${result.conversationId}`);
      }, 800);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("Không thể kết nối. Thử lại sau.", "接続できません。後でもう一度お試しください。");
      showToast(message, "error");
    } finally {
      setIsModalProcessing(false);
      setSendingTo(null);
    }
  };

  const handleCancelModal = () => {
    if (!isModalProcessing) {
      setModalPartner(null);
    }
  };

  // ── Retry on error ──
  const retry = () => {
    setLoading(true);
    setError(null);
    partnerApi
      .getPartners()
      .then(setPartners)
      .catch((err) => setError(err.message || t("Đã xảy ra lỗi.", "エラーが発生しました。")))
      .finally(() => setLoading(false));
  };

  return (
    <div className="bg-background text-on-surface font-body min-h-screen pb-20 md:pb-0">
      <LearnerNavbar />
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-32">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="max-w-2xl mb-10">
            <h2 className="text-4xl font-headline font-bold text-primary tracking-tight leading-tight mb-4">
              {t(
                "Tìm giọng nói miền Bắc của bạn.",
                "あなたの北部の声を見つけよう。"
              )}
              <br />
              <span className="text-secondary">
                {t(
                  "Kết nối qua ngôn ngữ Hà Nội.",
                  "ハノイの言葉で繋がる。"
                )}
              </span>
            </h2>
            <p className="text-on-surface-variant leading-relaxed opacity-80">
              {t(
                "Kết nối với những người bản xứ tại Hà Nội cùng chung đam mê. Trải nghiệm nhịp điệu chân thực của tiếng Việt miền Bắc.",
                "ハノイのネイティブスピーカーと共通の情熱で繋がりましょう。北部ベトナム語の本物のリズムを体験してください。"
              )}
            </p>
          </div>

          {/* View All Messages Button + Mobile Token Balance */}
          <div className="flex items-center justify-between mb-4">
            {/* Mobile-only token balance */}
            <div className="flex md:hidden items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/60">
              <span className="text-base leading-none">🪙</span>
              <span className="text-sm font-bold text-amber-700 tabular-nums">
                {tokenBalance.toLocaleString()}
              </span>
            </div>

            <Link
              href="/learner/messages"
              className="flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg font-headline font-bold text-sm hover:bg-secondary hover:text-white transition-all duration-300 ml-auto"
            >
              <span className="material-symbols-outlined text-lg">mail</span>
              {t(
                "Xem tất cả tin nhắn",
                "すべてのメッセージを表示"
              )}
            </Link>
          </div>

          {/* Horizontal Filter Bar */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30">
            {/* Age Filter */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-[10px] uppercase tracking-wider font-bold text-secondary mb-1.5 ml-1">
                {t("Độ tuổi", "年齢")}
              </label>
              <SelectPicker
                value={draftAge}
                onChange={setDraftAge}
                options={[
                  { value: "all", label: t("Tất cả", "すべて") },
                  { value: "18-24", label: "18-24" },
                  { value: "25-30", label: "25-30" },
                  { value: "31-40", label: "31-40" },
                  { value: "40+", label: "40+" },
                ]}
              />
            </div>

            {/* Job Filter — hardcoded per spec */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-[10px] uppercase tracking-wider font-bold text-secondary mb-1.5 ml-1">
                {t("Công việc", "職業")}
              </label>
              <SelectPicker
                value={draftJob}
                onChange={setDraftJob}
                options={JOB_OPTIONS.map((opt) => ({
                  value: opt.value,
                  label: t(opt.vi, opt.ja),
                }))}
              />
            </div>

            {/* Status Filter */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-[10px] uppercase tracking-wider font-bold text-secondary mb-1.5 ml-1">
                {t("Trạng thái", "状態")}
              </label>
              <SelectPicker
                value={draftStatus}
                onChange={setDraftStatus}
                options={[
                  { value: "all", label: t("Tất cả", "すべて") },
                  { value: "online", label: t("Trực tuyến", "オンライン") },
                  { value: "offline", label: t("Ngoại tuyến", "オフライン") },
                ]}
              />
            </div>

            {/* Connection Filter */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-[10px] uppercase tracking-wider font-bold text-secondary mb-1.5 ml-1">
                {t("Kết nối", "接続")}
              </label>
              <SelectPicker
                value={draftConnection}
                onChange={setDraftConnection}
                options={[
                  { value: "all", label: t("Tất cả", "すべて") },
                  { value: "connected", label: t("Đã kết nối", "接続済み") },
                  { value: "not_connected", label: t("Chưa kết nối", "未接続") },
                ]}
              />
            </div>

            {/* Search Button — applies filter (spec §4.2) */}
            <button
              onClick={applyFilters}
              className="bg-primary text-on-primary self-end h-[46px] px-8 rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">search</span>
              {t("Tìm kiếm", "検索")}
            </button>
          </div>
        </section>

        {/* ── Loading Skeleton ── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-4 border border-outline-variant/20 animate-pulse"
              >
                <div className="aspect-square rounded-2xl bg-surface-container mb-4" />
                <div className="px-2">
                  <div className="h-5 bg-surface-container rounded w-2/3 mb-3" />
                  <div className="h-3 bg-surface-container rounded w-full mb-2" />
                  <div className="h-3 bg-surface-container rounded w-4/5 mb-4" />
                  <div className="flex gap-1.5 mb-4">
                    <div className="h-5 bg-surface-container rounded-full w-14" />
                    <div className="h-5 bg-surface-container rounded-full w-10" />
                    <div className="h-5 bg-surface-container rounded-full w-16" />
                  </div>
                  <div className="h-10 bg-surface-container rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Error State ── */}
        {!loading && error && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-error mb-4 block">
              error
            </span>
            <p className="text-on-surface-variant mb-6">{error}</p>
            <button
              onClick={retry}
              className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold hover:opacity-90 transition-all"
            >
              {t("Thử lại", "再試行")}
            </button>
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && !error && filteredPartners.length === 0 && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 block">
              person_search
            </span>
            <p className="text-on-surface-variant text-lg">
              {t("Chưa có đối tác nào.", "パートナーがいません。")}
            </p>
            {(ageFilter !== "all" || jobFilter !== "all" || statusFilter !== "all" || connectionFilter !== "all") && (
              <button
                onClick={() => {
                  setDraftAge("all");
                  setDraftJob("all");
                  setDraftStatus("all");
                  setDraftConnection("all");
                  setAgeFilter("all");
                  setJobFilter("all");
                  setStatusFilter("all");
                  setConnectionFilter("all");
                }}
                className="mt-4 px-6 py-2 text-primary border border-primary/30 rounded-xl text-sm font-bold hover:bg-primary/5 transition-all"
              >
                {t("Xóa bộ lọc", "フィルターをクリア")}
              </button>
            )}
          </div>
        )}

        {/* ── Partner Cards Grid ── */}
        {!loading && !error && filteredPartners.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPartners.map((p) => (
              <div
                key={p.userId}
                className="bg-white rounded-3xl p-4 profile-card-shadow border border-outline-variant/20 hover:border-primary/20 transition-all group flex flex-col h-full"
              >
                <div onClick={() => setViewingPartner(p)} className="cursor-pointer group/profile">
                  {/* Avatar */}
                  <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-surface-container group-hover/profile:shadow-md transition-all">
                    {(() => {
                      const url = p.avatarUrl;
                      const dicebearUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.displayName)}&backgroundColor=c0aede`;
                      return url && !brokenAvatars.has(url) ? (
                        <img
                          alt={p.displayName}
                          className="w-full h-full object-cover grayscale-[0.2] group-hover/profile:grayscale-0 transition-all duration-500 group-hover/profile:scale-105"
                          src={url}
                          onError={() => setBrokenAvatars((prev) => new Set(prev).add(url))}
                        />
                      ) : (
                        <img
                          alt={p.displayName}
                          className="w-full h-full object-cover grayscale-[0.2] group-hover/profile:grayscale-0 transition-all duration-500 group-hover/profile:scale-105"
                          src={dicebearUrl}
                          onError={() => {}}
                        />
                      );
                    })()}
                  </div>

                  {/* Info */}
                  <div className="px-2">
                    <h3 className="text-lg font-headline font-bold text-primary mb-1 group-hover/profile:text-secondary transition-colors">
                      {p.displayName}
                    </h3>
                    <p className="text-on-surface-variant text-xs line-clamp-2 mb-4 leading-relaxed">
                      {p.bio || t("Chưa cập nhật", "未設定")}
                    </p>
                  </div>
                </div>

                <div className="px-2 mt-auto pt-4">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {p.isOnline ? (
                      <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {t("Online", "オンライン")}
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {t("Offline", "オフライン")}
                      </span>
                    )}
                    {p.gender && (
                      <span className="bg-surface-container text-on-surface-variant text-[10px] px-2 py-0.5 rounded-full font-medium">
                        {p.gender === "male" ? t("Nam", "男性") : p.gender === "female" ? t("Nữ", "女性") : p.gender}
                      </span>
                    )}
                    {p.ageRange && (
                      <span className="bg-surface-container-low text-primary text-[10px] px-2 py-0.5 rounded-full font-medium">
                        {p.ageRange}
                      </span>
                    )}
                    <span className="bg-surface-container-low text-primary text-[10px] px-2 py-0.5 rounded-full font-medium">
                      {p.job || "—"}
                    </span>
                  </div>

                  {/* Message Button — shows token cost for new connections */}
                  <button
                    onClick={() => handleMessageClick(p)}
                    disabled={sendingTo === p.userId}
                    className={`relative w-full mt-4 py-2.5 rounded-xl font-headline font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      p.hasConversation
                        ? "bg-primary text-on-primary hover:opacity-90"
                        : "bg-gradient-to-r from-primary to-primary/85 text-on-primary hover:opacity-90 shadow-sm"
                    }`}
                  >
                    {sendingTo === p.userId ? (
                      <>
                        <span className="material-symbols-outlined text-lg animate-spin">
                          progress_activity
                        </span>
                        {t("Đang kết nối...", "接続中...")}
                      </>
                    ) : p.hasConversation ? (
                      <>
                        <span className="material-symbols-outlined text-lg">
                          send
                        </span>
                        <div className="relative">
                          {t("Nhắn tin", "メッセージ")}
                          {p.conversationId && unreadCounts[p.conversationId] > 0 && (
                            <span className="absolute -top-1 -right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-primary"></span>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center w-full justify-between px-2">
                        <span className="material-symbols-outlined text-lg w-6 text-left">
                          group_add
                        </span>
                        <span className="flex-1 text-center font-bold">
                          {t("Kết nối", "接続する")}
                        </span>
                        <span className="opacity-70 text-[11px] font-medium w-auto whitespace-nowrap text-right bg-white/20 px-2 py-0.5 rounded-md">
                          {CONNECTION_COST} Token
                        </span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Token Confirmation Modal */}
      <TokenConfirmModal
        isOpen={modalPartner !== null}
        partnerName={modalPartner?.displayName ?? ""}
        tokenBalance={tokenBalance}
        isProcessing={isModalProcessing}
        onConfirm={handleConfirmConnection}
        onCancel={handleCancelModal}
      />

      <PartnerProfileModal
        partner={viewingPartner}
        onClose={() => setViewingPartner(null)}
        onConnect={handleMessageClick}
      />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-all ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      <LearnerBottomNav />
    </div>
  );
}

