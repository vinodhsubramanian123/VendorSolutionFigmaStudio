# Campaign Consolidation Hub Skills

## Overview
The `CampaignConsolidationHub` is the macro-view used to negotiate and rollup multiple parallel UCIDs inside a single `SolutionProject` campaign.

## State Contracts
- Reads from `coreStore`: `ucids` filtered by `activeSolutionId`.
- Reads `SolutionProject` data.

## Expected Interactions
- Aggregate Total Original Budget vs Sourced Budget across all hardware categories.
- Apply `Best-of-Breed` (pick cheapest across all vendors) or `Single-Source` (force all to HPE/Dell) operations.
- Lock all child UCIDs into a unified snapshot covenant.

## Component Boundary
- Must render `CampaignHeader`, `ProcurementEvents`, and `CostSavingMetrics` as decomposed sub-components.
