import React from "react";
import { CheckCircle, Play } from "lucide-react";
import { motion } from "motion/react";

import type { AppView } from "../../types";

interface LaunchStepProps {
  onNavigate: (view: AppView) => void;
}

export function LaunchStep({ onNavigate }: LaunchStepProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center p-12 bg-surface-elevated border border-white/5 rounded-xl text-center space-y-6"
    >
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
      >
        <CheckCircle
          className="w-10 h-10 text-emerald-400"
          id="launch-success-icon"
        />
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-2 max-w-lg"
      >
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Ready for Deployment
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed text-gray-400"> 
          The full procurement ingestion lifecycle is complete. All
          configurations have been aligned, vendors synced, costs optimized, and
          compliance validated across the hybrid portfolio.
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ delay: 0.6 }}
        id="launch-solution-builder-btn"
        type="button"
        onClick={() => onNavigate("solution-builder")}
        className="px-8 py-3 bg-brand-indigo hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg shadow-sky-500/20 transition-colors flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50" 
      >
        <Play className="w-5 h-5 shrink-0" />
        <span>Launch Solution Builder</span>
      </motion.button>
    </motion.div>
  );
}
