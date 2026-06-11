import React, { useState } from "react";
import { Radio, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UCID } from "../../types";
import { Select } from "../shared/Select";
import { Button } from "../shared/Button";

interface NewUCIDModalProps {
  onClose: () => void;
  onCreate: (ucid: UCID) => void;
}

export function NewUCIDModal({ onClose, onCreate }: NewUCIDModalProps) {
  const [ucidName, setUcidName] = useState("");
  const [ucidRef, setUcidRef] = useState("PRJ-2026-");
  const [priority, setPriority] = useState<
    "critical" | "high" | "medium" | "low"
  >("high");
  const [rawBOMText, setRawBOMText] = useState("");
  const [nameError, setNameError] = useState("");
  const [refError, setRefError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let hasError = false;

    if (!ucidName.trim()) {
      setNameError("Workspace Title / Brief Target is required.");
      hasError = true;
    } else {
      setNameError("");
    }

    if (!ucidRef.trim()) {
      setRefError("Project Code Ref is required.");
      hasError = true;
    } else {
      setRefError("");
    }

    if (hasError) return;

    const displayNum = Math.floor(1000 + Math.random() * 9000);
    const newUCID: UCID = {
      id: `u-${Date.now()}`,
      displayId: `UCID-2026-${displayNum}`,
      name: ucidName.trim(),
      priority,
      projectRef: ucidRef.trim(),
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      currentStep: "boq-intake",
      completedSteps: [],
      rawBOM: rawBOMText.trim() || "Ingested raw constraints.",
      solutions: [],
      events: [
        {
          ts: new Date().toLocaleTimeString(),
          level: "info",
          msg: "UCID pipeline registered successfully. Intake form completed.",
        },
      ],
      snapshots: [],
    };

    onCreate(newUCID);
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 select-none leading-normal">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-lg rounded-xl border p-5 space-y-4 bg-surface-header border-indigo-500/20 shadow-2xl shadow-black/50 relative z-10"
      >
        <div className="flex items-center justify-between pb-2 border-b border-indigo-500/10">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-indigo-400 animate-pulse" /> Register
            New UCID Parallel Flow
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-1 text-left">
            <label className="text-gray-400 font-semibold uppercase">
              Workspace Title / Brief Target
            </label>
            <input
              type="text"
              value={ucidName}
              onChange={(e) => {
                setUcidName(e.target.value);
                if (e.target.value.trim()) {
                  setNameError("");
                }
              }}
              placeholder="e.g. HPC Core Virtualization — 24 Node Cluster Gen11"
              className={`w-full p-2.5 rounded bg-black/30 border text-white transition-colors duration-200 ${
                nameError ? "border-[#ff3d5a]" : "border-white/10"
              }`}
            />
            <AnimatePresence>
              {nameError && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[#ff3d5a] text-[11px] font-semibold mt-1"
                >
                  {nameError}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 text-left">
              <label className="text-gray-400 font-semibold uppercase">
                Project Code Ref
              </label>
              <input
                type="text"
                value={ucidRef}
                onChange={(e) => {
                  setUcidRef(e.target.value);
                  if (e.target.value.trim()) {
                    setRefError("");
                  }
                }}
                className={`w-full p-2.5 rounded bg-black/30 border text-white transition-colors duration-200 ${
                  refError ? "border-[#ff3d5a]" : "border-white/10"
                }`}
              />
              <AnimatePresence>
                {refError && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-[#ff3d5a] text-[11px] font-semibold mt-1"
                  >
                    {refError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <div className="space-y-1 text-left">
              <label className="text-gray-400 font-semibold uppercase">
                Workflow Priority
              </label>
              <Select
                value={priority}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPriority(e.target.value as 'critical' | 'high' | 'medium' | 'low')}
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
            </div>
          </div>

          <div className="space-y-1 text-left">
            <label className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
              BOQ Input Quantities / Raw Specification Text
            </label>
            <textarea
              value={rawBOMText}
              onChange={(e) => setRawBOMText(e.target.value)}
              placeholder="Paste Bills of Materials, part lists, line requests..."
              className="w-full h-24 p-2.5 rounded bg-black/30 border border-white/10 text-white text-xs font-mono"
            />
          </div>

          <div className="pt-2 border-t flex justify-end gap-2 border-indigo-500/10">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Initialize Parallel Workflow
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
