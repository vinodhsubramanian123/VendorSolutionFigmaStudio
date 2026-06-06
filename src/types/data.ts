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
  id: string;             // Globally Unique UUID / Primary Key
  partNumber: string;     // Canonical Manufacturer SKU (e.g. "INTEL-8480X-SP")
  name: string;           // Clear English representation description
  type: string;           // Asset class: "Processor" | "Memory" | "Chassis" | "Storage" | "Networking" | "Power"
  quantity: number;       // Sourced quantity
  unitPrice: number;      // Sourced Unit Price (denominated in USD)
}

/**
 * Represents a complete vendor alternative proposal compiled from a customer BOQ.
 * Maps 1-to-many BOMItem records and calculates aggregated compliance, margin, and discount thresholds.
 */
export interface Solution {
  id: string;             // Local Proposal UUID
  vendor: string;         // Vendor Brand identifier: "HPE" | "Dell" | "Lenovo" | "Supermicro" | "Cisco"
  label: string;          // Human description label (e.g., "Symmetric High-Core Hybrid Proposal")
  totalPrice: number;     // Sum of all qualified items under contract price limits
  originalPrice: number;   // Pre-discount list price
  savings: number;        // Direct discount percentage (0.0 - 1.0) or dollar value delta
  items: BOMItem[];       // Array of items included in this proposal
  complianceScore: number;// Score (0-100) representing compliance with taxonomic physical constraints
}

/**
 * Event-log entry detailing background intelligence operations on active configuration lines.
 * Written directly to the job telemetry channel.
 */
export interface LogEvent {
  ts: string;             // ISO-8601 UTC Timestamp
  level: 'info' | 'warn' | 'ok' | 'err'; // Telemetry tracking severity levels
  msg: string;            // Informational narrative string
}

/**
 * Locked snapshot committed to the durable ledger for procurement execution.
 * Represents contract agreement signature.
 */
export interface Snapshot {
  id: string;             // Snapshot Unique Hash / Primary Key
  label: string;          // User-assigned milestone identifier
  committedAt: string;    // Signature date timestamp
  winnerSolution: string; // The selected solution architecture (ID or Name)
  totalValue: number;     // Absolute order layout cost (USD)
  notes: string;          // Administrative notes or auditing justifications
}

/**
 * Master representation of a Unique Configuration Identifier (UCID).
 * Ingests raw inputs, monitors sequence workflows, processes alternate proposals,
 * and tracks execution telemetry.
 */
export interface UCID {
  id: string;             // Master UCID Job Hash
  displayId: string;      // Human indexing reference (e.g., "UCID-2026-092")
  name: string;           // Customer-facing Solution layout name
  solutionName?: string;  // Explicit configuration group assignment
  priority: 'critical' | 'high' | 'medium' | 'low'; // Ingestion priority tier
  projectRef: string;     // Internal SAP/Salesforce active Opportunity identification
  createdAt: string;      // Creation Timestamp
  currentStep: 'boq-intake' | 'pre-intelligence' | 'solution-design' | 'vendor-provisioning' | 'post-intelligence' | 'comparison' | 'snapshot';
  completedSteps: ('boq-intake' | 'pre-intelligence' | 'solution-design' | 'vendor-provisioning' | 'post-intelligence' | 'comparison' | 'snapshot')[];
  rawBOM: string;         // Raw unstructured text or parsed JSON data from the uploader
  solutions: Solution[];  // Collection of automatically generated vendor design alternatives
  events: LogEvent[];     // Forensic execution log trail
  snapshots: Snapshot[];  // Committed contract history
  syncStatus?: 'Pending' | 'Synced' | 'Out-of-Sync'; // Badges requested for Live Mission & Solution Builder consistency tracking
}

/**
 * Manufacturer / Supplier direct web endpoint configuration.
 * Keeps status metadata for active continuous integration checks.
 */
export interface Vendor {
  id: string;             // Vendor database key
  name: string;           // Full corporate name (e.g., "Hewlett Packard Enterprise")
  shortName: string;      // Brand code (e.g. "HPE", "Dell")
  status: 'connected' | 'disconnected' | 'syncing'; // API channel state
  color: string;          // Branding color accent
  catalogItems: number;   // Total indexed catalog items in local cache
  apiHealth: number;      // API availability threshold (percentage rating 0-100)
  apiEndpoint: string;    // Direct OAuth URL to supplier inventory system
  syncInterval: string;   // Recurrence cron schedule/expression config
  lastSync: string;       // Latest ingestion timestamp
}

/**
 * Consolidated Central Inventory Stock Keeping Unit (SKU) record.
 * Leveraged by search indexes to match dirty descriptions and fulfill dynamic quotes.
 */
export interface CatalogSKU {
  id: string;             // Internal Inventory SKU Primary Key
  vendor: string;         // Sourcing Brand Ref
  partNumber: string;     // True physical part identifier (e.g. "HPE-DL380-CHASS")
  name: string;           // Formal description title
  type: string;           // Component type classification
  price: number;          // Sourced base list price (USD)
  leadTimeDays: number;   // Supplier estimated fulfillment duration
  status: 'active' | 'eol' | 'restricted'; // Lifecycle states
}

/**
 * Flagged forensic audit issue parsed from quotations or design configurations.
 * Formulates the payload for the Sourcing Integrity Sandbox reports.
 */
export interface ForensicIssue {
  id: string;             // Forensic exception locator ID
  title: string;          // Exception summary
  description: string;    // Deep technical description of discrepancy or overage
  vendor: string;         // Brand involved
  severity: 'critical' | 'warning' | 'info'; // Danger level
  status: 'open' | 'fixing' | 'resolved';    // Correction status
  affectedItems: number;  // Number of line items affected by this rule
  suggestedAction: string;// Automated repair trigger description
}

/**
 * ============================================================================
 * BROWSER AUTOMATION WORKERS - PLAYWRIGHT AGENT CONTRACTS
 * ============================================================================
 * Operational parameters for headless browser crawlers executing on target
 * distributor portals to scrap real-time supply indexes.
 */

export interface PlaywrightAgentConfig {
  targetUrl: string;       // Login or inventory portal address
  headless: boolean;       // Display browser engine or run headless
  viewportWidth: number;
  viewportHeight: number;
  timeoutMs: number;       // Execution halt deadline
  maxRetries: number;      // Fail-over reloads
  proxyRotation: boolean;  // Toggle dynamic routing to prevent CAPTCHAs
}

export type PlaywrightAgentStatus = 'idle' | 'running' | 'success' | 'failed' | 'rate-limited';

export interface PlaywrightExecutionLog {
  timestamp: string;
  level: 'info' | 'debug' | 'screenshot' | 'error';
  message: string;
  screenshotUrl?: string;  // Cloud storage file handle for optical debugging
}

export interface PlaywrightAgentTask {
  taskId: string;
  agentName: 'AribaScraper' | 'HPEMarketplace' | 'DellPremierPortal';
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
  socketType: 'LGA4677' | 'LGA1700' | 'AM5' | 'BGA';
  thermalDesignPower: number; // Maximum thermal load in Watts
  ramFormat: 'DDR4' | 'DDR5';
  maxDdrLanes: number;
  pcieGen: number;
}

export interface CompatibilityRule {
  ruleId: string;
  sourceType: string;
  targetType: string;
  relationType: 'compatible' | 'blocks' | 'requires' | 'recommended';
  formulaExpression?: string; // Algebraic validation expressions for power budgets
  errorMessage: string;
}

export interface TaxonomyNode {
  id: string;             // Material tag
  label: string;          // Human identification tag
  type: 'chassis' | 'processor' | 'memory' | 'storage' | 'network' | 'power_supply';
  vendor: string;
  constraints: PhysicalConstraint;
}

export interface TaxonomyEdge {
  id: string;
  source: string;         // Tail item ID
  target: string;         // Head item ID
  type: 'maps_to' | 'fits_within' | 'powers' | 'cools';
  validated: boolean;
}

/**
 * ============================================================================
 * EXPORTS FOR HIGH-VOLUME RECONCILIATION & OUTBOUND WEBHOOK DELIVERY
 * ============================================================================
 */

export interface LineReconciliationDiff {
  itemId: string;
  field: 'price' | 'partNumber' | 'leadTime' | 'description';
  originalValue: string | number;
  proposedValue: string | number;
  severity: 'high' | 'medium' | 'low';
  resolved: boolean;
}

export interface ReconciliationSession {
  sessionId: string;
  ucidRef: string;
  committedAt?: string;
  committedBy?: string;
  status: 'draft' | 'locked' | 'reviewing';
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
  enabledEvents: ('bom.synchronized' | 'reconciliation.committed' | 'forensic.flagged')[];
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
    status: ('active' | 'eol' | 'restricted')[];
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
