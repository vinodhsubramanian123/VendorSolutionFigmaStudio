/* eslint-disable complexity */
import React, { useState} from "react";
import { motion } from "motion/react";
import {
  Activity,
  GitCompare,
  Clock,
  
  Rocket,
  
} from "lucide-react";
import type { UCID, UCIDStep} from "../../types";
import { useToast } from "../shared/ToastContext";
// Split sub-components
import { SolutionBanner } from "./SolutionBanner";
import { CampaignConsolidationHub } from "./CampaignConsolidationHub";
import { StepContentPanel } from "./StepContentPanel";
import { NewUCIDModal } from "./NewUCIDModal";
import { StatusBadge } from "../shared/StatusBadge";
import { MissionControlSidebar } from "./MissionControlSidebar";
import { UCIDStepper } from "./UCIDStepper";
import { UCIDEventLedger } from "./UCIDEventLedger";
import { useMissionControlWorkflow } from "./useMissionControlWorkflow";
import { PRIORITY_COLOR } from "../../lib/constants";
import { ErrorBoundary } from "../shared/ErrorBoundary";
import { JobStreamer } from "../shared/JobStreamer";
interface MissionControlProps {
  selectedId?: string;
  onSelectId: (id: string | undefined) => void;
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  onNavigate: (view: import("../../types").AppView) => void;
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
export const MissionControl = React.memo(function MissionControl({
  selectedId,
  onSelectId,
  ucids,
  setUcids,
  onNavigate,
  deployedSolution,
  setDeployedSolution,
}: MissionControlProps) {
  const { toast } = useToast();
  const [viewStep, setViewStep] = useState<UCIDStep | null>(null);
  const [showNewUCID, setShowNewUCID] = useState(false);
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
  const {
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
  } = useMissionControlWorkflow({ ucids, setUcids, setViewStep, toast });
  if (!selected || ucids.length === 0) {
    return (
      <ErrorBoundary>
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] border border-dashed border-brand-indigo/15 bg-surface-elevated/50 rounded-xl m-6">
          <div className="w-16 h-16 rounded-full bg-brand-indigo/10 flex items-center justify-center mb-6 border border-brand-indigo/20">
            <Rocket className="w-8 h-8 text-brand-indigo" />
          </div>
          <h2 className="text-xl font-bold text-content-primary mb-2">No Active Missions</h2>
          <p className="text-content-muted text-sm text-center max-w-md mb-8">
            Initialize a new UCID campaign to begin intelligence tracking.
          </p>
          <button type="button"
            aria-label="Create New Mission"
            onClick={() => setShowNewUCID(true)}
            className="px-6 py-2.5 rounded-lg bg-brand-indigo text-white font-bold tracking-wide text-sm cursor-pointer shadow-lg shadow-brand-indigo/20 transition-all hover:bg-brand-indigo/90"
          >
            Create New Mission
          </button>
        </div>
      </ErrorBoundary>
    );
  }
  return (
    <ErrorBoundary>
      <motion.div 
        className="flex flex-col gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", staggerChildren: 0.1 }}
      >
        {activeJobId && (
          <JobStreamer
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
          setUcids={setUcids}
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
              aria-label="Switch to UCID Worksheet Pipeline Tracker"
              aria-pressed={workspaceMode === "individual"}
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
              aria-label="Switch to Campaign Consolidation Hub"
              aria-pressed={workspaceMode === "consolidation"}
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
                        <Clock className="w-3.5 h-3.5" /> Ingested {new Date(selected.createdAt).toLocaleDateString()}
                      </span>
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
                      onRegress={() => regressStep(selected.id)}
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
                        toast(msg, type)
                      }
                      onNavigate={onNavigate}
                    />
                  </div>
                </div>
                <UCIDEventLedger ucid={selected} onClear={() => clearLogEvents(selected.id)} />
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
    </motion.div>
    </ErrorBoundary>
  );
});