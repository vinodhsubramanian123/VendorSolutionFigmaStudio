import React from "react";
import { WorkspaceNodeCard } from "./WorkspaceNodeCard";

const CISCO_CONFIGS = [
  "Cisco UCS Rack Frame",
  "Intel Symmetrical Core Xeon",
  "Virtual Interface Fabrics (VIC)",
  "Symmetrical Power Ingress Grid",
];

interface CiscoWorkspaceNodeProps {
  ciscoSyncedConfigs: number;
  ucidId?: string;
}

export function CiscoWorkspaceNode({ ciscoSyncedConfigs, ucidId }: CiscoWorkspaceNodeProps) {
  return (
    <WorkspaceNodeCard
      ucidId={ucidId}
      vendorName="Cisco"
      subtitle="Cisco Symmetrical Fabric"
      syncedConfigs={ciscoSyncedConfigs}
      configs={CISCO_CONFIGS}
      valueMultiplier={90750}
    />
  );
}
