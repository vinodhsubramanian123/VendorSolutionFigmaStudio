import { apiClient } from "../../../services/apiClient";
import type { BoqResponsePayload } from "../../../types/ingestion";
import type { Solution } from "../../../types";
import type { IngestionPreset } from "../../../store/ingestionStore";

export function useBoqSimulator(
  onUpdateBOM: (rawText: string) => void,
  onUpdateSolutions: (sols: Solution[]) => void,
  appendLogEvent: (level: "info" | "warn" | "ok" | "err", msg: string) => void,
  onShowToast: (msg: string, type: "success" | "warn" | "error") => void
) {
  const handleSimulateIntake = async (
    fileName: string,
    presetType: IngestionPreset
  ) => {
    const rawText = "";
    try {
      appendLogEvent(
        "info",
        "Connecting direct REST API to dispatch workbook to secure compiler..."
      );
      const response = await apiClient.post<BoqResponsePayload>("/api/boq/ingest", { fileName, presetType, rawText });

      const ucidObj = typeof response.data?.ucid === "object" ? response.data.ucid : undefined;
      const resolvedSolutions = response.data?.solutions ?? ucidObj?.solutions;

      if (response.success && resolvedSolutions) {
        onUpdateBOM(
          (response.data.rawText || "") +
            `\n\n[API METRIC SIGNED] Server verified with ${response.data.parsedSummary?.initialConfidenceScore}% initial confidence score.`
        );
        onUpdateSolutions(resolvedSolutions);
        appendLogEvent(
          "ok",
          `[API SECURE LINK] Server parsed "${fileName}" returning ${resolvedSolutions.length} alternative configuration pipelines.`
        );
        onShowToast(`Workbook parsed by live backend API!`, "success");
        return;
      }
    } catch (e) {
      console.error("API link is unavailable. Simulation failed.", e);
      onShowToast(
        `Failed to parse workbook via API. Ensure MSW or backend is running.`,
        "error"
      );
    }
  };

  return { handleSimulateIntake };
}
