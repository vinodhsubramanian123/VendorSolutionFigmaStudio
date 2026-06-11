# Forensic Self-Heal: Schema Repair

**Domain**: Forensic / Self-Heal

## Purpose
Closes the self-learning loop by promoting Playwright failure insights into permanent logic updates.

## Protocol
- **Autonomous Rule Healer**: Integrates with `scripts/autonomous_rule_healer.py`.
- **Target**: Modifies `smart_audit_rules.json` to add new constraints (e.g., `CONFLICT` or `CAPACITY` blocks).
- **Rule Verification**: Requires a 95% confidence score or multiple occurrence count before modifying the master schema.
