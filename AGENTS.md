# VSIP Platform - AI Agent Engineering Guidelines & Project Learnings

> [!CAUTION]
> **MANDATORY PRE-FLIGHT CHECKS**: You MUST execute `npm run lint`, `tsc --noEmit --skipLibCheck`, `npm run build`, and all tests (`vitest` & `playwright`) before declaring any task complete. Skipping static analysis will result in rejected changes and broken pipelines. See Section 9 for full details.

> [!IMPORTANT]
> **DEV SERVER PORT IS 3000 — NOT 5173.** `npm run dev` runs `tsx server.ts` (an Express + Vite middleware stack), which binds to **http://localhost:3000**. This is NOT a standard Vite dev server. Vite's default port 5173 is never used — the Vite instance is embedded inside Express as `middlewareMode: true`. Any browser automation, Playwright tests, API calls, or agent navigation MUST use `http://localhost:3000`. Using port 5173 will result in `ERR_CONNECTION_REFUSED`.

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
*   **Cosmic Slate vs. Tailwind Primitives**: Do not use raw Tailwind gray, slate, blue, or purple classes (e.g., `bg-gray-800`, `text-blue-500`). All UI components MUST exclusively use the native semantic class names generated by the CSS `@theme` variables (e.g., `bg-surface-canvas`, `bg-surface-elevated`, `text-content-secondary`, `bg-brand-indigo`). This guarantees consistent layering and dark mode contrast across the application.
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
*   **LEARNING (Accessibility Fixes & Snapshot Staleness)**: Playwright's `toHaveScreenshot` is a strict pixel-perfect gate configured with a zero-tolerance `maxDiffPixels` limit. It will intentionally **fail** the build (and will NOT automatically ignore changes) if you alter colors, padding, or typography to meet WCAG accessibility contrast constraints (such as changing foreground text to pass the 4.5:1 ratio). When making deliberate stylistic or accessibility repairs, you MUST proactively execute `npx playwright test tests/e2e/visual.spec.ts --update-snapshots` to re-certify the new visuals as the approved baseline, otherwise the visual gate will permanently block the pipeline.

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

### 11.6 API Boundary Validation & Strict MSW Assertions (Phase 3b/6)
*   **Issue**: Permissive MSW mocks (which often ignore request bodies or return flattened convenience objects) masked critical API payload misalignments where the UI sent loose strings to endpoints expecting strict Enums, or read from convenience fields that don't exist on the real `server.ts` response.
*   **Rule**: You MUST execute Zod schema validation (e.g., `validateBody`) at the UI boundary *before* making the API call, converting and narrowing loose types before they hit the network.
*   **Rule**: When writing integration tests against MSW, strictly assert the response shape against what the real backend `server.ts` returns, not the convenience objects generated by `msw`. Apply a "revert-and-confirm-fail" methodology: always confirm the test fails when the bug is re-introduced.

### 11.7 Playwright E2E & Visual Testing Skill
*   **Rule**: Playwright-specific rules (actionability, wait constraints, MSW isolation, strict accessible name matching, global state flakiness, and visual screenshot instability) have been migrated out of this file to prevent it from becoming an unreadable monolith.
*   **Action**: You MUST read and follow `.agents/skills/playwright-debugging/SKILL.md` when debugging or writing any End-to-End or Visual Regression tests.

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
    - Prefer native `<button type="button">` tags over custom `<div onClick={...}>` elements to automatically inherit keyboard (`Enter`/`Space`) event listeners and satisfy `jsx-a11y/no-static-element-interactions`.
    - Ensure keyboard navigation (`tabIndex={0}`) and `onKeyDown` listeners are implemented only if a custom `div` button is completely unavoidable.
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
*   **Corollary — no direct mock-array imports**: Components and hooks MUST NOT `import` an entity seed array (catalog, vendors, solutions, ucids, forensic issues, sourcing rules) directly from `src/lib/mockData/*`. Those files exist solely to seed `coreStore.ts` once, at init. The one exception is genuinely static, never-mutated config/reference constants (e.g. `STEP_ORDER`, `UCID_STEPS`, `CATALOG_TREND`) — those are configuration, not entity data, and are fine to import directly.

### 13.6a Single Ownership for Simulated-Backend Layers
*   **Rule**: `api-mock.ts`, MSW route handlers, and `server.ts` MUST NOT maintain an independent copy of any entity array already owned by `coreStore.ts`. There is exactly one source of truth for entity data; the simulated-backend layer either seeds from it, defers to it, or acts as a stateless pass-through — it never forks its own competing copy (this is precisely how the `api-mock.ts` catalog/solutions divergence and the `CatalogManager` price-rollback bug happened: a pre-Zustand mock catalog was never retired when `coreStore` became the source of truth).
    > [!IMPORTANT]
    > For the full investigation trail and rules enforcing this, read:
    > - **[Data Ownership Hierarchy](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/architecture/data-ownership.md)**
    > - **[Data Architecture & Migration Plan](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/architecture/data-architecture-plan.md)**
*   **Action**: Entity-CRUD MSW/`server.ts` handlers accept the payload and echo it back (`wrapSuccess(payload)`), or read from data explicitly passed in by the caller. They must not `find()`/`filter()` against a hand-seeded local array using ids that may not match `coreStore`'s.
*   **`server.ts` vs. MSW**: `server.ts` is the designated seam for future real-backend logic (it is a real Node process and can eventually perform real work; MSW is browser-sandboxed and structurally cannot). MSW route handlers must not duplicate a route `server.ts` already implements — MSW's `onUnhandledRequest: 'bypass'` means a duplicate MSW handler permanently shadows the real one during development.

### 13.6b Async Job Progress
*   **Rule**: Long-running or multi-step operations (BOQ/PDF ingestion, multi-vendor solution generation, CLIC/compatibility checks, Playwright automation runs) MUST be modeled as jobs (`POST → job_id → progress updates`), never as a single synchronous request/response — even while mocked as near-instant. This keeps a future real-backend integration a timing change, not a structural rewrite.
*   **Action**: All job progress must flow through `apiClient.streamJob()`'s existing `onMessage`/`onError` interface. Components (e.g. `JobStreamer.tsx`) must only depend on that interface, never on `setInterval` or a one-shot `fetch` written locally. The *implementation* behind `streamJob()` may change (single GET today, real `EventSource`/WebSocket/polling loop later) without requiring any component changes.

### 13.7 Static / Dynamic Loading & Bundle Chunking Guardrails
*   **Rule**: Heavy third-party utility modules (like `xlsx` or `exceljs`) that are only used in user interaction handlers (e.g., file intake, download/exports) MUST NOT be statically imported directly.
*   **Action**: 
    - Use type-only imports at the top level for type checking (e.g., `import type * as XLSXTypes from 'xlsx';`).
    - Load the runtime module dynamically inside the asynchronous event handlers (e.g., `const XLSX = await import('xlsx');`).
    - Define dedicated `manualChunks` in the bundler's output configuration (e.g., `vite.config.ts`) for large dependencies to enable persistent browser caching.

### 13.8 Cognitive Complexity & Nested Logic Mitigation
*   **Rule**: ESLint enforces a strict maximum cognitive complexity of 15 per function to prevent unmaintainable spaghetti logic.
*   **Action**: You MUST proactively extract nested logic (such as deep `if/else` conditionals, `try/catch` blocks inside mapping operations, or inline JSX renders) into dedicated helper functions or sub-components. Do not allow single functions to balloon in complexity. Extraction should happen within the same module if it's tightly coupled, or in a shared utility if it's universally applicable.

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

---

## 15. Schema Drift & State Mismatch Mitigation (Solution-First Architecture)

To resolve data integrity issues and UI layout drifts uncovered during the Schema Drift Audit, strictly observe the following data contract and mutability rules:

### 15.1 Solution-First Relational Architecture
*   **Behavior**: Historically, components iterated directly over `ucids` to render pipelines, leading to orphaned elements and layout stuttering.
*   **Rule**: The primary organizational unit is the **Solution** (`SolutionProject`). UCIDs belong to Solutions. High-level dashboard layouts, project pipelines, and status reporting MUST iterate through `solutions`, rendering associated `ucids` only as nested members.

### 15.2 Immutable State Actions (ucidActions.ts)
*   **Behavior**: In early iterations, 15+ different files performed raw array mutations like `setUcids(prev => [...])`, leading to "Session Data Corrupted" schema drifts and missed status syncs.
*   **Rule**: Component files are strictly forbidden from writing direct array mapping functions for global stores (e.g., `useCoreStore`). All mutations to UCIDs must be dispatched through the unified action layer in `src/store/ucidActions.ts` (e.g., `advanceUcidStep`, `updateUcidField`, `commitUcidSnapshot`, `deleteUcid`).

### 15.3 Locked Snapshots (The Section 12 Guard)
*   **Rule**: Certified configurations (UCIDs with a snapshot containing `locked: true`) must NEVER be deleted, regressed, or structurally mutated. The action layer (`ucidActions.ts`) and the UI (`SolutionDetail.tsx` confirmation panel) must strictly block deletion/regression attempts if a locked snapshot exists, ensuring compliance with Supply Chain Audit Integrity.

---

## 16. Phase 9 Lint Remediation Learnings & Environment Setup

Recorded after the Phase 9 patch set (0001–0016) was applied on a fresh Linux clone.
These learnings are concrete operational rules, not aspirational guidelines.

### 16.1 `npm run lint` requires `tsc` in PATH — use `npm install` first
*   **Issue**: `npm run lint` expands to `tsc --noEmit --skipLibCheck && eslint src`. On
    Linux environments where TypeScript is not globally installed, this fails immediately
    with `bash: tsc: command not found` — even though `typescript` is in `devDependencies`.
*   **Rule**: Always run `npm install` before any lint/build command on a fresh clone or
    after applying a patch set. If the npm script still fails, fall back to
    `npx tsc --noEmit --skipLibCheck && npx eslint src`.

### 16.2 Correct patch-application sequence
*   **Issue**: Running `tsc --noEmit` immediately after `git am` on a patch set that adds
    new `devDependencies` (e.g., `fast-check`, `zustand` type updates) produces hundreds
    of `Cannot find module` type errors — not because the code is wrong, but because
    `node_modules` is stale.
*   **Rule**: The mandatory sequence when applying any patch set is:
    1. `git am <patches>`
    2. `npm install`
    3. `npx tsc --noEmit --skipLibCheck && npx eslint src`
    4. `npm run build`
    5. `npm run test:vitest`
    6. `npm run test:e2e`

    Never run step 3 before step 2.

### 16.3 Visual regression baselines are OS-specific — commit them in the same patch
*   **Issue**: Playwright's `toHaveScreenshot()` generates platform-specific baseline
    filenames: `*-chromium-linux.png` on Linux, `*-chromium-darwin.png` on macOS. A repo
    with only darwin baselines (from macOS CI) will fail all visual tests on Linux with
    `"A snapshot doesn't exist"` — even though the renders are pixel-perfect. The error
    is misleading; it looks like a code regression but is purely a missing baseline file.
*   **Rule**: After applying any patch set that modifies UI structure on a new OS:
    1. Run `npx playwright test tests/e2e/visual.spec.ts --update-snapshots`
    2. Commit the newly-generated `*-linux.png` baselines in the same commit or a
       follow-up commit with a message like `test(visual): add linux/chromium baselines`.
    3. Never leave baseline PNGs as untracked files — an untracked baseline is invisible
       to CI and will cause the same failure on every subsequent run.
*   **Note**: `--update-snapshots` only writes new files for platforms without a baseline;
    it re-certifies existing ones. It is safe to run without fear.

### 16.4 `jscpd` exit code 1 at 1 clone is the intentional floor — do not regress
*   **Issue**: `.jscpd.json` sets `"threshold": 0`, meaning any clone at all causes a
    non-zero exit. After Phase 9 reduced the clone count from 28 to 4 (0.15%), and a
    follow-up session (Phase 9 Clone Elimination) reduced it further to 1 (0.03%),
    `npm run lint:clones` still exits with code 1.
*   **Rule**: The authoritative metric is the **clone count in the jscpd summary table**,
    not the exit code. A count of **1** (the intentional Cleansing boundary sync, see §16.6)
    is the current approved floor. Do not treat a non-zero exit as a blocker unless the
    clone count has *increased* from this baseline.
*   **Current approved baseline** (post Phase 9 Clone Elimination): **1 clone, 0.03%** duplicated tokens.
    The surviving clone is the Cleansing match-status algorithm intentionally duplicated
    across `mockData.ts` and `graphHandlers.ts` (see §16.6).

### 16.5 Never delete exported types without `git log -S` proof they are dead
*   **Issue**: `IngestBOMRequest` and `IngestBOMResponse` in `src/types/models/api.ts`
    appeared unused to ESLint and grep across `src/`. Mechanical deletion without
    archaeology would have been fast but risky. The `git log -S` investigation confirmed
    they were scaffold-era manual interfaces superseded by Zod-derived `IngestRequest` /
    `IngestResponse` when `zodSchemas.ts` was introduced — never deleted at the time.
*   **Rule**: Before deleting any exported type, interface, or constant flagged as unused,
    run `git log --all -S "TypeName" --oneline` and trace the commit history. Only delete
    if the investigation explicitly confirms the type is a stale artifact with no planned
    integration surface. If the history is ambiguous, document it as "suspected dead" and
    leave it for a deliberate decision rather than guessing.

### 16.6 Cleansing mock computation: same algorithm, two call sites — keep them in sync
*   **Context**: `GET /api/cleansing/entries` in `graphHandlers.ts` (MSW layer) and
    `generateMockEntries()` in `mockData.ts` (UI layer) both compute match statuses from
    the same raw seed rows in `cleansingSeedData.ts`. Phase 9 deduped the seed rows but
    intentionally left the computation logic diverged because unifying it was a product
    decision, not a mechanical dedup.
*   **Decision (Phase 9 follow-up)**: The correct algorithm for both is catalog
    cross-reference — same logic as a real backend parser. The MSW handler now imports
    `CATALOG_SKUS` (a static never-mutated constant, permitted by §13.6) and applies
    the same `partNumber + vendor` lookup that `mockData.ts` uses.
*   **Rule**: Any future change to the match-status computation logic (thresholds,
    field names, status categories) MUST be applied to **both** files simultaneously:
    - [`src/components/cleansing/mockData.ts`](file:///home/vinodh/FigmaUxDesign/VendorSolutionFigmaStudio/src/components/cleansing/mockData.ts)
    - [`src/mocks/routes/graphHandlers.ts`](file:///home/vinodh/FigmaUxDesign/VendorSolutionFigmaStudio/src/mocks/routes/graphHandlers.ts)


### 16.7 Clone Elimination Patterns: shared components and utilities, not wrappers
*   **Context**: Phase 9 Clone Elimination (follow-up to §16.4 baseline) identified 4
    actionable clones via `npm run lint:clones` (`jscpd`). The investigation revealed three
    categories of duplication:
    1. **Structural view boilerplate** (`ErrorBoundary` + `motion.div` wrapper): Eliminated
       by creating `AnimatedViewWrapper.tsx` in `src/components/shared/`. Both `ForensicView`
       and `VendorPortal` now delegate their outer animated wrapper to this shared component,
       removing `motion` imports from those files entirely.
    2. **Vendor-specific workspace card UI**: `CiscoWorkspaceNode` and `HpeWorkspaceNode`
       shared 14+ identical JSX lines for status badges, sequential execution lists, and
       progress tracker bars. Extracted into `WorkspaceNodeCard.tsx` in
       `src/components/ingestion/`. Each vendor node now passes its config array, synced
       count, subtitle, and value multiplier as props.
    3. **Deep-nested BOM repair map/reduce logic**: `useBomConversion.ts` and
       `useDrillDownAutoHeal.ts` both contained the exact same 34-line loop to call
       `repairBomItem`, recalculate `totalPrice`, and derive `savings` across all
       vendor submissions and configs. Extracted as `recalculateRepairedSolutions()` into
       `src/utils/bomRepairUtils.ts`, co-located with `repairBomItem`.
*   **Rule**: When `jscpd` reports clones, classify them before acting:
    - **Cross-boundary intentional clones** (UI layer vs MSW/mock layer): Do NOT unify —
      keep in sync via discipline (§16.6). Unifying would violate the MSW stateless boundary.
    - **Same-layer structural clones** (two view components share a JSX wrapper): Extract
      into a shared component in `src/components/shared/`.
    - **Same-layer logic clones** (two hooks share a helper function): Extract into the
      nearest logical utility module (e.g., `src/utils/`), not into the hook itself.
*   **Anti-pattern**: Do NOT resolve logic clones by importing one hook into another hook.
    Pure helper functions belong in `src/utils/`, not in `src/components/*/`.
*   **Unused import cleanup**: When removing inline implementations and replacing with a
    shared utility call, all previously required local imports (types, sub-utilities) become
    unused. Always clean them up immediately — ESLint's `sonarjs/unused-import` rule will
    catch any stragglers and cause lint failures if not addressed in the same commit.

---

## 17. Iteration 1 & 2 Remediation Learnings (Post-Mortem)

### 17.1 Zod Boundary Strictness (apiClient)
*   **Issue**: `apiClient.ts` previously caught schema validation errors, logged a warning, and blindly returned the unvalidated payload as `any/T`. This masked critical API contract drift and disabled pessimistic UI recovery testing.
*   **Rule**: API response parsers MUST explicitly `throw new Error()` on Zod validation failures. Never swallow schema mismatches. The UI must catch these errors and trigger user-facing recovery flows (e.g., Toast notifications).

### 17.2 Zustand Monolith Decomposition
*   **Issue**: `coreStore.ts` operated as a single "God Object" managing 7 disjointed domains. This triggered massive re-renders across the app when localized state (like a UI panel toggle) updated.
*   **Rule**: Never build monolithic state creators. State stores must be decomposed into logical domain slices (e.g., `catalogSlice`, `uiSlice`, `telemetrySlice`) and composed together at the store root. Maintain a flat public API (`useCoreStore`) for consumers while isolating internal update logic.

### 17.3 API Route Decomposition
*   **Issue**: `server.ts` became an unmanageable 700-line monolith housing all Express routes, leading to duplicated reconciliation logic.
*   **Rule**: Backend API routes must be modularized into domain-specific files under `src/server/routes/`. The main `server.ts` should only orchestrate middleware and router mounts.

### 17.4 jscpd Constraint & MSW Boundary
*   **Learning**: `jscpd` pipeline checks will fail on intentional cross-boundary code duplication (such as duplicating mock generator logic between `mockData.ts` and MSW handlers per Section 16.6).
*   **Rule**: When maintaining intentional MSW/UI isolation requires duplicating logic, explicitly wrap the MSW clone in `// jscpd:ignore-start` and `// jscpd:ignore-end` comments to bypass the linter without creating illegal cross-boundary module imports.


---

## 18. E2E Test Correctness & MSW Body Contract Learnings

### 18.1 MSW POST Handler Must Mirror Real Server Body Convention Exactly
*   **Issue**: `useSnapshotManagerLogic.ts` sends `{ snapshot: createdSnapshot }` to `POST /api/ucids/:id/snapshots`, matching the real server which destructures `const { snapshot } = req.body`. But the MSW handler was doing `addSnapshot(body as Snapshot)` — passing the entire `{ snapshot: {...} }` wrapper as the Snapshot, silently persisting garbage data in the mock server state.
*   **Why it was silent**: The optimistic `setUcids` runs synchronously before the API call, so the UI renders correctly even when server-side persistence is broken. Tests only checked UI state, not the MSW-received payload.
*   **Rule**: Every MSW POST/PATCH/PUT handler **must** mirror the exact body structure that the real `server/routes/*.ts` route expects. Before writing a handler, read the real route to see how it destructures `req.body`. Never cast `body as SomeType` blindly — always extract the field the real server expects (e.g., `const snapshot = body.snapshot ?? body`).
*   **Verification pattern**: After writing or changing an MSW handler, add a comment citing the real server's destructure: `// mirrors: const { snapshot } = req.body in server/routes/snapshots.ts`.

### 18.2 Playwright Toast Assertions Must Be Placed Immediately After the Triggering Action
*   **Issue**: Phase 6 of `master-lifecycle.spec.ts` asserted `getByText('locked & archived in CRM register')` AFTER clicking the lock toggle. But that toast is emitted by `handleCreateSnapshot` (on confirm click), not by `handleToggleLock`. By the time the lock click happened, the toast had already auto-dismissed.
*   **Why it's flaky**: Toast dismiss timing is environment-dependent. In fast machines with MSW delays disabled (`NODE_ENV=test`), the toast may still be visible when the lock click fires — making the test intermittently pass, masking the root cause.
*   **Rule**: Always place `await expect(page.getByText('...toast text...')).toBeVisible()` **immediately after the action that triggers it**, before any subsequent clicks. Trace the exact source method that emits the toast, confirm which user action calls it, and place the assertion directly after that action's click. Never assert a toast fired by Action A immediately after Action B.
*   **Verification pattern**: `grep -rn "toast message text" src/` to identify which method emits it, then verify the test places the assertion directly after the UI action that calls that method.

### 18.3 useForensicSync Race Condition — Auto-Learned Rules Must Gate Risk Re-Evaluation
*   **Issue**: `useForensicSync.ts` re-evaluated BOM risk on every UCID/vendor state change. When auto-heal replaced EOL SKU `815100-B21` with `P40424-B21` and marked `iss-1` as `resolved`, the sync hook ran again (triggered by `setUcids`) and could flip the issue back to `open` on the next render cycle since the EOL SKU was no longer in the BOM.
*   **Root Cause**: The hook depends on `ucids` which auto-heal mutates. The `setUcids` re-render triggered the hook, creating a race: "status = resolved" (from auto-heal) vs. the hook's re-evaluation of the same BOM data.
*   **Fix**: Before scanning for risk, check if an `isAutoLearned` sourcing rule already covers each issue. If it does, short-circuit the risk check to `false`:
    ```typescript
    const hasEolRule = sourcingRules.some(r => r.isAutoLearned && r.ruleType === 'substitution' && legacySKUs.includes(r.partNumber));
    const globalHasEol = !hasEolRule && ucids.some(...);
    ```
*   **Rule**: Any hook that re-evaluates forensic issues from raw BOM data MUST first check for auto-learned sourcing rule overrides before concluding an issue is still open. A confirmed human-approved rule always takes precedence over a heuristic BOM scan.

### 18.4 Surgical Selector Swap Anti-Pattern — `.first()` → `.last()` Is Never the Complete Fix
*   **Issue**: When Phase 6 failed because `.first()` matched a pre-existing mock snapshot instead of the newly created one, the fix was to swap to `.last()`. This was **necessary but not sufficient**. Adjacent assertions in the same `test.step` were not re-evaluated — the following assertion checked a toast that had already dismissed because it was emitted by the create action, not the lock action.
*   **Rule**: When changing a Playwright selector (`.first()` → `.last()`, adding a filter, changing role), **always re-read every assertion in the same `test.step` block** and verify each remains logically connected to the correct UI state and action. A selector swap can silently invalidate adjacent assertions.
*   **Verification pattern**: For each `await expect(...)` after the changed selector, ask: "Which source method fires this? Was it called before or after the point of my selector change?" Reorder or rewrite assertions to match the true execution order.

### 18.5 Always Confirm HTML Element Type Before Writing a CSS Selector in E2E Tests
*   **Issue**: `search.spec.ts` used `div.group\/result` but search result cards in `SearchView.tsx` are `<button type="button">` elements. The test failed not because the class was missing but because the element tag was wrong.
*   **Rule**: Before writing any CSS element+class selector in Playwright, grep the source component to confirm the HTML element type and exact class string. Prefer `data-testid` attributes to avoid fragile CSS selector dependency entirely.
*   **Verification pattern**: `grep -n "class-name-here" src/components/.../ComponentName.tsx` and inspect the element tag at that line before writing the selector.

### 18.6 Never Assert on HTML `title` Attribute for State-Change Verification in Playwright
*   **Issue**: Asserting `page.locator('button[title="Immutability Locked. Click to unlock"]').toBeVisible()` failed even after the React state updated `snap.locked = true`. The `button[title]` attribute is set by React as an HTML attribute, but Playwright's CSS attribute selector (`[title="..."]`) requires the browser's DOM to reflect it. Inside fixed/z-indexed slide-in drawers rendered via `AnimatePresence`, this attribute query was unreliable.
*   **Root Cause**: The `title` attribute is an HTML tooltip mechanism — it's not part of the visual render tree React uses to determine what's "visible". The test was using `[title="..."]` as a proxy for "the state changed", but the visual representation (button text) is far more reliable.
*   **Rule**: Never assert state changes using HTML `title` attribute selectors in Playwright E2E tests. Instead, assert on the **rendered visible text** inside the element. If `snap.locked` renders `<span>Locked</span>`, use `await expect(locator).toContainText('Locked')`. The rendered text is the authoritative signal that React has re-rendered with the new state.
*   **Verification pattern**: Open the source component, find the conditional render branch that reflects the new state, and assert on its visible text content or `data-testid`. Never use `title`, `aria-label`, or other non-rendered attributes as the primary state-change signal.
