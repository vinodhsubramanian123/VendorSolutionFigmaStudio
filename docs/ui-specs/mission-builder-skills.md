# Mission Builder — Component Skills

## Visual Layout & Constraints
- **Header Section:** Must include the "Mission Builder" title, subtitle, and an action bar.
- **Emerald Banner (`isSolutionComplete`):** Must conditionally display at the top of the grid when the active solution has fully populated vendor assignments.
- **Grid Structure:** Two-column grid layout for wide screens, stacking to single column on mobile.
- **Card Containers (Parallel Lanes):** Each UCID operates as a parallel lane, visualized as a card showing `displayId`, Name, and Status.

## State Connections (Zustand Store)
- **Store Hook:** `useCoreStore(s => s.solutions)` and `useCoreStore(s => s.ucids)`
- **Derived State:** Filtering active UCIDs using `u.solutionId === activeSolutionId`.
- **Actions:** 
  - `addSolution` (when auto-generating a new deployment)
  - `setUcids` (to inject generated UCIDs into global context)

## Interactivity (Skills)
1. **Intake to Workspace Switch:** Instantly moves from BOQ Intake (Step 1) to Workspace (Step 2) when active UCIDs exist.
2. **Multi-UCID Toggling:** Handles grouping configurations into a single consolidated package versus segregating them into multiple sub-deployments.
3. **Provisioning Emerald Check:** Calculates `isSolutionComplete(solution, ucids)` derived from utility to broadcast safety state.
4. **Deploy to Mission Control:** Generates `trackingRef` instances and safely routes the session into the Intelligence Execution pipeline.
