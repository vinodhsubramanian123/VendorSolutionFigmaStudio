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
}

/**
 * Manufacturer / Supplier direct web endpoint configuration.
 * Keeps status metadata for active continuous integration checks.
 */
export interface Vendor {
  id: string; // Vendor database key
  name: string; // Full corporate name (e.g., "Hewlett Packard Enterprise")
  shortName: string; // Brand code (e.g. "HPE", "Dell")
  status: "connected" | "disconnected" | "syncing" | "error"; // API channel state including hard failures
  color: string; // Branding color accent
  catalogItems: number; // Total indexed catalog items in local cache
  apiHealth: number; // API availability threshold (percentage rating 0-100)
  apiEndpoint: string; // Direct OAuth URL to supplier inventory system
  syncInterval: string; // Recurrence cron schedule/expression config
  lastSync: string; // Latest ingestion timestamp
  credentials?: {
    username: string;
    password?: string;
    mfaToken?: string;
  };
}

/**
 * Consolidated Central Inventory Stock Keeping Unit (SKU) record.
 * Leveraged by search indexes to match dirty descriptions and fulfill dynamic quotes.
 */
export type CatalogSKU = z.infer<typeof CatalogSKUSchema>;
export type VendorExtendedFields = z.infer<typeof VendorExtendedFieldsSchema>;

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

/**
 * ============================================================================
 * BROWSER AUTOMATION WORKERS - PLAYWRIGHT AGENT CONTRACTS
 * ============================================================================
 * Operational parameters for headless browser crawlers executing on target
 * distributor portals to scrap real-time supply indexes.
 */

export interface PlaywrightAgentConfig {
  targetUrl: string; // Login or inventory portal address
  headless: boolean; // Display browser engine or run headless
  viewportWidth: number;
  viewportHeight: number;
  timeoutMs: number; // Execution halt deadline
  maxRetries: number; // Fail-over reloads
  proxyRotation: boolean; // Toggle dynamic routing to prevent CAPTCHAs
}

export type PlaywrightAgentStatus =
  | "idle"
  | "running"
  | "success"
  | "failed"
  | "rate-limited";

export interface PlaywrightExecutionLog {
  timestamp: string;
  level: "info" | "debug" | "screenshot" | "error";
  message: string;
  screenshotUrl?: string; // Cloud storage file handle for optical debugging
}

export interface PlaywrightAgentTask {
  taskId: string;
  agentName: "AribaScraper" | "HPEMarketplace" | "DellPremierPortal";
  ucidRef: string;
  startedAt: string;
  completedAt?: string;
  status: PlaywrightAgentStatus;
  config: PlaywrightAgentConfig;
  logs: PlaywrightExecutionLog[];
  metrics: {
    pagesNavigated: number;
    selectorsResolved: number;
    bandwidthBytes: number;
    durationMs: number;
  };
  extractedItemsCount: number;
}

/**
*/
