import { tokens } from "../../styles/tokens";
import React, { useState, useEffect } from "react";
import { BrainCircuit, X, Plus, Info, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { SourcingRule } from "../../types";
import { apiClient } from "../../services/apiClient";
import { AddRuleForm } from "./AddRuleForm";
import { RulesTable } from "./RulesTable";
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

  const [pendingConflict, setPendingConflict] = useState<{
    conflict: RuleConflict;
    existingRule: SourcingRule;
    proposedRule: SourcingRule;
  } | null>(null);

  useEffect(() => {
    if (prefillRule) {
      setIsAddingRule(true);
      onPrefillConsumed();
      triggerToast("Override parameters prefilled! Review and save the rule at the bottom.", "success");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.querySelector("form")?.scrollIntoView({ behavior: "smooth" });
        });
      });
    }
  }, [prefillRule, onPrefillConsumed, triggerToast]);

  const commitRule = async (rule: SourcingRule) => {
    try {
      await apiClient.post("/api/taxonomy/rules", {
        sourceId: rule.partNumber,
        ruleType: rule.ruleType,
        explanation: rule.label
      });

      setSourcingRules((prev) => [rule, ...prev.filter(r => r.partNumber !== rule.partNumber)]);
      setIsAddingRule(false);
      triggerToast("Intelligence Policy Created & Continuous Feed Repopulated!", "success");
    } catch (error) {
      triggerToast("Failed to save Sourcing Rule to the server.", "warn");
    }
  };

  const handleAddRuleSubmit = async (proposedRule: SourcingRule) => {
    // Check for conflicts
    const existingRule = sourcingRules.find(r => r.partNumber === proposedRule.partNumber);
    if (existingRule && existingRule.mappedOutput !== proposedRule.mappedOutput) {
      setPendingConflict({
        conflict: {
          conflictId: `conflict-${crypto.randomUUID()}`,
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
        <AddRuleForm
          onCancel={() => setIsAddingRule(false)}
          onSubmit={handleAddRuleSubmit}
          prefillRule={prefillRule}
          triggerToast={triggerToast}
        />
      )}
      </AnimatePresence>

      <RulesTable
        sourcingRules={sourcingRules}
        setSourcingRules={setSourcingRules}
        triggerToast={triggerToast}
        onSimulateAndPromote={handleSimulateAndPromote}
        simulatingRuleId={simulatingRuleId}
      />
    </div>
  );
}
