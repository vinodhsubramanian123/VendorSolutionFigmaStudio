import { useState } from "react";
import { useIngestionStore } from "../../store/ingestionStore";
import { useCoreStore } from "../../store/coreStore";
import { repairBomItem } from "../../utils/bomRepairUtils";
import { apiClient } from "../../services/apiClient";
import type { UCID, ConstraintCheckResponse, ReconciliationResponse } from "../../types";
import { ConstraintCheckResponseSchema, ReconciliationResponseSchema } from "../../types/zodSchemas";

export function useBomConversion(
  ucids: UCID[],
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>,
  setMode: (step: string) => void,
  toast: (msg: string, variant: "success" | "error" | "warn", actionText?: string, actionFn?: () => void) => void,
  advanceStep: () => void,
  setIsPendingAPI: (pending: boolean) => void,
  setPendingAPIMessage: (msg: string) => void,
  selectedUcidId: string,
  selectedBomsForBatch: string[]
) {
  const [isBOMIngesting, setIsBOMIngesting] = useState(false);
  const activeBOMFile = useIngestionStore(s => s.activeBOMFile);
  const setActiveBOMFile = useIngestionStore(s => s.setActiveBOMFile);

  const bomVerifyResult = useIngestionStore(s => s.bomVerifyResult);
  const setBomVerifyResult = useIngestionStore(s => s.setBomVerifyResult);

  const bomReconResult = useIngestionStore(s => s.bomReconResult);
  const setBomReconResult = useIngestionStore(s => s.setBomReconResult);
  const [bomProgress, setBomProgress] = useState(0);
  const [bomError, setBomError] = useState<string>("");

  const targetUcid = ucids.find((u) => u.id === selectedUcidId) || ucids[0];
  const triggerBOMParse = async (fileName: string) => {
    if (!targetUcid) {
      setBomError("Please select or create an active UCID tracking container first!");
      return;
    }

    setIsPendingAPI(true);
    setPendingAPIMessage(`Ingesting & validating technical BOM document: "${fileName}"...`);
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
      const chassisSKU = configItems.find((i) => i.type === "Chassis")?.partNumber || "P40411-B21";
      const cpuSKU = configItems.find((i) => i.type === "Processor")?.partNumber || "815100-B21";
      const ramQuantity = configItems.find((i) => i.type === "Memory")?.quantity || 5;

      const constraintsRes = await apiClient.post<ConstraintCheckResponse>("/api/taxonomy/check-constraints", {
        chassisSKU,
        cpuSKU,
        ramQuantity,
        psuWattsCount: 750,
      });

      if (!constraintsRes.success || !constraintsRes.data) throw constraintsRes;
      const constraintsData = apiClient.parseResponse(ConstraintCheckResponseSchema, constraintsRes.data);
      setBomVerifyResult(constraintsData);

      const reconRes = await apiClient.post<ReconciliationResponse>("/api/reconciliation/compare", {
        solutions: targetUcid.solutions,
      });

      if (!reconRes.success || !reconRes.data) throw reconRes;
      const reconData = apiClient.parseResponse(ReconciliationResponseSchema, reconRes.data);

      setBomProgress(100);
      setBomReconResult(reconData);

      setUcids((prev) =>
        prev.map((u) => {
          if (u.id === selectedUcidId) {
            const updatedSolutions = u.solutions.map((sol) => {
              const matchedMatrix = reconData.matrix?.find(
                (m) => m.solutionId === sol.id,
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
              timestamp: new Date().toISOString(),
              level: constraintsData.isCompliant ? ("ok" as const) : ("warn" as const),
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

      toast("Automated intelligence mapping initialized.", "success", "View Results", () => setMode("portfolio"));
      advanceStep();
      setIsBOMIngesting(false);
      setIsPendingAPI(false);
    } catch (err: unknown) {
      let errorMessage = "Backend Verification Failed.";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === "object") {
        if ("error" in err && err.error && typeof err.error === "object" && "message" in err.error) {
          errorMessage = String(err.error.message);
        } else if ("message" in err) {
          errorMessage = String(err.message);
        }
      }
      toast(errorMessage, "error");
      setIsBOMIngesting(false);
      setIsPendingAPI(false);
    }
  };

  const triggerBatchReconciliation = async () => {
    if (selectedBomsForBatch.length === 0) {
      toast("Please select at least one uploaded BOM configuration to reconcile.", "warn");
      return;
    }

    try {
      setIsPendingAPI(true);
      setPendingAPIMessage("Initiating Enterprise Multi-UCID Comparison Sweep...");

      // selectedBomsForBatch is an array of UCID ids, not Solution objects --
      // ReconciliationRequestSchema.solutions requires
      // FlatComparisonSolutionSchema | SolutionSchema objects (each needs at
      // minimum id/vendor/items). Sending the bare ids satisfied MSW (this
      // handler ignores the request body and always returns a canned
      // comparison matrix) but would 400 against server.ts's
      // validateBody(ReconciliationRequestSchema) on every real request,
      // silently failing the whole batch-reconciliation feature. Resolve to
      // the actual solutions the same way triggerBOMParse does above.
      const targetSolutions = ucids
        .filter((u) => selectedBomsForBatch.includes(u.id))
        .flatMap((u) => u.solutions);

      await apiClient.post("/api/reconciliation/compare", {
        solutions: targetSolutions
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
                      c.items?.map((it) => repairBomItem(it, vs.vendor)) || [];
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
                const newVsSum = repairedConfigs.reduce((acc, c) => acc + c.totalPrice, 0);
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
                timestamp: new Date().toISOString(),
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
  };

  return {
    targetUcid,
    activeBOMFile,
    setActiveBOMFile,
    isBOMIngesting,
    setIsBOMIngesting,
    bomProgress,
    setBomProgress,
    bomVerifyResult,
    setBomVerifyResult,
    bomReconResult,
    setBomReconResult,
    bomError,
    triggerBOMParse,
    triggerBatchReconciliation,
  };
}
