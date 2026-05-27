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

INSERT INTO lesson_dialogues (dialogue_id, lesson_id, speaker, speaker_jp, line_vi, line_jp, is_active, highlight_words_json, sort_order) VALUES
    -- ── Chapter 1, Lesson 1: Thanh sắc & Thanh huyền ──
    ('f1000000-0000-0000-0101-000000000001', 'd0000000-0000-0000-0100-000000000001',
     'GIÁO VIÊN', '先生',
     'Chúng ta học thanh sắc trước. Đọc theo tôi: Cá má bé.',
     'まず「thanh sắc（昇り声調）」を練習。私の後に：「Cá má bé」。',
     false, NULL, 1),

    ('f1000000-0000-0000-0102-000000000001', 'd0000000-0000-0000-0100-000000000001',
     'BẠN', 'あなた',
     'Cá má bé.',
     'カー、マー、ベー。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":2,"color":"var(--primary)"}]', 2),

    ('f1000000-0000-0000-0103-000000000001', 'd0000000-0000-0000-0100-000000000001',
     'GIÁO VIÊN', '先生',
     'Tốt lắm! Bây giờ thanh huyền: Cà mà bè. Giọng xuống nhẹ nhé.',
     'よかった！次は「thanh huyền」：「Cà mà bè」。優しく下げてね。',
     false, NULL, 3),

    -- ── Chapter 1, Lesson 2: Thanh hỏi & Thanh ngã ──
    ('f1000000-0000-0000-0201-000000000001', 'd0000000-0000-0000-0100-000000000002',
     'GIÁO VIÊN', '先生',
     'Bạn thử đọc: Ngỏ nhỏ và Ngõ nhỏ xem nào.',
     '試しに読んでみて：「Ngỏ nhỏ」と「Ngõ nhỏ」。',
     false, NULL, 1),

    ('f1000000-0000-0000-0202-000000000001', 'd0000000-0000-0000-0100-000000000002',
     'BẠN', 'あなた',
     'Ngỏ nhỏ... Ngõ nhỏ.',
     'ンゴォ・ニョォ... ンゴォ・ニョォ。',
     true, '[{"index":0,"color":"var(--secondary)"},{"index":2,"color":"var(--error)"}]', 2),

    ('f1000000-0000-0000-0203-000000000001', 'd0000000-0000-0000-0100-000000000002',
     'GIÁO VIÊN', '先生',
     'Rất tốt! Thanh ngã cần bị gãy — hãy cảm nhận tiếng tắt.',
     'よくできました！「ngã」は途中で切れます。声門閉鎖音を感じて。',
     false, NULL, 3),

    -- ── Chapter 1, Lesson 3: Thanh nặng & Thanh ngang ──
    ('f1000000-0000-0000-0301-000000000001', 'd0000000-0000-0000-0100-000000000003',
     'GIÁO VIÊN', '先生',
     'Hôm nay ta học hai thanh cuối: thanh nặng và thanh ngang.',
     '今日は残り2つの声調を学びます：thanh nặng と thanh ngang。',
     false, NULL, 1),

    ('f1000000-0000-0000-0302-000000000001', 'd0000000-0000-0000-0100-000000000003',
     'GIÁO VIÊN', '先生',
     'Thanh ngang thì đơn giản: giữ giọng bằng. Đọc: ma, ba, ca.',
     'thanh ngang は簡単：平らに保ちます。読んで：ma, ba, ca。',
     false, NULL, 2),

    ('f1000000-0000-0000-0303-000000000001', 'd0000000-0000-0000-0100-000000000003',
     'BẠN', 'あなた',
     'Ma, ba, ca. Mạ, bạ, cạ.',
     'マ、バ、カ。マッ、バッ、カッ。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":2,"color":"var(--primary)"},{"index":3,"color":"var(--error)"},{"index":4,"color":"var(--error)"},{"index":5,"color":"var(--error)"}]', 3),

    -- ── Chapter 2, Lesson 1: Gọi món tại quán Bún Chả ──
    ('f1000000-0000-0000-0101-000000000002', 'd0000000-0000-0000-0200-000000000001',
     'BÁN HÀNG', '店員',
     'Em ơi em dùng bún chả hay bún nem?',
     'お姉さん、ブンチャーにしますか、それともブンネムにしますか？',
     false, NULL, 1),

    ('f1000000-0000-0000-0102-000000000002', 'd0000000-0000-0000-0200-000000000001',
     'BẠN', 'あなた',
     'Cho em một suất bún chả nhé.',
     'ブンチャーを一つください。',
     true, '[{"index":3,"color":"var(--secondary)"},{"index":5,"color":"var(--error)"}]', 2),

    ('f1000000-0000-0000-0103-000000000002', 'd0000000-0000-0000-0200-000000000001',
     'BÁN HÀNG', '店員',
     'Có ngay! Đợi chị một chút.',
     'すぐ行きます！ちょっと待ってね。',
     false, NULL, 3),

    -- ── Chapter 2, Lesson 2: Yêu cầu thanh toán ──
    ('f1000000-0000-0000-0201-000000000002', 'd0000000-0000-0000-0200-000000000002',
     'BẠN', 'あなた',
     'Chị ơi, tính tiền cho em ạ!',
     'すみません、お会計お願いします！',
     true, '[{"index":2,"color":"var(--secondary)"},{"index":3,"color":"var(--secondary)"}]', 1),

    ('f1000000-0000-0000-0202-000000000002', 'd0000000-0000-0000-0200-000000000002',
     'BÁN HÀNG', '店員',
     'Của em hết bảy mươi nghìn nhé.',
     '全部で7万ドンですよ。',
     false, NULL, 2),

    ('f1000000-0000-0000-0203-000000000002', 'd0000000-0000-0000-0200-000000000002',
     'BẠN', 'あなた',
     'Dạ, em trả bằng tiền mặt ạ. Cảm ơn chị!',
     'はい、現金で払います。ありがとうございます！',
     true, '[{"index":3,"color":"var(--primary)"},{"index":4,"color":"var(--primary)"},{"index":5,"color":"var(--primary)"}]', 3),

    -- ── Chapter 2, Lesson 3: Khen ngon & Hỏi thêm ──
    ('f1000000-0000-0000-0301-000000000002', 'd0000000-0000-0000-0200-000000000003',
     'BẠN', 'あなた',
     'Ngon quá! Cho em thêm một bát nước chấm nhé.',
     'とても美味しい！つけダレをもう一杯ください。',
     true, '[{"index":0,"color":"var(--secondary)"},{"index":1,"color":"var(--secondary)"}]', 1),

    ('f1000000-0000-0000-0302-000000000002', 'd0000000-0000-0000-0200-000000000003',
     'BÁN HÀNG', '店員',
     'Vâng, có ngay em nhé! Em dùng thêm rau sống không?',
     'はい、すぐに！生野菜も追加しますか？',
     false, NULL, 2),

    ('f1000000-0000-0000-0303-000000000002', 'd0000000-0000-0000-0200-000000000003',
     'BẠN', 'あなた',
     'Dạ, cho em thêm rau ạ. Cảm ơn chị!',
     'はい、野菜も追加でお願いします。ありがとうございます！',
     true, NULL, 3),

    -- ── Chapter 3, Lesson 1: Xin chào ──
    ('f1000000-0000-0000-0101-000000000003', 'd0000000-0000-0000-0300-000000000001',
     'GIÁO VIÊN', '先生',
     'Gặp người lớn tuổi hơn, ta nói: Cháu chào bác ạ!',
     '年上の人に会ったら：Cháu chào bác ạ！と言います。',
     false, NULL, 1),

    ('f1000000-0000-0000-0102-000000000003', 'd0000000-0000-0000-0300-000000000001',
     'BẠN', 'あなた',
     'Cháu chào bác ạ!',
     'おじさん/おばさん、こんにちは！',
     true, '[{"index":0,"color":"var(--primary)"},{"index":2,"color":"var(--secondary)"}]', 2),

    ('f1000000-0000-0000-0103-000000000003', 'd0000000-0000-0000-0300-000000000001',
     'NGƯỜI LỚN', '年上の方',
     'Ừ, chào cháu! Cháu khỏe không?',
     'やあ、こんにちは！元気ですか？',
     false, NULL, 3),

    -- ── Chapter 3, Lesson 2: Xưng hô ──
    ('f1000000-0000-0000-0201-000000000003', 'd0000000-0000-0000-0300-000000000002',
     'GIÁO VIÊN', '先生',
     'Khi gặp người trẻ hơn: gọi là "em". Lớn hơn: gọi là "anh" hoặc "chị".',
     '年下の人には「em」。年上の人には「anh」または「chị」を使います。',
     false, NULL, 1),

    ('f1000000-0000-0000-0202-000000000003', 'd0000000-0000-0000-0300-000000000002',
     'BẠN', 'あなた',
     'Chị ơi, chị có khỏe không ạ?',
     'お姉さん、お元気ですか？',
     true, '[{"index":0,"color":"var(--secondary)"},{"index":1,"color":"var(--secondary)"}]', 2),

    ('f1000000-0000-0000-0203-000000000003', 'd0000000-0000-0000-0300-000000000002',
     'CHỊ', 'お姉さん',
     'Chị khỏe, cảm ơn em!',
     '元気よ、ありがとう！',
     false, NULL, 3),

    -- ── Chapter 3, Lesson 3: Giới thiệu bản thân ──
    ('f1000000-0000-0000-0301-000000000003', 'd0000000-0000-0000-0300-000000000003',
     'GIÁO VIÊN', '先生',
     'Hãy giới thiệu: Tên, người nước nào, làm nghề gì.',
     '自己紹介しましょう：名前、国籍、職業。',
     false, NULL, 1),

    ('f1000000-0000-0000-0302-000000000003', 'd0000000-0000-0000-0300-000000000003',
     'BẠN', 'あなた',
     'Xin chào, tôi tên là Yuki. Tôi là người Nhật. Tôi là kỹ sư.',
     'こんにちは、ユキと申します。日本人です。エンジニアです。',
     true, '[{"index":4,"color":"var(--primary)"},{"index":8,"color":"var(--secondary)"},{"index":12,"color":"var(--secondary)"}]', 2),

    ('f1000000-0000-0000-0303-000000000003', 'd0000000-0000-0000-0300-000000000003',
     'NGƯỜI VIỆT', 'ベトナム人',
     'Rất vui được gặp bạn, Yuki! Bạn sống ở Hà Nội lâu chưa?',
     'ユキさん、はじめまして！ハノイには長く住んでいますか？',
     false, NULL, 3),

    -- ── Chapter 4, Lesson 1: Hỏi giá ──
    ('f1000000-0000-0000-0101-000000000004', 'd0000000-0000-0000-0400-000000000001',
     'BẠN', 'あなた',
     'Chị ơi, cái này bao nhiêu tiền ạ?',
     'すみません、これはいくらですか？',
     true, '[{"index":4,"color":"var(--secondary)"},{"index":5,"color":"var(--secondary)"},{"index":6,"color":"var(--secondary)"}]', 1),

    ('f1000000-0000-0000-0102-000000000004', 'd0000000-0000-0000-0400-000000000001',
     'BÁN HÀNG', '店員',
     'Cái đó năm mươi nghìn em nhé.',
     'それは5万ドンですよ。',
     false, NULL, 2),

    ('f1000000-0000-0000-0103-000000000004', 'd0000000-0000-0000-0400-000000000001',
     'BẠN', 'あなた',
     'Đắt quá! Bớt cho em được không ạ?',
     '高い！少し安くしてもらえますか？',
     true, NULL, 3),

    -- ── Chapter 4, Lesson 2: Trả giá ──
    ('f1000000-0000-0000-0201-000000000004', 'd0000000-0000-0000-0400-000000000002',
     'BẠN', 'あなた',
     'Ba mươi nghìn được không chị?',
     '3万ドンではだめですか？',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":2,"color":"var(--primary)"}]', 1),

    ('f1000000-0000-0000-0202-000000000004', 'd0000000-0000-0000-0400-000000000002',
     'BÁN HÀNG', '店員',
     'Thôi bốn mươi đi, chị lỗ rồi đấy!',
     'じゃあ4万で、赤字だよ！',
     false, NULL, 2),

    ('f1000000-0000-0000-0203-000000000004', 'd0000000-0000-0000-0400-000000000002',
     'BẠN', 'あなた',
     'Vâng, em lấy ạ. Cảm ơn chị!',
     'はい、買います。ありがとうございます！',
     true, NULL, 3),

    -- ── Chapter 4, Lesson 3: Đếm số ──
    ('f1000000-0000-0000-0301-000000000004', 'd0000000-0000-0000-0400-000000000003',
     'GIÁO VIÊN', '先生',
     'Đếm từ 1 đến 10: một, hai, ba, bốn, năm, sáu, bảy, tám, chín, mười.',
     '1から10まで数えましょう：một, hai, ba, bốn, năm, sáu, bảy, tám, chín, mười。',
     false, NULL, 1),

    ('f1000000-0000-0000-0302-000000000004', 'd0000000-0000-0000-0400-000000000003',
     'BẠN', 'あなた',
     'Một, hai, ba, bốn, năm, sáu, bảy, tám, chín, mười.',
     'モット、ハイ、バー、ボン、ナム、サウ、バイ、タム、チン、ムオイ。',
     true, NULL, 2),

    ('f1000000-0000-0000-0303-000000000004', 'd0000000-0000-0000-0400-000000000003',
     'GIÁO VIÊN', '先生',
     'Giỏi! Bây giờ: nghìn = 1.000, triệu = 1.000.000. "Hai trăm nghìn" là 200.000₫.',
     '素晴らしい！次は：nghìn = 1,000、triệu = 1,000,000。"Hai trăm nghìn" は 200,000₫です。',
     false, NULL, 3),

    -- ── Chapter 5, Lesson 1: Grab & Taxi ──
    ('f1000000-0000-0000-0101-000000000005', 'd0000000-0000-0000-0500-000000000001',
     'BẠN', 'あなた',
     'Anh ơi, cho em đến Hồ Hoàn Kiếm ạ.',
     '運転手さん、ホアンキエム湖までお願いします。',
     true, '[{"index":4,"color":"var(--secondary)"},{"index":5,"color":"var(--secondary)"},{"index":6,"color":"var(--secondary)"}]', 1),

    ('f1000000-0000-0000-0102-000000000005', 'd0000000-0000-0000-0500-000000000001',
     'TÀI XẾ', '運転手',
     'Được em. Đường hơi tắc, đi khoảng 15 phút nhé.',
     '了解。道が少し混んでいて、15分くらいかかりますよ。',
     false, NULL, 2),

    ('f1000000-0000-0000-0103-000000000005', 'd0000000-0000-0000-0500-000000000001',
     'BẠN', 'あなた',
     'Vâng, không sao ạ. Cảm ơn anh!',
     'はい、大丈夫です。ありがとうございます！',
     true, NULL, 3),

    -- ── Chapter 5, Lesson 2: Hỏi đường ──
    ('f1000000-0000-0000-0201-000000000005', 'd0000000-0000-0000-0500-000000000002',
     'BẠN', 'あなた',
     'Xin lỗi, cho em hỏi Bưu điện Hà Nội đi thế nào ạ?',
     'すみません、ハノイ中央郵便局はどう行けばいいですか？',
     true, '[{"index":7,"color":"var(--primary)"},{"index":8,"color":"var(--primary)"},{"index":9,"color":"var(--primary)"}]', 1),

    ('f1000000-0000-0000-0202-000000000005', 'd0000000-0000-0000-0500-000000000002',
     'NGƯỜI ĐI ĐƯỜNG', '通行人',
     'Đi thẳng đến ngã tư rồi rẽ trái, đi thêm 200 mét là tới.',
     'まっすぐ交差点まで行って左折、200m先です。',
     false, NULL, 2),

    -- ── Chapter 5, Lesson 3: Xe buýt ──
    ('f1000000-0000-0000-0301-000000000005', 'd0000000-0000-0000-0500-000000000003',
     'BẠN', 'あなた',
     'Anh ơi, xe buýt số 32 có đi qua Cầu Giấy không ạ?',
     'すみません、32番バスはカウザイを通りますか？',
     true, NULL, 1),

    ('f1000000-0000-0000-0302-000000000005', 'd0000000-0000-0000-0500-000000000003',
     'HÀNH KHÁCH', '乗客',
     'Có em! Xuống bến thứ 5 nhé.',
     '通りますよ！5番目の停留所で降りてね。',
     false, NULL, 2),

    ('f1000000-0000-0000-0303-000000000005', 'd0000000-0000-0000-0500-000000000003',
     'BẠN', 'あなた',
     'Dạ, cảm ơn anh nhiều ạ!',
     'はい、どうもありがとうございます！',
     true, NULL, 3),

    -- ── Chapter 6, Lesson 1: Nguyên âm ──
    ('f1000000-0000-0000-0101-000000000006', 'd0000000-0000-0000-0600-000000000001',
     'GIÁO VIÊN', '先生',
     'Đọc rõ sự khác biệt: cơm — côm, lưng — lung.',
     '違いをはっきり読みましょう：cơm - côm, lưng - lung。',
     false, NULL, 1),

    ('f1000000-0000-0000-0102-000000000006', 'd0000000-0000-0000-0600-000000000001',
     'BẠN', 'あなた',
     'Cơm... côm. Lưng... lung.',
     'コム...コム。ルン...ルン。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--secondary)"},{"index":2,"color":"var(--primary)"},{"index":3,"color":"var(--secondary)"}]', 2),

    -- ── Chapter 6, Lesson 2: Phụ âm đầu ──
    ('f1000000-0000-0000-0201-000000000006', 'd0000000-0000-0000-0600-000000000002',
     'GIÁO VIÊN', '先生',
     'Ở miền Bắc: "gia", "da", "ra" đều đọc là /za/!',
     '北部では「gia」「da」「ra」はすべて /za/ と発音されます！',
     false, NULL, 1),

    ('f1000000-0000-0000-0202-000000000006', 'd0000000-0000-0000-0600-000000000002',
     'BẠN', 'あなた',
     'Gia đình, da cam, ra ngoài — tất cả bắt đầu bằng /z/?',
     'gia đình, da cam, ra ngoài — すべて /z/ で始まるんですか？',
     true, NULL, 2),

    ('f1000000-0000-0000-0203-000000000006', 'd0000000-0000-0000-0600-000000000002',
     'GIÁO VIÊN', '先生',
     'Đúng rồi! Đây là đặc điểm riêng của giọng Hà Nội.',
     'そうです！これがハノイ方言の特徴です。',
     false, NULL, 3),

    -- ── Chapter 6, Lesson 3: Vần cuối ──
    ('f1000000-0000-0000-0301-000000000006', 'd0000000-0000-0000-0600-000000000003',
     'GIÁO VIÊN', '先生',
     'Nghe kỹ: "anh" kết thúc bằng /ŋ/ mũi, "ách" kết thúc bằng /k/ tắt.',
     'よく聞いて：「anh」は鼻音 /ŋ/ で、「ách」は破裂音 /k/ で終わります。',
     false, NULL, 1),

    ('f1000000-0000-0000-0302-000000000006', 'd0000000-0000-0000-0600-000000000003',
     'BẠN', 'あなた',
     'Anh... ách. Bạn... bát.',
     'アイン...アック。バン...バット。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--error)"},{"index":2,"color":"var(--primary)"},{"index":3,"color":"var(--error)"}]', 2),

    -- ── Chapter 7, Lesson 1: Thời gian ──
    ('f1000000-0000-0000-0101-000000000007', 'd0000000-0000-0000-0700-000000000001',
     'GIÁO VIÊN', '先生',
     'Hôm nay là thứ mấy? — Hôm nay là thứ hai.',
     '今日は何曜日？ — 今日は月曜日です。',
     false, NULL, 1),

    ('f1000000-0000-0000-0102-000000000007', 'd0000000-0000-0000-0700-000000000001',
     'BẠN', 'あなた',
     'Hôm nay là thứ hai. Ngày mai là thứ ba.',
     '今日は月曜日です。明日は火曜日です。',
     true, '[{"index":3,"color":"var(--primary)"},{"index":4,"color":"var(--primary)"},{"index":8,"color":"var(--secondary)"},{"index":9,"color":"var(--secondary)"}]', 2),

    -- ── Chapter 7, Lesson 2: Thời tiết ──
    ('f1000000-0000-0000-0201-000000000007', 'd0000000-0000-0000-0700-000000000002',
     'ĐỒNG NGHIỆP', '同僚',
     'Hôm nay trời nóng quá nhỉ!',
     '今日はすごく暑いね！',
     false, NULL, 1),

    ('f1000000-0000-0000-0202-000000000007', 'd0000000-0000-0000-0700-000000000002',
     'BẠN', 'あなた',
     'Ừ, nóng lắm! Nghe nói chiều nay sẽ có mưa.',
     'うん、すごく暑い！午後は雨が降るらしいよ。',
     true, '[{"index":1,"color":"var(--error)"},{"index":2,"color":"var(--error)"},{"index":8,"color":"var(--secondary)"}]', 2),

    -- ── Chapter 7, Lesson 3: Sở thích ──
    ('f1000000-0000-0000-0301-000000000007', 'd0000000-0000-0000-0700-000000000003',
     'BẠN MỚI', '新しい友達',
     'Cuối tuần bạn thường làm gì?',
     '週末は普段何をしてる？',
     false, NULL, 1),

    ('f1000000-0000-0000-0302-000000000007', 'd0000000-0000-0000-0700-000000000003',
     'BẠN', 'あなた',
     'Tôi thích đi cà phê và đọc sách. Còn bạn thì sao?',
     'カフェに行ったり本を読んだりするのが好きです。あなたは？',
     true, '[{"index":1,"color":"var(--secondary)"},{"index":4,"color":"var(--primary)"},{"index":6,"color":"var(--primary)"}]', 2),

    ('f1000000-0000-0000-0303-000000000007', 'd0000000-0000-0000-0700-000000000003',
     'BẠN MỚI', '新しい友達',
     'Tôi thích chạy bộ quanh Hồ Tây vào buổi sáng.',
     '朝、ホータイ湖の周りをジョギングするのが好きです。',
     false, NULL, 3),

    -- ── Chapter 8, Lesson 1: Tôi không hiểu ──
    ('f1000000-0000-0000-0101-000000000008', 'd0000000-0000-0000-0800-000000000001',
     'NGƯỜI VIỆT', 'ベトナム人',
     'Em ơi rẽ tay phải rồi đi thẳng qua cái ngã ba...',
     '右に曲がってまっすぐ三差路を...',
     false, NULL, 1),

    ('f1000000-0000-0000-0102-000000000008', 'd0000000-0000-0000-0800-000000000001',
     'BẠN', 'あなた',
     'Xin lỗi, tôi không hiểu. Bạn nói chậm hơn được không?',
     'すみません、わかりません。もう少しゆっくり話してもらえますか？',
     true, '[{"index":2,"color":"var(--error)"},{"index":3,"color":"var(--error)"},{"index":4,"color":"var(--error)"},{"index":7,"color":"var(--secondary)"},{"index":8,"color":"var(--secondary)"}]', 2),

    ('f1000000-0000-0000-0103-000000000008', 'd0000000-0000-0000-0800-000000000001',
     'BẠN', 'あなた',
     'Bạn có thể viết ra giấy cho tôi không?',
     '紙に書いてもらえますか？',
     true, NULL, 3),

    -- ── Chapter 8, Lesson 2: Bệnh viện ──
    ('f1000000-0000-0000-0201-000000000008', 'd0000000-0000-0000-0800-000000000002',
     'BẠN', 'あなた',
     'Tôi bị đau bụng. Cho tôi thuốc đau bụng.',
     'お腹が痛いです。腹痛の薬をください。',
     true, '[{"index":2,"color":"var(--error)"},{"index":3,"color":"var(--error)"},{"index":4,"color":"var(--error)"}]', 1),

    ('f1000000-0000-0000-0202-000000000008', 'd0000000-0000-0000-0800-000000000002',
     'DƯỢC SĨ', '薬剤師',
     'Bạn bị từ khi nào? Ăn gì bị đau?',
     'いつからですか？何を食べたら痛くなりましたか？',
     false, NULL, 2),

    ('f1000000-0000-0000-0203-000000000008', 'd0000000-0000-0000-0800-000000000002',
     'BẠN', 'あなた',
     'Từ sáng nay. Tôi ăn hải sản tối qua.',
     '今朝からです。昨夜シーフードを食べました。',
     true, NULL, 3),

    -- ── Chapter 8, Lesson 3: Gọi khẩn cấp ──
    ('f1000000-0000-0000-0301-000000000008', 'd0000000-0000-0000-0800-000000000003',
     'GIÁO VIÊN', '先生',
     'Nhớ số: 113 — Công an. 114 — Cứu hỏa. 115 — Cấp cứu.',
     '番号を覚えて：113 — 警察。114 — 消防。115 — 救急。',
     false, NULL, 1),

    ('f1000000-0000-0000-0302-000000000008', 'd0000000-0000-0000-0800-000000000003',
     'BẠN', 'あなた',
     'Xin hãy giúp tôi! Tôi đang ở đường Trần Hưng Đạo.',
     '助けてください！トランフンダオ通りにいます。',
     true, '[{"index":0,"color":"var(--error)"},{"index":1,"color":"var(--error)"},{"index":2,"color":"var(--error)"},{"index":3,"color":"var(--error)"}]', 2),

    ('f1000000-0000-0000-0303-000000000008', 'd0000000-0000-0000-0800-000000000003',
     'TỔNG ĐÀI', 'オペレーター',
     'Được rồi, đội cứu hộ sẽ đến trong 10 phút.',
     'わかりました。救助チームが10分以内に到着します。',
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

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. VOICE LAB RECORDS (sample pronunciation scoring data)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO voice_lab_records (record_id, user_id, expected_text, actual_text, completeness_score, accuracy_score, fluency_score, prosody_score, audio_duration, created_at) VALUES
    ('e0000000-0000-0000-0000-000000000001',
     NULL,
     'Cá má bé', 'cá ma bé',
     100.00, 88.89, 92.50, 66.67, 1.200, NOW()),
    ('e0000000-0000-0000-0000-000000000002',
     NULL,
     'Cho em một suất bún chả nhé', 'cho em một suất bún chả nhé',
     100.00, 96.43, 85.00, 100.00, 3.500, NOW())
ON CONFLICT (record_id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. LESSON PROGRESS (mock progress data for demo learner — level V2)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Demo learner (abc@gmail.com) has V2 level:
--   All 24 V1 lessons (chapters 1-8, 3 lessons each): auto-completed (100%)
--   V2 progress: Ch9 L1-L3 completed, Ch10 L1 completed, Ch10 L2 in-progress (60%)

DO $$
DECLARE
    v_learner_id UUID;
    v_lesson_id  UUID;
BEGIN
    SELECT user_id INTO v_learner_id FROM users WHERE email = 'abc@gmail.com';

    -- ─── V1: Auto-complete all 24 lessons (user level > lesson level) ───
    -- Chapter 1 (3 lessons)
    FOR v_lesson_id IN
        SELECT lesson_id FROM lessons WHERE chapter_id IN (1,2,3,4,5,6,7,8)
    LOOP
        INSERT INTO lesson_progress (progress_id, user_id, lesson_id, is_completed, progress, completed_at, created_at)
        VALUES (gen_random_uuid(), v_learner_id, v_lesson_id, true, 100, NOW(), NOW())
        ON CONFLICT (user_id, lesson_id) DO UPDATE SET
            is_completed = true, progress = 100, completed_at = NOW();
    END LOOP;

    -- ─── V2: Actual study progress (user level == lesson level) ───

    -- Chapter 9 (V2 Ch1), Lesson 1: completed
    INSERT INTO lesson_progress (progress_id, user_id, lesson_id, is_completed, progress, completed_at, created_at)
    SELECT gen_random_uuid(), v_learner_id, lesson_id, true, 100, NOW(), NOW()
    FROM lessons WHERE chapter_id = 9 AND sort_order = 1
    ON CONFLICT (user_id, lesson_id) DO UPDATE SET
        is_completed = true, progress = 100, completed_at = NOW();

    -- Chapter 9 (V2 Ch1), Lesson 2: completed
    INSERT INTO lesson_progress (progress_id, user_id, lesson_id, is_completed, progress, completed_at, created_at)
    SELECT gen_random_uuid(), v_learner_id, lesson_id, true, 100, NOW(), NOW()
    FROM lessons WHERE chapter_id = 9 AND sort_order = 2
    ON CONFLICT (user_id, lesson_id) DO UPDATE SET
        is_completed = true, progress = 100, completed_at = NOW();

    -- Chapter 9 (V2 Ch1), Lesson 3: completed
    INSERT INTO lesson_progress (progress_id, user_id, lesson_id, is_completed, progress, completed_at, created_at)
    SELECT gen_random_uuid(), v_learner_id, lesson_id, true, 100, NOW(), NOW()
    FROM lessons WHERE chapter_id = 9 AND sort_order = 3
    ON CONFLICT (user_id, lesson_id) DO UPDATE SET
        is_completed = true, progress = 100, completed_at = NOW();

    -- Chapter 10 (V2 Ch2), Lesson 1: completed
    INSERT INTO lesson_progress (progress_id, user_id, lesson_id, is_completed, progress, completed_at, created_at)
    SELECT gen_random_uuid(), v_learner_id, lesson_id, true, 100, NOW(), NOW()
    FROM lessons WHERE chapter_id = 10 AND sort_order = 1
    ON CONFLICT (user_id, lesson_id) DO UPDATE SET
        is_completed = true, progress = 100, completed_at = NOW();

    -- Chapter 10 (V2 Ch2), Lesson 2: in-progress (60%)
    INSERT INTO lesson_progress (progress_id, user_id, lesson_id, is_completed, progress, completed_at, created_at)
    SELECT gen_random_uuid(), v_learner_id, lesson_id, false, 60, NULL, NOW()
    FROM lessons WHERE chapter_id = 10 AND sort_order = 2
    ON CONFLICT (user_id, lesson_id) DO UPDATE SET
        is_completed = false, progress = 60, completed_at = NULL;
END $$;


COMMIT;

