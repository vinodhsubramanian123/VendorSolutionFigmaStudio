import type { CoreState } from '../../store/coreStore';
import { CATALOG_SKUS, VENDORS, UCID_STEPS } from '../../lib/mockData';

/**
 * Centralized Type-Safe Mock Factory for useCoreStore.
 * Prevents "Cannot read properties of undefined" errors when UI components are updated to read new store properties.
 */
export function createMockCoreState(overrides: Partial<CoreState> = {}): CoreState {
  return {
    solutions: [],
    ucids: [],
    catalogSkus: CATALOG_SKUS,
    sourcingRules: [],
    vendors: VENDORS,

    forensicIssues: [],
    learningEvents: [],
    collapsed: false,
    activeSolutionId: null,
    activeMissionId: undefined,
    
    // Actions (these will typically be mocked by vi.fn() in the test file if needed, but we provide empty implementations for type safety)
    setUcids: () => {},
    setCatalogSkus: () => {},
    setSourcingRules: () => {},
    setVendors: () => {},

    setForensicIssues: () => {},
    setLearningEvents: () => {},
    setCollapsed: () => {},
    setActiveSolution: () => {},
    setActiveMissionId: () => {},
    addSolution: () => {},
    updateSolutionStatus: () => {},
    addUcidToSolution: () => {},
    setActiveUcidInSolution: () => {},
    addVendorAssignment: () => {},
    setUcidExecutionMode: () => {},
    updateAutomationState: () => {},
    updateManualUploadState: () => {},
    
    ...overrides,
  };
}
