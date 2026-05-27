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
     true, '[{"index":5,"color":"var(--primary)"},{"index":6,"color":"var(--primary)"}]', 8),

    -- ══════════════════════════════════════════════════════════════════════
    -- CHAPTER 4: ĐI CHỢ & MUA SẮM
    -- ══════════════════════════════════════════════════════════════════════

    -- ── Chapter 4, Lesson 1: Hỏi giá — "Bao nhiêu tiền?" ──
    ('f1000000-0000-0000-0101-000000000004', 'd0000000-0000-0000-0400-000000000001',
     'BÁN HÀNG', '店員',
     'Mời em, vào xem đi! Hôm nay có nhiều quả vải tươi lắm!',
     'いらっしゃい、見てって！今日は新鮮なライチがたくさんあるよ！',
     false, NULL, 1),

    ('f1000000-0000-0000-0102-000000000004', 'd0000000-0000-0000-0400-000000000001',
     'BẠN', 'あなた',
     'Chị ơi, quả vải này bao nhiêu tiền một cân ạ?',
     'すみません、このライチは1キロいくらですか？',
     true, '[{"index":4,"color":"var(--secondary)"},{"index":5,"color":"var(--secondary)"},{"index":6,"color":"var(--secondary)"}]', 2),

    ('f1000000-0000-0000-0103-000000000004', 'd0000000-0000-0000-0400-000000000001',
     'BÁN HÀNG', '店員',
     'Vải thiều bốn mươi nghìn một cân em nhé. Ngon lắm, ngọt lịm luôn!',
     'ライチは1キロ4万ドンだよ。すごく美味しい、甘くてたまらないよ！',
     false, NULL, 3),

    ('f1000000-0000-0000-0104-000000000004', 'd0000000-0000-0000-0400-000000000001',
     'BẠN', 'あなた',
     'Đắt quá chị ơi! Bớt cho em một chút được không ạ?',
     '高いです！少し安くしてもらえませんか？',
     true, '[{"index":0,"color":"var(--error)"},{"index":1,"color":"var(--error)"}]', 4),

    ('f1000000-0000-0000-0105-000000000004', 'd0000000-0000-0000-0400-000000000001',
     'BÁN HÀNG', '店員',
     'Em mua nhiều chị bớt cho. Mua hai cân chị tính bảy mươi thôi.',
     'たくさん買うなら安くするよ。2キロなら7万でいいよ。',
     false, NULL, 5),

    ('f1000000-0000-0000-0106-000000000004', 'd0000000-0000-0000-0400-000000000001',
     'BẠN', 'あなた',
     'Vâng, cho em hai cân nhé chị. Bao nhiêu tiền tất cả ạ?',
     'はい、2キロください。全部でいくらですか？',
     true, '[{"index":6,"color":"var(--primary)"},{"index":7,"color":"var(--primary)"},{"index":8,"color":"var(--primary)"}]', 6),

    ('f1000000-0000-0000-0107-000000000004', 'd0000000-0000-0000-0400-000000000001',
     'BÁN HÀNG', '店員',
     'Bảy mươi nghìn thôi em. Chị gói cho em nhé!',
     '7万ドンだよ。包んであげるね！',
     false, NULL, 7),

    ('f1000000-0000-0000-0108-000000000004', 'd0000000-0000-0000-0400-000000000001',
     'BẠN', 'あなた',
     'Cảm ơn chị! Đây ạ, em đưa đúng bảy mươi nghìn.',
     'ありがとうございます！はい、ちょうど7万ドンです。',
     true, NULL, 8),

    -- ── Chapter 4, Lesson 2: Trả giá lịch sự ──
    ('f1000000-0000-0000-0201-000000000004', 'd0000000-0000-0000-0400-000000000002',
     'BÁN HÀNG', '店員',
     'Áo này đẹp lắm em ơi! Hai trăm nghìn thôi, rẻ nhất chợ Đồng Xuân rồi!',
     'このシャツとてもきれいよ！20万ドンだけ、ドンスアン市場で一番安いよ！',
     false, NULL, 1),

    ('f1000000-0000-0000-0202-000000000004', 'd0000000-0000-0000-0400-000000000002',
     'BẠN', 'あなた',
     'Hai trăm nghìn hả chị? Đắt quá! Một trăm hai mươi nghìn được không ạ?',
     '20万ドンですか？高い！12万ドンでどうですか？',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":2,"color":"var(--primary)"},{"index":6,"color":"var(--secondary)"},{"index":7,"color":"var(--secondary)"},{"index":8,"color":"var(--secondary)"},{"index":9,"color":"var(--secondary)"}]', 2),

    ('f1000000-0000-0000-0203-000000000004', 'd0000000-0000-0000-0400-000000000002',
     'BÁN HÀNG', '店員',
     'Trời ơi, một trăm hai thì chị lỗ vốn mất! Một trăm bảy đi, chị nhượng cho em.',
     'えー、12万じゃ赤字だよ！17万なら譲ってあげる。',
     false, NULL, 3),

    ('f1000000-0000-0000-0204-000000000004', 'd0000000-0000-0000-0400-000000000002',
     'BẠN', 'あなた',
     'Một trăm năm mươi nghìn nhé chị. Em mua hai cái luôn!',
     '15万ドンでどうですか。2枚買いますよ！',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":2,"color":"var(--primary)"},{"index":3,"color":"var(--primary)"}]', 4),

    ('f1000000-0000-0000-0205-000000000004', 'd0000000-0000-0000-0400-000000000002',
     'BÁN HÀNG', '店員',
     'Mua hai cái hả? Thôi được, một trăm năm mươi một cái. Chị chiều em!',
     '2枚買う？じゃあ仕方ない、1枚15万。あなたに合わせてあげる！',
     false, NULL, 5),

    ('f1000000-0000-0000-0206-000000000004', 'd0000000-0000-0000-0400-000000000002',
     'BẠN', 'あなた',
     'Cảm ơn chị! Vậy em lấy hai cái nhé. Ba trăm nghìn tất cả phải không ạ?',
     'ありがとう！じゃあ2枚ください。全部で30万ドンですよね？',
     true, '[{"index":9,"color":"var(--primary)"},{"index":10,"color":"var(--primary)"}]', 6),

    ('f1000000-0000-0000-0207-000000000004', 'd0000000-0000-0000-0400-000000000002',
     'BÁN HÀNG', '店員',
     'Đúng rồi! Em chọn màu nào? Có đỏ, xanh, trắng — màu nào cũng đẹp cả!',
     'その通り！何色にする？赤、青、白 — どれもきれいだよ！',
     false, NULL, 7),

    ('f1000000-0000-0000-0208-000000000004', 'd0000000-0000-0000-0400-000000000002',
     'BẠN', 'あなた',
     'Em lấy một cái xanh và một cái trắng ạ. Cảm ơn chị, mua sắm ở đây vui quá!',
     '青を1枚と白を1枚ください。ありがとう、ここで買い物するの楽しいです！',
     true, '[{"index":4,"color":"var(--primary)"},{"index":8,"color":"var(--primary)"}]', 8),

    -- ── Chapter 4, Lesson 3: Đếm số & Đơn vị tiền Việt ──
    ('f1000000-0000-0000-0301-000000000004', 'd0000000-0000-0000-0400-000000000003',
     'GIÁO VIÊN', '先生',
     'Hôm nay ta học đếm số tiếng Việt. Bắt đầu từ 1 đến 10 nhé: một, hai, ba, bốn, năm, sáu, bảy, tám, chín, mười.',
     '今日はベトナム語の数字を学びます。1から10まで：một, hai, ba, bốn, năm, sáu, bảy, tám, chín, mười。',
     false, NULL, 1),

    ('f1000000-0000-0000-0302-000000000004', 'd0000000-0000-0000-0400-000000000003',
     'BẠN', 'あなた',
     'Một, hai, ba, bốn, năm, sáu, bảy, tám, chín, mười.',
     'モット、ハイ、バー、ボン、ナム、サウ、バイ、タム、チン、ムオイ。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":2,"color":"var(--primary)"},{"index":3,"color":"var(--primary)"},{"index":4,"color":"var(--primary)"}]', 2),

    ('f1000000-0000-0000-0303-000000000004', 'd0000000-0000-0000-0400-000000000003',
     'GIÁO VIÊN', '先生',
     'Giỏi lắm! Bây giờ học đơn vị lớn hơn. "Mười" là 10, "trăm" là 100, "nghìn" là 1.000, "triệu" là 1.000.000.',
     '上手！次は大きな単位を学びます。「mười」=10、「trăm」=100、「nghìn」=1,000、「triệu」=1,000,000。',
     false, NULL, 3),

    ('f1000000-0000-0000-0304-000000000004', 'd0000000-0000-0000-0400-000000000003',
     'BẠN', 'あなた',
     'Vậy hai mươi nghìn là 20.000 đồng, đúng không ạ?',
     'では「hai mươi nghìn」は2万ドンですよね？',
     true, '[{"index":1,"color":"var(--secondary)"},{"index":2,"color":"var(--secondary)"},{"index":3,"color":"var(--secondary)"}]', 4),

    ('f1000000-0000-0000-0305-000000000004', 'd0000000-0000-0000-0400-000000000003',
     'GIÁO VIÊN', '先生',
     'Chính xác! Người Việt hay nói "hai chục" thay vì "hai mươi" — nghĩa giống nhau. Và "một trăm nghìn" là 100.000₫.',
     '正解！ベトナム人は「hai mươi」の代わりに「hai chục」とも言います。そして「một trăm nghìn」は100,000₫。',
     false, NULL, 5),

    ('f1000000-0000-0000-0306-000000000004', 'd0000000-0000-0000-0400-000000000003',
     'BẠN', 'あなた',
     'Một trăm nghìn, hai trăm nghìn, năm trăm nghìn. Em đếm được rồi!',
     '10万、20万、50万。数えられるようになりました！',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":2,"color":"var(--primary)"}]', 6),

    ('f1000000-0000-0000-0307-000000000004', 'd0000000-0000-0000-0400-000000000003',
     'GIÁO VIÊN', '先生',
     'Xuất sắc! Mẹo nhỏ: khi đi chợ, người ta hay nói tắt "năm chục" thay vì "năm mươi nghìn". Nhớ nhé!',
     '素晴らしい！コツ：市場では「năm mươi nghìn」の代わりに「năm chục」と省略して言うことが多いよ。覚えてね！',
     false, NULL, 7),

    ('f1000000-0000-0000-0308-000000000004', 'd0000000-0000-0000-0400-000000000003',
     'BẠN', 'あなた',
     'Năm chục là năm mươi nghìn. Em nhớ rồi ạ! Giờ em tự tin đi chợ hơn!',
     '「năm chục」は5万ドン。覚えました！これで市場に行くのも自信が持てます！',
     true, '[{"index":0,"color":"var(--secondary)"},{"index":1,"color":"var(--secondary)"}]', 8),

    -- ══════════════════════════════════════════════════════════════════════
    -- CHAPTER 5: DI CHUYỂN & PHƯƠNG TIỆN
    -- ══════════════════════════════════════════════════════════════════════

    -- ── Chapter 5, Lesson 1: Gọi Grab & Taxi ──
    ('f1000000-0000-0000-0101-000000000005', 'd0000000-0000-0000-0500-000000000001',
     'BẠN', 'あなた',
     'Anh ơi, cho em đến Hồ Hoàn Kiếm ạ.',
     '運転手さん、ホアンキエム湖までお願いします。',
     true, '[{"index":4,"color":"var(--secondary)"},{"index":5,"color":"var(--secondary)"},{"index":6,"color":"var(--secondary)"}]', 1),

    ('f1000000-0000-0000-0102-000000000005', 'd0000000-0000-0000-0500-000000000001',
     'TÀI XẾ', '運転手',
     'Được em. Đường hơi tắc giờ này, đi khoảng 15 phút nhé.',
     '了解。この時間は少し渋滞しているから、15分くらいかかるよ。',
     false, NULL, 2),

    ('f1000000-0000-0000-0103-000000000005', 'd0000000-0000-0000-0500-000000000001',
     'BẠN', 'あなた',
     'Vâng, không sao ạ. Anh đi đường nào nhanh nhất ạ?',
     'はい、大丈夫です。一番早い道はどの道ですか？',
     true, '[{"index":5,"color":"var(--primary)"},{"index":6,"color":"var(--primary)"},{"index":7,"color":"var(--primary)"}]', 3),

    ('f1000000-0000-0000-0104-000000000005', 'd0000000-0000-0000-0500-000000000001',
     'TÀI XẾ', '運転手',
     'Anh đi qua đường Hai Bà Trưng rồi rẽ vào Hàng Bài nhé. Nhanh hơn đấy.',
     'ハイバーチュン通りを通ってハンバイに曲がるよ。その方が早い。',
     false, NULL, 4),

    ('f1000000-0000-0000-0105-000000000005', 'd0000000-0000-0000-0500-000000000001',
     'BẠN', 'あなた',
     'Dạ, anh đi đường nào tiện thì em theo ạ. À, bao nhiêu tiền ạ?',
     'はい、便利な道でお任せします。あの、いくらですか？',
     true, '[{"index":10,"color":"var(--primary)"},{"index":11,"color":"var(--primary)"},{"index":12,"color":"var(--primary)"}]', 5),

    ('f1000000-0000-0000-0106-000000000005', 'd0000000-0000-0000-0500-000000000001',
     'TÀI XẾ', '運転手',
     'Grab đã tính sẵn rồi em, ba mươi lăm nghìn trên ứng dụng.',
     'Grabアプリですでに計算されているよ、3万5千ドン。',
     false, NULL, 6),

    ('f1000000-0000-0000-0107-000000000005', 'd0000000-0000-0000-0500-000000000001',
     'BẠN', 'あなた',
     'Dạ rồi ạ. Anh cho em xuống ở cổng phía Bắc Hồ Hoàn Kiếm nhé.',
     'わかりました。ホアンキエム湖の北門で降ろしてください。',
     true, '[{"index":5,"color":"var(--secondary)"},{"index":6,"color":"var(--secondary)"}]', 7),

    ('f1000000-0000-0000-0108-000000000005', 'd0000000-0000-0000-0500-000000000001',
     'TÀI XẾ', '運転手',
     'Đến rồi em! Cẩn thận xuống xe nhé. Chúc em vui!',
     '着いたよ！気をつけて降りてね。楽しんでね！',
     false, NULL, 8),

    -- ── Chapter 5, Lesson 2: Hỏi đường — "Đi thế nào?" ──
    ('f1000000-0000-0000-0201-000000000005', 'd0000000-0000-0000-0500-000000000002',
     'BẠN', 'あなた',
     'Xin lỗi, cho em hỏi Bưu điện Hà Nội đi thế nào ạ?',
     'すみません、ハノイ中央郵便局はどう行けばいいですか？',
     true, '[{"index":6,"color":"var(--secondary)"},{"index":7,"color":"var(--secondary)"},{"index":8,"color":"var(--secondary)"}]', 1),

    ('f1000000-0000-0000-0202-000000000005', 'd0000000-0000-0000-0500-000000000002',
     'NGƯỜI ĐI ĐƯỜNG', '通行人',
     'Bưu điện Hà Nội hả em? Đi thẳng con đường này khoảng 200 mét nhé.',
     'ハノイ中央郵便局？この道をまっすぐ200メートルくらい行ってね。',
     false, NULL, 2),

    ('f1000000-0000-0000-0203-000000000005', 'd0000000-0000-0000-0500-000000000002',
     'BẠN', 'あなた',
     'Dạ, đi thẳng 200 mét rồi sao ạ? Có cần rẽ ở đâu không?',
     'はい、まっすぐ200メートル行ったら、その後は？どこかで曲がりますか？',
     true, '[{"index":2,"color":"var(--primary)"},{"index":3,"color":"var(--primary)"},{"index":9,"color":"var(--secondary)"}]', 3),

    ('f1000000-0000-0000-0204-000000000005', 'd0000000-0000-0000-0500-000000000002',
     'NGƯỜI ĐI ĐƯỜNG', '通行人',
     'Đến ngã tư thì rẽ trái, đi thêm 100 mét nữa, bưu điện ở bên tay phải.',
     '交差点に着いたら左折して、あと100メートル行ったら右手に郵便局があるよ。',
     false, NULL, 4),

    ('f1000000-0000-0000-0205-000000000005', 'd0000000-0000-0000-0500-000000000002',
     'BẠN', 'あなた',
     'Đi thẳng, rẽ trái ở ngã tư, rồi 100 mét bên tay phải. Em hiểu rồi ạ!',
     'まっすぐ、交差点で左折、100メートル先の右手。わかりました！',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":2,"color":"var(--secondary)"},{"index":3,"color":"var(--secondary)"},{"index":10,"color":"var(--secondary)"},{"index":11,"color":"var(--secondary)"}]', 5),

    ('f1000000-0000-0000-0206-000000000005', 'd0000000-0000-0000-0500-000000000002',
     'NGƯỜI ĐI ĐƯỜNG', '通行人',
     'Đúng rồi! Tòa nhà màu vàng to lắm, không thể nhầm được đâu.',
     'そうそう！黄色い大きな建物だから、見間違えないよ。',
     false, NULL, 6),

    ('f1000000-0000-0000-0207-000000000005', 'd0000000-0000-0000-0500-000000000002',
     'BẠN', 'あなた',
     'Dạ, tòa nhà màu vàng. Em cảm ơn anh nhiều ạ!',
     'はい、黄色い建物ですね。ありがとうございました！',
     true, NULL, 7),

    ('f1000000-0000-0000-0208-000000000005', 'd0000000-0000-0000-0500-000000000002',
     'NGƯỜI ĐI ĐƯỜNG', '通行人',
     'Không có gì! Chúc em đi vui nhé!',
     'どういたしまして！楽しんでね！',
     false, NULL, 8),

    -- ── Chapter 5, Lesson 3: Xe buýt & Tàu điện ──
    ('f1000000-0000-0000-0301-000000000005', 'd0000000-0000-0000-0500-000000000003',
     'BẠN', 'あなた',
     'Anh ơi, xe buýt số 32 có đi qua Cầu Giấy không ạ?',
     'すみません、32番バスはカウザイを通りますか？',
     true, '[{"index":3,"color":"var(--primary)"},{"index":4,"color":"var(--primary)"},{"index":5,"color":"var(--primary)"}]', 1),

    ('f1000000-0000-0000-0302-000000000005', 'd0000000-0000-0000-0500-000000000003',
     'HÀNH KHÁCH', '乗客',
     'Có em! Xe 32 đi qua Cầu Giấy luôn. Em xuống ở bến thứ 5 nhé.',
     '通るよ！32番バスはカウザイを通る。5番目の停留所で降りてね。',
     false, NULL, 2),

    ('f1000000-0000-0000-0303-000000000005', 'd0000000-0000-0000-0500-000000000003',
     'BẠN', 'あなた',
     'Dạ, vé xe buýt bao nhiêu tiền một lượt ạ?',
     'はい、バスの運賃は片道いくらですか？',
     true, '[{"index":2,"color":"var(--secondary)"},{"index":3,"color":"var(--secondary)"},{"index":4,"color":"var(--secondary)"},{"index":5,"color":"var(--secondary)"}]', 3),

    ('f1000000-0000-0000-0304-000000000005', 'd0000000-0000-0000-0500-000000000003',
     'HÀNH KHÁCH', '乗客',
     'Bảy nghìn đồng thôi em, rẻ lắm. Em mua vé trên xe luôn nhé.',
     '7千ドンだけだよ、安い。バスに乗ってからチケット買ってね。',
     false, NULL, 4),

    ('f1000000-0000-0000-0305-000000000005', 'd0000000-0000-0000-0500-000000000003',
     'BẠN', 'あなた',
     'Rẻ quá! Hà Nội có tuyến tàu điện trên cao không ạ?',
     'すごく安い！ハノイにはモノレールはありますか？',
     true, '[{"index":5,"color":"var(--primary)"},{"index":6,"color":"var(--primary)"},{"index":7,"color":"var(--primary)"},{"index":8,"color":"var(--primary)"}]', 5),

    ('f1000000-0000-0000-0306-000000000005', 'd0000000-0000-0000-0500-000000000003',
     'HÀNH KHÁCH', '乗客',
     'Có chứ! Tuyến Cát Linh - Hà Đông chạy rồi. Sạch sẽ, mát mẻ, rất tiện!',
     'あるよ！カットリン - ハードン線がもう運行している。きれいで涼しくて便利だよ！',
     false, NULL, 6),

    ('f1000000-0000-0000-0307-000000000005', 'd0000000-0000-0000-0500-000000000003',
     'BẠN', 'あなた',
     'Hay quá! Em sẽ thử đi tàu điện Cát Linh - Hà Đông xem sao.',
     'いいですね！カットリン - ハードン線に乗ってみます。',
     true, '[{"index":5,"color":"var(--secondary)"},{"index":6,"color":"var(--secondary)"},{"index":7,"color":"var(--secondary)"}]', 7),

    ('f1000000-0000-0000-0308-000000000005', 'd0000000-0000-0000-0500-000000000003',
     'HÀNH KHÁCH', '乗客',
     'Em thử đi! Ga Cát Linh ở gần Hồ Đống Đa luôn. Dễ tìm lắm!',
     '試してみて！カットリン駅はドンダー湖の近くだよ。見つけやすい！',
     false, NULL, 8),

    -- ══════════════════════════════════════════════════════════════════════
    -- CHAPTER 6: NGUYÊN ÂM & PHỤ ÂM ĐẶC BIỆT
    -- ══════════════════════════════════════════════════════════════════════

    -- ── Chapter 6, Lesson 1: Nguyên âm: ă, â, ê, ô, ơ, ư ──
    ('f1000000-0000-0000-0101-000000000006', 'd0000000-0000-0000-0600-000000000001',
     'GIÁO VIÊN', '先生',
     'Tiếng Việt có 6 nguyên âm đặc biệt không có trong tiếng Nhật: ă, â, ê, ô, ơ, ư. Nghe kỹ nhé!',
     'ベトナム語には日本語にない6つの特別な母音があります：ă, â, ê, ô, ơ, ư。よく聞いてね！',
     false, NULL, 1),

    ('f1000000-0000-0000-0102-000000000006', 'd0000000-0000-0000-0600-000000000001',
     'BẠN', 'あなた',
     'Dạ, cái nào khó nhất ạ? Em muốn luyện cái khó trước.',
     'はい、どれが一番難しいですか？難しいのから練習したいです。',
     true, NULL, 2),

    ('f1000000-0000-0000-0103-000000000006', 'd0000000-0000-0000-0600-000000000001',
     'GIÁO VIÊN', '先生',
     'Khó nhất là "ơ" và "ư". Đọc: cơm — côm. "Ơ" miệng mở rộng, "ô" miệng tròn nhỏ.',
     '一番難しいのは「ơ」と「ư」。読んで：cơm - côm。「ơ」は口を広げ、「ô」は口を丸く小さく。',
     false, NULL, 3),

    ('f1000000-0000-0000-0104-000000000006', 'd0000000-0000-0000-0600-000000000001',
     'BẠN', 'あなた',
     'Cơm, côm. Cơm là gạo nấu chín, đúng không ạ?',
     'コム、コム。cơmは炊いたご飯のことですよね？',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--secondary)"}]', 4),

    ('f1000000-0000-0000-0105-000000000006', 'd0000000-0000-0000-0600-000000000001',
     'GIÁO VIÊN', '先生',
     'Đúng rồi! Bây giờ thử "ư": lưng — lung. "Ư" môi mím lại, lưỡi rút về sau.',
     'その通り！次は「ư」：lưng - lung。「ư」は唇を引き、舌を後ろに引く。',
     false, NULL, 5),

    ('f1000000-0000-0000-0106-000000000006', 'd0000000-0000-0000-0600-000000000001',
     'BẠN', 'あなた',
     'Lưng, lung. Lưng là cái lưng của người, phải không ạ?',
     'ルン、ルン。lưngは背中のことですよね？',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--secondary)"}]', 6),

    ('f1000000-0000-0000-0107-000000000006', 'd0000000-0000-0000-0600-000000000001',
     'GIÁO VIÊN', '先生',
     'Chuẩn! Giờ thử thêm: "ă" rất ngắn — "ăn" (eat), "â" cũng ngắn — "ân" (grace). Đọc nhanh nhé!',
     '正解！もう少し：「ă」はとても短い —「ăn」(食べる)、「â」も短い —「ân」(恩)。速く読んでみて！',
     false, NULL, 7),

    ('f1000000-0000-0000-0108-000000000006', 'd0000000-0000-0000-0600-000000000001',
     'BẠN', 'あなた',
     'Ăn, ân. Cơm, lưng. Em cảm nhận được sự khác biệt rồi ạ!',
     'アン、アン。コム、ルン。違いが感じ取れるようになりました！',
     true, '[{"index":0,"color":"var(--error)"},{"index":1,"color":"var(--error)"},{"index":2,"color":"var(--primary)"},{"index":3,"color":"var(--primary)"}]', 8),

    -- ── Chapter 6, Lesson 2: Phụ âm đầu: gi, d, r miền Bắc ──
    ('f1000000-0000-0000-0201-000000000006', 'd0000000-0000-0000-0600-000000000002',
     'GIÁO VIÊN', '先生',
     'Ở miền Bắc, ba phụ âm "gi", "d", và "r" đều đọc giống nhau: /z/! Đây là đặc điểm riêng của giọng Hà Nội.',
     '北部では「gi」「d」「r」の3つの子音はすべて同じ /z/ と発音されます！これがハノイ方言の特徴です。',
     false, NULL, 1),

    ('f1000000-0000-0000-0202-000000000006', 'd0000000-0000-0000-0600-000000000002',
     'BẠN', 'あなた',
     'Vậy "gia đình", "da cam", "ra ngoài" — tất cả bắt đầu bằng /z/ ạ?',
     'つまり「gia đình」「da cam」「ra ngoài」— すべて /z/ で始まるんですか？',
     true, '[{"index":1,"color":"var(--primary)"},{"index":2,"color":"var(--primary)"},{"index":4,"color":"var(--primary)"},{"index":5,"color":"var(--primary)"},{"index":7,"color":"var(--primary)"},{"index":8,"color":"var(--primary)"}]', 2),

    ('f1000000-0000-0000-0203-000000000006', 'd0000000-0000-0000-0600-000000000002',
     'GIÁO VIÊN', '先生',
     'Chính xác! Khi viết thì khác nhau, nhưng khi nói giọng Hà Nội thì đều phát âm /z/.',
     '正解！書き方は違いますが、ハノイの発音ではすべて /z/ です。',
     false, NULL, 3),

    ('f1000000-0000-0000-0204-000000000006', 'd0000000-0000-0000-0600-000000000002',
     'BẠN', 'あなた',
     'Gia đình, da cam, ra ngoài. Em thử đọc cả ba rồi. Giống nhau thật!',
     'ザーディン、ザーカム、ザーンゴアイ。3つとも読んでみました。本当に同じ！',
     true, '[{"index":0,"color":"var(--secondary)"},{"index":1,"color":"var(--secondary)"},{"index":2,"color":"var(--secondary)"},{"index":3,"color":"var(--secondary)"},{"index":4,"color":"var(--secondary)"},{"index":5,"color":"var(--secondary)"}]', 4),

    ('f1000000-0000-0000-0205-000000000006', 'd0000000-0000-0000-0600-000000000002',
     'GIÁO VIÊN', '先生',
     'Rất tốt! Bây giờ thử câu: "Gia đình tôi rất đoàn kết." Đọc chậm rõ nhé.',
     'とても良い！では文を試して：「Gia đình tôi rất đoàn kết.」ゆっくりはっきり読んでね。',
     false, NULL, 5),

    ('f1000000-0000-0000-0206-000000000006', 'd0000000-0000-0000-0600-000000000002',
     'BẠN', 'あなた',
     'Gia đình tôi rất đoàn kết. "Gia" bắt đầu bằng /z/, phải không ạ?',
     'ザーディン トイ ザット ドアン ケット。「gia」は /z/ で始まりますよね？',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"}]', 6),

    ('f1000000-0000-0000-0207-000000000006', 'd0000000-0000-0000-0600-000000000002',
     'GIÁO VIÊN', '先生',
     'Hoàn hảo! Nhớ nhé: miền Nam đọc "r" là /ʐ/ cuộn lưỡi, nhưng miền Bắc thì luôn là /z/.',
     '完璧！覚えて：南部では「r」を /ʐ/ と巻き舌で読むけど、北部はいつも /z/ だよ。',
     false, NULL, 7),

    ('f1000000-0000-0000-0208-000000000006', 'd0000000-0000-0000-0600-000000000002',
     'BẠN', 'あなた',
     'Em nhớ rồi ạ! Giọng Hà Nội: gi, d, r đều là /z/. Đây là đặc điểm rất quan trọng!',
     '覚えました！ハノイ方言：gi, d, rはすべて /z/。これはとても重要な特徴ですね！',
     true, '[{"index":5,"color":"var(--error)"},{"index":6,"color":"var(--error)"},{"index":7,"color":"var(--error)"},{"index":8,"color":"var(--error)"},{"index":10,"color":"var(--error)"}]', 8),

    -- ── Chapter 6, Lesson 3: Vần cuối: -ng, -nh, -ch, -t ──
    ('f1000000-0000-0000-0301-000000000006', 'd0000000-0000-0000-0600-000000000003',
     'GIÁO VIÊN', '先生',
     'Phụ âm cuối trong tiếng Việt rất khác tiếng Nhật. Nghe kỹ: "anh" kết thúc bằng /ŋ/ mũi, "ách" kết thúc bằng /k/ tắt.',
     'ベトナム語の末尾子音は日本語と大きく違います。よく聞いて：「anh」は鼻音 /ŋ/、「ách」は閉鎖音 /k/ で終わる。',
     false, NULL, 1),

    ('f1000000-0000-0000-0302-000000000006', 'd0000000-0000-0000-0600-000000000003',
     'BẠN', 'あなた',
     'Anh, ách. Nghe khác nhau rồi ạ! Một cái kéo dài, một cái tắt ngắn.',
     'アイン、アック。違いが聞こえました！一方は伸びて、もう一方は短く止まる。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--error)"}]', 2),

    ('f1000000-0000-0000-0303-000000000006', 'd0000000-0000-0000-0600-000000000003',
     'GIÁO VIÊN', '先生',
     'Đúng rồi! Bây giờ thử cặp: "bạn" /n/ — "bát" /t/. "Bạn" kéo mũi, "bát" tắt nhanh ở đầu lưỡi.',
     'その通り！次のペア：「bạn」/n/ —「bát」/t/。「bạn」は鼻に抜け、「bát」は舌先で急に止まる。',
     false, NULL, 3),

    ('f1000000-0000-0000-0304-000000000006', 'd0000000-0000-0000-0600-000000000003',
     'BẠN', 'あなた',
     'Bạn, bát. Bạn là friend, bát là cái bát ăn cơm, đúng không ạ?',
     'バン、バット。bạnは友達、bátはご飯茶碗ですよね？',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--error)"}]', 4),

    ('f1000000-0000-0000-0305-000000000006', 'd0000000-0000-0000-0600-000000000003',
     'GIÁO VIÊN', '先生',
     'Chính xác! Lưu ý: người miền Bắc nói "bát" chứ không nói "chén" như miền Nam nhé.',
     '正解！注意：北部の人は「bát」と言い、南部のように「chén」とは言わないよ。',
     false, NULL, 5),

    ('f1000000-0000-0000-0306-000000000006', 'd0000000-0000-0000-0600-000000000003',
     'BẠN', 'あなた',
     'Dạ, em nhớ rồi! Bát, không phải chén. Giờ thử "nh" nhé: anh, ánh.',
     'はい、覚えました！bát、chénではなく。次は「nh」：anh, ánh。',
     true, '[{"index":5,"color":"var(--secondary)"}]', 6),

    ('f1000000-0000-0000-0307-000000000006', 'd0000000-0000-0000-0600-000000000003',
     'GIÁO VIÊN', '先生',
     'Rất tốt! "-nh" phát âm nhẹ, gần như biến mất ở cuối. "Anh" — /ajŋ/, "ánh" — /ajŋ/ nhưng thanh sắc.',
     'とても良い！「-nh」は軽く、ほぼ消えるように発音。「anh」— /ajŋ/、「ánh」— /ajŋ/ だけど声調が上昇。',
     false, NULL, 7),

    ('f1000000-0000-0000-0308-000000000006', 'd0000000-0000-0000-0600-000000000003',
     'BẠN', 'あなた',
     'Anh, ánh. Bạn, bát. Em nghe rõ sự khác biệt giữa vần mũi và vần tắt rồi ạ!',
     'アイン、アイン。バン、バット。鼻音末と閉鎖末の違いがはっきり聞き取れるようになりました！',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--error)"},{"index":2,"color":"var(--primary)"},{"index":3,"color":"var(--error)"}]', 8),

    -- ══════════════════════════════════════════════════════════════════════
    -- CHAPTER 7: SINH HOẠT HÀNG NGÀY
    -- ══════════════════════════════════════════════════════════════════════

    -- ── Chapter 7, Lesson 1: Thời gian — Hôm nay, ngày mai ──
    ('f1000000-0000-0000-0101-000000000007', 'd0000000-0000-0000-0700-000000000001',
     'GIÁO VIÊN', '先生',
     'Hôm nay là thứ mấy? Người Việt đếm thứ từ "hai" đến "bảy", còn Chủ nhật thì gọi riêng.',
     '今日は何曜日？ベトナム人は曜日を「hai」(2)から「bảy」(7)まで数え、日曜日は特別な呼び方。',
     false, NULL, 1),

    ('f1000000-0000-0000-0102-000000000007', 'd0000000-0000-0000-0700-000000000001',
     'BẠN', 'あなた',
     'Hôm nay là thứ hai. Ngày mai là thứ ba.',
     '今日は月曜日です。明日は火曜日です。',
     true, '[{"index":3,"color":"var(--primary)"},{"index":4,"color":"var(--primary)"},{"index":7,"color":"var(--secondary)"},{"index":8,"color":"var(--secondary)"}]', 2),

    ('f1000000-0000-0000-0103-000000000007', 'd0000000-0000-0000-0700-000000000001',
     'GIÁO VIÊN', '先生',
     'Chuẩn! Bây giờ nói giờ nhé. "Bây giờ là mấy giờ?" — "Bây giờ là 8 giờ sáng."',
     '正解！次は時間を言ってみよう。「今何時？」—「今朝8時です。」',
     false, NULL, 3),

    ('f1000000-0000-0000-0104-000000000007', 'd0000000-0000-0000-0700-000000000001',
     'BẠN', 'あなた',
     'Bây giờ là tám giờ sáng. Buổi chiều em có lớp lúc hai giờ.',
     '今は朝8時です。午後2時に授業があります。',
     true, '[{"index":3,"color":"var(--primary)"},{"index":4,"color":"var(--primary)"},{"index":5,"color":"var(--primary)"},{"index":11,"color":"var(--secondary)"},{"index":12,"color":"var(--secondary)"}]', 4),

    ('f1000000-0000-0000-0105-000000000007', 'd0000000-0000-0000-0700-000000000001',
     'GIÁO VIÊN', '先生',
     'Giỏi! "Sáng" là morning, "chiều" là afternoon, "tối" là evening. Bây giờ thử nói ngày tháng.',
     '上手！「sáng」は朝、「chiều」は午後、「tối」は夜。次は日付を言ってみて。',
     false, NULL, 5),

    ('f1000000-0000-0000-0106-000000000007', 'd0000000-0000-0000-0700-000000000001',
     'BẠN', 'あなた',
     'Hôm nay là ngày mười lăm tháng năm. Em sinh ngày hai mươi tháng ba.',
     '今日は5月15日です。私の誕生日は3月20日です。',
     true, '[{"index":3,"color":"var(--primary)"},{"index":4,"color":"var(--primary)"},{"index":5,"color":"var(--primary)"},{"index":6,"color":"var(--primary)"},{"index":7,"color":"var(--primary)"}]', 6),

    ('f1000000-0000-0000-0107-000000000007', 'd0000000-0000-0000-0700-000000000001',
     'GIÁO VIÊN', '先生',
     'Tuyệt vời! Nhớ nhé: tiếng Việt nói ngày trước, tháng sau. "Ngày 15 tháng 5" — ngược với tiếng Nhật!',
     '素晴らしい！覚えて：ベトナム語は日を先に、月を後に言う。「ngày 15 tháng 5」— 日本語と逆だよ！',
     false, NULL, 7),

    ('f1000000-0000-0000-0108-000000000007', 'd0000000-0000-0000-0700-000000000001',
     'BẠN', 'あなた',
     'Ngày trước, tháng sau. Em nhớ rồi ạ! Khác với tiếng Nhật nhưng không khó lắm.',
     '日が先、月が後。覚えました！日本語と違うけど、そんなに難しくないです。',
     true, '[{"index":0,"color":"var(--secondary)"},{"index":2,"color":"var(--secondary)"}]', 8),

    -- ── Chapter 7, Lesson 2: Thời tiết Hà Nội ──
    ('f1000000-0000-0000-0201-000000000007', 'd0000000-0000-0000-0700-000000000002',
     'ĐỒNG NGHIỆP', '同僚',
     'Hôm nay trời nóng quá nhỉ! Hà Nội mùa hè nóng kinh khủng!',
     '今日はすごく暑いね！ハノイの夏は恐ろしく暑い！',
     false, NULL, 1),

    ('f1000000-0000-0000-0202-000000000007', 'd0000000-0000-0000-0700-000000000002',
     'BẠN', 'あなた',
     'Ừ, nóng lắm! Nhiệt độ chắc 38 độ rồi. Em muốn uống trà đá quá!',
     'うん、すごく暑い！気温はきっと38度。冷たいお茶が飲みたい！',
     true, '[{"index":1,"color":"var(--error)"},{"index":2,"color":"var(--error)"},{"index":11,"color":"var(--secondary)"},{"index":12,"color":"var(--secondary)"}]', 2),

    ('f1000000-0000-0000-0203-000000000007', 'd0000000-0000-0000-0700-000000000002',
     'ĐỒNG NGHIỆP', '同僚',
     'Nghe nói chiều nay sẽ có mưa rào. Mưa Hà Nội thì đến nhanh, đi nhanh.',
     '午後にはにわか雨が降るらしいよ。ハノイの雨は来るのも去るのも早い。',
     false, NULL, 3),

    ('f1000000-0000-0000-0204-000000000007', 'd0000000-0000-0000-0700-000000000002',
     'BẠN', 'あなた',
     'Mưa rào ạ? Em quên mang ô rồi! Mùa mưa Hà Nội kéo dài mấy tháng?',
     'にわか雨？傘を持ってくるの忘れた！ハノイの雨季は何ヶ月続く？',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":5,"color":"var(--secondary)"}]', 4),

    ('f1000000-0000-0000-0205-000000000007', 'd0000000-0000-0000-0700-000000000002',
     'ĐỒNG NGHIỆP', '同僚',
     'Từ tháng 5 đến tháng 10 là mùa mưa. Còn mùa đông thì lạnh và ẩm, hay có mưa phùn.',
     '5月から10月が雨季。冬は寒くて湿気が多く、霧雨がよく降るよ。',
     false, NULL, 5),

    ('f1000000-0000-0000-0206-000000000007', 'd0000000-0000-0000-0700-000000000002',
     'BẠN', 'あなた',
     'Mùa đông Hà Nội lạnh lắm hả? Ở Nhật em quen lạnh rồi nhưng lạnh ẩm thì khác.',
     'ハノイの冬はすごく寒い？日本で寒さに慣れているけど、湿った寒さは違うよね。',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":3,"color":"var(--error)"}]', 6),

    ('f1000000-0000-0000-0207-000000000007', 'd0000000-0000-0000-0700-000000000002',
     'ĐỒNG NGHIỆP', '同僚',
     'Đúng rồi! Lạnh ẩm Hà Nội thấm vào xương luôn. Nhớ mua áo phao và khăn quàng nhé!',
     'そう！ハノイの湿った寒さは骨まで染みる。ダウンジャケットとマフラーを買ってね！',
     false, NULL, 7),

    ('f1000000-0000-0000-0208-000000000007', 'd0000000-0000-0000-0700-000000000002',
     'BẠN', 'あなた',
     'Em sẽ mua áo phao! Cảm ơn bạn đã nhắc nhé. Thời tiết Hà Nội thú vị quá!',
     'ダウンジャケット買います！教えてくれてありがとう。ハノイの天気は面白い！',
     true, '[{"index":3,"color":"var(--secondary)"},{"index":4,"color":"var(--secondary)"}]', 8),

    -- ── Chapter 7, Lesson 3: Sở thích & Hoạt động cuối tuần ──
    ('f1000000-0000-0000-0301-000000000007', 'd0000000-0000-0000-0700-000000000003',
     'BẠN MỚI', '新しい友達',
     'Cuối tuần bạn thường làm gì? Có đi chơi ở đâu không?',
     '週末はいつも何してる？どこか遊びに行く？',
     false, NULL, 1),

    ('f1000000-0000-0000-0302-000000000007', 'd0000000-0000-0000-0700-000000000003',
     'BẠN', 'あなた',
     'Tôi thích đi cà phê và đọc sách. Hà Nội có nhiều quán cà phê đẹp lắm!',
     'カフェに行ったり本を読んだりするのが好き。ハノイにはきれいなカフェがたくさん！',
     true, '[{"index":2,"color":"var(--secondary)"},{"index":4,"color":"var(--secondary)"},{"index":6,"color":"var(--primary)"},{"index":7,"color":"var(--primary)"}]', 2),

    ('f1000000-0000-0000-0303-000000000007', 'd0000000-0000-0000-0700-000000000003',
     'BẠN MỚI', '新しい友達',
     'Ồ, bạn thích quán cà phê nào nhất? Tôi hay đi Cộng Cà Phê, không gian kiểu retro rất đẹp!',
     'おお、一番好きなカフェは？私はコンカフェによく行く。レトロな雰囲気がすごくきれい！',
     false, NULL, 3),

    ('f1000000-0000-0000-0304-000000000007', 'd0000000-0000-0000-0700-000000000003',
     'BẠN', 'あなた',
     'Tôi thích quán cà phê Giảng — cà phê trứng ở đó nổi tiếng lắm! Bạn đã uống thử chưa?',
     'ジャンカフェが好き — エッグコーヒーが有名だよ！飲んだことある？',
     true, '[{"index":5,"color":"var(--secondary)"},{"index":7,"color":"var(--primary)"},{"index":8,"color":"var(--primary)"}]', 4),

    ('f1000000-0000-0000-0305-000000000007', 'd0000000-0000-0000-0700-000000000003',
     'BẠN MỚI', '新しい友達',
     'Rồi, ngon lắm! Còn cuối tuần tôi cũng thích chạy bộ quanh Hồ Tây vào buổi sáng.',
     '飲んだよ、美味しい！週末は朝ホータイ湖の周りをジョギングするのも好き。',
     false, NULL, 5),

    ('f1000000-0000-0000-0306-000000000007', 'd0000000-0000-0000-0700-000000000003',
     'BẠN', 'あなた',
     'Hay quá! Tôi cũng muốn thử chạy bộ ở Hồ Tây. Mấy giờ bạn thường đi?',
     'いいね！私もホータイ湖でジョギングしてみたい。いつも何時に行く？',
     true, '[{"index":6,"color":"var(--primary)"},{"index":7,"color":"var(--primary)"}]', 6),

    ('f1000000-0000-0000-0307-000000000007', 'd0000000-0000-0000-0700-000000000003',
     'BẠN MỚI', '新しい友達',
     'Khoảng 6 giờ sáng. Cuối tuần này mình đi cùng nhau nhé! Chạy xong rồi ăn bún ốc luôn.',
     '朝6時くらい。今週末一緒に行かない！走り終わったらカタツムリ麺も食べよう。',
     false, NULL, 7),

    ('f1000000-0000-0000-0308-000000000007', 'd0000000-0000-0000-0700-000000000003',
     'BẠN', 'あなた',
     'Được luôn! Cuối tuần này mình hẹn 6 giờ sáng ở Hồ Tây nhé. Tôi rất mong!',
     'いいね！今週末6時にホータイ湖で待ち合わせしよう。楽しみ！',
     true, '[{"index":2,"color":"var(--primary)"},{"index":3,"color":"var(--primary)"}]', 8),

    -- ══════════════════════════════════════════════════════════════════════
    -- CHAPTER 8: TÌNH HUỐNG KHẨN CẤP
    -- ══════════════════════════════════════════════════════════════════════

    -- ── Chapter 8, Lesson 1: "Tôi không hiểu" — Cầu cứu ngôn ngữ ──
    ('f1000000-0000-0000-0101-000000000008', 'd0000000-0000-0000-0800-000000000001',
     'NGƯỜI VIỆT', 'ベトナム人',
     'Em ơi rẽ tay phải rồi đi thẳng qua cái ngã ba, qua cầu vượt là tới.',
     '右に曲がってまっすぐ行って三差路を越えて、高架橋を渡ったら着くよ。',
     false, NULL, 1),

    ('f1000000-0000-0000-0102-000000000008', 'd0000000-0000-0000-0800-000000000001',
     'BẠN', 'あなた',
     'Xin lỗi, tôi không hiểu. Bạn nói chậm hơn được không?',
     'すみません、わかりません。もう少しゆっくり話してもらえますか？',
     true, '[{"index":2,"color":"var(--error)"},{"index":3,"color":"var(--error)"},{"index":4,"color":"var(--error)"},{"index":7,"color":"var(--secondary)"},{"index":8,"color":"var(--secondary)"}]', 2),

    ('f1000000-0000-0000-0103-000000000008', 'd0000000-0000-0000-0800-000000000001',
     'NGƯỜI VIỆT', 'ベトナム人',
     'À, xin lỗi! Rẽ... phải... rồi... đi... thẳng. Được chưa?',
     'あ、ごめんね！右に... 曲がって... まっすぐ... 行く。わかった？',
     false, NULL, 3),

    ('f1000000-0000-0000-0104-000000000008', 'd0000000-0000-0000-0800-000000000001',
     'BẠN', 'あなた',
     'Rẽ phải rồi đi thẳng. Tôi hiểu rồi! Cảm ơn bạn!',
     '右に曲がってまっすぐ。わかりました！ありがとう！',
     true, '[{"index":0,"color":"var(--primary)"},{"index":1,"color":"var(--primary)"},{"index":3,"color":"var(--primary)"},{"index":4,"color":"var(--primary)"}]', 4),

    ('f1000000-0000-0000-0105-000000000008', 'd0000000-0000-0000-0800-000000000001',
     'NGƯỜI VIỆT', 'ベトナム人',
     'Không có gì! Bạn nói tiếng Việt được rồi đấy! À, bạn có biết cái chỗ đó ở đâu không?',
     'どういたしまして！ベトナム語話せるじゃない！あ、その場所どこにあるか知ってる？',
     false, NULL, 5),

    ('f1000000-0000-0000-0106-000000000008', 'd0000000-0000-0000-0800-000000000001',
     'BẠN', 'あなた',
     'Bạn có thể viết ra giấy cho tôi không? Tôi đọc tiếng Việt dễ hơn nghe.',
     '紙に書いてもらえますか？ベトナム語は聞くより読む方がわかりやすいです。',
     true, '[{"index":3,"color":"var(--secondary)"},{"index":4,"color":"var(--secondary)"},{"index":5,"color":"var(--secondary)"}]', 6),

    ('f1000000-0000-0000-0107-000000000008', 'd0000000-0000-0000-0800-000000000001',
     'NGƯỜI VIỆT', 'ベトナム人',
     'Được chứ! Đây, tôi viết cho bạn. "Rẽ phải, đi thẳng 200m, qua cầu vượt."',
     'もちろん！はい、書くよ。「右折、まっすぐ200m、高架橋を越える。」',
     false, NULL, 7),

    ('f1000000-0000-0000-0108-000000000008', 'd0000000-0000-0000-0800-000000000001',
     'BẠN', 'あなた',
     'Cảm ơn bạn rất nhiều! Bạn tốt quá! Tôi sẽ nhờ người viết ra khi không hiểu.',
     'どうもありがとう！親切ですね！わからない時は書いてもらうようにします。',
     true, '[{"index":7,"color":"var(--primary)"},{"index":8,"color":"var(--primary)"}]', 8),

    -- ── Chapter 8, Lesson 2: Tại bệnh viện & Nhà thuốc ──
    ('f1000000-0000-0000-0201-000000000008', 'd0000000-0000-0000-0800-000000000002',
     'BẠN', 'あなた',
     'Xin lỗi, tôi bị ốm. Tôi bị đau bụng từ sáng nay.',
     'すみません、体調が悪いです。今朝からお腹が痛いです。',
     true, '[{"index":4,"color":"var(--error)"},{"index":7,"color":"var(--error)"},{"index":8,"color":"var(--error)"}]', 1),

    ('f1000000-0000-0000-0202-000000000008', 'd0000000-0000-0000-0800-000000000002',
     'DƯỢC SĨ', '薬剤師',
     'Bạn bị đau bụng hả? Bị từ khi nào? Tối qua ăn gì?',
     'お腹が痛い？いつから？昨夜何を食べた？',
     false, NULL, 2),

    ('f1000000-0000-0000-0203-000000000008', 'd0000000-0000-0000-0800-000000000002',
     'BẠN', 'あなた',
     'Từ sáng nay ạ. Tối qua tôi ăn hải sản ở ngoài.',
     '今朝からです。昨夜外でシーフードを食べました。',
     true, '[{"index":7,"color":"var(--primary)"},{"index":8,"color":"var(--primary)"}]', 3),

    ('f1000000-0000-0000-0204-000000000008', 'd0000000-0000-0000-0800-000000000002',
     'DƯỢC SĨ', '薬剤師',
     'Chắc bị ngộ độc thực phẩm nhẹ rồi. Bạn có bị sốt hay buồn nôn không?',
     '軽い食中毒かもしれません。熱や吐き気はありますか？',
     false, NULL, 4),

    ('f1000000-0000-0000-0205-000000000008', 'd0000000-0000-0000-0800-000000000002',
     'BẠN', 'あなた',
     'Tôi hơi buồn nôn nhưng không bị sốt. Cho tôi mua thuốc đau bụng ạ.',
     '少し吐き気がありますが、熱はないです。腹痛の薬をください。',
     true, '[{"index":2,"color":"var(--error)"},{"index":3,"color":"var(--error)"},{"index":11,"color":"var(--secondary)"},{"index":12,"color":"var(--secondary)"},{"index":13,"color":"var(--secondary)"}]', 5),

    ('f1000000-0000-0000-0206-000000000008', 'd0000000-0000-0000-0800-000000000002',
     'DƯỢC SĨ', '薬剤師',
     'Đây, thuốc này uống ngày 3 lần, mỗi lần 1 viên, sau khi ăn nhé. Hết năm mươi nghìn.',
     'はい、この薬は1日3回、毎回1錠、食後に飲んでね。5万ドンです。',
     false, NULL, 6),

    ('f1000000-0000-0000-0207-000000000008', 'd0000000-0000-0000-0800-000000000002',
     'BẠN', 'あなた',
     'Ngày 3 lần, sau khi ăn. Em hiểu rồi ạ. Nếu không đỡ thì em nên đi bệnh viện phải không?',
     '1日3回、食後。わかりました。よくならなかったら病院に行くべきですか？',
     true, '[{"index":0,"color":"var(--primary)"},{"index":2,"color":"var(--primary)"},{"index":4,"color":"var(--primary)"},{"index":5,"color":"var(--primary)"}]', 7),

    ('f1000000-0000-0000-0208-000000000008', 'd0000000-0000-0000-0800-000000000002',
     'DƯỢC SĨ', '薬剤師',
     'Đúng rồi! Nếu hai ngày không đỡ hoặc bị sốt cao thì đến bệnh viện ngay nhé. Chúc bạn mau khỏe!',
     'その通り！2日経っても良くならないか高熱が出たらすぐ病院へ。お大事に！',
     false, NULL, 8),

    -- ── Chapter 8, Lesson 3: Gọi điện thoại khẩn cấp ──
    ('f1000000-0000-0000-0301-000000000008', 'd0000000-0000-0000-0800-000000000003',
     'GIÁO VIÊN', '先生',
     'Ở Việt Nam có 3 số khẩn cấp quan trọng: 113 — Công an, 114 — Cứu hỏa, 115 — Cấp cứu y tế.',
     'ベトナムには3つの重要な緊急番号があります：113 — 警察、114 — 消防、115 — 救急医療。',
     false, NULL, 1),

    ('f1000000-0000-0000-0302-000000000008', 'd0000000-0000-0000-0800-000000000003',
     'BẠN', 'あなた',
     '113 là Công an, 114 là Cứu hỏa, 115 là Cấp cứu. Em nhớ rồi ạ!',
     '113は警察、114は消防、115は救急。覚えました！',
     true, '[{"index":0,"color":"var(--error)"},{"index":3,"color":"var(--error)"},{"index":5,"color":"var(--error)"}]', 2),

    ('f1000000-0000-0000-0303-000000000008', 'd0000000-0000-0000-0800-000000000003',
     'GIÁO VIÊN', '先生',
     'Bây giờ thử gọi 115 nhé. Đầu tiên nói: "Xin hãy giúp tôi!" rồi cho biết địa chỉ.',
     'では115に電話してみよう。まず「助けてください！」と言って、住所を伝えて。',
     false, NULL, 3),

    ('f1000000-0000-0000-0304-000000000008', 'd0000000-0000-0000-0800-000000000003',
     'BẠN', 'あなた',
     'Xin hãy giúp tôi! Có người bị ngất ở đường Trần Hưng Đạo, quận Hoàn Kiếm.',
     '助けてください！トランフンダオ通り、ホアンキエム区で人が倒れています。',
     true, '[{"index":0,"color":"var(--error)"},{"index":1,"color":"var(--error)"},{"index":2,"color":"var(--error)"},{"index":3,"color":"var(--error)"}]', 4),

    ('f1000000-0000-0000-0305-000000000008', 'd0000000-0000-0000-0800-000000000003',
     'TỔNG ĐÀI', 'オペレーター',
     'Vâng, chúng tôi đã ghi nhận. Xe cấp cứu sẽ đến trong 10 phút. Bạn ở ngay đó đợi nhé.',
     'はい、受け付けました。救急車が10分以内に到着します。そこで待っていてください。',
     false, NULL, 5),

    ('f1000000-0000-0000-0306-000000000008', 'd0000000-0000-0000-0800-000000000003',
     'BẠN', 'あなた',
     'Vâng, tôi ở đây đợi. Người bị ngất vẫn đang thở nhưng không tỉnh.',
     'はい、ここで待ちます。倒れた人はまだ呼吸していますが、意識がありません。',
     true, '[{"index":6,"color":"var(--secondary)"},{"index":9,"color":"var(--primary)"},{"index":11,"color":"var(--primary)"}]', 6),

    ('f1000000-0000-0000-0307-000000000008', 'd0000000-0000-0000-0800-000000000003',
     'TỔNG ĐÀI', 'オペレーター',
     'Được rồi. Đừng di chuyển người bệnh. Đội cấp cứu sắp đến. Cảm ơn bạn đã gọi!',
     'わかりました。患者を動かさないでください。救急チームがまもなく到着します。電話ありがとう！',
     false, NULL, 7),

    ('f1000000-0000-0000-0308-000000000008', 'd0000000-0000-0000-0800-000000000003',
     'BẠN', 'あなた',
     'Vâng, tôi không di chuyển người bệnh. Cảm ơn đội cấp cứu! Tôi sẽ đợi ở đây.',
     'はい、患者を動かしません。救急チームに感謝です！ここで待ちます。',
     true, '[{"index":3,"color":"var(--primary)"},{"index":4,"color":"var(--primary)"},{"index":5,"color":"var(--primary)"},{"index":6,"color":"var(--primary)"}]', 8)

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

