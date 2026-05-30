import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Chính sách Quyền riêng tư - VietImmerse",
  description:
    "Chính sách Quyền riêng tư của VietImmerse. Tìm hiểu cách chúng tôi thu thập, sử dụng, bảo vệ dữ liệu cá nhân và dữ liệu giọng nói của bạn.",
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
  { id: "collection", label: "Thu thập thông tin" },
  { id: "voice-data", label: "Dữ liệu Giọng nói & Microphone" },
  { id: "usage-purpose", label: "Mục đích sử dụng dữ liệu" },
  { id: "third-party", label: "Chia sẻ thông tin với bên thứ ba" },
  { id: "user-rights", label: "Quyền của người dùng" },
  { id: "contact", label: "Liên hệ" },
];

export default function PrivacyPage() {
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
            <span className="material-symbols-outlined text-sm">shield</span>
            Bảo mật
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-primary mb-4">
            Chính sách Quyền riêng tư
          </h1>
          <p className="text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            VietImmerse cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của
            bạn. Tài liệu này giải thích chi tiết cách chúng tôi thu thập, sử
            dụng, lưu trữ và bảo vệ thông tin khi bạn sử dụng nền tảng.
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
          <Section id="collection" number={1} title="Thu thập thông tin">
            <p>
              Khi bạn đăng ký và sử dụng <strong>VietImmerse</strong>, chúng
              tôi thu thập các loại thông tin sau đây nhằm mục đích cung cấp và
              cải thiện dịch vụ:
            </p>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              1.1. Thông tin tài khoản
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong>Thông tin đăng ký:</strong> Họ tên, địa chỉ email, mật
                khẩu (được mã hóa), quốc tịch, và ngôn ngữ mẹ đẻ.
              </li>
              <li>
                <strong>Thông tin hồ sơ:</strong> Ảnh đại diện (nếu cung cấp),
                mô tả bản thân, sở thích học tập, và mục tiêu ngôn ngữ.
              </li>
              <li>
                <strong>Thông tin thiết bị:</strong> Loại thiết bị, hệ điều
                hành, phiên bản trình duyệt, địa chỉ IP (được ẩn danh hóa sau
                30 ngày), và múi giờ.
              </li>
            </ul>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              1.2. Dữ liệu học tập
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong>Tiến độ bài học:</strong> Các bài học đã hoàn thành,
                thời gian học, số lần truy cập, và tỷ lệ hoàn thành từng
                chương.
              </li>
              <li>
                <strong>Điểm số và đánh giá:</strong> Kết quả bài kiểm tra,
                điểm phát âm từ AI, lịch sử điểm theo thời gian.
              </li>
              <li>
                <strong>Tương tác Matching:</strong> Lịch sử ghép cặp, đánh giá
                đối tác, thời lượng phiên luyện tập cùng đối tác.
              </li>
              <li>
                <strong>Hoạt động Shadowing:</strong> Số lần luyện tập, các câu
                đã luyện, và điểm so sánh phát âm với mẫu chuẩn.
              </li>
            </ul>

            <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-4 mt-4">
              <p className="text-sm flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-lg flex-shrink-0 mt-0.5">
                  info
                </span>
                <span>
                  Chúng tôi <strong>không</strong> thu thập thông tin tài chính
                  (số thẻ tín dụng, tài khoản ngân hàng). Mọi giao dịch thanh
                  toán được xử lý hoàn toàn bởi đối tác cổng thanh toán bên thứ
                  ba đã được chứng nhận PCI-DSS.
                </span>
              </p>
            </div>
          </Section>

          <hr className="border-surface-container-high" />

          {/* Section 2 — Critical section */}
          <Section
            id="voice-data"
            number={2}
            title="Dữ liệu Giọng nói & Microphone"
          >
            <div className="bg-error-container/30 border border-error/20 rounded-xl p-5 mb-4">
              <p className="text-sm font-bold text-error flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-lg">
                  priority_high
                </span>
                Mục cực kỳ quan trọng — Vui lòng đọc kỹ
              </p>
              <p className="text-sm text-on-surface-variant">
                VietImmerse yêu cầu quyền truy cập microphone để phục vụ các
                tính năng luyện phát âm. Dưới đây là toàn bộ cam kết minh bạch
                của chúng tôi về việc xử lý dữ liệu giọng nói.
              </p>
            </div>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              2.1. Vì sao cần quyền truy cập Microphone?
            </h3>
            <p>
              Ứng dụng yêu cầu quyền truy cập microphone của thiết bị{" "}
              <strong>duy nhất</strong> để phục vụ hai tính năng cốt lõi:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong>Voice Lab (Phòng luyện nói):</strong> Ghi âm phát âm của
                bạn để hệ thống AI phân tích thanh điệu, ngữ điệu và độ chính
                xác theo chuẩn tiếng Việt miền Bắc.
              </li>
              <li>
                <strong>Shadowing (Luyện phát âm theo mẫu):</strong> So sánh
                giọng nói thực tế của bạn với mẫu phát âm chuẩn để đưa ra phản
                hồi trực quan và điểm số chi tiết.
              </li>
            </ul>
            <p>
              Microphone <strong>chỉ được kích hoạt</strong> khi bạn chủ động
              nhấn nút ghi âm trong các tính năng trên. Ứng dụng{" "}
              <strong>không bao giờ</strong> ghi âm ngầm (background recording)
              hay kích hoạt microphone ngoài phạm vi tính năng học tập.
            </p>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              2.2. Dữ liệu âm thanh được xử lý như thế nào?
            </h3>
            <p>
              Khi bạn thực hiện ghi âm, quy trình xử lý dữ liệu diễn ra như
              sau:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <div className="p-4 rounded-xl bg-primary-container/20 border border-primary/15 text-center">
                <span className="material-symbols-outlined text-primary text-2xl mb-1 block">
                  mic
                </span>
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  Bước 1
                </p>
                <p className="text-sm text-on-surface-variant">
                  Ghi âm giọng nói qua microphone thiết bị
                </p>
              </div>
              <div className="p-4 rounded-xl bg-secondary-container/30 border border-secondary/15 text-center">
                <span className="material-symbols-outlined text-secondary text-2xl mb-1 block">
                  cloud_upload
                </span>
                <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                  Bước 2
                </p>
                <p className="text-sm text-on-surface-variant">
                  Gửi đến máy chủ AI để phân tích & chấm điểm
                </p>
              </div>
              <div className="p-4 rounded-xl bg-tertiary-container/30 border border-tertiary/15 text-center">
                <span className="material-symbols-outlined text-tertiary text-2xl mb-1 block">
                  delete_sweep
                </span>
                <p className="text-xs font-bold text-tertiary uppercase tracking-wider mb-1">
                  Bước 3
                </p>
                <p className="text-sm text-on-surface-variant">
                  Xóa bản ghi gốc sau khi xử lý xong
                </p>
              </div>
            </div>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              2.3. Cam kết bảo mật dữ liệu giọng nói
            </h3>
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-4">
              <p className="text-sm mb-2">VietImmerse cam kết tuyệt đối:</p>
              <ul className="list-disc list-inside space-y-2 ml-2 text-sm">
                <li>
                  Dữ liệu âm thanh <strong>chỉ</strong> được gửi đến máy chủ
                  (hoặc API AI bên thứ 3 như Google Cloud Speech, OpenAI
                  Whisper){" "}
                  <strong>
                    để phân tích ngữ âm và chấm điểm phát âm
                  </strong>
                  , không dùng cho bất kỳ mục đích nào khác.
                </li>
                <li>
                  <strong>Không</strong> sử dụng giọng nói để định danh cá nhân
                  (voice fingerprinting), xây dựng hồ sơ sinh trắc học
                  (biometric profiling), hoặc giám sát người dùng.
                </li>
                <li>
                  <strong>Không</strong> sử dụng giọng nói để tạo deepfake, mạo
                  danh, hoặc bất kỳ mục đích phi đạo đức nào.
                </li>
                <li>
                  <strong>Không</strong> bán, cho thuê, hoặc chia sẻ bản ghi âm
                  gốc cho bên thứ ba vì mục đích thương mại.
                </li>
                <li>
                  Bản ghi âm gốc được mã hóa bằng <strong>AES-256</strong> khi
                  truyền tải và lưu trữ, và sẽ được{" "}
                  <strong>xóa tự động trong vòng 90 ngày</strong> kể từ ngày ghi
                  âm, trừ khi bạn yêu cầu xóa sớm hơn.
                </li>
              </ul>
            </div>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              2.4. Quyền từ chối
            </h3>
            <p>
              Bạn hoàn toàn có quyền từ chối cấp quyền microphone. Tuy nhiên,
              điều này đồng nghĩa với việc bạn sẽ không thể sử dụng các tính
              năng <strong>Voice Lab</strong> và <strong>Shadowing</strong>. Các
              tính năng khác của nền tảng (bài học lý thuyết, Matching, v.v.)
              vẫn hoạt động bình thường.
            </p>
          </Section>

          <hr className="border-surface-container-high" />

          {/* Section 3 */}
          <Section
            id="usage-purpose"
            number={3}
            title="Mục đích sử dụng dữ liệu"
          >
            <p>
              Toàn bộ dữ liệu được thu thập từ người dùng chỉ phục vụ các mục
              đích cụ thể, hợp pháp và minh bạch sau đây:
            </p>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              3.1. Cá nhân hóa lộ trình học tập
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                Phân tích tiến độ học tập và điểm mạnh/yếu của bạn để đề xuất
                bài học, cấp độ và nội dung phù hợp nhất.
              </li>
              <li>
                Điều chỉnh độ khó của bài tập dựa trên lịch sử hiệu suất,
                giúp tối ưu hóa quá trình tiếp thu ngôn ngữ.
              </li>
              <li>
                Gợi ý thời gian học tập phù hợp dựa trên thói quen sử dụng
                ứng dụng của bạn.
              </li>
            </ul>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              3.2. Cải thiện hệ thống AI chấm điểm
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                Dữ liệu phát âm sau khi được{" "}
                <strong>ẩn danh hóa hoàn toàn</strong> (anonymized) có thể được
                sử dụng để huấn luyện và nâng cao độ chính xác của mô hình AI
                nhận dạng giọng nói.
              </li>
              <li>
                Quá trình ẩn danh hóa đảm bảo{" "}
                <strong>
                  không thể liên kết ngược dữ liệu với danh tính cá nhân
                </strong>{" "}
                của bất kỳ người dùng nào.
              </li>
              <li>
                Bạn có quyền từ chối việc sử dụng dữ liệu cho mục đích cải
                thiện AI thông qua mục &ldquo;Cài đặt quyền riêng tư&rdquo;
                trong tài khoản.
              </li>
            </ul>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              3.3. Cải thiện hệ thống ghép cặp (Matching)
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                Sử dụng thông tin hồ sơ, sở thích và trình độ ngôn ngữ để ghép
                cặp bạn với các đối tác học tập tương thích nhất.
              </li>
              <li>
                Phân tích đánh giá sau phiên luyện tập để liên tục tối ưu thuật
                toán ghép cặp.
              </li>
              <li>
                Dữ liệu ghép cặp <strong>không</strong> được sử dụng cho mục
                đích hẹn hò, quảng cáo, hoặc giới thiệu sản phẩm/dịch vụ bên
                ngoài nền tảng.
              </li>
            </ul>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              3.4. Vận hành và bảo trì hệ thống
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                Phát hiện và ngăn chặn gian lận, lạm dụng, hoặc các hoạt động
                vi phạm Điều khoản sử dụng.
              </li>
              <li>
                Giám sát hiệu suất hệ thống, phân tích lỗi, và cải thiện trải
                nghiệm người dùng tổng thể.
              </li>
              <li>
                Gửi thông báo quan trọng liên quan đến tài khoản, bảo mật,
                hoặc thay đổi chính sách (không gửi email quảng cáo trừ khi bạn
                đồng ý).
              </li>
            </ul>
          </Section>

          <hr className="border-surface-container-high" />

          {/* Section 4 */}
          <Section
            id="third-party"
            number={4}
            title="Chia sẻ thông tin với bên thứ ba"
          >
            <p>
              VietImmerse <strong>không bán</strong> dữ liệu cá nhân của bạn
              cho bất kỳ bên thứ ba nào. Chúng tôi chỉ chia sẻ thông tin trong
              các trường hợp giới hạn sau:
            </p>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              4.1. Đối tác cung cấp dịch vụ hạ tầng
            </h3>
            <p>
              Chúng tôi hợp tác với các nhà cung cấp dịch vụ uy tín để vận hành
              nền tảng. Dữ liệu được chia sẻ với các đối tác này{" "}
              <strong>chỉ mang tính kỹ thuật</strong> và{" "}
              <strong>đã được ẩn danh hóa</strong> khi có thể:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high">
                <p className="text-sm font-bold text-primary mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">
                    cloud
                  </span>
                  Dịch vụ đám mây (Cloud)
                </p>
                <p className="text-xs text-on-surface-variant">
                  Lưu trữ dữ liệu trên hạ tầng đám mây được mã hóa, tuân thủ
                  tiêu chuẩn ISO 27001 và SOC 2.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high">
                <p className="text-sm font-bold text-primary mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">
                    smart_toy
                  </span>
                  API Trí tuệ Nhân tạo
                </p>
                <p className="text-xs text-on-surface-variant">
                  Gửi dữ liệu âm thanh ẩn danh đến API AI để phân tích phát
                  âm. Không gửi kèm thông tin định danh cá nhân.
                </p>
              </div>
            </div>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              4.2. Cam kết bảo mật với đối tác
            </h3>
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-4">
              <p className="text-sm mb-2">
                Tất cả đối tác bên thứ ba phải tuân thủ:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2 text-sm">
                <li>
                  Ký kết <strong>Thỏa thuận xử lý dữ liệu</strong> (Data
                  Processing Agreement — DPA) ràng buộc pháp lý.
                </li>
                <li>
                  Chỉ được xử lý dữ liệu theo hướng dẫn cụ thể từ VietImmerse,
                  không được sử dụng cho mục đích riêng.
                </li>
                <li>
                  Áp dụng các biện pháp bảo mật kỹ thuật và tổ chức phù hợp
                  với tiêu chuẩn ngành.
                </li>
                <li>
                  Xóa hoặc trả lại dữ liệu khi kết thúc hợp đồng dịch vụ.
                </li>
              </ul>
            </div>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              4.3. Yêu cầu pháp lý
            </h3>
            <p>
              VietImmerse có thể tiết lộ thông tin cá nhân khi được yêu cầu bởi
              cơ quan nhà nước có thẩm quyền theo quy định của pháp luật{" "}
              <strong>Cộng hòa Xã hội Chủ nghĩa Việt Nam</strong>, bao gồm
              nhưng không giới hạn:{" "}
              <strong>Nghị định 13/2023/NĐ-CP</strong> về bảo vệ dữ liệu cá
              nhân và các văn bản pháp luật liên quan. Trong trường hợp này,
              chúng tôi sẽ nỗ lực thông báo cho bạn trước (trừ khi bị pháp luật
              cấm).
            </p>
          </Section>

          <hr className="border-surface-container-high" />

          {/* Section 5 */}
          <Section
            id="user-rights"
            number={5}
            title="Quyền của người dùng"
          >
            <p>
              Là người dùng của VietImmerse, bạn có đầy đủ các quyền sau đây
              đối với dữ liệu cá nhân của mình, theo quy định của{" "}
              <strong>Nghị định 13/2023/NĐ-CP</strong>:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="p-4 rounded-xl bg-primary-container/20 border border-primary/15">
                <span className="material-symbols-outlined text-primary text-xl mb-2 block">
                  visibility
                </span>
                <p className="text-sm font-bold text-primary mb-1">
                  Quyền truy cập
                </p>
                <p className="text-xs text-on-surface-variant">
                  Yêu cầu xem toàn bộ dữ liệu cá nhân mà VietImmerse đang lưu
                  trữ về bạn, bao gồm lịch sử học tập, điểm số, và dữ liệu hồ
                  sơ.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-secondary-container/20 border border-secondary/15">
                <span className="material-symbols-outlined text-secondary text-xl mb-2 block">
                  edit_note
                </span>
                <p className="text-sm font-bold text-secondary mb-1">
                  Quyền chỉnh sửa
                </p>
                <p className="text-xs text-on-surface-variant">
                  Yêu cầu chỉnh sửa thông tin cá nhân không chính xác hoặc
                  không đầy đủ (tên, email, quốc tịch, v.v.).
                </p>
              </div>
              <div className="p-4 rounded-xl bg-error-container/20 border border-error/15">
                <span className="material-symbols-outlined text-error text-xl mb-2 block">
                  delete_forever
                </span>
                <p className="text-sm font-bold text-error mb-1">
                  Quyền xóa dữ liệu
                </p>
                <p className="text-xs text-on-surface-variant">
                  Yêu cầu xóa toàn bộ dữ liệu cá nhân, bao gồm hồ sơ tài
                  khoản, lịch sử học tập, bản ghi âm, và điểm số khỏi hệ
                  thống.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-tertiary-container/20 border border-tertiary/15">
                <span className="material-symbols-outlined text-tertiary text-xl mb-2 block">
                  download
                </span>
                <p className="text-sm font-bold text-tertiary mb-1">
                  Quyền xuất dữ liệu
                </p>
                <p className="text-xs text-on-surface-variant">
                  Yêu cầu xuất (export) toàn bộ dữ liệu cá nhân ở định dạng
                  máy có thể đọc được (JSON hoặc CSV).
                </p>
              </div>
            </div>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              5.1. Cách thực hiện quyền
            </h3>
            <p>Để thực hiện bất kỳ quyền nào ở trên, bạn có thể:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                Truy cập mục{" "}
                <strong>&ldquo;Cài đặt quyền riêng tư&rdquo;</strong> trong tài
                khoản của bạn để tự quản lý dữ liệu.
              </li>
              <li>
                Gửi yêu cầu qua email{" "}
                <a
                  href="mailto:privacy@vietimmerse.com"
                  className="text-primary font-medium hover:underline"
                >
                  privacy@vietimmerse.com
                </a>{" "}
                với tiêu đề rõ ràng (ví dụ: &ldquo;Yêu cầu xóa dữ liệu&rdquo;).
              </li>
            </ul>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              5.2. Thời gian xử lý
            </h3>
            <p>
              Chúng tôi cam kết phản hồi và xử lý mọi yêu cầu liên quan đến
              quyền của bạn trong vòng <strong>15 ngày làm việc</strong> kể từ
              ngày nhận được yêu cầu hợp lệ. Trong trường hợp yêu cầu phức
              tạp, thời gian xử lý có thể kéo dài thêm{" "}
              <strong>tối đa 15 ngày</strong>, và bạn sẽ được thông báo trước.
            </p>

            <div className="bg-error-container/30 border border-error/20 rounded-xl p-4 mt-4">
              <p className="text-sm font-medium text-on-error-container flex items-start gap-2">
                <span className="material-symbols-outlined text-error text-lg flex-shrink-0 mt-0.5">
                  warning
                </span>
                <span>
                  <strong>Lưu ý:</strong> Việc xóa toàn bộ dữ liệu là{" "}
                  <strong>không thể hoàn tác</strong>. Sau khi xóa, bạn sẽ mất
                  toàn bộ lịch sử học tập, điểm số, và tiến độ. Hãy cân nhắc kỹ
                  trước khi gửi yêu cầu.
                </span>
              </p>
            </div>
          </Section>

          <hr className="border-surface-container-high" />

          {/* Section 6 */}
          <Section id="contact" number={6} title="Liên hệ">
            <p>
              Nếu bạn có bất kỳ câu hỏi, thắc mắc hoặc khiếu nại nào liên
              quan đến Chính sách Quyền riêng tư này, vui lòng liên hệ với
              chúng tôi qua các kênh sau:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high">
                <p className="text-sm font-bold text-primary mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">
                    mail
                  </span>
                  Email hỗ trợ chung
                </p>
                <a
                  href="mailto:support@vietimmerse.com"
                  className="text-sm text-primary hover:underline"
                >
                  support@vietimmerse.com
                </a>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high">
                <p className="text-sm font-bold text-primary mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">
                    shield
                  </span>
                  Email quyền riêng tư
                </p>
                <a
                  href="mailto:privacy@vietimmerse.com"
                  className="text-sm text-primary hover:underline"
                >
                  privacy@vietimmerse.com
                </a>
              </div>
            </div>

            <p className="mt-4">
              Chúng tôi cam kết phản hồi mọi liên hệ trong vòng{" "}
              <strong>3 ngày làm việc</strong>. Đối với các vấn đề khẩn cấp liên
              quan đến bảo mật dữ liệu, vui lòng ghi rõ{" "}
              <strong>&ldquo;KHẨN CẤP&rdquo;</strong> trong tiêu đề email.
            </p>

            <div className="bg-primary-container/20 border border-primary/15 rounded-xl p-4 mt-4">
              <p className="text-sm flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-lg flex-shrink-0 mt-0.5">
                  gavel
                </span>
                <span>
                  Chính sách này được điều chỉnh bởi pháp luật{" "}
                  <strong>Cộng hòa Xã hội Chủ nghĩa Việt Nam</strong> và tuân
                  thủ <strong>Nghị định 13/2023/NĐ-CP</strong> về bảo vệ dữ
                  liệu cá nhân. VietImmerse có quyền cập nhật Chính sách này
                  và sẽ thông báo cho bạn ít nhất{" "}
                  <strong>15 ngày trước</strong> khi thay đổi có hiệu lực.
                </span>
              </p>
            </div>
          </Section>
        </div>

        {/* Contact Section */}
        <div className="mt-16 p-8 bg-surface-container-lowest rounded-2xl border border-surface-container-high text-center">
          <span className="material-symbols-outlined text-primary text-3xl mb-3 block">
            verified_user
          </span>
          <h3 className="font-headline font-bold text-primary text-lg mb-2">
            Cam kết của chúng tôi
          </h3>
          <p className="text-sm text-on-surface-variant mb-4 max-w-lg mx-auto">
            VietImmerse luôn đặt quyền riêng tư của bạn lên hàng đầu. Chúng
            tôi liên tục cập nhật các biện pháp bảo mật để đảm bảo dữ liệu
            của bạn luôn được bảo vệ an toàn.
          </p>
          <a
            href="mailto:privacy@vietimmerse.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl font-medium text-sm hover:shadow-lg hover:translate-y-[-1px] transition-all"
          >
            <span className="material-symbols-outlined text-lg">mail</span>
            privacy@vietimmerse.com
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