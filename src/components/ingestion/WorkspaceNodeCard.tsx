import React from "react";

export interface WorkspaceNodeConfig {
  label: string;
}

interface WorkspaceNodeCardProps {
  ucidId?: string;
  vendorName: string;
  subtitle: string;
  syncedConfigs: number;
  configs: WorkspaceNodeConfig[] | string[];
  valueMultiplier: number;
}

export function WorkspaceNodeCard({
  ucidId,
  vendorName,
  subtitle,
  syncedConfigs,
  configs,
  valueMultiplier,
}: WorkspaceNodeCardProps) {
  const totalConfigs = configs.length;
  const isFullySynced = syncedConfigs === totalConfigs;
  const hasStarted = syncedConfigs > 0;

  return (
    <div className="bg-surface-elevated border border-white/5 rounded-xl p-5 space-y-4 flex flex-col justify-between text-left font-sans">
      <div className="space-y-3 text-left">
        <div className="flex justify-between items-start text-left">
          <div>
            <span className="text-[8px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded font-black tracking-wide uppercase flex items-center gap-1 w-max inline-block">
              <span
                className={`w-1 h-1 rounded-full ${
                  isFullySynced ? "bg-status-success" : "bg-sky-400 animate-ping"
                } inline-block`}
              />
              <span>
                {isFullySynced
                  ? "Status: Synced"
                  : hasStarted
                  ? "Status: Bot Syncing"
                  : "Status: Idle"}
              </span>
            </span>
            <h3 className="text-xs font-bold text-content-primary mt-1.5 font-mono">
              {ucidId}
            </h3>
            <p className="text-[10px] text-content-secondary">{subtitle}</p>
          </div>
          <div className="text-right font-mono">
            <p className="text-xs font-bold text-content-primary">
              ${(syncedConfigs * valueMultiplier).toLocaleString()}
            </p>
            <p className="text-[9px] text-content-muted font-mono">
              tracked value
            </p>
          </div>
        </div>
        <div className="p-3 rounded bg-surface-canvas/10 border border-white/[0.03] space-y-2 text-left font-mono">
          <p className="text-[9px] text-content-secondary uppercase block font-mono">
            Sequential Execution Line ({ucidId})
          </p>
          <div className="space-y-1.5 pt-1 text-[10px]">
            {configs.map((cfg, idx) => {
              const label = typeof cfg === "string" ? cfg : cfg.label;
              return (
                <div
                  key={label}
                  className="flex items-center justify-between p-1.5 rounded bg-surface-card border border-white/5"
                >
                  <span className="text-content-secondary">
                    Config {idx + 1}: {label}
                  </span>
                  {syncedConfigs >= idx + 1 ? (
                    <span className="text-status-success font-bold uppercase text-[8px]">
                      Synced
                    </span>
                  ) : (
                    <span className="text-content-muted uppercase text-[8px]">
                      Pending bot
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="pt-4 border-t border-white/5 text-left">
        <span className="text-[9px] text-content-muted uppercase font-mono block">
          Automated Tracker:
        </span>
        <div className="flex items-center gap-2 mt-2 font-mono">
          <div className="flex-1 h-1.5 bg-surface-canvas/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-indigo transition-all duration-300"
              style={{ width: `${(syncedConfigs / totalConfigs) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-content-primary font-bold leading-none">
            {syncedConfigs}/{totalConfigs} Synced
          </span>
        </div>
      </div>
    </div>
  );
}
