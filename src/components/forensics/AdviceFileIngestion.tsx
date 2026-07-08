import React, { useState, useRef } from "react";
import { Upload, FileSpreadsheet, AlertCircle, ListFilter, FileText, Check, ArrowUpRight } from "lucide-react";
import { apiClient } from "../../services/apiClient";

import { motion, AnimatePresence } from "motion/react";

export type AdviceSeverity = "critical" | "warning" | "info";
type BomRowValue = string | number | boolean | null;

export interface AdviceTriageItem {
  id: string;
  ruleNumber: string | number;
  productNumber: string;
  adviceText: string;
  severity: AdviceSeverity;
  vendor: string;
  drafted?: boolean;
}
interface AdviceFileIngestionProps {
  onDraftAdviceRule: (item: AdviceTriageItem) => void;
  adviceItems: AdviceTriageItem[];
  setAdviceItems: React.Dispatch<React.SetStateAction<AdviceTriageItem[]>>;
  bomItems: Record<string, BomRowValue>[];
  setBomItems: React.Dispatch<React.SetStateAction<Record<string, BomRowValue>[]>>;
  configRows: Record<string, BomRowValue>[];
  setConfigRows: React.Dispatch<React.SetStateAction<Record<string, BomRowValue>[]>>;
  uploadSuccess: boolean;
  setUploadSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  ignoredSheets: string[];
  setIgnoredSheets: React.Dispatch<React.SetStateAction<string[]>>;
}
export function AdviceFileIngestion({
  onDraftAdviceRule,
  adviceItems,
  setAdviceItems,
  bomItems,
  setBomItems,
  configRows,
  setConfigRows,
  uploadSuccess,
  setUploadSuccess,
  ignoredSheets,
  setIgnoredSheets
}: AdviceFileIngestionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileSubTab, setFileSubTab] = useState<"advice" | "bom" | "config">("advice");
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUpload(file);
    }
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUpload(file);
    }
  };
  const processUpload = async (file: File) => {
    setUploadedFile(file);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await apiClient.postForm<{
        adviceItems: AdviceTriageItem[];
        bomItems: Record<string, BomRowValue>[];
        configRows: Record<string, BomRowValue>[];
        ignoredSheets: string[];
      }>("/api/agents/parse-advice-file", formData);
      if (res.success && res.data) {
        setAdviceItems(res.data.adviceItems || []);
        setBomItems(res.data.bomItems || []);
        setConfigRows(res.data.configRows || []);
        setIgnoredSheets(res.data.ignoredSheets || []);
        setUploadSuccess(true);
        setFileSubTab("advice");
      }
    } catch (err) {
      console.error("API parsing failed:", err);
    }
  };
  const handleResetUpload = () => {
    setUploadedFile(null);
    setAdviceItems([]);
    setBomItems([]);
    setConfigRows([]);
    setIgnoredSheets([]);
    setUploadSuccess(false);
  };
  return (
    <div className="p-4 flex flex-col gap-4 max-h-[380px] overflow-y-auto custom-scrollbar flex-1">
      {!uploadSuccess ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload CLIC Validation Advice sheet"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInputRef.current?.click(); } }}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer ${
            isDragging 
              ? "border-brand-indigo bg-brand-indigo/10 text-content-primary" 
              : "border-white/10 hover:border-white/20 bg-white/2 text-content-secondary"
          }`}
        >
          <Upload className="w-8 h-8 text-brand-indigo" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-content-primary">Drag & drop CLIC Validation Advice sheet</p>
            <p className="text-[10px] text-content-primary0">Supports .xlsx or .csv files containing multiple sheets (Validation, BOM, Config)</p>
          </div>
          
          <label
            className="mt-2 px-3 py-1.5 bg-brand-indigo text-content-primary text-[10px] font-bold rounded-lg cursor-pointer hover:bg-brand-indigo transition uppercase tracking-wide"
          >
            Browse Files
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onClick={(e) => e.stopPropagation()}
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-status-success/10 border border-status-success/20 p-2.5 rounded-lg text-left">
            <div className="flex items-center gap-2 min-w-0">
              <FileSpreadsheet className="w-4.5 h-4.5 text-status-success shrink-0" />
              <div className="min-w-0">
                <p className="text-[10.5px] font-bold text-content-primary truncate">{uploadedFile?.name || "advice_document.xlsx"}</p>
                <p className="text-[9.5px] text-content-secondary">
                  {adviceItems.length} Warnings · {bomItems.length} BOM Items · {configRows.length} Config Records
                </p>
              </div>
            </div>
            <button type="button" 
              onClick={handleResetUpload}
              className="text-[9.5px] font-bold text-status-error hover:text-red-300 border border-status-error/20 hover:bg-status-error/10 px-2 py-1 rounded transition cursor-pointer"
            >
              Clear
            </button>
          </div>
          {ignoredSheets.length > 0 && (
            <div className="bg-status-warning/10 border border-status-warning/20 p-2.5 rounded-lg text-left flex items-start gap-2 text-[10px] text-amber-200 leading-normal">
              <AlertCircle className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
              <div>
                <strong>Ignored Sheet(s):</strong> {ignoredSheets.join(", ")}
                <p className="text-[9px] text-amber-300/80 mt-0.5">
                  Topology, taxonomy, or count summary sheets are bypassed. Ingestion is filtered to Advice text rules & BOM configuration items (processed by backend).
                </p>
              </div>
            </div>
          )}
          <div className="flex bg-surface-canvas/25 border border-white/5 rounded-lg p-0.5 shrink-0 text-[10px]">
            <button type="button"
              onClick={() => setFileSubTab("advice")}
              className={`flex-1 py-1 rounded font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                fileSubTab === "advice" 
                  ? "bg-brand-indigo/25 text-content-primary" 
                  : "text-content-secondary hover:text-content-primary"
              }`}
            >
              <AlertCircle className="w-3 h-3 text-brand-indigo" />
              Validation Messages ({adviceItems.length})
            </button>
            <button type="button"
              onClick={() => setFileSubTab("bom")}
              className={`flex-1 py-1 rounded font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                fileSubTab === "bom" 
                  ? "bg-brand-indigo/25 text-content-primary" 
                  : "text-content-secondary hover:text-content-primary"
              }`}
            >
              <ListFilter className="w-3 h-3 text-brand-indigo" />
              BOM Items ({bomItems.length})
            </button>
            <button type="button"
              onClick={() => setFileSubTab("config")}
              className={`flex-1 py-1 rounded font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                fileSubTab === "config" 
                  ? "bg-brand-indigo/25 text-content-primary" 
                  : "text-content-secondary hover:text-content-primary"
              }`}
            >
              <FileText className="w-3 h-3 text-brand-indigo" />
              Temp Config Trk ({configRows.length})
            </button>
          </div>
          <div className="min-h-0">
            {fileSubTab === "advice" && (
              <div className="space-y-2.5">
                {adviceItems.length > 0 ? (
                  <motion.div layout className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {adviceItems.map((item) => {
                        const inActiveBOM = bomItems.some(bom => {
                          const bomSku = String(bom["Product #"] || bom["Product Number"] || bom["SKU"] || "").trim().split(/\s+/)[0];
                          return bomSku && String(item.productNumber).includes(bomSku);
                        });
                        return (
                          <motion.div 
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            key={item.id} 
                            className={`p-3 rounded-lg border text-left flex flex-col gap-2 transition-all duration-200 ${
                            item.drafted 
                              ? "bg-status-success/5 border-status-success/40 opacity-70" 
                              : "bg-surface-elevated/60 border-white/5 hover:border-white/10"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase font-mono ${
                                item.severity === "critical" 
                                  ? "bg-status-error/15 text-status-error border border-status-error/20" 
                                  : "bg-status-warning/15 text-status-warning border border-status-warning/20"
                              }`}>
                                {item.severity}
                              </span>
                              <span className="text-[10px] font-mono text-content-secondary font-bold">
                                {item.productNumber}
                              </span>
                              {inActiveBOM && (
                                <span className="bg-status-success/15 text-status-success border border-status-success/20 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase">
                                  In Active BOM
                               </span>
                              )}
                            </div>
                            <span className="text-[9px] text-content-primary0 font-mono">
                              Rule ID: {item.ruleNumber}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-content-secondary leading-relaxed font-medium whitespace-pre-wrap">
                            {item.adviceText}
                          </p>
                          <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-1">
                            <span className="text-[9.5px] text-content-primary0 font-mono">
                              Vendor Class: <span className="text-brand-indigo font-bold">{item.vendor}</span>
                            </span>
                            
                            <button type="button"
                              onClick={() => !item.drafted && onDraftAdviceRule(item)}
                              disabled={item.drafted}
                              className={`px-2 py-1 rounded text-[9.5px] font-bold uppercase transition flex items-center gap-1 border cursor-pointer ${
                                item.drafted
                                  ? "bg-status-success/10 border-status-success/20 text-status-success"
                                  : "bg-brand-indigo/10 border-brand-indigo/20 hover:bg-brand-indigo/20 text-indigo-300 hover:text-content-primary"
                              }`}
                            >
                              {item.drafted ? (
                                <>
                                  <Check className="w-3 h-3" /> Drafted
                                </>
                              ) : (
                                <>
                                  <ArrowUpRight className="w-3 h-3" /> Auto-Draft Rule
                                </>
                              )}
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <div className="text-center py-6 text-xs text-content-primary0 italic">
                    No validation issues discovered in sheet.
                  </div>
                )}
              </div>
            )}
            {fileSubTab === "bom" && (
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 text-left custom-scrollbar">
                {bomItems.length > 0 ? (
                  <table className="w-full border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-surface-canvas/30 text-content-primary0 uppercase font-mono border-b border-white/5 select-none">
                        <th className="p-2">Part Number</th>
                        <th className="p-2">Description</th>
                        <th className="p-2 text-center">Qty</th>
                        <th className="p-2 text-right">Price (USD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <AnimatePresence mode="popLayout">
                        {bomItems.map((item, idx) => {
                          const part = String(item["Product #"] || item["Product Number"] || item["SKU"] || "Unknown");
                          const desc = String(item["Product Description"] || item["Description"] || "");
                          const qty = item["Qty"] || item["Quantity"] || 1;
                          const price = item["Unit Price (USD)"] || item["Price"] || "0.00";
                          return (
                            <motion.tr 
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              key={idx} 
                              className="hover:bg-white/2 font-mono text-content-secondary"
                            >
                            <td className="p-2 font-bold text-content-primary whitespace-nowrap">{part}</td>
                            <td className="p-2 max-w-[150px] truncate text-content-secondary" title={desc}>{desc}</td>
                            <td className="p-2 text-center">{qty}</td>
                            <td className="p-2 text-right text-status-success">${Number(price).toLocaleString()}</td>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-6 text-xs text-content-primary0 italic">
                    No BOM configuration items discovered.
                  </div>
                )}
              </div>
            )}
            {fileSubTab === "config" && (
              <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1 text-left custom-scrollbar">
                {configRows.length > 0 ? (
                  <div className="bg-surface-canvas/25 border border-white/5 rounded-lg p-2.5 font-mono text-[9px] text-content-secondary space-y-1">
                    {configRows.map((row, idx) => {
                      if (typeof row.line === 'string') {
                        return <div key={idx} className="whitespace-pre truncate">{row.line}</div>;
                      }
                      return (
                        <div key={idx} className="flex justify-between hover:bg-white/2 py-0.5 border-b border-white/2">
                          <span className="text-brand-indigo font-bold">{row["Parameter"] || row["Key"] || Object.keys(row)[0] || `Rec-${idx}`}</span>
                          <span className="text-content-secondary">{row["Value"] || row[Object.keys(row)[0]] || ""}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-content-primary0 italic">
                    No configuration track history discovered.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}