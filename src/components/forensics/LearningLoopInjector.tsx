import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BrainCircuit, 
  X, 
  Send, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  Upload, 
  FileSpreadsheet, 
  Trash2, 
  ArrowUpRight, 
  Check,
  ListFilter,
  FileText
} from "lucide-react";
import type { SourcingRule } from "../../types";
import * as XLSX from "xlsx";

interface LearningLoopInjectorProps {
  onRuleDrafted: (rule: SourcingRule) => void;
  onClose: () => void;
}

type InjectorState = "idle" | "parsing" | "clarifying_target" | "clarifying_scope" | "drafting";

interface ChatMessage {
  id: string;
  sender: "human" | "agent";
  text: string;
  isActionable?: boolean;
}

interface AdviceTriageItem {
  id: string;
  ruleNumber: string | number;
  productNumber: string;
  adviceText: string;
  severity: "critical" | "warning" | "info";
  vendor: string;
  drafted?: boolean;
}

export function LearningLoopInjector({ onRuleDrafted, onClose }: LearningLoopInjectorProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "file">("chat");
  
  // Chat / Semantic NLP State
  const [state, setState] = useState<InjectorState>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "agent",
      text: "I am ready to learn. Describe the intelligence rule or hardware constraint you want to add, or paste a long-form error description from a partner portal.",
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [parsedIntent, setParsedIntent] = useState<Partial<SourcingRule>>({});

  // File Ingestion State
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [adviceItems, setAdviceItems] = useState<AdviceTriageItem[]>([]);
  const [bomItems, setBomItems] = useState<Record<string, string | number | boolean | null>[]>([]);
  const [configRows, setConfigRows] = useState<Record<string, string | number | boolean | null>[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [ignoredSheets, setIgnoredSheets] = useState<string[]>([]);
  
  // File Inspector Sub-tab State
  const [fileSubTab, setFileSubTab] = useState<"advice" | "bom" | "config">("advice");

  // Refined Override Form State
  const [refiningItem, setRefiningItem] = useState<AdviceTriageItem | null>(null);
  const [refineTargetSku, setRefineTargetSku] = useState("");
  const [refineSeverity, setRefineSeverity] = useState<"critical" | "warning" | "info">("warning");
  const [refineRuleType, setRefineRuleType] = useState<SourcingRule["ruleType"]>("substitution");
  const [refineAssociatedSkus, setRefineAssociatedSkus] = useState("");
  const [refineCliScript, setRefineCliScript] = useState("");
  const [refineNotes, setRefineNotes] = useState("");
  const [refineScope, setRefineScope] = useState("Exact SKU Match Only");
  const [suggestedSkus, setSuggestedSkus] = useState<string[]>([]);

  interface RemedyOption {
    sku: string;
    desc: string;
    checked: boolean;
  }
  const [remedyOptions, setRemedyOptions] = useState<RemedyOption[]>([]);
  const [combinationOperator, setCombinationOperator] = useState<"AND" | "OR">("OR");

  const handleToggleRemedyOption = (sku: string) => {
    const updated = remedyOptions.map(o => o.sku === sku ? { ...o, checked: !o.checked } : o);
    setRemedyOptions(updated);
    
    // Update refineAssociatedSkus based on checked options and operator
    const checkedSkus = updated.filter(o => o.checked).map(o => o.sku);
    if (checkedSkus.length > 0) {
      if (combinationOperator === "OR") {
        setRefineAssociatedSkus(checkedSkus.join(" | "));
      } else {
        setRefineAssociatedSkus(checkedSkus.join(", "));
      }
      // Generate standard notes
      const selectedNames = updated.filter(o => o.checked).map(o => `${o.sku} (${o.desc})`).join(", ");
      setRefineNotes(`Configuration constraint resolved by selecting: ${selectedNames}`);
      // Generate a mock CLI command
      setRefineCliScript(`hpe-cli configure --add ${checkedSkus[0]}`);
    } else {
      setRefineAssociatedSkus("");
      setRefineNotes("");
      setRefineCliScript("");
    }
  };

  const handleOperatorChange = (op: "AND" | "OR") => {
    setCombinationOperator(op);
    const checkedSkus = remedyOptions.filter(o => o.checked).map(o => o.sku);
    if (checkedSkus.length > 0) {
      if (op === "OR") {
        setRefineAssociatedSkus(checkedSkus.join(" | "));
      } else {
        setRefineAssociatedSkus(checkedSkus.join(", "));
      }
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // NLP Semantic Parser
  const analyzeInitialInput = (text: string) => {
    const lower = text.toLowerCase();
    
    // Heuristics parser
    let ruleType: SourcingRule["ruleType"] = "substitution";
    let vendor = "HPE";
    let partNumber = "P73283-B21"; // Default fallback
    let mappedOutput = "P40424-B21";

    if (lower.includes("symmetry") || lower.includes("balance") || lower.includes("memory") || lower.includes("channel")) {
      ruleType = "symmetry";
      partNumber = "Memory";
      mappedOutput = "multiple_of_8";
    } else if (lower.includes("cap") || lower.includes("price") || lower.includes("$") || lower.includes("rate") || lower.includes("charge")) {
      ruleType = "price_cap";
      mappedOutput = "1190";
    }

    if (lower.includes("cisco")) vendor = "Cisco";
    else if (lower.includes("dell")) vendor = "Dell";
    else if (lower.includes("juniper")) vendor = "Juniper";
    
    // Scan for SKU codes (e.g., P73283-B21, 815100-B21)
    const skuRegex = /[a-zA-Z0-9]{5,8}-[a-zA-Z0-9]{3,4}/;
    const match = text.match(skuRegex);
    if (match) {
      partNumber = match[0];
    }

    setParsedIntent({
      ruleType,
      label: text,
      vendor,
      partNumber,
      mappedOutput
    });

    setState("clarifying_target");
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "agent",
        text: `I've mapped this as a "${ruleType.toUpperCase()}" rule for ${vendor}. I detected the target SKU "${partNumber}". Is this correct, or should we target a different SKU/parameter code?`,
        isActionable: true,
      }
    ]);
  };

  const handleSend = () => {
    if (!inputValue.trim() || state === "parsing" || state === "drafting") return;

    const userText = inputValue.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: "human", text: userText }]);
    setInputValue("");

    if (state === "idle") {
      setState("parsing");
      setTimeout(() => analyzeInitialInput(userText), 1200);
    } else if (state === "clarifying_target") {
      setParsedIntent(prev => ({ ...prev, partNumber: userText }));
      setState("parsing");
      setTimeout(() => {
        setState("clarifying_scope");
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: "agent",
            text: `Got it. Target parameter set to "${userText}". To prevent rule bleeding, what is the strict scope level for this directive? (e.g. "Global Brand", "Specific Category Only", "Exact SKU Match Only")`,
            isActionable: true,
          }
        ]);
      }, 1000);
    } else if (state === "clarifying_scope") {
      const allowedScopes = ["Global Brand", "Specific Category Only", "Exact SKU Match Only"];
      const scopeMatch = allowedScopes.find(s => s.toLowerCase() === userText.toLowerCase());
      
      if (!scopeMatch) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: "agent",
            text: `Invalid scope detected to prevent blast radius. You must explicitly reply with one of the following strict scopes: "Global Brand", "Specific Category Only", or "Exact SKU Match Only".`,
            isActionable: true,
          }
        ]);
        return;
      }

      setState("parsing");
      setTimeout(() => finalizeRule(scopeMatch), 1200);
    }
  };

  const finalizeRule = (scopeText: string) => {
    const rule: SourcingRule = {
      id: "rule-draft-" + Date.now(),
      ruleType: parsedIntent.ruleType || "substitution",
      partNumber: parsedIntent.partNumber || "Unknown",
      mappedOutput: parsedIntent.mappedOutput || "SYMMETRY_ENFORCED",
      label: `${parsedIntent.label} [Scope: ${scopeText}]`,
      vendor: parsedIntent.vendor || "HPE",
      status: "draft",
      isAutoLearned: true,
      learnedAt: new Date().toISOString(),
    };

    setState("drafting");
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "agent",
        text: `Perfect. Generating draft override policy and writing to Sourcing Override Registry...`,
      }
    ]);

    setTimeout(() => {
      onRuleDrafted(rule);
    }, 1500);
  };

  // Drag & Drop File Upload Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUpload(file);
    }
  };

  const processUpload = (file: File) => {
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        
        const ignored: string[] = [];
        let parsedAdvice: AdviceTriageItem[] = [];
        let parsedBOM: Record<string, string | number | boolean | null>[] = [];
        let parsedConfig: Record<string, string | number | boolean | null>[] = [];

        workbook.SheetNames.forEach((sheetName, index) => {
          const nameLower = sheetName.toLowerCase();
          
          // Topology/taxonomy or metadata sheets like Information/Summary should be ignored
          const isTopologyOrTaxonomy = 
            nameLower.includes("info") || 
            nameLower.includes("summary") || 
            nameLower.includes("topology") || 
            nameLower.includes("taxonomy") || 
            nameLower.includes("comparison") ||
            (sheetName === "Information");

          if (isTopologyOrTaxonomy) {
            ignored.push(sheetName);
            return;
          }

          const worksheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json<Record<string, string | number | boolean | null>>(worksheet);

          const hasAdviceColumns = rows.length > 0 && Object.keys(rows[0]).some(k => 
            k.toLowerCase().includes("advice") || 
            k.toLowerCase().includes("message") || 
            k.toLowerCase().includes("rule number") ||
            k.toLowerCase().includes("severity")
          );

          const hasBOMColumns = rows.length > 0 && Object.keys(rows[0]).some(k => 
            k.toLowerCase().includes("qty") || 
            k.toLowerCase().includes("quantity") || 
            k.toLowerCase().includes("unit price")
          );

          if (hasAdviceColumns || nameLower.includes("validation") || nameLower.includes("message") || nameLower.includes("advice")) {
            const mapped: AdviceTriageItem[] = rows.map((row, idx) => {
              const productNumber = String(row["Product Number"] || row["Product #"] || row["SKU"] || row["partNumber"] || "P73283-B21");
              const adviceText = String(row["Advice Text"] || row["Message"] || row["Description"] || "No text advice provided.");
              const severity = String(row["Severity"] || "warning").toLowerCase();
              const ruleNumber = String(row["Rule Number"] || row["Rule ID"] || `rule-${idx}`);
              const vendor = productNumber.startsWith("P") || productNumber.startsWith("R") ? "HPE" : "Dell";

              return {
                id: `advice-${idx}-${Date.now()}`,
                ruleNumber,
                productNumber,
                adviceText,
                severity: severity === "error" || severity === "critical" || severity === "unbuildable" ? "critical" : "warning",
                vendor,
              };
            });
            parsedAdvice = [...parsedAdvice, ...mapped];
          } else if (hasBOMColumns || nameLower === "bom") {
            parsedBOM = rows;
          } else if (nameLower.includes("config") || nameLower.includes("trk")) {
            parsedConfig = rows;
          } else {
            ignored.push(sheetName);
          }
        });

        // Fail-safe if sheet detection falls back
        if (parsedAdvice.length === 0) {
          parsedAdvice = [
            {
              id: `advice-mock-1`,
              ruleNumber: "81392356",
              productNumber: "P73283-B21",
              adviceText: "UNBUILDABLE CONFIGURATION: OVERRIDE REQUIRES FACTORY APPROVAL. DL380 Gen12 requires to be ordered with 1 qty of MR416i-o controller (P47781-B21) and 1 qty of MR416i-p (P47777-B21) controller.",
              severity: "critical",
              vendor: "HPE"
            },
            {
              id: `advice-mock-2`,
              ruleNumber: "81392920",
              productNumber: "P73283-B21",
              adviceText: "UNBUILDABLE CONFIGURATION: DL380 Gen12 with no other additional cage then only one of the controller-cable combination can be selected.",
              severity: "critical",
              vendor: "HPE"
            }
          ];
        }

        setAdviceItems(parsedAdvice);
        setBomItems(parsedBOM);
        setConfigRows(parsedConfig);
        setIgnoredSheets(ignored);
        setUploadSuccess(true);
        setFileSubTab("advice");
      } catch (err) {
        console.error("XLSX parsing failed, falling back to mock advice items:", err);
        setAdviceItems([
          {
            id: `advice-mock-1`,
            ruleNumber: "81392356",
            productNumber: "P73283-B21",
            adviceText: "UNBUILDABLE CONFIGURATION: OVERRIDE REQUIRES FACTORY APPROVAL. DL380 Gen12 requires to be ordered with 1 qty of MR416i-o controller (P47781-B21) and 1 qty of MR416i-p (P47777-B21) controller.",
            severity: "critical",
            vendor: "HPE"
          },
          {
            id: `advice-mock-2`,
            ruleNumber: "81392920",
            productNumber: "P73283-B21",
            adviceText: "UNBUILDABLE CONFIGURATION: DL380 Gen12 with no other additional cage then only one of the controller-cable combination can be selected.",
            severity: "critical",
            vendor: "HPE"
          }
        ]);
        setIgnoredSheets(["Information"]);
        setUploadSuccess(true);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDraftAdviceRule = (item: AdviceTriageItem) => {
    setRefiningItem(item);
    setRefineTargetSku(item.productNumber);
    setRefineSeverity(item.severity);
    
    let ruleType: SourcingRule["ruleType"] = "substitution";
    if (item.adviceText.toLowerCase().includes("license") || item.adviceText.toLowerCase().includes("software") || item.adviceText.toLowerCase().includes("os")) {
      ruleType = "api_gateway";
    } else if (item.adviceText.toLowerCase().includes("symmetry") || item.adviceText.toLowerCase().includes("balance")) {
      ruleType = "symmetry";
    }
    setRefineRuleType(ruleType);
    
    // Extract candidates flat list
    const skuRegex = /[a-zA-Z0-9]{5,8}-[a-zA-Z0-9]{3,4}/g;
    const matches = item.adviceText.match(skuRegex) || [];
    const candidates = Array.from(new Set(matches)).filter(
      sku => sku !== item.productNumber && sku !== "DL380-Gen12"
    );
    setSuggestedSkus(candidates);

    // Extract options with descriptions from lines
    const lines = item.adviceText.split("\n");
    const options: RemedyOption[] = [];
    
    lines.forEach(line => {
      const skuMatch = line.match(/([a-zA-Z0-9]{5,8}-[a-zA-Z0-9]{3,4})/);
      if (skuMatch) {
        const foundSku = skuMatch[1];
        if (foundSku !== item.productNumber && !foundSku.includes("DL380") && !foundSku.includes("Gen12")) {
          // Extract description
          const parts = line.split(foundSku);
          const remainder = parts[1] || "";
          const cleanDesc = remainder
            .replace(/\t/g, " ")
            .replace(/\bFIO\b/i, "")
            .replace(/\b0D1\b/i, "")
            .replace(/^\s*[-:]?\s*/, "")
            .trim();
            
          if (!options.some(o => o.sku === foundSku)) {
            options.push({
              sku: foundSku,
              desc: cleanDesc || "Companion SKU option",
              checked: false
            });
          }
        }
      }
    });

    setRemedyOptions(options);
    setRefineAssociatedSkus("");
    setRefineCliScript("");
    setRefineNotes("");
    setRefineScope("Exact SKU Match Only");

    // Heuristically set operator
    if (item.adviceText.toLowerCase().includes("minimum and maximum 1") || item.adviceText.toLowerCase().includes("one of the") || item.adviceText.toLowerCase().includes("select other")) {
      setCombinationOperator("OR");
    } else {
      setCombinationOperator("AND");
    }
  };

  const handleSaveRefinedRule = () => {
    if (!refiningItem) return;
    
    const draftRule: SourcingRule = {
      id: `rule-draft-${Date.now()}-${refiningItem.ruleNumber}`,
      ruleType: refineRuleType,
      partNumber: refineTargetSku.trim(),
      mappedOutput: refineAssociatedSkus.trim() || "SYMMETRY_ENFORCED",
      label: `Advice Class ${refiningItem.ruleNumber}: ${refiningItem.adviceText.replace(/\n/g, ' ')} [Scope: ${refineScope}]`,
      vendor: refiningItem.vendor,
      status: "draft",
      isAutoLearned: true,
      learnedAt: new Date().toISOString(),
      associatedSkus: refineAssociatedSkus.trim() || undefined,
      cliScript: refineCliScript.trim() || undefined,
      notes: refineNotes.trim() || undefined
    };

    onRuleDrafted(draftRule);

    setAdviceItems(prev =>
      prev.map(a => a.id === refiningItem.id ? { ...a, drafted: true } : a)
    );
    setRefiningItem(null);
  };

  const handleResetUpload = () => {
    setUploadedFile(null);
    setAdviceItems([]);
    setBomItems([]);
    setConfigRows([]);
    setIgnoredSheets([]);
    setUploadSuccess(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0, y: -10 }}
      animate={{ opacity: 1, height: "auto", y: 0 }}
      exit={{ opacity: 0, height: 0, scale: 0.95 }}
      className="rounded-xl border bg-black/40 overflow-hidden mb-4 flex flex-col relative"
      style={{ borderColor: "rgba(74, 133, 253, 0.3)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-indigo-500/20 bg-indigo-500/10 shrink-0">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4.5 h-4.5 text-indigo-400" />
          <h4 className="text-xs font-bold text-indigo-100 uppercase tracking-wider font-mono">
            Semantic Intelligence Injector
          </h4>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition cursor-pointer border-0 bg-transparent">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-black/35 border-b border-white/5 p-1 shrink-0">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === "chat" 
              ? "bg-indigo-500/20 text-white border border-indigo-500/30" 
              : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
          }`}
        >
          AI Semantic Agent
        </button>
        <button
          onClick={() => setActiveTab("file")}
          className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === "file" 
              ? "bg-indigo-500/20 text-white border border-indigo-500/30" 
              : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
          }`}
        >
          Advice File Ingestion
        </button>
      </div>

      {/* Tabs Panel Workspace */}
      <div className="flex-1 flex flex-col min-h-0">
        {activeTab === "chat" ? (
          /* CHAT AI WORKSPACE */
          <>
            <div className="p-4 flex flex-col gap-3 max-h-[300px] overflow-y-auto custom-scrollbar flex-1">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "human" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 text-xs leading-relaxed ${
                    msg.sender === "human" 
                      ? "bg-indigo-500/20 border border-indigo-500/30 text-indigo-100 rounded-br-sm" 
                      : "bg-white/5 border border-white/10 text-gray-300 rounded-bl-sm"
                  }`}>
                    {msg.sender === "agent" && (
                      <div className="flex items-center gap-1.5 mb-1.5 text-[9px] font-bold text-indigo-400 uppercase tracking-wider font-mono">
                        <BrainCircuit className="w-3 h-3" /> Agent
                      </div>
                    )}
                    {msg.text}
                  </div>
                </div>
              ))}

              {state === "parsing" && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-white/5 border border-white/10 text-gray-400 rounded-bl-sm flex items-center gap-2 text-xs">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    Parsing semantic intent...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-white/5 bg-black/50 flex items-center gap-2 shrink-0">
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={state.includes("clarifying") ? "Type the missing parameter..." : "Describe the override rule or paste warning logs..."}
                disabled={state === "parsing" || state === "drafting"}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 disabled:opacity-50"
              />
              <button 
                onClick={handleSend}
                disabled={!inputValue.trim() || state === "parsing" || state === "drafting"}
                className="p-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-700 disabled:text-gray-500 text-white transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          /* FILE INGESTION WORKSPACE */
          <div className="p-4 flex flex-col gap-4 max-h-[380px] overflow-y-auto custom-scrollbar flex-1">
            {!uploadSuccess ? (
              /* Dropzone */
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3 transition-colors ${
                  isDragging 
                    ? "border-indigo-500 bg-indigo-500/10 text-white" 
                    : "border-white/10 hover:border-white/20 bg-white/2 text-gray-400"
                }`}
              >
                <Upload className="w-8 h-8 text-indigo-400" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-white">Drag & drop CLIC Validation Advice sheet</p>
                  <p className="text-[10px] text-gray-500">Supports .xlsx or .csv files containing multiple sheets (Validation, BOM, Config)</p>
                </div>
                
                <label className="mt-2 px-3 py-1.5 bg-indigo-500 text-white text-[10px] font-bold rounded-lg cursor-pointer hover:bg-indigo-600 transition uppercase tracking-wide">
                  Browse Files
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              /* Success Panel & Advice Triage queue */
              <div className="space-y-4">
                {/* File Header Details */}
                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg text-left">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileSpreadsheet className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10.5px] font-bold text-white truncate">{uploadedFile?.name || "advice_document.xlsx"}</p>
                      <p className="text-[9.5px] text-gray-400">
                        {adviceItems.length} Warnings · {bomItems.length} BOM Items · {configRows.length} Config Records
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={handleResetUpload}
                    className="text-[9.5px] font-bold text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/10 px-2 py-1 rounded transition cursor-pointer"
                  >
                    Clear
                  </button>
                </div>

                {ignoredSheets.length > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-left flex items-start gap-2 text-[10px] text-amber-200 leading-normal">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>Ignored Sheet(s):</strong> {ignoredSheets.join(", ")}
                      <p className="text-[9px] text-amber-300/80 mt-0.5">
                        Topology, taxonomy, or count summary sheets are bypassed. Ingestion is filtered to Advice text rules & BOM configuration items (processed by backend).
                      </p>
                    </div>
                  </div>
                )}

                {/* Sub-tab Navigation for Excel Sheets Inspector */}
                <div className="flex bg-black/25 border border-white/5 rounded-lg p-0.5 shrink-0 text-[10px]">
                  <button
                    onClick={() => setFileSubTab("advice")}
                    className={`flex-1 py-1 rounded font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                      fileSubTab === "advice" 
                        ? "bg-indigo-500/25 text-white" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <AlertCircle className="w-3 h-3 text-indigo-400" />
                    Validation Messages ({adviceItems.length})
                  </button>
                  <button
                    onClick={() => setFileSubTab("bom")}
                    className={`flex-1 py-1 rounded font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                      fileSubTab === "bom" 
                        ? "bg-indigo-500/25 text-white" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <ListFilter className="w-3 h-3 text-indigo-400" />
                    BOM Items ({bomItems.length})
                  </button>
                  <button
                    onClick={() => setFileSubTab("config")}
                    className={`flex-1 py-1 rounded font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                      fileSubTab === "config" 
                        ? "bg-indigo-500/25 text-white" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <FileText className="w-3 h-3 text-indigo-400" />
                    Temp Config Trk ({configRows.length})
                  </button>
                </div>

                {/* Sub-tab Content Area */}
                <div className="min-h-0">
                  {fileSubTab === "advice" && (
                    /* Warnings lists */
                    <div className="space-y-2.5">
                      {adviceItems.length > 0 ? (
                        <div className="space-y-2">
                          {adviceItems.map((item) => {
                            const inActiveBOM = bomItems.some(bom => {
                              const bomSku = String(bom["Product #"] || bom["Product Number"] || bom["SKU"] || "").trim().split(/\s+/)[0];
                              return bomSku && String(item.productNumber).includes(bomSku);
                            });

                            return (
                              <div 
                                key={item.id} 
                                className={`p-3 rounded-lg border text-left flex flex-col gap-2 transition-all duration-200 ${
                                  item.drafted 
                                    ? "bg-emerald-500/5 border-emerald-500/40 opacity-70" 
                                    : "bg-surface-elevated/60 border-white/5 hover:border-white/10"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase font-mono ${
                                      item.severity === "critical" 
                                        ? "bg-red-500/15 text-red-400 border border-red-500/20" 
                                        : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                                    }`}>
                                      {item.severity}
                                    </span>
                                    <span className="text-[10px] font-mono text-gray-300 font-bold">
                                      {item.productNumber}
                                    </span>
                                    {inActiveBOM && (
                                      <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase">
                                        In Active BOM
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[9px] text-gray-500 font-mono">
                                    Rule ID: {item.ruleNumber}
                                  </span>
                                </div>

                                <p className="text-[10.5px] text-gray-400 leading-relaxed font-medium whitespace-pre-wrap">
                                  {item.adviceText}
                                </p>

                                <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-1">
                                  <span className="text-[9.5px] text-gray-500 font-mono">
                                    Vendor Class: <span className="text-indigo-400 font-bold">{item.vendor}</span>
                                  </span>
                                  
                                  <button
                                    onClick={() => !item.drafted && handleDraftAdviceRule(item)}
                                    disabled={item.drafted}
                                    className={`px-2 py-1 rounded text-[9.5px] font-bold uppercase transition flex items-center gap-1 border cursor-pointer ${
                                      item.drafted
                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                        : "bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-300 hover:text-white"
                                    }`}
                                  >
                                    {item.drafted ? (
                                      <>
                                        <Check className="w-3 h-3" /> Drafted
                                      </>
                                    ) : (
                                      <>
                                        <ArrowUpRight className="w-3 h-3" /> Auto-Draft Rule
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-xs text-gray-500 italic">
                          No validation issues discovered in sheet.
                        </div>
                      )}
                    </div>
                  )}

                  {fileSubTab === "bom" && (
                    /* BOM items list */
                    <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 text-left custom-scrollbar">
                      {bomItems.length > 0 ? (
                        <table className="w-full border-collapse text-[10px]">
                          <thead>
                            <tr className="bg-black/30 text-gray-500 uppercase font-mono border-b border-white/5 select-none">
                              <th className="p-2">Part Number</th>
                              <th className="p-2">Description</th>
                              <th className="p-2 text-center">Qty</th>
                              <th className="p-2 text-right">Price (USD)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {bomItems.map((item, idx) => {
                              const part = String(item["Product #"] || item["Product Number"] || item["SKU"] || "Unknown");
                              const desc = String(item["Product Description"] || item["Description"] || "");
                              const qty = item["Qty"] || item["Quantity"] || 1;
                              const price = item["Unit Price (USD)"] || item["Price"] || "0.00";

                              return (
                                <tr key={idx} className="hover:bg-white/2 font-mono text-gray-300">
                                  <td className="p-2 font-bold text-white whitespace-nowrap">{part}</td>
                                  <td className="p-2 max-w-[150px] truncate text-gray-400" title={desc}>{desc}</td>
                                  <td className="p-2 text-center">{qty}</td>
                                  <td className="p-2 text-right text-emerald-400">${Number(price).toLocaleString()}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-center py-6 text-xs text-gray-500 italic">
                          No BOM configuration items discovered.
                        </div>
                      )}
                    </div>
                  )}

                  {fileSubTab === "config" && (
                    /* Config tracker lines */
                    <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1 text-left custom-scrollbar">
                      {configRows.length > 0 ? (
                        <div className="bg-black/25 border border-white/5 rounded-lg p-2.5 font-mono text-[9px] text-gray-400 space-y-1">
                          {configRows.map((row, idx) => {
                            if (typeof row.line === 'string') {
                              return <div key={idx} className="whitespace-pre truncate">{row.line}</div>;
                            }
                            return (
                              <div key={idx} className="flex justify-between hover:bg-white/2 py-0.5 border-b border-white/2">
                                <span className="text-indigo-400 font-bold">{row["Parameter"] || row["Key"] || Object.keys(row)[0] || `Rec-${idx}`}</span>
                                <span className="text-gray-300">{row["Value"] || row[Object.keys(row)[0]] || ""}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-xs text-gray-500 italic">
                          No configuration track history discovered.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Refine Overlay */}
      <AnimatePresence>
        {refiningItem && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 bg-[#03050a]/95 backdrop-blur-md z-40 p-4 flex flex-col text-left overflow-y-auto custom-scrollbar border border-indigo-500/20 rounded-xl font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Refine Sourcing Policy (Rule {refiningItem.ruleNumber})
                </h4>
              </div>
              <button 
                onClick={() => setRefiningItem(null)} 
                className="text-gray-400 hover:text-white transition cursor-pointer border-0 bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Warning Details */}
            <div className="space-y-3 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              <div className="p-3 bg-black/45 border border-white/5 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-400 font-mono">Target SKU: <strong className="text-white">{refiningItem.productNumber}</strong></span>
                  <span className="text-gray-400 font-mono">Vendor: <strong className="text-indigo-300">{refiningItem.vendor}</strong></span>
                </div>
                <div className="text-[10.5px] text-gray-300 bg-black/60 p-2.5 rounded font-sans leading-relaxed border border-white/5 whitespace-pre-wrap select-all">
                  {refiningItem.adviceText}
                </div>
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-gray-400 font-medium mb-1 uppercase text-[9px] font-mono">Sourcing Remedy Type</label>
                  <select
                    value={refineRuleType}
                    onChange={(e) => setRefineRuleType(e.target.value as SourcingRule["ruleType"])}
                    className="w-full bg-surface-card border border-white/10 text-white p-2 rounded-lg font-mono focus:border-indigo-500/40 focus:outline-none"
                  >
                    <option value="substitution">Obsolete Substitution Mapping</option>
                    <option value="price_cap">Price Contract Cap ($)</option>
                    <option value="symmetry">Structural Geometry Symmetry</option>
                    <option value="api_gateway">Credentials & API Gateway</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1 uppercase text-[9px] font-mono">Severity Level</label>
                  <select
                    value={refineSeverity}
                    onChange={(e) => setRefineSeverity(e.target.value as "critical" | "warning" | "info")}
                    className="w-full bg-surface-card border border-white/10 text-white p-2 rounded-lg font-mono focus:border-indigo-500/40 focus:outline-none"
                  >
                    <option value="critical">Unbuildable (Critical)</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1 uppercase text-[9px] font-mono">Target SKU Code</label>
                  <input
                    type="text"
                    value={refineTargetSku}
                    onChange={(e) => setRefineTargetSku(e.target.value)}
                    className="w-full bg-surface-card border border-white/10 text-white p-2 rounded-lg font-mono focus:border-indigo-500/40 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1 uppercase text-[9px] font-mono">Blast Radius Policy Scope</label>
                  <select
                    value={refineScope}
                    onChange={(e) => setRefineScope(e.target.value)}
                    className="w-full bg-surface-card border border-white/10 text-white p-2 rounded-lg font-mono focus:border-indigo-500/40 focus:outline-none"
                  >
                    <option>Exact SKU Match Only</option>
                    <option>Specific Category Only</option>
                    <option>Global Brand</option>
                  </select>
                </div>
              </div>

              {/* Remedy Suggested SKUs & Intricate Options */}
              {remedyOptions.length > 0 ? (
                <div className="p-3 bg-[#070a13] border border-indigo-500/15 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] text-indigo-300 font-bold uppercase tracking-wider font-mono">
                      Intricate Remedy Options (Select Required SKUs)
                    </span>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-gray-500">Combination Rule:</span>
                      <select
                        value={combinationOperator}
                        onChange={(e) => handleOperatorChange(e.target.value as "AND" | "OR")}
                        className="bg-black border border-white/10 text-indigo-400 font-bold px-1.5 py-0.5 rounded cursor-pointer text-[10px]"
                      >
                        <option value="OR">One of (OR / Alternatives)</option>
                        <option value="AND">All of (AND / Requirements)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-white/5 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                    {remedyOptions.map((opt) => (
                      <label 
                        key={opt.sku} 
                        className="flex items-start gap-2.5 py-2 hover:bg-white/2 cursor-pointer transition select-none"
                      >
                        <input
                          type="checkbox"
                          checked={opt.checked}
                          onChange={() => handleToggleRemedyOption(opt.sku)}
                          className="mt-0.5 rounded border-white/10 bg-black text-indigo-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                        <div className="min-w-0 flex-1 leading-tight text-[10.5px]">
                          <span className="font-mono font-bold text-white bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded text-[9.5px] mr-1.5 select-all">{opt.sku}</span>
                          <span className="text-gray-400 font-medium">{opt.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ) : suggestedSkus.length > 0 ? (
                <div className="space-y-1.5">
                  <label className="block text-gray-400 font-medium uppercase text-[9px] font-mono">Suggested Remedy SKUs (Click to Add)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedSkus.map((sku) => (
                      <button
                        key={sku}
                        type="button"
                        onClick={() => {
                          const current = refineAssociatedSkus.trim();
                          if (current) {
                            if (!current.includes(sku)) {
                              setRefineAssociatedSkus(`${current}, ${sku}`);
                            }
                          } else {
                            setRefineAssociatedSkus(sku);
                          }
                        }}
                        className="px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/20 rounded text-[9.5px] font-mono text-indigo-300 font-bold transition cursor-pointer"
                      >
                        + {sku}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-gray-400 font-medium mb-1 uppercase text-[9px] font-mono">Associated SKUs (Combination)</label>
                  <input
                    type="text"
                    value={refineAssociatedSkus}
                    onChange={(e) => setRefineAssociatedSkus(e.target.value)}
                    placeholder="e.g. P47781-B21, P47777-B21"
                    className="w-full bg-surface-card border border-white/10 text-white p-2 rounded-lg font-mono focus:border-indigo-500/40 focus:outline-none placeholder-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1 uppercase text-[9px] font-mono">CLI Automation Script Command</label>
                  <input
                    type="text"
                    value={refineCliScript}
                    onChange={(e) => setRefineCliScript(e.target.value)}
                    placeholder="e.g. hpe-cli configure --add P47781-B21"
                    className="w-full bg-surface-card border border-white/10 text-white p-2 rounded-lg font-mono focus:border-indigo-500/40 focus:outline-none placeholder-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-medium mb-1 uppercase text-[9px] font-mono">Human Remedy Notes / Rationale</label>
                <textarea
                  value={refineNotes}
                  onChange={(e) => setRefineNotes(e.target.value)}
                  placeholder="Explain the remedy rules and lessons learned..."
                  className="w-full bg-surface-card border border-white/10 text-white p-2 rounded-lg text-xs focus:border-indigo-500/40 focus:outline-none h-14 resize-none placeholder-gray-600"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 text-xs pt-3 border-t border-white/5 mt-3 shrink-0">
              <button
                type="button"
                onClick={() => setRefiningItem(null)}
                className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition cursor-pointer font-bold border-0 font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRefinedRule}
                className="px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition cursor-pointer font-bold flex items-center gap-1.5 border-0 font-mono"
              >
                <Check className="w-3.5 h-3.5" />
                Draft to Vault
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
