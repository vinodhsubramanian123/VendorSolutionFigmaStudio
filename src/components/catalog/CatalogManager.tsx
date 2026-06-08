import React, { useState, useMemo, useEffect } from "react";
import {
  Database,
  Search,
  Filter,
  Plus,
  Edit2,
  Check,
  X,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Server,
  Cpu,
  Layers,
  HardDrive,
  Network,
  Sliders,
  Info,
} from "lucide-react";
import { StatusBadge } from "../shared/StatusBadge";
import type { CatalogSKU } from "../../types";
import { TaxonomyTree } from "../taxonomy/TaxonomyTree";
import { Select } from "../shared/Select";
import { Button } from "../shared/Button";

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
    solution: "all", // 'Server' | 'Storage' | 'Networking' | 'all'
    product: "all", // 'DL380' | 'DL80' | 'MSA' | 'Aruba' | 'R760' | 'UCS' | 'QFX' | 'all'
    generation: "all", // 'Gen11' | 'Gen12' | 'G16' | 'M7' | 'all'
    chassis: "all", // Specific chassis variant selection ID
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

  const uniqueVendorNames = Array.from(
    new Set(catalogSkus.map((s) => s.vendor)),
  );

  // Memoized hardware type counts for high performance rendering without row by row parsing at render
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: catalogSkus.length };
    catalogSkus.forEach((s) => {
      const t = s.type.toLowerCase();
      counts[t] = (counts[t] || 0) + 1;
    });
    return counts;
  }, [catalogSkus]);

  // Helper to retrieve category icon
  const getCategoryIcon = (type: string) => {
    switch (type) {
      case "Chassis":
        return Server;
      case "Processor":
        return Cpu;
      case "Memory":
        return Layers;
      case "Drive":
        return HardDrive;
      case "Network Adapter":
        return Network;
      case "Power Supply":
        return Sliders;
      case "Riser Card":
        return Sliders;
      default:
        return Sliders;
    }
  };

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
          const skuTypeLow = sku.type.toLowerCase();

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

            // 3. Generation Slicing: Gen11 vs Gen12 vs Gen13
            if (selectedPath.generation !== "all") {
              const gen = selectedPath.generation.toLowerCase();
              if (sku.generation?.toLowerCase() !== gen) return false;
            }
          }

          // 4. Hierarchical Level Isolation: Main lists only show Chassis vs click-on-chassis shows detailed components
          if (selectedPath.chassis === "all") {
            // If we are at a high-level catalog sweep, look ONLY for main Chassis/Switch choices
            if (sku.type !== "Chassis") {
              return false;
            }
          } else {
            // A specific chassis has been selected (e.g., 'sku-4'). Render only components mapped via chassisRef!
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

  const totalPages = Math.ceil(filteredSkus.length / pageSize) || 1;

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

  // Interactive triggers for taxonomy folder click
  const selectTaxonomy = (vendor: string, category: string = "all") => {
    setSelectedPath({
      vendor: vendor === "all" ? "all" : vendor,
      solution: category === "all" ? "all" : category.replace("_Category", ""),
      product: "all",
      generation: "all",
      chassis: "all",
    });
    // Reset filters of the top panel to align
    setVendorFilter("all");
    setTypeFilter("all");
  };

  return (
    <div className="h-full flex flex-col gap-4 animate-fadeIn select-none text-xs min-h-0">
      {/* Banner / Header */}
      <div
        className="p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        style={{
          background: "rgba(74,133,253,0.03)",
          borderColor: "rgba(74,133,253,0.1)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Database className="w-5.5 h-5.5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">
              Central Sourcing Database & Inventory Rules
            </h2>
            <p className="text-[10.5px] text-gray-500 flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Sourcing Engine Database — {totalCatalogItems.toLocaleString()}{" "}
                SKUs across {totalConnectedVendors} connected direct vendor APIs
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg bg-black/20 text-gray-400 hover:text-white border border-white/5 font-semibold transition cursor-pointer text-[10.5px] flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3 text-indigo-400" />
            <span>Sync API</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 text-[11px] px-3.5 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 font-bold text-white transition-all cursor-pointer shadow-lg shadow-indigo-500/10 focus:outline-none"
          >
            <Plus className="w-3.5 h-3.5" /> Add Sourced SKU
          </button>
        </div>
      </div>

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch flex-1 min-h-0">
        {/* LEFT COLUMN: VENDOR TAXONOMY DRAWER */}
        <div className="lg:col-span-3 bg-surface-elevated border border-white/5 rounded-xl p-4 flex flex-col gap-4 min-h-0">
          <div className="pb-2 border-b border-white/5 flex flex-col shrink-0">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider font-mono">
              Manufacturer Taxonomy
            </span>
            <span className="text-[11.5px] font-bold text-white mt-0.5">
              {catalogSkus.length} Contract SKUs Indexed
            </span>
          </div>

          <TaxonomyTree
            catalogSkus={catalogSkus}
            selectedPath={selectedPath}
            expandedNodes={expandedNodes}
            onToggleNode={toggleNode}
            onSelectPath={selectPathFn}
            vendors={vendors}
            onSetToast={setToast}
          />
        </div>

        {/* RIGHT COLUMN: INTERACTIVE SKU CARDS GRID */}
        <div className="lg:col-span-9 flex flex-col gap-4 min-h-0">
          {/* Filters Control Toolbar */}
          <div className="p-3.5 bg-surface-elevated border border-white/5 rounded-xl text-xs flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Active Part Number or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded bg-black/25 text-white placeholder-gray-500 border border-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 font-medium"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Path indicator or filter pill state label */}
            <div className="flex items-center gap-2 text-[10.5px]">
              <span className="text-gray-500 font-bold">
                Currently Viewing:
              </span>
              <span className="px-2.5 py-1 rounded bg-[#10192e] border border-indigo-500/15 text-indigo-400 font-mono font-bold uppercase">
                {selectedPath.vendor === "all"
                  ? "All Vendors"
                  : selectedPath.vendor}
                {selectedPath.solution !== "all" &&
                  ` > ${selectedPath.solution}`}
                {selectedPath.product !== "all" && ` > ${selectedPath.product}`}
                {selectedPath.generation !== "all" &&
                  ` > ${selectedPath.generation}`}
                {selectedPath.chassis !== "all" && ` > CHASSIS`}
              </span>
              {(selectedPath.vendor !== "all" ||
                selectedPath.solution !== "all" ||
                searchTerm) && (
                <button
                  onClick={() => {
                    setSelectedPath({
                      vendor: "all",
                      solution: "all",
                      product: "all",
                      generation: "all",
                      chassis: "all",
                    });
                    setSearchTerm("");
                    setVendorFilter("all");
                    setTypeFilter("all");
                  }}
                  className="text-indigo-400 hover:text-white font-bold flex items-center gap-0.5 cursor-pointer ml-1"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Quick Chips selector */}
          <div className="flex gap-2 flex-wrap items-center">
            {projectTypes.map((type) => {
              const isActive =
                typeFilter === type.toLowerCase() ||
                (type === "all" && typeFilter === "all");
              // Count dynamic matched types in active local ledger using memoized counts for maximum optimization
              const matchesCount =
                type === "all"
                  ? typeCounts.all
                  : typeCounts[type.toLowerCase()] || 0;

              return (
                <button
                  key={type}
                  onClick={() => {
                    setTypeFilter(type.toLowerCase());
                    setSelectedPath({
                      vendor: "all",
                      solution: "all",
                      product: "all",
                      generation: "all",
                      chassis: "all",
                    }); // reset side folders
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? "bg-indigo-500 text-white border-transparent shadow shadow-indigo-500/20"
                      : "bg-surface-elevated border-white/5 text-gray-400 hover:text-white hover:bg-[#0f1728]"
                  }`}
                >
                  <span>{type === "all" ? "All" : type}</span>
                  <span
                    className={`font-mono text-[9px] px-1.5 py-0.2 rounded font-black ${isActive ? "bg-black/30 text-white" : "bg-black/40 text-gray-500"}`}
                  >
                    {matchesCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Hardware Sourcing Cards Grid */}
          <div className="flex-1 overflow-y-auto pr-1 min-h-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
              {paginatedSkus.length > 0 ? (
                paginatedSkus.map((sku) => {
                  const isEditing = editingSkuId === sku.id;
                  const isEol = sku.status === "eol";
                  const IconComponent = getCategoryIcon(sku.type);

                  // Color configuration of labels based on hardware vendors
                  const brandColors: Record<string, string> = {
                    HPE: "rgba(0, 212, 160, 1)",
                    Dell: "rgba(74, 133, 253, 1)",
                    Cisco: "rgba(168, 85, 247, 1)",
                    Juniper: "rgba(16, 185, 129, 1)",
                  };
                  const activeColor =
                    brandColors[sku.vendor] || "rgba(148, 163, 184, 1)";

                  return (
                    <div
                      key={sku.id}
                      className="bg-surface-elevated border rounded-xl p-4 flex flex-col justify-between hover:border-indigo-500/30 transition duration-200 relative overflow-hidden group/card"
                      style={{
                        borderColor: isEditing
                          ? "#00d4a0"
                          : "rgba(74,133,253,0.06)",
                      }}
                    >
                      {/* Top Row content */}
                      <div className="flex gap-3 items-start">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 bg-[#0f172a] border-white/5">
                          <IconComponent className="w-5 h-5 text-indigo-400" />
                        </div>

                        <div className="flex-1 min-w-0 pr-1">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className="text-[10px] font-bold font-mono tracking-wide uppercase truncate"
                              style={{ color: activeColor }}
                            >
                              {sku.vendor}
                            </span>
                            <StatusBadge status={sku.type} variant="default" size="sm" />
                          </div>

                          <h4
                            className="font-bold text-white text-xs mt-1 truncate"
                            title={sku.name}
                          >
                            {sku.name}
                          </h4>
                          <p className="font-mono text-[9px] text-indigo-400 font-bold mt-1 tracking-wider">
                            {sku.partNumber}
                          </p>
                        </div>
                      </div>

                      {/* Common hardware specs representation */}
                      <div className="mt-4 p-2 bg-black/15 border border-white/2 rounded flex items-center justify-between text-[9px] text-gray-500 leading-none">
                        <span className="font-mono">
                          SPEC: COMMON {sku.type.toUpperCase()}
                        </span>
                        <span className="font-mono text-gray-400">
                          {sku.leadTimeDays}D Lead
                        </span>
                      </div>

                      {/* Bottom Row action & price details */}
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                        <StatusBadge
                          status={sku.status.toUpperCase()}
                          variant={isEol ? "error" : "success"}
                          size="sm"
                        />

                        {/* Interactive inline pricing controls */}
                        <div className="text-right">
                          {isEditing ? (
                            <div className="flex items-center gap-1 justify-end">
                              <span className="text-gray-500 font-mono font-bold">
                                $
                              </span>
                              <input
                                type="text"
                                value={editedPrice}
                                onChange={(e) => setEditedPrice(e.target.value)}
                                className="w-16 p-1 h-6 text-right bg-surface-header text-status-success font-mono border rounded border-[#00d4a0]/35 text-[10px] focus:outline-none"
                                autoFocus
                              />
                              <button
                                onClick={() => savePrice(sku.id)}
                                className="p-0.5 rounded hover:bg-emerald-500/20 text-status-success cursor-pointer"
                                title="Save Price"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingSkuId(null)}
                                className="p-0.5 rounded hover:bg-red-500/20 text-red-400 cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 justify-end group/price">
                              <span className="font-mono text-xs font-black text-status-success">
                                ${sku.price.toLocaleString()}
                              </span>
                              <button
                                onClick={() => startEditing(sku)}
                                className="opacity-0 group-hover/card:opacity-100 p-1 hover:bg-white/5 rounded text-gray-500 hover:text-indigo-400 transition cursor-pointer shrink-0"
                                title="Edit Price"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-12 p-8 text-center text-gray-500 bg-surface-elevated border border-white/5 rounded-xl border-dashed">
                  <AlertTriangle className="w-7 h-7 text-amber-500 m-auto opacity-50 mb-2" />
                  <p className="italic text-xs">
                    No project SKUs discovered matching current taxonomy filter
                    parameters.
                  </p>
                  <button
                    onClick={() => {
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
                    className="mt-3 text-[10.5px] text-indigo-400 hover:text-white font-bold cursor-pointer underline decoration-dotted"
                  >
                    Clear Sourcing Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Pagination Controls */}
          {filteredSkus.length > pageSize && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-surface-elevated border border-white/5 rounded-xl shrink-0 text-[10px] sm:text-xs">
              <span className="text-gray-400 font-medium">
                Showing{" "}
                <strong className="text-white font-bold">
                  {Math.min(
                    filteredSkus.length,
                    (currentPage - 1) * pageSize + 1,
                  )}
                  -{Math.min(filteredSkus.length, currentPage * pageSize)}
                </strong>{" "}
                of{" "}
                <strong className="text-white font-bold">
                  {filteredSkus.length}
                </strong>{" "}
                catalog items
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  className="p-1.5 rounded-lg border border-white/5 bg-black/20 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition flex items-center justify-center cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isCurrent = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold font-mono transition flex items-center justify-center cursor-pointer ${
                        isCurrent
                          ? "bg-indigo-500 text-white shadow shadow-indigo-500/25"
                          : "border border-white/5 bg-black/20 text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  className="p-1.5 rounded-lg border border-white/5 bg-black/20 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition flex items-center justify-center cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Custom SKU form overlay dialog */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/65 flex items-center justify-center p-4 z-50 animate-fadeIn select-none leading-normal">
          <div
            className="w-full max-w-sm rounded-xl border p-5 space-y-4"
            style={{
              backgroundColor: "#090d19",
              borderColor: "rgba(74,133,253,0.18)",
              boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            }}
          >
            <div
              className="flex items-center justify-between pb-2 border-b"
              style={{ borderColor: "rgba(74,133,253,0.06)" }}
            >
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-400" /> Insert Direct
                Sourced SKU
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSku} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold uppercase">
                    Vendor
                  </label>
                  <Select
                    value={newVendor}
                    onChange={(e) => setNewVendor(e.target.value)}
                  >
                    <option value="HPE">HPE</option>
                    <option value="Dell">Dell</option>
                    <option value="Cisco">Cisco</option>
                    <option value="Juniper">Juniper</option>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold uppercase">
                    Category
                  </label>
                  <Select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                  >
                    <option value="Processor">Processor</option>
                    <option value="Memory">Memory</option>
                    <option value="Drive">Drive</option>
                    <option value="Chassis">Chassis</option>
                    <option value="Network Adapter">Network Adapt.</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-semibold uppercase">
                  Part Number ID
                </label>
                <input
                  type="text"
                  value={newPartNo}
                  onChange={(e) => setNewPartNo(e.target.value)}
                  placeholder="e.g. P40445-B21"
                  className="w-full p-2.5 bg-black/30 border border-white/6 text-white font-mono uppercase"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-semibold uppercase">
                  Part Description
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Intel Gold 6430 32-Core 2.1GHz"
                  className="w-full p-2.5 bg-black/30 border border-white/6 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold uppercase">
                    Contract Rate ($)
                  </label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="2450"
                    className="w-full p-2.5 bg-black/30 border border-white/6 text-white font-mono"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold uppercase">
                    Lead Time (Days)
                  </label>
                  <input
                    type="number"
                    value={newLeadTime}
                    onChange={(e) => setNewLeadTime(e.target.value)}
                    placeholder="7"
                    className="w-full p-2.5 bg-black/30 border border-white/6 text-white"
                    required
                  />
                </div>
              </div>

              <div
                className="pt-2 border-t flex justify-end gap-2"
                style={{ borderColor: "rgba(74,133,253,0.06)" }}
              >
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                >
                  Add Part
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Elegant Toast notification overlay */}
      {toast && (
        <div
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 p-3.5 rounded-lg border shadow-xl animate-fadeIn text-[11px] font-medium leading-none"
          style={{
            backgroundColor:
              toast.type === "success"
                ? "#091815"
                : toast.type === "warn"
                  ? "#1c1409"
                  : "#1c090d",
            borderColor:
              toast.type === "success"
                ? "#00d4a0"
                : toast.type === "warn"
                  ? "#ff9b36"
                  : "#ff3d5a",
            color:
              toast.type === "success"
                ? "#00d4a0"
                : toast.type === "warn"
                  ? "#ff9b36"
                  : "#ff3d5a",
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
    </div>
  );
}
