"use client";
import { useEffect, useState } from "react";
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
  if (lesson.isLocked) {
    return (
      <div className="group bg-surface-container-low/50 p-6 rounded-xl border border-dashed border-outline-variant flex items-center justify-between opacity-80">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-headline font-bold text-lg text-on-surface-variant/70">
              {t(lesson.titleVi, lesson.titleJp)}
            </h3>
            <span className="material-symbols-outlined text-sm text-on-surface-variant/50 ml-2">lock</span>
          </div>
        </div>
        <div className="text-[10px] font-bold uppercase text-on-surface-variant/40 tracking-widest">
          {t("Khóa", "ロック")}
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/learner/lessons/${lesson.lessonId}`}
      className="block group bg-surface-container-lowest p-6 rounded-xl transition-all duration-300 hover:bg-primary-container hover:-translate-y-1"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-2">
          {lesson.tag && (
            <span className="px-3 py-1 bg-surface-container text-on-surface-variant text-[10px] font-bold uppercase rounded-md group-hover:bg-primary group-hover:text-white">
              {t(lesson.tag, lesson.tagJp || lesson.tag)}
            </span>
          )}
        </div>
        {lesson.durationMinutes && (
          <div className="flex items-center gap-1 text-secondary font-bold text-xs uppercase group-hover:text-on-primary-container">
            <span className="material-symbols-outlined text-sm mr-1">schedule</span>
            {t(`${lesson.durationMinutes} phút`, `${lesson.durationMinutes} 分`)}
          </div>
        )}
      </div>
      <h3 className="font-headline font-bold text-xl text-primary group-hover:text-white mb-1">
        {t(lesson.titleVi, lesson.titleJp)}
      </h3>
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

export default function LessonsPage() {
  const { t } = useLanguage();
  const [chapters, setChapters] = useState<ChapterDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());

  const toggleChapter = (chapterId: number) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  useEffect(() => {
    lessonApi
      .getChaptersByLevel(1)
      .then((data) => {
        setChapters(data);
        // Expand all chapters by default on initial load
        setExpandedChapters(new Set(data.map((c) => c.chapterId)));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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
            <button className="px-6 py-2 bg-primary text-on-primary rounded-full text-sm font-bold shadow-sm">{t("Trình độ V1", "レベル V1")}</button>
            <button className="px-6 py-2 text-on-surface-variant hover:text-primary text-sm font-medium transition-colors">V2</button>
            <button className="px-6 py-2 text-on-surface-variant hover:text-primary text-sm font-medium transition-colors">V3</button>
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
              {chapters.map((chapter, chapterIdx) => {
                const isExpanded = expandedChapters.has(chapter.chapterId);
                return (
                  <section key={chapter.chapterId} className="lg:col-span-6 space-y-4">
                    {/* Clickable chapter header */}
                    <button
                      type="button"
                      onClick={() => toggleChapter(chapter.chapterId)}
                      className="w-full flex items-center gap-4 mb-2 group/header cursor-pointer select-none hover:opacity-80 transition-opacity"
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${CHAPTER_ICON_COLORS[chapterIdx + 1] || "bg-primary-container text-on-primary-container"}`}>
                        <span className="material-symbols-outlined">{chapter.icon}</span>
                      </div>
                      <div className="flex-1 text-left">
                        <h2 className="font-headline font-bold text-xl text-primary">
                          {t(chapter.titleVi, chapter.titleJp)}
                        </h2>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {t(`${chapter.lessons.length} bài học`, `${chapter.lessons.length} レッスン`)}
                        </p>
                      </div>
                      <span
                        className="material-symbols-outlined text-on-surface-variant transition-transform duration-300"
                        style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                      >
                        expand_more
                      </span>
                    </button>

                    {/* Collapsible lesson list */}
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
                    <div className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{t("CẤP ĐỘ 4", "レベル 4")}</div>
                  </div>
                  <h4 className="font-headline font-bold text-primary mb-2">{t("Tiến độ học tập", "学習進捗")}</h4>
                  <p className="text-sm text-on-surface-variant mb-6">{t("Đã hoàn thành 12/45 bài học trình độ V1", "V1レベルの45レッスン中12レッスンを完了")}</p>
                  <button className="w-full py-3 bg-white text-primary font-bold rounded-xl shadow-sm hover:shadow-md transition-shadow">{t("Tiếp tục học", "学習を続ける")}</button>
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
    </div>
  );
}
