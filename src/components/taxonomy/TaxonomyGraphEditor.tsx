import { useCatalogGraphData } from "../../hooks/useCatalogGraphData";
import React, { useState, useMemo, useEffect } from "react";
import { 
  Network,
  Shield,
  Layers,
  CheckCircle,
  X,
  Maximize,
  ChevronDown,
  Settings2,
  Trash2,
  Activity,
  Plus,
  Loader2
} from 'lucide-react';
import type { UCID, CatalogSKU, Config } from "../../types";
import { StatusBadge } from "../shared/StatusBadge";
import { createPortal } from "react-dom";
import { useToast } from "../shared/ToastContext";
import { MockTaxonomyApi, TaxonomyGraphNode, TaxonomyGraphEdge } from "../../lib/api-mock";

interface TreeNode {
  node: TaxonomyGraphNode;
  edgeLabel: string;
  edgeType: string;
  children: TreeNode[];
}

function DiagnosticOverlay({
  unmapped,
  onFix,
}: {
  unmapped: any[];
  onFix: (item: any) => void;
}) {
  if (unmapped.length === 0) return null;

  return (
    <div className="w-[340px] shrink-0 bg-surface-elevated/95 shadow-2xl border border-warning/30 rounded-xl flex flex-col h-full animate-fadeIn overflow-hidden">
      <div className="bg-warning/10 p-4 border-b border-warning/20 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-warning" />
          <span className="text-sm font-bold text-white tracking-tight">
            Diagnostic Panel
          </span>
        </div>
        <StatusBadge
          variant="error"
          status={`${unmapped.length} Invalid`}
        />
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#03050a]/50 scrollbar">
        {unmapped.map((item) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData(
                "application/json",
                JSON.stringify({ type: "orphan", id: item.id, item })
              );
              e.currentTarget.style.opacity = "0.5";
            }}
            onDragEnd={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
            className="bg-white/5 border border-white/10 rounded-lg p-3 group relative transition-all hover:bg-white/10 cursor-grab active:cursor-grabbing"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-warning/50 rounded-l-lg" />
            <div className="pl-2 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white tracking-tight truncate">
                  {item.partNumber}
                </h4>
                <p className="text-[10px] text-gray-400 font-mono mt-1 truncate">
                  "{item.rawDescription}"
                </p>
                <div className="text-[9px] text-warning mt-2 bg-warning/5 border border-warning/10 p-1.5 rounded inline-flex items-center gap-1.5">
                  <X className="w-3 h-3" />
                  Orphaned Node
                </div>
              </div>
              <button
                onClick={() => onFix(item)}
                className="bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-bold px-3 py-1.5 rounded transition shadow-md whitespace-nowrap shrink-0"
              >
                Auto-Fix
              </button>
            </div>
            <div className="text-[10px] text-gray-500 mt-2 font-mono flex items-center pl-2">
              <Layers className="w-3 h-3 mr-1" />
              Drag onto Target Node
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TaxonomyGraphEditor({
  ucids,
  setUcids,
  catalogSkus,
  setCatalogSkus,
  activeMissionId,
  setActiveMissionId,
}: {
  ucids?: UCID[];
  setUcids?: React.Dispatch<React.SetStateAction<UCID[]>>;
  catalogSkus: CatalogSKU[];
  setCatalogSkus?: React.Dispatch<React.SetStateAction<CatalogSKU[]>>;
  activeMissionId?: string;
  setActiveMissionId?: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const { success, warn, error } = useToast();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Extract all configs from UCIDs
  const allConfigs = useMemo(() => {
    if (!ucids) return [];
    return ucids.flatMap(u => 
      (u.solutions || []).flatMap(sol => 
        (sol.vendorSubmissions || []).flatMap(vs => 
          (vs.configs || []).map(c => ({
            ...c,
            vendor: vs.vendor,
            ucidId: u.id,
            ucidDisplayId: u.displayId,
            ucidName: u.name
          }))
        )
      )
    );
  }, [ucids]);

  const [activeConfigId, setActiveConfigId] = useState<string | null>(
     (activeMissionId ? allConfigs.find(c => c.ucidId === activeMissionId)?.id : null) || allConfigs[0]?.id || null
  );
  const [panelTab, setPanelTab] = useState<"details" | "rules">("details");

  const { data: graphData, isLoading, mapNode, unmapNode, addRule } = useCatalogGraphData(activeConfigId, allConfigs, catalogSkus);

  // Derived Tree logic
  const { nodesMap, treeRoot, edgesArray, unmapped } = useMemo(() => {
    const nodes = new Map<string, TaxonomyGraphNode>();
    graphData.nodes.forEach(n => nodes.set(n.id, n));
    
    const adjacencyList = new Map<string, { to: string, type: string }[]>();
    graphData.edges.forEach(edge => {
       if (!adjacencyList.has(edge.from)) adjacencyList.set(edge.from, []);
       adjacencyList.get(edge.from)!.push({ to: edge.to, type: edge.type });
    });

    const buildTree = (id: string, visited = new Set<string>()): TreeNode => {
      const node = nodes.get(id);
      if (!node) return null as any;
      if (visited.has(id)) return { node, edgeLabel: "", edgeType: "contains", children: [] };
      visited.add(id);

      const childrenLinks = adjacencyList.get(id) || [];
      return {
        node,
        edgeLabel: "ROOT",
        edgeType: "contains",
        children: childrenLinks.map(link => ({
            node: buildTree(link.to, new Set(visited)).node,
            edgeType: link.type,
            edgeLabel: link.type === "contains" ? "CONTAINS" : (link.type === "requires" ? "REQUIRES" : "EXCLUSIVE"),
            children: buildTree(link.to, new Set(visited)).children
        })).filter(c => c.node)
      };
    };

    const rootNode = graphData.nodes.find(n => n.type === 'product');
    const tree = rootNode ? buildTree(rootNode.id) : null;
    const unmappedItems = graphData.unmappedIds.map(id => {
      const existing = catalogSkus.find(s => s.id === id || s.partNumber === id);
      return {
        id,
        partNumber: id,
        name: existing?.name || `Unknown Part ${id}`,
        rawDescription: `Parsed string identifier: ${id}`,
        confidence: (existing as any)?.confidence || Math.floor(Math.random() * 40) + 10
      };
    });
    return { nodesMap: nodes, treeRoot: tree, unmapped: unmappedItems, edgesArray: graphData.edges };
  }, [graphData]);

  const handleMapNode = async (childId: string, parentId: string, childInfo: any) => {
     try {
       await mapNode(childId, parentId, childInfo);
       success("Node dynamically linked to the active configuration graph.");
     } catch(e) {
       error("Failed to map node");
     }
  };

  const handleRemoveMapping = async (nodeId: string) => {
     try {
       await unmapNode(nodeId);
       setSelectedNodeId(null);
       warn("Mapping successfully degraded to orphaned state.");
     } catch(e) {
       error("Failed to detach node");
     }
  };

  const handleAddRule = async (nodeId: string, type: "requires"|"exclusive", note: string) => {
    try {
      await addRule(nodeId, type, note);
      success("A new relational logic constraint was baked into the graph.");
    } catch(e) {
      error("Failed to inject rule.");
    }
  };

  const selectedNodeInfo = selectedNodeId ? nodesMap.get(selectedNodeId) : null;
  const activeConfigObj = allConfigs.find(c => c.id === activeConfigId);

  if (allConfigs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] border border-white/5 rounded-xl bg-surface-card animate-fadeIn">
        <Network className="w-12 h-12 text-indigo-500/30 mb-4" />
        <h3 className="text-base font-bold text-white mb-2">No Configurations Available</h3>
        <p className="text-xs text-gray-400 max-w-md text-center leading-relaxed">
          The taxonomy engine requires an active configuration to generate relationship graphs. Please ingest a BOQ and run it through the intelligence engine first.
        </p>
      </div>
    );
  }

  const graphContent = (
    <div className={`flex flex-col gap-0 animate-fadeIn text-content-primary font-sans bg-[#03050a] ${isFullscreen ? 'fixed inset-0 z-50 p-6' : 'relative h-[800px] rounded-xl border border-white/10'}`}>
      {/* Header Panel */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 shrink-0 bg-transparent z-20">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
            <Network className="w-5 h-5 text-indigo-400" />
            Taxonomy Editor: Atomic Configuration Linkage
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Resolve unmapped BOQ items by connecting them to the intelligence classification tree for this specific configuration.
          </p>
        </div>
        <div className="flex gap-3">
          
          {/* Atomic Config Selector */}
           <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-white/10 text-white text-xs font-bold transition-all hover:bg-white/5 disabled:opacity-50" disabled={allConfigs.length === 0}>
                <Layers className="w-4 h-4 text-indigo-400" />
                {activeConfigObj ? activeConfigObj.name : "No Configs Available"}
                <ChevronDown className="w-3 h-3 ml-2 text-gray-500" />
              </button>
              {/* Dropdown */}
              <div className="absolute top-full mt-2 right-0 w-[420px] max-h-[400px] overflow-y-auto bg-surface-elevated border border-white/10 rounded-xl shadow-xl p-2 hidden group-hover:block z-50 scrollbar">
                 <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 pb-2 mb-2 border-b border-white/5">Select Solution Element</div>
                 {allConfigs.map((c, idx) => (
                   <button
                     key={`${c.id}-${idx}`}
                     onClick={() => { setActiveConfigId(c.id); setSelectedNodeId(null); }}
                     className={`w-full text-left flex flex-col gap-1 px-3 py-2 rounded-lg text-xs font-bold transition ${activeConfigId === c.id ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-300 hover:bg-white/5'}`}
                   >
                     <div className="flex justify-between items-center w-full">
                        <span className="truncate flex-1">{c.name}</span>
                        {c.ucidDisplayId && <span className="ml-2 text-[9px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded shrink-0">[{c.ucidDisplayId}]</span>}
                     </div>
                     <span className="text-[10px] font-normal opacity-70">Vendor: {c.vendor} {c.ucidName ? `| Mission: ${c.ucidName}` : ''}</span>
                   </button>
                 ))}
                 {allConfigs.length === 0 && (
                   <div className="text-xs text-gray-400 p-2 text-center">No configs found across UCIDs.</div>
                 )}
              </div>
           </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all"
          >
            <Maximize className="w-4 h-4" /> {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
          
        </div>
      </div>

      <div className="flex-1 flex gap-4 mt-4 overflow-hidden">
         {/* Main Knowledge Graph View (Hierarchical Tree) */}
         <div className="flex-1 relative flex flex-col overflow-hidden bg-[#070a13] rounded-xl border border-white/5 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">
            
            <div className="absolute top-4 left-4 z-20 flex gap-2">
                <StatusBadge variant="success" status={`${nodesMap.size} Graph Nodes`} />
                <StatusBadge variant="info" status={`${edgesArray.length} Active Edges`} />
            </div>

            <div className="flex-1 overflow-auto relative z-10 w-full scrollbar">
               <div 
                 className="min-w-max min-h-full p-16 pb-[30vh] pr-[40vw] relative"
                 style={{
                   backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
                   backgroundSize: "24px 24px",
                 }}
               >
                 {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-20 text-indigo-400 gap-4">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span className="text-sm font-mono tracking-widest uppercase">Fetching Topology...</span>
                    </div>
                 ) : treeRoot ? (
                    <TreeNodeView
                       nodeWrapper={treeRoot}
                       selectedNodeId={selectedNodeId}
                       onSelect={setSelectedNodeId}
                       onMapNode={handleMapNode}
                    />
                 ) : (
                    <div className="flex items-center justify-center p-20 text-gray-500 font-mono">No Graph Data Generated</div>
                 )}
               </div>
            </div>
         </div>
         {/* Right Sidebar Panes */}
         <div className="w-[340px] shrink-0 flex flex-col gap-4 overflow-hidden h-full">
           {selectedNodeId && selectedNodeInfo && (
             <div className="bg-surface-elevated/95 shadow-2xl border border-indigo-500/30 rounded-xl flex flex-col flex-1 animate-slideInRight overflow-hidden relative">
               {/* Editor Header */}
               <div className="p-4 bg-black/40 border-b border-white/5 flex items-start justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex justify-center items-center shrink-0 shadow-lg">
                       <Settings2 className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                       <h3 className="text-base font-bold text-white truncate max-w-[220px]">{selectedNodeInfo.label}</h3>
                       <p className="text-[10px] text-indigo-400 font-mono capitalize tracking-widest">{selectedNodeInfo.type}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedNodeId(null)} className="p-1 hover:bg-white/10 rounded-md text-gray-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
               </div>

               <div className="p-4 flex-1 flex flex-col gap-2 overflow-hidden">
                 <div className="grid grid-cols-2 gap-2 mb-2 shrink-0">
                   <div className="p-2 bg-black/40 rounded-lg border border-white/5">
                     <span className="text-[9px] text-gray-500 font-bold uppercase block">Atomic Ref</span>
                     <span className="text-xs font-mono text-white truncate max-w-[140px] block mt-1">{activeConfigObj?.name || "Solution"}</span>
                   </div>
                   <div className="p-2 bg-black/40 rounded-lg border border-white/5">
                     <span className="text-[9px] text-gray-500 font-bold uppercase block">Node ID</span>
                     <span className="text-[10px] font-mono text-white truncate block mt-1">{selectedNodeInfo.id.substring(0,18)}</span>
                   </div>
                 </div>

                 <div className="flex bg-black/40 rounded-lg p-1 border border-white/5 shrink-0">
                   <button
                     onClick={() => setPanelTab("details")}
                     className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition ${panelTab === "details" ? "bg-indigo-500 text-white shadow" : "text-gray-400 hover:text-white"}`}
                   >
                     Metadata
                   </button>
                   <button
                      onClick={() => setPanelTab("rules")}
                     className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition ${panelTab === "rules" ? "bg-indigo-500 text-white shadow" : "text-gray-400 hover:text-white"}`}
                   >
                     Validation Rules
                   </button>
                 </div>

                 <div className="flex-1 mt-2 overflow-y-auto scrollbar pr-1">
                   {panelTab === "details" ? (
                     <div className="space-y-4 animate-fadeIn">
                       {selectedNodeInfo.type === 'subproduct' && (
                         <div>
                             <h4 className="text-[10px] font-bold text-amber-500/80 mb-2 uppercase tracking-widest flex items-center gap-1.5"><Shield className="w-3.5 h-3.5"/> Physical Bounds</h4>
                             <div className="flex justify-between items-center bg-black/20 p-2 rounded border border-white/5">
                               <span className="text-[10px] text-gray-400">Max Capacity Enforced</span>
                               <span className="text-[10px] font-mono text-emerald-400">14 Units</span>
                             </div>
                         </div>
                       )}
                       {selectedNodeInfo.type === 'sku' && (
                         <div>
                             <h4 className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Pricing Dimension</h4>
                             <div className="flex justify-between items-center bg-black/20 p-2 rounded border border-white/5">
                               <span className="text-[10px] text-gray-400">Base Unit Price</span>
                               <span className="text-[10px] font-mono text-white leading-none">{selectedNodeInfo.sublabel}</span>
                             </div>
                         </div>
                       )}
                       <div>
                         <h4 className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Metadata Tags</h4>
                         <div className="flex flex-wrap gap-1.5">
                            <span className="px-2 py-1 rounded-sm bg-white/5 border border-white/10 text-[9px] text-gray-400">Auto-Resolved</span>
                            <span className="px-2 py-1 rounded-sm bg-indigo-500/10 border border-indigo-500/20 text-[9px] text-indigo-400">Intel Synced</span>
                         </div>
                       </div>
                     </div>
                   ) : (
                      <div className="space-y-4 animate-fadeIn">
                         <div>
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-white/5 pb-1">Enforced Constraints</h4>
                            <div className="space-y-2">
                              {selectedNodeInfo.constraints && selectedNodeInfo.constraints.length > 0 ? selectedNodeInfo.constraints.map((con, cIdx) => (
                                <div key={cIdx} className="flex items-start bg-black/40 p-2 rounded border border-white/5">
                                   <Shield className="w-3 h-3 text-amber-500 mt-0.5 mr-2 shrink-0" />
                                   <span className="text-[10px] text-gray-300 leading-tight">{con}</span>
                                </div>
                              )) : <div className="text-[10px] text-gray-500 italic p-2">No bounded constraints</div>}
                            </div>
                         </div>

                         <div className="pt-2 border-t border-white/5">
                           <p className="text-[9px] text-gray-500 mb-2">Inject Custom Intelligence Rule:</p>
                           <button 
                             onClick={() => handleAddRule(selectedNodeInfo.id, "requires", "Enforced pairing per Solution Design")}
                             className="w-full flex items-center gap-2 justify-center bg-white/5 hover:bg-white/10 border border-white/10 py-1.5 rounded text-[10px] text-gray-300 transition-colors"
                           >
                              <Plus className="w-3 h-3 text-indigo-400" /> Append Requirement Condition
                           </button>
                         </div>
                      </div>
                   )}
                 </div>
                 
                 {/* Actions Footer */}
                 <div className="flex gap-2 mt-2 pt-3 border-t border-white/5 shrink-0">
                   {edgesArray.some(l => l.to === selectedNodeInfo.id) && (
                      <button 
                        onClick={() => handleRemoveMapping(selectedNodeInfo.id)}
                        className="flex-1 bg-red-500/10 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 text-red-500/70 font-bold text-[10px] py-1.5 rounded border border-red-500/20 transition flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Detach Edge
                      </button>
                   )}
                 </div>
               </div>
             </div>
           )}
           <div className={`overflow-hidden flex flex-col ${selectedNodeId && selectedNodeInfo ? "max-h-[50%]" : "flex-1"}`}>
             <DiagnosticOverlay 
                unmapped={unmapped} 
                onFix={(item) => {
                  // Auto-map orphan to root node as a "Fix" override
                  if (treeRoot?.node?.id) {
                    handleMapNode(item.id, treeRoot.node.id, item);
                  } else {
                    warn("Root node not identified, cannot auto-map.");
                  }
                }} 
              />
           </div>
         </div>
      </div>


    </div>
  );

  return isFullscreen ? createPortal(graphContent, document.body) : graphContent;
}

// -------------------------------------------------------------------------------------
// Recursive Tree Renderer Tooling

const getNodeColorStyles = (type: string) => {
  switch(type) {
    case "product": return { border: "border-blue-500/30", bg: "bg-blue-500/10", text: "text-blue-400" };
    case "subproduct": return { border: "border-purple-500/30", bg: "bg-purple-500/10", text: "text-purple-400" };
    case "category": return { border: "border-emerald-500/30", bg: "bg-emerald-500/10", text: "text-emerald-400" };
    case "subcategory": return { border: "border-amber-500/30", bg: "bg-amber-500/10", text: "text-amber-400" };
    case "sku": return { border: "border-red-500/30", bg: "bg-red-500/10", text: "text-red-400" };
    default: return { border: "border-gray-500/30", bg: "bg-gray-500/10", text: "text-gray-400" };
  }
};

const TreeNodeView = ({ 
  nodeWrapper, 
  selectedNodeId, 
  onSelect,
  onMapNode
}: { 
  nodeWrapper: TreeNode, 
  selectedNodeId: string | null, 
  onSelect: (id: string) => void,
  onMapNode: (childId: string, parentId: string, childInfo: any) => void 
}) => {
  const { node, children, edgeType, edgeLabel } = nodeWrapper;
  const isSelected = selectedNodeId === node.id;
  const colors = getNodeColorStyles(node.type);
  const [isDragOver, setIsDragOver] = useState(false);

  // Parent line formatting based on edge relationship
  let connectorColor = "bg-white/20";
  if (edgeType === "requires") connectorColor = "bg-red-500/50";
  if (edgeType === "exclusive") connectorColor = "bg-amber-500/50";

  return (
    <div className="flex items-center group/node relative">
      
      {/* Node Data Card with Drag / Drop Targets */}
      <div
        draggable={node.id !== treeRoot?.node?.id}
        onDragStart={(e) => {
          if (node.id !== treeRoot?.node?.id) {
            e.dataTransfer.setData("application/json", JSON.stringify({ type: "existing_node", id: node.id, item: { partNumber: node.label, rawDescription: node.sublabel } }));
            e.currentTarget.style.opacity = '0.5';
          }
        }}
        onDragEnd={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
        onClick={() => onSelect(node.id)}
        onDragOver={(e) => {
           e.preventDefault();
           if (node.type !== 'sku') { // Prevent dropping ON a SKU
              setIsDragOver(true);
           }
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
           e.preventDefault();
           setIsDragOver(false);
           if (node.type === 'sku') return;
           
           const dataStr = e.dataTransfer.getData("application/json");
           if (dataStr) {
             try {
                const data = JSON.parse(dataStr);
                if (data.type === 'orphan' || data.type === 'existing_node') {
                  onMapNode(data.id, node.id, data.item);
                }
             } catch(err) {
                console.error("Drop Parse Error", err);
             }
           }
        }}
        className={`cursor-pointer rounded-xl border p-3 min-w-[240px] max-w-[380px] transition-all relative z-10
           ${isSelected ? `${colors.bg} ${colors.border} shadow-[0_20px_40px_rgba(255,255,255,0.05)] scale-[1.02]` : 'bg-[#070a13] border-white/10 hover:border-white/30'}
           ${isDragOver ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-black scale-105' : ''}
           ${node.id !== treeRoot?.node?.id ? 'cursor-grab active:cursor-grabbing' : ''}
        `}
      >
         {isDragOver && (
            <div className="absolute inset-0 bg-indigo-500/20 rounded-xl border border-indigo-500 animate-pulse flex items-center justify-center backdrop-blur-sm z-20">
               <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-black/50 px-2 py-1 rounded">Drop to Link</span>
            </div>
         )}
         
         <div className="flex flex-col gap-1.5">
            <span className={`text-[9px] font-bold uppercase tracking-widest ${colors.text}`}>
              {node.type}
            </span>
            <h4 className="text-[13px] font-bold text-white leading-snug">
              {node.label}
            </h4>
            <p className={`text-[11px] text-gray-400 ${isSelected ? '' : 'line-clamp-2'}`}>
              {node.sublabel}
            </p>
         </div>
      </div>

      {/* Spawns Connection Branches if children exist */}
      {children && children.length > 0 && (
        <div className="flex items-stretch relative min-w-[20px]">
          
          {/* Stem growing out of parent node */}
          <div className="w-8 lg:w-16 flex items-center">
             <div className="w-full h-[2px] bg-white/20 rounded-full" />
          </div>

          {/* Central spine splitting to all children */}
          <div className="flex flex-col justify-center border-l-2 border-white/20 py-3 relative drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">
            {children.map((child, i) => {
              
              let childLineColor = "bg-white/20";
              let badgeColor = "text-gray-400";
              if (child.edgeType === "requires") { childLineColor = "bg-red-500/40"; badgeColor = "text-red-400"; }
              if (child.edgeType === "exclusive") { childLineColor = "bg-amber-500/40"; badgeColor = "text-amber-400"; }

              return (
              <div key={i} className="flex items-center relative my-3">
                
                {/* Branch reaching child */}
                <div className={`w-16 lg:w-32 h-[2px] ${childLineColor} relative transition-colors shrink-0`}>
                   
                   {/* Intelligent Relationship Edge Label Badge */}
                   {child.edgeLabel && (
                      <span className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-[9px] px-2 py-1 font-bold rounded shadow border border-white/5 whitespace-nowrap bg-black z-20 transition-all cursor-crosshair hover:scale-110 tracking-widest ${badgeColor}`}>
                        {child.edgeLabel}
                      </span>
                   )}
                </div>

                <TreeNodeView nodeWrapper={child} selectedNodeId={selectedNodeId} onSelect={onSelect} onMapNode={onMapNode} />
              </div>
            )})}
          </div>
        </div>
      )}
    </div>
  );
}
