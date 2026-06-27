# Mission Control — Component Skills

## Visual Layout & Constraints
- **Header Section:** Houses the overarching Mission Name and parallel lane summaries.
- **Pipeline Layout:** The central visualization of the workflow (Intake -> Pre-Intel -> Sourcing -> Provisioning -> Verification -> Snapshot).
- **Control Panel:** Side panel holding contextual telemetry logs, audit trails, and execution commands.

## State Connections (Zustand Store)
- **Store Hook:** Connects to `solutions` and `ucids` to govern workflow gating.
- **Execution Mode Binding:** Reads `ucid.executionMode` to determine if steps advance synchronously (Automated) or require manual file drops (Manual).

## Interactivity (Skills)
1. **API Job Dispatches:** Uses `useMissionControlWorkflow` to dispatch POST calls to `/api/jobs` contextually based on the active pipeline step.
2. **Log Stream:** Reactively updates the UI Log events panel directly from MSW mock streams, rendering telemetry instantly.
3. **Execution Forking:** Skips Vendor API synchronization if `executionMode === 'manual'`, awaiting human-in-the-loop uploads instead.
