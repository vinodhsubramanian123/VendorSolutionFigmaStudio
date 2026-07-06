import React, { useState, useMemo, useEffect } from "react";
import type { UCID, UCIDStep } from "../../types";
import { useCoreStore } from "../../store/coreStore";
import { UCIDEditModal, UCIDDeleteConfirmModal } from "./UCIDModals";
import { HierarchyHubPanel } from "./HierarchyHubPanel";
import { SidebarHeader } from "./SidebarHeader";
import { GroupedUcidList } from "./GroupedUcidList";
import { generateDisplayId } from "../../utils/generateDisplayId";

interface MissionControlSidebarProps {
  selectedId?: string;
  hierarchyTab: "visual" | "faq";
  setHierarchyTab: (tab: "visual" | "faq") => void;
  setShowNewUCID: (show: boolean) => void;
  groupedUcids: Record<string, UCID[]>;
  setWorkspaceMode: (mode: "individual" | "consolidation") => void;
  onSelectId: (id: string | undefined) => void;
  setViewStep: (step: UCIDStep | null) => void;
  getSolutionName: (u: UCID) => string;
}

export function MissionControlSidebar({
  selectedId,
  hierarchyTab,
  setHierarchyTab,
  setShowNewUCID,
  groupedUcids,
  setWorkspaceMode,
  onSelectId,
  setViewStep,
  getSolutionName,
}: MissionControlSidebarProps) {
  const setUcids = useCoreStore((s) => s.setUcids);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenuUcidId, setActiveMenuUcidId] = useState<string | null>(null);
  const [editingUcid, setEditingUcid] = useState<UCID | null>(null);
  const [confirmDeleteUcid, setConfirmDeleteUcid] = useState<UCID | null>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleOutsideClick() {
      setActiveMenuUcidId(null);
    }
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Filter grouped UCIDs based on search term
  const filteredGroupedUcids = useMemo(() => {
    if (!searchTerm.trim()) return groupedUcids;
    const term = searchTerm.toLowerCase().trim();
    const result: Record<string, UCID[]> = {};

    for (const [group, items] of Object.entries(groupedUcids)) {
      const matched = items.filter(
        (u) =>
          u.displayId.toLowerCase().includes(term) ||
          u.name.toLowerCase().includes(term) ||
          u.projectRef.toLowerCase().includes(term)
      );
      if (matched.length > 0) {
        result[group] = matched;
      }
    }
    return result;
  }, [groupedUcids, searchTerm]);

  // Total parallel pipelines count after filtering
  const filteredCount = useMemo(() => {
    return Object.values(filteredGroupedUcids).reduce((sum, items) => sum + items.length, 0);
  }, [filteredGroupedUcids]);

  function handleDuplicate(u: UCID) {
    const duplicated: UCID = {
      ...u,
      id: crypto.randomUUID(),
      displayId: generateDisplayId(),
      name: `${u.name} (Copy)`,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      currentStep: "boq-intake",
      completedSteps: [],
      snapshots: [],

      events: [
        {
          timestamp: new Date().toISOString(),
          level: "info",
          msg: `Cloned from parallel flow ${u.displayId}.`,
        },
      ],
    };
    setUcids((prev) => [...prev, duplicated]);
  }

  return (
    <div className="xl:col-span-1 flex flex-col gap-3">
      <HierarchyHubPanel 
        hierarchyTab={hierarchyTab} 
        setHierarchyTab={setHierarchyTab} 
      />

      <SidebarHeader 
        filteredCount={filteredCount}
        setShowNewUCID={setShowNewUCID}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <GroupedUcidList 
        filteredGroupedUcids={filteredGroupedUcids}
        selectedId={selectedId}
        onSelectId={onSelectId}
        setViewStep={setViewStep}
        setWorkspaceMode={setWorkspaceMode}
        activeMenuUcidId={activeMenuUcidId}
        setActiveMenuUcidId={setActiveMenuUcidId}
        setEditingUcid={setEditingUcid}
        setConfirmDeleteUcid={setConfirmDeleteUcid}
        handleDuplicate={handleDuplicate}
      />

      {editingUcid && (
        <UCIDEditModal
          editingUcid={editingUcid}
          setEditingUcid={setEditingUcid}
          setUcids={setUcids}
        />
      )}

      {confirmDeleteUcid && (
        <UCIDDeleteConfirmModal
          confirmDeleteUcid={confirmDeleteUcid}
          setConfirmDeleteUcid={setConfirmDeleteUcid}
          setUcids={setUcids}
          selectedId={selectedId}
          onSelectId={onSelectId}
        />
      )}
    </div>
  );
}
