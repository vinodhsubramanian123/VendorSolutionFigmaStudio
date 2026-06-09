import React from "react";
import { CheckCircle, Play } from "lucide-react";

interface LaunchStepProps {
  onNavigate: (view: any) => void;
}

export function LaunchStep({ onNavigate }: LaunchStepProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-surface-elevated border border-white/5 rounded-xl text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
        <CheckCircle
          className="w-10 h-10 text-emerald-400 animate-bounce"
          id="launch-success-icon"
        />
      </div>
      <div className="space-y-2 max-w-lg">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Ready for Deployment
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed text-[#9ca3af]">
          The full procurement ingestion lifecycle is complete. All
          configurations have been aligned, vendors synced, costs optimized, and
          compliance validated across the hybrid portfolio.
        </p>
      </div>

      <button
        id="launch-solution-builder-btn"
        type="button"
        onClick={() => onNavigate("solution-builder")}
        className="px-8 py-3 bg-brand-indigo hover:bg-[#3474f3] text-white rounded-lg font-bold shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer focus:outline-none"
      >
        <Play className="w-5 h-5 shrink-0" />
        <span>Launch Solution Builder</span>
      </button>
    </div>
  );
}
