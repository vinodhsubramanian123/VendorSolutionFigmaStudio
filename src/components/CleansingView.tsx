import React, { useState } from 'react';
import { Sparkles, CheckCircle, HelpCircle, HardDrive, Cpu, Layers, AlertCircle } from 'lucide-react';
import type { ForensicIssue } from '../types';

interface DirtyLine {
  id: string;
  dirtyString: string;
  sourceVendor: string;
  estimatedType: string;
  assignedPartId: string;
}

export function CleansingView({ forensicIssues, setForensicIssues }: {
  forensicIssues: ForensicIssue[];
  setForensicIssues: React.Dispatch<React.SetStateAction<ForensicIssue[]>>;
}) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warn' | 'error' } | null>(null);
  const [dirtyLines, setDirtyLines] = useState<DirtyLine[]>([
    { id: 'dl-1', dirtyString: 'HPE-DL38O-G11-8sff-chsis-modl_A', sourceVendor: 'HPE', estimatedType: 'Chassis', assignedPartId: '' },
    { id: 'dl-2', dirtyString: 'INTL-XEON-G-643o-32C-2.1ghz-CPU', sourceVendor: 'HPE', estimatedType: 'Processor', assignedPartId: '' },
    { id: 'dl-3', dirtyString: 'DDR5-48oo-mem-module-bulk64g_HPE', sourceVendor: 'HPE', estimatedType: 'Memory', assignedPartId: '' },
    { id: 'dl-4', dirtyString: 'Dell_PWER-76O-Chsis_CTO-8bay', sourceVendor: 'Dell', estimatedType: 'Chassis', assignedPartId: '' },
    { id: 'dl-5', dirtyString: 'dell_DDR5_RDIMM_64g_48ooMT_AHFF', sourceVendor: 'Dell', estimatedType: 'Memory', assignedPartId: '' },
  ]);

  const canonPartsOptions: Record<string, { partNumber: string; name: string }[]> = {
    Chassis: [
      { partNumber: 'P40411-B21', name: 'HPE ProLiant DL380 Gen11 SFF CTO Chassis' },
      { partNumber: '210-BFXS', name: 'Dell PowerEdge R760 8SFF CTO Chassis' },
      { partNumber: 'UCSC-C240-M7S', name: 'Cisco UCS C240 M7 SFF Rack Chassis' }
    ],
    Processor: [
      { partNumber: 'P40424-B21', name: 'Intel Xeon Gold 6430 32-Core 2.1GHz CPU (HPE)' },
      { partNumber: '338-CHYT', name: 'Intel Xeon Gold 6430 32-Core CPU Equivalent (Dell)' },
      { partNumber: 'UCS-CPU-I6430', name: 'UCS Intel Xeon Gold 6430 32-Core CPU (Cisco)' }
    ],
    Memory: [
      { partNumber: 'P38454-B21', name: 'HPE 64GB Dual Rank x4 DDR5-4800 Memory' },
      { partNumber: '370-AHFF', name: 'Dell 64GB RDIMM 4800MT/s DDR5 Memory' },
      { partNumber: 'UCS-MR-64G2ED-E', name: 'Cisco UCS 64GB DDR5 Memory module' }
    ]
  };

  function handleAutoCleanAll() {
    setDirtyLines(prev =>
      prev.map(line => {
        const option = canonPartsOptions[line.estimatedType]?.find(
          o => o.name.toLowerCase().includes(line.sourceVendor.toLowerCase())
        );
        return {
          ...line,
          assignedPartId: option ? option.partNumber : line.assignedPartId
        };
      })
    );
    setToast({ message: 'Catalog heuristic rules applied: matched active suppliers successfully.', type: 'success' });
  }

  function handleMapPart(lineId: string, partNum: string) {
    setDirtyLines(prev =>
      prev.map(l => l.id === lineId ? { ...l, assignedPartId: partNum } : l)
    );
  }

  function commitCleansedData() {
    const unmapped = dirtyLines.filter(l => !l.assignedPartId).length;
    if (unmapped > 0) {
      setToast({ message: `Warning: You have ${unmapped} unstructured lines unmapped. Please complete all before synchronizing.`, type: 'warn' });
      return;
    }
    
    // Simulate updating forensic states or logging success
    setToast({ message: 'Pre-Cleansed schema maps synchronized to active procurement system!', type: 'success' });
    setDirtyLines([]);
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Banner */}
      <div className="p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{ background: 'rgba(74,133,253,0.03)', borderColor: 'rgba(74,133,253,0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Layers className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Interactive Splicing & Mapping Workshop</h2>
            <p className="text-[11px] text-gray-500">
              Correlate dirty Supplier Quote description lines with standard canonical IDs.
            </p>
          </div>
        </div>
        <button
          onClick={handleAutoCleanAll}
          className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 font-bold transition-all cursor-pointer shadow-lg shadow-indigo-500/10"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" /> Auto-Map Simple Lines
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Mapping workspace */}
        <div className="lg:col-span-2 space-y-3">
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Uncleaned Quotation Stream</span>
          
          <div className="space-y-3">
            {dirtyLines.length > 0 ? (
              dirtyLines.map(line => (
                <div key={line.id} className="p-4 rounded-xl border space-y-3" style={{ backgroundColor: '#0b1220', borderColor: 'rgba(74,133,253,0.08)' }}>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-gray-600 font-mono font-semibold uppercase">{line.sourceVendor} RAW QUOTE STRING:</span>
                      <p className="text-xs font-mono font-bold text-gray-300 truncate mt-0.5" style={{ color: '#ff9b36' }}>{line.dirtyString}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-indigo-500/15 text-indigo-400 rounded font-bold uppercase self-start md:self-auto uppercase">
                      {line.estimatedType}
                    </span>
                  </div>

                  {/* Mapping drop selector */}
                  <div className="flex flex-col md:flex-row md:items-center gap-4 pt-2 border-t border-white/2 select-none">
                    <span className="text-[11px] font-medium text-gray-500 whitespace-nowrap">Mapped Canon SKU:</span>
                    <select
                      value={line.assignedPartId}
                      onChange={(e) => handleMapPart(line.id, e.target.value)}
                      className="flex-1 text-xs p-2.5 rounded bg-black/40 text-white border border-white/5 focus:outline-none"
                    >
                      <option value="">-- UNMAPPED INPUT LINE (Choose Spliced Hardware SKU) --</option>
                      {canonPartsOptions[line.estimatedType]?.map(opt => (
                        <option key={opt.partNumber} value={opt.partNumber}>
                          {opt.partNumber} — {opt.name}
                        </option>
                      ))}
                    </select>

                    {line.assignedPartId && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#00d4a0]/15 border border-[#00d4a0]/20 text-[#00d4a0]">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold font-mono">Matched Alignment</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 rounded-xl border border-dashed border-gray-800 flex flex-col items-center justify-center gap-3">
                <CheckCircle className="w-8 h-8 text-[#00d4a0]" />
                <p className="text-xs text-gray-400 font-bold uppercase text-center">All quote descriptions aligned</p>
                <p className="text-[11px] text-gray-500 text-center">Raw import buffers cleared. Ready for next supplier CSV drop-in.</p>
                <button
                  type="button"
                  onClick={() => {
                    setDirtyLines([
                      { id: 'dl-1', dirtyString: 'HPE-DL38O-G11-8sff-chsis-modl_A', sourceVendor: 'HPE', estimatedType: 'Chassis', assignedPartId: '' },
                      { id: 'dl-2', dirtyString: 'INTL-XEON-G-643o-32C-2.1ghz-CPU', sourceVendor: 'HPE', estimatedType: 'Processor', assignedPartId: '' },
                      { id: 'dl-3', dirtyString: 'MEM-HPE-64GB-2rx4-ddr5-ram-modl', sourceVendor: 'HPE', estimatedType: 'Memory', assignedPartId: '' },
                    ]);
                    setToast({ message: 'Quotation stream reloaded successfully.', type: 'success' });
                  }}
                  className="mt-2 text-xs py-1.5 px-3 rounded bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 font-bold transition cursor-pointer"
                >
                  Reset Quotation Stream
                </button>
              </div>
            )}
          </div>

          {dirtyLines.length > 0 && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={commitCleansedData}
                className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg bg-[#00d4a0] text-gray-950 font-extrabold hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-[#00d4a0]/10"
              >
                Assemble & Commit Cleansed Schema Maps
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl border space-y-3" style={{ backgroundColor: '#0b1220', borderColor: 'rgba(74,133,253,0.08)' }}>
            <h3 className="text-xs text-white font-bold uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-400" /> Splicing Intelligence Rules
            </h3>
            <div className="text-[11px] text-gray-400 space-y-3 leading-normal">
              <div className="p-2.5 bg-black/20 rounded border border-white/2">
                <p className="font-bold text-white flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-indigo-300" /> CPU mapping</p>
                <p className="mt-0.5">CPU lines mapping automatically resolves cores, GHz frequencies, and legacy socket shapes.</p>
              </div>
              <div className="p-2.5 bg-black/20 rounded border border-white/2">
                <p className="font-bold text-white flex items-center gap-1"><HardDrive className="w-3.5 h-3.5 text-indigo-300" /> SSD mapping</p>
                <p className="mt-0.5">Drives mapping checks read/write ratios, carrier profiles (SFF, LFF), and NVMe connectivity.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Elegant non-obtrusive Toast overlay */}
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
