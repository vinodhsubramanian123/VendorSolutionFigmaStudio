# UI/UX Component Specifications Registry ("Skills")

This registry links all UI/UX components and views within the Vendor BOM Engine to their respective structural specifications and behaviors. This guarantees that UI/UX engineers can safely redraw, recreate, or modify screens with full knowledge of the data contracts and state interactions required for the logic to function.

## Main Application Views

| View Name | Route | Spec / Skills Document | Description |
| : | :
| **Campaign Hub** | `/campaign-hub` | [Campaign Hub Skills](ui-specs/campaign-hub-skills.md) | Rollup view for SolutionProject campaigns. |
| **BOQ Ingestion** | Module | [BOQ Ingestion Skills](ui-specs/boq-ingestion-skills.md) | Handles multi-tab workbook ingestions. |
| **Sourcing Rules** | Module | [Sourcing Rules Skills](ui-specs/sourcing-rules-skills.md) | Vault for human-in-the-loop mapping logic. |
| **Advice Ingestion** | Module | [Advice Ingestion Skills](ui-specs/advice-ingestion-skills.md) | CLIC/Premier vendor advice processing. |

---

## Decomposed Sub-Components Map
- `SourcingRulesVault` -> `AddRuleForm`, `RulesTable`
- `CleansingView` -> `MappingPanel`, `CleansingHeader`, `QualityMetrics`
- `SystemTelemetry` -> `DocumentPipelinePanel`, `ApiLogsTable`, `WebhookMonitor`
- `TaxonomyGraphSidebar` -> `TaxonomyGraphPanels` (MechanicalConstraints, OrphanWorkshop, PathOrchestrator)
- `BomReconciliationPanel` -> `BomSummaryHeader`, `VendorDifferencesTable`
- `Dashboard` -> `UcidPipelineCard`
- `CampaignConsolidationHub` -> `CampaignHeader`, `ProcurementEvents`, `CostSavingMetrics`

---
 | :