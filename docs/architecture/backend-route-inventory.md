# Backend Route Inventory — server.ts vs MSW vs apiClient callers

**Status: definitive as of this audit.** This document exists because Phase 3b's
original "10 collisions" framing understated the real gap: those 10 were only
the routes that exist in *both* `server.ts` and MSW. This doc is the full,
exhaustive cross-reference of all three layers — real backend, mock backend,
and every call site — so future sessions (human or Antigravity) never have to
re-derive this from scratch.

**Methodology:** every route was found by grepping `server.ts` and every file
under `src/mocks/` (including `routes/*.ts`) directly for route registrations,
not by trusting prior documentation. Every call site was found by grepping for
every method `apiClient` exposes — `get`, `post`, `put`, `patch`, `delete`,
`postForm`, plus apiClient's own named wrapper methods (`getGraphSolution`,
`createGraphNode`, etc.) — since a plain grep for `apiClient.post(` misses
calls where a generic type argument spans multiple lines, and misses the
wrapper methods entirely since their callers never type "post" at all. Payload
shapes were spot-checked against the actual Zod schema or manual destructure
server.ts uses, not assumed from naming.

---

## A. server.ts — the complete list of real production routes (13 total)

| Method | Route | Notes |
|---|---|---|
| GET | `/api/health` | |
| POST | `/api/boq/ingest` | `validateBody(IngestRequestSchema)` |
| POST | `/api/reconciliation/compare` | `validateBody(ReconciliationRequestSchema)` |
| POST | `/api/taxonomy/check-constraints` | `validateBody(ConstraintCheckRequestSchema)` |
| POST | `/api/integrations/dispatch` | `validateBody(WebhookDispatchRequestSchema)` |
| POST | `/api/agents/run` | `validateBody(PlaywrightRunRequestSchema)` |
| POST | `/api/portfolio/orchestrate` | `validateBody(PortfolioOrchestrateRequestSchema)` |
| POST | `/api/portfolio/upload-manual` | `validateBody(PortfolioManualUploadRequestSchema)` |
| POST | `/api/ucids/:unit/snapshots` | Manual destructure, `const { snapshot } = req.body` — **no Zod schema**, 400s if `snapshot` key missing |
| POST | `/api/vendor/portal` | Generic `{vendor, action}` dispatcher — **no client code calls this path** (see Anomaly 1) |
| POST | `/api/jobs` | **No `validateBody()` at all** — accepts any `{type, context, parent_job_id}` |
| GET | `/api/jobs/:job_id` | Generic progress simulator (+25/poll), `result` is always `{success: true}` regardless of job `type` |
| GET | `/api/jobs/:job_id/children` | Always returns `[]`. No caller anywhere in the app. |

That's the entire real backend. **Everything else the app does over HTTP hits
a route that only exists in MSW.**

---

## B. Full MSW route inventory, classified

Every route MSW implements, marked **REAL** (also in server.ts, table A) or
**MSW-ONLY** (no server.ts equivalent — will 404 in production today).

| Method | Route | Classification |
|---|---|---|
| POST | `/api/boq/ingest` | REAL |
| POST | `/api/reconciliation/compare` | REAL |
| POST | `/api/taxonomy/check-constraints` | REAL |
| POST | `/api/integrations/dispatch` | REAL |
| POST | `/api/agents/run` | REAL |
| POST | `/api/portfolio/orchestrate` | REAL |
| POST | `/api/portfolio/upload-manual` | REAL |
| POST | `/api/ucids/:ucid/snapshots` | REAL (POST only) |
| POST | `/api/jobs` | REAL |
| GET | `/api/jobs/:id` | REAL |
| GET | `/api/catalog` | **MSW-ONLY** |
| POST | `/api/catalog` | **MSW-ONLY** |
| PUT | `/api/catalog/:id` | **MSW-ONLY** |
| DELETE | `/api/catalog/:id` | **MSW-ONLY** |
| GET | `/api/ucids/:ucid/snapshots` | **MSW-ONLY** (read side of snapshots has no real route) |
| PATCH | `/api/ucids/:ucid/snapshots/:snapshotId/lock` | **MSW-ONLY** |
| DELETE | `/api/ucids/:ucid/snapshots/:snapshotId` | **MSW-ONLY** |
| GET | `/api/solution-builder/init` | **MSW-ONLY** |
| GET | `/api/solutions` | **MSW-ONLY** |
| POST | `/api/solutions` | **MSW-ONLY** |
| PATCH | `/api/solutions/:id/status` | **MSW-ONLY** |
| POST | `/api/solutions/:id/vendor-assignments` | **MSW-ONLY** |
| GET | `/api/taxonomy/graph/:id` | **MSW-ONLY** |
| POST | `/api/taxonomy/map` | **MSW-ONLY** |
| POST | `/api/taxonomy/simulate` | **MSW-ONLY** |
| POST | `/api/taxonomy/rules` | **MSW-ONLY** |
| POST | `/api/agents/semantic-map` | **MSW-ONLY** |
| POST | `/api/agents/parse-advice-file` | **MSW-ONLY** |
| GET | `/api/cleansing/entries` | **MSW-ONLY** |
| POST | `/api/cleansing/fuzzy-match` | **MSW-ONLY** |
| POST | `/api/forensics/align` | **MSW-ONLY** — this is the actual auto-heal mutation endpoint |
| GET | `/api/telemetry/logs` | **MSW-ONLY** |
| GET | `/api/telemetry/webhooks` | **MSW-ONLY** |
| POST | `/api/vendors/sync` | **MSW-ONLY** — see Anomaly 1 |
| POST | `/api/vendors/toggle` | **MSW-ONLY** — see Anomaly 1 |
| POST | `/api/pipeline/step` | **MSW-ONLY** |
| GET | `/api/automation/jobs/:jobId` | **MSW-ONLY**, no caller found anywhere in `src/` — likely dead |
| POST | `/api/automation/jobs` | **MSW-ONLY**, no caller found anywhere in `src/` — likely dead |
| POST | `/api/graph/algorithms/alternative-paths` | **MSW-ONLY** |
| POST | `/api/graph/path-selection` | **MSW-ONLY** |
| PUT | `/api/graph/edge/:edgeId` | **MSW-ONLY**, and also **no caller** — see Anomaly 2 |

**41 MSW routes. 10 are REAL. 31 are MSW-ONLY.**

---

## C. apiClient.ts's internal wrapper methods

Beyond the 5 generic verbs, `apiClient.ts` defines named convenience methods
that wrap `this.get/post/put/delete` with a hardcoded route baked in. A plain
grep for `apiClient.post(` in calling code will never find these — the caller
just writes `apiClient.updateGraphEdge(...)`.

| Method | Route it calls | Live callers? | Status |
|---|---|---|---|
| `getGraphSolution` | `GET /api/graph/solution/:ucid` | **None** | Dead code — route removed in Phase 4, no caller left |
| `createGraphNode` | `POST /api/taxonomy/nodes` | **None** | Dead code |
| `updateGraphNode` | `PUT /api/taxonomy/nodes/:id` | **None** | Dead code |
| `deleteGraphNode` | `DELETE /api/taxonomy/nodes/:id` | **None** | Dead code |
| `createGraphEdge` | `POST /api/taxonomy/edges` | **None** | Dead code |
| `deleteGraphEdge` | `DELETE /api/taxonomy/edges/:id` | **None** | Dead code |
| `updateGraphEdge` | `PUT /api/taxonomy/edges/:edgeId` | **`EdgeEditorPanel.tsx:35`** | **Live call to a fully dead route** — see Anomaly 2 |
| `getGraphAlternativePaths` | `POST /api/graph/algorithms/alternative-paths` | `useCatalogGraphData.ts:258` | Live, route is MSW-ONLY |
| `commitGraphPathSelection` | `POST /api/graph/path-selection` | `useCatalogGraphData.ts:272` | Live, route is MSW-ONLY |

`graphHandlers.ts` (MSW) contains an explicit comment confirming the node/edge
CRUD routes were intentionally removed in Phase 4 — the taxonomy graph now
derives client-side from `coreStore.catalogSkus` via `deriveGraphFromConfig`,
with a local overlay (`useCatalogGraphData.ts`'s `addGraphNode`,
`updateGraphNode`, `deleteGraphNode`, `addGraphEdge`, `deleteGraphEdge` —
note: same names, different implementation, pure client-side state, zero
network calls) for manual edits.

**The migration to client-side overlay editing was done for every graph
mutation except edge-weight updates.** `EdgeEditorPanel.tsx` still calls the
old network method for that one operation, and the route it hits no longer
exists in MSW *or* server.ts — this is broken in every environment, including
local dev, not just production. See Anomaly 2 for the fix.

---

## D. Every live apiClient call site, classified

39 live call sites (35 via the 5 generic verbs + 1 `postForm` + 3 via named
wrapper methods). ✅ = already validated via `parseResponse` (3, from earlier
patches this session).

| # | File | Route | Classification | Notes |
|---|---|---|---|---|
| 1 | `CatalogManager.tsx:140` | `PUT /api/catalog/:id` | MSW-ONLY | |
| 2 | `CatalogManager.tsx:158` | `POST /api/catalog` | MSW-ONLY | |
| 3 | `CatalogManager.tsx:168` | `DELETE /api/catalog/:id` | MSW-ONLY | |
| 4 | `WebhookMonitor.tsx:25` | `POST /api/jobs` | REAL | Fire-and-forget test utility, response discarded, benign |
| 5 | `SystemTelemetry.tsx:26` | `GET /api/telemetry/logs` | MSW-ONLY | |
| 6 | `SystemTelemetry.tsx:29` | `GET /api/telemetry/webhooks` | MSW-ONLY | |
| 7 | `DocumentPipelinePanel.tsx:38` | `POST /api/pipeline/step` | MSW-ONLY | |
| 8 | ~~`PipelineView.tsx:32`~~ | ~~`POST /api/pipeline/step`~~ | RESOLVED | Was flagged here as "Duplicate caller of #7" but never acted on. Confirmed via `git log` + diff that `PipelineView.tsx` was a stale, fully-orphaned predecessor of `DocumentPipelinePanel.tsx` (zero imports, same logic, missing a11y improvements). Its unique test coverage (invalid-file rejection, valid-file processing, 500-error fallback) was ported into `DocumentPipelinePanel.test.tsx` before deletion; both `PipelineView.tsx` and `PipelineView.test.tsx` removed. `ApiLogsView.tsx` (same pattern, no test file) removed alongside it. |
| 9 | `ReconciliationOverview.tsx:70` | `POST /api/jobs` | REAL | Clean, traced in Phase 3b B3 |
| 10 | `useSnapshotManagerLogic.ts:48` | `POST /api/ucids/:id/snapshots` | REAL | **Fixed, patch 0006** |
| 11 | `useSnapshotManagerLogic.ts:107` | `DELETE /api/ucids/:id/snapshots/:id` | MSW-ONLY | |
| 12 | `useMissionControlWorkflow.ts:33` | `POST /api/jobs` | REAL | Clean, traced in Phase 3b B3 |
| 13 | `useMissionControlWorkflow.ts:198` | `POST /api/ucids/:id/snapshots` | REAL | Clean — correct `{snapshot}` wrapper already |
| 14 | `StepBoqIntake.tsx:38` | `POST /api/boq/ingest` | REAL | Clean — `presetType` is a typed union parameter, not a widened `string` |
| 15 | `StepVendorProvisioning.tsx:27` | `POST /api/vendors/sync` | MSW-ONLY | See Anomaly 1 |
| 16 | `useCleansingState.ts:64` | `GET /api/cleansing/entries` | MSW-ONLY | |
| 17 | `useCleansingState.ts:77` | `POST /api/cleansing/fuzzy-match` | MSW-ONLY | |
| 18 | `CleansingView.tsx:103` | `POST /api/taxonomy/rules` | MSW-ONLY | |
| 19 | `useBoqIntake.ts:134` | `POST /api/jobs` | REAL | **Fixed, patch 0001** |
| 20 | `useBoqIntake.ts:149` | `POST /api/boq/ingest` | REAL | **Fixed, patch 0001** |
| 21 | `useBomConversion.ts:57` | `POST /api/taxonomy/check-constraints` | REAL | ✅ Already validated |
| 22 | `useBomConversion.ts:68` | `POST /api/reconciliation/compare` | REAL | ✅ Already validated |
| 23 | `useBomConversion.ts:166` | `POST /api/reconciliation/compare` | REAL | **Fixed request shape, patch 0003.** Response still unvalidated but is discarded — low priority |
| 24 | `usePortfolioComparison.ts:41` | `POST /api/portfolio/orchestrate` | REAL | **Fixed, patch 0004** |
| 25 | `usePortfolioComparison.ts:64` | `POST /api/portfolio/upload-manual` | REAL | Clean |
| 26 | `VendorPortal.tsx:42` | `POST /api/vendors/toggle` | MSW-ONLY | See Anomaly 1 |
| 27 | `VendorPortal.tsx:71` | `POST /api/vendors/sync` | MSW-ONLY | See Anomaly 1 |
| 28 | `VendorIngestionDesk.tsx:112` | `POST /api/agents/run` | REAL | ✅ Already validated |
| 29 | `useStepIntakeLogic.ts:52` | `POST /api/boq/ingest` | REAL | Clean — hardcoded valid literal |
| 30 | `useForensicAutoHeal.ts` (jobs call) | `POST /api/jobs` | REAL | **Fixed, patch 0005** |
| 31 | `useForensicAutoHeal.ts:203` | `POST /api/forensics/align` | MSW-ONLY | This is the actual auto-heal mutation — response is consumed directly into state with zero validation |
| 32 | `SourcingRulesVault.tsx:48` | `POST /api/taxonomy/rules` | MSW-ONLY | |
| 33 | `SourcingRulesVault.tsx:94` | `POST /api/taxonomy/simulate` | MSW-ONLY | |
| 34 | `NLPParser.tsx:48` | `POST /api/agents/semantic-map` | MSW-ONLY | |
| 35 | `NLPParser.tsx:142` | `POST /api/taxonomy/rules` | MSW-ONLY | |
| 36 | `TaxonomyGraphSidebar.tsx:79` | `POST /api/taxonomy/check-constraints` | REAL | Clean |
| 37 | `AdviceFileIngestion.tsx:74` | `POST /api/agents/parse-advice-file` (via `postForm`) | MSW-ONLY | |
| 38 | `EdgeEditorPanel.tsx:35` | `PUT /api/taxonomy/edges/:id` (via `apiClient.updateGraphEdge`) | **FULLY DEAD** | Not in MSW *or* server.ts — see Anomaly 2 |
| 39 | `useCatalogGraphData.ts:258` | `POST /api/graph/algorithms/alternative-paths` (via `apiClient.getGraphAlternativePaths`) | MSW-ONLY | |
| 40 | `useCatalogGraphData.ts:272` | `POST /api/graph/path-selection` (via `apiClient.commitGraphPathSelection`) | MSW-ONLY | |

**Tally: 15 REAL (12 clean/fixed + 3 already-validated), 23 MSW-ONLY, 1 FULLY DEAD, 1 duplicate.**

---

## E. Named anomalies requiring a decision

### Anomaly 1 — Vendor route naming mismatch
`server.ts` implements a single generic dispatcher: `POST /api/vendor/portal`
taking `{vendor, action}` and branching on `action` server-side. The client
never calls this path. Instead, two components call two separate,
differently-named paths that don't exist on the real server at all:
`StepVendorProvisioning.tsx` → `POST /api/vendors/sync`, and `VendorPortal.tsx`
→ `POST /api/vendors/sync` and `POST /api/vendors/toggle`. Note also the
singular/plural mismatch (`vendor` vs `vendors`). This almost certainly should
resolve to the client calling `/api/vendor/portal` with
`{vendor, action: "sync" | "toggle"}` instead of two separate endpoints, but
that changes response shape expectations on both call sites — **this needs an
explicit decision, not a mechanical fix**, since it affects request AND
response contracts on two live features.

### Anomaly 2 — EdgeEditorPanel.tsx calls a route that exists nowhere
Every other graph mutation (add/update/delete node, add/delete edge) was
migrated to the client-side overlay pattern in Phase 4. Edge **weight**
updates were missed — `EdgeEditorPanel.tsx` still calls
`apiClient.updateGraphEdge()`, which hits `PUT /api/taxonomy/edges/:edgeId`.
That route isn't in MSW (removed in Phase 4) and was never in server.ts.
**This feature is broken in every environment today, including local dev** —
this isn't a "will break when MSW is removed" risk like everything else in
this document, it's already broken. Recommended fix: add an `updateGraphEdge`
function to `useCatalogGraphData.ts`'s local overlay (mirroring
`addGraphEdge`/`deleteGraphEdge`'s pattern exactly) and wire
`EdgeEditorPanel.tsx` to that instead of the dead network call.

### Anomaly 3 — 6 fully dead apiClient wrapper methods
`getGraphSolution`, `createGraphNode`, `updateGraphNode`, `deleteGraphNode`,
`createGraphEdge`, `deleteGraphEdge` (all defined directly on `apiClient`,
distinct from the same-named functions in `useCatalogGraphData.ts`) have zero
callers anywhere in `src/`. Pure leftover cruft from the Phase 4 migration.
Recommend deleting them from `apiClient.ts` — dead code pointing at
intentionally-removed routes is exactly the kind of thing that causes a future
session to waste time re-investigating something already settled.

### Anomaly 4 — `/api/integrations/dispatch` has no real caller
Fully implemented in both `server.ts` and MSW, matching schemas confirmed
clean in Phase 3b B4. But no UI feature in the app actually dispatches a
webhook — its only exerciser is a dedicated contract test
(`MSWContracts.test.ts`). Not a bug, just a completeness gap: the backend
exists for a feature the frontend never built.

---

## F. What this means for Phase 6 (parseResponse rollout)

Of the 32 previously-uncounted-as-"already fixed" call sites, only these hit
**REAL** routes and are worth `parseResponse`-hardening now — the rest would
be validating against a route that doesn't exist in production, which gives
false confidence rather than real safety:

- `useSnapshotManagerLogic.ts:48` (already fixed shape, patch 0006 — response validation still open)
- `useMissionControlWorkflow.ts:33`, `:198`
- `StepBoqIntake.tsx:38`
- `useBoqIntake.ts:134`, `:149`
- `useBomConversion.ts:166` (response discarded — lowest priority of this group)
- `usePortfolioComparison.ts:41`, `:64`
- `useStepIntakeLogic.ts:52`
- `useForensicAutoHeal.ts` (jobs call)
- `TaxonomyGraphSidebar.tsx:79`
- `WebhookMonitor.tsx:25` (fire-and-forget, lowest priority)
- `ReconciliationOverview.tsx:70`

**12 call sites**, not 32. The other ~20 either hit MSW-only routes (defer
until the backend-completeness gap in Section B is scoped and decided) or are
already validated.

---

## G. Open decisions for Vinodh

1. **Anomaly 1 (vendor routing)** — collapse to `/api/vendor/portal`, or add
   real `/api/vendors/sync` + `/toggle` routes to `server.ts`? Changes two live
   call sites either way.
2. **Anomaly 2 (dead edge-weight route)** — recommend fixing immediately
   (contained, matches an existing pattern exactly, currently broken
   everywhere). Will do as a follow-up patch unless you'd rather hold it.
3. **Anomaly 3 (dead code)** — recommend deleting the 6 orphaned methods now.
4. **Section B's 31 MSW-only routes** — this is the real scope question. Which
   subsystems get real backend implementations, and in what order? Candidates
   by apparent product importance: Catalog CRUD and Forensic Auto-Heal
   (`/api/forensics/align`) look highest-value; Telemetry logs/webhooks look
   lowest (likely fine to stay simulated).
