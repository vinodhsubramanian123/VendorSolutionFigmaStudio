# Core Pipeline: PDF Extraction

**Domain**: Core Ingestion

## Purpose
Extracts tabular and text data specifically from vendor QuickSpecs and technical PDF documents.

## Protocol
- **Separation of Concerns**: Do NOT mix PDF extraction logic with Excel parsing. PDFs require structural bounding box logic and text-flow reconstruction.
- **Tools**: Utilize the underlying PDF parsers rather than naive text extractors.
- **Fail-Safe**: If a PDF table spans multiple pages, implement continuation logic to merge the data before generating `RawRow[]`.
