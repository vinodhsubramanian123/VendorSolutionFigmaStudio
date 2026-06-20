import { GraphMetadataSchema, GraphNodeSchema, GraphEdgeSchema, GraphPathSchema, GraphAPISchema, CatalogSKUSchema, VendorExtendedFieldsSchema, AdviceResolutionSchema, RuleConflictSchema } from '../zodSchemas';
import { z } from 'zod';
import { UCID, Snapshot, LogEvent, BOMItem, Solution, VendorSubmission, Config } from './core';

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
/**
 * ============================================================================
 * PHASE 4: STANDARD API PAYLOAD DESCRIPTORS FOR FUTURE EXPRESS BACKEND
 * ============================================================================
 */

