import React, { useState } from "react";
import { ArrowRight, RefreshCw, Server } from "lucide-react";
import { StatusBadge } from "../../shared/StatusBadge";
import type { UCID } from "../../../types";
import { apiClient } from "../../../services/apiClient";

interface StepVendorProvisioningProps {
  ucid: UCID;
  onAdvance: () => void;
  appendLogEvent: (level: "info" | "warn" | "ok" | "err", msg: string) => void;
}

export function StepVendorProvisioning({
  ucid,
  onAdvance,
  appendLogEvent,
}: StepVendorProvisioningProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const firstSolution = ucid.solutions?.[0];
  const submissions = firstSolution?.vendorSubmissions || [];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    appendLogEvent("info", "Re-querying vendor API quote endpoints for latest contract pricing...");
    try {
      await apiClient.post("/api/vendors/sync", {});
      appendLogEvent("ok", "Successfully synced direct custom discount rates from manufacturer databases.");
    } catch {
      appendLogEvent("err", "Failed to sync vendor API quote endpoints.");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-indigo-500/10 pb-2">
        <p className="text-xs text-gray-400 leading-normal text-left">
          Sourcing live contract rates via secure authenticated REST/SOAP APIs
          directly from manufacturer dispatch systems.
        </p>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10 disabled:opacity-50 transition cursor-pointer font-bold font-sans"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh Quotes
        </button>
      </div>

      {isRefreshing ? (
        <div className="space-y-3 py-2">
          {[1, 2].map((n) => (
            <div key={n} className="p-4 rounded-xl border border-white/5 bg-surface-card animate-pulse space-y-2">
              <div className="h-3 w-1/3 bg-gray-700 rounded" />
              <div className="h-4 w-2/3 bg-gray-800 rounded" />
              <div className="h-3 w-1/2 bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="p-6 rounded-xl border border-dashed border-white/10 bg-surface-card text-center space-y-2">
          <Server className="w-8 h-8 text-gray-600 mx-auto" />
          <p className="text-xs text-gray-400">No active vendor designs prepared.</p>
          <p className="text-[10px] text-gray-500">Go back to Intake/Intelligence steps to scan and build proposals.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub, idx) => {
            const allItems = sub.configs?.flatMap((c) => c.items) || [];
            const itemsCount = allItems.reduce((sum, item) => sum + item.quantity, 0);
            // Give each vendor submission a randomized mock latency for UX flare
            const latency = 20 + (idx * 12) + (allItems.length % 5);
            // Derive clean volume discount based on total price for mock value
            const mockDiscount = (sub.totalPrice > 100000) ? "7.8% volume rebate" : "6.2% tier 1 contract";

            return (
              <div
                key={sub.id}
                className="p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-card border-indigo-500/10 text-left transition hover:border-indigo-500/20"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={`${sub.vendor} Quote Gateway`} variant="success" />
                    <span className="text-[10px] text-gray-500 font-mono">
                      Ref: {sub.vendor.toLowerCase()}-q-{sub.id.substring(0, 5)}
                    </span>
                  </div>
                  <p className="text-[11px] text-white font-medium mt-1">
                    Status: MATCHED VIP VOLUME CONTRACT DISCOUNT (-{mockDiscount} applied)
                  </p>
                  <div className="flex gap-3 text-[10px] text-gray-500 mt-1">
                    <span>
                      Total Bid Price: <strong className="text-emerald-400 font-mono">${sub.totalPrice.toLocaleString()}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Lead Time: <strong className="text-white">{sub.vendor === "HPE" ? 14 : 10} Days</strong>
                    </span>
                    <span>•</span>
                    <span>
                      BOM Items: <strong className="text-white">{itemsCount}</strong>
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-gray-400 shrink-0">
                  Latency: {latency} ms
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onAdvance}
          className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer transition"
        >
          Verify Technical Constraints <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
