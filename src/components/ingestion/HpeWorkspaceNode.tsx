import React from "react";

interface VendorNodeConfig {
  label: string;
}

const HPE_CONFIGS: VendorNodeConfig[] = [
  { label: "HPE ProLiant Gen11 Chassis" },
  { label: "Intel Xeon Scalable High CPU" },
  { label: "Symmetrical Memory Sourcing" },
  { label: "Redundant Power Grid Bus" },
];

interface HpeWorkspaceNodeProps {
  hpeSyncedConfigs: number;
  ucidId?: string;
}

export function HpeWorkspaceNode({ hpeSyncedConfigs, ucidId }: HpeWorkspaceNodeProps) {
  return (
    <div className="bg-surface-elevated border border-white/5 rounded-xl p-5 space-y-4 flex flex-col justify-between text-left">
      <div className="space-y-3 font-sans text-left">
        <div className="flex justify-between items-start text-left">
          <div>
            <span className="text-[8px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded font-black tracking-wide uppercase flex items-center gap-1 w-max inline-block">
              <span className={`w-1 h-1 rounded-full ${hpeSyncedConfigs === 4 ? "bg-emerald-400" : "bg-sky-400 animate-ping"} inline-block`} />
              <span>{hpeSyncedConfigs === 4 ? "Status: Synced" : hpeSyncedConfigs > 0 ? "Status: Bot Syncing" : "Status: Idle"}</span>
            </span>
            <h3 className="text-xs font-bold text-white mt-1.5 font-mono">{ucidId}</h3>
            <p className="text-[10px] text-gray-400">HPE High-Core Blades</p>
          </div>
          <div className="text-right font-mono">
            <p className="text-xs font-bold text-white">${(hpeSyncedConfigs * 105450).toLocaleString()}</p>
            <p className="text-[9px] text-gray-500">tracked value</p>
          </div>
        </div>
        <div className="p-3 rounded bg-black/10 border border-white/[0.03] space-y-2 text-left font-mono">
          <p className="text-[9px] text-gray-400 uppercase block">Sequential Execution Line ({ucidId})</p>
          <div className="space-y-1.5 pt-1 text-[10px]">
            {HPE_CONFIGS.map((cfg, idx) => (
              <div key={cfg.label} className="flex items-center justify-between p-1.5 rounded bg-surface-card border border-white/5">
                <span className="text-gray-300">Config {idx + 1}: {cfg.label}</span>
                {hpeSyncedConfigs >= idx + 1
                  ? <span className="text-emerald-400 font-bold uppercase text-[8px]">Synced</span>
                  : <span className="text-gray-500 uppercase text-[8px]">Pending bot</span>
                }
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="pt-4 border-t border-white/5 text-left">
        <span className="text-[9px] text-gray-500 uppercase font-mono block">Automated Tracker:</span>
        <div className="flex items-center gap-2 mt-2 font-mono">
          <div className="flex-1 h-1.5 bg-black/30 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${(hpeSyncedConfigs / 4) * 100}%` }} />
          </div>
          <span className="text-[10px] text-white font-bold leading-none">{hpeSyncedConfigs}/4 Synced</span>
        </div>
      </div>
    </div>
  );
}
