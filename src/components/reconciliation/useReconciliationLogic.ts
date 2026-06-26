import { useState, useMemo } from 'react';
import type { UCID, CatalogSKU, ForensicIssue} from '../../types';
import { TableRow as TableRowType, TableGroup } from "../../types/data";
import { ActiveSourcingRules } from "../../config/sourcingRules";
import { useDrillDownAutoHeal } from './useDrillDownAutoHeal';
import { useToast } from '../shared/ToastContext';
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
  const toggleGroup = (name: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [name]: !prev[name] }));
  };
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
    
    config.items.forEach((item, idx) => {
      const type = item.type || "Misc";
      if (!grouped.has(type)) grouped.set(type, []);
      
      const row = processReconciliationItem(item, idx, catalogSkus, forensicIssues);
      grouped.get(type)!.push(row);
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
  }, [ucids, selectedConfigSheet, catalogSkus, forensicIssues]);
  const handleAutoHeal = useDrillDownAutoHeal(activeUCID, setUcids, setForensicIssues, toast);
  const stats = useMemo(() => {
    let all = 0, matched = 0, missing = 0, added = 0, spec = 0, qty = 0;
    driftTableData.forEach(g => {
      g.rows.forEach(r => {
        all++;
        if (r.status === "Matched") matched++;
        if (r.status === "Missing") missing++;
        if (r.status === "Added") added++;
        if (r.status === "Spec !=") spec++;
        if (r.status === "Qty Delta") qty++;
      });
    });
    return { all, matched, missing, added, spec, qty };
  }, [driftTableData]);
  const handleExport = () => {
    toast.success("Requesting reconciliation CSV from backend...");
    const link = document.createElement("a");
    link.href = `/api/export/reconciliation/${activeUCID?.id || "unknown"}/${encodeURIComponent(configName)}`;
    link.download = `reconciliation_drift_${configName.replace(/\s+/g, '_')}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    handleExport
  };
}

// eslint-disable-next-line complexity
function processReconciliationItem(item: any, idx: number, catalogSkus?: CatalogSKU[], forensicIssues?: ForensicIssue[]): TableRowType {
  const type = item.type || "Misc";
  const isMatched = catalogSkus?.some(sku => sku.partNumber === item.partNumber);
  const isSimulated = item.name.includes("Simulated");
  
  let status: TableRowType["status"] = "Matched";
  if (!isMatched) {
    status = isSimulated ? "Missing" : "Spec !=";
  }
  
  const hasEolAlert = ActiveSourcingRules.legacySKUs.includes(item.partNumber) && forensicIssues?.some(i => i.id === "iss-1" && i.status !== "resolved");
  const hasPriceAlert = item.partNumber === ActiveSourcingRules.thresholds.dellOverchargeSKU && item.unitPrice > ActiveSourcingRules.thresholds.dellOverchargeBaseLimit && forensicIssues?.some(i => i.id === "iss-2" && i.status !== "resolved");
  const hasMemorySymmetryAlert = type === "Memory" && item.quantity % ActiveSourcingRules.thresholds.ciscoMemorySymmetryDivisor !== 0 && forensicIssues?.some(i => i.id === "iss-3" && i.status !== "resolved");
  
  let hasAlert = false;
  let alertId = "";
  let alertTitle = "";
  if (hasEolAlert) {
    hasAlert = true;
    alertId = "iss-1";
    alertTitle = "Obsolete HPE Xeon CPU Vendor Limit Warning";
  } else if (hasPriceAlert) {
    hasAlert = true;
    alertId = "iss-2";
    alertTitle = "Quotation Price Premium Overage Detected";
  } else if (hasMemorySymmetryAlert) {
    hasAlert = true;
    alertId = "iss-3";
    alertTitle = "Power bus memory allocation asymmetrical";
  }
  
  return {
    id: item.id || `row-${idx}`,
    boqItem: item.name.replace("[REPLACED] ", "").replace(" [REPLACED]", "").replace(" [ALIGNED]", ""),
    boqPart: `BOQ-${item.partNumber.substring(0, 8)}`,
    boqQty: item.quantity,
    status: status,
    bomPart: status === "Missing" ? "—" : item.partNumber,
    bomItem: status === "Missing" ? "Not provisioned" : item.name,
    bomQty: status === "Missing" ? "—" : item.quantity,
    unitPrice: status === "Missing" ? "—" : item.unitPrice.toLocaleString(),
    totalPrice: status === "Missing" ? "—" : (item.unitPrice * item.quantity).toLocaleString(),
    rawPartNumber: item.partNumber,
    rawQty: item.quantity,
    rawType: type,
    rawPrice: item.unitPrice,
    hasAlert,
    alertId,
    alertTitle,
  };
}