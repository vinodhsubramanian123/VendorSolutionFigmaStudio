/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-tabindex */
import React, { useState } from "react";
import { StatusBadge } from "./StatusBadge";
import { Copy } from "lucide-react";
import type { CatalogSKU } from "../../types";

interface SKUCardProps {
  sku: CatalogSKU;
  onCopy?: (partNumber: string) => void;
  className?: string;
  onClick?: () => void;
}

export const SKUCard: React.FC<SKUCardProps> = ({
  sku,
  onCopy,
  className = "",
  onClick
}) => {
  const isEol = sku.status === "eol";
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => { if (e.key === "Enter" && onClick) onClick(); }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-surface-elevated border ${isEol ? "border-status-error/30" : "border-white/5"} rounded-xl p-4.5 group ${onClick ? "cursor-pointer hover:border-brand-indigo/50 transition-all" : ""} ${className}`}
      style={isHovered && onClick ? { backgroundColor: "rgba(74, 133, 253, 0.1)" } : undefined}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-brand-indigo font-bold bg-brand-indigo/10 border border-brand-indigo/20 px-1.5 py-0.5 rounded uppercase">
            {sku.vendor}
          </span>
          <StatusBadge status={sku.type} variant="default" size="sm" />
        </div>
      </div>

      <h4 className="text-sm font-semibold text-white tracking-tight mb-1 truncate" title={sku.name}>
        {sku.name}
      </h4>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
        <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" && onCopy) onCopy(sku.partNumber); }} className="text-[11px] font-mono text-content-muted flex items-center gap-1.5 cursor-pointer hover:text-white transition" onClick={(e) => {
          e.stopPropagation();
          onCopy?.(sku.partNumber);
        }}>
          {sku.partNumber}
          <Copy className="w-3 h-3 hover:text-brand-indigo" />
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-white tracking-tight">${sku.price?.toLocaleString()}</div>
          <div className="text-[9px] text-content-muted font-medium">{sku.leadTimeDays}d ETA</div>
        </div>
      </div>
    </div>
  );
};
