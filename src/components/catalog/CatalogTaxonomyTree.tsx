import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Network } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TaxonomyTreeNode {
  id: string;
  label: string;
  path: {
    vendor: string;
    solution: string;
    product: string;
    generation: string;
    chassis: string;
  };
  children?: TaxonomyTreeNode[];
}

const taxonomyData: TaxonomyTreeNode[] = [
  {
    id: 'hpe',
    label: 'HPE',
    path: { vendor: 'HPE', solution: 'all', product: 'all', generation: 'all', chassis: 'all' },
    children: [
      {
        id: 'hpe_Server',
        label: 'Servers',
        path: { vendor: 'HPE', solution: 'Server', product: 'all', generation: 'all', chassis: 'all' },
        children: [
          {
            id: 'hpe_Server_DL380',
            label: 'ProLiant DL380',
            path: { vendor: 'HPE', solution: 'Server', product: 'DL380', generation: 'all', chassis: 'all' },
            children: [
              {
                id: 'hpe_Server_DL380_Gen11',
                label: 'Gen11',
                path: { vendor: 'HPE', solution: 'Server', product: 'DL380', generation: 'Gen11', chassis: 'all' }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'dell',
    label: 'Dell',
    path: { vendor: 'Dell', solution: 'all', product: 'all', generation: 'all', chassis: 'all' },
    children: [
      {
        id: 'dell_Server',
        label: 'Servers',
        path: { vendor: 'Dell', solution: 'Server', product: 'all', generation: 'all', chassis: 'all' }
      }
    ]
  },
  {
    id: 'cisco',
    label: 'Cisco',
    path: { vendor: 'Cisco', solution: 'all', product: 'all', generation: 'all', chassis: 'all' }
  },
  {
    id: 'juniper',
    label: 'Juniper',
    path: { vendor: 'Juniper', solution: 'all', product: 'all', generation: 'all', chassis: 'all' }
  }
];

import type { TaxonomyPath } from "../../types";

interface CatalogTaxonomyTreeProps {
  selectPathFn: (path: TaxonomyPath) => void;
  selectedPath: TaxonomyPath;
}

export const CatalogTaxonomyTree = React.memo(function CatalogTaxonomyTree({ selectPathFn, selectedPath }: CatalogTaxonomyTreeProps) {
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

  const toggleNode = (id: string) => {
    setExpandedNodes((prev: Record<string, boolean>) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  const renderNode = (node: TaxonomyTreeNode, depth = 0) => {
    const isExpanded = !!expandedNodes[node.id];
    const isSelected = JSON.stringify(selectedPath) === JSON.stringify(node.path);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="select-none flex flex-col mt-0.5 relative">
        <div 
          className={`flex items-center py-1 px-1 rounded transition-colors relative z-10 ${isSelected ? 'bg-brand-indigo/20 text-indigo-300' : 'hover:bg-white/5 text-content-secondary'}`}
          style={{ paddingLeft: `${depth * 16 + 4}px` }}
        >
          {depth > 0 && Array.from({ length: depth }).map((_, i) => (
             <div key={i} className="absolute top-0 bottom-0 border-l border-white/10 -z-10" style={{ left: `${i * 16 + 12}px` }} />
          ))}
          {hasChildren ? (
            <button
              type="button"
              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${node.label}`}
              tabIndex={0}
              className="mr-1 p-1 rounded hover:bg-white/10 text-content-secondary cursor-pointer border-0 bg-transparent flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              onKeyDown={(e) => handleKeyDown(e, () => toggleNode(node.id))}
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <div className="w-5 h-5 mr-1" />
          )}
          <button
            type="button"
            tabIndex={0}
            className="flex-1 flex items-center py-1 px-1 cursor-pointer text-left border-0 bg-transparent text-inherit"
            onClick={() => selectPathFn(node.path)}
            onKeyDown={(e) => handleKeyDown(e, () => selectPathFn(node.path))}
            aria-label={`Select ${node.label} path`}
          >
            <span className="text-[11px] font-semibold tracking-wide truncate">{node.label}</span>
          </button>
        </div>
        
        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {node.children!.map(child => renderNode(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <nav className="flex-1 flex flex-col overflow-y-auto pr-1 text-left custom-scrollbar" aria-label="Manufacturer Taxonomy">
      <button 
        type="button"
        tabIndex={0}
        aria-label="Select Global Catalog path"
        className={`w-full flex items-center py-1.5 px-2 rounded cursor-pointer transition-colors mb-2 border-0 bg-transparent text-left ${selectedPath.vendor === 'all' ? 'bg-brand-indigo/20 text-indigo-300' : 'hover:bg-white/5 text-content-secondary'}`}
        onClick={() => selectPathFn({ vendor: "all", solution: "all", product: "all", generation: "all", chassis: "all" })}
        onKeyDown={(e) => handleKeyDown(e, () => selectPathFn({ vendor: "all", solution: "all", product: "all", generation: "all", chassis: "all" }))}
      >
        <Network className="w-3.5 h-3.5 mr-2 text-brand-indigo/70" />
        <span className="text-[11px] font-bold tracking-wide uppercase font-mono">Global Catalog</span>
      </button>
      
      {taxonomyData.map(node => renderNode(node, 0))}
    </nav>
  );
});
