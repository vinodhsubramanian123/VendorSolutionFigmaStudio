# SKU Chain: SKU Chain Resolver

**Domain**: SKU Chain & Parent-Child

## Purpose
Provides the foundational logic for correctly chaining parent and child SKUs during BOM ingestion and verification.

## The Most Dangerous Edge Case
- A transceiver attached to the wrong card parent can generate a BOQ that appears financially and numerically correct but physically fails at delivery because the wrong slots were targeted.
- This skill ensures structural integrity by linking child parts to their physical and logical parents.

## Protocol
- Called by downstream portal and sizing skills.
- Uses physical bay matrices and slot occupancy maps to enforce tree topology.
- Raises a `MisalignedChildWarning` if an orphan SKU cannot resolve a valid parent chassis or card.
