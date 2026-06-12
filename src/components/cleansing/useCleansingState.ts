import { useState, useMemo, useCallback } from "react";
import type { CatalogSKU } from "../../types";
import { CleansingEntry, MatchStatus } from "./cleansingTypes";
import { apiClient } from "../../services/apiClient";
import { useToast } from "../shared/ToastContext";

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
      confidence = Math.floor(Math.random() * 20) + 72;
    } else if (r.part) {
      status = "unmatched";
      confidence = Math.floor(Math.random() * 30) + 40;
    } else {
      status = idx % 3 === 0 ? "quarantined" : "unmatched";
      confidence = Math.floor(Math.random() * 35) + 15;
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

export function useCleansingState(catalogSkus: CatalogSKU[]) {
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
