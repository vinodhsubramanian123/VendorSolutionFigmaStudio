# Forensic View — Component Skills

## Visual Layout & Constraints
- **Layout Structure:** Master-detail view. Left pane lists active `forensicIssues`, right pane shows resolution advice and impacted UCIDs.
- **Severity Colors:** Warning (Amber) vs Critical Audit Violations (Red).

## State Connections (Zustand Store)
- **State Connections (Props):** `forensicIssues`, `ucids`.
- **Global Mutator Binding:** Uses `setForensicIssues` passed down from `App.tsx` global auto-heal hooks.

## Interactivity (Skills)
1. **Auto-Align Triggers:** Resolves specific violations by executing data mutations on underlying configs (e.g. padding quantities for Cisco symmetry) which inherently triggers the global hook to mark the issue resolved.
2. **Deep Linking:** Clicking an impacted part navigates directly to the associated BOM section.
