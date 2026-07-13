# VSIP Platform — Code Smell & Quality Gap Analysis

> [!IMPORTANT]
> This is a **targeted initial sweep** covering 7 major smell areas. Each area can be expanded into a dedicated remediation iteration. Items are prioritized by blast radius (how many files/behaviors they affect).

---

## Area 1: Server ↔ Frontend Reconciliation Logic Duplication (Critical)

The reconciliation/compliance calculation logic is **copy-pasted** between `server.ts` and `src/utils/reconciliationMath.ts`, creating a dual-maintenance burden and silent divergence risk.

| Logic | [server.ts](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/server.ts#L349-L397) | [reconciliationMath.ts](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/utils/reconciliationMath.ts#L26-L76) |
|---|---|---|
| 8% markup factor (`* 1.08`) | ✅ L351 | ✅ L28 |
| 5% hybrid cost reduction (`* 0.95`) | ✅ L407 | ✅ L73 |
| EOL SKU `815100-B21` hardcoded check | ✅ L366 | Uses `ActiveSourcingRules.legacySKUs` |
| Memory symmetry check `% 8 !== 0` | ✅ L377 | ✅ L48 |
| Dell `400-BPSB` overcharge SKU check | ✅ L372 | ✅ L45 |

### Smells
- **Shotgun Surgery**: Changing a business rule (e.g., markup factor) requires editing 3+ files
- **Server divergence**: `server.ts` hardcodes `815100-B21` directly while `reconciliationMath.ts` references `ActiveSourcingRules` — if a new legacy SKU is added to the config, the server ignores it
- **Magic numbers**: `1.08`, `0.95`, `22`, `18`, `45`, `8`, `12` are raw literals with no named constants

### Recommendation
Extract a shared `reconciliation-engine/` module importable by both server and client. Define all magic numbers as named constants in [sourcingRules.ts](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/config/sourcingRules.ts).

---

## Area 2: Unsafe `any` Typing Erosion

### Production Source Code (Non-Test)

| File | Line | Issue |
|---|---|---|
| [missionControlUtils.ts](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/mission-control/missionControlUtils.ts#L3) | L3 | `solutions: any[]` — should be `SolutionProject[]` |
| [bomRepairUtils.ts](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/utils/bomRepairUtils.ts#L30) | L30-49 | `recalculateRepairedSolutions(solutions: any[])` — entire function chain is untyped (`any` cascades through `vs`, `c`, `it`, `curr`) |
| [useBomConversion.ts](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/ingestion/useBomConversion.ts#L225) | L225 | `repairSolutions(solutions: any[])` wrapper — inherits `any` from the util |
| [server.ts](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/server.ts#L23) | L23, L32, L89, L240, L308, L326, L350 | `validateBody(schema: any)`, `(acc: any, curr: any)`, `solutions: any[]`, `(sol: any)`, `(sub)`, `(item: any)` — the server has the most `any` usage |
| [apiClient.ts](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/services/apiClient.ts#L17) | L17 | `return data as T` on Zod parse failure — **silently passes invalid data** as the generic type |

### Smells
- **Type Erosion**: `any` in `bomRepairUtils.ts` defeats TypeScript's purpose — a typo in `curr.unitPrice` would not be caught
- **Silent Contract Violation**: `apiClient.parseResponse()` returns `data as T` when Zod validation fails. This means the UI receives data that **doesn't conform** to the expected schema, and it only logs a `console.warn`. Downstream components will crash or silently corrupt state.

### Recommendation
- Type `recalculateRepairedSolutions` using `Solution[]` from the existing type definitions
- Make `apiClient.parseResponse()` throw (or return a discriminated union) on parse failure — the current "warn and cast" behavior masks contract drift

---

## Area 3: Inconsistent Error Handling Patterns

### Pattern Inventory

| Pattern | Files | Example |
|---|---|---|
| `console.error(err)` (bare, no user feedback) | 10+ files | [useCatalogGraphData.ts:275](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/hooks/useCatalogGraphData.ts#L275), [SearchView.tsx:42](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/search/SearchView.tsx#L42) |
| `console.error(msg)` + Toast notification | 8+ files | [CatalogManager.tsx:145](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/catalog/CatalogManager.tsx#L145) |
| `console.log()` in production code | 4 files | [DataPersistenceGate.tsx:92](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/shared/DataPersistenceGate.tsx#L92), [ReconciliationDrillDown.tsx:96](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/reconciliation/ReconciliationDrillDown.tsx#L96), [vendorAdapter.ts:5,21](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/services/vendorAdapter.ts#L5) |
| Thrown errors via `apiClient.handleError()` | 1 file | [apiClient.ts](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/services/apiClient.ts) |

### Smells
- **Silent Swallowing**: `fetchAlternativePaths`, `commitPathSelection`, `SearchView`, `EdgeEditorPanel`, `TaxonomyGraphSidebar` all catch errors and only `console.error` them — users see nothing
- **No structured logging**: A dedicated `logger.ts` exists ([logger.ts](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/utils/logger.ts)) but many components directly call `console.*` instead
- **Production console.log leaks**: [DataPersistenceGate.tsx:92](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/shared/DataPersistenceGate.tsx#L92) outputs a `✅ [VSIP Schema Alignment Secure]` log on every render cycle — noisy and leaks internal details to browser devtools

### Recommendation
Establish a 3-tier error contract:
1. **User-facing failures** → Toast via `useToast()` (already exists)
2. **Developer telemetry** → `logger.error()` (already exists, underused)
3. **Ban raw `console.*`** in production source via ESLint `no-console` rule

---

## Area 4: Dead / Stub Adapter Code

### [vendorAdapter.ts](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/services/vendorAdapter.ts)

Both `MockVendorAdapter` and `RealVendorAdapter` are **complete stubs**:
- `MockVendorAdapter.handle()` returns `{ mockResponse: true }` for every action
- `RealVendorAdapter.handle()` is identical — also returns a hardcoded success
- `healthCheck()` returns `true` unconditionally in both

```typescript
// RealVendorAdapter.handle() — this is NOT real:
async handle(req: VendorRequest): Promise<VendorResponse> {
  console.log(`[RealVendorAdapter] Handling ${req.action} for ${req.vendor}`);
  return { success: true, data: { realResponse: true }, confidence: 0.98 };
}
```

### [IVendorPortalAdapter.ts](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/services/IVendorPortalAdapter.ts)

The interface defines 3 actions (`fetchSKU | validateBOM | scrapePortal`) and 6 vendors, but **no code in the codebase** actually calls `createVendorAdapter()` or any adapter method. The vendor portal feature uses `apiClient.post('/api/vendor/portal', ...)` directly instead.

### Smells
- **Dead code**: The entire adapter pattern (3 files: interface, mock, real + factory) is unused
- **Misleading naming**: `RealVendorAdapter` suggests production integration exists when it doesn't
- **Interface drift**: `IVendorPortalAdapter` defines actions not matching the server's `VendorPortalRequestSchema` (`toggle | sync` vs `fetchSKU | validateBOM | scrapePortal`)

### Recommendation
Delete all 3 files or mark them explicitly as "Phase N scaffolding" with a clear roadmap entry. Currently they create a false sense of abstraction.

---

## Area 5: Oversized Components & Cognitive Complexity

### Top Files by Line Count

| File | Lines | Concern |
|---|---|---|
| [SolutionBuilder.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/solution-builder/SolutionBuilder.tsx) | 398 | Orchestrates 6+ sub-views, manages deployment state, handles UCID selection — a "God Component" |
| [BoqIngestWorkbook.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/ingestion/BoqIngestWorkbook.tsx) | 377 | Combines file upload, workbook preview, constraint verification, and progress tracking in one file |
| [AdviceFileIngestion.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/forensics/AdviceFileIngestion.tsx) | 369 | File upload + XLSX parsing + warning display + SKU extraction + operator selection all in one component |
| [CleansingView.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/cleansing/CleansingView.tsx) | 369 | Full view with multiple sub-panels, auto-map logic, and ledger integration |
| [SearchView.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/search/SearchView.tsx) | 362 | Search across all entity types with inline rendering — no decomposition |
| [MissionControl.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/mission-control/MissionControl.tsx) | 344 | Campaigns, UCID panels, deployment overlays, and workflow orchestration |

### Smells
- **Single Responsibility Violation**: Components mixing data-fetching, state mutation, layout rendering, and business logic
- **Testability**: Large monolithic components require complex test setup (see the 385-line `CatalogManager.test.tsx`) and are harder to mock granularly

### Recommendation
Apply the "Extract Custom Hook" pattern already well-executed for [useMissionControlWorkflow.ts](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/mission-control/useMissionControlWorkflow.ts) and [useReconciliationLogic.ts](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/reconciliation/useReconciliationLogic.ts) — extend it to `SolutionBuilder`, `BoqIngestWorkbook`, `SearchView`, and `AdviceFileIngestion`.

---

## Area 6: server.ts Monolith & `any` Saturation

[server.ts](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/server.ts) is **693 lines** housing:
- 9 REST API route handlers
- Full reconciliation engine duplicate (Area 1)
- Job store state management
- Vite middleware setup
- Graceful shutdown logic

### Specific Smells

| Issue | Location | Detail |
|---|---|---|
| `validateBody(schema: any)` | [L23](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/server.ts#L23) | `schema` should be `z.ZodType<unknown>` |
| `parsed.error.issues.reduce((acc: any, curr: any)` | [L32](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/server.ts#L32) | Accumulator and issue both untyped |
| `let solutions: any[] = [];` | [L89](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/server.ts#L89) | 130 lines of mock response generation uses `any` throughout |
| `const items: any[] = [];` | [L308, L326](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/server.ts#L308) | Reconciliation normalization loses type safety |
| `let vite: any = null;` | [L613](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/server.ts#L613) | Use `ViteDevServer \| null` |
| Job store `Map<string, any>` | [L631](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/server.ts#L631) | No interface for job state — `job.progress`, `job.status`, `job.result` are all untyped |
| Inconsistent indentation | L630-670 | Job routes are indented differently from the rest of the file |

### Recommendation
Decompose into:
- `server/routes/ingest.ts`
- `server/routes/reconciliation.ts`
- `server/routes/taxonomy.ts`
- `server/routes/integrations.ts`
- `server/routes/jobs.ts`
- `server/middleware/validateBody.ts`

A `server/` directory already exists but is underutilized.

---

## Area 7: Prop Drilling Residue vs Store Access Inconsistency

The codebase is mid-migration from prop-drilling to Zustand store. This creates a **dual-access anti-pattern**:

### App.tsx Still Manages & Props Down:
- `isPendingAPI` / `setIsPendingAPI` / `pendingAPIMessage` / `setPendingAPIMessage` / `apiProgress` → threaded to `IngestionHub`
- `searchQuery` → threaded to `TopBar` and `SearchView`
- `deployedSolution` / `setDeployedSolution` → threaded to `SolutionBuilder` and `MissionControl`
- `onNavigate` (as `legacyNavigate`) → threaded to 6+ route components

### But Other State Is Fully in Store:
- `ucids`, `vendors`, `catalogSkus`, `forensicIssues`, `sourcingRules` → all via `useCoreStore`
- `collapsed`, `activeMissionId` → via `useCoreStore`
- Ingestion-specific state → via `useIngestionStore`

### Smells
- **Inconsistent Architecture**: Developers can't predict whether a piece of state is in props or store without reading the component
- **Prop Bloat**: Route definitions in `App.tsx` L183-196 have extremely long prop lists, reducing readability
- **Naming inconsistency**: `onNavigate` vs `legacyNavigate` vs `handleNavigate` — three names for the same pattern

### Recommendation
Migrate the remaining prop-drilled state (`isPendingAPI`, `searchQuery`, `deployedSolution`) into dedicated Zustand slices or the existing `coreStore`. This would simplify `App.tsx` route definitions from ~15 props to near-zero.

---

## Area 8: Triple-Source Design Token Fragmentation (Critical — UX Consistency)

The Cosmic Slate color palette is defined in **three independent, unlinked locations**:

| Source | File | Role |
|---|---|---|
| CSS `@theme` variables | [index.css](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/index.css#L4-L31) | Tailwind utility classes (`bg-surface-canvas`, `text-content-primary`) |
| JS `tokens` object | [tokens.ts](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/styles/tokens.ts) | Used via `style={{ color: tokens.colors.text.primary }}` |
| JS `cosmicSlate` + `ThemeProvider` | [colors.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/theme/colors.tsx) | React Context theme (wraps children in a redundant `div` with inline style) |

### Smells
- **Triplicate definitions**: All three files define `#03050a`, `#070a13`, `#4a85fd`, `#00d4a0`, etc. independently — if a color changes in one, the other two go stale
- **`tokens.ts` has extra keys** (`header: #090d19`, `tooltip: #0d1528`, `appHeader: #06080e`, `sky: #38bdf8`, `cyan: #1ba0e2`, `tertiary: #3a5070`) that don't exist in `index.css` or `colors.tsx` — these are undocumented private palette entries
- **`cosmicSlate` + `ThemeProvider` is dead code**: `ThemeProvider` is never rendered in the component tree — `main.tsx` renders `ToastProvider > App`, not `ThemeProvider`. `useTheme()` returns the hardcoded default object anyway. Zero components import `useTheme`.
- **Dual styling system**: Some components use Tailwind classes (`bg-surface-card`, `text-content-muted`), while others use inline `style={{ color: tokens.colors.text.primary }}` — **50+ components** mix both, creating an unpredictable styling paradigm

### Recommendation
- Delete `colors.tsx` / `ThemeProvider` (dead code)
- Make `tokens.ts` the **single JS source of truth** and auto-generate the CSS `@theme` block from it (or vice versa), so one file drives both
- Migrate all `style={{ color: tokens.colors.* }}` usages to Tailwind semantic classes

---

## Area 9: Typography Scale Chaos — 12+ Arbitrary Font Sizes

The codebase uses Tailwind's arbitrary value syntax (`text-[Xpx]`) for font sizes instead of the standard type scale. A grep across components reveals **800+ instances** of custom pixel sizes:

| Arbitrary Size | Approx. Usage | Standard Equivalent |
|---|---|---|
| `text-[8px]` / `text-[8.5px]` | 60+ | *(no standard — too small for accessibility)* |
| `text-[9px]` / `text-[9.5px]` | 80+ | *(no standard)* |
| `text-[10px]` / `text-[10.5px]` | 120+ | `text-[10px]` ≈ custom micro |
| `text-[11px]` | 100+ | between `text-xs` (12px) and nothing |

### Smells
- **No type scale contract**: There is no documented typography scale. Developers pick pixel values ad-hoc, resulting in 12+ distinct sizes (`8px`, `8.5px`, `9px`, `9.2px`, `9.5px`, `10px`, `10.5px`, `11px`, plus standard `text-xs`, `text-sm`, `text-base`)
- **Sub-pixel rendering**: `8.5px`, `9.5px`, `10.5px` produce sub-pixel font rendering that browsers handle inconsistently
- **Accessibility risk**: `8px` and `8.5px` text is below WCAG minimum recommended size (9px/12px depending on guideline), creating readability issues even on high-DPI screens
- **Font family inconsistency**: Components randomly mix `font-mono`, `font-sans`, and `font-display` within the same data row — e.g., [CampaignPanels.tsx L27](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/mission-control/CampaignPanels.tsx#L27) applies both `font-mono` and `text-content-secondary` on the same `<h4>`, while adjacent `<span>` uses `font-sans`

### Recommendation
Define a **5-tier type scale** in `index.css @theme`:
```css
--font-size-micro: 9px;    /* replaces 8, 8.5, 9, 9.5 */
--font-size-caption: 10px;  /* replaces 10, 10.5 */
--font-size-label: 11px;    /* replaces 11 */
--font-size-body: 12px;     /* text-xs */
--font-size-prose: 14px;    /* text-sm */
```
Then enforce `@apply` utility classes: `text-micro`, `text-caption`, `text-label`.

---

## Area 10: Cosmic Slate Tailwind Violations (Raw Primitives Leaking)

The AGENTS.md rule is explicit: _"Do not use raw Tailwind gray, slate, blue, or purple classes."_ However, raw primitives are still scattered throughout the codebase:

### Raw Tailwind Grays
| Class | Files | Example |
|---|---|---|
| `placeholder-gray-500` | 8 files | [SidebarHeader.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/mission-control/SidebarHeader.tsx#L40), [SearchView.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/search/SearchView.tsx#L163), [NLPParser.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/forensics/NLPParser.tsx#L205) |
| `text-gray-950` / `text-gray-700` | 6 files | [CampaignPanels.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/mission-control/CampaignPanels.tsx#L316), [LearningLoopFeed.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/forensics/LearningLoopFeed.tsx#L258), [CleansingView.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/cleansing/CleansingView.tsx#L343) |
| `text-gray-450` / `text-gray-750` | 2 files | [SnapshotListItem.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/reconciliation/SnapshotListItem.tsx#L99) — **these aren't even real Tailwind classes** |

### Raw Tailwind Colors (Non-semantic)
| Class | Files | Should Be |
|---|---|---|
| `hover:bg-indigo-700` | 3 (CampaignPanels) | `hover:bg-brand-indigo/80` |
| `hover:bg-emerald-700` | 1 (CampaignPanels) | `hover:bg-status-success/80` |
| `bg-sky-500`, `text-sky-400`, `border-sky-500/20` | **30+ instances** across 12 ingestion files | *(no semantic token exists for "sky/info" — needs a new token)* |
| `focus-visible:ring-indigo-500/50` | 15+ files | `focus-visible:ring-brand-indigo/50` |

### Hardcoded Hex Values in JSX
| Hex | Occurrences | Should Be |
|---|---|---|
| `#03050a` | 6 files | `bg-surface-canvas` |
| `#070a13` | 7 files | `bg-surface-card` |
| `#ff3d5a` | 8 files | `text-status-error` / `border-status-error` |
| `#00d4a0` | 3 files | `text-status-success` |
| `#4a85fd` | 4 files | `text-brand-indigo` |
| `#8b949e`, `#4b5563`, `#f59e0b` | [KnowledgeGraphCanvas.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/taxonomy/KnowledgeGraphCanvas.tsx#L176-L256) | Completely undocumented; no token mapping |

### Recommendation
- Create a `--color-action-sky` semantic token (or `--color-brand-sky`) for the ingestion domain's sky-blue accent
- Replace all `placeholder-gray-500` with `placeholder-content-muted`
- Replace all hardcoded hex in JSX with `tokens.colors.*` references or Tailwind classes
- Add ESLint rule to ban raw color primitives

---

## Area 11: Shared Component Library Bypass

The platform has well-built shared primitives in `src/components/shared/` — but most are **barely adopted**:

### `<Button>` — 4 consumers vs 70+ raw `<button>` elements

| Shared `<Button>` Users | Raw `<button>` Users |
|---|---|
| [NewUCIDModal](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/mission-control/NewUCIDModal.tsx), [SolutionManager](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/solution-builder/SolutionManager.tsx), [CatalogAddForm](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/catalog/CatalogAddForm.tsx), [BoqIngestWorkbook](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/ingestion/BoqIngestWorkbook.tsx) | **70+ files** use raw `<button>` with ad-hoc styling |

Each raw `<button>` re-invents styling independently. For example, [CampaignPanels.tsx L289](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/mission-control/CampaignPanels.tsx#L289) has a **214-character** className string that is a hand-crafted variant of `<Button variant="primary" size="sm">`.

### `<Table>` — 0 consumers (completely unused!)

The shared [Table.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/shared/Table.tsx) component defines `Table`, `TableHead`, `TableBody`, `TableRow`, `TableHeader`, `TableCell` — but **not a single component outside of `SkeletonRow.tsx` imports it**. Meanwhile, **12 files** render raw `<table>` elements with hand-written classes.

### `<Select>` — 6 consumers vs 8 raw `<select>` elements

[Select.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/shared/Select.tsx) is adopted in 6 files but 8 files use raw `<select>` with inconsistent styling (e.g., [UCIDModals.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/mission-control/UCIDModals.tsx), [SolutionDetail.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/solution-builder/SolutionDetail.tsx)).

### `<ModalBackdrop>` — 2 consumers

Only [AddBOQPartModal](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/cleansing/AddBOQPartModal.tsx) and [SplitConfigWizard](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/cleansing/SplitConfigWizard.tsx) use it. Other modals ([NewUCIDModal](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/mission-control/NewUCIDModal.tsx), [UCIDModals](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/mission-control/UCIDModals.tsx), [RefineRuleOverlay](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/forensics/RefineRuleOverlay.tsx), [RuleConflictModal](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/forensics/RuleConflictModal.tsx)) implement their own backdrop inline.

### Missing Shared Primitives
Components that don't exist but are hand-crafted repeatedly across 10+ files:
- **`<Input>`** — every text input re-implements `bg-surface-canvas/40 border border-white/10 rounded-lg ... placeholder-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50`
- **`<Modal>`** — every modal re-implements backdrop + `AnimatePresence` + centered `motion.div` + close button

### Recommendation
- Enforce `<Button>` adoption via ESLint rule banning raw `<button>` in component files
- Create `<Input>` and `<Modal>` shared primitives
- Migrate all 12 raw `<table>` usages to the existing `<Table>` component
- Audit and migrate remaining raw `<select>` to `<Select>`

---

## Area 12: Inline Style Proliferation — 150+ `style={{}}` Usages

Across the `src/components/` directory, **150+ JSX elements** use inline `style={{}}` attributes instead of Tailwind classes or CSS. The worst offenders:

| Component | Inline `style=` Count | Why |
|---|---|---|
| [UcidPipelineCard.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/dashboard/UcidPipelineCard.tsx) | 15+ | Uses `tokens.colors.*` for every color instead of semantic classes |
| [UCIDStepper.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/mission-control/UCIDStepper.tsx) | 8 | Dynamic border/color from `tokens.colors` |
| [GroupedUcidList.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/mission-control/GroupedUcidList.tsx) | 8 | Background gradient construction |
| [Dashboard.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/dashboard/Dashboard.tsx) | 7 | Mixed `tokens.colors` + hardcoded rgba |
| [VendorStatusBoard.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/dashboard/VendorStatusBoard.tsx) | 6 | `tokens.colors.text.*` for every text element |
| [CatalogTrendAnalyzer.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/dashboard/CatalogTrendAnalyzer.tsx) | 5 | SVG + conditional colors |
| [SystemTelemetry.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/telemetry/SystemTelemetry.tsx) | 4 | Hardcoded rgba background |

### Smells
- **`style={{ color: tokens.colors.text.primary }}`** is equivalent to the class `text-content-primary` — the class is 18 characters vs the inline style being 45+ characters and not scannable in devtools
- Inline styles bypass Tailwind's purge system, responsive utilities, hover/focus states, and dark mode toggles
- Hardcoded `rgba(74, 133, 253, 0.15)` appears in 6+ files when `border-brand-indigo/15` is the semantic equivalent

### Recommendation
Replace all `tokens.colors.*` inline usages with Tailwind semantic classes. For dynamic conditional colors (e.g., status-based), use a `cn()` helper with conditional class maps.

---

## Area 13: Motion Library Import Split — `framer-motion` vs `motion/react`

The codebase is mid-migration from the legacy `framer-motion` package to the modern `motion/react` package:

| Import Source | File Count | Files |
|---|---|---|
| `"motion/react"` (correct) | **48 files** | Majority of components |
| `"framer-motion"` (legacy) | **5 files** | [AddBOQPartModal.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/cleansing/AddBOQPartModal.tsx#L3), [SplitConfigWizard.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/cleansing/SplitConfigWizard.tsx#L3), [ModalBackdrop.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/shared/ModalBackdrop.tsx#L1), [CleansingEditorRow.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/cleansing/CleansingEditorRow.tsx#L2), [DeepCleansingEditor.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/cleansing/DeepCleansingEditor.tsx#L2) |

### Smells
- **Bundle size**: Both packages are likely in the bundle since different components import from different sources
- **API drift risk**: `framer-motion` v10+ and `motion/react` have subtle API differences in `AnimatePresence` behavior
- **All 5 legacy files are in the `cleansing/` domain** — this is a localized fix

### Recommendation
Replace all 5 `framer-motion` imports with `motion/react` in the cleansing domain. Verify both aren't listed as separate `dependencies` in `package.json`.

---

## Area 14: `onNavigate` Prop Threading — Legacy Pattern in 15+ Components

Despite the migration to React Router (`useNavigate` in `App.tsx`), `onNavigate: (view: AppView) => void` is still **prop-drilled through 15+ components** as a legacy navigation mechanism:

| Component | Declaration |
|---|---|
| [Dashboard.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/dashboard/Dashboard.tsx#L27) | `onNavigate: (v: AppView) => void` |
| [UcidPipelineCard.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/dashboard/UcidPipelineCard.tsx#L11) | `onNavigate: (view: AppView) => void` |
| [VendorHealthList.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/dashboard/VendorHealthList.tsx#L10) | `onNavigate: (v: AppView) => void` |
| [ActiveIssuesList.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/dashboard/ActiveIssuesList.tsx#L10) | `onNavigate: (v: AppView) => void` |
| [MissionControl.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/mission-control/MissionControl.tsx#L56) | `onNavigate: (view: ...) => void` |
| [SolutionBuilder.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/solution-builder/SolutionBuilder.tsx#L23) | `onNavigate: (view: AppView) => void` |
| [SearchView.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/search/SearchView.tsx#L11) | `onNavigate: (view: AppView) => void` |
| [IngestionHub.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/ingestion/IngestionHub.tsx#L15) | `onNavigate: (view: AppView) => void` |
| + 7 more (StepContentPanel, StepBoqIntake, StepComparison, LaunchStep, ForensicView, etc.) | Same pattern |

### Smells
- **Redundant with React Router**: `App.tsx` already converts `onNavigate(view)` calls into `navigate(`/app/${view}`)` — so every component could just call `useNavigate()` directly
- **Inconsistent optionality**: Some components declare `onNavigate?:` (optional) while others require it — creating different call-site ergonomics
- **Parameter naming**: `(v: AppView)` vs `(view: AppView)` vs `(view: import("../../types").AppView)` — 3 different inline type import styles

### Recommendation
Create a `useAppNavigate()` hook wrapping React Router's `useNavigate()` with the `AppView` type mapping. Replace all `onNavigate` props.

---

## Area 15: Accessibility Gaps — Partial ARIA Coverage

### What's Good
- Mission Control components have solid ARIA support: `aria-label`, `aria-expanded`, `aria-pressed`, `aria-haspopup`, `role="button"` on 15+ interactive elements
- Modals have close button labels
- `focus-visible:ring-2` is consistently applied across inputs and buttons

### What's Missing

| Gap | Impact | Examples |
|---|---|---|
| **No `aria-label` on icon-only buttons** | Screen readers announce nothing | Many `<button>` elements with only a Lucide icon child (e.g., delete/edit icons in [ForensicView](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/forensics/ForensicView.tsx), [SourcingRulesVault](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/forensics/SourcingRulesVault.tsx)) |
| **`role="button"` on `<div>` without `tabIndex` or `onKeyDown`** | Keyboard users can't activate | [GroupedUcidList.tsx L48](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/mission-control/GroupedUcidList.tsx#L48), [TaxonomyOrphanBox.tsx L43](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/taxonomy/TaxonomyOrphanBox.tsx#L43), [SKUCard.tsx L57](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/shared/SKUCard.tsx#L57) |
| **No `<label>` association on inputs** | Forms not navigable | Inputs in [CreateSnapshotForm](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/reconciliation/CreateSnapshotForm.tsx), [NodeEditorPanel](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/components/taxonomy/NodeEditorPanel.tsx) |
| **No skip-to-content link** | Keyboard users must tab through entire sidebar | [App.tsx](file:///Users/macbookaira1466/Documents/FigmaVendorBOMBOQSolution/VendorSolutionFigmaStudio/src/App.tsx) |
| **Modal focus trap missing** | Tab navigates behind open modals | All modals use `AnimatePresence` but none implement focus trapping |
| **Color-only status indicators** | Color-blind users miss status | `StatusBadge` relies on color alone without unique icons per variant |

### Recommendation
- Audit all icon-only buttons and add `aria-label`
- Replace `role="button"` `<div>` elements with actual `<button>` elements
- Implement focus trap in the shared `<Modal>` component (once created per Area 11)
- Add a skip-to-content landmark link

---

## Area 16: Zustand Store Monolith (God Object)

The `coreStore.ts` file operates as a monolithic "God Object", storing **7 completely distinct business domains** in a single Zustand slice:
- `solutions` (Solution Builder)
- `ucids` (Mission Control)
- `vendors` (Vendor Portal)
- `catalogSkus` (Taxonomy / Catalog)
- `forensicIssues` (Forensics / Audit)
- `sourcingRules` (Forensics / Rules)
- `learningEvents` (Telemetry / AI)

### Smells
- **Re-render blast radius**: Any update to a minor `learningEvent` triggers subscriber updates for components that only care about `catalogSkus` (unless strictly memoized, which is prone to human error).
- **Separation of Concerns violation**: `useForensicAutoHeal.ts` pulls 8 different setter functions from `coreStore` just to orchestrate cross-domain logic.
- **Hydration bottlenecks**: The `DataPersistenceGate` has to block the entire application UI from rendering until all 7 arrays are fully hydrated from local storage.

### Recommendation
Decompose `coreStore.ts` into domain-specific slices: `useVendorStore`, `useUcidStore`, `useCatalogStore`, and `useForensicStore`. Re-combine them only when necessary using Zustand's slice pattern.

---

## Area 17: API Boundary Zod Validation Bypass

While the project has robust Zod schemas defined in `src/types/schemas/zodSchemas.ts`, the frontend API client completely bypasses them.

In `src/services/apiClient.ts`:
```typescript
async get<T>(path: string, options?: RequestInit): Promise<T> {
  // ...
  return data as T; // <-- BLIND CAST
}
```

### Smells
- **False safety**: The `T` generic creates the illusion of type safety, but the client trusts whatever JSON the backend (or MSW) returns, forcing a blind `as T` cast.
- **Runtime crashes**: If the backend payload drifts (e.g. returns a string instead of a number for `price`), the UI will silently accept it and crash during render or math operations.
- **AGENTS.md Violation**: Section 11.6 explicitly mandates "Zod schema validation (e.g., validateBody) at the UI boundary before making the API call".

### Recommendation
Modify `apiClient.ts` methods to accept an optional Zod schema parameter: `async get<T>(path: string, schema?: ZodSchema<T>)`. If a schema is provided, execute `schema.parse(data)` before returning it to guarantee perfect runtime contract adherence.

---

## Area 18: List Virtualization & DOM Bloat (Performance)

Despite `AGENTS.md` strictly mandating the use of `react-virtuoso` for virtualization (Section 5.4), the codebase heavily relies on standard `Array.prototype.map()` for rendering massive lists.

### Smells
- **Unbounded Rendering**: Files like `TaxonomyGraphPanels`, `SolutionConfigCard`, `GroupedUcidList`, and `SnapshotTimeline` are mapping over deep, potentially massive arrays (`configs`, `snap.payloads`, `unmappedIds`) without virtualization.
- **DOM Bloat**: Rendering a 500-item BOM via `.map()` creates thousands of DOM nodes, leading to layout stutter and memory leaks.
- `react-virtuoso` is installed but only utilized in two files (`UCIDEventLedger` and `CatalogCardsList`).

### Recommendation
Refactor all high-volume mapping functions (specifically in Forensics, Taxonomy, and Solution Builder) to use `Virtuoso` (for rows) or `VirtuosoGrid` (for cards).

---

## Area 19: Missing Pessimistic E2E Coverage

The End-to-End (E2E) testing suite (`tests/e2e/`) currently suffers from the "Happy Path Fallacy" outlined in `AGENTS.md` Section 11.4.

### Smells
- **No Failure Path Assertions**: While Playwright verifies the UI functions perfectly under optimal conditions, it rarely asserts how the UI behaves when the backend throws a `500` error, times out, or when a validation gate is rejected.
- **API Drift Masking**: Because the MSW mocks are completely disconnected from the actual backend (as outlined in the API Consistency Matrix), the tests pass against "ghost APIs".
- **Optimistic Rollback Testing**: There is minimal verification that the UI correctly rolls back optimistic state mutations (e.g., removing a part, failing to save, and restoring the part).

### Recommendation
Introduce dedicated pessimistic integration tests (using Vitest + MSW `.use(http.post(..., () => new HttpResponse(null, { status: 500 })))`) to rigorously test error boundaries, toast notifications, and state rollbacks.

---

## Summary — Full Priority Matrix (Areas 1–19)

| # | Area | Severity | Files Affected | Effort |
|---|---|---|---|---|
| 1 | Reconciliation Logic Duplication | 🔴 Critical | 3 (server + util + tests) | Medium |
| 2 | Unsafe `any` Typing | 🔴 Critical | 5+ production files | Medium |
| 8 | Triple-Source Token Fragmentation | 🔴 Critical | 3 token files + 50+ consumers | Medium |
| 10 | Cosmic Slate Tailwind Violations | 🔴 Critical | 30+ files (sky/gray/hex) | Medium |
| 17 | API Boundary Zod Bypass | 🔴 Critical | apiClient.ts + all callers | High |
| 16 | Zustand Store Monolith | 🔴 Critical | coreStore.ts + 40+ consumers | High |
| 3 | Inconsistent Error Handling | 🟡 High | 15+ components | Low–Medium |
| 5 | Oversized Components | 🟡 High | 6 components | High |
| 6 | server.ts Monolith | 🟡 High | 1 file (693 lines) | Medium |
| 7 | Prop Drilling Residue | 🟡 High | App.tsx + 8 routes | Medium |
| 9 | Typography Scale Chaos | 🟡 High | 800+ arbitrary sizes | Medium |
| 11 | Shared Component Bypass | 🟡 High | 70+ raw buttons, 12 raw tables | High |
| 12 | Inline Style Proliferation | 🟡 High | 150+ style={{}} usages | Medium |
| 14 | onNavigate Prop Threading | 🟡 High | 15+ components | Low–Medium |
| 18 | List Virtualization Bypass | 🟡 High | 10+ major views | High |
| 19 | Pessimistic E2E Deficiencies | 🟡 High | tests/e2e/ | High |
| 13 | Motion Library Import Split | 🟠 Medium | 5 files (cleansing/) | Low |
| 4 | Dead Adapter Code | 🟢 Low | 3 files | Low (delete) |
| 15 | Accessibility Gaps | 🟠 Medium | 20+ elements | Medium |

> [!TIP]
> **Final Iteration Sequencing (Production-Ready):**
> 1. **Iteration 1 — Foundation (Types & State)**: Areas 17 (Zod enforcement), 16 (Zustand decompose), and 2 (`any` erasure).
> 2. **Iteration 2 — Architecture (Server)**: Areas 1 (server/client dedup) and 6 (server decomposition).
> 3. **Iteration 3 — Performance & Stability**: Areas 18 (List Virtualization) and 19 (Pessimistic Tests).
> 4. **Iteration 4 — Design System (Tokens)**: Areas 8 (token unification), 13 (motion fix), and 4 (dead code delete).
> 5. **Iteration 5 — UI Enforcement (CSS)**: Areas 9 (type scale), 10 (Tailwind violations), and 12 (inline styles).
> 6. **Iteration 6 — Component Library**: Areas 11 (shared primitives adoption) and 15 (accessibility).
> 7. **Iteration 7 — Cleanup**: Areas 7 (prop drilling), 14 (onNavigate), 5 (God components), and 3 (error handling).
