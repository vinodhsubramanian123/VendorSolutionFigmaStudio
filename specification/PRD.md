# Product Requirement Document (PRD)
## Multi-Supplier Vendor Solution Intelligence & Procurement Integrity Platform

**Status**: Active Production Reference  
**Authors**: AI Specialist & Design Architect  
**Created**: June 2026  

---

### 1. Executive Summary & Vision

The **Vendor Solution Intelligence & Procurement Integrity Platform** is a master-audit, splicing, and configuration compiler built to orchestrate, cleanse, and parallel-evaluate multi-tab Excel/CSV Bills of Quantities (BOQs) received from direct manufacturers and suppliers. 

By eliminating low-fidelity browser alerts in favor of an eye-safe, high-contrast, beautiful dark-themed environment, the user interface enforces cryptographic exactness over procurement workflows. The system integrates intelligent vendor matching, robotic cloud automation scrapers, and unified taxonomy verification across twelve interconnected operational modules.

---

### 2. UI / UX Design & Aesthetic Philosophy

#### 2.1 Color Palette & Theme Specification
The platform utilizes a customized, highly responsive dark theme called **Cosmic Slate**, designed to mitigate eye strain for procurement officers reviewing long-form serial codes.
*   **Primary Inlay**: Deep space off-black (`#03050a` with sub-cards at `#070a13` or `#0e1322`).
*   **Accents**: 
    *   *Sourcing Intel / Sparkles*: Indigo and purple dynamic light waves (`#6366f1` to `#a855f7`).
    *   *Compliance Success / Correct Sync*: Emerald green highlight (`#00d4a0`).
    *   *Sourcing Warnings / Blockers*: Safety Amber/Orange (`#ff9b36`).
    *   *Forensic Corruption / Errors*: High-luminance red (`#ff3d5a`).
*   **Text Hierarchy**: Soft off-white for crisp readability, paired with medium-gray metadata.

#### 2.2 Font Selection & Typography Pairing
*   **Display Headings**: Special tech-forward headings styled using **Space Grotesk** or premium sans-serif tracking rules (`tracking-tight text-white`). 
*   **General UI / Form Text**: Clean **Inter** font with adaptive spacing.
*   **Serial Keys & Part Numbers**: Raw **JetBrains Mono** monospace style for SKU tracking, hash keys, and terminal-like execution pipelines.

#### 2.3 Elegant Non-Obtrusive Notifications
Standard browser alerts (`window.alert`) are entirely banned. A custom, reactive `Toast` overlay system animates into the bottom-right corner of the container. It color-keys border frames and glyph icons based on notification status.

---

### 3. Core Functional Modules

The platform is structured into twelve unified navigation views, preserving a completely stateful single-page sandbox workspace.

```text
+------------------------------------------------------------------------------------------------------+
|                                          App Nav Rail                                                |
| Overview (Dashboard) | Quote Compile (Solution Builder)  | BOM Ingest (Ingestion Hub)                |
| Live Mission         | Forensic Audit (Forensic View)    | Interactive Cleansing (Cleansing View)    |
| Taxonomy Graph       | Catalog Manager                   | External Suppliers (Vendor Portal)        |
| Premium Showcase     | Reports & Analytics               | System Telemetry (API & Logs monitor)     |
+------------------------------------------------------------------------------------------------------+
| Floating Widget: State Consistency Monitor (Global Cache Inspector)                                  |
+------------------------------------------------------------------------------------------------------+
```

#### 3.1 Overview (Dashboard)
*   **Objective**: Executive macro-level status of portfolio values, active UCID missions, margin capture estimations, and recent forensic alerts.

#### 3.2 Quote Compile & Mapping (Solution Builder)
*   **Objective**: Act as an interactive mapping architecture where parsed source sheets are visually assigned to logical deployment blocks (UCIDs), and finally pushed to Live Mission control. Evaluates multi-UCID and single-UCID portfolio architectures.

#### 3.3 BOM Ingest (Ingestion Hub)
*   **Objective**: Centralized drop-zone portal for raw Excel sheets of multi-tab sourcing documents, transforming them into internal schema arrays using specific backend ingestion microservices.

#### 3.4 Parallel UCID Processing Line (Live Mission)
*   **Objective**: Act as the master cockpit for tracking a particular UCID’s seven stages:
    1.  *BOQ Ingestion*: Parse CSV raw material rows.
    2.  *Pre-Intelligence*: Execute initial heuristics.
    3.  *Solution Design*: Auto-compile alternative bids (e.g., HPE-centered, Dell-centered, hybrid mixtures).
    4.  *Vendor Provisioning*: Dispatch pricing queries to manufacturer APIs.
    5.  *Post-Intelligence (Forensics)*: Highlight margins overages or configuration failures.
    6.  *Comparison Matrix*: Perform head-to-head pricing calculations.
    7.  *Snapshot Lock*: Commit the winning scenario and download xlsx/pdf assets.

#### 3.5 Sourcing Integrity Diagnostic Sandbox (Forensic View)
*   **Objective**: Protect margins by mapping real-time pricing anomalies utilizing automated repair micro-scripts (re-computing base discount thresholds versus identified distributor markups) and hardware lifecycle checks (EOL risks).

#### 3.6 Interactive Splicing & Mapping Workshop (Cleansing View)
*   **Objective**: Resolve bad or corrupted supplier quote entries natively within the interface (handling spelling mistakes, incomplete tags).

#### 3.7 Taxonomic Procurement Knowledge Graph (Taxonomy Graph Editor)
*   **Objective**: Interact with physically-binding server configurations to prevent installing incompatible parts (e.g., non-LGA4677 CPUs inside an LGA1700 chassis) using SVG/node visual validation. Provides a graphical interface and an automated diagnostic side-panel to resolve unmapped/orphaned hierarchical BOQ components utilizing user-guided Drag & Drop or Auto-Fix resolution paths. Also supports drag-and-drop reassignment of existing mapped elements to correct faulty topological branches manually.

#### 3.8 Central SKU Library (Catalog Manager)
*   **Objective**: Manage standard canonical Stock Keeping Units, maintaining a verified internal item database matched dynamically against the cleansing workshop.

#### 3.9 Playwright Web-Automation Scraper Agents (Vendor Portal)
*   **Objective**: Spin up headless cloud browsers acting like human users to fetch real-time vendor supply data directly from non-API legacy supplier sites.

#### 3.10 System Telemetry & Gateways
*   **Objective**: Real-time display of backend logs, webhooks to central CRM/ERP structures, dispatch payload histories, and Playwright log trailing inside the applet environment.

#### 3.11 State Consistency Monitor (Debugger)
*   **Objective**: An overlaid interactive debugger providing structural oversight of the application state (UCID memories), serving as a crucial tool for developers to diagnose tree misalignments and memory drift.

#### 3.12 Premium Showcase & Reporting Hub (Global Search & Analytics)
*   **Objective**: Omnibar-powered global queries across vendors, hardware, and configurations with advanced analytical report exporting functionality (utilizing powerful charts).

---

### 4. Direct Backend API Reference & Data Contracts and Examples

All UI/UX states correspond to explicit TypeScript interfaces declared in `/src/types.ts`, `/src/types/data.ts`, and `/server.ts`. 

#### 4.1 Workbook Ingest and Tab Separation Endpoint (`/api/boq/ingest`)
*   **Payload (Input)**:
    ```json
    {
      "fileName": "HPE_PARTNER_QUOTE.xlsx",
      "presetType": "hpe-legacy"
    }
    ```
*   **Response (Output)**: Returns structured parallel alternative designs (`Solution[]`) assigned to a parent `UCID`.

#### 4.2 Playwright Automation Execution Endpoint (`/api/agents/run`)
*   **Payload (Input)**:
    ```json
    {
      "agentName": "DellPremierPortal",
      "ucidRef": "u1",
      "targetPortalUrl": "https://premier.dell.com",
      "bypassCaptchas": true
    }
    ```
*   **Response (Output)**: Returns trailing browser logs, automation task metrics, and extracted cost item counts (`PlaywrightRunResponse`).

#### 4.3 Outbound Reconciliation comparison Endpoint (`/api/reconciliation/compare`)
*   **Concept**: Identifies optimal configurations by crossing vendor attributes. Detects best potential hybrid scenarios (e.g., combining Chassis from HPE but drives from generic).

#### 4.4 Outbound Synchronization Webhooks (`/api/integrations/dispatch`)
*   **Concept**: Locks snapshots and dispatches encrypted payload ledgers direct to enterprise tools via cryptographic HMAC signatures. Implements exponential back-off retries up to 5 attempts.

#### 4.5 Taxonomic Constraints Database Checker Scheme (`/api/taxonomy/check-constraints`)
*   **Concept**: Evaluates `chassisSKU`, `cpuSKU`, `ramQuantity`, `psuWattsCount` to assert socket harmony, symmetric memory controller pipelines (e.g., RAM mod 8 counts), and strict thermal envelopes (TDP Watts).

---

### 5. Architectural & System Constraints

1.  **Strict Storage Separation**: Complex records and logs map to durable abstractions, whereas UI preferences, active workspace adjustments, and single-session drafts flow smoothly using `localStorage` caching logic (`DataPersistenceGate` & `StateConsistencyMonitor`).
2.  **No Port Modification**: The platform remains tightly bound to port `3000` to satisfy reverse-proxy requirements. 
3.  **HMR Exclusion**: Hot Module Replacement is disabled to prevent flashing half-written components. 

### 6. Specialized Multi-Sheet Workbook Ingestion Pipeline

```text
       [Customer Excel / CSV BOQ]
                    │
                    ▼
     [Workbook Parsing Microservice]
        ├── Sheet 1 (Compute Node)  ──► Auto-generate UCID-A 
        ├── Sheet 2 (Storage Pod)   ──► Auto-generate UCID-B 
        └── Sheet 3 (Spine Network) ──► Auto-generate UCID-C 
```

#### 6.1 Hybrid Multi-UCID Portfolio Plan & Parallel Orchestration
When an enterprise deal spans multiple system platforms (e.g., 3 separate UCIDs with 4 configurations each), the parent workflow orchestrates both **Automated API Crawling** and **Manual Partner Portal Drops** in combination without ambiguities:
- **Parallel Automated Channels**: Live bots crawl endpoints. Sync happens sequentially within each umbrella.
- **Manual Human Sign-offs**: Partner-completed configurations pause development milestones, holding the umbrella in `"Awaiting Manual Uplink"` state.
- **Reconciliation Integrity**: Supports **Partial BOM comparisons**, syncing some configs immediately while recognizing unmatched configs as "Missing Allocation Slots"—avoiding parallel channel cross-contamination.

#### 6.2 Portfolio Orchestration API Contracts
*   Initiate Pipeline: `POST /api/portfolio/orchestrate`
*   Submit Partner Custom Match: `POST /api/portfolio/upload-manual`

---

### 7. The Four Critical Forensic Compliance Core Rules

To maximize gross margin protection, the Sourcing Integrity Diagnostic Sandbox enforces:

#### 7.1 Lifecycle Validation (End-Of-Life EOL Warnings)
*   **The Issue**: Dealing with legacy deprecated hardware variants causing high warranty risk.
*   **Resolution Flow**: Scans parts against central EOL catalogues, replaces with peer-level modern equivalent logic while preserving architectural boundaries (restoring stable supply lines).

#### 7.2 Custom Contract Manufacturer Pricing
*   **The Issue**: Manual quotes containing arbitrary overhead. 
*   **Resolution Flow**: Platform detects explicit divergence traversing direct manufacturer base pricing arrays versus the provided workbook figure. Automates line-item price correction and aggregates variance into massive portfolio volume savings.

#### 7.3 Memory Layout Configuration Symmetry Defect
*   **The Issue**: Asymmetric or misaligned memory channels which bottleneck compute platforms (e.g. Cisco UCS systems lacking matched RAM populations).
*   **Resolution Flow**: Algorithm detects memory channel mismatches natively and upgrades RAM modules to satisfy optimal channel architecture specifications.

#### 7.4 Partner API Telemetry Blockages
*   **The Issue**: Disconnected or blocked partner credentials causing blind spots in supply chain tracking.
*   **Resolution Flow**: Safely re-authenticates partner gateway certificates, automatically restoring the telemetry ingress pipelines without human intervention. 

---

### 8. Suggested Feature Backlog & AI Model Prompts
To improve this application with subsequent AI models, consider the following prompts:
1.  *"Using the CompatibilityRule interface, construct a Playwright scraper script targeting a mockup manufacturer login portal."*
2.  *"Rewrite the Taxonomic Procurement Knowledge Graph node interaction using d3-force clustering to snap sockets into processor cards."*
3.  *"Construct complex D3 radial charts bridging multi-UCID configurations inside the ReportsView to show variance differentials per vendor axis over time."*

---

### Appendix A: Explicit TypeScript DTO Contracts (Integration Schemas)

To eliminate any ambiguity for backend engineering agents, the following definitions strictly dictate the input/output boundaries mapping directly to the endpoints documented in Section 4.

```typescript
// 1. Workbook Parsing
export interface IngestRequest {
  fileName: string;
  presetType: "hpe-legacy" | "dell-overcharge" | "cisco-asymmetry";
  rawText?: string;
}

export interface IngestResponse {
  success: boolean;
  message: string;
  sourceFile: string;
  ucid: import('../src/types/data').UCID; // Complete natively translated UCID entity
  timestamp: string;
  parsedSummary: {
    vendorBrand: string;
    detectedChassis: string;
    itemsCount: number;
    initialConfidenceScore: number;
  };
}

// 2. Playwright Automation Scraper Web Crawl
export interface PlaywrightRunRequest {
  agentName: "AribaScraper" | "HPEMarketplace" | "DellPremierPortal";
  ucidRef: string;
  targetPortalUrl: string;
  bypassCaptchas: boolean;
}

export interface PlaywrightRunResponse {
  taskId: string;
  status: "idle" | "running" | "success" | "failed";
  executionTimeMs: number;
  crawledItemsExtracted: number;
  logTrail: Array<{
    timestamp: string;
    level: "info" | "debug" | "warning" | "error";
    message: string;
  }>;
}

// 3. Hybrid Portfolio Orchestration
export interface PortfolioOrchestrateRequest {
  portfolioId: string;
  ucids: Array<{ id: string; channel: 'manual' | 'automated'; vendor: string }>;
}

export interface PortfolioOrchestrateResponse {
  success: boolean;
  transactionId: string;
  status: 'orchestrating' | 'failed';
  timestamp: string;
}

export interface PortfolioManualUploadRequest {
  portfolioId: string;
  ucidRef: string;
  filename: string;
  configsMatchedCount: number;
  configs?: Array<{
    configId: string;
    status: 'synced' | 'pending';
    priceUSD: number;
  }>;
}

export interface PortfolioManualUploadResponse {
  success: boolean;
  reconciliationStatus: 'partial' | 'complete';
  reconciledPriceUSD: number;
  missingSlots: string[];
  integrityScore: number;
  message: string;
}

// 4. Reconciliation & Intelligence
export interface ReconciliationRequest {
  submissions: Array<{
    id: string;
    vendor: string;
    configs: Array<{
      items: Array<{
        partNumber: string;
        quantity: number;
        unitPrice: number;
        type: string;
      }>;
    }>;
  }>;
}

export interface ReconciliationResponse {
  comparisonHash: string;
  calculatedAt: string;
  metrics: {
    cheapestSolutionId: string;
    highestComplianceId: string;
    totalSavingsUSD: number;
    optimumHybridAlternative: {
      totalCost: number;
      chassisVendor: string;
      componentsCount: number;
    };
  };
  matrix: Array<{
    solutionId: string;
    vendor: string;
    baseCost: number;
    negotiatedContractCost: number;
    variancePercentage: number;
    leadTimeBottleneckDays: number;
    deliveryConfidenceRating: number;
  }>;
}

// 5. Taxonomy Validation
export interface ConstraintCheckRequest {
  chassisSKU: string;
  cpuSKU: string;
  ramQuantity: number;
  psuWattsCount: number;
}

export interface ConstraintCheckResponse {
  isCompliant: boolean;
  socketMatch: {
    status: "compatible" | "asymmetric" | "blocked";
    chassisSocket: string;
    cpuSocket: string;
    description: string;
  };
  powerLimitTest: { passed: boolean; estimatedTdpWatts: number; maxSupportedWatts: number; marginWatts: number; };
  memoryBalanceCheck: { passed: boolean; quantity: number; optimalLayoutSymmetry: number; recommendsCorrection: boolean; message: string; };
}

// 6. Outbound Synchronizations
export interface WebhookDispatchRequest {
  endpointUrl: string;
  secretToken: string;
  ucidRef: string;
  payloadData: { snapshotHash: string; committedValue: number; winnerSolution: string; timestamp: string; };
}

export interface WebhookDispatchResponse {
  dispatchId: string;
  status: "delivered" | "retrying" | "endpoint_unreachable";
  cryptographicSignature: string;
  auditLog: Array<{ attemptNumber: number; timestamp: string; httpStatusCode: number; responseBody: string; }>;
}

// 7. Taxonomy Graph & Relationships
export interface GraphNode {
  id: string;
  label: string;
  type: "Product" | "Sub-product" | "Category" | "Sub-category" | "SKU";
  properties?: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: "depends on" | "mutually exclusive" | "hierarchy";
}

export interface GraphAPIResponse {
  metadata: { id: string; lastUpdated?: string; version?: string; };
  nodes: GraphNode[];
  edges: GraphEdge[];
}
```

---

### 7. Snapshot Versioning, Lock State, and Detailed BOM Specification Management

To secure negotiated pricing structures over long sales/procurement execution windows, the platform implements a strict **Snapshot Versioning & Control Engine**. This ensures changes are recorded systematically and previous milestones remain locked as authoritative history.

#### 7.1 Lifecycle Rules for Snapshots
- **Snapshot Creation**: Users can take a snapshot at any point. Taking a snapshot copies the entire current BOM configuration (stored in `bomSnapshot`), compiles a designated version number, applies a high-precision timestamp, and initializes as `locked: true` by default.
- **Lock/Unlock Flags**: Every snapshot must contain a `locked` boolean variable.
  - A **locked** snapshot is immutable and cannot be deleted or mid-edited.
  - An **unlocked** snapshot allows deletions or overrides if a re-alignment becomes necessary (not standard practice, but supported via manual toggling).
- **Versioning Increments**: Snapshots are index-aligned and versioned incrementally starting at `1` for each UCID to ensure a transparent historical audit trail.
- **Detailed BOM Spec Visuals**: Within the version list, snapshots can be expanded to display accurate nested SKU properties (part numbers, description names, quantities, and line pricing totals) cached at that specific point in time rather than general text notes.

---
