# Taxonomy Graph — Component Skills

## Visual Layout & Constraints
- **Header Section:** Houses the Solution Dropdown, Config Context Dropdown, and Filter/Refresh buttons.
- **Canvas Viewport:** A fixed-height container (`min-h-[560px]`) enclosing the Graph structure.
- **Zero State (Critical):** If no context configuration is selected, it forcibly unmounts the graph array and displays a `<GitFork>` icon placeholder warning the user to select context.

## State Connections (Zustand Store)
- **Store Hook:** Connects to `solutions` and `ucids` to derive context loops.
- **Dependency Map:** `availableUcids` dynamically derives only the UCIDs matching `selectedSolution?.ucidIds`.

## Interactivity (Skills)
1. **Context Switching:** Picking a different Solution auto-selects the first available UCID in that solution.
2. **Graph Filtering:** `filterOrphansOnly` conditionally redraws topology lines to spotlight only disjointed components.
3. **Lazy Hydration:** Nodes are not hydrated into the DOM if the parent Solution lacks an active configuration base (protecting memory).
