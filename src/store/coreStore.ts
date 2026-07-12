import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CoreState } from './types';
import { createSolutionsSlice } from './slices/solutionsSlice';
import { createUcidsSlice } from './slices/ucidsSlice';
import { createUiSlice } from './slices/uiSlice';
import { createVendorsSlice } from './slices/vendorsSlice';
import { createCatalogSlice } from './slices/catalogSlice';
import { createForensicSlice } from './slices/forensicSlice';
import { createTelemetrySlice } from './slices/telemetrySlice';

export type { CoreState };

/**
 * Single combined store. Was previously a flat ~200-line monolith defining
 * all 7 business domains (solutions, ucids, vendors, catalogSkus,
 * forensicIssues, sourcingRules, learningEvents) plus UI chrome state in one
 * file (see code_quality_analysis.md Area 16: "Zustand Store Monolith").
 *
 * This now composes domain-specific slices via Zustand's slice pattern
 * (see docs/architecture/gap-remediation-plan.md, Area 16, and
 * https://zustand.docs.pmnd.rs/guides/slices-pattern). The public API is
 * unchanged on purpose: `useCoreStore` and `CoreState` still expose the
 * exact same flat shape, so none of the 40+ consumer components/hooks or
 * tests needed to change. What changed is only where each domain's state
 * and setters are *defined* — each slice file owns one domain, and
 * cross-domain orchestration (e.g. setUcids syncing solution status) stays
 * explicit and visible in the slice that initiates it.
 *
 * The slice interfaces and the combined CoreState type live in ./types.ts
 * rather than here, to avoid a circular import: each slice creator needs
 * `StateCreator<CoreState, ...>`, and this file needs every slice creator —
 * if CoreState lived in this file, that would be a cycle.
 */
export const useCoreStore = create<CoreState>()(
  persist(
    (...a) => ({
      ...createSolutionsSlice(...a),
      ...createUcidsSlice(...a),
      ...createUiSlice(...a),
      ...createVendorsSlice(...a),
      ...createCatalogSlice(...a),
      ...createForensicSlice(...a),
      ...createTelemetrySlice(...a),
    }),
    {
      name: 'vsip-core-storage',
      version: 3,
      migrate: (_persistedState, version) => {
        if (version < 3) {
          // Schema evolved — drop stale rehydrated snapshot so
          // initial mock seed values are used instead of corrupted fields.
          return {};
        }
        return _persistedState;
      },
    }
  )
);
