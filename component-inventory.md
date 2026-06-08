# VSIP Component Inventory & Freeze List

## Main App Entry & Providers
- [ ] `/src/main.tsx` (App Root)
- [ ] `/src/App.tsx` (Main Layout & Router Wrapper)
- [ ] `/src/components/ToastContext.tsx` (Global Notifications)
- [ ] `/src/components/ErrorBoundary.tsx` (Error Catching)

## Layout & Navigation Components
- [ ] `/src/components/layout/Sidebar.tsx` (Sidebar Navigation)
- [ ] `/src/components/layout/TopBar.tsx` (Top Header Navigation)
- [ ] `/src/components/layout/BreadcrumbNav.tsx` (Breadcrumb trails)

## Core Monolithic Views
The following views represent major modules and have specific loading, zero-state, and error boundary requirements.
- [ ] `/src/components/live-mission/LiveMission.tsx` (Mission Control / Overview)
- [ ] `/src/components/ingestion/IngestionHub.tsx` (Data Upload and Orchestration)
- [ ] `/src/components/solution-builder/SolutionBuilder.tsx` (Solution Design Workspace)
- [ ] `/src/components/forensics/ForensicView.tsx` (Audit & Inspection)
- [ ] `/src/components/reconciliation/ReconciliationView.tsx` (Reconciliation and Diffing)
- [ ] `/src/components/dashboard/Dashboard.tsx` (Analytics Dashboard)
- [ ] `/src/components/catalog/CatalogManager.tsx` (Catalog SKU Library)

## Shared Primitives (To Be Extracted)
Components currently inlined in monolithic views that should be standardized primitives:
- [ ] `Table` Primitives (Standardized list rendering)
- [ ] `StatusBadge` (Standardized enum status indicator)
- [ ] `SKUCard` (Standardized layout for SKU display)

## Note to AI Agents
**Do not modify** any views marked with a [x] (frozen) unless explicitly instructed or if rectifying a documented bug. 
Any modifications to standard layout elements must be validated against the `state-contracts.md` and `tokens.ts`.
