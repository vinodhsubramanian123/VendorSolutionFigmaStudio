# Graph Report - tests  (2026-07-14)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 100 nodes · 55 edges · 51 communities (42 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3436cdcc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- assertPayload.ts
- agentsCompliance.test.tsx
- a11yAndPerformance.test.tsx
- resilience.test.tsx
- Taxonomy Graph Editor UI Screenshot (Darwin)
- ingestion-workflow.test.tsx
- lifecycle.test.tsx
- Vendor API Integrations & Health UI Screenshot (Linux)
- forensics-auto-heal-chain.test.tsx
- taxonomy-graph-sync.test.tsx
- unsavedChangesGuard.test.tsx
- responsive.spec.ts
- System Telemetry & Intelligence Pipeline UI Screenshot (Linux)
- solutionLifecycle.test.tsx

## God Nodes (most connected - your core abstractions)
1. `assertUCIDPayloadIntegrity()` - 5 edges
2. `assertSourcingRulesIntegrity()` - 2 edges
3. `assertForensicIssuesIntegrity()` - 2 edges
4. `Taxonomy Graph Editor UI Screenshot (Darwin)` - 2 edges
5. `Vendor API Integrations & Health UI Screenshot (Linux)` - 2 edges
6. `Taxonomy Graph Editor` - 2 edges
7. `BREAKPOINTS` - 1 edges
8. `server` - 1 edges
9. `server` - 1 edges
10. `server` - 1 edges

## Surprising Connections (you probably didn't know these)
- `Taxonomy Graph Editor UI Screenshot (Darwin)` --references--> `Socket Compatibility Tester`  [EXTRACTED]
  e2e/visual.spec.ts-snapshots/taxonomy-graph-default-chromium-darwin.png → e2e/visual.spec.ts
- `Taxonomy Graph Editor UI Screenshot (Darwin)` --references--> `Taxonomy Graph Editor`  [EXTRACTED]
  e2e/visual.spec.ts-snapshots/taxonomy-graph-default-chromium-darwin.png → e2e/visual.spec.ts
- `Taxonomy Graph Editor UI Screenshot (Linux)` --references--> `Taxonomy Graph Editor`  [EXTRACTED]
  e2e/visual.spec.ts-snapshots/taxonomy-graph-default-chromium-linux.png → e2e/visual.spec.ts
- `System Telemetry & Intelligence Pipeline UI Screenshot (Linux)` --references--> `System Telemetry`  [EXTRACTED]
  e2e/visual.spec.ts-snapshots/telemetry-default-chromium-linux.png → e2e/visual.spec.ts
- `Vendor API Integrations & Health UI Screenshot (Linux)` --references--> `Playwright Automator Vault`  [EXTRACTED]
  e2e/visual.spec.ts-snapshots/vendor-portal-default-chromium-linux.png → e2e/visual.spec.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **VSIP Platform UI Modules** — taxonomy_graph_editor, system_telemetry, vendor_portal_apis [EXTRACTED 0.90]

## Communities (51 total, 9 thin omitted)

### Community 0 - "assertPayload.ts"
Cohesion: 0.46
Nodes (3): assertForensicIssuesIntegrity(), assertSourcingRulesIntegrity(), assertUCIDPayloadIntegrity()

### Community 1 - "agentsCompliance.test.tsx"
Cohesion: 0.25
Nodes (6): complianceServer, mockRules, mockSetRules, mockSetSkus, mockSkus, mockVendors

### Community 3 - "resilience.test.tsx"
Cohesion: 0.33
Nodes (4): mockRules, mockSkus, mockVendors, server

### Community 4 - "Taxonomy Graph Editor UI Screenshot (Darwin)"
Cohesion: 0.50
Nodes (4): Taxonomy Graph Editor UI Screenshot (Darwin), Taxonomy Graph Editor UI Screenshot (Linux), Socket Compatibility Tester, Taxonomy Graph Editor

### Community 8 - "Vendor API Integrations & Health UI Screenshot (Linux)"
Cohesion: 0.67
Nodes (3): Vendor API Integrations & Health UI Screenshot (Linux), Playwright Automator Vault, Vendor Portal & APIs

## Knowledge Gaps
- **26 isolated node(s):** `BREAKPOINTS`, `server`, `server`, `server`, `server` (+21 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `BREAKPOINTS`, `server`, `server` to the rest of the system?**
  _26 weakly-connected nodes found - possible documentation gaps or missing edges._