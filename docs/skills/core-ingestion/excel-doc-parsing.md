# Core Pipeline: Excel & Document Parsing

**Domain**: Core Ingestion

## Purpose
Extracts structured Bill of Quantities (BOQ) from standard Excel or CSV files.

## Protocol
- **Header Discovery**: Scan `lines[0]` dynamically for synonyms (`Part Number`, `SKU`, `Qty`, `Description`). Do not rely on static index offsets.
- **Row Mapping**: Map columns safely, ignoring visual spacer columns.
- **DNA Extraction Pass**: Run forensic SKU regex patterns on all text cells to locate hidden part numbers inside description fields.
