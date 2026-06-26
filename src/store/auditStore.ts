import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuditLogEntry } from '../hooks/useAuditLog';

interface AuditStoreState {
  logs: AuditLogEntry[];
  setLogs: (logs: AuditLogEntry[] | ((prev: AuditLogEntry[]) => AuditLogEntry[])) => void;
}

export const useAuditStore = create<AuditStoreState>()(
  persist(
    (set) => ({
      logs: [],
      setLogs: (val) => set((state) => ({ logs: typeof val === 'function' ? val(state.logs) : val })),
    }),
    {
      name: 'vsip-audit-logs',
    }
  )
);
