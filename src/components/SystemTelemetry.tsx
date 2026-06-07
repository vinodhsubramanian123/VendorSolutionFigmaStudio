import React, { useState, useEffect } from 'react';
import { Activity, Server, Cpu, HardDrive, Wifi, ActivitySquare, TerminalSquare, Clock, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { useLocalStorageState } from '../hooks/useLocalStorageState';

import { PayloadSchemaValidator } from './review/PayloadSchemaValidator';

export function SystemTelemetry() {
  const [auditLogs] = useLocalStorageState<Array<{ timestamp: string; fromStep?: string; toStep: string; action: string }>>(
    'procurement_lifecycle_audit_logs',
    []
  );

  const [metrics, setMetrics] = useState<{time: string, throughput: number, errorRate: number, latency: number}[]>([]);
  const [apiLogs, setApiLogs] = useState<{method: string, endpoint: string, ms: number, sizeBytes: number, status: number, time: string}[]>([]);

  useEffect(() => {
    // Generate some stable-ish real-time mock data
    const initialData = Array.from({ length: 30 }).map((_, i) => ({
      time: `-${30 - i}s`,
      throughput: 50 + Math.random() * 50,
      errorRate: Math.random() < 0.1 ? Math.random() * 5 : 0,
      latency: 40 + Math.random() * 20
    }));
    setMetrics(initialData);

    const endpoints = [
      '/api/v1/vendors',
      '/api/v1/inventory/skus',
      '/api/v1/forensics/scan',
      '/api/portfolio/orchestrate',
      '/api/boq/ingest',
      '/api/vendors/HPE/sync'
    ];

    const generateApiLog = () => ({
      method: Math.random() > 0.3 ? 'GET' : 'POST',
      endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
      ms: Math.floor(20 + Math.random() * 150),
      sizeBytes: Math.floor(1024 + Math.random() * 50000),
      status: Math.random() > 0.05 ? 200 : 500,
      time: new Date().toLocaleTimeString()
    });

    setApiLogs(Array.from({ length: 8 }).map(generateApiLog).reverse());

    const timer = setInterval(() => {
      setMetrics(prev => {
        const next = [...prev.slice(1)];
        next.push({
          time: 'now',
          throughput: 50 + Math.random() * 50,
          errorRate: Math.random() < 0.05 ? Math.random() * 5 : 0,
          latency: 40 + Math.random() * 20
        });
        return next;
      });

      if (Math.random() > 0.4) {
        setApiLogs(prev => [generateApiLog(), ...prev.slice(0, 19)]);
      }
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#090d19] border border-sky-500/10 p-5 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">System Telemetry</h1>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Real-time visualization of background ingestion pipelines and API node health.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 bg-[#0b1220] rounded-xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <Wifi className="w-4 h-4 text-emerald-400" />
                Pipeline Throughput (mb/s)
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono">LIVE • SERVER_01</span>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics} margin={{ top: 0, left: -20, right: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tpGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#ffffff20" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis stroke="#ffffff20" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff10', fontSize: '12px' }}
                    itemStyle={{ color: '#38bdf8' }}
                  />
                  <Area type="monotone" dataKey="throughput" stroke="#38bdf8" fillOpacity={1} fill="url(#tpGrad)" strokeWidth={2} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-5 bg-[#0b1220] rounded-xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <ActivitySquare className="w-4 h-4 text-orange-400" />
                API Error Rates & Exceptions
              </h3>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics} margin={{ top: 0, left: -20, right: 0, bottom: 0 }}>
                  <XAxis dataKey="time" stroke="#ffffff20" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis stroke="#ffffff20" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff10', fontSize: '12px' }}
                    itemStyle={{ color: '#fb923c' }}
                  />
                  <Line type="stepAfter" dataKey="errorRate" stroke="#fb923c" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-5 bg-[#0b1220] rounded-xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                Procurement Latency Heatmap
              </h3>
              <span className="text-[10px] text-gray-500 font-mono">AVG 24H (ms)</span>
            </div>
            <div className="space-y-3">
              {[
                { vendor: 'Hewlett Packard Enterprise', endpoint: '/api/v1/hardware/configure', latency: 1240, status: 'slow' },
                { vendor: 'Cisco Systems', endpoint: '/api/v1/network/validate', latency: 450, status: 'optimal' },
                { vendor: 'Dell Technologies', endpoint: '/api/v1/inventory/skus', latency: 180, status: 'fast' },
                { vendor: 'Lenovo', endpoint: '/api/v1/pricing/quote', latency: 890, status: 'warning' },
                { vendor: 'Global Nexus Orchestrator', endpoint: '/api/portfolio/sync', latency: 3200, status: 'critical' }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-black/30 border border-white/5 rounded-lg">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-[11px] font-bold text-gray-300 truncate">{item.vendor}</p>
                    <p className="text-[9px] text-gray-500 font-mono mt-0.5 truncate">{item.endpoint}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-24 h-1.5 bg-black rounded-full overflow-hidden">
                      <div 
                        className={`h-full opacity-80 ${
                          item.status === 'fast' ? 'bg-emerald-400' :
                          item.status === 'optimal' ? 'bg-blue-400' :
                          item.status === 'warning' ? 'bg-amber-400' :
                          item.status === 'slow' ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(10, (item.latency / 3500) * 100))}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-mono font-bold w-12 text-right ${
                      item.status === 'critical' ? 'text-red-400' : 'text-gray-400'
                    }`}>{item.latency}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-[400px]">
             <PayloadSchemaValidator />
          </div>
        </div>

        <div className="space-y-6 flex flex-col">
          <div className="p-5 bg-[#0b1220] rounded-xl border border-white/5 h-[calc(50vh-80px)] overflow-hidden flex flex-col shrink-0">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2 mb-4 shrink-0">
              <TerminalSquare className="w-4 h-4 text-indigo-400" />
              Event Stream / Audit Log
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {auditLogs.slice().reverse().map((log, i) => (
                <div key={i} className="bg-black/20 p-3 rounded border border-white/5">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase">{log.action}</span>
                    <span className="text-[9px] text-gray-500 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-[11px] text-gray-400">
                    <span className="text-white">{log.fromStep || 'init'}</span> 
                    <span className="mx-2 text-gray-600">→</span> 
                    <span className="text-white">{log.toStep}</span>
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="text-center p-6 text-gray-500 text-xs mt-10">
                  No workflow transitions recorded yet.<br/>
                  <span className="text-[10px] mt-2 block">Use the Ingestion Hub to begin tracing.</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-5 bg-[#0b1220] rounded-xl border border-white/5 h-[calc(50vh-80px)] overflow-hidden flex flex-col shrink-0">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2 mb-4 shrink-0">
              <Server className="w-4 h-4 text-amber-400" />
              Core Store API Profiler
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {apiLogs.map((log, i) => (
                <div key={i} className="bg-black/20 p-3 rounded border border-white/5">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[10px] font-mono font-bold uppercase ${log.method === 'GET' ? 'text-emerald-400' : 'text-blue-400'}`}>{log.method} {log.endpoint}</span>
                    <span className="text-[9px] text-gray-500 font-mono">{log.time}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono mt-2">
                    <span className="text-amber-400/80">{log.sizeBytes} Bytes Payload</span>
                    <span className="text-gray-400">{log.ms}ms <span className="text-emerald-500 ml-1">[{log.status}]</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
