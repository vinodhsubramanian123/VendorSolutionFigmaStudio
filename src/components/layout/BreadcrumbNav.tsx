import React from "react";
import { ChevronRight, Home } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import type { UCID } from "../../types";
import { useCoreStore } from "../../store/coreStore";

interface BreadcrumbNavProps {
  view: string;
  activeMissionId?: string;
}

function useActiveContext(path: string, activeMissionId: string | undefined, ucids: UCID[]) {
  const solutions = useCoreStore(s => s.solutions);
  const activeSolutionId = useCoreStore(s => s.activeSolutionId);

  const activeMission = React.useMemo(() =>
    path.startsWith("/mission-control") && activeMissionId
      ? ucids.find((u) => u.id === activeMissionId)
      : null,
  [path, activeMissionId, ucids]);

  const activeSolution = React.useMemo(() => {
    if (activeSolutionId) return solutions.find(s => s.id === activeSolutionId);
    if (activeMission) return solutions.find(s => s.id === activeMission.solutionId);
    return null;
  }, [activeSolutionId, activeMission, solutions]);
  return { activeMission, activeSolution };
}

export function BreadcrumbNav({
  view,
  activeMissionId,
}: BreadcrumbNavProps) {
  const ucids = useCoreStore(s => s.ucids);
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const viewLabels: Record<string, string> = {
    dashboard: "Dashboard",
    "ingestion-hub": "BOQ & BOM Ingest Hub",
    "mission-control": "Live Mission Control",
    catalog: "Catalog SKU Manager",
    "vendor-portal": "Vendor Portal & APIs",
    forensic: "Forensic Scan & Heal",
    solutions: "Solution Portfolio",
    "solution-builder": "Solution Configurator",
    reconciliation: "BOM Reconciliation Diff",
    search: "Semantic NLP Search",
    "taxonomy-graph": "Taxonomy Graph Editor",
    cleansing: "Interactive Cleansing Workshop",
    telemetry: "System Telemetry & Logs",
  };

  const { activeMission, activeSolution } = useActiveContext(path, activeMissionId, ucids);

  return (
    <div className="flex items-center text-[10px] font-mono tracking-wider mb-4 px-1 rounded bg-surface-elevated/50 py-2 border border-white/5 shrink-0">
      <button type="button"
        onClick={() => navigate("/")}
        className="flex items-center gap-1.5 text-content-secondary hover:text-content-primary transition-colors cursor-pointer group"
      >
        <Home className="w-3 h-3 group-hover:text-brand-indigo" />
        <span className="uppercase">Vendor Intel</span>
      </button>

      {view !== "dashboard" && (
        <>
          <ChevronRight className="w-3 h-3 mx-2 text-content-muted" />
          <button type="button"
            onClick={() => navigate(`/${view}`)}
            className={`uppercase transition-colors ${activeMission ? "text-content-secondary hover:text-content-primary cursor-pointer" : "text-brand-indigo cursor-default"}`}
            disabled={!activeMission}
          >
            {viewLabels[view] || view}
          </button>
        </>
      )}

      {activeSolution && (
        <>
          <ChevronRight className="w-3 h-3 mx-2 text-content-muted" />
          <span className="uppercase text-status-warning font-bold">
            [{activeSolution.displayId}] {activeSolution.name}
          </span>
          {activeMission && (
            <>
              <ChevronRight className="w-3 h-3 mx-2 text-content-muted" />
              <span className="uppercase text-brand-indigo font-bold">
                {activeMission.configLabel || activeMission.displayId}
              </span>
            </>
          )}
        </>
      )}
      {!activeSolution && activeMission && (
        <>
          <ChevronRight className="w-3 h-3 mx-2 text-content-muted" />
          <span className="uppercase text-status-warning font-bold">
            [{activeMission.solutionDisplayId || activeMission.displayId}]{" "}
            {activeMission.name.split("—")[0]?.trim() || activeMission.name}
          </span>
        </>
      )}
    </div>
  );
}
