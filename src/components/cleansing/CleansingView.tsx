import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Scissors,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Link2,
  X,
  ChevronDown,
  ChevronRight,
  Filter,
  Download,
  Zap,
  Eye,
  Plus,
} from "lucide-react";
import type { CatalogSKU, BOMItem } from "../../types";
import { useToast } from "../shared/ToastContext";
import { apiClient } from "../../services/apiClient";

import { MappingPanel } from "./MappingPanel";
import { CleansingHeader } from "./CleansingHeader";
import { STATUS_CONFIG } from "./constants";
import type { MatchStatus, CleansingEntry } from "./types";
import { generateMockEntries } from "./mockData";

// ─── Component ────────────────────────────────────────────────────────────────

interface CleansingViewProps {
  catalogSkus: CatalogSKU[];
}

export function CleansingView({ catalogSkus }: CleansingViewProps) {
  const { toast } = useToast();

  const [entries, setEntries] = useState<CleansingEntry[]>(() =>
    generateMockEntries(catalogSkus)
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<MatchStatus | "all">("all");
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [skuSearchTerm, setSkuSearchTerm] = useState("");
  const [isRunningAutoMap, setIsRunningAutoMap] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  // Derived stats
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

  // Filtered list
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

  // Catalog suggestions for mapping panel
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

  // Auto-map runner
  const handleAutoMap = useCallback(async () => {
    setIsRunningAutoMap(true);
    try {
      await apiClient.post("/api/taxonomy/rules", {
        sourceId: "batch-cleansing",
        ruleType: "substitution",
        explanation: "Batch auto-cleansing run",
      });
    } catch {
      // Mock: continue regardless
    }

    // Promote fuzzy → matched + unmatched with detected part → fuzzy
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
            };
          }
        }
        return e;
      })
    );

    setIsRunningAutoMap(false);
    toast(`Auto-mapping complete! ${stats.fuzzy} fuzzy entries resolved.`, "success");
  }, [catalogSkus, stats.fuzzy, toast]);

  // Manual map entry to a catalog SKU
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

  // Quarantine an entry
  const handleQuarantine = useCallback((entryId: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? { ...e, matchStatus: "quarantined", flagReason: "Manually quarantined for review" }
          : e
      )
    );
    toast("Entry quarantined for manual review.", "warn");
  }, [toast]);

  // Download cleansed mapping as CSV
  const handleExportCSV = useCallback(() => {
    const rows = [
      ["ID", "Raw Value", "Detected Part #", "Mapped Part #", "Normalized Name", "Vendor", "Status", "Confidence %"],
      ...entries.map((e) => [
        e.id,
        `"${e.rawValue}"`,
        e.detectedPartNumber || "",
        e.mappedOutput || e.matchedPartNumber || "",
        `"${e.normalizedName || ""}"`,
        e.vendor || "",
        e.matchStatus,
        e.confidence.toString(),
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vsip-cleansing-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast("Cleansed mapping exported as CSV.", "success");
  }, [entries, toast]);

  const selectedEntry = entries.find((e) => e.id === selectedEntryId);

  return (
    <motion.div
      className="flex flex-col gap-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* Header */}
      <CleansingHeader
        stats={stats}
        coveragePercent={coveragePercent}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        isRunningAutoMap={isRunningAutoMap}
        handleExportCSV={handleExportCSV}
        handleAutoMap={handleAutoMap}
      />

      {/* Main workspace: two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: Entry list */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          {/* Search bar */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-black/20 border-white/5">
            <Search className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <input
              type="text"
              placeholder="Search raw values, part numbers, SKU names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-xs text-white placeholder-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm("")} className="text-gray-600 hover:text-gray-400">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Entry cards */}
          <div className="space-y-1.5">
            <AnimatePresence initial={false}>
              {filteredEntries.map((entry, idx) => {
                const cfg = STATUS_CONFIG[entry.matchStatus];
                const isSelected = selectedEntryId === entry.id;
                const isExpanded = expandedEntry === entry.id;

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                    className={`rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? "border-indigo-500/40 bg-indigo-500/5"
                        : "border-white/5 bg-black/15 hover:border-white/10"
                    }`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedEntryId(isSelected ? null : entry.id);
                        setSkuSearchTerm(entry.detectedPartNumber || entry.rawValue.split(" ")[0]);
                      }
                    }}
                    onClick={() => {
                      setSelectedEntryId(isSelected ? null : entry.id);
                      setSkuSearchTerm(entry.detectedPartNumber || entry.rawValue.split(" ")[0]);
                    }}
                  >
                    <div className="flex items-start gap-3 p-3">
                      {/* Status dot */}
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-[11px] font-bold text-white truncate max-w-[200px]" title={entry.rawValue}>
                            {entry.rawValue}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${cfg.color} ${cfg.bg} ${cfg.border} border`}>
                            {cfg.label}
                          </span>
                          {entry.vendor && (
                            <span className="text-[9px] text-gray-500">{entry.vendor}</span>
                          )}
                        </div>

                        {entry.matchedPartNumber && (
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                            <span className="font-mono text-indigo-300">{entry.matchedPartNumber}</span>
                            <ArrowRight className="w-3 h-3 text-gray-700" />
                            <span className="truncate max-w-[240px]">{entry.normalizedName}</span>
                          </div>
                        )}

                        {entry.flagReason && (
                          <p className="text-[9px] text-red-400 mt-0.5">{entry.flagReason}</p>
                        )}
                      </div>

                      {/* Confidence bar */}
                      <div className="shrink-0 text-right">
                        <p className="text-[9px] text-gray-600 font-mono mb-1">{entry.confidence}%</p>
                        <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${entry.confidence}%`,
                              background: entry.confidence >= 90 ? "#00d4a0" : entry.confidence >= 70 ? "#ff9b36" : "#ff3d5a",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredEntries.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <Filter className="w-8 h-8 text-gray-700" />
                <p className="text-sm text-gray-500">No entries match the current filter</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Mapping panel */}
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
    </motion.div>
  );
}
