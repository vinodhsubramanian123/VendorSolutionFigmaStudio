/**
 * ============================================================================
 * SOURCING RULES REGISTRY
 * ============================================================================
 * File: /src/config/sourcingRules.ts
 *
 * This file replaces scattered hardcoded strings (e.g., specific SKU IDs) 
 * across the application with a centralized registry.
 * By decoupling these from the UI components, it becomes easier to inject
 * dynamic rules from a backend configuration endpoint later.
 */

export const ActiveSourcingRules = {
  // Legacy or EOL parts that trigger warnings
  legacySKUs: [
    "815100-B21", // Legacy HPE processor
  ],
  
  // Suggested replacements mapped to legacy SKUs
  replacements: {
    "815100-B21": "P40424-B21", // Intel Xeon Gold 6430
  },

  // Vendor-specific thresholds
  thresholds: {
    dellOverchargeBaseLimit: 1190,
    dellOverchargeSKU: "400-BPSB",
    
    ciscoMemorySymmetryDivisor: 8,
  }
};
