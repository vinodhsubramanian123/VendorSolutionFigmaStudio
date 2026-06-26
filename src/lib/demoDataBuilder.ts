import type { Solution } from "../types";

export function generateDefaultSolutions(targetUcidId: string): Solution[] {
  return [
    {
      id: "sol-sub-hpe",
      name: "HPE Premium Architected Solution DL380 Gen11",
      targetUcidId,
      vendorSubmissions: [
        {
          id: "vs-sub-hpe",
          vendor: "HPE",
          label: "HPE Premium Architected Solution DL380 Gen11",
          totalPrice: 184500,
          originalPrice: 198000,
          savings: 13500,
          complianceScore: 99,
          configs: [
            {
              id: "cfg-sub-hpe",
              name: "Compute Cluster",
              totalPrice: 184500,
              originalPrice: 198000,
              savings: 13500,
              items: [
                {
                  id: "bi-s1",
                  partNumber: "P40411-B21",
                  name: "HPE ProLiant DL380 Gen11 Chassis",
                  type: "Chassis",
                  quantity: 10,
                  unitPrice: 3400,
                },
                {
                  id: "bi-s2",
                  partNumber: "P40424-B21",
                  name: "Intel Xeon Gold 6430 32-Core CPU",
                  type: "Processor",
                  quantity: 20,
                  unitPrice: 2150,
                },
                {
                  id: "bi-s3",
                  partNumber: "P38454-B21",
                  name: "HPE 64GB DDR5-4800 RAM Module",
                  type: "Memory",
                  quantity: 80,
                  unitPrice: 580,
                },
                {
                  id: "bi-s4",
                  partNumber: "P40483-B21",
                  name: "HPE 3.84TB NVMe SSD SFF",
                  type: "Drive",
                  quantity: 40,
                  unitPrice: 1220,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "sol-sub-dell",
      name: "Dell PowerEdge Economical Solution R760",
      targetUcidId,
      vendorSubmissions: [
        {
          id: "vs-sub-dell",
          vendor: "Dell",
          label: "Dell PowerEdge Economical Solution R760",
          totalPrice: 179450,
          originalPrice: 192000,
          savings: 12550,
          complianceScore: 95,
          configs: [
            {
              id: "cfg-sub-dell",
              name: "Compute Cluster",
              totalPrice: 179450,
              originalPrice: 192000,
              savings: 12550,
              items: [
                {
                  id: "bi-s5",
                  partNumber: "210-BFXS",
                  name: "Dell PowerEdge R760 8SFF Chassis",
                  type: "Chassis",
                  quantity: 10,
                  unitPrice: 3250,
                },
                {
                  id: "bi-s6",
                  partNumber: "338-CHYT",
                  name: "Intel Xeon Gold 6430 CPU Dell Equivalent",
                  type: "Processor",
                  quantity: 20,
                  unitPrice: 2190,
                },
                {
                  id: "bi-s7",
                  partNumber: "370-AHFF",
                  name: "Dell 64GB DDR5 RDIMM Memory",
                  type: "Memory",
                  quantity: 80,
                  unitPrice: 595,
                },
                {
                  id: "bi-s8",
                  partNumber: "400-BPSB",
                  name: "Dell 3.84TB NVMe SSD Carrier",
                  type: "Drive",
                  quantity: 40,
                  unitPrice: 1195,
                },
              ],
            },
          ],
        },
      ],
    },
  ];
}
