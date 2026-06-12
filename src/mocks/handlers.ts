import { http, HttpResponse, delay } from 'msw';
import { MockCatalogApi, MockSnapshotApi, MockSolutionApi, MockTaxonomyApi } from '../lib/api-mock';
import { CatalogSKU, Config, Snapshot } from '../types';

function wrapSuccess<T>(data: T) {
  return {
    success: true,
    data,
    meta: {
      requestId: `req_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString()
    }
  };
}

export const handlers = [
  // GET /api/jobs/:id
  http.get('/api/jobs/:id', async ({ params }) => {
    await delay(600);
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
    await delay(600);
    const data = await MockCatalogApi.getCatalog();
    return HttpResponse.json(wrapSuccess(data));
  }),

  // POST /api/catalog
  http.post('/api/catalog', async ({ request }) => {
    await delay(600);
    const body = await request.json();
    const data = await MockCatalogApi.addCatalogSku(body as CatalogSKU);
    return HttpResponse.json(wrapSuccess(data));
  }),

  // PUT /api/catalog/:id
  http.put('/api/catalog/:id', async ({ request, params }) => {
    await delay(600);
    const body = await request.json();
    const data = await MockCatalogApi.updateCatalogSku(params.id as string, body as Partial<CatalogSKU>);
    return HttpResponse.json(wrapSuccess(data));
  }),

  // DELETE /api/catalog/:id
  http.delete('/api/catalog/:id', async ({ params }) => {
    await delay(600);
    await MockCatalogApi.deleteCatalogSku(params.id as string);
    return HttpResponse.json(wrapSuccess({}));
  }),

  // GET /api/snapshots
  http.get('/api/snapshots', async () => {
    await delay(600);
    const data = await MockSnapshotApi.getSnapshots();
    return HttpResponse.json(wrapSuccess(data));
  }),

  // POST /api/snapshots
  http.post('/api/snapshots', async ({ request }) => {
    await delay(600);
    const body = await request.json();
    const data = await MockSnapshotApi.addSnapshot(body as Snapshot);
    return HttpResponse.json(wrapSuccess(data));
  }),

  // DELETE /api/snapshots/:id
  http.delete('/api/snapshots/:id', async ({ params }) => {
    await delay(600);
    await MockSnapshotApi.deleteSnapshot(params.id as string);
    return HttpResponse.json(wrapSuccess({}));
  }),

  // GET /api/solution-builder/init
  http.get('/api/solution-builder/init', async () => {
    await delay(600);
    const data = await MockSolutionApi.getSolutionBuilderInit();
    return HttpResponse.json(wrapSuccess(data));
  }),

  // GET /api/taxonomy/graph/:id
  http.get('/api/taxonomy/graph/:id', async ({ params }) => {
    await delay(600);
    const mockConfig = { id: params.id, vendor: "HPE" } as unknown as Config;
    const res = await MockTaxonomyApi.getGraphForConfig(mockConfig, [], "HPE");
    return HttpResponse.json(wrapSuccess(res));
  }),

  // POST /api/portfolio/orchestrate
  http.post('/api/portfolio/orchestrate', async () => {
    await delay(800);
    return HttpResponse.json(wrapSuccess({ status: "accepted", job_id: "job-portfolio-sync" }));
  }),

  // POST /api/jobs
  http.post('/api/jobs', async () => {
    await delay(800);
    return HttpResponse.json(wrapSuccess({ status: "accepted", job_id: "job-mock-ingest-" + Date.now() }));
  }),

  // POST /api/portfolio/upload-manual
  http.post('/api/portfolio/upload-manual', async ({ request }) => {
    await delay(800);
    const b = (await request.json()) as any;
    return HttpResponse.json(wrapSuccess({ reconciliationStatus: b?.configsMatchedCount === 4 ? "complete" : "partial" }));
  }),

  // POST /api/boq/ingest
  http.post('/api/boq/ingest', async () => {
    await delay(800);
    return HttpResponse.json(wrapSuccess({ 
      ucid: "UCID-2026-NEW",
      configsCreated: 2,
      sourceFile: "mock-upload.xlsx",
      parsedSummary: {
        vendorBrand: "Consolidated",
        detectedChassis: "Multi-Node",
        initialConfidenceScore: 92
      },
      solutions: [
        {
          name: "Target Architecture A",
          vendorSubmissions: [
            { id: "mock-vs-1", vendor: "HPE", label: "Primary Spec", totalPrice: 150000, originalPrice: 162000, savings: 12000, complianceScore: 98, configs: [
              {
                id: "mock-cfg-1", name: "Mock Config", vendor: "HPE", totalPrice: 150000, originalPrice: 162000,
                items: [{ id: "m1", partNumber: 'P40411-B21', name: 'HPE ProLiant DL380 Gen11 8SFF Chassis', type: 'Chassis', quantity: 24, unitPrice: 3400 }]
              }
            ] }
          ]
        }
      ]
    }));
  }),

  // POST /api/reconciliation/compare
  http.post('/api/reconciliation/compare', async () => {
    await delay(800);
    return HttpResponse.json(wrapSuccess({
      boqItems: 24,
      bomItems: 24,
      matchRate: 100,
      anomalies: 0,
    }));
  }),

  // POST /api/vendors/sync
  http.post('/api/vendors/sync', async () => {
    await delay(800);
    return HttpResponse.json(wrapSuccess({ syncedCount: 4 }));
  }),

  // POST /api/agents/run
  http.post('/api/agents/run', async ({ request }) => {
    await delay(800);
    const b = (await request.json()) as any;
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

  // POST /api/taxonomy/check-constraints
  http.post('/api/taxonomy/check-constraints', async () => {
    await delay(800);
    return HttpResponse.json(wrapSuccess({
      chassisSocket: "LGA-4677",
      cpuSocket: "LGA-4677",
      memoryChannels: "Validated",
      storageController: "Tri-Mode Supported",
    }));
  }),

  // POST /api/taxonomy/map
  http.post('/api/taxonomy/map', async ({ request }) => {
    await delay(800);
    const b = (await request.json()) as any;
    await MockTaxonomyApi.mapOrphanNode({
      childId: b.childId as string,
      parentId: b.targetParentId as string,
      childInfo: b.properties as { partNumber: string; name: string }
    });
    return HttpResponse.json(wrapSuccess({}));
  }),

  // POST /api/taxonomy/rules
  http.post('/api/taxonomy/rules', async ({ request }) => {
    await delay(800);
    const b = (await request.json()) as any;
    await MockTaxonomyApi.addRule(b.sourceId as string, b.ruleType as "requires" | "exclusive", b.explanation as string);
    return HttpResponse.json(wrapSuccess({}));
  })
];
