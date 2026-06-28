# Sourcing Rules Vault Skills

## Overview
Decomposed management for human-in-the-loop logic rules. Contains `SourcingRulesVault`, `RulesTable`, and `AddRuleForm`.

## State Contracts
- Prop-driven (does not read `ucids` directly).
- Mutates `sourcingRules` array.

## Expected Interactions
- Allow creation, editing, and disabling of regex/semantic mapping rules.
- Strictly bounds payloads via `/api/taxonomy/rules` backend endpoints.
