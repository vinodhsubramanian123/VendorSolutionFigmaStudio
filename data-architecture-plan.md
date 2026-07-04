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
| 8 | `api-mock.ts` holds its own 2-SKU `serverState.catalog` with different ids than the real 38-SKU catalog | `src/lib/api-mock.ts` | 🔴 |
| 9 | **Live bug:** `CatalogManager` price edits get silently rolled back — real SKU ids never match Universe 2's stub catalog, `PUT` throws "SKU not found" | `src/components/catalog/CatalogManager.tsx` + `MockCatalogApi.updateCatalogSku` | 🔴 |
| 10 | `GET /api/solutions` always returns `[]`, disconnected from the 3 real seeded solutions | `src/mocks/routes/workflowHandlers.ts` | 🔴 |
| 11 | `server.ts` (real Express backend, started by `npm run dev`) has genuine routes for `/api/agents/run`, `/api/boq/ingest`, `/api/jobs`, etc. — but MSW's `onUnhandledRequest: 'bypass'` still intercepts first because MSW defines handlers for the *same* routes, so `server.ts` is fully shadowed in dev | `server.ts` vs `src/mocks/handlers.ts` / `workflowHandlers.ts` | 🔴 |
| 12 | `/api/agents/run` in `server.ts` is explicitly a "Simulator" (canned log lines) — not connected to any real Playwright automation | `server.ts` | 🟡 (expected today, flag for later) |
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
- [ ] Delete `serverState.catalog` from `api-mock.ts`. Make `/api/catalog` (`GET`/`POST`/`PUT`/`DELETE`) pass-through handlers: accept the payload, echo it back wrapped in `wrapSuccess(...)`, hold no independent array.
- [ ] Fix `GET /api/solutions` to actually return something derived from real data (or, once Phase 4's approach is applied elsewhere, simply retire this route in favor of direct store reads — no network round-trip needed for data the store already has).
- [ ] Resolve the MSW-vs-`server.ts` shadow collision: since `server.ts` is the better long-term home for real backend logic (Node process, can eventually shell out to real work), remove the MSW handlers that duplicate routes `server.ts` already implements (`/api/boq/ingest`, `/api/reconciliation/compare`, `/api/agents/run`, `/api/jobs*`, `/api/portfolio/orchestrate`, `/api/taxonomy/check-constraints`, `/api/integrations/dispatch`). Keep MSW only for routes with no `server.ts` counterpart (catalog/solutions pass-through, graph, telemetry) until those are migrated too.
- [ ] Leave `/api/agents/run`'s "Simulator" framing as-is for now — it's honest about what it is — but note in the architecture doc that it is not connected to any real Playwright automation, so nobody mistakes it for one later.

### Phase 4 — Rewire Taxonomy Graph to real data (issues #13–15)
- [ ] Replace the `GET /api/graph/solution/:ucid` network round-trip with a client-side derivation: build `nodes` from the selected config's real BOM `items`, cross-referenced against `catalogSkus`; build `edges` from `chassisRef`/category relationships; build `unmappedIds` from BOM items whose `partNumber` has no catalog match. Pure function, no backend needed, and removes the simulated 600ms `delay()` — directly addresses wanting this "smooth and fast."
- [ ] Rewire `mapNode`, `healOrphanMapping`, `addGraphNode`, `updateGraphNode`, `addRule` (in `useCatalogGraphData.ts`) to call `setCatalogSkus` (updating the matched SKU's `category`/`chassisRef`/classification fields), in addition to their local graph-view state. This is what makes a visual drag-and-drop fix actually show up in Dashboard, Catalog Manager, and Cleansing simultaneously.
- [ ] Once read + write both derive from/write to `coreStore`, retire `memoryGraphNodes`/`memoryGraphEdges` in `sharedState.ts` for this feature — they become dead weight.

### Phase 5 — Persistence & session integrity (issues #16–17)
- [ ] Add `version` + `migrate` guards to `ingestionStore.ts`, `workflowStore.ts`, `auditStore.ts`, matching the pattern already in `coreStore.ts`.
- [ ] Add a "Reset to seed data" dev action that clears all four `localStorage` keys (`vsip-core-storage`, `vsip-ingestion-storage`, `vsip-workflow-storage`, `vsip-audit-logs`) and reloads — gives a reproducible clean-slate on demand instead of manually clearing browser storage.
- [ ] Optionally: a `VITE_RESET_ON_LOAD` env flag your test setup (Vitest/Playwright) can use to force fresh mock data every run, avoiding state-leak flakiness between test runs.

### Phase 6 — Backend-readiness guardrails (issue #18, forward-looking)
- [ ] Confirm every write from UI already goes through `apiClient` (no direct `fetch()` in components) — enforce as a lint rule if not already.
- [ ] Confirm every `apiClient` response for entity data is parsed via `parseResponse<T>(schema, data)` — no exceptions.
- [ ] Implement a real `streamJob()` body (genuine `EventSource`, WebSocket, or real interval polling) behind the *same* method signature `JobStreamer.tsx` already consumes — no component changes required when this lands.
- [ ] Treat anything that will be genuinely slow on a real backend (PDF ingestion, multi-vendor solution generation, CLIC/compatibility checks) as job-based (`POST → job_id → stream progress`) even while mocked as near-instant, so the eventual backend integration is a timing change, not a structural one.

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
