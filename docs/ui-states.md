# UI States

This document describes all necessary UI states across the VSIP platform views.

## Common States
- Loading: Primary actions use spinners, full-page loads use skeletons or progress bars.
- Empty: Empty lists (zero UCIDs, zero Search matches) show a descriptive message with guidance.
- Error: API or logical errors display inline alerts or floating Toasts.
- Success: Form submissions or fix applications trigger a Success Toast (Cosmic Slate Green).

## Specific View States
- **Ingestion Hub**: file-select, uploading (progress), analyzing, completed.
- **Mission Control**: active, waiting-sync, solved, snapshot.
- **Forensics**: clean, scanning, rules-violations, isolated-view.
- **Taxonomy Graph**: resolving, unmapped-node, synchronized.
- **Vendor Portal**: disconnected, mapping, live-feed.
