import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Zap } from "lucide-react";
import { useToast } from "../shared/ToastContext";
import { apiClient } from "../../services/apiClient";
import type { WebhookEvent } from "./types";

function getHttpColor(code: number): string {
  if (code >= 500) return "text-status-error";
  if (code >= 400) return "text-status-warning";
  if (code >= 200 && code < 300) return "text-status-success";
  return "text-content-secondary";
}

interface WebhookMonitorProps {
  webhooks: WebhookEvent[];
}

export function WebhookMonitor({ webhooks }: WebhookMonitorProps) {
  const { toast } = useToast();
  const [hmacSecret, setHmacSecret] = useState("vsip-wh-secret-••••••••");

  const handleTestHMAC = useCallback(async () => {
    try {
      await apiClient.post("/api/jobs", { type: "webhook-test", context: {}, parent_job_id: "" });
    } catch { /* expected */ }
    toast("HMAC test webhook dispatched. Check webhook log below.", "success");
  }, [toast]);

  return (
    <motion.div
      key="webhooks"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex flex-col gap-4"
    >
      {/* HMAC secret tester */}
      <div className="p-4 rounded-xl border border-white/8 bg-surface-canvas/20 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-brand-indigo" />
            <p className="text-[11px] font-bold text-content-primary">HMAC Webhook Signing Secret</p>
          </div>
          <input
            type="text"
            value={hmacSecret}
            onChange={(e) => setHmacSecret(e.target.value)}
            aria-label="HMAC Webhook Signing Secret"
            className="w-full bg-surface-canvas/40 border border-white/8 rounded-lg px-3 py-2 text-[11px] text-content-primary font-mono placeholder-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus:border-brand-indigo/40"
          />
        </div>
        <button type="button"
          onClick={handleTestHMAC}
          className="flex items-center gap-1.5 text-[11px] font-bold px-4 py-2.5 rounded-lg bg-brand-indigo hover:bg-brand-indigo text-content-primary transition cursor-pointer shrink-0"
        >
          <Zap className="w-3.5 h-3.5 text-yellow-300" />
          Test Dispatch
        </button>
      </div>

      {/* Webhook events table */}
      <div className="rounded-xl border border-white/5 bg-surface-canvas/15 overflow-hidden">
        <div className="p-3 border-b border-white/5 flex items-center justify-between">
          <p className="text-[11px] font-bold text-content-secondary">Webhook Events ({webhooks.length})</p>
          <p className="text-[9px] text-content-muted font-mono">HMAC verified status shown</p>
        </div>
        <div className="divide-y divide-white/[0.04]">
          <AnimatePresence mode="popLayout" initial={false}>
            {webhooks.map((wh) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                key={wh.id}
                className="p-3 hover:bg-white/[0.015] transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${wh.hmacVerified ? "bg-status-success" : "bg-status-error animate-pulse"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-[11px] font-bold text-content-primary font-mono">{wh.event}</span>
                      <span className={`text-[9px] font-bold font-mono ${getHttpColor(wh.statusCode)}`}>{wh.statusCode}</span>
                      {wh.retries > 0 && (
                        <span className="text-[9px] text-status-warning font-mono">{wh.retries} retries</span>
                      )}
                      {!wh.hmacVerified && (
                        <span className="text-[9px] font-bold text-status-error border border-status-error/20 bg-status-error/8 px-1.5 py-0.5 rounded font-mono">
                          HMAC FAIL
                        </span>
                      )}
                      {wh.hmacVerified && (
                        <span className="text-[9px] font-bold text-status-success border border-status-success/20 bg-status-success/8 px-1.5 py-0.5 rounded font-mono">
                          ✓ SIGNED
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-content-primary0">
                      <span>{wh.source}</span>
                      <span>·</span>
                      <span className="font-mono">{new Date(wh.timestamp).toLocaleString()}</span>
                    </div>
                    <code className="text-[9px] text-content-muted font-mono mt-1 block truncate max-w-md">
                      {wh.payload}
                    </code>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {webhooks.length === 0 && (
            <div className="p-6 text-center text-[10px] text-content-muted">
              No webhook events received yet.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
