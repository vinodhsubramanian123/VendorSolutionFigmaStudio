import { tokens } from "../../styles/tokens";
import React, { useState, useMemo, useEffect } from "react";
import { apiClient } from "../../services/apiClient";
import { motion } from "motion/react";
import { Info, Loader2, Network } from "lucide-react";
import type { CatalogSKU, Vendor } from "../../types";
import { ErrorBoundary } from "../shared/ErrorBoundary";

import { CatalogHeader } from "./CatalogHeader";
import { CatalogAddForm } from "./CatalogAddForm";
import { CatalogFilterBar } from "./CatalogFilterBar";
import { CatalogCardsList } from "./CatalogCardsList";
import { CatalogTypeFilters } from "./CatalogTypeFilters";
import { CatalogTaxonomyTree } from "./CatalogTaxonomyTree";

interface CatalogManagerProps {
  catalogSkus: CatalogSKU[];
  setCatalogSkus: React.Dispatch<React.SetStateAction<CatalogSKU[]>>;
  vendors?: Vendor[];
}

function matchesDeepPath(sku: CatalogSKU, selectedPath: import('../../types').TaxonomyPath): boolean {
  if (selectedPath.vendor !== "all" && sku.vendor.toLowerCase() !== selectedPath.vendor.toLowerCase()) {
    return false;
  }

  if (selectedPath.solution !== "all") {
    if (selectedPath.solution === "Server" && sku.solution !== "Server") return false;
    if (selectedPath.solution === "Storage" && sku.solution !== "Storage") return false;
    if (selectedPath.solution === "Networking" && sku.solution !== "Networking") return false;

    if (selectedPath.product !== "all") {
      const p = selectedPath.product.toLowerCase();
      const family = sku.productFamily?.toLowerCase();
      if (p === "dl380a" && family !== "dl380a") return false;
      if (p === "dl380" && family !== "dl380") return false;
      if (p === "dl80" && family !== "dl80") return false;
      if (p === "msa" && family !== "msa") return false;
      if (p === "aruba" && family !== "aruba") return false;
      if (p === "r760" && family !== "r760") return false;
      if (p === "ucs" && family !== "ucs") return false;
      if (p === "qfx" && family !== "qfx") return false;

      if (selectedPath.generation !== "all") {
        const gen = selectedPath.generation.toLowerCase();
        if (sku.generation?.toLowerCase() !== gen) return false;
      }
    }

    if (selectedPath.chassis === "all") {
      if (sku.type !== "Chassis") return false;
    } else {
      const activeChassisId = selectedPath.chassis;
      if (sku.chassisRef !== activeChassisId && sku.id !== activeChassisId) return false;
    }
  }
  return true;
}

export function CatalogManager({
  catalogSkus,
  setCatalogSkus,
  vendors,
}: CatalogManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = React.useDeferredValue(searchTerm);

  const totalCatalogItems = useMemo(() => {
    if (!vendors || vendors.length === 0) return 16625;
    return vendors.reduce((acc, v) => acc + (v.catalogItems || 0), 0);
  }, [vendors]);

  const totalConnectedVendors = useMemo(() => {
    return vendors?.length || 5;
  }, [vendors]);
  const [vendorFilter, setVendorFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [editingSkuId, setEditingSkuId] = useState<string | null>(null);
  const [editedPrice, setEditedPrice] = useState<string>("");

  // New SKU creation variables
  const [showAddForm, setShowAddForm] = useState(false);

  // Deep Nesting Multi-level Manufacturer Sourcing Taxonomy State
  const [selectedPath, setSelectedPath] = useState<any>({
    vendor: "all",
    solution: "all",
    product: "all",
    generation: "all",
    chassis: "all",
  });

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    hpe: true,
    hpe_Server: true,
    hpe_Server_DL380: true,
    hpe_Server_DL380_Gen11: true,
    dell: true,
    dell_Server: true,
    cisco: true,
    juniper: true,
  });

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const selectPathFn = (newPath: typeof selectedPath) => {
    setSelectedPath(newPath);
    setTypeFilter("all");
    setVendorFilter("all");
  };

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

      if (selectedPath.vendor !== "all") {
        if (!matchesDeepPath(sku, selectedPath)) return false;
      }

      return matchesSearch;
    });
  }, [catalogSkus, deferredSearchTerm, typeFilter, selectedPath]);



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

  function startEditing(sku: CatalogSKU) {
    setEditingSkuId(sku.id);
    setEditedPrice(sku.price.toString());
  }

  async function savePrice(skuId: string) {
    const parsedPrice = parseFloat(editedPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) return;

    // Optimistic UI Update
    setCatalogSkus((prev) =>
      prev.map((s) => (s.id === skuId ? { ...s, price: parsedPrice } : s)),
    );
    setEditingSkuId(null);
    
    // Background API call
    try {
      await apiClient.put(`/api/catalog/${skuId}`, { price: parsedPrice });
    } catch (e) {
      console.error("Failed to sync price with API");
    }
  }

  async function handleAddSku(data: Omit<CatalogSKU, "id" | "status">) {
    const newSku: CatalogSKU = {
      id: `sku-custom-${Date.now()}`,
      ...data,
      status: "active",
    };

    // Optimistic Update
    setCatalogSkus((prev) => [...prev, newSku]);
    setShowAddForm(false);

    try {
      await apiClient.post("/api/catalog", newSku);
    } catch(err) {
      console.error("Failed to add new SKU via API");
    }
  }

  function deleteSku(skuId: string) {
    setCatalogSkus((prev) => prev.filter((s) => s.id !== skuId));
    apiClient.delete(`/api/catalog/${skuId}`).catch(() => {
      console.error("Failed to delete SKU via API");
    });
  }

  return (
    <ErrorBoundary>
      <motion.div 
        className="h-full flex flex-col gap-4 text-xs select-none"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", staggerChildren: 0.1 }}
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
            expandedNodes={expandedNodes} 
            toggleNode={toggleNode} 
            selectPathFn={selectPathFn} 
            selectedPath={selectedPath} 
          />
        </div>

        {/* RIGHT COLUMN: INTERACTIVE SKU CARDS GRID */}
        <div className="lg:col-span-9 xl:col-span-10 flex flex-col gap-4">
          <CatalogFilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedPath={selectedPath}
            setSelectedPath={setSelectedPath}
            setVendorFilter={setVendorFilter}
            setTypeFilter={setTypeFilter}
          />

          {/* Category Quick Chips selector */}
          <CatalogTypeFilters
            projectTypes={projectTypes}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            setSelectedPath={setSelectedPath}
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
            onClearFilters={() => {
              setSelectedPath({
                vendor: "all",
                solution: "all",
                product: "all",
                generation: "all",
                chassis: "all",
              });
              setVendorFilter("all");
              setTypeFilter("all");
              setSearchTerm("");
            }}
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
