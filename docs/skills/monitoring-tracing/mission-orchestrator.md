# Monitoring & Tracing: Mission Orchestrator

**Domain**: Monitoring & Tracing

## Purpose
Handles the lifecycle, concurrency, and safe termination of background validation missions.

## Protocol: Multi-Process Controllers
- Maintains active maps of running background child tasks to allow graceful termination.
- Spawns concurrent background child processes to run separate solution tasks in parallel.
- Dispatches target signals to toggle pause states on specific process threads synchronously.

## Protocol: Process Termination Grace Period
- The Orchestrator MUST use a two-stage termination: send `SIGTERM` first, then `SIGKILL` after a 3-second grace period using `setTimeout(...).unref()`.
- On Windows, use the `/T` flag (not `/F`) to allow child tree cleanup. This prevents data loss in BOM extraction buffers.
