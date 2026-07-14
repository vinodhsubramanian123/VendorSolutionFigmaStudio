# Graph Report - specification  (2026-07-14)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 19 nodes · 7 edges · 12 communities (2 shown, 10 thin omitted)
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3436cdcc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Ingestion Hub
- Vendor Solution Intelligence & Procurement Integrity Platform
- /api/agents/run
- /api/integrations/dispatch
- /api/taxonomy/check-constraints
- /api/reconciliation/compare
- Catalog Manager
- Cleansing View
- Overview Dashboard
- Forensic View
- Data Persistence Gate
- Solution Builder

## God Nodes (most connected - your core abstractions)
1. `Vendor Solution Intelligence & Procurement Integrity Platform` - 2 edges
2. `Ingestion Hub` - 2 edges
3. `Cosmic Slate Theme` - 1 edges
4. `Mission Control` - 1 edges
5. `Taxonomy Graph View` - 1 edges
6. `Vendor Portal` - 1 edges
7. `System Telemetry` - 1 edges
8. `/api/boq/ingest` - 1 edges
9. `/api/agents/run` - 1 edges
10. `/api/taxonomy/check-constraints` - 1 edges

## Surprising Connections (you probably didn't know these)
- `Ingestion Hub` --calls--> `/api/boq/ingest`  [EXTRACTED]
  src/components/ingestion/IngestionHub.tsx → PRD.md
- `Taxonomy Graph View` --calls--> `/api/taxonomy/check-constraints`  [EXTRACTED]
  src/components/taxonomy/TaxonomyGraphView.tsx → PRD.md
- `Vendor Portal` --calls--> `/api/agents/run`  [EXTRACTED]
  src/components/vendor-portal/VendorPortal.tsx → PRD.md
- `System Telemetry` --calls--> `/api/integrations/dispatch`  [EXTRACTED]
  src/components/telemetry/SystemTelemetry.tsx → PRD.md
- `VSIP UI Testing Specification` --references--> `Vendor Solution Intelligence & Procurement Integrity Platform`  [EXTRACTED]
  VSIP_UI_Testing_Specification.md → PRD.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Core Operational Modules** — src_components_dashboard_dashboard, src_components_solution_builder_solutionbuilder, src_components_ingestion_ingestionhub, src_components_mission_control_missioncontrol, src_components_forensics_forensicview, src_components_cleansing_cleansingview, src_components_taxonomy_taxonomygraphview, src_components_catalog_catalogmanager, src_components_vendor_portal_vendorportal, src_components_telemetry_systemtelemetry [EXTRACTED 1.00]
- **UCID Lifecycle Stages** — src_components_ingestion_ingestionhub, src_components_solution_builder_solutionbuilder, src_components_vendor_portal_vendorportal, src_components_forensics_forensicview, src_components_mission_control_missioncontrol [INFERRED 0.85]

## Communities (12 total, 10 thin omitted)

### Community 0 - "Ingestion Hub"
Cohesion: 0.67
Nodes (3): /api/boq/ingest, Ingestion Hub, Mission Control

### Community 1 - "Vendor Solution Intelligence & Procurement Integrity Platform"
Cohesion: 0.67
Nodes (3): Cosmic Slate Theme, Vendor Solution Intelligence & Procurement Integrity Platform, VSIP UI Testing Specification

## Knowledge Gaps
- **17 isolated node(s):** `Cosmic Slate Theme`, `Overview Dashboard`, `Solution Builder`, `Mission Control`, `Forensic View` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `Cosmic Slate Theme`, `Overview Dashboard`, `Solution Builder` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._