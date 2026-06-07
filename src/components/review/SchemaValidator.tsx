import React, { useMemo } from 'react';
import { ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

interface SchemaValidatorProps {
  ucids: any[];
  vendors: any[];
  catalogSkus: any[];
  onClose?: () => void;
}

export function SchemaValidator({ ucids, vendors, catalogSkus, onClose }: SchemaValidatorProps) {
  const auditResults = useMemo(() => {
    let score = 100;
    const issues: { type: string; message: string; severity: 'error' | 'warning' }[] = [];

    // Check UCIDs
    const expectedUcidKeys = ['id', 'displayId', 'name', 'currentStep', 'completedSteps', 'priority', 'projectRef', 'createdAt'];
    ucids.forEach(u => {
      expectedUcidKeys.forEach(k => {
        if (!(k in u)) {
          issues.push({ type: 'UCID', message: `UCID ${u.id || 'Unknown'} is missing key: ${k}`, severity: 'error' });
          score -= 1;
        }
      });
      if (u.currentStep && !['boq-intake', 'pre-intelligence', 'solution-design', 'vendor-provisioning', 'post-intelligence', 'comparison', 'snapshot'].includes(u.currentStep)) {
        issues.push({ type: 'UCID', message: `UCID ${u.id} has invalid currentStep: ${u.currentStep}`, severity: 'error' });
        score -= 2;
      }
    });

    // Check Vendors
    const expectedVendorKeys = ['id', 'name', 'shortName', 'status', 'color', 'catalogItems', 'apiHealth', 'apiEndpoint', 'syncInterval', 'lastSync'];
    vendors.forEach(v => {
      expectedVendorKeys.forEach(k => {
        if (!(k in v)) {
          issues.push({ type: 'Vendor', message: `Vendor ${v.id || 'Unknown'} is missing key: ${k}`, severity: 'error' });
          score -= 1;
        }
      });
      if (v.status && !['connected', 'disconnected', 'syncing', 'error'].includes(v.status)) {
        issues.push({ type: 'Vendor', message: `Vendor ${v.id} has invalid status: ${v.status}`, severity: 'error' });
        score -= 2;
      }
    });

    // Check SKUs
    const expectedSkuKeys = ['id', 'vendor', 'partNumber', 'name', 'type', 'price', 'leadTimeDays', 'status'];
    catalogSkus.forEach(s => {
      expectedSkuKeys.forEach(k => {
        if (!(k in s)) {
          issues.push({ type: 'SKU', message: `SKU ${s.id || 'Unknown'} is missing key: ${k}`, severity: 'error' });
          score -= 0.5;
        }
      });
      if (typeof s.price !== 'number') {
        issues.push({ type: 'SKU', message: `SKU ${s.id} price is not a number`, severity: 'error' });
        score -= 1;
      }
    });

    return {
      score: Math.max(0, Math.floor(score)),
      totalChecked: ucids.length + vendors.length + catalogSkus.length,
      issues
    };
  }, [ucids, vendors, catalogSkus]);

  return (
    <div className="bg-[#0b1220] border border-blue-500/20 rounded-xl p-6 relative shadow-2xl z-50 animate-fadeIn h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <ShieldAlert className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Internal Schema Validation Engine</h2>
            <p className="text-[11px] text-gray-400">Verifying structural typing integrity across {auditResults.totalChecked} entities.</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="px-3 py-1 bg-black/40 hover:bg-black/80 rounded border border-white/10 text-xs font-mono text-gray-400 transition-colors">
            Close Audit
          </button>
        )}
      </div>

      <div className="flex gap-6 mb-6 shrink-0">
        <div className="flex-1 bg-black/40 border border-white/5 rounded-lg p-4 flex items-center justify-between">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Compliance Score</span>
          <span className={`text-2xl font-bold font-mono ${auditResults.score === 100 ? 'text-[#00d4a0]' : auditResults.score > 80 ? 'text-amber-400' : 'text-red-400'}`}>
            {auditResults.score}%
          </span>
        </div>
        <div className="flex-1 bg-black/40 border border-white/5 rounded-lg p-4 flex items-center justify-between">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Anomalies Detected</span>
          <span className={`text-2xl font-bold font-mono ${auditResults.issues.length === 0 ? 'text-[#00d4a0]' : 'text-red-400'}`}>
            {auditResults.issues.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar border border-white/5 bg-black/20 rounded-lg p-4 space-y-2">
        {auditResults.issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <CheckCircle className="w-8 h-8 text-[#00d4a0] mb-3 opacity-50" />
            <p className="text-sm font-bold uppercase tracking-wider text-[#00d4a0]">All Schemas Validated</p>
            <p className="text-xs">Zero anomalies detected. Store models match interface parity.</p>
          </div>
        ) : (
          auditResults.issues.map((issue, i) => (
            <div key={i} className="flex gap-3 text-xs bg-black/40 border border-white/5 rounded p-3">
              {issue.severity === 'error' ? (
                <XCircle className="w-4 h-4 text-red-500 shrink-0" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <div>
                <span className="font-mono text-indigo-400 font-bold tracking-widest text-[9px] uppercase">{issue.type}</span>
                <p className="text-gray-300 mt-1">{issue.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
