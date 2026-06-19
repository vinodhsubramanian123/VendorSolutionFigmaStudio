import { useMemo } from "react";
import type { UCID, Snapshot, Config, BOMItem } from "../../types";

export interface DiffItem {
  partNumber: string;
  name: string;
  changeType: "added" | "removed" | "modified" | "none";
  aQty: number;
  bQty: number;
  aPrice: number;
  bPrice: number;
  unitDrift: number;
  totalDrift: number;
  qtyDrift?: number;
  labelChanged?: { from: string; to: string } | null;
  type?: string;
}

export interface DiffSheetSummary {
  sheetName: string;
  valA: number;
  valB: number;
  driftValue: number;
  items: DiffItem[];
  isEmptyA: boolean;
  isEmptyB: boolean;
}

export function useDiffConfigs(
  isOpen: boolean,
  selectedForCompare: string[],
  compareAgainstCurrent: boolean,
  snapshotsList: Snapshot[],
  activeUCID: UCID | undefined
) {
  const diffConfigs = useMemo(() => {
    if (!isOpen || !activeUCID) return { snapA: null, snapB: null, sheets: [] };

    let snapA: Snapshot | null = null;
    let snapB: Snapshot | null = null;

    if (compareAgainstCurrent) {
      const targetId = selectedForCompare[0];
      snapA = snapshotsList.find((s) => s.id === targetId) || null;
      const liveSubmission = activeUCID.solutions?.[0]?.vendorSubmissions?.[0];
      const liveBomConfigs = liveSubmission?.configs || [];
      snapB = {
        id: "current-live",
        label: "Current Reconciled State",
        committedAt: new Date().toISOString().split("T")[0],
        winnerSolution: liveSubmission?.label || "Consolidated Sourcing",
        totalValue: liveSubmission?.totalPrice || 0,
        notes: "Real-time unsaved edits.",
        payload: JSON.parse(JSON.stringify(activeUCID.solutions || [])),
        version: (activeUCID.snapshots?.length || 0) + 1,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        locked: false,
        bomSnapshot: JSON.parse(JSON.stringify(liveBomConfigs))
      };
    } else {
      if (selectedForCompare.length === 2) {
        const first = snapshotsList.find((s) => s.id === selectedForCompare[0]);
        const second = snapshotsList.find((s) => s.id === selectedForCompare[1]);
        if (first && second) {
          if (first.id <= second.id) {
            snapA = first;
            snapB = second;
          } else {
            snapA = second;
            snapB = first;
          }
        }
      }
    }

    if (!snapA || !snapB) return { snapA: null, snapB: null, sheets: [] };

    const payloadA = snapA.payload || [];
    const payloadB = snapB.payload || [];

    const configsA = payloadA?.[0]?.vendorSubmissions?.[0]?.configs || [];
    const configsB = payloadB?.[0]?.vendorSubmissions?.[0]?.configs || [];

    const matchedSheetsMap = new Map<string, { label: string; a: Config | null; b: Config | null }>();
    
    configsA.forEach((c: Config) => {
      matchedSheetsMap.set(c.name, { label: c.name, a: c, b: null });
    });

    configsB.forEach((c: Config) => {
      if (matchedSheetsMap.has(c.name)) {
        matchedSheetsMap.get(c.name)!.b = c;
      } else {
        matchedSheetsMap.set(c.name, { label: c.name, a: null, b: c });
      }
    });

    const comparisonList: DiffSheetSummary[] = [];

    matchedSheetsMap.forEach((val, sheetName) => {
      const itemsA = val.a?.items || [];
      const itemsB = val.b?.items || [];

      const itemDiffs: DiffItem[] = [];
      const partsRegistry = new Set<string>();

      itemsA.forEach((it: BOMItem) => partsRegistry.add(it.partNumber as string));
      itemsB.forEach((it: BOMItem) => partsRegistry.add(it.partNumber as string));

      partsRegistry.forEach((pNum) => {
        const itA = itemsA.find((it: BOMItem) => it.partNumber === pNum);
        const itB = itemsB.find((it: BOMItem) => it.partNumber === pNum);

        if (itA && !itB) {
          itemDiffs.push({
            partNumber: pNum,
            name: itA.name,
            type: itA.type || "Misc",
            changeType: "removed",
            aQty: itA.quantity,
            bQty: 0,
            aPrice: itA.unitPrice,
            bPrice: 0,
            unitDrift: -itA.unitPrice,
            totalDrift: -(itA.unitPrice * itA.quantity)
          });
        } else if (!itA && itB) {
          itemDiffs.push({
            partNumber: pNum,
            name: itB.name,
            type: itB.type || "Misc",
            changeType: "added",
            aQty: 0,
            bQty: itB.quantity,
            aPrice: 0,
            bPrice: itB.unitPrice,
            unitDrift: itB.unitPrice,
            totalDrift: itB.unitPrice * itB.quantity
          });
        } else if (itA && itB) {
          const qtyDiff = itB.quantity !== itA.quantity;
          const priceDiff = itB.unitPrice !== itA.unitPrice;
          const labelDiff = itB.name !== itA.name;

          if (qtyDiff || priceDiff || labelDiff) {
            itemDiffs.push({
              partNumber: pNum,
              name: itB.name,
              type: itB.type || "Misc",
              changeType: "modified",
              aQty: itA.quantity,
              bQty: itB.quantity,
              aPrice: itA.unitPrice,
              bPrice: itB.unitPrice,
              unitDrift: itB.unitPrice - itA.unitPrice,
              totalDrift: (itB.unitPrice * itB.quantity) - (itA.unitPrice * itA.quantity),
              qtyDrift: itB.quantity - itA.quantity,
              labelChanged: labelDiff ? { from: itA.name, to: itB.name } : null
            });
          } else {
            itemDiffs.push({
              partNumber: pNum,
              name: itB.name,
              type: itB.type || "Misc",
              changeType: "none",
              aQty: itA.quantity,
              bQty: itB.quantity,
              aPrice: itA.unitPrice,
              bPrice: itB.unitPrice,
              unitDrift: 0,
              totalDrift: 0
            });
          }
        }
      });

      const sheetValA = val.a?.totalPrice || 0;
      const sheetValB = val.b?.totalPrice || 0;

      comparisonList.push({
        sheetName,
        valA: sheetValA,
        valB: sheetValB,
        driftValue: sheetValB - sheetValA,
        items: itemDiffs,
        isEmptyA: !val.a,
        isEmptyB: !val.b
      });
    });

    return {
      snapA,
      snapB,
      sheets: comparisonList
    };
  }, [isOpen, selectedForCompare, compareAgainstCurrent, snapshotsList, activeUCID]);

  const diffSummary = useMemo(() => {
    if (!diffConfigs || !diffConfigs.sheets) return { totalDrift: 0, additions: 0, deletions: 0, drifts: 0 };
    
    let totalDrift = 0;
    let additions = 0;
    let deletions = 0;
    let drifts = 0;

    diffConfigs.sheets.forEach((sh: DiffSheetSummary) => {
      totalDrift += sh.driftValue;
      sh.items.forEach((it: DiffItem) => {
        if (it.changeType === "added") additions++;
        if (it.changeType === "removed") deletions++;
        if (it.changeType === "modified") drifts++;
      });
    });

    return { totalDrift, additions, deletions, drifts };
  }, [diffConfigs]);

  return { diffConfigs, diffSummary };
}
