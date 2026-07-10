import React, { useState, useMemo } from "react";
import {
  Globe,
  RefreshCw,
} from "lucide-react";
import type { Vendor } from "../../types";
import { useToast } from "../shared/ToastContext";
import { VendorIngestionDesk } from "./VendorIngestionDesk";
import { VendorGateways } from "./VendorGateways";
import { ErrorBoundary } from "../shared/ErrorBoundary";
import { AnimatedViewWrapper } from "../shared/AnimatedViewWrapper";
import { apiClient } from "../../services/apiClient";
import { useCoreStore } from "../../store/coreStore";
import { PlaywrightConsole } from "./PlaywrightConsole";



export const VendorPortal = React.memo(function VendorPortal() {
  const vendors = useCoreStore((s) => s.vendors);
  const setVendors = useCoreStore((s) => s.setVendors);
  const ucids = useCoreStore((s) => s.ucids);
  const setUcids = useCoreStore((s) => s.setUcids);
  const catalogSkus = useCoreStore((s) => s.catalogSkus);
  const sourcingRules = useCoreStore((s) => s.sourcingRules);
  const setSourcingRules = useCoreStore((s) => s.setSourcingRules);
  const learningEvents = useCoreStore((s) => s.learningEvents);
  const setLearningEvents = useCoreStore((s) => s.setLearningEvents);

  const [syncingAll, setSyncingAll] = useState(false);
  const { toast } = useToast();

  // Memoized lists calculations for UI sorting optimization & reactive reactivity
  const sortedVendors = useMemo(() => {
    return [...vendors].sort((a, b) => a.name.localeCompare(b.name));
  }, [vendors]);

  async function handleToggleStatus(vendorId: string) {
    const targetVendor = vendors.find(v => v.id === vendorId);
    if (!targetVendor) return;
    const isConnected = targetVendor.status === "connected" || targetVendor.status === "syncing";
    
    try {
      // Anomaly 1 fix (docs/architecture/backend-route-inventory.md):
      // /api/vendors/toggle never existed in server.ts -- only in MSW.
      // server.ts's one real vendor route is the generic
      // POST /api/vendor/portal dispatcher.
      const res = await apiClient.post<{ status: Vendor["status"]; apiHealth: number }>("/api/vendor/portal", {
        vendor: targetVendor.name,
        action: "toggle",
        vendorId,
        connect: !isConnected,
      });
      setVendors((prev) =>
        prev.map((v) => {
          if (v.id === vendorId) {
            return {
              ...v,
              status: res.data?.status || "disconnected",
              apiHealth: res.data?.apiHealth || 0,
              lastSync: res.data?.status === "connected" ? "Just now" : v.lastSync,
            };
          }
          return v;
        }),
      );
      
      // Also update UCID sync status
      if (res.data?.status === "connected") {
        setUcids(prev => prev.map(u => ({ ...u, syncStatus: "Synced" })));
      }
      
      toast("Vendor system status altered successfully.", "success");
    } catch {
      toast("Failed to toggle vendor status.", "error");
    }
  }

  async function handleSyncAll() {
    setSyncingAll(true);
    try {
      // Anomaly 1 fix: same as handleToggleStatus above.
      const res = await apiClient.post<{ apiHealth: number }>("/api/vendor/portal", {
        vendor: "all",
        action: "sync",
      });
      setVendors((prev) =>
        prev.map((v) => {
          if (v.status !== "disconnected") {
            return {
              ...v,
              apiHealth: res.data?.apiHealth || 98,
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
          <Globe className="w-12 h-12 text-brand-indigo/30 mb-4" />
          <h3 className="text-sm font-bold text-content-primary uppercase tracking-wider">No Vendor Gateways</h3>
          <p className="text-xs text-content-secondary mt-2 max-w-md leading-relaxed">
            No authorized manufacturer endpoints have been configured. 
            Please set up supplier API credentials to establish sourcing channels.
          </p>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <AnimatedViewWrapper>
      {/* Overview Head */}
      <div
        className="p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{
          background: "rgba(74, 133, 253,0.03)",
          borderColor: "rgba(74, 133, 253,0.1)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-indigo/10 flex items-center justify-center border border-brand-indigo/20">
            <Globe className="w-5 h-5 text-brand-indigo" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-content-primary">
              Authorized Manufacturer Inventory Endpoints
            </h2>
            <p className="text-[11px] text-content-secondary">
              Configure connected Web services, toggle transaction channels, and
              adjust continuous inventory sync configurations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0 select-none">
          <button type="button" 
            aria-label="Synchronize all supplier endpoints"
            onClick={handleSyncAll}
            disabled={syncingAll}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border font-mono text-[10px] transition-all cursor-pointer shadow-lg active:scale-95 ${syncingAll ? 'bg-brand-indigo/20 border-brand-indigo/30 text-indigo-300' : 'bg-brand-indigo/10 hover:bg-brand-indigo/20 border-brand-indigo/20 text-brand-indigo'}`}
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
            sourcingRules={sourcingRules}
            setSourcingRules={setSourcingRules}
            learningEvents={learningEvents}
            setLearningEvents={setLearningEvents}
            vendors={vendors}
          />
          <PlaywrightConsole />
        </div>
      </div>
    </AnimatedViewWrapper>
  );
});
