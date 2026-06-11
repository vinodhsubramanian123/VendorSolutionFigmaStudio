import {
  IngestRequestSchema,
  IngestResponseSchema,
  PlaywrightRunRequestSchema,
  PlaywrightRunResponseSchema,
  PortfolioOrchestrateRequestSchema,
  PortfolioOrchestrateResponseSchema,
  PortfolioManualUploadRequestSchema,
  PortfolioManualUploadResponseSchema,
  ReconciliationRequestSchema,
  ReconciliationResponseSchema,
  ConstraintCheckRequestSchema,
  ConstraintCheckResponseSchema,
  WebhookDispatchRequestSchema,
  WebhookDispatchResponseSchema,
  GraphAPIResponseSchema,
} from "../types/zodSchemas";

/**
 * ============================================================================
 * VSIP PLATFORM - BACKEND PAYLOAD EXAMPLES & INTEGRATION REFERENCE
 * ============================================================================
 * Strictly validated examples matching the Zod schemas and PRD specifications.
 * Backend engineers can copy-paste these objects or use them as test fixtures
 * to ensure absolute cross-service procurement integrity.
 */

// 1. Workbook Ingestion Samples
export const SAMPLE_INGEST_REQUEST = {
  fileName: "Q2_PROCURMENT_DELL_BOM_FINAL.xlsx",
  presetType: "dell-overcharge",
  rawText: "QTY,SKU,DESCRIPTION,UNIT_PRICE\n1,POWER-EDGE-R760,Dell PowerEdge R760 Server,15900\n16,M-NVME-3.84TB,Dell 3.84TB NVMe SSD SFF,1590",
};

export const SAMPLE_INGEST_RESPONSE = {
  success: true,
  message: "Multi-tab workbook successfully parsed and ingested.",
  sourceFile: "Q2_PROCURMENT_DELL_BOM_FINAL.xlsx",
  timestamp: "2026-06-09T20:00:00Z",
  parsedSummary: {
    vendorBrand: "Dell",
    detectedChassis: "PowerEdge R760",
    itemsCount: 17,
    initialConfidenceScore: 98,
  },
  ucid: {
    id: "u-99",
    displayId: "UCID-2026-1701",
    name: "Dell Datacenter Compute Refactor",
    priority: "high",
    projectRef: "PRJ-904-DELL",
    createdAt: "2026-06-09T19:45:00Z",
    currentStep: "solution-design",
    completedSteps: ["boq-intake", "pre-intelligence"],
    rawBOM: "INGESTED FROM Q2_PROCURMENT_DELL_BOM_FINAL.xlsx",
    solutions: [
      {
        id: "sol-dell-99",
        name: "Dell Optimal Standard Solution",
        targetUcidId: "u-99",
        vendorSubmissions: [
          {
            id: "vsub-dell-001",
            vendor: "Dell",
            label: "Dell Premier Direct",
            totalPrice: 41340,
            originalPrice: 41340,
            savings: 0,
            complianceScore: 100,
            configs: [
              {
                id: "cfg-sub-dell-1",
                name: "Database Node Config A",
                totalPrice: 41340,
                originalPrice: 41340,
                savings: 0,
                items: [
                  {
                    id: "item-p1",
                    partNumber: "POWER-EDGE-R760",
                    name: "Dell PowerEdge R760 Server",
                    type: "Chassis",
                    quantity: 1,
                    unitPrice: 15900,
                  },
                  {
                    id: "item-p2",
                    partNumber: "M-NVME-3.84TB",
                    name: "Dell 3.84TB NVMe SSD SFF",
                    type: "Drive",
                    quantity: 16,
                    unitPrice: 1590,
                  }
                ],
              }
            ],
          }
        ],
      }
    ],
    events: [
      {
        ts: "2026-06-09T19:45:01Z",
        level: "info",
        msg: "Ingestion System triggered for file: Q2_PROCURMENT_DELL_BOM_FINAL.xlsx",
      },
      {
        ts: "2026-06-09T19:45:12Z",
        level: "ok",
        msg: "Excel workbook processed successfully. Found 2 unique SKUs across 17 units.",
      }
    ],
    snapshots: [],
  },
};

// 2. Playwright Scraper Samples
export const SAMPLE_PLAYWRIGHT_RUN_REQUEST = {
  agentName: "DellPremierPortal",
  ucidRef: "u-99",
  targetPortalUrl: "https://premier.dell.com/portal/quote/retrieve",
  bypassCaptchas: true,
};

export const SAMPLE_PLAYWRIGHT_RUN_RESPONSE = {
  taskId: "pwt-task-7718",
  status: "success",
  executionTimeMs: 4850,
  crawledItemsExtracted: 18,
  logTrail: [
    {
      timestamp: "2026-06-09T20:10:00Z",
      level: "info",
      message: "Spinning up headless Chromium instance matching human fingerprints...",
    },
    {
      timestamp: "2026-06-09T20:10:02Z",
      level: "info",
      message: "Navigated to target Dell Premier Portal gateway.",
    },
    {
      timestamp: "2026-06-09T20:10:03Z",
      level: "debug",
      message: "Injected multi-session cookies. Portal validated session: CREATED.",
    },
    {
      timestamp: "2026-06-09T20:10:04Z",
      level: "warning",
      message: "CloudFront JS Challenge encountered. Activating dynamic captcha-bypass engine...",
    },
    {
      timestamp: "2026-06-09T20:10:05Z",
      level: "info",
      message: "Successfully solved JS Challenge. Extracted active contractor pricing grids.",
    }
  ],
};

// 3. Portfolio Orchestration Samples
export const SAMPLE_PORTFOLIO_ORCHESTRATE_REQUEST = {
  portfolioId: "port-2026-hk",
  ucids: [
    { id: "u-99", channel: "automated", vendor: "Dell" },
    { id: "u-100", channel: "manual", vendor: "HPE" }
  ],
};

export const SAMPLE_PORTFOLIO_ORCHESTRATE_RESPONSE = {
  success: true,
  transactionId: "tx-orch-94308-a",
  status: "orchestrating",
  timestamp: "2026-06-09T20:15:00Z",
};

export const SAMPLE_PORTFOLIO_MANUAL_UPLOAD_REQUEST = {
  portfolioId: "port-2026-hk",
  ucidRef: "u-100",
  filename: "HPE_SIGNED_CONSIGNED_CONTRACT.csv",
  configsMatchedCount: 2,
  configs: [
    { configId: "cfg-hpe-manual-1", status: "synced", priceUSD: 18500 },
    { configId: "cfg-hpe-manual-2", status: "pending", priceUSD: 24000 }
  ],
};

export const SAMPLE_PORTFOLIO_MANUAL_UPLOAD_RESPONSE = {
  success: true,
  reconciliationStatus: "partial",
  reconciledPriceUSD: 18500,
  missingSlots: ["cfg-hpe-manual-2"],
  integrityScore: 85,
  message: "Manual consignment uploaded. Auto-aligned config 1. Waiting on HPE manual sign-off for config 2.",
};

// 4. Outbound Reconciliation Comparison Samples
export const SAMPLE_RECONCILIATION_REQUEST = {
  submissions: [
    {
      id: "sub-hpe-01",
      vendor: "HPE",
      configs: [
        {
          items: [
            { partNumber: "CPU-XEON-6430", quantity: 2, unitPrice: 1950, type: "Processor" },
            { partNumber: "MR-32GB-HPE", quantity: 16, unitPrice: 320, type: "Memory" }
          ]
        }
      ]
    },
    {
      id: "sub-dell-01",
      vendor: "Dell",
      configs: [
        {
          items: [
            { partNumber: "CPU-XEON-6430", quantity: 2, unitPrice: 1190, type: "Processor" },
            { partNumber: "MR-32GB-DELL", quantity: 16, unitPrice: 280, type: "Memory" }
          ]
        }
      ]
    }
  ],
};

export const SAMPLE_RECONCILIATION_RESPONSE = {
  comparisonHash: "sha256-f00ba7e8b99c",
  calculatedAt: "2026-06-09T20:25:00Z",
  metrics: {
    cheapestSolutionId: "sub-dell-01",
    highestComplianceId: "sub-dell-01",
    totalSavingsUSD: 2160,
    optimumHybridAlternative: {
      totalCost: 6640,
      chassisVendor: "Dell",
      componentsCount: 18,
    },
  },
  matrix: [
    {
      solutionId: "sub-hpe-01",
      vendor: "HPE",
      baseCost: 9020,
      negotiatedContractCost: 8500,
      variancePercentage: -5.76,
      leadTimeBottleneckDays: 14,
      deliveryConfidenceRating: 92,
    },
    {
      solutionId: "sub-dell-01",
      vendor: "Dell",
      baseCost: 6860,
      negotiatedContractCost: 6640,
      variancePercentage: -3.2,
      leadTimeBottleneckDays: 7,
      deliveryConfidenceRating: 98,
    }
  ],
};

// 5. Taxonomy Constraints Checker Samples
export const SAMPLE_CONSTRAINT_CHECK_REQUEST = {
  chassisSKU: "CHASSIS-GEN11-DL360",
  cpuSKU: "INTEL-XEON-8452Y",
  ramQuantity: 16, // Requires 16-channel symmetrical distribution
  psuWattsCount: 800,
};

export const SAMPLE_CONSTRAINT_CHECK_RESPONSE = {
  isCompliant: true,
  socketMatch: {
    status: "compatible",
    chassisSocket: "FCBGA1700",
    cpuSocket: "FCBGA1700",
    description: "LGA-4677 layout harmonized cleanly across systems chassis motherboard.",
  },
  powerLimitTest: {
    passed: true,
    estimatedTdpWatts: 450,
    maxSupportedWatts: 800,
    marginWatts: 350,
  },
  memoryBalanceCheck: {
    passed: true,
    quantity: 16,
    optimalLayoutSymmetry: 8,
    recommendsCorrection: false,
    message: "Memory layout complies 100% with symmetric socket architecture parameters.",
  },
};

// 6. Outbound Synchronizations Webhooks
export const SAMPLE_WEBHOOK_DISPATCH_REQUEST = {
  endpointUrl: "https://ops-erp.internal.enterprise.com/webhooks/bom",
  secretToken: "hmac_key_prod_v2_99485121",
  ucidRef: "UCID-2026-1701",
  payloadData: {
    snapshotHash: "md5-88fbc8a12e8461b",
    committedValue: 6640,
    winnerSolution: "Dell Optimal Standard Solution",
    timestamp: "2026-06-09T20:30:00Z",
  },
};

export const SAMPLE_WEBHOOK_DISPATCH_RESPONSE = {
  dispatchId: "dis-904-hsc",
  status: "delivered",
  cryptographicSignature: "sha256=d38890db769188e99ffbad34bb1209b55",
  auditLog: [
    {
      attemptNumber: 1,
      timestamp: "2026-06-09T20:30:02Z",
      httpStatusCode: 200,
      responseBody: '{"status":"acknowledged","ledgerId":"ledg-9945"}',
    }
  ],
};

// 7. Taxonomy Graph Layout Response Specs
export const SAMPLE_GRAPH_API_RESPONSE = {
  metadata: {
    id: "catalog-graph-v1",
    lastUpdated: "2026-06-09T20:35:00Z",
    version: "1.0.4",
  },
  nodes: [
    { id: "ch-101", label: "HPE ProLiant DL360 Gen11", type: "Product" },
    { id: "ch-101-sub", label: "ProLiant Compute Line", type: "Sub-product" },
    { id: "proc-99", label: "Intel Xeon Gold 6430 CPU", type: "SKU" }
  ],
  edges: [
    { id: "edge-1", source: "proc-99", target: "ch-101", relationship: "depends on" },
    { id: "edge-2", source: "ch-101", target: "ch-101-sub", relationship: "hierarchy" }
  ],
};

// Self-Diagnostic Test Suite: Asserts that all example objects validate flawlessly against our Zod validators
export function runIntegrationDiagnosticTestSuite(): { passed: boolean; reports: string[] } {
  const reports: string[] = [];
  let passed = true;

  const runTest = (name: string, schema: import("zod").ZodTypeAny, data: unknown) => {
    const res = schema.safeParse(data);
    if (res.success) {
      reports.push(`✓ [PASSED COMPLIANCE CHECK]: ${name}`);
    } else {
      passed = false;
      const errStr = res.error?.issues.map((i: any) => i.path.join(".") + ": " + i.message).join(", ");
      reports.push(`✗ [FAILED COMPLIANCE CHECK]: ${name} - Errors: ` + errStr);
    }
  };

  try {
    runTest("PRD Ingest Request", IngestRequestSchema, SAMPLE_INGEST_REQUEST);
    runTest("PRD Ingest Response", IngestResponseSchema, SAMPLE_INGEST_RESPONSE);
    runTest("PRD Playwright Request", PlaywrightRunRequestSchema, SAMPLE_PLAYWRIGHT_RUN_REQUEST);
    runTest("PRD Playwright Response", PlaywrightRunResponseSchema, SAMPLE_PLAYWRIGHT_RUN_RESPONSE);
    runTest("PRD Portfolio Orchestrate Request", PortfolioOrchestrateRequestSchema, SAMPLE_PORTFOLIO_ORCHESTRATE_REQUEST);
    runTest("PRD Portfolio Orchestrate Response", PortfolioOrchestrateResponseSchema, SAMPLE_PORTFOLIO_ORCHESTRATE_RESPONSE);
    runTest("PRD Portfolio Manual Upload Request", PortfolioManualUploadRequestSchema, SAMPLE_PORTFOLIO_MANUAL_UPLOAD_REQUEST);
    runTest("PRD Portfolio Manual Upload Response", PortfolioManualUploadResponseSchema, SAMPLE_PORTFOLIO_MANUAL_UPLOAD_RESPONSE);
    runTest("PRD Reconciliation Request", ReconciliationRequestSchema, SAMPLE_RECONCILIATION_REQUEST);
    runTest("PRD Reconciliation Response", ReconciliationResponseSchema, SAMPLE_RECONCILIATION_RESPONSE);
    runTest("PRD Constraint Check Request", ConstraintCheckRequestSchema, SAMPLE_CONSTRAINT_CHECK_REQUEST);
    runTest("PRD Constraint Check Response", ConstraintCheckResponseSchema, SAMPLE_CONSTRAINT_CHECK_RESPONSE);
    runTest("PRD Webhook Dispatch Request", WebhookDispatchRequestSchema, SAMPLE_WEBHOOK_DISPATCH_REQUEST);
    runTest("PRD Webhook Dispatch Response", WebhookDispatchResponseSchema, SAMPLE_WEBHOOK_DISPATCH_RESPONSE);
    runTest("PRD Taxonomy Graph API Response", GraphAPIResponseSchema, SAMPLE_GRAPH_API_RESPONSE);
  } catch (e: unknown) {
    const errorObj = e as { message?: string };
    reports.push(`✗ [FATAL DIAGNOSTIC ERROR]: Runtime exception during schema validation suite: ${errorObj.message}`);
  }

  return { passed, reports };
}
