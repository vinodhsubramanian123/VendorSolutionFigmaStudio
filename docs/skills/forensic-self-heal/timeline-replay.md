# Forensic Self-Heal: Timeline Replay

**Domain**: Forensic / Self-Heal

## Purpose
Simulates a failed portal session to isolate the exact step where synchronization broke.

## Protocol
- Scans `playwright_traces/` for the failure point.
- Maps the failed Playwright step back to the originating business logic skill (e.g., matching a failure in `search-box-purge` to the `Double-Sweep` mandate).
- Feeds data to the `schema-repair` skill if the vendor portal's DOM has permanently changed.
