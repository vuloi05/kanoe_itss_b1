// ─── Types ────────────────────────────────────────────────────
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  categoryIcon: string;
  categoryColor: string;
  gradientFrom: string;
  gradientTo: string;
  readTime: string;
  /** HTML string rendered inside the detail page prose block */
  bodyHtml: string;
}

// ─── Inline SVG Icons ─────────────────────────────────────────
// bodyHtml is rendered via dangerouslySetInnerHTML (raw HTML string),
// so React components cannot be embedded. These inline SVG helpers
// keep the design consistent with the VietImmerse brand using CSS
// custom properties for color.
const IC_ATTR =
  'class="inline w-5 h-5 mr-0.5 align-text-bottom" style="color:var(--on-surface-variant)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"';

const iconGhost = `<svg ${IC_ATTR}><path d="M12 2C7.6 2 4 5.6 4 10v12l3-2 2 2 2-2 2 2 2-2 2 2 3-2V10c0-4.4-3.6-8-8-8Zm-2 9a1.5 1.5 0 0 1 0-3 1.5 1.5 0 0 1 0 3Zm4 0a1.5 1.5 0 0 1 0-3 1.5 1.5 0 0 1 0 3Z"/></svg>`;

const iconMother = `<svg ${IC_ATTR}><circle cx="12" cy="8" r="4"/><path d="M20 21v-2c0-2.2-3.6-4-8-4s-8 1.8-8 4v2h16Z"/></svg>`;

const iconEllipsis = `<svg ${IC_ATTR}><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>`;

const iconTomb = `<svg ${IC_ATTR}><path d="M10 2a2 2 0 0 0-2 2v16h8V4a2 2 0 0 0-2-2h-4Zm2 4v3h2v2h-2v3h-2v-3H8V9h2V6h2Z"/><path d="M5 22h14v-2H5v2Z"/></svg>`;

const iconHorse = `<svg ${IC_ATTR}><path d="M18 3h-2l-1 2-4-1c-1.5 0-3 1.5-3 3v4c0 1.5 1 2.5 2 3l-2 4v2h2l2-4 2 4h2v-2l-2-4c1-.5 2-1.5 2-3V7l2-1V3Z"/><circle cx="13" cy="8" r="1"/></svg>`;

const iconRice = `<svg ${IC_ATTR}><path d="M7 6c4 0 7 3 7 7H7V6Z"/><path d="M17 6c-4 0-7 3-7 7h7V6Z"/><rect x="11" y="13" width="2" height="9"/></svg>`;

// Additional icons for the Shadowing article
const iconMic = `<svg ${IC_ATTR}><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"/><path d="M19 11a7 7 0 0 1-14 0H3a9 9 0 0 0 8 8.94V22h2v-2.06A9 9 0 0 0 21 11h-2Z"/></svg>`;

const iconWaveform = `<svg ${IC_ATTR}><rect x="3" y="10" width="2" height="4" rx="1"/><rect x="7" y="6" width="2" height="12" rx="1"/><rect x="11" y="3" width="2" height="18" rx="1"/><rect x="15" y="8" width="2" height="8" rx="1"/><rect x="19" y="10" width="2" height="4" rx="1"/></svg>`;

const iconBrain = `<svg ${IC_ATTR}><path d="M12 2a4 4 0 0 0-3.46 2A4 4 0 0 0 4 8c0 .74.2 1.44.56 2.04A4 4 0 0 0 6 16v4a2 2 0 0 0 2 2h1v-6h2v6h1a2 2 0 0 0 2-2v-4a4 4 0 0 0 1.44-5.96c.36-.6.56-1.3.56-2.04a4 4 0 0 0-4.54-3.96A4 4 0 0 0 12 2Z"/></svg>`;

const iconTarget = `<svg ${IC_ATTR}><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2"/></svg>`;

const iconHeadphones = `<svg ${IC_ATTR}><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5ZM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5Z"/></svg>`;

// Additional icons for the tea culture article
const iconTeacup = `<svg ${IC_ATTR}><path d="M5 12h12a3 3 0 0 1 0 6h-1M5 12V6h12v6M5 12v6h12v-6M3 22h16"/></svg>`;

const iconSeed = `<svg ${IC_ATTR}><path d="M12 2C8 2 5 6 5 11c0 4 2.5 7 5 9 .4.3.9.3 1.3.2l.7-.2c2.5-2 5-5 5-9 0-5-3-9-5-9Zm0 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"/></svg>`;

const iconStool = `<svg ${IC_ATTR}><rect x="4" y="3" width="16" height="4" rx="1"/><path d="M6 7v14M18 7v14M6 14h12"/></svg>`;

const iconQrCode = `<svg ${IC_ATTR}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="3" height="3"/><rect x="18" y="18" width="3" height="3"/><rect x="14" y="18" width="3" height="3"/><rect x="18" y="14" width="3" height="3"/></svg>`;

// Additional icons for the tones article
const iconHand = `<svg ${IC_ATTR}><path d="M18 9V5a1 1 0 0 0-2 0v4m0 0V3a1 1 0 0 0-2 0v6m0-3V4a1 1 0 0 0-2 0v6m0 0V6a1 1 0 0 0-2 0v7l-1.76-1.76a1 1 0 0 0-1.41 0 1 1 0 0 0 0 1.41L11 17c1 1.33 2 2.5 2 5h6c0-2 1-3.5 1-6V9a1 1 0 0 0-2 0Z"/></svg>`;

const iconSoundWave = `<svg ${IC_ATTR}><path d="M2 12h2l3-7 4 14 4-14 3 7h2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const iconWarning = `<svg ${IC_ATTR}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0ZM12 9v4m0 4h.01"/></svg>`;

// Additional icons for the bun cha article
const iconBowl = `<svg ${IC_ATTR}><path d="M4 15c0 3.3 3.6 6 8 6s8-2.7 8-6H4Z"/><path d="M2 12h20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 17v3"/></svg>`;

const iconBeer = `<svg ${IC_ATTR}><rect x="5" y="4" width="11" height="16" rx="2"/><path d="M16 8h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2"/><path d="M9 4V2m3 2V2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

const iconGarlic = `<svg ${IC_ATTR}><path d="M12 2c-1.5 0-3 1-3 3v1C6.5 7 5 9.5 5 12c0 3.9 3.1 7 7 7s7-3.1 7-7c0-2.5-1.5-5-4-6V5c0-2-1.5-3-3-3Z"/><path d="M12 8v5m-2-3h4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

const iconStar = `<svg ${IC_ATTR}><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"/></svg>`;

// ─── Mock Data ────────────────────────────────────────────────
export const MOCK_POSTS: BlogPost[] = [
  // ── Post 1 ──────────────────────────────────────────────────
  {
    id: "bi-quyet-6-thanh-dieu",
    title:
      "5 bí quyết chinh phục 6 thanh điệu tiếng Việt miền Bắc cho người Nhật",
    excerpt:
      "Thanh hỏi và thanh ngã luôn là nỗi ám ảnh? Khám phá 5 phương pháp thực chiến giúp bạn phân biệt rõ ràng 6 thanh điệu, từ cách nghe âm thanh đến luyện tập với pitch contour AI.",
    date: "2026-05-25",
    category: "Phương pháp học",
    categoryIcon: "school",
    categoryColor: "bg-primary-container text-on-primary-container",
    gradientFrom: "from-[#09294f]",
    gradientTo: "to-[#2d476f]",
    readTime: "8 phút đọc",
    bodyHtml: `
      <p>Tiếng Nhật và tiếng Việt đều là ngôn ngữ mà <strong>cao độ (pitch) mang ý nghĩa</strong> — nhưng cách chúng sử dụng cao độ hoàn toàn khác nhau. Tiếng Nhật dùng hệ thống <strong>pitch-accent</strong> (高低アクセント): mỗi từ có một mô hình cao-thấp cố định, và hệ thống chỉ phân biệt 2 mức (高 và 低). Tiếng Việt miền Bắc, ngược lại, sở hữu <strong>6 contour tones</strong> — 6 đường cong âm điệu có <em>hình dáng</em> riêng biệt, bao gồm cả những đường cong gãy, nảy, và nghẹn mà hệ thống Nhật Bản hoàn toàn không có.</p>
      <p>Kết quả? Não bộ người Nhật có xu hướng <strong>"nén" 6 thanh về 2 cực</strong> quen thuộc — cao hoặc thấp — khiến thanh sắc (á) và thanh ngã (ã) nghe giống nhau vì đều "kết thúc ở mức cao". Bài viết này sẽ giúp bạn phá vỡ thói quen đó bằng 5 bí quyết thực chiến.</p>

      <h2>${iconHeadphones} Bí quyết 1: Đừng vội nói — Hãy luyện "tai" trước</h2>
      <h3>Nguyên tắc Minimal Pairs</h3>
      <p>Trong ngôn ngữ học, <strong>Minimal Pairs</strong> là cặp từ chỉ khác nhau ở một yếu tố duy nhất — trong trường hợp tiếng Việt, đó là thanh điệu. Đây là công cụ luyện nghe phân biệt hiệu quả nhất mà giới nghiên cứu SLA (Second Language Acquisition) khuyến nghị.</p>
      <p>Hãy xem bộ minimal pairs kinh điển nhất — 6 từ chỉ khác nhau ở thanh điệu:</p>
      <ul>
        <li>${iconGhost} <strong>ma</strong> (thanh ngang ˉ) — ma quỷ, hồn ma. Pitch giữ nguyên ở mức trung bình, phẳng lì.</li>
        <li>${iconMother} <strong>má</strong> (thanh sắc ˊ) — mẹ. Pitch đi từ trung bình lên cao, dứt khoát.</li>
        <li>${iconEllipsis} <strong>mà</strong> (thanh huyền ˋ) — nhưng mà. Pitch đi từ trung bình xuống thấp, nhẹ nhàng.</li>
        <li>${iconTomb} <strong>mả</strong> (thanh hỏi ˀ˅) — mồ mả. Pitch xuống thấp rồi quay lên — hình chữ U.</li>
        <li>${iconHorse} <strong>mã</strong> (thanh ngã ˀ˄) — ngựa, mã. Pitch xuống rồi <em>gãy đột ngột</em> và bật lên cao.</li>
        <li>${iconRice} <strong>mạ</strong> (thanh nặng ˙) — mạ non (cây lúa non). Pitch rơi xuống thấp và dừng đột ngột.</li>
      </ul>

      <h3>${iconWarning} Hậu quả dở khóc dở cười</h3>
      <p>Thanh điệu không phải chi tiết nhỏ — nó quyết định <strong>toàn bộ ý nghĩa</strong>. Đây là những tình huống thực tế mà học viên VietImmerse đã gặp:</p>
      <ul>
        <li>Gọi <strong>"má"</strong> (mẹ) thành <strong>"ma"</strong> (ma quỷ) ${iconGhost} — Bạn định nói "Má ơi!" nhưng người Việt nghe thành "Ma ơi!".</li>
        <li>Gọi <strong>"cơm"</strong> (thanh ngang) thành <strong>"cớm"</strong> (thanh hỏi) — "cớm" là tiếng lóng chỉ công an!</li>
        <li>Nói <strong>"bán"</strong> (bán hàng) thành <strong>"bạn"</strong> (bạn bè) — Câu "Tôi bán cá" biến thành "Tôi bạn cá" (vô nghĩa).</li>
      </ul>
      <p>Mẹo luyện tập: Mỗi ngày dành <strong>10 phút trên Voice Lab</strong> của VietImmerse, chỉ nghe các cặp minimal pairs ở tốc độ 0.75x. Đừng cố phát âm — chỉ nghe và cố gắng phân biệt. Sau 2 tuần, tai bạn sẽ bắt đầu "nghe thấy" sự khác biệt mà trước đó hoàn toàn vô hình.</p>

      <blockquote>
        <p>"Tai phải đi trước miệng. Bạn không thể phát âm thứ mà bạn chưa nghe thấy." — Nguyên tắc nền tảng trong Ngữ âm học ứng dụng</p>
      </blockquote>

      <h2>${iconHand} Bí quyết 2: Vũ điệu của bàn tay — Dùng cử chỉ để ghi nhớ</h2>
      <p>Đây là phương pháp <strong>embodied cognition</strong> (nhận thức hiện thân) — ý tưởng rằng cơ thể không chỉ phục vụ não bộ, mà còn <em>tham gia trực tiếp vào quá trình tư duy</em>. Khi bạn dùng tay vẽ đường đi của thanh điệu trong không khí, bạn đang kích hoạt đồng thời 3 hệ thống: thính giác, vận động, và thị giác.</p>
      <p>Hướng dẫn chi tiết cho từng thanh:</p>
      <ul>
        <li>${iconHand} <strong>Thanh ngang (a):</strong> Tay đưa ngang từ trái sang phải, giữ nguyên độ cao — như kéo một đường thẳng trong không khí. Đơn giản nhất.</li>
        <li>${iconHand} <strong>Thanh sắc (á):</strong> Tay bắt đầu ở giữa, đưa chéo lên 45°, dứt khoát — như ném một quả bóng lên trời. Phong cách "quyết đoán".</li>
        <li>${iconHand} <strong>Thanh huyền (à):</strong> Tay bắt đầu ở giữa, từ từ hạ xuống 30° — như lá rơi nhẹ nhàng. Chậm và mềm.</li>
        <li>${iconHand} <strong>Thanh hỏi (ả):</strong> Tay đi xuống rồi <em>cong ngược lên</em> — vẽ hình chữ U trong không khí. Điểm thấp nhất là lúc bạn "nghẹn" nhẹ ở cổ họng.</li>
        <li>${iconHand} <strong>Thanh ngã (ã):</strong> Giống thanh hỏi nhưng ở điểm thấp nhất, tay <em>dừng lại đột ngột</em> rồi <strong>bật lên mạnh</strong> — như quả bóng nảy xuống sàn. Đây là thanh khó nhất!</li>
        <li>${iconHand} <strong>Thanh nặng (ạ):</strong> Tay đi xuống nhanh rồi <em>dừng đột ngột</em> — như bàn tay đập xuống bàn. Không có phần quay lên.</li>
      </ul>
      <p><strong>Bài tập 5 phút mỗi ngày:</strong> Mở VietImmerse, bật audio mẫu, và dùng tay vẽ theo. Sau 1 tuần, bạn sẽ nhận ra mình bắt đầu vẽ <em>trước khi</em> nghe xong — đó là dấu hiệu não bộ đã bắt đầu "cảm nhận" thanh điệu thay vì chỉ "nghe" nó.</p>

      <h2>${iconSoundWave} Bí quyết 3: "Giải phẫu" thanh ngã và thanh hỏi kiểu Hà Nội</h2>
      <p>Đây là cặp thanh mà <strong>95% người Nhật nhầm lẫn</strong>. Trên biểu đồ pitch, chúng trông tương tự: cả hai đều đi xuống rồi quay lên. Vậy sự khác biệt nằm ở đâu?</p>

      <h3>Bí mật: Điểm nghẹn thanh hầu (Glottal Stop)</h3>
      <p>Trong ngữ âm học, <strong>glottal stop</strong> (tắc thanh môn, ký hiệu IPA: [ʔ]) là hiện tượng hai dây thanh âm đóng sập lại hoàn toàn trong tích tắc, tạo ra một khoảnh khắc "im lặng" cực ngắn giữa dòng âm thanh. Bạn đã từng trải nghiệm glottal stop mà không biết — trong tiếng Nhật, âm っ (sokuon) có bản chất tương tự!</p>
      <p>Sự khác biệt giữa thanh hỏi và thanh ngã kiểu Hà Nội nằm ở <strong>vị trí và cường độ</strong> của glottal stop:</p>
      <ul>
        <li><strong>Thanh hỏi (ả):</strong> Pitch đi xuống mượt mà, chạm đáy, rồi <em>từ từ quay lên</em>. Glottal stop <strong>rất nhẹ hoặc không có</strong>. Giống như chiếc xe từ từ đi qua ổ gà nhỏ — hơi xóc nhưng không dừng.</li>
        <li><strong>Thanh ngã (ã):</strong> Pitch đi xuống rồi <strong>dừng đột ngột</strong> (glottal stop rõ ràng — dây thanh đóng sập!), sau đó <em>bật lên mạnh</em> lên mức cao. Giống như quả bóng rơi xuống sàn bê tông — <strong>nảy</strong> lên với lực. ${iconSoundWave}</li>
      </ul>
      <p>Đây chính là <strong>"đặc sản" của giọng Hà Nội</strong> — cái "gãy" sắc nét làm cho giọng miền Bắc nghe rõ ràng và dứt khoát hơn so với giọng miền Nam (nơi thanh ngã thường được phát âm giống thanh hỏi).</p>

      <h3>Bài tập thực hành: Cảm nhận Glottal Stop</h3>
      <ol>
        <li>Đặt tay lên cổ họng (chạm nhẹ vào thanh quản).</li>
        <li>Nói từ <strong>"ả"</strong> (thanh hỏi) — bạn sẽ cảm thấy dây thanh rung liên tục, chỉ hơi yếu đi ở đáy.</li>
        <li>Nói từ <strong>"ã"</strong> (thanh ngã) — bạn sẽ cảm thấy dây thanh <strong>dừng rung hoàn toàn</strong> trong tích tắc rồi rung lại mạnh. Đó là glottal stop! ${iconSoundWave}</li>
        <li>Lặp lại: "ả — ã — ả — ã" cho đến khi ngón tay bạn phân biệt được hai cảm giác khác nhau.</li>
      </ol>

      <blockquote>
        <p>"Thanh ngã không chỉ nghe bằng tai — bạn có thể chạm thấy nó bằng tay trên cổ họng. Đó là cái 'nảy' đặc trưng mà không ngôn ngữ nào khác có." — Giáo viên ngữ âm tại VietImmerse</p>
      </blockquote>

      <h2>${iconWaveform} Bí quyết 4: Tận dụng AI Voice Lab — Nhìn thấy thanh điệu</h2>
      <p>Bí quyết 1-3 giúp bạn hiểu <em>lý thuyết</em> và rèn <em>cảm giác cơ thể</em>. Nhưng để biết chính xác mình đang phát âm đúng hay sai, bạn cần <strong>dữ liệu khách quan</strong> — và đó là vai trò của AI.</p>
      <p>VietImmerse Voice Lab sử dụng thuật toán trích xuất <strong>tần số cơ bản F0</strong> để vẽ pitch contour (đường cong âm điệu) của giọng bạn theo thời gian thực. Cách sử dụng:</p>
      <ol>
        <li>${iconMic} <strong>Chọn bài tập Minimal Pairs:</strong> Hệ thống phát audio mẫu — ví dụ "mả" (thanh hỏi).</li>
        <li>${iconMic} <strong>Ghi âm bản thân:</strong> Bạn lặp lại từ đó vào micro.</li>
        <li>${iconWaveform} <strong>So sánh pitch contour:</strong> Hai đường cong hiện lên cạnh nhau — <span style="color:#f97316;font-weight:700">cam</span> (mẫu chuẩn) và <span style="color:#3b82f6;font-weight:700">xanh</span> (của bạn). Vùng lệch được highlight đỏ.</li>
        <li>${iconTarget} <strong>Đọc phản hồi AI:</strong> Ví dụ: "Thanh hỏi của bạn chưa đủ xuống ở đáy. F0 đạt 120Hz trong khi mẫu chuẩn là 95Hz. Hãy thử hạ thấp hơn trước khi kéo lên."</li>
      </ol>
      <p>Điểm mạnh nhất của Voice Lab là nó cho phép bạn tập trung vào <strong>từng thanh riêng lẻ</strong>. Bạn không cần luyện cả 6 thanh cùng lúc — hãy bắt đầu với cặp dễ nhất (ngang vs sắc), sau đó tiến dần đến cặp khó nhất (hỏi vs ngã).</p>

      <h3>Lộ trình luyện tập đề xuất</h3>
      <ul>
        <li><strong>Tuần 1-2:</strong> Chỉ nghe phân biệt. Chưa cần phát âm. Mục tiêu: phân biệt đúng 90% trong bài quiz Minimal Pairs.</li>
        <li><strong>Tuần 3-4:</strong> Bắt đầu phát âm thanh ngang, sắc, huyền, nặng. 4 thanh "dễ" này chiếm 70% từ vựng thường dùng.</li>
        <li><strong>Tuần 5-6:</strong> Tập trung vào thanh hỏi. Luyện cử chỉ tay hình chữ U + kiểm tra F0 trên Voice Lab.</li>
        <li><strong>Tuần 7-8:</strong> Chinh phục thanh ngã. Luyện glottal stop + cử chỉ tay "nảy" + kiểm tra trên Voice Lab. Mục tiêu: Tone Accuracy >75%.</li>
      </ul>

      <h2>${iconBrain} Bí quyết 5: Đưa thanh điệu vào ngữ cảnh — Hiện tượng Coarticulation</h2>
      <p>Tất cả 4 bí quyết trên đều luyện thanh điệu ở cấp <em>từ đơn lẻ</em>. Nhưng trong thực tế, người Hà Nội không nói từng từ tách biệt — họ nói <strong>cả câu liền mạch</strong>, và thanh điệu bị biến đổi nhẹ do hiện tượng <strong>coarticulation</strong> (đồng phát âm).</p>

      <h3>Coarticulation là gì?</h3>
      <p>Đó là hiện tượng thanh điệu của một âm tiết bị <strong>ảnh hưởng bởi thanh điệu của âm tiết liền kề</strong>. Ví dụ cụ thể:</p>
      <ul>
        <li>Từ <strong>"phở bò"</strong> — khi nói chậm, thanh hỏi (ở) rõ ràng hình chữ U. Nhưng khi nói nhanh tự nhiên, nó bị "nén" lại, đường cong U nông hơn vì ngay sau đó là thanh huyền (ò).</li>
        <li>Từ <strong>"cà phê"</strong> — thanh huyền (à) ở "cà" kéo dài hơn bình thường vì ngay sau là thanh ngang (ê), tạo ra hiệu ứng "nhún" nhẹ ở điểm nối.</li>
        <li>Cụm <strong>"Hà Nội"</strong> — thanh huyền (à) nối với thanh nặng (ội) tạo ra một đường cong "đi xuống — tiếp tục xuống rồi dừng" rất đặc trưng. ${iconSoundWave}</li>
      </ul>

      <h3>Tại sao điều này quan trọng?</h3>
      <p>Vì khi bạn luyện từng từ riêng lẻ quá lâu mà không thực hành trong câu, bạn sẽ phát triển một lối nói <strong>"rô-bốt"</strong> — từng từ rõ ràng nhưng nghe không tự nhiên. Người Hà Nội sẽ hiểu bạn, nhưng họ sẽ nhận ra ngay bạn là người nước ngoài.</p>
      <p>Cách khắc phục: Sau khi đạt Tone Accuracy >70% ở cấp từ đơn, hãy chuyển sang <strong>luyện Shadowing cấp câu</strong> trên VietImmerse. Tính năng Sentence Shadowing phân tích pitch contour của <em>toàn bộ câu</em>, bao gồm cả vùng nối giữa các từ — giúp bạn nắm bắt intonation tự nhiên kiểu Hà Nội.</p>

      <h3>Bài tập thực hành: Nối thanh điệu</h3>
      <ol>
        <li>Chọn một câu ngắn: <strong>"Cho em một phở bò"</strong> (5 âm tiết, 4 thanh khác nhau).</li>
        <li>Nói chậm từng từ: "Cho — em — một — phở — bò". Đảm bảo mỗi thanh đúng.</li>
        <li>Tăng tốc dần: "Cho em — một phở — bò". Cảm nhận các thanh bắt đầu "chảy" vào nhau.</li>
        <li>Nói tự nhiên: "Cho em một phở bò" — một câu liền mạch. So sánh pitch contour với mẫu.</li>
      </ol>

      <h2>Lời kết: Ngôn ngữ là âm nhạc</h2>
      <p>6 thanh điệu tiếng Việt không phải rào cản — chúng là <strong>giai điệu</strong> của ngôn ngữ. Nếu bạn có thể nghe nhạc, bạn có thể học thanh điệu. Sự khác biệt duy nhất giữa người nói giỏi và người mới bắt đầu là <em>thời gian luyện tập có hệ thống</em>.</p>
      <p>Hãy nhớ 5 bí quyết:</p>
      <ol>
        <li><strong>Luyện tai</strong> với Minimal Pairs — trước khi mở miệng.</li>
        <li><strong>Dùng tay</strong> vẽ đường cong — kết nối cơ thể với âm thanh.</li>
        <li><strong>Nắm vững glottal stop</strong> — chìa khóa phân biệt hỏi vs ngã.</li>
        <li><strong>Dùng AI Voice Lab</strong> — biến âm thanh thành hình ảnh, loại bỏ ảo tưởng thính giác.</li>
        <li><strong>Luyện trong ngữ cảnh</strong> — đưa thanh điệu vào câu hoàn chỉnh để nói tự nhiên.</li>
      </ol>
      <p>Và quan trọng nhất: <strong>đừng sợ sai</strong>. Mỗi lần bạn gọi "má" thành "ma", người Hà Nội sẽ cười — nhưng đó là tiếng cười thân thiện, và họ sẽ sẵn lòng sửa cho bạn. Bởi vì trong văn hóa Việt Nam, một người nước ngoài <em>cố gắng</em> nói tiếng Việt luôn được trân trọng, bất kể thanh điệu có đúng hay không.</p>

      <blockquote>
        <p>"Ngôn ngữ là âm nhạc. 6 thanh điệu là 6 nốt nhạc. Và bạn — bạn đang học cách hát bài ca của Hà Nội." — Đội ngũ VietImmerse</p>
      </blockquote>
    `,
  },

  // ── Post 2 ──────────────────────────────────────────────────
  {
    id: "van-hoa-tra-da-via-he",
    title: "Văn hóa trà đá vỉa hè: Góc nhìn thú vị giữa lòng Hà Nội",
    excerpt:
      "Trà đá vỉa hè không chỉ là thức uống — đó là lớp học ngôn ngữ sống động nhất. Tìm hiểu cách những cuộc trò chuyện bên ly trà đá giúp bạn nắm bắt giọng Hà Nội tự nhiên nhất.",
    date: "2026-05-18",
    category: "Văn hóa",
    categoryIcon: "local_cafe",
    categoryColor: "bg-secondary-container text-on-secondary-container",
    gradientFrom: "from-[#715a3e]",
    gradientTo: "to-[#584329]",
    readTime: "6 phút đọc",
    bodyHtml: `
      <p>Nếu Tokyo có <em>kissaten</em> (喫茶店) — những quán cà phê nhỏ ấm cúng mang không khí Shōwa — thì Hà Nội có <strong>trà đá vỉa hè</strong>. Nhưng khác với kissaten thanh lịch, quán trà đá Hà Nội là sự phóng khoáng tuyệt đối: không tường, không cửa, không menu bìa da. Chỉ có vỉa hè, vài chiếc ghế nhựa, một ấm trà, và <em>cả thế giới Hà Nội</em> mở ra trước mắt bạn.</p>
      <p>Bài viết này sẽ đưa bạn vào bên trong văn hóa trà đá — từ "menu" bí ẩn đến những quy tắc ngầm mà không ai nói ra — và biến mỗi cốc trà đá thành một bài học tiếng Việt thực chiến.</p>

      <h2>${iconStool} 1. Ghế nhựa lùn và sức hút bí ẩn</h2>
      <p>Hãy tưởng tượng: bạn đang đi trên phố Hà Nội, bất chợt nhìn thấy một góc vỉa hè với 5-6 chiếc <strong>ghế nhựa</strong> thấp lè tè (cao khoảng 20-25 cm), xếp quanh một chiếc bàn inox bé bằng bàn phím laptop. Trên bàn là mấy cốc trà đá trong veo, vài túi hạt hướng dương, và một bà chủ quán tay rót nước thoăn thoắt.</p>
      <p>Người Nhật lần đầu tiên thường bối rối: <em>"Ngồi thế nào?"</em>. Câu trả lời: bạn <strong>ngồi xổm nhẹ rồi hạ mông xuống</strong>, đầu gối cao hơn hông, và chấp nhận rằng mình sẽ trông hơi buồn cười trong khoảng 30 giây đầu. Sau 5 phút, bạn sẽ quên mất mình đang ngồi ghế nhựa — vì cuộc trò chuyện xung quanh cuốn hút hơn nhiều.</p>
      <p>Tại sao ghế nhựa lùn? Lý do rất thực tế:</p>
      <ul>
        <li><strong>Dễ xếp gọn:</strong> Khi công an đi dọn vỉa hè, chủ quán chỉ cần 10 giây để "biến mất" toàn bộ quán.</li>
        <li><strong>Rẻ:</strong> Một chiếc ghế nhựa giá khoảng 15.000 – 25.000 VND (100-170 yên Nhật).</li>
        <li><strong>Tạo không gian gần gũi:</strong> Khi mọi người ngồi thấp, khoảng cách vật lý thu hẹp, và cuộc trò chuyện tự nhiên trở nên thân mật hơn.</li>
      </ul>

      <blockquote>
        <p>"Ghế càng thấp, câu chuyện càng sâu." — Câu nói đùa của dân Hà Nội</p>
      </blockquote>

      <h2>${iconTeacup} 2. "Menu" kinh điển — Không chỉ có trà đá</h2>
      <p>Từ "menu" ở đây được dùng rất lỏng — vì đa số quán trà đá <strong>không có menu</strong>. Bạn ngồi xuống, chủ quán tự động rót cho bạn một cốc trà đá, và bạn gọi thêm nếu muốn. Dưới đây là những thứ bạn sẽ gặp:</p>

      <h3>${iconTeacup} Trà đá (アイスティー)</h3>
      <p>Thức uống chủ đạo. Trà xanh pha loãng, đổ đầy đá, vị thanh nhẹ hơi đắng. Giá: <strong>3.000 – 5.000 VND</strong> (20-35 yên). Đây có lẽ là thức uống rẻ nhất trên trái đất. Một số quán dùng trà mạn (trà đen), một số dùng trà xanh nhạt — mỗi quán có "công thức" riêng và khách quen có thể phân biệt được.</p>

      <h3>${iconSeed} Hạt hướng dương (ヒマワリの種)</h3>
      <p>Đồ ăn vặt đi kèm trà đá kinh điển nhất. Được bán trong túi nhỏ, giá 5.000 – 10.000 VND. <strong>Cách cắn hạt hướng dương "chuẩn" Hà Nội</strong> là một kỹ năng mà người Nhật cần luyện tập:</p>
      <ol>
        <li>Đặt hạt <strong>nằm ngang</strong> giữa hai hàm răng cửa.</li>
        <li><strong>Cắn nhẹ</strong> để tách vỏ — đừng nghiến mạnh, sẽ vỡ nát cả nhân.</li>
        <li>Dùng lưỡi <strong>đẩy nhân ra</strong>, nhả vỏ sang một bên.</li>
        <li>Toàn bộ quy trình diễn ra trong <strong>dưới 2 giây</strong> nếu bạn là dân chuyên nghiệp.</li>
      </ol>
      <p>Mẹo: người Hà Nội cắn hạt hướng dương như một phản xạ vô thức — tay cắn, miệng nói, mắt lướt điện thoại — tất cả cùng lúc. Đây là multitasking ở cấp độ nghệ thuật.</p>

      <h3>${iconSeed} Kẹo lạc (ピーナッツキャンディー)</h3>
      <p>Thanh kẹo hình chữ nhật làm từ đường mạch nha và lạc (đậu phộng) rang. Vị <strong>ngọt giòn</strong>, kết hợp tuyệt vời với vị <strong>đắng nhẹ</strong> của trà đá — tương tự cách người Nhật ăn wagashi (和菓子) với matcha. Giá: 5.000 – 10.000 VND.</p>

      <h3>${iconTeacup} Nhân trần & Nước vối</h3>
      <p>Hai loại đồ uống "nâng cấp" so với trà đá thường:</p>
      <ul>
        <li><strong>Nhân trần</strong> — nước sắc từ cây nhân trần (artemisia), vị đắng nhẹ thanh mát, được cho là tốt cho gan. Đặc biệt phổ biến vào mùa hè. ${iconTeacup}</li>
        <li><strong>Nước vối</strong> — nước nấu từ lá vối khô, vị hơi chua nhẹ, hương thơm đặc trưng. Đây là thức uống dân dã "quốc dân" của miền Bắc mà ít du khách biết đến.</li>
      </ul>

      <h3>Bảng từ vựng cho người Nhật</h3>
      <ul>
        <li><strong>Trà đá</strong> — アイスティー (aisu tī) — Iced tea</li>
        <li><strong>Hạt hướng dương</strong> — ヒマワリの種 (himawari no tane) — Sunflower seeds</li>
        <li><strong>Kẹo lạc</strong> — ピーナッツ飴 (pīnattsu ame) — Peanut candy</li>
        <li><strong>Nhân trần</strong> — ヨモギ茶 (yomogi cha) — Artemisia tea</li>
        <li><strong>Nước vối</strong> — ヴォイの葉茶 (voi no ha cha) — Vối leaf tea</li>
        <li><strong>"Cho em thêm đá"</strong> — 「氷を足してください」 — "Thêm đá cho tôi"</li>
      </ul>

      <h2>${iconStool} 3. Chức năng xã hội — Nơi xóa nhòa khoảng cách</h2>
      <p>Trong xã hội Nhật Bản, tầng lớp xã hội ảnh hưởng rõ nét đến cách giao tiếp — từ keigo (kính ngữ) đến khoảng cách vật lý. Nhưng ở quán trà đá Hà Nội, <strong>mọi thứ đều bình đẳng</strong>.</p>
      <p>Bạn sẽ chứng kiến cảnh tượng kỳ thú này mỗi ngày:</p>
      <ul>
        <li>Một <strong>giám đốc mặc vest</strong>, cà vạt nới lỏng, ngồi ghế nhựa cạnh anh <strong>xe ôm công nghệ</strong> đang nghỉ giữa ca.</li>
        <li>Bà <strong>giáo viên về hưu</strong> ngồi chém gió với cô <strong>sinh viên năm nhất</strong> mới nhập trường.</li>
        <li>Ông <strong>bác sĩ</strong> bệnh viện Bạch Mai tranh luận về bóng đá với chú <strong>thợ sửa xe</strong> đầu ngõ.</li>
      </ul>
      <p>Tất cả đều ngồi cùng loại ghế nhựa, uống cùng cốc trà đá, và nói chuyện với nhau bằng giọng điệu <em>hoàn toàn ngang hàng</em>.</p>

      <h3>"Chém gió" — Nghệ thuật tán gẫu</h3>
      <p>Khái niệm <strong>chém gió</strong> (文字通り: "風を切る" = "chặt gió") là một trong những từ lóng quan trọng nhất mà bạn cần biết. Nghĩa đen là "chém gió", nghĩa bóng là <strong>nói chuyện phiếm, tán gẫu, kể chuyện phóng đại</strong>.</p>
      <p>Quán trà đá chính là "thánh đường" của chém gió. Người ta ngồi hàng giờ, bàn về đủ thứ chuyện trên trời dưới biển:</p>
      <ul>
        <li>Kết quả bóng đá tối qua (đội tuyển Việt Nam, Premier League)</li>
        <li>Giá vàng, giá đô la, giá xăng (3 chủ đề "quốc dân")</li>
        <li>Chuyện hàng xóm, chuyện cơ quan, chuyện chính trị</li>
        <li>Và cả chuyện... không có gì để nói nhưng vẫn ngồi (đây là cấp độ cao nhất của chém gió)</li>
      </ul>

      <blockquote>
        <p>"Người Hà Nội có thể ngồi quán trà đá 2 tiếng mà không cần lý do. Bản thân việc ngồi đó đã là lý do."</p>
      </blockquote>

      <h2>${iconHeadphones} 4. "Lớp học" tiếng Việt thực chiến nhất</h2>
      <p>Đối với người học tiếng Việt, quán trà đá là <strong>môi trường nghe hiểu khắc nghiệt nhất</strong> — và chính vì thế, nó cũng là nơi luyện tập hiệu quả nhất. Tại sao? Vì bạn phải đối mặt với:</p>

      <h3>Thử thách 1: Tốc độ nói</h3>
      <p>Người Hà Nội khi chém gió nói <strong>cực kỳ nhanh</strong> — khoảng 5-6 âm tiết/giây, nhanh hơn 20% so với giọng chuẩn trong sách giáo khoa. Các từ bị "nuốt" mất âm cuối, câu nối liền nhau không có khoảng nghỉ rõ ràng. Ví dụ: <em>"Ê, hôm qua mày đi đâu thế?"</em> trong thực tế nghe như <em>"Ê-hôm-qua-mà-đi-đâ-thế"</em> — gần như một chuỗi âm liên tục.</p>

      <h3>Thử thách 2: Tiếng lóng và cách nói tắt</h3>
      <p>Sách giáo khoa dạy bạn nói <em>"Tôi muốn uống nước"</em>. Ngoài đường, người ta nói <em>"Cho cốc nước đi cô"</em>. Dưới đây là một số câu thực chiến:</p>
      <ul>
        <li><strong>"Cô ơi cho cháu cốc trà đá"</strong> — Cách gọi nước lịch sự nhất (xưng "cháu", gọi chủ quán là "cô"). ${iconTeacup}</li>
        <li><strong>"Thanh toán cho cháu với"</strong> — Yêu cầu tính tiền. "Với" ở cuối câu là trợ từ giúp câu mềm mại hơn.</li>
        <li><strong>"Bao nhiêu đấy cô?"</strong> — Hỏi giá ("đấy" = nhấn mạnh "tất cả"). Câu trả lời thường là: "Năm nghìn thôi con" (5.000 VND).</li>
        <li><strong>"Em ơi, ngồi đây được không?"</strong> — Hỏi phép ngồi cùng bàn (xưng "em" nếu nói với chủ quán trẻ hơn).</li>
        <li><strong>"Thêm đá nhé!"</strong> — Gọi thêm đá. "Nhé" ở cuối tạo sắc thái thân thiện, nhẹ nhàng.</li>
      </ul>

      <h3>Thử thách 3: Tiếng ồn nền</h3>
      <p>Quán trà đá nằm ngay trên vỉa hè, nghĩa là bạn đang nghe tiếng Việt <strong>giữa tiếng còi xe máy, tiếng bán hàng rong, tiếng nhạc từ điện thoại</strong> của người bên cạnh. Đây là môi trường "real-world noise" mà không phòng lab nào tái tạo được. Nếu bạn nghe hiểu được ở quán trà đá, bạn nghe hiểu được <em>ở bất kỳ đâu</em>.</p>

      <h2>${iconQrCode} 5. Quy tắc ngầm — Những điều không ai nói ra</h2>
      <p>Mỗi nền văn hóa đều có "luật bất thành văn". Quán trà đá Hà Nội cũng vậy. Nếu bạn hiểu những quy tắc ngầm này, bạn sẽ được coi là <em>người am hiểu</em> — và người Hà Nội rất trân trọng điều đó.</p>

      <h3>Quy tắc 1: Không tip (tiền bo)</h3>
      <p>Khác với Mỹ hay nhiều nước phương Tây, Việt Nam <strong>không có văn hóa tiền tip</strong>. Giá trên bảng (hoặc giá miệng nói) là giá cuối cùng. Nếu bạn để lại tiền thừa, chủ quán sẽ chạy theo trả lại hoặc nghĩ bạn quên. Đừng cố tip — nó sẽ tạo ra sự lúng túng cho cả hai bên.</p>

      <h3>Quy tắc 2: Tiền lẻ hoặc QR</h3>
      <p>Trà đá giá 3.000 – 5.000 VND, nên bạn cần <strong>tiền lẻ</strong>. Đưa tờ 500.000 VND để mua cốc trà đá 5.000 là một "tội ác" nhỏ mà chủ quán sẽ nhớ mãi. Tuy nhiên, sự hiện đại hóa đang len lỏi vào cả quán trà đá: nhiều quán giờ đã có <strong>mã QR thanh toán</strong> (Momo, VNPay, ZaloPay). ${iconQrCode}</p>
      <p>Bạn sẽ thấy hình ảnh thú vị: một bà cụ 70 tuổi bán trà đá vỉa hè, nhưng trên tường treo tấm bìa carton in 3 mã QR khác nhau. Đây là Việt Nam hiện đại — nơi truyền thống và công nghệ hòa quyện một cách tự nhiên nhất.</p>

      <h3>Quy tắc 3: Ngồi thoải mái, nhưng đừng "chiếm chỗ"</h3>
      <p>Quán trà đá thường chỉ có 4-6 chỗ ngồi. Nếu quán đông, hãy sẵn sàng <strong>ngồi chung bàn</strong> với người lạ — đây là điều hoàn toàn bình thường. Và khi uống xong, đừng ngồi quá lâu nếu thấy có người đang đợi chỗ (trừ khi bạn gọi thêm cốc nữa — lúc đó bạn có quyền ngồi thêm).</p>

      <h3>Quy tắc 4: Xưng hô đúng</h3>
      <p>Đây là điểm quan trọng nhất cho người Nhật. Trong tiếng Nhật, bạn luôn có thể dùng <em>"sumimasen"</em> để gọi bất kỳ ai. Nhưng tiếng Việt <strong>bắt buộc</strong> phải xưng hô theo mối quan hệ tuổi tác:</p>
      <ul>
        <li>Chủ quán lớn tuổi (50+): gọi <strong>"Cô/Bác"</strong>, xưng <strong>"cháu"</strong>.</li>
        <li>Chủ quán trung niên (30-50): gọi <strong>"Chị/Anh"</strong>, xưng <strong>"em"</strong>.</li>
        <li>Chủ quán trẻ (<30): gọi <strong>"Em ơi"</strong>, xưng <strong>"anh/chị"</strong> (tùy giới tính bạn).</li>
      </ul>
      <p>Mẹo: nếu không chắc tuổi, hãy <strong>gọi cao hơn một bậc</strong> — gọi "chị" thay vì "em" luôn an toàn hơn. Người Việt sẽ tự sửa cho bạn nếu sai, và họ rất trân trọng việc bạn cố gắng xưng hô đúng.</p>

      <h2>${iconStool} 6. Lời kết: Hãy can đảm ngồi xuống</h2>
      <p>Đối với người Nhật — vốn quen với sự tinh tế, ngăn nắp và khoảng cách lịch sự — quán trà đá vỉa hè có thể là một trải nghiệm <strong>vượt ngoài vùng an toàn</strong>. Ghế nhựa bé, bàn chật, tiếng ồn, và bạn phải tự gọi bằng tiếng Việt.</p>
      <p>Nhưng chính sự "vượt ngoài vùng an toàn" đó lại là <strong>khoảnh khắc bạn bắt đầu thực sự sống trong tiếng Việt</strong>, thay vì chỉ học nó trên ứng dụng. Khi bạn ngồi xuống chiếc ghế nhựa lùn, gọi <em>"Cô ơi cho cháu cốc trà đá"</em>, rồi lắng nghe nhịp sống Hà Nội chảy qua — lúc đó bạn không còn là du khách. Bạn đang trở thành một phần của thành phố này.</p>
      <p>Hãy mở VietImmerse, luyện sẵn vài câu gọi nước và chém gió, rồi bước ra phố. Tìm một quán trà đá bất kỳ — chúng ở khắp nơi, đặc biệt quanh khu phố cổ — ngồi xuống, và để Hà Nội tự dạy bạn tiếng Việt.</p>

      <blockquote>
        <p>"Một cốc trà đá 5.000 đồng, một chiếc ghế nhựa lùn, và cả thế giới Hà Nội mở ra trước mắt bạn. Đây là lớp học tiếng Việt rẻ nhất và giá trị nhất mà bạn sẽ từng tham gia." — Đội ngũ VietImmerse</p>
      </blockquote>
    `,
  },

  // ── Post 3 ──────────────────────────────────────────────────
  {
    id: "shadowing-cung-ai",
    title:
      "Phương pháp Shadowing cùng AI: Chìa khóa để nói tự nhiên như người bản xứ",
    excerpt:
      "Shadowing kết hợp AI phân tích sóng âm giúp bạn bắt chước nhịp điệu, ngữ điệu Hà Nội chính xác đến từng chi tiết. Đây là cách VietImmerse biến công nghệ thành lợi thế học tập.",
    date: "2026-05-10",
    category: "Công nghệ & EdTech",
    categoryIcon: "smart_toy",
    categoryColor: "bg-tertiary-container text-on-tertiary-container",
    gradientFrom: "from-[#3f2122]",
    gradientTo: "to-[#603d3e]",
    readTime: "10 phút đọc",
    bodyHtml: `
      <p>Bạn đã từng trải qua cảm giác này chưa: tự tin nói một câu tiếng Việt trước gương, nhưng khi ra ngoài đường phố Hà Nội, người bản xứ lại nhíu mày hỏi lại <strong>"Bạn nói gì cơ?"</strong>. Đó không phải lỗi của bạn — đó là vì bạn đang thiếu một <em>tấm gương soi</em> thực sự cho giọng nói.</p>
      <p>Bài viết này sẽ đi sâu vào <strong>phương pháp Shadowing</strong> — kỹ thuật luyện phát âm được giới ngôn ngữ học đánh giá cao nhất — và cách VietImmerse kết hợp nó với AI phân tích sóng âm để tạo ra trải nghiệm luyện nói đột phá dành riêng cho tiếng Việt miền Bắc.</p>

      <h2>${iconHeadphones} 1. Nỗi đau thực sự: Tại sao người Nhật "nghe được" nhưng "nói không ra"?</h2>
      <p>Tiếng Nhật là ngôn ngữ <strong>pitch-accent</strong> — cao độ chỉ thay đổi ở mức tương đối (cao hoặc thấp), và hệ thống chỉ có 2 mức rõ ràng. Trong khi đó, tiếng Việt miền Bắc sở hữu <strong>6 thanh điệu</strong>, mỗi thanh có một đường cong âm điệu (contour) riêng biệt: ngang, sắc, huyền, hỏi, ngã, nặng.</p>
      <p>Điều này tạo ra hai thử thách đồng thời cho người Nhật:</p>
      <ul>
        <li><strong>Thử thách thính giác:</strong> Não bộ người Nhật không quen phân biệt 6 mức biến thiên tinh tế của cao độ. Ví dụ, thanh hỏi (ả) và thanh ngã (ã) nghe gần giống nhau với tai chưa được huấn luyện — cả hai đều có điểm "gãy" ở giữa, nhưng thanh ngã kết thúc bằng một cú nảy lên cao hơn.</li>
        <li><strong>Thử thách vận động:</strong> Ngay cả khi tai đã phân biệt được, bộ máy phát âm (thanh quản, lưỡi, môi) chưa được rèn luyện đủ để tái tạo chính xác đường cong đó. Cơ bắp cần thời gian để xây dựng <em>motor memory</em> (trí nhớ cơ bắp).</li>
      </ul>
      <p>Kết quả? Bạn <em>nghĩ</em> mình đang nói đúng, nhưng thực tế đường cong pitch của bạn lệch đáng kể so với người bản xứ. Đây chính là lúc phương pháp Shadowing cần xuất hiện — nhưng không phải Shadowing theo cách truyền thống.</p>

      <h2>${iconBrain} 2. Giới hạn chết người của Shadowing truyền thống</h2>
      <p><strong>Shadowing</strong> (シャドーイング) là phương pháp lặp lại ngay lập tức sau khi nghe người bản xứ nói, được nhà ngôn ngữ học Alexander Arguelles phổ biến rộng rãi. Bạn nghe một câu, rồi ngay lập tức nhại lại giọng, nhịp điệu, cao độ — như một cái bóng (<em>shadow</em>) bám theo người nói.</p>
      <p>Phương pháp này đã được chứng minh hiệu quả trong nhiều ngôn ngữ. Tuy nhiên, khi áp dụng cho tiếng Việt, nó bộc lộ <strong>một lỗ hổng chí mạng</strong>:</p>

      <h3>"Ảo tưởng thính giác" (Auditory Illusion)</h3>
      <p>Trong ngôn ngữ học thực nghiệm, hiện tượng này được gọi là <strong>"perception-production gap"</strong> — khoảng cách giữa những gì bạn <em>nghĩ</em> mình đang nói và những gì <em>thực tế</em> phát ra từ miệng bạn.</p>
      <p>Cơ chế hoạt động như sau:</p>
      <ol>
        <li>Bạn nghe audio mẫu: <em>"Phở bò Hà Nội"</em> với thanh hỏi (ở) và thanh nặng (ội).</li>
        <li>Bạn lặp lại và tự nghe bản thân nói.</li>
        <li>Não bộ <strong>tự động "chỉnh sửa"</strong> tín hiệu âm thanh nhận được, khiến bạn cảm thấy mình đã nói đúng.</li>
        <li>Nhưng nếu ghi âm lại và phân tích bằng phần mềm, đường cong pitch thực tế cho thấy thanh hỏi của bạn <strong>phẳng hơn, không đủ gãy</strong>, và thanh nặng <strong>không đủ đột ngột</strong>.</li>
      </ol>
      <p>Người Nhật đặc biệt dễ mắc ảo tưởng này vì hệ thống pitch-accent Nhật Bản chỉ phân biệt "cao" và "thấp" — não bộ quen ánh xạ mọi biến thiên cao độ về hai cực này, thay vì nhận ra 6 đường cong riêng biệt của tiếng Việt.</p>

      <blockquote>
        <p>"Tai bạn là một người bạn tốt nhưng đôi khi nói dối. Chỉ có dữ liệu mới không bao giờ tự lừa mình." — Triết lý VietImmerse</p>
      </blockquote>

      <h2>${iconWaveform} 3. "Thị giác hóa" âm thanh — Bước đột phá của AI</h2>
      <p>VietImmerse giải quyết vấn đề ảo tưởng thính giác bằng một cách tiếp cận đơn giản nhưng mạnh mẽ: <strong>biến âm thanh thành hình ảnh</strong>. Khi bạn có thể <em>nhìn thấy</em> giọng nói của mình, bạn không còn phải phụ thuộc vào tai nữa.</p>

      <h3>Pitch Contour (Đường cong âm điệu) là gì?</h3>
      <p>Mỗi âm tiết bạn phát ra đều mang theo một <strong>tần số cơ bản (F0 — Fundamental Frequency)</strong>. Đây là tần số rung của dây thanh âm, đo bằng đơn vị Hertz (Hz). Khi F0 thay đổi theo thời gian, nó tạo ra một <em>đường cong</em> — đó chính là <strong>pitch contour</strong>.</p>
      <p>Ví dụ trực quan cho từ <em>"ma"</em> với 6 thanh điệu:</p>
      <ul>
        <li><strong>ma</strong> (thanh ngang): Đường thẳng nằm ngang ở mức trung bình (~150 Hz). ${iconWaveform}</li>
        <li><strong>má</strong> (thanh sắc): Đường đi từ trung bình lên cao (~130 → 200 Hz), dốc đều.</li>
        <li><strong>mà</strong> (thanh huyền): Đường đi từ trung bình xuống thấp (~150 → 100 Hz), nhẹ nhàng.</li>
        <li><strong>mả</strong> (thanh hỏi): Đường cong hình chữ "U" — xuống thấp rồi quay lên (~140 → 110 → 145 Hz). Đây là thanh khó nhất!</li>
        <li><strong>mã</strong> (thanh ngã): Tương tự thanh hỏi nhưng có điểm gãy đột ngột ở đáy, rồi <em>bật</em> lên cao (~140 → 105 → 180 Hz). Sự khác biệt tinh tế này chính là nỗi ám ảnh của người Nhật.</li>
        <li><strong>mạ</strong> (thanh nặng): Đường rơi xuống thấp rồi dừng đột ngột (~140 → 90 Hz), kết thúc bằng tắc thanh môn (glottal stop).</li>
      </ul>

      <h3>AI "chồng phổ" — So sánh trực quan</h3>
      <p>Khi bạn ghi âm trong <strong>Voice Lab</strong> của VietImmerse, hệ thống AI thực hiện các bước sau trong vài mili-giây:</p>
      <ol>
        <li>${iconMic} <strong>Thu nhận tín hiệu:</strong> Micro ghi lại giọng nói của bạn dưới dạng sóng âm số (digital waveform) với tần số lấy mẫu 44.1 kHz.</li>
        <li>${iconWaveform} <strong>Trích xuất F0:</strong> Thuật toán CREPE (Convolutional Representation for Pitch Estimation) — một mô hình deep learning — tách tần số cơ bản F0 khỏi tín hiệu phức tạp, loại bỏ tiếng ồn nền.</li>
        <li>${iconTarget} <strong>Chồng phổ (Overlay):</strong> Đường cong F0 của bạn (hiển thị màu <span style="color:#3b82f6;font-weight:700">xanh dương</span>) được đặt chồng lên đường cong F0 chuẩn của giáo viên (hiển thị màu <span style="color:#f97316;font-weight:700">cam</span>). Bạn có thể nhìn thấy ngay lập tức mình lệch ở đâu.</li>
        <li>${iconBrain} <strong>Tính điểm khớp:</strong> AI sử dụng thuật toán Dynamic Time Warping (DTW) để tính độ tương đồng giữa hai đường cong, cho ra điểm số từ 0% đến 100%.</li>
      </ol>
      <p>Điểm mấu chốt: bạn không cần hiểu bất kỳ thuật ngữ nào ở trên. VietImmerse hiển thị tất cả dưới dạng <strong>biểu đồ trực quan</strong> đơn giản — hai đường cong, một số phần trăm, và các vùng lệch được highlight bằng màu đỏ. Bạn chỉ cần tập trung làm cho hai đường cong <em>trùng khớp</em> nhau.</p>

      <blockquote>
        <p>"Khi bạn có thể nhìn thấy thanh điệu, bạn sẽ nghe thấy nó rõ hơn. Thị giác và thính giác là hai mặt của cùng một đồng xu." — Nghiên cứu Neurolinguistics, MIT (2021)</p>
      </blockquote>

      <h2>${iconTarget} 4. Thuật toán chấm điểm Fluency — Không chỉ là cao độ</h2>
      <p>Nhiều ứng dụng học ngôn ngữ chỉ đánh giá <em>thanh điệu</em> (pitch accuracy). Nhưng VietImmerse đi xa hơn với hệ thống chấm điểm <strong>Fluency Score</strong> ba chiều, phân tích cả "nhạc điệu" tổng thể của câu nói:</p>

      <h3>Chiều 1: Tone Accuracy (Độ chính xác thanh điệu) — 40% trọng số</h3>
      <p>Sử dụng DTW so sánh pitch contour từng âm tiết. Điểm được tính riêng cho mỗi thanh điệu trong câu, sau đó lấy trung bình có trọng số — các thanh khó (hỏi, ngã) được cho trọng số cao hơn vì đây là nơi người Nhật thường sai nhiều nhất.</p>

      <h3>Chiều 2: Rhythm & Pacing (Nhịp điệu & Tốc độ) — 35% trọng số</h3>
      <p>AI phân tích <strong>nhịp ngắt nghỉ (pause pattern)</strong> và <strong>tốc độ nhả chữ (syllable rate)</strong> của bạn. Tiếng Việt Hà Nội có một nhịp điệu đặc trưng — nhanh hơn tiếng Việt miền Nam, với các ngắt nghỉ ngắn giữa cụm từ. Nếu bạn nói quá chậm, ngắt quãng quá nhiều giữa các từ, hoặc nói đều đều không có nhấn nhá — AI sẽ phát hiện.</p>
      <p>Các chỉ số cụ thể được phân tích:</p>
      <ul>
        <li><strong>Syllable Rate:</strong> Số âm tiết trên giây. Người Hà Nội nói tự nhiên khoảng 4.5 – 5.5 âm tiết/giây.</li>
        <li><strong>Pause Duration:</strong> Thời lượng ngắt nghỉ trung bình giữa các cụm từ. Quá dài (>500ms giữa các từ) = chưa trôi chảy.</li>
        <li><strong>Hesitation Ratio:</strong> Tỷ lệ thời gian im lặng so với tổng thời gian nói. Người bản xứ khoảng 15-20%, người mới học thường >40%.</li>
      </ul>

      <h3>Chiều 3: Naturalness (Độ tự nhiên) — 25% trọng số</h3>
      <p>Đây là chiều phân tích tinh tế nhất. AI đánh giá cách bạn <strong>nối liền các thanh điệu</strong> trong một câu. Người Hà Nội khi nói tự nhiên không phát âm từng từ tách biệt — họ "chảy" từ thanh này sang thanh khác theo một <em>giai điệu</em> liền mạch. AI phân tích intonation contour (đường cong ngữ điệu) cấp câu để đánh giá chiều này.</p>

      <h2>${iconMic} 5. Quy trình 3 bước luyện Shadowing "chuẩn bài" trên VietImmerse</h2>
      <p>Dựa trên nghiên cứu về <em>Second Language Acquisition</em> (Tiếp thu ngôn ngữ thứ hai) và phản hồi từ hàng nghìn học viên, VietImmerse đã tinh chỉnh quy trình Shadowing thành <strong>3 bước khoa học</strong>:</p>

      <h3>Bước 1: Nghe ngấm (Active Listening) ${iconHeadphones}</h3>
      <p>Đây là bước mà hầu hết mọi người bỏ qua hoặc làm qua loa — nhưng nó quan trọng nhất.</p>
      <ul>
        <li><strong>Lần nghe 1 — Nghe tổng thể:</strong> Không cần hiểu nghĩa, chỉ cảm nhận "giai điệu" chung của câu. Câu này đi lên hay đi xuống? Nhịp nhanh hay chậm?</li>
        <li><strong>Lần nghe 2 — Nghe từng âm tiết:</strong> VietImmerse cho phép phát chậm (0.75x) để bạn nghe rõ từng thanh điệu. Tập trung vào các từ có thanh hỏi và thanh ngã.</li>
        <li><strong>Lần nghe 3 — Nghe và hình dung:</strong> Nhắm mắt, nghe lại ở tốc độ bình thường, và <em>tưởng tượng</em> đường cong pitch trong đầu. Nghiên cứu cho thấy visualization nội tâm giúp cải thiện motor planning lên tới 23%.</li>
      </ul>
      <p><strong>Thời gian khuyến nghị:</strong> 60-90 giây cho mỗi câu mẫu. Không được vội vàng bỏ qua bước này.</p>

      <h3>Bước 2: Shadowing & Ghi âm ${iconMic}</h3>
      <p>Sau khi đã "ngấm" đủ, bạn bắt đầu thực hành:</p>
      <ul>
        <li><strong>Lần 1 — Shadowing cùng lúc (Simultaneous):</strong> Nhấn "Play" và nói <em>cùng lúc</em> với audio mẫu. Đừng lo nếu chưa kịp — mục đích là để não bộ và bộ máy phát âm "bắt kịp" nhịp của người bản xứ.</li>
        <li><strong>Lần 2 — Shadowing trễ (Delayed):</strong> Nghe xong một cụm từ, tạm dừng, rồi lặp lại. VietImmerse tự động tạo khoảng dừng sau mỗi cụm.</li>
        <li><strong>Lần 3 — Ghi âm độc lập:</strong> Nhấn nút ghi âm và nói <em>không có audio mẫu</em>. Đây là lúc thực sự kiểm tra trí nhớ cơ bắp của bạn.</li>
      </ul>
      <p>Mẹo quan trọng: khi Shadowing, hãy <strong>bắt chước cả ngữ điệu cơ thể</strong> của người Hà Nội. Nghiêng đầu nhẹ khi nói thanh hỏi, gật nhẹ khi nói thanh nặng. Nghe có vẻ kỳ lạ, nhưng nghiên cứu embodied cognition cho thấy cử chỉ cơ thể giúp ghi nhớ thanh điệu tốt hơn 30%.</p>

      <h3>Bước 3: Phân tích phổ thanh & Sửa lỗi ${iconWaveform}</h3>
      <p>Đây là bước mà AI thực sự tỏa sáng, biến VietImmerse khác biệt hoàn toàn so với Shadowing truyền thống:</p>
      <ol>
        <li><strong>Xem biểu đồ chồng phổ:</strong> Hai đường cong pitch — của bạn và của giáo viên — được hiển thị cạnh nhau. Vùng lệch quá 20% được highlight bằng màu đỏ.</li>
        <li><strong>Đọc phản hồi cụ thể:</strong> AI không chỉ nói "sai" — nó chỉ ra <em>chính xác</em> bạn sai ở đâu. Ví dụ: "Thanh hỏi ở từ 'bở' chưa đủ gãy. Hãy thử hạ pitch xuống thấp hơn trước khi kéo lên."</li>
        <li><strong>Xem Fluency Score:</strong> Điểm tổng hợp 3 chiều (Tone 40% + Rhythm 35% + Naturalness 25%) cho bạn bức tranh toàn cảnh.</li>
        <li><strong>Lặp lại có chọn lọc:</strong> Thay vì lặp lại cả câu, bạn có thể chỉ luyện lại <em>từ bị lỗi</em>. VietImmerse cho phép isolate từng âm tiết để tập trung sửa.</li>
      </ol>

      <h2>6. Dữ liệu thực tế: Trước và sau 30 ngày</h2>
      <p>Chúng tôi đã theo dõi <strong>500 học viên người Nhật</strong> sử dụng quy trình 3 bước trong 30 ngày liên tục (15 phút/ngày). Kết quả đo bằng điểm Fluency Score trung bình:</p>
      <ul>
        <li>${iconTarget} <strong>Tone Accuracy:</strong> Từ 48% → 79% (+31 điểm). Cải thiện rõ rệt nhất ở thanh hỏi và thanh ngã.</li>
        <li>${iconWaveform} <strong>Rhythm & Pacing:</strong> Từ 41% → 72% (+31 điểm). Tốc độ nhả chữ tăng từ 2.8 lên 4.1 âm tiết/giây.</li>
        <li>${iconBrain} <strong>Naturalness:</strong> Từ 35% → 68% (+33 điểm). Chiều cải thiện lớn nhất — cho thấy Shadowing đặc biệt hiệu quả trong việc xây dựng intonation tự nhiên.</li>
        <li>${iconHeadphones} <strong>Fluency Score tổng:</strong> Từ <strong>42% lên 74%</strong>. Trên 70% được coi là "có thể giao tiếp tự nhiên với người bản xứ trong các tình huống đời thường".</li>
      </ul>
      <p>Đáng chú ý: <strong>92%</strong> học viên báo cáo rằng người Hà Nội hiểu họ nói gì ngay từ lần đầu, so với chỉ 38% trước khi luyện tập.</p>

      <h2>${iconBrain} 7. Kết luận: AI là tấm gương soi, không phải người thầy</h2>
      <p>Hãy hình dung thế này: một vũ công ballet giỏi không chỉ nhờ giáo viên — họ cần <strong>tấm gương lớn</strong> trong phòng tập để nhìn thấy chính xác cơ thể mình đang di chuyển như thế nào. AI của VietImmerse chính là tấm gương đó cho giọng nói.</p>
      <p>Công nghệ không thể thay thế người bản xứ. Không thuật toán nào tái tạo được cảm giác ngồi uống trà đá với một cô bán hàng ở phố cổ, hay tiếng cười khi bạn vô tình nói sai thanh điệu và biến "phở bò" thành "phỡ bồ". Nhưng AI có thể giúp bạn <strong>chuẩn bị tốt nhất có thể</strong> trước khi bước ra thế giới thực.</p>
      <p>Mỗi phút luyện Shadowing trên VietImmerse là một phút bạn đang:</p>
      <ul>
        <li>Rèn luyện <strong>trí nhớ cơ bắp</strong> cho bộ máy phát âm.</li>
        <li>Hiệu chỉnh <strong>bản đồ thính giác</strong> trong não bộ.</li>
        <li>Xây dựng <strong>sự tự tin</strong> dựa trên dữ liệu thực, không phải cảm giác chủ quan.</li>
      </ul>
      <p>Và khi bạn đạt trên 80% Fluency Score, hãy tự thưởng cho mình — bước ra phố, gọi một cốc cà phê trứng, và dùng chính giọng Hà Nội bạn đã rèn luyện để nói: <strong>"Cho em một cà phê trứng nóng ạ!"</strong></p>

      <blockquote>
        <p>"Công nghệ không thay thế người thầy — nó là tấm gương soi hoàn hảo nhất để bạn tự rèn luyện mỗi ngày. Và mỗi ngày luyện tập, bạn đến gần hơn một bước với nhịp điệu của Hà Nội." — Triết lý VietImmerse</p>
      </blockquote>
    `,
  },

  // ── Post 4 ──────────────────────────────────────────────────
  {
    id: "bun-cha-obama-ha-noi",
    title:
      'Bún chả Hương Liên và câu chuyện "Obama Bún Chả" chấn động Hà Nội',
    excerpt:
      "Năm 2016, Tổng thống Obama và đầu bếp Anthony Bourdain ngồi ăn bún chả tại một quán nhỏ ở Hà Nội. Câu chuyện đó đã thay đổi cách thế giới nhìn nhận ẩm thực Việt Nam như thế nào?",
    date: "2026-05-03",
    category: "Văn hóa ẩm thực",
    categoryIcon: "ramen_dining",
    categoryColor: "bg-secondary-container text-on-secondary-container",
    gradientFrom: "from-[#92400e]",
    gradientTo: "to-[#b45309]",
    readTime: "7 phút đọc",
    bodyHtml: `
      <p>Vào một buổi tối tháng 5 năm 2016, hình ảnh Tổng thống Mỹ Barack Obama ngồi ăn bún chả trên chiếc ghế nhựa thấp tại quán <strong>Bún chả Hương Liên</strong> (26 Lê Văn Hưu, Hà Nội) đã khiến cả thế giới sửng sốt. Bữa ăn bình dị ấy cùng đầu bếp huyền thoại Anthony Bourdain đã trở thành biểu tượng của ngoại giao ẩm thực.</p>

      <blockquote>
        <p>"Hóa đơn bữa ăn? 6 đô la. Tôi nghiêm túc đấy. Hai suất bún chả, hai chai bia, tổng cộng 6 đô la. Và đó là một trong những bữa ăn ngon nhất đời tôi." — Anthony Bourdain, <em>Parts Unknown</em></p>
      </blockquote>

      <h2>${iconStar} 1. Đêm lịch sử tại Hương Liên</h2>
      <p>Anthony Bourdain chọn Hương Liên không phải ngẫu nhiên. Đây là quán bún chả bình dân <strong>đã hoạt động từ những năm 1990</strong>, nổi tiếng với dân địa phương nhưng chưa hề xuất hiện trên bất kỳ tạp chí du lịch quốc tế nào. Bourdain muốn cho thế giới thấy rằng ẩm thực đường phố Việt Nam không cần "nâng cấp" — nó đã hoàn hảo từ trên vỉa hè.</p>
      <p>Câu chuyện được phát sóng trong tập <em>Hanoi</em> của Parts Unknown Season 8, và trong vài giờ sau khi lên sóng, hình ảnh Obama ngồi ăn bún chả đã lan truyền trên toàn cầu với hơn <strong>50 triệu lượt xem</strong> trong tuần đầu tiên. Bún chả Hà Nội từ một món ăn địa phương bỗng trở thành <strong>biểu tượng ẩm thực toàn cầu</strong>.</p>

      <h2>${iconBowl} 2. Giải mã "Combo Obama"</h2>
      <p>Sau sự kiện lịch sử, quán Hương Liên đã sáng tạo ra <strong>"Combo Obama"</strong> — tái hiện chính xác bữa ăn của vị tổng thống. Combo gồm:</p>

      <h3>${iconBowl} 1 suất Bún chả đặc biệt</h3>
      <p>Gồm bún sợi nhỏ, chả viên (thịt lợn băm tron) và chả miếng (thịt ba chỉ thái mỏng nướng than hoa), kèm một bát nước chấm pha từ nước mắm, giấm, đường, tỏi ớ, và đu đủ xanh thái sợi. Đĩa rau sống kèm gồm xà lách, tía tô, kiếp và rau mùi. ${iconBowl}</p>

      <h3>1 đĩa Nem hải sản (Nem cua bể)</h3>
      <p>Nem cuốn giòn rụm với nhân tôm và cua biển, chiên vàng đều. Đây là món <strong>đặc sản Hải Phòng</strong> nhưng được yêu thích rộng rãi ở Hà Nội. Vỏ giòn kết hợp với nhân hải sản mịng màng và nước chấm chua ngọt — sự tương phản hoàn hảo với vị nướng thơm của bún chả.</p>

      <h3>${iconBeer} 1 chai Bia Hà Nội</h3>
      <p>Không phải Heineken, không phải Tiger — mà là <strong>Bia Hà Nội</strong> (thường gọi là "bia Hơi" khi ở dạng tươi). Chai bia xanh 450ml với vị nhẹ, thanh, ít đắng — là sự kết hợp lý tưởng với vị đậm đà của bún chả. Giá một chai khoảng <strong>15.000 – 20.000 VND</strong> (100-140 yên Nhật).</p>
      <p>Tổng giá Combo Obama: khoảng <strong>85.000 – 100.000 VND</strong> (600-700 yên). Đúng như Bourdain nói — 6 đô la cho một bữa ăn làm thay đổi cách thế giới nhìn ẩm thực Việt Nam.</p>

      <h2>${iconStar} 3. Hiện tượng "Đóng tủ kính" — Niềm tự hào Hà Nội</h2>
      <p>Sau bữa ăn lịch sử, gia đình chủ quán Hương Liên đã làm một việc mà có lẽ chỉ xảy ra ở Việt Nam: họ <strong>đóng lồng kính bảo tồn</strong> bộ bàn ghế và bát đũa mà ông Obama từng dùng.</p>
      <p>Bước vào quán Hương Liên ngày nay, bạn sẽ thấy ngay góc đó — một chiếc bàn nhỏ với 2 chiếc ghế nhựa, bát đũa, và 2 chai bia được bày nguyên vị trí trong <strong>tủ kính trong suốt</strong>, kèm ảnh chụp Obama và Bourdain. Không ai được ngồi vào góc đó nữa — nó đã trở thành "hiện vật bảo tàng".</p>
      <p>Điều này nói lên điều gì về văn hóa Việt Nam? Đó là <strong>niềm tự hào bản sắc</strong>. Người Hà Nội không thay đổi quán để "lên đời" sau việc nổi tiếng — họ vẫn giữ ghế nhựa, vẫn nướng than hoa, vẫn cùng công thức. Bởi vì họ hiểu rằng chính sự <em>chân thực</em> đó mới là thứ khiến bún chả của họ đặc biệt.</p>

      <blockquote>
        <p>"Người Hà Nội đóng tủ kính cho bộ bát đũa 6 đô la — không phải vì giá trị vật chất, mà vì niềm tự hào rằng ẩm thực bình dân của họ xứng đáng với sự tôn trọng của cả thế giới."</p>
      </blockquote>

      <h2>${iconGarlic} 4. "Nghệ thuật" ăn bún chả chuẩn người bản xứ</h2>
      <p>Đối với người Nhật — vốn quen với quy tắc ẩm thực nghiêm ngặt (cách cầm hàshi, thứ tự ăn kaiseki) — bún chả có vẻ đơn giản. Nhưng thực ra nó có một "nghệ thuật" riêng mà nhiều du khách làm sai:</p>

      <h3>${iconWarning} Lỗi phổ biến nhất: Đổ nước chấm vào bún</h3>
      <p>Nhiều du khách nhìn thấy bát bún và bát nước chấm riêng, rồi <strong>đổ nước chấm vào bún</strong> như ăn mì rámen. Đây là cách ăn <em>sai hoàn toàn</em>! Nước chấm sẽ loãng, bún sẽ nhũn, và bạn mất đi sự kiểm soát vị.</p>

      <h3>Cách ăn đúng (từng bước)</h3>
      <ol>
        <li>${iconGarlic} <strong>Gia giảm nước chấm:</strong> Trước khi ăn, thêm vào bát nước chấm: <strong>1-2 lát ớ tươi</strong> (cẩn thận — ớ Việt Nam cay hơn ớ Nhật rất nhiều!), <strong>1 thìa tỏi băm</strong>, và vài giọt <strong>dấm tỏi</strong> (giấm ngâm tỏi — gia vị "bí mật" của người Hà Nội).</li>
        <li>${iconBowl} <strong>Gắp bún vào bát nước chấm:</strong> Dùng đũa gắp một nhúm bún nhỏ và <strong>thả vào bát nước chấm</strong> cùng chả. <em>Không gắp hết</em> — chỉ gắp vừa một miếng.</li>
        <li><strong>Kẹp rau sống:</strong> Xé một lá <strong>tía tô</strong> (紫蘇/シソ — bạn sẽ quen vị này vì shiso Nhật rất giống!), thêm vài lá xà lách, cuốn với bún và chả.</li>
        <li><strong>Ăn cùng lúc:</strong> Bún + chả + rau + nước chấm — tất cả trong một miếng. Đây là lúc vị giác bùng nổ: ngọt của thịt nướng, chua của giấm, cay của ớ, và tươi mát của rau thơm. ${iconBowl}</li>
      </ol>
      <p><strong>Mẹo chuyên gia:</strong> Người Hà Nội thường ăn xong một vài miếng thì húp một ngụm nước chấm trực tiếp từ bát — như uống canh. Vị chua ngọt kích thích vị giác và giúp bạn sẵn sàng cho miếng tiếp theo.</p>

      <h2>${iconTeacup} 5. Từ vựng & Mẫu câu gọi món thực chiến</h2>
      <p>Bước vào quán bún chả và tự gọi món bằng tiếng Việt là một <strong>milestone</strong> quan trọng trong hành trình học ngôn ngữ. Dưới đây là những câu bạn sẽ cần:</p>

      <h3>Gọi món</h3>
      <ul>
        <li>${iconBowl} <strong>"Cô ơi cho cháu 2 suất Obama"</strong> — Cách gọi combo nhanh nhất tại Hương Liên. Chủ quán sẽ hiểu ngay.</li>
        <li>${iconBowl} <strong>"Cho cháu một suất bún chả"</strong> — Gọi 1 suất đơn. "Suất" = phần ăn hoàn chỉnh.</li>
        <li>${iconBeer} <strong>"Cho cháu một chai bia Hà Nội"</strong> — Gọi bia. Nếu muốn bia hơi (bia tươi): "Cho cháu một cốc bia hơi".</li>
      </ul>

      <h3>Yêu cầu thêm</h3>
      <ul>
        <li><strong>"Cho cháu thêm bún"</strong> — Gọi thêm bún (thường miễn phí hoặc 5.000 VND).</li>
        <li><strong>"Cho cháu thêm rau"</strong> — Gọi thêm rau sống (thường miễn phí).</li>
        <li>${iconGarlic} <strong>"Cho cháu thêm nước chấm"</strong> — Gọi thêm nước chấm (miễn phí).</li>
        <li>${iconTeacup} <strong>"Trà đá không đá"</strong> — Gọi trà mà không cần đá (hữu ích nếu dạ dày nhạy cảm). Câu này nghe vui nhưng rất thường dùng!</li>
      </ul>

      <h3>Thanh toán</h3>
      <ul>
        <li><strong>"Thanh toán cho cháu với"</strong> — Yêu cầu tính tiền. "Với" làm mềm câu nói.</li>
        <li><strong>"Bao nhiêu tất cả ạ?"</strong> — Hỏi tổng số tiền. "Ạ" ở cuối câu thể hiện sự tôn trọng.</li>
        <li><strong>"Chuyển khoản được không ạ?"</strong> — Hỏi chuyển khoản qua điện thoại (Momo/VNPay). ${iconQrCode}</li>
      </ul>

      <h3>Bảng từ vựng ẩm thực cho người Nhật</h3>
      <ul>
        <li><strong>Bún chả</strong> — ブンチャー (bun chā) — Grilled pork with rice noodles</li>
        <li><strong>Chả viên</strong> — 肉団子 (nikudango) — Pork meatball</li>
        <li><strong>Chả miếng</strong> — 豚バラ焼き (buta bara yaki) — Grilled pork belly</li>
        <li><strong>Nước chấm</strong> — タレ (ヌゥックチャム) — Dipping sauce</li>
        <li><strong>Rau sống</strong> — 生野菜 (nama yasai) — Fresh herbs/greens</li>
        <li><strong>Tía tô</strong> — シソ (shiso) — Perilla leaf</li>
        <li><strong>Nem</strong> — 揚げ春巻き (age harumaki) — Fried spring roll</li>
        <li><strong>Dấm tỏi</strong> — ガーリック酢 (gārikku su) — Garlic vinegar ${iconGarlic}</li>
      </ul>

      <h2>${iconStool} 6. Lời kết: Bún chả là văn hóa, không chỉ là món ăn</h2>
      <p>Câu chuyện Obama ăn bún chả không chỉ là một sự kiện truyền thông — nó là minh chứng rằng <strong>ẩm thực đường phố Việt Nam có sức mạnh kết nối con người</strong>, bất kể khoảng cách văn hóa hay địa vị xã hội. Một vị tổng thống và một đầu bếp, ngồi ghế nhựa thấp, ăn cùng bát bún chả với những người dân bình thường — không có bức tường nào giữa họ.</p>
      <p>Với người Nhật học tiếng Việt, quán bún chả là “phòng thực hành” tuyệt vời nhất. Bạn được luyện gọi món, hỏi giá, yêu cầu thêm đồ, thanh toán — tất cả trong một bối cảnh <em>tự nhiên và thân thiện</em>. Không ai cười bạn vì nói sai thanh điệu — họ chỉ cười vì vui mừng khi thấy người nước ngoài ăn bún chả.</p>
      <p>Hãy mở VietImmerse, luyện sẵn câu <em>"Cô ơi cho cháu một suất bún chả"</em>, và bước vào một quán bún chả bất kỳ trên phố Hà Nội. Khi mùi thịt nướng tỏa ra từ bếp than, khi bát nước chấm chua ngọt được bưng ra, và khi bạn nói câu đầu tiên bằng tiếng Việt — lúc đó bạn sẽ hiểu vì sao một vị tổng thống đã rơi nước mắt vì một bát bún chả 6 đô la.</p>

      <blockquote>
        <p>"Muốn hiểu một nền văn hóa, hãy bắt đầu từ bàn ăn. Muốn yêu Hà Nội, hãy bắt đầu từ bát bún chả." — Anthony Bourdain</p>
      </blockquote>
    `,
  },

  // ── Post 5 ──────────────────────────────────────────────────
  {
    id: "huong-dan-visa-ha-noi",
    title:
      "Hướng dẫn chi tiết cách xin visa và gia hạn tạm trú tại Hà Nội cho người Nhật",
    excerpt:
      "Từ e-Visa đến gia hạn visa tại chỗ, bài viết này tổng hợp toàn bộ quy trình, hồ sơ cần thiết và mẹo giúp bạn xử lý thủ tục hành chính tại Hà Nội một cách nhanh gọn nhất.",
    date: "2026-04-28",
    category: "Thủ tục & Đời sống",
    categoryIcon: "description",
    categoryColor: "bg-primary-container text-on-primary-container",
    gradientFrom: "from-[#1e3a5f]",
    gradientTo: "to-[#2c5282]",
    readTime: "12 phút đọc",
    bodyHtml: `
      <p>Đối với người Nhật Bản muốn sống và học tiếng Việt tại Hà Nội, việc nắm rõ thủ tục visa và tạm trú là <strong>bước đầu tiên không thể bỏ qua</strong>. Bài viết này tổng hợp toàn bộ quy trình cập nhật mới nhất, giúp bạn xử lý thủ tục một cách nhanh gọn.</p>

      <h2>1. Chính sách miễn visa cho công dân Nhật Bản</h2>
      <p>Tin vui: Công dân Nhật Bản được <strong>miễn visa nhập cảnh Việt Nam</strong> với thời hạn lưu trú tối đa <strong>45 ngày</strong> (kể từ năm 2023). Điều này có nghĩa là bạn chỉ cần hộ chiếu còn hạn ít nhất 6 tháng để nhập cảnh.</p>
      <p>Tuy nhiên, nếu bạn dự định ở lâu hơn 45 ngày — ví dụ theo học một khóa tiếng Việt dài hạn — bạn sẽ cần xin visa trước hoặc gia hạn tại Hà Nội.</p>

      <h2>2. Các loại visa phổ biến</h2>
      <ul>
        <li><strong>e-Visa (Visa điện tử):</strong> Thời hạn 90 ngày, một lần hoặc nhiều lần nhập cảnh. Xin online tại <em>evisa.xuatnhapcanh.gov.vn</em>, phí khoảng 25 USD, xử lý trong 3 ngày làm việc.</li>
        <li><strong>Visa du lịch (DL):</strong> 30 – 90 ngày. Có thể xin tại Đại sứ quán Việt Nam tại Tokyo hoặc qua công ty dịch vụ visa tại Hà Nội.</li>
        <li><strong>Visa doanh nghiệp (DN):</strong> Dành cho người làm việc hoặc thực tập. Cần thư bảo lãnh từ công ty Việt Nam.</li>
        <li><strong>Visa du học (DH):</strong> Dành cho học viên theo học tại cơ sở giáo dục tại Việt Nam. Cần giấy xác nhận từ trường/trung tâm.</li>
      </ul>

      <h2>3. Quy trình xin e-Visa (khuyến nghị)</h2>
      <p>e-Visa là cách đơn giản nhất. Quy trình gồm 4 bước:</p>
      <ol>
        <li><strong>Truy cập cổng thông tin:</strong> Vào trang web chính thức của Cục Quản lý xuất nhập cảnh.</li>
        <li><strong>Điền đơn online:</strong> Cung cấp thông tin hộ chiếu, ảnh chụp (4x6cm nền trắng), và ảnh chụp trang hộ chiếu có thông tin cá nhân.</li>
        <li><strong>Thanh toán:</strong> Phí 25 USD bằng thẻ tín dụng quốc tế (Visa/Mastercard).</li>
        <li><strong>Nhận kết quả:</strong> Sau 3 ngày làm việc, bạn sẽ nhận e-Visa qua email. In ra và mang theo khi nhập cảnh.</li>
      </ol>

      <h2>4. Gia hạn visa tại Hà Nội</h2>
      <p>Nếu bạn đang ở Hà Nội và muốn ở lại thêm, có hai cách gia hạn:</p>
      <h3>Cách 1: Qua công ty dịch vụ visa</h3>
      <p>Đây là cách phổ biến nhất cho người nước ngoài. Bạn chỉ cần đưa hộ chiếu cho công ty dịch vụ, trả phí, và nhận lại hộ chiếu đã gia hạn sau 5-7 ngày làm việc.</p>
      <ul>
        <li>Phí gia hạn: khoảng <strong>400.000 – 700.000 VND</strong> tùy thời hạn.</li>
        <li>Thời gian xử lý: <strong>5-7 ngày</strong> làm việc.</li>
        <li>Thời hạn gia hạn: tối đa 30 ngày (cho visa du lịch).</li>
      </ul>

      <h3>Cách 2: Xuất cảnh và nhập cảnh lại (Visa Run)</h3>
      <p>Một số người chọn cách bay đến một nước lân cận (Lào, Campuchia, Thái Lan) rồi quay lại Việt Nam để được cấp miễn visa 45 ngày mới. Tuy nhiên, cách này <strong>không được khuyến khích</strong> vì:</p>
      <ul>
        <li>Tốn chi phí vé máy bay và thời gian.</li>
        <li>Cơ quan xuất nhập cảnh có thể từ chối nếu phát hiện bạn thực hiện visa run thường xuyên.</li>
      </ul>

      <h2>5. Đăng ký tạm trú (rất quan trọng!)</h2>
      <p>Theo luật Việt Nam, người nước ngoài lưu trú tại bất kỳ địa chỉ nào đều phải <strong>đăng ký tạm trú trong vòng 24 giờ</strong> kể từ khi đến. Nếu bạn ở khách sạn, họ sẽ làm giúp. Nếu thuê nhà riêng, chủ nhà có trách nhiệm khai báo cho công an phường.</p>

      <h2>6. Từ vựng tiếng Việt hữu ích về thủ tục</h2>
      <p>VietImmerse có bài học chuyên đề về từ vựng hành chính. Dưới đây là một số từ cơ bản:</p>
      <ul>
        <li><strong>Hộ chiếu</strong> — パスポート (pasupōto)</li>
        <li><strong>Visa / Thị thực</strong> — ビザ (biza)</li>
        <li><strong>Gia hạn</strong> — 延長 (enchō)</li>
        <li><strong>Đăng ký tạm trú</strong> — 一時滞在届 (ichiji taizai todoke)</li>
        <li><strong>Công an phường</strong> — 地区の警察 (chiku no keisatsu)</li>
      </ul>

      <blockquote>
        <p>"Chuẩn bị tốt thủ tục giấy tờ, để tâm trí thoải mái tập trung vào việc học. Hà Nội luôn chào đón bạn." — Đội ngũ VietImmerse</p>
      </blockquote>
    `,
  },

  // ── Post 6 ──────────────────────────────────────────────────
  {
    id: "5-quan-ca-phe-trung-ha-noi",
    title:
      '5 quán cà phê trứng "chuẩn vị" Hà Nội bạn không nên bỏ lỡ',
    excerpt:
      "Cà phê trứng — thức uống huyền thoại của Hà Nội. Khám phá 5 quán cà phê trứng nổi tiếng nhất, từ quán gốc 70 năm tuổi đến những không gian hiện đại mang hồn Hà Nội.",
    date: "2026-04-20",
    category: "Ẩm thực",
    categoryIcon: "coffee",
    categoryColor: "bg-secondary-container text-on-secondary-container",
    gradientFrom: "from-[#5d3a1a]",
    gradientTo: "to-[#7c5a3a]",
    readTime: "6 phút đọc",
    bodyHtml: `
      <p>Cà phê trứng (<em>egg coffee</em>) là một trong những phát minh ẩm thực độc đáo nhất của Hà Nội. Ra đời từ những năm 1940, thức uống này đã trở thành <strong>biểu tượng văn hóa</strong> không thể thiếu khi nói đến thủ đô Việt Nam.</p>

      <h2>Cà phê trứng ra đời như thế nào?</h2>
      <p>Năm 1946, trong thời kỳ sữa tươi khan hiếm tại Hà Nội, ông <strong>Nguyễn Văn Giảng</strong> — bartender tại khách sạn Sofitel Legend Metropole — đã sáng tạo công thức thay thế sữa bằng <em>lòng đỏ trứng gà đánh bông với đường</em>. Kết quả là một lớp kem trứng béo ngậy, mịn như tiramisu, phủ lên tách cà phê đen đậm đà. Công thức đó vẫn được giữ gần như nguyên bản cho đến ngày nay.</p>

      <h2>Top 5 quán cà phê trứng "chuẩn Hà Nội"</h2>

      <h3>1. Cà phê Giảng — Quán gốc huyền thoại</h3>
      <p><strong>Địa chỉ:</strong> 39 Nguyễn Hữu Huân, Hoàn Kiếm</p>
      <p>Đây là quán cà phê trứng <em>đầu tiên trên thế giới</em>, do chính ông Nguyễn Văn Giảng thành lập. Quán nằm sâu trong một con ngõ nhỏ — bạn phải leo lên tầng 2 qua cầu thang hẹp mới đến được không gian uống. Tách cà phê được đặt trong bát nước nóng để giữ ấm.</p>
      <ul>
        <li><strong>Giá:</strong> 35.000 – 45.000 VND</li>
        <li><strong>Điểm nổi bật:</strong> Công thức gốc từ 1946, không gian hoài cổ.</li>
        <li><strong>Mẹo:</strong> Đến sớm buổi sáng (trước 9h) để có chỗ ngồi cạnh cửa sổ nhìn xuống phố.</li>
      </ul>

      <h3>2. Cà phê Đinh — View Hồ Gươm tuyệt đẹp</h3>
      <p><strong>Địa chỉ:</strong> 13 Đinh Tiên Hoàng, Hoàn Kiếm</p>
      <p>Nằm ngay cạnh Hồ Hoàn Kiếm, quán Đinh nổi tiếng với tầng 2 có ban công nhìn thẳng ra hồ. Cà phê trứng ở đây có vị đậm hơn một chút, kem trứng ít ngọt hơn Giảng — phù hợp với những người thích vị cà phê rõ nét.</p>
      <ul>
        <li><strong>Giá:</strong> 40.000 – 55.000 VND</li>
        <li><strong>Điểm nổi bật:</strong> View Hồ Gươm, không gian rộng rãi.</li>
      </ul>

      <h3>3. Cà phê Loading — Phong cách trẻ trung</h3>
      <p><strong>Địa chỉ:</strong> 8 Chân Cầm, Hoàn Kiếm</p>
      <p>Loading mang đến một cách tiếp cận <em>hiện đại</em> với cà phê trứng. Không gian thiết kế theo phong cách industrial chic, thu hút đông đảo bạn trẻ và du khách. Cà phê trứng ở đây được phục vụ trong ly thủy tinh trong suốt, để bạn nhìn thấy rõ hai lớp — đen dưới, vàng trên.</p>
      <ul>
        <li><strong>Giá:</strong> 40.000 – 50.000 VND</li>
        <li><strong>Điểm nổi bật:</strong> Thiết kế đẹp, WiFi mạnh, menu đa dạng.</li>
      </ul>

      <h3>4. Cà phê Lâm — Bảo tàng nghệ thuật mini</h3>
      <p><strong>Địa chỉ:</strong> 60 Nguyễn Hữu Huân, Hoàn Kiếm</p>
      <p>Quán Lâm nổi tiếng không chỉ vì cà phê, mà còn vì bộ sưu tập tranh của các họa sĩ nổi tiếng Việt Nam treo kín tường. Uống cà phê trứng tại đây như đang ngồi giữa một bảo tàng nghệ thuật thu nhỏ.</p>
      <ul>
        <li><strong>Giá:</strong> 30.000 – 40.000 VND</li>
        <li><strong>Điểm nổi bật:</strong> Giá rẻ, không gian nghệ thuật độc đáo.</li>
      </ul>

      <h3>5. Cà phê Phố Cổ — Trải nghiệm tầng thượng</h3>
      <p><strong>Địa chỉ:</strong> 11 Hàng Gai, Hoàn Kiếm</p>
      <p>Quán nằm trên tầng thượng một tòa nhà phố cổ, mang đến tầm nhìn 360 độ panoramic ra mái ngói rêu phong của khu 36 phố phường. Cà phê trứng ở đây được pha theo phong cách truyền thống, có thêm lựa chọn cà phê trứng dừa (<em>coconut egg coffee</em>) rất được du khách Nhật yêu thích.</p>
      <ul>
        <li><strong>Giá:</strong> 45.000 – 65.000 VND</li>
        <li><strong>Điểm nổi bật:</strong> View phố cổ từ tầng thượng, hoàng hôn tuyệt đẹp.</li>
      </ul>

      <h2>Cách gọi cà phê trứng bằng tiếng Việt</h2>
      <p>Khi đến quán, bạn có thể dùng các câu sau:</p>
      <ul>
        <li><strong>"Cho em một cà phê trứng nóng ạ"</strong> — Gọi cà phê trứng nóng.</li>
        <li><strong>"Em uống cà phê trứng đá"</strong> — Gọi phiên bản lạnh.</li>
        <li><strong>"Tính tiền ạ"</strong> — Yêu cầu thanh toán.</li>
      </ul>
      <p>Mẹo: Người Hà Nội thường gọi cà phê trứng là <strong>"ca phê chứng"</strong> (phát âm nhanh), đây là cách nói rút gọn tự nhiên mà bạn sẽ nghe thấy rất nhiều.</p>

      <blockquote>
        <p>"Cà phê trứng Hà Nội — không chỉ là thức uống, đó là một tác phẩm nghệ thuật trong tách." — Đội ngũ VietImmerse</p>
      </blockquote>
    `,
  },

  // ── Post 7 ──────────────────────────────────────────────────
  {
    id: "lang-gom-bat-trang",
    title:
      "Khám phá Làng gốm Bát Tràng: Hành trình trải nghiệm văn hóa thủ công",
    excerpt:
      "Cách trung tâm Hà Nội chỉ 30 phút, Làng gốm Bát Tràng 700 năm tuổi là điểm đến hoàn hảo để vừa khám phá văn hóa Việt Nam, vừa luyện tiếng Việt trong bối cảnh thực tế.",
    date: "2026-04-12",
    category: "Du lịch & Văn hóa",
    categoryIcon: "tour",
    categoryColor: "bg-tertiary-container text-on-tertiary-container",
    gradientFrom: "from-[#78350f]",
    gradientTo: "to-[#9a3412]",
    readTime: "9 phút đọc",
    bodyHtml: `
      <p>Nằm bên bờ sông Hồng, cách trung tâm Hà Nội khoảng 15 km về phía Đông Nam, <strong>Làng gốm Bát Tràng</strong> là một trong những làng nghề truyền thống lâu đời nhất Việt Nam. Với hơn <strong>700 năm lịch sử</strong>, nơi đây không chỉ nổi tiếng với những sản phẩm gốm sứ tinh xảo, mà còn là một "bảo tàng sống" về văn hóa thủ công Việt Nam.</p>

      <h2>Lịch sử Bát Tràng</h2>
      <p>Làng gốm Bát Tràng có lịch sử từ thế kỷ 14 — cùng thời kỳ với triều đại Trần. Ban đầu, những nghệ nhân gốm đến từ vùng Bồ Bát (Ninh Bình ngày nay) di cư đến đây vì vùng đất ven sông có <strong>nguồn đất sét trắng chất lượng cao</strong>, nguyên liệu hoàn hảo cho sản xuất gốm.</p>
      <p>Qua nhiều thế kỷ, gốm Bát Tràng đã được xuất khẩu đến nhiều nước trong khu vực, từ Nhật Bản đến Hà Lan. Đặc biệt, vào thế kỷ 17, gốm Bát Tràng từng được bán tại Nagasaki và được giới quý tộc Nhật Bản đánh giá cao.</p>

      <h2>Trải nghiệm nặn gốm thủ công</h2>
      <p>Đây là hoạt động được du khách yêu thích nhất. Bạn sẽ được:</p>
      <ol>
        <li><strong>Chọn loại sản phẩm:</strong> Bát, đĩa, cốc, bình hoa, hoặc tượng nhỏ.</li>
        <li><strong>Ngồi vào bàn xoay:</strong> Nghệ nhân sẽ hướng dẫn bạn cách tạo hình trên bàn xoay gốm truyền thống.</li>
        <li><strong>Vẽ hoa văn:</strong> Dùng bút lông vẽ hoa văn truyền thống Việt Nam lên sản phẩm.</li>
        <li><strong>Tráng men và nung:</strong> Sản phẩm sẽ được tráng men và nung trong lò ở nhiệt độ 1200°C. Bạn có thể nhận lại sản phẩm sau 3-5 ngày hoặc được gửi đến khách sạn.</li>
      </ol>
      <p>Chi phí trải nghiệm khoảng <strong>50.000 – 100.000 VND</strong> (350-700 yên Nhật) — rất hợp lý cho một kỷ niệm handmade độc nhất vô nhị.</p>

      <h2>Chợ gốm Bát Tràng</h2>
      <p>Ngoài trải nghiệm nặn gốm, bạn nên dành thời gian khám phá <strong>chợ gốm</strong> — một khu chợ lớn chuyên bán các sản phẩm gốm sứ đủ loại:</p>
      <ul>
        <li><strong>Ấm trà và bộ trà:</strong> Phong cách truyền thống Việt Nam, rất phù hợp làm quà tặng.</li>
        <li><strong>Bát đĩa men lam:</strong> Đặc trưng của gốm Bát Tràng — men lam trên nền trắng ngà.</li>
        <li><strong>Tượng phong thủy:</strong> Tượng Phật, cá chép, rồng — mang ý nghĩa may mắn.</li>
        <li><strong>Gốm nghệ thuật hiện đại:</strong> Những tác phẩm sáng tạo kết hợp giữa truyền thống và hiện đại.</li>
      </ul>
      <p><strong>Mẹo mua sắm:</strong> Giá tại chợ Bát Tràng thường có thể <em>mặc cả</em> — đây là cơ hội tuyệt vời để luyện tiếng Việt! Hãy bắt đầu bằng câu: "Em ơi, cái này bao nhiêu tiền?" rồi thử hỏi "Bớt cho em được không ạ?"</p>

      <h2>Từ vựng tiếng Việt hữu ích tại Bát Tràng</h2>
      <p>Để tận dụng tối đa chuyến đi, hãy ghi nhớ một số từ vựng quan trọng:</p>
      <ul>
        <li><strong>Gốm sứ</strong> — đồ gốm, đồ sứ (ceramics/porcelain)</li>
        <li><strong>Bàn xoay</strong> — bàn xoay nặn gốm (potter's wheel)</li>
        <li><strong>Men</strong> — lớp men phủ (glaze)</li>
        <li><strong>Lò nung</strong> — lò đốt gốm (kiln)</li>
        <li><strong>Hoa văn</strong> — họa tiết trang trí (pattern/motif)</li>
        <li><strong>Nghệ nhân</strong> — thợ thủ công lành nghề (artisan)</li>
        <li><strong>Mặc cả</strong> — thương lượng giá (bargaining)</li>
      </ul>

      <h2>Cách đi đến Bát Tràng</h2>
      <ul>
        <li><strong>Xe bus số 47:</strong> Từ Long Biên, giá 7.000 VND, thời gian khoảng 40 phút.</li>
        <li><strong>Grab/Taxi:</strong> Từ trung tâm Hà Nội khoảng 150.000 – 200.000 VND, 25-35 phút.</li>
        <li><strong>Tour từ VietImmerse:</strong> Chúng tôi tổ chức các buổi dã ngoại văn hóa đến Bát Tràng, kết hợp học tiếng Việt thực tế với trải nghiệm văn hóa.</li>
      </ul>

      <blockquote>
        <p>"Mỗi tác phẩm gốm đều kể một câu chuyện. Và khi bạn tự tay nặn, bạn đang viết câu chuyện của riêng mình tại Hà Nội." — Nghệ nhân làng Bát Tràng</p>
      </blockquote>
    `,
  },
];

// ─── Helpers ──────────────────────────────────────────────────
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getPostById(id: string): BlogPost | undefined {
  return MOCK_POSTS.find((p) => p.id === id);
}