# Loading, Zero-State & Error Specifications

This document defines the exact contract for empty states, loading indicators, and error boundaries for all major views.

## 1. Zero-State (Empty State) Contracts

Every view must handle the scenario where data is empty gracefully. Do not show empty tables.

### 1.1 LiveMission
- **Icon**: `Rocket` (lucide-react)
- **Copy Title**: "No Active Missions"
- **Copy Subtitle**: "Initialize a new UCID campaign to begin intelligence tracking."
- **CTA**: "Create New Mission" button.

### 1.2 IngestionHub
- **Icon**: `UploadCloud` (lucide-react)
- **Copy Title**: "Awaiting Data Payload"
- **Copy Subtitle**: "Upload a Vendor CSV or initiate a direct integration fetch."
- **CTA**: Drag-and-drop zone or "Select File" button.

### 1.3 SolutionBuilder
- **Icon**: `LayoutTemplate` (lucide-react)
- **Copy Title**: "Solution Workspace Empty"
- **Copy Subtitle**: "Construct components or import an approved BOM."
- **CTA**: "Add First Component" button.

### 1.4 ForensicView
- **Icon**: `ShieldCheck` (lucide-react)
- **Copy Title**: "No Anomalies Detected"
- **Copy Subtitle**: "The current workspace cache is empty or all constraints have passed."
- **CTA**: "Run Deep Scan" button (optional).

### 1.5 ReconciliationView
- **Icon**: `FileDiff` (lucide-react)
- **Copy Title**: "No Reconciliation Discrepancies"
- **Copy Subtitle**: "Sourced configurations match baseline parameters perfectly."
- **CTA**: None.

## 2. Loading State Contracts

All loading states must prevent layout shift. The container height must match the expected content height.

- **Lists / Tables**: Use *Skeleton Row* rendering (minimum 5 rows). Do NOT use spinners for tables.
- **Cards / Summaries**: Use *Shimmering Block* (skeleton) matching the card dimension.
- **Submit Buttons**: Render inline spinner inside the button. Change text from "Submit" to "Processing...". Disable button to prevent double submission.
- **Full Page / Initialization**: Only use a centered spinner during initial app load, never during intra-app navigation.

## 3. Error Boundary Contracts

- Apply `<ErrorBoundary>` at the root of the routing layout (around child routes).
- Apply `<ErrorBoundary>` around specific heavy modules (e.g., `TaxonomyGraphEditor`, `PlaywrightConsole`).
- **Render Output**:
  - **Background**: Dark overlay (`#03050a`).
  - **Icon**: `AlertTriangle` (color: error red `#ff3d5a`).
  - **Title**: "Module Failure"
  - **Message**: `{error.message}`. Do not show system stack traces in production.
  - **Recovery**: "Attempt Recovery" (reloads the module or resets specific component state).
