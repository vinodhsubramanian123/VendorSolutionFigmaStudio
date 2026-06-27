# Solution Manager — Component Skills

## Visual Layout & Constraints
- **Layout Structure:** Master table/grid listing all `SolutionProject` entities grouped by Status or Execution Mode.
- **List Items:** Summarizes `configCount`, primary vendors, and timestamps.

## State Connections (Zustand Store)
- **Store Hooks:** `solutions` via `useCoreStore(s => s.solutions)`.

## Interactivity (Skills)
1. **Quick Actions:** Create New Solution (routes to Mission Builder), Delete, or Archive.
2. **Solution Drill-down:** Clicking a Solution routes to `/solutions/:id` (Solution Detail).
