# Agent Skills & Architecture Index (VSIP Platform)

Welcome, AI Agent. This is the master index for navigating the project's documentation, skills, and architectures. 

> [!CAUTION]
> Before modifying any component logic, state, or schema, you **MUST** consult the relevant specification links below to prevent architectural drift.

## 1. Core Architectural & System Guidelines
- **[AGENTS.md](../AGENTS.md)**: The ultimate source-of-truth for strict project rules, learnings, 400-line limits, error bounds, zero `any` tolerance, and test compliance.
- **[PRD](../specification/PRD.md)**: Product specifications, Cosmic Slate UI themes, and system vision.
- **[Component Tree Map](../docs/component-tree.md)**: Detailed mapping of every component domain and sub-component dependency.

## 2. API, State, & Testing Contracts
- **[State Contracts](../docs/state-contracts.md)**: Zustand global state structure (`coreStore`), storage keys, and E2E injection methods.
- **[API Contracts](../docs/api-contracts.md)**: Mock Service Worker (MSW) endpoint mappings, SSE handlers, and graph actions.
- **[UI States & Errors](../docs/ui-states.md)**: Zero-state render logic, skeleton fallbacks, and ErrorBoundary definitions.

## 3. UI Component Registry & Action Skills
Every UI component has a strict "Skill Contract" outlining its valid interactions and properties. 
- **[Full UI Component Registry](../docs/ui-component-registry.md)**

*Shortcuts to major feature domains:*
- [Dashboard & Telemetry](../docs/ui-specs/dashboard-skills.md)
- [Mission Control](../docs/ui-specs/mission-control-skills.md)
- [Solution Builder & Campaign Hub](../docs/ui-specs/campaign-hub-skills.md)
- [Taxonomy Graph Editor](../docs/ui-specs/taxonomy-graph-skills.md)
- [Forensics & Sourcing Rules Vault](../docs/ui-specs/sourcing-rules-skills.md)
- [Vendor Ingestion & Workbook Dropzones](../docs/ui-specs/boq-ingestion-skills.md)

## 4. Master Schema Data Models
Never duplicate these schemas. Import them directly or view them for structural truth:
- `src/types/data.ts`: Master TypeScript Interfaces.
- `src/types/zodSchemas.ts`: Runtime strict validation constraints.
- `src/types/schemas/schemaDTO.ts`: API request/response boundaries.

## 5. Development Reminders
1. `npm run lint` must pass with 0 errors.
2. `npm run test:vitest` must pass (311 tests active).
3. IDs must be generated via `crypto.randomUUID()`.
4. Never simulate delays with `setTimeout` in UI components. Delegated to `msw` handlers.
5. All file changes must be perfectly typed (No `any`).
