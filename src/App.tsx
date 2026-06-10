import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { tokens } from "./styles/tokens";
import { RefreshCw } from "lucide-react";
import { Sidebar } from "./components/layout/Sidebar";
import { TopBar } from "./components/layout/TopBar";
import { Dashboard } from "./components/dashboard/Dashboard";
import { MissionControl } from "./components/mission-control/MissionControl";
import { CatalogManager } from "./components/catalog/CatalogManager";
import { VendorPortal } from "./components/vendor-portal/VendorPortal";
import { ForensicView } from "./components/forensics/ForensicView";
import { SolutionBuilder } from "./components/solution-builder/SolutionBuilder";
import { IngestionHub } from "./components/ingestion/IngestionHub";
import { SearchView } from "./components/search/SearchView";
import { ReconciliationView } from "./components/reconciliation/ReconciliationView";
import { TaxonomyGraphView } from "./components/taxonomy/TaxonomyGraphView";
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

  // Graceful Migration of Snapshot objects inside ucids
  useEffect(() => {
    let migrated = false;
    const nextUcids = ucids.map((u) => {
      let uMigrated = false;
      const nextSnaps = (u.snapshots || []).map((s, idx) => {
        const fallbackVersion = s.version ?? (idx + 1);
        const fallbackTimestamp = s.timestamp ?? s.committedAt ?? new Date().toISOString();
        const fallbackLocked = s.locked ?? true;
        
        let fallbackBom: any[] = s.bomSnapshot;
        if (!fallbackBom) {
          if (s.payload && Array.isArray(s.payload)) {
            fallbackBom = s.payload[0]?.vendorSubmissions?.[0]?.configs || [];
          } else {
            fallbackBom = [];
          }
        }

        if (
          s.version !== fallbackVersion ||
          s.timestamp !== fallbackTimestamp ||
          s.locked !== fallbackLocked ||
          s.bomSnapshot === undefined
        ) {
          uMigrated = true;
          return {
            ...s,
            version: fallbackVersion,
            timestamp: fallbackTimestamp,
            locked: fallbackLocked,
            bomSnapshot: fallbackBom,
          };
        }
        return s;
      });

      if (uMigrated) {
        migrated = true;
        return {
          ...u,
          snapshots: nextSnaps,
        };
      }
      return u;
    });

    if (migrated) {
      setUcids(nextUcids);
    }
  }, [ucids, setUcids]);

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

  // Track deployed solution context to reflect on MissionControl with specific banners/pill
  const [deployedSolution, setDeployedSolution] = useState<{
    name: string;
    ucidCount: number;
    timestamp: number;
  } | null>(null);

  // High-level topbar search query strings
  const [searchQuery, setSearchQuery] = useState("");


  // Deep link routing
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/ucid/')) {
      const id = path.split('/')[2];
      if (id) {
        setActiveMissionId(id);
        setView('forensic'); // Prompt says "load ForensicView with UCID pre-selected"
      }
    } else if (path.startsWith('/config/')) {
      const id = path.split('/')[2];
      if (id) {
        // Here we could set configs but we don't have a state for it
        setView('solution-builder');
      }
    } else if (path.startsWith('/job/')) {
      const id = path.split('/')[2];
      if (id) {
        // pass job_id, just set view to ingestion hub for now
        setView('ingestion-hub');
      }
    }
  }, []);


  function handleSelectMission(missionId: string) {
    setActiveMissionId(missionId);
    setSearchQuery("");
    setView("mission-control");
  }

  function renderView() {
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
      case "mission-control":
        return (
          <ErrorBoundary>
            <MissionControl
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
              forensicIssues={forensicIssues}
              setForensicIssues={setForensicIssues}
              setVendors={setVendors}
            />
          </ErrorBoundary>
        );
      case "taxonomy-graph":
        return (
          <ErrorBoundary>
            <TaxonomyGraphView />
          </ErrorBoundary>
        );
      case "search":
        return (
          <ErrorBoundary>
            <SearchView
              query={searchQuery}
              ucids={ucids}
              vendors={vendors}
              catalogSkus={catalogSkus}
              onNavigate={handleNavigate}
              onSelectMission={handleSelectMission}
              onSearchChange={setSearchQuery}
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
      style={{ backgroundColor: tokens.colors.background.appHeader }} 
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
          searchQuery={searchQuery}
          onNavigate={handleNavigate}
          apiProgress={apiProgress}
          isPendingAPI={isPendingAPI}
          ucids={ucids}
          vendors={vendors}
          catalogSkus={catalogSkus}
          onSelectMission={handleSelectMission}
        />

        <main className="flex-1 overflow-auto p-4 md:p-5 lg:p-6 shrink-0">
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
                <AnimatePresence mode="wait">
                  <motion.div
                    key={view}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="flex-1 flex flex-col min-h-full"
                  >
                    {renderView()}
                  </motion.div>
                </AnimatePresence>
              </DataPersistenceGate>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
