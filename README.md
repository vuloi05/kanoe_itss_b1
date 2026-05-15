# VietImmerse - 北部ベトナム語学習プラットフォーム

> **Nền tảng học tiếng Việt giọng miền Bắc dành cho người Nhật tại Hà Nội**

## Bắt đầu nhanh (Quick Start)

### Yêu cầu hệ thống

- **Node.js**: v20 LTS trở lên (khuyến nghị v22 LTS)
- **npm**: v10 trở lên
- **Git**: v2.x
- **.NET SDK**: v10.0 trở lên
- **PostgreSQL**: v16 trở lên

### Cài đặt Frontend

```bash
# Clone repository
git clone <repository-url>
cd kanoe_itss_b1

# Cài đặt dependencies
cd frontend
npm install

# Chạy development server
npm run dev
```

Truy cập [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

### Cài đặt Backend

#### 1. Environment Setup — Cấu hình biến môi trường

Tạo file `.env` tại **root project** (cùng cấp với `docker-compose.yml`).

Dưới đây là template đầy đủ — copy và thay thế các giá trị trong `< >` bằng thông tin thực tế của bạn:

```env
# ===================================
# DATABASE (Docker)
# ===================================
POSTGRES_DB=VietImmerse_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<your_db_password>

# ===================================
# BACKEND CONNECTION STRING
# ===================================
DATABASE_CONNECTION_STRING=Host=db;Port=5432;Database=VietImmerse_db;Username=postgres;Password=<your_db_password>

# ===================================
# JWT AUTHENTICATION
# ===================================
JWT_SECRET=<your_jwt_secret_at_least_32_chars>
JWT_ISSUER=VietImmerse
JWT_AUDIENCE=VietImmerseApp
JWT_EXPIRY_HOURS=24

# ===================================
# ASP.NET CORE
# ===================================
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=http://+:8080

# ===================================
# FRONTEND
# ===================================
NEXT_PUBLIC_API_URL=http://localhost:8080
NODE_ENV=production

# ===================================
# SMTP EMAIL (Gmail)
# ===================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your_gmail_address>
SMTP_PASSWORD=<your_16_char_app_password>
SMTP_FROM=VietImmerse <your_gmail_address>

# ===================================
# CLOUDINARY (Avatar Upload)
# ===================================
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>
```

#### Cấu hình SMTP — Hướng dẫn chi tiết

Dự án sử dụng **Gmail SMTP** để gửi email (quên mật khẩu, xác thực, v.v.). Cấu hình mặc định:

| Variable | Default Value | Mô tả |
| --- | --- | --- |
| `SMTP_HOST` | `smtp.gmail.com` | SMTP server của Gmail |
| `SMTP_PORT` | `587` | Port sử dụng STARTTLS |
| `SMTP_USER` | — | Địa chỉ Gmail dùng để gửi email |
| `SMTP_PASSWORD` | — | **App Password** 16 ký tự (⚠️ **KHÔNG PHẢI** mật khẩu Gmail) |
| `SMTP_FROM` | — | Tên hiển thị + email gửi, ví dụ: `VietImmerse <abc@gmail.com>` |

> [!CAUTION]
> **`SMTP_PASSWORD` KHÔNG phải là mật khẩu đăng nhập Gmail của bạn!**
>
> Google không cho phép đăng nhập SMTP bằng mật khẩu tài khoản thông thường. Bạn cần tạo một **App Password** (Mật khẩu ứng dụng) — chuỗi 16 ký tự do Google cấp riêng.

**Các bước lấy App Password từ Google:**

1. Truy cập [Google Account Security](https://myaccount.google.com/security).
2. Bật **2-Step Verification** (Xác minh 2 bước) nếu chưa bật — **bắt buộc**.
3. Sau khi bật 2FA, truy cập [App Passwords](https://myaccount.google.com/apppasswords).
4. Chọn tên ứng dụng (ví dụ: `VietImmerse`) → Nhấn **Create**.
5. Google sẽ hiển thị mật khẩu 16 ký tự (dạng `abcd efgh ijkl mnop`).
6. Copy chuỗi này (**bỏ khoảng trắng**) và paste vào `SMTP_PASSWORD` trong file `.env`.

```env
# Example (remove spaces from the generated password)
SMTP_PASSWORD=abcdefghijklmnop
```

> [!WARNING]
> **Bảo mật file `.env`**
>
> - File `.env` chứa credentials nhạy cảm (database password, JWT secret, SMTP password).
> - **Tuyệt đối KHÔNG commit** file này lên GitHub hoặc bất kỳ remote repository nào.
> - Đảm bảo `.env` đã có trong `.gitignore` (dự án đã cấu hình sẵn tại dòng `.env` trong `.gitignore`).
> - Nếu bạn vô tình commit `.env`, hãy **revoke ngay** App Password cũ và tạo mới.

#### Cấu hình Cloudinary (Lưu trữ hình ảnh)

Dự án sử dụng **Cloudinary** để lưu trữ ảnh đại diện (Avatar) của người dùng. Thêm 3 biến sau vào file `.env`:

```env
# ===================================
# CLOUDINARY (Avatar Upload)
# ===================================
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>
```

| Variable | Mô tả |
| --- | --- |
| `CLOUDINARY_CLOUD_NAME` | Tên cloud duy nhất của tài khoản Cloudinary |
| `CLOUDINARY_API_KEY` | API Key công khai để xác thực request |
| `CLOUDINARY_API_SECRET` | API Secret bí mật — **tuyệt đối không để lộ** |

**Các bước lấy thông số Cloudinary:**

1. Đăng ký hoặc đăng nhập tại [cloudinary.com](https://cloudinary.com/).
2. Truy cập trang **Dashboard** (Bảng điều khiển) — [console.cloudinary.com](https://console.cloudinary.com/).
3. Tại mục **Product Environment Credentials**, bạn sẽ thấy đầy đủ 3 giá trị: `Cloud Name`, `API Key`, và `API Secret`.
4. Copy từng giá trị và paste vào file `.env` tương ứng.

> [!CAUTION]
> **Tuyệt đối KHÔNG để lộ `CLOUDINARY_API_SECRET`!**
>
> - Giá trị này cho phép toàn quyền truy cập tài khoản Cloudinary của bạn (upload, xóa, sửa ảnh).
> - Không hardcode vào source code, không chia sẻ qua chat/email.
> - Nếu nghi ngờ bị lộ, vào **Dashboard → Settings → Access Keys** để regenerate key mới ngay lập tức.
>
> **Free Tier:** Cloudinary cho phép **25,000 transformations** và **25 GB storage** mỗi tháng — đủ cho môi trường development và staging.

#### Docker Context

File `docker-compose.yml` đã được cấu hình với `env_file: .env` cho tất cả các service (`db`, `backend`, `frontend`). Khi chạy:

```bash
docker-compose up --build
```

Docker Compose sẽ **tự động đọc toàn bộ biến** từ file `.env` tại root project và inject vào các container tương ứng — bạn không cần truyền biến thủ công.

> [!NOTE]
> Trong `DATABASE_CONNECTION_STRING`, giá trị `Host=db` trỏ đến tên service `db` trong Docker network (không phải `localhost`). Khi chạy backend **ngoài Docker** (bare-metal), đổi thành `Host=localhost`.

#### 2. Tạo database

```bash
# Mở psql và tạo database (nếu chưa có)
psql -U postgres -h localhost -p 5432
CREATE DATABASE "VietImmerse_db";
\q
```

#### 3. Chạy backend

```bash
cd backend/backend
dotnet run
```

Backend sẽ chạy tại [http://localhost:8080](http://localhost:8080).

---

## Cấu trúc dự án

```text
kanoe_itss_b1/
├── backend/
│   └── backend/
│       ├── Controllers/
│       │   ├── AuthController.cs       # Đăng ký, đăng nhập, quên/đổi mật khẩu
│       │   ├── UserController.cs       # Upload avatar
│       │   └── HomeController.cs       # Health check
│       ├── Services/
│       │   ├── IAuthService.cs         # Auth interface
│       │   ├── AuthService.cs          # Auth implementation
│       │   ├── IPhotoService.cs        # Photo upload interface
│       │   ├── CloudinaryPhotoService.cs # Cloudinary integration
│       │   ├── IJwtService.cs / JwtService.cs
│       │   └── IEmailService.cs / SmtpEmailService.cs
│       ├── Models/                     # EF Core entities
│       ├── DTOs/                       # Request/Response DTOs
│       ├── Migrations/                 # EF Core migrations
│       ├── Program.cs                  # App startup & DI
│       └── backend.csproj
├── frontend/
│   └── src/
│       ├── app/                        # App Router (Next.js 16)
│       │   ├── layout.tsx              # Root layout (fonts, metadata)
│       │   ├── globals.css             # Design System (color tokens)
│       │   ├── page.tsx                # Landing page (/)
│       │   ├── login/page.tsx          # Đăng nhập
│       │   ├── signup/                 # Đăng ký
│       │   │   ├── page.tsx            # Chọn loại (Learner/Partner)
│       │   │   ├── learner/page.tsx    # Form đăng ký Learner
│       │   │   └── partner/page.tsx    # Form đăng ký Partner
│       │   ├── forgot-password/        # Quên mật khẩu
│       │   ├── reset-password/         # Đặt lại mật khẩu (từ email)
│       │   ├── change-password/        # Đổi mật khẩu (authenticated)
│       │   ├── learner/                # Learner flow
│       │   │   ├── home/page.tsx       # Dashboard
│       │   │   ├── lessons/page.tsx    # Danh sách bài học
│       │   │   ├── lessons/[id]/       # Chi tiết bài học
│       │   │   ├── matching/page.tsx   # Ghép cặp
│       │   │   ├── messages/page.tsx   # Tin nhắn
│       │   │   └── settings/page.tsx   # Cài đặt
│       │   └── partner/                # Partner flow
│       │       ├── home/page.tsx       # Dashboard
│       │       ├── messages/page.tsx   # Tin nhắn
│       │       └── settings/page.tsx   # Cài đặt
│       ├── components/
│       │   ├── auth/                   # Auth guards
│       │   │   └── ProtectedRoute.tsx
│       │   ├── common/                 # Shared UI components
│       │   │   ├── AvatarUploadModal.tsx
│       │   │   ├── ProfileDropdown.tsx
│       │   │   └── LanguageSwitcher.tsx
│       │   └── layout/                 # Navigation components
│       │       ├── LearnerNavbar.tsx
│       │       ├── LearnerBottomNav.tsx
│       │       ├── PartnerNavbar.tsx
│       │       └── PartnerBottomNav.tsx
│       ├── contexts/
│       │   └── LanguageContext.tsx     # i18n (Vi/Ja)
│       ├── hooks/
│       │   └── useForgotPassword.ts
│       └── lib/
│           ├── api.ts                  # API client & endpoints
│           ├── auth.tsx                # AuthProvider & useAuth hook
│           └── cropImage.ts            # Canvas crop utility
├── docker-compose.yml
├── .env.example                        # Template biến môi trường
└── README.md
```

---

## Design System

| Token | Giá trị | Mô tả |
| ------- | --------- | ------- |
| `--primary` | `#09294f` | Màu chủ đạo (Navy) |
| `--secondary` | `#715a3e` | Màu phụ (Warm Brown) |
| `--tertiary` | `#3f2122` | Màu thứ 3 (Deep Red) |
| `--error` | `#ba1a1a` | Màu lỗi |
| `--surface` | `#f9f9f7` | Nền chính |

**Fonts**: `Be Vietnam Pro` (headlines), `Manrope` (body & labels)

---

## Routes

| Route | Mô tả |
| ------- | ------- |
| `/` | Landing page |
| `/login` | Đăng nhập |
| `/signup` | Chọn loại đăng ký |
| `/signup/learner` | Đăng ký học viên |
| `/signup/partner` | Đăng ký đối tác |
| `/forgot-password` | Quên mật khẩu |
| `/reset-password` | Đặt lại mật khẩu (từ email) |
| `/change-password` | Đổi mật khẩu |
| `/learner/home` | Dashboard học viên |
| `/learner/lessons` | Danh sách bài học |
| `/learner/lessons/:id` | Chi tiết bài học |
| `/learner/matching` | Ghép cặp đối tác |
| `/learner/messages` | Tin nhắn (Learner) |
| `/learner/settings` | Cài đặt (Learner) |
| `/partner/home` | Dashboard đối tác |
| `/partner/messages` | Tin nhắn (Partner) |
| `/partner/settings` | Cài đặt (Partner) |

---

## Quy ước phát triển

- **Framework**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Component**: React Server/Client Components (App Router)
- **File naming**: `PascalCase.tsx` cho components, `page.tsx` cho routes
- **Commit**: Conventional Commits (`feat:`, `fix:`, `docs:`, ...)

---

## Scripts

```bash
npm run dev      # Chạy dev server
npm run build    # Build production
npm run start    # Chạy production server
npm run lint     # Kiểm tra lỗi ESLint
```
