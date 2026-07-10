import { useState, useMemo, useCallback } from 'react';
import type { UCID, CatalogSKU, ForensicIssue} from '../../types';
import { TableRow as TableRowType, TableGroup, BOMItem } from "../../types/data";
import { ActiveSourcingRules } from "../../config/sourcingRules";
import { useDrillDownAutoHeal } from './useDrillDownAutoHeal';
import { useToast } from '../shared/ToastContext';

export interface ParsedBOQItem {
  partNumber: string;
  name: string;
  quantity: number;
  unitPrice: number;
  type: string;
}

export function parseRawBOM(rawBOM: string, configItems: BOMItem[]): ParsedBOQItem[] {
  if (!rawBOM) return [];
  try {
    const parsed = JSON.parse(rawBOM);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    // not JSON
  }

  // Fallback heuristic: If rawBOM is unstructured text, it's very hard to parse exact parts.
  // For the sake of the UI demo, we will synthesize BOQ items based on the text 
  // or fallback to the config items to show a realistic diff.
  // In a real app, this would be structured data from the start.
  
  // We'll generate a dummy BOQ side that has some differences to show the drift categories.
  const boqItems: ParsedBOQItem[] = configItems.map(item => ({
    partNumber: item.partNumber,
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    type: item.type || "Misc"
  }));

  // Inject some fake drift if the rawBOM contains certain keywords (for demonstration)
  if (rawBOM.toLowerCase().includes("intel")) {
     // create some differences
     if (boqItems.length > 1) {
       boqItems[1].partNumber = "BOQ-INTEL-OLD";
       boqItems[1].name = "Old Intel CPU requested";
     }
  }

  if (rawBOM.toLowerCase().includes("15tb")) {
     const drive = boqItems.find(b => b.type === "Drive");
     if (drive) drive.quantity = drive.quantity - 10; // Qty delta
  }

  return boqItems;
}

export function useReconciliationLogic(
  selectedConfigSheet: string | null,
  ucids?: UCID[],
  catalogSkus?: CatalogSKU[],
  forensicIssues?: ForensicIssue[],
  setUcids?: React.Dispatch<React.SetStateAction<UCID[]>>,
  setForensicIssues?: React.Dispatch<React.SetStateAction<ForensicIssue[]>>
) {
  const toast = useToast();
  const [reconciliationFilter, setReconciliationFilter] = useState<string>("All");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [annotations, setAnnotations] = useState<Record<string, string>>({});

  const toggleGroup = (name: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleAnnotate = useCallback((rowId: string, text: string) => {
    setAnnotations(prev => ({ ...prev, [rowId]: text }));
  }, []);
  const { driftTableData, configName, totalPrice, activeUCID } = useMemo(() => {
    const activeUCID =
      ucids?.find((u) => u.currentStep === "post-intelligence" || u.currentStep === "comparison" || u.currentStep === "snapshot") ||
      ucids?.find((u) => u.solutions?.length > 0) ||
      ucids?.[0];
    const dynamicConfigs =
      activeUCID?.solutions?.[0]?.vendorSubmissions?.[0]?.configs || [];
      
    const config = dynamicConfigs.find(c => c.id === selectedConfigSheet);
    
    if (!config) return { driftTableData: [], configName: selectedConfigSheet || "", totalPrice: 0, activeUCID };
    
    const grouped = new Map<string, TableRowType[]>();
    
    const parsedBOQ = parseRawBOM(activeUCID?.rawBOM || "", config.items);

    config.items.forEach((item, idx) => {
      const type = item.type || "Misc";
      if (!grouped.has(type)) grouped.set(type, []);
      
      const row = processReconciliationItem(item, idx, parsedBOQ, catalogSkus, forensicIssues);
      // apply local annotations
      if (annotations[row.id]) {
        row.annotation = annotations[row.id];
      }
      grouped.get(type)!.push(row);
    });

    // Also check for Missing items (in BOQ but not in BOM)
    parsedBOQ.forEach((boqItem, idx) => {
      const foundInBOM = config.items.some(item => item.partNumber === boqItem.partNumber || item.type === boqItem.type && item.name !== boqItem.name); // basic match check
      if (!foundInBOM) {
        const type = boqItem.type || "Misc";
        if (!grouped.has(type)) grouped.set(type, []);
        grouped.get(type)!.push({
          id: `boq-missing-${idx}`,
          boqItem: boqItem.name,
          boqPart: boqItem.partNumber,
          boqQty: boqItem.quantity,
          status: "Missing",
          bomPart: "—",
          bomItem: "Not provisioned",
          bomQty: "—",
          unitPrice: "—",
          totalPrice: "—",
          rawPartNumber: boqItem.partNumber,
          rawQty: boqItem.quantity,
          rawType: type,
          rawPrice: boqItem.unitPrice,
          hasAlert: false,
          alertId: "",
          alertTitle: "",
          annotation: annotations[`boq-missing-${idx}`] || ""
        });
      }
    });

    const groups: TableGroup[] = Array.from(grouped.entries()).map(([type, rows]) => ({
      name: type,
      count: rows.length,
      greenDot: rows.some(r => r.status === "Matched"),
      orangeDot: rows.some(r => r.status !== "Matched"),
      rows,
    }));

    const totalPrice = config.items.reduce((acc, it) => acc + (it.unitPrice * it.quantity), 0);
    return { driftTableData: groups, configName: config.name, totalPrice, activeUCID };
  }, [ucids, selectedConfigSheet, catalogSkus, forensicIssues, annotations]);
  const handleAutoHeal = useDrillDownAutoHeal(activeUCID, setUcids, setForensicIssues, toast);
  const stats = useMemo(() => {
    let all = 0, matched = 0, missing = 0, added = 0, equivalent = 0, spec = 0, qty = 0;
    if (!activeUCID) return { all, matched, missing, added, equivalent, spec, qty };
    driftTableData.forEach(g => {
      g.rows.forEach(r => {
        all++;
        if (r.status === "Matched") matched++;
        if (r.status === "Missing") missing++;
        if (r.status === "Added") added++;
        if (r.status === "Equivalent") equivalent++;
        if (r.status === "Price Delta") spec++;
        if (r.status === "Qty Delta") qty++;
      });
    });
    return { all, matched, missing, added, equivalent, spec, qty };
  }, [driftTableData]);
  const handleExport = () => {
    try {
      // Generate CSV content from driftTableData
      const headers = ["Category", "BOQ Item", "BOQ Part", "BOQ Qty", "Status", "BOM Part", "BOM Item", "BOM Qty", "Unit Price", "Total Price", "Annotation"];
      const rows: string[] = [];
      
      driftTableData.forEach(group => {
        group.rows.forEach(row => {
          const r = [
            `"${group.name.replace(/"/g, '""')}"`,
            `"${row.boqItem.replace(/"/g, '""')}"`,
            `"${row.boqPart.replace(/"/g, '""')}"`,
            `"${row.boqQty}"`,
            `"${row.status}"`,
            `"${row.bomPart.replace(/"/g, '""')}"`,
            `"${row.bomItem.replace(/"/g, '""')}"`,
            `"${row.bomQty}"`,
            `"${row.unitPrice}"`,
            `"${row.totalPrice}"`,
            `"${(row.annotation || "").replace(/"/g, '""')}"`
          ];
          rows.push(r.join(","));
        });
      });

      const csvContent = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `reconciliation_drift_${configName.replace(/\s+/g, '_')}.csv`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Reconciliation CSV exported successfully.");
    } catch (e) {
      toast.error("Failed to generate CSV export");
    }
  };
  return {
    reconciliationFilter,
    setReconciliationFilter,
    collapsedGroups,
    toggleGroup,
    driftTableData,
    configName,
    totalPrice,
    activeUCID,
    handleAutoHeal,
    stats,
    handleExport,
    handleAnnotate
  };
}

export function processReconciliationItem(item: BOMItem, idx: number, parsedBOQ: ParsedBOQItem[], catalogSkus?: CatalogSKU[], forensicIssues?: ForensicIssue[]): TableRowType {
  const type = item.type || "Misc";
  
  // Find matching BOQ item
  const exactMatch = parsedBOQ.find(b => b.partNumber === item.partNumber);
  const typeMatch = parsedBOQ.find(b => b.type === type && b.partNumber !== item.partNumber);

  let status: TableRowType["status"] = "Matched";
  let boqItemName = "—";
  let boqPartNumber = "—";
  let boqQty: number | string = "—";
  
  if (exactMatch) {
    boqItemName = exactMatch.name;
    boqPartNumber = exactMatch.partNumber;
    boqQty = exactMatch.quantity;
    if (exactMatch.quantity !== item.quantity) {
      status = "Qty Delta";
    } else if (exactMatch.unitPrice !== item.unitPrice) {
      status = "Price Delta";
    }
  } else if (typeMatch) {
    status = "Equivalent";
    boqItemName = typeMatch.name;
    boqPartNumber = typeMatch.partNumber;
    boqQty = typeMatch.quantity;
  } else {
    status = "Added";
  }

  const { hasAlert, alertId, alertTitle } = determineReconciliationAlerts(item, type, forensicIssues);
  
  return {
    id: item.id || `row-${idx}`,
    boqItem: boqItemName,
    boqPart: boqPartNumber,
    boqQty: boqQty,
    status: status as any,
    bomPart: item.partNumber,
    bomItem: item.name,
    bomQty: item.quantity,
    unitPrice: item.unitPrice.toLocaleString(),
    totalPrice: (item.unitPrice * item.quantity).toLocaleString(),
    rawPartNumber: item.partNumber,
    rawQty: item.quantity,
    rawType: type,
    rawPrice: item.unitPrice,
    hasAlert,
    alertId,
    alertTitle,
  };
}

function determineReconciliationAlerts(item: BOMItem, type: string, forensicIssues?: ForensicIssue[]) {
  const hasEolAlert = ActiveSourcingRules.legacySKUs.includes(item.partNumber) && forensicIssues?.some(i => i.id === "iss-1" && i.status !== "resolved");
  const hasPriceAlert = item.partNumber === ActiveSourcingRules.thresholds.dellOverchargeSKU && item.unitPrice > ActiveSourcingRules.thresholds.dellOverchargeBaseLimit && forensicIssues?.some(i => i.id === "iss-2" && i.status !== "resolved");
  const hasMemorySymmetryAlert = type === "Memory" && item.quantity % ActiveSourcingRules.thresholds.ciscoMemorySymmetryDivisor !== 0 && forensicIssues?.some(i => i.id === "iss-3" && i.status !== "resolved");

  if (hasEolAlert) {
    return { hasAlert: true, alertId: "iss-1", alertTitle: "Obsolete HPE Xeon CPU Vendor Limit Warning" };
  } 
  if (hasPriceAlert) {
    return { hasAlert: true, alertId: "iss-2", alertTitle: "Quotation Price Premium Overage Detected" };
  } 
  if (hasMemorySymmetryAlert) {
    return { hasAlert: true, alertId: "iss-3", alertTitle: "Power bus memory allocation asymmetrical" };
  }

  return { hasAlert: false, alertId: "", alertTitle: "" };
}