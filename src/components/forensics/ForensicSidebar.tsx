import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence, animate } from 'motion/react';
import type { ForensicIssue } from '../../types';
import { useCoreStore } from '../../store/coreStore';

interface ForensicSidebarProps {
  openIssuesCount: number;
}

export function ForensicSidebar({
  openIssuesCount,
}: ForensicSidebarProps) {
  const forensicIssues = useCoreStore(s => s.forensicIssues);
  const targetScore = openIssuesCount === 0 ? 100 : Math.max(10, Math.round(100 - openIssuesCount * 15));
  const [displayScore, setDisplayScore] = useState(0);

  // Animated count-up for the health score
  useEffect(() => {
    const controls = animate(0, targetScore, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: (value) => setDisplayScore(Math.round(value))
    });
    return controls.stop;
  }, [targetScore]);

  const uniqueResolved = React.useMemo(() => {
    const map = new Map<string, { id: string; title: string; desc: string }>();
    forensicIssues.forEach((i) => {
      if (i.status === "resolved") {
        map.set(i.id, {
          id: i.id,
          title: i.title,
          desc: i.suggestedAction || i.description,
        });
      }
    });
    return Array.from(map.values());
  }, [forensicIssues]);

  const scoreColor = targetScore >= 80
    ? "var(--color-status-success)"
    : targetScore >= 50
    ? "var(--color-status-warning)"
    : "var(--color-status-error)";

  return (
    <div className="flex flex-col gap-4">
      <motion.div
        className="p-4 rounded-xl border flex flex-col gap-3 shrink-0"
        style={{
          backgroundColor: "var(--color-surface-elevated)",
          borderColor: "rgba(74, 133, 253,0.08)",
        }}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <h3 className="text-xs text-content-primary font-bold">
          Workspace Health Integrity Score
        </h3>
        <div className="flex items-baseline gap-2">
          <motion.span
            className="text-3xl font-bold font-mono leading-none"
            style={{ color: scoreColor }}
            key={targetScore}
          >
            {displayScore}
          </motion.span>
          <span className="text-xs text-content-primary0 font-mono">/ 100</span>
        </div>
        <div className="w-full h-1.5 bg-surface-card rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, var(--color-status-error), ${scoreColor})`,
            }}
            initial={{ width: "0%" }}
            animate={{ width: `${targetScore}%` }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
          />
        </div>
        <p className="text-[10px] text-content-primary0">
          Each unresolved open compliance exception reduces your aggregate score.
        </p>
      </motion.div>

      <motion.div
        className="p-4 rounded-xl border flex flex-col"
        style={{
          backgroundColor: "var(--color-surface-elevated)",
          borderColor: "rgba(74, 133, 253,0.08)",
        }}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      >
        <span className="text-xs text-content-primary font-bold flex items-center gap-1.5 shrink-0">
          <ShieldCheck className="w-4 h-4 text-status-success" /> Compliance
          Resolved List ({uniqueResolved.length})
        </span>
        <div className="divide-y divide-white/5 mt-3 p-1.5 bg-surface-canvas/20 rounded-lg flex-1 overflow-y-auto space-y-2">
          <AnimatePresence>
            {uniqueResolved.length > 0 ? (
              uniqueResolved.map((issue, idx) => (
                <motion.div
                  key={issue.id || idx}
                  className="py-2 text-[10px] text-content-secondary first:pt-1 last:pb-1"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ delay: idx * 0.06, duration: 0.25 }}
                >
                  <p className="font-bold text-content-primary flex items-center gap-1 line-clamp-1">
                    <CheckCircle className="w-3 h-3 text-status-success shrink-0" />{" "}
                    {issue.title}
                  </p>
                  <p className="text-content-primary0 mt-1 pl-4 leading-normal">
                    {issue.desc}
                  </p>
                </motion.div>
              ))
            ) : (
              <motion.p
                className="text-center text-[10px] text-content-primary0 p-3 italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                No repairs executed in active profile's design scope yet.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
