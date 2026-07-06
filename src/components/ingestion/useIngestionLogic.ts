import { useEffect, useState } from "react";
import { useWorkflowManager } from "../../hooks/useWorkflowManager";
import { useToast } from "../shared/ToastContext";
import { IngestionMode } from "../../types/data";
import { useBoqIntake } from "./useBoqIntake";
import { useBomConversion } from "./useBomConversion";
import { usePortfolioComparison } from "./usePortfolioComparison";
import { useIngestionStore } from "../../store/ingestionStore";
import type { UCID } from "../../types";

export interface IngestionLogicProps {
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  setIsPendingAPI: (pending: boolean) => void;
  setPendingAPIMessage: (msg: string) => void;
  setApiProgress: (progress: number) => void;
}

export function useIngestionLogic({
  ucids,
  setUcids,
  setIsPendingAPI,
  setPendingAPIMessage,
  setApiProgress,
}: IngestionLogicProps) {
  const {
    currentStepId,
    advanceStep,
    jumpToStep,
    auditLogs,
    currentStepIndex,
    resetWorkflow,
  } = useWorkflowManager("procurement_lifecycle", [
    IngestionMode.BOQ,
    IngestionMode.BOM,
    IngestionMode.PORTFOLIO,
    IngestionMode.LAUNCH,
  ]);

  const { toast } = useToast();

  const mode = currentStepId;
  const setMode = jumpToStep;

  const selectedUcidId = useIngestionStore(s => s.selectedUcidId);
  const setSelectedUcidId = useIngestionStore(s => s.setSelectedUcidId);
  
  // Set default if empty initially, though the store initializes it to 'u1'
  useEffect(() => {
    if (!selectedUcidId && ucids[0]?.id) {
      setSelectedUcidId(ucids[0].id);
    }
  }, [ucids, selectedUcidId, setSelectedUcidId]);

  const boqIntake = useBoqIntake(setUcids, setMode, toast, setSelectedUcidId);
  
  const [selectedBomsForBatch, setSelectedBomsForBatch] = useState<string[]>([]);
  const [bomsHydrated, setBomsHydrated] = useState(false);

  if (ucids.length > 0 && !bomsHydrated) {
    setSelectedBomsForBatch(ucids.map((u) => u.id));
    setBomsHydrated(true);
  }

  const bomConversion = useBomConversion(
    ucids,
    setUcids,
    setMode,
    toast,
    advanceStep,
    setIsPendingAPI,
    setPendingAPIMessage,
    selectedUcidId,
    selectedBomsForBatch
  );

  const portfolioComparison = usePortfolioComparison(
    ucids,
    setIsPendingAPI,
    setPendingAPIMessage,
    toast,
    advanceStep
  );

  useEffect(() => {
    if (boqIntake.isBOQIngesting) {
      setApiProgress(boqIntake.boqProgress);
    } else if (bomConversion.isBOMIngesting) {
      setApiProgress(bomConversion.bomProgress);
    } else {
      setApiProgress(0);
    }
  }, [boqIntake.isBOQIngesting, bomConversion.isBOMIngesting, boqIntake.boqProgress, bomConversion.bomProgress, setApiProgress]);

  return {
    currentStepId,
    advanceStep,
    jumpToStep,
    auditLogs,
    currentStepIndex,
    resetWorkflow,
    mode,
    setMode,

    ...boqIntake,
    
    selectedUcidId,
    setSelectedUcidId,
    
    selectedBomsForBatch,
    setSelectedBomsForBatch,
    
    ...bomConversion,
    ...portfolioComparison,
  };
}
