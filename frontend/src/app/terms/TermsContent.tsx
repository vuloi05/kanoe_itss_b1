"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

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

export default function TermsContent() {
  const { t } = useLanguage();

  const TOC_ITEMS = [
    { id: "acceptance", label: t("Chấp thuận điều khoản", "利用規約の同意") },
    { id: "account", label: t("Tài khoản và Bảo mật", "アカウントとセキュリティ") },
    { id: "privacy", label: t("Quyền riêng tư & Dữ liệu giọng nói", "プライバシーと音声データ") },
    { id: "ip", label: t("Quyền sở hữu trí tuệ", "知的財産権") },
    { id: "conduct", label: t("Quy tắc ứng xử", "行動規範") },
    { id: "liability", label: t("Giới hạn trách nhiệm và Sửa đổi", "責任の制限と改定") },
  ];

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
            <span className="text-sm font-medium">{t("Trang chủ", "ホーム")}</span>
          </Link>
          <span className="text-lg font-bold text-primary font-headline">
            VietImmerse
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16 relative">
        <div className="absolute top-4 right-6 md:top-8 md:right-8">
          <LanguageSwitcher />
        </div>

        {/* Page Title */}
        <div className="mb-12 text-center mt-8 md:mt-0">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container text-on-primary-container text-xs font-bold uppercase tracking-widest mb-6">
            <span className="material-symbols-outlined text-sm">gavel</span>
            {t("Pháp lý", "法的情報")}
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-primary mb-4">
            {t("Điều khoản sử dụng", "利用規約")}
          </h1>
          <p className="text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            {t(
              "Vui lòng đọc kỹ các điều khoản dưới đây trước khi sử dụng nền tảng VietImmerse. Việc sử dụng dịch vụ đồng nghĩa với việc bạn đã đồng ý tuân thủ toàn bộ các điều khoản này.",
              "VietImmerseプラットフォームをご利用の前に、以下の利用規約をよくお読みください。本サービスのご利用は、これらの規約すべてに同意したことを意味します。"
            )}
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">
                calendar_today
              </span>
              {t("Có hiệu lực từ", "発効日")}: {EFFECTIVE_DATE}
            </span>
            <span className="w-1 h-1 rounded-full bg-outline" />
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">
                update
              </span>
              {t("Cập nhật lần cuối", "最終更新日")}: {EFFECTIVE_DATE}
            </span>
          </div>
        </div>

        {/* Table of Contents */}
        <nav className="mb-16 p-6 bg-surface-container-lowest rounded-2xl border border-surface-container-high">
          <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">list</span>
            {t("Mục lục", "目次")}
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
          <Section id="acceptance" number={1} title={t("Chấp thuận điều khoản", "利用規約の同意")}>
            <p>
              {t(
                <>Chào mừng bạn đến với <strong>VietImmerse</strong> — nền tảng học tiếng Việt miền Bắc dành cho người nước ngoài sinh sống và làm việc tại Hà Nội, Việt Nam. Bằng việc truy cập, đăng ký tài khoản hoặc sử dụng bất kỳ tính năng nào của nền tảng (bao gồm nhưng không giới hạn: các bài học, phòng luyện nói Voice Lab, tính năng ghép cặp Matching, và các dịch vụ liên quan), bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý bị ràng buộc bởi các Điều khoản sử dụng này (&ldquo;Điều khoản&rdquo;).</>,
                <><strong>VietImmerse</strong>へようこそ — ハノイ在住の外国人のための北部ベトナム語学習プラットフォームです。本プラットフォームへのアクセス、アカウント登録、または機能（レッスン、Voice Lab、マッチング機能など）のご利用により、本利用規約（「規約」）を読み、理解し、同意したことを確認するものとします。</>
              )}
            </p>
            <p>
              {t(
                "Nếu bạn không đồng ý với bất kỳ phần nào của Điều khoản, vui lòng ngừng sử dụng nền tảng ngay lập tức. VietImmerse có quyền từ chối cung cấp dịch vụ cho bất kỳ ai, vào bất kỳ thời điểm nào, vì bất kỳ lý do nào, trong phạm vi pháp luật cho phép.",
                "規約のいずれかの部分に同意されない場合は、直ちにプラットフォームの使用を中止してください。VietImmerseは、法律の範囲内で、いつでも、いかなる理由でも、サービスの提供を拒否する権利を有します。"
              )}
            </p>
            <p>
              {t(
                <>Nền tảng được thiết kế để phục vụ người dùng từ <strong>16 tuổi trở lên</strong>. Nếu bạn dưới 16 tuổi, bạn cần có sự đồng ý bằng văn bản của cha mẹ hoặc người giám hộ hợp pháp trước khi sử dụng dịch vụ. VietImmerse không chịu trách nhiệm trong trường hợp người dùng chưa đủ tuổi sử dụng dịch vụ mà không có sự giám sát phù hợp.</>,
                <>本プラットフォームは<strong>16歳以上</strong>のユーザーを対象としています。16歳未満の方は、サービスを利用する前に保護者の書面による同意が必要です。適切な監督なしに未成年者がサービスを利用した場合、VietImmerseは責任を負いません。</>
              )}
            </p>
          </Section>

          <hr className="border-surface-container-high" />

          {/* Section 2 */}
          <Section id="account" number={2} title={t("Tài khoản và Bảo mật", "アカウントとセキュリティ")}>
            <p>
              {t(
                "Khi đăng ký tài khoản trên VietImmerse, bạn cam kết cung cấp thông tin chính xác, đầy đủ và cập nhật. Bạn chịu toàn bộ trách nhiệm về việc bảo mật thông tin đăng nhập (bao gồm tên đăng nhập và mật khẩu) và mọi hoạt động diễn ra thông qua tài khoản của mình.",
                "VietImmerseにアカウントを登録する際、正確で完全かつ最新の情報を提供することを約束します。ログイン情報（ユーザー名とパスワードを含む）のセキュリティ、およびアカウントを通じて行われるすべての活動について、全責任を負います。"
              )}
            </p>
            <div className="bg-error-container/30 border border-error/20 rounded-xl p-4">
              <p className="text-sm font-medium text-on-error-container flex items-start gap-2">
                <span className="material-symbols-outlined text-error text-lg flex-shrink-0 mt-0.5">
                  warning
                </span>
                <span>
                  {t(
                    <>Bạn <strong>không được</strong> chia sẻ, cho mượn, hoặc chuyển nhượng tài khoản cho bất kỳ bên thứ ba nào. Trong trường hợp phát hiện truy cập trái phép, bạn phải thông báo ngay cho VietImmerse qua email hỗ trợ.</>,
                    <>アカウントを第三者と<strong>共有、貸与、または譲渡してはなりません</strong>。不正アクセスを発見した場合は、直ちにサポートメールでVietImmerseに通知する必要があります。</>
                  )}
                </span>
              </p>
            </div>
            <p>{t("VietImmerse có quyền:", "VietImmerseは以下の権利を有します：")}</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                {t(
                  "Tạm khóa hoặc vô hiệu hóa tài khoản nếu phát hiện hành vi vi phạm Điều khoản, hành vi gian lận hoặc hoạt động đáng ngờ.",
                  "規約違反、不正行為、または疑わしい活動が検出された場合、アカウントを一時停止または無効化すること。"
                )}
              </li>
              <li>
                {t(
                  "Yêu cầu xác minh danh tính bổ sung khi cần thiết để đảm bảo an toàn hệ thống.",
                  "システムの安全性を確保するために必要な場合、追加の本人確認を要求すること。"
                )}
              </li>
              <li>
                {t(
                  "Xóa tài khoản không hoạt động sau 12 tháng liên tục, sau khi đã gửi thông báo trước 30 ngày qua email đã đăng ký.",
                  "登録メールアドレスに30日前の通知を送付した後、12か月連続で使用されていないアカウントを削除すること。"
                )}
              </li>
            </ul>
            <p>
              {t(
                <>Mỗi cá nhân chỉ được phép sở hữu tối đa <strong>một (01) tài khoản</strong> trên nền tảng. Việc tạo nhiều tài khoản nhằm mục đích lạm dụng dịch vụ sẽ dẫn đến việc tất cả tài khoản liên quan bị vô hiệu hóa vĩnh viễn.</>,
                <>各個人はプラットフォーム上で最大<strong>1つのアカウント</strong>のみ所有できます。サービスを悪用する目的で複数のアカウントを作成した場合、関連するすべてのアカウントが永久に無効化されます。</>
              )}
            </p>
          </Section>

          <hr className="border-surface-container-high" />

          {/* Section 3 */}
          <Section
            id="privacy"
            number={3}
            title={t("Quyền riêng tư & Dữ liệu giọng nói", "プライバシーと音声データ")}
          >
            <div className="bg-primary-container/20 border border-primary/15 rounded-xl p-5 mb-4">
              <p className="text-sm font-bold text-primary flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-lg">
                  priority_high
                </span>
                {t("Mục quan trọng — Vui lòng đọc kỹ", "重要項目 — よくお読みください")}
              </p>
              <p className="text-sm text-on-surface-variant">
                {t(
                  "VietImmerse sử dụng công nghệ Trí tuệ Nhân tạo (AI) để phân tích và chấm điểm phát âm của người dùng. Điều này yêu cầu việc thu thập và xử lý dữ liệu giọng nói. Dưới đây là các cam kết của chúng tôi.",
                  "VietImmerseはAI技術を使用してユーザーの発音を分析・採点しています。これには音声データの収集と処理が必要です。以下は私たちの取り組みです。"
                )}
              </p>
            </div>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              {t("3.1. Thu thập dữ liệu giọng nói", "3.1. 音声データの収集")}
            </h3>
            <p>
              {t(
                <>Khi bạn sử dụng tính năng <strong>Voice Lab</strong> (Phòng luyện nói) và <strong>Shadowing</strong> (Luyện phát âm theo mẫu), hệ thống sẽ ghi âm giọng nói của bạn thông qua microphone của thiết bị. Các bản ghi âm này được gửi đến máy chủ AI để phân tích thanh điệu, ngữ điệu và độ chính xác phát âm.</>,
                <><strong>Voice Lab</strong>（発話練習室）と<strong>Shadowing</strong>（発音模倣練習）機能を使用すると、デバイスのマイクを通じて音声が録音されます。これらの録音はAIサーバーに送信され、声調、イントネーション、発音の正確性が分析されます。</>
              )}
            </p>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              {t("3.2. Mục đích sử dụng", "3.2. 使用目的")}
            </h3>
            <p>{t("Dữ liệu giọng nói của bạn chỉ được sử dụng cho các mục đích:", "音声データは以下の目的のみに使用されます：")}</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                {t(
                  <><strong>Chấm điểm phát âm:</strong> So sánh giọng nói của bạn với mẫu chuẩn để đưa ra điểm số và nhận xét cải thiện.</>,
                  <><strong>発音採点：</strong> 標準モデルと比較して、スコアと改善提案を提供します。</>
                )}
              </li>
              <li>
                {t(
                  <><strong>Cải thiện mô hình AI:</strong> Dữ liệu được ẩn danh hóa (anonymized) có thể được sử dụng để huấn luyện và nâng cao chất lượng hệ thống nhận dạng giọng nói, nhưng không bao giờ liên kết ngược với danh tính cá nhân của bạn.</>,
                  <><strong>AIモデルの改善：</strong> 匿名化されたデータは音声認識システムの品質向上に使用される場合がありますが、個人の身元と結び付けられることはありません。</>
                )}
              </li>
              <li>
                {t(
                  <><strong>Hiển thị tiến độ học tập:</strong> Cung cấp biểu đồ và thống kê về quá trình cải thiện phát âm theo thời gian.</>,
                  <><strong>学習進捗の表示：</strong> 時間の経過に伴う発音改善のグラフと統計を提供します。</>
                )}
              </li>
            </ul>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              {t("3.3. Lưu trữ và bảo mật", "3.3. 保存とセキュリティ")}
            </h3>
            <p>
              {t(
                <>Các bản ghi âm gốc được lưu trữ trên máy chủ bảo mật với mã hóa <strong>AES-256</strong> và chỉ được giữ lại trong thời gian tối đa <strong>90 ngày</strong> kể từ ngày ghi âm, trừ khi bạn chủ động yêu cầu xóa sớm hơn. Sau khi hết thời hạn lưu trữ, dữ liệu sẽ được xóa tự động và không thể khôi phục.</>,
                <>元の録音は<strong>AES-256</strong>暗号化でセキュアサーバーに保存され、録音日から最大<strong>90日間</strong>保持されます（早期削除を要求しない限り）。保存期間終了後、データは自動的に削除され、復元できません。</>
              )}
            </p>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              {t("3.4. Cam kết không lạm dụng", "3.4. 不正使用の禁止")}
            </h3>
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-4">
              <p className="text-sm">{t("VietImmerse cam kết:", "VietImmerseは以下を約束します：")}</p>
              <ul className="list-disc list-inside space-y-2 ml-2 mt-2 text-sm">
                <li>
                  {t(
                    <><strong>Không</strong> bán, cho thuê, hoặc chia sẻ dữ liệu giọng nói với bất kỳ bên thứ ba nào vì mục đích thương mại.</>,
                    <>音声データを商業目的で第三者に<strong>販売、貸与、共有しません</strong>。</>
                  )}
                </li>
                <li>
                  {t(
                    <><strong>Không</strong> sử dụng giọng nói của bạn để tạo deepfake, mạo danh, hoặc bất kỳ mục đích phi đạo đức nào.</>,
                    <>ディープフェイク、なりすまし、またはその他の非倫理的な目的に音声を<strong>使用しません</strong>。</>
                  )}
                </li>
                <li>
                  {t(
                    <><strong>Không</strong> sử dụng dữ liệu để theo dõi, giám sát, hoặc xây dựng hồ sơ sinh trắc học (biometric profiling) ngoài phạm vi dịch vụ học tập.</>,
                    <>学習サービスの範囲外での追跡、監視、または生体認証プロファイリングにデータを<strong>使用しません</strong>。</>
                  )}
                </li>
                <li>
                  {t(
                    <>Tuân thủ các quy định về bảo vệ dữ liệu cá nhân theo <strong>Nghị định 13/2023/NĐ-CP</strong> của Chính phủ Việt Nam về bảo vệ dữ liệu cá nhân.</>,
                    <>ベトナム政府の個人データ保護に関する<strong>政令13/2023/NĐ-CP</strong>に準拠します。</>
                  )}
                </li>
              </ul>
            </div>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              {t("3.5. Quyền của người dùng", "3.5. ユーザーの権利")}
            </h3>
            <p>{t("Bạn có quyền:", "以下の権利があります：")}</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                {t(
                  "Yêu cầu xóa toàn bộ dữ liệu giọng nói đã ghi âm bất kỳ lúc nào thông qua mục \u201cCài đặt quyền riêng tư\u201d hoặc gửi yêu cầu qua email hỗ trợ.",
                  "「プライバシー設定」またはサポートメールを通じて、いつでも録音された音声データの完全削除を要求できます。"
                )}
              </li>
              <li>
                {t(
                  "Từ chối tính năng ghi âm — tuy nhiên, điều này sẽ khiến bạn không thể sử dụng Voice Lab và Shadowing.",
                  "録音機能を拒否できます — ただし、Voice LabとShadowingは使用できなくなります。"
                )}
              </li>
              <li>
                {t(
                  "Yêu cầu xuất (export) toàn bộ dữ liệu cá nhân của mình ở định dạng máy có thể đọc được (machine-readable format).",
                  "機械可読形式で個人データの完全エクスポートを要求できます。"
                )}
              </li>
            </ul>
          </Section>

          <hr className="border-surface-container-high" />

          {/* Section 4 */}
          <Section id="ip" number={4} title={t("Quyền sở hữu trí tuệ", "知的財産権")}>
            <p>
              {t(
                <>Toàn bộ nội dung trên nền tảng VietImmerse, bao gồm nhưng không giới hạn ở: các bài học, giáo trình, audio mẫu phát âm, hình ảnh minh họa, video, thiết kế giao diện, mã nguồn, logo, nhãn hiệu, và các tài liệu đào tạo, đều thuộc quyền sở hữu trí tuệ của <strong>VietImmerse</strong> hoặc các đối tác cấp phép nội dung cho nền tảng.</>,
                <>レッスン、カリキュラム、発音サンプル音声、イラスト、動画、UIデザイン、ソースコード、ロゴ、商標、教材を含むVietImmerseプラットフォーム上のすべてのコンテンツは、<strong>VietImmerse</strong>またはコンテンツライセンスパートナーの知的財産です。</>
              )}
            </p>
            <p>{t("Người dùng được cấp quyền:", "ユーザーには以下の権利が付与されます：")}</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                {t(
                  <><strong>Sử dụng cá nhân, phi thương mại:</strong> Truy cập và sử dụng nội dung khóa học cho mục đích học tập cá nhân.</>,
                  <><strong>個人的・非商用利用：</strong> 個人学習目的でコース内容にアクセスし使用すること。</>
                )}
              </li>
              <li>
                {t(
                  <><strong>Không được sao chép:</strong> Nghiêm cấm sao chép, tái xuất bản, phân phối, bán lại, hoặc tạo các sản phẩm phái sinh từ nội dung của nền tảng dưới bất kỳ hình thức nào.</>,
                  <><strong>複製禁止：</strong> プラットフォームのコンテンツを複製、再出版、配布、転売、または派生物を作成することは厳禁です。</>
                )}
              </li>
              <li>
                {t(
                  <><strong>Không được ghi hình/ghi âm lại:</strong> Nghiêm cấm screen-recording, screen-capture hoặc ghi âm lại các bài học và audio mẫu để chia sẻ hoặc sử dụng ngoài nền tảng.</>,
                  <><strong>録画・録音禁止：</strong> レッスンやサンプル音声の画面録画、スクリーンキャプチャ、再録音をして共有またはプラットフォーム外で使用することは厳禁です。</>
                )}
              </li>
            </ul>
            <p>
              {t(
                <>Mọi hành vi vi phạm quyền sở hữu trí tuệ có thể bị truy cứu trách nhiệm pháp lý theo quy định của <strong>Luật Sở hữu trí tuệ Việt Nam (2005, sửa đổi 2022)</strong> và các điều ước quốc tế liên quan mà Việt Nam là thành viên.</>,
                <>知的財産権の侵害は、<strong>ベトナム知的財産法（2005年、2022年改正）</strong>およびベトナムが加盟する関連国際条約に基づき法的責任を追及される可能性があります。</>
              )}
            </p>
          </Section>

          <hr className="border-surface-container-high" />

          {/* Section 5 */}
          <Section id="conduct" number={5} title={t("Quy tắc ứng xử", "行動規範")}>
            <p>
              {t(
                <>VietImmerse xây dựng một cộng đồng học tập an toàn, tôn trọng và hòa nhập. Khi tham gia các tính năng cộng đồng, bao gồm <strong>Matching</strong> (Ghép cặp học tập) và các kênh trao đổi, bạn đồng ý tuân thủ các quy tắc sau:</>,
                <>VietImmerseは安全で尊重し合える包括的な学習コミュニティを構築しています。<strong>マッチング</strong>（学習パートナー機能）やコミュニケーションチャンネルなどのコミュニティ機能に参加する際、以下の規則に同意するものとします：</>
              )}
            </p>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              {t("5.1. Hành vi bị nghiêm cấm", "5.1. 禁止行為")}
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                {t(
                  "Quấy rối, đe dọa, phân biệt đối xử hoặc sử dụng ngôn ngữ thù địch (hate speech) dựa trên chủng tộc, giới tính, tôn giáo, quốc tịch, khuynh hướng tính dục hoặc bất kỳ đặc điểm cá nhân nào.",
                  "人種、性別、宗教、国籍、性的指向、またはその他の個人的特性に基づくハラスメント、脅迫、差別、またはヘイトスピーチ。"
                )}
              </li>
              <li>
                {t(
                  "Gửi nội dung khiêu dâm, bạo lực, hoặc vi phạm pháp luật Việt Nam.",
                  "ポルノ、暴力、またはベトナム法に違反するコンテンツの送信。"
                )}
              </li>
              <li>
                {t(
                  "Spam, quảng cáo, hoặc sử dụng tính năng ghép cặp cho mục đích ngoài học tập (bao gồm nhưng không giới hạn: mua bán, tiếp thị, lừa đảo, hoặc hẹn hò).",
                  "スパム、広告、または学習以外の目的（売買、マーケティング、詐欺、出会い系を含む）でマッチング機能を使用すること。"
                )}
              </li>
              <li>
                {t(
                  "Mạo danh người khác hoặc cung cấp thông tin hồ sơ sai lệch.",
                  "他人になりすます、または虚偽のプロフィール情報を提供すること。"
                )}
              </li>
              <li>
                {t(
                  "Cố tình phá hoại trải nghiệm học tập của người dùng khác.",
                  "他のユーザーの学習体験を意図的に妨害すること。"
                )}
              </li>
            </ul>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              {t("5.2. Xử lý vi phạm", "5.2. 違反の処理")}
            </h3>
            <p>
              {t(
                "VietImmerse áp dụng hệ thống xử lý vi phạm theo cấp độ tăng dần:",
                "VietImmerseは段階的な違反処理システムを適用します："
              )}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <div className="p-4 rounded-xl bg-secondary-container/30 border border-secondary/15 text-center">
                <span className="material-symbols-outlined text-secondary text-2xl mb-1 block">
                  info
                </span>
                <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                  {t("Lần 1", "1回目")}
                </p>
                <p className="text-sm text-on-surface-variant">
                  {t("Cảnh cáo bằng văn bản", "書面による警告")}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-error-container/20 border border-error/15 text-center">
                <span className="material-symbols-outlined text-error text-2xl mb-1 block">
                  block
                </span>
                <p className="text-xs font-bold text-error uppercase tracking-wider mb-1">
                  {t("Lần 2", "2回目")}
                </p>
                <p className="text-sm text-on-surface-variant">
                  {t("Tạm khóa tài khoản 30 ngày", "アカウント30日間停止")}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-error-container/30 border border-error/20 text-center">
                <span className="material-symbols-outlined text-error text-2xl mb-1 block">
                  dangerous
                </span>
                <p className="text-xs font-bold text-error uppercase tracking-wider mb-1">
                  {t("Lần 3", "3回目")}
                </p>
                <p className="text-sm text-on-surface-variant">
                  {t("Khóa vĩnh viễn, không hoàn tiền", "永久停止、返金なし")}
                </p>
              </div>
            </div>
            <p className="mt-4">
              {t(
                "Đối với các vi phạm nghiêm trọng (quấy rối tình dục, đe dọa bạo lực, hoạt động bất hợp pháp), VietImmerse có quyền khóa tài khoản vĩnh viễn ngay lập tức mà không cần cảnh báo trước, đồng thời có thể phối hợp với cơ quan chức năng nếu cần thiết.",
                "重大な違反（セクハラ、暴力の脅迫、違法行為）の場合、VietImmerseは事前の警告なしに直ちにアカウントを永久停止する権利を有し、必要に応じて当局と協力する場合があります。"
              )}
            </p>
          </Section>

          <hr className="border-surface-container-high" />

          {/* Section 6 */}
          <Section
            id="liability"
            number={6}
            title={t("Giới hạn trách nhiệm và Sửa đổi điều khoản", "責任の制限と規約の改定")}
          >
            <h3 className="font-bold text-primary text-lg mt-2 mb-2">
              {t("6.1. Giới hạn trách nhiệm", "6.1. 責任の制限")}
            </h3>
            <p>
              {t(
                <>VietImmerse cung cấp dịch vụ trên cơ sở &ldquo;nguyên trạng&rdquo; (as-is) và &ldquo;sẵn có&rdquo; (as-available). Chúng tôi nỗ lực duy trì chất lượng dịch vụ cao nhất nhưng <strong>không đảm bảo</strong>:</>,
                <>VietImmerseは「現状のまま」（as-is）および「利用可能な限り」（as-available）でサービスを提供します。最高品質のサービスを維持するよう努めますが、以下を<strong>保証するものではありません</strong>：</>
              )}
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                {t(
                  "Dịch vụ sẽ hoạt động liên tục, không gián đoạn hoặc không có lỗi.",
                  "サービスが中断なく、エラーなく継続的に動作すること。"
                )}
              </li>
              <li>
                {t(
                  "Kết quả chấm điểm phát âm của AI là tuyệt đối chính xác — đây là công cụ hỗ trợ học tập, không thay thế giáo viên chuyên nghiệp.",
                  "AIの発音採点結果が絶対的に正確であること — これは学習支援ツールであり、専門の教師に代わるものではありません。"
                )}
              </li>
              <li>
                {t(
                  "Chất lượng kết nối khi ghép cặp phụ thuộc vào mạng Internet của người dùng.",
                  "マッチング時の接続品質はユーザーのインターネット環境に依存します。"
                )}
              </li>
            </ul>
            <p>
              {t(
                <>Trong mọi trường hợp, tổng trách nhiệm pháp lý tối đa của VietImmerse đối với bạn sẽ không vượt quá số tiền bạn đã thanh toán cho dịch vụ trong <strong>12 tháng</strong> gần nhất trước thời điểm phát sinh tranh chấp.</>,
                <>いかなる場合も、VietImmerseの最大法的責任は、紛争発生前の直近<strong>12か月間</strong>にサービスに対して支払われた金額を超えないものとします。</>
              )}
            </p>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              {t("6.2. Sửa đổi điều khoản", "6.2. 規約の改定")}
            </h3>
            <p>
              {t(
                "VietImmerse có quyền cập nhật hoặc sửa đổi Điều khoản sử dụng này vào bất kỳ thời điểm nào. Khi có sửa đổi quan trọng, chúng tôi sẽ:",
                "VietImmerseは、いつでも本利用規約を更新または改定する権利を有します。重要な変更がある場合："
              )}
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                {t(
                  <>Thông báo cho bạn qua <strong>email</strong> và/hoặc <strong>thông báo trên ứng dụng</strong> ít nhất <strong>15 ngày</strong> trước khi thay đổi có hiệu lực.</>,
                  <>変更が有効になる少なくとも<strong>15日前</strong>に<strong>メール</strong>および/またはア<strong>プリ内通知</strong>でお知らせします。</>
                )}
              </li>
              <li>
                {t(
                  "Cập nhật ngày \u201cCó hiệu lực từ\u201d ở đầu trang này.",
                  "本ページ上部の「発効日」を更新します。"
                )}
              </li>
              <li>
                {t(
                  "Lưu trữ các phiên bản trước đó để bạn có thể tra cứu lịch sử thay đổi.",
                  "変更履歴を確認できるよう、以前のバージョンを保存します。"
                )}
              </li>
            </ul>
            <p>
              {t(
                "Việc bạn tiếp tục sử dụng dịch vụ sau ngày thay đổi có hiệu lực đồng nghĩa với việc bạn chấp nhận phiên bản Điều khoản mới. Nếu bạn không đồng ý với các thay đổi, bạn có quyền ngừng sử dụng dịch vụ và yêu cầu xóa tài khoản.",
                "変更発効日以降にサービスの利用を継続することは、新しい規約に同意したことを意味します。変更に同意されない場合は、サービスの利用を中止し、アカウントの削除を要求する権利があります。"
              )}
            </p>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              {t("6.3. Luật áp dụng và Giải quyết tranh chấp", "6.3. 準拠法と紛争解決")}
            </h3>
            <p>
              {t(
                <>Điều khoản này được điều chỉnh bởi pháp luật <strong>Cộng hòa Xã hội Chủ nghĩa Việt Nam</strong>. Mọi tranh chấp phát sinh sẽ được giải quyết thông qua thương lượng thiện chí giữa các bên. Trong trường hợp không đạt được thỏa thuận, tranh chấp sẽ được đưa ra <strong>Tòa án nhân dân có thẩm quyền tại Hà Nội</strong> để giải quyết.</>,
                <>本規約は<strong>ベトナム社会主義共和国</strong>の法律に準拠します。紛争が発生した場合、まず当事者間で誠意を持って交渉します。合意に至らない場合は、<strong>ハノイの管轄人民裁判所</strong>に解決を委ねます。</>
              )}
            </p>
          </Section>
        </div>

        {/* Contact Section */}
        <div className="mt-16 p-8 bg-surface-container-lowest rounded-2xl border border-surface-container-high text-center">
          <span className="material-symbols-outlined text-primary text-3xl mb-3 block">
            support_agent
          </span>
          <h3 className="font-headline font-bold text-primary text-lg mb-2">
            {t("Bạn có câu hỏi?", "ご質問がありますか？")}
          </h3>
          <p className="text-sm text-on-surface-variant mb-4 max-w-lg mx-auto">
            {t(
              "Nếu bạn có bất kỳ thắc mắc nào về Điều khoản sử dụng, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.",
              "利用規約についてご不明な点がございましたら、サポートチームまでお問い合わせください。"
            )}
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
            {t("Quay lại trang chủ", "ホームに戻る")}
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-surface-container-high py-8 px-6 mt-8">
        <p className="text-center text-xs text-on-surface-variant">
          © {new Date().getFullYear()} VietImmerse. {t("Bảo lưu mọi quyền.", "全著作権所有。")}
        </p>
      </footer>
    </div>
  );
}
