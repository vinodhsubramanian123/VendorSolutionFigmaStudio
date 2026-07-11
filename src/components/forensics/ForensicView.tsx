import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ShieldCheck, Search } from "lucide-react";
import type { AppView } from "../../types";
import { ForensicHeader } from "./ForensicHeader";
import { ScannerOutput } from "./ScannerOutput";
import { ForensicIssueCard } from "./ForensicIssueCard";
import { ForensicSidebar } from "./ForensicSidebar";
import { SourcingRulesVault } from "./SourcingRulesVault";
import { LearningLoopFeed } from "./LearningLoopFeed";
import { AnimatedViewWrapper } from "../shared/AnimatedViewWrapper";
import { RuleClarificationModal } from "./RuleClarificationModal";
import { useForensicsLogic } from "./useForensicAutoHeal";
import { useCoreStore } from "../../store/coreStore";

interface ForensicViewProps {
  onNavigate?: (view: AppView) => void;
}

export function ForensicView(props: ForensicViewProps) {
  const ucids = useCoreStore((s) => s.ucids);
  const setActiveMissionId = useCoreStore((s) => s.setActiveMissionId);
  const {
    scanning,
    scanStdout,
    lastScanCount,
    sourcingRules,
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
  } = useForensicsLogic();

  const location = useLocation();
  const issueRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const issueId = params.get('issueId');
    if (issueId && issueRefs.current[issueId]) {
      // Small delay to allow render
      setTimeout(() => {
        issueRefs.current[issueId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Optional: We can add a brief flash effect or just rely on the scroll
      }, 100);
    }
  }, [location.search, openIssues]);

  if (ucids.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 bg-surface-elevated border border-white/5 rounded-xl gap-4 animate-fadeIn my-auto max-w-2xl mx-auto mt-12">
        <div className="w-16 h-16 rounded-full bg-status-success/10 flex items-center justify-center border border-status-success/20 text-status-success">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-content-primary">
            No Anomalies Detected
          </h2>
          <p className="text-xs text-content-secondary max-w-sm leading-normal">
            The current workspace cache is empty or all constraints have passed.
          </p>
        </div>
        <button type="button"
          onClick={() => props.onNavigate?.("ingestion-hub")}
          className="px-5 py-2.5 rounded-lg bg-brand-indigo hover:bg-brand-indigo text-content-primary font-bold cursor-pointer transition text-xs border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 shadow-lg shadow-indigo-500/15"
        >
          Return to Ingestion Hub
        </button>
      </div>
    );
  }

  return (
    <AnimatedViewWrapper>

      <ForensicHeader
        currUcid={currUcid}
        scanning={scanning}
        setActiveMissionId={setActiveMissionId}
        runAuditScanner={runAuditScanner}
      />

      <ScannerOutput scanning={scanning} scanStdout={scanStdout} />

      {/* Warnings & Issues split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main List */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1 shrink-0">
            <span className="text-xs text-content-secondary font-semibold uppercase tracking-wider">
              Discovered Sourcing Anomalies ({openIssues.length})
            </span>
            {lastScanCount !== null && (
              <span className="text-[10px] text-content-muted font-mono">
                Last diagnosis sweep scan matching: {lastScanCount} rules
              </span>
            )}
          </div>

          <div className="pr-1 space-y-3">
            {openIssues.length > 0 ? (
              openIssues.map((iss) => (
                <div key={iss.id} ref={el => { issueRefs.current[iss.id] = el; }}>
                  <ForensicIssueCard
                    issue={iss}
                    onAutoHeal={() => requestAutoHeal(iss.id)}
                    onManualPromote={() => handleManualPromote(iss)}
                  />
                </div>
              ))
            ) : (
              <div className="p-12 rounded-xl border border-dashed border-surface-elevated bg-surface-canvas/20 flex flex-col items-center justify-center gap-2 text-center h-full">
                <div className="w-16 h-16 rounded-full bg-status-success/10 flex items-center justify-center mb-2 border border-status-success/20">
                  <Search className="w-8 h-8 text-status-success" />
                </div>
                <h3 className="text-xl font-bold text-content-primary mb-1">
                  Audit Trail Clean
                </h3>
                <p className="text-sm text-content-muted max-w-sm">
                  No forensic anomalies or compliance violations detected. Your configurations are fully compliant.
                </p>
                {props.onNavigate && (
                  <button
                    type="button"
                    onClick={() => props.onNavigate?.("reconciliation")}
                    className="mt-4 px-5 py-2.5 rounded-lg bg-status-success/10 hover:bg-status-success/20 text-status-success font-bold text-xs border border-status-success/20 cursor-pointer transition-colors"
                  >
                    Proceed to Comparison Matrix →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

          <ForensicSidebar
            openIssuesCount={openIssues.length}
          />
        </div>

      {/* Sourcing Intelligence Policy Rules Vault */}
      <SourcingRulesVault
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
            openIssues.find(i => i.id === pendingHealIssueId)?.vendor ?? "Unknown"
          }
          proposedPart={
            openIssues.find(i => i.id === pendingHealIssueId)?.description.match(/[A-Z0-9]{4,20}-[A-Z0-9]{1,20}/)?.[0] ?? "Unknown Part"
          }
          onConfirm={confirmAutoHeal}
          onCancel={() => setPendingHealIssueId(null)}
        />
      )}
    </AnimatedViewWrapper>
  );
}