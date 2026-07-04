/**
 * ucidActions.test.ts
 *
 * Unit tests for the named UCID action module (src/store/ucidActions.ts).
 *
 * Coverage targets:
 * - Happy path for each action (advance, regress, commit, update, delete)
 * - Locked-snapshot guard blocks regress AND advance (§12 enforcement)
 * - Not-found guard returns { success: false }
 * - Edge cases: already at first/last step, locked but attempting field update (allowed)
 */

import { describe, it, expect, vi } from 'vitest';
import {
  advanceUcidStep,
  regressUcidStep,
  commitUcidSnapshot,
  updateUcidField,
  deleteUcid,
} from '../ucidActions';
import type { UCID, Snapshot } from '../../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeUcid(overrides: Partial<UCID> = {}): UCID {
  return {
    id: 'u-test-1',
    displayId: 'UCID-2026-0001',
    name: 'Test Config',
    solutionId: 'sol-1',
    solutionDisplayId: 'SOL-2026-001',
    priority: 'medium',
    projectRef: 'PRJ-TEST',
    createdAt: new Date().toISOString(),
    currentStep: 'boq-intake',
    completedSteps: [],
    rawBOM: 'Part A x2',
    solutions: [],
    events: [],
    snapshots: [],
    configIndex: 1,
    configLabel: 'Config 1',
    parallelGroup: null,
    solutionName: 'Test Solution',
    ...overrides,
  } as unknown as UCID;
}

function makeLockedUcid(): UCID {
  return makeUcid({
    currentStep: 'comparison',
    snapshots: [{ id: 'snap-1', locked: true } as unknown as Snapshot],
  });
}

// ---------------------------------------------------------------------------
// advanceUcidStep
// ---------------------------------------------------------------------------

describe('advanceUcidStep', () => {
  it('advances UCID to the next step and records a completed step', () => {
    const ucid = makeUcid({ currentStep: 'boq-intake' });
    const setUcids = vi.fn();
    const result = advanceUcidStep('u-test-1', [ucid], setUcids);

    expect(result.success).toBe(true);
    expect(setUcids).toHaveBeenCalledOnce();

    // Verify the patch contains the correct next step
    const updater = setUcids.mock.calls[0][0] as (prev: UCID[]) => UCID[];
    const next = updater([ucid]);
    expect(next[0].currentStep).toBe('pre-intelligence');
    expect(next[0].completedSteps).toContain('boq-intake');
  });

  it('returns failure when UCID is not found', () => {
    const result = advanceUcidStep('does-not-exist', [], vi.fn());
    expect(result.success).toBe(false);
    expect(result.reason).toMatch(/not found/i);
  });

  it('returns failure when UCID has a locked snapshot (§12 guard)', () => {
    const ucid = makeLockedUcid();
    const setUcids = vi.fn();
    const result = advanceUcidStep('u-test-1', [ucid], setUcids);

    expect(result.success).toBe(false);
    expect(result.reason).toMatch(/locked snapshot/i);
    expect(setUcids).not.toHaveBeenCalled();
  });

  it('returns failure when UCID is already at the final step', () => {
    const ucid = makeUcid({ currentStep: 'snapshot' });
    const result = advanceUcidStep('u-test-1', [ucid], vi.fn());
    expect(result.success).toBe(false);
    expect(result.reason).toMatch(/final step/i);
  });
});

// ---------------------------------------------------------------------------
// regressUcidStep
// ---------------------------------------------------------------------------

describe('regressUcidStep', () => {
  it('regresses UCID to the previous step', () => {
    const ucid = makeUcid({ currentStep: 'pre-intelligence' });
    const setUcids = vi.fn();
    const result = regressUcidStep('u-test-1', [ucid], setUcids);

    expect(result.success).toBe(true);
    const updater = setUcids.mock.calls[0][0] as (prev: UCID[]) => UCID[];
    const next = updater([ucid]);
    expect(next[0].currentStep).toBe('boq-intake');
  });

  it('returns failure when UCID is already at the first step', () => {
    const ucid = makeUcid({ currentStep: 'boq-intake' });
    const result = regressUcidStep('u-test-1', [ucid], vi.fn());
    expect(result.success).toBe(false);
    expect(result.reason).toMatch(/first step/i);
  });

  it('returns failure when UCID has a locked snapshot — cannot regress certified config (§12 guard)', () => {
    const ucid = makeLockedUcid();
    const setUcids = vi.fn();
    const result = regressUcidStep('u-test-1', [ucid], setUcids);

    expect(result.success).toBe(false);
    expect(result.reason).toMatch(/locked snapshot/i);
    expect(setUcids).not.toHaveBeenCalled();
  });

  it('returns failure when UCID is not found', () => {
    const result = regressUcidStep('missing', [], vi.fn());
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// commitUcidSnapshot
// ---------------------------------------------------------------------------

describe('commitUcidSnapshot', () => {
  it('appends snapshot to UCID.snapshots and logs an event', () => {
    const ucid = makeUcid();
    const snap = { id: 'snap-new', locked: false } as unknown as Snapshot;
    const setUcids = vi.fn();

    const result = commitUcidSnapshot('u-test-1', snap, [ucid], setUcids);
    expect(result.success).toBe(true);

    const updater = setUcids.mock.calls[0][0] as (prev: UCID[]) => UCID[];
    const next = updater([ucid]);
    expect(next[0].snapshots).toHaveLength(1);
    expect(next[0].snapshots![0].id).toBe('snap-new');
    expect(next[0].events?.some((e: { msg: string }) => e.msg.includes('snap-new'))).toBe(true);
  });

  it('returns failure when UCID is not found', () => {
    const result = commitUcidSnapshot('missing', {} as Snapshot, [], vi.fn());
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateUcidField
// ---------------------------------------------------------------------------

describe('updateUcidField', () => {
  it('patches allowed fields on the UCID', () => {
    const ucid = makeUcid({ priority: 'medium' });
    const setUcids = vi.fn();

    const result = updateUcidField('u-test-1', { priority: 'high', name: 'Updated Name' }, [ucid], setUcids);
    expect(result.success).toBe(true);

    const updater = setUcids.mock.calls[0][0] as (prev: UCID[]) => UCID[];
    const next = updater([ucid]);
    expect(next[0].priority).toBe('high');
    expect(next[0].name).toBe('Updated Name');
  });

  it('returns failure when UCID is not found', () => {
    const result = updateUcidField('missing', {}, [], vi.fn());
    expect(result.success).toBe(false);
  });

  it('allows field updates even when UCID has a locked snapshot (only step transitions are blocked)', () => {
    const ucid = makeLockedUcid();
    const setUcids = vi.fn();
    // updateUcidField does NOT check for locked snapshots — that's intentional for lightweight patches
    const result = updateUcidField('u-test-1', { name: 'Renamed' }, [ucid], setUcids);
    expect(result.success).toBe(true);
    expect(setUcids).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// deleteUcid
// ---------------------------------------------------------------------------

describe('deleteUcid', () => {
  it('removes the UCID from the array', () => {
    const ucid = makeUcid();
    const setUcids = vi.fn();

    const result = deleteUcid('u-test-1', [ucid], setUcids);
    expect(result.success).toBe(true);

    const updater = setUcids.mock.calls[0][0] as (prev: UCID[]) => UCID[];
    const next = updater([ucid]);
    expect(next).toHaveLength(0);
  });

  it('returns failure when UCID has a locked snapshot — blocks deletion of certified configs (§12)', () => {
    const ucid = makeLockedUcid();
    const setUcids = vi.fn();

    const result = deleteUcid('u-test-1', [ucid], setUcids);
    expect(result.success).toBe(false);
    expect(result.reason).toMatch(/locked snapshot/i);
    expect(setUcids).not.toHaveBeenCalled();
  });

  it('returns failure when UCID is not found', () => {
    const result = deleteUcid('missing', [], vi.fn());
    expect(result.success).toBe(false);
  });

  it('leaves other UCIDs untouched when deleting one', () => {
    const ucid1 = makeUcid({ id: 'u-1', displayId: 'UCID-2026-0001' });
    const ucid2 = makeUcid({ id: 'u-2', displayId: 'UCID-2026-0002' });
    const setUcids = vi.fn();

    deleteUcid('u-1', [ucid1, ucid2], setUcids);
    const updater = setUcids.mock.calls[0][0] as (prev: UCID[]) => UCID[];
    const next = updater([ucid1, ucid2]);
    expect(next).toHaveLength(1);
    expect(next[0].id).toBe('u-2');
  });
});
