# Workflow: Tìm đối tác (Partner Matching) — VietImmerse

> **Phạm vi:** Learner tìm kiếm, lọc, xem danh sách Partner và bắt đầu nhắn tin.
> **Route:** `/learner/matching`
> **Ngày tạo:** 2026-05-25

---

## 1. Tổng quan

Learner (người học tiếng Việt, thường là người Nhật) truy cập trang **"Tìm đối tác"** để:
1. Xem danh sách Partner (người Việt hỗ trợ học tiếng) — **dữ liệu thật từ Database**
2. Lọc theo **độ tuổi**, **công việc/chuyên môn**, **trạng thái online/offline**
3. Nhấn **"Nhắn tin"** → tạo conversation (nếu chưa có) và chuyển sang trang nhắn tin

### Quyết định thiết kế
- **Không cần request/accept**: Learner nhắn tin trực tiếp, conversation tạo ngay.
- **Không phân trang**: Load toàn bộ danh sách 1 lần (số lượng partner ít, <50).
- **Không hiển thị Rating**: Chỉ hiện thông tin cơ bản (tên, bio, avatar, online, tuổi, nghề).
- **Dữ liệu thật**: Xóa hardcode, gọi API backend lấy từ DB + realtime online status.
- **Filter qua nút Tìm kiếm**: Theo spec (ID 10 - No.12), filter không realtime — người dùng chọn điều kiện rồi nhấn nút "Tìm kiếm" mới apply.
- **Options Công việc hardcode**: Theo spec (ID 10 - No.10), 6 giá trị cố định: Tất cả, Giáo viên, Công chức, Đầu bếp, Dịch vụ, Khác — không dynamic từ DB.

---

## 2. Data Model (Backend — đã tồn tại)

### Bảng `users`
| Column | Type | Mô tả |
|---|---|---|
| `user_id` | UUID | PK |
| `display_name` | VARCHAR(100) | Tên hiển thị |
| `avatar_url` | TEXT | URL avatar |
| `role` | VARCHAR(20) | `"partner"` hoặc `"learner"` |
| `is_online` | BOOL | Trạng thái online realtime |
| `last_seen` | TIMESTAMP | Lần cuối active |
| `account_status` | VARCHAR(30) | `"active"` / `"inactive"` |

### Bảng `partner_profiles`
| Column | Type | Mô tả |
|---|---|---|
| `profile_id` | UUID | PK |
| `user_id` | UUID | FK → users |
| `bio` | TEXT | Mô tả bản thân |
| `age_range` | VARCHAR(10) | VD: `"25-30"`, `"31-40"` |
| `job` | VARCHAR(30) | VD: `"Giáo viên"`, `"Kỹ sư"` |
| `specialties` | TEXT[] (Postgres array) | VD: `["Giao tiếp", "JLPT"]` |
| `rating_avg` | DECIMAL(3,2) | Trung bình đánh giá (chưa dùng) |
| `rating_count` | INT | Số lượt đánh giá (chưa dùng) |
| `availability_json` | JSONB | Lịch rảnh (chưa dùng) |
| `intro_video_url` | TEXT | Video giới thiệu (chưa dùng) |

### Bảng `conversations`
| Column | Type | Mô tả |
|---|---|---|
| `conversation_id` | UUID | PK |
| `learner_id` | UUID | FK → users |
| `partner_id` | UUID | FK → users |
| `created_at` | TIMESTAMP | |

> **UNIQUE constraint** trên `(learner_id, partner_id)` → đảm bảo chỉ có 1 conversation giữa mỗi cặp.

---

## 3. API Backend (cần tạo mới)

### 3.1 GET `/api/partners` — Danh sách Partner

**Mô tả:** Trả về tất cả partner có `account_status = 'active'`.

**Headers:** `Authorization: Bearer <token>` (bắt buộc, cần biết learner_id để xử lý conversation)

**Response:** `200 OK`
```json
[
  {
    "userId": "a000...",
    "displayName": "Đối tác Demo",
    "avatarUrl": "https://...",
    "bio": "Tài khoản đối tác demo",
    "isOnline": true,
    "lastSeen": "2026-05-25T12:00:00Z",
    "ageRange": "25-30",
    "job": "Giáo viên",
    "specialties": ["Giao tiếp", "JLPT N3"],
    "hasConversation": true,
    "conversationId": "c000..."
  }
]
```

**Logic:**
1. Query `users` JOIN `partner_profiles` WHERE `role = 'partner'` AND `account_status = 'active'`
2. Với mỗi partner, kiểm tra xem đã có conversation với learner hiện tại chưa
   - Nếu có → trả `hasConversation: true` + `conversationId`
   - Nếu chưa → trả `hasConversation: false` + `conversationId: null`
3. Trả về `is_online` từ bảng `users` (realtime status)

### 3.2 POST `/api/partners/{partnerId}/start-conversation` — Tạo conversation

**Mô tả:** Tạo conversation mới giữa learner hiện tại và partner được chỉ định.

**Headers:** `Authorization: Bearer <token>`

**Response:**
- `201 Created` → conversation mới tạo
- `200 OK` → conversation đã tồn tại (trả lại ID cũ)

```json
{
  "conversationId": "c000...",
  "isNew": true
}
```

**Logic:**
1. Lấy `learner_id` từ JWT token
2. Kiểm tra partner tồn tại và role = `'partner'`
3. Tìm conversation đã có giữa 2 người → nếu có, trả 200 + ID cũ
4. Nếu chưa có → INSERT conversation mới, trả 201

---

## 4. Luồng Frontend

### 4.1 Khi mở trang `/learner/matching`

```
┌─────────────────────────────────────────────┐
│  1. Component mount                         │
│  2. Gọi GET /api/partners                   │
│  3. Hiển thị loading skeleton               │
│  4. Nhận data → render toàn bộ danh sách    │
│  5. User chọn filter (dropdown)             │
│  6. User nhấn nút "Tìm kiếm"               │
│  7. Áp dụng filter client-side → re-render  │
└─────────────────────────────────────────────┘
```

**Loading state:** Hiển thị 4 skeleton card (placeholder) trong khi chờ API.

**Empty state:** Nếu không có partner nào → hiển thị thông báo "Chưa có đối tác nào".

**Error state:** Nếu API lỗi → hiển thị thông báo lỗi + nút "Thử lại".

### 4.2 Filter (Client-side) + Nút Tìm kiếm

Dữ liệu đã load hết 1 lần. Filter hoạt động **hoàn toàn trên client** (không gọi API lại).

> ⚠️ **Theo spec (ID 10 - No.12):** Filter **không** hoạt động realtime khi đổi dropdown. Người dùng chọn xong các điều kiện rồi nhấn **nút "Tìm kiếm" (検索ボタン)** → danh sách mới cập nhật.

```
User thay đổi dropdown (tuổi / nghề / trạng thái)
        │
        ▼
Lưu vào filterState (chưa apply)
        │
User nhấn nút "Tìm kiếm"
        │
        ▼
Apply filter trên toàn bộ data đã load → re-render danh sách
```

| Filter | Field | Giá trị |
|---|---|---|
| Độ tuổi | `ageRange` | `"all"`, `"18-24"`, `"25-30"`, `"31-40"`, `"40+"` |
| Công việc | `job` | `"all"`, `"Giáo viên"`, `"Công chức"`, `"Đầu bếp"`, `"Dịch vụ"`, `"Khác"` |
| Trạng thái | `isOnline` | `"all"`, `"online"`, `"offline"` |

**Lưu ý filter Công việc:**
- Theo spec (ID 10 - No.10), options được **hardcode cố định 6 giá trị**: すべて、教師、公務員、料理人、サービス業従事者、その他 = Tất cả, Giáo viên, Công chức, Đầu bếp, Dịch vụ, Khác.
- **Không** tự động lấy dynamic từ DB.
- Partner có `job` nằm ngoài 5 giá trị trên → vẫn hiển thị trong kết quả khi chọn filter "Khác".
- Nếu `job` là `null` → tag job hiển thị "—" trên card.

### 4.3 Partner Card — Thông tin hiển thị

```
┌──────────────────────────────────────┐
│  ┌────────────────────────────────┐  │
│  │          Avatar                │  │  ← aspect-square, rounded-2xl
│  │   (hoặc icon person nếu null) │  │
│  └────────────────────────────────┘  │
│                                      │
│  Tên hiển thị                        │  ← font-headline, bold
│  Bio ngắn (max 2 dòng)              │  ← line-clamp-2
│                                      │
│  [🟢 Online] [25-30] [Giáo viên]    │  ← Tag badges
│                                      │
│  ┌──────────────────────────────┐    │
│  │  ▶ Nhắn tin                  │    │  ← Primary button
│  └──────────────────────────────┘    │
└──────────────────────────────────────┘
```

**Chi tiết tags:**
- **Online badge:** `🟢 Online` (bg-green-100 text-green-800) / `⚪ Offline` (bg-gray-100 text-gray-500)
- **Age badge:** Hiển thị `ageRange` (VD: "25-30")
- **Job badge:** Hiển thị `job` (VD: "Giáo viên")
- Nếu `job` = null → hiển thị "—"

### 4.4 Nút "Nhắn tin" — Flow khi click

```
User click "Nhắn tin" trên card Partner X
        │
        ▼
hasConversation === true ?
        │
   ┌────┴─────┐
   Yes        No
   │          │
   ▼          ▼
Redirect    Gọi POST /api/partners/{id}/start-conversation
 tới         │
/learner/    ▼
messages?    Nhận conversationId
conv={id}    │
             ▼
          Redirect tới /learner/messages?conv={conversationId}
```

**UX chi tiết:**
1. Khi click → nút chuyển sang trạng thái loading (spinner + disable)
2. Nếu `hasConversation === true` → redirect ngay (không gọi API)
3. Nếu `hasConversation === false`:
   a. Gọi `POST /api/partners/{partnerId}/start-conversation`
   b. Nhận `conversationId` từ response
   c. Redirect tới `/learner/messages?conv={conversationId}`
4. Nếu API lỗi → hiển thị toast "Không thể kết nối. Thử lại sau."

### 4.5 Điều hướng từ messages → matching

Khi Learner mở `/learner/messages?conv={conversationId}`:
- Tự động chọn conversation với `conversationId` tương ứng
- Scroll đến conversation đó trong sidebar

---

## 5. Seed Data — Partner profiles cần bổ sung

Hiện tại seed data chỉ có `bio` trong `partner_profiles`. Cần bổ sung `age_range` và `job`:

| Email | display_name | age_range | job |
|---|---|---|---|
| `doitac@gmail.com` | Đối tác Demo | `25-30` | Giáo viên |
| `tuan.tran@gmail.com` | Trần Minh Tuấn | `31-40` | Kỹ sư phần mềm |
| `mai.nguyen@gmail.com` | Nguyễn Thị Mai | `18-24` | Sinh viên |

---

## 6. File cần tạo/sửa

### Backend (C#)
| File | Hành động | Mô tả |
|---|---|---|
| `Controllers/PartnerController.cs` | **MỚI** | Endpoint GET `/api/partners` + POST `start-conversation` |
| `database/seed_data.sql` | **SỬA** | Bổ sung `age_range`, `job` cho partner_profiles |

### Frontend (TSX)
| File | Hành động | Mô tả |
|---|---|---|
| `lib/api.ts` | **SỬA** | Thêm `partnerApi.getPartners()` + `startConversation()` |
| `app/learner/matching/page.tsx` | **SỬA** | Xóa hardcode, gọi API, fix filter, fix nút nhắn tin |

---

## 7. Validation & Edge Cases

| Case | Xử lý |
|---|---|
| Partner không có avatar | Hiển thị icon `person` trong khung xám (đã có) |
| Partner không có bio | Hiển thị "Chưa cập nhật" / "未設定" |
| Partner không có job | Tag job hiển thị "—" |
| Partner không có age_range | Tag tuổi không hiển thị |
| Learner nhắn tin cho chính mình | Không xảy ra — API chỉ trả role = partner |
| Conversation đã tồn tại | API trả 200 + conversationId cũ (idempotent) |
| Network error khi load | Hiển thị error state + nút "Thử lại" |
| API trả danh sách rỗng | Hiển thị "Chưa có đối tác nào" centered |

---

## 8. Bilingual (Song ngữ)

Tất cả text hiển thị đều dùng `t(vi, ja)`. Các label cần dịch:

| Key | Tiếng Việt | Tiếng Nhật |
|---|---|---|
| Page title | Tìm giọng nói miền Bắc của bạn | あなたの北部の声を見つけよう |
| Subtitle | Kết nối qua ngôn ngữ Hà Nội | ハノイの言葉で繋がる |
| Filter: Độ tuổi | Độ tuổi | 年齢 |
| Filter: Công việc | Công việc | 職業 |
| Filter: Trạng thái | Trạng thái | 状態 |
| Filter: Tất cả | Tất cả | すべて |
| Filter job: Giáo viên | Giáo viên | 教師 |
| Filter job: Công chức | Công chức | 公務員 |
| Filter job: Đầu bếp | Đầu bếp | 料理人 |
| Filter job: Dịch vụ | Dịch vụ | サービス業 |
| Filter job: Khác | Khác | その他 |
| Tag: Online | Online | オンライン |
| Tag: Offline | Offline | オフライン |
| Button: Nhắn tin | Nhắn tin | メッセージ |
| Button: Tìm kiếm | Tìm kiếm | 検索 |
| Empty: Chưa có | Chưa có đối tác nào | パートナーがいません |
| Error: Thử lại | Thử lại | 再試行 |
| Loading | Đang tải... | 読み込み中... |
| No bio | Chưa cập nhật | 未設定 |

---

## 9. Sơ đồ tổng quan

```
┌─────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   Learner   │────────▶│  GET /api/partners│────────▶│   PostgreSQL     │
│   Browser   │         │  (PartnerCtrl)   │         │   users +        │
│             │◀────────│                  │◀────────│   partner_profiles│
│             │   JSON  │                  │   SQL   │   + conversations│
│             │         └──────────────────┘         └──────────────────┘
│             │
│  Click      │         ┌──────────────────┐
│  "Nhắn tin" │────────▶│ POST /api/partners│
│             │         │ /{id}/start-conv │
│             │◀────────│ (PartnerCtrl)    │
│   Redirect  │  201    │ → INSERT convo   │
│   /messages │         └──────────────────┘
└─────────────┘
```