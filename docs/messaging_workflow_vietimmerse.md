# Workflow chi tiết – Chức năng nhắn tin (Chat)
## VietImmerse · Màn hình ID 11 (Người học) & ID 15 (Partner)

---

## 1. Tổng quan chức năng

| Thuộc tính | Chi tiết |
|---|---|
| Chức năng ID | 11 – Chat với đối phương |
| Màn hình liên quan | ID 11 (Người học), ID 15 (Partner) |
| Role sử dụng | 1.0 Người có nhu cầu học · 3.0 Partner người Việt |
| Mục tiêu | Trao đổi tin nhắn, đặt lịch học, gửi link Google Meet |
| Công nghệ real-time | WebSocket |
| Dịch tự động | Google Translate API hoặc Local LLM |

### Hai màn hình riêng biệt theo role

```
Người học (ID 11)               Partner (ID 15)
├── Danh sách hội thoại         ├── Danh sách hội thoại
├── Khu vực chat                ├── Khu vực chat
├── Nhận Lesson Request         ├── Tạo Lesson Request (form đặt lịch)
│   ├── Accept                  ├── Summary xác nhận
│   └── Decline                 └── Lịch sử buổi học
└── Join Google Meet
```

---

## 2. Điểm truy cập (Entry Points)

### 2.1 Người học

| Nguồn | Hành động | Kết quả |
|---|---|---|
| Trang chủ người học (ID 7) | Nhấn "Join / 入室" trên thẻ lịch hẹn | Mở chat với partner đang kết nối |
| Màn hình Matching (ID 10) | Nhấn nút "Message" trên card partner | Tạo hội thoại mới (nếu chưa có) → mở ID 11 |
| Navbar "Match" | Nhấn "Xem tin nhắn" | Vào danh sách tất cả hội thoại |

### 2.2 Partner

| Nguồn | Hành động | Kết quả |
|---|---|---|
| Trang chủ partner (ID 14) | Nhấn "Vào phòng" trên thẻ buổi học tiếp theo | Mở chat với người học tương ứng |
| Mục "Yêu cầu mới" (ID 14) | "Xem tất cả" → chọn người học | Mở hội thoại cụ thể |
| Navbar | Menu Messaging | Vào danh sách hội thoại |

---

## 3. Cấu trúc giao diện

### 3.1 Màn hình ID 11 – Người học

```
┌──────────────────────────────────────────────────────┐
│  Header: Logo | Home | Match | Lab | Settings | User  │
├─────────────────────┬────────────────────────────────┤
│   PANEL TRÁI        │   PANEL PHẢI (Chat)            │
│                     │                                │
│  [Tin nhắn /        │  ┌──────────────────────────┐  │
│   メッセージ]        │  │ Avatar · Tên partner     │  │
│                     │  │ ● Online / ● Offline     │  │
│  ┌─────────────┐    │  └──────────────────────────┘  │
│  │ 👤 Minh Anh │    │                                │
│  │ 19:02       │    │  [Tin nhận – trái, trắng]      │
│  │ Xin chào... │    │  [Tin nhận – dịch JP bên dưới] │
│  └─────────────┘    │                                │
│  ┌─────────────┐    │  [Tin gửi – phải, xanh đậm]   │
│  │ 👤 Thu Hà   │    │  [Tin gửi – dịch JP bên dưới]  │
│  │ Hôm qua     │    │                                │
│  │ Cảm ơn...   │    │  ┌── Lesson Request Card ───┐  │
│  └─────────────┘    │  │ Lesson Request / レッスン  │  │
│                     │  │ [PENDING]                 │  │
│                     │  │ 📅 Thứ Ba, 24/02          │  │
│                     │  │ 🕐 19:00 – 19:30           │  │
│                     │  │ [Accept] [Decline]        │  │
│                     │  └───────────────────────────┘  │
│                     │                                │
│                     │  [Join Classroom (Google Meet)] │
│                     │                                │
│                     │  ┌────────────────────────┐    │
│                     │  │ Viết tin nhắn... [→]   │    │
│                     │  └────────────────────────┘    │
└─────────────────────┴────────────────────────────────┘
```

### 3.2 Màn hình ID 15 – Partner

```
┌──────────────────────────────────────────────────────┐
│  Header: Logo | Home | Match | Settings | User        │
├─────────────────────┬────────────────────────────────┤
│   PANEL TRÁI        │   PANEL PHẢI                   │
│                     │                                │
│  Danh sách          │  ┌── Header chat ──────────┐   │
│  hội thoại          │  │ Avatar · Tên · Online   │   │
│                     │  └─────────────────────────┘   │
│  [Kenji · Online]   │                                │
│  [Taro · Hôm qua]   │  [Khu vực chat – bong bóng]   │
│                     │                                │
│                     │  ┌── Form đặt lịch ────────┐   │
│                     │  │ Tiêu đề: 学習時間設定    │   │
│                     │  │ 📅 Ngày học: [picker]   │   │
│                     │  │ 🕐 Giờ bắt đầu: [HH:MM] │   │
│                     │  │ ⏱  Thời lượng: [30–120] │   │
│                     │  │ ── Summary ──           │   │
│                     │  │ Thứ 3, 24/02 · 19:00    │   │
│                     │  │ 30 phút                 │   │
│                     │  │ [Xác nhận]              │   │
│                     │  └─────────────────────────┘   │
│                     │                                │
│                     │  ┌── Lịch sử ─────────────┐   │
│                     │  │ Hoàn thành / Sắp tới   │   │
│                     │  └─────────────────────────┘   │
│                     │                                │
│                     │  ┌────────────────────────┐    │
│                     │  │ Viết tin nhắn... [→]   │    │
│                     │  └────────────────────────┘    │
└─────────────────────┴────────────────────────────────┘
```

---

## 4. Workflow chi tiết theo role

### 4.1 Workflow – Người học

#### Bước 1: Mở màn hình nhắn tin

```
[Truy cập từ một trong 3 nguồn]
        │
        ├─ Join từ Trang chủ → Mở chat với partner cụ thể
        ├─ Message từ Matching → Tạo/mở hội thoại
        └─ Xem tin nhắn từ navbar → Danh sách tất cả
                │
                ▼
        [Hiển thị màn hình ID 11]
        - Panel trái: danh sách hội thoại (lazy load 50 tin/lần)
        - Panel phải: chat với partner được chọn
```

#### Bước 2: Xem danh sách hội thoại

Mỗi dòng trong danh sách hiển thị:
- Avatar partner (hình tròn, lấy từ API · mặc định nếu chưa có)
- Tên partner
- Thời gian tin nhắn cuối: `HH:MM` (hôm nay) · `Hôm qua` · `DD/MM` (cũ hơn)
- Xem trước nội dung tin cuối (rút gọn, dấu `...`)

Nhấn vào dòng → mở chat bên phải.

#### Bước 3: Gửi tin nhắn

```
Người học nhập nội dung vào ô "Viết tin nhắn..."
        │
        ├─ Enter hoặc nhấn nút gửi (tròn, xanh đậm)
        │       │
        │       ├─ [Ô trống] → Không gửi
        │       │
        │       └─ [Có nội dung] → Gửi qua WebSocket
        │               │
        │               ├─ [Thành công] → Hiện tin bên phải (xanh đậm) + xóa ô nhập
        │               │                 Partner nhận trong ≤ 1 giây
        │               │
        │               └─ [Mất mạng]  → Vào offline queue · icon "đang chờ gửi"
        │                               → Tự retry khi có mạng
        │                               → Fail 3 lần → "Gửi thất bại" + nút retry thủ công
        │
        └─ Shift+Enter → Xuống dòng (không gửi)
```

**Định dạng bong bóng tin nhắn:**

| Loại | Căn | Nền | Chữ | Nội dung bổ sung |
|---|---|---|---|---|
| Tin gửi (người học) | Phải | Xanh đậm | Trắng | — |
| Tin nhận (từ partner) | Trái | Trắng | Đen | + Dịch tự động sang tiếng Nhật bên dưới |

#### Bước 4: Nhận và xử lý Lesson Request

```
Partner gửi lịch hẹn
        │
        ▼
Thẻ Lesson Request tự chèn vào chat (trạng thái: PENDING – vàng)
        │
        ├─ Hiển thị:
        │   • Tiêu đề: "Lesson Request / レッスンリクエスト"
        │   • Badge: [PENDING]
        │   • 📅 Ngày: "Thứ Ba, 24/02 / 2月24日（火）"
        │   • 🕐 Giờ: "19:00 – 19:30" (múi giờ Hà Nội)
        │   • Nút [Accept Request] (xanh đậm) + [Decline] (xám)
        │
        ├─ Người học nhấn [Accept Request]
        │       │
        │       ▼
        │   API xác nhận → Badge chuyển ACCEPTED (xanh lá)
        │   Nút bị vô hiệu hóa · Lịch hẹn thêm vào Trang chủ cả 2 bên
        │
        └─ Người học nhấn [Decline]
                │
                ▼
            Dialog xác nhận → Xác nhận → API từ chối
            Badge chuyển DECLINED (đỏ) · Nút bị vô hiệu hóa
            Không tạo lịch hẹn
```

> **Lưu ý:** Nút Accept/Decline chỉ hiển thị và hoạt động khi trạng thái là PENDING. Sau khi xử lý, nút bị vô hiệu hóa vĩnh viễn.

#### Bước 5: Tham gia buổi học qua Google Meet

```
Partner gửi link Google Meet vào chat
        │
        ▼
Hệ thống validate URL: khớp pattern https://meet.google.com/xxx-xxx-xxx
        │
        ├─ [Hợp lệ]   → Hiển thị custom dialog "Join Classroom"
        │               với icon Google Meet + text link + icon external
        │               Người học nhấn → Mở tab mới
        │
        └─ [Không hợp lệ hoặc chưa có link] → Toast thông báo lỗi
```

---

### 4.2 Workflow – Partner

#### Bước 1: Mở màn hình nhắn tin

```
[Truy cập từ một trong các nguồn]
        │
        ├─ Trang chủ partner (ID 14) → Thẻ "Buổi học tiếp theo" → "Vào phòng"
        ├─ Mục "Yêu cầu mới" → "Xem tất cả" → Chọn người học
        └─ Navbar Messaging
                │
                ▼
        [Hiển thị màn hình ID 15]
        - Panel trái: danh sách hội thoại
        - Panel phải: chat + form đặt lịch + lịch sử
```

#### Bước 2: Gửi tin nhắn

Tương tự người học: nhập → Enter hoặc nhấn gửi. Hỗ trợ offline queue và retry. Bong bóng chat hiển thị song ngữ Việt–Nhật.

#### Bước 3: Tạo Lesson Request – Điền form đặt lịch

```
Partner nhấn tạo Lesson Request
        │
        ▼
Form đặt lịch hiện trong màn hình (No.9–14 của ID 15):

┌─ Trường bắt buộc ────────────────────────────────────┐
│  📅 Ngày học        [Date picker]                     │
│     └─ Ngày quá khứ: bôi xám hoặc validation đỏ      │
│                                                       │
│  🕐 Giờ bắt đầu    [Giờ] : [Phút]  (VD: 15:00)      │
│                                                       │
│  ⏱  Thời lượng     [Dropdown]                        │
│     └─ Giá trị: 30 / 45 / 60 / 75 / 90 / 105 / 120  │
│        (từ 30 phút, tăng 15 phút, tối đa 120)        │
└───────────────────────────────────────────────────────┘
        │
        ▼
Summary hiển thị nội dung đã nhập (real-time)
        │
        ▼
Partner nhấn [Xác nhận]
        │
        ├─ [Dữ liệu hợp lệ] → Gửi API tạo Lesson Request
        │                      Thẻ PENDING chèn vào chat cả 2 bên
        │
        └─ [Dữ liệu không hợp lệ] → Bôi đỏ trường lỗi (client + server validate)
```

> **Timezone:** Giờ tự động convert theo timezone của từng user (detect tự động). Hiển thị song song cả 2 timezone khi chọn slot.

#### Bước 4: Theo dõi phản hồi từ người học

```
Lesson Request đã gửi → Trạng thái PENDING (vàng)
        │
        ├─ Người học Accept
        │       ▼
        │   Badge → ACCEPTED (xanh lá)
        │   Lịch hẹn xuất hiện trên Trang chủ cả 2
        │   Partner nhận thông báo
        │
        └─ Người học Decline
                ▼
            Badge → DECLINED (đỏ)
            Không tạo lịch · Partner thấy trạng thái cập nhật
```

#### Bước 5: Quản lý lịch sử buổi học

Bảng lịch sử hiển thị ngay trong màn hình nhắn tin (No.14 của ID 15):

| Trạng thái | Điều kiện |
|---|---|
| Hoàn thành | Thời gian buổi học đã qua |
| Sắp tới | Thời gian buổi học trong tương lai |
| Đang diễn ra | Đang trong khung giờ của buổi học |
| *(Không hiển thị)* | Buổi học bị hủy → xóa khỏi database |

---

## 5. Luồng tương tác đầy đủ (End-to-End)

### Luồng A – Người học chủ động liên hệ partner

```
Người học                    Hệ thống                     Partner
    │                            │                            │
    │── Tìm partner (ID 10) ──→  │                            │
    │   Nhấn "Message"           │                            │
    │                            │── Tạo hội thoại mới ──→   │
    │                            │   (nếu chưa có)            │
    │←── Mở chat (ID 11) ───────│                            │
    │                            │                            │
    │── Nhập & gửi tin ────────→ │                            │
    │                            │──── WebSocket ────────────→│
    │                            │     latency ≤ 1s           │
    │                            │                            │← Đọc tin & trả lời
    │←─────────────────────────  │←──── WebSocket ────────────│
    │                            │                            │
```

### Luồng B – Partner đặt lịch học

```
Partner                      Hệ thống                   Người học
    │                            │                            │
    │── Mở chat (ID 15) ──────→  │                            │
    │── Điền form đặt lịch ───→  │                            │
    │   Ngày + giờ + thời lượng  │                            │
    │── Nhấn Xác nhận ─────────→ │                            │
    │                            │── Tạo Lesson Request ────→ │
    │                            │   Thẻ PENDING trong chat   │
    │←─── Thẻ hiện trong chat ── │                            │
    │                            │                            │
    │                            │         Người học nhấn Accept
    │                            │←─────────────────────────  │
    │←── Badge: ACCEPTED ─────── │                            │
    │    Lịch hẹn được tạo        │── Tạo lịch hẹn ──────────→│
    │                            │   Hiện trên Trang chủ cả 2 │
```

### Luồng C – Tham gia buổi học qua Google Meet

```
Partner                      Hệ thống                   Người học
    │                            │                            │
    │── Gửi link Meet ─────────→ │                            │
    │   https://meet.google.com  │── Validate URL ──────────→ │
    │   /xxx-xxx-xxx             │   Custom dialog hiện       │
    │                            │                            │
    │                            │        Người học nhấn Join
    │                            │←─────────────────────────  │
    │                            │── Lấy link từ API ───────→ │
    │                            │   Mở tab mới Google Meet   │
    │                            │                            │
    │←────── Cả 2 tham gia Meet ─────────────────────────────│
```

---

## 6. Trạng thái Lesson Request

```
                ┌─────────────────────────────────────────┐
                │                                         │
Partner tạo → [PENDING – Vàng]                           │
                │                                         │
                ├─ Người học Accept → [ACCEPTED – Xanh lá]│
                │                    Lịch hẹn được tạo    │
                │                                         │
                └─ Người học Decline → [DECLINED – Đỏ]   │
                                       Không tạo lịch     │
                                                         │
          (Sau khi xử lý: nút Accept/Decline vô hiệu hóa)│
                └─────────────────────────────────────────┘
```

| Trạng thái | Màu badge | Nút hành động | Ảnh hưởng |
|---|---|---|---|
| PENDING | Vàng `#F0AD4E` | Accept (xanh) + Decline (xám) | Chờ phản hồi |
| ACCEPTED | Xanh lá `#5CB85C` | Cả 2 nút vô hiệu | Tạo lịch hẹn, hiện Trang chủ |
| DECLINED | Đỏ `#D9534F` | Cả 2 nút vô hiệu | Không tạo lịch |

---

## 7. Quy tắc hiển thị thời gian

| Thời điểm tin nhắn | Hiển thị |
|---|---|
| Hôm nay | `HH:MM` (VD: 19:02) |
| Hôm qua | `Hôm qua` |
| Trước đó | `DD/MM` (VD: 24/02) |

**Timestamp dưới bong bóng tin:** luôn dạng `HH:MM`.

**Timezone lịch hẹn:** chuẩn hóa theo Hanoi Time (UTC+7). Khi partner chọn slot, hiển thị song song cả 2 timezone (của partner và người học).

---

## 8. Xử lý offline & độ trễ

```
Gửi tin khi mất mạng:
        │
        ▼
    Tin vào offline queue (local storage)
    Hiện icon "đang chờ gửi" bên cạnh tin
        │
        ▼
    Kết nối phục hồi → Tự động gửi lại
        │
        ├─ [Thành công] → Cập nhật trạng thái tin
        │
        └─ [Fail sau 3 lần retry] → Hiển thị "Gửi thất bại"
                                    + Nút retry thủ công
```

**Yêu cầu latency:** tin nhắn hiển thị trên màn hình đối phương trong **≤ 1 giây**.

---

## 9. Validate & ràng buộc kỹ thuật

### 9.1 Ô nhập tin nhắn

| Quy tắc | Mô tả |
|---|---|
| Không gửi khi rỗng | Nút gửi / phím Enter không phản hồi nếu ô trống |
| Nhiều dòng | Shift+Enter để xuống dòng |
| Tự động giãn | Ô nhập tự mở rộng theo số dòng nội dung |
| Hỗ trợ | Tiếng Việt, tiếng Nhật, emoji, ký tự đặc biệt |

### 9.2 Form đặt lịch (Partner)

| Trường | Validate |
|---|---|
| Ngày học | Không cho chọn ngày quá khứ (bôi xám hoặc bôi đỏ) |
| Giờ bắt đầu | Không cho chọn giờ đã qua trong ngày hôm nay |
| Thời lượng | Giá trị hợp lệ: 30, 45, 60, 75, 90, 105, 120 phút |
| Tổng thể | Validate cả client-side và server-side; trường lỗi bôi đỏ |

### 9.3 Google Meet link

```
Pattern: https://meet.google.com/[a-z]{3}-[a-z]{4}-[a-z]{3}
Ví dụ:   https://meet.google.com/abc-defg-hij

Hợp lệ   → Hiển thị custom dialog card "Join Classroom"
Không hợp lệ / chưa có → Toast thông báo lỗi
```

### 9.4 Lịch sử chat

- Lazy load **50 tin nhắn / lần**
- Scroll lên đầu danh sách để tải thêm 50 tin tiếp theo
- Khi mở lại hội thoại: toàn bộ lịch sử hiển thị chính xác

---

## 10. Trạng thái online

| Trạng thái | Chỉ thị | Hiển thị ở |
|---|---|---|
| Online | ● Xanh lá | Header chat + danh sách Matching |
| Offline | ● Xám | Header chat + danh sách Matching |

**Cập nhật real-time** qua WebSocket hoặc polling.

**Sắp xếp trong Matching:** Partner online ưu tiên hiển thị trước. Điều kiện sắp xếp phụ (cùng trạng thái online): theo đánh giá trung bình hoặc thời gian đăng ký mới nhất.

---

## 11. Dịch tự động song ngữ

Mỗi bong bóng tin nhắn hiển thị **2 dòng nội dung**:
1. Nội dung gốc (ngôn ngữ người gửi nhập)
2. Bản dịch tự động sang ngôn ngữ đối phương

| Bong bóng | Nội dung gốc | Dịch tự động |
|---|---|---|
| Tin nhận (người học nhận từ partner) | Tiếng Việt | → Tiếng Nhật |
| Tin gửi (người học gửi đi) | Tiếng Nhật (hoặc Việt) | → Tiếng Việt |

**Engine dịch:** Google Translate API hoặc Local LLM (cấu hình tùy môi trường deploy).

---

## 12. Phân quyền & bảo mật

| Điểm | Chi tiết |
|---|---|
| Xác thực | JWT (120 phút) + Refresh token |
| Role routing | Người học → ID 11 · Partner → ID 15 |
| Lesson Request | Chỉ partner được tạo; chỉ người học được Accept/Decline |
| Lịch sử buổi học | Chỉ partner xem trong ID 15; người học xem qua Trang chủ |
| Buổi học hủy | Xóa khỏi DB, không hiển thị ở bất kỳ đâu |

---

## 13. Acceptance Criteria (trích từ Product Backlog P_ID 8 & 9)

### Chức năng chat (P_ID 8)

- [ ] Gửi/nhận tin nhắn real-time qua WebSocket, latency ≤ 1 giây
- [ ] Offline queue: tự retry, hiển thị trạng thái "đang chờ" / "thất bại"
- [ ] Lịch sử chat hiển thị chính xác khi mở lại hội thoại
- [ ] Lazy load 50 tin/lần, scroll up để tải thêm
- [ ] Mỗi dòng chat hiển thị 2 ngôn ngữ (tự động dịch)
- [ ] Google Meet link validate đúng pattern, mở tab mới
- [ ] Giao diện theo đúng thiết kế ID 11, ID 15

### Đặt lịch học (P_ID 9)

- [ ] Validate ngày/giờ: không cho chọn quá khứ (client + server)
- [ ] Timezone tự động detect, hiển thị song song 2 timezone
- [ ] Lịch sử trạng thái: Hoàn thành / Sắp tới / Đang diễn ra
- [ ] Buổi hủy xóa khỏi DB, không hiển thị
- [ ] Lesson Request flow: Partner tạo → PENDING → Accept/Decline → cập nhật Trang chủ
- [ ] Giao diện form đặt lịch theo đúng No.9–14 của ID 15

---

*Tài liệu tham chiếu: カノエ\_システム仕様書\_ドミシー · Sheet: システム概要, 画面設計書, プロダクトバックログ (P\_ID 8, 9)*
