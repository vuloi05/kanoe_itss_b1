# VietImmerse — Workflow Kiểm Tra & Hoàn Thiện: Chức Năng "Đặt Buổi Học"

> **Phạm vi:** Tính năng Lesson Request Card trong màn hình Tin nhắn  
> **Áp dụng cho:** Màn hình Partner (ID 15) và Màn hình Learner (ID 11)  
> **Vấn đề chính:** Card đặt buổi học bị hiển thị sai vị trí trong luồng chat

---

## Mục Lục

1. [Mô tả bug hiện tại](#1-mô-tả-bug-hiện-tại)
2. [Hành vi mong muốn (Expected Behavior)](#2-hành-vi-mong-muốn-expected-behavior)
3. [Nguyên nhân gốc rễ](#3-nguyên-nhân-gốc-rễ)
4. [Workflow sửa lỗi — Frontend](#4-workflow-sửa-lỗi--frontend)
5. [Workflow sửa lỗi — Backend / Data Model](#5-workflow-sửa-lỗi--backend--data-model)
6. [Workflow kiểm tra hoàn chỉnh](#6-workflow-kiểm-tra-hoàn-chỉnh)
7. [Test cases](#7-test-cases)
8. [Acceptance Criteria](#8-acceptance-criteria)

---

## 1. Mô Tả Bug Hiện Tại

### 1.1 Quan sát từ ảnh chụp màn hình

**Màn hình Partner (localhost:3000/partner/messages):**

```text
[Trạng thái hiện tại — SAI]

─── Top of chat ───────────────────────────────────
│
│  ┌──────────────────────────────────────────────┐
│  │  ĐỀ XUẤT BUỔI HỌC MỚI                        │
│  │  Yêu cầu đã gửi  [Chờ xác nhận]              │
│  │  📅 Thứ Ba, 19/05/2026                        │
│  │  🕒 09:00 - 09:30 (30m) (GMT+7)              │
│  │  [Hủy]          [Chi tiết]                   │
│  └──────────────────────────────────────────────┘
│
│  ... nhiều tin nhắn văn bản tiếp theo ...
│
│  [abcd / ABCD]   ← tin nhắn mới nhất    13:46 ✓
─── Bottom of chat ────────────────────────────────
```

**Vấn đề:** Card "Đặt buổi học" bị hiển thị ở **đầu luồng chat** (thời điểm card được tạo), không di chuyển theo luồng tin nhắn. Sau khi Partner hoặc Learner tiếp tục nhắn tin, card bị "trôi lên" và bị che khuất bởi các tin nhắn mới hơn.

### 1.2 Mô tả chi tiết vòng đời hiện tại (lỗi)

```text
Timeline thực tế (SAI):

T1  Partner gửi Lesson Request
     → Card render tại vị trí timestamp T1

T2  Partner gửi tin nhắn "oke mạnh geii"
     → Bubble chat render tại T2 (bên DƯỚI card)

T3  Partner gửi Google Meet link
     → Card render tại T3 (bên DƯỚI bubble T2)

Kết quả: Card nằm mãi ở T1 (đầu), không phải cuối
```

---

## 2. Hành Vi Mong Muốn (Expected Behavior)

### 2.1 Nguyên tắc cốt lõi

> **Lesson Request Card phải được xử lý như một "loại tin nhắn đặc biệt" trong luồng chat, có `timestamp` riêng, và luôn render đúng vị trí theo thứ tự thời gian.**

### 2.2 Trạng thái đúng — Partner side (ID 15)

```text
[Hành vi mong muốn — ĐÚNG]

─── Top of chat ────────────────────────────────────
│
│  "mạnh geii"              [tin nhắn bên trái]
│  強いゲイイ               [dịch tự động]         13:45
│
│  "oke mạnh geii"                    [bên phải]
│  オーケー、強いゲイイ               [dịch]        13:46 ✓
│
│  ┌──────────────────────────────────────────────┐
│  │  ĐỀ XUẤT BUỔI HỌC MỚI                        │
│  │  Yêu cầu đã gửi  [Chờ xác nhận]              │
│  │  📅 Thứ Ba, 19/05/2026                        │
│  │  🕒 09:00 - 09:30 (30m) (GMT+7)              │
│  │  [Hủy]          [Chi tiết]                   │
│  └──────────────────────────────────────────────┘  13:57
│
│  ┌──────────────────────────────────────────────┐
│  │  🎥 Google Meet                               │
│  │  Join Classroom                               │
│  │  https://meet.google.com/iry-fsbu-oaj         │
│  │  [Tham gia ↗]                                 │
│  └──────────────────────────────────────────────┘  13:57 ✓
│
─── Bottom of chat (scroll position) ───────────────
```

### 2.3 Trạng thái đúng — Learner side (ID 11)

```text
─── Bottom of chat ──────────────────────────────────
│
│  ... các tin nhắn trước ...
│
│  ┌──────────────────────────────────────────────┐
│  │  Lesson Request / レッスンリクエスト  PENDING   │
│  │  📅 Thứ Ba, 19/05/2026                        │
│  │  Hà Nội, Việt Nam                             │
│  │  🕒 09:00 - 09:30 (Hanoi Time)               │
│  │                                               │
│  │  [Accept Request / 承認]  [Decline / 辞退]    │
│  └──────────────────────────────────────────────┘  13:57
│
─── Scroll tự động xuống đây ────────────────────────
```

---

## 3. Nguyên Nhân Gốc Rễ

### 3.1 Vấn đề kiến trúc dữ liệu

Lesson Request Card hiện tại **không được lưu trữ như một message** trong bảng `messages`, mà được xử lý riêng biệt và chỉ được "gắn" vào chat UI bằng cách khác (component riêng, inject vào đầu/cuối, hoặc overlay).

```text
Cấu trúc DB hiện tại (SAI):

Table: messages
  id | conversation_id | sender_id | content | type       | timestamp
  1  | conv_001        | partner_1 | "hello" | TEXT       | T1
  2  | conv_001        | learner_1 | "hi"    | TEXT       | T2

Table: lesson_requests  ← RIÊNG BIỆT, không liên kết messages
  id | conversation_id | partner_id | learner_id | datetime | status
  1  | conv_001        | partner_1  | learner_1  | ...      | PENDING
```

Kết quả: Frontend render `messages` theo thứ tự timestamp, nhưng `lesson_request` được inject vào UI **độc lập** → không có vị trí đúng trong timeline.

### 3.2 Vấn đề Frontend render

```javascript
// Cách render HIỆN TẠI (SAI)
function ChatView({ conversationId }) {
  const messages = useMessages(conversationId);        // Chỉ text messages
  const lessonRequest = useLessonRequest(conversationId); // Riêng biệt

  return (
    <div>
      {lessonRequest && <LessonRequestCard />}  {/* Luôn render đầu */}
      {messages.map(msg => <MessageBubble />)}
    </div>
  );
}
```

---

## 4. Workflow Sửa Lỗi — Frontend

### 4.1 Giải pháp: Unified Message Stream

Cốt lõi của giải pháp là **gộp toàn bộ nội dung chat** (tin nhắn text, Meet link card, Lesson Request card) vào **một luồng duy nhất**, sắp xếp theo `timestamp`.

```text
Luồng xử lý đúng:

[API Response]
     │
     ▼
getAllChatItems(conversationId)
     │
     ├── messages[]          (type: "TEXT" | "MEET_LINK")
     ├── lesson_requests[]   (type: "LESSON_REQUEST")
     │
     ▼
[Merge & Sort theo timestamp ASC]
     │
     ▼
unifiedItems = [
  { type: "TEXT",            timestamp: T1, ... },
  { type: "TEXT",            timestamp: T2, ... },
  { type: "LESSON_REQUEST",  timestamp: T3, ... },  ← đúng vị trí
  { type: "MEET_LINK",       timestamp: T4, ... },
]
     │
     ▼
[Render từng item theo type]
     │
     ├── type: "TEXT"           → <MessageBubble />
     ├── type: "MEET_LINK"      → <MeetLinkCard />
     └── type: "LESSON_REQUEST" → <LessonRequestCard />
```

### 4.2 Thay đổi code Frontend

#### Bước 1: Thêm `message_id` cho Lesson Request

Khi Partner nhấn "Đặt buổi học" và request được tạo, **đồng thời tạo một message record** trong bảng `messages` để đánh dấu vị trí trong timeline.

```typescript
// types/chat.ts
type MessageType = "TEXT" | "MEET_LINK" | "LESSON_REQUEST";

interface ChatItem {
  id: string;
  conversation_id: string;
  sender_id: string;
  type: MessageType;
  timestamp: string;          // ISO 8601, dùng để sort
  // Chỉ có khi type = "TEXT" | "MEET_LINK"
  content?: string;
  content_translated?: string;
  // Chỉ có khi type = "LESSON_REQUEST"
  lesson_request_id?: string;
  lesson_date?: string;
  lesson_start_time?: string;
  lesson_end_time?: string;
  lesson_duration?: number;
  lesson_status?: "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED";
}
```

#### Bước 2: Hook hợp nhất dữ liệu

```typescript
// hooks/useUnifiedChatItems.ts
function useUnifiedChatItems(conversationId: string): ChatItem[] {
  const [items, setItems] = useState<ChatItem[]>([]);

  useEffect(() => {
    async function fetchAll() {
      // Gọi 1 endpoint duy nhất trả về tất cả
      const response = await fetch(
        `/api/conversations/${conversationId}/items?limit=50`
      );
      const data = await response.json();

      // Sort theo timestamp tăng dần
      const sorted = data.items.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      setItems(sorted);
    }

    fetchAll();
  }, [conversationId]);

  // Lắng nghe WebSocket events mới
  useWebSocket({
    onMessage: (event) => {
      const newItem = parseWebSocketEvent(event);
      setItems(prev => {
        const updated = [...prev, newItem];
        return updated.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      });

      // Auto-scroll xuống cuối khi có item mới
      scrollToBottom();
    }
  });

  return items;
}
```

#### Bước 3: Component render thống nhất

```typescript
// components/ChatView.tsx
function ChatView({ conversationId }: { conversationId: string }) {
  const items = useUnifiedChatItems(conversationId);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll xuống item mới nhất khi mở chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items]);

  return (
    <div className="chat-messages-container">
      {items.map((item) => {
        switch (item.type) {
          case "TEXT":
            return <MessageBubble key={item.id} data={item} />;
          case "MEET_LINK":
            return <MeetLinkCard key={item.id} data={item} />;
          case "LESSON_REQUEST":
            return <LessonRequestCard key={item.id} data={item} />;
          default:
            return null;
        }
      })}

      {/* Anchor để auto-scroll */}
      <div ref={bottomRef} />
    </div>
  );
}
```

#### Bước 4: Xử lý WebSocket event mới

```typescript
// Khi Partner tạo Lesson Request thành công
// Server gửi WebSocket event tới cả 2 bên

// Partner side nhận:
{
  "event": "LESSON_REQUEST_CREATED",
  "item": {
    "id": "msg_uuid",
    "type": "LESSON_REQUEST",
    "sender_id": "partner_id",
    "timestamp": "2026-05-19T13:57:00+07:00",   // ← timestamp ĐÚNG lúc tạo
    "lesson_request_id": "lr_uuid",
    "lesson_date": "2026-05-19",
    "lesson_start_time": "09:00",
    "lesson_end_time": "09:30",
    "lesson_duration": 30,
    "lesson_status": "PENDING"
  }
}

// Client nhận event → append vào items[] → sort → render đúng vị trí
```

### 4.3 Xử lý auto-scroll

```typescript
// hooks/useAutoScroll.ts
function useAutoScroll(items: ChatItem[], containerRef: RefObject<HTMLDivElement>) {
  const prevLength = useRef(items.length);

  useEffect(() => {
    // Chỉ auto-scroll khi có item MỚI được thêm vào
    if (items.length > prevLength.current) {
      containerRef.current?.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
    prevLength.current = items.length;
  }, [items.length]);
}
```

### 4.4 Cập nhật real-time trạng thái Lesson Request Card

Khi Learner Accept/Decline, card phải cập nhật trạng thái **tại chỗ** mà không thay đổi vị trí:

```typescript
// Khi nhận WebSocket event LESSON_ACCEPTED / LESSON_DECLINED
setItems(prev =>
  prev.map(item => {
    if (item.type === "LESSON_REQUEST" && item.lesson_request_id === event.lesson_request_id) {
      return {
        ...item,
        lesson_status: event.new_status   // Cập nhật status, GIỮ NGUYÊN vị trí
      };
    }
    return item;
  })
);
// KHÔNG sort lại, KHÔNG thay đổi timestamp → card giữ đúng vị trí
```

---

## 5. Workflow Sửa Lỗi — Backend / Data Model

### 5.1 Thay đổi DB Schema

```sql
-- Thêm cột liên kết Lesson Request với Messages
ALTER TABLE lesson_requests
  ADD COLUMN message_id UUID REFERENCES messages(id);

-- Hoặc nếu muốn giữ tách biệt, thêm trường vào messages:
-- messages.lesson_request_id UUID REFERENCES lesson_requests(id)

-- messages.type mở rộng
ALTER TABLE messages
  ALTER COLUMN type TYPE VARCHAR(20);
-- Cho phép: 'TEXT', 'MEET_LINK', 'LESSON_REQUEST'
```

### 5.2 Thay đổi API

#### Endpoint cũ (cần xóa hoặc giữ lại nội bộ)

```text
GET /conversations/{id}/messages
GET /lessons/pending?conversation_id={id}
```

#### Endpoint mới (unified)

```text
GET /conversations/{id}/items?limit=50&offset=0

Response:
{
  "items": [
    {
      "id": "uuid",
      "type": "TEXT",
      "sender_id": "uuid",
      "content": "...",
      "content_translated": "...",
      "timestamp": "ISO8601",
      "is_read": true
    },
    {
      "id": "uuid",
      "type": "LESSON_REQUEST",
      "sender_id": "partner_uuid",
      "timestamp": "ISO8601",         // ← timestamp khi Partner nhấn "Xác nhận"
      "lesson_request_id": "uuid",
      "lesson_date": "2026-05-19",
      "lesson_start_time": "09:00",
      "lesson_end_time": "09:30",
      "lesson_duration": 30,
      "lesson_status": "PENDING",
      "timezone": "Asia/Ho_Chi_Minh"
    }
  ],
  "pagination": {
    "total": 10,
    "offset": 0,
    "limit": 50,
    "has_more": false
  }
}
```

### 5.3 Flow tạo Lesson Request (Backend)

```text
[Partner POST /lessons/request]
    │
    ▼
[Validate input]
    ├── Ngày giờ không phải quá khứ
    ├── Không conflict với lịch đã có
    └── conversation_id hợp lệ
    │
    ▼
[Transaction: Tạo 2 record cùng lúc]
    │
    ├── INSERT INTO lesson_requests
    │     (partner_id, learner_id, datetime, duration, status='PENDING')
    │     → Lấy lesson_request_id
    │
    └── INSERT INTO messages
          (conversation_id, sender_id=partner_id,
           type='LESSON_REQUEST', lesson_request_id,
           timestamp=NOW())       ← timestamp chính xác
          → Lấy message_id
    │
    ▼
[Cập nhật lesson_requests.message_id = message_id]
    │
    ▼
[WebSocket broadcast tới room: conversation_id]
    │  Event: LESSON_REQUEST_CREATED
    │  Payload: toàn bộ ChatItem object
    │
    ▼
[Response 201 Created]
```

---

## 6. Workflow Kiểm Tra Hoàn Chỉnh

### 6.1 Kiểm tra vị trí hiển thị Card

```text
SCENARIO A: Card hiển thị đúng vị trí khi chat còn ít tin

Điều kiện:
  - Partner và Learner đã kết nối chat
  - Chưa có tin nhắn nào

Bước:
  1. Partner gửi: "Xin chào"
  2. Learner gửi: "Chào bạn"
  3. Partner nhấn "Đặt buổi học" → chọn ngày/giờ → "Xác nhận"

Kết quả mong muốn:
  ┌─────────────────────────────────┐
  │  "Xin chào"           [trái]   │  T1
  │  "Chào bạn"           [phải]   │  T2
  │  [Lesson Request Card]          │  T3  ← ĐÚNG: ở cuối
  └─────────────────────────────────┘
  → Scroll tự động xuống card
```

```text
SCENARIO B: Card hiển thị đúng vị trí SAU khi chat đã dài

Điều kiện:
  - Đã có 20+ tin nhắn trong cuộc hội thoại
  - Partner đang ở cuối trang chat

Bước:
  1. Partner gửi thêm 5 tin nhắn
  2. Partner nhấn "Đặt buổi học" → tạo Lesson Request

Kết quả mong muốn:
  - Card xuất hiện NGAY SAU tin nhắn cuối cùng (T_n-1)
  - KHÔNG bị đẩy lên đầu
  - Scroll tự động xuống card mới
```

```text
SCENARIO C: Card hiển thị đúng trên LEARNER side

Điều kiện:
  - Partner vừa gửi Lesson Request

Bước:
  1. Learner đang ở giữa cuộc hội thoại (đã scroll lên đọc tin cũ)
  2. WebSocket nhận event LESSON_REQUEST_CREATED

Kết quả mong muốn:
  - Card xuất hiện tại đúng vị trí timestamp
  - Learner thấy notification badge hoặc toast "Bạn có lịch hẹn mới"
  - Nếu Learner đang ở bottom của chat: tự động scroll xuống card
  - Nếu Learner đang scroll lên đọc tin cũ: KHÔNG auto-scroll
    (chỉ hiện badge "1 tin mới ↓")
```

### 6.2 Kiểm tra sau khi nhắn tin tiếp tục

```text
SCENARIO D: Tin nhắn mới không đẩy Card lên trên

Điều kiện:
  - Lesson Request Card đang hiển thị ở vị trí T3 (PENDING)

Bước:
  1. Partner gửi Google Meet link → Card Meet xuất hiện tại T4
  2. Learner gửi "ok, đã thấy rồi" → Bubble text tại T5

Kết quả mong muốn:
  ┌────────────────────────────────────────┐
  │  [Lesson Request Card - PENDING]   T3  │
  │  [Google Meet Card]                T4  │
  │  "ok, đã thấy rồi"                T5  │
  └────────────────────────────────────────┘
  → Card tại T3 GIỮ NGUYÊN vị trí, không dịch chuyển
```

### 6.3 Kiểm tra cập nhật trạng thái Card

```text
SCENARIO E: Learner Accept → Card cập nhật tại chỗ

Điều kiện:
  - Lesson Request Card đang PENDING tại vị trí T3

Bước:
  1. Learner nhấn "Accept Request / 承認"
  2. API phản hồi thành công

Kết quả mong muốn:
  - Card tại T3:
    · Status badge: PENDING (vàng) → ACCEPTED (xanh lá)
    · Nút "Accept" và "Decline" bị vô hiệu hóa (disabled, opacity 0.5)
    · Vị trí trong chat KHÔNG thay đổi
  - Partner side:
    · Card tại T3 cũng cập nhật status → ACCEPTED
    · Toast: "Học viên đã xác nhận lịch hẹn!"
```

```text
SCENARIO F: Learner Decline → Card cập nhật và lịch bị xóa

Bước:
  1. Learner nhấn "Decline / 辞退"
  2. Confirmation dialog xuất hiện → Learner xác nhận

Kết quả mong muốn:
  - Card tại T3:
    · Status badge → DECLINED (đỏ)
    · Nút bị vô hiệu hóa
    · Card vẫn GIỮ NGUYÊN trong chat (để cả 2 bên còn thấy lịch sử)
    · Nhưng dữ liệu lesson_request trong DB bị đánh dấu DECLINED
  - Lịch sử buổi học: KHÔNG hiển thị buổi bị Decline
  - Trang chủ Learner (ID 7): Lịch hẹn bị xóa khỏi danh sách "Sắp tới"
```

### 6.4 Kiểm tra Lazy Load với Card

```text
SCENARIO G: Load lịch sử cũ có chứa Card

Điều kiện:
  - Cuộc hội thoại đã có > 50 tin nhắn
  - Lesson Request Card nằm ở offset thứ 60 (chưa được load)

Bước:
  1. Mở chat → load 50 tin nhắn mới nhất (offset 0-49)
  2. Scroll lên top → load thêm 50 cũ hơn (offset 50-99)

Kết quả mong muốn:
  - Batch load thứ 2 bao gồm cả Card tại đúng vị trí trong batch
  - Card render đúng với status hiện tại (có thể đã ACCEPTED/DECLINED)
  - Vị trí scroll KHÔNG nhảy
```

---

## 7. Test Cases

### TC-LR-01: Vị trí Card khi tạo mới

| Mục | Nội dung |
| --- | --- |
| **ID** | TC-LR-01 |
| **Tên** | Card hiển thị đúng vị trí khi Partner tạo Lesson Request |
| **Điều kiện** | Đã có 5 tin nhắn trong chat |
| **Bước thực hiện** | Partner nhấn "Đặt buổi học" → điền form → nhấn "Xác nhận" |
| **Kết quả mong muốn** | Card xuất hiện NGAY SAU tin nhắn thứ 5, không phải đầu trang |
| **Kiểm tra thêm** | Scroll tự động xuống Card sau khi tạo |
| **Pass/Fail** | ☐ |

### TC-LR-02: Card không dịch chuyển sau khi nhắn tiếp

| Mục | Nội dung |
| --- | --- |
| **ID** | TC-LR-02 |
| **Tên** | Tin nhắn mới không đẩy Card lên trên |
| **Điều kiện** | Lesson Request Card đang hiển thị cuối chat (PENDING) |
| **Bước thực hiện** | Gửi thêm 3 tin nhắn bất kỳ |
| **Kết quả mong muốn** | Card giữ nguyên vị trí, 3 tin nhắn mới hiển thị BÊN DƯỚI |
| **Pass/Fail** | ☐ |

### TC-LR-03: Card hiển thị đúng phía Learner

| Mục | Nội dung |
| --- | --- |
| **ID** | TC-LR-03 |
| **Tên** | Learner nhận Card đúng vị trí qua WebSocket |
| **Điều kiện** | Learner đang mở chat, có 10 tin nhắn |
| **Bước thực hiện** | Partner tạo Lesson Request (từ tab khác) |
| **Kết quả mong muốn** | Card xuất hiện cuối chat Learner, scroll xuống tự động |
| **Pass/Fail** | ☐ |

### TC-LR-04: Accept → Card cập nhật tại chỗ

| Mục | Nội dung |
| --- | --- |
| **ID** | TC-LR-04 |
| **Tên** | Accept không làm thay đổi vị trí Card |
| **Điều kiện** | Card đang PENDING, có 3 tin nhắn sau card |
| **Bước thực hiện** | Learner nhấn "Accept Request" |
| **Kết quả mong muốn** | Card tại đúng vị trí cũ, badge → ACCEPTED (xanh), nút disabled |
| **Kiểm tra thêm** | Partner side cũng cập nhật status |
| **Pass/Fail** | ☐ |

### TC-LR-05: Decline → Card cập nhật, lịch sử sạch

| Mục | Nội dung |
| --- | --- |
| **ID** | TC-LR-05 |
| **Tên** | Decline Card — lịch hẹn bị xóa khỏi trang chủ |
| **Điều kiện** | Card đang PENDING |
| **Bước thực hiện** | Learner nhấn "Decline" → xác nhận trong dialog |
| **Kết quả mong muốn** | Card badge → DECLINED, lịch hẹn xóa khỏi Trang chủ (ID 7) |
| **Kiểm tra thêm** | Lịch sử buổi học (Partner ID 15) không hiển thị buổi này |
| **Pass/Fail** | ☐ |

### TC-LR-06: Hủy Card (Partner side)

| Mục | Nội dung |
| --- | --- |
| **ID** | TC-LR-06 |
| **Tên** | Partner hủy Lesson Request đang PENDING |
| **Điều kiện** | Card đang PENDING, Learner chưa phản hồi |
| **Bước thực hiện** | Partner nhấn "Hủy" trên Card |
| **Kết quả mong muốn** | Card biến mất (hoặc badge CANCELLED) khỏi cả 2 phía |
| **Kiểm tra thêm** | Learner nhận WebSocket event, card cập nhật ngay |
| **Pass/Fail** | ☐ |

### TC-LR-07: Lazy load có chứa Card

| Mục | Nội dung |
| --- | --- |
| **ID** | TC-LR-07 |
| **Tên** | Card tải đúng khi lazy load lịch sử cũ |
| **Điều kiện** | Conversation có > 50 items, Card nằm ở batch 2 |
| **Bước thực hiện** | Mở chat → scroll lên top → trigger lazy load |
| **Kết quả mong muốn** | Card render đúng vị trí trong batch, status đúng, scroll không nhảy |
| **Pass/Fail** | ☐ |

### TC-LR-08: Nhiều Card trong một cuộc hội thoại

| Mục | Nội dung |
| --- | --- |
| **ID** | TC-LR-08 |
| **Tên** | Nhiều Lesson Request trong cùng một conversation |
| **Điều kiện** | Buổi học đầu đã ACCEPTED, Partner tạo thêm buổi thứ 2 |
| **Bước thực hiện** | Partner nhấn "Đặt buổi học" lần thứ 2 |
| **Kết quả mong muốn** | Card buổi 2 xuất hiện CUỐI chat, Card buổi 1 giữ nguyên với status ACCEPTED |
| **Pass/Fail** | ☐ |

---

## 8. Acceptance Criteria

### AC-LR-POS-01: Vị trí theo timestamp

- [ ] Lesson Request Card **luôn xuất hiện tại đúng vị trí** theo thứ tự thời gian trong luồng chat
- [ ] Card KHÔNG bao giờ hiển thị ở đầu trang trừ khi đó là tin đầu tiên trong conversation
- [ ] Card KHÔNG bị các tin nhắn mới hơn đẩy lên trên

### AC-LR-POS-02: Auto-scroll

- [ ] Sau khi Partner tạo thành công Lesson Request → chat **tự động scroll** xuống Card
- [ ] Sau khi Learner nhận WebSocket event LESSON_REQUEST_CREATED:
  - Nếu đang ở bottom → tự động scroll xuống Card
  - Nếu đang scroll lên đọc tin cũ → KHÔNG auto-scroll, chỉ hiện badge "1 tin mới"

### AC-LR-POS-03: Cập nhật trạng thái tại chỗ

- [ ] Khi Accept/Decline/Cancel → Card cập nhật badge màu sắc **tại đúng vị trí** trong chat
- [ ] KHÔNG render lại toàn bộ chat, KHÔNG thay đổi vị trí Card
- [ ] Cả 2 phía (Partner và Learner) đều thấy cập nhật qua WebSocket trong vòng ≤ 1 giây

### AC-LR-POS-04: Tương thích Lazy Load

- [ ] Card được bao gồm trong `GET /conversations/{id}/items` response
- [ ] Khi lazy load batch mới có chứa Card → Card render đúng vị trí trong batch
- [ ] Vị trí scroll container KHÔNG bị thay đổi sau khi prepend batch cũ hơn

### AC-LR-POS-05: Đồng bộ 2 phía

- [ ] Partner tạo Card → Learner thấy Card đúng vị trí trong ≤ 1 giây
- [ ] Learner Accept → Partner thấy Card cập nhật trong ≤ 1 giây
- [ ] Kết quả hiển thị giống nhau trên cả màn hình Partner (ID 15) và Learner (ID 11)

---

## Tóm Tắt Thay Đổi Cần Thực Hiện

| # | Layer | Thay đổi | Ưu tiên |
| --- | --- | --- | --- |
| 1 | **DB** | Thêm cột `message_id` vào `lesson_requests` | 🔴 Cao |
| 2 | **DB** | `messages.type` hỗ trợ `'LESSON_REQUEST'` và `'MEET_LINK'` | 🔴 Cao |
| 3 | **BE** | Khi tạo Lesson Request: INSERT vào cả `lesson_requests` lẫn `messages` trong 1 transaction | 🔴 Cao |
| 4 | **BE** | Tạo endpoint `GET /conversations/{id}/items` (unified, sorted) | 🔴 Cao |
| 5 | **FE** | Thay `useMessages` + `useLessonRequest` riêng → `useUnifiedChatItems` | 🔴 Cao |
| 6 | **FE** | Render bằng switch-case theo `item.type` thay vì inject riêng | 🔴 Cao |
| 7 | **FE** | `useAutoScroll`: chỉ scroll khi có item mới, không scroll khi user đang đọc tin cũ | 🟡 Trung bình |
| 8 | **FE** | Cập nhật status Card bằng `setItems(prev => prev.map(...))` thay vì re-fetch | 🟡 Trung bình |
| 9 | **FE** | Giữ scroll position khi prepend lazy load | 🟡 Trung bình |
| 10 | **WS** | `LESSON_REQUEST_CREATED` event payload bao gồm đầy đủ `ChatItem` object | 🔴 Cao |

---

Document version: 1.0 | Module: Messaging > Lesson Request | Bug: Card position incorrect
