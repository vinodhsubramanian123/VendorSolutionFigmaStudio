import { z } from "zod";

export const LogEventSchema = z.object({
  timestamp: z.string(), // ISO-8601 UTC string format
  level: z.enum(["info", "warn", "ok", "err"]),
  msg: z.string(),
});

export const ForensicIssueSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  vendor: z.string(),
  severity: z.enum(["critical", "warning", "info"]),
  status: z.enum(["open", "fixing", "resolved"]),
  affectedItems: z.number().int().nonnegative(),
  suggestedAction: z.string(),
  autoRepairDiff: z.object({
    before: z.string(),
    after: z.string(),
    reason: z.string(),
  }).optional(),
});

export const LineReconciliationDiffSchema = z.object({
  itemId: z.string(),
  field: z.enum(["price", "partNumber", "leadTime", "description"]),
  originalValue: z.union([z.string(), z.number()]),
  proposedValue: z.union([z.string(), z.number()]),
  severity: z.enum(["high", "medium", "low"]),
  resolved: z.boolean(),
});

export const ReconciliationSessionSchema = z.object({
  sessionId: z.string(),
  ucidRef: z.string(),
  committedAt: z.string().optional(),
  committedBy: z.string().optional(),
  status: z.enum(["draft", "locked", "reviewing"]),
  discrepancyCount: z.number().int().nonnegative(),
  diffs: z.array(LineReconciliationDiffSchema),
});

export const SourcingRuleSchema = z.object({
  id: z.string(),
  ruleType: z.enum(["substitution", "price_cap", "symmetry", "api_gateway"]),
  partNumber: z.string().min(1),
  mappedOutput: z.string().min(1),
  label: z.string(),
  vendor: z.string(),
  status: z.enum(["active", "draft"]),
  learnedAt: z.string().optional(),
  sourceIssueId: z.string().optional(),
  isAutoLearned: z.boolean().optional(),
  preventedMismatchCount: z.number().int().nonnegative().optional(),
  associatedSkus: z.string().optional(),
  cliScript: z.string().optional(),
  notes: z.string().optional(),
});

export const LearningEventSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  sourceIssueId: z.string(),
  ruleType: z.enum(["substitution", "price_cap", "symmetry", "api_gateway"]),
  partNumber: z.string(),
  action: z.string(),
  confidenceScore: z.number().min(0).max(100),
  vendor: z.string(),
  preventedMismatchCount: z.number().int().nonnegative(),
});

export const PortalErrorItemSchema = z.object({
  id: z.string(),
  skuRef: z.string(),
  errorType: z.enum(["unbuildable", "discontinued", "not_found", "constraint_violation"]),
  errorMessage: z.string(),
  vendor: z.string(),
  suggestedAlternatePartNumber: z.string().optional(),
  suggestedAlternateName: z.string().optional(),
  resolved: z.boolean(),
});
