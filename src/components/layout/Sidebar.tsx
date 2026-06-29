import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { tokens } from "../../styles/tokens";
import { motion } from "motion/react";
import { useCoreStore } from "../../store/coreStore";
import {
  LayoutDashboard,
  Target,
  Database,
  Globe,
  ShieldAlert,
  
  Menu,
  ChevronLeft,
  
  Network,
  
  Atom,
  
  Cable,
  FolderSync,
  UploadCloud,
  
  
  Search,
  Scissors,
  Radio,
} from "lucide-react";
import { UCID, Vendor, ForensicIssue } from "../../types";
interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeMissionId?: string;
  onSelectMission: (id: string) => void;
}
export function Sidebar({
  collapsed,
  onToggle,
  activeMissionId,
  onSelectMission,
}: SidebarProps) {
  const ucids = useCoreStore((s) => s.ucids);
  const vendors = useCoreStore((s) => s.vendors);
  const forensicIssues = useCoreStore((s) => s.forensicIssues);
  
  const navigate = useNavigate();
  const location = useLocation();
  const activePath = location.pathname;
  const activeUCIDs = useMemo(() => ucids.filter((u) => u.currentStep !== "snapshot"), [ucids]);
  const openIssues = useMemo(() => forensicIssues.filter(
    (f) => f.status !== "resolved",
  ).length, [forensicIssues]);
  const connectedVendors = useMemo(() => vendors.filter(
    (v) => v.status === "connected" || v.status === "syncing",
  ).length, [vendors]);
  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    {
      path: "/ingestion-hub",
      label: "BOQ & BOM Ingest Hub",
      icon: UploadCloud,
      iconColor: tokens.colors.accent.sky, 
    },
    {
      path: "/reconciliation",
      label: "BOM Reconciliation Diff",
      icon: FolderSync,
      iconColor: tokens.colors.accent.violet, 
    },
    {
      path: "/search",
      label: "Semantic NLP Search",
      icon: Search,
      iconColor: tokens.colors.accent.emerald, 
    },
    {
      path: "/mission-control",
      label: "Live Mission Control",
      icon: Target,
      badge: activeUCIDs.length > 0 ? activeUCIDs.length : undefined,
      badgeColor: "rgba(255,155,54,0.15)",
      badgeTextColor: tokens.colors.status.warning, 
    },
    {
      path: "/catalog",
      label: "Catalog SKU Manager",
      icon: Database,
    },
    {
      path: "/vendor-portal",
      label: "Vendor Portal & APIs",
      icon: Globe,
      badge: connectedVendors > 0 ? `${connectedVendors} Live` : undefined,
      badgeColor: "rgba(0,212,160,0.1)",
      badgeTextColor: tokens.colors.status.success, 
    },
    {
      path: "/forensic",
      label: "Forensic Scan & Heal",
      icon: ShieldAlert,
      badge: openIssues > 0 ? openIssues : undefined,
      badgeColor: "rgba(255,61,90,0.1)",
      badgeTextColor: tokens.colors.status.error, 
    },
    {
      path: "/solution-builder",
      label: "Solution Configurator",
      icon: Atom,
    },
    {
      path: "/taxonomy-graph",
      label: "Taxonomy Graph Editor",
      icon: Network,
      iconColor: tokens.colors.accent.indigo,
    },
    {
      path: "/cleansing",
      label: "Cleansing Workshop",
      icon: Scissors,
      iconColor: tokens.colors.accent.emerald,
    },
    {
      path: "/telemetry",
      label: "System Telemetry",
      icon: Radio,
      iconColor: tokens.colors.accent.violet,
    },
  ];
  return (
    <nav
      aria-label="Sidebar Navigation"
      className={`flex flex-col h-screen shrink-0 border-r transition-all duration-300 z-50 bg-background-card ${collapsed ? "w-[4.5rem]" : "w-[4.5rem] lg:w-[17.5rem]"} absolute lg:relative`}
      style={{
        backgroundColor: tokens.colors.background.card, 
        borderColor: "rgba(74, 133, 253,0.1)",
      }}
    >
      {/* Header Panel */}
      <div
        className={`flex items-center justify-center lg:${collapsed ? "justify-center p-2" : "justify-between p-4"} h-16 border-b shrink-0`}
        style={{ borderColor: "rgba(74, 133, 253,0.08)" }}
      >
        {!collapsed && (
          <div className="hidden lg:flex items-center gap-2 overflow-hidden">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <Cable className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs tracking-wider font-bold text-gray-400 uppercase leading-none">
                Vendor Intel
              </p>
              <p className="text-sm font-extrabold text-white mt-0.5 tracking-tight truncate">
                VSIP Platform
              </p>
            </div>
          </div>
        )}
        <button type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center hidden lg:flex"
        >
          {collapsed ? (
            <Menu className="w-5 h-5 text-indigo-400" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>
      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = activePath === item.path || (item.path !== "/" && activePath.startsWith(item.path));
          const IconComponent = item.icon;
          return (
            <button type="button"
              id={`nav-${item.path.replace('/', '') || 'dashboard'}`}
              key={item.path}
              onClick={(e) => {
                e.stopPropagation();
                navigate(item.path);
                if (collapsed) onToggle();
              }}
              className={`w-full flex items-center ${collapsed ? "justify-center px-1" : "gap-3 px-3"} py-2.5 rounded-lg text-left text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer relative group`}
              style={{
                backgroundColor: isActive
                  ? "rgba(74, 133, 253,0.08)"
                  : "transparent",
                color: isActive ? tokens.colors.text.primary : tokens.colors.text.secondary, 
              }}
            >
              {/* Left active line indicator */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-indigo-400"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <IconComponent
                className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110`}
                style={{
                  color: isActive
                    ? tokens.colors.accent.indigo 
                    : item.iconColor
                      ? item.iconColor
                      : tokens.colors.text.muted, 
                }}
              />
              {!collapsed && (
                <span className="flex-1 truncate hidden lg:inline">{item.label}</span>
              )}
              {item.badge && !collapsed && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold ml-auto shrink-0 hidden lg:inline-block"
                  style={{
                    backgroundColor: item.badgeColor,
                    color: item.badgeTextColor,
                  }}
                >
                  {item.badge}
                </span>
              )}
              {/* Hover tooltip when sidebar is collapsed */}
              {collapsed && (
                <div className="absolute left-16 px-2 py-1 bg-surface-elevated text-white text-[10px] rounded border border-indigo-500/20 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl"> 
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </div>
      {/* Parallel UCID Live Monitors (only when expanded) */}
      {!collapsed && activeUCIDs.length > 0 && (
        <div
          className="hidden lg:flex p-3 border-t shrink-0 h-44 flex-col"
          style={{ borderColor: "rgba(74, 133, 253,0.08)" }}
        >
          <div className="flex items-center gap-1.5 px-1 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
            <span className="text-[10px] tracking-wider text-gray-400 font-bold uppercase">
              Live Tracks ({activeUCIDs.length})
            </span>
          </div>
          <div className="space-y-1 overflow-y-auto flex-1 pr-1 scrollbar-thin">
            {activeUCIDs.map((ucid) => {
              const isActive =
                activeMissionId === ucid.id && activePath.startsWith("/mission-control");
              return (
                <button type="button"
                  id={`side-track-${ucid.id}`}
                  key={ucid.id}
                  onClick={() => onSelectMission(ucid.id)}
                  className="w-full text-left p-2 rounded-lg transition-colors cursor-pointer group flex flex-col"
                  style={{
                    backgroundColor: isActive
                      ? "rgba(255,155,54,0.08)"
                      : "rgba(74, 133, 253,0.02)",
                    border: `1px solid ${isActive ? "rgba(255,155,54,0.25)" : "rgba(74, 133, 253,0.05)"}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-indigo-400">
                      {ucid.displayId}
                    </span>
                    <span className="text-[9px] text-status-warning font-medium">
                      {ucid.currentStep === "boq-intake"
                        ? "Intake"
                        : ucid.currentStep === "pre-intelligence"
                          ? "Pre-Intel"
                          : "Configuring"}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 truncate mt-0.5 font-normal group-hover:text-white transition-colors">
                    {ucid.name.split("—")[1]?.trim() ?? ucid.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}