# Platform Technical Specification & AI Review Manual
## Multi-Supplier Vendor Solution Intelligence & Procurement Integrity Platform

This document serves as a comprehensive, end-to-end technical reference and review manual for AI tools, developers, and architect reviews. It defines the exact UI structures, state variables, component APIs, and expected backend database models so the system can be developed and maintained with zero ambiguity.

---

## 1. System Topology & Navigation Matrix

The platform is compiled as a Single-Page Application (SPA) utilizing a high-performance **Cosmic Slate Dark Theme**. The main viewport routes between twelve distinctive views controlled by `react-router-dom` defined in `src/App.tsx`.

```
 +----------------------------------------------------------------------------------------------------+
 |                                      GLOBAL NAVIGATION HEADER                                      |
 +----------------------------------------------------------------------------------------------------+
 |                                      APP INTERACTIVE VIEWPORT                                      |
 |                                                                                                    |
 |  [Sidebar Navigation]              [Active Workspace Content Area]                                 |
 |  - Dashboard / Overview             - Solutions Workspace / Canvas                                 |
 |  - Ingestion Hub (BOM / BOQ)        - Mission Control Cockpits / Step Stages                       |
 |  - Vendor Portal & Scrapers         - Diagnostics Sandbox (Anomaly Repricers)                      |
 |  - Cleansing Workshop               - Taxonomy Rules Graph / SVG Constraints Checker               |
 |  - Catalog Library Manager          - System Logs, Cryptographic Webhook Telemetry                 |
 |  - Report Engine & Analytics        - Documentation / Integration Hub                              |
 |                                                                                                    |
 +----------------------------------------------------------------------------------------------------+
 |  [Floating Widget Overlay] State Consistency Monitor (Diagnostic Cache & Memory Inspector)          |
 +----------------------------------------------------------------------------------------------------+
```

### Clean Code Boundary Rule
To preserve pristine UI/UX code hygiene:
- Core UI structures and visual styling logic occupy the `/src/components/*` space.
- Highly structural, sub-section logic is cleanly decomposed into self-contained files:
  - **`TaxonomyTree.tsx`**: Isolated hierarchical catalog browser mapping category nodes.
  - **`LaunchStep.tsx`**: Step component hosting deployment success and builder launches.
  - **`PlaywrightConsole.tsx`**: Modularized visual crawling terminal for manufacturer scrapers.
- All technical definitions, data structures, and contract definitions reside in `/src/types.ts`, `/src/types/data.ts`, and the `/specification/*` directory.
- This decoupling allows AI tools to review business contracts without touching the visual presentation components unnecessarily.
- Memoization of data vectors (e.g. `typeCounts` mapping SKU counts to pills) is strictly required to dodge hydrate-locking performance penalties.

---

## 2. Deep Dive: View-by-View Capabilities & Atomic UI Actions

Below is an exhaustive breakdown of the functional scope, user interactions, and exact file definitions supporting each of the active workspace modules.

### 2.1 Overview & Executive Dashboard (`/src/components/dashboard/Dashboard.tsx`)
- **Visuals**: Premium bento-grid layout showcasing metrics: Active UCIDs, Portfolio Value ($M), Cleansing Completion (%), and Active Scrapers.
- **Atomic Actions**:
  - *Click 'Select Active UCID'*: Triggers navigation directly to the selected Mission Control line.
  - *Click 'Inspect Forensic Flag'*: Opens the Forensic View filtered by that specific anomalous SKU.

### 2.2 Quote Compile & Mapping (`/src/components/solution-builder/SolutionBuilder.tsx`)
- **Visuals**: Parallel multi-column arrangement panels where uploaded BOQ spreadsheets are grouped into logical deployment blocks.
- **Atomic Actions**:
  - *Add Custom Solution Block*: Allows on-the-fly logical aggregation of parts.
  - *Validate Synergy Weights*: Compares combined item power/rack footprints against predefined limits before saving.

### 2.3 BOM / BOQ Ingest Zone (`/src/components/ingestion/IngestionHub.tsx`)
- **Visuals**: A drop-zone framework mimicking secure portal file uploads (drag-and-drop or manual trigger). Displays live parsing metrics (items extracted, sheet index, metadata hashes).
- **Atomic Actions**:
  - *Upload Spreadsheet File*: Parses structural inputs and converts columns like `Part No`, `Description`, `Qty`, `Price` into memory arrays.
  - *Configure Preset Mapping Type*: Direct dropdown selector (`hpe-legacy`, `dell-overcharge`, `cisco-asymmetry`) ensuring target parser knows how to handle layout variances.

### 2.4 Parallel UCID Cockpit (`/src/components/mission-control/MissionControl.tsx`)
- **Visuals**: Step-by-step parallel tracking wizard mapping out the seven progressive stages of configuration compile.
- **Stage Progression Flow**:
  1. `BOQ Ingestion`: Confirms parsing status and counts.
  2. `Pre-Intelligence / Heuristics`: Applies initial regex matching logic to tag vendors.
  3. `Solution Design`: Generates competitor alternatives matching catalog items.
  4. `Vendor Provisioning`: Tracks API price dispatcher states.
  5. `Post-Intelligence / Forensic Rules`: Validates margins and verifies compliance constraints.
  6. `Comparison Matrix`: Provides interactive multi-vendor side-by-side matrices.
  7. `Snapshot Lock`: Seals the configuration sequence as immutable.

### 2.5 Sourcing Integrity Sandbox (`/src/components/forensics/ForensicView.tsx`)
- **Visuals**: Alert feeds displaying pricing anomalies, overcharges, and component lifecycle EOL warnings.
- **Diagnostic Repair Controls**:
  - *Recalculate OEM Standard Reference Margin*: Overrides Distributor-provided markups with vendor-direct contracts, re-pricing item arrays on the fly.
  - *Replace Obsolete SKU*: Swaps flagged EOL chassis or processors with matching backward-compatible modern items suggested by the system.

### 2.6 Splicing Workshop & Cleansing Center (`/src/components/cleansing/CleansingView.tsx`)
- **Visuals**: Standard quarantine list flagging ambiguous suffix codes, conflicting vendor identities, and fuzzy SKU descriptions.
- **Atomic Actions**:
  - *Select Quarantined Record*: Focuses on specific items to view BERT and Jaro-Winkler phonetics suggestion scores.
  - *Click 'Map to Catalog'*: Swaps the raw ambiguous string with standard system UCID values, instantly clearing the queue.

### 2.7 Taxonomy Rules Graph (`/src/components/taxonomy/TaxonomyGraphView.tsx`)
- **Visuals**: Interactive tree/flow SVG layout showing `Vendor` -> `Solution` -> `Product` -> `Chassis` -> `SKU` path relationships. Direct rule validator card panel for assessing physical constraints.
- **Atomic Actions**:
  - *Toggle Connect Mode*: Allows adding virtual lines linking parent categories to children.
  - *Inspect Chassis Rules*: Triggers automated memory controller/power checks showing real-time socket compatibility (LGA4677 warnings).

### 2.8 Central Item Library (`/src/components/catalog/CatalogManager.tsx`)
- **Visuals**: Tabular inventory editor of canonical Stock Keeping Units with live filters for CPU, Memory, Chassis, Network cards, and Licenses.
- **Atomic Actions**:
  - *Create Canonical Part*: Inputs verified parts to enrich mapping matching capabilities.

### 2.9 Headless Scraper Execution Cockpit (`/src/components/vendor-portal/VendorPortal.tsx`)
- **Visuals**: Crawler console showcasing live automation state. Shows visual terminal trace outputs simulating browser commands (e.g. `Navigate`, `Bypass SSO`, `Fetch Unit Cost`).
- **Atomic Actions**:
  - *Spawn Automated Portal Crawler*: Sends instructions triggering behind-the-scenes scraping modules.

### 2.10 System Telemetry Monitor (`/src/components/telemetry/SystemTelemetry.tsx`)
- **Visuals**: Split console demonstrating outbound webhook dispatches and event logs. It includes a reactive payload testing validation panel.
- **Atomic Actions**:
  - *Test Webhook Endpoint*: Validates endpoint schemas down to custom HMAC signature verification.

### 2.11 State Consistency Debugger (`/src/components/shared/DataPersistenceGate.tsx`)
- **Visuals**: Floating inspector that lets developers browse and debug granular UCID storage, catalog variables, and memory-sync offsets in real-time.

### 2.12 Active Solutions Portfolio (`/src/components/solution-builder/SolutionManager.tsx` and `SolutionDetail.tsx`)
- **Visuals**: Portfolio-level list of deployed solutions and their detailed drill-down views showing multi-vendor BOM architecture.
- **Atomic Actions**:
  - *View Solution Detail*: Opens the specific solution to review its aggregated cost, configuration mapping, and vendor submissions.

### 2.13 Premium Showcase & Reporting Hub (`/src/components/search/SearchView.tsx`)
- **Visuals**: Omnibar-powered global queries across vendors, hardware, and configurations with advanced analytical report exporting functionality (utilizing powerful charts).

---

## 3. Under the Hood: Backend API Schemas & Data Contracts

All endpoints that an implementation-level AI or backend developer must build inside `server.ts` are defined below. Contracts are specified in native JSON-schema specifications.

### 3.1 Parser & Ingest Processor (`POST /api/boq/ingest`)
This microservice receives raw file uploads or text buffers, parsing standard table coordinates to return matching UCID blueprints.

#### Input Contract:
```json
{
  "type": "object",
  "properties": {
    "fileName": { "type": "string" },
    "presetType": { "type": "string", "enum": ["hpe-legacy", "dell-overcharge", "cisco-asymmetry"] },
    "rawText": { "type": "string" }
  },
  "required": ["fileName", "presetType"]
}
```

#### Output Contract:
```json
{
  "type": "object",
  "properties": {
    "success": { "type": "boolean" },
    "message": { "type": "string" },
    "ucid": { "type": "string" },
    "parsedSummary": {
      "type": "object",
      "properties": {
        "vendorBrand": { "type": "string" },
        "detectedChassis": { "type": "string" },
        "itemsCount": { "type": "integer" }
      }
    },
    "solutions": { "type": "array" }
  }
}
```

---

### 3.2 Headless Web Scraper Service (`POST /api/agents/run`)
Triggers robot scrapers to log into supplier portals and fetch cost matrices.

#### Input Contract:
```json
{
  "type": "object",
  "properties": {
    "agentName": { "type": "string", "enum": ["AribaScraper", "HPEMarketplace", "DellPremierPortal"] },
    "ucidRef": { "type": "string" },
    "targetPortalUrl": { "type": "string" },
    "bypassCaptchas": { "type": "boolean" }
  },
  "required": ["agentName", "ucidRef", "targetPortalUrl"]
}
```

#### Output Contract:
```json
{
  "type": "object",
  "properties": {
    "taskId": { "type": "string" },
    "status": { "type": "string", "enum": ["running", "success", "failed"] },
    "executionTimeMs": { "type": "integer" },
    "crawledItemsExtracted": { "type": "integer" },
    "logTrail": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "timestamp": { "type": "string" },
          "level": { "type": "string", "enum": ["info", "debug", "warning", "error"] },
          "message": { "type": "string" }
        }
      }
    }
  }
}
```

---

### 3.3 Hardware Cohesion Validator (`POST /api/taxonomy/check-constraints`)
Enforces mathematical bounds over complex hardware chassis builds to prevent invalid or dangerous assemblies.

#### Input Contract:
```json
{
  "type": "object",
  "properties": {
    "chassisSKU": { "type": "string" },
    "cpuSKU": { "type": "string" },
    "ramQuantity": { "type": "integer" },
    "psuWattsCount": { "type": "integer" }
  },
  "required": ["chassisSKU", "cpuSKU", "ramQuantity", "psuWattsCount"]
}
```

#### Output Contract:
```json
{
  "type": "object",
  "properties": {
    "isCompliant": { "type": "boolean" },
    "socketMatch": {
      "type": "object",
      "properties": {
        "status": { "type": "string", "enum": ["compatible", "asymmetric", "blocked"] },
        "chassisSocket": { "type": "string" },
        "cpuSocket": { "type": "string" },
        "description": { "type": "string" }
      }
    },
    "powerLimitTest": {
      "type": "object",
      "properties": {
        "passed": { "type": "boolean" },
        "estimatedTdpWatts": { "type": "integer" },
        "maxSupportedWatts": { "type": "integer" },
        "marginWatts": { "type": "integer" }
      }
    },
    "memoryBalanceCheck": {
      "type": "object",
      "properties": {
        "passed": { "type": "boolean" },
        "quantity": { "type": "integer" },
        "optimalLayoutSymmetry": { "type": "integer" },
        "recommendsCorrection": { "type": "boolean" },
        "message": { "type": "string" }
      }
    }
  }
}
```

---

### 3.4 Outbound Reconciliation comparison Endpoint (`POST /api/reconciliation/compare`)
Identifies optimal configurations by crossing vendor attributes. Detects best potential hybrid scenarios (e.g., combining Chassis from HPE but drives from generic).

#### Input Contract:
```json
{
  "type": "object",
  "properties": {
    "submissions": { "type": "array" }
  },
  "required": ["submissions"]
}
```

#### Output Contract:
```json
{
  "type": "object",
  "properties": {
    "comparisonHash": { "type": "string" },
    "calculatedAt": { "type": "string" },
    "metrics": { "type": "object" },
    "matrix": { "type": "array" }
  }
}
```

---

### 3.5 Cryptographic Dispatch webhook (`POST /api/integrations/dispatch`)
Publishes frozen snapshot JSONs to enterprise ledger software with a SHA256-HMAC signature header.

#### Input Contract:
```json
{
  "type": "object",
  "properties": {
    "endpointUrl": { "type": "string" },
    "secretToken": { "type": "string" },
    "ucidRef": { "type": "string" },
    "payloadData": {
      "type": "object",
      "properties": {
        "snapshotHash": { "type": "string" },
        "committedValue": { "type": "number" },
        "winnerSolution": { "type": "string" },
        "timestamp": { "type": "string" }
      }
    }
  },
  "required": ["endpointUrl", "secretToken", "ucidRef", "payloadData"]
}
```

#### Output Contract:
```json
{
  "type": "object",
  "properties": {
    "dispatchId": { "type": "string" },
    "status": { "type": "string", "enum": ["delivered", "retrying", "endpoint_unreachable"] },
    "cryptographicSignature": { "type": "string" },
    "auditLog": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "attemptNumber": { "type": "integer" },
          "timestamp": { "type": "string" },
          "httpStatusCode": { "type": "integer" },
          "responseBody": { "type": "string" }
        }
      }
    }
  }
}
```

---

## 4. Client State Organization & Persistence Guidelines

The client maintains an in-memory application-wide cache state instantiated inside `/src/App.tsx`. 
The primary keys are:
1. `ucids`: Array of structured configurations containing solution choices, current step sequence, and status flags.
2. `vendors`: Connection states for active manufacturer portals tracking OAuth, sync timelines, and errors.
3. `catalogSkus`: The master inventory matched against ambiguous strings inside the Splicing Cleansing workshop.

### Data Layer Separation & Caching Controls:
- **`localStorage` Key Names**:
  - `procurement_ucids`: Caches current solution steps and status.
  - `procurement_catalog_master`: Remembers custom parts added to the library.
  - `procurement_connections`: Remembers customized API keys and login tokens.
- **The Persistence Gate Principle (`/src/components/DataPersistenceGate.tsx`)**:
  - Prior to rendering, the gate checks if a cache matches the required schema. If any memory drift is detected (e.g. from state upgrades), the gate automatically repairs the cache block or resets state gracefully, preventing white-screen runtime exceptions.

---

## 5. Development playbook & Verification Checks

### 5.1 Verification Commands
Before launching, committing, or deploying any updates, always execute this sequence of robust local checks:

```bash
# 1. Check TypeScript syntax constraints and type safety
npx tsc --noEmit

# 2. Assert code lint rules are satisfied
npm run lint

# 3. Assert build pipeline is fully stable 
npm run build
```

### 5.2 Common Solutions for Complex Code Changes
- **Unexpected Token/Brace Unclashed Syntax Errors**:
  - High probability of nesting mismatch inside JSX tags. Run `npx tsc --noEmit` and trace the precise line offset.
- **Vite WebSockets/HMR connection warnings**:
  - Fully expected and safe to bypass inside our sandboxed, developer containers. The proxy manages hot reload blocks.
- **Missing Dependencies**:
  - Execute `install_applet_dependencies` to ensure the clean installation of utility components like `lucide-react`, `recharts`, or `d3`.

### 5.3 Front-end Hydration standards & Sourcing Performance Targets
*   **Prevent Frame-Freezes**: Always virtualize tables over 100 entries to maintain 60FPS scrolling during procurement list audits.
*   **Debounced Queries**: Input field handlers querying SKUs or categories must employ a minimum of 150ms debouncing logic.
*   **Unblocking Load Cycle**: Perform heavy Excel sheet serial validations inside independent batch routines or background microtasks.
*   **Decoupled Metrics**: System telemetry logs and CPU loops must not trigger re-renders on the primary customer dashboards. Keep logging decoupled from core state metrics.

---
*Created by AI specialist for seamless machine-to-machine context transfer. Read and follow these specifications strictly.*
