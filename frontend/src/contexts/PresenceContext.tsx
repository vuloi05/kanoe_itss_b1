"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ensureConnected, getSignalRConnection } from "@/lib/signalr";
import { userApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";

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
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;

    // Connect to SignalR and join global presence group
    let mounted = true;

    const setup = async () => {
      try {
        // Fetch initial online users
        const initialOnlineUsers = await userApi.getOnlineUsers();
        if (mounted) {
          setOnlineUserIds(new Set(initialOnlineUsers));
        }
      } catch (err) {
        console.error("Failed to fetch initial online users:", err);
      }

      const conn = await ensureConnected();

      // Join global presence group on server
      await conn.invoke("JoinPresence").catch(console.error);

      conn.on("UserOnline", (payload: { userId: string }) => {
        if (!mounted) return;
        setOnlineUserIds((prev) => {
          const next = new Set(prev);
          next.add(payload.userId);
          return next;
        });
      });

      conn.on("UserOffline", (payload: { userId: string }) => {
        if (!mounted) return;
        setOnlineUserIds((prev) => {
          const next = new Set(prev);
          next.delete(payload.userId);
          return next;
        });
      });
    };

    setup().catch(console.error);

    return () => {
      mounted = false;

      // Cleanup SignalR listeners
      const conn = getSignalRConnection();
      conn.off("UserOnline");
      conn.off("UserOffline");
      conn.invoke("LeavePresence").catch(() => {});
    };
  }, [isAuthenticated, isLoading]);

  const isUserOnline = (userId: string) => onlineUserIds.has(userId);

  return (
    <PresenceContext.Provider value={{ onlineUserIds, isUserOnline }}>
      {children}
    </PresenceContext.Provider>
  );
};
