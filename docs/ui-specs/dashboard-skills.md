# Dashboard — Component Skills

## Visual Layout & Constraints
- **Layout Structure:** High-level metrics grid (4 cards) at the top, followed by a wide-format activity feed or recent deployments list.
- **Widgets:** Uses standard data visualization components (charts, lists) respecting the Cosmic Slate theme.
- **Zero States:** If no UCIDs exist, displays a call-to-action block directing users to the Ingestion Hub or Mission Builder.

## State Connections (Zustand Store)
- **State Connections (Props):** `solutions`, `ucids`, `vendors`, `forensicIssues`.
- **Derived State:** Aggregates statistics like total spend, vendor distribution, and active alerts from the raw stores to avoid heavy re-computation on renders.

## Interactivity (Skills)
1. **Quick Navigation:** Clicking a recent deployment card routes immediately to `/mission-control/:id`.
2. **Alert Triaging:** Any critical alerts shown in the dashboard link directly to the Forensic View with the relevant context pre-selected.
