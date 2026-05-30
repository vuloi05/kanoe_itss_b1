"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { t } = useLanguage();

  // Redirect authenticated users to their role-based home
  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && user) {
      const redirectPath = user.role === "partner" ? "/partner/home" : "/learner/home";
      router.replace(redirectPath);
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || (isAuthenticated && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-on-surface-variant text-sm font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      {/* TopAppBar */}
      <nav className="bg-[#f9f9f7] dark:bg-slate-900 sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-6 py-4">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold text-primary dark:text-blue-200 font-headline tracking-wide">
              VietImmerse
            </span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href="/login" className="text-sm font-bold text-primary hover:text-secondary transition-colors">
              {t("Đăng nhập", "ログイン")}
            </Link>
            <Link href="/signup" className="bg-primary text-on-primary px-5 py-2 rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95">
              {t("Bắt đầu ngay", "会員登録")}
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 space-y-24">
        {/* Hero Section */}
        <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-fixed text-secondary text-xs font-bold uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm">star</span>
              {t("Được hơn 5,000 người nước ngoài tại Hà Nội tin dùng", "ハノイ在住者5,000人以上が愛用")}
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-extrabold text-primary tracking-tight leading-[1.05]">
              {t("Nắm vững tiếng Việt miền Bắc.", "北部ベトナム語をマスター。")}
            </h1>
            <p className="text-on-surface-variant max-w-xl leading-relaxed text-lg">
              {t("VietImmerse giúp bạn tự tin giao tiếp tại Hà Nội. Học cách phát âm chuẩn miền Bắc, khám phá văn hóa địa phương và kết nối với người dân một cách tự nhiên nhất.", "VietImmerseで北部ベトナム語をマスターしましょう。ハノイの街角で、もっと自由に。北部方言の響きを楽しみながら、新しいつながりを見つけましょう。")}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/signup" className="bg-primary text-on-primary px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300">
                {t("Bắt đầu miễn phí", "無料で始める")}
              </Link>
              <button className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg border border-outline/30 hover:bg-surface-container-low transition-all">
                <span className="material-symbols-outlined">play_circle</span>
                {t("Xem Demo", "デモを見る")}
              </button>
            </div>
          </div>
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/5] bg-surface-container-low rounded-[3rem] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700">
              <Image alt="Vibrant street scene in Hanoi" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzXCTXyevyo1Lyg7ehDPHVHapjaXrKFhS5OqBJ0HcV__d9aGHagvq_VO-p-VlsDPOzfFseY4xwKm-QuEHrPdAfcGbZh7xJOwVnW2KEJUslxecroy8cEBKrspPIGIuTh-5EU8TAB5T5QAGCBDZ3KHZWfN30XNuDmLVOfnxmHlAp4lD9th9b9k3J5vtzdvNa0_Ilo-34q0iCT-jGO6eWFKxIjG1qAsB53SUHwh0FlbzMGXvkTlMHOWm_aEzOUrBezGcLbZ_RRdYbRU4-" fill unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent"></div>
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-12 p-6 bg-surface-container-lowest shadow-xl rounded-2xl max-w-[240px] border border-surface-container-high hidden md:block">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-error animate-pulse"></div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{t("Phân tích AI trực tiếp", "ライブAI分析")}</span>
              </div>
              <p className="text-sm font-headline font-bold text-primary italic mb-2">&quot;Phở bò Hà Nội&quot;</p>
              <div className="h-1 w-full bg-surface-container-low rounded-full overflow-hidden mb-1">
                <div className="h-full bg-primary" style={{ width: "92%" }}></div>
              </div>
              <p className="text-[10px] text-secondary font-bold text-right">{t("Độ chính xác 92%", "精度92%")}</p>
            </div>
          </div>
        </header>

        {/* Features Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-surface-container-lowest p-10 rounded-[2.5rem] shadow-sm flex flex-col justify-center border border-surface-container-high">
            <h2 className="text-3xl font-headline font-bold text-primary mb-8 leading-tight">
              {t("Tại sao chọn chúng tôi", "なぜ私たちを選ぶのか")}
            </h2>
            <div className="space-y-8">
              {[
                { icon: "location_on", title: t("Bối cảnh Hà Nội thực tế", "ハノイの日常生活"), desc: t("Học các biểu thức sống động có thể dùng trực tiếp trong cuộc sống hàng ngày ở Hà Nội, điều không có trong sách giáo khoa.", "教科書にはない、ハノイの日常生活でそのまま使える生きた表現を学びます。"), bg: "bg-primary-container", textColor: "text-on-primary-container" },
                { icon: "graphic_eq", title: t("Phân tích thanh điệu AI", "AIによる声調分析"), desc: t("AI phân tích thanh điệu đặc trưng của miền Bắc. Chỉnh sửa phát âm thông qua phản hồi trực quan.", "北部特有の声調をAIが分析。視覚的なフィードバックで発音を矯正します。"), bg: "bg-secondary-container", textColor: "text-on-secondary-container" },
                { icon: "diversity_3", title: t("Ghép cặp người bản xứ", "ネイティブとのマッチング"), desc: t("Kết nối với các đối tác học ngôn ngữ tương thích và nuôi dưỡng các kỹ năng thực tế thông qua các tương tác thực tế.", "相性の良い現地の学習パートナーと繋がり、リアルな対話で実践力を養います。"), bg: "bg-tertiary-container", textColor: "text-on-tertiary-container" },
              ].map((item) => (
                <div key={item.icon} className="flex gap-5">
                  <div className={`flex-shrink-0 w-12 h-12 ${item.bg} rounded-2xl flex items-center justify-center`}>
                    <span className={`material-symbols-outlined ${item.textColor}`}>{item.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">{item.title}</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-container-low p-8 rounded-3xl group h-full flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-surface-container-lowest rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-3xl">group</span>
                </div>
                <h4 className="font-headline font-bold text-xl mb-2">{t("Trung tâm ghép cặp", "マッチングハブ")}</h4>
                <p className="text-sm text-on-surface-variant mb-6">{t("AI đề xuất các đối tác học tập tối ưu. Chúng tôi hỗ trợ tiếp thu ngôn ngữ tự nhiên thông qua giao lưu văn hóa.", "最適な学習パートナーをAIが提案。文化交流を通じた自然な言語習得をサポートします。")}</p>
              </div>
              <div className="flex -space-x-3 mt-auto">
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-low bg-slate-300"></div>
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-low bg-slate-400"></div>
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-low bg-slate-500"></div>
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-low bg-primary text-[10px] text-on-primary flex items-center justify-center font-bold">+400</div>
              </div>
            </div>

            <div className="bg-primary p-8 rounded-3xl text-on-primary group h-full flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-primary-container rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-on-primary-container text-3xl">mic</span>
                </div>
                <h4 className="font-headline font-bold text-xl mb-2">{t("Phòng luyện nói", "スピーキングラボ")}</h4>
                <p className="text-sm text-on-primary-container/80 mb-6">{t("Phòng thí nghiệm chỉnh sửa phát âm làm việc 24 giờ. AI phân tích dạng sóng giọng nói của bạn và chỉ ra những điểm cần cải thiện ngay lập tức.", "24時間いつでも利用可能な発音矯正ラボ。AIがあなたの音声を波形解析し、改善点を即座に指摘。")}</p>
              </div>
              <div className="mt-auto">
                <span className="inline-block px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-[10px] font-bold uppercase tracking-widest">{t("Được cải tiến bởi AI", "AI Enhanced")}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center space-y-8 py-12">
          <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-primary">
            {t("Sẵn sàng để nói như một người Hà Nội?", "ハノイっ子のように話してみませんか？")}
          </h2>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
            {t("Bắt đầu miễn phí và mở rộng thế giới mới của bạn. Hơn 5,000 học viên đang chờ bạn tham gia.", "無料で始めて、新しい世界を広げましょう。5,000人以上の学習者があなたの参加を待っています。")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup" className="bg-primary text-on-primary px-10 py-5 rounded-2xl font-bold text-xl hover:shadow-2xl hover:scale-105 transition-all">{t("Đăng ký", "会員登録")}</Link>
            <Link href="/learner/lessons" className="bg-surface-container-low text-primary px-10 py-5 rounded-2xl font-bold text-xl border border-surface-container-high hover:bg-surface-container-lowest transition-all">{t("Khám phá giáo trình", "カリキュラムを見る")}</Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-surface-container-high py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <span className="text-2xl font-bold text-primary font-headline">VietImmerse</span>
          <div className="flex gap-8 text-sm font-medium text-on-surface-variant">
            <Link className="hover:text-primary transition-colors" href="/terms">{t("Điều khoản", "利用規約")}</Link>
            <Link className="hover:text-primary transition-colors" href="/privacy">{t("Quyền riêng tư", "プライバシー")}</Link>
            <Link className="hover:text-primary transition-colors" href="/help">{t("Trung tâm trợ giúp", "ヘルプ")}</Link>
            <Link className="hover:text-primary transition-colors" href="/blog">{t("Blog", "ブログ")}</Link>
          </div>
          <p className="text-xs text-on-surface-variant">{t("© 2024 VietImmerse. Bảo lưu mọi quyền.", "© 2024 VietImmerse. All rights reserved.")}</p>
        </div>
      </footer>

      {/* Mobile CTA Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full z-50 p-4 bg-background/80 backdrop-blur-lg border-t border-surface-container-high">
        <Link href="/signup" className="block w-full bg-primary text-on-primary py-4 rounded-xl font-bold text-sm shadow-xl text-center">{t("Bắt đầu miễn phí", "会員登録")}</Link>
      </div>
      <div className="h-24 md:hidden"></div>
    </div>
  );
}
