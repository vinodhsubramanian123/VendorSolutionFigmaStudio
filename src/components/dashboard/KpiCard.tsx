import { tokens } from "../../styles/tokens";
import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion, animate } from 'motion/react';

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

// Extract numeric part like "$1.2m" -> prefix "$", num 1.2, suffix "m".
// Handles commas correctly (e.g. "1,200"). Returns null when the value has
// no animatable numeric portion.
function parseNumericValue(value: string) {
  const cleanStr = value.replace(/,/g, '');
  return cleanStr.match(/^(\D*)(\d+(?:\.\d+)?)(\D*)$/);
}

export function KpiCard({
  id,
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
  const [animatedValue, setAnimatedValue] = useState<string | null>(null);

  useEffect(() => {
    const numMatch = parseNumericValue(value);

    if (!numMatch) {
      // Non-numeric values (e.g. "N/A") have nothing to animate -- render
      // `value` directly at the call site below instead of calling
      // setState synchronously here.
      return;
    }

    const prefix = numMatch[1] || '';
    const num = parseFloat(numMatch[2]);
    const suffix = numMatch[3] || '';
    const hasDecimals = numMatch[2].includes('.');

    const controls = animate(0, num, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: (currentVal) => {
        let formattedVal = currentVal.toFixed(hasDecimals ? 1 : 0);
        if (!hasDecimals && num >= 1000) {
           formattedVal = parseInt(formattedVal, 10).toLocaleString();
        }
        setAnimatedValue(`${prefix}${formattedVal}${suffix}`);
      },
      onComplete: () => {
        setAnimatedValue(value);
      }
    });

    return controls.stop;
  }, [value]);

  // Non-numeric values render directly (no animation, no state involved).
  // Numeric values render the in-progress/most recent animated frame, with
  // `value` itself as the fallback before the animation's first tick.
  const displayValue = parseNumericValue(value) ? (animatedValue ?? value) : value;

  return (
    <motion.button
      id={id}
      whileHover={{ y: -2, scale: 1.02, boxShadow: `0 8px 24px ${color}15` }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="text-left p-3 rounded-xl transition-all duration-200 cursor-pointer border"
      style={{
        background: hovered ? "rgba(74, 133, 253,0.08)" : tokens.colors.background.elevated, 
        borderColor: hovered ? color + "40" : "rgba(74, 133, 253,0.1)",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div
          className="p-1.5 rounded-lg transition-colors"
          style={{ background: hovered ? color + "30" : color + "20" }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <span
          className="flex items-center gap-0.5 text-[10px]"
          style={{ color: up ? tokens.colors.status.success : tokens.colors.status.error }} 
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
        className="text-lg leading-tight tabular-nums"
        style={{ color: tokens.colors.text.primary, fontWeight: 600 }} 
      >
        {displayValue}
      </p>
      <p
        className="text-[11px] mt-0.5 leading-tight"
        style={{ color: tokens.colors.text.secondary }} 
      >
        {label}
      </p>
      <p
        className="text-[10px] mt-0.5 leading-tight"
        style={{ color: tokens.colors.text.tertiary }} 
      >
        {sub}
      </p>
    </motion.button>
  );
}
