"use client";

/**
 * MessagePreviewRow — renders an icon (Material Symbols) + text preview
 * for the conversation sidebar. Handles LESSON_REQUEST and other special types.
 */

interface MessagePreviewRowProps {
  lastMessage: string | null;
  lastMessageType: string | null;
  unreadCount: number;
  active: boolean;
  t: (vi: string, ja: string) => string;
}

export default function MessagePreviewRow({
  lastMessage,
  lastMessageType,
  unreadCount,
  active,
  t,
}: MessagePreviewRowProps) {
  if (lastMessage && !lastMessageType) {
    // Plain text message — show content directly
    return (
      <p
        className={`text-xs truncate ${
          active ? "text-on-surface-variant" : "text-outline"
        } ${unreadCount > 0 ? "font-bold text-primary" : ""}`}
      >
        {lastMessage}
      </p>
    );
  }

  // System message type — show icon + label
  const { icon, label } = getTypeMeta(lastMessageType, t);
  return (
    <p
      className={`text-xs truncate flex items-center gap-1 ${
        active ? "text-on-surface-variant" : "text-outline"
      } ${unreadCount > 0 ? "font-bold text-primary" : ""}`}
    >
      {icon && (
        <span className="material-symbols-outlined text-sm shrink-0 !leading-none">
          {icon}
        </span>
      )}
      <span>{lastMessage || label}</span>
    </p>
  );
}

function getTypeMeta(
  type: string | null,
  t: (vi: string, ja: string) => string
): { icon: string; label: string } {
  switch (type) {
    case "LESSON_REQUEST":
      return {
        icon: "calendar_month",
        label: t("Yêu cầu học thử", "体験レッスンリクエスト"),
      };
    case "BOOKING_CONFIRMED":
    case "ACCEPTED":
      return {
        icon: "check_circle",
        label: t("Đã xác nhận lịch", "予約確定"),
      };
    case "BOOKING_DECLINED":
    case "DECLINED":
      return {
        icon: "cancel",
        label: t("Đã từ chối lịch", "予約拒否"),
      };
    case "BOOKING_CANCELLED":
    case "CANCELLED":
      return {
        icon: "event_busy",
        label: t("Đã hủy lịch", "予約キャンセル"),
      };
    default:
      return {
        icon: "",
        label: t("Chưa có tin nhắn", "メッセージなし"),
      };
  }
}
