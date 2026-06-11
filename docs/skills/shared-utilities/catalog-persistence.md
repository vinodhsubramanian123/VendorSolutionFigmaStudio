# Shared Utilities: Catalog Persistence

**Domain**: Shared Utilities

## Purpose
Manages the robust serialization and deserialization of the hardware catalog and semantic intelligence rules without blocking main thread execution.

## Protocol: Filesystem-Centric Persistence
- Archive catalog records and observations inside Git-tracked CSV/JSON folders (`data/`).
- Do not use heavy database engines (like SQLite/Postgres) which trigger concurrent file-locking exceptions in Electron.
- Checkpoints during mid-automation browser recovery are saved as lightweight JSONs in `scratch/mission_checkpoints`.

## Protocol: Point-in-Time Ledger Snapshots
- Creates point-in-time snapshots under identical UCIDs to track active quantities, descriptions, and USD-normalized currencies.
- Calculates financial price drift (`PRICE_UPDATE`), quantity adjustments (`QTY_ADJUST`), and substitutions (`SUBSTITUTION`).
