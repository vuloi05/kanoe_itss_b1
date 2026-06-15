BEGIN;


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, created_at, updated_at)
VALUES (
    'e10a4b9f-0f4c-4a5a-9dab-eba9084a01dc',
    'partner1@gmail.com',
    '$2a$11$HxVg4DME3wu9J/9V7M5q7uVSm3AoQvKtvvokHgTavkCe1H/6na8Gi', -- 1234567890
    'Phạm Văn Bằng',
    '/avatars/partner_1.png',
    'partner',
    'active',
    NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
    avatar_url = EXCLUDED.avatar_url,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();


INSERT INTO partner_profiles (profile_id, user_id, bio, age_range, job, created_at, updated_at)
VALUES (
    '41bb9b62-f0d5-4cb1-aac5-9153b0494693',
    (SELECT user_id FROM users WHERE email = 'partner1@gmail.com'),
    'Chào bạn, mình rất vui được nói chuyện với các bạn Nhật Bản.',
    '25-30',
    'Kỹ sư CNTT',
    NOW(), NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    updated_at = NOW();


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, created_at, updated_at)
VALUES (
    '456b57ae-ed28-4a44-95e9-2614b4f0b751',
    'partner2@gmail.com',
    '$2a$11$HxVg4DME3wu9J/9V7M5q7uVSm3AoQvKtvvokHgTavkCe1H/6na8Gi', -- 1234567890
    'Lê Thị Hương',
    '/avatars/partner_2.png',
    'partner',
    'active',
    NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
    avatar_url = EXCLUDED.avatar_url,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();


INSERT INTO partner_profiles (profile_id, user_id, bio, age_range, job, created_at, updated_at)
VALUES (
    '690d6245-5314-4f3e-acfc-4ec2b79a2862',
    (SELECT user_id FROM users WHERE email = 'partner2@gmail.com'),
    'Mình đang học tiếng Nhật nên rất muốn giao lưu văn hóa.',
    '22-25',
    'Giáo viên',
    NOW(), NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    updated_at = NOW();


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, created_at, updated_at)
VALUES (
    '06903bbd-3d3d-4843-a73c-1dac59cba9ba',
    'partner3@gmail.com',
    '$2a$11$HxVg4DME3wu9J/9V7M5q7uVSm3AoQvKtvvokHgTavkCe1H/6na8Gi', -- 1234567890
    'Đinh Quang Huy',
    '/avatars/partner_3.png',
    'partner',
    'active',
    NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
    avatar_url = EXCLUDED.avatar_url,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();


INSERT INTO partner_profiles (profile_id, user_id, bio, age_range, job, created_at, updated_at)
VALUES (
    '7bc7d3af-13dc-476d-a26d-cf7cbaca5e9b',
    (SELECT user_id FROM users WHERE email = 'partner3@gmail.com'),
    'Thích thể thao, du lịch và kết bạn mới.',
    '30-35',
    'Nhân viên kinh doanh',
    NOW(), NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    updated_at = NOW();


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, created_at, updated_at)
VALUES (
    '51b10da3-b885-4322-8c65-a22de4afec7a',
    'partner4@gmail.com',
    '$2a$11$HxVg4DME3wu9J/9V7M5q7uVSm3AoQvKtvvokHgTavkCe1H/6na8Gi', -- 1234567890
    'Hoàng Lan Anh',
    '/avatars/partner_4.png',
    'partner',
    'active',
    NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
    avatar_url = EXCLUDED.avatar_url,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();


INSERT INTO partner_profiles (profile_id, user_id, bio, age_range, job, created_at, updated_at)
VALUES (
    '7bc08726-bfd8-4e0f-8a25-0ec6e4bde5e5',
    (SELECT user_id FROM users WHERE email = 'partner4@gmail.com'),
    'Rất mong được chia sẻ về cuộc sống ở Hà Nội với bạn.',
    '18-24',
    'Sinh viên',
    NOW(), NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    updated_at = NOW();


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, created_at, updated_at)
VALUES (
    'a8a1c5a7-96cb-474a-93f9-dbbb321eb9fb',
    'partner5@gmail.com',
    '$2a$11$HxVg4DME3wu9J/9V7M5q7uVSm3AoQvKtvvokHgTavkCe1H/6na8Gi', -- 1234567890
    'Ngô Thế Ngọc',
    '/avatars/partner_5.png',
    'partner',
    'active',
    NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
    avatar_url = EXCLUDED.avatar_url,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();


INSERT INTO partner_profiles (profile_id, user_id, bio, age_range, job, created_at, updated_at)
VALUES (
    'f6a1e74b-70cb-49e0-b54a-d9d22ec9903e',
    (SELECT user_id FROM users WHERE email = 'partner5@gmail.com'),
    'Mình là một lập trình viên yêu thích manga.',
    '25-30',
    'Lập trình viên',
    NOW(), NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    updated_at = NOW();


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, created_at, updated_at)
VALUES (
    '443bf45b-8068-4ed0-87f1-400ea9c9335c',
    'partner6@gmail.com',
    '$2a$11$HxVg4DME3wu9J/9V7M5q7uVSm3AoQvKtvvokHgTavkCe1H/6na8Gi', -- 1234567890
    'Vũ Thị Thảo',
    '/avatars/partner_6.png',
    'partner',
    'active',
    NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
    avatar_url = EXCLUDED.avatar_url,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();


INSERT INTO partner_profiles (profile_id, user_id, bio, age_range, job, created_at, updated_at)
VALUES (
    '8981c420-793a-45ad-86a9-2ff17c936ebf',
    (SELECT user_id FROM users WHERE email = 'partner6@gmail.com'),
    'Sở thích là đọc sách và xem phim.',
    '22-25',
    'Kế toán',
    NOW(), NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    updated_at = NOW();


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, created_at, updated_at)
VALUES (
    '61581824-3420-4b03-ace4-8e6c55f33586',
    'partner7@gmail.com',
    '$2a$11$HxVg4DME3wu9J/9V7M5q7uVSm3AoQvKtvvokHgTavkCe1H/6na8Gi', -- 1234567890
    'Bùi Quốc Bảo',
    '/avatars/partner_7.png',
    'partner',
    'active',
    NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
    avatar_url = EXCLUDED.avatar_url,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();


INSERT INTO partner_profiles (profile_id, user_id, bio, age_range, job, created_at, updated_at)
VALUES (
    '706ab64e-b6ad-4c30-a884-07db5d7a61dc',
    (SELECT user_id FROM users WHERE email = 'partner7@gmail.com'),
    'Chào các bạn, cùng nhau luyện tiếng Việt nhé!',
    '25-30',
    'Thiết kế đồ họa',
    NOW(), NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    updated_at = NOW();


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, created_at, updated_at)
VALUES (
    'f3594cf9-c7df-4bcc-a769-9dd2555b3919',
    'partner8@gmail.com',
    '$2a$11$HxVg4DME3wu9J/9V7M5q7uVSm3AoQvKtvvokHgTavkCe1H/6na8Gi', -- 1234567890
    'Đỗ Bích Ngọc',
    '/avatars/partner_8.png',
    'partner',
    'active',
    NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
    avatar_url = EXCLUDED.avatar_url,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();


INSERT INTO partner_profiles (profile_id, user_id, bio, age_range, job, created_at, updated_at)
VALUES (
    '7ab6e1ce-99c9-43e7-a233-8ebdfbc0e9b8',
    (SELECT user_id FROM users WHERE email = 'partner8@gmail.com'),
    'Mình là dân văn phòng, rảnh rỗi muốn trau dồi ngoại ngữ.',
    '25-30',
    'Marketing',
    NOW(), NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    updated_at = NOW();


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, created_at, updated_at)
VALUES (
    '5edce73c-2f12-4bab-b5b6-f0c596eb2a73',
    'partner9@gmail.com',
    '$2a$11$HxVg4DME3wu9J/9V7M5q7uVSm3AoQvKtvvokHgTavkCe1H/6na8Gi', -- 1234567890
    'Trương Đình Phong',
    '/avatars/partner_9.png',
    'partner',
    'active',
    NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
    avatar_url = EXCLUDED.avatar_url,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();


INSERT INTO partner_profiles (profile_id, user_id, bio, age_range, job, created_at, updated_at)
VALUES (
    '79bc4b3e-febb-4997-b137-1e7654cb45e1',
    (SELECT user_id FROM users WHERE email = 'partner9@gmail.com'),
    'Đam mê du lịch và ẩm thực Việt Nam.',
    '25-30',
    'Quản lý nhân sự',
    NOW(), NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    updated_at = NOW();


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, created_at, updated_at)
VALUES (
    '20f6f1f5-f17c-46b5-afbd-2e42934415a5',
    'partner10@gmail.com',
    '$2a$11$HxVg4DME3wu9J/9V7M5q7uVSm3AoQvKtvvokHgTavkCe1H/6na8Gi', -- 1234567890
    'Lý Thu Thủy',
    '/avatars/partner_10.png',
    'partner',
    'active',
    NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
    avatar_url = EXCLUDED.avatar_url,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();


INSERT INTO partner_profiles (profile_id, user_id, bio, age_range, job, created_at, updated_at)
VALUES (
    '69233c1c-e15b-4dda-99b1-f56600a67cd8',
    (SELECT user_id FROM users WHERE email = 'partner10@gmail.com'),
    'Tôi đã có kinh nghiệm dạy tiếng Việt 3 năm.',
    '31-40',
    'Nhân viên ngân hàng',
    NOW(), NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    updated_at = NOW();


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, created_at, updated_at)
VALUES (
    'bdce8017-0f7a-46de-a60c-18818e8fa507',
    'partner11@gmail.com',
    '$2a$11$HxVg4DME3wu9J/9V7M5q7uVSm3AoQvKtvvokHgTavkCe1H/6na8Gi', -- 1234567890
    'Phan Tuấn Kiệt',
    '/avatars/partner_11.png',
    'partner',
    'active',
    NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
    avatar_url = EXCLUDED.avatar_url,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();


INSERT INTO partner_profiles (profile_id, user_id, bio, age_range, job, created_at, updated_at)
VALUES (
    '10d8ad45-8d44-4616-8e73-cdd391530e5c',
    (SELECT user_id FROM users WHERE email = 'partner11@gmail.com'),
    'Rất mong được làm quen với mọi người.',
    '31-40',
    'Kiến trúc sư',
    NOW(), NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    updated_at = NOW();


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, created_at, updated_at)
VALUES (
    'd48b4714-3900-4abb-a9d0-49116a8723c0',
    'partner12@gmail.com',
    '$2a$11$HxVg4DME3wu9J/9V7M5q7uVSm3AoQvKtvvokHgTavkCe1H/6na8Gi', -- 1234567890
    'Phạm Mai Phương',
    '/avatars/partner_12.png',
    'partner',
    'active',
    NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
    avatar_url = EXCLUDED.avatar_url,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();


INSERT INTO partner_profiles (profile_id, user_id, bio, age_range, job, created_at, updated_at)
VALUES (
    'b4cb6b29-c5fe-47dc-9f2c-11aca869aed7',
    (SELECT user_id FROM users WHERE email = 'partner12@gmail.com'),
    'Tôi có thể giúp bạn sửa phát âm chuẩn miền Bắc.',
    '18-24',
    'Dược sĩ',
    NOW(), NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    updated_at = NOW();


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, created_at, updated_at)
VALUES (
    'b810d714-2928-406c-805e-1f8d83d9b2a5',
    'partner13@gmail.com',
    '$2a$11$HxVg4DME3wu9J/9V7M5q7uVSm3AoQvKtvvokHgTavkCe1H/6na8Gi', -- 1234567890
    'Đặng Hữu Trí',
    '/avatars/partner_13.png',
    'partner',
    'active',
    NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
    avatar_url = EXCLUDED.avatar_url,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();


INSERT INTO partner_profiles (profile_id, user_id, bio, age_range, job, created_at, updated_at)
VALUES (
    'e1a5cc2d-d627-4428-a799-12f57ca326f4',
    (SELECT user_id FROM users WHERE email = 'partner13@gmail.com'),
    'Mình đam mê kinh doanh, công nghệ.',
    '25-30',
    'Bác sĩ',
    NOW(), NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    updated_at = NOW();


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, created_at, updated_at)
VALUES (
    '34624260-25db-4d82-a1a6-75ad44d833a7',
    'partner14@gmail.com',
    '$2a$11$HxVg4DME3wu9J/9V7M5q7uVSm3AoQvKtvvokHgTavkCe1H/6na8Gi', -- 1234567890
    'Lâm Mỹ Hạnh',
    '/avatars/partner_14.png',
    'partner',
    'active',
    NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
    avatar_url = EXCLUDED.avatar_url,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();


INSERT INTO partner_profiles (profile_id, user_id, bio, age_range, job, created_at, updated_at)
VALUES (
    'd09f4ddd-e2de-40e1-886f-461bd42e2b4d',
    (SELECT user_id FROM users WHERE email = 'partner14@gmail.com'),
    'Rất sẵn lòng giúp đỡ người mới học tiếng Việt.',
    '25-30',
    'Biên dịch viên',
    NOW(), NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    updated_at = NOW();


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, created_at, updated_at)
VALUES (
    '15138440-2582-45d5-acd3-3d58d26a3c37',
    'partner15@gmail.com',
    '$2a$11$HxVg4DME3wu9J/9V7M5q7uVSm3AoQvKtvvokHgTavkCe1H/6na8Gi', -- 1234567890
    'Trần Thanh Tùng',
    '/avatars/partner_15.png',
    'partner',
    'active',
    NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
    avatar_url = EXCLUDED.avatar_url,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();


INSERT INTO partner_profiles (profile_id, user_id, bio, age_range, job, created_at, updated_at)
VALUES (
    'c5f10728-e09d-4d3b-b6a6-172f732c8ccc',
    (SELECT user_id FROM users WHERE email = 'partner15@gmail.com'),
    'Thích hát, chơi guitar. Chào mọi người!',
    '25-30',
    'Phiên dịch viên',
    NOW(), NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    updated_at = NOW();


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, created_at, updated_at)
VALUES (
    '598ad26a-0290-4e01-bfea-609df7ff6617',
    'partner16@gmail.com',
    '$2a$11$HxVg4DME3wu9J/9V7M5q7uVSm3AoQvKtvvokHgTavkCe1H/6na8Gi', -- 1234567890
    'Nguyễn Thùy Linh',
    '/avatars/partner_16.png',
    'partner',
    'active',
    NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
    avatar_url = EXCLUDED.avatar_url,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();


INSERT INTO partner_profiles (profile_id, user_id, bio, age_range, job, created_at, updated_at)
VALUES (
    '498b9581-8bb1-44dd-8d9a-2764fa7e00ff',
    (SELECT user_id FROM users WHERE email = 'partner16@gmail.com'),
    'Sinh viên năm 3 đại học Hà Nội, muốn tìm bạn trao đổi ngôn ngữ.',
    '22-25',
    'Nhân viên văn phòng',
    NOW(), NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    updated_at = NOW();


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, created_at, updated_at)
VALUES (
    'a06443b1-b9c9-4283-8693-ba104a2060a9',
    'partner17@gmail.com',
    '$2a$11$HxVg4DME3wu9J/9V7M5q7uVSm3AoQvKtvvokHgTavkCe1H/6na8Gi', -- 1234567890
    'Lê Minh Hoàng',
    '/avatars/partner_17.png',
    'partner',
    'active',
    NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
    avatar_url = EXCLUDED.avatar_url,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();


INSERT INTO partner_profiles (profile_id, user_id, bio, age_range, job, created_at, updated_at)
VALUES (
    '5e063497-7c70-420a-98c4-9573b69641f7',
    (SELECT user_id FROM users WHERE email = 'partner17@gmail.com'),
    'Mình đang muốn mở rộng mối quan hệ.',
    '22-25',
    'Nhiếp ảnh gia',
    NOW(), NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    updated_at = NOW();


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, created_at, updated_at)
VALUES (
    'c54e5f07-2368-43d1-9723-7181e89cb523',
    'partner18@gmail.com',
    '$2a$11$HxVg4DME3wu9J/9V7M5q7uVSm3AoQvKtvvokHgTavkCe1H/6na8Gi', -- 1234567890
    'Phạm Bích Trâm',
    '/avatars/partner_18.png',
    'partner',
    'active',
    NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
    avatar_url = EXCLUDED.avatar_url,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();


INSERT INTO partner_profiles (profile_id, user_id, bio, age_range, job, created_at, updated_at)
VALUES (
    '1b954cfb-8057-4539-a1e8-72cecf1e8baf',
    (SELECT user_id FROM users WHERE email = 'partner18@gmail.com'),
    'Mong được kết bạn và trò chuyện vui vẻ.',
    '25-30',
    'Sinh viên',
    NOW(), NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    updated_at = NOW();


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, created_at, updated_at)
VALUES (
    '0e7cf7e4-70f7-4588-8a84-903e7be224fe',
    'partner19@gmail.com',
    '$2a$11$HxVg4DME3wu9J/9V7M5q7uVSm3AoQvKtvvokHgTavkCe1H/6na8Gi', -- 1234567890
    'Võ Văn Cường',
    '/avatars/partner_19.png',
    'partner',
    'active',
    NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
    avatar_url = EXCLUDED.avatar_url,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();


INSERT INTO partner_profiles (profile_id, user_id, bio, age_range, job, created_at, updated_at)
VALUES (
    '5b4a2b4d-06ca-4a42-b01a-9a628ba24b0e',
    (SELECT user_id FROM users WHERE email = 'partner19@gmail.com'),
    'Đừng ngại liên hệ mình để luyện giao tiếp nha.',
    '31-40',
    'Hướng dẫn viên',
    NOW(), NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    updated_at = NOW();


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, created_at, updated_at)
VALUES (
    '837ef162-a2c0-4707-9b01-330a8a3565b1',
    'partner20@gmail.com',
    '$2a$11$HxVg4DME3wu9J/9V7M5q7uVSm3AoQvKtvvokHgTavkCe1H/6na8Gi', -- 1234567890
    'Trần Ngọc Trâm',
    '/avatars/partner_20.png',
    'partner',
    'active',
    NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
    avatar_url = EXCLUDED.avatar_url,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();


INSERT INTO partner_profiles (profile_id, user_id, bio, age_range, job, created_at, updated_at)
VALUES (
    '587e6f7c-899e-4f3d-b12f-8a69a7b9a125',
    (SELECT user_id FROM users WHERE email = 'partner20@gmail.com'),
    'Xin chào! Cùng nhau học tập nhé.',
    '25-30',
    'Tự do',
    NOW(), NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    updated_at = NOW();

COMMIT;
