import React, { useMemo } from "react";
import { motion } from "motion/react";
import { Upload, Check, Clock, Play } from "lucide-react";
import { useToast } from "../shared/ToastContext";
import { apiClient } from "../../services/apiClient";
import type { UCID, AppView } from "../../types";
import { IngestionMode } from "../../types/data";

import { BoqIngestWorkbook } from "./BoqIngestWorkbook";
import { TechnicalBomWorkspace } from "./TechnicalBomWorkspace";
import { HybridPortfolioOrchestration } from "./HybridPortfolioOrchestration";
import { LaunchStep } from "./LaunchStep";
import { ErrorBoundary } from "../shared/ErrorBoundary";
import { useIngestionLogic } from "./useIngestionLogic";
import { JobStreamer } from "../shared/JobStreamer";

interface IngestionHubProps {
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  onNavigate: (view: AppView) => void;
  onSelectMission: (id: string) => void;
  isPendingAPI?: boolean;
  setIsPendingAPI?: (pending: boolean) => void;
  pendingAPIMessage?: string;
  setPendingAPIMessage?: (msg: string) => void;
  setApiProgress?: (progress: number) => void;
}

export function IngestionHub({
  ucids,
  setUcids,
  onNavigate,
  onSelectMission,
  isPendingAPI = false,
  setIsPendingAPI = () => {},
  setPendingAPIMessage = () => {},
  setApiProgress = () => {},
}: IngestionHubProps) {
  const logic = useIngestionLogic({
    ucids,
    setUcids,
    setIsPendingAPI,
    setPendingAPIMessage,
    setApiProgress,
  });

  const stepperSteps = useMemo(() => [
    { id: IngestionMode.BOQ, label: "1. BOQ Intake" },
    { id: IngestionMode.BOM, label: "2. BOM Compile" },
    { id: IngestionMode.PORTFOLIO, label: "3. Hybrid Automation" },
    { id: IngestionMode.LAUNCH, label: "4. Launch", icon: Play },
  ], []);

  return (
    <ErrorBoundary>
      <motion.div 
        className="flex flex-col gap-6 relative select-none"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", staggerChildren: 0.1 }}
      >
        {/* Visual Title Header */}
        <div className="flex flex-col gap-4 bg-surface-header border border-indigo-500/10 p-5 rounded-xl">
          {/* Unified Pipeline Active Banner */}
          <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-xl flex items-center justify-between text-left gap-4">
            <div>
              <span className="text-[9px] font-bold text-indigo-400 font-mono tracking-wider uppercase bg-indigo-500/10 px-2 py-0.5 rounded">
                ● Unified State Sync Connected
              </span>
              <p className="text-[11px] text-white font-semibold mt-1">
                Centralized Sourcing Ingestion & Worksheets
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">
                This hub is the single source of truth for all external spreadsheets. Uploads parsed here automatically propagate to parallel <span className="text-gray-300 font-medium">Live Mission Tracks</span> and <span className="text-gray-300 font-medium">BOM Reconciliation Diff</span> dashboards.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                Status: Synchronized
              </span>
              <span className="text-[9px] text-gray-500 font-sans block mt-0.5 animate-fadeIn">
                Active opportunities: {ucids.length}
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                <Upload className="w-5 h-5 text-sky-400" />
              </div>
              <div className="flex-1 text-left">
                <h1 className="text-sm font-semibold text-white">
                  Centralized BOQ & BOM Ingestion Hub
                </h1>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
                  Upload raw Bills of Quantities or Technical Bills of Materials and get real-time contract audits.
                </p>
              </div>
              {logic.auditLogs.length > 0 && logic.currentStepIndex > 0 && (
                <div className="hidden lg:flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg shrink-0 text-left">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <div className="text-right">
                    <p className="text-[9px] text-gray-400 font-mono uppercase">
                      Last Active Checkpoint
                    </p>
                    <p className="text-[10px] font-bold text-white capitalize">
                      {logic.currentStepId}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => logic.resetWorkflow()}
                    className="ml-2 px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-[9px] font-bold transition uppercase cursor-pointer"
                  >
                    Restart
                  </button>
                </div>
              )}
            </div>

            {/* Lifecycle Workflow Stepper */}
            <div className="flex mt-5 bg-surface-elevated rounded-lg border border-white/5 shrink-0 overflow-hidden relative">
              <div className="absolute inset-0 bg-indigo-500/5" />
              <div className="relative flex w-full">
                {stepperSteps.map((step, idx) => {
                  const isActive = logic.currentStepId === step.id;
                  const isPast =
                    ["boq", "bom", "portfolio", "launch"].indexOf(logic.currentStepId) >
                    idx;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => logic.jumpToStep(step.id)}
                      className={`flex-1 min-w-[120px] justify-center flex items-center px-4 py-2 border-r border-white/5 last:border-r-0 font-bold tracking-tight text-[10px] uppercase transition cursor-pointer gap-1.5 relative ${
                        isActive
                          ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20 font-black"
                          : isPast
                            ? "bg-emerald-500/10 text-emerald-400 hover:text-emerald-300"
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {isPast && !isActive && (
                        <Check className="w-3.5 h-3.5 shrink-0" />
                      )}
                      {step.icon && (
                        <step.icon
                          className={`w-3.5 h-3.5 ${isActive ? "text-white" : ""} shrink-0`}
                        />
                      )}
                      <span className="truncate">{step.label}</span>
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      {logic.mode === "boq" && (
        <>
          <BoqIngestWorkbook
            selectedPreset={logic.selectedPreset}
            setSelectedPreset={logic.setSelectedPreset}
            boqFile={logic.boqFile}
            isBOQIngesting={logic.isBOQIngesting}
            boqProgress={logic.boqProgress}
            boqResponse={logic.boqResponse}
            boqError={logic.boqError}
            onTriggerBOQParse={logic.triggerBOQParse}
            onSplitAndProvision={logic.handleSplitAndProvision}
          />
          {logic.boqJobId && (
            <JobStreamer
              jobId={logic.boqJobId}
              context={{ ucid: "mock-ucid", config_id: "mock-cfg", solution_id: logic.selectedPreset }}
              onSuccess={logic.onJobSuccess}
              onError={logic.onJobError}
            />
          )}
        </>
      )}

      {logic.mode === "bom" && (
        <TechnicalBomWorkspace
          ucids={ucids}
          selectedUcidId={logic.selectedUcidId}
          setSelectedUcidId={logic.setSelectedUcidId}
          bomVerifyResult={logic.bomVerifyResult}
          setBomVerifyResult={logic.setBomVerifyResult}
          bomReconResult={logic.bomReconResult}
          setBomReconResult={logic.setBomReconResult}
          activeBOMFile={logic.activeBOMFile}
          setActiveBOMFile={logic.setActiveBOMFile}
          isBOMIngesting={logic.isBOMIngesting}
          setIsBOMIngesting={logic.setIsBOMIngesting}
          bomProgress={logic.bomProgress}
          setBomProgress={logic.setBomProgress}
          selectedBomsForBatch={logic.selectedBomsForBatch}
          setSelectedBomsForBatch={logic.setSelectedBomsForBatch}
          bomError={logic.bomError}
          onTriggerBOMParse={logic.triggerBOMParse}
          onTriggerBatchReconciliation={logic.triggerBatchReconciliation}
          onSelectMission={onSelectMission}
        />
      )}

      {logic.mode === "portfolio" && (
        <HybridPortfolioOrchestration
          isPortfolioActive={logic.isPortfolioActive}
          hpeSyncedConfigs={logic.hpeSyncedConfigs}
          ciscoSyncedConfigs={logic.ciscoSyncedConfigs}
          manualBOMStatus={logic.manualBOMStatus}
          manualUploadedFiles={logic.manualUploadedFiles}
          onStartPortfolioPipeline={logic.handleStartPortfolioPipeline}
          onSimulateManualUpload={logic.simulateManualUpload}
          onAdvanceStep={logic.advanceStep}
          activeUCID={logic.targetUcid}
          ucids={ucids}
        />
      )}

      {logic.mode === "launch" && <LaunchStep onNavigate={onNavigate} />}
      </motion.div>
    </ErrorBoundary>
  );
}
