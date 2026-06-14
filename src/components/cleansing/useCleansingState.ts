import { useState, useMemo, useCallback, useEffect } from "react";
import type { CatalogSKU } from "../../types";
import { CleansingEntry, MatchStatus } from "./cleansingTypes";
import { apiClient } from "../../services/apiClient";
import { useToast } from "../shared/ToastContext";

export function useCleansingState(catalogSkus: CatalogSKU[]) {
  const { toast } = useToast();

  const [entries, setEntries] = useState<CleansingEntry[]>([]);
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

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get<CleansingEntry[]>("/api/cleansing/entries");
        if (res.data) setEntries(res.data);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  // Auto-map runner
  const handleAutoMap = useCallback(async () => {
    setIsRunningAutoMap(true);
    try {
      const res = await apiClient.post<any>("/api/cleansing/fuzzy-match", { entries });
      if (res.data && res.data.entries) {
        setEntries(res.data.entries);
        toast(`Auto-mapping complete! ${res.data.resolvedCount} fuzzy entries resolved.`, "success");
      }
    } catch {
      toast("Auto-mapping failed.", "error");
    } finally {
      setIsRunningAutoMap(false);
    }
  }, [entries, toast]);

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

  return {
    entries,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    selectedEntryId,
    setSelectedEntryId,
    skuSearchTerm,
    setSkuSearchTerm,
    isRunningAutoMap,
    expandedEntry,
    setExpandedEntry,
    stats,
    coveragePercent,
    filteredEntries,
    catalogSuggestions,
    handleAutoMap,
    handleManualMap,
    handleQuarantine,
    handleExportCSV,
    selectedEntry,
  };
}
