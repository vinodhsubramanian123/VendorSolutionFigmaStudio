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
| Keyboard reachability of custom click targets | 🟡 | Fixed the one found in `AnnotationCell.tsx` this session. Not exhaustively swept — ESLint only catches the rules it's configured for (`no-static-element-interactions`, `click-events-have-key-events`); it won't catch things like an interactive element with `tabIndex={-1}` or a focus trap that isn't actually a `<div onClick>`. |
| Automated `axe` violation tests | 🟡 | Only 8 `axe()` calls total, covering `StatusBadge` + a handful of components in `a11yAndPerformance.test.tsx` and `CatalogHeader` in `a11y.test.tsx`. **13 nav-level views are not covered at all.** |
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
| Optimistic-UI vs. persisted-state mismatches | 🟡 | This exact bug class was found and fixed once (`CatalogManager` price rollback, see `data-architecture-plan.md` #9). Not swept for other components doing local optimistic updates. |
| Confirmation on destructive actions (delete, overwrite) | 🔴 | Not audited. |
| Multi-step wizard state persistence (Mission Control, 7 steps) | 🔴 | Does navigating back/forward through the wizard preserve entered data? Not verified. |
| Deep-linking correctness | 🟡 | `deeplink.spec.ts` exists and passes; covers some but not necessarily every route+state combination. |
| Browser back/forward button behavior | 🔴 | Not audited. |
| Long text / overflow handling (truncation, tooltips) | 🔴 | Not audited — relevant given dense BOQ/BOM tables. |

## 4. Testing coverage (the mechanism for catching regressions)

| Item | Status | Detail |
|---|---|---|
| Visual regression snapshots | 🟡→🔴 **see warning below** | 8 of 13 views had snapshots; 5 new tests added 2026-07-10 for Cleansing Workshop, Solution Configurator, Solutions Portfolio, Search, Telemetry — bringing coverage to 13/13. **But all 8 existing baselines are now known-stale** (see §0 below) and the 5 new ones have no baseline yet. None of the 13 can be trusted as ground truth until regenerated locally and visually confirmed. |
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

1. ✅ **Done 2026-07-10.** Closed the visual-snapshot gap (5 missing views) —
   and in the process found item §0 above, which turned out to be the
   highest-value find of the whole audit so far. This is exactly why #1 was
   ranked first: closing test-coverage gaps surfaces real bugs, cheaply.
2. Regenerate all 13 baselines locally, **visually confirm each one** (don't
   just accept "test passed"), commit them.
3. Expand automated `axe` coverage to at least one render per nav-level view.
4. Sweep for the optimistic-UI-mismatch bug class across all "edit and save"
   components (catalog was one instance; check cleansing, forensics, taxonomy).
5. Typography/spacing/contrast pass — now more meaningful than before, since
   muted text is actually rendering with a real color for the first time.
6. Everything else in this list, prioritized by whatever Vinodh's manual
   click-through surfaces as actually broken.
