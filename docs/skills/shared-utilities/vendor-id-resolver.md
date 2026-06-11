# Shared Utility: Vendor ID Resolver

**Domain**: Shared Catalog Utilities

## Purpose
Normalizes fragmented, mis-typed, or regionally suffixed SKUs into canonical universal identities to ensure database matches.

## Rules
- **Normalization**: Strips punctuation, uppercases all characters, and resolves regional suffixes (e.g. `ABA`, `S01`).
- **DNA Extraction**: Extracts the `family:chassis:cpu` triplet required for cross-platform DNA tracking.
- **Unique Output**: Generates `canonPartKey` strictly to preserve functional suffixes while stripping non-identifying noise.
