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
1. **Immediate Local Update**: Dispatch the state change to the Context/Store immediately (e.g., change issue status to 'resolved' and update the UI).
2. **Background Network Request**: Fire the asynchronous API call (`fetch` or `axios`).
3. **Rollback on Failure**: If the API responds with an error, revert the local state back to its previous state and trigger an error Toast.
   *Do NOT lock the UI with a full-screen spinner for localized row updates.*

## 4. Specific Endpoint Enhancements

### 4.1 POST /api/ingest
- **Payload**: Accepts `multipart/form-data` for file uploads or `application/json` for direct integrations. Contains the workflow data representing the BOQ.
- **Behavior (Phase 2 True Ingestion)**: Instead of simulated/hardcoded matchers, the ingested workflow natively translates into a `UCID` with dynamically generated JSON structural solutions. The backend synchronously (or async via 202) processes the file and returns the structured `UCID`. The frontend immediately propagates this newly created `UCID` into the unified state, which seamlessly activates the `LiveMission` view.

### 4.2 POST /api/forensics/align
- **Payload**: `{ issueId: string, ruleId: string, action: 'override' | 'apply_fix' }`
- **Behavior (Phase 3 Forensic Auto-Heal)**: Front-end eagerly performs the underlying data mutation (e.g. replacing an EOL part with an active one in the `ucid` configuration, or correcting a price). A global `useEffect` (the Forensic Auto-Heal hook) constantly monitors the payload structure and automatically marks the `forensicIssue` as `resolved` globally, guaranteeing cross-view alignment without requiring manual status updates.

## 5. Taxonomy & Knowledge Graph API

### 5.1 GET /api/taxonomy/graph/:configId
- **Response**: `ApiResponse<GraphAPIResponse>` using definitions mapped in `src/types/taxonomy.ts` (`GraphMetadata`, `GraphNode`, `GraphEdge`).
- **Behavior**: Lazily retrieves the mapping definitions and classification heuristics for a specific parsed configuration. Nodes represent hierarchy, edges describe their constraint relationship (`requires`, `mutually exclusive`, `hierarchy`).
- **Orphan Diagnostics**: Incorporates telemetry for unmapped string literals representing unknown supplier components (`unmappedIds`).

### 5.2 POST /api/taxonomy/map
- **Payload**: `{ childId: string, targetParentId: string, properties: unknown }`
- **Behavior**: Manually associates a disjointed node (orphan) to the graph structure using a Human-in-the-Loop override action (`Auto-Fix` or Drag & Drop). Also supports dragging existing mapped SKU nodes to structurally reassign their parent relationships within the hierarchy.

### 5.3 DELETE /api/taxonomy/map/:nodeId
- **Behavior**: Tears down relations attached to the node, degrading it to an orphaned state.

### 5.4 POST /api/taxonomy/rules
- **Payload**: `{ sourceId: string, ruleType: "requires" | "exclusive", explanation: string }`
- **Behavior**: Computes and stores custom enforcement constraints inside the Graph rules engine to detect validation anomalies in future scans.

## 6. Snapshot & Version Control API

### 6.1 GET /api/ucids/:ucid/snapshots
- **Response**: `ApiResponse<Snapshot[]>` where `Snapshot` matches the data schemas containing `version`, `timestamp`, `locked`, and `bomSnapshot`.

### 6.2 POST /api/ucids/:ucid/snapshots
- **Payload**: `{ label: string, winnerSolution: string, notes: string, bomSnapshot: any[] }`
- **Behavior**: Compiles the current active BOM assembly layout, increments the version number relative to this specific UCID, logs the accurate server-side timestamp, and returns the newly instantiated `locked: true` snapshot payload.

### 6.3 PATCH /api/ucids/:ucid/snapshots/:snapshotId/lock
- **Payload**: `{ locked: boolean }`
- **Behavior**: Updates the immutability flag of the designated contract snapshot. Allows manual overrides / toggles.

### 6.4 DELETE /api/ucids/:ucid/snapshots/:snapshotId
- **Behavior**: Attempts deletion. Rejects with an error HTTP 403 response if the target snapshot's `locked` attribute remains `true`.

