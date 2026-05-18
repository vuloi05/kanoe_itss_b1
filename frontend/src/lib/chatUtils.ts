/**
 * Chat utility functions shared across Learner and Partner messaging pages.
 * Implements the VietImmerse messaging workflow spec.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { messageApi } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────

/** Message sending status for optimistic UI */
export type MessageSendStatus = "sending" | "sent" | "failed" | "queued";

/** Extended message with client-side status tracking */
export interface LocalMessage {
  messageId: string;
  conversationId: string;
  senderId: string;
  content: string;
  contentTranslated?: string | null;
  isRead: boolean;
  sentAt: string;
  /** Client-only: track send status for optimistic updates */
  _sendStatus?: MessageSendStatus;
  /** Client-only: temporary ID before server ACK */
  _tempId?: string;
  /** Client-only: retry attempt count (max 3) */
  _retryCount?: number;
}

/** An item in the offline send queue */
interface QueueItem {
  tempId: string;
  conversationId: string;
  content: string;
  createdAt: string;
  retryCount: number;
}

// ─── Time formatting ──────────────────────────────────────────

/**
 * Format a message timestamp according to the spec:
 * - Today → HH:MM
 * - Yesterday → "Hôm qua / 昨日"
 * - Older → DD/MM
 */
export function formatMessageTime(
  isoString: string,
  t: (vi: string, ja: string) => string
): string {
  const date = new Date(isoString);
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (msgDate.getTime() === today.getTime()) {
    // Today → HH:MM
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  if (msgDate.getTime() === yesterday.getTime()) {
    // Yesterday
    return t("Hôm qua", "昨日");
  }

  // Older → DD/MM
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
}

/**
 * Format timestamp for conversation list sidebar.
 */
export function formatConversationTime(
  isoString: string | null,
  t: (vi: string, ja: string) => string
): string {
  if (!isoString) return "";
  return formatMessageTime(isoString, t);
}

/**
 * Generate a temporary local UUID for optimistic message rendering.
 */
export function generateTempId(): string {
  return `temp_${crypto.randomUUID()}`;
}

/**
 * Validates if a given string is exactly a valid Google Meet URL.
 * Pattern: https://meet.google.com/xxx-xxxx-xxx
 */
export function isMeetLink(text: string): boolean {
  if (!text) return false;
  return /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/.test(text.trim());
}

// ─── Offline Queue Hook ───────────────────────────────────────

const MAX_RETRIES = 3;
const RETRY_DELAYS = [2000, 4000]; // exponential backoff: 2s, 4s

/**
 * Custom hook that manages online/offline state and a local send queue.
 *
 * Returns:
 * - `isOnline` — current network status
 * - `enqueue` — add a message to the offline queue
 * - `flushQueue` — manually trigger flushing (called automatically on reconnect)
 *
 * When network comes back online, automatically flushes the queue in order,
 * retrying up to 3 times with 2s→4s exponential backoff.
 */
export function useOfflineQueue(
  setMessages: React.Dispatch<React.SetStateAction<LocalMessage[]>>,
  setConversations: React.Dispatch<React.SetStateAction<any[]>>
) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const queueRef = useRef<QueueItem[]>([]);
  const flushingRef = useRef(false);

  // Listen to browser online/offline events
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Auto-flush queue when network comes back
  useEffect(() => {
    if (isOnline && queueRef.current.length > 0) {
      flushQueue();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  /** Delay helper */
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  /** Try to send a single queued item with retries */
  const sendWithRetry = useCallback(
    async (item: QueueItem): Promise<boolean> => {
      for (let attempt = item.retryCount; attempt < MAX_RETRIES; attempt++) {
        // Update retry count on message bubble
        setMessages((prev) =>
          prev.map((m) =>
            m._tempId === item.tempId
              ? { ...m, _sendStatus: "sending" as const, _retryCount: attempt }
              : m
          )
        );

        try {
          const newMsg = await messageApi.sendMessage(
            item.conversationId,
            item.content
          );
          // Success → replace optimistic message with server response
          setMessages((prev) =>
            prev.map((m) =>
              m._tempId === item.tempId
                ? { ...newMsg, _sendStatus: "sent" as const, _retryCount: 0 }
                : m
            )
          );
          // Update conversation sidebar
          setConversations((prev: any[]) => {
            const copy = [...prev];
            const idx = copy.findIndex(
              (c) => c.conversationId === item.conversationId
            );
            if (idx >= 0) {
              copy[idx].lastMessage = item.content;
              copy[idx].lastMessageTime = newMsg.sentAt;
            }
            return copy;
          });
          return true;
        } catch {
          // Wait before next attempt (exponential backoff)
          if (attempt < MAX_RETRIES - 1) {
            await delay(RETRY_DELAYS[attempt] || 4000);
          }
        }
      }

      // All retries exhausted → mark as failed
      setMessages((prev) =>
        prev.map((m) =>
          m._tempId === item.tempId
            ? {
                ...m,
                _sendStatus: "failed" as const,
                _retryCount: MAX_RETRIES,
              }
            : m
        )
      );
      return false;
    },
    [setMessages, setConversations]
  );

  /** Flush all queued items in order */
  const flushQueue = useCallback(async () => {
    if (flushingRef.current) return;
    flushingRef.current = true;

    while (queueRef.current.length > 0) {
      const item = queueRef.current[0];
      const ok = await sendWithRetry(item);
      if (ok) {
        queueRef.current.shift(); // Remove from queue on success
      } else {
        // Failed after retries — remove from queue so it stays as "failed" in UI
        // User can manually retry via the retry button
        queueRef.current.shift();
      }
    }

    flushingRef.current = false;
  }, [sendWithRetry]);

  /** Add a message to the offline queue */
  const enqueue = useCallback(
    (tempId: string, conversationId: string, content: string) => {
      queueRef.current.push({
        tempId,
        conversationId,
        content,
        createdAt: new Date().toISOString(),
        retryCount: 0,
      });
      // Mark message as queued in UI
      setMessages((prev) =>
        prev.map((m) =>
          m._tempId === tempId
            ? { ...m, _sendStatus: "queued" as const }
            : m
        )
      );
    },
    [setMessages]
  );

  return { isOnline, enqueue, flushQueue };
}

// ─── Lazy Load Hook ───────────────────────────────────────────

const PAGE_SIZE = 50;

/**
 * Custom hook that manages paginated message loading with infinite scroll.
 *
 * Uses an IntersectionObserver on a sentinel element. In a `flex-col-reverse`
 * container the sentinel is placed after all messages (visually at the top).
 * When the sentinel becomes visible → load the next page of older messages.
 *
 * Returns:
 * - `sentinelRef` — attach to a div at the end of the messages list
 * - `isLoadingMore` — show a spinner
 * - `hasMore` — whether more pages exist
 * - `resetPagination` — call when switching conversations
 */
export function useLazyLoadMessages(
  conversationId: string | undefined,
  setMessages: React.Dispatch<React.SetStateAction<LocalMessage[]>>
) {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  /** Reset when conversation changes */
  const resetPagination = useCallback(() => {
    setPage(1);
    setHasMore(true);
    setIsLoadingMore(false);
    loadingRef.current = false;
  }, []);

  /** Load next page of older messages */
  const loadMore = useCallback(async () => {
    if (!conversationId || loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setIsLoadingMore(true);

    try {
      const nextPage = page + 1;
      const olderMsgs = await messageApi.getMessages(
        conversationId,
        nextPage,
        PAGE_SIZE
      );

      if (!olderMsgs || olderMsgs.length === 0) {
        setHasMore(false);
      } else {
        // Append older messages to the end of the array
        // (in flex-col-reverse, end of array = visual top)
        setMessages((prev) => {
          // Deduplicate
          const existingIds = new Set(prev.map((m) => m.messageId));
          const newOnes = (olderMsgs as LocalMessage[]).filter(
            (m) => !existingIds.has(m.messageId)
          );
          return [...prev, ...newOnes];
        });
        setPage(nextPage);
        if (olderMsgs.length < PAGE_SIZE) {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error("Failed to load more messages:", err);
    } finally {
      setIsLoadingMore(false);
      loadingRef.current = false;
    }
  }, [conversationId, page, hasMore, setMessages]);

  /** IntersectionObserver on sentinel */
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingRef.current) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return { sentinelRef, isLoadingMore, hasMore, resetPagination };
}
