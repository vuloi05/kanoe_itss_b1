"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { userApi } from "@/lib/api";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

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

  useEffect(() => {
    // 1. Tell the backend we are online (updates DB)
    userApi.updatePresence(true).catch(console.error);

    // 2. Subscribe to global presence channel to receive real-time updates of OTHERS
    const channel = supabase.channel("global-presence");
    
    channel
      .on("broadcast", { event: "USER_ONLINE" }, (payload) => {
        if (payload.payload?.userId) {
          setOnlineUserIds((prev) => {
            const next = new Set(prev);
            next.add(payload.payload.userId);
            return next;
          });
        }
      })
      .on("broadcast", { event: "USER_OFFLINE" }, (payload) => {
        if (payload.payload?.userId) {
          setOnlineUserIds((prev) => {
            const next = new Set(prev);
            next.delete(payload.payload.userId);
            return next;
          });
        }
      })
      .subscribe();

    // 3. Handle page close/unload
    const handleBeforeUnload = () => {
      // Beacon or sync fetch to tell backend we are offline
      // fetch API with keepalive is best for beforeunload
      const token = localStorage.getItem("token");
      if (token) {
        fetch("/api/users/presence", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ isOnline: false }),
          keepalive: true
        }).catch(() => {});
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      supabase.removeChannel(channel);
      userApi.updatePresence(false).catch(console.error);
    };
  }, []);

  const isUserOnline = (userId: string) => onlineUserIds.has(userId);

  return (
    <PresenceContext.Provider value={{ onlineUserIds, isUserOnline }}>
      {children}
    </PresenceContext.Provider>
  );
};
