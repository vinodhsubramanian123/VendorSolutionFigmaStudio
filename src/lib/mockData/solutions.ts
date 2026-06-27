import { SolutionProject } from '../../types';

export const SOLUTIONS: SolutionProject[] = [
  {
    id: 'sol-ylng-2026-001',
    displayId: 'SOL-2026-001',
    name: 'YLNG-Balhaf-2026',
    customerName: 'Yemen LNG',
    boqSourceFile: 'YLNG_Server_BOQ_v3.xlsx',
    vendor: 'HPE',
    vendorAssignments: [
      {
        id: 'va-ylng-01',
        vendor: 'HPE',
        configIndices: [1, 2],
        ucidIds: ['u1', 'u2'],
        isPrimary: true,
        addedAt: '2026-06-17T10:00:00.000Z'
      }
    ],
    projectRef: 'SAP-OPP-2026-8847',
    status: 'in-progress',
    configCount: 2,
    ucidIds: ['u1', 'u2'], // These map to existing UCIDs in mock data
    activeUcidId: 'u1',
    crossVendorEnabled: false,
    createdAt: '2026-06-17T10:00:00.000Z',
    events: []
  },
  {
    id: 'sol-db-2026-002',
    displayId: 'SOL-2026-002',
    name: 'DB-Cluster-2026',
    customerName: 'Global Finance',
    boqSourceFile: 'DB_Cluster_Req.xlsx',
    vendor: 'Dell',
    vendorAssignments: [
      {
        id: 'va-db-01',
        vendor: 'Dell',
        configIndices: [1],
        ucidIds: ['u3'],
        isPrimary: true,
        addedAt: '2026-06-18T14:30:00.000Z'
      }
    ],
    projectRef: 'SAP-OPP-2026-9901',
    status: 'draft',
    configCount: 1,
    ucidIds: ['u3'], // Maps to u3
    activeUcidId: 'u3',
    crossVendorEnabled: false,
    createdAt: '2026-06-18T14:30:00.000Z',
    events: []
  },
  {
    id: 'sol-wan-2026-003',
    displayId: 'SOL-2026-003',
    name: 'WAN-Edge-Security-2026',
    customerName: 'Branch Networks',
    boqSourceFile: 'WAN_Firewall_BOQ.xlsx',
    vendor: 'Juniper',
    vendorAssignments: [
      {
        id: 'va-wan-01',
        vendor: 'Juniper',
        configIndices: [1],
        ucidIds: ['u4'],
        isPrimary: true,
        addedAt: '2026-05-25T11:30:00.000Z'
      }
    ],
    projectRef: 'PRJ-WAN-EDGE-SEC',
    status: 'completed',
    configCount: 1,
    ucidIds: ['u4'],
    activeUcidId: 'u4',
    crossVendorEnabled: false,
    createdAt: '2026-05-25T11:30:00.000Z',
    events: []
  }
];
