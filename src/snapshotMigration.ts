import type { UCID, Snapshot, Config } from "./types";

// One-time migration for legacy UCID snapshot objects that predate the
// version/timestamp/locked/bomSnapshot fields. Extracted from App.tsx's
// migration effect into pure functions so the effect itself stays a simple
// orchestration step, and so this logic (previously untested) can be
// unit-tested directly.

function deriveFallbackBom(snapshot: Snapshot): Config[] {
  if (snapshot.bomSnapshot) {
    return snapshot.bomSnapshot;
  }
  if (snapshot.payload && Array.isArray(snapshot.payload)) {
    return snapshot.payload[0]?.vendorSubmissions?.[0]?.configs || [];
  }
  return [];
}

export function migrateSnapshot(snapshot: Snapshot, index: number): { migrated: boolean; snapshot: Snapshot } {
  const fallbackVersion = snapshot.version ?? (index + 1);
  const fallbackTimestamp = snapshot.timestamp ?? snapshot.committedAt ?? new Date().toISOString();
  const fallbackLocked = snapshot.locked ?? true;
  const fallbackBom = deriveFallbackBom(snapshot);

  const needsMigration =
    snapshot.version !== fallbackVersion ||
    snapshot.timestamp !== fallbackTimestamp ||
    snapshot.locked !== fallbackLocked ||
    snapshot.bomSnapshot === undefined;

  if (!needsMigration) {
    return { migrated: false, snapshot };
  }

  return {
    migrated: true,
    snapshot: {
      ...snapshot,
      version: fallbackVersion,
      timestamp: fallbackTimestamp,
      locked: fallbackLocked,
      bomSnapshot: fallbackBom,
    },
  };
}

export function migrateUcidSnapshots(ucid: UCID): { migrated: boolean; ucid: UCID } {
  let anySnapshotMigrated = false;
  const nextSnapshots = (ucid.snapshots || []).map((snapshot, idx) => {
    const result = migrateSnapshot(snapshot, idx);
    if (result.migrated) anySnapshotMigrated = true;
    return result.snapshot;
  });

  if (!anySnapshotMigrated) {
    return { migrated: false, ucid };
  }

  return { migrated: true, ucid: { ...ucid, snapshots: nextSnapshots } };
}

export function migrateAllUcidSnapshots(ucids: UCID[]): { migrated: boolean; ucids: UCID[] } {
  let anyUcidMigrated = false;
  const nextUcids = ucids.map((ucid) => {
    const result = migrateUcidSnapshots(ucid);
    if (result.migrated) anyUcidMigrated = true;
    return result.ucid;
  });

  return anyUcidMigrated ? { migrated: true, ucids: nextUcids } : { migrated: false, ucids };
}
