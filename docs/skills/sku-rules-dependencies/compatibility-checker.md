# SKU Rules: Compatibility Checker

**Domain**: SKU Rules & Dependencies

## Purpose
Validates parametric compatibility across selected hardware within a specific chassis or DNA triplet.

## Protocol
- **DIMM Parity**: Validates socket parity (Golden Balance Rule), mixing logic (RDIMM vs LRDIMM), and max channel density.
- **Thermal Envelope**: Validates CPU TDP against cooling configurations (Standard Fan vs High-Performance Fan vs Liquid Cooling).
- **PCIe Lanes**: Verifies that the aggregate PCIe bandwidth and physical slot width of inserted cards do not exceed the riser's capabilities.
