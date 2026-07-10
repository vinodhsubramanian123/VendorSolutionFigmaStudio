# UI/UX Audit: Enforcing Cosmic Slate

## Objective
To strictly enforce the **Cosmic Slate** design system across all frontend components. Currently, there are 132 files utilizing hardcoded Tailwind CSS colors (e.g., `bg-gray-800`, `text-blue-500`) instead of the predefined theme tokens. This leads to visual inconsistency, broken dark mode contrasts, and violates the UX philosophy outlined in the PRD.

## Audit Findings
- **Hardcoded Colors**: Over 132 files use standard Tailwind colors instead of Cosmic Slate variables.
- **Inconsistent Surfaces**: `bg-gray-900`, `bg-gray-800`, and `bg-slate-800` are used interchangeably, leading to improper depth layering on nested cards.
- **Action/Brand Dilution**: Primary actions use generic `bg-blue-500` or `bg-indigo-600` rather than the official `--color-brand-indigo` (`#4a85fd`).
- **Status Indication**: Success/Error states use standard red/green instead of the high-luminance Cosmic Slate status tokens.

## Token Mapping Strategy
We will apply a codebase-wide regex replacement script to map the following hardcoded classes to their Cosmic Slate equivalents:

### Surfaces & Backgrounds
| Hardcoded Tailwind | Cosmic Slate Token | Class Example |
| :--- | :--- | :--- |
| `bg-gray-950`, `bg-slate-950`, `bg-black` | `--color-surface-canvas` | `bg-surface-canvas` |
| `bg-gray-900`, `bg-slate-900` | `--color-surface-card` | `bg-surface-card` |
| `bg-gray-800`, `bg-slate-800`, `bg-zinc-800` | `--color-surface-elevated` | `bg-surface-elevated` |

### Brand Colors
| Hardcoded Tailwind | Cosmic Slate Token | Class Example |
| :--- | :--- | :--- |
| `bg-blue-500`, `bg-blue-600`, `bg-indigo-500`, `bg-indigo-600` | `--color-brand-indigo` | `bg-brand-indigo` |
| `text-blue-500`, `text-blue-400`, `text-indigo-500` | `--color-brand-indigo` | `text-brand-indigo` |
| `bg-purple-500`, `text-purple-500` | `--color-brand-violet` | `bg-brand-violet` / `text-brand-violet` |

### Status Colors
| Hardcoded Tailwind | Cosmic Slate Token | Class Example |
| :--- | :--- | :--- |
| `bg-red-500`, `bg-red-600`, `text-red-500`, `text-red-400` | `--color-status-error` | `bg-status-error` / `text-status-error` |
| `bg-green-500`, `bg-emerald-500`, `text-green-500` | `--color-status-success` | `bg-status-success` / `text-status-success` |
| `bg-yellow-500`, `bg-orange-500`, `text-yellow-500` | `--color-status-warning` | `bg-status-warning` / `text-status-warning` |

### Text & Content
| Hardcoded Tailwind | Cosmic Slate Token | Class Example |
| :--- | :--- | :--- |
| `text-white`, `text-gray-100`, `text-gray-200` | `--color-content-primary` | `text-content-primary` |
| `text-gray-300`, `text-gray-400`, `text-slate-400` | `--color-content-secondary`| `text-content-secondary` |
| `text-gray-500`, `text-gray-600`, `text-slate-500` | `--color-content-muted` | `text-content-muted` |
| `border-gray-700`, `border-gray-800`, `border-slate-700` | `--color-surface-elevated`| `border-surface-elevated` |

## Execution Plan
1. Write and execute a Node.js AST/Regex script (`scripts/apply-cosmic-slate.js`) to process all `.tsx` and `.ts` files in `src/`.
2. Map the classes defined in the strategy table.
3. Run `npm run lint` and `npm run test:vitest` to ensure no syntax errors were introduced during the automated replacement.
4. Verify tests pass and remove the script.

---

## Status: Executed (2026-07-06, commit `b92c2a9`) — closed out (2026-07-10)

The regex script ran and brought 132 files down to 7 remaining hardcoded-color
files, but two things were missed at the time and only surfaced in a fresh-clone
audit on 2026-07-10, alongside 9 new ESLint warnings from that day's separate
reconciliation-feature push (`c14840a`/`f062ce1`):

1. **A real bug, not just a token miss**: the regex mangled
   `disabled:text-gray-500` into the invalid class `disabled:text-content-primary0`
   in `NLPParser.tsx` (stray trailing `0`). Tailwind silently no-ops on invalid
   class names, so the disabled Send button in the vendor-portal NLP chat had no
   styled disabled state at all. **Fixed.**
2. **7 remaining hardcoded-color call sites** the script's regex didn't match
   (`StatusBadge.tsx`, `CampaignPanels.tsx`, `StepVendorProvisioning.tsx`,
   `ForensicHeader.tsx`, `NLPParser.tsx`, `RulesTableRow.tsx`,
   `KnowledgeGraphCanvas.tsx`) — all mapped to their correct token per the table
   above. **Fixed.**
3. **`AnnotationCell.tsx`** (new in the reconciliation feature, not part of the
   original 132): its click-to-edit trigger had a click handler with no keyboard
   equivalent — a genuine a11y gap, not a token issue. **Fixed**: `role="button"`,
   `tabIndex`, Enter/Space activation, `aria-label`.

`grep` for the audit's tracked hardcoded-color patterns now returns zero matches
in `src/`. ESLint (including all `jsx-a11y/*` rules) is at 0 warnings / 0 errors
across the whole codebase as of this close-out. Full verification (fresh install,
`tsc`, `eslint`, `dependency-cruiser`, `jscpd`, `vitest`) done on two independent
fresh clones with sequential `git am` — see `data-architecture-plan.md` for the
paired commits.

**Not done in this pass, deliberately out of scope:** live browser/visual
validation (Playwright e2e, `visual.spec.ts` snapshot diffing, actual pixel
review). The sandbox this audit ran in cannot reach `cdn.playwright.dev` to
install a browser — confirmed by a direct `npx playwright install chromium`
failure (403, host not in egress allowlist). This is a code-level audit only;
visual/interactive validation still needs to run in an environment with browser
access (Vinodh's machine, or a sandbox with that egress opened).
