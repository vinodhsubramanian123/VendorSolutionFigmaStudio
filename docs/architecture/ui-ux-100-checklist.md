# UI/UX "100/100" Verification Checklist

**Purpose:** the definitive, durable list of everything that needs to be true
for VSIP's UI/UX to be considered fully verified — so future sessions work
through this list systematically instead of re-discovering categories ad hoc.
Each item is marked with its actual status as of **2026-07-10**, verified
against the real codebase, not assumed.

Legend: ✅ done · 🟡 partial (some coverage, gaps remain) · 🔴 not started ·
🔒 blocked (needs a browser-capable environment this session can't reach)

---

## ⚠️ §0 — Read this before trusting any "8/8 passed" visual result

On 2026-07-10, `npm run test:e2e:visual` was run locally and reported 8/8
passing with zero diffs. That result was **not a clean bill of health** — it
was masking a real bug. A follow-up code-level pass found `text-content-primary0`
(not a real class — only `content-primary`/`content-secondary`/`content-muted`
exist) used **310 times across 94 files**, all traced to a single commit
(`b92c2a9`, the cosmic-slate script, 2026-07-06). Tailwind silently drops
unknown classes, so every one of those 310 sites — overwhelmingly de-emphasized
text (captions, labels, footnotes) — rendered with zero color styling instead
of the intended muted tone, for 4 days, invisibly.

**Why 8/8 passing didn't catch it:** the 8 existing baseline snapshots were
captured on 2026-07-08, *after* the bug was already in the code. The baseline
itself encoded the broken rendering as "correct." Comparing broken-against-broken
correctly finds no diff. This is fixed now (`282d65d`) — 296 sites → `content-muted`
(the confirmed-majority original shade), 1 site → `content-primary` (individually
traced with certainty), and the 13 new/updated tests in `64e81a4` bring nav-view
coverage to 13/13 — but **the lesson generalizes**: a passing visual-regression
suite is only as trustworthy as its baselines. A "0 diffs" result should prompt
"were these baselines ever visually sanity-checked by a human?", not just "did
the number match." Treat every *first* baseline-establishing run
(`--update-snapshots`) as a thing that needs eyeballing, not just accepting.

---



## 1. Design system consistency

| Item | Status | Detail |
|---|---|---|
| Hardcoded Tailwind colors → cosmic-slate tokens | ✅ | 132 → 0 files (closed out 2026-07-10, see `ui-ux-audit.md`) |
| Typography scale consistency | 🔴 | Not audited. Codebase uses many bespoke arbitrary sizes (`text-[9px]`, `text-[10.5px]`, `text-[9.5px]`...) rather than a defined scale — worth checking whether these are intentional micro-adjustments or drift. |
| Spacing/padding scale consistency | 🔴 | Not audited. |
| Icon sizing/color consistency (lucide-react) | 🔴 | Not audited. |
| Border-radius consistency | 🔴 | Not audited. |
| Shadow/elevation consistency | 🔴 | Not audited. |
| Motion/animation consistency (framer-motion) | 🔴 | Not audited. Also: does anything respect `prefers-reduced-motion`? Not checked. |
| Color contrast (WCAG AA) on small/muted text | 🔴 | Not measured. More relevant now than before: the `content-primary0` fix (§0) means muted text actually renders with a real, dim color for the first time — worth checking `--color-content-muted` (`#5d7899`) against `--color-surface-*` backgrounds at the 9–10.5px sizes used everywhere, since it was never actually visible enough to evaluate until this session's fix. |

## 2. Accessibility (a11y)

| Item | Status | Detail |
|---|---|---|
| ESLint `jsx-a11y/*` rules | ✅ | 0 warnings across all of `src/` |
| Keyboard reachability of custom click targets | 🟡 | Fixed in `AnnotationCell.tsx` (session 1) and, this session, the redundant/broken pattern in `StepIntakeDropzone.tsx` was resolved by removing a redundant interactive role rather than adding keyboard handling to it — the real native button already covers it. Not exhaustively swept beyond what the 13 new axe tests happened to render. |
| Automated `axe` violation tests | ✅ **Done 2026-07-11** | All 13 nav-level views now have a zero-violations axe test, up from 2 (Mission Control + the sub-component CatalogHeader). Not coverage theater: 6 of 12 new tests failed on first run and caught real bugs — an unlabeled icon-only button, two unlabeled `<select>`s, two separate nested-interactive violations (native file inputs nested inside `role="button"` divs), and 3 heading-order skips. All fixed, not just made to pass. Known limitation: 3 of the 13 (Reconciliation, Taxonomy Graph, Ingestion Hub) mock out their heaviest sub-components per those files' existing test conventions, so those axe tests cover the outer shell only — flagged inline in each test. |
| Focus-visible states on all interactive elements | 🔴 | Not audited. Spot-checked a few (`focus-visible:ring-2` present in header buttons) but not systematic. |
| Modal focus trap (focus stays inside while open) | 🔴 | `useEscapeKey`/`ModalBackdrop` handle Escape-to-close and click-outside, but focus-trap (Tab cycling only within the modal) wasn't verified. |
| Form label association (`jsx-a11y/label-has-associated-control`) | ✅ | Lint-enforced, 0 warnings — but only 3 files use `react-hook-form`; worth confirming plain `<input>` usages elsewhere also have associated labels. |
| Heading hierarchy / landmark regions | 🔴 | Not audited (no `h1`→`h6` order check, no `<main>`/`<nav>` landmark audit). |
| Screen reader smoke test | 🔒 | Needs a real screen reader + browser. |

## 3. Interaction / UX flow correctness

| Item | Status | Detail |
|---|---|---|
| Loading states present where data is fetched | 🟡 | 49 files reference `isLoading`/`Skeleton`/`animate-pulse` — broad coverage exists, but not verified 1:1 against every async call site. |
| Empty states (zero-data) are meaningful, not blank | 🔴 | Not audited per-view. `ReconciliationEmpty.tsx` exists as a named pattern — worth checking every list/table view has an equivalent. |
| Error states are user-facing and recoverable | 🟡 | 25 files use the toast system; `ErrorBoundary` wraps every route. Not verified that every failure path actually surfaces a toast vs. silently failing. |
| Optimistic-UI vs. persisted-state mismatches | ✅ **Swept 2026-07-11, clean** | This exact bug class was found and fixed once (`CatalogManager` price rollback, Phase 3a) and once more independently (`CleansingView`, already fixed with a documented merge-on-render pattern before this session). A full sweep of Cleansing/Forensics/Taxonomy plus a codebase-wide grep for the bug's structural fingerprint (a `useState`/`useMemo` initializer reading a mock generator once, or a module-level mutable stub disconnected from `coreStore`) found no remaining instance. Taxonomy Graph's real UI was already migrated off the disconnected mock API in an earlier "Phase 4"; Forensics reads `forensicIssues` straight from `coreStore` with no local duplication anywhere. Nothing to fix — recorded here so this ground isn't re-investigated later. |
| Confirmation on destructive actions (delete, overwrite) | 🔴 | Not audited. |
| Multi-step wizard state persistence (Mission Control, 7 steps) | 🔴 | Does navigating back/forward through the wizard preserve entered data? Not verified. |
| Deep-linking correctness | 🟡 | `deeplink.spec.ts` exists and passes; covers some but not necessarily every route+state combination. |
| Browser back/forward button behavior | 🔴 | Not audited. |
| Long text / overflow handling (truncation, tooltips) | 🔴 | Not audited — relevant given dense BOQ/BOM tables. |

## 4. Testing coverage (the mechanism for catching regressions)

| Item | Status | Detail |
|---|---|---|
| Visual regression snapshots | ✅ **Done 2026-07-11** | 13/13 nav views covered, 20 baseline files (7 views ×2 platforms + 6 ×1 platform), all regenerated post-fix and visually spot-checked (dashboard, taxonomy-graph, cleansing-workshop). Root cause of the 3-view gap: `isVisible()` guards silently no-op'ing (see session log) — removed entirely, tests now fail loudly instead of lying about coverage. |
| Cross-browser E2E coverage | 🔴 | `playwright.config.ts` only defines a `chromium` project — no Firefox/WebKit. Fine if the target audience is Chrome-only; otherwise a real gap. |
| Responsive breakpoint coverage | 🟡 | `responsive.spec.ts` checks 375/768/1024/1280px, but focused on sidebar/table containment — not per-view. |
| Automated a11y test coverage | 🔴 | See §2 — effectively 1–2 components out of dozens. |
| Route/nav link integrity | ✅ | Verified 2026-07-10: every `App.tsx` route has a `Sidebar.tsx` entry and vice versa. |

## 5. Data/mock alignment (carried over from `data-architecture-plan.md`)

Already tracked in detail there — not duplicated here. Headline: Phase 9 is
complete; the 31 MSW-only routes with no `server.ts` backend, and the
cleansing mock-computation divergence, remain open **product** decisions, not
UI/UX gaps per se.

## 6. Content / copy quality

| Item | Status | Detail |
|---|---|---|
| No placeholder/lorem-ipsum leftovers | 🔴 | Not swept. |
| Consistent terminology (BOQ vs BOM used correctly per context) | 🔴 | Not swept. |
| No dev-only debug text visible in prod paths | 🔴 | Not swept (e.g. the State Consistency Debugger is intentionally dev-facing — worth confirming it's not reachable/visible in a way that'd confuse an end user). |

## 7. Performance (UX-adjacent)

| Item | Status | Detail |
|---|---|---|
| Large-list virtualization (`react-virtuoso`) used where needed | 🔴 | Not confirmed which tables actually use it vs. render everything. |
| Unnecessary re-render sources | 🟡 | One class fixed in Phase 9 (`App.tsx`'s 12 dead subscriptions). Not swept elsewhere. |
| Debounced search/filter inputs | 🔴 | Not audited. |
| Route-level code splitting | ✅ | Confirmed — all routes in `App.tsx` are `React.lazy`. |

---

## 🔒 Blocked on browser access (this session cannot do these)

- Actually running `npm run test:e2e:visual` and looking at real pixel diffs
- Manual click-through of any flow
- Screen reader testing
- Real-device responsive testing
- Cross-browser (Firefox/WebKit) rendering checks
- Anything requiring `cdn.playwright.dev` (browser binary download)

**Everything in this section needs Vinodh's machine** (or a sandbox with that
egress opened). This checklist's 🔴/🟡 items marked as needing "audit" can
mostly be done code-side without a browser and are fair game for a future
session; the 🔒 items above cannot.

---

## Suggested order of attack

1. ✅ **Done 2026-07-11.** Closed the visual-snapshot gap fully: 13/13 nav
   views covered, root cause of the 3-view no-op found and fixed
   (`isVisible()` guards silently swallowing test assertions — removed),
   the 310-site invalid-class bug found and fixed, baselines regenerated
   and visually confirmed.
2. ✅ **Done 2026-07-11.** Expanded automated `axe` coverage to all 13
   nav-level views (up from 2). Caught and fixed 6 real accessibility bugs
   in the process — this is exactly why #1 and #2 were ranked first:
   closing test-coverage gaps surfaces real bugs, cheaply, every time.
3. ✅ **Swept 2026-07-11, clean.** Checked Cleansing/Forensics/Taxonomy plus a
   codebase-wide grep for the optimistic-UI-mismatch bug's structural
   fingerprint. No remaining instance found — both prior occurrences
   (Catalog, Cleansing) were already fixed. Nothing to patch this round.
4. **Typography/spacing/contrast pass — next up, needs Vinodh.** Now more
   meaningful than before, since muted text is actually rendering with a
   real color for the first time. This is the first item on the list that
   genuinely can't be done code-side — needs eyes on the regenerated
   snapshots or a live click-through to identify what's actually off.
5. Everything else in this list, prioritized by whatever Vinodh's manual
   click-through surfaces as actually broken.
