# System Telemetry — Component Skills

## Visual Layout & Constraints
- **Layout Structure:** Terminal-like scrolling console log pane overlaid with real-time graph metrics (CPU, Memory mock metrics).
- **Dark Mode Enforcement:** Strict monochromatic/high-contrast terminal styling (`#03050a` background).

## State Connections (Zustand Store)
- **State Connections (Props):** Connects implicitly via global event listeners on API network delays.

## Interactivity (Skills)
1. **Log Level Filtering:** Toggle visibility of INFO, WARN, ERROR, and SUCCESS system traces.
2. **Auto-Scroll:** Keeps terminal window adhered to bottom unless manually scrolled up.
