const fs = require('fs');
const file = 'c:\\DU_AN\\kanoe_itss_b1\\frontend\\src\\app\\partner\\messages\\page.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `    // Subscribe to Supabase Realtime
    const channel = supabase.channel(\`conversation-\${activeConv.conversationId}\`);
    channel.on("broadcast", { event: "new_message" }, (payload: any) => {
      const newMsg = payload.payload.message as LocalMessage;
      newMsg._sendStatus = "sent";
      setMessages(prev => {
        // Replace optimistic temp message if server ACK arrives
        const withoutTemp = prev.filter(
          m => !(m._tempId && m.content === newMsg.content && m.senderId === newMsg.senderId)
        );
        if (withoutTemp.find(m => m.messageId === newMsg.messageId)) return withoutTemp;
        return [newMsg, ...withoutTemp];
      });
      
      // Update last message in conversation list
      setConversations(prev => {
        const copy = [...prev];
        const idx = copy.findIndex(c => c.conversationId === newMsg.conversationId);
        if (idx >= 0) {
          copy[idx].lastMessage = newMsg.content || t("Tin nhắn mới", "新着メッセージ");
          copy[idx].lastMessageTime = newMsg.timestamp || newMsg.sentAt;
        }
        return copy;
      });
    })
    .on("broadcast", { event: "LESSON_REQUEST_CREATED" }, (payload: any) => {
      const newMsg = payload.payload as LocalMessage;
      setMessages(prev => {
        if (prev.find(m => m.messageId === newMsg.messageId)) return prev;
        return [newMsg, ...prev];
      });
      showToast(t("Có yêu cầu buổi học mới!", "新しいレッスンリクエストがあります！"), "success");
    })
    .on("broadcast", { event: "LESSON_ACCEPTED" }, (payload: any) => {
      const data = payload.payload;
      setMessages(prev => prev.map(m => m.lessonRequestId === data.lesson_request_id ? { ...m, lessonStatus: data.new_status } : m));
      showToast(t("Học viên đã xác nhận lịch hẹn!", "学習者がレッスンを承認しました！"), "success");
    })
    .on("broadcast", { event: "LESSON_DECLINED" }, (payload: any) => {
      const data = payload.payload;
      setMessages(prev => prev.map(m => m.lessonRequestId === data.lesson_request_id ? { ...m, lessonStatus: data.new_status } : m));
      showToast(t("Học viên đã từ chối lịch hẹn.", "学習者がレッスンを辞退しました。"), "warning");
    })
    .on("broadcast", { event: "LESSON_CANCELLED" }, (payload: any) => {
      const data = payload.payload;
      setMessages(prev => prev.map(m => m.lessonRequestId === data.lesson_request_id ? { ...m, lessonStatus: data.new_status } : m));
      showToast(t("Lịch hẹn đã bị hủy.", "レッスンがキャンセルされました。"), "warning");
    })
    .subscribe();`;

const startStr = "    // Subscribe to Supabase Realtime";
const endStr = "    .subscribe();";

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr) + endStr.length;

if (startIndex !== -1 && endIndex !== -1) {
    content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
} else {
    console.log("Could not find start or end bounds for WebSocket");
    process.exit(1);
}

// Remove bookingCards completely
content = content.replace("const [bookingCards, setBookingCards] = useState<BookingDto[]>([]);\n", "");

fs.writeFileSync(file, content, 'utf8');
console.log("Patched WebSocket successfully");
