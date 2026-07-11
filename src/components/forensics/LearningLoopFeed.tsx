import React, { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Shield,
  Clock,
  Zap,
} from "lucide-react";
import type { LearningEvent } from "../../types";

interface LearningLoopFeedProps {
  learningEvents: LearningEvent[];
  onMarkReviewed?: (eventId: string) => void;
  activeRuleCount: number;
}

const RULE_TYPE_CONFIG = {
  substitution: {
    label: "SKU Substitution",
    color: "text-purple-300",
    bg: "bg-brand-violet/10",
    border: "border-brand-violet/20",
    icon: "🔄",
  },
  price_cap: {
    label: "Price Cap",
    color: "text-emerald-300",
    bg: "bg-status-success/10",
    border: "border-status-success/20",
    icon: "💰",
  },
  symmetry: {
    label: "Memory Symmetry",
    color: "text-amber-300",
    bg: "bg-status-warning/10",
    border: "border-status-warning/20",
    icon: "⚖️",
  },
  api_gateway: {
    label: "API Gateway",
    color: "text-indigo-300",
    bg: "bg-brand-indigo/10",
    border: "border-brand-indigo/20",
    icon: "🔐",
  },
} as const;

export function LearningLoopFeed({
  learningEvents,
  onMarkReviewed,
  activeRuleCount,
}: LearningLoopFeedProps) {
  const totalPrevented = useMemo(
    () => learningEvents.reduce((sum, ev) => sum + ev.preventedMismatchCount, 0),
    [learningEvents]
  );

  const avgConfidence = useMemo(() => {
    if (learningEvents.length === 0) return 0;
    return Math.round(
      learningEvents.reduce((sum, ev) => sum + ev.confidenceScore, 0) /
        learningEvents.length
    );
  }, [learningEvents]);

  return (
    <motion.div
      className="rounded-xl border flex flex-col gap-0 overflow-hidden"
      style={{
        background: "rgba(74, 133, 253, 0.02)",
        borderColor: "rgba(74, 133, 253, 0.12)",
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-indigo/15 border border-brand-indigo/25 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-brand-indigo" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-content-primary">
                Intelligence Learning Loop
              </h3>
              <span
                className="inline-flex items-center gap-1 text-[9px] font-bold text-status-success bg-status-success/10 border border-status-success/20 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider animate-pulse"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-status-success inline-block" />
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-content-muted mt-0.5">
              Auto-heal events that trained the catalog intelligence database
            </p>
          </div>
        </div>

        {/* Aggregate stats */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-[10px] text-content-muted font-mono uppercase tracking-wider">Active Rules</p>
            <p className="text-lg font-bold text-brand-indigo font-mono leading-none">
              {activeRuleCount}
            </p>
          </div>
          <div className="w-px h-8 bg-white/5" />
          <div className="text-right">
            <p className="text-[10px] text-content-muted font-mono uppercase tracking-wider">Prevented</p>
            <p className="text-lg font-bold text-status-success font-mono leading-none">
              {totalPrevented}
            </p>
          </div>
          <div className="w-px h-8 bg-white/5" />
          <div className="text-right">
            <p className="text-[10px] text-content-muted font-mono uppercase tracking-wider">Avg Confidence</p>
            <p className="text-lg font-bold text-content-primary font-mono leading-none">
              {avgConfidence}%
            </p>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {learningEvents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-brand-indigo/8 border border-brand-indigo/15 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-brand-indigo/50" />
          </div>
          <div>
            <p className="text-sm font-medium text-content-secondary">No learning events yet</p>
            <p className="text-[11px] text-content-muted mt-1 max-w-xs mx-auto leading-relaxed">
              Trigger <span className="text-brand-indigo font-semibold">Auto-Heal</span> on any forensic anomaly above
              to generate the first intelligence entry.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-content-muted font-mono border border-white/5 rounded-lg px-3 py-2 bg-surface-canvas/20">
            <Zap className="w-3 h-3 text-status-warning" />
            Auto-Heal fires → Catalog updated → Rule learned → Future BOQ scans accelerated
          </div>
        </div>
      )}

      {/* Event feed timeline */}
      {learningEvents.length > 0 && (
        <div className="divide-y divide-white/[0.04]">
          <AnimatePresence initial={false}>
            {learningEvents.map((event, idx) => {
              const cfg = RULE_TYPE_CONFIG[event.ruleType];
              const timeAgo = new Date(event.timestamp).toLocaleString();

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                  className="p-4 hover:bg-white/[0.015] transition-colors group"
                >
                  <div className="flex items-start gap-4">
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center shrink-0 mt-0.5">
                      <div className="w-7 h-7 rounded-full bg-brand-indigo/15 border border-brand-indigo/30 flex items-center justify-center text-sm">
                        {cfg.icon}
                      </div>
                      {idx < learningEvents.length - 1 && (
                        <div className="w-px flex-1 bg-white/5 mt-2 min-h-[20px]" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border font-mono ${cfg.color} ${cfg.bg} ${cfg.border}`}
                            >
                              {cfg.label}
                            </span>
                            <span className="text-[10px] font-mono text-indigo-200 font-bold">
                              {event.partNumber}
                            </span>
                            <span className="text-[9px] text-content-muted">→</span>
                            <span className="text-[10px] text-content-secondary">
                              {event.vendor}
                            </span>
                          </div>

                          <p className="text-[11px] text-content-secondary leading-relaxed mb-2">
                            {event.action}
                          </p>

                          {/* Metrics row */}
                          <div className="flex items-center gap-4 text-[10px] text-content-muted">
                            <span className="flex items-center gap-1">
                              <Shield className="w-3 h-3 text-status-success" />
                              <span className="text-status-success font-bold font-mono">
                                {event.preventedMismatchCount}
                              </span>
                              <span>mismatches prevented</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-brand-indigo" />
                              <span className="text-content-primary font-bold font-mono">
                                {event.confidenceScore}%
                              </span>
                              <span>confidence</span>
                            </span>
                            {/* Confidence bar */}
                            <div className="flex-1 max-w-[80px]">
                              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${event.confidenceScore}%`,
                                    background:
                                      event.confidenceScore >= 90
                                        ? "#00d4a0"
                                        : event.confidenceScore >= 70
                                        ? "#4a85fd"
                                        : "#ff9b36",
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right: timestamp + action */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className="flex items-center gap-1 text-[9px] text-content-muted font-mono">
                            <Clock className="w-3 h-3" />
                            {timeAgo}
                          </span>
                          {onMarkReviewed && (
                            <button type="button"
                              onClick={() => onMarkReviewed(event.id)}
                              className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[9px] text-brand-indigo border border-brand-indigo/20 bg-brand-indigo/8 hover:bg-brand-indigo/15 px-2 py-1 rounded font-bold transition-all cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Acknowledge
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Flow path visualization */}
                      <div className="flex items-center gap-1.5 mt-2 text-[9px] text-content-muted font-mono">
                        <span className="text-status-error/70">ForensicIssue #{event.sourceIssueId}</span>
                        <ArrowRight className="w-2.5 h-2.5 text-gray-700" />
                        <span className="text-status-warning/70">Auto-Heal</span>
                        <ArrowRight className="w-2.5 h-2.5 text-gray-700" />
                        <span className="text-brand-indigo/70">Catalog Updated</span>
                        <ArrowRight className="w-2.5 h-2.5 text-gray-700" />
                        <span className="text-status-success/70">Rule Active</span>
                        <ArrowRight className="w-2.5 h-2.5 text-gray-700" />
                        <span className="text-content-primary/50">BOQ Pre-Scan ⚡</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Footer summary */}
      {learningEvents.length > 0 && (
        <div className="p-3 border-t border-white/5 bg-surface-canvas/10 flex items-center justify-between">
          <p className="text-[10px] text-content-muted font-mono">
            {learningEvents.length} learning event{learningEvents.length !== 1 ? "s" : ""} captured ·
            Intelligence feeds into BOQ Pre-Intelligence scan automatically
          </p>
          <div className="flex items-center gap-1.5 text-[9px] text-status-success font-mono font-bold">
            <Sparkles className="w-3 h-3 animate-pulse" />
            SELF-IMPROVING
          </div>
        </div>
      )}
    </motion.div>
  );
}
