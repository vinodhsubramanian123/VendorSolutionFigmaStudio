import { GraphMetadataSchema, GraphNodeSchema, GraphEdgeSchema, GraphPathSchema, GraphAPISchema, CatalogSKUSchema, VendorExtendedFieldsSchema, AdviceResolutionSchema, RuleConflictSchema } from '../zodSchemas';
import { z } from 'zod';
import { UCID, Snapshot, LogEvent, BOMItem, Solution, VendorSubmission, Config } from './core';

export interface WorkflowStep {
  id: string;
  label: string;
  status: WorkflowStepStatus;
}

export type WorkflowStepStatus = "idle" | "in-progress" | "completed" | "error";

export interface ConfigItem {
  id: string;
  name: string;
  targetUcidId: string;
  vendor: "HPE" | "Dell" | "Cisco";
  totalPrice: number;
  originalPrice: number;
  items: BOMItem[];
}

export interface TaxonomyPath {
  vendor: string;
  solution: string;
  product: string;
  generation: string;
  chassis: string;
}

export interface UcidContainer {
  id: string; // e.g. UCID-2026-1699
  displayId?: string;
  name: string;
  reasoning: string;
  locked: boolean;
  syncStatus?: "Pending" | "Synced" | "Out-of-Sync";
}



export type GraphMetadata = z.infer<typeof GraphMetadataSchema>;

export type GraphNode = z.infer<typeof GraphNodeSchema>;

export type GraphEdge = z.infer<typeof GraphEdgeSchema>;

export type GraphPath = z.infer<typeof GraphPathSchema>;

export type GraphAPIResponse = z.infer<typeof GraphAPISchema>;

export type AdviceResolution = z.infer<typeof AdviceResolutionSchema>;
export type RuleConflict = z.infer<typeof RuleConflictSchema>;

export interface TableRow {
  id: string;
  boqItem: string;
  boqPart: string;
  boqQty: string | number;
  status: "Matched" | "Missing" | "Spec !=" | "Qty Delta" | "Added";
  bomPart: string;
  bomItem: string;
  bomQty: string | number;
  unitPrice: string | number;
  totalPrice: string | number;
  rawPartNumber: string;
  rawQty: number;
  rawType: string;
  rawPrice: number;
  hasAlert: boolean;
  alertId: string;
  alertTitle: string;
}

export interface TableGroup {
  name: string;
  count: number;
  greenDot: boolean;
  orangeDot: boolean;
  rows: TableRow[];
}

export type BadgeVariant = "success" | "warning" | "error" | "info" | "default";

export type BadgeSize = "sm" | "md";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "warn" | "error";
  actionLabel?: string;
  onAction?: () => void;
}

export interface ToastContextType {
  toast: (message: string, type?: "success" | "warn" | "error", actionLabel?: string, onAction?: () => void) => void;
  success: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
}

export type JobType = 'ingest' | 'config_process' | 'reconciliation' | 'forensics';
export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type UCIDStatus = 'active' | 'archived' | 'pending';

export interface JobContext {
    ucid: string;
    config_id: string;
    solution_id: string;
}

export interface Job {
    job_id: string;
    type: JobType;
    status: JobStatus;
    progress: number;
    context: JobContext;
    parent_job_id?: string;
    child_jobs?: string[];
    result?: Record<string, unknown>;
    error?: string;
}

export interface Invoice {
    id: string;
    vendorId: string;
    amount: number;
    status: string;
    date: string;
}

export interface ForensicAnomaly {
    id: string;
    type: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
    detectedAt: string;
}

export interface ReconciliationDiff {
    id: string;
    mismatchLevel: string;
    fields: string[];
}

export interface MissionScenario {
    id: string;
    name: string;
    target: string;
}

export interface KPI {
    id: string;
    label: string;
    current: number;
    target: number;
}

export interface VendorHealth {
    vendorId: string;
    status: 'healthy' | 'degraded' | 'down';
    latency: number;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    requestId: string;
    timestamp: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}


