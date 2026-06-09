"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";

interface TimePickerProps {
  hour: string;   // e.g. "09:00"
  minute: string; // e.g. "00"
  onHourChange: (val: string) => void;
  onMinuteChange: (val: string) => void;
  hourOptions?: string[];
  minuteOptions?: string[];
}

const DEFAULT_HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = String(i).padStart(2, "0");
  return `${h}:00`;
});

const DEFAULT_MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

export default function TimePicker({
  hour,
  minute,
  onHourChange,
  onMinuteChange,
  hourOptions = DEFAULT_HOURS,
  minuteOptions = DEFAULT_MINUTES,
}: TimePickerProps) {
  const [openPanel, setOpenPanel] = useState<"hour" | "minute" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpenPanel(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const togglePanel = useCallback(
    (panel: "hour" | "minute") => {
      setOpenPanel((prev) => (prev === panel ? null : panel));
    },
    []
  );

  // Display value: combine hour + minute
  const displayHour = useMemo(() => {
    const h = hour.split(":")[0];
    return `${h}:00`;
  }, [hour]);

  const displayMinute = useMemo(() => minute, [minute]);

  return (
    <div ref={containerRef} className="grid grid-cols-2 gap-2 relative">
      {/* Hour Trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => togglePanel("hour")}
          className={`w-full bg-[#f0f0ee] rounded-xl flex items-center justify-between px-4 py-3 text-sm text-on-surface transition-all cursor-pointer
            ${openPanel === "hour" ? "ring-2 ring-primary/30" : "ring-0"}
            hover:bg-[#e8e8e6]
          `}
        >
          <span>{displayHour}</span>
          <span
            className={`material-symbols-outlined text-lg text-outline transition-transform duration-200 ${
              openPanel === "hour" ? "rotate-180" : ""
            }`}
          >
            expand_more
          </span>
        </button>

        {/* Hour Dropdown */}
        {openPanel === "hour" && (
          <div className="absolute top-full left-0 mt-2 w-full bg-surface-container-lowest rounded-2xl border border-outline-variant/15 engawa-shadow z-50 overflow-hidden animate-[fadeSlideDown_0.15s_ease-out]">
            <div className="max-h-[240px] overflow-y-auto overscroll-contain py-1">
              {hourOptions.map((opt) => {
                const isSelected = opt === hour;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onHourChange(opt);
                      setOpenPanel(null);
                    }}
                    className={`w-full px-4 py-2.5 text-sm text-left transition-all cursor-pointer
                      ${
                        isSelected
                          ? "lotus-gradient text-white font-bold"
                          : "text-on-surface hover:bg-primary/[0.06]"
                      }
                    `}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Minute Trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => togglePanel("minute")}
          className={`w-full bg-[#f0f0ee] rounded-xl flex items-center justify-between px-4 py-3 text-sm text-on-surface transition-all cursor-pointer
            ${openPanel === "minute" ? "ring-2 ring-primary/30" : "ring-0"}
            hover:bg-[#e8e8e6]
          `}
        >
          <span>{displayMinute}</span>
          <span
            className={`material-symbols-outlined text-lg text-outline transition-transform duration-200 ${
              openPanel === "minute" ? "rotate-180" : ""
            }`}
          >
            expand_more
          </span>
        </button>

        {/* Minute Dropdown */}
        {openPanel === "minute" && (
          <div className="absolute top-full left-0 mt-2 w-full bg-surface-container-lowest rounded-2xl border border-outline-variant/15 engawa-shadow z-50 overflow-hidden animate-[fadeSlideDown_0.15s_ease-out]">
            <div className="max-h-[200px] overflow-y-auto overscroll-contain py-1">
              {minuteOptions.map((opt) => {
                const isSelected = opt === minute;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onMinuteChange(opt);
                      setOpenPanel(null);
                    }}
                    className={`w-full px-4 py-2.5 text-sm text-left transition-all cursor-pointer
                      ${
                        isSelected
                          ? "lotus-gradient text-white font-bold"
                          : "text-on-surface hover:bg-primary/[0.06]"
                      }
                    `}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
