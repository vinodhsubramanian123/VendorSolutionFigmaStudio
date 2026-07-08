import React from 'react';
import { Search, X } from 'lucide-react';

import type { TaxonomyPath } from "../../types";

interface CatalogFilterBarProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedPath: TaxonomyPath;
  setSelectedPath: (val: TaxonomyPath) => void;
  setVendorFilter: (val: string) => void;
  setTypeFilter: (val: string) => void;
}

// Renders a ">" separator + value for one breadcrumb level, or nothing when
// that level is unset ("all"). Extracted because the same
// {condition && (<li/><li/>)} shape was repeated 4 times inline, each
// counting as a separate branch toward CatalogFilterBar's own complexity.
function BreadcrumbSegment({ value, displayAs }: { value?: string; displayAs?: string }) {
  if (!value || value === "all") return null;
  return (
    <>
      <li aria-hidden="true" className="select-none text-content-secondary px-1">&gt;</li>
      <li>{displayAs ?? value}</li>
    </>
  );
}

export function CatalogFilterBar({
  searchTerm,
  setSearchTerm,
  selectedPath,
  setSelectedPath,
  setVendorFilter,
  setTypeFilter,
}: CatalogFilterBarProps) {
  return (
    <div className="p-3.5 bg-surface-elevated border border-white/5 rounded-xl text-xs flex flex-col md:flex-row items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative w-full md:w-80">
        <Search className="w-4 h-4 text-content-secondary absolute left-3 top-2.5" />
        <input
          type="text"
          data-testid="input-catalog-search"
          placeholder="Search Active Part Number or Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-9 pl-9 pr-3 rounded bg-surface-canvas/25 text-content-primary placeholder-gray-500 border border-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 font-medium"
        />
        {searchTerm && (
          <button type="button"
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-2.5 text-content-secondary hover:text-content-primary cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Path indicator or filter pill state label */}
      <div className="flex items-center gap-2 text-[10.5px]">
        <span className="text-content-secondary font-bold">
          Currently Viewing:
        </span>
        <nav aria-label="Breadcrumb" className="px-2.5 py-1 rounded bg-surface-elevated border border-brand-indigo/15 text-brand-indigo font-mono font-bold uppercase"> 
          <ol className="flex items-center space-x-1">
            <li>
              {selectedPath?.vendor === "all" ? "All Vendors" : selectedPath?.vendor}
            </li>
            <BreadcrumbSegment value={selectedPath?.solution} />
            <BreadcrumbSegment value={selectedPath?.product} />
            <BreadcrumbSegment value={selectedPath?.generation} />
            <BreadcrumbSegment value={selectedPath?.chassis} displayAs="CHASSIS" />
          </ol>
        </nav>
        {(selectedPath?.vendor !== "all" ||
          selectedPath?.solution !== "all" ||
          searchTerm) && (
          <button type="button"
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
            className="text-brand-indigo hover:text-content-primary font-bold flex items-center gap-0.5 cursor-pointer ml-1"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
