"use client";

import LearnerNavbar from "@/components/layout/LearnerNavbar";
import LearnerBottomNav from "@/components/layout/LearnerBottomNav";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { bookingApi, BookingDto } from "@/lib/api";

export default function LearnerHomePage() {
  const { t } = useLanguage();
  const [upcomingBookings, setUpcomingBookings] = useState<BookingDto[]>([]);

  useEffect(() => {
    bookingApi.getUpcomingBookings()
      .then(data => setUpcomingBookings(data))
      .catch(console.error);
  }, []);

  // Format a UTC ISO string to Hanoi Time date display
  const formatBookingDate = (utcIso: string) => {
    const d = new Date(utcIso);
    const hanoi = new Date(d.getTime() + 7 * 60 * 60 * 1000);
    const dd = String(hanoi.getUTCDate()).padStart(2, "0");
    const mm = String(hanoi.getUTCMonth() + 1).padStart(2, "0");
    const yyyy = hanoi.getUTCFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  // Format a UTC ISO string to Hanoi Time HH:MM
  const formatBookingTime = (utcIso: string) => {
    const d = new Date(utcIso);
    const hanoi = new Date(d.getTime() + 7 * 60 * 60 * 1000);
    return `${String(hanoi.getUTCHours()).padStart(2, "0")}:${String(hanoi.getUTCMinutes()).padStart(2, "0")}`;
  };

  return (
    <div className="bg-surface font-body text-on-surface leading-relaxed min-h-screen">
      <LearnerNavbar />

      <main className="pt-24 pb-32 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="mb-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-primary mb-2 tracking-tight">
              {t("Chào mừng trở lại, Kenji!", "お帰りなさい、健二さん！")}
            </h1>
            <div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-secondary italic mb-8 mt-6">
              {t("\"Ngôn ngữ là bản đồ văn hóa của một dân tộc. Nó cho bạn biết họ đến từ đâu và họ đang đi tới đâu.\"", "「言語は人々の文化の地図です。彼らがどこから来て、どこへ行くのかを教えてくれます。」")}
            </div>
            <Link
              href="/learner/lessons"
              className="group inline-flex items-center gap-4 bg-primary text-on-primary px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="text-left">
                <span className="block text-xs uppercase tracking-widest opacity-80">
                  {t("Tiếp tục học", "学習を続ける")}
                </span>
                <span className="text-lg font-bold">
                  {t("Bài 05: Tại quán Bún Chả", "レッスン05：ブンチャ屋にて")}
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
                {t("CÂU TRONG NGÀY", "今日のフレーズ")}
              </p>
              <p className="text-primary font-headline font-bold">
                {t("Cho tôi một suất bún chả!", "ブンチャを一人前ください！")}
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
              {t("Chuỗi ngày học", "継続日数")}
            </p>
          </div>

          {/* Upcoming Sessions */}
          <div className="md:col-span-2 bg-surface-container-lowest p-6 rounded-xl shadow-[0_12px_32px_-4px_rgba(9,41,79,0.06)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline font-bold text-lg text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">
                  event_upcoming
                </span>
                {t("Lịch hẹn sắp tới", "次の予定")}
              </h3>
              <Link
                href="/learner/matching"
                className="text-sm font-bold text-secondary hover:underline"
              >
                {t("Xem tất cả", "全て表示")}
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingBookings.map(booking => (
                <div key={booking.bookingId} className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-lg bg-surface-container-low/50 border border-outline-variant/20 group hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-4 grow w-full">
                    <div className="w-12 h-12 rounded-full bg-surface-container-high shrink-0 flex items-center justify-center text-primary font-bold text-xl overflow-hidden border-2 border-white shadow-sm">
                      {booking.partnerName.charAt(0)}
                    </div>
                    <div className="grow">
                      <h4 className="font-bold text-primary">{booking.partnerName}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <span className="text-xs text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">
                            calendar_today
                          </span>
                          {formatBookingDate(booking.startTime)}
                        </span>
                        <span className="text-xs text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">
                            schedule
                          </span>
                          {formatBookingTime(booking.startTime)} - {formatBookingTime(booking.endTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {booking.meetingUrl ? (
                    <a href={booking.meetingUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto bg-green-500 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-green-600 transition-all no-underline flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">videocam</span>
                      {t("Tham gia", "入室")}
                    </a>
                  ) : (
                    <Link href={`/learner/messages`} className="w-full sm:w-auto bg-primary text-on-primary px-6 py-2 rounded-lg font-bold text-sm hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer text-center">
                      {t("Chi tiết", "詳細")}
                    </Link>
                  )}
                </div>
              ))}
              {upcomingBookings.length === 0 && (
                <div className="p-4 rounded-lg bg-surface-container-low/50 border border-outline-variant/20 text-center text-sm text-secondary italic">
                  {t("Chưa có lịch hẹn nào", "予定はありません")}
                </div>
              )}
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
                  {t("Sẵn sàng", "オンライン")}
                </span>
                <h4 className="font-headline font-bold text-primary group-hover:text-white text-2xl mb-2">
                  {t("Kết nối đối tác", "マッチング")}
                </h4>
                <p className="text-on-surface-variant group-hover:text-on-primary-container">
                  {t("Tìm người luyện nói trực tuyến ngay", "今すぐ練習相手を探す")}
                </p>
              </div>
              <span className="bg-primary text-on-primary group-hover:bg-white group-hover:text-primary px-6 py-3 rounded-lg font-bold transition-colors">
                {t("Bắt đầu", "開始")}
              </span>
            </Link>
          </div>
        </section>
      </main>

      <LearnerBottomNav />
    </div>
  );
}
