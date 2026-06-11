# Core Classification: Fuzzy Typo Healer

**Domain**: Core Classification

## Purpose
Resolves user misspellings and OCR noise against known specification dictionaries.

## Protocol: Dual-Algorithm Validation (DA-PVE)
- Runs a Jaro-Winkler similarity algorithm to catch misspelled attributes (e.g. matching "corres" to "cores").
- **OCR Visual Confusion Weighting**: Uses an exact visual confusion matrix (`8`/`B`, `0`/`O`, `1`/`I`, `Z`/`2`, `5`/`S`, `U`/`V`) with a fractional substitution cost (0.25) to heal visual scan noise without violating safety gates on short SKUs.
