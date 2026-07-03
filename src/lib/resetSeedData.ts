// Clears all persisted VSIP store state from localStorage and reloads, so
// the app starts fresh from the pristine mock seed data in src/lib/mockData/
// instead of whatever was last saved from a previous session.
//
// Without this, there was no way to get back to a known-good starting point
// short of manually clearing browser storage — every reload silently
// rehydrates from localStorage if a previous session wrote anything there
// (see docs/architecture/data-ownership.md, Phase 5).
export const PERSISTED_STORE_KEYS = [
  "vsip-core-storage",
  "vsip-ingestion-storage",
  "vsip-workflow-storage",
  "vsip-audit-logs",
] as const;

export function resetToSeedData(): void {
  clearPersistedStores();
  window.location.reload();
}

// Same as resetToSeedData but without the reload — for use before the app
// has rendered at all (e.g. driven by VITE_RESET_ON_LOAD in main.tsx), where
// reloading again would just loop.
export function clearPersistedStores(): void {
  for (const key of PERSISTED_STORE_KEYS) {
    window.localStorage.removeItem(key);
  }
}
