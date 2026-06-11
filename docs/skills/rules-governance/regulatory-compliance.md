# Skill: Regulatory Compliance Engine

## 1. Domain & Purpose
This skill maps to `shared/engine/audit/auditors/RegulatoryComplianceEngine.ts` and `ComplianceAuditor.ts`.
It acts as the strict gatekeeper ensuring that all proposed BOQ line items comply with regional and international trade constraints.

## 2. Core Heuristics
- **TAA Compliance Check**: Enforces the Trade Agreements Act. If a contract mandates TAA compliance, any SKU flagged as `isTAA: false` in the Catalog must immediately trigger an `AuditSeverity.FATAL` error.
- **Data Sovereignty Guards**: Ensures storage and compute nodes allocated for Sovereign cloud deployments only utilize locally-certified OEM components (`isSovereign: true`).

## 3. Integration Points
- Called during Phase 12 of the `auditEngine.ts` pipeline.
- Synchronizes with the `CatalogIntegrityVerifier` to pull compliance flags from the remote Manufacturer Registry.

## 4. Architectural Rules
- Compliance violations can NEVER be "silenced" or "suppressed" by UI user overrides. They are hard blocks to BOQ graduation.
