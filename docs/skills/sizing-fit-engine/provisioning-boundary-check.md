# Solution Sizing: Provisioning Boundary Check

**Domain**: Sizing & Fit Engine

## Purpose
Detects extreme over or under-provisioning compared to the extracted workload profile.

## Protocol
- Scans `semanticPayload` for Core and Memory capacities.
- **Alerts**:
  - `[UNDER-PROVISIONED]`: Resources fall below the minimum defined by the Workload Profile Extractor.
  - `[OVER-PROVISIONED]`: Resources exceed the profile by >300%, triggering an alert to down-spec for cost efficiency.
