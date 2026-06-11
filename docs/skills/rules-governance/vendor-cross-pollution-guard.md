# Governance Rule: Vendor Cross-Pollution Guard

**Domain**: Rules / Governance
**Classification**: Shared Utility

## Purpose
Prevents catalog corruption by ensuring that incompatible vendor equipment is not mistakenly associated within the same structural baseline (e.g., writing an HPE storage SKU into a Dell server family).

## Execution Context
- **Global Hook**: This utility MUST run anytime any skill writes to the catalog.
- **Triggers**: It fires on ingestion layer actions, portal sync operations, and manual CRUD updates.
- **Independence**: It lives in the Governance layer to guarantee it fires regardless of which skill initiates the writing.

## Protocol
1. Intercept write request payload.
2. Resolve vendor IDs for parent chassis and child SKU.
3. Validate vendor compatibility matrices.
4. Block writes and throw `CrossPollutionError` if conflict detected.
