import React, { useState, useEffect, Suspense, useRef } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { tokens } from "./styles/tokens";
import { Sidebar } from "./components/layout/Sidebar";
import { TopBar } from "./components/layout/TopBar";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import { DataPersistenceGate } from "./components/shared/DataPersistenceGate";
import { BreadcrumbNav } from "./components/layout/BreadcrumbNav";
import { GlobalApiErrorListener } from "./components/shared/GlobalApiErrorListener";
import { useCoreStore } from "./store/coreStore";
import { ShimmerBlock } from "./components/shared/ShimmerBlock";
import type { AppView, Config } from "./types";
import { useForensicSync } from "./hooks/useForensicSync";

// Lazy-loaded Views
const Dashboard = React.lazy(() => import("./components/dashboard/Dashboard").then(m => ({ default: m.Dashboard })));
const MissionControl = React.lazy(() => import("./components/mission-control/MissionControl").then(m => ({ default: m.MissionControl })));
const CatalogManager = React.lazy(() => import("./components/catalog/CatalogManager").then(m => ({ default: m.CatalogManager })));
const VendorPortal = React.lazy(() => import("./components/vendor-portal/VendorPortal").then(m => ({ default: m.VendorPortal })));
const ForensicView = React.lazy(() => import("./components/forensics/ForensicView").then(m => ({ default: m.ForensicView })));
const SolutionBuilder = React.lazy(() => import("./components/solution-builder/SolutionBuilder").then(m => ({ default: m.SolutionBuilder })));
const SolutionManager = React.lazy(() => import("./components/solution-builder/SolutionManager").then(m => ({ default: m.SolutionManager })));
const SolutionDetail = React.lazy(() => import("./components/solution-builder/SolutionDetail").then(m => ({ default: m.SolutionDetail })));
const IngestionHub = React.lazy(() => import("./components/ingestion/IngestionHub").then(m => ({ default: m.IngestionHub })));
const SearchView = React.lazy(() => import("./components/search/SearchView").then(m => ({ default: m.SearchView })));
const ReconciliationView = React.lazy(() => import("./components/reconciliation/ReconciliationView").then(m => ({ default: m.ReconciliationView })));
const TaxonomyGraphView = React.lazy(() => import("./components/taxonomy/TaxonomyGraphView").then(m => ({ default: m.TaxonomyGraphView })));
const CleansingView = React.lazy(() => import("./components/cleansing/CleansingView").then(m => ({ default: m.CleansingView })));
const SystemTelemetry = React.lazy(() => import("./components/telemetry/SystemTelemetry").then(m => ({ default: m.SystemTelemetry })));

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const collapsed = useCoreStore(s => s.collapsed);
  const setCollapsed = useCoreStore(s => s.setCollapsed);
  const activeMissionId = useCoreStore(s => s.activeMissionId);
  const setActiveMissionId = useCoreStore(s => s.setActiveMissionId);

  // Shared Global Reactive State Hub (Persisted)
  const solutions = useCoreStore(s => s.solutions);
  const ucids = useCoreStore(s => s.ucids);
  const setUcids = useCoreStore(s => s.setUcids);
  const vendors = useCoreStore(s => s.vendors);
  const setVendors = useCoreStore(s => s.setVendors);
  const catalogSkus = useCoreStore(s => s.catalogSkus);
  const setCatalogSkus = useCoreStore(s => s.setCatalogSkus);
  const forensicIssues = useCoreStore(s => s.forensicIssues);
  const setForensicIssues = useCoreStore(s => s.setForensicIssues);
  const sourcingRules = useCoreStore(s => s.sourcingRules);
  const setSourcingRules = useCoreStore(s => s.setSourcingRules);
  const learningEvents = useCoreStore(s => s.learningEvents);
  const setLearningEvents = useCoreStore(s => s.setLearningEvents);

  // Graceful Migration of Snapshot objects inside ucids
  const hasMigratedSnapshots = useRef(false);
  useEffect(() => {
    if (hasMigratedSnapshots.current) return;
    setUcids((prevUcids) => {
      let migrated = false;
      const nextUcids = prevUcids.map((u) => {
        let uMigrated = false;
        const nextSnaps = (u.snapshots || []).map((s, idx) => {
          const fallbackVersion = s.version ?? (idx + 1);
          const fallbackTimestamp = s.timestamp ?? s.committedAt ?? new Date().toISOString();
          const fallbackLocked = s.locked ?? true;
          
          let fallbackBom: Config[] = s.bomSnapshot as Config[];
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

      hasMigratedSnapshots.current = true;
      return migrated ? nextUcids : prevUcids;
    });
  }, [setUcids]);

  // Phase 3: The Forensic Auto-Heal Hook
  useForensicSync();

  // Central Application-Wide State for Pending API Calls
  const [isPendingAPI, setIsPendingAPI] = useState(false);
  const [pendingAPIMessage, setPendingAPIMessage] = useState("");
  const [apiProgress, setApiProgress] = useState(0);

  // Tab Switch Navigation Interception
  const [requestedPath, setRequestedPath] = useState<string | null>(null);

  const handleNavigate = (path: string) => {
    if (isPendingAPI) {
      setRequestedPath(path);
    } else {
      navigate(path);
    }
  };

  const confirmNavigation = () => {
    if (requestedPath) {
      navigate(requestedPath);
      setRequestedPath(null);
      setIsPendingAPI(false);
    }
  };

  const cancelNavigation = () => {
    setRequestedPath(null);
  };

  // Track deployed solution context to reflect on MissionControl with specific banners/pill
  const [deployedSolution, setDeployedSolution] = useState<{
    name: string;
    ucidCount: number;
    timestamp: number;
  } | null>(null);

  // High-level topbar search query strings
  const [searchQuery, setSearchQuery] = useState("");

  // Determine current "view" string based on pathname for backwards compatibility in components like Sidebar
  const getCurrentViewString = (): AppView => {
    const path = location.pathname;
    if (path.startsWith("/mission-control")) return "mission-control";
    if (path.startsWith("/catalog")) return "catalog";
    if (path.startsWith("/vendor-portal")) return "vendor-portal";
    if (path.startsWith("/forensic")) return "forensic";
    if (path.startsWith("/solution-builder")) return "solution-builder";
    if (path.startsWith("/ingestion-hub")) return "ingestion-hub";
    if (path.startsWith("/search")) return "search";
    if (path.startsWith("/reconciliation")) return "reconciliation";
    if (path.startsWith("/taxonomy-graph")) return "taxonomy-graph";
    if (path.startsWith("/cleansing")) return "cleansing";
    if (path.startsWith("/telemetry")) return "telemetry";
    return "dashboard";
  };

  const currentViewString = getCurrentViewString();

  function handleSelectMission(missionId: string) {
    setActiveMissionId(missionId);
    setSearchQuery("");
    navigate(`/mission-control/${missionId}`);
  }

  // legacy onNavigate fallback
  const legacyNavigate = (viewStr: AppView) => {
    let p = "/";
    if (viewStr !== "dashboard") p = `/${viewStr}`;
    handleNavigate(p);
  };

  return (
    <>
      <GlobalApiErrorListener />
      <div
        className="flex h-screen overflow-hidden text-content-primary font-sans antialiased relative"
        style={{ backgroundColor: tokens.colors.background.appHeader }} 
      >
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        
        onSelectMission={handleSelectMission}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <TopBar
          activeView={currentViewString}
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
          onNavigate={(v: string) => legacyNavigate(v as AppView)}
          apiProgress={apiProgress}
          isPendingAPI={isPendingAPI}
          onSelectMission={handleSelectMission}
        />

        <main className="flex-1 overflow-auto p-4 md:p-5 lg:p-6 shrink-0">
          <div className="w-full flex flex-col min-h-full">
            <BreadcrumbNav
              view={currentViewString}
              
              ucids={ucids}
            />
            <ErrorBoundary>
              <DataPersistenceGate
                ucids={ucids}
                solutions={solutions}
                vendors={vendors}
                catalogSkus={catalogSkus}
                isPendingAPI={isPendingAPI}
                requestedView={requestedPath as AppView}
                onConfirmNavigation={confirmNavigation}
                onCancelNavigation={cancelNavigation}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="flex-1 flex flex-col min-h-full"
                  >
                    <Suspense fallback={<ShimmerBlock />}>
                      <Routes location={location}>
                        <Route path="/" element={<ErrorBoundary><Dashboard onNavigate={legacyNavigate} /></ErrorBoundary>} />
                        <Route path="/ingestion-hub" element={<ErrorBoundary><IngestionHub onNavigate={legacyNavigate} onSelectMission={handleSelectMission} isPendingAPI={isPendingAPI} setIsPendingAPI={setIsPendingAPI} pendingAPIMessage={pendingAPIMessage} setPendingAPIMessage={setPendingAPIMessage} setApiProgress={setApiProgress} /></ErrorBoundary>} />
                        <Route path="/mission-control/:id?" element={<ErrorBoundary><MissionControl selectedId={activeMissionId} onSelectId={setActiveMissionId} deployedSolution={deployedSolution} setDeployedSolution={setDeployedSolution} onNavigate={legacyNavigate} /></ErrorBoundary>} />
                        <Route path="/mission-control" element={<Navigate to={`/mission-control/${activeMissionId}`} replace />} />
                        <Route path="/catalog" element={<ErrorBoundary><CatalogManager /></ErrorBoundary>} />
                        <Route path="/vendor-portal" element={<ErrorBoundary><VendorPortal /></ErrorBoundary>} />
                        <Route path="/forensic" element={<ErrorBoundary><ForensicView  onNavigate={legacyNavigate} /></ErrorBoundary>} />
                        <Route path="/solutions" element={<ErrorBoundary><SolutionManager /></ErrorBoundary>} />
                        <Route path="/solutions/:id" element={<ErrorBoundary><SolutionDetail /></ErrorBoundary>} />
                        <Route path="/solution-builder" element={<ErrorBoundary><SolutionBuilder onNavigate={legacyNavigate} setDeployedSolution={setDeployedSolution} onSelectMission={handleSelectMission} /></ErrorBoundary>} />
                        <Route path="/reconciliation" element={<ErrorBoundary><ReconciliationView /></ErrorBoundary>} />
                        <Route path="/taxonomy-graph" element={<ErrorBoundary><TaxonomyGraphView /></ErrorBoundary>} />
                        <Route path="/cleansing" element={<ErrorBoundary><CleansingView /></ErrorBoundary>} />
                        <Route path="/telemetry" element={<ErrorBoundary><SystemTelemetry /></ErrorBoundary>} />
                        <Route path="/search" element={<ErrorBoundary><SearchView query={searchQuery} onNavigate={legacyNavigate} onSelectMission={handleSelectMission} onSearchChange={setSearchQuery} /></ErrorBoundary>} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Suspense>
                  </motion.div>
                </AnimatePresence>
              </DataPersistenceGate>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  </>
  );
}
