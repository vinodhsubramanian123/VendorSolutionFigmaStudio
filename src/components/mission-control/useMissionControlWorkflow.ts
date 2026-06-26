import { useState } from "react";
import { apiClient } from "../../services/apiClient";
import type { UCID, UCIDStep, Snapshot, VendorSubmission } from "../../types";
import { STEP_ORDER } from "../../lib/mockData";
import { generateDefaultSolutions } from "../../lib/demoDataBuilder";
import { useAuditLog } from "../../hooks/useAuditLog";

interface UseMissionControlWorkflowProps {
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  setViewStep: React.Dispatch<React.SetStateAction<UCIDStep | null>>;
  toast: (message: string, type?: "error" | "warn" | "success", actionLabel?: string, onAction?: () => void) => void;
}

export function useMissionControlWorkflow({
  ucids,
  setUcids,
  setViewStep,
  toast,
}: UseMissionControlWorkflowProps) {
  const [runningIntel, setRunningIntel] = useState<string | null>(null);
  const [intelProgress, setIntelProgress] = useState(0);
  const [committingSnapshot, setCommittingSnapshot] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const { recordAuditLog } = useAuditLog();

  async function runIntelligence(ucidId: string) {
    setRunningIntel(ucidId);
    setIntelProgress(0);

    try {
      const response = await apiClient.post<{ job_id: string }>("/api/jobs", {
        type: "config_process",
        context: { ucid: ucidId, config_id: "intel-scan", solution_id: "baseline" },
        parent_job_id: "",
      });
      setActiveJobId(response.data.job_id);
    } catch (e: unknown) {
      toast("Failed to initiate intelligence scan: " + (e as Error).message, "error");
      setRunningIntel(null);
    }
  }

  function onIntelSuccess(result: unknown, context: unknown) {
    setActiveJobId(null);
    setRunningIntel(null);
    const ucidId = (context as { ucid: string }).ucid;
    setUcids((prev) => {
      const match = prev.find((u) => u.id === ucidId);
      if (match) {
        const currentIdx = STEP_ORDER.indexOf(match.currentStep);
        const nextStep = STEP_ORDER[currentIdx + 1] || match.currentStep;
        recordAuditLog(match.currentStep, nextStep, "PRE_INTEL AUTO_ADVANCE");
      }
      return prev.map((u) => {
        if (u.id === ucidId) {
          const currentIdx = STEP_ORDER.indexOf(u.currentStep);
          const nextStep = STEP_ORDER[currentIdx + 1] || u.currentStep;

          // Mock adding a solution if there wasn't one
          const updatedSolutions =
            u.solutions.length > 0 ? u.solutions : generateDefaultSolutions(ucidId);

          return {
            ...u,
            currentStep: nextStep,
            completedSteps: [...u.completedSteps, u.currentStep],
            solutions: updatedSolutions,
            events: [
              ...u.events,
              {
                timestamp: new Date().toISOString(),
                level: "ok",
                msg: `Pre-Intelligence completed. Matches mapped to ${updatedSolutions.length} options.`,
              },
            ],
          };
        }
        return u;
      });
    });
  }

  function onIntelError(error: string, context: unknown) {
    setActiveJobId(null);
    setRunningIntel(null);
    toast(error, "error");
  }

  function advanceStep(ucidId: string) {
    setUcids((prev) => {
      const match = prev.find((u) => u.id === ucidId);
      if (match) {
        const idx = STEP_ORDER.indexOf(match.currentStep);
        const next = STEP_ORDER[idx + 1];
        if (next) {
          recordAuditLog(match.currentStep, next, "MANUAL_STEP_ADVANCE");
        }
      }
      return prev.map((u) => {
        if (u.id !== ucidId) return u;
        const idx = STEP_ORDER.indexOf(u.currentStep);
        const next = STEP_ORDER[idx + 1];
        if (!next) return u;
        return {
          ...u,
          completedSteps: [...u.completedSteps, u.currentStep],
          currentStep: next,
          events: [
            ...u.events,
            {
              timestamp: new Date().toISOString(),
              level: "info",
              msg: `Step advanced from ${u.currentStep} to ${next}.`,
            },
          ],
        };
      });
    });
    setViewStep(null);
  }

  function regressStep(ucidId: string) {
    setUcids((prev) => {
      const match = prev.find((u) => u.id === ucidId);
      if (match) {
        const idx = STEP_ORDER.indexOf(match.currentStep);
        const prevStep = STEP_ORDER[idx - 1];
        if (prevStep) {
          recordAuditLog(match.currentStep, prevStep, "MANUAL_STEP_REGRESS");
        }
      }
      return prev.map((u) => {
        if (u.id !== ucidId) return u;
        const idx = STEP_ORDER.indexOf(u.currentStep);
        const prevStep = STEP_ORDER[idx - 1];
        if (!prevStep) return u;
        return {
          ...u,
          completedSteps: u.completedSteps.filter((s) => s !== prevStep),
          currentStep: prevStep,
          events: [
            ...u.events,
            {
              timestamp: new Date().toISOString(),
              level: "info",
              msg: `Step regressed from ${u.currentStep} to ${prevStep}.`,
            },
          ],
        };
      });
    });
    setViewStep(null);
  }

  async function commitSnapshot(ucidId: string) {
    setCommittingSnapshot(true);

    const ucid = ucids.find((u) => u.id === ucidId);
    if (!ucid) {
      setCommittingSnapshot(false);
      return;
    }

    const prizeSol = ucid.solutions[0]?.vendorSubmissions?.[0] ?? ({
      id: "vs-mock-fallback",
      label: "Dual-sourced solution",
      totalPrice: 244000,
      vendor: "Unknown",
      originalPrice: 244000,
      savings: 0,
      complianceScore: 100,
      configs: [],
    } as VendorSubmission);

    const newSnapshot: Snapshot = {
      id: crypto.randomUUID(),
      version: ucid.snapshots.length + 1,
      timestamp: new Date().toISOString(),
      label: "Mission Control Milestone Lock",
      committedAt:
        new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
      winnerSolution: prizeSol?.label || "Consolidated Execution",
      totalValue: prizeSol.totalPrice,
      notes: "Contract locked & archived automatically in secure compliance ledger.",
      payload: ucid.solutions,
      locked: true,
      bomSnapshot: prizeSol.configs || [],
    };

    try {
      await apiClient.post(`/api/ucids/${ucidId}/snapshots`, { snapshot: newSnapshot });
      setUcids((prev) => {
        const match = prev.find((u) => u.id === ucidId);
        if (match) {
          recordAuditLog(
            match.currentStep,
            match.currentStep,
            "SNAPSHOT_LOCKED",
          );
        }
        return prev.map((u) => {
          if (u.id === ucidId) {
            return {
              ...u,
              completedSteps: [...u.completedSteps, "comparison" as UCIDStep],
              currentStep: "snapshot" as UCIDStep,
              snapshots: [...u.snapshots, newSnapshot],
              events: [
                ...u.events,
                {
                  timestamp: new Date().toISOString(),
                  level: "ok",
                  msg: "Snapshot securely committed to immutable ledger.",
                },
              ],
            };
          }
          return u;
        });
      });
      toast("Snapshot securely locked and persisted to ledger.", "success");
    } catch (e) {
      console.error("[useMissionControlWorkflow] snapshot failure", e);
      toast("Failed to commit snapshot to the server.", "error");
    } finally {
      setCommittingSnapshot(false);
    }
  }

  function appendLogEvent(
    ucidId: string,
    level: "info" | "warn" | "ok" | "err",
    msg: string,
  ) {
    setUcids((prev) =>
      prev.map((u) => {
        if (u.id === ucidId) {
          return {
            ...u,
            events: [
              ...u.events,
              { timestamp: new Date().toISOString(), level, msg },
            ],
          };
        }
        return u;
      }),
    );
  }

  function clearLogEvents(ucidId: string) {
    setUcids((prev) =>
      prev.map((u) => {
        if (u.id === ucidId) {
          return {
            ...u,
            events: [],
          };
        }
        return u;
      }),
    );
  }

  return {
    runningIntel,
    intelProgress,
    committingSnapshot,
    activeJobId,
    runIntelligence,
    onIntelSuccess,
    onIntelError,
    advanceStep,
    regressStep,
    commitSnapshot,
    appendLogEvent,
    clearLogEvents,
  };
}
