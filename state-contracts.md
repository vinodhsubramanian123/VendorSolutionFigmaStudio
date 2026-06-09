# VSIP Platform State Management Contract

This document defines the strict boundaries for state management across the Vendor Solution Intelligence & Procurement Integrity (VSIP) Platform to prevent layout flickers and ensure robust cross-view state synchronization.

## 1. Global / Cross-View State
**Technology**: React Context / Prop-Drilling via `App.tsx` using `useLocalStorageState` for persistence.
**Use Cases**:
- Active UCID master arrays (Master context for the current session)
- Ingestion Pipeline Status (e.g., waiting for backend processing, percentage complete)
- `SolutionBuilder`, `ReconciliationView`, and `TaxonomyGraphEditor` are fully welded to the primary state loop in `App.tsx`.
- Forensic Issue State and Global Diagnostics (e.g., EOL risks, pricing anomalies).
**Rule**: Views must NEVER hold their own duplicate copies of the active UCID or master ingestion statuses. Derive these values directly from the high-level context.

## 2. Zero-State (Empty State) Consistency
**Rule**: All modules must implement visual "Zero-State" UI empties when required global data is absent.
- Do not start React applications in an undefined or null state and immediately jump to a spinner.
- Empty lists or undefined properties must fall back to graceful landing pages indicating "No Active Missions" or "Waiting for Ingestion", providing a clear path to begin workflows.

## 3. Local / Component State
**Technology**: `useState` and `useReducer`
**Use Cases**:
- Form inputs and text fields before submission
- Modal open/close toggles
- Temporary UI states (e.g., hover flags, accordion expansions)
- Local search or filter terms within a specific view
**Rule**: Do not lift UI-only state to global context. 

## 4. Server-Derived & Auto-Heal State
**Technology**: Auto-Heal Sync Hooks (e.g., Phase 3 global `useEffect` triggers), and standard data fetching wrappers.
**Use Cases**:
- The **Forensic Auto-Heal Hook**: A global `useEffect` at the `App.tsx` level monitors the unified data state (`ucids`, `vendors`, `catalogSkus`) and auto-heals global metrics cross-platform when underlying structural errors are corrected.
- Paginated Catalog SKUs and Historic Logs.
**Rule**: When updating server state via actions (e.g., "Auto-Align" in Forensics), the UI should eagerly reflect the final derived state (Optimistic updates) and then confirm with the API response to avoid layout "snapping".

## 5. Performance & Memoization Contract
- Use `useMemo` strictly when rendering lists greater than 50 items.
- Use `useCallback` when passing event handlers deep into highly-rendered children (like Table Rows).
