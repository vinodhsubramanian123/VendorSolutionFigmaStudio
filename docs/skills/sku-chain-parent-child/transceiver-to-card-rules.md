# SKU Chain: Transceiver to Card Rules

**Domain**: SKU Chain & Parent-Child

## Purpose
Enforces the specific compatibility rules for attaching network transceivers (SFP, QSFP, DAC) to Networking and Storage Controllers (NICs, HBAs).

## Rules
- Validates transceiver form factor (SFP28, QSFP56, etc.) against the port type of the parent Network Adapter.
- Ensures the count of transceivers does not exceed the physical port count of the specific adapter.
- Resolves mapping so downstream sizing and BOQ engines correctly align network dependencies.
