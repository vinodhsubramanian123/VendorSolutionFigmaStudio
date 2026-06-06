import { Database, Globe, Target, Search, ArrowUpRight } from 'lucide-react';
import type { AppView, UCID, Vendor, CatalogSKU } from '../types';

interface SearchViewProps {
  query: string;
  ucids: UCID[];
  vendors: Vendor[];
  catalogSkus: CatalogSKU[];
  onNavigate: (view: AppView) => void;
  onSelectMission: (id: string) => void;
}

export function SearchView({
  query,
  ucids,
  vendors,
  catalogSkus,
  onNavigate,
  onSelectMission,
}: SearchViewProps) {
  const normQuery = query.toLowerCase().trim();

  // Filter matched records
  const matchedMissions = ucids.filter(
    (u) =>
      u.displayId.toLowerCase().includes(normQuery) ||
      u.name.toLowerCase().includes(normQuery) ||
      u.projectRef.toLowerCase().includes(normQuery)
  );

  const matchedVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(normQuery) ||
      v.shortName.toLowerCase().includes(normQuery)
  );

  const matchedSkus = catalogSkus.filter(
    (s) =>
      s.partNumber.toLowerCase().includes(normQuery) ||
      s.name.toLowerCase().includes(normQuery) ||
      s.type.toLowerCase().includes(normQuery)
  );

  const totalMatches = matchedMissions.length + matchedVendors.length + matchedSkus.length;

  return (
    <div className="space-y-4 animate-fadeIn select-none leading-normal text-xs">
      {/* Search Header Banner */}
      <div 
        className="p-4 rounded-xl border flex items-center justify-between"
        style={{ background: 'rgba(74,133,253,0.03)', borderColor: 'rgba(74,133,253,0.1)' }}
      >
        <div className="flex items-center gap-2.5">
          <Search className="text-indigo-400 w-5 h-5" />
          <div>
            <p className="text-xs text-white font-bold">Unified Sourcing Search Lookup Analyzer</p>
            <p className="text-[10px] text-gray-500">
              Matched {totalMatches} elements for keyword pattern: &quot;{query}&quot;
            </p>
          </div>
        </div>
      </div>

      {totalMatches > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Workflows Column */}
          <div className="space-y-2.5">
            <span className="text-[10px] tracking-widest text-gray-500 font-bold uppercase flex items-center gap-1.5 px-1">
              <Target className="w-3.5 h-3.5 text-[#ff9b36]" /> Workflows ({matchedMissions.length})
            </span>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {matchedMissions.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onSelectMission(m.id)}
                  className="w-full p-3 rounded-lg border text-left cursor-pointer transition-all hover:bg-white/5 block"
                  style={{ backgroundColor: '#0b1220', borderColor: 'rgba(74,133,253,0.06)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-indigo-400 font-bold text-[10px]">{m.displayId}</span>
                    <ArrowUpRight className="w-3 h-3 text-gray-600" />
                  </div>
                  <p className="text-white font-bold mt-1.5 leading-tight">{m.name}</p>
                  <p className="text-gray-500 text-[10px] mt-1 font-mono">Ref: {m.projectRef}</p>
                </button>
              ))}
              {matchedMissions.length === 0 && (
                <p className="p-4 text-center text-gray-600 italic">No matching workflows found.</p>
              )}
            </div>
          </div>

          {/* Vendors Column */}
          <div className="space-y-2.5">
            <span className="text-[10px] tracking-widest text-gray-500 font-bold uppercase flex items-center gap-1.5 px-1">
              <Globe className="w-3.5 h-3.5 text-indigo-400" /> Connected APIs ({matchedVendors.length})
            </span>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {matchedVendors.map((v) => (
                <button
                  key={v.id}
                  onClick={() => onNavigate('vendor-portal')}
                  className="w-full p-3 rounded-lg border text-left cursor-pointer transition-all hover:bg-white/5 block animate-fadeIn"
                  style={{ backgroundColor: '#0b1220', borderColor: 'rgba(74,133,253,0.06)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white uppercase text-[10px]">{v.shortName} API Router</span>
                    <ArrowUpRight className="w-3 h-3 text-gray-600" />
                  </div>
                  <p className="text-gray-300 font-medium mt-1">{v.name}</p>
                  <div className="flex gap-2 text-[10px] text-gray-500 font-mono mt-2">
                    <span>API Vitality: {v.apiHealth}%</span>
                    <span>·</span>
                    <span>Mappable Items: {v.catalogItems}</span>
                  </div>
                </button>
              ))}
              {matchedVendors.length === 0 && (
                <p className="p-4 text-center text-gray-600 italic">No matching partner APIs found.</p>
              )}
            </div>
          </div>

          {/* Catalog SKUs Column */}
          <div className="space-y-2.5">
            <span className="text-[10px] tracking-widest text-gray-500 font-bold uppercase flex items-center gap-1.5 px-1">
              <Database className="w-3.5 h-3.5 text-[#00d4a0]" /> Sourced Parts ({matchedSkus.length})
            </span>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {matchedSkus.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onNavigate('catalog')}
                  className="w-full p-3 rounded-lg border text-left cursor-pointer transition-all hover:bg-white/5 block"
                  style={{ backgroundColor: '#0b1220', borderColor: 'rgba(74,133,253,0.06)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-indigo-400 font-bold text-[10px]">{s.partNumber}</span>
                    <ArrowUpRight className="w-3 h-3 text-gray-600" />
                  </div>
                  <p className="text-white font-bold mt-1.5 truncate leading-tight">{s.name}</p>
                  <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 mt-2">
                    <span className="capitalize">{s.type}</span>
                    <span className="text-[#00d4a0] font-bold">${s.price.toLocaleString()}</span>
                  </div>
                </button>
              ))}
              {matchedSkus.length === 0 && (
                <p className="p-4 text-center text-gray-600 italic">No matching hardware SKUs found.</p>
              )}
            </div>
          </div>

        </div>
      ) : (
        <div className="p-8 rounded-xl border border-dashed border-gray-800 flex flex-col items-center justify-center gap-2">
          <p className="text-gray-500 font-bold uppercase">No matched hardware records</p>
          <p className="text-[10px] text-gray-600 text-center">Please verify parts terminology or update lists in the catalog ledgers.</p>
        </div>
      )}
    </div>
  );
}
