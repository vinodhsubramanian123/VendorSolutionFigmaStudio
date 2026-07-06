import { useToast } from "../shared/ToastContext";
import type { UCID, Snapshot } from "../../types";
import { apiClient } from "../../services/apiClient";
export function useSnapshotManagerLogic(
  activeUCID: UCID | undefined,
  ucids: UCID[],
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>,
  setIsCreateOpen: (val: boolean) => void
) {
  const toast = useToast();
  const handleCreateSnapshot = (
    e: React.FormEvent,
    newLabel: string,
    newNotes: string,
    newWinner: string
  ) => {
    e.preventDefault();
    if (!activeUCID || !setUcids) return;
    if (!newLabel.trim()) {
      toast.error("Snapshot label is required.");
      return;
    }
    const createdSnapshot = buildSnapshot(activeUCID, newLabel, newWinner, newNotes);
    const previousUcids = [...ucids];
    setUcids((prev) =>
      prev.map((u) => {
        if (u.id === activeUCID.id) {
          return {
            ...u,
            currentStep: 'snapshot',
            completedSteps: Array.from(new Set([...(u.completedSteps || []), 'comparison'])),
            snapshots: [...(u.snapshots || []), createdSnapshot]
          };
        }
        return u;
      })
    );
    toast.success(`Snapshot v${createdSnapshot.version} locked & archived in CRM register (optimistic).`);
    setIsCreateOpen(false);
    // server.ts's real POST /api/ucids/:unit/snapshots destructures
    // `const { snapshot } = req.body` and 400s with "Missing snapshot object
    // in request body" if that key is absent. MSW's handler for this route
    // takes the body raw as the snapshot (see snapshotHandlers.ts), which is
    // the opposite convention -- so sending the bare object here only ever
    // worked against MSW and would 400 on every real request.
    // useMissionControlWorkflow.ts's snapshot POST already uses the correct
    // { snapshot: ... } wrapper; matching that convention here.
    apiClient.post(`/api/ucids/${activeUCID.id}/snapshots`, { snapshot: createdSnapshot })
      .then((data) => {
        if (process.env.NODE_ENV !== "production") { console.log("Sync complete"); }
      })
      .catch((error) => {
        console.error("[SYNC ERROR] Failed to sync snapshot. Rolling back UI:", error);
        toast.error(`Cloud synchronization failed. Rolling back local snapshot audit ledger.`);
        setUcids(previousUcids);
      });
  };
  const handleToggleLock = (snapId: string) => {
    if (!activeUCID || !setUcids) return;
    const targetSnap = activeUCID.snapshots?.find((s) => s.id === snapId);
    if (!targetSnap) return;
    const newLocked = !targetSnap.locked;
    if (newLocked) {
      toast.success(`Snapshot "${targetSnap.label}" is now fully LOCKED (read-only state).`);
    } else {
      toast.warn(`Snapshot "${targetSnap.label}" is now UNLOCKED (modifications permitted).`);
    }
    setUcids((prev) =>
      prev.map((u) => {
        if (u.id === activeUCID.id) {
          return {
            ...u,
            snapshots: (u.snapshots || []).map((s) => {
              if (s.id === snapId) {
                return {
                  ...s,
                  locked: newLocked
                };
              }
              return s;
            })
          };
        }
        return u;
      })
    );
  };
  const handleDeleteSnapshot = (snapId: string) => {
    if (!activeUCID || !setUcids) return;
    const targetSnap = activeUCID.snapshots?.find((s) => s.id === snapId);
    if (!targetSnap) return;
    if (targetSnap.locked) {
      toast.error(`Error: Snapshot "${targetSnap.label}" is currently LOCKED. Please unlock first to delete.`);
      return;
    }
    setUcids((prev) =>
      prev.map((u) => {
        if (u.id === activeUCID.id) {
          return {
            ...u,
            snapshots: (u.snapshots || []).filter((s) => s.id !== snapId)
          };
        }
        return u;
      })
    );
    apiClient.delete(`/api/ucids/${activeUCID.id}/snapshots/${snapId}`)
      .then(() => {
        toast.success("Snapshot successfully deleted.");
      })
      .catch((error) => {
        console.error("Failed to delete snapshot", error);
        toast.error("Failed to delete snapshot on server.");
      });
  };
  return {
    handleCreateSnapshot,
    handleToggleLock,
    handleDeleteSnapshot
  };
}

export function buildSnapshot(activeUCID: UCID, newLabel: string, newWinner: string, newNotes: string): Snapshot {
  const { currentTotalValue, bomConfigs, nextVersion } = getSnapshotBaseData(activeUCID, newWinner);
  const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);
  return {
    id: crypto.randomUUID(),
    label: newLabel.trim(),
    committedAt: new Date().toISOString(),
    winnerSolution: newWinner || "Consolidated Sourcing",
    totalValue: currentTotalValue,
    notes: newNotes.trim() || "Committed following active dual-sourcing reconciliations.",
    payload: JSON.parse(JSON.stringify(activeUCID.solutions || [])),
    version: nextVersion,
    timestamp: nowStr,
    locked: nextVersion === 1,
    bomSnapshot: JSON.parse(JSON.stringify(bomConfigs))
  };
}

function getSnapshotBaseData(activeUCID: UCID, newWinner: string) {
  const currentTotalValue = activeUCID.solutions?.[0]?.vendorSubmissions?.[0]?.totalPrice || 0;
  const chosenSubmission = activeUCID.solutions?.[0]?.vendorSubmissions?.find(
    (vs) => vs.label === newWinner || vs.vendor === newWinner
  ) || activeUCID.solutions?.[0]?.vendorSubmissions?.[0];
  const bomConfigs = chosenSubmission?.configs || [];
  const nextVersion = (activeUCID.snapshots?.length || 0) + 1;
  return { currentTotalValue, bomConfigs, nextVersion };
}