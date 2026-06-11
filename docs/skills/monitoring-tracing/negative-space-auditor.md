# Monitoring & Tracing: Negative Space Auditor

**Domain**: Monitoring

## Purpose
Fulfills the "Clinical Evidence Attribution" mandate by executing "Negative Space" audits.

## Protocol: Negative Space Audits
Instead of simply validating what is present, the engine maps structural dependencies to identify omissions:
- **Capacity Saturation Check**: Evaluates structural enclosures (max drive bays, PCIe slots, wattage limits) to ensure configurations do not physically overflow chassis bounds.
- **Structural Dependency Tracking**: Emits alerts if foundational parent items (cooling modules, heatsinks) are omitted.
- **Graph-Based Forward Chaining**: Queries the relational catalog graph to locate transitive dependencies (e.g. HBA requiring SAS cables).
