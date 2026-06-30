import { useAuditStore } from "../store/auditStore";

export type ApplicationDiagnosticLevel = "info" | "warn" | "error";

interface ApplicationDiagnostic {
  level: ApplicationDiagnosticLevel;
  source: string;
  title: string;
  details?: string;
}

const MAX_DIAGNOSTIC_LOGS = 50;

export function recordApplicationDiagnostic({
  level,
  source,
  title,
  details,
}: ApplicationDiagnostic) {
  const action = details ? `${title}: ${details}` : title;

  useAuditStore.getState().setLogs((prev) => [
    ...prev,
    {
      timestamp: new Date().toISOString(),
      fromStep: source,
      toStep: level,
      action,
    },
  ].slice(-MAX_DIAGNOSTIC_LOGS));
}
