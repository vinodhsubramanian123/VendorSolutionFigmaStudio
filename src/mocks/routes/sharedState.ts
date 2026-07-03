import { GraphNode, GraphEdge } from "../../types/data";

export function wrapSuccess<T>(data: T) {
  const reqId = crypto.randomUUID();
  return {
    success: true,
    data,
    meta: {
      requestId: `req_${reqId}`,
      timestamp: new Date().toISOString()
    }
  };
}

// NOTE: the fictional memoryGraphNodes/memoryGraphEdges that used to live
// here (5 hardcoded nodes with SKUs that appeared nowhere in the real
// catalog) were removed in Phase 4 of the data-ownership cleanup — see
// docs/architecture/data-ownership.md. The taxonomy graph is now derived
// client-side from real BOM items + coreStore.catalogSkus instead.
export type { GraphNode, GraphEdge };
