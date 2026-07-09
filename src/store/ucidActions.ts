/**
 * ucidActions.ts
 *
 * Named, intention-revealing UCID mutation actions with built-in precondition
 * and lock guards. This is the single authoritative place to mutate UCID state.
 *
 * WHY THIS EXISTS: Audit §11 found 15 files each implementing their own
 * `setUcids(prev.map(u => u.id === id ? {...u, ...} : u))` logic, creating the
 * conditions for inconsistent step transitions, duplicate snapshot logic, and
 * "locked" state being cosmetic instead of enforced (§12).
 *
 * USAGE:
 *   import { advanceUcidStep } from '../../store/ucidActions';
 *   const result = advanceUcidStep(ucidId, ucids, setUcids);
 *   if (!result.success) warn(result.reason ?? 'Step advance failed');
 *
 * Callers should surface `result.reason` via toast on failure rather than
 * silently no-op'ing.
 */

import type { UCID, Snapshot, UCIDStep } from '../types';
import { STEP_ORDER } from '../lib/mockData';

/** Standard action result — always check `success` before assuming state changed. */
export interface UcidActionResult {
  success: boolean;
  reason?: string;
}

type SetUcids = (val: UCID[] | ((prev: UCID[]) => UCID[])) => void;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function findUcid(ucidId: string, ucids: UCID[]): UCID | undefined {
  return ucids.find((u) => u.id === ucidId);
}

function hasLockedSnapshot(ucid: UCID): boolean {
  return (ucid.snapshots ?? []).some((s) => s.locked);
}

function applyPatch(ucidId: string, patch: Partial<UCID>, setUcids: SetUcids): void {
  setUcids((prev) =>
    prev.map((u) => (u.id === ucidId ? { ...u, ...patch } : u))
  );
}

// Shared entry guard for advanceUcidStep/regressUcidStep/deleteUcid: finds
// the UCID and blocks the action if it has a locked (certified) snapshot.
// Each caller supplies its own action-specific block message. Returns
// either an early UcidActionResult (when the guard fails) or the resolved
// UCID (when it's safe to proceed).
function guardUcidAction(
  ucidId: string,
  ucids: UCID[],
  lockedMessage: (ucid: UCID) => string
): { blocked: true; result: UcidActionResult } | { blocked: false; ucid: UCID } {
  const ucid = findUcid(ucidId, ucids);
  if (!ucid) {
    return { blocked: true, result: { success: false, reason: `UCID ${ucidId} not found.` } };
  }
  if (hasLockedSnapshot(ucid)) {
    return { blocked: true, result: { success: false, reason: lockedMessage(ucid) } };
  }
  return { blocked: false, ucid };
}

// ---------------------------------------------------------------------------
// Public actions
// ---------------------------------------------------------------------------

/**
 * Advances a UCID to the next step in STEP_ORDER.
 * Blocked if the UCID has a locked snapshot (prevents regression/re-advance
 * of certified configurations).
 */
export function advanceUcidStep(
  ucidId: string,
  ucids: UCID[],
  setUcids: SetUcids
): UcidActionResult {
  const guard = guardUcidAction(
    ucidId,
    ucids,
    (u) => `${u.displayId} has a certified locked snapshot — advance is blocked to protect data integrity.`
  );
  if (guard.blocked) return guard.result;
  const ucid = guard.ucid;
  const currentIdx = STEP_ORDER.indexOf(ucid.currentStep as UCIDStep);
  const nextStep = STEP_ORDER[currentIdx + 1];
  if (!nextStep) {
    return { success: false, reason: `${ucid.displayId} is already at the final step.` };
  }

  const completedSteps = [...(ucid.completedSteps ?? [])];
  if (!completedSteps.includes(ucid.currentStep)) {
    completedSteps.push(ucid.currentStep);
  }

  applyPatch(ucidId, {
    currentStep: nextStep,
    completedSteps,
    events: [
      ...(ucid.events ?? []),
      {
        timestamp: new Date().toISOString(),
        level: 'ok',
        msg: `Advanced from ${ucid.currentStep} → ${nextStep}.`,
      },
    ],
  }, setUcids);

  return { success: true };
}

/**
 * Regresses a UCID to the previous step in STEP_ORDER.
 * Blocked if the UCID has a locked snapshot — prevents regressing certified
 * configurations, enforcing §12's locked-state data integrity guarantee.
 */
export function regressUcidStep(
  ucidId: string,
  ucids: UCID[],
  setUcids: SetUcids
): UcidActionResult {
  const guard = guardUcidAction(
    ucidId,
    ucids,
    (u) => `${u.displayId} has a certified locked snapshot — regression is blocked to protect data integrity.`
  );
  if (guard.blocked) return guard.result;
  const ucid = guard.ucid;

  const currentIdx = STEP_ORDER.indexOf(ucid.currentStep as UCIDStep);
  if (currentIdx <= 0) {
    return { success: false, reason: `${ucid.displayId} is already at the first step.` };
  }
  const prevStep = STEP_ORDER[currentIdx - 1];

  applyPatch(ucidId, {
    currentStep: prevStep,
    events: [
      ...(ucid.events ?? []),
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        msg: `Regressed from ${ucid.currentStep} → ${prevStep}.`,
      },
    ],
  }, setUcids);

  return { success: true };
}

/**
 * Commits a snapshot to a UCID. Records it in `ucid.snapshots[]` and
 * appends an audit event.
 */
export function commitUcidSnapshot(
  ucidId: string,
  snapshot: Snapshot,
  ucids: UCID[],
  setUcids: SetUcids
): UcidActionResult {
  const ucid = findUcid(ucidId, ucids);
  if (!ucid) return { success: false, reason: `UCID ${ucidId} not found.` };

  applyPatch(ucidId, {
    snapshots: [...(ucid.snapshots ?? []), snapshot],
    events: [
      ...(ucid.events ?? []),
      {
        timestamp: new Date().toISOString(),
        level: 'ok',
        msg: `Snapshot ${snapshot.id} committed${snapshot.locked ? ' (locked)' : ''}.`,
      },
    ],
  }, setUcids);

  return { success: true };
}

/**
 * Generic field-level patch for a UCID. Use for lightweight field updates
 * (e.g., name, priority, projectRef) that don't require step-transition guards.
 * Does NOT allow patching `currentStep` — use advanceUcidStep/regressUcidStep.
 */
export function updateUcidField(
  ucidId: string,
  fields: Omit<Partial<UCID>, 'currentStep' | 'completedSteps' | 'snapshots' | 'id'>,
  ucids: UCID[],
  setUcids: SetUcids
): UcidActionResult {
  const ucid = findUcid(ucidId, ucids);
  if (!ucid) return { success: false, reason: `UCID ${ucidId} not found.` };
  applyPatch(ucidId, fields, setUcids);
  return { success: true };
}

/**
 * Removes a UCID from the array. This does NOT automatically clean up the
 * parent SolutionProject.ucidIds — callers should also invoke
 * `coreStore.addUcidToSolution` cleanup or `deleteSolution` if the solution
 * becomes empty.
 *
 * Returns `{ success: false }` if the UCID has a locked snapshot, to prevent
 * accidental deletion of certified configurations.
 */
export function deleteUcid(
  ucidId: string,
  ucids: UCID[],
  setUcids: SetUcids
): UcidActionResult {
  const guard = guardUcidAction(
    ucidId,
    ucids,
    (u) => `${u.displayId} has a certified locked snapshot and cannot be deleted. Archive the parent Solution instead.`
  );
  if (guard.blocked) return guard.result;

  setUcids((prev) => prev.filter((u) => u.id !== ucidId));
  return { success: true };
}
