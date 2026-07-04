# Antigravity Execution Guide — Data Architecture Cleanup (Phases 0–6 + Docs Sync)

**Read `docs/architecture/data-ownership.md` and `docs/architecture/data-architecture-plan.md` first** (they land via patch 0001). This file is the mechanical "apply these in this order" guide; those two are the "why."

## How to apply

All 8 patches are sequential — each builds on the last, in this exact order. Apply with `git am`, one at a time, verifying between each (commands below). Do not reorder, skip, or squash them; several later patches depend on files a specific earlier patch created or renamed.

```bash
git am 0001-phase-0-governance.patch
git am 0002-phase-1-mockdata-fixes.patch
git am 0003-phase-2-store-bypasses.patch
git am 0004-phase-3-backend-consolidation.patch
git am 0005-phase-4-taxonomy-graph.patch
git am 0006-phase-5-persistence.patch
git am 0007-phase-6-backend-readiness.patch
git am 0008-docs-sync.patch
```

If `git am` reports a conflict against work already on your branch (e.g. from a separate PRD-thread session), resolve it in favor of preserving **both** changes where they touch different concerns, and re-run `npm run lint && npm run test:vitest` before continuing to the next patch — don't apply patch N+1 on top of an unverified conflict resolution of patch N.

## Verification after every single patch (not just at the end)

```bash
npx tsc --noEmit --skipLibCheck   # must be 0 errors
npx eslint src                     # must be 0 errors (warnings pre-exist, ignore count drift)
npx vitest run                     # must be 0 failures
```

Every patch in this sequence was verified this exact way before being cut — full green, not spot-checked. If any of these three fail after applying a patch, stop and diagnose before applying the next one; don't apply the next patch hoping it'll be unrelated. (This exact discipline caught real bugs mid-session — see 0006 and 0007's notes below.)

---

## Patch-by-patch summary

### 0001 — Phase 0: Governance (docs only, zero code changes)
Codifies the rule that caused everything else: `coreStore.ts` is the single owner of entity data (catalog, vendors, solutions, ucids). Extends `AGENTS.md` §13.6 with two new subsections (§13.6a: simulated-backend layers must never fork a competing copy of entity data; §13.6b: async jobs go through `apiClient.streamJob()`'s interface). Adds `docs/architecture/data-ownership.md` (the durable "why," including the git-forensic timeline of how this drifted) and `docs/architecture/data-architecture-plan.md` (the full audit + phase plan, now complete through Phase 6).

### 0002 — Phase 1: Mockdata correctness
Fixes real arithmetic bugs in `ucidsComputeStorage.ts` — three vendor-submission totals didn't equal `sum(items.unitPrice × quantity)`, off by $28K–$182K. Fixes a duplicate price for the same part number (`400-BPSB`: $1,195 vs. canonical $1,190). Standardizes 3 mislabeled switch/gateway SKUs from `"Network Adapter"` to `"Chassis"`, and a GPU mislabeled as `"Processor"` to a new `"GPU"` category. Promotes `CatalogSKUSchema.type` from an unconstrained `z.string()` to a shared enum with `BOMItemSchema` — **this tightening caught a live bug**: `TaxonomyGraphSidebar.tsx` was writing the literal string `"Chassis Option"` (not a valid category) into the `type` field; fixed and now type-guarded so that class of typo can't compile again.

### 0003 — Phase 2: Close two confirmed store bypasses
`VendorIngestionDesk.tsx` was importing a raw `VENDORS` array directly instead of reading `useCoreStore(s => s.vendors)` — invisible to any heal/fix action. Fixed by threading `vendors` down from `VendorPortal.tsx`, which already had it (matches the pattern every other prop in that component already uses). `CleansingView.tsx`'s `entries` were seeded via a one-shot `useState` initializer that never re-derived when `catalogSkus` changed later. **Important nuance**: a naive `useMemo` swap (the originally-planned fix) would have been a regression, not a fix — `entries` also holds in-progress user work (manual mappings, quarantines) that a pure recompute would silently discard. The actual fix merges a fresh catalog-derived baseline in per-entry while preserving anything the user already reviewed (tracked via `reviewedAt`).

### 0004 — Phase 3a done, Phase 3b explicitly deferred (not silently skipped)
**3a (done)**: Retired `api-mock.ts`'s competing 2-SKU catalog stub (`serverState.catalog`, with ids like `sku-seed-1` that never matched the real 38-SKU catalog) — this was the direct cause of `CatalogManager` price edits silently rolling back (`updateCatalogSku` threw "SKU not found" for any real id). Catalog CRUD is now a stateless pass-through. Rewrote two tests that were asserting the *old buggy behavior* as correct.

**3b (investigated, deliberately not executed)**: Found 10 routes where MSW and `server.ts` both implement the same path — MSW always wins (shadows `server.ts` entirely in dev). Spot-checked 2 of them against `server.ts`'s strict Zod validation and found real payload mismatches (`NLPParser.tsx` posts a shape that doesn't match `PlaywrightRunRequestSchema` at all; `useBoqIntake.ts` sends an unvalidated value as `presetType`). **Do not blanket-delete the other 8 MSW handlers without doing the same payload-vs-schema check first** — see `docs/architecture/data-architecture-plan.md` Phase 3b for the exact remaining steps and the 2 known-broken callers to fix first.

### 0005 — Phase 4: Taxonomy Graph rewired to real data
Replaced the graph's network round-trip with a pure client-side derivation (`deriveGraphFromConfig` in `useCatalogGraphData.ts`) built from real BOM items crossed against `catalogSkus`. **Found a second bug while wiring this in**: `TaxonomyGraphView.tsx` was passing the *UCID's* id into a lookup that only matches *config* ids — the internal guard always failed for any real UCID, which is the actual mechanism behind "the graph always shows the same thing no matter what's selected." Fixed to default to the first real config id. Orphan-mapping now writes to `coreStore.catalogSkus` directly (visible on Dashboard/Catalog Manager/Cleansing immediately, not just this view). Generic node/edge edits live in a local overlay that survives a `catalogSkus` change instead of being wiped (same principle as 0003's `CleansingView` fix). Retired the fictional `memoryGraphNodes`/`memoryGraphEdges` mock data and 5 dead MSW routes, only after confirming zero remaining callers.

### 0006 — Phase 5: Persistence guards + reset action
Added `version`/`migrate` guards to the 3 stores that were missing them (`ingestionStore`, `workflowStore`, `auditStore` — `coreStore` already had this). Added `src/lib/resetSeedData.ts` + a "Reset to Seed Data" button (System Telemetry page, with an explicit confirm step since it's destructive) to get back to pristine mock data on demand instead of manually clearing browser storage. Added optional `VITE_RESET_ON_LOAD` env flag for deterministic CI/demo runs.

### 0007 — Phase 6: Backend-readiness guardrails
Added an ESLint rule banning direct `fetch()` in `src/components/**`/`src/hooks/**` (0 existing violations — the boundary was already respected, now it's enforced going forward). Found `apiClient.parseResponse()` was called at **zero** of ~35 entity-data call sites despite existing — retrofitted it at 4 verified-compatible call sites, left the rest as an explicit scoped follow-up (same discipline as 3b — one response shape, `/api/boq/ingest`'s, was checked and found *not* to match its "obvious" schema). Fixed 12 test files whose `apiClient` mocks were missing `parseResponse` entirely (only 1 was actually broken by this patch; fixed all 12 proactively). Replaced `streamJob()`'s single-GET-dressed-as-"SSE" with genuine interval-based polling, and upgraded the MSW job handler to track real incremental progress per job id — confirmed `server.ts`'s real job endpoint already does the identical increment-per-poll pattern independently, which is why polling (not push) is documented as the deliberate choice, not a legacy fallback. **Also fixed a real `react-hooks/refs` lint error introduced in patch 0005** (reading a ref during render) — only caught because this was the first patch where `eslint` was actually run, not just `tsc --noEmit`. No other latent errors were found in 0001–0006's code when eslint finally ran across all of it, but that was unverified luck until this patch, not something actually checked at the time it was written.

### 0008 — Documentation sync (docs only, zero code changes)
The live docs `.agents/skills.md` points agents at (`docs/state-contracts.md`, `docs/api-contracts.md`, `docs/ui-specs/taxonomy-graph-skills.md`) were stale — in `api-contracts.md`'s case, actively contradicting patch 0007's new fetch-ban rule, and documenting graph API endpoints that never existed even before this cleanup. All three rewritten to match what patches 0001–0007 actually built. If you only read one file before starting new work in this codebase, make it `docs/architecture/data-ownership.md` (from 0001), not this one — this patch just makes sure the *rest* of the docs agree with it.

---

## What's explicitly still open (tracked, not forgotten)

1. **Phase 3b**: 8 remaining MSW-vs-`server.ts` route collisions need the same per-route payload-vs-schema audit done for the 2 already checked, before their MSW handlers can be safely removed.
2. **Phase 6 follow-up**: ~30 remaining `apiClient` call sites don't yet validate responses via `parseResponse` — same audit discipline required (check the schema actually matches the real response shape before wiring it in; `/api/boq/ingest` already proved the "obvious" schema can be wrong).
3. **`snapshotHandlers.ts` vs `server.ts`**: a 10th MSW/`server.ts` collision on `/api/ucids/:ucid/snapshots`, found while writing patch 0008's docs but not part of the original 9-route Phase 3b count — needs the same audit.
4. **Taxonomy graph config selector**: `TaxonomyGraphView.tsx` has `selectedConfigId` state but no UI control to change it — always defaults to the first config. Only matters if a UCID has multiple vendor configs a user needs to switch between manually in this view.
5. **`TaxonomyOrphanBox.tsx`**: confirmed fully dead code (zero imports anywhere), left in place rather than deleted since file deletion is higher-risk than the route/data cleanup done elsewhere in this effort. Safe to delete in a future pass.

None of these block using the app or building on top of it — they're scoped, documented follow-ups, not hidden gaps.
