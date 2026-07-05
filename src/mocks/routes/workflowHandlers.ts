import { http, HttpResponse, delay } from 'msw';
import { MockCatalogApi, MockSolutionApi, MockTaxonomyApi } from '../../lib/api-mock';
import { CatalogSKU, Config, UCID } from '../../types';
import { BOQ_PRESETS } from '../boqMocks';
import { wrapSuccess} from './sharedState';

// Tracks how many times each job_id has been polled, so streamJob()'s real
// interval-based polling (see apiClient.ts) has genuine incremental
// progress to observe instead of jumping straight to "completed" on the
// very first call — see docs/architecture/data-ownership.md, Phase 6.
// This is ephemeral per-job session state (not entity data coreStore owns),
// scoped to this module the same way alternative-paths/path-selection
// already are.
const jobPollCounts = new Map<string, number>();

export const workflowHandlers = [
  http.get('/api/jobs/:id', async ({ params }) => {
    if (process.env.NODE_ENV !== 'test') await delay(150);
    const jobId = params.id as string;
    const pollCount = (jobPollCounts.get(jobId) || 0) + 1;
    jobPollCounts.set(jobId, pollCount);

    // First 3 polls report increasing progress; 4th+ reports completed.
    // Real jobs would report genuine backend progress here instead.
    const progressSteps = [25, 55, 80];
    const isComplete = pollCount > progressSteps.length;
    return HttpResponse.json(wrapSuccess({
      job_id: jobId,
      status: isComplete ? 'completed' : 'processing',
      progress: isComplete ? 100 : progressSteps[pollCount - 1],
      result: isComplete ? {
        success: true,
        reconciliationStatus: 'complete'
      } : undefined
    }));
  }),
  // GET /api/catalog
  http.get('/api/catalog', async () => {
    if (process.env.NODE_ENV !== 'test') await delay(600);
    const data = await MockCatalogApi.getCatalog();
    return HttpResponse.json(wrapSuccess(data));
  }),
  // POST /api/catalog
  http.post('/api/catalog', async ({ request }) => {
    if (process.env.NODE_ENV !== 'test') await delay(600);
    const body = await request.json();
    const data = await MockCatalogApi.addCatalogSku(body as CatalogSKU);
    return HttpResponse.json(wrapSuccess(data));
  }),
  // PUT /api/catalog/:id
  http.put('/api/catalog/:id', async ({ request, params }) => {
    if (process.env.NODE_ENV !== 'test') await delay(600);
    const body = await request.json();
    const data = await MockCatalogApi.updateCatalogSku(params.id as string, body as Partial<CatalogSKU>);
    return HttpResponse.json(wrapSuccess(data));
  }),
  // DELETE /api/catalog/:id
  http.delete('/api/catalog/:id', async ({ params }) => {
    if (process.env.NODE_ENV !== 'test') await delay(600);
    await MockCatalogApi.deleteCatalogSku(params.id as string);
    return HttpResponse.json(wrapSuccess({}));
  }),
  // GET /api/solution-builder/init
  http.get('/api/solution-builder/init', async () => {
    if (process.env.NODE_ENV !== 'test') await delay(600);
    const data = await MockSolutionApi.getSolutionBuilderInit();
    return HttpResponse.json(wrapSuccess(data));
  }),
  // GET /api/taxonomy/graph/:id
  http.get('/api/taxonomy/graph/:id', async ({ params }) => {
    if (process.env.NODE_ENV !== 'test') await delay(600);
    const mockConfig = { id: params.id, vendor: "HPE" } as unknown as Config;
    const res = await MockTaxonomyApi.getGraphForConfig(mockConfig, [], "HPE");
    return HttpResponse.json(wrapSuccess(res));
  }),
  // POST /api/portfolio/orchestrate
  http.post('/api/portfolio/orchestrate', async () => {
    if (process.env.NODE_ENV !== 'test') await delay(800);
    return HttpResponse.json(wrapSuccess({
      success: true,
      transactionId: "job-portfolio-sync",
      status: "orchestrating",
      timestamp: new Date().toISOString()
    }));
  }),
  // POST /api/jobs
  http.post('/api/jobs', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { context?: { executionMode?: string } };
    if (process.env.NODE_ENV !== 'test') await delay(800);
    
    // Skip automated provisioning/intelligence steps if execution mode is manual
    if (body?.context?.executionMode === 'manual') {
      return HttpResponse.json(wrapSuccess({
        status: "completed",
        job_id: "job-skipped-manual-" + crypto.randomUUID(),
        logTrail: [
          "Manual mode detected.",
          "Skipping automated API quoting...",
          "Awaiting manual document upload."
        ]
      }));
    }

    return HttpResponse.json(wrapSuccess({
      status: "completed",
      job_id: "job-mock-ingest-" + crypto.randomUUID(),
      logTrail: [
        "Validating structural Bill of Materials nodes under profile...",
        "Interrogating direct HPE REST quotation endpoints...",
        "Comparing Dell Premier partner contract pricing databases...",
        "Auditing Cisco unified socket bus configuration symmetry requirements...",
        "Analyzing multi-sheet compliance rules validations..."
      ]
    }));
  }),
  // POST /api/pipeline/step
  http.post('/api/pipeline/step', async ({ request }) => {
    const body = (await request.json()) as { step?: string };
    const step = body.step;
    
    let progress = 0;
    let status = "processing";
    let log = "";
    let extractedCount = 0;
    let delayMs = 1000;
    switch (step) {
      case "init": progress = 15; log = "[INIT] Document received"; delayMs = 100; break;
      case "parse": progress = 35; log = "[PARSE] Detecting document structure and encoding..."; delayMs = 900; break;
      case "ocr": progress = 55; log = "[OCR] Extracting text layers and table structures..."; delayMs = 1100; break;
      case "extract": progress = 72; status = "extracting"; log = "[EXTRACT] Matching part numbers against Master Catalog..."; delayMs = 1400; break;
      case "rules": progress = 88; status = "extracting"; log = "[RULES] Generating sourcing intelligence rules from findings..."; delayMs = 1400; break;
      case "complete": progress = 100; status = "completed"; log = "[DONE] Catalog rules extracted. Document intelligence ingested."; extractedCount = 8; delayMs = 1400; break;
    }
    if (process.env.NODE_ENV !== 'test') await delay(delayMs);
    return HttpResponse.json(wrapSuccess({
      progress,
      status,
      log,
      extractedCount
    }));
  }),
  // POST /api/portfolio/upload-manual
  http.post('/api/portfolio/upload-manual', async ({ request }) => {
    if (process.env.NODE_ENV !== 'test') await delay(800);
    const b = (await request.json()) as { configsMatchedCount?: number };
    const isComplete = b?.configsMatchedCount === 4;
    return HttpResponse.json(wrapSuccess({
      success: true,
      reconciliationStatus: isComplete ? "complete" : "partial",
      reconciledPriceUSD: isComplete ? 244800 : 122400,
      missingSlots: isComplete ? [] : ["config-slot-4"],
      integrityScore: isComplete ? 100 : 75,
      message: isComplete
        ? "Manual partner upload fully reconciled against portfolio slots."
        : "Manual partner upload accepted with unresolved configuration slots."
    }));
  }),
  http.post('/api/boq/ingest', async ({ request }) => {
    if (process.env.NODE_ENV !== 'test') await delay(800);
    const body = (await request.json()) as { presetType?: string; fileName?: string };
    const presetType = body?.presetType || "hpe-legacy";
    const preset = BOQ_PRESETS[presetType] || BOQ_PRESETS["hpe-legacy"];
    const ucidObj: UCID = {
      id: crypto.randomUUID(),
      displayId: "UCID-2026-9999",
      name: "Auto-Ingested Sourcing Job",
      priority: "high",
      projectRef: "PRJ-NEW-BOQ",
      createdAt: new Date().toISOString(),
      currentStep: "boq-intake",
      completedSteps: [],
      rawBOM: preset.rawText || "Parsed mock payload",
      solutionId: "sol-ylng-2026-001",
      solutionDisplayId: "SOL-2026-001",
      configIndex: 1,
      configLabel: "API Config",
      parallelGroup: null,
      solutions: preset.sols,
      events: [],
      snapshots: []
    };
    return HttpResponse.json(wrapSuccess({ 
      success: true,
      message: "BOQ ingested successfully.",
      sourceFile: body?.fileName || "mock-upload.xlsx",
      ucid: ucidObj,
      timestamp: new Date().toISOString(),
      parsedSummary: {
        vendorBrand: "Consolidated",
        detectedChassis: "Multi-Node",
        itemsCount: 12,
        initialConfidenceScore: 92
      },
      rawText: preset.rawText,
      solutions: preset.sols
    }));
  }),
  // POST /api/reconciliation/compare
  http.post('/api/reconciliation/compare', async () => {
    if (process.env.NODE_ENV !== 'test') await delay(800);
    return HttpResponse.json(wrapSuccess({
      comparisonHash: "hash-" + crypto.randomUUID(),
      calculatedAt: new Date().toISOString(),
      metrics: {
        cheapestSolutionId: "vs-u1-dell",
        highestComplianceId: "vs-u1-hpe",
        totalSavingsUSD: 16200,
        optimumHybridAlternative: {
          totalCost: 235000,
          chassisVendor: "Dell",
          componentsCount: 12
        }
      },
      matrix: [
        {
          solutionId: "vs-u1-hpe",
          vendor: "HPE",
          baseCost: 261000,
          negotiatedContractCost: 244800,
          variancePercentage: 6.2,
          leadTimeBottleneckDays: 14,
          deliveryConfidenceRating: 98
        },
        {
          solutionId: "vs-u1-dell",
          vendor: "Dell",
          baseCost: 255200,
          negotiatedContractCost: 239630,
          variancePercentage: 6.1,
          leadTimeBottleneckDays: 12,
          deliveryConfidenceRating: 96
        }
      ]
    }));
  }),
  // POST /api/vendor/portal
  // Anomaly 1 fix (docs/architecture/backend-route-inventory.md): this
  // replaces the old /api/vendors/sync and /api/vendors/toggle mock routes,
  // which had no server.ts equivalent. server.ts's one real vendor route is
  // this generic {vendor, action} dispatcher; this mock now matches that
  // contract instead of diverging from it.
  http.post('/api/vendor/portal', async ({ request }) => {
    if (process.env.NODE_ENV !== 'test') await delay(500);
    const body = (await request.json()) as { vendor: string; action: "sync" | "toggle"; vendorId?: string; connect?: boolean };
    const timestamp = new Date().toISOString();
    if (body.action === "toggle") {
      const nextStatus = body.connect ? "connected" : "disconnected";
      return HttpResponse.json(wrapSuccess({
        status: nextStatus,
        apiHealth: body.connect ? 97 : 0,
        message: `Toggled ${body.vendorId || body.vendor} to ${nextStatus}`,
        timestamp,
      }));
    }
    return HttpResponse.json(wrapSuccess({
      apiHealth: 98,
      message: `Synced contract pricing for ${body.vendor}`,
      timestamp,
    }));
  }),
  // POST /api/agents/run
  http.post('/api/agents/run', async ({ request }) => {
    if (process.env.NODE_ENV !== 'test') await delay(800);
    const b = (await request.json()) as { agentName?: string };
    if (b?.agentName === "AribaScraper") {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: "CCW Authentication Session Expired. Rotating credentials required."
        }
      }, { status: 500 });
    }
    return HttpResponse.json(wrapSuccess({
      taskId: "task-playwright-1",
      status: "success",
      executionTimeMs: 1200,
      crawledItemsExtracted: 3,
      logTrail: [
        { timestamp: new Date().toISOString(), level: "info", message: "Agent started..." },
        { timestamp: new Date().toISOString(), level: "info", message: "Logged in successfully." }
      ]
    }));
  }),
  // POST /api/agents/parse-advice-file
  http.post('/api/agents/parse-advice-file', async () => {
    if (process.env.NODE_ENV !== 'test') await delay(1200);
    return HttpResponse.json(wrapSuccess({
      adviceItems: [
        {
          id: `advice-mock-1`,
          ruleNumber: "81392356",
          productNumber: "P73283-B21",
          adviceText: "UNBUILDABLE CONFIGURATION: OVERRIDE REQUIRES FACTORY APPROVAL. DL380 Gen12 requires to be ordered with 1 qty of MR416i-o controller (P47781-B21) and 1 qty of MR416i-p (P47777-B21) controller.",
          severity: "critical",
          vendor: "HPE"
        },
        {
          id: `advice-mock-2`,
          ruleNumber: "81392920",
          productNumber: "P73283-B21",
          adviceText: "UNBUILDABLE CONFIGURATION: DL380 Gen12 with no other additional cage then only one of the controller-cable combination can be selected.",
          severity: "critical",
          vendor: "HPE"
        }
      ],
      bomItems: [],
      configRows: [],
      ignoredSheets: ["Information"]
    }));
  }),
  // POST /api/agents/semantic-map
  http.post('/api/agents/semantic-map', async ({ request }) => {
    if (process.env.NODE_ENV !== 'test') await delay(800);
    const body = (await request.json()) as { message?: string };
    return HttpResponse.json(wrapSuccess({
      ruleType: "substitution",
      vendor: "HPE",
      partNumber: "P73283-B21",
      mappedOutput: "P40424-B21",
      label: body.message || ""
    }));
  }),
  // POST /api/taxonomy/check-constraints
  http.post('/api/taxonomy/check-constraints', async () => {
    if (process.env.NODE_ENV !== 'test') await delay(800);
    return HttpResponse.json(wrapSuccess({
      isCompliant: true,
      socketMatch: {
        status: "compatible",
        chassisSocket: "LGA-4677",
        cpuSocket: "LGA-4677",
        description: "Socket match verified successfully."
      },
      powerLimitTest: {
        passed: true,
        estimatedTdpWatts: 270,
        maxSupportedWatts: 350,
        marginWatts: 80
      },
      memoryBalanceCheck: {
        passed: true,
        quantity: 16,
        optimalLayoutSymmetry: 8,
        recommendsCorrection: false,
        message: "Memory layout is perfectly balanced (16 modules across 8 channels)."
      }
    }));
  }),
  // POST /api/taxonomy/map
  http.post('/api/taxonomy/map', async ({ request }) => {
    if (process.env.NODE_ENV !== 'test') await delay(800);
    const b = (await request.json()) as { childId?: string; targetParentId?: string; properties?: { partNumber: string; name: string } };
    await MockTaxonomyApi.mapOrphanNode({
      childId: b.childId as string,
      parentId: b.targetParentId as string,
      childInfo: b.properties as { partNumber: string; name: string }
    });
    return HttpResponse.json(wrapSuccess({}));
  }),
  // POST /api/taxonomy/rules
  http.post('/api/taxonomy/rules', async ({ request }) => {
    if (process.env.NODE_ENV !== 'test') await delay(800);
    const b = (await request.json()) as { sourceId?: string; ruleType?: "requires" | "exclusive"; explanation?: string };
    await MockTaxonomyApi.addRule(b.sourceId as string, b.ruleType as "requires" | "exclusive", b.explanation as string);
    return HttpResponse.json(wrapSuccess({}));
  }),
  // NOTE: coreStore.ts (useCoreStore(s => s.solutions)) is the single source
  // of truth for solutions — nothing in the UI currently reads this
  // endpoint's response, so it intentionally has no independent state to
  // keep in sync (see docs/architecture/data-ownership.md).
  // Solutions
  http.get('/api/solutions', async () => {
    if (process.env.NODE_ENV !== 'test') await delay(300);
    return HttpResponse.json(wrapSuccess([]));
  }),
  http.post('/api/solutions', async () => {
    if (process.env.NODE_ENV !== 'test') await delay(500);
    return HttpResponse.json(wrapSuccess({ id: crypto.randomUUID() }));
  }),
  http.patch('/api/solutions/:id/status', async () => {
    if (process.env.NODE_ENV !== 'test') await delay(300);
    return HttpResponse.json(wrapSuccess({ updated: true }));
  }),
  http.post('/api/solutions/:id/vendor-assignments', async () => {
    if (process.env.NODE_ENV !== 'test') await delay(400);
    return HttpResponse.json(wrapSuccess({ id: `va-${crypto.randomUUID()}` }));
  }),

  // Automation & Manual Execution
  http.post('/api/automation/jobs', async () => {
    if (process.env.NODE_ENV !== 'test') await delay(800);
    return HttpResponse.json(wrapSuccess({ job_id: `auto-${crypto.randomUUID()}` }));
  }),
  http.get('/api/automation/jobs/:jobId', async () => {
    if (process.env.NODE_ENV !== 'test') await delay(300);
    return HttpResponse.json(wrapSuccess({ status: 'completed', progress: 100 }));
  }),
  http.post('/api/ucids/:ucidId/manual-upload', async () => {
    if (process.env.NODE_ENV !== 'test') await delay(1000);
    return HttpResponse.json(wrapSuccess({ success: true, ref: 'doc-12345' }));
  }),
  // Cryptographic Dispatch Webhook
  http.post('/api/integrations/dispatch', async () => {
    if (process.env.NODE_ENV !== 'test') await delay(800);
    return HttpResponse.json(wrapSuccess({
      dispatchId: `disp-${crypto.randomUUID()}`,
      status: 'delivered',
      cryptographicSignature: 'sha256:mock_hash_signature',
      auditLog: [
        {
          attemptNumber: 1,
          timestamp: new Date().toISOString(),
          httpStatusCode: 200,
          responseBody: '{"success": true}'
        }
      ]
    }));
  }),
];
