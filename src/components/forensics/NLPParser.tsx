import React, { useState, useRef, useEffect } from "react";
import { BrainCircuit, Send, Loader2 } from "lucide-react";
import { apiClient } from "../../services/apiClient";
import type { SourcingRule } from "../../types";
import { logger } from "../../utils/logger";
import { motion, AnimatePresence } from "motion/react";

interface ChatMessage {
  id: string;
  sender: "human" | "agent";
  text: string;
  isActionable?: boolean;
}

type InjectorState = "idle" | "parsing" | "clarifying_target" | "clarifying_scope" | "drafting";

interface NLPParserProps {
  onRuleDrafted: (rule: SourcingRule) => void;
}

export function NLPParser({ onRuleDrafted }: NLPParserProps) {
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || state === "parsing" || state === "drafting") return;

    const userText = inputValue.trim();
    setMessages(prev => [...prev, { id: crypto.randomUUID(), sender: "human", text: userText }]);
    setInputValue("");

    if (state === "idle") {
      setState("parsing");
      try {
        const res = await apiClient.post<Partial<SourcingRule>>("/api/agents/semantic-map", { message: userText });
        const intent = res.data || {};
        setParsedIntent(intent);
        
        setState("clarifying_target");
        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            sender: "agent",
            text: `I've mapped this as a "${(intent.ruleType || 'substitution').toUpperCase()}" rule for ${intent.vendor || 'HPE'}. I detected the target SKU "${intent.partNumber || 'Unknown'}". Is this correct, or should we target a different SKU/parameter code?`,
            isActionable: true,
          }
        ]);
      } catch (e) {
        logger.error("Failed to map semantic intent", e);
      }
    } else if (state === "clarifying_target") {
      setParsedIntent(prev => ({ ...prev, partNumber: userText }));
      setState("parsing");
      // NOTE: This step is a pure client-side state transition (accumulating
      // parsedIntent from the conversation) -- there is no real agent/backend
      // work to do here. Previously this called POST /api/agents/run with
      // {message: userText}, which is the Playwright partner-portal scraper
      // endpoint (see PlaywrightRunRequestSchema in server.ts: agentName,
      // ucidRef, targetPortalUrl, bypassCaptchas). The response was never read.
      // Under MSW that "succeeded" silently because the mock doesn't validate
      // the body; against the real server it would 400 and the catch block
      // would strand every user at this step. Removed rather than reshaped
      // into a fake Playwright payload -- this flow was never meant to call
      // that endpoint.
      setState("clarifying_scope");
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: "agent",
          text: `Got it. Target parameter set to "${userText}". To prevent rule bleeding, what is the strict scope level for this directive? (e.g. "Global Brand", "Specific Category Only", "Exact SKU Match Only")`,
          isActionable: true,
        }
      ]);
    } else if (state === "clarifying_scope") {
      const allowedScopes = ["Global Brand", "Specific Category Only", "Exact SKU Match Only"];
      const scopeMatch = allowedScopes.find(s => s.toLowerCase() === userText.toLowerCase());
      
      if (!scopeMatch) {
        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            sender: "agent",
            text: `Invalid scope detected to prevent blast radius. You must explicitly reply with one of the following strict scopes: "Global Brand", "Specific Category Only", or "Exact SKU Match Only".`,
            isActionable: true,
          }
        ]);
        return;
      }

      setState("parsing");
      // Same rationale as clarifying_target above: no real backend call
      // belongs here, this is local state accumulation before the actual
      // persistence call in finalizeRule() -> POST /api/taxonomy/rules.
      try {
        await finalizeRule(scopeMatch);
      } catch (e) {
        logger.error("Failed to finalize semantic rule scope", e);
      }
    }
  };

  const finalizeRule = async (scopeText: string) => {
    const rule: SourcingRule = {
      id: crypto.randomUUID(),
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
        id: crypto.randomUUID(),
        sender: "agent",
        text: `Perfect. Generating draft override policy and writing to Sourcing Override Registry...`,
      }
    ]);

    try {
      await apiClient.post("/api/taxonomy/rules", rule);
      onRuleDrafted(rule);
    } catch (e) {
      logger.error("Failed to persist drafting rule to taxonomy", e);
    }
  };

  return (
    <>
      <div className="p-4 flex flex-col gap-3 max-h-[300px] overflow-y-auto custom-scrollbar flex-1">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              key={msg.id} 
              className={`flex ${msg.sender === "human" ? "justify-end" : "justify-start"}`}
            >
            <div className={`max-w-[80%] rounded-lg p-3 text-xs leading-relaxed ${
              msg.sender === "human" 
                ? "bg-brand-indigo/20 border border-brand-indigo/30 text-indigo-100 rounded-br-sm" 
                : "bg-white/5 border border-white/10 text-content-secondary rounded-bl-sm"
            }`}>
              {msg.sender === "agent" && (
                <div className="flex items-center gap-1.5 mb-1.5 text-[9px] font-bold text-brand-indigo uppercase tracking-wider font-mono">
                  <BrainCircuit className="w-3 h-3" /> Agent
                </div>
              )}
              {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {state === "parsing" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex justify-start"
            >
              <div className="max-w-[80%] rounded-lg p-3 bg-white/5 border border-white/10 text-content-secondary rounded-bl-sm flex items-center gap-2 text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-indigo" />
                Parsing semantic intent...
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-white/5 bg-surface-canvas/50 flex items-center gap-2 shrink-0">
        <input 
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={state.includes("clarifying") ? "Type the missing parameter..." : "Describe the override rule or paste warning logs..."}
          disabled={state === "parsing" || state === "drafting"}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-content-primary placeholder-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus:border-brand-indigo/50 disabled:opacity-50"
        />
        <button type="button" 
          onClick={handleSend}
          disabled={!inputValue.trim() || state === "parsing" || state === "drafting"}
          className="p-2 rounded-lg bg-brand-indigo hover:bg-brand-indigo disabled:bg-gray-700 disabled:text-content-primary0 text-content-primary transition cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}
