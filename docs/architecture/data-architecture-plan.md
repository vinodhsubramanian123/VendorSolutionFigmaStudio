# VendorSolutionFigmaStudio — Data Architecture Consolidation Plan

**Purpose of this doc:** a single, durable record of what's wrong, why, and the exact fix sequence — so this survives across agent sessions and doesn't need to be re-discovered by git archaeology again.

---

## Session log (most recent first)

### 2026-07-10 — Post-Phase-9 lint/token audit (fresh-clone verified)
Two contained patches, both verified via `git am` on independent fresh clones,
full suite green after each (tsc/eslint/dependency-cruiser/vitest 556/556):
- **`fix(reconciliation)`**: resolved 9 new ESLint warnings introduced by that
  day's separate reconciliation-feature push (`c14840a`/`f062ce1`) — 1 real a11y
  fix (keyboard-inaccessible click-to-edit trigger in `AnnotationCell.tsx`),
  1 missing `useMemo` dep, 2 swallowed exceptions, 1 complexity-31 function
  broken into a helper component + lookup tables.
- **`fix(design-tokens)`**: closed out the cosmic-slate remediation
  (`b92c2a9`, 2026-07-06) — 7 remaining hardcoded-color call sites, plus one
  real bug the regex script introduced (`disabled:text-content-primary0`, an
  invalid class silently no-op'd by Tailwind, leaving the vendor-portal NLP
  chat's disabled Send button unstyled). Full detail in
  `docs/architecture/ui-ux-audit.md`.

Route/nav coverage checked: every `App.tsx` route has a `Sidebar.tsx` entry
(except `/solutions/:id`, correctly reached only via drill-down) and vice versa
— no dead links, no orphaned routes.

**Follow-up same day, after Antigravity applied the above and ran
`test:e2e:visual` locally (8/8 passed):** closing the 5-view snapshot gap
surfaced a much bigger bug than the earlier design-token pass caught.
`text-content-primary0` — not a real class — was used **310 times across 94
files**, all traced to the `b92c2a9` cosmic-slate script. Every occurrence
silently rendered with no color styling (Tailwind drops unknown classes),
breaking the muted/secondary text hierarchy across nearly the whole app for 4
days. The reason `8/8 passed` didn't catch it: the baselines were captured
*after* the bug was introduced, so they encoded it as correct. Fixed
(296 sites → `content-muted`, 1 → `content-primary`, both traced from the
original commit's diff rather than guessed) — full detail and the general
lesson about trusting "0 diffs" in `docs/architecture/ui-ux-100-checklist.md`
§0. Visual-snapshot coverage is now 13/13 nav views, but **every baseline
(old and new) needs to be regenerated and visually sanity-checked locally**
before being trusted again.

**Resolved 2026-07-11:** Vinodh ran `--update-snapshots` locally after the
`isVisible()` guard removal — 20 baseline files now cover all 13/13 nav
views (7 pre-existing views ×2 platforms + 6 newly-fixed views ×1 platform).
Spot-checked `taxonomy-graph` and `cleansing-workshop` baselines directly:
muted text renders with real dim color, no layout breakage. Full verification
suite (fresh install, tsc, eslint, dependency-cruiser, vitest) green.
Checklist item #1 (`ui-ux-100-checklist.md`) is fully closed.

**Not done — needs a browser-capable environment:** Playwright e2e / visual
regression (`visual.spec.ts` snapshots) could not be *run* from this sandbox
(`cdn.playwright.dev` not in egress allowlist, confirmed via direct install
failure) — all execution happened on Vinodh's machine per the established
apply → run → commit → confirm loop. Live/interactive UI validation beyond
the automated snapshot suite (manual click-through, screen reader testing,
cross-browser) is still open.

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

**Second rule of thumb (added Phase 9):** if a Zustand store needs a type that's declared inside a hook or component file (rather than a neutral `src/types/*.ts` module), stop — importing it creates a circular dependency the moment that hook also imports the store (which it almost always does, to read/write the state the store owns). Domain types that a store's state shape depends on belong in a neutral types module from the start, not wherever the first consumer happened to need them.

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
| 21 | ~~Two fully-orphaned dead files (`PipelineView.tsx`, `ApiLogsView.tsx`), stale near-total duplicates of `DocumentPipelinePanel.tsx`/`ApiLogsTable.tsx` from the Phase 12 God-component refactor, never deleted~~ — **FIXED (Phase 9)**, including porting the 3 test scenarios the orphan's test file covered that the live component's test didn't | `src/components/telemetry/PipelineView.tsx`, `ApiLogsView.tsx` | 🔴→✅ |
| 22 | ~~`BoqResponsePayload` independently declared 3 times (`useIngestionLogic.ts`, `useBoqIntake.ts`, `BoqIngestWorkbook.tsx`), each missing progressively more optional fields than the last — no compiler signal when they drift~~ — **FIXED (Phase 9)**, consolidated to one canonical type in `src/types/ingestion.ts` | was: `useIngestionLogic.ts`, `useBoqIntake.ts`, `BoqIngestWorkbook.tsx` | 🟠→✅ |
| 23 | ~~4 circular dependencies, all one shape (a store imports a type from a hook, the hook imports the store): `useAuditLog.ts`↔`auditStore.ts`; `useIngestionLogic.ts`↔`ingestionStore.ts`; 2 further 3-way cycles through `useBoqIntake.ts`/`useBomConversion.ts`~~ — **FIXED (Phase 9)**, types extracted to neutral `src/types/ingestion.ts` / `src/types/audit.ts` modules | was: `store/ingestionStore.ts`, `store/auditStore.ts`, `components/ingestion/useIngestionLogic.ts`, `hooks/useAuditLog.ts` | 🔴→✅ |
| 24 | ~~`App.tsx` subscribed to 12 `coreStore` bindings (solutions/vendors/catalogSkus/forensicIssues/sourcingRules/learningEvents + their setters) that are never read — leftover from before routes were decomposed into self-fetching components (Phase 12); caused needless top-level re-renders on every mutation to any of those 6 slices~~ — **FIXED (Phase 9)** | `src/App.tsx` | 🟡→✅ |
| 25 | ~~`averagePipeline`/`recentMission` computed in `Dashboard.tsx` via `useMemo` but never rendered anywhere~~ — **FIXED (Phase 9)**, wired into `UcidPipelineCard`'s header with test coverage | `src/components/dashboard/Dashboard.tsx`, `UcidPipelineCard.tsx` | 🟡→✅ |
| 26 | ~~Three independently-declared `BoqResponsePayload`-style type files (`cleansingTypes.ts`/`types.ts`/`constants.ts` in `cleansing/`; `telemetryUtils.ts`/`types.ts` in `telemetry/`) — the same disconnected-source-of-truth pattern as issue #22, found while chasing jscpd duplication rather than circular deps this time~~ — **FIXED (Phase 9)**, both consolidated onto their respective canonical `types.ts` | was: `cleansing/cleansingTypes.ts`, `telemetry/telemetryUtils.ts` | 🟠→✅ |
| 27 | ~~A second orphaned duplicate component, same root cause as issue #21 (the Phase 12 God-component refactor): `CleansingMappingPanel.tsx`, zero importers anywhere including tests, functionally superseded by `MappingPanel.tsx`~~ — **FIXED (Phase 9)** | was: `src/components/cleansing/CleansingMappingPanel.tsx` | 🔴→✅ |
| 28 | ~~The window-keydown Escape-to-close effect was independently duplicated at 8 call sites across 7 modal/overlay components — jscpd's pairwise matching only ever flagged 2 of them~~ — **FIXED (Phase 9)**, consolidated into `src/hooks/useEscapeKey.ts` | was: `CatalogAddForm.tsx`, `SnapshotDiffModal.tsx`, `UCIDModals.tsx` ×2, `NewUCIDModal.tsx`, `RuleConflictModal.tsx`, `RuleClarificationModal.tsx`, `RefineRuleOverlay.tsx` | 🟡→✅ |
| 29 | Cleansing mock seed data (`mockData.ts` / `graphHandlers.ts`'s MSW handler) had identical raw seed rows but the downstream match-status *computation* logic had already diverged (one cross-references real `catalogSkus`, the other uses a simpler heuristic) — only the raw rows were deduplicated (Phase 9); unifying the two computation strategies is a real behavior decision, left open | `src/mocks/cleansingSeedData.ts` (new), `components/cleansing/mockData.ts`, `mocks/routes/graphHandlers.ts` | 🟡 |

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

**3b — MSW-vs-`server.ts` route collision — DONE, verified (executed in a later session, patches 0001–0006 of `ANTIGRAVITY_HANDOFF.md`):**

All 10 routes traced end-to-end (every real caller found, every payload diffed against `server.ts`'s actual schema/destructure). **6 of 10 had real, previously-invisible bugs** — every one silently masked because MSW doesn't enforce the same validation `server.ts` does:

| Route | Result |
|---|---|
| `/api/boq/ingest` | Fixed — `JobContext.solution_id` validated against `IngestRequestSchema.presetType` at the boundary instead of blind-cast (patch 0001) |
| `/api/agents/run` | Fixed — confirmed `NLPParser.tsx` was calling the wrong endpoint entirely; removed the two calls rather than reshape them, since no backend work was actually needed there (patch 0002) |
| `/api/reconciliation/compare` | Fixed — `triggerBatchReconciliation` sent bare UCID id strings where `ReconciliationRequestSchema` requires full solution objects (patch 0003) |
| `/api/taxonomy/check-constraints` | Clean (this caller, `useBomConversion.ts`) — **but see Phase 8, a second caller was found broken** |
| `/api/portfolio/orchestrate` | Fixed — empty-`ucids` fallback produced `id: undefined`, reachable via direct stepper navigation (patch 0004) |
| `/api/portfolio/upload-manual` | Clean |
| `POST /api/jobs` | Clean (payload; no `validateBody` on this route at all) |
| `GET /api/jobs/:id` | Fixed via `useForensicAutoHeal.ts` — `runAuditScanner` treated the POST response as already-complete, producing a false-positive "scan complete" before any polling happened (patch 0005) |
| `/api/integrations/dispatch` | Clean, but **zero real UI callers exist** — only a contract test exercises it |
| `POST /api/ucids/:id/snapshots` | Fixed — two callers used opposite payload conventions; `useSnapshotManagerLogic.ts` sent the bare object where `server.ts` destructures `{snapshot}` (patch 0006) |

`NLPParser.tsx`'s `/api/agents/semantic-map` and `/api/taxonomy/rules` (its actual intended endpoints) were confirmed to have **no `server.ts` route at all** — not part of this collision list since there's nothing to collide with, but tracked in Phase 8's backend-completeness gap.

`MockSnapshotApi`'s disconnected flat array (a competing-array pattern like the catalog fix in 3a, originally scoped as a separate follow-up) turned out to be superseded — the real fix was correcting the payload shape crossing the boundary, not reconciling two competing mock arrays.

**Still not done — deliberately left as a distinct follow-up:** actually deleting the now-safe-to-remove MSW handlers for these 10 routes. Every caller is now confirmed payload-compatible with `server.ts`, so removal is mechanical, but it wasn't bundled into the same patches — verifying "the caller sends the right shape" and "it's safe to delete the handler that made the wrong shape look fine" are different claims, and the second deserves its own explicit verification pass (re-run the full suite with each handler actually gone, one at a time) rather than being asserted alongside the fix.

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

**Not done in this phase, executed later — see Phase 8:**
- [x] Audited the remaining ~30 `apiClient` call sites (exact count settled at 39 live call sites across all methods including `postForm` and `apiClient`'s own named wrapper methods — the ~30/~35 estimates here were both undercounts from an incomplete method inventory, corrected in Phase 8's route inventory doc). Of those, 15 hit real `server.ts`-backed routes; 23 hit MSW-only routes; 1 was fully dead code. The `/api/boq/ingest` divergence flagged above was real: found and fixed as Landmine #7 (see Phase 8).

Verified: `tsc --noEmit` clean, `eslint src` clean (0 errors), full vitest suite green (85 files / 401 tests, 0 regressions).

### Phase 7 — Test/CI hardening (issues #19–20)
- [ ] Strengthen `catalog.spec.ts`'s price-edit assertion to actually check the displayed price equals the edited value and that no "Price sync failed" toast appears — this becomes a real regression guard once Phase 3 fixes the underlying bug.
- [ ] Extend `src/tests/integration/MockDataContracts.test.ts` with:
  - `sum(items.unitPrice × items.quantity) === totalPrice` for every vendor submission
  - `originalPrice - savings === totalPrice`
  - every BOM `partNumber` exists in the catalog with matching `unitPrice` (or is explicitly labeled as an intentional variance)
  - every `chassisRef` resolves to a real SKU id (already clean — lock it in)
  - `type` values conform to the shared enum from Phase 1

### Phase 8 — Definitive backend route inventory, named anomalies, and Phase 6 kickoff findings — **DONE, verified** (patches 0007–0012)

Building the per-file inventory Phase 6 needed (which of the ~30 remaining `apiClient` call sites are even worth hardening) surfaced a much bigger structural finding than expected: `server.ts` implements **exactly 13 routes total**; MSW implements **41**. **31 of those 41 have no `server.ts` backing at all**, spanning entire subsystems, not edge cases — Catalog CRUD, Solutions CRUD, Cleansing Workshop, Taxonomy Graph (server-side), Forensic Auto-Heal's actual mutation endpoint (`/api/forensics/align`), vendor sync, telemetry logs. Full route-by-route classification, and the complete 39-call-site inventory, now lives in `docs/architecture/backend-route-inventory.md` — that document is the source of truth going forward; don't re-derive it.

**4 named anomalies found while building the inventory, all resolved except the one requiring product input:**
- **Anomaly 1 (vendor routing)** — `server.ts`'s only real vendor route was a generic `/api/vendor/portal` dispatcher with zero callers; `VendorPortal.tsx` and `StepVendorProvisioning.tsx` called two separate, nonexistent routes instead. **Fixed** (patch 0009): extended `server.ts` to branch on `action` and return the fields each caller needs, added a schema pair, rerouted all 3 callers, and fixed MSW (which also didn't implement the real route) so dev/test and production agree.
- **Anomaly 2 (dead-in-every-environment bug)** — `EdgeEditorPanel.tsx` called `apiClient.updateGraphEdge()`, hitting a route removed in Phase 4's graph-to-client-side migration and never implemented in `server.ts`. Broken in local dev too, not just production. **Fixed** (patch 0008): migrated to the same client-side overlay pattern every sibling graph mutation already uses.
- **Anomaly 3 (dead code)** — 6 `apiClient` wrapper methods with zero callers anywhere, leftover from the same Phase 4 migration. **Removed** (patch 0008).
- **Anomaly 4 (`/api/integrations/dispatch` has no real caller)** — fully implemented and schema-clean on both sides, but no UI feature dispatches a webhook. **Not fixed, flagged only** — this is a product-completeness gap (build the feature?), not a bug with an obvious fix.

**2 additional landmines found while starting Phase 6's real call-site hardening** — validated the whole premise of Phase 6: checking response shapes, not just request shapes, catches real bugs the same way Phase 3b did:
- **Landmine #7** — `server.ts`'s real `/api/boq/ingest` response nests `solutions` under a full `ucid` object; MSW additionally duplicates it as a top-level convenience field. Both `useBoqIntake.ts` and `StepBoqIntake.tsx` read the top-level field only — against the real server this was always `undefined`, so BOQ-to-UCID provisioning was a silent no-op in one caller and the entire Mission Control BOQ intake step did nothing in the other, despite both API calls succeeding with 200. **Fixed** (patch 0010), with a real-server-shaped regression test added to each (neither had any prior coverage of this assumption).
- **Landmine #8** — `TaxonomyGraphSidebar.tsx`'s second caller of `/api/taxonomy/check-constraints` used entirely wrong field names (`chassisSku`/`cpuSku`/`ramQty`/`psuWatts` vs. the schema's `chassisSKU`/`cpuSKU`/`ramQuantity`/`psuWattsCount`) — invisible under MSW, whose handler for this route never reads the request body at all. `useBomConversion.ts`'s call to the same route was confirmed correct back in Phase 3b, but this second caller was never checked. **Fixed** (patch 0011).

**Remaining Phase 6 call sites — deliberately not exhaustively hardened this pass:** of the 15 real-route call sites, `POST /api/jobs`'s `job_id` extraction was spot-checked across every caller and confirmed uniformly correct (simple, stable shape). The handful with fully-discarded responses (`useBomConversion.ts`'s batch-reconciliation call, `WebhookMonitor.tsx`'s fire-and-forget test utility) are lowest-priority — there's no consumption to protect. Full `parseResponse` wrapping of the remaining low-risk sites is optional polish, not a correctness gap; not doing it now was a deliberate effort/value call, not an oversight.

**Verification:** all 12 patches (0001–0012) applied cleanly via `git am` against a fresh clone of `main`, in sequence, zero conflicts. Full suite on the resulting checkout: `tsc --noEmit` clean, `eslint src server.ts` shows zero newly-introduced issues (diffed line-by-line against the pristine pre-session baseline — one genuine new item, a trivial unused test import, fixed in patch 0012), 92 test files / 455 tests, 0 regressions. See `ANTIGRAVITY_HANDOFF.md` for the exact patch sequence and per-patch reasoning.

### Phase 9 — Lint/duplication/circular-dependency remediation — **in progress** (patches 0001–0006 so far)

Started from a full diagnostic sweep beyond just `npm run lint` (which is
itself `tsc --noEmit` + `eslint src`): also ran `dependency-cruiser src`
(circular/orphan/unresolvable import checks), `npx jscpd src`
(duplicate-code detection), and `npm run check-size` (400-line file limit).
Baseline: 109 eslint warnings / 0 errors, 456 tests passing, 5
dependency-cruiser errors, 28 jscpd clones (2.28% duplicated tokens), 1
check-size violation.

**Methodology, worth repeating in every future lint/cleanup pass:** never
blanket-delete anything a linter calls "unused" or "dead" without checking
git history (`git log -S`) and cross-referencing whether the removal is
hiding a real bug or a missing feature wire-up. This surfaced two things a
mechanical cleanup would have missed entirely: issue #25 (a computed metric
that should have been *displayed*, not deleted) and issue #22 (a duplicate
type declaration that had already silently drifted in 3 places). Every new
test added this session was verified with revert-and-confirm-fail (break
the underlying behavior, confirm the new test actually fails, then restore)
before being counted as done.

- **0001–0002 (issue #21 + general hygiene):** retired the two orphaned
  dead files, ported their unique test coverage first, then removed 34
  unused imports across 14 files.
- **0003–0005 (issues #23, #25 partial, plus a related test-coverage gap):**
  triaged all 33 `sonarjs/no-dead-store`/`no-unused-vars` warnings in
  `App.tsx`/`Dashboard.tsx`/`ForensicView.tsx` individually (issue #24, and
  the `ForensicView.tsx` half of what's now folded into #23's writeup).
  Confirmed `Dashboard.tsx`'s dead metrics needed wiring, not deletion
  (issue #25). Re-running the audit after these fixes surfaced one further
  dead-store warning outside the original 3-file scope — a test file with
  an uninvoked mock callback pointing at a genuinely untested stream-error
  code path in `useForensicAutoHeal.ts` — closed that gap too rather than
  deferring it.
- **0006 (issue #23 fully, issue #22):** broke all 4 circular dependencies
  by extracting the shared types (`BoqResponsePayload`, `AuditLogEntry`)
  each store/hook pair was cross-importing into neutral
  `src/types/ingestion.ts` / `src/types/audit.ts` modules. Tracing this
  surfaced issue #22 (3 independently-drifted duplicate type declarations)
  as a bigger finding than the circular import itself.
- **0008 (9d):** all 20 `jsx-a11y` warnings. Matched this codebase's own
  established conventions rather than inventing new patterns — e.g. the
  window-level Escape-key-listener pattern already used by most modals,
  and the `role="button"`+`tabIndex`+`onKeyDown` pattern already used by
  other interactive divs. One real behavior change: removed
  `CatalogAddForm.tsx`'s backdrop-click-to-close, since it was the only
  modal in the codebase with that feature (every other modal relies on
  an explicit close button + Escape only) — a new test covers the
  Escape-still-closes-it behavior.
- **0009 (9e):** all 5 `react-hooks/set-state-in-effect` warnings, using
  React's own documented "adjust state during render" pattern instead of
  effects for every prop-driven sync case. Caught and fixed a real bug in
  this pattern's first application (`SourcingRulesVault.tsx`): initializing
  the "last seen" comparison state to the prop itself meant an
  already-truthy prop at mount time was never detected as changed —
  caught via a new test that failed, verified via revert-and-confirm-fail.
- **0010:** the remaining one-off warnings (`no-empty`, `no-ignored-exceptions`,
  `exhaustive-deps`) plus all `sonarjs/use-type-alias` warnings — fixing
  the first few of these surfaced further un-aliased occurrences of the
  same union shapes the original audit hadn't listed; replaced every
  occurrence, not just the originally-flagged lines.
- **0011 (9f):** all 10 `complexity` warnings. General approach: extract
  branching logic to genuinely separate pure functions (confirmed
  empirically that moving expressions to top-level consts in the *same*
  function does not reduce its score — only extraction to a separate
  function does). `App.tsx`'s snapshot-migration logic and
  `useBomConversion.ts`'s error/constraint-default helpers had zero test
  coverage before this patch; both now have direct unit tests against the
  real exported functions.
- **0012 (9h, 9i, part of 9g):** split `workflowHandlers.ts` (421 lines)
  into itself (236 lines) plus the new `vendorAgentHandlers.ts` (189
  lines); fixed the `vite/client` dependency-cruiser false positive with
  a surgically-scoped exclusion on the literal specifier text (not a
  file-wide exclusion); deleted the duplicate `cleansingTypes.ts` (3-way
  duplicate with `types.ts` and `constants.ts`) and consolidated
  `telemetryUtils.ts`'s duplicated type declarations onto `types.ts`.
- **0013 (9g):** all 7 self-duplicated jscpd clone clusters
  (`apiClient.ts`, `ucidActions.ts`, `ConsolidatedStatusBoard.tsx`,
  `Sidebar.tsx`, `SolutionConfigCard.tsx`, `RulesTableRow.tsx` ×2).
- **0014–0015 (9g):** cross-file jscpd clones — a `useEscapeKey` hook
  consolidating a pattern independently duplicated across **8 call sites
  in 7 files** (found by grepping for the pattern directly, since jscpd's
  pairwise matching only ever flags the single closest pair, not every
  instance); a shared `ModalBackdrop` component; deleted a second orphaned
  duplicate component (`CleansingMappingPanel.tsx`, same root cause as
  issue #21 — the Phase 12 "God component refactor" commit); deduplicated
  cleansing mock seed data between `mockData.ts` and an MSW handler
  (their downstream match-status *computation* had already diverged, so
  only the raw seed rows were deduplicated, not the two different
  computation strategies — unifying those would be a real behavior
  decision outside a duplication cleanup's scope).

**Final state after patch 0015 — Phase 9 complete:** `tsc --noEmit`
clean, `eslint src` **0 warnings, 0 errors** (every one of the original
109 resolved), `dependency-cruiser` **0 violations** (down from 5),
`check-size` **all files under 400 lines** (down from 1 violation),
`jscpd` **4 clones, 0.2% duplicated tokens** (down from 28 clones, 2.28%
— remaining clones are small, cosmetic, cross-component patterns not
worth the risk/effort tradeoff of further consolidation), **102 test
files / 541 tests passing** (up from 92 files / 456 tests at the start
of Phase 9). All 15 patches verified via `git am` on a single, complete,
independent fresh clone in sequence — not just incrementally.

No sub-phases remain open. Two items were surfaced but deliberately left
unfixed, documented rather than silently dropped: `IngestBOMRequest`/
`IngestBOMResponse` in `src/types/models/api.ts` still look unused
(noticed during patch 0006, never confirmed dead via the same
git-history diligence issue #21 got — low priority, not blocking); and
the cleansing mock-data computation divergence noted in patch
0014–0015's summary above (also low priority — it's existing, working,
if inconsistent mock behavior, not a regression this session introduced).

---

## 3. Open decisions still needed from you

All major open questions from the original investigation were resolved through discussion — captured here for the record, plus new ones surfaced by Phase 8:
- **Taxonomy graph intent** → resolved: it should be a real, editable reflection of the catalog (Phase 4).
- **`server.ts` vs. MSW** → resolved: `server.ts` is the intended future backend seam; MSW should stop duplicating its routes (Phase 3).
- **Relationship to the HPE OCA Playwright certification suite** → resolved: separate codebase, not currently integrated; `server.ts`'s `/api/agents/run` is an honest simulator, not a real bridge.
- **The 31 MSW-only routes (Phase 8)** → **open, needs your call.** Which subsystems get real `server.ts` implementations, and in what order? By apparent product importance: Catalog CRUD and Forensic Auto-Heal's actual mutation endpoint (`/api/forensics/align`) look highest-value; Telemetry logs/webhooks look lowest (likely fine to stay simulated indefinitely). See `docs/architecture/backend-route-inventory.md` Section G for the full list.
- **Anomaly 4 (`/api/integrations/dispatch` has no UI caller)** → **open.** Build a webhook-dispatch feature to use the already-complete backend, or leave it as unused infrastructure?
- **MSW handler deletion for the 10 now-safe Phase 3b routes** → **open, mechanical but not yet done.** Every caller is confirmed payload-compatible; removal just hasn't been executed and re-verified as its own explicit step.

Nothing above is blocking further work — Phases 0–8 are all executed except where explicitly marked open.

---

## 4. Suggested execution order

Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 7 (tests) → Phase 5 → Phase 6 → Phase 8

Rationale: lock the rule in writing first so nothing drifts again while fixing it; fix data correctness before architecture (cheap, isolated, no regression risk per the earlier test audit); close the two live bypasses next (small, contained); then the two bigger consolidations (backend layer, taxonomy graph) which are the highest-value, highest-effort items; harden tests immediately after so the fixes are locked in by CI; persistence and backend-readiness are lower-urgency polish that can trail; Phase 8's inventory work naturally comes last since it depends on Phase 3b and Phase 6 both being underway to know what's worth auditing.

