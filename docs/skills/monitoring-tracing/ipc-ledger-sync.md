# Monitoring & Tracing: IPC Ledger Sync

**Domain**: Monitoring & Tracing

## Purpose
Maintains the type-safe contract enforcement and synchronizes telemetry between background processes and the React frontend.

## Protocol: Ledger IPC Enforcement
- **Strict Logging Schemas**: Enforces absolute typing for all trace records, requiring explicit SKU and configuration targets.
- **Log Extraction Filters**: Hardens IPC parsers in the Electron main process to extract target results robustly, ignoring malformed lines.
- **Stream Protections**: Every process host must implement global stream error hooks (`EPIPE`) to prevent closed streams from crashing the visual experience.

## Protocol: IPC Log Listener Cleanup
- Use `window.api.onEngineLog(cb)` which returns an unsubscribe function. 
- Never use `on`/`off` event pairs for IPC log subscriptions inside React `useEffect` hooks.
