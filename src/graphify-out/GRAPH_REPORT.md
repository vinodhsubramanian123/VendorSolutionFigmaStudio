# Graph Report - src  (2026-07-14)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1257 nodes · 3351 edges · 77 communities (70 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.5)
- Token cost: 4,349 input · 892 output

## Graph Freshness
- Built from commit: `3436cdcc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Application Views
- Sourcing Rule Management
- BOM Conversion Logic
- Reconciliation UI Components
- Vendor Workspace Integration
- Catalog and Rule Modals
- Solution Builder Configuration
- Data Persistence Schemas
- Catalog Navigation and Filtering
- Integration Test Mock Data
- Solution State Management
- Catalog SKU Components
- UI Type Definitions
- BOM Constraint Panels
- BOQ Ingestion Workflow
- Vendor Health Monitoring
- Step Header Components
- Forensic Sidebar and Rules
- Dashboard and Telemetry State
- Cleansing and Telemetry Schemas
- Catalog Manager Testing
- Data Cleansing View
- Forensic Analysis Loop
- Campaign Consolidation Hub
- Vendor Ingestion Desk
- Configuration Editing Wizards
- Reconciliation Drill Down
- Catalog Trend Analysis
- Document Pipeline Telemetry
- Solution Detail Management
- Snapshot Comparison Tools
- API Mock Handlers
- API Request Types
- Taxonomy and Portfolio Models
- Cleansing Event Ledger
- Vendor Gateway Views
- API Client Methods
- UCID Action Logic
- Hierarchy and Sidebar Headers
- Mission Control Utilities
- Catalog Graph Hooks
- NLP Parser and Scheduler
- Mock Server Controller
- Catalog Header Testing
- Forensic Issue Management
- Mission Control Event Ledger
- Step Intake Workflow
- Graph Node Editor
- Taxonomy Graph Panels
- Navigation Sidebar
- Solution Design Components
- Snapshot Management UI
- Snapshot Manager Logic
- Table UI Components
- Knowledge Graph Canvas
- System Telemetry Logs
- Sourcing and Reconciliation Math
- Reconciliation Test Utilities
- Snapshot Timeline UI
- Webhook Monitoring
- Catalog and Vendor Schemas
- Ingestion Hub Testing
- Pre-Intelligence Step
- Job Streamer Service
- Mission Control Workflow
- UCID Data Mocks
- Seed Data Management
- Theme and Styling
- Dashboard KPI Cards
- Zod Validation Schemas
- Top Bar Search
- Constraint Operator Selector
- Taxonomy Category Tree
- UCID Task Scheduler
- Cleansing Audit Schemas
- Taxonomy Orphan Management
- UCID Versioned Schema

## God Nodes (most connected - your core abstractions)
1. `UCID` - 129 edges
2. `useCoreStore` - 87 edges
3. `ApiClient` - 57 edges
4. `CatalogSKU` - 54 edges
5. `useToast()` - 48 edges
6. `ToastProvider()` - 30 edges
7. `tokens` - 30 edges
8. `SourcingRule` - 30 edges
9. `StatusBadge()` - 29 edges
10. `AppView` - 24 edges

## Surprising Connections (you probably didn't know these)
- `CatalogAddFormProps` --references--> `CatalogSKU`  [EXTRACTED]
  components/catalog/CatalogAddForm.tsx → types/models/vendor.ts
- `SplitConfigWizardProps` --references--> `Config`  [EXTRACTED]
  components/cleansing/SplitConfigWizard.tsx → types/models/sourcing.ts
- `UcidPipelineCardProps` --references--> `AppView`  [EXTRACTED]
  components/dashboard/UcidPipelineCard.tsx → types/models/api.ts
- `NLPParserProps` --references--> `SourcingRule`  [EXTRACTED]
  components/forensics/NLPParser.tsx → types/models/api.ts
- `ConsolidatedStatusBoardProps` --references--> `UCID`  [EXTRACTED]
  components/ingestion/ConsolidatedStatusBoard.tsx → types/models/sourcing.ts

## Import Cycles
- None detected.

## Communities (77 total, 7 thin omitted)

### Community 0 - "Application Views"
Cohesion: 0.05
Nodes (38): App(), CatalogManager, CleansingView, Dashboard, ForensicView, IngestionHub, MissionControl, ReconciliationView (+30 more)

### Community 1 - "Sourcing Rule Management"
Cohesion: 0.08
Nodes (33): AddRuleForm(), AddRuleFormProps, derivePrefilledFields(), PrefilledFields, AdviceFileIngestion(), AdviceFileIngestionProps, AdviceSeverity, AdviceTriageItem (+25 more)

### Community 2 - "BOM Conversion Logic"
Cohesion: 0.08
Nodes (31): mockUcids, BomConstraintDefaults, extractBomConstraintDefaults(), extractErrorMessage(), repairSolutions(), updateUcidWithVerification(), useBomConversion(), buildGeneratedUcid() (+23 more)

### Community 3 - "Reconciliation UI Components"
Cohesion: 0.07
Nodes (32): AnnotationCell, AnnotationCellProps, ConfigSheetCard(), ConfigSheetCardProps, DriftTableRow, DRIFT_BADGES, getVendorBadgeClasses(), ReconciliationHeader() (+24 more)

### Community 4 - "Vendor Workspace Integration"
Cohesion: 0.07
Nodes (31): CISCO_CONFIGS, CiscoWorkspaceNode(), CiscoWorkspaceNodeProps, ConsolidatedStatusBoard(), ConsolidatedStatusBoardProps, getBoardUcids(), getCiscoRowData(), getDellRowData() (+23 more)

### Community 5 - "Catalog and Rule Modals"
Cohesion: 0.09
Nodes (23): CatalogAddForm(), CatalogAddFormProps, formSchema, FormValues, RuleClarificationModal(), RuleClarificationModalProps, formSchema, FormValues (+15 more)

### Community 6 - "Solution Builder Configuration"
Cohesion: 0.12
Nodes (23): ConfigLibraryItem(), ConfigLibraryItemProps, ConfigLibrarySelector(), ConfigLibrarySelectorProps, HardwareConstraints, SolutionBuilder, SolutionBuilderProps, StepWorkspace() (+15 more)

### Community 7 - "Data Persistence Schemas"
Cohesion: 0.13
Nodes (22): DataPersistenceGateProps, ForensicIssueSchema, LearningEventSchema, LineReconciliationDiffSchema, LogEventSchema, PortalErrorItemSchema, ReconciliationSessionSchema, SourcingRuleSchema (+14 more)

### Community 8 - "Catalog Navigation and Filtering"
Cohesion: 0.15
Nodes (15): CatalogFilterBar(), CatalogFilterBarProps, DEFAULT_FILTER_STATE, DEFAULT_PATH, FilterAction, FilterState, CatalogTaxonomyTree, CatalogTaxonomyTreeProps (+7 more)

### Community 9 - "Integration Test Mock Data"
Cohesion: 0.10
Nodes (22): SAMPLE_CONSTRAINT_CHECK_REQUEST, SAMPLE_CONSTRAINT_CHECK_RESPONSE, SAMPLE_GRAPH_API_RESPONSE, SAMPLE_INGEST_REQUEST, SAMPLE_INGEST_RESPONSE, SAMPLE_PLAYWRIGHT_RUN_REQUEST, SAMPLE_PLAYWRIGHT_RUN_RESPONSE, SAMPLE_PORTFOLIO_MANUAL_UPLOAD_REQUEST (+14 more)

### Community 10 - "Solution State Management"
Cohesion: 0.15
Nodes (16): SOLUTIONS, createSolutionsSlice(), createUcidsSlice(), SolutionsSlice, UcidsSlice, AutomationRunStatus, IngestionMode, LogEvent (+8 more)

### Community 11 - "Catalog SKU Components"
Cohesion: 0.13
Nodes (14): BRAND_COLORS, CatalogCardsList(), CatalogCardsListProps, getCategoryIcon(), SKUCardProps, CATALOG_SKUS, catalogSkusPart1, catalogSkusPart2 (+6 more)

### Community 12 - "UI Type Definitions"
Cohesion: 0.09
Nodes (22): ApiErrorResponse, ForensicAnomaly, GraphMetadata, Invoice, JobStatus, JobType, KPI, MissionScenario (+14 more)

### Community 13 - "BOM Constraint Panels"
Cohesion: 0.16
Nodes (15): BomPhysicalConstraintsPanel(), BomPhysicalConstraintsPanelProps, BomReconstructionMatrix(), BomReconstructionMatrixProps, BomReconciliationPanel(), BomReconciliationPanelProps, SweepCoordinatorBoard(), SweepCoordinatorBoardProps (+7 more)

### Community 14 - "BOQ Ingestion Workflow"
Cohesion: 0.18
Nodes (14): BoqIngestWorkbook(), BoqIngestWorkbookProps, getUcidDisplayRef(), BOQ_PRESETS, BoqPreset, deriveParsedSpecsSummary(), ParsedSpecsSummary, StepBoqIntake() (+6 more)

### Community 15 - "Vendor Health Monitoring"
Cohesion: 0.23
Nodes (9): ActiveIssuesList(), ActiveIssuesListProps, DashboardProps, VendorHealthList(), VendorHealthListProps, IngestionHubProps, LaunchStep(), LaunchStepProps (+1 more)

### Community 16 - "Step Header Components"
Cohesion: 0.16
Nodes (15): ForensicHeaderProps, StepContentPanel(), StepContentPanelProps, SnapshotHeader(), StepComparison(), StepComparisonProps, StepPostIntelligence(), StepPostIntelligenceProps (+7 more)

### Community 17 - "Forensic Sidebar and Rules"
Cohesion: 0.14
Nodes (14): ForensicSidebar(), ForensicSidebarProps, RulesTable(), RulesTableProps, BreadcrumbNav(), BreadcrumbNavProps, useActiveContext(), SolutionBanner() (+6 more)

### Community 18 - "Dashboard and Telemetry State"
Cohesion: 0.18
Nodes (12): SOLUTION_ACTIVE, SOLUTION_COMPLETED, DEFAULT_CONFIGS, TaxonomyGraphView(), VENDORS, createTelemetrySlice(), createUiSlice(), createVendorsSlice() (+4 more)

### Community 19 - "Cleansing and Telemetry Schemas"
Cohesion: 0.10
Nodes (19): PlaywrightAgentConfig, PlaywrightAgentTask, PlaywrightExecutionLog, AddItemEventSchema, BaseCleansingEventSchema, CleansingEventSchema, CleansingEventTypeSchema, FlatComparisonSolutionSchema (+11 more)

### Community 20 - "Catalog Manager Testing"
Cohesion: 0.15
Nodes (9): CatalogManager(), filterReducer(), mockSkus, mockVendors, server, mockSkus, mockVendors, createMockCatalogSKU() (+1 more)

### Community 21 - "Data Cleansing View"
Cohesion: 0.25
Nodes (10): CleansingEntryListProps, CleansingHeader(), CleansingHeaderProps, CleansingView(), STATUS_CONFIG, MappingPanel(), MappingPanelProps, generateMockEntries() (+2 more)

### Community 22 - "Forensic Analysis Loop"
Cohesion: 0.16
Nodes (13): ForensicHeader(), ForensicView(), ForensicViewProps, LearningLoopFeed(), LearningLoopFeedProps, RULE_TYPE_CONFIG, mapCiscoSymmetryIssue(), mapDellPriceVarianceIssue() (+5 more)

### Community 23 - "Campaign Consolidation Hub"
Cohesion: 0.18
Nodes (13): CampaignConsolidationHub(), CampaignConsolidationHubProps, CampaignCertificationPanel(), CampaignCertificationPanelProps, CampaignReconciliationMatrix(), CampaignReconciliationMatrixProps, CampaignReconciliationMatrixRow(), findVendorSubmission() (+5 more)

### Community 24 - "Vendor Ingestion Desk"
Cohesion: 0.15
Nodes (15): AdviceResolutionPanel(), AdviceResolutionPanelProps, SEVERITY_CFG, server, VendorConsoleLogs(), VendorConsoleLogsProps, VendorCredentialsCard(), VendorCredentialsCardProps (+7 more)

### Community 25 - "Configuration Editing Wizards"
Cohesion: 0.20
Nodes (10): AddBOQPartModal(), AddBOQPartModalProps, CleansingEditorRow(), CleansingEditorRowProps, DeepCleansingEditor(), SplitConfigWizard(), SplitConfigWizardProps, ModalBackdrop() (+2 more)

### Community 26 - "Reconciliation Drill Down"
Cohesion: 0.17
Nodes (9): MissionControl, mockUcids, DriftFilterBar, DriftFilterBarProps, ReconciliationDrillDown, mockUcid, ToastContext, ToastProvider() (+1 more)

### Community 27 - "Catalog Trend Analysis"
Cohesion: 0.19
Nodes (11): CatalogTrendAnalyzer, CatalogTrendAnalyzerProps, TOOLTIP_STYLE, VendorStatusBoardProps, ScannerOutput(), ScannerOutputProps, CATALOG_TREND, FORENSIC_ISSUES (+3 more)

### Community 28 - "Document Pipeline Telemetry"
Cohesion: 0.21
Nodes (13): DocumentPipelinePanel(), PipelineStepResponse, DOC_ICON, formatBytes(), getCategory(), HTTP_COLOR, makeMockApiLogs(), makeMockWebhooks() (+5 more)

### Community 29 - "Solution Detail Management"
Cohesion: 0.16
Nodes (11): useCleansingState(), TopBar(), TopBarProps, TestComponent(), useToast(), EDITABLE_STATUSES, SolutionDetail(), mockDeleteSolution (+3 more)

### Community 30 - "Snapshot Comparison Tools"
Cohesion: 0.25
Nodes (13): SnapshotDiffModal(), getChangeStyles(), getTotalDriftStyle(), renderQtyDrift(), renderUnitDrift(), SnapshotDiffTableRow(), computeDiffSheets(), computeItemDiff() (+5 more)

### Community 31 - "API Mock Handlers"
Cohesion: 0.24
Nodes (10): MockCatalogApi, MockSnapshotApi, MockSolutionApi, MockTaxonomyApi, NOTE: catalog data is intentionally NOT held here. coreStore.ts is the, serverState, NOTE: the fictional memoryGraphNodes/memoryGraphEdges that used to live, wrapSuccess() (+2 more)

### Community 32 - "API Request Types"
Cohesion: 0.12
Nodes (15): ConstraintCheckRequest, CreateSnapshotRequest, CreateSnapshotResponse, GetUCIDDetailRequest, GetUCIDDetailResponse, IngestRequest, IngestResponse, PlaywrightRunRequest (+7 more)

### Community 33 - "Taxonomy and Portfolio Models"
Cohesion: 0.12
Nodes (15): CompatibilityRule, LineReconciliationDiff, OutboundWebhookConfig, PaginatedResponse, PhysicalConstraint, PortfolioManualUploadRequest, PortfolioManualUploadResponse, PortfolioOrchestrateRequest (+7 more)

### Community 34 - "Cleansing Event Ledger"
Cohesion: 0.22
Nodes (10): CleansingEventLedger(), NOTE: getGraphSolution, createGraphNode, updateGraphNode,, AddItemEvent, BaseCleansingEvent, CleansingAuditEntry, CleansingEvent, CleansingEventType, QuantityUpdateEvent (+2 more)

### Community 35 - "Vendor Gateway Views"
Cohesion: 0.22
Nodes (8): AnimatedViewWrapper(), AnimatedViewWrapperProps, PlaywrightConsole(), containerVariants, VendorGateways(), VendorGatewaysProps, VendorPortal, Vendor

### Community 37 - "UCID Action Logic"
Cohesion: 0.30
Nodes (13): makeLockedUcid(), makeUcid(), advanceUcidStep(), applyPatch(), commitUcidSnapshot(), deleteUcid(), findUcid(), guardUcidAction() (+5 more)

### Community 38 - "Hierarchy and Sidebar Headers"
Cohesion: 0.32
Nodes (5): HierarchyHubPanel(), HierarchyHubPanelProps, MissionControlSidebar(), SidebarHeader(), SidebarHeaderProps

### Community 39 - "Mission Control Utilities"
Cohesion: 0.23
Nodes (10): formatUcidDisplayName(), getStepState(), getSyncStatusVariant(), StepState, deriveStepNodeStyle(), STEP_ICONS, StepItem(), STEPS_DATA (+2 more)

### Community 40 - "Catalog Graph Hooks"
Cohesion: 0.24
Nodes (12): applyOverlay(), deriveGraphFromConfig(), emptyOverlay(), MapNodeRequest, TaxonomyGraphError, useCatalogGraphData(), withAddedEdge(), withAddedNode() (+4 more)

### Community 41 - "NLP Parser and Scheduler"
Cohesion: 0.19
Nodes (9): ChatMessage, InjectorState, NLPParser(), NLPParserProps, NOTE: This step is a pure client-side state transition (accumulating, SchedulerTask, logger, LogLevel (+1 more)

### Community 42 - "Mock Server Controller"
Cohesion: 0.17
Nodes (8): enableMocking(), mockServer, MockServerController, handlers, graphHandlers, snapshotHandlers, vendorAgentHandlers, workflowHandlers

### Community 43 - "Catalog Header Testing"
Cohesion: 0.30
Nodes (4): CatalogHeader(), CatalogHeaderProps, AllTheProviders(), customRender()

### Community 44 - "Forensic Issue Management"
Cohesion: 0.20
Nodes (9): ForensicIssueCard(), ForensicIssueCardProps, mockForensicIssues, mockUcid, server, ReconciliationDrillDownProps, createForensicSlice(), ForensicSlice (+1 more)

### Community 45 - "Mission Control Event Ledger"
Cohesion: 0.20
Nodes (6): MissionControlProps, FILTER_LEVELS, LogLevel, UCIDEventLedger(), UCIDEventLedgerProps, PRIORITY_COLOR

### Community 46 - "Step Intake Workflow"
Cohesion: 0.24
Nodes (7): StepIntake(), StepIntakeProps, StepIntakeDropzone(), StepIntakeDropzoneProps, StepIntakeGuide(), StepIntakeGuideProps, useStepIntakeLogic()

### Community 47 - "Graph Node Editor"
Cohesion: 0.35
Nodes (7): EdgeEditorPanel(), EdgeEditorPanelProps, NodeEditorPanel(), NodeEditorPanelProps, GraphOverlay, GraphEdge, GraphNode

### Community 48 - "Taxonomy Graph Panels"
Cohesion: 0.26
Nodes (8): MechanicalConstraintsPanel(), MechanicalConstraintsPanelProps, OrphanWorkshopPanel(), OrphanWorkshopPanelProps, PathOrchestratorPanel(), PathOrchestratorPanelProps, TaxonomyGraphSidebar(), TaxonomyGraphSidebarProps

### Community 49 - "Navigation Sidebar"
Cohesion: 0.22
Nodes (7): NavItem, Sidebar(), SidebarProps, ACTIVE_SOLUTION, DEFAULT_PROPS, mockNavigate, getSolutionName()

### Community 50 - "Solution Design Components"
Cohesion: 0.25
Nodes (8): SolutionConfigCard(), SolutionConfigCardProps, TYPE_COLORS, SourcingReconciliationDiff(), SourcingReconciliationDiffProps, StepSolutionDesign(), StepSolutionDesignProps, VendorSubmission

### Community 51 - "Snapshot Management UI"
Cohesion: 0.24
Nodes (7): CreateSnapshotForm(), CreateSnapshotFormProps, SnapshotListItem(), SnapshotManager(), SnapshotManagerProps, SnapshotsPanel(), SnapshotsPanelProps

### Community 52 - "Snapshot Manager Logic"
Cohesion: 0.38
Nodes (6): mockUCID, buildSnapshot(), findChosenSubmission(), getFirstSolutionSubmissions(), getSnapshotBaseData(), useSnapshotManagerLogic()

### Community 53 - "Table UI Components"
Cohesion: 0.24
Nodes (3): SkeletonRowProps, TableCell(), TableRow()

### Community 54 - "Knowledge Graph Canvas"
Cohesion: 0.22
Nodes (6): getLayoutedElements(), KnowledgeGraphCanvas(), KnowledgeGraphCanvasInner(), KnowledgeGraphCanvasProps, nodeTypes, GraphPath

### Community 55 - "System Telemetry Logs"
Cohesion: 0.36
Nodes (6): ApiLogsTable(), ApiLogsTableProps, getHttpColor(), SystemTelemetry(), TELEMETRY_TABS, ApiLogEntry

### Community 56 - "Sourcing and Reconciliation Math"
Cohesion: 0.31
Nodes (5): ActiveSourcingRules, INITIAL_RULES, calculateReconciliation(), SolutionInput, SolutionItem

### Community 57 - "Reconciliation Test Utilities"
Cohesion: 0.28
Nodes (6): ReconciliationOverviewTestWrapper(), mockCatalogSku, mockSkus, mockUcid, mockUcids, mockVendors

### Community 58 - "Snapshot Timeline UI"
Cohesion: 0.39
Nodes (6): SnapshotTimeline(), SnapshotTimelineProps, SnapshotDiffModalProps, SnapshotListItemProps, Config, Snapshot

### Community 59 - "Webhook Monitoring"
Cohesion: 0.39
Nodes (5): server, WebhookEvent, getHttpColor(), WebhookMonitor(), WebhookMonitorProps

### Community 60 - "Catalog and Vendor Schemas"
Cohesion: 0.29
Nodes (6): VendorExtendedFields, BOMItemSchema, CatalogItemType, CatalogItemTypeSchema, CatalogSKUSchema, VendorExtendedFieldsSchema

### Community 61 - "Ingestion Hub Testing"
Cohesion: 0.52
Nodes (4): IngestionHub(), IngestionHubTestWrapper(), mockUcid, Wrapper()

### Community 63 - "Job Streamer Service"
Cohesion: 0.43
Nodes (5): JobStreamer(), JobStreamerProps, SSEMessage, mockContext, JobContext

### Community 64 - "Mission Control Workflow"
Cohesion: 0.26
Nodes (9): GroupedUcidList(), GroupedUcidListProps, MissionControlSidebarProps, useMissionControlWorkflow(), UseMissionControlWorkflowProps, useAuditLog(), generateDefaultSolutions(), STEP_ORDER (+1 more)

### Community 65 - "UCID Data Mocks"
Cohesion: 0.47
Nodes (3): UCIDS, mockUcidsComputeStorage, mockUcidsNetworkingSecurity

### Community 66 - "Seed Data Management"
Cohesion: 0.67
Nodes (3): clearPersistedStores(), PERSISTED_STORE_KEYS, resetToSeedData()

### Community 67 - "Theme and Styling"
Cohesion: 0.33
Nodes (3): cosmicSlate, ThemeContext, ThemeProviderProps

### Community 68 - "Dashboard KPI Cards"
Cohesion: 0.24
Nodes (9): Dashboard(), KpiCard(), KpiCardProps, parseNumericValue(), UcidPipelineCard(), UcidPipelineCardProps, VendorStatusBoard(), useChartDimensions() (+1 more)

### Community 69 - "Zod Validation Schemas"
Cohesion: 0.40
Nodes (4): ConstraintCheckRequestSchema, IngestRequestSchema, ReconciliationRequestSchema, validators

### Community 70 - "Top Bar Search"
Cohesion: 0.67
Nodes (3): TopBarSearch(), TopBarSearchProps, useSearchMatching()

### Community 74 - "Cleansing Audit Schemas"
Cohesion: 0.50
Nodes (3): CleansingAuditEntrySchema, CleansingEntrySchema, ResolutionSuggestionSchema

## Knowledge Gaps
- **253 isolated node(s):** `Dashboard`, `MissionControl`, `CatalogManager`, `VendorPortal`, `ForensicView` (+248 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `UCID` connect `Step Header Components` to `Application Views`, `BOM Conversion Logic`, `Reconciliation UI Components`, `Vendor Workspace Integration`, `Catalog and Rule Modals`, `Solution Builder Configuration`, `Solution State Management`, `Catalog SKU Components`, `BOM Constraint Panels`, `BOQ Ingestion Workflow`, `Forensic Sidebar and Rules`, `Catalog Manager Testing`, `Forensic Analysis Loop`, `Campaign Consolidation Hub`, `Vendor Ingestion Desk`, `Reconciliation Drill Down`, `Snapshot Comparison Tools`, `API Mock Handlers`, `API Request Types`, `UCID Action Logic`, `Hierarchy and Sidebar Headers`, `Mission Control Utilities`, `NLP Parser and Scheduler`, `Forensic Issue Management`, `Mission Control Event Ledger`, `Solution Design Components`, `Snapshot Management UI`, `Snapshot Manager Logic`, `Reconciliation Test Utilities`, `Snapshot Timeline UI`, `Ingestion Hub Testing`, `Pre-Intelligence Step`, `Mission Control Workflow`, `UCID Data Mocks`, `Top Bar Search`, `UCID Task Scheduler`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **Why does `ApiClient` connect `API Client Methods` to `Sourcing Rule Management`, `BOM Conversion Logic`, `Reconciliation UI Components`, `Catalog Navigation and Filtering`, `Integration Test Mock Data`, `BOQ Ingestion Workflow`, `Step Header Components`, `Data Cleansing View`, `Forensic Analysis Loop`, `Vendor Ingestion Desk`, `Reconciliation Drill Down`, `Document Pipeline Telemetry`, `API Mock Handlers`, `Cleansing Event Ledger`, `Vendor Gateway Views`, `Catalog Graph Hooks`, `NLP Parser and Scheduler`, `Step Intake Workflow`, `Taxonomy Graph Panels`, `Snapshot Manager Logic`, `System Telemetry Logs`, `Webhook Monitoring`, `Ingestion Hub Testing`, `Job Streamer Service`, `Mission Control Workflow`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `useCoreStore` connect `Forensic Sidebar and Rules` to `Application Views`, `Sourcing Rule Management`, `BOM Conversion Logic`, `Reconciliation UI Components`, `Catalog and Rule Modals`, `Solution Builder Configuration`, `Data Persistence Schemas`, `Catalog Navigation and Filtering`, `Vendor Health Monitoring`, `Dashboard and Telemetry State`, `Catalog Manager Testing`, `Data Cleansing View`, `Forensic Analysis Loop`, `Configuration Editing Wizards`, `Reconciliation Drill Down`, `Solution Detail Management`, `Vendor Gateway Views`, `Hierarchy and Sidebar Headers`, `Forensic Issue Management`, `Mission Control Event Ledger`, `Navigation Sidebar`, `Snapshot Management UI`, `Sourcing and Reconciliation Math`, `Ingestion Hub Testing`, `Dashboard KPI Cards`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **What connects `Dashboard`, `MissionControl`, `CatalogManager` to the rest of the system?**
  _253 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Application Views` be split into smaller, more focused modules?**
  _Cohesion score 0.05191256830601093 - nodes in this community are weakly interconnected._
- **Should `Sourcing Rule Management` be split into smaller, more focused modules?**
  _Cohesion score 0.08408163265306122 - nodes in this community are weakly interconnected._
- **Should `BOM Conversion Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.07922705314009662 - nodes in this community are weakly interconnected._