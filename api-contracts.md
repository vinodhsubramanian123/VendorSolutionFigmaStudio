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
- **Payload**: Accepts `multipart/form-data` for file uploads or `application/json` for direct integrations.
- **Behavior**: Should immediately return `202 Accepted` with a Job ID, triggering long-polling or WebSocket updates on the front-end if the job takes > 2 seconds.

### 4.2 POST /api/forensics/align
- **Payload**: `{ issueId: string, ruleId: string, action: 'override' | 'apply_fix' }`
- **Behavior**: Front-end eagerly marks row as resolving, disables the row action buttons, and then optimistic resolves upon `200 OK`.
