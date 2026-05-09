"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [isPartner, setIsPartner] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(isPartner ? "/partner/home" : "/learner/home");
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
      <header className="bg-[#f9f9f7] font-headline tracking-wide flex justify-between items-center w-full px-6 py-4 fixed top-0 z-50">
        <Link href="/" className="text-xl font-bold text-primary tracking-[0.1em]">VietImmerse</Link>
      </header>
      <main className="flex-grow flex items-center justify-center pt-20 pb-12 px-4">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 overflow-hidden rounded-xl shadow-lg bg-surface-container-lowest">
          <div className="md:col-span-5 relative hidden md:flex flex-col justify-between p-12 bg-primary overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <img className="w-full h-full object-cover" alt="Hoan Kiem Lake" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9-hKMIh-5-BaACIyxsnclamhpD30ik8zs343pDs8d-wuijW9DO6RtVWMRIVEDmydElYCQBdzC50u-3nHEYcUAi_N0gEXbCVSIrFBVSUdPm6lUiDO4c3UMhg7xGMxsQtPbzFDVE7yhDzrFY9deLf_rMkQjYMYjD27oPVcp2dP--IIVNToLZAT5g9MNXhcR-gDhKO74QHQE_L8_82XT2FOIXDeo6LcID2ybWfNApiTJghAycTxs6DONUqcfOOg1LvF-BSggAukPBMNF" />
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-surface-container-lowest/10 backdrop-blur-md lotus-shape flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-on-primary text-3xl">local_florist</span>
              </div>
              <h2 className="text-on-primary font-headline text-3xl font-bold leading-tight">Gắn kết sâu sắc hơn<br/>với miền Bắc.<br/><span className="text-lg font-medium opacity-80">北部との絆を深める</span></h2>
            </div>
            <p className="relative z-10 text-on-primary-container text-sm leading-relaxed max-w-xs">Một không gian dành riêng cho cộng đồng người Nhật làm chủ phương ngữ Hà Nội.</p>
          </div>
          <div className="md:col-span-7 p-8 md:p-16 flex flex-col justify-center">
            <div className="mb-10">
              <h1 className="font-headline text-2xl font-bold text-primary mb-1">Chào mừng trở lại / おかえりなさい</h1>
              <p className="text-secondary text-sm">Đăng nhập để tiếp tục hành trình / ログインして続行</p>
            </div>
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="relative group">
                <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Email / メール</label>
                <input className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-3 px-1 placeholder:text-outline/30" placeholder="example@email.com" type="text" />
              </div>
              <div className="relative group">
                <div className="flex justify-between items-end mb-2 ml-1">
                  <label className="block text-xs uppercase tracking-widest text-on-surface-variant">Password / パスワード</label>
                  <Link href="/forgot-password" className="text-[10px] text-secondary hover:text-primary transition-colors">Quên mật khẩu?</Link>
                </div>
                <input className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-3 px-1 placeholder:text-outline/30" placeholder="••••••••" type="password" />
              </div>
              <div className="flex items-center justify-center gap-4 py-2 bg-surface-container-low rounded-xl">
                <button type="button" onClick={() => setIsPartner(false)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${!isPartner ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`}>Học viên</button>
                <button type="button" onClick={() => setIsPartner(true)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${isPartner ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant'}`}>Đối tác</button>
              </div>
              <button className="w-full py-4 bg-primary text-on-primary rounded-xl font-headline font-semibold text-lg hover:bg-primary-container transition-all active:scale-[0.98]" type="submit">Đăng nhập / ログイン</button>
            </form>
            <div className="mt-16 border-t border-surface-container-high pt-10">
              <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-6 text-center">Mới sử dụng VietImmerse?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/signup/learner" className="group p-4 bg-surface-container-low hover:bg-secondary-container rounded-xl flex items-center gap-4 transition-all">
                  <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-secondary group-hover:bg-primary group-hover:text-on-primary transition-colors"><span className="material-symbols-outlined">school</span></div>
                  <div><span className="block text-[10px] text-on-surface-variant">Tham gia là</span><span className="block font-headline font-bold text-primary">Học viên / 受講生</span></div>
                </Link>
                <Link href="/signup/partner" className="group p-4 bg-surface-container-low hover:bg-secondary-container rounded-xl flex items-center gap-4 transition-all">
                  <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-secondary group-hover:bg-primary group-hover:text-on-primary transition-colors"><span className="material-symbols-outlined">handshake</span></div>
                  <div><span className="block text-[10px] text-on-surface-variant">Tham gia là</span><span className="block font-headline font-bold text-primary">Đối tác / パートナー</span></div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
