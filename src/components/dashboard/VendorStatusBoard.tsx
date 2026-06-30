import { tokens } from "../../styles/tokens";
import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Target } from 'lucide-react';
import { TOOLTIP_STYLE } from './DashboardTooltipStyle';
import { motion, AnimatePresence } from "motion/react";

interface VendorStatusBoardProps {
  totalCatalog: number;
  vendorPieData: { name: string; value: number; color: string }[];
  dimensions: { width: number; height: number };
  chartRef: React.RefObject<HTMLDivElement | null>;
}

export function VendorStatusBoard({ totalCatalog, vendorPieData, dimensions, chartRef }: VendorStatusBoardProps) {
  return (
    <div
      className="p-4 rounded-xl min-w-0"
      style={{
        background: "var(--color-surface-elevated)",
        border: "1px solid rgba(74, 133, 253,0.1)",
      }}
    >
      <p
        className="text-sm font-semibold mb-0.5"
        style={{ color: tokens.colors.text.primary }} 
      >
        Catalog by Vendor
      </p>
      <p className="text-xs mb-3" style={{ color: tokens.colors.text.muted }}> 
        {totalCatalog.toLocaleString()} total SKUs
      </p>
      <div
        ref={chartRef}
        className="h-[120px] relative w-full min-w-0 flex items-center justify-center"
      >
        {dimensions.width > 0 ? (
          <PieChart
            width={dimensions.width}
            height={dimensions.height}
          >
            <Pie
              key="pie"
              data={vendorPieData}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={34}
              outerRadius={54}
              isAnimationActive={false}
              strokeWidth={0}
            >
              {vendorPieData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              {...TOOLTIP_STYLE}
              formatter={(v: unknown) => [Number(v).toLocaleString(), "Requests"]}
            />
          </PieChart>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[11px] text-gray-500 bg-white/[0.02] rounded-lg border border-white/5 border-dashed">
            <Target className="w-4 h-4 text-gray-600 mb-1" />
            <span>Reading data...</span>
          </div>
        )}
      </div>
      <div className="space-y-1.5 mt-2">
        <AnimatePresence>
          {vendorPieData.map((d) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={d.name} 
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-sm"
                  style={{ background: d.color }}
                />
                <span className="text-[11px]" style={{ color: tokens.colors.text.secondary }}> 
                  {d.name}
                </span>
              </div>
              <span className="text-[11px]" style={{ color: tokens.colors.text.primary }}> 
                {d.value.toLocaleString()}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
