import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resetToSeedData, clearPersistedStores, PERSISTED_STORE_KEYS } from '../resetSeedData';

describe('resetSeedData', () => {
  let reloadSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    for (const key of PERSISTED_STORE_KEYS) {
      window.localStorage.setItem(key, JSON.stringify({ state: { dummy: true }, version: 1 }));
    }
    reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadSpy },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('clearPersistedStores removes every persisted store key without reloading', () => {
    clearPersistedStores();

    for (const key of PERSISTED_STORE_KEYS) {
      expect(window.localStorage.getItem(key)).toBeNull();
    }
    expect(reloadSpy).not.toHaveBeenCalled();
  });

  it('resetToSeedData clears every persisted store key AND reloads', () => {
    resetToSeedData();

    for (const key of PERSISTED_STORE_KEYS) {
      expect(window.localStorage.getItem(key)).toBeNull();
    }
    expect(reloadSpy).toHaveBeenCalledTimes(1);
  });

  it('covers all four known persisted store keys (coreStore, ingestionStore, workflowStore, auditStore)', () => {
    expect(PERSISTED_STORE_KEYS).toEqual([
      'vsip-core-storage',
      'vsip-ingestion-storage',
      'vsip-workflow-storage',
      'vsip-audit-logs',
    ]);
  });
});
