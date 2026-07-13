---
name: playwright-debugging
description: "Guidelines for debugging Playwright End-to-End and Visual Regression tests, analyzing traces, and updating snapshots."
---

# Playwright Debugging & Test Resolution Skill

This skill governs how AI agents must interpret, debug, and fix failing Playwright E2E and visual tests on the VSIP platform.

## 1. The "Never Guess" Mandate (E2E Diagnostics)
When a Playwright E2E test fails, **DO NOT guess the root cause based on symptom descriptions.**
Always run the specific test and capture the exact failure trace before patching anything:
`npx playwright test tests/e2e/<file>.spec.ts --reporter=list`

**What to extract from the trace:**
- The exact assertion that failed.
- The actual vs. expected value/text Playwright reports.
- The source component rendering the locator.

If a test fails, verify if it's a runtime/data-state issue (async timing, MSW response race) rather than a static selector mismatch. Never swap a selector without confirming the real failure mode.

## 2. Visual Regression Snapshots
Visual tests (`tests/e2e/visual.spec.ts`) use a strict `maxDiffPixels` threshold. 
- When deliberate stylistic, accessibility, or structural layout fixes are made (e.g., adding `react-virtuoso`, changing button text), the snapshots will intentionally fail.
- **Do not panic or attempt to "fix" the DOM to match the old image.**
- Instead, run `npx playwright test tests/e2e/visual.spec.ts --update-snapshots` to re-certify the new visuals as the approved baseline.

## 3. MSW Pessimistic Testing (Vitest vs Playwright)
Testing UI rollbacks upon API network failures (e.g. HTTP 500) within Playwright is notoriously unreliable because Mock Service Worker (MSW) intercepts at the Service Worker layer, bypassing Playwright's `page.route` intercepts.
- **Rule**: Tests verifying UI mutability rollbacks against simulated network failures must be implemented in the **Vitest integration suite**, utilizing `server.use(...)` to force specific endpoints into `500` error states.

## 4. UX Overlap & Actionability Verification
- **Rule**: NEVER use `.click({ force: true })` in Playwright tests for interactive elements. 
- Playwright must strictly verify that elements are visible, stable, and not visually overlapping or obscured before it clicks them. Using `force: true` masks real z-index bugs and layout overlaps.

## 5. E2E Auto-Waiting & Delay Prohibition
- **Rule**: Never use `setTimeout` or custom `delay()` wrappers in Playwright E2E tests. 
- Rely purely on Playwright's native auto-waiting by asserting element visibility (e.g., `await expect(locator).toBeVisible({ timeout: 15000 })`).

## 6. Playwright Parallelism & Shared Express Backend
- In this project, Playwright's `webServer` spins up a single Node Express process (`tsx server.ts`) which is shared across all Playwright workers. 
- **Rule**: `playwright.config.ts` must maintain `workers: 1` to strictly enforce sequential test execution. If tests run in parallel, they will mutate the same Express backend endpoints simultaneously, leading to cross-test state pollution.

## 7. State Carryover & LocalStorage Isolation
- React state (like `isPendingAPI` context) might not fully reset if the test only calls `page.goto('/')` without explicitly clearing browser storage.
- **Rule**: In `test.beforeEach`, ensure you clear persistence stores and trigger a clean hydration, especially when testing async multi-step workflows:
  ```typescript
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  ```

## 8. Ephemeral Toast Assertions & Notification Testing
- **Issue (Navigation Drift)**: Tests that trigger an action which displays a success toast *and immediately navigates away* will often miss the toast assertion because `await expect(page.getByText('Success')).toBeVisible()` will fail if the navigation destroys the layout context faster than Playwright's polling.
- **Rule (Navigation)**: When an action navigates the user, assert on the stable presence of the *destination page's primary heading or layout element* (e.g. `await expect(page.getByText('Live Ledger')).toBeVisible()`) rather than the ephemeral toast.
- **Issue (Text Content Drift)**: Asserting on the exact text of a toast message makes tests extremely brittle. If the backend mock (e.g. `graphHandlers.ts`) changes the success string, the frontend test breaks even if the logic is perfect.
- **Rule (Data-TestId)**: Never assert on the exact hardcoded text of a success or error toast. Instead, toasts must implement a strict test ID (e.g., `data-testid="toast-success"`). Tests must verify the presence of the toast type: `await expect(page.getByTestId('toast-success').first()).toBeVisible()`.

## 9. Strict Mode & Accessible Name Matching
- **Issue**: `page.getByRole('button', { name: /SYNC ALL ENDPOINTS/i })` will fail if the element's actual rendered text is "SYNC ALL ENDPOINTS" but its `aria-label` or accessible name (like `title`) evaluates to "Synchronize all supplier endpoints".
- **Rule**: Always check the DOM dump trace provided by Playwright. If the trace says `- button "Synchronize all supplier endpoints": SYNC ALL ENDPOINTS`, the first string is the Accessible Name. Your locator must match the accessible name, not the inner text.
- **Rule**: Use `{ exact: true }` when using `getByText` if there is a risk of matching a parent container's descriptive paragraph instead of a targeted badge or label (e.g., `getByText('Active Choice', { exact: true })`).
