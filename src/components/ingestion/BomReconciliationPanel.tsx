import React from "react";
import {
  RefreshCw,
  Upload,
  
  CheckCircle,
  AlertTriangle,
  
  
  
  
  
  ChevronRight,
  FileSpreadsheet
} from "lucide-react";
import { StatusBadge } from "../shared/StatusBadge";
import type { UCID, ConstraintCheckResponse, ReconciliationResponse } from "../../types";
import { BomPhysicalConstraintsPanel, BomReconstructionMatrix } from "./BomPanels";
interface BomReconciliationPanelProps {
  targetUcid: UCID | undefined;
  bomVerifyResult: ConstraintCheckResponse | null;
  bomReconResult: ReconciliationResponse | null;
  activeBOMFile: string;
  isBOMIngesting: boolean;
  bomProgress: number;
  bomError: string;
  selectedUcidId: string;
  onTriggerBOMParse: (fileName: string) => void;
  onSelectMission: (id: string) => void;
}
export function BomReconciliationPanel({
  targetUcid,
  bomVerifyResult,
  bomReconResult,
  activeBOMFile,
  isBOMIngesting,
  bomProgress,
  bomError,
  selectedUcidId,
  onTriggerBOMParse,
  onSelectMission,
}: BomReconciliationPanelProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleBOMDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onTriggerBOMParse(e.dataTransfer.files[0].name);
    }
  };
  const handleBOMPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onTriggerBOMParse(e.target.files[0].name);
    }
  };
  return (
    <div className="lg:col-span-3 space-y-4 text-left">
      <div className="bg-surface-elevated border border-white/5 rounded-xl p-6 space-y-6">
        <div>
        <StatusBadge status="Step 2: Technical Matching" variant="info" />
          <h3 className="text-sm font-semibold text-white mt-1.5">
            Validate Manufacturer Signed BOM Sheet
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
            Upload individual supplier BOM lists to cross-reference against
            central pricing contracts and check hardware sockets or memory
            limits.
          </p>
        </div>
        {/* BOM Upload Dropzone */}
        { }
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div
          id="bom-dropzone"
          onDragOver={handleDragOver}
          onDrop={handleBOMDrop}
          onClick={() => document.getElementById("hub-bom-picker")?.click()}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative overflow-hidden bg-black/10 hover:bg-black/20 hover:border-sky-500/40 ${
            isBOMIngesting ? "border-sky-500" : "border-white/10"
          }`}
        >
          <input
            id="hub-bom-picker"
            type="file"
            onChange={handleBOMPicked}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />
          {isBOMIngesting ? (
            <div className="space-y-3 flex flex-col items-center">
              <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
              <p className="text-xs font-bold text-white">
                Interrogating taxonomy constraints and contract catalogs...
              </p>
              <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden text-left">
                <div
                  className="h-full bg-sky-500 transition-all duration-200"
                  style={{
                    width: `${bomProgress}%`,
                    transition: "width 0.2s",
                  }}
                />
              </div>
            </div>
          ) : bomReconResult ? (
            <div className="space-y-2 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <p className="text-xs font-black text-emerald-300">
                  {activeBOMFile || "supplier-bom.xlsx"}
                </p>
                <p className="text-[9px] text-gray-500 font-mono mt-0.5 uppercase">
                  Reconciliation audit successfully synthesized
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 flex flex-col items-center text-gray-400 hover:text-white">
              <Upload className="w-9 h-9 text-gray-500 hover:text-sky-400 transition-colors" />
              <div>
                <p className="text-xs font-bold text-gray-300">
                  Drag & Drop BOM spreadsheet here, or click to browse
                </p>
                <p className="text-[9px] text-gray-500 mt-0.5 uppercase">
                  Runs compliance verification and vendor cost variance
                  matrix checks
                </p>
              </div>
            </div>
          )}
        </div>
        {/* API Trigger Buttons */}
        {!bomReconResult && !isBOMIngesting && (
          <div className="flex justify-center select-none">
            <button
              id="run-bom-audit-btn"
              type="button"
              onClick={() => {
                const suffix =
                  targetUcid?.solutions[0]?.vendorSubmissions?.[0]?.vendor?.toLowerCase() ||
                  "vendor";
                onTriggerBOMParse(`manufacturer_signed_${suffix}_bom.xlsx`);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/15 border border-sky-500/20 text-sky-400 font-bold cursor-pointer transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 text-[10px]"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>
                Run Technical BOM Audits & Compare (Simulation Sandbox)
              </span>
            </button>
          </div>
        )}
        {/* Dynamic Verification Output panels */}
        {bomReconResult && (
          <div className="space-y-6 pt-4 border-t border-white/5 animate-fadeIn text-left">
            {bomVerifyResult && (
              <BomPhysicalConstraintsPanel bomVerifyResult={bomVerifyResult} />
            )}
            {/* Synthesis Overview info */}
            <BomReconstructionMatrix bomReconResult={bomReconResult} />
            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-emerald-400 font-mono block">
                ✔ Sourcing database instance is completely synced & active.
              </span>
              <button
                id="track-mission-btn"
                type="button"
                onClick={() => onSelectMission(selectedUcidId)}
                className="px-5 py-2 rounded bg-surface-elevated hover:bg-black/40 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-bold cursor-pointer transition flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 text-[10px]"
              >
                <span>Track progress in Live Mission</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        {bomError && (
          <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{bomError}</span>
          </div>
        )}
      </div>
    </div>
  );
}