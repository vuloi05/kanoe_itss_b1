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
-- 4. V3 DIALOGUES (Chapters 17-19, Base L1-3, 8 lines per lesson)
-- ═══════════════════════════════════════════════════════════════════════════════
-- UUID pattern: f3CCLLSS where CC=chapter(17-24), LL=lesson, SS=sort
-- is_active distribution: 4 lines BẠN (true) + 4 lines Partner (false)

DELETE FROM lesson_dialogues
WHERE lesson_id IN (
    SELECT lesson_id FROM lessons
    WHERE chapter_id BETWEEN 17 AND 19
    AND sort_order BETWEEN 1 AND 3
);

INSERT INTO lesson_dialogues (dialogue_id, lesson_id, speaker, speaker_jp, line_vi, line_jp, is_active, highlight_words_json, sort_order) VALUES
    -- ══════════════════════════════════════════════════════════════════════
    -- CHAPTER 17: THÀNH NGỮ & TỤC NGỮ (Base L1-L3)
    -- ══════════════════════════════════════════════════════════════════════

    -- ── Ch17, L1: Thành ngữ về con người ──
    ('f3000000-0000-0000-1701-000000000001', 'd0000000-0000-0000-1700-000000000001',
     'GIÁO VIÊN', '先生',
     'Hôm nay học thành ngữ. Bạn biết "ăn cháo đá bát" không?',
     '今日は慣用句を学びます。「ăn cháo đá bát」を知っていますか？',
     false, NULL, 1),
    ('f3000000-0000-0000-1701-000000000002', 'd0000000-0000-0000-1700-000000000001',
     'BẠN', 'あなた',
     'Ăn cháo rồi đá cái bát à? Sở dĩ em hỏi là vì nghĩa đen nghe buồn cười quá!',
     'おかゆを食べてお椀を蹴る？聞いた理由は、文字通りの意味が面白すぎるから！',
     true, '[{"index":0,"color":"var(--error)"},{"index":1,"color":"var(--error)"},{"index":5,"color":"var(--primary)"},{"index":6,"color":"var(--primary)"}]', 2),
    ('f3000000-0000-0000-1701-000000000003', 'd0000000-0000-0000-1700-000000000001',
     'GIÁO VIÊN', '先生',
     'Đúng vậy! Nghĩa bóng là nhận ơn rồi phản bội. Giống "恩を仇で返す" tiếng Nhật.',
     'その通り！比喩的な意味は、恩を受けて裏切ること。日本語の「恩を仇で返す」と同じです。',
     false, NULL, 3),
    ('f3000000-0000-0000-1701-000000000004', 'd0000000-0000-0000-1700-000000000001',
     'BẠN', 'あなた',
     'Mặc dù hình ảnh hơi bạo lực, nhưng thành ngữ Việt rất giàu hình tượng. Em thích cách diễn đạt này.',
     'イメージはちょっと暴力的ですが、ベトナムの慣用句はとても豊かな表現力がある。この表現が好きです。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":5,"color":"var(--primary)"}]', 4),
    ('f3000000-0000-0000-1701-000000000005', 'd0000000-0000-0000-1700-000000000001',
     'GIÁO VIÊN', '先生',
     '"Nước đổ đầu vịt" — khuyên mãi mà không nghe. Giống "馬の耳に念仏" phải không?',
     '「アヒルの頭に水を注ぐ」— いくら忠告しても聞かない。「馬の耳に念仏」に似てる？',
     false, NULL, 5),
    ('f3000000-0000-0000-1701-000000000006', 'd0000000-0000-0000-1700-000000000001',
     'BẠN', 'あなた',
     'Không những giống, mà còn dùng động vật luôn! Sở dĩ hay là vì cả hai đều dùng hình ảnh con vật rất sống động.',
     '似ているだけでなく、動物も使っている！面白い理由は、どちらも生き生きとした動物のイメージを使うから。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":7,"color":"var(--primary)"},{"index":8,"color":"var(--primary)"}]', 6),
    ('f3000000-0000-0000-1701-000000000007', 'd0000000-0000-0000-1700-000000000001',
     'GIÁO VIÊN', '先生',
     'So sánh Việt-Nhật chuẩn! Thành ngữ là cửa sổ nhìn vào tâm hồn dân tộc. Bạn nhận ra điều đó rồi.',
     'ベトナム・日本の比較が正確！慣用句は民族の魂を覗く窓。あなたはそれに気づきましたね。',
     false, NULL, 7),
    ('f3000000-0000-0000-1701-000000000008', 'd0000000-0000-0000-1700-000000000001',
     'BẠN', 'あなた',
     'Sở dĩ em mê thành ngữ là vì mỗi câu đều chứa cả một bài học cuộc sống. Học một mà biết mười!',
     '慣用句に夢中な理由は、一つ一つに人生の教訓が詰まっているから。一を学んで十を知る！',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":8,"color":"var(--primary)"},{"index":9,"color":"var(--primary)"}]', 8),

    -- ── Ch17, L2: Tục ngữ triết lý sống ──
    ('f3000000-0000-0000-1702-000000000001', 'd0000000-0000-0000-1700-000000000002',
     'GIÁO VIÊN', '先生',
     '"Gần mực thì đen, gần đèn thì sáng." Câu này dạy ta điều gì?',
     '「墨に近づけば黒くなり、灯に近づけば明るくなる。」この文は何を教えていますか？',
     false, NULL, 1),
    ('f3000000-0000-0000-1702-000000000002', 'd0000000-0000-0000-1700-000000000002',
     'BẠN', 'あなた',
     'Môi trường xung quanh ảnh hưởng đến con người. Sở dĩ em hiểu nhanh là vì Nhật có câu "朱に交われば赤くなる" tương tự.',
     '周囲の環境が人に影響を与えるということ。すぐ理解できた理由は、日本に「朱に交われば赤くなる」という似た表現があるから。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":5,"color":"var(--primary)"},{"index":6,"color":"var(--primary)"}]', 2),
    ('f3000000-0000-0000-1702-000000000003', 'd0000000-0000-0000-1700-000000000002',
     'GIÁO VIÊN', '先生',
     'Chính xác! Thêm một câu: "Có chí thì nên" — có quyết tâm sẽ thành công.',
     '正解！もう一つ：「Có chí thì nên」— 意志があれば成し遂げられる。',
     false, NULL, 3),
    ('f3000000-0000-0000-1702-000000000004', 'd0000000-0000-0000-1700-000000000002',
     'BẠN', 'あなた',
     'Mặc dù ngắn gọn, nhưng triết lý rất sâu sắc. "Chí" ở đây là ý chí — giống 志 (こころざし) của Nhật.',
     '短いですが、哲学がとても深い。「chí」はここでは意志 — 日本語の志（こころざし）と同じ。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":6,"color":"var(--secondary)"},{"index":7,"color":"var(--secondary)"}]', 4),
    ('f3000000-0000-0000-1702-000000000005', 'd0000000-0000-0000-1700-000000000002',
     'GIÁO VIÊN', '先生',
     '"Uống nước nhớ nguồn" — biết ơn cội nguồn. Tục ngữ Việt luôn nhắc về lòng biết ơn.',
     '「水を飲む時は源を思え」— 起源に感謝する。ベトナムのことわざは常に感謝の心を思い出させる。',
     false, NULL, 5),
    ('f3000000-0000-0000-1702-000000000006', 'd0000000-0000-0000-1700-000000000002',
     'BẠN', 'あなた',
     'Không những hay, mà còn dễ nhớ vì vần điệu cân đối. Sở dĩ tục ngữ sống mãi là vì dễ thuộc, dễ truyền miệng.',
     '素晴らしいだけでなく、バランスの取れた韻律で覚えやすい。ことわざが生き続ける理由は、覚えやすく口伝えしやすいから。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":8,"color":"var(--primary)"},{"index":9,"color":"var(--primary)"}]', 6),
    ('f3000000-0000-0000-1702-000000000007', 'd0000000-0000-0000-1700-000000000002',
     'GIÁO VIÊN', '先生',
     'Nhận xét sắc sảo! Tục ngữ là DNA văn hóa — chứa triết lý qua hàng ngàn năm.',
     '鋭い指摘！ことわざは文化のDNA — 何千年もの哲学を内包している。',
     false, NULL, 7),
    ('f3000000-0000-0000-1702-000000000008', 'd0000000-0000-0000-1700-000000000002',
     'BẠN', 'あなた',
     'Sở dĩ em coi tục ngữ là kho báu là vì nó kết tinh trí tuệ của cả một dân tộc trong vài từ ngắn gọn.',
     'ことわざを宝物と見なす理由は、民族全体の知恵を数語に凝縮しているから。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":7,"color":"var(--primary)"},{"index":8,"color":"var(--primary)"}]', 8),

    -- ── Ch17, L3: Vận dụng thành ngữ trong giao tiếp ──
    ('f3000000-0000-0000-1703-000000000001', 'd0000000-0000-0000-1700-000000000003',
     'ĐỒNG NGHIỆP', '同僚',
     'Dạo này sếp bắt làm thêm hoài, mệt quá! Thật là "một cổ hai tròng"!',
     '最近ボスがずっと残業させるんだ、疲れた！まさに「一つの首に二つの枷」だよ！',
     false, NULL, 1),
    ('f3000000-0000-0000-1703-000000000002', 'd0000000-0000-0000-1700-000000000003',
     'BẠN', 'あなた',
     'Ừ, "chân cứng đá mềm" nhé! Sở dĩ em dùng thành ngữ này là vì muốn động viên bạn kiên trì.',
     'うん、「足は硬く石は柔らかく」だよ！この慣用句を使った理由は、頑張ろうと励ましたいから。',
     true, '[{"index":1,"color":"var(--secondary)"},{"index":2,"color":"var(--secondary)"},{"index":5,"color":"var(--primary)"},{"index":6,"color":"var(--primary)"}]', 2),
    ('f3000000-0000-0000-1703-000000000003', 'd0000000-0000-0000-1700-000000000003',
     'ĐỒNG NGHIỆP', '同僚',
     'Bạn dùng thành ngữ giỏi thật đấy! Nói tiếng Việt chuẩn như người bản xứ rồi!',
     '慣用句の使い方上手いね！もうネイティブみたいだよ！',
     false, NULL, 3),
    ('f3000000-0000-0000-1703-000000000004', 'd0000000-0000-0000-1700-000000000003',
     'BẠN', 'あなた',
     'Mặc dù chưa giỏi lắm, nhưng em cố gắng dùng thành ngữ mỗi ngày. "Nước đến chân mới nhảy" — đừng để nước đến chân nhé!',
     'まだあまり上手くないですが、毎日慣用句を使う努力をしています。「水が足元に来て初めて跳ぶ」— ギリギリにならないでね！',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":10,"color":"var(--error)"},{"index":11,"color":"var(--error)"},{"index":12,"color":"var(--error)"},{"index":13,"color":"var(--error)"}]', 4),
    ('f3000000-0000-0000-1703-000000000005', 'd0000000-0000-0000-1700-000000000003',
     'ĐỒNG NGHIỆP', '同僚',
     'Ha ha, nhắc sếp hay nhắc tôi đấy? "Nước đến chân mới nhảy" là bệnh chung dân văn phòng mà!',
     'ハハ、ボスに言ってるの？私に？「ギリギリまで動かない」はオフィスワーカーの持病だよ！',
     false, NULL, 5),
    ('f3000000-0000-0000-1703-000000000006', 'd0000000-0000-0000-1700-000000000003',
     'BẠN', 'あなた',
     'Không những nhắc bạn, mà còn nhắc em nữa! Sở dĩ em biết thành ngữ này là vì bị sếp mắng "nước đến chân mới nhảy" rồi.',
     'あなただけじゃなく、私にも言ってる！この慣用句を知った理由は、ボスに「ギリギリまで動かない」と叱られたから。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":7,"color":"var(--primary)"},{"index":8,"color":"var(--primary)"}]', 6),
    ('f3000000-0000-0000-1703-000000000007', 'd0000000-0000-0000-1700-000000000003',
     'ĐỒNG NGHIỆP', '同僚',
     'Ha ha ha! "Chém gió" vừa vừa thôi! Nhưng nói thật, tiếng Việt của bạn đỉnh thật đấy — "chuẩn không cần chỉnh"!',
     'ハハハ！「ホラ吹き」もほどほどに！でも本当に、あなたのベトナム語は最高 —「修正不要の正確さ」！',
     false, NULL, 7),
    ('f3000000-0000-0000-1703-000000000008', 'd0000000-0000-0000-1700-000000000003',
     'BẠN', 'あなた',
     'Sở dĩ em tự tin dùng thành ngữ là vì học từ đồng nghiệp — ngôn ngữ sống ngoài đời mới là thầy giỏi nhất!',
     '慣用句を自信持って使える理由は、同僚から学んだから — 実生活の言語こそ最高の先生！',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":7,"color":"var(--primary)"},{"index":8,"color":"var(--primary)"}]', 8),

    -- ══════════════════════════════════════════════════════════════════════
    -- CHAPTER 18: ĐÀM PHÁN & THƯƠNG LƯỢNG (Base L1-L3)
    -- ══════════════════════════════════════════════════════════════════════

    -- ── Ch18, L1: Đàm phán hợp đồng ──
    ('f3000000-0000-0000-1801-000000000001', 'd0000000-0000-0000-1800-000000000001',
     'ĐỐI TÁC', '取引先',
     'Về điều khoản thanh toán, bên chúng tôi đề nghị trả trước 50%.',
     '支払い条件について、前払い50%を提案します。',
     false, NULL, 1),
    ('f3000000-0000-0000-1801-000000000002', 'd0000000-0000-0000-1800-000000000001',
     'BẠN', 'あなた',
     'Tôi hiểu. Tuy nhiên, liệu bên anh có thể chấp nhận 30% trước, 70% sau khi giao hàng không?',
     '理解しました。ただ、前払い30%、残り70%は納品後というのは受け入れ可能でしょうか？',
     true, '[{"index":3,"color":"var(--primary)"},{"index":4,"color":"var(--secondary)"},{"index":8,"color":"var(--secondary)"},{"index":9,"color":"var(--secondary)"}]', 2),
    ('f3000000-0000-0000-1801-000000000003', 'd0000000-0000-0000-1800-000000000001',
     'ĐỐI TÁC', '取引先',
     'Chúng tôi sẽ xem xét. Nếu đảm bảo giao hàng đúng hạn thì có thể thương lượng.',
     '検討します。納期通りに納品が保証されれば、交渉の余地はあります。',
     false, NULL, 3),
    ('f3000000-0000-0000-1801-000000000004', 'd0000000-0000-0000-1800-000000000001',
     'BẠN', 'あなた',
     'Mặc dù chúng tôi muốn giảm tỷ lệ trả trước, nhưng hoàn toàn cam kết giao hàng đúng hạn.',
     '前払い比率を下げたいですが、納期厳守を完全にお約束します。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":8,"color":"var(--primary)"}]', 4),
    ('f3000000-0000-0000-1801-000000000005', 'd0000000-0000-0000-1800-000000000001',
     'ĐỐI TÁC', '取引先',
     'Vậy 35% trước, 65% sau giao hàng. Đây là nhượng bộ lớn nhất của chúng tôi.',
     'では前払い35%、納品後65%。これが我々の最大の譲歩です。',
     false, NULL, 5),
    ('f3000000-0000-0000-1801-000000000006', 'd0000000-0000-0000-1800-000000000001',
     'BẠN', 'あなた',
     'Sở dĩ chúng tôi đề nghị thế là vì muốn xây dựng quan hệ đối tác lâu dài, không chỉ một hợp đồng.',
     'このように提案する理由は、一つの契約だけでなく、長期的なパートナーシップを構築したいからです。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":6,"color":"var(--primary)"},{"index":7,"color":"var(--primary)"}]', 6),
    ('f3000000-0000-0000-1801-000000000007', 'd0000000-0000-0000-1800-000000000001',
     'ĐỐI TÁC', '取引先',
     'Tôi đánh giá cao thiện chí của bên anh. Chúng ta ký hợp đồng theo phương án 35-65 nhé.',
     'そちらの誠意を高く評価します。35-65の案で契約を結びましょう。',
     false, NULL, 7),
    ('f3000000-0000-0000-1801-000000000008', 'd0000000-0000-0000-1800-000000000001',
     'BẠN', 'あなた',
     'Không những đạt được thỏa thuận tốt, mà còn mở ra cơ hội hợp tác trong tương lai. Cảm ơn anh!',
     '良い合意に達しただけでなく、将来の協力の機会も開けました。ありがとうございます！',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":7,"color":"var(--primary)"},{"index":8,"color":"var(--primary)"}]', 8),

    -- ── Ch18, L2: Giải quyết xung đột ──
    ('f3000000-0000-0000-1802-000000000001', 'd0000000-0000-0000-1800-000000000002',
     'KHÁCH HÀNG', 'クライアント',
     'Lô hàng vừa rồi bị lỗi 15%. Chúng tôi rất thất vọng về chất lượng.',
     '前回のロットは15%が不良品でした。品質に非常に失望しています。',
     false, NULL, 1),
    ('f3000000-0000-0000-1802-000000000002', 'd0000000-0000-0000-1800-000000000002',
     'BẠN', 'あなた',
     'Chúng tôi thành thật xin lỗi. Sở dĩ xảy ra lỗi là vì quy trình kiểm tra có sơ suất — chúng tôi nhận trách nhiệm.',
     '心よりお詫び申し上げます。不具合が発生した原因は、検査プロセスに不備があったためです — 責任を認めます。',
     true, '[{"index":2,"color":"var(--error)"},{"index":3,"color":"var(--error)"},{"index":5,"color":"var(--primary)"},{"index":6,"color":"var(--primary)"}]', 2),
    ('f3000000-0000-0000-1802-000000000003', 'd0000000-0000-0000-1800-000000000002',
     'KHÁCH HÀNG', 'クライアント',
     'Nhận lỗi là tốt, nhưng chúng tôi cần giải pháp cụ thể. Bồi thường thế nào?',
     '責任を認めるのは良いですが、具体的な解決策が必要です。補償はどうする？',
     false, NULL, 3),
    ('f3000000-0000-0000-1802-000000000004', 'd0000000-0000-0000-1800-000000000002',
     'BẠN', 'あなた',
     'Mặc dù thiệt hại đã xảy ra, nhưng chúng tôi cam kết đổi hàng mới 100% và chịu toàn bộ phí vận chuyển.',
     '損害は発生しましたが、100%新品交換と送料全額負担をお約束します。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":6,"color":"var(--primary)"},{"index":9,"color":"var(--secondary)"}]', 4),
    ('f3000000-0000-0000-1802-000000000005', 'd0000000-0000-0000-1800-000000000002',
     'KHÁCH HÀNG', 'クライアント',
     'Được. Nhưng lần sau phải kiểm tra kỹ hơn trước khi xuất hàng. Không chấp nhận lần thứ hai.',
     'わかりました。ただし次回は出荷前にもっと厳密に検査を。二度目は許されません。',
     false, NULL, 5),
    ('f3000000-0000-0000-1802-000000000006', 'd0000000-0000-0000-1800-000000000002',
     'BẠN', 'あなた',
     'Không những đổi hàng, mà còn bổ sung quy trình kiểm tra kép. Sở dĩ chúng tôi làm thêm bước này là vì tôn trọng uy tín của bên anh.',
     '交換だけでなく、ダブルチェック工程も追加します。この追加ステップを行う理由は、御社の信頼を尊重するからです。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":9,"color":"var(--primary)"},{"index":10,"color":"var(--primary)"}]', 6),
    ('f3000000-0000-0000-1802-000000000007', 'd0000000-0000-0000-1800-000000000002',
     'KHÁCH HÀNG', 'クライアント',
     'Thái độ xử lý chuyên nghiệp. Chúng tôi chấp nhận phương án này và tiếp tục hợp tác.',
     'プロフェッショナルな対応姿勢です。この案を受け入れ、協力を継続します。',
     false, NULL, 7),
    ('f3000000-0000-0000-1802-000000000008', 'd0000000-0000-0000-1800-000000000002',
     'BẠN', 'あなた',
     'Sở dĩ em xử lý nhanh là vì hiểu rằng mất uy tín khó lấy lại hơn mất tiền. Cảm ơn anh đã cho cơ hội sửa sai.',
     '迅速に対応した理由は、信頼を失うことはお金を失うより取り戻しにくいと理解しているから。挽回の機会をありがとうございます。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":7,"color":"var(--primary)"},{"index":8,"color":"var(--primary)"}]', 8),

    -- ── Ch18, L3: Thuyết phục & Đề xuất ──
    ('f3000000-0000-0000-1803-000000000001', 'd0000000-0000-0000-1800-000000000003',
     'BẠN', 'あなた',
     'Em có một đề xuất: nếu ta dùng phần mềm mới thì tiết kiệm được 30% thời gian.',
     '一つ提案があります：新しいソフトを使えば、時間を30%節約できます。',
     true, '[{"index":3,"color":"var(--primary)"},{"index":4,"color":"var(--primary)"},{"index":6,"color":"var(--secondary)"}]', 1),
    ('f3000000-0000-0000-1803-000000000002', 'd0000000-0000-0000-1800-000000000003',
     'SẾP', '上司',
     'Nghe thú vị đấy. Nhưng chi phí triển khai thế nào? Có số liệu cụ thể không?',
     '面白そうだね。でも導入コストは？具体的なデータはある？',
     false, NULL, 2),
    ('f3000000-0000-0000-1803-000000000003', 'd0000000-0000-0000-1800-000000000003',
     'BẠN', 'あなた',
     'Dạ có ạ. Căn cứ vào báo giá, chi phí hoàn vốn trong 6 tháng. Em gửi anh báo cáo chi tiết.',
     'はい。見積もりによると、6ヶ月で投資回収できます。詳細レポートをお送りします。',
     true, '[{"index":3,"color":"var(--secondary)"},{"index":4,"color":"var(--secondary)"},{"index":5,"color":"var(--secondary)"}]', 3),
    ('f3000000-0000-0000-1803-000000000004', 'd0000000-0000-0000-1800-000000000003',
     'SẾP', '上司',
     'Hmm, ROI 6 tháng thì hợp lý. Nhưng team kỹ thuật có đủ năng lực triển khai không?',
     'うーん、ROI6ヶ月なら合理的。でも技術チームに導入能力はある？',
     false, NULL, 4),
    ('f3000000-0000-0000-1803-000000000005', 'd0000000-0000-0000-1800-000000000003',
     'BẠN', 'あなた',
     'Sở dĩ em tự tin đề xuất là vì đã trao đổi với team kỹ thuật. Họ cam kết triển khai trong 2 tuần.',
     '自信を持って提案する理由は、技術チームと既に相談したからです。2週間で導入可能と約束しています。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":7,"color":"var(--primary)"},{"index":8,"color":"var(--primary)"}]', 5),
    ('f3000000-0000-0000-1803-000000000006', 'd0000000-0000-0000-1800-000000000003',
     'SẾP', '上司',
     'Chuẩn bị kỹ lưỡng rồi. Vậy cho triển khai thí điểm 1 tháng, nếu hiệu quả thì nhân rộng.',
     'しっかり準備してるね。では1ヶ月のパイロット導入、効果があれば全社展開しよう。',
     false, NULL, 6),
    ('f3000000-0000-0000-1803-000000000007', 'd0000000-0000-0000-1800-000000000003',
     'BẠN', 'あなた',
     'Không những tiết kiệm chi phí, mà còn giảm lỗi do thao tác thủ công. Sở dĩ phần mềm hiệu quả là vì tự động hóa quy trình lặp lại.',
     'コスト削減だけでなく、手作業によるミスも減らせます。ソフトが効果的な理由は、繰り返しプロセスを自動化するから。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":9,"color":"var(--primary)"},{"index":10,"color":"var(--primary)"}]', 7),
    ('f3000000-0000-0000-1803-000000000008', 'd0000000-0000-0000-1800-000000000003',
     'SẾP', '上司',
     'Ấn tượng! Bạn thuyết phục giỏi — vừa có số liệu, vừa có kế hoạch, vừa có sự chuẩn bị. Duyệt!',
     '印象的！説得力がある — データも計画も準備もある。承認！',
     false, NULL, 8),

    -- ══════════════════════════════════════════════════════════════════════
    -- CHAPTER 19: MÔI TRƯỜNG & PHÁT TRIỂN (Base L1-L3)
    -- ══════════════════════════════════════════════════════════════════════

    -- ── Ch19, L1: Ô nhiễm & Biến đổi khí hậu ──
    ('f3000000-0000-0000-1901-000000000001', 'd0000000-0000-0000-1900-000000000001',
     'GIÁO VIÊN', '先生',
     'Theo bạn, vấn đề môi trường nghiêm trọng nhất ở Việt Nam là gì?',
     'あなたの意見では、ベトナムで最も深刻な環境問題は何ですか？',
     false, NULL, 1),
    ('f3000000-0000-0000-1901-000000000002', 'd0000000-0000-0000-1900-000000000001',
     'BẠN', 'あなた',
     'Theo tôi, ô nhiễm không khí ở Hà Nội rất đáng lo. Sở dĩ em lo là vì chỉ số AQI thường xuyên vượt 150.',
     '私の意見では、ハノイの大気汚染が非常に心配です。心配な理由は、AQI指数が頻繁に150を超えているから。',
     true, '[{"index":2,"color":"var(--error)"},{"index":3,"color":"var(--error)"},{"index":8,"color":"var(--primary)"},{"index":9,"color":"var(--primary)"}]', 2),
    ('f3000000-0000-0000-1901-000000000003', 'd0000000-0000-0000-1900-000000000001',
     'GIÁO VIÊN', '先生',
     'Phân tích tốt! Nguyên nhân chính là khí thải xe máy và đốt rơm rạ ngoại thành.',
     'いい分析ですね！主な原因はバイクの排気ガスと郊外の稲わら焼きです。',
     false, NULL, 3),
    ('f3000000-0000-0000-1901-000000000004', 'd0000000-0000-0000-1900-000000000001',
     'BẠN', 'あなた',
     'Mặc dù Hà Nội đang cấm xe máy nội thành, nhưng giải pháp triệt để cần thời gian dài.',
     'ハノイは市内中心部のバイク禁止を進めていますが、根本的な解決には長い時間が必要です。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":6,"color":"var(--primary)"}]', 4),
    ('f3000000-0000-0000-1901-000000000005', 'd0000000-0000-0000-1900-000000000001',
     'GIÁO VIÊN', '先生',
     'Ở Nhật, vấn đề ô nhiễm Minamata từng rất nghiêm trọng. Bạn thấy bài học gì cho Việt Nam?',
     '日本では水俣の汚染問題がかつて深刻でした。ベトナムへの教訓は何だと思いますか？',
     false, NULL, 5),
    ('f3000000-0000-0000-1901-000000000006', 'd0000000-0000-0000-1900-000000000001',
     'BẠN', 'あなた',
     'Sở dĩ Nhật khắc phục được là vì luật môi trường nghiêm khắc và ý thức cộng đồng cao. Việt Nam cần cả hai.',
     '日本が克服できた理由は、厳しい環境法と高い市民意識があったから。ベトナムにはその両方が必要です。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":8,"color":"var(--primary)"},{"index":9,"color":"var(--primary)"}]', 6),
    ('f3000000-0000-0000-1901-000000000007', 'd0000000-0000-0000-1900-000000000001',
     'GIÁO VIÊN', '先生',
     'Rất chuẩn! Kinh nghiệm Nhật Bản là bài học quý. Hy vọng Việt Nam học hỏi kịp thời.',
     '正確です！日本の経験は貴重な教訓。ベトナムが時宜を得て学ぶことを願います。',
     false, NULL, 7),
    ('f3000000-0000-0000-1901-000000000008', 'd0000000-0000-0000-1900-000000000001',
     'BẠN', 'あなた',
     'Không những học về môi trường, mà còn học cách tranh luận bằng tiếng Việt. Một mũi tên trúng hai đích!',
     '環境について学ぶだけでなく、ベトナム語での議論の仕方も学べました。一石二鳥！',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":8,"color":"var(--primary)"},{"index":14,"color":"var(--error)"},{"index":15,"color":"var(--error)"},{"index":16,"color":"var(--error)"},{"index":17,"color":"var(--error)"}]', 8),

    -- ── Ch19, L2: Năng lượng xanh & Bền vững ──
    ('f3000000-0000-0000-1902-000000000001', 'd0000000-0000-0000-1900-000000000002',
     'ĐỒNG NGHIỆP', '同僚',
     'Công ty mình vừa lắp điện mặt trời trên mái. Tiết kiệm 40% tiền điện!',
     'うちの会社は屋上にソーラーパネルを設置したんだ。電気代40%節約！',
     false, NULL, 1),
    ('f3000000-0000-0000-1902-000000000002', 'd0000000-0000-0000-1900-000000000002',
     'BẠN', 'あなた',
     'Thật á? Sở dĩ em quan tâm là vì ở Nhật năng lượng tái tạo đang phát triển mạnh. Việt Nam có trợ cấp không?',
     '本当に？関心がある理由は、日本でも再生可能エネルギーが急成長しているから。ベトナムに補助金はある？',
     true, '[{"index":2,"color":"var(--primary)"},{"index":3,"color":"var(--primary)"},{"index":7,"color":"var(--primary)"},{"index":8,"color":"var(--primary)"}]', 2),
    ('f3000000-0000-0000-1902-000000000003', 'd0000000-0000-0000-1900-000000000002',
     'ĐỒNG NGHIỆP', '同僚',
     'Trước có, giờ hết rồi. Nhưng giá pin rẻ hơn nên vẫn đáng đầu tư.',
     '以前はあったけど、もう終わったよ。でもパネルが安くなったから投資する価値はあるよ。',
     false, NULL, 3),
    ('f3000000-0000-0000-1902-000000000004', 'd0000000-0000-0000-1900-000000000002',
     'BẠN', 'あなた',
     'Mặc dù giá điện Việt Nam rẻ hơn Nhật, nhưng xu hướng tăng là chắc chắn. Đầu tư sớm thì lợi lâu dài.',
     'ベトナムの電気代は日本より安いですが、上昇傾向は確実。早期投資すれば長期的に有利です。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":8,"color":"var(--primary)"}]', 4),
    ('f3000000-0000-0000-1902-000000000005', 'd0000000-0000-0000-1900-000000000002',
     'ĐỒNG NGHIỆP', '同僚',
     'Ngoài điện mặt trời, xe điện VinFast cũng đang bùng nổ ở Việt Nam. Bạn thấy sao?',
     'ソーラー以外に、VinFastの電気自動車もベトナムで爆発的に伸びている。どう思う？',
     false, NULL, 5),
    ('f3000000-0000-0000-1902-000000000006', 'd0000000-0000-0000-1900-000000000002',
     'BẠN', 'あなた',
     'Sở dĩ VinFast thú vị là vì đây là hãng xe điện đầu tiên của Đông Nam Á lên sàn Mỹ. Đáng ngưỡng mộ!',
     'VinFastが面白い理由は、東南アジア初の米国上場EVメーカーだから。賞賛に値します！',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":7,"color":"var(--primary)"},{"index":8,"color":"var(--primary)"}]', 6),
    ('f3000000-0000-0000-1902-000000000007', 'd0000000-0000-0000-1900-000000000002',
     'ĐỒNG NGHIỆP', '同僚',
     'Đúng! Việt Nam không chỉ tiêu thụ công nghệ xanh, mà còn sản xuất. Tương lai rất sáng.',
     'その通り！ベトナムはグリーンテクノロジーを消費するだけでなく、生産もしている。将来はとても明るい。',
     false, NULL, 7),
    ('f3000000-0000-0000-1902-000000000008', 'd0000000-0000-0000-1900-000000000002',
     'BẠN', 'あなた',
     'Không những học từ vựng về năng lượng, mà còn hiểu thêm kinh tế xanh Việt Nam. Chém gió có chất lượng!',
     'エネルギーの語彙を学んだだけでなく、ベトナムのグリーン経済も理解できた。質の高いおしゃべり！',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":8,"color":"var(--primary)"},{"index":13,"color":"var(--error)"},{"index":14,"color":"var(--error)"}]', 8),

    -- ── Ch19, L3: Đô thị hóa & Nông thôn mới ──
    ('f3000000-0000-0000-1903-000000000001', 'd0000000-0000-0000-1900-000000000003',
     'GIÁO VIÊN', '先生',
     'Mỗi năm, hàng triệu người từ nông thôn đổ về thành phố. Điều này tốt hay xấu?',
     '毎年、何百万人もの人が農村から都市に流入しています。これは良いことですか、悪いことですか？',
     false, NULL, 1),
    ('f3000000-0000-0000-1903-000000000002', 'd0000000-0000-0000-1900-000000000003',
     'BẠN', 'あなた',
     'Có hai mặt. Một mặt, kinh tế phát triển. Mặt khác, quá tải hạ tầng và mất bản sắc nông thôn.',
     '両面があります。一方で経済が発展しますが、他方でインフラが過負荷になり農村のアイデンティティが失われます。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":6,"color":"var(--secondary)"},{"index":7,"color":"var(--secondary)"}]', 2),
    ('f3000000-0000-0000-1903-000000000003', 'd0000000-0000-0000-1900-000000000003',
     'GIÁO VIÊN', '先生',
     'Lập luận rất cân bằng! Bạn đã dùng cấu trúc "Một mặt... Mặt khác..." rất chuẩn.',
     'とてもバランスの取れた議論です！「Một mặt...Mặt khác...」の構造を正しく使えていますね。',
     false, NULL, 3),
    ('f3000000-0000-0000-1903-000000000004', 'd0000000-0000-0000-1900-000000000003',
     'BẠN', 'あなた',
     'Sở dĩ em dùng cấu trúc đó là vì muốn thể hiện tư duy phản biện — không nhìn một chiều.',
     'その構造を使った理由は、批判的思考を示したいから — 一面的に見ないこと。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":8,"color":"var(--primary)"}]', 4),
    ('f3000000-0000-0000-1903-000000000005', 'd0000000-0000-0000-1900-000000000003',
     'GIÁO VIÊN', '先生',
     'Ở Nhật, đô thị hóa cũng gây ra "過疎化" (quá sơ hóa) — nông thôn mất dân. Giống Việt Nam không?',
     '日本でも都市化は「過疎化」を引き起こしました — 農村の人口減少。ベトナムも同じ？',
     false, NULL, 5),
    ('f3000000-0000-0000-1903-000000000006', 'd0000000-0000-0000-1900-000000000003',
     'BẠN', 'あなた',
     'Mặc dù Việt Nam chưa nghiêm trọng bằng Nhật, nhưng xu hướng tương tự. Nhiều làng quê chỉ còn người già và trẻ nhỏ.',
     'ベトナムは日本ほど深刻ではないですが、同じ傾向です。多くの村にはお年寄りと子供だけが残っています。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":6,"color":"var(--primary)"}]', 6),
    ('f3000000-0000-0000-1903-000000000007', 'd0000000-0000-0000-1900-000000000003',
     'GIÁO VIÊN', '先生',
     'Chính phủ Việt Nam có chương trình "Nông thôn mới" — đầu tư hạ tầng để giữ chân người dân.',
     'ベトナム政府には「新農村」プログラムがある — 住民を引き留めるためのインフラ投資。',
     false, NULL, 7),
    ('f3000000-0000-0000-1903-000000000008', 'd0000000-0000-0000-1900-000000000003',
     'BẠN', 'あなた',
     'Không những thảo luận thú vị, mà còn giúp em mở rộng vốn từ về đô thị hóa và chính sách. Đỉnh của chóp!',
     '面白い議論だっただけでなく、都市化と政策に関する語彙も広がりました。最高！',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":8,"color":"var(--primary)"},{"index":13,"color":"var(--error)"},{"index":14,"color":"var(--error)"},{"index":15,"color":"var(--error)"}]', 8)

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
