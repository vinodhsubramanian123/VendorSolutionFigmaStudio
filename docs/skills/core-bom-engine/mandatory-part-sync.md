# Core Pipeline: Mandatory Part Sync

**Domain**: Core BOQ/BOM Engine

## Purpose
Updates local intelligence when the portal automatically injects required hardware that the customer missed.

## Protocol
- Detects `EXTRA_IN_BOM` parts that are mandated by the vendor configurator (e.g., default cooling fans, blanking panels).
- Syncs these findings back to the `PartRegistryService`.
- Promotes the finding to the `ExperienceSynthesizer` so future ingestions automatically add the missing dependencies before hitting the portal.
