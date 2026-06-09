import { useState, useEffect, useCallback } from "react";
import { TaxonomyGraphNode, TaxonomyGraphEdge, TaxonomyGraphPayload, MockTaxonomyApi } from "../lib/api-mock";
import { Config, CatalogSKU } from "../types";

export function useCatalogGraphData(configId: string | null, allConfigs: (Config & {vendor?: string})[], catalogSkus: CatalogSKU[]) {
  const [data, setData] = useState<TaxonomyGraphPayload>({ nodes: [], edges: [], unmappedIds: [] });
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
      const res = await MockTaxonomyApi.getGraphForConfig(
        config,
        catalogSkus,
        config.vendor
      );
      if (isCancelled && isCancelled()) return;
      setData(res);
    } catch (err) {
      if (isCancelled && isCancelled()) return;
      setError("Failed to fetch topology for the selected configuration.");
      setData({ nodes: [], edges: [], unmappedIds: [] });
    } finally {
      if (!isCancelled || !isCancelled()) {
        setIsLoading(false);
      }
    }
  }, [configId, allConfigs, catalogSkus]);

  useEffect(() => {
    let cancel = false;
    fetchGraph(() => cancel);
    return () => {
      cancel = true;
    };
  }, [fetchGraph]);

  const mapNode = async (childId: string, parentId: string, childInfo: any) => {
    await MockTaxonomyApi.mapOrphanNode({ childId, parentId, childInfo });
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
      const newEdges: TaxonomyGraphEdge[] = [...prev.edges.filter(e => e.to !== childId), { id: `e-${parentId}-${childId}`, from: parentId, to: childId, type: "contains" }];
      const newUnmapped = prev.unmappedIds.filter(id => id !== childId);
      return { nodes: newNodes, edges: newEdges, unmappedIds: newUnmapped };
    });
  };

  const unmapNode = async (nodeId: string) => {
     await MockTaxonomyApi.unmapNode(nodeId);
     setData(prev => ({
       ...prev,
       edges: prev.edges.filter(e => e.to !== nodeId),
       nodes: prev.nodes.filter(n => n.id !== nodeId),
       unmappedIds: [...prev.unmappedIds, nodeId]
     }));
  };

  const addRule = async (nodeId: string, type: "requires"|"exclusive", note: string) => {
     await MockTaxonomyApi.addRule(nodeId, type, note);
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
