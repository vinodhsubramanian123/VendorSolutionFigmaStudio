import React, { useState } from "react";
import { X, ArrowRight, Save, LayoutTemplate } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Config } from "../../types";
import { ModalBackdrop } from "../shared/ModalBackdrop";

interface SplitConfigWizardProps {
  isOpen: boolean;
  onClose: () => void;
  sourceConfig: Config | null;
  onConfirmSplit: (sourceId: string, destName: string, moveQuantities: Record<string, number>) => void;
}

export function SplitConfigWizard({ isOpen, onClose, sourceConfig, onConfirmSplit }: SplitConfigWizardProps) {
  const [destName, setDestName] = useState("Split Configuration");
  const [moveQuantities, setMoveQuantities] = useState<Record<string, number>>({});

  if (!isOpen || !sourceConfig) return null;

  const handleSliderChange = (partNumber: string, value: number) => {
    setMoveQuantities(prev => ({
      ...prev,
      [partNumber]: value
    }));
  };

  const handleConfirm = () => {
    onConfirmSplit(sourceConfig.id, destName, moveQuantities);
    onClose();
  };

  const isAnythingMoved = Object.values(moveQuantities).some(q => q > 0);

  return (
    <AnimatePresence>
      {isOpen && sourceConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <ModalBackdrop onClick={onClose} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-surface-elevated border border-white/10 rounded-xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh] z-10"
          >
            
            {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-surface/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-indigo/20 rounded-lg">
              <LayoutTemplate className="w-5 h-5 text-brand-indigo" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-content-primary">Split Configuration Wizard (1-to-N)</h2>
              <p className="text-xs text-content-secondary">Diverge {sourceConfig.name} into two separate workflows.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-white/5 text-content-secondary hover:text-content-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Name Input */}
        <div className="px-6 py-4 border-b border-white/5 bg-surface-canvas/20 flex items-center gap-4">
          <label htmlFor="split-config-dest-name" className="text-sm text-content-secondary">New Destination Config Name:</label>
          <input
            id="split-config-dest-name"
            type="text"
            value={destName}
            onChange={e => setDestName(e.target.value)}
            className="flex-1 bg-surface-canvas/40 border border-white/10 rounded-lg px-3 py-1.5 text-content-primary focus:outline-none focus:border-brand-indigo/50"
          />
        </div>

        {/* Side by Side */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-8">
          {/* Source Side */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-content-secondary mb-2 border-b border-white/5 pb-2">Source: {sourceConfig.name}</h3>
            {sourceConfig.items.map(item => {
              const moved = moveQuantities[item.partNumber] || 0;
              const remaining = item.quantity - moved;
              return (
                <div key={item.id} className="p-3 bg-surface-canvas/40 border border-white/5 rounded-lg flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-mono text-xs text-indigo-300">{item.partNumber}</div>
                      <div className="text-sm text-content-secondary truncate max-w-[200px]" title={item.name}>{item.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-content-primary0">Remaining</div>
                      <div className="text-lg font-mono font-bold text-content-primary">{remaining}</div>
                    </div>
                  </div>
                  
                  {/* Slider */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-content-primary0">0</span>
                    <input 
                      type="range"
                      min="0"
                      max={item.quantity}
                      value={moved}
                      onChange={e => handleSliderChange(item.partNumber, parseInt(e.target.value, 10))}
                      className="flex-1 accent-indigo-500"
                    />
                    <span className="text-xs text-content-primary0">{item.quantity}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Destination Side */}
          <div className="flex flex-col gap-3 border-l border-white/5 pl-8 relative">
            <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface-elevated border border-white/10 flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-brand-indigo" />
            </div>

            <h3 className="text-sm font-medium text-status-success mb-2 border-b border-white/5 pb-2">Destination: {destName}</h3>
            {sourceConfig.items.map(item => {
              const moved = moveQuantities[item.partNumber] || 0;
              if (moved === 0) return null;
              return (
                <div key={`dest-${item.id}`} className="p-3 bg-brand-indigo/10 border border-brand-indigo/20 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-mono text-xs text-indigo-300">{item.partNumber}</div>
                    <div className="text-sm text-content-primary truncate max-w-[200px]">{item.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-indigo-300/70">Moving</div>
                    <div className="text-lg font-mono font-bold text-status-success">+{moved}</div>
                  </div>
                </div>
              );
            })}
            
            {!isAnythingMoved && (
              <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/5 rounded-lg">
                <span className="text-content-primary0 text-sm">Use the sliders to move quantities here</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 bg-surface/50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-content-secondary hover:text-content-primary transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={!isAnythingMoved}
            className="px-6 py-2 bg-brand-indigo hover:bg-brand-indigo disabled:opacity-50 disabled:cursor-not-allowed text-content-primary font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Confirm Split
          </button>
          </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
