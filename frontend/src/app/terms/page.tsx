import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng - VietImmerse",
  description:
    "Điều khoản sử dụng nền tảng học tiếng Việt VietImmerse. Quy định về tài khoản, quyền riêng tư, dữ liệu giọng nói, sở hữu trí tuệ và quy tắc ứng xử.",
};

const EFFECTIVE_DATE = "29/05/2026";

interface SectionProps {
  id: string;
  number: number;
  title: string;
  children: React.ReactNode;
}

function Section({ id, number, title, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-2xl font-headline font-bold text-primary mb-4 flex items-start gap-3">
        <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary-container text-on-primary-container text-sm font-bold flex items-center justify-center mt-0.5">
          {number}
        </span>
        {title}
      </h2>
      <div className="pl-12 space-y-4 text-on-surface-variant leading-relaxed">
        {children}
      </div>
    </section>
  );
}

const TOC_ITEMS = [
  { id: "acceptance", label: "Chấp thuận điều khoản" },
  { id: "account", label: "Tài khoản và Bảo mật" },
  { id: "privacy", label: "Quyền riêng tư & Dữ liệu giọng nói" },
  { id: "ip", label: "Quyền sở hữu trí tuệ" },
  { id: "conduct", label: "Quy tắc ứng xử" },
  { id: "liability", label: "Giới hạn trách nhiệm và Sửa đổi" },
];

export default function TermsPage() {
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
            <span className="material-symbols-outlined text-sm">gavel</span>
            Pháp lý
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-primary mb-4">
            Điều khoản sử dụng
          </h1>
          <p className="text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Vui lòng đọc kỹ các điều khoản dưới đây trước khi sử dụng nền tảng
            VietImmerse. Việc sử dụng dịch vụ đồng nghĩa với việc bạn đã đồng ý
            tuân thủ toàn bộ các điều khoản này.
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">
                calendar_today
              </span>
              Có hiệu lực từ: {EFFECTIVE_DATE}
            </span>
            <span className="w-1 h-1 rounded-full bg-outline" />
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">
                update
              </span>
              Cập nhật lần cuối: {EFFECTIVE_DATE}
            </span>
          </div>
        </div>

        {/* Table of Contents */}
        <nav className="mb-16 p-6 bg-surface-container-lowest rounded-2xl border border-surface-container-high">
          <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">list</span>
            Mục lục
          </h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TOC_ITEMS.map((item, idx) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-all group"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-surface-container-high text-xs font-bold flex items-center justify-center group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                    {idx + 1}
                  </span>
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* Section 1 */}
          <Section id="acceptance" number={1} title="Chấp thuận điều khoản">
            <p>
              Chào mừng bạn đến với <strong>VietImmerse</strong> — nền tảng học
              tiếng Việt miền Bắc dành cho người nước ngoài sinh sống và làm
              việc tại Hà Nội, Việt Nam. Bằng việc truy cập, đăng ký tài khoản
              hoặc sử dụng bất kỳ tính năng nào của nền tảng (bao gồm nhưng
              không giới hạn: các bài học, phòng luyện nói Voice Lab, tính năng
              ghép cặp Matching, và các dịch vụ liên quan), bạn xác nhận rằng
              bạn đã đọc, hiểu và đồng ý bị ràng buộc bởi các Điều khoản sử
              dụng này (&ldquo;Điều khoản&rdquo;).
            </p>
            <p>
              Nếu bạn không đồng ý với bất kỳ phần nào của Điều khoản, vui lòng
              ngừng sử dụng nền tảng ngay lập tức. VietImmerse có quyền từ chối
              cung cấp dịch vụ cho bất kỳ ai, vào bất kỳ thời điểm nào, vì bất
              kỳ lý do nào, trong phạm vi pháp luật cho phép.
            </p>
            <p>
              Nền tảng được thiết kế để phục vụ người dùng từ{" "}
              <strong>16 tuổi trở lên</strong>. Nếu bạn dưới 16 tuổi, bạn cần
              có sự đồng ý bằng văn bản của cha mẹ hoặc người giám hộ hợp pháp
              trước khi sử dụng dịch vụ. VietImmerse không chịu trách nhiệm
              trong trường hợp người dùng chưa đủ tuổi sử dụng dịch vụ mà không
              có sự giám sát phù hợp.
            </p>
          </Section>

          <hr className="border-surface-container-high" />

          {/* Section 2 */}
          <Section id="account" number={2} title="Tài khoản và Bảo mật">
            <p>
              Khi đăng ký tài khoản trên VietImmerse, bạn cam kết cung cấp
              thông tin chính xác, đầy đủ và cập nhật. Bạn chịu toàn bộ trách
              nhiệm về việc bảo mật thông tin đăng nhập (bao gồm tên đăng nhập
              và mật khẩu) và mọi hoạt động diễn ra thông qua tài khoản của
              mình.
            </p>
            <div className="bg-error-container/30 border border-error/20 rounded-xl p-4">
              <p className="text-sm font-medium text-on-error-container flex items-start gap-2">
                <span className="material-symbols-outlined text-error text-lg flex-shrink-0 mt-0.5">
                  warning
                </span>
                <span>
                  Bạn <strong>không được</strong> chia sẻ, cho mượn, hoặc chuyển
                  nhượng tài khoản cho bất kỳ bên thứ ba nào. Trong trường hợp
                  phát hiện truy cập trái phép, bạn phải thông báo ngay cho
                  VietImmerse qua email hỗ trợ.
                </span>
              </p>
            </div>
            <p>VietImmerse có quyền:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                Tạm khóa hoặc vô hiệu hóa tài khoản nếu phát hiện hành vi vi
                phạm Điều khoản, hành vi gian lận hoặc hoạt động đáng ngờ.
              </li>
              <li>
                Yêu cầu xác minh danh tính bổ sung khi cần thiết để đảm bảo an
                toàn hệ thống.
              </li>
              <li>
                Xóa tài khoản không hoạt động sau 12 tháng liên tục, sau khi đã
                gửi thông báo trước 30 ngày qua email đã đăng ký.
              </li>
            </ul>
            <p>
              Mỗi cá nhân chỉ được phép sở hữu tối đa{" "}
              <strong>một (01) tài khoản</strong> trên nền tảng. Việc tạo nhiều
              tài khoản nhằm mục đích lạm dụng dịch vụ sẽ dẫn đến việc tất cả
              tài khoản liên quan bị vô hiệu hóa vĩnh viễn.
            </p>
          </Section>

          <hr className="border-surface-container-high" />

          {/* Section 3 — Critical section with highlight */}
          <Section
            id="privacy"
            number={3}
            title="Quyền riêng tư & Dữ liệu giọng nói"
          >
            <div className="bg-primary-container/20 border border-primary/15 rounded-xl p-5 mb-4">
              <p className="text-sm font-bold text-primary flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-lg">
                  priority_high
                </span>
                Mục quan trọng — Vui lòng đọc kỹ
              </p>
              <p className="text-sm text-on-surface-variant">
                VietImmerse sử dụng công nghệ Trí tuệ Nhân tạo (AI) để phân
                tích và chấm điểm phát âm của người dùng. Điều này yêu cầu việc
                thu thập và xử lý dữ liệu giọng nói. Dưới đây là các cam kết
                của chúng tôi.
              </p>
            </div>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              3.1. Thu thập dữ liệu giọng nói
            </h3>
            <p>
              Khi bạn sử dụng tính năng <strong>Voice Lab</strong> (Phòng luyện
              nói) và <strong>Shadowing</strong> (Luyện phát âm theo mẫu), hệ
              thống sẽ ghi âm giọng nói của bạn thông qua microphone của thiết
              bị. Các bản ghi âm này được gửi đến máy chủ AI để phân tích thanh
              điệu, ngữ điệu và độ chính xác phát âm.
            </p>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              3.2. Mục đích sử dụng
            </h3>
            <p>Dữ liệu giọng nói của bạn chỉ được sử dụng cho các mục đích:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong>Chấm điểm phát âm:</strong> So sánh giọng nói của bạn
                với mẫu chuẩn để đưa ra điểm số và nhận xét cải thiện.
              </li>
              <li>
                <strong>Cải thiện mô hình AI:</strong> Dữ liệu được ẩn danh hóa
                (anonymized) có thể được sử dụng để huấn luyện và nâng cao chất
                lượng hệ thống nhận dạng giọng nói, nhưng không bao giờ liên kết
                ngược với danh tính cá nhân của bạn.
              </li>
              <li>
                <strong>Hiển thị tiến độ học tập:</strong> Cung cấp biểu đồ và
                thống kê về quá trình cải thiện phát âm theo thời gian.
              </li>
            </ul>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              3.3. Lưu trữ và bảo mật
            </h3>
            <p>
              Các bản ghi âm gốc được lưu trữ trên máy chủ bảo mật với mã hóa{" "}
              <strong>AES-256</strong> và chỉ được giữ lại trong thời gian tối
              đa <strong>90 ngày</strong> kể từ ngày ghi âm, trừ khi bạn chủ
              động yêu cầu xóa sớm hơn. Sau khi hết thời hạn lưu trữ, dữ liệu
              sẽ được xóa tự động và không thể khôi phục.
            </p>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              3.4. Cam kết không lạm dụng
            </h3>
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-4">
              <p className="text-sm">VietImmerse cam kết:</p>
              <ul className="list-disc list-inside space-y-2 ml-2 mt-2 text-sm">
                <li>
                  <strong>Không</strong> bán, cho thuê, hoặc chia sẻ dữ liệu
                  giọng nói với bất kỳ bên thứ ba nào vì mục đích thương mại.
                </li>
                <li>
                  <strong>Không</strong> sử dụng giọng nói của bạn để tạo deepfake,
                  mạo danh, hoặc bất kỳ mục đích phi đạo đức nào.
                </li>
                <li>
                  <strong>Không</strong> sử dụng dữ liệu để theo dõi, giám sát,
                  hoặc xây dựng hồ sơ sinh trắc học (biometric profiling) ngoài
                  phạm vi dịch vụ học tập.
                </li>
                <li>
                  Tuân thủ các quy định về bảo vệ dữ liệu cá nhân theo{" "}
                  <strong>Nghị định 13/2023/NĐ-CP</strong> của Chính phủ Việt
                  Nam về bảo vệ dữ liệu cá nhân.
                </li>
              </ul>
            </div>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              3.5. Quyền của người dùng
            </h3>
            <p>Bạn có quyền:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                Yêu cầu xóa toàn bộ dữ liệu giọng nói đã ghi âm bất kỳ lúc
                nào thông qua mục &ldquo;Cài đặt quyền riêng tư&rdquo; hoặc gửi
                yêu cầu qua email hỗ trợ.
              </li>
              <li>
                Từ chối tính năng ghi âm — tuy nhiên, điều này sẽ khiến bạn
                không thể sử dụng Voice Lab và Shadowing.
              </li>
              <li>
                Yêu cầu xuất (export) toàn bộ dữ liệu cá nhân của mình ở định
                dạng máy có thể đọc được (machine-readable format).
              </li>
            </ul>
          </Section>

          <hr className="border-surface-container-high" />

          {/* Section 4 */}
          <Section id="ip" number={4} title="Quyền sở hữu trí tuệ">
            <p>
              Toàn bộ nội dung trên nền tảng VietImmerse, bao gồm nhưng không
              giới hạn ở: các bài học, giáo trình, audio mẫu phát âm, hình ảnh
              minh họa, video, thiết kế giao diện, mã nguồn, logo, nhãn hiệu,
              và các tài liệu đào tạo, đều thuộc quyền sở hữu trí tuệ của{" "}
              <strong>VietImmerse</strong> hoặc các đối tác cấp phép nội dung
              cho nền tảng.
            </p>
            <p>Người dùng được cấp quyền:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong>Sử dụng cá nhân, phi thương mại:</strong> Truy cập và sử
                dụng nội dung khóa học cho mục đích học tập cá nhân.
              </li>
              <li>
                <strong>Không được sao chép:</strong> Nghiêm cấm sao chép, tái
                xuất bản, phân phối, bán lại, hoặc tạo các sản phẩm phái sinh từ
                nội dung của nền tảng dưới bất kỳ hình thức nào.
              </li>
              <li>
                <strong>Không được ghi hình/ghi âm lại:</strong> Nghiêm cấm
                screen-recording, screen-capture hoặc ghi âm lại các bài học và
                audio mẫu để chia sẻ hoặc sử dụng ngoài nền tảng.
              </li>
            </ul>
            <p>
              Mọi hành vi vi phạm quyền sở hữu trí tuệ có thể bị truy cứu
              trách nhiệm pháp lý theo quy định của{" "}
              <strong>Luật Sở hữu trí tuệ Việt Nam (2005, sửa đổi 2022)</strong>{" "}
              và các điều ước quốc tế liên quan mà Việt Nam là thành viên.
            </p>
          </Section>

          <hr className="border-surface-container-high" />

          {/* Section 5 */}
          <Section id="conduct" number={5} title="Quy tắc ứng xử">
            <p>
              VietImmerse xây dựng một cộng đồng học tập an toàn, tôn trọng và
              hòa nhập. Khi tham gia các tính năng cộng đồng, bao gồm{" "}
              <strong>Matching</strong> (Ghép cặp học tập) và các kênh trao đổi,
              bạn đồng ý tuân thủ các quy tắc sau:
            </p>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              5.1. Hành vi bị nghiêm cấm
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                Quấy rối, đe dọa, phân biệt đối xử hoặc sử dụng ngôn ngữ thù
                địch (hate speech) dựa trên chủng tộc, giới tính, tôn giáo, quốc
                tịch, khuynh hướng tính dục hoặc bất kỳ đặc điểm cá nhân nào.
              </li>
              <li>
                Gửi nội dung khiêu dâm, bạo lực, hoặc vi phạm pháp luật Việt
                Nam.
              </li>
              <li>
                Spam, quảng cáo, hoặc sử dụng tính năng ghép cặp cho mục đích
                ngoài học tập (bao gồm nhưng không giới hạn: mua bán, tiếp thị,
                lừa đảo, hoặc hẹn hò).
              </li>
              <li>
                Mạo danh người khác hoặc cung cấp thông tin hồ sơ sai lệch.
              </li>
              <li>
                Cố tình phá hoại trải nghiệm học tập của người dùng khác.
              </li>
            </ul>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              5.2. Xử lý vi phạm
            </h3>
            <p>
              VietImmerse áp dụng hệ thống xử lý vi phạm theo cấp độ tăng dần:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <div className="p-4 rounded-xl bg-secondary-container/30 border border-secondary/15 text-center">
                <span className="material-symbols-outlined text-secondary text-2xl mb-1 block">
                  info
                </span>
                <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                  Lần 1
                </p>
                <p className="text-sm text-on-surface-variant">
                  Cảnh cáo bằng văn bản
                </p>
              </div>
              <div className="p-4 rounded-xl bg-error-container/20 border border-error/15 text-center">
                <span className="material-symbols-outlined text-error text-2xl mb-1 block">
                  block
                </span>
                <p className="text-xs font-bold text-error uppercase tracking-wider mb-1">
                  Lần 2
                </p>
                <p className="text-sm text-on-surface-variant">
                  Tạm khóa tài khoản 30 ngày
                </p>
              </div>
              <div className="p-4 rounded-xl bg-error-container/30 border border-error/20 text-center">
                <span className="material-symbols-outlined text-error text-2xl mb-1 block">
                  dangerous
                </span>
                <p className="text-xs font-bold text-error uppercase tracking-wider mb-1">
                  Lần 3
                </p>
                <p className="text-sm text-on-surface-variant">
                  Khóa vĩnh viễn, không hoàn tiền
                </p>
              </div>
            </div>
            <p className="mt-4">
              Đối với các vi phạm nghiêm trọng (quấy rối tình dục, đe dọa bạo
              lực, hoạt động bất hợp pháp), VietImmerse có quyền khóa tài khoản
              vĩnh viễn ngay lập tức mà không cần cảnh báo trước, đồng thời có
              thể phối hợp với cơ quan chức năng nếu cần thiết.
            </p>
          </Section>

          <hr className="border-surface-container-high" />

          {/* Section 6 */}
          <Section
            id="liability"
            number={6}
            title="Giới hạn trách nhiệm và Sửa đổi điều khoản"
          >
            <h3 className="font-bold text-primary text-lg mt-2 mb-2">
              6.1. Giới hạn trách nhiệm
            </h3>
            <p>
              VietImmerse cung cấp dịch vụ trên cơ sở &ldquo;nguyên trạng&rdquo;
              (as-is) và &ldquo;sẵn có&rdquo; (as-available). Chúng tôi nỗ lực
              duy trì chất lượng dịch vụ cao nhất nhưng{" "}
              <strong>không đảm bảo</strong>:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                Dịch vụ sẽ hoạt động liên tục, không gián đoạn hoặc không có lỗi.
              </li>
              <li>
                Kết quả chấm điểm phát âm của AI là tuyệt đối chính xác — đây
                là công cụ hỗ trợ học tập, không thay thế giáo viên chuyên nghiệp.
              </li>
              <li>
                Chất lượng kết nối khi ghép cặp phụ thuộc vào mạng Internet của
                người dùng.
              </li>
            </ul>
            <p>
              Trong mọi trường hợp, tổng trách nhiệm pháp lý tối đa của
              VietImmerse đối với bạn sẽ không vượt quá số tiền bạn đã thanh
              toán cho dịch vụ trong <strong>12 tháng</strong> gần nhất trước
              thời điểm phát sinh tranh chấp.
            </p>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              6.2. Sửa đổi điều khoản
            </h3>
            <p>
              VietImmerse có quyền cập nhật hoặc sửa đổi Điều khoản sử dụng này
              vào bất kỳ thời điểm nào. Khi có sửa đổi quan trọng, chúng tôi sẽ:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                Thông báo cho bạn qua <strong>email</strong> và/hoặc{" "}
                <strong>thông báo trên ứng dụng</strong> ít nhất{" "}
                <strong>15 ngày</strong> trước khi thay đổi có hiệu lực.
              </li>
              <li>
                Cập nhật ngày &ldquo;Có hiệu lực từ&rdquo; ở đầu trang này.
              </li>
              <li>
                Lưu trữ các phiên bản trước đó để bạn có thể tra cứu lịch sử
                thay đổi.
              </li>
            </ul>
            <p>
              Việc bạn tiếp tục sử dụng dịch vụ sau ngày thay đổi có hiệu lực
              đồng nghĩa với việc bạn chấp nhận phiên bản Điều khoản mới. Nếu
              bạn không đồng ý với các thay đổi, bạn có quyền ngừng sử dụng
              dịch vụ và yêu cầu xóa tài khoản.
            </p>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              6.3. Luật áp dụng và Giải quyết tranh chấp
            </h3>
            <p>
              Điều khoản này được điều chỉnh bởi pháp luật{" "}
              <strong>Cộng hòa Xã hội Chủ nghĩa Việt Nam</strong>. Mọi tranh
              chấp phát sinh sẽ được giải quyết thông qua thương lượng thiện chí
              giữa các bên. Trong trường hợp không đạt được thỏa thuận, tranh
              chấp sẽ được đưa ra{" "}
              <strong>Tòa án nhân dân có thẩm quyền tại Hà Nội</strong> để giải
              quyết.
            </p>
          </Section>
        </div>

        {/* Contact Section */}
        <div className="mt-16 p-8 bg-surface-container-lowest rounded-2xl border border-surface-container-high text-center">
          <span className="material-symbols-outlined text-primary text-3xl mb-3 block">
            support_agent
          </span>
          <h3 className="font-headline font-bold text-primary text-lg mb-2">
            Bạn có câu hỏi?
          </h3>
          <p className="text-sm text-on-surface-variant mb-4 max-w-lg mx-auto">
            Nếu bạn có bất kỳ thắc mắc nào về Điều khoản sử dụng, vui lòng
            liên hệ với đội ngũ hỗ trợ của chúng tôi.
          </p>
          <a
            href="mailto:support@vietimmerse.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl font-medium text-sm hover:shadow-lg hover:translate-y-[-1px] transition-all"
          >
            <span className="material-symbols-outlined text-lg">mail</span>
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