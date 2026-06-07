import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Command,
  Search,
  Play
} from 'lucide-react';
import { useToast } from './ToastContext';

export function NlpSearchView() {
  const toast = useToast();

  const [nlpQuery, setNlpQuery] = useState('');
  const [nlpIsParsing, setNlpIsParsing] = useState(false);
  const [nlpResult, setNlpResult] = useState<any | null>(null);

  // Run NLP Query parsing simulator
  const handleNLPQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlpQuery.trim()) return;

    setNlpIsParsing(true);
    setNlpResult(null);

    setTimeout(() => {
      const q = nlpQuery.toLowerCase();
      let matchedIntent = 'Catalog Lookup';
      let confidence = 94.5;
      let details = 'Matched NLP pattern query corresponding to inventory SKU status and pricing trends.';
      let list = [
        { label: 'HPE ProLiant DL380 SFF Chassis', val: '$3,400', status: 'In stock', meta: 'HPE Direct' },
        { label: 'Intel Xeon Gold 6430 CPU', val: '$2,150', status: 'Available', meta: 'HPE/Dell' },
        { label: '64GB Dual Rank DDR5 RDIMM', val: '$580', status: 'Restriction check', meta: 'HPE ProLiant' },
      ];

      if (q.includes('cisco') || q.includes('switch') || q.includes('edge')) {
        matchedIntent = 'Symmetry & Routing check';
        confidence = 92.1;
        details = 'Identified Cisco UCS server routing modules and networking edge switches with lifecycle bounds.';
        list = [
          { label: 'Cisco UCS C240 Rack Chassis', val: '$4,100', status: 'Sync active', meta: 'Cisco Systems' },
          { label: 'Catalyst 9300 Edge module', val: '$1,950', status: 'Lead time 12d', meta: 'Cisco Systems' },
        ];
      } else if (q.includes('power') || q.includes('limit') || q.includes('watt')) {
        matchedIntent = 'System Wattage Audit';
        confidence = 97.4;
        details = 'Evaluated power budget guidelines. Calculations project peak consumption thresholds.';
        list = [
          { label: 'Peak server envelope', val: '642 Watt', status: 'Threshold okay', meta: 'Rule 34-A' },
          { label: 'Chassis PSU cooling threshold', val: '800 Watt', status: 'Secure shield', meta: 'Rule 12-B' },
        ];
      } else if (q.includes('lead') || q.includes('day') || q.includes('delivery')) {
        matchedIntent = 'Logistics Lead-time Optimization';
        confidence = 89.9;
        details = 'Calculated delivery durations to project installation milestones.';
        list = [
          { label: 'Primary Compute Node Chassis', val: '5 Days', status: 'Accelerated', meta: 'Local DC' },
          { label: 'Redundant power redundant stack', val: '14 Days', status: 'Sourced global', meta: 'SGP Warehouse' },
        ];
      }

      setNlpResult({
        intent: matchedIntent,
        confidence,
        details,
        tokens: q.split(' ').filter(word => word.length > 3),
        extractedItems: list,
      });
      setNlpIsParsing(false);
      toast.success(`Successfully parsed NLP parameters under confidence index: ${confidence}%`);
    }, 900);
  };

  return (
    <div className="space-y-4 text-xs select-none">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-[#090d16] border border-white/5 py-2 px-4 rounded-xl">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff3d5a]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff9b36]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#00d4a0]" />
          </div>
          <span className="font-mono text-[10px] uppercase font-black tracking-widest text-emerald-400">
            SEMANTIC NLP QUERY INTERPRETER · FIRST CLASS VIEW
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded border border-white/5 text-[9.5px]">
            <span className="text-gray-500 font-mono">PARSER:</span>
            <span className="text-emerald-400 font-bold uppercase tracking-wider">Transformer Segmenter v1.2</span>
          </div>
        </div>
      </div>

      {/* Main Search Panel */}
      <div className="bg-[#0b1220] border border-white/5 rounded-xl p-6 space-y-6 animate-scaleUp">
        
        <div className="text-left">
          <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Command className="w-4.5 h-4.5 text-purple-400" />
            <span>Semantic Search &amp; NLP Sourcing Agent</span>
          </h2>
          <p className="text-gray-500 text-[11px] mt-1.5">
            Query catalogs, equipment configurations, or physical constraint rules in plain human language. Machine learning models extract parameters dynamically without manual querying.
          </p>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleNLPQuerySubmit} className="space-y-3 text-left">
          <div className="relative group">
            <Search className="absolute inset-y-0 left-3.5 my-auto w-4.5 h-4.5 text-gray-500 group-hover:text-purple-400 transition" />
            <input
              type="text"
              placeholder="Try: 'Query Intel CPU stock with HPE compatibility' or 'Check Cisco switches lead days under 14'..."
              value={nlpQuery}
              onChange={(e) => setNlpQuery(e.target.value)}
              className="w-full bg-[#06080e] border border-white/10 rounded-xl py-3.5 pl-11 pr-24 text-white text-xs font-semibold focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500 focus:outline-none placeholder-gray-600 transition"
            />
            <button
              type="submit"
              disabled={nlpIsParsing}
              className="absolute right-2 top-2 bottom-2 px-4 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-extrabold uppercase text-[10px] tracking-wide transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 focus:outline-none"
            >
              {nlpIsParsing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3 h-3" />}
              <span>Parse Query</span>
            </button>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[9.5px] uppercase font-mono font-bold text-gray-650 mr-1 select-none">Quick Queries:</span>
            {[
              { text: 'Check HPE CPU stock compatible with DL380 Refresh', query: 'Query Intel CPU stock with HPE compatibility' },
              { text: 'Verify Cisco catalyst switches maximum delivery timeline', query: 'Check Cisco switches lead days under 14' },
              { text: 'Peak rack telemetry cooling rule', query: 'Calculate peak server power limit on Sheet 1' },
            ].map((pill) => (
              <button
                key={pill.text}
                type="button"
                onClick={() => setNlpQuery(pill.query)}
                className="px-2.5 py-1 rounded-md bg-black/35 hover:bg-white/5 text-gray-400 hover:text-white transition cursor-pointer font-bold uppercase text-[9px] border border-white/3"
              >
                {pill.text}
              </button>
            ))}
          </div>
        </form>

        {/* NLP Parsing Result Card */}
        {nlpResult ? (
          <div className="bg-[#0d1424] border border-purple-500/25 rounded-xl p-4 space-y-4 animate-fadeIn text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-3">
              <div className="space-y-0.5">
                <span className="text-[9px] text-purple-400 font-mono font-bold uppercase tracking-widest block">EXTRACTED CORE INTENT</span>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white uppercase">{nlpResult.intent}</h3>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-mono font-bold">
                    Confidence {nlpResult.confidence}%
                  </span>
                </div>
              </div>

              <div className="flex gap-1">
                {nlpResult.tokens.map((token: string, idx: number) => (
                  <span key={idx} className="font-mono text-[9px] px-2 py-0.5 rounded bg-black/45 border border-white/3 text-indigo-300 font-bold uppercase">
                    #{token}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed font-semibold">
              {nlpResult.details}
            </p>

            {/* Matched Inventory Items Table mockup */}
            <div className="space-y-2">
              <span className="text-[9px] text-[#8ea8d4] font-mono font-bold uppercase block">Core Extracted Entities &amp; SKU Status</span>
              <div className="space-y-1.5 font-sans">
                {nlpResult.extractedItems.map((item: any, idx: number) => (
                  <div key={idx} className="bg-black/25 border border-white/3 p-2.5 rounded-lg flex justify-between items-center text-[10.5px]">
                    <div className="space-y-0.5">
                      <p className="font-bold text-white">{item.label}</p>
                      <p className="text-[9px] font-mono text-gray-500">Registry Source: <strong className="text-purple-400 font-bold font-mono">{item.meta}</strong></p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-400 font-mono">{item.val}</p>
                      <span className="text-[9.5px] px-1.5 py-0.2 bg-white/5 text-gray-300 border border-white/5 rounded font-bold uppercase">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          !nlpIsParsing && (
            <div className="bg-black/10 border border-white/2 rounded-xl p-8 text-center text-gray-500 space-y-2">
              <Command className="w-8 h-8 text-gray-750 mx-auto animate-pulse" />
              <p className="text-xs font-bold text-white">No query parsed yet</p>
              <p className="text-[11.5px] max-w-sm mx-auto text-gray-500 leading-normal">
                Provide syntax instructions in the field above or click a quick example query. The Natural Language Processor will segment tokens, score confidence, and return live matching catalog indices.
              </p>
            </div>
          )
        )}
      </div>

    </div>
  );
}
