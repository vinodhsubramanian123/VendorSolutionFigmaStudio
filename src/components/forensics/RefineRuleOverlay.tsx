import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BrainCircuit, X, Check } from "lucide-react";
import type { SourcingRule } from "../../types";
import type { AdviceTriageItem } from "./AdviceFileIngestion";

interface RefineRuleOverlayProps {
  refiningItem: AdviceTriageItem | null;
  setRefiningItem: (item: AdviceTriageItem | null) => void;
  onRuleDrafted: (rule: SourcingRule) => void;
  setAdviceItems: React.Dispatch<React.SetStateAction<AdviceTriageItem[]>>;
}

interface RemedyOption {
  sku: string;
  desc: string;
  checked: boolean;
}

export function RefineRuleOverlay({
  refiningItem,
  setRefiningItem,
  onRuleDrafted,
  setAdviceItems
}: RefineRuleOverlayProps) {
  const [refineTargetSku, setRefineTargetSku] = useState("");
  const [refineSeverity, setRefineSeverity] = useState<"critical" | "warning" | "info">("warning");
  const [refineRuleType, setRefineRuleType] = useState<SourcingRule["ruleType"]>("substitution");
  const [refineAssociatedSkus, setRefineAssociatedSkus] = useState("");
  const [refineCliScript, setRefineCliScript] = useState("");
  const [refineNotes, setRefineNotes] = useState("");
  const [refineScope, setRefineScope] = useState("Exact SKU Match Only");
  const [suggestedSkus, setSuggestedSkus] = useState<string[]>([]);
  const [remedyOptions, setRemedyOptions] = useState<RemedyOption[]>([]);
  const [combinationOperator, setCombinationOperator] = useState<"AND" | "OR">("OR");

  useEffect(() => {
    if (refiningItem) {
      setRefineTargetSku(refiningItem.productNumber);
      setRefineSeverity(refiningItem.severity);
      
      let ruleType: SourcingRule["ruleType"] = "substitution";
      if (refiningItem.adviceText.toLowerCase().includes("license") || refiningItem.adviceText.toLowerCase().includes("software") || refiningItem.adviceText.toLowerCase().includes("os")) {
        ruleType = "api_gateway";
      } else if (refiningItem.adviceText.toLowerCase().includes("symmetry") || refiningItem.adviceText.toLowerCase().includes("balance")) {
        ruleType = "symmetry";
      }
      setRefineRuleType(ruleType);
      
      // Extract candidates flat list
      const skuRegex = /[a-zA-Z0-9]{5,8}-[a-zA-Z0-9]{3,4}/g;
      const matches = refiningItem.adviceText.match(skuRegex) || [];
      const candidates = Array.from(new Set(matches)).filter(
        sku => sku !== refiningItem.productNumber && sku !== "DL380-Gen12"
      );
      setSuggestedSkus(candidates);

      // Extract options with descriptions from lines
      const lines = refiningItem.adviceText.split("\n");
      const options: RemedyOption[] = [];
      
      lines.forEach(line => {
        const skuMatch = line.match(/([a-zA-Z0-9]{5,8}-[a-zA-Z0-9]{3,4})/);
        if (skuMatch) {
          const foundSku = skuMatch[1];
          if (foundSku !== refiningItem.productNumber && !foundSku.includes("DL380") && !foundSku.includes("Gen12")) {
            // Extract description
            const parts = line.split(foundSku);
            const remainder = parts[1] || "";
            const cleanDesc = remainder
              .replace(/\t/g, " ")
              .replace(/\bFIO\b/i, "")
              .replace(/\b0D1\b/i, "")
              .replace(/^\s*[-:]?\s*/, "")
              .trim();
              
            if (!options.some(o => o.sku === foundSku)) {
              options.push({
                sku: foundSku,
                desc: cleanDesc || "Companion SKU option",
                checked: false
              });
            }
          }
        }
      });

      setRemedyOptions(options);
      setRefineAssociatedSkus("");
      setRefineCliScript("");
      setRefineNotes("");
      setRefineScope("Exact SKU Match Only");

      // Heuristically set operator
      if (refiningItem.adviceText.toLowerCase().includes("minimum and maximum 1") || refiningItem.adviceText.toLowerCase().includes("one of the") || refiningItem.adviceText.toLowerCase().includes("select other")) {
        setCombinationOperator("OR");
      } else {
        setCombinationOperator("AND");
      }
    }
  }, [refiningItem]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setRefiningItem(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [setRefiningItem]);

  const handleToggleRemedyOption = (sku: string) => {
    const updated = remedyOptions.map(o => o.sku === sku ? { ...o, checked: !o.checked } : o);
    setRemedyOptions(updated);
    
    // Update refineAssociatedSkus based on checked options and operator
    const checkedSkus = updated.filter(o => o.checked).map(o => o.sku);
    if (checkedSkus.length > 0) {
      if (combinationOperator === "OR") {
        setRefineAssociatedSkus(checkedSkus.join(" | "));
      } else {
        setRefineAssociatedSkus(checkedSkus.join(", "));
      }
      // Generate standard notes
      const selectedNames = updated.filter(o => o.checked).map(o => `${o.sku} (${o.desc})`).join(", ");
      setRefineNotes(`Configuration constraint resolved by selecting: ${selectedNames}`);
      // Generate a mock CLI command
      setRefineCliScript(`hpe-cli configure --add ${checkedSkus[0]}`);
    } else {
      setRefineAssociatedSkus("");
      setRefineNotes("");
      setRefineCliScript("");
    }
  };

  const handleOperatorChange = (op: "AND" | "OR") => {
    setCombinationOperator(op);
    const checkedSkus = remedyOptions.filter(o => o.checked).map(o => o.sku);
    if (checkedSkus.length > 0) {
      if (op === "OR") {
        setRefineAssociatedSkus(checkedSkus.join(" | "));
      } else {
        setRefineAssociatedSkus(checkedSkus.join(", "));
      }
    }
  };

  const handleSaveRefinedRule = () => {
    if (!refiningItem) return;
    
    const draftRule: SourcingRule = {
      id: crypto.randomUUID(),
      ruleType: refineRuleType,
      partNumber: refineTargetSku.trim(),
      mappedOutput: refineAssociatedSkus.trim() || "SYMMETRY_ENFORCED",
      label: `Advice Class ${refiningItem.ruleNumber}: ${refiningItem.adviceText.replace(/\n/g, ' ')} [Scope: ${refineScope}]`,
      vendor: refiningItem.vendor,
      status: "draft",
      isAutoLearned: true,
      learnedAt: new Date().toISOString(),
      associatedSkus: refineAssociatedSkus.trim() || undefined,
      cliScript: refineCliScript.trim() || undefined,
      notes: refineNotes.trim() || undefined
    };

    onRuleDrafted(draftRule);

    setAdviceItems(prev =>
      prev.map(a => a.id === refiningItem.id ? { ...a, drafted: true } : a)
    );
    setRefiningItem(null);
  };

  return (
    <AnimatePresence>
      {refiningItem && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="absolute inset-0 bg-[#03050a]/95 backdrop-blur-md z-40 p-4 flex flex-col text-left overflow-y-auto custom-scrollbar border border-indigo-500/20 rounded-xl font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Refine Sourcing Policy (Rule {refiningItem.ruleNumber})
              </h4>
            </div>
            <button type="button" 
              onClick={() => setRefiningItem(null)} 
              aria-label="Close"
              className="text-gray-400 hover:text-white transition cursor-pointer border-0 bg-transparent"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Warning Details */}
          <div className="space-y-3 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <div className="p-3 bg-black/45 border border-white/5 rounded-lg space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-400 font-mono">Target SKU: <strong className="text-white">{refiningItem.productNumber}</strong></span>
                <span className="text-gray-400 font-mono">Vendor: <strong className="text-indigo-300">{refiningItem.vendor}</strong></span>
              </div>
              <div className="text-[10.5px] text-gray-300 bg-black/60 p-2.5 rounded font-sans leading-relaxed border border-white/5 whitespace-pre-wrap select-all">
                {refiningItem.adviceText}
              </div>
            </div>

            {/* Form Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-gray-400 font-medium mb-1 uppercase text-[9px] font-mono">Sourcing Remedy Type</label>
                <select
                  value={refineRuleType}
                  onChange={(e) => setRefineRuleType(e.target.value as SourcingRule["ruleType"])}
                  className="w-full bg-surface-card border border-white/10 text-white p-2 rounded-lg font-mono focus:border-indigo-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                >
                  <option value="substitution">Obsolete Substitution Mapping</option>
                  <option value="price_cap">Price Contract Cap ($)</option>
                  <option value="symmetry">Structural Geometry Symmetry</option>
                  <option value="api_gateway">Credentials & API Gateway</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1 uppercase text-[9px] font-mono">Severity Level</label>
                <select
                  value={refineSeverity}
                  onChange={(e) => setRefineSeverity(e.target.value as "critical" | "warning" | "info")}
                  className="w-full bg-surface-card border border-white/10 text-white p-2 rounded-lg font-mono focus:border-indigo-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                >
                  <option value="critical">Unbuildable (Critical)</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info Only</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1 uppercase text-[9px] font-mono">Target SKU Code</label>
                <input
                  type="text"
                  value={refineTargetSku}
                  onChange={(e) => setRefineTargetSku(e.target.value)}
                  className="w-full bg-surface-card border border-white/10 text-white p-2 rounded-lg font-mono focus:border-indigo-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1 uppercase text-[9px] font-mono">Blast Radius Policy Scope</label>
                <select
                  value={refineScope}
                  onChange={(e) => setRefineScope(e.target.value)}
                  className="w-full bg-surface-card border border-white/10 text-white p-2 rounded-lg font-mono focus:border-indigo-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                >
                  <option value="Exact SKU Match Only">Exact SKU Match Only</option>
                  <option value="Specific Category Only">Specific Category Only</option>
                  <option value="Global Brand">Global Brand</option>
                </select>
              </div>
            </div>

            {/* Remedy Suggested SKUs & Intricate Options */}
            {remedyOptions.length > 0 ? (
              <div className="p-3 bg-[#070a13] border border-indigo-500/15 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] text-indigo-300 font-bold uppercase tracking-wider font-mono">
                    Intricate Remedy Options (Select Required SKUs)
                  </span>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-gray-500">Combination Rule:</span>
                    <select
                      value={combinationOperator}
                      onChange={(e) => handleOperatorChange(e.target.value as "AND" | "OR")}
                      className="bg-black border border-white/10 text-indigo-400 font-bold px-1.5 py-0.5 rounded cursor-pointer text-[10px]"
                    >
                      <option value="OR">One of (OR / Alternatives)</option>
                      <option value="AND">All of (AND / Requirements)</option>
                    </select>
                  </div>
                </div>
                
                <div className="divide-y divide-white/5 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                  {remedyOptions.map((opt) => (
                    <label 
                      key={opt.sku} 
                      className="flex items-start gap-2.5 py-2 hover:bg-white/2 cursor-pointer transition select-none"
                    >
                      <input
                        type="checkbox"
                        checked={opt.checked}
                        onChange={() => handleToggleRemedyOption(opt.sku)}
                        className="mt-0.5 rounded border-white/10 bg-black text-indigo-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      <div className="min-w-0 flex-1 leading-tight text-[10.5px]">
                        <span className="font-mono font-bold text-white bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded text-[9.5px] mr-1.5 select-all">{opt.sku}</span>
                        <span className="text-gray-400 font-medium">{opt.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ) : suggestedSkus.length > 0 ? (
              <div className="space-y-1.5">
                <label className="block text-gray-400 font-medium uppercase text-[9px] font-mono">Suggested Remedy SKUs (Click to Add)</label>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedSkus.map((sku) => (
                    <button
                      key={sku}
                      type="button"
                      onClick={() => {
                        const current = refineAssociatedSkus.trim();
                        if (current) {
                          if (!current.includes(sku)) {
                            setRefineAssociatedSkus(`${current}, ${sku}`);
                          }
                        } else {
                          setRefineAssociatedSkus(sku);
                        }
                      }}
                      className="px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/20 rounded text-[9.5px] font-mono text-indigo-300 font-bold transition cursor-pointer"
                    >
                      + {sku}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-gray-400 font-medium mb-1 uppercase text-[9px] font-mono">Associated SKUs (Combination)</label>
                <input
                  type="text"
                  value={refineAssociatedSkus}
                  onChange={(e) => setRefineAssociatedSkus(e.target.value)}
                  placeholder="e.g. P47781-B21, P47777-B21"
                  className="w-full bg-surface-card border border-white/10 text-white p-2 rounded-lg font-mono focus:border-indigo-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 placeholder-gray-600"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1 uppercase text-[9px] font-mono">CLI Automation Script Command</label>
                <input
                  type="text"
                  value={refineCliScript}
                  onChange={(e) => setRefineCliScript(e.target.value)}
                  placeholder="e.g. hpe-cli configure --add P47781-B21"
                  className="w-full bg-surface-card border border-white/10 text-white p-2 rounded-lg font-mono focus:border-indigo-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 placeholder-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 font-medium mb-1 uppercase text-[9px] font-mono">Human Remedy Notes / Rationale</label>
              <textarea
                value={refineNotes}
                onChange={(e) => setRefineNotes(e.target.value)}
                placeholder="Explain the remedy rules and lessons learned..."
                className="w-full bg-surface-card border border-white/10 text-white p-2 rounded-lg text-xs focus:border-indigo-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 h-14 resize-none placeholder-gray-600"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 text-xs pt-3 border-t border-white/5 mt-3 shrink-0">
            <button
              type="button"
              onClick={() => setRefiningItem(null)}
              className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition cursor-pointer font-bold border-0 font-mono"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveRefinedRule}
              className="px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition cursor-pointer font-bold flex items-center gap-1.5 border-0 font-mono"
            >
              <Check className="w-3.5 h-3.5" />
              Draft to Vault
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
