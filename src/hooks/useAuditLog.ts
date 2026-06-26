import { useAuditStore } from "../store/auditStore";

export interface AuditLogEntry {
  timestamp: string;
  fromStep: string | undefined;
  toStep: string;
  action: string;
}

export function useAuditLog() {
  const logs = useAuditStore(s => s.logs);
  const setLogs = useAuditStore(s => s.setLogs);

  function recordAuditLog(fromStep: string | undefined, toStep: string, action: string) {
    const newLog: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      fromStep,
      toStep,
      action,
    };
    setLogs((prev) => [...prev, newLog].slice(-20));
  }

  return { logs, recordAuditLog };
}
