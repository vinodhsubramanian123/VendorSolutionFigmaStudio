import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Radio, Webhook, Upload, Terminal, RotateCcw } from "lucide-react";
import { apiClient } from "../../services/apiClient";
import { DocumentPipelinePanel } from "./DocumentPipelinePanel";
import { ApiLogsTable } from "./ApiLogsTable";
import { WebhookMonitor } from "./WebhookMonitor";
import { resetToSeedData } from "../../lib/resetSeedData";
import type { ApiLogEntry, WebhookEvent } from "./types";

// ─── Component ────────────────────────────────────────────────────────────────

const TELEMETRY_TABS = [
  { id: "pipeline" as const,  label: "Document Pipeline", icon: Upload },
  { id: "api-logs" as const,  label: "API Logs",          icon: Terminal },
  { id: "webhooks" as const,  label: "Webhook Monitor",   icon: Webhook },
];

export function SystemTelemetry() {
  const [activeTab, setActiveTab] = useState<"pipeline" | "api-logs" | "webhooks">("pipeline");
  const [apiLogs, setApiLogs] = useState<ApiLogEntry[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEvent[]>([]);
  const [confirmingReset, setConfirmingReset] = useState(false);

  useEffect(() => {
    apiClient.get<ApiLogEntry[]>("/api/telemetry/logs")
      .then(res => setApiLogs(res.data || []))
      .catch(() => {});
    apiClient.get<WebhookEvent[]>("/api/telemetry/webhooks")
      .then(res => setWebhooks(res.data || []))
      .catch(() => {});
  }, []);

  return (
    <motion.div
      className="flex flex-col gap-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* Header */}
      <div
        className="p-5 rounded-xl border"
        style={{ background: "rgba(7,10,19,0.8)", borderColor: "rgba(74,133,253,0.12)" }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Radio className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-content-primary">
                System Telemetry &amp; Intelligence Pipeline
              </h1>
              <p className="text-[11px] text-content-primary0 mt-0.5">
                Document upload queue · API logs · Webhook monitor · HMAC validation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="flex items-center gap-1.5 text-[9px] font-bold font-mono text-status-success border border-status-success/20 bg-status-success/8 px-2.5 py-1.5 rounded-full animate-pulse"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
              TELEMETRY LIVE
            </span>
            {confirmingReset ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-status-warning">Wipe all local session data?</span>
                <button
                  type="button"
                  onClick={resetToSeedData}
                  className="text-[9px] font-bold font-mono px-2.5 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 cursor-pointer transition"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingReset(false)}
                  className="text-[9px] font-mono px-2.5 py-1.5 rounded-full border border-white/10 text-content-secondary hover:text-content-primary cursor-pointer transition"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingReset(true)}
                title="Clear all persisted session data and reload from pristine seed data"
                className="flex items-center gap-1.5 text-[9px] font-bold font-mono text-content-secondary border border-white/10 px-2.5 py-1.5 rounded-full hover:text-content-primary hover:border-white/20 cursor-pointer transition"
              >
                <RotateCcw className="w-3 h-3" />
                Reset to Seed Data
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 p-1 rounded-lg bg-surface-canvas/25 border border-white/5 w-fit">
          {TELEMETRY_TABS.map((tab) => (
            <button type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-[11px] font-bold transition cursor-pointer ${
                activeTab === tab.id
                  ? "bg-brand-indigo text-content-primary shadow-lg shadow-indigo-500/20"
                  : "text-content-primary0 hover:text-content-secondary"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "pipeline" && <DocumentPipelinePanel key="pipeline" />}
        {activeTab === "api-logs" && <ApiLogsTable key="api-logs" apiLogs={apiLogs} />}
        {activeTab === "webhooks" && <WebhookMonitor key="webhooks" webhooks={webhooks} />}
      </AnimatePresence>
    </motion.div>
  );
}
