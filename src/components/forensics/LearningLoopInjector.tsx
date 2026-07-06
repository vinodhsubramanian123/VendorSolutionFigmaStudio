import React, { useState } from "react";
import { motion } from "motion/react";
import { BrainCircuit, X } from "lucide-react";
import type { SourcingRule } from "../../types";
import { NLPParser } from "./NLPParser";
import { AdviceFileIngestion, AdviceTriageItem } from "./AdviceFileIngestion";
import { RefineRuleOverlay } from "./RefineRuleOverlay";

interface LearningLoopInjectorProps {
  onRuleDrafted: (rule: SourcingRule) => void;
  onClose: () => void;
}

export function LearningLoopInjector({ onRuleDrafted, onClose }: LearningLoopInjectorProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "file">("chat");

  // Shared file ingestion state
  const [adviceItems, setAdviceItems] = useState<AdviceTriageItem[]>([]);
  const [bomItems, setBomItems] = useState<Record<string, string | number | boolean | null>[]>([]);
  const [configRows, setConfigRows] = useState<Record<string, string | number | boolean | null>[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [ignoredSheets, setIgnoredSheets] = useState<string[]>([]);
  
  // Refine Rule overlay state
  const [refiningItem, setRefiningItem] = useState<AdviceTriageItem | null>(null);

  const handleDraftAdviceRule = (item: AdviceTriageItem) => {
    setRefiningItem(item);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0, y: -10 }}
      animate={{ opacity: 1, height: "auto", y: 0 }}
      exit={{ opacity: 0, height: 0, scale: 0.95 }}
      className="rounded-xl border bg-surface-canvas/40 overflow-hidden mb-4 flex flex-col relative"
      style={{ borderColor: "rgba(74, 133, 253, 0.3)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-brand-indigo/20 bg-brand-indigo/10 shrink-0">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4.5 h-4.5 text-brand-indigo" />
          <h4 className="text-xs font-bold text-indigo-100 uppercase tracking-wider font-mono">
            Semantic Intelligence Injector
          </h4>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="text-content-secondary hover:text-content-primary transition cursor-pointer border-0 bg-transparent">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-surface-canvas/35 border-b border-white/5 p-1 shrink-0">
        <button type="button"
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === "chat" 
              ? "bg-brand-indigo/20 text-content-primary border border-brand-indigo/30" 
              : "text-content-secondary hover:text-content-primary hover:bg-white/5 border border-transparent"
          }`}
        >
          AI Semantic Agent
        </button>
        <button type="button"
          onClick={() => setActiveTab("file")}
          className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === "file" 
              ? "bg-brand-indigo/20 text-content-primary border border-brand-indigo/30" 
              : "text-content-secondary hover:text-content-primary hover:bg-white/5 border border-transparent"
          }`}
        >
          Advice File Ingestion
        </button>
      </div>

      {/* Tabs Panel Workspace */}
      <div className="flex-1 flex flex-col min-h-0">
        {activeTab === "chat" ? (
          <NLPParser onRuleDrafted={onRuleDrafted} />
        ) : (
          <AdviceFileIngestion
            onDraftAdviceRule={handleDraftAdviceRule}
            adviceItems={adviceItems}
            setAdviceItems={setAdviceItems}
            bomItems={bomItems}
            setBomItems={setBomItems}
            configRows={configRows}
            setConfigRows={setConfigRows}
            uploadSuccess={uploadSuccess}
            setUploadSuccess={setUploadSuccess}
            ignoredSheets={ignoredSheets}
            setIgnoredSheets={setIgnoredSheets}
          />
        )}
      </div>

      {/* Refine Overlay */}
      <RefineRuleOverlay
        refiningItem={refiningItem}
        setRefiningItem={setRefiningItem}
        onRuleDrafted={onRuleDrafted}
        setAdviceItems={setAdviceItems}
      />
    </motion.div>
  );
}
