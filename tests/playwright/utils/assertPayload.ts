import { expect } from '@playwright/test';
import { 
  UCIDSchema, 
  SourcingRuleSchema, 
  ForensicIssueSchema 
} from '../../../src/types/zodSchemas';

export async function assertUCIDPayloadIntegrity(page: any, ucidId?: string) {
  const ucids = await page.evaluate(() => JSON.parse(window.localStorage.getItem('sys_ucids') || '[]'));
  
  if (ucidId) {
    const targetUCID = ucids.find((u: any) => u.id === ucidId);
    expect(targetUCID, `Expected to find UCID ${ucidId} in localStorage`).toBeDefined();
    const validation = UCIDSchema.safeParse(targetUCID);
    expect(validation.success, `Payload integrity failed for UCID ${ucidId}: ${!validation.success ? validation.error.message : ''}`).toBe(true);
  } else {
    // Assert all
    for (const ucid of ucids) {
      const validation = UCIDSchema.safeParse(ucid);
      expect(validation.success, `Payload integrity failed for UCID ${ucid.id}: ${!validation.success ? validation.error.message : ''}`).toBe(true);
    }
  }
}

export async function assertSourcingRulesIntegrity(page: any) {
  const rules = await page.evaluate(() => JSON.parse(window.localStorage.getItem('sys_sourcing_rules') || '[]'));
  for (const rule of rules) {
    const validation = SourcingRuleSchema.safeParse(rule);
    expect(validation.success, `Payload integrity failed for SourcingRule ${rule.id}: ${!validation.success ? validation.error.message : ''}`).toBe(true);
  }
}

export async function assertForensicIssuesIntegrity(page: any) {
  const issues = await page.evaluate(() => JSON.parse(window.localStorage.getItem('sys_forensic_issues') || '[]'));
  for (const issue of issues) {
    const validation = ForensicIssueSchema.safeParse(issue);
    expect(validation.success, `Payload integrity failed for ForensicIssue ${issue.id}: ${!validation.success ? validation.error.message : ''}`).toBe(true);
  }
}
