import React, { useEffect } from "react";
import { Edit2, X, AlertTriangle } from "lucide-react";
import type { UCID } from "../../types";
import { motion } from "motion/react";

interface UCIDEditModalProps {
  editingUcid: UCID;
  setEditingUcid: (u: UCID | null) => void;
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
}

export function UCIDEditModal({ editingUcid, setEditingUcid, setUcids }: UCIDEditModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditingUcid(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [setEditingUcid]);

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-[60] select-none leading-normal">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setEditingUcid(null)}
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-md rounded-xl border p-5 space-y-4 bg-surface-header border-indigo-500/20 shadow-2xl shadow-black/50 relative z-10 text-xs text-left"
      >
        <div className="flex items-center justify-between pb-2 border-b border-indigo-500/10">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Edit2 className="w-4 h-4 text-indigo-400" /> Edit Parallel Flow ({editingUcid.displayId})
          </h3>
          <button
            type="button"
            aria-label="Close edit modal"
            onClick={() => setEditingUcid(null)}
            className="text-gray-500 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!editingUcid.name.trim()) return;
            setUcids((prev) => prev.map((u) => (u.id === editingUcid.id ? editingUcid : u)));
            setEditingUcid(null);
          }}
          className="space-y-4"
        >
          <div className="space-y-1">
            <label className="text-gray-400 font-semibold uppercase">Workspace Title</label>
            <input
              type="text"
              value={editingUcid.name}
              onChange={(e) => setEditingUcid({ ...editingUcid, name: e.target.value })}
              className="w-full p-2.5 rounded bg-black/30 border border-white/10 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-gray-400 font-semibold uppercase">Project Code Ref</label>
              <input
                type="text"
                value={editingUcid.projectRef}
                onChange={(e) => setEditingUcid({ ...editingUcid, projectRef: e.target.value })}
                className="w-full p-2.5 rounded bg-black/30 border border-white/10 text-white"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-gray-400 font-semibold uppercase">Priority</label>
              <select
                value={editingUcid.priority}
                onChange={(e) =>
                  setEditingUcid({
                    ...editingUcid,
                    priority: e.target.value as "critical" | "high" | "medium" | "low",
                  })
                }
                className="w-full p-2.5 rounded bg-black/30 border border-white/10 text-white"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t flex justify-end gap-2 border-indigo-500/10">
            <button
              type="button"
              onClick={() => setEditingUcid(null)}
              className="px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white font-bold transition-all cursor-pointer font-sans"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 font-bold text-white transition-all cursor-pointer font-sans"
            >
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

interface UCIDDeleteConfirmModalProps {
  confirmDeleteUcid: UCID;
  setConfirmDeleteUcid: (u: UCID | null) => void;
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  selectedId?: string;
  onSelectId: (id: string | undefined) => void;
}

export function UCIDDeleteConfirmModal({
  confirmDeleteUcid,
  setConfirmDeleteUcid,
  setUcids,
  selectedId,
  onSelectId,
}: UCIDDeleteConfirmModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmDeleteUcid(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [setConfirmDeleteUcid]);

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-[60] select-none leading-normal">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setConfirmDeleteUcid(null)}
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-md rounded-xl border p-5 space-y-4 bg-surface-header border-red-500/20 shadow-2xl shadow-black/50 relative z-10 text-xs text-left"
      >
        <div className="flex items-center gap-2 pb-2 border-b border-red-500/10 text-red-400">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Confirm Deletion</h3>
        </div>

        <div className="space-y-3 text-gray-300">
          <p>
            Are you sure you want to permanently delete the pipeline{" "}
            <strong className="text-white">
              {confirmDeleteUcid.displayId} ({confirmDeleteUcid.name})
            </strong>
            ?
          </p>

          {confirmDeleteUcid.snapshots && confirmDeleteUcid.snapshots.length > 0 && (
            <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 space-y-1">
              <span className="font-bold block uppercase tracking-wider text-[10px]">
                ⚠️ Warning: Locked Snapshots Detected
              </span>
              <p className="leading-relaxed text-[11px]">
                This pipeline has {confirmDeleteUcid.snapshots.length} locked snapshots. Deleting it will permanently destroy all historical audit trails.
              </p>
            </div>
          )}

          <p className="text-gray-500 text-[10px]">
            This action cannot be undone. All related log events and design proposals will be lost.
          </p>
        </div>

        <div className="pt-2 border-t flex justify-end gap-2 border-red-500/10">
          <button
            type="button"
            onClick={() => setConfirmDeleteUcid(null)}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white font-bold transition-all cursor-pointer font-sans"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setUcids((prev) => prev.filter((u) => u.id !== confirmDeleteUcid.id));
              if (selectedId === confirmDeleteUcid.id) {
                onSelectId(undefined);
              }
              setConfirmDeleteUcid(null);
            }}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 font-bold text-white transition-all cursor-pointer font-sans"
          >
            Permanently Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}
