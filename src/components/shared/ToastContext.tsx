import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "warn" | "error";
}

interface ToastContextType {
  toast: (message: string, type?: "success" | "warn" | "error") => void;
  success: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
}

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
    (message: string, type: "success" | "warn" | "error" = "success") => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);

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
                    ? "bg-[#061513] border-emerald-500/20 text-status-success"
                    : t.type === "warn"
                      ? "bg-[#18110b] border-amber-500/20 text-status-warning"
                      : "bg-[#1a0c0e] border-rose-500/20 text-status-error"
                }`}
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

                <div className="flex-1 text-[11px] text-gray-200 font-medium font-sans leading-normal">
                  {t.message}
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
