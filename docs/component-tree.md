# VSIP Platform Component Architecture Tree

This document outlines the directory structure of the `src/components` tree. 
AI Agents must reference this map to locate decomposed UI components properly, rather than executing arbitrary shell searches.

```text
src/components/
├── **catalog/**
│   ├── CatalogAddForm.tsx
│   ├── CatalogCardsList.tsx
│   ├── CatalogFilterBar.tsx
│   ├── CatalogHeader.tsx
│   ├── CatalogManager.tsx
│   ├── CatalogTaxonomyTree.tsx
│   └── CatalogTypeFilters.tsx
├── **cleansing/**
│   ├── CleansingEntryList.tsx
│   ├── CleansingHeader.tsx
│   ├── CleansingMappingPanel.tsx
│   ├── CleansingView.tsx
│   ├── MappingPanel.tsx
│   ├── cleansingTypes.ts
│   ├── constants.ts
│   ├── mockData.ts
│   ├── types.ts
│   └── useCleansingState.ts
├── **dashboard/**
│   ├── ActiveIssuesList.tsx
│   ├── CatalogTrendAnalyzer.tsx
│   ├── Dashboard.tsx
│   ├── DashboardTooltipStyle.ts
│   ├── KpiCard.tsx
│   ├── UcidPipelineCard.tsx
│   ├── VendorHealthList.tsx
│   └── VendorStatusBoard.tsx
├── **forensics/**
│   ├── AddRuleForm.tsx
│   ├── AdviceFileIngestion.tsx
│   ├── ForensicHeader.tsx
│   ├── ForensicIssueCard.tsx
│   ├── ForensicSidebar.tsx
│   ├── ForensicView.tsx
│   ├── LearningLoopFeed.tsx
│   ├── LearningLoopInjector.tsx
│   ├── NLPParser.tsx
│   ├── RefineRuleOverlay.tsx
│   ├── RuleClarificationModal.tsx
│   ├── RuleConflictModal.tsx
│   ├── RulesTable.tsx
│   ├── ScannerOutput.tsx
│   ├── SourcingRulesVault.tsx
│   └── useForensicAutoHeal.ts
├── **ingestion/**
│   ├── BomPanels.tsx
│   ├── BomReconciliationPanel.tsx
│   ├── BoqIngestWorkbook.tsx
│   ├── CiscoWorkspaceNode.tsx
│   ├── ConsolidatedStatusBoard.tsx
│   ├── DellWorkspaceNode.tsx
│   ├── HpeWorkspaceNode.tsx
│   ├── HybridPortfolioOrchestration.tsx
│   ├── IngestionHub.tsx
│   ├── LaunchStep.tsx
│   ├── PortfolioMetricsHeader.tsx
│   ├── SweepCoordinatorBoard.tsx
│   ├── TargetWorkspacePanel.tsx
│   ├── TechnicalBomWorkspace.tsx
│   ├── useBomConversion.ts
│   ├── useBoqIntake.ts
│   ├── useIngestionLogic.ts
│   └── usePortfolioComparison.ts
├── **layout/**
│   ├── BreadcrumbNav.tsx
│   ├── Sidebar.tsx
│   ├── TopBar.tsx
│   └── TopBarSearch.tsx
├── **mission-control/**
│   ├── CampaignConsolidationHub.tsx
│   ├── CampaignPanels.tsx
│   ├── GroupedUcidList.tsx
│   ├── HierarchyHubPanel.tsx
│   ├── MissionControl.tsx
│   ├── MissionControlSidebar.tsx
│   ├── NewUCIDModal.tsx
│   ├── SidebarHeader.tsx
│   ├── SolutionBanner.tsx
│   ├── SolutionConfigCard.tsx
│   ├── SourcingReconciliationDiff.tsx
│   ├── StepContentPanel.tsx
│   ├── UCIDEventLedger.tsx
│   ├── UCIDModals.tsx
│   ├── UCIDStepper.tsx
│   ├── **steps/**
│   │   ├── SnapshotHeader.tsx
│   │   ├── SnapshotTimeline.tsx
│   │   ├── StepBoqIntake.tsx
│   │   ├── StepComparison.tsx
│   │   ├── StepPostIntelligence.tsx
│   │   ├── StepPreIntelligence.tsx
│   │   ├── StepSnapshot.tsx
│   │   ├── StepSolutionDesign.tsx
│   │   └── StepVendorProvisioning.tsx
│   └── useMissionControlWorkflow.ts
├── **reconciliation/**
│   ├── ConfigSheetCard.tsx
│   ├── CreateSnapshotForm.tsx
│   ├── DriftFilterBar.tsx
│   ├── DriftTableRow.tsx
│   ├── ReconciliationDrillDown.tsx
│   ├── ReconciliationEmpty.tsx
│   ├── ReconciliationHeader.tsx
│   ├── ReconciliationOverview.tsx
│   ├── ReconciliationView.tsx
│   ├── SnapshotDiffModal.tsx
│   ├── SnapshotDiffTableRow.tsx
│   ├── SnapshotListItem.tsx
│   ├── SnapshotManager.tsx
│   ├── SnapshotsPanel.tsx
│   ├── SparesPoolCard.tsx
│   ├── VendorDifferencesTable.tsx
│   ├── useDiffConfigs.ts
│   ├── useDrillDownAutoHeal.ts
│   ├── useReconciliationLogic.ts
│   └── useSnapshotManagerLogic.ts
├── **search/**
│   └── SearchView.tsx
├── **shared/**
│   ├── Button.tsx
│   ├── ConstraintOperatorSelector.tsx
│   ├── DataPersistenceGate.tsx
│   ├── ErrorBoundary.tsx
│   ├── GlobalApiErrorListener.tsx
│   ├── JobStreamer.tsx
│   ├── SKUCard.tsx
│   ├── Select.tsx
│   ├── ShimmerBlock.tsx
│   ├── SkeletonRow.tsx
│   ├── StatusBadge.tsx
│   ├── Table.tsx
│   └── ToastContext.tsx
├── **solution-builder/**
│   ├── ConfigLibraryItem.tsx
│   ├── ConfigLibrarySelector.tsx
│   ├── SchemaInspector.tsx
│   ├── SolutionBuilder.tsx
│   ├── SolutionDetail.tsx
│   ├── SolutionManager.tsx
│   ├── StepIntake.tsx
│   ├── StepIntakeDropzone.tsx
│   ├── StepIntakeGuide.tsx
│   ├── StepWorkspace.tsx
│   ├── UcidContainerList.tsx
│   ├── WorkspaceHeader.tsx
│   └── useStepIntakeLogic.ts
├── **taxonomy/**
│   ├── EdgeEditorPanel.tsx
│   ├── KnowledgeGraphCanvas.tsx
│   ├── NodeEditorPanel.tsx
│   ├── TaxonomyCategoryTree.tsx
│   ├── TaxonomyGraphPanels.tsx
│   ├── TaxonomyGraphSidebar.tsx
│   ├── TaxonomyGraphView.tsx
│   └── TaxonomyOrphanBox.tsx
├── **telemetry/**
│   ├── ApiLogsTable.tsx
│   ├── DocumentPipelinePanel.tsx
│   ├── SystemTelemetry.tsx
│   ├── WebhookMonitor.tsx
│   ├── telemetryUtils.ts
│   └── types.ts
└── **vendor-portal/**
    ├── AdviceResolutionPanel.tsx
    ├── VendorComponents.tsx
    ├── VendorGateways.tsx
    ├── VendorIngestionDesk.tsx
    └── VendorPortal.tsx

```
