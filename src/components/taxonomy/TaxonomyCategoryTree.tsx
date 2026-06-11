import React from 'react';
import { motion, AnimatePresence } from "motion/react";

interface TaxonomyCategoryTreeProps {
  categories: any[];
  skus: any[];
  data: any;
  filterOrphansOnly: boolean;
  expandedNode: string | null;
  toggleNode: (nodeId: string) => void;
}

export function TaxonomyCategoryTree({
  categories,
  skus,
  data,
  filterOrphansOnly,
  expandedNode,
  toggleNode,
}: TaxonomyCategoryTreeProps) {
  return (
    <div className="flex gap-10 justify-center items-start flex-wrap -mt-8">
      {categories.map(cat => {
        const mappedSkus = skus.filter(s => 
          data.edges.some(e => e.source === cat.id && e.target === s.id)
        );

        // Skip category rendering if filterOrphansOnly is active and this has no orphans
        const hasOrphansInCategory = mappedSkus.some(s => data.unmappedIds.includes(s.id));
        if (filterOrphansOnly && !hasOrphansInCategory) return null;

        return (
          <div key={cat.id} className="flex flex-col items-center gap-6 p-4 rounded-xl bg-indigo-900/5 border border-indigo-500/5">
            {/* Category Label Card */}
            <div 
              className="p-3 rounded-lg border border-indigo-500/20 bg-surface-elevated w-48 text-center"
            >
              <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block font-mono">
                {cat.label.replace(" Subsystem", "")}
              </span>
              <span className="text-[8px] text-gray-500 font-mono mt-0.5 block uppercase">
                {mappedSkus.length} Configured Parts
              </span>
            </div>

            {/* SKUs under Category */}
            <div className="flex flex-col gap-3.5 w-48">
              {mappedSkus.map(child => {
                const isOrphan = data.unmappedIds.includes(child.id);
                
                return (
                  <motion.div 
                    key={child.id}
                    onClick={() => toggleNode(child.id)}
                    className={`node-card p-2.5 rounded-lg border text-left cursor-pointer transition-all w-full relative ${
                      isOrphan 
                        ? 'border-rose-500/40 bg-rose-500/5 hover:bg-rose-500/10 shadow-lg shadow-rose-950/20' 
                        : expandedNode === child.id 
                          ? 'border-indigo-400 bg-indigo-950/30' 
                          : 'border-white/5 bg-surface-elevated/70 hover:bg-surface-elevated'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex justify-between items-center gap-1">
                      <span className={`text-[10px] font-bold font-mono truncate ${isOrphan ? 'text-rose-400' : 'text-gray-300'}`}>
                        {child.label}
                      </span>
                      {isOrphan && (
                        <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                          ORPHAN
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-gray-500 mt-1 truncate max-w-[160px]">{child.sublabel}</p>

                    <AnimatePresence>
                      {expandedNode === child.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute top-14 left-0 right-0 bg-black/95 border border-indigo-500/30 rounded-xl p-3 text-left shadow-2xl z-40"
                          onClick={e => e.stopPropagation()}
                        >
                          <span className="text-[9px] font-bold text-indigo-300 block mb-1 uppercase font-mono">Constraints</span>
                          <div className="space-y-1 text-[8.5px] text-gray-300 leading-snug">
                            {child.constraints?.map((c: string, i: number) => (
                              <div key={i} className="flex items-start gap-1">
                                <span className="text-indigo-400 font-bold">•</span>
                                <span>{c}</span>
                              </div>
                            )) || <div>No constraints specified.</div>}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
