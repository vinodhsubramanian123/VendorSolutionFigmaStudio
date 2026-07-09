import React, { useState, useMemo } from "react";
import { X, Search, Plus, HardDrive } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCoreStore } from "../../store/coreStore";
import { ModalBackdrop } from "../shared/ModalBackdrop";

interface AddBOQPartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPart: (partNumber: string, name: string, quantity: number, type: string, unitPrice: number) => void;
}

export function AddBOQPartModal({ isOpen, onClose, onAddPart }: AddBOQPartModalProps) {
  const catalogSkus = useCoreStore((s) => s.catalogSkus);
  const [activeTab, setActiveTab] = useState<"catalog" | "custom">("catalog");
  
  // Catalog State
  const [searchTerm, setSearchTerm] = useState("");
  const [catalogQty, setCatalogQty] = useState("1");
  const [selectedSkuId, setSelectedSkuId] = useState<string | null>(null);

  // Custom State
  const [customPart, setCustomPart] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [customQty, setCustomQty] = useState("1");
  const [customType, setCustomType] = useState("Component");

  const filteredCatalog = useMemo(() => {
    if (!searchTerm) return catalogSkus.slice(0, 50); // limit to 50
    const lower = searchTerm.toLowerCase();
    return catalogSkus.filter(
      (s) => s.partNumber.toLowerCase().includes(lower) || s.name.toLowerCase().includes(lower)
    ).slice(0, 50);
  }, [catalogSkus, searchTerm]);

  const handleCatalogAdd = () => {
    const sku = catalogSkus.find(s => s.id === selectedSkuId);
    if (!sku) return;
    const qty = parseInt(catalogQty, 10) || 1;
    onAddPart(sku.partNumber, sku.name, qty, sku.type, sku.price);
    onClose();
  };

  const handleCustomAdd = () => {
    if (!customPart || !customDesc) return;
    const qty = parseInt(customQty, 10) || 1;
    onAddPart(customPart, customDesc, qty, customType, 0); // custom parts have 0 price until mapped
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <ModalBackdrop onClick={onClose} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-surface-elevated border border-white/10 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh] z-10"
          >
            {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-surface/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-indigo/20 rounded-lg">
              <HardDrive className="w-5 h-5 text-brand-indigo" />
            </div>
            <h2 className="text-lg font-semibold text-content-primary">Add Part to Configuration</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-white/5 text-content-secondary hover:text-content-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 px-6">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "catalog" ? "border-brand-indigo text-indigo-300" : "border-transparent text-content-primary0 hover:text-content-secondary"
            }`}
          >
            Search Catalog
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "custom" ? "border-brand-indigo text-indigo-300" : "border-transparent text-content-primary0 hover:text-content-secondary"
            }`}
          >
            Custom Part (Fallback)
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "catalog" ? (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-content-primary0" />
                <input
                  type="text"
                  placeholder="Search by SKU or Description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-surface-canvas/40 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-content-primary placeholder-gray-500 focus:outline-none focus:border-brand-indigo/50"
                />
              </div>

              <div className="border border-white/5 rounded-lg overflow-hidden bg-surface-canvas/20">
                <div className="max-h-64 overflow-y-auto">
                  {filteredCatalog.length === 0 ? (
                    <div className="p-8 text-center text-content-primary0 text-sm">No parts found matching "{searchTerm}"</div>
                  ) : (
                    filteredCatalog.map(sku => (
                      <div 
                        key={sku.id} 
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedSkuId(sku.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedSkuId(sku.id);
                          }
                        }}
                        className={`p-3 border-b border-white/5 flex flex-col cursor-pointer transition-colors ${
                          selectedSkuId === sku.id ? "bg-brand-indigo/10 border-brand-indigo/30" : "hover:bg-white/5"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-mono text-sm text-indigo-300">{sku.partNumber}</span>
                          <span className="text-xs text-content-primary0">{sku.type}</span>
                        </div>
                        <span className="text-sm text-content-secondary mt-1">{sku.name}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {selectedSkuId && (
                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                  <div className="flex-1">
                    <label htmlFor="boq-add-catalog-qty" className="block text-xs text-content-primary0 mb-1">Quantity to Add</label>
                    <input
                      id="boq-add-catalog-qty"
                      type="number"
                      min="1"
                      value={catalogQty}
                      onChange={(e) => setCatalogQty(e.target.value)}
                      className="w-32 bg-surface-canvas/40 border border-white/10 rounded-lg px-3 py-2 text-content-primary focus:outline-none focus:border-brand-indigo/50"
                    />
                  </div>
                  <button 
                    onClick={handleCatalogAdd}
                    className="mt-5 px-6 py-2 bg-brand-indigo hover:bg-brand-indigo text-content-primary font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Selected Part
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-status-warning/10 border border-status-warning/20 rounded-lg text-sm text-amber-200/80 mb-6">
                <strong>Note:</strong> Custom parts will be flagged as unmapped. The Intelligence Engine will attempt to reconcile them later.
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label htmlFor="boq-custom-part-number" className="block text-xs text-content-primary0 mb-1">Part Number (SKU)</label>
                  <input
                    id="boq-custom-part-number"
                    type="text"
                    value={customPart}
                    onChange={(e) => setCustomPart(e.target.value)}
                    className="w-full bg-surface-canvas/40 border border-white/10 rounded-lg px-3 py-2 text-content-primary focus:outline-none focus:border-brand-indigo/50 font-mono"
                    placeholder="e.g., NEW-SKU-123"
                  />
                </div>
                <div className="col-span-1">
                  <label htmlFor="boq-custom-asset-type" className="block text-xs text-content-primary0 mb-1">Asset Type</label>
                  <input
                    id="boq-custom-asset-type"
                    type="text"
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    className="w-full bg-surface-canvas/40 border border-white/10 rounded-lg px-3 py-2 text-content-primary focus:outline-none focus:border-brand-indigo/50"
                    placeholder="e.g., Transceiver"
                  />
                </div>
                <div className="col-span-2">
                  <label htmlFor="boq-custom-description" className="block text-xs text-content-primary0 mb-1">Description</label>
                  <input
                    id="boq-custom-description"
                    type="text"
                    value={customDesc}
                    onChange={(e) => setCustomDesc(e.target.value)}
                    className="w-full bg-surface-canvas/40 border border-white/10 rounded-lg px-3 py-2 text-content-primary focus:outline-none focus:border-brand-indigo/50"
                    placeholder="Clear english description"
                  />
                </div>
                <div className="col-span-1">
                  <label htmlFor="boq-custom-qty" className="block text-xs text-content-primary0 mb-1">Quantity</label>
                  <input
                    id="boq-custom-qty"
                    type="number"
                    min="1"
                    value={customQty}
                    onChange={(e) => setCustomQty(e.target.value)}
                    className="w-full bg-surface-canvas/40 border border-white/10 rounded-lg px-3 py-2 text-content-primary focus:outline-none focus:border-brand-indigo/50"
                  />
                </div>
              </div>
              
              <div className="flex justify-end pt-6 border-t border-white/5 mt-6">
                <button 
                  onClick={handleCustomAdd}
                  disabled={!customPart || !customDesc}
                  className="px-6 py-2 bg-brand-indigo hover:bg-brand-indigo disabled:opacity-50 disabled:cursor-not-allowed text-content-primary font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Inject Custom Part
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
