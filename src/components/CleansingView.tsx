import React, { useState } from 'react';
import { 
  Search, XCircle, RefreshCw, Zap, CheckCircle, AlertTriangle, 
  ChevronRight, Shield, Database, X, Tag, ArrowRight
} from 'lucide-react';
import { ForensicIssue } from '../types';

interface DirtyLine {
  id: string;
  sku: string;
  source: 'BOQ' | 'BOM';
  vendor: string;
  status: 'AMBIGUOUS' | 'UNKNOWN' | 'CONFLICT';
  issue: string;
}

export function CleansingView({ forensicIssues, setForensicIssues }: {
  forensicIssues: ForensicIssue[];
  setForensicIssues: React.Dispatch<React.SetStateAction<ForensicIssue[]>>;
}) {
  const [dirtyLines, setDirtyLines] = useState<DirtyLine[]>([
    { id: '1', sku: 'C9200-24T-A', status: 'AMBIGUOUS', source: 'BOQ', vendor: 'Cisco', issue: 'Suffix variant not in catalog' },
    { id: '2', sku: 'DL380 Gen10 Plus', status: 'UNKNOWN', source: 'BOM', vendor: 'HPE', issue: 'Generation alias unresolved' },
    { id: '3', sku: 'SFPPLUS-10G-SR', status: 'CONFLICT', source: 'BOQ', vendor: 'Generic', issue: 'Multi-vendor mapping conflict' },
    { id: '4', sku: 'EX4300-48T-AFO', status: 'AMBIGUOUS', source: 'BOM', vendor: 'Juniper', issue: 'Airflow suffix ambiguous' },
    { id: '5', sku: 'SY32KH-ICH', status: 'UNKNOWN', source: 'BOQ', vendor: 'APC', issue: 'Regional SKU variant' },
    { id: '6', sku: 'N9K-C93180YC-EX', status: 'AMBIGUOUS', source: 'BOM', vendor: 'Cisco', issue: 'Nexus linecard config unclear' }
  ]);

  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLineId, setSelectedLineId] = useState<string>('1');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warn' | 'error' } | null>(null);
  
  const selectedLine = dirtyLines.find(l => l.id === selectedLineId);

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'AMBIGUOUS': return <span className="px-2 py-0.5 rounded border border-[#eab308]/30 bg-[#eab308]/10 text-[#eab308] text-[9px] font-bold uppercase">AMBIGUOUS</span>;
      case 'UNKNOWN': return <span className="px-2 py-0.5 rounded border border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444] text-[9px] font-bold uppercase">UNKNOWN</span>;
      case 'CONFLICT': return <span className="px-2 py-0.5 rounded border border-[#a855f7]/30 bg-[#a855f7]/10 text-[#a855f7] text-[9px] font-bold uppercase">CONFLICT</span>;
      default: return null;
    }
  };

  const handleMap = (id: string) => {
    setDirtyLines(prev => prev.filter(l => l.id !== id));
    setToast({ message: 'SKU successfully mapped to catalog UCID.', type: 'success' });
    if (selectedLineId === id) {
      const next = dirtyLines.find(l => l.id !== id);
      setSelectedLineId(next ? next.id : '');
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn h-full min-h-0 text-[#dde6ff] font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Taxonomy Cleansing Center</h2>
          <p className="text-xs text-gray-400 mt-1">Resolve unmapped and ambiguous SKUs from BOQ imports before automation runs</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] font-bold text-xs">
            <XCircle className="w-4 h-4" /> {dirtyLines.length} Pending
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] font-bold text-xs">
            <CheckCircle className="w-4 h-4" /> {6 - dirtyLines.length} Resolved
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Left Panel: Quarantine Queue */}
        <div className="lg:w-1/3 flex flex-col bg-[#0b1220] rounded-xl border border-[rgba(74,133,253,0.15)] flex-1 min-h-0 shadow-lg">
          <div className="p-4 border-b border-white/5 space-y-4 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#ef4444] font-bold text-sm">
                <AlertTriangle className="w-4 h-4" /> Quarantine Queue
              </div>
              <span className="w-6 h-6 rounded bg-[#ef4444]/20 text-[#ef4444] text-xs font-bold flex items-center justify-center">
                {dirtyLines.length}
              </span>
            </div>
            
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Filter by SKU or vendor..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="flex gap-2 text-[10px] font-bold">
              {['All', 'Ambiguous', 'Unknown', 'Conflict'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`px-3 py-1.5 rounded-full transition ${filterType === f ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-transparent text-gray-500 border border-white/5 hover:bg-white/5'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar">
            {dirtyLines.map(line => (
              <button
                key={line.id}
                onClick={() => setSelectedLineId(line.id)}
                className={`w-full text-left p-3 rounded-lg border transition ${selectedLineId === line.id ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-transparent border-transparent hover:bg-white/5'}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {line.status === 'AMBIGUOUS' ? <AlertTriangle className="w-3.5 h-3.5 text-[#eab308]" /> : 
                     line.status === 'CONFLICT' ? <RefreshCw className="w-3.5 h-3.5 text-[#a855f7]" /> :
                     <XCircle className="w-3.5 h-3.5 text-[#ef4444]" />}
                    <span className="font-mono text-xs font-bold text-white">{line.sku}</span>
                  </div>
                  <StatusBadge status={line.status} />
                  {selectedLineId === line.id && <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0" />}
                </div>
                <div className="text-[10px] text-gray-500 flex items-center gap-2">
                  <span>{line.source} · {line.vendor}</span>
                </div>
                <div className="text-[10px] text-gray-400 mt-1">{line.issue}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel: Resolution */}
        <div className="lg:w-2/3 flex flex-col gap-4 flex-1 min-h-0">
          
          {selectedLine ? (
            <>
              {/* Target Item Bar */}
              <div className="p-5 bg-[#0b1220] rounded-xl border border-[#eab308]/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-lg">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-xl bg-[#eab308]/10 border border-[#eab308]/30 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 text-[#eab308]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold font-mono text-white">{selectedLine.sku}</h3>
                      <StatusBadge status={selectedLine.status} />
                    </div>
                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-3 font-mono">
                      <span>Source: <strong className="text-gray-300">{selectedLine.source}</strong></span>
                      <span>Vendor: <strong className="text-gray-300">{selectedLine.vendor}</strong></span>
                      <span>Issue: <strong className="text-[#eab308]">{selectedLine.issue}</strong></span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-4 md:mt-0">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-[#ef4444] border border-[#ef4444]/20 hover:bg-[#ef4444]/10 transition text-xs font-bold">
                    <XCircle className="w-3.5 h-3.5" /> Exclude
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20 transition text-xs font-bold">
                    <RefreshCw className="w-3.5 h-3.5" /> Re-scan
                  </button>
                </div>
              </div>

              {/* Suggestions Panel */}
              <div className="bg-[#0b1220] rounded-xl border border-[rgba(74,133,253,0.15)] flex flex-col flex-1 min-h-0 shadow-lg">
                <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-indigo-400" />
                    <h4 className="text-sm font-bold text-white">Semantic Suggestions</h4>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">3 matches</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#eab308] font-bold">
                    <Zap className="w-3.5 h-3.5" /> Jaro-Winkler + BERT
                  </div>
                </div>

                <div className="p-4 overflow-y-auto space-y-4 flex-1 scrollbar">
                  {[
                    { id: '1', title: 'Catalyst 9200 24-Port PoE+', ucid: 'UCID-CSC-88241', vendor: 'Cisco', category: 'Switching / Campus', reason: 'SKU stem match + vendor confirmed', conf: 94, best: true },
                    { id: '2', title: 'Catalyst 9200 24-Port Non-PoE', ucid: 'UCID-CSC-88239', vendor: 'Cisco', category: 'Switching / Campus', reason: 'High phonetic similarity, no PoE tag', conf: 87, best: false },
                    { id: '3', title: 'Catalyst 9200L 24-Port', ucid: 'UCID-CSC-88300', vendor: 'Cisco', category: 'Switching / Campus', reason: 'Lite variant — port count matches', conf: 71, best: false }
                  ].map((sug, idx) => (
                    <div key={sug.id} className="p-4 rounded-xl border border-white/10 bg-black/40 hover:bg-black/60 transition group">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${sug.best ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h5 className="text-sm font-bold text-white">{sug.title}</h5>
                              {sug.best && <span className="px-2 py-0.5 rounded bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 text-[9px] font-bold uppercase">Best Match</span>}
                            </div>
                            <div className="text-[10px] font-mono text-gray-500 mt-1.5 space-x-2">
                              <span className="text-indigo-400 font-bold">{sug.ucid}</span>
                              <span>·</span>
                              <span>{sug.vendor}</span>
                              <span>·</span>
                              <span className="flex items-center gap-1 inline-flex"><Tag className="w-3 h-3" /> {sug.category}</span>
                            </div>
                            
                            <div className="mt-4 flex items-center gap-4">
                              <div className="flex-1 h-1.5 bg-black rounded-full overflow-hidden w-64 border border-white/5">
                                <div 
                                  className="h-full rounded-full transition-all"
                                  style={{ 
                                    width: `${sug.conf}%`,
                                    background: sug.conf > 90 ? '#10b981' : sug.conf > 80 ? '#6366f1' : '#f59e0b'
                                  }}
                                />
                              </div>
                              <span className="text-xs font-bold font-mono" style={{ color: sug.conf > 90 ? '#10b981' : sug.conf > 80 ? '#6366f1' : '#f59e0b' }}>
                                {sug.conf}%
                              </span>
                            </div>
                            
                            <div className="text-[10px] text-gray-500 mt-3 bg-white/5 p-2 rounded inline-block">
                              Why: <span className="text-gray-400">{sug.reason}</span>
                            </div>
                          </div>
                        </div>
                        
                        <button onClick={() => handleMap(selectedLine.id)} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg flex items-center gap-2 text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all opacity-0 group-hover:opacity-100">
                          Map to Catalog <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Manual Override Footer */}
                <div className="p-4 border-t border-white/5 bg-black/40 rounded-b-xl shrink-0">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Manual UCID Override</span>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder="Enter UCID manually e.g. UCID-CSC-88241"
                      className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <button onClick={() => handleMap(selectedLine.id)} className="px-5 py-2 bg-transparent border border-indigo-500/50 hover:bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-bold transition flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5" /> Apply
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 border border-white/5 bg-[#0b1220] rounded-xl flex items-center justify-center text-center p-8">
              <div>
                <CheckCircle className="w-12 h-12 text-[#10b981] mx-auto mb-4 opacity-50" />
                <h3 className="text-white font-bold mb-2">All SKUs Resolved</h3>
                <p className="text-gray-500 text-xs max-w-sm">
                  The BOQ configuration stream runs fully mapped to canonical nodes. The Taxonomy rule graph is clear.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl border shadow-2xl bg-[#0b1220] border-[#10b981] flex items-center gap-3 animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-[#10b981]" />
          <span className="text-xs text-white font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-4 text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
}

