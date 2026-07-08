import { describe, it, expect } from 'vitest';
import { migrateSnapshot, migrateUcidSnapshots, migrateAllUcidSnapshots } from '../snapshotMigration';
import type { Snapshot, UCID } from '../types';

function makeSnapshot(overrides: Partial<Snapshot> = {}): Snapshot {
  return {
    id: 's1',
    label: 'Milestone 1',
    committedAt: '2026-01-01T00:00:00.000Z',
    winnerSolution: 'sol-1',
    totalValue: 1000,
    notes: '',
    version: 1,
    timestamp: '2026-01-01T00:00:00.000Z',
    locked: true,
    bomSnapshot: [],
    ...overrides,
  };
}

function makeUcid(overrides: Partial<UCID> = {}): UCID {
  return {
    id: 'u1',
    displayId: 'UCID-001',
    snapshots: [],
    ...overrides,
  } as UCID;
}

describe('migrateSnapshot', () => {
  it('leaves an already-migrated snapshot unchanged', () => {
    const snapshot = makeSnapshot();
    const result = migrateSnapshot(snapshot, 0);
    expect(result.migrated).toBe(false);
    expect(result.snapshot).toBe(snapshot);
  });

  it('fills in a missing version from the array index', () => {
    const snapshot = makeSnapshot({ version: undefined as any });
    const result = migrateSnapshot(snapshot, 2);
    expect(result.migrated).toBe(true);
    expect(result.snapshot.version).toBe(3);
  });

  it('falls back timestamp to committedAt when missing', () => {
    const snapshot = makeSnapshot({ timestamp: undefined as any, committedAt: '2025-06-01T00:00:00.000Z' });
    const result = migrateSnapshot(snapshot, 0);
    expect(result.migrated).toBe(true);
    expect(result.snapshot.timestamp).toBe('2025-06-01T00:00:00.000Z');
  });

  it('defaults locked to true when missing', () => {
    const snapshot = makeSnapshot({ locked: undefined as any });
    const result = migrateSnapshot(snapshot, 0);
    expect(result.migrated).toBe(true);
    expect(result.snapshot.locked).toBe(true);
  });

  it('derives bomSnapshot from payload when missing', () => {
    const snapshot = makeSnapshot({
      bomSnapshot: undefined,
      payload: [{ vendorSubmissions: [{ configs: [{ id: 'c1' }] }] }] as any,
    });
    const result = migrateSnapshot(snapshot, 0);
    expect(result.migrated).toBe(true);
    expect(result.snapshot.bomSnapshot).toEqual([{ id: 'c1' }]);
  });

  it('derives an empty bomSnapshot when no payload is present', () => {
    const snapshot = makeSnapshot({ bomSnapshot: undefined, payload: undefined });
    const result = migrateSnapshot(snapshot, 0);
    expect(result.migrated).toBe(true);
    expect(result.snapshot.bomSnapshot).toEqual([]);
  });
});

describe('migrateUcidSnapshots', () => {
  it('leaves a UCID with no legacy snapshots unchanged', () => {
    const ucid = makeUcid({ snapshots: [makeSnapshot()] });
    const result = migrateUcidSnapshots(ucid);
    expect(result.migrated).toBe(false);
    expect(result.ucid).toBe(ucid);
  });

  it('migrates a UCID with at least one legacy snapshot', () => {
    const ucid = makeUcid({ snapshots: [makeSnapshot(), makeSnapshot({ version: undefined as any })] });
    const result = migrateUcidSnapshots(ucid);
    expect(result.migrated).toBe(true);
    expect(result.ucid.snapshots?.[1].version).toBe(2);
  });

  it('handles a UCID with no snapshots array at all', () => {
    const ucid = makeUcid({ snapshots: undefined });
    const result = migrateUcidSnapshots(ucid);
    expect(result.migrated).toBe(false);
  });
});

describe('migrateAllUcidSnapshots', () => {
  it('returns migrated: false and the same array reference when nothing needs migrating', () => {
    const ucids = [makeUcid({ snapshots: [makeSnapshot()] })];
    const result = migrateAllUcidSnapshots(ucids);
    expect(result.migrated).toBe(false);
    expect(result.ucids).toBe(ucids);
  });

  it('migrates only the UCIDs that need it, leaving others untouched', () => {
    const cleanUcid = makeUcid({ id: 'clean', snapshots: [makeSnapshot()] });
    const legacyUcid = makeUcid({ id: 'legacy', snapshots: [makeSnapshot({ locked: undefined as any })] });
    const result = migrateAllUcidSnapshots([cleanUcid, legacyUcid]);

    expect(result.migrated).toBe(true);
    expect(result.ucids[0]).toBe(cleanUcid);
    expect(result.ucids[1]).not.toBe(legacyUcid);
    expect(result.ucids[1].snapshots?.[0].locked).toBe(true);
  });
});
