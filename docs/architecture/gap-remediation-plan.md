# VSIP Gap Remediation Plan

> Source: `code_quality_analysis.md` (19-area multi-model sweep, delivered 2026-07-12).
> This doc tracks verified current-state counts (checked against a fresh clone at
> commit `626a090` before work started) and sequences remediation. Update the
> status column as each area lands; do not re-derive from scratch in future
> sessions — read this file first.

## Status legend
✅ Done · 🔶 In progress · ⬜ Not started

## Priority matrix (verified counts as of this session)

| # | Area | Severity | Verified current state | Status |
|---|---|---|---|---|
| 4 | Dead adapter code | 🟢 Low | `vendorAdapter.ts` + `IVendorPortalAdapter.ts` had 0 consumers repo-wide (confirmed via grep before deletion) | ✅ Done |
| 13 | Motion import split | 🟠 Medium | 5 files on `framer-motion`, 76 on `motion/react` | ✅ Done |
| 17 | API boundary Zod bypass | 🔴 Critical | `apiClient.parseResponse()` now throws a descriptive Error on schema mismatch instead of warn-and-cast. Surfaced and fixed a real latent contract violation in `VendorIngestionDesk.test.tsx`'s MSW fixture in the process. Broader "optional schema param on get/post/put/delete" plumbing (doc's stated recommendation) not yet done — most call sites still don't validate at all; only the ones that already called `parseResponse` explicitly benefit so far. | 🔶 In progress |
| 16 | Zustand store monolith | 🔴 Critical | Decomposed into 7 domain slice files (`src/store/slices/`) + a shared `types.ts` composed via Zustand's slice pattern. Public `useCoreStore`/`CoreState` API unchanged — zero consumer or test churn. | ✅ Done |
| 2 | Unsafe `any` typing | 🔴 Critical | Non-server slice done: `missionControlUtils.ts`, `bomRepairUtils.ts`, `useBomConversion.ts` now properly typed. `server.ts`'s 11 `any` sites deliberately deferred to Iteration 2 (server dedup/decomposition) to avoid double-diffing. | 🔶 In progress |
| 1 | Reconciliation logic duplication | 🔴 Critical | Confirmed: markup/hybrid/SKU/memory-symmetry checks live in both `server.ts` and `reconciliationMath.ts` | ⬜ Not started |
| 6 | server.ts monolith | 🟡 High | Confirmed 692 lines, `any`-saturated (see Area 2) | ⬜ Not started |
| 7 | Prop drilling residue | 🟡 High | Not re-verified this session | ⬜ Not started |
| 9 | Typography scale chaos | 🟡 High | Confirmed **816** arbitrary `text-[Npx]` instances (321×10px, 228×9px, 115×11px, 42×9.5px, 37×8px, 34×10.5px, 28×8.5px, +11 other odd sizes) | ⬜ Not started |
| 11 | Shared component bypass | 🟡 High | Confirmed: 103 files use raw `<button>`, only 2 files import shared `<Button>`; `<Table>` still unconfirmed this pass | ⬜ Not started |
| 12 | Inline style proliferation | 🟡 High | Confirmed 150 `style={{` occurrences in `src/components/` | ⬜ Not started |
| 14 | onNavigate prop threading | 🟡 High | Not re-verified this session | ⬜ Not started |
| 18 | List virtualization bypass | 🟡 High | Confirmed: only `CatalogCardsList.tsx` and `UCIDEventLedger.tsx` use `react-virtuoso` | ⬜ Not started |
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
