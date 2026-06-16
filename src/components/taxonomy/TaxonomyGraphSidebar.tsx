import React, { useState } from 'react';
import { ShieldCheck, Layers, HelpCircle, RefreshCw, Zap, Network } from 'lucide-react';
import type { CatalogSKU } from "../../types";
import { useToast } from "../shared/ToastContext";
import { apiClient } from "../../services/apiClient";
import { NodeEditorPanel } from "./NodeEditorPanel";
import { EdgeEditorPanel } from "./EdgeEditorPanel";
interface TaxonomyGraphSidebarProps {
  catalogSkus: CatalogSKU[];
  setCatalogSkus: React.Dispatch<React.SetStateAction<CatalogSKU[]>>;
  data: { nodes: import('../../types').GraphNode[], edges: import('../../types').GraphEdge[], unmappedIds?: string[] };
  categories: import('../../types').GraphNode[];
  mapNode: (nodeId: string, parentId: string, metadata: import('../../hooks/useCatalogGraphData').MapNodeRequest) => Promise<void>;
  chassisOptions: CatalogSKU[];
  cpuOptions: CatalogSKU[];
  selectedOrphanToMap: string | null;
  setSelectedOrphanToMap: (id: string | null) => void;
  selectedEdgeId?: string | null;
  setSelectedEdgeId?: (id: string | null) => void;
  activeTab: "constraints" | "orphans" | "edges" | "paths" | "nodes";
  setActiveTab: (tab: "constraints" | "orphans" | "edges" | "paths" | "nodes") => void;
  alternativePaths?: import('../../types').GraphPath[];
  activeSelectedPathId?: string | null;
  setActiveSelectedPathId?: (id: string | null) => void;
  commitPathSelection?: (jobId: string, pathId: string) => Promise<boolean>;
  selectedNodeId?: string | null;
  setSelectedNodeId?: (id: string | null) => void;
  addGraphNode?: (node: Partial<import('../../types/data').GraphNode>) => Promise<boolean>;
  updateGraphNode?: (nodeId: string, updates: Partial<import('../../types/data').GraphNode>) => Promise<boolean>;
  deleteGraphNode?: (nodeId: string) => Promise<boolean>;
  addGraphEdge?: (edge: Partial<import('../../types/data').GraphEdge>) => Promise<boolean>;
  deleteGraphEdge?: (edgeId: string) => Promise<boolean>;
}

export function TaxonomyGraphSidebar({
  catalogSkus,
  setCatalogSkus,
  data,
  categories,
  mapNode,
  chassisOptions,
  cpuOptions,
  selectedOrphanToMap,
  setSelectedOrphanToMap,
  selectedEdgeId,
  setSelectedEdgeId,
  activeTab,
  setActiveTab,
  alternativePaths = [],
  activeSelectedPathId,
  setActiveSelectedPathId,
  commitPathSelection,
  selectedNodeId,
  setSelectedNodeId,
  addGraphNode,
  updateGraphNode,
  deleteGraphNode,
  addGraphEdge,
  deleteGraphEdge
}: TaxonomyGraphSidebarProps) {
  const { toast } = useToast();

  // State for constraints...
  const [selectedChassis, setSelectedChassis] = useState("");
  const [selectedCpu, setSelectedCpu] = useState("");
  const [ramQty, setRamQty] = useState(8);
  const [psuWatts, setPsuWatts] = useState(1600);
  const [isValidatingConstraints, setIsValidatingConstraints] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  const handleValidateConstraints = async () => {
    if (!selectedChassis || !selectedCpu) {
      toast("Please select a Chassis SKU and CPU SKU to check compatibility.", "warn");
      return;
    }
    setIsValidatingConstraints(true);
    setValidationResult(null);
    try {
      const res = await apiClient.post("/api/taxonomy/check-constraints", {
        chassisSku: selectedChassis,
        cpuSku: selectedCpu,
        ramQty,
        psuWatts
      });
      if (res.success) {
        setValidationResult(res.data);
        toast("Hardware constraint metrics calculated successfully.", "success");
      } else {
        toast("Mechanical validation rejected.", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Failed to validate server physical constraints.", "error");
    } finally {
      setIsValidatingConstraints(false);
    }
  };

  const handleMapOrphanNode = async (orphanId: string, categoryId: string) => {
    const orphanNodeName = catalogSkus.find(s => s.partNumber === orphanId || s.id === orphanId)?.name || "Mapped Item";
    
    let type = "Unknown";
    if (categoryId.includes("Processor")) type = "Processor";
    else if (categoryId.includes("Memory")) type = "Memory";
    else if (categoryId.includes("Storage")) type = "Storage";
    else if (categoryId.includes("Controller")) type = "Controller";
    else if (categoryId.includes("Network")) type = "Network";
    else if (categoryId.includes("Power")) type = "Power";
    else if (categoryId.includes("Cooling")) type = "Cooling";
    else if (categoryId.includes("Chassis")) type = "Chassis Option";

    try {
      await mapNode(orphanId, categoryId, { partNumber: orphanId, name: orphanNodeName, type });
      
      setCatalogSkus(prev => prev.map(s => {
        if (s.partNumber === orphanId) {
          return {
            ...s,
            type: type,
            status: "active" as const
          };
        }
        return s;
      }));

      setSelectedOrphanToMap(null);
      toast(`Successfully mapped ${orphanId} to ${type} Category node.`, "success");
    } catch (e) {
      console.error(e);
      toast("Failed to commit mapping to server state.", "error");
    }
  };


  return (
    <div 
      className="w-full lg:w-80 p-5 rounded-xl border flex flex-col gap-4 bg-surface-card"
      style={{ borderColor: "rgba(74, 133, 253, 0.08)" }}
    >
      <div className="flex border-b border-white/5 pb-1">
        <button 
          onClick={() => setActiveTab("constraints")}
          aria-label="Constraints Tab"
          className={`flex-1 pb-2 text-xs font-bold font-mono tracking-wider cursor-pointer uppercase transition-colors text-center border-0 bg-transparent ${
            activeTab === "constraints" ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Mechanical Check
        </button>
        <button 
          onClick={() => setActiveTab("orphans")}
          aria-label="Orphans Tab"
          className={`flex-1 pb-2 text-xs font-bold font-mono tracking-wider cursor-pointer uppercase transition-colors text-center border-0 bg-transparent ${
            activeTab === "orphans" ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Orphan Workshop
        </button>
        <button 
          onClick={() => setActiveTab("edges")}
          aria-label="Edges Tab"
          className={`flex-1 pb-2 text-xs font-bold font-mono tracking-wider cursor-pointer uppercase transition-colors text-center border-0 bg-transparent ${
            activeTab === "edges" ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Edges
        </button>
        <button 
          onClick={() => setActiveTab("paths")}
          aria-label="Paths Tab"
          className={`flex-1 pb-2 text-[10px] font-bold font-mono tracking-wider cursor-pointer uppercase transition-colors text-center border-0 bg-transparent ${
            activeTab === "paths" ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Paths
        </button>
        <button 
          onClick={() => setActiveTab("nodes")}
          aria-label="Nodes Tab"
          className={`flex-1 pb-2 text-[10px] font-bold font-mono tracking-wider cursor-pointer uppercase transition-colors text-center border-0 bg-transparent ${
            activeTab === "nodes" ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Nodes
        </button>
      </div>

      {activeTab === "constraints" && (
        <div className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Socket Compatibility Tester
            </div>
            <p className="text-[10px] text-gray-400 leading-normal">
              Test logical pins, RAM channels, and thermal configurations before submitting design alternatives to vendor pipelines.
            </p>

            <div className="space-y-1.5">
              <label htmlFor="chassis-select" className="text-[9px] font-mono text-gray-400 uppercase font-bold tracking-wide">
                Chassis Form Factor
              </label>
              <select
                id="chassis-select"
                value={selectedChassis}
                onChange={e => setSelectedChassis(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 text-white"
              >
                <option value="" className="bg-surface-elevated">-- Select Target Chassis --</option>
                {chassisOptions.map(c => (
                  <option key={c.id} value={c.partNumber} className="bg-surface-elevated">
                    {c.partNumber} — {c.name.split("Chassis")[0]?.trim() || c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cpu-select" className="text-[9px] font-mono text-gray-400 uppercase font-bold tracking-wide">
                Processor Socket Architecture
              </label>
              <select
                id="cpu-select"
                value={selectedCpu}
                onChange={e => setSelectedCpu(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 text-white"
              >
                <option value="" className="bg-surface-elevated">-- Select Sourced CPU --</option>
                {cpuOptions.map(cpu => (
                  <option key={cpu.id} value={cpu.partNumber} className="bg-surface-elevated">
                    {cpu.partNumber} — {cpu.name.replace("Processor", "").trim()}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ram-qty" className="text-[9px] font-mono text-gray-400 uppercase font-bold tracking-wide">
                DDR5 Memory Quantity (DIMMs)
              </label>
              <input
                id="ram-qty"
                type="number"
                min="1"
                max="32"
                value={ramQty}
                onChange={e => setRamQty(Number(e.target.value))}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 text-white font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="psu-watts" className="text-[9px] font-mono text-gray-400 uppercase font-bold tracking-wide">
                Power Supply Capacity (Watts)
              </label>
              <input
                id="psu-watts"
                type="number"
                step="100"
                min="500"
                max="3000"
                value={psuWatts}
                onChange={e => setPsuWatts(Number(e.target.value))}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 text-white font-mono"
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/5">
            {validationResult && (
              <div 
                className="p-3.5 rounded-lg text-[10px] space-y-2 border border-emerald-500/20 bg-emerald-500/5 animate-fadeIn"
              >
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>SOCKET METRICS MATCHED</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px] text-gray-300">
                  <div>Chassis Pin: <span className="text-white">{validationResult.chassisSocket}</span></div>
                  <div>CPU Socket: <span className="text-white">{validationResult.cpuSocket}</span></div>
                  <div>RAM Allocation: <span className="text-emerald-400">{validationResult.memoryChannels}</span></div>
                  <div>Storage Controller: <span className="text-emerald-400">{validationResult.storageController}</span></div>
                </div>
              </div>
            )}

            <button
              onClick={handleValidateConstraints}
              disabled={isValidatingConstraints}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold rounded-lg border border-indigo-400/20 transition cursor-pointer text-xs uppercase font-mono shadow-md"
            >
              {isValidatingConstraints ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Checking Pins...
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-indigo-300" /> Validate Constraints
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {activeTab === "orphans" && (
        <div className="flex-1 flex flex-col justify-between gap-4">
          <div className="space-y-3.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-mono">
              <Layers className="w-4 h-4 text-amber-400 animate-pulse" />
              Orphan Alignment Desk
            </div>
            <p className="text-[10px] text-gray-400 leading-normal">
              Mapping orphaned SKUs establishes critical boundaries and prevents unbuildable config loops.
            </p>

            {selectedOrphanToMap ? (
              <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-lg space-y-3 animate-fadeIn text-xs">
                <div>
                  <span className="text-[9px] font-mono text-gray-400 uppercase block">Aligning Part</span>
                  <strong className="text-indigo-300 font-mono text-xs">{selectedOrphanToMap}</strong>
                  <p className="text-[9px] text-gray-400 mt-0.5">
                    {catalogSkus.find(s => s.partNumber === selectedOrphanToMap)?.name || "Raw component metadata"}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <label htmlFor="target-subsystem" className="text-[9px] font-mono text-gray-400 uppercase font-bold tracking-wide block">
                    Target Subsystem Category
                  </label>
                  <select
                    id="target-subsystem"
                    onChange={e => handleMapOrphanNode(selectedOrphanToMap, e.target.value)}
                    defaultValue=""
                    className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 text-white"
                  >
                    <option value="" disabled>-- Choose Subsystem --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id} className="bg-surface-elevated">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={() => setSelectedOrphanToMap(null)}
                  className="w-full text-center text-[9px] font-mono text-gray-500 hover:text-gray-300 border-0 bg-transparent cursor-pointer"
                >
                  Cancel Action
                </button>
              </div>
            ) : (
              <div className="p-4 border border-dashed border-white/10 rounded-lg text-center text-[10px] text-gray-500 flex flex-col items-center justify-center min-h-[140px] gap-2">
                <HelpCircle className="w-8 h-8 text-gray-600" />
                <p>Click "Auto-Map SKU" on any orphan node in the graph canvas to configure categorization boundaries.</p>
              </div>
            )}
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin pr-1 pt-2 border-t border-white/5">
            <span className="text-[9px] font-mono text-gray-500 font-bold uppercase block tracking-wider mb-1">
              Active Orphans ({(data.unmappedIds || []).length})
            </span>
            {(data.unmappedIds || []).map((oId: string) => {
              const sRef = catalogSkus.find(s => s.partNumber === oId || s.id === oId);
              return (
                <div 
                  key={oId}
                  className="flex justify-between items-center p-2 rounded bg-black/25 border border-white/5 text-[10px] group hover:border-indigo-500/20"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-mono text-rose-300 font-semibold block truncate">{oId}</span>
                    <span className="text-gray-500 text-[8.5px] block truncate">{sRef?.name || "Unstructured name"}</span>
                  </div>
                  <button
                    onClick={() => setSelectedOrphanToMap(oId)}
                    className="px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/20 text-indigo-400 font-bold text-[9px] font-mono rounded cursor-pointer shrink-0 transition"
                  >
                    Map
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "edges" && (
        <EdgeEditorPanel
          data={data}
          selectedEdgeId={selectedEdgeId}
          setSelectedEdgeId={setSelectedEdgeId}
          deleteGraphEdge={deleteGraphEdge}
          addGraphEdge={addGraphEdge}
        />
      )}

      {activeTab === "paths" && (
        <div className="flex-1 flex flex-col gap-4">
          <div className="space-y-3.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 font-mono">
              <RefreshCw className="w-4 h-4 text-indigo-400" />
              Path Orchestrator
            </div>
            <p className="text-[10px] text-gray-400 leading-normal">
              Evaluate isometric path alternatives. Select a path to visualize its trajectory.
            </p>

            {alternativePaths.length > 0 ? (
              <div className="space-y-3">
                {alternativePaths.map((path) => (
                  <div 
                    key={path.pathId}
                    onClick={() => setActiveSelectedPathId?.(path.pathId)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${activeSelectedPathId === path.pathId ? 'bg-indigo-900/30 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-surface-elevated border-white/10 hover:border-indigo-400/50'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold font-mono text-white">Path Rank #{path.rank}</span>
                      <span className={`text-[10px] font-bold ${path.confidence >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {path.confidence}% Confidence
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-gray-400">Total Cost</span>
                      <span className="text-[11px] font-bold text-white">${path.totalCost.toLocaleString()}</span>
                    </div>
                  </div>
                ))}

                {activeSelectedPathId && (
                  <button
                    onClick={async () => {
                      if (commitPathSelection) {
                        const success = await commitPathSelection("current-job", activeSelectedPathId);
                        if (success) {
                          toast("Path selection committed successfully.", "success");
                          setActiveTab("constraints");
                        } else {
                          toast("Failed to commit path selection.", "error");
                        }
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg border border-emerald-400/20 transition cursor-pointer text-[10px] uppercase font-mono shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  >
                    Commit Active Path
                  </button>
                )}
              </div>
            ) : (
              <div className="p-4 border border-dashed border-white/10 rounded-lg text-center text-[10px] text-gray-500 flex flex-col items-center justify-center min-h-[140px] gap-2">
                <Layers className="w-8 h-8 text-gray-600" />
                <p>Click on any primary Category Hub node in the canvas to calculate alternative fulfillment paths.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "nodes" && (
        <NodeEditorPanel
          data={data}
          selectedNodeId={selectedNodeId}
          setSelectedNodeId={setSelectedNodeId}
          updateGraphNode={updateGraphNode}
          deleteGraphNode={deleteGraphNode}
          addGraphNode={addGraphNode}
        />
      )}
    </div>
  );
}
