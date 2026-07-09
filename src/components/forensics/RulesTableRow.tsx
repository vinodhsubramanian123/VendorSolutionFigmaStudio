import React from "react";
import { Edit3, Trash2, Save, X, Activity, Loader2 } from "lucide-react";
import type { SourcingRule } from "../../types";
import { motion } from "motion/react";

export interface RuleTableRowProps {
  rule: SourcingRule;
  isEditing: boolean;
  editingRuleId: string | null;
  setEditingRuleId: (id: string | null) => void;
  editPartNumber: string;
  setEditPartNumber: (v: string) => void;
  editMappedOutput: string;
  setEditMappedOutput: (v: string) => void;
  editLabel: string;
  setEditLabel: (v: string) => void;
  editVendor: string;
  setEditVendor: (v: string) => void;
  editStatus: SourcingRule["status"];
  setEditStatus: (v: SourcingRule["status"]) => void;
  editAssociatedSkus: string;
  setEditAssociatedSkus: (v: string) => void;
  editCliScript: string;
  setEditCliScript: (v: string) => void;
  editNotes: string;
  setEditNotes: (v: string) => void;
  handleSaveEdit: (ruleId: string) => void;
  handleStartEdit: (rule: SourcingRule) => void;
  handleDeleteRule: (ruleId: string) => void;
  onSimulateAndPromote: (ruleId: string) => Promise<void>;
  simulatingRuleId: string | null;
}

// Wraps both EditingRuleRow and ViewingRuleRow's <motion.tr>, which were
// using byte-for-byte identical layout/animation props and className logic.
function RuleRowShell({ isDraft, children }: { isDraft: boolean; children: React.ReactNode }) {
  return (
    <motion.tr
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`transition-colors ${isDraft ? 'bg-status-warning/5 border-l-2 border-l-amber-500' : 'hover:bg-white/2'}`}
    >
      {children}
    </motion.tr>
  );
}

// The ruleType badge's color scheme was duplicated identically between
// EditingRuleRow and ViewingRuleRow.
function getRuleTypeBadgeClassName(ruleType: SourcingRule["ruleType"]): string {
  if (ruleType === "substitution") return "bg-brand-violet/15 text-purple-300 border border-brand-violet/20";
  if (ruleType === "price_cap") return "bg-status-success/15 text-emerald-300 border border-status-success/20";
  if (ruleType === "symmetry") return "bg-status-warning/15 text-amber-300 border border-status-warning/20";
  return "bg-brand-indigo/15 text-indigo-300 border border-brand-indigo/20";
}

function EditingRuleRow(props: RuleTableRowProps) {
  const { rule, editPartNumber, setEditPartNumber, editMappedOutput, setEditMappedOutput, editLabel, setEditLabel, editVendor, setEditVendor, editStatus, setEditStatus, editAssociatedSkus, setEditAssociatedSkus, editCliScript, setEditCliScript, editNotes, setEditNotes, handleSaveEdit, setEditingRuleId } = props;
  const isDraft = rule.status === "draft";
  return (
    <RuleRowShell isDraft={isDraft}>
      <td className="p-3 font-mono font-bold text-content-primary whitespace-nowrap">
        <input
          type="text"
          value={editPartNumber}
          onChange={(e) => setEditPartNumber(e.target.value)}
          className="bg-surface-canvas/50 border border-white/10 rounded px-2 py-1 font-mono text-content-primary text-xs w-32 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus:border-brand-indigo/40"
        />
      </td>
      <td className="p-3 font-medium whitespace-nowrap">
        <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${getRuleTypeBadgeClassName(rule.ruleType)}`}>

          {rule.ruleType}
        </span>
      </td>
      <td className="p-3 font-mono text-content-primary whitespace-nowrap">
        <input
          type="text"
          value={editMappedOutput}
          onChange={(e) => setEditMappedOutput(e.target.value)}
          className="bg-surface-canvas/50 border border-white/10 rounded px-2 py-1 font-mono text-content-primary text-xs w-32 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus:border-brand-indigo/40"
        />
      </td>
      <td className="p-3 text-content-secondary">
        <div className="space-y-2 max-w-[280px]">
          <div>
            <label htmlFor={`edit-label-${rule.id}`} className="block text-[8px] text-content-primary0 uppercase font-mono mb-0.5">Label Narrative</label>
            <input
              id={`edit-label-${rule.id}`}
              type="text"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              className="bg-surface-canvas/50 border border-white/10 rounded px-2 py-1 text-content-primary text-xs w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus:border-brand-indigo/40"
            />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label htmlFor={`edit-combo-${rule.id}`} className="block text-[8px] text-content-primary0 uppercase font-mono mb-0.5">Combo SKUs</label>
              <input
                id={`edit-combo-${rule.id}`}
                type="text"
                value={editAssociatedSkus}
                onChange={(e) => setEditAssociatedSkus(e.target.value)}
                placeholder="e.g. P47781-B21"
                className="bg-surface-canvas/50 border border-white/10 rounded px-2 py-1 text-content-primary text-[10px] w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus:border-brand-indigo/40 font-mono"
              />
            </div>
            <div>
              <label htmlFor={`edit-cli-${rule.id}`} className="block text-[8px] text-content-primary0 uppercase font-mono mb-0.5">CLI Command</label>
              <input
                id={`edit-cli-${rule.id}`}
                type="text"
                value={editCliScript}
                onChange={(e) => setEditCliScript(e.target.value)}
                placeholder="e.g. hpe-cli..."
                className="bg-surface-canvas/50 border border-white/10 rounded px-2 py-1 text-content-primary text-[10px] w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus:border-brand-indigo/40 font-mono"
              />
            </div>
          </div>
          <div>
            <label htmlFor={`edit-notes-${rule.id}`} className="block text-[8px] text-content-primary0 uppercase font-mono mb-0.5">Human Notes</label>
            <textarea
              id={`edit-notes-${rule.id}`}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Provide additional details..."
              className="bg-surface-canvas/50 border border-white/10 rounded px-2 py-1 text-content-primary text-[10px] w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus:border-brand-indigo/40 h-10 resize-none font-sans"
            />
          </div>
        </div>
      </td>
      <td className="p-3 font-bold text-content-primary">
        <select
          value={editVendor}
          onChange={(e) => setEditVendor(e.target.value)}
          className="bg-surface-canvas/50 border border-white/10 rounded px-2 py-1 text-content-primary text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
        >
          <option value="HPE">HPE</option>
          <option value="Dell">Dell</option>
          <option value="Cisco">Cisco</option>
          <option value="Juniper">Juniper</option>
        </select>
      </td>
      <td className="p-3 whitespace-nowrap">
        {rule.isAutoLearned ? (
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-indigo-300 bg-brand-indigo/10 border border-brand-indigo/20 px-2 py-0.5 rounded font-mono uppercase">
              🧠 Auto-Learned
            </span>
            {rule.learnedAt && (
              <span className="text-[8px] text-content-muted font-mono">{new Date(rule.learnedAt).toLocaleString()}</span>
            )}
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-content-secondary bg-white/5 border border-white/10 px-2 py-0.5 rounded font-mono uppercase">
            ✍️ Manual
          </span>
        )}
      </td>
      <td className="p-3 whitespace-nowrap">
        <select
          value={editStatus}
          onChange={(e) => setEditStatus(e.target.value as SourcingRule["status"])}
          className="bg-surface-canvas/50 border border-white/10 rounded px-2 py-1 text-content-primary text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
        >
          <option value="active">Active</option>
          <option value="draft">Draft</option>
        </select>
      </td>
      <td className="p-3 text-center whitespace-nowrap">
        <div className="flex items-center justify-center gap-1.5">
          <button type="button" onClick={() => handleSaveEdit(rule.id)} className="p-1 px-2 rounded bg-status-success/10 border border-status-success/30 text-status-success hover:bg-status-success/20 transition cursor-pointer text-[10px] font-bold flex items-center gap-1">
            <Save className="w-3.5 h-3.5" /> Save
          </button>
          <button type="button" onClick={() => setEditingRuleId(null)} className="p-1 px-2 rounded bg-white/5 border border-white/10 text-content-secondary hover:bg-white/10 transition cursor-pointer text-[10px] font-bold flex items-center gap-1">
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
        </div>
      </td>
    </RuleRowShell>
  );
}

function ViewingRuleRow(props: RuleTableRowProps) {
  const { rule, handleStartEdit, handleDeleteRule, onSimulateAndPromote, simulatingRuleId } = props;
  const isDraft = rule.status === "draft";
  return (
    <RuleRowShell isDraft={isDraft}>
      <td className="p-3 font-mono font-bold text-content-primary whitespace-nowrap">{rule.partNumber}</td>
      <td className="p-3 font-medium whitespace-nowrap">
        <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${getRuleTypeBadgeClassName(rule.ruleType)}`}>
          {rule.ruleType}
        </span>
      </td>
      <td className="p-3 font-mono text-content-primary whitespace-nowrap">
        <span className="font-bold text-indigo-300">
          {rule.ruleType === "price_cap" && !isNaN(Number(rule.mappedOutput)) ? `$${Number(rule.mappedOutput).toLocaleString()}` : rule.mappedOutput}
        </span>
      </td>
      <td className="p-3 text-content-secondary">
        <ViewingRuleRowDetails rule={rule} />
      </td>
      <td className="p-3 font-bold text-content-primary">{rule.vendor}</td>
      <td className="p-3 whitespace-nowrap">
        {rule.isAutoLearned ? (
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-indigo-300 bg-brand-indigo/10 border border-brand-indigo/20 px-2 py-0.5 rounded font-mono uppercase">
              🧠 Auto-Learned
            </span>
            {rule.learnedAt && (
              <span className="text-[8px] text-content-muted font-mono">{new Date(rule.learnedAt).toLocaleString()}</span>
            )}
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-content-secondary bg-white/5 border border-white/10 px-2 py-0.5 rounded font-mono uppercase">
            ✍️ Manual
          </span>
        )}
      </td>
      <td className="p-3 whitespace-nowrap">
        <span className={`inline-flex items-center gap-1.5 font-bold uppercase text-[9.5px] ${rule.status === "active" ? "text-status-success" : "text-content-primary0 animate-pulse"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${rule.status === "active" ? "bg-status-success" : "bg-gray-500"}`} />
          {rule.status}
        </span>
      </td>
      <td className="p-3 text-center whitespace-nowrap">
        <div className="flex items-center justify-center gap-1.5">
          {rule.status === "draft" && (
            <button type="button" onClick={() => onSimulateAndPromote(rule.id)} disabled={simulatingRuleId === rule.id} className="p-1.5 px-2 rounded bg-status-warning/10 border border-status-warning/20 text-status-warning hover:bg-status-warning/20 transition cursor-pointer text-[10px] font-bold flex items-center gap-1 disabled:opacity-50">
              {simulatingRuleId === rule.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />} Simulate & Promote
            </button>
          )}
          <button type="button" onClick={() => handleStartEdit(rule)} className="p-1 px-2 rounded bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigo hover:bg-brand-indigo/20 transition cursor-pointer text-[11px] font-medium flex items-center gap-0.5">
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
          <button type="button" onClick={() => handleDeleteRule(rule.id)} className="p-1.5 rounded bg-status-error/10 border border-status-error/20 text-status-error hover:bg-status-error/20 transition cursor-pointer text-[11px] font-medium">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </RuleRowShell>
  );
}

export function RuleTableRow(props: RuleTableRowProps) {
  if (props.isEditing) {
    return <EditingRuleRow {...props} />;
  }
  return <ViewingRuleRow {...props} />;
}

function ViewingRuleRowDetails({ rule }: { rule: SourcingRule }) {
  return (
    <div className="space-y-1">
      <div className="text-content-secondary font-medium">{rule.label}</div>
      {(rule.associatedSkus || rule.cliScript || rule.notes) && (
        <div className="mt-1.5 p-2 rounded bg-surface-canvas/30 border border-white/5 space-y-1.5 text-[10px] max-w-[280px]">
          {rule.associatedSkus && (
            <div className="flex flex-col gap-0.5">
              <span className="text-content-primary0 font-mono text-[9px] uppercase">Combo/Accessory SKUs:</span>
              <span className="text-indigo-300 font-mono font-bold break-all bg-brand-indigo/10 px-1.5 py-0.5 rounded border border-brand-indigo/20 w-fit">{rule.associatedSkus}</span>
            </div>
          )}
          {rule.cliScript && (
            <div className="flex flex-col gap-0.5">
              <span className="text-content-primary0 font-mono text-[9px] uppercase">CLI Automation Command:</span>
              <code className="bg-surface-canvas/45 text-status-warning px-1.5 py-0.5 rounded border border-white/5 font-mono select-all break-all">{rule.cliScript}</code>
            </div>
          )}
          {rule.notes && (
            <div className="flex flex-col gap-0.5">
              <span className="text-content-primary0 font-mono text-[9px] uppercase">Remedy Notes:</span>
              <span className="text-content-secondary italic bg-white/2 px-1.5 py-0.5 rounded border border-white/5 leading-relaxed">{rule.notes}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
