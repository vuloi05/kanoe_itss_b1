"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectPickerProps {
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  placeholder?: string;
  hasError?: boolean;
  disabled?: boolean;
}

export default function SelectPicker({
  value,
  onChange,
  options,
  placeholder,
  hasError = false,
  disabled = false,
}: SelectPickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  const selectedLabel =
    options.find((o) => o.value === value)?.label;

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={disabled ? undefined : toggle}
        className={`w-full bg-[#f0f0ee] rounded-xl flex items-center justify-between px-4 py-3 text-sm transition-all
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-[#e8e8e6]"}
          ${open ? "ring-2 ring-primary/30" : "ring-0"}
          ${hasError ? "ring-2 ring-red-400" : ""}
        `}
      >
        <span className={selectedLabel ? "text-on-surface" : "text-outline"}>
          {selectedLabel ?? placeholder ?? ""}
        </span>
        <span
          className={`material-symbols-outlined text-lg text-outline transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-2 w-full bg-surface-container-lowest rounded-2xl border border-outline-variant/15 engawa-shadow z-50 overflow-hidden animate-[fadeSlideDown_0.15s_ease-out]">
          <div className="max-h-[240px] overflow-y-auto overscroll-contain py-1">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-sm text-left transition-all cursor-pointer
                    ${
                      isSelected
                        ? "lotus-gradient text-white font-bold"
                        : "text-on-surface hover:bg-primary/[0.06]"
                    }
                  `}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
