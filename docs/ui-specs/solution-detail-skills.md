# Solution Detail — Component Skills

## Visual Layout & Constraints
- **Header Section:** Features back navigation to the parent list, Solution Name prominently displayed, and a top-level `StatusBadge`.
- **Layout:** Standard 1-to-2 column split (`lg:grid-cols-3`). Left column contains Metadata and Vendors; Right column lists configuration components.
- **Zero States:** If no UCIDs are mapped, displays a subtle, centered placeholder indicating "No configurations instantiated yet".

## State Connections (Zustand Store)
- **Store Hook:** `useCoreStore(s => s.solutions)` to lookup via `:id` router param.
- **Derived State:** Filters `ucids` context to find `u.solutionId === solution.id`.
- **Typing Integrity:** Directly maps `VendorAssignment` schemas into visual blocks.

## Interactivity (Skills)
1. **Dynamic Vendor Prioritization:** Shows "Primary" badges specifically parsed from `isPrimary` tags inside the `VendorAssignment` loop.
2. **Execution Mode Coloring:** Distinct visual styling applied per `executionMode` attribute on each nested UCID (e.g. Automated -> Emerald, Manual -> Amber).
