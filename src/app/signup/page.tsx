"use client";
import Link from "next/link";

export default function SignupChoicePage() {
  return (
    <div className="bg-background text-on-surface font-body selection:bg-secondary-container h-screen overflow-hidden flex flex-col">
      <header className="w-full py-8 px-12 shrink-0">
        <div className="max-w-7xl mx-auto flex justify-center md:justify-start">
          <Link href="/" className="text-2xl font-bold text-primary tracking-tighter font-headline uppercase">VietImmerse</Link>
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center px-6 bg-pattern pb-12">
        <div className="max-w-6xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-primary tracking-tight leading-tight">
              Bắt đầu hành trình <span className="text-secondary italic font-normal">văn hóa của bạn.</span>
            </h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <div className="group relative overflow-hidden bg-surface-container-lowest rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 border border-outline-variant/30 flex flex-col justify-between">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-primary text-white rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>school</span>
                </div>
                <h2 className="text-2xl font-headline font-bold text-primary mb-1">Học tiếng Việt</h2>
                <p className="text-xs font-semibold text-secondary mb-4 tracking-widest uppercase">ベトナム語を学ぶ (Learner)</p>
                <p className="text-on-surface-variant text-sm mb-8 italic opacity-80">Luyện nghe nói giọng Hà Nội chuẩn cùng đối tác bản xứ.</p>
              </div>
              <Link href="/signup/learner" className="relative z-10 w-full py-4 bg-primary text-on-primary rounded-xl font-headline font-bold tracking-wide hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                Bắt đầu học ngay <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
            <div className="group relative overflow-hidden bg-surface-container-lowest rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-secondary/5 border border-outline-variant/30 flex flex-col justify-between">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-secondary/5 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-secondary text-white rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-secondary/20">
                  <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>groups</span>
                </div>
                <h2 className="text-2xl font-headline font-bold text-primary mb-1">Trở thành đối tác</h2>
                <p className="text-xs font-semibold text-secondary mb-4 tracking-widest uppercase">パートナーになる (Partner)</p>
                <p className="text-on-surface-variant text-sm mb-8 italic opacity-80">Chia sẻ ngôn ngữ quê hương và tạo thu nhập linh hoạt.</p>
              </div>
              <Link href="/signup/partner" className="relative z-10 w-full py-4 bg-secondary text-on-primary rounded-xl font-headline font-bold tracking-wide hover:bg-secondary/90 transition-all flex items-center justify-center gap-2">
                Đăng ký ngay <span className="material-symbols-outlined text-sm">handshake</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
