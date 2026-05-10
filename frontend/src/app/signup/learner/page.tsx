"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LearnerSignupPage() {
  const router = useRouter();
  const [level, setLevel] = useState("n3");
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); router.push("/learner/home"); };

  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary-fixed selection:text-primary">
      <header className="bg-surface-container-low sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-6 py-4">
          <Link href="/" className="text-xl font-bold text-primary tracking-[0.1em] font-headline">VietImmerse</Link>
        </div>
      </header>
      <main className="min-h-screen flex flex-col md:flex-row">
        <section className="hidden md:flex md:w-5/12 bg-surface-container-low relative overflow-hidden flex-col justify-end p-16">
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/5 lotus-shape rotate-12"></div>
          <div className="absolute bottom-[20%] left-[-5%] w-64 h-64 bg-secondary/5 lotus-shape -rotate-12"></div>
          <div className="relative z-10 space-y-8">
            <div className="w-full aspect-[4/5] rounded-full overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl">
              <img alt="Hanoi Old Quarter" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIPwqtDyifZu9k19htBPwMAITl1vynNcRqvZU0HmPAsjGTe9zs__ni6cfk-lFghF6ZhgwwvW7iUMd-apfPRht0fsv13ZPtz1H3kSTF68mX-M2rJb_1kDTdEDF52FVMuqc3Gw93XGtcxbvmAets07pwdjEinB5FM7yoxCTRJA-7JJvfB7R7swpvSqaAOjgo-yZGquC5wAjjNVolcOkeQOQQ-ZgiYshCm1MhZbCiYyfHWti7zNEsomaQJp8gxV34TmFfplgYeB7FJY-v" />
            </div>
            <div>
              <h2 className="font-headline text-4xl font-extrabold text-primary leading-tight">Cảm hứng từ<br/>Hà Nội.</h2>
              <p className="mt-4 text-secondary font-medium max-w-xs leading-relaxed">ハノイの街並みからインスピレーションを得た、新しい日本語学習体験。</p>
            </div>
          </div>
        </section>
        <section className="flex-1 flex items-center justify-center p-8 md:p-24 bg-surface">
          <div className="w-full max-w-md">
            <div className="mb-12">
              <h1 className="font-headline text-3xl font-extrabold text-primary tracking-tight mb-2">Bắt đầu học ngay <span className="text-secondary font-medium text-xl">(学習を始める)</span></h1>
              <p className="text-on-surface-variant">Tham gia cộng đồng học tiếng Nhật tại Hà Nội.<br/><span className="text-sm opacity-70">ハノイの日本語学習者コミュニティに参加しましょう。</span></p>
            </div>
            <form className="space-y-10" onSubmit={handleSubmit}>
              <div className="relative"><input className="peer w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-2" placeholder="Họ và tên (氏名)" type="text" /></div>
              <div className="relative"><input className="peer w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-2" placeholder="Email (メールアドレス)" type="email" /></div>
              <div className="relative"><input className="peer w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-2" placeholder="Mật khẩu (パスワード)" type="password" /></div>
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-secondary block">Trình độ hiện tại (現在のレベル)</span>
                <div className="flex flex-wrap gap-3">
                  {["V1","V2","V3","V4","V5"].map((l,i)=>(
                    <label key={l} className="cursor-pointer"><input className="hidden peer" name="level" type="radio" value={`n${5-i}`} checked={level===`n${5-i}`} onChange={()=>setLevel(`n${5-i}`)}/><div className={`px-6 py-2 rounded-full border transition-all font-headline font-bold ${level===`n${5-i}`?'bg-primary text-on-primary border-primary':'border-outline-variant text-on-surface-variant'}`}>{l}</div></label>
                  ))}
                </div>
              </div>
              <button className="group w-full bg-primary text-on-primary py-4 rounded-xl font-headline font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98]" type="submit">
                <span className="flex items-center justify-center gap-2">Đăng ký tài khoản (登録する)<span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span></span>
              </button>
            </form>
            <div className="mt-12 text-center">
              <p className="text-on-surface-variant text-sm">Đã có tài khoản? <Link className="text-primary font-bold hover:underline ml-1" href="/login">Đăng nhập (ログイン)</Link></p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
