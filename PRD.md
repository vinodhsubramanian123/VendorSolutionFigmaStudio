# Product Requirement Document (PRD)
## Multi-Supplier Vendor Solution Intelligence & Procurement Integrity Platform

**Status**: Active Production Reference  
**Authors**: AI Specialist & Design Architect  
**Created**: June 2026  

---

### 1. Executive Summary & Vision

The **Vendor Solution Intelligence & Procurement Integrity Platform** is a master-audit, splicing, and configuration compiler built to orchestrate, cleanse, and parallel-evaluate multi-tab Excel/CSV Bills of Quantities (BOQs) received from direct manufacturers and suppliers. 

By eliminating low-fidelity browser alerts in favor of an eye-safe, high-contrast, beautiful dark-themed environment, the user interface enforces cryptographic exactness over:
1. **Multi-Client Quote Compilation Desk** (Sourcing Document file ingestion/intake).
2. **Parallel UCID (Unique Configuration Identifier) Processing Line** (Direct vendor comparison).
3. **Sourcing Integrity Diagnostic Sandbox** (Margin verification and layout checking).
4. **Interactive Splicing & Mapping Workshop** (Heuristic string matching and taxonomy cleaning).
5. **Taxonomic Procurement Knowledge Graph** (Hardware physical restraints and LGA socket verification).
6. **Direct ERP / CRM Connection Panel** (Secure API sync and push delivery tracking).
7. **Playwright Automation Agents** (Browser automation agents crawling external supplier endpoints).

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
Standard browser alerts (`window.alert`) are entirely banned. A custom, reactive `Toast` overlay system animates into the bottom-right corner of the container. It color-keys border frames and glyph icons based on notification status:
*   `success` (emerald green border, `#091815` body, custom check icon).
*   `warn` (orange border, `#1c1409` body, alert-circle icon).
*   `error` (crimson red border, `#1c090d` body, warning icon).

---

### 3. Core Functional Modules

The platform is structured into ten unified navigation views, preserving a completely stateful single-page sandbox workspace.

```
+---------------------------------------------------------------------------------+
|                                 App Nav Rail                                    |
| Dashboard | Quote Compile | SKU Manager | Vendor Endpoints | Forensic Sandbox   |
| Reports   | Splicing Workshop | ERP Gateway | Taxonomic Graph  | Live Mission   |
+---------------------------------------------------------------------------------+
```

#### 3.1 Multi-Client Quote Compilation Desk
*   **Objective**: Intake raw excel sheets of multi-tab sourcing documents.
*   **Layout**: A beautiful drag-and-drop file uploader zone supporting file selection.
*   **Data output**: Instant generation of structured parallel UCID jobs.

#### 3.2 Parallel UCID Processing Line (The "Live Mission" view)
*   **Objective**: Act as the master cockpit for tracking a particular UCID’s seven stages:
    1.  *BOQ Ingestion*: Parse CSV raw material rows.
    2.  *Pre-Intelligence*: Execute initial heuristics.
    3.  *Solution Design*: Auto-compile alternative bids (e.g., HPE-centered, Dell-centered, hybrid mixtures).
    4.  *Vendor Provisioning*: Dispatch pricing queries to manufacturer APIs.
    5.  *Post-Intelligence (Forensics)*: Highlight margins overages or configuration failures.
    6.  *Comparison Matrix*: Perform head-to-head pricing calculations.
    7.  *Snapshot Lock*: Commit the winning scenario and download xlsx/pdf assets.

#### 3.3 Sourcing Integrity Diagnostic Sandbox (The "Forensic Audit" view)
*   **Objective**: Protect margins by mapping real-time pricing anomalies.
*   **Features**:
    *   Integrity Score ring visualization utilizing D3 gradients.
    *   Interactive filter controls (critical severity issues vs. informational notes).
    *   Automated repair micro-scripts (re-computing base discount thresholds).

#### 3.4 Interactive Splicing & Mapping Workshop (The "Cleansing" view)
*   **Objective**: Resolve bad or corrupted supplier quote entries.
*   **Workflow**:
    *   Suppliers often send typo-ridden descriptions. The UI presents clean alignment columns.
    *   The user clicks dynamic tag buttons to apply heuristic rules.
    *   Bypass state restrictions via an explicit reset stream trigger to reconfigure testing flows.

#### 3.5 Taxonomic Procurement Knowledge Graph (The "Taxonomy" view)
*   **Objective**: Interact with physically-binding motherboard configurations.
*   **Rules Model**: Prevents installing incompatible parts (e.g., non-LGA4677 CPUs inside an LGA1700 chassis).
*   **Visual Structure**: Interactive SVG/Canvas node mapping with layout validation logic.

#### 3.6 Direct ERP / CRM Connection Panel (The "Integrations Gateway")
*   **Objective**: Direct outbound transmission of cleared quotations into master corporate resource databases.
*   **Visuals**: Interactive Webhook custom JSON editor, live dispatch history, and connection endpoint status bulbs.

#### 3.7 Playwright Web-Automation Scraper Agents (The "Manufacturer Portal")
*   **Objective**: Run headless cloud browsers to fetch inventory schedules and real-time vendor supply data from non-API legacy supplier sites.
*   **Contracts**: Feeds logs directly into the telemetry panels of the portal.

---

### 4. Direct Backend API Reference & Data Contracts and Examples

All UI/UX states correspond to explicit TypeScript interfaces declared in `/src/types.ts` and `/server.ts`. Downstream backend service engines must strictly implement these schemas:

#### 4.1 Workbook Ingest and Tab Separation Endpoint (`/api/boq/ingest`)
*   **Payload (Input)**:
    ```json
    {
      "fileName": "HPE_PARTNER_QUOTE_6130_EOL.xlsx",
      "presetType": "hpe-legacy",
      "rawText": "[AUTOMATED WORKBOOK INGESTION - HPE LOGGED QUOTE]"
    }
    ```
*   **Response (Output)**:
    ```json
    {
      "success": true,
      "message": "Sheet workbook parsed successfully across supplier heuristic rules.",
      "sourceFile": "HPE_PARTNER_QUOTE_6130_EOL.xlsx",
      "ucid": "ucid_api_session_uuid_17203394883",
      "timestamp": "2026-06-06T18:45:00Z",
      "parsedSummary": {
        "vendorBrand": "HPE",
        "detectedChassis": "P40411-B21 DL380 Gen11 NC SFF",
        "itemsCount": 110,
        "initialConfidenceScore": 78
      },
      "solutions": [
        {
          "id": "sol-api-hpe-legacy",
          "vendor": "HPE",
          "label": "HPE Enterprise Solution (Validated)",
          "totalPrice": 118200,
          "originalPrice": 125000,
          "savings": 6800,
          "complianceScore": 78,
          "items": [
            { "id": "item-api-h1", "partNumber": "P40411-B21", "name": "HPE ProLiant DL380 Gen11 CTO Chassis", "type": "Chassis", "quantity": 10, "unitPrice": 3400 }
          ]
        }
      ]
    }
    ```

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
*   **Response (Output)**:
    ```json
    {
      "taskId": "task_agent_0e1322",
      "status": "success",
      "executionTimeMs": 2500,
      "crawledItemsExtracted": 24,
      "logTrail": [
        { "timestamp": "2026-06-06T18:45:00Z", "level": "info", "message": "Booting Chromium context..." }
      ]
    }
    ```

#### 4.3 Outbound Reconciliation comparison Endpoint (`/api/reconciliation/compare`)
*   **Payload (Input)**:
    ```json
    {
      "solutions": [
        {
          "id": "sol-api-hpe-legacy",
          "vendor": "HPE",
          "items": [
            { "partNumber": "P40411-B21", "quantity": 10, "unitPrice": 3400, "type": "Chassis" },
            { "partNumber": "815100-B21", "quantity": 20, "unitPrice": 1890, "type": "Processor" }
          ]
        }
      ]
    }
    ```
*   **Response (Output)**:
    ```json
    {
      "comparisonHash": "62bfde4e5",
      "calculatedAt": "2026-06-06T18:45:05Z",
      "metrics": {
        "cheapestSolutionId": "sol-api-hpe-legacy",
        "highestComplianceId": "sol-api-dell-alternative",
        "totalSavingsUSD": 6800,
        "optimumHybridAlternative": {
          "totalCost": 112290,
          "chassisVendor": "Combination Blend",
          "componentsCount": 2
        }
      },
      "matrix": [
        {
          "solutionId": "sol-api-hpe-legacy",
          "vendor": "HPE",
          "baseCost": 127600,
          "negotiatedContractCost": 118200,
          "variancePercentage": 8.0,
          "leadTimeBottleneckDays": 45,
          "deliveryConfidenceRating": 78
        }
      ]
    }
    ```

#### 4.4 Outbound Synchronization Webhooks (`/api/integrations/dispatch`)
*   **Payload (Input)**:
    ```json
    {
      "endpointUrl": "https://ariba.partner.sap.com/api/v4/sourcing/synchronize",
      "secretToken": "crm-token-client-sandbox-signature-2026",
      "ucidRef": "req-2026-09411",
      "payloadData": {
        "procurementRequestId": "req-2026-09411",
        "creator": "Admin operator",
        "budgetCapUsd": 250000
      }
    }
    ```
*   **Response (Output)**:
    ```json
    {
      "dispatchId": "tx_dispatch_f29e10a5",
      "status": "delivered",
      "cryptographicSignature": "651f89bc7291a842b0e91da",
      "auditLog": [
        { "attemptNumber": 1, "timestamp": "2026-06-06T18:45:00Z", "httpStatusCode": 200, "responseBody": "{}" }
      ]
    }
    ```

#### 4.5 Taxonomic Constraints Database Checker Scheme (`/api/taxonomy/check-constraints`)
*   **Payload (Input)**:
    ```json
    {
      "chassisSKU": "P40411-B21",
      "cpuSKU": "815100-B21",
      "ramQuantity": 5,
      "psuWattsCount": 750
    }
    ```
*   **Response (Output)**:
    ```json
    {
      "isCompliant": false,
      "socketMatch": {
        "status": "asymmetric",
        "chassisSocket": "LGA4677",
        "cpuSocket": "LGA3647 (Legacy)",
        "description": "Mismatch identified: Gen11 chassis uses LGA4677 sockets, but legacy CPU 815100-B21 belongs to LGA3647."
      },
      "powerLimitTest": {
        "passed": false,
        "estimatedTdpWatts": 205,
        "maxSupportedWatts": 750,
        "marginWatts": 545
      },
      "memoryBalanceCheck": {
        "passed": false,
        "quantity": 5,
        "optimalLayoutSymmetry": 8,
        "recommendsCorrection": true,
        "message": "Uneven layout detected: Odd RAM Allocation count (5) creates multi-channel architecture latency bottleneck. Scale up to multiples of 8."
      }
    }
    ```

---

---

### 5. Architectural & System Constraints

1.  **Strict Storage Separation**: Complex records such as historical snapshots and audit logs should be backed up to durable Cloud Databases (Firestore / PostgreSQL). Transient UI preferences and active edit lists are maintained in the browser context (`localStorage`).
2.  **No Port Modification**: The platform remains tightly bound to port `3000` to satisfy reverse-proxy requirements. No custom runtime environmental variables should be forced in code, avoiding server-side boot breaks.
3.  **HMR Exclusion**: Hot Module Replacement is disabled to prevent flashing half-written components. Developers must compile through the dedicated tool suite to confirm complete dependency resolution.

### 5. Specialized Multi-Sheet Workbook Ingestion Pipeline
To support complex enterprise bidding processes, the **Multi-Client Quote Compilation Desk** handles both single-sheet and multi-tab/sheet Bill of Quantity (BOQ) files.

```
       [Customer Excel / CSV BOQ]
                    │
                    ▼
     [Workbook Parsing Microservice]
        ├── Sheet 1 (Compute Node Specs)  ──► Auto-generate UCID-A (Scale-Out)
        ├── Sheet 2 (Storage Pod Specs)  ──► Auto-generate UCID-B (Object Store)
        └── Sheet 3 (Spine Network Specs) ──► Auto-generate UCID-C (DC Spine Network)
```

1.  **Tab Separation & Splitting**: High-capacity Excel spreadsheets usually group different infrastructure layers across tabs. The ingestion gateway splits each tab into a discrete parallel configuration run (Unique Configuration Identifier - UCID).
2.  **Part Extraction & HEURISTICS**: Description lists in the workbook can contain arbitrary vendor descriptions (e.g., `"HPE-DL38O-G11-8sff-chsis-modl_A"`). The interactive splicing and mapping workshop runs normalized string-distance algorithms (Levenshtein distance) to pair dirty lines with standard canonical Stock Keeping Units (CatalogSKUs).

#### 5.1 Hybrid Multi-UCID Portfolio Plan & Parallel Orchestration
When an enterprise deal spans multiple system platforms (e.g., 3 separate UCIDs with 4 configurations each), the parent workflow orchestrates both **Automated API Crawling** and **Manual Partner Portal Drops** in combination without ambiguities:
- **Parallel Automated Channels**: Live bots (e.g., HPE-platform database, Cisco-agent) crawl multiple endpoints in parallel. Within each automated UCID umbrella, the 4 custom sub-configurations are synced sequentially from Config A through Config D.
- **Manual Human Sign-offs**: Partner-completed configurations (e.g., Dell Edge Platform manually designed via the premier portal) pause development pipeline milestones. The parent workflow remains in `"Awaiting Manual Uplink"` state.
- **Reconciliation Integrity (No Cross-Contamination)**: Standardized line-item tagging binds uploaded BOM files exclusively to their respective nested configs within the target UCID umbrella. The platform supports **Partial BOM comparisons** (e.g., matching only 2 of 4 configs), indicating "Missing Allocation Slots" for pending lines while matching prices for the uploaded items has zero impact on parallel automated tracks!

#### 5.2 Portfolio Orchestration API Contracts

##### A. Initiate Portfolio Parallel Pipeline (`POST /api/portfolio/orchestrate`)
* **Request Payload**:
```json
{
  "portfolioId": "PORT-2026-HQ-EXPANSION",
  "ucids": [
    { "id": "ucid-1701", "channel": "manual", "vendor": "Dell" },
    { "id": "ucid-1702", "channel": "automated", "vendor": "HPE" },
    { "id": "ucid-1703", "channel": "automated", "vendor": "Cisco" }
  ]
}
```
* **Response Payload**:
```json
{
  "success": true,
  "transactionId": "tx_orchestrate_2026_99a8b",
  "status": "orchestrating",
  "timestamp": "2026-06-06T19:07:00Z"
}
```

##### B. Submit Manual Partner Portal BOM file (`POST /api/portfolio/upload-manual`)
* **Request Payload**:
```json
{
  "portfolioId": "PORT-2026-HQ-EXPANSION",
  "ucidRef": "ucid-1701",
  "filename": "DELL_PREMIER_MANUAL_PARTIAL.xlsx",
  "configsMatchedCount": 2, // Supports partial alignment (e.g., only 2 out of 4 configs submitted)
  "configs": [
    { "configId": "cfg-1", "status": "synced", "priceUSD": 98100 },
    { "configId": "cfg-2", "status": "synced", "priceUSD": 98100 },
    { "configId": "cfg-3", "status": "pending", "priceUSD": 0 },
    { "configId": "cfg-4", "status": "pending", "priceUSD": 0 }
  ]
}
```
* **Response Payload**:
```json
{
  "success": true,
  "reconciliationStatus": "partial",
  "reconciledPriceUSD": 196200,
  "missingSlots": ["cfg-3", "cfg-4"],
  "integrityScore": 100,
  "message": "Partial portfolio BOM ingested successfully. 2 configuration slots are aligned; 2 remain outstanding. No cross-contamination detected on parallel channels."
}
```

---

### 6. The Two Critical Forensic Compliance Core Rules

To maximize gross margin protection and prevent deployment delays, the system enforces **two critical constraints** directly in the Sourcing Integrity Diagnostic Sandbox (`src/components/ForensicView.tsx`):

#### 6.1 Critical Constraint 1: Hardware Lifecycle Validation (End-Of-Life EOL Warnings)
*   **The Issue**: Procurement teams often submit legacy designs containing deprecated hardware, such as the `Intel Xeon Gold 6130 Processor` (SKU: `815100-B21`). This presents enormous supply-chain risks, grey-market pricing, and restricted warranties.
*   **The Diagnostic Flow**: The forensic audit engine scans part numbers against the central catalog’s EOL rules. If identified, the catalog triggers a `critical` flag.
*   **The Resolution Workflow**: 
    1.  Click the "Auto-Repair SKU" button inside the Sandbox.
    2.  The UI maps the EOL part to a modern equivalent (`P40424-B21` Intel Xeon Gold 6430), preserving the physical socket size requirements while restoring full warranties and stable lead times.

#### 6.2 Critical Constraint 2: Dynamic Direct Connected API Contract Price Auditing
*   **The Issue**: Manual quotes often contain arbitrary distributor markups. For instance, the `Dell 3.84TB Enterprise NVMe Solid State Drive` (SKU: `400-BPSB`) may be listed in the raw quote at `$1,590` instead of the enterprise partner contract price.
*   **The Diagnostic Flow**: The platform validates submitted pricing lines directly against Live Manufacturer API Endpoints. If the local quote exceeds the contract standard, it calculates the dollar variance.
*   **The Resolution Workflow**:
    1.  The Sandbox flags a pricing variance discrepancy representing a high-severity overcharge warning.
    2.  Clicking "Resolve Pricing" corrects the local pricing matrix to the standard `$1,190` database price.
    3.  A dynamic toast displays savings ($400/unit across 24 units = $9,600 total direct audit savings).

---

### 7. Core Operational Backend Integrations

```
┌───────────────────────────────────────┐         ┌───────────────────────────────┐
│        Playwright Scrapers            │         │        Corporate Gateway      │
│  - Captures stock on legacy portals   ├────────►│  - Pushes audited BOM to ERP  │
│  - Emulates user login & cookies      │         │  - Triggers delivery webhooks │
└───────────────────────────────────────┘         └───────────────────────────────┘
                                ▲                 ▲
                                │     API Sync    │
                                └─── Log Sync ────┘
```

#### 7.1 Browser Automation (Playwright Headless Workers)
For legacy vendor portals lacking direct JSON endpoints:
*   A containerized Node.js service spawns a headless browser executing structured user interactions (credential ingestion, category navigation, cost capture).
*   Logs are streamed through server events and exposed inside the Manufacturer Portal view.

#### 7.2 Webhook Dispatch Protocols
Completed snapshots trigger outbound webhooks containing the audited, locked bill of materials. The integrations gateway supports:
*   Signatures utilizing SHA256 hashes generated from the payload body and client secret.
*   Exponential-backoff retry policies to withstand network drops (maximum 5 retries).

---

### 8. Suggested Feature Backlog & AI Model Prompts
To improve this application with subsequent AI models, consider copying the following prompts:
1.  *"Using the CompatibilityRule interface in PRD.md section 4.2, write a Node.js validation resolver that loops over a parsed BOM array and flags a list of warning items where socket types do not align."*
2.  *"Rewrite the Taxonomic Procurement Knowledge Graph node interaction using d3-force clustering to drag and snap socket pins into processor cards."*
3.  *"Construct a Playwright scraper script targeting a mockup manufacturer login portal using the parameters specified in PlaywrightAgentConfig."*
4.  *"Create a robust Express endpoint for '/api/integrations/dispatch' that receives the locked OutboundWebhookConfig and logs deliveries with automatic exponential retries."*

