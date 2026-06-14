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

// ─── Types ───────────────────────────────────────────────────────────────────

type MatchStatus = "matched" | "fuzzy" | "unmatched" | "quarantined" | "mapped";

interface CleansingEntry {
  id: string;
  rawValue: string;            // Original unprocessed text from the BOQ sheet
  detectedPartNumber?: string;
  normalizedName?: string;
  matchStatus: MatchStatus;
  confidence: number;          // 0–100
  matchedSkuId?: string;       // CatalogSKU.id if matched
  matchedPartNumber?: string;
  mappedOutput?: string;       // User-defined override mapping
  vendor?: string;
  flagReason?: string;
  reviewedAt?: string;
}

interface CleansingViewProps {
  catalogSkus: CatalogSKU[];
}

// ─── Mock BOQ raw entries to demonstrate the workshop ────────────────────────

function generateMockEntries(catalogSkus: CatalogSKU[]): CleansingEntry[] {
  const raws = [
    { raw: "32-Core CPU HPE Gen11", part: "P40424-B21", vendor: "HPE" },
    { raw: "Intel Xeon 6130 16-core legacy proc", part: "815100-B21", vendor: "HPE" },
    { raw: "dell 3.84tb nvme ssd sff", part: "400-BPSB", vendor: "Dell" },
    { raw: "Cisco UCS 64GB DDR5 memory dimm", part: "UCS-MR-64G1XS-E", vendor: "Cisco" },
    { raw: "8x2.5 HDD SAS drive cage", part: undefined, vendor: "HPE" },
    { raw: "Juniper QFX5120-48Y switch 1U", part: undefined, vendor: "Juniper" },
    { raw: "P40424B21", part: "P40424-B21", vendor: "HPE" },   // missing hyphen
    { raw: "400 BPSB 3.84TB", part: "400-BPSB", vendor: "Dell" }, // space instead of hyphen
    { raw: "Xeon Gold 6430 Processor", part: "P40424-B21", vendor: "HPE" },
    { raw: "HPE Gen 11 redundant power supply 800W", part: undefined, vendor: "HPE" },
    { raw: "Cisco 9300-24UX Switch", part: undefined, vendor: "Cisco" },
    { raw: "Dell PowerEdge RAID H755 controller", part: undefined, vendor: "Dell" },
  ];

  return raws.map((r, idx) => {
    const catalogMatch = catalogSkus.find(
      (sku) => sku.partNumber === r.part && sku.vendor === r.vendor
    );

    let status: MatchStatus;
    let confidence: number;

    if (catalogMatch && r.raw.toLowerCase().includes(r.part?.replace(/-/g, "").toLowerCase() || "")) {
      status = "matched";
      confidence = 98;
    } else if (catalogMatch) {
      status = "fuzzy";
      confidence = 85;
    } else if (r.part) {
      status = "unmatched";
      confidence = 45;
    } else {
      status = idx % 3 === 0 ? "quarantined" : "unmatched";
      confidence = 20;
    }

    return {
      id: `entry-${idx + 1}`,
      rawValue: r.raw,
      detectedPartNumber: r.part,
      normalizedName: catalogMatch?.name,
      matchStatus: status,
      confidence,
      matchedSkuId: catalogMatch?.id,
      matchedPartNumber: catalogMatch?.partNumber,
      vendor: r.vendor,
      flagReason: status === "quarantined" ? "No SKU pattern detected — manual mapping required" : undefined,
    };
  });
}

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<MatchStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
  matched:     { label: "Exact Match",   color: "text-emerald-400", bg: "bg-emerald-500/8",  border: "border-emerald-500/20", dot: "bg-emerald-400" },
  fuzzy:       { label: "Fuzzy Match",   color: "text-amber-400",   bg: "bg-amber-500/8",    border: "border-amber-500/20",   dot: "bg-amber-400" },
  unmatched:   { label: "Unmatched",     color: "text-orange-400",  bg: "bg-orange-500/8",   border: "border-orange-500/20",  dot: "bg-orange-400" },
  quarantined: { label: "Quarantined",   color: "text-red-400",     bg: "bg-red-500/8",      border: "border-red-500/20",     dot: "bg-red-400 animate-pulse" },
  mapped:      { label: "Mapped",        color: "text-indigo-400",  bg: "bg-indigo-500/8",   border: "border-indigo-500/20",  dot: "bg-indigo-400" },
};

// ─── Component ────────────────────────────────────────────────────────────────

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
      <div
        className="p-5 rounded-xl border"
        style={{ background: "rgba(7,10,19,0.8)", borderColor: "rgba(74,133,253,0.12)" }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Scissors className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">
                Interactive Splicing &amp; Mapping Workshop
              </h1>
              <p className="text-[11px] text-gray-500 mt-0.5">
                PRD §3.6 — Quarantine, fuzzy-match, and canonicalize raw BOQ line items against the Master Catalog
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              onClick={handleAutoMap}
              disabled={isRunningAutoMap}
              className="flex items-center gap-1.5 text-[11px] font-bold px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition cursor-pointer disabled:opacity-50"
            >
              {isRunningAutoMap ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-yellow-300" />}
              Auto-Map
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-3 mt-4">
          {(["all", "matched", "fuzzy", "unmatched", "quarantined", "mapped"] as const).map((s) => {
            const count = s === "all" ? stats.total : stats[s as keyof typeof stats];
            const cfg = s === "all" ? null : STATUS_CONFIG[s as MatchStatus];
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase font-mono transition cursor-pointer border ${
                  filterStatus === s
                    ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-300"
                    : "bg-white/5 border-white/8 text-gray-500 hover:text-gray-300"
                }`}
              >
                {cfg && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
                {s === "all" ? "All" : STATUS_CONFIG[s as MatchStatus].label} ({count})
              </button>
            );
          })}
          {/* Coverage bar */}
          <div className="ml-auto flex items-center gap-3 text-[10px] text-gray-500">
            <span className="font-mono">Coverage</span>
            <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${coveragePercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <span className="text-white font-bold font-mono">{coveragePercent}%</span>
          </div>
        </div>
      </div>

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
              className="flex-1 bg-transparent text-xs text-white placeholder-gray-600 focus:outline-none"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="text-gray-600 hover:text-gray-400">
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
          <AnimatePresence mode="wait">
            {selectedEntry ? (
              <motion.div
                key={selectedEntry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="sticky top-0 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">Mapping Panel</p>
                    <p className="text-[11px] font-bold text-white mt-0.5 leading-relaxed">
                      "{selectedEntry.rawValue}"
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase border ${STATUS_CONFIG[selectedEntry.matchStatus].color} ${STATUS_CONFIG[selectedEntry.matchStatus].bg} ${STATUS_CONFIG[selectedEntry.matchStatus].border}`}>
                        {STATUS_CONFIG[selectedEntry.matchStatus].label}
                      </span>
                      <span className="text-[9px] text-gray-500 font-mono">{selectedEntry.confidence}% confidence</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleQuarantine(selectedEntry.id)}
                      className="p-1.5 rounded hover:bg-red-500/10 text-red-400 hover:text-red-300 transition cursor-pointer"
                      title="Quarantine"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSelectedEntryId(null)}
                      className="p-1.5 rounded hover:bg-white/5 text-gray-500 hover:text-gray-300 transition cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Current mapping */}
                {selectedEntry.matchedPartNumber && (
                  <div className="p-2.5 rounded-lg bg-black/25 border border-white/5">
                    <p className="text-[9px] text-gray-500 font-mono uppercase mb-1.5">Current Mapping</p>
                    <div className="flex items-center gap-2">
                      <Link2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-[11px] font-bold text-emerald-300 font-mono">{selectedEntry.matchedPartNumber}</p>
                        <p className="text-[10px] text-gray-400">{selectedEntry.normalizedName}</p>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />
                    </div>
                  </div>
                )}

                {/* Catalog search */}
                <div>
                  <p className="text-[9px] text-gray-500 font-mono uppercase tracking-wider mb-2">Override / Remap</p>
                  <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-white/8 bg-black/20 mb-2">
                    <Search className="w-3 h-3 text-gray-600 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search catalog..."
                      value={skuSearchTerm}
                      onChange={(e) => setSkuSearchTerm(e.target.value)}
                      className="flex-1 bg-transparent text-[11px] text-white placeholder-gray-700 focus:outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1 max-h-52 overflow-y-auto">
                    {catalogSuggestions.map((sku) => (
                      <button
                        key={sku.id}
                        data-testid="catalog-suggestion"
                        onClick={() => handleManualMap(selectedEntry.id, sku)}
                        className="w-full text-left flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-indigo-500/20 transition group cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-indigo-200 font-mono">{sku.partNumber}</p>
                          <p className="text-[9px] text-gray-500 truncate">{sku.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[8px] text-gray-600">{sku.vendor}</span>
                            <span className="text-[8px] text-emerald-400 font-mono">${sku.price.toLocaleString()}</span>
                            <span
                              className={`text-[8px] font-mono ${
                                sku.status === "active" ? "text-emerald-400" : sku.status === "eol" ? "text-red-400" : "text-amber-400"
                              }`}
                            >
                              {sku.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-indigo-400 transition shrink-0 mt-0.5" />
                      </button>
                    ))}
                    {catalogSuggestions.length === 0 && (
                      <p className="text-[10px] text-gray-600 text-center py-4">No catalog matches</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-white/5 bg-black/10 flex flex-col items-center justify-center py-16 gap-3 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/8 border border-emerald-500/15 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-emerald-400/40" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Select an entry</p>
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    Click any BOQ line to open the mapping panel
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
