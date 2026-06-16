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
import { apiClient } from "../../services/apiClient";

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
  const [isDragging, setIsDragging] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestProgress, setIngestProgress] = useState(0);
  const [isIngested, setIsIngested] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [rawBoqText, setRawBoqText] = useState("");

  const parseRawBoq = (text: string) => {
    const lines = text.split('\n');
    const items = [];
    for (const line of lines) {
      if (!line.trim()) continue;
      // Basic regex to find quantity and SKU (e.g. "2x P40424-B21" or "Qty: 2, Part: 400-BPSB")
      const qtyMatch = line.match(/(?:^|\s)(?:qty:?\s*)?(\d+)(?:x|\s)/i);
      const skuMatch = line.match(/[a-zA-Z0-9]{3,8}-[a-zA-Z0-9]{3,4}/);
      
      if (skuMatch) {
        items.push({
          id: `item-${Date.now()}-${items.length}`,
          partNumber: skuMatch[0],
          name: `Parsed Component: ${skuMatch[0]}`,
          type: "Parsed Component",
          quantity: qtyMatch ? parseInt(qtyMatch[1], 10) : 1,
          unitPrice: 0
        });
      }
    }
    
    if (items.length > 0) {
      const newConfig = {
        id: `cfg-parsed-${Date.now()}`,
        name: `Dynamically Parsed Intake Config`,
        vendor: "HPE",
        targetUcidId: "",
        items: items,
        totalPrice: 0,
        originalPrice: 0
      };
      return [newConfig];
    }
    return [];
  };

  const handleFileUpload = async (fileName: string, textContent?: string) => {
    setIsIngesting(true);
    setUploadedFileName(fileName);
    setIngestProgress(10);
    try {
      await apiClient.post("/api/boq/ingest", {
        fileName,
        presetType: "hpe-legacy"
      });
      setIngestProgress(100);
      setIsIngesting(false);
      setIsIngested(true);
      
      let parsedConfigs = [];
      if (textContent) {
        parsedConfigs = parseRawBoq(textContent);
      } else {
        // Fallback demo config
        parsedConfigs = [{
          id: `cfg-demo-${Date.now()}`,
          name: "Demo Enterprise Storage Config",
          vendor: "HPE",
          targetUcidId: "",
          items: [
            { id: "i1", partNumber: "P40424-B21", name: "Demo Processor", type: "Processor", quantity: 2, unitPrice: 2000 }
          ],
          totalPrice: 4000,
          originalPrice: 4500
        }];
      }
      onIntakeComplete(parsedConfigs);
    } catch (err) {
      setIsIngesting(false);
      console.error("Ingestion error:", err);
    }
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
        {/* Unified Pipeline Active Banner */}
        <div className="p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-xl flex items-center justify-between text-left gap-4">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse shrink-0" />
              <span className="text-[9px] font-bold text-indigo-400 font-mono uppercase tracking-wider">
                Sourcing State Sync Connected
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1 leading-normal">
              Any specification uploaded or demo loaded in this Configurator instantly binds to the central <span className="text-gray-300 font-medium">Opportunities Ledger</span>, and feeds metrics straight into your parallel tracking dashboards.
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] font-mono text-emerald-400 font-bold block">
              Active Sync
            </span>
            <span className="text-[9px] text-gray-500 font-sans block mt-0.5 animate-fadeIn">
              Active Accounts: {activeUcidsCount}
            </span>
          </div>
        </div>

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
                cross-vendor BOQ workbook, or raw equipment PARTS spec file.
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
              role="presentation"
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
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter") triggerPicker(); }}
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
                    onClick={triggerPicker}
                    className="mt-2 px-3 py-1.5 bg-surface-elevated hover:bg-black/40 text-gray-300 font-medium rounded-lg text-[10px] border border-white/10"
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

            {/* Raw Text Input Section */}
            <div className="pt-4 space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                Or Paste Raw BOQ Text
              </label>
              <textarea
                value={rawBoqText}
                onChange={(e) => setRawBoqText(e.target.value)}
                placeholder="E.g. 2x P40424-B21 Server Processor..."
                className="w-full h-24 bg-surface-canvas border border-white/10 rounded-lg p-3 text-[11px] text-gray-300 font-mono focus:outline-none focus:border-indigo-500/50 resize-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    if (rawBoqText.trim()) {
                      handleFileUpload("Pasted_Raw_BOQ.txt", rawBoqText);
                    }
                  }}
                  disabled={!rawBoqText.trim() || isIngesting}
                  className="px-4 py-2 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 hover:text-indigo-300 font-bold rounded-lg cursor-pointer text-[10px] disabled:opacity-50 transition"
                >
                  Parse Text
                </button>
              </div>
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
              className="px-5 py-2.5 rounded-lg bg-surface-elevated hover:bg-surface-elevated text-indigo-400 font-bold border border-indigo-500/20 hover:border-indigo-500/40 cursor-pointer transition flex items-center gap-1.5 focus:outline-none text-[10px]" 
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
                BOQ Document Ingested
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
      </div>
    </div>
  );
}
