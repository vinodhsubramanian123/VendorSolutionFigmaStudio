Looking at all 20+ Playwright specs, 2 mega-flows, and 2 unit tests against your 7-step UCID pipeline and the AGENTS.md architectural contracts, here's what the coverage actually looks like.The core problem is that your entire test suite is essentially a visibility layer — every test asserts text exists on screen, but nothing reads actual UCID state, validates data payloads, or verifies the state machine. Here's the detailed breakdown by priority.

---

## P0: Zero state machine assertions across all 7 steps

The mega-flow tests (`10-unified-workflow`, `11-master-lifecycle`) navigate across every view and confirm text renders, but after each workflow action they never read `localStorage` to verify `currentStep` transitioned and `completedSteps` grew correctly. This means if a regression broke the step transition logic — say `SolutionBuilder` stops updating `completedSteps` on deploy — every one of your Playwright tests would still pass because they only check for the `'UCID Deployment Containers Grid'` string, not the actual UCID object shape.

The fix pattern to add into `10-unified-workflow.spec.ts` after the deploy step:

```typescript
// After Phase 2 (Solution Builder deploy click)
const ucids = await page.evaluate(() =>
  JSON.parse(localStorage.getItem('sys_ucids') || '[]')
);
const deployed = ucids.find((u: any) => u.displayId.startsWith('UCID-'));
expect(deployed?.currentStep).toBe('solution-design');
expect(deployed?.completedSteps).toContain('boq-intake');
expect(deployed?.completedSteps).toContain('pre-intelligence');
expect(deployed?.syncStatus).toBe('Pending'); // pre-provisioning
```

You need this assertion pattern at the exit point of each phase in the mega-flow.

---

## P0: `runIntegrationDiagnosticTestSuite` is dead code

`backendMockData.ts` already has a fully-built Zod validation suite that validates all 15 PRD sample payloads against their schemas. It's never called from any test file. This is a free unit test that costs one file:

```typescript
// src/tests/unit/zodSchemaIntegration.test.ts
import { describe, it, expect } from 'vitest';
import { runIntegrationDiagnosticTestSuite } from '../../lib/backendMockData';

describe('Zod integration diagnostic suite', () => {
  it('all PRD sample payloads pass schema validation', () => {
    const { passed, reports } = runIntegrationDiagnosticTestSuite();
    const failures = reports.filter(r => r.startsWith('✗'));
    if (failures.length > 0) console.error(failures.join('\n'));
    expect(failures).toHaveLength(0);
    expect(passed).toBe(true);
  });
});
```

This would have caught the AGENTS.md §12 bug about `displayId` vs `id` rendering before it hit Playwright. The `GraphNodeSchema` type enum also has `"product"` and `"subproduct"` but `SAMPLE_GRAPH_API_RESPONSE` uses `"Product"` and `"Sub-product"` with different casing — activating this suite would expose that immediately.

---

## P0: Snapshot payload integrity is not verified

Spec `11-snapshots.spec.ts` confirms the label text `'E2E-Test-Snapshot-AutoValidate'` appears in the DOM after creation. It does not verify the `Snapshot` object fields that matter for downstream procurement: `payload`, `bomSnapshot`, `version`, `locked`, or `committedAt`. A snapshot with an empty `payload: []` would pass all existing tests.

```typescript
// Add to 11-snapshots.spec.ts — "should create a snapshot and see it listed"
// After the snapshot appears in list:
const ucids = await page.evaluate(() =>
  JSON.parse(localStorage.getItem('sys_ucids') || '[]')
);
const ucidWithSnap = ucids.find((u: any) => u.snapshots?.length > 0);
const snap = ucidWithSnap?.snapshots?.at(-1);

expect(snap).toBeDefined();
expect(snap.version).toBeGreaterThanOrEqual(1);
expect(snap.locked).toBe(false);
expect(Array.isArray(snap.payload)).toBe(true);
expect(snap.payload.length).toBeGreaterThan(0);
expect(Array.isArray(snap.bomSnapshot)).toBe(true);
expect(snap.committedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO-8601
```

Also missing: snapshot version increment. Creating a second snapshot in spec 11 should produce `version: 2`. No test checks that sequential versions are correct.

---

## P0: ForensicIssue → SourcingRule → LearningEvent chain is UI-only

Specs `08-forensic` and `15-learning-loop` both click `'Auto-Heal Threat'` and check that certain text appears on screen. Neither one reads the actual state objects afterward. If the auto-heal handler fires the toast correctly but forgets to write the `SourcingRule` to storage (a real regression risk given the AGENTS.md §3.11 warning about async handlers in sync try/catch), all tests still pass.

```typescript
// New file: tests/playwright/regression/21-auto-heal-chain.spec.ts
test('auto-heal must update ForensicIssue status, create SourcingRule, and emit LearningEvent', async ({ page }) => {
  await page.goto('/');
  await page.locator('#nav-forensic').click();
  await page.getByTestId('btn-execute-scan').click();
  await delay(3000);

  await page.getByTestId('btn-auto-align').first().click();
  const lockBtn = page.getByTestId('btn-lock-intelligence-rule');
  if (await lockBtn.isVisible()) await lockBtn.click();
  await delay(1500);

  // Assert the state objects changed, not just the UI
  const issues = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('sys_forensic_issues') || '[]')
  );
  const healed = issues.find((i: any) => i.status === 'resolved');
  expect(healed).toBeDefined();

  const rules = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('sys_sourcing_rules') || '[]')
  );
  const learned = rules.find((r: any) => r.isAutoLearned === true);
  expect(learned).toBeDefined();
  expect(learned.status).toBe('active');
  expect(learned.sourceIssueId).toBe(healed.id);

  const events = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('sys_learning_events') || '[]')
  );
  expect(events.length).toBeGreaterThan(0);
  expect(events[0].preventedMismatchCount).toBeGreaterThanOrEqual(0);
});
```

---

## P1: `vsip_localstorage_update` cross-component propagation is not actually tested

Spec `09-solution-builder` dispatches the event to force empty state, but it never verifies the reverse: that a state change in Mission Control reflects in Solution Builder without a page reload. This is the exact scenario from AGENTS.md §3.8, and it's the one most likely to regress when a component incorrectly uses raw `localStorage.setItem` instead of the wrapper.

```typescript
test('LS custom event: UCID step change in Mission Control reflects in Solution Builder without reload', async ({ page }) => {
  await page.goto('/');
  // Load mock UCIDs via ingestion
  await page.locator('#nav-ingestion-hub').click();
  await page.getByText('Run Backend API Ingest').first().click();
  await page.getByText('Split Configs into Active UCIDs').first().waitFor({ state: 'visible', timeout: 30000 });
  await page.getByText('Split Configs into Active UCIDs').first().click();
  await delay(1000);

  // Now simulate a step advance from a different component
  await page.evaluate(() => {
    const ucids = JSON.parse(localStorage.getItem('sys_ucids') || '[]');
    if (ucids[0]) ucids[0].currentStep = 'vendor-provisioning';
    localStorage.setItem('sys_ucids', JSON.stringify(ucids));
    window.dispatchEvent(new CustomEvent('vsip_localstorage_update', {
      detail: { key: 'sys_ucids', value: ucids }
    }));
  });

  // Switch to solution builder without page reload
  await page.locator('#nav-solution-builder').click();
  await delay(800);

  // The step badge must reflect the injected state
  await expect(page.getByText(/vendor-provisioning/i).first()).toBeVisible();
});
```

---

## P1: Multi-UCID state isolation

You have 4 UCIDs in `mockData.ts` at different steps (`u1` at `post-intelligence`, `u2` at `pre-intelligence`, `u3` at `boq-intake`, `u4` at `snapshot`). No test verifies that advancing u1 doesn't mutate u2 through u4. This matters especially because any array spread bug in state update handlers would cause exactly that.

```typescript
test('completing a step on one UCID must not alter sibling UCIDs', async ({ page }) => {
  await page.goto('/');
  const before = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('sys_ucids') || '[]')
  );
  const u2Before = before.find((u: any) => u.displayId === 'UCID-2026-0042');

  // Advance u1 (UCID-2026-0041) through one step
  await page.locator('#nav-mission-control').click();
  await page.locator('div[role="button"]').filter({ hasText: 'UCID-2026-0041' }).first().click();
  // trigger step advance action for u1
  await delay(1000);

  const after = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('sys_ucids') || '[]')
  );
  const u2After = after.find((u: any) => u.displayId === 'UCID-2026-0042');
  expect(u2After?.currentStep).toBe(u2Before?.currentStep);
  expect(u2After?.completedSteps).toEqual(u2Before?.completedSteps);
  expect(u2After?.syncStatus).toBe(u2Before?.syncStatus);
});
```

---

## P1: `selectedVendorSubmissionId` is never set in any test

The comparison step exists to pick a winning vendor, setting `Solution.selectedVendorSubmissionId`. Not a single test verifies this field is written. If the winner selection handler silently fails, the snapshot will commit with no winning vendor recorded, but all your snapshot tests pass because they only check the label string.

---

## P2: `SyncStatus` transitions are not tested

The 4-state machine (`Pending` → `Synced` / `Out-of-Sync` → `Error`) is purely structural in mock data. No Playwright test triggers the `Synced` transition (e.g., after vendor portal sync) or asserts that `Out-of-Sync` flips to `Synced` after reconciliation commits. Spec `07-vendor-portal` clicks Sync Gateway and checks `'Vendor system status altered successfully.'` text but never reads the UCID's `syncStatus` field.

---

## P2: DataPersistenceGate has no dedicated tests

AGENTS.md §3.2 calls this out as critical. The gate validates `Array.isArray(ucids) && Array.isArray(vendors)` synchronously. There's no test that passes malformed state (e.g., a `null` vendors array) and confirms the gate shows its error view rather than crashing with an unhandled exception. This is especially important given the `dynamic-hub-UCID-2026-X` bug documented in §3.7 — that class of regression would silently crash the gate in production and every E2E test would timeout on the Suspense fallback shimmer rather than failing explicitly.

---

## Summary of what to add

In priority order, the five new files that would give the most coverage for the least effort:

`src/tests/unit/zodSchemaIntegration.test.ts` — the existing `runIntegrationDiagnosticTestSuite` wired into Vitest. Zero writing required beyond the test wrapper.

`tests/playwright/regression/21-auto-heal-chain.spec.ts` — verifies the full ForensicIssue → SourcingRule → LearningEvent state chain, not just toast text.

`tests/playwright/regression/22-ucid-state-machine.spec.ts` — reads `localStorage` at each pipeline stage transition to assert `currentStep` and `completedSteps` correctness.

`tests/playwright/regression/23-snapshot-integrity.spec.ts` — augments spec 11 with payload field assertions, version increment, and `bomSnapshot` content validation.

`tests/playwright/regression/24-multi-ucid-isolation.spec.ts` — verifies sibling UCID immutability and `selectedVendorSubmissionId` persistence through comparison.

The rest of your test coverage (UI rendering, navigation, CRUD flows) is solid. The gap is entirely in the "did the right data get written to the right place" layer, which is ironically the layer your platform is built around — procurement integrity.