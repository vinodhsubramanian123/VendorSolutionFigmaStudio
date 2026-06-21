import { z } from "zod";

/**
 * ============================================================================
 * ENTERPRISE PROCUREMENT INTEGRITY PLATFORM - ZOD SCHEMAS & RUNTIME VALIDATORS
 * ============================================================================
 * Declares strict runtime validation schemas that mirror the data contracts in types/data.ts.
 * This guarantees inbound payloads, mock data matrices, and partner API integrations 
 * conform perfectly to operational parameters, avoiding loose strings or signature drift.
 */

// 1. BOMItem Zod Schema
export const BOMItemSchema = z.object({
  id: z.string().uuid("BOMItem ID must be a valid UUID").or(z.string().regex(/^[a-zA-Z0-9_-]+$/)),
  partNumber: z.string().min(1, "Manufacturer SKU part number cannot be empty"),
  name: z.string().min(1, "Standard English representation name cannot be empty"),
  type: z.enum(["Chassis", "Processor", "Memory", "Drive", "Network Adapter", "Power Supply", "Riser Card", "Controller", "Network", "Power", "Cooling", "Storage", "Unknown"]),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  unitPrice: z.number().nonnegative("Unit price must be non-negative (denominated in USD)"),
});

export const ConfigSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Configuration layout name cannot be empty"),
  totalPrice: z.number().nonnegative("Total price must be non-negative"),
  originalPrice: z.number().nonnegative("Original price must be non-negative"),
  savings: z.number().optional(),
  vendor: z.string().optional(),
  items: z.array(BOMItemSchema),
});

// 3. VendorSubmission Zod Schema
export const VendorSubmissionSchema = z.object({
  id: z.string(),
  vendor: z.string().min(1, "Vendor name reference cannot be empty"),
  label: z.string(),
  totalPrice: z.number().nonnegative(),
  originalPrice: z.number().nonnegative(),
  savings: z.number(),
  complianceScore: z.number().min(0).max(100),
  configs: z.array(ConfigSchema),
});

// 4. Solution Zod Schema
export const SolutionSchema = z.object({
  id: z.string(),
  name: z.string(),
  targetUcidId: z.string(),
  vendorSubmissions: z.array(VendorSubmissionSchema),
});

// 5. LogEvent Zod Schema
export const LogEventSchema = z.object({
  timestamp: z.string(), // ISO-8601 UTC string format
  level: z.enum(["info", "warn", "ok", "err"]),
  msg: z.string(),
});

// 6. Snapshot Zod Schema
export const SnapshotSchema = z.object({
  id: z.string(),
  label: z.string(),
  committedAt: z.string(),
  winnerSolution: z.string(),
  totalValue: z.number().nonnegative(),
  notes: z.string(),
  payload: z.array(SolutionSchema).optional(),
  version: z.number().int().nonnegative(),
  timestamp: z.string(),
  locked: z.boolean(),
  bomSnapshot: z.array(ConfigSchema).optional(),
});

// 7. UCID Zod Schema
export const UCIDSchema = z.object({
  id: z.string(),
  displayId: z.string().regex(/^UCID-\d{4}-\d+$/),
  name: z.string(),
  solutionName: z.string().optional(),
  priority: z.enum(["critical", "high", "medium", "low"]),
  projectRef: z.string(),
  createdAt: z.string(),
  currentStep: z.enum([
    "boq-intake",
    "pre-intelligence",
    "solution-design",
    "vendor-provisioning",
    "post-intelligence",
    "comparison",
    "snapshot"
  ]),
  completedSteps: z.array(z.enum([
    "boq-intake",
    "pre-intelligence",
    "solution-design",
    "vendor-provisioning",
    "post-intelligence",
    "comparison",
    "snapshot"
  ])),
  rawBOM: z.string(),
  solutions: z.array(SolutionSchema),
  events: z.array(LogEventSchema),
  snapshots: z.array(SnapshotSchema),
  syncStatus: z.enum(["Pending", "Synced", "Out-of-Sync", "Error"]).optional(),
  trackingRef: z.string().optional(),
});

// 8. Vendor Zod Schema
export const VendorSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string(),
  status: z.enum(["connected", "disconnected", "syncing", "error"]),
  color: z.string(),
  catalogItems: z.number().int().nonnegative(),
  apiHealth: z.number().min(0).max(100),
  apiEndpoint: z.string().url("Must be a valid manufacturer endpoint OAuth resource URL"),
  syncInterval: z.string(),
  lastSync: z.string(),
});

// 9. CatalogSKU Zod Schema
export const CatalogSKUSchema = z.object({
  id: z.string(),
  ucidRef: z.string().optional(),
  vendor: z.string(),
  vendorPortalId: z.string().optional(),
  partNumber: z.string(),
  name: z.string(),
  type: z.string(),
  catalogTier: z.string().optional(),
  price: z.number().nonnegative(),
  currency: z.enum(['USD', 'AED', 'INR']).optional(),
  leadTimeDays: z.number().int().nonnegative(),
  status: z.enum([
    'active',
    'eol',
    'restricted',
    'discontinued',
    'pending_review',
    'approved',
    'flagged'
  ]),
  complianceFlags: z.object({
    taaCompliant: z.boolean().optional(),
    clicWarning: z.boolean().optional(),
    regionRestricted: z.boolean().optional(),
  }).optional(),
  solution: z.string().optional(),
  productFamily: z.string().optional(),
  generation: z.string().optional(),
  chassisRef: z.string().optional(),
  bomLineRef: z.string().optional(),
  evidenceLinks: z.array(z.string().url().or(z.string())).optional(),
  scrapedAt: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export const VendorExtendedFieldsSchema = z.record(z.string(), z.unknown());

// 10. ForensicIssue Zod Schema
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

// 11. LineReconciliationDiff Zod Schema
export const LineReconciliationDiffSchema = z.object({
  itemId: z.string(),
  field: z.enum(["price", "partNumber", "leadTime", "description"]),
  originalValue: z.union([z.string(), z.number()]),
  proposedValue: z.union([z.string(), z.number()]),
  severity: z.enum(["high", "medium", "low"]),
  resolved: z.boolean(),
});

// 12. ReconciliationSession Zod Schema
export const ReconciliationSessionSchema = z.object({
  sessionId: z.string(),
  ucidRef: z.string(),
  committedAt: z.string().optional(),
  committedBy: z.string().optional(),
  status: z.enum(["draft", "locked", "reviewing"]),
  discrepancyCount: z.number().int().nonnegative(),
  diffs: z.array(LineReconciliationDiffSchema),
});

// 13. SourcingRule Zod Schema
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
});

// 14. LearningEvent Zod Schema
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

// 15. PortalErrorItem Zod Schema
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

// 16. PlaywrightAgentConfig Zod Schema
export const PlaywrightAgentConfigSchema = z.object({
  targetUrl: z.string().url(),
  headless: z.boolean(),
  viewportWidth: z.number().int().positive(),
  viewportHeight: z.number().int().positive(),
  timeoutMs: z.number().int().positive(),
  maxRetries: z.number().int().nonnegative(),
  proxyRotation: z.boolean(),
});

// 17. PlaywrightExecutionLog Zod Schema
export const PlaywrightExecutionLogSchema = z.object({
  timestamp: z.string(),
  level: z.enum(["info", "debug", "screenshot", "error"]),
  message: z.string(),
  screenshotUrl: z.string().optional(),
});

// 18. PlaywrightAgentTask Zod Schema
export const PlaywrightAgentTaskSchema = z.object({
  taskId: z.string(),
  agentName: z.enum(["AribaScraper", "HPEMarketplace", "DellPremierPortal"]),
  ucidRef: z.string(),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  status: z.enum(["idle", "running", "success", "failed", "rate-limited"]),
  config: PlaywrightAgentConfigSchema,
  logs: z.array(PlaywrightExecutionLogSchema),
  metrics: z.object({
    pagesNavigated: z.number().int().nonnegative(),
    selectorsResolved: z.number().int().nonnegative(),
    bandwidthBytes: z.number().nonnegative(),
    durationMs: z.number().nonnegative(),
  }),
  extractedItemsCount: z.number().int().nonnegative(),
});

// 19. CleansingEntry Zod Schema (For Pre-Commit Ingestion Review)
export const ResolutionSuggestionSchema = z.object({
  catalogSkuId: z.string(),
  partNumber: z.string(),
  name: z.string(),
  matchScore: z.number().min(0).max(100), // e.g., Cosine similarity score (normalized to 100)
  matchType: z.enum(["lexical", "semantic", "cosine", "pattern"]),
});

export const CleansingEntrySchema = z.object({
  id: z.string(),
  rawValue: z.string(), // e.g., "HPE 3Y Tech Care Basic# Service"
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
  sourceEvidenceUrl: z.string().url().optional(), // Bounding box image reference
});


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

// ============================================================================
// DTO INTEGRATION SCHEMAS (APPENDIX A - PRD OBJECT MAPS)
// ============================================================================

// 1. Workbook Ingest DTO
export const IngestRequestSchema = z.object({
  fileName: z.string().min(1, "File name cannot be empty"),
  presetType: z.enum(["hpe-legacy", "dell-overcharge", "cisco-asymmetry"]),
  rawText: z.string().optional(),
});

export const IngestResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  sourceFile: z.string(),
  ucid: UCIDSchema,
  timestamp: z.string(),
  parsedSummary: z.object({
    vendorBrand: z.string(),
    detectedChassis: z.string(),
    itemsCount: z.number().int().nonnegative(),
    initialConfidenceScore: z.number().min(0).max(100),
  }),
});

// 2. Playwright Scraper DTO
export const PlaywrightRunRequestSchema = z.object({
  agentName: z.enum(["AribaScraper", "HPEMarketplace", "DellPremierPortal"]),
  ucidRef: z.string(),
  targetPortalUrl: z.string().url("Must be a valid target portal URL"),
  bypassCaptchas: z.boolean(),
});

export const PlaywrightRunResponseSchema = z.object({
  taskId: z.string(),
  status: z.enum(["idle", "running", "success", "failed"]),
  executionTimeMs: z.number().int().nonnegative(),
  crawledItemsExtracted: z.number().int().nonnegative(),
  logTrail: z.array(
    z.object({
      timestamp: z.string(),
      level: z.enum(["info", "debug", "warning", "error"]),
      message: z.string(),
    })
  ),
});

// 3. Portfolio Orchestration DTOs
export const PortfolioOrchestrateRequestSchema = z.object({
  portfolioId: z.string(),
  ucids: z.array(
    z.object({
      id: z.string(),
      channel: z.enum(["manual", "automated"]),
      vendor: z.string(),
    })
  ),
});

export const PortfolioOrchestrateResponseSchema = z.object({
  success: z.boolean(),
  transactionId: z.string(),
  status: z.enum(["orchestrating", "failed"]),
  timestamp: z.string(),
});

export const PortfolioManualUploadRequestSchema = z.object({
  portfolioId: z.string(),
  ucidRef: z.string(),
  filename: z.string(),
  configsMatchedCount: z.number().int().nonnegative(),
  configs: z.array(
    z.object({
      configId: z.string(),
      status: z.enum(["synced", "pending"]),
      priceUSD: z.number().nonnegative(),
    })
  ).optional(),
});

export const PortfolioManualUploadResponseSchema = z.object({
  success: z.boolean(),
  reconciliationStatus: z.enum(["partial", "complete"]),
  reconciledPriceUSD: z.number().nonnegative(),
  missingSlots: z.array(z.string()),
  integrityScore: z.number().min(0).max(100),
  message: z.string(),
});

// 4. Reconciliation DTO
export const FlatComparisonSolutionSchema = z.object({
  id: z.string(),
  vendor: z.string(),
  label: z.string().optional(),
  totalPrice: z.number().nonnegative().optional(),
  originalPrice: z.number().nonnegative().optional(),
  savings: z.number().optional(),
  complianceScore: z.number().min(0).max(100).optional(),
  items: z.array(BOMItemSchema),
});

export const ReconciliationRequestSchema = z.object({
  solutions: z.array(z.union([FlatComparisonSolutionSchema, SolutionSchema])).optional(),
  submissions: z.array(
    z.object({
      id: z.string(),
      vendor: z.string(),
      configs: z.array(
        z.object({
          items: z.array(
            z.object({
              partNumber: z.string(),
              quantity: z.number().int().positive(),
              unitPrice: z.number().nonnegative(),
              type: z.string(),
            })
          ),
        })
      ),
    })
  ).optional(),
}).refine(data => data.solutions || data.submissions, {
  message: "Either solutions or submissions array is required in the body"
});

export const ReconciliationResponseSchema = z.object({
  comparisonHash: z.string(),
  calculatedAt: z.string(),
  metrics: z.object({
    cheapestSolutionId: z.string(),
    highestComplianceId: z.string(),
    totalSavingsUSD: z.number(),
    optimumHybridAlternative: z.object({
      totalCost: z.number().nonnegative(),
      chassisVendor: z.string(),
      componentsCount: z.number().int().nonnegative(),
    }),
  }),
  matrix: z.array(
    z.object({
      solutionId: z.string(),
      vendor: z.string(),
      baseCost: z.number().nonnegative(),
      negotiatedContractCost: z.number().nonnegative(),
      variancePercentage: z.number(),
      leadTimeBottleneckDays: z.number().int().nonnegative(),
      deliveryConfidenceRating: z.number().min(0).max(100),
    })
  ),
});

// 5. Taxonomy & Compatibility Constraint DTO
export const ConstraintCheckRequestSchema = z.object({
  chassisSKU: z.string().min(1),
  cpuSKU: z.string().min(1),
  ramQuantity: z.number().int().positive(),
  psuWattsCount: z.number().int().positive(),
});

export const ConstraintCheckResponseSchema = z.object({
  isCompliant: z.boolean(),
  socketMatch: z.object({
    status: z.enum(["compatible", "asymmetric", "blocked"]),
    chassisSocket: z.string(),
    cpuSocket: z.string(),
    description: z.string(),
  }),
  powerLimitTest: z.object({
    passed: z.boolean(),
    estimatedTdpWatts: z.number().nonnegative(),
    maxSupportedWatts: z.number().nonnegative(),
    marginWatts: z.number(),
  }),
  memoryBalanceCheck: z.object({
    passed: z.boolean(),
    quantity: z.number().int().nonnegative(),
    optimalLayoutSymmetry: z.number().int().nonnegative(),
    recommendsCorrection: z.boolean(),
    message: z.string(),
  }),
});

// 6. Outbound Webhook dispatch DTO
export const WebhookDispatchRequestSchema = z.object({
  endpointUrl: z.string().url(),
  secretToken: z.string().min(1),
  ucidRef: z.string(),
  payloadData: z.object({
    snapshotHash: z.string(),
    committedValue: z.number().nonnegative(),
    winnerSolution: z.string(),
    timestamp: z.string(),
  }),
});

export const WebhookDispatchResponseSchema = z.object({
  dispatchId: z.string(),
  status: z.enum(["delivered", "retrying", "endpoint_unreachable"]),
  cryptographicSignature: z.string(),
  auditLog: z.array(
    z.object({
      attemptNumber: z.number().int().positive(),
      timestamp: z.string(),
      httpStatusCode: z.number().int(),
      responseBody: z.string(),
    })
  ),
});

// 7. Graph Elements

export const GraphMetadataSchema = z.object({
  id: z.string(),
  lastUpdated: z.string().optional(),
  version: z.string().optional(),
});
export const GraphNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  sublabel: z.string().optional(),
  type: z.enum(["catalog_part", "category_hub", "scraped_orphan", "product", "subproduct", "category", "subcategory", "sku"]),
  status: z.enum(["healthy", "warning", "error"]).optional(),
  constraints: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  data: z.object({
    partNumber: z.string().optional(),
    price: z.number().optional(),
    confidenceScore: z.number().optional(),
    isPathActive: z.boolean().optional()
  }).optional(),
});

export const GraphEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  relationship: z.enum(["requires", "substitutes", "conflicts", "compatible", "depends on", "mutually exclusive", "hierarchy", "contains", "exclusive"]),
  weight: z.number().optional(),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  isAnimated: z.boolean().default(false).optional()
});

export const GraphPathSchema = z.object({
  pathId: z.string(),
  rank: z.number(),
  totalCost: z.number(),
  confidence: z.number(),
  nodesInvolved: z.array(z.string()),
  edgesInvolved: z.array(z.string())
});
export const GraphAPIResponseSchema = z.object({
  metadata: GraphMetadataSchema.optional(),
  nodes: z.array(GraphNodeSchema),
  edges: z.array(GraphEdgeSchema),
  unmappedIds: z.array(z.string()),
});
export const GraphAPISchema = GraphAPIResponseSchema; // Alias for compatibility

// 8. Generic Advice Resolution & Conflicts
export const AdviceResolutionSchema = z.object({
  id: z.string(),
  sheetName: z.string(),
  severity: z.enum(["critical", "warning", "info"]),
  logicOperator: z.enum(["AND", "OR", "NONE"]),
  targetSkus: z.array(z.string()),
  message: z.string(),
  contextRef: z.string().optional(),
});

export const RuleConflictSchema = z.object({
  conflictId: z.string(),
  partNumber: z.string(),
  existingRuleId: z.string(),
  proposedMappedOutput: z.string(),
  existingMappedOutput: z.string(),
  description: z.string(),
});
