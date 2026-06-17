export type DocStatus = "queued" | "processing" | "completed" | "failed" | "extracting";
export type DocCategory = "pdf" | "excel" | "txt" | "csv" | "other";
export type ApiLogLevel = "info" | "success" | "warn" | "error";

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
