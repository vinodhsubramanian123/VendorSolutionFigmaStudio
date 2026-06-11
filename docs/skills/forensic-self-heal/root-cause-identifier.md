# Forensic Self-Heal: Root Cause Identifier

**Domain**: Forensic / Self-Heal

## Purpose
Identifies the exact origin of a validation or portal execution failure.

## Protocol
- **Log Intersection Analysis**: Parses the `AuditResult` logs.
- **Phase Targeting**:
  - `Phases 1-3`: Mismatched Chassis/Gen (Treat all downstream errors as noise).
  - `Phase 6`: Missing rails, CMA, or PSU dependencies.
  - `Phase 9`: Multi-hop dependencies.
- **Output**: Generates a clinical, actionable string describing the root cause, ignoring the cascading downstream errors.
