import React, { useState } from 'react';
import { 
  Database, Search, Filter, Plus, Edit2, Check, X, 
  RefreshCw, AlertTriangle, Folder, ChevronRight, ChevronDown, 
  Upload, Sparkles, Server, Cpu, Layers, HardDrive, Network, 
  Sliders, Info
} from 'lucide-react';
import type { CatalogSKU } from '../types';

interface CatalogManagerProps {
  catalogSkus: CatalogSKU[];
  setCatalogSkus: React.Dispatch<React.SetStateAction<CatalogSKU[]>>;
}

export function CatalogManager({ catalogSkus, setCatalogSkus }: CatalogManagerProps) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warn' | 'error' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [vendorFilter, setVendorFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [editingSkuId, setEditingSkuId] = useState<string | null>(null);
  const [editedPrice, setEditedPrice] = useState<string>('');
  
  // New SKU creation variables
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVendor, setNewVendor] = useState('HPE');
  const [newPartNo, setNewPartNo] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('Processor');
  const [newPrice, setNewPrice] = useState('');
  const [newLeadTime, setNewLeadTime] = useState('7');

  // Deep Nesting Multi-level Manufacturer Sourcing Taxonomy State
  const [selectedPath, setSelectedPath] = useState({
    vendor: 'all',
    solution: 'all',       // 'Server' | 'Storage' | 'Networking' | 'all'
    product: 'all',        // 'DL380' | 'DL80' | 'MSA' | 'Aruba' | 'R760' | 'UCS' | 'QFX' | 'all'
    generation: 'all',     // 'Gen11' | 'Gen12' | 'G16' | 'M7' | 'all'
    chassis: 'all'         // Specific chassis variant selection ID
  });

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'hpe': true,
    'hpe_Server': true,
    'hpe_Server_DL380': true,
    'hpe_Server_DL380_Gen11': true,
    'dell': true,
    'dell_Server': true,
    'cisco': true,
    'juniper': true
  });

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const selectPathFn = (newPath: typeof selectedPath) => {
    setSelectedPath(newPath);
    setTypeFilter('all');
    setVendorFilter('all');
  };

  const vendors = Array.from(new Set(catalogSkus.map(s => s.vendor)));

  // Master SKU counts that match screenshots & partner counts exactly
  const masterCounts: Record<string, any> = {
    HPE: {
      total: 6254,
      sub: {
        Server: 3102,
        Storage: 1847,
        Networking: 1305
      }
    },
    CISCO: { total: 3847 },
    DELL: { total: 4203 },
    JUNIPER: { total: 1429 },
    PALO: { total: 892 }
  };

  // Helper to retrieve category icon
  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'Chassis': return Server;
      case 'Processor': return Cpu;
      case 'Memory': return Layers;
      case 'Drive': return HardDrive;
      case 'Network Adapter': return Network;
      case 'Power Supply': return Sliders;
      case 'Riser Card': return Sliders;
      default: return Sliders;
    }
  };

  // High fidelity manufacturer deep path catalog filter
  const filteredSkus = catalogSkus.filter((sku) => {
    const matchesSearch =
      sku.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sku.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (searchTerm) {
      return matchesSearch;
    }

    // Top horizontal chips quick filtering option
    if (typeFilter !== 'all') {
      if (sku.type.toLowerCase() !== typeFilter.toLowerCase()) {
        return false;
      }
    }

    // Direct tree node deep path filter
    if (selectedPath.vendor !== 'all') {
      if (sku.vendor.toLowerCase() !== selectedPath.vendor.toLowerCase()) {
        return false;
      }

      if (selectedPath.solution !== 'all') {
        const skuTypeLow = sku.type.toLowerCase();

        // 1. Solution Catalog Slicing
        if (selectedPath.solution === 'Server') {
          const isServerPart = ['chassis', 'processor', 'memory', 'power supply', 'riser card'].includes(skuTypeLow) && 
            !sku.name.toLowerCase().includes('msa') && !sku.name.toLowerCase().includes('switch') && !sku.name.toLowerCase().includes('aruba');
          if (!isServerPart) return false;
        } else if (selectedPath.solution === 'Storage') {
          const isStoragePart = ['drive', 'chassis'].includes(skuTypeLow) && 
            (sku.name.toLowerCase().includes('msa') || sku.partNumber.toLowerCase().includes('r0q74a') || sku.partNumber.toLowerCase().includes('r0q37a') || sku.type === 'Drive');
          if (!isStoragePart) return false;
        } else if (selectedPath.solution === 'Networking') {
          const isNetworkPart = ['network adapter', 'chassis'].includes(skuTypeLow) || 
            sku.name.toLowerCase().includes('switch') || sku.name.toLowerCase().includes('aruba') || sku.name.toLowerCase().includes('nexus') || sku.name.toLowerCase().includes('juniper');
          if (!isNetworkPart) return false;
        }

        // 2. Product Family level
        if (selectedPath.product !== 'all') {
          const skuNameLow = sku.name.toLowerCase();
          const p = selectedPath.product.toLowerCase();

          if (p === 'dl380a') {
            const isDl380a = skuNameLow.includes('dl380a') || sku.partNumber.includes('P58410') || sku.partNumber.includes('P58425') || sku.partNumber.includes('P58500');
            if (!isDl380a) return false;
          } else if (p === 'dl380') {
            // Must NOT include DL380a
            const isDl380 = (skuNameLow.includes('dl380') && !skuNameLow.includes('dl380a')) || sku.partNumber.includes('P40424') || sku.partNumber.includes('P38454') || sku.partNumber.includes('P40483') || sku.partNumber.includes('P40445') || sku.partNumber.includes('865414') || sku.partNumber.includes('P43019') || skuNameLow.includes('platinum 8562y') || sku.partNumber.includes('P50164') || sku.partNumber.includes('P50500') || skuNameLow.includes('broadcom 57414') || skuNameLow.includes('gen13 preview') || sku.partNumber.includes('P70100') || sku.partNumber.includes('P70125');
            if (!isDl380) return false;
          } else if (p === 'dl80') {
            const isDl80 = skuNameLow.includes('dl80') || sku.partNumber.includes('847285') || sku.partNumber.includes('P60120');
            if (!isDl80) return false;
          } else if (p === 'msa') {
            const isMsa = skuNameLow.includes('msa') || sku.partNumber.includes('r0q74a') || sku.partNumber.includes('r0q37a');
            if (!isMsa) return false;
          } else if (p === 'aruba') {
            const isAruba = skuNameLow.includes('aruba') || sku.partNumber.includes('bf100a') || sku.partNumber.includes('1973a');
            if (!isAruba) return false;
          } else if (p === 'r760') {
            const isR760 = skuNameLow.includes('r760') || skuNameLow.includes('poweredge') || sku.partNumber.includes('338-chyt') || sku.partNumber.includes('370-ahff') || sku.partNumber.includes('400-bpsb') || sku.partNumber.includes('540-bcoz') || sku.partNumber.includes('450-adwm');
            if (!isR760) return false;
          } else if (p === 'ucs') {
            const isUcs = skuNameLow.includes('ucs') || sku.partNumber.includes('usc') || sku.partNumber.includes('n20-w6502');
            if (!isUcs) return false;
          } else if (p === 'qfx') {
            const isQfx = skuNameLow.includes('qfx') || sku.partNumber.includes('ex3400') || skuNameLow.includes('juniper') || sku.partNumber.includes('srx300');
            if (!isQfx) return false;
          }

          // 3. Generation Slicing: Gen11 vs Gen12 vs Gen13
          if (selectedPath.generation !== 'all') {
            const gen = selectedPath.generation.toLowerCase();
            if (gen === 'gen11') {
              if (skuNameLow.includes('gen12') || skuNameLow.includes('gen13') || skuNameLow.includes('g12') || skuNameLow.includes('g13') || sku.partNumber.includes('P50123') || sku.partNumber.includes('P50164') || sku.partNumber.includes('P50410') || sku.partNumber.includes('P60120') || sku.partNumber.includes('P70100') || sku.partNumber.includes('P70125')) return false;
            } else if (gen === 'gen12') {
              if (skuNameLow.includes('gen11') || skuNameLow.includes('gen13') || skuNameLow.includes('g11') || skuNameLow.includes('g13') || sku.partNumber.includes('P40424') || sku.partNumber.includes('P38454') || sku.partNumber.includes('P40411') || sku.partNumber.includes('P40412') || sku.partNumber.includes('847285')) return false;
            } else if (gen === 'gen13') {
              if (!skuNameLow.includes('gen13') && !sku.partNumber.includes('P70100') && !sku.partNumber.includes('P70125')) return false;
            }
          }
        }

        // 4. Hierarchical Level Isolation: Main lists only show Chassis vs click-on-chassis shows detailed components
        if (selectedPath.chassis === 'all') {
          // If we are at a high-level catalog sweep, look ONLY for main Chassis/Switch choices
          if (sku.type !== 'Chassis') {
            return false;
          }
        } else {
          // A specific chassis has been selected (e.g., 'sku-4'). Render only the chassis itself + compatible sub-components!
          const activeChassisId = selectedPath.chassis;
          let allowedIds: string[] = [];

          if (activeChassisId === 'sku-4' || activeChassisId === 'sku-4-24sff') {
            // HPE DL380 Gen11 Main or High-Density variants
            allowedIds = ['sku-4', 'sku-4-24sff', 'sku-1', 'sku-2', 'sku-3', 'sku-5', 'sku-hpe-psu1', 'sku-hpe-riser1'];
          } else if (activeChassisId === 'sku-hpe-dl380-gen12-8sff') {
            // HPE DL380 Gen12 Series
            allowedIds = ['sku-hpe-dl380-gen12-8sff', 'sku-hpe-g12-cpu', 'sku-hpe-g12-ram', 'sku-hpe-psu2', 'sku-3'];
          } else if (activeChassisId === 'sku-hpe-dl380a-g11-4dw') {
            // HPE DL380a Accelerator GPU Base
            allowedIds = ['sku-hpe-dl380a-g11-4dw', 'sku-hpe-dl380a-gpu', 'sku-hpe-dl380a-psu', 'sku-1', 'sku-2', 'sku-3'];
          } else if (activeChassisId === 'sku-hpe-dl380-gen13-pref') {
            // HPE DL380 Gen13 Preview
            allowedIds = ['sku-hpe-dl380-gen13-pref', 'sku-hpe-gen13-cpu', 'sku-hpe-dl380a-psu'];
          } else if (activeChassisId === 'sku-hpe-dl80-g11') {
            // HPE DL80 Gen11 Base
            allowedIds = ['sku-hpe-dl80-g11', 'sku-1', 'sku-2', 'sku-3'];
          } else if (activeChassisId === 'sku-hpe-dl80-g12') {
            // HPE DL80 Gen12 Base
            allowedIds = ['sku-hpe-dl80-g12', 'sku-hpe-g12-cpu', 'sku-hpe-g12-ram', 'sku-3'];
          } else if (activeChassisId === 'sku-hpe-msa-2060') {
            // HPE MSA LFF Array Bay Storage
            allowedIds = ['sku-hpe-msa-2060', 'sku-hpe-msa-ssd'];
          } else if (activeChassisId === 'sku-hpe-aruba-10000') {
            // HPE Aruba CX Distributed switch unit
            allowedIds = ['sku-hpe-aruba-10000', 'sku-hpe-aruba-transceiver'];
          } else if (activeChassisId === 'sku-9' || activeChassisId === 'sku-9-24sff') {
            // Dell PowerEdge R760 variants
            allowedIds = ['sku-9', 'sku-9-24sff', 'sku-6', 'sku-7', 'sku-8', 'sku-10', 'sku-dell-psu'];
          } else if (activeChassisId === 'sku-14') {
            // Cisco UCS C240 M7 SFF series
            allowedIds = ['sku-14', 'sku-11', 'sku-12', 'sku-13'];
          } else if (activeChassisId === 'sku-16') {
            // Juniper high performance switch chassis
            allowedIds = ['sku-16', 'sku-15', 'sku-17'];
          } else {
            // Fallback: only show the matched item itself
            allowedIds = [activeChassisId];
          }

          if (!allowedIds.includes(sku.id)) {
            return false;
          }
        }
      }
    }

    return matchesSearch;
  });

  // Unique types inside active project cards
  const projectTypes = ['all', 'Chassis', 'Processor', 'Memory', 'Drive', 'Network Adapter', 'Power Supply', 'Riser Card'];

  function startEditing(sku: CatalogSKU) {
    setEditingSkuId(sku.id);
    setEditedPrice(sku.price.toString());
  }

  function savePrice(skuId: string) {
    const parsedPrice = parseFloat(editedPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) return;
    
    setCatalogSkus((prev) =>
      prev.map((s) => (s.id === skuId ? { ...s, price: parsedPrice } : s))
    );
    setEditingSkuId(null);
  }

  function handleAddSku(e: React.FormEvent) {
    e.preventDefault();
    const parsedPrice = parseFloat(newPrice);
    const parsedLead = parseInt(newLeadTime, 10);
    if (!newPartNo || !newName || isNaN(parsedPrice) || isNaN(parsedLead)) return;

    const newSku: CatalogSKU = {
      id: `sku-custom-${Date.now()}`,
      vendor: newVendor,
      partNumber: newPartNo,
      name: newName,
      type: newType,
      price: parsedPrice,
      leadTimeDays: parsedLead,
      status: 'active'
    };

    setCatalogSkus((prev) => [...prev, newSku]);
    setShowAddForm(false);
    
    // clear fields
    setNewPartNo('');
    setNewName('');
    setNewPrice('');
  }

  // Interactive triggers for taxonomy folder click
  const selectTaxonomy = (vendor: string, category: string = 'all') => {
    setSelectedPath({
      vendor: vendor === 'all' ? 'all' : vendor,
      solution: category === 'all' ? 'all' : category.replace('_Category', ''),
      product: 'all',
      generation: 'all',
      chassis: 'all'
    });
    // Reset filters of the top panel to align
    setVendorFilter('all');
    setTypeFilter('all');
  };

  return (
    <div className="space-y-4 animate-fadeIn select-none text-xs">
      
      {/* Banner / Header */}
      <div 
        className="p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        style={{ background: 'rgba(74,133,253,0.03)', borderColor: 'rgba(74,133,253,0.1)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Database className="w-5.5 h-5.5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">Central Sourcing Database & Inventory Rules</h2>
            <p className="text-[10.5px] text-gray-500 flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sourcing Engine Database — 16,625 SKUs across 5 connected direct vendor APIs</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button" 
            className="px-3 py-1.5 rounded-lg bg-black/20 text-gray-400 hover:text-white border border-white/5 font-semibold transition cursor-pointer text-[10.5px] flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3 text-indigo-400" />
            <span>Sync API</span>
          </button>
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 text-[11px] px-3.5 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 font-bold text-white transition-all cursor-pointer shadow-lg shadow-indigo-500/10 focus:outline-none"
          >
            <Plus className="w-3.5 h-3.5" /> Add Sourced SKU
          </button>
        </div>
      </div>

      {/* Explanation Banner to resolve "Hierarchy Confusion" */}
      <div className="p-3.5 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex items-start gap-2.5">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-white text-[11.5px]">Taxonomy & Sourcing Cardinality Clarity Tool</p>
          <p className="text-gray-400 leading-normal text-[10.5px]">
            Please note: The <strong>Vendor Taxonomy</strong> list represents our partner manufacturer global catalogs 
            (totaling 16,625 available partner items). The right-side cards reflect the filtered active hardware components 
            ({catalogSkus.length} indexed contract codes) assigned to your active procurement solutions.
          </p>
        </div>
      </div>

      {/* Main 2-Column Desktop Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN: VENDOR TAXONOMY DRAWER */}
        <div className="lg:col-span-3 bg-[#0b1220] border border-white/5 rounded-xl p-4 space-y-4">
          <div className="pb-2 border-b border-white/5 flex flex-col">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider font-mono">Manufacturer Taxonomy</span>
            <span className="text-[11.5px] font-bold text-white mt-0.5">{catalogSkus.length} Contract SKUs Indexed</span>
          </div>          {/* Directory Tree Structure */}
          <div className="space-y-1 text-[11px] select-none scrollbar-thin overflow-y-auto max-h-[calc(100vh-24rem)] pr-0.5">
            {/* All SKUs node */}
            <button
              onClick={() => selectPathFn({ vendor: 'all', solution: 'all', product: 'all', generation: 'all', chassis: 'all' })}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition font-semibold ${
                selectedPath.vendor === 'all'
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15'
                  : 'text-gray-400 hover:bg-[#10192e] hover:text-white border border-transparent'
              }`}
            >
              <span className="flex items-center gap-2">
                <Folder className="w-4 h-4 shrink-0 text-indigo-400" />
                <span>All Sourced SKUs</span>
              </span>
              <span className="font-mono text-[9px] bg-black/40 px-1.5 py-0.5 rounded text-indigo-400 font-bold border border-indigo-500/10">
                {catalogSkus.length}
              </span>
            </button>

            {/* Folder list of global partner database stats */}
            <div className="pt-2 space-y-1">
              <span className="text-[9px] text-gray-500 font-bold font-mono tracking-wider px-2 block uppercase mb-1">Global Sourcing Directory</span>
              
              {/* HPE Node (Nested Expandable) */}
              <div className="space-y-0.5 border border-white/5 bg-black/10 rounded-lg p-1.5">
                <div 
                  className={`flex items-center justify-between px-2 py-1.5 rounded-lg transition text-left ${
                    selectedPath.vendor === 'hpe' && selectedPath.solution === 'all' ? 'text-indigo-400 font-bold bg-indigo-500/5' : 'text-gray-300 hover:bg-white/1.5'
                  }`}
                >
                  <button 
                    onClick={() => selectPathFn({ vendor: 'hpe', solution: 'all', product: 'all', generation: 'all', chassis: 'all' })}
                    className="flex-1 text-left flex items-center gap-1.5 font-semibold"
                  >
                    <Folder className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>HPE Global Portal</span>
                  </button>
                  <button 
                    onClick={() => toggleNode('hpe')}
                    className="p-1 hover:text-white text-gray-500 rounded hover:bg-white/5 dynamic-toggle transition"
                  >
                    {expandedNodes['hpe'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {expandedNodes['hpe'] && (
                  <div className="pl-3.5 border-l border-white/5 ml-3 pb-1 space-y-1">
                    
                    {/* Solution level: Server */}
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between px-1.5 py-1 rounded hover:bg-white/1">
                        <button
                          onClick={() => selectPathFn({ vendor: 'hpe', solution: 'Server', product: 'all', generation: 'all', chassis: 'all' })}
                          className={`flex-1 text-left flex items-center gap-1.5 ${selectedPath.vendor === 'hpe' && selectedPath.solution === 'Server' && selectedPath.product === 'all' ? 'text-indigo-400 font-bold' : 'text-gray-400 hover:text-white'}`}
                        >
                          <span className="font-semibold">• Server Solutions</span>
                        </button>
                        <button onClick={() => toggleNode('hpe_Server')} className="text-gray-500 hover:text-white">
                          {expandedNodes['hpe_Server'] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                      </div>

                      {expandedNodes['hpe_Server'] && (
                        <div className="pl-3 border-l border-white/5 ml-2 pb-1 space-y-1 text-[10.5px]">
                          
                          {/* DL380 Series */}
                          <div className="space-y-0.5">
                            <div className="flex items-center justify-between px-1.5 py-0.5 rounded hover:bg-white/1">
                              <button
                                onClick={() => selectPathFn({ vendor: 'hpe', solution: 'Server', product: 'DL380', generation: 'all', chassis: 'all' })}
                                className={`flex-1 text-left ${selectedPath.product === 'DL380' && selectedPath.generation === 'all' ? 'text-indigo-400 font-bold' : 'text-gray-500 hover:text-white'}`}
                              >
                                <span>- DL380 Family</span>
                              </button>
                              <button 
                                onClick={() => toggleNode('hpe_Server_DL380')} 
                                className="text-gray-600 hover:text-white"
                              >
                                {expandedNodes['hpe_Server_DL380'] ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
                              </button>
                            </div>

                            {expandedNodes['hpe_Server_DL380'] && (
                              <div className="pl-3 border-l border-white/5 ml-2 space-y-1 text-[10px]">
                                {/* Gen 11 */}
                                <div className="space-y-0.5">
                                  <div className="flex items-center justify-between py-0.5 px-1 rounded hover:bg-white/1">
                                    <button
                                      onClick={() => selectPathFn({ vendor: 'hpe', solution: 'Server', product: 'DL380', generation: 'Gen11', chassis: 'all' })}
                                      className={`flex-1 text-left ${selectedPath.product === 'DL380' && selectedPath.generation === 'Gen11' && selectedPath.chassis === 'all' ? 'text-indigo-400 font-bold' : 'text-gray-500 hover:text-white'}`}
                                    >
                                      <span>Gen 11 Range</span>
                                    </button>
                                    <button 
                                      onClick={() => toggleNode('hpe_Server_DL380_Gen11')} 
                                      className="text-gray-650 hover:text-white"
                                    >
                                      {expandedNodes['hpe_Server_DL380_Gen11'] ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
                                    </button>
                                  </div>

                                  {expandedNodes['hpe_Server_DL380_Gen11'] && (
                                    <div className="pl-3 space-y-0.5 text-[9.5px] text-gray-500">
                                      <button 
                                        onClick={() => selectPathFn({ vendor: 'hpe', solution: 'Server', product: 'DL380', generation: 'Gen11', chassis: 'sku-4' })}
                                        className={`w-full text-left py-0.5 px-1 rounded block truncate ${selectedPath.chassis === 'sku-4' ? 'bg-emerald-500/10 text-[#00d4a0] font-bold' : 'hover:text-white'}`}
                                      >
                                        8SFF Main Chassis
                                      </button>
                                      <button 
                                        onClick={() => selectPathFn({ vendor: 'hpe', solution: 'Server', product: 'DL380', generation: 'Gen11', chassis: 'sku-4-24sff' })}
                                        className={`w-full text-left py-0.5 px-1 rounded block truncate ${selectedPath.chassis === 'sku-4-24sff' ? 'bg-emerald-500/10 text-[#00d4a0] font-bold' : 'hover:text-white'}`}
                                      >
                                        24SFF High Density
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Gen 11 - DL380a Accelerator */}
                                <div className="space-y-0.5">
                                  <div className="flex items-center justify-between py-0.5 px-1 rounded hover:bg-white/1">
                                    <button
                                      onClick={() => selectPathFn({ vendor: 'hpe', solution: 'Server', product: 'DL380a', generation: 'Gen11', chassis: 'all' })}
                                      className={`flex-1 text-left ${selectedPath.product === 'DL380a' && selectedPath.generation === 'Gen11' && selectedPath.chassis === 'all' ? 'text-indigo-400 font-bold' : 'text-gray-500 hover:text-white'}`}
                                    >
                                      <span className="text-[#a855f7] font-semibold">DL380a Gen11 Accelerator</span>
                                    </button>
                                    <button 
                                      onClick={() => toggleNode('hpe_Server_DL380a_Gen11')} 
                                      className="text-gray-650 hover:text-white"
                                    >
                                      {expandedNodes['hpe_Server_DL380a_Gen11'] ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
                                    </button>
                                  </div>

                                  {expandedNodes['hpe_Server_DL380a_Gen11'] && (
                                    <div className="pl-3 space-y-0.5 text-[9.5px] text-gray-500">
                                      <button 
                                        onClick={() => selectPathFn({ vendor: 'hpe', solution: 'Server', product: 'DL380a', generation: 'Gen11', chassis: 'sku-hpe-dl380a-g11-4dw' })}
                                        className={`w-full text-left py-0.5 px-1 rounded block truncate ${selectedPath.chassis === 'sku-hpe-dl380a-g11-4dw' ? 'bg-purple-500/10 text-[#a855f7] font-bold' : 'hover:text-white'}`}
                                      >
                                        4DW GPU CTO Chassis
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Gen 12 */}
                                <div className="space-y-0.5">
                                  <div className="flex items-center justify-between py-0.5 px-1 rounded hover:bg-white/1">
                                    <button
                                      onClick={() => selectPathFn({ vendor: 'hpe', solution: 'Server', product: 'DL380', generation: 'Gen12', chassis: 'all' })}
                                      className={`flex-1 text-left ${selectedPath.product === 'DL380' && selectedPath.generation === 'Gen12' && selectedPath.chassis === 'all' ? 'text-indigo-400 font-bold' : 'text-gray-500 hover:text-white'}`}
                                    >
                                      <span>Gen 12 Range</span>
                                    </button>
                                    <button 
                                      onClick={() => toggleNode('hpe_Server_DL380_Gen12')} 
                                      className="text-gray-655 hover:text-white"
                                    >
                                      {expandedNodes['hpe_Server_DL380_Gen12'] ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
                                    </button>
                                  </div>

                                  {expandedNodes['hpe_Server_DL380_Gen12'] && (
                                    <div className="pl-3 space-y-0.5 text-[9.5px] text-gray-500">
                                      <button 
                                        onClick={() => selectPathFn({ vendor: 'hpe', solution: 'Server', product: 'DL380', generation: 'Gen12', chassis: 'sku-hpe-dl380-gen12-8sff' })}
                                        className={`w-full text-left py-0.5 px-1 rounded block truncate ${selectedPath.chassis === 'sku-hpe-dl380-gen12-8sff' ? 'bg-emerald-500/10 text-[#00d4a0] font-bold' : 'hover:text-white'}`}
                                      >
                                        8SFF High Power
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Gen 13 Preview (Roadmap Future-Tech) */}
                                <div className="space-y-0.5">
                                  <div className="flex items-center justify-between py-0.5 px-1 rounded hover:bg-white/1">
                                    <button
                                      onClick={() => selectPathFn({ vendor: 'hpe', solution: 'Server', product: 'DL380', generation: 'Gen13', chassis: 'all' })}
                                      className={`flex-1 text-left ${selectedPath.product === 'DL380' && selectedPath.generation === 'Gen13' && selectedPath.chassis === 'all' ? 'text-[#00d4a0] font-bold' : 'text-gray-500 hover:text-white'}`}
                                    >
                                      <span className="text-[#00d4a0] font-semibold">Gen 13 Range Preview</span>
                                    </button>
                                    <button 
                                      onClick={() => toggleNode('hpe_Server_DL380_Gen13')} 
                                      className="text-gray-650 hover:text-white"
                                    >
                                      {expandedNodes['hpe_Server_DL380_Gen13'] ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
                                    </button>
                                  </div>

                                  {expandedNodes['hpe_Server_DL380_Gen13'] && (
                                    <div className="pl-3 space-y-0.5 text-[9.5px] text-gray-500">
                                      <button 
                                        onClick={() => selectPathFn({ vendor: 'hpe', solution: 'Server', product: 'DL380', generation: 'Gen13', chassis: 'sku-hpe-dl380-gen13-pref' })}
                                        className={`w-full text-left py-0.5 px-1 rounded block truncate ${selectedPath.chassis === 'sku-hpe-dl380-gen13-pref' ? 'bg-emerald-500/10 text-[#00d4a0] font-bold' : 'hover:text-white'}`}
                                      >
                                        Enterprise Preview Chassis
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* DL80 Series */}
                          <div className="space-y-0.5">
                            <div className="flex items-center justify-between px-1.5 py-0.5 rounded hover:bg-white/1">
                              <button
                                onClick={() => selectPathFn({ vendor: 'hpe', solution: 'Server', product: 'DL80', generation: 'all', chassis: 'all' })}
                                className={`flex-1 text-left ${selectedPath.product === 'DL80' && selectedPath.generation === 'all' ? 'text-indigo-400 font-bold' : 'text-gray-500 hover:text-white'}`}
                              >
                                <span>- DL80 Family</span>
                              </button>
                              <button 
                                onClick={() => toggleNode('hpe_Server_DL80')} 
                                className="text-gray-600 hover:text-white"
                              >
                                {expandedNodes['hpe_Server_DL80'] ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
                              </button>
                            </div>

                            {expandedNodes['hpe_Server_DL80'] && (
                              <div className="pl-3 border-l border-white/5 ml-2 space-y-1 text-[9.5px]">
                                <button 
                                  onClick={() => selectPathFn({ vendor: 'hpe', solution: 'Server', product: 'DL80', generation: 'Gen11', chassis: 'sku-hpe-dl80-g11' })}
                                  className={`w-full text-left py-0.5 px-1 rounded block truncate ${selectedPath.chassis === 'sku-hpe-dl80-g11' ? 'bg-emerald-500/10 text-[#00d4a0] font-bold' : 'text-gray-500 hover:text-white'}`}
                                >
                                  Gen 11 12LFF Chassis
                                </button>
                                <button 
                                  onClick={() => selectPathFn({ vendor: 'hpe', solution: 'Server', product: 'DL80', generation: 'Gen12', chassis: 'sku-hpe-dl80-g12' })}
                                  className={`w-full text-left py-0.5 px-1 rounded block truncate ${selectedPath.chassis === 'sku-hpe-dl80-g12' ? 'bg-emerald-500/10 text-[#00d4a0] font-bold' : 'text-gray-500 hover:text-white'}`}
                                >
                                  Gen 12 12LFF Chassis
                                </button>
                              </div>
                            )}
                          </div>

                        </div>
                      )}
                    </div>

                    {/* Solution level: Storage */}
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between px-1.5 py-1 rounded hover:bg-white/1">
                        <button
                          onClick={() => selectPathFn({ vendor: 'hpe', solution: 'Storage', product: 'all', generation: 'all', chassis: 'all' })}
                          className={`flex-1 text-left flex items-center gap-1.5 ${selectedPath.vendor === 'hpe' && selectedPath.solution === 'Storage' && selectedPath.product === 'all' ? 'text-indigo-400 font-bold' : 'text-gray-400 hover:text-white'}`}
                        >
                          <span className="font-semibold">• Storage Solutions</span>
                        </button>
                        <button onClick={() => toggleNode('hpe_Storage')} className="text-gray-500 hover:text-white">
                          {expandedNodes['hpe_Storage'] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                      </div>

                      {expandedNodes['hpe_Storage'] && (
                        <div className="pl-3 border-l border-white/5 ml-2 pb-1 space-y-1 text-[10.5px]">
                          <button
                            onClick={() => selectPathFn({ vendor: 'hpe', solution: 'Storage', product: 'MSA', generation: 'all', chassis: 'sku-hpe-msa-2060' })}
                            className={`w-full text-left py-1 px-1.5 rounded hover:bg-white/1 block truncate ${selectedPath.product === 'MSA' ? 'bg-indigo-500/10 text-indigo-400 font-bold' : 'text-gray-500 hover:text-white'}`}
                          >
                            - MSA 2060 Array Chassis
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Solution level: Networking */}
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between px-1.5 py-1 rounded hover:bg-white/1">
                        <button
                          onClick={() => selectPathFn({ vendor: 'hpe', solution: 'Networking', product: 'all', generation: 'all', chassis: 'all' })}
                          className={`flex-1 text-left flex items-center gap-1.5 ${selectedPath.vendor === 'hpe' && selectedPath.solution === 'Networking' && selectedPath.product === 'all' ? 'text-indigo-400 font-bold' : 'text-gray-400 hover:text-white'}`}
                        >
                          <span className="font-semibold">• Networking Solutions</span>
                        </button>
                        <button onClick={() => toggleNode('hpe_Networking')} className="text-gray-500 hover:text-white">
                          {expandedNodes['hpe_Networking'] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                      </div>

                      {expandedNodes['hpe_Networking'] && (
                        <div className="pl-3 border-l border-white/5 ml-2 pb-1 space-y-1 text-[10.5px]">
                          <button
                            onClick={() => selectPathFn({ vendor: 'hpe', solution: 'Networking', product: 'Aruba', generation: 'all', chassis: 'sku-hpe-aruba-10000' })}
                            className={`w-full text-left py-1 px-1.5 rounded hover:bg-white/1 block truncate ${selectedPath.product === 'Aruba' ? 'bg-indigo-500/10 text-indigo-400 font-bold' : 'text-gray-500 hover:text-white'}`}
                          >
                            - Aruba CX Dist. Services Switch
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>

              {/* Cisco Node (Nested Expandable) */}
              <div className="space-y-0.5 border border-white/5 bg-black/10 rounded-lg p-1.5">
                <div 
                  className={`flex items-center justify-between px-2 py-1.5 rounded-lg transition text-left ${
                    selectedPath.vendor === 'cisco' && selectedPath.solution === 'all' ? 'text-purple-400 font-bold bg-purple-500/5' : 'text-gray-300 hover:bg-white/1.5'
                  }`}
                >
                  <button 
                    onClick={() => selectPathFn({ vendor: 'cisco', solution: 'all', product: 'all', generation: 'all', chassis: 'all' })}
                    className="flex-1 text-left flex items-center gap-1.5 font-semibold"
                  >
                    <Folder className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>CISCO Systems</span>
                  </button>
                  <button 
                    onClick={() => toggleNode('cisco')}
                    className="p-1 hover:text-white text-gray-500 rounded hover:bg-white/5 dynamic-toggle transition"
                  >
                    {expandedNodes['cisco'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {expandedNodes['cisco'] && (
                  <div className="pl-3.5 border-l border-white/5 ml-3 pb-1 space-y-1">
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between px-1.5 py-1 rounded hover:bg-white/1">
                        <button
                          onClick={() => selectPathFn({ vendor: 'cisco', solution: 'Server', product: 'UCS', generation: 'all', chassis: 'all' })}
                          className={`flex-1 text-left flex items-center gap-1.5 ${selectedPath.vendor === 'cisco' && selectedPath.solution === 'Server' ? 'text-purple-400 font-bold' : 'text-gray-400 hover:text-white'}`}
                        >
                          <span className="font-semibold">• UCS Compute Series</span>
                        </button>
                      </div>
                      
                      <div className="pl-3 border-l border-white/5 ml-2 pb-0.5 space-y-1 text-[10.5px]">
                        <button
                          onClick={() => selectPathFn({ vendor: 'cisco', solution: 'Server', product: 'UCS', generation: 'all', chassis: 'sku-14' })}
                          className={`w-full text-left py-0.5 px-1.5 rounded hover:bg-white/1 block truncate ${selectedPath.chassis === 'sku-14' ? 'bg-purple-500/10 text-purple-400 font-bold' : 'text-gray-500 hover:text-white'}`}
                        >
                          - UCS C240 M7 CTO Chassis
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dell Node (Nested Expandable) */}
              <div className="space-y-0.5 border border-white/5 bg-black/10 rounded-lg p-1.5">
                <div 
                  className={`flex items-center justify-between px-2 py-1.5 rounded-lg transition text-left ${
                    selectedPath.vendor === 'dell' && selectedPath.solution === 'all' ? 'text-indigo-400 font-bold bg-indigo-500/5' : 'text-gray-300 hover:bg-white/1.5'
                  }`}
                >
                  <button 
                    onClick={() => selectPathFn({ vendor: 'dell', solution: 'all', product: 'all', generation: 'all', chassis: 'all' })}
                    className="flex-1 text-left flex items-center gap-1.5 font-semibold"
                  >
                    <Folder className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>DELL EMC Solutions</span>
                  </button>
                  <button 
                    onClick={() => toggleNode('dell')}
                    className="p-1 hover:text-white text-gray-500 rounded hover:bg-white/5 dynamic-toggle transition"
                  >
                    {expandedNodes['dell'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {expandedNodes['dell'] && (
                  <div className="pl-3.5 border-l border-white/5 ml-3 pb-1 space-y-1">
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between px-1.5 py-1 rounded hover:bg-white/1">
                        <button
                          onClick={() => selectPathFn({ vendor: 'dell', solution: 'Server', product: 'R760', generation: 'all', chassis: 'all' })}
                          className={`flex-1 text-left flex items-center gap-1.5 ${selectedPath.vendor === 'dell' && selectedPath.solution === 'Server' ? 'text-sky-400 font-bold' : 'text-gray-400 hover:text-white'}`}
                        >
                          <span className="font-semibold">• PowerEdge Clusters</span>
                        </button>
                      </div>

                      <div className="pl-3 border-l border-white/5 ml-2 pb-0.5 space-y-1 text-[10.5px]">
                        <button
                          onClick={() => selectPathFn({ vendor: 'dell', solution: 'Server', product: 'R760', generation: 'all', chassis: 'sku-9' })}
                          className={`w-full text-left py-0.5 px-1.5 rounded hover:bg-white/1 block truncate ${selectedPath.chassis === 'sku-9' ? 'bg-sky-500/10 text-sky-400 font-bold' : 'text-gray-500 hover:text-white'}`}
                        >
                          - PowerEdge R760 8SFF Chassis
                        </button>
                        <button
                          onClick={() => selectPathFn({ vendor: 'dell', solution: 'Server', product: 'R760', generation: 'all', chassis: 'sku-9-24sff' })}
                          className={`w-full text-left py-0.5 px-1.5 rounded hover:bg-white/1 block truncate ${selectedPath.chassis === 'sku-9-24sff' ? 'bg-sky-500/10 text-sky-400 font-bold' : 'text-gray-500 hover:text-white'}`}
                        >
                          - PowerEdge 24SFF HighDensity
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Juniper Node (Nested Expandable) */}
              <div className="space-y-0.5 border border-white/5 bg-black/10 rounded-lg p-1.5">
                <div 
                  className={`flex items-center justify-between px-2 py-1.5 rounded-lg transition text-left ${
                    selectedPath.vendor === 'juniper' && selectedPath.solution === 'all' ? 'text-emerald-400 font-bold bg-emerald-500/5' : 'text-gray-350 hover:bg-white/1.5'
                  }`}
                >
                  <button 
                    onClick={() => selectPathFn({ vendor: 'juniper', solution: 'all', product: 'all', generation: 'all', chassis: 'all' })}
                    className="flex-1 text-left flex items-center gap-1.5 font-semibold"
                  >
                    <Folder className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>JUNIPER Networks</span>
                  </button>
                  <button 
                    onClick={() => toggleNode('juniper')}
                    className="p-1 hover:text-white text-gray-500 rounded hover:bg-white/5 dynamic-toggle transition"
                  >
                    {expandedNodes['juniper'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {expandedNodes['juniper'] && (
                  <div className="pl-3.5 border-l border-white/5 ml-3 pb-1 space-y-1">
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between px-1.5 py-1 rounded hover:bg-white/1">
                        <button
                          onClick={() => selectPathFn({ vendor: 'juniper', solution: 'Networking', product: 'QFX', generation: 'all', chassis: 'sku-16' })}
                          className={`flex-1 text-left flex items-center gap-1.5 ${selectedPath.vendor === 'juniper' && selectedPath.solution === 'Networking' ? 'text-emerald-400 font-bold' : 'text-gray-400 hover:text-white'}`}
                        >
                          <span className="font-semibold">• Switch Fabric Systems</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Sourcing Ingest Excel/CSV block */}
          <div className="p-3 bg-black/30 border border-white/5 rounded-lg space-y-2 pt-2.5">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Bulk Taxonomy Ingest</span>
            <p className="text-[10px] text-gray-500 leading-normal">
              Sync pricing schemas directly from partner Excel workbooks or CSV sweeps.
            </p>
            <button 
              type="button" 
              onClick={() => setToast({ message: "Ready. Drop your workbook files directly inside the Solution Architecture Builder's intake drawer.", type: "success" })}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 font-bold transition cursor-pointer text-[10.5px]"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Ingest Sheets</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE SKU CARDS GRID */}
        <div className="lg:col-span-9 space-y-4">
          
          {/* Filters Control Toolbar */}
          <div className="p-3.5 bg-[#0b1220] border border-white/5 rounded-xl text-xs flex flex-col md:flex-row items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Active Part Number or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded bg-black/25 text-white placeholder-gray-500 border border-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 font-medium"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Path indicator or filter pill state label */}
            <div className="flex items-center gap-2 text-[10.5px]">
              <span className="text-gray-500 font-bold">Currently Viewing:</span>
              <span className="px-2.5 py-1 rounded bg-[#10192e] border border-indigo-500/15 text-indigo-400 font-mono font-bold uppercase">
                {selectedPath.vendor === 'all' ? 'All Vendors' : selectedPath.vendor} 
                {selectedPath.solution !== 'all' && ` > ${selectedPath.solution}`}
                {selectedPath.product !== 'all' && ` > ${selectedPath.product}`}
                {selectedPath.generation !== 'all' && ` > ${selectedPath.generation}`}
                {selectedPath.chassis !== 'all' && ` > CHASSIS`}
              </span>
              {(selectedPath.vendor !== 'all' || selectedPath.solution !== 'all' || searchTerm) && (
                <button
                  onClick={() => {
                    setSelectedPath({ vendor: 'all', solution: 'all', product: 'all', generation: 'all', chassis: 'all' });
                    setSearchTerm('');
                    setVendorFilter('all');
                    setTypeFilter('all');
                  }}
                  className="text-indigo-400 hover:text-white font-bold flex items-center gap-0.5 cursor-pointer ml-1"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Quick Chips selector */}
          <div className="flex gap-2 flex-wrap items-center">
            {projectTypes.map((type) => {
              const isActive = typeFilter === type.toLowerCase() || (type === 'all' && typeFilter === 'all');
              // Count dynamic matched types in active local ledger
              const matchesCount = type === 'all' 
                ? catalogSkus.length 
                : catalogSkus.filter(s => s.type.toLowerCase() === type.toLowerCase()).length;
              
              return (
                <button
                  key={type}
                  onClick={() => {
                    setTypeFilter(type.toLowerCase());
                    setSelectedPath({ vendor: 'all', solution: 'all', product: 'all', generation: 'all', chassis: 'all' }); // reset side folders
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    isActive 
                      ? 'bg-indigo-500 text-white border-transparent shadow shadow-indigo-500/20' 
                      : 'bg-[#0b1220] border-white/5 text-gray-400 hover:text-white hover:bg-[#0f1728]'
                  }`}
                >
                  <span>{type === 'all' ? 'All' : type}</span>
                  <span className={`font-mono text-[9px] px-1.5 py-0.2 rounded font-black ${isActive ? 'bg-black/30 text-white' : 'bg-black/40 text-gray-500'}`}>
                    {matchesCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Hardware Sourcing Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredSkus.length > 0 ? (
              filteredSkus.map((sku) => {
                const isEditing = editingSkuId === sku.id;
                const isEol = sku.status === 'eol';
                const IconComponent = getCategoryIcon(sku.type);
                
                // Color configuration of labels based on hardware vendors
                const brandColors: Record<string, string> = {
                  HPE: 'rgba(0, 212, 160, 1)',
                  Dell: 'rgba(74, 133, 253, 1)',
                  Cisco: 'rgba(168, 85, 247, 1)',
                  Juniper: 'rgba(16, 185, 129, 1)',
                };
                const activeColor = brandColors[sku.vendor] || 'rgba(148, 163, 184, 1)';

                return (
                  <div 
                    key={sku.id} 
                    className="bg-[#0b1220] border rounded-xl p-4 flex flex-col justify-between hover:border-indigo-500/30 transition duration-200 relative overflow-hidden group/card"
                    style={{ borderColor: isEditing ? '#00d4a0' : 'rgba(74,133,253,0.06)' }}
                  >
                    
                    {/* Top Row content */}
                    <div className="flex gap-3 items-start">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 bg-[#0f172a] border-white/5">
                        <IconComponent className="w-5 h-5 text-indigo-400" />
                      </div>

                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold font-mono tracking-wide uppercase truncate" style={{ color: activeColor }}>
                            {sku.vendor}
                          </span>
                          <span className="text-[8.5px] bg-black/40 font-extrabold px-2 py-0.5 rounded border border-white/5 text-gray-400 tracking-wide uppercase shrink-0">
                            {sku.type}
                          </span>
                        </div>
                        
                        <h4 className="font-bold text-white text-xs mt-1 truncate" title={sku.name}>
                          {sku.name}
                        </h4>
                        <p className="font-mono text-[9px] text-indigo-400 font-bold mt-1 tracking-wider">
                          {sku.partNumber}
                        </p>
                      </div>
                    </div>

                    {/* Common hardware specs representation */}
                    <div className="mt-4 p-2 bg-black/15 border border-white/2 rounded flex items-center justify-between text-[9px] text-gray-500 leading-none">
                      <span className="font-mono">SPEC: COMMON {sku.type.toUpperCase()}</span>
                      <span className="font-mono text-gray-400">{sku.leadTimeDays}D Lead</span>
                    </div>

                    {/* Bottom Row action & price details */}
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        isEol ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-[#00d4a0]/10 text-[#00d4a0] border border-[#00d4a0]/15'
                      }`}>
                        {sku.status.toUpperCase()}
                      </span>

                      {/* Interactive inline pricing controls */}
                      <div className="text-right">
                        {isEditing ? (
                          <div className="flex items-center gap-1 justify-end">
                            <span className="text-gray-500 font-mono font-bold">$</span>
                            <input
                              type="text"
                              value={editedPrice}
                              onChange={(e) => setEditedPrice(e.target.value)}
                              className="w-16 p-1 h-6 text-right bg-[#090d19] text-[#00d4a0] font-mono border rounded border-[#00d4a0]/35 text-[10px] focus:outline-none"
                              autoFocus
                            />
                            <button onClick={() => savePrice(sku.id)} className="p-0.5 rounded hover:bg-emerald-500/20 text-[#00d4a0] cursor-pointer" title="Save Price">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setEditingSkuId(null)} className="p-0.5 rounded hover:bg-red-500/20 text-red-400 cursor-pointer" title="Cancel">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 justify-end group/price">
                            <span className="font-mono text-xs font-black text-[#00d4a0]">
                              ${sku.price.toLocaleString()}
                            </span>
                            <button 
                              onClick={() => startEditing(sku)}
                              className="opacity-0 group-hover/card:opacity-100 p-1 hover:bg-white/5 rounded text-gray-500 hover:text-indigo-400 transition cursor-pointer shrink-0"
                              title="Edit Price"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="col-span-12 p-8 text-center text-gray-500 bg-[#0b1220] border border-white/5 rounded-xl border-dashed">
                <AlertTriangle className="w-7 h-7 text-amber-500 m-auto opacity-50 mb-2" />
                <p className="italic text-xs">No project SKUs discovered matching current taxonomy filter parameters.</p>
                <button 
                  onClick={() => {
                    setSelectedPath({ vendor: 'all', solution: 'all', product: 'all', generation: 'all', chassis: 'all' });
                    setVendorFilter('all');
                    setTypeFilter('all');
                    setSearchTerm('');
                  }}
                  className="mt-3 text-[10.5px] text-indigo-400 hover:text-white font-bold cursor-pointer underline decoration-dotted"
                >
                  Clear Sourcing Filters
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Add Custom SKU form overlay dialog */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/65 flex items-center justify-center p-4 z-50 animate-fadeIn select-none leading-normal">
          <div className="w-full max-w-sm rounded-xl border p-5 space-y-4" style={{ backgroundColor: '#090d19', borderColor: 'rgba(74,133,253,0.18)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'rgba(74,133,253,0.06)' }}>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-400" /> Insert Direct Sourced SKU
              </h3>
              <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSku} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold uppercase">Vendor</label>
                  <select
                    value={newVendor}
                    onChange={(e) => setNewVendor(e.target.value)}
                    className="w-full p-2.5 bg-[#090d19] border border-white/6 text-white text-xs focus:outline-none"
                  >
                    <option value="HPE">HPE</option>
                    <option value="Dell">Dell</option>
                    <option value="Cisco">Cisco</option>
                    <option value="Juniper">Juniper</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold uppercase">Category</label>
                  <select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="w-full p-2.5 bg-[#090d19] border border-white/6 text-white text-xs focus:outline-none"
                  >
                    <option value="Processor">Processor</option>
                    <option value="Memory">Memory</option>
                    <option value="Drive">Drive</option>
                    <option value="Chassis">Chassis</option>
                    <option value="Network Adapter">Network Adapt.</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-semibold uppercase">Part Number ID</label>
                <input
                  type="text"
                  value={newPartNo}
                  onChange={(e) => setNewPartNo(e.target.value)}
                  placeholder="e.g. P40445-B21"
                  className="w-full p-2.5 bg-black/30 border border-white/6 text-white font-mono uppercase"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-semibold uppercase">Part Description</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Intel Gold 6430 32-Core 2.1GHz"
                  className="w-full p-2.5 bg-black/30 border border-white/6 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold uppercase">Contract Rate ($)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="2450"
                    className="w-full p-2.5 bg-black/30 border border-white/6 text-white font-mono"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold uppercase">Lead Time (Days)</label>
                  <input
                    type="number"
                    value={newLeadTime}
                    onChange={(e) => setNewLeadTime(e.target.value)}
                    placeholder="7"
                    className="w-full p-2.5 bg-black/30 border border-white/6 text-white"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 border-t flex justify-end gap-2" style={{ borderColor: 'rgba(74,133,253,0.06)' }}>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded bg-black/20 text-gray-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-500 font-bold text-white hover:bg-indigo-600 cursor-pointer animate-pulseFast"
                >
                  Add Part
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
          <Info className="w-4 h-4 shrink-0" />
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
