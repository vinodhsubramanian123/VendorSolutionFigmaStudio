import React from "react";
import {
  FileSpreadsheet,
  Check,
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  UploadCloud,
} from "lucide-react";

import { StatusBadge } from "../shared/StatusBadge";
import { Select } from "../shared/Select";
import { Button } from "../shared/Button";
import type { Solution, Config } from "../../types";

interface BoqResponsePayload {
  ucid: string;
  solutions?: Solution[];
  parsedSummary?: {
    vendorBrand: string;
    detectedChassis: string;
    initialConfidenceScore: number;
  };
}

interface BoqIngestWorkbookProps {
  selectedPreset: "hpe-legacy" | "dell-overcharge" | "cisco-asymmetry";
  setSelectedPreset: (
    val: "hpe-legacy" | "dell-overcharge" | "cisco-asymmetry",
  ) => void;
  boqFile: string;
  isBOQIngesting: boolean;
  boqProgress: number;
  boqResponse: BoqResponsePayload | null;
  boqError: string;
  onTriggerBOQParse: (
    fileName: string,
    preset: "hpe-legacy" | "dell-overcharge" | "cisco-asymmetry",
  ) => void;
  onSplitAndProvision: () => void;
}

export function BoqIngestWorkbook({
  selectedPreset,
  setSelectedPreset,
  boqFile,
  isBOQIngesting,
  boqProgress,
  boqResponse,
  boqError,
  onTriggerBOQParse,
  onSplitAndProvision,
}: BoqIngestWorkbookProps) {
  const boqPresets = [
    {
      key: "hpe-legacy",
      label: "HPE Enterprise Legacy Sheet (.xlsx)",
      file: "HPE_PARTNER_QUOTE_6130_EOL.xlsx",
    },
    {
      key: "dell-overcharge",
      label: "Dell Premier Portal Bid (.xlsx)",
      file: "DELL_PREMIER_R760_OVERCHARGE.xlsx",
    },
    {
      key: "cisco-asymmetry",
      label: "Cisco Symmetrical Layout (.xls)",
      file: "CISCO_UCS_M7S_ASYMMETRY.xls",
    },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleBOQDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onTriggerBOQParse(e.dataTransfer.files[0].name, selectedPreset);
    }
  };

  const handleBOQPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onTriggerBOQParse(e.target.files[0].name, selectedPreset);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
      {/* Main Upload / API workspace */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-surface-elevated border border-white/5 rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <StatusBadge status="Step 1: Input Specifications" variant="info" />
              <h3 className="text-sm font-semibold text-white mt-1.5 animate-fadeIn">
                File Intake & Structural Splitting
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                Upload the main spreadsheet containing hardware requirements. It
                will be mapped directly via active contract price catalogs.
              </p>
            </div>

            {/* Selector for Presets */}
            <div className="flex flex-col items-start sm:items-end gap-1 shrink-0 w-full sm:w-64">
              <span className="text-[10px] text-gray-400 font-mono">
                Simulate Document Profile:
              </span>
              <Select
                id="doc-profile-selector"
                value={selectedPreset}
                onChange={(e) => setSelectedPreset(e.target.value as "dell-overcharge" | "hpe-legacy" | "cisco-asymmetry")}
              >
                <option value="hpe-legacy" className="bg-surface-elevated text-white">HPE Legacy 6130 EOL</option>
                <option value="dell-overcharge" className="bg-surface-elevated text-white">Dell Premier Markup</option>
                <option value="cisco-asymmetry" className="bg-surface-elevated text-white">Cisco Asymmetry Layout</option>
              </Select>
            </div>
          </div>

          {/* Ingest Dropzone */}
          <div
            id="boq-dropzone"
            onDragOver={handleDragOver}
            onDrop={handleBOQDrop}
            onClick={() => document.getElementById("hub-boq-picker")?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative overflow-hidden bg-black/10 hover:bg-black/20 hover:border-sky-500/30 ${
              isBOQIngesting ? "border-sky-500/50" : "border-white/10"
            }`}
          >
            <input
              id="hub-boq-picker"
              type="file"
              onChange={handleBOQPicked}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />

            {isBOQIngesting ? (
              <div className="space-y-3 flex flex-col items-center animate-pulse">
                <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
                <p className="text-xs font-bold text-white">
                  Directing to live spreadsheet compile endpoints...
                </p>
                <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 transition-all duration-200"
                    style={{ width: `${boqProgress}%` }}
                  />
                </div>
              </div>
            ) : boqResponse ? (
              <div className="space-y-3 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Check className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <p className="text-xs font-black text-emerald-300">
                    {boqFile || "Workbook-spec.xlsx"}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 font-mono">
                    UCID session created:{" "}
                    <strong className="text-white">{boqResponse.ucid}</strong>
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2 flex flex-col items-center text-gray-400 hover:text-white">
                <div className="w-16 h-16 rounded-full bg-brand-indigo/10 flex items-center justify-center mb-2 border border-brand-indigo/20">
                  <UploadCloud className="w-8 h-8 text-brand-indigo" />
                </div>
                <div>
                  <p className="text-xl font-bold text-content-primary mb-1">
                    Awaiting Data Payload
                  </p>
                  <p className="text-content-muted text-sm max-w-sm mx-auto mb-4">
                    Upload a Vendor CSV or initiate a direct integration fetch.
                  </p>
                  <Button 
                    variant="outline"
                    aria-label="Select spreadsheet file to upload"
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById("hub-boq-picker")?.click();
                    }}
                  >
                    Select File
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Fast Demonstration Ingest Option */}
          {!boqResponse && !isBOQIngesting && (
            <div className="flex justify-center">
              <button
                id="run-ingest-btn"
                type="button"
                aria-label="Run backend API Ingestion simulation"
                onClick={() => {
                  const matchedPreset = boqPresets.find(
                    (p) => p.key === selectedPreset,
                  );
                  onTriggerBOQParse(
                    matchedPreset?.file || "Workbook.xlsx",
                    selectedPreset,
                  );
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/15 border border-sky-500/20 text-sky-400 font-bold cursor-pointer transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 text-[10px]"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Run Backend API Ingest (Simulation Sandbox)</span>
              </button>
            </div>
          )}

          {/* API Response Display & Split Execution */}
          {boqResponse && (
            <div className="space-y-4 pt-4 border-t border-white/5 animate-fadeIn">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-surface-card border border-white/5">
                  <p className="text-[9px] text-gray-500 font-mono lowercase">
                    vendor brand
                  </p>
                  <p className="text-xs font-bold text-white mt-1">
                    {boqResponse.parsedSummary?.vendorBrand}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-surface-card border border-white/5 col-span-2">
                  <p className="text-[9px] text-gray-500 font-mono lowercase">
                    detected key chassis sku
                  </p>
                  <p className="text-xs font-bold text-white mt-1 truncate">
                    {boqResponse.parsedSummary?.detectedChassis}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-surface-card border border-white/5">
                  <p className="text-[9px] text-gray-500 font-mono lowercase">
                    initial integrity confidence
                  </p>
                  <p className="text-xs font-mono font-bold text-emerald-400 mt-1">
                    {boqResponse.parsedSummary?.initialConfidenceScore}%
                  </p>
                </div>
              </div>

              <div className="bg-black/25 rounded-lg border border-white/5 p-4 space-y-2">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">
                  extricated pipeline configs list
                </p>
                <div className="space-y-2 pt-1">
                  {(boqResponse?.solutions)?.map((sol: Solution, idx: number) => {
                    const firstVs = sol.vendorSubmissions?.[0];
                    const items =
                      firstVs?.configs?.flatMap((c: Config) => c.items) || [];
                    return (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-surface-card/60 p-3 rounded border border-white/5 hover:border-white/10"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                          <div>
                            <p className="text-xs font-bold text-white">
                              {firstVs?.label || sol.name}
                            </p>
                            <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                              {items.length} hardware items mapped natively
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-mono font-bold text-white">
                            ${firstVs?.totalPrice?.toLocaleString()}
                          </p>
                          <p className="text-[9px] text-emerald-400 font-medium">
                            calculated sav. $
                            {firstVs?.savings?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  id="split-and-provision-btn"
                  type="button"
                  aria-label="Split configurations into active UCIDs"
                  onClick={onSplitAndProvision}
                  className="px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold cursor-pointer transition flex items-center gap-2 shadow-lg shadow-sky-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 text-[11px]"
                >
                  <span>Split Configs into Active UCIDs</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {boqError && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{boqError}</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-surface-elevated border border-white/5 rounded-xl p-5 space-y-4">
          <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">
            Config Intake Protocol
          </h4>
          <p className="text-gray-400 leading-relaxed text-[11px]">
            By routing raw BOQ docs centrally through the Ingestion Hub, our
            platform guarantees instant database alignment.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-semibold text-white text-xs">
                  Strict Vendor Decoupling
                </span>
                <p className="text-gray-500 text-[10px] mt-0.5">
                  Configs are programmatically split by supplier types so they
                  never taint or interfere with each other during procurement
                  comparisons.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-semibold text-white text-xs">
                  Live Sourced Verification
                </span>
                <p className="text-gray-500 text-[10px] mt-0.5">
                  Immediately registers active sessions via real REST APIs,
                  saving developers from manually injecting complex data frames.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
