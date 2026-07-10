import { z } from "zod";

export const ResolutionSuggestionSchema = z.object({
  catalogSkuId: z.string(),
  partNumber: z.string(),
  name: z.string(),
  matchScore: z.number().min(0).max(100),
  matchType: z.enum(["lexical", "semantic", "cosine", "pattern"]),
});

export const CleansingEntrySchema = z.object({
  id: z.string(),
  rawValue: z.string(),
  detectedPartNumber: z.string().optional(),
  normalizedName: z.string().optional(),
  matchStatus: z.enum(["matched", "fuzzy", "semantic_match", "unmatched", "quarantined", "mapped"]),
  confidence: z.number().min(0).max(100),
  matchedSkuId: z.string().optional(),
  matchedPartNumber: z.string().optional(),
  mappedOutput: z.string().optional(),
  vendor: z.string().optional(),
  flagReason: z.string().optional(),
  reviewedAt: z.string().optional(),
  suggestedResolutions: z.array(ResolutionSuggestionSchema).optional(),
  sourceEvidenceUrl: z.string().url().optional(),
});

// ─── UI Audit Ledger Event Schema ────────────────────────────────────────────
// Matches the CleansingAuditEntry interface in src/types/models/cleansing.ts.
// Used for validating POST /api/cleansing/events payloads.
export const CleansingAuditEntrySchema = z.object({
  id: z.string().uuid(),
  type: z.enum(["manual_map", "auto_map", "quarantine", "split"]),
  description: z.string().min(1),
  timestamp: z.string().datetime(),
});
