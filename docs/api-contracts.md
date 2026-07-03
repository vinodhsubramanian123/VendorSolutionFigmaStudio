# API Contract & Integration Specifications

This document formalizes the data exchange contracts to prevent integration mismatches between the front-end and the planned back-end.

## 1. Common Response Shapes

### 1.1 Success Response Wrapper
All successful 2XX HTTP responses returning structured data must follow this shape unless explicitly returning a binary blob.
```typescript
export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    requestId: string;
    timestamp: string;
  };
}
```

### 1.2 Error Response Wrapper
All 4XX and 5XX responses must follow this shape. No plain text error bodies.
```typescript
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;           // Machine-readable code e.g., 'VALIDATION_FAILED'
    message: string;        // Human-readable message
    details?: Record<string, string[]>; // Field-specific error details
  };
}
```

## 2. Pagination Contract

High-volume lists (e.g., `CatalogSKU`, Log Events, Snapshots) must implement offset/limit pagination to allow efficient use of `useMemo` and list virtualization.

### 2.1 Request Parameters (Query String)
- `offset`: Number of records to skip (default `0`).
- `limit`: Maximum number of records to return (default `50`, max `500`).
- `sortBy`: Field to sort on.
- `order`: `asc` | `desc`.

### 2.2 Response Metadata Shape
```typescript
export interface PaginatedData<T> {
  items: T[];
  pagination: {
    total: number;
    offset: number;
    limit: number;
    hasMore: boolean;
  };
}
```

## 3. Optimistic Updates Guidelines

When performing mutating actions (e.g., "Auto-Align" in Forensic View, Status Updates):
1. **Immediate Local Update**: Dispatch the state change to `coreStore` immediately (e.g., change issue status to 'resolved' and update the UI).
2. **Background Network Request**: Fire the asynchronous API call via `apiClient` (`src/services/apiClient.ts`) — never a direct `fetch()` call. This is enforced by an ESLint rule in `src/components/**`/`src/hooks/**`; see `docs/architecture/data-ownership.md`.
3. **Rollback on Failure**: If the API responds with an error, revert the local state back to its previous state and trigger an error Toast.
   *Do NOT lock the UI with a full-screen spinner for localized row updates.*

## 4. Specific Endpoint Enhancements

### 4.1 POST /api/ingest
- **Payload**: Accepts `multipart/form-data` for file uploads or `application/json` for direct integrations. Contains the workflow data representing the BOQ.
- **Behavior (Phase 2 True Ingestion)**: Instead of simulated/hardcoded matchers, the ingested workflow natively translates into a `UCID` with dynamically generated JSON structural solutions. The backend synchronously (or async via 202) processes the file and returns the structured `UCID`. The frontend immediately propagates this newly created `UCID` into the unified state, which seamlessly activates the `LiveMission` view.

### 4.2 POST /api/forensics/align
- **Payload**: `{ issueId: string, ruleId: string, action: 'override' | 'apply_fix' }`
- **Behavior (Phase 3 Forensic Auto-Heal)**: Front-end eagerly performs the underlying data mutation (e.g. replacing an EOL part with an active one in the `ucid` configuration, or correcting a price). A global `useEffect` (the Forensic Auto-Heal hook) constantly monitors the payload structure and automatically marks the `forensicIssue` as `resolved` globally, guaranteeing cross-view alignment without requiring manual status updates.

## 5. Taxonomy & Knowledge Graph — client-side derivation, not a network API

**This section previously documented `GET /api/taxonomy/graph/:configId`, `POST /api/taxonomy/map`, `DELETE /api/taxonomy/map/:nodeId` — none of these routes ever actually existed in the codebase** (the real, now-removed route was `GET /api/graph/solution/:ucid`, which ignored its own `:ucid` parameter and always returned the same 5 hardcoded nodes regardless of selection). This was a specification/reality mismatch that predates the Phase 4 data-ownership cleanup, not something that changed as a result of it — flagging here so nobody tries to "restore" a network contract that was never real.

**Current architecture** (see `docs/architecture/data-ownership.md`, Phase 4, and `src/hooks/useCatalogGraphData.ts`):
- The graph is built by `deriveGraphFromConfig(config, catalogSkus)`, a pure client-side function — one node per real BOM item (`catalog_part` if it resolves against `catalogSkus` by partNumber, `scraped_orphan` + into `unmappedIds` otherwise), one `category_hub` per distinct BOM item `type`. No network round-trip for reads.
- **Known gap**: `TaxonomyGraphView.tsx` has `selectedConfigId` state but no UI control wired to change it yet — it always defaults to `activeConfigs[0]?.id`. If a UCID ever has multiple vendor configs that need manual switching in this view, that dropdown still needs building; this doc previously implied it already existed ("Config Context Dropdown" in `docs/ui-specs/taxonomy-graph-skills.md`) and it doesn't.
- Mapping an orphan (`mapNode`/`healOrphanMapping`) writes the classification directly onto the matching real `CatalogSKU` via `setCatalogSkus` (matched by partNumber), or creates a new `CatalogSKU` if none exists yet. This is a real `coreStore` write — the fix is visible on Dashboard/Catalog Manager/Cleansing immediately, not just in this view.
- Generic node/edge CRUD (add/update/delete, for edits that don't map onto a real catalog field) lives in a local `GraphOverlay` that layers on top of the derived baseline without being wiped when `catalogSkus` changes.
- `/api/graph/algorithms/alternative-paths` and `/api/graph/path-selection` remain genuinely network-backed (via MSW today) — these are algorithmic (pathfinding), not entity data, and are the correct exception to "graph reads are client-side."

## 6. Catalog CRUD — stateless pass-through, `coreStore` is the source of truth

`POST/PUT/DELETE /api/catalog` (via `CatalogManager.tsx`) are intentionally stateless pass-throughs (`MockCatalogApi` in `src/lib/api-mock.ts`) — they echo the payload back and hold no independent array. `GET /api/catalog` always returns `[]`; nothing in the UI reads it, since the real catalog list always comes from `useCoreStore(s => s.catalogSkus)`. This used to hold its own competing 2-SKU stub catalog with ids that never matched the real one, which is why `CatalogManager` price edits used to silently roll back — see `docs/architecture/data-ownership.md` for the full incident writeup.

## 7. Job progress — real polling, not SSE

`apiClient.streamJob()`'s interface (`onMessage`/`onError`/`close`) is transport-agnostic by design, but the implementation behind it is genuine interval-based polling of `GET /api/jobs/:id` until a terminal status — not Server-Sent Events, despite an earlier docstring claiming otherwise (it never was; that was aspirational comment text, not a real implementation). `server.ts`'s real job endpoint independently converged on the same increment-progress-per-poll pattern, which is why polling — not push — is the deliberate current architecture, not a legacy fallback. If a future workflow genuinely needs server-push (e.g. one user's job progress needs to be visible live to other users, not just the person who triggered it), swap `streamJob()`'s internals for real SSE/WebSocket — no caller needs to change.

## 8. Sourcing Rules (still real — unrelated to the taxonomy graph's local `addRule` in Section 5)

### POST /api/taxonomy/rules
- **Payload**: `{ sourceId: string, ruleType: "requires" | "exclusive", explanation: string }`
- **Behavior**: Computes and stores custom sourcing/compatibility constraints. Live callers: `CleansingView.tsx`, `SourcingRulesVault.tsx`, `NLPParser.tsx`. Despite the similar name, this is a genuine network endpoint, unlike the taxonomy graph's per-node `addRule` (Section 5), which is a local `GraphOverlay` annotation with no network call.

## 9. Snapshot & Version Control API

**Known unresolved collision (Phase 3b, deferred, see `docs/architecture/data-architecture-plan.md`)**: `snapshotHandlers.ts`'s `GET/POST /api/ucids/:ucid/snapshots` collides with an equivalent route in `server.ts`, following the same MSW-shadows-`server.ts` pattern already fixed for `/api/catalog`. Not yet audited or fixed — do the same caller-payload-vs-schema verification done for the other 10 collision routes before touching this one.

### 9.1 GET /api/ucids/:ucid/snapshots
- **Response**: `ApiResponse<Snapshot[]>` where `Snapshot` matches the data schemas containing `version`, `timestamp`, `locked`, and `bomSnapshot`.

### 9.2 POST /api/ucids/:ucid/snapshots
- **Payload**: `{ label: string, winnerSolution: string, notes: string, bomSnapshot: any[] }`
- **Behavior**: Compiles the current active BOM assembly layout, increments the version number relative to this specific UCID, logs the accurate server-side timestamp, and returns the newly instantiated `locked: true` snapshot payload.

### 9.3 PATCH /api/ucids/:ucid/snapshots/:snapshotId/lock
- **Payload**: `{ locked: boolean }`
- **Behavior**: Updates the immutability flag of the designated contract snapshot. Allows manual overrides / toggles.

### 9.4 DELETE /api/ucids/:ucid/snapshots/:snapshotId
- **Behavior**: Attempts deletion. Rejects with an error HTTP 403 response if the target snapshot's `locked` attribute remains `true`.

