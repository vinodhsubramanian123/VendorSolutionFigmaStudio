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

### 1.1 CatalogSKU Schema
Represents standard, canonical parts verified in the central inventory.
```typescript
export interface CatalogSKU {
  id: string;             // Internal Inventory SKU Primary Key (UUID)
  vendor: string;         // Sourcing Brand Reference e.g., "HPE", "Dell", "Cisco"
  partNumber: string;     // Canonical SKU (e.g. "P40424-B21")
  name: string;           // Formal description title (e.g. "Intel Xeon Gold 6430 CPU")
  type: string;           // Component classification e.g. "Chassis" | "Processor" | "Memory"
  price: number;          // Sourced base list price (USD)
  leadTimeDays: number;   // Supplier estimated fulfillment duration (number)
  status: 'active' | 'eol' | 'restricted'; // Lifecycle states
}
```
*   **LEARNING**: Never expect `description`, `category`, `baseUSD`, or `vendorId` attributes on `CatalogSKU`. Historically, `SchemaValidator.tsx` checked these mismatched fields, causing 100% false-positive evaluation reports. Always check for `name`, `type`, `price`, and `vendor` instead.

### 1.2 Unified Configuration Identifier (UCID)
```typescript
export interface UCID {
  id: string;             // Master UCID Job Hash
  displayId: string;      // Human indexing reference (e.g. "UCID-2026-1701")
  name: string;           // Customer-facing Solution layout name
  solutionName?: string;  // Sourced configuration group assignment
  priority: 'critical' | 'high' | 'medium' | 'low';
  projectRef: string;     // Internal SAP/Salesforce active Opportunity ID
  createdAt: string;
  currentStep: 'boq-intake' | 'pre-intelligence' | 'solution-design' | 'vendor-provisioning' | 'post-intelligence' | 'comparison' | 'snapshot';
  completedSteps: string[];
  rawBOM: string;         // Unstructured text data
  solutions: Solution[];  // Collection of auto-generated vendor design alternatives
  events: LogEvent[];     // Diagnostic telemetry log trails
  snapshots: Snapshot[];  // Locked completed contracts
  syncStatus?: 'Pending' | 'Synced' | 'Out-of-Sync' | 'Error';
}
```

---

## 2. UI / UX Design & Theme System (Cosmic Slate)

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

## 3. High-Priority Learnings & Safe Coding Patterns

To prevent repeating historical regressions, strictly observe the following guidelines:

### 3.1 Avoid State & Prop Disconnect in Diagnostic Modules
*   **Issue**: Historical implementations of `ForensicView.tsx` computed issues from nested arrays locally, completely ignoring the `forensicIssues` and `setForensicIssues` passed down as global props. This severed the audit-trail binding and stopped "Auto-Align" fixes from updating the state in parent trees.
*   **Solution**: Always derive state from high-level props or context where applicable. Maintain synchrony across components.

### 3.2 Synchronous Gates & No Loading Flickers
*   **Issue**: `DataPersistenceGate` previously updated its check state from `'checking'` to `'healthy'` asynchronously inside an effect, producing a distracting visible flash screen on every master state re-render.
*   **Solution**: Since checking array integrity (`Array.isArray(ucids) && Array.isArray(vendors) ...`) runs instantaneously on CPU threads, compute this evaluation **synchronously** in the render cycle rather than wrapping it inside lazy `useEffect` state updates.

### 3.3 List Recalculation Performance (Use Memoization)
*   **Issue**: Components like `CatalogManager` filtered through thousands of items under deep taxonomic paths. Doing so without React `useMemo` resulted in severe layout stuttering during text search filters.
*   **Solution**: Always wrap high-computation array operations (like nested loops or matching matrices) inside an optimized dependency hook:
    ```typescript
    const filteredSkus = useMemo(() => {
      return catalogSkus.filter(sku => ...);
    }, [catalogSkus, searchTerm, selectedPath]);
    ```

### 3.4 Virtualization & ESM CJS Interop (React 19 Compatibility)
*   **Issue**: Previous projects failed in production or `npm run dev` because `react-window` used CommonJS wildcard imports (`import * as ReactWindow`) that crashed Vite ESBuild with "Cannot convert undefined or null to object" under React 19.
*   **Solution**: Do not use `react-window` in new developments. Instead, implement virtualization using **`react-virtuoso`**. It is inherently ESM-friendly, has native support for dynamic item resizing (removing the need for complex `itemSize` calculations), and gracefully supports React 19. Use `VirtuosoGrid` for cards and `Virtuoso` for standard rows.

### 3.5 Infinite Loop Prevention in Hooks
*   **Constraint**: Never declare raw objects or deep arrays directly inside a `useEffect` dependency array. Prefer primitive type matching (numbers, booleans, strings) or stable refs.

### 3.5 High-volume Ingestion and Exporter Pipelines
*   **Rule**: When downloading or compiling large PDF or spreadsheet lists, avoid dummy empty placeholders. Implement actual downloadable outputs (such as structured, neat CSV or formatted rich text files) using a clean, transient hidden `<a>` blob element to support client-only environments gracefully.

### 3.6 Human-in-the-Loop (HITL) Semantic Boundaries & Guardrails
*   **Issue**: Semantic rules added via natural language (Learning Loops) can easily bleed and corrupt unintended components if the schema doesn't lock the mapping level.
*   **Solution**: All Intelligence Injectors must enforce **Strict Scoping Fallbacks**. Never parse a raw string directly to a universal taxonomy target. Always engage in a UI Clarification Loop to demand the exact scope (e.g., "Global Brand", "Specific Category Only", "Exact SKU Match Only") before pushing the rule into a Draft/Quarantine state for blast radius simulation.

### 3.7 Zod Schema Strictness vs Dynamic Generation (Schema Drift)
*   **Issue**: Generating temporary tracking IDs like `dynamic-hub-UCID-2026-X` caused immediate "Session Data Corrupted" crashes in `DataPersistenceGate` because the generated strings violated the strict `UCIDSchema` regex boundaries (e.g. `^UCID-\d{4}-\d+$`).
*   **Solution**: Never dynamically prefix or suffix master identifiers bound to strict Zod regex schemas. If a UI component needs to track draft variants, use a separate tracking field, but always preserve the native `displayId`.

### 3.8 Cross-Component SPA State Synchrony
*   **Issue**: React's `useLocalStorageState` inherently only runs on mount. When updating shared storage keys (like `sys_sourcing_rules`) in one tab, other components in the SAME tab did not update, forcing users to hit `Ctrl+Shift+R` to refresh the layout.
*   **Solution**: The `useLocalStorageState` hook now mandates custom DOM events (`vsip_localstorage_update`) internally. Always use this wrapper instead of writing raw `localStorage.setItem` to ensure real-time global state synchronization across the platform.

### 3.9 Relaxed Component Filtering for Intake Tracking
*   **Issue**: `SolutionBuilder` strictly filtered out newly ingested BOQs because it checked if `configs.length > 0` (assuming step 1 was entirely processed). This led to missing active jobs visually.
*   **Solution**: UI filters must broadly accept tracking arrays (e.g. allowing empty configurations if the tracking reference exists) so users can see work-in-progress items across all views seamlessly.

### 3.10 No Artificial Delays or Frontend State Simulation
*   **Issue**: UI components frequently used `setTimeout`, `Math.random()`, and massive inline Mock Arrays to simulate API delays, randomize telemetry progress, or fuzzy-match catalog parts. This made the frontend rigid, bloated, and untestable.
*   **Solution**: **NEVER** use `Math.random()` or `setTimeout()` loops for progress tracking, ID generation, or API faking in the UI layer. 
    - Standard UUIDs must use `crypto.randomUUID()`.
    - Mock delays and progress simulations must be entirely delegated to the `apiClient` / MSW layer (`handlers.ts`). Note: MSW handlers themselves must execute state mutations synchronously to avoid unresolved promise locks during Vitest execution; any delay simulation must only occur at the network mock layer conditionally based on `process.env.NODE_ENV !== 'test'`.
    - Complex parsing (like NLP semantic parsing or deep object overrides) belongs strictly in the backend boundary. The UI must remain a dumb visualization layer reacting to external streams.

### 3.12 Mock Handler Separation & Shared State
*   **Issue**: MSW mock handlers were originally housed in arbitrarily named files like `handlersPart1.ts` and `handlersPart2.ts`, creating confusion and making it hard to locate domain-specific API endpoints. Furthermore, mutating array imports directly caused `TS2632: Cannot assign to imported variable`.
*   **Solution**: Enforce descriptive, domain-bound nomenclature for MSW handlers (e.g. `coreHandlers.ts`, `graphHandlers.ts`). State shared across multiple MSW handlers MUST be stored in `sharedState.ts` and mutated via pure methods (like `.splice`) rather than destructive reassignment to ensure module synchrony.

### 3.11 Unhandled Promise Rejections in Synchronous UI Handlers
*   **Issue**: UI components (like `CatalogManager`) utilized asynchronous API client methods (e.g., `apiClient.delete`) inside synchronous click handlers with synchronous `try/catch` blocks. This resulted in uncaught promise rejections that crashed tests and failed to handle backend errors correctly.
*   **Solution**: Never wrap detached asynchronous calls inside synchronous `try/catch` blocks without `await`. Always chain `.catch()` for detached promises in UI event handlers to ensure proper telemetry and error surfacing:
    ```typescript
    // BAD
    try { apiClient.delete(id) } catch (e) { ... } 
    // GOOD
    apiClient.delete(id).catch(e => console.error(e))
    ```

---

## 4. Visual Regression Gate

Before a feature Phase is considered "done", a visual freeze gate must be passed to prevent continuous UI churn by AI agents.

*   **Requirement**: Screenshots of every view in its approved state must be verified against any changes.
*   **Checklist**:
    *   [ ] Do not modify any view that has an approved snapshot without explicit instruction.
    *   [ ] Any approved changes structure should have corresponding snapshots updated in `/docs/ui-snapshots/`.

---

## 5. (Merged into Section 9 - Mandatory Pre-Flight Verification)



## 6. Strict Data Hydration
*   **Rule**: NO HARDCODING. All domain data must be sourced either from API endpoints or structured mocks representing remote interfaces. View components must remain dumb representations of their properties.
*   **Playwright Browser Engine Logs**: Playwright static logs are MVP placeholder — Phase 2 will integrate real websocket/SSE streams from active browser instances.

---

## 7. Frontend Freeze Status
**FRONTEND FROZEN — All PRD scenarios implemented, all hardcoding removed, ready for backend**

---

## 8. Multi-Sheet Validation & Intricate Override Rules (HPE CLIC / Dell Ingest)

To ensure seamless coordination between frontend UI triage overlays and the backend parsing logic, observe the following engineering guidelines for workbook advice ingestion:

### 8.1 Sheet Filtering & Exclusions
*   **Behavior**: Validation workbooks (e.g., `CLIC_Advice_TempUCID.xlsx`) contain status summary sheets (e.g., `Information`) or taxonomy topology sheets. 
*   **Rule**: Exclude sheets named `Information`, `Summary`, `Topology`, `Taxonomy`, or `Comparison` (or index-based summary sheets). The UI parses and displays only the true `Advice_Text` and `BOM` sheets, and logs bypassed sheets as `ignoredSheets` to prevent layout corruption.

### 8.2 Heuristic Linking & Active BOM Indicators (Preventing Cross-Pollution)
*   **Behavior**: Warnings are linked to specific configuration components inside a UCID by checking SKU occurrences. 
*   **Rule**: Product Numbers parsed from advice warning logs must be cross-referenced case-insensitively with active BOM items. If the target warning SKU matches a part number in the active configuration, display a visual **"In Active BOM"** badge to establish direct context.

### 8.3 "Advice within Advice" & AND/OR Operator Resolution
*   **Behavior**: Validation messages frequently specify outer chassis rules that require selecting one or more options from a sub-list (e.g., choosing 1 Ambient Temperature Config Trk from 6 alternative SKUs, or adding both MR416i-o and MR416i-p controllers).
*   **Rule**:
    *   **Intricate Option Parsing**: Extract lines containing SKU patterns (`[a-zA-Z0-9]{5,8}-[a-zA-Z0-9]{3,4}`) and clean descriptions from advice message bodies.
    *   **Logical Operators**: Provide the human with an operator selector to format combinations:
        *   `OR` (Alternatives / Mutually Exclusive): Combines selected SKUs with pipe symbols (e.g., `SKU1 | SKU2 | SKU3`).
        *   `AND` (Joint Requirements): Combines selected SKUs with commas (e.g., `SKU1, SKU2`).
    *   **Zod Perfection**: Ensure all payloads, overrides, and CLI scripts conform strictly to TypeScript models and Zod schemas in `data.ts` and `zodSchemas.ts` without using raw `any` types.


---

## 9. Mandatory Pre-Flight Verification (Ownership & Quality Control)

To prevent architectural regression, broken types, and memory leaks from bleeding into the master branch, all AI agents must assume full ownership of code quality by adhering to the following strict, sequential pre-flight protocols before completing ANY task:

### 9.1 The Master Pre-Flight Checklist
You must execute these exact commands in this order before finishing:
1.  **Static Analysis**: `npm run lint` (Ensures zero TypeScript drift. If it fails, halt and fix).
2.  **Production Build**: `npm run build` (Ensures Vite and ESBuild compilation succeeds).
3.  **Unit & Component Tests**: `npm run test:vitest` (Validates pure functions, hooks, and isolated UI components).
4.  **End-to-End Tests**: `npm run test:e2e` (Validates full Playwright browser workflows).

### 9.2 Zero Tolerance for TypeScript Drift
*   **Rule**: Never declare a task "complete" without passing `npm run lint`.
*   **Action**: If the linter reports any errors (e.g., missing props, incorrect schema derivations, or failed third-party imports), you must halt, fix the types, and re-run until it passes 100%. Keep all modifications clean, explicit, and perfectly typed. Never leave dangling comments such as `style-=` or malformed JSX statements.

### 9.3 Comprehensive Test Harness Execution
*   **Rule**: Code logic changes require a functional test run.
*   **Action**: Any crash indicating "Element type is invalid", or failing component tests, MUST be analyzed and resolved. Do not skip `test:e2e` even for minor layout changes.

### 9.5 Test Assertion Strictness (The "Happy Path" Fallacy)
*   **Issue**: Previous test suites attained 100% E2E and Unit coverage by only asserting the "Happy Path" (e.g. mocking `apiClient` to always return success, or testing lists with identically typed mock arrays). This masked critical bugs like optimistic UI rollbacks failing and inverted filters.
*   **Rule**: Every test suite verifying UI mutability MUST test pessimistic pathways. 
    - You must mock `apiClient` to reject with an error and explicitly assert that the UI rolled back correctly and surfaced a Toast. 
    - You must construct diverse `mockData` sets (e.g. not just `type: 'Chassis'` arrays) to ensure taxonomy gates don't inadvertently cull sibling components.

### 9.6 Functional vs Architectural Validation
*   **Rule**: A passing Vitest suite does not equal "done". Vitest validates the DOM structure but ignores memory leaks, arbitrary row math, or re-renders. Agents must manually verify the codebase adheres to the strict architectural guidelines (like utilizing `VirtuosoGrid` exclusively for lists, moving constants outside render lifecycles, and replacing `framer-motion` infinite loops with native CSS).

---

## 10. Backend Delegation Rules (Phase 5 Offloading)

The UI layer is strictly a visualization and interaction engine. Any intensive logic or binary extraction must be built by the backend team tomorrow:

### 10.1 Generic Advice Sheet Parsing
*   **Backend Responsibility**: The Backend (`ExcelParserService`) must handle the extraction of warnings, AND/OR logic constraints, and SKU patterns from uploaded Vendor validation workbooks (CLIC, Premier, CCW) and return them as generic `AdviceResolution` JSON arrays. 
*   **Frontend Responsibility**: The UI strictly consumes the structured generic format and displays interactive Splicing/Override panels linked to the Active BOM.

### 10.2 PDF / CSV Snapshot Exports
*   **Backend Responsibility**: The Backend (`BlobGeneratorService`) must process immutable `Snapshot` objects and stream back fully formatted PDF or CSV byte blobs.
*   **Frontend Responsibility**: The UI only handles the download triggers (transient `<a>` tags) fetching from the Backend. Do not construct heavy multi-page PDFs using client-side JavaScript.

---

## 11. Strict UI/UX and Component Architecture Mandates

As of Phase 7 (Refactoring & Perfection), the following structural rules are completely non-negotiable:

### 11.1 Absolute Component Size Limits (The 400-Line Rule)
*   **Rule**: NO file in the repository shall exceed **400 lines of code**. This is an absolute mandate to ensure high-quality coding design architecture. It applies to **ALL files**, including React components, `types`, Zod schemas, mock data (`mockData.ts`), MSW handlers (`handlers.ts`), and especially `__tests__` files.
*   **Action**: If a file approaches this limit, you must halt feature development and decompose it logically by domain. Monolithic "God Components" or "God Files" are strictly banned. For example, test suites should be split by behavior, and schema files by bounded context.

### 11.2 Zero `any` Type Tolerance
*   **Rule**: The `any` type is strictly forbidden across the entire `src/` directory.
*   **Action**: Use precise Zod-backed interfaces (e.g., `CatalogSKU`, `GraphNode`). If an external payload is truly dynamic, use `unknown` and perform runtime type narrowing or validation.

### 11.3 Accessibility (a11y) & Interactive Elements
*   **Rule**: All interactive elements (`<button>`, custom `<div>` clickables, modals, and tabs) MUST include proper accessibility attributes.
*   **Action**: 
    - Inject `aria-label` or `aria-labelledby` on all icon-only or custom buttons.
    - Ensure keyboard navigation (`tabIndex={0}`) and `onKeyDown` listeners are implemented for custom `div` buttons.
    - Do not rely solely on color or layout to convey state changes to screen readers.

### 11.4 Taxonomy Graph CRUD Boundaries
*   **Rule**: The UI must never compute isomorphic graph paths, resolve orphaned node relationships, or calculate taxonomy weights locally.
*   **Action**: All Graph interactions (Adding Nodes, Updating Edges, Fetching Paths) must be routed through `apiClient.ts` to the Backend/MSW layer. The UI's `useCatalogGraphData.ts` hook acts solely as a synchronization wrapper, passing generic IDs and payloads.

### 11.5 Intelligence Parsing Boundary
*   **Rule**: The UI must strictly act as a dumb visualization layer for heuristics and learning loops. It must never parse raw natural language strings directly to taxonomy targets using local regex or logic.
*   **Action**: The `NLPParser` and `LearningLoopInjector` components must offload rule generation strictly to the Backend API layer (`/api/agents/semantic-map` and `/api/agents/run`), exactly mirroring the Graph constraints.

---

## 12. Phase 7 Gap-Analysis Fix Learnings (June 2026)

These patterns were identified during the comprehensive gap-analysis pass and must not regress.

### 12.1 Select Option Value Binding
*   **Issue**: `<option>` elements without explicit `value` attributes sent the display text (e.g., "HPE (Hewlett Packard Enterprise)") to state handlers instead of the canonical short-form key ("HPE"), causing downstream contract mismatches.
*   **Solution**: Every `<option>` in a controlled `<select>` MUST have an explicit `value` attribute. Example: `<option value="HPE">HPE (Hewlett Packard Enterprise)</option>`.

### 12.2 All ID Generation Must Use `crypto.randomUUID()`
*   **Issue**: Components like `IngestionHub`, `SourcingRulesVault`, and `SolutionBuilder` used `Date.now()`, `1700 + length`, or manual string concatenations to generate IDs, causing collisions in multi-UCID environments and Zod schema violations.
*   **Solution**: **All** new entity IDs (UCIDs, job IDs, rule IDs, conflict IDs) must be generated via `crypto.randomUUID()`. No manual ID arithmetic.
*   **CRITICAL FOLLOW-UP**: When migrating primary entities to UUIDs, be certain to update the UI (like `UcidContainerList`) to display `entity.displayId` rather than `entity.id`. Playwright E2E tests searching for human-readable regexes (like `/UCID-/`) will violently fail if the component renders the raw UUID instead.

### 12.3 Controlled Input Query Sync via `useEffect`
*   **Issue**: `SearchView.tsx` maintained internal query state independently of the `query` prop. When the parent programmatically updated the prop (e.g., from GlobalCommandPalette), the local input did not reflect the change.
*   **Solution**: Always add a `useEffect` to sync controlled input state when a prop can be updated externally:
    ```typescript
    useEffect(() => { setLocalQuery(query); }, [query]);
    ```

### 12.4 Derived State Initialization (No Hardcoded `true`)
*   **Issue**: `ReconciliationView.tsx` initialized `hasDrift` as `true` regardless of actual data, causing the "Drift Detected" banner to flash on first load even when all UCIDs were clean.
*   **Solution**: Always derive boolean flags from real data at initialization:
    ```typescript
    const [hasDrift, setHasDrift] = useState(() =>
      ucids.some(u => u.syncStatus === 'Out-of-Sync' || u.syncStatus === 'Error')
    );
    ```

### 12.5 ISO-8601 Timestamp Standardization
*   **Issue**: `mockData.ts` event timestamps mixed human-readable strings (e.g., "2 hours ago") with ISO-8601 strings, causing `new Date(...).toLocaleString()` to render as `"Invalid Date"` in telemetry views.
*   **Solution**: All `LogEvent.timestamp` values must be valid ISO-8601 strings (`"2026-06-17T10:00:00.000Z"`).

### 12.6 Component Decomposition Map (400-Line Compliance)
The following "God Components" were decomposed in Phase 7. This is the authoritative component map:

| Original File | Sub-Components Created |
|---|---|
| `SourcingRulesVault.tsx` | `AddRuleForm.tsx`, `RulesTable.tsx` |
| `CleansingView.tsx` | `MappingPanel.tsx`, `types.ts`, `constants.ts`, `mockData.ts`, `CleansingHeader.tsx`, `QualityMetrics.tsx` |
| `SystemTelemetry.tsx` | `DocumentPipelinePanel.tsx`, `ApiLogsTable.tsx`, `WebhookMonitor.tsx`, `types.ts` |
| `TaxonomyGraphSidebar.tsx` | `TaxonomyGraphPanels.tsx` (MechanicalConstraintsPanel, OrphanWorkshopPanel, PathOrchestratorPanel) |
| `BomReconciliationPanel.tsx` | `BomSummaryHeader.tsx`, `VendorDifferencesTable.tsx` |
| `Dashboard.tsx` | `UcidPipelineCard.tsx` |
| `CampaignConsolidationHub.tsx` | `CampaignHeader.tsx`, `ProcurementEvents.tsx`, `CostSavingMetrics.tsx` |

### 12.7 useEffect Dependency Safety in SolutionBuilder
*   **Issue**: `SolutionBuilder` listed `solutions` (an array) as a raw `useEffect` dependency. React recreates array references on every render, causing the effect to re-run infinitely.
*   **Solution**: Use `solutions.length` (a primitive) or `JSON.stringify(solutions)` as the dependency sentinel when you need to react to collection changes, or use a stable ref.


### 12.8 Vitest Deep Nested Mock Paths
*   **Issue**: When testing deeply nested components (like `src/components/forensics/__tests__/SourcingRulesVault.test.tsx`), using `vi.mock("../../services/apiClient")` silently created a dummy module rather than overriding the actual `apiClient`, causing tests that `await` API calls to hang and timeout.
*   **Solution**: Always ensure the relative path traverse goes all the way back to `src`. For a nested test file like `__tests__/ComponentName.test.tsx`, the path to services should be `../../../services/apiClient`.

### 12.9 Playwright E2E and Suspense Shimmer Blocks
*   **Issue**: Playwright mega-flow tests timed out expecting explicit text like `ACTIVE SOLUTION MISSION`, but the DOM rendered `<div class="animate-pulse bg-white/5...">` because `MissionControl` was stuck in a `Suspense` boundary due to missing or invalid UUID mappings passed from `IngestionHub`.
*   **Solution**: When creating new UCIDs or configurations, ensure that `displayId` and `id` remain consistent across state lifts. If `displayId` is strictly expected by the UI, but Playwright navigates via the raw UUID, the data persistence gates will trigger `Suspense` fallbacks instead of crashing, causing E2E tests to timeout rather than fail explicitly.

### 12.9 Zustand Global Persist and E2E State Injection
*   **Issue**: E2E tests manually dispatched `vsip_localstorage_update` events to clear global state (`sys_ucids`) or wrote directly to isolated keys. However, after migrating to Zustand `persist` middleware mapped to the `vsip-core-storage` key, these Playwright test state manipulations failed, causing components like `SolutionBuilder` to automatically bypass onboarding steps because they read the default `INITIAL_UCIDS` fallback state.
*   **Solution**: E2E Playwright tests must directly interact with the unified Zustand state key. To clear or mock global state, you must overwrite `vsip-core-storage` with the properly stringified JSON format (e.g., `localStorage.setItem('vsip-core-storage', JSON.stringify({ state: { ucids: [], ... }, version: 0 }))`) and invoke `page.reload()` to allow the core store to rehydrate.

---

## 13. Phase 8 UX Visual Upgrades Learnings (June 2026)

These patterns were identified during the comprehensive Framer Motion visual upgrade phase:

### 13.1 `AnimatePresence` and Virtualized Lists
*   **Issue**: `AnimatePresence` requires immediate direct children to be `motion` components to track exits. When dealing with highly optimized virtualized lists (e.g. `react-virtuoso` in `CatalogCardsList`), staggering list-item entry via a parent container isn't easily supported because `react-virtuoso` handles its own DOM windowing.
*   **Solution**: Do not attempt to use `AnimatePresence` stagger effects across virtualized rows. Instead, scope animations directly to individual card wrappers (e.g. `whileHover={{ y: -3 }}`) or use simple CSS animations for states like EOL pulsing (`animate-pulse-slow`).

### 13.2 Double Return Syntax Regression
*   **Issue**: When upgrading existing React nodes to `motion.div` via regex or strict string replacement, duplicating the `return (` statement causes a silent "Expression expected" TypeScript compilation failure.
*   **Solution**: Always verify the bounding JSX lines when replacing generic HTML tags with their `motion` equivalents. Run `npm run lint` immediately after any visual component swap.

### 13.3 `motion/react` Import Validation
*   **Issue**: Component conversions (like changing `div` to `motion.div`) naturally fail if the `motion` object isn't explicitly imported from `motion/react`.
*   **Solution**: Whenever refactoring a component for animations, add `import { motion } from 'motion/react';` at the top of the file before rendering the component.

### 13.4 Playwright E2E Flow Testing & Modal Blocking
*   **Issue**: Playwright tests timing out in Phase 5 (Auto-Heal & Learn) because the expected `marked End-of-Life` event was never intercepted or displayed. This occurred because clicking the "Auto-Align Component" button triggers the `RuleClarificationModal`, which inherently blocked execution until explicitly confirmed via the "Lock Intelligence Rule" button, a step missed by previous scripts.
*   **Solution**: Always model user interception modals explicitly in E2E flows. Add `await page.getByRole('button', { name: 'Lock Intelligence Rule' }).click()` prior to expecting downstream `LearningLoopFeed` asynchronous updates.

### 13.5 E2E Component Text Coupling (MSW Mocks)
*   **Issue**: Tests failed to find specific toast elements like "Snapshot Block Locked" or specific MSW learning text like "marked End-of-Life" because the mock implementation in `src/mocks/handlers.ts` or component UI returned dynamically constructed backend strings (e.g., `locked & archived in CRM register (optimistic)`).
*   **Solution**: Frontend string expectations in Playwright must strictly mirror exactly what the backend `handlers.ts` produces or what `SnapshotManager.tsx` issues via the `ToastContext`. When building out integration tests across 6 distinct states, use partial generic matching (`exact: false`) tied closely to the exact phrase produced by the mock server or use proper `data-testid` values.

### 13.6 Test Resilience & Hardcoded Strings (data-testid)
*   **Issue**: End-to-End Playwright tests originally relied heavily on `page.getByText()` and `page.locator('button[title="..."]')`. This created fragile tests that would break anytime marketing copy, tooltips, or visual labels were updated, slowing down continuous integration.
*   **Solution**: Core interactive elements (e.g., `Execute Compliance Scan`, `Capture Snapshot`) must be decoupled from UI copy by using `data-testid` attributes (e.g., `data-testid="btn-execute-scan"`). Always use `page.getByTestId()` in the Playwright suite to ensure robust integration testing immune to cosmetic adjustments.

---

## 14. Phase 9 Testing Hardening Learnings (June 2026)

These patterns were identified during the Zod integration and Integration test stabilization pass:

### 14.1 Aria-Label Query Precedence
*   **Issue**: Vitest and Playwright `findByRole` or `getByRole` selectors timed out when searching for text like `/Split Configs/i` on a button. This occurred because the button had an `aria-label="Split configurations into active UCIDs"`, which overrides the text content in accessibility trees.
*   **Solution**: Always check if a component uses `aria-label` before writing generic text matchers in tests. If present, query the accessible name strictly, or use `data-testid`.

### 14.2 End-to-End Zod Schema Integrity
*   **Issue**: Early Playwright tests only asserted UI visibility. If a state update malformed the `localStorage` object structure underneath, the regression test wouldn't catch it unless the UI explicitly crashed via `DataPersistenceGate`.
*   **Solution**: Import Zod schemas (`UCIDSchema`, etc.) directly into Playwright E2E flows to validate raw `localStorage` objects at critical phase boundaries. Use robust utility wrappers to assert payload structures rather than relying solely on UI assertions.

### 14.3 Simulated Stream Timeouts
*   **Issue**: Components using `JobStreamer` or artificial backend tick delays fail in Vitest because the default `1000ms` testing library timeout expires before the simulated 100% progress resolves.
*   **Solution**: For simulated streams and multi-tick operations, extend the `waitFor` or `findByRole` timeouts aggressively (`{ timeout: 10000 }`) rather than relying on synchronous mocks to ensure proper integration coverage.

---

## 15. Zero "Any" Type Tolerance in Vitest Mocking (Phase 7 Learnings)

When refactoring test suites to adhere to the strict "Zero `any` Tolerance" rule, agents frequently encounter cyclic TypeScript errors (e.g., `TS18046: 'X' is of type 'unknown'` or missing properties in complex Zod objects). To prevent burning credits on endless TypeScript assignment loops, enforce these strict mocking standards:

### 15.1 Mocking React Component Props
*   **Issue**: Using generic `Record<string, unknown>` for mocked component props causes React rendering failures because `unknown` is not assignable to `ReactNode` or `MouseEventHandler`. Using `React.ComponentProps<typeof Component>` without default exports causes "no exported member 'default'" errors.
*   **Solution**: Write explicit, perfect inline interfaces for mock props. Never use `any`, and avoid generic `unknown`. 
    *   *Event Handlers*: Must be typed as `import("react").MouseEventHandler` or `() => void`.
    *   *Data Props*: Must be typed as `import("react").ReactNode` or mapped strictly to the real domain schema.
    *   *Example*:
    ```typescript
    vi.mock('./StepBoqIntake', () => ({
      StepBoqIntake: (props: { onTriggerBOQParse?: import("react").MouseEventHandler, isBOQIngesting?: boolean }) => ...
    }));
    ```

### 15.2 Mocking Complex Zod Domain Objects (UCID, Solutions, VendorSubmissions)
*   **Issue**: Mocking deep nested structures like `UCID` or `VendorSubmission` by passing incomplete object literals (`{ label: "test" }`) violently fails Zod-backed type assertions for missing fields (e.g. `totalPrice`, `createdAt`, `projectRef`).
*   **Solution**: Never try to cast partial objects as `any`. You must strictly define **every single required property** mandated by `data.ts`. If a property is deeply nested, provide fully compliant dummy properties inline to satisfy the compiler natively.
    *   *Example*: If `Solution` requires `targetUcidId`, do not omit it. Write `targetUcidId: "dummy-id"`.

## 16. Loading, Zero-State & Error Specifications

This document defines the exact contract for empty states, loading indicators, and error boundaries for all major views.

### 16.1 Zero-State (Empty State) Contracts

Every view must handle the scenario where data is empty gracefully. Do not show empty tables.

#### 15.1.1 LiveMission
- **Icon**: `Rocket` (lucide-react)
- **Copy Title**: "No Active Missions"
- **Copy Subtitle**: "Initialize a new UCID campaign to begin intelligence tracking."
- **CTA**: "Create New Mission" button.

#### 15.1.2 IngestionHub
- **Icon**: `UploadCloud` (lucide-react)
- **Copy Title**: "Awaiting Data Payload"
- **Copy Subtitle**: "Upload a Vendor CSV or initiate a direct integration fetch."
- **CTA**: Drag-and-drop zone or "Select File" button.

#### 15.1.3 SolutionBuilder
- **Icon**: `LayoutTemplate` (lucide-react)
- **Copy Title**: "Solution Workspace Empty"
- **Copy Subtitle**: "Construct components or import an approved BOM."
- **CTA**: "Add First Component" button.

#### 15.1.4 ForensicView
- **Icon**: `ShieldCheck` (lucide-react)
- **Copy Title**: "No Anomalies Detected"
- **Copy Subtitle**: "The current workspace cache is empty or all constraints have passed."
- **CTA**: "Run Deep Scan" button (optional).

#### 15.1.5 ReconciliationView
- **Icon**: `FileDiff` (lucide-react)
- **Copy Title**: "No Reconciliation Discrepancies"
- **Copy Subtitle**: "Sourced configurations match baseline parameters perfectly."
- **CTA**: None.

### 16.2 Loading State Contracts

All loading states must prevent layout shift. The container height must match the expected content height.

- **Lists / Tables**: Use *Skeleton Row* rendering (minimum 5 rows). Do NOT use spinners for tables.
- **Cards / Summaries**: Use *Shimmering Block* (skeleton) matching the card dimension.
- **Submit Buttons**: Render inline spinner inside the button. Change text from "Submit" to "Processing...". Disable button to prevent double submission.
- **Full Page / Initialization**: Only use a centered spinner during initial app load, never during intra-app navigation.

### 16.3 Error Boundary Contracts

- Apply `<ErrorBoundary>` at the root of the routing layout (around child routes).
- Apply `<ErrorBoundary>` around specific heavy modules (e.g., `TaxonomyGraphEditor`, `PlaywrightConsole`).
- **Render Output**:
  - **Background**: Dark overlay (`#03050a`).
  - **Icon**: `AlertTriangle` (color: error red `#ff3d5a`).
  - **Title**: "Module Failure"
  - **Message**: `{error.message}`. Do not show system stack traces in production.
  - **Recovery**: "Attempt Recovery" (reloads the module or resets specific component state).

---

## 17. Phase 10 Refactoring & Testing Constraints (June 2026)

These patterns were identified during the type strictness and codebase decomposition pass:

### 17.1 Zero `any` in Canvas API Mocking
*   **Issue**: In `setup.ts`, mocking `HTMLCanvasElement.prototype.getContext` by casting to `CanvasRenderingContext2D` triggered TypeScript `Type '() => CanvasRenderingContext2D' is not assignable to type...` due to complex overloads (e.g. `WebGLRenderingContext`).
*   **Solution**: Mock implementations with multiple overloads must be strictly cast using `typeof`. Example:
    ```typescript
    HTMLCanvasElement.prototype.getContext = (() => {
      return { fillRect: () => {} } as unknown as CanvasRenderingContext2D;
    }) as unknown as typeof HTMLCanvasElement.prototype.getContext;
    ```

### 17.2 Component Export Logic Offloading
*   **Issue**: Components like `ReconciliationDrillDown` generated massive, inline string-based CSV templates which severely bloated file size limits (>400 lines) and tangled UI logic with data formatting.
*   **Solution**: UI must never format multi-line CSVs or PDFs client-side. Offload Blob streaming to the Backend API (e.g., `/api/export/reconciliation/:id`) and trigger downloads using transient hidden HTML `<a>` tags.

### 17.3 Centralized Testing Mock Entities
*   **Issue**: Test files heavily duplicated 40-line `const mockUcid: UCID = { ... }` object literals, creating thousands of lines of redundant codebase bloat.
*   **Solution**: Never duplicate core domain entities across test files. Always import standardized shared definitions (`mockUcid`, `mockCatalogSku`) from `src/tests/shared.ts`.

---

## 18. The Proactive Senior Architect Mandate (June 2026 Core Directive)

As the officially designated **Senior Architect & Seniormost Designer** for the VSIP Platform, the AI coding agent must operate with full architectural authority and proactive foresight.

### 18.1 Do Not Wait for Audits
*   **Rule**: Never limit your powers or wait for external review (e.g., Claude, Codex, or human PR reviews) to identify systemic gaps.
*   **Action**: Treat every localized prompt as an opportunity for systemic validation. If a localized fix requires refactoring a monolith, repairing ARIA attributes, or replacing legacy hooks (like `useLocalStorageState`), you are pre-authorized to aggressively refactor the surrounding environment. 

### 18.2 Enforce "Test-in-a-Loop" Perfection
*   **Rule**: Writing code without ensuring cross-component blast radius validation is unacceptable.
*   **Action**: Continue testing in a continuous loop using `npm run test:vitest` and `npm run lint`. Do not stop when a superficial test passes. Intentionally write varied and robust edge-case tests to guarantee the system works seamlessly across all workflows. You own the CI pipeline outcome.

### 18.3 Eliminate "Duct-Tape" and "Happy Path" Bias
*   **Rule**: Never patch a symptom without curing the disease.
*   **Action**: If you identify `setTimeout`, `Math.random()`, `any` typing, missing Zero-State UIs, or stale closures, rip them out entirely. Implement modern, state-of-the-art patterns (MSW backend streaming, strict Zustand caching, Framer Motion) proactively. Plan meticulously before execution so nothing is missed.

---

## Appendix A: Agent Knowledge References (Knowledge Graph Directory)

To prevent architectural bleeding, agents must clearly distinguish between **UI/UX Skill Knowledge** (which dictates how the system looks, feels, and interacts) and **Backend Skill Knowledge** (the deep algorithmic rules and schema transformations that happen asynchronously or server-side).

### UI/UX Skill Knowledge
These files define the presentation layer, component styling, animations, global states, and visual regressions. Always consult these when building or modifying React components:
- [UI States & Transitions](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/ui-states.md)
- [State Architecture Contracts](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/state-contracts.md)
- [API Contract & Integration Specifications](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/api-contracts.md)
- [UI Snapshots Directory](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/ui-snapshots/README.md)
- [Loading, Zero-State & Error Specs](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/AGENTS.md#16-loading-zero-state--error-specifications) *(see §16 of this file)*

### Backend Skill Knowledge
> [!NOTE]
> Backend algorithmic skills and extraction logic have been officially decoupled into a separate backend platform repository as of Phase 7. The UI is strictly a dumb client presentation layer. AI Agents modifying this repository should not implement backend logic in React.

---

## 19. Tech Stack & Dependency Versions (Phase 10 Lock)

> [!IMPORTANT]
> **Do NOT upgrade any of these packages without explicit instruction.** Version mismatches cause silent API breakage (e.g. `fast-check` v3→v4 removed `fc.stringOf()`; `framer-motion`→`motion` changed import paths).

### Core Runtime
| Package | Version | Notes |
|---------|---------|-------|
| `react` / `react-dom` | `^19.0.1` | React 19 — use `motion/react` not `framer-motion` |
| `vite` | `^6.2.3` | ESBuild bundler |
| `react-router-dom` | `^7.17.0` | File-based routing |
| `zod` | `^4.4.3` | Schema validation — source of truth for all types |
| `motion` | `^12.23.24` | Import as `motion/react` — NOT `framer-motion` |
| `react-virtuoso` | `^4.18.7` | Virtualization — use `Virtuoso` (list) + `VirtuosoGrid` (cards) |
| `react-hook-form` | `^7.78.0` | Form management |
| `@xyflow/react` | `^12.11.0` | Taxonomy graph rendering |

### Testing Stack
| Package | Version | Notes |
|---------|---------|-------|
| `vitest` | `^4.1.8` | Unit + component test runner |
| `@testing-library/react` | `^16.3.2` | RTL — DOM queries |
| `msw` | `^2.14.6` | MSW v2 — use `http` + `HttpResponse` (NOT `rest`) |
| `fast-check` | `^4.8.0` | Property-based testing — see §19.4 for correct APIs |
| `vitest-axe` | `^0.1.0` | Accessibility assertions |
| `@playwright/test` | `^1.60.0` | E2E browser tests |
| `@stryker-mutator/core` | `^9.6.1` | Mutation testing |

### Key Architectural Imports
```typescript
// ✅ CORRECT
import { motion, AnimatePresence } from 'motion/react';   // NOT framer-motion
import { Virtuoso, VirtuosoGrid } from 'react-virtuoso';  // NOT react-window
import { http, HttpResponse } from 'msw';                  // NOT rest (MSW v1)
import { useCoreStore } from './store/coreStore';          // Zustand global state
```

---

## 20. Pre-Existing Non-Blocking Lint Warnings (Do NOT Fix Without Instruction)

> [!WARNING]
> The following **15 warnings** exist in the production codebase and are **intentionally deferred**. They are non-blocking (0 errors). Do NOT waste tokens attempting to fix them unless explicitly asked.

| File | Warning | Rule |
|------|---------|------|
| `App.tsx` | Arrow function complexity 16 (max 15) | `complexity` |
| `CatalogAddForm.tsx` | 6× `<label>` not associated with control | `jsx-a11y/label-has-associated-control` |
| `CatalogAddForm.tsx` | Non-interactive `<div>` has keyboard listener | `jsx-a11y/no-noninteractive-element-interactions` |
| `CatalogAddForm.tsx` | `tabIndex` on non-interactive element | `jsx-a11y/no-noninteractive-tabindex` |
| `CatalogCardsList.tsx` | `autoFocus` prop used on inline edit input | `jsx-a11y/no-autofocus` |
| `CatalogFilterBar.tsx` | Function complexity 21 | `complexity` |
| `CatalogManager.tsx` | Unused `success`, `warn` from `useToast()` | `sonarjs/no-unused-vars` / `no-dead-store` |
| `CatalogManager.tsx` | 2× ignored exception in catch blocks | `sonarjs/no-ignored-exceptions` |
| `BomReconciliationPanel.tsx` | Non-native interactive element (missing role) | `jsx-a11y/no-static-element-interactions` |
| Various | Dead store / unused eslint-disable directives | `sonarjs/no-dead-store` |

**Current lint summary: `0 errors, 15 warnings` — ALL CLEAN for CI purposes.**

---

## 21. Global State Architecture (Zustand `coreStore`)

All shared application state flows through a **single Zustand store** persisted to `localStorage`:

```typescript
// src/store/coreStore.ts — Key: 'vsip-core-storage'
{
  ucids: UCID[];           // All active/completed procurement missions
  vendors: Vendor[];       // Connected vendor API profiles
  catalogSkus: CatalogSKU[]; // Part inventory
  forensicIssues: ForensicIssue[];
  sourcingRules: SourcingRule[];
  learningEvents: LearningEvent[];
  activeMissionId: string;
  collapsed: boolean;      // Sidebar state
}
```

**Route → Component → Props mapping** (from `App.tsx`):
| Route | Component | Gets from Store |
|-------|-----------|----------------|
| `/` | `Dashboard` | `ucids`, `vendors`, `forensicIssues` |
| `/catalog` | `CatalogManager` | `catalogSkus`, `vendors` only — NO ucids |
| `/forensic` | `ForensicView` | `forensicIssues`, `ucids`, `sourcingRules`, `learningEvents` |
| `/solution-builder` | `SolutionBuilder` | `ucids` only |
| `/vendor-portal` | `VendorPortal` | `vendors`, `ucids`, `catalogSkus`, `sourcingRules` |
| `/reconciliation` | `ReconciliationView` | `ucids`, `catalogSkus`, `forensicIssues` |
| `/telemetry` | `SystemTelemetry` | No props (reads own API) |

> [!IMPORTANT]
> **E2E state injection**: To reset Zustand state in Playwright, write directly to `localStorage.setItem('vsip-core-storage', JSON.stringify({ state: { ucids: [], ... }, version: 0 }))` and call `page.reload()`. Never use `vsip_localstorage_update` custom events for Playwright — that's for in-tab SPA sync only.

---

## Test Suite Registry — Phase 10 Complete Coverage (June 2026)

> [!IMPORTANT]
> **311 tests across 63 test files — ALL PASSING as of June 2026.**
> The `vite.config.ts` test `include` pattern covers BOTH `src/**/*.test.{ts,tsx}` AND `tests/**/*.test.{ts,tsx}`. Never revert to `src/**` only or the 19 external test categories will silently disappear from the suite.

### Full Category Registry

| Cat | Spec Title | Test File(s) | Count | Runner | Status |
|-----|-----------|--------------|-------|--------|--------|
| 1 | Pure unit logic | `catalogUtils.test.ts`, `reconciliationMath.test.ts` | 9 | Vitest | ✅ |
| 2 | Component render + interaction | `src/components/**/__tests__/` (44 files) | 204 | Vitest + RTL | ✅ |
| 3 | MSW integration flows | `forensics-auto-heal-chain`, `ingestion-workflow`, `cross-component-sync`, `data-persistence-gate`, `taxonomy-graph-sync`, `cleansing-mapping` | 20+ | Vitest + MSW | ✅ |
| 4 | Visual regression | `tests/e2e/visual.spec.ts` | 8 | Playwright | 🟡 E2E |
| 5 | Responsive breakpoints | `tests/e2e/responsive.spec.ts` | 9 | Playwright | 🟡 E2E |
| 6 | State lifecycle | `resilienceAndLifecycle.test.tsx` | 4 | Vitest + MSW | ✅ |
| 7 | Workflow steps | `useWorkflowManager.test.tsx` | 8 | Vitest | ✅ |
| 8 | Zod schema contracts | `contracts`, `zodSchemaIntegration`, `GraphContracts` | 22 | Vitest + MSW | ✅ |
| 9 | API payload integrity | `apiClient.test.ts` | 18 | Vitest + MSW | ✅ |
| 10 | Resilience / 503 errors | `resilienceAndLifecycle.test.tsx` | 4 | Vitest + MSW | ✅ |
| 11 | Accessibility (ARIA/axe) | `a11yAndPerformance.test.tsx` | 7 | Vitest + axe | ✅ |
| 12 | Render count / memoization | `a11yAndPerformance.test.tsx` | 5 | Vitest + RTL | ✅ |
| 13 | Optimistic UI rollback | `resilienceAndLifecycle.test.tsx` | 3 | Vitest + MSW | ✅ |
| 14 | Unsaved changes guard | `unsavedChangesGuard.test.tsx` | 9 | Vitest + RTL | ✅ |
| 15 | Deep-link / URL routing | `tests/e2e/deeplink.spec.ts` | 9 | Playwright | 🟡 E2E |
| 16 | Multi-vendor BOQ math | `multiVendorBOQ.test.ts` | 13 | Vitest | ✅ |
| 17 | AGENTS.md compliance | `agentsCompliance.test.tsx` | 8 | Vitest + RTL | ✅ |
| 18 | Mutation testing (Stryker) | `stryker.config.json` | N/A | Stryker | `npm run test:mutation` |
| 19 | Property-based (fast-check) | `propertyBased.test.ts` | 10 | Vitest + fc | ✅ |

### Critical Component Prop Contracts

**These components do NOT accept `ucids` or `catalogSkus` — they are self-contained domain modules:**

| Component | Valid Props | ❌ Never Pass |
|-----------|-------------|--------------|
| `SourcingRulesVault` | `sourcingRules`, `setSourcingRules`, `triggerToast`, `prefillRule`, `onPrefillConsumed` | `ucids`, `catalogSkus` |
| `CatalogManager` | `catalogSkus`, `setCatalogSkus`, `vendors` | `ucids` |
| `CatalogTaxonomyTree` | `selectedPath`, `selectPathFn` | `taxonomyNodes` (owns internal data) |
| `AddRuleForm` | `onSubmit`, `onCancel`, `prefillRule`, `triggerToast` | `onSave` |

### MSW Endpoint Truth Table

| Action | Correct Endpoint | ❌ Wrong (historical) |
|--------|-----------------|----------------------|
| Auto-Heal | `POST /api/forensics/align` | `POST /api/issues/auto-heal` |
| Rule Save | `POST /api/taxonomy/rules` | `POST /api/sourcing-rules` |
| Rule Simulate | `POST /api/taxonomy/simulate` | `POST /api/sourcing-rules/:id/simulate` |
| BOQ Ingest | `POST /api/boq/ingest` → `{ ucid: string, configsCreated, sourceFile, parsedSummary }` | Returns UCID object |

### fast-check v4 API Reference
```typescript
fc.uuid()                            // UUID v4 ✅
fc.string({ minLength: 3 })          // String with length ✅
fc.nat({ max: 1000 })                // Non-negative int ✅
// ❌ REMOVED in fast-check v4:
fc.uuidV(4)    // → fc.uuid()
fc.char()      // → fc.string({ minLength: 1, maxLength: 1 })
fc.stringOf()  // → fc.string({ minLength, maxLength })
```

### Test Scripts
```bash
npm run test:vitest        # 63 files, 311 tests
npm run test:e2e           # Playwright E2E
npm run test:mutation      # Stryker (slow)
npm run lint               # 0 errors, 15 known warnings
npm run build              # Vite production build
```



## 22. Phase 11: SolutionProject Grouping & UCID Parallelism

### 22.1 SolutionProject Wrapper Dominance
*   **Issue**: Floating UCIDs caused visual inconsistencies across tabs because components filtered by raw arrays rather than scoped solution projects.
*   **Solution**: `activeSolutionId` is now the definitive master state pivot. Every UCID *must* possess a `solutionId` foreign key linking it to a `SolutionProject`. Components must filter their data using `useCoreStore(s => s.activeSolutionId)`.

---

## 23. Phase 12 Drag & Drop Architecture & Native Interactivity

### 23.1 Native HTML5 Drag and Drop Mandate
*   **Rule**: We strictly avoid massive third-party DND libraries (`dnd-kit`, `react-beautiful-dnd`) to minimize JS bundle weight and maintain React 19 compatibility without fighting deprecated lifecycles.
*   **Implementation**: All drag operations MUST use native HTML5 attributes: `draggable={true}`, `onDragStart`, `onDragOver`, and `onDrop`.
*   **Payload Transport**: Use `e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'entity', id: '123' }))` to transport typed interaction payloads cleanly between isolated DOM subtrees (e.g., passing Orphan ID from `TaxonomyOrphanBox` into `KnowledgeGraphCanvas`).

### 23.2 Drag-to-Heal State Mutations (Taxonomy Graph)
*   **Rule**: Visual "Heal" interactions (like dropping an unmapped SKU onto a valid Catalog Node) MUST trigger an optimistic state mutation locally *while* dispatching the API call to `/api/taxonomy/map`. This ensures UI snappiness while preserving backend source-of-truth.

### 23.3 Testing Interactivity
*   **Rule**: When validating DND in E2E tests, standard Playwright interactions or Vitest DOM mocks (like `fireEvent.dragStart` and `fireEvent.drop`) must be explicitly targeted to the `dataTransfer` lifecycle.

### 22.1 Ingestion & Splitting Boundaries
- **The BOQ**: When a user uploads a BOQ (Bill of Quantities), they are uploading a `SolutionProject` campaign (e.g. "HQ Expansion"). 
- **The Split**: The Ingestion Hub parses the BOQ and splits it into multiple distinct, parallel configurations (e.g., Compute, Storage, Networking). 
- **The Contract**: Each of these split configurations becomes a `UCID`. Therefore, the `UCID` schema now mandates the inclusion of the parent's contextual pointers:
  - `solutionId`: The UUID of the parent `SolutionProject`
  - `solutionDisplayId`: The human-readable parent display ID (e.g. `SOL-2026-001`)
  - `configIndex`: Numeric order of this specific parallel track (e.g. 1)
  - `configLabel`: Sourced config name (e.g. "Primary Spec")

### 22.2 Sourcing UI View Scoping
- Components like `TaxonomyGraph`, `SolutionBuilder`, and `MissionControl` must NOT randomly display all global UCIDs in a flat list. 
- The Global Store (`coreStore`) tracks the `activeSolutionId`.
- **View Render Rules**: Always filter your visible `availableUcids` to only those matching `u.solutionId === activeSolutionId`.
- **Creation Rules**: When rendering modal triggers (like `NewUCIDModal`), default the new record to link to the global `activeSolutionId`. Never inject orphaned UCIDs into the store unless explicitly simulating an error state.

### 22.3 Campaign Consolidation Hub (The Rollup)
- **Purpose**: Because UCIDs are now split by hardware category, the user requires a macro-view to negotiate the entire campaign.
- **The Hub**: `CampaignConsolidationHub` automatically groups child UCIDs by their `SolutionProject` and calculates the total original budget versus the total sourced budget across all tracks. 
- **Decision Engine**: It exposes portfolio-wide operations like `Best-of-Breed` (picking the cheapest across all vendors) or `Single-Source` (forcing all configs to HPE or Dell to trigger volume rebates), before securely locking the entire campaign in a unified snapshot covenant.

---

## 24. Backend Mission Control Workflow Delegation (Phase 13 Prep)

### 24.1 Workflow State Simulation vs Real Execution
*   **Current State**: The `useMissionControlWorkflow` hook in the frontend simulates the progression of AI subflows (e.g., "Parsing BOQ", "Semantic Search", "Taxonomy Matching", "BOM Generation") using network-delayed handlers in `coreHandlers.ts`. 
*   **Rule for Backend**: When building the real backend pipelines, the API must NOT run these heavy workflows synchronously in a single HTTP request, or it will trigger 504 Gateway Timeouts.
*   **Implementation Mandate**:
    - The UI layer will trigger an asynchronous `/api/workflows/run` POST request.
    - The backend MUST return a `jobId` immediately (202 Accepted).
    - The frontend will utilize the existing `JobStreamer` component to poll or listen via SSE (Server-Sent Events) for granular step-by-step progress updates.

### 24.2 State Machine Transitions
*   **Current State**: `activeStepIndex` manually iterates via `completeStep` in the UI.
*   **Backend Handoff**: The backend workflow orchestrator (e.g., Temporal or Kafka) must broadcast the precise `currentStep` and `completedSteps` array back to the frontend. The `activeStepIndex` in `MissionControl.tsx` must become a purely reactive prop derived from the active UCID's `syncStatus` payload, entirely eliminating frontend-driven timeouts.
