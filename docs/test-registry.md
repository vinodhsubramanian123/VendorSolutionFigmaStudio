# Architecture & Test Registry

## 22. Tech Stack & Dependency Versions (Phase 10 Lock)

> [!IMPORTANT]
> **Do NOT upgrade any of these packages without explicit instruction.** Version mismatches cause silent API breakage (e.g. `fast-check` v3→v4 removed `fc.stringOf()`; `framer-motion`→`motion` changed import paths).

### Core Runtime
| Package | Version | Notes |
|---------|---------|-------|
| `react` / `react-dom` | `^19.0.1` | React 19 — use `motion/react` not `framer-motion` |
| `vite` | `^6.2.3` | ESBuild bundler |
| `react-router-dom` | `^7.17.0` | File-based routing |
| `zod` | `^4.4.3` | Schema validation — source of truth for all types |
| `motion` | `^12.23.24` | Import as `motion/react` — NOT `framer-motion` |
| `react-virtuoso` | `^4.18.7` | Virtualization — use `Virtuoso` (list) + `VirtuosoGrid` (cards) |
| `react-hook-form` | `^7.78.0` | Form management |
| `@xyflow/react` | `^12.11.0` | Taxonomy graph rendering |

### Testing Stack
| Package | Version | Notes |
|---------|---------|-------|
| `vitest` | `^4.1.8` | Unit + component test runner |
| `@testing-library/react` | `^16.3.2` | RTL — DOM queries |
| `msw` | `^2.14.6` | MSW v2 — use `http` + `HttpResponse` (NOT `rest`) |
| `fast-check` | `^4.8.0` | Property-based testing — see §19.4 for correct APIs |
| `vitest-axe` | `^0.1.0` | Accessibility assertions |
| `@playwright/test` | `^1.60.0` | E2E browser tests |
| `@stryker-mutator/core` | `^9.6.1` | Mutation testing |

### Key Architectural Imports
```typescript
// ✅ CORRECT
import { motion, AnimatePresence } from 'motion/react';   // NOT framer-motion
import { Virtuoso, VirtuosoGrid } from 'react-virtuoso';  // NOT react-window
import { http, HttpResponse } from 'msw';                  // NOT rest (MSW v1)
import { useCoreStore } from './store/coreStore';          // Zustand global state
```

---

## 23. Pre-Existing Non-Blocking Lint Warnings (Do NOT Fix Without Instruction)

> [!WARNING]
> The following **15 warnings** exist in the production codebase and are **intentionally deferred**. They are non-blocking (0 errors). Do NOT waste tokens attempting to fix them unless explicitly asked.

| File | Warning | Rule |
|------|---------|------|
| `App.tsx` | Arrow function complexity 16 (max 15) | `complexity` |
| `CatalogAddForm.tsx` | 6× `<label>` not associated with control | `jsx-a11y/label-has-associated-control` |
| `CatalogAddForm.tsx` | Non-interactive `<div>` has keyboard listener | `jsx-a11y/no-noninteractive-element-interactions` |
| `CatalogAddForm.tsx` | `tabIndex` on non-interactive element | `jsx-a11y/no-noninteractive-tabindex` |
| `CatalogCardsList.tsx` | `autoFocus` prop used on inline edit input | `jsx-a11y/no-autofocus` |
| `CatalogFilterBar.tsx` | Function complexity 21 | `complexity` |
| `CatalogManager.tsx` | Unused `success`, `warn` from `useToast()` | `sonarjs/no-unused-vars` / `no-dead-store` |
| `CatalogManager.tsx` | 2× ignored exception in catch blocks | `sonarjs/no-ignored-exceptions` |
| `BomReconciliationPanel.tsx` | Non-native interactive element (missing role) | `jsx-a11y/no-static-element-interactions` |
| Various | Dead store / unused eslint-disable directives | `sonarjs/no-dead-store` |

**Current lint summary: `0 errors, 15 warnings` — ALL CLEAN for CI purposes.**

---

## 24. Global State Architecture (Zustand `coreStore`)

All shared application state flows through a **single Zustand store** persisted to `localStorage`:

```typescript
// src/store/coreStore.ts — Key: 'vsip-core-storage'
{
  ucids: UCID[];           // All active/completed procurement missions
  vendors: Vendor[];       // Connected vendor API profiles
  catalogSkus: CatalogSKU[]; // Part inventory
  forensicIssues: ForensicIssue[];
  sourcingRules: SourcingRule[];
  learningEvents: LearningEvent[];
  activeMissionId: string;
  collapsed: boolean;      // Sidebar state
}
```

**Route → Component → Props mapping** (from `App.tsx`):
| Route | Component | Gets from Store |
|-------|-----------|----------------|
| `/` | `Dashboard` | `ucids`, `vendors`, `forensicIssues` |
| `/catalog` | `CatalogManager` | `catalogSkus`, `vendors` only — NO ucids |
| `/forensic` | `ForensicView` | `forensicIssues`, `ucids`, `sourcingRules`, `learningEvents` |
| `/solution-builder` | `SolutionBuilder` | `ucids` only |
| `/vendor-portal` | `VendorPortal` | `vendors`, `ucids`, `catalogSkus`, `sourcingRules` |
| `/reconciliation` | `ReconciliationView` | `ucids`, `catalogSkus`, `forensicIssues` |
| `/telemetry` | `SystemTelemetry` | No props (reads own API) |

> [!IMPORTANT]
> **E2E state injection**: To reset Zustand state in Playwright, write directly to `localStorage.setItem('vsip-core-storage', JSON.stringify({ state: { ucids: [], ... }, version: 0 }))` and call `page.reload()`. Never use `vsip_localstorage_update` custom events for Playwright — that's for in-tab SPA sync only.

---

## Test Suite Registry — Phase 10 Complete Coverage (June 2026)

> [!IMPORTANT]
> **311 tests across 63 test files — ALL PASSING as of June 2026.**
> The `vite.config.ts` test `include` pattern covers BOTH `src/**/*.test.{ts,tsx}` AND `tests/**/*.test.{ts,tsx}`. Never revert to `src/**` only or the 19 external test categories will silently disappear from the suite.

### Full Category Registry

| Cat | Spec Title | Test File(s) | Count | Runner | Status |
|-----|-----------|--------------|-------|--------|--------|
| 1 | Pure unit logic | `catalogUtils.test.ts`, `reconciliationMath.test.ts` | 9 | Vitest | ✅ |
| 2 | Component render + interaction | `src/components/**/__tests__/` (44 files) | 204 | Vitest + RTL | ✅ |
| 3 | MSW integration flows | `forensics-auto-heal-chain`, `ingestion-workflow`, `cross-component-sync`, `data-persistence-gate`, `taxonomy-graph-sync`, `cleansing-mapping` | 20+ | Vitest + MSW | ✅ |
| 4 | Visual regression | `tests/e2e/visual.spec.ts` | 8 | Playwright | 🟡 E2E |
| 5 | Responsive breakpoints | `tests/e2e/responsive.spec.ts` | 9 | Playwright | 🟡 E2E |
| 6 | State lifecycle | `resilienceAndLifecycle.test.tsx` | 4 | Vitest + MSW | ✅ |
| 7 | Workflow steps | `useWorkflowManager.test.tsx` | 8 | Vitest | ✅ |
| 8 | Zod schema contracts | `contracts`, `zodSchemaIntegration`, `GraphContracts` | 22 | Vitest + MSW | ✅ |
| 9 | API payload integrity | `apiClient.test.ts` | 18 | Vitest + MSW | ✅ |
| 10 | Resilience / 503 errors | `resilienceAndLifecycle.test.tsx` | 4 | Vitest + MSW | ✅ |
| 11 | Accessibility (ARIA/axe) | `a11yAndPerformance.test.tsx` | 7 | Vitest + axe | ✅ |
| 12 | Render count / memoization | `a11yAndPerformance.test.tsx` | 5 | Vitest + RTL | ✅ |
| 13 | Optimistic UI rollback | `resilienceAndLifecycle.test.tsx` | 3 | Vitest + MSW | ✅ |
| 14 | Unsaved changes guard | `unsavedChangesGuard.test.tsx` | 9 | Vitest + RTL | ✅ |
| 15 | Deep-link / URL routing | `tests/e2e/deeplink.spec.ts` | 9 | Playwright | 🟡 E2E |
| 16 | Multi-vendor BOQ math | `multiVendorBOQ.test.ts` | 13 | Vitest | ✅ |
| 17 | AGENTS.md compliance | `agentsCompliance.test.tsx` | 8 | Vitest + RTL | ✅ |
| 18 | Mutation testing (Stryker) | `stryker.config.json` | N/A | Stryker | `npm run test:mutation` |
| 19 | Property-based (fast-check) | `propertyBased.test.ts` | 10 | Vitest + fc | ✅ |

### Critical Component Prop Contracts

**These components do NOT accept `ucids` or `catalogSkus` — they are self-contained domain modules:**

| Component | Valid Props | ❌ Never Pass |
|-----------|-------------|--------------|
| `SourcingRulesVault` | `sourcingRules`, `setSourcingRules`, `triggerToast`, `prefillRule`, `onPrefillConsumed` | `ucids`, `catalogSkus` |
| `CatalogManager` | `catalogSkus`, `setCatalogSkus`, `vendors` | `ucids` |
| `CatalogTaxonomyTree` | `selectedPath`, `selectPathFn` | `taxonomyNodes` (owns internal data) |
| `AddRuleForm` | `onSubmit`, `onCancel`, `prefillRule`, `triggerToast` | `onSave` |

### MSW Endpoint Truth Table

| Action | Correct Endpoint | ❌ Wrong (historical) |
|--------|-----------------|----------------------|
| Auto-Heal | `POST /api/forensics/align` | `POST /api/issues/auto-heal` |
| Rule Save | `POST /api/taxonomy/rules` | `POST /api/sourcing-rules` |
| Rule Simulate | `POST /api/taxonomy/simulate` | `POST /api/sourcing-rules/:id/simulate` |
| BOQ Ingest | `POST /api/boq/ingest` → `{ ucid: string, configsCreated, sourceFile, parsedSummary }` | Returns UCID object |

### fast-check v4 API Reference
```typescript
fc.uuid()                            // UUID v4 ✅
fc.string({ minLength: 3 })          // String with length ✅
fc.nat({ max: 1000 })                // Non-negative int ✅
// ❌ REMOVED in fast-check v4:
fc.uuidV(4)    // → fc.uuid()
fc.char()      // → fc.string({ minLength: 1, maxLength: 1 })
fc.stringOf()  // → fc.string({ minLength, maxLength })
```

### Test Scripts
```bash
npm run test:vitest        # 63 files, 311 tests
npm run test:e2e           # Playwright E2E
npm run test:mutation      # Stryker (slow)
npm run lint               # 0 errors, 15 known warnings
npm run build              # Vite production build
```


