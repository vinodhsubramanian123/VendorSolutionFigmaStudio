# VSIP System Test Journeys

This document contains explicit user journey scripts to systematically test the VSIP Platform. AI Agents must follow these scripts step-by-step when testing implementations, rather than ad-hoc testing.

## Journey 1 - Data Ingestion
1. Start at `LiveMission` view.
2. Click "Create New Mission" or select an active UCID.
3. Navigate to `IngestionHub`.
4. Upload Vendor CSV (or trigger mock fetch).
   * **Expectation**: Toast notification appears "Ingestion started".
5. Observe `IngestionHub` status.
   * **Expectation**: Status updates to "Processing" simulating backend load.
6. Verify success state.
   * **Expectation**: Status changes to "Complete" without layout shift, relevant error/success counts display.
7. Navigate to `ForensicView`.
   * **Expectation**: Ingested UCID row data should now be visible and flagged if constraints failed.

## Journey 2 - Solution Building & Catalog
1. Navigate to `SolutionBuilder` for an active UCID.
   * **Expectation**: The "Solution Workspace Empty" zero-state shows if no items exist.
2. Search for a CPU part in the side panel or `CatalogManager`.
   * **Expectation**: The search list filters smoothly via `useMemo` optimization.
3. Add a part to the builder.
   * **Expectation**: The item appears in the configuration table immediately.
4. Attempt to add an incompatible part (if rules exist).
   * **Expectation**: A Toast warning displays or inline error badge shows on the part.

## Journey 3 - Visual Forensic & Auto-Align
1. Navigate to `ForensicView` containing identified anomalies.
   * **Expectation**: Anomalies list is populated; critical warnings highlighted in `#ff3d5a`.
2. Locate an issue that can be auto-resolved.
3. Click "Auto-Align" action.
   * **Expectation**: Row optimistically transitions to a resolving state (disabled buttons).
   * **Expectation**: After completion, issue is marked resolved and row updates styles appropriately without reloading the page.

## Journey 4 - Reconciliation Display
1. Navigate to `ReconciliationView` after vendor options are ingested.
   * **Expectation**: Table correctly diffs baseline against vendor configurations.
   * **Expectation**: "LineReconciliationDiff" renders with highlighting for pricing/qty variances.
2. Change the view mode or filtering options.
   * **Expectation**: Table re-renders efficiently without spinner flashes.
