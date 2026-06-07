import React, { useState } from 'react';
import { 
  ShieldAlert, RefreshCw, AlertTriangle, CheckCircle, Zap, 
  ShieldCheck, ArrowRight, ArrowDownRight, Layers, FileText
} from 'lucide-react';
import type { ForensicIssue, Vendor, CatalogSKU, UCID } from '../types';

interface ForensicViewProps {
  forensicIssues: ForensicIssue[];
  setForensicIssues: React.Dispatch<React.SetStateAction<ForensicIssue[]>>;
  setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
  setCatalogSkus: React.Dispatch<React.SetStateAction<CatalogSKU[]>>;
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  activeMissionId?: string;
  setActiveMissionId: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export function ForensicView({
  setVendors,
  setCatalogSkus,
  ucids,
  setUcids,
  activeMissionId,
  setActiveMissionId,
}: ForensicViewProps) {
  const [scanning, setScanning] = useState(false);
  const [scanStdout, setScanStdout] = useState<string[]>([]);
  const [lastScanCount, setLastScanCount] = useState<number | null>(null);
  const [completedFixes, setCompletedFixes] = useState<{ id: string; title: string; desc: string }[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warn' } | null>(null);

  // Get active selected profile or default to first
  const currUcid = ucids.find(u => u.id === activeMissionId) || ucids[0];

  // Helper trigger feedback
  function triggerToast(message: string, type: 'success' | 'warn' = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  // --- Dynamic Contract Rule Scans ---
  // Rule 1: Obsolete CPU model CPU '815100-B21'
  const hasEolSourcingRisk = currUcid?.solutions?.some(sol =>
    sol.items.some(it => it.partNumber === '815100-B21')
  ) || false;

  // Rule 2: Overpriced Storage Drive '400-BPSB' (Dell SSD) quoting > 1190
  const hasPriceVarianceRisk = currUcid?.solutions?.some(sol =>
    sol.items.some(it => it.partNumber === '400-BPSB' && it.unitPrice > 1190)
  ) || false;

  // Rule 3: Memory Symmetry Rule Qty % 8 !== 0 on Cisco Systems
  const hasCiscoMemorySymmetryRisk = currUcid?.solutions?.some(sol =>
    sol.vendor === 'Cisco' && sol.items.some(it => it.type === 'Memory' && it.quantity % 8 !== 0)
  ) || false;

  // Build current open issues array based on active profile states
  const openIssues: ForensicIssue[] = [];

  if (hasEolSourcingRisk) {
    openIssues.push({
      id: 'iss-1',
      title: 'Intel Xeon 6130 End-of-Life (EOL) Sourcing Risk',
      description: `HPE Legacy CPU (SKU 815100-B21) was identified inside active sheet. Procuring this will result in grey-market sourcing, voided vendor warranty, and a 45+ day factory lead time.`,
      vendor: 'HPE',
      severity: 'critical',
      status: 'open',
      affectedItems: 1,
      suggestedAction: 'Auto-Align local BOM model to replace with Intel Xeon Gold 6430 CPU (P40424-B21). Zeroes lead time and recovers full HPE coverage.'
    });
  }

  if (hasPriceVarianceRisk) {
    const matchingSol = currUcid?.solutions?.find(sol => sol.items.some(it => it.partNumber === '400-BPSB' && it.unitPrice > 1190));
    const matchingItem = matchingSol?.items?.find(it => it.partNumber === '400-BPSB');
    const unitPrice = matchingItem?.unitPrice || 1590;
    const overage = unitPrice - 1190;
    const totalWaste = overage * (matchingItem?.quantity || 24);

    openIssues.push({
      id: 'iss-2',
      title: 'Pricing Mismatch: Dell SFF Enterprise NVMe Quote Variance',
      description: `Active quote for Dell 3.84TB drive (400-BPSB) is logged inside sheet as $${unitPrice.toLocaleString()}/ea. Direct API partner contract rate is $1,190. Overage mark-up: $${overage}/ea.`,
      vendor: 'Dell',
      severity: 'critical',
      status: 'open',
      affectedItems: matchingItem?.quantity || 24,
      suggestedAction: `Auto-Align local quote unit price to $1,190 negotiated rate. Saves $${totalWaste.toLocaleString()} instantly across lines.`
    });
  }

  if (hasCiscoMemorySymmetryRisk) {
    const matchingSol = currUcid?.solutions?.find(sol => sol.vendor === 'Cisco');
    const matchingItem = matchingSol?.items?.find(it => it.type === 'Memory');
    const qty = matchingItem?.quantity || 5;

    openIssues.push({
      id: 'iss-3',
      title: 'Cisco Memory Layout Configuration Symmetry Defect',
      description: `Cisco UCS standard C240 configuration requests ${qty} memory modules. Intel Xeon 4th-Gen memory controllers operate optimally on 8-channel layouts. Odd allocation modules cause layout bus bottlenecks.`,
      vendor: 'Cisco',
      severity: 'warning',
      status: 'open',
      affectedItems: qty,
      suggestedAction: 'Upgrade configuration load to 8 units of 64GB DDR5 memory modules to satisfy full 8-channel Motherboard performance symmetry.'
    });
  }

  // Auto sweep simulation
  function runAuditScanner() {
    setScanning(true);
    setScanStdout(['Booting VSIP forensic diagnostic sweep engine...', `Connecting active configuration workspace profile [${currUcid?.displayId || 'UNKNOWN'}]`]);
    let progress = 0;
    const lines = [
      `Validating structural Bill of Materials nodes under profile ${currUcid?.displayId}...`,
      'Interrogating direct HPE REST quotation endpoints...',
      'Comparing Dell Premier partner contract pricing databases...',
      'Auditing Cisco unified socket bus configuration symmetry requirements...',
      'Analyzing multi-sheet compliance rules validations...'
    ];

    const iv = setInterval(() => {
      if (progress < lines.length) {
        setScanStdout(prev => [...prev, lines[progress]]);
        progress++;
      } else {
        clearInterval(iv);
        setScanning(false);
        setLastScanCount(openIssues.length);
        triggerToast('Diagnostic scan complete! Sourcing sheet analyzed successfully.', 'success');
      }
    }, 280);
  }

  // High performance direct correction script mapping to state
  function handleAutoHeal(issueId: string) {
    if (!currUcid) return;

    if (issueId === 'iss-1') {
      // HPE EOL repair script
      setUcids((prev) =>
        prev.map((u) => {
          if (u.id === currUcid.id) {
            const nextSolutions = u.solutions.map((sol) => {
              const matchedCPU = sol.items.some(it => it.partNumber === '815100-B21');
              if (!matchedCPU) return sol;

              const repairedItems = sol.items.map((it) => {
                if (it.partNumber === '815100-B21') {
                  return {
                    ...it,
                    partNumber: 'P40424-B21',
                    name: 'Intel Xeon Gold 6430 32-Core 2.1GHz Processor (Gen11) [REPLACED]',
                    unitPrice: 2150,
                  };
                }
                return it;
              });

              const newSum = repairedItems.reduce((acc, curr) => acc + curr.unitPrice * curr.quantity, 0);
              return {
                ...sol,
                items: repairedItems,
                totalPrice: newSum,
                savings: Math.max(0, sol.originalPrice - newSum),
                complianceScore: 100,
              };
            });

            return {
              ...u,
              solutions: nextSolutions,
              events: [
                ...u.events,
                {
                  ts: new Date().toLocaleTimeString(),
                  level: 'ok',
                  msg: 'Forensic System Repair: Replaced obsolete legacy HPE CPU (815100-B21) with supported factory Intel Gold 6430 (P40424-B21). Sourcing lead-time risks eliminated.',
                },
              ],
            };
          }
          return u;
        })
      );

      setCompletedFixes((prev) => [
        ...prev,
        {
          id: 'iss-1',
          title: 'Intel Xeon 6130 End-of-Life (EOL) Sourcing Risk',
          desc: 'Swapped obsolete CPU SKU 815100-B21 for active Intel Gold 6430 under workflow rules.',
        },
      ]);
      triggerToast('HPE EOL CPU replaced in profile BOM successfully!', 'success');
    }

    if (issueId === 'iss-2') {
      // Dell Price aligner
      setUcids((prev) =>
        prev.map((u) => {
          if (u.id === currUcid.id) {
            const nextSolutions = u.solutions.map((sol) => {
              const hasOverage = sol.items.some(it => it.partNumber === '400-BPSB' && it.unitPrice > 1190);
              if (!hasOverage) return sol;

              const repairedItems = sol.items.map((it) => {
                if (it.partNumber === '400-BPSB') {
                  return {
                    ...it,
                    unitPrice: 1190,
                    name: 'Dell 3.84TB Enterprise NVMe SSD SFF [ALIGNED]',
                  };
                }
                return it;
              });

              const newSum = repairedItems.reduce((acc, curr) => acc + curr.unitPrice * curr.quantity, 0);
              return {
                ...sol,
                items: repairedItems,
                totalPrice: newSum,
                savings: Math.max(0, sol.originalPrice - newSum),
              };
            });

            return {
              ...u,
              solutions: nextSolutions,
              events: [
                ...u.events,
                {
                  ts: new Date().toLocaleTimeString(),
                  level: 'ok',
                  msg: 'Forensic System Repair: Corrected Dell Premier Drive mark-up overcharge. Aligned unit pricing to matched API partner contract rate of $1,190.',
                },
              ],
            };
          }
          return u;
        })
      );

      setCompletedFixes((prev) => [
        ...prev,
        {
          id: 'iss-2',
          title: 'Pricing Mismatch: Dell SFF Enterprise NVMe Quote Variance',
          desc: 'Quote overcharges eliminated. Unit pricing aligned with negotiated direct API.',
        },
      ]);
      triggerToast('Dell Quote pricing aligned to direct API contract rate!', 'success');
    }

    if (issueId === 'iss-3') {
      // Cisco Memory symmetric upgrade
      setUcids((prev) =>
        prev.map((u) => {
          if (u.id === currUcid.id) {
            const nextSolutions = u.solutions.map((sol) => {
              if (sol.vendor !== 'Cisco') return sol;

              const hasAsymmetricMemory = sol.items.some(it => it.type === 'Memory' && it.quantity % 8 !== 0);
              if (!hasAsymmetricMemory) return sol;

              const repairedItems = sol.items.map((it) => {
                if (it.type === 'Memory') {
                  return {
                    ...it,
                    quantity: 8,
                    name: 'Cisco 64GB DDR5 memory module [REBALANCED]',
                  };
                }
                return it;
              });

              const newSum = repairedItems.reduce((acc, curr) => acc + curr.unitPrice * curr.quantity, 0);
              return {
                ...sol,
                items: repairedItems,
                totalPrice: newSum,
                savings: Math.max(0, sol.originalPrice - newSum),
              };
            });

            return {
              ...u,
              solutions: nextSolutions,
              events: [
                ...u.events,
                {
                  ts: new Date().toLocaleTimeString(),
                  level: 'ok',
                  msg: 'Forensic System Repair: Balanced Cisco memory distribution to 8 dual-rank modules. Re-established symmetric motherboard 8-channel indexing.',
                },
              ],
            };
          }
          return u;
        })
      );

      setCompletedFixes((prev) => [
        ...prev,
        {
          id: 'iss-3',
          title: 'Cisco Memory Layout Configuration Symmetry Defect',
          desc: 'Motherboard layout balanced. RAM modules upgraded to satisfy 8-channel architecture specifications.',
        },
      ]);
      triggerToast('Cisco UCS memory configurations normalized to 8-channel layout!', 'success');
    }
  }

  return (
    <div className="flex flex-col gap-4 animate-fadeIn h-full min-h-0">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl border shadow-2xl bg-[#091815] border-[#00d4a0] flex items-center gap-3 animate-slideIn">
          <CheckCircle className="w-4 h-4 text-[#00d4a0]" />
          <span className="text-xs text-white font-medium">{toast.message}</span>
        </div>
      )}

      {/* Head */}
      <div className="p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{ background: 'rgba(74,133,253,0.03)', borderColor: 'rgba(74,133,253,0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#ff3d5a]/10 flex items-center justify-center border border-[#ff3d5a]/30">
            <ShieldAlert className="w-5 h-5 text-[#ff3d5a]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Sourcing Integrity Diagnostic Sandbox</h2>
            <p className="text-[11px] text-gray-400">
              Sweep uploaded workbooks and quotations for critical EOL parts, contract pricing variances, or physical constraints.
            </p>
          </div>
        </div>

        <button
          onClick={runAuditScanner}
          disabled={scanning}
          className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-[#ff3d5a] text-white hover:bg-[#ff3d5a]/90 font-bold disabled:opacity-50 cursor-pointer shadow-lg shadow-[#ff3d5a]/10 shrink-0 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? 'Sweeping Sourcing Channels...' : 'Execute Compliance Scan'}
        </button>
      </div>

      {/* Unified Working Profile Selector */}
      {currUcid && (
        <div className="bg-[#0b1220] p-4 rounded-xl border border-[#4a85fd]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="min-w-0">
              <span className="text-gray-400">Sourcing Working Profile: </span>
              <strong className="text-white font-mono font-bold bg-black/45 px-1.5 py-0.5 rounded border border-white/5">{currUcid.displayId}</strong>
              <span className="text-gray-500 font-medium ml-1.5 truncate hidden md:inline">— {currUcid.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Switch Profile context:</span>
            <select
              value={currUcid.id}
              onChange={(e) => setActiveMissionId(e.target.value)}
              className="bg-black/50 border border-white/10 rounded px-2.5 py-1.5 text-white text-[11px] font-mono focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {ucids.map(u => (
                <option key={u.id} value={u.id}>
                  {u.displayId} — {u.name.length > 32 ? u.name.substring(0, 32) + '...' : u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {scanning && (
        <div className="p-4 rounded-xl border space-y-3" style={{ backgroundColor: '#070a13', borderColor: 'rgba(74,133,253,0.08)' }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] opacity-80 text-indigo-400 font-mono flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              Scanning background JSON mappings...
            </span>
          </div>
          <div className="p-4 rounded bg-black/40 font-mono text-[10px] text-[#00d4a0] space-y-1 max-h-44 overflow-y-auto leading-normal border border-white/5">
            {scanStdout.map((line, i) => <p key={i}>&gt; {line}</p>)}
          </div>
        </div>
      )}

      {/* Warnings & Issues split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        
        {/* Main List */}
        <div className="lg:col-span-2 flex flex-col gap-3 min-h-0">
          <div className="flex items-center justify-between px-1 shrink-0">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Discovered Sourcing Anomalies ({openIssues.length})
            </span>
            {lastScanCount !== null && (
              <span className="text-[10px] text-gray-500 font-mono">Last diagnosis sweep scan matching: {lastScanCount} rules</span>
            )}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3">
            {openIssues.length > 0 ? (
              openIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-4 rounded-xl border flex gap-3.5 hover:border-[#ff3d5a]/25 transition-all"
                  style={{
                    backgroundColor: '#0b1220',
                    borderColor: 'rgba(74,133,253,0.08)'
                  }}
                >
                  <div className="mt-1 shrink-0">
                    <AlertTriangle className={`w-5 h-5 ${
                      issue.severity === 'critical' ? 'text-[#ff3d5a]' : 'text-[#ff9b36]'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs text-white font-bold">{issue.title}</h3>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                          issue.severity === 'critical' ? 'bg-[#ff3d5a]/15 text-[#ff3d5a]' : 'bg-[#ff9b36]/15 text-[#ff9b36]'
                        }`}>
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1 leading-normal">{issue.description}</p>
                    </div>

                    <div className="p-2.5 rounded text-[11px] space-y-1 bg-black/30 border border-white/2 text-indigo-300">
                      <span className="font-bold uppercase text-[9px] text-gray-500 tracking-wider flex items-center gap-1">
                        <Zap className="w-3 h-3 text-indigo-400" /> Suggested Sourcing Alignment Action:
                      </span>
                      <p className="text-gray-300 leading-normal font-medium">{issue.suggestedAction}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 border-t border-white/5 gap-2">
                      <div className="text-[10px] text-gray-500 font-mono">
                        Affected Manufacturer Code: <span className="text-[#4a85fd] font-bold">{issue.vendor}</span> · Line Count: <span className="text-gray-300 font-bold">{issue.affectedItems}</span>
                      </div>
                      <button
                        onClick={() => handleAutoHeal(issue.id)}
                        className="flex items-center gap-1.2 text-[10px] font-extrabold py-2 px-3.5 rounded-lg bg-[#00d4a0]/12 text-[#00d4a0] hover:bg-[#00d4a0]/25 transition-all cursor-pointer border border-[#00d4a0]/22 uppercase tracking-wide shadow-md shadow-[#00d4a0]/5 self-end sm:self-auto"
                      >
                        <Zap className="w-3 h-3 text-yellow-400" /> Auto-Align Component
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 rounded-xl border border-dashed border-gray-800 bg-black/20 flex flex-col items-center justify-center gap-2 text-center">
                <CheckCircle className="w-8 h-8 text-[#00d4a0]" />
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">No Anomalies Found in Profile</p>
                <p className="text-[11px] text-gray-500 max-w-sm leading-relaxed">
                  Your current active configuration BOM sheet lines are clean and 100% compliant under system contract guidelines.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Audit reports sidebar */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="p-4 rounded-xl border flex flex-col gap-3 shrink-0" style={{ backgroundColor: '#0b1220', borderColor: 'rgba(74,133,253,0.08)' }}>
            <h3 className="text-xs text-white font-bold">Workspace Health Integrity Score</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white font-mono leading-none">
                {openIssues.length === 0 ? '100' : `${Math.round(100 - openIssues.length * 15)}`}
              </span>
              <span className="text-xs text-gray-500 font-mono">/ 100</span>
            </div>
            <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-500 to-[#00d4a0] transition-all" style={{
                width: `${openIssues.length === 0 ? 100 : Math.max(10, Math.round(100 - openIssues.length * 15))}%`
              }} />
            </div>
            <p className="text-[10px] text-gray-500">Each unresolved open compliance exception reduces your aggregate score.</p>
          </div>

          <div className="p-4 rounded-xl border flex flex-col min-h-0" style={{ backgroundColor: '#0b1220', borderColor: 'rgba(74,133,253,0.08)' }}>
            <span className="text-xs text-white font-bold flex items-center gap-1.5 shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#00d4a0]" /> Compliance Resolved List ({completedFixes.length})
            </span>
            <div className="divide-y divide-white/5 mt-3 p-1.5 bg-black/20 rounded-lg flex-1 min-h-0 overflow-y-auto space-y-2">
              {completedFixes.map((issue, idx) => (
                <div key={idx} className="py-2 text-[10px] text-gray-400 first:pt-1 last:pb-1">
                  <p className="font-bold text-white flex items-center gap-1 line-clamp-1">
                    <CheckCircle className="w-3 h-3 text-[#00d4a0] shrink-0" /> {issue.title}
                  </p>
                  <p className="text-gray-500 mt-1 pl-4 leading-normal">{issue.desc}</p>
                </div>
              ))}
              {completedFixes.length === 0 && (
                <p className="text-center text-[10px] text-gray-650 p-3 italic">
                  No repairs executed in active profile's design scope yet.
                </p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
