import { useLocalStorageState } from "./useLocalStorageState";

export interface AuditLogEntry {
  timestamp: string;
  fromStep: string | undefined;
  toStep: string;
  action: string;
}

export function useAuditLog() {
  const [logs, setLogs] = useLocalStorageState<AuditLogEntry[]>("procurement_lifecycle_audit_logs", []);

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
