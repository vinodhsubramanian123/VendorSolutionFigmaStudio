import type { StateCreator } from 'zustand';
import type { Vendor } from '../../types';
import { VENDORS as INITIAL_VENDORS } from '../../lib/mockData';
import type { CoreState, VendorsSlice } from '../types';

export type { VendorsSlice };

/** Vendor Portal domain slice. Split out per Area 16 (gap-remediation-plan.md). */
export const createVendorsSlice: StateCreator<CoreState, [], [], VendorsSlice> = (set) => ({
  vendors: INITIAL_VENDORS as Vendor[],
  setVendors: (val) => set((state) => ({ vendors: typeof val === 'function' ? val(state.vendors) : val })),
});
