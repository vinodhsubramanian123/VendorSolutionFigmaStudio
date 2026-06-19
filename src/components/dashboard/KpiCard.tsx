import { tokens } from "../../styles/tokens";
import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'motion/react';

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
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    // Extract numeric part like "$1.2m" -> prefix "$", num 1.2, suffix "m"
    // Handle commas correctly (e.g. "1,200")
    const cleanStr = value.replace(/,/g, '');
    const numMatch = cleanStr.match(/^(\D*)(\d+(?:\.\d+)?)(\D*)$/);
    
    if (numMatch) {
      const prefix = numMatch[1] || '';
      const num = parseFloat(numMatch[2]);
      const suffix = numMatch[3] || '';
      const hasDecimals = numMatch[2].includes('.');
      
      let frame: ReturnType<typeof setTimeout>;
      const duration = 800; // ms
      const steps = 30;
      const stepTime = duration / steps;
      let currentStep = 0;
      
      const update = () => {
        currentStep++;
        const progress = currentStep / steps;
        // easeOutQuart
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        const currentVal = num * easeProgress;
        
        let formattedVal = currentVal.toFixed(hasDecimals ? 1 : 0);
        // add commas back if it was large
        if (!hasDecimals && num >= 1000) {
           formattedVal = parseInt(formattedVal, 10).toLocaleString();
        }
        
        setDisplayValue(`${prefix}${formattedVal}${suffix}`);
        
        if (currentStep < steps) {
          frame = setTimeout(update, stepTime);
        } else {
          setDisplayValue(value);
        }
      };
      
      frame = setTimeout(update, stepTime);
      return () => clearTimeout(frame);
    } else {
      setDisplayValue(value);
    }
  }, [value]);

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
