import { http, HttpResponse, delay } from 'msw';
import { MockTaxonomyApi } from '../../lib/api-mock';
import { wrapSuccess } from './sharedState';

// Vendor portal actions, agent/automation dispatch, taxonomy rule mutations,
// and the remaining solutions/automation/integrations routes. Split out of
// workflowHandlers.ts (which covers job polling, catalog CRUD, and the BOQ
// intake/reconciliation pipeline) purely to keep both files under the
// project's 400-line limit -- there's no meaningful behavioral boundary
// between the two beyond "the first half" / "the second half" of the
// original file, so don't read too much into the domain split when adding
// new routes; put them wherever keeps both files reasonably sized.
export const vendorAgentHandlers = [
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

];
