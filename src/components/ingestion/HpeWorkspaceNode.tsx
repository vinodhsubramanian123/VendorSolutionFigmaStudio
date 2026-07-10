import React from "react";
import { WorkspaceNodeCard } from "./WorkspaceNodeCard";

interface VendorNodeConfig {
  label: string;
}

const HPE_CONFIGS: VendorNodeConfig[] = [
  { label: "HPE ProLiant Gen11 Chassis" },
  { label: "Intel Xeon Scalable High CPU" },
  { label: "Symmetrical Memory Sourcing" },
  { label: "Redundant Power Grid Bus" },
];

interface HpeWorkspaceNodeProps {
  hpeSyncedConfigs: number;
  ucidId?: string;
}

export function HpeWorkspaceNode({ hpeSyncedConfigs, ucidId }: HpeWorkspaceNodeProps) {
  return (
    <WorkspaceNodeCard
      ucidId={ucidId}
      vendorName="HPE"
      subtitle="HPE High-Core Blades"
      syncedConfigs={hpeSyncedConfigs}
      configs={HPE_CONFIGS}
      valueMultiplier={105450}
    />
  );
}
