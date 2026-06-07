import React, { useState, useEffect } from 'react';
import { Activity, Webhook, XCircle, CheckCircle, RotateCcw } from 'lucide-react';

interface OutboundPayload {
  id: string;
  endpoint: string;
  timestamp: string;
  payload: any;
  status: 'valid' | 'mismatch';
  mismatches: string[];
}

export function PayloadSchemaValidator() {
  const [intercepts, setIntercepts] = useState<OutboundPayload[]>([]);

  // Simulation of intercepting outbound requests and validating schemas
  useEffect(() => {
    const simulateIntercepts = () => {
      const now = new Date().toLocaleTimeString();
      const newIntercepts: OutboundPayload[] = [
        {
          id: Math.random().toString(36).substr(2, 9),
          endpoint: 'POST /api/portfolio/orchestrate',
          timestamp: now,
          status: 'mismatch',
          mismatches: ['Missing required field: `budgetCurrency`'],
          payload: {
            portfolioId: "p-9812",
            ucids: [{ id: "u1", channel: "manual" }]
          }
        },
        {
          id: Math.random().toString(36).substr(2, 9),
          endpoint: 'POST /api/boq/ingest',
          timestamp: new Date(Date.now() - 5000).toLocaleTimeString(),
          status: 'valid',
          mismatches: [],
          payload: {
            fileName: "HPE_PARTNER_QUOTE.xlsx",
            presetType: "hpe-legacy"
          }
        },
        {
          id: Math.random().toString(36).substr(2, 9),
          endpoint: 'POST /api/vendors/sync',
          timestamp: new Date(Date.now() - 12000).toLocaleTimeString(),
          status: 'mismatch',
          mismatches: ['Type mismatch on `authType`: Expected Enum, received String'],
          payload: {
            vendorId: "v1",
            authType: "custom-bearer-token"
          }
        }
      ];
      setIntercepts(newIntercepts);
    };

    simulateIntercepts();
  }, []);

  return (
    <div className="bg-[#0b1220] border border-fuchsia-500/20 rounded-xl overflow-hidden p-6 shadow-[0_0_15px_rgba(217,70,239,0.05)] h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Webhook className="w-5 h-5 text-fuchsia-400" />
          <h2 className="text-sm font-bold text-white tracking-wider uppercase">Outbound Payload Interceptor Node</h2>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 bg-fuchsia-500/10 rounded border border-fuchsia-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse"></span>
          <span className="text-[9px] uppercase font-bold text-fuchsia-400 tracking-widest">Active</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-6 shrink-0">
        Monitors runtime outbound API sequences, cross-referencing payload structures strictly against TypeScript interfaces before network dispatch to prevent upstream rejections.
      </p>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {intercepts.map((intercept, i) => (
          <div key={intercept.id} className="border border-white/5 bg-black/40 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-mono text-[11px] text-gray-300 font-bold">{intercept.endpoint}</h3>
                <p className="text-[9px] text-gray-500 font-mono mt-0.5">{intercept.timestamp}</p>
              </div>
              {intercept.status === 'valid' ? (
                <div className="flex items-center gap-1 text-[#00d4a0] bg-[#00d4a0]/10 px-2 py-0.5 rounded border border-[#00d4a0]/20">
                  <CheckCircle className="w-3 h-3" />
                  <span className="text-[9px] uppercase font-bold tracking-widest">Valid</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-400/20">
                  <XCircle className="w-3 h-3" />
                  <span className="text-[9px] uppercase font-bold tracking-widest">Mismatch Dropped</span>
                </div>
              )}
            </div>

            <div className="bg-[#070a13] border border-white/5 rounded p-3 mb-3 text-[10px] font-mono text-gray-400 overflow-x-auto">
              {JSON.stringify(intercept.payload, null, 2)}
            </div>

            {intercept.mismatches.length > 0 && (
              <div className="border-t border-white/5 pt-2">
                <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest mb-1 block">Validation Errors:</span>
                <ul className="space-y-1">
                  {intercept.mismatches.map((m, idx) => (
                    <li key={idx} className="text-[10px] text-gray-300 font-mono flex items-center gap-2">
                      <span className="text-red-500">•</span> {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mt-3 flex justify-end">
              <button className="flex items-center gap-1 text-[9px] text-gray-500 hover:text-white transition-colors uppercase tracking-widest font-bold">
                <RotateCcw className="w-3 h-3" /> Retry Intercept
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
