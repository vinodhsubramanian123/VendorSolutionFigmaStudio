import React from "react";
import { UploadCloud, CheckCircle, RefreshCw, ArrowRight } from "lucide-react";

interface StepIntakeDropzoneProps {
  isDragging: boolean;
  isIngesting: boolean;
  ingestProgress: number;
  isIngested: boolean;
  uploadedFileName: string;
  onProceed: () => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent) => void;
  triggerPicker: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function StepIntakeDropzone({
  isDragging,
  isIngesting,
  ingestProgress,
  isIngested,
  uploadedFileName,
  onProceed,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  triggerPicker,
  handleFileChange,
}: StepIntakeDropzoneProps) {
  return (
    <div
      role="presentation"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 transition ${
        isDragging
          ? "border-brand-indigo bg-brand-indigo/10"
          : "border-brand-indigo/10 bg-surface-canvas/25"
      }`}
    >
      {isIngesting ? (
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="w-8 h-8 text-brand-indigo animate-spin" />
          <p className="font-semibold text-content-primary font-sans text-xs">
            Parsing Complex BOQ Sheet...
          </p>
          <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-indigo transition-all duration-200"
              style={{ width: `${ingestProgress}%` }}
            />
          </div>
        </div>
      ) : isIngested ? (
        <div className="flex flex-col items-center text-center gap-2">
          <CheckCircle className="w-8 h-8 text-status-success" />
          <p className="font-semibold text-content-primary">
            Successfully Analyzed "{uploadedFileName}"
          </p>
          <p className="text-[10px] text-content-muted">
            Extracted and normalized configuration options matched
            with active enterprise contracts.
          </p>
          <button type="button"
            onClick={onProceed}
            className="mt-2 px-4 py-2 bg-brand-indigo hover:bg-brand-indigo text-content-primary font-bold rounded-lg cursor-pointer transition flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
          >
            <span>Configure UCID Assignment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter") triggerPicker(); }}
          className="flex flex-col items-center text-center gap-2 cursor-pointer w-full"
          onClick={triggerPicker}
        >
          <UploadCloud className="w-10 h-10 text-brand-indigo" />
          <p className="font-semibold text-content-primary">
            Drag &amp; Drop or Upload Customer BOQ Spreadsheet
          </p>
          <p className="text-[10px] text-content-muted">
            Supports multi-vendor, multi-tab equipment configuration
            sheets
          </p>
          <button
            type="button"
            onClick={triggerPicker}
            className="mt-2 px-3 py-1.5 bg-surface-elevated hover:bg-surface-canvas/40 text-content-secondary font-medium rounded-lg text-[10px] border border-white/10"
          >
            Select File
          </button>
          <input
            id="boq-file-picker"
            type="file"
            accept=".xlsx,.csv,.xls"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}
    </div>
  );
}
