# HPE QuickSpecs Taxonomy Mapping & Constraint Validation

This document outlines the taxonomic model and mechanical validation patterns used to structure and audit HPE server configurations within the VSIP platform.

## Taxonomic Hierarchy Model

HPE catalog items parsed from official HPE QuickSpecs are grouped into a strict relational taxonomy:
```
Vendor (HPE)
  └── Solution (e.g., Compute, Storage, Synergy)
        └── Product Family (e.g., ProLiant DL380, Synergy 480)
              └── Generation (e.g., Gen11, Gen12)
                    └── Chassis Ref (e.g., 8SFF, 24SFF)
                          └── CatalogSKU (Physical Part Number)
```

### SKU Metadata Structure
HPE QuickSpecs parsers map hardware items using the following schema additions:
- `CatalogSKU.vendor`: Sourcing Brand ("HPE").
- `CatalogSKU.partNumber`: Canonical factory SKU (e.g. `P40424-B21`).
- `CatalogSKU.name`: Descriptive title (e.g. `Intel Xeon Gold 6430 CPU`).
- `CatalogSKU.type`: Classification category (`Chassis` | `Processor` | `Memory` | `Drive` | `Controller` | `Power` | `Cooling`).
- `CatalogSKU.price`: List price in USD.

## Constraint & Socket Compatibility

To prevent unbuildable configuration errors (such as mismatched LGA sockets, unsupported memory channels, or insufficient power budgets), configurations are validated against mechanical rules.

### Mechanical Constraint Validation Endpoint
Endpoint: `POST /api/taxonomy/check-constraints`

Request Payload contract:
```json
{
  "chassisSku": "P40411-B21",
  "cpuSku": "P40424-B21",
  "ramQty": 8,
  "psuWatts": 1600
}
```

Response Payload contract:
```json
{
  "chassisSocket": "LGA-4677",
  "cpuSocket": "LGA-4677",
  "memoryChannels": "Validated",
  "storageController": "Tri-Mode Supported"
}
```

### Validation Rules Checklist
1. **Processor Socket Pin Alignment:** The `cpuSocket` value (e.g., LGA-4677 for Intel Gen4 Scalable Xeon, LGA-4189 for Gen3 Xeon) must match the chassis motherboard socket.
2. **Memory Channels Balance:** Memory module count must adhere to channel architectures (e.g., multiples of 8 or 16 for optimal DDR5 performance).
3. **Thermal & Power Envelope:** Cumulative component wattage must not exceed the power supply capacity.
