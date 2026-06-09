import React, { useState, useEffect } from "react";
import {
  Globe,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import type { Vendor, UCID } from "../../types";
import { VendorIngestionDesk } from "./VendorIngestionDesk";
import { VendorGateways } from "./VendorGateways";
import { ErrorBoundary } from "../shared/ErrorBoundary";

interface VendorPortalProps {
  vendors: Vendor[];
  setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
}

export function VendorPortal({
  vendors,
  setVendors,
  ucids,
  setUcids,
}: VendorPortalProps) {
  const [syncingAll, setSyncingAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "warn" | "error";
  } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  // Trigger Toast Notification
  function showToast(message: string, type: "success" | "warn" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  function handleToggleStatus(vendorId: string) {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === vendorId) {
          const isConnected =
            v.status === "connected" || v.status === "syncing";
          const nextStatus = isConnected ? "disconnected" : "connected";
          const nextHealth = isConnected
            ? 0
            : Math.round(92 + Math.random() * 7);

          return {
            ...v,
            status: nextStatus as any,
            apiHealth: nextHealth,
            lastSync: nextStatus === "connected" ? "Just now" : v.lastSync,
          };
        }
        return v;
      }),
    );
    showToast("Vendor system status altered successfully.", "success");
  }

  function handleSyncAll() {
    setSyncingAll(true);

    setTimeout(() => {
      setSyncingAll(false);
      setVendors((prev) =>
        prev.map((v) => {
          if (v.status !== "disconnected") {
            const extraHealth = Math.round(91 + Math.random() * 8);
            return {
              ...v,
              apiHealth: extraHealth,
              lastSync: "Just now",
            };
          }
          return v;
        }),
      );
      showToast(
        "All Direct APIS polled with latest contract pricing metrics.",
        "success",
      );
    }, 1000);
  }

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <ErrorBoundary>
        <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-card border border-white/5 rounded-xl min-h-[400px]">
          <Globe className="w-12 h-12 text-indigo-500/30 mb-4" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Vendor Gateways</h3>
          <p className="text-xs text-gray-400 mt-2 max-w-md leading-relaxed">
            No authorized manufacturer endpoints have been configured. 
            Please set up supplier API credentials to establish sourcing channels.
          </p>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col gap-4 animate-fadeIn">
      {/* Toast Alert overlay */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl border shadow-2xl flex items-center gap-3 animate-slideIn"
          style={{
            backgroundColor:
              toast.type === "success"
                ? "#091815"
                : toast.type === "error"
                  ? "#1c090d"
                  : "#1c1409",
            borderColor:
              toast.type === "success"
                ? "#00d4a0"
                : toast.type === "error"
                  ? "#ff3d5a"
                  : "#ff9b36",
          }}
        >
          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-white/5">
            {toast.type === "success" && (
              <CheckCircle className="w-3.5 h-3.5 text-status-success" />
            )}
            {toast.type === "error" && (
              <AlertCircle className="w-3.5 h-3.5 text-status-error" />
            )}
            {toast.type === "warn" && (
              <AlertCircle className="w-3.5 h-3.5 text-status-warning" />
            )}
          </div>
          <span className="text-xs text-white font-medium">
            {toast.message}
          </span>
        </div>
      )}

      {/* Overview Head */}
      <div
        className="p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{
          background: "rgba(74, 133, 253,0.03)",
          borderColor: "rgba(74, 133, 253,0.1)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Globe className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              Authorized Manufacturer Inventory Endpoints
            </h2>
            <p className="text-[11px] text-gray-400">
              Configure connected Web services, toggle transaction channels, and
              adjust continuous inventory sync configurations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto bg-indigo-500/5 px-3 py-2 rounded-lg border border-indigo-500/10 font-mono text-[10px] text-indigo-300 shrink-0 select-none">
          <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin" />
          <span>PLAYWRIGHT DEAMON: ACTIVE IN BACKGROUND</span>
        </div>
      </div>

      {/* Core Split Layout: Left side Vendor Cards , Right side Manual BOM Upload Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Left Columns - Connected Supplier Channels */}
        <div className="lg:col-span-2 pr-1 space-y-4">
          <VendorGateways
            vendors={vendors}
            handleToggleStatus={handleToggleStatus}
          />
        </div>

        {/* Right Column - Hand-on Sourcing & Playwright Crawling Command panel */}
        <div className="lg:col-span-1 pr-1 space-y-4">
          <VendorIngestionDesk
            ucids={ucids}
            setUcids={setUcids}
            showToast={showToast}
          />
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
}
