import React, { useState, useMemo,  useReducer, useCallback } from "react";
import { apiClient } from "../../services/apiClient";
import { motion } from "motion/react";
import { Info } from "lucide-react";
import type { CatalogSKU, Vendor, TaxonomyPath } from "../../types";
import { ErrorBoundary } from "../shared/ErrorBoundary";
import { useToast } from "../shared/ToastContext";
import { matchesDeepPath } from "../../utils/catalogUtils";
import { CatalogHeader } from "./CatalogHeader";
import { CatalogAddForm } from "./CatalogAddForm";
import { CatalogFilterBar } from "./CatalogFilterBar";
import { CatalogCardsList } from "./CatalogCardsList";
import { CatalogTypeFilters } from "./CatalogTypeFilters";
import { CatalogTaxonomyTree } from "./CatalogTaxonomyTree";
interface FilterState {
  searchTerm: string;
  vendorFilter: string;
  typeFilter: string;
  selectedPath: TaxonomyPath;
}
type FilterAction =
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_VENDOR"; payload: string }
  | { type: "SET_TYPE"; payload: string }
  | { type: "SET_PATH"; payload: TaxonomyPath }
  | { type: "CLEAR_ALL" };
const DEFAULT_PATH: TaxonomyPath = {
  vendor: "all",
  solution: "all",
  product: "all",
  generation: "all",
  chassis: "all",
};
const DEFAULT_FILTER_STATE: FilterState = {
  searchTerm: "",
  vendorFilter: "all",
  typeFilter: "all",
  selectedPath: DEFAULT_PATH,
};
function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, searchTerm: action.payload };
    case "SET_VENDOR":
      return { ...state, vendorFilter: action.payload };
    case "SET_TYPE":
      return { ...state, typeFilter: action.payload, selectedPath: DEFAULT_PATH };
    case "SET_PATH":
      return { ...state, selectedPath: action.payload, typeFilter: "all", vendorFilter: "all" };
    case "CLEAR_ALL":
      return DEFAULT_FILTER_STATE;
    default:
      return state;
  }
}
interface CatalogManagerProps {
  catalogSkus: CatalogSKU[];
  setCatalogSkus: React.Dispatch<React.SetStateAction<CatalogSKU[]>>;
  vendors?: Vendor[];
}
// Extracted matchesDeepPath to src/utils/catalogUtils.ts
export function CatalogManager({
  catalogSkus,
  setCatalogSkus,
  vendors,
}: CatalogManagerProps) {
  // eslint-disable-next-line sonarjs/no-dead-store
  // eslint-disable-next-line sonarjs/no-unused-vars
  // eslint-disable-next-line sonarjs/no-dead-store
  // eslint-disable-next-line sonarjs/no-unused-vars
  const { success, warn, error } = useToast();
  
  const [filterState, dispatch] = useReducer(filterReducer, DEFAULT_FILTER_STATE);
  const { searchTerm, vendorFilter, typeFilter, selectedPath } = filterState;
  
  const deferredSearchTerm = React.useDeferredValue(searchTerm);
  const totalCatalogItems = useMemo(() => {
    if (!vendors || vendors.length === 0) return catalogSkus.length;
    return vendors.reduce((acc, v) => acc + (v.catalogItems || 0), 0) || catalogSkus.length;
  }, [vendors, catalogSkus.length]);
  const totalConnectedVendors = useMemo(() => {
    return vendors?.length || 5;
  }, [vendors]);
  const [editingSkuId, setEditingSkuId] = useState<string | null>(null);
  const [editedPrice, setEditedPrice] = useState<string>("");
  // New SKU creation variables
  const [showAddForm, setShowAddForm] = useState(false);
  const selectPathFn = useCallback((newPath: TaxonomyPath) => {
    dispatch({ type: "SET_PATH", payload: newPath });
  }, []);
  // Memoized hardware type counts for high performance rendering without row by row parsing at render
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: catalogSkus.length };
    catalogSkus.forEach((s) => {
      const t = s.type.toLowerCase();
      counts[t] = (counts[t] || 0) + 1;
    });
    return counts;
  }, [catalogSkus]);
  // High fidelity manufacturer deep path catalog filter
  const filteredSkus = useMemo(() => {
    return catalogSkus.filter((sku) => {
      const matchesSearch =
        sku.partNumber.toLowerCase().includes(deferredSearchTerm.toLowerCase()) ||
        sku.name.toLowerCase().includes(deferredSearchTerm.toLowerCase());
      if (deferredSearchTerm) return matchesSearch;
      if (typeFilter !== "all" && sku.type.toLowerCase() !== typeFilter.toLowerCase()) {
        return false;
      }
      if (vendorFilter !== "all" && sku.vendor.toLowerCase() !== vendorFilter.toLowerCase()) {
        return false;
      }
      if (selectedPath.vendor !== "all") {
        if (!matchesDeepPath(sku, selectedPath)) return false;
      }
      return true;
    });
  }, [catalogSkus, deferredSearchTerm, typeFilter, vendorFilter, selectedPath]);
  // Unique types inside active project cards
  const projectTypes = [
    "all",
    "Chassis",
    "Processor",
    "Memory",
    "Drive",
    "Network Adapter",
    "Power Supply",
    "Riser Card",
  ];
  const startEditing = useCallback((sku: CatalogSKU) => {
    setEditingSkuId(sku.id);
    setEditedPrice(sku.price.toString());
  }, []);
  const savePrice = useCallback(async (skuId: string) => {
    const parsedPrice = parseFloat(editedPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) return;
    const prevPrice = catalogSkus.find((s) => s.id === skuId)?.price;
    // Optimistic UI Update
    setCatalogSkus((prev) =>
      prev.map((s) => (s.id === skuId ? { ...s, price: parsedPrice } : s)),
    );
    setEditingSkuId(null);
    
    // Background API call
    try {
      await apiClient.put(`/api/catalog/${skuId}`, { price: parsedPrice });
    // eslint-disable-next-line sonarjs/no-ignored-exceptions
    } catch (e) {
      if (prevPrice !== undefined) {
        setCatalogSkus((skus) => skus.map((s) => (s.id === skuId ? { ...s, price: prevPrice } : s)));
      }
      error("Price sync failed. Rolled back.");
      console.error("Failed to sync price with API");
    }
  }, [editedPrice, catalogSkus, setCatalogSkus, error]);
  const handleAddSku = useCallback(async (data: Omit<CatalogSKU, "id" | "status">) => {
    const newSku: CatalogSKU = {
      id: crypto.randomUUID(),
      ...data,
      status: "active",
    };
    // Optimistic Update
    setCatalogSkus((prev) => [...prev, newSku]);
    setShowAddForm(false);
    try {
      await apiClient.post("/api/catalog", newSku);
    // eslint-disable-next-line sonarjs/no-ignored-exceptions
    } catch(err) {
      setCatalogSkus((prev) => prev.filter((s) => s.id !== newSku.id));
      error("Failed to add SKU. Rolled back.");
      console.error("Failed to add new SKU via API");
    }
  }, [setCatalogSkus, error]);
  const deleteSku = useCallback((skuId: string) => {
    const deletedSku = catalogSkus.find((s) => s.id === skuId);
    setCatalogSkus((prev) => prev.filter((s) => s.id !== skuId));
    
    apiClient.delete(`/api/catalog/${skuId}`).catch(() => {
      if (deletedSku) {
        setCatalogSkus((prev) => [...prev, deletedSku]);
      }
      error("Failed to delete SKU. Rolled back.");
      console.error("Failed to delete SKU via API");
    });
  }, [catalogSkus, setCatalogSkus, error]);
  return (
    <ErrorBoundary>
      <motion.div 
        className="h-full flex flex-col gap-4 text-xs select-none"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <CatalogHeader
        totalCatalogItems={totalCatalogItems}
        totalConnectedVendors={totalConnectedVendors}
        onAddClick={() => setShowAddForm(true)}
      />
      {/* Explanation Banner to resolve "Hierarchy Confusion" */}
      <div className="p-3.5 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex items-start gap-2.5">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-white text-[11.5px]">
            Taxonomy & Sourcing Cardinality Clarity Tool
          </p>
          <p className="text-gray-400 leading-normal text-[10.5px]">
            Please note: The <strong>Vendor Taxonomy</strong> list represents
            our partner manufacturer global catalogs (totaling{" "}
            {totalCatalogItems.toLocaleString()} available partner items). The
            right-side cards reflect the filtered active hardware components (
            {catalogSkus.length} indexed contract codes) assigned to your active
            procurement solutions.
          </p>
        </div>
      </div>
      {/* Main 2-Column Desktop Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch flex-1">
        {/* LEFT COLUMN: VENDOR TAXONOMY DRAWER */}
        <div className="lg:col-span-3 xl:col-span-2 bg-surface-elevated border border-white/5 rounded-xl p-4 flex flex-col gap-4">
          <div className="pb-2 border-b border-white/5 flex flex-col shrink-0">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider font-mono">
              Manufacturer Taxonomy
            </span>
            <span className="text-[11.5px] font-bold text-white mt-0.5">
              {catalogSkus.length} Contract SKUs Indexed
            </span>
          </div>
          <CatalogTaxonomyTree 
            selectPathFn={selectPathFn} 
            selectedPath={selectedPath} 
          />
        </div>
        {/* RIGHT COLUMN: INTERACTIVE SKU CARDS GRID */}
        <div className="lg:col-span-9 xl:col-span-10 flex flex-col gap-4">
          <CatalogFilterBar
            searchTerm={searchTerm}
            setSearchTerm={(s) => dispatch({ type: "SET_SEARCH", payload: s })}
            selectedPath={selectedPath}
            setSelectedPath={(p) => dispatch({ type: "SET_PATH", payload: p })}
            setVendorFilter={(v) => dispatch({ type: "SET_VENDOR", payload: v })}
            setTypeFilter={(t) => dispatch({ type: "SET_TYPE", payload: t })}
          />
          {/* Category Quick Chips selector */}
          <CatalogTypeFilters
            projectTypes={projectTypes}
            typeFilter={typeFilter}
            setTypeFilter={(t) => dispatch({ type: "SET_TYPE", payload: t })}
            setSelectedPath={(p) => dispatch({ type: "SET_PATH", payload: p })}
            typeCounts={typeCounts}
          />
          {/* Hardware Sourcing Cards Grid */}
          <CatalogCardsList
            filteredSkus={filteredSkus}
            editingSkuId={editingSkuId}
            editedPrice={editedPrice}
            setEditedPrice={setEditedPrice}
            startEditing={startEditing}
            savePrice={savePrice}
            setEditingSkuId={setEditingSkuId}
            deleteSku={deleteSku}
            onClearFilters={() => dispatch({ type: "CLEAR_ALL" })}
          />
        </div>
      </div>
      {showAddForm && (
        <CatalogAddForm
          onAddSku={handleAddSku}
          onClose={() => setShowAddForm(false)}
        />
      )}
      </motion.div>
    </ErrorBoundary>
  );
}