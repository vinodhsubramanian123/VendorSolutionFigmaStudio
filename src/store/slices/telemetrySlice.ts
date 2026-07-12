import type { StateCreator } from 'zustand';
import type { CoreState, TelemetrySlice } from '../types';

export type { TelemetrySlice };

/** Telemetry / AI domain slice. Split out per Area 16 (gap-remediation-plan.md). */
export const createTelemetrySlice: StateCreator<CoreState, [], [], TelemetrySlice> = (set) => ({
  learningEvents: [],
  setLearningEvents: (val) => set((state) => ({ learningEvents: typeof val === 'function' ? val(state.learningEvents) : val })),
});
