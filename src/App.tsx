import React, { useState, useEffect, Suspense } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { tokens } from "./styles/tokens";
import { Sidebar } from "./components/layout/Sidebar";
import { TopBar } from "./components/layout/TopBar";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import { DataPersistenceGate } from "./components/shared/DataPersistenceGate";
import { BreadcrumbNav } from "./components/layout/BreadcrumbNav";
import { GlobalApiErrorListener } from "./components/shared/GlobalApiErrorListener";
import { useLocalStorageState } from "./hooks/useLocalStorageState";
import { ShimmerBlock } from "./components/shared/ShimmerBlock";
import type { AppView } from "./types";

// Import baseline mock data
import {
  UCIDS as INITIAL_UCIDS,
  VENDORS as INITIAL_VENDORS,
  CATALOG_SKUS as INITIAL_SKUS,
  FORENSIC_ISSUES as INITIAL_ISSUES,
} from "./lib/mockData";
import type { Config, SourcingRule, LearningEvent } from "./types";
import { ActiveSourcingRules } from "./config/sourcingRules";
import { INITIAL_RULES } from "./mocks/sourcingMocks";

// Lazy-loaded Views
const Dashboard = React.lazy(() => import("./components/dashboard/Dashboard").then(m => ({ default: m.Dashboard })));
const MissionControl = React.lazy(() => import("./components/mission-control/MissionControl").then(m => ({ default: m.MissionControl })));
const CatalogManager = React.lazy(() => import("./components/catalog/CatalogManager").then(m => ({ default: m.CatalogManager })));
const VendorPortal = React.lazy(() => import("./components/vendor-portal/VendorPortal").then(m => ({ default: m.VendorPortal })));
const ForensicView = React.lazy(() => import("./components/forensics/ForensicView").then(m => ({ default: m.ForensicView })));
const SolutionBuilder = React.lazy(() => import("./components/solution-builder/SolutionBuilder").then(m => ({ default: m.SolutionBuilder })));
const IngestionHub = React.lazy(() => import("./components/ingestion/IngestionHub").then(m => ({ default: m.IngestionHub })));
const SearchView = React.lazy(() => import("./components/search/SearchView").then(m => ({ default: m.SearchView })));
const ReconciliationView = React.lazy(() => import("./components/reconciliation/ReconciliationView").then(m => ({ default: m.ReconciliationView })));
const TaxonomyGraphView = React.lazy(() => import("./components/taxonomy/TaxonomyGraphView").then(m => ({ default: m.TaxonomyGraphView })));
const CleansingView = React.lazy(() => import("./components/cleansing/CleansingView").then(m => ({ default: m.CleansingView })));
const SystemTelemetry = React.lazy(() => import("./components/telemetry/SystemTelemetry").then(m => ({ default: m.SystemTelemetry })));

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useLocalStorageState(
    "sys_sidebar_collapsed",
    false,
  );
  const [activeMissionId, setActiveMissionId] = useLocalStorageState<
    string | undefined
  >("sys_active_mission", "u1");

  // Shared Global Reactive State Hub (Persisted)
  const [ucids, setUcids] = useLocalStorageState<typeof INITIAL_UCIDS>("sys_ucids", INITIAL_UCIDS);
  const [vendors, setVendors] = useLocalStorageState(
    "sys_vendors",
    INITIAL_VENDORS,
  );
  const [catalogSkus, setCatalogSkus] = useLocalStorageState(
    "sys_catalog_skus",
    INITIAL_SKUS,
  );
  const [forensicIssues, setForensicIssues] = useLocalStorageState<typeof INITIAL_ISSUES>(
    "sys_forensic_issues",
    INITIAL_ISSUES,
  );
  const [sourcingRules, setSourcingRules] = useLocalStorageState<SourcingRule[]>(
    "sys_sourcing_intel_rules",
    INITIAL_RULES
  );
  const [learningEvents, setLearningEvents] = useLocalStorageState<LearningEvent[]>(
    "sys_learning_events",
    []
  );

  // Graceful Migration of Snapshot objects inside ucids
  useEffect(() => {
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

      return migrated ? nextUcids : prevUcids;
    });
  }, [setUcids]);


  // Phase 3: The Forensic Auto-Heal Hook
  useEffect(() => {
    // EOL Risk
    const globalHasEol = ucids.some((u) =>
      u.solutions?.some((sol) =>
        sol.vendorSubmissions?.some((vs) =>
          vs.configs?.some((c) =>
            c.items?.some((it) => ActiveSourcingRules.legacySKUs.includes(it.partNumber))
          )
        )
      )
    );


    if (globalHasEol) {
      ucids.forEach(u => {
        u.solutions?.forEach(sol => {
          sol.vendorSubmissions?.forEach(vs => {
            vs.configs?.forEach(c => {
              c.items?.forEach(it => {
                if (ActiveSourcingRules.legacySKUs.includes(it.partNumber)) {

                }
              });
            });
          });
        });
      });
    }

    // Price Variance
    const globalHasPriceRisk = ucids.some((u) =>
      u.solutions?.some((sol) =>
        sol.vendorSubmissions?.some((vs) =>
          vs.configs?.some((c) =>
            c.items?.some((it) => it.partNumber === ActiveSourcingRules.thresholds.dellOverchargeSKU && it.unitPrice > ActiveSourcingRules.thresholds.dellOverchargeBaseLimit)
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
            c.items?.some((it) => it.type === "Memory" && it.quantity % ActiveSourcingRules.thresholds.ciscoMemorySymmetryDivisor !== 0)
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
        activeMissionId={activeMissionId}
        onSelectMission={handleSelectMission}
        ucids={ucids}
        vendors={vendors}
        forensicIssues={forensicIssues}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <TopBar
          activeView={currentViewString}
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
          onNavigate={(v: string) => legacyNavigate(v as AppView)}
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
              view={currentViewString}
              activeMissionId={activeMissionId}
              ucids={ucids}
            />
            <ErrorBoundary>
              <DataPersistenceGate
                ucids={ucids}
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
                        <Route path="/" element={<ErrorBoundary><Dashboard onNavigate={legacyNavigate} ucids={ucids} vendors={vendors} forensicIssues={forensicIssues} /></ErrorBoundary>} />
                        <Route path="/ingestion-hub" element={<ErrorBoundary><IngestionHub ucids={ucids} setUcids={setUcids} onNavigate={legacyNavigate} onSelectMission={handleSelectMission} isPendingAPI={isPendingAPI} setIsPendingAPI={setIsPendingAPI} pendingAPIMessage={pendingAPIMessage} setPendingAPIMessage={setPendingAPIMessage} setApiProgress={setApiProgress} /></ErrorBoundary>} />
                        <Route path="/mission-control/:id?" element={<ErrorBoundary><MissionControl selectedId={activeMissionId} onSelectId={setActiveMissionId} ucids={ucids} setUcids={setUcids} deployedSolution={deployedSolution} setDeployedSolution={setDeployedSolution} onNavigate={legacyNavigate} /></ErrorBoundary>} />
                        <Route path="/mission-control" element={<Navigate to={`/mission-control/${activeMissionId}`} replace />} />
                        <Route path="/catalog" element={<ErrorBoundary><CatalogManager catalogSkus={catalogSkus} setCatalogSkus={setCatalogSkus} vendors={vendors} /></ErrorBoundary>} />
                        <Route path="/vendor-portal" element={<ErrorBoundary><VendorPortal vendors={vendors} setVendors={setVendors} ucids={ucids} setUcids={setUcids} catalogSkus={catalogSkus} sourcingRules={sourcingRules} setSourcingRules={setSourcingRules} learningEvents={learningEvents} setLearningEvents={setLearningEvents} /></ErrorBoundary>} />
                        <Route path="/forensic" element={<ErrorBoundary><ForensicView forensicIssues={forensicIssues} setForensicIssues={setForensicIssues} setVendors={setVendors} setCatalogSkus={setCatalogSkus} ucids={ucids} setUcids={setUcids} activeMissionId={activeMissionId} setActiveMissionId={setActiveMissionId} onNavigate={legacyNavigate} sourcingRules={sourcingRules} setSourcingRules={setSourcingRules} learningEvents={learningEvents} setLearningEvents={setLearningEvents} /></ErrorBoundary>} />
                        <Route path="/solution-builder" element={<ErrorBoundary><SolutionBuilder ucids={ucids} setUcids={setUcids} onNavigate={legacyNavigate} setDeployedSolution={setDeployedSolution} onSelectMission={handleSelectMission} /></ErrorBoundary>} />
                        <Route path="/reconciliation" element={<ErrorBoundary><ReconciliationView ucids={ucids} setUcids={setUcids} catalogSkus={catalogSkus} forensicIssues={forensicIssues} setForensicIssues={setForensicIssues} setVendors={setVendors} /></ErrorBoundary>} />
                        <Route path="/taxonomy-graph" element={<ErrorBoundary><TaxonomyGraphView catalogSkus={catalogSkus} setCatalogSkus={setCatalogSkus} vendors={vendors} /></ErrorBoundary>} />
                        <Route path="/cleansing" element={<ErrorBoundary><CleansingView catalogSkus={catalogSkus} /></ErrorBoundary>} />
                        <Route path="/telemetry" element={<ErrorBoundary><SystemTelemetry /></ErrorBoundary>} />
                        <Route path="/search" element={<ErrorBoundary><SearchView query={searchQuery} ucids={ucids} vendors={vendors} catalogSkus={catalogSkus} onNavigate={legacyNavigate} onSelectMission={handleSelectMission} onSearchChange={setSearchQuery} /></ErrorBoundary>} />
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
