import { http, HttpResponse, delay } from 'msw';
import { MockCatalogApi, MockSnapshotApi, MockSolutionApi, MockTaxonomyApi } from '../lib/api-mock';
import { CatalogSKU, Config, Snapshot } from '../types';
import { BOQ_PRESETS } from './boqMocks';

function wrapSuccess<T>(data: T) {
  const reqId = typeof window !== 'undefined' && window.crypto?.randomUUID 
    ? window.crypto.randomUUID() 
    : Math.random().toString(36).substring(7);
  return {
    success: true,
    data,
    meta: {
      requestId: `req_${reqId}`,
      timestamp: new Date().toISOString()
    }
  };
}

let memoryGraphNodes: any[] = [
  { id: "node-1", label: "HPE ProLiant DL380", type: "catalog_part", data: { partNumber: "P52532-B21", price: 2100 } },
  { id: "node-2", label: "Intel Xeon Silver", type: "catalog_part", data: { partNumber: "P49610-B21", price: 800 } },
  { id: "node-3", label: "Orphaned Memory Module", type: "scraped_orphan", status: "warning", data: { partNumber: "Unknown-MEM", confidenceScore: 40 } },
  { id: "node-4", label: "HPE 32GB DDR5", type: "catalog_part", data: { partNumber: "P43328-B21", price: 350 } },
];

let memoryGraphEdges: any[] = [
  { id: "edge-1", source: "node-1", target: "node-2", relationship: "requires", weight: 1.0 },
  { id: "edge-2", source: "node-1", target: "node-3", relationship: "requires", weight: 0.8, isAnimated: true },
  { id: "edge-3", source: "node-3", target: "node-4", relationship: "substitutes", weight: 0.95 },
];

export const handlers = [
  // GET /api/jobs/:id
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

  // GET /api/snapshots
  http.get('/api/snapshots', async () => {
    if (process.env.NODE_ENV !== 'test') await delay(600);
    const data = await MockSnapshotApi.getSnapshots();
    return HttpResponse.json(wrapSuccess(data));
  }),

  // POST /api/snapshots
  http.post('/api/snapshots', async ({ request }) => {
    if (process.env.NODE_ENV !== 'test') await delay(600);
    const body = await request.json();
    const data = await MockSnapshotApi.addSnapshot(body as Snapshot);
    return HttpResponse.json(wrapSuccess(data));
  }),

  // DELETE /api/snapshots/:id
  http.delete('/api/snapshots/:id', async ({ params }) => {
    if (process.env.NODE_ENV !== 'test') await delay(600);
    await MockSnapshotApi.deleteSnapshot(params.id as string);
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
    return HttpResponse.json(wrapSuccess({ status: "accepted", job_id: "job-mock-ingest-" + Date.now() }));
  }),

  // POST /api/pipeline/step
  http.post('/api/pipeline/step', async ({ request }) => {
    const body = (await request.json()) as any;
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
    const b = (await request.json()) as any;
    return HttpResponse.json(wrapSuccess({ reconciliationStatus: b?.configsMatchedCount === 4 ? "complete" : "partial" }));
  }),

  // POST /api/boq/ingest
  http.post('/api/boq/ingest', async ({ request }) => {
    if (process.env.NODE_ENV !== 'test') await delay(800);
    const body = (await request.json()) as any;
    const presetType = body?.presetType || "hpe-legacy";
    const preset = BOQ_PRESETS[presetType] || BOQ_PRESETS["hpe-legacy"];

    return HttpResponse.json(wrapSuccess({ 
      ucid: "UCID-2026-NEW",
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
    const body = (await request.json()) as any;
    const isConnecting = body.connect === true;
    return HttpResponse.json(wrapSuccess({ 
      status: isConnecting ? "connected" : "disconnected", 
      apiHealth: isConnecting ? 98 : 0 
    }));
  }),

  // POST /api/agents/run
  http.post('/api/agents/run', async ({ request }) => {
    if (process.env.NODE_ENV !== 'test') await delay(800);
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
    const body = (await request.json()) as any;
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
    if (process.env.NODE_ENV !== 'test') await delay(800);
    const b = (await request.json()) as any;
    await MockTaxonomyApi.addRule(b.sourceId as string, b.ruleType as "requires" | "exclusive", b.explanation as string);
    return HttpResponse.json(wrapSuccess({}));
  }),

  // POST /api/issues/auto-heal
  http.post('/api/issues/auto-heal', async ({ request }) => {
    if (process.env.NODE_ENV !== 'test') await delay(1200);
    const body = (await request.json()) as any;
    const { issueId, ucid } = body;
    
    // We mock the backend logic that calculates savings, re-prices, and maps components
    let updatedUcid = { ...ucid };
    let newRule = null;
    let newLearningEvent = null;
    let catalogUpdates: Record<string, any> = {};
    let toastMsg = "Issue resolved successfully.";

    if (issueId === "iss-1") {
      updatedUcid.solutions = updatedUcid.solutions.map((sol: any) => ({
        ...sol,
        vendorSubmissions: sol.vendorSubmissions?.map((vs: any) => ({
          ...vs,
          configs: vs.configs?.map((c: any) => {
            const items = c.items?.map((it: any) => it.partNumber === "815100-B21" ? { ...it, partNumber: "P40424-B21", name: "Intel Xeon Gold 6430 32-Core 2.1GHz Processor (Gen11) [REPLACED]", unitPrice: 2150 } : it);
            const sum = items?.reduce((a: number, b: any) => a + (b.unitPrice * b.quantity), 0);
            return { ...c, items, totalPrice: sum, savings: Math.max(0, c.originalPrice - sum) };
          })
        }))
      }));
      updatedUcid.events = [...updatedUcid.events, { ts: new Date().toLocaleTimeString(), level: "ok", msg: "Forensic System Repair: Replaced obsolete legacy HPE CPU (815100-B21) with supported factory Intel Gold 6430 (P40424-B21)." }];
      
      catalogUpdates["815100-B21"] = { status: "eol", name: "Intel Xeon Gold 6130 16-Core (Legacy Gen10) - EOL [REPLACED BY P40424-B21]" };
      catalogUpdates["P40424-B21"] = { name: "Intel Xeon Gold 6430 32-Core 2.1GHz Processor (Gen11) [ACTIVE REPLACEMENT]" };
      
      newRule = { id: `rule-${Date.now()}-eol`, ruleType: "substitution", partNumber: "815100-B21", mappedOutput: "P40424-B21", label: "Auto-Learned: Obsolete HPE CPU mapped to high compliance Intel Gold 6430", vendor: "HPE", status: "active", learnedAt: new Date().toISOString(), sourceIssueId: "iss-1", isAutoLearned: true };
      newLearningEvent = { id: `learn-${Date.now()}`, timestamp: new Date().toISOString(), sourceIssueId: "iss-1", ruleType: "substitution", partNumber: "815100-B21", action: "Obsolete HPE Intel Xeon Gold 6130 CPU (815100-B21) auto-substituted to Gen11 Gold 6430 (P40424-B21).", vendor: "HPE", confidenceScore: 96 };
      toastMsg = "HPE EOL CPU replaced & catalog replacement rule populated!";
    } else if (issueId === "iss-2") {
      updatedUcid.solutions = updatedUcid.solutions.map((sol: any) => ({
        ...sol,
        vendorSubmissions: sol.vendorSubmissions?.map((vs: any) => ({
          ...vs,
          configs: vs.configs?.map((c: any) => {
            const items = c.items?.map((it: any) => it.partNumber === "400-BPSB" ? { ...it, unitPrice: 1190, name: "Dell 3.84TB Enterprise NVMe SSD SFF [ALIGNED]" } : it);
            const sum = items?.reduce((a: number, b: any) => a + (b.unitPrice * b.quantity), 0);
            return { ...c, items, totalPrice: sum, savings: Math.max(0, c.originalPrice - sum) };
          })
        }))
      }));
      updatedUcid.events = [...updatedUcid.events, { ts: new Date().toLocaleTimeString(), level: "ok", msg: "Forensic System Repair: Corrected Dell Premier Drive mark-up overcharge. Aligned unit pricing to matched API partner contract rate of $1,190." }];
      
      catalogUpdates["400-BPSB"] = { price: 1190, name: "Dell 3.84TB Enterprise NVMe Read Intensive SSD SFF [CONTRACT LOCKED]", status: "active" };
      newRule = { id: `rule-${Date.now()}-price`, ruleType: "price_cap", partNumber: "400-BPSB", mappedOutput: "1190", label: "Auto-Learned: Contract target Cap rate overcharge protection locked at $1,190", vendor: "Dell", status: "active", learnedAt: new Date().toISOString(), sourceIssueId: "iss-2", isAutoLearned: true };
      newLearningEvent = { id: `learn-${Date.now()}`, timestamp: new Date().toISOString(), sourceIssueId: "iss-2", ruleType: "price_cap", partNumber: "400-BPSB", action: "Dell Premier portal markup detected: 400-BPSB quoted at $1,590 vs contract rate $1,190. Price cap rule locked to prevent future overcharge.", vendor: "Dell", confidenceScore: 99 };
      toastMsg = "Dell Quote pricing aligned & catalog contract price verified!";
    } else if (issueId === "iss-3") {
      updatedUcid.solutions = updatedUcid.solutions.map((sol: any) => ({
        ...sol,
        vendorSubmissions: sol.vendorSubmissions?.map((vs: any) => {
          if (vs.vendor !== "Cisco") return vs;
          return {
            ...vs,
            configs: vs.configs?.map((c: any) => {
              const items = c.items?.map((it: any) => it.type === "Memory" ? { ...it, quantity: 8, name: "Cisco 64GB DDR5 memory module [REBALANCED]" } : it);
              const sum = items?.reduce((a: number, b: any) => a + (b.unitPrice * b.quantity), 0);
              return { ...c, items, totalPrice: sum, savings: Math.max(0, c.originalPrice - sum) };
            })
          };
        })
      }));
      updatedUcid.events = [...updatedUcid.events, { ts: new Date().toLocaleTimeString(), level: "ok", msg: "Forensic System Repair: Balanced Cisco memory distribution to 8 dual-rank modules. Re-established symmetric motherboard 8-channel indexing." }];
      
      newRule = { id: `rule-${Date.now()}-sym`, ruleType: "symmetry", partNumber: "Memory", mappedOutput: "multiple_of_8", label: "Auto-Learned: Cisco UCS memory rebalanced to 8-channel socket layout symmetry", vendor: "Cisco", status: "active", learnedAt: new Date().toISOString(), sourceIssueId: "iss-3", isAutoLearned: true };
      newLearningEvent = { id: `learn-${Date.now()}`, timestamp: new Date().toISOString(), sourceIssueId: "iss-3", ruleType: "symmetry", partNumber: "Memory", action: "Cisco UCS C240 M7 memory asymmetry detected (5 modules). Auto-rebalanced to 8-channel DDR5 layout.", vendor: "Cisco", confidenceScore: 91 };
      toastMsg = "Cisco memory layout load-balanced for optimal motherboard symmetry!";
    } else if (issueId === "iss-4") {
      newRule = { id: `rule-${Date.now()}-api`, ruleType: "api_gateway", partNumber: "Juniper API", mappedOutput: "authorized_oauth_v1", label: "Auto-Learned: Restored security tokens and partner gateway synchronization", vendor: "Juniper", status: "active", learnedAt: new Date().toISOString(), sourceIssueId: "iss-4", isAutoLearned: true };
      newLearningEvent = { id: `learn-${Date.now()}`, timestamp: new Date().toISOString(), sourceIssueId: "iss-4", ruleType: "api_gateway", partNumber: "Juniper API", action: "Juniper Networks partner API OAuth token expired. Credentials re-authorized.", vendor: "Juniper", confidenceScore: 88 };
      toastMsg = "Juniper Networks partner API connected and authorized!";
    }

    return HttpResponse.json(wrapSuccess({ updatedUcid, newRule, newLearningEvent, catalogUpdates, toastMsg }));
  }),

  // GET /api/cleansing/entries
  http.get('/api/cleansing/entries', async () => {
    if (process.env.NODE_ENV !== 'test') await delay(600);
    const raws = [
      { raw: "32-Core CPU HPE Gen11", part: "P40424-B21", vendor: "HPE" },
      { raw: "Intel Xeon 6130 16-core legacy proc", part: "815100-B21", vendor: "HPE" },
      { raw: "dell 3.84tb nvme ssd sff", part: "400-BPSB", vendor: "Dell" },
      { raw: "Cisco UCS 64GB DDR5 memory dimm", part: "UCS-MR-64G1XS-E", vendor: "Cisco" },
      { raw: "8x2.5 HDD SAS drive cage", part: undefined, vendor: "HPE" },
      { raw: "Juniper QFX5120-48Y switch 1U", part: undefined, vendor: "Juniper" },
      { raw: "P40424B21", part: "P40424-B21", vendor: "HPE" },
      { raw: "400 BPSB 3.84TB", part: "400-BPSB", vendor: "Dell" },
      { raw: "Xeon Gold 6430 Processor", part: "P40424-B21", vendor: "HPE" },
      { raw: "HPE Gen 11 redundant power supply 800W", part: undefined, vendor: "HPE" },
      { raw: "Cisco 9300-24UX Switch", part: undefined, vendor: "Cisco" },
      { raw: "Dell PowerEdge RAID H755 controller", part: undefined, vendor: "Dell" },
    ];
    
    // Simplistic mock implementation for UI loading
    const entries = raws.map((r, idx) => {
      let status = "unmatched";
      let confidence = 45;
      if (r.part && idx % 2 !== 0) {
        status = "fuzzy";
        confidence = 85;
      } else if (r.part) {
        status = "matched";
        confidence = 98;
      } else {
        status = idx % 3 === 0 ? "quarantined" : "unmatched";
        confidence = 20;
      }

      return {
        id: `entry-${idx + 1}`,
        rawValue: r.raw,
        detectedPartNumber: r.part,
        normalizedName: r.part ? `Mocked Catalog Name for ${r.part}` : undefined,
        matchStatus: status,
        confidence,
        matchedSkuId: r.part ? `sku-${idx}` : undefined,
        matchedPartNumber: r.part,
        vendor: r.vendor,
        flagReason: status === "quarantined" ? "No SKU pattern detected — manual mapping required" : undefined,
      };
    });

    return HttpResponse.json(wrapSuccess(entries));
  }),

  // POST /api/cleansing/fuzzy-match
  http.post('/api/cleansing/fuzzy-match', async ({ request }) => {
    if (process.env.NODE_ENV !== 'test') await delay(1500);
    const body = (await request.json()) as any;
    const entries = body.entries || [];

    const mappedEntries = entries.map((e: any) => {
      if (e.matchStatus === "fuzzy" && e.confidence >= 70) {
        return { ...e, matchStatus: "matched", confidence: Math.min(e.confidence + 12, 99), reviewedAt: new Date().toISOString() };
      }
      if (e.matchStatus === "unmatched" && e.detectedPartNumber) {
        return {
          ...e,
          matchStatus: "fuzzy",
          matchedSkuId: `sku-${Date.now()}`,
          matchedPartNumber: e.detectedPartNumber,
          normalizedName: `Mocked Matched Name ${e.detectedPartNumber}`,
          confidence: 74,
        };
      }
      return e;
    });

    return HttpResponse.json(wrapSuccess({ entries: mappedEntries, resolvedCount: entries.filter((e: any) => e.matchStatus === "fuzzy").length }));
  }),

  // GET /api/telemetry/logs
  http.get('/api/telemetry/logs', async () => {
    if (process.env.NODE_ENV !== 'test') await delay(200);
    const endpoints = [
      { ep: "/api/boq/ingest", method: "POST" as const, code: 200 },
      { ep: "/api/taxonomy/check-constraints", method: "POST" as const, code: 200 },
      { ep: "/api/taxonomy/rules", method: "POST" as const, code: 201 },
      { ep: "/api/reconciliation/compare", method: "POST" as const, code: 200 },
      { ep: "/api/jobs", method: "POST" as const, code: 202 },
      { ep: "/api/jobs/j-1234", method: "GET" as const, code: 404 },
      { ep: "/api/vendor/playwright/run", method: "POST" as const, code: 500 },
      { ep: "/api/catalog/skus", method: "GET" as const, code: 200 },
    ];
    const data = endpoints.map((e, i) => ({
      id: `log-${i + 1}`,
      timestamp: new Date(Date.now() - (endpoints.length - i) * 45000).toISOString(),
      endpoint: e.ep,
      method: e.method,
      statusCode: e.code,
      durationMs: (i * 17 % 400) + 12,
      level: e.code >= 500 ? "error" : e.code >= 400 ? "warn" : e.code >= 200 && e.code < 300 ? "success" : "info",
      payload: e.method === "POST" ? `{ "ucid": "u1", "config_id": "cfg-${i}" }` : undefined,
    }));
    return HttpResponse.json(wrapSuccess(data));
  }),

  // GET /api/telemetry/webhooks
  http.get('/api/telemetry/webhooks', async () => {
    if (process.env.NODE_ENV !== 'test') await delay(200);
    const data = [
      { id: "wh-1", timestamp: new Date(Date.now() - 12000).toISOString(), event: "ucid.completed", source: "VSIP-Backend", hmacVerified: true, statusCode: 200, payload: '{ "ucid": "UCID-2026-1701", "status": "completed" }', retries: 0 },
      { id: "wh-2", timestamp: new Date(Date.now() - 55000).toISOString(), event: "bom.reconciled", source: "VSIP-Backend", hmacVerified: true, statusCode: 200, payload: '{ "sessionId": "rec-001", "discrepancies": 0 }', retries: 0 },
      { id: "wh-3", timestamp: new Date(Date.now() - 180000).toISOString(), event: "portal.playwright.failed", source: "Playwright-Agent", hmacVerified: false, statusCode: 401, payload: '{ "error": "HMAC mismatch" }', retries: 2 },
      { id: "wh-4", timestamp: new Date(Date.now() - 360000).toISOString(), event: "catalog.sku.updated", source: "VSIP-Backend", hmacVerified: true, statusCode: 200, payload: '{ "partNumber": "P40424-B21", "change": "eol_status" }', retries: 0 },
    ];
    return HttpResponse.json(wrapSuccess(data));
  }),

  // POST /api/taxonomy/simulate
  http.post('/api/taxonomy/simulate', async () => {
    if (process.env.NODE_ENV !== 'test') await delay(2000);
    return HttpResponse.json(wrapSuccess({ simulated: true }));
  }),

  // ======================================================================
  // KNOWLEDGE GRAPH ENDPOINTS (Phase 2)
  // ======================================================================

  // GET /api/graph/solution/:ucid
  http.get('/api/graph/solution/:ucid', async ({ params }) => {
    if (process.env.NODE_ENV !== 'test') await delay(600);
    return HttpResponse.json(wrapSuccess({
      metadata: { id: params.ucid as string, version: "v2" },
      nodes: memoryGraphNodes,
      edges: memoryGraphEdges,
      unmappedIds: memoryGraphNodes.filter(n => n.type === 'scraped_orphan').map(n => n.id)
    }));
  }),

  // POST /api/graph/nodes
  http.post('/api/graph/nodes', async ({ request }) => {
    if (process.env.NODE_ENV !== 'test') await delay(300);
    const body = (await request.json()) as any;
    const newNode = { ...body, id: `node-${Date.now()}` };
    memoryGraphNodes.push(newNode);
    return HttpResponse.json(wrapSuccess(newNode));
  }),

  // PUT /api/graph/nodes/:id
  http.put('/api/graph/nodes/:id', async ({ request, params }) => {
    if (process.env.NODE_ENV !== 'test') await delay(300);
    const body = (await request.json()) as any;
    const idx = memoryGraphNodes.findIndex(n => n.id === params.id);
    if (idx !== -1) {
      memoryGraphNodes[idx] = { ...memoryGraphNodes[idx], ...body };
      return HttpResponse.json(wrapSuccess(memoryGraphNodes[idx]));
    }
    return HttpResponse.json({ success: false, error: { message: "Node not found" } }, { status: 404 });
  }),

  // DELETE /api/graph/nodes/:id
  http.delete('/api/graph/nodes/:id', async ({ params }) => {
    if (process.env.NODE_ENV !== 'test') await delay(300);
    const nodeId = params.id as string;
    memoryGraphNodes = memoryGraphNodes.filter(n => n.id !== nodeId);
    // Cascade delete connected edges
    memoryGraphEdges = memoryGraphEdges.filter(e => e.source !== nodeId && e.target !== nodeId);
    return HttpResponse.json(wrapSuccess({ success: true }));
  }),

  // POST /api/graph/edges
  http.post('/api/graph/edges', async ({ request }) => {
    if (process.env.NODE_ENV !== 'test') await delay(300);
    const body = (await request.json()) as any;
    const newEdge = { ...body, id: `edge-${Date.now()}` };
    memoryGraphEdges.push(newEdge);
    return HttpResponse.json(wrapSuccess(newEdge));
  }),

  // DELETE /api/graph/edges/:id
  http.delete('/api/graph/edges/:id', async ({ params }) => {
    if (process.env.NODE_ENV !== 'test') await delay(300);
    memoryGraphEdges = memoryGraphEdges.filter(e => e.id !== params.id);
    return HttpResponse.json(wrapSuccess({ success: true }));
  }),

  // POST /api/graph/algorithms/alternative-paths
  http.post('/api/graph/algorithms/alternative-paths', async ({ request }) => {
    if (process.env.NODE_ENV !== 'test') await delay(1200);
    const body = (await request.json()) as any;
    const paths = [
      {
        pathId: "path-alpha",
        rank: 1,
        totalCost: 1500,
        confidence: 98,
        nodesInvolved: ["node-1", "node-4"],
        edgesInvolved: ["edge-1"]
      },
      {
        pathId: "path-beta",
        rank: 2,
        totalCost: 1200,
        confidence: 85,
        nodesInvolved: ["node-1", "node-5"],
        edgesInvolved: ["edge-4"]
      }
    ];
    return HttpResponse.json(wrapSuccess({ paths }));
  }),

  // PUT /api/graph/edge/:edgeId
  http.put('/api/graph/edge/:edgeId', async ({ request, params }) => {
    if (process.env.NODE_ENV !== 'test') await delay(500);
    const body = (await request.json()) as any;
    return HttpResponse.json(wrapSuccess({ success: true, updatedWeight: body.weight }));
  }),

  // POST /api/graph/path-selection
  http.post('/api/graph/path-selection', async ({ request }) => {
    if (process.env.NODE_ENV !== 'test') await delay(800);
    const body = (await request.json()) as any;
    return HttpResponse.json(wrapSuccess({ success: true, confirmedSelection: body.selectedPathId }));
  })
];
