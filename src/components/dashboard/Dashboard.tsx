import { tokens } from "../../styles/tokens";
import { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  Globe,
  Database,
  Activity,
  Target,
  AlertTriangle,
  
  Zap,
  RefreshCw,
  
} from "lucide-react";
import { UCID_STEPS } from "../../lib/mockData";
import { useChartDimensions } from "../../hooks/useChartDimensions";
import type { AppView, UCID, Vendor, ForensicIssue } from "../../types";
import { ErrorBoundary } from "../shared/ErrorBoundary";
import { useCoreStore } from "../../store/coreStore";
import { KpiCard } from "./KpiCard";
import { VendorHealthList } from "./VendorHealthList";
import { ActiveIssuesList } from "./ActiveIssuesList";
import { CatalogTrendAnalyzer } from "./CatalogTrendAnalyzer";
import { VendorStatusBoard } from "./VendorStatusBoard";
import { UcidPipelineCard } from "./UcidPipelineCard";
interface DashboardProps {
  onNavigate: (v: AppView) => void;
}
export function Dashboard({
  onNavigate,
}: DashboardProps) {
  const ucids = useCoreStore((s) => s.ucids);
  const vendors = useCoreStore((s) => s.vendors);
  const forensicIssues = useCoreStore((s) => s.forensicIssues);
  
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
    const averagePipeline = useMemo(() => {
      return activeUCIDs.length > 0 
        ? Math.round(activeUCIDs.reduce((acc, u) => {
            const stepIdx = UCID_STEPS.findIndex((s) => s.id === u.currentStep);
            return acc + (stepIdx / (UCID_STEPS.length - 1)) * 100;
        }, 0) / activeUCIDs.length)
        : 0;
    }, [activeUCIDs]);
      
    const recentMission = useMemo(() => {
      return activeUCIDs.length > 0 ? activeUCIDs[0].displayId : "No active missions";
    }, [activeUCIDs]);
  const syncStatusInfo = useMemo(() => {
    const hasError = vendors.some((v) => v.status === "error");
    const hasSyncing = vendors.some((v) => v.status === "syncing");
    const countConnected = vendors.filter((v) => v.status === "connected" || v.status === "syncing").length;
    
    let value = "Synced";
    let delta = "Healthy";
    let color = tokens.colors.status.success; 
    if (hasError) {
      value = "Error";
      delta = "Check APIs";
      color = tokens.colors.status.error; 
    } else if (hasSyncing) {
      value = "Syncing";
      delta = "Optimizing";
      color = tokens.colors.status.warning; 
    }
    
    return {
      value,
      sub: `${countConnected} of ${vendors.length} online`,
      delta,
      color,
    };
  }, [vendors]);
  const KPI_CARDS = useMemo(() => [
    {
      id: "kpi-vendor-portal-count",
      view: "vendor-portal",
      label: "Connected Vendors",
      value: `${connectedVendors}`,
      sub: `of ${vendors.length} total`,
      icon: Globe,
      color: tokens.colors.accent.indigo, 
      delta: "",
      up: true,
    },
    {
      id: "kpi-catalog",
      view: "catalog",
      label: "Catalog SKUs",
      value: totalCatalog.toLocaleString(),
      sub: `across ${vendors.length} vendors`,
      icon: Database,
      color: tokens.colors.status.success, 
      delta: "",
      up: true,
    },
    {
      id: "kpi-mission-control-count",
      view: "mission-control",
      label: "Active UCIDs",
      value: `${activeUCIDs.length}`,
      sub: `${ucids.length} total missions`,
      icon: Target,
      color: tokens.colors.status.warning, 
      delta: "",
      up: true,
    },
    {
      id: "kpi-forensic",
      view: "forensic",
      label: "Open Issues",
      value: `${forensicIssues.filter((f) => f.status !== "resolved").length}`,
      sub: `${criticalIssues} critical`,
      icon: Activity,
      color: tokens.colors.status.error, 
      delta: "",
      up: false,
    },
    {
      id: "kpi-mission-control-pipeline",
      view: "mission-control",
      label: "Active Pipeline",
      value: `${averagePipeline}%`,
      sub: `${recentMission} processing`,
      icon: Zap,
      color: tokens.colors.accent.violet, 
      delta: "Live",
      up: true,
    },
    {
      id: "kpi-vendor-portal-sync",
      view: "vendor-portal",
      label: "Last Sync Status",
      value: syncStatusInfo.value,
      sub: syncStatusInfo.sub,
      icon: RefreshCw,
      color: syncStatusInfo.color,
      delta: syncStatusInfo.delta,
      up: syncStatusInfo.value !== "Error",
    },
  ], [connectedVendors, vendors.length, totalCatalog, activeUCIDs.length, ucids.length, forensicIssues, criticalIssues, averagePipeline, recentMission, syncStatusInfo]);
  return (
    <ErrorBoundary>
      <motion.div 
        className="space-y-4"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut", staggerChildren: 0.1 }}
      >
        {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
        }}
        transition={{ 
          opacity: { duration: 0.4, ease: "easeOut" },
          scale: { duration: 0.4, ease: "easeOut" },
        }}
        className="rounded-xl p-4 flex items-center justify-between relative overflow-hidden animate-gradient"
        style={{
          background: "linear-gradient(270deg, rgba(74, 133, 253, 0.12) 0%, rgba(0,212,160,0.06) 50%, rgba(74, 133, 253,0.12) 100%)",
          backgroundSize: "200% 200%",
          border: "1px solid rgba(74, 133, 253,0.18)",
        }}
      >
        {/* Subtle particle overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'1\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'1\\'/%3E%3C/g%3E%3C/svg%3E')" }} />
        
        <div className="relative z-10">
          <p
            className="text-base"
            style={{ color: tokens.colors.text.primary, fontWeight: 500 }} 
          >
            Procurement Intelligence Hub
          </p>
          <p className="text-sm mt-0.5" style={{ color: tokens.colors.text.muted }}> 
            {activeUCIDs.length} active UCIDs in pipeline · {connectedVendors}{" "}
            vendors live · {criticalIssues} critical issues awaiting review
          </p>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          {criticalIssues > 0 && (
            <motion.button type="button"
              onClick={() => onNavigate("forensic")}
              aria-label="Resolve Critical Issues"
              className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg hover:opacity-90 transition-all cursor-pointer border border-status-error/30"
              style={{ background: tokens.colors.status.error, color: tokens.colors.text.primary }} 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
              Resolve {criticalIssues} Critical
            </motion.button>
          )}
          <motion.button type="button"
            onClick={() => onNavigate("mission-control")}
            aria-label="Open Live Mission Control"
            className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg hover:opacity-90 transition-all cursor-pointer"
            style={{ background: tokens.colors.accent.indigo, color: tokens.colors.text.primary }} 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Target className="w-3.5 h-3.5" />
            Live Mission Control
          </motion.button>
        </div>
      </motion.div>
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
            onClick={() => onNavigate(kpi.view as AppView)}
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
        <UcidPipelineCard onNavigate={onNavigate} />
        {/* Vendor API Status + Issues */}
        <div className="space-y-4">
          <VendorHealthList onNavigate={onNavigate} />
          <ActiveIssuesList onNavigate={onNavigate} />
        </div>
      </div>
    </motion.div>
  </ErrorBoundary>
  );
}