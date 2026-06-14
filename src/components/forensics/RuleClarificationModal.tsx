import React, { useState } from "react";
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface-elevated border border-indigo-500/30 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-indigo-500/5">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Define Sourcing Rule Scope</h3>
            <p className="text-[10px] text-gray-400">Strict Scoping Fallback required before locking rule.</p>
          </div>
        </div>
        
        <div className="p-5 space-y-4">
          <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 font-mono">
            <strong>Target Part:</strong> {proposedPart} <br />
            <strong>Target Vendor:</strong> {proposedVendor}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Apply this intelligence to:</label>
            <div className="space-y-2">
              <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition ${scope === "Global" ? "bg-indigo-500/10 border-indigo-500/50" : "bg-black/20 border-white/5 hover:bg-white/5"}`}>
                <input type="radio" checked={scope === "Global"} onChange={() => setScope("Global")} className="mt-1" />
                <div>
                  <div className="text-xs font-bold text-white">Global Portfolio</div>
                  <div className="text-[10px] text-gray-400">Apply across all vendors and models globally. (High Blast Radius)</div>
                </div>
              </label>
              
              <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition ${scope === "Brand" ? "bg-indigo-500/10 border-indigo-500/50" : "bg-black/20 border-white/5 hover:bg-white/5"}`}>
                <input type="radio" checked={scope === "Brand"} onChange={() => setScope("Brand")} className="mt-1" />
                <div>
                  <div className="text-xs font-bold text-white">Specific Brand ({proposedVendor})</div>
                  <div className="text-[10px] text-gray-400">Restrict logic to only {proposedVendor} BOM submissions.</div>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition ${scope === "Exact" ? "bg-indigo-500/10 border-indigo-500/50" : "bg-black/20 border-white/5 hover:bg-white/5"}`}>
                <input type="radio" checked={scope === "Exact"} onChange={() => setScope("Exact")} className="mt-1" />
                <div>
                  <div className="text-xs font-bold text-white">Exact SKU Match Only</div>
                  <div className="text-[10px] text-gray-400">Safest. Limit substitution to exactly this part number.</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/5 bg-black/40 flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white transition">
            Cancel
          </button>
          <button onClick={() => onConfirm(scope)} className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-white flex items-center gap-2 transition">
            <Check className="w-3.5 h-3.5" />
            Lock Intelligence Rule
          </button>
        </div>
      </div>
    </div>
  );
}
