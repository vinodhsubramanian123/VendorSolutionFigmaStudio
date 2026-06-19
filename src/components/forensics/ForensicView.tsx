import React from "react";
import { motion } from "motion/react";
import { ShieldCheck, Search } from "lucide-react";
import type { ForensicIssue, Vendor, CatalogSKU, UCID, SourcingRule, LearningEvent, AppView } from "../../types";
import { ForensicHeader } from "./ForensicHeader";
import { ScannerOutput } from "./ScannerOutput";
import { ForensicIssueCard } from "./ForensicIssueCard";
import { ForensicSidebar } from "./ForensicSidebar";
import { SourcingRulesVault } from "./SourcingRulesVault";
import { LearningLoopFeed } from "./LearningLoopFeed";
import { ErrorBoundary } from "../shared/ErrorBoundary";
import { ActiveSourcingRules } from "../../config/sourcingRules";
import { RuleClarificationModal } from "./RuleClarificationModal";
import { useForensicsLogic } from "./useForensicAutoHeal";

interface ForensicViewProps {
  forensicIssues: ForensicIssue[];
  setForensicIssues: React.Dispatch<React.SetStateAction<ForensicIssue[]>>;
  setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
  setCatalogSkus: React.Dispatch<React.SetStateAction<CatalogSKU[]>>;
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  activeMissionId?: string;
  setActiveMissionId: React.Dispatch<React.SetStateAction<string | undefined>>;
  onNavigate?: (view: AppView) => void;
  sourcingRules: SourcingRule[];
  setSourcingRules: React.Dispatch<React.SetStateAction<SourcingRule[]>>;
  learningEvents: LearningEvent[];
  setLearningEvents: React.Dispatch<React.SetStateAction<LearningEvent[]>>;
}

export function ForensicView(props: ForensicViewProps) {
  const {
    scanning,
    scanStdout,
    lastScanCount,
    sourcingRules,
    setSourcingRules,
    prefillRule,
    setPrefillRule,
    learningEvents,
    setLearningEvents,
    currUcid,
    openIssues,
    triggerToast,
    runAuditScanner,
    requestAutoHeal,
    confirmAutoHeal,
    handleManualPromote,
    pendingHealIssueId,
    setPendingHealIssueId,
  } = useForensicsLogic(props);

  if (props.ucids.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 bg-surface-elevated border border-white/5 rounded-xl gap-4 animate-fadeIn my-auto max-w-2xl mx-auto mt-12">
        <div className="w-16 h-16 rounded-full bg-status-success/10 flex items-center justify-center border border-status-success/20 text-status-success">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-white">
            No Anomalies Detected
          </h2>
          <p className="text-xs text-gray-400 max-w-sm leading-normal">
            The current workspace cache is empty or all constraints have passed.
          </p>
        </div>
        <button type="button"
          onClick={() => props.onNavigate?.("ingestion-hub")}
          className="px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-bold cursor-pointer transition text-xs border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 shadow-lg shadow-indigo-500/15"
        >
          Return to Ingestion Hub
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <motion.div 
        className="flex flex-col gap-4"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", staggerChildren: 0.1 }}
      >

      <ForensicHeader
        currUcid={currUcid}
        ucids={props.ucids}
        scanning={scanning}
        setActiveMissionId={props.setActiveMissionId}
        runAuditScanner={runAuditScanner}
      />

      <ScannerOutput scanning={scanning} scanStdout={scanStdout} />

      {/* Warnings & Issues split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main List */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1 shrink-0">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Discovered Sourcing Anomalies ({openIssues.length})
            </span>
            {lastScanCount !== null && (
              <span className="text-[10px] text-gray-500 font-mono">
                Last diagnosis sweep scan matching: {lastScanCount} rules
              </span>
            )}
          </div>

          <div className="pr-1 space-y-3">
            {openIssues.length > 0 ? (
              openIssues.map((iss) => (
                <ForensicIssueCard
                  key={iss.id}
                  issue={iss}
                  onAutoHeal={() => requestAutoHeal(iss.id)}
                  onManualPromote={() => handleManualPromote(iss)}
                />
              ))
            ) : (
              <div className="p-12 rounded-xl border border-dashed border-gray-800 bg-black/20 flex flex-col items-center justify-center gap-2 text-center h-full">
                <div className="w-16 h-16 rounded-full bg-status-success/10 flex items-center justify-center mb-2 border border-status-success/20">
                  <Search className="w-8 h-8 text-status-success" />
                </div>
                <h3 className="text-xl font-bold text-content-primary mb-1">
                  Audit Trail Clean
                </h3>
                <p className="text-sm text-content-muted max-w-sm">
                  No forensic anomalies or compliance violations detected.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Audit reports sidebar */}
          <ForensicSidebar
            openIssuesCount={openIssues.length}
            forensicIssues={props.forensicIssues}
          />
        </div>

      {/* Sourcing Intelligence Policy Rules Vault */}
      <SourcingRulesVault
        sourcingRules={sourcingRules}
        setSourcingRules={setSourcingRules}
        triggerToast={triggerToast}
        prefillRule={prefillRule}
        onPrefillConsumed={() => setPrefillRule(null)}
      />

      {/* Intelligence Learning Loop Feed — visible telemetry of everything the system has learned */}
      <LearningLoopFeed
        learningEvents={learningEvents}
        activeRuleCount={sourcingRules.filter((r) => r.status === "active").length}
        onMarkReviewed={(eventId) => {
          setLearningEvents((prev) => prev.filter((e) => e.id !== eventId));
          triggerToast("Learning event acknowledged and archived.", "success");
        }}
      />

      {pendingHealIssueId && (
        <RuleClarificationModal
          proposedVendor={
            pendingHealIssueId === "iss-1" ? "HPE" :
            pendingHealIssueId === "iss-2" ? "Dell" :
            pendingHealIssueId === "iss-3" ? "Cisco" : "Juniper"
          }
          proposedPart={
            pendingHealIssueId === "iss-1" ? ActiveSourcingRules.legacySKUs[0] :
            pendingHealIssueId === "iss-2" ? "400-BPSB" :
            pendingHealIssueId === "iss-3" ? "Memory" : "Juniper API"
          }
          onConfirm={confirmAutoHeal}
          onCancel={() => setPendingHealIssueId(null)}
        />
      )}
      </motion.div>
    </ErrorBoundary>
  );
}