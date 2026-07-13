import { Router } from "express";
import crypto from "crypto";
import { validateBody } from "../middleware/validateBody";
import { IngestRequestSchema } from "../../src/types/zodSchemas";
import type { IngestRequest, IngestResponse } from "../../src/types/data";
import type { CatalogItemType } from "../../src/types/schemas/schemaCatalog";

export const boqRouter = Router();

/**
 * Shape of the mock solution objects built inline per presetType branch
 * below. Local to this route -- not the same concept as SolutionProject or
 * the client-side Solution type, just what this mock endpoint fabricates
 * before reshaping it into the IngestResponse.ucid.solutions contract.
 */
interface MockIngestSolution {
  id: string;
  vendor: string;
  label: string;
  totalPrice: number;
  originalPrice: number;
  savings: number;
  complianceScore: number;
  items: Array<{
    id: string;
    partNumber: string;
    name: string;
    type: CatalogItemType;
    quantity: number;
    unitPrice: number;
  }>;
}

// REST API: Endpoint 1: Smart Ingestion & Workbook Splitter
  boqRouter.post("/api/boq/ingest", validateBody(IngestRequestSchema), (req, res) => {
    const { fileName, presetType, rawText }: IngestRequest = req.body;

    // Dynamic mock response generations mapping specific rules to prevent guessing
    let vendor = "HPE";
    let detectedChassis: string;
    let confidence = 78;
    let solutions: MockIngestSolution[] = [];

    if (presetType === "hpe-legacy") {
      detectedChassis = "P40411-B21 DL380 Gen11 NC SFF";
      solutions = [
        {
          id: "sol-api-hpe-legacy",
          vendor: "HPE",
          label: `HPE Enterprise Solution (Validated Ingestion: ${fileName})`,
          totalPrice: 118200,
          originalPrice: 125000,
          savings: 6800,
          complianceScore: 78,
          items: [
            { id: "item-api-h1", partNumber: "P40411-B21", name: "HPE ProLiant DL380 Gen11 CTO Chassis Chassis", type: "Chassis", quantity: 10, unitPrice: 3400 },
            { id: "item-api-h2", partNumber: "815100-B21", name: "Intel Xeon Gold 6130 Processor [EOL Sourcing Risk]", type: "Processor", quantity: 20, unitPrice: 1890 },
            { id: "item-api-h3", partNumber: "P38454-B21", name: "HPE 64GB DDR5 memory module RDIMM", type: "Memory", quantity: 80, unitPrice: 580 }
          ]
        },
        {
          id: "sol-api-dell-alternative",
          vendor: "Dell",
          label: "Dell Clean Alternative (Peer Modern Alignment Option)",
          totalPrice: 120100,
          originalPrice: 125200,
          savings: 5100,
          complianceScore: 98,
          items: [
            { id: "item-api-d1", partNumber: "210-BFXS", name: "Dell PowerEdge R760 8SFF Chassis", type: "Chassis", quantity: 10, unitPrice: 3250 },
            { id: "item-api-d2", partNumber: "338-CHYT", name: "Intel Xeon Gold 6430 32-Core CPU", type: "Processor", quantity: 20, unitPrice: 2190 },
            { id: "item-api-d3", partNumber: "370-AHFF", name: "Dell 64GB RDIMM 4800MT/s RAM", type: "Memory", quantity: 40, unitPrice: 595 }
          ]
        }
      ];
    } else if (presetType === "dell-overcharge") {
      vendor = "Dell";
      detectedChassis = "210-BFXS PowerEdge R760 SFF";
      confidence = 85;
      solutions = [
        {
          id: "sol-api-dell-overcharge",
          vendor: "Dell",
          label: `Dell Portal Bid (Validated Ingestion: ${fileName})`,
          totalPrice: 105720,
          originalPrice: 115000,
          savings: 9280,
          complianceScore: 85,
          items: [
            { id: "item-api-de1", partNumber: "210-BFXS", name: "Dell PowerEdge R760 8SFF Chassis Base Unit", type: "Chassis", quantity: 12, unitPrice: 3250 },
            { id: "item-api-de2", partNumber: "400-BPSB", name: "Dell 3.84TB SAS Read Intensive SSD SFF [Markup Variance Detected]", type: "Drive", quantity: 24, unitPrice: 1590 },
            { id: "item-api-de3", partNumber: "370-AHFF", name: "Dell 64GB RDIMM 4800MT/s memory module", type: "Memory", quantity: 48, unitPrice: 595 }
          ]
        },
        {
          id: "sol-api-hpe-alternative",
          vendor: "HPE",
          label: "HPE Clean Alternative (Peer Baseline Modern Alignment)",
          totalPrice: 98160,
          originalPrice: 110000,
          savings: 11840,
          complianceScore: 98,
          items: [
            { id: "item-api-h1", partNumber: "P40411-B21", name: "HPE ProLiant DL380 Gen11 8SFF Chassis", type: "Chassis", quantity: 12, unitPrice: 3400 },
            { id: "item-api-h2", partNumber: "P40483-B21", name: "HPE 3.84TB NVMe SSD Sourced", type: "Drive", quantity: 24, unitPrice: 1220 },
            { id: "item-api-h3", partNumber: "P38454-B21", name: "HPE 64GB Dual Rank DDR5 module", type: "Memory", quantity: 48, unitPrice: 580 }
          ]
        }
      ];
    } else if (presetType === "divergence-split") {
      detectedChassis = "P40411-B21 DL380 Gen11 NC SFF (Split Config)";
      confidence = 94;
      solutions = [
        {
          id: "sol-api-split-demo",
          vendor: "HPE",
          label: `HPE Split Solution (Validated Ingestion: ${fileName})`,
          totalPrice: 198000,
          originalPrice: 205000,
          savings: 7000,
          complianceScore: 100,
          items: [
            { id: "item-api-sp1", partNumber: "P40411-B21", name: "HPE ProLiant DL380 Gen11 CTO Chassis", type: "Chassis", quantity: 22, unitPrice: 3400 },
            { id: "item-api-sp2", partNumber: "P40424-B21", name: "Intel Xeon Gold 6430 32-Core CPU", type: "Processor", quantity: 44, unitPrice: 2100 },
            { id: "item-api-sp3", partNumber: "P38454-B21", name: "HPE 64GB DDR5 memory module RDIMM", type: "Memory", quantity: 176, unitPrice: 580 },
            { id: "item-api-sp4", partNumber: "J9151E", name: "HPE Aruba 10G SFP+ LC LR 10km SMF Transceiver [Config Delta]", type: "Network", quantity: 10, unitPrice: 850 }
          ]
        }
      ];
    } else {
      vendor = "Cisco";
      detectedChassis = "UCSC-C240-M7S UCS C240 M7 Rack";
      confidence = 82;
      solutions = [
        {
          id: "sol-api-cisco-asymmetric",
          vendor: "Cisco",
          label: `Cisco Matrix Bid (Validated Ingestion: ${fileName})`,
          totalPrice: 140520,
          originalPrice: 148000,
          savings: 7480,
          complianceScore: 82,
          items: [
            { id: "item-api-c1", partNumber: "UCSC-C240-M7S", name: "Cisco UCS C240 M7 Rack Server Chassis", type: "Chassis", quantity: 12, unitPrice: 4100 },
            { id: "item-api-c2", partNumber: "UCS-CPU-I6430", name: "UCS Intel Xeon Gold 6430 32-Core CPU", type: "Processor", quantity: 24, unitPrice: 2280 },
            { id: "item-api-c3", partNumber: "UCS-MR-64G2ED-E", name: "UCS 64GB DDR5 memory module [Asymmetric Layout - Qty 5 per node]", type: "Memory", quantity: 60, unitPrice: 610 }
          ]
        },
        {
          id: "sol-api-dell-alternative-c",
          vendor: "Dell",
          label: "Dell Symmetrical Alternative Layout",
          totalPrice: 138000,
          originalPrice: 145000,
          savings: 7000,
          complianceScore: 98,
          items: [
            { id: "item-api-cd1", partNumber: "210-BFXS", name: "Dell PowerEdge R760 8SFF Chassis", type: "Chassis", quantity: 12, unitPrice: 3250 },
            { id: "item-api-cd2", partNumber: "338-CHYT", name: "Intel Xeon Gold 6430 32-Core CPU", type: "Processor", quantity: 24, unitPrice: 2190 },
            { id: "item-api-cd3", partNumber: "370-AHFF", name: "Dell 64GB RDIMM 4800MT/s RAM (Optimized Symmetrical 8 per node)", type: "Memory", quantity: 96, unitPrice: 595 }
          ]
        }
      ];
    }

    // Build a full UCID object as required by the IngestResponse contract
    const timestampMs = Date.now();
    const ucidId = "ucid_api_session_uuid_" + timestampMs.toString(16);
    const displayId = "UCID-2026-" + (timestampMs % 10000).toString().padStart(4, "0");

    const response: IngestResponse = {
      success: true,
      message: "Sheet workbook parsed successfully across supplier heuristic rules.",
      sourceFile: fileName,
      ucid: {
        id: ucidId,
        displayId: displayId,
        name: `${vendor} Configuration — ${fileName}`,
        priority: "high",
        projectRef: "PRJ-INGEST-API",
        createdAt: new Date().toISOString(),
        currentStep: "solution-design",
        completedSteps: ["boq-intake", "pre-intelligence"],
        rawBOM: rawText || `Ingested from ${fileName}`,
        solutionId: crypto.randomUUID(),
        solutionDisplayId: `SOL-2026-${(timestampMs % 1000).toString().padStart(3, "0")}`,
        configIndex: 1,
        configLabel: "API Config",
        parallelGroup: null,
        solutions: solutions.map((sol) => ({
          id: sol.id,
          name: sol.label || sol.vendor + " Solution",
          targetUcidId: ucidId,
          vendorSubmissions: [{
            id: "vs-" + sol.id,
            vendor: sol.vendor,
            label: sol.label,
            totalPrice: sol.totalPrice,
            originalPrice: sol.originalPrice,
            savings: sol.savings,
            complianceScore: sol.complianceScore,
            configs: [{
              id: "cfg-" + sol.id,
              name: sol.label || sol.vendor + " Config",
              totalPrice: sol.totalPrice,
              originalPrice: sol.originalPrice,
              savings: sol.savings,
              items: sol.items
            }]
          }]
        })),
        events: [
          { timestamp: new Date().toISOString(), level: "info" as const, msg: `Ingestion triggered for file: ${fileName}` },
          { timestamp: new Date().toISOString(), level: "ok" as const, msg: `Workbook processed. Confidence: ${confidence}%` }
        ],
        snapshots: []
      },
      timestamp: new Date().toISOString(),
      parsedSummary: {
        vendorBrand: vendor,
        detectedChassis: detectedChassis,
        itemsCount: solutions[0]?.items?.reduce((cur: number, i) => cur + i.quantity, 0) || 5,
        initialConfidenceScore: confidence
      },
    };

    res.status(200).json(response);

  });
