import React, { useState, useMemo } from 'react';
import { 
  Network, 
  RefreshCw, 
  Filter
} from 'lucide-react';
import { useCatalogGraphData } from "../../hooks/useCatalogGraphData";
import type { Config, CatalogSKU, Vendor } from "../../types";
import { TaxonomyCategoryTree } from "./TaxonomyCategoryTree";
import { TaxonomyOrphanBox } from "./TaxonomyOrphanBox";
import { TaxonomyGraphSidebar } from "./TaxonomyGraphSidebar";
import { KnowledgeGraphCanvas } from "./KnowledgeGraphCanvas";
import { ErrorBoundary } from "../shared/ErrorBoundary";

const DEFAULT_CONFIGS = [{ id: "cfg-base", vendor: "HPE" } as Config];

interface TaxonomyGraphViewProps {
  catalogSkus: CatalogSKU[];
  setCatalogSkus: React.Dispatch<React.SetStateAction<CatalogSKU[]>>;
  vendors: Vendor[];
}

export function TaxonomyGraphView({ catalogSkus, setCatalogSkus, vendors }: TaxonomyGraphViewProps) {
  const { 
    data, 
    isLoading, 
    mapNode, 
    refresh, 
    alternativePaths, 
    fetchAlternativePaths, 
    commitPathSelection,
    addGraphNode,
    updateGraphNode,
    deleteGraphNode,
    addGraphEdge,
    deleteGraphEdge
  } = useCatalogGraphData(
    "cfg-base", 
    DEFAULT_CONFIGS, 
    catalogSkus
  );

  // States
  const [expandedNode, setExpandedNode] = useState<string | null>(null);
  const [filterOrphansOnly, setFilterOrphansOnly] = useState(false);
  
  const [activeTab, setActiveTab] = useState<"constraints" | "orphans" | "edges" | "paths" | "nodes">("constraints");
  const [selectedOrphanToMap, setSelectedOrphanToMap] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeSelectedPathId, setActiveSelectedPathId] = useState<string | null>(null);

  const toggleNode = (nodeId: string) => {
    setExpandedNode(prev => prev === nodeId ? null : nodeId);
  };

  // Filter lists of nodes
  const rootNodes = useMemo(() => data.nodes.filter(n => n.type === "product"), [data.nodes]);
  const categories = useMemo(() => data.nodes.filter(n => n.type === "category"), [data.nodes]);
  const skus = useMemo(() => data.nodes.filter(n => n.type === "sku"), [data.nodes]);

  // Chassis & Processor options for constraint validator dropdowns
  const chassisOptions = useMemo(() => catalogSkus.filter(s => s.type === "Chassis" && s.status === "active"), [catalogSkus]);
  const cpuOptions = useMemo(() => catalogSkus.filter(s => s.type === "Processor" && s.status === "active"), [catalogSkus]);



  return (
    <ErrorBoundary>
      <div className="flex flex-col lg:flex-row gap-6 w-full h-full max-w-7xl mx-auto text-white">
        {/* LEFT: Interactive Taxonomy Tree Graph Canvas */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-surface-card border border-white/5 rounded-xl">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <Network className="w-4 h-4 text-indigo-400" />
              Taxonomy Graph Canvas
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Drag to pan. Scroll or use buttons to zoom. Click nodes to inspect constraints.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button 
              onClick={() => setFilterOrphansOnly(!filterOrphansOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${filterOrphansOnly ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold' : 'bg-surface-elevated border-white/5 text-gray-400 hover:text-white'}`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{filterOrphansOnly ? 'Showing Orphans' : 'Filter Orphans'}</span>
            </button>

            <button 
              onClick={() => refresh()}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-xs font-bold rounded-lg border border-indigo-400/20 transition cursor-pointer text-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Topology</span>
            </button>
          </div>
        </div>

        {/* Viewport Canvas Container (Phase 3 Integration) */}
        <div className="relative flex-1 w-full border border-indigo-500/10 rounded-xl overflow-hidden min-h-[560px]">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface-card">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
              <span className="text-xs font-mono text-indigo-300">Synchronizing Graph Topology...</span>
            </div>
          ) : (
            <KnowledgeGraphCanvas 
              apiNodes={data.nodes} 
              apiEdges={data.edges} 
              apiPaths={alternativePaths}
              activeSelectedPathId={activeSelectedPathId}
              onNodeClick={(id) => {
                toggleNode(id);
                setSelectedNodeId(id);
                const node = data.nodes.find(n => n.id === id);
                if (node?.type === 'sku' || node?.type === 'scraped_orphan') {
                  setSelectedOrphanToMap(id);
                  setActiveTab("orphans");
                } else if (node?.type === 'catalog_part' || node?.type === 'product' || node?.type === 'category_hub') {
                  fetchAlternativePaths(id);
                  setActiveTab("nodes");
                }
              }}
              onEdgeClick={(id) => {
                setSelectedEdgeId(id);
                setActiveTab("edges");
              }}
            />
          )}
        </div>
      </div>

      {/* RIGHT: Mechanical Validation & Orphan Repair Workshop */}
      <TaxonomyGraphSidebar
        catalogSkus={catalogSkus}
        setCatalogSkus={setCatalogSkus}
        data={data}
        categories={categories}
        mapNode={mapNode}
        chassisOptions={chassisOptions}
        cpuOptions={cpuOptions}
        selectedOrphanToMap={selectedOrphanToMap}
        setSelectedOrphanToMap={setSelectedOrphanToMap}
        selectedEdgeId={selectedEdgeId}
        setSelectedEdgeId={setSelectedEdgeId}
        selectedNodeId={selectedNodeId}
        setSelectedNodeId={setSelectedNodeId}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alternativePaths={alternativePaths}
        activeSelectedPathId={activeSelectedPathId}
        setActiveSelectedPathId={setActiveSelectedPathId}
        commitPathSelection={commitPathSelection}
        addGraphNode={addGraphNode}
        updateGraphNode={updateGraphNode}
        deleteGraphNode={deleteGraphNode}
        addGraphEdge={addGraphEdge}
        deleteGraphEdge={deleteGraphEdge}
      />
    </div>
    </ErrorBoundary>
  );
}
