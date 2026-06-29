import { CatalogSKUSchema, VendorExtendedFieldsSchema } from "../zodSchemas";
import { z } from "zod";



export enum SolutionBuilderStep {
  INTAKE = 1,
  WORKSPACE = 2,
}

export enum IngestionMode {
  BOQ = "boq",
  BOM = "bom",
  PORTFOLIO = "portfolio",
  LAUNCH = "launch",
}

/**
 * ============================================================================
 * ENTERPRISE PROCUREMENT INTEGRITY PLATFORM - DATA CONTRACTS
 * ============================================================================
 * File: /src/types/data.ts
 *
 * This module defines the strict structural boundaries, schemas, and typed
 * input/output contracts used to synchronize the frontend visual panels with
 * durable databases (e.g., Cloud SQL / Spanner / Firestore), background crawling
 * runtimes (Playwright/Puppeteer), and outbound ERP service-mesh gateways.
 */

/**
 * Represent a single line item within a compiled structural Bill of Materials (BOM).
 * Corresponds to a row in the relational database mapping individual components to active jobs.
 */
export interface BOMItem {
  id: string; // Globally Unique UUID / Primary Key
  partNumber: string; // Canonical Manufacturer SKU (e.g. "INTEL-8480X-SP")
  name: string; // Clear English representation description
  type: string; // Asset class: "Processor" | "Memory" | "Chassis" | "Storage" | "Networking" | "Power"
  quantity: number; // Sourced quantity
  unitPrice: number; // Sourced Unit Price (denominated in USD)
}

export interface Config {
  id: string; // Config Hash UUID
  name: string; // E.g. "Primary Compute Node - DL380"
  totalPrice: number;
  originalPrice: number;
  savings?: number;
  vendor?: string;
  executionMode?: 'automated' | 'manual' | 'hybrid'; // Allows a specific config to override parent UCID
  items: BOMItem[];
}

export interface VendorSubmission {
  id: string; // Submission UUID
  vendor: string; // Brand identifier E.g. "HPE", "Dell"
  label: string; // Description
  totalPrice: number;
  originalPrice: number;
  savings: number;
  complianceScore: number;
  configs: Config[]; // Array of configuration sheets assigned to this vendor proposal
}

/**
 * Represents an overarching Solution Architecture layout which tracks one or more
 * competing vendor submissions proposing architectures for the specific opportunity.
 */
export interface Solution {
  id: string; // Local Proposal UUID
  name: string; // E.g. "Core Spine Upgrade"
  targetUcidId: string;
  vendorSubmissions: VendorSubmission[]; // The alternatives
  selectedVendorSubmissionId?: string; // ID of the actively chosen winner submission
}

/**
 * Event-log entry detailing background intelligence operations on active configuration lines.
 * Written directly to the job telemetry channel.
 */
export interface LogEvent {
  timestamp: string; // ISO-8601 UTC Timestamp
  level: "info" | "warn" | "ok" | "err"; // Telemetry tracking severity levels
  msg: string; // Informational narrative string
}

/**
 * Locked snapshot committed to the durable ledger for procurement execution.
 * Represents contract agreement signature.
 */
export interface Snapshot {
  id: string; // Snapshot Unique Hash / Primary Key
  label: string; // User-assigned milestone identifier
  committedAt: string; // Signature date timestamp
  winnerSolution: string; // The selected solution architecture (ID or Name)
  totalValue: number; // Absolute order layout cost (USD)
  notes: string; // Administrative notes or auditing justifications
  payload?: Solution[]; // The configuration payload state at the time of the snapshot
  version: number; // Snapshot version number
  timestamp: string; // Real-time timestamp of creation
  locked: boolean; // Indicates if snapshot is locked
  bomSnapshot?: Config[]; // Full config BOM snapshot representing the reconciled state
}

/**
 * VendorAssignment — maps a vendor to a subset of configIndices.
 */
export interface VendorAssignment {
  id: string;
  vendor: string;
  configIndices: number[];
  ucidIds: string[];
  isPrimary: boolean;
  addedAt: string;
}

export type UCIDExecutionMode = 'automated' | 'manual' | 'hybrid';

export type AutomationRunStatus =
  | 'idle'
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'requires-review';

export interface UCIDAutomationState {
  jobId: string;
  vendorPortalName: string;
  portalUrl: string;
  status: AutomationRunStatus;
  queuedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  screenshotRef: string | null;
  outputFileRef: string | null;
  retryCount: number;
}

export interface UCIDManualUploadState {
  status: 'awaiting-upload' | 'uploaded' | 'processing' | 'complete' | 'rejected';
  uploadedAt: string | null;
  fileNames: string[];
  uploadedBy: string | null;
  rejectionReason: string | null;
  outputFileRefs: string[];
  processedAt: string | null;
}

/**
 * SolutionStatus — lifecycle states for a SolutionProject.
 *
 * Transition rules:
 *   draft         → cleansing     (BOQ parsing begins)
 *   cleansing     → ucid-pending  (all configs extracted)
 *   ucid-pending  → in-progress   (UCIDs created, first workflow started)
 *   in-progress   → parallel-active (2+ UCIDs running simultaneously)
 *   parallel-active → in-progress (only 1 UCID remaining)
 *   in-progress   → completed     (all UCIDs reach snapshot step)
 *   any state     → on-hold       (explicit user action)
 */
export type SolutionStatus =
  | 'draft'            // Created, BOQ not yet parsed
  | 'cleansing'        // Configs being extracted and cleaned
  | 'ucid-pending'     // Cleansed configs awaiting UCID assignment
  | 'in-progress'      // At least one UCID workflow running
  | 'parallel-active'  // More than one UCID running simultaneously
  | 'completed'        // All UCIDs in snapshot/completed state
  | 'on-hold';         // Paused by user

/**
 * SolutionProject — the top-level entity created for every BOQ upload
 * or "New Solution" click. All UCIDs from a given BOQ hang from this root.
 *
 * NAMING COLLISION NOTE:
 *   The existing `UCID.solutions: Solution[]` field holds vendor design
 *   alternatives (a different concept). This entity is named SolutionProject
 *   to avoid collision with that field. Do not rename UCID.solutions.
 *
 * UNIQUENESS:
 *   SolutionProject.name must be unique in the store.
 *   Format: "{CustomerName}-{BOQRef}-{YYYY}" e.g. "YLNG-Balhaf-2026"
 *   If a collision is detected, append a suffix: "YLNG-Balhaf-2026-2"
 */
export interface SolutionProject {
  /** UUID — crypto.randomUUID() */
  id: string;

  /** Human-readable reference. Regex: /^SOL-\d{4}-\d+$/ e.g. "SOL-2026-001" */
  displayId: string;

  /**
   * Globally unique solution name.
   * Format: "{CustomerName}-{BOQRef}-{YYYY}"
   * Examples: "YLNG-Balhaf-2026", "DB-Cluster-2026", "BusinessGPT-AI-2026"
   */
  name: string;

  /** Customer display reference */
  customerName: string;

  /** Original BOQ filename (e.g. "YLNG_Server_BOQ_v3.xlsx") */
  boqSourceFile: string;

  /** Primary vendor: "HPE" | "Dell" | "Cisco" | "Juniper" | "Lenovo" */
  vendor: string;
  
  /** Assigned vendors mapping */
  vendorAssignments: VendorAssignment[];

  /** SAP/Salesforce opportunity ID */
  projectRef: string;

  status: SolutionStatus;

  /** Total number of configs parsed from the BOQ */
  configCount: number;

  /**
   * Ordered list of UCID.id values created for this solution.
   * Index 0 = Config #1 (configIndex: 1), Index 1 = Config #2, etc.
   */
  ucidIds: string[];

  /** The UCID currently in focus for UI (e.g. taxonomy graph context) */
  activeUcidId: string | null;

  /**
   * Future feature flag. When true, enables cross-vendor equivalence lookup.
   * NEVER set to true by default. Must be explicitly enabled by user at Solution level.
   */
  crossVendorEnabled: boolean;

  /** ISO-8601 creation timestamp */
  createdAt: string;

  /** Solution-level audit trail (distinct from per-UCID events) */
  events: LogEvent[];
}

/**
 * Master representation of a Unique Configuration Identifier (UCID).
 * Ingests raw inputs, monitors sequence workflows, processes alternate proposals,
 * and tracks execution telemetry.
 */
export interface UCID {
  id: string; // Master UCID Job Hash
  displayId: string; // Human indexing reference (e.g., "UCID-2026-092")
  name: string; // Customer-facing Solution layout name
  /** 
   * @deprecated Phase 11: use `solutionId` (UUID FK) instead.
   * Retained for backward compatibility with pre-Phase-11 mock data.
   * Will be removed in Phase 12.
   */
  solutionName?: string; // Explicit configuration group assignment
  priority: "critical" | "high" | "medium" | "low"; // Ingestion priority tier
  projectRef: string; // Internal SAP/Salesforce active Opportunity identification
  createdAt: string; // Creation Timestamp
  currentStep:
    | "boq-intake"
    | "pre-intelligence"
    | "solution-design"
    | "vendor-provisioning"
    | "post-intelligence"
    | "comparison"
    | "snapshot";
  completedSteps: (
    | "boq-intake"
    | "pre-intelligence"
    | "solution-design"
    | "vendor-provisioning"
    | "post-intelligence"
    | "comparison"
    | "snapshot"
  )[];
  rawBOM: string; // Raw unstructured text or parsed JSON data from the uploader
  solutions: Solution[]; // Collection of automatically generated vendor design alternatives
  events: LogEvent[]; // Forensic execution log trail
  snapshots: Snapshot[]; // Committed contract history
  syncStatus?: "Pending" | "Synced" | "Out-of-Sync" | "Error"; // Badges requested for Live Mission & Solution Builder consistency tracking
  trackingRef?: string; // Tracks draft variant logic without breaking master identifier regex schemas

  // ── Phase 11 additions ─────────────────────────────────────
  /**
   * Foreign key → SolutionProject.id
   * REQUIRED from Phase 11 onward. Every UCID must have a parent SolutionProject.
   */
  solutionId: string;

  /**
   * Parent SolutionProject.displayId — used in breadcrumb UI.
   * e.g. "SOL-2026-001"
   */
  solutionDisplayId: string;

  /**
   * 1-based position of this config within its SolutionProject.
   * Config #1 = configIndex 1, Config #2 = configIndex 2, etc.
   */
  configIndex: number;

  /**
   * Human-readable config label, auto-generated during cleansing.
   * Examples: "Compute Config", "Storage Config", "Network Config"
   */
  configLabel: string;

  /**
   * Future: cross-vendor parallel grouping tag.
   * Null by default. Set only when crossVendorEnabled and equivalence matching is active.
   */
  parallelGroup: string | null;

  /**
   * How the vendor-provisioning workflow step is completed.
   */
  executionMode?: UCIDExecutionMode;

  /**
   * Present when executionMode === 'automated'. null otherwise.
   * Tracks the Playwright automation job state.
   */
  automationState?: UCIDAutomationState | null;

  /**
   * Present when executionMode === 'manual'. null otherwise.
   * Tracks the manual upload state.
   */
  manualUploadState?: UCIDManualUploadState | null;
}

/**
 * Flagged forensic audit issue parsed from quotations or design configurations.
 * Formulates the payload for the Sourcing Integrity Sandbox reports.
 */
export interface ForensicIssue {
  id: string; // Forensic exception locator ID
  title: string; // Exception summary
  description: string; // Deep technical description of discrepancy or overage
  vendor: string; // Brand involved
  severity: "critical" | "warning" | "info"; // Danger level
  status: "open" | "fixing" | "resolved"; // Correction status
  affectedItems: number; // Number of line items affected by this rule
  suggestedAction: string; // Automated repair trigger description
  autoRepairDiff?: {
    before: string;
    after: string;
    reason: string;
  };
}

// Types moved to vendor.ts and cleansing.ts
export * from './vendor';
export * from './cleansing';

