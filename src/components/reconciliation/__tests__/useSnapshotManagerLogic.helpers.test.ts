import { describe, it, expect } from 'vitest';
import { getFirstSolutionSubmissions, findChosenSubmission, getSnapshotBaseData } from '../useSnapshotManagerLogic';
import type { UCID } from '../../../types';

describe('getFirstSolutionSubmissions', () => {
  it('returns the first solution vendor submissions when present', () => {
    const ucid = { solutions: [{ vendorSubmissions: [{ vendor: 'HPE' }] }] } as unknown as UCID;
    expect(getFirstSolutionSubmissions(ucid)).toEqual([{ vendor: 'HPE' }]);
  });

  it('returns an empty array when there are no solutions', () => {
    const ucid = { solutions: [] } as unknown as UCID;
    expect(getFirstSolutionSubmissions(ucid)).toEqual([]);
  });
});

describe('findChosenSubmission', () => {
  const submissions = [
    { vendor: 'HPE', label: 'Option A' },
    { vendor: 'Dell', label: 'Option B' },
  ] as any;

  it('matches by label', () => {
    expect(findChosenSubmission(submissions, 'Option B')).toEqual(submissions[1]);
  });

  it('matches by vendor', () => {
    expect(findChosenSubmission(submissions, 'HPE')).toEqual(submissions[0]);
  });

  it('falls back to the first submission when nothing matches', () => {
    expect(findChosenSubmission(submissions, 'Nonexistent')).toEqual(submissions[0]);
  });

  it('returns undefined when there are no submissions at all', () => {
    expect(findChosenSubmission([], 'Anything')).toBeUndefined();
  });
});

describe('getSnapshotBaseData', () => {
  it('combines current value, BOM configs, and next version', () => {
    const ucid = {
      solutions: [{ vendorSubmissions: [{ vendor: 'HPE', totalPrice: 5000, configs: [{ id: 'c1' }] }] }],
      snapshots: [{ id: 's1' }],
    } as unknown as UCID;

    const result = getSnapshotBaseData(ucid, 'HPE');
    expect(result).toEqual({ currentTotalValue: 5000, bomConfigs: [{ id: 'c1' }], nextVersion: 2 });
  });

  it('handles a UCID with no solutions or snapshots', () => {
    const ucid = { solutions: [], snapshots: [] } as unknown as UCID;
    const result = getSnapshotBaseData(ucid, 'HPE');
    expect(result).toEqual({ currentTotalValue: 0, bomConfigs: [], nextVersion: 1 });
  });
});
