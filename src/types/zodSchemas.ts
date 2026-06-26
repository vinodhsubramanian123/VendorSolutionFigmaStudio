/**
 * ============================================================================
 * ENTERPRISE PROCUREMENT INTEGRITY PLATFORM - ZOD SCHEMAS & RUNTIME VALIDATORS
 * ============================================================================
 * Declares strict runtime validation schemas that mirror the data contracts in types/data.ts.
 * This guarantees inbound payloads, mock data matrices, and partner API integrations 
 * conform perfectly to operational parameters, avoiding loose strings or signature drift.
 */

export * from "./schemas/schemaCatalog";
export * from "./schemas/schemaUCID";
export * from "./schemas/schemaAudit";
export * from "./schemas/schemaCleansing";
export * from "./schemas/schemaDTO";
export * from "./schemas/schemaGraph";

import {
  BOMItemSchema,
  CatalogSKUSchema,
  VendorSchema,
} from "./schemas/schemaCatalog";

import {
  ConfigSchema,
  VendorSubmissionSchema,
  SolutionSchema,
  SnapshotSchema,
  UCIDSchema,
} from "./schemas/schemaUCID";

import {
  LogEventSchema,
  ForensicIssueSchema,
  LineReconciliationDiffSchema,
  ReconciliationSessionSchema,
  SourcingRuleSchema,
  LearningEventSchema,
  PortalErrorItemSchema,
} from "./schemas/schemaAudit";

import {
  CleansingEntrySchema,
} from "./schemas/schemaCleansing";

// Helper validation assertions for enterprise safety
export const validators = {
  validateBOMItem: (data: unknown) => BOMItemSchema.parse(data),
  validateConfig: (data: unknown) => ConfigSchema.parse(data),
  validateVendorSubmission: (data: unknown) => VendorSubmissionSchema.parse(data),
  validateSolution: (data: unknown) => SolutionSchema.parse(data),
  validateLogEvent: (data: unknown) => LogEventSchema.parse(data),
  validateSnapshot: (data: unknown) => SnapshotSchema.parse(data),
  validateUCID: (data: unknown) => UCIDSchema.parse(data),
  validateVendor: (data: unknown) => VendorSchema.parse(data),
  validateCatalogSKU: (data: unknown) => CatalogSKUSchema.parse(data),
  validateForensicIssue: (data: unknown) => ForensicIssueSchema.parse(data),
  validateLineReconciliationDiff: (data: unknown) => LineReconciliationDiffSchema.parse(data),
  validateReconciliationSession: (data: unknown) => ReconciliationSessionSchema.parse(data),
  validateSourcingRule: (data: unknown) => SourcingRuleSchema.parse(data),
  validateLearningEvent: (data: unknown) => LearningEventSchema.parse(data),
  validatePortalErrorItem: (data: unknown) => PortalErrorItemSchema.parse(data),
  validateCleansingEntry: (data: unknown) => CleansingEntrySchema.parse(data),
};
