# VSIP Platform - AI Agent Engineering Guidelines & Project Learnings

> [!CAUTION]
> **MANDATORY PRE-FLIGHT CHECKS**: You MUST execute `npm run lint`, `tsc --noEmit --skipLibCheck`, `npm run build`, and all tests (`vitest` & `playwright`) before declaring any task complete. Skipping static analysis will result in rejected changes and broken pipelines. See Section 9 for full details.

Welcome, AI Coding Agent. This document outlines the critical architectural patterns, data contract boundaries, UI/UX guidelines, and lesson milestones of the **Vendor Solution Intelligence & Procurement Integrity (VSIP) Platform**. Adherence to these guidelines is strictly mandatory to prevent regressions, state mismatch, compilation failures, or layout defects.

---

## 1. Core Data Schemas & Relational Boundaries

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
    - Mock delays and progress simulations must be entirely delegated to the `apiClient` / MSW layer (`handlers.ts`).
    - Complex parsing (like NLP semantic parsing or deep object overrides) belongs strictly in the backend boundary. The UI must remain a dumb visualization layer reacting to external streams.

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

## 5. Compilation Stability & Lint Checks

Before completing your turn, always execute:
1.  `npm run lint` (or use `lint_applet` tool) to catch typescript warnings.
2.  `npm run build` (or `compile_applet` tool) to ensure proper package distribution.

Keep all modifications clean, explicit, and perfectly typed. Never leave dangling comments such as `style-=` or malformed JSX statements.


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

To prevent architectural regression, broken types, and memory leaks from bleeding into the master branch, all AI agents must assume full ownership of code quality by adhering to the following strict pre-flight protocols:

### 9.1 Zero Tolerance for TypeScript Drift
*   **Rule**: Never declare a task "complete" without running `npm run lint` (or `tsc --noEmit --skipLibCheck`) first.
*   **Action**: If the linter reports any errors (e.g., missing props, incorrect schema derivations, or failed third-party imports), you must halt, fix the types, and re-run until it passes 100%.

### 9.2 Comprehensive Test Harness Execution
*   **Rule**: Code logic changes (especially to shared components like `CatalogManager` or `DataPersistenceGate`) require a functional test run.
*   **Action**: Execute `npx vitest run` and `npx playwright test`. Any crash indicating "Element type is invalid", or failing component tests, MUST be analyzed and resolved (via JSDOM mocks in `tests/setup.ts` or component fixes).

### 9.3 Vitest Fetch & MSW Mock Topography
*   **Issue**: Global fetch mocks in Vitest (e.g., `vi.stubGlobal('fetch')`) fail when matching relative URL paths across the API client interceptors.
*   **Solution**: All `apiClient.ts` test expectations must assert full absolute domain mappings (e.g. `expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/endpoint', ...)`). Additionally, chained mocked methods (like `apiClient.delete`) must explicitly return promises using `.mockResolvedValue` or `.mockRejectedValue` rather than returning `undefined` or throwing synchronously.

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
*   **Rule**: No React functional component or file shall exceed **400 lines of code**.
*   **Action**: If a file like `TaxonomyGraphSidebar.tsx` or `LearningLoopInjector.tsx` approaches this limit, you must halt feature development and decompose it into atomic sub-components (e.g., `NodeEditorPanel.tsx`, `EdgeEditorPanel.tsx`). Monolithic "God Components" are banned.

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
