"use client";

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  undo?: () => void;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, undo?: () => void) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const toast = useCallback((message: string, type: ToastType = "success", undo?: () => void) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type, undo }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 md:bottom-6 md:left-auto md:right-6 md:translate-x-0 z-[9999] flex flex-col gap-2 items-center md:items-end pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto glass-strong rounded-[var(--radius-md)] px-4 py-3 flex items-center gap-3 shadow-lg animate-fade-in-up min-w-[260px] max-w-[360px]"
          >
            <span className="flex-shrink-0">
              {t.type === "success" && (
                <svg className="w-5 h-5 text-[var(--green)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {t.type === "error" && (
                <svg className="w-5 h-5 text-[var(--red)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {t.type === "info" && (
                <svg className="w-5 h-5 text-[var(--accent-light)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
                </svg>
              )}
            </span>
            <span className="text-sm text-[var(--text-primary)] flex-1">{t.message}</span>
            {t.undo && (
              <button
                onClick={() => {
                  t.undo?.();
                  dismiss(t.id);
                }}
                className="text-xs font-semibold text-[var(--accent-light)] hover:text-[var(--accent)] transition-colors whitespace-nowrap"
              >
                Angre
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
