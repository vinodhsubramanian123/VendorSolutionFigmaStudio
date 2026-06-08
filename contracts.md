# VSIP Platform - Architecture & Contracts Guide (Phase 4 & 5)

This document serves as the single source of truth for the finalized frontend engineering blueprint, UI states, state management rules, and backend API contracts. It is intended to guide the upcoming Express + Database implementation.

## 1. Finalized UI States & Architecture

The React application is structurally complete. It operates around the `App.tsx` state root using a context-like prop-drilling or unified global state management across core distinct views:

- **Dashboard**: The master overview, showing statistical rollups.
- **IngestionHub**: Facilitates file uploads (BOMs/BOQs), parsing, and basic extraction.
- **LiveMission**: The heart of the platform. Visualizes UCID pipeline workflows (`boq-intake` -> `pre-intelligence` -> `solution-design` -> `vendor-provisioning` -> `post-intelligence` -> `comparison` -> `snapshot`).
- **VendorPortal**: A simulation sandbox allowing suppliers to submit alternative designs and quotes directly against active UCIDs.
- **ReconciliationView**: Diff analyzer to catch price markup/shrinkage and configuration drift.
- **CatalogManager**: Displays the primary parts taxonomy and inventory limits.
- **SearchView**: Provides an NLP-like semantic parsing interface for identifying components.
- **ReportsView / CleansingView / TaxonomyGraphEditor**: Supporting views for auditing, deduplication, and ontology mapping.

### State Management Rules

1. **Top-Level Ownership**: The state of `ucids`, `vendors`, `catalogSkus`, `forensicIssues` is currently owned by `App.tsx`.
2. **Immutability Strictness**: Arrays and nested structures (like `Solution` -> `VendorSubmission` -> `Config`) must be updated via clean React immutability patterns (e.g. `map`, `spread`). Never mutate nested properties in place.
3. **Synchronous Propagation**: Prop drilling is utilized due to the lack of Redux/Zustand. All state setters trigger synchronous topological cascading updates to children.

## 2. API Contracts & Payload Specifications

With Phase 4 complete, `src/types/data.ts` now securely locks down all master interfaces.
When transitioning to an Express Server, the endpoints should respect these payload signatures:

### 2.1 Ingestion API
**POST `/api/v1/ingest`**
*   **Request (`IngestBOMRequest`)**: `{ "fileName": string, "rawContent": string, "source": 'manual' | 'api' }`
*   **Response (`IngestBOMResponse`)**: `{ "success": boolean, "ucid": UCID, "matchMetrics": {...} }`

### 2.2 Unified Configuration Identifier (UCID) Operations
**GET `/api/v1/ucid/:id`**
*   **Request (`GetUCIDDetailRequest`)**: `?includeEvents=true&includeSnapshots=true`
*   **Response (`GetUCIDDetailResponse`)**: `{ "ucid": UCID }`

**PATCH `/api/v1/ucid/:id/step`**
*   **Request (`UpdateUCIDStepRequest`)**: `{ "ucidId": string, "nextStep": string }`
*   **Response (`UpdateUCIDStepResponse`)**: `{ "success": boolean, "ucid": UCID }`

### 2.3 Vendor Submissions & Snapshots
**POST `/api/v1/ucid/:id/snapshot`**
*   **Request (`CreateSnapshotRequest`)**: `{ "ucidId": string, "winnerVendor": "HPE", "signerName": "Alice" }`
*   **Response (`CreateSnapshotResponse`)**: `{ "success": boolean, "snapshot": Snapshot, "ucid": UCID }`

**POST `/api/v1/portfolio/orchestrate`**
*   **Request (`PortfolioOrchestrateRequest`)**: `{ "portfolioId": "...", "ucids": [...] }`
*   **Response (`PortfolioOrchestrateResponse`)**: `{ "success": true, "status": "orchestrating" }`

## 3. Backend Readiness Gate

By observing this specification:
1.  All TypeScript compilation is STRICT and green.
2.  All `targetUcidId` and `vendorSubmissions` nested properties are statically typed inside `Solution`.
3.  The UI experiences no missing data, dummy variables, or `undefined` regressions.

**The frontend is formally FROZEN.** We are now fully prepared to initiate Database schemas (e.g., Prisma, Drizzle, or raw SQL) and write the Express routes.
