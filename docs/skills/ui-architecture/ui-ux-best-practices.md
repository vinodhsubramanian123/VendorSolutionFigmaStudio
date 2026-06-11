# UI/UX and Component Architecture Best Practices

## 1. Avoid Cascading State Updates (setState in useEffect)
**Anti-Pattern:** Using `useEffect` to watch props and then calling `setState` to update a local component state. This causes double-renders, React warnings, and breaks state synchronization with the parent.
**Best Practice:** Derive state during the render phase using `useMemo` or simple variables.
- *Example*: In `VendorIngestionDesk`, derive `portalConfig` synchronously from `vendorConfigs` using `useMemo` instead of mapping it in a `useEffect` into a local state variable.

## 2. Component Extraction and Complexity Reduction
**Anti-Pattern:** Large monolithic components containing multiple complex `useState` hooks, `useEffect` hooks, and complex JSX conditions (like rendering modals directly inside the main render loop). This leads to high cyclomatic complexity and ESLint errors.
**Best Practice:** Extract isolated features (like Modals or sub-panels) into their own components. Pass down only the required props and callbacks.
- *Example*: In `SnapshotsPanel`, extracting `SnapshotNewModal` and `SnapshotDiffModal` into separate components completely removed state-syncing bugs, satisfied the ESLint cyclomatic complexity limit, and significantly reduced cognitive load.

## 3. Robust Selectors for E2E Testing (Playwright)
**Anti-Pattern:** Relying on `.class` names, structure (`div > span`), or ambiguous text (`getByText('Mapping')`) in Playwright tests. This causes flaky tests when component internal structure changes or text appears in multiple places (e.g., in a description).
**Best Practice:** Use robust, specific `data-testid` attributes on interactive elements. When querying text, use exact matches `getByText('Exact Text', { exact: true })` or better, bind tests to test IDs.
- *Example*: Replacing `getByText('Auto-cleanse')` with `getByTestId('btn-auto-cleanse')` in `CleansingView`.

## 4. ESLint Strict Compliance
**Best Practice:** Treat all ESLint warnings and errors as critical. Specifically avoid:
- Missing dependencies in `useEffect` or `useMemo`.
- Unused variables or imports.
- High cyclomatic complexity. Break complex components into smaller ones before linting rules flag them.

## 5. UI/UX "Circle of Intelligence" Gaps
**Best Practice:** Ensure state flows circularly and securely. If a user triggers a diagnostic action (like "Auto-Align" in `ForensicView` or orphaned category mapping in `TaxonomyGraphView`), the component should update the state directly via the callback provided by the parent, rather than holding a decoupled local state that becomes stale.

## 6. Synchronous Render Flow
**Anti-Pattern:** Fetching static data or resolving purely synchronous mapping data inside an asynchronous `useEffect`, causing the UI to flicker with a loading state unnecessarily.
**Best Practice:** Execute synchronous array operations in the render cycle. If it's heavy, wrap it in `useMemo`. Avoid `useEffect` for things that don't actually trigger network or asynchronous browser API calls.
