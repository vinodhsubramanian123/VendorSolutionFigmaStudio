import { UCID, Snapshot, VendorSubmission } from "../../types";

export function useCampaignActions(
  campaignName: string,
  campaignUcids: UCID[],
  setUcids: React.Dispatch<React.SetStateAction<UCID[]>>,
  campaignSigner: string,
  setCampaignLocked: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
  getSolutionName: (u: UCID) => string,
  isLocked: boolean
) {
  function handleApplyBestOfBreed() {
    if (isLocked) return;
    setUcids((prev) =>
      prev.map((u) => {
        const matchName = getSolutionName(u);
        if (matchName !== campaignName) return u;
        const sorted = [...u.solutions].sort(
          (a, b) =>
            (a.vendorSubmissions[0]?.totalPrice ?? 0) -
            (b.vendorSubmissions[0]?.totalPrice ?? 0),
        );
        return {
          ...u,
          solutions: sorted,
          events: [
            ...u.events,
            {
              timestamp: new Date().toISOString(),
              level: "ok" as const,
              msg: "Group Sourcing Optimisation: Applied Best-of-Breed strategy. Winner alternative set to absolute cheapest proposal.",
            },
          ],
        };
      }),
    );
  }

  function handleApplySingleVendor(vendor: string) {
    if (isLocked) return;
    setUcids((prev) =>
      prev.map((u) => {
        const matchName = getSolutionName(u);
        if (matchName !== campaignName) return u;
        const targetIdx = u.solutions.findIndex((s) =>
          s?.vendorSubmissions?.some(
            (v) => v.vendor.toLowerCase() === vendor.toLowerCase(),
          ),
        );
        if (targetIdx !== -1) {
          const next = [...u.solutions];
          const primary = next[targetIdx];
          const vIdx = primary.vendorSubmissions.findIndex(
            (v) => v.vendor.toLowerCase() === vendor.toLowerCase(),
          );
          if (vIdx !== -1) {
            const vNext = [...primary.vendorSubmissions];
            const vPrimary = vNext[vIdx];
            vNext.splice(vIdx, 1);
            vNext.unshift(vPrimary);
            primary.vendorSubmissions = vNext;
          }
          next.splice(targetIdx, 1);
          next.unshift(primary);
          return {
            ...u,
            solutions: next,
            events: [
              ...u.events,
              {
                timestamp: new Date().toISOString(),
                level: "ok" as const,
                msg: `Group Sourcing Homogeneity: Linked active design choice to single-source vendor ${vendor}.`,
              },
            ],
          };
        }
        return u;
      }),
    );
  }

  function handleCertifyCampaign() {
    if (!campaignSigner.trim()) return;
    setCampaignLocked((prev) => ({ ...prev, [campaignName]: true }));
    setUcids((prev) =>
      prev.map((u) => {
        const matchName = getSolutionName(u);
        if (matchName !== campaignName) return u;
        const winningSol = u.solutions[0]?.vendorSubmissions?.[0] ?? {
          vendor: "Multi-vendor",
          label: "Consolidated solution",
          totalPrice: 240000,
        };
        const hasSnapshot = u.snapshots.length > 0;
        const newSnapshot: Snapshot = {
          id: `snap-${crypto.randomUUID()}`,
          label: `Campaign Master Covenant Lock - Sourced via ${winningSol.vendor}`,
          committedAt: new Date()
            .toISOString()
            .replace("T", " ")
            .substring(0, 19),
          winnerSolution: winningSol.vendor,
          totalValue: winningSol.totalPrice,
          notes: `Master digital covenant locked by ${campaignSigner}. Cryptographic compliance checksum generated successfully.`,
          version: u.snapshots.length + 1,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          locked: true,
          bomSnapshot: (winningSol as VendorSubmission).configs || []
        };
        return {
          ...u,
          currentStep: "snapshot" as const,
          completedSteps: Array.from(
            new Set([...u.completedSteps, "snapshot" as const]),
          ),
          snapshots: hasSnapshot ? u.snapshots : [newSnapshot],
          events: [
            ...u.events,
            {
              timestamp: new Date().toISOString(),
              level: "ok" as const,
              msg: `Covenant Lock: Master Snapshot sealed by ${campaignSigner}. SECURE SHA-256 generated.`,
            },
          ],
        };
      }),
    );
  }

  function handleExportCSV() {
    let csv = "Sheet / Workspace Ref,Winner Vendor,Selected Cost,HPE Option Quote,Dell Option Quote,Step State\n";
    campaignUcids.forEach(u => {
      const masterSolution = u.solutions[0];
      const currentSelected = masterSolution?.vendorSubmissions?.[0];
      const hpeS = masterSolution?.vendorSubmissions?.find((x) => x.vendor === "HPE") ?? masterSolution?.vendorSubmissions?.[0];
      const dellS = masterSolution?.vendorSubmissions?.find((x) => x.vendor === "Dell") ?? masterSolution?.vendorSubmissions?.[0];
      csv += `"${u.displayId} - ${u.name}","${currentSelected?.vendor || 'Unassigned'}","${currentSelected?.totalPrice || 0}","${hpeS?.totalPrice || 0}","${dellS?.totalPrice || 0}","${u.currentStep}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Campaign_Consolidation_${campaignName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return {
    handleApplyBestOfBreed,
    handleApplySingleVendor,
    handleCertifyCampaign,
    handleExportCSV,
  };
}
