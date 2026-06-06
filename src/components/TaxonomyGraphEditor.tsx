import React, { useState } from 'react';
import { 
  Network, Plus, CheckCircle, HelpCircle, HardDrive, Cpu, 
  Layers, AlertTriangle, Zap, ShieldCheck, ArrowRight, 
  Trash2, RefreshCw, Layers3, Activity, Tag, Sparkles
} from 'lucide-react';
import { UCID } from '../types';

interface TaxonomyNode {
  id: string;
  label: string;
  group: 'category' | 'class' | 'socket' | 'connector' | 'pricing';
  details: string;
  status?: 'compliant' | 'violation';
  impact?: string;
}

interface TaxonomyEdge {
  from: string;
  to: string;
  linkType: string;
}

interface TaxonomyGraphEditorProps {
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  activeMissionId?: string;
  setActiveMissionId?: React.Dispatch<React.SetStateAction<string | undefined>>;
  onNavigate?: (view: any) => void;
}

export function TaxonomyGraphEditor({
  ucids,
  setUcids,
  activeMissionId,
  setActiveMissionId = () => {},
}: TaxonomyGraphEditorProps) {
  
  // Local notification toasts
  const [toast, setToast] = useState<string | null>(null);

  function triggerToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  }

  // Active selected configuration context or default to first
  const currUcid = ucids.find(u => u.id === activeMissionId) || ucids[0];

  // Dynamic system evaluation based on the currently selected active profile
  const hasEolSourcingRisk = currUcid?.solutions?.some(sol =>
    sol.items.some(it => it.partNumber === '815100-B21')
  ) || false;

  const hasPriceVarianceRisk = currUcid?.solutions?.some(sol =>
    sol.items.some(it => it.partNumber === '400-BPSB' && it.unitPrice > 1190)
  ) || false;

  const hasCiscoMemorySymmetryRisk = currUcid?.solutions?.some(sol =>
    sol.vendor === 'Cisco' && sol.items.some(it => it.type === 'Memory' && it.quantity % 8 !== 0)
  ) || false;

  // Active hardware supplier details
  const activeVendor = currUcid?.solutions?.[0]?.vendor || 'Unknown';

  // 1. DYNAMIC SYSTEM NODES (Derived from the current active profile)
  const chassisNodeLabel = activeVendor === 'HPE' 
    ? 'HPE ProLiant Chassis (Gen11)' 
    : activeVendor === 'Dell' 
    ? 'Dell PowerEdge R760 Frame' 
    : activeVendor === 'Cisco'
    ? 'Cisco UCS C240 Rack Chassis'
    : 'System Host Platform';

  const derivedNodes: TaxonomyNode[] = [
    { 
      id: 'n-chassis', 
      label: chassisNodeLabel, 
      group: 'category', 
      details: 'Dual-socket enterprise architecture. Master backplane, motherboard power feed, and physical drive-cage slots.',
      status: 'compliant'
    },
    { 
      id: 'n-cpu', 
      label: hasEolSourcingRisk ? 'Obsolete Intel Xeon 6130 CPU' : 'LGA-Aligned Intel Xeon Gold CPU', 
      group: 'class', 
      details: hasEolSourcingRisk 
        ? 'Legacy 1st-Gen Scalable processor. Crucial factory EOL lead times (45+ days) and grey market hazards.' 
        : 'SOP-Standard 4th-Gen Scalable Intel processor representing standard procurement rules.',
      status: hasEolSourcingRisk ? 'violation' : 'compliant',
      impact: 'Throws HPE Gen11 thermal limits warning & socket mismatch.'
    },
    { 
      id: 'n-socket', 
      label: hasEolSourcingRisk ? 'Socket LGA3647 (Obsolete Socket)' : 'Socket LGA4677 Pin Matrix', 
      group: 'socket', 
      details: hasEolSourcingRisk 
        ? 'Incompatible chassis socket interface. Host chassis board is keyed for LGA4677 pins.' 
        : 'Aligned mechanical socket parameters configured cleanly with dual-socket motherboard pathways.',
      status: hasEolSourcingRisk ? 'violation' : 'compliant',
      impact: 'Physical mismatch prohibits processor pin placement.'
    },
    { 
      id: 'n-ram', 
      label: hasCiscoMemorySymmetryRisk ? 'Asymmetric 5-Module MEM Layout' : 'Symmetric 8-Channel RAM Bus', 
      group: 'connector', 
      details: hasCiscoMemorySymmetryRisk 
        ? 'Odd allocation modules. Processor integrated memory controller requires 8 matching channels to run optimally.' 
        : 'Standard symmetric 8-channel interleaving layout mapping 64GB DDR5 memory modules symmetrically.',
      status: hasCiscoMemorySymmetryRisk ? 'violation' : 'compliant',
      impact: 'Layout asymmetry restricts memory module bus throughput.'
    },
    { 
      id: 'n-pricing', 
      label: hasPriceVarianceRisk ? 'Non-Compliant Price Markup ($1,590)' : 'Direct Negotiated Pricing Rate ($1,190)', 
      group: 'pricing', 
      details: hasPriceVarianceRisk 
        ? 'Active quote is billed with 33% markup mark-ups (Enterprise limit ceiling: $1,190).' 
        : 'API negotiated pricing baseline locked at standard discount program rules.',
      status: hasPriceVarianceRisk ? 'violation' : 'compliant',
      impact: 'Exceeds maximum contract ceiling rates.'
    }
  ];

  // User customs nodes and custom edges
  const [customNodes, setCustomNodes] = useState<TaxonomyNode[]>([]);
  const [customEdges, setCustomEdges] = useState<TaxonomyEdge[]>([]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('n-chassis');
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeGroup, setNewNodeGroup] = useState<'class' | 'socket' | 'connector'>('class');

  // Combined Node Set
  const nodes = [...derivedNodes, ...customNodes];

  // Combine derived relationships and user actions
  const derivedEdges: TaxonomyEdge[] = [
    { from: 'n-chassis', to: 'n-cpu', linkType: 'hosts_processor_core' },
    { from: 'n-cpu', to: 'n-socket', linkType: 'mates_socket_pins' },
    { from: 'n-chassis', to: 'n-ram', linkType: 'ram_symmetry_load' },
    { from: 'n-chassis', to: 'n-pricing', linkType: 'contract_cap_audit' }
  ];
  const edges = [...derivedEdges, ...customEdges];

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  // Dynamic Rule Constraints evaluation matrix
  const rules = [
    {
      id: 'LGA_SOCKET_PINS_CONFORMITY_RULE',
      name: 'CPU Socket Assembly Pins Conformity',
      status: hasEolSourcingRisk ? 'FAILED' : 'PASSED',
      desc: 'Enforces motherboard socket indexing and electrical socket code alignments. Obsolete processors cannot host active Gen11 LGA4677 pin matrices.',
      impact: 'Triggers manual grey-market supply search and voids official manufacturer SLAs.',
      actionLabel: 'Upgrade CPU to Gold 6430 & Re-Key socket',
      healId: 'iss-1'
    },
    {
      id: 'PER_CHANNEL_RAM_SYMMETRY_RULE',
      name: '8-Channel RAM Bus Symmetry Enforcer',
      status: hasCiscoMemorySymmetryRisk ? 'FAILED' : 'PASSED',
      desc: 'Validates motherboard multi-channel interleaving symmetry. Odd layouts cause server memory index bus lag.',
      impact: 'Limits motherboard bus bandwidth causing high latency bottlenecks.',
      actionLabel: 'Symmetrize Load to 8 Modules',
      healId: 'iss-3'
    },
    {
      id: 'SUPPLIER_CONTRACT_PRICE_CAP_RULE',
      name: 'Supplier Negotiated Contract Price Cap',
      status: hasPriceVarianceRisk ? 'FAILED' : 'PASSED',
      desc: 'Enforces strict price ceilings matching master API contract databases. Flags markups surpassing authorized bounds.',
      impact: 'Inflated vendor markups reduce active pool budget efficiency.',
      actionLabel: 'Enforce Negotiated Pricing Rate ($1,190)',
      healId: 'iss-2'
    }
  ];

  // Direct trigger solver
  function handleHealWithFeedback(healId: string) {
    if (!currUcid) return;

    if (healId === 'iss-1') {
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
                  msg: 'Taxonomy Logic Solver: Replaced obsolete HPE CPU SKU 815100-B21 with standard Intel Gold 6430 (P40424-B21). Socket keyed to LGA4677 pins cleanly.',
                },
              ],
            };
          }
          return u;
        })
      );
      triggerToast('Taxonomy rule resolved: CPU & Socket Pins are matched and verified!');
    }

    if (healId === 'iss-2') {
      // Dell Price Cap Align
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
                  msg: 'Taxonomy Logic Solver: Aligned Dell NVMe quotation pricing to direct API contract rates ($1,190 limit ceiling).',
                },
              ],
            };
          }
          return u;
        })
      );
      triggerToast('Taxonomy rule resolved: Quotation markup capped at $1,190.');
    }

    if (healId === 'iss-3') {
      // Cisco UCS Memory Symmetry rebalancer
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
                  msg: 'Taxonomy Logic Solver: Symmetrized Cisco integrated controller channel quantity to 8 dual-rank modules.',
                },
              ],
            };
          }
          return u;
        })
      );
      triggerToast('Taxonomy rule resolved: Channel symmetry restored for Intel memory controllers!');
    }
  }

  // Interactive node dependency additions
  function handleCreateNode(e: React.FormEvent) {
    e.preventDefault();
    if (!newNodeName.trim()) return;

    const nid = `n-custom-${Date.now()}`;
    const nnode: TaxonomyNode = {
      id: nid,
      label: newNodeName.trim(),
      group: newNodeGroup,
      details: 'Evaluated dependency added in active draft simulation workspace.',
      status: 'compliant'
    };

    setCustomNodes(prev => [...prev, nnode]);
    setNewNodeName('');

    if (selectedNodeId) {
      setCustomEdges(prev => [...prev, { from: selectedNodeId, to: nid, linkType: 'depends_on_hardware' }]);
      triggerToast(`Custom dependency node "${newNodeName.trim()}" linked to parent!`);
    } else {
      triggerToast(`Added standalone component node: "${newNodeName.trim()}".`);
    }
  }

  function handleDeleteCustomNode(nodeId: string) {
    setCustomNodes(prev => prev.filter(n => n.id !== nodeId));
    setCustomEdges(prev => prev.filter(e => e.from !== nodeId && e.to !== nodeId));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId('n-chassis');
    }
    triggerToast('Removed custom model node.');
  }

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      
      {/* Toast banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl border shadow-2xl bg-[#091512] border-emerald-500/80 flex items-center gap-3 animate-slideIn">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="text-xs text-white font-medium">{toast}</span>
        </div>
      )}

      {/* Dynamic Title Header */}
      <div 
        className="p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl"
        style={{ background: 'linear-gradient(135deg, rgba(74,133,253,0.05) 0%, rgba(15,23,42,0) 100%)', borderColor: 'rgba(74,133,253,0.15)' }}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/25 shrink-0">
            <Network className="w-5 h-5 text-indigo-400 animate-spinSlow" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">Taxonomic Procurement Constraint & Assembly Graph</h2>
            <p className="text-[11px] text-gray-400 leading-normal">
              Map and solve hardware validation constraints, CPU pin socket types, RAM channel symmetry layouts, and supplier contract ceilings.
            </p>
          </div>
        </div>
        
        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/15 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider self-start md:self-auto uppercase">
          Dynamic Rules Engine Connected
        </span>
      </div>

      {/* Context Working Sync State Selector */}
      {currUcid && (
        <div className="bg-[#0b1220] p-4 rounded-xl border border-indigo-500/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>
            <div className="min-w-0">
              <span className="text-gray-400 text-[11px]">Evaluating Constraint Mapping Context: </span>
              <strong className="text-white font-mono bg-black/40 px-2 py-0.5 rounded border border-white/5">{currUcid.displayId}</strong>
              <span className="text-gray-500 font-medium ml-1.5 hidden md:inline">— {currUcid.name}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-right shrink-0">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Target Profile Context:</span>
            <select
              value={currUcid.id}
              onChange={(e) => setActiveMissionId(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-white text-[11px] font-mono focus:outline-none focus:border-indigo-500 cursor-pointer text-left"
            >
              {ucids.map(u => (
                <option key={u.id} value={u.id}>
                  {u.displayId} — {u.name.length > 25 ? u.name.substring(0, 25) + '...' : u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Main Graph Grid Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        
        {/* Interactive Workspace Area */}
        <div className="lg:col-span-2 p-5 rounded-xl border flex flex-col gap-5 shadow-2xl relative" style={{ backgroundColor: '#0b1220', borderColor: 'rgba(74,133,253,0.1)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-white font-semibold uppercase tracking-wider">Physical Constraint Map Canvas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-500 font-mono">Nodes: {nodes.length} · Edges: {edges.length}</span>
            </div>
          </div>

          {/* Interactive Topology Graph Visualizer Panel */}
          <div className="relative min-h-[350px] p-5 rounded-xl border border-indigo-500/10 bg-black/35 flex flex-col items-center justify-between gap-6 overflow-hidden">
            
            {/* Visual Vector Grid Backplate Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4a85fd 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

            <div className="w-full text-center relative z-10">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Workspace Platform Blueprint Linkages</p>
            </div>

            {/* Simulated Nodes visual layout block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full relative z-10 my-auto">
              {nodes.map(node => {
                const active = node.id === selectedNodeId;
                const matchesViolated = node.status === 'violation';
                const counts = edges.filter(e => e.from === node.id || e.to === node.id).length;
                const isCustom = node.id.startsWith('n-custom-');

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer relative group ${
                      active 
                        ? 'bg-indigo-500/10 border-indigo-400 shadow-lg shadow-indigo-500/5' 
                        : matchesViolated
                        ? 'bg-[#1c0f13] border-[#ff3d5a]/45 hover:border-[#ff3d5a]/75 shadow-md shadow-red-500/5 animate-pulse'
                        : 'bg-[#070a13] border-white/5 hover:border-indigo-500/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[8.5px] uppercase font-black px-1.5 py-0.2 rounded tracking-wide leading-none ${
                        matchesViolated 
                          ? 'bg-[#ff3d5a]/15 text-[#ff3d5a]' 
                          : 'bg-indigo-500/15 text-indigo-300'
                      }`}>
                        {node.group}
                      </span>
                      <span className="text-[9px] text-gray-500 font-mono">{counts} lines</span>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs font-extrabold text-white leading-tight flex items-center gap-1">
                        {matchesViolated && <AlertTriangle className="w-3 h-3 text-[#ff3d5a] shrink-0" />}
                        {node.label}
                      </p>
                      <p className="text-[10px] text-gray-400 line-clamp-2 mt-1 leading-normal font-sans tracking-wide">
                        {node.details}
                      </p>
                    </div>

                    {/* Badge state indicator */}
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-mono">
                      <span className={matchesViolated ? 'text-[#ff3d5a] font-bold' : 'text-emerald-400'}>
                        {matchesViolated ? '⚠ SLA Mismatch' : '✓ Verified Standard'}
                      </span>
                      {isCustom && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomNode(node.id);
                          }}
                          className="text-gray-500 hover:text-red-400 transition"
                          title="Delete Custom Dependency Node"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    
                    {active && (
                      <span className="absolute -top-1.2 -right-1.2 w-2.5 h-2.5 rounded-full bg-indigo-400" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="w-full text-center text-gray-500 italic text-[10px] bg-white/[0.01] p-3 rounded-lg border border-white/5 relative z-10">
              Interactive Blueprint Guide: Click any node block to explore active dependency pathways, review physical socket rules, or inject draft models below.
            </div>
          </div>
          
          {/* USER CUSTOM CONNECTOR FORM - FULLY RESPONSIVE WRAPPING DESIGN */}
          <form onSubmit={handleCreateNode} className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-3">
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#8ba4cc] tracking-wider block">Add Workspace Dependency Connection</span>
              <p className="text-[10px] text-gray-500 leading-normal mt-0.5">Introduce a customized daughter component dependency directly connected off your active selected node.</p>
            </div>
            
            {/* Input wrap container with responsive flex-col to sm:flex-row to avoid overflow */}
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <input
                type="text"
                value={newNodeName}
                onChange={(e) => setNewNodeName(e.target.value)}
                placeholder='e.g. Brocade Fibre-Channel NIC (815 NIC-A)...'
                className="flex-1 p-2.5 bg-black/55 border border-white/10 rounded-lg text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 text-left min-w-0"
                required
              />
              
              <div className="flex gap-2 shrink-0">
                <select
                  value={newNodeGroup}
                  onChange={(e: any) => setNewNodeGroup(e.target.value)}
                  className="p-2.5 bg-[#070a13] border border-white/10 rounded-lg text-white text-xs select-none cursor-pointer focus:outline-none shrink-0"
                >
                  <option value="class">Class</option>
                  <option value="socket">Socket Pins</option>
                  <option value="connector">Interface Port</option>
                </select>
                
                {/* Visual Fix of the Blue Button: Width parameters responsive, won't overflow the form box bounds */}
                <button 
                  type="submit" 
                  className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg cursor-pointer font-bold text-xs shrink-0 select-none transition active:scale-95 flex items-center justify-center gap-1.5 focus:outline-none"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Link Component</span>
                </button>
              </div>
            </div>
          </form>

        </div>

        {/* Sidebar Panel - Active Sourcing Constraint Engine Rules Checklist */}
        <div className="space-y-6">
          
          {/* Detailed Node Information */}
          {selectedNode ? (
            <div className="p-4 rounded-xl border space-y-4 shadow-md bg-[#0b1220]" style={{ borderColor: 'rgba(74,133,253,0.1)' }}>
              <div>
                <span className="text-[9.5px] uppercase font-bold text-indigo-400 font-mono tracking-widest leading-none bg-indigo-500/10 px-2 py-0.5 rounded">
                  {selectedNode.group} SPECIFICATIONS
                </span>
                <h3 className="text-sm font-bold text-white mt-2 flex items-center gap-1.5">
                  {selectedNode.status === 'violation' && <AlertTriangle className="w-4 h-4 text-[#ff3d5a]" />}
                  {selectedNode.label}
                </h3>
                <p className="text-[11px] text-gray-300 leading-relaxed mt-2.5 italic p-3 bg-black/40 rounded-lg border border-white/5">
                  {selectedNode.details}
                </p>
                {selectedNode.status === 'violation' && selectedNode.impact && (
                  <div className="mt-2.5 p-2.5 rounded-lg border bg-[#1c0f13] border-[#ff3d5a]/20 text-[#ff3d5a] text-[10px]">
                    <span className="font-bold uppercase tracking-wider block">Constraint Impact:</span>
                    <p className="mt-0.5 leading-normal text-gray-300 font-medium">{selectedNode.impact}</p>
                  </div>
                )}
              </div>

              {/* Edge/Link Constraints for current node */}
              <div className="border-t border-white/5 pt-3">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">Topology Map Connections</span>
                <div className="space-y-2 mt-2">
                  {edges.filter(e => e.from === selectedNode.id || e.to === selectedNode.id).map((edge, i) => {
                    const peerId = edge.from === selectedNode.id ? edge.to : edge.from;
                    const peer = nodes.find(n => n.id === peerId);
                    return (
                      <div key={i} className="flex justify-between items-center p-2.5 rounded-lg bg-black/35 border border-white/5 text-[11px] leading-none">
                        <div className="min-w-0">
                          <span className="text-indigo-400 font-mono text-[9px] block uppercase font-bold">{edge.linkType}</span>
                          <span className="text-gray-200 mt-1 block truncate font-semibold">→ {peer?.label || 'Dangling Pin'}</span>
                        </div>
                      </div>
                    );
                  })}
                  {edges.filter(e => e.from === selectedNode.id || e.to === selectedNode.id).length === 0 && (
                    <p className="text-[10px] text-gray-500 italic">No direct logical lines coupled.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="p-4 rounded-xl border border-dashed border-gray-800 text-gray-500 text-center italic bg-black/20">
              Select any graph node block to interrogate electrical socket specifications or supplier ceilings.
            </p>
          )}

          {/* Sourcing Constraint Validation Dashboard (Connecting Forensic view active issues dynamically) */}
          <div className="p-4 rounded-xl border space-y-4 shadow-md bg-[#0b1220]" style={{ borderColor: 'rgba(74,133,253,0.1)' }}>
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-1.5 min-w-0">
                <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-white font-bold tracking-tight">Logical Sourcing Rules</span>
              </div>
              <span className="text-[10px] font-mono text-gray-500 font-bold uppercase">Evaluator Matrix</span>
            </div>

            <div className="space-y-3 max-h-[385px] overflow-y-auto pr-1">
              {rules.map((rule) => {
                const isPassed = rule.status === 'PASSED';
                return (
                  <div 
                    key={rule.id} 
                    className={`p-3 rounded-xl border transition-all ${
                      isPassed 
                        ? 'bg-[#091512] border-emerald-500/10' 
                        : 'bg-[#1c0f13] border-[#ff3d5a]/25'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold text-white truncate">{rule.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-wider leading-none shrink-0 ${
                        isPassed 
                          ? 'bg-emerald-400/15 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-[#ff3d5a]/15 text-[#ff3d5a] border border-[#ff3d5a]/20 animate-pulse'
                      }`}>
                        {rule.status}
                      </span>
                    </div>

                    <p className="text-[10px] text-gray-400 leading-normal mt-2">
                      {rule.desc}
                    </p>

                    {!isPassed && (
                      <div className="mt-3.5 pt-2 pt-2 border-t border-white/5 flex flex-col gap-2">
                        <div className="text-[9.5px] text-[#ff3d5a] leading-relaxed">
                          <strong className="uppercase">Failure Impact limit:</strong> {rule.impact}
                        </div>
                        
                        {/* Auto-Solve Sourcing Rule button */}
                        <button
                          type="button"
                          onClick={() => handleHealWithFeedback(rule.healId)}
                          className="w-full text-center py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold cursor-pointer transition select-none flex items-center justify-center gap-1.5 focus:outline-none text-[10px]"
                        >
                          <Zap className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                          <span>{rule.actionLabel}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
