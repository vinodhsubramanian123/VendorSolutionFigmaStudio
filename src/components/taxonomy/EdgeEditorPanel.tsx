import React, { useState} from 'react';
import { Network, HelpCircle } from 'lucide-react';
import type { GraphNode, GraphEdge } from '../../types/data';
import { useToast } from '../shared/ToastContext';
interface EdgeEditorPanelProps {
  data: { nodes: GraphNode[], edges: GraphEdge[] };
  selectedEdgeId?: string | null;
  setSelectedEdgeId?: (id: string | null) => void;
  deleteGraphEdge?: (edgeId: string) => Promise<boolean>;
  addGraphEdge?: (edge: Partial<GraphEdge>) => Promise<boolean>;
  updateGraphEdge?: (edgeId: string, updates: Partial<GraphEdge>) => Promise<boolean>;
}
export function EdgeEditorPanel({
  data,
  selectedEdgeId,
  setSelectedEdgeId,
  deleteGraphEdge,
  addGraphEdge,
  updateGraphEdge
}: EdgeEditorPanelProps) {
  const { toast } = useToast();
  const [isUpdatingEdge, setIsUpdatingEdge] = useState(false);
  const [edgeWeight, setEdgeWeight] = useState<number>(1.0);
  
  const [isCreatingEdge, setIsCreatingEdge] = useState(false);
  const [newEdgeSource, setNewEdgeSource] = useState("");
  const [newEdgeTarget, setNewEdgeTarget] = useState("");
  const [newEdgeRelationship, setNewEdgeRelationship] = useState<"requires" | "substitutes" | "compatible" | "conflicts">("requires");
  const [newEdgeWeight, setNewEdgeWeight] = useState(1.0);
  // When selectedEdgeId changes, maybe update edgeWeight?
  // Not explicitly requested but it's good practice. For now keeping it simple as it was.
  const handleUpdateEdge = async () => {
    if (!selectedEdgeId || !updateGraphEdge) return;
    setIsUpdatingEdge(true);
    try {
      // Previously called apiClient.updateGraphEdge() -> PUT
      // /api/taxonomy/edges/:edgeId, a route removed in the Phase 4
      // client-side graph migration and never implemented in server.ts --
      // broken in every environment. Every sibling mutation here (add/delete
      // edge, add/update/delete node) already goes through the local overlay;
      // this now does too. See
      // docs/architecture/backend-route-inventory.md, Anomaly 2.
      const success = await updateGraphEdge(selectedEdgeId, { weight: edgeWeight });
      if (success) {
        toast(`Edge ${selectedEdgeId} weight updated to ${edgeWeight}.`, "success");
        if (setSelectedEdgeId) setSelectedEdgeId(null);
      } else {
        toast("Failed to update edge relationship weight.", "error");
      }
    } catch (err) {
      console.error(err);
      toast("API error updating edge weight.", "error");
    } finally {
      setIsUpdatingEdge(false);
    }
  };
  return (
    <div className="flex-1 flex flex-col justify-between gap-4">
      <div className="space-y-3.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 font-mono">
          <Network className="w-4 h-4 text-indigo-400" />
          Relationship Editor
        </div>
        <p className="text-[10px] text-gray-400 leading-normal">
          Modify graph edge heuristics like substitution weights or compatibility scores.
        </p>
        {selectedEdgeId ? (
          <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-lg space-y-3 animate-fadeIn text-xs">
            <div>
              <span className="text-[9px] font-mono text-gray-400 uppercase block">Selected Edge</span>
              <strong className="text-indigo-300 font-mono text-xs">{selectedEdgeId}</strong>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <label htmlFor="edge-weight" className="text-[9px] font-mono text-gray-400 uppercase font-bold tracking-wide block">
                Heuristic Weight / Preference Score
              </label>
              <input
                id="edge-weight"
                type="number"
                step="0.1"
                min="0"
                max="1.0"
                value={edgeWeight}
                onChange={e => setEdgeWeight(Number(e.target.value))}
                className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 text-white font-mono"
              />
              <p className="text-[8px] text-gray-500 font-mono mt-1">1.0 = Absolute Requirement | 0.5 = Moderate Substitute</p>
            </div>
            <button type="button"
              onClick={handleUpdateEdge}
              disabled={isUpdatingEdge || !updateGraphEdge}
              className="w-full flex items-center justify-center gap-2 py-2 mt-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold rounded-lg border border-indigo-400/20 transition cursor-pointer text-[10px] uppercase font-mono"
            >
              {isUpdatingEdge ? "Syncing..." : "Update Edge Weight"}
            </button>
            <button type="button" 
              onClick={async () => {
                if (deleteGraphEdge && selectedEdgeId) {
                  const success = await deleteGraphEdge(selectedEdgeId);
                  if (success) {
                    toast(`Edge ${selectedEdgeId} deleted.`, "success");
                    if (setSelectedEdgeId) setSelectedEdgeId(null);
                  } else {
                    toast("Failed to delete edge.", "error");
                  }
                }
              }}
              className="w-full text-center text-[9px] font-mono text-rose-500 hover:text-rose-400 border border-rose-500/20 bg-rose-500/10 rounded-lg py-2 cursor-pointer mt-2"
            >
              Delete Edge
            </button>
            <button type="button" 
              onClick={() => setSelectedEdgeId && setSelectedEdgeId(null)}
              className="w-full text-center text-[9px] font-mono text-gray-500 hover:text-gray-300 border-0 bg-transparent cursor-pointer mt-1"
            >
              Clear Selection
            </button>
          </div>
        ) : (
          <div className="p-4 border border-dashed border-white/10 rounded-lg text-center text-[10px] text-gray-500 flex flex-col items-center justify-center min-h-[140px] gap-2">
            <HelpCircle className="w-8 h-8 text-gray-600" />
            <p>Click on any relationship edge in the graph canvas to modify its properties.</p>
            <button type="button"
              onClick={() => setIsCreatingEdge(true)}
              className="mt-2 px-4 py-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded font-mono text-[9px] uppercase hover:bg-indigo-500/30 cursor-pointer"
            >
              + Add New Edge
            </button>
          </div>
        )}
        {isCreatingEdge && !selectedEdgeId && (
          <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-lg space-y-3 animate-fadeIn text-xs mt-2">
            <div className="text-[10px] font-bold font-mono text-indigo-300 uppercase">Create Edge</div>
            <div className="space-y-1.5">
              <label htmlFor="newEdgeSource" className="text-[9px] font-mono text-gray-400 uppercase font-bold tracking-wide">Source Node</label>
              <select
                id="newEdgeSource"
                value={newEdgeSource}
                onChange={e => setNewEdgeSource(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded p-1.5 text-[10px] text-white font-mono"
              >
                <option value="">-- Select Source --</option>
                {data.nodes.map((n) => <option key={`src-${n.id}`} value={n.id}>{n.label} ({n.id})</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="newEdgeTarget" className="text-[9px] font-mono text-gray-400 uppercase font-bold tracking-wide">Target Node</label>
              <select
                id="newEdgeTarget"
                value={newEdgeTarget}
                onChange={e => setNewEdgeTarget(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded p-1.5 text-[10px] text-white font-mono"
              >
                <option value="">-- Select Target --</option>
                {data.nodes.map((n) => <option key={`tgt-${n.id}`} value={n.id}>{n.label} ({n.id})</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="newEdgeRelationship" className="text-[9px] font-mono text-gray-400 uppercase font-bold tracking-wide">Relationship</label>
              <select
                id="newEdgeRelationship"
                value={newEdgeRelationship}
                onChange={e => setNewEdgeRelationship(e.target.value as "requires" | "substitutes" | "compatible" | "conflicts")}
                className="w-full bg-black/60 border border-white/10 rounded p-1.5 text-[10px] text-white font-mono"
              >
                <option value="requires">Requires</option>
                <option value="substitutes">Substitutes</option>
                <option value="compatible">Compatible</option>
                <option value="conflicts">Conflicts</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="newEdgeWeight" className="text-[9px] font-mono text-gray-400 uppercase font-bold tracking-wide">Weight</label>
              <input
                id="newEdgeWeight"
                type="number" step="0.1"
                value={newEdgeWeight}
                onChange={e => setNewEdgeWeight(Number(e.target.value))}
                className="w-full bg-black/60 border border-white/10 rounded p-1.5 text-[10px] text-white font-mono"
              />
            </div>
            <div className="flex gap-2">
              <button type="button"
                onClick={() => setIsCreatingEdge(false)}
                className="flex-1 py-1.5 bg-gray-800 text-gray-300 border border-white/10 rounded font-mono text-[9px] cursor-pointer"
              >
                Cancel
              </button>
              <button type="button"
                onClick={async () => {
                  if (newEdgeSource && newEdgeTarget && addGraphEdge) {
                    const success = await addGraphEdge({
                      source: newEdgeSource,
                      target: newEdgeTarget,
                      relationship: newEdgeRelationship,
                      weight: newEdgeWeight
                    });
                    if (success) {
                      toast("Edge created", "success");
                      setIsCreatingEdge(false);
                      setNewEdgeSource(""); setNewEdgeTarget("");
                    } else toast("Failed to create edge", "error");
                  }
                }}
                className="flex-1 py-1.5 bg-indigo-600 text-white border border-indigo-500 rounded font-mono text-[9px] cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}