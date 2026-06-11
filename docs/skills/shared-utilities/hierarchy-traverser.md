# Shared Utility: Hierarchy Traverser

**Domain**: Shared Catalog Utilities

## Purpose
Provides a standardized recursive traversal mechanism to navigate the `Vendor → Family → Generation → Chassis → SKU` tree structure.

## Rules
- **No Duplication**: Any skill requiring hierarchy traversal (Taxonomy, Sizing, BOQ Rules) MUST invoke this utility instead of rewriting traversal loops.
- **Recursive Guards**: Must implement a recursion limit guard (e.g., `depth > 10`) to prevent infinite loops during deep assembly kit decomposition.
- **Output Standard**: Returns a flattened `RawRow[]` or an enriched tree node object depending on the calling skill's requirements.
