import React from "react";
import {
  Upload,
  Zap,
  Activity,
  GitCompare,
  Camera,
  CheckCircle,
  Layers,
} from "lucide-react";
import type { UCID, UCIDStep } from "../../types";
import { STEP_ORDER } from "../../lib/mockData";
import { tokens } from "../../styles/tokens";
import { motion } from "motion/react";

const STEP_ICONS: Record<UCIDStep, React.ElementType> = {
  "boq-intake": Upload,
  "pre-intelligence": Zap,
  "solution-design": Layers,
  "vendor-provisioning": NetworkIconOfflineFallback,
  "post-intelligence": Activity,
  comparison: GitCompare,
  snapshot: Camera,
};

function NetworkIconOfflineFallback(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <rect width="6" height="6" x="9" y="9" rx="1" />
      <path d="M9 1H1v8h8V1Zm14 0h-8v8h8V1ZM9 15H1v8h8v-8Zm14 0h-8v8h8v-8Z" />
    </svg>
  );
}

function HelpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

const STEPS_DATA = [
  {
    id: "boq-intake",
    label: "WORKBOOK INTAKE",
    shortLabel: "Intake",
    desc: "Suck in structured legacy workbook formats.",
  },
  {
    id: "pre-intelligence",
    label: "CATALOG CLARITY",
    shortLabel: "Scan",
    desc: "Deduplicate catalog part descriptions.",
  },
  {
    id: "solution-design",
    label: "OPTIMAL SOURCING",
    shortLabel: "Design",
    desc: "Review alternative brand solutions.",
  },
  {
    id: "vendor-provisioning",
    label: "API LIVE GATEWAY",
    shortLabel: "Quotes",
    desc: "Secure live manufacturer API contract pricing.",
  },
  {
    id: "post-intelligence",
    label: "SPEC ALIGNMENT",
    shortLabel: "Rules",
    desc: "Enforce electrical channel socket layouts.",
  },
  {
    id: "comparison",
    label: "COST RECONCILIATION",
    shortLabel: "Winner",
    desc: "Establish final contract winner choice.",
  },
  {
    id: "snapshot",
    label: "TRANSACT SYNC LOCK",
    shortLabel: "Commit",
    desc: "Archive final bill-of-materials design.",
  },
];

interface UCIDStepperProps {
  ucid: UCID;
  activeStep: UCIDStep;
  setViewStep: (step: UCIDStep) => void;
  getStepState: (u: UCID, stepId: UCIDStep) => "upcoming" | "active" | "complete";
}

export function UCIDStepper({ ucid, activeStep, setViewStep, getStepState }: UCIDStepperProps) {
  const getStepTimestamp = (stepId: UCIDStep) => {
    // Search backwards for the step transition event
    const event = [...(ucid.events || [])].reverse().find(
      (ev) =>
        ev.msg.toLowerCase().includes(`step advanced from ${stepId.toLowerCase()}`) ||
        (stepId === "snapshot" && ev.msg.toLowerCase().includes("snapshot securely committed"))
    );
    if (event) return event.ts;

    // Fallback for intake step
    if (stepId === "boq-intake") {
      const parts = ucid.createdAt.split(" ");
      return parts.length > 1 ? parts[1] : ucid.createdAt;
    }
    return null;
  };

  return (
    <>
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2 scrollbar-thin">
        {STEPS_DATA.map((step, idx, array) => {
          const state = getStepState(ucid, step.id as UCIDStep);
          const IconComponent = STEP_ICONS[step.id as UCIDStep] || HelpIcon;
          const isCurrentViewing = activeStep === step.id;
          const isLast = idx === array.length - 1;
          const completionTime = state === "complete" ? getStepTimestamp(step.id as UCIDStep) : null;

          return (
            <div key={step.id} className="flex items-center flex-1 min-w-[70px]">
              <button
                type="button"
                onClick={() => setViewStep(step.id as UCIDStep)}
                className="flex flex-col items-center gap-1 cursor-pointer w-full group relative focus:outline-none"
              >
                {/* Tooltip on Hover */}
                {state === "complete" && (
                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-surface-header border border-indigo-500/20 text-white text-[9px] px-2 py-1 rounded shadow-lg z-30 font-mono whitespace-nowrap">
                    Completed at {completionTime || "Verified"}
                  </div>
                )}

                <div className="relative w-8 h-8 rounded-full flex items-center justify-center">
                  {/* Fluid Gliding Background for Active Step */}
                  {isCurrentViewing && (
                    <motion.div
                      layoutId="activeStepperIndicator"
                      className="absolute inset-0 rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      style={{
                        backgroundColor: "rgba(74, 133, 253, 0.15)",
                        border: `1.5px solid ${tokens.colors.accent.indigo}`,
                        boxShadow: "0 0 12px rgba(74, 133, 253, 0.4)",
                      }}
                    />
                  )}

                  {/* Base Circle (for incomplete / complete states) */}
                  <div
                    className="absolute inset-0 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor:
                        state === "complete" && !isCurrentViewing
                          ? "rgba(0,212,160,0.1)"
                          : !isCurrentViewing
                            ? "rgba(74, 133, 253,0.03)"
                            : "transparent",
                      border:
                        state === "complete" && !isCurrentViewing
                          ? `1.5px solid ${tokens.colors.status.success}`
                          : !isCurrentViewing
                            ? "1.5px solid rgba(74, 133, 253,0.12)"
                            : "none",
                    }}
                  />

                  {/* Icon Layer */}
                  <div className="relative z-10 flex items-center justify-center">
                    {state === "complete" ? (
                      <CheckCircle className="w-4 h-4 text-status-success" />
                    ) : (
                      <IconComponent
                        className="w-3.5 h-3.5 font-bold"
                        style={{ color: isCurrentViewing ? tokens.colors.accent.indigo : tokens.colors.text.muted }} 
                      />
                    )}
                  </div>
                </div>
                <span
                  className="text-[9px] font-bold text-center group-hover:text-white transition-colors"
                  style={{
                    color: isCurrentViewing ? tokens.colors.accent.indigo : state === "complete" ? tokens.colors.status.success : tokens.colors.text.muted, 
                  }}
                >
                  {step.shortLabel}
                </span>
              </button>
              {!isLast && (
                <div
                  className="h-[1.5px] flex-1 min-w-[10px]"
                  style={{
                    backgroundColor: state === "complete" ? "rgba(0,212,160,0.3)" : "rgba(74, 133, 253,0.08)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Stepper Active Area Description */}
      <div className="p-3 rounded-lg border text-xs text-left bg-surface-card border-indigo-500/10">
        <p className="font-semibold text-indigo-400 capitalize">
          Step {STEP_ORDER.indexOf(activeStep) + 1}:{" "}
          {STEPS_DATA.find((s) => s.id === activeStep)?.label}
        </p>
        <p className="text-gray-500 mt-0.5">
          {STEPS_DATA.find((s) => s.id === activeStep)?.desc}
        </p>
      </div>
    </>
  );
}
