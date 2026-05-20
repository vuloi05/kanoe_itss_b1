"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";

interface DatePickerProps {
  value: string; // yyyy-MM-dd
  onChange: (value: string) => void;
  hasError?: boolean;
  placeholder?: string;
  minDate?: string; // yyyy-MM-dd — disables dates before this
}

// Vietnamese weekday abbreviations (Mon-Sun)
const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const MONTH_NAMES_VI = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
  "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
  "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function DatePicker({
  value,
  onChange,
  hasError = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  placeholder: _placeholder,
  minDate,
}: DatePickerProps) {
  const today = useMemo(() => new Date(), []);
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() =>
    value ? parseInt(value.split("-")[0]) : today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(() =>
    value ? parseInt(value.split("-")[1]) - 1 : today.getMonth()
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sync calendar view to selected value when opening the dropdown
  const toggleOpen = useCallback(() => {
    setOpen((prev) => {
      if (!prev && value) {
        const [y, m] = value.split("-").map(Number);
        setViewYear(y);
        setViewMonth(m - 1);
      }
      return !prev;
    });
  }, [value]);

  const selectedDate = useMemo(
    () => (value ? new Date(value + "T00:00:00") : null),
    [value]
  );

  const minDateObj = useMemo(
    () => (minDate ? new Date(minDate + "T00:00:00") : null),
    [minDate]
  );

  const prevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  // Build the 6-row × 7-col calendar grid (Monday-first)
  const calendarDays = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    // getDay: 0=Sun → shift to Mon-first: (day + 6) % 7
    const startOffset = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

    const cells: { day: number; month: number; year: number; isCurrentMonth: boolean }[] = [];

    // Fill leading days from previous month
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = viewMonth === 0 ? 11 : viewMonth - 1;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      cells.push({ day: d, month: m, year: y, isCurrentMonth: false });
    }

    // Fill current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, month: viewMonth, year: viewYear, isCurrentMonth: true });
    }

    // Fill trailing days from next month
    const remaining = 42 - cells.length; // 6 rows × 7 cols
    for (let d = 1; d <= remaining; d++) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      cells.push({ day: d, month: m, year: y, isCurrentMonth: false });
    }

    return cells;
  }, [viewYear, viewMonth]);

  const handleSelect = (cell: (typeof calendarDays)[0]) => {
    const dateStr = `${cell.year}-${pad(cell.month + 1)}-${pad(cell.day)}`;
    onChange(dateStr);
    setOpen(false);
  };

  const handleToday = () => {
    const dateStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    onChange(dateStr);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setOpen(false);
  };

  const handleClear = () => {
    onChange("");
  };



  const isDisabled = useCallback(
    (cell: (typeof calendarDays)[0]) => {
      if (!minDateObj) return false;
      const cellDate = new Date(cell.year, cell.month, cell.day);
      return cellDate < minDateObj;
    },
    [minDateObj]
  );

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger: native date input (hides built-in picker) + custom calendar icon */}
      <div
        className={`w-full bg-[#f0f0ee] rounded-xl flex items-center transition-all
          ${hasError ? "ring-2 ring-red-400" : "ring-0"}
          focus-within:ring-2 focus-within:ring-primary/30
        `}
      >
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent px-4 py-3 text-sm text-on-surface outline-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden"
        />
        <button
          type="button"
          onClick={toggleOpen}
          className="p-2 mr-1 text-outline hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-primary/[0.06]"
        >
          <span className="material-symbols-outlined text-lg">calendar_today</span>
        </button>
      </div>

      {/* Dropdown Calendar */}
      {open && (
        <div className="absolute top-full -right-4 mt-2 w-[310px] bg-surface-container-lowest rounded-2xl border border-outline-variant/15 engawa-shadow z-50 overflow-hidden animate-[fadeSlideDown_0.15s_ease-out]">
          {/* Month/Year Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary/[0.04]">
            <span className="text-sm font-bold text-primary font-headline">
              {MONTH_NAMES_VI[viewMonth]} {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 px-3 pt-2">
            {WEEKDAY_LABELS.map((label) => (
              <div
                key={label}
                className="text-[10px] font-bold text-outline text-center py-1.5 uppercase tracking-wider"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 px-3 pb-2">
            {calendarDays.map((cell, idx) => {
              const cellDate = new Date(cell.year, cell.month, cell.day);
              const isToday = isSameDay(cellDate, today);
              const isSelected = selectedDate && isSameDay(cellDate, selectedDate);
              const disabled = isDisabled(cell);

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelect(cell)}
                  className={`
                    w-9 h-9 mx-auto rounded-lg text-xs font-medium flex items-center justify-center transition-all cursor-pointer
                    ${disabled ? "text-outline/30 cursor-not-allowed" : ""}
                    ${!cell.isCurrentMonth && !disabled ? "text-outline/40" : ""}
                    ${cell.isCurrentMonth && !isSelected && !isToday && !disabled
                      ? "text-on-surface hover:bg-primary/[0.08]"
                      : ""}
                    ${isToday && !isSelected ? "ring-1 ring-primary/40 text-primary font-bold" : ""}
                    ${isSelected
                      ? "lotus-gradient text-white font-bold shadow-md shadow-primary/20"
                      : ""}
                  `}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-outline-variant/10 bg-surface-container-low/50">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-bold text-secondary hover:text-error transition-colors cursor-pointer"
            >
              Xóa
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="text-xs font-bold text-primary hover:text-primary-container transition-colors cursor-pointer"
            >
              Hôm nay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
