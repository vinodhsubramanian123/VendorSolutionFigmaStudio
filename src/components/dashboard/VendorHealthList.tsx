import { tokens } from "../../styles/tokens";
import React, { useMemo } from 'react';
import { ChevronRight, Users } from 'lucide-react';
import type { Vendor, AppView } from '../../types';

interface VendorHealthListProps {
  vendors: Vendor[];
  onNavigate: (v: AppView) => void;
}

export function VendorHealthList({ vendors, onNavigate }: VendorHealthListProps) {
  const renderedVendors = useMemo(() => {
    if (vendors.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500 text-[10px]">
          <Users className="w-5 h-5 mx-auto mb-1 opacity-50" />
          No partners connected
        </div>
      );
    }
    return vendors.map((v) => (
      <div key={v.name} className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: v.color }}
        />
        <span
          className="text-[11px] flex-1 truncate"
          style={{ color: tokens.colors.text.secondary }} 
        >
          {v.name}
        </span>
        <div
          className="w-16 h-1 rounded-full overflow-hidden"
          style={{ background: "rgba(74, 133, 253,0.1)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${v.apiHealth}%`,
              background:
                v.apiHealth > 97
                  ? tokens.colors.status.success 
                  : v.apiHealth > 90
                    ? tokens.colors.status.warning 
                    : tokens.colors.status.error, 
            }}
          />
        </div>
        <span
          className="text-[10px] w-8 text-right font-mono"
          style={{
            color: v.apiHealth > 97 ? tokens.colors.status.success : tokens.colors.status.warning, 
          }}
        >
          {v.apiHealth}%
        </span>
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{
            background:
              v.status === "connected"
                ? tokens.colors.status.success 
                : v.status === "syncing"
                  ? tokens.colors.accent.violet 
                  : tokens.colors.text.muted, 
          }}
        />
      </div>
    ));
  }, [vendors]);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--color-surface-elevated)",
        border: "1px solid rgba(74, 133, 253,0.1)",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "rgba(74, 133, 253,0.08)" }}
      >
        <p className="text-sm font-semibold" style={{ color: tokens.colors.text.primary }}> 
          Vendor API Health
        </p>
        <button
          onClick={() => onNavigate("vendor-portal")}
          className="flex items-center gap-1 text-xs text-brand-indigo hover:underline cursor-pointer"
        >
          Manage <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="p-3 space-y-3">
        {renderedVendors}
      </div>
    </div>
  );
}
