# Shared Utility: Schema Enforcer

**Domain**: Shared Catalog Utilities

## Purpose
Centralized enforcement of IPC payloads, database payloads, and catalog structures using Zod.

## Rules
- **Universal Application**: All incoming data (from portal scraping, excel ingestion, or user input) MUST be validated against this schema enforcer before processing.
- **Zod Contracts**: Relies on `types.ts` `zod` schemas (e.g., `PartInputSchema`, `MissionResultSchema`).
- **Failure Protocol**: If schema validation fails, the enforcer halts downstream processing and throws a typed `SchemaValidationError` outlining the specific missing or invalid fields.
