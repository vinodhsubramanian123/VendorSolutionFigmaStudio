import type { StateCreator } from 'zustand';
import type { UCID, UCIDManualUploadState } from '../../types';
import { UCIDS as INITIAL_UCIDS } from '../../lib/mockData';
import { deriveSolutionStatus } from '../../utils/solutionUtils';
import type { CoreState, UcidsSlice } from '../types';

export type { UcidsSlice };

/**
 * Mission Control domain slice: `ucids` and their execution/automation
 * state. Split out of the former coreStore.ts monolith (see
 * docs/architecture/gap-remediation-plan.md, Area 16).
 *
 * Cross-slice note: setUcids intentionally reads/writes `state.solutions`
 * (owned by SolutionsSlice) to auto-sync solution status whenever UCIDs
 * change (Phase 11 behavior, preserved as-is from the pre-split store).
 * This is exactly the kind of cross-domain orchestration Area 16 flagged —
 * it's kept here rather than "fixed away" because the two are genuinely
 * coupled in the domain model; splitting the slice's *file* doesn't mean
 * every interaction between domains is itself a smell.
 */
export const createUcidsSlice: StateCreator<CoreState, [], [], UcidsSlice> = (set) => ({
  ucids: INITIAL_UCIDS as UCID[],

  setUcids: (val) => set((state) => {
    const nextUcids = typeof val === 'function' ? val(state.ucids) : val;

    // Auto-sync solution statuses whenever UCIDs change (Phase 11)
    const nextSolutions = state.solutions.map(sol => {
      const nextStatus = deriveSolutionStatus(sol, nextUcids);
      if (sol.status !== nextStatus) return { ...sol, status: nextStatus };
      return sol;
    });

    return {
      ucids: nextUcids,
      solutions: nextSolutions
    };
  }),

  setUcidExecutionMode: (ucidId, mode) =>
    set((state) => ({
      ucids: state.ucids.map((u) =>
        u.id === ucidId ? { ...u, executionMode: mode } : u
      )
    })),

  updateAutomationState: (ucidId, partialState) =>
    set((state) => ({
      ucids: state.ucids.map((u) => {
        if (u.id !== ucidId) return u;
        const current = u.automationState || {
          jobId: '', vendorPortalName: '', portalUrl: '', status: 'idle',
          queuedAt: null, startedAt: null, completedAt: null, errorMessage: null,
          screenshotRef: null, outputFileRef: null, retryCount: 0
        };
        return { ...u, automationState: { ...current, ...partialState } };
      })
    })),

  updateManualUploadState: (ucidId, partialState) =>
    set((state) => ({
      ucids: state.ucids.map((u) => {
        if (u.id !== ucidId) return u;
        const current = u.manualUploadState || {
          status: 'awaiting-upload', uploadedAt: null, fileNames: [],
          uploadedBy: null, rejectionReason: null, outputFileRefs: [], processedAt: null
        };
        return { ...u, manualUploadState: { ...current, ...partialState } as UCIDManualUploadState };
      })
    })),
});
