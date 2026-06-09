"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-20 right-6 z-[1000] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 w-80 p-4 rounded-2xl shadow-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 animate-in slide-in-from-top-5 fade-in duration-300`}
          >
            {/* Icon */}
            <div className="shrink-0 mt-0.5">
              {toast.type === "success" && (
                <span className="material-symbols-outlined text-green-500">check_circle</span>
              )}
              {toast.type === "error" && (
                <span className="material-symbols-outlined text-red-500">error</span>
              )}
              {toast.type === "info" && (
                <span className="material-symbols-outlined text-blue-500">info</span>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-headline font-bold text-[#112340] dark:text-white mb-0.5">
                {toast.type === "success" ? "Thành công" : toast.type === "error" ? "Lỗi" : "Thông báo"}
              </p>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                {toast.message}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
