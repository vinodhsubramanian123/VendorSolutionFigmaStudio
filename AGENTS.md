# VSIP Platform - AI Agent Engineering Guidelines & Project Learnings

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

### 3.4 Infinite Loop Prevention in Hooks
*   **Constraint**: Never declare raw objects or deep arrays directly inside a `useEffect` dependency array. Prefer primitive type matching (numbers, booleans, strings) or stable refs.

### 3.5 High-volume Ingestion and Exporter Pipelines
*   **Rule**: When downloading or compiling large PDF or spreadsheet lists, avoid dummy empty placeholders. Implement actual downloadable outputs (such as structured, neat CSV or formatted rich text files) using a clean, transient hidden `<a>` blob element to support client-only environments gracefully.

---

## 4. Compilation Stability & Lint Checks

Before completing your turn, always execute:
1.  `npm run lint` (or use `lint_applet` tool) to catch typescript warnings.
2.  `npm run build` (or `compile_applet` tool) to ensure proper package distribution.

Keep all modifications clean, explicit, and perfectly typed. Never leave dangling comments such as `style-=` or malformed JSX statements.
