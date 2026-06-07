# Architectural specifications & System Review Guide
## Vendor Solution Intelligence & Procurement Integrity Platform

This document serves as the formal specification and review reference for AI and automated tools executing code auditing, validations, and backend development on the platform.

---

### 1. Unified Operational Domain Models (`/src/types.ts` & `/src/types/data.ts`)

The system state is rigidly governed by key data abstractions. All views, filters, and synchronization monitors must map directly to these entities:

#### 1.1 UCID (Unified Configuration & Identification Record)
A UCID represents a core procurement design package or bundle under active compilation or audit.
*   **Fields**:
    *   `id`: unique string identifier.
    *   `displayId`: string e.g., `UCID-2315`.
    *   `name`: string e.g., `HPE Synergy Modular Bundle`.
    *   `currentStep`: `'extract' | 'identify' | 'enrich' | 'alternatives' | 'snapshot' | 'dispatched'`.
    *   `status`: `'in-progress' | 'warning' | 'clean' | 'completed'`.
    *   `budgetTarget`: number (USD value).
    *   `configurations`: array of child hardware line items.
    *   `lastModified`: string (timestamp).

#### 1.2 CatalogSKU (Stock Keeping Unit)
Represents standard, canonical parts verified within the master catalog database.
*   **Fields**:
    *   `id`: string identifier.
    *   `partNumber`: string e.g., `P40411-B21`.
    *   `description`: string e.g., `Intel Xeon Gold 6430 CPU`.
    *   `category`: string e.g., `Chassis`, `Processor`, `Memory`, `Networking`.
    *   `baseUSD`: number.
    *   `vendorId`: string e.g., `cisco`, `hpe`.
    *   `requiresLicense`: boolean.

#### 1.3 Vendor Partners
Represents real or simulated direct-partner manufacturers and external suppliers integrated into the network.
*   **Fields**:
    *   `id`: unique string.
    *   `name`: string e.g., `HPE Direct Supply`.
    *   `authType`: `'oauth2' | 'apikey' | 'saml'`.
    *   `status`: `'connected' | 'syncing' | 'error' | 'disconnected'`.
    *   `lastSync`: string (timestamp).

---

### 2. Twelve Interactive Sandbox Navigation Modules

UI code is separated dynamically based on views. No browser-level `window.alert` blocks are allowed; all notifications feed into the custom non-obtrusive `Toast` notification context.

1.  **Overview (Dashboard)**: Executive status center with cards tracking margins, resolved SKUs, vendor crawl states, and recent synchronization log trails.
2.  **Quote Compile (Solution Builder)**: Compilation workbench. Users map parsed BOM lines to logical allocation blocks (UCIDs) to create alternate bid designs.
3.  **BOM Ingest (Ingestion Hub)**: центральный загрузчик for multi-tab Excel/CSV files. Contains a beautiful drag-and-drop zone and simulated parsing status logs.
4.  **Parallel Processing Control (Live Mission)**: Cockpit tracking the active 7-stage UCID transformation pipeline.
5.  **Diagnostic Sandbox (Forensic View)**: High-resolution margins protector. Implements custom repair tools to recalculate vendor markup versus list price thresholds.
6.  **Interactive Splicing & mapping (Cleansing View)**: Quarantine queue to resolve spelling errors, ambiguous suffixes, and unmapped entries to Catalog UCIDs.
7.  **Knowledge Graph Editor (Taxonomy Graph Editor)**: Visually editable node graph displaying connections from VENDOR -> SOLUTION -> PRODUCT -> CHASSIS -> SKU. Restricts incompatible placements.
8.  **Central SKU Library (Catalog Manager)**: Catalog manager interface allowing manual additions, category filtering, and edit forms for standard UCID catalog targets.
9.  **Scraper Agents Control (Vendor Portal)**: Execution panel for Playwright robotic automation scrapers that scan legacy supplier portals lacking standard APIs.
10. **Reports & Analytics (Reports View)**: Comprehensive comparison graphs and charts tracking multi-vendor quote statistics and savings captures over time.
11. **System Telemetry Node (System Telemetry & Logs)**: Internal telemetry logging dashboard. Combines CPU/Memory resource graphs with API performance telemetry.
12. **State Debugger (State Consistency Monitor)**: Floating debug portal mapping live cache items, active memory values, and diagnostic state resets.

---

### 3. Backend Endpoints & Expected Data Contracts

Any secondary server extension (`/server.ts`) must support the following schemas perfectly:

#### 3.1 BOM Parsing (`POST /api/boq/ingest`)
*   **Request Headers**: `Content-Type: application/json`
*   **Request Schema**:
    ```json
    {
      "fileName": "string",
      "presetType": "hpe-legacy" | "cisco-ccw" | "generic-csv"
    }
    ```
*   **Response Schema**:
    ```json
    {
      "success": true,
      "extractedCount": 42,
      "targetUcid": "u1",
      "timestamp": "string"
    }
    ```

#### 3.2 Automation Scrapers (`POST /api/agents/run`)
*   **Request Schema**:
    ```json
    {
      "agentName": "string",
      "ucidRef": "string",
      "targetPortalUrl": "string",
      "bypassCaptchas": true | false
    }
    ```
*   **Response Schema**:
    ```json
    {
      "runId": "string",
      "status": "completed" | "failed",
      "extractedCostItems": 15,
      "logs": ["string"]
    }
    ```

---

### 4. Code & Directory Separation Strategy

To ensure zero conflict between clean React UI views and system/review specifications:
1.  **UI Component Sandbox (`/src/components/`)**: Houses lightweight, stateless (or locally-cached) interactive views, charts, cards, and custom forms.
2.  **Review, Spec & Audit Modules (`/src/components/review/`)**: Completely separated. Stores API Docs (`DocumentationView.tsx`), Outbound Payload Interceptors (`PayloadSchemaValidator.tsx`), and Internal Schema Type verification engines (`SchemaValidator.tsx`).
3.  **Core Types (`/src/types.ts` & `/src/types/data.ts`)**: Universal single source of truth for runtime typing and props validation.

---

### 5. High-Performance Front-End Hydration & UI/UX Sourcing Guardrails

#### 5.1 Eliminating Inter-row Parsing Clutter and Blocking Hydration
*   **The Issue**: Traditional procurement tools parse raw Excel cell matrices line-by-line inside the main thread, causing frame freezing during the React hydration cycle and creating database-locking bottlenecks.
*   **The Blueprint**:
    *   **Smart Bulk Processing**: Delay rendering of raw tables until files are serialized into dynamic high-performance chunk arrays. Maintain memory virtualization for tables larger than 100 rows.
    *   **Eradication of Freezing Ledgers**: Never store long-form logs or immutable telemetry states directly as deeply-nested reactive objects inside parent React states. Offload these metadata files as background-serialized cache items or pass them to offscreen rendering layers.
    *   **Smarter Loading feedback**: Use non-blocking progress bars, debounced search triggers (minimum 150ms delay before performing list queries), and lightweight CSS-only transition states to create an exceptionally fluid visual experience.

#### 5.2 Aesthetic Separation from Systems Telemetry (Anti-AI-Slop & Anti-Tech-Larping)
*   **Strict UI Decoupling**: Keep telemetry variables, low-level server logs, container port mappings (e.g., `PORT: 3000`), and raw CPU metrics insulated inside the **System Telemetry Node** module (`telemetry`). The user-facing dashboard, quote compiler, and cleansing workshops must remain clean, uncluttered, and pristine.
*   **Design Typography & Density**: Outclass generic template components by maintaining precise negative space padding. Serial numbers, hardware hashes, and product codes must always be rendered in **JetBrains Mono** with medium font weight to prevent overlap or layout shifting on varying screen sizes.

---

*(Passed end-to-end syntax checks, ESLint verification, and compiler compilation)*
