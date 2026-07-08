import type { UCID, UCIDStep } from "../../types";

export function getSolutionName(u: UCID, solutions: any[]): string {
  const solution = solutions.find((s) => s.id === u.solutionId);
  if (solution) {
    return solution.name;
  }
  if (u.name.includes(" — ")) {
    return u.name.split(" — ")[0];
  }
  if (u.projectRef) {
    if (u.projectRef === "PRJ-VIRT-NORTH-2026")
      return "North Virtualization Cluster Campaign";
    if (u.projectRef === "PRJ-STO-BACKUP-EAST")
      return "East Backup Storage Consolidation";
    if (u.projectRef === "PRJ-NET-DC-SPINE")
      return "HQ Spine Network Overhaul";
    if (u.projectRef === "PRJ-WAN-EDGE-SEC")
      return "WAN Edge Security Gateway Refresh";
    return u.projectRef;
  }
  return "General Sourcing Projects";
}

export type StepState = "upcoming" | "active" | "complete";

export function getStepState(
  u: UCID,
  stepId: UCIDStep,
): StepState {
  if (u.completedSteps.includes(stepId)) return "complete";
  if (stepId === u.currentStep) return "active";
  return "upcoming";
}

// UCID names are often stored as "<campaign> — <specific config name>"; most
// display contexts only want the specific config part when that separator
// is present. Single canonical definition -- previously this exact ternary
// was duplicated independently in both MissionControl.tsx and
// CampaignPanels.tsx.
export function formatUcidDisplayName(name: string): string {
  return name.includes(" — ") ? name.split(" — ").slice(1).join(" — ") : name;
}

// Maps a UCID's syncStatus to the StatusBadge variant that displays it.
export function getSyncStatusVariant(syncStatus: string | undefined): "success" | "warning" | "info" {
  if (syncStatus === "Synced") return "success";
  if (syncStatus === "Out-of-Sync") return "warning";
  return "info";
}
