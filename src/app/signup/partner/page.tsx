"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PartnerSignupPage() {
  const router = useRouter();
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); router.push("/partner/home"); };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen selection:bg-primary-fixed-dim">
      <header className="bg-[#f9f9f7] sticky top-0 z-50"><div className="flex justify-between items-center w-full px-6 py-4"><Link href="/" className="font-headline text-xl font-bold text-primary tracking-[0.1em]">VietImmerse</Link></div></header>
      <main className="relative flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-pattern">
        <section className="hidden md:flex md:w-5/12 relative overflow-hidden bg-primary-container p-12 flex-col justify-end">
          <div className="absolute top-0 left-0 w-full h-full opacity-20"><img alt="Vietnamese Landscape" className="w-full h-full object-cover grayscale brightness-50" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpebGwCDGVJDgoZq6fWhioBr9O9aEhN78wstH7sadhzOOWWuoFmFxL1LRp6PlIInYhFbiEeZA2bm4DaLfrQvbO_J22NFitadECEBpCCOfEuBLcoEGgr3jHJp9JwJH6ld6UkNvPTM6tXJiurZNsNWk0AAUQpg50nn89NfnW7pebsPwYNq9LyO6uEsGvADhk_wTlHuv9R1-1_JsMKBc-VFduYbtjGpsj14Ns11sGLSiBoM2cmgp18TsXJr-oQvx8ctPk6re3L-cl7ux7"/></div>
          <div className="relative z-10 space-y-6">
            <div className="w-16 h-16 bg-secondary flex items-center justify-center rounded-full mb-8"><span className="material-symbols-outlined text-surface-bright text-3xl" style={{fontVariationSettings:"'FILL' 1"}}>spa</span></div>
            <h1 className="font-headline text-4xl font-extrabold text-surface-bright leading-tight">Trở thành đối tác<br/><span className="text-on-primary-container font-medium">(パートナーになる)</span></h1>
            <p className="text-surface-container-high text-lg leading-relaxed max-w-md">Chia sẻ ngôn ngữ và văn hóa bản địa của bạn với cộng đồng người Nhật.</p>
          </div>
        </section>
        <section className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 bg-surface">
          <div className="w-full max-w-lg">
            <form className="space-y-10" onSubmit={handleSubmit}>
              <div className="relative group"><label className="block text-xs font-semibold tracking-wider mb-2 uppercase text-on-surface-variant">Họ và tên / 氏名</label><input className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-3 text-lg placeholder:text-outline" placeholder="Nguyen Van A" type="text"/></div>
              <div className="relative group"><label className="block text-xs font-semibold tracking-wider mb-2 uppercase text-on-surface-variant">Email / メールアドレス</label><input className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-3 text-lg placeholder:text-outline" placeholder="partner@example.com" type="email"/></div>
              <div className="relative group"><label className="block text-xs font-semibold tracking-wider mb-2 uppercase text-on-surface-variant">Số điện thoại / 電話番号</label><div className="flex gap-4"><span className="py-3 text-lg border-b border-outline-variant text-outline">+84</span><input className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-3 text-lg placeholder:text-outline" placeholder="0123 456 789" type="tel"/></div></div>
              <div className="bg-surface-container-low p-6 rounded-xl space-y-4">
                <div className="flex items-center justify-between"><div><label className="block text-xs font-semibold tracking-wider mb-1 uppercase text-on-surface-variant">Giọng bản địa</label><p className="font-headline text-xl font-bold text-primary">Northern / Miền Bắc (北部)</p></div><span className="material-symbols-outlined text-secondary text-3xl" style={{fontVariationSettings:"'FILL' 1"}}>verified</span></div>
              </div>
              <div className="relative group"><label className="block text-xs font-semibold tracking-wider mb-2 uppercase text-on-surface-variant">Mật khẩu / パスワード</label><input className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-3 text-lg placeholder:text-outline" placeholder="••••••••" type="password"/></div>
              <button className="w-full bg-primary text-on-primary py-5 rounded-xl font-headline font-bold text-lg shadow-lg hover:bg-primary-container hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col items-center group" type="submit">
                <span className="flex items-center gap-3">Đăng ký làm đối tác<span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span></span>
                <span className="text-xs font-normal opacity-80 mt-1">パートナーとして登録する</span>
              </button>
              <p className="text-center text-on-surface-variant text-sm mt-8">Đã là đối tác? <Link className="text-secondary font-bold hover:underline" href="/login">Đăng nhập tại đây</Link></p>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
