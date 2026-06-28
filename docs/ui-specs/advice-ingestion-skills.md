# Advice Ingestion Resolution Skills

## Overview
Handles CLIC/Premier workbook advice parsing (`AdviceFileIngestion` and `AdviceResolutionPanel`).

## State Contracts
- Excludes `Information` and `Summary` tabs per AGENTS.md rule 8.1.
- Validates extracted warnings via `AdviceResolution` JSON array schemas.

## Expected Interactions
- Highlights warnings linked to Active BOM indicators.
- Resolves AND/OR sub-list choices from complex vendor validation strings.
