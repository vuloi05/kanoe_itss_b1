"use client";

import LearnerNavbar from "@/components/layout/LearnerNavbar";
import LearnerBottomNav from "@/components/layout/LearnerBottomNav";
import Image from "next/image";
import Link from "next/link";

export default function LearnerHomePage() {
  return (
    <div className="bg-surface font-body text-on-surface leading-relaxed min-h-screen">
      <LearnerNavbar />

      <main className="pt-24 pb-32 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="mb-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-primary mb-2 tracking-tight">
              Chào mừng trở lại, Kenji!
            </h1>
            <p className="font-headline text-xl text-secondary mb-6">
              お帰りなさい、健二さん！
            </p>
            <div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-secondary italic mb-8">
              &quot;Ngôn ngữ là bản đồ văn hóa của một dân tộc. Nó cho bạn biết
              họ đến từ đâu và họ đang đi tới đâu.&quot;
            </div>
            <Link
              href="/learner/lessons"
              className="group inline-flex items-center gap-4 bg-primary text-on-primary px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="text-left">
                <span className="block text-xs uppercase tracking-widest opacity-80">
                  Tiếp tục học / 学習を続ける
                </span>
                <span className="text-lg font-bold">
                  Bài 05: Tại quán Bún Chả / レッスン05：ブンチャ屋にて
                </span>
              </div>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>
          </div>
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="aspect-video rounded-xl overflow-hidden shadow-2xl rotate-2">
              <Image
                alt="Phố cổ Hà Nội"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDciTZrEG6Zs41OfA0UyRXCfg_1yQT_Bg9gS_jvNO77XhzFYR5xLjc-4-ciWoDbqVoyn3zJH-nXscr2iU-qhf40cAG9Dhrdho8X-5TC-tLZXTy8MgEZt4GmgQzJX5AJueoklSCo85JswPF13H-6dbLo2BuZU6q77InqfL6ECMVZzwXZ7uyjkEGtRloFvVVlULqPIRH4-pDIWzH4BxfcexK28xv7F5HqHrA257pjcMIzvfCh-dt3-Z6HjMKQKIYISIMJBIEPQ4lfTFUZ"
                width={640}
                height={360}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-surface-container-lowest p-4 rounded-xl shadow-lg -rotate-3 border border-outline-variant/10">
              <p className="text-xs font-bold text-secondary">
                CÂU TRONG NGÀY / 今日のフレーズ
              </p>
              <p className="text-primary font-headline font-bold">
                Cho tôi một suất bún chả!
              </p>
              <p className="text-xs text-on-surface-variant italic">
                ブンチャを一人前ください！
              </p>
            </div>
          </div>
        </section>

        {/* Stats Bento Grid */}
        <section className="grid grid-cols-1 gap-6 mb-12 md:grid-cols-3">
          {/* Streak Card */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_12px_32px_-4px_rgba(9,41,79,0.06)] flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 mb-4 flex items-center justify-center text-error">
              <span
                className="material-symbols-outlined text-5xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_fire_department
              </span>
            </div>
            <p className="text-3xl font-black text-primary">12</p>
            <p className="text-sm font-medium text-on-surface-variant">
              Chuỗi ngày học / 継続日数
            </p>
          </div>

          {/* Upcoming Sessions */}
          <div className="md:col-span-2 bg-surface-container-lowest p-6 rounded-xl shadow-[0_12px_32px_-4px_rgba(9,41,79,0.06)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline font-bold text-lg text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">
                  event_upcoming
                </span>
                Lịch hẹn sắp tới / 次の予定
              </h3>
              <Link
                href="/learner/matching"
                className="text-sm font-bold text-secondary hover:underline"
              >
                Xem tất cả / 全て表示
              </Link>
            </div>
            <div className="space-y-4">
              {/* Session Card */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-lg bg-surface-container-low/50 border border-outline-variant/20 group hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-4 grow w-full">
                  <div className="w-12 h-12 rounded-full bg-secondary-fixed shrink-0 flex items-center justify-center text-secondary font-bold text-xl overflow-hidden border-2 border-white shadow-sm">
                    <Image
                      alt="Minh Anh"
                      src="https://lh3.googleusercontent.com/aida-public/AKb_5YQ_f5T5T4S5Y-vR9y_g8VnJjF3Y5oX3H9K6H4I6J7P8L9M0N1O2P3Q4R5S6=s120"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="grow">
                    <h4 className="font-bold text-primary">Minh Anh</h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <span className="text-xs text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          calendar_today
                        </span>
                        14/10/2023
                      </span>
                      <span className="text-xs text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          schedule
                        </span>
                        19:00 - 19:30
                      </span>
                    </div>
                  </div>
                </div>
                <button className="w-full sm:w-auto bg-primary text-on-primary px-6 py-2 rounded-lg font-bold text-sm hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer">
                  Join / 入室
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Matching CTA */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-3">
            <Link
              href="/learner/matching"
              className="group bg-surface-container-lowest p-8 rounded-xl shadow-sm hover:bg-primary-container transition-all duration-300 flex flex-col md:flex-row items-center gap-8"
            >
              <div className="p-6 bg-primary/5 group-hover:bg-white/10 rounded-2xl">
                <span className="material-symbols-outlined text-primary group-hover:text-white text-5xl">
                  groups
                </span>
              </div>
              <div className="grow text-center md:text-left">
                <span className="text-xs font-bold text-on-surface-variant group-hover:text-on-primary-container uppercase tracking-widest block mb-2">
                  Sẵn sàng / オンライン
                </span>
                <h4 className="font-headline font-bold text-primary group-hover:text-white text-2xl mb-2">
                  Kết nối đối tác / マッチング
                </h4>
                <p className="text-on-surface-variant group-hover:text-on-primary-container">
                  Tìm người luyện nói trực tuyến ngay / 今すぐ練習相手を探す
                </p>
              </div>
              <span className="bg-primary text-on-primary group-hover:bg-white group-hover:text-primary px-6 py-3 rounded-lg font-bold transition-colors">
                Bắt đầu / 開始
              </span>
            </Link>
          </div>
        </section>
      </main>

      <LearnerBottomNav />
    </div>
  );
}
