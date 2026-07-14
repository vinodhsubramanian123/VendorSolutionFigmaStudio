# Graph Report - docs  (2026-07-14)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 36 nodes · 27 edges · 15 communities (5 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 351 input · 40 output

## Graph Freshness
- Built from commit: `3436cdcc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- API Infrastructure and Routing
- Data Architecture and State
- UI Component Skill Registry
- ForensicView.tsx
- deriveGraphFromConfig
- POST /api/ingest
- /api/ucids/:ucid/snapshots
- Code Smell & Quality Gap Analysis
- UI/UX 100/100 Verification Checklist
- PaginatedData<T>
- Phase Learnings & Post-Mortems
- Architecture & Test Registry
- UI States

## God Nodes (most connected - your core abstractions)
1. `Zustand Core Store` - 6 edges
2. `UI/UX Component Specifications Registry` - 5 edges
3. `API Client` - 5 edges
4. `Agent Skills & Architecture Index` - 4 edges
5. `deriveGraphFromConfig` - 2 edges
6. `Backend Route Inventory` - 2 edges
7. `Data Architecture Consolidation Plan` - 2 edges
8. `Data Ownership Hierarchy` - 2 edges
9. `ApiResponse<T>` - 1 edges
10. `ApiErrorResponse` - 1 edges

## Surprising Connections (you probably didn't know these)
- `API Client` --implements--> `ApiResponse<T>`  [EXTRACTED]
  src/services/apiClient.ts → api-contracts.md
- `API Client` --implements--> `ApiErrorResponse`  [EXTRACTED]
  src/services/apiClient.ts → api-contracts.md
- `Backend Route Inventory` --references--> `API Client`  [EXTRACTED]
  architecture/backend-route-inventory.md → src/services/apiClient.ts
- `Data Architecture Consolidation Plan` --conceptually_related_to--> `Zustand Core Store`  [EXTRACTED]
  architecture/data-architecture-plan.md → src/store/coreStore.ts
- `Data Ownership Hierarchy` --conceptually_related_to--> `Zustand Core Store`  [EXTRACTED]
  architecture/data-ownership.md → src/store/coreStore.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Client-side Taxonomy Graph Derivation** — src_hooks_usecataloggraphdata, derive_graph_from_config, src_store_corestore [EXTRACTED 1.00]
- **Mission Control Workflow Steps** — src_components_mission_control_missioncontrol, src_components_ingestion_ingestionhub, src_components_solution_builder_solutionbuilder, src_components_reconciliation_reconciliationview [EXTRACTED 0.90]
- **Data Ownership & State Flow** — src_store_corestore, src_services_apiclient, server_ts [EXTRACTED 1.00]
- **Core Data Governance** — architecture_data_ownership, architecture_data_architecture_plan, src_store_corestore [EXTRACTED 1.00]
- **UI/UX Standardization & Audit** — architecture_ui_ux_audit, architecture_ui_ux_100_checklist, architecture_code_quality_analysis [EXTRACTED 0.90]
- **API & Backend Alignment** — architecture_backend_route_inventory, server, src_services_apiclient [EXTRACTED 1.00]

## Communities (15 total, 10 thin omitted)

### Community 0 - "API Infrastructure and Routing"
Cohesion: 0.33
Nodes (5): ApiErrorResponse, ApiResponse<T>, Backend Route Inventory, Express Server, API Client

### Community 1 - "Data Architecture and State"
Cohesion: 0.60
Nodes (4): Agent Skills & Architecture Index, Data Architecture Consolidation Plan, Data Ownership Hierarchy, Zustand Core Store

### Community 2 - "UI Component Skill Registry"
Cohesion: 0.40
Nodes (5): UI/UX Component Specifications Registry, Campaign Hub Skills, Dashboard Skills, Mission Control Skills, Taxonomy Graph Skills

## Knowledge Gaps
- **19 isolated node(s):** `ApiResponse<T>`, `ApiErrorResponse`, `PaginatedData<T>`, `POST /api/ingest`, `POST /api/forensics/align` (+14 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Zustand Core Store` connect `Data Architecture and State` to `ForensicView.tsx`, `deriveGraphFromConfig`?**
  _High betweenness centrality (0.241) - this node is a cross-community bridge._
- **Why does `API Client` connect `API Infrastructure and Routing` to `ForensicView.tsx`?**
  _High betweenness centrality (0.150) - this node is a cross-community bridge._
- **Why does `Agent Skills & Architecture Index` connect `Data Architecture and State` to `UI Component Skill Registry`?**
  _High betweenness centrality (0.135) - this node is a cross-community bridge._
- **What connects `ApiResponse<T>`, `ApiErrorResponse`, `PaginatedData<T>` to the rest of the system?**
  _19 weakly-connected nodes found - possible documentation gaps or missing edges._