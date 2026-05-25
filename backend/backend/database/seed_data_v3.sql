-- =============================================================================
-- VietImmerse — Seed Data V3: Trình độ Cao cấp (Idempotent UPSERT)
-- =============================================================================
-- This file is the V3 (Advanced / B2-C1) companion to seed_data.sql.
-- It must run AFTER seed_data.sql (which creates content_levels & chapters).
-- Uses INSERT ... ON CONFLICT DO UPDATE — safe to run multiple times.
-- =============================================================================

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 0. CONTENT LEVEL V3
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO content_levels (level_id, display_name, description, sort_order) VALUES
    (3, 'V3', 'Trình độ V3 — Cao cấp', 3)
ON CONFLICT (level_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description  = EXCLUDED.description,
    sort_order   = EXCLUDED.sort_order;

SELECT setval(pg_get_serial_sequence('content_levels', 'level_id'), GREATEST(3, (SELECT MAX(level_id) FROM content_levels)));

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. V3 CHAPTERS (17–24)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO chapters (chapter_id, level_id, title_vi, title_jp, icon, sort_order) VALUES
    (17, 3, 'Chương 1: Thành ngữ & Tục ngữ',         '第1章：慣用句とことわざ',           'auto_stories',      1),
    (18, 3, 'Chương 2: Đàm phán & Thương lượng',      '第2章：交渉と商談',                'handshake',         2),
    (19, 3, 'Chương 3: Môi trường & Phát triển',       '第3章：環境と開発',                'eco',               3),
    (20, 3, 'Chương 4: Văn học & Nghệ thuật',          '第4章：文学と芸術',                'palette',           4),
    (21, 3, 'Chương 5: Kinh tế & Khởi nghiệp',        '第5章：経済と起業',                'trending_up',       5),
    (22, 3, 'Chương 6: Phương ngữ & Giọng vùng miền', '第6章：方言と地方のアクセント',       'map',               6),
    (23, 3, 'Chương 7: Thuyết trình & Diễn thuyết',   '第7章：プレゼンと演説',              'podium',            7),
    (24, 3, 'Chương 8: Triết lý & Giá trị sống',      '第8章：哲学と人生の価値観',          'psychology',        8)
ON CONFLICT (chapter_id) DO UPDATE SET
    level_id   = EXCLUDED.level_id,
    title_vi   = EXCLUDED.title_vi,
    title_jp   = EXCLUDED.title_jp,
    icon       = EXCLUDED.icon,
    sort_order = EXCLUDED.sort_order;

SELECT setval(pg_get_serial_sequence('chapters', 'chapter_id'), GREATEST(24, (SELECT MAX(chapter_id) FROM chapters)));

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. V3 LESSONS (Chapters 17–24)
-- ═══════════════════════════════════════════════════════════════════════════════
-- UUID pattern: d0000000-0000-0000-CC00-00000000000L  (CC=17–24)

INSERT INTO lessons (lesson_id, chapter_id, scene_label, scene_label_jp, title_vi, title_jp, subtitle_vi, subtitle_jp, tag, tag_jp, duration_minutes, sort_order, is_locked, created_at) VALUES
    -- Chapter 17: Thành ngữ & Tục ngữ
    ('d0000000-0000-0000-1700-000000000001', 17, 'Bài 01 • Chương 1', 'レッスン01 • 第1章', 'Thành ngữ về con người', '人に関する慣用句', 'Ăn cháo đá bát, Nước đổ đầu vịt — hiểu và dùng thành ngữ tự nhiên', 'よく使う慣用句を理解し自然に使いこなそう', 'Cao cấp', '上級', 15, 1, false, NOW()),
    ('d0000000-0000-0000-1700-000000000002', 17, 'Bài 02 • Chương 1', 'レッスン02 • 第1章', 'Tục ngữ triết lý sống', 'ことわざの人生哲学', 'Có chí thì nên, Gần mực thì đen — triết lý ẩn sau tục ngữ Việt', '「志あれば成る」「朱に交われば赤くなる」— ことわざに隠された哲学', 'Cao cấp', '上級', 15, 2, false, NOW()),
    ('d0000000-0000-0000-1700-000000000003', 17, 'Bài 03 • Chương 1', 'レッスン03 • 第1章', 'Vận dụng thành ngữ trong giao tiếp', '会話での慣用句の活用', 'Đặt thành ngữ vào hội thoại thực tế — nói như người bản ngữ', '慣用句を実際の会話に取り入れてネイティブのように話そう', 'Cao cấp', '上級', 12, 3, false, NOW()),

    -- Chapter 18: Đàm phán & Thương lượng
    ('d0000000-0000-0000-1800-000000000001', 18, 'Bài 01 • Chương 2', 'レッスン01 • 第2章', 'Đàm phán hợp đồng', '契約交渉', 'Điều khoản, thỏa thuận, nhượng bộ — ngôn ngữ đàm phán chuyên nghiệp', '条項、合意、譲歩 — プロの交渉言語', 'Cao cấp', '上級', 15, 1, false, NOW()),
    ('d0000000-0000-0000-1800-000000000002', 18, 'Bài 02 • Chương 2', 'レッスン02 • 第2章', 'Giải quyết xung đột', '紛争解決', 'Xin lỗi chuyên nghiệp, hòa giải và tìm giải pháp đôi bên cùng có lợi', 'ビジネス謝罪、仲裁、Win-Winの解決策を見つける', 'Cao cấp', '上級', 15, 2, false, NOW()),
    ('d0000000-0000-0000-1800-000000000003', 18, 'Bài 03 • Chương 2', 'レッスン03 • 第2章', 'Thuyết phục & Đề xuất', '説得と提案', 'Kỹ thuật thuyết phục bằng tiếng Việt — từ nhẹ nhàng đến mạnh mẽ', 'ベトナム語での説得テクニック — 穏やかな表現から強い表現まで', 'Cao cấp', '上級', 12, 3, false, NOW()),

    -- Chapter 19: Môi trường & Phát triển
    ('d0000000-0000-0000-1900-000000000001', 19, 'Bài 01 • Chương 3', 'レッスン01 • 第3章', 'Ô nhiễm & Biến đổi khí hậu', '汚染と気候変動', 'Thảo luận về rác thải, khí thải và tác động đến Việt Nam', 'ゴミ、排気ガス、ベトナムへの影響について議論する', 'Cao cấp', '上級', 15, 1, false, NOW()),
    ('d0000000-0000-0000-1900-000000000002', 19, 'Bài 02 • Chương 3', 'レッスン02 • 第3章', 'Năng lượng xanh & Bền vững', 'グリーンエネルギーと持続可能性', 'Điện mặt trời, xe điện, nông nghiệp hữu cơ — xu hướng xanh tại Việt Nam', '太陽光発電、電気自動車、有機農業 — ベトナムの環境トレンド', 'Cao cấp', '上級', 12, 2, false, NOW()),
    ('d0000000-0000-0000-1900-000000000003', 19, 'Bài 03 • Chương 3', 'レッスン03 • 第3章', 'Đô thị hóa & Nông thôn mới', '都市化とニューラル', 'Sự chuyển đổi từ nông thôn sang thành thị — thách thức và cơ hội', '農村から都市への移行 — 課題と機会', 'Cao cấp', '上級', 12, 3, false, NOW()),

    -- Chapter 20: Văn học & Nghệ thuật
    ('d0000000-0000-0000-2000-000000000001', 20, 'Bài 01 • Chương 4', 'レッスン01 • 第4章', 'Truyện Kiều & Văn học cổ điển', 'キエウ物語と古典文学', 'Đọc hiểu Truyện Kiều — tác phẩm vĩ đại nhất của văn học Việt Nam', 'キエウ物語を読む — ベトナム文学の最高傑作', 'Văn hóa', '文化', 15, 1, false, NOW()),
    ('d0000000-0000-0000-2000-000000000002', 20, 'Bài 02 • Chương 4', 'レッスン02 • 第4章', 'Âm nhạc truyền thống & Hiện đại', '伝統音楽と現代音楽', 'Từ ca trù, quan họ đến V-Pop — âm nhạc Việt qua các thời kỳ', 'カーチュー、クアンホーからV-Popまで — ベトナム音楽の変遷', 'Văn hóa', '文化', 12, 2, false, NOW()),
    ('d0000000-0000-0000-2000-000000000003', 20, 'Bài 03 • Chương 4', 'レッスン03 • 第4章', 'Điện ảnh & Sân khấu Việt Nam', 'ベトナムの映画と舞台芸術', 'Phim Việt nổi tiếng, kịch nói và nghệ thuật tuồng chèo', '有名なベトナム映画、現代劇、トゥオン・チェオの伝統芸能', 'Văn hóa', '文化', 12, 3, false, NOW()),

    -- Chapter 21: Kinh tế & Khởi nghiệp
    ('d0000000-0000-0000-2100-000000000001', 21, 'Bài 01 • Chương 5', 'レッスン01 • 第5章', 'Nền kinh tế Việt Nam', 'ベトナム経済', 'GDP, FDI, xuất nhập khẩu — phân tích kinh tế bằng tiếng Việt', 'GDP、FDI、輸出入 — ベトナム語で経済分析する', 'Cao cấp', '上級', 15, 1, false, NOW()),
    ('d0000000-0000-0000-2100-000000000002', 21, 'Bài 02 • Chương 5', 'レッスン02 • 第5章', 'Khởi nghiệp tại Việt Nam', 'ベトナムでの起業', 'Startup, gọi vốn, mô hình kinh doanh — thế giới khởi nghiệp Việt', 'スタートアップ、資金調達、ビジネスモデル — ベトナムの起業世界', 'Cao cấp', '上級', 15, 2, false, NOW()),
    ('d0000000-0000-0000-2100-000000000003', 21, 'Bài 03 • Chương 5', 'レッスン03 • 第5章', 'Thị trường chứng khoán & Đầu tư', '株式市場と投資', 'Cổ phiếu, lãi suất, rủi ro — nói về tài chính như chuyên gia', '株式、金利、リスク — 専門家のように金融を語る', 'Cao cấp', '上級', 12, 3, false, NOW()),

    -- Chapter 22: Phương ngữ & Giọng vùng miền
    ('d0000000-0000-0000-2200-000000000001', 22, 'Bài 01 • Chương 6', 'レッスン01 • 第6章', 'Giọng Bắc vs Giọng Nam', '北部弁 vs 南部弁', 'So sánh phát âm, từ vựng và ngữ pháp giữa hai miền', '南北の発音、語彙、文法の違いを比較する', 'Cao cấp', '上級', 15, 1, false, NOW()),
    ('d0000000-0000-0000-2200-000000000002', 22, 'Bài 02 • Chương 6', 'レッスン02 • 第6章', 'Giọng Huế & Miền Trung', 'フエ弁と中部方言', 'Nghe hiểu giọng Huế — âm sắc đặc trưng và từ vựng riêng', 'フエ方言のリスニング — 独特な音色と固有の語彙', 'Cao cấp', '上級', 12, 2, false, NOW()),
    ('d0000000-0000-0000-2200-000000000003', 22, 'Bài 03 • Chương 6', 'レッスン03 • 第6章', 'Từ vựng địa phương & Tiếng lóng vùng', '地方語彙と地域スラング', 'Mỗi vùng một kiểu nói — "chi" hay "gì", "rứa" hay "vậy"', '地方ごとの言い回し — 「chi」と「gì」、「rứa」と「vậy」', 'Cao cấp', '上級', 12, 3, false, NOW()),

    -- Chapter 23: Thuyết trình & Diễn thuyết
    ('d0000000-0000-0000-2300-000000000001', 23, 'Bài 01 • Chương 7', 'レッスン01 • 第7章', 'Cấu trúc bài thuyết trình', 'プレゼンの構成', 'Mở đầu, thân bài, kết luận — trình bày mạch lạc bằng tiếng Việt', '序論、本論、結論 — ベトナム語で論理的に発表する', 'Cao cấp', '上級', 15, 1, false, NOW()),
    ('d0000000-0000-0000-2300-000000000002', 23, 'Bài 02 • Chương 7', 'レッスン02 • 第7章', 'Kỹ năng tranh luận', 'ディベートスキル', 'Phản biện, dẫn chứng, bảo vệ quan điểm — tranh luận chuyên nghiệp', '反論、根拠提示、主張の擁護 — プロのディベート', 'Cao cấp', '上級', 15, 2, false, NOW()),
    ('d0000000-0000-0000-2300-000000000003', 23, 'Bài 03 • Chương 7', 'レッスン03 • 第7章', 'Phát biểu trước công chúng', 'パブリックスピーキング', 'Diễn văn, phát biểu tại sự kiện — truyền cảm hứng bằng tiếng Việt', 'スピーチ、イベントでの挨拶 — ベトナム語で人を感動させる', 'Cao cấp', '上級', 12, 3, false, NOW()),

    -- Chapter 24: Triết lý & Giá trị sống
    ('d0000000-0000-0000-2400-000000000001', 24, 'Bài 01 • Chương 8', 'レッスン01 • 第8章', 'Quan niệm hạnh phúc', '幸福の概念', 'Người Việt định nghĩa hạnh phúc thế nào? So sánh với ikigai Nhật Bản', 'ベトナム人はどう幸福を定義する？日本の「生きがい」との比較', 'Cao cấp', '上級', 15, 1, false, NOW()),
    ('d0000000-0000-0000-2400-000000000002', 24, 'Bài 02 • Chương 8', 'レッスン02 • 第8章', 'Thế hệ trẻ & Giá trị mới', '若い世代と新しい価値観', 'Xung đột thế hệ, tự do cá nhân vs truyền thống — giới trẻ Việt nghĩ gì?', '世代間の衝突、個人の自由vs伝統 — ベトナムの若者は何を考える？', 'Cao cấp', '上級', 15, 2, false, NOW()),
    ('d0000000-0000-0000-2400-000000000003', 24, 'Bài 03 • Chương 8', 'レッスン03 • 第8章', 'Bài học cuối: Tổng kết hành trình', '最終レッスン：旅の総まとめ', 'Nhìn lại hành trình từ V1 đến V3 — bạn đã trưởng thành thế nào?', 'V1からV3までの旅を振り返る — あなたはどう成長した？', 'Cao cấp', '上級', 15, 3, false, NOW())
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
-- 3. V3 TONE NOTES (Advanced grammar & expression notes)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO lesson_tone_notes (note_id, lesson_id, tone, desc_vi, desc_jp, example, color, sort_order) VALUES
    -- Ch17-L1: Thành ngữ — cấu trúc hình ảnh
    ('e1000000-0000-0000-1701-000000000001', 'd0000000-0000-0000-1700-000000000001',
     'Ăn A đá B',
     'Cấu trúc thành ngữ kiểu hành động đối nghịch — nhận ơn rồi phản bội',
     '矛盾する行動の慣用句構造 — 恩を受けて裏切る',
     'Ăn cháo đá bát = Nhận ơn rồi quay lưng', 'var(--error)', 1),

    ('e1000000-0000-0000-1702-000000000001', 'd0000000-0000-0000-1700-000000000001',
     'A như B (So sánh)',
     'Cấu trúc so sánh hình tượng — dùng hình ảnh cụ thể để miêu tả trừu tượng',
     '比喩的な比較構造 — 具体的なイメージで抽象を表す',
     'Nhanh như chớp, chậm như rùa', 'var(--primary)', 2),

    -- Ch17-L2: Tục ngữ — cấu trúc đối xứng
    ('e1000000-0000-0000-1701-000000000002', 'd0000000-0000-0000-1700-000000000002',
     'Gần A thì B, gần C thì D',
     'Cấu trúc đối xứng của tục ngữ — so sánh hai mặt để rút ra bài học',
     'ことわざの対称構造 — 二面を比較し教訓を導く',
     'Gần mực thì đen, gần đèn thì sáng', 'var(--secondary)', 1),

    ('e1000000-0000-0000-1702-000000000002', 'd0000000-0000-0000-1700-000000000002',
     'Có A thì B',
     'Cấu trúc điều kiện - kết quả — triết lý nhân quả trong tục ngữ',
     '条件-結果の構造 — ことわざにおける因果の哲学',
     'Có chí thì nên = Có quyết tâm sẽ thành công', 'var(--primary)', 2),

    -- Ch18-L1: Đàm phán — ngôn ngữ ngoại giao
    ('e1000000-0000-0000-1801-000000000001', 'd0000000-0000-0000-1800-000000000001',
     'Liệu... có thể... không?',
     'Cấu trúc đề nghị lịch sự cấp cao — giảm áp lực cho đối phương',
     '高レベルの丁寧な提案構造 — 相手へのプレッシャーを軽減する',
     'Liệu bên anh có thể xem xét lại điều khoản này không?', 'var(--primary)', 1),

    ('e1000000-0000-0000-1802-000000000001', 'd0000000-0000-0000-1800-000000000001',
     'Chúng tôi đề xuất / kiến nghị',
     'Cách mở đầu đề xuất chính thức trong đàm phán kinh doanh',
     'ビジネス交渉における正式な提案の切り出し方',
     'Chúng tôi đề xuất giảm 10% cho đơn hàng trên 100 triệu', 'var(--secondary)', 2),

    -- Ch23-L2: Tranh luận — cấu trúc phản biện
    ('e1000000-0000-0000-2301-000000000002', 'd0000000-0000-0000-2300-000000000002',
     'Mặc dù... nhưng phải thừa nhận...',
     'Cấu trúc phản biện lịch sự — thừa nhận trước khi phản đối',
     '丁寧な反論構造 — 反対する前に認める',
     'Mặc dù ý kiến đó có lý, nhưng phải thừa nhận rằng...', 'var(--primary)', 1),

    ('e1000000-0000-0000-2302-000000000002', 'd0000000-0000-0000-2300-000000000002',
     'Dựa trên / Căn cứ vào...',
     'Cách dẫn chứng chuyên nghiệp — tăng tính thuyết phục cho lập luận',
     'プロの引用方法 — 議論の説得力を高める',
     'Căn cứ vào số liệu năm 2024, GDP Việt Nam tăng 6.5%', 'var(--secondary)', 2)
ON CONFLICT (note_id) DO UPDATE SET
    lesson_id  = EXCLUDED.lesson_id,
    tone       = EXCLUDED.tone,
    desc_vi    = EXCLUDED.desc_vi,
    desc_jp    = EXCLUDED.desc_jp,
    example    = EXCLUDED.example,
    color      = EXCLUDED.color,
    sort_order = EXCLUDED.sort_order;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. V3 DIALOGUES (Chapters 17–24)
-- ═══════════════════════════════════════════════════════════════════════════════
-- UUID pattern: f3CCLLSS where CC=chapter(17–24), LL=lesson, SS=sort

INSERT INTO lesson_dialogues (dialogue_id, lesson_id, speaker, speaker_jp, line_vi, line_jp, is_active, highlight_words_json, sort_order) VALUES
    -- ── Chapter 17, Lesson 1: Thành ngữ về con người ──
    ('f3000000-0000-0000-1701-000000000001', 'd0000000-0000-0000-1700-000000000001',
     'GIÁO VIÊN', '先生',
     'Hôm nay học thành ngữ. Bạn biết "ăn cháo đá bát" không?',
     '今日は慣用句を学びます。「ăn cháo đá bát」を知っていますか？',
     false, NULL, 1),
    ('f3000000-0000-0000-1702-000000000001', 'd0000000-0000-0000-1700-000000000001',
     'BẠN', 'あなた',
     'Ăn cháo rồi đá cái bát à? Nghĩa đen là ăn cháo xong ném bát đi?',
     'おかゆを食べてお椀を蹴る？文字通りの意味はお椀を捨てるということ？',
     true, '[{"index":0,"color":"var(--error)"},{"index":1,"color":"var(--error)"},{"index":3,"color":"var(--error)"},{"index":5,"color":"var(--secondary)"}]', 2),
    ('f3000000-0000-0000-1703-000000000001', 'd0000000-0000-0000-1700-000000000001',
     'GIÁO VIÊN', '先生',
     'Đúng vậy! Nghĩa bóng là nhận ơn rồi phản bội. Giống "恩を仇で返す" tiếng Nhật.',
     'その通り！比喩的な意味は、恩を受けて裏切ること。日本語の「恩を仇で返す」と同じです。',
     false, NULL, 3),

    -- ── Chapter 17, Lesson 2: Tục ngữ triết lý sống ──
    ('f3000000-0000-0000-1701-000000000002', 'd0000000-0000-0000-1700-000000000002',
     'GIÁO VIÊN', '先生',
     '"Gần mực thì đen, gần đèn thì sáng." Câu này dạy ta điều gì?',
     '「墨に近づけば黒くなり、灯に近づけば明るくなる。」この文は何を教えていますか？',
     false, NULL, 1),
    ('f3000000-0000-0000-1702-000000000002', 'd0000000-0000-0000-1700-000000000002',
     'BẠN', 'あなた',
     'Môi trường xung quanh ảnh hưởng đến con người. Giống "朱に交われば赤くなる" phải không?',
     '周囲の環境が人に影響を与えるということですね。「朱に交われば赤くなる」と同じですか？',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":2,"color":"var(--primary)"},{"index":3,"color":"var(--secondary)"}]', 2),
    ('f3000000-0000-0000-1703-000000000002', 'd0000000-0000-0000-1700-000000000002',
     'GIÁO VIÊN', '先生',
     'Chính xác! Hãy nhớ: "Có chí thì nên" — có quyết tâm sẽ thành công!',
     '正解！覚えましょう：「Có chí thì nên」— 意志があれば成し遂げられる！',
     false, NULL, 3),

    -- ── Chapter 17, Lesson 3: Vận dụng thành ngữ ──
    ('f3000000-0000-0000-1701-000000000003', 'd0000000-0000-0000-1700-000000000003',
     'ĐỒNG NGHIỆP', '同僚',
     'Dạo này sếp bắt làm thêm hoài, mệt quá! Thật là "một cổ hai tròng"!',
     '最近ボスがずっと残業させるんだ、疲れた！まさに「一つの首に二つの枷」だよ！',
     false, NULL, 1),
    ('f3000000-0000-0000-1702-000000000003', 'd0000000-0000-0000-1700-000000000003',
     'BẠN', 'あなた',
     'Ừ, "chân cứng đá mềm" nhé! Kiên trì rồi sẽ qua thôi.',
     'うん、「足は硬く石は柔らかく」だよ！頑張れば乗り越えられるさ。',
     true, '[{"index":1,"color":"var(--secondary)"},{"index":2,"color":"var(--secondary)"},{"index":3,"color":"var(--secondary)"},{"index":4,"color":"var(--secondary)"}]', 2),
    ('f3000000-0000-0000-1703-000000000003', 'd0000000-0000-0000-1700-000000000003',
     'ĐỒNG NGHIỆP', '同僚',
     'Ha, bạn dùng thành ngữ giỏi thật đấy! Nói tiếng Việt như người bản xứ rồi!',
     'はは、慣用句の使い方上手いね！もうネイティブみたいだよ！',
     false, NULL, 3),

    -- ── Chapter 18, Lesson 1: Đàm phán hợp đồng ──
    ('f3000000-0000-0000-1801-000000000001', 'd0000000-0000-0000-1800-000000000001',
     'ĐỐI TÁC', '取引先',
     'Về điều khoản thanh toán, bên chúng tôi đề nghị trả trước 50%.',
     '支払い条件について、前払い50%を提案します。',
     false, NULL, 1),
    ('f3000000-0000-0000-1802-000000000001', 'd0000000-0000-0000-1800-000000000001',
     'BẠN', 'あなた',
     'Tôi hiểu. Tuy nhiên, liệu bên anh có thể chấp nhận 30% trước, 70% sau khi giao hàng không?',
     '理解しました。ただ、前払い30%、残り70%は納品後というのは受け入れ可能でしょうか？',
     true, '[{"index":3,"color":"var(--primary)"},{"index":4,"color":"var(--secondary)"},{"index":8,"color":"var(--secondary)"},{"index":9,"color":"var(--secondary)"}]', 2),
    ('f3000000-0000-0000-1803-000000000001', 'd0000000-0000-0000-1800-000000000001',
     'ĐỐI TÁC', '取引先',
     'Chúng tôi sẽ xem xét. Nếu đảm bảo giao hàng đúng hạn thì có thể thương lượng.',
     '検討します。納期通りに納品が保証されれば、交渉の余地はあります。',
     false, NULL, 3),

    -- ── Chapter 18, Lesson 2: Giải quyết xung đột ──
    ('f3000000-0000-0000-1801-000000000002', 'd0000000-0000-0000-1800-000000000002',
     'KHÁCH HÀNG', 'クライアント',
     'Lô hàng vừa rồi bị lỗi 15%. Chúng tôi rất thất vọng về chất lượng.',
     '前回のロットは15%が不良品でした。品質に非常に失望しています。',
     false, NULL, 1),
    ('f3000000-0000-0000-1802-000000000002', 'd0000000-0000-0000-1800-000000000002',
     'BẠN', 'あなた',
     'Chúng tôi thành thật xin lỗi. Chúng tôi cam kết đổi hàng mới và chịu phí vận chuyển.',
     '心よりお詫び申し上げます。新品への交換と送料の負担をお約束します。',
     true, '[{"index":2,"color":"var(--error)"},{"index":3,"color":"var(--error)"},{"index":4,"color":"var(--error)"},{"index":6,"color":"var(--primary)"}]', 2),
    ('f3000000-0000-0000-1803-000000000002', 'd0000000-0000-0000-1800-000000000002',
     'KHÁCH HÀNG', 'クライアント',
     'Được, chúng tôi chấp nhận. Nhưng lần sau phải kiểm tra kỹ hơn trước khi xuất hàng.',
     'わかりました、受け入れます。ただし次回は出荷前にもっと厳密に検査してください。',
     false, NULL, 3),

    -- ── Chapter 18, Lesson 3: Thuyết phục & Đề xuất ──
    ('f3000000-0000-0000-1801-000000000003', 'd0000000-0000-0000-1800-000000000003',
     'BẠN', 'あなた',
     'Em có một đề xuất: nếu ta dùng phần mềm mới thì tiết kiệm được 30% thời gian.',
     '一つ提案があります：新しいソフトを使えば、時間を30%節約できます。',
     true, '[{"index":3,"color":"var(--primary)"},{"index":4,"color":"var(--primary)"},{"index":6,"color":"var(--secondary)"}]', 1),
    ('f3000000-0000-0000-1802-000000000003', 'd0000000-0000-0000-1800-000000000003',
     'SẾP', '上司',
     'Nghe thú vị đấy. Nhưng chi phí triển khai thế nào? Có số liệu cụ thể không?',
     '面白そうだね。でも導入コストは？具体的なデータはある？',
     false, NULL, 2),
    ('f3000000-0000-0000-1803-000000000003', 'd0000000-0000-0000-1800-000000000003',
     'BẠN', 'あなた',
     'Dạ có ạ. Căn cứ vào báo giá, chi phí hoàn vốn trong 6 tháng. Em gửi anh báo cáo chi tiết.',
     'はい。見積もりによると、6ヶ月で投資回収できます。詳細レポートをお送りします。',
     true, '[{"index":3,"color":"var(--secondary)"},{"index":4,"color":"var(--secondary)"},{"index":5,"color":"var(--secondary)"}]', 3),

    -- ── Chapter 19, Lesson 1: Ô nhiễm & Biến đổi khí hậu ──
    ('f3000000-0000-0000-1901-000000000001', 'd0000000-0000-0000-1900-000000000001',
     'GIÁO VIÊN', '先生',
     'Theo bạn, vấn đề môi trường nghiêm trọng nhất ở Việt Nam là gì?',
     'あなたの意見では、ベトナムで最も深刻な環境問題は何ですか？',
     false, NULL, 1),
    ('f3000000-0000-0000-1902-000000000001', 'd0000000-0000-0000-1900-000000000001',
     'BẠN', 'あなた',
     'Theo tôi, ô nhiễm không khí ở Hà Nội rất đáng lo. Chỉ số AQI thường xuyên vượt 150.',
     '私の意見では、ハノイの大気汚染が非常に心配です。AQI指数が頻繁に150を超えています。',
     true, '[{"index":2,"color":"var(--error)"},{"index":3,"color":"var(--error)"},{"index":4,"color":"var(--error)"},{"index":5,"color":"var(--error)"}]', 2),
    ('f3000000-0000-0000-1903-000000000001', 'd0000000-0000-0000-1900-000000000001',
     'GIÁO VIÊN', '先生',
     'Phân tích tốt! Nguyên nhân chính là khí thải xe máy và đốt rơm rạ ngoại thành.',
     'いい分析ですね！主な原因はバイクの排気ガスと郊外の稲わら焼きです。',
     false, NULL, 3),

    -- ── Chapter 19, Lesson 2: Năng lượng xanh ──
    ('f3000000-0000-0000-1901-000000000002', 'd0000000-0000-0000-1900-000000000002',
     'ĐỒNG NGHIỆP', '同僚',
     'Công ty mình vừa lắp điện mặt trời trên mái. Tiết kiệm 40% tiền điện!',
     'うちの会社は屋上にソーラーパネルを設置したんだ。電気代40%節約！',
     false, NULL, 1),
    ('f3000000-0000-0000-1902-000000000002', 'd0000000-0000-0000-1900-000000000002',
     'BẠN', 'あなた',
     'Thật á? Ở Nhật năng lượng tái tạo cũng đang phát triển mạnh. Việt Nam có trợ cấp cho điện mặt trời không?',
     '本当に？日本でも再生可能エネルギーが急成長しているよ。ベトナムには太陽光発電の補助金はある？',
     true, '[{"index":4,"color":"var(--primary)"},{"index":5,"color":"var(--primary)"},{"index":6,"color":"var(--primary)"}]', 2),
    ('f3000000-0000-0000-1903-000000000002', 'd0000000-0000-0000-1900-000000000002',
     'ĐỒNG NGHIỆP', '同僚',
     'Trước có, giờ hết rồi. Nhưng giá pin rẻ hơn nên vẫn đáng đầu tư.',
     '以前はあったけど、もう終わったよ。でもパネルが安くなったから投資する価値はあるよ。',
     false, NULL, 3),

    -- ── Chapter 19, Lesson 3: Đô thị hóa ──
    ('f3000000-0000-0000-1901-000000000003', 'd0000000-0000-0000-1900-000000000003',
     'GIÁO VIÊN', '先生',
     'Mỗi năm, hàng triệu người từ nông thôn đổ về thành phố. Điều này tốt hay xấu?',
     '毎年、何百万人もの人が農村から都市に流入しています。これは良いことですか、悪いことですか？',
     false, NULL, 1),
    ('f3000000-0000-0000-1902-000000000003', 'd0000000-0000-0000-1900-000000000003',
     'BẠN', 'あなた',
     'Có hai mặt. Một mặt, kinh tế phát triển. Mặt khác, quá tải hạ tầng và mất bản sắc nông thôn.',
     '両面があります。一方で経済が発展しますが、他方でインフラが過負荷になり農村のアイデンティティが失われます。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":2,"color":"var(--primary)"},{"index":6,"color":"var(--secondary)"},{"index":7,"color":"var(--secondary)"}]', 2),
    ('f3000000-0000-0000-1903-000000000003', 'd0000000-0000-0000-1900-000000000003',
     'GIÁO VIÊN', '先生',
     'Lập luận rất cân bằng! Bạn đã dùng cấu trúc "Một mặt... Mặt khác..." rất chuẩn.',
     'とてもバランスの取れた議論です！「Một mặt...Mặt khác...」の構造を正しく使えていますね。',
     false, NULL, 3),

    -- ── Chapter 20, Lesson 1: Truyện Kiều ──
    ('f3000000-0000-0000-2001-000000000001', 'd0000000-0000-0000-2000-000000000001',
     'GIÁO VIÊN', '先生',
     '"Trăm năm trong cõi người ta, Chữ tài chữ mệnh khéo là ghét nhau." Đây là câu mở đầu Truyện Kiều.',
     '「百年の人の世にあって、才と運命は巧みに相反す。」これはキエウ物語の冒頭です。',
     false, NULL, 1),
    ('f3000000-0000-0000-2002-000000000001', 'd0000000-0000-0000-2000-000000000001',
     'BẠN', 'あなた',
     'Hay quá! "Chữ tài" là tài năng, "chữ mệnh" là số phận. Ý nói tài năng và số phận mâu thuẫn nhau?',
     '美しい！「chữ tài」は才能、「chữ mệnh」は運命。才能と運命が矛盾するという意味ですか？',
     true, '[{"index":2,"color":"var(--secondary)"},{"index":3,"color":"var(--secondary)"},{"index":6,"color":"var(--primary)"},{"index":7,"color":"var(--primary)"}]', 2),
    ('f3000000-0000-0000-2003-000000000001', 'd0000000-0000-0000-2000-000000000001',
     'GIÁO VIÊN', '先生',
     'Chính xác! Nguyễn Du viết về nỗi đau của Kiều — tài sắc mà bị đời xô đẩy.',
     '正解！グエン・ズーはキエウの苦悩を描きました — 才色兼備でありながら運命に翻弄される。',
     false, NULL, 3),

    -- ── Chapter 20, Lesson 2: Âm nhạc truyền thống & Hiện đại ──
    ('f3000000-0000-0000-2001-000000000002', 'd0000000-0000-0000-2000-000000000002',
     'BẠN VIỆT', 'ベトナム人の友人',
     'Em biết quan họ Bắc Ninh không? Là di sản văn hóa phi vật thể UNESCO đấy!',
     '「クアンホー」バクニンを知ってる？ユネスコの無形文化遺産だよ！',
     false, NULL, 1),
    ('f3000000-0000-0000-2002-000000000002', 'd0000000-0000-0000-2000-000000000002',
     'BẠN', 'あなた',
     'Nghe rồi! Giai điệu rất mượt mà, lãng mạn. Nó khác gì với ca trù?',
     '聴いたことある！メロディーがとても滑らかでロマンチック。カーチューとどう違うの？',
     true, '[{"index":4,"color":"var(--primary)"},{"index":5,"color":"var(--primary)"},{"index":6,"color":"var(--secondary)"}]', 2),
    ('f3000000-0000-0000-2003-000000000002', 'd0000000-0000-0000-2000-000000000002',
     'BẠN VIỆT', 'ベトナム人の友人',
     'Quan họ là hát đối đáp giữa nam và nữ. Ca trù là nghệ thuật cung đình — phức tạp hơn nhiều.',
     'クアンホーは男女の掛け合い歌。カーチューは宮廷芸術で、ずっと複雑だよ。',
     false, NULL, 3),

    -- ── Chapter 20, Lesson 3: Điện ảnh & Sân khấu ──
    ('f3000000-0000-0000-2001-000000000003', 'd0000000-0000-0000-2000-000000000003',
     'GIÁO VIÊN', '先生',
     'Phim "Tôi Thấy Hoa Vàng Trên Cỏ Xanh" rất nổi tiếng. Bạn đã xem chưa?',
     '映画「黄色い花を緑の草原に見た」はとても有名です。観たことありますか？',
     false, NULL, 1),
    ('f3000000-0000-0000-2002-000000000003', 'd0000000-0000-0000-2000-000000000003',
     'BẠN', 'あなた',
     'Xem rồi! Phim rất cảm động. Cảnh quay miền Trung đẹp như tranh vẽ.',
     '観ました！とても感動的な映画です。中部の風景がまるで絵画のように美しい。',
     true, '[{"index":3,"color":"var(--secondary)"},{"index":4,"color":"var(--secondary)"},{"index":7,"color":"var(--primary)"},{"index":8,"color":"var(--primary)"},{"index":9,"color":"var(--primary)"}]', 2),
    ('f3000000-0000-0000-2003-000000000003', 'd0000000-0000-0000-2000-000000000003',
     'GIÁO VIÊN', '先生',
     'Tuyệt! Ngoài phim, nghệ thuật tuồng và chèo cũng rất đặc sắc — có cơ hội nên đi xem trực tiếp.',
     '素晴らしい！映画のほかに、トゥオンとチェオもとても魅力的です。機会があれば生で観るべきですよ。',
     false, NULL, 3),

    -- ── Chapter 21, Lesson 1: Nền kinh tế Việt Nam ──
    ('f3000000-0000-0000-2101-000000000001', 'd0000000-0000-0000-2100-000000000001',
     'GIÁO VIÊN', '先生',
     'GDP Việt Nam năm 2024 tăng trưởng khoảng 6.5%. Động lực chính là gì?',
     'ベトナムの2024年GDP成長率は約6.5%です。主な原動力は何ですか？',
     false, NULL, 1),
    ('f3000000-0000-0000-2102-000000000001', 'd0000000-0000-0000-2100-000000000001',
     'BẠN', 'あなた',
     'Theo em, FDI từ Nhật Bản và Hàn Quốc, cộng với xuất khẩu điện tử là hai yếu tố chính.',
     '私の考えでは、日本と韓国からのFDI、そして電子機器の輸出が2つの主要な要因です。',
     true, '[{"index":2,"color":"var(--primary)"},{"index":9,"color":"var(--secondary)"},{"index":10,"color":"var(--secondary)"}]', 2),
    ('f3000000-0000-0000-2103-000000000001', 'd0000000-0000-0000-2100-000000000001',
     'GIÁO VIÊN', '先生',
     'Phân tích rất sắc sảo! Thêm nữa, lĩnh vực dịch vụ và du lịch cũng đóng góp đáng kể.',
     '非常に鋭い分析です！さらに、サービスと観光分野も大きく貢献しています。',
     false, NULL, 3),

    -- ── Chapter 21, Lesson 2: Khởi nghiệp tại Việt Nam ──
    ('f3000000-0000-0000-2101-000000000002', 'd0000000-0000-0000-2100-000000000002',
     'BẠN VIỆT', 'ベトナム人の友人',
     'Tôi đang chuẩn bị pitch dự án khởi nghiệp. Bạn có kinh nghiệm gọi vốn không?',
     '今スタートアップのプロジェクトのピッチを準備しているんだ。資金調達の経験はある？',
     false, NULL, 1),
    ('f3000000-0000-0000-2102-000000000002', 'd0000000-0000-0000-2100-000000000002',
     'BẠN', 'あなた',
     'Ở Nhật tôi từng tham gia một startup. Quan trọng nhất là mô hình kinh doanh phải rõ ràng và có thị trường.',
     '日本でスタートアップに参加したことがあるよ。最も重要なのは、ビジネスモデルが明確で市場があることだ。',
     true, '[{"index":9,"color":"var(--secondary)"},{"index":10,"color":"var(--secondary)"},{"index":11,"color":"var(--secondary)"}]', 2),
    ('f3000000-0000-0000-2103-000000000002', 'd0000000-0000-0000-2100-000000000002',
     'BẠN VIỆT', 'ベトナム人の友人',
     'Cảm ơn! Thị trường Việt Nam tiềm năng lắm — 100 triệu dân, giới trẻ yêu công nghệ.',
     'ありがとう！ベトナム市場はポテンシャルが大きい — 人口1億人、若者がテクノロジー好き。',
     false, NULL, 3),

    -- ── Chapter 21, Lesson 3: Chứng khoán & Đầu tư ──
    ('f3000000-0000-0000-2101-000000000003', 'd0000000-0000-0000-2100-000000000003',
     'ĐỒNG NGHIỆP', '同僚',
     'Dạo này thị trường chứng khoán Việt Nam biến động dữ quá! Bạn có đầu tư không?',
     '最近ベトナムの株式市場がすごく変動しているね！投資してる？',
     false, NULL, 1),
    ('f3000000-0000-0000-2102-000000000003', 'd0000000-0000-0000-2100-000000000003',
     'BẠN', 'あなた',
     'Có, tôi mua cổ phiếu ngân hàng. Lãi suất giảm nên cổ phiếu tài chính đang tăng.',
     'うん、銀行株を買ったよ。金利が下がっているから金融株が上がっているんだ。',
     true, '[{"index":3,"color":"var(--secondary)"},{"index":4,"color":"var(--secondary)"},{"index":5,"color":"var(--secondary)"},{"index":6,"color":"var(--primary)"},{"index":7,"color":"var(--primary)"}]', 2),
    ('f3000000-0000-0000-2103-000000000003', 'd0000000-0000-0000-2100-000000000003',
     'ĐỒNG NGHIỆP', '同僚',
     'Giỏi nhỉ! Nhớ đa dạng hóa danh mục nhé. Đừng "bỏ tất cả trứng vào một giỏ"!',
     'すごいね！ポートフォリオを分散させるのを忘れないで。「すべての卵を一つのかごに入れるな」だよ！',
     false, NULL, 3),

    -- ── Chapter 22, Lesson 1: Giọng Bắc vs Giọng Nam ──
    ('f3000000-0000-0000-2201-000000000001', 'd0000000-0000-0000-2200-000000000001',
     'GIÁO VIÊN', '先生',
     'Người Bắc nói "quả táo", người Nam nói "trái táo". Nghĩa giống nhau, khác từ.',
     '北部の人は「quả táo」、南部の人は「trái táo」と言います。意味は同じ、言葉が違います。',
     false, NULL, 1),
    ('f3000000-0000-0000-2202-000000000001', 'd0000000-0000-0000-2200-000000000001',
     'BẠN', 'あなた',
     'Vậy "xe đạp" ở miền Nam có nói khác không? Phát âm thanh hỏi và thanh ngã có khác nhau không?',
     'では「自転車」は南部では違う言い方ですか？声調の疑問調と転がり調は区別されますか？',
     true, '[{"index":8,"color":"var(--primary)"},{"index":9,"color":"var(--primary)"},{"index":11,"color":"var(--secondary)"},{"index":12,"color":"var(--secondary)"}]', 2),
    ('f3000000-0000-0000-2203-000000000001', 'd0000000-0000-0000-2200-000000000001',
     'GIÁO VIÊN', '先生',
     'Câu hỏi hay! Miền Nam không phân biệt hỏi/ngã — cả hai đều phát âm giống nhau.',
     'いい質問です！南部では疑問調/転がり調を区別しません — どちらも同じように発音されます。',
     false, NULL, 3),

    -- ── Chapter 22, Lesson 2: Giọng Huế ──
    ('f3000000-0000-0000-2201-000000000002', 'd0000000-0000-0000-2200-000000000002',
     'GIÁO VIÊN', '先生',
     'Nghe đoạn này: "Anh đi mô rứa? — Tau đi chợ." Đây là giọng Huế.',
     'この文を聞いて：「どこ行くの？ — 市場に行く。」これがフエ弁です。',
     false, NULL, 1),
    ('f3000000-0000-0000-2202-000000000002', 'd0000000-0000-0000-2200-000000000002',
     'BẠN', 'あなた',
     '"Mô" là "đâu" phải không? Còn "rứa" là "vậy"? "Tau" là "tôi"?',
     '「mô」は「どこ」ですよね？「rứa」は「vậy」？「tau」は「tôi」？',
     true, '[{"index":0,"color":"var(--secondary)"},{"index":5,"color":"var(--secondary)"},{"index":10,"color":"var(--secondary)"}]', 2),
    ('f3000000-0000-0000-2203-000000000002', 'd0000000-0000-0000-2200-000000000002',
     'GIÁO VIÊN', '先生',
     'Hoàn toàn đúng! Người Huế còn có giọng trầm đặc trưng và hay kéo dài âm cuối.',
     '完全に正解！フエの人はさらに特徴的な低い声で、語末の音を伸ばす傾向があります。',
     false, NULL, 3),

    -- ── Chapter 22, Lesson 3: Từ vựng địa phương ──
    ('f3000000-0000-0000-2201-000000000003', 'd0000000-0000-0000-2200-000000000003',
     'BẠN VIỆT (SÀI GÒN)', 'ベトナム人の友人（ホーチミン）',
     'Ê, đi "nhậu" hông? "Hổng" biết quán nào ngon hết trơn á!',
     'ねえ、飲みに行かない？どの店が美味しいか全然わからないんだよね！',
     false, NULL, 1),
    ('f3000000-0000-0000-2202-000000000003', 'd0000000-0000-0000-2200-000000000003',
     'BẠN', 'あなた',
     '"Hông" là "không" phải không? Giọng Sài Gòn nghe dễ thương ghê!',
     '「hông」は「không（いいえ）」のことですよね？サイゴン弁ってすごく可愛く聞こえる！',
     true, '[{"index":0,"color":"var(--secondary)"},{"index":5,"color":"var(--primary)"},{"index":6,"color":"var(--primary)"}]', 2),
    ('f3000000-0000-0000-2203-000000000003', 'd0000000-0000-0000-2200-000000000003',
     'BẠN VIỆT (SÀI GÒN)', 'ベトナム人の友人（ホーチミン）',
     'Ha ha! Ở Sài Gòn còn nói "hết trơn" = "hết sạch", "hen" = "nhé". Dễ thương hông?',
     'はは！サイゴンでは「hết trơn」=「全部なくなった」、「hen」=「ね」とも言うよ。可愛いでしょ？',
     false, NULL, 3),

    -- ── Chapter 23, Lesson 1: Cấu trúc bài thuyết trình ──
    ('f3000000-0000-0000-2301-000000000001', 'd0000000-0000-0000-2300-000000000001',
     'GIÁO VIÊN', '先生',
     'Bài thuyết trình tốt cần ba phần: mở bài gây ấn tượng, thân bài logic, kết luận mạnh mẽ.',
     '良いプレゼンには3つの部分が必要：印象的な導入、論理的な本論、力強い結論。',
     false, NULL, 1),
    ('f3000000-0000-0000-2302-000000000001', 'd0000000-0000-0000-2300-000000000001',
     'BẠN', 'あなた',
     'Xin chào mọi người. Hôm nay tôi xin trình bày về hợp tác Việt-Nhật trong lĩnh vực công nghệ.',
     '皆さんこんにちは。本日はベトナム・日本のテクノロジー分野における協力についてプレゼンさせていただきます。',
     true, '[{"index":5,"color":"var(--primary)"},{"index":6,"color":"var(--primary)"},{"index":7,"color":"var(--primary)"}]', 2),
    ('f3000000-0000-0000-2303-000000000001', 'd0000000-0000-0000-2300-000000000001',
     'GIÁO VIÊN', '先生',
     'Mở bài rõ ràng! Nhưng hãy thêm một câu hỏi hoặc số liệu gây bất ngờ để thu hút người nghe.',
     '明確な導入です！でも聴衆を引きつけるために、驚くような質問やデータを加えましょう。',
     false, NULL, 3),

    -- ── Chapter 23, Lesson 2: Kỹ năng tranh luận ──
    ('f3000000-0000-0000-2301-000000000002', 'd0000000-0000-0000-2300-000000000002',
     'GIÁO VIÊN', '先生',
     'Chủ đề tranh luận: "Mạng xã hội có lợi hay có hại cho giới trẻ?" Bạn chọn bên nào?',
     'ディベートのテーマ：「SNSは若者に有益か有害か？」あなたはどちら側？',
     false, NULL, 1),
    ('f3000000-0000-0000-2302-000000000002', 'd0000000-0000-0000-2300-000000000002',
     'BẠN', 'あなた',
     'Mặc dù mạng xã hội gây nghiện, nhưng phải thừa nhận rằng nó giúp kết nối và học hỏi hiệu quả.',
     'SNSは中毒性がありますが、効果的なつながりと学びを促進することは認めなければなりません。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":5,"color":"var(--secondary)"},{"index":8,"color":"var(--secondary)"},{"index":9,"color":"var(--secondary)"}]', 2),
    ('f3000000-0000-0000-2303-000000000002', 'd0000000-0000-0000-2300-000000000002',
     'GIÁO VIÊN', '先生',
     'Xuất sắc! Bạn dùng "Mặc dù... nhưng phải thừa nhận..." rất chuyên nghiệp. Thêm dẫn chứng nữa nhé!',
     '素晴らしい！「Mặc dù...nhưng phải thừa nhận...」をとてもプロフェッショナルに使えています。もっとデータを加えましょう！',
     false, NULL, 3),

    -- ── Chapter 23, Lesson 3: Phát biểu trước công chúng ──
    ('f3000000-0000-0000-2301-000000000003', 'd0000000-0000-0000-2300-000000000003',
     'GIÁO VIÊN', '先生',
     'Hãy tưởng tượng bạn phát biểu tại lễ kỷ niệm 50 năm quan hệ Việt-Nhật. Bạn sẽ nói gì?',
     'ベトナム・日本国交50周年記念式典でスピーチすると想像してください。何を話しますか？',
     false, NULL, 1),
    ('f3000000-0000-0000-2302-000000000003', 'd0000000-0000-0000-2300-000000000003',
     'BẠN', 'あなた',
     'Kính thưa quý vị! Tôi rất vinh dự được đứng đây. Hai dân tộc chúng ta chia sẻ nhiều giá trị chung: lòng hiếu khách, sự cần cù và tình yêu thiên nhiên.',
     'ご列席の皆様！ここに立てることを大変光栄に思います。私たちの両国民は多くの共通の価値観を共有しています：おもてなしの心、勤勉さ、そして自然への愛。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":2,"color":"var(--primary)"},{"index":5,"color":"var(--secondary)"}]', 2),
    ('f3000000-0000-0000-2303-000000000003', 'd0000000-0000-0000-2300-000000000003',
     'GIÁO VIÊN', '先生',
     'Tuyệt vời! Giọng nói truyền cảm, nội dung sâu sắc. Bạn đã sẵn sàng diễn thuyết bằng tiếng Việt rồi!',
     '素晴らしい！感動的な声、深い内容。あなたはもうベトナム語でスピーチする準備ができています！',
     false, NULL, 3),

    -- ── Chapter 24, Lesson 1: Quan niệm hạnh phúc ──
    ('f3000000-0000-0000-2401-000000000001', 'd0000000-0000-0000-2400-000000000001',
     'GIÁO VIÊN', '先生',
     'Người Việt thường nói: "Hạnh phúc là có sức khỏe, gia đình hòa thuận." Ở Nhật thì sao?',
     'ベトナム人はよく言います：「幸せとは健康で家族が円満なこと。」日本ではどうですか？',
     false, NULL, 1),
    ('f3000000-0000-0000-2402-000000000001', 'd0000000-0000-0000-2400-000000000001',
     'BẠN', 'あなた',
     'Ở Nhật có khái niệm "ikigai" — lý do tồn tại. Nó giao giữa đam mê, sứ mệnh, nghề nghiệp và thiên chức.',
     '日本には「生きがい」という概念があります — 存在の理由。情熱、使命、職業、天職の交差点です。',
     true, '[{"index":4,"color":"var(--secondary)"},{"index":7,"color":"var(--primary)"},{"index":8,"color":"var(--primary)"}]', 2),
    ('f3000000-0000-0000-2403-000000000001', 'd0000000-0000-0000-2400-000000000001',
     'GIÁO VIÊN', '先生',
     'Thú vị! Người Việt cũng có câu: "Tri túc tiện túc, đãi túc hà thì túc" — biết đủ thì đủ.',
     '面白い！ベトナム人にもこんな言葉があります：「足るを知れば足る、待っていれば永遠に足りない」。',
     false, NULL, 3),

    -- ── Chapter 24, Lesson 2: Thế hệ trẻ & Giá trị mới ──
    ('f3000000-0000-0000-2401-000000000002', 'd0000000-0000-0000-2400-000000000002',
     'BẠN VIỆT', 'ベトナム人の友人',
     'Bố mẹ muốn mình lấy vợ sớm, nhưng mình muốn tập trung sự nghiệp. Xung đột thế hệ đấy!',
     '親は早く結婚しろって言うけど、キャリアに集中したいんだ。世代間の衝突だよ！',
     false, NULL, 1),
    ('f3000000-0000-0000-2402-000000000002', 'd0000000-0000-0000-2400-000000000002',
     'BẠN', 'あなた',
     'Ở Nhật cũng vậy! Nhưng giới trẻ Nhật ngày càng chọn sống theo cách riêng. Việt Nam thì sao?',
     '日本でも同じだよ！でも日本の若者はますます自分の道を選んでいる。ベトナムではどう？',
     true, '[{"index":5,"color":"var(--primary)"},{"index":6,"color":"var(--primary)"},{"index":9,"color":"var(--secondary)"},{"index":10,"color":"var(--secondary)"},{"index":11,"color":"var(--secondary)"}]', 2),
    ('f3000000-0000-0000-2403-000000000002', 'd0000000-0000-0000-2400-000000000002',
     'BẠN VIỆT', 'ベトナム人の友人',
     'Đang thay đổi! Gen Z Việt Nam cũng muốn tự do, nhưng vẫn rất trọng gia đình. Cân bằng khó lắm.',
     '変わってきてるよ！ベトナムのZ世代も自由を求めるけど、家族をとても大切にする。バランスが難しいんだ。',
     false, NULL, 3),

    -- ── Chapter 24, Lesson 3: Bài học cuối — Tổng kết hành trình ──
    ('f3000000-0000-0000-2401-000000000003', 'd0000000-0000-0000-2400-000000000003',
     'GIÁO VIÊN', '先生',
     'Chúc mừng bạn đã hoàn thành hành trình từ V1 đến V3! Nhìn lại, bạn cảm thấy thế nào?',
     'V1からV3までの旅を完了したことをお祝いします！振り返って、どう感じますか？',
     false, NULL, 1),
    ('f3000000-0000-0000-2402-000000000003', 'd0000000-0000-0000-2400-000000000003',
     'BẠN', 'あなた',
     'Tôi không ngờ mình có thể tranh luận, thuyết trình và hiểu thành ngữ bằng tiếng Việt. Cảm ơn thầy rất nhiều!',
     '自分がベトナム語でディベートし、プレゼンし、慣用句を理解できるとは思いませんでした。先生、本当にありがとうございます！',
     true, '[{"index":5,"color":"var(--primary)"},{"index":6,"color":"var(--primary)"},{"index":8,"color":"var(--secondary)"},{"index":11,"color":"var(--secondary)"}]', 2),
    ('f3000000-0000-0000-2403-000000000003', 'd0000000-0000-0000-2400-000000000003',
     'GIÁO VIÊN', '先生',
     'Bạn đã "gần đèn thì sáng"! Hãy tiếp tục dùng tiếng Việt mỗi ngày. Như tục ngữ nói: "Có công mài sắt, có ngày nên kim!"',
     'あなたは「灯に近づいて明るくなった」のです！毎日ベトナム語を使い続けてください。ことわざが言うように：「鉄を磨き続ければ、いつか針になる」！',
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