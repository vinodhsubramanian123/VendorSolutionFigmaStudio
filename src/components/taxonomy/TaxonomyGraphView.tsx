import React, { useState } from 'react';
import { Share2, Network, RefreshCw, ZoomIn, Filter, CheckCircle2 } from 'lucide-react';

export function TaxonomyGraphView() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [nodesResolved, setNodesResolved] = useState(false);

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setNodesResolved(true);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full max-w-7xl mx-auto animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1 flex items-center gap-2">
            <Network className="w-6 h-6 text-indigo-400" />
            Taxonomy Graph & Cleansing Workshop
          </h1>
          <p className="text-sm text-gray-400">
            Interactive visual validation of hardware hierarchy and socket compatibility.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-header border border-white/5 rounded-lg text-sm text-gray-300 hover:text-white transition">
            <Filter className="w-4 h-4" /> Filter Orphans
          </button>
          <button 
            onClick={handleSimulate}
            disabled={isSimulating}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 border border-indigo-400/30 rounded-lg text-sm font-bold text-white transition disabled:opacity-50"
          >
            {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            Auto-Repair Graph
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 w-full bg-surface-card border border-white/5 rounded-xl flex items-center justify-center relative overflow-hidden min-h-[500px]">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        
        {/* Mock Graphic */}
        <div className="z-10 text-center flex flex-col items-center">
          <div className="relative mb-8">
            {/* Server Node */}
            <div className="w-32 h-16 bg-surface-elevated border-2 border-indigo-500/50 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-8 mx-auto relative z-20">
              <span className="font-mono text-xs font-bold text-indigo-300">Base Chassis</span>
            </div>
            
            {/* Edges */}
            <div className="absolute top-16 left-1/2 w-[2px] h-8 bg-indigo-500/30 -translate-x-1/2" />
            <div className="absolute top-20 left-1/2 w-48 h-[2px] bg-indigo-500/30 -translate-x-1/2" />
            
            <div className="absolute top-20 left-1/2 w-[2px] h-6 bg-indigo-500/30 -translate-x-24" />
            <div className="absolute top-20 left-1/2 w-[2px] h-6 bg-indigo-500/30 translate-x-24" />

            <div className="flex gap-16 justify-center">
              {/* CPU Node */}
              <div className="w-24 h-12 bg-surface-header border hover:border-white/20 border-white/10 rounded flex items-center justify-center">
                <span className="font-mono text-[10px] text-gray-400">Processor</span>
              </div>
              
              {/* Orphans */}
              <div className={`w-28 h-12 flex items-center justify-center border-2 transition-all duration-700 rounded shadow-lg ${nodesResolved ? "bg-emerald-500/10 border-emerald-500/50 shadow-emerald-500/20" : "bg-red-500/10 border-red-500/50 shadow-red-500/20"}`}>
                <span className={`font-mono text-[10px] font-bold ${nodesResolved ? "text-emerald-400" : "text-red-400"}`}>
                  {nodesResolved ? "Mapped: Memory" : "Orphan: RAMx8"}
                </span>
                {nodesResolved && <CheckCircle2 className="w-3 h-3 text-emerald-400 absolute -top-1 -right-1 bg-black rounded-full" />}
              </div>
            </div>
          </div>
          
          <div className="bg-black/50 backdrop-blur px-6 py-4 rounded-xl border border-white/5 inline-block text-left">
            <h3 className="text-sm font-bold text-white mb-2">Knowledge Graph Linkages</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Validated hardware relationships</li>
              <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Auto-resolved socket constraints</li>
              <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> Detected 1 unmapped variant constraint</li>
            </ul>
          </div>
        </div>

        {/* Tools floating */}
        <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-surface-header border border-white/10 p-1 rounded-lg shadow-2xl">
          <button className="p-2 hover:bg-white/5 rounded transition focus:outline-none"><ZoomIn className="w-4 h-4 text-gray-400" /></button>
        </div>
      </div>
    </div>
  );
}
