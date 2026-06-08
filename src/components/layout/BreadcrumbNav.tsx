import React from "react";
import { ChevronRight, Home } from "lucide-react";
import type { AppView, UCID } from "../../types";

interface BreadcrumbNavProps {
  view: AppView;
  activeMissionId?: string;
  ucids: UCID[];
  onNavigate: (view: AppView) => void;
}

export function BreadcrumbNav({
  view,
  activeMissionId,
  ucids,
  onNavigate,
}: BreadcrumbNavProps) {
  const viewLabels: Record<AppView, string> = {
    dashboard: "Dashboard",
    "ingestion-hub": "BOQ & BOM Ingest Hub",
    "live-mission": "Live Mission Control",
    catalog: "Catalog SKU Manager",
    "vendor-portal": "Vendor Portal & APIs",
    forensic: "Forensic Scan & Heal",
    cleansing: "Taxonomy Cleansing",
    taxonomy: "Taxonomy Graph",
    "solution-builder": "Solution Configurator",
    reports: "Reports & Auditing",
    reconciliation: "BOM Reconciliation Diff",
    search: "Semantic NLP Search",
  };

  const activeMission =
    (view === "live-mission" || view === "taxonomy") && activeMissionId
      ? ucids.find((u) => u.id === activeMissionId)
      : null;

  return (
    <div className="flex items-center text-[10px] font-mono tracking-wider mb-4 px-1 rounded bg-surface-elevated/50 py-2 border border-white/5 shrink-0">
      <button
        onClick={() => onNavigate("dashboard")}
        className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer group"
      >
        <Home className="w-3 h-3 group-hover:text-indigo-400" />
        <span className="uppercase">Vendor Intel</span>
      </button>

      {view !== "dashboard" && (
        <>
          <ChevronRight className="w-3 h-3 mx-2 text-gray-600" />
          <button
            onClick={() => onNavigate(view)}
            className={`uppercase transition-colors ${activeMission ? "text-gray-400 hover:text-white cursor-pointer" : "text-indigo-400 cursor-default"}`}
            disabled={!activeMission}
          >
            {viewLabels[view]}
          </button>
        </>
      )}

      {activeMission && (
        <>
          <ChevronRight className="w-3 h-3 mx-2 text-gray-600" />
          <span className="uppercase text-status-warning font-bold">
            [{activeMission.displayId}]{" "}
            {activeMission.name.split("—")[0]?.trim() || activeMission.name}
          </span>
        </>
      )}
    </div>
  );
}
