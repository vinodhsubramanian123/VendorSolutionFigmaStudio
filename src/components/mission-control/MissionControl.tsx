import { tokens } from "../../styles/tokens";
import React, { useState, useEffect, useMemo } from "react";
import {
  Activity,
  GitCompare,
  Clock,
  AlertCircle,
  SkipForward,
  Rocket,
  Loader2,
} from "lucide-react";
import type { UCID, UCIDStep, Solution, Snapshot } from "../../types";
import { STEP_ORDER } from "../../lib/mockData";

// Split sub-components
import { SolutionBanner } from "./SolutionBanner";
import { CampaignConsolidationHub } from "./CampaignConsolidationHub";
import { StepContentPanel } from "./StepContentPanel";
import { NewUCIDModal } from "./NewUCIDModal";
import { StatusBadge } from "../shared/StatusBadge";
import { MissionControlSidebar } from "./MissionControlSidebar";
import { UCIDStepper } from "./UCIDStepper";
import { UCIDEventLedger } from "./UCIDEventLedger";

import { generateDefaultSolutions } from "../../lib/demoDataBuilder";
import { PRIORITY_COLOR } from "../../lib/constants";
import { ErrorBoundary } from "../shared/ErrorBoundary";

import { JobPoller } from "../shared/JobPoller";

interface MissionControlProps {
  selectedId?: string;
  onSelectId: (id: string | undefined) => void;
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  deployedSolution?: {
    name: string;
    ucidCount: number;
    timestamp: number;
  } | null;
  setDeployedSolution?: React.Dispatch<
    React.SetStateAction<{
      name: string;
      ucidCount: number;
      timestamp: number;
    } | null>
  >;
}

export function MissionControl({
  selectedId,
  onSelectId,
  ucids,
  setUcids,
  deployedSolution,
  setDeployedSolution,
}: MissionControlProps) {
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "warn" | "error";
  } | null>(null);
  const [viewStep, setViewStep] = useState<UCIDStep | null>(null);
  const [runningIntel, setRunningIntel] = useState<string | null>(null);
  const [intelProgress, setIntelProgress] = useState(0);
  const [showNewUCID, setShowNewUCID] = useState(false);
  const [committingSnapshot, setCommittingSnapshot] = useState(false);
  const [hierarchyTab, setHierarchyTab] = useState<"visual" | "faq">("visual");
  const [workspaceMode, setWorkspaceMode] = useState<
    "individual" | "consolidation"
  >("individual");
  const [campaignSigner, setCampaignSigner] = useState("");
  const [campaignLocked, setCampaignLocked] = useState<Record<string, boolean>>(
    {},
  );

  // Helper function to extract or resolve Parent Solution/Campaign group
  function getSolutionName(u: UCID): string {
    if (u.solutionName) {
      return u.solutionName;
    }
    if (u.name.includes(" — ")) {
      return u.name.split(" — ")[0];
    }
    if (u.projectRef) {
      if (u.projectRef === "PRJ-VIRT-NORTH-2026")
        return "North Virtualization Cluster Campaign";
      if (u.projectRef === "PRJ-STO-BACKUP-EAST")
        return "East Backup Storage Consolidation";
      if (u.projectRef === "PRJ-NET-DC-SPINE")
        return "HQ Spine Network Overhaul";
      if (u.projectRef === "PRJ-WAN-EDGE-SEC")
        return "WAN Edge Security Gateway Refresh";
      return u.projectRef;
    }
    return "General Sourcing Projects";
  }

  // Group UCIDs by their overarching Solution name
  const groupedUcids = React.useMemo(() => {
    const groups: Record<string, UCID[]> = {};
    ucids.forEach((u) => {
      const groupName = getSolutionName(u);
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(u);
    });
    return groups;
  }, [ucids]);

  // Default to first UCID if none selected or if selected is not found
  const selected = ucids.find((u) => u.id === selectedId) ?? ucids[0];
  const activeStep = viewStep ?? (selected?.currentStep || "boq-intake");

  if (!selected || ucids.length === 0) {
    return (
      <ErrorBoundary>
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] border border-dashed border-brand-indigo/15 bg-surface-elevated/50 rounded-xl m-6">
          {/* Zero-state list visualization fallback when active ucids collection is empty */}
          <div className="w-16 h-16 rounded-full bg-brand-indigo/10 flex items-center justify-center mb-6 border border-brand-indigo/20">
            <Rocket className="w-8 h-8 text-brand-indigo" />
          </div>
          <h2 className="text-xl font-bold text-content-primary mb-2">No Active Missions</h2>
          <p className="text-content-muted text-sm text-center max-w-md mb-8">
            Initialize a new UCID campaign to begin intelligence tracking.
          </p>
          <button
            onClick={() => setShowNewUCID(true)}
            className="px-6 py-2.5 rounded-lg bg-brand-indigo text-white font-bold tracking-wide text-sm cursor-pointer shadow-lg shadow-brand-indigo/20 transition-all hover:bg-brand-indigo/90"
          >
            Create New Mission
          </button>
        </div>
      </ErrorBoundary>
    );
  }

  const completeCount = ucids.filter(
    (u) => u.currentStep === "snapshot",
  ).length;

  const solutionState: "planning" | "active" | "complete" =
    completeCount === ucids.length
      ? "complete"
      : ucids.some((u) => u.currentStep !== "boq-intake")
        ? "active"
        : "planning";

  function getStepState(
    u: UCID,
    stepId: UCIDStep,
  ): "upcoming" | "active" | "complete" {
    if (u.completedSteps.includes(stepId)) return "complete";
    if (stepId === u.currentStep) return "active";
    return "upcoming";
  }

  function recordAuditLog(
    fromStep: string | undefined,
    toStep: string,
    action: string,
  ) {
    try {
      const stored = localStorage.getItem("procurement_lifecycle_audit_logs");
      const currentLogs = stored ? JSON.parse(stored) : [];
      const newLog = {
        timestamp: new Date().toISOString(),
        fromStep,
        toStep,
        action,
      };
      localStorage.setItem(
        "procurement_lifecycle_audit_logs",
        JSON.stringify([...currentLogs, newLog].slice(-20)),
      );
    } catch (e) {
      console.warn("Failed to record audit log", e);
    }
  }

  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  async function runIntelligence(ucidId: string) {
    setRunningIntel(ucidId);
    setIntelProgress(0);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "config_process",
          context: { ucid: ucidId, config_id: "intel-scan", solution_id: "baseline" },
          parent_job_id: ""
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setActiveJobId(data.job_id);
      }
    } catch (e) {
      // Falback simulation if api fail
      const interval = setInterval(() => {
        setIntelProgress((p) => {
          if (p >= 100) {
            clearInterval(interval);
            onIntelSuccess({ success: true }, { ucid: ucidId, config_id: "intel-scan", solution_id: "baseline" });
            return 100;
          }
          return p + 15;
        });
      }, 150);
    }
  }

  function onIntelSuccess(result: any, context: any) {
    setActiveJobId(null);
    setRunningIntel(null);
    const ucidId = context.ucid;
    setUcids((prev) => {
      const match = prev.find((u) => u.id === ucidId);
      if (match) {
        const currentIdx = STEP_ORDER.indexOf(match.currentStep);
        const nextStep = STEP_ORDER[currentIdx + 1] || match.currentStep;
        recordAuditLog(
          match.currentStep,
          nextStep,
          "PRE_INTEL AUTO_ADVANCE",
        );
      }
      return prev.map((u) => {
        if (u.id === ucidId) {
          const currentIdx = STEP_ORDER.indexOf(u.currentStep);
          const nextStep = STEP_ORDER[currentIdx + 1] || u.currentStep;

          // Mock adding a solution if there wasn't one
          const updatedSolutions =
            u.solutions.length > 0
              ? u.solutions
              : generateDefaultSolutions();

          return {
            ...u,
            currentStep: nextStep,
            completedSteps: [...u.completedSteps, u.currentStep],
            solutions: updatedSolutions,
            events: [
              ...u.events,
              {
                ts: new Date().toLocaleTimeString(),
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

  function onIntelError(error: string, context: any) {
    setActiveJobId(null);
    setRunningIntel(null);
    setToast({
      message: error,
      type: "error"
    });
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
        };
      });
    });
    setViewStep(null);
  }

  function commitSnapshot(ucidId: string) {
    setCommittingSnapshot(true);
    setTimeout(() => {
      setCommittingSnapshot(false);
      setUcids((prev) => {
        const match = prev.find((u) => u.id === ucidId);
        if (match) {
          recordAuditLog(
            match.currentStep,
            "snapshot",
            "SNAPSHOT_COMMIT_EXECUTE",
          );
        }
        return prev.map((u) => {
          if (u.id !== ucidId) return u;
          const prizeSol =
            u.solutions[0]?.vendorSubmissions?.[0] ??
            ({
              label: "Dual-sourced solution",
              totalPrice: 244000,
              vendor: "Unknown",
              originalPrice: 244000,
              savings: 0,
              complianceScore: 100,
              configs: [],
            } as any);
          const snap: Snapshot = {
            id: `snap-${Date.now()}`,
            label: `Snapshot v${u.snapshots.length + 1}.0 — Committed`,
            committedAt:
              new Date().toISOString().replace("T", " ").substring(0, 19) +
              " UTC",
            winnerSolution: prizeSol?.name || "",
            totalValue: prizeSol.totalPrice,
            notes:
              "Contract locked & archived automatically in secure compliance ledger.",
          };
          return {
            ...u,
            completedSteps: [...u.completedSteps, "comparison" as UCIDStep],
            currentStep: "snapshot" as UCIDStep,
            snapshots: [...u.snapshots, snap],
            events: [
              ...u.events,
              {
                ts: new Date().toLocaleTimeString(),
                level: "ok",
                msg: `Snapshot locked successfully: ${prizeSol.label}`,
              },
            ],
          };
        });
      });
    }, 1500);
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
              { ts: new Date().toLocaleTimeString(), level, msg },
            ],
          };
        }
        return u;
      }),
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col gap-4 animate-fadeIn">
        {activeJobId && (
          <JobPoller
            jobId={activeJobId}
            context={{ ucid: runningIntel || "none", config_id: "intel-scan", solution_id: "baseline" }}
            onSuccess={onIntelSuccess}
            onError={onIntelError}
          />
        )}
      {/* Top solution banner */}
      <SolutionBanner
        ucids={ucids}
        solutionState={solutionState}
        completeCount={completeCount}
        deployedSolution={deployedSolution}
        onClearDeployed={() => setDeployedSolution && setDeployedSolution(null)}
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Left column: parallel active tickets */}
        <MissionControlSidebar 
          ucids={ucids}
          selectedId={selectedId}
          hierarchyTab={hierarchyTab}
          setHierarchyTab={setHierarchyTab}
          setShowNewUCID={setShowNewUCID}
          groupedUcids={groupedUcids}
          setWorkspaceMode={setWorkspaceMode}
          onSelectId={onSelectId}
          setViewStep={setViewStep}
          getSolutionName={getSolutionName}
        />

        {/* Right column: detailed workflow tracker */}
        <div className="xl:col-span-3 flex flex-col gap-4 min-w-0">
          {/* Sourcing Workspace Mode Selector Toolbar */}
          <div className="flex bg-surface-elevated p-1 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => setWorkspaceMode("individual")}
              className={`flex-1 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider cursor-pointer font-mono transition-all flex items-center justify-center gap-2 ${
                workspaceMode === "individual"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>UCID Worksheet Pipeline Tracker</span>
            </button>
            <button
              type="button"
              onClick={() => setWorkspaceMode("consolidation")}
              className={`flex-1 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider cursor-pointer font-mono transition-all flex items-center justify-center gap-2 ${
                workspaceMode === "consolidation"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>
                Campaign Consolidation Hub (
                {
                  ucids.filter(
                    (u) => getSolutionName(u) === getSolutionName(selected),
                  ).length
                }{" "}
                sheets)
              </span>
            </button>
          </div>

          <div className="pr-1">
            {workspaceMode === "consolidation" ? (
              <CampaignConsolidationHub
                campaignName={getSolutionName(selected)}
                campaignUcids={ucids.filter(
                  (u) => getSolutionName(u) === getSolutionName(selected),
                )}
                ucids={ucids}
                setUcids={setUcids}
                campaignSigner={campaignSigner}
                setCampaignSigner={setCampaignSigner}
                campaignLocked={campaignLocked}
                setCampaignLocked={setCampaignLocked}
              />
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border flex flex-col gap-4 bg-surface-elevated border-indigo-500/10">
                  {/* Mission Head */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-indigo-500/10">
                    <div className="text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-indigo-400 font-bold">
                          {selected.displayId}
                        </span>
                        <StatusBadge
                          status={selected.syncStatus || "Pending"}
                          variant={selected.syncStatus === "Synced" ? "success" : selected.syncStatus === "Out-of-Sync" ? "warning" : "info"}
                          size="sm"
                        />
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-indigo/15 border border-brand-indigo/20 text-indigo-400 font-semibold select-none">
                          Campaign: {getSolutionName(selected)}
                        </span>
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase"
                          style={{
                            backgroundColor:
                              PRIORITY_COLOR[selected.priority] + "18",
                            color: PRIORITY_COLOR[selected.priority],
                          }}
                        >
                          {selected.priority} Priority
                        </span>
                        <span className="text-xs text-gray-500">
                          Project Ref:{" "}
                          <span className="font-mono text-gray-400">
                            {selected.projectRef}
                          </span>
                        </span>
                      </div>
                      <h2 className="text-base text-white font-semibold mt-1">
                        {selected.name.includes(" — ")
                          ? selected.name.split(" — ").slice(1).join(" — ")
                          : selected.name}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2 self-start md:self-auto">
                      <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Ingested 2026-06
                      </span>
                      {selected.currentStep !== "snapshot" && (
                        <button
                          type="button"
                          onClick={() => advanceStep(selected.id)}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-bold bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/15 border border-indigo-500/20 transition-all cursor-pointer"
                        >
                          Advance Step <SkipForward className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stepper progress nodes and description */}
                  {ucids.length > 0 && (
                    <UCIDStepper
                      ucid={selected}
                      activeStep={activeStep}
                      setViewStep={setViewStep}
                      getStepState={getStepState}
                    />
                  )}

                  {/* Render step details depending on step index */}
                  <div className="pt-2">
                    <StepContentPanel
                      ucid={selected}
                      activeStep={activeStep}
                      runningIntel={runningIntel}
                      intelProgress={intelProgress}
                      committingSnapshot={committingSnapshot}
                      onRunIntel={() => runIntelligence(selected.id)}
                      onAdvance={() => advanceStep(selected.id)}
                      onCommitSnapshot={() => commitSnapshot(selected.id)}
                      appendLogEvent={(level, msg) =>
                        appendLogEvent(selected.id, level, msg)
                      }
                      onUpdateSolutions={(sols) => {
                        setUcids((prev) =>
                          prev.map((u) =>
                            u.id === selected.id
                              ? { ...u, solutions: sols }
                              : u,
                          ),
                        );
                      }}
                      onUpdateBOM={(bomText) => {
                        setUcids((prev) =>
                          prev.map((u) =>
                            u.id === selected.id
                              ? { ...u, rawBOM: bomText }
                              : u,
                          ),
                        );
                      }}
                      onShowToast={(msg, type) =>
                        setToast({ message: msg, type })
                      }
                    />
                  </div>
                </div>

                <UCIDEventLedger ucid={selected} />
              </div>
            )}
          </div>
        </div>
      </div>

      {showNewUCID && (
        <NewUCIDModal
          onClose={() => setShowNewUCID(false)}
          onCreate={(newU) => {
            setUcids((p) => [...p, newU]);
            setShowNewUCID(false);
            onSelectId(newU.id);
          }}
        />
      )}

      {/* Elegant Toast notification overlay */}
      {toast && (
        <div
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 p-3.5 rounded-lg border shadow-xl animate-fadeIn text-[11px] font-medium leading-none"
          style={{
            backgroundColor:
              toast.type === "success"
                ? `${tokens.colors.status.success}1a` 
                : toast.type === "warn"
                  ? `${tokens.colors.status.warning}1a` 
                  : `${tokens.colors.status.error}1a`, 
            borderColor:
              toast.type === "success"
                ? tokens.colors.status.success 
                : toast.type === "warn"
                  ? tokens.colors.status.warning 
                  : tokens.colors.status.error, 
            color:
              toast.type === "success"
                ? tokens.colors.status.success 
                : toast.type === "warn"
                  ? tokens.colors.status.warning 
                  : tokens.colors.status.error, 
          }}
        >
          <AlertCircle className="w-4 h-4 shrink-0 animate-bounce" />
          <span className="text-white font-sans">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-1 hover:text-white text-gray-500 font-bold cursor-pointer text-sm font-mono focus:outline-none"
          >
            ×
          </button>
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
}