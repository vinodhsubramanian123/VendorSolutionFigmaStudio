import React from "react";
import {
  UCID,
  UCIDStep,
  Solution,
  Snapshot,
} from "../../types";
import { StepBoqIntake } from "./steps/StepBoqIntake";
import { StepPreIntelligence } from "./steps/StepPreIntelligence";
import { StepVendorProvisioning } from "./steps/StepVendorProvisioning";
import { StepPostIntelligence } from "./steps/StepPostIntelligence";
import { StepComparison } from "./steps/StepComparison";
import { StepSnapshot } from "./steps/StepSnapshot";

interface StepContentPanelProps {
  ucid: UCID;
  activeStep: UCIDStep;
  runningIntel: string | null;
  intelProgress: number;
  committingSnapshot: boolean;
  onRunIntel: () => void;
  onAdvance: () => void;
  onCommitSnapshot: () => void;
  appendLogEvent: (level: "info" | "warn" | "ok" | "err", msg: string) => void;
  onUpdateSolutions: (sols: Solution[]) => void;
  onUpdateBOM: (rawText: string) => void;
  onShowToast: (msg: string, type: "success" | "warn" | "error") => void;
}

export function StepContentPanel({
  ucid,
  activeStep,
  runningIntel,
  intelProgress,
  committingSnapshot,
  onRunIntel,
  onAdvance,
  onCommitSnapshot,
  appendLogEvent,
  onUpdateSolutions,
  onUpdateBOM,
  onShowToast,
}: StepContentPanelProps) {
  const isRunning = runningIntel === uucidId(ucid);

  function uucidId(u: UCID) {
    return u.id;
  }

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
        />
      );

    case "solution-design":
      return (
        <StepSolutionDesign
          ucid={ucid}
          onAdvance={onAdvance}
          onUpdateSolutions={onUpdateSolutions}
          appendLogEvent={appendLogEvent}
        />
      );

    case "vendor-provisioning":
      return <StepVendorProvisioning onAdvance={onAdvance} />;

    case "post-intelligence":
      return (
        <StepPostIntelligence
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
}

