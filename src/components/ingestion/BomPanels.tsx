import React from "react";
import { Settings, ShieldCheck, AlertTriangle, Layers, Info, Zap, DollarSign, Clock, CheckCircle } from "lucide-react";
import { StatusBadge } from "../shared/StatusBadge";
import type { ConstraintCheckResponse, ReconciliationResponse } from "../../types";

interface BomPhysicalConstraintsPanelProps {
  bomVerifyResult: ConstraintCheckResponse;
}

// eslint-disable-next-line complexity
export function BomPhysicalConstraintsPanel({ bomVerifyResult }: BomPhysicalConstraintsPanelProps) {
  return (
    <div className="bg-surface-card rounded-lg border border-white/5 p-4 space-y-4">
      <div className="flex justify-between items-center text-left">
        <span className="text-[10px] text-gray-400 font-mono block uppercase tracking-wider font-extrabold flex items-center gap-1.5 text-left">
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
        <div className="p-3 bg-black/30 rounded border border-white/5 space-y-2 text-left">
          <div className="flex items-center justify-between text-[9px] text-gray-400">
            <span>Socket Alignment</span>
            {bomVerifyResult.socketMatch?.status === "compatible" ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
            )}
          </div>
          <div className="text-[10px] space-y-1">
            <p className="text-white font-bold">
              {bomVerifyResult.socketMatch?.chassisSocket} Sockets matched.
            </p>
            <p className="text-gray-500 leading-normal">
              {bomVerifyResult.socketMatch?.description}
            </p>
          </div>
        </div>

        <div className="p-3 bg-black/30 rounded border border-white/5 space-y-2 text-left">
          <div className="flex items-center justify-between text-[9px] text-gray-400">
            <span>Energy Draw TDP Budget</span>
            {bomVerifyResult.powerLimitTest?.passed ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            )}
          </div>
          <div className="text-[10px] space-y-1">
            <p className="text-white font-bold">
              Estimated: {bomVerifyResult.powerLimitTest?.estimatedTdpWatts} Watts
            </p>
            <p className="text-gray-500">
              Max limit: {bomVerifyResult.powerLimitTest?.maxSupportedWatts}W
            </p>
            <p className="text-emerald-400">
              Safety margin: {bomVerifyResult.powerLimitTest?.marginWatts}W
            </p>
          </div>
        </div>

        <div className="p-3 bg-black/30 rounded border border-white/5 space-y-2 text-left">
          <div className="flex items-center justify-between text-[9px] text-gray-400">
            <span>RAM Channel Balance</span>
            {bomVerifyResult.memoryBalanceCheck?.passed && !bomVerifyResult.memoryBalanceCheck?.recommendsCorrection ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
            )}
          </div>
          <div className="text-[10px] space-y-1">
            <p className="text-white font-bold">
              DDR5 Lanes Count: {bomVerifyResult.memoryBalanceCheck?.quantity}
            </p>
            <p className="text-gray-500">
              Optimal Layout: {bomVerifyResult.memoryBalanceCheck?.optimalLayoutSymmetry}
            </p>
            <p className="text-amber-400 text-[9.5px] leading-tight">
              {bomVerifyResult.memoryBalanceCheck?.message}
            </p>
          </div>
        </div>
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
        <span className="text-[10px] text-gray-400 font-mono block uppercase tracking-wider font-extrabold flex items-center gap-1.5 text-left">
          <Layers className="w-3.5 h-3.5 text-indigo-400" /> API Reconstruction Matrix Summary
        </span>
        <div className="space-y-2 text-[10px] leading-relaxed">
          <div className="flex items-start gap-2 text-gray-400">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p>
              The contract reconciliation compares individual distributor unit quotes with canonical manufacturer direct API specifications.
            </p>
          </div>
          <div className="flex items-start gap-2 text-gray-400">
            <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              Identified <strong className="text-white">{bomReconResult?.discrepancyCount || 2} cost discrepancies</strong> between local quotation spreadsheets and central pricing ledgers.
            </p>
          </div>
          <div className="flex items-start gap-2 text-gray-400">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p>
              Updates committed configuration snapshots to <strong className="text-emerald-400 font-bold">"Synced" status</strong> inside central datastores automatically.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-lg bg-surface-card border border-white/5 flex gap-3 items-center text-left">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] text-gray-500 uppercase tracking-tight">reconciled savings value</p>
              <p className="text-sm font-black font-mono text-emerald-400">${bomReconResult.metrics?.totalSavingsUSD?.toLocaleString()}</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-surface-card border border-white/5 flex gap-3 items-center text-left">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] text-gray-500 uppercase tracking-tight">rebuild latency impact</p>
              <p className="text-sm font-black font-mono">{bomReconResult.matrix[0]?.leadTimeBottleneckDays || 45} days</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-surface-card border border-white/5 flex gap-3 items-center text-left">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] text-gray-500 uppercase tracking-tight">Compliance Score verified</p>
              <p className="text-sm font-black font-mono text-sky-300">{bomReconResult.matrix[0]?.deliveryConfidenceRating || 100}%</p>
            </div>
          </div>
        </div>

        <div className="bg-black/20 rounded-lg border border-white/5 p-4 text-left overflow-x-auto">
          <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black block mb-2">Cost variance matrix check</p>
          <table className="w-full text-left border-collapse text-[10px] min-w-[500px]">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 font-mono">
                <th className="pb-2">SPEC SOLUTION ID</th>
                <th className="pb-2">SUPPLIER</th>
                <th className="pb-2">BASE LIST VALUE</th>
                <th className="pb-2">NEGOTIATED CONTRACT</th>
                <th className="pb-2 text-right">CONTRACT DISCOUNT DELTA %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {bomReconResult.matrix?.map((row, idx) => (
                <tr key={idx} className="font-mono text-gray-300 hover:text-white">
                  <td className="py-2.5 font-bold">{row.solutionId}</td>
                  <td className="py-2.5 text-white font-semibold">{row.vendor}</td>
                  <td className="py-2.5 text-gray-400">${row.baseCost?.toLocaleString()}</td>
                  <td className="py-2.5 font-bold text-emerald-400">${row.negotiatedContractCost?.toLocaleString()}</td>
                  <td className="py-2.5 text-right font-black text-white">{row.variancePercentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
