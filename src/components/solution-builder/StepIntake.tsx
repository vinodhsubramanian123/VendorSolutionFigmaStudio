import React, { useState } from "react";
import {
  UploadCloud,
  CheckCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Check,
} from "lucide-react";
import { StatusBadge } from "../shared/StatusBadge";

interface StepIntakeProps {
  activeUcidsCount: number;
  onProceed: () => void;
  onSimulationLoad: (fileName: string) => void;
}

export function StepIntake({
  activeUcidsCount,
  onProceed,
  onSimulationLoad,
}: StepIntakeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestProgress, setIngestProgress] = useState(0);
  const [isIngested, setIsIngested] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const handleFileUpload = (fileName: string) => {
    setIsIngesting(true);
    setUploadedFileName(fileName);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setIngestProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsIngesting(false);
        setIsIngested(true);
        // Parent component hook if needed, but we can keep it local until proceed
        if (onSimulationLoad) {
          onSimulationLoad(fileName);
        }
      }
    }, 200);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0].name);
    }
  };

  const triggerPicker = () => {
    const fileInput = document.getElementById(
      "boq-file-picker",
    ) as HTMLInputElement;
    if (fileInput) fileInput.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0].name);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      {/* Main Intake Canvas */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-surface-elevated border border-white/5 rounded-xl p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <StatusBadge status="Direct Solution Ingest" variant="info" />
              <h3 className="text-sm font-semibold text-white mt-1.5 font-sans">
                Bill of Quantities (BOQ) Ingestion
              </h3>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                Upload your customer hardware requirements sheet,
                cross-vendor BOM workbook, or raw equipment PARTS spec file.
                The system will dynamically resolve nomenclature, run rules
                validators, and seed dual-sourcing mapping cards.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-indigo-500/[0.02] border border-indigo-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-gray-400 text-[10.5px] max-w-sm text-center sm:text-left leading-normal">
                Don't have a spreadsheet handy? Click here to instantly
                parse a pre-scanned mock enterprise server &amp; storage
                workbook.
              </p>
              <button
                onClick={() =>
                  handleFileUpload("demographic_sourcing_specs_2026.xlsx")
                }
                className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-bold cursor-pointer text-[10px] font-sans flex items-center gap-2 shrink-0 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Load Demo BOQ</span>
              </button>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 transition ${
                isDragging
                  ? "border-indigo-400 bg-indigo-500/10"
                  : "border-indigo-500/10 bg-black/25"
              }`}
            >
              {isIngesting ? (
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                  <p className="font-semibold text-white font-sans text-xs">
                    Parsing Complex BOQ Sheet...
                  </p>
                  <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-200"
                      style={{ width: `${ingestProgress}%` }}
                    />
                  </div>
                </div>
              ) : isIngested ? (
                <div className="flex flex-col items-center text-center gap-2">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                  <p className="font-semibold text-white">
                    Successfully Analyzed "{uploadedFileName}"
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Extracted and normalized configuration options matched
                    with active enterprise contracts.
                  </p>
                  <button
                    onClick={onProceed}
                    className="mt-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg cursor-pointer transition flex items-center gap-1 focus:outline-none"
                  >
                    <span>Configure UCID Assignment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center text-center gap-2 cursor-pointer w-full"
                  onClick={triggerPicker}
                >
                  <UploadCloud className="w-10 h-10 text-indigo-400" />
                  <p className="font-semibold text-gray-200">
                    Drag &amp; Drop or Upload Customer BOQ Spreadsheet
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Supports multi-vendor, multi-tab equipment configuration
                    sheets
                  </p>
                  <button
                    type="button"
                    className="mt-2 px-3 py-1.5 bg-[#0f172a] hover:bg-black/40 text-gray-300 font-medium rounded-lg text-[10px] border border-white/10"
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
          </div>

          <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-left">
              <p className="text-xs font-bold text-gray-300">
                Have active configurations in memory?
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                We detected {activeUcidsCount} active tracking UCID container(s)
                pre-loaded.
              </p>
            </div>
            <button
              onClick={onProceed}
              className="px-5 py-2.5 rounded-lg bg-[#0f172a] hover:bg-[#131d35] text-indigo-400 font-bold border border-indigo-500/20 hover:border-indigo-500/40 cursor-pointer transition flex items-center gap-1.5 focus:outline-none text-[10px]"
            >
              <span>Proceed to Assignment Map (Step 2)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Guide Checklist Side Card */}
      <div className="space-y-4">
        {/* Pre-Condition Check */}
        <div className="bg-surface-elevated border border-white/5 rounded-xl p-5 space-y-3.5">
          <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">
            Pre-Condition Verification
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] py-1 border-b border-white/5 pb-2">
              <span className="text-gray-400 font-sans font-medium">
                BOM Sheet Loaded
              </span>
              <StatusBadge 
                status={isIngested ? "ACCEPTED" : "AWAITING"}
                variant={isIngested ? "success" : "error"}
                size="sm"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] py-1 border-b border-white/5 pb-2">
              <span className="text-gray-400 font-sans font-medium">
                Active UCID Context
              </span>
              <StatusBadge 
                status={activeUcidsCount > 0 ? `${activeUcidsCount} ACTIVE` : "NONE"}
                variant={activeUcidsCount > 0 ? "success" : "warning"}
                size="sm"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] py-1">
              <span className="text-gray-400 font-sans font-medium">
                Vendor Handshakes
              </span>
              <StatusBadge status="CONNECTED" variant="success" size="sm" />
            </div>
          </div>
        </div>

        {/* Context Explainer */}
        <div className="bg-surface-elevated border border-white/5 rounded-xl p-5 space-y-4">
          <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">
            What is Solution Sourcing?
          </h4>
          <p className="text-gray-500 leading-relaxed text-[11px]">
            Instead of working with independent fragment spreadsheets, the
            platform compiles multi-vendor contracts under a single{" "}
            <strong>Unified Solution Context (UCID)</strong>.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-semibold text-white">
                  Integrated Pricing Engines
                </p>
                <p className="text-gray-500 text-[10px] mt-0.5">
                  Live direct partner price validation instantly against EOL
                  and grey market margins.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-semibold text-white">
                  Symmetry Verification
                </p>
                <p className="text-gray-500 text-[10px] mt-0.5">
                  Automatic technical validation check for dual-socket
                  limits, power envelopes, and CPU lines.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Schema Inspector Panel */}
        <div className="bg-surface-elevated border border-indigo-500/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-yellow-400" />
            <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">
              🤖 Agent & DB Contract Spec
            </h4>
          </div>

          <p className="text-gray-500 text-[11px] leading-normal">
            Click schemas to inspect active PostgreSQL / Spanner JSON
            contracts mapping visual components to background automated
            workers.
          </p>

          {/* Accordion Tabs for Schema definitions */}
          <div className="space-y-2 border-t border-white/5 pt-3">
            <details className="group border border-white/5 rounded-lg bg-black/25 overflow-hidden">
              <summary className="p-2 text-[10px] font-bold text-gray-300 font-mono flex items-center justify-between cursor-pointer hover:bg-white/2">
                <span>1. UCID COMPILING CONTRACT</span>
                <span className="text-indigo-400 text-[9px] group-open:rotate-180 transition">
                  &#9662;
                </span>
              </summary>
              <pre className="p-2.5 bg-black/60 font-mono text-[9px] text-status-success border-t border-white/5 overflow-x-auto leading-relaxed">
                {`interface UCID {
  id: string; // Hash UUID
  displayId: string; // "UCID-2026-0041"
  name: string; // "Scale-Out Compute"
  priority: 'critical'|'high'|'medium';
  solutions: Solution[]; 
  events: LogEvent[]; // Telemetry
}`}
              </pre>
            </details>

            <details className="group border border-white/5 rounded-lg bg-black/25 overflow-hidden">
              <summary className="p-2 text-[10px] font-bold text-gray-300 font-mono flex items-center justify-between cursor-pointer hover:bg-white/2">
                <span>2. WORKWORK SHEETS & AUDITS</span>
                <span className="text-indigo-400 text-[9px] group-open:rotate-180 transition">
                  &#9662;
                </span>
              </summary>
              <div className="p-2.5 bg-black/60 font-mono text-[9.5px] text-gray-400 border-t border-white/5 space-y-2 leading-relaxed">
                <p className="text-yellow-400 font-bold">
                  Matched Critical Rule validations during extraction:
                </p>
                <div className="p-1.5 bg-red-500/10 border border-red-500/20 rounded">
                  <span className="text-status-error font-bold">
                    Rule 1 (EOL Risk Check):
                  </span>
                  <p className="text-[9px] text-gray-300 mt-0.5">
                    Scans SKU{" "}
                    <code className="text-white bg-black/30 px-1 font-mono">
                      815100-B21
                    </code>{" "}
                    to flag status{" "}
                    <code className="text-white bg-black/30 px-1 font-mono">
                      'eol'
                    </code>{" "}
                    and replace with Intel Xeon 6430
                  </p>
                </div>
                <div className="p-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded">
                  <span className="text-status-warning font-bold">
                    Rule 2 (Contract Rate Variance):
                  </span>
                  <p className="text-[9px] text-gray-300 mt-0.5">
                    Scans SKU{" "}
                    <code className="text-white bg-black/30 px-1 font-mono">
                      400-BPSB
                    </code>{" "}
                    Dell Drive to verify raw quote pricing against API list
                    price ($1,190 contract vs $1,590 listed).
                  </p>
                </div>
              </div>
            </details>

            <details className="group border border-white/5 rounded-lg bg-black/25 overflow-hidden">
              <summary className="p-2 text-[10px] font-bold text-gray-300 font-mono flex items-center justify-between cursor-pointer hover:bg-white/2">
                <span>3. PLAYWRIGHT CRAWLER API</span>
                <span className="text-indigo-400 text-[9px] group-open:rotate-180 transition">
                  &#9662;
                </span>
              </summary>
              <pre className="p-2.5 bg-black/60 font-mono text-[9px] text-purple-400 border-t border-white/5 overflow-x-auto leading-relaxed">
                {`interface PlaywrightAgentConfig {
  targetUrl: string;
  headless: boolean;
  timeoutMs: number;
  proxyRotation: boolean;
}`}
              </pre>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
