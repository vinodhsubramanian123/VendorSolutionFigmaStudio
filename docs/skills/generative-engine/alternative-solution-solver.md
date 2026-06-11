# Skill: Generative Alternative Solver

## 1. Domain & Purpose
This skill maps to `shared/engine/generative/solutionSolver.ts` and `AgenticPortalSolver.ts`.
It enables the system to synthesize alternative BOQ proposals (Reference vs. Balanced vs. Minimalist) when exact SKU matches are unavailable or sub-optimal.

## 2. Core Heuristics
- **Reference Persona**: Strictly adheres to the original Customer BOQ intent.
- **Balanced Persona**: Optimizes for cost and availability while maintaining ±10% capacity metrics.
- **Minimalist Persona**: Aggressively consolidates physical footprint (e.g., swapping 4x16GB DIMMs for 2x32GB DIMMs) to free up slot space, while strictly respecting thermal and physical constraints.

## 3. Integration Points
- Receives input from the `InferenceEngine` constraint validator.
- Exports alternative configurations to the UI for user evaluation.

## 4. Architectural Rules
- Alternatives must NEVER violate the `psu-power-rules` or `thermal_heatsink` limits.
- The solver must remain stateless and pure, emitting `SolutionScoringEngine` results rather than mutating the active BOQ directly.
