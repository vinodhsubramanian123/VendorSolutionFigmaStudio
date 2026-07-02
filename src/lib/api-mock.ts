import { CatalogSKU, Config, Snapshot } from "../types";
import { GraphNode, GraphEdge, GraphAPIResponse } from "../types/data";

// Simulated backend store for rules and manual links
const serverState = {
  customRules: {} as Record<string, {type: "requires"|"exclusive", note: string}[]>,
  manualLinks: [] as {childId: string, parentId: string, childInfo: { partNumber: string; name: string }}[],
  snapshots: [] as Snapshot[]
};

// NOTE: catalog data is intentionally NOT held here. coreStore.ts is the
// single source of truth for the catalog (see docs/architecture/data-ownership.md).
// This used to have its own 2-SKU serverState.catalog with ids that never
// matched the real 38-SKU catalog seeded into coreStore — every real edit
// made through CatalogManager.tsx silently rolled back because
// updateCatalogSku() could never find the id it was looking for. These
// handlers are now stateless pass-throughs: nothing in the UI reads
// GET /api/catalog's response (the catalog list always comes from
// useCoreStore(s => s.catalogSkus)), so there is nothing to keep in sync.
export const MockCatalogApi = {
  getCatalog: async (): Promise<CatalogSKU[]> => {
    return [];
  },
  addCatalogSku: async (sku: CatalogSKU): Promise<CatalogSKU> => {
    return sku;
  },
  updateCatalogSku: async (id: string, updates: Partial<CatalogSKU>): Promise<Partial<CatalogSKU> & { id: string }> => {
    return { id, ...updates };
  },
  deleteCatalogSku: async (_id: string): Promise<void> => {
    return;
  }
};

export const MockSnapshotApi = {
  getSnapshots: async (): Promise<Snapshot[]> => {
    return [...serverState.snapshots];
  },
  addSnapshot: async (snapshot: Snapshot): Promise<Snapshot> => {
    serverState.snapshots.push(snapshot);
    return snapshot;
  },
  deleteSnapshot: async (id: string): Promise<void> => {
    const idx = serverState.snapshots.findIndex(s => s.id === id);
    if (idx !== -1) {
      serverState.snapshots.splice(idx, 1);
    }
  }
};

export const MockTaxonomyApi = {
  // Simulates fetching the taxonomy graph for a specific configuration
  getGraphForConfig: async (
    config: Config,
    allSkus: CatalogSKU[],
    vendor?: string
  ): Promise<GraphAPIResponse> => {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const unmappedIds: string[] = [];

    // Realistic Sample Data for demonstration
        const sampleBoqItems = [
          { type: 'Server', partNumber: 'P73282-B21', name: 'HPE ProLiant Compute DL380 Gen12 SFF NC Configure-to-order Server' },
          { type: 'Processor', partNumber: 'P73829-B21', name: 'Intel Xeon 6740P 2.1GHz 48-core 270W Processor for HPE' },
          { type: 'Memory', partNumber: 'P69730-B21', name: 'HPE 128GB (1x128GB) Dual Rank x4 DDR5-6400 EC8 Registered Smart Memory Kit' },
          { type: 'Chassis Option', partNumber: 'P75740-B21', name: 'HPE ProLiant Compute DL3XX Gen12 8SFF x1 U.3 Tri-Mode Drive Cage Kit' },
          { type: 'Storage', partNumber: 'P40508-B21', name: 'HPE 3.84TB SAS 12G RI SFF BC Value SAS SSD' },
          { type: 'Storage', partNumber: 'P40430-B21', name: 'HPE 300GB SAS 12G MC 10K SFF BC HDD' },
          { type: 'Storage', partNumber: 'P28352-B21', name: 'HPE 2.4TB SAS 12G MC 10K SFF BC 512e HDD' },
          { type: 'Controller', partNumber: 'P47777-B21', name: 'HPE MR416i-p Gen11 x16 Lanes 8GB Cache PCI SPDM Plugin Storage Controller' },
          { type: 'Network', partNumber: 'R2E09A', name: 'HPE SN1610Q 32Gb 2-port Fibre Channel Host Bus Adapter' },
          { type: 'Network', partNumber: 'S4S01A', name: 'HPE SN1620E 32Gb 2p FC SecureHBA' },
          { type: 'Power', partNumber: 'P38997-B21', name: 'HPE 1600W Flex Slot Platinum Hot Plug Low Halogen Power Supply Kit' },
          { type: 'Cooling', partNumber: 'P48820-B21', name: 'HPE ProLiant DL380/DL560 Gen11 2U High Performance Fan Kit' },
          // Items that intelligence engine might fail to auto-map due to ambiguity or bad descriptions
          { type: 'Unknown', partNumber: '845398-B21', name: 'HPE 25Gb SFP28 SR 100m Transceiver' },
          { type: 'Unknown', partNumber: 'P35876-B21', name: 'HPE CE Mark Removal FIO Enablement Kit' },
          { type: 'Unknown', partNumber: 'P01366-B21', name: 'HPE 96W Smart Storage Lithium-ion Battery with 145mm Cable Kit' }
        ];

        // 1. Root Product node
        // In real backend, determine base server config
        const baseServer = sampleBoqItems.find(i => i.type === 'Server');
        const prodId = config.id || "cfg-base";
        
        nodes.push({
          id: prodId,
          type: "product",
          label: baseServer?.partNumber || "System Base",
          sublabel: baseServer?.name || "Target System Configuration",
          constraints: ["Max 1 Base System per atomic config"],
          dependencies: []
        });

        // Add standard structural layers dynamically
        const categories = [...new Set(sampleBoqItems.filter(i => i.type !== 'Server' && i.type !== 'Unknown').map(i => i.type))];
        
        categories.forEach(cat => {
          const catId = `${prodId}-${cat}`;
          nodes.push({
            id: catId,
            type: "category",
            label: `${cat} Subsystem`,
            sublabel: "Functional Group",
          });
          edges.push({ id: `e-${prodId}-${catId}`, source: prodId, target: catId, relationship: "contains" });

          // Map items into this category
          const items = sampleBoqItems.filter(i => i.type === cat);
          items.forEach((item, idx) => {
            const skuRules = serverState.customRules[item.partNumber] || [];
            const overrides = skuRules.map(r => r.note);

            nodes.push({
              id: item.partNumber,
              type: "sku",
              label: item.partNumber,
              sublabel: item.name,
              constraints: [`Component of ${cat}`, ...overrides],
              dependencies: ["System Integrity"]
            });
            edges.push({ id: `e-${catId}-${item.partNumber}`, source: catId, target: item.partNumber, relationship: "requires" });
          });
        });

        // Add manually mapped links
        serverState.manualLinks.forEach(link => {
          const rules = serverState.customRules[link.childId] || [];
          if (!nodes.find(n => n.id === link.childId)) {
            nodes.push({
              id: link.childId,
              type: "sku",
              label: link.childInfo.partNumber || link.childId,
              sublabel: "Mapped via Intelligence GUI",
              constraints: ["Manually Assigned Overrides", ...rules.map(r => r.note)],
              dependencies: ["Graph Integrity Verified"]
            });
          }
          if (!edges.find(e => e.id === `e-${link.parentId}-${link.childId}`)) {
            edges.push({
              id: `e-${link.parentId}-${link.childId}`,
              source: link.parentId,
              target: link.childId,
              relationship: "contains"
            });
          }
        });

        // Unmapped items
        const unmapped = sampleBoqItems.filter(i => i.type === 'Unknown' && !serverState.manualLinks.some(l => l.childId === i.partNumber));
        unmapped.forEach(u => unmappedIds.push(u.partNumber));

        return { nodes, edges, unmappedIds };
  },

  // CRUD endpoints for manual operations
  mapOrphanNode: async (payload: { childId: string, parentId: string, childInfo: { partNumber: string; name: string } }) => {
    serverState.manualLinks.push(payload);
    return { success: true };
  },

  unmapNode: async (childId: string) => {
    serverState.manualLinks = serverState.manualLinks.filter(l => l.childId !== childId);
    return { success: true };
  },

  addRule: async (nodeId: string, type: "requires"|"exclusive", note: string) => {
    if (!serverState.customRules[nodeId]) {
      serverState.customRules[nodeId] = [];
    }
    serverState.customRules[nodeId].push({ type, note });
    return { success: true };
  }
};

export const MockSolutionApi = {
  getSolutionBuilderInit: async () => {
    return {
          ucidsList: [
            {
              id: 'UCID-2026-1699',
              name: 'Primary deployment',
              reasoning: 'Selected HPE architecture to leverage pre-negotiated volume agreement.',
              locked: false,
              syncStatus: 'Synced'
            }
          ],
          configs: [
            {
              id: 'cfg-1',
              name: 'Primary Compute Node - DL380',
              targetUcidId: 'UCID-2026-1699',
              vendor: "HPE",
              totalPrice: 244800,
              originalPrice: 261000,
              items: [
                { id: 'bi-1', partNumber: 'P40411-B21', name: 'HPE ProLiant DL380 Gen11 8SFF Chassis', type: 'Chassis', quantity: 24, unitPrice: 3400 },
                { id: 'bi-2', partNumber: 'P40424-B21', name: 'Intel Xeon Gold 6430 32-Core CPU', type: 'Processor', quantity: 48, unitPrice: 2150 },
                { id: 'bi-3', partNumber: 'P38454-B21', name: 'HPE 64GB Dual Rank DDR5-4800 Memory', type: 'Memory', quantity: 192, unitPrice: 580 },
                { id: 'bi-4', partNumber: 'P40483-B21', name: 'HPE 3.84TB NVMe SSD SFF', type: 'Drive', quantity: 96, unitPrice: 1220 }
              ]
            },
            {
              id: 'cfg-2',
              name: 'Database Core - PowerEdge',
              targetUcidId: 'UCID-2026-1699',
              vendor: "Dell",
              totalPrice: 165200,
              originalPrice: 179000,
              items: [
                { id: 'bi-15', partNumber: '210-BFXS', name: 'Dell PowerEdge R760 8SFF Chassis', type: 'Chassis', quantity: 16, unitPrice: 3250 },
                { id: 'bi-16', partNumber: '338-CHYT', name: 'Intel Xeon Gold 6430 CPU Dell Equivalent', type: 'Processor', quantity: 32, unitPrice: 2190 },
                { id: 'bi-17', partNumber: '370-AHFF', name: 'Dell 64GB RDIMM 4800MT/s RAM module', type: 'Memory', quantity: 128, unitPrice: 595 }
              ]
            },
            {
              id: 'cfg-3',
              name: 'Edge Switch Overhaul',
              targetUcidId: 'UCID-2026-1699',
              vendor: 'Cisco',
              totalPrice: 108000,
              originalPrice: 115000,
              items: [
                { id: 'bi-20', partNumber: 'UCSC-C240-M7S', name: 'Cisco UCS C240 M7 Rack Server Chassis', type: 'Chassis', quantity: 12, unitPrice: 4100 },
                { id: 'bi-21', partNumber: 'UCS-CPU-I6430', name: 'UCS Intel Xeon Gold 6430 32-Core CPU', type: 'Processor', quantity: 24, unitPrice: 2280 },
                { id: 'bi-22', partNumber: 'UCS-MR-64G2ED-E', name: 'UCS 64GB DDR5 memory module RDIMM', type: 'Memory', quantity: 96, unitPrice: 610 }
              ]
            }
          ]
        };
  }
};
