# Graph Report - server  (2026-07-14)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 28 nodes · 34 edges · 9 communities (2 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 214 input · 25 output

## Graph Freshness
- Built from commit: `3436cdcc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Logging and Vendor Portal
- Job Management
- validateBody.ts
- validateBody
- boq.ts
- agents.ts
- health.ts
- taxonomy.ts
- webhooks.ts

## God Nodes (most connected - your core abstractions)
1. `validateBody()` - 8 edges
2. `logger` - 3 edges
3. `logsDir` - 1 edges
4. `agentsRouter` - 1 edges
5. `boqRouter` - 1 edges
6. `MockIngestSolution` - 1 edges
7. `healthRouter` - 1 edges
8. `jobsRouter` - 1 edges
9. `MockJob` - 1 edges
10. `jobStore` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (9 total, 7 thin omitted)

### Community 0 - "Logging and Vendor Portal"
Cohesion: 0.38
Nodes (4): logger, logsDir, snapshotsRouter, vendorPortalRouter

### Community 1 - "Job Management"
Cohesion: 0.50
Nodes (3): jobsRouter, jobStore, MockJob

## Knowledge Gaps
- **14 isolated node(s):** `logsDir`, `agentsRouter`, `boqRouter`, `MockIngestSolution`, `healthRouter` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `validateBody()` connect `validateBody` to `Logging and Vendor Portal`, `validateBody.ts`, `boq.ts`, `agents.ts`, `taxonomy.ts`, `webhooks.ts`?**
  _High betweenness centrality (0.229) - this node is a cross-community bridge._
- **What connects `logsDir`, `agentsRouter`, `boqRouter` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._