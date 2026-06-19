import { useState } from "react";
import { useLocalStorageState } from "../../hooks/useLocalStorageState";
import { apiClient } from "../../services/apiClient";
import { generateDisplayId } from "../../utils/generateDisplayId";
import type { UCID, Solution } from "../../types";

export interface BoqResponsePayload {
  ucid: string;
  solutions?: Solution[];
  sourceFile?: string;
  parsedSummary?: {
    vendorBrand: string;
    detectedChassis: string;
    initialConfidenceScore: number;
  };
}

export function useBoqIntake(
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>,
  setMode: (step: string) => void,
  toast: (msg: string, variant: "success" | "error" | "warn", actionText?: string, actionFn?: () => void) => void,
  setSelectedUcidId: (id: string) => void
) {
  const [selectedPreset, setSelectedPreset] = useLocalStorageState<
    "hpe-legacy" | "dell-overcharge" | "cisco-asymmetry"
  >("ingestion_boq_preset", "hpe-legacy");
  const [boqFile, setBoqFile] = useLocalStorageState<string>("ingestion_boq_file", "");
  const [isBOQIngesting, setIsBOQIngesting] = useState(false);
  const [boqProgress, setBoqProgress] = useState(0);
  const [boqResponse, setBoqResponse] = useLocalStorageState<BoqResponsePayload | null>(
    "ingestion_boq_response",
    null,
  );
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

    const generatedUcids: UCID[] = (boqResponse.solutions ?? []).map(
      (sol: Solution, idx: number) => {
        const displayId = generateDisplayId();
        const detailsText =
          sol.vendorSubmissions?.[0]?.configs?.[0]?.items
            ?.map(
              (i) => ` - ${i.name} (QTY ${i.quantity} @ $${i.unitPrice})`,
            )
            .join("\n") || "";

        return {
          id: crypto.randomUUID(),
          displayId: displayId,
          name: `Sourced ${sol.vendorSubmissions?.[0]?.vendor || sol.name} Alignment Config`,
          solutionName: boqResponse.sourceFile,
          priority: idx === 0 ? "high" : "medium",
          projectRef: "PRJ-RECON-HUB",
          createdAt: new Date().toISOString(),
          currentStep: "solution-design",
          completedSteps: ["boq-intake", "pre-intelligence"],
          rawBOM: `Workbook parsed via central Ingestion Hub.\n\nSource sheet: ${boqResponse.sourceFile}\nVendor Profile: ${sol.vendorSubmissions?.[0]?.vendor || sol.name}\n\nComponents Detail:\n${detailsText}`,
          solutions: [
            {
              id: `sol-${displayId}-primary`,
              name: sol.name,
              targetUcidId: displayId,
              vendorSubmissions: sol.vendorSubmissions?.map((vs) => ({ ...vs })) || [],
            },
          ],
          events: [
            {
              ts: new Date().toISOString(),
              level: "info",
              msg: `Central BOQ split allocated to target container ${displayId}`,
            },
            {
              ts: new Date().toISOString(),
              level: "ok",
              msg: `Primary spec loaded with initial compliance score and structural items.`,
            },
          ],
          snapshots: [],
        };
      },
    );

    setUcids((prev) => {
      const existingIds = prev.map((p) => p.displayId);
      const filteredGenerated = generatedUcids.filter(
        (g) => !existingIds.includes(g.displayId),
      );
      return [...filteredGenerated, ...prev];
    });

    toast(
      `BOQ intake completed! Allocated ${generatedUcids.length} UCID tracking slots successfully.`,
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
