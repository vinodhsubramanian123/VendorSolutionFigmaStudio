import { useState, useEffect, useCallback } from "react";
import { GraphNode, GraphEdge, GraphAPIResponse, GraphPath } from "../types/data";
import { Config, CatalogSKU } from "../types";
import { apiClient } from "../services/apiClient";

export interface MapNodeRequest {
  partNumber?: string;
  name: string;
  type?: string;
}

export function useCatalogGraphData(configId: string | null, allConfigs: Config[], catalogSkus: CatalogSKU[]) {
  const [data, setData] = useState<GraphAPIResponse>({ nodes: [], edges: [], unmappedIds: [] });
  const [alternativePaths, setAlternativePaths] = useState<GraphPath[]>([]);
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
      const res = await apiClient.getGraphSolution(configId);
      if (isCancelled && isCancelled()) return;
      if (res.success && res.data) {
        setData(res.data);
        setAlternativePaths([]);
      } else {
        throw new Error("Failed to fetch topology");
      }
    } catch (err) {
      console.error(err);
      if (isCancelled && isCancelled()) return;
      setError("Failed to fetch topology for the selected configuration.");
      setData({ nodes: [], edges: [], unmappedIds: [] });
      setAlternativePaths([]);
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

  const healOrphanMapping = async (orphanId: string, orphanName: string, targetNodeId: string) => {
    // Re-uses mapNode which optimally updates state by moving orphan to mapped node and drawing edge
    await mapNode(orphanId, targetNodeId, { name: orphanName });
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
    const rejectedIds = alternativePaths.map(p => p.pathId).filter(id => id !== selectedPathId);
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
    try {
      const res = await apiClient.createGraphNode(node);
      if (res.success && res.data) {
        setData(prev => ({ ...prev, nodes: [...prev.nodes, res.data!] }));
      }
      return res.success;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const updateGraphNode = async (nodeId: string, updates: Partial<GraphNode>) => {
    try {
      const res = await apiClient.updateGraphNode(nodeId, updates);
      if (res.success && res.data) {
        setData(prev => ({
          ...prev,
          nodes: prev.nodes.map(n => n.id === nodeId ? res.data! : n)
        }));
      }
      return res.success;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const deleteGraphNode = async (nodeId: string) => {
    try {
      const res = await apiClient.deleteGraphNode(nodeId);
      if (res.success) {
        setData(prev => ({
          ...prev,
          nodes: prev.nodes.filter(n => n.id !== nodeId),
          edges: prev.edges.filter(e => e.source !== nodeId && e.target !== nodeId)
        }));
      }
      return res.success;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const addGraphEdge = async (edge: Partial<GraphEdge>) => {
    try {
      const res = await apiClient.createGraphEdge(edge);
      if (res.success && res.data) {
        setData(prev => ({ ...prev, edges: [...prev.edges, res.data!] }));
      }
      return res.success;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const deleteGraphEdge = async (edgeId: string) => {
    try {
      const res = await apiClient.deleteGraphEdge(edgeId);
      if (res.success) {
        setData(prev => ({
          ...prev,
          edges: prev.edges.filter(e => e.id !== edgeId)
        }));
      }
      return res.success;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return { 
    data, 
    isLoading, 
    error, 
    mapNode, 
    unmapNode, 
    healOrphanMapping,
    addRule, 
    refresh: fetchGraph,
    alternativePaths,
    fetchAlternativePaths,
    commitPathSelection,
    addGraphNode,
    updateGraphNode,
    deleteGraphNode,
    addGraphEdge,
    deleteGraphEdge
  };
}
