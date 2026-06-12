import {
  FileText,
  FileSpreadsheet,
  File,
} from "lucide-react";
import type { ElementType } from "react";

// ─── Document Intelligence Pipeline Types ─────────────────────────────────────

export type DocStatus = "queued" | "processing" | "completed" | "failed" | "extracting";
export type DocCategory = "pdf" | "excel" | "txt" | "csv" | "other";

export interface DocIngestionJob {
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

export type ApiLogLevel = "info" | "success" | "warn" | "error";

export interface ApiLogEntry {
  id: string;
  timestamp: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  statusCode: number;
  durationMs: number;
  level: ApiLogLevel;
  payload?: string;
}

export interface WebhookEvent {
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

export function makeMockApiLogs(): ApiLogEntry[] {
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

export function makeMockWebhooks(): WebhookEvent[] {
  return [
    { id: "wh-1", timestamp: new Date(Date.now() - 12000).toISOString(), event: "ucid.completed", source: "VSIP-Backend", hmacVerified: true, statusCode: 200, payload: '{ "ucid": "UCID-2026-1701", "status": "completed" }', retries: 0 },
    { id: "wh-2", timestamp: new Date(Date.now() - 55000).toISOString(), event: "bom.reconciled", source: "VSIP-Backend", hmacVerified: true, statusCode: 200, payload: '{ "sessionId": "rec-001", "discrepancies": 0 }', retries: 0 },
    { id: "wh-3", timestamp: new Date(Date.now() - 180000).toISOString(), event: "portal.playwright.failed", source: "Playwright-Agent", hmacVerified: false, statusCode: 401, payload: '{ "error": "HMAC mismatch" }', retries: 2 },
    { id: "wh-4", timestamp: new Date(Date.now() - 360000).toISOString(), event: "catalog.sku.updated", source: "VSIP-Backend", hmacVerified: true, statusCode: 200, payload: '{ "partNumber": "P40424-B21", "change": "eol_status" }', retries: 0 },
  ];
}

// ─── File type helpers ────────────────────────────────────────────────────────

export function getCategory(filename: string): DocCategory {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf") return "pdf";
  if (["xlsx", "xls"].includes(ext)) return "excel";
  if (ext === "txt") return "txt";
  if (ext === "csv") return "csv";
  return "other";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const DOC_ICON: Record<DocCategory, ElementType> = {
  pdf: FileText,
  excel: FileSpreadsheet,
  txt: FileText,
  csv: FileSpreadsheet,
  other: File,
};

export const STATUS_STYLES: Record<DocStatus, { color: string; bg: string; border: string; label: string }> = {
  queued:     { color: "text-gray-400",    bg: "bg-white/5",         border: "border-white/8",          label: "Queued" },
  processing: { color: "text-indigo-400",  bg: "bg-indigo-500/8",    border: "border-indigo-500/20",    label: "Processing" },
  extracting: { color: "text-amber-400",   bg: "bg-amber-500/8",     border: "border-amber-500/20",     label: "Extracting" },
  completed:  { color: "text-emerald-400", bg: "bg-emerald-500/8",   border: "border-emerald-500/20",   label: "Completed" },
  failed:     { color: "text-red-400",     bg: "bg-red-500/8",       border: "border-red-500/20",       label: "Failed" },
};

export const HTTP_COLOR: Record<number, string> = {};
export function getHttpColor(code: number): string {
  if (code >= 500) return "text-red-400";
  if (code >= 400) return "text-amber-400";
  if (code >= 200 && code < 300) return "text-emerald-400";
  return "text-gray-400";
}
