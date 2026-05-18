"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import {
  HubConnectionBuilder,
  HubConnection,
  LogLevel,
} from "@microsoft/signalr";

const HUB_URL = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/chathub`;

interface PresenceContextType {
  onlineUserIds: Set<string>;
  isUserOnline: (userId: string) => boolean;
}

const PresenceContext = createContext<PresenceContextType>({
  onlineUserIds: new Set(),
  isUserOnline: () => false,
});

export const usePresence = () => useContext(PresenceContext);

export const PresenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const connectionRef = useRef<HubConnection | null>(null);

  const isUserOnline = useCallback(
    (userId: string) => onlineUserIds.has(userId),
    [onlineUserIds]
  );

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("auth_token");
    if (!token) return;

    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => localStorage.getItem("auth_token") ?? "",
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(
        process.env.NODE_ENV === "development" ? LogLevel.Information : LogLevel.Error
      )
      .build();

    // Server sends the full online list right after connection is established
    connection.on("GetOnlineUsers", (userIds: string[]) => {
      setOnlineUserIds(new Set(userIds));
    });

    // Another user just came online (their first connection)
    connection.on("UserIsOnline", (userId: string) => {
      setOnlineUserIds((prev) => new Set(prev).add(userId));
    });

    // Another user went fully offline (all tabs/devices closed)
    connection.on("UserIsOffline", (userId: string) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    connection.onclose(() => {
      setOnlineUserIds(new Set());
    });

    connectionRef.current = connection;

    connection.start().catch((err) => {
      console.error("[PresenceContext] SignalR connection failed:", err);
    });

    return () => {
      connection.stop().catch(() => {});
      connectionRef.current = null;
      setOnlineUserIds(new Set());
    };
  }, [user]);

  return (
    <PresenceContext.Provider value={{ onlineUserIds, isUserOnline }}>
      {children}
    </PresenceContext.Provider>
  );
};
