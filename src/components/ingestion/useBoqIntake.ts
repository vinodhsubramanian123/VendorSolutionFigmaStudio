import { useState } from "react";
import { useIngestionStore } from "../../store/ingestionStore";
import { apiClient } from "../../services/apiClient";
import { generateDisplayId } from "../../utils/generateDisplayId";
import type { UCID, Solution, SolutionProject } from "../../types";
import { useCoreStore } from "../../store/coreStore";
import { generateSolutionDisplayId, generateSolutionName } from "../../utils/solutionUtils";

export interface BoqResponsePayload {
  ucid: string | UCID;
  solutions?: Solution[];
  sourceFile?: string;
  parsedSummary?: {
    vendorBrand: string;
    detectedChassis: string;
    initialConfidenceScore: number;
  };
}


function getBoqDetailsText(sol: Solution): string {
  return sol.vendorSubmissions?.[0]?.configs?.[0]?.items
    ?.map((i) => ` - ${i.name} (QTY ${i.quantity} @ $${i.unitPrice})`)
    .join("\n") || "";
}

function getBoqVendorName(sol: Solution): string {
  return sol.vendorSubmissions?.[0]?.vendor || sol.name;
}

function namespaceGeneratedSolution(sol: Solution, targetUcidId: string): Solution {
  return {
    ...sol,
    targetUcidId,
    vendorSubmissions: sol.vendorSubmissions?.map((vs) => ({
      ...vs,
      configs: vs.configs?.map((cfg) => ({
        ...cfg,
        id: `cfg-${targetUcidId}-${vs.vendor}-${cfg.id}`,
        items: cfg.items.map((item) => ({ ...item })),
      })),
    })) || [],
  };
}

function buildGeneratedUcid(sol: Solution, idx: number, sourceFile: string, solutionId: string, solutionDisplayId: string): UCID {
  const displayId = generateDisplayId();
  const detailsText = getBoqDetailsText(sol);
  const vendorName = getBoqVendorName(sol);
  const ucidUuid = crypto.randomUUID();
  const generatedSolution = namespaceGeneratedSolution(sol, ucidUuid);

  return {
    id: ucidUuid,
    displayId: displayId,
    name: `Sourced ${vendorName} Alignment Config`,
    solutionName: sourceFile,
    priority: idx === 0 ? "high" : "medium",
    projectRef: "PRJ-RECON-HUB",
    createdAt: new Date().toISOString(),
    currentStep: "boq-intake",
    completedSteps: [],
    rawBOM: `Workbook parsed via central Ingestion Hub.\n\nSource sheet: ${sourceFile}\nVendor Profile: ${vendorName}\n\nComponents Detail:\n${detailsText}`,
    solutions: [
      {
        id: `sol-${displayId}-primary`,
        name: generatedSolution.name,
        targetUcidId: ucidUuid,
        vendorSubmissions: generatedSolution.vendorSubmissions,
      },
    ],
    events: [
      { timestamp: new Date().toISOString(), level: "info", msg: `Central BOQ split allocated to target container ${displayId}` },
      { timestamp: new Date().toISOString(), level: "ok", msg: `Primary spec loaded with initial compliance score and structural items.` },
    ],
    snapshots: [],
    solutionId,
    solutionDisplayId,
    configIndex: idx + 1,
    configLabel: `Config ${idx + 1}`,
    parallelGroup: null,
  };
}

export function useBoqIntake(
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>,
  setMode: (step: string) => void,
  toast: (msg: string, variant: "success" | "error" | "warn", actionText?: string, actionFn?: () => void) => void,
  setSelectedUcidId: (id: string) => void
) {
  const selectedPreset = useIngestionStore(s => s.selectedPreset);
  const setSelectedPreset = useIngestionStore(s => s.setSelectedPreset);
  const boqFile = useIngestionStore(s => s.boqFile);
  const setBoqFile = useIngestionStore(s => s.setBoqFile);
  const [isBOQIngesting, setIsBOQIngesting] = useState(false);
  const [boqProgress, setBoqProgress] = useState(0);
  const boqResponse = useIngestionStore(s => s.boqResponse);
  const setBoqResponse = useIngestionStore(s => s.setBoqResponse);
  const [boqError, setBoqError] = useState<string>("");
  const [boqJobId, setBoqJobId] = useState<string | null>(null);

  const triggerBOQParse = async (
    fileName: string,
    preset: "hpe-legacy" | "dell-overcharge" | "cisco-asymmetry",
  ) => {
    setIsBOQIngesting(true);
    setBoqProgress(10);
    setBoqError("");
    setBoqFile(fileName);

    try {
      const response = await apiClient.post<{ job_id: string }>("/api/jobs", {
        type: "ingest",
        context: { ucid: "mock-ucid", config_id: "mock-cfg", solution_id: preset },
        parent_job_id: ""
      });
      setBoqJobId(response.data.job_id);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setBoqError(errorObj.message || "Failed to start BOQ ingest job.");
      setIsBOQIngesting(false);
    }
  };

  const onJobSuccess = async (result: unknown, context: unknown) => {
      const response = await apiClient.post<BoqResponsePayload>("/api/boq/ingest", {
        fileName: boqFile,
        presetType: (context as { solution_id: string }).solution_id,
        rawText: `[Manual central upload: ${boqFile}] presetType=${(context as { solution_id: string }).solution_id}`,
      });
      const data = response.data;
      setBoqResponse(data);
      setBoqProgress(100);
      setIsBOQIngesting(false);
      setBoqJobId(null);
  };

  const onJobError = (error: string, context: unknown) => {
      setBoqError(error);
      setIsBOQIngesting(false);
      setBoqJobId(null);
  };

  const handleSplitAndProvision = () => {
    if (!boqResponse) return;

    const solutionId = crypto.randomUUID();
    const existingSolutions = useCoreStore.getState().solutions;
    const solutionDisplayId = generateSolutionDisplayId(existingSolutions);

    const generatedUcids: UCID[] = (boqResponse.solutions ?? []).map(
      (sol: Solution, idx: number) => buildGeneratedUcid(sol, idx, boqResponse.sourceFile || 'Unknown Source', solutionId, solutionDisplayId)
    );

    const newSolutionProject: SolutionProject = {
      id: solutionId,
      displayId: solutionDisplayId,
      name: generateSolutionName(boqResponse.sourceFile || boqFile || "Uploaded BOQ", "BOQ Upload", existingSolutions.map(s => s.name)),
      customerName: "Acme Corp", // Standard mock for now
      boqSourceFile: boqResponse.sourceFile || boqFile || "unknown.xlsx",
      vendor: boqResponse.solutions?.[0]?.vendorSubmissions?.[0]?.vendor || "Mixed Sourcing",
      vendorAssignments: [],
      projectRef: "PRJ-RECON-HUB",
      status: "in-progress",
      configCount: generatedUcids.length,
      ucidIds: generatedUcids.map((u) => u.id),
      activeUcidId: generatedUcids[0]?.id || null,
      crossVendorEnabled: false,
      createdAt: new Date().toISOString(),
      events: [
        {
          timestamp: new Date().toISOString(),
          level: "info",
          msg: `Solution project created from BOQ intake with ${generatedUcids.length} configurations.`,
        }
      ],
    };

    useCoreStore.getState().addSolution(newSolutionProject);

    setUcids((prev) => {
      const existingIds = prev.map((p) => p.displayId);
      const filteredGenerated = generatedUcids.filter(
        (g) => !existingIds.includes(g.displayId),
      );
      return [...filteredGenerated, ...prev];
    });

    toast(
      `Solution ${solutionDisplayId} created with ${generatedUcids.length} configuration(s) — proceed to BOM Ingestion.`,
      "success",
      "Proceed to BOM Ingestion",
      () => {
        setMode("bom");
      }
    );

    setMode("bom");
    setSelectedUcidId(generatedUcids[0]?.id || "u1");
  };

  return {
    selectedPreset,
    setSelectedPreset,
    boqFile,
    isBOQIngesting,
    boqProgress,
    boqResponse,
    boqError,
    boqJobId,
    triggerBOQParse,
    onJobSuccess,
    onJobError,
    handleSplitAndProvision,
  };
}
