# Skill: Pre-Flight Static Analysis & Quality Control

## Context
AI agents often narrowly focus on passing a single test or fixing a specific bug, ignoring broader architectural drift or regressions. This skill forces a comprehensive check before marking ANY task as complete.

## Mandatory Execution Steps
Before you declare any task "done" or "successful", you MUST execute the following static analysis tools to verify every single thing:

1. **Linting Check (`npm run lint` or `eslint .`)**
   - You must execute this to verify no unused variables, TS errors, or formatting violations exist.
   - If any errors exist, you MUST halt, fix them, and re-run. Do not declare success if errors remain.

2. **TypeScript Compilation (`tsc --noEmit --skipLibCheck`)**
   - Run this check to verify strict typing compliance. No `any` type loopholes or missing props allowed.

3. **Production Build (`npm run build`)**
   - Ensure the Vite/ESBuild distribution compiles cleanly without memory crashes or missing imports.

4. **Functional Testing (`npm run test` or `npx vitest run` & `npx playwright test`)**
   - Do not trust simple code observations. Prove your changes work by running the full unit/integration test harness and playwright UI tests.

## Never Miss This Rule
If you skip these steps, you are actively violating the `AGENTS.md` mandate (Section 9: Mandatory Pre-Flight Verification) of the VSIP Platform.
