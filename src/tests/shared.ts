import type { UCID, CatalogSKU, Vendor } from '../types';

export const mockUcid: UCID = {
  id: 'u1',
  displayId: 'UCID-2026-1700',
  name: 'Test Project',
  priority: 'high',
  projectRef: 'PRJ-123',
  createdAt: '10/10/2026',
  currentStep: 'comparison',
  completedSteps: [],
  rawBOM: '',
  solutions: [
    {
      id: 's1',
      name: 'Test Solution',
      targetUcidId: 'u1',
      vendorSubmissions: [
        {
          id: 'vs1',
          label: 'HPE Config',
          vendor: 'HPE',
          originalPrice: 10000,
          totalPrice: 8000,
          savings: 2000,
          complianceScore: 100,
          configs: [
            {
              id: 'cfg1',
              name: 'Core Compute Server',
              totalPrice: 8000,
              originalPrice: 10000,
              savings: 2000,
              items: [
                { id: 'it1', partNumber: 'P40424', name: 'Server Chassis', type: 'Chassis', quantity: 1, unitPrice: 8000 }
              ]
            }
          ]
        }
      ]
    }
  ],
  events: [],
  snapshots: [],
  solutionId: "11111111-1111-1111-8111-111111111111",
  solutionDisplayId: "SOL-2026-001",
  configIndex: 1,
  configLabel: "Config 1",
  parallelGroup: null,



  syncStatus: 'Synced'
};

export const mockUcids: UCID[] = [mockUcid];

export const mockCatalogSku: CatalogSKU = {
  id: 'sku-1',
  vendor: 'HPE',
  partNumber: 'P40424',
  name: 'Server Chassis',
  type: 'Chassis',
  price: 8000,
  leadTimeDays: 7,
  status: 'active'
};

export const mockSkus: CatalogSKU[] = [mockCatalogSku];

export const mockVendors: Vendor[] = [
  { id: 'v1', name: 'Hewlett Packard Enterprise', shortName: 'HPE', status: 'connected', color: '#00A98F', catalogItems: 500, apiHealth: 100, apiEndpoint: 'https://api.hpe.com', syncInterval: 'daily', lastSync: '2026-06-20' },
  { id: 'v2', name: 'Dell Technologies', shortName: 'Dell', status: 'connected', color: '#0076CE', catalogItems: 300, apiHealth: 100, apiEndpoint: 'https://api.dell.com', syncInterval: 'daily', lastSync: '2026-06-20' },
];
