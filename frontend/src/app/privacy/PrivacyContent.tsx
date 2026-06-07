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

export default function PrivacyContent() {
  const { t } = useLanguage();

  const TOC_ITEMS = [
    { id: "collection", label: t("Thu thập thông tin", "情報の収集") },
    { id: "voice-data", label: t("Dữ liệu Giọng nói & Microphone", "音声データとマイク") },
    { id: "usage-purpose", label: t("Mục đích sử dụng dữ liệu", "データの使用目的") },
    { id: "third-party", label: t("Chia sẻ thông tin với bên thứ ba", "第三者との情報共有") },
    { id: "user-rights", label: t("Quyền của người dùng", "ユーザーの権利") },
    { id: "contact", label: t("Liên hệ", "お問い合わせ") },
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
            <span className="material-symbols-outlined text-sm">shield</span>
            {t("Bảo mật", "セキュリティ")}
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-primary mb-4">
            {t("Chính sách Quyền riêng tư", "プライバシーポリシー")}
          </h1>
          <p className="text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            {t(
              "VietImmerse cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của bạn. Tài liệu này giải thích chi tiết cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin khi bạn sử dụng nền tảng.",
              "VietImmerseはお客様のプライバシーと個人データの保護に取り組んでいます。本文書では、プラットフォーム利用時の情報の収集、使用、保存、保護方法について詳しく説明します。"
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
          <Section id="collection" number={1} title={t("Thu thập thông tin", "情報の収集")}>
            <p>
              {t(
                <>Khi bạn đăng ký và sử dụng <strong>VietImmerse</strong>, chúng tôi thu thập các loại thông tin sau đây nhằm mục đích cung cấp và cải thiện dịch vụ:</>,
                <><strong>VietImmerse</strong>にご登録・ご利用いただく際、サービスの提供と改善を目的として、以下の種類の情報を収集します：</>
              )}
            </p>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              {t("1.1. Thông tin tài khoản", "1.1. アカウント情報")}
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                {t(
                  <><strong>Thông tin đăng ký:</strong> Họ tên, địa chỉ email, mật khẩu (được mã hóa), quốc tịch, và ngôn ngữ mẹ đẻ.</>,
                  <><strong>登録情報：</strong> 氏名、メールアドレス、パスワード（暗号化済み）、国籍、母語。</>
                )}
              </li>
              <li>
                {t(
                  <><strong>Thông tin hồ sơ:</strong> Ảnh đại diện (nếu cung cấp), mô tả bản thân, sở thích học tập, và mục tiêu ngôn ngữ.</>,
                  <><strong>プロフィール情報：</strong> プロフィール写真（提供された場合）、自己紹介、学習の興味、言語目標。</>
                )}
              </li>
              <li>
                {t(
                  <><strong>Thông tin thiết bị:</strong> Loại thiết bị, hệ điều hành, phiên bản trình duyệt, địa chỉ IP (được ẩn danh hóa sau 30 ngày), và múi giờ.</>,
                  <><strong>デバイス情報：</strong> デバイスの種類、OS、ブラウザバージョン、IPアドレス（30日後に匿名化）、タイムゾーン。</>
                )}
              </li>
            </ul>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              {t("1.2. Dữ liệu học tập", "1.2. 学習データ")}
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                {t(
                  <><strong>Tiến độ bài học:</strong> Các bài học đã hoàn thành, thời gian học, số lần truy cập, và tỷ lệ hoàn thành từng chương.</>,
                  <><strong>レッスン進捗：</strong> 完了したレッスン、学習時間、アクセス回数、各章の完了率。</>
                )}
              </li>
              <li>
                {t(
                  <><strong>Điểm số và đánh giá:</strong> Kết quả bài kiểm tra, điểm phát âm từ AI, lịch sử điểm theo thời gian.</>,
                  <><strong>スコアと評価：</strong> テスト結果、AIによる発音スコア、時系列のスコア履歴。</>
                )}
              </li>
              <li>
                {t(
                  <><strong>Tương tác Matching:</strong> Lịch sử ghép cặp, đánh giá đối tác, thời lượng phiên luyện tập cùng đối tác.</>,
                  <><strong>マッチングの記録：</strong> ペアリング履歴、パートナー評価、練習セッションの時間。</>
                )}
              </li>
              <li>
                {t(
                  <><strong>Hoạt động Shadowing:</strong> Số lần luyện tập, các câu đã luyện, và điểm so sánh phát âm với mẫu chuẩn.</>,
                  <><strong>Shadowing活動：</strong> 練習回数、練習した文、標準モデルとの発音比較スコア。</>
                )}
              </li>
            </ul>

            <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-4 mt-4">
              <p className="text-sm flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-lg flex-shrink-0 mt-0.5">
                  info
                </span>
                <span>
                  {t(
                    <>Chúng tôi <strong>không</strong> thu thập thông tin tài chính (số thẻ tín dụng, tài khoản ngân hàng). Mọi giao dịch thanh toán được xử lý hoàn toàn bởi đối tác cổng thanh toán bên thứ ba đã được chứng nhận PCI-DSS.</>,
                    <>金融情報（クレジットカード番号、銀行口座）は<strong>収集しません</strong>。すべての決済処理はPCI-DSS認証済みの第三者決済パートナーが行います。</>
                  )}
                </span>
              </p>
            </div>
          </Section>

          <hr className="border-surface-container-high" />

          {/* Section 2 */}
          <Section
            id="voice-data"
            number={2}
            title={t("Dữ liệu Giọng nói & Microphone", "音声データとマイク")}
          >
            <div className="bg-error-container/30 border border-error/20 rounded-xl p-5 mb-4">
              <p className="text-sm font-bold text-error flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-lg">
                  priority_high
                </span>
                {t("Mục cực kỳ quan trọng — Vui lòng đọc kỹ", "非常に重要 — よくお読みください")}
              </p>
              <p className="text-sm text-on-surface-variant">
                {t(
                  "VietImmerse yêu cầu quyền truy cập microphone để phục vụ các tính năng luyện phát âm. Dưới đây là toàn bộ cam kết minh bạch của chúng tôi về việc xử lý dữ liệu giọng nói.",
                  "VietImmerseは発音練習機能のためにマイクアクセス権限を必要とします。以下は音声データの処理に関する透明性のある取り組みの全容です。"
                )}
              </p>
            </div>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              {t("2.1. Vì sao cần quyền truy cập Microphone?", "2.1. なぜマイクアクセスが必要ですか？")}
            </h3>
            <p>
              {t(
                <>Ứng dụng yêu cầu quyền truy cập microphone của thiết bị <strong>duy nhất</strong> để phục vụ hai tính năng cốt lõi:</>,
                <>アプリは2つのコア機能のために<strong>のみ</strong>デバイスのマイクアクセスを要求します：</>
              )}
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                {t(
                  <><strong>Voice Lab (Phòng luyện nói):</strong> Ghi âm phát âm của bạn để hệ thống AI phân tích thanh điệu, ngữ điệu và độ chính xác theo chuẩn tiếng Việt miền Bắc.</>,
                  <><strong>Voice Lab（発話練習室）：</strong> 北部ベトナム語の基準に基づき、AIシステムが声調、イントネーション、正確性を分析するために発音を録音します。</>
                )}
              </li>
              <li>
                {t(
                  <><strong>Shadowing (Luyện phát âm theo mẫu):</strong> So sánh giọng nói thực tế của bạn với mẫu phát âm chuẩn để đưa ra phản hồi trực quan và điểm số chi tiết.</>,
                  <><strong>Shadowing（発音模倣練習）：</strong> 標準発音モデルと実際の音声を比較し、視覚的なフィードバックと詳細なスコアを提供します。</>
                )}
              </li>
            </ul>
            <p>
              {t(
                <>Microphone <strong>chỉ được kích hoạt</strong> khi bạn chủ động nhấn nút ghi âm trong các tính năng trên. Ứng dụng <strong>không bao giờ</strong> ghi âm ngầm (background recording) hay kích hoạt microphone ngoài phạm vi tính năng học tập.</>,
                <>マイクは上記機能で録音ボタンを<strong>能動的に押した場合にのみ起動</strong>されます。アプリは学習機能の範囲外でバックグラウンド録音やマイクの起動を<strong>一切行いません</strong>。</>
              )}
            </p>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              {t("2.2. Dữ liệu âm thanh được xử lý như thế nào?", "2.2. 音声データはどのように処理されますか？")}
            </h3>
            <p>
              {t(
                "Khi bạn thực hiện ghi âm, quy trình xử lý dữ liệu diễn ra như sau:",
                "録音を行うと、データ処理は以下の手順で行われます："
              )}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <div className="p-4 rounded-xl bg-primary-container/20 border border-primary/15 text-center">
                <span className="material-symbols-outlined text-primary text-2xl mb-1 block">
                  mic
                </span>
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  {t("Bước 1", "ステップ1")}
                </p>
                <p className="text-sm text-on-surface-variant">
                  {t("Ghi âm giọng nói qua microphone thiết bị", "デバイスのマイクで音声を録音")}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-secondary-container/30 border border-secondary/15 text-center">
                <span className="material-symbols-outlined text-secondary text-2xl mb-1 block">
                  cloud_upload
                </span>
                <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                  {t("Bước 2", "ステップ2")}
                </p>
                <p className="text-sm text-on-surface-variant">
                  {t("Gửi đến máy chủ AI để phân tích & chấm điểm", "AIサーバーに送信して分析・採点")}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-tertiary-container/30 border border-tertiary/15 text-center">
                <span className="material-symbols-outlined text-tertiary text-2xl mb-1 block">
                  delete_sweep
                </span>
                <p className="text-xs font-bold text-tertiary uppercase tracking-wider mb-1">
                  {t("Bước 3", "ステップ3")}
                </p>
                <p className="text-sm text-on-surface-variant">
                  {t("Xóa bản ghi gốc sau khi xử lý xong", "処理完了後に元の録音を削除")}
                </p>
              </div>
            </div>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              {t("2.3. Cam kết bảo mật dữ liệu giọng nói", "2.3. 音声データのセキュリティに関する取り組み")}
            </h3>
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-4">
              <p className="text-sm mb-2">{t("VietImmerse cam kết tuyệt đối:", "VietImmerseは以下を固く約束します：")}</p>
              <ul className="list-disc list-inside space-y-2 ml-2 text-sm">
                <li>
                  {t(
                    <>Dữ liệu âm thanh <strong>chỉ</strong> được gửi đến máy chủ (hoặc API AI bên thứ 3 như Google Cloud Speech, OpenAI Whisper) <strong>để phân tích ngữ âm và chấm điểm phát âm</strong>, không dùng cho bất kỳ mục đích nào khác.</>,
                    <>音声データはサーバー（またはGoogle Cloud Speech、OpenAI Whisperなどの第三者AI API）に<strong>音声分析と発音採点の目的でのみ</strong>送信され、他の目的には使用されません。</>
                  )}
                </li>
                <li>
                  {t(
                    <><strong>Không</strong> sử dụng giọng nói để định danh cá nhân (voice fingerprinting), xây dựng hồ sơ sinh trắc học (biometric profiling), hoặc giám sát người dùng.</>,
                    <>音声指紋認証、生体認証プロファイリング、またはユーザー監視のために音声を<strong>使用しません</strong>。</>
                  )}
                </li>
                <li>
                  {t(
                    <><strong>Không</strong> sử dụng giọng nói để tạo deepfake, mạo danh, hoặc bất kỳ mục đích phi đạo đức nào.</>,
                    <>ディープフェイク、なりすまし、またはその他の非倫理的な目的に音声を<strong>使用しません</strong>。</>
                  )}
                </li>
                <li>
                  {t(
                    <><strong>Không</strong> bán, cho thuê, hoặc chia sẻ bản ghi âm gốc cho bên thứ ba vì mục đích thương mại.</>,
                    <>商業目的で元の録音を第三者に<strong>販売、貸与、共有しません</strong>。</>
                  )}
                </li>
                <li>
                  {t(
                    <>Bản ghi âm gốc được mã hóa bằng <strong>AES-256</strong> khi truyền tải và lưu trữ, và sẽ được <strong>xóa tự động trong vòng 90 ngày</strong> kể từ ngày ghi âm, trừ khi bạn yêu cầu xóa sớm hơn.</>,
                    <>元の録音は転送時と保存時に<strong>AES-256</strong>で暗号化され、早期削除を要求しない限り、録音日から<strong>90日以内に自動削除</strong>されます。</>
                  )}
                </li>
              </ul>
            </div>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              {t("2.4. Quyền từ chối", "2.4. 拒否する権利")}
            </h3>
            <p>
              {t(
                <>Bạn hoàn toàn có quyền từ chối cấp quyền microphone. Tuy nhiên, điều này đồng nghĩa với việc bạn sẽ không thể sử dụng các tính năng <strong>Voice Lab</strong> và <strong>Shadowing</strong>. Các tính năng khác của nền tảng (bài học lý thuyết, Matching, v.v.) vẫn hoạt động bình thường.</>,
                <>マイクアクセスを拒否する権利があります。ただし、<strong>Voice Lab</strong>と<strong>Shadowing</strong>機能は使用できなくなります。プラットフォームの他の機能（理論レッスン、マッチングなど）は通常通り動作します。</>
              )}
            </p>
          </Section>

          <hr className="border-surface-container-high" />

          {/* Section 3 */}
          <Section
            id="usage-purpose"
            number={3}
            title={t("Mục đích sử dụng dữ liệu", "データの使用目的")}
          >
            <p>
              {t(
                "Toàn bộ dữ liệu được thu thập từ người dùng chỉ phục vụ các mục đích cụ thể, hợp pháp và minh bạch sau đây:",
                "ユーザーから収集されたすべてのデータは、以下の具体的、合法的、かつ透明な目的のみに使用されます："
              )}
            </p>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              {t("3.1. Cá nhân hóa lộ trình học tập", "3.1. 学習ルートのパーソナライズ")}
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>{t("Phân tích tiến độ học tập và điểm mạnh/yếu của bạn để đề xuất bài học, cấp độ và nội dung phù hợp nhất.", "学習進捗と強み・弱みを分析し、最適なレッスン、レベル、コンテンツを提案します。")}</li>
              <li>{t("Điều chỉnh độ khó của bài tập dựa trên lịch sử hiệu suất, giúp tối ưu hóa quá trình tiếp thu ngôn ngữ.", "パフォーマンス履歴に基づいて演習の難易度を調整し、言語習得を最適化します。")}</li>
              <li>{t("Gợi ý thời gian học tập phù hợp dựa trên thói quen sử dụng ứng dụng của bạn.", "アプリの使用習慣に基づいて最適な学習時間を提案します。")}</li>
            </ul>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              {t("3.2. Cải thiện hệ thống AI chấm điểm", "3.2. AI採点システムの改善")}
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                {t(
                  <>Dữ liệu phát âm sau khi được <strong>ẩn danh hóa hoàn toàn</strong> (anonymized) có thể được sử dụng để huấn luyện và nâng cao độ chính xác của mô hình AI nhận dạng giọng nói.</>,
                  <><strong>完全に匿名化</strong>された発音データは、音声認識AIモデルの精度向上のためのトレーニングに使用される場合があります。</>
                )}
              </li>
              <li>
                {t(
                  <>Quá trình ẩn danh hóa đảm bảo <strong>không thể liên kết ngược dữ liệu với danh tính cá nhân</strong> của bất kỳ người dùng nào.</>,
                  <>匿名化プロセスにより、<strong>データを個人の身元に逆リンクすることは不可能</strong>です。</>
                )}
              </li>
              <li>
                {t(
                  "Bạn có quyền từ chối việc sử dụng dữ liệu cho mục đích cải thiện AI thông qua mục \u201cCài đặt quyền riêng tư\u201d trong tài khoản.",
                  "アカウントの「プライバシー設定」を通じて、AI改善目的でのデータ使用を拒否する権利があります。"
                )}
              </li>
            </ul>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              {t("3.3. Cải thiện hệ thống ghép cặp (Matching)", "3.3. マッチングシステムの改善")}
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>{t("Sử dụng thông tin hồ sơ, sở thích và trình độ ngôn ngữ để ghép cặp bạn với các đối tác học tập tương thích nhất.", "プロフィール情報、興味、言語レベルを使用して、最も相性の良い学習パートナーとマッチングします。")}</li>
              <li>{t("Phân tích đánh giá sau phiên luyện tập để liên tục tối ưu thuật toán ghép cặp.", "練習セッション後の評価を分析し、マッチングアルゴリズムを継続的に最適化します。")}</li>
              <li>
                {t(
                  <>Dữ liệu ghép cặp <strong>không</strong> được sử dụng cho mục đích hẹn hò, quảng cáo, hoặc giới thiệu sản phẩm/dịch vụ bên ngoài nền tảng.</>,
                  <>マッチングデータは出会い系、広告、またはプラットフォーム外の製品・サービスの紹介目的には<strong>使用されません</strong>。</>
                )}
              </li>
            </ul>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              {t("3.4. Vận hành và bảo trì hệ thống", "3.4. システムの運用と保守")}
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>{t("Phát hiện và ngăn chặn gian lận, lạm dụng, hoặc các hoạt động vi phạm Điều khoản sử dụng.", "不正行為、悪用、または利用規約違反の検出と防止。")}</li>
              <li>{t("Giám sát hiệu suất hệ thống, phân tích lỗi, và cải thiện trải nghiệm người dùng tổng thể.", "システムパフォーマンスの監視、エラー分析、全体的なユーザー体験の改善。")}</li>
              <li>{t("Gửi thông báo quan trọng liên quan đến tài khoản, bảo mật, hoặc thay đổi chính sách (không gửi email quảng cáo trừ khi bạn đồng ý).", "アカウント、セキュリティ、またはポリシー変更に関する重要な通知の送信（同意がない限り広告メールは送信しません）。")}</li>
            </ul>
          </Section>

          <hr className="border-surface-container-high" />

          {/* Section 4 */}
          <Section
            id="third-party"
            number={4}
            title={t("Chia sẻ thông tin với bên thứ ba", "第三者との情報共有")}
          >
            <p>
              {t(
                <>VietImmerse <strong>không bán</strong> dữ liệu cá nhân của bạn cho bất kỳ bên thứ ba nào. Chúng tôi chỉ chia sẻ thông tin trong các trường hợp giới hạn sau:</>,
                <>VietImmerseはお客様の個人データを第三者に<strong>販売しません</strong>。以下の限定的なケースでのみ情報を共有します：</>
              )}
            </p>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              {t("4.1. Đối tác cung cấp dịch vụ hạ tầng", "4.1. インフラサービスパートナー")}
            </h3>
            <p>
              {t(
                <>Chúng tôi hợp tác với các nhà cung cấp dịch vụ uy tín để vận hành nền tảng. Dữ liệu được chia sẻ với các đối tác này <strong>chỉ mang tính kỹ thuật</strong> và <strong>đã được ẩn danh hóa</strong> khi có thể:</>,
                <>プラットフォームの運用のために信頼できるサービスプロバイダーと提携しています。これらのパートナーと共有されるデータは<strong>技術的なもののみ</strong>であり、可能な限り<strong>匿名化</strong>されています：</>
              )}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high">
                <p className="text-sm font-bold text-primary mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">cloud</span>
                  {t("Dịch vụ đám mây (Cloud)", "クラウドサービス")}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {t(
                    "Lưu trữ dữ liệu trên hạ tầng đám mây được mã hóa, tuân thủ tiêu chuẩn ISO 27001 và SOC 2.",
                    "ISO 27001およびSOC 2準拠の暗号化クラウドインフラにデータを保存。"
                  )}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high">
                <p className="text-sm font-bold text-primary mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">smart_toy</span>
                  {t("API Trí tuệ Nhân tạo", "AI API")}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {t(
                    "Gửi dữ liệu âm thanh ẩn danh đến API AI để phân tích phát âm. Không gửi kèm thông tin định danh cá nhân.",
                    "匿名化された音声データをAI APIに送信して発音を分析。個人識別情報は送信しません。"
                  )}
                </p>
              </div>
            </div>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              {t("4.2. Cam kết bảo mật với đối tác", "4.2. パートナーとのセキュリティ約束")}
            </h3>
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-4">
              <p className="text-sm mb-2">
                {t("Tất cả đối tác bên thứ ba phải tuân thủ:", "すべての第三者パートナーは以下を遵守する必要があります：")}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2 text-sm">
                <li>
                  {t(
                    <>Ký kết <strong>Thỏa thuận xử lý dữ liệu</strong> (Data Processing Agreement — DPA) ràng buộc pháp lý.</>,
                    <>法的拘束力のある<strong>データ処理契約</strong>（DPA）への署名。</>
                  )}
                </li>
                <li>{t("Chỉ được xử lý dữ liệu theo hướng dẫn cụ thể từ VietImmerse, không được sử dụng cho mục đích riêng.", "VietImmerseからの具体的な指示に従ってのみデータを処理し、自社目的での使用は禁止。")}</li>
                <li>{t("Áp dụng các biện pháp bảo mật kỹ thuật và tổ chức phù hợp với tiêu chuẩn ngành.", "業界標準に準拠した技術的・組織的セキュリティ対策の実施。")}</li>
                <li>{t("Xóa hoặc trả lại dữ liệu khi kết thúc hợp đồng dịch vụ.", "サービス契約終了時のデータ削除または返却。")}</li>
              </ul>
            </div>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              {t("4.3. Yêu cầu pháp lý", "4.3. 法的要件")}
            </h3>
            <p>
              {t(
                <>VietImmerse có thể tiết lộ thông tin cá nhân khi được yêu cầu bởi cơ quan nhà nước có thẩm quyền theo quy định của pháp luật <strong>Cộng hòa Xã hội Chủ nghĩa Việt Nam</strong>, bao gồm nhưng không giới hạn: <strong>Nghị định 13/2023/NĐ-CP</strong> về bảo vệ dữ liệu cá nhân và các văn bản pháp luật liên quan. Trong trường hợp này, chúng tôi sẽ nỗ lực thông báo cho bạn trước (trừ khi bị pháp luật cấm).</>,
                <>VietImmerseは、<strong>ベトナム社会主義共和国</strong>の法律に基づき管轄当局から要求された場合、個人情報を開示する場合があります（<strong>政令13/2023/NĐ-CP</strong>等）。この場合、法律で禁止されていない限り、事前にお知らせするよう努めます。</>
              )}
            </p>
          </Section>

          <hr className="border-surface-container-high" />

          {/* Section 5 */}
          <Section
            id="user-rights"
            number={5}
            title={t("Quyền của người dùng", "ユーザーの権利")}
          >
            <p>
              {t(
                <>Là người dùng của VietImmerse, bạn có đầy đủ các quyền sau đây đối với dữ liệu cá nhân của mình, theo quy định của <strong>Nghị định 13/2023/NĐ-CP</strong>:</>,
                <>VietImmerseのユーザーとして、<strong>政令13/2023/NĐ-CP</strong>に基づき、個人データに関して以下の権利を有します：</>
              )}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="p-4 rounded-xl bg-primary-container/20 border border-primary/15">
                <span className="material-symbols-outlined text-primary text-xl mb-2 block">visibility</span>
                <p className="text-sm font-bold text-primary mb-1">{t("Quyền truy cập", "アクセス権")}</p>
                <p className="text-xs text-on-surface-variant">
                  {t(
                    "Yêu cầu xem toàn bộ dữ liệu cá nhân mà VietImmerse đang lưu trữ về bạn, bao gồm lịch sử học tập, điểm số, và dữ liệu hồ sơ.",
                    "学習履歴、スコア、プロフィールデータを含む、VietImmerseが保存しているすべての個人データの閲覧を要求できます。"
                  )}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-secondary-container/20 border border-secondary/15">
                <span className="material-symbols-outlined text-secondary text-xl mb-2 block">edit_note</span>
                <p className="text-sm font-bold text-secondary mb-1">{t("Quyền chỉnh sửa", "修正権")}</p>
                <p className="text-xs text-on-surface-variant">
                  {t(
                    "Yêu cầu chỉnh sửa thông tin cá nhân không chính xác hoặc không đầy đủ (tên, email, quốc tịch, v.v.).",
                    "不正確または不完全な個人情報（名前、メール、国籍など）の修正を要求できます。"
                  )}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-error-container/20 border border-error/15">
                <span className="material-symbols-outlined text-error text-xl mb-2 block">delete_forever</span>
                <p className="text-sm font-bold text-error mb-1">{t("Quyền xóa dữ liệu", "データ削除権")}</p>
                <p className="text-xs text-on-surface-variant">
                  {t(
                    "Yêu cầu xóa toàn bộ dữ liệu cá nhân, bao gồm hồ sơ tài khoản, lịch sử học tập, bản ghi âm, và điểm số khỏi hệ thống.",
                    "アカウントプロフィール、学習履歴、録音、スコアを含むすべての個人データの削除を要求できます。"
                  )}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-tertiary-container/20 border border-tertiary/15">
                <span className="material-symbols-outlined text-tertiary text-xl mb-2 block">download</span>
                <p className="text-sm font-bold text-tertiary mb-1">{t("Quyền xuất dữ liệu", "データエクスポート権")}</p>
                <p className="text-xs text-on-surface-variant">
                  {t(
                    "Yêu cầu xuất (export) toàn bộ dữ liệu cá nhân ở định dạng máy có thể đọc được (JSON hoặc CSV).",
                    "機械可読形式（JSONまたはCSV）で全個人データのエクスポートを要求できます。"
                  )}
                </p>
              </div>
            </div>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              {t("5.1. Cách thực hiện quyền", "5.1. 権利の行使方法")}
            </h3>
            <p>{t("Để thực hiện bất kỳ quyền nào ở trên, bạn có thể:", "上記の権利を行使するには：")}</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                {t(
                  <>Truy cập mục <strong>&ldquo;Cài đặt quyền riêng tư&rdquo;</strong> trong tài khoản của bạn để tự quản lý dữ liệu.</>,
                  <>アカウントの<strong>「プライバシー設定」</strong>からデータを自己管理できます。</>
                )}
              </li>
              <li>
                {t(
                  <>Gửi yêu cầu qua email <a href="mailto:privacy@vietimmerse.com" className="text-primary font-medium hover:underline">privacy@vietimmerse.com</a> với tiêu đề rõ ràng (ví dụ: &ldquo;Yêu cầu xóa dữ liệu&rdquo;).</>,
                  <>明確な件名（例：「データ削除リクエスト」）で<a href="mailto:privacy@vietimmerse.com" className="text-primary font-medium hover:underline">privacy@vietimmerse.com</a>にメールを送信してください。</>
                )}
              </li>
            </ul>

            <h3 className="font-bold text-primary text-lg mt-6 mb-2">
              {t("5.2. Thời gian xử lý", "5.2. 処理時間")}
            </h3>
            <p>
              {t(
                <>Chúng tôi cam kết phản hồi và xử lý mọi yêu cầu liên quan đến quyền của bạn trong vòng <strong>15 ngày làm việc</strong> kể từ ngày nhận được yêu cầu hợp lệ. Trong trường hợp yêu cầu phức tạp, thời gian xử lý có thể kéo dài thêm <strong>tối đa 15 ngày</strong>, và bạn sẽ được thông báo trước.</>,
                <>有効なリクエストを受領してから<strong>15営業日以内</strong>に対応・処理することを約束します。複雑なリクエストの場合、処理時間が<strong>最大15日間</strong>延長される場合があり、事前にお知らせします。</>
              )}
            </p>

            <div className="bg-error-container/30 border border-error/20 rounded-xl p-4 mt-4">
              <p className="text-sm font-medium text-on-error-container flex items-start gap-2">
                <span className="material-symbols-outlined text-error text-lg flex-shrink-0 mt-0.5">
                  warning
                </span>
                <span>
                  {t(
                    <>
                      <strong>Lưu ý:</strong> Việc xóa toàn bộ dữ liệu là <strong>không thể hoàn tác</strong>. Sau khi xóa, bạn sẽ mất toàn bộ lịch sử học tập, điểm số, và tiến độ. Hãy cân nhắc kỹ trước khi gửi yêu cầu.
                    </>,
                    <>
                      <strong>注意：</strong> すべてのデータの削除は<strong>元に戻せません</strong>。削除後、学習履歴、スコア、進捗はすべて失われます。リクエストを送信する前に十分ご検討ください。
                    </>
                  )}
                </span>
              </p>
            </div>
          </Section>

          <hr className="border-surface-container-high" />

          {/* Section 6 */}
          <Section id="contact" number={6} title={t("Liên hệ", "お問い合わせ")}>
            <p>
              {t(
                "Nếu bạn có bất kỳ câu hỏi, thắc mắc hoặc khiếu nại nào liên quan đến Chính sách Quyền riêng tư này, vui lòng liên hệ với chúng tôi qua các kênh sau:",
                "本プライバシーポリシーに関するご質問、お問い合わせ、苦情がございましたら、以下のチャンネルよりご連絡ください："
              )}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high">
                <p className="text-sm font-bold text-primary mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">mail</span>
                  {t("Email hỗ trợ chung", "一般サポートメール")}
                </p>
                <a href="mailto:support@vietimmerse.com" className="text-sm text-primary hover:underline">
                  support@vietimmerse.com
                </a>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high">
                <p className="text-sm font-bold text-primary mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">shield</span>
                  {t("Email quyền riêng tư", "プライバシーメール")}
                </p>
                <a href="mailto:privacy@vietimmerse.com" className="text-sm text-primary hover:underline">
                  privacy@vietimmerse.com
                </a>
              </div>
            </div>

            <p className="mt-4">
              {t(
                <>Chúng tôi cam kết phản hồi mọi liên hệ trong vòng <strong>3 ngày làm việc</strong>. Đối với các vấn đề khẩn cấp liên quan đến bảo mật dữ liệu, vui lòng ghi rõ <strong>&ldquo;KHẨN CẤP&rdquo;</strong> trong tiêu đề email.</>,
                <>すべてのお問い合わせに<strong>3営業日以内</strong>に対応することを約束します。データセキュリティに関する緊急の問題については、メールの件名に<strong>「緊急」</strong>と明記してください。</>
              )}
            </p>

            <div className="bg-primary-container/20 border border-primary/15 rounded-xl p-4 mt-4">
              <p className="text-sm flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-lg flex-shrink-0 mt-0.5">
                  gavel
                </span>
                <span>
                  {t(
                    <>Chính sách này được điều chỉnh bởi pháp luật <strong>Cộng hòa Xã hội Chủ nghĩa Việt Nam</strong> và tuân thủ <strong>Nghị định 13/2023/NĐ-CP</strong> về bảo vệ dữ liệu cá nhân. VietImmerse có quyền cập nhật Chính sách này và sẽ thông báo cho bạn ít nhất <strong>15 ngày trước</strong> khi thay đổi có hiệu lực.</>,
                    <>本ポリシーは<strong>ベトナム社会主義共和国</strong>の法律に準拠し、個人データ保護に関する<strong>政令13/2023/NĐ-CP</strong>を遵守します。VietImmerseは本ポリシーを更新する権利を有し、変更が有効になる少なくとも<strong>15日前</strong>にお知らせします。</>
                  )}
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
            {t("Cam kết của chúng tôi", "私たちの約束")}
          </h3>
          <p className="text-sm text-on-surface-variant mb-4 max-w-lg mx-auto">
            {t(
              "VietImmerse luôn đặt quyền riêng tư của bạn lên hàng đầu. Chúng tôi liên tục cập nhật các biện pháp bảo mật để đảm bảo dữ liệu của bạn luôn được bảo vệ an toàn.",
              "VietImmerseは常にお客様のプライバシーを最優先しています。お客様のデータが常に安全に保護されるよう、セキュリティ対策を継続的に更新しています。"
            )}
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
