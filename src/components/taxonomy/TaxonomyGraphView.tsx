import React, { useState, useMemo } from 'react';
import { 
  Network, 
  RefreshCw, 
  Filter,
  GitFork
} from 'lucide-react';
import { useCoreStore } from "../../store/coreStore";
import { useCatalogGraphData } from "../../hooks/useCatalogGraphData";
import type { Config } from "../../types";
import { TaxonomyGraphSidebar } from "./TaxonomyGraphSidebar";
import { KnowledgeGraphCanvas } from "./KnowledgeGraphCanvas";
import { ErrorBoundary } from "../shared/ErrorBoundary";
const DEFAULT_CONFIGS: Config[] = [{ id: "cfg-base", vendor: "HPE", name: "Base Configuration", totalPrice: 0, originalPrice: 0, items: [] }];

export function TaxonomyGraphView() {
  const catalogSkus = useCoreStore(s => s.catalogSkus);
  const setCatalogSkus = useCoreStore(s => s.setCatalogSkus);
  const solutions = useCoreStore(s => s.solutions);
  const ucids = useCoreStore(s => s.ucids);
  const activeSolutionIdFromStore = useCoreStore(s => s.activeSolutionId);
  
  const [selectedSolutionId, setSelectedSolutionId] = useState<string>(activeSolutionIdFromStore || solutions[0]?.id || "");
  const selectedSolution = useMemo(() => solutions.find(s => s.id === selectedSolutionId), [solutions, selectedSolutionId]);
  
  const availableUcids = useMemo(() => ucids.filter(u => selectedSolution?.ucidIds.includes(u.id)), [ucids, selectedSolution]);
  
  const [selectedUcidIdState, setSelectedUcidIdState] = useState<string>("");

  const selectedUcidId = useMemo(() => {
    if (availableUcids.some(u => u.id === selectedUcidIdState)) {
      return selectedUcidIdState;
    }
    return availableUcids[0]?.id || "";
  }, [availableUcids, selectedUcidIdState]);

  const setSelectedUcidId = (id: string) => setSelectedUcidIdState(id);

  const activeUcid = useMemo(() => ucids.find(u => u.id === selectedUcidId), [ucids, selectedUcidId]);
  
  const activeConfigs = useMemo(() => {
    if (!activeUcid) return DEFAULT_CONFIGS;
    // Extract configs from the primary solution of the UCID if available
    const primarySol = activeUcid.solutions?.[0];
    const configs = primarySol?.vendorSubmissions?.[0]?.configs;
    return configs && configs.length > 0 ? configs : DEFAULT_CONFIGS;
  }, [activeUcid]);

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
    activeUcid?.id || "cfg-base", 
    activeConfigs, 
    catalogSkus
  );
  // States
  const [, setExpandedNode] = useState<string | null>(null);
  const [filterOrphansOnly, setFilterOrphansOnly] = useState(false);
  
  const [activeTab, setActiveTab] = useState<"constraints" | "orphans" | "edges" | "paths" | "nodes">("constraints");
  const [selectedOrphanToMap, setSelectedOrphanToMap] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeSelectedPathId, setActiveSelectedPathId] = useState<string | null>(null);
  const toggleNode = (nodeId: string) => {
    setExpandedNode((prev: string | null) => prev === nodeId ? null : nodeId);
  };
  // Filter lists of nodes
  
  const categories = useMemo(() => data.nodes.filter(n => n.type === "category" || n.type === "category_hub"), [data.nodes]);
  
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
            <div className="flex items-center gap-2 mt-2">
              <select
                className="bg-surface-elevated border border-white/10 text-white text-xs rounded-md px-2 py-1 outline-none appearance-none cursor-pointer"
                value={selectedSolutionId}
                onChange={(e) => setSelectedSolutionId(e.target.value)}
              >
                {solutions.length === 0 ? <option value="">No Solutions</option> : null}
                {solutions.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              
              <select
                className="bg-surface-elevated border border-white/10 text-white text-xs rounded-md px-2 py-1 outline-none appearance-none cursor-pointer"
                value={selectedUcidId}
                onChange={(e) => setSelectedUcidId(e.target.value)}
                disabled={!selectedSolutionId || availableUcids.length === 0}
              >
                {availableUcids.length === 0 ? <option value="">No Configs</option> : null}
                {availableUcids.map(u => (
                  <option key={u.id} value={u.id}>{u.configLabel || u.displayId}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button type="button" 
              onClick={() => setFilterOrphansOnly(!filterOrphansOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${filterOrphansOnly ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold' : 'bg-surface-elevated border-white/5 text-gray-400 hover:text-white'}`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{filterOrphansOnly ? 'Showing Orphans' : 'Filter Orphans'}</span>
            </button>
            <button type="button" 
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
          {!activeUcid ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface-card">
              <GitFork className="w-12 h-12 text-gray-600" />
              <div className="text-center">
                <span className="block text-sm font-bold text-gray-300">No Config Selected</span>
                <span className="text-[10px] text-gray-500 max-w-xs mt-1 inline-block">Please select a Solution and a corresponding configuration context to map taxonomy rules.</span>
              </div>
            </div>
          ) : isLoading ? (
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