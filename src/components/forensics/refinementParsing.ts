import type { SourcingRule } from "../../types";
import type { AdviceTriageItem } from "./AdviceFileIngestion";

export interface RemedyOption {
  sku: string;
  desc: string;
  checked: boolean;
}

export interface DerivedRefinement {
  targetSku: string;
  severity: AdviceTriageItem["severity"];
  ruleType: SourcingRule["ruleType"];
  suggestedSkus: string[];
  remedyOptions: RemedyOption[];
  combinationOperator: "AND" | "OR";
}

export function deriveRuleTypeFromAdviceText(adviceText: string): SourcingRule["ruleType"] {
  const lower = adviceText.toLowerCase();
  if (lower.includes("license") || lower.includes("software") || lower.includes("os")) {
    return "api_gateway";
  }
  if (lower.includes("symmetry") || lower.includes("balance")) {
    return "symmetry";
  }
  return "substitution";
}

export function extractSuggestedSkus(adviceText: string, productNumber: string): string[] {
  const skuRegex = /[a-zA-Z0-9]{5,8}-[a-zA-Z0-9]{3,4}/g;
  const matches = adviceText.match(skuRegex) || [];
  return Array.from(new Set(matches)).filter(
    sku => sku !== productNumber && sku !== "DL380-Gen12"
  );
}

export function extractRemedyOptionsFromLine(line: string, productNumber: string): RemedyOption | null {
  const skuMatch = line.match(/([a-zA-Z0-9]{5,8}-[a-zA-Z0-9]{3,4})/);
  if (!skuMatch) return null;

  const foundSku = skuMatch[1];
  if (foundSku === productNumber || foundSku.includes("DL380") || foundSku.includes("Gen12")) {
    return null;
  }

  const remainder = line.split(foundSku)[1] || "";
  const cleanDesc = remainder
    .replace(/\t/g, " ")
    .replace(/\bFIO\b/i, "")
    .replace(/\b0D1\b/i, "")
    .replace(/^\s*[-:]?\s*/, "")
    .trim();

  return { sku: foundSku, desc: cleanDesc || "Companion SKU option", checked: false };
}

export function extractRemedyOptions(adviceText: string, productNumber: string): RemedyOption[] {
  const options: RemedyOption[] = [];
  for (const line of adviceText.split("\n")) {
    const option = extractRemedyOptionsFromLine(line, productNumber);
    if (option && !options.some(o => o.sku === option.sku)) {
      options.push(option);
    }
  }
  return options;
}

export function deriveCombinationOperator(adviceText: string): "AND" | "OR" {
  const lower = adviceText.toLowerCase();
  const impliesEither = lower.includes("minimum and maximum 1") || lower.includes("one of the") || lower.includes("select other");
  return impliesEither ? "OR" : "AND";
}

// Pure helper consolidating all the advice-text parsing that used to live
// directly in RefineRuleOverlay's sync-on-prop-change effect. Keeping this
// outside the component keeps the component's own render logic simple, and
// each of the small extraction helpers above is independently testable.
export function deriveRefinementFromItem(item: AdviceTriageItem): DerivedRefinement {
  return {
    targetSku: item.productNumber,
    severity: item.severity,
    ruleType: deriveRuleTypeFromAdviceText(item.adviceText),
    suggestedSkus: extractSuggestedSkus(item.adviceText, item.productNumber),
    remedyOptions: extractRemedyOptions(item.adviceText, item.productNumber),
    combinationOperator: deriveCombinationOperator(item.adviceText),
  };
}
