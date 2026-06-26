import { z } from "zod";
import { BOMItemSchema } from "./schemaCatalog";
import { UCIDSchema, SolutionSchema} from "./schemaUCID";
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
export const PlaywrightAgentConfigSchema = z.object({
  targetUrl: z.string().url(),
  headless: z.boolean(),
  viewportWidth: z.number().int().positive(),
  viewportHeight: z.number().int().positive(),
  timeoutMs: z.number().int().positive(),
  maxRetries: z.number().int().nonnegative(),
  proxyRotation: z.boolean(),
});
export const PlaywrightExecutionLogSchema = z.object({
  timestamp: z.string(),
  level: z.enum(["info", "debug", "screenshot", "error"]),
  message: z.string(),
  screenshotUrl: z.string().optional(),
});
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