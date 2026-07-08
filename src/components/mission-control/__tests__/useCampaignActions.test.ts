import { describe, it, expect } from 'vitest';
import { buildCertificationSnapshot, certifyUcid } from '../useCampaignActions';
import type { UCID } from '../../../types';

function makeUcid(overrides: Partial<UCID> = {}): UCID {
  return {
    id: 'u1',
    displayId: 'UCID-001',
    currentStep: 'comparison',
    completedSteps: ['boq-intake', 'pre-intelligence', 'solution-design', 'vendor-provisioning', 'post-intelligence', 'comparison'],
    snapshots: [],
    events: [],
    solutions: [
      {
        id: 'sol1',
        vendorSubmissions: [
          { vendor: 'HPE', totalPrice: 50000, configs: [{ id: 'c1' }] },
        ],
      },
    ],
    ...overrides,
  } as unknown as UCID;
}

describe('buildCertificationSnapshot', () => {
  it('builds a snapshot from the winning (first) vendor submission', () => {
    const u = makeUcid();
    const snapshot = buildCertificationSnapshot(u, 'Jane Doe');

    expect(snapshot.winnerSolution).toBe('HPE');
    expect(snapshot.totalValue).toBe(50000);
    expect(snapshot.notes).toContain('Jane Doe');
    expect(snapshot.version).toBe(1);
    expect(snapshot.locked).toBe(true);
    expect(snapshot.bomSnapshot).toEqual([{ id: 'c1' }]);
  });

  it('falls back to a Multi-vendor placeholder when there is no submission at all', () => {
    const u = makeUcid({ solutions: [{ id: 'sol1', vendorSubmissions: [] }] as any });
    const snapshot = buildCertificationSnapshot(u, 'Jane Doe');

    expect(snapshot.winnerSolution).toBe('Multi-vendor');
    expect(snapshot.totalValue).toBe(240000);
  });

  it('increments version based on existing snapshot count', () => {
    const u = makeUcid({ snapshots: [{ id: 's1' }, { id: 's2' }] as any });
    const snapshot = buildCertificationSnapshot(u, 'Jane Doe');
    expect(snapshot.version).toBe(3);
  });
});

describe('certifyUcid', () => {
  it('advances the UCID to the snapshot step and adds a covenant-lock event', () => {
    const u = makeUcid();
    const result = certifyUcid(u, 'Jane Doe');

    expect(result.currentStep).toBe('snapshot');
    expect(result.completedSteps).toContain('snapshot');
    expect(result.events).toHaveLength(1);
    expect(result.events[0].msg).toContain('Jane Doe');
  });

  it('seals a new snapshot when none exists yet', () => {
    const u = makeUcid({ snapshots: [] });
    const result = certifyUcid(u, 'Jane Doe');
    expect(result.snapshots).toHaveLength(1);
  });

  it('does not add a second snapshot when one already exists', () => {
    const existing = [{ id: 'existing-snap' }] as any;
    const u = makeUcid({ snapshots: existing });
    const result = certifyUcid(u, 'Jane Doe');
    expect(result.snapshots).toBe(existing);
    expect(result.snapshots).toHaveLength(1);
  });
});
