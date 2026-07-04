# VSIP — UCID vs. Solution Prominence & Complexity Drift Audit
**Working copy — last verified against repo `main` on 2026-07-01.** All findings below were re-checked against live source (not just recalled) as of this revision — see the verification log at the end.

**Scope:** PRD screen-by-screen alignment vs. actual UI; duplication/complexity across screens; Cleansing vs. Healing terminology; nav ordering; Taxonomy Graph functionality — cross-checked against contracts/types/mockdata/Zod schemas and MSW mock handlers.

**Trigger:** Reported symptoms — (1) UCID feels more prominent than Solution on upload, "View Solutions" is hard to find; (2) some screens (`CampaignConsolidationHub`) are unclear in purpose, possible duplicated functionality across screens; (3) confusion between Cleansing and "Healing" flows, screen/tab ordering feels arbitrary; (4) Taxonomy Graph looks empty/slow and may be an incomplete legacy feature.

**Verdict: all four symptoms are real and traceable to specific code, not just impressions.** The core data layer (Zod schemas + Zustand store) is actually sound — `SolutionProject` correctly parents `UCID[]`, and ingest correctly creates Solution before UCIDs. The drift is entirely in what got built *on top of* that correct foundation: UI copy/nav/KPIs that never caught up to the schema, screens built independently across phases that duplicate each other, and one screen (Taxonomy Graph) whose mock data layer was never finished.

## Status tracker

Mark ✅/⏳/🔲 as fixes land and paste the updated table back in a future session — I'll pick up from wherever you left off.

| # | Item | Section | Effort | Status |
|---|---|---|---|---|
| 1 | Add `/solutions` nav item to Sidebar | §3.3, §10 | Quick | 🔲 |
| 2 | Fix `UcidPipelineCard` click → `/solutions/:id` | §3.2, §10 | Quick | 🔲 |
| 3 | Rewrite ingest success toast to name the Solution | §3.5, §10 | Quick | 🔲 |
| 4 | Rename Taxonomy "heal" action to disambiguate from Forensic Heal | §7, §10 | Quick | 🔲 |
| 5 | Reorder Sidebar into Pipeline/Tools groups | §8, §10 | Quick | 🔲 |
| 6 | Correct PRD §4.1 text + ingestion diagram | §2, §10 | Quick | 🔲 |
| 7 | Add "Active Solutions" KPI to Dashboard | §3.1, §10 | Quick | 🔲 |
| 8 | Add missing "Solutions" module to PRD §3 nav table | §2 | Quick | 🔲 |
| 9 | Wire Cleansing to real UCID/BOQ data (highest leverage) | §7 | Larger | 🔲 |
| 10 | Make graph mock handler config-aware (derive nodes/edges from real config) | §9.2 | Larger | 🔲 |
| 11 | Auto-set `activeSolutionId` from Mission Control / Solution Builder | §9.1 | Medium | 🔲 |
| 12 | Unify snapshot creation (`commitSnapshot` vs `useSnapshotManagerLogic`) into one hook | §6.3, §6.5 | Larger | 🔲 |
| 13 | Decide `/reconciliation`'s scope vs. Mission Control step 6, rename if needed | §6.5 | Medium | 🔲 |
| 14 | Dedupe Ingestion Hub portfolio-comparison components; remove hardcoded HPE/Dell/Cisco nodes | §6.2, §6.5 | Larger | 🔲 |
| 15 | Have `CampaignReconciliationMatrix` reuse the unified comparison primitive | §6.5 | Medium | 🔲 |

---

## 1. The root cause: two things are both called "Solution"

`src/types/models/sourcing.ts` contains this comment verbatim, already flagging the exact confusion you're describing:

```
NAMING COLLISION NOTE:
  The existing `UCID.solutions: Solution[]` field holds vendor design
  alternatives (a different concept). This entity is named SolutionProject
  to avoid collision with that field. Do not rename UCID.solutions.
```

So there are two distinct entities sharing the word "Solution":

| Entity | What it actually is | Where it lives |
|---|---|---|
| `Solution` (legacy) | A **vendor design alternative** *inside* a single UCID (e.g. "HPE-centered bid" vs "Dell-centered bid" for one config) | `UCID.solutions: Solution[]` |
| `SolutionProject` (current/intended) | The **top-level deal/BOQ container** — the thing a customer's BOQ becomes, which then fans out into one or more UCIDs (the config splits) | `useCoreStore().solutions: SolutionProject[]` |

This is precisely the hierarchy you described — *"UCID is then for the configs from the BOQ assigned during solution builder... UCID is a sub of Solution for the configs split inside."* That's exactly what `SolutionProject.ucidIds: string[]` and `UCID.solutionId` / `UCID.solutionDisplayId` encode. **The schema agrees with your mental model.** The problem is everything built on top of it doesn't consistently reflect that.

## 2. The PRD itself has the hierarchy backwards in one place

`specification/PRD.md`, Section 4.1 (`/api/boq/ingest`):

> Response (Output): Returns structured parallel alternative designs (`Solution[]`) assigned to a parent `UCID`.

This describes UCID as the **parent** of Solution — the inverse of what `SolutionProjectSchema`/`UCIDSchema` and `coreStore.ts` actually implement (`SolutionProject.ucidIds[]`, `UCID.solutionId`). Section 6's ingestion diagram reinforces this UCID-first framing too:

```
[Workbook Parsing Microservice]
   ├── Sheet 1 (Compute Node)  ──► Auto-generate UCID-A
   ├── Sheet 2 (Storage Pod)   ──► Auto-generate UCID-B
   └── Sheet 3 (Spine Network) ──► Auto-generate UCID-C
```

No parent Solution/SolutionProject is mentioned at all — sheets go straight to UCIDs. This is stale relative to `Appendix A`'s own instruction to treat `schemaDTO.ts`/`schemaGraph.ts`/`schemaUCID.ts` as source of truth. **The PRD needs a Section 4.1 correction and an explicit "BOQ → SolutionProject → N×UCID" diagram to replace the current one.**

Also: the PRD's 12-module nav table (Section 3) never lists a standalone "Solutions" / "View All Solutions" screen — it only has "Quote Compile & Mapping (Solution Builder)." But the code has a fully separate `SolutionManager` (`/solutions`) and `SolutionDetail` (`/solutions/:id`) view that isn't in the PRD's module list at all. The PRD is missing a module.

## 3. Where the UI actually leads with UCID over Solution

### 3.1 Dashboard KPI grid — zero Solution-level KPIs
`src/components/dashboard/Dashboard.tsx`, `KPI_CARDS`:
- Connected Vendors
- Catalog SKUs
- **Active UCIDs** ← UCID
- Open Issues
- **Active Pipeline** (UCID step %) ← UCID
- Last Sync Status

Two of six top-of-page KPI cards are UCID-scoped. **None are Solution-scoped** (no "Active Solutions," "Solutions Awaiting Config," "Portfolio Value" — despite the PRD's own Section 3.1 describing the Dashboard's objective as "portfolio values... active UCID missions"). The welcome banner text also only surfaces UCID count: *"{activeUCIDs.length} active UCIDs in pipeline · ... "* — no solution count anywhere in the hero area. The primary CTA button is "Live Mission Control" (UCID-scoped); there's no equivalent "View Solutions" CTA at that same prominence.

### 3.2 `UcidPipelineCard` — mislabeled, and it's the *only* Dashboard entry point to Solutions
This component is titled **"UCID Mission Pipeline"** in its header, but the rows it actually renders are `SolutionProject` records (`sol.displayId`, `sol.name`, `sol.customerName`) grouped with their child UCIDs rolled into a progress bar. So the one place on the Dashboard that *does* surface Solutions is:
- mislabeled as a UCID widget,
- and its only two `onClick` handlers (row click, "View All Solutions" link) both call `onNavigate("solutions")` — the generic list — **not** `onNavigate` to `/solutions/:id` for the specific row clicked. Clicking a specific solution card doesn't deep-link to that solution.

This directly explains *"I don't see View Solutions clearly unless inside solution builder"* — it's not inside Solution Builder at all; it's a small link buried inside a mislabeled card on the Dashboard, and it's the **only** route into `/solutions` from anywhere in the primary UI.

### 3.3 Sidebar nav — `/solutions` has no nav item at all
`src/components/layout/Sidebar.tsx`, `navItems`: Dashboard, BOQ & BOM Ingest Hub, BOM Reconciliation Diff, Semantic NLP Search, **Live Mission Control** (UCID, badge = active UCID count), Catalog SKU Manager, Vendor Portal & APIs, Forensic Scan & Heal, **Solution Configurator** (`/solution-builder`), Taxonomy Graph Editor, Cleansing Workshop, System Telemetry.

`/solutions` (SolutionManager — the actual "view all solutions" list) is **fully routed in `App.tsx`** but has **no sidebar entry whatsoever.** Meanwhile `/mission-control` gets a permanent badge showing live UCID count, and the sidebar's footer panel ("Live Tracks") persists on every screen (when expanded) showing raw `ucid.displayId` + `ucid.currentStep`, with zero Solution grouping or label. That footer widget is effectively a second, always-on UCID surface with no Solution equivalent anywhere in the chrome.

Net effect: UCID has a nav item + a badge + a persistent footer tracker. Solution has none of the three.

### 3.4 Mission Control does group by Solution, but only as a fallback label
`MissionControl.tsx` has `getSolutionName(u)` which looks up `solutions.find(s => s.id === u.solutionId)` and a `SolutionBanner` component — so Solution context *is* present here. But the view itself is titled "Live Mission Control," framed entirely around the UCID stepper as the primary object, with Solution reduced to a banner/grouping label rather than a first-class breadcrumb (e.g. "SOL-2026-004 → UCID-2026-011" as a real navigable breadcrumb, which doesn't exist).

### 3.5 Ingestion flow: the *data* is Solution-first, the *messaging* isn't
`src/components/ingestion/useBoqIntake.ts`, `handleSplitAndProvision()` — this is actually done correctly:
1. Creates `solutionId` + `solutionDisplayId` first
2. Builds `newSolutionProject: SolutionProject` with `ucidIds` pointing at the generated UCIDs
3. Calls `addSolution()` **before** `setUcids()`

So structurally, Solution *is* created first. But the toast shown to the user after upload says only:

> *"BOQ intake completed! Allocated {N} UCID tracking slots successfully."*

Zero mention of the Solution that was just created, its display ID, or its name. The user-facing feedback loop reinforces "I just made some UCIDs" when what actually happened is "I just created Solution SOL-2026-00X with N configs (UCIDs)." This is very likely the specific moment that seeds the "UCID feels primary" impression on ingest, even though the store logic already has the hierarchy right.

### 3.6 Even the micro-spec docs know the correct behavior isn't implemented
`docs/ui-specs/solution-manager-skills.md`:
> **Solution Drill-down:** Clicking a Solution routes to `/solutions/:id` (Solution Detail).

This is the documented *intended* behavior — and it contradicts what `UcidPipelineCard.tsx` actually does (routes to `/solutions`, not `/solutions/:id`). So this isn't ambiguous scope, it's an implemented-wrong bug against the platform's own written spec.

---

## 4. Summary table — drift by artifact

| Artifact | States | Reality |
|---|---|---|
| `schemaUCID.ts` / `sourcing.ts` (Zod + types) | SolutionProject is parent; UCID references `solutionId` | ✅ Correct — this is the source of truth |
| `coreStore.ts` | `addSolution()` called before `setUcids()` on ingest; `deriveSolutionStatus` auto-syncs Solution status from child UCIDs | ✅ Correct |
| PRD §4.1 | "`Solution[]` assigned to a parent `UCID`" | ❌ Backwards vs. schema |
| PRD §6 ingestion diagram | Sheets → UCIDs directly, no SolutionProject shown | ❌ Missing entity |
| PRD §3 module table | No "Solutions / View All Solutions" module listed | ❌ Missing module (code has one) |
| Dashboard KPIs | 2 of 6 cards are UCID-scoped, 0 are Solution-scoped | ❌ Imbalanced |
| `UcidPipelineCard.tsx` | Titled "UCID Mission Pipeline," renders Solution rows, links to generic list not `/solutions/:id` | ❌ Mislabeled + broken drill-down |
| Sidebar nav | `/mission-control` has nav item + badge + persistent footer tracker; `/solutions` has none | ❌ No parity |
| Ingest toast copy | "Allocated N UCID tracking slots" — no Solution mention | ❌ Messaging omits parent entity |
| `docs/ui-specs/solution-manager-skills.md` | Specifies `/solutions/:id` drill-down | ❌ Not implemented as spec'd |

---

## 5. Recommended fix set (ordered by leverage)

1. **Add a Sidebar nav item for `/solutions`** ("Solutions" or "Portfolio," above or beside Mission Control), with a badge showing active `SolutionProject` count — giving it the same visual weight UCID currently has.
2. **Fix `UcidPipelineCard`**: rename to `SolutionPortfolioCard` (or similar), and make row clicks navigate to `/solutions/:id` for that specific `sol.id`, not the generic list — matching the already-written spec.
3. **Add a Solution-scoped KPI to the Dashboard** (e.g. "Active Solutions" / "Solutions Awaiting Config") so the top-of-page grid isn't UCID-only.
4. **Rewrite the ingest success toast** to lead with the Solution: *"Solution {displayId} created with {N} configuration(s) (UCIDs) — proceed to BOM Ingestion."*
5. **Correct PRD §4.1 and §6** to show `BOQ → SolutionProject → N×UCID`, and add the missing "Solutions" module to PRD §3's nav table.
6. **Give Mission Control a real breadcrumb** (`SOL-2026-004 → UCID-2026-011`) instead of a banner label, so the parent/child relationship is navigable, not just descriptive.

None of this requires touching the Zod schemas or the store — the data model is already correct. This is entirely a UI-surface and documentation catch-up problem, which is good news: it's low-risk to fix incrementally without triggering the kind of cascading type/contract churn a schema change would.

---

## 6. Complexity & duplication audit: "comparison/reconciliation" and "snapshot" logic built 4x and 2x

### 6.1 What `CampaignConsolidationHub` actually does
Per `docs/phase-learnings.md` §26.6, its documented purpose is genuinely distinct from everything else: it's a **cross-UCID, whole-Solution rollup**. It groups all child UCIDs belonging to one `SolutionProject`/campaign, totals original vs. sourced budget across all of them, and exposes two portfolio-wide decisions — **Best-of-Breed** (cheapest vendor per config, mixed across the whole campaign) and **Single-Source** (force everything to one vendor for volume rebates) — before locking the entire campaign into one unified snapshot. It lives inside Mission Control, toggled via `workspaceMode: "individual" | "consolidation"`.

That's a reasonable, non-redundant concept on paper: an "Individual UCID" view and a "Whole Campaign" view of the same data. The problem is everything it's built from already exists elsewhere in slightly different form — see below.

### 6.2 "Comparison / reconciliation" is implemented independently in 4 places
| # | Component(s) | Scope | Entry point |
|---|---|---|---|
| 1 | `mission-control/SourcingReconciliationDiff.tsx`, used in `steps/StepComparison.tsx` | Single UCID, 2 vendor alternatives, step 6 of the 7-step wizard | Mission Control stepper |
| 2 | `mission-control/CampaignPanels.tsx` → `CampaignReconciliationMatrix` | All UCIDs in one campaign/Solution | Mission Control → "Consolidation" mode |
| 3 | `components/reconciliation/*` (`ReconciliationOverview`, `DriftTableRow`, `VendorDifferencesTable`, `ReconciliationDrillDown` — 10 files, ~1,500 lines) | Single active UCID, picked automatically by `ReconciliationView`'s own heuristic (`u.currentStep === "post-intelligence" \|\| "comparison" \|\| ...`) | Standalone sidebar item "BOM Reconciliation Diff" (`/reconciliation`) |
| 4 | `ingestion/HybridPortfolioOrchestration.tsx`, `SweepCoordinatorBoard.tsx`, `ConsolidatedStatusBoard.tsx`, `usePortfolioComparison.ts` | Multiple UCIDs, hardcoded to HPE/Dell/Cisco "workspace nodes", triggered during BOQ ingest via `/api/portfolio/orchestrate` | Ingestion Hub → Portfolio mode |

Four separate component trees, four separate data-shaping approaches, all answering some version of "how do these configs/vendors compare." None of them share a component. A person using the app has no way to know in advance which of these four screens has the comparison view relevant to what they're doing — they'd have to check all four.

Worth flagging separately: **#4 hardcodes vendor names** (`ucids.find(u => u.name.includes("Dell"))`, dedicated `HpeWorkspaceNode`/`DellWorkspaceNode`/`CiscoWorkspaceNode` components) inside what's meant to be a vendor-agnostic platform per the PRD's premise. That's its own architectural smell independent of the duplication issue.

### 6.3 "Snapshot" creation is implemented twice, writing to the same data
Confirmed by tracing both call paths — they are fully independent and both ultimately mutate the same `UCID.snapshots[]` array:

- **Path A** — Mission Control's own wizard: `steps/StepSnapshot.tsx` + `SnapshotHeader.tsx` + `SnapshotTimeline.tsx`, wired to `commitSnapshot(ucidId)` inside `useMissionControlWorkflow.ts`.
- **Path B** — the standalone Reconciliation module: `SnapshotManager.tsx` + `CreateSnapshotForm.tsx` + `SnapshotsPanel.tsx` + `SnapshotListItem.tsx` + `SnapshotDiffModal.tsx` (6 files), wired to `handleCreateSnapshot` inside a separate `useSnapshotManagerLogic` hook.

Two different forms, two different hooks, two different top-level places to trigger the exact same action ("lock a snapshot for this UCID"), with no code shared between them. If one gets a bug fix or a new field, the other has to be updated separately by hand — they will drift.

### 6.4 Why this happened (not a criticism, just the mechanism)
Looking at `phase-learnings.md`'s phase-by-phase entries, each of these was very likely built in a separate development phase to solve a locally-scoped problem (ingest-time multi-vendor sync, then per-UCID stepper comparison, then a dedicated drift/audit screen, then the campaign rollup) without a pass to check whether the new screen could reuse the one before it. That's a normal outcome of iterative agentic development without a consolidation pass — not a design mistake, but exactly the kind of thing that needs a deliberate cleanup phase before it compounds further.

### 6.5 Recommended simplification (ordered by effort/impact)
1. **Unify snapshot creation into one hook + one form.** Keep `SnapshotManager`'s implementation (it's the more complete one — diffing, listing, notes) as the single source, and have Mission Control's `StepSnapshot` call into it instead of `commitSnapshot`. Delete the duplicate `commitSnapshot` path once callers are migrated.
2. **Decide what `/reconciliation` is *for*, distinct from Mission Control's step 6.** Right now it's unclear whether it's a superset (more detail on the same comparison) or a genuinely separate concern (drift *after* a snapshot, vs. comparison *before* one). If it's the former, fold it into `StepComparison` as a "view full detail" expansion rather than a separate top-level nav item. If it's the latter (audit/drift-after-lock), rename it to make that scope explicit (e.g. "Post-Snapshot Drift Audit") so it doesn't look like a duplicate of the comparison step.
3. **Collapse the Ingestion Hub's portfolio-mode components into the same comparison primitive** used elsewhere, and remove the hardcoded HPE/Dell/Cisco special-casing — replace `HpeWorkspaceNode`/`DellWorkspaceNode`/`CiscoWorkspaceNode` with one generic `VendorWorkspaceNode` driven by `vendor: string`, consistent with the platform's vendor-agnostic design intent.
4. **Keep `CampaignConsolidationHub` as-is conceptually** (it's genuinely the only cross-Solution rollup), but have its `CampaignReconciliationMatrix` reuse whichever single comparison primitive comes out of steps 1–3, rather than its own bespoke diff rendering.

Net effect: instead of 4 comparison UIs + 2 snapshot UIs, you'd end up with **1 comparison primitive** (reused at UCID-scope and campaign-scope) and **1 snapshot flow** (reused inside the stepper and standalone), which is a large surface-area reduction without losing any of the actual functionality described in the PRD.

---

## 7. Cleansing vs. "Healing" — there are actually 3 different fix concepts, and one of them is disconnected from real data

Your instinct on the split is right: **Cleansing** = fix raw BOQ ambiguities before a solution is built. **Forensic "Heal"** = fix pricing/compliance problems after a solution is built. But there's a third one hiding in the Taxonomy Graph that also uses the word "heal," which is almost certainly what's blurring the three together in memory.

| Concept | What it fixes | Timing (per PRD's 7-step pipeline) | Where |
|---|---|---|---|
| **Cleansing** (`CleansingView.tsx`) | Raw BOQ line items → catalog SKU matching. Fuzzy-matches spelling mistakes/incomplete tags, quarantines unresolved rows, supports splitting one line into many ("1-to-N Quantity Forking"). | Before Solution Builder (the "Golden Master Gatekeeper" per PRD §3.6) | `/cleansing` |
| **Taxonomy "orphan healing"** (`healOrphanMapping` in `useCatalogGraphData.ts`) | Structural/physical compatibility — an item that has no place in the chassis→CPU→RAM hierarchy gets manually or auto-mapped to the right parent node. | During Solution Design, once configs exist | `/taxonomy-graph` |
| **Forensic "Auto-Heal"** (`useForensicAutoHeal.ts`) | Pricing/compliance anomalies — Dell overcharge vs. contract rate, Cisco memory-channel asymmetry, EOL hardware, blocked partner API telemetry (the PRD's "Four Critical Forensic Compliance Core Rules") | Post-Intelligence, after a solution exists and is priced | `/forensic` |

So "quarantined" specifically belongs to Cleansing (unmatched/ambiguous BOQ rows), not Forensics — Forensics' equivalent unit is a "flagged issue" against an already-built config. Three different things, two of which reuse the word "heal"/"fix" in code and copy, which is exactly the kind of overlap that makes it hard to hold in your head.

**The bigger problem, though: Cleansing doesn't actually touch your uploaded BOQ.** Tracing `CleansingView.tsx`, its only connection to the global store is reading `catalogSkus`. The list of entries you work through — matched/fuzzy/unmatched/quarantined — comes from `generateMockEntries(catalogSkus)`, generated fresh in local component state on every mount. It never reads `UCID.rawBOM` or any config from the Solution you just ingested, and it never writes a result back into the store (no `setUcids`, no `addSolution` call anywhere in the file). So despite the PRD calling it the mandatory gate *before* Solution Builder, right now it's a self-contained sandbox that doesn't gate anything — whatever you "fix" there has no effect on the actual configs that flow into Solution Builder. That's worth fixing before the nav/ordering issues below, because right now the gate the PRD describes doesn't exist functionally, only visually.

---

## 8. Screen/tab ordering — the sidebar order doesn't match the pipeline order

Current sidebar order (`Sidebar.tsx`, top to bottom): Dashboard → **BOQ & BOM Ingest Hub** → **BOM Reconciliation Diff** → Semantic NLP Search → **Live Mission Control** → Catalog SKU Manager → Vendor Portal & APIs → **Forensic Scan & Heal** → **Solution Configurator** → **Taxonomy Graph Editor** → **Cleansing Workshop** → System Telemetry.

The actual data/process flow (per the PRD's own 7-step UCID pipeline plus Cleansing as the pre-Solution-Builder gate) is:

**Ingest → Cleansing (gate) → Solution Builder (design) → Taxonomy Graph (compatibility mapping while designing) → Mission Control (orchestrate through vendor provisioning) → Forensic (post-intelligence) → Reconciliation (comparison) → Snapshot**

Lined up against the sidebar, two things are clearly out of place:
- **Cleansing sits second-from-last** (position 11 of 12), *after* Solution Configurator and Taxonomy Graph — despite being the screen the PRD says must gate everything *before* Solution Builder. A new user reading top-to-bottom would build a solution and map taxonomy before ever seeing the screen that's supposed to happen first.
- **Reconciliation sits third** (right after Ingest, before Mission Control even appears) — despite conceptually being a late-pipeline activity (comparison/snapshot, steps 6–7). Seeing "BOM Reconciliation Diff" that early, with no solutions built yet, is very likely to show an empty state and reads as broken rather than "not relevant yet."

Utility screens (Catalog Manager, Vendor Portal, Telemetry, Search) aren't part of the linear pipeline, so their position is less critical — but the five pipeline-stage screens (Ingest, Cleansing, Solution Builder, Taxonomy, Mission Control, Forensic, Reconciliation) being interleaved with utility screens in a non-sequential order is very likely a real contributor to "which screen do I use next" confusion, independent of everything in Sections 1–7.

**Suggested fix:** group the sidebar into two visual sections — a "Pipeline" group in strict process order (Ingest → Cleansing → Solution Builder → Taxonomy → Mission Control → Forensic → Reconciliation), and a "Tools" group below it (Catalog, Vendor Portal, Telemetry, Search) — rather than one flat undifferentiated list. This alone would resolve most of the "why is the order like this" feeling without touching any component logic.

---

## 9. Taxonomy Graph — why it looks empty/slow, and confirmation it's not fully wired up

Three separate, confirmed issues stack here:

### 9.1 It almost always shows the wrong (or first) Solution
`TaxonomyGraphView.tsx` picks its starting Solution from `activeSolutionIdFromStore || solutions[0]?.id`. I traced every call site of `setActiveSolution` in the codebase — **it's called from exactly one place**: `SolutionManager.tsx`, i.e. the `/solutions` screen that (per Section 3.3) has no sidebar nav item and is nearly unreachable. So unless you happen to visit that specific screen and click a solution, `activeSolutionId` stays `null` forever, and Taxonomy Graph silently defaults to whichever Solution happens to be first in the array — not necessarily the one you were just working on in Mission Control or Solution Builder. That alone would make the graph look like it's showing "nothing relevant" to your current work.

### 9.2 The graph data itself is static — it doesn't actually reflect the selected config
This is the core bug behind *"it was meant to map every solution config on choosing and show the full picture"* not happening. The MSW mock handler for the graph fetch:

```
http.get('/api/graph/solution/:ucid', async ({ params }) => {
  await delay(600);
  return HttpResponse.json(wrapSuccess({
    metadata: { id: params.ucid as string, version: "v2" },
    nodes: memoryGraphNodes,
    edges: memoryGraphEdges,
    unmappedIds: memoryGraphNodes.filter(n => n.type === 'scraped_orphan').map(n => n.id)
  }));
}),
```

`params.ucid` is only used to stamp the response's `metadata.id` — the actual `nodes`/`edges` returned are the **same static `memoryGraphNodes`/`memoryGraphEdges` regardless of which UCID or config you select.** So switching between configs in the picker doesn't change the graph at all; you're looking at one fixed demo graph no matter what. This is a confirmed case of what you suspected — a legacy/incomplete mock that was never finished to actually derive the graph from a real config's items, so it can't yet "show the full picture" for whatever you actually built.

### 9.3 The "slowness" is deliberate simulated latency, not a real performance bug
`mocks/routes/graphHandlers.ts` bakes artificial delays into every graph-related mock endpoint: `/api/graph/solution/:ucid` = 600ms, `/api/graph/algorithms/alternative-paths` = 1200ms, and `/api/taxonomy/simulate` = a full **2000ms**. These are intentional `delay()` calls meant to simulate realistic network latency for a real backend that doesn't exist yet — not a rendering or computation performance issue in the graph canvas itself. So "it looks slow" is accurate and expected right now, but it's not a code-quality problem to fix — it'll resolve itself once a real backend replaces the MSW layer (or the delays can just be reduced/removed for local dev in the meantime if they're getting in the way of review).

### 9.4 Bottom line
Your suspicion is correct: this is a genuinely unfinished/legacy piece, not a UI framing issue like Sections 1–8. The visual graph editor (`KnowledgeGraphCanvas.tsx`, `NodeEditorPanel`, `EdgeEditorPanel`) and the CRUD wiring (`addGraphNode`/`updateGraphNode`/`addGraphEdge`/etc.) are all real and functional — you can add/edit/delete nodes and edges once the graph is loaded. What's missing is the one connective step that would make it live: a mock handler that actually derives `nodes`/`edges` from `activeConfigs` (the real BOM items of the selected config) instead of returning a fixed canned graph. That's a scoped, well-defined gap — not a rebuild — but it does need to happen before this screen can do what the PRD describes.

### 9.5 Recommended fix order for Sections 7–9
1. Wire Cleansing to real UCID data (read `activeUcid.rawBOM`/config items instead of `generateMockEntries`, and write resolved matches back via `setUcids`) — this is the highest-leverage fix since it makes the PRD's "gate before Solution Builder" claim actually true.
2. Make the graph mock handler derive `nodes`/`edges` from the passed config's real items instead of static `memoryGraphNodes` — this alone would fix "why is nothing in the taxonomy graph."
3. Set `activeSolutionId` automatically whenever a user opens a Solution from Mission Control or Solution Builder, not only from the unreachable `SolutionManager` screen — so Taxonomy Graph (and anything else that reads `activeSolutionId`) defaults to what the user is actually working on.
4. Reorganize the sidebar into "Pipeline" vs. "Tools" groups in process order, and rename "Forensic Scan & Heal" or the Taxonomy orphan-fix action to disambiguate the two different "heal" verbs (e.g. "Auto-Fix Compatibility" for taxonomy, keep "Heal" only for the Forensic pricing/compliance flow).

---

## 11. Root-cause layer: no centralized state-mutation service for UCIDs — this is *why* Sections 6, 7 and 9 all happened

Everything found in Sections 6 (4x duplicated comparison, 2x duplicated snapshot), 7 (Cleansing disconnected), and 9 (Taxonomy Graph stale defaults) traces back to one structural gap: **there is no service/action layer between UI components and the UCID array.**

Compare the two entities in `coreStore.ts`:

- **`SolutionProject`** has purpose-built, named actions: `addSolution`, `updateSolutionStatus`, `addUcidToSolution`, `addVendorAssignment`, `setActiveSolution`. Each encodes its own intent and can carry validation.
- **`UCID`** has exactly one action: `setUcids(val: UCID[] | (prev => UCID[]))` — a raw bulk replace. There is no `updateUcidStep`, `lockUcid`, `addUcidEvent`, `deleteUcid`, or anything scoped.

Because the only tool available is "replace the whole array," **15 separate files** each reimplement their own `prev.map(u => u.id === id ? {...u, ...} : u)` logic directly inside components/hooks: `useDrillDownAutoHeal.ts`, `ReconciliationOverview.tsx`, `useSnapshotManagerLogic.ts`, `MissionControlSidebar.tsx`, `UCIDModals.tsx`, `useMissionControlWorkflow.ts`, `CampaignConsolidationHub.tsx`, `MissionControl.tsx`, `useBoqIntake.ts`, `useBomConversion.ts`, `VendorPortal.tsx`, `VendorIngestionDesk.tsx`, `SolutionBuilder.tsx`, `useForensicAutoHeal.ts`, `App.tsx`.

This is the mechanism, not just a symptom: when there's no shared place to put "here's how you update a UCID's step" or "here's how you commit a snapshot," every new screen that needs to touch UCID state has no choice but to write its own version — which is exactly how comparison logic ended up built 4 times and snapshot logic twice. **Fixing #12 and #14 in the status tracker without first addressing this will just create a fifth and sixth copy of the same pattern.** Any cleanup pass should start here: extract a small `ucidActions.ts` (or equivalent Zustand slice) with named, intention-revealing functions — `advanceUcidStep`, `regressUcidStep`, `commitUcidSnapshot`, `applySourcingStrategy`, `resolveCleansingEntry` — and have every one of those 15 call sites migrate to it one at a time. This is genuinely a good candidate for Antigravity to execute mechanically once the target action list is agreed, since it's a repetitive, well-scoped refactor rather than a design decision.

## 12. Guardrail gaps: step transitions have zero preconditions, and "locked" doesn't actually lock anything

Traced `advanceStep`/`regressStep` in `useMissionControlWorkflow.ts` line by line — both are purely index arithmetic against `STEP_ORDER`:

```
const idx = STEP_ORDER.indexOf(u.currentStep);
const next = STEP_ORDER[idx + 1];
```

Neither function checks:
- **Whether the current step's required data actually exists** (e.g. you can `advanceStep` out of "vendor-provisioning" with no `VendorAssignment` recorded, or out of "solution-design" with zero configs).
- **Whether the UCID's snapshot has already been locked.** `commitSnapshot` sets `locked: true` on the snapshot object itself, but I confirmed neither `advanceStep`, `regressStep`, nor the button wiring in `MissionControl.tsx` (`onAdvance`/`onRegress` are always passed unconditionally) nor `StepContentPanel.tsx` (zero references to `snapshots` or `locked` anywhere in the file) ever read that flag. **A UCID with a certified, locked snapshot can still be regressed backward through the stepper with no warning or block.** The same gap exists for the Campaign-level `isLocked` check in `CampaignConsolidationHub` — it guards `handleApplyBestOfBreed`/`handleApplySingleVendor`, but nothing stops an individual UCID within that "locked" campaign from being independently advanced/regressed via Mission Control's per-UCID stepper.

This means "locked" is currently a **label**, not an **enforced state** — it's cosmetic in the UI (shows a badge, disables one button) but doesn't propagate as a guard everywhere the underlying data could still be mutated. This is the kind of gap that becomes a real data-integrity problem the moment more than one person is using the tool concurrently, or once a real backend replaces the mock layer.

## 13. The "learning loop" exists, but it's narrow and fragmented — not a general reasoning capture across solutions

There is a real learning-loop mechanism: `LearningEvent` (Zod-typed, `coreStore.learningEvents`) feeding `LearningLoopFeed.tsx`, rendered inside `ForensicView.tsx`. But tracing its schema and every write site shows it's scoped **only** to the four Forensic auto-heal rules (SKU substitution, price cap, memory symmetry, API gateway blockage) — each event just logs "rule fired, this many mismatches prevented." It says nothing about *why* a sourcing strategy was chosen, what tradeoffs were weighed, or what worked well on a past Solution that could inform a new one.

Worse, this is one of **four separate, non-unified logging mechanisms** in the codebase, each siloed to its own screen with no cross-referencing:

| Log | Scope | Where it's written | Where it's shown |
|---|---|---|---|
| `UCID.events[]` | Free-text timestamped messages per UCID (step changes, strategy applications) | ~10+ call sites across Mission Control, Ingestion, Forensics | `MissionControlSidebar` / event feed panels |
| `learningEvents` (coreStore) | Forensic rule-engine actions only | `useForensicAutoHeal.ts` | `LearningLoopFeed` in `ForensicView` only |
| `workflowStore.workflows[key].auditLogs` | Step-transition audit (`fromStep`/`toStep`/`action`) | `recordAuditLog` inside `useMissionControlWorkflow.ts` | Not surfaced in any UI I found — appears write-only |
| Snapshot `notes` field | Free-text note typed at snapshot creation time | `CreateSnapshotForm.tsx` | `SnapshotsPanel`/`SnapshotDiffModal` in Reconciliation only |

So when you asked *"the learning loop for every solution scenario and strategy used, help with reasoning"* — that doesn't exist yet as a unified thing. What exists is four disconnected logs, one of which (`workflowStore.auditLogs`) appears to be **write-only** — I couldn't find any component that reads or displays it, meaning that data is currently being recorded and never seen by anyone. Building a real cross-solution reasoning/learning surface would mean: (a) making the Campaign sourcing-strategy decision capture an actual rationale (not just an auto-generated string), (b) unifying these four logs into one queryable timeline per Solution, and (c) surfacing `workflowStore.auditLogs` somewhere instead of leaving it dark.

## 14. No edit or delete capability — the system is currently append-only

Checked every store action in `coreStore.ts` and the `SolutionDetail.tsx` screen directly: **there is no `delete` or `remove` action anywhere in the store**, for either Solutions or UCIDs, and `SolutionDetail.tsx` (136 lines) is entirely read-only — it renders `solution.name`, `solution.customerName`, `solution.status` etc. with zero input fields, zero `onChange` handlers, zero edit affordance of any kind.

Practically, this means: if a Solution's name is wrong, a UCID was created by mistake, or a customer reference needs correcting, **there is currently no UI path to fix it.** The only way to correct it today is exactly what you're trying to avoid — manually editing the persisted Zustand state (it's `localStorage`-backed via the `persist` middleware, under key `vsip-core-storage`-equivalent) or the mock data files directly. This is a real, user-facing gap, not just a nice-to-have: any tool meant to replace manual BOQ/BOM work needs to tolerate its own users making mistakes and correcting them in-app.

## 15. Consolidated fix plan for Sections 11–14 (staged for Antigravity)

This is deliberately staged so each step is a bounded, mechanical unit of work rather than one large refactor:

**Stage A — foundation (do first, unblocks everything else):**
1. Add a `ucidActions.ts` slice/module with named actions: `advanceUcidStep`, `regressUcidStep`, `commitUcidSnapshot`, `applySourcingStrategy`, `updateUcidField`, `deleteUcid`. Each should accept explicit parameters and return/throw on invalid preconditions rather than silently no-op.
2. Add `deleteSolution` / `updateSolutionFields` to the existing Solution actions in `coreStore.ts`, following the pattern already established by `updateSolutionStatus`.
3. Add a `locked` guard inside `advanceUcidStep`/`regressUcidStep` themselves (not just at the UI button level) — check `ucid.snapshots?.some(s => s.locked)` and refuse the mutation with a clear returned reason, so the guard can't be bypassed by any future caller.

**Stage B — migrate call sites (mechanical, one file at a time):**
4. Migrate all 15 files currently calling raw `setUcids()` to the new actions from Stage A, one at a time, verifying each still passes its existing tests before moving to the next.

**Stage C — make editing possible:**
5. Add an edit mode to `SolutionDetail.tsx` (name, customer, project ref) wired to the new `updateSolutionFields` action, plus a delete/archive action with a confirmation step.

**Stage D — unify the learning/audit trail:**
6. Combine `UCID.events[]`, `learningEvents`, `workflowStore.auditLogs`, and snapshot `notes` into one per-Solution timeline view (even just a new read-only screen that queries all four sources) so `auditLogs` stops being write-only and reasoning becomes visible in one place instead of four.
7. Extend the Campaign sourcing-strategy decision (`handleApplyBestOfBreed`/`handleApplySingleVendor`) to accept an optional rationale string from the user, stored alongside the auto-generated event message — this is the seed of genuine reasoning capture rather than just an action log.

Stages A–C are well-defined enough to hand to Antigravity directly against this document; Stage D's "combine into one timeline" needs a quick decision from you first on what that unified view should look like (a new screen vs. a panel added to `SolutionDetail`) before it's similarly executable.

---

## 10. Quick-win punch list (remaining polish, low risk / high payoff)

These don't require the larger rework items (#9–15 in the status tracker) — each is one file, a handful of lines, and safe to batch together in a single pass:

1. **Add `/solutions` to `Sidebar.tsx`'s `navItems`.** One array entry. Fixes "can't find View Solutions" immediately.
2. **Fix `UcidPipelineCard`'s two `onClick` handlers** to call `onNavigate` with `/solutions/{sol.id}` instead of the generic `"solutions"`. Makes the drill-down behave the way `docs/ui-specs/solution-manager-skills.md` already specifies.
3. **Rewrite the ingest success toast** in `useBoqIntake.ts` to lead with the new Solution's `displayId`/name instead of only "Allocated N UCID tracking slots."
4. **Rename the Taxonomy Graph's orphan-fix action** (e.g. to "Auto-Fix Compatibility") so it stops colliding with Forensic's "Auto-Heal" in the UI and in memory.
5. **Reorder `Sidebar.tsx`'s `navItems` array** into a Pipeline group (Ingest → Cleansing → Solution Builder → Taxonomy → Mission Control → Forensic → Reconciliation) and a Tools group (Catalog, Vendor Portal, Telemetry, Search) — array reordering plus two optional section-header elements, no routing/state changes.
6. **Correct PRD §4.1's text** ("`Solution[]` assigned to a parent `UCID`" → parent is `SolutionProject`) and replace the §6 ingestion diagram to show `BOQ → SolutionProject → N×UCID`. Documentation-only.
7. **Add one "Active Solutions" KPI card** to `Dashboard.tsx`'s `KPI_CARDS` — copy the existing card pattern, point it at `solutions.length`.
8. **Add the missing "Solutions" module** to PRD §3's 12-module nav table so the doc matches the code (`SolutionManager`/`SolutionDetail` already exist and are routed).

None of these touch Zod schemas, the Zustand store, or MSW handlers — safe to do independently of the larger items (#9–15), which need more care and their own review passes.

---

## Verification log

Re-checked directly against the repo (not recalled from earlier in the conversation) as of this revision:
- `setActiveSolution(` call sites — confirmed only one, in `SolutionManager.tsx`.
- `UcidPipelineCard.tsx` — confirmed both `onClick` handlers still call `onNavigate("solutions")` (generic), not a per-row `/solutions/:id`.
- `Sidebar.tsx` `navItems` — confirmed no `/solutions` entry present.
- `mocks/routes/graphHandlers.ts` — confirmed `GET /api/graph/solution/:ucid` still returns static `memoryGraphNodes`/`memoryGraphEdges` regardless of `params.ucid`.
- `CleansingView.tsx` — confirmed its only `useCoreStore` read is `catalogSkus`; no `setUcids`/`addSolution` write-back exists.
- `App.tsx` — confirmed `/solutions` and `/solutions/:id` are both routed and functional, just unreachable from primary nav.

If you come back to this after fixes land, tell me which numbered items in the status tracker are done and I'll re-verify those specific claims against the repo again before we move to the next batch, rather than assuming the whole document is still current.
