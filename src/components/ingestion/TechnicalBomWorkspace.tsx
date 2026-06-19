import React from "react";
import type { UCID, ConstraintCheckResponse, ReconciliationResponse } from "../../types";
import { SweepCoordinatorBoard } from "./SweepCoordinatorBoard";
import { TargetWorkspacePanel } from "./TargetWorkspacePanel";
import { BomReconciliationPanel } from "./BomReconciliationPanel";

interface TechnicalBomWorkspaceProps {
  ucids: UCID[];
  selectedUcidId: string;
  setSelectedUcidId: (id: string) => void;
  bomVerifyResult: ConstraintCheckResponse | null;
  setBomVerifyResult: (res: ConstraintCheckResponse | null) => void;
  bomReconResult: ReconciliationResponse | null;
  setBomReconResult: (res: ReconciliationResponse | null) => void;
  activeBOMFile: string;
  setActiveBOMFile: (file: string) => void;
  isBOMIngesting: boolean;
  setIsBOMIngesting: (ingesting: boolean) => void;
  bomProgress: number;
  setBomProgress: (progress: number) => void;
  selectedBomsForBatch: string[];
  setSelectedBomsForBatch: React.Dispatch<React.SetStateAction<string[]>>;
  bomError: string;
  onTriggerBOMParse: (fileName: string) => void;
  onTriggerBatchReconciliation: () => void;
  onSelectMission: (id: string) => void;
}

export function TechnicalBomWorkspace({
  ucids,
  selectedUcidId,
  setSelectedUcidId,
  bomVerifyResult,
  setBomVerifyResult,
  bomReconResult,
  setBomReconResult,
  activeBOMFile,
  setActiveBOMFile,
  isBOMIngesting,
  setIsBOMIngesting,
  bomProgress,
  setBomProgress,
  selectedBomsForBatch,
  setSelectedBomsForBatch,
  bomError,
  onTriggerBOMParse,
  onTriggerBatchReconciliation,
  onSelectMission,
}: TechnicalBomWorkspaceProps) {
  const targetUcid = ucids.find((u) => u.id === selectedUcidId) || ucids[0];

  return (
    <div className="flex flex-col gap-6 w-full text-left">
      <SweepCoordinatorBoard
        ucids={ucids}
        selectedBomsForBatch={selectedBomsForBatch}
        setSelectedBomsForBatch={setSelectedBomsForBatch}
        onTriggerBatchReconciliation={onTriggerBatchReconciliation}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <TargetWorkspacePanel
          ucids={ucids}
          selectedUcidId={selectedUcidId}
          setSelectedUcidId={setSelectedUcidId}
          setBomVerifyResult={setBomVerifyResult}
          setBomReconResult={setBomReconResult}
          setActiveBOMFile={setActiveBOMFile}
          targetUcid={targetUcid}
        />

        <BomReconciliationPanel
          targetUcid={targetUcid}
          bomVerifyResult={bomVerifyResult}
          bomReconResult={bomReconResult}
          activeBOMFile={activeBOMFile}
          isBOMIngesting={isBOMIngesting}
          bomProgress={bomProgress}
          bomError={bomError}
          selectedUcidId={selectedUcidId}
          onTriggerBOMParse={onTriggerBOMParse}
          onSelectMission={onSelectMission}
        />
      </div>
    </div>
  );
}
