# Catalog Manager — Component Skills

## Visual Layout & Constraints
- **Search Header:** Fixed search bar with taxonomy path filters.
- **List Viewport:** Uses strictly `react-virtuoso` (`Virtuoso` or `VirtuosoGrid`) to render thousands of Catalog SKUs without browser hang.
- **Row/Card Items:** Displays SKU, vendor, price, and status tags cleanly.

## State Connections (Zustand Store)
- **State Connections (Props):** `catalogSkus` passed from the core store via App.tsx.
- **Performance Hook:** High-volume array operations (filtering, searching) MUST be wrapped in `useMemo` hooks.

## Interactivity (Skills)
1. **Fuzzy Search:** Local filtering of the SKU catalog based on user text input.
2. **Taxonomy Drill-down:** Filter by `type` or vendor paths to refine visible results.
3. **No-Result State:** Clear indicator when search terms yield zero active items.
