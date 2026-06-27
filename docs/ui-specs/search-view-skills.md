# Search View — Component Skills

## Visual Layout & Constraints
- **Layout Structure:** Omni-search interface listing cross-domain results (UCIDs, Catalog Parts, Vendors).
- **Result Grouping:** visually segregates results by domain using distinct icon and color badges.

## State Connections (Zustand Store)
- **State Connections (Props):** `ucids`, `catalogSkus`, `vendors`.

## Interactivity (Skills)
1. **Global Fuzzy Match:** Filters across multiple stores based on a single text string derived from TopBar `searchQuery`.
2. **Contextual Routing:** Clicking a UCID navigates to Mission Control, clicking a SKU navigates to Catalog.
