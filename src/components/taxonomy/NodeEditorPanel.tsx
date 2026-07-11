import React, { useState } from 'react';
import { Layers, HelpCircle } from 'lucide-react';
import type { GraphNode } from '../../types/data';
import { useToast } from '../shared/ToastContext';

interface NodeEditorPanelProps {
  data: { nodes: GraphNode[] };
  selectedNodeId?: string | null;
  setSelectedNodeId?: (id: string | null) => void;
  updateGraphNode?: (nodeId: string, updates: Partial<GraphNode>) => Promise<boolean>;
  deleteGraphNode?: (nodeId: string) => Promise<boolean>;
  addGraphNode?: (node: Partial<GraphNode>) => Promise<boolean>;
}

export function NodeEditorPanel({
  data,
  selectedNodeId,
  setSelectedNodeId,
  updateGraphNode,
  deleteGraphNode,
  addGraphNode,
}: NodeEditorPanelProps) {
  const { toast } = useToast();
  const [isEditingNode, setIsEditingNode] = useState(false);
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [newNodeType, setNewNodeType] = useState<"catalog_part" | "product">("catalog_part");
  const [newNodePart, setNewNodePart] = useState("");
  const [newNodePrice, setNewNodePrice] = useState(0);

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 scrollbar-thin">
      <div className="space-y-3.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-brand-indigo flex items-center gap-1.5 font-mono">
          <Layers className="w-4 h-4 text-brand-indigo" />
          Node Editor
        </div>
        <p className="text-[10px] text-content-secondary leading-normal">
          Manage taxonomy nodes. Differentiate complex products (bundles) from catalog parts.
        </p>

        {selectedNodeId ? (() => {
          const selectedNode = data.nodes.find((n) => n.id === selectedNodeId);
          if (!selectedNode) return null;
          return (
            <div className="p-3 bg-indigo-950/20 border border-brand-indigo/20 rounded-lg space-y-3 animate-fadeIn text-xs">
              <div>
                <span className="text-[9px] font-mono text-content-secondary uppercase block">Selected Node</span>
                <strong className="text-indigo-300 font-mono text-xs">{selectedNode.label}</strong>
                <span className="text-[8px] text-content-muted block">ID: {selectedNode.id}</span>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <label htmlFor="nodeType" className="text-[9px] font-mono text-content-secondary uppercase font-bold tracking-wide block">
                  Node Category / Type
                </label>
                <select
                  id="nodeType"
                  value={selectedNode.type}
                  onChange={async e => {
                    if (updateGraphNode) {
                      const success = await updateGraphNode(selectedNode.id, { type: e.target.value as "catalog_part" | "product" | "category_hub" | "scraped_orphan" });
                      if (success) toast("Node type updated", "success");
                    }
                  }}
                  className="w-full bg-surface-canvas/60 border border-white/10 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 text-content-primary font-mono"
                >
                  <option value="catalog_part">Catalog Part (Atomic)</option>
                  <option value="product">Complex Product (Synergy/Bundle)</option>
                  <option value="category_hub">Category Hub</option>
                  <option value="scraped_orphan">Orphan</option>
                </select>
              </div>

              <button type="button"
                onClick={async () => {
                  if (deleteGraphNode && selectedNodeId) {
                    const success = await deleteGraphNode(selectedNodeId);
                    if (success) {
                      toast(`Node ${selectedNodeId} deleted`, "success");
                      if (setSelectedNodeId) setSelectedNodeId(null);
                    } else toast("Failed to delete node", "error");
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-2 mt-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold rounded-lg border border-rose-500/20 transition cursor-pointer text-[10px] uppercase font-mono"
              >
                Delete Node
              </button>

              <button type="button" 
                onClick={() => setSelectedNodeId && setSelectedNodeId(null)}
                className="w-full text-center text-[9px] font-mono text-content-muted hover:text-content-secondary border-0 bg-transparent cursor-pointer mt-1"
              >
                Clear Selection
              </button>
            </div>
          );
        })() : (
          <div className="p-4 border border-dashed border-white/10 rounded-lg text-center text-[10px] text-content-muted flex flex-col items-center justify-center min-h-[140px] gap-2">
            <HelpCircle className="w-8 h-8 text-content-muted" />
            <p>Click on any node in the graph canvas to modify its properties.</p>
            <button type="button"
              onClick={() => setIsEditingNode(true)}
              className="mt-2 px-4 py-1.5 bg-brand-indigo/20 text-indigo-300 border border-brand-indigo/30 rounded font-mono text-[9px] uppercase hover:bg-brand-indigo/30 cursor-pointer"
            >
              + Create New Node
            </button>
          </div>
        )}

        {isEditingNode && !selectedNodeId && (
          <div className="p-3 bg-indigo-950/20 border border-brand-indigo/20 rounded-lg space-y-3 animate-fadeIn text-xs mt-2">
            <div className="text-[10px] font-bold font-mono text-indigo-300 uppercase">New Node Definition</div>
            <div className="space-y-1.5">
              <label htmlFor="newNodeLabel" className="text-[9px] font-mono text-content-secondary uppercase font-bold tracking-wide">Label</label>
              <input
                id="newNodeLabel"
                type="text" value={newNodeLabel} onChange={e => setNewNodeLabel(e.target.value)}
                className="w-full bg-surface-canvas/60 border border-white/10 rounded p-1.5 text-[10px] text-content-primary font-mono"
                placeholder="e.g. HPE Synergy Frame"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="newNodeType" className="text-[9px] font-mono text-content-secondary uppercase font-bold tracking-wide">Type</label>
              <select
                id="newNodeType"
                value={newNodeType} onChange={e => setNewNodeType(e.target.value as "catalog_part" | "product")}
                className="w-full bg-surface-canvas/60 border border-white/10 rounded p-1.5 text-[10px] text-content-primary font-mono"
              >
                <option value="catalog_part">Catalog Part (Atomic)</option>
                <option value="product">Complex Product (Synergy/Bundle)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="newNodePart" className="text-[9px] font-mono text-content-secondary uppercase font-bold tracking-wide">Part Number</label>
              <input
                id="newNodePart"
                type="text" value={newNodePart} onChange={e => setNewNodePart(e.target.value)}
                className="w-full bg-surface-canvas/60 border border-white/10 rounded p-1.5 text-[10px] text-content-primary font-mono"
                placeholder="e.g. P12345-B21"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="newNodePrice" className="text-[9px] font-mono text-content-secondary uppercase font-bold tracking-wide">Price USD</label>
              <input
                id="newNodePrice"
                type="number" value={newNodePrice} onChange={e => setNewNodePrice(Number(e.target.value))}
                className="w-full bg-surface-canvas/60 border border-white/10 rounded p-1.5 text-[10px] text-content-primary font-mono"
              />
            </div>
            <div className="flex gap-2">
              <button type="button"
                onClick={() => setIsEditingNode(false)}
                className="flex-1 py-1.5 bg-surface-elevated text-content-secondary border border-white/10 rounded font-mono text-[9px] cursor-pointer"
              >
                Cancel
              </button>
              <button type="button"
                onClick={async () => {
                  if (newNodeLabel && addGraphNode) {
                    const success = await addGraphNode({
                      label: newNodeLabel,
                      type: newNodeType,
                      data: { partNumber: newNodePart, price: newNodePrice }
                    });
                    if (success) {
                      toast("Node created", "success");
                      setIsEditingNode(false);
                      setNewNodeLabel(""); setNewNodePart(""); setNewNodePrice(0);
                    } else toast("Failed to create node", "error");
                  }
                }}
                className="flex-1 py-1.5 bg-brand-indigo text-content-primary border border-brand-indigo rounded font-mono text-[9px] cursor-pointer"
              >
                Save Node
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
