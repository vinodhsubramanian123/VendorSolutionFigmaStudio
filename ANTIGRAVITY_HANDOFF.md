# Antigravity Handoff — Phase 3b, Phase 8 (route inventory + anomalies), Phase 6 kickoff

**12 patches, numbered 0001–0012, apply in sequence via `git am` against a fresh `main`. Verified clean.**

```bash
git clone https://github.com/vinodhsubramanian123/VendorSolutionFigmaStudio
cd VendorSolutionFigmaStudio
git am /path/to/0001-*.patch /path/to/0002-*.patch ... /path/to/0012-*.patch
# or, if all patches are in one directory:
git am /path/to/patches/*.patch
```

This exact sequence was tested end-to-end in this session: fresh `git clone` of `main` → `git am` all 12 in order → zero conflicts → `npm install` → `tsc --noEmit` clean → full `vitest run` → **92 test files, 455 tests, 0 failures.**

---

## What this covers

1. **Phase 3b** (patches 0001–0006): the 10 MSW-vs-`server.ts` route collisions flagged as deferred in the previous session, now fully traced and fixed.
2. **Phase 8** (patches 0007–0009, 0012): building the response-validation inventory Phase 6 needed surfaced a much bigger structural finding — a definitive backend route inventory, 4 named anomalies, 2 of them fixed.
3. **Phase 6 kickoff** (patches 0010–0011): starting the real-route `parseResponse` hardening found 2 more landmines beyond the original 10.

**Net result: 8 real, previously-invisible bugs found and fixed this session**, every single one masked by the same root cause — MSW doesn't enforce the same validation `server.ts` does, so nothing in the dev/test loop could ever have caught them.

---

## Patch-by-patch

| # | Title | What it fixes |
|---|---|---|
| 0001 | `fix(ingestion): validate JobContext.solution_id...` | `useBoqIntake.ts` blind-cast an untyped, cross-flow-reused context field into `/api/boq/ingest`'s `presetType` enum. Added schema validation at the boundary with a safe fallback. |
| 0002 | `fix(forensics): remove NLPParser.tsx's dead/incorrect calls...` | `NLPParser.tsx` called `/api/agents/run` (the Playwright scraper endpoint) with a chat message payload — wrong endpoint entirely, would have silently dead-ended the rule-drafting conversation once MSW's permissive validation went away. Removed the calls; no real backend work belonged there. |
| 0003 | `fix(ingestion): resolve selectedBomsForBatch ids...` | `triggerBatchReconciliation` sent bare UCID id strings to `/api/reconciliation/compare`, which requires full solution objects. Fixed to resolve ids → objects, matching the sibling call in the same file. |
| 0004 | `fix(ingestion): guard handleStartPortfolioPipeline...` | Empty-`ucids` fallback produced `id: undefined` — reachable via direct stepper navigation, not just a theoretical edge case. Guarded with a toast instead of sending an invalid payload. Also rewrote a test that had encoded the bug as expected behavior. |
| 0005 | `fix(forensics): make runAuditScanner actually poll...` | `runAuditScanner` treated `POST /api/jobs`'s response as an already-completed result (only true under MSW), showing a false-positive "scan complete" in the compliance/audit tool before any real work happened. Fixed to poll `GET /api/jobs/:id` to a genuine terminal state. |
| 0006 | `fix(reconciliation): wrap the created snapshot...` | Two callers of `/api/ucids/:id/snapshots` used opposite payload conventions; one matched `server.ts`, the other matched MSW. Fixed the one that didn't match the real server. |
| 0007 | `docs(architecture): add definitive backend route inventory...` | New doc: `docs/architecture/backend-route-inventory.md`. Full cross-reference of `server.ts`'s 13 routes, MSW's 41 routes, and every one of 39 live `apiClient` call sites. |
| 0008 | `fix(taxonomy): migrate edge-weight updates...` | `EdgeEditorPanel.tsx` called a route removed in the Phase 4 graph migration, never implemented in `server.ts` either — broken in every environment including local dev, not just production. Migrated to the existing client-side overlay pattern. Also deleted 6 fully dead `apiClient` methods with zero callers. |
| 0009 | `fix(vendor-portal): collapse vendor sync/toggle...` | Architectural decision executed: `server.ts`'s only real vendor route had no callers; two components called two different nonexistent routes instead. Extended `server.ts`'s dispatcher with action-specific response fields, rerouted both callers, and fixed MSW (which also didn't implement the real route) to match. |
| 0010 | `fix(boq): extract solutions from the nested ucid.solutions shape...` | `server.ts`'s real `/api/boq/ingest` response nests `solutions` under a full `ucid` object; MSW duplicates it at the top level as a convenience. Two callers read the top-level field only — against the real server this was always `undefined`, silently no-opping BOQ-to-UCID provisioning in one caller and the entire Mission Control intake step in the other. |
| 0011 | `fix(taxonomy): correct check-constraints field names...` | Second caller of `/api/taxonomy/check-constraints` used entirely wrong field names, invisible under MSW (which doesn't read the request body for this route at all). |
| 0012 | `chore(test): remove unused UCID import...` | Trivial lint cleanup found during the final full-repo verification diff against the pristine baseline. |

---

## Verification performed (this session, not asserted)

- Every patch: `tsc --noEmit --skipLibCheck` clean, targeted test suite run, and a **revert-and-confirm-fail check** — the new/changed test was verified to actually fail against the pre-fix code before being verified to pass with the fix. This caught one of my own mistakes along the way (see below).
- Full repo, after all 12 patches: `tsc --noEmit` clean, `npx eslint src server.ts` diffed line-by-line against the pristine pre-session baseline (only one genuinely new item across all 12 patches — the trivial unused import fixed in 0012), full `vitest run` → **92 files / 455 tests / 0 failures**.
- The exact `git am` sequence was tested against a **fresh `git clone`**, not just applied incrementally in a working sandbox — this is what Antigravity will actually do, so it's what was tested.

**One process note worth keeping:** while writing patch 0010's regression test, the first version of the assertion used a `\d+`-style regex that still matched "created with 0 configuration" — i.e., it would have silently passed against the very bug it was meant to catch. This was only caught because of the revert-and-confirm-fail discipline, not because the mistake was obvious on read-through. Worth remembering next time a test "passes" on the first try — that's not sufficient evidence it actually tests anything.

---

## What's deliberately NOT in these patches

- **Deleting the now-safe MSW handlers** for the 10 Phase 3b routes. Every caller is confirmed payload-compatible with `server.ts`, so removal is mechanical — but "the caller is right" and "it's safe to delete the handler that was masking it" are different claims worth verifying separately (re-run the full suite with each handler actually gone).
- **The 31 MSW-only routes** (Section B of `backend-route-inventory.md`) — entire subsystems (Catalog CRUD, Solutions CRUD, Cleansing, Taxonomy Graph server-side, Forensic Auto-Heal's mutation endpoint, vendor telemetry) with no real backend at all. This is a scoping decision, not a bug fix — see the route inventory doc's Section G for the open question.
- **Anomaly 4** (`/api/integrations/dispatch` has a complete backend and zero UI callers) — product decision, not a bug.
- **The remaining ~13 real-route `apiClient` call sites** not yet wrapped in `parseResponse` — spot-checked for the same class of bug that produced landmines #7 and #8, none found, but not formally hardened. Lower priority: most either have simple/stable response shapes (`job_id` extraction) or fully discard the response already.

All of the above are captured with full reasoning in `docs/architecture/data-architecture-plan.md` (Phase 3b and Phase 8 sections) and `docs/architecture/backend-route-inventory.md` — read those before starting new work in this area rather than re-deriving any of this.

---

## Recommended next session

Start with `docs/architecture/data-architecture-plan.md`'s "Open decisions" section (§3) — three concrete decisions are sitting there waiting on product input, not engineering. Everything else is either done or explicitly scoped as a follow-up with its own checklist.
