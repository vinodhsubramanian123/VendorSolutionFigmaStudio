import React from "react";
import { AlertCircle, Database, RefreshCw, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import type { UCID, Vendor, CatalogSKU, SolutionProject } from "../../types";
import { UCIDSchema, VendorSchema, CatalogSKUSchema } from "../../types";
import { SolutionProjectSchema } from "../../types/schemas/schemaUCID";
import { z } from "zod";
import { ErrorBoundary } from "./ErrorBoundary";

import { useCoreStore } from "../../store/coreStore";

interface DataPersistenceGateProps {
  children: React.ReactNode;
  isPendingAPI?: boolean;
  requestedView?: string | null;
  onConfirmNavigation?: () => void;
  onCancelNavigation?: () => void;
}

export function DataPersistenceGate({
  children,
  isPendingAPI,
  requestedView,
  onConfirmNavigation,
  onCancelNavigation,
}: DataPersistenceGateProps) {
  const ucids = useCoreStore(s => s.ucids);
  const solutions = useCoreStore(s => s.solutions);
  const vendors = useCoreStore(s => s.vendors);
  const catalogSkus = useCoreStore(s => s.catalogSkus);
  // Synchronously compute data health to avoid any intermediate layout flickers or loading screens on state changes
  const isUcidsValid = Array.isArray(ucids);
  const isSolutionsValid = Array.isArray(solutions);
  const isVendorsValid = Array.isArray(vendors);
  const isCatalogValid = Array.isArray(catalogSkus);
  
  // High-performance robust Zod evaluation state
  const schemaDrift = React.useMemo(() => {
    try {
      const ucidCheck = z.array(UCIDSchema).safeParse(ucids);
      const solutionCheck = z.array(SolutionProjectSchema).safeParse(solutions);
      const vendorCheck = z.array(VendorSchema).safeParse(vendors);
      const catalogCheck = z.array(CatalogSKUSchema).safeParse(catalogSkus);

      const errors: string[] = [];
      if (!ucidCheck.success) {
        const msgs = ucidCheck.error.issues.map(e => e.path.join(".") + ": " + e.message);
        errors.push("UCID Schema Mismatch: " + msgs.join(", "));
      }
      if (!solutionCheck.success) {
        const msgs = solutionCheck.error.issues.map(e => e.path.join(".") + ": " + e.message);
        errors.push("Solution Schema Mismatch: " + msgs.join(", "));
      }
      if (!vendorCheck.success) {
        const msgs = vendorCheck.error.issues.map(e => e.path.join(".") + ": " + e.message);
        errors.push("Vendor Schema Mismatch: " + msgs.join(", "));
      }
      if (!catalogCheck.success) {
        const msgs = catalogCheck.error.issues.map(e => e.path.join(".") + ": " + e.message);
        errors.push("CatalogSKU Schema Mismatch: " + msgs.join(", "));
      }

      if (errors.length > 0) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("⚠️ [VSIP Schema Validation Drift Detected]:", errors);
        }
      } else {
        if (process.env.NODE_ENV !== "production") {
          console.log("✅ [VSIP Schema Alignment Secure]: 100% compliant with standard relational contracts.");
        }
      }

      return {
        aligned: errors.length === 0,
        errors
      };
    } catch (e) {
      console.error("Zod verification crashed:", e);
      return { aligned: false, errors: ["Zod verification crashed."] };
    }
  }, [ucids, solutions, vendors, catalogSkus]);

  const isHealthy = isUcidsValid && isSolutionsValid && isVendorsValid && isCatalogValid && schemaDrift.aligned;

  const handleRestoreSession = () => {
    localStorage.removeItem("sys_ucids");
    localStorage.removeItem("sys_solutions");
    localStorage.removeItem("sys_vendors");
    localStorage.removeItem("sys_catalog_skus");
    window.location.reload();
  };

  if (!isHealthy) {
    return (
      <motion.div
        className="flex flex-col h-full bg-surface-canvas rounded-xl border border-white/5 items-center justify-center p-8 space-y-6"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <div
          className="w-16 h-16 rounded-2xl bg-red-500/10 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse"
        >
          <Database className="w-8 h-8 text-red-400 opacity-60 absolute" />
          <AlertCircle className="w-5 h-5 text-red-500 relative mt-4 ml-4" />
        </div>

        <motion.div
          className="text-center space-y-2 max-w-sm"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.3 }}
        >
          <h2 className="text-lg font-bold text-white tracking-tight">
            Session Data Corrupted
          </h2>
          <p className="text-sm text-gray-400">
            We detected missing or corrupted critical application state (UCIDs,
            Vendors, or Catalog). Navigation to this tab is halted to prevent
            cascading errors.
          </p>
        </motion.div>

        <motion.button
          type="button"
          onClick={handleRestoreSession}
          aria-label="Attempt session restore"
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 hover:text-white rounded-lg text-sm font-semibold transition-colors"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <RefreshCw className="w-4 h-4" />
          Attempt Session Restore
        </motion.button>
      </motion.div>
    );
  }

  return (
    <>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>

      {/* Navigation Confirmation Dialog */}
      {isPendingAPI && requestedView && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-elevated border border-white/10 p-6 rounded-xl shadow-2xl max-w-md w-full animate-fadeIn">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-1">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Critical Process Active
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  You have an active API process or ingestion task running.
                  Navigating away to another view may disrupt the operation or
                  result in lost progress.
                </p>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button type="button"
                onClick={onCancelNavigation}
                className="px-4 py-2 bg-transparent text-gray-400 hover:text-white hover:bg-white/5 rounded-lg text-sm font-medium transition"
              >
                Cancel
              </button>
              <button type="button"
                onClick={onConfirmNavigation}
                className="px-4 py-2 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 hover:text-orange-300 border border-orange-500/20 rounded-lg text-sm font-bold transition"
              >
                Navigate Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
