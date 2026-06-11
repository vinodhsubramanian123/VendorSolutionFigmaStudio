# Skill: Financial Auditor

## 1. Domain & Purpose
This skill maps to `shared/engine/audit/auditors/FinancialAuditor.ts`.
It acts as the authoritative financial ledger reconciliation layer, ensuring that the total hardware cost (Total MSRP) aligns perfectly with the Customer's allocated budget ceiling.

## 2. Core Heuristics
- **Overage Detection**: Generates `AuditSeverity.WARNING` if the BOQ Total MSRP exceeds the Budget Ceiling by < 5%, and `AuditSeverity.FATAL` if it exceeds > 5%.
- **Price Drift Calculation**: Compares the local `CatalogState` MSRP against the live Portal MSRP during checkout. If a price hike > $0.00 is detected dynamically, the transaction is halted.

## 3. Integration Points
- Fed directly by the `budget-constraint-modeller` skill.
- Communicates directly with the `SolutionScoringEngine` to heavily penalize over-budget generative alternatives.

## 4. Architectural Rules
- MSRP values must always be parsed as strict floating-point numbers. Never perform math operations on localized string formats (e.g. `$1,200.00`).
