import { useState, useEffect, useRef } from 'react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import {
  Globe, Database, Activity, TrendingUp, Target, AlertTriangle, ChevronRight, Zap, RefreshCw, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { CATALOG_TREND, UCID_STEPS } from './mockData';
import type { AppView, UCID, Vendor, ForensicIssue } from '../types';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#0d1528', border: '1px solid rgba(74,133,253,0.2)', borderRadius: 8, color: '#dde6ff', fontSize: 12 },
  itemStyle: { color: '#8ba4cc' },
  labelStyle: { color: '#dde6ff', fontWeight: 600 },
};

export function useChartDimensions() {
  const ref = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          // Use requestAnimationFrame to avoid "ResizeObserver loop limit exceeded" warning
          window.requestAnimationFrame(() => {
            setDimensions({ width, height });
          });
        }
      }
    });

    observer.observe(ref.current);
    
    // Initial measure
    const rect = ref.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setDimensions({ width: rect.width, height: rect.height });
    }

    return () => observer.disconnect();
  }, []);

  return { ref, dimensions };
}

interface DashboardProps {
  onNavigate: (v: AppView) => void;
  ucids: UCID[];
  vendors: Vendor[];
  forensicIssues: ForensicIssue[];
}

export function Dashboard({ onNavigate, ucids, vendors, forensicIssues }: DashboardProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  
  const areaChart = useChartDimensions();
  const pieChart = useChartDimensions();

  const activeUCIDs = ucids.filter(u => u.currentStep !== 'snapshot');
  const criticalIssues = forensicIssues.filter(f => f.severity === 'critical' && f.status !== 'resolved').length;
  const connectedVendors = vendors.filter(v => v.status === 'connected' || v.status === 'syncing').length;
  const totalCatalog = vendors.reduce((s, v) => s + v.catalogItems, 0);

  const VENDOR_PIE = vendors.map(v => ({ name: v.shortName, value: v.catalogItems, color: v.color }));

  const KPI_CARDS = [
    { id: 'vendor-portal', label: 'Connected Vendors', value: `${connectedVendors}`, sub: `of ${vendors.length} total`, icon: Globe, color: '#4a85fd', delta: '+1', up: true },
    { id: 'catalog', label: 'Catalog SKUs', value: totalCatalog.toLocaleString(), sub: `across ${vendors.length} vendors`, icon: Database, color: '#00d4a0', delta: '+12%', up: true },
    { id: 'live-mission', label: 'Active UCIDs', value: `${activeUCIDs.length}`, sub: `${ucids.length} total missions`, icon: Target, color: '#ff9b36', delta: '+1', up: true },
    { id: 'forensic', label: 'Open Issues', value: `${forensicIssues.filter(f => f.status !== 'resolved').length}`, sub: `${criticalIssues} critical`, icon: Activity, color: '#ff3d5a', delta: '-3', up: false },
    { id: 'live-mission', label: 'Active Pipeline', value: '62%', sub: 'UCID-2026-0041 processing', icon: Zap, color: '#a855f7', delta: 'Live', up: true },
    { id: 'catalog', label: 'Last Sync Status', value: '1 min', sub: 'Vendor APIs online', icon: RefreshCw, color: '#00d4a0', delta: 'Healthy', up: true },
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Welcome banner */}
      <div className="rounded-xl p-4 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, rgba(74,133,253,0.12) 0%, rgba(0,212,160,0.06) 100%)', border: '1px solid rgba(74,133,253,0.18)' }}>
        <div>
          <p className="text-base" style={{ color: '#dde6ff', fontWeight: 500 }}>Procurement Intelligence Hub</p>
          <p className="text-sm mt-0.5" style={{ color: '#5d7899' }}>
            {activeUCIDs.length} active UCIDs in pipeline · {connectedVendors} vendors live · {criticalIssues} critical issues awaiting review
          </p>
        </div>
        <div className="flex items-center gap-2">
          {criticalIssues > 0 && (
            <button onClick={() => onNavigate('forensic')}
              className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg hover:opacity-90 transition-all cursor-pointer border border-[#ff3d5a]/30"
              style={{ background: '#ff3d5a', color: '#fff' }}>
              <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
              Resolve {criticalIssues} Critical
            </button>
          )}
          <button onClick={() => onNavigate('live-mission')}
            className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg hover:opacity-90 transition-all cursor-pointer"
            style={{ background: '#4a85fd', color: '#fff' }}>
            <Target className="w-3.5 h-3.5" />
            Live Mission Control
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {KPI_CARDS.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <button key={kpi.label + i}
              onClick={() => onNavigate(kpi.id as AppView)}
              onMouseEnter={() => setHovered(`kpi-${i}`)}
              onMouseLeave={() => setHovered(null)}
              className="text-left p-3 rounded-xl transition-all duration-200 cursor-pointer"
              style={{
                background: hovered === `kpi-${i}` ? 'rgba(74,133,253,0.08)' : '#0b1220',
                border: `1px solid ${hovered === `kpi-${i}` ? kpi.color + '40' : 'rgba(74,133,253,0.1)'}`,
              }}>
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-lg" style={{ background: kpi.color + '20' }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: kpi.color }} />
                </div>
                <span className="flex items-center gap-0.5 text-[10px]" style={{ color: kpi.up ? '#00d4a0' : '#ff3d5a' }}>
                  {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {kpi.delta}
                </span>
              </div>
              <p className="text-lg leading-tight" style={{ color: '#dde6ff', fontWeight: 600 }}>{kpi.value}</p>
              <p className="text-[11px] mt-0.5 leading-tight" style={{ color: '#8ba4cc' }}>{kpi.label}</p>
              <p className="text-[10px] mt-0.5 leading-tight" style={{ color: '#3a5070' }}>{kpi.sub}</p>
            </button>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Catalog Growth */}
        <div className="lg:col-span-2 p-4 rounded-xl font-sans min-w-0" style={{ background: '#0b1220', border: '1px solid rgba(74,133,253,0.1)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold" style={{ color: '#dde6ff' }}>Catalog Growth</p>
              <p className="text-xs" style={{ color: '#5d7899' }}>Total SKUs synced across all vendors (6 months)</p>
            </div>
            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(0,212,160,0.1)', color: '#00d4a0' }}>
              <TrendingUp className="w-3 h-3" /> +59%
            </span>
          </div>
          <div ref={areaChart.ref} className="h-[160px] w-full min-w-0 flex items-center justify-center">
            {areaChart.dimensions.width > 0 ? (
              <AreaChart width={areaChart.dimensions.width} height={areaChart.dimensions.height} data={CATALOG_TREND} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs key="defs">
                  <linearGradient id="catGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop key="stop-1" offset="5%" stopColor="#4a85fd" stopOpacity={0.3} />
                    <stop key="stop-2" offset="95%" stopColor="#4a85fd" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid key="grid" strokeDasharray="3 3" stroke="rgba(74,133,253,0.06)" />
                <XAxis key="xaxis" dataKey="month" tick={{ fill: '#5d7899', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis key="yaxis" tick={{ fill: '#5d7899', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => (v / 1000).toFixed(0) + 'k'} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [v.toLocaleString(), 'SKUs']} />
                <Area key="area" type="monotone" dataKey="items" stroke="#4a85fd" strokeWidth={2} fill="url(#catGrad)"
                  dot={{ fill: '#4a85fd', r: 3 }} />
              </AreaChart>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[11px] text-gray-500 bg-white/[0.02] rounded-lg border border-white/5 border-dashed">
                <Activity className="w-4 h-4 text-gray-600 mb-1" />
                <span>Mounting visualizer...</span>
              </div>
            )}
          </div>
        </div>

        {/* Vendor SKU Distribution */}
        <div className="p-4 rounded-xl min-w-0" style={{ background: '#0b1220', border: '1px solid rgba(74,133,253,0.1)' }}>
          <p className="text-sm font-semibold mb-0.5" style={{ color: '#dde6ff' }}>Catalog by Vendor</p>
          <p className="text-xs mb-3" style={{ color: '#5d7899' }}>{totalCatalog.toLocaleString()} total SKUs</p>
          <div ref={pieChart.ref} className="h-[120px] relative w-full min-w-0 flex items-center justify-center">
            {pieChart.dimensions.width > 0 ? (
              <PieChart width={pieChart.dimensions.width} height={pieChart.dimensions.height}>
                <Pie key="pie" data={VENDOR_PIE} dataKey="value" cx="50%" cy="50%" innerRadius={34} outerRadius={54} strokeWidth={0}>
                  {VENDOR_PIE.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [v.toLocaleString(), 'SKUs']} />
              </PieChart>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[11px] text-gray-500 bg-white/[0.02] rounded-lg border border-white/5 border-dashed">
                <Target className="w-4 h-4 text-gray-600 mb-1" />
                <span>Reading data...</span>
              </div>
            )}
          </div>
          <div className="space-y-1.5 mt-2">
            {VENDOR_PIE.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-sm" style={{ background: d.color }} />
                  <span className="text-[11px]" style={{ color: '#8ba4cc' }}>{d.name}</span>
                </div>
                <span className="text-[11px]" style={{ color: '#dde6ff' }}>{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* UCID Pipeline + Vendor Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Active UCID Pipeline */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden" style={{ background: '#0b1220', border: '1px solid rgba(74,133,253,0.1)' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(74,133,253,0.08)' }}>
            <p className="text-sm font-semibold" style={{ color: '#dde6ff' }}>UCID Mission Pipeline</p>
            <button onClick={() => onNavigate('live-mission')} className="flex items-center gap-1 text-xs text-[#4a85fd] hover:underline cursor-pointer">
              Open Live Mission <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(74,133,253,0.06)' }}>
            {ucids.map(u => {
              const stepIdx = UCID_STEPS.findIndex(s => s.id === u.currentStep);
              const pct = Math.round((stepIdx / (UCID_STEPS.length - 1)) * 100);
              const PRIORITY_COLOR: Record<string, string> = { critical: '#ff3d5a', high: '#ff9b36', medium: '#4a85fd', low: '#5d7899' };
              return (
                <button key={u.id} onClick={() => onNavigate('live-mission')}
                  className="w-full text-left px-4 py-3 hover:bg-white/[0.01] transition-colors cursor-pointer block">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: PRIORITY_COLOR[u.priority] }} />
                      <span className="text-xs font-semibold" style={{ color: '#dde6ff' }}>{u.displayId}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full capitalize" style={{ background: 'rgba(74,133,253,0.1)', color: '#8ba4cc' }}>{u.priority}</span>
                    </div>
                    <span className="text-[11px]" style={{ color: u.currentStep === 'snapshot' ? '#00d4a0' : '#ff9b36' }}>
                      {UCID_STEPS.find(s => s.id === u.currentStep)?.label || u.currentStep}
                    </span>
                  </div>
                  <p className="text-[11px] mb-2 text-left" style={{ color: '#5d7899' }}>{u.name}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(74,133,253,0.1)' }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{
                        width: `${pct}%`,
                        background: u.currentStep === 'snapshot' ? '#00d4a0' : 'linear-gradient(90deg, #4a85fd, #00d4a0)'
                      }} />
                    </div>
                    <span className="text-[10px] shrink-0" style={{ color: '#3a5070' }}>{pct}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Vendor API Status + Issues */}
        <div className="space-y-4">
          {/* Vendor Health */}
          <div className="rounded-xl overflow-hidden" style={{ background: '#0b1220', border: '1px solid rgba(74,133,253,0.1)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(74,133,253,0.08)' }}>
              <p className="text-sm font-semibold" style={{ color: '#dde6ff' }}>Vendor API Health</p>
              <button onClick={() => onNavigate('vendor-portal')} className="flex items-center gap-1 text-xs text-[#4a85fd] hover:underline cursor-pointer">
                Manage <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="p-3 space-y-3">
              {vendors.map(v => (
                <div key={v.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: v.color }} />
                  <span className="text-[11px] flex-1 truncate" style={{ color: '#8ba4cc' }}>{v.name}</span>
                  <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(74,133,253,0.1)' }}>
                    <div className="h-full rounded-full" style={{ width: `${v.apiHealth}%`, background: v.apiHealth > 97 ? '#00d4a0' : v.apiHealth > 90 ? '#ff9b36' : '#ff3d5a' }} />
                  </div>
                  <span className="text-[10px] w-8 text-right font-mono" style={{ color: v.apiHealth > 97 ? '#00d4a0' : '#ff9b36' }}>{v.apiHealth}%</span>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: v.status === 'connected' ? '#00d4a0' : v.status === 'syncing' ? '#a855f7' : '#5d7899' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Open Issues */}
          <div className="rounded-xl overflow-hidden" style={{ background: '#0b1220', border: '1px solid rgba(74,133,253,0.1)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b animate-pulseFast" style={{ borderColor: 'rgba(74,133,253,0.08)' }}>
              <p className="text-sm font-semibold" style={{ color: '#dde6ff' }}>Active Issues</p>
              <button onClick={() => onNavigate('forensic')} className="flex items-center gap-1 text-xs text-[#4a85fd] hover:underline cursor-pointer">
                Heal <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y" style={{ borderColor: 'rgba(74,133,253,0.06)' }}>
              {forensicIssues.filter(f => f.status !== 'resolved').slice(0, 3).map((issue) => (
                <div key={issue.id} className="px-4 py-2.5 flex items-start gap-2">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: issue.severity === 'critical' ? '#ff3d5a' : issue.severity === 'warning' ? '#ff9b36' : '#4a85fd' }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] leading-snug font-medium truncate" style={{ color: '#dde6ff' }}>{issue.title}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: '#5d7899' }}>{issue.vendor} · {issue.affectedItems} items</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t" style={{ borderColor: 'rgba(74,133,253,0.08)' }}>
              <button onClick={() => onNavigate('forensic')}
                className="w-full text-xs py-2 rounded-lg cursor-pointer transition-colors text-center font-medium hover:bg-red-500/20"
                style={{ background: 'rgba(255,61,90,0.12)', color: '#ff3d5a' }}>
                Run Forensic Scan & Auto-Heal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
