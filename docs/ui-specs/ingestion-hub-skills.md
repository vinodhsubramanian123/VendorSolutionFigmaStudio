# Ingestion Hub — Component Skills

## Visual Layout & Constraints
- **Layout Structure:** Large drag-and-drop zone overlaying a history grid of past file ingestions.
- **Progress Indicators:** Parsing and validation steps shown as sequenced progress bars.

## State Connections (Zustand Store)
- **State Connections (Props):** `ucids`, `solutions`.
- **Global API Context:** Consumes `isPendingAPI` from `App.tsx` context to lock file drops while processing.

## Interactivity (Skills)
1. **File Parsing Mocking:** Simulates MSW upload latency for Excel/PDF BOQ sheets.
2. **Auto-Forwarding:** Upon successful mock ingestion, automatically routes the user to the Mission Builder (`/solution-builder`).
