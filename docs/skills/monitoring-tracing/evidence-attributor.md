# Monitoring & Tracing: Evidence Attributor

**Domain**: Monitoring

## Purpose
Enforces the mandatory logging of configuration modifications for forensics.

## Protocol: Evidence Attributor
- Every matched part, substituted part, or deleted part MUST be logged via `EvidenceAttributor.buildTrace()`.
- Logs unparseable anomalies via `ForensicAuditLogger` to feed the Self-Healing diagnostics loop.
