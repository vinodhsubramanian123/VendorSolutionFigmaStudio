import React from "react";
import { UploadCloud, Sparkles, ArrowRight } from "lucide-react";
import { StatusBadge } from "../shared/StatusBadge";
import { useStepIntakeLogic } from "./useStepIntakeLogic";
import { StepIntakeDropzone } from "./StepIntakeDropzone";
import { StepIntakeGuide } from "./StepIntakeGuide";

interface StepIntakeProps {
  activeUcidsCount: number;
  onProceed: () => void;
  onIntakeComplete: (parsedConfigs: unknown[]) => void;
}

export function StepIntake({
  activeUcidsCount,
  onProceed,
  onIntakeComplete,
}: StepIntakeProps) {
  const {
    isDragging,
    isIngesting,
    ingestProgress,
    isIngested,
    uploadedFileName,
    rawBoqText,
    setRawBoqText,
    handleFileUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    triggerPicker,
    handleFileChange,
  } = useStepIntakeLogic(onIntakeComplete);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      {/* Main Intake Canvas */}
      <div className="lg:col-span-2 space-y-4">
        {/* Unified Pipeline Active Banner */}
        <div className="p-3 bg-brand-indigo/5 border border-brand-indigo/15 rounded-xl flex items-center justify-between text-left gap-4">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-indigo animate-pulse shrink-0" />
              <span className="text-[9px] font-bold text-brand-indigo font-mono uppercase tracking-wider">
                Sourcing State Sync Connected
              </span>
            </div>
            <p className="text-[10px] text-content-secondary mt-1 leading-normal">
              Any specification uploaded or demo loaded in this Configurator instantly binds to the central <span className="text-content-secondary font-medium">Opportunities Ledger</span>, and feeds metrics straight into your parallel tracking dashboards.
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] font-mono text-status-success font-bold block">
              Active Sync
            </span>
            <span className="text-[9px] text-content-muted font-sans block mt-0.5 animate-fadeIn">
              Active Accounts: {activeUcidsCount}
            </span>
          </div>
        </div>

        <div className="bg-surface-elevated border border-white/5 rounded-xl p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-indigo/10 border border-brand-indigo/20 flex items-center justify-center shrink-0 text-brand-indigo">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <StatusBadge status="Direct Solution Ingest" variant="info" />
              <h2 className="text-sm font-semibold text-content-primary mt-1.5 font-sans">
                Bill of Quantities (BOQ) Ingestion
              </h2>
              <p className="text-[11px] text-content-secondary mt-1 leading-relaxed">
                Upload your customer hardware requirements sheet,
                cross-vendor BOQ workbook, or raw equipment PARTS spec file.
                The system will dynamically resolve nomenclature, run rules
                validators, and seed dual-sourcing mapping cards.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-brand-indigo/[0.02] border border-brand-indigo/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-content-secondary text-[10.5px] max-w-sm text-center sm:text-left leading-normal">
                Don't have a spreadsheet handy? Click here to instantly
                parse a pre-scanned mock enterprise server &amp; storage
                workbook.
              </p>
              <button type="button"
                data-testid="parse-demo-btn"
                onClick={() =>
                  handleFileUpload("demographic_sourcing_specs_2026.xlsx")
                }
                className="px-4 py-2 rounded-lg bg-brand-indigo hover:bg-brand-indigo text-content-primary font-bold cursor-pointer text-[10px] font-sans flex items-center gap-2 shrink-0 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Load Demo BOQ</span>
              </button>
            </div>

            <StepIntakeDropzone
              isDragging={isDragging}
              isIngesting={isIngesting}
              ingestProgress={ingestProgress}
              isIngested={isIngested}
              uploadedFileName={uploadedFileName}
              onProceed={onProceed}
              handleDragOver={handleDragOver}
              handleDragLeave={handleDragLeave}
              handleDrop={handleDrop}
              triggerPicker={triggerPicker}
              handleFileChange={handleFileChange}
            />

            {/* Raw Text Input Section */}
            <div className="pt-4 space-y-2">
              <label htmlFor="rawBoqText" className="text-[10px] uppercase font-bold text-content-muted tracking-wider">
                Or Paste Raw BOQ Text
              </label>
              <textarea
                id="rawBoqText"
                value={rawBoqText}
                onChange={(e) => setRawBoqText(e.target.value)}
                placeholder="E.g. 2x P40424-B21 Server Processor..."
                className="w-full h-24 bg-surface-canvas border border-white/10 rounded-lg p-3 text-[11px] text-content-secondary font-mono focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus:border-brand-indigo/50 resize-none"
              />
              <div className="flex justify-end">
                <button type="button"
                  onClick={() => {
                    if (rawBoqText.trim()) {
                      handleFileUpload("Pasted_Raw_BOQ.txt", rawBoqText);
                    }
                  }}
                  disabled={!rawBoqText.trim() || isIngesting}
                  className="px-4 py-2 bg-brand-indigo/20 text-brand-indigo hover:bg-brand-indigo/30 hover:text-indigo-300 font-bold rounded-lg cursor-pointer text-[10px] disabled:opacity-50 transition"
                >
                  Parse Text
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-left">
              <p className="text-xs font-bold text-content-secondary">
                Have active configurations in memory?
              </p>
              <p className="text-[10px] text-content-muted mt-0.5">
                We detected {activeUcidsCount} active tracking UCID container(s)
                pre-loaded.
              </p>
            </div>
            <button type="button"
              onClick={onProceed}
              className="px-5 py-2.5 rounded-lg bg-surface-elevated hover:bg-surface-elevated text-brand-indigo font-bold border border-brand-indigo/20 hover:border-brand-indigo/40 cursor-pointer transition flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 text-[10px]" 
            >
              <span>Proceed to Assignment Map (Step 2)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <StepIntakeGuide
        isIngested={isIngested}
        activeUcidsCount={activeUcidsCount}
      />
    </div>
  );
}
