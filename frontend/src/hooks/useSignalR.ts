/**
 * Custom hook for managing a SignalR HubConnection lifecycle.
 *
 * Token is passed via accessTokenFactory (not a static header) because
 * SignalR's WebSocket transport cannot attach custom HTTP headers after the
 * initial handshake — the server-side OnMessageReceived event reads
 * "access_token" from the query string instead.
 */
"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  HubConnectionBuilder,
  HubConnection,
  LogLevel,
  HubConnectionState,
} from "@microsoft/signalr";
import { LocalMessage } from "@/lib/chatUtils";
import { type BookingDto } from "@/lib/api";

// The hub URL is derived from the shared API base URL to avoid duplicating config.
const HUB_URL = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/chathub`;

// SignalR method names — must match ChatHub.cs and BookingService.cs constants
const SERVER_METHOD_SEND = "SendMessage";
const CLIENT_METHOD_RECEIVE = "ReceiveMessage";
const CLIENT_METHOD_BOOKING = "ReceiveBookingEvent";

// Presence event names — must match ChatHub.cs exactly
const CLIENT_METHOD_GET_ONLINE_USERS = "GetOnlineUsers";
const CLIENT_METHOD_USER_ONLINE = "UserIsOnline";
const CLIENT_METHOD_USER_OFFLINE = "UserIsOffline";

// ─── Types ────────────────────────────────────────────────────

/** Payload shape pushed by BookingService for each lifecycle event */
export interface BookingEventPayload {
  eventType:
    | "lesson_request"
    | "lesson_accepted"
    | "lesson_declined"
    | "lesson_cancelled";
  booking: BookingDto;
}

interface UseSignalROptions {
  /** Factory that returns the current JWT access token. Called before each request. */
  getToken: () => string | null;
  /** Called whenever the server pushes a new chat message. */
  onReceiveMessage: (message: LocalMessage) => void;
  /** Called whenever the server pushes a booking lifecycle event. */
  onReceiveBookingEvent?: (payload: BookingEventPayload) => void;
  /** Called when the connection drops unexpectedly. */
  onDisconnected?: (error?: Error) => void;
}

interface UseSignalRReturn {
  startConnection: () => Promise<void>;
  stopConnection: () => Promise<void>;
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  isConnected: () => boolean;
  /** Set of UserIds currently online (updated via SignalR presence events). */
  onlineUsers: Set<string>;
}

export function useSignalR({
  getToken,
  onReceiveMessage,
  onReceiveBookingEvent,
  onDisconnected,
}: UseSignalROptions): UseSignalRReturn {
  const connectionRef = useRef<HubConnection | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  /**
   * Build a fresh HubConnection.
   * Called lazily so getToken always captures the latest closure value.
   */
  const buildConnection = useCallback((): HubConnection => {
    return new HubConnectionBuilder()
      .withUrl(HUB_URL, {
        // SignalR will append ?access_token=<value> to the WebSocket URL.
        // Program.cs reads this in OnMessageReceived to authenticate.
        accessTokenFactory: () => getToken() ?? "",
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000]) // retry delays in ms
      .configureLogging(
        process.env.NODE_ENV === "development" ? LogLevel.Information : LogLevel.Error
      )
      .build();
  }, [getToken]);

  /** Start the SignalR connection and register all incoming handlers. */
  const startConnection = useCallback(async (): Promise<void> => {
    // Teardown any stale connection first
    if (connectionRef.current) {
      await connectionRef.current.stop();
    }

    const connection = buildConnection();

    // Handler: incoming chat message
    connection.on(CLIENT_METHOD_RECEIVE, (message: LocalMessage) => {
      onReceiveMessage(message);
    });

    // Handler: booking lifecycle event (lesson_request / accepted / declined / cancelled)
    connection.on(CLIENT_METHOD_BOOKING, (payload: BookingEventPayload) => {
      onReceiveBookingEvent?.(payload);
    });

    // ─── Presence Handlers ───────────────────────────────────────────────────

    // Server sends the full online list to the caller right after connection
    connection.on(CLIENT_METHOD_GET_ONLINE_USERS, (userIds: string[]) => {
      setOnlineUsers(new Set(userIds));
    });

    // Another user just connected (their first tab/device)
    connection.on(CLIENT_METHOD_USER_ONLINE, (userId: string) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    });

    // Another user fully disconnected (all tabs/devices closed)
    connection.on(CLIENT_METHOD_USER_OFFLINE, (userId: string) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    // ─────────────────────────────────────────────────────────────────────────

    // Surface unexpected disconnects to the consumer
    connection.onclose((error) => {
      onDisconnected?.(error ?? undefined);
      // Clear the online list on disconnect so stale data isn't shown
      setOnlineUsers(new Set());
    });

    connectionRef.current = connection;

    try {
      await connection.start();
    } catch (err) {
      console.error("[SignalR] Failed to start connection:", err);
      throw err;
    }
  }, [buildConnection, onReceiveMessage, onReceiveBookingEvent, onDisconnected]);

  /** Gracefully close the connection. */
  const stopConnection = useCallback(async (): Promise<void> => {
    if (!connectionRef.current) return;
    try {
      await connectionRef.current.stop();
    } catch (err) {
      console.error("[SignalR] Error stopping connection:", err);
    } finally {
      connectionRef.current = null;
      setOnlineUsers(new Set());
    }
  }, []);

  /**
   * Invoke the server-side SendMessage method.
   * Silently discards the call if the hub isn't connected yet.
   */
  const sendMessage = useCallback(
    async (receiverId: string, content: string): Promise<void> => {
      const connection = connectionRef.current;
      if (!connection || connection.state !== HubConnectionState.Connected) {
        console.warn("[SignalR] sendMessage called while not connected.");
        return;
      }
      await connection.invoke(SERVER_METHOD_SEND, receiverId, content);
    },
    []
  );

  /** Expose connection state without exposing the raw HubConnection. */
  const isConnected = useCallback((): boolean => {
    return connectionRef.current?.state === HubConnectionState.Connected;
  }, []);

  // Cleanup on unmount — prevents lingering WebSocket connections
  useEffect(() => {
    return () => {
      connectionRef.current?.stop().catch(() => {});
    };
  }, []);

  return { startConnection, stopConnection, sendMessage, isConnected, onlineUsers };
}
