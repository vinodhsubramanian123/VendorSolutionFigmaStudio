import React from "react";
import { Radio, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UCID } from "../../types";
import { Select } from "../shared/Select";
import { Button } from "../shared/Button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface NewUCIDModalProps {
  onClose: () => void;
  onCreate: (ucid: UCID) => void;
}

const formSchema = z.object({
  ucidName: z.string().min(1, "Workspace Title / Brief Target is required."),
  ucidRef: z.string().min(1, "Project Code Ref is required."),
  priority: z.enum(["critical", "high", "medium", "low"]),
  rawBOMText: z.string()
});

type FormValues = z.infer<typeof formSchema>;

export function NewUCIDModal({ onClose, onCreate }: NewUCIDModalProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ucidName: "",
      ucidRef: "PRJ-2026-",
      priority: "high",
      rawBOMText: ""
    }
  });

  const onSubmit = (data: FormValues) => {
    const displayNum = Math.floor(1000 + Math.random() * 9000);
    const newUCID: UCID = {
      id: `u-${Date.now()}`,
      displayId: `UCID-2026-${displayNum}`,
      name: data.ucidName.trim(),
      priority: data.priority,
      projectRef: data.ucidRef.trim(),
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      currentStep: "boq-intake",
      completedSteps: [],
      rawBOM: data.rawBOMText.trim() || "Ingested raw constraints.",
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
  };

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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 text-xs">
          <div className="space-y-1 text-left">
            <label className="text-gray-400 font-semibold uppercase">
              Workspace Title / Brief Target
            </label>
            <input
              type="text"
              {...register("ucidName")}
              placeholder="e.g. HPC Core Virtualization — 24 Node Cluster Gen11"
              className={`w-full p-2.5 rounded bg-black/30 border text-white transition-colors duration-200 ${
                errors.ucidName ? "border-[#ff3d5a]" : "border-white/10"
              }`}
            />
            <AnimatePresence>
              {errors.ucidName && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[#ff3d5a] text-[11px] font-semibold mt-1"
                >
                  {errors.ucidName.message}
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
                {...register("ucidRef")}
                className={`w-full p-2.5 rounded bg-black/30 border text-white transition-colors duration-200 ${
                  errors.ucidRef ? "border-[#ff3d5a]" : "border-white/10"
                }`}
              />
              <AnimatePresence>
                {errors.ucidRef && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-[#ff3d5a] text-[11px] font-semibold mt-1"
                  >
                    {errors.ucidRef.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <div className="space-y-1 text-left">
              <label className="text-gray-400 font-semibold uppercase">
                Workflow Priority
              </label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onChange={field.onChange}>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-1 text-left">
            <label className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
              BOQ Input Quantities / Raw Specification Text
            </label>
            <textarea
              {...register("rawBOMText")}
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
