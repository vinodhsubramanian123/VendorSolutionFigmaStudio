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

export function getStepState(
  u: UCID,
  stepId: UCIDStep,
): "upcoming" | "active" | "complete" {
  if (u.completedSteps.includes(stepId)) return "complete";
  if (stepId === u.currentStep) return "active";
  return "upcoming";
}
