import type { Metadata } from "next";
import Link from "next/link";
import HelpAccordion from "@/app/help/HelpAccordion";
import { IconWave } from "@/components/icons/HelpIcons";
import {
  iconSmile,
  iconTone,
  iconFluency,
  iconIntonation,
  iconTip,
  iconBook,
  iconThinking,
  iconCheckCircle,
  iconChart,
  iconPin,
  iconCelebrate,
  iconKey,
  iconUser,
  iconMail,
  iconVolume,
  iconGlobe,
  iconTrash,
  iconRefresh,
  iconSmartphone,
  iconChat,
  iconClock,
  iconStar,
  iconLightbulb,
  iconIntonationTarget,
  iconHeart,
  iconSparkles,
  iconLock,
  iconFlag,
} from "@/components/icons/helpIconStrings";

export const metadata: Metadata = {
  title: "Trung tâm trợ giúp - VietImmerse",
  description:
    "Trung tâm trợ giúp VietImmerse — Giải đáp thắc mắc về Voice Lab, lộ trình học, tài khoản và hỗ trợ kỹ thuật cho nền tảng học tiếng Việt.",
};

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqCategory {
  id: string;
  icon: string;
  title: string;
  description: string;
  badgeColor: string;
  items: FaqItem[];
}

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "voice-lab",
    icon: "mic",
    title: "Phòng luyện nói (Voice Lab)",
    description: "Hướng dẫn sử dụng tính năng luyện phát âm với AI",
    badgeColor: "bg-primary-container text-on-primary-container",
    items: [
      {
        question: "Cấp quyền Microphone như thế nào?",
        answer: `Để sử dụng tính năng Voice Lab, bạn cần cấp quyền truy cập microphone cho trình duyệt. Dưới đây là các bước chi tiết:

<strong>Trên máy tính (Chrome / Edge / Firefox):</strong>
<ol>
<li>Khi bạn nhấn nút <strong>"Bắt đầu ghi âm"</strong> lần đầu tiên, trình duyệt sẽ hiển thị một hộp thoại yêu cầu quyền truy cập micro.</li>
<li>Nhấn <strong>"Cho phép" (Allow)</strong> để cấp quyền.</li>
<li>Nếu bạn đã từ chối trước đó, hãy vào <strong>Cài đặt trình duyệt → Quyền riêng tư & Bảo mật → Cài đặt trang web → Microphone</strong>, tìm đến <code>vietimmerse.com</code> và chuyển sang <strong>"Cho phép"</strong>.</li>
</ol>

<strong>Trên điện thoại:</strong>
<ol>
<li><strong>iOS (Safari):</strong> Vào <strong>Cài đặt → Safari → Microphone</strong> và đảm bảo đã bật.</li>
<li><strong>Android (Chrome):</strong> Nhấn vào biểu tượng ${iconLock()} bên cạnh thanh URL → <strong>Quyền → Microphone → Cho phép</strong>.</li>
</ol>

${iconTip()} <strong>Mẹo:</strong> Hãy đảm bảo bạn đang sử dụng micro tốt, ở nơi yên tĩnh để AI đánh giá chính xác nhất nhé!`,
      },
      {
        question:
          "Tại sao tôi đọc đúng mà AI vẫn chấm điểm thấp?",
        answer: `Đây là một thắc mắc rất phổ biến, và hoàn toàn dễ hiểu! ${iconSmile()}

Hệ thống AI của VietImmerse không chỉ đánh giá việc bạn đọc <strong>"đúng từ"</strong> hay không, mà còn phân tích nhiều yếu tố sâu hơn:

<strong>${iconTone()} Thanh điệu (Tone):</strong> Tiếng Việt miền Bắc có 6 thanh điệu rất tinh tế. AI so sánh đường cong âm điệu (pitch contour) của bạn với mẫu chuẩn. Chỉ cần thanh hỏi (ả) chưa đủ "gãy" hoặc thanh ngã (ã) chưa đủ "nảy" là điểm sẽ bị ảnh hưởng.

<strong>${iconFluency()} Độ trôi chảy (Fluency):</strong> AI đánh giá tốc độ đọc, nhịp ngắt nghỉ giữa các từ. Nếu bạn đọc quá chậm, ngắt quãng nhiều, hoặc do dự quá lâu giữa các âm tiết, điểm fluency sẽ thấp hơn.

<strong>${iconIntonation()} Ngữ điệu tổng thể:</strong> Ngoài từng từ riêng lẻ, AI còn đánh giá cách bạn nối các từ trong câu — giống như "nhạc điệu" tự nhiên của người Hà Nội khi nói chuyện.

<strong>${iconTip()} Lời khuyên:</strong>
<ul>
<li>Đừng nản lòng! Điểm số là để giúp bạn cải thiện, không phải để phán xét.</li>
<li>Hãy nghe đi nghe lại audio mẫu trước khi ghi âm.</li>
<li>Tập trung vào <strong>một thanh điệu</strong> mỗi lần thay vì cố đọc hoàn hảo cả câu.</li>
<li>Điểm trên <strong>70%</strong> đã là khá tốt cho người mới bắt đầu!</li>
</ul>`,
      },
    ],
  },
  {
    id: "learning-path",
    icon: "route",
    title: "Lộ trình học & Khóa bài",
    description: "Giải thích cơ chế mở khóa bài học tuần tự",
    badgeColor: "bg-secondary-container text-on-secondary-container",
    items: [
      {
        question:
          'Tại sao tôi không thể học Chương 2 hoặc Trình độ V3?',
        answer: `VietImmerse áp dụng cơ chế <strong>Mở khóa tuần tự (Sequential Unlocking)</strong> để đảm bảo chất lượng tiếp thu kiến thức của bạn. Đây là lý do:

<strong>${iconBook()} Cơ chế hoạt động:</strong>
<ul>
<li>Mỗi <strong>Chương (Chapter)</strong> chứa nhiều bài học liên kết chặt chẽ với nhau.</li>
<li>Bạn cần hoàn thành <strong>100% các bài học</strong> trong Chương hiện tại trước khi Chương tiếp theo được mở khóa.</li>
<li>Tương tự, bạn cần hoàn thành <strong>toàn bộ</strong> một Trình độ (ví dụ: V1 → V2 → V3) để tiến lên cấp độ cao hơn.</li>
</ul>

<strong>${iconThinking()} Tại sao lại thiết kế như vậy?</strong>
<ul>
<li><strong>Nền tảng vững chắc:</strong> Tiếng Việt miền Bắc có nhiều đặc trưng ngữ âm phức tạp. Các bài học sau xây dựng trên kiến thức của bài trước.</li>
<li><strong>Tránh "nhảy cóc":</strong> Nếu bạn bỏ qua các thanh điệu cơ bản (Chương 1) mà nhảy thẳng đến hội thoại phức tạp (Chương 3), bạn sẽ rất khó theo kịp.</li>
<li><strong>Đảm bảo tiến bộ thực sự:</strong> Chúng tôi muốn bạn <em>thực sự giỏi</em>, không chỉ hoàn thành bài cho có.</li>
</ul>

<strong>${iconCheckCircle()} Để mở khóa nhanh hơn:</strong>
<ul>
<li>Hoàn thành tất cả bài học trong chương hiện tại (bao gồm cả phần luyện nói Voice Lab).</li>
<li>Sử dụng nút <strong>"Tiếp tục học"</strong> trên trang Bài học để đi đến bài tiếp theo nhanh chóng.</li>
</ul>`,
      },
      {
        question: "Tiến độ học của tôi được tính như thế nào?",
        answer: `Tiến độ học tập trên VietImmerse được tính toán tự động dựa trên số bài học bạn đã hoàn thành:

<strong>${iconChart()} Công thức:</strong>
<code>Tiến độ (%) = (Số bài đã hoàn thành ÷ Tổng số bài trong Chương/Trình độ) × 100%</code>

<strong>${iconPin()} Lưu ý quan trọng:</strong>
<ul>
<li>Một bài học được coi là <strong>"hoàn thành"</strong> khi bạn đã hoàn thành tất cả các phần trong bài đó (bao gồm bài đọc, từ vựng và phần luyện nói nếu có).</li>
<li>Tiến độ được hiển thị ở <strong>thanh Progress Bar</strong> trên trang Bài học.</li>
<li>Khi đạt <strong>100%</strong> một Chương, bạn sẽ nhận được thông báo chúc mừng và Chương tiếp theo sẽ tự động mở khóa! ${iconCelebrate()}</li>
</ul>`,
      },
    ],
  },
  {
    id: "account",
    icon: "manage_accounts",
    title: "Tài khoản & Kỹ thuật",
    description: "Quản lý tài khoản và khắc phục sự cố kỹ thuật",
    badgeColor: "bg-tertiary-container text-on-tertiary-container",
    items: [
      {
        question: "Làm sao để đổi mật khẩu hoặc cập nhật hồ sơ?",
        answer: `Bạn có thể quản lý tài khoản dễ dàng ngay trên nền tảng:

<strong>${iconKey()} Đổi mật khẩu:</strong>
<ol>
<li>Đăng nhập vào tài khoản VietImmerse.</li>
<li>Nhấn vào <strong>ảnh đại diện</strong> (avatar) ở góc trên bên phải.</li>
<li>Chọn <strong>"Cài đặt tài khoản"</strong> hoặc <strong>"Hồ sơ"</strong>.</li>
<li>Tìm mục <strong>"Đổi mật khẩu"</strong> → Nhập mật khẩu cũ và mật khẩu mới.</li>
<li>Nhấn <strong>"Lưu thay đổi"</strong>.</li>
</ol>

<strong>${iconUser()} Cập nhật hồ sơ:</strong>
<ul>
<li>Tại trang Hồ sơ, bạn có thể chỉnh sửa: <strong>Tên hiển thị, ảnh đại diện, giới thiệu bản thân, ngôn ngữ mẹ đẻ</strong> và các thông tin khác.</li>
<li>Các thay đổi sẽ được cập nhật ngay lập tức.</li>
</ul>

<strong>${iconMail()} Đổi email đăng nhập:</strong>
Hiện tại, việc thay đổi email đăng nhập cần liên hệ đội ngũ hỗ trợ qua <strong>support@vietimmerse.com</strong> để đảm bảo an toàn tài khoản.`,
      },
      {
        question:
          "Ứng dụng bị lỗi không nghe được âm thanh thì làm thế nào?",
        answer: `Đừng lo lắng! Dưới đây là các bước khắc phục theo thứ tự từ đơn giản đến nâng cao:

<strong>${iconVolume()} Bước 1: Kiểm tra loa / tai nghe</strong>
<ul>
<li>Đảm bảo loa thiết bị hoặc tai nghe đang <strong>bật</strong> và <strong>không bị tắt tiếng (mute)</strong>.</li>
<li>Thử phát một video YouTube hoặc nhạc để kiểm tra loa có hoạt động không.</li>
</ul>

<strong>${iconGlobe()} Bước 2: Tải lại trang</strong>
<ul>
<li>Nhấn <strong>Ctrl + Shift + R</strong> (Windows) hoặc <strong>Cmd + Shift + R</strong> (Mac) để tải lại trang hoàn toàn (xóa cache).</li>
<li>Trên điện thoại: Vuốt xuống để làm mới trang.</li>
</ul>

<strong>${iconTrash()} Bước 3: Xóa cache trình duyệt</strong>
<ul>
<li>Vào <strong>Cài đặt trình duyệt → Xóa dữ liệu duyệt web</strong> → Chọn "Hình ảnh và tệp trong bộ nhớ cache" → Nhấn Xóa.</li>
</ul>

<strong>${iconRefresh()} Bước 4: Thử trình duyệt khác</strong>
<ul>
<li>VietImmerse hoạt động tốt nhất trên <strong>Google Chrome</strong> hoặc <strong>Microsoft Edge</strong> phiên bản mới nhất.</li>
<li>Nếu đang dùng Safari, hãy thử chuyển sang Chrome.</li>
</ul>

<strong>${iconSmartphone()} Bước 5: Kiểm tra kết nối mạng</strong>
<ul>
<li>Âm thanh bài học được tải từ máy chủ. Nếu mạng yếu, âm thanh có thể không tải kịp.</li>
<li>Thử chuyển từ Wi-Fi sang 4G/5G hoặc ngược lại.</li>
</ul>

Nếu đã thử tất cả mà vẫn không được, hãy liên hệ chúng tôi qua <strong>support@vietimmerse.com</strong> kèm theo thông tin: <em>trình duyệt bạn đang dùng, thiết bị, và ảnh chụp màn hình lỗi (nếu có)</em>.`,
      },
    ],
  },
  {
    id: "contact",
    icon: "contact_support",
    title: "Liên hệ trực tiếp",
    description: "Kết nối với đội ngũ hỗ trợ VietImmerse",
    badgeColor: "bg-error-container text-on-error-container",
    items: [
      {
        question: "Tôi muốn liên hệ trực tiếp với đội ngũ hỗ trợ?",
        answer: `Chúng tôi luôn sẵn lòng lắng nghe và hỗ trợ bạn! ${iconChat()}

<strong>${iconMail()} Email hỗ trợ:</strong>
<a href="mailto:support@vietimmerse.com" class="text-primary font-bold">support@vietimmerse.com</a>

Khi gửi email, hãy cung cấp các thông tin sau để chúng tôi hỗ trợ nhanh hơn:
<ul>
<li><strong>Tên tài khoản</strong> hoặc email đăng ký.</li>
<li><strong>Mô tả chi tiết</strong> vấn đề bạn gặp phải.</li>
<li><strong>Ảnh chụp màn hình</strong> hoặc video (nếu có).</li>
<li><strong>Thiết bị và trình duyệt</strong> bạn đang sử dụng.</li>
</ul>

<strong>${iconClock()} Thời gian phản hồi:</strong>
Đội ngũ Bamia luôn sẵn sàng hỗ trợ bạn trong vòng <strong>24 giờ</strong> làm việc (Thứ 2 – Thứ 7, 8:00 – 18:00 giờ Việt Nam).

<strong>${iconStar()} Cam kết của chúng tôi:</strong>
Mỗi câu hỏi, mỗi phản hồi của bạn đều quan trọng với chúng tôi. VietImmerse không chỉ là một ứng dụng — mà là người bạn đồng hành trên hành trình chinh phục tiếng Việt của bạn. Hãy cứ hỏi, chúng tôi luôn ở đây! ${iconFlag()}`,
      },
      {
        question: "Tôi muốn góp ý hoặc đề xuất tính năng mới?",
        answer: `Chúng tôi rất trân trọng mọi ý kiến đóng góp từ cộng đồng học viên! ${iconHeart()}

<strong>${iconLightbulb()} Cách gửi góp ý:</strong>
<ul>
<li>Gửi email đến <a href="mailto:support@vietimmerse.com" class="text-primary font-bold">support@vietimmerse.com</a> với tiêu đề <strong>"[Góp ý]"</strong> hoặc <strong>"[Đề xuất tính năng]"</strong>.</li>
<li>Mô tả chi tiết ý tưởng của bạn — bạn muốn tính năng gì, nó sẽ giúp ích cho việc học như thế nào.</li>
</ul>

<strong>${iconIntonationTarget()} Những góp ý phổ biến mà chúng tôi đã nhận được:</strong>
<ul>
<li>Thêm bài học về các chủ đề cụ thể (ẩm thực, giao thông, mua sắm...).</li>
<li>Tính năng luyện nghe dictation (nghe chép).</li>
<li>Chế độ học offline (đang phát triển!).</li>
</ul>

Mỗi đề xuất đều được đội ngũ phát triển xem xét cẩn thận. Nhiều tính năng trên VietImmerse ngày nay chính là từ ý tưởng của các học viên như bạn! ${iconSparkles()}`,
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-surface-container-high">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group"
          >
            <span className="material-symbols-outlined text-xl group-hover:-translate-x-0.5 transition-transform">
              arrow_back
            </span>
            <span className="text-sm font-medium">Trang chủ</span>
          </Link>
          <span className="text-lg font-bold text-primary font-headline">
            VietImmerse
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        {/* Page Title */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container text-on-primary-container text-xs font-bold uppercase tracking-widest mb-6">
            <span className="material-symbols-outlined text-sm">
              help_center
            </span>
            Trợ giúp
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-primary mb-4">
            Trung tâm trợ giúp
          </h1>
          <p className="text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Xin chào!{" "}
            <IconWave className="inline-block w-5 h-5 text-primary align-middle mr-0.5" />{" "}
            Bạn đang gặp khó khăn hoặc có thắc mắc? Đừng lo, đội
            ngũ VietImmerse luôn ở đây để hỗ trợ bạn. Tìm câu trả lời nhanh
            chóng tại đây nhé!
          </p>
        </div>

        {/* Quick Navigation */}
        <nav className="mb-16 p-6 bg-surface-container-lowest rounded-2xl border border-surface-container-high">
          <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">
              quick_reference_all
            </span>
            Danh mục hỗ trợ
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FAQ_CATEGORIES.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-all group"
              >
                <span
                  className={`flex-shrink-0 w-9 h-9 rounded-xl ${cat.badgeColor} flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <span className="material-symbols-outlined text-lg">
                    {cat.icon}
                  </span>
                </span>
                <div>
                  <p className="font-medium">{cat.title}</p>
                  <p className="text-xs text-on-surface-variant/70">
                    {cat.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </nav>

        {/* FAQ Sections */}
        <div className="space-y-12">
          {FAQ_CATEGORIES.map((category, catIdx) => (
            <section key={category.id} id={category.id} className="scroll-mt-24">
              <div className="flex items-start gap-4 mb-6">
                <span
                  className={`flex-shrink-0 w-11 h-11 rounded-2xl ${category.badgeColor} flex items-center justify-center`}
                >
                  <span className="material-symbols-outlined text-xl">
                    {category.icon}
                  </span>
                </span>
                <div>
                  <h2 className="text-2xl font-headline font-bold text-primary">
                    {catIdx + 1}. {category.title}
                  </h2>
                  <p className="text-sm text-on-surface-variant mt-1">
                    {category.description}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pl-0 md:pl-[60px]">
                {category.items.map((item, itemIdx) => (
                  <HelpAccordion
                    key={itemIdx}
                    question={item.question}
                    answer={item.answer}
                  />
                ))}
              </div>

              {catIdx < FAQ_CATEGORIES.length - 1 && (
                <hr className="border-surface-container-high mt-12" />
              )}
            </section>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 p-8 bg-surface-container-lowest rounded-2xl border border-surface-container-high text-center">
          <span className="material-symbols-outlined text-primary text-3xl mb-3 block">
            support_agent
          </span>
          <h3 className="font-headline font-bold text-primary text-lg mb-2">
            Không tìm thấy câu trả lời?
          </h3>
          <p className="text-sm text-on-surface-variant mb-2 max-w-lg mx-auto">
            Đừng ngại liên hệ trực tiếp với chúng tôi. Đội ngũ Bamia luôn sẵn
            sàng hỗ trợ bạn trong vòng <strong>24 giờ</strong>.
          </p>
          <p className="text-xs text-on-surface-variant mb-6">
            Thứ 2 – Thứ 7, 8:00 – 18:00 (giờ Việt Nam)
          </p>
          <a
            href="mailto:support@vietimmerse.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl font-medium text-sm hover:shadow-lg hover:translate-y-[-1px] transition-all"
          >
            <span className="material-symbols-outlined text-lg">email</span>
            support@vietimmerse.com
          </a>
        </div>

        {/* Back to top */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-lg">
              arrow_back
            </span>
            Quay lại trang chủ
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-surface-container-high py-8 px-6 mt-8">
        <p className="text-center text-xs text-on-surface-variant">
          © 2024 VietImmerse. Bảo lưu mọi quyền.
        </p>
      </footer>
    </div>
  );
}