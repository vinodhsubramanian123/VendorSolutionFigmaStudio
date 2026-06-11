# Core Pipeline: Image & Spatial OCR Extraction

**Domain**: Core Ingestion

## Purpose
Parses messy image arrays and Tesseract buffer data to recover missing or ghost SKUs.

## Protocol
- **Spatial Bounds**: Binds partial OCR text blocks to neighbors by coordinate vectors in Y-space (e.g., Y-tolerance ≤ 150px).
- **Ghost Detection**: Compares optical logs to a spreadsheet grid; if a valid SKU is seen in OCR but absent from the digital text, raise a `[GHOST-SKU-WARN]`.
- **Sanitization**: Apply noise sanitizing regex filters to clean output before passing to IdentityHub.
