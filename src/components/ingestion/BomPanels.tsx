import React from "react";
import { Settings, ShieldCheck, AlertTriangle, Layers, Info, Zap, DollarSign, Clock, CheckCircle } from "lucide-react";
import { StatusBadge } from "../shared/StatusBadge";
import type { ConstraintCheckResponse, ReconciliationResponse } from "../../types";

interface BomPhysicalConstraintsPanelProps {
  bomVerifyResult: ConstraintCheckResponse;
}

export function BomPhysicalConstraintsPanel({ bomVerifyResult }: BomPhysicalConstraintsPanelProps) {
  return (
    <div className="bg-surface-card rounded-lg border border-white/5 p-4 space-y-4">
      <div className="flex justify-between items-center text-left">
        <span className="text-[10px] text-content-secondary font-mono block uppercase tracking-wider font-extrabold flex items-center gap-1.5 text-left">
          <Settings className="w-3.5 h-3.5 text-sky-400" />{" "}
          Physical Hardware Constraints Verification
        </span>
        <StatusBadge 
          status={bomVerifyResult.isCompliant ? "TAXO COMPLIANT" : "WARNING CRITERIAS DETECTED"} 
          variant={bomVerifyResult.isCompliant ? "success" : "warning"} 
          size="md" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[10px] text-left">
        <SocketAlignmentPanel socketMatch={bomVerifyResult.socketMatch} />
        <PowerLimitPanel powerLimitTest={bomVerifyResult.powerLimitTest} />
        <MemoryBalancePanel memoryBalanceCheck={bomVerifyResult.memoryBalanceCheck} />
      </div>
    </div>
  );
}

function SocketAlignmentPanel({ socketMatch }: { socketMatch: ConstraintCheckResponse["socketMatch"] }) {
  return (
    <div className="p-3 bg-surface-canvas/30 rounded border border-white/5 space-y-2 text-left">
      <div className="flex items-center justify-between text-[9px] text-content-secondary">
        <span>Socket Alignment</span>
        {socketMatch?.status === "compatible" ? (
          <CheckCircle className="w-3.5 h-3.5 text-status-success" />
        ) : (
          <AlertTriangle className="w-3.5 h-3.5 text-status-warning animate-pulse" />
        )}
      </div>
      <div className="text-[10px] space-y-1">
        <p className="text-content-primary font-bold">
          {socketMatch?.chassisSocket} Sockets matched.
        </p>
        <p className="text-content-primary0 leading-normal">
          {socketMatch?.description}
        </p>
      </div>
    </div>
  );
}

function PowerLimitPanel({ powerLimitTest }: { powerLimitTest: ConstraintCheckResponse["powerLimitTest"] }) {
  return (
    <div className="p-3 bg-surface-canvas/30 rounded border border-white/5 space-y-2 text-left">
      <div className="flex items-center justify-between text-[9px] text-content-secondary">
        <span>Energy Draw TDP Budget</span>
        {powerLimitTest?.passed ? (
          <CheckCircle className="w-3.5 h-3.5 text-status-success" />
        ) : (
          <AlertTriangle className="w-3.5 h-3.5 text-status-warning animate-pulse" />
        )}
      </div>
      <div className="text-[10px] space-y-1">
        <p className="text-content-primary font-bold">
          Estimated: {powerLimitTest?.estimatedTdpWatts} Watts
        </p>
        <p className="text-content-primary0">
          Max limit: {powerLimitTest?.maxSupportedWatts}W
        </p>
        <p className="text-status-success">
          Safety margin: {powerLimitTest?.marginWatts}W
        </p>
      </div>
    </div>
  );
}

function MemoryBalancePanel({ memoryBalanceCheck }: { memoryBalanceCheck: ConstraintCheckResponse["memoryBalanceCheck"] }) {
  return (
    <div className="p-3 bg-surface-canvas/30 rounded border border-white/5 space-y-2 text-left">
      <div className="flex items-center justify-between text-[9px] text-content-secondary">
        <span>RAM Channel Balance</span>
        {memoryBalanceCheck?.passed && !memoryBalanceCheck?.recommendsCorrection ? (
          <CheckCircle className="w-3.5 h-3.5 text-status-success" />
        ) : (
          <AlertTriangle className="w-3.5 h-3.5 text-status-warning animate-pulse" />
        )}
      </div>
      <div className="text-[10px] space-y-1">
        <p className="text-content-primary font-bold">
          DDR5 Lanes Count: {memoryBalanceCheck?.quantity}
        </p>
        <p className="text-content-primary0">
          Optimal Layout: {memoryBalanceCheck?.optimalLayoutSymmetry}
        </p>
        <p className="text-status-warning text-[9.5px] leading-tight">
          {memoryBalanceCheck?.message}
        </p>
      </div>
    </div>
  );
}

interface BomReconstructionMatrixProps {
  bomReconResult: ReconciliationResponse;
}

export function BomReconstructionMatrix({ bomReconResult }: BomReconstructionMatrixProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-surface-card rounded-lg border border-white/5 p-4 space-y-4 text-left">
        <span className="text-[10px] text-content-secondary font-mono block uppercase tracking-wider font-extrabold flex items-center gap-1.5 text-left">
          <Layers className="w-3.5 h-3.5 text-brand-indigo" /> API Reconstruction Matrix Summary
        </span>
        <div className="space-y-2 text-[10px] leading-relaxed">
          <div className="flex items-start gap-2 text-content-secondary">
            <Info className="w-4 h-4 text-brand-indigo shrink-0 mt-0.5" />
            <p>
              The contract reconciliation compares individual distributor unit quotes with canonical manufacturer direct API specifications.
            </p>
          </div>
          <div className="flex items-start gap-2 text-content-secondary">
            <Zap className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
            <p>
              Identified <strong className="text-content-primary">{bomReconResult?.discrepancyCount || 2} cost discrepancies</strong> between local quotation spreadsheets and central pricing ledgers.
            </p>
          </div>
          <div className="flex items-start gap-2 text-content-secondary">
            <ShieldCheck className="w-4 h-4 text-brand-indigo shrink-0 mt-0.5" />
            <p>
              Updates committed configuration snapshots to <strong className="text-status-success font-bold">"Synced" status</strong> inside central datastores automatically.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-lg bg-surface-card border border-white/5 flex gap-3 items-center text-left">
            <div className="w-8 h-8 rounded-lg bg-status-success/10 border border-status-success/20 text-status-success flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] text-content-primary0 uppercase tracking-tight">reconciled savings value</p>
              <p className="text-sm font-black font-mono text-status-success">${bomReconResult.metrics?.totalSavingsUSD?.toLocaleString()}</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-surface-card border border-white/5 flex gap-3 items-center text-left">
            <div className="w-8 h-8 rounded-lg bg-status-warning/10 border border-status-warning/20 text-status-warning flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] text-content-primary0 uppercase tracking-tight">rebuild latency impact</p>
              <p className="text-sm font-black font-mono">{bomReconResult.matrix[0]?.leadTimeBottleneckDays || 45} days</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-surface-card border border-white/5 flex gap-3 items-center text-left">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] text-content-primary0 uppercase tracking-tight">Compliance Score verified</p>
              <p className="text-sm font-black font-mono text-sky-300">{bomReconResult.matrix[0]?.deliveryConfidenceRating || 100}%</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-canvas/20 rounded-lg border border-white/5 p-4 text-left overflow-x-auto">
          <p className="text-[9px] text-content-primary0 uppercase tracking-widest font-black block mb-2">Cost variance matrix check</p>
          <table className="w-full text-left border-collapse text-[10px] min-w-[500px]">
            <thead>
              <tr className="border-b border-white/5 text-content-primary0 font-mono">
                <th className="pb-2">SPEC SOLUTION ID</th>
                <th className="pb-2">SUPPLIER</th>
                <th className="pb-2">BASE LIST VALUE</th>
                <th className="pb-2">NEGOTIATED CONTRACT</th>
                <th className="pb-2 text-right">CONTRACT DISCOUNT DELTA %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {bomReconResult.matrix?.map((row, idx) => (
                <tr key={idx} className="font-mono text-content-secondary hover:text-content-primary">
                  <td className="py-2.5 font-bold">{row.solutionId}</td>
                  <td className="py-2.5 text-content-primary font-semibold">{row.vendor}</td>
                  <td className="py-2.5 text-content-secondary">${row.baseCost?.toLocaleString()}</td>
                  <td className="py-2.5 font-bold text-status-success">${row.negotiatedContractCost?.toLocaleString()}</td>
                  <td className="py-2.5 text-right font-black text-content-primary">{row.variancePercentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
