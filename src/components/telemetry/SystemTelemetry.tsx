import React, { useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Radio,
  Webhook,
  Upload,
  FileText,
  FileSpreadsheet,
  File,
  X,
  Loader2,
  Zap,
  Shield,
  Terminal,
} from "lucide-react";
import { useToast } from "../shared/ToastContext";
import { apiClient } from "../../services/apiClient";

// ─── Document Intelligence Pipeline Types ─────────────────────────────────────

type DocStatus = "queued" | "processing" | "completed" | "failed" | "extracting";
type DocCategory = "pdf" | "excel" | "txt" | "csv" | "other";

interface DocIngestionJob {
  id: string;
  filename: string;
  fileSize: number;        // bytes
  category: DocCategory;
  status: DocStatus;
  uploadedAt: string;
  startedAt?: string;
  completedAt?: string;
  progress: number;        // 0–100
  extractedCount?: number; // number of catalog rules / mappings extracted
  errorMessage?: string;
  logLines: string[];      // per-job activity log
}

// ─── Webhook + API Log Types ───────────────────────────────────────────────────

type ApiLogLevel = "info" | "success" | "warn" | "error";

interface ApiLogEntry {
  id: string;
  timestamp: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  statusCode: number;
  durationMs: number;
  level: ApiLogLevel;
  payload?: string;
}

interface WebhookEvent {
  id: string;
  timestamp: string;
  event: string;
  source: string;
  hmacVerified: boolean;
  statusCode: number;
  payload: string;
  retries: number;
}

// ─── Mock data generators ─────────────────────────────────────────────────────

function makeMockApiLogs(): ApiLogEntry[] {
  const endpoints = [
    { ep: "/api/boq/ingest", method: "POST" as const, code: 200 },
    { ep: "/api/taxonomy/check-constraints", method: "POST" as const, code: 200 },
    { ep: "/api/taxonomy/rules", method: "POST" as const, code: 201 },
    { ep: "/api/reconciliation/compare", method: "POST" as const, code: 200 },
    { ep: "/api/jobs", method: "POST" as const, code: 202 },
    { ep: "/api/jobs/j-1234", method: "GET" as const, code: 404 },
    { ep: "/api/vendor/playwright/run", method: "POST" as const, code: 500 },
    { ep: "/api/catalog/skus", method: "GET" as const, code: 200 },
  ];

  return endpoints.map((e, i) => ({
    id: `log-${i + 1}`,
    timestamp: new Date(Date.now() - (endpoints.length - i) * 45000).toISOString(),
    endpoint: e.ep,
    method: e.method,
    statusCode: e.code,
    durationMs: Math.floor(Math.random() * 400) + 12,
    level: e.code >= 500 ? "error" : e.code >= 400 ? "warn" : e.code >= 200 && e.code < 300 ? "success" : "info",
    payload: e.method === "POST" ? `{ "ucid": "u1", "config_id": "cfg-${i}" }` : undefined,
  }));
}

function makeMockWebhooks(): WebhookEvent[] {
  return [
    { id: "wh-1", timestamp: new Date(Date.now() - 12000).toISOString(), event: "ucid.completed", source: "VSIP-Backend", hmacVerified: true, statusCode: 200, payload: '{ "ucid": "UCID-2026-1701", "status": "completed" }', retries: 0 },
    { id: "wh-2", timestamp: new Date(Date.now() - 55000).toISOString(), event: "bom.reconciled", source: "VSIP-Backend", hmacVerified: true, statusCode: 200, payload: '{ "sessionId": "rec-001", "discrepancies": 0 }', retries: 0 },
    { id: "wh-3", timestamp: new Date(Date.now() - 180000).toISOString(), event: "portal.playwright.failed", source: "Playwright-Agent", hmacVerified: false, statusCode: 401, payload: '{ "error": "HMAC mismatch" }', retries: 2 },
    { id: "wh-4", timestamp: new Date(Date.now() - 360000).toISOString(), event: "catalog.sku.updated", source: "VSIP-Backend", hmacVerified: true, statusCode: 200, payload: '{ "partNumber": "P40424-B21", "change": "eol_status" }', retries: 0 },
  ];
}

// ─── File type helpers ────────────────────────────────────────────────────────

function getCategory(filename: string): DocCategory {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf") return "pdf";
  if (["xlsx", "xls"].includes(ext)) return "excel";
  if (ext === "txt") return "txt";
  if (ext === "csv") return "csv";
  return "other";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const DOC_ICON: Record<DocCategory, React.ElementType> = {
  pdf: FileText,
  excel: FileSpreadsheet,
  txt: FileText,
  csv: FileSpreadsheet,
  other: File,
};

const STATUS_STYLES: Record<DocStatus, { color: string; bg: string; border: string; label: string }> = {
  queued:     { color: "text-gray-400",    bg: "bg-white/5",         border: "border-white/8",          label: "Queued" },
  processing: { color: "text-indigo-400",  bg: "bg-indigo-500/8",    border: "border-indigo-500/20",    label: "Processing" },
  extracting: { color: "text-amber-400",   bg: "bg-amber-500/8",     border: "border-amber-500/20",     label: "Extracting" },
  completed:  { color: "text-emerald-400", bg: "bg-emerald-500/8",   border: "border-emerald-500/20",   label: "Completed" },
  failed:     { color: "text-red-400",     bg: "bg-red-500/8",       border: "border-red-500/20",       label: "Failed" },
};

const HTTP_COLOR: Record<number, string> = {};
function getHttpColor(code: number): string {
  if (code >= 500) return "text-red-400";
  if (code >= 400) return "text-amber-400";
  if (code >= 200 && code < 300) return "text-emerald-400";
  return "text-gray-400";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SystemTelemetry() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"pipeline" | "api-logs" | "webhooks">("pipeline");
  const [jobs, setJobs] = useState<DocIngestionJob[]>([]);
  const [apiLogs] = useState<ApiLogEntry[]>(makeMockApiLogs);
  const [webhooks] = useState<WebhookEvent[]>(makeMockWebhooks);
  const [hmacSecret, setHmacSecret] = useState("vsip-wh-secret-••••••••");
  const [isDragging, setIsDragging] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  // Inject a mock job with animated progress
  const startJobProcessing = useCallback(async (job: DocIngestionJob) => {
    const steps = ["init", "parse", "ocr", "extract", "rules", "complete"];
    for (const step of steps) {
      try {
        const res = await fetch("/api/pipeline/step", {
          method: "POST",
          body: JSON.stringify({ jobId: job.id, step })
        });
        const json = await res.json();
        const data = json.data;

        setJobs((prev) =>
          prev.map((j) =>
            j.id === job.id
              ? {
                  ...j,
                  progress: data.progress,
                  status: data.status,
                  logLines: [...j.logLines, `[${new Date().toLocaleTimeString()}] ${data.log}`],
                  ...(data.status === "completed" ? { completedAt: new Date().toISOString(), extractedCount: data.extractedCount } : {}),
                  ...(step === "init" ? { startedAt: new Date().toISOString() } : {}),
                }
              : j
          )
        );

        if (data.status === "completed") {
          toast(`Document "${job.filename}" processed — intelligence extracted!`, "success");
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, [toast]);

  // Handle file drop or file picker
  const processFiles = useCallback((files: File[]) => {
    const validFiles = files.filter((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() || "";
      return ["pdf", "xlsx", "xls", "txt", "csv", "docx"].includes(ext);
    });

    if (validFiles.length === 0) {
      toast("Unsupported file type. Accepted: PDF, Excel, TXT, CSV.", "warn");
      return;
    }

    if (validFiles.length !== files.length) {
      toast(`${files.length - validFiles.length} file(s) skipped — unsupported format.`, "warn");
    }

    const newJobs: DocIngestionJob[] = validFiles.map((f) => ({
      id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      filename: f.name,
      fileSize: f.size,
      category: getCategory(f.name),
      status: "queued",
      uploadedAt: new Date().toISOString(),
      progress: 0,
      logLines: [`[${new Date().toLocaleTimeString()}] [QUEUE] Job created for "${f.name}"`],
    }));

    setJobs((prev) => [...newJobs, ...prev]);
    toast(`${newJobs.length} document${newJobs.length > 1 ? "s" : ""} queued for processing.`, "success");

    newJobs.forEach((job) => {
      startJobProcessing(job);
    });
  }, [startJobProcessing, toast]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      processFiles(Array.from(e.dataTransfer.files));
    },
    [processFiles]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        processFiles(Array.from(e.target.files));
        e.target.value = "";
      }
    },
    [processFiles]
  );

  const handleClearJob = useCallback((jobId: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
  }, []);

  // Test HMAC webhook
  const handleTestHMAC = useCallback(async () => {
    try {
      await apiClient.post("/api/jobs", { type: "webhook-test", context: {}, parent_job_id: "" });
    } catch { /* expected */ }
    toast("HMAC test webhook dispatched. Check webhook log below.", "success");
  }, [toast]);

  // Stats
  const pipelineStats = useMemo(() => ({
    total: jobs.length,
    queued: jobs.filter((j) => j.status === "queued").length,
    running: jobs.filter((j) => j.status === "processing" || j.status === "extracting").length,
    completed: jobs.filter((j) => j.status === "completed").length,
    failed: jobs.filter((j) => j.status === "failed").length,
    extracted: jobs.reduce((acc, j) => acc + (j.extractedCount || 0), 0),
  }), [jobs]);

  const tabs = [
    { id: "pipeline" as const, label: "Document Pipeline", icon: Upload },
    { id: "api-logs" as const, label: "API Logs", icon: Terminal },
    { id: "webhooks" as const, label: "Webhook Monitor", icon: Webhook },
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
                PRD §3.10 — Document upload queue · API logs · Webhook monitor · HMAC validation
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
            <button
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

      {/* ── Document Intelligence Pipeline ─────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === "pipeline" && (
          <motion.div
            key="pipeline"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex flex-col gap-4"
          >
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: "Queued", value: pipelineStats.queued, color: "text-gray-300" },
                { label: "Running", value: pipelineStats.running, color: "text-indigo-400" },
                { label: "Completed", value: pipelineStats.completed, color: "text-emerald-400" },
                { label: "Failed", value: pipelineStats.failed, color: "text-red-400" },
                { label: "Rules Extracted", value: pipelineStats.extracted, color: "text-amber-400" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/5 bg-black/20 p-3 text-center"
                >
                  <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Drop zone */}
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter") fileInputRef.current?.click(); }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-xl border-2 border-dashed p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
                isDragging
                  ? "border-indigo-500/60 bg-indigo-500/8"
                  : "border-white/10 bg-black/10 hover:border-indigo-500/30 hover:bg-indigo-500/5"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.xlsx,.xls,.txt,.csv,.docx"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                isDragging ? "bg-indigo-500/20 border border-indigo-500/40" : "bg-white/5 border border-white/10"
              }`}>
                <Upload className={`w-6 h-6 ${isDragging ? "text-indigo-400" : "text-gray-500"}`} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white">
                  {isDragging ? "Drop to queue for processing" : "Drop files or click to upload"}
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  PDF · Excel · CSV · TXT · DOCX — multiple files processed in parallel
                </p>
                <p className="text-[10px] text-indigo-400 mt-1 font-mono">
                  Intelligence rules extracted automatically · No race conditions
                </p>
              </div>
              {isDragging && (
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-indigo-500 pointer-events-none"
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </div>

            {/* Job list */}
            {jobs.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                    Processing Queue ({jobs.length})
                  </p>
                  <button
                    onClick={() => setJobs((prev) => prev.filter((j) => j.status !== "completed"))}
                    className="text-[10px] text-gray-600 hover:text-gray-400 font-mono cursor-pointer transition"
                  >
                    Clear Completed
                  </button>
                </div>
                <AnimatePresence initial={false}>
                  {jobs.map((job) => {
                    const cfg = STATUS_STYLES[job.status];
                    const Icon = DOC_ICON[job.category];
                    const isExpanded = expandedJobId === job.id;

                    return (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        layout
                        className="rounded-xl border border-white/5 bg-black/20 overflow-hidden"
                      >
                        <div
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => { if (e.key === "Enter") setExpandedJobId(isExpanded ? null : job.id); }}
                          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/[0.015]"
                          onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                        >
                          {/* File icon */}
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-gray-400" />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] font-bold text-white truncate max-w-[200px]">{job.filename}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                                {cfg.label}
                              </span>
                              {job.extractedCount !== undefined && (
                                <span className="text-[9px] text-amber-400 font-mono">{job.extractedCount} rules</span>
                              )}
                            </div>
                            <p className="text-[9px] text-gray-500 mt-0.5">
                              {formatBytes(job.fileSize)} · {new Date(job.uploadedAt).toLocaleTimeString()}
                            </p>
                          </div>

                          {/* Progress */}
                          <div className="flex items-center gap-2 shrink-0">
                            {(job.status === "processing" || job.status === "extracting") && (
                              <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                            )}
                            <span className="text-[10px] text-gray-500 font-mono w-8 text-right">{job.progress}%</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleClearJob(job.id); }}
                              className="w-5 h-5 flex items-center justify-center rounded text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Progress bar */}
                        {job.status !== "queued" && (
                          <div className="h-0.5 bg-white/5">
                            <motion.div
                              className="h-full"
                              style={{
                                background: job.status === "completed"
                                  ? "#00d4a0"
                                  : job.status === "failed"
                                  ? "#ff3d5a"
                                  : job.status === "extracting"
                                  ? "#ff9b36"
                                  : "#4a85fd",
                              }}
                              animate={{ width: `${job.progress}%` }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                          </div>
                        )}

                        {/* Expanded log */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden border-t border-white/5"
                            >
                              <div className="p-3 bg-black/30 font-mono text-[9px] text-gray-400 space-y-0.5 max-h-32 overflow-y-auto">
                                {job.logLines.map((line, idx) => (
                                  <div
                                    key={idx}
                                    className={
                                      line.includes("[DONE]")
                                        ? "text-emerald-400"
                                        : line.includes("[ERROR]")
                                        ? "text-red-400"
                                        : line.includes("[EXTRACT]") || line.includes("[RULES]")
                                        ? "text-amber-400"
                                        : "text-gray-400"
                                    }
                                  >
                                    {line}
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            {jobs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                <p className="text-[11px] text-gray-600">No documents queued yet. Upload files above to begin extraction.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── API Activity Logs ─────────────────────────────────────────── */}
        {activeTab === "api-logs" && (
          <motion.div
            key="api-logs"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="rounded-xl border border-white/5 bg-black/15 overflow-hidden"
          >
            <div className="p-3 border-b border-white/5 flex items-center justify-between">
              <p className="text-[11px] font-bold text-gray-300">API Request Log ({apiLogs.length} entries)</p>
              <p className="text-[9px] text-gray-600 font-mono">Live stream — last 24h</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-black/30 border-b border-white/5 text-gray-500 font-mono text-[9px] uppercase tracking-wider">
                    <th className="p-2.5 font-normal">Time</th>
                    <th className="p-2.5 font-normal">Method</th>
                    <th className="p-2.5 font-normal">Endpoint</th>
                    <th className="p-2.5 font-normal text-center">Status</th>
                    <th className="p-2.5 font-normal text-right">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {apiLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.015] transition-colors">
                      <td className="p-2.5 text-gray-500 font-mono whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="p-2.5">
                        <span className={`font-bold font-mono ${
                          log.method === "GET" ? "text-emerald-400" :
                          log.method === "POST" ? "text-indigo-400" :
                          log.method === "DELETE" ? "text-red-400" : "text-amber-400"
                        }`}>{log.method}</span>
                      </td>
                      <td className="p-2.5 font-mono text-gray-300">{log.endpoint}</td>
                      <td className="p-2.5 text-center">
                        <span className={`font-bold font-mono ${getHttpColor(log.statusCode)}`}>
                          {log.statusCode}
                        </span>
                      </td>
                      <td className="p-2.5 text-right text-gray-500 font-mono">{log.durationMs}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ── Webhook Monitor ───────────────────────────────────────────── */}
        {activeTab === "webhooks" && (
          <motion.div
            key="webhooks"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex flex-col gap-4"
          >
            {/* HMAC secret tester */}
            <div
              className="p-4 rounded-xl border border-white/8 bg-black/20 flex flex-col md:flex-row items-start md:items-center gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <p className="text-[11px] font-bold text-white">HMAC Webhook Signing Secret</p>
                </div>
                <input
                  type="text"
                  value={hmacSecret}
                  onChange={(e) => setHmacSecret(e.target.value)}
                  className="w-full bg-black/40 border border-white/8 rounded-lg px-3 py-2 text-[11px] text-white font-mono placeholder-gray-600 focus:outline-none focus:border-indigo-500/40"
                />
              </div>
              <button
                onClick={handleTestHMAC}
                className="flex items-center gap-1.5 text-[11px] font-bold px-4 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition cursor-pointer shrink-0"
              >
                <Zap className="w-3.5 h-3.5 text-yellow-300" />
                Test Dispatch
              </button>
            </div>

            {/* Webhook events table */}
            <div className="rounded-xl border border-white/5 bg-black/15 overflow-hidden">
              <div className="p-3 border-b border-white/5 flex items-center justify-between">
                <p className="text-[11px] font-bold text-gray-300">Webhook Events ({webhooks.length})</p>
                <p className="text-[9px] text-gray-600 font-mono">HMAC verified status shown</p>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {webhooks.map((wh) => (
                  <div key={wh.id} className="p-3 hover:bg-white/[0.015] transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${wh.hmacVerified ? "bg-emerald-400" : "bg-red-400 animate-pulse"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-[11px] font-bold text-white font-mono">{wh.event}</span>
                          <span className={`text-[9px] font-bold font-mono ${getHttpColor(wh.statusCode)}`}>{wh.statusCode}</span>
                          {wh.retries > 0 && (
                            <span className="text-[9px] text-amber-400 font-mono">{wh.retries} retries</span>
                          )}
                          {!wh.hmacVerified && (
                            <span className="text-[9px] font-bold text-red-400 border border-red-500/20 bg-red-500/8 px-1.5 py-0.5 rounded font-mono">
                              HMAC FAIL
                            </span>
                          )}
                          {wh.hmacVerified && (
                            <span className="text-[9px] font-bold text-emerald-400 border border-emerald-500/20 bg-emerald-500/8 px-1.5 py-0.5 rounded font-mono">
                              ✓ SIGNED
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[9px] text-gray-500">
                          <span>{wh.source}</span>
                          <span>·</span>
                          <span className="font-mono">{new Date(wh.timestamp).toLocaleString()}</span>
                        </div>
                        <code className="text-[9px] text-gray-600 font-mono mt-1 block truncate max-w-md">
                          {wh.payload}
                        </code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
