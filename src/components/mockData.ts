import { UCID, Vendor, CatalogSKU, ForensicIssue, UCIDStep } from '../types';

export const STEP_ORDER: UCIDStep[] = [
  'boq-intake',
  'pre-intelligence',
  'solution-design',
  'vendor-provisioning',
  'post-intelligence',
  'comparison',
  'snapshot'
];

export const UCID_STEPS: { id: UCIDStep; label: string; shortLabel: string; desc: string }[] = [
  {
    id: 'boq-intake',
    label: 'BOQ Intake',
    shortLabel: 'Intake',
    desc: 'Ingest raw Bills of Quantities and parse customer requirement sheets.'
  },
  {
    id: 'pre-intelligence',
    label: 'Pre-Intelligence',
    shortLabel: 'Pre-Intel',
    desc: 'Scan catalog models, resolve vague names, and establish baseline pricing specs.'
  },
  {
    id: 'solution-design',
    label: 'Solution Design',
    shortLabel: 'Design',
    desc: 'Generate dual-sourced alternative configurations and structural options.'
  },
  {
    id: 'vendor-provisioning',
    label: 'Vendor Provisioning',
    shortLabel: 'Provision',
    desc: 'Query vendor transaction APIs to retrieve custom quotes and validate lead times.'
  },
  {
    id: 'post-intelligence',
    label: 'Post-Intelligence',
    shortLabel: 'Post-Intel',
    desc: 'Inspect technical rules, check chassis spacing, power loads, and firmware compatibilities.'
  },
  {
    id: 'comparison',
    label: 'BOM Comparison',
    shortLabel: 'Compare',
    desc: 'Cross-examine pricing alternatives, TCO, delivery margins, and select winning paths.'
  },
  {
    id: 'snapshot',
    label: 'Commit Snapshot',
    shortLabel: 'Commit',
    desc: 'Lock system configuration, generate immutable snapshot hash, and export PO draft.'
  }
];

export const VENDORS: Vendor[] = [
  {
    id: 'v1',
    name: 'Hewlett Packard Enterprise',
    shortName: 'HPE',
    status: 'connected',
    color: '#00d4a0',
    catalogItems: 5812,
    apiHealth: 99.4,
    apiEndpoint: 'https://api.hpe.com/v2/pricing/instant',
    syncInterval: 'Every 4 Hours',
    lastSync: '10 min ago'
  },
  {
    id: 'v2',
    name: 'Dell Technologies',
    shortName: 'Dell',
    status: 'connected',
    color: '#4a85fd',
    catalogItems: 4831,
    apiHealth: 98.7,
    apiEndpoint: 'https://direct.dell.com/oem/api/v1/quotes',
    syncInterval: 'Every 6 Hours',
    lastSync: '25 min ago'
  },
  {
    id: 'v3',
    name: 'Cisco Systems',
    shortName: 'Cisco',
    status: 'syncing',
    color: '#a855f7',
    catalogItems: 3104,
    apiHealth: 92.1,
    apiEndpoint: 'https://commerce.cisco.com/api/v3/solutions',
    syncInterval: 'Every 12 Hours',
    lastSync: '1 min ago'
  },
  {
    id: 'v4',
    name: 'Juniper Networks',
    shortName: 'Juniper',
    status: 'disconnected',
    color: '#ff9b36',
    catalogItems: 1420,
    apiHealth: 0.0,
    apiEndpoint: 'https://api.juniper.net/partners/v1/catalog',
    syncInterval: 'Daily',
    lastSync: '2 days ago'
  }
];

export const CATALOG_SKUS: CatalogSKU[] = [
  // HPE Items - Server Solutions DL380 Gen11
  { id: 'sku-1', vendor: 'HPE', partNumber: 'P40424-B21', name: 'Intel Xeon Gold 6430 32-Core 2.1GHz Processor (Gen11)', type: 'Processor', price: 2150, leadTimeDays: 7, status: 'active' },
  { id: 'sku-2', vendor: 'HPE', partNumber: 'P38454-B21', name: 'HPE 64GB Dual Rank x4 DDR5-4800 RAM Module (Gen11)', type: 'Memory', price: 580, leadTimeDays: 5, status: 'active' },
  { id: 'sku-3', vendor: 'HPE', partNumber: 'P40483-B21', name: 'HPE 3.84TB NVMe Gen4 Read Intensive SFF SSD', type: 'Drive', price: 1220, leadTimeDays: 12, status: 'active' },
  { id: 'sku-4', vendor: 'HPE', partNumber: 'P40411-B21', name: 'HPE ProLiant DL380 Gen11 8SFF NC CTO Chassis', type: 'Chassis', price: 3400, leadTimeDays: 14, status: 'active' },
  { id: 'sku-4-24sff', vendor: 'HPE', partNumber: 'P40412-B21', name: 'HPE ProLiant DL380 Gen11 24SFF High Density Chassis', type: 'Chassis', price: 4200, leadTimeDays: 15, status: 'active' },
  { id: 'sku-5', vendor: 'HPE', partNumber: 'P40445-B21', name: 'HPE Broadcom 57414 Dual Port 10/25Gb Ethernet Adapter', type: 'Network Adapter', price: 410, leadTimeDays: 3, status: 'active' },
  { id: 'sku-hpe-psu1', vendor: 'HPE', partNumber: '865414-B21', name: 'HPE 800W Flex Slot Platinum Hot Plug Low Halogen Power Supply', type: 'Power Supply', price: 195, leadTimeDays: 4, status: 'active' },
  { id: 'sku-hpe-riser1', vendor: 'HPE', partNumber: 'P43019-B21', name: 'HPE DL380 Gen11 Main PCIe Riser Card Option Kit', type: 'Riser Card', price: 120, leadTimeDays: 2, status: 'active' },
  
  // HPE Items - Server Solutions DL380 Gen12
  { id: 'sku-hpe-g12-cpu', vendor: 'HPE', partNumber: 'P50123-B21', name: 'Intel Xeon Platinum 8562Y+ 32-Core 2.8GHz Processor (Gen12)', type: 'Processor', price: 3850, leadTimeDays: 9, status: 'active' },
  { id: 'sku-hpe-g12-ram', vendor: 'HPE', partNumber: 'P50164-B21', name: 'HPE 128GB Quad Rank x4 DDR5-5600 RAM Module (Gen12)', type: 'Memory', price: 1450, leadTimeDays: 6, status: 'active' },
  { id: 'sku-hpe-dl380-gen12-8sff', vendor: 'HPE', partNumber: 'P50410-B21', name: 'HPE ProLiant DL380 Gen12 8SFF High Power Chassis', type: 'Chassis', price: 4500, leadTimeDays: 18, status: 'active' },
  { id: 'sku-hpe-psu2', vendor: 'HPE', partNumber: 'P50500-B21', name: 'HPE 1600W Hot Plug Titanium Power Supply Unit', type: 'Power Supply', price: 310, leadTimeDays: 5, status: 'active' },

  // HPE Items - Server Solutions DL380a Gen11 (Accelerator Optimized)
  { id: 'sku-hpe-dl380a-g11-4dw', vendor: 'HPE', partNumber: 'P58410-B21', name: 'HPE ProLiant DL380a Gen11 4DW Double-Width GPU CTO Chassis', type: 'Chassis', price: 5600, leadTimeDays: 20, status: 'active' },
  { id: 'sku-hpe-dl380a-gpu', vendor: 'HPE', partNumber: 'P58425-B21', name: 'NVIDIA H100 NVL 80GB GPU PCIe Accelerator Card (DL380a)', type: 'Processor', price: 32500, leadTimeDays: 45, status: 'active' },
  { id: 'sku-hpe-dl380a-psu', vendor: 'HPE', partNumber: 'P58500-B21', name: 'HPE 2200W Flex Slot Double-Density Hot Plug PSU', type: 'Power Supply', price: 495, leadTimeDays: 7, status: 'active' },

  // HPE Items - Server Solutions DL380 Gen13 Preview Range (Future Roadmap)
  { id: 'sku-hpe-dl380-gen13-pref', vendor: 'HPE', partNumber: 'P70100-B21', name: 'HPE ProLiant DL380 Gen13 Enterprise Preview Chassis (Roadmap)', type: 'Chassis', price: 5900, leadTimeDays: 60, status: 'active' },
  { id: 'sku-hpe-gen13-cpu', vendor: 'HPE', partNumber: 'P70125-B21', name: 'Intel Xeon Platinum 9510 64-Core Next-Gen Processor (Gen13 Preview)', type: 'Processor', price: 6200, leadTimeDays: 60, status: 'active' },

  // HPE Items - Server Solutions DL80 Family (Gen11 & Gen12)
  { id: 'sku-hpe-dl80-g11', vendor: 'HPE', partNumber: '847285-B21', name: 'HPE ProLiant DL80 Gen11 12LFF Storage Optimizer Chassis', type: 'Chassis', price: 2950, leadTimeDays: 14, status: 'active' },
  { id: 'sku-hpe-dl80-g12', vendor: 'HPE', partNumber: 'P60120-B21', name: 'HPE ProLiant DL80 Gen12 12LFF Pro Base Chassis', type: 'Chassis', price: 3800, leadTimeDays: 20, status: 'active' },
  
  // Legacy
  { id: 'sku-18', vendor: 'HPE', partNumber: '815100-B21', name: 'Intel Xeon Gold 6130 16-Core (Legacy Gen10) - EOL', type: 'Processor', price: 1890, leadTimeDays: 45, status: 'eol' },

  // HPE Items - Storage Solutions (MSA Array System)
  { id: 'sku-hpe-msa-2060', vendor: 'HPE', partNumber: 'R0Q74A', name: 'HPE MSA 2060 LFF Array Bay Storage Chassis', type: 'Chassis', price: 6800, leadTimeDays: 15, status: 'active' },
  { id: 'sku-hpe-msa-ssd', vendor: 'HPE', partNumber: 'R0Q37A', name: 'HPE MSA 1.92TB SAS Read Intensive SFF SSD', type: 'Drive', price: 810, leadTimeDays: 8, status: 'active' },

  // HPE Items - Networking Solutions (Aruba CX Switches)
  { id: 'sku-hpe-aruba-10000', vendor: 'HPE', partNumber: 'BF100A', name: 'Aruba CX 10000 48Y6C Distributed Services Switch Chassis System', type: 'Chassis', price: 22400, leadTimeDays: 25, status: 'active' },
  { id: 'sku-hpe-aruba-transceiver', vendor: 'HPE', partNumber: '1973A', name: 'Aruba 10G SFP+ to SFP+ 3m Direct Attach Copper Cable', type: 'Network Adapter', price: 140, leadTimeDays: 2, status: 'active' },

  // Dell Items
  { id: 'sku-6', vendor: 'Dell', partNumber: '338-CHYT', name: 'Intel Xeon Gold 6430 32-Core 2.1GHz Processor (Dell Equivalent)', type: 'Processor', price: 2190, leadTimeDays: 8, status: 'active' },
  { id: 'sku-7', vendor: 'Dell', partNumber: '370-AHFF', name: 'Dell 64GB RDIMM 4800MT/s Dual Rank DDR5 memory', type: 'Memory', price: 595, leadTimeDays: 4, status: 'active' },
  { id: 'sku-8', vendor: 'Dell', partNumber: '400-BPSB', name: 'Dell 3.84TB Enterprise NVMe Read Intensive SSD SFF', type: 'Drive', price: 1190, leadTimeDays: 10, status: 'active' },
  { id: 'sku-9', vendor: 'Dell', partNumber: '210-BFXS', name: 'Dell PowerEdge R760 8SFF Motherboard & CTO ChassisBaseUnit', type: 'Chassis', price: 3250, leadTimeDays: 15, status: 'active' },
  { id: 'sku-9-24sff', vendor: 'Dell', partNumber: '210-BFXY', name: 'Dell PowerEdge R760 24SFF High Density Sourcing Chassis', type: 'Chassis', price: 4100, leadTimeDays: 16, status: 'active' },
  { id: 'sku-10', vendor: 'Dell', partNumber: '540-BCOZ', name: 'Broadcom 57414 Dual Port 10/25Gb SFP28 PCIe Adapter', type: 'Network Adapter', price: 395, leadTimeDays: 3, status: 'active' },
  { id: 'sku-dell-psu', vendor: 'Dell', partNumber: '450-ADWM', name: 'Dell Dual Hot-plug Redundant Power Supply (1+1) 1100W', type: 'Power Supply', price: 240, leadTimeDays: 4, status: 'active' },

  // Cisco Items
  { id: 'sku-11', vendor: 'Cisco', partNumber: 'UCS-CPU-I6430', name: 'UCS Intel Xeon Gold 6430 32-Core CPU', type: 'Processor', price: 2280, leadTimeDays: 10, status: 'active' },
  { id: 'sku-12', vendor: 'Cisco', partNumber: 'UCS-MR-64G2ED-E', name: 'UCS 64GB DDR5 memory module RDIMM', type: 'Memory', price: 610, leadTimeDays: 6, status: 'active' },
  { id: 'sku-13', vendor: 'Cisco', partNumber: 'N20-W6502', name: 'Cisco Nexus 93180YC-FX3 48-Port Switch Unit', type: 'Network Adapter', price: 14500, leadTimeDays: 20, status: 'active' },
  { id: 'sku-14', vendor: 'Cisco', partNumber: 'UCSC-C240-M7S', name: 'Cisco UCS C240 M7 Rack Server 2U Chassis Base', type: 'Chassis', price: 4100, leadTimeDays: 18, status: 'active' },

  // Juniper Items
  { id: 'sku-15', vendor: 'Juniper', partNumber: 'EX3400-48T', name: 'EX3400 48-port 10/100/1000BaseT Ethernet Switch', type: 'Network Adapter', price: 3800, leadTimeDays: 14, status: 'active' },
  { id: 'sku-16', vendor: 'Juniper', partNumber: 'QFX5120-48Y', name: 'QFX5120 48 Port 10G/25G high-performance switch chassis', type: 'Chassis', price: 18400, leadTimeDays: 40, status: 'active' },
  { id: 'sku-17', vendor: 'Juniper', partNumber: 'SRX300-SYS-JB', name: 'SRX300 Services Gateway with JB Care', type: 'Network Adapter', price: 950, leadTimeDays: 10, status: 'active' }
];

export const FORENSIC_ISSUES: ForensicIssue[] = [
  {
    id: 'iss-1',
    title: 'Intel Xeon 6130 End-of-Life (EOL) Sourcing Risk',
    description: 'HPE Legacy CPU (815100-B21) has reached EOL standing. Procuring this will result in grey-market parts or a 45+ day vendor lead time.',
    vendor: 'HPE',
    severity: 'critical',
    status: 'open',
    affectedItems: 1,
    suggestedAction: 'Map to modern Intel Xeon Gold 6430 32-Core (P40424-B21), saving lead time and securing fully backed factory warranty.'
  },
  {
    id: 'iss-2',
    title: 'Pricing Mismatch: Dell SFF Enterprise NVMe Quote Variance',
    description: 'Active quote for Dell 3.84TB Drive (400-BPSB) is logged in BOQ as $1,590. Our direct connected API contract rate is $1,190. $400 overcharge detected per unit.',
    vendor: 'Dell',
    severity: 'critical',
    status: 'open',
    affectedItems: 24,
    suggestedAction: 'Auto-Align local BOQ unit price to $1,190 API pricing model. Total direct savings: $9,600.'
  },
  {
    id: 'iss-3',
    title: 'Cisco Memory Layout Configuration Defect',
    description: 'Cisco UCS standard C240 configuration requests 5 memory modules. Intel Xeon 4th-Gen memory controllers operate optimally on 8-channel modules (multiples of 8 modules).',
    vendor: 'Cisco',
    severity: 'warning',
    status: 'open',
    affectedItems: 5,
    suggestedAction: 'Upgrade configuration load to 8 units of 64GB RDIMM (UCS-MR-64G2ED-E) or compress allocation to 4 standard modules to preserve dual-socket performance symmetry.'
  },
  {
    id: 'iss-4',
    title: 'Juniper API Telemetry Ingress Blocked',
    description: 'The API credentials for Juniper Networks partner portal returned a 401 Unauthorized status on the last synchronization sweep.',
    vendor: 'Juniper',
    severity: 'info',
    status: 'open',
    affectedItems: 0,
    suggestedAction: 'Re-authenticate secure partner tokens in the Integrations Gateway panel.'
  }
];

export const CATALOG_TREND = [
  { month: 'Jan', items: 10200 },
  { month: 'Feb', items: 11400 },
  { month: 'Mar', items: 12100 },
  { month: 'Apr', items: 13900 },
  { month: 'May', items: 14700 },
  { month: 'Jun', items: 15167 }
];

export const UCIDS: UCID[] = [
  {
    id: 'u1',
    displayId: 'UCID-2026-0041',
    name: 'Scale-Out Compute — 48 Node Intel Virtualisation Cluster',
    solutionName: 'North Virtualization Cluster Campaign',
    priority: 'high',
    projectRef: 'PRJ-VIRT-NORTH-2026',
    createdAt: '2026-06-01 10:24 AM',
    currentStep: 'post-intelligence',
    completedSteps: ['boq-intake', 'pre-intelligence', 'solution-design', 'vendor-provisioning'],
    syncStatus: 'Synced',
    rawBOM: 'Looking to purchase high-density dual socket servers.\nNeed 48 servers with Intel Gold 32-core CPUs.\nEach server is required to have 512GB Memory (RDIMM 4800MT/s) and at least 15TB of PCIe NVMe Solid State arrays.\nDual 25G Ethernet NIC connections required for high speed interconnect.',
    solutions: [
      {
        id: 'sol-1-hpe',
        vendor: 'HPE',
        label: 'HPE ProLiant DL380 Gen11 Alternative',
        totalPrice: 244800,
        originalPrice: 261000,
        savings: 16200,
        complianceScore: 98,
        items: [
          { id: 'bi-1', partNumber: 'P40411-B21', name: 'HPE ProLiant DL380 Gen11 8SFF Chassis', type: 'Chassis', quantity: 24, unitPrice: 3400 },
          { id: 'bi-2', partNumber: 'P40424-B21', name: 'Intel Xeon Gold 6430 32-Core 2.1GHz CPU', type: 'Processor', quantity: 48, unitPrice: 2150 },
          { id: 'bi-3', partNumber: 'P38454-B21', name: 'HPE 64GB Dual Rank DDR5-4800 RAM Module', type: 'Memory', quantity: 192, unitPrice: 580 },
          { id: 'bi-4', partNumber: 'P40483-B21', name: 'HPE 3.84TB NVMe SSD', type: 'Drive', quantity: 96, unitPrice: 1220 },
          { id: 'bi-5', partNumber: 'P40445-B21', name: 'HPE Broadcom Dual Port 10/25Gb Ethernet NIC', type: 'Network Adapter', quantity: 24, unitPrice: 410 }
        ]
      },
      {
        id: 'sol-1-dell',
        vendor: 'Dell',
        label: 'Dell PowerEdge R760 Alternative',
        totalPrice: 239630,
        originalPrice: 255200,
        savings: 15570,
        complianceScore: 96,
        items: [
          { id: 'bi-6', partNumber: '210-BFXS', name: 'Dell PowerEdge R760 8SFF Chassis', type: 'Chassis', quantity: 24, unitPrice: 3250 },
          { id: 'bi-7', partNumber: '338-CHYT', name: 'Intel Xeon Gold 6430 32-Core CPU Equiv', type: 'Processor', quantity: 48, unitPrice: 2190 },
          { id: 'bi-8', partNumber: '370-AHFF', name: 'Dell 64GB RDIMM 4800MT/s RAM', type: 'Memory', quantity: 192, unitPrice: 595 },
          { id: 'bi-9', partNumber: '400-BPSB', name: 'Dell 3.84TB NVMe SSD SFF', type: 'Drive', quantity: 96, unitPrice: 1195 },
          { id: 'bi-10', partNumber: '540-BCOZ', name: 'Broadcom Dual Port 10/25Gb SFP28 Adapter', type: 'Network Adapter', quantity: 24, unitPrice: 395 }
        ]
      }
    ],
    events: [
      { ts: '10:24:12', level: 'info', msg: 'System Ingested Raw BOQ via Email API Pipeline' },
      { ts: '10:25:30', level: 'ok', msg: 'Core constraints extracted: 48x Intel 32-Core, 512GB Memory, 15TB PCIe Storage' },
      { ts: '10:26:01', level: 'ok', msg: 'Pre-intelligence catalog matching complete.' },
      { ts: '10:30:15', level: 'ok', msg: 'Dual alternatives constructed: HPE DL380 Gen11 vs Dell R760' },
      { ts: '11:12:44', level: 'warn', msg: 'API Warning — Dell transaction endpoint returned high queue load' },
      { ts: '11:13:00', level: 'ok', msg: 'Vendor provisioning online: Contract pricing synced containing -6% discount' }
    ],
    snapshots: []
  },
  {
    id: 'u2',
    displayId: 'UCID-2026-0042',
    name: 'Object Storage Capacity — Dell Isilon Backup Archive',
    solutionName: 'East Backup Storage Consolidation',
    priority: 'critical',
    projectRef: 'PRJ-STO-BACKUP-EAST',
    createdAt: '2026-06-03 14:15 PM',
    currentStep: 'pre-intelligence',
    completedSteps: ['boq-intake'],
    syncStatus: 'Out-of-Sync',
    rawBOM: 'Procure 12x Dell high capacity nodes.\nNeed 3.84TB SSDs (at least 24 units).\nChassis must support large storage controller capabilities.',
    solutions: [
      {
        id: 'sol-2-dell',
        vendor: 'Dell',
        label: 'Dell Storage Deployment Node Config',
        totalPrice: 65110,
        originalPrice: 74700,
        savings: 9590,
        complianceScore: 92,
        items: [
          { id: 'bi-11', partNumber: '210-BFXS', name: 'Dell PowerEdge R760 8SFF Chassis', type: 'Chassis', quantity: 12, unitPrice: 3250 },
          { id: 'bi-12', partNumber: '400-BPSB', name: 'Dell 3.84TB Enterprise NVMe SSD', type: 'Drive', quantity: 24, unitPrice: 1190 }
        ]
      }
    ],
    events: [
      { ts: '14:15:32', level: 'info', msg: 'Ingested raw CSV sheet containing 2 records' },
      { ts: '14:17:11', level: 'warn', msg: 'Price mismatch detected on 24x 400-BPSB SSD storage cards. Direct API quotes $1,190 vs BOQ $1,590.' }
    ],
    snapshots: []
  },
  {
    id: 'u3',
    displayId: 'UCID-2026-0043',
    name: 'Core Spine Network — Corporate HQ DC Spine Overhaul',
    solutionName: 'HQ Spine Network Overhaul',
    priority: 'medium',
    projectRef: 'PRJ-NET-DC-SPINE',
    createdAt: '2026-06-04 09:12 AM',
    currentStep: 'boq-intake',
    completedSteps: [],
    syncStatus: 'Pending',
    rawBOM: 'Requirements: High availability networking core.\n6x Cisco Nexus Switches (93180YC-FX3 or equivalent)\nPrefer unified management modules.',
    solutions: [],
    events: [
      { ts: '09:12:00', level: 'info', msg: 'Awaiting raw list alignment parsing...' }
    ],
    snapshots: []
  },
  {
    id: 'u4',
    displayId: 'UCID-2026-0038',
    name: 'WAN Edge Firewall Redundancy — Juniper Security Gateway',
    solutionName: 'WAN Edge Security Gateway Refresh',
    priority: 'low',
    projectRef: 'PRJ-WAN-EDGE-SEC',
    createdAt: '2026-05-25 11:30 AM',
    currentStep: 'snapshot',
    completedSteps: ['boq-intake', 'pre-intelligence', 'solution-design', 'vendor-provisioning', 'post-intelligence', 'comparison'],
    syncStatus: 'Synced',
    rawBOM: 'Need 4 Juniper SRX300 firewalls for small branch offices.',
    solutions: [
      {
        id: 'sol-4-jun',
        vendor: 'Juniper',
        label: 'Juniper SRX Gateway Security Configuration',
        totalPrice: 3800,
        originalPrice: 4200,
        savings: 400,
        complianceScore: 100,
        items: [
          { id: 'bi-13', partNumber: 'SRX300-SYS-JB', name: 'SRX300 Services Gateway with Care', type: 'Network Adapter', quantity: 4, unitPrice: 950 }
        ]
      }
    ],
    events: [
      { ts: '2026-05-25 11:30', level: 'info', msg: 'Intake created.' },
      { ts: '2026-05-25 11:35', level: 'ok', msg: 'Pre-intelligence validated 4 units SRX300.' },
      { ts: '2026-05-25 13:02', level: 'ok', msg: 'Committed and locked by procurement agent.' }
    ],
    snapshots: [
      {
        id: 'snap-old-1',
        label: 'Snapshot v1.0 — Committed & Signed',
        committedAt: '2026-05-25 01:02 PM',
        winnerSolution: 'Juniper SRX Gateway Security Configuration',
        totalValue: 3800,
        notes: 'Signed contract uploaded, PO-2026-0922 issued successfully.'
      }
    ]
  }
];
