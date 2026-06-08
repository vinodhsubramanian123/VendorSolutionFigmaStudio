# VSIP Platform State Management Contract

This document defines the strict boundaries for state management across the Vendor Solution Intelligence & Procurement Integrity (VSIP) Platform to prevent layout flickers and ensure robust cross-view state synchronization.

## 1. Global / Cross-View State
**Technology**: React Context (or centralized hooks like `useLocalStorageState` where persistence is needed).
**Use Cases**:
- Active UCID (Master context for the current session)
- Ingestion Pipeline Status (e.g., waiting for backend processing, percentage complete)
- Global Theme Preferences (if any)
- Authentication/User Session State
**Rule**: Views must NEVER hold their own duplicate copies of the active UCID or master ingestion statuses. Derive these values directly from the high-level context.

## 2. Local / Component State
**Technology**: `useState` and `useReducer`
**Use Cases**:
- Form inputs and text fields before submission
- Modal open/close toggles
- Temporary UI states (e.g., hover flags, accordion expansions)
- Local search or filter terms within a specific view
**Rule**: Do not lift UI-only state to global context. 

## 3. Server-Derived State (API)
**Technology**: Ideally SWR, React Query, or centralized `useEffect` data fetching wrappers with strict dependency tracking.
**Use Cases**:
- Paginated Catalog SKUs
- Forensic Logs and Audit Trails
- Snapshot history
**Rule**: When updating server state via actions (e.g., "Auto-Align"), the UI should eagerly reflect the final derived state (Optimistic updates) and then confirm with the API response to avoid layout "snapping".

## 4. Performance & Memoization Contract
- Use `useMemo` strictly when rendering lists greater than 50 items.
- Use `useCallback` when passing event handlers deep into highly-rendered children (like Table Rows).

## 5. Synchronous Fallback State
Do not start React applications in an undefined or null state and immediately jump to a spinner. Define the default shape for arrays as `[]` instead of `null` unless the specific `null` state represents "not yet loaded" for a specific UX reason.
