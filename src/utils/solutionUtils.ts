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
