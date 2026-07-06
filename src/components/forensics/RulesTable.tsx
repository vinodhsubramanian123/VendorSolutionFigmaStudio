import React, { useState } from "react";
import type { SourcingRule } from "../../types";
import { AnimatePresence } from "motion/react";
import { useCoreStore } from "../../store/coreStore";

import { RuleTableRow } from "./RulesTableRow";

export interface RulesTableProps {
  triggerToast: (message: string, type: "success" | "warn") => void;
  onSimulateAndPromote: (ruleId: string) => Promise<void>;
  simulatingRuleId: string | null;
}

export function RulesTable({
  triggerToast,
  onSimulateAndPromote,
  simulatingRuleId,
}: RulesTableProps) {
  const sourcingRules = useCoreStore(s => s.sourcingRules);
  const setSourcingRules = useCoreStore(s => s.setSourcingRules);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editPartNumber, setEditPartNumber] = useState("");
  const [editMappedOutput, setEditMappedOutput] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [editVendor, setEditVendor] = useState("");
  const [editStatus, setEditStatus] = useState<SourcingRule["status"]>("active");
  const [editAssociatedSkus, setEditAssociatedSkus] = useState("");
  const [editCliScript, setEditCliScript] = useState("");
  const [editNotes, setEditNotes] = useState("");

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

  return (
    <div className="overflow-x-auto rounded-lg border border-white/5 bg-surface-canvas/15">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-surface-canvas/40 border-b border-white/5 text-content-secondary font-semibold font-mono text-[10px] uppercase select-none tracking-wider">
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
          <AnimatePresence mode="popLayout">
            {sourcingRules.map((rule) => (
              <RuleTableRow
                key={rule.id}
                rule={rule}
                isEditing={editingRuleId === rule.id}
                editingRuleId={editingRuleId}
                setEditingRuleId={setEditingRuleId}
                editPartNumber={editPartNumber}
                setEditPartNumber={setEditPartNumber}
                editMappedOutput={editMappedOutput}
                setEditMappedOutput={setEditMappedOutput}
                editLabel={editLabel}
                setEditLabel={setEditLabel}
                editVendor={editVendor}
                setEditVendor={setEditVendor}
                editStatus={editStatus}
                setEditStatus={setEditStatus}
                editAssociatedSkus={editAssociatedSkus}
                setEditAssociatedSkus={setEditAssociatedSkus}
                editCliScript={editCliScript}
                setEditCliScript={setEditCliScript}
                editNotes={editNotes}
                setEditNotes={setEditNotes}
                handleSaveEdit={handleSaveEdit}
                handleStartEdit={handleStartEdit}
                handleDeleteRule={handleDeleteRule}
                onSimulateAndPromote={onSimulateAndPromote}
                simulatingRuleId={simulatingRuleId}
              />
            ))}
          </AnimatePresence>
          {sourcingRules.length === 0 && (
            <tr>
              <td colSpan={8} className="p-8 text-center text-[11px] text-content-primary0 font-mono">
                <div className="flex flex-col items-center justify-center gap-2">
                  <span className="text-xl">📭</span>
                  <p>No custom sourcing rules configured yet.</p>
                  <p className="text-[9px] opacity-70">Add a new directive to override defaults.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
