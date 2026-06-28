import React, { useState } from "react";
import { motion } from "framer-motion";
import { Edit2, Check, X, Trash2 } from "lucide-react";
import type { BOMItem } from "../../types";

interface CleansingEditorRowProps {
  item: BOMItem;
  onUpdateQuantity: (partNumber: string, oldQuantity: number, newQuantity: number) => void;
  onRemove: (partNumber: string) => void;
  isRemoved?: boolean;
  parentMultiplier?: number;
}

export function CleansingEditorRow({ item, onUpdateQuantity, onRemove, isRemoved, parentMultiplier }: CleansingEditorRowProps) {
  const [isEditingQty, setIsEditingQty] = useState(false);
  const [draftQty, setDraftQty] = useState(item.quantity.toString());

  const handleSaveQty = () => {
    const parsed = parseInt(draftQty, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      if (parsed !== item.quantity) {
        onUpdateQuantity(item.partNumber, item.quantity, parsed);
      }
      setIsEditingQty(false);
    } else {
      setDraftQty(item.quantity.toString());
      setIsEditingQty(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSaveQty();
    if (e.key === "Escape") {
      setDraftQty(item.quantity.toString());
      setIsEditingQty(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isRemoved ? 0.4 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`group relative grid grid-cols-12 gap-4 items-center p-4 border-b border-white/5 bg-surface hover:bg-surface-elevated transition-colors ${
        isRemoved ? "relative before:absolute before:inset-0 before:top-1/2 before:h-px before:bg-red-500/50 before:z-10" : ""
      }`}
    >
      <div className="col-span-2">
        <span className="font-mono text-sm text-gray-300">{item.partNumber}</span>
      </div>
      <div className="col-span-4 flex flex-col">
        <span className="text-sm font-medium text-white truncate" title={item.name}>
          {item.name}
        </span>
        <span className="text-xs text-gray-500">{item.type}</span>
      </div>
      
      {/* Quantity Column - Interactive */}
      <div className="col-span-3 flex items-center gap-2">
        {isEditingQty ? (
          <div className="flex items-center gap-2 bg-black/40 rounded-md border border-indigo-500/50 p-1">
            <input
              autoFocus
              type="number"
              min="0"
              value={draftQty}
              onChange={(e) => setDraftQty(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-16 bg-transparent text-white text-sm font-mono text-center outline-none"
            />
            <button onClick={handleSaveQty} className="text-emerald-400 hover:bg-emerald-400/10 p-1 rounded transition-colors" title="Save">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => { setDraftQty(item.quantity.toString()); setIsEditingQty(false); }} className="text-gray-400 hover:text-white hover:bg-white/10 p-1 rounded transition-colors" title="Cancel">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => !isRemoved && setIsEditingQty(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border border-transparent font-mono text-sm cursor-pointer transition-colors ${
              isRemoved ? "text-gray-500" : "text-white hover:border-white/10 hover:bg-white/5 group-hover:text-indigo-300"
            }`}
            title={isRemoved ? "" : "Click to edit quantity"}
          >
            {parentMultiplier && parentMultiplier > 1 ? (
              <span className="flex items-center gap-1.5">
                <span className="text-gray-400">{item.quantity / parentMultiplier}</span>
                <span className="text-gray-600 text-xs">×</span>
                <span className="text-gray-400">{parentMultiplier}</span>
                <span className="text-gray-600 text-xs">=</span>
                <span className="text-indigo-300 font-bold">{item.quantity}</span>
              </span>
            ) : (
              <span>{item.quantity}</span>
            )}
            {!isRemoved && <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500" />}
          </div>
        )}
      </div>

      <div className="col-span-2 text-right">
        <span className="font-mono text-sm text-gray-400">${item.unitPrice.toLocaleString()}</span>
      </div>

      <div className="col-span-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
        {!isRemoved && (
          <button 
            onClick={() => onRemove(item.partNumber)}
            className="p-2 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
            title="Mark for Removal"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
