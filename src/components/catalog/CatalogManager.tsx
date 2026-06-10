import { tokens } from "../../styles/tokens";
import React, { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import { Info, Loader2, Network } from "lucide-react";
import type { CatalogSKU } from "../../types";
import { ErrorBoundary } from "../shared/ErrorBoundary";

import { CatalogHeader } from "./CatalogHeader";
import { CatalogAddForm } from "./CatalogAddForm";
import { CatalogFilterBar } from "./CatalogFilterBar";
import { CatalogCardsList } from "./CatalogCardsList";
import { CatalogPagination } from "./CatalogPagination";
import { CatalogTypeFilters } from "./CatalogTypeFilters";

interface CatalogManagerProps {
  catalogSkus: CatalogSKU[];
  setCatalogSkus: React.Dispatch<React.SetStateAction<CatalogSKU[]>>;
  vendors?: any[];
}

export function CatalogManager({
  catalogSkus,
  setCatalogSkus,
  vendors,
}: CatalogManagerProps) {
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "warn" | "error";
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
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
  const [newVendor, setNewVendor] = useState("HPE");
  const [newPartNo, setNewPartNo] = useState("");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("Processor");
  const [newPrice, setNewPrice] = useState("");
  const [newLeadTime, setNewLeadTime] = useState("7");

  // Deep Nesting Multi-level Manufacturer Sourcing Taxonomy State
  const [selectedPath, setSelectedPath] = useState({
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
        sku.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sku.name.toLowerCase().includes(searchTerm.toLowerCase());

      if (searchTerm) {
        return matchesSearch;
      }

      // Top horizontal chips quick filtering option
      if (typeFilter !== "all") {
        if (sku.type.toLowerCase() !== typeFilter.toLowerCase()) {
          return false;
        }
      }

      // Direct tree node deep path filter
      if (selectedPath.vendor !== "all") {
        if (sku.vendor.toLowerCase() !== selectedPath.vendor.toLowerCase()) {
          return false;
        }

        if (selectedPath.solution !== "all") {
          // 1. Solution Catalog Slicing
          if (selectedPath.solution === "Server") {
            if (sku.solution !== "Server") return false;
          } else if (selectedPath.solution === "Storage") {
            if (sku.solution !== "Storage") return false;
          } else if (selectedPath.solution === "Networking") {
            if (sku.solution !== "Networking") return false;
          }

          // 2. Product Family level
          if (selectedPath.product !== "all") {
            const p = selectedPath.product.toLowerCase();

            if (p === "dl380a") {
              if (sku.productFamily?.toLowerCase() !== "dl380a") return false;
            } else if (p === "dl380") {
              if (sku.productFamily?.toLowerCase() !== "dl380") return false;
            } else if (p === "dl80") {
              if (sku.productFamily?.toLowerCase() !== "dl80") return false;
            } else if (p === "msa") {
              if (sku.productFamily?.toLowerCase() !== "msa") return false;
            } else if (p === "aruba") {
              if (sku.productFamily?.toLowerCase() !== "aruba") return false;
            } else if (p === "r760") {
              if (sku.productFamily?.toLowerCase() !== "r760") return false;
            } else if (p === "ucs") {
              if (sku.productFamily?.toLowerCase() !== "ucs") return false;
            } else if (p === "qfx") {
              if (sku.productFamily?.toLowerCase() !== "qfx") return false;
            }

            // 3. Generation Slicing
            if (selectedPath.generation !== "all") {
              const gen = selectedPath.generation.toLowerCase();
              if (sku.generation?.toLowerCase() !== gen) return false;
            }
          }

          // 4. Hierarchical Level Isolation
          if (selectedPath.chassis === "all") {
            if (sku.type !== "Chassis") {
              return false;
            }
          } else {
            const activeChassisId = selectedPath.chassis;
            if (
              sku.chassisRef !== activeChassisId &&
              sku.id !== activeChassisId
            ) {
              return false;
            }
          }
        }
      }

      return matchesSearch;
    });
  }, [catalogSkus, searchTerm, typeFilter, selectedPath]);

  // Pagination State and Logic (Page Size = 24)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;

  // Reset page when filtering criteria or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, selectedPath]);

  const paginatedSkus = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredSkus.slice(startIndex, startIndex + pageSize);
  }, [filteredSkus, currentPage, pageSize]);

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

  function savePrice(skuId: string) {
    const parsedPrice = parseFloat(editedPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) return;

    setCatalogSkus((prev) =>
      prev.map((s) => (s.id === skuId ? { ...s, price: parsedPrice } : s)),
    );
    setEditingSkuId(null);
  }

  function handleAddSku(e: React.FormEvent) {
    e.preventDefault();
    const parsedPrice = parseFloat(newPrice);
    const parsedLead = parseInt(newLeadTime, 10);
    if (!newPartNo || !newName || isNaN(parsedPrice) || isNaN(parsedLead))
      return;

    const newSku: CatalogSKU = {
      id: `sku-custom-${Date.now()}`,
      vendor: newVendor,
      partNumber: newPartNo,
      name: newName,
      type: newType,
      price: parsedPrice,
      leadTimeDays: parsedLead,
      status: "active",
    };

    setCatalogSkus((prev) => [...prev, newSku]);
    setShowAddForm(false);

    // clear fields
    setNewPartNo("");
    setNewName("");
    setNewPrice("");
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

          <div className="flex-1 flex flex-col justify-center items-center opacity-50 p-4 border border-dashed border-white/10 rounded-lg">
             <Network className="w-8 h-8 text-indigo-500 mb-2" />
             <p className="text-center text-gray-500 text-[10px]">Taxonomy node engine retired. Filtering operates via search.</p>
          </div>
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
            paginatedSkus={paginatedSkus}
            editingSkuId={editingSkuId}
            editedPrice={editedPrice}
            setEditedPrice={setEditedPrice}
            startEditing={startEditing}
            savePrice={savePrice}
            setEditingSkuId={setEditingSkuId}
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

          <CatalogPagination
            filteredSkusLength={filteredSkus.length}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
          />
        </div>
      </div>

      {showAddForm && (
        <CatalogAddForm
          onAddSku={handleAddSku}
          onClose={() => setShowAddForm(false)}
          newVendor={newVendor}
          setNewVendor={setNewVendor}
          newType={newType}
          setNewType={setNewType}
          newPartNo={newPartNo}
          setNewPartNo={setNewPartNo}
          newName={newName}
          setNewName={setNewName}
          newPrice={newPrice}
          setNewPrice={setNewPrice}
          newLeadTime={newLeadTime}
          setNewLeadTime={setNewLeadTime}
        />
      )}

      {/* Elegant Toast notification overlay */}
      {toast && (
        <div
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 p-3.5 rounded-lg border shadow-xl animate-fadeIn text-[11px] font-medium leading-none"
          style={{
            backgroundColor:
              toast.type === "success"
                ? `${tokens.colors.status.success}1a` 
                : toast.type === "warn"
                  ? `${tokens.colors.status.warning}1a` 
                  : `${tokens.colors.status.error}1a`, 
            borderColor:
              toast.type === "success"
                ? tokens.colors.status.success 
                : toast.type === "warn"
                  ? tokens.colors.status.warning 
                  : tokens.colors.status.error, 
            color:
              toast.type === "success"
                ? tokens.colors.status.success 
                : toast.type === "warn"
                  ? tokens.colors.status.warning 
                  : tokens.colors.status.error, 
          }}
        >
          <Info className="w-4 h-4 shrink-0" />
          <span className="text-white font-sans">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-1 hover:text-white text-gray-500 font-bold cursor-pointer text-sm font-mono"
          >
            ×
          </button>
        </div>
      )}
      </motion.div>
    </ErrorBoundary>
  );
}
