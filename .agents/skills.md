# Agent Skills & Architecture Index (VSIP Platform)

Welcome, AI Agent. This is the master index for navigating the project's documentation, skills, and architectures. 

> [!CAUTION]
> Before modifying any component logic, state, or schema, you **MUST** consult the relevant specification links below to prevent architectural drift.

## 1. Core Architectural & System Guidelines
- **[AGENTS.md](../AGENTS.md)**: The ultimate source-of-truth for strict project rules, learnings, 400-line limits, error bounds, zero `any` tolerance, and test compliance. See especially §13.6/§13.6a/§13.6b for entity-data ownership rules.
- **[Data Ownership Hierarchy](../docs/architecture/data-ownership.md)**: **Read this before touching any entity data (catalog, vendors, solutions, ucids).** Explains why `coreStore` is the single source of truth, the `server.ts` vs. MSW distinction, and the git-forensic history of how this drifted before.
- **[Data Architecture Plan](../docs/architecture/data-architecture-plan.md)**: Full audit findings + 7-phase fix plan (0–6, all complete as of this writing) + the explicitly scoped, not-yet-done follow-up work (Phase 3b: MSW/server.ts route collisions; Phase 6 follow-up: remaining `parseResponse` call sites).
- **[PRD](../specification/PRD.md)**: Product specifications, Cosmic Slate UI themes, and system vision.
- **[Component Tree Map](../docs/component-tree.md)**: Detailed mapping of every component domain and sub-component dependency.

## 2. API, State, & Testing Contracts
- **[State Contracts](../docs/state-contracts.md)**: Zustand global state structure (`coreStore`), storage keys, and E2E injection methods.
- **[API Contracts](../docs/api-contracts.md)**: `apiClient` boundary rules, MSW endpoint mappings, and the taxonomy graph's client-side derivation (no longer a network API — see Section 5 for what changed and why).
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
1. `npm run lint` (`tsc --noEmit --skipLibCheck && eslint src`) must pass with 0 errors. **Run the real `npm run lint`, not just `tsc --noEmit`** — a real `react-hooks/refs` error sat undetected through several change sets in this codebase's history because only `tsc` was being checked, not `eslint`.
2. `npm run test:vitest` must pass (401 tests active as of the Phase 0–6 data-ownership cleanup; this number will drift, don't treat it as load-bearing — the point is 0 failures, not a specific count).
3. IDs must be generated via `crypto.randomUUID()`.
4. Never simulate delays with `setTimeout` in UI components. Delegated to `msw` handlers.
5. All file changes must be perfectly typed (No `any`).
6. Never `import` an entity mock array (catalog, vendors, solutions, ucids) directly into a component or hook — always `useCoreStore(s => s.X)`. Enforced by convention, not yet by lint; see AGENTS.md §13.6.
7. Never call `fetch()` directly in `src/components/**` or `src/hooks/**` — use `apiClient`. This one IS enforced by ESLint (`eslint.config.mjs`).
8. MSW route handlers and `server.ts` must never hold an independent copy of entity data `coreStore` already owns. See AGENTS.md §13.6a for why, with the specific incident this rule exists because of.
