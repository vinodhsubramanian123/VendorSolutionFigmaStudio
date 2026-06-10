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

// 2. Config Zod Schema
export const ConfigSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Configuration layout name cannot be empty"),
  totalPrice: z.number().nonnegative("Total price must be non-negative"),
  originalPrice: z.number().nonnegative("Original price must be non-negative"),
  savings: z.number(),"items": z.array(BOMItemSchema),
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
  ts: z.string(), // ISO-8601 UTC string format
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
  vendor: z.string(),
  partNumber: z.string(),
  name: z.string(),
  type: z.string(),
  price: z.number().nonnegative(),
  leadTimeDays: z.number().int().nonnegative(),
  status: z.enum(["active", "eol", "restricted"]),
  solution: z.string().optional(),
  productFamily: z.string().optional(),
  generation: z.string().optional(),
  chassisRef: z.string().optional(),
});

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
  type: z.enum(["Product", "Sub-product", "Category", "Sub-category", "SKU"] as [string, ...string[]]),
  properties: z.record(z.string(), z.unknown()).optional(),
});
export const GraphEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  relationship: z.enum(["depends on", "mutually exclusive", "hierarchy"] as [string, ...string[]]),
});
export const GraphAPIResponseSchema = z.object({
  metadata: GraphMetadataSchema,
  nodes: z.array(GraphNodeSchema),
  edges: z.array(GraphEdgeSchema),
});
export const GraphAPISchema = GraphAPIResponseSchema; // Alias for compatibility
