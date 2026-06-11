# SKU Rules: Dependency Resolver

**Domain**: SKU Rules & Dependencies

## Purpose
Traces and enforces multi-hop hardware dependencies (e.g., A -> B -> C cascade logic) before portal validation.

## Protocol
- **Recursive Tracing**: If SKU A requires SKU B, and SKU B requires SKU C, this resolver automatically traverses the dependency graph to ensure C is injected.
- **Mutual Exclusions**: Resolves conflicts where A requires B, but B conflicts with C. Applies priority logic based on standard architectures.
- **Fail-Safe**: Throws a `DependencyResolutionError` if an impossible cascade is detected (e.g., circular dependency).
