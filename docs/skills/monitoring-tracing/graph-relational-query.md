# Skill: Graph Relational Query

## 1. Domain & Purpose
This skill maps to `shared/engine/intel/graphQueryService.ts` and `skills/graphRelationalSkill.ts`.
It powers the Phase 5 "Living Knowledge" base, an omni-intelligence relational engine that manages a persistent Directed Acyclic Graph (DAG) of hardware relationships (Compatibility, Dependencies, Conflicts).

## 2. Core Heuristics
- **Upward Tracing (`traceUp`)**: Traverses the graph upwards to identify the total "Architectural Load" of a component. If a GPU requires a specific riser, tracing the GPU upwards will reveal the riser dependency.
- **Relational Search (`findCompatibleChildren`)**: Identifies compatible components via explicit graph edges rather than relying on textual regex matches.
- **Memory Deduplication**: Implements O(1) node membership lookups (`nodeSet`) to prevent cyclic looping and infinite recursion during traversal.

## 3. Integration Points
- Called by the `InferenceEngine` constraint validators to check if required architectural parents are present in the BOQ.
- Persists intelligence locally to `spec_graph.json` via the `StorageRegistry`.

## 4. Architectural Rules
- The Graph Query Service is instantiated as a strict Singleton instance `GraphQueryService`.
- Bulk edge additions MUST use `addRelationBatch()` to prevent N-disk-writes during large catalog ingestions.
