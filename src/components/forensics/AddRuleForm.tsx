import React, { useState, useEffect } from "react";
import { Plus, Sparkles, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import type { SourcingRule } from "../../types";

interface AddRuleFormProps {
  onCancel: () => void;
  onSubmit: (rule: SourcingRule) => Promise<void>;
  prefillRule: Partial<SourcingRule> | null;
  triggerToast: (message: string, type: "success" | "warn") => void;
}

export function AddRuleForm({
  onCancel,
  onSubmit,
  prefillRule,
  triggerToast,
}: AddRuleFormProps) {
  const [newRuleType, setNewRuleType] = useState<SourcingRule["ruleType"]>("substitution");
  const [newPartNumber, setNewPartNumber] = useState("");
  const [newMappedOutput, setNewMappedOutput] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newVendor, setNewVendor] = useState("HPE");
  const [newStatus, setNewStatus] = useState<SourcingRule["status"]>("active");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (prefillRule) {
      if (prefillRule.ruleType) setNewRuleType(prefillRule.ruleType);
      if (prefillRule.partNumber) setNewPartNumber(prefillRule.partNumber);
      if (prefillRule.mappedOutput) setNewMappedOutput(prefillRule.mappedOutput);
      if (prefillRule.label) setNewLabel(prefillRule.label);
      if (prefillRule.vendor) setNewVendor(prefillRule.vendor);
      setNewStatus("active");
    }
  }, [prefillRule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartNumber.trim() || !newMappedOutput.trim()) {
      triggerToast("Missing required input fields on Sourcing Policy Form.", "warn");
      return;
    }

    const proposedRule: SourcingRule = {
      id: "rule-" + crypto.randomUUID(),
      ruleType: newRuleType,
      partNumber: newPartNumber.trim(),
      mappedOutput: newMappedOutput.trim(),
      label: newLabel.trim() || (newRuleType.toUpperCase() + " Override Policy"),
      vendor: newVendor,
      status: newStatus,
    };

    setIsSubmitting(true);
    try {
      await onSubmit(proposedRule);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form 
      key="add-rule-form"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit} 
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
            <option value="HPE">HPE (Hewlett Packard Enterprise)</option>
            <option value="Dell">Dell Technologies</option>
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
          onClick={onCancel}
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
  );
}
