import type {
  UCID, Vendor, CatalogSKU, ForensicIssue, SourcingRule, LearningEvent,
  SolutionProject, SolutionStatus, VendorAssignment,
  UCIDExecutionMode, UCIDAutomationState, UCIDManualUploadState,
} from '../types';

/**
 * Slice interfaces + the combined CoreState type, kept in their own file
 * with zero dependency on the slice *creators* (createSolutionsSlice etc.)
 * or on coreStore.ts itself. This exists purely to break a circular import:
 * each slice creator needs `StateCreator<CoreState, ...>` to type cross-
 * slice access (e.g. ucidsSlice reading solutionsSlice's state), and
 * coreStore.ts needs every slice creator — if CoreState lived in either of
 * those files, the other direction would create a cycle that
 * dependency-cruiser's no-circular rule (a hard error in this project,
 * .dependency-cruiser.cjs) correctly flags even for type-only imports,
 * since tsPreCompilationDeps is enabled. See
 * docs/architecture/gap-remediation-plan.md, Area 16.
 */

export interface SolutionsSlice {
  solutions: SolutionProject[];
  activeSolutionId: string | null;

  addSolution: (sol: SolutionProject) => void;
  updateSolutionStatus: (id: string, status: SolutionStatus) => void;
  updateSolutionFields: (id: string, fields: Partial<Pick<SolutionProject, 'name' | 'customerName' | 'projectRef' | 'status'>>) => void;
  deleteSolution: (id: string) => void;
  addUcidToSolution: (solutionId: string, ucidId: string) => void;
  setActiveSolution: (id: string | null) => void;
  setActiveUcidInSolution: (solutionId: string, ucidId: string | null) => void;
  addVendorAssignment: (solutionId: string, assignment: VendorAssignment) => void;
}

export interface UcidsSlice {
  ucids: UCID[];
  setUcids: (val: UCID[] | ((prev: UCID[]) => UCID[])) => void;

  setUcidExecutionMode: (ucidId: string, mode: UCIDExecutionMode) => void;
  updateAutomationState: (ucidId: string, state: Partial<UCIDAutomationState>) => void;
  updateManualUploadState: (ucidId: string, state: Partial<UCIDManualUploadState>) => void;
}

export interface UiSlice {
  collapsed: boolean;
  setCollapsed: (val: boolean | ((prev: boolean) => boolean)) => void;

  activeMissionId: string | undefined;
  setActiveMissionId: (id: string | undefined | ((prev: string | undefined) => string | undefined)) => void;
}

export interface VendorsSlice {
  vendors: Vendor[];
  setVendors: (val: Vendor[] | ((prev: Vendor[]) => Vendor[])) => void;
}

export interface CatalogSlice {
  catalogSkus: CatalogSKU[];
  setCatalogSkus: (val: CatalogSKU[] | ((prev: CatalogSKU[]) => CatalogSKU[])) => void;
}

export interface ForensicSlice {
  forensicIssues: ForensicIssue[];
  setForensicIssues: (val: ForensicIssue[] | ((prev: ForensicIssue[]) => ForensicIssue[])) => void;

  sourcingRules: SourcingRule[];
  setSourcingRules: (val: SourcingRule[] | ((prev: SourcingRule[]) => SourcingRule[])) => void;
}

export interface TelemetrySlice {
  learningEvents: LearningEvent[];
  setLearningEvents: (val: LearningEvent[] | ((prev: LearningEvent[]) => LearningEvent[])) => void;
}

export type CoreState =
  & SolutionsSlice
  & UcidsSlice
  & UiSlice
  & VendorsSlice
  & CatalogSlice
  & ForensicSlice
  & TelemetrySlice;
