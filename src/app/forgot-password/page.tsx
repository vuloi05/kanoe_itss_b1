"use client";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-surface font-body text-on-surface">
      <section className="relative w-full md:w-1/2 lg:w-3/5 h-64 md:h-auto overflow-hidden">
        <div className="absolute inset-0 bg-primary/40 z-10"></div>
        <img className="absolute inset-0 w-full h-full object-cover" alt="Hoan Kiem Lake" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4NAYyN5r12cV5HVXXRY5Y6pY0GHQk0fRHo0L2dbMtl4sQ3M6wCCcEWGj9EynQ7n5dMSLFN5DCntjFf2HejStjdajAdis5CNKeZAfF2f8DIflaHE86FHTiVuyE2lMz4vTGZYljk8UOPvN7P_kC24FV6xtoB8Pwdm3y4PdwYJRPjoh8LF3MPo8YS4k62wk5fyglmnWExda5HQf7OEq30y67umGP6N1hPxRx1iIXyuvlcsv7hQ0TWHxRGCyPfon8TTbM2xfq8dyqTIU"/>
        <div className="relative z-20 h-full flex flex-col justify-between p-8 md:p-16">
          <div className="flex items-center gap-3"><div className="w-10 h-10 lotus-gradient rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-white text-xl" style={{fontVariationSettings:'"FILL" 1'}}>spa</span></div><span className="font-headline font-bold text-xl tracking-wide text-white">VietImmerse</span></div>
          <div className="max-w-xl"><h1 className="font-headline font-extrabold text-4xl md:text-5xl text-white leading-tight">Gắn kết sâu sắc hơn với miền Bắc<br/><span className="text-white/80 font-normal block mt-4">北部の心と繋がる。</span></h1></div>
          <div className="text-white/60 text-sm tracking-widest uppercase">Northern Vietnamese Dialect Mastery</div>
        </div>
      </section>
      <section className="w-full md:w-1/2 lg:w-2/5 bg-surface-container-lowest flex items-center justify-center p-8 md:p-12 lg:p-20">
        <div className="w-full max-w-md">
          <Link href="/login" className="inline-flex items-center text-secondary hover:text-primary transition-colors mb-12 font-medium group"><span className="material-symbols-outlined mr-2 group-hover:-translate-x-1 transition-transform">arrow_back</span><span className="text-sm">← Quay lại Đăng nhập</span></Link>
          <div className="mb-10">
            <h2 className="font-headline text-3xl font-bold text-primary mb-4">Quên mật khẩu?<br/><span className="text-on-surface-variant font-medium text-2xl italic">パスワードをお忘れですか？</span></h2>
            <p className="text-on-surface-variant leading-relaxed">Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu.<br/><span className="text-sm">パスワード再設定用のメールをお送りします。</span></p>
          </div>
          <form className="space-y-8">
            <div className="relative group"><label className="block text-xs font-bold tracking-widest text-primary uppercase mb-2">EMAIL / メール</label><input className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 focus:ring-0 focus:border-primary placeholder:text-outline-variant/60" placeholder="example@email.com" type="email"/></div>
            <button className="w-full bg-primary text-on-primary py-4 rounded-xl font-headline font-bold hover:bg-primary-container transition-all shadow-lg flex items-center justify-center gap-2 group" type="submit"><span>Gửi yêu cầu / 送信する</span><span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">send</span></button>
          </form>
          <div className="mt-16 pt-8 border-t border-surface-container flex flex-col items-center gap-4">
            <p className="text-sm text-on-surface-variant text-center">Cần hỗ trợ thêm?</p>
            <a className="text-primary font-bold text-sm hover:underline" href="#">Liên hệ Trung tâm hỗ trợ</a>
          </div>
        </div>
      </section>
    </main>
  );
}
