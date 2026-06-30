import { describe, expect, it } from "vitest";
import {
  CATALOG_SKUS,
  FORENSIC_ISSUES,
  SOLUTIONS,
  UCIDS,
  VENDORS,
} from "../../lib/mockData";
import { BOQ_PRESETS } from "../../mocks/boqMocks";
import { INITIAL_RULES } from "../../mocks/sourcingMocks";
import {
  CatalogSKUSchema,
  ForensicIssueSchema,
  SolutionProjectSchema,
  SolutionSchema,
  SourcingRuleSchema,
  UCIDSchema,
  VendorSchema,
} from "../../types/zodSchemas";

function expectSchemaArray<T>(label: string, values: unknown[], schema: { safeParse: (value: unknown) => { success: boolean; error?: { issues: unknown[] }; data?: T } }) {
  values.forEach((value, index) => {
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      console.error(`${label}[${index}] schema mismatch:`, parsed.error?.issues);
    }
    expect(parsed.success).toBe(true);
  });
}

describe("Initial mock data contract alignment", () => {
  it("validates primary persisted core-store seed arrays", () => {
    expectSchemaArray("UCIDS", UCIDS, UCIDSchema);
    expectSchemaArray("SOLUTIONS", SOLUTIONS, SolutionProjectSchema);
    expectSchemaArray("VENDORS", VENDORS, VendorSchema);
    expectSchemaArray("CATALOG_SKUS", CATALOG_SKUS, CatalogSKUSchema);
    expectSchemaArray("FORENSIC_ISSUES", FORENSIC_ISSUES, ForensicIssueSchema);
    expectSchemaArray("INITIAL_RULES", INITIAL_RULES, SourcingRuleSchema);
  });

  it("validates every BOQ preset solution payload", () => {
    Object.entries(BOQ_PRESETS).forEach(([presetName, preset]) => {
      expect(preset.rawText.length, `${presetName} should include source raw text`).toBeGreaterThan(0);
      expectSchemaArray(`${presetName}.sols`, preset.sols, SolutionSchema);
    });
  });
});
