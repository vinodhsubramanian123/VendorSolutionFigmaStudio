# SKU Chain: SKU Parent Validator

**Domain**: SKU Chain & Parent-Child

## Purpose
Validates that a proposed parent-child SKU relationship is structurally and vendor-permissibly correct.

## Protocol
- **Validation Execution**: This skill must be called *before* any portal automation skills execute to avoid pushing broken topologies into vendor configurators.
- **Checks**:
  1. Validates that the child part type is a valid insertion for the parent's bay/slot type.
  2. Ensures that parent bounds (e.g., max 24 drives) are not exceeded by child counts.
  3. Supports complex hierarchies like Synergy/Alletra sub-product chains.
