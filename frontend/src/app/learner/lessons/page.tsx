"use client";
import LearnerNavbar from "@/components/layout/LearnerNavbar";
import LearnerBottomNav from "@/components/layout/LearnerBottomNav";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LessonsPage() {
  const { t } = useLanguage();
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

        {/* Bento Grid Layout for Chapters */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Chapter 1 */}
          <section className="lg:col-span-6 space-y-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container">
                <span className="material-symbols-outlined">graphic_eq</span>
              </div>
              <div>
                <h2 className="font-headline font-bold text-xl text-primary">{t("Chương 1: Thanh điệu miền Bắc", "第1章：北部の声調")}</h2>
              </div>
            </div>

            {/* Lesson Card 1: Completed */}
            <div className="group bg-surface-container-lowest p-6 rounded-xl transition-all duration-300 hover:bg-primary-container hover:-translate-y-1 cursor-pointer">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-surface-container text-on-surface-variant text-[10px] font-bold uppercase rounded-md group-hover:bg-primary group-hover:text-white">{t("Sơ cấp", "初級")}</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-md group-hover:bg-white group-hover:text-primary">{t("Đã xong", "完了")}</span>
                </div>
                <span className="material-symbols-outlined text-secondary group-hover:text-on-primary-container" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
              </div>
              <h3 className="font-headline font-bold text-xl text-primary group-hover:text-white mb-1">{t("Thanh sắc & Thanh huyền", "昇り声調と降り声調")}</h3>
              <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden mt-6">
                <div className="h-full bg-secondary w-full"></div>
              </div>
            </div>

            {/* Lesson Card 2: In Progress */}
            <Link href="/learner/lessons/1" className="block group bg-surface-container-lowest p-6 rounded-xl transition-all duration-300 hover:bg-primary-container hover:-translate-y-1">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase rounded-md group-hover:bg-primary group-hover:text-white">{t("Trung cấp", "中級")}</span>
                  <span className="px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-bold uppercase rounded-md group-hover:bg-white group-hover:text-secondary">{t("Đang học", "進行中")}</span>
                </div>
                <div className="flex items-center gap-1 text-secondary font-bold text-xs uppercase group-hover:text-on-primary-container">
                  <span className="material-symbols-outlined text-sm mr-1">play_circle</span>
                  75%
                </div>
              </div>
              <h3 className="font-headline font-bold text-xl text-primary group-hover:text-white mb-1">{t("Thanh hỏi & Thanh ngã", "疑問声調と転がり声調")}</h3>
              <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden mt-6">
                <div className="h-full bg-secondary w-3/4"></div>
              </div>
            </Link>

            {/* Decorative Illustration Card */}
            <div className="relative overflow-hidden h-64 rounded-xl bg-primary">
              <img alt="Phonetic visualization" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFMz1glCLwjQr6Pi8qFq7R3DEZS5O_Hu83nxAY7FCaoZcPIOaslFZL0KYqvagK-BGdV5rG3MywedyYbzjHEBkOPnsefLkN4eqwxYz7YqsVSDRFqShCKoUuu3g8cb9rsYOq5y2UbxGPt-csUqzVkfzdhheAOeqcYlDwtZtoSk8klU-r0FAFIv_pCb7lnP6CgoncR8qAg1cduo85Wk8akDhVHC2cCVJsLysV0Z5bAIwZru7OHL88TTFmLFcrusMeL8fx0U_KD2UTylOE" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <p className="text-white/80 font-medium text-sm mb-1">{t("Làm chủ sự chuyển điệu", "声調の変化をマスターする")}</p>
                <h4 className="text-white text-2xl font-headline font-bold">{t("Giai điệu Hà Nội", "ハノイの旋律")}</h4>
              </div>
            </div>
          </section>

          {/* Right Column: Chapter 2 + Stats */}
          <section className="lg:col-span-6 space-y-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <span className="material-symbols-outlined">restaurant_menu</span>
              </div>
              <div>
                <h2 className="font-headline font-bold text-xl text-primary">{t("Chương 2: Giao tiếp tại quán ăn", "第2章：飲食店での会話")}</h2>
              </div>
            </div>

            {/* Lesson Card 3: In Progress */}
            <div className="group bg-surface-container-lowest p-6 rounded-xl transition-all duration-300 hover:bg-primary-container hover:-translate-y-1 cursor-pointer">
              <div className="flex justify-between items-start mb-6">
                <span className="px-3 py-1 bg-surface-container text-on-surface-variant text-[10px] font-bold uppercase rounded-md group-hover:bg-primary group-hover:text-white">{t("Thực tế", "実践")}</span>
                <div className="flex items-center gap-1 text-secondary font-bold text-xs uppercase group-hover:text-on-primary-container">
                  <span className="material-symbols-outlined text-sm mr-1">schedule</span>
                  {t("12 phút", "12 分")}
                </div>
              </div>
              <h3 className="font-headline font-bold text-xl text-primary group-hover:text-white mb-1">{t("Gọi món tại quán Bún Chả", "ブンチャ屋での注文")}</h3>
              <div className="flex gap-2 mt-6">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
                <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
              </div>
            </div>

            {/* Lesson Card 4: Locked */}
            <div className="group bg-surface-container-low/50 p-6 rounded-xl border border-dashed border-outline-variant flex items-center justify-between opacity-80">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-headline font-bold text-lg text-on-surface-variant/70">{t("Yêu cầu thanh toán", "お会計をお願いする")}</h3>
                  <span className="material-symbols-outlined text-sm text-on-surface-variant/50 ml-2">lock</span>
                </div>
              </div>
              <div className="text-[10px] font-bold uppercase text-on-surface-variant/40 tracking-widest">{t("Khóa", "ロック")}</div>
            </div>

            {/* Progress Lotus (Custom Component) */}
            <div className="bg-surface-container-high p-8 rounded-2xl relative overflow-hidden flex flex-col items-center text-center">
              <div className="mb-6 relative">
                {/* Geometric Lotus Petal tracker simulation */}
                <div className="w-24 h-24 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-6xl" style={{ fontVariationSettings: '"FILL" 1' }}>potted_plant</span>
                </div>
                <div className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{t("CẤP ĐỘ 4", "レベル 4")}</div>
              </div>
              <h4 className="font-headline font-bold text-primary mb-2">{t("Tiến độ học tập", "学習進捗")}</h4>
              <p className="text-sm text-on-surface-variant mb-6">{t("Đã hoàn thành 12/45 bài học trình độ V1", "V1レベルの45レッスン中12レッスンを完了")}</p>
              <button className="w-full py-3 bg-white text-primary font-bold rounded-xl shadow-sm hover:shadow-md transition-shadow">{t("Tiếp tục học", "学習を続ける")}</button>
              {/* Decorative background element */}
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-secondary/10 rounded-full blur-2xl"></div>
            </div>

            {/* Image Card: Hanoi Vibes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl overflow-hidden h-40">
                <img alt="Hanoi Old Quarter" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwI9Xc14FI44F6EMCDm3-pBNdlvPF8cE7gIf7ebcv7U3xoIwSVchrDHbvxYvNNrKQJynlWGSp38-SxpfDPmUwy1BbpNy2lzAXr8rvREpo6zYohtpQ0qsKNAlWGxIBKA7kDM6uQ52pc6MFoGPS1Ty-9gy-z8uM-KDXbEBovid3CV3yLMnFe1CgSEp41y8__pxFxlAW5onDP9mJfcQCAagU20wuCPUg-AhjyRLxYNSp_b6lQ3vTY-WnTvB0b7xmZSSqVyUFA7KVMIFze" />
              </div>
              <div className="rounded-xl overflow-hidden h-40">
                <img alt="Vietnamese Lotus" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA60U4Nyh3q3RNPY--mVQmRGHx82UasWmFzcsTZjxh_NZVpPHJ3i9s3oNdD3cG98W7-uZEMiq8Qr5Wo2VbaLfxh2wNU-5J3R7gO3wdTmt8JTjQp5lwSb6vjQbrDlU6PScWUlwrTfdhPLvVtMsuyjFAeWYT5GdLxhT9ieaFoYDdiY55oapkYret0SRGoH8rvBhR0EuMSOThabzgzqwAkUwpwQIjJoGRfIvSg-q0Nbrj2uxQQsXEcEKeCXywQoboDnk2dGT_CJtvoWfOy" />
              </div>
            </div>
          </section>
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
      </main>
      <LearnerBottomNav />
    </div>
  );
}

