import React, { useState } from 'react';
import { Share2, Network, RefreshCw, ZoomIn, Filter, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from "motion/react";

export function TaxonomyGraphView() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [nodesResolved, setNodesResolved] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [expandedNode, setExpandedNode] = useState<string | null>(null);

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setNodesResolved(true);
    }, 2000);
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNode(prev => prev === nodeId ? null : nodeId);
  };

  return (
    <motion.div 
      className="flex flex-col gap-6 w-full h-full max-w-7xl mx-auto"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", staggerChildren: 0.1 }}
    >
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
            <motion.div 
              className={`w-32 h-16 rounded-lg flex items-center justify-center shadow-lg transition-all cursor-pointer relative z-20 ${expandedNode === 'base' ? 'bg-indigo-500/20 border-2 border-indigo-400 shadow-indigo-500/40' : 'bg-surface-elevated border-2 border-indigo-500/50 shadow-indigo-500/20'} mx-auto`}
              onMouseEnter={() => setHoveredNode('base')}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => toggleNode('base')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="font-mono text-xs font-bold text-indigo-300">Base Chassis</span>
              
              <AnimatePresence>
                {hoveredNode === 'base' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: -5 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border border-white/20 shadow-xl text-white text-[10px] whitespace-nowrap px-3 py-1.5 rounded z-50 pointer-events-none"
                  >
                    HPE ProLiant DL380 Gen10
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {expandedNode === 'base' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="absolute top-16 left-1/2 -translate-x-1/2 mt-2 w-48 bg-surface-elevated border border-indigo-500/30 rounded-lg overflow-hidden text-left p-3 z-40 shadow-2xl cursor-default"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-[10px] text-indigo-300 font-bold mb-1 uppercase tracking-wider font-mono">Attributes</div>
                    <ul className="text-[10px] text-gray-300 space-y-1">
                      <li className="flex justify-between"><span>Form Factor:</span> <span className="text-white">2U Rack</span></li>
                      <li className="flex justify-between"><span>Drive Bays:</span> <span className="text-white">8 SFF</span></li>
                      <li className="flex justify-between"><span>Max Memory:</span> <span className="text-white">3.0 TB</span></li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            {/* Edges */}
            <div className="absolute top-16 left-1/2 w-[2px] h-8 bg-indigo-500/30 -translate-x-1/2" />
            <div className="absolute top-20 left-1/2 w-48 h-[2px] bg-indigo-500/30 -translate-x-1/2" />
            
            <div className="absolute top-20 left-1/2 w-[2px] h-6 bg-indigo-500/30 -translate-x-24" />
            <div className="absolute top-20 left-1/2 w-[2px] h-6 bg-indigo-500/30 translate-x-24" />

            <div className="flex gap-16 justify-center mt-8">
              {/* CPU Node */}
              <motion.div 
                className={`w-24 h-12 rounded flex items-center justify-center cursor-pointer relative transition-colors ${expandedNode === 'cpu' ? 'bg-indigo-500/20 border border-indigo-400' : 'bg-surface-header border border-white/10 hover:border-white/20'}`}
                onMouseEnter={() => setHoveredNode('cpu')}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => toggleNode('cpu')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="font-mono text-[10px] text-gray-400">Processor</span>
                
                <AnimatePresence>
                  {hoveredNode === 'cpu' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: -5 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border border-white/20 text-white text-[10px] whitespace-nowrap px-3 py-1.5 rounded z-50 pointer-events-none shadow-xl"
                    >
                      Sockets: 2 • Intel Xeon
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {expandedNode === 'cpu' && (
                     <motion.div 
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: 'auto' }}
                       exit={{ opacity: 0, height: 0 }}
                       className="absolute top-12 left-1/2 -translate-x-1/2 mt-2 w-48 bg-surface-elevated border border-white/10 rounded-lg overflow-hidden text-left p-3 z-40 shadow-2xl cursor-default"
                       onClick={(e) => e.stopPropagation()}
                     >
                       <div className="text-[10px] text-gray-400 mb-2 uppercase tracking-wider font-mono">Compatible SKUs</div>
                       <ul className="text-[10px] text-white space-y-2 font-mono">
                         <li className="flex items-start gap-2 bg-black/20 p-1.5 rounded border border-white/5">
                           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1 shrink-0" />
                           <span>
                             <span className="text-gray-300">P40424-B21</span>
                             <span className="block text-[9px] text-gray-500 mt-0.5">Intel Xeon 4310 12-core</span>
                           </span>
                         </li>
                       </ul>
                     </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              
              {/* Orphans */}
              <motion.div 
                className={`w-28 h-12 flex items-center justify-center border-2 transition-all duration-700 rounded shadow-lg relative cursor-pointer ${nodesResolved ? "bg-emerald-500/10 border-emerald-500/50 shadow-emerald-500/20" : "bg-red-500/10 border-red-500/50 shadow-red-500/20"} ${expandedNode === 'ram' ? (nodesResolved ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-black' : 'ring-2 ring-red-400 ring-offset-2 ring-offset-black') : ''}`}
                onMouseEnter={() => setHoveredNode('ram')}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => toggleNode('ram')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className={`font-mono text-[10px] font-bold ${nodesResolved ? "text-emerald-400" : "text-red-400"}`}>
                  {nodesResolved ? "Mapped: Memory" : "Orphan: RAMx8"}
                </span>
                {nodesResolved && <CheckCircle2 className="w-3 h-3 text-emerald-400 absolute -top-1 -right-1 bg-black rounded-full" />}

                <AnimatePresence>
                  {hoveredNode === 'ram' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: -5 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border border-white/20 text-white text-[10px] whitespace-nowrap px-3 py-1.5 rounded z-50 pointer-events-none shadow-xl"
                    >
                      {nodesResolved ? 'DIMM Slots: 24 • Validated' : 'Unrecognized parent relationship'}
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {expandedNode === 'ram' && (
                     <motion.div 
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: 'auto' }}
                       exit={{ opacity: 0, height: 0 }}
                       className="absolute top-12 left-1/2 -translate-x-1/2 mt-2 w-52 bg-surface-elevated border border-white/10 rounded-lg overflow-hidden text-left p-3 z-40 shadow-2xl cursor-default"
                       onClick={(e) => e.stopPropagation()}
                     >
                       <div className="text-[10px] text-gray-400 mb-2 uppercase tracking-wider font-mono">Diagnostic Details</div>
                       <div className="text-[10px] text-gray-300 bg-black/20 p-2 rounded border border-white/5 leading-relaxed">
                         {nodesResolved ? 'Successfully mapped 8x 32GB RDIMM modules to the base chassis memory slots. Capacity constraints validated (Total: 256GB / 3.0TB Max).' : 'Failed to map P00924-B21. The SKU type does not match known memory taxonomy for this chassis. Manual review required.'}
                       </div>
                     </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
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
    </motion.div>
  );
}
