import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BoqResponsePayload } from '../types/ingestion';
import type { ConstraintCheckResponse, ReconciliationResponse } from '../types';
export type IngestionPreset = "hpe-legacy" | "dell-overcharge" | "cisco-asymmetry";

export interface IngestionState {
  selectedUcidId: string;
  setSelectedUcidId: (val: string | ((prev: string) => string)) => void;

  selectedPreset: IngestionPreset;
  setSelectedPreset: (val: IngestionPreset | ((prev: IngestionPreset) => IngestionPreset)) => void;

  boqFile: string;
  setBoqFile: (val: string | ((prev: string) => string)) => void;

  boqResponse: BoqResponsePayload | null;
  setBoqResponse: (val: BoqResponsePayload | null | ((prev: BoqResponsePayload | null) => BoqResponsePayload | null)) => void;

  activeBOMFile: string;
  setActiveBOMFile: (val: string | ((prev: string) => string)) => void;

  bomVerifyResult: ConstraintCheckResponse | null;
  setBomVerifyResult: (val: ConstraintCheckResponse | null | ((prev: ConstraintCheckResponse | null) => ConstraintCheckResponse | null)) => void;

  bomReconResult: ReconciliationResponse | null;
  setBomReconResult: (val: ReconciliationResponse | null | ((prev: ReconciliationResponse | null) => ReconciliationResponse | null)) => void;
}

export const useIngestionStore = create<IngestionState>()(
  persist(
    (set) => ({
      selectedUcidId: "u1",
      setSelectedUcidId: (val) => set((state) => ({ selectedUcidId: typeof val === 'function' ? val(state.selectedUcidId) : val })),

      selectedPreset: "hpe-legacy",
      setSelectedPreset: (val) => set((state) => ({ selectedPreset: typeof val === 'function' ? val(state.selectedPreset) : val })),

      boqFile: "",
      setBoqFile: (val) => set((state) => ({ boqFile: typeof val === 'function' ? val(state.boqFile) : val })),

      boqResponse: null,
      setBoqResponse: (val) => set((state) => ({ boqResponse: typeof val === 'function' ? val(state.boqResponse) : val })),

      activeBOMFile: "",
      setActiveBOMFile: (val) => set((state) => ({ activeBOMFile: typeof val === 'function' ? val(state.activeBOMFile) : val })),

      bomVerifyResult: null,
      setBomVerifyResult: (val) => set((state) => ({ bomVerifyResult: typeof val === 'function' ? val(state.bomVerifyResult) : val })),

      bomReconResult: null,
      setBomReconResult: (val) => set((state) => ({ bomReconResult: typeof val === 'function' ? val(state.bomReconResult) : val })),
    }),
    {
      name: 'vsip-ingestion-storage',
      version: 1,
      migrate: (_persistedState, version) => {
        if (version < 1) {
          // No version was ever set before this — treat any pre-existing
          // persisted state as stale rather than risk rehydrating a shape
          // that doesn't match the current store (see coreStore.ts, which
          // already had this guard; the other three stores didn't).
          return {};
        }
        return _persistedState;
      },
    }
  )
);
