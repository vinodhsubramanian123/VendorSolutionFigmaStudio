import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BrainCircuit, X, Send, Sparkles, AlertCircle, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import type { SourcingRule } from "../../types";

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

export function LearningLoopInjector({ onRuleDrafted, onClose }: LearningLoopInjectorProps) {
  const [state, setState] = useState<InjectorState>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "agent",
      text: "I am ready to learn. Describe the intelligence rule or hardware constraint you want to add.",
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Temporary storage for parsed semantic intent
  const [parsedIntent, setParsedIntent] = useState<Partial<SourcingRule>>({});

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const analyzeInitialInput = (text: string) => {
    const lower = text.toLowerCase();
    
    // Mock NLP Parser Logic
    let ruleType: SourcingRule["ruleType"] = "substitution";
    if (lower.includes("symmetry") || lower.includes("balance") || lower.includes("memory") || lower.includes("require")) {
      ruleType = "symmetry";
    } else if (lower.includes("cap") || lower.includes("price") || lower.includes("$")) {
      ruleType = "price_cap";
    }

    setParsedIntent({
      ruleType,
      label: text, // Use the raw description as the narrative
      vendor: lower.includes("cisco") ? "Cisco" : lower.includes("dell") ? "Dell" : "HPE"
    });

    setState("clarifying_target");
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "agent",
        text: `I've mapped this as a "${ruleType.toUpperCase()}" rule for ${lower.includes("cisco") ? "Cisco" : lower.includes("dell") ? "Dell" : "HPE"}. However, I need the exact target parameter this applies to (e.g., "Memory", "P40424-B21", or "All Chassis"). What should I target?`,
        isActionable: true,
      }
    ]);
  };

  const finalizeRule = (scopeText: string) => {
    const rule: SourcingRule = {
      id: "rule-draft-" + Date.now(),
      ruleType: parsedIntent.ruleType || "substitution",
      partNumber: `${parsedIntent.partNumber} [Scope: ${scopeText}]`,
      mappedOutput: "SYMMETRY_ENFORCED", // Mock mapped output for now
      label: parsedIntent.label || "Auto-learned rule",
      vendor: parsedIntent.vendor || "HPE",
      status: "draft",
      isAutoLearned: true,
      learnedAt: new Date().toISOString(),
    };

    if (rule.ruleType === "price_cap") rule.mappedOutput = "5000";

    setState("drafting");
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "agent",
        text: `Perfect. I've successfully mapped the intelligence with strict boundaries to prevent it from bleeding into other areas. Generating draft rule for quarantine...`,
      }
    ]);

    setTimeout(() => {
      onRuleDrafted(rule);
    }, 1500);
  };

  const handleSend = () => {
    if (!inputValue.trim() || state === "parsing" || state === "drafting") return;

    const userText = inputValue.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: "human", text: userText }]);
    setInputValue("");

    if (state === "idle") {
      setState("parsing");
      setTimeout(() => analyzeInitialInput(userText), 1500);
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
            text: `Got it. Target is set to "${userText}". Finally, to prevent spamming irrelevant items, what is the strict scope level for this rule? (e.g. "Global Brand", "Specific Category Only", "Exact SKU Match Only")`,
            isActionable: true,
          }
        ]);
      }, 1000);
    } else if (state === "clarifying_scope") {
      setState("parsing");
      setTimeout(() => finalizeRule(userText), 1200);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0, y: -10 }}
      animate={{ opacity: 1, height: "auto", y: 0 }}
      exit={{ opacity: 0, height: 0, scale: 0.95 }}
      className="rounded-xl border bg-black/40 overflow-hidden mb-4 flex flex-col"
      style={{ borderColor: "rgba(74, 133, 253, 0.3)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-indigo-500/20 bg-indigo-500/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          <h4 className="text-xs font-bold text-indigo-100 uppercase tracking-wider font-mono">
            Semantic Intelligence Injector
          </h4>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="p-4 flex flex-col gap-3 max-h-[300px] overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "human" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-lg p-3 text-xs leading-relaxed ${
              msg.sender === "human" 
                ? "bg-indigo-500/20 border border-indigo-500/30 text-indigo-100 rounded-br-sm" 
                : "bg-white/5 border border-white/10 text-gray-300 rounded-bl-sm"
            }`}>
              {msg.sender === "agent" && (
                <div className="flex items-center gap-1.5 mb-1.5 text-[9px] font-bold text-indigo-400 uppercase tracking-wider">
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
      <div className="p-3 border-t border-white/5 bg-black/50 flex items-center gap-2">
        <input 
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={state.includes("clarifying") ? "Type the missing parameter..." : "Describe the intelligence..."}
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
    </motion.div>
  );
}
