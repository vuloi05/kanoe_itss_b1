-- =============================================================================
-- VietImmerse — Seed Data (Idempotent UPSERT)
-- =============================================================================
-- This file uses INSERT ... ON CONFLICT DO UPDATE (UPSERT) so it is safe to run
-- multiple times.  It will NEVER delete existing data.
--
-- Deterministic UUIDs are used for reproducibility across environments.
-- =============================================================================

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 0. CLEANUP: Remove old C# seeder data that used random UUIDs
--    Only affects admin-managed content tables, NOT user data.
-- ═══════════════════════════════════════════════════════════════════════════════

-- Delete child tables first (FK order)
DELETE FROM lesson_dialogues  WHERE lesson_id::text NOT LIKE 'd0000000-%';
DELETE FROM lesson_tone_notes WHERE lesson_id::text NOT LIKE 'd0000000-%';
DELETE FROM lessons           WHERE lesson_id::text NOT LIKE 'd0000000-%';

-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. USERS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Learner demo account
INSERT INTO users (user_id, email, password_hash, display_name, role, account_status, created_at, updated_at)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'abc@gmail.com',
    '$2a$11$HxVg4DME3wu9J/9V7M5q7uVSm3AoQvKtvvokHgTavkCe1H/6na8Gi',
    'Học viên Demo',
    'learner',
    'active',
    NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
    password_hash  = EXCLUDED.password_hash,
    display_name   = EXCLUDED.display_name,
    role           = EXCLUDED.role,
    account_status = EXCLUDED.account_status,
    updated_at     = NOW();

-- Partner demo account
INSERT INTO users (user_id, email, password_hash, display_name, role, account_status, created_at, updated_at)
VALUES (
    'a0000000-0000-0000-0000-000000000002',
    'doitac@gmail.com',
    '$2a$11$HxVg4DME3wu9J/9V7M5q7uVSm3AoQvKtvvokHgTavkCe1H/6na8Gi',
    'Đối tác Demo',
    'partner',
    'active',
    NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
    password_hash  = EXCLUDED.password_hash,
    display_name   = EXCLUDED.display_name,
    role           = EXCLUDED.role,
    account_status = EXCLUDED.account_status,
    updated_at     = NOW();

-- Resolve actual user_ids (may differ from deterministic UUIDs if users already existed)
DO $$
DECLARE
    v_learner_id UUID;
    v_partner_id UUID;
BEGIN
    SELECT user_id INTO v_learner_id FROM users WHERE email = 'abc@gmail.com';
    SELECT user_id INTO v_partner_id FROM users WHERE email = 'doitac@gmail.com';

    -- Learner profile (level V2)
    INSERT INTO learner_profiles (profile_id, user_id, goals, native_language, created_at, updated_at)
    VALUES (
        'b0000000-0000-0000-0000-000000000001',
        v_learner_id, 'v2', 'ja', NOW(), NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        goals           = EXCLUDED.goals,
        native_language = EXCLUDED.native_language,
        updated_at      = NOW();

    -- Partner profile
    INSERT INTO partner_profiles (profile_id, user_id, bio, age_range, job, created_at, updated_at)
    VALUES (
        'b0000000-0000-0000-0000-000000000002',
        v_partner_id, 'Tài khoản đối tác demo', '25-30', 'Giáo viên', NOW(), NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        bio        = EXCLUDED.bio,
        age_range  = EXCLUDED.age_range,
        job        = EXCLUDED.job,
        updated_at = NOW();

    -- Conversation between learner and partner
    INSERT INTO conversations (conversation_id, learner_id, partner_id, created_at)
    VALUES (
        'c0000000-0000-0000-0000-000000000001',
        v_learner_id, v_partner_id, NOW()
    )
    ON CONFLICT (learner_id, partner_id) DO NOTHING;
END $$;

-- ─── Additional Demo Accounts ─────────────────────────────────────────────────
-- All passwords: 1234567890  (same bcrypt hash as above)
-- Learner = Japanese names | Partner = Vietnamese names (VietImmerse context)

-- Learner 2: 田中太郎 (Tanaka Taro)
INSERT INTO users (user_id, email, password_hash, display_name, role, account_status, created_at, updated_at)
VALUES (
    'a0000000-0000-0000-0000-000000000003',
    'tanaka@gmail.com',
    '$2a$11$HxVg4DME3wu9J/9V7M5q7uVSm3AoQvKtvvokHgTavkCe1H/6na8Gi',
    '田中太郎',
    'learner',
    'active',
    NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
    password_hash  = EXCLUDED.password_hash,
    display_name   = EXCLUDED.display_name,
    role           = EXCLUDED.role,
    account_status = EXCLUDED.account_status,
    updated_at     = NOW();

-- Learner 3: 佐藤花子 (Sato Hanako)
INSERT INTO users (user_id, email, password_hash, display_name, role, account_status, created_at, updated_at)
VALUES (
    'a0000000-0000-0000-0000-000000000004',
    'sato@gmail.com',
    '$2a$11$HxVg4DME3wu9J/9V7M5q7uVSm3AoQvKtvvokHgTavkCe1H/6na8Gi',
    '佐藤花子',
    'learner',
    'active',
    NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
    password_hash  = EXCLUDED.password_hash,
    display_name   = EXCLUDED.display_name,
    role           = EXCLUDED.role,
    account_status = EXCLUDED.account_status,
    updated_at     = NOW();

-- Partner 2: Trần Minh Tuấn
INSERT INTO users (user_id, email, password_hash, display_name, role, account_status, created_at, updated_at)
VALUES (
    'a0000000-0000-0000-0000-000000000005',
    'tuan.tran@gmail.com',
    '$2a$11$HxVg4DME3wu9J/9V7M5q7uVSm3AoQvKtvvokHgTavkCe1H/6na8Gi',
    'Trần Minh Tuấn',
    'partner',
    'active',
    NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
    password_hash  = EXCLUDED.password_hash,
    display_name   = EXCLUDED.display_name,
    role           = EXCLUDED.role,
    account_status = EXCLUDED.account_status,
    updated_at     = NOW();

-- Partner 3: Nguyễn Thị Mai
INSERT INTO users (user_id, email, password_hash, display_name, role, account_status, created_at, updated_at)
VALUES (
    'a0000000-0000-0000-0000-000000000006',
    'mai.nguyen@gmail.com',
    '$2a$11$HxVg4DME3wu9J/9V7M5q7uVSm3AoQvKtvvokHgTavkCe1H/6na8Gi',
    'Nguyễn Thị Mai',
    'partner',
    'active',
    NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
    password_hash  = EXCLUDED.password_hash,
    display_name   = EXCLUDED.display_name,
    role           = EXCLUDED.role,
    account_status = EXCLUDED.account_status,
    updated_at     = NOW();

-- Profiles & Conversations for new accounts
DO $$
DECLARE
    v_learner1 UUID; v_learner2 UUID; v_learner3 UUID;
    v_partner1 UUID; v_partner2 UUID; v_partner3 UUID;
BEGIN
    SELECT user_id INTO v_learner1 FROM users WHERE email = 'abc@gmail.com';
    SELECT user_id INTO v_learner2 FROM users WHERE email = 'tanaka@gmail.com';
    SELECT user_id INTO v_learner3 FROM users WHERE email = 'sato@gmail.com';
    SELECT user_id INTO v_partner1 FROM users WHERE email = 'doitac@gmail.com';
    SELECT user_id INTO v_partner2 FROM users WHERE email = 'tuan.tran@gmail.com';
    SELECT user_id INTO v_partner3 FROM users WHERE email = 'mai.nguyen@gmail.com';

    -- Learner profiles
    INSERT INTO learner_profiles (profile_id, user_id, native_language, created_at, updated_at) VALUES
        ('b0000000-0000-0000-0000-000000000003', v_learner2, 'ja', NOW(), NOW()),
        ('b0000000-0000-0000-0000-000000000004', v_learner3, 'ja', NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET native_language = EXCLUDED.native_language, updated_at = NOW();

    -- Partner profiles
    INSERT INTO partner_profiles (profile_id, user_id, bio, age_range, job, created_at, updated_at) VALUES
        ('b0000000-0000-0000-0000-000000000005', v_partner2, 'Giáo viên tiếng Việt, chuyên dạy giao tiếp cho người Nhật.', '31-40', 'Giáo viên', NOW(), NOW()),
        ('b0000000-0000-0000-0000-000000000006', v_partner3, 'Sinh viên ngôn ngữ, yêu thích văn hóa Nhật Bản.', '18-24', 'Dịch vụ', NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET bio = EXCLUDED.bio, age_range = EXCLUDED.age_range, job = EXCLUDED.job, updated_at = NOW();

    -- Conversations: every Learner × every Partner (6 conversations total, 1 already exists)
    -- Learner1 × Partner2
    INSERT INTO conversations (conversation_id, learner_id, partner_id, created_at)
    VALUES ('c0000000-0000-0000-0000-000000000002', v_learner1, v_partner2, NOW())
    ON CONFLICT (learner_id, partner_id) DO NOTHING;
    -- Learner1 × Partner3
    INSERT INTO conversations (conversation_id, learner_id, partner_id, created_at)
    VALUES ('c0000000-0000-0000-0000-000000000003', v_learner1, v_partner3, NOW())
    ON CONFLICT (learner_id, partner_id) DO NOTHING;
    -- Learner2 × Partner1
    INSERT INTO conversations (conversation_id, learner_id, partner_id, created_at)
    VALUES ('c0000000-0000-0000-0000-000000000004', v_learner2, v_partner1, NOW())
    ON CONFLICT (learner_id, partner_id) DO NOTHING;
    -- Learner2 × Partner2
    INSERT INTO conversations (conversation_id, learner_id, partner_id, created_at)
    VALUES ('c0000000-0000-0000-0000-000000000005', v_learner2, v_partner2, NOW())
    ON CONFLICT (learner_id, partner_id) DO NOTHING;
    -- Learner2 × Partner3
    INSERT INTO conversations (conversation_id, learner_id, partner_id, created_at)
    VALUES ('c0000000-0000-0000-0000-000000000006', v_learner2, v_partner3, NOW())
    ON CONFLICT (learner_id, partner_id) DO NOTHING;
    -- Learner3 × Partner1
    INSERT INTO conversations (conversation_id, learner_id, partner_id, created_at)
    VALUES ('c0000000-0000-0000-0000-000000000007', v_learner3, v_partner1, NOW())
    ON CONFLICT (learner_id, partner_id) DO NOTHING;
    -- Learner3 × Partner2
    INSERT INTO conversations (conversation_id, learner_id, partner_id, created_at)
    VALUES ('c0000000-0000-0000-0000-000000000008', v_learner3, v_partner2, NOW())
    ON CONFLICT (learner_id, partner_id) DO NOTHING;
    -- Learner3 × Partner3
    INSERT INTO conversations (conversation_id, learner_id, partner_id, created_at)
    VALUES ('c0000000-0000-0000-0000-000000000009', v_learner3, v_partner3, NOW())
    ON CONFLICT (learner_id, partner_id) DO NOTHING;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. CONTENT LEVELS
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO content_levels (level_id, display_name, description, sort_order) VALUES
    (1, 'V1', 'Trình độ V1 — Sơ cấp', 1),
    (2, 'V2', 'Trình độ V2 — Trung cấp', 2),
    (3, 'V3', 'Trình độ V3 — Cao cấp', 3)
ON CONFLICT (level_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description  = EXCLUDED.description,
    sort_order   = EXCLUDED.sort_order;

SELECT setval(pg_get_serial_sequence('content_levels', 'level_id'), GREATEST(3, (SELECT MAX(level_id) FROM content_levels)));

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. CHAPTERS
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO chapters (chapter_id, level_id, title_vi, title_jp, icon, sort_order) VALUES
    (1, 1, 'Chương 1: Thanh điệu miền Bắc',          '第1章：北部の声調',          'graphic_eq',        1),
    (2, 1, 'Chương 2: Giao tiếp tại quán ăn',         '第2章：飲食店での会話',       'restaurant_menu',   2),
    (3, 1, 'Chương 3: Chào hỏi & Xưng hô',            '第3章：挨拶と呼称',          'waving_hand',       3),
    (4, 1, 'Chương 4: Đi chợ & Mua sắm',              '第4章：市場と買い物',         'shopping_cart',     4),
    (5, 1, 'Chương 5: Di chuyển & Phương tiện',        '第5章：移動と交通',          'directions_car',    5),
    (6, 1, 'Chương 6: Nguyên âm & Phụ âm đặc biệt',   '第6章：特殊な母音と子音',     'record_voice_over', 6),
    (7, 1, 'Chương 7: Sinh hoạt hàng ngày',            '第7章：日常生活',            'calendar_today',    7),
    (8, 1, 'Chương 8: Tình huống khẩn cấp',            '第8章：緊急事態',            'emergency',         8),
    -- ── V2 Chapters ──
    ( 9, 2, 'Chương 1: Giao tiếp công sở',              '第1章：オフィスでの会話',      'business_center',   1),
    (10, 2, 'Chương 2: Văn hóa & Lễ hội Việt Nam',      '第2章：ベトナムの文化と祭り',   'festival',          2),
    (11, 2, 'Chương 3: Sức khỏe & Chăm sóc bản thân',   '第3章：健康とセルフケア',       'health_and_safety', 3),
    (12, 2, 'Chương 4: Du lịch & Khám phá',              '第4章：旅行と探検',           'travel_explore',    4),
    (13, 2, 'Chương 5: Ẩm thực nâng cao',                '第5章：グルメ上級編',          'ramen_dining',      5),
    (14, 2, 'Chương 6: Gia đình & Các mối quan hệ',      '第6章：家族と人間関係',        'family_restroom',   6),
    (15, 2, 'Chương 7: Tin tức & Truyền thông',           '第7章：ニュースとメディア',     'newspaper',         7),
    (16, 2, 'Chương 8: Đời sống xã hội',                  '第8章：社会生活',             'groups',            8),
    -- ── V3 Chapters ──
    (17, 3, 'Chương 1: Thành ngữ & Tục ngữ',             '第1章：慣用句とことわざ',        'auto_stories',      1),
    (18, 3, 'Chương 2: Đàm phán & Thương lượng',          '第2章：交渉と商談',             'handshake',         2),
    (19, 3, 'Chương 3: Môi trường & Phát triển',           '第3章：環境と開発',             'eco',               3),
    (20, 3, 'Chương 4: Văn học & Nghệ thuật',              '第4章：文学と芸術',             'palette',           4),
    (21, 3, 'Chương 5: Kinh tế & Khởi nghiệp',            '第5章：経済と起業',             'trending_up',       5),
    (22, 3, 'Chương 6: Phương ngữ & Giọng vùng miền',     '第6章：方言と地方のアクセント',    'map',               6),
    (23, 3, 'Chương 7: Thuyết trình & Diễn thuyết',       '第7章：プレゼンと演説',          'podium',            7),
    (24, 3, 'Chương 8: Triết lý & Giá trị sống',          '第8章：哲学と人生の価値観',       'psychology',        8)
ON CONFLICT (chapter_id) DO UPDATE SET
    level_id   = EXCLUDED.level_id,
    title_vi   = EXCLUDED.title_vi,
    title_jp   = EXCLUDED.title_jp,
    icon       = EXCLUDED.icon,
    sort_order = EXCLUDED.sort_order;

SELECT setval(pg_get_serial_sequence('chapters', 'chapter_id'), GREATEST(24, (SELECT MAX(chapter_id) FROM chapters)));

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. LESSONS
-- ═══════════════════════════════════════════════════════════════════════════════
-- Using deterministic UUIDs: d0000000-0000-0000-CC00-00000000000L
-- where CC = chapter number (01-08), L = lesson number within chapter (1-3)

INSERT INTO lessons (lesson_id, chapter_id, scene_label, scene_label_jp, title_vi, title_jp, subtitle_vi, subtitle_jp, tag, tag_jp, duration_minutes, sort_order, is_locked, created_at) VALUES
    -- Chapter 1
    ('d0000000-0000-0000-0100-000000000001', 1, 'Bài 01 • Chương 1', 'レッスン01 • 第1章', 'Thanh sắc & Thanh huyền', '昇り声調と降り声調', 'Nền tảng âm điệu — học cách lên và xuống giọng đúng chuẩn Hà Nội', '声調の基礎 — ハノイ式の上がり・下がりを正しく習得しよう', 'Sơ cấp', '初級', 10, 1, false, NOW()),
    ('d0000000-0000-0000-0100-000000000002', 1, 'Bài 02 • Chương 1', 'レッスン02 • 第1章', 'Thanh hỏi & Thanh ngã', '疑問声調と転がり声調', 'Luyện tập hai thanh điệu khó nhất của tiếng Bắc', '北部ベトナム語の最難関声調をマスターしよう', 'Trung cấp', '中級', 10, 2, false, NOW()),
    ('d0000000-0000-0000-0100-000000000003', 1, 'Bài 03 • Chương 1', 'レッスン03 • 第1章', 'Thanh nặng & Thanh ngang', '重声調と平声調', 'Hoàn thiện hệ thống 6 thanh điệu tiếng Bắc', '北部ベトナム語6声調の体系を完成させよう', 'Sơ cấp', '初級', 10, 3, false, NOW()),
    -- Chapter 2
    ('d0000000-0000-0000-0200-000000000001', 2, 'Bài 01 • Chương 2', 'レッスン01 • 第2章', 'Gọi món tại quán Bún Chả', 'ブンチャー屋での注文', 'Hội thoại thực tế tại quán ăn Hà Nội', 'ハノイの食堂での実践会話', 'Thực tế', '実践', 12, 1, false, NOW()),
    ('d0000000-0000-0000-0200-000000000002', 2, 'Bài 02 • Chương 2', 'レッスン02 • 第2章', 'Yêu cầu thanh toán', 'お会計をお願いする', 'Học cách xin thanh toán lịch sự tại quán ăn', '飲食店で丁寧にお会計をお願いする方法', 'Thực tế', '実践', 10, 2, false, NOW()),
    ('d0000000-0000-0000-0200-000000000003', 2, 'Bài 03 • Chương 2', 'レッスン03 • 第2章', 'Khen ngon & Hỏi thêm', '美味しいと褒める・追加注文', 'Cách khen món ăn và gọi thêm bằng tiếng Bắc', '北部の言い回しで料理を褒めたり追加注文しよう', 'Thực tế', '実践', 10, 3, false, NOW()),
    -- Chapter 3
    ('d0000000-0000-0000-0300-000000000001', 3, 'Bài 01 • Chương 3', 'レッスン01 • 第3章', 'Xin chào — Cách chào theo tuổi', 'こんにちは — 年齢に応じた挨拶', 'Chào người lớn tuổi, bạn bè và trẻ nhỏ khác nhau thế nào?', '年上・友達・子供、それぞれの挨拶の違いを学ぼう', 'Sơ cấp', '初級', 8, 1, false, NOW()),
    ('d0000000-0000-0000-0300-000000000002', 3, 'Bài 02 • Chương 3', 'レッスン02 • 第3章', 'Xưng hô: Anh, Chị, Em, Tôi', '呼称：アイン、チ、エム、トイ', 'Hệ thống đại từ xưng hô — chìa khóa giao tiếp lịch sự', '人称代名詞の体系 — 丁寧な会話の鍵', 'Sơ cấp', '初級', 10, 2, false, NOW()),
    ('d0000000-0000-0000-0300-000000000003', 3, 'Bài 03 • Chương 3', 'レッスン03 • 第3章', 'Giới thiệu bản thân', '自己紹介', 'Tên, quốc tịch, nghề nghiệp — tự giới thiệu đơn giản', '名前・国籍・職業 — シンプルな自己紹介', 'Sơ cấp', '初級', 10, 3, false, NOW()),
    -- Chapter 4
    ('d0000000-0000-0000-0400-000000000001', 4, 'Bài 01 • Chương 4', 'レッスン01 • 第4章', 'Hỏi giá — "Bao nhiêu tiền?"', '値段を聞く — "いくらですか？"', 'Câu hỏi quan trọng nhất khi đi chợ Hà Nội', 'ハノイの市場で最も重要なフレーズ', 'Thực tế', '実践', 8, 1, false, NOW()),
    ('d0000000-0000-0000-0400-000000000002', 4, 'Bài 02 • Chương 4', 'レッスン02 • 第4章', 'Trả giá lịch sự', '丁寧な値切り方', 'Nghệ thuật mặc cả tại chợ Đồng Xuân', 'ドンスアン市場での値切り術', 'Trung cấp', '中級', 12, 2, false, NOW()),
    ('d0000000-0000-0000-0400-000000000003', 4, 'Bài 03 • Chương 4', 'レッスン03 • 第4章', 'Đếm số & Đơn vị tiền Việt', '数字とベトナム通貨の単位', 'Từ 1 đến 1 triệu — hệ thống số đếm tiếng Việt', '1から100万まで — ベトナム語の数字体系', 'Sơ cấp', '初級', 10, 3, false, NOW()),
    -- Chapter 5
    ('d0000000-0000-0000-0500-000000000001', 5, 'Bài 01 • Chương 5', 'レッスン01 • 第5章', 'Gọi Grab & Taxi', 'GrabとTaxiの呼び方', 'Hội thoại thực tế khi đi Grab hoặc Taxi tại Hà Nội', 'ハノイでGrabやTaxiに乗る時の実践会話', 'Thực tế', '実践', 10, 1, false, NOW()),
    ('d0000000-0000-0000-0500-000000000002', 5, 'Bài 02 • Chương 5', 'レッスン02 • 第5章', 'Hỏi đường — "Đi thế nào?"', '道を聞く — "どう行けばいい？"', 'Rẽ trái, rẽ phải, đi thẳng — từ vựng chỉ đường', '左折・右折・直進 — 道案内の語彙', 'Sơ cấp', '初級', 10, 2, false, NOW()),
    ('d0000000-0000-0000-0500-000000000003', 5, 'Bài 03 • Chương 5', 'レッスン03 • 第5章', 'Xe buýt & Tàu điện', 'バスと電車', 'Cách sử dụng phương tiện công cộng ở Hà Nội', 'ハノイの公共交通機関の使い方', 'Trung cấp', '中級', 12, 3, false, NOW()),
    -- Chapter 6
    ('d0000000-0000-0000-0600-000000000001', 6, 'Bài 01 • Chương 6', 'レッスン01 • 第6章', 'Nguyên âm: ă, â, ê, ô, ơ, ư', '母音：ă, â, ê, ô, ơ, ư', '6 nguyên âm đặc trưng không có trong tiếng Nhật', '日本語にない6つの特徴的な母音', 'Sơ cấp', '初級', 12, 1, false, NOW()),
    ('d0000000-0000-0000-0600-000000000002', 6, 'Bài 02 • Chương 6', 'レッスン02 • 第6章', 'Phụ âm đầu: gi, d, r miền Bắc', '頭子音：北部の gi, d, r', 'Ba phụ âm phát giống nhau ở miền Bắc: đều đọc là /z/', '北部で同じ発音になる3つの子音：すべて /z/', 'Trung cấp', '中級', 10, 2, false, NOW()),
    ('d0000000-0000-0000-0600-000000000003', 6, 'Bài 03 • Chương 6', 'レッスン03 • 第6章', 'Vần cuối: -ng, -nh, -ch, -t', '末尾子音：-ng, -nh, -ch, -t', 'Cách đọc phụ âm cuối — điểm khác biệt lớn với tiếng Nhật', '末尾子音の読み方 — 日本語との大きな違い', 'Trung cấp', '中級', 12, 3, false, NOW()),
    -- Chapter 7
    ('d0000000-0000-0000-0700-000000000001', 7, 'Bài 01 • Chương 7', 'レッスン01 • 第7章', 'Thời gian — Hôm nay, ngày mai', '時間 — 今日・明日', 'Ngày, tháng, tuần — cách diễn đạt thời gian', '日・月・週 — 時間の表現方法', 'Sơ cấp', '初級', 10, 1, false, NOW()),
    ('d0000000-0000-0000-0700-000000000002', 7, 'Bài 02 • Chương 7', 'レッスン02 • 第7章', 'Thời tiết Hà Nội', 'ハノイの天気', 'Nóng, lạnh, mưa — nói về thời tiết hàng ngày', '暑い・寒い・雨 — 毎日の天気を話す', 'Sơ cấp', '初級', 8, 2, false, NOW()),
    ('d0000000-0000-0000-0700-000000000003', 7, 'Bài 03 • Chương 7', 'レッスン03 • 第7章', 'Sở thích & Hoạt động cuối tuần', '趣味と週末の活動', '"Bạn thích làm gì?" — hội thoại về sở thích', '"何が好き？" — 趣味についての会話', 'Trung cấp', '中級', 12, 3, false, NOW()),
    -- Chapter 8
    ('d0000000-0000-0000-0800-000000000001', 8, 'Bài 01 • Chương 8', 'レッスン01 • 第8章', '"Tôi không hiểu" — Cầu cứu ngôn ngữ', '"わかりません" — 言葉のSOS', 'Những câu cứu mạng khi bạn không hiểu người Việt nói gì', 'ベトナム人の言葉がわからない時の救命フレーズ', 'Sơ cấp', '初級', 8, 1, false, NOW()),
    ('d0000000-0000-0000-0800-000000000002', 8, 'Bài 02 • Chương 8', 'レッスン02 • 第8章', 'Tại bệnh viện & Nhà thuốc', '病院と薬局にて', 'Mô tả triệu chứng và mua thuốc bằng tiếng Việt', 'ベトナム語で症状を説明し、薬を買う', 'Thực tế', '実践', 15, 2, false, NOW()),
    ('d0000000-0000-0000-0800-000000000003', 8, 'Bài 03 • Chương 8', 'レッスン03 • 第8章', 'Gọi điện thoại khẩn cấp', '緊急電話をかける', 'Số 113, 114, 115 — biết cách gọi cứu hộ khi cần', '113・114・115 — 必要な時に助けを呼べるようになろう', 'Thực tế', '実践', 10, 3, false, NOW())
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
-- 5. LESSON TONE NOTES
-- ═══════════════════════════════════════════════════════════════════════════════
-- UUID pattern: e1CCLLSS where CC=chapter, LL=lesson, SS=sort_order

INSERT INTO lesson_tone_notes (note_id, lesson_id, tone, desc_vi, desc_jp, example, color, sort_order) VALUES
    -- Lesson 1 (Ch1): Thanh sắc & Thanh huyền
    ('e1000000-0000-0000-0101-000000000001', 'd0000000-0000-0000-0100-000000000001',
     'Thanh sắc (/)',
     'Bắt đầu từ giữa, lên cao và căng — nghe mạnh, rõ ràng',
     '中音から高音へ上がる、張りのある声調 — 強くはっきり聞こえる',
     'bé, cá, mái, tớ', 'var(--primary)', 1),

    ('e1000000-0000-0000-0102-000000000001', 'd0000000-0000-0000-0100-000000000001',
     'Thanh huyền (\)',
     'Bắt đầu cao vừa, xuống thấp dần — nghe trầm, nhẹ nhàng',
     '中高音から低音へ下がる — 落ち着いた穏やかな声調',
     'bề, cà, mài, tờ', 'var(--secondary)', 2),

    -- Lesson 2 (Ch1): Thanh hỏi & Thanh ngã
    ('e1000000-0000-0000-0201-000000000001', 'd0000000-0000-0000-0100-000000000002',
     'Thanh hỏi (?)',
     'Bắt đầu thấp, xuống rồi lên nhẹ — như hỏi han',
     '低く始まり、下がってから少し上がる — 問いかけるような声調',
     'bể, ngỏ, để, mỉa', 'var(--secondary)', 1),

    ('e1000000-0000-0000-0202-000000000001', 'd0000000-0000-0000-0100-000000000002',
     'Thanh ngã (~)',
     'Bắt đầu cao, gãy giữa chừng với tiếng tắt thanh quản',
     '高く始まり、途中で声門閉鎖音で切れる — 強くシャープな声調',
     'bẽ, ngõ, dễ, mãi', 'var(--error)', 2),

    -- Lesson 3 (Ch1): Thanh nặng & Thanh ngang
    ('e1000000-0000-0000-0301-000000000001', 'd0000000-0000-0000-0100-000000000003',
     'Thanh nặng (.)',
     'Bắt đầu thấp, rơi nhanh và tắt đột ngột — nghe nặng nề',
     '低く始まり、急激に下がって途切れる — 重く沈む声調',
     'bẹ, cạ, mại, tợ', 'var(--error)', 1),

    ('e1000000-0000-0000-0302-000000000001', 'd0000000-0000-0000-0100-000000000003',
     'Thanh ngang (–)',
     'Giọng bằng phẳng, không lên không xuống — thanh mặc định',
     '平坦な声調、上がりも下がりもしない — デフォルトの声調',
     'be, ca, mai, to', 'var(--primary)', 2),

    -- Lesson 1 (Ch6): Nguyên âm
    ('e1000000-0000-0000-0601-000000000001', 'd0000000-0000-0000-0600-000000000001',
     'ơ vs ô',
     '"ơ" — miệng mở rộng, giống "uh" kéo dài. "ô" — miệng tròn nhỏ.',
     '「ơ」は口を広げる。「ô」は口を丸く小さくする。',
     'cơm (ご飯) vs côm', 'var(--primary)', 1),

    ('e1000000-0000-0000-0602-000000000001', 'd0000000-0000-0000-0600-000000000001',
     'ư vs u',
     '"ư" — miệng mím, lưỡi rút về sau. "u" — giống "u" tiếng Nhật.',
     '「ư」は唇を横に引き、舌を後ろに。「u」は日本語の「う」に近い。',
     'lưng (背中) vs lung', 'var(--secondary)', 2)
ON CONFLICT (note_id) DO UPDATE SET
    lesson_id  = EXCLUDED.lesson_id,
    tone       = EXCLUDED.tone,
    desc_vi    = EXCLUDED.desc_vi,
    desc_jp    = EXCLUDED.desc_jp,
    example    = EXCLUDED.example,
    color      = EXCLUDED.color,
    sort_order = EXCLUDED.sort_order;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. LESSON DIALOGUES
-- ═══════════════════════════════════════════════════════════════════════════════
-- UUID pattern: f1CCLLSS where CC=chapter, LL=lesson, SS=sort_order
-- 8 dialogues per lesson (4 learner + 4 partner), alternating turns

INSERT INTO lesson_dialogues (dialogue_id, lesson_id, speaker, speaker_jp, line_vi, line_jp, is_active, highlight_words_json, sort_order) VALUES

    -- ══════════════════════════════════════════════════════════════════════
    -- CHAPTER 1: THANH ĐIỆU MIỀN BẮC
    -- ══════════════════════════════════════════════════════════════════════

    -- ── Chapter 1, Lesson 1: Thanh sắc & Thanh huyền ──
    ('f1000000-0000-0000-0101-000000000001', 'd0000000-0000-0000-0100-000000000001',
     'GIÁO VIÊN', '先生',
     'Hôm nay chúng ta bắt đầu với hai thanh cơ bản nhất: thanh sắc và thanh huyền. Em sẵn sàng chưa?',
     '今日は最も基本的な2つの声調から始めます：thanh sắc（上昇調）とthanh huyền（下降調）。準備はいい？',
     false, NULL, 1),

    ('f1000000-0000-0000-0102-000000000001', 'd0000000-0000-0000-0100-000000000001',
     'BẠN', 'あなた',
     'Dạ, em sẵn sàng rồi ạ! Thanh sắc đọc như thế nào ạ?',
     'はい、準備できました！thanh sắcはどう発音しますか？',
     true, '[{"index":5,"color":"var(--primary)"},{"index":6,"color":"var(--primary)"}]', 2),

    ('f1000000-0000-0000-0103-000000000001', 'd0000000-0000-0000-0100-000000000001',
     'GIÁO VIÊN', '先生',
     'Thanh sắc giọng đi lên, mạnh và rõ ràng. Đọc theo tôi nhé: cá, má, bé, tớ.',
     'thanh sắcは声が上がり、力強くはっきりしています。私の後に読んで：cá, má, bé, tớ。',
     false, NULL, 3),

    ('f1000000-0000-0000-0104-000000000001', 'd0000000-0000-0000-0100-000000000001',
     'BẠN', 'あなた',
     'Cá, má, bé, tớ. Giọng lên cao phải không ạ?',
     'カー、マー、ベー、トー。声を上げるんですよね？',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":2,"color":"var(--primary)"},{"index":3,"color":"var(--primary)"}]', 4),

    ('f1000000-0000-0000-0105-000000000001', 'd0000000-0000-0000-0100-000000000001',
     'GIÁO VIÊN', '先生',
     'Đúng rồi! Giờ đến thanh huyền — giọng đi xuống, nhẹ nhàng hơn: cà, mà, bè, tờ.',
     'その通り！次はthanh huyền — 声が下がり、柔らかいです：cà, mà, bè, tờ。',
     false, NULL, 5),

    ('f1000000-0000-0000-0106-000000000001', 'd0000000-0000-0000-0100-000000000001',
     'BẠN', 'あなた',
     'Cà, mà, bè, tờ. Giọng xuống nhẹ, đúng không ạ?',
     'カー、マー、ベー、トー。声を優しく下げるんですね？',
     true, '[{"index":0,"color":"var(--secondary)"},{"index":1,"color":"var(--secondary)"},{"index":2,"color":"var(--secondary)"},{"index":3,"color":"var(--secondary)"}]', 6),

    ('f1000000-0000-0000-0107-000000000001', 'd0000000-0000-0000-0100-000000000001',
     'GIÁO VIÊN', '先生',
     'Rất tốt! Bây giờ so sánh nhé: "cá" là con cá, "cà" là quả cà. Thanh khác thì nghĩa khác hoàn toàn!',
     'とても良い！比べて：「cá」は魚、「cà」はナス。声調が違えば意味が全く違います！',
     false, NULL, 7),

    ('f1000000-0000-0000-0108-000000000001', 'd0000000-0000-0000-0100-000000000001',
     'BẠN', 'あなた',
     'Cá là con cá, cà là quả cà. Em hiểu rồi ạ! Thanh điệu rất quan trọng!',
     'cáは魚、càはナス。わかりました！声調はとても重要ですね！',
     true, '[{"index":0,"color":"var(--primary)"},{"index":4,"color":"var(--secondary)"}]', 8),

    -- ── Chapter 1, Lesson 2: Thanh hỏi & Thanh ngã ──
    ('f1000000-0000-0000-0201-000000000001', 'd0000000-0000-0000-0100-000000000002',
     'GIÁO VIÊN', '先生',
     'Hôm nay ta học hai thanh khó nhất: thanh hỏi và thanh ngã. Người Nhật thường hay nhầm hai thanh này.',
     '今日は最も難しい2つの声調を学びます：thanh hỏi と thanh ngã。日本人がよく混同する声調です。',
     false, NULL, 1),

    ('f1000000-0000-0000-0202-000000000001', 'd0000000-0000-0000-0100-000000000002',
     'BẠN', 'あなた',
     'Dạ, em nghe nói thanh hỏi giống như hỏi một câu hỏi, đúng không ạ?',
     'はい、thanh hỏiは質問するような感じだと聞きましたが、合っていますか？',
     true, '[{"index":5,"color":"var(--secondary)"},{"index":6,"color":"var(--secondary)"}]', 2),

    ('f1000000-0000-0000-0203-000000000001', 'd0000000-0000-0000-0100-000000000002',
     'GIÁO VIÊN', '先生',
     'Gần đúng! Thanh hỏi bắt đầu thấp, xuống rồi lên nhẹ. Đọc theo tôi: bể, ngỏ, để, mỉa.',
     'ほぼ正解！thanh hỏiは低く始まり、下がってから少し上がります。読んで：bể, ngỏ, để, mỉa。',
     false, NULL, 3),

    ('f1000000-0000-0000-0204-000000000001', 'd0000000-0000-0000-0100-000000000002',
     'BẠN', 'あなた',
     'Bể, ngỏ, để, mỉa. Giọng xuống rồi lên nhẹ, em cảm nhận được rồi!',
     'ベー、ンゴォ、デー、ミア。下がってから少し上がる、感覚をつかめました！',
     true, '[{"index":0,"color":"var(--secondary)"},{"index":1,"color":"var(--secondary)"},{"index":2,"color":"var(--secondary)"},{"index":3,"color":"var(--secondary)"}]', 4),

    ('f1000000-0000-0000-0205-000000000001', 'd0000000-0000-0000-0100-000000000002',
     'GIÁO VIÊN', '先生',
     'Tuyệt! Bây giờ thanh ngã — giọng bắt đầu cao rồi gãy giữa chừng. Nghe này: bẽ, ngõ, dễ, mãi.',
     '素晴らしい！次はthanh ngã — 高く始まり途中で切れます。聞いて：bẽ, ngõ, dễ, mãi。',
     false, NULL, 5),

    ('f1000000-0000-0000-0206-000000000001', 'd0000000-0000-0000-0100-000000000002',
     'BẠN', 'あなた',
     'Bẽ, ngõ, dễ, mãi. Cái chỗ gãy ở giữa khó quá! Em cần luyện thêm.',
     'ベー、ンゴー、ゼー、マーイ。途中の切れ目が難しい！もっと練習が必要です。',
     true, '[{"index":0,"color":"var(--error)"},{"index":1,"color":"var(--error)"},{"index":2,"color":"var(--error)"},{"index":3,"color":"var(--error)"}]', 6),

    ('f1000000-0000-0000-0207-000000000001', 'd0000000-0000-0000-0100-000000000002',
     'GIÁO VIÊN', '先生',
     'Không sao! So sánh nhé: "ngỏ" là ngỏ lời, "ngõ" là con ngõ nhỏ. Nghe kỹ sự khác biệt nhé.',
     '大丈夫！比べて：「ngỏ」は告白する、「ngõ」は路地。違いをよく聞いてね。',
     false, NULL, 7),

    ('f1000000-0000-0000-0208-000000000001', 'd0000000-0000-0000-0100-000000000002',
     'BẠN', 'あなた',
     'Ngỏ lời, con ngõ nhỏ. Thanh hỏi nhẹ nhàng, thanh ngã thì gãy mạnh. Em phân biệt được rồi ạ!',
     '告白する、路地。thanh hỏiは優しく、thanh ngãは強く切れる。区別できるようになりました！',
     true, '[{"index":0,"color":"var(--secondary)"},{"index":3,"color":"var(--error)"}]', 8),

    -- ── Chapter 1, Lesson 3: Thanh nặng & Thanh ngang ──
    ('f1000000-0000-0000-0301-000000000001', 'd0000000-0000-0000-0100-000000000003',
     'GIÁO VIÊN', '先生',
     'Hôm nay ta hoàn thiện hệ thống 6 thanh với hai thanh cuối cùng: thanh nặng và thanh ngang.',
     '今日は残り2つの声調で6声調の体系を完成させます：thanh nặng と thanh ngang。',
     false, NULL, 1),

    ('f1000000-0000-0000-0302-000000000001', 'd0000000-0000-0000-0100-000000000003',
     'BẠN', 'あなた',
     'Dạ, thanh ngang là thanh không dấu, đúng không ạ?',
     'はい、thanh ngangは声調記号なしのものですよね？',
     true, '[{"index":1,"color":"var(--primary)"},{"index":2,"color":"var(--primary)"}]', 2),

    ('f1000000-0000-0000-0303-000000000001', 'd0000000-0000-0000-0100-000000000003',
     'GIÁO VIÊN', '先生',
     'Đúng rồi! Thanh ngang giọng bằng phẳng, không lên không xuống. Đọc: ma, ba, ca, la.',
     'その通り！thanh ngangは平坦で、上がりも下がりもしません。読んで：ma, ba, ca, la。',
     false, NULL, 3),

    ('f1000000-0000-0000-0304-000000000001', 'd0000000-0000-0000-0100-000000000003',
     'BẠN', 'あなた',
     'Ma, ba, ca, la. Giữ giọng bằng phẳng thôi, không khó lắm!',
     'マ、バ、カ、ラ。平坦に保つだけで、そんなに難しくないです！',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":2,"color":"var(--primary)"},{"index":3,"color":"var(--primary)"}]', 4),

    ('f1000000-0000-0000-0305-000000000001', 'd0000000-0000-0000-0100-000000000003',
     'GIÁO VIÊN', '先生',
     'Giờ đến thanh nặng — giọng rơi nhanh xuống thấp và tắt đột ngột. Nghe này: mạ, bạ, cạ, lạ.',
     '次はthanh nặng — 声が急激に低く落ちて止まります。聞いて：mạ, bạ, cạ, lạ。',
     false, NULL, 5),

    ('f1000000-0000-0000-0306-000000000001', 'd0000000-0000-0000-0100-000000000003',
     'BẠN', 'あなた',
     'Mạ, bạ, cạ, lạ. Cảm giác giọng rơi xuống rồi dừng lại đột ngột!',
     'マッ、バッ、カッ、ラッ。声が落ちて急に止まる感じですね！',
     true, '[{"index":0,"color":"var(--error)"},{"index":1,"color":"var(--error)"},{"index":2,"color":"var(--error)"},{"index":3,"color":"var(--error)"}]', 6),

    ('f1000000-0000-0000-0307-000000000001', 'd0000000-0000-0000-0100-000000000003',
     'GIÁO VIÊN', '先生',
     'Tuyệt vời! Bây giờ tổng kết cả 6 thanh bằng từ "ma" nhé: ma, má, mà, mả, mã, mạ.',
     '素晴らしい！では「ma」で6つの声調を総復習：ma, má, mà, mả, mã, mạ。',
     false, NULL, 7),

    ('f1000000-0000-0000-0308-000000000001', 'd0000000-0000-0000-0100-000000000003',
     'BẠN', 'あなた',
     'Ma, má, mà, mả, mã, mạ. Sáu thanh hoàn chỉnh! Em tự tin hơn rồi ạ!',
     'マ、マー、マー、マー、マー、マッ。6声調完成！自信がつきました！',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":2,"color":"var(--secondary)"},{"index":3,"color":"var(--secondary)"},{"index":4,"color":"var(--error)"},{"index":5,"color":"var(--error)"}]', 8),

    -- ══════════════════════════════════════════════════════════════════════
    -- CHAPTER 2: GIAO TIẾP TẠI QUÁN ĂN
    -- ══════════════════════════════════════════════════════════════════════

    -- ── Chapter 2, Lesson 1: Gọi món tại quán Bún Chả ──
    ('f1000000-0000-0000-0101-000000000002', 'd0000000-0000-0000-0200-000000000001',
     'BÁN HÀNG', '店員',
     'Em ơi, em vào đây ngồi đi! Quán mình có bún chả và bún nem. Em dùng gì?',
     'いらっしゃい、こちらに座って！うちはブンチャーとブンネムがありますよ。何にする？',
     false, NULL, 1),

    ('f1000000-0000-0000-0102-000000000002', 'd0000000-0000-0000-0200-000000000001',
     'BẠN', 'あなた',
     'Dạ, cho em một suất bún chả ạ. Bún chả Hà Nội ngon lắm phải không chị?',
     'ブンチャーを一つください。ハノイのブンチャーはとても美味しいんですよね？',
     true, '[{"index":4,"color":"var(--secondary)"},{"index":6,"color":"var(--secondary)"}]', 2),

    ('f1000000-0000-0000-0103-000000000002', 'd0000000-0000-0000-0200-000000000001',
     'BÁN HÀNG', '店員',
     'Ngon nhất Hà Nội luôn em! Em có ăn cay không? Chị cho thêm ớt nhé?',
     'ハノイで一番美味しいよ！辛いの食べられる？唐辛子入れる？',
     false, NULL, 3),

    ('f1000000-0000-0000-0104-000000000002', 'd0000000-0000-0000-0200-000000000001',
     'BẠN', 'あなた',
     'Dạ, em không ăn cay. Cho em ít gia vị thôi ạ.',
     'いえ、辛いのは苦手です。調味料は少なめでお願いします。',
     true, '[{"index":3,"color":"var(--error)"},{"index":4,"color":"var(--error)"},{"index":5,"color":"var(--error)"}]', 4),

    ('f1000000-0000-0000-0105-000000000002', 'd0000000-0000-0000-0200-000000000001',
     'BÁN HÀNG', '店員',
     'Được rồi! Nước chấm để riêng hay chị chan luôn vào bát bún?',
     'わかった！つけダレは別にする？それとも麺にかけちゃう？',
     false, NULL, 5),

    ('f1000000-0000-0000-0106-000000000002', 'd0000000-0000-0000-0200-000000000001',
     'BẠN', 'あなた',
     'Dạ, để riêng cho em ạ. Em muốn tự chấm.',
     'はい、別にしてください。自分でつけたいです。',
     true, '[{"index":2,"color":"var(--primary)"},{"index":3,"color":"var(--primary)"}]', 6),

    ('f1000000-0000-0000-0107-000000000002', 'd0000000-0000-0000-0200-000000000001',
     'BÁN HÀNG', '店員',
     'Nào, bún chả đây em! Rau sống và giá đỗ ở rổ kia nhé, em lấy thoải mái.',
     'はい、ブンチャーどうぞ！生野菜ともやしはあのザルにあるよ、好きなだけ取ってね。',
     false, NULL, 7),

    ('f1000000-0000-0000-0108-000000000002', 'd0000000-0000-0000-0200-000000000001',
     'BẠN', 'あなた',
     'Cảm ơn chị! Trông ngon quá! Em lấy thêm rau mùi và giá đỗ nhé.',
     'ありがとうございます！とても美味しそう！パクチーともやしも取りますね。',
     true, '[{"index":7,"color":"var(--secondary)"},{"index":8,"color":"var(--secondary)"},{"index":10,"color":"var(--secondary)"},{"index":11,"color":"var(--secondary)"}]', 8),

    -- ── Chapter 2, Lesson 2: Yêu cầu thanh toán ──
    ('f1000000-0000-0000-0201-000000000002', 'd0000000-0000-0000-0200-000000000002',
     'BẠN', 'あなた',
     'Chị ơi, tính tiền cho em ạ!',
     'すみません、お会計お願いします！',
     true, '[{"index":2,"color":"var(--secondary)"},{"index":3,"color":"var(--secondary)"}]', 1),

    ('f1000000-0000-0000-0202-000000000002', 'd0000000-0000-0000-0200-000000000002',
     'BÁN HÀNG', '店員',
     'Của em hết bảy mươi nghìn nhé. Em trả tiền mặt hay chuyển khoản?',
     '全部で7万ドンですよ。現金にする？それとも振込？',
     false, NULL, 2),

    ('f1000000-0000-0000-0203-000000000002', 'd0000000-0000-0000-0200-000000000002',
     'BẠN', 'あなた',
     'Dạ, quán có nhận MoMo không ạ?',
     'すみません、MoMoは使えますか？',
     true, '[{"index":4,"color":"var(--primary)"}]', 3),

    ('f1000000-0000-0000-0204-000000000002', 'd0000000-0000-0000-0200-000000000002',
     'BÁN HÀNG', '店員',
     'Có em! Chị quét mã cho em nhé. Hoặc em trả tiền mặt cũng được.',
     'もちろん！QRコードをスキャンするね。現金でもいいよ。',
     false, NULL, 4),

    ('f1000000-0000-0000-0205-000000000002', 'd0000000-0000-0000-0200-000000000002',
     'BẠN', 'あなた',
     'Dạ, em trả bằng tiền mặt ạ. Đây, em đưa một trăm nghìn.',
     'はい、現金で払います。こちら、10万ドンです。',
     true, '[{"index":3,"color":"var(--primary)"},{"index":4,"color":"var(--primary)"},{"index":5,"color":"var(--primary)"}]', 5),

    ('f1000000-0000-0000-0206-000000000002', 'd0000000-0000-0000-0200-000000000002',
     'BÁN HÀNG', '店員',
     'Chị trả lại em ba mươi nghìn nhé. Đếm lại đi em.',
     '3万ドンのお釣りね。数えてみて。',
     false, NULL, 6),

    ('f1000000-0000-0000-0207-000000000002', 'd0000000-0000-0000-0200-000000000002',
     'BẠN', 'あなた',
     'Rồi ạ, đủ rồi. Cảm ơn chị nhiều!',
     'はい、合っています。ありがとうございました！',
     true, NULL, 7),

    ('f1000000-0000-0000-0208-000000000002', 'd0000000-0000-0000-0200-000000000002',
     'BÁN HÀNG', '店員',
     'Không có gì! Lần sau ghé quán chị ăn tiếp nhé em!',
     'どういたしまして！また来てね！',
     false, NULL, 8),

    -- ── Chapter 2, Lesson 3: Khen ngon & Hỏi thêm ──
    ('f1000000-0000-0000-0301-000000000002', 'd0000000-0000-0000-0200-000000000003',
     'BÁN HÀNG', '店員',
     'Em ăn có vừa miệng không? Nước chấm có vừa không?',
     '味はちょうどいい？つけダレの味はどう？',
     false, NULL, 1),

    ('f1000000-0000-0000-0302-000000000002', 'd0000000-0000-0000-0200-000000000003',
     'BẠN', 'あなた',
     'Ngon lắm chị ơi! Bún chả ở đây ngon nhất mà em từng ăn!',
     'すごく美味しいです！今まで食べた中で一番美味しいブンチャーです！',
     true, '[{"index":0,"color":"var(--secondary)"},{"index":1,"color":"var(--secondary)"}]', 2),

    ('f1000000-0000-0000-0303-000000000002', 'd0000000-0000-0000-0200-000000000003',
     'BÁN HÀNG', '店員',
     'Em dễ thương quá! Em có muốn gọi thêm gì không? Nem rán nhà chị cũng ngon lắm đấy!',
     'かわいいね！他に何か頼む？うちの揚げ春巻きもすごく美味しいよ！',
     false, NULL, 3),

    ('f1000000-0000-0000-0304-000000000002', 'd0000000-0000-0000-0200-000000000003',
     'BẠN', 'あなた',
     'Dạ, cho em thêm một đĩa nem rán và một bát nước chấm nữa ạ.',
     'じゃあ、揚げ春巻き一皿と、つけダレをもう一杯お願いします。',
     true, '[{"index":6,"color":"var(--primary)"},{"index":7,"color":"var(--primary)"},{"index":10,"color":"var(--primary)"},{"index":11,"color":"var(--primary)"}]', 4),

    ('f1000000-0000-0000-0305-000000000002', 'd0000000-0000-0000-0200-000000000003',
     'BÁN HÀNG', '店員',
     'Được ngay! À, em thử thêm rau mùi vào nước chấm đi, dân Hà Nội ăn thế mới đúng điệu!',
     'すぐ持ってくる！あ、つけダレにパクチーを入れてみて。ハノイっ子はそうやって食べるんだよ！',
     false, NULL, 5),

    ('f1000000-0000-0000-0306-000000000002', 'd0000000-0000-0000-0200-000000000003',
     'BẠN', 'あなた',
     'Ồ hay quá! Em sẽ thử. Rau mùi thơm quá chị ạ!',
     'おお、いいですね！試してみます。パクチーすごくいい香り！',
     true, '[{"index":5,"color":"var(--secondary)"},{"index":6,"color":"var(--secondary)"}]', 6),

    ('f1000000-0000-0000-0307-000000000002', 'd0000000-0000-0000-0200-000000000003',
     'BÁN HÀNG', '店員',
     'Đúng rồi, ăn bún chả Hà Nội mà thiếu rau mùi thì mất hết mùi vị!',
     'そうそう、ハノイのブンチャーはパクチーがないと台無しだよ！',
     false, NULL, 7),

    ('f1000000-0000-0000-0308-000000000002', 'd0000000-0000-0000-0200-000000000003',
     'BẠN', 'あなた',
     'Em sẽ nhớ! Lần sau em lại ghé quán chị. Cảm ơn chị nhiều ạ!',
     '覚えました！次もまたお店に来ますね。ありがとうございました！',
     true, NULL, 8),

    -- ══════════════════════════════════════════════════════════════════════
    -- CHAPTER 3: CHÀO HỎI & XƯNG HÔ
    -- ══════════════════════════════════════════════════════════════════════

    -- ── Chapter 3, Lesson 1: Xin chào — Cách chào theo tuổi ──
    ('f1000000-0000-0000-0101-000000000003', 'd0000000-0000-0000-0300-000000000001',
     'GIÁO VIÊN', '先生',
     'Người Việt chào theo tuổi, không nói "xin chào" suốt đâu. Gặp người lớn tuổi thì nói thế nào?',
     'ベトナム人は年齢に応じて挨拶を変えます。「xin chào」だけでは不十分。年上の人にはどう言う？',
     false, NULL, 1),

    ('f1000000-0000-0000-0102-000000000003', 'd0000000-0000-0000-0300-000000000001',
     'BẠN', 'あなた',
     'Dạ, em chào bác ạ! Đúng không ạ?',
     'おじさん/おばさん、こんにちは！合っていますか？',
     true, '[{"index":2,"color":"var(--primary)"},{"index":3,"color":"var(--secondary)"}]', 2),

    ('f1000000-0000-0000-0103-000000000003', 'd0000000-0000-0000-0300-000000000001',
     'GIÁO VIÊN', '先生',
     'Rất đúng! Còn gặp bạn bè cùng tuổi thì sao? Đơn giản hơn nhiều.',
     'とても正解！同い年の友達に会ったら？もっとシンプルだよ。',
     false, NULL, 3),

    ('f1000000-0000-0000-0104-000000000003', 'd0000000-0000-0000-0300-000000000001',
     'BẠN', 'あなた',
     'Chào bạn! Hoặc nói "Ê, khỏe không?" đúng không ạ?',
     'チャオバン！または「エー、元気？」ですよね？',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"}]', 4),

    ('f1000000-0000-0000-0105-000000000003', 'd0000000-0000-0000-0300-000000000001',
     'GIÁO VIÊN', '先生',
     'Chuẩn luôn! Bây giờ thử chào người lớn tuổi hơn mình một chút — gọi là "anh" hoặc "chị".',
     'その通り！次は少しだけ年上の人に挨拶してみよう。「anh」か「chị」を使うよ。',
     false, NULL, 5),

    ('f1000000-0000-0000-0106-000000000003', 'd0000000-0000-0000-0300-000000000001',
     'BẠN', 'あなた',
     'Em chào anh ạ! Em chào chị ạ!',
     'アイン（お兄さん）、こんにちは！チ（お姉さん）、こんにちは！',
     true, '[{"index":2,"color":"var(--secondary)"},{"index":5,"color":"var(--secondary)"}]', 6),

    ('f1000000-0000-0000-0107-000000000003', 'd0000000-0000-0000-0300-000000000001',
     'GIÁO VIÊN', '先生',
     'Giỏi lắm! Nhớ nhé: "ạ" ở cuối câu thể hiện sự lễ phép. Người Hà Nội rất coi trọng điều này.',
     'とても上手！覚えて：文末の「ạ」は丁寧さを表すよ。ハノイの人はこれをとても大切にしている。',
     false, NULL, 7),

    ('f1000000-0000-0000-0108-000000000003', 'd0000000-0000-0000-0300-000000000001',
     'BẠN', 'あなた',
     'Vâng, em hiểu rồi ạ! Chào theo tuổi và thêm "ạ" để tỏ ra lễ phép.',
     'はい、わかりました！年齢に応じて挨拶して、「ạ」を付けて丁寧にする。',
     true, '[{"index":8,"color":"var(--primary)"}]', 8),

    -- ── Chapter 3, Lesson 2: Xưng hô: Anh, Chị, Em, Tôi ──
    ('f1000000-0000-0000-0201-000000000003', 'd0000000-0000-0000-0300-000000000002',
     'GIÁO VIÊN', '先生',
     'Tiếng Việt có rất nhiều đại từ xưng hô. Hôm nay ta học bốn từ cơ bản: anh, chị, em, tôi.',
     'ベトナム語には多くの人称代名詞があります。今日は4つの基本を学びます：anh, chị, em, tôi。',
     false, NULL, 1),

    ('f1000000-0000-0000-0202-000000000003', 'd0000000-0000-0000-0300-000000000002',
     'BẠN', 'あなた',
     'Dạ, "anh" nghĩa là gì ạ? Có phải là "anh trai" không?',
     'はい、「anh」はどういう意味ですか？「お兄さん」のことですか？',
     true, '[{"index":1,"color":"var(--secondary)"}]', 2),

    ('f1000000-0000-0000-0203-000000000003', 'd0000000-0000-0000-0300-000000000002',
     'GIÁO VIÊN', '先生',
     'Đúng, nhưng không chỉ vậy. "Anh" dùng để gọi nam giới lớn tuổi hơn mình. Còn "chị" là nữ lớn tuổi hơn.',
     'そうですが、それだけではありません。「anh」は年上の男性に、「chị」は年上の女性に使います。',
     false, NULL, 3),

    ('f1000000-0000-0000-0204-000000000003', 'd0000000-0000-0000-0300-000000000002',
     'BẠN', 'あなた',
     'Vậy khi nào dùng "em" ạ? Em là người trẻ hơn phải không?',
     'では「em」はいつ使いますか？年下の人ですよね？',
     true, '[{"index":4,"color":"var(--secondary)"}]', 4),

    ('f1000000-0000-0000-0205-000000000003', 'd0000000-0000-0000-0300-000000000002',
     'GIÁO VIÊN', '先生',
     'Chính xác! "Em" vừa là tự xưng khi nói với người lớn hơn, vừa để gọi người trẻ hơn mình.',
     '正解！「em」は年上と話す時の一人称にも、年下の人を呼ぶ時の二人称にもなります。',
     false, NULL, 5),

    ('f1000000-0000-0000-0206-000000000003', 'd0000000-0000-0000-0300-000000000002',
     'BẠN', 'あなた',
     'Chị ơi, chị có khỏe không ạ? Em nói thế đúng chưa?',
     'お姉さん、お元気ですか？こう言えば合っていますか？',
     true, '[{"index":0,"color":"var(--secondary)"},{"index":2,"color":"var(--secondary)"}]', 6),

    ('f1000000-0000-0000-0207-000000000003', 'd0000000-0000-0000-0300-000000000002',
     'GIÁO VIÊN', '先生',
     'Chuẩn không cần chỉnh! Còn "tôi" thì dùng khi nào? Khi nói lịch sự, trang trọng, hoặc với người lạ.',
     '完璧！「tôi」はいつ使う？丁寧で改まった場面、または知らない人と話す時です。',
     false, NULL, 7),

    ('f1000000-0000-0000-0208-000000000003', 'd0000000-0000-0000-0300-000000000002',
     'BẠN', 'あなた',
     'Em hiểu rồi ạ! Anh, chị cho người lớn hơn. Em cho người nhỏ hơn hoặc tự xưng. Tôi thì trang trọng.',
     'わかりました！年上にはanh/chị、年下にはemまたは自分を指す。tôiは改まった場面で使う。',
     true, '[{"index":3,"color":"var(--secondary)"},{"index":4,"color":"var(--secondary)"},{"index":8,"color":"var(--secondary)"},{"index":15,"color":"var(--primary)"}]', 8),

    -- ── Chapter 3, Lesson 3: Giới thiệu bản thân ──
    ('f1000000-0000-0000-0301-000000000003', 'd0000000-0000-0000-0300-000000000003',
     'GIÁO VIÊN', '先生',
     'Hãy tập giới thiệu bản thân nhé. Nói tên, quốc tịch và nghề nghiệp của em.',
     '自己紹介の練習をしましょう。名前、国籍、職業を言ってみて。',
     false, NULL, 1),

    ('f1000000-0000-0000-0302-000000000003', 'd0000000-0000-0000-0300-000000000003',
     'BẠN', 'あなた',
     'Xin chào, tôi tên là Yuki. Tôi là người Nhật Bản.',
     'こんにちは、私はユキです。日本人です。',
     true, '[{"index":3,"color":"var(--primary)"},{"index":4,"color":"var(--primary)"},{"index":5,"color":"var(--primary)"},{"index":9,"color":"var(--secondary)"},{"index":10,"color":"var(--secondary)"}]', 2),

    ('f1000000-0000-0000-0303-000000000003', 'd0000000-0000-0000-0300-000000000003',
     'NGƯỜI VIỆT', 'ベトナム人',
     'Ồ, chào bạn Yuki! Bạn làm nghề gì ở Hà Nội?',
     'おお、ユキさん、こんにちは！ハノイでは何のお仕事を？',
     false, NULL, 3),

    ('f1000000-0000-0000-0304-000000000003', 'd0000000-0000-0000-0300-000000000003',
     'BẠN', 'あなた',
     'Tôi là kỹ sư phần mềm. Tôi làm việc ở công ty Nhật tại Hà Nội.',
     '私はソフトウェアエンジニアです。ハノイの日系企業で働いています。',
     true, '[{"index":2,"color":"var(--secondary)"},{"index":3,"color":"var(--secondary)"},{"index":4,"color":"var(--secondary)"}]', 4),

    ('f1000000-0000-0000-0305-000000000003', 'd0000000-0000-0000-0300-000000000003',
     'NGƯỜI VIỆT', 'ベトナム人',
     'Hay quá! Bạn sống ở Hà Nội được bao lâu rồi?',
     'すごい！ハノイにはどのくらい住んでいますか？',
     false, NULL, 5),

    ('f1000000-0000-0000-0306-000000000003', 'd0000000-0000-0000-0300-000000000003',
     'BẠN', 'あなた',
     'Tôi sống ở Hà Nội được sáu tháng rồi. Tôi rất thích Hà Nội!',
     'ハノイに住んで6ヶ月になります。ハノイがとても好きです！',
     true, '[{"index":5,"color":"var(--primary)"},{"index":6,"color":"var(--primary)"}]', 6),

    ('f1000000-0000-0000-0307-000000000003', 'd0000000-0000-0000-0300-000000000003',
     'NGƯỜI VIỆT', 'ベトナム人',
     'Rất vui được gặp bạn, Yuki! Bạn nói tiếng Việt giỏi lắm!',
     'ユキさん、会えてうれしいです！ベトナム語がとても上手ですね！',
     false, NULL, 7),

    ('f1000000-0000-0000-0308-000000000003', 'd0000000-0000-0000-0300-000000000003',
     'BẠN', 'あなた',
     'Cảm ơn bạn! Tôi vẫn đang học. Rất vui được gặp bạn!',
     'ありがとうございます！まだ勉強中です。お会いできて嬉しいです！',
     true, '[{"index":5,"color":"var(--primary)"},{"index":6,"color":"var(--primary)"}]', 8)

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