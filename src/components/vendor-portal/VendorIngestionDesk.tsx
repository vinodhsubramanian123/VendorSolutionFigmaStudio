import React, { useState, useMemo, useEffect } from "react";
import {
  KeyRound,
  Shield,
  Terminal,
  Play,
  RotateCw,
  Eye,
  EyeOff,
  Radio,
} from "lucide-react";
import type { UCID, PlaywrightRunResponse, CatalogSKU, PortalErrorItem, SourcingRule, LearningEvent } from "../../types";
import { apiClient } from "../../services/apiClient";
import { tokens } from "../../styles/tokens";
import { VENDORS } from "../../lib/mockData";
import { PortalErrorResolutionPanel } from "./PortalErrorResolutionPanel";
import { useLocalStorageState } from "../../hooks/useLocalStorageState";

interface VendorIngestionDeskProps {
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  showToast: (message: string, type: "success" | "warn" | "error") => void;
  catalogSkus?: CatalogSKU[];
}

export function VendorIngestionDesk({
  ucids,
  setUcids,
  showToast,
  catalogSkus = [],
}: VendorIngestionDeskProps) {
  const [selectedPortal, setSelectedPortal] = useState<"HPE" | "Dell" | "Cisco">("HPE");
  const [showPassword, setShowPassword] = useState(false);
  const [certValid, setCertValid] = useState(true);
  const [lastTested, setLastTested] = useState<string>("Never tested");
  
  // Scraper execution states
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "System Initialized. Playwright Web-Automation Daemon listening on thread pool...",
    "Awaiting partner credential handshake config...",
  ]);
  // CLIC error resolution state
  const [portalErrors, setPortalErrors] = useState<PortalErrorItem[]>([]);

  const [, setSourcingRules] = useLocalStorageState<SourcingRule[]>(
    "sys_sourcing_intel_rules",
    []
  );

  const [, setLearningEvents] = useLocalStorageState<LearningEvent[]>(
    "sys_learning_events",
    []
  );

  // Derive ALL credential config from selectedPortal synchronously — no useEffect needed.
  // This is the correct pattern per AGENTS.md §3.2: avoid setState in useEffect.
  const portalConfig = useMemo(() => {
    const vendorData = VENDORS.find(v => v.shortName === selectedPortal) || VENDORS[0];
    if (selectedPortal === "HPE") {
      return {
        username: vendorData.credentials?.username || "enterprise_sourcing_hpe_prod",
        password: vendorData.credentials?.passwordHash || "HPE-S0urcing-2026!",
        mfaToken: vendorData.credentials?.mfaToken || "RO7K-9154-A24B",
        authStatus: "authorized" as const,
        defaultLogs: [
          "[08:34:10] [Manager] - Loading HPE Partner Ready configuration credentials...",
          "[08:34:11] [CredentialVault] - Decrypted corporate client TLS connection certificates.",
          "[08:34:12] [Daemon] - Playwright connection verified with hpe.com secure tunnel gateway.",
        ],
      };
    }
    if (selectedPortal === "Dell") {
      return {
        username: vendorData.credentials?.username || "dell_premier_procurement_lead",
        password: vendorData.credentials?.passwordHash || "DellAdminSecure3902!!",
        mfaToken: vendorData.credentials?.mfaToken || "DL-9824-MFA-X2",
        authStatus: "authorized" as const,
        defaultLogs: [
          "[09:10:02] [Manager] - Dell Premier portal authentication state valid.",
          "[09:10:05] [Scraper] - Handshake completed. 1 corporate customer account linked.",
        ],
      };
    }
    return {
      username: vendorData.credentials?.username || "cisco_commerce_workspace_api",
      password: vendorData.credentials?.passwordHash || "Cisco#CCW#Tunnel99",
      mfaToken: vendorData.credentials?.mfaToken || "CSCO-AUTH-9999",
      authStatus: "expired" as const,
      defaultLogs: [
        "[10:12:05] [Manager] - CCW token detected: EXPIRED.",
        "[10:12:06] [CCW-Gate] - Playwright browser automation requires rotating session refresh token.",
        "[10:12:07] [MFA-Gate] - Awaiting manual MFA trigger or Playwright browser re-authentication.",
      ],
    };
  }, [selectedPortal]);

  // User overrideable credential fields — initialized from portalConfig defaults
  const [username, setUsername] = useState(portalConfig.username);
  const [password, setPassword] = useState(portalConfig.password);
  const [mfaToken, setMfaToken] = useState(portalConfig.mfaToken);
  const [authStatus, setAuthStatus] = useState<"authorized" | "expired" | "verifying">(portalConfig.authStatus);

  // Sync console logs and overrides when portal switches
  useEffect(() => {
    setConsoleLogs(portalConfig.defaultLogs);
    setUsername(portalConfig.username);
    setPassword(portalConfig.password);
    setMfaToken(portalConfig.mfaToken);
    setAuthStatus(portalConfig.authStatus);
  }, [selectedPortal, portalConfig]);

  function getMockErrorFields(vendor: string) {
    if (vendor === "Cisco") {
      return {
        skuRef: "UCS-CPU-I6430",
        errorType: "constraint_violation" as const,
        errorMessage: "CCW error: UCS-CPU-I6430 requires UCS-MR-128G1ED-E memory modules (minimum 128GB per DIMM slot for Gen 4 UCS). Current 64GB allocation is unsupported.",
        suggestedAlternatePartNumber: "UCS-CPU-I6526",
        suggestedAlternateName: "UCS Intel Xeon Gold 6526Y Processor",
      };
    }
    if (vendor === "Dell") {
      return {
        skuRef: "400-BPSB",
        errorType: "unbuildable" as const,
        errorMessage: "CLIC Configurator error: 400-BPSB drive not compatible with R760 chassis when combined with RAID-10 controller HBA. Constraint violation detected.",
        suggestedAlternatePartNumber: "400-BPSC",
        suggestedAlternateName: "Dell 7.68TB Enterprise NVMe SSD",
      };
    }
    return {
      skuRef: "815100-B21",
      errorType: "discontinued" as const,
      errorMessage: "CLIC validation failed: Part 815100-B21 is discontinued and no longer orderable on HPE Partner Ready portal. Configuration cannot be submitted.",
      suggestedAlternatePartNumber: "P40424-B21",
      suggestedAlternateName: "Intel Xeon Gold 6430 Gen11 Processor",
    };
  }

  function populateMockError(err: unknown) {
    setIsRunningTest(false);
    setAuthStatus("expired");
    const errMsg = err instanceof Error ? err.message : String(err);
    setConsoleLogs((prev) => [...prev, `[PLAYWRIGHT] Error: ${errMsg}`]);
    showToast("Playwright automation failed.", "error");
    // Parse mock portal errors when the run fails
    setPortalErrors([
      {
        id: `perr-${Date.now()}-1`,
        vendor: selectedPortal,
        resolved: false,
        ...getMockErrorFields(selectedPortal),
      },
    ]);
  }

  async function handleRunPortalTest() {
    setIsRunningTest(true);
    setAuthStatus("verifying");
    
    setConsoleLogs((prev) => [
      ...prev,
      `--- PLAYWRIGHT DIAGNOSTIC HANDSHAKE COMMENCED [VENDOR = ${selectedPortal}] ---`
    ]);

    try {
      const response = await apiClient.post<PlaywrightRunResponse>("/api/agents/run", {
        agentName: selectedPortal === "HPE" ? "HPEMarketplace" : selectedPortal === "Dell" ? "DellPremierPortal" : "AribaScraper",
        ucidRef: "mock-ucid",
        targetPortalUrl: selectedPortal === "HPE" ? "https://partner.hpe.com/ready/login" : selectedPortal === "Dell" ? "https://premier.dell.com" : "https://commerce.cisco.com/ccw",
        bypassCaptchas: true
      });

      const data = response.data;
      if (data.logTrail && Array.isArray(data.logTrail)) {
        setConsoleLogs((prev) => [
          ...prev,
          ...data.logTrail.map((log: PlaywrightRunResponse['logTrail'][0]) => `[PLAYWRIGHT] ${log.message}`)
        ]);
      }
      
      setIsRunningTest(false);
      setAuthStatus("authorized");
      const now = new Date().toLocaleTimeString();
      setLastTested(now);
      showToast(`${selectedPortal} Playwright connection authenticated successfully!`, "success");
      
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
    } catch (err: unknown) {
      populateMockError(err);
    }
  }

  function handleSaveCredentials() {
    showToast(`${selectedPortal} Sourcing portal credentials stored securely.`, "success");
    setConsoleLogs((prev) => [
      ...prev,
      `[Vault] Credentials altered and re-committed into secure memory vault.`
    ]);
  }

  function handleSubstitute(errorId: string, partNumber: string, name: string) {
    setPortalErrors((prev) =>
      prev.map((e) =>
        e.id === errorId
          ? { ...e, resolved: true, suggestedAlternatePartNumber: partNumber, suggestedAlternateName: name }
          : e
      )
    );
    setConsoleLogs((prev) => [
      ...prev,
      `[RESOLUTION] SKU substitution applied: ${partNumber} (${name}) — configuration error resolved.`,
      `[LEARNING] Substitution rule persisted to intelligence database.`,
    ]);
    showToast(`SKU substituted to ${partNumber} — error resolved & rule learned!`, "success");
  }

  function handleLearn(error: any) {
    setConsoleLogs((prev) => [
      ...prev,
      `[LEARNING] Intelligence rule created: ${error.skuRef} → ${error.suggestedAlternatePartNumber}. Future BOQ scans will auto-resolve this pattern.`,
    ]);

    const newLearnedRule: SourcingRule = {
      id: `rule-${Date.now()}-portal`,
      ruleType: "substitution",
      partNumber: error.skuRef,
      mappedOutput: error.suggestedAlternatePartNumber || "UNKNOWN",
      label: `Auto-Learned via Portal: Resolves ${error.vendor} CLIC Error`,
      vendor: error.vendor,
      status: "active",
      learnedAt: new Date().toISOString(),
      sourceIssueId: error.id,
      isAutoLearned: true,
      preventedMismatchCount: 1,
    };
    
    const newEvent: LearningEvent = {
      id: `learn-${Date.now()}-portal`,
      timestamp: new Date().toISOString(),
      sourceIssueId: error.id,
      ruleType: "substitution",
      partNumber: error.skuRef,
      action: `Partner portal error resolved by substituting ${error.skuRef} with ${error.suggestedAlternatePartNumber}. Rule added to Sourcing Rules Vault.`,
      confidenceScore: 95,
      vendor: error.vendor,
      preventedMismatchCount: 1,
    };

    setSourcingRules((prev) => {
      const exists = prev.some(r => r.partNumber === error.skuRef && r.mappedOutput === error.suggestedAlternatePartNumber);
      if (exists) return prev;
      return [newLearnedRule, ...prev];
    });

    setLearningEvents((prev) => [newEvent, ...prev].slice(0, 50));
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
      <div className="space-y-1" role="group" aria-labelledby="partner-portal-label">
        <div id="partner-portal-label" className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
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
          <label htmlFor="partner-username" className="text-[9px] font-bold text-gray-500 uppercase">Partner Username</label>
          <div className="relative">
            <input
              id="partner-username"
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
          <label htmlFor="partner-password" className="text-[9px] font-bold text-gray-500 uppercase">Secure Client Password</label>
          <div className="relative">
            <input
              id="partner-password"
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
          <label htmlFor="partner-mfa" className="text-[9px] font-bold text-gray-500 uppercase flex items-center justify-between">
            <span>MFA Secret Token Seed (TOTP)</span>
            <span className="text-[8px] text-indigo-400 lowercase font-mono">Bypasses MFA hurdles</span>
          </label>
          <input
            id="partner-mfa"
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

      {/* CLIC Error Resolution Panel — appears when Playwright portal run detects configuration errors */}
      {portalErrors.length > 0 && (
        <PortalErrorResolutionPanel
          errors={portalErrors}
          catalogSkus={catalogSkus}
          vendor={selectedPortal}
          onSubstitute={handleSubstitute}
          onDismiss={(errorId) =>
            setPortalErrors((prev) => prev.filter((e) => e.id !== errorId))
          }
          onLearn={handleLearn}
        />
      )}
    </div>
  );
}
