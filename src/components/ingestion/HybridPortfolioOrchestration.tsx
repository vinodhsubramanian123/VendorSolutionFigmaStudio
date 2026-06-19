import React from "react";
import { UCID } from "../../types";
import { PortfolioMetricsHeader } from "./PortfolioMetricsHeader";
import { ConsolidatedStatusBoard } from "./ConsolidatedStatusBoard";
import { DellWorkspaceNode } from "./DellWorkspaceNode";
import { HpeWorkspaceNode } from "./HpeWorkspaceNode";
import { CiscoWorkspaceNode } from "./CiscoWorkspaceNode";

interface HybridPortfolioOrchestrationProps {
  isPortfolioActive: boolean;
  hpeSyncedConfigs: number;
  ciscoSyncedConfigs: number;
  manualBOMStatus: "pending" | "partial" | "complete";
  manualUploadedFiles: string[];
  onStartPortfolioPipeline: () => void;
  onSimulateManualUpload: (configsCount: number) => void;
  onAdvanceStep: () => void;
  activeUCID?: UCID;
  ucids: UCID[];
}

export function HybridPortfolioOrchestration({
  isPortfolioActive,
  hpeSyncedConfigs,
  ciscoSyncedConfigs,
  manualBOMStatus,
  manualUploadedFiles,
  onStartPortfolioPipeline,
  onSimulateManualUpload,
  onAdvanceStep,
  activeUCID,
  ucids,
}: HybridPortfolioOrchestrationProps) {
  const projectRefString = activeUCID?.projectRef || "OPPORTUNITY-2026-HQ-EXPANSION";

  const dellUcid = ucids.find((u) => u.name.includes("Dell"))?.id;
  const hpeUcid = ucids.find((u) => u.name.includes("HPE"))?.id;
  const ciscoUcid = ucids.find((u) => u.name.includes("Cisco"))?.id;

  return (
    <div className="space-y-6 animate-fadeIn text-left select-none">
      <PortfolioMetricsHeader
        projectRefString={projectRefString}
        isPortfolioActive={isPortfolioActive}
        onStartPortfolioPipeline={onStartPortfolioPipeline}
      />

      {/* Three UCIDs Umbrella Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        <DellWorkspaceNode
          manualBOMStatus={manualBOMStatus}
          isPortfolioActive={isPortfolioActive}
          onSimulateManualUpload={onSimulateManualUpload}
          manualUploadedFiles={manualUploadedFiles}
          ucidId={dellUcid}
        />
        <HpeWorkspaceNode hpeSyncedConfigs={hpeSyncedConfigs} ucidId={hpeUcid} />
        <CiscoWorkspaceNode ciscoSyncedConfigs={ciscoSyncedConfigs} ucidId={ciscoUcid} />
      </div>

      {/* Consolidated status board info table */}
      <ConsolidatedStatusBoard
        manualBOMStatus={manualBOMStatus}
        hpeSyncedConfigs={hpeSyncedConfigs}
        ciscoSyncedConfigs={ciscoSyncedConfigs}
        projectRefString={projectRefString}
        isPortfolioActive={isPortfolioActive}
        ucids={ucids}
      />
    </div>
  );
}
