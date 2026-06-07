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
import { SystemTelemetry } from './components/SystemTelemetry';
import { CleansingView } from './components/CleansingView';
import { TaxonomyGraphEditor } from './components/TaxonomyGraphEditor';
import { SolutionBuilder } from './components/SolutionBuilder';
import { IngestionHub } from './components/IngestionHub';
import { SearchView } from './components/SearchView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DataPersistenceGate } from './components/DataPersistenceGate';
import { StateConsistencyMonitor } from './components/StateConsistencyMonitor';
import { DocumentationView } from './components/review/DocumentationView';
import { BreadcrumbNav } from './components/BreadcrumbNav';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import type { AppView } from './types';

// Import baseline mock data
import {
  UCIDS as INITIAL_UCIDS,
  VENDORS as INITIAL_VENDORS,
  CATALOG_SKUS as INITIAL_SKUS,
  FORENSIC_ISSUES as INITIAL_ISSUES,
} from './components/mockData';

export default function App() {
  const [view, setView] = useLocalStorageState<AppView>('sys_active_view', 'dashboard');
  const [collapsed, setCollapsed] = useLocalStorageState('sys_sidebar_collapsed', false);
  const [activeMissionId, setActiveMissionId] = useLocalStorageState<string | undefined>('sys_active_mission', 'u1');

  // Shared Global Reactive State Hub (Persisted)
  const [ucids, setUcids] = useLocalStorageState('sys_ucids', INITIAL_UCIDS);
  const [vendors, setVendors] = useLocalStorageState('sys_vendors', INITIAL_VENDORS);
  const [catalogSkus, setCatalogSkus] = useLocalStorageState('sys_catalog_skus', INITIAL_SKUS);
  const [forensicIssues, setForensicIssues] = useLocalStorageState('sys_forensic_issues', INITIAL_ISSUES);
  
  // Central Application-Wide State for Pending API Calls
  const [isPendingAPI, setIsPendingAPI] = useState(false);
  const [pendingAPIMessage, setPendingAPIMessage] = useState('');
  const [apiProgress, setApiProgress] = useState(0);
  
  // Tab Switch Navigation Interception
  const [requestedView, setRequestedView] = useState<AppView | null>(null);

  // Compute sync health across DB state mock logic
  const ucidGaps = ucids.filter(u => !u.name || !u.projectRef).length;
  const vendorGaps = vendors.filter(v => !v.apiEndpoint || !v.syncInterval).length;
  const isHealthyState = ucidGaps === 0 && vendorGaps === 0;

  const syncHealth: { status: 'healthy'|'warning'|'error', message: string } = isHealthyState 
    ? { status: 'healthy', message: 'ALL SYSTEMS NOMINAL' }
    : { status: 'warning', message: `DATA DEGRADED [GAPS: ${ucidGaps + vendorGaps}]` };

  const handleNavigate = (newView: AppView) => {
    if (isPendingAPI) {
      setRequestedView(newView);
    } else {
      setView(newView);
    }
  };

  const confirmNavigation = () => {
    if (requestedView) {
      setView(requestedView);
      setRequestedView(null);
      setIsPendingAPI(false);
    }
  };

  const cancelNavigation = () => {
    setRequestedView(null);
  };
  
  // Track deployed solution context to reflect on LiveMission with specific banners/pill
  const [deployedSolution, setDeployedSolution] = useState<{
    name: string;
    ucidCount: number;
    timestamp: number;
  } | null>(null);

  // High-level topbar search query strings
  const [searchQuery, setSearchQuery] = useState('');

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
            setApiProgress={setApiProgress}
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
      case 'telemetry':
        return <SystemTelemetry />;
      case 'reports':
        return (
          <ReportsView 
            ucids={ucids} 
            setUcids={setUcids}
            vendors={vendors}
            setVendors={setVendors}
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
      case 'documentation':
        return <DocumentationView />;
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
    <div className="flex h-screen overflow-hidden text-[#dde6ff] font-sans antialiased relative" style={{ backgroundColor: '#06080e' }}>
      <Sidebar
        activeView={view}
        onNavigate={(newView) => {
          setSearchQuery(''); // reset search when shifting tabs
          handleNavigate(newView);
        }}
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        activeMissionId={activeMissionId}
        onSelectMission={handleSelectMission}
        ucids={ucids}
        vendors={vendors}
        forensicIssues={forensicIssues}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <TopBar 
          activeView={view} 
          onSearch={setSearchQuery} 
          onNavigate={handleNavigate}
          apiProgress={apiProgress}
          isPendingAPI={isPendingAPI}
          syncHealth={syncHealth}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8 shrink-0 min-h-0">
          <div className="max-w-7xl mx-auto flex flex-col min-h-full h-full">
            <BreadcrumbNav 
              view={view}
              activeMissionId={activeMissionId}
              ucids={ucids}
              onNavigate={handleNavigate}
            />
            <ErrorBoundary>
              <StateConsistencyMonitor ucids={ucids} vendors={vendors} catalogSkus={catalogSkus} />
              <DataPersistenceGate 
                ucids={ucids} 
                vendors={vendors} 
                catalogSkus={catalogSkus}
                isPendingAPI={isPendingAPI}
                requestedView={requestedView}
                onConfirmNavigation={confirmNavigation}
                onCancelNavigation={cancelNavigation}
              >
                {renderView()}
              </DataPersistenceGate>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
