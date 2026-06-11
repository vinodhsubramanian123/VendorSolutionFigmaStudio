# Core Pipeline: High-Fidelity Diff

**Domain**: Core BOQ/BOM Engine

## Purpose
Performs a surgical comparison between the Left side (Customer BOQ) and Right side (Exported Portal BOM).

## Protocol
- **Match Vectors**:
  - `Exact`: Part + Qty match perfectly.
  - `Drift`: SKU matches but descriptions or prices differ.
  - `Missing`: Part in BOQ but not in BOM.
  - `Extra`: Part in BOM but not in BOQ.
- **Density Bonding**: Zeroes out pricing drift if an Extra and Missing part are legitimate density substitutes (e.g., 2x16GB missing, 1x32GB extra).
