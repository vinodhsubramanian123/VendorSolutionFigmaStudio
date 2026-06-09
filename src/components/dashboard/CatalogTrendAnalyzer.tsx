import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import { CATALOG_TREND } from '../../lib/mockData';
import { TOOLTIP_STYLE } from './DashboardTooltipStyle';

interface CatalogTrendAnalyzerProps {
  dimensions: { width: number; height: number };
  chartRef: React.RefObject<HTMLDivElement>;
}

export function CatalogTrendAnalyzer({ dimensions, chartRef }: CatalogTrendAnalyzerProps) {
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
          <p className="text-sm font-semibold" style={{ color: "#dde6ff" }}>
            Catalog Growth
          </p>
          <p className="text-xs" style={{ color: "#5d7899" }}>
            Total SKUs synced across all vendors (6 months)
          </p>
        </div>
        <span
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
          style={{ background: "rgba(0,212,160,0.1)", color: "#00d4a0" }}
        >
          <TrendingUp className="w-3 h-3" /> +59%
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
                  stopColor="#4a85fd"
                  stopOpacity={0.3}
                />
                <stop
                  key="stop-2"
                  offset="95%"
                  stopColor="#4a85fd"
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
              tick={{ fill: "#5d7899", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              key="yaxis"
              tick={{ fill: "#5d7899", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => (v / 1000).toFixed(0) + "k"}
            />
            <Tooltip
              {...TOOLTIP_STYLE}
              formatter={(v: number) => [v.toLocaleString(), "SKUs"]}
            />
            <Area
              key="area"
              type="monotone"
              dataKey="items"
              stroke="#4a85fd"
              strokeWidth={2}
              fill="url(#catGrad)"
              dot={{ fill: "#4a85fd", r: 3 }}
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
}
