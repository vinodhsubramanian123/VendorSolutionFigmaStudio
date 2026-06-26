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

export const memoryGraphNodes: GraphNode[] = [
  { id: "node-1", label: "HPE ProLiant DL380", type: "catalog_part", status: "healthy", data: { partNumber: "P52532-B21", price: 2100 } },
  { id: "node-2", label: "Intel Xeon Silver", type: "catalog_part", status: "healthy", data: { partNumber: "P49610-B21", price: 800 } },
  { id: "node-3", label: "Orphaned Memory Module", type: "scraped_orphan", status: "warning", data: { partNumber: "Unknown-MEM", confidenceScore: 40 } },
  { id: "node-4", label: "HPE 32GB DDR5", type: "catalog_part", status: "healthy", data: { partNumber: "P43328-B21", price: 350 } },
  { id: "node-subsystem-1", label: "Memory Subsystem", type: "category_hub", status: "healthy" },
];

export const memoryGraphEdges: GraphEdge[] = [
  { id: "edge-1", source: "node-1", target: "node-2", relationship: "requires", weight: 1.0, isAnimated: false },
  { id: "edge-2", source: "node-1", target: "node-3", relationship: "requires", weight: 0.8, isAnimated: true },
  { id: "edge-3", source: "node-3", target: "node-4", relationship: "substitutes", weight: 0.95, isAnimated: false },
];
