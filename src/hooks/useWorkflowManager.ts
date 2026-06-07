import { useLocalStorageState } from './useLocalStorageState';

export type WorkflowStepStatus = 'idle' | 'in-progress' | 'completed' | 'error';

export interface WorkflowStep {
  id: string;
  label: string;
  status: WorkflowStepStatus;
}

export function useWorkflowManager(workflowKey: string, initialSteps: string[]) {
  const [currentStepIndex, setCurrentStepIndex] = useLocalStorageState<number>(`${workflowKey}_current_step`, 0);
  const [stepStatuses, setStepStatuses] = useLocalStorageState<Record<string, WorkflowStepStatus>>(
    `${workflowKey}_statuses`,
    initialSteps.reduce((acc, step, index) => {
      acc[step] = index === 0 ? 'in-progress' : 'idle';
      return acc;
    }, {} as Record<string, WorkflowStepStatus>)
  );
  const [auditLogs, setAuditLogs] = useLocalStorageState<Array<{ timestamp: string; fromStep?: string; toStep: string; action: string }>>(
    `${workflowKey}_audit_logs`,
    []
  );

  const getCurrentStep = () => initialSteps[currentStepIndex];

  const logTransition = (action: string, fromStep?: string, toStep?: string) => {
    setAuditLogs((prev) => [
      ...prev,
      {
        timestamp: new Date().toISOString(),
        action,
        fromStep,
        toStep: toStep || 'unknown',
      }
    ]);
  };

  const advanceStep = () => {
    if (currentStepIndex < initialSteps.length - 1) {
      const currentStep = initialSteps[currentStepIndex];
      const nextStep = initialSteps[currentStepIndex + 1];
      
      setStepStatuses((prev) => ({
        ...prev,
        [currentStep]: 'completed',
        [nextStep]: 'in-progress',
      }));
      
      setCurrentStepIndex(currentStepIndex + 1);
      logTransition('advance_step', currentStep, nextStep);
      return nextStep;
    }
    
    // Complete the last step
    const currentStep = initialSteps[currentStepIndex];
    setStepStatuses((prev) => ({
      ...prev,
      [currentStep]: 'completed',
    }));
    logTransition('complete_workflow', currentStep, currentStep);
    return null;
  };

  const jumpToStep = (stepId: string) => {
    const index = initialSteps.indexOf(stepId);
    if (index !== -1) {
      const fromStep = initialSteps[currentStepIndex];
      setCurrentStepIndex(index);
      setStepStatuses((prev) => ({
        ...prev,
        [stepId]: prev[stepId] === 'completed' ? 'completed' : 'in-progress',
      }));
      logTransition('jump_to_step', fromStep, stepId);
    }
  };

  const setStepStatus = (stepId: string, status: WorkflowStepStatus) => {
    setStepStatuses((prev) => ({ ...prev, [stepId]: status }));
  };

  const resetWorkflow = () => {
    setCurrentStepIndex(0);
    setStepStatuses(
      initialSteps.reduce((acc, step, index) => {
        acc[step] = index === 0 ? 'in-progress' : 'idle';
        return acc;
      }, {} as Record<string, WorkflowStepStatus>)
    );
    logTransition('reset_workflow');
  };

  return {
    steps: initialSteps,
    currentStepIndex,
    currentStepId: getCurrentStep(),
    stepStatuses,
    auditLogs,
    advanceStep,
    jumpToStep,
    setStepStatus,
    resetWorkflow,
  };
}
