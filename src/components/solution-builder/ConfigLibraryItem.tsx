import { tokens } from "../../styles/tokens";
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Select } from '../shared/Select';
import type { ConfigItem, UcidContainer } from '../../types/data';

interface ConfigLibraryItemProps {
  cfg: ConfigItem;
  isSelected: boolean;
  onSelect: () => void;
  isMultiUcid: boolean;
  ucidsList: UcidContainer[];
  assignConfigToUcid: (configId: string, ucidId: string) => void;
}

export function ConfigLibraryItem({
  cfg,
  isSelected,
  onSelect,
  isMultiUcid,
  ucidsList,
  assignConfigToUcid
}: ConfigLibraryItemProps) {
  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-lg border transition duration-150 cursor-pointer text-left block ${
        isSelected
          ? "bg-indigo-500/5 border-indigo-500"
          : "bg-black/10 border-white/5 hover:bg-black/20"
      }`}
    >
      <div
        className="flex items-center justify-between font-bold text-[11px]"
        style={{
          color:
            cfg.vendor === "HPE"
              ? tokens.colors.status.success 
              : cfg.vendor === "Dell"
                ? tokens.colors.accent.indigo 
                : tokens.colors.accent.violet, 
        }}
      >
        <span>{cfg.vendor} Sourcing Alternative</span>
        <span>${cfg.totalPrice.toLocaleString()}</span>
      </div>
      <h4 className="text-xs font-bold text-white mt-1">
        {cfg.name}
      </h4>

      {/* Configuration items detail */}
      <div className="mt-2 text-[10px] text-gray-500 line-clamp-1">
        {cfg.items
          .map((i) => `${i.quantity}x ${i.type}`)
          .join(", ")}
      </div>

      {/* Assignment Badge & Dropdown */}
      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between gap-2">
        <span className="text-[9.5px] font-mono text-gray-400 uppercase flex items-center gap-1 shrink-0">
          <CheckCircle className="w-3 h-3 text-indigo-400" />
          <span>
            Assigned →{" "}
            <strong className="text-indigo-400">
              {cfg.targetUcidId}
            </strong>
          </span>
        </span>

        {isMultiUcid && (
          <Select
            onClick={(e) => e.stopPropagation()}
            value={cfg.targetUcidId}
            onChange={(e) =>
              assignConfigToUcid(cfg.id, e.target.value)
            }
            className="!px-2 !py-0.5 !text-[9.5px] !min-h-[24px]"
            wrapperClassName="w-auto"
          >
            {ucidsList.map((u) => (
              <option key={u.id} value={u.id}>
                {u.id}
              </option>
            ))}
          </Select>
        )}
      </div>
    </div>
  );
}
