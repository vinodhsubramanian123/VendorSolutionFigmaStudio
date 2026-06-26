import express from "express";
import { logger } from "./server/logger";
import { IngestRequest, IngestResponse, ReconciliationRequest, ReconciliationResponse, ConstraintCheckRequest, ConstraintCheckResponse, WebhookDispatchRequest, WebhookDispatchResponse, PlaywrightRunRequest, PlaywrightRunResponse } from "./src/types/data";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import {
  IngestRequestSchema,
  ReconciliationRequestSchema,
  ConstraintCheckRequestSchema,
  WebhookDispatchRequestSchema,
  PlaywrightRunRequestSchema,
  PortfolioOrchestrateRequestSchema,
  PortfolioManualUploadRequestSchema
} from "./src/types/zodSchemas";
import { runIntegrationDiagnosticTestSuite } from "./src/lib/backendMockData";

/**
 * Express middleware helper to enforce strict contract schema compliance.
 * Resolves back-front discrepancy gaps instantly with detailed field arrays.
 */
function validateBody(schema: any) {
  return (req: express.Request, res: express.Response, next: express.NextFunction): any => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_FAILED",
          message: "Request body does not conform to the strict VSIP data contract schema specifications.",
          details: parsed.error.issues.reduce((acc: any, curr: any) => {
            const key = curr.path.join(".") || "body";
            if (!acc[key]) acc[key] = [];
            acc[key].push(curr.message);
            return acc;
          }, {})
        }
      });
    }
    req.body = parsed.data;
    next();
  };
}

// Define the API Port and Ingress binding configuration as per platform rules
const PORT = 3000;
const HOST = "0.0.0.0";
// 2. Reconciliation & Comparison Contracts
// 3. Taxonomy Physical Constraints Verification
// 4. Webhook Dispatch Outbound CRM/ERP Sync
// 5. Playwright Automation Scraper Web Crawl

/**
 * ============================================================================
 * EXPRESS CONTROLLER ROUTINGS & MOCK CRUISE CONTROLS
 * ============================================================================
 */
async function startServer() {
  const app = express();
  app.use(express.json());

  // Log all API hits for easy debugging
  app.use((req, res, next) => {
    if (req.url.startsWith("/api")) {
      logger.info(`[API REQUEST] => ${req.method} ${req.url}`);
    }
    next();
  });

  // REST API: Endpoint 0: Standard Healthcheck Check
  app.get("/api/health", (req, res) => {
    res.status(200).json({
      status: "operational",
      serverTime: new Date().toISOString(),
      version: "2.1.0-beta",
      environment: process.env.NODE_ENV || "development"
    });
  });

  // REST API: Endpoint 1: Smart Ingestion & Workbook Splitter
  app.post("/api/boq/ingest", validateBody(IngestRequestSchema), (req, res) => {
    const { fileName, presetType, rawText }: IngestRequest = req.body;

    // Dynamic mock response generations mapping specific rules to prevent guessing
    let vendor = "HPE";
    let detectedChassis = "P40411-B21";
    let confidence = 78;
    let solutions: any[] = [];

    if (presetType === "hpe-legacy") {
      vendor = "HPE";
      detectedChassis = "P40411-B21 DL380 Gen11 NC SFF";
      confidence = 78;
      solutions = [
        {
          id: "sol-api-hpe-legacy",
          vendor: "HPE",
          label: `HPE Enterprise Solution (Validated Ingestion: ${fileName})`,
          totalPrice: 118200,
          originalPrice: 125000,
          savings: 6800,
          complianceScore: 78,
          items: [
            { id: "item-api-h1", partNumber: "P40411-B21", name: "HPE ProLiant DL380 Gen11 CTO Chassis Chassis", type: "Chassis", quantity: 10, unitPrice: 3400 },
            { id: "item-api-h2", partNumber: "815100-B21", name: "Intel Xeon Gold 6130 Processor [EOL Sourcing Risk]", type: "Processor", quantity: 20, unitPrice: 1890 },
            { id: "item-api-h3", partNumber: "P38454-B21", name: "HPE 64GB DDR5 memory module RDIMM", type: "Memory", quantity: 80, unitPrice: 580 }
          ]
        },
        {
          id: "sol-api-dell-alternative",
          vendor: "Dell",
          label: "Dell Clean Alternative (Peer Modern Alignment Option)",
          totalPrice: 120100,
          originalPrice: 125200,
          savings: 5100,
          complianceScore: 98,
          items: [
            { id: "item-api-d1", partNumber: "210-BFXS", name: "Dell PowerEdge R760 8SFF Chassis", type: "Chassis", quantity: 10, unitPrice: 3250 },
            { id: "item-api-d2", partNumber: "338-CHYT", name: "Intel Xeon Gold 6430 32-Core CPU", type: "Processor", quantity: 20, unitPrice: 2190 },
            { id: "item-api-d3", partNumber: "370-AHFF", name: "Dell 64GB RDIMM 4800MT/s RAM", type: "Memory", quantity: 40, unitPrice: 595 }
          ]
        }
      ];
    } else if (presetType === "dell-overcharge") {
      vendor = "Dell";
      detectedChassis = "210-BFXS PowerEdge R760 SFF";
      confidence = 85;
      solutions = [
        {
          id: "sol-api-dell-overcharge",
          vendor: "Dell",
          label: `Dell Portal Bid (Validated Ingestion: ${fileName})`,
          totalPrice: 105720,
          originalPrice: 115000,
          savings: 9280,
          complianceScore: 85,
          items: [
            { id: "item-api-de1", partNumber: "210-BFXS", name: "Dell PowerEdge R760 8SFF Chassis Base Unit", type: "Chassis", quantity: 12, unitPrice: 3250 },
            { id: "item-api-de2", partNumber: "400-BPSB", name: "Dell 3.84TB SAS Read Intensive SSD SFF [Markup Variance Detected]", type: "Drive", quantity: 24, unitPrice: 1590 },
            { id: "item-api-de3", partNumber: "370-AHFF", name: "Dell 64GB RDIMM 4800MT/s memory module", type: "Memory", quantity: 48, unitPrice: 595 }
          ]
        },
        {
          id: "sol-api-hpe-alternative",
          vendor: "HPE",
          label: "HPE Clean Alternative (Peer Baseline Modern Alignment)",
          totalPrice: 98160,
          originalPrice: 110000,
          savings: 11840,
          complianceScore: 98,
          items: [
            { id: "item-api-h1", partNumber: "P40411-B21", name: "HPE ProLiant DL380 Gen11 8SFF Chassis", type: "Chassis", quantity: 12, unitPrice: 3400 },
            { id: "item-api-h2", partNumber: "P40483-B21", name: "HPE 3.84TB NVMe SSD Sourced", type: "Drive", quantity: 24, unitPrice: 1220 },
            { id: "item-api-h3", partNumber: "P38454-B21", name: "HPE 64GB Dual Rank DDR5 module", type: "Memory", quantity: 48, unitPrice: 580 }
          ]
        }
      ];
    } else {
      vendor = "Cisco";
      detectedChassis = "UCSC-C240-M7S UCS C240 M7 Rack";
      confidence = 82;
      solutions = [
        {
          id: "sol-api-cisco-asymmetric",
          vendor: "Cisco",
          label: `Cisco Matrix Bid (Validated Ingestion: ${fileName})`,
          totalPrice: 140520,
          originalPrice: 148000,
          savings: 7480,
          complianceScore: 82,
          items: [
            { id: "item-api-c1", partNumber: "UCSC-C240-M7S", name: "Cisco UCS C240 M7 Rack Server Chassis", type: "Chassis", quantity: 12, unitPrice: 4100 },
            { id: "item-api-c2", partNumber: "UCS-CPU-I6430", name: "UCS Intel Xeon Gold 6430 32-Core CPU", type: "Processor", quantity: 24, unitPrice: 2280 },
            { id: "item-api-c3", partNumber: "UCS-MR-64G2ED-E", name: "UCS 64GB DDR5 memory module [Asymmetric Layout - Qty 5 per node]", type: "Memory", quantity: 60, unitPrice: 610 }
          ]
        },
        {
          id: "sol-api-dell-alternative-c",
          vendor: "Dell",
          label: "Dell Symmetrical Alternative Layout",
          totalPrice: 138000,
          originalPrice: 145000,
          savings: 7000,
          complianceScore: 98,
          items: [
            { id: "item-api-cd1", partNumber: "210-BFXS", name: "Dell PowerEdge R760 8SFF Chassis", type: "Chassis", quantity: 12, unitPrice: 3250 },
            { id: "item-api-cd2", partNumber: "338-CHYT", name: "Intel Xeon Gold 6430 32-Core CPU", type: "Processor", quantity: 24, unitPrice: 2190 },
            { id: "item-api-cd3", partNumber: "370-AHFF", name: "Dell 64GB RDIMM 4800MT/s RAM (Optimized Symmetrical 8 per node)", type: "Memory", quantity: 96, unitPrice: 595 }
          ]
        }
      ];
    }

    // Build a full UCID object as required by the IngestResponse contract
    const ucidId = "ucid_api_session_uuid_" + Date.now().toString(16);
    const displayId = "UCID-2026-" + (1700 + Math.floor(Math.random() * 100));

    const response: IngestResponse = {
      success: true,
      message: "Sheet workbook parsed successfully across supplier heuristic rules.",
      sourceFile: fileName,
      ucid: {
        id: ucidId,
        displayId: displayId,
        name: `${vendor} Configuration — ${fileName}`,
        priority: "high",
        projectRef: "PRJ-INGEST-API",
        createdAt: new Date().toISOString(),
        currentStep: "solution-design",
        completedSteps: ["boq-intake", "pre-intelligence"],
        rawBOM: rawText || `Ingested from ${fileName}`,
        solutionId: "sol-api-mock",
        solutionDisplayId: "SOL-API-MOCK",
        configIndex: 1,
        configLabel: "API Config",
        parallelGroup: null,
        solutions: solutions.map((sol: any) => ({
          id: sol.id,
          name: sol.label || sol.vendor + " Solution",
          targetUcidId: ucidId,
          vendorSubmissions: [{
            id: "vs-" + sol.id,
            vendor: sol.vendor,
            label: sol.label,
            totalPrice: sol.totalPrice,
            originalPrice: sol.originalPrice,
            savings: sol.savings,
            complianceScore: sol.complianceScore,
            configs: [{
              id: "cfg-" + sol.id,
              name: sol.label || sol.vendor + " Config",
              totalPrice: sol.totalPrice,
              originalPrice: sol.originalPrice,
              savings: sol.savings,
              items: sol.items
            }]
          }]
        })),
        events: [
          { timestamp: new Date().toISOString(), level: "info" as const, msg: `Ingestion triggered for file: ${fileName}` },
          { timestamp: new Date().toISOString(), level: "ok" as const, msg: `Workbook processed. Confidence: ${confidence}%` }
        ],
        snapshots: []
      },
      timestamp: new Date().toISOString(),
      parsedSummary: {
        vendorBrand: vendor,
        detectedChassis: detectedChassis,
        itemsCount: solutions[0]?.items?.reduce((cur: number, i: any) => cur + i.quantity, 0) || 5,
        initialConfidenceScore: confidence
      },
    };

    res.status(200).json(response);
  });

  // REST API: Endpoint 2: Reconciliation & Comparisons Analytics Engine
  app.post("/api/reconciliation/compare", validateBody(ReconciliationRequestSchema), (req, res) => {
    const { solutions }: ReconciliationRequest = req.body;

    // Dynamic calculus simulation mimicking smart catalog pricing
    let cheapestId = solutions[0]?.id || "unknown";
    let highestScoreId = solutions[0]?.id || "unknown";
    let totalSavings = 0;
    let minCost = Infinity;

    const computedMatrix = solutions.map((sol) => {
      const computedContractCost = sol.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
      const originalBaseCost = computedContractCost * 1.08; // list price markups
      const savingsVal = originalBaseCost - computedContractCost;
      totalSavings += savingsVal;

      if (computedContractCost < minCost) {
        minCost = computedContractCost;
        cheapestId = sol.id;
      }

      // Check for constraints to evaluate compliance rating
      let compliance = 100;
      let worstLeadTime = 7;

      sol.items.forEach((item) => {
        // EOL triggers severe compliance crash
        if (item.partNumber === "815100-B21") {
          compliance -= 22;
          worstLeadTime = Math.max(worstLeadTime, 45);
        }
        // Markup triggers slight audit flag
        if (item.partNumber === "400-BPSB") {
          worstLeadTime = Math.max(worstLeadTime, 12);
        }
        // Uneven memory triggers layout flag
        if (item.type === "Memory" && item.quantity % 8 !== 0) {
          compliance -= 18;
          worstLeadTime = Math.max(worstLeadTime, 8);
        }
      });

      if (compliance < 100) {
        highestScoreId = solutions.find((s) => s.id !== sol.id)?.id || sol.id;
      }

      return {
        solutionId: sol.id,
        vendor: sol.vendor,
        baseCost: Math.round(originalBaseCost),
        negotiatedContractCost: Math.round(computedContractCost),
        variancePercentage: parseFloat(((originalBaseCost - computedContractCost) / originalBaseCost * 100).toFixed(2)),
        leadTimeBottleneckDays: worstLeadTime,
        deliveryConfidenceRating: compliance
      };
    });

    const response: ReconciliationResponse = {
      comparisonHash: crypto.createHash("sha1").update(JSON.stringify(solutions)).digest("hex").substring(0, 16),
      calculatedAt: new Date().toISOString(),
      metrics: {
        cheapestSolutionId: cheapestId,
        highestComplianceId: highestScoreId,
        totalSavingsUSD: Math.round(totalSavings),
        optimumHybridAlternative: {
          totalCost: Math.round(minCost * 0.95), // Hybrid blend yields 5% further cost reduction
          chassisVendor: "Combination Blend",
          componentsCount: solutions[0]?.items?.length || 4
        }
      },
      matrix: computedMatrix
    };

    res.status(200).json(response);
  });

  // REST API: Endpoint 3: Taxonomy Physical Constraints Verification
  app.post("/api/taxonomy/check-constraints", validateBody(ConstraintCheckRequestSchema), (req, res) => {
    const { chassisSKU, cpuSKU, ramQuantity, psuWattsCount }: ConstraintCheckRequest = req.body;

    // Heuristics verification based on catalog hardware guidelines
    const isEolCpu = cpuSKU === "815100-B21";
    const isOddRam = ramQuantity % 8 !== 0;
    const isUnderpowered = psuWattsCount < 800;

    const socketMatch = {
      status: (isEolCpu ? "asymmetric" : "compatible") as "asymmetric" | "compatible" | "blocked",
      chassisSocket: "LGA4677",
      cpuSocket: isEolCpu ? "LGA3647 (Legacy)" : "LGA4677",
      description: isEolCpu 
        ? "Mismatch identified: Gen11 chassis uses LGA4677 sockets, but legacy CPU 815100-B21 belongs to LGA3647." 
        : "Complete alignment: CPU model pin specifications pair natively with host system chassis sockets."
    };

    const powerLimitTest = {
      passed: !isUnderpowered,
      estimatedTdpWatts: isEolCpu ? 205 : 270,
      maxSupportedWatts: psuWattsCount,
      marginWatts: psuWattsCount - (isEolCpu ? 205 : 270)
    };

    const memoryBalanceCheck = {
      passed: !isOddRam,
      quantity: ramQuantity,
      optimalLayoutSymmetry: 8,
      recommendsCorrection: isOddRam,
      message: isOddRam
        ? `Uneven layout detected: Odd RAM Allocation count (${ramQuantity}) creates multi-channel architecture latency bottleneck. Scale up to multiples of 8.`
        : "Balanced layout verified: Symmetrical memory controller modules satisfied. Ideal transmission performance."
    };

    const response: ConstraintCheckResponse = {
      isCompliant: !isEolCpu && !isOddRam && !isUnderpowered,
      socketMatch,
      powerLimitTest,
      memoryBalanceCheck
    };

    res.status(200).json(response);
  });

  // REST API: Endpoint 4: Outbound Synchronization Integration Webhooks
  app.post("/api/integrations/dispatch", validateBody(WebhookDispatchRequestSchema), (req, res) => {
    const { endpointUrl, secretToken, ucidRef, payloadData }: WebhookDispatchRequest = req.body;

    // Create dynamic cryptographic HMAC signature representing enterprise standards
    const hmac = crypto.createHmac("sha256", secretToken);
    hmac.update(JSON.stringify(payloadData || { ucid: ucidRef }));
    const signature = hmac.digest("hex");

    const auditLog = [
      {
        attemptNumber: 1,
        timestamp: new Date(Date.now() - 400).toISOString(),
        httpStatusCode: 503,
        responseBody: "{\"error\":\"Service Unavailable\",\"code\":503,\"message\":\"Target server overloaded.\"}"
      },
      {
        attemptNumber: 2,
        timestamp: new Date().toISOString(),
        httpStatusCode: 200,
        responseBody: "{\"status\":\"success\",\"message\":\"Transaction stored on SAP ERP system ledger.\",\"invoiceId\":\"INV-9104X\"}"
      }
    ];

    const response: WebhookDispatchResponse = {
      dispatchId: "tx_dispatch_" + crypto.randomBytes(6).toString("hex"),
      status: "delivered",
      cryptographicSignature: signature,
      auditLog: auditLog
    };

    res.status(200).json(response);
  });

  // REST API: Endpoint 5: Playwright Automation Scraper Crawler Execution Simulators
  app.post("/api/agents/run", validateBody(PlaywrightRunRequestSchema), (req, res) => {
    const { agentName, ucidRef, targetPortalUrl, bypassCaptchas }: PlaywrightRunRequest = req.body;

    const logTrail = [
      { timestamp: new Date(Date.now() - 2500).toISOString(), level: "info" as const, message: `Booting Chromium worker instance to target path: ${targetPortalUrl || "https://premier.dell.com"}` },
      { timestamp: new Date(Date.now() - 2000).toISOString(), level: "info" as const, message: "Injecting partner portal automation credentials..." },
      { timestamp: new Date(Date.now() - 1500).toISOString(), level: "info" as const, message: "Bypassing anti-bot verification scripts successfully..." },
      { timestamp: new Date(Date.now() - 1000).toISOString(), level: "debug" as const, message: "XPath selected search terms solved. Navigated inside My Quotes section." },
      { timestamp: new Date(Date.now() - 500).toISOString(), level: "info" as const, message: "Discovered active matching pricing spreadsheet draft. Extracting node table parameters." },
      { timestamp: new Date().toISOString(), level: "info" as const, message: "Execution finished. Dispatched final parsed pricing data structures to backend memory caches." }
    ];

    const response: PlaywrightRunResponse = {
      taskId: "task_agent_" + crypto.randomBytes(4).toString("hex"),
      status: "success",
      executionTimeMs: 2500,
      crawledItemsExtracted: agentName === "DellPremierPortal" ? 24 : 12,
      logTrail: logTrail
    };

    res.status(200).json(response);
  });

  // REST API: Endpoint 6: Hybrid Multi-UCID Portfolio Parallel Orchestrator
  app.post("/api/portfolio/orchestrate", validateBody(PortfolioOrchestrateRequestSchema), (req, res) => {
    const { portfolioId, ucids } = req.body;
    res.status(200).json({
      success: true,
      transactionId: "tx_orchestrate_" + crypto.randomBytes(5).toString("hex"),
      status: "orchestrating",
      timestamp: new Date().toISOString()
    });
  });

  // REST API: Endpoint 7: Submit Manual Partner Portal BOM with configuration level segregation
  app.post("/api/portfolio/upload-manual", validateBody(PortfolioManualUploadRequestSchema), (req, res) => {
    const { portfolioId, ucidRef, filename, configsMatchedCount } = req.body;

    const matchCount = Number(configsMatchedCount || 4);
    const resolvedStatus = matchCount < 4 ? "partial" : "complete";
    const reconciledVal = matchCount === 4 ? 392400 : matchCount * 98100;

    res.status(200).json({
      success: true,
      reconciliationStatus: resolvedStatus,
      reconciledPriceUSD: reconciledVal,
      missingSlots: matchCount < 4 ? ["cfg-3", "cfg-4"] : [],
      integrityScore: 100,
      message: `BOM split successfully matched ${matchCount} of 4 configurations under '${ucidRef}' umbrella. Zero interference on other parallel automated tracks.`
    });
  });

  // REST API: Endpoint 8: Save snapshot for specific UCID
  app.post("/api/ucids/:unit/snapshots", (req, res) => {
    const { unit } = req.params;
    const { snapshot } = req.body;

    if (!snapshot) {
      return res.status(400).json({
        success: false,
        error: "Missing snapshot object in request body."
      });
    }

    logger.info(`[SNAPSHOT API] => Persisted snapshot version v${snapshot.version} for UCID unit: ${unit}`);

    res.status(200).json({
      success: true,
      ucid: unit,
      snapshotId: snapshot.id,
      timestamp: new Date().toISOString()
    });
  });

  // REST API: Endpoint 9: Vendor Portal Mock Adapter Gateway
  app.post("/api/vendor/portal", (req, res) => {
    const reqData = req.body;
    logger.info(`[VENDOR PORTAL API] Received request for ${reqData.vendor} action ${reqData.action}`);
    
    res.status(200).json({
      success: true,
      data: { mockResponse: true, timestamp: new Date().toISOString(), message: `Handled ${reqData.action} for ${reqData.vendor}` },
      confidence: 0.95
    });
  });

  // Mount Vite Middleware for development OR serve built static assets in Production
  let vite: any = null;
  if (process.env.NODE_ENV !== "production") {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production mode, serve files out of /dist directly
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  
// Mock Job polling endpoints
const jobStore = new Map<string, any>();

app.post("/api/jobs", (req, res) => {
  const { type, context, parent_job_id } = req.body;
  const jobId = "job_" + crypto.randomBytes(4).toString("hex");
  jobStore.set(jobId, {
    job_id: jobId,
    type,
    status: 'processing',
    progress: 10,
    context,
    parent_job_id,
    child_jobs: []
  });
  res.status(200).json({ job_id: jobId });
});

app.get("/api/jobs/:job_id", (req, res) => {
  const jobId = req.params.job_id;
  const job = jobStore.get(jobId);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }
  
  if (job.status === "processing") {
    if (job.progress < 100) {
      job.progress += 25;
    }
    if (job.progress >= 100) {
      job.status = "completed";
      job.result = { success: true };
    }
  }

  res.json(job);
});

app.get("/api/jobs/:job_id/children", (req, res) => {
  res.json([]);
});

  const server = app.listen(PORT, "0.0.0.0", () => {
    logger.info(`[FULL-STACK ENGINE] Procurement Server running securely on http://localhost:${PORT}`);
  });

  const gracefulShutdown = async () => {
    logger.info("Shutting down gracefully...");
    server.close(() => {
      logger.info("HTTP server closed.");
    });
    if (vite) {
      await vite.close();
      logger.info("Vite server closed.");
    }
    process.exit(0);
  };

  process.on("SIGTERM", gracefulShutdown);
  process.on("SIGINT", gracefulShutdown);
}

startServer();
