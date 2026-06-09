# Vendor Solution Intelligence Platform: Frontend Audit Report

## 1. File Summary (`.tsx` Files)

| File | Lines | Type |
|---|---|---|
| `src/App.tsx` | 388 | Focused Component |
| `src/components/catalog/CatalogAddForm.tsx` | 178 | Focused Component |
| `src/components/catalog/CatalogCardsList.tsx` | 185 | Focused Component |
| `src/components/catalog/CatalogFilterBar.tsx` | 84 | Focused Component |
| `src/components/catalog/CatalogHeader.tsx` | 58 | Focused Component |
| `src/components/catalog/CatalogManager.tsx` | 438 | Monolithic View |
| `src/components/catalog/CatalogPagination.tsx` | 78 | Focused Component |
| `src/components/cleansing/CleansingView.tsx` | 412 | Monolithic View |
| `src/components/dashboard/ActiveIssuesList.tsx` | 93 | Focused Component |
| `src/components/dashboard/CatalogTrendAnalyzer.tsx` | 107 | Focused Component |
| `src/components/dashboard/Dashboard.tsx` | 349 | Monolithic View |
| `src/components/dashboard/KpiCard.tsx` | 83 | Focused Component |
| `src/components/dashboard/VendorHealthList.tsx` | 94 | Focused Component |
| `src/components/dashboard/VendorStatusBoard.tsx` | 87 | Focused Component |
| `src/components/forensics/ForensicHeader.tsx` | 98 | Focused Component |
| `src/components/forensics/ForensicIssueCard.tsx` | 82 | Focused Component |
| `src/components/forensics/ForensicSidebar.tsx` | 105 | Focused Component |
| `src/components/forensics/ForensicView.tsx` | 569 | Monolithic View |
| `src/components/forensics/ScannerOutput.tsx` | 34 | Focused Component |
| `src/components/ingestion/BoqIngestWorkbook.tsx` | 346 | Focused Component |
| `src/components/ingestion/HybridPortfolioOrchestration.tsx` | 685 | Focused Component |
| `src/components/ingestion/IngestionHub.tsx` | 1018 | Monolithic View |
| `src/components/ingestion/LaunchStep.tsx` | 40 | Focused Component |
| `src/components/ingestion/TechnicalBomWorkspace.tsx` | 639 | Focused Component |
| `src/components/layout/BreadcrumbNav.tsx` | 73 | Focused Component |
| `src/components/layout/Sidebar.tsx` | 278 | Focused Component |
| `src/components/layout/TopBar.tsx` | 193 | Focused Component |
| `src/components/live-mission/CampaignConsolidationHub.tsx` | 617 | Monolithic View |
| `src/components/live-mission/LiveMission.tsx` | 571 | Monolithic View |
| `src/components/live-mission/LiveMissionSidebar.tsx` | 384 | Focused Component |
| `src/components/live-mission/NewUCIDModal.tsx` | 142 | Focused Component |
| `src/components/live-mission/SolutionBanner.tsx` | 134 | Focused Component |
| `src/components/live-mission/SolutionConfigCard.tsx` | 140 | Focused Component |
| `src/components/live-mission/SourcingReconciliationDiff.tsx` | 155 | Focused Component |
| `src/components/live-mission/StepContentPanel.tsx` | 121 | Focused Component |
| `src/components/live-mission/UCIDEventLedger.tsx` | 47 | Focused Component |
| `src/components/live-mission/UCIDStepper.tsx` | 191 | Focused Component |
| `src/components/live-mission/steps/StepBoqIntake.tsx` | 575 | Focused Component |
| `src/components/live-mission/steps/StepComparison.tsx` | 161 | Focused Component |
| `src/components/live-mission/steps/StepPostIntelligence.tsx` | 53 | Focused Component |
| `src/components/live-mission/steps/StepPreIntelligence.tsx` | 75 | Focused Component |
| `src/components/live-mission/steps/StepSnapshot.tsx` | 250 | Focused Component |
| `src/components/live-mission/steps/StepSolutionDesign.tsx` | 64 | Focused Component |
| `src/components/live-mission/steps/StepVendorProvisioning.tsx` | 64 | Focused Component |
| `src/components/reconciliation/ReconciliationDrillDown.tsx` | 401 | Focused Component |
| `src/components/reconciliation/ReconciliationEmpty.tsx` | 17 | Focused Component |
| `src/components/reconciliation/ReconciliationOverview.tsx` | 404 | Focused Component |
| `src/components/reconciliation/ReconciliationView.tsx` | 70 | Monolithic View |
| `src/components/reports/ReportsView.tsx` | 482 | Monolithic View |
| `src/components/search/SearchView.tsx` | 257 | Monolithic View |
| `src/components/shared/Button.tsx` | 50 | Focused Component |
| `src/components/shared/DataPersistenceGate.tsx` | 112 | Focused Component |
| `src/components/shared/ErrorBoundary.tsx` | 77 | Focused Component |
| `src/components/shared/SKUCard.tsx` | 53 | Focused Component |
| `src/components/shared/Select.tsx` | 28 | Focused Component |
| `src/components/shared/StatusBadge.tsx` | 46 | Focused Component |
| `src/components/shared/Table.tsx` | 79 | Focused Component |
| `src/components/shared/ToastContext.tsx` | 113 | Focused Component |
| `src/components/solution-builder/ConfigLibraryItem.tsx` | 90 | Focused Component |
| `src/components/solution-builder/SolutionBuilder.tsx` | 283 | Focused Component |
| `src/components/solution-builder/StepIntake.tsx` | 297 | Focused Component |
| `src/components/solution-builder/StepWorkspace.tsx` | 405 | Focused Component |
| `src/components/taxonomy/TaxonomyGraphEditor.tsx` | 575 | Focused Component |
| `src/components/taxonomy/TaxonomyTree.tsx` | 857 | Focused Component |
| `src/components/vendor-portal/VendorGateways.tsx` | 121 | Focused Component |
| `src/components/vendor-portal/VendorIngestionDesk.tsx` | 401 | Focused Component |
| `src/components/vendor-portal/VendorPortal.tsx` | 181 | Monolithic View |
| `src/main.tsx` | 42 | Focused Component |

## 2. Hardcoded Hex Colors

- `src/App.tsx:336`: `#06080e`
- `src/components/catalog/CatalogAddForm.tsx:44`: `#090d19`
- `src/components/catalog/CatalogCardsList.tsx:71`: `#00d4a0`
- `src/components/catalog/CatalogCardsList.tsx:76`: `#0f172a`
- `src/components/catalog/CatalogCardsList.tsx:130`: `#00d4a0`
- `src/components/catalog/CatalogFilterBar.tsx:48`: `#10192e`
- `src/components/catalog/CatalogManager.tsx:332`: `#0f1728`
- `src/components/catalog/CatalogManager.tsx:406`: `#091815`
- `src/components/catalog/CatalogManager.tsx:408`: `#1c1409`
- `src/components/catalog/CatalogManager.tsx:409`: `#1c090d`
- `src/components/catalog/CatalogManager.tsx:412`: `#00d4a0`
- `src/components/catalog/CatalogManager.tsx:414`: `#ff9b36`
- `src/components/catalog/CatalogManager.tsx:415`: `#ff3d5a`
- `src/components/catalog/CatalogManager.tsx:418`: `#00d4a0`
- `src/components/catalog/CatalogManager.tsx:420`: `#ff9b36`
- `src/components/catalog/CatalogManager.tsx:421`: `#ff3d5a`
- `src/components/cleansing/CleansingView.tsx:332`: `#10b981`
- `src/components/cleansing/CleansingView.tsx:334`: `#6366f1`
- `src/components/cleansing/CleansingView.tsx:335`: `#f59e0b`
- `src/components/cleansing/CleansingView.tsx:344`: `#10b981`
- `src/components/cleansing/CleansingView.tsx:346`: `#6366f1`
- `src/components/cleansing/CleansingView.tsx:347`: `#f59e0b`
- `src/components/dashboard/ActiveIssuesList.tsx:17`: `#0b1220`
- `src/components/dashboard/ActiveIssuesList.tsx:25`: `#dde6ff`
- `src/components/dashboard/ActiveIssuesList.tsx:54`: `#ff3d5a`
- `src/components/dashboard/ActiveIssuesList.tsx:56`: `#ff9b36`
- `src/components/dashboard/ActiveIssuesList.tsx:57`: `#4a85fd`
- `src/components/dashboard/ActiveIssuesList.tsx:63`: `#dde6ff`
- `src/components/dashboard/ActiveIssuesList.tsx:69`: `#5d7899`
- `src/components/dashboard/ActiveIssuesList.tsx:85`: `#ff3d5a`
- `src/components/dashboard/CatalogTrendAnalyzer.tsx:17`: `#0b1220`
- `src/components/dashboard/CatalogTrendAnalyzer.tsx:23`: `#dde6ff`
- `src/components/dashboard/CatalogTrendAnalyzer.tsx:26`: `#5d7899`
- `src/components/dashboard/CatalogTrendAnalyzer.tsx:32`: `#00d4a0`
- `src/components/dashboard/CatalogTrendAnalyzer.tsx:53`: `#4a85fd`
- `src/components/dashboard/CatalogTrendAnalyzer.tsx:59`: `#4a85fd`
- `src/components/dashboard/CatalogTrendAnalyzer.tsx:72`: `#5d7899`
- `src/components/dashboard/CatalogTrendAnalyzer.tsx:78`: `#5d7899`
- `src/components/dashboard/CatalogTrendAnalyzer.tsx:91`: `#4a85fd`
- `src/components/dashboard/CatalogTrendAnalyzer.tsx:94`: `#4a85fd`
- `src/components/dashboard/Dashboard.tsx:71`: `#4a85fd`
- `src/components/dashboard/Dashboard.tsx:81`: `#00d4a0`
- `src/components/dashboard/Dashboard.tsx:91`: `#ff9b36`
- `src/components/dashboard/Dashboard.tsx:101`: `#ff3d5a`
- `src/components/dashboard/Dashboard.tsx:111`: `#a855f7`
- `src/components/dashboard/Dashboard.tsx:121`: `#00d4a0`
- `src/components/dashboard/Dashboard.tsx:141`: `#dde6ff`
- `src/components/dashboard/Dashboard.tsx:145`: `#5d7899`
- `src/components/dashboard/Dashboard.tsx:154`: `#ff3d5a`
- `src/components/dashboard/Dashboard.tsx:155`: `#ff3d5a`
- `src/components/dashboard/Dashboard.tsx:155`: `#fff`
- `src/components/dashboard/Dashboard.tsx:164`: `#4a85fd`
- `src/components/dashboard/Dashboard.tsx:164`: `#fff`
- `src/components/dashboard/Dashboard.tsx:216`: `#0b1220`
- `src/components/dashboard/Dashboard.tsx:224`: `#dde6ff`
- `src/components/dashboard/Dashboard.tsx:258`: `#ff3d5a`
- `src/components/dashboard/Dashboard.tsx:259`: `#ff9b36`
- `src/components/dashboard/Dashboard.tsx:260`: `#4a85fd`
- `src/components/dashboard/Dashboard.tsx:261`: `#5d7899`
- `src/components/dashboard/Dashboard.tsx:277`: `#dde6ff`
- `src/components/dashboard/Dashboard.tsx:285`: `#8ba4cc`
- `src/components/dashboard/Dashboard.tsx:296`: `#00d4a0`
- `src/components/dashboard/Dashboard.tsx:297`: `#ff9b36`
- `src/components/dashboard/Dashboard.tsx:306`: `#5d7899`
- `src/components/dashboard/Dashboard.tsx:321`: `#00d4a0`
- `src/components/dashboard/Dashboard.tsx:322`: `#4a85fd`
- `src/components/dashboard/Dashboard.tsx:322`: `#00d4a0`
- `src/components/dashboard/Dashboard.tsx:328`: `#3a5070`
- `src/components/dashboard/DashboardTooltipStyle.ts:3`: `#0d1528`
- `src/components/dashboard/DashboardTooltipStyle.ts:6`: `#dde6ff`
- `src/components/dashboard/DashboardTooltipStyle.ts:9`: `#8ba4cc`
- `src/components/dashboard/DashboardTooltipStyle.ts:10`: `#dde6ff`
- `src/components/dashboard/KpiCard.tsx:39`: `#0b1220`
- `src/components/dashboard/KpiCard.tsx:52`: `#00d4a0`
- `src/components/dashboard/KpiCard.tsx:52`: `#ff3d5a`
- `src/components/dashboard/KpiCard.tsx:64`: `#dde6ff`
- `src/components/dashboard/KpiCard.tsx:70`: `#8ba4cc`
- `src/components/dashboard/KpiCard.tsx:76`: `#3a5070`
- `src/components/dashboard/VendorHealthList.tsx:15`: `#0b1220`
- `src/components/dashboard/VendorHealthList.tsx:23`: `#dde6ff`
- `src/components/dashboard/VendorHealthList.tsx:47`: `#8ba4cc`
- `src/components/dashboard/VendorHealthList.tsx:61`: `#00d4a0`
- `src/components/dashboard/VendorHealthList.tsx:63`: `#ff9b36`
- `src/components/dashboard/VendorHealthList.tsx:64`: `#ff3d5a`
- `src/components/dashboard/VendorHealthList.tsx:71`: `#00d4a0`
- `src/components/dashboard/VendorHealthList.tsx:71`: `#ff9b36`
- `src/components/dashboard/VendorHealthList.tsx:81`: `#00d4a0`
- `src/components/dashboard/VendorHealthList.tsx:83`: `#a855f7`
- `src/components/dashboard/VendorHealthList.tsx:84`: `#5d7899`
- `src/components/dashboard/VendorStatusBoard.tsx:18`: `#0b1220`
- `src/components/dashboard/VendorStatusBoard.tsx:24`: `#dde6ff`
- `src/components/dashboard/VendorStatusBoard.tsx:28`: `#5d7899`
- `src/components/dashboard/VendorStatusBoard.tsx:74`: `#8ba4cc`
- `src/components/dashboard/VendorStatusBoard.tsx:78`: `#dde6ff`
- `src/components/forensics/ForensicHeader.tsx:32`: `#ff3d5a`
- `src/components/forensics/ForensicHeader.tsx:32`: `#ff3d5a`
- `src/components/forensics/ForensicHeader.tsx:49`: `#ff3d5a`
- `src/components/forensics/ForensicHeader.tsx:49`: `#ff3d5a`
- `src/components/forensics/ForensicHeader.tsx:49`: `#ff3d5a`
- `src/components/forensics/ForensicHeader.tsx:62`: `#4a85fd`
- `src/components/forensics/ForensicIssueCard.tsx:13`: `#ff3d5a`
- `src/components/forensics/ForensicIssueCard.tsx:15`: `#0b1220`
- `src/components/forensics/ForensicIssueCard.tsx:37`: `#ff3d5a`
- `src/components/forensics/ForensicIssueCard.tsx:38`: `#ff9b36`
- `src/components/forensics/ForensicIssueCard.tsx:72`: `#00d4a0`
- `src/components/forensics/ForensicIssueCard.tsx:72`: `#00d4a0`
- `src/components/forensics/ForensicIssueCard.tsx:72`: `#00d4a0`
- `src/components/forensics/ForensicIssueCard.tsx:72`: `#00d4a0`
- `src/components/forensics/ForensicSidebar.tsx:35`: `#0b1220`
- `src/components/forensics/ForensicSidebar.tsx:52`: `#00d4a0`
- `src/components/forensics/ForensicSidebar.tsx:71`: `#0b1220`
- `src/components/forensics/ForensicView.tsx:503`: `#091815`
- `src/components/forensics/ForensicView.tsx:503`: `#00d4a0`
- `src/components/forensics/ScannerOutput.tsx:16`: `#070a13`
- `src/components/ingestion/HybridPortfolioOrchestration.tsx:488`: `#818cf8`
- `src/components/ingestion/HybridPortfolioOrchestration.tsx:551`: `#d1d5db`
- `src/components/ingestion/HybridPortfolioOrchestration.tsx:593`: `#d1d5db`
- `src/components/ingestion/IngestionHub.tsx:841`: `#0d1527`
- `src/components/ingestion/IngestionHub.tsx:916`: `#0f172a`
- `src/components/ingestion/LaunchStep.tsx:21`: `#9ca3af`
- `src/components/ingestion/LaunchStep.tsx:32`: `#4a85fd`
- `src/components/ingestion/LaunchStep.tsx:32`: `#3474f3`
- `src/components/ingestion/TechnicalBomWorkspace.tsx:87`: `#0b1220`
- `src/components/layout/Sidebar.tsx:62`: `#38bdf8`
- `src/components/layout/Sidebar.tsx:68`: `#a855f7`
- `src/components/layout/Sidebar.tsx:74`: `#10b981`
- `src/components/layout/Sidebar.tsx:82`: `#ff9b36`
- `src/components/layout/Sidebar.tsx:95`: `#00d4a0`
- `src/components/layout/Sidebar.tsx:103`: `#ff3d5a`
- `src/components/layout/Sidebar.tsx:121`: `#070a13`
- `src/components/layout/Sidebar.tsx:179`: `#fff`
- `src/components/layout/Sidebar.tsx:179`: `#8ba4cc`
- `src/components/layout/Sidebar.tsx:191`: `#4a85fd`
- `src/components/layout/Sidebar.tsx:194`: `#5d7899`
- `src/components/layout/Sidebar.tsx:216`: `#0d1528`
- `src/components/layout/TopBar.tsx:72`: `#090d19`
- `src/components/live-mission/CampaignConsolidationHub.tsx:280`: `#00d4a0`
- `src/components/live-mission/CampaignConsolidationHub.tsx:280`: `#00d4a0`
- `src/components/live-mission/CampaignConsolidationHub.tsx:305`: `#070b13`
- `src/components/live-mission/CampaignConsolidationHub.tsx:334`: `#00d4a0`
- `src/components/live-mission/CampaignConsolidationHub.tsx:334`: `#070b13`
- `src/components/live-mission/CampaignConsolidationHub.tsx:364`: `#070b13`
- `src/components/live-mission/CampaignConsolidationHub.tsx:518`: `#0b1220`
- `src/components/live-mission/CampaignConsolidationHub.tsx:594`: `#070b13`
- `src/components/live-mission/LiveMission.tsx:424`: `#4a85fd`
- `src/components/live-mission/LiveMission.tsx:424`: `#4a85fd`
- `src/components/live-mission/LiveMission.tsx:540`: `#091815`
- `src/components/live-mission/LiveMission.tsx:542`: `#1c1409`
- `src/components/live-mission/LiveMission.tsx:543`: `#1c090d`
- `src/components/live-mission/LiveMission.tsx:546`: `#00d4a0`
- `src/components/live-mission/LiveMission.tsx:548`: `#ff9b36`
- `src/components/live-mission/LiveMission.tsx:549`: `#ff3d5a`
- `src/components/live-mission/LiveMission.tsx:552`: `#00d4a0`
- `src/components/live-mission/LiveMission.tsx:554`: `#ff9b36`
- `src/components/live-mission/LiveMission.tsx:555`: `#ff3d5a`
- `src/components/live-mission/LiveMissionSidebar.tsx:36`: `#0e1629`
- `src/components/live-mission/LiveMissionSidebar.tsx:36`: `#090e1b`
- `src/components/live-mission/LiveMissionSidebar.tsx:42`: `#121c33`
- `src/components/live-mission/LiveMissionSidebar.tsx:84`: `#141f38`
- `src/components/live-mission/LiveMissionSidebar.tsx:94`: `#18233a`
- `src/components/live-mission/LiveMissionSidebar.tsx:97`: `#18233a`
- `src/components/live-mission/LiveMissionSidebar.tsx:100`: `#18233a`
- `src/components/live-mission/LiveMissionSidebar.tsx:112`: `#091b15`
- `src/components/live-mission/LiveMissionSidebar.tsx:115`: `#091b15`
- `src/components/live-mission/LiveMissionSidebar.tsx:118`: `#091b15`
- `src/components/live-mission/LiveMissionSidebar.tsx:208`: `#10192e`
- `src/components/live-mission/LiveMissionSidebar.tsx:208`: `#142340`
- `src/components/live-mission/LiveMissionSidebar.tsx:220`: `#1a233d`
- `src/components/live-mission/LiveMissionSidebar.tsx:258`: `#070a13`
- `src/components/live-mission/LiveMissionSidebar.tsx:305`: `#00d4a0`
- `src/components/live-mission/LiveMissionSidebar.tsx:306`: `#4a85fd`
- `src/components/live-mission/LiveMissionSidebar.tsx:306`: `#a855f7`
- `src/components/live-mission/LiveMissionSidebar.tsx:342`: `#00d4a0`
- `src/components/live-mission/SolutionBanner.tsx:31`: `#5d7899`
- `src/components/live-mission/SolutionBanner.tsx:35`: `#5d7899`
- `src/components/live-mission/SolutionBanner.tsx:38`: `#4a85fd`
- `src/components/live-mission/SolutionBanner.tsx:42`: `#4a85fd`
- `src/components/live-mission/SolutionBanner.tsx:45`: `#00d4a0`
- `src/components/live-mission/SolutionBanner.tsx:49`: `#00d4a0`
- `src/components/live-mission/SolutionBanner.tsx:58`: `#4a85fd`
- `src/components/live-mission/SolutionConfigCard.tsx:6`: `#4a85fd`
- `src/components/live-mission/SolutionConfigCard.tsx:7`: `#a855f7`
- `src/components/live-mission/SolutionConfigCard.tsx:8`: `#00d4a0`
- `src/components/live-mission/SolutionConfigCard.tsx:9`: `#ff9b36`
- `src/components/live-mission/SolutionConfigCard.tsx:10`: `#1ba0e2`
- `src/components/live-mission/SolutionConfigCard.tsx:68`: `#00d4a0`
- `src/components/live-mission/SolutionConfigCard.tsx:83`: `#fff`
- `src/components/live-mission/SourcingReconciliationDiff.tsx:127`: `#00d4a0`
- `src/components/live-mission/SourcingReconciliationDiff.tsx:127`: `#00d4a0`
- `src/components/live-mission/SourcingReconciliationDiff.tsx:131`: `#4a85fd`
- `src/components/live-mission/SourcingReconciliationDiff.tsx:131`: `#4a85fd`
- `src/components/live-mission/UCIDEventLedger.tsx:28`: `#00d4a0`
- `src/components/live-mission/UCIDEventLedger.tsx:30`: `#ff9b36`
- `src/components/live-mission/UCIDEventLedger.tsx:32`: `#ff3d5a`
- `src/components/live-mission/UCIDStepper.tsx:143`: `#4a85fd`
- `src/components/live-mission/UCIDStepper.tsx:143`: `#00d4a0`
- `src/components/live-mission/UCIDStepper.tsx:152`: `#4a85fd`
- `src/components/live-mission/UCIDStepper.tsx:152`: `#5d7899`
- `src/components/live-mission/UCIDStepper.tsx:159`: `#4a85fd`
- `src/components/live-mission/UCIDStepper.tsx:159`: `#00d4a0`
- `src/components/live-mission/UCIDStepper.tsx:159`: `#5d7899`
- `src/components/live-mission/steps/StepBoqIntake.tsx:415`: `#0d1527`
- `src/components/live-mission/steps/StepComparison.tsx:142`: `#00d4a0`
- `src/components/live-mission/steps/StepComparison.tsx:142`: `#00d4a0`
- `src/components/live-mission/steps/StepComparison.tsx:151`: `#00d4a0`
- `src/components/live-mission/steps/StepComparison.tsx:151`: `#00d4a0`
- `src/components/live-mission/steps/StepPreIntelligence.tsx:41`: `#00d4a0`
- `src/components/live-mission/steps/StepPreIntelligence.tsx:41`: `#00d4a0`
- `src/components/live-mission/steps/StepSnapshot.tsx:20`: `#00d4a0`
- `src/components/live-mission/steps/StepSnapshot.tsx:20`: `#00d4a0`
- `src/components/live-mission/steps/StepSnapshot.tsx:22`: `#00d4a0`
- `src/components/live-mission/steps/StepSnapshot.tsx:35`: `#00d4a0`
- `src/components/reconciliation/ReconciliationDrillDown.tsx:192`: `#8ea8d4`
- `src/components/reconciliation/ReconciliationDrillDown.tsx:304`: `#ff9b36`
- `src/components/reconciliation/ReconciliationOverview.tsx:103`: `#0a101f`
- `src/components/reconciliation/ReconciliationOverview.tsx:114`: `#ff3d5a`
- `src/components/reconciliation/ReconciliationOverview.tsx:114`: `#ff3d5a`
- `src/components/reconciliation/ReconciliationOverview.tsx:128`: `#8ea8d4`
- `src/components/reconciliation/ReconciliationOverview.tsx:137`: `#8ea8d4`
- `src/components/reconciliation/ReconciliationOverview.tsx:274`: `#141d30`
- `src/components/reconciliation/ReconciliationOverview.tsx:333`: `#ff9b36`
- `src/components/reconciliation/ReconciliationOverview.tsx:333`: `#ff9b36`
- `src/components/reconciliation/ReconciliationView.tsx:29`: `#090d16`
- `src/components/reconciliation/ReconciliationView.tsx:32`: `#ff3d5a`
- `src/components/reconciliation/ReconciliationView.tsx:33`: `#ff9b36`
- `src/components/reconciliation/ReconciliationView.tsx:34`: `#00d4a0`
- `src/components/reports/ReportsView.tsx:291`: `#0b1220`
- `src/components/reports/ReportsView.tsx:309`: `#0b1220`
- `src/components/reports/ReportsView.tsx:327`: `#0b1220`
- `src/components/reports/ReportsView.tsx:347`: `#ff9b36`
- `src/components/reports/ReportsView.tsx:347`: `#ff9b36`
- `src/components/reports/ReportsView.tsx:349`: `#ff9b36`
- `src/components/reports/ReportsView.tsx:349`: `#ff9b36`
- `src/components/reports/ReportsView.tsx:365`: `#ff9b36`
- `src/components/reports/ReportsView.tsx:365`: `#ff8a1c`
- `src/components/reports/ReportsView.tsx:365`: `#ff9b36`
- `src/components/reports/ReportsView.tsx:377`: `#0b1220`
- `src/components/reports/ReportsView.tsx:419`: `#00d4a0`
- `src/components/reports/ReportsView.tsx:445`: `#0b1220`
- `src/components/search/SearchView.tsx:121`: `#0b1220`
- `src/components/search/SearchView.tsx:164`: `#0b1220`
- `src/components/search/SearchView.tsx:209`: `#0b1220`
- `src/components/shared/SKUCard.tsx:23`: `#0f172a`
- `src/components/shared/SKUCard.tsx:23`: `#141e33`
- `src/components/shared/StatusBadge.tsx:15`: `#00d4a0`
- `src/components/shared/StatusBadge.tsx:15`: `#00d4a0`
- `src/components/shared/StatusBadge.tsx:16`: `#f59e0b`
- `src/components/shared/StatusBadge.tsx:16`: `#f59e0b`
- `src/components/shared/StatusBadge.tsx:17`: `#ff3d5a`
- `src/components/shared/StatusBadge.tsx:17`: `#ff3d5a`
- `src/components/shared/StatusBadge.tsx:18`: `#4a85fd`
- `src/components/shared/StatusBadge.tsx:18`: `#4a85fd`
- `src/components/shared/StatusBadge.tsx:18`: `#4a85fd`
- `src/components/shared/ToastContext.tsx:79`: `#061513`
- `src/components/shared/ToastContext.tsx:81`: `#18110b`
- `src/components/shared/ToastContext.tsx:82`: `#1a0c0e`
- `src/components/solution-builder/ConfigLibraryItem.tsx:37`: `#00d4a0`
- `src/components/solution-builder/ConfigLibraryItem.tsx:39`: `#4a85fd`
- `src/components/solution-builder/ConfigLibraryItem.tsx:40`: `#a855f7`
- `src/components/solution-builder/SolutionBuilder.tsx:237`: `#0f172a`
- `src/components/solution-builder/SolutionBuilder.tsx:246`: `#0f172a`
- `src/components/solution-builder/StepIntake.tsx:175`: `#0f172a`
- `src/components/solution-builder/StepIntake.tsx:203`: `#0f172a`
- `src/components/solution-builder/StepIntake.tsx:203`: `#131d35`
- `src/components/taxonomy/TaxonomyGraphEditor.tsx:337`: `#3b82f6`
- `src/components/taxonomy/TaxonomyGraphEditor.tsx:339`: `#93c5fd`
- `src/components/taxonomy/TaxonomyGraphEditor.tsx:341`: `#a855f7`
- `src/components/taxonomy/TaxonomyGraphEditor.tsx:343`: `#d8b4fe`
- `src/components/taxonomy/TaxonomyGraphEditor.tsx:345`: `#10b981`
- `src/components/taxonomy/TaxonomyGraphEditor.tsx:347`: `#6ee7b7`
- `src/components/taxonomy/TaxonomyGraphEditor.tsx:349`: `#f59e0b`
- `src/components/taxonomy/TaxonomyGraphEditor.tsx:351`: `#fde68a`
- `src/components/taxonomy/TaxonomyGraphEditor.tsx:353`: `#ef4444`
- `src/components/taxonomy/TaxonomyGraphEditor.tsx:355`: `#fca5a5`
- `src/components/taxonomy/TaxonomyGraphEditor.tsx:361`: `#f59e0b`
- `src/components/taxonomy/TaxonomyGraphEditor.tsx:371`: `#070a13`
- `src/components/taxonomy/TaxonomyTree.tsx:58`: `#10192e`
- `src/components/vendor-portal/VendorGateways.tsx:22`: `#0b1220`
- `src/components/vendor-portal/VendorGateways.tsx:106`: `#00d4a0`
- `src/components/vendor-portal/VendorGateways.tsx:106`: `#00d4a0`
- `src/components/vendor-portal/VendorGateways.tsx:106`: `#00d4a0`
- `src/components/vendor-portal/VendorPortal.tsx:95`: `#091815`
- `src/components/vendor-portal/VendorPortal.tsx:97`: `#1c090d`
- `src/components/vendor-portal/VendorPortal.tsx:98`: `#1c1409`
- `src/components/vendor-portal/VendorPortal.tsx:101`: `#00d4a0`
- `src/components/vendor-portal/VendorPortal.tsx:103`: `#ff3d5a`
- `src/components/vendor-portal/VendorPortal.tsx:104`: `#ff9b36`
- `src/lib/constants.ts:2`: `#ff3d5a`
- `src/lib/constants.ts:3`: `#ff9b36`
- `src/lib/constants.ts:4`: `#4a85fd`
- `src/lib/constants.ts:5`: `#5d7899`
- `src/lib/mockData.ts:69`: `#00d4a0`
- `src/lib/mockData.ts:81`: `#4a85fd`
- `src/lib/mockData.ts:93`: `#a855f7`
- `src/lib/mockData.ts:105`: `#ff9b36`
- `src/styles/tokens.ts:18`: `#dde6ff`
- `src/styles/tokens.ts:19`: `#8ba4cc`
- `src/styles/tokens.ts:20`: `#5d7899`

## 3. View States (Loading, Zero-State, Error Boundary, list useMemo)

| View | Loading State | Zero-State | Error Boundary | useMemo (lists) |
|---|---|---|---|---|
| `src/components/catalog/CatalogManager.tsx` | ❌ No | ✅ Yes | ❌ No | ✅ Yes |
| `src/components/cleansing/CleansingView.tsx` | ❌ No | ✅ Yes | ❌ No | ✅ Yes |
| `src/components/dashboard/Dashboard.tsx` | ❌ No | ✅ Yes | ❌ No | ✅ Yes |
| `src/components/forensics/ForensicView.tsx` | ❌ No | ✅ Yes | ❌ No | ❌ No |
| `src/components/ingestion/IngestionHub.tsx` | ❌ No | ✅ Yes | ❌ No | ❌ No |
| `src/components/live-mission/CampaignConsolidationHub.tsx` | ❌ No | ❌ No | ❌ No | ❌ No |
| `src/components/live-mission/LiveMission.tsx` | ❌ No | ❌ No | ❌ No | ✅ Yes |
| `src/components/reconciliation/ReconciliationView.tsx` | ❌ No | ✅ Yes | ❌ No | ❌ No |
| `src/components/reports/ReportsView.tsx` | ❌ No | ✅ Yes | ❌ No | ❌ No |
| `src/components/search/SearchView.tsx` | ❌ No | ✅ Yes | ❌ No | ❌ No |
| `src/components/vendor-portal/VendorPortal.tsx` | ❌ No | ❌ No | ❌ No | ❌ No |

## 4. Interfaces and Types

- `CatalogAddFormProps`: `src/components/catalog/CatalogAddForm.tsx`
- `CatalogCardsListProps`: `src/components/catalog/CatalogCardsList.tsx`
- `CatalogFilterBarProps`: `src/components/catalog/CatalogFilterBar.tsx`
- `CatalogHeaderProps`: `src/components/catalog/CatalogHeader.tsx`
- `CatalogManagerProps`: `src/components/catalog/CatalogManager.tsx`
- `counts`: `src/components/catalog/CatalogManager.tsx`
- `CatalogPaginationProps`: `src/components/catalog/CatalogPagination.tsx`
- `DirtyLine`: `src/components/cleansing/CleansingView.tsx`
- `ActiveIssuesListProps`: `src/components/dashboard/ActiveIssuesList.tsx`
- `CatalogTrendAnalyzerProps`: `src/components/dashboard/CatalogTrendAnalyzer.tsx`
- `DashboardProps`: `src/components/dashboard/Dashboard.tsx`
- `KpiCardProps`: `src/components/dashboard/KpiCard.tsx`
- `VendorHealthListProps`: `src/components/dashboard/VendorHealthList.tsx`
- `VendorStatusBoardProps`: `src/components/dashboard/VendorStatusBoard.tsx`
- `ForensicHeaderProps`: `src/components/forensics/ForensicHeader.tsx`
- `ForensicIssueCardProps`: `src/components/forensics/ForensicIssueCard.tsx`
- `ForensicSidebarProps`: `src/components/forensics/ForensicSidebar.tsx`
- `ForensicViewProps`: `src/components/forensics/ForensicView.tsx`
- `ScannerOutputProps`: `src/components/forensics/ScannerOutput.tsx`
- `BoqIngestWorkbookProps`: `src/components/ingestion/BoqIngestWorkbook.tsx`
- `HybridPortfolioOrchestrationProps`: `src/components/ingestion/HybridPortfolioOrchestration.tsx`
- `IngestionHubProps`: `src/components/ingestion/IngestionHub.tsx`
- `LaunchStepProps`: `src/components/ingestion/LaunchStep.tsx`
- `TechnicalBomWorkspaceProps`: `src/components/ingestion/TechnicalBomWorkspace.tsx`
- `BreadcrumbNavProps`: `src/components/layout/BreadcrumbNav.tsx`
- `SidebarProps`: `src/components/layout/Sidebar.tsx`
- `TopBarProps`: `src/components/layout/TopBar.tsx`
- `CampaignConsolidationHubProps`: `src/components/live-mission/CampaignConsolidationHub.tsx`
- `LiveMissionProps`: `src/components/live-mission/LiveMission.tsx`
- `LiveMissionSidebarProps`: `src/components/live-mission/LiveMissionSidebar.tsx`
- `with`: `src/components/live-mission/LiveMissionSidebar.tsx`
- `NewUCIDModalProps`: `src/components/live-mission/NewUCIDModal.tsx`
- `SolutionBannerProps`: `src/components/live-mission/SolutionBanner.tsx`
- `SolutionConfigCardProps`: `src/components/live-mission/SolutionConfigCard.tsx`
- `SourcingReconciliationDiffProps`: `src/components/live-mission/SourcingReconciliationDiff.tsx`
- `for`: `src/components/live-mission/SourcingReconciliationDiff.tsx`
- `StepContentPanelProps`: `src/components/live-mission/StepContentPanel.tsx`
- `UCIDEventLedgerProps`: `src/components/live-mission/UCIDEventLedger.tsx`
- `UCIDStepperProps`: `src/components/live-mission/UCIDStepper.tsx`
- `StepBoqIntakeProps`: `src/components/live-mission/steps/StepBoqIntake.tsx`
- `StepComparisonProps`: `src/components/live-mission/steps/StepComparison.tsx`
- `StepPostIntelligenceProps`: `src/components/live-mission/steps/StepPostIntelligence.tsx`
- `StepPreIntelligenceProps`: `src/components/live-mission/steps/StepPreIntelligence.tsx`
- `StepSnapshotProps`: `src/components/live-mission/steps/StepSnapshot.tsx`
- `StepSolutionDesignProps`: `src/components/live-mission/steps/StepSolutionDesign.tsx`
- `StepVendorProvisioningProps`: `src/components/live-mission/steps/StepVendorProvisioning.tsx`
- `TableRow`: `src/components/reconciliation/ReconciliationDrillDown.tsx`
- `TableGroup`: `src/components/reconciliation/ReconciliationDrillDown.tsx`
- `ReconciliationDrillDownProps`: `src/components/reconciliation/ReconciliationDrillDown.tsx`
- `ReconciliationOverviewProps`: `src/components/reconciliation/ReconciliationOverview.tsx`
- `ReconciliationViewProps`: `src/components/reconciliation/ReconciliationView.tsx`
- `ReportsViewProps`: `src/components/reports/ReportsView.tsx`
- `SearchViewProps`: `src/components/search/SearchView.tsx`
- `ButtonProps`: `src/components/shared/Button.tsx`
- `DataPersistenceGateProps`: `src/components/shared/DataPersistenceGate.tsx`
- `Props`: `src/components/shared/ErrorBoundary.tsx`
- `State`: `src/components/shared/ErrorBoundary.tsx`
- `SKUCardProps`: `src/components/shared/SKUCard.tsx`
- `SelectProps`: `src/components/shared/Select.tsx`
- `BadgeVariant`: `src/components/shared/StatusBadge.tsx`
- `BadgeSize`: `src/components/shared/StatusBadge.tsx`
- `StatusBadgeProps`: `src/components/shared/StatusBadge.tsx`
- `Toast`: `src/components/shared/ToastContext.tsx`
- `ToastContextType`: `src/components/shared/ToastContext.tsx`
- `ConfigLibraryItemProps`: `src/components/solution-builder/ConfigLibraryItem.tsx`
- `SolutionBuilderProps`: `src/components/solution-builder/SolutionBuilder.tsx`
- `StepIntakeProps`: `src/components/solution-builder/StepIntake.tsx`
- `StepWorkspaceProps`: `src/components/solution-builder/StepWorkspace.tsx`
- `SchemaNode`: `src/components/taxonomy/TaxonomyGraphEditor.tsx`
- `SchemaEdge`: `src/components/taxonomy/TaxonomyGraphEditor.tsx`
- `TaxonomyTreeProps`: `src/components/taxonomy/TaxonomyTree.tsx`
- `VendorGatewaysProps`: `src/components/vendor-portal/VendorGateways.tsx`
- `VendorIngestionDeskProps`: `src/components/vendor-portal/VendorIngestionDesk.tsx`
- `VendorPortalProps`: `src/components/vendor-portal/VendorPortal.tsx`
- `WorkflowStepStatus`: `src/hooks/useWorkflowManager.ts`
- `WorkflowStep`: `src/hooks/useWorkflowManager.ts`
- `WorkflowManagerState`: `src/hooks/useWorkflowManager.ts`
- `ConfigItem`: `src/types/builder.ts`
- `UcidContainer`: `src/types/builder.ts`
- `BOMItem`: `src/types/data.ts`
- `Config`: `src/types/data.ts`
- `VendorSubmission`: `src/types/data.ts`
- `Solution`: `src/types/data.ts`
- `LogEvent`: `src/types/data.ts`
- `Snapshot`: `src/types/data.ts`
- `UCID`: `src/types/data.ts`
- `Vendor`: `src/types/data.ts`
- `CatalogSKU`: `src/types/data.ts`
- `classification`: `src/types/data.ts`
- `ForensicIssue`: `src/types/data.ts`
- `PlaywrightAgentConfig`: `src/types/data.ts`
- `PlaywrightAgentStatus`: `src/types/data.ts`
- `PlaywrightExecutionLog`: `src/types/data.ts`
- `PlaywrightAgentTask`: `src/types/data.ts`
- `PhysicalConstraint`: `src/types/data.ts`
- `CompatibilityRule`: `src/types/data.ts`
- `TaxonomyNode`: `src/types/data.ts`
- `TaxonomyEdge`: `src/types/data.ts`
- `LineReconciliationDiff`: `src/types/data.ts`
- `ReconciliationSession`: `src/types/data.ts`
- `OutboundWebhookConfig`: `src/types/data.ts`
- `WebhookDeliveryLog`: `src/types/data.ts`
- `SearchQueryDescriptor`: `src/types/data.ts`
- `PaginatedResponse`: `src/types/data.ts`
- `PortfolioUcidRef`: `src/types/data.ts`
- `PortfolioOrchestrateRequest`: `src/types/data.ts`
- `PortfolioOrchestrateResponse`: `src/types/data.ts`
- `PortfolioManualUploadRequest`: `src/types/data.ts`
- `PortfolioManualUploadResponse`: `src/types/data.ts`
- `IngestBOMRequest`: `src/types/data.ts`
- `IngestBOMResponse`: `src/types/data.ts`
- `GetUCIDDetailRequest`: `src/types/data.ts`
- `GetUCIDDetailResponse`: `src/types/data.ts`
- `CreateSnapshotRequest`: `src/types/data.ts`
- `CreateSnapshotResponse`: `src/types/data.ts`
- `UpdateUCIDStepRequest`: `src/types/data.ts`
- `UpdateUCIDStepResponse`: `src/types/data.ts`
- `AppView`: `src/types.ts`
- `UCIDStep`: `src/types.ts`

## 5. Gaps Found

- 🔴 **Hardcoded Hex Values**: Hardcoded hex colors found bypassing the design token system (`tokens.ts` or tailwind classes).
- 🔴 **Missing View States**: 
  - 11 views lack a loading state indication.
  - 3 views lack an empty/zero-state fallback array visualization.
  - 11 views are missing Error Boundary wrappers.
- 🔴 **Missing List Memoization**: 7 views rendering lists lack `useMemo` wrapping (per guidelines: "List Recalculation Performance"), leading to potential performance issues.
