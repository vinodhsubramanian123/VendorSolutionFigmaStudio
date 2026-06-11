import React from 'react';
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
  expandedNodes: Record<string, boolean>;
  toggleNode: (id: string) => void;
  selectPathFn: (path: TaxonomyPath) => void;
  selectedPath: TaxonomyPath;
}

export const CatalogTaxonomyTree = React.memo(function CatalogTaxonomyTree({ expandedNodes, toggleNode, selectPathFn, selectedPath }: CatalogTaxonomyTreeProps) {
  const renderNode = (node: TaxonomyTreeNode, depth = 0) => {
    const isExpanded = !!expandedNodes[node.id];
    const isSelected = JSON.stringify(selectedPath) === JSON.stringify(node.path);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="select-none flex flex-col mt-0.5">
        <div 
          className={`flex items-center py-1.5 px-2 rounded cursor-pointer transition-colors ${isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-white/5 text-gray-300'}`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => selectPathFn(node.path)}
        >
          {hasChildren ? (
            <div 
              className="mr-1 p-0.5 rounded hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
            </div>
          ) : (
            <div className="w-4.5 h-3.5 mr-1" />
          )}
          <span className="text-[11px] font-semibold tracking-wide truncate">{node.label}</span>
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
    <div className="flex-1 flex flex-col overflow-y-auto pr-1 text-left custom-scrollbar">
      <div 
        className={`flex items-center py-1.5 px-2 rounded cursor-pointer transition-colors mb-2 ${selectedPath.vendor === 'all' ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-white/5 text-gray-300'}`}
        onClick={() => selectPathFn({ vendor: "all", solution: "all", product: "all", generation: "all", chassis: "all" })}
      >
        <Network className="w-3.5 h-3.5 mr-2 text-indigo-500/70" />
        <span className="text-[11px] font-bold tracking-wide uppercase font-mono">Global Catalog</span>
      </div>
      
      {taxonomyData.map(node => renderNode(node, 0))}
    </div>
  );
});
