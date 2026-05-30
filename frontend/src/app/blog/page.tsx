import type { Metadata } from "next";
import Link from "next/link";
import { MOCK_POSTS, formatDate, type BlogPost } from "./_data";

export const metadata: Metadata = {
  title: "Blog & Văn hóa - VietImmerse",
  description:
    "Khám phá bí quyết học tiếng Việt miền Bắc, phương pháp AI, và nhịp sống văn hóa Hà Nội cùng VietImmerse.",
};

// ─── Article Card ─────────────────────────────────────────────
function ArticleCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.id}`}
      className="group block cursor-pointer"
    >
      <article className="flex flex-col bg-surface-container-lowest rounded-2xl border border-surface-container-high overflow-hidden hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 h-full">
        {/* Gradient thumbnail area */}
        <div
          className={`relative h-48 bg-gradient-to-br ${post.gradientFrom} ${post.gradientTo} flex items-end p-6`}
        >
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10 bg-pattern" />

          {/* Category badge */}
          <span
            className={`relative z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${post.categoryColor}`}
          >
            <span className="material-symbols-outlined text-sm">
              {post.categoryIcon}
            </span>
            {post.category}
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-6">
          <h3 className="text-lg font-headline font-bold text-primary leading-snug mb-3 group-hover:text-secondary transition-colors line-clamp-2">
            {post.title}
          </h3>

          <p className="text-sm text-on-surface-variant leading-relaxed mb-6 line-clamp-3 flex-1">
            {post.excerpt}
          </p>

          {/* Footer meta */}
          <div className="flex items-center justify-between text-xs text-on-surface-variant/70 pt-4 border-t border-surface-container-high">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">
                calendar_today
              </span>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">
                schedule
              </span>
              {post.readTime}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-surface-container-high">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group"
          >
            <span className="material-symbols-outlined text-xl group-hover:-translate-x-0.5 transition-transform">
              arrow_back
            </span>
            <span className="text-sm font-medium">Trang chủ</span>
          </Link>
          <span className="text-lg font-bold text-primary font-headline">
            VietImmerse
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        {/* Hero */}
        <section className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container text-on-primary-container text-xs font-bold uppercase tracking-widest mb-6">
            <span className="material-symbols-outlined text-sm">
              auto_stories
            </span>
            Blog
          </div>

          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-primary mb-4">
            Blog & Văn hóa
          </h1>
          <p className="text-on-surface-variant max-w-2xl mx-auto leading-relaxed text-lg">
            Khám phá bí quyết học tiếng Việt và nhịp sống Hà Nội
          </p>

          {/* Category pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {[
              { label: "Tất cả", icon: "apps", active: true },
              { label: "Phương pháp học", icon: "school", active: false },
              { label: "Văn hóa", icon: "local_cafe", active: false },
              { label: "Công nghệ & EdTech", icon: "smart_toy", active: false },
              { label: "Ẩm thực", icon: "ramen_dining", active: false },
              { label: "Thủ tục & Đời sống", icon: "description", active: false },
              { label: "Du lịch & Văn hóa", icon: "tour", active: false },
            ].map((pill) => (
              <button
                key={pill.label}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  pill.active
                    ? "bg-primary text-on-primary shadow-md"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {pill.icon}
                </span>
                {pill.label}
              </button>
            ))}
          </div>
        </section>

        {/* Post Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_POSTS.map((post) => (
            <ArticleCard key={post.id} post={post} />
          ))}
        </section>

        {/* Newsletter CTA */}
        <section className="mt-20 p-8 md:p-12 bg-surface-container-lowest rounded-2xl border border-surface-container-high text-center">
          <span className="material-symbols-outlined text-primary text-3xl mb-3 block">
            mail
          </span>
          <h2 className="font-headline font-bold text-primary text-xl mb-2">
            Đăng ký nhận bài viết mới
          </h2>
          <p className="text-sm text-on-surface-variant mb-6 max-w-lg mx-auto">
            Nhận bài viết mới nhất về phương pháp học tiếng Việt, văn hóa Hà Nội
            và công nghệ EdTech mỗi tuần.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="email@example.com"
              className="w-full sm:flex-1 px-4 py-3 rounded-xl border border-surface-container-high bg-background text-on-surface text-sm placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl font-medium text-sm hover:shadow-lg hover:translate-y-[-1px] transition-all active:scale-95">
              <span className="material-symbols-outlined text-lg">send</span>
              Đăng ký
            </button>
          </div>
        </section>

        {/* Back link */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-lg">
              arrow_back
            </span>
            Quay lại trang chủ
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-surface-container-high py-8 px-6 mt-8">
        <p className="text-center text-xs text-on-surface-variant">
          © 2024 VietImmerse. Bảo lưu mọi quyền.
        </p>
      </footer>
    </div>
  );
}