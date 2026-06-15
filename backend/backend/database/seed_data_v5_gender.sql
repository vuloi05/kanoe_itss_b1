-- -------------------------------------------------------------
-- FIXED SEED SCRIPT: 20 PARTNERS (11 Males, 9 Females) WITH GENDER
-- -------------------------------------------------------------


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, is_online, last_seen, created_at, updated_at)
VALUES (
    'e34e3ecf-0bec-4ab4-a92f-4778ee845e18', 
    'partner_m_7@vietimmerse.com', 
    '$2a$11$92T3r7uLzR3K8Jp.2YtPueYm4bO6sZ3qD2q3pL2D3X1eFq.E8rR7i', 
    'Nguyễn Đức Trọng', 
    '/avatars/partner_13.png', 
    'partner', 
    'active', 
    false, 
    NOW() - interval '15 hours', 
    NOW(), 
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    is_online = EXCLUDED.is_online,
    last_seen = EXCLUDED.last_seen;


INSERT INTO partner_profiles (user_id, bio, rating_avg, rating_count, hourly_rate, specialties, age_range, job, gender, created_at, updated_at)
VALUES (
    (SELECT user_id FROM users WHERE email = 'partner_m_7@vietimmerse.com'),
    'Thích thể thao, du lịch và kết bạn mới.',
    4.86,
    110,
    100,
    ARRAY['Giao tiếp hàng ngày','Kinh doanh']::text[],
    '22-25',
    'Luật sư',
    'male',
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    gender = EXCLUDED.gender,
    specialties = EXCLUDED.specialties;


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, is_online, last_seen, created_at, updated_at)
VALUES (
    '687acbcb-0f97-410d-b0a3-5f729f2b4c9c', 
    'partner_f_2@vietimmerse.com', 
    '$2a$11$92T3r7uLzR3K8Jp.2YtPueYm4bO6sZ3qD2q3pL2D3X1eFq.E8rR7i', 
    'Hoàng Lan Anh', 
    '/avatars/partner_4.png', 
    'partner', 
    'active', 
    true, 
    NOW(), 
    NOW(), 
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    is_online = EXCLUDED.is_online,
    last_seen = EXCLUDED.last_seen;


INSERT INTO partner_profiles (user_id, bio, rating_avg, rating_count, hourly_rate, specialties, age_range, job, gender, created_at, updated_at)
VALUES (
    (SELECT user_id FROM users WHERE email = 'partner_f_2@vietimmerse.com'),
    'Xin chào, cùng nhau học ngôn ngữ và kết bạn nhé!',
    4.87,
    140,
    100,
    ARRAY['Kinh doanh','Du lịch','Ẩm thực','Tiếng Việt công sở']::text[],
    '35+',
    'Đầu bếp',
    'female',
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    gender = EXCLUDED.gender,
    specialties = EXCLUDED.specialties;


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, is_online, last_seen, created_at, updated_at)
VALUES (
    '350c2860-1d36-4a70-b09b-fb1b744d6549', 
    'partner_m_11@vietimmerse.com', 
    '$2a$11$92T3r7uLzR3K8Jp.2YtPueYm4bO6sZ3qD2q3pL2D3X1eFq.E8rR7i', 
    'Trịnh Quang Vinh', 
    '/avatars/partner_20.png', 
    'partner', 
    'active', 
    true, 
    NOW(), 
    NOW(), 
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    is_online = EXCLUDED.is_online,
    last_seen = EXCLUDED.last_seen;


INSERT INTO partner_profiles (user_id, bio, rating_avg, rating_count, hourly_rate, specialties, age_range, job, gender, created_at, updated_at)
VALUES (
    (SELECT user_id FROM users WHERE email = 'partner_m_11@vietimmerse.com'),
    'Rất vui được làm quen, mình có kinh nghiệm sống ở nước ngoài.',
    4.88,
    19,
    100,
    ARRAY['Kinh doanh','Tiếng Việt công sở','Thảo luận tự do']::text[],
    '22-25',
    'Giáo viên',
    'male',
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    gender = EXCLUDED.gender,
    specialties = EXCLUDED.specialties;


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, is_online, last_seen, created_at, updated_at)
VALUES (
    '2fa61920-21f6-4892-b67d-5cb0dd0a46ff', 
    'partner_f_7@vietimmerse.com', 
    '$2a$11$92T3r7uLzR3K8Jp.2YtPueYm4bO6sZ3qD2q3pL2D3X1eFq.E8rR7i', 
    'Trần Ngọc Cẩm', 
    '/avatars/partner_14.png', 
    'partner', 
    'active', 
    true, 
    NOW(), 
    NOW(), 
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    is_online = EXCLUDED.is_online,
    last_seen = EXCLUDED.last_seen;


INSERT INTO partner_profiles (user_id, bio, rating_avg, rating_count, hourly_rate, specialties, age_range, job, gender, created_at, updated_at)
VALUES (
    (SELECT user_id FROM users WHERE email = 'partner_f_7@vietimmerse.com'),
    'Xin chào, cùng nhau học ngôn ngữ và kết bạn nhé!',
    4.92,
    58,
    100,
    ARRAY['Giao tiếp hàng ngày','Tiếng Việt công sở','Văn hóa Việt Nam']::text[],
    '22-25',
    'Giáo viên',
    'female',
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    gender = EXCLUDED.gender,
    specialties = EXCLUDED.specialties;


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, is_online, last_seen, created_at, updated_at)
VALUES (
    'c02729e5-0b2d-44b3-9995-7fdf49a911fe', 
    'partner_m_1@vietimmerse.com', 
    '$2a$11$92T3r7uLzR3K8Jp.2YtPueYm4bO6sZ3qD2q3pL2D3X1eFq.E8rR7i', 
    'Phạm Văn Bằng', 
    '/avatars/partner_1.png', 
    'partner', 
    'active', 
    true, 
    NOW(), 
    NOW(), 
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    is_online = EXCLUDED.is_online,
    last_seen = EXCLUDED.last_seen;


INSERT INTO partner_profiles (user_id, bio, rating_avg, rating_count, hourly_rate, specialties, age_range, job, gender, created_at, updated_at)
VALUES (
    (SELECT user_id FROM users WHERE email = 'partner_m_1@vietimmerse.com'),
    'Xin chào, cùng nhau học ngôn ngữ và kết bạn nhé!',
    4.62,
    90,
    100,
    ARRAY['Kinh doanh','Giao tiếp hàng ngày','Ẩm thực']::text[],
    '22-25',
    'Freelancer',
    'male',
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    gender = EXCLUDED.gender,
    specialties = EXCLUDED.specialties;


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, is_online, last_seen, created_at, updated_at)
VALUES (
    '62da534d-bd26-46f1-ab84-fe462bc9aaca', 
    'partner_m_2@vietimmerse.com', 
    '$2a$11$92T3r7uLzR3K8Jp.2YtPueYm4bO6sZ3qD2q3pL2D3X1eFq.E8rR7i', 
    'Đặng Hữu Trí', 
    '/avatars/partner_3.png', 
    'partner', 
    'active', 
    false, 
    NOW() - interval '22 hours', 
    NOW(), 
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    is_online = EXCLUDED.is_online,
    last_seen = EXCLUDED.last_seen;


INSERT INTO partner_profiles (user_id, bio, rating_avg, rating_count, hourly_rate, specialties, age_range, job, gender, created_at, updated_at)
VALUES (
    (SELECT user_id FROM users WHERE email = 'partner_m_2@vietimmerse.com'),
    'Mình đam mê kinh doanh, công nghệ.',
    4.74,
    110,
    100,
    ARRAY['Du lịch','Văn hóa Việt Nam']::text[],
    '18-22',
    'Nhân viên kinh doanh',
    'male',
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    gender = EXCLUDED.gender,
    specialties = EXCLUDED.specialties;


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, is_online, last_seen, created_at, updated_at)
VALUES (
    '3630848c-df64-4991-9574-37c57cc1ff76', 
    'partner_m_4@vietimmerse.com', 
    '$2a$11$92T3r7uLzR3K8Jp.2YtPueYm4bO6sZ3qD2q3pL2D3X1eFq.E8rR7i', 
    'Ngô Thế Ngọc', 
    '/avatars/partner_7.png', 
    'partner', 
    'active', 
    true, 
    NOW(), 
    NOW(), 
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    is_online = EXCLUDED.is_online,
    last_seen = EXCLUDED.last_seen;


INSERT INTO partner_profiles (user_id, bio, rating_avg, rating_count, hourly_rate, specialties, age_range, job, gender, created_at, updated_at)
VALUES (
    (SELECT user_id FROM users WHERE email = 'partner_m_4@vietimmerse.com'),
    'Mình đang học tiếng Nhật nên rất muốn giao lưu văn hóa.',
    4.86,
    106,
    100,
    ARRAY['Kinh doanh','Thảo luận tự do','Tiếng Việt công sở','Ẩm thực']::text[],
    '30-35',
    'Nhân viên kinh doanh',
    'male',
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    gender = EXCLUDED.gender,
    specialties = EXCLUDED.specialties;


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, is_online, last_seen, created_at, updated_at)
VALUES (
    '927d3bb1-8952-4153-ad72-093435fd991f', 
    'partner_m_8@vietimmerse.com', 
    '$2a$11$92T3r7uLzR3K8Jp.2YtPueYm4bO6sZ3qD2q3pL2D3X1eFq.E8rR7i', 
    'Trần Nhật Cường', 
    '/avatars/partner_15.png', 
    'partner', 
    'active', 
    true, 
    NOW(), 
    NOW(), 
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    is_online = EXCLUDED.is_online,
    last_seen = EXCLUDED.last_seen;


INSERT INTO partner_profiles (user_id, bio, rating_avg, rating_count, hourly_rate, specialties, age_range, job, gender, created_at, updated_at)
VALUES (
    (SELECT user_id FROM users WHERE email = 'partner_m_8@vietimmerse.com'),
    'Thường xuyên xem anime, muốn trau dồi khả năng giao tiếp.',
    4.63,
    58,
    100,
    ARRAY['Tiếng Việt công sở','Thảo luận tự do']::text[],
    '18-22',
    'Bác sĩ',
    'male',
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    gender = EXCLUDED.gender,
    specialties = EXCLUDED.specialties;


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, is_online, last_seen, created_at, updated_at)
VALUES (
    'fdde2802-410a-47df-9570-d78b2f88288d', 
    'partner_m_10@vietimmerse.com', 
    '$2a$11$92T3r7uLzR3K8Jp.2YtPueYm4bO6sZ3qD2q3pL2D3X1eFq.E8rR7i', 
    'Phan Tuấn Kiệt', 
    '/avatars/partner_18.png', 
    'partner', 
    'active', 
    false, 
    NOW() - interval '42 hours', 
    NOW(), 
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    is_online = EXCLUDED.is_online,
    last_seen = EXCLUDED.last_seen;


INSERT INTO partner_profiles (user_id, bio, rating_avg, rating_count, hourly_rate, specialties, age_range, job, gender, created_at, updated_at)
VALUES (
    (SELECT user_id FROM users WHERE email = 'partner_m_10@vietimmerse.com'),
    'Chào bạn, mình rất vui được nói chuyện với các bạn Nhật Bản.',
    4.95,
    96,
    100,
    ARRAY['Tiếng Việt công sở','Giao tiếp hàng ngày','Thảo luận tự do']::text[],
    '22-25',
    'Nhà thiết kế',
    'male',
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    gender = EXCLUDED.gender,
    specialties = EXCLUDED.specialties;


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, is_online, last_seen, created_at, updated_at)
VALUES (
    'e5480121-d4f2-479e-878b-ed2870d34e27', 
    'partner_f_8@vietimmerse.com', 
    '$2a$11$92T3r7uLzR3K8Jp.2YtPueYm4bO6sZ3qD2q3pL2D3X1eFq.E8rR7i', 
    'Hồ Nhật Linh', 
    '/avatars/partner_16.png', 
    'partner', 
    'active', 
    true, 
    NOW(), 
    NOW(), 
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    is_online = EXCLUDED.is_online,
    last_seen = EXCLUDED.last_seen;


INSERT INTO partner_profiles (user_id, bio, rating_avg, rating_count, hourly_rate, specialties, age_range, job, gender, created_at, updated_at)
VALUES (
    (SELECT user_id FROM users WHERE email = 'partner_f_8@vietimmerse.com'),
    'Mong muốn chia sẻ về cuộc sống và công việc tại Việt Nam.',
    4.61,
    115,
    100,
    ARRAY['Du lịch','Giao tiếp hàng ngày']::text[],
    '22-25',
    'Kế toán',
    'female',
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    gender = EXCLUDED.gender,
    specialties = EXCLUDED.specialties;


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, is_online, last_seen, created_at, updated_at)
VALUES (
    '0395a40d-d9fb-4d4b-97bb-033156904ab6', 
    'partner_f_6@vietimmerse.com', 
    '$2a$11$92T3r7uLzR3K8Jp.2YtPueYm4bO6sZ3qD2q3pL2D3X1eFq.E8rR7i', 
    'Bùi Ngọc Trâm', 
    '/avatars/partner_12.png', 
    'partner', 
    'active', 
    true, 
    NOW(), 
    NOW(), 
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    is_online = EXCLUDED.is_online,
    last_seen = EXCLUDED.last_seen;


INSERT INTO partner_profiles (user_id, bio, rating_avg, rating_count, hourly_rate, specialties, age_range, job, gender, created_at, updated_at)
VALUES (
    (SELECT user_id FROM users WHERE email = 'partner_f_6@vietimmerse.com'),
    'Xin chào, cùng nhau học ngôn ngữ và kết bạn nhé!',
    4.54,
    103,
    100,
    ARRAY['Giao tiếp hàng ngày','Du lịch']::text[],
    '30-35',
    'Bác sĩ',
    'female',
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    gender = EXCLUDED.gender,
    specialties = EXCLUDED.specialties;


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, is_online, last_seen, created_at, updated_at)
VALUES (
    '00bd1250-d872-4291-8db5-e5850ddf4a50', 
    'partner_f_1@vietimmerse.com', 
    '$2a$11$92T3r7uLzR3K8Jp.2YtPueYm4bO6sZ3qD2q3pL2D3X1eFq.E8rR7i', 
    'Lê Thị Hương', 
    '/avatars/partner_2.png', 
    'partner', 
    'active', 
    false, 
    NOW() - interval '39 hours', 
    NOW(), 
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    is_online = EXCLUDED.is_online,
    last_seen = EXCLUDED.last_seen;


INSERT INTO partner_profiles (user_id, bio, rating_avg, rating_count, hourly_rate, specialties, age_range, job, gender, created_at, updated_at)
VALUES (
    (SELECT user_id FROM users WHERE email = 'partner_f_1@vietimmerse.com'),
    'Yêu thích nhiếp ảnh và nghệ thuật, muốn kết nối bốn phương.',
    4.96,
    13,
    100,
    ARRAY['Ẩm thực','Du lịch','Văn hóa Việt Nam','Giao tiếp hàng ngày']::text[],
    '25-30',
    'Doanh nhân',
    'female',
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    gender = EXCLUDED.gender,
    specialties = EXCLUDED.specialties;


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, is_online, last_seen, created_at, updated_at)
VALUES (
    'b2de8e3a-af70-40fb-8599-5a7bd60c87e3', 
    'partner_f_4@vietimmerse.com', 
    '$2a$11$92T3r7uLzR3K8Jp.2YtPueYm4bO6sZ3qD2q3pL2D3X1eFq.E8rR7i', 
    'Nguyễn Phương Thúy', 
    '/avatars/partner_8.png', 
    'partner', 
    'active', 
    false, 
    NOW() - interval '33 hours', 
    NOW(), 
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    is_online = EXCLUDED.is_online,
    last_seen = EXCLUDED.last_seen;


INSERT INTO partner_profiles (user_id, bio, rating_avg, rating_count, hourly_rate, specialties, age_range, job, gender, created_at, updated_at)
VALUES (
    (SELECT user_id FROM users WHERE email = 'partner_f_4@vietimmerse.com'),
    'Xin chào, cùng nhau học ngôn ngữ và kết bạn nhé!',
    4.86,
    45,
    100,
    ARRAY['Du lịch','Kinh doanh','Văn hóa Việt Nam','Giao tiếp hàng ngày']::text[],
    '35+',
    'Bác sĩ',
    'female',
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    gender = EXCLUDED.gender,
    specialties = EXCLUDED.specialties;


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, is_online, last_seen, created_at, updated_at)
VALUES (
    '8a52b32d-caf9-4353-9759-30ece7bbd69f', 
    'partner_m_6@vietimmerse.com', 
    '$2a$11$92T3r7uLzR3K8Jp.2YtPueYm4bO6sZ3qD2q3pL2D3X1eFq.E8rR7i', 
    'Lê Hoàng Minh', 
    '/avatars/partner_11.png', 
    'partner', 
    'active', 
    true, 
    NOW(), 
    NOW(), 
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    is_online = EXCLUDED.is_online,
    last_seen = EXCLUDED.last_seen;


INSERT INTO partner_profiles (user_id, bio, rating_avg, rating_count, hourly_rate, specialties, age_range, job, gender, created_at, updated_at)
VALUES (
    (SELECT user_id FROM users WHERE email = 'partner_m_6@vietimmerse.com'),
    'Thích thể thao, du lịch và kết bạn mới.',
    4.65,
    148,
    100,
    ARRAY['Tiếng Việt công sở','Thảo luận tự do']::text[],
    '22-25',
    'Kế toán',
    'male',
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    gender = EXCLUDED.gender,
    specialties = EXCLUDED.specialties;


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, is_online, last_seen, created_at, updated_at)
VALUES (
    'db035c13-dbba-4748-8c8c-d5934dd7de16', 
    'partner_f_5@vietimmerse.com', 
    '$2a$11$92T3r7uLzR3K8Jp.2YtPueYm4bO6sZ3qD2q3pL2D3X1eFq.E8rR7i', 
    'Đặng Mai Khanh', 
    '/avatars/partner_10.png', 
    'partner', 
    'active', 
    false, 
    NOW() - interval '40 hours', 
    NOW(), 
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    is_online = EXCLUDED.is_online,
    last_seen = EXCLUDED.last_seen;


INSERT INTO partner_profiles (user_id, bio, rating_avg, rating_count, hourly_rate, specialties, age_range, job, gender, created_at, updated_at)
VALUES (
    (SELECT user_id FROM users WHERE email = 'partner_f_5@vietimmerse.com'),
    'Mong muốn chia sẻ về cuộc sống và công việc tại Việt Nam.',
    4.75,
    21,
    100,
    ARRAY['Kinh doanh','Du lịch','Giao tiếp hàng ngày']::text[],
    '30-35',
    'Kiến trúc sư',
    'female',
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    gender = EXCLUDED.gender,
    specialties = EXCLUDED.specialties;


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, is_online, last_seen, created_at, updated_at)
VALUES (
    '9723c97a-998b-4829-a996-5488387b9b68', 
    'partner_f_3@vietimmerse.com', 
    '$2a$11$92T3r7uLzR3K8Jp.2YtPueYm4bO6sZ3qD2q3pL2D3X1eFq.E8rR7i', 
    'Vũ Thị Thảo', 
    '/avatars/partner_6.png', 
    'partner', 
    'active', 
    true, 
    NOW(), 
    NOW(), 
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    is_online = EXCLUDED.is_online,
    last_seen = EXCLUDED.last_seen;


INSERT INTO partner_profiles (user_id, bio, rating_avg, rating_count, hourly_rate, specialties, age_range, job, gender, created_at, updated_at)
VALUES (
    (SELECT user_id FROM users WHERE email = 'partner_f_3@vietimmerse.com'),
    'Yêu thích nhiếp ảnh và nghệ thuật, muốn kết nối bốn phương.',
    4.55,
    123,
    100,
    ARRAY['Kinh doanh','Tiếng Việt công sở','Ẩm thực','Thảo luận tự do']::text[],
    '22-25',
    'Bác sĩ',
    'female',
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    gender = EXCLUDED.gender,
    specialties = EXCLUDED.specialties;


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, is_online, last_seen, created_at, updated_at)
VALUES (
    'cec2e399-4a1a-40cb-b0c7-c0e325e64f74', 
    'partner_m_5@vietimmerse.com', 
    '$2a$11$92T3r7uLzR3K8Jp.2YtPueYm4bO6sZ3qD2q3pL2D3X1eFq.E8rR7i', 
    'Bùi Quốc Bảo', 
    '/avatars/partner_9.png', 
    'partner', 
    'active', 
    false, 
    NOW() - interval '8 hours', 
    NOW(), 
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    is_online = EXCLUDED.is_online,
    last_seen = EXCLUDED.last_seen;


INSERT INTO partner_profiles (user_id, bio, rating_avg, rating_count, hourly_rate, specialties, age_range, job, gender, created_at, updated_at)
VALUES (
    (SELECT user_id FROM users WHERE email = 'partner_m_5@vietimmerse.com'),
    'Rất vui được làm quen, mình có kinh nghiệm sống ở nước ngoài.',
    4.78,
    86,
    100,
    ARRAY['Giao tiếp hàng ngày','Ẩm thực','Văn hóa Việt Nam','Thảo luận tự do']::text[],
    '30-35',
    'Sinh viên',
    'male',
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    gender = EXCLUDED.gender,
    specialties = EXCLUDED.specialties;


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, is_online, last_seen, created_at, updated_at)
VALUES (
    'f9925780-0de6-4216-bc02-3570ac1f3b64', 
    'partner_m_3@vietimmerse.com', 
    '$2a$11$92T3r7uLzR3K8Jp.2YtPueYm4bO6sZ3qD2q3pL2D3X1eFq.E8rR7i', 
    'Đinh Quang Huy', 
    '/avatars/partner_5.png', 
    'partner', 
    'active', 
    false, 
    NOW() - interval '28 hours', 
    NOW(), 
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    is_online = EXCLUDED.is_online,
    last_seen = EXCLUDED.last_seen;


INSERT INTO partner_profiles (user_id, bio, rating_avg, rating_count, hourly_rate, specialties, age_range, job, gender, created_at, updated_at)
VALUES (
    (SELECT user_id FROM users WHERE email = 'partner_m_3@vietimmerse.com'),
    'Mình đang học tiếng Nhật nên rất muốn giao lưu văn hóa.',
    4.97,
    49,
    100,
    ARRAY['Ẩm thực','Văn hóa Việt Nam']::text[],
    '25-30',
    'Doanh nhân',
    'male',
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    gender = EXCLUDED.gender,
    specialties = EXCLUDED.specialties;


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, is_online, last_seen, created_at, updated_at)
VALUES (
    '2408d26e-53a5-4a06-9aae-f042ffe21532', 
    'partner_m_9@vietimmerse.com', 
    '$2a$11$92T3r7uLzR3K8Jp.2YtPueYm4bO6sZ3qD2q3pL2D3X1eFq.E8rR7i', 
    'Vũ Hải Đăng', 
    '/avatars/partner_17.png', 
    'partner', 
    'active', 
    false, 
    NOW() - interval '46 hours', 
    NOW(), 
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    is_online = EXCLUDED.is_online,
    last_seen = EXCLUDED.last_seen;


INSERT INTO partner_profiles (user_id, bio, rating_avg, rating_count, hourly_rate, specialties, age_range, job, gender, created_at, updated_at)
VALUES (
    (SELECT user_id FROM users WHERE email = 'partner_m_9@vietimmerse.com'),
    'Rất vui được làm quen, mình có kinh nghiệm sống ở nước ngoài.',
    4.79,
    81,
    100,
    ARRAY['Văn hóa Việt Nam','Du lịch']::text[],
    '35+',
    'Nhà thiết kế',
    'male',
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    gender = EXCLUDED.gender,
    specialties = EXCLUDED.specialties;


INSERT INTO users (user_id, email, password_hash, display_name, avatar_url, role, account_status, is_online, last_seen, created_at, updated_at)
VALUES (
    '5969a832-384d-49b9-8300-86518713dce1', 
    'partner_f_9@vietimmerse.com', 
    '$2a$11$92T3r7uLzR3K8Jp.2YtPueYm4bO6sZ3qD2q3pL2D3X1eFq.E8rR7i', 
    'Lê Bích Ngọc', 
    '/avatars/partner_19.png', 
    'partner', 
    'active', 
    false, 
    NOW() - interval '11 hours', 
    NOW(), 
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    is_online = EXCLUDED.is_online,
    last_seen = EXCLUDED.last_seen;


INSERT INTO partner_profiles (user_id, bio, rating_avg, rating_count, hourly_rate, specialties, age_range, job, gender, created_at, updated_at)
VALUES (
    (SELECT user_id FROM users WHERE email = 'partner_f_9@vietimmerse.com'),
    'Sẵn sàng trò chuyện mọi chủ đề từ công sở đến đời sống.',
    4.99,
    72,
    100,
    ARRAY['Ẩm thực','Giao tiếp hàng ngày']::text[],
    '18-22',
    'Giáo viên',
    'female',
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    age_range = EXCLUDED.age_range,
    job = EXCLUDED.job,
    gender = EXCLUDED.gender,
    specialties = EXCLUDED.specialties;
