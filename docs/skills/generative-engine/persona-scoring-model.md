# Skill: Persona Scoring Model

## 1. Domain & Purpose
This skill governs the algorithms in `shared/engine/generative/SolutionScoringEngine.ts`.
It calculates fitness scores for proposed BOQ alternatives based on physical footprint, cost variance, and architectural similarity to the original BOQ.

## 2. Core Heuristics
- **Similarity Score**: Computed via BM25 lexical analysis against the original BOQ's descriptions.
- **Value Score**: Heavily weights MSRP savings (lower MSRP = higher Value Score).
- **Density Score**: Rewards configurations that use fewer physical slots/bays for the same capacity (e.g. fewer, larger drives).

## 3. Integration Points
- Called exclusively by the `AgenticPortalSolver` to rank the Top-3 configurations.

## 4. Architectural Rules
- The engine must output a deterministic `FitnessReport` object with normalized percentages between `0.00` and `100.00`.
