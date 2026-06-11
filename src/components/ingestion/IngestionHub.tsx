import React, { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { useLocalStorageState } from "../../hooks/useLocalStorageState";
import { useWorkflowManager } from "../../hooks/useWorkflowManager";
import {
  Upload,
  FileSpreadsheet,
  Check,
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Play,
  Activity,
  Loader2,
  AlertCircle,
  FileText,
  Download,
  Target,
  Cpu,
  HardDrive,
  Package,
  Plus,
  Search,
  Layers,
  Settings
} from "lucide-react";
import { useToast } from "../shared/ToastContext";
import type { UCID, Solution, BOMItem, AppView, ConstraintCheckResponse, ReconciliationResponse } from "../../types";

interface BoqResponsePayload {
  ucid: string;
  solutions?: Solution[];
  sourceFile?: string;
  parsedSummary?: {
    vendorBrand: string;
    detectedChassis: string;
    initialConfidenceScore: number;
  };
}
import { apiClient } from "../../services/apiClient";

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
  pendingAPIMessage = "",
  setPendingAPIMessage = () => {},
  setApiProgress = () => {},
}: IngestionHubProps) {
  // Workflow Manager Hook
  const {
    currentStepId,
    advanceStep,
    jumpToStep,
    auditLogs,
    currentStepIndex,
    resetWorkflow,
    selectedBomsForBatch,
    setSelectedBomsForBatch,
    isPortfolioActive,
    hpeSyncedConfigs,
    ciscoSyncedConfigs,
    manualBOMStatus,
    manualUploadedFiles,
    handleStartPortfolioPipeline,
    simulateManualUpload
  } = useIngestionLogic({
    ucids,
    setUcids,
    setIsPendingAPI,
    setPendingAPIMessage: setPendingAPIMessage as (msg: string) => void,
    setApiProgress: setApiProgress as (progress: number) => void
  });

  const { toast } = useToast();

  // Derived mode for backward compatibility with existing rendering logic
  const mode = currentStepId;
  const setMode = jumpToStep;

  const stepperSteps = useMemo(() => [
    { id: "boq", label: "1. BOQ Intake" },
    { id: "bom", label: "2. BOM Compile" },
    { id: "portfolio", label: "3. Hybrid Automation" },
    { id: "launch", label: "4. Launch", icon: Play },
  ], []);

  // ==========================================
  // SECTION A: BOQ SHEET INTAKE STATES & LOGIC
  // ==========================================
  const [selectedPreset, setSelectedPreset] = useLocalStorageState<
    "hpe-legacy" | "dell-overcharge" | "cisco-asymmetry"
  >("ingestion_boq_preset", "hpe-legacy");
  const [boqFile, setBoqFile] = useLocalStorageState<string>(
    "ingestion_boq_file",
    "",
  );
  const [isBOQIngesting, setIsBOQIngesting] = useState(false);
  const [boqProgress, setBoqProgress] = useState(0);
  const [boqResponse, setBoqResponse] = useLocalStorageState<BoqResponsePayload | null>(
    "ingestion_boq_response",
    null,
  );
  const [boqError, setBoqError] = useState<string>("");

  const [boqJobId, setBoqJobId] = useState<string | null>(null);

  const triggerBOQParse = async (
    fileName: string,
    preset: "hpe-legacy" | "dell-overcharge" | "cisco-asymmetry",
  ) => {
    setIsBOQIngesting(true);
    setBoqProgress(10);
    setBoqError("");
    setBoqFile(fileName);

    try {
      const response = await apiClient.post<{ job_id: string }>("/api/jobs", {
        type: "ingest",
        context: { ucid: "mock-ucid", config_id: "mock-cfg", solution_id: preset },
        parent_job_id: ""
      });
      setBoqJobId(response.data.job_id);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setBoqError(errorObj.message || "Failed to start BOQ ingest job.");
      setIsBOQIngesting(false);
    }
  };

  const onJobSuccess = async (result: unknown, context: unknown) => {
      // Instead of relying purely on Job result in the mock, we can fetch from our proper /api/boq/ingest to mimic exactly what happened previously
      const response = await apiClient.post<BoqResponsePayload>("/api/boq/ingest", {
        fileName: boqFile,
        presetType: (context as { solution_id: string }).solution_id,
        rawText: `[Manual central upload: ${boqFile}] presetType=${(context as { solution_id: string }).solution_id}`,
      });
      const data = response.data;
      setBoqResponse(data);
      setBoqProgress(100);
      setIsBOQIngesting(false);
      setBoqJobId(null);
  };

  const onJobError = (error: string, context: unknown) => {
      setBoqError(error);
      setIsBOQIngesting(false);
      setBoqJobId(null);
  };

  const handleSplitAndProvision = () => {
    if (!boqResponse) return;

    const prefix = "UCID-2026-";
    const generatedUcids: UCID[] = (boqResponse.solutions ?? []).map(
      (sol: Solution, idx: number) => {
        const displayId = `${prefix}${1700 + ucids.length + idx}`;
        const detailsText =
          sol.vendorSubmissions?.[0]?.configs?.[0]?.items
            ?.map(
              (i) => ` - ${i.name} (QTY ${i.quantity} @ $${i.unitPrice})`,
            )
            .join("\n") || "";

        return {
          id: `dynamic-hub-${displayId}`,
          displayId: displayId,
          name: `Sourced ${sol.vendorSubmissions?.[0]?.vendor || sol.name} Alignment Config`,
          solutionName: boqResponse.sourceFile,
          priority: idx === 0 ? "high" : "medium",
          projectRef: "PRJ-RECON-HUB",
          createdAt:
            new Date().toLocaleDateString() +
            " " +
            new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          currentStep: "solution-design",
          completedSteps: ["boq-intake", "pre-intelligence"],
          rawBOM: `Workbook parsed via central Ingestion Hub.\n\nSource sheet: ${boqResponse.sourceFile}\nVendor Profile: ${sol.vendorSubmissions?.[0]?.vendor || sol.name}\n\nComponents Detail:\n${detailsText}`,
          solutions: [
            {
              id: `sol-${displayId}-primary`,
              name: sol.name,
              targetUcidId: `dynamic-hub-${displayId}`,
              vendorSubmissions: sol.vendorSubmissions?.map((vs) => ({ ...vs })) || [],
            },
          ],
          events: [
            {
              ts: new Date().toLocaleTimeString(),
              level: "info",
              msg: `Central BOQ split allocated to target container ${displayId}`,
            },
            {
              ts: new Date().toLocaleTimeString(),
              level: "ok",
              msg: `Primary spec loaded with initial compliance score and structural items.`,
            },
          ],
          snapshots: [],
        };
      },
    );

    setUcids((prev) => {
      const existingIds = prev.map((p) => p.displayId);
      const filteredGenerated = generatedUcids.filter(
        (g) => !existingIds.includes(g.displayId),
      );
      return [...filteredGenerated, ...prev];
    });

    toast(
      `BOQ intake completed! Allocated ${generatedUcids.length} UCID tracking slots successfully.`,
      "success",
      "Proceed to BOM Ingestion",
      () => {
        setMode("bom");
      }
    );

    setMode("bom");
    setSelectedUcidId(generatedUcids[0].id);
  };

  // ==========================================
  // SECTION B: TECHNICAL BOM WORKSPACE STATES
  // ==========================================
  const [selectedUcidId, setSelectedUcidId] = useLocalStorageState<string>(
    "ingestion_bom_ucid",
    ucids[0]?.id || "u1",
  );
  const [activeBOMFile, setActiveBOMFile] = useLocalStorageState<string>(
    "ingestion_bom_file",
    "",
  );
  const [isBOMIngesting, setIsBOMIngesting] = useState(false);
  const [bomProgress, setBomProgress] = useState(0);
  const [bomVerifyResult, setBomVerifyResult] = useLocalStorageState<ConstraintCheckResponse | null>(
    "ingestion_bom_verify",
    null,
  );
  const [bomReconResult, setBomReconResult] = useLocalStorageState<ReconciliationResponse | null>(
    "ingestion_bom_recon",
    null,
  );
  const [bomError, setBomError] = useState<string>("");

  const targetUcid = ucids.find((u) => u.id === selectedUcidId) || ucids[0];

  useEffect(() => {
    if (isBOQIngesting) {
      setApiProgress(boqProgress);
    } else if (isBOMIngesting) {
      setApiProgress(bomProgress);
    } else {
      setApiProgress(0);
    }
  }, [
    isBOQIngesting,
    isBOMIngesting,
    boqProgress,
    bomProgress,
    setApiProgress,
  ]);

  const triggerBOMParse = async (fileName: string) => {
    if (!targetUcid) {
      setBomError(
        "Please select or create an active UCID tracking container first!",
      );
      return;
    }

    setIsPendingAPI(true);
    setPendingAPIMessage(
      `Ingesting & validating technical BOM document: "${fileName}"...`,
    );
    setIsBOMIngesting(true);
    setBomProgress(20);
    setBomError("");
    setActiveBOMFile(fileName);
    setBomVerifyResult(null);
    setBomReconResult(null);

    try {
      const configItems =
        targetUcid.solutions[0]?.vendorSubmissions?.[0]?.configs?.flatMap(
          (c) => c.items,
        ) || [];
      const chassisSKU =
        configItems.find((i) => i.type === "Chassis")?.partNumber ||
        "P40411-B21";
      const cpuSKU =
        configItems.find((i) => i.type === "Processor")?.partNumber ||
        "815100-B21";
      const ramQuantity =
        configItems.find((i) => i.type === "Memory")?.quantity || 5;

      const constraintsRes = await apiClient.post("/api/taxonomy/check-constraints", {
        chassisSKU,
        cpuSKU,
        ramQuantity,
        psuWattsCount: 750,
      });

      if (!constraintsRes.success) throw constraintsRes;
      const constraintsData = constraintsRes.data as ConstraintCheckResponse;
      setBomVerifyResult(constraintsData);

      const reconRes = await apiClient.post("/api/reconciliation/compare", {
        solutions: targetUcid.solutions,
      });

      if (!reconRes.success) throw reconRes;
      const reconData = reconRes.data as ReconciliationResponse;

      setBomProgress(100);
      setBomReconResult(reconData);

      setUcids((prev) =>
        prev.map((u) => {
          if (u.id === selectedUcidId) {
            const updatedSolutions = u.solutions.map((sol) => {
              const matchedMatrix = reconData.matrix?.find?.(
                (m: Record<string, unknown>) => m.solutionId === sol.id,
              );
              return {
                ...sol,
                vendorSubmissions:
                  sol.vendorSubmissions?.map((vs) => ({
                    ...vs,
                    complianceScore: matchedMatrix
                      ? matchedMatrix.deliveryConfidenceRating
                      : vs.complianceScore,
                  })) || [],
              };
            });

            const newEvent = {
              ts: new Date().toLocaleTimeString(),
              level: constraintsData.isCompliant
                ? ("ok" as const)
                : ("warn" as const),
              msg: `BOM Sheet "${fileName}" verified centrally. Compliance Rating matched: ${updatedSolutions[0]?.vendorSubmissions?.[0]?.complianceScore ?? "98"}%`,
            };

            return {
              ...u,
              currentStep: "post-intelligence",
              completedSteps: Array.from(
                new Set([
                  ...u.completedSteps,
                  "solution-design",
                  "vendor-provisioning",
                  "post-intelligence",
                ]),
              ),
              solutions: updatedSolutions,
              events: [newEvent, ...u.events],
            };
          }
          return u;
        }),
      );

      toast(
        "Automated intelligence mapping initialized.",
        "success",
        "View Results",
        () => setMode("portfolio")
      );
      advanceStep();
      setIsBOMIngesting(false);
      setIsPendingAPI(false);
    } catch (err: unknown) {
      const errorObj = err as { message?: string; error?: { message?: string } };
      toast(errorObj.error?.message || errorObj.message || "Backend Verification Failed.", "error");
      setIsBOMIngesting(false);
      setIsPendingAPI(false);
    }
  };

  const triggerBatchReconciliation = async () => {
    if (selectedBomsForBatch.length === 0) {
      toast(
        "Please select at least one uploaded BOM configuration to reconcile.",
        "warn"
      );
      return;
    }

    try {
      setIsPendingAPI(true);
      setPendingAPIMessage(
        "Initiating Enterprise Multi-UCID Comparison Sweep...",
      );

      await apiClient.post("/api/reconciliation/compare", {
        solutions: selectedBomsForBatch
      });

      setUcids((prev) => {
        return prev.map((u) => {
          if (!selectedBomsForBatch.includes(u.id)) {
            return u;
          }

          const updatedSolutions = u.solutions.map((sol) => {
            const repairedSubmissions =
              sol.vendorSubmissions?.map((vs) => {
                const repairedConfigs =
                  vs.configs?.map((c) => {
                    const repairedItems =
                      c.items?.map((it) => {
                        if (it.partNumber === "815100-B21") {
                          return {
                            ...it,
                            partNumber: "P40424-B21",
                            name: "Intel Xeon Gold 6430 32-Core 2.1GHz Processor (Gen11) [RECONCILED]",
                            unitPrice: 2150,
                          };
                        }
                        if (
                          it.partNumber === "400-BPSB" &&
                          it.unitPrice > 1190
                        ) {
                          return {
                            ...it,
                            unitPrice: 1190,
                            name: "Dell 3.84TB SAS Read Intensive SSD [RECONCILED]",
                          };
                        }
                        if (
                          vs.vendor === "Cisco" &&
                          it.type === "Memory" &&
                          it.quantity % 8 !== 0
                        ) {
                          return {
                            ...it,
                            quantity: 8,
                            name: "UCS 64GB DDR5 memory module RDIMM [RECONCILED]",
                          };
                        }
                        return it;
                      }) || [];
                    const newConfigSum = repairedItems.reduce(
                      (acc, curr) => acc + curr.unitPrice * curr.quantity,
                      0,
                    );
                    return {
                      ...c,
                      items: repairedItems,
                      totalPrice: newConfigSum,
                      savings: Math.max(0, c.originalPrice - newConfigSum),
                    };
                  }) || [];
                const newVsSum = repairedConfigs.reduce(
                  (acc, c) => acc + c.totalPrice,
                  0,
                );
                return {
                  ...vs,
                  configs: repairedConfigs,
                  totalPrice: newVsSum,
                  savings: Math.max(0, vs.originalPrice - newVsSum),
                  complianceScore: 100,
                };
              }) || [];

            return {
              ...sol,
              vendorSubmissions: repairedSubmissions,
            };
          });

          return {
            ...u,
            syncStatus: "Synced" as const,
            currentStep: "comparison" as const,
            completedSteps: Array.from(
              new Set([
                ...u.completedSteps,
                "boq-intake",
                "pre-intelligence",
                "solution-design",
                "vendor-provisioning",
                "post-intelligence",
                "comparison",
              ]),
            ),
            solutions: updatedSolutions,
            events: [
              {
                ts: new Date().toLocaleTimeString(),
                level: "ok" as const,
                msg: "✓ Global Batch Reconciliation Sweep executed successfully. Hardware constraints satisfied, discrepancies zeroed, and records synchronized.",
              },
              ...u.events,
            ],
          };
        });
      });

      toast(
        `Multi-UCID Batch Reconciliation sweep completed! ${selectedBomsForBatch.length} configurations synchronized.`,
        "success",
        "Proceed to Hybrid Automation",
        () => advanceStep()
      );
    } finally {
      setIsPendingAPI(false);
    }
  };  return (
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
              {auditLogs.length > 0 && currentStepIndex > 0 && (
                <div className="hidden lg:flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg shrink-0 text-left">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <div className="text-right">
                    <p className="text-[9px] text-gray-400 font-mono uppercase">
                      Last Active Checkpoint
                    </p>
                    <p className="text-[10px] font-bold text-white capitalize">
                      {currentStepId}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => resetWorkflow()}
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
                  const isActive = currentStepId === step.id;
                  const isPast =
                    ["boq", "bom", "portfolio", "launch"].indexOf(currentStepId) >
                    idx;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => jumpToStep(step.id)}
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

      {mode === "boq" && (
        <>
          <BoqIngestWorkbook
            selectedPreset={selectedPreset}
            setSelectedPreset={setSelectedPreset}
            boqFile={boqFile}
            isBOQIngesting={isBOQIngesting}
            boqProgress={boqProgress}
            boqResponse={boqResponse}
            boqError={boqError}
            onTriggerBOQParse={triggerBOQParse}
            onSplitAndProvision={handleSplitAndProvision}
          />
          {boqJobId && (
            <JobStreamer
              jobId={boqJobId}
              context={{ ucid: "mock-ucid", config_id: "mock-cfg", solution_id: selectedPreset }}
              onSuccess={onJobSuccess}
              onError={onJobError}
            />
          )}
        </>
      )}

      {mode === "bom" && (
        <TechnicalBomWorkspace
          ucids={ucids}
          selectedUcidId={selectedUcidId}
          setSelectedUcidId={setSelectedUcidId}
          bomVerifyResult={bomVerifyResult}
          setBomVerifyResult={setBomVerifyResult}
          bomReconResult={bomReconResult}
          setBomReconResult={setBomReconResult}
          activeBOMFile={activeBOMFile}
          setActiveBOMFile={setActiveBOMFile}
          isBOMIngesting={isBOMIngesting}
          setIsBOMIngesting={setIsBOMIngesting}
          bomProgress={bomProgress}
          setBomProgress={setBomProgress}
          selectedBomsForBatch={selectedBomsForBatch}
          setSelectedBomsForBatch={setSelectedBomsForBatch}
          bomError={bomError}
          onTriggerBOMParse={triggerBOMParse}
          onTriggerBatchReconciliation={triggerBatchReconciliation}
          onSelectMission={onSelectMission}
        />
      )}

      {mode === "portfolio" && (
        <HybridPortfolioOrchestration
          isPortfolioActive={isPortfolioActive}
          hpeSyncedConfigs={hpeSyncedConfigs}
          ciscoSyncedConfigs={ciscoSyncedConfigs}
          manualBOMStatus={manualBOMStatus}
          manualUploadedFiles={manualUploadedFiles}
          onStartPortfolioPipeline={handleStartPortfolioPipeline}
          onSimulateManualUpload={simulateManualUpload}
          onAdvanceStep={advanceStep}
          activeUCID={targetUcid}
        />
      )}

      {mode === "launch" && <LaunchStep onNavigate={onNavigate} />}
      </motion.div>
    </ErrorBoundary>
  );
}
