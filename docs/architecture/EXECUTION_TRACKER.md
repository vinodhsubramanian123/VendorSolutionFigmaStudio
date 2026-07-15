# VSIP Remediation Execution Tracker

**Status:** Active — this file is a temporary working document.
**Lifecycle:** Delete this file once every row below is ✅. Before deleting,
fold anything still relevant into the permanent docs (`AGENTS.md` §18/§19,
`gap-remediation-plan.md`, `ui-ux-100-checklist.md`, `data-architecture-plan.md`)
so no learning is lost when this file goes away.
**Do not re-derive scope from scratch in a new session — read this file first,**
same rule as the other continuity docs.

## How to use this file
- **Owner** = who executes: `Claude` (no browser needed, drafts/verifies in sandbox), `Antigravity` (needs browser/local git/push), `Vinodh` (product decision required).
- **Verification** = the exact command/check that proves the row is done — not "looks right," a concrete pass/fail.
- **Status**: ⬜ not started · 🔶 in progress · ✅ done · 🚫 blocked (see Depends On)
- **Learnings/Feedback**: filled in *while doing the work*, not after. If something surprising is found (a real bug hiding behind a lint rule, a doc that was wrong, a false assumption), write it here immediately. When the row closes, this text — or a trimmed version of it — gets copied into `AGENTS.md` §18/§19 in the existing Issue/Root cause/Fix/Rule format. Nothing gets lost between "found it" and "documented it."
- **Every row's Verification must actually be run and its real output pasted or referenced** before marking ✅ — per this project's existing standard (revert-and-confirm-fail for tests, fresh-clone `git am` for patches). No row gets marked done on a claim alone.

---

## Step 0 — Decision gate (Vinodh, blocks nothing else but unblocks 4 downstream rows)

| ID | Task | What's needed | Depends on | Verification | Status | Learnings/Feedback |
|---|---|---|---|---|---|---|
| 0.1 | Decide scope of 31 MSW-only routes | Read `backend-route-inventory.md` §G, pick which subsystems get real `server.ts` implementations and in what order | — | Decision recorded in this row | ⬜ | |
| 0.2 | Decide Anomaly 1 — vendor routing | Collapse to `/api/vendor/portal` vs. add real `/api/vendors/sync`+`/toggle` | — | Decision recorded in this row | ⬜ | |
| 0.3 | Decide Anomaly 4 — `/api/integrations/dispatch` | Build webhook-dispatch UI feature, or leave backend unused | — | Decision recorded in this row | ⬜ | |
| 0.4 | Decide cleansing mock-data divergence | Unify the two match-status computation strategies, or leave as documented inconsistency | — | Decision recorded in this row | ⬜ | |

---

## Step 1 — Doc hygiene (Antigravity, ~10 min, no code risk)

| ID | Task | What to do | Depends on | Verification | Status | Learnings/Feedback |
|---|---|---|---|---|---|---|
| 1.1 | Fix stale `0007` status in `gap-remediation-plan.md` | Handoff section says "staged but NOT YET applied" — it's merged (`a38bd8c`, `6073b50` +3). Correct the text. | — | `git log --oneline` shows commits on `main`; doc text matches | ⬜ | |
| 1.2 | Fix stale multi-ucid/hybrid-ingestion status in same doc | Doc says these need a navigation rewrite — already fixed in `a38bd8c` via real `StepComparison.tsx` change | — | Diff `a38bd8c`, confirm fix is real not a guard workaround | ⬜ | |

---

## Step 2 — Zero-decision mechanical fixes (Antigravity, batch together, no browser needed for most)

| ID | Task | What to do | Depends on | Verification | Status | Learnings/Feedback |
|---|---|---|---|---|---|---|
| 2.1 | Remove/justify undocumented `isVisible()` guard | `tests/e2e/reconciliation.spec.ts` — `if (await closeBtn.isVisible()) { await closeBtn.click(); }`, no comment, no assertion after | — | Guard removed or replaced with a real assertion; revert-and-confirm-fail | ⬜ | |
| 2.2 | Anomaly 2 — dead edge-weight route fix | Contained fix, matches an existing working pattern exactly | — | Route reachable, matching pattern confirmed via manual/unit test | ⬜ | |
| 2.3 | Anomaly 3 — delete 6 orphaned methods | Already confirmed dead via grep — verify again via `git log -S` before deleting (project standard) | — | `git log -S"<method>"` for each of the 6; 0 consumers confirmed | ⬜ | |
| 2.4 | Confirm/delete `IngestBOMRequest`/`IngestBOMResponse` | Looks unused in `src/types/models/api.ts`, never confirmed dead | — | `git log -S"IngestBOMRequest"` and `-S"IngestBOMResponse"`; grep 0 consumers | ⬜ | |
| 2.5 | Delete MSW handlers for the 10 now-safe Phase 3b routes | Every caller already confirmed payload-compatible — mechanical removal | — | `npm run test` (vitest) green after removal; grep confirms no remaining references | ⬜ | |
| 2.6 | Document `React.lazy` graphify blind spot | Add note to `.agents/rules/graphify.md`: lazy-loaded route components misreport as isolated | — | File diff reviewed | ⬜ | |
| 2.7 | Document `server/` graph coarseness limitation | Add note: server graph is file-level only, no endpoint/handler nodes — don't trust it for call-chain questions yet | — | File diff reviewed | ⬜ | |

---

## Step 3 — Area 17: API boundary Zod enforcement (Claude drafts + self-verifies, Antigravity pushes)

| ID | Task | File / call site | Depends on | Verification | Status | Learnings/Feedback |
|---|---|---|---|---|---|---|
| 3.1 | `parseResponse` hardening | `useSnapshotManagerLogic.ts:48` | — | `vitest` green; revert-and-confirm-fail on the new/changed assertion | ⬜ | |
| 3.2 | `parseResponse` hardening | `useMissionControlWorkflow.ts:33`, `:198` | — | same | ⬜ | |
| 3.3 | `parseResponse` hardening | `StepBoqIntake.tsx:38` | — | same | ⬜ | |
| 3.4 | `parseResponse` hardening | `useBoqIntake.ts:134`, `:149` | — | same | ⬜ | |
| 3.5 | `parseResponse` hardening | `useBomConversion.ts:166` (response discarded — lowest priority) | — | same | ⬜ | |
| 3.6 | `parseResponse` hardening | `usePortfolioComparison.ts:41`, `:64` | — | same | ⬜ | |
| 3.7 | `parseResponse` hardening | `useStepIntakeLogic.ts:52` | — | same | ⬜ | |
| 3.8 | `parseResponse` hardening | `useForensicAutoHeal.ts` (jobs call) | — | same | ⬜ | |
| 3.9 | `parseResponse` hardening | `TaxonomyGraphSidebar.tsx:79` | — | same | ⬜ | |
| 3.10 | `parseResponse` hardening | `WebhookMonitor.tsx:25` (fire-and-forget — lowest priority) | — | same | ⬜ | |
| 3.11 | `parseResponse` hardening | `ReconciliationOverview.tsx:70` | — | same | ⬜ | |
| 3.12 | Full-battery verification | tsc, eslint, dependency-cruiser, jscpd, vitest on fresh clone after all of 3.1–3.11 land | 3.1–3.11 | Fresh-clone `git am` + full audit battery, all green | ⬜ | |

---

## Step 4 — Real Area 19: failure-path testing (Claude drafts + self-verifies — Vitest+MSW only, no browser needed)

| ID | Task | What to do | Depends on | Verification | Status | Learnings/Feedback |
|---|---|---|---|---|---|---|
| 4.1 | Backend 500 injection tests | `.use(http.post(..., () => new HttpResponse(null, {status:500})))` pattern across key mutation endpoints | 0.1 (need to know which routes are real vs. MSW-only) | New tests fail against unpatched code, pass after; revert-and-confirm-fail | ⬜ | |
| 4.2 | Timeout injection tests | Simulate slow/hanging responses, assert timeout handling | 0.1 | same | ⬜ | |
| 4.3 | Validation rejection tests | 400-class responses, assert error surfacing | 0.1 | same | ⬜ | |
| 4.4 | Optimistic-mutation rollback tests | Assert UI reverts correctly when a save fails after an optimistic update | — | same | ⬜ | |
| 4.5 | Full-battery verification | vitest full suite green, no regressions in the 541 existing tests | 4.1–4.4 | `npm run test` full run | ⬜ | |

---

## Step 5 — Design system consolidation (Claude drafts, Antigravity does visual verification per-component)

| ID | Task | Scope | Depends on | Verification | Status | Learnings/Feedback |
|---|---|---|---|---|---|---|
| 5.1 | Area 8 — triple-source design token unification | Audit + consolidate to single token source | — | grep confirms single source; tsc/eslint green | ⬜ | |
| 5.2 | Area 10 — Cosmic Slate raw primitives | 29 files using raw `gray-`/`sky-` (verified count, see file list) | 5.1 | grep returns 0 matches; visual snapshot recapture per component | ⬜ | |
| 5.3 | Area 9 — typography scale | 816 arbitrary `text-[Npx]` instances — define real scale first, then migrate | 5.1 | grep count trending to 0 or documented intentional exceptions; visual snapshot per component | ⬜ | |
| 5.4 | Area 12 — inline style proliferation | 150 `style={{` occurrences in `src/components/` | 5.1 | grep count trending to 0; visual snapshot per component | ⬜ | |
| 5.5 | Visual regression re-baseline | One component at a time, per the Area 18 lesson — not batched | 5.2, 5.3, 5.4 (per component, as each lands) | Playwright visual diff reviewed and accepted per component | ⬜ | |

---

## Step 6 — Component library + accessibility (mixed: Claude for grep/logic, Antigravity for real-browser checks)

| ID | Task | What to do | Depends on | Verification | Status | Learnings/Feedback |
|---|---|---|---|---|---|---|
| 6.1 | Area 11 — shared `<Button>` adoption | 103 files use raw `<button>`, 2 use shared `<Button>` — migrate | 5.x (token work should land first) | grep count trending toward all using shared component; visual snapshot per batch | ⬜ | Claude |
| 6.2 | Area 11 — shared `<Table>` adoption | Confirm current usage, migrate | — | grep confirms adoption | ⬜ | Claude |
| 6.3 | Focus-visible states audit | Systematic check across interactive elements, not just spot-checked | — | axe + manual keyboard tab-through | ⬜ | Antigravity |
| 6.4 | Modal focus trap verification | Tab cycling stays inside open modal | — | Manual/Playwright keyboard test | ⬜ | Antigravity |
| 6.5 | Heading hierarchy / landmark audit | `h1`→`h6` order, `<main>`/`<nav>` landmarks | — | axe + manual review | ⬜ | Claude (static) + Antigravity (rendered) |
| 6.6 | Area 15 — remaining manual a11y gaps | Icon-button labels, keyboard div-buttons beyond what's already fixed | — | axe tests + manual review | ⬜ | Mixed |

---

## Step 7 — Cleanup (lowest severity, correctly sequenced last)

| ID | Task | Depends on | Verification | Status | Learnings/Feedback |
|---|---|---|---|---|---|
| 7.1 | Area 7 — prop drilling residue | — | Re-verify current state first (marked "not re-verified" in source doc), then fix | ⬜ | |
| 7.2 | Area 14 — `onNavigate` prop threading | — | Re-verify current state first, then fix | ⬜ | |
| 7.3 | Area 5 — oversized components (cognitive complexity) | — | Re-verify current state; `check-size` already passes on line-count, this is complexity now | ⬜ | |
| 7.4 | Area 3 — inconsistent error handling | — | Re-verify current state first, then fix | ⬜ | |

---

## Step 8 — UI/UX 100-checklist remainder

### 8a — Claude (grep/code-level, no browser)
| ID | Task | Verification | Status | Learnings/Feedback |
|---|---|---|---|---|
| 8.1 | Lorem-ipsum sweep | grep returns 0 | ⬜ | |
| 8.2 | BOQ/BOM terminology consistency sweep | Manual review against domain glossary | ⬜ | |
| 8.3 | Dev-debug text leakage to prod paths | Confirm State Consistency Debugger not reachable/visible to end users | ⬜ | |
| 8.4 | Virtualization confirmation | Which list-heavy components use `react-virtuoso` vs. not — cross-reference against Area 18 deferral | ⬜ | |
| 8.5 | Debounced search/filter input audit | grep + manual review of input handlers | ⬜ | |

### 8b — Antigravity (needs real browser)
| ID | Task | Verification | Status | Learnings/Feedback |
|---|---|---|---|---|
| 8.6 | Color contrast (WCAG AA) on 9–10.5px muted text | Automated contrast checker against `--color-content-muted` on real backgrounds | ⬜ | |
| 8.7 | Motion/`prefers-reduced-motion` audit | Manual + automated check across `framer-motion`/`motion-react` usage | ⬜ | |
| 8.8 | Cross-browser E2E (Firefox/WebKit) | Add projects to `playwright.config.ts`, run suite | ⬜ | |
| 8.9 | Responsive breakpoint coverage per-view | Extend `responsive.spec.ts` beyond sidebar/table containment | ⬜ | |
| 8.10 | Deep-linking every route+state combination | Extend `deeplink.spec.ts` coverage | ⬜ | |
| 8.11 | Wizard back/forward state persistence (Mission Control, 7 steps) | Manual + Playwright navigation test | ⬜ | |
| 8.12 | Browser back/forward button behavior | Manual + Playwright test | ⬜ | |
| 8.13 | Empty-state audit per view | Manual review, confirm `ReconciliationEmpty.tsx`-equivalent pattern exists everywhere needed | ⬜ | |
| 8.14 | Destructive-action confirmation audit | Manual review of delete/overwrite flows | ⬜ | |

---

## Step 9 — Deliberately deferred (no action unless trigger condition met)

| ID | Item | Trigger condition |
|---|---|---|
| 9.1 | Area 18 — list virtualization | Revisit when real backend data volume is known, or immediately before backend integration lands |
| 9.2 | Graphify `ui-specs/` coverage (14/18 remaining) | Revisit if/when those specs become load-bearing for a decision — not urgent |

---

## Change log for this tracker
_Add a line here each session this file is touched, so drift is visible._

- `2026-07-15` — Created. Baseline counts verified fresh (29 gray/sky files, 150 inline styles, 103 raw buttons, 816 arbitrary text sizes, 2 residual `isVisible()` instances — 1 real issue, 1 false alarm).
