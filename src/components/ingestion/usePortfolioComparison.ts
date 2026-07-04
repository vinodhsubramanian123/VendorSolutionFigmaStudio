import { useState } from "react";
import { apiClient } from "../../services/apiClient";
import type { UCID } from "../../types";

export function usePortfolioComparison(
  ucids: UCID[],
  setIsPendingAPI: (pending: boolean) => void,
  setPendingAPIMessage: (msg: string) => void,
  toast: (msg: string, variant: "success" | "error" | "warn", actionText?: string, actionFn?: () => void) => void,
  advanceStep: () => void
) {
  const [isPortfolioActive, setIsPortfolioActive] = useState(false);
  const [hpeSyncedConfigs, setHpeSyncedConfigs] = useState<number>(0);
  const [ciscoSyncedConfigs, setCiscoSyncedConfigs] = useState<number>(0);
  const [manualBOMStatus, setManualBOMStatus] = useState<"pending" | "partial" | "complete">("pending");
  const [manualUploadedFiles, setManualUploadedFiles] = useState<string[]>([]);

  const handleStartPortfolioPipeline = async () => {
    if (isPortfolioActive) return;
    if (ucids.length === 0) {
      // Reachable: the "3. Hybrid Automation" stepper tab can be clicked
      // directly without ever completing BOQ intake first. The previous
      // fallback here (`[{ id: ucids[0]?.id, ... }]`) evaluates ucids[0] on
      // an empty array, producing `id: undefined` -- which fails
      // PortfolioOrchestrateRequestSchema's ucids[].id: z.string() on the
      // real server. MSW's handler for this route doesn't validate the
      // body, so this only ever surfaced as a silent no-op in dev. Guard
      // the same way triggerBatchReconciliation guards its empty-selection
      // case, rather than send a payload that can't validate.
      toast("Please provision at least one UCID configuration before starting the portfolio pipeline.", "warn");
      return;
    }
    try {
      setIsPendingAPI(true);
      setIsPortfolioActive(true);
      setHpeSyncedConfigs(0);
      setCiscoSyncedConfigs(0);
      setManualBOMStatus("pending");
      setManualUploadedFiles([]);

      const response = await apiClient.post("/api/portfolio/orchestrate", {
        portfolioId: "PORT-2026-HQ-EXPANSION",
        ucids: ucids.map(u => ({ id: u.id, channel: "automated", vendor: "Mixed" })),
      });

      if (response.success) {
        setHpeSyncedConfigs(4);
        setCiscoSyncedConfigs(4);
      }
    } catch (e: unknown) {
      const errorObj = e as { error?: { message?: string }; message?: string };
      toast(errorObj.error?.message || errorObj.message || "Failed to start orchestration", "error");
    } finally {
      setIsPendingAPI(false);
    }
  };

  const simulateManualUpload = async (configsCount: number) => {
    try {
      setIsPendingAPI(true);
      setPendingAPIMessage(`Intaking unstructured manual quoting attachment...`);
      const filename = configsCount === 2 ? "DELL_PREMIER_PORTAL_PARTIAL_BOM.xlsx" : "DELL_PREMIER_COMPLETED_BOM.xlsx";
      
      const response = await apiClient.post("/api/portfolio/upload-manual", {
        portfolioId: "PORT-2026-HQ-EXPANSION",
        ucidRef: ucids[0]?.id,
        filename,
        configsMatchedCount: configsCount,
      });

      if (response.success) {
        const data = response.data as { reconciliationStatus: "pending" | "partial" | "complete" };
        setManualBOMStatus(data.reconciliationStatus);
        setManualUploadedFiles((prev) => [...prev, filename]);
        
        if (data.reconciliationStatus === "complete") {
          toast(
            "Hybrid Portfolio Automation completed successfully.",
            "success",
            "Proceed to Launch",
            () => advanceStep()
          );
        }
      }
    } catch (e: unknown) {
      const errorObj = e as { error?: { message?: string }; message?: string };
      toast(errorObj.error?.message || errorObj.message || "Manual upload failed", "error");
    } finally {
      setIsPendingAPI(false);
    }
  };

  return {
    isPortfolioActive,
    hpeSyncedConfigs,
    ciscoSyncedConfigs,
    manualBOMStatus,
    manualUploadedFiles,
    handleStartPortfolioPipeline,
    simulateManualUpload,
  };
}
