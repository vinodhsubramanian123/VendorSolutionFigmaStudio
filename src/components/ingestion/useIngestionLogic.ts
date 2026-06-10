import { useState, useEffect } from "react";
import { useLocalStorageState } from "../../hooks/useLocalStorageState";
import { useWorkflowManager } from "../../hooks/useWorkflowManager";
import type { UCID } from "../../types";

export function useIngestionLogic(
  ucids: UCID[],
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>,
  setIsPendingAPI: (pending: boolean) => void,
  setPendingAPIMessage: (msg: string) => void,
  setApiProgress: (progress: number) => void
) {
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

  const [selectedBomsForBatch, setSelectedBomsForBatch] = useState<string[]>([]);
  useEffect(() => {
    if (ucids.length > 0 && selectedBomsForBatch.length === 0) {
      setSelectedBomsForBatch(ucids.map((u) => u.id));
    }
  }, [ucids, selectedBomsForBatch.length]);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "warn";
    actionLabel?: string;
    onAction?: () => void;
  } | null>(null);

  const [isPortfolioActive, setIsPortfolioActive] = useState(false);
  const [hpeSyncedConfigs, setHpeSyncedConfigs] = useState<number>(0);
  const [ciscoSyncedConfigs, setCiscoSyncedConfigs] = useState<number>(0);
  const [manualBOMStatus, setManualBOMStatus] = useState<"pending" | "partial" | "complete">("pending");
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

      try {
        await fetch("/api/portfolio/orchestrate", {
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
      } catch {}

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
      setPendingAPIMessage(`Intaking unstructured manual quoting attachment...`);
      const filename = configsCount === 2 ? "DELL_PREMIER_PORTAL_PARTIAL_BOM.xlsx" : "DELL_PREMIER_COMPLETED_BOM.xlsx";
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
              message: "Hybrid Portfolio Automation completed successfully.",
              type: "success",
              actionLabel: "Proceed to Launch",
              onAction: () => advanceStep(),
            });
          }
        }
      } catch {}

      if (!apiSuccess) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setManualBOMStatus(configsCount === 2 ? "partial" : "complete");
        setManualUploadedFiles((prev) => [...prev, filename]);
        if (configsCount === 4) {
          setToast({
            message: "Hybrid Portfolio Automation completed successfully.",
            type: "success",
            actionLabel: "Proceed to Launch",
            onAction: () => advanceStep(),
          });
        }
      }
    } finally {
      setIsPendingAPI(false);
    }
  };

  return {
    currentStepId,
    advanceStep,
    jumpToStep,
    auditLogs,
    currentStepIndex,
    resetWorkflow,
    selectedBomsForBatch,
    setSelectedBomsForBatch,
    toast,
    setToast,
    isPortfolioActive,
    hpeSyncedConfigs,
    ciscoSyncedConfigs,
    manualBOMStatus,
    manualUploadedFiles,
    handleStartPortfolioPipeline,
    simulateManualUpload
  };
}
