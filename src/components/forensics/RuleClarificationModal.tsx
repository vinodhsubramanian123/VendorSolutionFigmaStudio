import React, { useState } from "react";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { Target, Check } from "lucide-react";

interface RuleClarificationModalProps {
  proposedVendor: string;
  proposedPart: string;
  onConfirm: (scope: "Global" | "Brand" | "Exact") => void;
  onCancel: () => void;
}

export function RuleClarificationModal({
  proposedVendor,
  proposedPart,
  onConfirm,
  onCancel,
}: RuleClarificationModalProps) {
  const [scope, setScope] = useState<"Global" | "Brand" | "Exact">("Exact");

  useEscapeKey(onCancel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-canvas/60 backdrop-blur-sm p-4">
      <div className="bg-surface-elevated border border-brand-indigo/30 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-brand-indigo/5">
          <div className="w-8 h-8 rounded-full bg-brand-indigo/20 flex items-center justify-center shrink-0">
            <Target className="w-4 h-4 text-brand-indigo" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-content-primary uppercase tracking-wide">Define Sourcing Rule Scope</h3>
            <p className="text-[10px] text-content-secondary">Strict Scoping Fallback required before locking rule.</p>
          </div>
        </div>
        
        <div className="p-5 space-y-4">
          <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-xs text-content-secondary font-mono">
            <strong>Target Part:</strong> {proposedPart} <br />
            <strong>Target Vendor:</strong> {proposedVendor}
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-bold text-content-primary0 uppercase">Apply this intelligence to:</div>
            <div className="space-y-2">
              <label htmlFor="scope-global" aria-label="Global Portfolio - Apply across all vendors and models globally (High Blast Radius)" className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition ${scope === "Global" ? "bg-brand-indigo/10 border-brand-indigo/50" : "bg-surface-canvas/20 border-white/5 hover:bg-white/5"}`}>
                <input id="scope-global" type="radio" checked={scope === "Global"} onChange={() => setScope("Global")} className="mt-1" />
                <div>
                  <div className="text-xs font-bold text-content-primary">Global Portfolio</div>
                  <div className="text-[10px] text-content-secondary">Apply across all vendors and models globally. (High Blast Radius)</div>
                </div>
              </label>
              
              <label htmlFor="scope-brand" aria-label={`Specific Brand (${proposedVendor}) - Restrict logic to only ${proposedVendor} BOM submissions`} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition ${scope === "Brand" ? "bg-brand-indigo/10 border-brand-indigo/50" : "bg-surface-canvas/20 border-white/5 hover:bg-white/5"}`}>
                <input id="scope-brand" type="radio" checked={scope === "Brand"} onChange={() => setScope("Brand")} className="mt-1" />
                <div>
                  <div className="text-xs font-bold text-content-primary">Specific Brand ({proposedVendor})</div>
                  <div className="text-[10px] text-content-secondary">Restrict logic to only {proposedVendor} BOM submissions.</div>
                </div>
              </label>

              <label htmlFor="scope-exact" aria-label="Exact SKU Match Only - Safest, limit substitution to exactly this part number" className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition ${scope === "Exact" ? "bg-brand-indigo/10 border-brand-indigo/50" : "bg-surface-canvas/20 border-white/5 hover:bg-white/5"}`}>
                <input id="scope-exact" type="radio" checked={scope === "Exact"} onChange={() => setScope("Exact")} className="mt-1" />
                <div>
                  <div className="text-xs font-bold text-content-primary">Exact SKU Match Only</div>
                  <div className="text-[10px] text-content-secondary">Safest. Limit substitution to exactly this part number.</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/5 bg-surface-canvas/40 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-xs font-bold text-content-secondary hover:text-content-primary transition">
            Cancel
          </button>
          <button
            data-testid="btn-lock-intelligence-rule"
            type="button"
            onClick={() => onConfirm(scope)}
            className="flex items-center gap-2 px-6 py-2 bg-brand-indigo hover:bg-brand-indigo text-content-primary rounded-lg font-bold shadow-lg cursor-pointer transition-colors text-xs"
          >
            <Check className="w-4 h-4" />
            Lock Intelligence Rule
          </button>
        </div>
      </div>
    </div>
  );
}
