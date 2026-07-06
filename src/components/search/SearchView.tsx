import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Database, Globe, Target, Search, ArrowUpRight, Sparkles } from "lucide-react";
import type { AppView, UCID } from "../../types";
import { ErrorBoundary } from "../shared/ErrorBoundary";

import { useCoreStore } from "../../store/coreStore";

interface SearchViewProps {
  query: string;
  onNavigate: (view: AppView) => void;
  onSelectMission: (id: string) => void;
  onSearchChange?: (newQuery: string) => void;
}

function highlightText(text: string, query: string) {
  if (!query || !text) return <>{text}</>;
  const normQuery = query.trim();
  if (!normQuery) return <>{text}</>;

  try {
    const escapedQuery = normQuery.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`(${escapedQuery})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <mark
              key={index}
              className="bg-status-warning/25 text-amber-300 px-0.5 rounded-sm font-semibold"
            >
              {part}
            </mark>
          ) : (
            part
          ),
        )}
      </>
    );
  } catch (e) {
    console.error(e);
    return <>{text}</>;
  }
}

export function SearchView({
  query,
  onNavigate,
  onSelectMission,
  onSearchChange,
}: SearchViewProps) {
  const ucids = useCoreStore((s) => s.ucids);
  const vendors = useCoreStore((s) => s.vendors);
  const catalogSkus = useCoreStore((s) => s.catalogSkus);
  
  const [searchState, setSearchState] = useState(() => ({
    externalQuery: query,
    localInput: query,
  }));

  const localInput = query === searchState.externalQuery ? searchState.localInput : query;

  if (query !== searchState.externalQuery) {
    setSearchState({
      externalQuery: query,
      localInput: query,
    });
  }

  // Drive the active query from whichever is more recent: local override or external prop
  // This avoids the setState-in-effect cascade while still allowing parent prop updates
  const activeQuery = localInput;
  const normQuery = activeQuery.toLowerCase().trim();

  const handleSearchSubmit = (val: string) => {
    setSearchState({
      externalQuery: query,
      localInput: val,
    });
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  // Filter matched records with useMemo
  const matchedMissions = useMemo(() => {
    if (!normQuery) return [];
    return (ucids as UCID[]).filter(
      (u) =>
        u.displayId.toLowerCase().includes(normQuery) ||
        u.name.toLowerCase().includes(normQuery) ||
        u.projectRef.toLowerCase().includes(normQuery),
    );
  }, [ucids, normQuery]);

  const matchedVendors = useMemo(() => {
    if (!normQuery) return [];
    return vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(normQuery) ||
        v.shortName.toLowerCase().includes(normQuery),
    );
  }, [vendors, normQuery]);

  const matchedSkus = useMemo(() => {
    if (!normQuery) return [];
    return catalogSkus.filter(
      (s) =>
        s.partNumber.toLowerCase().includes(normQuery) ||
        s.name.toLowerCase().includes(normQuery) ||
        s.type.toLowerCase().includes(normQuery),
    );
  }, [catalogSkus, normQuery]);

  const totalMatches = useMemo(() => {
    return matchedMissions.length + matchedVendors.length + matchedSkus.length;
  }, [matchedMissions, matchedVendors, matchedSkus]);

  const suggestions = [
    { text: "HPE DL380 Gen11", category: "Hardware Chassis" },
    { text: "Cisco UCS", category: "Computing Architectures" },
    { text: "Intel Xeon Gold", category: "Processors" },
    { text: "UCID-2026", category: "Workflow Tracks" },
    { text: "Lead times", category: "Logistics" }
  ];

  return (
    <ErrorBoundary>
      <motion.div 
        className="flex flex-col gap-5 select-none leading-normal text-xs"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", staggerChildren: 0.1 }}
      >
        {/* Beautiful Cognitive Search Console Body Input */}
        <div 
          className="p-6 rounded-xl border flex flex-col gap-4 relative overflow-hidden" 
          style={{
            background: "linear-gradient(135deg, rgba(74,133,253,0.04) 0%, rgba(124,58,237,0.02) 100%)",
            borderColor: "rgba(74, 133, 253,0.12)",
          }}
        >
          <div className="flex flex-col gap-1 z-10">
            <h1 className="text-sm font-semibold text-content-primary tracking-tight flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-indigo" />
              Cognitive Sourcing Knowledge Explorer
            </h1>
            <p className="text-[10px] text-content-primary0">
              Query unified cross-entity schemas covering Active Workflows, Sourced Parts, and Vendor partner API registries.
            </p>
          </div>

          <div className="flex gap-2 max-w-2xl w-full z-10">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-primary0" />
              <input
                id="view-search-input"
                type="text"
                value={localInput}
                onChange={(e) => handleSearchSubmit(e.target.value)}
                placeholder="Type here to search parts, manufacturers, process IDs..."
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-surface-canvas/40 border border-white/10 text-content-primary text-xs placeholder-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus:border-brand-indigo focus:ring-1 focus:ring-indigo-400/25 transition-all text-ellipsis"
              />
            </div>
            {localInput && (
              <button type="button"
                onClick={() => handleSearchSubmit("")}
                className="px-4 h-11 rounded-lg bg-surface-elevated hover:bg-white/5 border border-white/10 text-content-secondary hover:text-content-primary transition cursor-pointer text-[11px]"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-1 z-10">
            <span className="text-[10px] text-content-primary0 font-medium">Suggestions:</span>
            {suggestions.map((sug, idx) => (
              <button type="button"
                key={idx}
                onClick={() => handleSearchSubmit(sug.text)}
                aria-label={`Search suggestion: ${sug.text}`}
                className="px-2.5 py-1 rounded bg-surface-elevated hover:bg-brand-indigo/10 border border-white/10 hover:border-brand-indigo/20 text-content-secondary hover:text-indigo-300 transition text-[10px] cursor-pointer"
              >
                {sug.text}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Display Area */}
        {activeQuery.trim() !== "" ? (
          totalMatches > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
          {/* Workflows Column */}
          <div
            className="flex flex-col gap-2.5"
            id="search-column-workflows"
          >
            <span className="text-[10px] tracking-widest text-content-primary0 font-bold uppercase flex items-center gap-1.5 px-1 shrink-0">
              <Target className="w-3.5 h-3.5 text-status-warning" /> Workflows (
              {matchedMissions.length})
            </span>
            <div className="flex-1 pr-1 space-y-2">
              {matchedMissions.map((m) => (
                <button type="button"
                  key={m.id}
                  id={`search-mission-${m.id}`}
                  onClick={() => onSelectMission(m.id)}
                  className="w-full p-3 rounded-lg border text-left cursor-pointer transition-all hover:bg-white/5 block"
                  style={{
                    backgroundColor: "var(--color-surface-elevated)",
                    borderColor: "rgba(74, 133, 253,0.06)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-brand-indigo font-bold text-[10px]">
                      {highlightText(m.displayId, query)}
                    </span>
                    <ArrowUpRight className="w-3 h-3 text-content-muted" />
                  </div>
                  <p className="text-content-primary font-bold mt-1.5 leading-tight">
                    {highlightText(m.name, query)}
                  </p>
                  <p className="text-content-primary0 text-[10px] mt-1 font-mono">
                    Ref: {highlightText(m.projectRef, query)}
                  </p>
                </button>
              ))}
              {matchedMissions.length === 0 && (
                <p className="p-4 text-center text-content-muted italic">
                  No matching workflows found.
                </p>
              )}
            </div>
          </div>

          {/* Vendors Column */}
          <div
            className="flex flex-col gap-2.5"
            id="search-column-vendors"
          >
            <span className="text-[10px] tracking-widest text-content-primary0 font-bold uppercase flex items-center gap-1.5 px-1 shrink-0">
              <Globe className="w-3.5 h-3.5 text-brand-indigo" /> Connected APIs (
              {matchedVendors.length})
            </span>
            <div className="flex-1 pr-1 space-y-2">
              {matchedVendors.map((v) => (
                <button type="button"
                  key={v.id}
                  id={`search-vendor-${v.id}`}
                  onClick={() => onNavigate("vendor-portal")}
                  className="w-full p-3 rounded-lg border text-left cursor-pointer transition-all hover:bg-white/5 block animate-fadeIn"
                  style={{
                    backgroundColor: "var(--color-surface-elevated)",
                    borderColor: "rgba(74, 133, 253,0.06)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-content-primary uppercase text-[10px]">
                      {highlightText(v.shortName, query)} API Router
                    </span>
                    <ArrowUpRight className="w-3 h-3 text-content-muted" />
                  </div>
                  <p className="text-content-secondary font-medium mt-1">
                    {highlightText(v.name, query)}
                  </p>
                  <div className="flex gap-2 text-[10px] text-content-primary0 font-mono mt-2">
                    <span>API Vitality: {v.apiHealth}%</span>
                    <span>·</span>
                    <span>Mappable Items: {v.catalogItems}</span>
                  </div>
                </button>
              ))}
              {matchedVendors.length === 0 && (
                <p className="p-4 text-center text-content-muted italic">
                  No matching partner APIs found.
                </p>
              )}
            </div>
          </div>

          {/* Catalog SKUs Column */}
          <div
            className="flex flex-col gap-2.5"
            id="search-column-parts"
          >
            <span className="text-[10px] tracking-widest text-content-primary0 font-bold uppercase flex items-center gap-1.5 px-1 shrink-0">
              <Database className="w-3.5 h-3.5 text-status-success" /> Sourced Parts
              ({matchedSkus.length})
            </span>
            <div className="flex-1 pr-1 space-y-2">
              {matchedSkus.map((s) => (
                <button type="button"
                  key={s.id}
                  id={`search-sku-${s.id}`}
                  onClick={() => onNavigate("catalog")}
                  className="w-full p-3 rounded-lg border text-left cursor-pointer transition-all hover:bg-white/5 block"
                  style={{
                    backgroundColor: "var(--color-surface-elevated)",
                    borderColor: "rgba(74, 133, 253,0.06)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-brand-indigo font-bold text-[10px]">
                      {highlightText(s.partNumber, query)}
                    </span>
                    <ArrowUpRight className="w-3 h-3 text-content-muted" />
                  </div>
                  <p className="text-content-primary font-bold mt-1.5 truncate leading-tight">
                    {highlightText(s.name, query)}
                  </p>
                  <div className="flex justify-between items-center text-[10px] font-mono text-content-primary0 mt-2">
                    <span className="capitalize">
                      {highlightText(s.type, query)}
                    </span>
                    <span className="text-status-success font-bold">
                      ${s.price.toLocaleString()}
                    </span>
                  </div>
                </button>
              ))}
              {matchedSkus.length === 0 && (
                <p className="p-4 text-center text-content-muted italic">
                  No matching hardware SKUs found.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          className="p-8 rounded-xl border border-dashed border-surface-elevated flex flex-col items-center justify-center gap-2"
          id="search-empty-state"
        >
          <p className="text-content-primary0 font-bold uppercase">
            No matched hardware records
          </p>
          <p className="text-[10px] text-content-muted text-center">
            Please verify parts terminology or update lists in the catalog
            ledgers.
          </p>
        </div>
      )) : (
        <div
          className="p-12 rounded-xl border border-dashed border-white/5 flex flex-col items-center justify-center gap-2.5"
          id="search-awaiting-state"
          style={{ backgroundColor: "rgba(74, 133, 253, 0.01)" }}
        >
          <Search className="w-8 h-8 text-brand-indigo/40" />
          <p className="text-content-secondary font-semibold uppercase tracking-wider text-[10px] mt-1 text-center">
            Awaiting Sourcing Query
          </p>
          <p className="text-[10px] text-content-muted text-center max-w-sm leading-relaxed">
            Enter a search term above, or select one of the quick suggestions to search across active client workflows, hardware parts, and live vendor APIs.
          </p>
        </div>
      )}
    </motion.div>
    </ErrorBoundary>
  );
}
