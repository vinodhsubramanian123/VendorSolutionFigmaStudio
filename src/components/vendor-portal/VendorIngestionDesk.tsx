import React, { useState } from 'react';
import { Upload, Sparkles } from 'lucide-react';
import type { UCID, BOMItem } from '../../types';
import { Select } from '../shared/Select';
import { Button } from '../shared/Button';

interface VendorIngestionDeskProps {
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  showToast: (message: string, type: "success" | "warn" | "error") => void;
}

export function VendorIngestionDesk({
  ucids,
  setUcids,
  showToast,
}: VendorIngestionDeskProps) {
  // File Upload states
  const [targetUcidId, setTargetUcidId] = useState<string>(
    ucids[0]?.id || "u1",
  );
  const [selectedVendorChannel, setSelectedVendorChannel] = useState<string>("HPE");
  const [dragActive, setDragActive] = useState(false);
  const [uploadedBOMName, setUploadedBOMName] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const targetUcid = ucids.find((u) => u.id === targetUcidId);

  // Dynamic injection of parsed items into the active UCID solutions
  function injectBOMItems(
    vendorLabel: string,
    filename: string,
    customItems: BOMItem[],
    simulatedSavings = 10000,
  ) {
    setIsUploading(true);

    setTimeout(() => {
      setIsUploading(false);
      setUploadedBOMName(filename);

      setUcids((prevUcids) => {
        return prevUcids.map((u) => {
          if (u.id === targetUcidId) {
            // Find if there's already an existing master solution. If not, create one.
            let updatedSolutions = [...u.solutions];
            if (updatedSolutions.length === 0) {
              updatedSolutions.push({
                id: `sol-master-${u.id}`,
                name: "Master Architectural Solution",
                targetUcidId: u.id,
                vendorSubmissions: [],
              });
            }

            const masterSolution = updatedSolutions[0];
            const originalSum = customItems.reduce(
              (acc, current) => acc + current.unitPrice * current.quantity,
              0,
            );
            const computedPrice = originalSum - simulatedSavings;

            const matchIndex = masterSolution.vendorSubmissions.findIndex(
              (vs) => vs.vendor.toLowerCase() === vendorLabel.toLowerCase(),
            );

            const newSubmission = {
              id: `vs-manual-${vendorLabel.toLowerCase()}-${Date.now()}`,
              vendor: vendorLabel,
              label: `${vendorLabel} Manual Upload — Sourced from ${filename}`,
              totalPrice: computedPrice,
              originalPrice: originalSum,
              savings: simulatedSavings,
              complianceScore: 98,
              configs: [
                {
                  id: `cfg-manual-${vendorLabel.toLowerCase()}`,
                  name: "Manual Parse Config",
                  totalPrice: computedPrice,
                  originalPrice: originalSum,
                  savings: simulatedSavings,
                  items: customItems,
                },
              ],
            };

            if (matchIndex !== -1) {
              masterSolution.vendorSubmissions[matchIndex] = newSubmission;
            } else {
              masterSolution.vendorSubmissions.push(newSubmission);
            }

            // Move currentStep to 'comparison' if it was in boq-intake to demonstrate progress
            const nextStep =
              u.currentStep === "boq-intake"
                ? "pre-intelligence"
                : u.currentStep;

            return {
              ...u,
              solutions: updatedSolutions,
              currentStep: nextStep as any,
              completedSteps: Array.from(
                new Set([...u.completedSteps, "boq-intake"]),
              ) as any,
              events: [
                ...u.events,
                {
                  ts: new Date().toLocaleTimeString(),
                  level: "ok",
                  msg: `Manual Sourcing BOM Ingested: file "${filename}" parsed into ${vendorLabel} configuration alternative ($${computedPrice.toLocaleString()}).`,
                },
              ],
            };
          }
          return u;
        });
      });

      showToast(
        `Document parsed! ${vendorLabel} alternative dynamically generated.`,
        "success",
      );
    }, 1200);
  }

  // Pre-configured manual upload scenarios
  function handleScenarioUpload(type: "hpe-legacy" | "dell-overcharge") {
    if (type === "hpe-legacy") {
      const items: BOMItem[] = [
        {
          id: "item-h1",
          partNumber: "P40411-B21",
          name: "HPE ProLiant DL380 Gen11 CTO Chassis",
          type: "Chassis",
          quantity: 10,
          unitPrice: 3400,
        },
        {
          id: "item-h2",
          partNumber: "815100-B21",
          name: "Intel Xeon Gold 6130 Processor (EOL Alert Line)",
          type: "Processor",
          quantity: 20,
          unitPrice: 1890,
        }, // EOL!
        {
          id: "item-h3",
          partNumber: "P38454-B21",
          name: "HPE 64GB DDR5 RDIMM RAM Kit",
          type: "Memory",
          quantity: 80,
          unitPrice: 580,
        },
      ];
      injectBOMItems("HPE", "HPE_PARTNER_QUOTE_6130_EOL.xlsx", items, 8000);
    } else {
      const items: BOMItem[] = [
        {
          id: "item-d1",
          partNumber: "210-BFXS",
          name: "Dell PowerEdge R760 8SFF Motherboard Chassis",
          type: "Chassis",
          quantity: 12,
          unitPrice: 3250,
        },
        {
          id: "item-d2",
          partNumber: "400-BPSB",
          name: "Dell 3.84TB SAS Read Intensive SSD SFF (Markup Alert Line)",
          type: "Drive",
          quantity: 24,
          unitPrice: 1590,
        }, // Overcharged! API list says $1,190
        {
          id: "item-d3",
          partNumber: "370-AHFF",
          name: "Dell 64GB RDIMM 4800MT/s Dual Rank DDR5 memory",
          type: "Memory",
          quantity: 48,
          unitPrice: 595,
        },
      ];
      injectBOMItems("Dell", "DELL_PREMIER_QUOTE_DRAFT.csv", items, 15000);
    }
  }

  // Custom File drop handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const customItems: BOMItem[] = [
        {
          id: "item-drop1",
          partNumber: "GENERIC-CHASSIS-1",
          name: "Custom Imported Chassis Base",
          type: "Chassis",
          quantity: 4,
          unitPrice: 2900,
        },
        {
          id: "item-drop2",
          partNumber: "P40424-B21",
          name: "Intel Xeon Gold 6430 Processor",
          type: "Processor",
          quantity: 8,
          unitPrice: 2150,
        },
        {
          id: "item-drop3",
          partNumber: "P38454-B21",
          name: "HPE 64GB DDR5 memory module",
          type: "Memory",
          quantity: 32,
          unitPrice: 580,
        },
      ];
      injectBOMItems(selectedVendorChannel, file.name, customItems, 12000);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  return (
    <div className="p-4 rounded-xl border bg-surface-elevated/80 border-indigo-500/15 flex flex-col gap-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs text-white font-bold uppercase tracking-wider">
            BOM Ingestion & Crawling
          </h3>
        </div>
        <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
      </div>

      <p className="text-[10.5px] text-gray-400 leading-normal">
        Inject manual competitor quotation workbooks or execute Playwright
        automated scraping to populate active solutions.
      </p>

      {/* Target Profile Binding Selection */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
          Target Workflow Profile (UCID)
        </label>
        <Select
          value={targetUcidId}
          onChange={(e) => setTargetUcidId(e.target.value)}
        >
          {ucids.map((u) => (
            <option key={u.id} value={u.id}>
              {u.displayId} — {u.name}
            </option>
          ))}
        </Select>
        {targetUcid && (
          <p className="text-[9.5px] text-indigo-400 mt-1 font-mono">
            Current Status in Pipeline:{" "}
            {targetUcid.currentStep.toUpperCase()}
          </p>
        )}
      </div>

      {/* Selector of which manufacturer the quote belongs to */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
          Distributor Channel
        </label>
        <div className="grid grid-cols-3 gap-2">
          {["HPE", "Dell", "Cisco"].map((ch) => (
            <Button
              key={ch}
              size="sm"
              variant={selectedVendorChannel === ch ? "primary" : "outline"}
              onClick={() => setSelectedVendorChannel(ch)}
            >
              {ch} Gate
            </Button>
          ))}
        </div>
      </div>

      {/* Drag and Drop Box */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border border-dashed rounded-xl p-5 text-center flex flex-col items-center justify-center gap-2.5 transition ${
          dragActive
            ? "border-indigo-400 bg-indigo-500/5"
            : "border-white/10 bg-black/20 hover:border-white/15"
        }`}
      >
        <Upload
          className={`w-8 h-8 ${dragActive ? "text-indigo-400 animate-bounce" : "text-gray-600"}`}
        />
        <div className="space-y-1">
          <p className="text-[11px] text-white font-semibold">
            Drag & Drop Competitor quote file here
          </p>
          <p className="text-[9.5px] text-gray-500">
            Supports Excel (.xlsx, .xls) and Tabular CSV data
          </p>
        </div>

        <div className="w-full flex items-center justify-center gap-1.5 border-t border-white/5 pt-2 mt-1">
          <input
            type="file"
            id="bom-manual-file-selector"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const customItems: BOMItem[] = [
                  {
                    id: "item-f1",
                    partNumber: "GENERIC-SER-101",
                    name: "Custom Imported Server Blade Base",
                    type: "Chassis",
                    quantity: 6,
                    unitPrice: 3100,
                  },
                  {
                    id: "item-f2",
                    partNumber: "P40424-B21",
                    name: "Intel Xeon Gold 6430 Processor",
                    type: "Processor",
                    quantity: 12,
                    unitPrice: 2150,
                  },
                  {
                    id: "item-f3",
                    partNumber: "P38454-B21",
                    name: "HPE 64GB DDR5 memory module",
                    type: "Memory",
                    quantity: 48,
                    unitPrice: 580,
                  },
                ];
                injectBOMItems(
                  selectedVendorChannel,
                  file.name,
                  customItems,
                  9500,
                );
              }
            }}
          />
          <label
            htmlFor="bom-manual-file-selector"
            className="text-[9px] bg-white/5 hover:bg-white/10 text-gray-300 font-bold px-3 py-1.5 rounded cursor-pointer transition border border-white/5 uppercase tracking-wide inline-block"
          >
            Browse Document
          </label>
        </div>
      </div>

      {/* Quick Demo Contract Injection Scenarios */}
      <div className="bg-black/30 rounded-lg p-3 border border-white/5 space-y-2">
        <span className="text-[9px] uppercase font-black text-indigo-400 tracking-wider">
          💡 Mock Simulation Presets
        </span>
        <p className="text-[9.5px] text-gray-400 leading-normal">
          Quickly load representative customer quote workbooks directly
          into the data matrix to trigger forensic compliance scenarios:
        </p>
        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[9px]">
          <button
            type="button"
            onClick={() => handleScenarioUpload("hpe-legacy")}
            className="p-1 px-1.5 rounded bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-amber-400 text-left cursor-pointer transition"
          >
            ● HPE EOL Quote
          </button>
          <button
            type="button"
            onClick={() => handleScenarioUpload("dell-overcharge")}
            className="p-1 px-1.5 rounded bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-rose-400 text-left cursor-pointer transition"
          >
            ● Dell Price Discrepancy
          </button>
        </div>
      </div>

    </div>
  );
}
