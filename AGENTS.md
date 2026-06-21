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

### 9.4 Vitest Fetch & MSW Mock Topography
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

## Appendix A: Agent Knowledge References (Knowledge Graph Directory)

To prevent architectural bleeding, agents must clearly distinguish between **UI/UX Skill Knowledge** (which dictates how the system looks, feels, and interacts) and **Backend Skill Knowledge** (the deep algorithmic rules and schema transformations that happen asynchronously or server-side).

> [!CAUTION]
> The backend skills listed below represent capabilities that the UI layer must interact with but must **NEVER implement directly**. The UI remains a presentation layer for these services. Do not duplicate backend parsing logic inside React components.

### UI/UX Skill Knowledge
These files define the presentation layer, component styling, animations, global states, and visual regressions. Always consult these when building or modifying React components:
- [UI/UX Best Practices](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/skills/ui-architecture/ui-ux-best-practices.md)
- [UI States & Transitions](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/ui-states.md)
- [State Architecture Contracts](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/state-contracts.md)
- [UI Snapshots Directory](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/ui-snapshots/README.md)
- [Loading, Zero-State & Error Specs](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/loading-error-specs.md)

### Backend Skill Knowledge
These files define the core business logic, schema engines, and deep algorithmic processing. Use these to understand how data is structured and processed by the backend before the UI consumes it:

#### 1. Sizing Engine & Modellers
- [Budget Constraint Modeller](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/skills/sizing-fit-engine/budget-constraint-modeller.md)
- [Provisioning Boundary Check](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/skills/sizing-fit-engine/provisioning-boundary-check.md)
- [Headroom Calculator](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/skills/sizing-growth-modeller/headroom-calculator.md)
- [Priority Ranker](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/skills/sizing-requirements/priority-ranker.md)
- [Workload Profile Extractor](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/skills/sizing-requirements/workload-profile-extractor.md)

#### 2. Forensic Self-Heal & Tracing
- [Root Cause Identifier](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/skills/forensic-self-heal/root-cause-identifier.md)
- [Schema Repair](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/skills/forensic-self-heal/schema-repair.md)
- [Mission Orchestrator](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/skills/monitoring-tracing/mission-orchestrator.md)
- [Shadow Audit Sandbox](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/skills/monitoring-tracing/shadow-audit-sandbox.md)

#### 3. Core BOM Engine & Sku Dependencies
- [Mandatory Part Sync](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/skills/core-bom-engine/mandatory-part-sync.md)
- [High Fidelity Diff](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/skills/core-bom-engine/high-fidelity-diff.md)
- [Compatibility Checker](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/skills/sku-rules-dependencies/compatibility-checker.md)
- [Dependency Resolver](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/skills/sku-rules-dependencies/dependency-resolver.md)
- [SKU Chain Parent-Child Resolver](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/skills/sku-chain-parent-child/sku-chain-resolver.md)

#### 4. Core Ingestion & Classification
- [Excel / PDF / OCR Extractors](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/skills/core-ingestion/excel-doc-parsing.md)
- [Lexical & Semantic Extractors](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/skills/core-classification/semantic-extractor.md)
- [Fuzzy Typo Healer](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/skills/core-classification/fuzzy-typo-healer.md)

#### 5. Rules Governance & Graph Architecture
- [Vendor Cross-Pollution Guard](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/skills/rules-governance/vendor-cross-pollution-guard.md)
- [Regulatory & Financial Auditors](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/skills/rules-governance/financial-auditor.md)
- [Variant Mapper (Taxonomy)](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/skills/taxonomy-hierarchy/variant-mapper.md)

#### 6. Generative AI Engine
- [Alternative Solution Solver](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/skills/generative-engine/alternative-solution-solver.md)
- [Persona Scoring Model](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/skills/generative-engine/persona-scoring-model.md)

