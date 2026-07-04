# VendorSolutionFigmaStudio — Data Architecture Consolidation Plan

**Purpose of this doc:** a single, durable record of what's wrong, why, and the exact fix sequence — so this survives across agent sessions and doesn't need to be re-discovered by git archaeology again.

---

## 0. The governing principle (read this first, every session)

> **`coreStore.ts` (Zustand) is the ONLY owner of entity data.**
> Everything else — mock seed files, MSW handlers, `server.ts`, the taxonomy graph's own state — either feeds the store once, or reads from it. Nothing maintains a second independent copy of catalog, vendor, solution, or UCID data.

```
src/lib/mockData/*.ts   →  seeds coreStore ONCE, on init         [entity data]
src/lib/constants/*.ts  →  imported directly anywhere            [config, not entity data]
coreStore.ts (Zustand)  →  single source of truth at runtime
  ↓ useCoreStore(s => s.X) selectors — ALL reads/writes go through here
Components / hooks       →  never import entity mock arrays directly
MSW / server.ts          →  latency + async-job simulation ONLY, never a second data owner
```

**Rule of thumb for every future session:** if you're about to write `const X = [...]` with hand-seeded data that overlaps something `coreStore` already holds, stop — that's how we got four disconnected universes.

---

## 1. Everything wrong, in one table

| # | Issue | File(s) | Severity |
|---|---|---|---|
| 1 | u1/u2 vendor submission totals don't match sum of line items (off by up to $181,930) | `src/lib/mockData/ucidsComputeStorage.ts` | 🔴 |
| 2 | Same SKU (`400-BPSB`) priced $1,195 in one BOM, $1,190 elsewhere — accidental, not the intentional forensic scenario | `ucidsComputeStorage.ts` | 🔴 |
| 3 | Standalone switches inconsistently typed `Network Adapter` vs `Chassis`; GPU typed `Processor` | `catalogPart1.ts`, `catalogPart2.ts` | 🟠 |
| 4 | `CatalogSKUSchema.type` is unconstrained `z.string()` while `BOMItemSchema` has a real enum — nothing catches #3 | `src/types/schemas/schemaCatalog.ts` | 🟠 |
| 5 | No SKU has `complianceFlags`/`catalogTier`/`vendorPortalId`/`evidenceLinks` populated, despite UI reading them | `catalogPart1/2.ts` vs `VendorIngestionDesk.tsx`, `AdviceFileIngestion.tsx` | 🟡 |
| 6 | `VendorIngestionDesk.tsx` imports raw `VENDORS` array, bypassing the store entirely — invisible to heal actions | `src/components/vendor-portal/VendorIngestionDesk.tsx` | 🔴 |
| 7 | `CleansingView.tsx` derives entries via one-shot `useState` initializer — won't re-derive if `catalogSkus` changes later | `src/components/cleansing/CleansingView.tsx` | 🟠 |
| 8 | ~~`api-mock.ts` holds its own 2-SKU `serverState.catalog` with different ids than the real 38-SKU catalog~~ — **FIXED (3a)**: stateless pass-through now | `src/lib/api-mock.ts` | 🔴→✅ |
| 9 | ~~**Live bug:** `CatalogManager` price edits get silently rolled back~~ — **FIXED (3a)**, e2e assertion strengthened to guard it | `src/components/catalog/CatalogManager.tsx` + `MockCatalogApi.updateCatalogSku` | 🔴→✅ |
| 10 | ~~`GET /api/solutions` always returns `[]`~~ — confirmed zero real callers; documented as intentionally empty (3a) | `src/mocks/routes/workflowHandlers.ts` | 🔴→✅ |
| 11 | `server.ts` has real routes for `/api/agents/run`, `/api/boq/ingest`, `/api/jobs`, etc. — but MSW shadows all of them. **10 true collisions found** (1 more than originally estimated: `snapshotHandlers.ts`). 2 spot-checked and confirmed unsafe to blanket-fix (`NLPParser.tsx`, `useBoqIntake.ts` send payloads that would fail `server.ts`'s strict schemas). **DEFERRED to Phase 3b**, scoped in detail there — not silently skipped. | `server.ts` vs `src/mocks/handlers.ts` / `workflowHandlers.ts` / `snapshotHandlers.ts` | 🔴 open |
| 12 | `/api/agents/run` in `server.ts` is explicitly a "Simulator" — not connected to any real Playwright automation | `server.ts` | 🟡 (expected, documented) |
| 13 | Taxonomy graph: `GET /api/graph/solution/:ucid` ignores the `:ucid` param entirely, always returns the same 5 hardcoded nodes | `src/mocks/routes/graphHandlers.ts`, `src/mocks/routes/sharedState.ts` | 🔴 |
| 14 | Taxonomy graph orphan queue shows "Orphan Work Queue (1)" but renders zero rows — the one fake orphan's id doesn't match any real catalog SKU | `TaxonomyOrphanBox.tsx` + `sharedState.ts` | 🔴 |
| 15 | Every graph edit (`mapNode`, `healOrphanMapping`, `addGraphNode`, etc.) writes only to local component state + the disconnected mock island — never calls `setCatalogSkus` | `src/hooks/useCatalogGraphData.ts` | 🔴 |
| 16 | Only `coreStore` has a `version`/`migrate` guard on its `persist` config; `ingestionStore`, `workflowStore`, `auditStore` don't | `src/store/*.ts` | 🟡 |
| 17 | No "reset to seed data" mechanism — persisted `localStorage` state silently wins over fresh mock data on every reload | all 4 stores | 🟡 |
| 18 | `apiClient.streamJob()` claims to "replace legacy HTTP polling" and "simulate SSE" but only ever fires 2 messages (1 fake + 1 real GET) — can't represent real multi-stage progress | `src/services/apiClient.ts` | 🟡 (fine for now, gap for later) |
| 19 | `catalog.spec.ts` e2e test already exercises the live price-rollback bug (#9) but its assertion is too weak to catch it — false green in CI | `tests/e2e/catalog.spec.ts` | 🟠 |
| 20 | 30 architecture/skill docs were deleted in the Phase 12 refactor (2026-06-27) with no replacement — decisions like this one keep needing re-discovery | `.agents/skills/`, `docs/skills/` (deleted) | 🟡 |

---

## 2. Phased plan

### Phase 0 — Lock the rule in writing *(do this first, before touching code)*
- [ ] Extend `AGENTS.md` §13.6 with the explicit sentence: *"MSW/`api-mock.ts`/`server.ts` handlers must not maintain independent copies of entity arrays owned by `coreStore`. Entity-CRUD handlers are pass-through only."*
- [ ] Add the async-job rule: *"Async job progress must go through `apiClient.streamJob()`'s interface, never a component-level `setInterval` or one-shot fetch."*
- [ ] Write one lightweight `docs/architecture/data-ownership.md` covering: the hierarchy diagram (§0 above), the three principles worth reviving from the deleted skill docs:
  - *Schema Enforcer*: all incoming data (portal scrape, Excel ingestion, user input) MUST be validated against Zod before processing.
  - *SKU Enricher*: a SKU missing from the catalog gets flagged `[MISSING-METADATA]`, never crashes the pipeline.
  - *Mandatory Part Sync*: vendor-injected parts the customer didn't request get synced back into local intelligence, not silently dropped.
- [ ] Decide and document: is `server.ts` the intended future real-backend seam? (Recommendation: yes — it's a real Node process, MSW isn't.)

### Phase 1 — Mockdata correctness (issues #1–5)
- [ ] Recompute and fix `totalPrice`/`originalPrice`/`savings` for u1 and u2 in `ucidsComputeStorage.ts` so they equal `sum(items.unitPrice × items.quantity)`. Model this on `boqMocks.ts`'s `dell-overcharge` fixture, which already does this correctly.
- [ ] Resolve the `400-BPSB` $1,195 vs $1,190 duplicate — pick the canonical catalog price ($1,190) unless a mismatch is deliberate, in which case label it the same way `dell-overcharge` labels its intentional variance.
- [ ] Fix `type` on the mislabeled switches (`sku-13`, `sku-15`, `sku-17`) and the GPU (`H100`) to a consistent, real category.
- [ ] Promote `CatalogSKUSchema.type` from `z.string()` to the same enum `BOMItemSchema` already uses, so this class of bug fails schema validation going forward.
- [ ] Seed `complianceFlags` on at least one SKU per vendor so the CLIC-flagged UI path has real test coverage.

### Phase 2 — Close store-bypass violations (issues #6–7)
- [ ] `VendorIngestionDesk.tsx`: replace `import { VENDORS } from "../../lib/mockData/misc"` with `useCoreStore(s => s.vendors)`.
- [ ] `CleansingView.tsx`: replace the one-shot `useState(() => generateMockEntries(catalogSkus))` with a `useMemo` keyed on `catalogSkus` (or move generation into the store) so entries re-derive when the catalog changes.
- [ ] Grep the codebase once more after these two fixes for any remaining `from ".../mockData"` entity-data imports outside `coreStore.ts` itself, and migrate anything found the same way.

### Phase 3 — Consolidate the backend-simulation layer (issues #8–12)

**Status: split into 3a (done) and 3b (deferred — scoped and documented below, not silently skipped).**

**3a — Catalog/solutions consolidation (DONE):**
- [x] Deleted `serverState.catalog` from `api-mock.ts`. `/api/catalog` (`GET`/`POST`/`PUT`/`DELETE`) are now stateless pass-throughs — confirmed via grep that nothing in the UI reads `GET /api/catalog`'s response (the catalog always comes from `useCoreStore(s => s.catalogSkus)`), so there's nothing to keep in sync.
- [x] `GET /api/solutions` — confirmed zero callers read its response either; left as a documented empty stub rather than inventing fake data nobody consumes.
- [x] Rewrote the two test suites that were asserting the *old buggy* behavior as correct (`src/services/__tests__/apiClient.test.ts`'s `MockCatalogApi` block literally expected `updateCatalogSku('non-existing', ...)` to throw — that's the exact bug). Now they assert the corrected contract, including an explicit regression guard: `updateCatalogSku('sku-4', ...)` (a real id the old stub never had) must succeed, not throw.
- [x] Strengthened `tests/e2e/catalog.spec.ts`'s price-edit assertion to check the displayed price actually equals the edited value and no rollback toast appears — previously it only checked the SKU text was "still visible," which passed whether or not the edit stuck. **Not executed in this sandbox** (Playwright's Chromium download requires `cdn.playwright.dev`, which isn't reachable here) — logically verified against the actual price-rendering source (`${sku.price.toLocaleString()}`), but should be run in CI to confirm.

**3b — MSW-vs-`server.ts` route collision (DEFERRED, correctly scoped, not executed):**

Investigation found 9 routes where MSW's handler and `server.ts`'s handler both exist for the exact same path (`/api/boq/ingest`, `/api/reconciliation/compare`, `/api/taxonomy/check-constraints`, `/api/integrations/dispatch`, `/api/agents/run`, `/api/portfolio/orchestrate`, `/api/portfolio/upload-manual`, `POST /api/jobs`, `GET /api/jobs/:id`), plus a 10th collision discovered in `snapshotHandlers.ts` (`/api/ucids/:ucid/snapshots` vs `server.ts`'s `POST /api/ucids/:unit/snapshots`) not in the original audit.

**Why this wasn't blindly fixed:** `server.ts` enforces strict Zod validation (`validateBody(...)`) on these routes; MSW's versions don't validate at all. Spot-checking real caller payloads against `server.ts`'s schemas found two confirmed cases where removing MSW's handler would introduce a live regression, not fix one:
- `NLPParser.tsx` posts `{ message: userText }` to `/api/agents/run` — nothing like `PlaywrightRunRequestSchema`'s required shape (`agentName` enum, `ucidRef`, `targetPortalUrl` as a valid URL, `bypassCaptchas`). MSW tolerates it; `server.ts` would hard-reject with a 400. (This looks like `NLPParser.tsx` should actually be calling `/api/agents/semantic-map` instead — a separate, pre-existing bug outside this phase's scope.)
- `useBoqIntake.ts` sends `presetType: (context).solution_id` — an arbitrary job-context value, not guaranteed to be one of `IngestRequestSchema`'s three enum values (`hpe-legacy`/`dell-overcharge`/`cisco-asymmetry`). MSW falls back gracefully; `server.ts` would 400 on anything else.

Given 2-for-2 on real landmines from a partial spot-check, the responsible call was to **not** blanket-delete these 9 (now 10) MSW handlers this session. Properly finishing 3b requires, per route: (1) diffing the actual caller payload against `server.ts`'s Zod schema, (2) fixing the caller or relaxing the schema wherever they don't already agree, (3) only then removing the duplicate MSW handler. This is a correctly-scoped follow-up, not a skipped step — tracked here so it isn't lost.
- [ ] Per-route caller-vs-schema audit for all 10 colliding routes (2 already found broken: `/api/agents/run` via `NLPParser.tsx`, `/api/boq/ingest` via `useBoqIntake.ts`).
- [ ] Fix `NLPParser.tsx` to call `/api/agents/semantic-map` (its actual intended endpoint) instead of `/api/agents/run`, or update `PlaywrightRunRequestSchema`/`server.ts` if `/api/agents/run` is genuinely meant to handle both shapes.
- [ ] Fix `useBoqIntake.ts` to send a value that's guaranteed to satisfy `IngestRequestSchema.presetType`'s enum, or relax the schema if arbitrary preset ids are legitimate.
- [ ] Once each route's payload is verified compatible, remove the matching MSW handler so `server.ts` is reachable in dev mode (the actual point of this phase).
- [ ] Extend `MockSnapshotApi`'s `serverState.snapshots` — same competing-array pattern as the catalog fix in 3a, discovered but not fixed this session (each `UCID.snapshots` in `coreStore` is the real data; `MockSnapshotApi` is a second, disconnected flat array).

Leave `/api/agents/run`'s "Simulator" framing as-is either way — it's honest about what it is; the fix here is about which layer answers the request, not about making it a real Playwright bridge.

### Phase 4 — Rewire Taxonomy Graph to real data (issues #13–15) — **DONE, verified**
- [x] Replaced `GET /api/graph/solution/:ucid` with `deriveGraphFromConfig()`, a pure client-side function: one node per real BOM item (`catalog_part` if it resolves against `catalogSkus` by partNumber, `scraped_orphan` + into `unmappedIds` otherwise), one `category_hub` per distinct BOM item `type`, root `product` node for the config itself. No network round-trip, no 600ms simulated delay.
- [x] **Found and fixed a second bug while wiring this in**: `TaxonomyGraphView.tsx` was passing `activeUcid?.id` as the hook's `configId`, but `allConfigs` holds `Config` objects with unrelated `cfg-*` ids — the internal lookup could never match for any real UCID, which is *why* the graph always silently showed the same stale content (the one-time successful fetch using the `DEFAULT_CONFIGS` placeholder) no matter what was selected. Now defaults to `activeConfigs[0]?.id`, a real config id.
- [x] `mapNode`/`healOrphanMapping` now write the classification onto the matching real catalog SKU via `setCatalogSkus` (matched by partNumber) — or, if no catalog SKU exists for that part yet, creates a new one. Either way, the next re-derivation of the graph (triggered automatically by the `catalogSkus` change) shows the fix — no manual local-state patch needed for BOM-backed items, which also means the fix is now visible on every other screen that reads `catalogSkus` (Dashboard, Catalog Manager, Cleansing), not just the graph view.
- [x] Removed the now-redundant duplicate `setCatalogSkus` call in `TaxonomyGraphSidebar.tsx`'s `handleMapOrphanNode` — it was doing the same write a second, slightly different way; `mapNode` is now the single place this logic lives.
- [x] Generic node/edge CRUD (`addGraphNode`/`updateGraphNode`/`deleteGraphNode`/`addGraphEdge`/`deleteGraphEdge`) — these don't map cleanly onto catalog fields, so they now operate on a local overlay (`GraphOverlay` in the hook) that layers on top of the derived baseline via `applyOverlay()`. This avoids the same "wipe user work on re-derivation" risk identified and fixed for `CleansingView` in Phase 2 — a manual edit survives a `catalogSkus` change instead of being silently discarded.
- [x] Fixed an id-scheme bug caught while wiring this up: orphan nodes must use the real `partNumber` as their id (not a synthetic one), because the pre-existing `OrphanWorkshopPanel`/`handleMapOrphanNode` code already assumes an orphan's id *is* its partNumber (both for display-name lookup and as the payload sent to `mapNode`).
- [x] Retired `memoryGraphNodes`/`memoryGraphEdges` in `sharedState.ts` and the 5 dead MSW routes that served them (`GET /api/graph/solution/:ucid`, `POST/PUT/DELETE /api/graph/nodes`, `POST/DELETE /api/graph/edges`) — confirmed zero remaining callers first. Left `/api/graph/algorithms/alternative-paths` and `/api/graph/path-selection` alone; those are genuinely algorithmic (pathfinding) and still network-backed on purpose.
- [x] Rewrote `tests/integration/taxonomy-graph-sync.test.tsx` (was asserting the old network-mocked behavior) with 6 tests covering the pure derivation, the catalog-write-back, live re-resolution of an orphan once `catalogSkus` updates, and no-duplicate-on-remap. Also updated `src/tests/integration/MSWContracts.test.ts`'s dead-route schema check to validate `deriveGraphFromConfig`'s output instead.
- **Not done, noted for later, not urgent**: `TaxonomyOrphanBox.tsx` (a second, unused component with the "Orphan Work Queue (1) renders empty" bug identified earlier) is confirmed fully dead code — zero imports anywhere. Left in place rather than deleted (file deletion is higher-risk/harder-to-review than route cleanup, and it was never actually reachable in the running app, so it isn't a live bug). Worth deleting in a future pass.

Verified: `tsc --noEmit` clean, full vitest suite green (84 files / 397 tests, 0 regressions).

### Phase 5 — Persistence & session integrity (issues #16–17) — **DONE, verified**
- [x] Added `version: 1` + `migrate` guards to `ingestionStore.ts`, `workflowStore.ts`, `auditStore.ts`, matching `coreStore.ts`'s existing pattern exactly (drop stale persisted state on a version mismatch rather than risk rehydrating an incompatible shape).
- [x] Added `src/lib/resetSeedData.ts`: `resetToSeedData()` clears all 4 `localStorage` keys and reloads; `clearPersistedStores()` is the same without the reload, for use before the app has rendered.
- [x] Wired a "Reset to Seed Data" button into `SystemTelemetry.tsx`'s header, with an explicit inline confirm step (it's destructive — wipes real session edits) — chose this page since it's already the closest thing to a system/diagnostics view; there's no dedicated settings page yet.
- [x] Added the optional `VITE_RESET_ON_LOAD` env flag in `main.tsx`: when set, clears persisted state before the app boots, so CI/demo runs always start from pristine mock data instead of whatever a previous run left behind. Off by default — normal dev/prod behavior (persisting real edits across reloads) is unchanged.
- [x] Tests: `resetSeedData.test.ts` (3 tests covering both functions + the key list itself), `SystemTelemetry.test.tsx` gained a 3rd test proving the confirm-before-destructive-action flow (click once → confirm step appears, nothing happens yet; Cancel backs out; Confirm actually triggers it).

Verified: `tsc --noEmit` clean, full vitest suite green (85 files / 401 tests, 0 regressions).

### Phase 6 — Backend-readiness guardrails (issue #18, forward-looking) — **DONE, verified**
- [x] **Confirmed** every write from UI already goes through `apiClient` — zero direct `fetch()` calls found in `src/components`/`src/hooks`. Added an ESLint rule (`eslint.config.mjs`, scoped to those two directories) that now hard-fails any future direct `fetch()` call, enforcing this permanently instead of relying on manual review.
- [x] **Found and closed a real gap**: `apiClient.parseResponse()` existed but was called at **zero** of ~35 entity-data call sites — completely unused, not just inconsistently applied. Retrofitted it at 4 well-verified call sites (`useBomConversion.ts` ×2, `VendorIngestionDesk.tsx` ×1) where the response type is already a confirmed `z.infer` of the matching schema. The remaining ~30 call sites are a scoped follow-up (see below) rather than a blind sweep — `parseResponse` degrades gracefully (warns, doesn't throw) so it's low-risk, but several response shapes (e.g. `/api/boq/ingest`'s actual `BoqResponsePayload` vs. the unrelated `IngestResponseSchema`) don't match their "obvious" schema and need the same landmine-check discipline as Phase 3b before converting.
- [x] Discovered while retrofitting: 12 test files fully mock `apiClient` with a partial object missing `parseResponse`, which would `TypeError` the moment any covered code path calls it. Fixed all 12 proactively (not just the 1 that was actually broken by this round), removing this landmine for any future `parseResponse` work.
- [x] Implemented a genuine `streamJob()` — real interval-based polling (not a single GET dressed up as "simulating SSE") that keeps polling until a terminal status, calling `onMessage` for every real update. `JobStreamer.tsx` and any future caller need zero changes, since the interface didn't change, only what's behind it. Also upgraded the MSW `/api/jobs/:id` handler to track real incremental progress per job id across polls (25% → 55% → 80% → completed) instead of always returning "completed" on the very first call — otherwise the new polling would have nothing genuine to observe. Verified `server.ts`'s real job endpoint already does this same increment-per-poll pattern independently, confirming polling (not push) is the architecture every layer of this codebase actually converged on — see the design discussion in this doc's history for why polling is the right choice here, not a legacy fallback.
- [x] Rewrote the 2 pre-existing `streamJob` tests that were locking in the old one-shot-GET behavior; added coverage proving multiple genuine polls happen and stop exactly at the terminal status.
- [x] Found and fixed a `react-hooks/refs` lint **error** in Phase 4's own `useCatalogGraphData.ts` (reading a ref during render inside `useMemo`) — this was only caught because Phase 6 was the first time `eslint` was actually run, not just `tsc --noEmit`, across this whole effort. Refactored the overlay mechanism from a ref to real `useState`, and fixed a related `useEffect`-cascading-render warning using React's documented "adjust state during render" pattern. **Process note**: `tsc --noEmit` was run after every phase; `eslint` was not run until Phase 6. No other errors were found when finally run across Phases 0–5's code, but this was luck, not verification — recommend running full `npm run lint` (not just `tsc`) after every phase in any future work here.

**Not done, scoped as an explicit follow-up (same discipline as Phase 3b):**
- [ ] Audit the remaining ~30 `apiClient` call sites one at a time (does a matching schema exist? does the actual runtime response shape match it?) before adding `parseResponse` calls. Do NOT do this as a blind find-and-replace — `/api/boq/ingest`'s response shape divergence (found while scoping this phase) proves the "obvious" schema isn't always the right one.

Verified: `tsc --noEmit` clean, `eslint src` clean (0 errors), full vitest suite green (85 files / 401 tests, 0 regressions).

### Phase 7 — Test/CI hardening (issues #19–20)
- [ ] Strengthen `catalog.spec.ts`'s price-edit assertion to actually check the displayed price equals the edited value and that no "Price sync failed" toast appears — this becomes a real regression guard once Phase 3 fixes the underlying bug.
- [ ] Extend `src/tests/integration/MockDataContracts.test.ts` with:
  - `sum(items.unitPrice × items.quantity) === totalPrice` for every vendor submission
  - `originalPrice - savings === totalPrice`
  - every BOM `partNumber` exists in the catalog with matching `unitPrice` (or is explicitly labeled as an intentional variance)
  - every `chassisRef` resolves to a real SKU id (already clean — lock it in)
  - `type` values conform to the shared enum from Phase 1

---

## 3. Open decisions still needed from you

All major open questions from this investigation have now been resolved through our discussion — captured here for the record:
- **Taxonomy graph intent** → resolved: it should be a real, editable reflection of the catalog (Phase 4).
- **`server.ts` vs. MSW** → resolved: `server.ts` is the intended future backend seam; MSW should stop duplicating its routes (Phase 3).
- **Relationship to the HPE OCA Playwright certification suite** → resolved: separate codebase, not currently integrated; `server.ts`'s `/api/agents/run` is an honest simulator, not a real bridge.

Nothing is currently blocked on you — Phases 0–7 above are ready to execute in order.

---

## 4. Suggested execution order

Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 7 (tests) → Phase 5 → Phase 6

Rationale: lock the rule in writing first so nothing drifts again while fixing it; fix data correctness before architecture (cheap, isolated, no regression risk per the earlier test audit); close the two live bypasses next (small, contained); then the two bigger consolidations (backend layer, taxonomy graph) which are the highest-value, highest-effort items; harden tests immediately after so the fixes are locked in by CI; persistence and backend-readiness are lower-urgency polish that can trail.
