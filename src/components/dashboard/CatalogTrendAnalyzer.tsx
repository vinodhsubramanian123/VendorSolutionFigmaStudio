import { tokens } from "../../styles/tokens";
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import { CATALOG_TREND } from '../../lib/mockData';
import { TOOLTIP_STYLE } from './DashboardTooltipStyle';

interface CatalogTrendAnalyzerProps {
  dimensions: { width: number; height: number };
  chartRef: React.RefObject<HTMLDivElement | null>;
}

export const CatalogTrendAnalyzer = React.memo(function CatalogTrendAnalyzer({ dimensions, chartRef }: CatalogTrendAnalyzerProps) {
  const growthPercent = React.useMemo(() => {
    if (CATALOG_TREND.length < 2) return 0;
    const first = CATALOG_TREND[0].items;
    const last = CATALOG_TREND[CATALOG_TREND.length - 1].items;
    return Math.round(((last - first) / first) * 100);
  }, []);

  return (
    <div
      className="lg:col-span-2 p-4 rounded-xl font-sans min-w-0"
      style={{
        background: "var(--color-surface-elevated)",
        border: "1px solid rgba(74, 133, 253,0.1)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold" style={{ color: tokens.colors.text.primary }}> 
            Catalog Growth
          </p>
          <p className="text-xs" style={{ color: tokens.colors.text.muted }}> 
            Total SKUs synced across all vendors (6 months)
          </p>
        </div>
        <span
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
          style={{ background: growthPercent >= 0 ? "rgba(0,212,160,0.1)" : "rgba(255,61,90,0.1)", color: growthPercent >= 0 ? tokens.colors.status.success : tokens.colors.status.error }} 
        >
          <TrendingUp className="w-3 h-3" /> {growthPercent >= 0 ? "+" : ""}{growthPercent}%
        </span>
      </div>
      <div
        ref={chartRef}
        className="h-[160px] w-full min-w-0 flex items-center justify-center"
      >
        {dimensions.width > 0 ? (
          <AreaChart
            width={dimensions.width}
            height={dimensions.height}
            data={CATALOG_TREND}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <defs key="defs">
              <linearGradient id="catGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  key="stop-1"
                  offset="5%"
                  stopColor={tokens.colors.accent.indigo} 
                  stopOpacity={0.3}
                />
                <stop
                  key="stop-2"
                  offset="95%"
                  stopColor={tokens.colors.accent.indigo} 
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              key="grid"
              strokeDasharray="3 3"
              stroke="rgba(74, 133, 253,0.06)"
            />
            <XAxis
              key="xaxis"
              dataKey="month"
              tick={{ fill: tokens.colors.text.muted, fontSize: 11 }} 
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              key="yaxis"
              tick={{ fill: tokens.colors.text.muted, fontSize: 11 }} 
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => (v / 1000).toFixed(0) + "k"}
            />
            <Tooltip
              {...TOOLTIP_STYLE}
              formatter={(v: unknown) => [Number(v).toLocaleString(), "SKUs"]}
            />
            <Area
              key="area"
              type="monotone"
              dataKey="items"
              isAnimationActive={false}
              stroke={tokens.colors.accent.indigo} 
              strokeWidth={2}
              fill="url(#catGrad)"
              dot={{ fill: tokens.colors.accent.indigo, r: 3 }} 
            />
          </AreaChart>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[11px] text-gray-500 bg-white/[0.02] rounded-lg border border-white/5 border-dashed">
            <Activity className="w-4 h-4 text-gray-600 mb-1" />
            <span>Mounting visualizer...</span>
          </div>
        )}
      </div>
    </div>
  );
});
