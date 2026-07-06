// Canonical AuditLogEntry shape, extracted from useAuditLog.ts to break a
// circular dependency: auditStore.ts used to import this type from
// useAuditLog.ts, while useAuditLog.ts imports useAuditStore from
// auditStore.ts. Moving the type to this neutral module, which depends on
// neither file, resolves the dependency-cruiser circular-dependency error.
export interface AuditLogEntry {
  timestamp: string;
  fromStep: string | undefined;
  toStep: string;
  action: string;
}
