import { tokens } from "../../styles/tokens";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Command,
  Bell,
  Settings,
  ShieldCheck,
  Clock,
  User,
  Sparkles,
  Database,
  Target,
  Globe,
  ArrowUpRight,
} from "lucide-react";
import { UCID, Vendor, CatalogSKU } from "../../types";
import { useToast } from "../shared/ToastContext";

interface TopBarProps {
  activeView: string;
  onSearch: (query: string) => void;
  searchQuery?: string;
  onNavigate?: (newView: string) => void;
  apiProgress?: number;
  isPendingAPI?: boolean;
  syncHealth?: { status: "healthy" | "warning" | "error"; message: string };
  ucids?: UCID[];
  vendors?: Vendor[];
  catalogSkus?: CatalogSKU[];
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
  ucids = [],
  vendors = [],
  catalogSkus = [],
  onSelectMission,
}: TopBarProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const [localQuery, setLocalQuery] = useState(searchQuery || "");
  const [timeStr, setTimeStr] = useState("2026-06-06 13:40:10 UTC");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalQuery(searchQuery || "");
  }, [searchQuery]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalQuery(val);
    onSearch(val);
    if (val.trim().length > 0) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const cleanQuery = localQuery.toLowerCase().trim();

  const matchedMissions = cleanQuery ? (ucids || []).filter(u =>
    (u.displayId || "").toLowerCase().includes(cleanQuery) ||
    (u.name || "").toLowerCase().includes(cleanQuery) ||
    (u.projectRef || "").toLowerCase().includes(cleanQuery)
  ).slice(0, 3) : [];

  const matchedVendors = cleanQuery ? (vendors || []).filter(v =>
    (v.name || "").toLowerCase().includes(cleanQuery) ||
    (v.shortName || "").toLowerCase().includes(cleanQuery)
  ).slice(0, 3) : [];

  const matchedSkus = cleanQuery ? (catalogSkus || []).filter(s =>
    (s.partNumber || "").toLowerCase().includes(cleanQuery) ||
    (s.name || "").toLowerCase().includes(cleanQuery)
  ).slice(0, 3) : [];

  const hasMatches = matchedMissions.length > 0 || matchedVendors.length > 0 || matchedSkus.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setShowDropdown(false);
      navigate("/search");
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setShowDropdown(false);
      });
    });
  };

  return (
    <header
      className="relative h-16 px-6 border-b flex items-center justify-between shrink-0 select-none z-30"
      style={{
        backgroundColor: tokens.colors.background.header, 
        borderColor: "rgba(74, 133, 253,0.1)",
      }}
    >
      {/* View Title */}
      <div className="flex flex-col min-w-0 mr-4 flex-1">
        <h1 className="text-sm font-semibold text-white tracking-tight truncate">
          {viewTitles[activeView] || "Procurement Workspace"}
        </h1>
      </div>

      {/* Global Lookup Search & Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Create Solution Gradient Button */}
        <button
          id="topbar-create-solution-btn"
          data-testid="create-solution-btn"
          onClick={() => navigate("/solution-builder")}
          className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600 hover:from-blue-600 hover:via-indigo-600 hover:to-indigo-700 transition shadow-md shadow-indigo-500/10 cursor-pointer flex items-center gap-1.5 focus:outline-none shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Create Solution</span>
        </button>

        {/* Search Input Box */}
        <div className="relative w-32 sm:w-60 md:w-80" ref={dropdownRef}>
          <button
            onClick={() => inputRef.current?.focus()}
            className="absolute inset-y-0 left-3 flex items-center text-gray-500 hover:text-indigo-400 transition-colors z-10"
            title="Focus Search Input"
          >
            <Search className="w-4 h-4" />
          </button>
          <input
            ref={inputRef}
            id="global-search-input"
            type="text"
            value={localQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsFocused(true);
              if (localQuery.trim().length > 0) setShowDropdown(true);
            }}
            onBlur={handleBlur}
            placeholder="Search SKUs, vendors, processes..."
            className="w-full h-9 pl-9 pr-12 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 border transition-all"
            style={{
              backgroundColor: "rgba(74, 133, 253,0.03)",
              borderColor: "rgba(74, 133, 253,0.12)",
            }}
          />
          <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-[9px] font-mono text-gray-600">
            <span>↵ Enter</span>
          </div>

          {/* Sourcing Real-Time Search dropdown Popover */}
          {showDropdown && isFocused && cleanQuery.length > 0 && (
            <div
              className="absolute left-0 right-0 top-11 p-3 rounded-xl border shadow-2xl z-50 flex flex-col gap-3 animate-fadeIn text-[11px]"
              style={{
                backgroundColor: tokens.colors.background.card, 
                borderColor: "rgba(74,133,253,0.15)",
                backgroundImage: "linear-gradient(180deg, rgba(7,10,19,0.98) 0%, rgba(11,18,32,0.98) 100%)",
                backdropFilter: "blur(8px)",
              }}
            >
              {hasMatches ? (
                <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto scrollbar-thin pr-0.5">
                  {/* Matching Workflows */}
                  {matchedMissions.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <div className="text-[9px] uppercase font-bold text-gray-500 flex items-center gap-1.5 px-2 pb-0.5 border-b border-white/5">
                        <Target className="w-3.5 h-3.5 text-orange-400" />
                        <span>Active Tracks ({matchedMissions.length})</span>
                      </div>
                      {matchedMissions.map(m => (
                        <button
                          key={m.id}
                          onClick={() => {
                            onSelectMission && onSelectMission(m.id);
                            navigate(`/mission-control/${m.id}`);
                            setShowDropdown(false);
                          }}
                          onMouseDown={(e) => e.preventDefault()}
                          className="w-full flex items-center justify-between p-2 rounded hover:bg-indigo-500/10 text-left text-gray-300 hover:text-white transition group cursor-pointer"
                        >
                          <span className="font-semibold text-indigo-300 group-hover:text-indigo-200 truncate pr-2 max-w-[120px]">{m.displayId}</span>
                          <span className="flex-1 truncate text-gray-400 group-hover:text-gray-300 text-right">{m.name}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-transparent group-hover:text-indigo-400 ml-1 shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Matching Vendors */}
                  {matchedVendors.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <div className="text-[9px] uppercase font-bold text-gray-500 flex items-center gap-1.5 px-2 pb-0.5 border-b border-white/5">
                        <Globe className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Vendor Partners ({matchedVendors.length})</span>
                      </div>
                      {matchedVendors.map(v => (
                        <button
                          key={v.id}
                          onClick={() => {
                            navigate("/vendor-portal");
                            setShowDropdown(false);
                          }}
                          onMouseDown={(e) => e.preventDefault()}
                          className="w-full flex items-center justify-between p-2 rounded hover:bg-indigo-500/10 text-left text-gray-300 hover:text-white transition group cursor-pointer"
                        >
                          <span className="font-semibold text-emerald-300 group-hover:text-emerald-200">{v.shortName}</span>
                          <span className="flex-1 truncate text-gray-400 group-hover:text-gray-300 text-right">{v.name}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-transparent group-hover:text-emerald-400 ml-1 shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Matching SKUs */}
                  {matchedSkus.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <div className="text-[9px] uppercase font-bold text-gray-500 flex items-center gap-1.5 px-2 pb-0.5 border-b border-white/5">
                        <Database className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Inventory SKUs ({matchedSkus.length})</span>
                      </div>
                      {matchedSkus.map(s => (
                        <button
                          key={s.id}
                          onClick={() => {
                            navigate("/catalog");
                            setShowDropdown(false);
                          }}
                          onMouseDown={(e) => e.preventDefault()}
                          className="w-full flex items-center justify-between p-2 rounded hover:bg-indigo-500/10 text-left text-gray-300 hover:text-white transition group cursor-pointer"
                        >
                          <span className="font-mono text-indigo-300 group-hover:text-indigo-200 truncate pr-2 max-w-[120px]">{s.partNumber}</span>
                          <span className="flex-1 truncate text-gray-400 group-hover:text-gray-300 text-right">{s.name}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-transparent group-hover:text-indigo-400 ml-1 shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No direct quick matches. Press Enter ↵ to trigger comprehensive Sourcing Query.
                </div>
              )}

              {/* Cognitive Footer link */}
              <div
                className="mt-1 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-medium"
              >
                <span>↵ Press Enter to review details</span>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    navigate("/search");
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent blur
                    setShowDropdown(false);
                    navigate("/search");
                  }}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 font-bold cursor-pointer hover:underline"
                >
                  Open Sourcing Explorer &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Clock / Timezone */}
        <div
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-gray-400 font-mono text-[10px]"
          style={{
            backgroundColor: "rgba(74, 133, 253,0.02)",
            borderColor: "rgba(74, 133, 253,0.08)",
          }}
        >
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>{timeStr}</span>
        </div>

        {/* Notifications & System Configurations */}
        <div className="flex items-center gap-1">
          <button
            id="btn-notifications"
            onClick={() => toast.success("No new priority notifications.")}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
          </button>

          <button
            id="btn-settings"
            onClick={() => toast.success("Settings modal opening...")}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* User Badge */}
        <div
          className="flex items-center gap-2.5 pl-2 border-l"
          style={{ borderColor: "rgba(74, 133, 253,0.1)" }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-indigo-500/15 border border-indigo-500/30">
            <User className="w-4 h-4 text-indigo-300" />
          </div>
          <div className="hidden xl:flex flex-col">
            <span className="text-[11px] font-bold text-white leading-none">
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
