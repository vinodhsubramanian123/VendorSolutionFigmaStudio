import React from "react";
import { Layers } from "lucide-react";
import { VendorSubmission } from "../../types";
import { tokens } from "../../styles/tokens";

const TYPE_COLORS: Record<string, string> = {
  Chassis: tokens.colors.accent.indigo, 
  Processor: tokens.colors.accent.violet, 
  Memory: tokens.colors.status.success, 
  Drive: tokens.colors.status.warning, 
  "Network Adapter": tokens.colors.accent.cyan, 
};

interface SolutionConfigCardProps {
  submission: VendorSubmission;
  index: number;
  onUpdate: (sol: VendorSubmission) => void;
}

export function SolutionConfigCard({
  submission,
  index,
  onUpdate,
}: SolutionConfigCardProps) {
  function handleQtyChange(itemId: string, newQty: number) {
    if (newQty < 1) return;

    // deeply update the quantity inside the specific config
    const nextConfigs = submission.configs.map((cfg) => {
      const nextItems = cfg.items.map((item) => {
        if (item.id === itemId) return { ...item, quantity: newQty };
        return item;
      });
      const cfgTotalValue = nextItems.reduce(
        (acc, current) => acc + current.quantity * current.unitPrice,
        0,
      );
      const diff = cfg.originalPrice - cfg.totalPrice;
      return {
        ...cfg,
        items: nextItems,
        totalPrice: cfgTotalValue,
        originalPrice: cfgTotalValue + diff,
        savings: diff,
      };
    });

    const vTotalPrice = nextConfigs.reduce((s, c) => s + c.totalPrice, 0);
    const vOrgPrice = nextConfigs.reduce((s, c) => s + c.originalPrice, 0);

    onUpdate({
      ...submission,
      configs: nextConfigs,
      totalPrice: vTotalPrice,
      originalPrice: vOrgPrice,
      savings: vOrgPrice - vTotalPrice,
    });
  }

  const allItems = (submission.configs || []).flatMap((c) => c.items);

  return (
    <div className="p-4 rounded-xl border flex flex-col gap-3 bg-surface-card border-indigo-500/10">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-400" /> Alternative{" "}
          {index === 0 ? "A" : "B"} ({submission.vendor})
        </span>
        <span className="text-[10px] font-bold text-status-success bg-status-success/10 px-2 py-0.5 rounded-full">
          {submission.complianceScore}% compliant
        </span>
      </div>

      <div className="space-y-2 mt-1">
        {allItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-2 rounded bg-black/40 border border-white/5"
          >
            <div className="min-w-0 pr-2">
              <p className="text-[10px] font-mono text-gray-500 flex items-center gap-1 text-left">
                <span
                  className="w-1.5 h-1.5 rounded-sm"
                  style={{ backgroundColor: TYPE_COLORS[item.type] || tokens.colors.text.primary }} 
                />
                PN: {item.partNumber} · {item.type}
              </p>
              <p className="text-[11px] text-white font-medium truncate mt-0.5 text-left">
                {item.name}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[10px] text-gray-400 font-mono">
                ${item.unitPrice.toLocaleString()}/ea
              </span>
              <div className="flex items-center gap-1 bg-white/5 rounded border border-white/10 pr-1">
                <button
                  type="button"
                  onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                  className="px-2 py-0.5 text-[11px] hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
                >
                  -
                </button>
                <span className="text-[11px] font-bold font-mono text-white text-center w-5 select-none">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                  className="px-2 py-0.5 text-[11px] hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-3 flex items-center justify-between border-indigo-500/10">
        <div className="text-left">
          <p className="text-[10px] text-gray-500 leading-none">
            Architected Base Value
          </p>
          <span className="text-sm font-bold text-white mt-1 inline-block">
            ${submission.totalPrice.toLocaleString()}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500 leading-none">
            Est. Lead Time
          </p>
          <span className="text-[11px] font-mono font-bold text-indigo-400 mt-1 inline-block">
            7–12 Business Days
          </span>
        </div>
      </div>
    </div>
  );
}
