import React from "react";
import { ArrowRight } from "lucide-react";
import { StatusBadge } from "../../shared/StatusBadge";

interface StepVendorProvisioningProps {
  onAdvance: () => void;
}

export function StepVendorProvisioning({
  onAdvance,
}: StepVendorProvisioningProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400 leading-normal text-left">
        Sourcing live contract rates via secure authenticated REST/SOAP APIs
        directly from Hewlett Packard Enterprise & Dell.
      </p>
      <div className="space-y-3">
        <div className="p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-card border-indigo-500/10 text-left">
          <div>
            <StatusBadge status="HPE Quote Gateway" variant="success" />
            <p className="text-[11px] text-white font-medium mt-1">
              Status: SECURE CONTRACT RATE APPLIED (-6.2% base)
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Reference quote hash: hpe-q-2026-9281a
            </p>
          </div>
          <span className="text-[10px] font-mono text-gray-400">
            Latency: 28 ms
          </span>
        </div>

        <div className="p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-card border-indigo-500/10 text-left">
          <div>
            <span className="text-[10px] font-mono text-brand-indigo font-bold uppercase">
              Dell Direct Quote Channel
            </span>
            <p className="text-[11px] text-white font-medium mt-1">
              Status: MATCHED CUSTOM VOLUME CONTRACT DISCOUNT (-6.6% bulk
              applied)
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Reference quote hash: dell-q-8841x-v6
            </p>
          </div>
          <span className="text-[10px] font-mono text-gray-400">
            Latency: 42 ms
          </span>
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onAdvance}
          className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer"
        >
          Verify Technical Constraints <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
