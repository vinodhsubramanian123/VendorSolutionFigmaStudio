import { Toast, ToastContextType } from "../../types/data";
import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";
import { tokens } from "../../styles/tokens";



const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(
    (message: string, type: "success" | "warn" | "error" = "success", actionLabel?: string, onAction?: () => void) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type, actionLabel, onAction }]);

      // Auto remove after 4.5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    [],
  );

  const success = useCallback(
    (message: string) => toast(message, "success"),
    [toast],
  );
  const warn = useCallback(
    (message: string) => toast(message, "warn"),
    [toast],
  );
  const error = useCallback(
    (message: string) => toast(message, "error"),
    [toast],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, success, warn, error }}>
      {children}

      {/* Toast Stack Container positioned at bottom-right of the screen */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
              className="pointer-events-auto w-full"
            >
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-3 shadow-2xl ${
                  t.type === "success"
                    ? "border-emerald-500/20 text-status-success"
                    : t.type === "warn"
                      ? "border-amber-500/20 text-status-warning"
                      : "border-rose-500/20 text-status-error"
                }`}
                style={{
                  backgroundColor:
                    t.type === "success"
                      ? `${tokens.colors.status.success}0d`
                      : t.type === "warn"
                        ? `${tokens.colors.status.warning}0d`
                        : `${tokens.colors.status.error}0d`,
                }}
              >
                {t.type === "success" && (
                  <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5 text-emerald-400" />
                )}
                {t.type === "warn" && (
                  <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-amber-400" />
                )}
                {t.type === "error" && (
                  <XCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-rose-400" />
                )}

                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-[11px] font-medium text-white leading-snug">
                    {t.message}
                  </p>
                  {t.actionLabel && t.onAction && (
                    <button
                      onClick={() => {
                        t.onAction?.();
                        setToasts((prev) => prev.filter((toastItem) => toastItem.id !== t.id));
                      }}
                      className="mt-2 text-[10px] font-bold text-sky-400 hover:text-sky-300 transition-colors uppercase tracking-wider cursor-pointer"
                    >
                      {t.actionLabel} →
                    </button>
                  )}
                </div>

                <button
                  onClick={() => removeToast(t.id)}
                  className="p-1 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
