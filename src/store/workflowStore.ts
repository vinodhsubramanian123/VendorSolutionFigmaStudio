import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorkflowStepStatus } from '../types';

export interface WorkflowManagerState {
  currentStepIndex: number;
  stepStatuses: Record<string, WorkflowStepStatus>;
  auditLogs: Array<{
    timestamp: string;
    fromStep?: string;
    toStep: string;
    action: string;
  }>;
}

interface WorkflowStoreState {
  workflows: Record<string, WorkflowManagerState>;
  setWorkflowState: (key: string, state: WorkflowManagerState | ((prev: WorkflowManagerState) => WorkflowManagerState)) => void;
}

export const useWorkflowStore = create<WorkflowStoreState>()(
  persist(
    (set) => ({
      workflows: {},
      setWorkflowState: (key, newState) => set((state) => {
        const prev = state.workflows[key];
        const updated = typeof newState === 'function' ? newState(prev) : newState;
        return {
          workflows: {
            ...state.workflows,
            [key]: updated,
          }
        };
      }),
    }),
    {
      name: 'vsip-workflow-storage',
      version: 1,
      migrate: (_persistedState, version) => {
        if (version < 1) {
          return {};
        }
        return _persistedState;
      },
    }
  )
);
