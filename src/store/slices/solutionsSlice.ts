import type { StateCreator } from 'zustand';
import type { SolutionProject } from '../../types';
import { SOLUTIONS as INITIAL_SOLUTIONS } from '../../lib/mockData';
import type { CoreState, SolutionsSlice } from '../types';

export type { SolutionsSlice };

/**
 * Solution Builder domain slice: `solutions` (SolutionProject records) and
 * the currently active solution. Split out of the former coreStore.ts
 * monolith (see docs/architecture/gap-remediation-plan.md, Area 16).
 *
 * NAMING COLLISION NOTE (inherited from types/models/sourcing.ts):
 * `UCID.solutions: Solution[]` is a different concept (vendor design
 * alternatives) from this slice's `solutions: SolutionProject[]`. Do not
 * conflate the two when reading this file.
 */
export const createSolutionsSlice: StateCreator<CoreState, [], [], SolutionsSlice> = (set) => ({
  solutions: INITIAL_SOLUTIONS as SolutionProject[],
  activeSolutionId: null,

  addSolution: (sol) =>
    set((state) => ({ solutions: [...state.solutions, sol] })),

  updateSolutionStatus: (id, status) =>
    set((state) => ({
      solutions: state.solutions.map((s) =>
        s.id === id ? { ...s, status } : s
      ),
    })),

  updateSolutionFields: (id, fields) =>
    set((state) => ({
      solutions: state.solutions.map((s) =>
        s.id === id ? { ...s, ...fields } : s
      ),
    })),

  deleteSolution: (id) =>
    set((state) => ({
      solutions: state.solutions.filter((s) => s.id !== id),
      // Clear activeSolutionId if the deleted solution was active
      activeSolutionId: state.activeSolutionId === id ? null : state.activeSolutionId,
    })),

  addUcidToSolution: (solutionId, ucidId) =>
    set((state) => ({
      solutions: state.solutions.map((s) =>
        s.id === solutionId
          ? { ...s, ucidIds: [...s.ucidIds, ucidId] }
          : s
      ),
    })),

  setActiveSolution: (id) => set({ activeSolutionId: id }),

  setActiveUcidInSolution: (solutionId, ucidId) =>
    set((state) => ({
      solutions: state.solutions.map((s) =>
        s.id === solutionId ? { ...s, activeUcidId: ucidId } : s
      ),
    })),

  addVendorAssignment: (solutionId, assignment) =>
    set((state) => ({
      solutions: state.solutions.map((s) =>
        s.id === solutionId
          ? { ...s, vendorAssignments: [...s.vendorAssignments, assignment] }
          : s
      ),
    })),
});
