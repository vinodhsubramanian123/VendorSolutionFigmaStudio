import { useState, useEffect, useRef, useMemo } from "react";
import {
  Globe,
  Database,
  Activity,
  Target,
  AlertTriangle,
  ChevronRight,
  Zap,
  RefreshCw,
} from "lucide-react";
import { UCID_STEPS } from "../../lib/mockData";
import { useChartDimensions } from "../../hooks/useChartDimensions";
import type { AppView, UCID, Vendor, ForensicIssue } from "../../types";

import { KpiCard } from "./KpiCard";
import { VendorHealthList } from "./VendorHealthList";
import { ActiveIssuesList } from "./ActiveIssuesList";
import { CatalogTrendAnalyzer } from "./CatalogTrendAnalyzer";
import { VendorStatusBoard } from "./VendorStatusBoard";

interface DashboardProps {
  onNavigate: (v: AppView) => void;
  ucids: UCID[];
  vendors: Vendor[];
  forensicIssues: ForensicIssue[];
}

export function Dashboard({
  onNavigate,
  ucids,
  vendors,
  forensicIssues,
}: DashboardProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const areaChart = useChartDimensions();
  const pieChart = useChartDimensions();

  const activeUCIDs = useMemo(() => ucids.filter((u) => u.currentStep !== "snapshot"), [ucids]);
  const criticalIssues = useMemo(() => forensicIssues.filter(
    (f) => f.severity === "critical" && f.status !== "resolved",
  ).length, [forensicIssues]);
  const connectedVendors = useMemo(() => vendors.filter(
    (v) => v.status === "connected" || v.status === "syncing",
  ).length, [vendors]);
  const totalCatalog = useMemo(() => vendors.reduce((s, v) => s + v.catalogItems, 0), [vendors]);

  const VENDOR_PIE = useMemo(() => vendors.map((v) => ({
    name: v.shortName,
    value: v.catalogItems,
    color: v.color,
  })), [vendors]);

    const averagePipeline = activeUCIDs.length > 0 
      ? Math.round(activeUCIDs.reduce((acc, u) => {
          const stepIdx = UCID_STEPS.findIndex((s) => s.id === u.currentStep);
          return acc + (stepIdx / (UCID_STEPS.length - 1)) * 100;
      }, 0) / activeUCIDs.length)
      : 0;
      
    const recentMission = activeUCIDs.length > 0 ? activeUCIDs[0].displayId : "No active missions";

  const KPI_CARDS = [
    {
      id: "vendor-portal",
      label: "Connected Vendors",
      value: `${connectedVendors}`,
      sub: `of ${vendors.length} total`,
      icon: Globe,
      color: "#4a85fd",
      delta: "",
      up: true,
    },
    {
      id: "catalog",
      label: "Catalog SKUs",
      value: totalCatalog.toLocaleString(),
      sub: `across ${vendors.length} vendors`,
      icon: Database,
      color: "#00d4a0",
      delta: "",
      up: true,
    },
    {
      id: "live-mission",
      label: "Active UCIDs",
      value: `${activeUCIDs.length}`,
      sub: `${ucids.length} total missions`,
      icon: Target,
      color: "#ff9b36",
      delta: "",
      up: true,
    },
    {
      id: "forensic",
      label: "Open Issues",
      value: `${forensicIssues.filter((f) => f.status !== "resolved").length}`,
      sub: `${criticalIssues} critical`,
      icon: Activity,
      color: "#ff3d5a",
      delta: "",
      up: false,
    },
    {
      id: "live-mission",
      label: "Active Pipeline",
      value: `${averagePipeline}%`,
      sub: `${recentMission} processing`,
      icon: Zap,
      color: "#a855f7",
      delta: "Live",
      up: true,
    },
    {
      id: "catalog",
      label: "Last Sync Status",
      value: "Syncing",
      sub: "Vendor APIs online",
      icon: RefreshCw,
      color: "#00d4a0",
      delta: "Healthy",
      up: true,
    },
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Welcome banner */}
      <div
        className="rounded-xl p-4 flex items-center justify-between"
        style={{
          background:
            "linear-gradient(135deg, rgba(74, 133, 253,0.12) 0%, rgba(0,212,160,0.06) 100%)",
          border: "1px solid rgba(74, 133, 253,0.18)",
        }}
      >
        <div>
          <p
            className="text-base"
            style={{ color: "#dde6ff", fontWeight: 500 }}
          >
            Procurement Intelligence Hub
          </p>
          <p className="text-sm mt-0.5" style={{ color: "#5d7899" }}>
            {activeUCIDs.length} active UCIDs in pipeline · {connectedVendors}{" "}
            vendors live · {criticalIssues} critical issues awaiting review
          </p>
        </div>
        <div className="flex items-center gap-2">
          {criticalIssues > 0 && (
            <button
              onClick={() => onNavigate("forensic")}
              className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg hover:opacity-90 transition-all cursor-pointer border border-status-error/30"
              style={{ background: "#ff3d5a", color: "#fff" }}
            >
              <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
              Resolve {criticalIssues} Critical
            </button>
          )}
          <button
            onClick={() => onNavigate("live-mission")}
            className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg hover:opacity-90 transition-all cursor-pointer"
            style={{ background: "#4a85fd", color: "#fff" }}
          >
            <Target className="w-3.5 h-3.5" />
            Live Mission Control
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {KPI_CARDS.map((kpi, i) => (
          <KpiCard
            key={kpi.label + i}
            id={kpi.id}
            label={kpi.label}
            value={kpi.value}
            sub={kpi.sub}
            icon={kpi.icon}
            color={kpi.color}
            delta={kpi.delta}
            up={kpi.up}
            hovered={hovered === `kpi-${i}`}
            onMouseEnter={() => setHovered(`kpi-${i}`)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onNavigate(kpi.id as AppView)}
          />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Catalog Growth */}
        <CatalogTrendAnalyzer
          dimensions={areaChart.dimensions}
          chartRef={areaChart.ref}
        />

        {/* Vendor SKU Distribution */}
        <VendorStatusBoard
          totalCatalog={totalCatalog}
          vendorPieData={VENDOR_PIE}
          dimensions={pieChart.dimensions}
          chartRef={pieChart.ref}
        />
      </div>

      {/* UCID Pipeline + Vendor Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Active UCID Pipeline */}
        <div
          className="lg:col-span-2 rounded-xl overflow-hidden"
          style={{
            background: "var(--color-surface-elevated)",
            border: "1px solid rgba(74, 133, 253,0.1)",
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: "rgba(74, 133, 253,0.08)" }}
          >
            <p className="text-sm font-semibold" style={{ color: "#dde6ff" }}>
              UCID Mission Pipeline
            </p>
            <button
              onClick={() => onNavigate("live-mission")}
              className="flex items-center gap-1 text-xs text-brand-indigo hover:underline cursor-pointer"
            >
              Open Live Mission <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div
            className="divide-y"
            style={{ borderColor: "rgba(74, 133, 253,0.06)" }}
          >
            {ucids.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Target className="w-8 h-8 text-indigo-500/40 m-auto mb-2" />
                <p className="font-bold text-gray-400">
                  No Active Mission Workflows
                </p>
                <p className="text-[10px] text-gray-600 mt-1 max-w-xs m-auto">
                  Upload a Bill of Quantities workbook inside Ingestion Hub or
                  use Solution Builder to spin up dual-sourcing cards.
                </p>
              </div>
            ) : (
              ucids.map((u) => {
                const stepIdx = UCID_STEPS.findIndex(
                  (s) => s.id === u.currentStep,
                );
                const pct = Math.round(
                  (stepIdx / (UCID_STEPS.length - 1)) * 100,
                );
                const PRIORITY_COLOR: Record<string, string> = {
                  critical: "#ff3d5a",
                  high: "#ff9b36",
                  medium: "#4a85fd",
                  low: "#5d7899",
                };
                return (
                  <button
                    key={u.id}
                    onClick={() => onNavigate("live-mission")}
                    className="w-full text-left px-4 py-3 hover:bg-white/[0.01] transition-colors cursor-pointer block"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: PRIORITY_COLOR[u.priority] }}
                        />
                        <span
                          className="text-xs font-semibold"
                          style={{ color: "#dde6ff" }}
                        >
                          {u.displayId}
                        </span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full capitalize"
                          style={{
                            background: "rgba(74, 133, 253,0.1)",
                            color: "#8ba4cc",
                          }}
                        >
                          {u.priority}
                        </span>
                      </div>
                      <span
                        className="text-[11px]"
                        style={{
                          color:
                            u.currentStep === "snapshot"
                              ? "#00d4a0"
                              : "#ff9b36",
                        }}
                      >
                        {UCID_STEPS.find((s) => s.id === u.currentStep)
                          ?.label || u.currentStep}
                      </span>
                    </div>
                    <p
                      className="text-[11px] mb-2 text-left"
                      style={{ color: "#5d7899" }}
                    >
                      {u.name}
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        className="flex-1 h-1 rounded-full overflow-hidden"
                        style={{ background: "rgba(74, 133, 253,0.1)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            background:
                              u.currentStep === "snapshot"
                                ? "#00d4a0"
                                : "linear-gradient(90deg, #4a85fd, #00d4a0)",
                          }}
                        />
                      </div>
                      <span
                        className="text-[10px] shrink-0"
                        style={{ color: "#3a5070" }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Vendor API Status + Issues */}
        <div className="space-y-4">
          <VendorHealthList vendors={vendors} onNavigate={onNavigate} />
          <ActiveIssuesList forensicIssues={forensicIssues} onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}
