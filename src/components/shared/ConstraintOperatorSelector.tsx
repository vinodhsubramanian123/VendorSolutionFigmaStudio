import React from 'react';
import { Settings2, SplitSquareHorizontal, CheckSquare2 } from 'lucide-react';

export type LogicalOperator = 'AND' | 'OR';

interface ConstraintOperatorSelectorProps {
  operator: LogicalOperator;
  onChange: (op: LogicalOperator) => void;
  selectedSkusCount: number;
}

export function ConstraintOperatorSelector({
  operator,
  onChange,
  selectedSkusCount
}: ConstraintOperatorSelectorProps) {
  return (
    <div className="flex flex-col gap-2 p-3 bg-surface-elevated/50 border border-white/5 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-indigo-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Combinatorics Operator</h4>
        </div>
        <span className="text-[10px] text-gray-500 font-mono">
          {selectedSkusCount} SKU{selectedSkusCount !== 1 && 's'} selected
        </span>
      </div>
      <p className="text-[10px] text-gray-400 leading-snug">
        Select how the active chassis constraint should combine the selected parts.
      </p>
      
      <div className="flex bg-black/40 p-1 rounded-lg border border-white/5 mt-1">
        <button
          onClick={() => onChange('AND')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all ${
            operator === 'AND'
              ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <CheckSquare2 className="w-3.5 h-3.5" />
          AND (Joint Req)
        </button>
        <button
          onClick={() => onChange('OR')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all ${
            operator === 'OR'
              ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <SplitSquareHorizontal className="w-3.5 h-3.5" />
          OR (Alternative)
        </button>
      </div>
      
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-md p-2 mt-1">
        <p className="text-[10px] text-indigo-300 font-mono text-center">
          Output Mapping: {operator === 'AND' ? 'SKU1, SKU2' : 'SKU1 | SKU2'}
        </p>
      </div>
    </div>
  );
}
