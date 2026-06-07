import { 
  LayoutDashboard, 
  Target, 
  Database, 
  Globe, 
  ShieldAlert, 
  Sparkles, 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  Network, 
  FileText, 
  Atom, 
  Wrench,
  Cable,
  FolderSync,
  UploadCloud,
  Activity,
  Book,
  Search
} from 'lucide-react';
import { AppView } from '../types';
import { UCID } from '../types';

interface SidebarProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  collapsed: boolean;
  onToggle: () => void;
  activeMissionId?: string;
  onSelectMission: (id: string) => void;
  ucids: UCID[];
  vendors: any[];
  forensicIssues: any[];
}

export function Sidebar({
  activeView,
  onNavigate,
  collapsed,
  onToggle,
  activeMissionId,
  onSelectMission,
  ucids,
  vendors,
  forensicIssues,
}: SidebarProps) {
  const activeUCIDs = ucids.filter((u) => u.currentStep !== 'snapshot');
  const openIssues = forensicIssues.filter((f) => f.status !== 'resolved').length;
  const connectedVendors = vendors.filter((v) => v.status === 'connected' || v.status === 'syncing').length;

  const navItems = [
    { view: 'dashboard' as AppView, label: 'Dashboard', icon: LayoutDashboard },
    { 
      view: 'ingestion-hub' as AppView, 
      label: 'BOQ & BOM Ingest Hub', 
      icon: UploadCloud,
      iconColor: '#38bdf8'
    },
    { 
      view: 'reconciliation' as AppView, 
      label: 'BOM Reconciliation Diff', 
      icon: FolderSync,
      iconColor: '#a855f7'
    },
    { 
      view: 'search' as AppView, 
      label: 'Semantic NLP Search', 
      icon: Search,
      iconColor: '#10b981'
    },
    { 
      view: 'live-mission' as AppView, 
      label: 'Live Mission Control', 
      icon: Target,
      badge: activeUCIDs.length > 0 ? activeUCIDs.length : undefined,
      badgeColor: 'rgba(255,155,54,0.15)',
      badgeTextColor: '#ff9b36'
    },
    { view: 'catalog' as AppView, label: 'Catalog SKU Manager', icon: Database },
    { 
      view: 'vendor-portal' as AppView, 
      label: 'Vendor Portal & APIs', 
      icon: Globe,
      badge: connectedVendors > 0 ? `${connectedVendors} Live` : undefined,
      badgeColor: 'rgba(0,212,160,0.1)',
      badgeTextColor: '#00d4a0'
    },
    { 
      view: 'forensic' as AppView, 
      label: 'Forensic Scan & Heal', 
      icon: ShieldAlert,
      badge: openIssues > 0 ? openIssues : undefined,
      badgeColor: 'rgba(255,61,90,0.1)',
      badgeTextColor: '#ff3d5a'
    },
    { view: 'cleansing' as AppView, label: 'Taxonomy Cleansing', icon: Wrench },
    { view: 'taxonomy' as AppView, label: 'Taxonomy Graph', icon: Network },
    { view: 'solution-builder' as AppView, label: 'Solution Configurator', icon: Atom },
    { view: 'reports' as AppView, label: 'Reports & Auditing', icon: FileText },
    { view: 'telemetry' as AppView, label: 'System Telemetry', icon: Activity },
    { view: 'documentation' as AppView, label: 'API & Documentation', icon: Book },
  ];

  return (
    <div 
      className={`flex flex-col h-screen shrink-0 border-r transition-all duration-300 ${collapsed ? 'cursor-pointer hover:bg-white/[0.01]' : ''}`}
      onClick={collapsed ? onToggle : undefined}
      style={{ 
        width: collapsed ? '4.5rem' : '17.5rem', 
        backgroundColor: '#070a13', 
        borderColor: 'rgba(74,133,253,0.1)' 
      }}
    >
      {/* Header Panel */}
      <div 
        className={`flex items-center ${collapsed ? 'justify-center p-2' : 'justify-between p-4'} h-16 border-b shrink-0`} 
        style={{ borderColor: 'rgba(74,133,253,0.08)' }}
      >
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <Cable className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs tracking-wider font-bold text-gray-400 uppercase leading-none">Vendor Intel</p>
              <p className="text-sm font-extrabold text-white mt-0.5 tracking-tight truncate">VSIP Platform</p>
            </div>
          </div>
        )}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
        >
          {collapsed ? <Menu className="w-5 h-5 text-indigo-400" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = activeView === item.view;
          const IconComponent = item.icon;
          return (
            <button
              id={`nav-${item.view}`}
              key={item.view}
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(item.view);
                if (collapsed) onToggle();
              }}
              className={`w-full flex items-center ${collapsed ? 'justify-center px-1' : 'gap-3 px-3'} py-2.5 rounded-lg text-left text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer relative group`}
              style={{
                backgroundColor: isActive ? 'rgba(74,133,253,0.08)' : 'transparent',
                color: isActive ? '#fff' : '#8ba4cc',
              }}
            >
              {/* Left active line indicator */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-indigo-400" />
              )}
              
              <IconComponent 
                className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110`} 
                style={{ color: isActive ? '#4a85fd' : item.iconColor ? item.iconColor : '#5d7899' }}
              />
              
              {!collapsed && (
                <span className="flex-1 truncate">{item.label}</span>
              )}

              {item.badge && !collapsed && (
                <span 
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold ml-auto shrink-0"
                  style={{ backgroundColor: item.badgeColor, color: item.badgeTextColor }}
                >
                  {item.badge}
                </span>
              )}

              {/* Hover tooltip when sidebar is collapsed */}
              {collapsed && (
                <div className="absolute left-16 px-2 py-1 bg-[#0d1528] text-white text-[10px] rounded border border-indigo-500/20 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Parallel UCID Live Monitors (only when expanded) */}
      {!collapsed && activeUCIDs.length > 0 && (
        <div className="p-3 border-t shrink-0 h-44 flex flex-col" style={{ borderColor: 'rgba(74,133,253,0.08)' }}>
          <div className="flex items-center gap-1.5 px-1 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping shrink-0" />
            <span className="text-[10px] tracking-wider text-gray-500 font-bold uppercase">Live Tracks ({activeUCIDs.length})</span>
          </div>
          <div className="space-y-1 overflow-y-auto flex-1 pr-1 scrollbar-thin">
            {activeUCIDs.map((ucid) => {
              const isActive = activeMissionId === ucid.id && activeView === 'live-mission';
              return (
                <button
                  id={`side-track-${ucid.id}`}
                  key={ucid.id}
                  onClick={() => onSelectMission(ucid.id)}
                  className="w-full text-left p-2 rounded-lg transition-colors cursor-pointer group flex flex-col"
                  style={{
                    backgroundColor: isActive ? 'rgba(255,155,54,0.08)' : 'rgba(74,133,253,0.02)',
                    border: `1px solid ${isActive ? 'rgba(255,155,54,0.25)' : 'rgba(74,133,253,0.05)'}`
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-indigo-400 font-semibold">{ucid.displayId}</span>
                    <span className="text-[9px] text-[#ff9b36] font-bold">
                      {ucid.currentStep === 'boq-intake' ? 'Intake' : ucid.currentStep === 'pre-intelligence' ? 'Pre-Intel' : 'Configuring'}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 truncate mt-0.5 font-normal group-hover:text-white transition-colors">
                    {ucid.name.split('—')[1]?.trim() ?? ucid.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Branding Credit */}
      {!collapsed && (
        <div className="p-3 border-t shrink-0 text-center" style={{ borderColor: 'rgba(74,133,253,0.08)' }}>
          <p className="text-[9px] text-gray-600 font-mono">VSOP v2.6 · Verified Core</p>
        </div>
      )}
    </div>
  );
}
