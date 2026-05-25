# VietImmerse — Workflow Chi Tiết: Tính Năng Tin Nhắn

> Tài liệu này mô tả workflow đầy đủ cho chức năng **Tin nhắn / メッセージ** giữa hai đối tượng: **Người học (Learner)** và **Đối tác (Partner)**, bao gồm tất cả các tính năng con.

---

## Mục Lục

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Workflow: Khởi tạo cuộc hội thoại](#2-workflow-khởi-tạo-cuộc-hội-thoại)
3. [Workflow: Gửi & nhận tin nhắn thời gian thực](#3-workflow-gửi--nhận-tin-nhắn-thời-gian-thực)
4. [Workflow: Xử lý offline & retry](#4-workflow-xử-lý-offline--retry)
5. [Workflow: Tải lịch sử chat (Lazy Load)](#5-workflow-tải-lịch-sử-chat-lazy-load)
6. [Workflow: Dịch tự động hai ngôn ngữ](#6-workflow-dịch-tự-động-hai-ngôn-ngữ)
7. [Workflow: Gửi Google Meet Link](#7-workflow-gửi-google-meet-link)
8. [Workflow: Đặt lịch luyện nói (Lesson Request)](#8-workflow-đặt-lịch-luyện-nói-lesson-request)
9. [Workflow: Xác nhận / Từ chối lịch hẹn](#9-workflow-xác-nhận--từ-chối-lịch-hẹn)
10. [Workflow: Quản lý trạng thái lịch sử buổi học](#10-workflow-quản-lý-trạng-thái-lịch-sử-buổi-học)
11. [Workflow: Trạng thái online/offline Partner](#11-workflow-trạng-thái-onlineoffline-partner)
12. [Sơ đồ màn hình liên quan](#12-sơ-đồ-màn-hình-liên-quan)
13. [Điều kiện tiếp nhận tổng hợp (Acceptance Criteria)](#13-điều-kiện-tiếp-nhận-tổng-hợp-acceptance-criteria)

---

## 1. Tổng Quan Hệ Thống

### 1.1 Các đối tượng tham gia

| Đối tượng | Role ID | Mô tả |
| --- | --- | --- |
| Người học | 1.0 | Học tiếng Việt miền Bắc, muốn luyện nói với Partner |
| Đối tác (Partner) | 3.0 | Người Việt bản xứ, hỗ trợ người học luyện hội thoại |

### 1.2 Màn hình liên quan

| Màn hình | ID | Role |
| --- | --- | --- |
| Màn hình tin nhắn Người học | 11.0 | Learner |
| Màn hình tin nhắn Partner | 15.0 | Partner |
| Màn hình matching | 10.0 | Learner |
| Trang chủ Người học | 7.0 | Learner |
| Trang chủ Partner | 14.0 | Partner |

### 1.3 Các tính năng con của module Tin nhắn

```text
Tin nhắn (Messaging Module)
├── 3.1  Gửi / nhận tin nhắn văn bản (WebSocket real-time)
├── 3.2  Xử lý offline & retry queue
├── 3.3  Tải lịch sử chat (lazy load 50 tin/lần)
├── 3.4  Dịch tự động 2 ngôn ngữ (Nhật ↔ Việt)
├── 3.5  Gửi & hiển thị Google Meet link
├── 3.6  Đặt lịch luyện nói (Lesson Request) — do Partner gửi
└── 3.7  Xác nhận / Từ chối lịch hẹn — do Learner phản hồi
```

### 1.4 Công nghệ sử dụng

| Thành phần | Công nghệ |
| --- | --- |
| Real-time messaging | WebSocket |
| Dịch thuật tự động | Google Translate API hoặc Local LLM |
| Google Meet link | Pattern validation `https://meet.google.com/xxx-xxx-xxx` |
| Timezone | Auto-detect, hiển thị theo timezone người dùng |
| Auth | JWT (hết hạn 120 phút + refresh token) |

---

## 2. Workflow: Khởi Tạo Cuộc Hội Thoại

### 2.1 Người học bắt đầu chat với Partner

```text
[Người học]
    │
    ▼
[Màn hình Matching — ID 10]
    │  Chọn Partner từ danh sách
    │  (filter: độ tuổi, nghề nghiệp, trạng thái online)
    ▼
[Nhấn nút "Message / メッセージ送信"]
    │
    ├─── Đã tồn tại cuộc hội thoại với Partner này?
    │         │
    │    YES  ▼
    │    [Mở lại đoạn hội thoại cũ]
    │    [Load lịch sử chat — 50 tin nhắn gần nhất]
    │         │
    │    NO   ▼
    │    [Tạo conversation mới trong DB]
    │    [conversation_id được tạo]
    │
    ▼
[Chuyển sang Màn hình Tin nhắn — ID 11]
    │
    ├─── Thiết lập kết nối WebSocket
    ├─── Subscribe vào room: conversation_id
    └─── Hiển thị giao diện chat
```

### 2.2 Partner mở tin nhắn từ Trang chủ

```text
[Partner]
    │
    ▼
[Trang chủ Partner — ID 14]
    │  Nhấn vào cuộc hội thoại trong danh sách
    ▼
[Màn hình Tin nhắn Partner — ID 15]
    │
    ├─── Load danh sách hội thoại (panel trái)
    ├─── Hiển thị chi tiết chat với người được chọn (panel phải)
    ├─── Thiết lập kết nối WebSocket
    └─── Subscribe vào room: conversation_id
```

### 2.3 Điều kiện tiền quyết (Pre-conditions)

- Người dùng đã đăng nhập, JWT còn hiệu lực
- Với Learner: đã thực hiện matching với Partner (ID 10)
- Với Partner: đã có ít nhất 1 Learner liên hệ

---

## 3. Workflow: Gửi & Nhận Tin Nhắn Thời Gian Thực

### 3.1 Luồng gửi tin nhắn (Sender side)

```text
[Người dùng nhập nội dung vào ô nhập tin nhắn]
    │  Placeholder: "Viết tin nhắn... / メッセージを入力..."
    │
    ├─── Nhấn nút Gửi (▶) HOẶC nhấn Enter
    │         (Shift+Enter = xuống dòng, KHÔNG gửi)
    │
    ▼
[Validation client-side]
    │
    ├─── Nội dung rỗng? → KHÔNG gửi (nút gửi inactive)
    │
    ├─── Kiểm tra kết nối mạng
    │         │
    │    ONLINE  ▼
    │    [Gửi message qua WebSocket]
    │    [Hiển thị ngay bong bóng tin nhắn — căn PHẢI]
    │    [Nền xanh đậm, chữ trắng, góc bo tròn]
    │    [Icon "đang gửi" (clock)]
    │         │
    │    OFFLINE ▼ → [Xem Workflow 4: Offline & Retry]
    │
    ▼
[Server nhận message]
    │
    ├─── Lưu vào DB: {conversation_id, sender_id, content, timestamp, status: "sent"}
    │
    ├─── Trigger dịch tự động (async)
    │         └─── [Xem Workflow 6: Dịch tự động]
    │
    ├─── Broadcast tới room: conversation_id (qua WebSocket)
    │
    └─── Trả về ACK tới sender
              │
              ▼
         [Cập nhật icon → "đã gửi" ✓]
```

### 3.2 Luồng nhận tin nhắn (Receiver side)

```text
[Server broadcast message tới room]
    │
    ▼
[Client nhận sự kiện WebSocket]
    │
    ├─── Latency check: phải ≤ 1 giây
    │
    ▼
[Hiển thị bong bóng tin nhắn — căn TRÁI]
    │  Nền trắng, viền xám, góc bo tròn
    │
    ├─── Dòng 1: Nội dung gốc (ngôn ngữ của người gửi)
    └─── Dòng 2: Bản dịch tự động (ngôn ngữ còn lại)
              │
              └─── [Xem Workflow 6: Dịch tự động]

[Timestamp hiển thị bên dưới bong bóng]
    │  Format: HH:MM
    └─── Nếu tin gửi hôm trước: "Hôm qua / 昨日"
         Nếu trước đó nữa: DD/MM
```

### 3.3 Cấu trúc message payload (WebSocket)

```json
{
  "type": "MESSAGE",
  "conversation_id": "uuid",
  "sender_id": "user_id",
  "sender_role": "learner | partner",
  "content": "Xin chào, bạn có rảnh không?",
  "content_translated": "こんにちは、空いていますか？",
  "timestamp": "2025-05-18T10:30:00+07:00",
  "message_id": "uuid",
  "status": "sent"
}
```

---

## 4. Workflow: Xử Lý Offline & Retry

```text
[Người dùng gửi tin nhắn khi mất mạng]
    │
    ▼
[Phát hiện: không có kết nối mạng]
    │
    ▼
[Thêm message vào Local Queue]
    │  Hiển thị bong bóng tin nhắn với icon "⏳ đang chờ gửi"
    │
    ▼
[Theo dõi trạng thái kết nối mạng]
    │
    ├─── Kết nối được phục hồi?
    │         │
    │    YES  ▼
    │    [Tự động gửi lại tất cả message trong queue]
    │    [Theo thứ tự thời gian]
    │         │
    │         ├─── Gửi thành công → Cập nhật icon → ✓ "đã gửi"
    │         │
    │         └─── Gửi thất bại (attempt 1/3)
    │                   │
    │                   ├─── Retry attempt 2 (sau 2 giây)
    │                   ├─── Retry attempt 3 (sau 4 giây)
    │                   │
    │                   └─── Sau 3 lần thất bại:
    │                             ▼
    │                        [Hiển thị "❌ Gửi thất bại"]
    │                        [Hiện nút "Thử lại / リトライ" thủ công]
    │                        [Người dùng có thể nhấn để retry]
    │
    │    NO   ▼
    │    [Tiếp tục giữ trong queue]
    │    [Hiển thị banner: "Mất kết nối mạng"]
```

### 4.1 Cấu trúc Local Queue

```json
{
  "queue": [
    {
      "temp_id": "local_uuid",
      "conversation_id": "uuid",
      "content": "...",
      "timestamp_created": "ISO8601",
      "retry_count": 0,
      "status": "pending | failed"
    }
  ]
}
```

---

## 5. Workflow: Tải Lịch Sử Chat (Lazy Load)

```text
[Người dùng mở màn hình tin nhắn]
    │
    ▼
[API GET /conversations/{id}/messages?limit=50&offset=0]
    │
    ▼
[Hiển thị 50 tin nhắn mới nhất]
    │  Scroll tự động xuống cuối (tin mới nhất)
    │
    ▼
[Người dùng scroll lên đầu danh sách]
    │
    ├─── Đã đến đầu list?
    │         │
    │    YES  ▼
    │    [Trigger: load thêm 50 tin nhắn cũ hơn]
    │    [API GET /conversations/{id}/messages?limit=50&offset=50]
    │    [Hiển thị loading spinner ở trên cùng]
    │         │
    │         ├─── Có dữ liệu → Prepend vào đầu list
    │         │    (giữ nguyên vị trí scroll hiện tại)
    │         │
    │         └─── Không còn dữ liệu → Hiển thị "Đã tải hết lịch sử"
    │
    │    NO   ▼
    │    [Tiếp tục hiển thị bình thường]
```

### 5.1 Response cấu trúc

```json
{
  "messages": [...],
  "pagination": {
    "total": 240,
    "offset": 50,
    "limit": 50,
    "has_more": true
  }
}
```

---

## 6. Workflow: Dịch Tự Động Hai Ngôn Ngữ

```text
[Message mới được gửi / nhận]
    │
    ▼
[Phát hiện ngôn ngữ gốc]
    │  (detect từ nội dung tin nhắn)
    │
    ├─── Tiếng Việt → dịch sang Tiếng Nhật
    └─── Tiếng Nhật  → dịch sang Tiếng Việt
    │
    ▼
[Gọi dịch thuật]
    │
    ├─── Ưu tiên: Google Translate API
    │         │
    │         ├─── Thành công → Lưu vào DB (content_translated)
    │         │                 Hiển thị dòng 2 trong bong bóng chat
    │         │
    │         └─── Thất bại / Timeout → Thử Local LLM
    │                   │
    │                   ├─── Thành công → Hiển thị bản dịch
    │                   └─── Thất bại   → Ẩn dòng dịch (không hiển thị lỗi)
    │
    ▼
[Hiển thị trong bong bóng chat]
    │
    ├─── Tin gửi (bên phải):
    │         Dòng 1: Nội dung gốc (màu trắng)
    │         Dòng 2: Bản dịch    (màu trắng, nhỏ hơn, italic)
    │
    └─── Tin nhận (bên trái):
              Dòng 1: Nội dung gốc (màu đen)
              Dòng 2: Bản dịch    (màu xám, nhỏ hơn, italic)
```

### 6.1 Lưu ý quan trọng

- Bản dịch được **lưu vào DB** để không phải gọi API lại mỗi lần load
- Mỗi message chỉ dịch **1 lần** khi lần đầu gửi/nhận
- Khi load lịch sử, dùng `content_translated` đã lưu trong DB

---

## 7. Workflow: Gửi Google Meet Link

```text
[Partner muốn gửi link Google Meet cho Learner]
    │
    ▼
[Partner nhập URL vào ô tin nhắn]
    │  Ví dụ: https://meet.google.com/abc-defg-hij
    │
    ▼
[Nhấn gửi]
    │
    ▼
[Client-side: Validate URL pattern]
    │  Regex: ^https://meet\.google\.com/[a-z]{3}-[a-z]{4}-[a-z]{3}$
    │
    ├─── Pattern KHỚP?
    │         │
    │    YES  ▼
    │    [Gửi message với type: "MEET_LINK"]
    │    [Server lưu: {type: "meet_link", url: "..."}]
    │         │
    │         ▼
    │    [Hiển thị Custom Dialog thay vì text thuần]
    │    ┌─────────────────────────────────────┐
    │    │  🎥 Join Classroom (Google Meet)     │
    │    │     クラスに入る              [↗]    │
    │    └─────────────────────────────────────┘
    │         │
    │         ├─── Người nhận nhấn vào link
    │         │         ▼
    │         │    [Validate URL lần nữa (server-side)]
    │         │    [Mở tab mới với Google Meet URL]
    │         │
    │         └─── Link chưa có / lỗi
    │                   ▼
    │              [Toast notification: "Link không hợp lệ"]
    │
    │    NO   ▼
    │    [Gửi như text thông thường]
    │    [KHÔNG hiển thị Custom Dialog]
```

### 7.1 Cấu trúc Meet Link message

```json
{
  "type": "MEET_LINK",
  "content": "https://meet.google.com/abc-defg-hij",
  "display_text": "Join Classroom (Google Meet) / クラスに入る",
  "validated": true
}
```

---

## 8. Workflow: Đặt Lịch Luyện Nói (Lesson Request)

> **Người gửi lịch: Partner**
> **Người nhận và phản hồi: Learner**

### 8.1 Partner tạo Lesson Request

```text
[Partner — Màn hình Tin nhắn ID 15]
    │
    ├─── Nhấn nút "Đặt buổi học / 予約" (góc dưới phải)
    │
    ▼
[Hiển thị form đặt lịch (panel bên phải)]
    │
    ├─── Nhập ngày học (Date Picker)
    │         Validation: Không chọn ngày trong quá khứ
    │         → Ngày quá khứ bị grey out / disabled
    │
    ├─── Nhập giờ bắt đầu (Time Picker)
    │         Format: HH:MM
    │         → Giờ trong quá khứ (cùng ngày) bị grey out
    │
    ├─── Chọn thời lượng (Dropdown)
    │         Lựa chọn: 30, 45, 60, 75, 90, 105, 120 phút
    │         (từ 30 phút, tăng 15 phút mỗi bước, tối đa 120 phút)
    │
    ▼
[Hiển thị Summary Card]
    │  Tóm tắt: Ngày, Giờ bắt đầu, Giờ kết thúc, Thời lượng
    │  Timezone: Hanoi Time (GMT+7)
    │  Hiển thị cả 2 timezone (Partner + Learner nếu khác)
    │
    ▼
[Partner nhấn "Xác Nhận / 確定"]
    │
    ▼
[Client-side Validation]
    │
    ├─── Ngày/giờ hợp lệ? → Tiếp tục
    ├─── Ngày/giờ không hợp lệ → Highlight đỏ ô lỗi + thông báo lỗi
    │
    ▼
[API POST /lessons/request]
    │
    ▼
[Server-side Validation]
    │
    ├─── Ngày/giờ trong quá khứ? → 400 Bad Request
    ├─── Conflict lịch với buổi khác? → 409 Conflict
    ├─── Hợp lệ → Tạo Lesson Request trong DB
    │             {status: "PENDING", partner_id, learner_id, datetime, duration}
    │
    ▼
[Server gửi WebSocket event tới Learner]
    │  type: "LESSON_REQUEST"
    │
    ▼
[Hiển thị Lesson Request Card trong chat (cả hai bên)]
    │
    ┌───────────────────────────────────────────────┐
    │  ĐỀ XUẤT BUỔI HỌC MỚI / 新しいレッスンの提案   │
    │                                               │
    │  📖 Yêu cầu đã gửi / リクエスト送信済み        │
    │     Chờ đối tác xác nhận / パートナーの承認待ち  │
    │                                               │
    │  📅 Thứ Sáu, 27/10/2023 / 2023年10月27日(金)   │
    │  🕒 15:00 - 15:45 (GMT+7)                     │
    │                                               │
    │  [Hủy / キャンセル]    [Chi tiết / 詳細]        │
    └───────────────────────────────────────────────┘
    │
    │  Status Badge: PENDING / 保留中 (màu vàng)
```

### 8.2 Cấu trúc Lesson Request

```json
{
  "type": "LESSON_REQUEST",
  "lesson_id": "uuid",
  "partner_id": "uuid",
  "learner_id": "uuid",
  "date": "2025-05-18",
  "start_time": "15:00",
  "end_time": "15:45",
  "duration_minutes": 45,
  "timezone": "Asia/Ho_Chi_Minh",
  "status": "PENDING",
  "location": "Hà Nội, Việt Nam",
  "google_meet_url": null
}
```

---

## 9. Workflow: Xác Nhận / Từ Chối Lịch Hẹn

> Tương ứng với **2 màn hình khác nhau**:
>
> - Learner nhận và phản hồi → Màn hình ID 11 (Learner)
> - Partner gửi và theo dõi → Màn hình ID 15 (Partner)

### 9.1 Luồng từ phía Learner (màn hình ID 11)

```text
[Learner thấy Lesson Request Card trong chat]
    │
    │  ┌─────────────────────────────────────────────────┐
    │  │  Lesson Request / レッスンリクエスト  PENDING/保留中│
    │  │                                                  │
    │  │  📅 Thứ Ba, 24/02 / 2月24日 (火)                 │
    │  │     Hà Nội, Việt Nam                             │
    │  │  🕒 19:00 - 20:00 (Hanoi Time)                  │
    │  │                                                  │
    │  │  [Accept Request / 承認]  [Decline / 辞退]       │
    │  └─────────────────────────────────────────────────┘
    │
    ├─────────────────────────────────────────────
    │  TRƯỜNG HỢP 1: Learner nhấn "Accept Request / 承認"
    │─────────────────────────────────────────────
    │
    │  [Hiển thị loading trên nút Accept]
    │         │
    │         ▼
    │  [API PATCH /lessons/{lesson_id}/accept]
    │         │
    │         ├─── Thành công (200 OK):
    │         │         ▼
    │         │    [Cập nhật Status Badge → ACCEPTED / 承認済み (màu xanh lá)]
    │         │    [Vô hiệu hóa cả 2 nút Accept & Decline]
    │         │    [Gửi WebSocket event "LESSON_ACCEPTED" tới Partner]
    │         │    [Cập nhật lịch hẹn trên Trang chủ Learner (ID 7)]
    │         │    [Cập nhật danh sách buổi học trên Trang chủ Partner (ID 14)]
    │         │
    │         └─── Thất bại (4xx/5xx):
    │                   ▼
    │              [Hiển thị toast error: "Có lỗi xảy ra, vui lòng thử lại"]
    │
    ├─────────────────────────────────────────────
    │  TRƯỜNG HỢP 2: Learner nhấn "Decline / 辞退"
    │─────────────────────────────────────────────
    │
    │  [Hiển thị Confirmation Dialog]
    │  ┌────────────────────────────────────────┐
    │  │  Bạn có chắc muốn từ chối lịch hẹn này? │
    │  │  [Hủy bỏ]          [Xác nhận từ chối]   │
    │  └────────────────────────────────────────┘
    │         │
    │         ├─── Nhấn "Hủy bỏ" → Đóng dialog, không thay đổi gì
    │         │
    │         └─── Nhấn "Xác nhận từ chối"
    │                   │
    │                   ▼
    │              [API PATCH /lessons/{lesson_id}/decline]
    │                   │
    │                   ├─── Thành công (200 OK):
    │                   │         ▼
    │                   │    [Cập nhật Status Badge → DECLINED / 辞退 (màu đỏ)]
    │                   │    [Vô hiệu hóa cả 2 nút]
    │                   │    [Gửi WebSocket event "LESSON_DECLINED" tới Partner]
    │                   │    [Xóa lịch hẹn khỏi DB — không hiển thị trong lịch sử]
    │                   │
    │                   └─── Thất bại → Toast error
```

### 9.2 Luồng Partner theo dõi phản hồi (màn hình ID 15)

```text
[Partner nhận WebSocket event từ Learner]
    │
    ├─── Event: "LESSON_ACCEPTED"
    │         ▼
    │    [Cập nhật Lesson Request Card → ACCEPTED]
    │    [Hiển thị toast: "Học viên đã xác nhận lịch hẹn!"]
    │    [Cập nhật "Lịch học sắp tới" trên Trang chủ (ID 14)]
    │    [Hiển thị nút "Join Classroom" nếu có Meet link]
    │
    └─── Event: "LESSON_DECLINED"
              ▼
         [Cập nhật Lesson Request Card → DECLINED]
         [Hiển thị toast: "Học viên đã từ chối lịch hẹn"]
         [Lịch hẹn bị xóa khỏi danh sách]
```

### 9.3 Partner Hủy Lesson Request (trước khi Learner phản hồi)

```text
[Lesson Request ở trạng thái PENDING]
    │
    ▼
[Partner nhấn "Hủy / キャンセル" trên card]
    │
    ▼
[API DELETE /lessons/{lesson_id}]
    │
    ├─── Thành công:
    │         ▼
    │    [Xóa card khỏi chat (cả 2 bên)]
    │    [Gửi WebSocket event "LESSON_CANCELLED" tới Learner]
    │    [Xóa khỏi DB]
    │
    └─── Thất bại → Toast error
```

---

## 10. Workflow: Quản Lý Trạng Thái Lịch Sử Buổi Học

### 10.1 Quy tắc xác định trạng thái

| Điều kiện | Trạng thái | Hiển thị |
| --- | --- | --- |
| `end_datetime < now` và status=ACCEPTED | Hoàn thành / 完了 | Màu xanh lá |
| `start_datetime > now` và status=ACCEPTED | Sắp tới / 予定 | Màu xanh dương |
| `start_datetime ≤ now ≤ end_datetime` | Đang diễn ra / 進行中 | Màu cam |
| status=DECLINED hoặc CANCELLED | Không hiển thị | — |

### 10.2 Hiển thị trong lịch sử (Partner — ID 15)

```text
[Partner xem Lịch sử — Panel Lịch sử]
    │
    ▼
[API GET /lessons/history?partner_id={id}]
    │
    ▼
[Hệ thống query DB và tính toán trạng thái]
    │  So sánh datetime với thời gian hiện tại (Server time, GMT+7)
    │
    ▼
[Hiển thị danh sách với status tương ứng]
    │
    ├─── Chỉ hiển thị: ACCEPTED (Hoàn thành, Sắp tới, Đang diễn ra)
    └─── Ẩn hoàn toàn: DECLINED, CANCELLED (không query, không hiển thị)
```

### 10.3 Hiển thị trên Trang chủ Learner (ID 7) — "Lịch hẹn sắp tới"

```text
[API GET /lessons/upcoming?learner_id={id}]
    │  Filter: status=ACCEPTED AND start_datetime > now
    │  Sort: start_datetime ASC (buổi gần nhất lên trên)
    │  Limit: 3 (chỉ hiển thị 3 buổi gần nhất)
    │
    ▼
[Hiển thị danh sách với thông tin]
    │
    ├─── Avatar Partner (tròn)
    ├─── Tên Partner
    ├─── Ngày: DD/MM/YYYY (có icon calendar)
    ├─── Giờ: HH:MM - HH:MM (có icon clock)
    └─── Nút "Join / 入室"
              │
              ▼
         [Nhấn "Join" → Chuyển tới Màn hình Tin nhắn ID 11 với Partner đó]
```

---

## 11. Workflow: Trạng Thái Online/Offline Partner

### 11.1 Phát hiện và cập nhật trạng thái

```text
[User đăng nhập thành công]
    │
    ▼
[WebSocket connect → Gửi event "USER_ONLINE" {user_id, role}]
    │
    ▼
[Server cập nhật DB: users.is_online = true, last_seen = now]
    │
    ▼
[Broadcast tới tất cả người đang xem màn hình Matching (ID 10)]
    │
    ▼
[Hiển thị: Chấm xanh (●) bên cạnh avatar Partner]

─────────────────────────────────────────────────────

[User đóng tab / mất kết nối]
    │
    ▼
[WebSocket disconnect → Server nhận event "disconnect"]
    │
    ▼
[Server cập nhật: users.is_online = false, last_seen = now]
    │  (Debounce 30 giây để tránh flicker khi reload nhanh)
    │
    ▼
[Broadcast "USER_OFFLINE" tới các client liên quan]
    │
    ▼
[Hiển thị: Chấm xám (●) bên cạnh avatar]
```

### 11.2 Hiển thị trong chat (ID 11 và ID 15)

```text
[Màn hình Tin nhắn đang mở]
    │
    ├─── Header chat hiển thị trạng thái Partner:
    │         "● Online / オンライン" (chấm xanh)
    │         "● Offline / オフライン" (chấm xám)
    │
    └─── Cập nhật real-time qua WebSocket (polling fallback nếu cần)
```

---

## 12. Sơ Đồ Màn Hình Liên Quan

```text
┌─────────────────────────────────────────────────────────────────┐
│                        LUỒNG TỔNG QUAN                          │
└─────────────────────────────────────────────────────────────────┘

[Learner — Màn hình Matching ID 10]
         │
         │ Nhấn "Message"
         ▼
[Learner — Màn hình Tin nhắn ID 11]
         │                              ◄────── [WebSocket] ──────►
         │                                                          │
         ▼                                                          ▼
[Chat: Gửi/nhận text]                              [Partner — Màn hình Tin nhắn ID 15]
[Chat: Gửi Meet link]                              [Chat: Gửi/nhận text]
[Nhận Lesson Request]         ◄── LESSON_REQUEST ──[Chat: Đặt lịch]
[Accept / Decline]            ─── LESSON_ACCEPTED ►[Cập nhật trạng thái]
                              ─── LESSON_DECLINED ►[Cập nhật trạng thái]
         │
         ▼
[Learner — Trang chủ ID 7]
[Hiển thị: Lịch hẹn sắp tới]
[Nút "Join" → Quay lại ID 11]

                                   [Partner — Trang chủ ID 14]
                                   [Hiển thị: Lịch học sắp tới]
                                   [Hiển thị: Yêu cầu mới]
```

---

## 13. Điều Kiện Tiếp Nhận Tổng Hợp (Acceptance Criteria)

### AC-MSG-01: Gửi / nhận tin nhắn real-time

- [ ] Tin nhắn hiển thị trên màn hình đối phương với latency **≤ 1 giây**
- [ ] Tin nhắn gửi hiển thị căn phải (nền xanh đậm, chữ trắng)
- [ ] Tin nhắn nhận hiển thị căn trái (nền trắng, viền xám)
- [ ] Mỗi bong bóng chat hiển thị 2 dòng: gốc + bản dịch
- [ ] Timestamp hiển thị đúng format (HH:MM / Hôm qua / DD/MM)
- [ ] Ô trống → nút gửi không active, không gửi được

### AC-MSG-02: Xử lý offline

- [ ] Khi mất mạng, icon "⏳ đang chờ gửi" hiển thị trên tin nhắn
- [ ] Khi có mạng trở lại, tự động gửi lại theo thứ tự
- [ ] Sau 3 lần retry thất bại → hiển thị "❌ Gửi thất bại" + nút retry thủ công
- [ ] Banner "Mất kết nối" hiển thị khi offline

### AC-MSG-03: Lịch sử chat

- [ ] Khi mở lại đoạn hội thoại: toàn bộ lịch sử hiển thị chính xác
- [ ] Lazy load 50 tin nhắn/lần
- [ ] Scroll lên top → tự động tải thêm 50 tin cũ hơn
- [ ] Vị trí scroll không bị nhảy khi prepend tin cũ hơn

### AC-MSG-04: Dịch tự động

- [ ] Mỗi tin nhắn hiển thị 2 ngôn ngữ (gốc + dịch)
- [ ] Bản dịch được lưu DB, không gọi API lại khi load lịch sử
- [ ] Khi API dịch thất bại: ẩn dòng dịch, không hiện lỗi

### AC-MSG-05: Google Meet link

- [ ] URL validate đúng pattern `https://meet.google.com/xxx-xxx-xxx`
- [ ] URL hợp lệ → hiển thị Custom Dialog "Join Classroom"
- [ ] Nhấn vào → mở tab mới với Meet URL
- [ ] URL không hợp lệ → gửi như text thường

### AC-MSG-06: Đặt lịch (Lesson Request)

- [ ] Ngày/giờ quá khứ bị grey out / disabled trong picker
- [ ] Thời lượng dropdown: 30, 45, 60, 75, 90, 105, 120 phút
- [ ] Thời gian hiển thị đúng timezone người dùng (auto-detect)
- [ ] Hiển thị cả 2 timezone nếu Partner và Learner khác múi giờ
- [ ] Status badge PENDING màu vàng, ACCEPTED màu xanh lá, DECLINED màu đỏ

### AC-MSG-07: Xác nhận / Từ chối lịch

- [ ] Nút Accept/Decline chỉ active khi status = PENDING
- [ ] Nhấn Decline → hiển thị confirmation dialog trước
- [ ] Sau khi Accept/Decline → vô hiệu hóa cả 2 nút
- [ ] Partner nhận WebSocket notification ngay lập tức
- [ ] DECLINED/CANCELLED → xóa khỏi DB, không hiển thị trong lịch sử

### AC-MSG-08: Trạng thái online

- [ ] Chấm xanh (online) / xám (offline) cập nhật real-time
- [ ] Hiển thị đúng trên danh sách Matching (ID 10) và header chat (ID 11, 15)

---

## Ghi Chú Kỹ Thuật

### API Endpoints tham khảo

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| GET | `/conversations` | Lấy danh sách hội thoại |
| GET | `/conversations/{id}/messages` | Lấy lịch sử chat (lazy load) |
| POST | `/conversations/{id}/messages` | Gửi tin nhắn mới |
| POST | `/lessons/request` | Partner tạo Lesson Request |
| PATCH | `/lessons/{id}/accept` | Learner xác nhận |
| PATCH | `/lessons/{id}/decline` | Learner từ chối |
| DELETE | `/lessons/{id}` | Partner hủy Request (PENDING) |
| GET | `/lessons/upcoming` | Lịch hẹn sắp tới của Learner |
| GET | `/lessons/history` | Lịch sử buổi học của Partner |

### WebSocket Events

| Event | Chiều | Mô tả |
| --- | --- | --- |
| `MESSAGE` | Server → Client | Tin nhắn mới |
| `LESSON_REQUEST` | Server → Learner | Partner đặt lịch |
| `LESSON_ACCEPTED` | Server → Partner | Learner xác nhận |
| `LESSON_DECLINED` | Server → Partner | Learner từ chối |
| `LESSON_CANCELLED` | Server → Learner | Partner hủy |
| `USER_ONLINE` | Client → Server | User vừa đăng nhập |
| `USER_OFFLINE` | Server → All | User mất kết nối |

### Timezone Rules

- Toàn bộ lưu trữ trong DB theo **UTC**
- Hiển thị tự động convert sang timezone người dùng (browser `Intl.DateTimeFormat`)
- Lesson Request hiển thị **Hanoi Time (GMT+7)** làm chuẩn chính
- Nếu hai bên khác timezone → hiển thị cả 2

---

Document version: 1.0 | Dự án: VietImmerse | Module: Messaging
