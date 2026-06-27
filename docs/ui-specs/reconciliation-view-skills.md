# Reconciliation View — Component Skills

## Visual Layout & Constraints
- **Layout Structure:** Diff-view style panes comparing original client BOQ strings vs parsed catalog SKUs.
- **Highlighting:** Red highlights for missing lines, Green for confident matches, Yellow for ambiguous fuzzy matches.

## State Connections (Zustand Store)
- **State Connections (Props):** `ucids`, `catalogSkus`.

## Interactivity (Skills)
1. **Manual Linkage:** Drag-and-drop or select an ambiguous BOM string and force link it to an active Catalog SKU.
2. **Confidence Approval:** Accepting suggested semantic links, which triggers updates to the `rawBOM` arrays in the UCID state.
