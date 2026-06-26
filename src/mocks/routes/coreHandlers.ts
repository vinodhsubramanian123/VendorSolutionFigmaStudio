import { http, HttpResponse, delay } from 'msw';
import { MockCatalogApi, MockSnapshotApi, MockSolutionApi, MockTaxonomyApi } from '../../lib/api-mock';
import { CatalogSKU, Config, Snapshot,        UCID } from '../../types';
import { BOQ_PRESETS } from '../boqMocks';
import { wrapSuccess} from './sharedState';
export const coreHandlers = [
  http.get('/api/jobs/:id', async ({ params }) => {
    if (process.env.NODE_ENV !== 'test') await delay(600);
    return HttpResponse.json(wrapSuccess({
      job_id: params.id,
      status: 'completed',
      progress: 100,
      result: {
        success: true,
        reconciliationStatus: 'complete'
      }
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
  // GET /api/ucids/:ucid/snapshots
  http.get('/api/ucids/:ucid/snapshots', async () => {
    if (process.env.NODE_ENV !== 'test') await delay(600);
    const data = await MockSnapshotApi.getSnapshots();
    return HttpResponse.json(wrapSuccess(data));
  }),
  // POST /api/ucids/:ucid/snapshots
  http.post('/api/ucids/:ucid/snapshots', async ({ request }) => {
    if (process.env.NODE_ENV !== 'test') await delay(600);
    const body = await request.json();
    const data = await MockSnapshotApi.addSnapshot(body as Snapshot);
    return HttpResponse.json(wrapSuccess(data));
  }),
  // PATCH /api/ucids/:ucid/snapshots/:snapshotId/lock
  http.patch('/api/ucids/:ucid/snapshots/:snapshotId/lock', async () => {
    if (process.env.NODE_ENV !== 'test') await delay(600);
    // Mock locking logic (just returning success)
    return HttpResponse.json(wrapSuccess({ locked: true }));
  }),
  // DELETE /api/ucids/:ucid/snapshots/:snapshotId
  http.delete('/api/ucids/:ucid/snapshots/:snapshotId', async ({ params }) => {
    if (process.env.NODE_ENV !== 'test') await delay(600);
    await MockSnapshotApi.deleteSnapshot(params.snapshotId as string);
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
    return HttpResponse.json(wrapSuccess({ status: "accepted", job_id: "job-portfolio-sync" }));
  }),
  // POST /api/jobs
  http.post('/api/jobs', async () => {
    if (process.env.NODE_ENV !== 'test') await delay(800);
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
    return HttpResponse.json(wrapSuccess({ reconciliationStatus: b?.configsMatchedCount === 4 ? "complete" : "partial" }));
  }),
  // POST /api/boq/ingest
  http.post('/api/boq/ingest', async ({ request }) => {
    if (process.env.NODE_ENV !== 'test') await delay(800);
    const body = (await request.json()) as { presetType?: string; fileName?: string };
    const presetType = body?.presetType || "hpe-legacy";
    const preset = BOQ_PRESETS[presetType] || BOQ_PRESETS["hpe-legacy"];
    const ucidObj: UCID = {
      id: crypto.randomUUID(),
      displayId: "UCID-2026-NEW",
      name: "Auto-Ingested Sourcing Job",
      priority: "high",
      projectRef: "PRJ-NEW-BOQ",
      createdAt: new Date().toISOString(),
      currentStep: "boq-intake",
      completedSteps: [],
      rawBOM: preset.rawText || "Parsed mock payload",
      solutionId: "sol-api-mock",
      solutionDisplayId: "SOL-API-MOCK",
      configIndex: 1,
      configLabel: "API Config",
      parallelGroup: null,
      solutions: preset.sols,
      events: [],
      snapshots: []
    };
    return HttpResponse.json(wrapSuccess({ 
      ucid: ucidObj.displayId,
      configsCreated: 2,
      sourceFile: body?.fileName || "mock-upload.xlsx",
      parsedSummary: {
        vendorBrand: "Consolidated",
        detectedChassis: "Multi-Node",
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
      boqItems: 24,
      bomItems: 24,
      matchRate: 100,
      anomalies: 0,
    }));
  }),
  // POST /api/vendors/sync
  http.post('/api/vendors/sync', async () => {
    if (process.env.NODE_ENV !== 'test') await delay(800);
    return HttpResponse.json(wrapSuccess({ syncedCount: 4, apiHealth: 99 }));
  }),
  // POST /api/vendors/toggle
  http.post('/api/vendors/toggle', async ({ request }) => {
    if (process.env.NODE_ENV !== 'test') await delay(300);
    const body = (await request.json()) as { connect?: boolean };
    const isConnecting = body.connect === true;
    return HttpResponse.json(wrapSuccess({ 
      status: isConnecting ? "connected" : "disconnected", 
      apiHealth: isConnecting ? 98 : 0 
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
      chassisSocket: "LGA-4677",
      cpuSocket: "LGA-4677",
      memoryChannels: "Validated",
      storageController: "Tri-Mode Supported",
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
];