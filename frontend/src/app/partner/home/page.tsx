"use client";
import { useState, useEffect } from "react";
import PartnerNavbar from "@/components/layout/PartnerNavbar";
import PartnerBottomNav from "@/components/layout/PartnerBottomNav";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/lib/auth";
import { bookingApi, type BookingDto } from "@/lib/api";

// Convert UTC datetime string to Hanoi time (GMT+7) display string
function formatHanoiTime(utcDateStr: string): string {
  const date = new Date(utcDateStr);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

export default function PartnerHomePage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [nextLesson, setNextLesson] = useState<BookingDto | null>(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(true);

  useEffect(() => {
    let cancelled = false;

    bookingApi.getUpcomingBookings()
      .then((bookings) => {
        if (!cancelled) {
          setNextLesson(bookings.length > 0 ? bookings[0] : null);
        }
      })
      .catch(() => {
        if (!cancelled) setNextLesson(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingLesson(false);
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <div className="bg-background text-on-surface font-body min-h-screen pb-20 md:pb-0">
      <PartnerNavbar />
      <main className="pt-24 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Hero Section */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-white rounded-full text-[10px] font-bold tracking-widest uppercase">
              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: '"FILL" 1' }}>verified</span>
              {t("XÁC MINH GIỌNG BẮC", "北部訛り認定済")}
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-primary tracking-tight leading-tight">
              {t(
                `Chào mừng trở lại, ${user?.displayName ?? "Partner"}!`,
                `お帰りなさい、${user?.displayName ?? "パートナー"}さん！`
              )}
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-surface-container-low p-4 rounded-xl">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-primary">emoji_events</span>
            </div>
            <div>
              <p className="text-[10px] font-label font-bold text-outline uppercase tracking-tighter">Partner Status</p>
              <p className="text-sm font-bold text-primary">Senior Instructor</p>
            </div>
          </div>
        </header>

        {/* Primary CTA: Next Class */}
        <section className="mb-12">
          <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8" style={{ background: "linear-gradient(135deg, #09294f 0%, #243f67 100%)" }}>
            <div className="absolute -right-20 -top-20 opacity-10">
              <span className="material-symbols-outlined text-[300px]">spa</span>
            </div>
            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-4 mb-6">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold uppercase tracking-widest">{t("BUỔI DẠY TIẾP THEO", "次のレッスン")}</span>
                {nextLesson && (
                  <span className="flex items-center gap-1 text-sm font-medium text-primary-fixed">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    {formatHanoiTime(nextLesson.startTime)} - {formatHanoiTime(nextLesson.endTime)}
                  </span>
                )}
              </div>

              {isLoadingLesson ? (
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-white/10 animate-pulse" />
                  <div className="space-y-3">
                    <div className="h-6 w-40 bg-white/10 rounded animate-pulse" />
                    <div className="h-4 w-56 bg-white/10 rounded animate-pulse" />
                  </div>
                </div>
              ) : nextLesson ? (
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/30 shadow-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-white/80">person</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-headline font-bold">{nextLesson.learnerName}</h2>
                    <p className="text-primary-fixed/80 font-body text-lg">
                      {nextLesson.notes ?? t("Buổi học đã xác nhận", "確認済みレッスン")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-white/40">event_busy</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-headline font-bold text-white/70">{t("Chưa có buổi dạy", "レッスンなし")}</h2>
                    <p className="text-primary-fixed/60 font-body text-lg">{t("Bạn chưa có buổi dạy nào sắp tới.", "今後のレッスン予定はありません。")}</p>
                  </div>
                </div>
              )}
            </div>
            {nextLesson?.meetingUrl && (
              <div className="relative z-10 w-full md:w-auto">
                <a href={nextLesson.meetingUrl} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto px-10 py-5 bg-white text-primary font-headline font-extrabold rounded-2xl hover:bg-surface-bright transition-all active:scale-95 shadow-lg flex items-center justify-center gap-3 group">
                  {t("VÀO LỚP", "入室")}
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-surface-container-lowest p-6 rounded-2xl border-b-4 border-primary/10 hover:border-primary transition-all group shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-primary-container/20 rounded-xl text-primary">
                <span className="material-symbols-outlined">person_check</span>
              </div>
              <span className="text-primary font-bold text-2xl">85%</span>
            </div>
            <h3 className="text-sm font-label font-bold text-outline mb-1 uppercase tracking-wider">{t("Hoàn thiện hồ sơ", "プロフィール完成度")}</h3>
            <div className="w-full bg-surface-container rounded-full h-1.5 mt-4">
              <div className="bg-primary h-1.5 rounded-full" style={{ width: "85%" }}></div>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-2xl border-b-4 border-secondary/10 hover:border-secondary transition-all shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-secondary-container/20 rounded-xl text-secondary">
                <span className="material-symbols-outlined">star</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-primary font-bold text-2xl">4.9</span>
                <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
              </div>
            </div>
            <h3 className="text-sm font-label font-bold text-outline mb-1 uppercase tracking-wider">{t("Đánh giá trung bình", "平均評価")}</h3>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-2xl border-b-4 border-tertiary/10 hover:border-tertiary transition-all shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-tertiary-container/20 rounded-xl text-tertiary">
                <span className="material-symbols-outlined">history_edu</span>
              </div>
              <span className="text-primary font-bold text-2xl">156</span>
            </div>
            <h3 className="text-sm font-label font-bold text-outline mb-1 uppercase tracking-wider">{t("Số buổi hoàn thành", "完了セッション数")}</h3>
          </div>
        </section>

        {/* Bento Grid for Activity/Community */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
          {/* Target Monthly */}
          <div className="lg:col-span-4 bg-surface-container-low p-8 rounded-3xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-headline font-bold text-primary mb-2">{t("Mục tiêu tháng", "今月の目標")}</h3>
              
              <div className="relative w-48 h-48 mx-auto mb-8 mt-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-surface-container-highest" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="12"></circle>
                  <circle className="text-primary" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeDasharray="552.92" strokeDashoffset="110.58" strokeWidth="12"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-headline font-extrabold text-primary">45/50</span>
                  <span className="text-[10px] font-label font-bold text-outline uppercase tracking-widest">Sessions</span>
                </div>
              </div>
              
              <button onClick={() => setIsGoalModalOpen(true)} className="w-full py-3 bg-white border border-outline-variant text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all text-sm uppercase tracking-wider">
                {t("Chi tiết", "詳細")}
              </button>
            </div>
          </div>
          
          {/* New Requests Section */}
          <div className="lg:col-span-8 bg-white p-8 rounded-3xl border border-surface-container-high/50 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-headline font-bold text-primary">{t("Yêu cầu mới", "新規リクエスト")}</h3>
              <button className="text-primary font-bold text-sm flex items-center gap-2 hover:opacity-70 transition-opacity">
                {t("Xem tất cả", "すべて見る")} <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
            <p className="text-secondary font-medium mb-8">Lesson requests from students needing your guidance</p>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-center p-8 bg-surface-container-low rounded-2xl text-on-surface-variant text-sm border border-transparent hover:border-outline-variant transition-all">
                {t("Chưa có yêu cầu mới nào.", "新しいリクエストはありません。")}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Monthly Goal Modal Overlay */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative">
            <button onClick={() => setIsGoalModalOpen(false)} className="absolute top-6 right-6 text-outline hover:text-primary transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="text-2xl font-headline font-bold text-primary mb-2">{t("Chi tiết mục tiêu tháng", "今月の目標詳細")}</h2>
            <p className="text-secondary font-medium mb-6 text-sm leading-relaxed">
              {t("Xem lại lịch sử giảng dạy và cập nhật mục tiêu của bạn trong tháng này.", "指導履歴を確認し、今月の目標を更新してください。")}
            </p>
            
            <div className="mb-8">
              <h3 className="text-sm font-label font-bold text-primary mb-4 uppercase tracking-wider">{t("Lịch sử giảng dạy tháng trước", "過去1ヶ月の指導履歴")}</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface-container-low p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-headline font-bold text-primary mb-1">42</span>
                  <span className="text-[10px] font-label font-bold text-outline uppercase tracking-wider">{t("Tổng số buổi", "総セッション")}</span>
                </div>
                <div className="bg-primary/10 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-headline font-bold text-primary mb-1">38</span>
                  <span className="text-[10px] font-label font-bold text-outline uppercase tracking-wider">{t("Hoàn thành", "完了")}</span>
                </div>
                <div className="bg-error-container/40 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-headline font-bold text-error mb-1">4</span>
                  <span className="text-[10px] font-label font-bold text-outline uppercase tracking-wider">{t("Đã hủy", "キャンセル")}</span>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <label className="block text-sm font-label font-bold text-primary mb-2 uppercase tracking-wider">{t("Mục tiêu mới", "新しい目標")}</label>
              <input className="w-full bg-surface-container-low border-2 border-outline-variant focus:border-primary focus:ring-0 rounded-xl px-4 py-3 text-primary font-bold text-lg transition-colors placeholder:text-outline/50 placeholder:font-normal" placeholder="e.g., 50" type="number" defaultValue="50" />
            </div>
            
            <div className="flex gap-4 justify-end">
              <button onClick={() => setIsGoalModalOpen(false)} className="px-6 py-3 border-2 border-outline-variant text-primary font-bold rounded-xl hover:bg-surface-container-low transition-all text-sm uppercase tracking-wider flex-1 md:flex-none">
                {t("Hủy", "キャンセル")}
              </button>
              <button onClick={() => setIsGoalModalOpen(false)} className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-container transition-all text-sm uppercase tracking-wider shadow-md hover:shadow-lg flex-1 md:flex-none">
                {t("Lưu thay đổi", "変更を保存")}
              </button>
            </div>
          </div>
        </div>
      )}

      <PartnerBottomNav />
    </div>
  );
}
