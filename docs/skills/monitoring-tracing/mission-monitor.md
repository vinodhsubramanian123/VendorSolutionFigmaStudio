# Monitoring & Tracing: Mission Monitor

**Domain**: Monitoring

## Purpose
Maintains session state and UI health during long-running background tasks.

## Protocol
- **Checkpoints**: Utilizes `MissionCheckpointRegistry` to save and resume large multi-category injections without starting from zero.
- **Progress Ticks**: Ensures `smoothProgress` ticks are emitted to the UI to prevent visual stalling (e.g., getting stuck at 10% or 25%).
- **Diamond Resilience**: Guards against global timeouts during 30+ SKU graduations.
