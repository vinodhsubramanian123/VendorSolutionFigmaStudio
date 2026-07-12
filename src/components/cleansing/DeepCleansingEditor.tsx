import React, { useState } from "react";
import { AnimatePresence } from "motion/react";
import { Layers, Plus, SplitSquareHorizontal, Save } from "lucide-react";
import type { Config, BOMItem } from "../../types";
import { useToast } from "../shared/ToastContext";
import { CleansingEditorRow } from "./CleansingEditorRow";
import { AddBOQPartModal } from "./AddBOQPartModal";
import { SplitConfigWizard } from "./SplitConfigWizard";
import { BOQ_PRESETS } from "../../mocks/boqMocks";

export function DeepCleansingEditor() {
  const { toast } = useToast();
  
  // Deep Editor State (Mocking a loaded config for now)
  const [activeConfig, setActiveConfig] = useState<Config>(
    BOQ_PRESETS["divergence-split"].sols[0].vendorSubmissions[0].configs[0]
  );
  const [removedParts, setRemovedParts] = useState<Set<string>>(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Split Wizard State
  const [isSplitWizardOpen, setIsSplitWizardOpen] = useState(false);
  const [splitConfigs, setSplitConfigs] = useState<Config[]>([]);

  const handleUpdateQuantity = (partNumber: string, oldQty: number, newQty: number) => {
    setActiveConfig(prev => ({
      ...prev,
      items: prev.items.map(item => item.partNumber === partNumber ? { ...item, quantity: newQty } : item)
    }));
    toast(`Updated quantity for ${partNumber} from ${oldQty} to ${newQty}`, "success");
  };

  const handleToggleRemove = (partNumber: string) => {
    setRemovedParts(prev => {
      const next = new Set(prev);
      if (next.has(partNumber)) {
        next.delete(partNumber);
      } else {
        next.add(partNumber);
        toast(`Marked ${partNumber} for removal`, "warn");
      }
      return next;
    });
  };

  const handleAddPart = (partNumber: string, name: string, quantity: number, type: string, unitPrice: number) => {
    const newItem: BOMItem = {
      id: `item-${Date.now()}`,
      partNumber,
      name,
      type,
      quantity,
      unitPrice
    };
    setActiveConfig(prev => ({ ...prev, items: [...prev.items, newItem] }));
    toast(`Added ${quantity}x ${partNumber} to configuration`, "success");
  };

  const handleConfirmSplit = (sourceId: string, destName: string, moveQuantities: Record<string, number>) => {
    // Math to diverge
    const destItems: BOMItem[] = [];
    const sourceItems = activeConfig.items.map(item => {
      const moveQty = moveQuantities[item.partNumber] || 0;
      if (moveQty > 0) {
        destItems.push({ ...item, quantity: moveQty, id: `item-dest-${Date.now()}-${item.partNumber}` });
      }
      return { ...item, quantity: item.quantity - moveQty };
    }).filter(i => i.quantity > 0);

    const newDestConfig: Config = {
      id: `cfg-dest-${Date.now()}`,
      name: destName,
      totalPrice: 0,
      originalPrice: 0,
      items: destItems
    };

    setActiveConfig(prev => ({ ...prev, items: sourceItems }));
    setSplitConfigs(prev => [...prev, newDestConfig]);
    toast(`Successfully split into ${destName}!`, "success");
  };

  const handleCommitCleansedBOQ = () => {
    toast(`Batch Committing ${removedParts.size} deletions, updates, and ${splitConfigs.length} splits to Immutable Audit Trail.`, "success");
    // Mock clearing out removed parts 
    setActiveConfig(prev => ({
      ...prev,
      items: prev.items.filter(i => !removedParts.has(i.partNumber))
    }));
    setRemovedParts(new Set());
  };

  return (
    <div className="flex flex-col flex-1 h-full pb-20 overflow-hidden relative">
      {/* Editor Header Actions */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-lg font-semibold text-indigo-300 flex items-center gap-2">
          <Layers className="w-5 h-5" /> 
          Editing: {activeConfig.name}
        </h2>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-surface-canvas/40 border border-white/10 hover:border-white/20 text-content-primary rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4 text-status-success" /> Add Missing Part
          </button>
          <button 
            onClick={() => setIsSplitWizardOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-indigo/10 border border-brand-indigo/30 hover:border-brand-indigo/50 text-indigo-300 rounded-lg text-sm transition-colors"
          >
            <SplitSquareHorizontal className="w-4 h-4" /> Split Config (1-to-N)
          </button>
        </div>
      </div>

      {/* Editor Grid */}
      <div className="flex-1 border border-white/10 rounded-xl overflow-hidden bg-surface-canvas/20 flex flex-col mb-6">
        {/* Grid Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-white/10 bg-surface-canvas/40 text-xs font-semibold text-content-muted uppercase tracking-wider shrink-0">
          <div className="col-span-2">Part Number</div>
          <div className="col-span-4">Description</div>
          <div className="col-span-3">Quantity</div>
          <div className="col-span-2 text-right">Unit Price</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        
        {/* Rows */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence>
            {activeConfig.items.map(item => {
              const chassisItem = activeConfig.items.find(i => i.type.toLowerCase() === 'chassis');
              const parentMultiplier = chassisItem && item.type.toLowerCase() !== 'chassis' && item.quantity > chassisItem.quantity 
                ? chassisItem.quantity 
                : undefined;

              return (
                <CleansingEditorRow
                  key={item.id}
                  item={item}
                  isRemoved={removedParts.has(item.partNumber)}
                  parentMultiplier={parentMultiplier}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleToggleRemove}
                />
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* New Split Configs Preview */}
      {splitConfigs.length > 0 && (
         <div className="mb-6 shrink-0">
            <h3 className="text-sm font-medium text-content-secondary mb-3 uppercase tracking-wider">Diverged Configurations ({splitConfigs.length})</h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {splitConfigs.map(cfg => (
                <div key={cfg.id} className="min-w-[300px] p-4 bg-brand-indigo/5 border border-brand-indigo/20 rounded-xl">
                  <div className="font-medium text-indigo-300 mb-1">{cfg.name}</div>
                  <div className="text-xs text-content-muted mb-3">{cfg.items.length} Component Types</div>
                  <div className="space-y-1">
                    {cfg.items.slice(0, 3).map(i => (
                      <div key={i.id} className="flex justify-between text-xs">
                        <span className="text-content-secondary truncate pr-2">{i.name}</span>
                        <span className="text-content-primary font-mono shrink-0">x{i.quantity}</span>
                      </div>
                    ))}
                    {cfg.items.length > 3 && <div className="text-xs text-brand-indigo/50 pt-1">+{cfg.items.length - 3} more...</div>}
                  </div>
                </div>
              ))}
            </div>
         </div>
      )}

      {/* Batch Commit Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-white/10 flex items-center justify-between px-8 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-6">
          <div className="text-sm">
            <span className="text-content-secondary">Total Configs: </span>
            <span className="text-content-primary font-bold">{1 + splitConfigs.length}</span>
          </div>
          <div className="text-sm">
            <span className="text-content-secondary">Pending Changes: </span>
            <span className="text-status-success font-bold">{removedParts.size + splitConfigs.length}</span>
          </div>
        </div>
        <button 
          onClick={handleCommitCleansedBOQ}
          className="flex items-center gap-2 px-8 py-2 bg-status-success hover:bg-status-success text-black font-semibold rounded-lg transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >
          <Save className="w-5 h-5" /> Commit Cleansed BOQ
        </button>
      </div>
      
      {/* Modals */}
      <AddBOQPartModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAddPart={handleAddPart}
      />
      <SplitConfigWizard 
        isOpen={isSplitWizardOpen}
        onClose={() => setIsSplitWizardOpen(false)}
        sourceConfig={activeConfig}
        onConfirmSplit={handleConfirmSplit}
      />
    </div>
  );
}
