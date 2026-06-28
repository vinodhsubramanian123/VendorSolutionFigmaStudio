import React, { useState, useMemo, useCallback } from "react";
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
import { CleansingEditorRow } from "./CleansingEditorRow";
import { AddBOQPartModal } from "./AddBOQPartModal";
import { SplitConfigWizard } from "./SplitConfigWizard";
import { BOQ_PRESETS } from "../../mocks/boqMocks";

export function CleansingView() {
  const catalogSkus = useCoreStore((s) => s.catalogSkus);
  const { toast } = useToast();
  const [entries, setEntries] = useState<CleansingEntry[]>(() =>
    generateMockEntries(catalogSkus)
  );
  
  // Toggles between standard auto-mapping and the deep BOQ editor
  const [viewMode, setViewMode] = useState<"auto-map" | "deep-editor">("auto-map");

  // Auto-Map State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<MatchStatus | "all">("all");
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [skuSearchTerm, setSkuSearchTerm] = useState("");
  const [isRunningAutoMap, setIsRunningAutoMap] = useState(false);

  // Deep Editor State (Mocking a loaded config for now)
  const [activeConfig, setActiveConfig] = useState<Config>(
    BOQ_PRESETS["divergence-split"].sols[0].vendorSubmissions[0].configs[0]
  );
  const [removedParts, setRemovedParts] = useState<Set<string>>(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Split Wizard State
  const [isSplitWizardOpen, setIsSplitWizardOpen] = useState(false);
  const [splitConfigs, setSplitConfigs] = useState<Config[]>([]);

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
          ? { ...e, matchStatus: "quarantined", flagReason: "Manually quarantined for review" }
          : e
      )
    );
    toast("Entry quarantined for manual review.", "warn");
  }, [toast]);

  const handleExportCSV = useCallback(() => {
    toast("Cleansed mapping exported as CSV.", "success");
  }, [toast]);


  // --- Deep Editor Logic ---
  const handleUpdateQuantity = (partNumber: string, oldQty: number, newQty: number) => {
    setActiveConfig(prev => ({
      ...prev,
      items: prev.items.map(item => item.partNumber === partNumber ? { ...item, quantity: newQty } : item)
    }));
    toast(`Updated quantity for ${partNumber} from ${oldQty} to ${newQty}`, "success");
  };

  const handleToggleRemove = (partNumber: string) => {
    setRemovedParts(prev => {
      const next = new Set(prev);
      if (next.has(partNumber)) {
        next.delete(partNumber);
      } else {
        next.add(partNumber);
        toast(`Marked ${partNumber} for removal`, "warn");
      }
      return next;
    });
  };

  const handleAddPart = (partNumber: string, name: string, quantity: number, type: string, unitPrice: number) => {
    const newItem: BOMItem = {
      id: `item-${Date.now()}`,
      partNumber,
      name,
      type,
      quantity,
      unitPrice
    };
    setActiveConfig(prev => ({ ...prev, items: [...prev.items, newItem] }));
    toast(`Added ${quantity}x ${partNumber} to configuration`, "success");
  };

  const handleConfirmSplit = (sourceId: string, destName: string, moveQuantities: Record<string, number>) => {
    // Math to diverge
    const destItems: BOMItem[] = [];
    const sourceItems = activeConfig.items.map(item => {
      const moveQty = moveQuantities[item.partNumber] || 0;
      if (moveQty > 0) {
        destItems.push({ ...item, quantity: moveQty, id: `item-dest-${Date.now()}-${item.partNumber}` });
      }
      return { ...item, quantity: item.quantity - moveQty };
    }).filter(i => i.quantity > 0);

    const newDestConfig: Config = {
      id: `cfg-dest-${Date.now()}`,
      name: destName,
      totalPrice: 0,
      originalPrice: 0,
      items: destItems
    };

    setActiveConfig(prev => ({ ...prev, items: sourceItems }));
    setSplitConfigs(prev => [...prev, newDestConfig]);
    toast(`Successfully split into ${destName}!`, "success");
  };

  const handleCommitCleansedBOQ = () => {
    toast(`Batch Committing ${removedParts.size} deletions, updates, and ${splitConfigs.length} splits to Immutable Audit Trail.`, "success");
    // Mock clearing out removed parts 
    setActiveConfig(prev => ({
      ...prev,
      items: prev.items.filter(i => !removedParts.has(i.partNumber))
    }));
    setRemovedParts(new Set());
  };

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
          <h1 className="text-xl font-semibold text-white tracking-tight">Interactive Splicing Workshop</h1>
          <p className="text-sm text-gray-400">Resolve mapping anomalies and perform deep BOQ edits before Solution compilation.</p>
        </div>
        <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
          <button
            onClick={() => setViewMode("auto-map")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewMode === "auto-map" ? "bg-indigo-500 text-white shadow-sm" : "text-gray-400 hover:text-white"
            }`}
          >
            Auto-Mapping Mode
          </button>
          <button
            onClick={() => setViewMode("deep-editor")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewMode === "deep-editor" ? "bg-indigo-500 text-white shadow-sm" : "text-gray-400 hover:text-white"
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
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-black/20 border-white/5">
                <Search className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Search raw values, part numbers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                />
                {searchTerm && <X className="w-3.5 h-3.5 cursor-pointer text-gray-600 hover:text-gray-400" onClick={() => setSearchTerm("")} />}
              </div>
              <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-2">
                <AnimatePresence initial={false}>
                  {filteredEntries.map((entry, idx) => {
                    const cfg = STATUS_CONFIG[entry.matchStatus];
                    const isSelected = selectedEntryId === entry.id;
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        className={`rounded-lg border transition-all cursor-pointer p-3 ${
                          isSelected ? "border-indigo-500/40 bg-indigo-500/5" : "border-white/5 bg-black/15 hover:border-white/10"
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
                              <span className="text-xs font-bold text-white truncate max-w-[200px]">{entry.rawValue}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${cfg.color} ${cfg.bg} border ${cfg.border}`}>{cfg.label}</span>
                            </div>
                            {entry.matchedPartNumber && (
                              <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                                <span className="font-mono text-indigo-300">{entry.matchedPartNumber}</span>
                                <ArrowRight className="w-3 h-3 text-gray-700" />
                                <span>{entry.normalizedName}</span>
                              </div>
                            )}
                            {entry.flagReason && (
                              <p className="text-[9px] text-red-400 mt-0.5">{entry.flagReason}</p>
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
                    <p className="text-sm text-gray-500">No entries match the current filter</p>
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
        <div className="flex flex-col flex-1 h-full pb-20 overflow-hidden relative">
          {/* Editor Header Actions */}
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h2 className="text-lg font-semibold text-indigo-300 flex items-center gap-2">
              <Layers className="w-5 h-5" /> 
              Editing: {activeConfig.name}
            </h2>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-black/40 border border-white/10 hover:border-white/20 text-white rounded-lg text-sm transition-colors"
              >
                <Plus className="w-4 h-4 text-emerald-400" /> Add Missing Part
              </button>
              <button 
                onClick={() => setIsSplitWizardOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 hover:border-indigo-500/50 text-indigo-300 rounded-lg text-sm transition-colors"
              >
                <SplitSquareHorizontal className="w-4 h-4" /> Split Config (1-to-N)
              </button>
            </div>
          </div>

          {/* Editor Grid */}
          <div className="flex-1 border border-white/10 rounded-xl overflow-hidden bg-black/20 flex flex-col mb-6">
            {/* Grid Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-white/10 bg-black/40 text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0">
              <div className="col-span-2">Part Number</div>
              <div className="col-span-4">Description</div>
              <div className="col-span-3">Quantity</div>
              <div className="col-span-2 text-right">Unit Price</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            
            {/* Rows */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence>
                {activeConfig.items.map(item => {
                  const chassisItem = activeConfig.items.find(i => i.type.toLowerCase() === 'chassis');
                  const parentMultiplier = chassisItem && item.type.toLowerCase() !== 'chassis' && item.quantity > chassisItem.quantity 
                    ? chassisItem.quantity 
                    : undefined;

                  return (
                    <CleansingEditorRow
                      key={item.id}
                      item={item}
                      isRemoved={removedParts.has(item.partNumber)}
                      parentMultiplier={parentMultiplier}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemove={handleToggleRemove}
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* New Split Configs Preview */}
          {splitConfigs.length > 0 && (
             <div className="mb-6 shrink-0">
                <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Diverged Configurations ({splitConfigs.length})</h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {splitConfigs.map(cfg => (
                    <div key={cfg.id} className="min-w-[300px] p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
                      <div className="font-medium text-indigo-300 mb-1">{cfg.name}</div>
                      <div className="text-xs text-gray-500 mb-3">{cfg.items.length} Component Types</div>
                      <div className="space-y-1">
                        {cfg.items.slice(0, 3).map(i => (
                          <div key={i.id} className="flex justify-between text-xs">
                            <span className="text-gray-400 truncate pr-2">{i.name}</span>
                            <span className="text-white font-mono shrink-0">x{i.quantity}</span>
                          </div>
                        ))}
                        {cfg.items.length > 3 && <div className="text-xs text-indigo-400/50 pt-1">+{cfg.items.length - 3} more...</div>}
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          )}

          {/* Batch Commit Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-white/10 flex items-center justify-between px-8 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-6">
              <div className="text-sm">
                <span className="text-gray-400">Total Configs: </span>
                <span className="text-white font-bold">{1 + splitConfigs.length}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Pending Changes: </span>
                <span className="text-emerald-400 font-bold">{removedParts.size + splitConfigs.length}</span>
              </div>
            </div>
            <button 
              onClick={handleCommitCleansedBOQ}
              className="flex items-center gap-2 px-8 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              <Save className="w-5 h-5" /> Commit Cleansed BOQ
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddBOQPartModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAddPart={handleAddPart}
      />
      <SplitConfigWizard 
        isOpen={isSplitWizardOpen}
        onClose={() => setIsSplitWizardOpen(false)}
        sourceConfig={activeConfig}
        onConfirmSplit={handleConfirmSplit}
      />
    </motion.div>
  );
}