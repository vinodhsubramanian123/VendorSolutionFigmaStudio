import React, { useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  FileText,
  FileSpreadsheet,
  File,
  X,
  Loader2,
} from "lucide-react";
import { useToast } from "../shared/ToastContext";
import { apiClient } from "../../services/apiClient";
import type { DocIngestionJob, DocCategory, DocStatus } from "./types";

const DOC_ICON: Record<DocCategory, React.ElementType> = {
  pdf: FileText,
  excel: FileSpreadsheet,
  txt: FileText,
  csv: FileSpreadsheet,
  other: File,
};

const STATUS_STYLES: Record<DocStatus, { color: string; bg: string; border: string; label: string }> = {
  queued:     { color: "text-gray-400",    bg: "bg-white/5",         border: "border-white/8",          label: "Queued" },
  processing: { color: "text-indigo-400",  bg: "bg-indigo-500/8",    border: "border-indigo-500/20",    label: "Processing" },
  extracting: { color: "text-amber-400",   bg: "bg-amber-500/8",     border: "border-amber-500/20",     label: "Extracting" },
  completed:  { color: "text-emerald-400", bg: "bg-emerald-500/8",   border: "border-emerald-500/20",   label: "Completed" },
  failed:     { color: "text-red-400",     bg: "bg-red-500/8",       border: "border-red-500/20",       label: "Failed" },
};

function getCategory(filename: string): DocCategory {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf") return "pdf";
  if (["xlsx", "xls"].includes(ext)) return "excel";
  if (ext === "txt") return "txt";
  if (ext === "csv") return "csv";
  return "other";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function DocumentPipelinePanel() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [jobs, setJobs] = useState<DocIngestionJob[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const startJobProcessing = useCallback(async (job: DocIngestionJob) => {
    const steps = ["init", "parse", "ocr", "extract", "rules", "complete"];
    for (const step of steps) {
      try {
        const res = await fetch("/api/pipeline/step", {
          method: "POST",
          body: JSON.stringify({ jobId: job.id, step })
        });
        const json = await res.json();
        const data = json.data;

        setJobs((prev) =>
          prev.map((j) =>
            j.id === job.id
              ? {
                  ...j,
                  progress: data.progress,
                  status: data.status,
                  logLines: [...j.logLines, `[${new Date().toLocaleTimeString()}] ${data.log}`],
                  ...(data.status === "completed" ? { completedAt: new Date().toISOString(), extractedCount: data.extractedCount } : {}),
                  ...(step === "init" ? { startedAt: new Date().toISOString() } : {}),
                }
              : j
          )
        );

        if (data.status === "completed") {
          toast(`Document "${job.filename}" processed — intelligence extracted!`, "success");
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, [toast]);

  const processFiles = useCallback((files: File[]) => {
    const validFiles = files.filter((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() || "";
      return ["pdf", "xlsx", "xls", "txt", "csv", "docx"].includes(ext);
    });

    if (validFiles.length === 0) {
      toast("Unsupported file type. Accepted: PDF, Excel, TXT, CSV.", "warn");
      return;
    }

    if (validFiles.length !== files.length) {
      toast(`${files.length - validFiles.length} file(s) skipped — unsupported format.`, "warn");
    }

    const newJobs: DocIngestionJob[] = validFiles.map((f) => ({
      id: `job-${crypto.randomUUID()}`,
      filename: f.name,
      fileSize: f.size,
      category: getCategory(f.name),
      status: "queued",
      uploadedAt: new Date().toISOString(),
      progress: 0,
      logLines: [`[${new Date().toLocaleTimeString()}] [QUEUE] Job created for "${f.name}"`],
    }));

    setJobs((prev) => [...newJobs, ...prev]);
    toast(`${newJobs.length} document${newJobs.length > 1 ? "s" : ""} queued for processing.`, "success");
    newJobs.forEach((job) => { startJobProcessing(job); });
  }, [startJobProcessing, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  }, [processFiles]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
      e.target.value = "";
    }
  }, [processFiles]);

  const handleClearJob = useCallback((jobId: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
  }, []);

  const pipelineStats = useMemo(() => ({
    total: jobs.length,
    queued: jobs.filter((j) => j.status === "queued").length,
    running: jobs.filter((j) => j.status === "processing" || j.status === "extracting").length,
    completed: jobs.filter((j) => j.status === "completed").length,
    failed: jobs.filter((j) => j.status === "failed").length,
    extracted: jobs.reduce((acc, j) => acc + (j.extractedCount || 0), 0),
  }), [jobs]);

  return (
    <motion.div
      key="pipeline"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex flex-col gap-4"
    >
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Queued", value: pipelineStats.queued, color: "text-gray-300" },
          { label: "Running", value: pipelineStats.running, color: "text-indigo-400" },
          { label: "Completed", value: pipelineStats.completed, color: "text-emerald-400" },
          { label: "Failed", value: pipelineStats.failed, color: "text-red-400" },
          { label: "Rules Extracted", value: pipelineStats.extracted, color: "text-amber-400" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/5 bg-black/20 p-3 text-center">
            <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
            <p className="text-[9px] text-gray-500 uppercase tracking-wider mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload document files for intelligence extraction"
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
          isDragging
            ? "border-indigo-500/60 bg-indigo-500/8"
            : "border-white/10 bg-black/10 hover:border-indigo-500/30 hover:bg-indigo-500/5"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.xlsx,.xls,.txt,.csv,.docx"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
          isDragging ? "bg-indigo-500/20 border border-indigo-500/40" : "bg-white/5 border border-white/10"
        }`}>
          <Upload className={`w-6 h-6 ${isDragging ? "text-indigo-400" : "text-gray-500"}`} />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-white">
            {isDragging ? "Drop to queue for processing" : "Drop files or click to upload"}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">
            PDF · Excel · CSV · TXT · DOCX — multiple files processed in parallel
          </p>
          <p className="text-[10px] text-indigo-400 mt-1 font-mono">
            Intelligence rules extracted automatically · No race conditions
          </p>
        </div>
        {isDragging && (
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-indigo-500 pointer-events-none"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </div>

      {/* Job list */}
      {jobs.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
              Processing Queue ({jobs.length})
            </p>
            <button
              onClick={() => setJobs((prev) => prev.filter((j) => j.status !== "completed"))}
              className="text-[10px] text-gray-600 hover:text-gray-400 font-mono cursor-pointer transition"
            >
              Clear Completed
            </button>
          </div>
          <AnimatePresence initial={false}>
            {jobs.map((job) => {
              const cfg = STATUS_STYLES[job.status];
              const Icon = DOC_ICON[job.category];
              const isExpanded = expandedJobId === job.id;

              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  layout
                  className="rounded-xl border border-white/5 bg-black/20 overflow-hidden"
                >
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={`Toggle log for ${job.filename}`}
                    onKeyDown={(e) => { if (e.key === "Enter") setExpandedJobId(isExpanded ? null : job.id); }}
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/[0.015]"
                    onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-white truncate max-w-[200px]">{job.filename}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                          {cfg.label}
                        </span>
                        {job.extractedCount !== undefined && (
                          <span className="text-[9px] text-amber-400 font-mono">{job.extractedCount} rules</span>
                        )}
                      </div>
                      <p className="text-[9px] text-gray-500 mt-0.5">
                        {formatBytes(job.fileSize)} · {new Date(job.uploadedAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {(job.status === "processing" || job.status === "extracting") && (
                        <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                      )}
                      <span className="text-[10px] text-gray-500 font-mono w-8 text-right">{job.progress}%</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleClearJob(job.id); }}
                        aria-label={`Remove ${job.filename}`}
                        className="w-5 h-5 flex items-center justify-center rounded text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {job.status !== "queued" && (
                    <div className="h-0.5 bg-white/5">
                      <motion.div
                        className="h-full"
                        style={{
                          background: job.status === "completed"
                            ? "#00d4a0"
                            : job.status === "failed"
                            ? "#ff3d5a"
                            : job.status === "extracting"
                            ? "#ff9b36"
                            : "#4a85fd",
                        }}
                        animate={{ width: `${job.progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  )}

                  {/* Expanded log */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-white/5"
                      >
                        <div className="p-3 bg-black/30 font-mono text-[9px] text-gray-400 space-y-0.5 max-h-32 overflow-y-auto">
                          {job.logLines.map((line, idx) => (
                            <div
                              key={idx}
                              className={
                                line.includes("[DONE]")
                                  ? "text-emerald-400"
                                  : line.includes("[ERROR]")
                                  ? "text-red-400"
                                  : line.includes("[EXTRACT]") || line.includes("[RULES]")
                                  ? "text-amber-400"
                                  : "text-gray-400"
                              }
                            >
                              {line}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {jobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
          <p className="text-[11px] text-gray-600">No documents queued yet. Upload files above to begin extraction.</p>
        </div>
      )}
    </motion.div>
  );
}
