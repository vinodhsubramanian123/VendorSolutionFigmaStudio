# UI/UX Component Specifications Registry ("Skills")

This registry links all UI/UX components and views within the Vendor BOM Engine to their respective structural specifications and behaviors. This guarantees that UI/UX engineers can safely redraw, recreate, or modify screens with full knowledge of the data contracts and state interactions required for the logic to function.

## Main Application Views

| View Name | Route | Spec / Skills Document | Description |
| :--- | :--- | :--- | :--- |
| **Dashboard** | `/` | [Dashboard Skills](ui-specs/dashboard-skills.md) | High-level portfolio metrics and recent mission telemetry. |
| **Mission Builder** | `/solution-builder` | [Mission Builder Skills](ui-specs/mission-builder-skills.md) | Multi-Client Quote Compilation Desk. Ingests BOMs and creates UCIDs. |
| **Mission Control** | `/mission-control/:id` | [Mission Control Skills](ui-specs/mission-control-skills.md) | The primary pipeline view for running intelligence and provisioning on a UCID. |
| **Solution Manager** | `/solutions` | [Solution Manager Skills](ui-specs/solution-manager-skills.md) | Master overview grid for all active SolutionProjects. |
| **Solution Detail** | `/solutions/:id` | [Solution Detail Skills](ui-specs/solution-detail-skills.md) | The management console for a specific `SolutionProject` and its `VendorAssignments`. |
| **Catalog Manager** | `/catalog` | [Catalog Manager Skills](ui-specs/catalog-manager-skills.md) | High-volume SKU viewer enforcing strict virtualized rendering. |
| **Vendor Portal** | `/vendor-portal` | [Vendor Portal Skills](ui-specs/vendor-portal-skills.md) | Vendor API status links and Sourcing Rules thresholds. |
| **Forensic View** | `/forensic` | [Forensic View Skills](ui-specs/forensic-view-skills.md) | Triaging rule violations across multi-vendor BOM constraints. |
| **Ingestion Hub** | `/ingestion-hub` | [Ingestion Hub Skills](ui-specs/ingestion-hub-skills.md) | The starting point for raw excel drop zones and payload parsing. |
| **Taxonomy Graph** | `/taxonomy-graph` | [Taxonomy Graph Skills](ui-specs/taxonomy-graph-skills.md) | Interactive visualization canvas for mechanical and structural constraints. |
| **Global Search** | `/search` | [Search View Skills](ui-specs/search-view-skills.md) | Omni-search for parts, configs, and vendors. |
| **Reconciliation** | `/reconciliation` | [Reconciliation View Skills](ui-specs/reconciliation-view-skills.md) | Semantic string-to-SKU mapping alignment. |
| **Data Cleansing** | `/cleansing` | [Cleansing View Skills](ui-specs/cleansing-view-skills.md) | Bulk regex actions for cleaning dirty taxonomy databases. |
| **System Telemetry**| `/telemetry` | [System Telemetry Skills](ui-specs/system-telemetry-skills.md) | Real-time terminal log viewer for application processes. |

---

> [!NOTE]
> All specifications enforce zero `any` types and guarantee state predictability through Zustand global stores. Refer to individual spec files before modifying grid layouts or visual tokens.
