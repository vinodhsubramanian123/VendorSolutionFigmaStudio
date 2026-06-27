# Cleansing View — Component Skills

## Visual Layout & Constraints
- **Layout Structure:** Data grid specifically honed for identifying bad taxonomy strings, duplicate vendor names, and malformed prices.
- **Bulk Action Bar:** Floating action bar appears when multiple dirty rows are selected.

## State Connections (Zustand Store)
- **State Connections (Props):** `catalogSkus`.

## Interactivity (Skills)
1. **Regex Pattern Find/Replace:** Execute batch fixes across selected Catalog Skus (e.g. converting "Hewlett Packard" to "HPE" globally).
2. **Data Scrubbing Mocks:** Simulates cleaning routines via MSW delays before updating the store.
