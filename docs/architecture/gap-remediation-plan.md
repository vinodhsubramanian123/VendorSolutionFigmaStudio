# VSIP Gap Remediation Plan

> Source: `code_quality_analysis.md` (19-area multi-model sweep, delivered 2026-07-12).
> This doc tracks verified current-state counts (checked against a fresh clone at
> commit `626a090` before work started) and sequences remediation. Update the
> status column as each area lands; do not re-derive from scratch in future
> sessions — read this file first.

## Session handoff (read this first in a new thread)

**Patch `0007-area19-pessimistic-e2e.patch` is staged but NOT YET applied to
the real repo** — Vinodh needs to run it through Antigravity (it needs a real
browser to execute `npm run test:e2e`, which this sandbox doesn't have).
Verify against `git log --oneline` before trusting this section — if it's
stale, these commits will already be on `main`.

What it does: Area 19 (pessimistic E2E tests) — see the row below for full
detail. Everything except live Playwright execution has already been
verified (fresh-clone `git am`, tsc, eslint on both `src`+`server` and
`tests/e2e` separately, dependency-cruiser, jscpd, check-size, vitest —
569/569 unit/component tests passing). **The E2E suite itself has not been
run against this patch** — that's the one thing only Antigravity can do here.
Two follow-ups need Antigravity's judgment specifically, flagged inline in
the test files with comments:
1. `multi-ucid-isolation.spec.ts` — a real navigation bug was found (test
   looks for a "Select" button on the Reconciliation page; the actual
   component, `StepComparison.tsx`, only renders inside the Mission Control
   step wizard) and documented rather than blind-fixed. Needs a rewrite of
   the navigation, not just an unwrap.
2. `learning-loop.spec.ts`'s last test — one guard was deliberately left in
   place pending confirmation of mock-data UCID step ordering.

Patches produced prior to this session (in order, all verified via
fresh-clone `git am` + full audit battery, and now confirmed committed on
`main` via `git log`):
1. Areas 4 & 13 (dead vendor adapter code, motion import unification)
2. This plan doc's initial version
3. Areas 17 & 2-partial (Zod boundary validation now throws; non-server `any` erased)
4. Area 16 (Zustand store → slice pattern decomposition)
5. Areas 1 & 6 (server.ts monolith → route modules; reconciliation + taxonomy
   logic dedup against client utils)
6. Pipeline fixes: reverted a UI/MSW cross-boundary import (jscpd boundary
   violation), bumped Playwright timeouts to 15s for MSW-simulated latency,
   restored/regenerated 13 visual baselines.

**Iterations 1 and 2 are complete. Iteration 3 (Area 19) is now patched,
pending Antigravity's live-browser run.** Area 18 remains deliberately
deferred (see its row) — small mock datasets don't justify the regression
risk of virtualizing yet.

Also discovered this session, not yet in scope of any patch: `tests/e2e` is
not covered by `npm run lint` (same class of gap Area 6 found for
`server.ts`/`server/` before that got expanded). Pre-existing findings if it
were added: 4 `sonarjs/slow-regex` files, 1 `no-undef` file (`memlab.scenario.js`
needs Node globals in its ESLint env), 1 `prefer-const`, 1 unused-variable
warning. None introduced by this session's patch — confirmed via before/after
diff of a standalone `npx eslint tests/e2e` run. Worth a small follow-up patch
if Vinodh wants `tests/e2e` held to the same zero-tolerance bar as `src`/`server`.




## Status legend
✅ Done · 🔶 In progress · ⬜ Not started

## Priority matrix (verified counts as of this session)

| # | Area | Severity | Verified current state | Status |
|---|---|---|---|---|
| 4 | Dead adapter code | 🟢 Low | `vendorAdapter.ts` + `IVendorPortalAdapter.ts` had 0 consumers repo-wide (confirmed via grep before deletion) | ✅ Done |
| 13 | Motion import split | 🟠 Medium | 5 files on `framer-motion`, 76 on `motion/react` | ✅ Done |
| 17 | API boundary Zod bypass | 🔴 Critical | `apiClient.parseResponse()` now throws a descriptive Error on schema mismatch instead of warn-and-cast. Surfaced and fixed a real latent contract violation in `VendorIngestionDesk.test.tsx`'s MSW fixture in the process. Broader "optional schema param on get/post/put/delete" plumbing (doc's stated recommendation) not yet done — most call sites still don't validate at all; only the ones that already called `parseResponse` explicitly benefit so far. | 🔶 In progress |
| 16 | Zustand store monolith | 🔴 Critical | Decomposed into 7 domain slice files (`src/store/slices/`) + a shared `types.ts` composed via Zustand's slice pattern. Public `useCoreStore`/`CoreState` API unchanged — zero consumer or test churn. | ✅ Done |
| 2 | Unsafe `any` typing | 🔴 Critical | Fully done. Non-server slice (`missionControlUtils.ts`, `bomRepairUtils.ts`, `useBomConversion.ts`) fixed earlier. `server.ts`'s 11 `any` sites fixed during the Area 6 route extraction (`validateBody`'s schema param, `MockIngestSolution`/`CatalogItemType` in boq.ts, `jobStore`'s `MockJob` type, etc.) — zero `: any`/`as any`/`<any>` remain in `server.ts` or `server/`. | ✅ Done |
| 1 | Reconciliation logic duplication | 🔴 Critical | `server.ts`'s `/api/reconciliation/compare` now calls the same `calculateReconciliation()` used (and tested) client-side, instead of reimplementing it. Also found and fixed the same disease in `/api/taxonomy/check-constraints` (was re-inlining `checkHardwareConstraints`, a real client-consumed util) — jscpd caught it during Area 6 extraction. | ✅ Done |
| 6 | server.ts monolith | 🟡 High | Decomposed 692-line `server.ts` into `server/routes/*.ts` (one file per REST endpoint, 10 files) + `server/middleware/validateBody.ts`. `server.ts` is now a 113-line bootstrap (app setup, router mounting, Vite/static serving, lifecycle). Also discovered and fixed: `server.ts`/`server/` were entirely outside `npm run lint`/`check-size`/`lint:deps`/`lint:clones` (all `src`-only) — expanded all four. First real lint pass surfaced and fixed: unused `runIntegrationDiagnosticTestSuite` import (dead since a June refactor, confirmed via `git log -S`), `x-powered-by` header disclosure, several redundant re-assignments, several unused destructured fields, one genuine dead store, and a sha1→sha256 hash swap (display-only hash, no behavior dependency). Verified live via a running-server smoke test (not just vitest) since server.ts has no direct unit test coverage — see commit message for full endpoint-by-endpoint results. | ✅ Done |
| 7 | Prop drilling residue | 🟡 High | Not re-verified this session | ⬜ Not started |
| 9 | Typography scale chaos | 🟡 High | Confirmed **816** arbitrary `text-[Npx]` instances (321×10px, 228×9px, 115×11px, 42×9.5px, 37×8px, 34×10.5px, 28×8.5px, +11 other odd sizes) | ⬜ Not started |
| 11 | Shared component bypass | 🟡 High | Confirmed: 103 files use raw `<button>`, only 2 files import shared `<Button>`; `<Table>` still unconfirmed this pass | ⬜ Not started |
| 12 | Inline style proliferation | 🟡 High | Confirmed 150 `style={{` occurrences in `src/components/` | ⬜ Not started |
| 14 | onNavigate prop threading | 🟡 High | Not re-verified this session | ⬜ Not started |
| 18 | List virtualization bypass | 🟡 High | Investigated this session: only `CatalogCardsList.tsx` and `UCIDEventLedger.tsx` use `react-virtuoso`; ~7 other list-heavy components don't (`WebhookMonitor`, `ApiLogsTable`, `SystemTelemetry`, `DocumentPipelinePanel`, `MappingPanel`, `UcidPipelineCard`, `VendorStatusBoard`). But current mock datasets are tiny (single digits to ~30 records per domain, per `src/lib/mockData/*.ts`) — virtualizing now adds real complexity (fixed-row-height constraints, drag/filter/selection interactions that I can't visually verify without Playwright, which I don't have access to in this sandbox) for zero present-day benefit. Deliberately deferred, not skipped: revisit once real backend data volume is known, or do it as prep work immediately before backend integration lands, whichever comes first. If tackling this blind (no Playwright), do one component at a time with a visual-regression baseline recapture per component rather than batching. | ⬜ Deferred (reasoned) |
| 19 | Pessimistic E2E deficiencies | 🟡 High | Confirmed and patched (patch 0007, pending Antigravity's live-browser run): 27 `if (await el.isVisible())` silent-skip guards across 15 spec files, same anti-pattern already eradicated from the visual-regression suite. Severity varied — `master-lifecycle.spec.ts` Phase 5 could pass without ever proving the auto-heal→learning-loop chain works (three nested optional steps culminating in `if (learnedRule) {...assertions...}`); `hybrid-ingestion.spec.ts` had a stale locator (`Process Raw`) matching nothing in `src/`, masked by the guard for who knows how long; `dashboard.spec.ts`'s sidebar test had zero `expect()` calls at all. One deeper bug found and documented rather than blind-fixed: `multi-ucid-isolation.spec.ts` targets the wrong page entirely for its core assertion (needs a rewrite, not an unwrap — see inline comment). | 🔶 In progress (code patched, e2e execution pending) |
| 8 | Triple-source design tokens | 🔴 Critical | Not re-verified this session | ⬜ Not started |
| 10 | Cosmic Slate raw primitives | 🔴 Critical | Confirmed 29 files still using raw `gray-`/`sky-` Tailwind classes | ⬜ Not started |
| 3 | Inconsistent error handling | 🟡 High | Not re-verified this session | ⬜ Not started |
| 5 | Oversized components | 🟡 High | Not re-verified this session (check-size currently reports all files under 400 lines, so this is now a cognitive-complexity concern, not a hard limit violation) | ⬜ Not started |
| 15 | Accessibility gaps | 🟠 Medium | Not re-verified this session; note automated axe coverage already exists on all 13 nav-level views per prior UI/UX phase — this area is about the *remaining* manual gaps (icon-button labels, focus traps, keyboard div-buttons) axe doesn't always catch | ⬜ Not started |

## Sequencing (adopting the analysis's own iteration plan)

1. **Iteration 1 — Foundation (Types & State):** Areas 17 (Zod enforcement), 16 (Zustand decompose), 2 (`any` erasure)
2. **Iteration 2 — Architecture (Server):** Areas 1 (server/client dedup), 6 (server decomposition)
3. **Iteration 3 — Performance & Stability:** Areas 18 (virtualization), 19 (pessimistic tests)
4. **Iteration 4 — Design System (Tokens):** Areas 8 (token unification), 13 ✅, 4 ✅
5. **Iteration 5 — UI Enforcement (CSS):** Areas 9 (type scale), 10 (Tailwind violations), 12 (inline styles)
6. **Iteration 6 — Component Library:** Areas 11 (shared primitives adoption), 15 (accessibility)
7. **Iteration 7 — Cleanup:** Areas 7 (prop drilling), 14 (onNavigate), 5 (God components), 3 (error handling)

## Working notes
- All quick, self-contained, zero-consumer/zero-risk items (Areas 4, 13) are done first, out of sequence, since they carry no architectural risk and needed no design decisions.
- Iteration 1 is the correct next target: it's foundational (everything downstream — server split, store split, UI enforcement — either depends on or is made safer by strict typing and Zod-validated boundaries) and is explicitly called "Critical" severity across all three of its areas.
- Per established project discipline: any test written/changed during remediation must be verified via revert-and-confirm-fail. Every patch set gets a full fresh-clone `git am` verification (tsc, eslint, dependency-cruiser, jscpd, vitest) before being considered complete.
