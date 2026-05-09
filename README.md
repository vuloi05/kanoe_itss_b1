# VietImmerse - 北部ベトナム語学習プラットフォーム

> **Nền tảng học tiếng Việt giọng miền Bắc dành cho người Nhật tại Hà Nội**

## 🚀 Bắt đầu nhanh (Quick Start)

### Yêu cầu hệ thống
- **Node.js**: v20 LTS trở lên (khuyến nghị v24)
- **npm**: v10 trở lên
- **Git**: v2.x

### Cài đặt
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

---

## 📁 Cấu trúc dự án

```
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
|-------|---------|-------|
| `--primary` | `#09294f` | Màu chủ đạo (Navy) |
| `--secondary` | `#715a3e` | Màu phụ (Warm Brown) |
| `--tertiary` | `#3f2122` | Màu thứ 3 (Deep Red) |
| `--error` | `#ba1a1a` | Màu lỗi |
| `--surface` | `#f9f9f7` | Nền chính |

**Fonts**: `Be Vietnam Pro` (headlines), `Manrope` (body & labels)

---

## 🛣️ Routes

| Route | Mô tả |
|-------|-------|
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
