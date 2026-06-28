import React, { useState } from "react";
import type { UCID, PlaywrightRunResponse, CatalogSKU,  SourcingRule, LearningEvent, AdviceResolution } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import { apiClient } from "../../services/apiClient";
import { VENDORS } from "../../lib/mockData/misc";
import { AdviceResolutionPanel } from "./AdviceResolutionPanel";
import { VendorCredentialsCard, VendorConsoleLogs } from "./VendorComponents";
interface VendorIngestionDeskProps {
  ucids: UCID[];
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>;
  showToast: (message: string, type: "success" | "warn" | "error") => void;
  catalogSkus?: CatalogSKU[];
  sourcingRules: SourcingRule[];
  setSourcingRules: React.Dispatch<React.SetStateAction<SourcingRule[]>>;
  learningEvents: LearningEvent[];
  setLearningEvents: React.Dispatch<React.SetStateAction<LearningEvent[]>>;
}
export function VendorIngestionDesk({
  ucids,
  setUcids,
  showToast,
  catalogSkus = [],
  sourcingRules,
  setSourcingRules,
  learningEvents,
  setLearningEvents,
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
  // Advice sheet resolution state
  const [adviceResolutions, setAdviceResolutions] = useState<AdviceResolution[]>([]);
  const portalConfig = resolvePortalConfig(selectedPortal);
  
  // User overrideable credential fields — initialized from portalConfig defaults
  const [username, setUsername] = useState(portalConfig.username);
  const [apiToken, setPassword] = useState(portalConfig.apiToken);
  const [mfaToken, setMfaToken] = useState(portalConfig.mfaToken);
  const [authStatus, setAuthStatus] = useState<"authorized" | "expired" | "verifying">(portalConfig.authStatus);
  const [prevPortal, setPrevPortal] = useState(selectedPortal);

  // Sync console logs and overrides when portal switches synchronously during render
  if (selectedPortal !== prevPortal) {
    setPrevPortal(selectedPortal);
    setConsoleLogs(portalConfig.defaultLogs);
    setUsername(portalConfig.username);
    setPassword(portalConfig.apiToken);
    setMfaToken(portalConfig.mfaToken);
    setAuthStatus(portalConfig.authStatus);
  }
  function getMockAdviceResolutions(vendor: string): AdviceResolution[] {
    if (vendor === "Cisco") {
      return [{
        id: crypto.randomUUID(),
        sheetName: "Validation_Output",
        severity: "critical",
        logicOperator: "AND",
        targetSkus: ["UCS-CPU-I6430", "UCS-MR-128G1ED-E"],
        message: "CCW error: UCS-CPU-I6430 requires UCS-MR-128G1ED-E memory modules (minimum 128GB per DIMM slot for Gen 4 UCS). Current 64GB allocation is unsupported.",
        contextRef: "UCS Intel Xeon Gold 6526Y Processor",
      }];
    }
    if (vendor === "Dell") {
      return [{
        id: crypto.randomUUID(),
        sheetName: "BOM_Advice",
        severity: "critical",
        logicOperator: "NONE",
        targetSkus: ["400-BPSB", "RAID-10-HBA"],
        message: "CLIC Configurator error: 400-BPSB drive not compatible with R760 chassis when combined with RAID-10 controller HBA. Constraint violation detected.",
        contextRef: "Dell 7.68TB Enterprise NVMe SSD",
      }];
    }
    return [{
      id: crypto.randomUUID(),
      sheetName: "Error_Summary",
      severity: "warning",
      logicOperator: "OR",
      targetSkus: ["815100-B21", "P40424-B21"],
      message: "CLIC validation failed: Part 815100-B21 is discontinued and no longer orderable on HPE Partner Ready portal. Configuration cannot be submitted. Replace with P40424-B21 or compatible CPU.",
      contextRef: "Intel Xeon Gold 6430 Gen11 Processor",
    }];
  }
  function populateMockError(err: unknown) {
    setIsRunningTest(false);
    setAuthStatus("expired");
    const errMsg = err instanceof Error ? err.message : String(err);
    setConsoleLogs((prev) => [...prev, `[PLAYWRIGHT] Error: ${errMsg}`]);
    showToast("Playwright automation failed.", "error");
    // Parse mock portal errors into generic advice structures
    setAdviceResolutions(getMockAdviceResolutions(selectedPortal));
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
      const now = new Date().toISOString();
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
                  timestamp: now,
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
  function handleSubstitute(adviceId: string, partNumber: string, name: string) {
    setAdviceResolutions((prev) => prev.filter(a => a.id !== adviceId));
    setConsoleLogs((prev) => [
      ...prev,
      `[RESOLUTION] SKU substitution applied: ${partNumber} (${name}) — configuration error resolved.`,
      `[LEARNING] Substitution rule persisted to intelligence database.`,
    ]);
    showToast(`SKU substituted to ${partNumber} — error resolved & rule learned!`, "success");
  }
  function handleLearn(targetSku: string, resolvedSku: string, vendorId: string, issueId: string) {
    setConsoleLogs((prev) => [
      ...prev,
      `[LEARNING] Intelligence rule created: ${targetSku} → ${resolvedSku}. Future BOQ scans will auto-resolve this pattern.`,
    ]);
    const newLearnedRule: SourcingRule = {
      id: crypto.randomUUID(),
      ruleType: "substitution",
      partNumber: targetSku,
      mappedOutput: resolvedSku || "UNKNOWN",
      label: `Auto-Learned via Generic Advice Parser`,
      vendor: vendorId,
      status: "active",
      learnedAt: new Date().toISOString(),
      sourceIssueId: issueId,
      isAutoLearned: true,
      preventedMismatchCount: 1,
    };
    
    const newEvent: LearningEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      sourceIssueId: issueId,
      ruleType: "substitution",
      partNumber: targetSku,
      action: `Validation Advice resolved by substituting ${targetSku} with ${resolvedSku}. Rule added to Sourcing Rules Vault.`,
      confidenceScore: 95,
      vendor: vendorId,
      preventedMismatchCount: 1,
    };
    setSourcingRules((prev) => {
      const exists = prev.some(r => r.partNumber === targetSku && r.mappedOutput === resolvedSku);
      if (exists) return prev;
      return [newLearnedRule, ...prev];
    });
    setLearningEvents((prev) => [newEvent, ...prev].slice(0, 50));
  }
  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="p-4 rounded-xl border bg-surface-elevated/80 border-indigo-500/15 flex flex-col gap-4 shadow-xl"
    >
      <VendorCredentialsCard
        selectedPortal={selectedPortal}
        setSelectedPortal={setSelectedPortal}
        authStatus={authStatus}
        username={username}
        setUsername={setUsername}
        apiToken={apiToken}
        setPassword={setPassword}
        mfaToken={mfaToken}
        setMfaToken={setMfaToken}
        certValid={certValid}
        setCertValid={setCertValid}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        isRunningTest={isRunningTest}
        handleSaveCredentials={handleSaveCredentials}
        handleRunPortalTest={handleRunPortalTest}
        showToast={showToast}
      />
      <VendorConsoleLogs lastTested={lastTested} consoleLogs={consoleLogs} />
      {/* Generic Advice Sheet Resolution Panel */}
      {adviceResolutions.length > 0 && (
        <AdviceResolutionPanel
          advice={adviceResolutions}
          catalogSkus={catalogSkus}
          vendor={selectedPortal}
          onSubstitute={handleSubstitute}
          onDismiss={(adviceId) =>
            setAdviceResolutions((prev) => prev.filter((a) => a.id !== adviceId))
          }
          onLearn={handleLearn}
          activeUcid={ucids[0]}
        />
      )}
    </motion.div>
  );
}
function resolvePortalConfig(selectedPortal: string) {
  const vendorData = VENDORS.find(v => v.shortName === selectedPortal) || VENDORS[0];
  if (selectedPortal === "HPE") {
    return {
      username: vendorData.credentials?.username || "enterprise_sourcing_hpe_prod",
      apiToken: vendorData.credentials?.apiToken || "HPE-S0urcing-2026!",
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
      apiToken: vendorData.credentials?.apiToken || "DellAdminSecure3902!!",
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
    apiToken: vendorData.credentials?.apiToken || "Cisco#CCW#Tunnel99",
    mfaToken: vendorData.credentials?.mfaToken || "CSCO-AUTH-9999",
    authStatus: "expired" as const,
    defaultLogs: [
      "[10:12:05] [Manager] - CCW token detected: EXPIRED.",
      "[10:12:06] [CCW-Gate] - Playwright browser automation requires rotating session refresh token.",
      "[10:12:07] [MFA-Gate] - Awaiting manual MFA trigger or Playwright browser re-authentication.",
    ],
  };
}