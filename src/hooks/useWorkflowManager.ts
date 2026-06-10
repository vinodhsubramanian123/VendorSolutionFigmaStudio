import { WorkflowStepStatus } from "../types";
import { useLocalStorageState } from "./useLocalStorageState";

interface WorkflowManagerState {
  currentStepIndex: number;
  stepStatuses: Record<string, WorkflowStepStatus>;
  auditLogs: Array<{
    timestamp: string;
    fromStep?: string;
    toStep: string;
    action: string;
  }>;
}

export function useWorkflowManager(
  workflowKey: string,
  initialSteps: string[],
) {
  const defaultStatuses = initialSteps.reduce(
    (acc, step, index) => {
      acc[step] = index === 0 ? "in-progress" : "idle";
      return acc;
    },
    {} as Record<string, WorkflowStepStatus>,
  );

  const [state, setState] = useLocalStorageState<WorkflowManagerState>(
    `${workflowKey}_state`,
    {
      currentStepIndex: 0,
      stepStatuses: defaultStatuses,
      auditLogs: [],
    },
  );

  const currentStepIndex = state.currentStepIndex;
  const stepStatuses = state.stepStatuses;
  const auditLogs = state.auditLogs;

  const getCurrentStep = () => initialSteps[currentStepIndex];

  const logTransition = (
    action: string,
    fromStep?: string,
    toStep?: string,
  ) => {
    setState((prev) => ({
      ...prev,
      auditLogs: [
        ...prev.auditLogs,
        {
          timestamp: new Date().toISOString(),
          action,
          fromStep,
          toStep: toStep || "unknown",
        },
      ],
    }));
  };

  const advanceStep = () => {
    if (currentStepIndex < initialSteps.length - 1) {
      const currentStep = initialSteps[currentStepIndex];
      const nextStep = initialSteps[currentStepIndex + 1];

      setState((prev) => ({
        ...prev,
        currentStepIndex: prev.currentStepIndex + 1,
        stepStatuses: {
          ...prev.stepStatuses,
          [currentStep]: "completed",
          [nextStep]: "in-progress",
        },
      }));
      logTransition("advance_step", currentStep, nextStep);
      return nextStep;
    }

    // Complete the last step
    const currentStep = initialSteps[currentStepIndex];
    setState((prev) => ({
      ...prev,
      stepStatuses: {
        ...prev.stepStatuses,
        [currentStep]: "completed",
      },
    }));
    logTransition("complete_workflow", currentStep, currentStep);
    return null;
  };

  const jumpToStep = (stepId: string) => {
    const index = initialSteps.indexOf(stepId);
    if (index !== -1) {
      const fromStep = initialSteps[currentStepIndex];
      setState((prev) => ({
        ...prev,
        currentStepIndex: index,
        stepStatuses: {
          ...prev.stepStatuses,
          [stepId]:
            prev.stepStatuses[stepId] === "completed"
              ? "completed"
              : "in-progress",
        },
      }));
      logTransition("jump_to_step", fromStep, stepId);
    }
  };

  const setStepStatus = (stepId: string, status: WorkflowStepStatus) => {
    setState((prev) => ({
      ...prev,
      stepStatuses: {
        ...prev.stepStatuses,
        [stepId]: status,
      },
    }));
  };

  const resetWorkflow = () => {
    setState({
      currentStepIndex: 0,
      stepStatuses: defaultStatuses,
      auditLogs: [],
    });
    logTransition("reset_workflow");
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
