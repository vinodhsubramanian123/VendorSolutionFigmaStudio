import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Sidebar } from "./components/layout/Sidebar";
import { TopBar } from "./components/layout/TopBar";
import { Dashboard } from "./components/dashboard/Dashboard";
import { LiveMission } from "./components/live-mission/LiveMission";
import { CatalogManager } from "./components/catalog/CatalogManager";
import { VendorPortal } from "./components/vendor-portal/VendorPortal";
import { ForensicView } from "./components/forensics/ForensicView";
import { ReportsView } from "./components/reports/ReportsView";
import { CleansingView } from "./components/cleansing/CleansingView";
import { TaxonomyGraphEditor } from "./components/taxonomy/TaxonomyGraphEditor";
import { SolutionBuilder } from "./components/solution-builder/SolutionBuilder";
import { IngestionHub } from "./components/ingestion/IngestionHub";
import { SearchView } from "./components/search/SearchView";
import { ReconciliationView } from "./components/reconciliation/ReconciliationView";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import { DataPersistenceGate } from "./components/shared/DataPersistenceGate";
import { BreadcrumbNav } from "./components/layout/BreadcrumbNav";
import { useLocalStorageState } from "./hooks/useLocalStorageState";
import type { AppView } from "./types";

// Import baseline mock data
import {
  UCIDS as INITIAL_UCIDS,
  VENDORS as INITIAL_VENDORS,
  CATALOG_SKUS as INITIAL_SKUS,
  FORENSIC_ISSUES as INITIAL_ISSUES,
} from "./lib/mockData";

export default function App() {
  const [view, setView] = useLocalStorageState<AppView>(
    "sys_active_view",
    "dashboard",
  );
  const [collapsed, setCollapsed] = useLocalStorageState(
    "sys_sidebar_collapsed",
    false,
  );
  const [activeMissionId, setActiveMissionId] = useLocalStorageState<
    string | undefined
  >("sys_active_mission", "u1");

  // Shared Global Reactive State Hub (Persisted)
  const [ucids, setUcids] = useLocalStorageState("sys_ucids", INITIAL_UCIDS);
  const [vendors, setVendors] = useLocalStorageState(
    "sys_vendors",
    INITIAL_VENDORS,
  );
  const [catalogSkus, setCatalogSkus] = useLocalStorageState(
    "sys_catalog_skus",
    INITIAL_SKUS,
  );
  const [forensicIssues, setForensicIssues] = useLocalStorageState(
    "sys_forensic_issues",
    INITIAL_ISSUES,
  );

  // Phase 3: The Forensic Auto-Heal Hook
  useEffect(() => {
    // EOL Risk
    const globalHasEol = ucids.some((u) =>
      u.solutions?.some((sol) =>
        sol.vendorSubmissions?.some((vs) =>
          vs.configs?.some((c) =>
            c.items?.some((it) => it.partNumber === "815100-B21")
          )
        )
      )
    );

    // Price Variance
    const globalHasPriceRisk = ucids.some((u) =>
      u.solutions?.some((sol) =>
        sol.vendorSubmissions?.some((vs) =>
          vs.configs?.some((c) =>
            c.items?.some((it) => it.partNumber === "400-BPSB" && it.unitPrice > 1190)
          )
        )
      )
    );

    // Cisco Memory Symmetry
    const globalHasCiscoRisk = ucids.some((u) =>
      u.solutions?.some((sol) =>
        sol.vendorSubmissions?.some((vs) =>
          vs.vendor === "Cisco" &&
          vs.configs?.some((c) =>
            c.items?.some((it) => it.type === "Memory" && it.quantity % 8 !== 0)
          )
        )
      )
    );
    
    // Juniper API state
    const globalHasJuniperIssue = vendors.some((v) => v.shortName === "Juniper" && v.status === "error");

    setForensicIssues((prev) => {
      let changed = false;
      const next = prev.map(issue => {
        let isResolved = false;
        if (issue.id === 'iss-1') isResolved = !globalHasEol;
        if (issue.id === 'iss-2') isResolved = !globalHasPriceRisk;
        if (issue.id === 'iss-3') isResolved = !globalHasCiscoRisk;
        if (issue.id === 'iss-4') isResolved = !globalHasJuniperIssue;

        if (isResolved && issue.status !== 'resolved') {
          changed = true;
          return { ...issue, status: 'resolved' as const };
        } else if (!isResolved && issue.status === 'resolved') {
          changed = true;
          return { ...issue, status: 'open' as const };
        }
        return issue;
      });
      return changed ? next : prev;
    });

  }, [ucids, vendors, setForensicIssues]);

  // Central Application-Wide State for Pending API Calls
  const [isPendingAPI, setIsPendingAPI] = useState(false);
  const [pendingAPIMessage, setPendingAPIMessage] = useState("");
  const [apiProgress, setApiProgress] = useState(0);

  // Tab Switch Navigation Interception
  const [requestedView, setRequestedView] = useState<AppView | null>(null);

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
  const [searchQuery, setSearchQuery] = useState("");

  function handleSelectMission(missionId: string) {
    setActiveMissionId(missionId);
    setSearchQuery("");
    setView("live-mission");
  }

  function renderView() {
    // If a search query is active, override standard view and display matched lookup indexes
    if (searchQuery.trim().length > 0) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-mono">
              Centralized matching result indices for pattern: "{searchQuery}"
            </span>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs px-2.5 py-1 rounded bg-surface-elevated border border-white/5 text-gray-400 hover:text-white cursor-pointer"
            >
              Clear Central Search
            </button>
          </div>
          <ErrorBoundary>
            <SearchView
              query={searchQuery}
              ucids={ucids}
              vendors={vendors}
              catalogSkus={catalogSkus}
              onNavigate={(newView) => {
                setSearchQuery("");
                setView(newView);
              }}
              onSelectMission={handleSelectMission}
            />
          </ErrorBoundary>
        </div>
      );
    }

    switch (view) {
      case "dashboard":
        return (
          <ErrorBoundary>
            <Dashboard
              onNavigate={setView}
              ucids={ucids}
              vendors={vendors}
              forensicIssues={forensicIssues}
            />
          </ErrorBoundary>
        );
      case "ingestion-hub":
        return (
          <ErrorBoundary>
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
          </ErrorBoundary>
        );
      case "live-mission":
        return (
          <ErrorBoundary>
            <LiveMission
              selectedId={activeMissionId}
              onSelectId={setActiveMissionId}
              ucids={ucids}
              setUcids={setUcids}
              deployedSolution={deployedSolution}
              setDeployedSolution={setDeployedSolution}
            />
          </ErrorBoundary>
        );
      case "catalog":
        return (
          <ErrorBoundary>
            <CatalogManager
              catalogSkus={catalogSkus}
              setCatalogSkus={setCatalogSkus}
              vendors={vendors}
            />
          </ErrorBoundary>
        );
      case "vendor-portal":
        return (
          <ErrorBoundary>
            <VendorPortal
              vendors={vendors}
              setVendors={setVendors}
              ucids={ucids}
              setUcids={setUcids}
            />
          </ErrorBoundary>
        );
      case "forensic":
        return (
          <ErrorBoundary>
            <ForensicView
              forensicIssues={forensicIssues}
              setForensicIssues={setForensicIssues}
              setVendors={setVendors}
              setCatalogSkus={setCatalogSkus}
              ucids={ucids}
              setUcids={setUcids}
              activeMissionId={activeMissionId}
              setActiveMissionId={setActiveMissionId}
              onNavigate={setView}
            />
          </ErrorBoundary>
        );
      case "reports":
        return (
          <ErrorBoundary>
            <ReportsView
              ucids={ucids}
              setUcids={setUcids}
              vendors={vendors}
              setVendors={setVendors}
              catalogSkus={catalogSkus}
            />
          </ErrorBoundary>
        );
      case "cleansing":
        return (
          <ErrorBoundary>
            <CleansingView
              forensicIssues={forensicIssues}
              setForensicIssues={setForensicIssues}
              catalogSkus={catalogSkus}
              ucids={ucids}
            />
          </ErrorBoundary>
        );
      case "taxonomy":
        return (
          <ErrorBoundary>
            <TaxonomyGraphEditor
              ucids={ucids}
              setUcids={setUcids}
              catalogSkus={catalogSkus}
              setCatalogSkus={setCatalogSkus}
              activeMissionId={activeMissionId}
              setActiveMissionId={setActiveMissionId}
            />
          </ErrorBoundary>
        );
      case "solution-builder":
        return (
          <ErrorBoundary>
            <SolutionBuilder
              ucids={ucids}
              setUcids={setUcids}
              onNavigate={setView}
              setDeployedSolution={setDeployedSolution}
              onSelectMission={handleSelectMission}
            />
          </ErrorBoundary>
        );
      case "reconciliation":
        return (
          <ErrorBoundary>
            <ReconciliationView
              ucids={ucids}
              setUcids={setUcids}
              catalogSkus={catalogSkus}
            />
          </ErrorBoundary>
        );
      case "search":
        return (
          <ErrorBoundary>
            <SearchView
              query=""
              ucids={ucids}
              vendors={vendors}
              catalogSkus={catalogSkus}
              onNavigate={handleNavigate}
              onSelectMission={handleSelectMission}
            />
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary>
            <Dashboard
              onNavigate={setView}
              ucids={ucids}
              vendors={vendors}
              forensicIssues={forensicIssues}
            />
          </ErrorBoundary>
        );
    }
  }

  return (
    <div
      className="flex h-screen overflow-hidden text-content-primary font-sans antialiased relative"
      style={{ backgroundColor: "#06080e" }}
    >
      <Sidebar
        activeView={view}
        onNavigate={(newView) => {
          setSearchQuery(""); // reset search when shifting tabs
          handleNavigate(newView);
        }}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
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
        />

        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 shrink-0">
          <div className="w-full flex flex-col min-h-full">
            <BreadcrumbNav
              view={view}
              activeMissionId={activeMissionId}
              ucids={ucids}
              onNavigate={handleNavigate}
            />
            <ErrorBoundary>
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
