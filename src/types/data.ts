import { GraphMetadataSchema, GraphNodeSchema, GraphEdgeSchema, GraphAPISchema } from "./zodSchemas";
import { z } from "zod";








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
  savings: number;
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
}

/**
 * Event-log entry detailing background intelligence operations on active configuration lines.
 * Written directly to the job telemetry channel.
 */
export interface LogEvent {
  ts: string; // ISO-8601 UTC Timestamp
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
  payload?: any; // The configuration payload state at the time of the snapshot
  version: number; // Snapshot version number
  timestamp: string; // Real-time timestamp of creation
  locked: boolean; // Indicates if snapshot is locked
  bomSnapshot?: any; // Full config BOM snapshot representing the reconciled state
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
}

/**
 * Consolidated Central Inventory Stock Keeping Unit (SKU) record.
 * Leveraged by search indexes to match dirty descriptions and fulfill dynamic quotes.
 */
export interface CatalogSKU {
  id: string; // Internal Inventory SKU Primary Key
  vendor: string; // Sourcing Brand Ref
  partNumber: string; // True physical part identifier (e.g. "HPE-DL380-CHASS")
  name: string; // Formal description title
  type: string; // Component type classification
  price: number; // Sourced base list price (USD)
  leadTimeDays: number; // Supplier estimated fulfillment duration
  status: "active" | "eol" | "restricted"; // Lifecycle states
  // Structured taxonomy attributes to prevent string-inferrence hardcoding
  solution?: string; // Enterprise solution category e.g. "Server", "Storage"
  productFamily?: string; // e.g. "DL380", "Synergy", "Alletra"
  generation?: string; // e.g. "Gen11", "Gen10"
  chassisRef?: string; // Direct relation to the chassis grouping ID
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
 * ============================================================================
 * PHYSICAL HARDWARE CONSTRAINTS & KNOWLEDGE GRAPH GRAPH SCHEMAS
 * ============================================================================
 */

export interface PhysicalConstraint {
  socketType: "LGA4677" | "LGA1700" | "AM5" | "BGA";
  thermalDesignPower: number; // Maximum thermal load in Watts
  ramFormat: "DDR4" | "DDR5";
  maxDdrLanes: number;
  pcieGen: number;
}

export interface CompatibilityRule {
  ruleId: string;
  sourceType: string;
  targetType: string;
  relationType: "compatible" | "blocks" | "requires" | "recommended";
  formulaExpression?: string; // Algebraic validation expressions for power budgets
  errorMessage: string;
}

export interface TaxonomyNode {
  id: string; // Material tag
  label: string; // Human identification tag
  type:
    | "vendor"
    | "solution_type"
    | "product_family"
    | "generation"
    | "chassis"
    | "category"
    | "subcategory"
    | "sku";
  vendor: string;
  constraints?: PhysicalConstraint;
}

export interface TaxonomyEdge {
  id: string;
  source: string; // Tail item ID
  target: string; // Head item ID
  type: "maps_to" | "fits_within" | "powers" | "cools";
  validated: boolean;
}

/**
 * ============================================================================
 * EXPORTS FOR HIGH-VOLUME RECONCILIATION & OUTBOUND WEBHOOK DELIVERY
 * ============================================================================
 */

export interface LineReconciliationDiff {
  itemId: string;
  field: "price" | "partNumber" | "leadTime" | "description";
  originalValue: string | number;
  proposedValue: string | number;
  severity: "high" | "medium" | "low";
  resolved: boolean;
}

export interface ReconciliationSession {
  sessionId: string;
  ucidRef: string;
  committedAt?: string;
  committedBy?: string;
  status: "draft" | "locked" | "reviewing";
  discrepancyCount: number;
  diffs: LineReconciliationDiff[];
}

export interface OutboundWebhookConfig {
  endpointUrl: string;
  secretToken: string;
  retryPolicy: {
    exponentialBackoff: boolean;
    maxAttempts: number;
  };
  enabledEvents: (
    | "bom.synchronized"
    | "reconciliation.committed"
    | "forensic.flagged"
  )[];
}

export interface WebhookDeliveryLog {
  deliveryId: string;
  endpointUrl: string;
  timestamp: string;
  responseStatusCode: number;
  payloadSize: number;
  payloadBody: string;
  retryCount: number;
  success: boolean;
}

export interface SearchQueryDescriptor {
  queryString: string;
  filters: {
    vendors: string[];
    types: string[];
    priceMin?: number;
    priceMax?: number;
    complianceScoreMin?: number;
    status: ("active" | "eol" | "restricted")[];
  };
  pagination: {
    page: number;
    limit: number;
  };
  weights: {
    textMatch: number;
    priceUrgency: number;
    leadTimeFavorability: number;
  };
}

/**
 * Standardized generic wrapper for paginated API responses.
 * Enforces strict boundaries when shifting from mock arrays to external robust database queries.
 */
export interface PaginatedResponse<T> {
  data: T[];
  metadata: {
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

/**
 * ============================================================================
 * HYBRID PORTFOLIO ORCHESTRATION CONTRACTS
 * ============================================================================
 */

export interface PortfolioUcidRef {
  id: string;
  channel: "manual" | "automated";
  vendor: string;
}

export interface PortfolioOrchestrateRequest {
  portfolioId: string;
  ucids: PortfolioUcidRef[];
}

export interface PortfolioOrchestrateResponse {
  success: boolean;
  transactionId: string;
  status: "orchestrating" | "failed";
  timestamp: string;
}

export interface PortfolioManualUploadRequest {
  portfolioId: string;
  ucidRef: string;
  filename: string;
  configsMatchedCount: number;
  configs?: Array<{
    configId: string;
    status: "synced" | "pending";
    priceUSD: number;
  }>;
}

export interface PortfolioManualUploadResponse {
  success: boolean;
  reconciliationStatus: "partial" | "complete";
  reconciledPriceUSD: number;
  missingSlots: string[];
  integrityScore: number;
  message: string;
}

/**
 * ============================================================================
 * PHASE 4: STANDARD API PAYLOAD DESCRIPTORS FOR FUTURE EXPRESS BACKEND
 * ============================================================================
 */

export interface IngestBOMRequest {
  fileName: string;
  rawContent: string;
  source: "manual" | "api" | "email";
}

export interface IngestBOMResponse {
  success: boolean;
  ucid: UCID;
  matchMetrics: {
    totalItems: number;
    matchedItems: number;
    confidenceScore: number;
  };
}

export interface GetUCIDDetailRequest {
  ucidId: string;
  includeEvents?: boolean;
  includeSnapshots?: boolean;
}

export interface GetUCIDDetailResponse {
  ucid: UCID;
}

export interface CreateSnapshotRequest {
  ucidId: string;
  winnerVendor: string;
  signerName: string;
}

export interface CreateSnapshotResponse {
  success: boolean;
  snapshot: Snapshot;
  ucid: UCID;
}

export interface UpdateUCIDStepRequest {
  ucidId: string;
  nextStep: UCID["currentStep"];
}

export interface UpdateUCIDStepResponse {
  success: boolean;
  ucid: UCID;
}

export interface SourcingRule {
  id: string;
  ruleType: "substitution" | "price_cap" | "symmetry" | "api_gateway";
  partNumber: string;
  mappedOutput: string;
  label: string;
  vendor: string;
  status: "active" | "draft";
}

export interface IngestRequest {
  fileName: string;
  presetType: "hpe-legacy" | "dell-overcharge" | "cisco-asymmetry";
  rawText?: string;
}

export interface IngestResponse {
  success: boolean;
  message: string;
  sourceFile: string;
  ucid: string;
  timestamp: string;
  parsedSummary: {
    vendorBrand: string;
    detectedChassis: string;
    itemsCount: number;
    initialConfidenceScore: number;
  };
  solutions: any[]; // List of structured parallel alternative designs generated
}

export interface ReconciliationRequest {
  solutions: Array<{
    id: string;
    vendor: string;
    items: Array<{
      partNumber: string;
      quantity: number;
      unitPrice: number;
      type: string;
    }>;
  }>;
}

export interface ReconciliationResponse {
  comparisonHash: string;
  calculatedAt: string;
  metrics: {
    cheapestSolutionId: string;
    highestComplianceId: string;
    totalSavingsUSD: number;
    optimumHybridAlternative: {
      totalCost: number;
      chassisVendor: string;
      componentsCount: number;
    };
  };
  matrix: Array<{
    solutionId: string;
    vendor: string;
    baseCost: number;
    negotiatedContractCost: number;
    variancePercentage: number;
    leadTimeBottleneckDays: number;
    deliveryConfidenceRating: number; // 0-100%
  }>;
}

export interface ConstraintCheckRequest {
  chassisSKU: string;
  cpuSKU: string;
  ramQuantity: number;
  psuWattsCount: number;
}

export interface ConstraintCheckResponse {
  isCompliant: boolean;
  socketMatch: {
    status: "compatible" | "asymmetric" | "blocked";
    chassisSocket: string;
    cpuSocket: string;
    description: string;
  };
  powerLimitTest: {
    passed: boolean;
    estimatedTdpWatts: number;
    maxSupportedWatts: number;
    marginWatts: number;
  };
  memoryBalanceCheck: {
    passed: boolean;
    quantity: number;
    optimalLayoutSymmetry: number; // e.g. multiples of 8 for Xeon 4th-Gen
    recommendsCorrection: boolean;
    message: string;
  };
}

export interface WebhookDispatchRequest {
  endpointUrl: string;
  secretToken: string;
  ucidRef: string;
  payloadData: {
    snapshotHash: string;
    committedValue: number;
    winnerSolution: string;
    timestamp: string;
  };
}

export interface WebhookDispatchResponse {
  dispatchId: string;
  status: "delivered" | "retrying" | "endpoint_unreachable";
  cryptographicSignature: string; // HMAC-SHA256 of the payload body using client secretToken
  auditLog: Array<{
    attemptNumber: number;
    timestamp: string;
    httpStatusCode: number;
    responseBody: string;
  }>;
}

export interface PlaywrightRunRequest {
  agentName: "AribaScraper" | "HPEMarketplace" | "DellPremierPortal";
  ucidRef: string;
  targetPortalUrl: string;
  bypassCaptchas: boolean;
}

export interface PlaywrightRunResponse {
  taskId: string;
  status: "idle" | "running" | "success" | "failed";
  executionTimeMs: number;
  crawledItemsExtracted: number;
  logTrail: Array<{
    timestamp: string;
    level: "info" | "debug" | "warning" | "error";
    message: string;
  }>;
}

export type AppView =
  | "dashboard"
  | "ingestion-hub"
  | "mission-control"
  | "catalog"
  | "vendor-portal"
  | "forensic"
  | "solution-builder"
  | "reconciliation"
  | "search"
  | "taxonomy-graph";

export type UCIDStep =
  | "boq-intake"
  | "pre-intelligence"
  | "solution-design"
  | "vendor-provisioning"
  | "post-intelligence"
  | "comparison"
  | "snapshot";

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

export interface UcidContainer {
  id: string; // e.g. UCID-2026-1699
  name: string;
  reasoning: string;
  locked: boolean;
  syncStatus?: "Pending" | "Synced" | "Out-of-Sync";
}

export interface TaxonomyGraphNode {
  id: string;
  type: "product" | "subproduct" | "category" | "subcategory" | "sku";
  label: string;
  sublabel?: string;
  constraints?: string[];
  dependencies?: string[];
  x?: number;
  y?: number;
}

export interface TaxonomyGraphEdge {
  id: string;
  from: string;
  to: string;
  type: "contains" | "requires" | "exclusive";
}

export interface TaxonomyGraphPayload {
  nodes: TaxonomyGraphNode[];
  edges: TaxonomyGraphEdge[];
  unmappedIds: string[];
}

export type GraphMetadata = z.infer<typeof GraphMetadataSchema>;

export type GraphNode = z.infer<typeof GraphNodeSchema>;

export type GraphEdge = z.infer<typeof GraphEdgeSchema>;

export type GraphAPIResponse = z.infer<typeof GraphAPISchema>;

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
}

export interface ToastContextType {
  toast: (message: string, type?: "success" | "warn" | "error") => void;
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
    result?: Record<string, any>;
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






























