import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { GraphNode, GraphEdge, GraphAPIResponse, GraphPath } from "../types/data";
import { Config, CatalogSKU, BOMItem } from "../types";
import type { CatalogItemType } from "../types/schemas/schemaCatalog";
import { apiClient } from "../services/apiClient";

export class TaxonomyGraphError extends Error {
  constructor(message: string, public readonly code: string = 'GRAPH_FETCH_ERROR') {
    super(message);
    this.name = 'TaxonomyGraphError';
  }
}

export interface MapNodeRequest {
  partNumber?: string;
  name: string;
  type?: string;
}

/**
 * Builds the taxonomy graph directly from the selected config's real BOM
 * items, cross-referenced against the real catalog — instead of a network
 * round-trip to a mock endpoint that ignored which config was selected and
 * always returned the same 5 hardcoded nodes (see
 * docs/architecture/data-ownership.md, Phase 4).
 *
 * One category_hub node per distinct BOM item `type`; one node per BOM line
 * (catalog_part if it resolves against catalogSkus by partNumber,
 * scraped_orphan otherwise, landing in unmappedIds).
 */
export function deriveGraphFromConfig(config: Config | undefined, catalogSkus: CatalogSKU[]): GraphAPIResponse {
  if (!config || config.items.length === 0) {
    return { nodes: [], edges: [], unmappedIds: [] };
  }

  const nodes: GraphNode[] = [
    {
      id: config.id,
      label: config.name,
      sublabel: config.vendor ? `${config.vendor} Configuration` : "Configuration",
      type: "product",
    },
  ];
  const edges: GraphEdge[] = [];
  const unmappedIds: string[] = [];
  const seenCategoryHubs = new Set<string>();

  const findCatalogMatch = (item: BOMItem): CatalogSKU | undefined =>
    catalogSkus.find((s) => s.partNumber.toLowerCase() === item.partNumber.toLowerCase());

  for (const item of config.items) {
    const categoryHubId = `category-${item.type}`;
    if (!seenCategoryHubs.has(categoryHubId)) {
      seenCategoryHubs.add(categoryHubId);
      nodes.push({ id: categoryHubId, label: item.type, type: "category_hub" });
      edges.push({ id: `e-${config.id}-${categoryHubId}`, source: config.id, target: categoryHubId, relationship: "contains" });
    }

    const match = findCatalogMatch(item);
    // Orphan node ids are the real partNumber, not a synthetic id — the
    // existing OrphanWorkshopPanel/handleMapOrphanNode flow looks orphans up
    // by partNumber and sends the id straight back as the partNumber to map,
    // so this has to be the genuine value for that round-trip to work.
    const nodeId = match ? `bom-${item.id}` : (item.partNumber || `bom-${item.id}`);
    if (match) {
      nodes.push({
        id: nodeId,
        label: item.partNumber,
        sublabel: item.name,
        type: "catalog_part",
        status: "healthy",
        data: { partNumber: item.partNumber, price: item.unitPrice },
      });
    } else {
      nodes.push({
        id: nodeId,
        label: item.partNumber || item.name,
        sublabel: item.name,
        type: "scraped_orphan",
        status: "warning",
        data: { partNumber: item.partNumber, price: item.unitPrice },
      });
      unmappedIds.push(nodeId);
    }
    edges.push({ id: `e-${categoryHubId}-${nodeId}`, source: categoryHubId, target: nodeId, relationship: "requires" });
  }

  return { nodes, edges, unmappedIds };
}

// Local overlay for manual graph edits (added/updated/deleted nodes and
// edges) that layers on top of the derived baseline without being wiped
// out every time catalogSkus changes and the baseline re-derives — same
// non-destructive-merge principle used for CleansingView's entries.
interface GraphOverlay {
  addedNodes: Map<string, GraphNode>;
  updatedNodes: Map<string, Partial<GraphNode>>;
  deletedNodeIds: Set<string>;
  addedEdges: Map<string, GraphEdge>;
  deletedEdgeIds: Set<string>;
}

function emptyOverlay(): GraphOverlay {
  return {
    addedNodes: new Map(),
    updatedNodes: new Map(),
    deletedNodeIds: new Set(),
    addedEdges: new Map(),
    deletedEdgeIds: new Set(),
  };
}

function applyOverlay(baseline: GraphAPIResponse, overlay: GraphOverlay): GraphAPIResponse {
  const nodes = baseline.nodes
    .filter((n) => !overlay.deletedNodeIds.has(n.id))
    .map((n) => (overlay.updatedNodes.has(n.id) ? { ...n, ...overlay.updatedNodes.get(n.id) } : n));
  for (const n of overlay.addedNodes.values()) {
    if (!overlay.deletedNodeIds.has(n.id)) nodes.push(n);
  }
  const edges = baseline.edges
    .filter((e) => !overlay.deletedEdgeIds.has(e.id) && !overlay.deletedNodeIds.has(e.source) && !overlay.deletedNodeIds.has(e.target));
  for (const e of overlay.addedEdges.values()) {
    if (!overlay.deletedEdgeIds.has(e.id)) edges.push(e);
  }
  const unmappedIds = baseline.unmappedIds.filter((id) => !overlay.deletedNodeIds.has(id));
  return { nodes, edges, unmappedIds };
}

export function useCatalogGraphData(
  configId: string | null,
  allConfigs: Config[],
  catalogSkus: CatalogSKU[],
  setCatalogSkus?: (updater: (prev: CatalogSKU[]) => CatalogSKU[]) => void
) {
  const config = useMemo(() => allConfigs.find((c) => c.id === configId), [allConfigs, configId]);
  const baseline = useMemo(() => deriveGraphFromConfig(config, catalogSkus), [config, catalogSkus]);

  const overlayRef = useRef<GraphOverlay>(emptyOverlay());
  // Reset the overlay when the selected config changes (switching configs
  // shouldn't carry another config's manual edits with it), but NOT when
  // catalogSkus changes (that's exactly the case the overlay exists to
  // survive).
  useEffect(() => {
    overlayRef.current = emptyOverlay();
  }, [configId]);

  const [renderTick, forceRender] = useState(0);
  const bump = () => forceRender((n) => n + 1);

  const data = useMemo(() => applyOverlay(baseline, overlayRef.current), [baseline, renderTick]);

  const [alternativePaths, setAlternativePaths] = useState<GraphPath[]>([]);
  const isLoading = false;
  const error: string | null = null;

  const mapNode = useCallback(async (childId: string, parentId: string, childInfo: MapNodeRequest) => {
    // The real fix: write the classification onto the catalog. Once
    // catalogSkus updates, the baseline re-derivation naturally shows this
    // item as matched — no optimistic local node patch needed for BOM-backed
    // items. We still track it in the overlay as a safety net for the rare
    // case the item can't be resolved back onto a real catalog SKU at all.
    const inferredType = parentId.replace(/^category-/, "") as CatalogItemType;
    let matchedByPartNumber = false;
    if (setCatalogSkus && childInfo.partNumber) {
      setCatalogSkus((prev) => {
        const idx = prev.findIndex((s) => s.partNumber.toLowerCase() === childInfo.partNumber!.toLowerCase());
        if (idx === -1) return prev;
        matchedByPartNumber = true;
        const next = [...prev];
        next[idx] = { ...next[idx], type: inferredType, status: "active" };
        return next;
      });
    }
    if (!matchedByPartNumber) {
      // No catalog SKU exists for this part yet — record the mapping as a
      // local overlay node so the graph reflects the fix immediately, and
      // (if we have write access) add it as a genuinely new catalog SKU so
      // it isn't lost the moment this view is closed.
      overlayRef.current.updatedNodes.set(childId, { type: "catalog_part", status: "healthy" });
      overlayRef.current.deletedNodeIds.delete(childId);
      if (setCatalogSkus && childInfo.partNumber) {
        setCatalogSkus((prev) => [
          ...prev,
          {
            id: `sku-graph-${childId}`,
            vendor: "Unknown",
            partNumber: childInfo.partNumber!,
            name: childInfo.name,
            type: inferredType,
            price: 0,
            leadTimeDays: 0,
            status: "active",
          },
        ]);
      }
      const edgeId = `e-${parentId}-${childId}`;
      overlayRef.current.addedEdges.set(edgeId, { id: edgeId, source: parentId, target: childId, relationship: "contains" });
    }
    bump();
  }, [setCatalogSkus]);

  const healOrphanMapping = async (orphanId: string, orphanName: string, targetNodeId: string) => {
    await mapNode(orphanId, targetNodeId, { name: orphanName });
  };

  const unmapNode = async (nodeId: string) => {
    overlayRef.current.deletedNodeIds.add(nodeId);
    bump();
  };

  const addRule = async (nodeId: string, _type: "requires" | "exclusive", note: string) => {
    const current = data.nodes.find((n) => n.id === nodeId);
    if (current) {
      overlayRef.current.updatedNodes.set(nodeId, {
        constraints: [...(current.constraints || []), note],
      });
      bump();
    }
  };

  const fetchAlternativePaths = async (targetNodeId: string) => {
    try {
      const res = await apiClient.getGraphAlternativePaths(targetNodeId);
      if (res.success && res.data?.paths) {
        setAlternativePaths(res.data.paths);
        return res.data.paths;
      }
    } catch (err) {
      console.error(err);
    }
    return [];
  };

  const commitPathSelection = async (jobId: string, selectedPathId: string) => {
    const rejectedIds = alternativePaths.map((p) => p.pathId).filter((id) => id !== selectedPathId);
    try {
      const res = await apiClient.commitGraphPathSelection(jobId, selectedPathId, rejectedIds);
      if (res.success) {
        setAlternativePaths([]);
      }
      return res.success;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const addGraphNode = async (node: Partial<GraphNode>) => {
    const id = node.id || `node-manual-${Date.now()}`;
    overlayRef.current.addedNodes.set(id, { id, label: node.label || id, type: node.type || "sku", ...node });
    bump();
    return true;
  };

  const updateGraphNode = async (nodeId: string, updates: Partial<GraphNode>) => {
    overlayRef.current.updatedNodes.set(nodeId, { ...(overlayRef.current.updatedNodes.get(nodeId) || {}), ...updates });
    bump();
    return true;
  };

  const deleteGraphNode = async (nodeId: string) => {
    overlayRef.current.deletedNodeIds.add(nodeId);
    bump();
    return true;
  };

  const addGraphEdge = async (edge: Partial<GraphEdge>) => {
    const id = edge.id || `edge-manual-${Date.now()}`;
    overlayRef.current.addedEdges.set(id, {
      id,
      source: edge.source || "",
      target: edge.target || "",
      relationship: edge.relationship || "compatible",
      ...edge,
    });
    bump();
    return true;
  };

  const deleteGraphEdge = async (edgeId: string) => {
    overlayRef.current.deletedEdgeIds.add(edgeId);
    bump();
    return true;
  };

  const refresh = () => {
    overlayRef.current = emptyOverlay();
    bump();
  };

  return {
    data,
    isLoading,
    error,
    mapNode,
    unmapNode,
    healOrphanMapping,
    addRule,
    refresh,
    alternativePaths,
    fetchAlternativePaths,
    commitPathSelection,
    addGraphNode,
    updateGraphNode,
    deleteGraphNode,
    addGraphEdge,
    deleteGraphEdge,
  };
}
