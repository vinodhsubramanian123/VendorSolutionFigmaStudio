import { useState, useEffect, useCallback } from "react";
import { GraphEdge, GraphAPIResponse } from "../types/data";
import { Config, CatalogSKU } from "../types";
import { apiClient } from "../services/apiClient";

export interface MapNodeRequest {
  partNumber?: string;
  name: string;
  type?: string;
}

export function useCatalogGraphData(configId: string | null, allConfigs: Config[], catalogSkus: CatalogSKU[]) {
  const [data, setData] = useState<GraphAPIResponse>({ nodes: [], edges: [], unmappedIds: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGraph = useCallback(async (isCancelled?: () => boolean) => {
    if (!configId) {
      setData({ nodes: [], edges: [], unmappedIds: [] });
      return;
    }

    const config = allConfigs.find((c) => c.id === configId);
    if (!config) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await apiClient.get<GraphAPIResponse>(`/api/taxonomy/graph/${configId}`);
      if (isCancelled && isCancelled()) return;
      if (res.success) {
        setData(res.data);
      } else {
        throw new Error("Failed to fetch topology");
      }
    } catch (err) {
      console.error(err);
      if (isCancelled && isCancelled()) return;
      setError("Failed to fetch topology for the selected configuration.");
      setData({ nodes: [], edges: [], unmappedIds: [] });
    } finally {
      if (!isCancelled || !isCancelled()) {
        setIsLoading(false);
      }
    }
  }, [configId, allConfigs]);

  useEffect(() => {
    let cancel = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGraph(() => cancel);
    return () => {
      cancel = true;
    };
  }, [fetchGraph]);

  const mapNode = async (childId: string, parentId: string, childInfo: MapNodeRequest) => {
    await apiClient.post("/api/taxonomy/map", { childId, targetParentId: parentId, properties: childInfo });
    // Optimistic Update
    setData(prev => {
      const newNodes = [...prev.nodes];
      if (!newNodes.find(n => n.id === childId)) {
        newNodes.push({
          id: childId,
          type: "sku",
          label: childInfo.partNumber || childId,
          sublabel: "Mapped via Intelligence GUI",
          constraints: ["Manually Assigned Overrides"],
          dependencies: ["Graph Integrity Verified"]
        });
      }
      const newEdges: GraphEdge[] = [...prev.edges.filter(e => e.target !== childId), { id: `e-${parentId}-${childId}`, source: parentId, target: childId, relationship: "contains" }];
      const newUnmapped = prev.unmappedIds.filter(id => id !== childId);
      return { nodes: newNodes, edges: newEdges, unmappedIds: newUnmapped };
    });
  };

  const unmapNode = async (nodeId: string) => {
     await apiClient.get(`/api/taxonomy/map/${nodeId}`, { method: 'DELETE' });
     setData(prev => ({
       ...prev,
       edges: prev.edges.filter(e => e.target !== nodeId),
       nodes: prev.nodes.filter(n => n.id !== nodeId),
       unmappedIds: [...prev.unmappedIds, nodeId]
     }));
  };

  const addRule = async (nodeId: string, type: "requires"|"exclusive", note: string) => {
     await apiClient.post("/api/taxonomy/rules", { sourceId: nodeId, ruleType: type, explanation: note });
     setData(prev => {
        const newNodes = prev.nodes.map(n => {
          if (n.id === nodeId) {
            return { ...n, constraints: [...(n.constraints || []), note] };
          }
          return n;
        });
        return { ...prev, nodes: newNodes };
     });
  };

  return { data, isLoading, error, mapNode, unmapNode, addRule, refresh: fetchGraph };
}
