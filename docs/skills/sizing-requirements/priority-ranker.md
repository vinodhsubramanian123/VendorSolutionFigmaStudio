# Solution Sizing: Priority Ranker

**Domain**: Sizing Requirements Engine

## Purpose
Classifies the primary optimization vector for the customer's solution.

## Protocol
- **Vectors**: Evaluates the brief to determine if the primary driver is `Performance`, `Capacity`, `Scalability`, or `Cost`.
- **Conflict Resolution**: If cost and performance conflict, relies on the `PriorityRanker` output to automatically determine which configuration option to suggest as "Option A" (The Intent Fix).
