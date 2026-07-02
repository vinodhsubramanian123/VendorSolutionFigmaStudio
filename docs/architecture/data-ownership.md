# Data Ownership Hierarchy

**Read this before adding, editing, or seeding any entity data (catalog, vendors, solutions, ucids, forensic issues, sourcing rules) anywhere in this codebase.**

This doc exists because that rule was violated silently across several agent sessions — a pre-Zustand mock catalog in `api-mock.ts` was never retired when `coreStore.ts` became the source of truth, producing real bugs (e.g. Catalog Manager price edits silently rolling back). See `AGENTS.md` §13.6, §13.6a, §13.6b for the enforceable rules; this doc is the "why," kept short on purpose so it stays maintained.

## The hierarchy

```
src/lib/mockData/*.ts   →  seeds coreStore ONCE, on init          [entity data]
src/lib/constants/*.ts  →  imported directly anywhere              [config, not entity data]
                              (STEP_ORDER, UCID_STEPS, CATALOG_TREND)

coreStore.ts (Zustand)  →  the ONLY owner of entity data at runtime
  ↓ useCoreStore(s => s.X) selectors

Components / hooks       →  read/write ONLY via store selectors
                              never import an entity mock array directly

MSW / server.ts          →  latency + async-job simulation ONLY
                              never a second independent copy of entity data
```

## Two categories of data — know which one you're touching

| Type | Examples | Rule |
|---|---|---|
| **Entity data** — mutable, healable, shown across multiple screens | `catalogSkus`, `vendors`, `ucids`, `solutions`, `forensicIssues`, `sourcingRules` | Must go through `coreStore`. Never import the raw seed file in a component. |
| **Reference/config constants** — fixed, never mutated at runtime | `STEP_ORDER`, `UCID_STEPS`, `CATALOG_TREND` | Fine to import directly — this is config, not state. |

If you're about to write `const X = [...]` with hand-seeded data that overlaps something `coreStore` already holds — stop. That's the exact pattern that produced four disconnected data universes (see "History" below).

## `server.ts` vs. MSW

`server.ts` (real Express server, started by `npm run dev` via `tsx server.ts`) is the designated seam for future real-backend logic — it's a real Node process and can eventually do real work (spawn a Playwright run, hit a real DB, etc). MSW is browser-sandboxed and structurally cannot.

**MSW must not duplicate a route `server.ts` already implements.** MSW is configured with `onUnhandledRequest: 'bypass'` — it only intercepts requests it has a handler for and lets everything else fall through to the network. If MSW defines a handler for a route `server.ts` also defines, MSW wins every time in dev mode, and `server.ts`'s implementation becomes permanently unreachable dead code. This already happened for `/api/agents/run`, `/api/boq/ingest`, `/api/jobs`, `/api/portfolio/orchestrate`, `/api/reconciliation/compare`, `/api/taxonomy/check-constraints`, and `/api/integrations/dispatch` — MSW currently shadows all of them.

`/api/agents/run` in `server.ts` is an honest "Simulator" — canned log lines, no real Playwright execution. It is **not** connected to any real portal-automation codebase. Don't mistake it for one.

## Async jobs

Anything genuinely slow on a real backend (PDF ingestion, multi-vendor solution generation, CLIC checks) is modeled as a job — `POST → job_id → progress` — even while mocked as near-instant. This flows through `apiClient.streamJob()`'s `onMessage`/`onError` interface. Components only depend on that interface; the implementation behind it (currently a single fake message + one real GET) can be swapped for genuine `EventSource`/WebSocket/polling later with zero component changes.

## History (why this doc exists)

- **2026-06-09 → 06-21**: App built entirely on `api-mock.ts` + MSW as the only "backend." No centralized client state yet.
- **2026-06-21**: `catalogPart1.ts` / `catalogPart2.ts` (the real 38-SKU catalog) created.
- **2026-06-27** ("Phase 12"): `coreStore.ts` introduced — first-ever Zustand usage in the repo. This is the correct, current architecture. The same commit deleted ~30 `.agents/skills/*.md` / `docs/skills/**/*.md` files that documented planned backend services (`PartRegistryService`, `ExperienceSynthesizer`, canonical SKU normalization) for a *different*, more backend-heavy system — those docs were never reconciled with what actually got built here.
- **api-mock.ts's competing 2-SKU catalog was never retired** after the Phase 12 pivot, and was still being edited afterward (2026-06-29) without ever being reconciled with the real 38-SKU catalog. This is the root cause of the Catalog Manager price-rollback bug.

Full investigation trail, issue table, and phased fix plan: `docs/architecture/data-architecture-plan.md`.
