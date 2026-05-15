"use client";
import LearnerNavbar from "@/components/layout/LearnerNavbar";
import LearnerBottomNav from "@/components/layout/LearnerBottomNav";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

interface Partner {
  name: string;
  nameJa: string;
  bio: string;
  bioJa: string;
  image: string;
  online: boolean;
  ageRange: string;
  category: string;
  categoryJa: string;
}

const partners: Partner[] = [
  {
    name: "Minh Anh",
    nameJa: "ミン・アン",
    bio: "Yêu lịch sử Phố Cổ và cà phê trứng. Hãy cùng trò chuyện!",
    bioJa: "旧市街の歴史とエッグコーヒーが大好きです。お話ししましょう！",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDEMK6ghkT5a7fT-IWNMOlaVGGHrdmWTDb3UjFVmBqKdQavMDJWhqesIEE7HPKvPDvLciFw03lg9OvyxjJyQiiA7U7VXR50sNWOPP9k3Y1oLRF3q4ChGgP-skUcN1lP32blsqcTVP6U2j1G_vtRF1Vm14bsVhH_XilXyM7FpMsat_J1A1wq5p5xWNElzVEtkSGQgB-jLP95hPrXDvdv3iaHc_kbg8r-tQZHJTJw6GyyNOHKloBZKJZBEsTicbrurLPqDVinK2kWIB5N",
    online: true,
    ageRange: "25-30",
    category: "Lịch sử",
    categoryJa: "歴史",
  },
  {
    name: "Đức Hoàng",
    nameJa: "ドゥック・ホアン",
    bio: "Tiếng Việt thương mại và kỹ thuật cho người đi làm.",
    bioJa: "社会人のためのビジネス・技術ベトナム語。",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBm8B-o4eWTZrpP8a89d2Rtp340DFLceeQVYWR1cdSbIAZBH8HwY6QUnYtfzFPDSNLgTS56OlgJ-6lBtJ4neJ8nWOr0I0UtpO5kiBHeoBMOCJFUDnTt8pbuXM8-eonYGNmH-VNcTneGaZxokqs7W3BuHOqB8YmL5kx077xh13-spK923p3UXkws9yPxPnD-O5p4ragXGf51Wn-ll0xX_lBGlU9GyAoS7ThD1211Hp4P85OqkMwshhvrxSkQFfmYBUyBXqb4hiulhB9U",
    online: false,
    ageRange: "31-40",
    category: "Business",
    categoryJa: "ビジネス",
  },
  {
    name: "Lan Phương",
    nameJa: "ラン・フォン",
    bio: "Hướng dẫn tiếng Việt bằng tiếng Nhật cho người mới bắt đầu.",
    bioJa: "初心者向けに日本語でベトナム語を教えます。",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCbd7as7WAeKrraIc2Px8yx0QbWpAj66lARUfMoeMsmQOjp5TI_pR_hy7JIPldh0miTpe4mn1NSpMvoUQvlF_-fcezRMMJx5gNJ7QcnxKEnZLJKFUa0iS-43q8EUb6O624uIFTbVxGE1yPvwEbiVmtdHpwczkdQxrKQJNaSkxOqt-8rCBzqfyX0tazxtoDGL-deU63R-23-o_H8mRMG0RVrFinODvR1jpkKaGqob46qrnkkP_zeVzcPXav8hXKMyahIdABO0dUKSjI_",
    online: true,
    ageRange: "18-24",
    category: "Education",
    categoryJa: "教育",
  },
  {
    name: "Thanh Sơn",
    nameJa: "タイン・ソン",
    bio: "Nhiếp ảnh gia tự do tại Hồ Tây. Muốn kết bạn quốc tế.",
    bioJa: "西湖のフリーランス写真家。国際的な友達を作りたいです。",
    image: "",
    online: true,
    ageRange: "25-30",
    category: "Creative",
    categoryJa: "クリエイティブ",
  },
];

export default function MatchingPage() {
  const { t } = useLanguage();
  const [ageFilter, setAgeFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredPartners = partners.filter((p) => {
    if (ageFilter !== "all" && p.ageRange !== ageFilter) return false;
    if (statusFilter === "online" && !p.online) return false;
    if (statusFilter === "offline" && p.online) return false;
    return true;
  });

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

          {/* View All Messages Button */}
          <div className="flex justify-end mb-4">
            <Link
              href="/learner/messages"
              className="flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg font-headline font-bold text-sm hover:bg-secondary hover:text-white transition-all duration-300"
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
              <div className="relative">
                <select
                  value={ageFilter}
                  onChange={(e) => setAgeFilter(e.target.value)}
                  className="w-full appearance-none bg-surface-container-low border-none rounded-xl py-3 pl-4 pr-10 text-sm font-medium text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="all">
                    {t("Tất cả", "すべて")}
                  </option>
                  <option value="18-24">18-24</option>
                  <option value="25-30">25-30</option>
                  <option value="31-40">31-40</option>
                  <option value="40+">40+</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-xl">
                  expand_more
                </span>
              </div>
            </div>

            {/* Job Filter */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-[10px] uppercase tracking-wider font-bold text-secondary mb-1.5 ml-1">
                {t("Công việc", "職業")}
              </label>
              <div className="relative">
                <select
                  value={jobFilter}
                  onChange={(e) => setJobFilter(e.target.value)}
                  className="w-full appearance-none bg-surface-container-low border-none rounded-xl py-3 pl-4 pr-10 text-sm font-medium text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="all">
                    {t("Tất cả", "すべて")}
                  </option>
                  <option value="education">
                    {t("Giáo dục", "教育")}
                  </option>
                  <option value="tech">
                    {t("Kỹ thuật", "技術")}
                  </option>
                  <option value="business">
                    {t("Kinh doanh", "ビジネス")}
                  </option>
                  <option value="art">
                    {t("Nghệ thuật", "芸術")}
                  </option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-xl">
                  expand_more
                </span>
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-[10px] uppercase tracking-wider font-bold text-secondary mb-1.5 ml-1">
                {t("Trạng thái", "状態")}
              </label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full appearance-none bg-surface-container-low border-none rounded-xl py-3 pl-4 pr-10 text-sm font-medium text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="all">
                    {t("Tất cả", "すべて")}
                  </option>
                  <option value="online">
                    {t("Trực tuyến", "オンライン")}
                  </option>
                  <option value="offline">
                    {t("Ngoại tuyến", "オフライン")}
                  </option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-xl">
                  expand_more
                </span>
              </div>
            </div>

            {/* Search Button */}
            <button className="bg-primary text-on-primary self-end h-[46px] px-8 rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">search</span>
              {t("Tìm kiếm", "検索")}
            </button>
          </div>
        </section>

        {/* Profile Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPartners.map((p, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-4 profile-card-shadow border border-outline-variant/20 hover:border-primary/20 transition-all group"
            >
              {/* Avatar */}
              <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-surface-container">
                {p.image ? (
                  <Image
                    alt={p.name}
                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                    src={p.image}
                    width={400}
                    height={400}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-outline-variant">
                      person
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="px-2">
                <h3 className="text-lg font-headline font-bold text-primary mb-1">
                  {t(p.name, p.nameJa)}
                </h3>
                <p className="text-on-surface-variant text-xs line-clamp-2 mb-4 leading-relaxed">
                  {t(p.bio, p.bioJa)}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {p.online ? (
                    <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {t("Online", "オンライン")}
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {t("Offline", "オフライン")}
                    </span>
                  )}
                  <span className="bg-surface-container-low text-primary text-[10px] px-2 py-0.5 rounded-full font-medium">
                    {p.ageRange}
                  </span>
                  <span className="bg-surface-container-low text-primary text-[10px] px-2 py-0.5 rounded-full font-medium">
                    {t(p.category, p.categoryJa)}
                  </span>
                </div>

                {/* Message Button */}
                <Link
                  href="/learner/messages"
                  className="w-full mt-4 py-2.5 bg-primary text-on-primary rounded-xl font-headline font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">
                    send
                  </span>
                  {t("Nhắn tin", "メッセージ")}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-20 text-center">
          <button className="group flex flex-col items-center mx-auto cursor-pointer">
            <span className="text-secondary text-[10px] font-bold tracking-[0.2em] mb-4">
              {t("KHÁM PHÁ THÊM", "もっと見る")}
            </span>
            <div className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-all duration-500">
              <span className="material-symbols-outlined text-xl">
                expand_more
              </span>
            </div>
          </button>
        </div>
      </main>
      <LearnerBottomNav />
    </div>
  );
}
