import React, { useState, useEffect } from 'react';
import { Search, Command, Bell, Settings, ShieldCheck, Clock, User, Sparkles } from 'lucide-react';
import { AppView } from '../types';

interface TopBarProps {
  activeView: AppView;
  onSearch: (query: string) => void;
  onNavigate?: (newView: AppView) => void;
  apiProgress?: number;
  isPendingAPI?: boolean;
  syncHealth?: { status: 'healthy' | 'warning' | 'error', message: string };
}

export function TopBar({ activeView, onSearch, onNavigate, apiProgress, isPendingAPI, syncHealth }: TopBarProps) {
  const [localQuery, setLocalQuery] = useState('');
  const [timeStr, setTimeStr] = useState('2026-06-06 13:40:10 UTC');

  // Format the view name for elegant header reading
  const viewTitles: Record<AppView, string> = {
    dashboard: 'Intelligence Dashboard Overview',
    'live-mission': 'Live Parallel Mission Control',
    catalog: 'Unified Vendor Catalog SKU Manager',
    'vendor-portal': 'Vendor API Integrations & Health',
    forensic: 'Forensic Scan & Automated Repair Center',
    cleansing: 'Taxonomy Cleansing & Part Number Mapping',
    taxonomy: 'Procurement Taxonomy Knowledge Graph',
    'solution-builder': 'Visual Solution Architecture Configurator',
    reports: 'Comparative Audit & Performance Reports',
    premium: 'AI Procurement & Sourcing UI Lab',
    'ingestion-hub': 'Centralized BOQ & BOM Ingestion Hub',
    telemetry: 'System Telemetry Pipeline',
    documentation: 'System Documentation & API Contracts',
  };

  useEffect(() => {
    // Keep a beautiful live-ish tick or static UTC time format
    const interval = setInterval(() => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
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
  };

  return (
    <header 
      className="relative h-16 px-6 border-b flex items-center justify-between shrink-0 select-none"
      style={{ backgroundColor: '#090d19', borderColor: 'rgba(74,133,253,0.1)' }}
    >
      {/* View Title */}
      <div className="flex flex-col min-w-0 mr-4 flex-1">
        <h1 className="text-sm font-semibold text-white tracking-tight truncate">
          {viewTitles[activeView] || 'Procurement Workspace'}
        </h1>
        <div className="flex items-center gap-1.5 mt-0.5">
          <ShieldCheck className="w-3 h-3 text-[#00d4a0] shrink-0" />
          <span className="text-[10px] text-gray-500 font-medium font-mono uppercase truncate">
            Platform Gateway: Protected Mode
          </span>
          {syncHealth && (
            <>
              <span className="text-gray-600 px-1">•</span>
              <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border ${
                syncHealth.status === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                syncHealth.status === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                <span className="text-[8px] font-bold uppercase tracking-wider">{syncHealth.message}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Global Lookup Search & Actions */}
      <div className="flex items-center gap-4">
        {/* Create Solution Gradient Button */}
        <button
          id="topbar-create-solution-btn"
          data-testid="create-solution-btn"
          onClick={() => onNavigate && onNavigate('solution-builder')}
          className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600 hover:from-blue-600 hover:via-indigo-600 hover:to-indigo-700 transition shadow-md shadow-indigo-500/10 cursor-pointer flex items-center gap-1.5 focus:outline-none shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Create Solution</span>
        </button>

        {/* Search Input Box */}
        <div className="relative group w-72">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
            <Search className="w-4 h-4 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <input
            id="global-search-input"
            type="text"
            value={localQuery}
            onChange={handleInputChange}
            placeholder="Search SKUs, vendors, processes..."
            className="w-full h-9 pl-9 pr-8 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 border transition-all"
            style={{ 
              backgroundColor: 'rgba(74,133,253,0.03)', 
              borderColor: 'rgba(74,133,253,0.12)' 
            }}
          />
          <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none">
            <div className="px-1.5 py-0.5 rounded text-[9px] font-mono border text-gray-600 bg-white/2" style={{ borderColor: 'rgba(74,133,253,0.08)' }}>
              ⌘K
            </div>
          </div>
        </div>

        {/* Live Clock / Timezone */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-gray-400 font-mono text-[10px]"
          style={{ backgroundColor: 'rgba(74,133,253,0.02)', borderColor: 'rgba(74,133,253,0.08)' }}>
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>{timeStr}</span>
        </div>

        {/* Notifications & System Configurations */}
        <div className="flex items-center gap-1">
          <button 
            id="btn-notifications"
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
          </button>
          
          <button 
            id="btn-settings"
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l" style={{ borderColor: 'rgba(74,133,253,0.1)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-indigo-500/15 border border-indigo-500/30">
            <User className="w-4 h-4 text-indigo-300" />
          </div>
          <div className="hidden xl:flex flex-col">
            <span className="text-[11px] font-bold text-white leading-none">Admin Operator</span>
            <span className="text-[9px] text-[#00d4a0] font-mono font-semibold mt-0.5">CONTRACTS LEVEL 1</span>
          </div>
        </div>
      </div>
      
      {/* Global Persistent Progress Bar */}
      {(isPendingAPI || (apiProgress !== undefined && apiProgress > 0 && apiProgress < 100)) && (
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-sky-900/30 overflow-hidden">
          <div 
            className="h-full bg-sky-400 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(56,189,248,0.5)]"
            style={{ width: `${apiProgress || (isPendingAPI ? 100 : 0)}%`, opacity: apiProgress === 100 ? 0 : 1 }}
          />
          {isPendingAPI && !apiProgress && (
            <div className="absolute inset-0 bg-sky-400/50 animate-pulse" />
          )}
        </div>
      )}
    </header>
  );
}
