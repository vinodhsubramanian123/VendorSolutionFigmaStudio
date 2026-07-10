# UI/UX "100/100" Verification Checklist

**Purpose:** the definitive, durable list of everything that needs to be true
for VSIP's UI/UX to be considered fully verified — so future sessions work
through this list systematically instead of re-discovering categories ad hoc.
Each item is marked with its actual status as of **2026-07-10**, verified
against the real codebase, not assumed.

Legend: ✅ done · 🟡 partial (some coverage, gaps remain) · 🔴 not started ·
🔒 blocked (needs a browser-capable environment this session can't reach)

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
| Color contrast (WCAG AA) on small/muted text | 🔴 | The 9–10.5px muted-color badges and labels used throughout are exactly the pattern most likely to fail contrast ratios. Not measured. |

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
| Visual regression snapshots | 🟡 | **8 of 13 nav views covered**: Dashboard, Catalog, Mission Control, Forensic, Reconciliation, Taxonomy Graph, Vendor Portal, Ingestion Hub. **Missing: Cleansing Workshop, Solution Configurator, Solutions Portfolio (new), Search, Telemetry.** |
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

1. Close the visual-snapshot gap (5 missing views) — cheap, high-value, turns
   "eyeball it" into an automated regression gate going forward.
2. Expand automated `axe` coverage to at least one render per nav-level view.
3. Sweep for the optimistic-UI-mismatch bug class across all "edit and save"
   components (catalog was one instance; check cleansing, forensics, taxonomy).
4. Typography/spacing/contrast pass — likely a single token-mapping exercise
   like the color one, once actual violations are identified visually.
5. Everything else in this list, prioritized by whatever Vinodh's manual
   click-through surfaces as actually broken — no point auditing content
   quality or animation consistency before the pixel-level gaps are known.
