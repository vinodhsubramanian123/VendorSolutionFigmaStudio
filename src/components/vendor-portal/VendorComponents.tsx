import React from "react";
import { KeyRound, Radio, Shield, Terminal, Play, RotateCw, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { tokens } from "../../styles/tokens";

interface VendorCredentialsCardProps {
  selectedPortal: "HPE" | "Dell" | "Cisco";
  setSelectedPortal: (port: "HPE" | "Dell" | "Cisco") => void;
  authStatus: "authorized" | "expired" | "verifying";
  username: string;
  setUsername: (val: string) => void;
  apiToken: string;
  setPassword: (val: string) => void;
  mfaToken: string;
  setMfaToken: (val: string) => void;
  certValid: boolean;
  setCertValid: (val: boolean) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  isRunningTest: boolean;
  handleSaveCredentials: () => void;
  handleRunPortalTest: () => void;
  showToast: (msg: string, type: "warn" | "success" | "error") => void;
}

export function VendorCredentialsCard({
  selectedPortal,
  setSelectedPortal,
  authStatus,
  username,
  setUsername,
  apiToken,
  setPassword,
  mfaToken,
  setMfaToken,
  certValid,
  setCertValid,
  showPassword,
  setShowPassword,
  isRunningTest,
  handleSaveCredentials,
  handleRunPortalTest,
  showToast,
}: VendorCredentialsCardProps) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-brand-indigo" />
          <h3 className="text-xs text-content-primary font-bold uppercase tracking-wider">
            Playwright Automator Vault
          </h3>
        </div>
        <Radio className={`w-3.5 h-3.5 ${authStatus === "authorized" ? "text-status-success animate-pulse" : "text-status-warning animate-pulse"}`} />
      </div>

      <div className="p-2.5 bg-brand-indigo/5 border border-brand-indigo/20 rounded-lg text-left space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-indigo shrink-0" />
          <span className="text-[9px] font-bold text-brand-indigo font-mono uppercase tracking-wider">
            Web-Automation Gateway
          </span>
        </div>
        <p className="text-[10px] text-content-secondary leading-snug">
          Since direct REST supplier pricing endpoints do not exist publicly for vendor portals, our server utilizes background <span className="text-content-secondary font-semibold font-mono">Playwright / Puppeteer Headless Browser Crawlers</span> to fetch, audit, and pull actual quotation BOM parameters. Configure credentials securely below.
        </p>
      </div>

      <div className="space-y-1" role="group" aria-labelledby="partner-portal-label">
        <div id="partner-portal-label" className="text-[10px] font-bold text-content-primary0 uppercase tracking-wide">
          Select Partner Portal
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(["HPE", "Dell", "Cisco"] as const).map((port) => (
            <button
              key={port}
              type="button"
              onClick={() => setSelectedPortal(port)}
              className={`py-1.5 rounded font-bold text-[11px] border cursor-pointer transition flex items-center justify-center gap-1 ${
                selectedPortal === port
                  ? "bg-brand-indigo text-content-primary border-brand-indigo"
                  : "bg-white/5 hover:bg-white/10 text-content-secondary border-white/5"
              }`}
            >
              {port === "Cisco" ? "Cisco CCW" : `${port} Premier`}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 bg-surface-canvas/35 rounded-lg border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-brand-indigo tracking-wider">
            Corporate Auth Parameters
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{
              backgroundColor: authStatus === "authorized" ? tokens.colors.status.success : authStatus === "verifying" ? tokens.colors.status.warning : tokens.colors.status.error
            }} />
            <span className="text-[9px] uppercase font-mono text-content-secondary">
              {authStatus === "authorized" ? "Connected" : authStatus === "verifying" ? "Testing..." : "Auth Needed"}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="partner-username" className="text-[9px] font-bold text-content-primary0 uppercase">Partner Username</label>
          <div className="relative">
            <input
              id="partner-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. partner_account_id"
              className="w-full bg-surface-canvas border border-white/10 rounded px-2 py-1.5 text-xs text-content-primary placeholder-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus:border-brand-indigo/50"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="partner-apiToken" className="text-[9px] font-bold text-content-primary0 uppercase">Secure Client Password</label>
          <div className="relative">
            <input
              id="partner-apiToken"
              type={showPassword ? "text" : "apiToken"}
              value={apiToken}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••••"
              className="w-full bg-surface-canvas border border-white/10 rounded pl-2 pr-8 py-1.5 text-xs text-content-primary placeholder-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus:border-brand-indigo/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-content-primary0 hover:text-content-primary"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="partner-mfa" className="text-[9px] font-bold text-content-primary0 uppercase flex items-center justify-between">
            <span>MFA Secret Token Seed (TOTP)</span>
            <span className="text-[8px] text-brand-indigo lowercase font-mono">Bypasses MFA hurdles</span>
          </label>
          <input
            id="partner-mfa"
            type="text"
            value={mfaToken}
            onChange={(e) => setMfaToken(e.target.value)}
            placeholder="ABCD-EFGH-1234-5678"
            className="w-full bg-surface-canvas border border-white/10 rounded px-2 py-1.5 text-xs font-mono text-content-primary placeholder-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus:border-brand-indigo/50"
          />
        </div>

        <div className="flex items-center justify-between pt-1 font-mono text-[9.5px] border-t border-white/5">
          <span className="text-content-primary0">Corporate SSL Cert:</span>
          <button
            type="button"
            onClick={() => {
              setCertValid(!certValid);
              showToast(`TLS Client Certificate verification flipped to ${!certValid ? "ENABLED" : "DISABLED"}.`, "warn");
            }}
            className={`px-2 py-0.5 rounded font-bold transition flex items-center gap-1 ${
              certValid ? "bg-status-success/10 text-status-success border border-status-success/20" : "bg-status-error/10 text-status-error border border-status-error/20"
            }`}
          >
            <Shield className="w-2.5 h-2.5" />
            {certValid ? "AUTH_VALID" : "TLS_REQUIRED"}
          </button>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleSaveCredentials}
            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] font-bold text-content-primary py-2 cursor-pointer transition transition-all"
          >
            Store Secret Config
          </button>

          <button
            type="button"
            onClick={handleRunPortalTest}
            disabled={isRunningTest || !username || !apiToken}
            className="flex-1 bg-brand-indigo hover:bg-brand-indigo border border-brand-indigo/20 rounded text-[10px] font-bold text-content-primary py-2 cursor-pointer transition transition-all flex items-center justify-center gap-1 disabled:opacity-40"
          >
            {isRunningTest ? <RotateCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            Test Web-Automator
          </button>
        </div>
      </div>
    </>
  );
}

interface VendorConsoleLogsProps {
  lastTested: string;
  consoleLogs: string[];
}

export function VendorConsoleLogs({ lastTested, consoleLogs }: VendorConsoleLogsProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-brand-indigo" />
          <span className="text-[10px] font-bold text-content-primary0 uppercase tracking-wide">
            Daemon Playwright Pipe
          </span>
        </div>
        <span className="text-[9px] font-mono text-content-primary0">
          Last Handshake: {lastTested}
        </span>
      </div>

      <div className="h-44 rounded-lg bg-surface-canvas border border-white/5 p-2.5 font-mono text-[9px] text-content-secondary overflow-y-auto space-y-1 scrollbar-thin select-text text-left">
        <AnimatePresence mode="popLayout" initial={false}>
          {consoleLogs.map((log, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              key={log + idx}
              className={
                log.includes("[Success]") || log.includes("AUTH SUCCESS")
                  ? "text-status-success font-semibold"
                  : log.includes("EXPIRED") || log.includes("expired")
                    ? "text-status-error"
                    : log.startsWith("---")
                      ? "text-brand-indigo font-bold border-y border-white/5 py-1 my-1"
                      : "text-content-secondary"
              }
            >
              {log}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
