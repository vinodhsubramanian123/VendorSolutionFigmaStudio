import React, { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Target, Globe, Database, ArrowUpRight } from "lucide-react";
import type { UCID, Vendor, CatalogSKU } from "../../types";
import { tokens } from "../../styles/tokens";

interface TopBarSearchProps {
  searchQuery?: string;
  onSearch: (query: string) => void;
  ucids?: UCID[];
  vendors?: Vendor[];
  catalogSkus?: CatalogSKU[];
  onSelectMission?: (id: string) => void;
}

export function TopBarSearch({
  searchQuery,
  onSearch,
  ucids = [],
  vendors = [],
  catalogSkus = [],
  onSelectMission,
}: TopBarSearchProps) {
  const navigate = useNavigate();
  const [localQuery, setLocalQuery] = useState(searchQuery || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);
  if (searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(searchQuery);
    setLocalQuery(searchQuery || "");
  }

  const [prevLocalQuery, setPrevLocalQuery] = useState(localQuery);
  if (localQuery !== prevLocalQuery) {
    setPrevLocalQuery(localQuery);
    setActiveIndex(-1);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalQuery(val);
    onSearch(val);
    if (val.trim().length > 0) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const cleanQuery = localQuery.toLowerCase().trim();
  const { matchedMissions, matchedVendors, matchedSkus, hasMatches, allMatches } = useSearchMatching(cleanQuery, ucids, vendors, catalogSkus);

  const navigateToMatch = (match: { type: string; id: string }) => {
    if (match.type === "mission") {
      if (onSelectMission) onSelectMission(match.id);
      navigate(`/mission-control/${match.id}`);
    } else if (match.type === "vendor") {
      navigate("/vendor-portal");
    } else if (match.type === "sku") {
      navigate("/catalog");
    }
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1 < allMatches.length ? prev + 1 : 0));
      setShowDropdown(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 >= 0 ? prev - 1 : allMatches.length - 1));
      setShowDropdown(true);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowDropdown(false);
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < allMatches.length) {
        e.preventDefault();
        navigateToMatch(allMatches[activeIndex]);
      } else {
        setShowDropdown(false);
        navigate("/search");
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setShowDropdown(false);
      });
    });
  };

  return (
    <div className="relative w-32 sm:w-60 md:w-80" ref={dropdownRef}>
      <button type="button"
        onClick={() => inputRef.current?.focus()}
        className="absolute inset-y-0 left-3 flex items-center text-content-primary0 hover:text-brand-indigo transition-colors z-10"
        title="Focus Search Input"
      >
        <Search className="w-4 h-4" />
      </button>
      <input
        ref={inputRef}
        id="global-search-input"
        type="text"
        value={localQuery}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setIsFocused(true);
          if (localQuery.trim().length > 0) setShowDropdown(true);
        }}
        onBlur={handleBlur}
        placeholder="Search SKUs, vendors, processes..."
        className="w-full h-9 pl-9 pr-12 rounded-lg text-xs text-content-primary placeholder-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 border transition-all"
        style={{
          backgroundColor: "rgba(74, 133, 253,0.03)",
          borderColor: "rgba(74, 133, 253,0.12)",
        }}
      />
      <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-[9px] font-mono text-content-secondary">
        <span>↵ Enter</span>
      </div>

      {showDropdown && isFocused && cleanQuery.length > 0 && (
        <div
          className="absolute left-0 right-0 top-11 p-3 rounded-xl border shadow-2xl z-50 flex flex-col gap-3 animate-fadeIn text-[11px]"
          style={{
            backgroundColor: tokens.colors.background.card, 
            borderColor: "rgba(74,133,253,0.15)",
            backgroundImage: "linear-gradient(180deg, rgba(7,10,19,0.98) 0%, rgba(11,18,32,0.98) 100%)",
            backdropFilter: "blur(8px)",
          }}
        >
          {hasMatches ? (
            <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto scrollbar-thin pr-0.5">
              {matchedMissions.length > 0 && (
                <div className="flex flex-col gap-1">
                  <div className="text-[9px] uppercase font-bold text-content-primary0 flex items-center gap-1.5 px-2 pb-0.5 border-b border-white/5">
                    <Target className="w-3.5 h-3.5 text-status-warning" />
                    <span>Active Tracks ({matchedMissions.length})</span>
                  </div>
                  {matchedMissions.map((m, idx) => {
                    const isActive = idx === activeIndex;
                    return (
                      <button type="button"
                        key={m.id}
                        onClick={() => {
                          if (onSelectMission) onSelectMission(m.id);
                          navigate(`/mission-control/${m.id}`);
                          setShowDropdown(false);
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        className={`w-full flex items-center justify-between p-2 rounded text-left text-content-secondary hover:text-content-primary transition group cursor-pointer ${isActive ? 'bg-brand-indigo/20 text-content-primary border-l-2 border-brand-indigo' : 'hover:bg-brand-indigo/10'}`}
                      >
                        <span className="font-semibold text-indigo-300 group-hover:text-indigo-200 truncate pr-2 max-w-[120px]">{m.displayId}</span>
                        <span className="flex-1 truncate text-content-secondary group-hover:text-content-secondary text-right">{m.name}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-transparent group-hover:text-brand-indigo ml-1 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}

              {matchedVendors.length > 0 && (
                <div className="flex flex-col gap-1">
                  <div className="text-[9px] uppercase font-bold text-content-primary0 flex items-center gap-1.5 px-2 pb-0.5 border-b border-white/5">
                    <Globe className="w-3.5 h-3.5 text-status-success" />
                    <span>Vendor Partners ({matchedVendors.length})</span>
                  </div>
                  {matchedVendors.map((v, idx) => {
                    const flatIdx = matchedMissions.length + idx;
                    const isActive = flatIdx === activeIndex;
                    return (
                      <button type="button"
                        key={v.id}
                        onClick={() => {
                          navigate("/vendor-portal");
                          setShowDropdown(false);
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        className={`w-full flex items-center justify-between p-2 rounded text-left text-content-secondary hover:text-content-primary transition group cursor-pointer ${isActive ? 'bg-brand-indigo/20 text-content-primary border-l-2 border-brand-indigo' : 'hover:bg-brand-indigo/10'}`}
                      >
                        <span className="font-semibold text-emerald-300 group-hover:text-emerald-200">{v.shortName}</span>
                        <span className="flex-1 truncate text-content-secondary group-hover:text-content-secondary text-right">{v.name}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-transparent group-hover:text-status-success ml-1 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}

              {matchedSkus.length > 0 && (
                <div className="flex flex-col gap-1">
                  <div className="text-[9px] uppercase font-bold text-content-primary0 flex items-center gap-1.5 px-2 pb-0.5 border-b border-white/5">
                    <Database className="w-3.5 h-3.5 text-brand-indigo" />
                    <span>Inventory SKUs ({matchedSkus.length})</span>
                  </div>
                  {matchedSkus.map((s, idx) => {
                    const flatIdx = matchedMissions.length + matchedVendors.length + idx;
                    const isActive = flatIdx === activeIndex;
                    return (
                      <button type="button"
                        key={s.id}
                        onClick={() => {
                          navigate("/catalog");
                          setShowDropdown(false);
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        className={`w-full flex items-center justify-between p-2 rounded text-left text-content-secondary hover:text-content-primary transition group cursor-pointer ${isActive ? 'bg-brand-indigo/20 text-content-primary border-l-2 border-brand-indigo' : 'hover:bg-brand-indigo/10'}`}
                      >
                        <span className="font-mono text-indigo-300 group-hover:text-indigo-200 truncate pr-2 max-w-[120px]">{s.partNumber}</span>
                        <span className="flex-1 truncate text-content-secondary group-hover:text-content-secondary text-right">{s.name}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-transparent group-hover:text-brand-indigo ml-1 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-content-primary0">
              No direct quick matches. Press Enter ↵ to trigger comprehensive Sourcing Query.
            </div>
          )}

          <div className="mt-1 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-content-secondary font-medium">
            <span>↵ Press Enter to review details</span>
            <button type="button"
              onClick={() => {
                setShowDropdown(false);
                navigate("/search");
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                setShowDropdown(false);
                navigate("/search");
              }}
              className="text-brand-indigo hover:text-indigo-300 flex items-center gap-0.5 font-bold cursor-pointer hover:underline"
            >
              Open Sourcing Explorer &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function useSearchMatching(cleanQuery: string, ucids: UCID[], vendors: Vendor[], catalogSkus: CatalogSKU[]) {
  const matchedMissions = useMemo(() => cleanQuery ? (ucids || []).filter(u =>
    (u.displayId || "").toLowerCase().includes(cleanQuery) ||
    (u.name || "").toLowerCase().includes(cleanQuery) ||
    (u.projectRef || "").toLowerCase().includes(cleanQuery)
  ).slice(0, 3) : [], [cleanQuery, ucids]);

  const matchedVendors = useMemo(() => cleanQuery ? (vendors || []).filter(v =>
    (v.name || "").toLowerCase().includes(cleanQuery) ||
    (v.shortName || "").toLowerCase().includes(cleanQuery)
  ).slice(0, 3) : [], [cleanQuery, vendors]);

  const matchedSkus = useMemo(() => cleanQuery ? (catalogSkus || []).filter(s =>
    (s.partNumber || "").toLowerCase().includes(cleanQuery) ||
    (s.name || "").toLowerCase().includes(cleanQuery)
  ).slice(0, 3) : [], [cleanQuery, catalogSkus]);

  const hasMatches = matchedMissions.length > 0 || matchedVendors.length > 0 || matchedSkus.length > 0;

  const allMatches = useMemo(() => {
    const list: Array<
      | { type: "mission"; id: string }
      | { type: "vendor"; id: string }
      | { type: "sku"; id: string }
    > = [];
    matchedMissions.forEach(m => list.push({ type: "mission", id: m.id }));
    matchedVendors.forEach(v => list.push({ type: "vendor", id: v.id }));
    matchedSkus.forEach(s => list.push({ type: "sku", id: s.id }));
    return list;
  }, [matchedMissions, matchedVendors, matchedSkus]);

  return { matchedMissions, matchedVendors, matchedSkus, allMatches, hasMatches };
}
