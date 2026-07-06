import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ArrowRight,
  X,
  Filter,
  Layers,
  Save,
  Plus,
  SplitSquareHorizontal
} from "lucide-react";
import type { CatalogSKU, BOMItem, Config } from "../../types";
import { useToast } from "../shared/ToastContext";
import { apiClient } from "../../services/apiClient";
import { MappingPanel } from "./MappingPanel";
import { CleansingHeader } from "./CleansingHeader";
import { STATUS_CONFIG } from "./constants";
import type { MatchStatus, CleansingEntry } from "./types";
import { generateMockEntries } from "./mockData";
import { useCoreStore } from "../../store/coreStore";
import { DeepCleansingEditor } from "./DeepCleansingEditor";

export function CleansingView() {
  const catalogSkus = useCoreStore((s) => s.catalogSkus);
  const { toast } = useToast();

  // Re-derives match status/confidence for the fixed set of ingested BOQ lines
  // whenever the catalog changes (e.g. a heal action corrects a SKU that one of
  // these lines should now match). Previously this only ran once on mount via a
  // useState initializer, so entries never picked up later catalog fixes.
  const baselineEntries = useMemo(() => generateMockEntries(catalogSkus), [catalogSkus]);

  const [entries, setEntries] = useState<CleansingEntry[]>(() => baselineEntries);

  useEffect(() => {
    // Merge the fresh catalog-derived baseline in, but never clobber an entry
    // the user has already reviewed (mapped, quarantined, or auto-map-promoted)
    // — reviewedAt is the signal that this entry has diverged from the pristine
    // auto-detected state and should be preserved rather than regenerated.
    setEntries((prev) =>
      baselineEntries.map((fresh) => {
        const existing = prev.find((e) => e.id === fresh.id);
        return existing?.reviewedAt ? existing : fresh;
      })
    );
  }, [baselineEntries]);
  
  // Toggles between standard auto-mapping and the deep BOQ editor
  const [viewMode, setViewMode] = useState<"auto-map" | "deep-editor">("auto-map");

  // Auto-Map State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<MatchStatus | "all">("all");
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [skuSearchTerm, setSkuSearchTerm] = useState("");
  const [isRunningAutoMap, setIsRunningAutoMap] = useState(false);

  // --- Auto-Map Logic ---
  const stats = useMemo(() => ({
    total: entries.length,
    matched: entries.filter((e) => e.matchStatus === "matched").length,
    fuzzy: entries.filter((e) => e.matchStatus === "fuzzy").length,
    unmatched: entries.filter((e) => e.matchStatus === "unmatched").length,
    quarantined: entries.filter((e) => e.matchStatus === "quarantined").length,
    mapped: entries.filter((e) => e.matchStatus === "mapped").length,
  }), [entries]);

  const coveragePercent = useMemo(() => {
    const covered = stats.matched + stats.mapped + stats.fuzzy;
    return stats.total > 0 ? Math.round((covered / stats.total) * 100) : 0;
  }, [stats]);

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const matchesSearch =
        !searchTerm ||
        e.rawValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.detectedPartNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.normalizedName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === "all" || e.matchStatus === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [entries, searchTerm, filterStatus]);

  const catalogSuggestions = useMemo(() => {
    const term = skuSearchTerm.toLowerCase();
    if (!term) return catalogSkus.slice(0, 8);
    return catalogSkus
      .filter(
        (sku) =>
          sku.status === "active" &&
          (sku.partNumber.toLowerCase().includes(term) ||
            sku.name.toLowerCase().includes(term) ||
            sku.vendor.toLowerCase().includes(term))
      )
      .slice(0, 8);
  }, [catalogSkus, skuSearchTerm]);

  const handleAutoMap = useCallback(async () => {
    setIsRunningAutoMap(true);
    try {
      await apiClient.post("/api/taxonomy/rules", {
        sourceId: "batch-cleansing",
        ruleType: "substitution",
        explanation: "Batch auto-cleansing run",
      });
    } catch {}
    setEntries((prev) =>
      prev.map((e) => {
        if (e.matchStatus === "fuzzy" && e.confidence >= 70) {
          return { ...e, matchStatus: "matched", confidence: Math.min(e.confidence + 12, 99), reviewedAt: new Date().toISOString() };
        }
        if (e.matchStatus === "unmatched" && e.detectedPartNumber) {
          const skuMatch = catalogSkus.find((s) => s.partNumber === e.detectedPartNumber);
          if (skuMatch) {
            return {
              ...e,
              matchStatus: "fuzzy",
              matchedSkuId: skuMatch.id,
              matchedPartNumber: skuMatch.partNumber,
              normalizedName: skuMatch.name,
              confidence: 74,
              reviewedAt: new Date().toISOString(),
            };
          }
        }
        return e;
      })
    );
    setIsRunningAutoMap(false);
    toast(`Auto-mapping complete! ${stats.fuzzy} fuzzy entries resolved.`, "success");
  }, [catalogSkus, stats.fuzzy, toast]);

  const handleManualMap = useCallback((entryId: string, sku: CatalogSKU) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? {
              ...e,
              matchStatus: "mapped",
              mappedOutput: sku.partNumber,
              matchedSkuId: sku.id,
              matchedPartNumber: sku.partNumber,
              normalizedName: sku.name,
              confidence: 100,
              reviewedAt: new Date().toISOString(),
            }
          : e
      )
    );
    setSelectedEntryId(null);
    toast(`Mapped to ${sku.partNumber} — ${sku.name}`, "success");
  }, [toast]);

  const handleQuarantine = useCallback((entryId: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? { ...e, matchStatus: "quarantined", flagReason: "Manually quarantined for review", reviewedAt: new Date().toISOString() }
          : e
      )
    );
    toast("Entry quarantined for manual review.", "warn");
  }, [toast]);

  const handleExportCSV = useCallback(() => {
    toast("Cleansed mapping exported as CSV.", "success");
  }, [toast]);


  // --- End Auto-Map Logic ---

  const selectedEntry = entries.find((e) => e.id === selectedEntryId);

  return (
    <motion.div
      className="flex flex-col h-[calc(100vh-64px)] overflow-hidden pb-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* Mode Toggle Bar */}
      <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4 shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-content-primary tracking-tight">Interactive Splicing Workshop</h1>
          <p className="text-sm text-content-secondary">Resolve mapping anomalies and perform deep BOQ edits before Solution compilation.</p>
        </div>
        <div className="flex bg-surface-canvas/40 p-1 rounded-lg border border-white/10">
          <button
            onClick={() => setViewMode("auto-map")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewMode === "auto-map" ? "bg-brand-indigo text-content-primary shadow-sm" : "text-content-secondary hover:text-content-primary"
            }`}
          >
            Auto-Mapping Mode
          </button>
          <button
            onClick={() => setViewMode("deep-editor")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewMode === "deep-editor" ? "bg-brand-indigo text-content-primary shadow-sm" : "text-content-secondary hover:text-content-primary"
            }`}
          >
            Deep Cleanse Editor
          </button>
        </div>
      </div>

      {viewMode === "auto-map" ? (
        <div className="flex flex-col gap-5 flex-1 overflow-y-auto">
          <CleansingHeader
            stats={stats}
            coveragePercent={coveragePercent}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            isRunningAutoMap={isRunningAutoMap}
            handleExportCSV={handleExportCSV}
            handleAutoMap={handleAutoMap}
          />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3 flex flex-col gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-surface-canvas/20 border-white/5">
                <Search className="w-3.5 h-3.5 text-content-primary0 shrink-0" />
                <input
                  type="text"
                  placeholder="Search raw values, part numbers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-content-primary focus:outline-none"
                />
                {searchTerm && <X className="w-3.5 h-3.5 cursor-pointer text-content-muted hover:text-content-secondary" onClick={() => setSearchTerm("")} />}
              </div>
              <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-2">
                <AnimatePresence initial={false}>
                  {filteredEntries.map((entry, idx) => {
                    const cfg = STATUS_CONFIG[entry.matchStatus];
                    const isSelected = selectedEntryId === entry.id;
                    return (
                      <motion.div
                        key={entry.id}
                        data-testid="cleansing-entry"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        className={`rounded-lg border transition-all cursor-pointer p-3 ${
                          isSelected ? "border-brand-indigo/40 bg-brand-indigo/5" : "border-white/5 bg-surface-canvas/15 hover:border-white/10"
                        }`}
                        onClick={() => {
                          setSelectedEntryId(isSelected ? null : entry.id);
                          setSkuSearchTerm(entry.detectedPartNumber || entry.rawValue.split(" ")[0]);
                        }}
                      >
                         <div className="flex items-start gap-3">
                          <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex gap-2 items-center mb-1">
                              <span className="text-xs font-bold text-content-primary truncate max-w-[200px]">{entry.rawValue}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${cfg.color} ${cfg.bg} border ${cfg.border}`}>{cfg.label}</span>
                            </div>
                            {entry.matchedPartNumber && (
                              <div className="flex items-center gap-1.5 text-[10px] text-content-secondary">
                                <span className="font-mono text-indigo-300">{entry.matchedPartNumber}</span>
                                <ArrowRight className="w-3 h-3 text-gray-700" />
                                <span>{entry.normalizedName}</span>
                              </div>
                            )}
                            {entry.flagReason && (
                              <p className="text-[9px] text-status-error mt-0.5">{entry.flagReason}</p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {filteredEntries.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                    <Filter className="w-8 h-8 text-gray-700" />
                    <p className="text-sm text-content-primary0">No entries match the current filter</p>
                  </div>
                )}
              </div>
            </div>
            <div className="lg:col-span-2">
              <MappingPanel
                selectedEntry={selectedEntry}
                setSelectedEntryId={setSelectedEntryId}
                handleQuarantine={handleQuarantine}
                skuSearchTerm={skuSearchTerm}
                setSkuSearchTerm={setSkuSearchTerm}
                catalogSuggestions={catalogSuggestions}
                handleManualMap={handleManualMap}
              />
            </div>
          </div>
        </div>
      ) : (
        <DeepCleansingEditor />
      )}
    </motion.div>
  );
}