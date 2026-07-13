# VSIP Gap Remediation Plan

> Source: `code_quality_analysis.md` (19-area multi-model sweep, delivered 2026-07-12).
> This doc tracks verified current-state counts (checked against a fresh clone at
> commit `626a090` before work started) and sequences remediation. Update the
> status column as each area lands; do not re-derive from scratch in future
> sessions — read this file first.

## Session handoff (read this first in a new thread)

As of this session, **5 patches are staged but NOT YET applied to the real
repo** — Vinodh is batching them with Antigravity at the end of this thread.
A new Claude session should assume the patches below are either (a) already
applied, in which case `git log` will show these commits and this section is
stale — verify against `git log --oneline` before trusting it, or (b) not yet
applied, in which case ask Vinodh whether Antigravity has run them yet before
starting new work, since building on top of unapplied patches will produce
patches that don't apply cleanly.

Patches produced this session (in order, all verified via fresh-clone `git am`
+ full audit battery together, not just individually):
1. Areas 4 & 13 (dead vendor adapter code, motion import unification)
2. This plan doc's initial version
3. Areas 17 & 2-partial (Zod boundary validation now throws; non-server `any` erased)
4. Area 16 (Zustand store → slice pattern decomposition)
5. Areas 1 & 6 (server.ts monolith → route modules; reconciliation + taxonomy
   logic dedup against client utils)

**Iteration 1 (Foundation) and Iteration 2 (Server Architecture) are both
complete.** Next up per the sequencing below: **Iteration 3 — Areas 18
(deferred, see its row) and 19 (pessimistic E2E tests)**.

Areas 18 was investigated this session and deliberately deferred (see its
row below for why) rather than actioned — that's not the same as "not started."



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
| 19 | Pessimistic E2E deficiencies | 🟡 High | Not re-verified this session | ⬜ Not started |
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
