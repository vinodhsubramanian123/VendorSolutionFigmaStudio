# BOQ Ingestion Workbook Skills

## Overview
The `BoqIngestWorkbook` component parses multi-tab raw excel dropping events and bridges them to the backend API (`/api/boq/ingest`).

## State Contracts
- Validates payload strictly via `IngestRequest` schema.
- Uses `JobStreamer` for streaming progress of ingestion.

## Expected Interactions
- Handles file drag-and-drop.
- Pre-flight checks on file extensions (`.csv`, `.xlsx`).
- Dispatches parsed multi-tab data into parallel UCIDs tagged by `SolutionProject`.
