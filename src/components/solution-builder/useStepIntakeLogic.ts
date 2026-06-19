import { useState } from "react";
import { apiClient } from "../../services/apiClient";

export function useStepIntakeLogic(onIntakeComplete: (parsedConfigs: unknown[]) => void) {
  const [isDragging, setIsDragging] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestProgress, setIngestProgress] = useState(0);
  const [isIngested, setIsIngested] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [rawBoqText, setRawBoqText] = useState("");

  const parseRawBoq = (text: string) => {
    const lines = text.split('\n');
    const items = [];
    for (const line of lines) {
      if (!line.trim()) continue;
      const qtyMatch = line.match(/(?:^|\s)(?:qty:?\s*)?(\d+)(?:x|\s)/i);
      const skuMatch = line.match(/[a-zA-Z0-9]{3,8}-[a-zA-Z0-9]{3,4}/);
      
      if (skuMatch) {
        items.push({
          id: crypto.randomUUID(),
          partNumber: skuMatch[0],
          name: `Parsed Component: ${skuMatch[0]}`,
          type: "Parsed Component",
          quantity: qtyMatch ? parseInt(qtyMatch[1], 10) : 1,
          unitPrice: 0
        });
      }
    }
    
    if (items.length > 0) {
      const newConfig = {
        id: crypto.randomUUID(),
        name: `Dynamically Parsed Intake Config`,
        vendor: "HPE",
        targetUcidId: "",
        items: items,
        totalPrice: 0,
        originalPrice: 0
      };
      return [newConfig];
    }
    return [];
  };

  const handleFileUpload = async (fileName: string, textContent?: string) => {
    setIsIngesting(true);
    setUploadedFileName(fileName);
    setIngestProgress(10);
    try {
      await apiClient.post("/api/boq/ingest", {
        fileName,
        presetType: "hpe-legacy"
      });
      setIngestProgress(100);
      setIsIngesting(false);
      setIsIngested(true);
      
      let parsedConfigs = [];
      if (textContent) {
        parsedConfigs = parseRawBoq(textContent);
      } else {
        parsedConfigs = [{
          id: crypto.randomUUID(),
          name: "Demo Enterprise Storage Config",
          vendor: "HPE",
          targetUcidId: "",
          items: [
            { id: "i1", partNumber: "P40424-B21", name: "Demo Processor", type: "Processor", quantity: 2, unitPrice: 2000 }
          ],
          totalPrice: 4000,
          originalPrice: 4500
        }];
      }
      onIntakeComplete(parsedConfigs);
    } catch (err) {
      setIsIngesting(false);
      console.error("Ingestion error:", err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0].name);
    }
  };

  const triggerPicker = () => {
    const fileInput = document.getElementById(
      "boq-file-picker",
    ) as HTMLInputElement;
    if (fileInput) fileInput.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0].name);
    }
  };

  return {
    isDragging,
    isIngesting,
    ingestProgress,
    isIngested,
    uploadedFileName,
    rawBoqText,
    setRawBoqText,
    handleFileUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    triggerPicker,
    handleFileChange
  };
}
