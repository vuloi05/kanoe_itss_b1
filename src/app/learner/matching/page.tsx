"use client";
import LearnerNavbar from "@/components/layout/LearnerNavbar";
import LearnerBottomNav from "@/components/layout/LearnerBottomNav";
import Link from "next/link";

const partners = [
  {name:"Nguyễn Thị Lan",age:28,loc:"Ba Đình, Hà Nội",bio:"Giáo viên tiểu học, yêu văn hóa Nhật",match:95,tags:["Giọng Hà Nội","Nhẫn nại","Beginner-friendly"]},
  {name:"Trần Văn Minh",age:32,loc:"Hoàn Kiếm, Hà Nội",bio:"Hướng dẫn viên du lịch, nói tiếng Nhật cơ bản",match:88,tags:["Giọng chuẩn","Vui vẻ","Outdoor activities"]},
  {name:"Phạm Hồng Nhung",age:25,loc:"Đống Đa, Hà Nội",bio:"Sinh viên ngôn ngữ Nhật, muốn giao lưu văn hóa",match:82,tags:["Giọng Hà Nội","Trẻ trung","Anime lover"]},
];

export default function MatchingPage() {
  return (
    <div className="bg-background text-on-background font-body min-h-screen pb-20 md:pb-0">
      <LearnerNavbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="font-headline text-3xl font-extrabold text-primary mb-2">Ghép cặp đối tác</h1>
        <p className="text-on-surface-variant mb-8">マッチング / AI đề xuất đối tác phù hợp nhất cho bạn</p>
        <div className="space-y-6">
          {partners.map((p,i)=>(
            <div key={i} className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high/50 hover:shadow-lg transition-all">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-on-primary-container text-2xl">person</span></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-headline font-bold text-primary text-lg">{p.name}</h3>
                    <span className="text-sm font-bold text-secondary bg-secondary-container px-3 py-1 rounded-full">{p.match}% match</span>
                  </div>
                  <p className="text-sm text-on-surface-variant">{p.age} tuổi • {p.loc}</p>
                  <p className="text-sm text-on-surface-variant mt-2">{p.bio}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {p.tags.map(t=>(<span key={t} className="text-[10px] font-bold text-primary bg-primary-fixed px-3 py-1 rounded-full">{t}</span>))}
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Link href="/learner/messages" className="px-6 py-2 bg-primary text-on-primary rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2"><span className="material-symbols-outlined text-sm">chat</span>Nhắn tin</Link>
                    <button className="px-6 py-2 border border-outline-variant text-on-surface-variant rounded-xl font-bold text-sm hover:bg-surface-container-low transition-all">Xem hồ sơ</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <LearnerBottomNav />
    </div>
  );
}
