-- =============================================================================
-- VietImmerse — Seed Data V2: Trình độ Trung cấp (Idempotent UPSERT)
-- =============================================================================
-- This file is the V2 (Intermediate / B1) companion to seed_data.sql.
-- It must run AFTER seed_data.sql (which creates content_levels & chapters).
-- Uses INSERT ... ON CONFLICT DO UPDATE — safe to run multiple times.
-- =============================================================================

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. V2 LESSONS (Chapters 9–16)
-- ═══════════════════════════════════════════════════════════════════════════════
-- UUID pattern: d0000000-0000-0000-CC00-00000000000L  (CC=09–16)

INSERT INTO lessons (lesson_id, chapter_id, scene_label, scene_label_jp, title_vi, title_jp, subtitle_vi, subtitle_jp, tag, tag_jp, duration_minutes, sort_order, is_locked, created_at) VALUES
    -- Chapter 9: Giao tiếp công sở
    ('d0000000-0000-0000-0900-000000000001',  9, 'Bài 01 • Chương 1', 'レッスン01 • 第1章', 'Ngày đầu đi làm', '初出勤の日', 'Chào đồng nghiệp, giới thiệu bản thân tại công ty Việt Nam', 'ベトナム企業で同僚に挨拶し自己紹介する', 'Trung cấp', '中級', 12, 1, false, NOW()),
    ('d0000000-0000-0000-0900-000000000002',  9, 'Bài 02 • Chương 1', 'レッスン02 • 第1章', 'Họp nhóm & Trình bày ý kiến', '会議と意見発表', 'Cách phát biểu, đồng ý và phản đối lịch sự trong cuộc họp', '会議での発言、賛成・反対の丁寧な表現', 'Trung cấp', '中級', 15, 2, false, NOW()),
    ('d0000000-0000-0000-0900-000000000003',  9, 'Bài 03 • Chương 1', 'レッスン03 • 第1章', 'Email & Tin nhắn công việc', 'ビジネスメールとメッセージ', 'Viết email chuyên nghiệp và nhắn tin với sếp bằng tiếng Việt', 'ベトナム語でビジネスメール・上司へのメッセージを書く', 'Trung cấp', '中級', 12, 3, false, NOW()),

    -- Chapter 10: Văn hóa & Lễ hội
    ('d0000000-0000-0000-1000-000000000001', 10, 'Bài 01 • Chương 2', 'レッスン01 • 第2章', 'Tết Nguyên Đán', 'テト（旧正月）', 'Phong tục, lì xì và mâm cỗ ngày Tết — văn hóa quan trọng nhất', 'テトの習慣、お年玉、正月料理 — 最も重要な文化行事', 'Văn hóa', '文化', 15, 1, false, NOW()),
    ('d0000000-0000-0000-1000-000000000002', 10, 'Bài 02 • Chương 2', 'レッスン02 • 第2章', 'Trung Thu & Các lễ hội khác', '中秋節とその他の祭り', 'Rước đèn, bánh Trung Thu và các lễ hội truyền thống Việt Nam', '提灯行列、月餅、ベトナムの伝統的な祭り', 'Văn hóa', '文化', 12, 2, false, NOW()),
    ('d0000000-0000-0000-1000-000000000003', 10, 'Bài 03 • Chương 2', 'レッスン03 • 第2章', 'Tín ngưỡng & Đời sống tâm linh', '信仰と精神生活', 'Đi chùa, thắp hương, cúng rằm — hiểu tâm linh người Việt', '寺参り、お香、満月の供物 — ベトナム人の精神世界を理解する', 'Văn hóa', '文化', 12, 3, false, NOW()),

    -- Chapter 11: Sức khỏe & Chăm sóc bản thân
    ('d0000000-0000-0000-1100-000000000001', 11, 'Bài 01 • Chương 3', 'レッスン01 • 第3章', 'Đặt lịch khám bệnh', '診察予約をする', 'Gọi điện đặt lịch và mô tả triệu chứng chi tiết', '電話予約と詳しい症状の説明', 'Thực tế', '実践', 12, 1, false, NOW()),
    ('d0000000-0000-0000-1100-000000000002', 11, 'Bài 02 • Chương 3', 'レッスン02 • 第3章', 'Tại phòng khám', '診察室にて', 'Hội thoại với bác sĩ — hỏi bệnh, nghe chẩn đoán, nhận đơn thuốc', '医師との会話 — 問診、診断、処方箋', 'Thực tế', '実践', 15, 2, false, NOW()),
    ('d0000000-0000-0000-1100-000000000003', 11, 'Bài 03 • Chương 3', 'レッスン03 • 第3章', 'Lối sống lành mạnh', '健康的な生活習慣', 'Nói về thể dục, dinh dưỡng và thói quen tốt cho sức khỏe', '運動、栄養、健康的な習慣について話す', 'Trung cấp', '中級', 10, 3, false, NOW()),

    -- Chapter 12: Du lịch & Khám phá
    ('d0000000-0000-0000-1200-000000000001', 12, 'Bài 01 • Chương 4', 'レッスン01 • 第4章', 'Đặt phòng khách sạn', 'ホテルの予約', 'Gọi điện hoặc đặt online — yêu cầu phòng, giá cả, tiện nghi', '電話やオンラインで予約 — 部屋、料金、設備の要望', 'Thực tế', '実践', 10, 1, false, NOW()),
    ('d0000000-0000-0000-1200-000000000002', 12, 'Bài 02 • Chương 4', 'レッスン02 • 第4章', 'Tham quan danh lam thắng cảnh', '名所観光', 'Hỏi thông tin, mua vé, thuê hướng dẫn viên tại các điểm du lịch', '観光地での情報収集、チケット購入、ガイド手配', 'Thực tế', '実践', 12, 2, false, NOW()),
    ('d0000000-0000-0000-1200-000000000003', 12, 'Bài 03 • Chương 4', 'レッスン03 • 第4章', 'Kể chuyện du lịch', '旅行の思い出を語る', 'Chia sẻ trải nghiệm, kỷ niệm và so sánh các địa điểm', '体験の共有、思い出、場所の比較', 'Trung cấp', '中級', 12, 3, false, NOW()),

    -- Chapter 13: Ẩm thực nâng cao
    ('d0000000-0000-0000-1300-000000000001', 13, 'Bài 01 • Chương 5', 'レッスン01 • 第5章', 'Ẩm thực đường phố Hà Nội', 'ハノイのストリートフード', 'Phở, bún đậu, bánh cuốn — gọi món và hỏi nguyên liệu', 'フォー、ブンダウ、バインクオン — 注文と材料を聞く', 'Văn hóa', '文化', 12, 1, false, NOW()),
    ('d0000000-0000-0000-1300-000000000002', 13, 'Bài 02 • Chương 5', 'レッスン02 • 第5章', 'Nấu ăn với bạn Việt', 'ベトナム人の友達と料理する', 'Học nấu phở bò — từ vựng nguyên liệu, gia vị và cách chế biến', '牛肉フォーの作り方 — 材料、調味料、調理法の語彙', 'Trung cấp', '中級', 15, 2, false, NOW()),
    ('d0000000-0000-0000-1300-000000000003', 13, 'Bài 03 • Chương 5', 'レッスン03 • 第5章', 'Văn hóa nhậu & Cà phê', '飲み会とカフェ文化', 'Đi nhậu với đồng nghiệp, gọi cà phê — nghi thức xã giao Việt', '同僚との飲み会、コーヒーの注文 — ベトナムの社交マナー', 'Văn hóa', '文化', 12, 3, false, NOW()),

    -- Chapter 14: Gia đình & Các mối quan hệ
    ('d0000000-0000-0000-1400-000000000001', 14, 'Bài 01 • Chương 6', 'レッスン01 • 第6章', 'Nói về gia đình', '家族について話す', 'Giới thiệu gia đình, mối quan hệ họ hàng và vai trò trong nhà', '家族の紹介、親戚関係、家庭での役割', 'Trung cấp', '中級', 10, 1, false, NOW()),
    ('d0000000-0000-0000-1400-000000000002', 14, 'Bài 02 • Chương 6', 'レッスン02 • 第6章', 'Được mời đến nhà người Việt', 'ベトナム人の家に招待される', 'Mang quà gì? Nói gì? Ứng xử thế nào? — nghi thức thăm nhà', '手土産は？挨拶は？マナーは？ — 家庭訪問のしきたり', 'Văn hóa', '文化', 12, 2, false, NOW()),
    ('d0000000-0000-0000-1400-000000000003', 14, 'Bài 03 • Chương 6', 'レッスン03 • 第6章', 'Tình yêu & Hẹn hò', '恋愛とデート', 'Từ vựng tình cảm, cách tỏ tình và hẹn hò kiểu Việt Nam', '恋愛の語彙、告白の仕方、ベトナム式デート', 'Trung cấp', '中級', 10, 3, false, NOW()),

    -- Chapter 15: Tin tức & Truyền thông
    ('d0000000-0000-0000-1500-000000000001', 15, 'Bài 01 • Chương 7', 'レッスン01 • 第7章', 'Đọc tin tức tiếng Việt', 'ベトナム語のニュースを読む', 'Hiểu tiêu đề báo, từ vựng thời sự và cách tóm tắt tin tức', '新聞の見出し、時事語彙、ニュースの要約方法', 'Trung cấp', '中級', 12, 1, false, NOW()),
    ('d0000000-0000-0000-1500-000000000002', 15, 'Bài 02 • Chương 7', 'レッスン02 • 第7章', 'Bày tỏ quan điểm', '意見を述べる', 'Đồng ý, phản đối, tranh luận — diễn đạt ý kiến mạch lạc', '賛成、反対、議論 — 首尾一貫した意見表現', 'Trung cấp', '中級', 15, 2, false, NOW()),
    ('d0000000-0000-0000-1500-000000000003', 15, 'Bài 03 • Chương 7', 'レッスン03 • 第7章', 'Mạng xã hội & Từ lóng', 'SNSとスラング', 'Facebook, Zalo, TikTok — ngôn ngữ mạng và từ lóng giới trẻ Việt', 'Facebook、Zalo、TikTok — ネット用語とベトナムの若者スラング', 'Trung cấp', '中級', 10, 3, false, NOW()),

    -- Chapter 16: Đời sống xã hội
    ('d0000000-0000-0000-1600-000000000001', 16, 'Bài 01 • Chương 8', 'レッスン01 • 第8章', 'Thuê nhà tại Hà Nội', 'ハノイで部屋を借りる', 'Tìm phòng, đọc hợp đồng, thương lượng giá thuê', '部屋探し、契約書を読む、家賃交渉', 'Thực tế', '実践', 12, 1, false, NOW()),
    ('d0000000-0000-0000-1600-000000000002', 16, 'Bài 02 • Chương 8', 'レッスン02 • 第8章', 'Ngân hàng & Thủ tục hành chính', '銀行と行政手続き', 'Mở tài khoản, chuyển tiền, làm giấy tờ cư trú tại Việt Nam', '口座開設、送金、ベトナムでの居住手続き', 'Thực tế', '実践', 15, 2, false, NOW()),
    ('d0000000-0000-0000-1600-000000000003', 16, 'Bài 03 • Chương 8', 'レッスン03 • 第8章', 'So sánh Việt Nam & Nhật Bản', 'ベトナムと日本の比較', 'Thảo luận sự khác biệt văn hóa, lối sống và giá trị giữa hai nước', '二国間の文化、ライフスタイル、価値観の違いについて議論する', 'Trung cấp', '中級', 15, 3, false, NOW())
ON CONFLICT (lesson_id) DO UPDATE SET
    chapter_id       = EXCLUDED.chapter_id,
    scene_label      = EXCLUDED.scene_label,
    scene_label_jp   = EXCLUDED.scene_label_jp,
    title_vi         = EXCLUDED.title_vi,
    title_jp         = EXCLUDED.title_jp,
    subtitle_vi      = EXCLUDED.subtitle_vi,
    subtitle_jp      = EXCLUDED.subtitle_jp,
    tag              = EXCLUDED.tag,
    tag_jp           = EXCLUDED.tag_jp,
    duration_minutes = EXCLUDED.duration_minutes,
    sort_order       = EXCLUDED.sort_order,
    is_locked        = EXCLUDED.is_locked;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. V2 TONE NOTES (Grammar & Expression notes for intermediate lessons)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO lesson_tone_notes (note_id, lesson_id, tone, desc_vi, desc_jp, example, color, sort_order) VALUES
    -- Ch9-L2: Họp nhóm — cấu trúc đồng ý/phản đối
    ('e1000000-0000-0000-0901-000000000002', 'd0000000-0000-0000-0900-000000000002',
     'Tuy... nhưng...',
     'Cấu trúc nhượng bộ — thừa nhận một điều rồi đưa ra ý kiến trái ngược',
     '譲歩構文 — 一度認めた上で反対意見を述べる',
     'Tuy khó nhưng tôi sẽ cố gắng', 'var(--primary)', 1),

    ('e1000000-0000-0000-0902-000000000002', 'd0000000-0000-0000-0900-000000000002',
     'Theo tôi / Theo ý kiến của tôi',
     'Cách mở đầu khi trình bày quan điểm cá nhân một cách lịch sự',
     '丁寧に個人的見解を述べる際の前置き表現',
     'Theo tôi, chúng ta nên thay đổi kế hoạch', 'var(--secondary)', 2),

    -- Ch15-L2: Bày tỏ quan điểm — cấu trúc nâng cao
    ('e1000000-0000-0000-1501-000000000002', 'd0000000-0000-0000-1500-000000000002',
     'Nếu... thì...',
     'Cấu trúc điều kiện — đặt giả thiết và nêu kết quả',
     '条件構文 — 仮定を立て結果を述べる',
     'Nếu trời mưa thì tôi sẽ ở nhà', 'var(--primary)', 1),

    ('e1000000-0000-0000-1502-000000000002', 'd0000000-0000-0000-1500-000000000002',
     'Không những... mà còn...',
     'Cấu trúc bổ sung — nhấn mạnh cả hai mặt cùng lúc',
     '追加構文 — 両方の側面を同時に強調する',
     'Anh ấy không những giỏi mà còn chăm chỉ', 'var(--secondary)', 2)
ON CONFLICT (note_id) DO UPDATE SET
    lesson_id  = EXCLUDED.lesson_id,
    tone       = EXCLUDED.tone,
    desc_vi    = EXCLUDED.desc_vi,
    desc_jp    = EXCLUDED.desc_jp,
    example    = EXCLUDED.example,
    color      = EXCLUDED.color,
    sort_order = EXCLUDED.sort_order;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. V2 DIALOGUES (Chapters 9–16)
-- ═══════════════════════════════════════════════════════════════════════════════
-- UUID pattern: f2CCLLSS where CC=chapter(09–16), LL=lesson, SS=sort

INSERT INTO lesson_dialogues (dialogue_id, lesson_id, speaker, speaker_jp, line_vi, line_jp, is_active, highlight_words_json, sort_order) VALUES
    -- ── Chapter 9, Lesson 1: Ngày đầu đi làm ──
    ('f2000000-0000-0000-0901-000000000001', 'd0000000-0000-0000-0900-000000000001',
     'QUẢN LÝ', 'マネージャー',
     'Chào mừng em đến công ty! Em tên gì, từ đâu đến?',
     '会社へようこそ！名前は？どちらから？',
     false, NULL, 1),
    ('f2000000-0000-0000-0902-000000000001', 'd0000000-0000-0000-0900-000000000001',
     'BẠN', 'あなた',
     'Dạ, em tên là Tanaka. Em là người Nhật, em mới chuyển đến Hà Nội.',
     'タナカと申します。日本人で、最近ハノイに引っ越してきました。',
     true, '[{"index":4,"color":"var(--primary)"},{"index":8,"color":"var(--secondary)"}]', 2),
    ('f2000000-0000-0000-0903-000000000001', 'd0000000-0000-0000-0900-000000000001',
     'ĐỒNG NGHIỆP', '同僚',
     'Chào Tanaka! Nếu cần gì cứ hỏi anh nhé. Mình ngồi cạnh nhau đấy.',
     'こんにちは、タナカさん！何かあったら聞いてね。隣の席だよ。',
     false, NULL, 3),

    -- ── Chapter 9, Lesson 2: Họp nhóm & Trình bày ý kiến ──
    ('f2000000-0000-0000-0901-000000000002', 'd0000000-0000-0000-0900-000000000002',
     'TRƯỞNG PHÒNG', '部長',
     'Bây giờ chúng ta bàn về dự án mới. Ai có ý kiến gì không?',
     'では新しいプロジェクトについて議論しましょう。何かご意見は？',
     false, NULL, 1),
    ('f2000000-0000-0000-0902-000000000002', 'd0000000-0000-0000-0900-000000000002',
     'BẠN', 'あなた',
     'Theo em, tuy tiến độ hơi chậm nhưng chất lượng rất tốt ạ.',
     '私の意見では、進捗はやや遅いですが品質はとても良いです。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":2,"color":"var(--secondary)"},{"index":5,"color":"var(--secondary)"}]', 2),
    ('f2000000-0000-0000-0903-000000000002', 'd0000000-0000-0000-0900-000000000002',
     'TRƯỞNG PHÒNG', '部長',
     'Ý kiến hay đấy! Vậy chúng ta sẽ điều chỉnh lịch trình.',
     'いい意見ですね！ではスケジュールを調整しましょう。',
     false, NULL, 3),

    -- ── Chapter 9, Lesson 3: Email & Tin nhắn công việc ──
    ('f2000000-0000-0000-0901-000000000003', 'd0000000-0000-0000-0900-000000000003',
     'GIÁO VIÊN', '先生',
     'Email công việc phải có: kính gửi, nội dung, trân trọng.',
     'ビジネスメールには：宛名、本文、敬具が必要です。',
     false, NULL, 1),
    ('f2000000-0000-0000-0902-000000000003', 'd0000000-0000-0000-0900-000000000003',
     'BẠN', 'あなた',
     'Kính gửi anh Minh, em xin gửi báo cáo tuần này. Trân trọng, Tanaka.',
     'ミンさんへ、今週のレポートをお送りします。敬具、タナカ',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":9,"color":"var(--secondary)"},{"index":10,"color":"var(--secondary)"}]', 2),
    ('f2000000-0000-0000-0903-000000000003', 'd0000000-0000-0000-0900-000000000003',
     'GIÁO VIÊN', '先生',
     'Tốt lắm! Nhớ dùng "Kính gửi" cho cấp trên, "Gửi" cho đồng nghiệp.',
     'いいですね！目上には「Kính gửi」、同僚には「Gửi」を使いましょう。',
     false, NULL, 3),

    -- ── Chapter 10, Lesson 1: Tết Nguyên Đán ──
    ('f2000000-0000-0000-1001-000000000001', 'd0000000-0000-0000-1000-000000000001',
     'BẠN VIỆT', 'ベトナム人の友人',
     'Tết năm nay em về quê không? Nhà em ở đâu?',
     '今年のテトは実家に帰るの？実家はどこ？',
     false, NULL, 1),
    ('f2000000-0000-0000-1002-000000000001', 'd0000000-0000-0000-1000-000000000001',
     'BẠN', 'あなた',
     'Tết là gì vậy? Giống Oshogatsu ở Nhật không?',
     'テトって何ですか？日本のお正月に似ていますか？',
     true, '[{"index":0,"color":"var(--secondary)"}]', 2),
    ('f2000000-0000-0000-1003-000000000001', 'd0000000-0000-0000-1000-000000000001',
     'BẠN VIỆT', 'ベトナム人の友人',
     'Giống lắm! Người Việt về quê, ăn bánh chưng, lì xì cho trẻ con.',
     'とても似てるよ！ベトナム人は帰省して、バインチュンを食べ、子供にお年玉をあげるの。',
     false, NULL, 3),

    -- ── Chapter 10, Lesson 2: Trung Thu & Các lễ hội khác ──
    ('f2000000-0000-0000-1001-000000000002', 'd0000000-0000-0000-1000-000000000002',
     'GIÁO VIÊN', '先生',
     'Trung Thu là tết của trẻ em. Trẻ con rước đèn và ăn bánh Trung Thu.',
     '中秋節は子供のお祭り。子供たちは提灯を持って月餅を食べます。',
     false, NULL, 1),
    ('f2000000-0000-0000-1002-000000000002', 'd0000000-0000-0000-1000-000000000002',
     'BẠN', 'あなた',
     'Bánh Trung Thu có những loại nào? Em muốn thử!',
     '月餅にはどんな種類がありますか？試してみたいです！',
     true, '[{"index":0,"color":"var(--secondary)"},{"index":1,"color":"var(--secondary)"},{"index":2,"color":"var(--secondary)"}]', 2),
    ('f2000000-0000-0000-1003-000000000002', 'd0000000-0000-0000-1000-000000000002',
     'GIÁO VIÊN', '先生',
     'Có bánh nướng và bánh dẻo — nhân đậu xanh, trứng muối, thập cẩm.',
     '焼き月餅と柔らかい月餅があります — 緑豆、塩漬け卵、ミックス餡。',
     false, NULL, 3),

    -- ── Chapter 10, Lesson 3: Tín ngưỡng & Đời sống tâm linh ──
    ('f2000000-0000-0000-1001-000000000003', 'd0000000-0000-0000-1000-000000000003',
     'BẠN VIỆT', 'ベトナム人の友人',
     'Ngày rằm chị hay đi chùa thắp hương. Em có muốn đi cùng không?',
     '満月の日はよくお寺にお香を供えに行くの。一緒に行かない？',
     false, NULL, 1),
    ('f2000000-0000-0000-1002-000000000003', 'd0000000-0000-0000-1000-000000000003',
     'BẠN', 'あなた',
     'Muốn lắm! Ở chùa mình cần làm gì? Có quy tắc gì không?',
     'ぜひ！お寺では何をすればいいですか？ルールはありますか？',
     true, NULL, 2),
    ('f2000000-0000-0000-1003-000000000003', 'd0000000-0000-0000-1000-000000000003',
     'BẠN VIỆT', 'ベトナム人の友人',
     'Mặc kín đáo, bỏ giày trước cửa, thắp 3 nén hương và cầu nguyện.',
     '控えめな服装で、入口で靴を脱ぎ、お香を3本立てて祈ります。',
     false, NULL, 3),

    -- ── Chapter 11, Lesson 1: Đặt lịch khám bệnh ──
    ('f2000000-0000-0000-1101-000000000001', 'd0000000-0000-0000-1100-000000000001',
     'BẠN', 'あなた',
     'Alo, cho em đặt lịch khám nội khoa ngày mai được không ạ?',
     'もしもし、明日の内科予約をお願いできますか？',
     true, '[{"index":4,"color":"var(--secondary)"},{"index":5,"color":"var(--secondary)"},{"index":6,"color":"var(--secondary)"}]', 1),
    ('f2000000-0000-0000-1102-000000000001', 'd0000000-0000-0000-1100-000000000001',
     'LỄ TÂN', '受付',
     'Vâng, ngày mai 9 giờ sáng được không ạ? Anh/chị mang theo CMND nhé.',
     'はい、明日の朝9時はいかがですか？身分証明書をお持ちください。',
     false, NULL, 2),
    ('f2000000-0000-0000-1103-000000000001', 'd0000000-0000-0000-1100-000000000001',
     'BẠN', 'あなた',
     'Dạ được ạ. Em là người nước ngoài, em mang hộ chiếu nhé?',
     'はい、大丈夫です。外国人なのでパスポートを持っていけばいいですか？',
     true, NULL, 3),

    -- ── Chapter 11, Lesson 2: Tại phòng khám ──
    ('f2000000-0000-0000-1101-000000000002', 'd0000000-0000-0000-1100-000000000002',
     'BÁC SĨ', '医師',
     'Em bị sao? Kể cho bác sĩ nghe triệu chứng nhé.',
     'どうされましたか？症状を教えてください。',
     false, NULL, 1),
    ('f2000000-0000-0000-1102-000000000002', 'd0000000-0000-0000-1100-000000000002',
     'BẠN', 'あなた',
     'Em bị ho, sổ mũi và hơi sốt từ hai ngày nay ạ.',
     '2日前から咳、鼻水、微熱があります。',
     true, '[{"index":2,"color":"var(--error)"},{"index":3,"color":"var(--error)"},{"index":5,"color":"var(--error)"},{"index":6,"color":"var(--error)"}]', 2),
    ('f2000000-0000-0000-1103-000000000002', 'd0000000-0000-0000-1100-000000000002',
     'BÁC SĨ', '医師',
     'Em bị cảm thôi. Uống thuốc này ngày 3 lần, sau bữa ăn nhé.',
     '風邪ですね。この薬を1日3回、食後に飲んでください。',
     false, NULL, 3),

    -- ── Chapter 11, Lesson 3: Lối sống lành mạnh ──
    ('f2000000-0000-0000-1101-000000000003', 'd0000000-0000-0000-1100-000000000003',
     'ĐỒNG NGHIỆP', '同僚',
     'Dạo này anh tập gym không? Trông anh khỏe hơn rồi đấy!',
     '最近ジムに通ってる？前より元気そうだね！',
     false, NULL, 1),
    ('f2000000-0000-0000-1102-000000000003', 'd0000000-0000-0000-1100-000000000003',
     'BẠN', 'あなた',
     'Ừ, tôi chạy bộ mỗi sáng và ăn nhiều rau hơn. Cảm thấy khỏe hẳn!',
     'うん、毎朝ジョギングして野菜を多く食べてるよ。すごく元気になった！',
     true, '[{"index":2,"color":"var(--primary)"},{"index":3,"color":"var(--primary)"},{"index":7,"color":"var(--secondary)"},{"index":8,"color":"var(--secondary)"}]', 2),
    ('f2000000-0000-0000-1103-000000000003', 'd0000000-0000-0000-1100-000000000003',
     'ĐỒNG NGHIỆP', '同僚',
     'Tuyệt vời! Cuối tuần mình đi bơi ở Hồ Tây không?',
     'すごい！週末、ホータイ湖で泳がない？',
     false, NULL, 3),

    -- ── Chapter 12, Lesson 1: Đặt phòng khách sạn ──
    ('f2000000-0000-0000-1201-000000000001', 'd0000000-0000-0000-1200-000000000001',
     'BẠN', 'あなた',
     'Cho em đặt phòng đôi, 2 đêm, từ thứ sáu tuần này ạ.',
     'ダブルルームを今週の金曜日から2泊予約したいのですが。',
     true, '[{"index":3,"color":"var(--secondary)"},{"index":4,"color":"var(--secondary)"},{"index":5,"color":"var(--primary)"}]', 1),
    ('f2000000-0000-0000-1202-000000000001', 'd0000000-0000-0000-1200-000000000001',
     'LỄ TÂN', 'フロント',
     'Vâng ạ, phòng đôi có view hồ giá 800 nghìn/đêm. Bao gồm bữa sáng.',
     'はい、湖の眺めのダブルルームは1泊80万ドンです。朝食込みです。',
     false, NULL, 2),
    ('f2000000-0000-0000-1203-000000000001', 'd0000000-0000-0000-1200-000000000001',
     'BẠN', 'あなた',
     'Được, em đặt luôn ạ. Thanh toán bằng thẻ được không?',
     'いいですね、予約します。カード払いはできますか？',
     true, NULL, 3),

    -- ── Chapter 12, Lesson 2: Tham quan danh lam thắng cảnh ──
    ('f2000000-0000-0000-1201-000000000002', 'd0000000-0000-0000-1200-000000000002',
     'BẠN', 'あなた',
     'Xin lỗi, vé vào cửa Vịnh Hạ Long bao nhiêu ạ?',
     'すみません、ハロン湾の入場料はいくらですか？',
     true, '[{"index":4,"color":"var(--secondary)"},{"index":5,"color":"var(--secondary)"},{"index":6,"color":"var(--secondary)"}]', 1),
    ('f2000000-0000-0000-1202-000000000002', 'd0000000-0000-0000-1200-000000000002',
     'NHÂN VIÊN', 'スタッフ',
     'Vé người lớn 300 nghìn, trẻ em 150 nghìn. Có cần thuê thuyền không?',
     '大人30万ドン、子供15万ドンです。船のレンタルは必要ですか？',
     false, NULL, 2),
    ('f2000000-0000-0000-1203-000000000002', 'd0000000-0000-0000-1200-000000000002',
     'BẠN', 'あなた',
     'Có, cho em thuê thuyền kayak. Đi khoảng mấy tiếng ạ?',
     'はい、カヤックをレンタルしたいです。何時間くらいかかりますか？',
     true, NULL, 3),

    -- ── Chapter 12, Lesson 3: Kể chuyện du lịch ──
    ('f2000000-0000-0000-1201-000000000003', 'd0000000-0000-0000-1200-000000000003',
     'BẠN VIỆT', 'ベトナム人の友人',
     'Cuối tuần vừa rồi đi đâu chơi vậy?',
     '先週末どこに遊びに行ったの？',
     false, NULL, 1),
    ('f2000000-0000-0000-1202-000000000003', 'd0000000-0000-0000-1200-000000000003',
     'BẠN', 'あなた',
     'Tôi đi Sa Pa. Đẹp lắm! Ruộng bậc thang xanh mướt, khí hậu mát mẻ.',
     'サパに行ったよ。すごくきれい！棚田が青々として、気候も涼しかった。',
     true, '[{"index":2,"color":"var(--primary)"},{"index":3,"color":"var(--primary)"},{"index":5,"color":"var(--secondary)"},{"index":6,"color":"var(--secondary)"},{"index":7,"color":"var(--secondary)"}]', 2),
    ('f2000000-0000-0000-1203-000000000003', 'd0000000-0000-0000-1200-000000000003',
     'BẠN VIỆT', 'ベトナム人の友人',
     'Thích nhỉ! Lần sau mình đi Ninh Bình nhé, cảnh đẹp không kém Sa Pa!',
     'いいなあ！次はニンビンに行こうよ、サパに負けないくらいきれいだよ！',
     false, NULL, 3),

    -- ── Chapter 13, Lesson 1: Ẩm thực đường phố Hà Nội ──
    ('f2000000-0000-0000-1301-000000000001', 'd0000000-0000-0000-1300-000000000001',
     'BẠN', 'あなた',
     'Chị ơi, phở này có những gì trong đó ạ?',
     'すみません、このフォーには何が入っていますか？',
     true, '[{"index":2,"color":"var(--secondary)"}]', 1),
    ('f2000000-0000-0000-1302-000000000001', 'd0000000-0000-0000-1300-000000000001',
     'BÁN HÀNG', '店員',
     'Có bánh phở, thịt bò tái, hành, rau mùi, giá đỗ. Em ăn cay không?',
     'フォー麺、レア牛肉、ネギ、パクチー、もやしです。辛いの食べる？',
     false, NULL, 2),
    ('f2000000-0000-0000-1303-000000000001', 'd0000000-0000-0000-1300-000000000001',
     'BẠN', 'あなた',
     'Em không ăn cay. Cho em thêm chanh và tương ớt riêng nhé.',
     '辛いのは食べません。ライムとチリソースを別で付けてください。',
     true, NULL, 3),

    -- ── Chapter 13, Lesson 2: Nấu ăn với bạn Việt ──
    ('f2000000-0000-0000-1301-000000000002', 'd0000000-0000-0000-1300-000000000002',
     'BẠN VIỆT', 'ベトナム人の友人',
     'Hôm nay mình nấu phở bò nhé! Em rửa rau, chị ninh xương.',
     '今日は牛肉フォーを作ろう！あなたは野菜を洗って、私は骨を煮るね。',
     false, NULL, 1),
    ('f2000000-0000-0000-1302-000000000002', 'd0000000-0000-0000-1300-000000000002',
     'BẠN', 'あなた',
     'Nước dùng cần gì? Xương bò, gừng, hoa hồi, quế phải không?',
     'スープには何が必要？牛骨、生姜、八角、シナモンですよね？',
     true, '[{"index":2,"color":"var(--primary)"},{"index":4,"color":"var(--secondary)"},{"index":5,"color":"var(--secondary)"},{"index":6,"color":"var(--secondary)"},{"index":7,"color":"var(--secondary)"}]', 2),
    ('f2000000-0000-0000-1303-000000000002', 'd0000000-0000-0000-1300-000000000002',
     'BẠN VIỆT', 'ベトナム人の友人',
     'Đúng rồi! Thêm nước mắm, đường phèn. Ninh 3 tiếng là ngon nhất!',
     'その通り！ヌクマムと氷砂糖を加えて。3時間煮込むのが一番美味しい！',
     false, NULL, 3),

    -- ── Chapter 13, Lesson 3: Văn hóa nhậu & Cà phê ──
    ('f2000000-0000-0000-1301-000000000003', 'd0000000-0000-0000-1300-000000000003',
     'ĐỒNG NGHIỆP', '同僚',
     'Tối nay đi nhậu không? Có quán bia hơi ngon lắm gần đây!',
     '今夜飲みに行かない？近くに美味しいビアホイがあるよ！',
     false, NULL, 1),
    ('f2000000-0000-0000-1302-000000000003', 'd0000000-0000-0000-1300-000000000003',
     'BẠN', 'あなた',
     'Đi chứ! Bia hơi là gì? Khác gì với bia lon vậy?',
     '行こう！ビアホイって何？缶ビールと何が違うの？',
     true, '[{"index":2,"color":"var(--secondary)"},{"index":3,"color":"var(--secondary)"}]', 2),
    ('f2000000-0000-0000-1303-000000000003', 'd0000000-0000-0000-1300-000000000003',
     'ĐỒNG NGHIỆP', '同僚',
     'Bia tươi, rẻ lắm! Một cốc chỉ 10 nghìn. Nhớ nói "Một, hai, ba, dô!"',
     '生ビールで超安い！一杯1万ドンだけ。「モッ・ハイ・バー・ゾー！」って言うんだよ！',
     false, NULL, 3),

    -- ── Chapter 14, Lesson 1: Nói về gia đình ──
    ('f2000000-0000-0000-1401-000000000001', 'd0000000-0000-0000-1400-000000000001',
     'BẠN VIỆT', 'ベトナム人の友人',
     'Gia đình em có mấy người? Bố mẹ em còn ở Nhật à?',
     '家族は何人？ご両親はまだ日本にいるの？',
     false, NULL, 1),
    ('f2000000-0000-0000-1402-000000000001', 'd0000000-0000-0000-1400-000000000001',
     'BẠN', 'あなた',
     'Gia đình em có 4 người: bố, mẹ, em và em gái. Bố mẹ ở Tokyo.',
     '家族は4人です：父、母、私、妹。両親は東京にいます。',
     true, '[{"index":5,"color":"var(--primary)"},{"index":6,"color":"var(--primary)"},{"index":9,"color":"var(--secondary)"},{"index":10,"color":"var(--secondary)"}]', 2),
    ('f2000000-0000-0000-1403-000000000001', 'd0000000-0000-0000-1400-000000000001',
     'BẠN VIỆT', 'ベトナム人の友人',
     'Nhớ nhà không? Ở Việt Nam, gia đình rất quan trọng, ai cũng gần gũi.',
     'ホームシックにならない？ベトナムでは家族がとても大切で、みんな仲が良いよ。',
     false, NULL, 3),

    -- ── Chapter 14, Lesson 2: Được mời đến nhà người Việt ──
    ('f2000000-0000-0000-1401-000000000002', 'd0000000-0000-0000-1400-000000000002',
     'BẠN VIỆT', 'ベトナム人の友人',
     'Chủ nhật em đến nhà chị ăn cơm nhé! Cả gia đình chị nấu đón em.',
     '日曜日にうちにご飯食べに来て！家族みんなで歓迎するよ。',
     false, NULL, 1),
    ('f2000000-0000-0000-1402-000000000002', 'd0000000-0000-0000-1400-000000000002',
     'BẠN', 'あなた',
     'Vui quá! Em nên mang gì đến ạ? Hoa hay trái cây?',
     '嬉しいです！何を持っていけばいいですか？花？果物？',
     true, '[{"index":5,"color":"var(--secondary)"}]', 2),
    ('f2000000-0000-0000-1403-000000000002', 'd0000000-0000-0000-1400-000000000002',
     'BẠN VIỆT', 'ベトナム人の友人',
     'Mang trái cây là được! Đến nhà nhớ chào bố mẹ chị trước nhé.',
     '果物を持ってきて！家に着いたら、まず両親に挨拶してね。',
     false, NULL, 3),

    -- ── Chapter 14, Lesson 3: Tình yêu & Hẹn hò ──
    ('f2000000-0000-0000-1401-000000000003', 'd0000000-0000-0000-1400-000000000003',
     'BẠN VIỆT', 'ベトナム人の友人',
     'Em có người yêu chưa? Ở Việt Nam hẹn hò khác Nhật đấy!',
     '恋人はいる？ベトナムのデートは日本と違うよ！',
     false, NULL, 1),
    ('f2000000-0000-0000-1402-000000000003', 'd0000000-0000-0000-1400-000000000003',
     'BẠN', 'あなた',
     'Chưa có. Khác thế nào? Ở Nhật thì thường kokuhaku trước.',
     'まだいないよ。どう違うの？日本では先に告白するのが普通なんだけど。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"}]', 2),
    ('f2000000-0000-0000-1403-000000000003', 'd0000000-0000-0000-1400-000000000003',
     'BẠN VIỆT', 'ベトナム人の友人',
     'Ở đây con trai phải "tán" trước — mời đi ăn, tặng hoa, nhắn tin nhiều!',
     'こっちは男性が先に「アプローチ」するの — 食事に誘って、花を贈って、たくさんメッセージを送るの！',
     false, NULL, 3),

    -- ── Chapter 15, Lesson 1: Đọc tin tức tiếng Việt ──
    ('f2000000-0000-0000-1501-000000000001', 'd0000000-0000-0000-1500-000000000001',
     'GIÁO VIÊN', '先生',
     'Hôm nay đọc tin này: "Giá xăng tăng 500 đồng/lít từ ngày mai."',
     '今日はこのニュースを読みましょう：「ガソリン価格が明日からリットル500ドン値上げ」',
     false, NULL, 1),
    ('f2000000-0000-0000-1502-000000000001', 'd0000000-0000-0000-1500-000000000001',
     'BẠN', 'あなた',
     '"Giá xăng tăng" nghĩa là gì? "Tăng" là lên cao phải không?',
     '「giá xăng tăng」はどういう意味ですか？「tăng」は上がるという意味ですか？',
     true, '[{"index":1,"color":"var(--secondary)"},{"index":2,"color":"var(--secondary)"},{"index":3,"color":"var(--primary)"}]', 2),
    ('f2000000-0000-0000-1503-000000000001', 'd0000000-0000-0000-1500-000000000001',
     'GIÁO VIÊN', '先生',
     'Đúng! "Tăng" = lên, "giảm" = xuống. Đọc tin giúp tăng vốn từ rất nhanh!',
     'その通り！「tăng」=上がる、「giảm」=下がる。ニュースを読むと語彙が急速に増えますよ！',
     false, NULL, 3),

    -- ── Chapter 15, Lesson 2: Bày tỏ quan điểm ──
    ('f2000000-0000-0000-1501-000000000002', 'd0000000-0000-0000-1500-000000000002',
     'GIÁO VIÊN', '先生',
     'Theo bạn, nên cấm xe máy trong trung tâm thành phố không?',
     'あなたの意見では、市内中心部でバイクを禁止すべきですか？',
     false, NULL, 1),
    ('f2000000-0000-0000-1502-000000000002', 'd0000000-0000-0000-1500-000000000002',
     'BẠN', 'あなた',
     'Theo tôi, không nên cấm hoàn toàn. Nếu cấm thì người dân đi lại rất khó.',
     '私の意見では、完全に禁止すべきではないと思います。禁止したら住民の移動がとても困難になります。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":6,"color":"var(--secondary)"}]', 2),
    ('f2000000-0000-0000-1503-000000000002', 'd0000000-0000-0000-1500-000000000002',
     'GIÁO VIÊN', '先生',
     'Lập luận tốt! Bạn dùng "Nếu... thì" rất chuẩn. Thử thêm "Tuy... nhưng" xem!',
     'いい論理ですね！「Nếu...thì」をうまく使えています。「Tuy...nhưng」も試してみて！',
     false, NULL, 3),

    -- ── Chapter 15, Lesson 3: Mạng xã hội & Từ lóng ──
    ('f2000000-0000-0000-1501-000000000003', 'd0000000-0000-0000-1500-000000000003',
     'BẠN VIỆT', 'ベトナム人の友人',
     'Em biết "đỉnh nóc kịch trần" không? Giới trẻ Việt hay nói lắm!',
     '「đỉnh nóc kịch trần」って知ってる？ベトナムの若者がよく使うよ！',
     false, NULL, 1),
    ('f2000000-0000-0000-1502-000000000003', 'd0000000-0000-0000-1500-000000000003',
     'BẠN', 'あなた',
     'Không biết! Nghĩa là gì vậy? Tiếng Việt có nhiều từ lóng quá!',
     '知らない！どういう意味？ベトナム語はスラングが多すぎ！',
     true, '[{"index":6,"color":"var(--secondary)"},{"index":7,"color":"var(--secondary)"},{"index":8,"color":"var(--secondary)"}]', 2),
    ('f2000000-0000-0000-1503-000000000003', 'd0000000-0000-0000-1500-000000000003',
     'BẠN VIỆT', 'ベトナム人の友人',
     'Nghĩa là "tuyệt vời nhất"! Giống "最高" trong tiếng Nhật.',
     '「最高に素晴らしい」という意味！日本語の「最高」に似てるよ。',
     false, NULL, 3),

    -- ── Chapter 16, Lesson 1: Thuê nhà tại Hà Nội ──
    ('f2000000-0000-0000-1601-000000000001', 'd0000000-0000-0000-1600-000000000001',
     'BẠN', 'あなた',
     'Em muốn thuê phòng trọ gần Cầu Giấy. Giá khoảng bao nhiêu?',
     'カウザイ近くの部屋を借りたいんですが、相場はどのくらいですか？',
     true, '[{"index":3,"color":"var(--secondary)"},{"index":4,"color":"var(--secondary)"}]', 1),
    ('f2000000-0000-0000-1602-000000000001', 'd0000000-0000-0000-1600-000000000001',
     'CHỦ NHÀ', '大家さん',
     'Phòng 25 mét vuông, có điều hòa, nóng lạnh. 4 triệu/tháng, chưa điện nước.',
     '25平米、エアコン、温水器付き。月400万ドン、水道光熱費別。',
     false, NULL, 2),
    ('f2000000-0000-0000-1603-000000000001', 'd0000000-0000-0000-1600-000000000001',
     'BẠN', 'あなた',
     'Hợp đồng mấy tháng? Có cọc không? Em xem phòng được không ạ?',
     '契約は何ヶ月ですか？敷金はありますか？部屋を見てもいいですか？',
     true, NULL, 3),

    -- ── Chapter 16, Lesson 2: Ngân hàng & Thủ tục hành chính ──
    ('f2000000-0000-0000-1601-000000000002', 'd0000000-0000-0000-1600-000000000002',
     'BẠN', 'あなた',
     'Em muốn mở tài khoản ngân hàng. Em cần giấy tờ gì ạ?',
     '銀行口座を開設したいのですが、何の書類が必要ですか？',
     true, '[{"index":3,"color":"var(--secondary)"},{"index":4,"color":"var(--secondary)"},{"index":5,"color":"var(--secondary)"}]', 1),
    ('f2000000-0000-0000-1602-000000000002', 'd0000000-0000-0000-1600-000000000002',
     'NHÂN VIÊN NGÂN HÀNG', '銀行員',
     'Em cần hộ chiếu, visa còn hạn và giấy tạm trú. Mất khoảng 30 phút.',
     'パスポート、有効なビザ、一時滞在証明書が必要です。約30分かかります。',
     false, NULL, 2),
    ('f2000000-0000-0000-1603-000000000002', 'd0000000-0000-0000-1600-000000000002',
     'BẠN', 'あなた',
     'Em muốn đăng ký Internet Banking luôn. Có app điện thoại không?',
     'インターネットバンキングも登録したいです。スマホアプリはありますか？',
     true, NULL, 3),

    -- ── Chapter 16, Lesson 3: So sánh Việt Nam & Nhật Bản ──
    ('f2000000-0000-0000-1601-000000000003', 'd0000000-0000-0000-1600-000000000003',
     'ĐỒNG NGHIỆP', '同僚',
     'Sống ở Việt Nam có khác Nhật nhiều không? Quen chưa?',
     'ベトナムでの生活は日本と大きく違う？もう慣れた？',
     false, NULL, 1),
    ('f2000000-0000-0000-1602-000000000003', 'd0000000-0000-0000-1600-000000000003',
     'BẠN', 'あなた',
     'Khác nhiều! Ở Nhật mọi thứ đúng giờ, ở đây linh hoạt hơn. Nhưng đồ ăn Việt Nam ngon hơn!',
     'かなり違う！日本はすべて時間通りだけど、こっちは柔軟。でもベトナム料理の方が美味しい！',
     true, '[{"index":5,"color":"var(--primary)"},{"index":6,"color":"var(--primary)"},{"index":10,"color":"var(--secondary)"},{"index":11,"color":"var(--secondary)"}]', 2),
    ('f2000000-0000-0000-1603-000000000003', 'd0000000-0000-0000-1600-000000000003',
     'ĐỒNG NGHIỆP', '同僚',
     'Ha ha! Người Nhật lúc nào cũng khen đồ ăn Việt Nam!',
     'はは！日本人はいつもベトナム料理を褒めるよね！',
     false, NULL, 3)
ON CONFLICT (dialogue_id) DO UPDATE SET
    lesson_id            = EXCLUDED.lesson_id,
    speaker              = EXCLUDED.speaker,
    speaker_jp           = EXCLUDED.speaker_jp,
    line_vi              = EXCLUDED.line_vi,
    line_jp              = EXCLUDED.line_jp,
    is_active            = EXCLUDED.is_active,
    highlight_words_json = EXCLUDED.highlight_words_json,
    sort_order           = EXCLUDED.sort_order;


COMMIT;