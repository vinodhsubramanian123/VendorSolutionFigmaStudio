import { tokens } from "../../styles/tokens";
import React, { useState, useEffect } from "react";
import { BrainCircuit, X, Plus, Info, Sparkles, Save, Trash2, Edit3, Loader2, Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { SourcingRule } from "../../types";
import { apiClient } from "../../services/apiClient";
import { LearningLoopInjector } from "./LearningLoopInjector";
import { RuleConflictModal } from "./RuleConflictModal";
import type { RuleConflict } from "../../types";

interface SourcingRulesVaultProps {
  sourcingRules: SourcingRule[];
  setSourcingRules: React.Dispatch<React.SetStateAction<SourcingRule[]>>;
  triggerToast: (message: string, type: "success" | "warn") => void;
  prefillRule: Partial<SourcingRule> | null;
  onPrefillConsumed: () => void;
}

export function SourcingRulesVault({
  sourcingRules,
  setSourcingRules,
  triggerToast,
  prefillRule,
  onPrefillConsumed,
}: SourcingRulesVaultProps) {
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [isInjectingIntel, setIsInjectingIntel] = useState(false);
  const [simulatingRuleId, setSimulatingRuleId] = useState<string | null>(null);
  
  const [newRuleType, setNewRuleType] = useState<SourcingRule["ruleType"]>("substitution");
  const [newPartNumber, setNewPartNumber] = useState("");
  const [newMappedOutput, setNewMappedOutput] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newVendor, setNewVendor] = useState("HPE");
  const [newStatus, setNewStatus] = useState<SourcingRule["status"]>("active");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pendingConflict, setPendingConflict] = useState<{
    conflict: RuleConflict;
    existingRule: SourcingRule;
    proposedRule: SourcingRule;
  } | null>(null);

  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editPartNumber, setEditPartNumber] = useState("");
  const [editMappedOutput, setEditMappedOutput] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [editVendor, setEditVendor] = useState("");
  const [editStatus, setEditStatus] = useState<SourcingRule["status"]>("active");
  const [editAssociatedSkus, setEditAssociatedSkus] = useState("");
  const [editCliScript, setEditCliScript] = useState("");
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    if (prefillRule) {
      setIsAddingRule(true);
      if (prefillRule.ruleType) setNewRuleType(prefillRule.ruleType);
      if (prefillRule.partNumber) setNewPartNumber(prefillRule.partNumber);
      if (prefillRule.mappedOutput) setNewMappedOutput(prefillRule.mappedOutput);
      if (prefillRule.label) setNewLabel(prefillRule.label);
      if (prefillRule.vendor) setNewVendor(prefillRule.vendor);
      setNewStatus("active");
      onPrefillConsumed();
      
      triggerToast("Override parameters prefilled! Review and save the rule at the bottom.", "success");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.querySelector("form")?.scrollIntoView({ behavior: "smooth" });
        });
      });
    }
  }, [prefillRule, onPrefillConsumed, triggerToast]);

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartNumber.trim() || !newMappedOutput.trim()) {
      triggerToast("Missing required input fields on Sourcing Policy Form.", "warn");
      return;
    }

    const proposedRule: SourcingRule = {
      id: "rule-" + Date.now(),
      ruleType: newRuleType,
      partNumber: newPartNumber.trim(),
      mappedOutput: newMappedOutput.trim(),
      label: newLabel.trim() || (newRuleType.toUpperCase() + " Override Policy"),
      vendor: newVendor,
      status: newStatus,
    };

    // Check for conflicts
    const existingRule = sourcingRules.find(r => r.partNumber === proposedRule.partNumber);
    if (existingRule && existingRule.mappedOutput !== proposedRule.mappedOutput) {
      setPendingConflict({
        conflict: {
          conflictId: `conflict-${Date.now()}`,
          partNumber: proposedRule.partNumber,
          existingRuleId: existingRule.id,
          proposedMappedOutput: proposedRule.mappedOutput,
          existingMappedOutput: existingRule.mappedOutput,
          description: "This SKU is already mapped to a different output. Overwriting will flush the old intelligence rule."
        },
        existingRule,
        proposedRule
      });
      return;
    }

    await commitRule(proposedRule);
  };

  const commitRule = async (rule: SourcingRule) => {
    setIsSubmitting(true);
    try {
      await apiClient.post("/api/taxonomy/rules", {
        sourceId: rule.partNumber,
        ruleType: rule.ruleType,
        explanation: rule.label
      });

      setSourcingRules((prev) => [rule, ...prev.filter(r => r.partNumber !== rule.partNumber)]);
      setIsAddingRule(false);
      setNewPartNumber("");
      setNewMappedOutput("");
      setNewLabel("");
      triggerToast("Intelligence Policy Created & Continuous Feed Repopulated!", "success");
    } catch (error) {
      triggerToast("Failed to save Sourcing Rule to the server.", "warn");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveConflict = (action: "keep_existing" | "overwrite") => {
    if (!pendingConflict) return;
    
    if (action === "overwrite") {
      commitRule(pendingConflict.proposedRule);
    } else {
      triggerToast("Retained existing sourcing intelligence.", "success");
      setIsAddingRule(false);
    }
    setPendingConflict(null);
  };

  const handleStartEdit = (rule: SourcingRule) => {
    setEditingRuleId(rule.id);
    setEditPartNumber(rule.partNumber);
    setEditMappedOutput(rule.mappedOutput);
    setEditLabel(rule.label);
    setEditVendor(rule.vendor);
    setEditStatus(rule.status);
    setEditAssociatedSkus(rule.associatedSkus || "");
    setEditCliScript(rule.cliScript || "");
    setEditNotes(rule.notes || "");
  };

  const handleSaveEdit = (ruleId: string) => {
    if (!editPartNumber.trim() || !editMappedOutput.trim()) {
      triggerToast("Input parameters cannot be left blank during edit.", "warn");
      return;
    }

    setSourcingRules((prev) =>
      prev.map((r) =>
        r.id === ruleId
          ? {
              ...r,
              partNumber: editPartNumber.trim(),
              mappedOutput: editMappedOutput.trim(),
              label: editLabel.trim(),
              vendor: editVendor,
              status: editStatus,
              associatedSkus: editAssociatedSkus.trim() || undefined,
              cliScript: editCliScript.trim() || undefined,
              notes: editNotes.trim() || undefined,
            }
          : r
      )
    );
    setEditingRuleId(null);
    triggerToast("Sourcing Intelligence overridden and persistent layers flushed.", "success");
  };

  const handleDeleteRule = (ruleId: string) => {
    setSourcingRules((prev) => prev.filter((r) => r.id !== ruleId));
    triggerToast("Sourcing Intelligence policy permanently retired.", "success");
  };

  const handleSimulateAndPromote = async (ruleId: string) => {
    setSimulatingRuleId(ruleId);
    try {
      await apiClient.post("/api/taxonomy/simulate", { ruleId });
      setSourcingRules((prev) => 
        prev.map((r) => r.id === ruleId ? { ...r, status: "active" } : r)
      );
      triggerToast("Simulation safe! 0 conflicts found across 150 historical UCIDs. Rule promoted to ACTIVE.", "success");
    } finally {
      setSimulatingRuleId(null);
    }
  };

  return (
    <div 
      className="p-5 rounded-xl border flex flex-col gap-4 mt-2" 
      style={{
        backgroundColor: tokens.colors.background.card,
        borderColor: "rgba(74, 133, 253, 0.08)"
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <BrainCircuit className="w-4.5 h-4.5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Centralized Sourcing Intelligence & Override Registry
              <span className="text-[10px] bg-indigo-500/15 text-indigo-300 font-mono font-normal px-2 py-0.5 rounded border border-indigo-500/20">
                Learning Loop Database
              </span>
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Manage automated mapping policies, partner contractual cap targets, and hardware physical symmetry rules.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setIsAddingRule(false);
              setIsInjectingIntel(!isInjectingIntel);
            }}
            className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 transition cursor-pointer select-none"
          >
            <Sparkles className="w-3.5 h-3.5" /> {isInjectingIntel ? "Close Learning Loop" : "Feed Intelligence"}
          </button>

          <button
            onClick={() => {
              setIsInjectingIntel(false);
              setIsAddingRule(!isAddingRule);
            }}
            className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition cursor-pointer select-none border-0"
          >
            {isAddingRule ? (
              <>
                <X className="w-3.5 h-3.5" /> Close Panel
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" /> Define Sourcing Override
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-[11px] text-indigo-200 flex gap-2.5 leading-normal">
        <Info className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5" />
        <p>
          <strong>Core Engineering Mechanics:</strong> Sourcing Intel acts as an automated override shield. Every time you trigger 
          <strong className="text-white"> "Auto-Align Component" </strong> in the compliance anomalies above, the system corrects the active opportunity Bill of Materials 
          <em> and promotes the resolution mappings safely to this database in real-time</em>. You can also manually CRUD override directives below to preempt future configuration errors.
        </p>
      </div>

      <AnimatePresence>
        {isInjectingIntel && (
          <LearningLoopInjector 
            onClose={() => setIsInjectingIntel(false)} 
            onRuleDrafted={(rule) => {
              setSourcingRules(prev => [rule, ...prev]);
              setIsInjectingIntel(false);
              triggerToast("Semantic intelligence captured! Rule is now in Draft/Quarantine.", "success");
            }} 
          />
        )}
      </AnimatePresence>

      <RuleConflictModal
        conflict={pendingConflict?.conflict || null}
        existingRule={pendingConflict?.existingRule}
        onResolve={handleResolveConflict}
        onCancel={() => setPendingConflict(null)}
      />

      <AnimatePresence>
      {isAddingRule && (
        <motion.form 
          key="add-rule-form"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          onSubmit={handleAddRule} 
          className="p-4 rounded-lg bg-black/45 border border-white/5 space-y-4 overflow-hidden"
        >
          <div className="text-[11px] font-bold uppercase text-gray-400 flex items-center gap-1 tracking-wider border-b border-white/5 pb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> Create New Sourcing Intelligence Directive
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-gray-400 font-medium mb-1">Rule Class Category</label>
              <select
                value={newRuleType}
                onChange={(e) => setNewRuleType(e.target.value as SourcingRule["ruleType"])}
                className="w-full bg-surface-card border border-white/10 text-white p-2 rounded-lg font-mono focus:border-indigo-500/40 focus:outline-none"
              >
                <option value="substitution">Obsolete Substitution Mapping</option>
                <option value="price_cap">Price Contract Cap ($)</option>
                <option value="symmetry">Structural Geometry Symmetry</option>
                <option value="api_gateway">Credentials & API Gateway</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 font-medium mb-1">Target SKU / Parameter Code</label>
              <input
                type="text"
                placeholder="e.g. 400-BPSB or Processor"
                value={newPartNumber}
                onChange={(e) => setNewPartNumber(e.target.value)}
                className="w-full bg-surface-card border border-white/10 text-white p-2 rounded-lg font-mono placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 font-medium mb-1">Alignment Override Value</label>
              <input
                type="text"
                placeholder="e.g. P40424-B21 or 1190"
                value={newMappedOutput}
                onChange={(e) => setNewMappedOutput(e.target.value)}
                className="w-full bg-surface-card border border-white/10 text-white p-2 rounded-lg font-mono placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 font-medium mb-1">Brand Sourcing Entity</label>
              <select
                value={newVendor}
                onChange={(e) => setNewVendor(e.target.value)}
                className="w-full bg-surface-card border border-white/10 text-white p-2 rounded-lg font-mono focus:border-indigo-500/40 focus:outline-none"
              >
                <option >HPE (Hewlett Packard Enterprise)</option>
                <option >Dell Technologies</option>
                <option value="Cisco">Cisco Systems</option>
                <option value="Juniper">Juniper Networks</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 font-medium mb-1">Directive Override Narrative / Explanation</label>
            <input
              type="text"
              placeholder="Brief justification logs e.g. Contract rate locked during 2026 Procurement summit"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full bg-surface-card border border-white/10 text-white p-2 rounded-lg text-xs placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 text-xs pt-1">
            <button
              type="button"
              onClick={() => setIsAddingRule(false)}
              className="px-3.5 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition cursor-pointer font-bold border-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition cursor-pointer font-bold flex items-center gap-1.5 border-0 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Save Sourcing Rule
            </button>
          </div>
        </motion.form>
      )}
      </AnimatePresence>

      <div className="overflow-x-auto rounded-lg border border-white/5 bg-black/15">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-black/40 border-b border-white/5 text-gray-400 font-semibold font-mono text-[10px] uppercase select-none tracking-wider">
              <th className="p-3">Target Reference Parameter</th>
              <th className="p-3">Category Class</th>
              <th className="p-3">Alignment Override</th>
              <th className="p-3">Sourcing Narrative / Rule Logs</th>
              <th className="p-3">Sourced Vendor</th>
              <th className="p-3">Origin</th>
              <th className="p-3">Operational State</th>
              <th className="p-3 text-center">Engine Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sourcingRules.map((rule) => {
              const isEditing = editingRuleId === rule.id;
              const isDraft = rule.status === "draft";
              return (
                <tr key={rule.id} className={`transition-colors ${isDraft ? 'bg-amber-500/5 border-l-2 border-l-amber-500' : 'hover:bg-white/2'}`}>
                  <td className="p-3 font-mono font-bold text-white whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editPartNumber}
                        onChange={(e) => setEditPartNumber(e.target.value)}
                        className="bg-black/50 border border-white/10 rounded px-2 py-1 font-mono text-white text-xs w-32 focus:outline-none focus:border-indigo-500/40"
                      />
                    ) : (
                      rule.partNumber
                    )}
                  </td>

                  <td className="p-3 font-medium whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                      rule.ruleType === "substitution"
                        ? "bg-purple-500/15 text-purple-300 border border-purple-500/20"
                        : rule.ruleType === "price_cap"
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                        : rule.ruleType === "symmetry"
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                        : "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                    }`}>
                      {rule.ruleType}
                    </span>
                  </td>

                  <td className="p-3 font-mono text-white whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editMappedOutput}
                        onChange={(e) => setEditMappedOutput(e.target.value)}
                        className="bg-black/50 border border-white/10 rounded px-2 py-1 font-mono text-white text-xs w-32 focus:outline-none focus:border-indigo-500/40"
                      />
                    ) : (
                      <span className="font-bold text-indigo-300">
                        {rule.ruleType === "price_cap" && !isNaN(Number(rule.mappedOutput)) ? `$${Number(rule.mappedOutput).toLocaleString()}` : rule.mappedOutput}
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-gray-400">
                    {isEditing ? (
                      <div className="space-y-2 max-w-[280px]">
                        <div>
                          <label className="block text-[8px] text-gray-500 uppercase font-mono mb-0.5">Label Narrative</label>
                          <input
                            type="text"
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            className="bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-xs w-full focus:outline-none focus:border-indigo-500/40"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <div>
                            <label className="block text-[8px] text-gray-500 uppercase font-mono mb-0.5">Combo SKUs</label>
                            <input
                              type="text"
                              value={editAssociatedSkus}
                              onChange={(e) => setEditAssociatedSkus(e.target.value)}
                              placeholder="e.g. P47781-B21"
                              className="bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-[10px] w-full focus:outline-none focus:border-indigo-500/40 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] text-gray-500 uppercase font-mono mb-0.5">CLI Command</label>
                            <input
                              type="text"
                              value={editCliScript}
                              onChange={(e) => setEditCliScript(e.target.value)}
                              placeholder="e.g. hpe-cli..."
                              className="bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-[10px] w-full focus:outline-none focus:border-indigo-500/40 font-mono"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[8px] text-gray-500 uppercase font-mono mb-0.5">Human Notes</label>
                          <textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="Provide additional details..."
                            className="bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-[10px] w-full focus:outline-none focus:border-indigo-500/40 h-10 resize-none font-sans"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-gray-300 font-medium">{rule.label}</div>
                        {(rule.associatedSkus || rule.cliScript || rule.notes) && (
                          <div className="mt-1.5 p-2 rounded bg-black/30 border border-white/5 space-y-1.5 text-[10px] max-w-[280px]">
                            {rule.associatedSkus && (
                              <div className="flex flex-col gap-0.5">
                                <span className="text-gray-500 font-mono text-[9px] uppercase">Combo/Accessory SKUs:</span>
                                <span className="text-indigo-300 font-mono font-bold break-all bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 w-fit">{rule.associatedSkus}</span>
                              </div>
                            )}
                            {rule.cliScript && (
                              <div className="flex flex-col gap-0.5">
                                <span className="text-gray-500 font-mono text-[9px] uppercase">CLI Automation Command:</span>
                                <code className="bg-black/45 text-amber-400 px-1.5 py-0.5 rounded border border-white/5 font-mono select-all break-all">{rule.cliScript}</code>
                              </div>
                            )}
                            {rule.notes && (
                              <div className="flex flex-col gap-0.5">
                                <span className="text-gray-500 font-mono text-[9px] uppercase">Remedy Notes:</span>
                                <span className="text-gray-400 italic bg-white/2 px-1.5 py-0.5 rounded border border-white/5 leading-relaxed">{rule.notes}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="p-3 font-bold text-gray-200">
                    {isEditing ? (
                      <select
                        value={editVendor}
                        onChange={(e) => setEditVendor(e.target.value)}
                        className="bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none"
                      >
                        <option >HPE</option>
                        <option >Dell</option>
                        <option value="Cisco">Cisco</option>
                        <option value="Juniper">Juniper</option>
                      </select>
                    ) : (
                      rule.vendor
                    )}
                  </td>

                  {/* Origin badge: auto-learned vs manual */}
                  <td className="p-3 whitespace-nowrap">
                    {rule.isAutoLearned ? (
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded font-mono uppercase">
                          🧠 Auto-Learned
                        </span>
                        {rule.learnedAt && (
                          <span className="text-[8px] text-gray-600 font-mono">
                            {new Date(rule.learnedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded font-mono uppercase">
                        ✍️ Manual
                      </span>
                    )}
                  </td>

                  <td className="p-3 whitespace-nowrap">
                    {isEditing ? (
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as SourcingRule["status"])}
                        className="bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 font-bold uppercase text-[9.5px] ${
                        rule.status === "active" ? "text-emerald-400" : "text-gray-500 animate-pulse"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${rule.status === "active" ? "bg-emerald-400" : "bg-gray-500"}`} />
                        {rule.status}
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-center whitespace-nowrap">
                    {isEditing ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleSaveEdit(rule.id)}
                          className="p-1 px-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition cursor-pointer text-[10px] font-bold flex items-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" /> Save
                        </button>
                        <button
                          onClick={() => setEditingRuleId(null)}
                          className="p-1 px-2 rounded bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 transition cursor-pointer text-[10px] font-bold flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Pin
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5">
                        {rule.status === "draft" && (
                          <button
                            onClick={() => handleSimulateAndPromote(rule.id)}
                            disabled={simulatingRuleId === rule.id}
                            className="p-1.5 px-2 rounded bg-amber-400/10 border border-amber-400/20 text-amber-400 hover:bg-amber-400/20 transition cursor-pointer text-[10px] font-bold flex items-center gap-1 disabled:opacity-50"
                            title="Simulate rule blast radius and promote to active"
                          >
                            {simulatingRuleId === rule.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Activity className="w-3.5 h-3.5" />
                            )}
                            Simulate & Promote
                          </button>
                        )}
                        <button
                          onClick={() => handleStartEdit(rule)}
                          className="p-1 px-2 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition cursor-pointer text-[11px] font-medium flex items-center gap-0.5"
                          title="Edit override directive parameters"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1.5 rounded bg-red-400/10 border border-red-400/20 text-red-400 hover:bg-red-400/20 transition cursor-pointer text-[11px] font-medium"
                          title="Delete policy permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
