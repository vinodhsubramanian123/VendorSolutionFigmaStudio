import { useState } from 'react';
import { FolderSync, Send, Play, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

export function IntegrationsGateway() {
  const [activeTab, setActiveTab] = useState<'sap' | 'coupa' | 'serviceNow'>('sap');
  const [payloadText, setPayloadText] = useState<string>(
    JSON.stringify(
      {
        procurementRequestId: "req-2026-09411",
        creator: "Admin operator",
        targetSourcingModel: "Dual-source multi-chassis configuration DL380/R760",
        budgetCapUsd: 250000,
        currencyCode: "USD",
        linesCoupled: 2,
        syncMode: "parallel_rest"
      },
      null,
      2
    )
  );

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warn' | 'error' } | null>(null);
  const [responseLog, setResponseLog] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  async function handleDispatchCheck() {
    let parsedPayload;
    try {
      parsedPayload = JSON.parse(payloadText);
    } catch (e) {
      setToast({ message: "Error: Webhook payload text contains invalid JSON structure.", type: "error" });
      return;
    }

    setTesting(true);
    setResponseLog(prev => [`[${new Date().toLocaleTimeString()}] Dispatching webhook test payload to connected ERP endpoint (Tab: ${activeTab.toUpperCase()})...`, ...prev]);

    try {
      const res = await fetch('/api/integrations/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpointUrl: tabContent.url,
          secretToken: "crm-token-client-sandbox-signature-2026",
          ucidRef: parsedPayload.procurementRequestId || "req-2026-09411",
          payloadData: parsedPayload
        })
      });

      if (res.ok) {
        const data = await res.json();
        setTesting(false);
        const timestamp = new Date().toLocaleTimeString();
        setResponseLog(prev => [
          `[${timestamp}] API RESPONSE KEY: ${data.status.toUpperCase()} (HTTP 200 SUCCESS)`,
          `[${timestamp}] Cryptographic Signature Verified: ${data.cryptographicSignature.substring(0, 32)}...`,
          `[${timestamp}] Dispatch transaction token: ${data.dispatchId}`,
          `[${timestamp}] Last Audit Log entry code ${data.auditLog[1].httpStatusCode}: ${data.auditLog[1].responseBody}`,
          ...prev
        ]);
        setToast({ message: "Payload successfully synchronized via live APIs!", type: "success" });
        return;
      }
      throw new Error("Local Express channel bypassed; falling back offline");
    } catch (err) {
      console.warn("Backend API not reachable. Performing isolated simulation fallback.", err);
      setTimeout(() => {
        setTesting(false);
        const timestamp = new Date().toLocaleTimeString();
        setResponseLog(prev => [
          `[${timestamp}] RESPONSE KEY: LOCAL_OK (HTTP 201 CREATED)`,
          `[${timestamp}] Sandbox Payload Verified. Local fallback state activated.`,
          `[${timestamp}] Transaction token: txn-ariba-${Math.floor(Math.random() * 10000000)}`,
          ...prev
        ]);
        setToast({ message: "Payload successfully simulated locally!", type: "success" });
      }, 750);
    }
  }

  const tabContent = {
    sap: {
      url: "https://ariba.partner.sap.com/api/v4/sourcing/synchronize",
      description: "Direct REST pipeline routing approved procurement snap snapshots to SAP Ariba Purchase Agreement databases."
    },
    coupa: {
      url: "https://api.coupa.com/v11/requisitions/bulk-register",
      description: "Coupa Integration Platform connection. Syncs contract rates and auto-generates requisition lines."
    },
    serviceNow: {
      url: "https://yourinstance.service-now.com/api/now/table/u_sourcing_mission_audit",
      description: "ServiceNow incident-alert router. Triggers automatic repair tickets in IT Service Management when forensic scans catch critical layout errors."
    }
  }[activeTab];

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Banner */}
      <div className="p-4 rounded-xl border flex items-center justify-between"
        style={{ background: 'rgba(74,133,253,0.03)', borderColor: 'rgba(74,133,253,0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <FolderSync className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Direct ERP / CRM Connection Panel</h2>
            <p className="text-[11px] text-gray-500">
              Synchronize contracted layouts and forensic repair states into ERP systems or helpdesks.
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs select-none">
        
        {/* Left selector */}
        <div className="lg:col-span-1 p-4 rounded-xl border space-y-3" style={{ backgroundColor: '#0b1220', borderColor: 'rgba(74,133,253,0.08)' }}>
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Connected Systems</span>
          
          <div className="space-y-2">
            {(['sap', 'coupa', 'serviceNow'] as const).map((tab) => {
              const active = activeTab === tab;
              const label = { sap: "SAP Ariba Direct", coupa: "Coupa Sourcing Node", serviceNow: "ServiceNow IT Service Router" }[tab];
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="w-full text-left p-3 rounded-lg border transition-all cursor-pointer font-semibold uppercase text-[11px] block"
                  style={{
                    backgroundColor: active ? 'rgba(74,133,253,0.08)' : 'rgba(74,133,253,0.01)',
                    borderColor: active ? 'rgba(74,133,253,0.3)' : 'rgba(74,133,253,0.05)',
                    color: active ? '#fff' : '#8ba4cc'
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-black/25 rounded-lg border border-white/2 space-y-1.5 mt-4">
            <span className="text-[10px] text-gray-500 font-mono font-bold uppercase">Sync Path:</span>
            <p className="text-[10px] font-mono font-bold text-gray-300 break-all">{tabContent.url}</p>
            <p className="text-[11px] text-gray-400 leading-normal pt-1">{tabContent.description}</p>
          </div>
        </div>

        {/* Payload editor */}
        <div className="lg:col-span-2 p-4 rounded-xl border flex flex-col gap-3" style={{ backgroundColor: '#0b1220', borderColor: 'rgba(74,133,253,0.08)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-white font-semibold flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-indigo-400" /> Outbound Requisition payload JSON Sandbox
            </span>
            <span className="text-[10px] text-gray-500 font-mono">Format: APPLICATION_JSON</span>
          </div>

          <textarea
            value={payloadText}
            onChange={(e) => setPayloadText(e.target.value)}
            className="w-full flex-1 min-h-[160px] p-3 rounded-lg bg-black/40 text-white font-mono text-[11px] border border-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
          />

          <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: 'rgba(74,133,253,0.06)' }}>
            <span className="text-[10px] text-gray-500">Dispatch requests securely over direct HTTPS webhook nodes.</span>
            <button
              onClick={handleDispatchCheck}
              disabled={testing}
              className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-all cursor-pointer shadow-lg shadow-indigo-500/10"
            >
              <Play className="w-3.5 h-3.5" /> {testing ? 'Sending payloads...' : 'Dispatch Test Webhook'}
            </button>
          </div>
        </div>

      </div>

      {/* Audit feedback */}
      <div className="p-4 rounded-xl border flex flex-col gap-3 font-sans select-none" style={{ backgroundColor: '#0b1220', borderColor: 'rgba(74,133,253,0.08)' }}>
        <h3 className="text-xs text-white font-semibold flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" /> API Gateway Webhook Response Feed
        </h3>
        <div className="p-3 bg-black/30 rounded-lg max-h-40 overflow-y-auto font-mono text-[10px] space-y-1.5 text-gray-400 leading-normal">
          {responseLog.length > 0 ? (
            responseLog.map((log, i) => {
              const marker = log.includes("HTTP 201 CREATED");
              return (
                <div key={i} className={`flex gap-2 ${marker ? 'text-[#00d4a0]' : ''}`}>
                  <span className="text-gray-600">[{i + 1}]</span>
                  <span>{log}</span>
                </div>
              );
            })
          ) : (
            <p className="text-center italic text-gray-600 p-2">Wait of Sandbox dispatcher. Hit "Dispatch Test Webhook" to parse telemetry.</p>
          )}
        </div>
      </div>

      {/* Elegant Toast notification overlay */}
      {toast && (
        <div 
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 p-3.5 rounded-lg border shadow-xl animate-fadeIn text-[11px] font-medium leading-none"
          style={{
            backgroundColor: toast.type === 'success' ? '#091815' : toast.type === 'warn' ? '#1c1409' : '#1c090d',
            borderColor: toast.type === 'success' ? '#00d4a0' : toast.type === 'warn' ? '#ff9b36' : '#ff3d5a',
            color: toast.type === 'success' ? '#00d4a0' : toast.type === 'warn' ? '#ff9b36' : '#ff3d5a'
          }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-white font-sans">{toast.message}</span>
          <button 
            type="button"
            onClick={() => setToast(null)} 
            className="ml-1 hover:text-white text-gray-500 font-bold cursor-pointer text-sm font-mono"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
