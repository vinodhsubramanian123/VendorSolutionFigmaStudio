import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KpiCardProps {
  id: string;
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  color: string;
  delta: string;
  up: boolean;
  hovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

export function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  delta,
  up,
  hovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: KpiCardProps) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="text-left p-3 rounded-xl transition-all duration-200 cursor-pointer"
      style={{
        background: hovered ? "rgba(74, 133, 253,0.08)" : "#0b1220",
        border: `1px solid ${hovered ? color + "40" : "rgba(74, 133, 253,0.1)"}`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div
          className="p-1.5 rounded-lg"
          style={{ background: color + "20" }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <span
          className="flex items-center gap-0.5 text-[10px]"
          style={{ color: up ? "#00d4a0" : "#ff3d5a" }}
        >
          {up ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}
          {delta}
        </span>
      </div>
      <p
        className="text-lg leading-tight"
        style={{ color: "#dde6ff", fontWeight: 600 }}
      >
        {value}
      </p>
      <p
        className="text-[11px] mt-0.5 leading-tight"
        style={{ color: "#8ba4cc" }}
      >
        {label}
      </p>
      <p
        className="text-[10px] mt-0.5 leading-tight"
        style={{ color: "#3a5070" }}
      >
        {sub}
      </p>
    </button>
  );
}
