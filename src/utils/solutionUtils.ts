import type { SolutionProject, SolutionStatus, UCID } from '../types';

/**
 * Derives the correct SolutionStatus from the states of its child UCIDs.
 * Call this after any UCID step transition to keep SolutionProject.status in sync.
 */
export function deriveSolutionStatus(
  solution: SolutionProject,
  allUcids: Array<{ id: string; currentStep: string; completedSteps: string[] }>
): SolutionStatus {
  const myUcids = allUcids.filter(u => solution.ucidIds.includes(u.id));

  if (myUcids.length === 0) return 'ucid-pending';

  const allComplete = myUcids.every(
    u => u.currentStep === 'snapshot' && u.completedSteps.includes('snapshot')
  );
  if (allComplete) return 'completed';

  const activeCount = myUcids.filter(
    u => u.currentStep !== 'snapshot' || !u.completedSteps.includes('snapshot')
  ).length;

  return activeCount > 1 ? 'parallel-active' : 'in-progress';
}

/**
 * Generates a unique SolutionProject.name.
 * Format: "{CustomerName}-{BOQRef}-{YYYY}"
 * If a name collision exists in the store, appends a numeric suffix.
 */
export function generateSolutionName(
  customerName: string,
  boqRef: string,
  existingNames: string[]
): string {
  const year = new Date().getFullYear();
  // Sanitize: remove spaces, special chars; keep alphanumeric and hyphens
  const clean = (s: string) => s.replace(/[^a-zA-Z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const base = `${clean(customerName)}-${clean(boqRef)}-${year}`;

  if (!existingNames.includes(base)) return base;

  let suffix = 2;
  while (existingNames.includes(`${base}-${suffix}`)) suffix++;
  return `${base}-${suffix}`;
}

/**
 * Generates the next SolutionProject.displayId based on existing solutions.
 */
export function generateSolutionDisplayId(existingSolutions: SolutionProject[]): string {
  const year = new Date().getFullYear();
  const yearSolutions = existingSolutions.filter(s =>
    s.displayId.startsWith(`SOL-${year}-`)
  );
  const nextNum = yearSolutions.length + 1;
  return `SOL-${year}-${String(nextNum).padStart(3, '0')}`;
}

/**
 * Returns true if the SolutionProject has reached its end state (all UCIDs complete).
 */
export function isSolutionComplete(solution: SolutionProject): boolean {
  return solution.status === 'completed';
}

/**
 * Validates that all UCIDs in a project have exactly one Primary Vendor Assignment.
 */
export function assertVendorAssignmentInvariant(
  project: SolutionProject,
  ucids: UCID[]
): boolean {
  // If the project doesn't have crossVendorEnabled, there are no strict multi-vendor assignments required
  if (!project.crossVendorEnabled) return true;
  
  const myUcids = ucids.filter(u => project.ucidIds.includes(u.id));
  
  // Every UCID must be covered by exactly one assignment where isPrimary === true
  return myUcids.every(u => {
    const primaryAssignments = project.vendorAssignments.filter(
      va => va.isPrimary && va.configIndices.includes(u.configIndex)
    );
    return primaryAssignments.length === 1;
  });
}

/**
 * Derives whether the vendor-provisioning step is complete based on the execution mode.
 */
export function deriveVendorProvisioningCompletion(ucid: UCID): boolean {
  if (ucid.executionMode === 'automated' && ucid.automationState) {
    return ucid.automationState.status === 'completed';
  }
  if (ucid.executionMode === 'manual' && ucid.manualUploadState) {
    return ucid.manualUploadState.status === 'complete';
  }
  // Hybrid logic implies both or manual override
  if (ucid.executionMode === 'hybrid') {
     const autoDone = ucid.automationState?.status === 'completed';
     const manualDone = ucid.manualUploadState?.status === 'complete';
     return autoDone || manualDone;
  }
  
  // Backwards compatibility for older mock data
  return ucid.completedSteps.includes('vendor-provisioning');
}
