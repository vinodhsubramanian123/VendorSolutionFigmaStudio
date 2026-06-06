import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './components/Dashboard';
import { LiveMission } from './components/LiveMission';
import { CatalogManager } from './components/CatalogManager';
import { VendorPortal } from './components/VendorPortal';
import { ForensicView } from './components/ForensicView';
import { PremiumShowcase } from './components/PremiumShowcase';
import { ReportsView } from './components/ReportsView';
import { CleansingView } from './components/CleansingView';
import { IntegrationsGateway } from './components/IntegrationsGateway';
import { TaxonomyGraphEditor } from './components/TaxonomyGraphEditor';
import { SolutionBuilder } from './components/SolutionBuilder';
import { IngestionHub } from './components/IngestionHub';
import { SearchView } from './components/SearchView';
import type { AppView } from './types';

// Import baseline mock data
import {
  UCIDS as INITIAL_UCIDS,
  VENDORS as INITIAL_VENDORS,
  CATALOG_SKUS as INITIAL_SKUS,
  FORENSIC_ISSUES as INITIAL_ISSUES,
} from './components/mockData';

export default function App() {
  const [view, setView] = useState<AppView>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [activeMissionId, setActiveMissionId] = useState<string | undefined>('u1');

  // Shared Global Reactive State Hub
  const [ucids, setUcids] = useState(INITIAL_UCIDS);
  const [vendors, setVendors] = useState(INITIAL_VENDORS);
  const [catalogSkus, setCatalogSkus] = useState(INITIAL_SKUS);
  const [forensicIssues, setForensicIssues] = useState(INITIAL_ISSUES);
  
  // Central Application-Wide State for Pending API Calls
  const [isPendingAPI, setIsPendingAPI] = useState(false);
  const [pendingAPIMessage, setPendingAPIMessage] = useState('');
  
  // Track deployed solution context to reflect on LiveMission with specific banners/pill
  const [deployedSolution, setDeployedSolution] = useState<{
    name: string;
    ucidCount: number;
    timestamp: number;
  } | null>(null);

  // High-level topbar search query strings
  const [searchQuery, setSearchQuery] = useState('');

  const isFullHeight = ['cleansing', 'integrations', 'taxonomy', 'solution-builder'].includes(view);

  function handleSelectMission(missionId: string) {
    setActiveMissionId(missionId);
    setSearchQuery('');
    setView('live-mission');
  }

  function renderView() {
    // If a search query is active, override standard view and display matched lookup indexes
    if (searchQuery.trim().length > 0) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-mono">Centralized matching result indices for pattern: "{searchQuery}"</span>
            <button 
              onClick={() => setSearchQuery('')}
              className="text-xs px-2.5 py-1 rounded bg-[#0b1220] border border-white/5 text-gray-400 hover:text-white cursor-pointer"
            >
              Clear Central Search
            </button>
          </div>
          <SearchView
            query={searchQuery}
            ucids={ucids}
            vendors={vendors}
            catalogSkus={catalogSkus}
            onNavigate={(newView) => {
              setSearchQuery('');
              setView(newView);
            }}
            onSelectMission={handleSelectMission}
          />
        </div>
      );
    }

    switch (view) {
      case 'dashboard':
        return (
          <Dashboard 
            onNavigate={setView} 
            ucids={ucids} 
            vendors={vendors} 
            forensicIssues={forensicIssues} 
          />
        );
      case 'ingestion-hub':
        return (
          <IngestionHub
            ucids={ucids}
            setUcids={setUcids}
            onNavigate={setView}
            onSelectMission={handleSelectMission}
            isPendingAPI={isPendingAPI}
            setIsPendingAPI={setIsPendingAPI}
            pendingAPIMessage={pendingAPIMessage}
            setPendingAPIMessage={setPendingAPIMessage}
          />
        );
      case 'live-mission':
        return (
          <LiveMission 
            selectedId={activeMissionId} 
            onSelectId={setActiveMissionId} 
            ucids={ucids}
            setUcids={setUcids}
            deployedSolution={deployedSolution}
            setDeployedSolution={setDeployedSolution}
          />
        );
      case 'catalog':
        return (
          <CatalogManager 
            catalogSkus={catalogSkus} 
            setCatalogSkus={setCatalogSkus} 
          />
        );
      case 'vendor-portal':
        return (
          <VendorPortal 
            vendors={vendors} 
            setVendors={setVendors} 
            ucids={ucids}
            setUcids={setUcids}
          />
        );
      case 'forensic':
        return (
          <ForensicView 
            forensicIssues={forensicIssues} 
            setForensicIssues={setForensicIssues} 
            setVendors={setVendors}
            setCatalogSkus={setCatalogSkus}
            ucids={ucids}
            setUcids={setUcids}
            activeMissionId={activeMissionId}
            setActiveMissionId={setActiveMissionId}
          />
        );
      case 'reports':
        return (
          <ReportsView 
            ucids={ucids} 
            catalogSkus={catalogSkus} 
          />
        );
      case 'cleansing':
        return (
          <CleansingView 
            forensicIssues={forensicIssues} 
            setForensicIssues={setForensicIssues} 
          />
        );
      case 'integrations':
        return <IntegrationsGateway />;
      case 'taxonomy':
        return (
          <TaxonomyGraphEditor 
            ucids={ucids}
            setUcids={setUcids}
            activeMissionId={activeMissionId}
            setActiveMissionId={setActiveMissionId}
          />
        );
      case 'solution-builder':
        return (
          <SolutionBuilder 
            ucids={ucids}
            setUcids={setUcids}
            onNavigate={setView}
            setDeployedSolution={setDeployedSolution}
            onSelectMission={handleSelectMission}
          />
        );
      case 'premium':
        return <PremiumShowcase />;
      default:
        return (
          <Dashboard 
            onNavigate={setView} 
            ucids={ucids} 
            vendors={vendors} 
            forensicIssues={forensicIssues} 
          />
        );
    }
  }

  return (
    <div className="flex h-screen overflow-hidden text-[#dde6ff] relative" style={{ backgroundColor: '#06080e' }}>
      {/* Centralized Global Overlay Loader */}
      {isPendingAPI && (
        <div className="fixed inset-0 bg-[#02050dd0] z-[9999] flex flex-col items-center justify-center backdrop-blur-md select-none touch-none animate-fadeIn">
          <div className="bg-[#0b1220] border border-indigo-500/20 p-8 rounded-2xl max-w-sm w-full text-center space-y-6 shadow-2xl relative">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10 pointer-events-none" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-sky-500 animate-spin" />
              <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white tracking-tight">System Sync Pending</h3>
              <p className="text-xs text-sky-400 font-mono font-bold animate-pulse uppercase">
                {pendingAPIMessage || 'Processing requested action...'}
              </p>
              <p className="text-[10px] text-gray-500 leading-normal max-w-xs mx-auto">
                Synchronizing direct pricing contracts and cross-validating telemetry scores. App navigation is restricted to prevent race conditions.
              </p>
            </div>
          </div>
        </div>
      )}

      <Sidebar
        activeView={view}
        onNavigate={(newView) => {
          setSearchQuery(''); // reset search when shifting tabs
          setView(newView);
        }}
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        activeMissionId={activeMissionId}
        onSelectMission={handleSelectMission}
        ucids={ucids}
        vendors={vendors}
        forensicIssues={forensicIssues}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar activeView={view} onSearch={setSearchQuery} onNavigate={setView} />
        <main className={`flex-1 overflow-hidden ${isFullHeight ? '' : 'overflow-y-auto'} p-6`}>
          {renderView()}
        </main>
      </div>
    </div>
  );
}
