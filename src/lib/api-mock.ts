import { CatalogSKU, Config } from "../types";

export interface TaxonomyGraphNode {
  id: string;
  type: "product" | "subproduct" | "category" | "subcategory" | "sku";
  label: string;
  sublabel?: string;
  constraints?: string[];
  dependencies?: string[];
}

export interface TaxonomyGraphEdge {
  id: string;
  from: string;
  to: string;
  type: "contains" | "requires" | "exclusive";
}

export interface TaxonomyGraphPayload {
  nodes: TaxonomyGraphNode[];
  edges: TaxonomyGraphEdge[];
  unmappedIds: string[];
}

// Simulated backend store for rules and manual links
const serverState = {
  customRules: {} as Record<string, {type: "requires"|"exclusive", note: string}[]>,
  manualLinks: [] as {childId: string, parentId: string, childInfo: any}[]
};

export const MockTaxonomyApi = {
  // Simulates fetching the taxonomy graph for a specific configuration
  getGraphForConfig: async (
    config: Config,
    allSkus: CatalogSKU[],
    vendor?: string
  ): Promise<TaxonomyGraphPayload> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nodes: TaxonomyGraphNode[] = [];
        const edges: TaxonomyGraphEdge[] = [];
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
          edges.push({ id: `e-${prodId}-${catId}`, from: prodId, to: catId, type: "contains" });

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
            edges.push({ id: `e-${catId}-${item.partNumber}`, from: catId, to: item.partNumber, type: "requires" });
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
              from: link.parentId,
              to: link.childId,
              type: "contains"
            });
          }
        });

        // Unmapped items
        const unmapped = sampleBoqItems.filter(i => i.type === 'Unknown' && !serverState.manualLinks.some(l => l.childId === i.partNumber));
        unmapped.forEach(u => unmappedIds.push(u.partNumber));

        resolve({ nodes, edges, unmappedIds });
      }, 700); // 700ms latency simulation
    });
  },

  // CRUD endpoints for manual operations
  mapOrphanNode: async (payload: { childId: string, parentId: string, childInfo: any }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        serverState.manualLinks.push(payload);
        resolve({ success: true });
      }, 300);
    });
  },

  unmapNode: async (childId: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        serverState.manualLinks = serverState.manualLinks.filter(l => l.childId !== childId);
        resolve({ success: true });
      }, 300);
    });
  },

  addRule: async (nodeId: string, type: "requires"|"exclusive", note: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!serverState.customRules[nodeId]) {
          serverState.customRules[nodeId] = [];
        }
        serverState.customRules[nodeId].push({ type, note });
        resolve({ success: true });
      }, 300);
    });
  }
};
