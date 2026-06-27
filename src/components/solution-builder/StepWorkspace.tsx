import React from "react";
import type { UCID } from "../../types";
import type { ConfigItem, UcidContainer } from "../../types/data";
import { checkHardwareConstraints } from "../../utils/taxonomyConstraints";

import { WorkspaceHeader } from "./WorkspaceHeader";
import { ConfigLibrarySelector } from "./ConfigLibrarySelector";
import { UcidContainerList } from "./UcidContainerList";

interface StepWorkspaceProps {
  solutionName: string;
  setSolutionName: (name: string) => void;
  isMultiUcid: boolean;
  toggleMultiUcidMode: (enabled: boolean) => void;
  handleAddUcid: () => void;
  configs: ConfigItem[];
  selectedConfigId: string;
  setSelectedConfigId: (id: string) => void;
  ucidsList: UcidContainer[];
  assignConfigToUcid: (configId: string, ucidId: string) => void;
  updateContainerName: (id: string, name: string) => void;
  updateContainerReasoning: (id: string, reasoning: string) => void;
  toggleContainerLock: (id: string) => void;
  updateContainerExecutionMode: (id: string, mode: 'automated' | 'manual' | 'hybrid') => void;
  handleContainerUpload: (id: string, fileName: string) => void;
  ucids: UCID[];
  handleDeployToMissionControl: () => void;
}

export function StepWorkspace({
  solutionName,
  setSolutionName,
  isMultiUcid,
  toggleMultiUcidMode,
  handleAddUcid,
  configs,
  selectedConfigId,
  setSelectedConfigId,
  ucidsList,
  assignConfigToUcid,
  updateContainerName,
  updateContainerReasoning,
  toggleContainerLock,
  updateContainerExecutionMode,
  handleContainerUpload,
  ucids,
  handleDeployToMissionControl,
}: StepWorkspaceProps) {
  const activePromoConfig =
    configs.find((c) => c.id === selectedConfigId) || configs[0];

  const constraints = React.useMemo(() => {
    if (!activePromoConfig) return null;
    const chassis = activePromoConfig.items.find((i) => i.type === "Chassis")?.partNumber || "Unknown";
    const cpu = activePromoConfig.items.find((i) => i.type === "Processor")?.partNumber || "Unknown";
    const ramQty = activePromoConfig.items.filter((i) => i.type === "Memory").reduce((s, i) => s + i.quantity, 0);
    const psuWatts = activePromoConfig.items.find((i) => i.type === "Power") ? 1200 : 800;
    return checkHardwareConstraints(chassis, cpu, ramQty, psuWatts);
  }, [activePromoConfig]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn flex-1">
      <WorkspaceHeader
        solutionName={solutionName}
        setSolutionName={setSolutionName}
        isMultiUcid={isMultiUcid}
        toggleMultiUcidMode={toggleMultiUcidMode}
        handleAddUcid={handleAddUcid}
      />

      <ConfigLibrarySelector
        configs={configs}
        selectedConfigId={selectedConfigId}
        setSelectedConfigId={setSelectedConfigId}
        isMultiUcid={isMultiUcid}
        ucidsList={ucidsList}
        assignConfigToUcid={assignConfigToUcid}
        activePromoConfig={activePromoConfig}
        constraints={constraints}
      />

      <UcidContainerList
        isMultiUcid={isMultiUcid}
        ucidsList={ucidsList}
        configs={configs}
        ucids={ucids}
        updateContainerName={updateContainerName}
        updateContainerReasoning={updateContainerReasoning}
        toggleContainerLock={toggleContainerLock}
        updateContainerExecutionMode={updateContainerExecutionMode}
        handleContainerUpload={handleContainerUpload}
        handleDeployToMissionControl={handleDeployToMissionControl}
        assignConfigToUcid={assignConfigToUcid}
      />
    </div>
  );
}
