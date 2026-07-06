import React from "react";
import { motion, AnimatePresence } from "motion/react";
import type { ApiLogEntry } from "./types";

function getHttpColor(code: number): string {
  if (code >= 500) return "text-status-error";
  if (code >= 400) return "text-status-warning";
  if (code >= 200 && code < 300) return "text-status-success";
  return "text-content-secondary";
}

interface ApiLogsTableProps {
  apiLogs: ApiLogEntry[];
}

export function ApiLogsTable({ apiLogs }: ApiLogsTableProps) {
  return (
    <motion.div
      key="api-logs"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="rounded-xl border border-white/5 bg-surface-canvas/15 overflow-hidden"
    >
      <div className="p-3 border-b border-white/5 flex items-center justify-between">
        <p className="text-[11px] font-bold text-content-secondary">API Request Log ({apiLogs.length} entries)</p>
        <p className="text-[9px] text-content-muted font-mono">Live stream — last 24h</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[10px]">
          <thead>
            <tr className="bg-surface-canvas/30 border-b border-white/5 text-content-primary0 font-mono text-[9px] uppercase tracking-wider">
              <th className="p-2.5 font-normal">Time</th>
              <th className="p-2.5 font-normal">Method</th>
              <th className="p-2.5 font-normal">Endpoint</th>
              <th className="p-2.5 font-normal text-center">Status</th>
              <th className="p-2.5 font-normal text-right">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            <AnimatePresence mode="popLayout" initial={false}>
              {apiLogs.map((log) => (
                <motion.tr
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={log.id}
                  className="hover:bg-white/[0.015] transition-colors"
                >
                  <td className="p-2.5 text-content-primary0 font-mono whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-2.5">
                    <span className={`font-bold font-mono ${
                      log.method === "GET" ? "text-status-success" :
                      log.method === "POST" ? "text-brand-indigo" :
                      log.method === "DELETE" ? "text-status-error" : "text-status-warning"
                    }`}>{log.method}</span>
                  </td>
                  <td className="p-2.5 font-mono text-content-secondary">{log.endpoint}</td>
                  <td className="p-2.5 text-center">
                    <span className={`font-bold font-mono ${getHttpColor(log.statusCode)}`}>
                      {log.statusCode}
                    </span>
                  </td>
                  <td className="p-2.5 text-right text-content-primary0 font-mono">{log.durationMs}ms</td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {apiLogs.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-[10px] text-content-muted">
                  No API log entries recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
