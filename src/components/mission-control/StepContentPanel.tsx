import React from "react";
import {
  UCID,
  UCIDStep,
  Solution,
  AppView,
  SourcingRule,
} from "../../types";
import { StepBoqIntake } from "./steps/StepBoqIntake";
import { StepPreIntelligence } from "./steps/StepPreIntelligence";
import { StepSolutionDesign } from "./steps/StepSolutionDesign";
import { StepVendorProvisioning } from "./steps/StepVendorProvisioning";
import { StepPostIntelligence } from "./steps/StepPostIntelligence";
import { StepComparison } from "./steps/StepComparison";
import { StepSnapshot } from "./steps/StepSnapshot";
import { motion, AnimatePresence } from "motion/react";

interface StepContentPanelProps {
  ucid: UCID;
  activeStep: UCIDStep;
  runningIntel: string | null;
  intelProgress: number;
  committingSnapshot: boolean;
  onRunIntel: () => void;
  onAdvance: () => void;
  onRegress: () => void;
  onCommitSnapshot: () => void;
  appendLogEvent: (level: "info" | "warn" | "ok" | "err", msg: string) => void;
  onUpdateSolutions: (sols: Solution[]) => void;
  onUpdateBOM: (rawText: string) => void;
  onShowToast: (msg: string, type: "success" | "warn" | "error") => void;
  onNavigate: (view: AppView) => void;
  sourcingRules?: SourcingRule[];
}

export function StepContentPanel({
  ucid,
  activeStep,
  runningIntel,
  intelProgress,
  committingSnapshot,
  onRunIntel,
  onAdvance,
  onRegress,
  onCommitSnapshot,
  appendLogEvent,
  onUpdateSolutions,
  onUpdateBOM,
  onShowToast,
  onNavigate,
  sourcingRules = [],
}: StepContentPanelProps) {
  const isRunning = runningIntel === uucidId(ucid);

  function uucidId(u: UCID) {
    return u.id;
  }

  const renderContent = () => {
    switch (activeStep) {
      case "boq-intake":
      return (
        <StepBoqIntake
          ucid={ucid}
          onUpdateBOM={onUpdateBOM}
          onUpdateSolutions={onUpdateSolutions}
          appendLogEvent={appendLogEvent}
          onShowToast={onShowToast}
          onAdvance={onAdvance}
          onNavigate={onNavigate}
        />
      );

    case "pre-intelligence":
      return (
        <StepPreIntelligence
          ucid={ucid}
          isRunning={isRunning}
          intelProgress={intelProgress}
          onAdvance={onAdvance}
          onRunIntel={onRunIntel}
          appliedRulesCount={sourcingRules.filter((r) => r.status === "active").length}
          substitutionRulesCount={sourcingRules.filter((r) => r.ruleType === "substitution" && r.status === "active").length}
          priceCapRulesCount={sourcingRules.filter((r) => r.ruleType === "price_cap" && r.status === "active").length}
        />
      );

    case "solution-design":
      return (
        <StepSolutionDesign
          ucid={ucid}
          onAdvance={onAdvance}
          onRegress={onRegress}
          onUpdateSolutions={onUpdateSolutions}
          appendLogEvent={appendLogEvent}
        />
      );

    case "vendor-provisioning":
      return (
        <StepVendorProvisioning 
          ucid={ucid}
          onAdvance={onAdvance}
          appendLogEvent={appendLogEvent}
        />
      );

    case "post-intelligence":
      return (
        <StepPostIntelligence
          ucid={ucid}
          onAdvance={onAdvance}
          appendLogEvent={appendLogEvent}
        />
      );

    case "comparison":
      return (
        <StepComparison
          ucid={ucid}
          committingSnapshot={committingSnapshot}
          onCommitSnapshot={onCommitSnapshot}
          onUpdateSolutions={onUpdateSolutions}
          appendLogEvent={appendLogEvent}
          onNavigate={onNavigate}
        />
      );

    case "snapshot":
      return (
        <StepSnapshot
          ucid={ucid}
          onShowToast={onShowToast}
          appendLogEvent={appendLogEvent}
        />
      );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={activeStep}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        transition={{ duration: 0.2 }}
      >
        {renderContent()}
      </motion.div>
    </AnimatePresence>
  );
}

