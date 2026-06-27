# Vendor Portal — Component Skills

## Visual Layout & Constraints
- **Layout Structure:** Multi-tabbed interface handling Vendor connections, Sourcing Rules, and Learning loops.
- **Vendor Cards:** Status indicators (Online, Error, Pending) for API connections to HPE, Dell, Cisco, etc.

## State Connections (Zustand Store)
- **State Connections (Props):** `vendors`, `sourcingRules`, `learningEvents`.

## Interactivity (Skills)
1. **Rule Adjustment:** Allows modifying `ActiveSourcingRules` thresholds.
2. **Connection Mocking:** Simulating drops or reconnections for Vendor APIs.
3. **Learning Loop Injector:** Exposes forms to create semantic mapping overrides with strict scoped fallbacks.
