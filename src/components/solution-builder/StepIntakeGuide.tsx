import React from "react";
import { Check } from "lucide-react";
import { StatusBadge } from "../shared/StatusBadge";

interface StepIntakeGuideProps {
  isIngested: boolean;
  activeUcidsCount: number;
}

export function StepIntakeGuide({
  isIngested,
  activeUcidsCount,
}: StepIntakeGuideProps) {
  return (
    <div className="space-y-4">
      {/* Pre-Condition Check */}
      <div className="bg-surface-elevated border border-white/5 rounded-xl p-5 space-y-3.5">
        <h3 className="font-bold text-content-primary uppercase tracking-wider text-[10px]">
          Pre-Condition Verification
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] py-1 border-b border-white/5 pb-2">
            <span className="text-content-secondary font-sans font-medium">
              BOQ Document Ingested
            </span>
            <StatusBadge 
              status={isIngested ? "ACCEPTED" : "AWAITING"}
              variant={isIngested ? "success" : "error"}
              size="sm"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] py-1 border-b border-white/5 pb-2">
            <span className="text-content-secondary font-sans font-medium">
              Active UCID Context
            </span>
            <StatusBadge 
              status={activeUcidsCount > 0 ? `${activeUcidsCount} ACTIVE` : "NONE"}
              variant={activeUcidsCount > 0 ? "success" : "warning"}
              size="sm"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] py-1">
            <span className="text-content-secondary font-sans font-medium">
              Vendor Handshakes
            </span>
            <StatusBadge status="CONNECTED" variant="success" size="sm" />
          </div>
        </div>
      </div>

      {/* Context Explainer */}
      <div className="bg-surface-elevated border border-white/5 rounded-xl p-5 space-y-4">
        <h3 className="font-bold text-content-primary uppercase tracking-wider text-[10px]">
          What is Solution Sourcing?
        </h3>
        <p className="text-content-muted leading-relaxed text-[11px]">
          Instead of working with independent fragment spreadsheets, the
          platform compiles multi-vendor contracts under a single{" "}
          <strong>Unified Solution Context (UCID)</strong>.
        </p>

        <div className="space-y-3 pt-2">
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-status-success/10 text-status-success flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-content-primary">
                Integrated Pricing Engines
              </p>
              <p className="text-content-muted text-[10px] mt-0.5">
                Live direct partner price validation instantly against EOL
                and grey market margins.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-status-success/10 text-status-success flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-content-primary">
                Symmetry Verification
              </p>
              <p className="text-content-muted text-[10px] mt-0.5">
                Automatic technical validation check for dual-socket
                limits, power envelopes, and CPU lines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
