import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  Globe,
  RefreshCw,
} from "lucide-react";
import type { Vendor, UCID, CatalogSKU } from "../../types";
import { useToast } from "../shared/ToastContext";
import { VendorIngestionDesk } from "./VendorIngestionDesk";
import { VendorGateways } from "./VendorGateways";
import { ErrorBoundary } from "../shared/ErrorBoundary";
import { apiClient } from "../../services/apiClient";

interface VendorPortalProps {
  vendors: Vendor[];
  setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  catalogSkus?: CatalogSKU[];
}

export const VendorPortal = React.memo(function VendorPortal({
  vendors,
  setVendors,
  ucids,
  setUcids,
  catalogSkus = [],
}: VendorPortalProps) {
  const [syncingAll, setSyncingAll] = useState(false);
  const { toast } = useToast();

  // Memoized lists calculations for UI sorting optimization & reactive reactivity
  const sortedVendors = useMemo(() => {
    return [...vendors].sort((a, b) => a.name.localeCompare(b.name));
  }, [vendors]);

  function handleToggleStatus(vendorId: string) {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === vendorId) {
          const isConnected =
            v.status === "connected" || v.status === "syncing";
          const nextStatus: Vendor['status'] = isConnected ? "disconnected" : "connected";
          const nextHealth = isConnected
            ? 0
            : Math.round(92 + Math.random() * 7);

          return {
            ...v,
            status: nextStatus,
            apiHealth: nextHealth,
            lastSync: nextStatus === "connected" ? "Just now" : v.lastSync,
          };
        }
        return v;
      }),
    );
    toast("Vendor system status altered successfully.", "success");
  }

  async function handleSyncAll() {
    setSyncingAll(true);
    try {
      await apiClient.post("/api/vendors/sync", {});
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
      toast(
        "All Direct APIS polled with latest contract pricing metrics.",
        "success",
      );
    } catch (e: unknown) {
      console.error(e);
      toast("Failed to sync vendor APIs.", "error");
    } finally {
      setSyncingAll(false);
    }
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
      <motion.div 
        className="flex flex-col gap-4"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", staggerChildren: 0.1 }}
      >
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

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0 select-none">
          <button 
            onClick={handleSyncAll}
            disabled={syncingAll}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border font-mono text-[10px] transition-all cursor-pointer shadow-lg active:scale-95 ${syncingAll ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300' : 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/20 text-indigo-400'}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingAll ? 'animate-spin' : ''}`} />
            <span className="font-bold tracking-wider">{syncingAll ? 'SYNCING CATALOGS...' : 'SYNC ALL ENDPOINTS'}</span>
          </button>
        </div>
      </div>

      {/* Core Split Layout: Left side Vendor Cards , Right side Manual BOM Upload Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Left Columns - Connected Supplier Channels */}
        <div className="lg:col-span-2 pr-1 space-y-4">
          <VendorGateways
            vendors={sortedVendors}
            handleToggleStatus={handleToggleStatus}
          />
        </div>

        {/* Right Column - Hand-on Sourcing & Playwright Crawling Command panel */}
        <div className="lg:col-span-1 pr-1 space-y-4">
          <VendorIngestionDesk
            ucids={ucids}
            setUcids={setUcids}
            showToast={toast}
            catalogSkus={catalogSkus}
          />
        </div>
      </div>
    </motion.div>
    </ErrorBoundary>
  );
});
