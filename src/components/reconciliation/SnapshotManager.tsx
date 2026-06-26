import React, { useState } from "react";
import { AnimatePresence } from "motion/react";
import {  Layers, Camera } from "lucide-react";
import { useToast } from "../shared/ToastContext";
import type { UCID, Snapshot } from "../../types";
import { useSnapshotManagerLogic } from "./useSnapshotManagerLogic";
import { CreateSnapshotForm } from "./CreateSnapshotForm";
import { SnapshotListItem } from "./SnapshotListItem";
interface SnapshotManagerProps {
  activeUCID: UCID | undefined;
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  selectedForCompare: string[];
  toggleCompareSelected: (snapId: string) => void;
  compareAgainstCurrent: boolean;
}
export function SnapshotManager({
  activeUCID,
  ucids,
  setUcids,
  selectedForCompare,
  toggleCompareSelected,
  compareAgainstCurrent,
}: SnapshotManagerProps) {
  const toast = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [expandedBoms, setExpandedBoms] = useState<Record<string, boolean>>({});
  // Creation form inputs
  const [newLabel, setNewLabel] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newWinner, setNewWinner] = useState("");
  const snapshotsList = activeUCID?.snapshots || [];
  const {
    handleCreateSnapshot,
    handleToggleLock,
    handleDeleteSnapshot
  } = useSnapshotManagerLogic(activeUCID, ucids, setUcids, setIsCreateOpen);
  // State is populated on button click instead of using useEffect
  const getBomConfigs = (snap: Snapshot) => {
    if (snap.bomSnapshot && Array.isArray(snap.bomSnapshot) && snap.bomSnapshot.length > 0) {
      return snap.bomSnapshot;
    }
    if (snap.payload && Array.isArray(snap.payload)) {
      return snap.payload[0]?.vendorSubmissions?.[0]?.configs || [];
    }
    return [];
  };
  const toggleBomExpanded = (snapId: string) => {
    setExpandedBoms((prev) => ({
      ...prev,
      [snapId]: !prev[snapId],
    }));
  };
  return (
    <div className="space-y-4">
      {/* Action Header bar */}
      <div className="flex justify-between items-center bg-black/10 border border-white/5 p-3 rounded-xl">
        <div className="flex flex-col text-left">
          <span className="text-[10.5px] font-mono text-gray-400 tracking-wider font-bold uppercase">
            Versioning Audit Log ({snapshotsList.length})
          </span>
          <span className="text-[9.5px] text-gray-500 font-mono">
            {activeUCID?.displayId || "No UCID"} • Baseline Ledger
          </span>
        </div>
        <button
          type="button"
          data-testid="btn-capture-snapshot"
          onClick={() => {
            if (!activeUCID?.solutions?.length || activeUCID.solutions.length === 0) {
              toast.error("Please ensure the configuration is ingested before saving a snapshot.");
              return;
            }
            if (!isCreateOpen) {
              setNewLabel(`Snapshot v${(activeUCID.snapshots?.length || 0) + 1}.0 — Compliance Baseline`);
              setNewWinner(activeUCID.solutions?.[0]?.vendorSubmissions?.[0]?.label || "Consolidated Sourcing");
              setNewNotes("");
            }
            setIsCreateOpen(!isCreateOpen);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded font-bold shadow-md cursor-pointer transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 uppercase tracking-wider text-[10px]"
        >
          <Camera className="w-4 h-4" />
          <span>Capture Snapshot</span>
        </button>
      </div>
      {/* Embedded New Snapshot Creation Drawer/Form */}
      <AnimatePresence>
        {isCreateOpen && (
          <CreateSnapshotForm
            activeUCID={activeUCID}
            setIsCreateOpen={setIsCreateOpen}
            newLabel={newLabel}
            setNewLabel={setNewLabel}
            newWinner={newWinner}
            setNewWinner={setNewWinner}
            newNotes={newNotes}
            setNewNotes={setNewNotes}
            onSubmit={(e) => handleCreateSnapshot(e, newLabel, newNotes, newWinner)}
          />
        )}
      </AnimatePresence>
      {/* SNAPSHOT LIST VIEW */}
      <div className="space-y-2.5">
        {snapshotsList.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-xl bg-black/10 text-center p-6 select-none">
            <Layers className="w-8 h-8 text-gray-500/30 mb-2 animate-pulse" />
            <span className="text-gray-400 font-bold text-xs">No Snapshots Captured</span>
            <p className="text-[10px] text-gray-500 mt-1 leading-normal max-w-[240px]">
              Lock post-reconciliation quote structures or tap "Capture Snapshot" above to register baseline files in CRM.
            </p>
          </div>
        ) : (
          snapshotsList.map((snap) => {
            const isPicked = selectedForCompare.includes(snap.id);
            const configs = getBomConfigs(snap);
            const isExpanded = !!expandedBoms[snap.id];
            return (
              <SnapshotListItem
                key={snap.id}
                snap={snap}
                isPicked={isPicked}
                isExpanded={isExpanded}
                toggleCompareSelected={toggleCompareSelected}
                handleToggleLock={handleToggleLock}
                handleDeleteSnapshot={handleDeleteSnapshot}
                toggleBomExpanded={toggleBomExpanded}
                configs={configs}
              />
            );
          })
        )}
      </div>
    </div>
  );
}