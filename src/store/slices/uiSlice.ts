import type { StateCreator } from 'zustand';
import type { CoreState, UiSlice } from '../types';

export type { UiSlice };

/**
 * Global UI chrome state (sidebar collapse, active mission focus). Not one
 * of the 7 named business domains from the Area 16 analysis, but was
 * co-located in the original coreStore.ts monolith; kept separate from the
 * business-domain slices since it's a different kind of state entirely.
 */
export const createUiSlice: StateCreator<CoreState, [], [], UiSlice> = (set) => ({
  collapsed: false,
  setCollapsed: (val) => set((state) => ({ collapsed: typeof val === 'function' ? val(state.collapsed) : val })),

  activeMissionId: "u1",
  setActiveMissionId: (id) => set((state) => ({ activeMissionId: typeof id === 'function' ? id(state.activeMissionId) : id })),
});
