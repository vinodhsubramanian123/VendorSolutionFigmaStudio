import { tokens } from "../../styles/tokens";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Settings,
  Clock,
  User,
  Sparkles,
} from "lucide-react";
import { useToast } from "../shared/ToastContext";
import { TopBarSearch } from "./TopBarSearch";
import { useCoreStore } from "../../store/coreStore";

interface TopBarProps {
  activeView: string;
  onSearch: (query: string) => void;
  searchQuery?: string;
  onNavigate?: (newView: string) => void;
  apiProgress?: number;
  isPendingAPI?: boolean;
  syncHealth?: { status: "healthy" | "warning" | "error"; message: string };
  onSelectMission?: (id: string) => void;
}

export function TopBar({
  activeView,
  onSearch,
  searchQuery,
  onNavigate,
  apiProgress,
  isPendingAPI,
  syncHealth,
  onSelectMission,
}: TopBarProps) {
  const ucids = useCoreStore((s) => s.ucids);
  const vendors = useCoreStore((s) => s.vendors);
  const catalogSkus = useCoreStore((s) => s.catalogSkus);
  
  const navigate = useNavigate();
  const toast = useToast();
  const [timeStr, setTimeStr] = useState(() => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const dateStr = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`;
    const time = `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
    return `${dateStr} ${time} UTC`;
  });


  // Format the view name for elegant header reading
  const viewTitles: Record<string, string> = {
    dashboard: "Intelligence Dashboard Overview",
    "mission-control": "Live Parallel Mission Control",
    catalog: "Unified Vendor Catalog SKU Manager",
    "vendor-portal": "Vendor API Integrations & Health",
    forensic: "Forensic Scan & Automated Repair Center",
    "solution-builder": "Visual Solution Architecture Configurator",
    "ingestion-hub": "Centralized BOQ & BOM Ingestion Hub",
    reconciliation: "BOM Reconciliation Drift Analyzer",
    search: "Cognitive Semantic NLP Query Search",
    "taxonomy-graph": "Taxonomy Graph Editor",
    cleansing: "Interactive BOQ Cleansing & Mapping Workshop",
    telemetry: "API Telemetry Webhook Monitor",
  };

  useEffect(() => {
    // Keep a beautiful live-ish tick or static UTC time format
    const interval = setInterval(() => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, "0");
      const dateStr = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`;
      const timeStr = `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
      setTimeStr(`${dateStr} ${timeStr} UTC`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className="relative h-16 px-6 border-b flex items-center justify-between shrink-0 select-none z-30"
      style={{
        backgroundColor: tokens.colors.background.header, 
        borderColor: "rgba(74, 133, 253,0.1)",
      }}
    >
      {/* View Title */}
      <div className="flex flex-col shrink-0 min-w-fit mr-4">
        <h1 className="text-sm font-semibold text-content-primary tracking-tight whitespace-nowrap">
          {viewTitles[activeView] || "Procurement Workspace"}
        </h1>
      </div>

      {/* Global Lookup Search & Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Create Solution Gradient Button */}
        <button type="button"
          id="topbar-create-solution-btn"
          data-testid="create-solution-btn"
          onClick={() => navigate("/solution-builder")}
          className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-content-primary bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600 hover:from-blue-600 hover:via-indigo-600 hover:to-indigo-700 transition shadow-md shadow-indigo-500/10 cursor-pointer flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Create Solution</span>
        </button>

        {/* Search Input Box */}
        <TopBarSearch
          searchQuery={searchQuery}
          onSearch={onSearch}
          ucids={ucids}
          vendors={vendors}
          catalogSkus={catalogSkus}
          onSelectMission={onSelectMission}
        />

        {/* Live Clock / Timezone */}
        <div
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-content-secondary font-mono text-[10px]"
          style={{
            backgroundColor: "rgba(74, 133, 253,0.02)",
            borderColor: "rgba(74, 133, 253,0.08)",
          }}
        >
          <Clock className="w-3.5 h-3.5 text-brand-indigo" />
          <span>{timeStr}</span>
        </div>

        {/* Notifications & System Configurations */}
        <div className="flex items-center gap-1">
          <button type="button"
            id="btn-notifications"
            aria-label="Notifications"
            onClick={() => toast.success("No new priority notifications.")}
            className="p-2 text-content-secondary hover:text-content-primary rounded-lg hover:bg-white/5 transition-colors cursor-pointer relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-indigo" />
          </button>

          <button type="button"
            id="btn-settings"
            aria-label="Settings"
            onClick={() => toast.success("Settings modal opening...")}
            className="p-2 text-content-secondary hover:text-content-primary rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* User Badge */}
        <div
          className="flex items-center gap-2.5 pl-2 border-l"
          style={{ borderColor: "rgba(74, 133, 253,0.1)" }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-content-primary bg-brand-indigo/15 border border-brand-indigo/30">
            <User className="w-4 h-4 text-indigo-300" />
          </div>
          <div className="hidden xl:flex flex-col">
            <span className="text-[11px] font-bold text-content-primary leading-none">
              Admin Operator
            </span>
            <span className="text-[9px] text-status-success font-mono font-semibold mt-0.5">
              CONTRACTS LEVEL 1
            </span>
          </div>
        </div>
      </div>

      {/* Global Persistent Progress Bar */}
      {(isPendingAPI ||
        (apiProgress !== undefined &&
          apiProgress > 0 &&
          apiProgress < 100)) && (
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-sky-900/30 overflow-hidden">
          <div
            className="h-full bg-sky-400 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(56,189,248,0.5)]"
            style={{
              width: `${apiProgress || (isPendingAPI ? 100 : 0)}%`,
              opacity: apiProgress === 100 ? 0 : 1,
            }}
          />
          {isPendingAPI && !apiProgress && (
            <div className="absolute inset-0 bg-sky-400/50 animate-pulse" />
          )}
        </div>
      )}
    </header>
  );
}
