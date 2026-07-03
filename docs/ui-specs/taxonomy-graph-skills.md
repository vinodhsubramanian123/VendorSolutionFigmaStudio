# Taxonomy Graph — Component Skills

## Visual Layout & Constraints
- **Header Section:** Houses the Solution Dropdown, Filter/Refresh buttons.
- **Known gap**: no Config Context Dropdown currently exists, despite earlier docs implying one did. `TaxonomyGraphView.tsx` has `selectedConfigId` state ready for it but nothing wired up yet — it always defaults to the first config. Needed if a UCID ever has multiple vendor configs a user needs to switch between manually. See `docs/api-contracts.md` Section 5.
- **Canvas Viewport:** A fixed-height container (`min-h-[560px]`) enclosing the Graph structure.
- **Zero State (Critical):** If no context configuration is selected, it forcibly unmounts the graph array and displays a `<GitFork>` icon placeholder warning the user to select context.

## Data Source (as of Phase 4 data-ownership cleanup)
- The graph is derived client-side from real BOM items + `catalogSkus` via `deriveGraphFromConfig()` — no network call for reads. See `docs/architecture/data-ownership.md`.
- Mapping an orphan writes to the real catalog (`setCatalogSkus`), visible on every other screen immediately, not just this view.

## State Connections (Zustand Store)
- **Store Hook:** Connects to `solutions` and `ucids` to derive context loops.
- **Dependency Map:** `availableUcids` dynamically derives only the UCIDs matching `selectedSolution?.ucidIds`.

## Interactivity (Skills)
1. **Context Switching:** Picking a different Solution auto-selects the first available UCID in that solution.
2. **Graph Filtering:** `filterOrphansOnly` conditionally redraws topology lines to spotlight only disjointed components.
3. **Lazy Hydration:** Nodes are not hydrated into the DOM if the parent Solution lacks an active configuration base (protecting memory).
