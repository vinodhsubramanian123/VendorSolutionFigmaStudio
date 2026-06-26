import {  UCID} from '../../types';
export const mockUcidsNetworkingSecurity: UCID[] = [
  {
    id: "u3",
    displayId: "UCID-2026-0043",
    name: "Core Spine Network — Corporate HQ DC Spine Overhaul",
    solutionName: "HQ Spine Network Overhaul",
    priority: "medium",
    projectRef: "PRJ-NET-DC-SPINE",
    createdAt: "2026-06-04 09:12 AM",
    currentStep: "boq-intake",
    completedSteps: [],
    syncStatus: "Pending",

    solutionId: "22222222-2222-2222-8222-222222222222",
    solutionDisplayId: "SOL-2026-002",
    configIndex: 1,
    configLabel: "Spine Network Config",
    parallelGroup: null,
    rawBOM:
      "Requirements: High availability networking core.\n6x Cisco Nexus Switches (93180YC-FX3 or equivalent)\nPrefer unified management modules.",
    solutions: [],
    events: [
      {
        timestamp: "2026-06-04T09:12:00Z",
        level: "info",
        msg: "Awaiting raw list alignment parsing...",
      },
    ],
    snapshots: [],

  },
  {
    id: "u4",
    displayId: "UCID-2026-0038",
    name: "WAN Edge Firewall Redundancy — Juniper Security Gateway",
    solutionName: "WAN Edge Security Gateway Refresh",
    priority: "low",
    projectRef: "PRJ-WAN-EDGE-SEC",
    createdAt: "2026-05-25 11:30 AM",
    currentStep: "snapshot",
    completedSteps: [
      "boq-intake",
      "pre-intelligence",
      "solution-design",
      "vendor-provisioning",
      "post-intelligence",
      "comparison",
    ],
    syncStatus: "Synced",

    solutionId: "33333333-3333-3333-8333-333333333333",
    solutionDisplayId: "SOL-2026-003",
    configIndex: 1,
    configLabel: "Security Gateway Config",
    parallelGroup: null,
    rawBOM: "Need 4 Juniper SRX300 firewalls for small branch offices.",
    solutions: [
      {
        id: "sol-master-u4",
        name: "Master Architectural Solution",
        targetUcidId: "u4",
        vendorSubmissions: [
          {
            id: "vs-u4-jun",
            vendor: "Juniper",
            label: "Juniper SRX Gateway Security Configuration",
            totalPrice: 3800,
            originalPrice: 4200,
            savings: 400,
            complianceScore: 100,
            configs: [
              {
                id: "cfg-u4-jun-1",
                name: "Juniper Routing Config",
                totalPrice: 3800,
                originalPrice: 4200,
                savings: 400,
                items: [
                  {
                    id: "bi-13",
                    partNumber: "SRX300-SYS-JB",
                    name: "SRX300 Services Gateway with Care",
                    type: "Network Adapter",
                    quantity: 4,
                    unitPrice: 950,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    events: [
      { timestamp: "2026-05-25T11:30:00Z", level: "info", msg: "Intake created." },
      {
        timestamp: "2026-05-25T11:35:00Z",
        level: "ok",
        msg: "Pre-intelligence validated 4 units SRX300.",
      },
      {
        timestamp: "2026-05-25T13:02:00Z",
        level: "ok",
        msg: "Committed and locked by procurement agent.",
      },
    ],
    snapshots: [
      {
        id: "snap-old-1",
        label: "Snapshot v1.0 — Committed & Signed",
        committedAt: "2026-05-25T13:02:00.000Z",
        winnerSolution: "Juniper SRX Gateway Security Configuration",
        totalValue: 3800,
        notes: "Signed contract uploaded, PO-2026-0922 issued successfully.",
        version: 1,
        timestamp: "2026-05-25T13:02:00.000Z",
        locked: true,
        payload: [
          {
            id: "sol-master-u4",
            name: "Master Architectural Solution",
            targetUcidId: "u4",
            vendorSubmissions: [
              {
                id: "vs-u4-jun",
                vendor: "Juniper",
                label: "Juniper SRX Gateway Security Configuration",
                totalPrice: 3800,
                originalPrice: 4200,
                savings: 400,
                complianceScore: 100,
                configs: [
                  {
                    id: "cfg-u4-jun-1",
                    name: "Juniper Routing Config",
                    totalPrice: 3800,
                    originalPrice: 4200,
                    savings: 400,
                    items: [
                      {
                        id: "bi-13",
                        partNumber: "SRX300-SYS-JB",
                        name: "SRX300 Services Gateway with Care",
                        type: "Network Adapter",
                        quantity: 4,
                        unitPrice: 950,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        bomSnapshot: [
          {
            id: "cfg-u4-jun-1",
            name: "Juniper Routing Config",
            totalPrice: 3800,
            originalPrice: 4200,
            savings: 400,
            items: [
              {
                id: "bi-13",
                partNumber: "SRX300-SYS-JB",
                name: "SRX300 Services Gateway with Care",
                type: "Network Adapter",
                quantity: 4,
                unitPrice: 950,
              },
            ],
          },
        ],
      },
    ],
  },
];