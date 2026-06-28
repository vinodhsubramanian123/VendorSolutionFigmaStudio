# Phase Learnings & Post-Mortems

## 14. Phase 7 Gap-Analysis Fix Learnings (June 2026)

These patterns were identified during the comprehensive gap-analysis pass and must not regress.

### 14.1 Select Option Value Binding
*   **Issue**: `<option>` elements without explicit `value` attributes sent the display text (e.g., "HPE (Hewlett Packard Enterprise)") to state handlers instead of the canonical short-form key ("HPE"), causing downstream contract mismatches.
*   **Solution**: Every `<option>` in a controlled `<select>` MUST have an explicit `value` attribute. Example: `<option value="HPE">HPE (Hewlett Packard Enterprise)</option>`.

### 14.2 All ID Generation Must Use `crypto.randomUUID()`
*   **Issue**: Components like `IngestionHub`, `SourcingRulesVault`, and `SolutionBuilder` used `Date.now()`, `1700 + length`, or manual string concatenations to generate IDs, causing collisions in multi-UCID environments and Zod schema violations.
*   **Solution**: **All** new entity IDs (UCIDs, job IDs, rule IDs, conflict IDs) must be generated via `crypto.randomUUID()`. No manual ID arithmetic.
*   **CRITICAL FOLLOW-UP**: When migrating primary entities to UUIDs, be certain to update the UI (like `UcidContainerList`) to display `entity.displayId` rather than `entity.id`. Playwright E2E tests searching for human-readable regexes (like `/UCID-/`) will violently fail if the component renders the raw UUID instead.

### 14.3 Controlled Input Query Sync via `useEffect`
*   **Issue**: `SearchView.tsx` maintained internal query state independently of the `query` prop. When the parent programmatically updated the prop (e.g., from GlobalCommandPalette), the local input did not reflect the change.
*   **Solution**: Always add a `useEffect` to sync controlled input state when a prop can be updated externally:
    ```typescript
    useEffect(() => { setLocalQuery(query); }, [query]);
    ```

### 14.4 Derived State Initialization (No Hardcoded `true`)
*   **Issue**: `ReconciliationView.tsx` initialized `hasDrift` as `true` regardless of actual data, causing the "Drift Detected" banner to flash on first load even when all UCIDs were clean.
*   **Solution**: Always derive boolean flags from real data at initialization:
    ```typescript
    const [hasDrift, setHasDrift] = useState(() =>
      ucids.some(u => u.syncStatus === 'Out-of-Sync' || u.syncStatus === 'Error')
    );
    ```

### 14.5 ISO-8601 Timestamp Standardization
*   **Issue**: `mockData.ts` event timestamps mixed human-readable strings (e.g., "2 hours ago") with ISO-8601 strings, causing `new Date(...).toLocaleString()` to render as `"Invalid Date"` in telemetry views.
*   **Solution**: All `LogEvent.timestamp` values must be valid ISO-8601 strings (`"2026-06-17T10:00:00.000Z"`).

### 14.6 Component Decomposition Map (400-Line Compliance)
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

### 14.7 useEffect Dependency Safety in SolutionBuilder
*   **Issue**: `SolutionBuilder` listed `solutions` (an array) as a raw `useEffect` dependency. React recreates array references on every render, causing the effect to re-run infinitely.
*   **Solution**: Use `solutions.length` (a primitive) or `JSON.stringify(solutions)` as the dependency sentinel when you need to react to collection changes, or use a stable ref.


### 14.8 Vitest Deep Nested Mock Paths
*   **Issue**: When testing deeply nested components (like `src/components/forensics/__tests__/SourcingRulesVault.test.tsx`), using `vi.mock("../../services/apiClient")` silently created a dummy module rather than overriding the actual `apiClient`, causing tests that `await` API calls to hang and timeout.
*   **Solution**: Always ensure the relative path traverse goes all the way back to `src`. For a nested test file like `__tests__/ComponentName.test.tsx`, the path to services should be `../../../services/apiClient`.

### 14.9 Playwright E2E and Suspense Shimmer Blocks
*   **Issue**: Playwright mega-flow tests timed out expecting explicit text like `ACTIVE SOLUTION MISSION`, but the DOM rendered `<div class="animate-pulse bg-white/5...">` because `MissionControl` was stuck in a `Suspense` boundary due to missing or invalid UUID mappings passed from `IngestionHub`.
*   **Solution**: When creating new UCIDs or configurations, ensure that `displayId` and `id` remain consistent across state lifts. If `displayId` is strictly expected by the UI, but Playwright navigates via the raw UUID, the data persistence gates will trigger `Suspense` fallbacks instead of crashing, causing E2E tests to timeout rather than fail explicitly.

### 14.10 Zustand Global Persist and E2E State Injection
*   **Issue**: E2E tests manually dispatched `vsip_localstorage_update` events to clear global state (`sys_ucids`) or wrote directly to isolated keys. However, after migrating to Zustand `persist` middleware mapped to the `vsip-core-storage` key, these Playwright test state manipulations failed, causing components like `SolutionBuilder` to automatically bypass onboarding steps because they read the default `INITIAL_UCIDS` fallback state.
*   **Solution**: E2E Playwright tests must directly interact with the unified Zustand state key. To clear or mock global state, you must overwrite `vsip-core-storage` with the properly stringified JSON format (e.g., `localStorage.setItem('vsip-core-storage', JSON.stringify({ state: { ucids: [], ... }, version: 0 }))`) and invoke `page.reload()` to allow the core store to rehydrate.

---

## 15. Phase 8 UX Visual Upgrades Learnings (June 2026)

These patterns were identified during the comprehensive Framer Motion visual upgrade phase:

### 15.1 `AnimatePresence` and Virtualized Lists
*   **Issue**: `AnimatePresence` requires immediate direct children to be `motion` components to track exits. When dealing with highly optimized virtualized lists (e.g. `react-virtuoso` in `CatalogCardsList`), staggering list-item entry via a parent container isn't easily supported because `react-virtuoso` handles its own DOM windowing.
*   **Solution**: Do not attempt to use `AnimatePresence` stagger effects across virtualized rows. Instead, scope animations directly to individual card wrappers (e.g. `whileHover={{ y: -3 }}`) or use simple CSS animations for states like EOL pulsing (`animate-pulse-slow`).

### 15.2 Double Return Syntax Regression
*   **Issue**: When upgrading existing React nodes to `motion.div` via regex or strict string replacement, duplicating the `return (` statement causes a silent "Expression expected" TypeScript compilation failure.
*   **Solution**: Always verify the bounding JSX lines when replacing generic HTML tags with their `motion` equivalents. Run `npm run lint` immediately after any visual component swap.

### 15.3 `motion/react` Import Validation
*   **Issue**: Component conversions (like changing `div` to `motion.div`) naturally fail if the `motion` object isn't explicitly imported from `motion/react`.
*   **Solution**: Whenever refactoring a component for animations, add `import { motion } from 'motion/react';` at the top of the file before rendering the component.

### 15.4 Playwright E2E Flow Testing & Modal Blocking
*   **Issue**: Playwright tests timing out in Phase 5 (Auto-Heal & Learn) because the expected `marked End-of-Life` event was never intercepted or displayed. This occurred because clicking the "Auto-Align Component" button triggers the `RuleClarificationModal`, which inherently blocked execution until explicitly confirmed via the "Lock Intelligence Rule" button, a step missed by previous scripts.
*   **Solution**: Always model user interception modals explicitly in E2E flows. Add `await page.getByRole('button', { name: 'Lock Intelligence Rule' }).click()` prior to expecting downstream `LearningLoopFeed` asynchronous updates.

### 15.5 E2E Component Text Coupling (MSW Mocks)
*   **Issue**: Tests failed to find specific toast elements like "Snapshot Block Locked" or specific MSW learning text like "marked End-of-Life" because the mock implementation in `src/mocks/handlers.ts` or component UI returned dynamically constructed backend strings (e.g., `locked & archived in CRM register (optimistic)`).
*   **Solution**: Frontend string expectations in Playwright must strictly mirror exactly what the backend `handlers.ts` produces or what `SnapshotManager.tsx` issues via the `ToastContext`. When building out integration tests across 6 distinct states, use partial generic matching (`exact: false`) tied closely to the exact phrase produced by the mock server or use proper `data-testid` values.

### 15.6 Test Resilience & Hardcoded Strings (data-testid)
*   **Issue**: End-to-End Playwright tests originally relied heavily on `page.getByText()` and `page.locator('button[title="..."]')`. This created fragile tests that would break anytime marketing copy, tooltips, or visual labels were updated, slowing down continuous integration.
*   **Solution**: Core interactive elements (e.g., `Execute Compliance Scan`, `Capture Snapshot`) must be decoupled from UI copy by using `data-testid` attributes (e.g., `data-testid="btn-execute-scan"`). Always use `page.getByTestId()` in the Playwright suite to ensure robust integration testing immune to cosmetic adjustments.

---

## 16. Phase 9 Testing Hardening Learnings (June 2026)

These patterns were identified during the Zod integration and Integration test stabilization pass:

### 16.1 Aria-Label Query Precedence
*   **Issue**: Vitest and Playwright `findByRole` or `getByRole` selectors timed out when searching for text like `/Split Configs/i` on a button. This occurred because the button had an `aria-label="Split configurations into active UCIDs"`, which overrides the text content in accessibility trees.
*   **Solution**: Always check if a component uses `aria-label` before writing generic text matchers in tests. If present, query the accessible name strictly, or use `data-testid`.

### 16.2 End-to-End Zod Schema Integrity
*   **Issue**: Early Playwright tests only asserted UI visibility. If a state update malformed the `localStorage` object structure underneath, the regression test wouldn't catch it unless the UI explicitly crashed via `DataPersistenceGate`.
*   **Solution**: Import Zod schemas (`UCIDSchema`, etc.) directly into Playwright E2E flows to validate raw `localStorage` objects at critical phase boundaries. Use robust utility wrappers to assert payload structures rather than relying solely on UI assertions.

### 16.3 Simulated Stream Timeouts
*   **Issue**: Components using `JobStreamer` or artificial backend tick delays fail in Vitest because the default `1000ms` testing library timeout expires before the simulated 100% progress resolves.
*   **Solution**: For simulated streams and multi-tick operations, extend the `waitFor` or `findByRole` timeouts aggressively (`{ timeout: 10000 }`) rather than relying on synchronous mocks to ensure proper integration coverage.

---

## 17. Zero "Any" Type Tolerance in Vitest Mocking (Phase 7 Learnings)

When refactoring test suites to adhere to the strict "Zero `any` Tolerance" rule, agents frequently encounter cyclic TypeScript errors (e.g., `TS18046: 'X' is of type 'unknown'` or missing properties in complex Zod objects). To prevent burning credits on endless TypeScript assignment loops, enforce these strict mocking standards:

### 17.1 Mocking React Component Props
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

### 17.2 Mocking Complex Zod Domain Objects (UCID, Solutions, VendorSubmissions)
*   **Issue**: Mocking deep nested structures like `UCID` or `VendorSubmission` by passing incomplete object literals (`{ label: "test" }`) violently fails Zod-backed type assertions for missing fields (e.g. `totalPrice`, `createdAt`, `projectRef`).
*   **Solution**: Never try to cast partial objects as `any`. You must strictly define **every single required property** mandated by `data.ts`. If a property is deeply nested, provide fully compliant dummy properties inline to satisfy the compiler natively.
    *   *Example*: If `Solution` requires `targetUcidId`, do not omit it. Write `targetUcidId: "dummy-id"`.

## 18. Phase 11 / Round 2 Gap-Analysis Learnings (Static & Dynamic Skills)

These patterns were identified and enforced during the Round 2 structural gap analysis pass to ensure maximum agentic development safety and schema compliance.

### 18.1 Deterministic Type Mocking (Zero `unknown` Casting)
*   **Issue**: Test files heavily relied on `as unknown as Vendor` or `as any` to quickly instantiate mock data, causing the test suite to silently pass even after underlying schema contracts drifted (e.g., `apiStatus` vs `status`).
*   **Solution**: **Always** construct fully-typed factory utilities (e.g., `createMockVendor`, `createMockUCID`) in `src/tests/utils/mockFactories.ts` rather than raw literal casting. Test files should invoke `createMockVendor({ overrides })` to automatically align with strictly inferred Zod defaults without risking runtime type explosions.

### 18.2 Bounded MSW Domain Routing (Preventing 400-Line Violations)
*   **Issue**: Consolidating all API endpoints into a single `coreHandlers.ts` file rapidly breached the 400-line strict limit as schemas grew more complex.
*   **Solution**: MSW handlers must remain strictly domain-bound (e.g., `graphHandlers.ts`, `snapshotHandlers.ts`) and sit in a flat structure inside `src/mocks/routes/` to avoid cyclic or overly deep import traversals. Do not nest them in nested subdirectories (like `routes/snapshots/`); keep the architecture flat.

### 18.3 Deterministic ID Generation for Mock Servers
*   **Issue**: `server.ts` utilized `Math.random()` to generate IDs like `UCID-2026-X`, which is inherently unpredictable and violates strict UUID and ID deterministic tracing.
*   **Solution**: Any mock server or client ID generator must use timestamp modulo (e.g. `timestampMs % 10000`) or standard monotonic counters combined with `crypto.randomUUID()` when generating fallback values.

### 18.4 Global Schema Regex Enforcement
*   **Issue**: `solutionDisplayId` lacked Zod regex enforcement on the UCID child entity, allowing mock servers to pass non-compliant strings like `"SOL-API-MOCK"`.
*   **Solution**: Always mirror parent validation bounds (like `/^SOL-\d{4}-\d+$/`) natively onto any child foreign keys or derived schema objects using `.regex()`.

## 19. Loading, Zero-State & Error Specifications

This document defines the exact contract for empty states, loading indicators, and error boundaries for all major views.

### 19.1 Zero-State (Empty State) Contracts

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

### 19.2 Loading State Contracts

All loading states must prevent layout shift. The container height must match the expected content height.

- **Lists / Tables**: Use *Skeleton Row* rendering (minimum 5 rows). Do NOT use spinners for tables.
- **Cards / Summaries**: Use *Shimmering Block* (skeleton) matching the card dimension.
- **Submit Buttons**: Render inline spinner inside the button. Change text from "Submit" to "Processing...". Disable button to prevent double submission.
- **Full Page / Initialization**: Only use a centered spinner during initial app load, never during intra-app navigation.

### 19.3 Error Boundary Contracts

- Apply `<ErrorBoundary>` at the root of the routing layout (around child routes).
- Apply `<ErrorBoundary>` around specific heavy modules (e.g., `TaxonomyGraphEditor`, `PlaywrightConsole`).
- **Render Output**:
  - **Background**: Dark overlay (`#03050a`).
  - **Icon**: `AlertTriangle` (color: error red `#ff3d5a`).
  - **Title**: "Module Failure"
  - **Message**: `{error.message}`. Do not show system stack traces in production.
  - **Recovery**: "Attempt Recovery" (reloads the module or resets specific component state).

---

## 20. Phase 10 Refactoring & Testing Constraints (June 2026)

These patterns were identified during the type strictness and codebase decomposition pass:

### 20.1 Zero `any` in Canvas API Mocking
*   **Issue**: In `setup.ts`, mocking `HTMLCanvasElement.prototype.getContext` by casting to `CanvasRenderingContext2D` triggered TypeScript `Type '() => CanvasRenderingContext2D' is not assignable to type...` due to complex overloads (e.g. `WebGLRenderingContext`).
*   **Solution**: Mock implementations with multiple overloads must be strictly cast using `typeof`. Example:
    ```typescript
    HTMLCanvasElement.prototype.getContext = (() => {
      return { fillRect: () => {} } as unknown as CanvasRenderingContext2D;
    }) as unknown as typeof HTMLCanvasElement.prototype.getContext;
    ```

### 20.2 Component Export Logic Offloading
*   **Issue**: Components like `ReconciliationDrillDown` generated massive, inline string-based CSV templates which severely bloated file size limits (>400 lines) and tangled UI logic with data formatting.
*   **Solution**: UI must never format multi-line CSVs or PDFs client-side. Offload Blob streaming to the Backend API (e.g., `/api/export/reconciliation/:id`) and trigger downloads using transient hidden HTML `<a>` tags.

### 20.3 Centralized Testing Mock Entities
*   **Issue**: Test files heavily duplicated 40-line `const mockUcid: UCID = { ... }` object literals, creating thousands of lines of redundant codebase bloat.
*   **Solution**: Never duplicate core domain entities across test files. Always import standardized shared definitions (`mockUcid`, `mockCatalogSku`) from `src/tests/shared.ts`.

---

## Appendix A: Agent Knowledge References (Knowledge Graph Directory)

To prevent architectural bleeding, agents must clearly distinguish between **UI/UX Skill Knowledge** (which dictates how the system looks, feels, and interacts) and **Backend Skill Knowledge** (the deep algorithmic rules and schema transformations that happen asynchronously or server-side).

### UI/UX Skill Knowledge
These files define the presentation layer, component styling, animations, global states, and visual regressions. Always consult these when building or modifying React components:
- [UI States & Transitions](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/ui-states.md)
- [State Architecture Contracts](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/state-contracts.md)
- [API Contract & Integration Specifications](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/api-contracts.md)
- [UI Component Registry & Skills](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/docs/ui-component-registry.md)
- [Loading, Zero-State & Error Specs](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/AGENTS.md#16-loading-zero-state--error-specifications) *(see §16 of this file)*

### Backend Skill Knowledge
> [!NOTE]
> Backend algorithmic skills and extraction logic have been officially decoupled into a separate backend platform repository as of Phase 7. The UI is strictly a dumb client presentation layer. AI Agents modifying this repository should not implement backend logic in React.

---

## 25. Phase 11: SolutionProject Grouping & UCID Parallelism

### 25.1 SolutionProject Wrapper Dominance
*   **Issue**: Floating UCIDs caused visual inconsistencies across tabs because components filtered by raw arrays rather than scoped solution projects.
*   **Solution**: `activeSolutionId` is now the definitive master state pivot. Every UCID *must* possess a `solutionId` foreign key linking it to a `SolutionProject`. Components must filter their data using `useCoreStore(s => s.activeSolutionId)`.

---

## 26. Phase 12 Drag & Drop Architecture & Native Interactivity

### 26.1 Native HTML5 Drag and Drop Mandate
*   **Rule**: We strictly avoid massive third-party DND libraries (`dnd-kit`, `react-beautiful-dnd`) to minimize JS bundle weight and maintain React 19 compatibility without fighting deprecated lifecycles.
*   **Implementation**: All drag operations MUST use native HTML5 attributes: `draggable={true}`, `onDragStart`, `onDragOver`, and `onDrop`.
*   **Payload Transport**: Use `e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'entity', id: '123' }))` to transport typed interaction payloads cleanly between isolated DOM subtrees (e.g., passing Orphan ID from `TaxonomyOrphanBox` into `KnowledgeGraphCanvas`).

### 26.2 Drag-to-Heal State Mutations (Taxonomy Graph)
*   **Rule**: Visual "Heal" interactions (like dropping an unmapped SKU onto a valid Catalog Node) MUST trigger an optimistic state mutation locally *while* dispatching the API call to `/api/taxonomy/map`. This ensures UI snappiness while preserving backend source-of-truth.

### 26.3 Testing Interactivity
*   **Rule**: When validating DND in E2E tests, standard Playwright interactions or Vitest DOM mocks (like `fireEvent.dragStart` and `fireEvent.drop`) must be explicitly targeted to the `dataTransfer` lifecycle.

### 26.4 Ingestion & Splitting Boundaries
- **The BOQ**: When a user uploads a BOQ (Bill of Quantities), they are uploading a `SolutionProject` campaign (e.g. "HQ Expansion"). 
- **The Split**: The Ingestion Hub parses the BOQ and splits it into multiple distinct, parallel configurations (e.g., Compute, Storage, Networking). 
- **The Contract**: Each of these split configurations becomes a `UCID`. Therefore, the `UCID` schema now mandates the inclusion of the parent's contextual pointers:
  - `solutionId`: The UUID of the parent `SolutionProject`
  - `solutionDisplayId`: The human-readable parent display ID (e.g. `SOL-2026-001`)
  - `configIndex`: Numeric order of this specific parallel track (e.g. 1)
  - `configLabel`: Sourced config name (e.g. "Primary Spec")

### 26.5 Sourcing UI View Scoping
- Components like `TaxonomyGraph`, `SolutionBuilder`, and `MissionControl` must NOT randomly display all global UCIDs in a flat list. 
- The Global Store (`coreStore`) tracks the `activeSolutionId`.
- **View Render Rules**: Always filter your visible `availableUcids` to only those matching `u.solutionId === activeSolutionId`.
- **Creation Rules**: When rendering modal triggers (like `NewUCIDModal`), default the new record to link to the global `activeSolutionId`. Never inject orphaned UCIDs into the store unless explicitly simulating an error state.

### 26.6 Campaign Consolidation Hub (The Rollup)
- **Purpose**: Because UCIDs are now split by hardware category, the user requires a macro-view to negotiate the entire campaign.
- **The Hub**: `CampaignConsolidationHub` automatically groups child UCIDs by their `SolutionProject` and calculates the total original budget versus the total sourced budget across all tracks. 
- **Decision Engine**: It exposes portfolio-wide operations like `Best-of-Breed` (picking the cheapest across all vendors) or `Single-Source` (forcing all configs to HPE or Dell to trigger volume rebates), before securely locking the entire campaign in a unified snapshot covenant.

---

## 27. Backend Mission Control Workflow Delegation (Phase 13 Prep)

### 27.1 Workflow State Simulation vs Real Execution
*   **Current State**: The `useMissionControlWorkflow` hook in the frontend simulates the progression of AI subflows (e.g., "Parsing BOQ", "Semantic Search", "Taxonomy Matching", "BOM Generation") using network-delayed handlers in `coreHandlers.ts`. 
*   **Rule for Backend**: When building the real backend pipelines, the API must NOT run these heavy workflows synchronously in a single HTTP request, or it will trigger 504 Gateway Timeouts.
*   **Implementation Mandate**:
    - The UI layer will trigger an asynchronous `/api/workflows/run` POST request.
    - The backend MUST return a `jobId` immediately (202 Accepted).
    - The frontend will utilize the existing `JobStreamer` component to poll or listen via SSE (Server-Sent Events) for granular step-by-step progress updates.

### 27.2 State Machine Transitions
*   **Current State**: `activeStepIndex` manually iterates via `completeStep` in the UI.
*   **Backend Handoff**: The backend workflow orchestrator (e.g., Temporal or Kafka) must broadcast the precise `currentStep` and `completedSteps` array back to the frontend. The `activeStepIndex` in `MissionControl.tsx` must become a purely reactive prop derived from the active UCID's `syncStatus` payload, entirely eliminating frontend-driven timeouts.

---

## 28. Perfecting Global State Mocking in Vitest

### 28.1 The "createMockCoreState" Mandate
*   **Issue**: Global state (Zustand `CoreState`) continuously expands with new fields and methods across development phases. When test mocks use partial object literal injections or outdated shapes for this state, they trigger cascading `Type 'X' is not assignable to type 'CoreState'` TypeScript compilation errors, blocking the entire CI pipeline due to missing newly added properties.
*   **Solution**: Mocks simulating global stores MUST NOT declare literal overrides natively in the test suite. All global state test instances must be initialized using the central `createMockCoreState` factory in `src/tests/shared/mockFactories.ts`. Furthermore, whenever `CoreState` is extended with new domains (e.g., `solutions`), developers must immediately mirror these properties inside `createMockCoreState`. This ensures a single source of truth for test type compliance and prevents "Zero-Tolerance TypeScript drift".
