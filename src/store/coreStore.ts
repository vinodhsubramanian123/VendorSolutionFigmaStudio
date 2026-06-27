import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UCID, Vendor, CatalogSKU, ForensicIssue, SourcingRule, LearningEvent, SolutionProject, SolutionStatus, VendorAssignment, UCIDExecutionMode, UCIDAutomationState, UCIDManualUploadState } from '../types';
import {
  UCIDS as INITIAL_UCIDS,
  VENDORS as INITIAL_VENDORS,
  CATALOG_SKUS as INITIAL_SKUS,
  FORENSIC_ISSUES as INITIAL_ISSUES,
  SOLUTIONS as INITIAL_SOLUTIONS,
} from "../lib/mockData";
import { INITIAL_RULES } from "../mocks/sourcingMocks";
import { deriveSolutionStatus } from "../utils/solutionUtils";

interface CoreState {
  solutions: SolutionProject[];
  activeSolutionId: string | null;

  addSolution: (sol: SolutionProject) => void;
  updateSolutionStatus: (id: string, status: SolutionStatus) => void;
  addUcidToSolution: (solutionId: string, ucidId: string) => void;
  setActiveSolution: (id: string | null) => void;
  setActiveUcidInSolution: (solutionId: string, ucidId: string | null) => void;
  addVendorAssignment: (solutionId: string, assignment: VendorAssignment) => void;
  
  setUcidExecutionMode: (ucidId: string, mode: UCIDExecutionMode) => void;
  updateAutomationState: (ucidId: string, state: Partial<UCIDAutomationState>) => void;
  updateManualUploadState: (ucidId: string, state: Partial<UCIDManualUploadState>) => void;

  collapsed: boolean;
  setCollapsed: (val: boolean | ((prev: boolean) => boolean)) => void;
  
  activeMissionId: string | undefined;
  setActiveMissionId: (id: string | undefined | ((prev: string | undefined) => string | undefined)) => void;

  ucids: UCID[];
  setUcids: (val: UCID[] | ((prev: UCID[]) => UCID[])) => void;

  vendors: Vendor[];
  setVendors: (val: Vendor[] | ((prev: Vendor[]) => Vendor[])) => void;

  catalogSkus: CatalogSKU[];
  setCatalogSkus: (val: CatalogSKU[] | ((prev: CatalogSKU[]) => CatalogSKU[])) => void;

  forensicIssues: ForensicIssue[];
  setForensicIssues: (val: ForensicIssue[] | ((prev: ForensicIssue[]) => ForensicIssue[])) => void;

  sourcingRules: SourcingRule[];
  setSourcingRules: (val: SourcingRule[] | ((prev: SourcingRule[]) => SourcingRule[])) => void;

  learningEvents: LearningEvent[];
  setLearningEvents: (val: LearningEvent[] | ((prev: LearningEvent[]) => LearningEvent[])) => void;
}

export const useCoreStore = create<CoreState>()(
  persist(
    (set) => ({
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

      collapsed: false,
      setCollapsed: (val) => set((state) => ({ collapsed: typeof val === 'function' ? val(state.collapsed) : val })),

      activeMissionId: "u1",
      setActiveMissionId: (id) => set((state) => ({ activeMissionId: typeof id === 'function' ? id(state.activeMissionId) : id })),

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

      vendors: INITIAL_VENDORS as Vendor[],
      setVendors: (val) => set((state) => ({ vendors: typeof val === 'function' ? val(state.vendors) : val })),

      catalogSkus: INITIAL_SKUS as CatalogSKU[],
      setCatalogSkus: (val) => set((state) => ({ catalogSkus: typeof val === 'function' ? val(state.catalogSkus) : val })),

      forensicIssues: INITIAL_ISSUES as ForensicIssue[],
      setForensicIssues: (val) => set((state) => ({ forensicIssues: typeof val === 'function' ? val(state.forensicIssues) : val })),

      sourcingRules: INITIAL_RULES as SourcingRule[],
      setSourcingRules: (val) => set((state) => ({ sourcingRules: typeof val === 'function' ? val(state.sourcingRules) : val })),

      learningEvents: [],
      setLearningEvents: (val) => set((state) => ({ learningEvents: typeof val === 'function' ? val(state.learningEvents) : val })),
    }),
    {
      name: 'vsip-core-storage',
    }
  )
);
