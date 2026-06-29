# VSIP Platform - AI Agent Engineering Guidelines & Project Learnings

> [!CAUTION]
> **MANDATORY PRE-FLIGHT CHECKS**: You MUST execute `npm run lint`, `tsc --noEmit --skipLibCheck`, `npm run build`, and all tests (`vitest` & `playwright`) before declaring any task complete. Skipping static analysis will result in rejected changes and broken pipelines. See Section 9 for full details.

Welcome, AI Coding Agent. This document outlines the critical architectural patterns, data contract boundaries, UI/UX guidelines, and lesson milestones of the **Vendor Solution Intelligence & Procurement Integrity (VSIP) Platform**. Adherence to these guidelines is strictly mandatory to prevent regressions, state mismatch, compilation failures, or layout defects.

---

## 1. Documentation Hierarchy & Anti-Monolith Guidelines

To prevent this file (`AGENTS.md`) from becoming an unreadable monolith, it strictly houses **architectural learnings, operational constraints, and engineering post-mortems**. 

For explicit product specifications, user stories, backend API payloads, and integration definitions, you MUST read the dedicated specification files directly instead of duplicating them here:
- **[Product Requirement Document (PRD)](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/specification/PRD.md)**: Defines all 12 platform modules, the UX philosophy (Cosmic Slate), and core business flows.
- **[Review Context & Developer Manual](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/specification/REVIEW_CONTEXT.md)**: Defines exact UI boundaries, API payloads, telemetry definitions, and data contracts.
- **[VSIP UI Testing Specification](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/specification/VSIP_UI_Testing_Specification.md)**: Defines all 19 test categories, coverage targets, and test pyramid rationale.

When updating `AGENTS.md`, do not copy-paste interfaces or definitions from the specifications folder. Simply link to them using standard markdown file links (e.g. `[PRD](file:///...)`) to keep guidelines focused and efficient.

## 2. Continuous Auditing & Zero-Tolerance for Silent Misses
**Why this exists**: In Phase 6, AI agents missed critical decoupling architecture and state mutability bugs because they assumed Vitest passing "Happy Paths" meant the code was perfect.
- **Rule**: Do NOT wait for manual code reviews to discover gaps. You must *proactively* run `npx eslint src` (which is powered by SonarJS) to identify cognitive complexity, code smells, and unhandled promises.
- **Rule**: A passing test suite is meaningless if it doesn't test failure states. All UI data flows MUST mock API rejections and assert that the UI gracefully catches them and rolls back state.

---

## 3. Core Data Schemas & Relational Boundaries

The master types are declared inside `/src/types/data.ts`. Do NOT introduce external or improvised schemas. Below are the critical database contracts:

### 3.1 CatalogSKU Schema
Represents standard, canonical parts verified in the central inventory.
> [!NOTE]
> See [data.ts](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/types/data.ts) for the full `CatalogSKU` interface.
*   **LEARNING**: Never expect `description`, `category`, `baseUSD`, or `vendorId` attributes on `CatalogSKU`. Historically, `SchemaValidator.tsx` checked these mismatched fields, causing 100% false-positive evaluation reports. Always check for `name`, `type`, `price`, and `vendor` instead.

### 3.2 Unified Configuration Identifier (UCID)
> [!NOTE]
> See [core.ts](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/types/models/core.ts#L247-L331) for the full UCID interface.
>
> See [core.ts](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/types/models/core.ts#L186-L240) for the SolutionProject interface.

---

## 4. UI / UX Design & Theme System (Cosmic Slate)

The platform employs a luxurious, eye-safe high-contrast dark palette to alleviate cognitive fatigue during high-volume contract review sessions.

*   **Background Canvas**: Primary off-black background `#03050a`. Secondary nested boards/cards must use `#070a13` and `#0b1220`.
*   **Color Codes**:
    *   *Sourcing Intel & Accents*: Indigo (`#4a85fd`) and deep purple/violet.
    *   *Compliance Success*: Emerald green (`#00d4a0`).
    *   *Warnings & Alerts*: Safety amber (`#ff9b36`).
    *   *Audit Violations & Errors*: Crimson high-luminance red (`#ff3d5a`).
*   **Non-Obtrusive Toasts**:
    *   `window.alert` is strictly banned due to iFrame embedding restrictions.
    *   Use the shared React `ToastContext` to prompt users via beautiful floating notifications.
    *   Initialize using: `const { success, warn, error } = useToast();`

---

## 5. High-Priority Learnings & Safe Coding Patterns

To prevent repeating historical regressions, strictly observe the following guidelines:

### 5.1 Avoid State & Prop Disconnect in Diagnostic Modules
*   **Issue**: Historical implementations of `ForensicView.tsx` computed issues from nested arrays locally, completely ignoring the `forensicIssues` and `setForensicIssues` passed down as global props. This severed the audit-trail binding and stopped "Auto-Align" fixes from updating the state in parent trees.
*   **Solution**: Always derive state from high-level props or context where applicable. Maintain synchrony across components.

### 5.2 Synchronous Gates & No Loading Flickers
*   **Issue**: `DataPersistenceGate` previously updated its check state from `'checking'` to `'healthy'` asynchronously inside an effect, producing a distracting visible flash screen on every master state re-render.
*   **Solution**: Since checking array integrity (`Array.isArray(ucids) && Array.isArray(vendors) ...`) runs instantaneously on CPU threads, compute this evaluation **synchronously** in the render cycle rather than wrapping it inside lazy `useEffect` state updates.

### 5.3 List Recalculation Performance (Use Memoization)
*   **Issue**: Components like `CatalogManager` filtered through thousands of items under deep taxonomic paths. Doing so without React `useMemo` resulted in severe layout stuttering during text search filters.
*   **Solution**: Always wrap high-computation array operations (like nested loops or matching matrices) inside an optimized dependency hook:
    ```typescript
    const filteredSkus = useMemo(() => {
      return catalogSkus.filter(sku => ...);
    }, [catalogSkus, searchTerm, selectedPath]);
    ```

### 5.4 Virtualization & ESM CJS Interop (React 19 Compatibility)
*   **Issue**: Previous projects failed in production or `npm run dev` because `react-window` used CommonJS wildcard imports (`import * as ReactWindow`) that crashed Vite ESBuild with "Cannot convert undefined or null to object" under React 19.
*   **Solution**: Do not use `react-window` in new developments. Instead, implement virtualization using **`react-virtuoso`**. It is inherently ESM-friendly, has native support for dynamic item resizing (removing the need for complex `itemSize` calculations), and gracefully supports React 19. Use `VirtuosoGrid` for cards and `Virtuoso` for standard rows.

### 5.5 Infinite Loop Prevention in Hooks
*   **Constraint**: Never declare raw objects or deep arrays directly inside a `useEffect` dependency array. Prefer primitive type matching (numbers, booleans, strings) or stable refs.

### 5.6 High-volume Ingestion and Exporter Pipelines
*   **Rule**: When downloading or compiling large PDF or spreadsheet lists, avoid dummy empty placeholders. Implement actual downloadable outputs (such as structured, neat CSV or formatted rich text files) using a clean, transient hidden `<a>` blob element to support client-only environments gracefully.

### 5.7 Human-in-the-Loop (HITL) Semantic Boundaries & Guardrails
*   **Issue**: Semantic rules added via natural language (Learning Loops) can easily bleed and corrupt unintended components if the schema doesn't lock the mapping level.
*   **Solution**: All Intelligence Injectors must enforce **Strict Scoping Fallbacks**. Never parse a raw string directly to a universal taxonomy target. Always engage in a UI Clarification Loop to demand the exact scope (e.g., "Global Brand", "Specific Category Only", "Exact SKU Match Only") before pushing the rule into a Draft/Quarantine state for blast radius simulation.

### 5.8 Zod Schema Strictness vs Dynamic Generation (Schema Drift)
*   **Issue**: Generating temporary tracking IDs like `dynamic-hub-UCID-2026-X` caused immediate "Session Data Corrupted" crashes in `DataPersistenceGate` because the generated strings violated the strict `UCIDSchema` regex boundaries (e.g. `^UCID-\d{4}-\d+$`).
*   **Solution**: Never dynamically prefix or suffix master identifiers bound to strict Zod regex schemas. If a UI component needs to track draft variants, use a separate tracking field, but always preserve the native `displayId`.

### 5.9 Cross-Component SPA State Synchrony
*   **Issue**: React's `useLocalStorageState` inherently only runs on mount. When updating shared storage keys (like `sys_sourcing_rules`) in one tab, other components in the SAME tab did not update, forcing users to hit `Ctrl+Shift+R` to refresh the layout.
*   **Solution**: The `useLocalStorageState` hook now mandates custom DOM events (`vsip_localstorage_update`) internally. Always use this wrapper instead of writing raw `localStorage.setItem` to ensure real-time global state synchronization across the platform.

### 5.10 Relaxed Component Filtering for Intake Tracking
*   **Issue**: `SolutionBuilder` strictly filtered out newly ingested BOQs because it checked if `configs.length > 0` (assuming step 1 was entirely processed). This led to missing active jobs visually.
*   **Solution**: UI filters must broadly accept tracking arrays (e.g. allowing empty configurations if the tracking reference exists) so users can see work-in-progress items across all views seamlessly.

### 5.11 No Artificial Delays or Frontend State Simulation
*   **Issue**: UI components frequently used `setTimeout`, `Math.random()`, and massive inline Mock Arrays to simulate API delays, randomize telemetry progress, or fuzzy-match catalog parts. This made the frontend rigid, bloated, and untestable.
*   **Solution**: **NEVER** use `Math.random()` or `setTimeout()` loops for progress tracking, ID generation, or API faking in the UI layer. 
    - Standard UUIDs must use `crypto.randomUUID()`.
    - Mock delays and progress simulations must be entirely delegated to the `apiClient` / MSW layer (`handlers.ts`). Note: MSW handlers themselves must execute state mutations synchronously to avoid unresolved promise locks during Vitest execution; any delay simulation must only occur at the network mock layer conditionally based on `process.env.NODE_ENV !== 'test'`.
    - Complex parsing (like NLP semantic parsing or deep object overrides) belongs strictly in the backend boundary. The UI must remain a dumb visualization layer reacting to external streams.

### 5.12 Mock Handler Separation & Shared State
*   **Issue**: MSW mock handlers were originally housed in arbitrarily named files like `handlersPart1.ts` and `handlersPart2.ts`, creating confusion and making it hard to locate domain-specific API endpoints. Furthermore, mutating array imports directly caused `TS2632: Cannot assign to imported variable`.
*   **Solution**: Enforce descriptive, domain-bound nomenclature for MSW handlers (e.g. `coreHandlers.ts`, `graphHandlers.ts`). State shared across multiple MSW handlers MUST be stored in `sharedState.ts` and mutated via pure methods (like `.splice`) rather than destructive reassignment to ensure module synchrony.

### 5.13 Unhandled Promise Rejections in Synchronous UI Handlers
*   **Issue**: UI components (like `CatalogManager`) utilized asynchronous API client methods (e.g., `apiClient.delete`) inside synchronous click handlers with synchronous `try/catch` blocks. This resulted in uncaught promise rejections that crashed tests and failed to handle backend errors correctly.
*   **Solution**: Never wrap detached asynchronous calls inside synchronous `try/catch` blocks without `await`. Always chain `.catch()` for detached promises in UI event handlers to ensure proper telemetry and error surfacing:
    ```typescript
    // BAD
    try { apiClient.delete(id) } catch (e) { ... } 
    // GOOD
    apiClient.delete(id).catch(e => console.error(e))
    ```

### 5.14 Synchronous Hook Hydration vs Microtasks
*   **Issue**: In `useIngestionLogic.ts`, setting default initial state inside a `useEffect` wrapped in `Promise.resolve().then(...)` caused E2E UI tests and Vitest logic tests to fail because they expect the DOM and State to hydrate immediately.
*   **Solution**: Never wrap state setters meant for initial or default synchronization inside asynchronous microtasks. Perform data hydration synchronously in the `useEffect` body to ensure perfect alignment with E2E assertions and avoid invisible "empty state" flashing.

---

## 6. Visual Regression Gate

Before a feature Phase is considered "done", a visual freeze gate must be passed to prevent continuous UI churn by AI agents.

*   **Requirement**: Screenshots of every view in its approved state must be verified against any changes.
*   **Checklist**:
    *   [ ] Do not modify any view that has an approved snapshot without explicit instruction.
    *   [ ] Any approved changes structure should have corresponding skills/specs updated in the [UI Component Registry](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/ui-component-registry.md).

---

## 7. (Merged into Section 11 - Mandatory Pre-Flight Verification)



## 8. Strict Data Hydration
*   **Rule**: NO HARDCODING. All domain data must be sourced either from API endpoints or structured mocks representing remote interfaces. View components must remain dumb representations of their properties.
*   **Playwright Browser Engine Logs**: Playwright static logs are MVP placeholder — Phase 2 will integrate real websocket/SSE streams from active browser instances.

---

## 9. Frontend Freeze Status
**FRONTEND FROZEN — All PRD scenarios implemented, all hardcoding removed, ready for backend**

---

## 10. Multi-Sheet Validation & Intricate Override Rules (HPE CLIC / Dell Ingest)

To ensure seamless coordination between frontend UI triage overlays and the backend parsing logic, observe the following engineering guidelines for workbook advice ingestion:

### 10.1 Sheet Filtering & Exclusions
*   **Behavior**: Validation workbooks (e.g., `CLIC_Advice_TempUCID.xlsx`) contain status summary sheets (e.g., `Information`) or taxonomy topology sheets. 
*   **Rule**: Exclude sheets named `Information`, `Summary`, `Topology`, `Taxonomy`, or `Comparison` (or index-based summary sheets). The UI parses and displays only the true `Advice_Text` and `BOM` sheets, and logs bypassed sheets as `ignoredSheets` to prevent layout corruption.

### 10.2 Heuristic Linking & Active BOM Indicators (Preventing Cross-Pollution)
*   **Behavior**: Warnings are linked to specific configuration components inside a UCID by checking SKU occurrences. 
*   **Rule**: Product Numbers parsed from advice warning logs must be cross-referenced case-insensitively with active BOM items. If the target warning SKU matches a part number in the active configuration, display a visual **"In Active BOM"** badge to establish direct context.

### 10.3 "Advice within Advice" & AND/OR Operator Resolution
*   **Behavior**: Validation messages frequently specify outer chassis rules that require selecting one or more options from a sub-list (e.g., choosing 1 Ambient Temperature Config Trk from 6 alternative SKUs, or adding both MR416i-o and MR416i-p controllers).
*   **Rule**:
    *   **Intricate Option Parsing**: Extract lines containing SKU patterns (`[a-zA-Z0-9]{5,8}-[a-zA-Z0-9]{3,4}`) and clean descriptions from advice message bodies.
    *   **Logical Operators**: Provide the human with an operator selector to format combinations:
        *   `OR` (Alternatives / Mutually Exclusive): Combines selected SKUs with pipe symbols (e.g., `SKU1 | SKU2 | SKU3`).
        *   `AND` (Joint Requirements): Combines selected SKUs with commas (e.g., `SKU1, SKU2`).
    *   **Zod Perfection**: Ensure all payloads, overrides, and CLI scripts conform strictly to TypeScript models and Zod schemas in `data.ts` and `zodSchemas.ts` without using raw `any` types.


---

## 11. Mandatory Pre-Flight Verification (Ownership & Quality Control)

To prevent architectural regression, broken types, and memory leaks from bleeding into the master branch, all AI agents must assume full ownership of code quality by adhering to the following strict, sequential pre-flight protocols before completing ANY task:

### 11.1 The Master Pre-Flight Checklist
You must execute these exact commands in this order before finishing:
1.  **Static Analysis**: `npm run lint` (Ensures zero TypeScript drift. If it fails, halt and fix).
2.  **Production Build**: `npm run build` (Ensures Vite and ESBuild compilation succeeds).
3.  **Unit & Component Tests**: `npm run test:vitest` (Validates pure functions, hooks, and isolated UI components).
4.  **End-to-End Tests**: `npm run test:e2e` (Validates full Playwright browser workflows).

### 11.2 Zero Tolerance for TypeScript Drift
*   **Rule**: Never declare a task "complete" without passing `npm run lint`.
*   **Action**: If the linter reports any errors (e.g., missing props, incorrect schema derivations, or failed third-party imports), you must halt, fix the types, and re-run until it passes 100%. Keep all modifications clean, explicit, and perfectly typed. Never leave dangling comments such as `style-=` or malformed JSX statements.

### 11.3 Comprehensive Test Harness Execution
*   **Rule**: Code logic changes require a functional test run.
*   **Action**: Any crash indicating "Element type is invalid", or failing component tests, MUST be analyzed and resolved. Do not skip `test:e2e` even for minor layout changes.

### 11.4 Test Assertion Strictness (The "Happy Path" Fallacy)
*   **Issue**: Previous test suites attained 100% E2E and Unit coverage by only asserting the "Happy Path" (e.g. mocking `apiClient` to always return success, or testing lists with identically typed mock arrays). This masked critical bugs like optimistic UI rollbacks failing and inverted filters.
*   **Rule**: Every test suite verifying UI mutability MUST test pessimistic pathways. 
    - You must mock `apiClient` to reject with an error and explicitly assert that the UI rolled back correctly and surfaced a Toast. 
    - You must construct diverse `mockData` sets (e.g. not just `type: 'Chassis'` arrays) to ensure taxonomy gates don't inadvertently cull sibling components.

### 11.5 Functional vs Architectural Validation
*   **Rule**: A passing Vitest suite does not equal "done". Vitest validates the DOM structure but ignores memory leaks, arbitrary row math, or re-renders. Agents must manually verify the codebase adheres to the strict architectural guidelines (like utilizing `VirtuosoGrid` exclusively for lists, moving constants outside render lifecycles, and replacing `framer-motion` infinite loops with native CSS).

---

## 12. Backend Delegation Rules (Phase 5 Offloading)

The UI layer is strictly a visualization and interaction engine. Any intensive logic or binary extraction must be built by the backend team tomorrow:

### 12.1 Generic Advice Sheet Parsing
*   **Backend Responsibility**: The Backend (`ExcelParserService`) must handle the extraction of warnings, AND/OR logic constraints, and SKU patterns from uploaded Vendor validation workbooks (CLIC, Premier, CCW) and return them as generic `AdviceResolution` JSON arrays. 
*   **Frontend Responsibility**: The UI strictly consumes the structured generic format and displays interactive Splicing/Override panels linked to the Active BOM.

### 12.2 PDF / CSV Snapshot Exports
*   **Backend Responsibility**: The Backend (`BlobGeneratorService`) must process immutable `Snapshot` objects and stream back fully formatted PDF or CSV byte blobs.
*   **Frontend Responsibility**: The UI only handles the download triggers (transient `<a>` tags) fetching from the Backend. Do not construct heavy multi-page PDFs using client-side JavaScript.

---

## 13. Strict UI/UX and Component Architecture Mandates

As of Phase 7 (Refactoring & Perfection), the following structural rules are completely non-negotiable:

### 13.1 Absolute Component Size Limits (The 400-Line Rule)
*   **Rule**: NO file in the repository shall exceed **400 lines of code**. This is an absolute mandate to ensure high-quality coding design architecture. It applies to **ALL files**, including React components, `types`, Zod schemas, mock data (`mockData.ts`), MSW handlers (`handlers.ts`), and especially `__tests__` files.
*   **Action**: If a file approaches this limit, you must halt feature development and decompose it logically by domain. Monolithic "God Components" or "God Files" are strictly banned. For example, test suites should be split by behavior, and schema files by bounded context.

### 13.2 Zero `any` Type Tolerance
*   **Rule**: The `any` type is strictly forbidden across the entire `src/` directory.
*   **Action**: Use precise Zod-backed interfaces (e.g., `CatalogSKU`, `GraphNode`). If an external payload is truly dynamic, use `unknown` and perform runtime type narrowing or validation.

### 13.3 Accessibility (a11y) & Interactive Elements
*   **Rule**: All interactive elements (`<button>`, custom `<div>` clickables, modals, and tabs) MUST include proper accessibility attributes.
*   **Action**: 
    - Inject `aria-label` or `aria-labelledby` on all icon-only or custom buttons.
    - Ensure keyboard navigation (`tabIndex={0}`) and `onKeyDown` listeners are implemented for custom `div` buttons.
    - Do not rely solely on color or layout to convey state changes to screen readers.

### 13.4 Taxonomy Graph CRUD Boundaries
*   **Rule**: The UI must never compute isomorphic graph paths, resolve orphaned node relationships, or calculate taxonomy weights locally.
*   **Action**: All Graph interactions (Adding Nodes, Updating Edges, Fetching Paths) must be routed through `apiClient.ts` to the Backend/MSW layer. The UI's `useCatalogGraphData.ts` hook acts solely as a synchronization wrapper, passing generic IDs and payloads.

### 13.5 Intelligence Parsing Boundary
*   **Rule**: The UI must strictly act as a dumb visualization layer for heuristics and learning loops. It must never parse raw natural language strings directly to taxonomy targets using local regex or logic.
*   **Action**: The `NLPParser` and `LearningLoopInjector` components must offload rule generation strictly to the Backend API layer (`/api/agents/semantic-map` and `/api/agents/run`), exactly mirroring the Graph constraints.

### 13.6 Zero-Prop Drilling for Global State (Zustand)
*   **Rule**: Global data domains (e.g., `ucids`, `vendors`, `sourcingRules`, `forensicIssues`) MUST NOT be passed down through React `props` to deeply nested components.
*   **Action**: Any component that requires access to global platform data must consume it directly via `useCoreStore((s) => s.propertyName)`. Top-level layouts (like `App.tsx` or `MissionControl.tsx`) are forbidden from declaring these objects in their children's `interface Props` to prevent massive cascading re-renders and state desyncs.

### 13.7 Static / Dynamic Loading & Bundle Chunking Guardrails
*   **Rule**: Heavy third-party utility modules (like `xlsx` or `exceljs`) that are only used in user interaction handlers (e.g., file intake, download/exports) MUST NOT be statically imported directly.
*   **Action**: 
    - Use type-only imports at the top level for type checking (e.g., `import type * as XLSXTypes from 'xlsx';`).
    - Load the runtime module dynamically inside the asynchronous event handlers (e.g., `const XLSX = await import('xlsx');`).
    - Define dedicated `manualChunks` in the bundler's output configuration (e.g., `vite.config.ts`) for large dependencies to enable persistent browser caching.

---

## 21. The Proactive Senior Architect Mandate (June 2026 Core Directive)

As the officially designated **Senior Architect & Seniormost Designer** for the VSIP Platform, the AI coding agent must operate with full architectural authority and proactive foresight.

### 21.1 Do Not Wait for Audits
*   **Rule**: Never limit your powers or wait for external review (e.g., Claude, Codex, or human PR reviews) to identify systemic gaps.
*   **Action**: Treat every localized prompt as an opportunity for systemic validation. If a localized fix requires refactoring a monolith, repairing ARIA attributes, or replacing legacy hooks (like `useLocalStorageState`), you are pre-authorized to aggressively refactor the surrounding environment. 

### 21.2 Enforce "Test-in-a-Loop" Perfection
*   **Rule**: Writing code without ensuring cross-component blast radius validation is unacceptable.
*   **Action**: Continue testing in a continuous loop using `npm run test:vitest` and `npm run lint`. Do not stop when a superficial test passes. Intentionally write varied and robust edge-case tests to guarantee the system works seamlessly across all workflows. You own the CI pipeline outcome.

### 21.3 Eliminate "Duct-Tape" and "Happy Path" Bias
*   **Rule**: Never patch a symptom without curing the disease.
*   **Action**: If you identify `setTimeout`, `Math.random()`, `any` typing, missing Zero-State UIs, or stale closures, rip them out entirely. Implement modern, state-of-the-art patterns (MSW backend streaming, strict Zustand caching, Framer Motion) proactively. Plan meticulously before execution so nothing is missed.

---


---

## Supplemental Documentation
- For historical phase learnings and post-mortems, see [Phase Learnings](docs/phase-learnings.md)
- For test registries, tech stack, and state architecture, see [Test Registry](docs/test-registry.md)
### 10.4 Quantity-Based Configuration Forking (1-to-N Mapping)
*   **Behavior**: Real-world BOQs frequently contain high-quantity identical server requests (e.g., 22x DL380 Gen12). However, customer-specific constraints (e.g., only 5 servers require specific transceivers) force the vendor to split the BOM into multiple distinct configurations.
*   **Backend Responsibility**: The Ingestion/Parsing layer MUST support 1-to-N splitting. A single BOQ line item quantity (22) must be allowed to map to multiple separate UCID containers (Qty 5 + Qty 17) with divergent SKU attachments (e.g., transceivers).
*   **Frontend Responsibility**: The Reconciliation Engine (`ReconciliationView.tsx`) must aggregate the quantities of split BOM variants to ensure the sum matches the original BOQ request (5 + 17 = 22) before flagging a "Qty Delta" error.

---

## 14. Interactive Splicing Workshop & Event Sourcing Ledger

To prevent data corruption during human-in-the-loop BOQ adjustments (like removing items, overriding quantities, or injecting custom catalog parts), the frontend adheres to an **Immutable Audit Trail** pattern.

### 14.1 Immutable Event Dispatch (No Deep Mutation)
*   **Rule**: Never deeply mutate the master `ParsedBOQ` object directly in memory when a user edits quantities or removes items.
*   **Action**: Instead, UI interactions generate strongly-typed subclassed events conforming to `CleansingEvent` schemas (e.g., `QuantityUpdateEvent`, `ItemRemovalEvent`). These events are aggregated in a batch array (`activeEdits`) and presented to the backend API (`/api/agents/cleansing/commit`). The backend is responsible for replaying these events to generate the canonical solution manifest.

### 14.2 1-to-N Config Forking (Split Wizard)
*   **Behavior**: Users can utilize the "Deep Cleanse Editor" and the "Split Config Wizard" to diverge a base multi-server BOQ (e.g., Qty 22) into sub-configurations (e.g., 5 and 17).
*   **Constraint**: The `SplitConfigEvent` enforces mathematically sound division. The sum of the `moveQuantities` and the remaining quantities in the base configuration MUST never exceed the original parent component limit. Front-end range sliders automatically cap maximum values to the parent limit, but the validation schema strictly asserts this at runtime before network dispatch.
