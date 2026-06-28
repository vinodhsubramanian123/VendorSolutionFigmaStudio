import {  Vendor,  ForensicIssue, UCIDStep, Job } from '../../types';
import { tokens } from '../../styles/tokens';
export const MOCK_JOBS: Job[] = [
  {
    job_id: "job-active-1",
    type: "config_process",
    status: "processing",
    progress: 45,
    context: {
      ucid: "UCID-2026-0042",
      config_id: "cfg-123",
      solution_id: "sol-active",
    },
    child_jobs: []
  }
];
export const STEP_ORDER: UCIDStep[] = [
  "boq-intake",
  "pre-intelligence",
  "solution-design",
  "vendor-provisioning",
  "post-intelligence",
  "comparison",
  "snapshot",
];
export const UCID_STEPS: {
  id: UCIDStep;
  label: string;
  shortLabel: string;
  desc: string;
}[] = [
  {
    id: "boq-intake",
    label: "BOQ Intake",
    shortLabel: "Intake",
    desc: "Ingest raw Bills of Quantities and parse customer requirement sheets.",
  },
  {
    id: "pre-intelligence",
    label: "Pre-Intelligence",
    shortLabel: "Pre-Intel",
    desc: "Scan catalog models, resolve vague names, and establish baseline pricing specs.",
  },
  {
    id: "solution-design",
    label: "Solution Design",
    shortLabel: "Design",
    desc: "Generate dual-sourced alternative configurations and structural options.",
  },
  {
    id: "vendor-provisioning",
    label: "Vendor Provisioning",
    shortLabel: "Provision",
    desc: "Query vendor transaction APIs to retrieve custom quotes and validate lead times.",
  },
  {
    id: "post-intelligence",
    label: "Post-Intelligence",
    shortLabel: "Post-Intel",
    desc: "Inspect technical rules, check chassis spacing, power loads, and firmware compatibilities.",
  },
  {
    id: "comparison",
    label: "BOM Comparison",
    shortLabel: "Compare",
    desc: "Cross-examine pricing alternatives, TCO, delivery margins, and select winning paths.",
  },
  {
    id: "snapshot",
    label: "Commit Snapshot",
    shortLabel: "Commit",
    desc: "Lock system configuration, generate immutable snapshot hash, and export PO draft.",
  },
];
export const VENDORS: Vendor[] = [
  {
    id: "v1",
    name: "Hewlett Packard Enterprise",
    shortName: "HPE",
    status: "connected",
    color: tokens.colors.status.success, 
    catalogItems: 5812,
    apiHealth: 99.4,
    apiEndpoint: "https://api.hpe.com/v2/pricing/instant",
    syncInterval: "Every 4 Hours",
    lastSync: "10 mins ago",
    credentials: {
      username: "enterprise_sourcing_hpe_prod",
      apiToken: "mock-apiToken-hpe-001",
      mfaToken: "RO7K-9154-A24B"
    }
  },
  {
    id: "v2",
    name: "Dell Technologies",
    shortName: "Dell",
    status: "connected",
    color: tokens.colors.accent.indigo, 
    catalogItems: 4831,
    apiHealth: 98.7,
    apiEndpoint: "https://b2b.dell.com/api/catalog/v3",
    syncInterval: "Every 12 Hours",
    lastSync: "2 hours ago",
    credentials: {
      username: "dell_premier_procurement_lead",
      apiToken: "mock-apiToken-dell-002",
      mfaToken: "DL-9824-MFA-X2"
    }
  },
  {
    id: "v3",
    name: "Cisco Systems",
    shortName: "Cisco",
    status: "connected",
    color: tokens.colors.accent.violet, 
    catalogItems: 3104,
    apiHealth: 92.1,
    apiEndpoint: "https://commerce.cisco.com/api/v3/solutions",
    syncInterval: "Every 12 Hours",
    lastSync: "1 min ago",
    credentials: {
      username: "cisco_commerce_workspace_api",
      apiToken: "mock-apiToken-cisco-003",
      mfaToken: "CSCO-AUTH-9999"
    }
  },
  {
    id: "v4",
    name: "Juniper Networks",
    shortName: "Juniper",
    status: "disconnected",
    color: tokens.colors.status.warning, 
    catalogItems: 1420,
    apiHealth: 0.0,
    apiEndpoint: "https://api.juniper.net/partners/v1/catalog",
    syncInterval: "Daily",
    lastSync: "2 days ago",
  },
];
export const FORENSIC_ISSUES: ForensicIssue[] = [
  {
    id: "iss-1",
    title: "Intel Xeon 6130 End-of-Life (EOL) Sourcing Risk",
    description:
      "HPE Legacy CPU (815100-B21) has reached EOL standing. Procuring this will result in grey-market parts or a 45+ day vendor lead time.",
    vendor: "HPE",
    severity: "critical",
    status: "open",
    affectedItems: 1,
    suggestedAction:
      "Map to modern Intel Xeon Gold 6430 32-Core (P40424-B21), saving lead time and securing fully backed factory warranty.",
  },
  {
    id: "iss-2",
    title: "Pricing Mismatch: Dell SFF Enterprise NVMe Quote Variance",
    description:
      "Active quote for Dell 3.84TB Drive (400-BPSB) is logged in BOQ as $1,590. Our direct connected API contract rate is $1,190. $400 overcharge detected per unit.",
    vendor: "Dell",
    severity: "critical",
    status: "open",
    affectedItems: 24,
    suggestedAction:
      "Auto-Align local BOQ unit price to $1,190 API pricing model. Total direct savings: $9,600.",
  },
  {
    id: "iss-3",
    title: "Cisco Memory Layout Configuration Defect",
    description:
      "Cisco UCS standard C240 configuration requests 5 memory modules. Intel Xeon 4th-Gen memory controllers operate optimally on 8-channel modules (multiples of 8 modules).",
    vendor: "Cisco",
    severity: "warning",
    status: "open",
    affectedItems: 5,
    suggestedAction:
      "Upgrade configuration load to 8 units of 64GB RDIMM (UCS-MR-64G2ED-E) or compress allocation to 4 standard modules to preserve dual-socket performance symmetry.",
  },
  {
    id: "iss-4",
    title: "Juniper API Telemetry Ingress Blocked",
    description:
      "The API credentials for Juniper Networks partner portal returned a 401 Unauthorized status on the last synchronization sweep.",
    vendor: "Juniper",
    severity: "info",
    status: "open",
    affectedItems: 0,
    suggestedAction:
      "Re-authenticate secure partner tokens in the Vendor Portal API Integrations panel.",
  },
];
export const CATALOG_TREND = [
  { month: "Jan", items: 10200 },
  { month: "Feb", items: 11400 },
  { month: "Mar", items: 12100 },
  { month: "Apr", items: 13900 },
  { month: "May", items: 14700 },
  { month: "Jun", items: 15167 },
];
// This file is auto-generated by our patch logic