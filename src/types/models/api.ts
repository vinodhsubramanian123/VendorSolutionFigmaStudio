import { UCID, Snapshot } from './core';

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
  // Learning loop metadata (optional for backwards compat with existing rules)
  learnedAt?: string;        // ISO timestamp when this rule was auto-generated
  sourceIssueId?: string;    // ForensicIssue ID that triggered this learning
  isAutoLearned?: boolean;   // true = auto-heal generated, false = manual override
  preventedMismatchCount?: number; // telemetry: how many times this rule intercepted a mismatch
  associatedSkus?: string;   // SKU combinations or companion accessories
  cliScript?: string;        // CLI script / command snippet for auto-reconciliation
  notes?: string;            // Human notes / custom rationale
}

/**
 * Represents a single intelligence learning event — emitted whenever Auto-Heal
 * fires, creating a transparent audit trail of what the system has learned.
 */
export interface LearningEvent {
  id: string;                // Unique event UUID
  timestamp: string;         // ISO-8601 when the learning was captured
  sourceIssueId: string;     // The ForensicIssue that triggered the learning
  ruleType: "substitution" | "price_cap" | "symmetry" | "api_gateway";
  partNumber: string;        // The SKU or parameter that was learned about
  action: string;            // Human-readable description of what was learned
  confidenceScore: number;   // 0–100 confidence in this learned knowledge
  vendor: string;            // Associated vendor brand
  preventedMismatchCount: number; // Running counter of prevented mismatches
}

/**
 * Represents a SKU-level error surfaced by a partner portal Playwright run.
 * Used by the CLIC error resolution panel in the Vendor Portal.
 */
export interface PortalErrorItem {
  id: string;
  skuRef: string;            // The SKU that caused the error
  errorType: "unbuildable" | "discontinued" | "not_found" | "constraint_violation";
  errorMessage: string;      // Raw error message from the portal log
  vendor: string;
  suggestedAlternatePartNumber?: string; // Catalog lookup result
  suggestedAlternateName?: string;
  resolved: boolean;
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
  ucid: UCID;
  timestamp: string;
  parsedSummary: {
    vendorBrand: string;
    detectedChassis: string;
    itemsCount: number;
    initialConfidenceScore: number;
  };
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
  discrepancyCount?: number; // Number of cost discrepancies found during reconciliation
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
  | "solutions"
  | "solution-builder"
  | "reconciliation"
  | "search"
  | "taxonomy-graph"
  | "cleansing"
  | "telemetry";

export type UCIDStep =
  | "boq-intake"
  | "pre-intelligence"
  | "solution-design"
  | "vendor-provisioning"
  | "post-intelligence"
  | "comparison"
  | "snapshot";

