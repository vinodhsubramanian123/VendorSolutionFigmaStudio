import { useState } from "react";
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

    const currentTotalValue = activeUCID.solutions?.[0]?.vendorSubmissions?.[0]?.totalPrice || 0;

    const chosenSubmission = activeUCID.solutions?.[0]?.vendorSubmissions?.find(
      (vs) => vs.label === newWinner || vs.vendor === newWinner
    ) || activeUCID.solutions?.[0]?.vendorSubmissions?.[0];

    const bomConfigs = chosenSubmission?.configs || [];
    const nextVersion = (activeUCID.snapshots?.length || 0) + 1;
    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);

    const createdSnapshot: Snapshot = {
      id: crypto.randomUUID(),
      label: newLabel.trim(),
      committedAt: new Date().toISOString().split("T")[0],
      winnerSolution: newWinner || "Consolidated Sourcing",
      totalValue: currentTotalValue,
      notes: newNotes.trim() || "Committed following active dual-sourcing reconciliations.",
      payload: JSON.parse(JSON.stringify(activeUCID.solutions || [])),
      version: nextVersion,
      timestamp: nowStr,
      locked: true,
      bomSnapshot: JSON.parse(JSON.stringify(bomConfigs))
    };

    const previousUcids = [...ucids];

    setUcids((prev) =>
      prev.map((u) => {
        if (u.id === activeUCID.id) {
          return {
            ...u,
            snapshots: [...(u.snapshots || []), createdSnapshot]
          };
        }
        return u;
      })
    );

    toast.success(`Snapshot v${nextVersion} locked & archived in CRM register (optimistic).`);
    setIsCreateOpen(false);

    apiClient.post("/api/snapshots", createdSnapshot)
      .then((data) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log("[SYNC] Snapshot synchronized successfully with server backend:", data);
        }
      })
      .catch((error) => {
        console.error("[SYNC ERROR] Failed to sync snapshot. Rolling back UI:", error);
        toast.error(`Cloud synchronization failed. Rolling back local snapshot audit ledger.`);
        setUcids(previousUcids);
      });
  };

  const handleToggleLock = (snapId: string) => {
    if (!activeUCID || !setUcids) return;

    setUcids((prev) =>
      prev.map((u) => {
        if (u.id === activeUCID.id) {
          return {
            ...u,
            snapshots: (u.snapshots || []).map((s) => {
              if (s.id === snapId) {
                const updatedLock = !s.locked;
                if (updatedLock) {
                  toast.success(`Snapshot "${s.label}" is now fully LOCKED (read-only state).`);
                } else {
                  toast.warn(`Snapshot "${s.label}" is now UNLOCKED (modifications permitted).`);
                }
                return {
                  ...s,
                  locked: updatedLock
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

    apiClient.delete(`/api/snapshots/${snapId}`)
      .then(() => {
        toast.success("Snapshot successfully deleted.");
      })
      .catch(() => {
        toast.error("Failed to delete snapshot on server.");
      });
  };

  return {
    handleCreateSnapshot,
    handleToggleLock,
    handleDeleteSnapshot
  };
}
