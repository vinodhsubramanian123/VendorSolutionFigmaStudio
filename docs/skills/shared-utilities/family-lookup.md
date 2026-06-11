# Shared Utility: Family Lookup

**Domain**: Shared Catalog Utilities

## Purpose
Provides an abstraction layer to determine the ontological family of a given category string.

## Rules
- **Strict Method**: Always use the imported `isCategoryFamily(cat, family)` function from `ontologyUtils.ts`.
- **Forbidden Patterns**: NEVER use strict equality `===` or hardcoded `includes()` arrays within other skills (e.g., `cat === 'FAN_VHP'`).
- **Standard Families**: Supported families include `FAN`, `HEATSINK`, `POWER`, `STORAGE_DRIVE`, `CABLE`, `RISER`, `NETWORKING`, `STORAGE_CTRL`, `GPU`.
