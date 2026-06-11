# SKU Rules: PSU Power Rules

**Domain**: SKU Rules & Dependencies

## Purpose
Validates electrical requirements and outlet cord compatibility for Power Supply Units.

## Protocol: Compute PSU Electrical Power Cords
- **Rule**: Any PSU with a capacity wattage > 1600W (e.g. 2400W Platinum PSUs) must be matched with heavy-duty C19-C20 power outlet cords (e.g. `P78384-B21`).
- **Failure Trigger**: Reject standard C13/C14 electrical leads for high-wattage PSUs to protect against electrical trip-outs.
