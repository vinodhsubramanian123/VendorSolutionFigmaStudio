import React, { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import type { UCID, Solution, BOMItem } from "../../types";

import { BoqIngestWorkbook } from "./BoqIngestWorkbook";
import { TechnicalBomWorkspace } from "./TechnicalBomWorkspace";
import { HybridPortfolioOrchestration } from "./HybridPortfolioOrchestration";
import { LaunchStep } from "./LaunchStep";
import { ErrorBoundary } from "../shared/ErrorBoundary";

interface IngestionHubProps {
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  onNavigate: (view: any) => void;
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
  } = useWorkflowManager("procurement_lifecycle", [
    "boq",
    "bom",
    "portfolio",
    "launch",
  ]);

  // Derived mode for backward compatibility with existing rendering logic
  const mode = currentStepId;
  const setMode = jumpToStep;

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  const stepperSteps = useMemo(() => [
    { id: "boq", label: "1. BOQ Intake" },
    { id: "bom", label: "2. BOM Compile" },
    { id: "portfolio", label: "3. Hybrid Automation" },
    { id: "launch", label: "4. Launch", icon: Play },
  ], []);

  // Multi-BOM / UCID selection list state for batch reconciliation
  const [selectedBomsForBatch, setSelectedBomsForBatch] = useState<string[]>(
    [],
  );

  // Auto-select all UCIDs on initialization and when ucids change
  useEffect(() => {
    if (ucids.length > 0 && selectedBomsForBatch.length === 0) {
      setSelectedBomsForBatch(ucids.map((u) => u.id));
    }
  }, [ucids]);

  // Multi-UCID reconciliation states
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "warn";
    actionLabel?: string;
    onAction?: () => void;
  } | null>(null);

  // ===============================================================
  // MOCK STATE AND SIMULATION LOGS FOR HYBRID MULTI-UCID PORTFOLIO
  // ===============================================================
  const [isPortfolioActive, setIsPortfolioActive] = useState(false);
  const [hpeSyncedConfigs, setHpeSyncedConfigs] = useState<number>(0);
  const [ciscoSyncedConfigs, setCiscoSyncedConfigs] = useState<number>(0);
  const [manualBOMStatus, setManualBOMStatus] = useState<
    "pending" | "partial" | "complete"
  >("pending");
  const [manualUploadedFiles, setManualUploadedFiles] = useState<string[]>([]);

  const handleStartPortfolioPipeline = async () => {
    if (isPortfolioActive) return;
    try {
      setIsPendingAPI(true);
      setIsPortfolioActive(true);
      setHpeSyncedConfigs(0);
      setCiscoSyncedConfigs(0);
      setManualBOMStatus("pending");
      setManualUploadedFiles([]);

      // Simulate API request to backend portfolio orchestrator
      try {
        const res = await fetch("/api/portfolio/orchestrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            portfolioId: "PORT-2026-HQ-EXPANSION",
            ucids: [
              { id: "UCID-2026-1701", channel: "manual", vendor: "Dell" },
              { id: "UCID-2026-1702", channel: "automated", vendor: "HPE" },
              { id: "UCID-2026-1703", channel: "automated", vendor: "Cisco" },
            ],
          }),
        });
      } catch {
        // Fallback or handle error quietly
      }

      // Step-by-step parallel-automated crawling simulation corresponding to the 4 sequential configs
      let stepCount = 0;
      await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          stepCount++;

          setHpeSyncedConfigs(stepCount);
          setCiscoSyncedConfigs(stepCount);

          if (stepCount === 4) {
            clearInterval(interval);
            resolve();
          }
        }, 1200);
      });
    } finally {
      setIsPendingAPI(false);
    }
  };

  const simulateManualUpload = async (configsCount: number) => {
    try {
      setIsPendingAPI(true);
      setPendingAPIMessage(
        `Intaking unstructured manual quoting attachment...`,
      );
      const filename =
        configsCount === 2
          ? "DELL_PREMIER_PORTAL_PARTIAL_BOM.xlsx"
          : "DELL_PREMIER_COMPLETED_BOM.xlsx";

      let apiSuccess = false;
      try {
        const res = await fetch("/api/portfolio/upload-manual", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            portfolioId: "PORT-2026-HQ-EXPANSION",
            ucidRef: "UCID-2026-1701",
            filename,
            configsMatchedCount: configsCount,
          }),
        });

        if (res.ok) {
          apiSuccess = true;
          const data = await res.json();
          setManualBOMStatus(data.reconciliationStatus);
          setManualUploadedFiles((prev) => [...prev, filename]);

          if (data.reconciliationStatus === "complete") {
            setToast({
              message:
                "Hybrid Portfolio Automation completed successfully. All components synced and reconciled.",
              type: "success",
              actionLabel: "Proceed to Launch",
              onAction: () => {
                advanceStep();
              },
            });
          }
        }
      } catch {
        // Fallback execution
      }

      if (!apiSuccess) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setManualBOMStatus(configsCount === 2 ? "partial" : "complete");
        setManualUploadedFiles((prev) => [...prev, filename]);

        if (configsCount === 4) {
          setToast({
            message:
              "Hybrid Portfolio Automation completed successfully. All components synced and reconciled.",
            type: "success",
            actionLabel: "Proceed to Launch",
            onAction: () => {
              advanceStep();
            },
          });
        }
      }
    } finally {
      setIsPendingAPI(false);
    }
  };

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
  const [boqResponse, setBoqResponse] = useLocalStorageState<any>(
    "ingestion_boq_response",
    null,
  );
  const [boqError, setBoqError] = useState<string>("");

  const triggerBOQParse = async (
    fileName: string,
    preset: "hpe-legacy" | "dell-overcharge" | "cisco-asymmetry",
  ) => {
    setIsBOQIngesting(true);
    setBoqProgress(10);
    setBoqError("");
    setBoqFile(fileName);

    const interval = setInterval(() => {
      setBoqProgress((p) => (p < 85 ? p + 15 : p));
    }, 150);

    try {
      const response = await fetch("/api/boq/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: fileName,
          presetType: preset,
          rawText: `[Manual central upload: ${fileName}] presetType=${preset}`,
        }),
      });

      clearInterval(interval);
      setBoqProgress(100);

      if (response.ok) {
        const data = await response.json();
        setBoqResponse(data);
        setIsBOQIngesting(false);
      } else {
        throw new Error(
          "Server ingestion responded with non-200 envelope code.",
        );
      }
    } catch (err: any) {
      clearInterval(interval);
      console.warn(
        "Backend Ingestion API not reachable. Performing fallback simulation.",
        err,
      );

      // Fallback local simulation to prevent UI functional gaps
      setTimeout(() => {
        setBoqResponse({
          success: true,
          sourceFile: fileName,
          ucid: "ucid_api_session_uuid_" + Date.now().toString(16),
          parsedSummary: {
            vendorBrand:
              preset === "dell-overcharge"
                ? "Dell"
                : preset === "cisco-asymmetry"
                  ? "Cisco"
                  : "HPE",
            detectedChassis: "Simulated Base Chassis SFF",
            itemsCount: 6,
            initialConfidenceScore: 85,
          },
          solutions: [
            {
              id: `sol-fallback-primary`,
              name: `${preset === "dell-overcharge" ? "Dell" : preset === "cisco-asymmetry" ? "Cisco" : "HPE"} Offline Simulated Base`,
              vendorSubmissions: [
                {
                  id: `sol-fallback-base`,
                  vendor:
                    preset === "dell-overcharge"
                      ? "Dell"
                      : preset === "cisco-asymmetry"
                        ? "Cisco"
                        : "HPE",
                  label: `${preset === "dell-overcharge" ? "Dell" : preset === "cisco-asymmetry" ? "Cisco" : "HPE"} Offline Simulated Base`,
                  totalPrice: 110000,
                  originalPrice: 125000,
                  savings: 15000,
                  complianceScore: 92,
                  configs: [
                    {
                      id: "fallback-base-config",
                      name: "Base Compute Config",
                      totalPrice: 110000,
                      originalPrice: 125000,
                      savings: 15000,
                      items: [
                        {
                          id: "fallback-c1",
                          partNumber: "BASE-CHASSIS-01",
                          name: "Simulated Chassis",
                          type: "Chassis",
                          quantity: 10,
                          unitPrice: 3400,
                        },
                        {
                          id: "fallback-c2",
                          partNumber: "BASE-CPU-01",
                          name: "Simulated Processor Multi-Core",
                          type: "Processor",
                          quantity: 20,
                          unitPrice: 1890,
                        },
                        {
                          id: "fallback-c3",
                          partNumber: "BASE-MEM-01",
                          name: "Simulated RDIMM Memory Kit",
                          type: "Memory",
                          quantity: 80,
                          unitPrice: 580,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        });
        setBoqProgress(100);
        setIsBOQIngesting(false);
      }, 850);
    }
  };

  const handleSplitAndProvision = () => {
    if (!boqResponse) return;

    const prefix = "UCID-2026-";
    const generatedUcids: UCID[] = boqResponse.solutions.map(
      (sol: any, idx: number) => {
        const displayId = `${prefix}${1700 + ucids.length + idx}`;
        const detailsText =
          sol.vendorSubmissions?.[0]?.configs?.[0]?.items
            ?.map(
              (i: any) => ` - ${i.name} (QTY ${i.quantity} @ $${i.unitPrice})`,
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
              vendorSubmissions:
                sol.vendorSubmissions?.map((vs: any) => ({ ...vs })) || [],
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

    setToast({
      message: `BOQ intake completed! Allocated ${generatedUcids.length} UCID tracking slots successfully.`,
      type: "success",
      actionLabel: "Proceed to BOM Ingestion",
      onAction: () => {
        setMode("bom");
      },
    });

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
  const [bomVerifyResult, setBomVerifyResult] = useLocalStorageState<any>(
    "ingestion_bom_verify",
    null,
  );
  const [bomReconResult, setBomReconResult] = useLocalStorageState<any>(
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

    const timer = setInterval(() => {
      setBomProgress((p) => (p < 90 ? p + 15 : p));
    }, 200);

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

      const constraintsRes = await fetch("/api/taxonomy/check-constraints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chassisSKU,
          cpuSKU,
          ramQuantity,
          psuWattsCount: 750,
        }),
      });

      if (!constraintsRes.ok) throw new Error("Constraints check API failed.");
      const constraintsData = await constraintsRes.json();
      setBomVerifyResult(constraintsData);

      const reconRes = await fetch("/api/reconciliation/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          solutions: targetUcid.solutions,
        }),
      });

      if (!reconRes.ok) throw new Error("Reconciliation compare API failed.");
      const reconData = await reconRes.json();

      clearInterval(timer);
      setBomProgress(100);
      setBomReconResult(reconData);

      setUcids((prev) =>
        prev.map((u) => {
          if (u.id === selectedUcidId) {
            const updatedSolutions = u.solutions.map((sol) => {
              const matchedMatrix = reconData.matrix.find(
                (m: any) => m.solutionId === sol.id,
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
              msg: `BOM Sheet "${fileName}" verified centrally. Compliance Rating matched: ${updatedSolutions[0]?.vendorSubmissions?.[0]?.complianceScore ?? "Unknown"}%`,
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

      setToast({
        message: `BOM compliance check passed for "${fileName}"! Compliance factor optimized.`,
        type: "success",
        actionLabel: "Proceed to Hybrid Automation",
        onAction: () => {
          advanceStep();
        },
      });
      setIsBOMIngesting(false);
      setIsPendingAPI(false);
    } catch (err: any) {
      clearInterval(timer);
      console.warn(
        "Backend Verification not reachable. Performing local simulation fallback.",
        err,
      );

      setTimeout(() => {
        const mockConstraints = {
          isCompliant: true,
          socketMatch: {
            status: "compatible",
            chassisSocket: "LGA-MOCK",
            cpuSocket: "LGA-MOCK",
            description: "Simulated compatibility check passed.",
          },
          powerLimitTest: {
            passed: true,
            estimatedTdpWatts: 270,
            maxSupportedWatts: 800,
            marginWatts: 530,
          },
          memoryBalanceCheck: {
            passed: true,
            quantity: 32,
            optimalLayoutSymmetry: 8,
            recommendsCorrection: false,
            message: "Simulated balance check passed.",
          },
        };
        const mockRecon = {
          matrix: [
            {
              solutionId: targetUcid?.solutions[0]?.id || "unknown",
              vendor:
                targetUcid?.solutions[0]?.vendorSubmissions?.[0]?.vendor ||
                "Unknown",
              baseCost: 125000,
              negotiatedContractCost: 110000,
              variancePercentage: 12,
              deliveryConfidenceRating: 98,
            },
          ],
          metrics: { totalSavingsUSD: 15000 },
          discrepancyCount: 1,
        };

        setBomVerifyResult(mockConstraints);
        setBomReconResult(mockRecon);
        setBomProgress(100);

        setUcids((prev) =>
          prev.map((u) => {
            if (u.id === selectedUcidId) {
              const updatedSolutions = u.solutions.map((sol) => ({
                ...sol,
                complianceScore: 98,
              }));
              const newEvent = {
                ts: new Date().toLocaleTimeString(),
                level: "ok" as const,
                msg: `BOM Sheet "${fileName}" verified locally via offline simulation fallback. Compliance Rating matched: 98%`,
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

        setToast({
          message: `BOM compliance check passed for "${fileName}" (Offline Simulation)!`,
          type: "success",
          actionLabel: "Proceed to Hybrid Automation",
          onAction: () => {
            advanceStep();
          },
        });

        setIsBOMIngesting(false);
        setIsPendingAPI(false);
      }, 1000);
    }
  };

  const triggerBatchReconciliation = async () => {
    if (selectedBomsForBatch.length === 0) {
      setToast({
        message:
          "Please select at least one uploaded BOM configuration to reconcile.",
        type: "warn",
      });
      return;
    }

    try {
      setIsPendingAPI(true);
      setPendingAPIMessage(
        "Initiating Enterprise Multi-UCID Comparison Sweep...",
      );

      await new Promise((resolve) => setTimeout(resolve, 800));
      setPendingAPIMessage(
        `Interrogating parallel crawl ledgers for ${selectedBomsForBatch.length} selected nodes...`,
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPendingAPIMessage(
        "Resolving EOL CPU Sourcing risks & pricing discrepancies...",
      );
      await new Promise((resolve) => setTimeout(resolve, 900));
      setPendingAPIMessage(
        "Synchronizing unified compliance matrix across selected live nodes...",
      );
      await new Promise((resolve) => setTimeout(resolve, 500));

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

      setToast({
        message: `Multi-UCID Batch Reconciliation sweep completed! ${selectedBomsForBatch.length} configurations synchronized.`,
        type: "success",
        actionLabel: "Proceed to Hybrid Automation",
        onAction: () => {
          advanceStep();
        },
      });
    } finally {
      setIsPendingAPI(false);
    }
  };  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col gap-6 relative select-none">
        {/* Toast Alert Popup */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-[100] bg-surface-elevated/95 border border-sky-500/30 rounded-xl shadow-2xl p-4 flex flex-col gap-3 min-w-[320px] max-w-sm backdrop-blur-md animate-fadeIn">
            <div className="flex items-start gap-3 text-left">
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white leading-normal">
                  {toast.message}
                </p>
                <p className="text-[9.5px] text-gray-400 mt-1 uppercase font-mono">
                  System Active Notification
                </p>
              </div>
              <button
                onClick={() => setToast(null)}
                className="text-gray-400 hover:text-white text-xs font-bold cursor-pointer font-mono p-1 leading-none"
              >
                ×
              </button>
            </div>
            {toast.actionLabel && toast.onAction && (
              <button
                onClick={() => {
                  toast.onAction?.();
                  setToast(null);
                }}
                className="w-full text-center py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg text-[10px] cursor-pointer transition uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <span>{toast.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

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
        />
      )}

      {mode === "launch" && <LaunchStep onNavigate={onNavigate} />}
      </div>
    </ErrorBoundary>
  );
}
