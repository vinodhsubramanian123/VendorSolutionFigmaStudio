import type { StateCreator } from 'zustand';
import type { CatalogSKU } from '../../types';
import { CATALOG_SKUS as INITIAL_SKUS } from '../../lib/mockData';
import type { CoreState, CatalogSlice } from '../types';

export type { CatalogSlice };

/** Taxonomy / Catalog domain slice. Split out per Area 16 (gap-remediation-plan.md). */
export const createCatalogSlice: StateCreator<CoreState, [], [], CatalogSlice> = (set) => ({
  catalogSkus: INITIAL_SKUS as CatalogSKU[],
  setCatalogSkus: (val) => set((state) => ({ catalogSkus: typeof val === 'function' ? val(state.catalogSkus) : val })),
});
