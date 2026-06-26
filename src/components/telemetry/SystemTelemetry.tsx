import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Radio, Webhook, Upload, Terminal } from "lucide-react";
import { apiClient } from "../../services/apiClient";
import { DocumentPipelinePanel } from "./DocumentPipelinePanel";
import { ApiLogsTable } from "./ApiLogsTable";
import { WebhookMonitor } from "./WebhookMonitor";
import type { ApiLogEntry, WebhookEvent } from "./types";

// ─── Component ────────────────────────────────────────────────────────────────

export function SystemTelemetry() {
  const [activeTab, setActiveTab] = useState<"pipeline" | "api-logs" | "webhooks">("pipeline");
  const [apiLogs, setApiLogs] = useState<ApiLogEntry[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEvent[]>([]);

  useEffect(() => {
    apiClient.get<ApiLogEntry[]>("/api/telemetry/logs")
      .then(res => setApiLogs(res.data || []))
      .catch(() => {});
    apiClient.get<WebhookEvent[]>("/api/telemetry/webhooks")
      .then(res => setWebhooks(res.data || []))
      .catch(() => {});
  }, []);

  const tabs = [
    { id: "pipeline" as const,  label: "Document Pipeline", icon: Upload },
    { id: "api-logs" as const,  label: "API Logs",          icon: Terminal },
    { id: "webhooks" as const,  label: "Webhook Monitor",   icon: Webhook },
  ];

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
              <h1 className="text-sm font-bold text-white">
                System Telemetry &amp; Intelligence Pipeline
              </h1>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Document upload queue · API logs · Webhook monitor · HMAC validation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.span
              className="flex items-center gap-1.5 text-[9px] font-bold font-mono text-emerald-400 border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-1.5 rounded-full"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              TELEMETRY LIVE
            </motion.span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 p-1 rounded-lg bg-black/25 border border-white/5 w-fit">
          {tabs.map((tab) => (
            <button type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-[11px] font-bold transition cursor-pointer ${
                activeTab === tab.id
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                  : "text-gray-500 hover:text-gray-300"
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
