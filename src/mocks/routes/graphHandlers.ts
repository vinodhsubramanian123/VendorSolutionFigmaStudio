import { http, HttpResponse, delay } from 'msw';
import { CatalogSKU, Config, Solution, VendorSubmission, BOMItem, SourcingRule, LearningEvent, UCID } from '../../types';
import { CleansingEntry } from '../../components/cleansing/types';
import { makeMockApiLogs, makeMockWebhooks } from '../../components/telemetry/telemetryUtils';
import { wrapSuccess } from './sharedState';
import { CLEANSING_SEED_ROWS } from '../cleansingSeedData';
export const graphHandlers = [
  http.post('/api/forensics/align', async ({ request }) => {
    if (process.env.NODE_ENV !== 'test') await delay(1200);
    const body = await request.json() as { issueId: string; ucid: UCID };
    const { issueId, ucid } = body;
    
    // We mock the backend logic that calculates savings, re-prices, and maps components
    const updatedUcid: UCID = { ...ucid };
    let newRule: SourcingRule | null = null;
    let newLearningEvent: LearningEvent | null = null;
    const catalogUpdates: Record<string, Partial<CatalogSKU>> = {};
    let toastMsg = "Issue resolved successfully.";
    if (issueId === "iss-1") {
      updatedUcid.solutions = updatedUcid.solutions.map((sol: Solution) => ({
        ...sol,
        vendorSubmissions: sol.vendorSubmissions?.map((vs: VendorSubmission) => ({
          ...vs,
          configs: vs.configs?.map((c: Config) => {
            const items = c.items?.map((it: BOMItem) => it.partNumber === "815100-B21" ? { ...it, partNumber: "P40424-B21", name: "Intel Xeon Gold 6430 32-Core 2.1GHz Processor (Gen11) [REPLACED]", unitPrice: 2150 } : it);
            const sum = items?.reduce((a: number, b: BOMItem) => a + (b.unitPrice * b.quantity), 0) ?? 0;
            return { ...c, items, totalPrice: sum, savings: Math.max(0, c.originalPrice - sum) };
          })
        }))
      }));
      updatedUcid.events = [...updatedUcid.events, { timestamp: new Date().toISOString(), level: "ok", msg: "Forensic System Repair: Replaced obsolete legacy HPE CPU (815100-B21) with supported factory Intel Gold 6430 (P40424-B21)." }];
      
      catalogUpdates["815100-B21"] = { status: "eol", name: "Intel Xeon Gold 6130 16-Core (Legacy Gen10) - EOL [REPLACED BY P40424-B21]" };
      catalogUpdates["P40424-B21"] = { name: "Intel Xeon Gold 6430 32-Core 2.1GHz Processor (Gen11) [ACTIVE REPLACEMENT]" };
      
      newRule = { id: `rule-${crypto.randomUUID()}-eol`, ruleType: "substitution", partNumber: "815100-B21", mappedOutput: "P40424-B21", label: "Auto-Learned: Obsolete HPE CPU mapped to high compliance Intel Gold 6430", vendor: "HPE", status: "active", learnedAt: new Date().toISOString(), sourceIssueId: "iss-1", isAutoLearned: true };
      newLearningEvent = { id: `learn-${crypto.randomUUID()}`, timestamp: new Date().toISOString(), sourceIssueId: "iss-1", ruleType: "substitution", partNumber: "815100-B21", action: "Obsolete HPE Intel Xeon Gold 6130 CPU (815100-B21) auto-substituted to Gen11 Gold 6430 (P40424-B21).", vendor: "HPE", confidenceScore: 96, preventedMismatchCount: 0 };
      toastMsg = "HPE EOL CPU replaced & catalog replacement rule populated!";
    } else if (issueId === "iss-2") {
      updatedUcid.solutions = updatedUcid.solutions.map((sol: Solution) => ({
        ...sol,
        vendorSubmissions: sol.vendorSubmissions?.map((vs: VendorSubmission) => ({
          ...vs,
          configs: vs.configs?.map((c: Config) => {
            const items = c.items?.map((it: BOMItem) => it.partNumber === "400-BPSB" ? { ...it, unitPrice: 1190, name: "Dell 3.84TB Enterprise NVMe SSD SFF [ALIGNED]" } : it);
            const sum = items?.reduce((a: number, b: BOMItem) => a + (b.unitPrice * b.quantity), 0) ?? 0;
            return { ...c, items, totalPrice: sum, savings: Math.max(0, c.originalPrice - sum) };
          })
        }))
      }));
      updatedUcid.events = [...updatedUcid.events, { timestamp: new Date().toISOString(), level: "ok", msg: "Forensic System Repair: Corrected Dell Premier Drive mark-up overcharge. Aligned unit pricing to matched API partner contract rate of $1,190." }];
      
      catalogUpdates["400-BPSB"] = { price: 1190, name: "Dell 3.84TB Enterprise NVMe Read Intensive SSD SFF [CONTRACT LOCKED]", status: "active" };
      newRule = { id: `rule-${crypto.randomUUID()}-price`, ruleType: "price_cap", partNumber: "400-BPSB", mappedOutput: "1190", label: "Auto-Learned: Contract target Cap rate overcharge protection locked at $1,190", vendor: "Dell", status: "active", learnedAt: new Date().toISOString(), sourceIssueId: "iss-2", isAutoLearned: true };
      newLearningEvent = { id: `learn-${crypto.randomUUID()}`, timestamp: new Date().toISOString(), sourceIssueId: "iss-2", ruleType: "price_cap", partNumber: "400-BPSB", action: "Dell Premier portal markup detected: 400-BPSB quoted at $1,590 vs contract rate $1,190. Price cap rule locked to prevent future overcharge.", vendor: "Dell", confidenceScore: 99, preventedMismatchCount: 0 };
      toastMsg = "Dell Quote pricing aligned & catalog contract price verified!";
    } else if (issueId === "iss-3") {
      updatedUcid.solutions = updatedUcid.solutions.map((sol: Solution) => ({
        ...sol,
        vendorSubmissions: sol.vendorSubmissions?.map((vs: VendorSubmission) => {
          if (vs.vendor !== "Cisco") return vs;
          return {
            ...vs,
            configs: vs.configs?.map((c: Config) => {
              const items = c.items?.map((it: BOMItem) => it.type === "Memory" ? { ...it, quantity: 8, name: "Cisco 64GB DDR5 memory module [REBALANCED]" } : it);
              const sum = items?.reduce((a: number, b: BOMItem) => a + (b.unitPrice * b.quantity), 0) ?? 0;
              return { ...c, items, totalPrice: sum, savings: Math.max(0, c.originalPrice - sum) };
            })
          };
        })
      }));
      updatedUcid.events = [...updatedUcid.events, { timestamp: new Date().toISOString(), level: "ok", msg: "Forensic System Repair: Balanced Cisco memory distribution to 8 dual-rank modules. Re-established symmetric motherboard 8-channel indexing." }];
      
      newRule = { id: `rule-${crypto.randomUUID()}-sym`, ruleType: "symmetry", partNumber: "Memory", mappedOutput: "multiple_of_8", label: "Auto-Learned: Cisco UCS memory rebalanced to 8-channel socket layout symmetry", vendor: "Cisco", status: "active", learnedAt: new Date().toISOString(), sourceIssueId: "iss-3", isAutoLearned: true };
      newLearningEvent = { id: `learn-${crypto.randomUUID()}`, timestamp: new Date().toISOString(), sourceIssueId: "iss-3", ruleType: "symmetry", partNumber: "Memory", action: "Cisco UCS C240 M7 memory asymmetry detected (5 modules). Auto-rebalanced to 8-channel DDR5 layout.", vendor: "Cisco", confidenceScore: 91, preventedMismatchCount: 0 };
      toastMsg = "Cisco memory layout load-balanced for optimal motherboard symmetry!";
    } else if (issueId === "iss-4") {
      newRule = { id: `rule-${crypto.randomUUID()}-api`, ruleType: "api_gateway", partNumber: "Juniper API", mappedOutput: "authorized_oauth_v1", label: "Auto-Learned: Restored security tokens and partner gateway synchronization", vendor: "Juniper", status: "active", learnedAt: new Date().toISOString(), sourceIssueId: "iss-4", isAutoLearned: true };
      newLearningEvent = { id: `learn-${crypto.randomUUID()}`, timestamp: new Date().toISOString(), sourceIssueId: "iss-4", ruleType: "api_gateway", partNumber: "Juniper API", action: "Juniper Networks partner API OAuth token expired. Credentials re-authorized.", vendor: "Juniper", confidenceScore: 88, preventedMismatchCount: 0 };
      toastMsg = "Juniper Networks partner API connected and authorized!";
    }
    return HttpResponse.json(wrapSuccess({ updatedUcid, newRule, newLearningEvent, catalogUpdates, toastMsg }));
  }),
  // GET /api/cleansing/entries
  http.get('/api/cleansing/entries', async () => {
    if (process.env.NODE_ENV !== 'test') await delay(600);
    const raws = CLEANSING_SEED_ROWS;
    
    // Simplistic mock implementation for UI loading
    const entries = raws.map((r, idx) => {
      let status;
      let confidence;
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
    const body = (await request.json()) as { entries?: CleansingEntry[] };
    const entries = body.entries || [];
    const mappedEntries = entries.map((e: CleansingEntry) => {
      if (e.matchStatus === "fuzzy" && e.confidence >= 70) {
        return { ...e, matchStatus: "matched", confidence: Math.min(e.confidence + 12, 99), reviewedAt: new Date().toISOString() };
      }
      if (e.matchStatus === "unmatched" && e.detectedPartNumber) {
        return {
          ...e,
          matchStatus: "fuzzy",
          matchedSkuId: `sku-${crypto.randomUUID()}`,
          matchedPartNumber: e.detectedPartNumber,
          normalizedName: `Mocked Matched Name ${e.detectedPartNumber}`,
          confidence: 74,
        };
      }
      return e;
    });
    return HttpResponse.json(wrapSuccess({ entries: mappedEntries, resolvedCount: entries.filter((e: CleansingEntry) => e.matchStatus === "fuzzy").length }));
  }),
  // GET /api/telemetry/logs
  http.get('/api/telemetry/logs', async () => {
    if (process.env.NODE_ENV !== 'test') await delay(200);
    const data = makeMockApiLogs();
    return HttpResponse.json(wrapSuccess(data));
  }),
  // GET /api/telemetry/webhooks
  http.get('/api/telemetry/webhooks', async () => {
    if (process.env.NODE_ENV !== 'test') await delay(200);
    const data = makeMockWebhooks();
    return HttpResponse.json(wrapSuccess(data));
  }),
  // POST /api/taxonomy/simulate
  http.post('/api/taxonomy/simulate', async () => {
    if (process.env.NODE_ENV !== 'test') await delay(2000);
    return HttpResponse.json(wrapSuccess({ simulated: true }));
  }),
  // ======================================================================
  // KNOWLEDGE GRAPH ENDPOINTS
  // ======================================================================
  // NOTE: GET /api/graph/solution/:ucid and the node/edge CRUD routes that
  // used to live here were removed in Phase 4 of the data-ownership cleanup
  // (see docs/architecture/data-ownership.md). The taxonomy graph now
  // derives client-side from the selected config's real BOM items
  // cross-referenced against coreStore.catalogSkus (see
  // deriveGraphFromConfig in src/hooks/useCatalogGraphData.ts), with a
  // local overlay for manual node/edge edits. The old version always
  // returned the same 5 hardcoded nodes regardless of which UCID/config was
  // selected (the :ucid param was never read), and orphan-mapping only
  // patched a disconnected in-memory array that never touched the real
  // catalog. What's left below (alternative-paths / path-selection) is
  // genuinely algorithmic and stays network-backed.
  // POST /api/graph/algorithms/alternative-paths
  http.post('/api/graph/algorithms/alternative-paths', async ({ request }) => {
    if (process.env.NODE_ENV !== 'test') await delay(1200);
    
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
    const body = (await request.json()) as { weight: number };
    return HttpResponse.json(wrapSuccess({ success: true, updatedWeight: body.weight }));
  }),
  // POST /api/graph/path-selection
  http.post('/api/graph/path-selection', async ({ request }) => {
    if (process.env.NODE_ENV !== 'test') await delay(800);
    const body = (await request.json()) as { selectedPathId: string };
    return HttpResponse.json(wrapSuccess({ success: true, confirmedSelection: body.selectedPathId }));
  })
];