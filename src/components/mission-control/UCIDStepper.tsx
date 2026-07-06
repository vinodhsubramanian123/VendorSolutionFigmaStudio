import React from "react";
import {
  Upload,
  Zap,
  Activity,
  GitCompare,
  Camera,
  CheckCircle,
  Layers,
  ServerOff,
  HelpCircle,
} from "lucide-react";
import type { UCID, UCIDStep } from "../../types";
import { STEP_ORDER } from "../../lib/mockData";
import { tokens } from "../../styles/tokens";
import { motion } from "motion/react";

const STEP_ICONS: Record<UCIDStep, React.ElementType> = {
  "boq-intake": Upload,
  "pre-intelligence": Zap,
  "solution-design": Layers,
  "vendor-provisioning": ServerOff,
  "post-intelligence": Activity,
  comparison: GitCompare,
  snapshot: Camera,
};



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


function StepItem({
  step,
  idx,
  isLast,
  state,
  isCurrentViewing,
  completionTime,
  setViewStep,
}: {
  step: typeof STEPS_DATA[0];
  idx: number;
  isLast: boolean;
  state: "upcoming" | "active" | "complete";
  isCurrentViewing: boolean;
  completionTime: string | null;
  setViewStep: (step: UCIDStep) => void;
}) {
  const IconComponent = STEP_ICONS[step.id as UCIDStep] || HelpCircle;
  const bgStyle = state === "complete" && !isCurrentViewing
    ? "rgba(0,212,160,0.1)"
    : !isCurrentViewing
      ? "rgba(74, 133, 253,0.03)"
      : "transparent";

  const borderStyle = state === "complete" && !isCurrentViewing
    ? `1.5px solid ${tokens.colors.status.success}`
    : !isCurrentViewing
      ? "1.5px solid rgba(74, 133, 253,0.12)"
      : "none";

  return (
    <div key={step.id} className="flex items-center flex-1 min-w-[70px]">
      <button
        type="button"
        onClick={() => setViewStep(step.id as UCIDStep)}
        className="flex flex-col items-center gap-1 cursor-pointer w-full group relative focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
      >
        {state === "complete" && (
          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-surface-header border border-brand-indigo/20 text-content-primary text-[9px] px-2 py-1 rounded shadow-lg z-30 font-mono whitespace-nowrap">
            Completed at {completionTime || "Verified"}
          </div>
        )}

        <div className="relative w-8 h-8 rounded-full flex items-center justify-center">
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

          <div
            className="absolute inset-0 rounded-full transition-all duration-300"
            style={{
              backgroundColor: bgStyle,
              border: borderStyle,
            }}
          />

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
          className="text-[9px] font-bold text-center group-hover:text-content-primary transition-colors"
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
}

export function UCIDStepper({ ucid, activeStep, setViewStep, getStepState }: UCIDStepperProps) {
  const getStepTimestamp = (stepId: UCIDStep) => {
    const event = [...(ucid.events || [])].reverse().find(
      (ev) =>
        ev.msg.toLowerCase().includes(`step advanced from ${stepId.toLowerCase()}`) ||
        (stepId === "snapshot" && ev.msg.toLowerCase().includes("snapshot securely committed"))
    );
    if (event) return event.timestamp;
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
          const isCurrentViewing = activeStep === step.id;
          const isLast = idx === array.length - 1;
          const completionTime = state === "complete" ? getStepTimestamp(step.id as UCIDStep) : null;
          return (
            <StepItem
              key={step.id}
              step={step}
              idx={idx}
              isLast={isLast}
              state={state}
              isCurrentViewing={isCurrentViewing}
              completionTime={completionTime}
              setViewStep={setViewStep}
            />
          );
        })}
      </div>

      <div className="p-3 rounded-lg border text-xs text-left bg-surface-card border-brand-indigo/10">
        <p className="font-semibold text-brand-indigo capitalize">
          Step {STEP_ORDER.indexOf(activeStep) + 1}:{" "}
          {STEPS_DATA.find((s) => s.id === activeStep)?.label}
        </p>
        <p className="text-content-primary0 mt-0.5">
          {STEPS_DATA.find((s) => s.id === activeStep)?.desc}
        </p>
      </div>
    </>
  );
}
