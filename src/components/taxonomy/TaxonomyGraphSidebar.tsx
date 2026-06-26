import React, { useState } from 'react';
import type { CatalogSKU, ConstraintCheckResponse } from "../../types";
import { useToast } from "../shared/ToastContext";
import { apiClient } from "../../services/apiClient";
import { NodeEditorPanel } from "./NodeEditorPanel";
import { EdgeEditorPanel } from "./EdgeEditorPanel";
import {
  MechanicalConstraintsPanel,
  OrphanWorkshopPanel,
  PathOrchestratorPanel,
} from "./TaxonomyGraphPanels";
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
  const [validationResult, setValidationResult] = useState<ConstraintCheckResponse | null>(null);
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
        setValidationResult(res.data as ConstraintCheckResponse);
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
        <button type="button" 
          onClick={() => setActiveTab("constraints")}
          aria-label="Constraints Tab"
          className={`flex-1 pb-2 text-xs font-bold font-mono tracking-wider cursor-pointer uppercase transition-colors text-center border-0 bg-transparent ${
            activeTab === "constraints" ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Mechanical Check
        </button>
        <button type="button" 
          onClick={() => setActiveTab("orphans")}
          aria-label="Orphans Tab"
          className={`flex-1 pb-2 text-xs font-bold font-mono tracking-wider cursor-pointer uppercase transition-colors text-center border-0 bg-transparent ${
            activeTab === "orphans" ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Orphan Workshop
        </button>
        <button type="button" 
          onClick={() => setActiveTab("edges")}
          aria-label="Edges Tab"
          className={`flex-1 pb-2 text-xs font-bold font-mono tracking-wider cursor-pointer uppercase transition-colors text-center border-0 bg-transparent ${
            activeTab === "edges" ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Edges
        </button>
        <button type="button" 
          onClick={() => setActiveTab("paths")}
          aria-label="Paths Tab"
          className={`flex-1 pb-2 text-[10px] font-bold font-mono tracking-wider cursor-pointer uppercase transition-colors text-center border-0 bg-transparent ${
            activeTab === "paths" ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Paths
        </button>
        <button type="button" 
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
        <MechanicalConstraintsPanel
          selectedChassis={selectedChassis}
          setSelectedChassis={setSelectedChassis}
          selectedCpu={selectedCpu}
          setSelectedCpu={setSelectedCpu}
          ramQty={ramQty}
          setRamQty={setRamQty}
          psuWatts={psuWatts}
          setPsuWatts={setPsuWatts}
          chassisOptions={chassisOptions}
          cpuOptions={cpuOptions}
          isValidatingConstraints={isValidatingConstraints}
          validationResult={validationResult}
          handleValidateConstraints={handleValidateConstraints}
        />
      )}
      {activeTab === "orphans" && (
        <OrphanWorkshopPanel
          selectedOrphanToMap={selectedOrphanToMap}
          setSelectedOrphanToMap={setSelectedOrphanToMap}
          handleMapOrphanNode={handleMapOrphanNode}
          catalogSkus={catalogSkus}
          categories={categories}
          unmappedIds={data.unmappedIds || []}
        />
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
        <PathOrchestratorPanel
          alternativePaths={alternativePaths}
          activeSelectedPathId={activeSelectedPathId || null}
          setActiveSelectedPathId={(id) => setActiveSelectedPathId?.(id)}
          commitPathSelection={async (jobId, pathId) => {
            if (commitPathSelection) {
              return await commitPathSelection(jobId, pathId);
            }
            return false;
          }}
          setActiveTab={setActiveTab}
          toast={toast}
        />
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