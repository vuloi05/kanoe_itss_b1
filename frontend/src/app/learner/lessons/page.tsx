"use client";
import { useEffect, useState, useCallback } from "react";
import LearnerNavbar from "@/components/layout/LearnerNavbar";
import LearnerBottomNav from "@/components/layout/LearnerBottomNav";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { lessonApi, type ChapterDto, type LessonSummaryDto } from "@/lib/api";

// Predefined chapter icons — fallback when API icon name is not in map
const CHAPTER_ICON_COLORS: Record<number, string> = {
  1: "bg-primary-container text-on-primary-container",
  2: "bg-secondary-container text-on-secondary-container",
  3: "bg-[#d6e3ff] text-[#2d476f]",
  4: "bg-[#fdddb9] text-[#584329]",
  5: "bg-[#e2e3e1] text-[#44474d]",
  6: "bg-[#ffdad9] text-[#603d3e]",
  7: "bg-primary-container text-on-primary-container",
  8: "bg-[#ffdad6] text-[#93000a]",
};

function LessonCard({ lesson, t }: { lesson: LessonSummaryDto; t: (vi: string, jp: string) => string }) {
  // Completed state
  if (lesson.isCompleted) {
    return (
      <Link
        href={`/learner/lessons/${lesson.lessonId}`}
        className="block group bg-surface-container-lowest rounded-xl transition-all duration-300 hover:bg-primary-container/30 hover:-translate-y-1 border-l-4 border-[#2e7d32] relative overflow-hidden"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-2 items-center">
              {lesson.tag && (
                <span className="px-3 py-1 bg-[#e8f5e9] text-[#2e7d32] text-[10px] font-bold uppercase rounded-md">
                  {t(lesson.tag, lesson.tagJp || lesson.tag)}
                </span>
              )}
            </div>
            {/* Show check icon + "Completed" instead of time when lesson is done */}
            <div className="flex items-center gap-1.5 text-[#2e7d32] font-bold text-xs">
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
              {t("Hoàn thành", "完了")}
            </div>
          </div>
          <h3 className="font-headline font-bold text-xl text-[#2e7d32] mb-1">
            {t(lesson.titleVi, lesson.titleJp)}
          </h3>
        </div>
        {/* Progress bar — full width for completed lessons */}
        <div className="h-1 w-full bg-[#c8e6c9]">
          <div className="h-full bg-[#2e7d32] rounded-r-full transition-all duration-700 ease-out" style={{ width: "100%" }} />
        </div>
      </Link>
    );
  }

  // Locked state
  if (lesson.isLocked) {
    return (
      <div className="group bg-surface-container-low/50 rounded-xl border border-dashed border-outline-variant opacity-60 cursor-not-allowed select-none overflow-hidden">
        <div className="p-6 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-headline font-bold text-lg text-on-surface-variant/70">
                {t(lesson.titleVi, lesson.titleJp)}
              </h3>
              <span className="material-symbols-outlined text-sm text-on-surface-variant/50 ml-2">lock</span>
            </div>
            <p className="text-[10px] text-on-surface-variant/50 mt-1">
              {t("Hoàn thành bài trước để mở khóa", "前のレッスンを完了してロック解除")}
            </p>
          </div>
          <div className="text-[10px] font-bold uppercase text-on-surface-variant/40 tracking-widest">
            {t("Khóa", "ロック")}
          </div>
        </div>
        {/* Progress bar — empty for locked lessons */}
        <div className="h-1 w-full bg-surface-container" />
      </div>
    );
  }

  // Available (unlocked, not completed) state — shows actual progress from DB
  return (
    <Link
      href={`/learner/lessons/${lesson.lessonId}`}
      className="block group bg-surface-container-lowest rounded-xl transition-all duration-300 hover:bg-primary-container hover:-translate-y-1 shadow-sm hover:shadow-md overflow-hidden"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-2">
            {lesson.tag && (
              <span className="px-3 py-1 bg-surface-container text-on-surface-variant text-[10px] font-bold uppercase rounded-md group-hover:bg-primary group-hover:text-white">
                {t(lesson.tag, lesson.tagJp || lesson.tag)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Show duration + clock icon for in-progress lessons */}
            {lesson.durationMinutes && (
              <div className="flex items-center gap-1 text-secondary font-bold text-xs uppercase group-hover:text-on-primary-container">
                <span className="material-symbols-outlined text-sm mr-1">schedule</span>
                {t(`${lesson.durationMinutes} phút`, `${lesson.durationMinutes} 分`)}
              </div>
            )}
            {/* Inline progress percentage badge */}
            {lesson.progress > 0 && (
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full group-hover:bg-white/20 group-hover:text-white">
                {lesson.progress}%
              </span>
            )}
          </div>
        </div>
        <h3 className="font-headline font-bold text-xl text-primary group-hover:text-white mb-1">
          {t(lesson.titleVi, lesson.titleJp)}
        </h3>
      </div>
      {/* Progress bar — width reflects actual progress percentage */}
      <div className="h-1 w-full bg-surface-container group-hover:bg-white/20">
        <div
          className="h-full bg-primary rounded-r-full transition-all duration-700 ease-out group-hover:bg-white/80"
          style={{ width: `${lesson.progress}%` }}
        />
      </div>
    </Link>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-pulse">
      {[1, 2].map((col) => (
        <div key={col} className="lg:col-span-6 space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-surface-container-high" />
            <div className="h-6 w-48 bg-surface-container-high rounded" />
          </div>
          {[1, 2].map((card) => (
            <div key={card} className="bg-surface-container-lowest p-6 rounded-xl space-y-4">
              <div className="h-4 w-20 bg-surface-container rounded" />
              <div className="h-6 w-3/4 bg-surface-container rounded" />
              <div className="h-1 w-full bg-surface-container rounded-full" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Compute chapter completion stats */
function getChapterStats(lessons: LessonSummaryDto[]) {
  const total = lessons.length;
  const completed = lessons.filter((l) => l.isCompleted).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, percent };
}

export default function LessonsPage() {
  const { t } = useLanguage();
  const [chapters, setChapters] = useState<ChapterDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [toast, setToast] = useState<{ vi: string; jp: string } | null>(null);

  // Auto-dismiss toast after 3s
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const toggleChapter = useCallback((chapterId: number, isLocked: boolean) => {
    if (isLocked) {
      setToast({
        vi: "Vui lòng hoàn thành chương trước đó để mở khóa!",
        jp: "前の章を完了してロックを解除してください！",
      });
      return;
    }
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  }, []);

  /** Only auto-expand chapters that are unlocked */
  const applyChapterExpansion = useCallback((data: ChapterDto[]) => {
    const unlocked = new Set<number>();
    data.forEach((chapter, idx) => {
      if (idx === 0) {
        unlocked.add(chapter.chapterId);
      } else {
        const prevStats = getChapterStats(data[idx - 1].lessons);
        if (prevStats.percent >= 100) unlocked.add(chapter.chapterId);
      }
    });
    setExpandedChapters(unlocked);
  }, []);

  const fetchChapters = (level: number) => {
    setLoading(true);
    setError(null);
    lessonApi
      .getChaptersByLevel(level)
      .then((data) => {
        setChapters(data);
        applyChapterExpansion(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const handleLevelChange = (level: number) => {
    setSelectedLevel(level);
    fetchChapters(level);
  };

  // Initial fetch on mount
  useEffect(() => {
    lessonApi
      .getChaptersByLevel(1)
      .then((data) => {
        setChapters(data);
        applyChapterExpansion(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute sequential chapter lock state within current level
  const chaptersWithLock = chapters.map((chapter, idx) => {
    if (idx === 0) return { chapter, isChapterLocked: false };
    const prevStats = getChapterStats(chapters[idx - 1].lessons);
    return { chapter, isChapterLocked: prevStats.percent < 100 };
  });

  // Overall level progress
  const allLessons = chapters.flatMap((c) => c.lessons);
  const totalLessons = allLessons.length;
  const completedLessons = allLessons.filter((l) => l.isCompleted).length;
  const levelPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="bg-background text-on-surface font-body min-h-screen pb-20 md:pb-0">
      <LearnerNavbar />
      <main className="max-w-7xl mx-auto px-6 py-12 min-h-screen mt-16 md:mt-20" style={{ background: "radial-gradient(circle at 10% 20%, rgba(9, 41, 79, 0.03) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(113, 90, 62, 0.03) 0%, transparent 40%)" }}>
        {/* Hero / Context Section */}
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-primary tracking-tight mb-4">
              {t("Lộ trình", "カリキュラム")} <span className="text-secondary italic">{t("Tiếng Việt miền Bắc", "北部ベトナム語")}</span>
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              {t("Chinh phục sự tinh tế của tiếng Hà Nội qua các học phần dành riêng cho người Nhật sống tại Việt Nam.", "ハノイ在住の日本人向けに構成されたモジュールで、北部ベトナム語の優雅さをマスターしましょう。")}
            </p>
          </div>
          {/* Filter / Tab Bar */}
          <div className="flex bg-surface-container-low p-1.5 rounded-full overflow-hidden">
            {[1, 2, 3].map((level) => (
              <button
                key={level}
                onClick={() => handleLevelChange(level)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                  selectedLevel === level
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-primary font-medium"
                }`}
              >
                {level === selectedLevel ? t(`Trình độ V${level}`, `レベル V${level}`) : `V${level}`}
              </button>
            ))}
          </div>
        </header>

        {loading && <LoadingSkeleton />}

        {error && (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-4xl text-error mb-4 block">error</span>
            <p className="text-on-surface-variant">{t("Không thể tải dữ liệu bài học.", "レッスンデータを読み込めませんでした。")}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-full text-sm font-bold">
              {t("Thử lại", "再試行")}
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Bento Grid Layout for Chapters */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {chaptersWithLock.map(({ chapter, isChapterLocked }, chapterIdx) => {
                const isExpanded = !isChapterLocked && expandedChapters.has(chapter.chapterId);
                const stats = getChapterStats(chapter.lessons);
                return (
                  <section key={chapter.chapterId} className={`lg:col-span-6 space-y-4 transition-opacity duration-300 ${isChapterLocked ? "opacity-50" : ""}`}>
                    {/* Clickable chapter header */}
                    <button
                      type="button"
                      onClick={() => toggleChapter(chapter.chapterId, isChapterLocked)}
                      className={`w-full flex items-center gap-4 mb-2 group/header select-none transition-opacity ${
                        isChapterLocked ? "cursor-not-allowed" : "cursor-pointer hover:opacity-80"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        isChapterLocked
                          ? "bg-surface-container-high text-on-surface-variant/50"
                          : (CHAPTER_ICON_COLORS[chapterIdx + 1] || "bg-primary-container text-on-primary-container")
                      }`}>
                        <span className="material-symbols-outlined">
                          {isChapterLocked ? "lock" : chapter.icon}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <h2 className={`font-headline font-bold text-xl ${
                            isChapterLocked ? "text-on-surface-variant/60" : "text-primary"
                          }`}>
                            {t(chapter.titleVi, chapter.titleJp)}
                          </h2>
                          {isChapterLocked && (
                            <span className="material-symbols-outlined text-sm text-on-surface-variant/40">lock</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <p className="text-xs text-on-surface-variant">
                            {t(`${chapter.lessons.length} bài học`, `${chapter.lessons.length} レッスン`)}
                          </p>
                          {!isChapterLocked && stats.completed > 0 && (
                            <span className="text-xs font-bold text-[#2e7d32]">
                              {stats.completed}/{stats.total} ✓
                            </span>
                          )}
                          {isChapterLocked && (
                            <span className="text-[10px] font-bold uppercase text-on-surface-variant/40 tracking-widest">
                              {t("Khóa", "ロック")}
                            </span>
                          )}
                        </div>
                      </div>
                      {!isChapterLocked && (
                        <span
                          className="material-symbols-outlined text-on-surface-variant transition-transform duration-300"
                          style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                        >
                          expand_more
                        </span>
                      )}
                    </button>

                    {/* Chapter progress bar — only for unlocked chapters with progress */}
                    {!isChapterLocked && stats.completed > 0 && (
                      <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#2e7d32] rounded-full transition-all duration-500"
                          style={{ width: `${stats.percent}%` }}
                        />
                      </div>
                    )}

                    {/* Collapsible lesson list — hidden for locked chapters */}
                    {!isChapterLocked && (
                      <div
                        className="overflow-hidden transition-all duration-400 ease-in-out"
                        style={{
                          maxHeight: isExpanded ? "2000px" : "0px",
                          opacity: isExpanded ? 1 : 0,
                        }}
                      >
                        <div className="space-y-4">
                          {chapter.lessons.map((lesson) => (
                            <LessonCard key={lesson.lessonId} lesson={lesson} t={t} />
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                );
              })}

              {/* Decorative Illustration Card */}
              <div className="lg:col-span-6">
                <div className="relative overflow-hidden h-64 rounded-xl bg-primary">
                  <Image alt="Phonetic visualization" className="absolute inset-0 w-full h-full object-cover opacity-40 hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFMz1glCLwjQr6Pi8qFq7R3DEZS5O_Hu83nxAY7FCaoZcPIOaslFZL0KYqvagK-BGdV5rG3MywedyYbzjHEBkOPnsefLkN4eqwxYz7YqsVSDRFqShCKoUuu3g8cb9rsYOq5y2UbxGPt-csUqzVkfzdhheAOeqcYlDwtZtoSk8klU-r0FAFIv_pCb7lnP6CgoncR8qAg1cduo85Wk8akDhVHC2cCVJsLysV0Z5bAIwZru7OHL88TTFmLFcrusMeL8fx0U_KD2UTylOE" fill sizes="(max-width: 1024px) 100vw, 50vw" />
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <p className="text-white/80 font-medium text-sm mb-1">{t("Làm chủ sự chuyển điệu", "声調の変化をマスターする")}</p>
                    <h4 className="text-white text-2xl font-headline font-bold">{t("Giai điệu Hà Nội", "ハノイの旋律")}</h4>
                  </div>
                </div>
              </div>

              {/* Progress Lotus + Image Cards */}
              <div className="lg:col-span-6 space-y-8">
                {/* Progress Tracker */}
                <div className="bg-surface-container-high p-8 rounded-2xl relative overflow-hidden flex flex-col items-center text-center">
                  <div className="mb-6 relative">
                    <div className="w-24 h-24 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-6xl" style={{ fontVariationSettings: '"FILL" 1' }}>potted_plant</span>
                    </div>
                    <div className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {t(`V${selectedLevel}`, `V${selectedLevel}`)}
                    </div>
                  </div>
                  <h4 className="font-headline font-bold text-primary mb-2">{t("Tiến độ học tập", "学習進捗")}</h4>
                  <p className="text-sm text-on-surface-variant mb-4">
                    {t(
                      `Đã hoàn thành ${completedLessons}/${totalLessons} bài học trình độ V${selectedLevel}`,
                      `V${selectedLevel}レベルの${totalLessons}レッスン中${completedLessons}レッスンを完了`
                    )}
                  </p>
                  {/* Progress ring */}
                  <div className="w-full bg-surface-container rounded-full h-3 mb-4 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${levelPercent}%` }}
                    />
                  </div>
                  <span className="text-2xl font-extrabold text-primary">{levelPercent}%</span>
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-secondary/10 rounded-full blur-2xl"></div>
                </div>

                {/* Image Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl overflow-hidden h-40 relative">
                    <Image alt="Hanoi Old Quarter" className="object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwI9Xc14FI44F6EMCDm3-pBNdlvPF8cE7gIf7ebcv7U3xoIwSVchrDHbvxYvNNrKQJynlWGSp38-SxpfDPmUwy1BbpNy2lzAXr8rvREpo6zYohtpQ0qsKNAlWGxIBKA7kDM6uQ52pc6MFoGPS1Ty-9gy-z8uM-KDXbEBovid3CV3yLMnFe1CgSEp41y8__pxFxlAW5onDP9mJfcQCAagU20wuCPUg-AhjyRLxYNSp_b6lQ3vTY-WnTvB0b7xmZSSqVyUFA7KVMIFze" fill sizes="(max-width: 1024px) 50vw, 25vw" />
                  </div>
                  <div className="rounded-xl overflow-hidden h-40 relative">
                    <Image alt="Vietnamese Lotus" className="object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA60U4Nyh3q3RNPY--mVQmRGHx82UasWmFzcsTZjxh_NZVpPHJ3i9s3oNdD3cG98W7-uZEMiq8Qr5Wo2VbaLfxh2wNU-5J3R7gO3wdTmt8JTjQp5lwSb6vjQbrDlU6PScWUlwrTfdhPLvVtMsuyjFAeWYT5GdLxhT9ieaFoYDdiY55oapkYret0SRGoH8rvBhR0EuMSOThabzgzqwAkUwpwQIjJoGRfIvSg-q0Nbrj2uxQQsXEcEKeCXywQoboDnk2dGT_CJtvoWfOy" fill sizes="(max-width: 1024px) 50vw, 25vw" />
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action / Support */}
            <footer className="mt-20 py-12 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
              <div>
                <h5 className="font-headline font-bold text-primary">{t("Bạn cần gia sư riêng?", "個別指導が必要ですか？")}</h5>
                <p className="text-on-surface-variant text-sm">{t("Kết nối với giáo viên bản xứ miền Bắc để luyện tập 1-1.", "北部出身のネイティブ講師と1対1で練習しましょう。")}</p>
              </div>
              <Link href="/learner/matching" className="px-8 py-3 bg-primary-container text-white font-bold rounded-full hover:bg-primary transition-colors duration-300">
                {t("Tìm gia sư", "講師を探す")}
              </Link>
            </footer>
          </>
        )}
      </main>
      <LearnerBottomNav />

      {/* Toast notification for locked chapters */}
      {toast && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-[slideUp_0.3s_ease-out]">
          <div className="flex items-center gap-3 px-5 py-3 bg-surface-container-highest text-on-surface rounded-2xl shadow-lg border border-outline-variant/20 backdrop-blur-sm">
            <span className="material-symbols-outlined text-lg text-secondary" style={{ fontVariationSettings: '"FILL" 1' }}>lock</span>
            <p className="text-sm font-medium">{t(toast.vi, toast.jp)}</p>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-on-surface-variant/60 hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
