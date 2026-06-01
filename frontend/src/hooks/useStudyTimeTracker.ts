"use client";

import { useEffect, useRef } from "react";
import { userApi } from "@/lib/api";

const HEARTBEAT_INTERVAL_MS = 60_000; // 60 seconds

/**
 * Periodically records study time while the user stays on a learning page.
 *
 * Uses useRef for the interval ID to avoid stale closures and prevent
 * re-renders — the hook produces no state changes, keeping the host
 * component render-stable.
 *
 * Fire-and-forget: API errors are silently logged to console so they
 * never interrupt the learning experience.
 */
export function useStudyTimeTracker() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      userApi.recordStudyTime(60).catch((err) => {
        console.warn("Study time heartbeat failed:", err);
      });
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);
}
