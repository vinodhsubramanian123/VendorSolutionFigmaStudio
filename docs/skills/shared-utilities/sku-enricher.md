# Shared Utility: SKU Enricher

**Domain**: Shared Catalog Utilities

## Purpose
Hydrates raw BOM/BOQ lines with metadata, prices, and thermal/power attributes by looking up the canonical SKU in the catalog.

## Rules
- **Dependency**: Relies on the `vendor-id-resolver` to first obtain the canonical identity key.
- **Missing Parts**: If a SKU is missing from the master catalog, this utility flags it with `[MISSING-METADATA]` but does NOT crash the ingestion pipeline.
- **Sourcing**: Used by the BOQ engine and Sizing engine to acquire parameters required for compute overhead calculations.
