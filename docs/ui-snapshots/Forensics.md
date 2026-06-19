# Sourcing Intelligence & Forensics Snapshot
**Approved State: v1 (Initial Freeze)**

## Layout Structure
- **Sidebar**: Left-side navigation with active state "Sourcing Rules"
- **TopBar**: Contextual header "Component Diagnostic Console"
- **Header Section**:
  - Title "Forensic Review"
  - Summary metrics: Warnings, Violations, Scans
- **Main Layout Grid**:
  - **Scanner Output Matrix (`AnimatePresence` Stagger)**: 
    - Full width table showing BoM extraction vs. catalog anomalies.
    - Status badges (Active, High-risk, EOL) with glowing borders.
    - **Auto-Align Component** functionality.
  - **RuleClarificationModal (Overlay)**:
    - Interrupts Auto-Align to explicitly request intelligence scope boundaries (e.g. Catalog-wide vs Category only).
  - **Sourcing Rules Vault (Bottom Area - `motion` list)**:
    - Centralized Intelligence Registry
    - Form to define substitution mappings and price caps
    - Detailed Matrix displaying Target Reference, Type, Override Value, and Actions (Edit/Delete).
    - **Learning Loop Feed**: Live scrolling terminal window indicating NLP-derived rules via the Auto-Heal pipeline.
