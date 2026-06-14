import { SourcingRule } from "../types";
import { ActiveSourcingRules } from "../config/sourcingRules";

export const INITIAL_RULES: SourcingRule[] = [
  {
    id: "rule-1",
    ruleType: "substitution",
    partNumber: ActiveSourcingRules.legacySKUs[0],
    mappedOutput: "P40424-B21",
    label: "Obsolete Intel Xeon 6130 replacements mapping to Gen11 Gold 6430",
    vendor: "HPE",
    status: "active",
    isAutoLearned: false,
  },
  {
    id: "rule-2",
    ruleType: "price_cap",
    partNumber: ActiveSourcingRules.thresholds.dellOverchargeSKU,
    mappedOutput: ActiveSourcingRules.thresholds.dellOverchargeBaseLimit.toString(),
    label: "Locked premier contractual rate overcharge guard for Enterprise NVMe Read Intensive SSDs",
    vendor: "Dell",
    status: "active",
    isAutoLearned: false,
  },
  {
    id: "rule-3",
    ruleType: "symmetry",
    partNumber: "Memory",
    mappedOutput: "multiple_of_8",
    label: "Verify odd configuration lines check and rebalance into symmetric 8-channel modules",
    vendor: "Cisco",
    status: "active",
    isAutoLearned: false,
  },
];
