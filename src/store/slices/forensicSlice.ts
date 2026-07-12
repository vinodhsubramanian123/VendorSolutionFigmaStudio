import type { StateCreator } from 'zustand';
import type { ForensicIssue, SourcingRule } from '../../types';
import { FORENSIC_ISSUES as INITIAL_ISSUES } from '../../lib/mockData';
import { INITIAL_RULES } from '../../mocks/sourcingMocks';
import type { CoreState, ForensicSlice } from '../types';

export type { ForensicSlice };

/**
 * Forensics / Audit domain slice: forensic issues and their sourcing
 * rules. These two are kept together (rather than split further) because
 * they're the same "Forensics / Rules" pairing the Area 16 analysis itself
 * names as one grouping. Split out of coreStore.ts per
 * docs/architecture/gap-remediation-plan.md.
 */
export const createForensicSlice: StateCreator<CoreState, [], [], ForensicSlice> = (set) => ({
  forensicIssues: INITIAL_ISSUES as ForensicIssue[],
  setForensicIssues: (val) => set((state) => ({ forensicIssues: typeof val === 'function' ? val(state.forensicIssues) : val })),

  sourcingRules: INITIAL_RULES as SourcingRule[],
  setSourcingRules: (val) => set((state) => ({ sourcingRules: typeof val === 'function' ? val(state.sourcingRules) : val })),
});
