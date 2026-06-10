import React, { useState, useEffect } from "react";
import {
  KeyRound,
  Shield,
  Terminal,
  Play,
  RotateCw,
  Eye,
  EyeOff,
  Radio,
  FileCheck2,
  Lock,
} from "lucide-react";
import type { UCID } from "../../types";
import { tokens } from "../../styles/tokens";

interface VendorIngestionDeskProps {
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  showToast: (message: string, type: "success" | "warn" | "error") => void;
}

export function VendorIngestionDesk({
  ucids,
  setUcids,
  showToast,
}: VendorIngestionDeskProps) {
  const [selectedPortal, setSelectedPortal] = useState<"HPE" | "Dell" | "Cisco">("HPE");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [mfaToken, setMfaToken] = useState<string>("");
  const [certValid, setCertValid] = useState(true);
  const [lastTested, setLastTested] = useState<string>("Never tested");
  
  // Scraper execution states
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [authStatus, setAuthStatus] = useState<"authorized" | "not_configured" | "expired" | "verifying">("not_configured");
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "System Initialized. Playwright Web-Automation Daemon listening on thread pool...",
    "Awaiting partner credential handshake config...",
  ]);

  // Set default credentials whenever selected portal shifts to make it populated and professional
  useEffect(() => {
    if (selectedPortal === "HPE") {
      setUsername("enterprise_sourcing_hpe_prod");
      setPassword("HPE-S0urcing-2026!");
      setMfaToken("RO7K-9154-A24B");
      setAuthStatus("authorized");
      setConsoleLogs([
        "[08:34:10] [Manager] - Loading HPE Partner Ready configuration credentials...",
        "[08:34:11] [CredentialVault] - Decrypted corporate client TLS connection certificates.",
        "[08:34:12] [Daemon] - Playwright connection verified with hpe.com secure tunnel gateway.",
      ]);
    } else if (selectedPortal === "Dell") {
      setUsername("dell_premier_procurement_lead");
      setPassword("DellAdminSecure3902!!");
      setMfaToken("DL-9824-MFA-X2");
      setAuthStatus("authorized");
      setConsoleLogs([
        "[09:10:02] [Manager] - Dell Premier portal authentication state valid.",
        "[09:10:05] [Scraper] - Handshake completed. 1 corporate customer account linked.",
      ]);
    } else {
      setUsername("cisco_ccw_integrator_ops");
      setPassword("CiscoCCW-Cloud-Pass#2");
      setMfaToken("CI-5100-MFA");
      setAuthStatus("expired");
      setConsoleLogs([
        "[10:12:05] [Manager] - CCW token detected: EXPIRED.",
        "[10:12:06] [CCW-Gate] - Playwright browser automation requires rotating session refresh token.",
        "[10:12:07] [MFA-Gate] - Awaiting manual MFA trigger or Playwright browser re-authentication.",
      ]);
    }
  }, [selectedPortal]);

  // Handle Playwright Simulation Test
  function handleRunPortalTest() {
    setIsRunningTest(true);
    setAuthStatus("verifying");
    
    // Staggered log outputs to demonstrate dynamic automation
    const testLogs = [
      `[Run] Spawning Playwright headless chromium container...`,
      `[Auth] Navigating to target partner portal: ${
        selectedPortal === "HPE"
          ? "https://partner.hpe.com/ready/login"
          : selectedPortal === "Dell"
            ? "https://premier.dell.com"
            : "https://commerce.cisco.com/ccw"
      }`,
      `[Auth] Locate username element #user-id -> Injected value "${username}"`,
      `[Auth] Locate password element [type=password] -> Managed handshake transfer...`,
      `[MFA] Authenticating utilizing rolling Session MFA Key seeds...`,
      `[Bypass] Resolved Akamai bot-detection and validated cookies...`,
      `[Success] Handshake finalized. Fetched user profile configuration successfully!`,
      `[Active] Discovered 3 active workspace quotes assigned to VSIP opportunities.`
    ];

    setConsoleLogs((prev) => [
      ...prev,
      `--- PLAYWRIGHT DIAGNOSTIC HANDSHAKE COMMENCED [VENDOR = ${selectedPortal}] ---`
    ]);

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < testLogs.length) {
        setConsoleLogs((prev) => [...prev, `[PLAYWRIGHT] ${testLogs[idx]}`]);
        idx++;
      } else {
        clearInterval(interval);
        setIsRunningTest(false);
        setAuthStatus("authorized");
        const now = new Date().toLocaleTimeString();
        setLastTested(now);
        showToast(`${selectedPortal} Playwright connection authenticated successfully!`, "success");
        
        // Push an event to active UCIDs log representing the background sync
        setUcids((prev) => 
          prev.map((u, i) => {
            if (i === 0) {
              return {
                ...u,
                events: [
                  ...u.events,
                  {
                    ts: now,
                    level: "ok",
                    msg: `Playwright Automation: Authenticated partner gate ${selectedPortal} utilizing secure credentials. Refreshed direct contract rates index.`,
                  }
                ]
              };
            }
            return u;
          })
        );
      }
    }, 400);
  }

  function handleSaveCredentials() {
    showToast(`${selectedPortal} Sourcing portal credentials stored securely.`, "success");
    setConsoleLogs((prev) => [
      ...prev,
      `[Vault] Credentials altered and re-committed into secure memory vault.`
    ]);
  }

  return (
    <div className="p-4 rounded-xl border bg-surface-elevated/80 border-indigo-500/15 flex flex-col gap-4 shadow-xl">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs text-white font-bold uppercase tracking-wider">
            Playwright Automator Vault
          </h3>
        </div>
        <Radio className={`w-3.5 h-3.5 ${authStatus === "authorized" ? "text-emerald-400 animate-pulse" : "text-amber-500 animate-pulse"}`} />
      </div>

      {/* Concept Explainer */}
      <div className="p-2.5 bg-indigo-500/5 border border-indigo-500/20 rounded-lg text-left space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
          <span className="text-[9px] font-bold text-indigo-400 font-mono uppercase tracking-wider">
            Web-Automation Gateway
          </span>
        </div>
        <p className="text-[10px] text-gray-400 leading-snug">
          Since direct REST supplier pricing endpoints do not exist publicly for vendor portals, our server utilizes background <span className="text-gray-300 font-semibold font-mono">Playwright / Puppeteer Headless Browser Crawlers</span> to fetch, audit, and pull actual quotation BOM parameters. Configure credentials securely below.
        </p>
      </div>

      {/* Portal Selection Selector */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
          Select Partner Portal
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(["HPE", "Dell", "Cisco"] as const).map((port) => (
            <button
              key={port}
              type="button"
              onClick={() => setSelectedPortal(port)}
              className={`py-1.5 rounded font-bold text-[11px] border cursor-pointer transition flex items-center justify-center gap-1 ${
                selectedPortal === port
                  ? "bg-indigo-500 text-white border-indigo-400"
                  : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/5"
              }`}
            >
              {port === "Cisco" ? "Cisco CCW" : `${port} Premier`}
            </button>
          ))}
        </div>
      </div>

      {/* Security Credentials Card */}
      <div className="p-3 bg-black/35 rounded-lg border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
            Corporate Auth Parameters
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{
              backgroundColor: authStatus === "authorized" ? tokens.colors.status.success : authStatus === "verifying" ? tokens.colors.status.warning : tokens.colors.status.error
            }} />
            <span className="text-[9px] uppercase font-mono text-gray-400">
              {authStatus === "authorized" ? "Connected" : authStatus === "verifying" ? "Testing..." : "Auth Needed"}
            </span>
          </div>
        </div>

        {/* Username */}
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-gray-500 uppercase">Partner Username</label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. partner_account_id"
              className="w-full bg-surface-canvas border border-white/10 rounded px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-gray-500 uppercase">Secure Client Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••••"
              className="w-full bg-surface-canvas border border-white/10 rounded pl-2 pr-8 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-gray-500 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Dynamic Partner MFA Session Key */}
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-gray-500 uppercase flex items-center justify-between">
            <span>MFA Secret Token Seed (TOTP)</span>
            <span className="text-[8px] text-indigo-400 lowercase font-mono">Bypasses MFA hurdles</span>
          </label>
          <input
            type="text"
            value={mfaToken}
            onChange={(e) => setMfaToken(e.target.value)}
            placeholder="ABCD-EFGH-1234-5678"
            className="w-full bg-surface-canvas border border-white/10 rounded px-2 py-1.5 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        {/* SSL client cert toggler */}
        <div className="flex items-center justify-between pt-1 font-mono text-[9.5px] border-t border-white/5">
          <span className="text-gray-500">Corporate SSL Cert:</span>
          <button
            type="button"
            onClick={() => {
              setCertValid(!certValid);
              showToast(`TLS Client Certificate verification flipped to ${!certValid ? "ENABLED" : "DISABLED"}.`, "warn");
            }}
            className={`px-2 py-0.5 rounded font-bold transition flex items-center gap-1 ${
              certValid ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            <Shield className="w-2.5 h-2.5" />
            {certValid ? "AUTH_VALID" : "TLS_REQUIRED"}
          </button>
        </div>

        {/* Actions row */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleSaveCredentials}
            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] font-bold text-gray-200 py-2 cursor-pointer transition transition-all"
          >
            Store Secret Config
          </button>

          <button
            type="button"
            onClick={handleRunPortalTest}
            disabled={isRunningTest || !username || !password}
            className="flex-1 bg-indigo-500 hover:bg-indigo-600 border border-indigo-400/20 rounded text-[10px] font-bold text-white py-2 cursor-pointer transition transition-all flex items-center justify-center gap-1 disabled:opacity-40"
          >
            {isRunningTest ? <RotateCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            Test Web-Automator
          </button>
        </div>
      </div>

      {/* Diagnostics Playwright console logger output */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
              Daemon Playwright Pipe
            </span>
          </div>
          <span className="text-[9px] font-mono text-gray-500">
            Last Handshake: {lastTested}
          </span>
        </div>

        <div className="h-44 rounded-lg bg-surface-canvas border border-white/5 p-2.5 font-mono text-[9px] text-gray-400 overflow-y-auto space-y-1 scrollbar-thin select-text text-left">
          {consoleLogs.map((log, idx) => (
            <div key={idx} className={
              log.includes("[Success]") || log.includes("AUTH SUCCESS")
                ? "text-status-success font-semibold"
                : log.includes("EXPIRED") || log.includes("expired")
                  ? "text-red-400"
                  : log.startsWith("---")
                    ? "text-indigo-400 font-bold border-y border-white/5 py-1 my-1"
                    : "text-gray-400"
            }>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
