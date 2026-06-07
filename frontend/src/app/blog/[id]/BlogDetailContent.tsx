"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { formatDate, type BlogPost } from "../_data";

export default function BlogDetailContent({ post }: { post: BlogPost }) {
  const { t, lang } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-surface-container-high">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/blog"
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group"
          >
            <span className="material-symbols-outlined text-xl group-hover:-translate-x-0.5 transition-transform">
              arrow_back
            </span>
            <span className="text-sm font-medium">{t("Quay lại Blog", "ブログに戻る")}</span>
          </Link>
          <Link
            href="/"
            className="text-lg font-bold text-primary font-headline"
          >
            VietImmerse
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16 relative">
        <div className="absolute top-4 right-6 md:top-8 md:right-8">
          <LanguageSwitcher />
        </div>

        {/* Article header */}
        <header className="mb-12 text-center mt-8 md:mt-0">
          {/* Category badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 ${post.categoryColor}`}
          >
            <span className="material-symbols-outlined text-sm">
              {post.categoryIcon}
            </span>
            {lang === "ja" && post.categoryJa ? post.categoryJa : post.category}
          </span>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-headline font-extrabold text-primary leading-tight mb-6">
            {lang === "ja" && post.titleJa ? post.titleJa : post.title}
          </h1>

          {/* Meta row */}
          <div className="flex items-center justify-center gap-6 text-sm text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">
                calendar_today
              </span>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </div>
            <span className="w-1 h-1 rounded-full bg-outline" />
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">
                schedule
              </span>
              {lang === "ja" && post.readTimeJa ? post.readTimeJa : post.readTime}
            </div>
          </div>
        </header>

        {/* Gradient banner */}
        <div
          className={`relative w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-12 bg-gradient-to-br ${post.gradientFrom} ${post.gradientTo}`}
        >
          <div className="absolute inset-0 opacity-10 bg-pattern" />
        </div>

        {/* Article body — custom prose styling using the project's design tokens */}
        <article className="prose-blog max-w-3xl mx-auto">
          <div dangerouslySetInnerHTML={{ __html: (lang === "ja" && post.bodyHtmlJa) ? post.bodyHtmlJa : post.bodyHtml }} />
        </article>

        {/* Bottom navigation */}
        <div className="mt-16 pt-8 border-t border-surface-container-high flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-lg">
              arrow_back
            </span>
            {t("Quay lại tất cả bài viết", "すべての記事に戻る")}
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl font-medium text-sm hover:shadow-lg hover:translate-y-[-1px] transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">
              rocket_launch
            </span>
            {t("Bắt đầu học ngay", "今すぐ学習を始める")}
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-surface-container-high py-8 px-6 mt-8">
        <p className="text-center text-xs text-on-surface-variant">
          © {new Date().getFullYear()} VietImmerse. {t("Bảo lưu mọi quyền.", "全著作権所有。")}
        </p>
      </footer>
    </div>
  );
}
