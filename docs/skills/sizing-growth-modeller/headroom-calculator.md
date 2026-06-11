# Solution Sizing: Headroom Calculator

**Domain**: Sizing Growth Modeller

## Purpose
Calculates the physical and computational expansion capabilities of the current chassis configuration.

## Protocol
- **Physical Space**: Tracks empty PCIe slots, unpopulated drive bays, and available memory channels.
- **Power Envelope**: Calculates spare PSU wattage available for future additions (e.g., adding a GPU later).
- **Futureproof Score**: Generates a 0-100 score representing how easily the server can scale vertically without chassis replacement.
