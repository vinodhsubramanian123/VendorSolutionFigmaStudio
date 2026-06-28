import { UCID, Snapshot } from './sourcing';
import { z } from 'zod';
import {
  IngestRequestSchema,
  IngestResponseSchema,
  ReconciliationRequestSchema,
  ReconciliationResponseSchema,
  ConstraintCheckRequestSchema,
  ConstraintCheckResponseSchema,
  WebhookDispatchRequestSchema,
  WebhookDispatchResponseSchema,
  PlaywrightRunRequestSchema,
  PlaywrightRunResponseSchema,
  SourcingRuleSchema,
  LearningEventSchema,
  PortalErrorItemSchema
} from '../zodSchemas';

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

// Derive DTO types from schemas to prevent drift
export type SourcingRule = z.infer<typeof SourcingRuleSchema>;
export type LearningEvent = z.infer<typeof LearningEventSchema>;
export type PortalErrorItem = z.infer<typeof PortalErrorItemSchema>;

export type IngestRequest = z.infer<typeof IngestRequestSchema>;
export type IngestResponse = z.infer<typeof IngestResponseSchema>;
export type ReconciliationRequest = z.infer<typeof ReconciliationRequestSchema>;
export type ReconciliationResponse = z.infer<typeof ReconciliationResponseSchema>;
export type ConstraintCheckRequest = z.infer<typeof ConstraintCheckRequestSchema>;
export type ConstraintCheckResponse = z.infer<typeof ConstraintCheckResponseSchema>;
export type WebhookDispatchRequest = z.infer<typeof WebhookDispatchRequestSchema>;
export type WebhookDispatchResponse = z.infer<typeof WebhookDispatchResponseSchema>;
export type PlaywrightRunRequest = z.infer<typeof PlaywrightRunRequestSchema>;
export type PlaywrightRunResponse = z.infer<typeof PlaywrightRunResponseSchema>;

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
