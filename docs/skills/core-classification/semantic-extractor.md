# Core Classification: Semantic Extractor

**Domain**: Core Classification

## Purpose
Extracts quantifiable metrics and physical quantities from unstructured natural language strings.

## Protocol: Semantic Attribute Extraction
- Extracts metrics: Capacity, Speed, Core Count, Wattage.
- Translates range-bound expressions ("cores between 16 and 32") into dual mathematical boundary criteria.

## Protocol: Quantity Conflict Resolution
- Extracts explicit multipliers from text (e.g., "Pack of 2", "x4").
- **STRICT RESOLUTION RULE**: Natural Language multipliers derived from the description string ALWAYS override base quantity numbers extracted from spreadsheet quantity columns by the Ingestion Engine.
