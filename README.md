# VietImmerse - 北部ベトナム語学習プラットフォーム

> **Nền tảng học tiếng Việt giọng miền Bắc dành cho người Nhật tại Hà Nội**

## 🚀 Bắt đầu nhanh (Quick Start)

### Yêu cầu hệ thống

- **Node.js**: v20 LTS trở lên (khuyến nghị v24)
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
```

#### 📧 Cấu hình SMTP — Hướng dẫn chi tiết

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

#### 🐳 Docker Context

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

## 📁 Cấu trúc dự án

```text
kanoe_itss_b1/
├── src/
│   ├── app/                        # App Router (Next.js 15)
│   │   ├── layout.tsx              # Root layout (fonts, metadata)
│   │   ├── globals.css             # Design System (color tokens)
│   │   ├── page.tsx                # Landing page (/)
│   │   ├── login/page.tsx          # Đăng nhập
│   │   ├── signup/                 # Đăng ký
│   │   │   ├── page.tsx            # Chọn loại (Learner/Partner)
│   │   │   ├── learner/page.tsx    # Form đăng ký Learner
│   │   │   └── partner/page.tsx    # Form đăng ký Partner
│   │   ├── forgot-password/        # Quên mật khẩu
│   │   ├── change-password/        # Đổi mật khẩu
│   │   ├── learner/                # Learner flow
│   │   │   ├── home/page.tsx       # Dashboard
│   │   │   ├── lessons/page.tsx    # Danh sách bài học
│   │   │   ├── lessons/[id]/       # Chi tiết bài học
│   │   │   ├── matching/page.tsx   # Ghép cặp
│   │   │   ├── messages/page.tsx   # Tin nhắn
│   │   │   └── settings/page.tsx   # Cài đặt
│   │   └── partner/                # Partner flow
│   │       ├── home/page.tsx       # Dashboard
│   │       ├── messages/page.tsx   # Tin nhắn
│   │       └── settings/page.tsx   # Cài đặt
│   └── components/
│       └── layout/                 # Shared layout components
│           ├── LearnerNavbar.tsx
│           ├── LearnerBottomNav.tsx
│           ├── PartnerNavbar.tsx
│           └── PartnerBottomNav.tsx
├── legacy-html/                    # HTML gốc (tham khảo)
├── public/                         # Static assets
├── .env.example                    # Template biến môi trường
├── .prettierrc                     # Code formatting config
├── .editorconfig                   # Editor settings
└── package.json
```

---

## 🎨 Design System

| Token | Giá trị | Mô tả |
| ------- | --------- | ------- |
| `--primary` | `#09294f` | Màu chủ đạo (Navy) |
| `--secondary` | `#715a3e` | Màu phụ (Warm Brown) |
| `--tertiary` | `#3f2122` | Màu thứ 3 (Deep Red) |
| `--error` | `#ba1a1a` | Màu lỗi |
| `--surface` | `#f9f9f7` | Nền chính |

**Fonts**: `Be Vietnam Pro` (headlines), `Manrope` (body & labels)

---

## 🛣️ Routes

| Route | Mô tả |
| ------- | ------- |
| `/` | Landing page |
| `/login` | Đăng nhập |
| `/signup` | Chọn loại đăng ký |
| `/signup/learner` | Đăng ký học viên |
| `/signup/partner` | Đăng ký đối tác |
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

## 🧑‍💻 Quy ước phát triển

- **Framework**: Next.js 15 + TypeScript
- **Styling**: Tailwind CSS v4
- **Component**: React Server/Client Components (App Router)
- **File naming**: `PascalCase.tsx` cho components, `page.tsx` cho routes
- **Commit**: Conventional Commits (`feat:`, `fix:`, `docs:`, ...)

---

## 📜 Scripts

```bash
npm run dev      # Chạy dev server
npm run build    # Build production
npm run start    # Chạy production server
npm run lint     # Kiểm tra lỗi ESLint
```
