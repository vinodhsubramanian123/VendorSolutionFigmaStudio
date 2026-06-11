import React, { useState, useMemo } from 'react';
import { 
  Network, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Filter, 
  AlertTriangle, 
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from "motion/react";
import { useCatalogGraphData } from "../../hooks/useCatalogGraphData";
import type { Config, CatalogSKU, Vendor } from "../../types";
import { TaxonomyGraphSidebar } from "./TaxonomyGraphSidebar";
import { TaxonomyCategoryTree } from "./TaxonomyCategoryTree";
import { TaxonomyOrphanBox } from "./TaxonomyOrphanBox";
import { ErrorBoundary } from "../shared/ErrorBoundary";

const DEFAULT_CONFIGS = [{ id: "cfg-base", vendor: "HPE" } as Config];

interface TaxonomyGraphViewProps {
  catalogSkus: CatalogSKU[];
  setCatalogSkus: React.Dispatch<React.SetStateAction<CatalogSKU[]>>;
  vendors: Vendor[];
}

export function TaxonomyGraphView({ catalogSkus, setCatalogSkus, vendors }: TaxonomyGraphViewProps) {
  const { data, isLoading, mapNode, refresh } = useCatalogGraphData(
    "cfg-base", 
    DEFAULT_CONFIGS, 
    catalogSkus
  );

  // States
  const [expandedNode, setExpandedNode] = useState<string | null>(null);
  const [filterOrphansOnly, setFilterOrphansOnly] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const [activeTab, setActiveTab] = useState<"constraints" | "orphans">("constraints");
  const [selectedOrphanToMap, setSelectedOrphanToMap] = useState<string | null>(null);

  // Zoom & Pan functions
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 1.8));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.5));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".node-card") || (e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("select")) {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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

        {/* Viewport Canvas Container */}
        <div 
          role="presentation"
          className="relative flex-1 w-full bg-surface-card border border-indigo-500/10 rounded-xl overflow-hidden min-h-[560px] select-none cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Subtle Grid Background */}
          <div 
            className="absolute inset-0 opacity-[0.03]" 
            style={{ 
              backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", 
              backgroundSize: "24px 24px" 
            }} 
          />

          {/* Floating Zoom & Position Controls */}
          <div className="absolute top-4 left-4 z-30 flex items-center gap-1 bg-black/60 border border-white/10 rounded-lg p-1">
            <button 
              onClick={handleZoomIn} 
              className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white rounded transition cursor-pointer border-0" 
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button 
              onClick={handleZoomOut} 
              className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white rounded transition cursor-pointer border-0" 
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-white/10 mx-1" />
            <button 
              onClick={handleResetZoom} 
              className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white rounded transition text-[10px] font-mono font-bold cursor-pointer border-0" 
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <span className="text-[9px] font-mono text-gray-400 px-1">{Math.round(zoom * 100)}%</span>
          </div>

          {/* Transforming Graph Node Content */}
          <div 
            className="absolute inset-0 flex flex-col items-center justify-start p-16 transition-transform duration-75 ease-out origin-top-left"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              width: "100%",
              height: "100%"
            }}
          >
            {isLoading ? (
              <div className="m-auto flex flex-col items-center gap-3">
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                <span className="text-xs font-mono text-indigo-300">Synchronizing Sourcing Tree...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-16 min-w-max p-12">
                {/* Level 1: System Base configuration */}
                <div className="flex justify-center">
                  {rootNodes.map(node => (
                    <motion.div 
                      key={node.id}
                      onClick={() => toggleNode(node.id)}
                      className={`node-card p-4 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-lg w-56 bg-surface-elevated/90 relative ${
                        expandedNode === node.id ? 'border-indigo-400 shadow-indigo-500/20 shadow-md scale-105' : 'border-indigo-500/30'
                      }`}
                      whileHover={{ y: -2 }}
                    >
                      <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest mb-1">Target Engine Base</span>
                      <span className="text-xs font-bold text-white font-mono">{node.label}</span>
                      <span className="text-[9px] text-gray-400 mt-1 max-w-[190px] truncate">{node.sublabel}</span>
                      
                      <AnimatePresence>
                        {expandedNode === node.id && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-24 w-60 bg-black/95 border border-indigo-500/30 rounded-xl p-3 text-left shadow-2xl z-40"
                            onClick={e => e.stopPropagation()}
                          >
                            <span className="text-[9px] font-bold text-indigo-300 block mb-1.5 uppercase font-mono">Structural Rules</span>
                            <div className="space-y-1 text-[9px] text-gray-300">
                              {node.constraints?.map((c, idx) => (
                                <div key={idx} className="flex items-start gap-1">
                                  <span className="text-indigo-400 font-bold">•</span>
                                  <span>{c}</span>
                                </div>
                              )) || <div>No specific base rules.</div>}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>

                {/* Vertical Connector lines */}
                {rootNodes.length > 0 && categories.length > 0 && (
                  <div className="w-[1.5px] h-10 bg-indigo-500/20 -mt-16 z-0" />
                )}                {/* Level 2 & 3: Category Nodes with children items grouped underneath */}
                <TaxonomyCategoryTree
                  categories={categories}
                  skus={skus}
                  data={data}
                  filterOrphansOnly={filterOrphansOnly}
                  expandedNode={expandedNode}
                  toggleNode={toggleNode}
                />

                {/* Orphaned Box at bottom if not filtered out */}
                <TaxonomyOrphanBox
                  data={data}
                  skus={skus}
                  filterOrphansOnly={filterOrphansOnly}
                  setSelectedOrphanToMap={setSelectedOrphanToMap}
                  setActiveTab={setActiveTab}
                />
              </div>
            )}
          </div>
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
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
    </ErrorBoundary>
  );
}
