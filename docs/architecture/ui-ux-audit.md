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
