import fs from "fs";

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) {
        console.log("Not found:", filePath);
        return;
    }
    let content = fs.readFileSync(filePath, "utf-8");
    let changed = false;
    for (let r of replacements) {
        if (content.includes(r.s)) {
            content = content.split(r.s).join(r.r);
            changed = true;
        }
    }
    if (changed) {
        fs.writeFileSync(filePath, content, "utf-8");
        console.log("Updated", filePath);
    }
}

replaceInFile("./src/App.tsx", [{ s: "bg-[#06080e]", r: "bg-surface-canvas" }]);
replaceInFile("./src/components/vendor-portal/VendorIngestionDesk.tsx", [
    { s: "bg-[#03050a]", r: "bg-surface-canvas" },
    { s: "className=\"space-y-4\"", r: "className=\"space-y-4\"" } // Just testing
]);
replaceInFile("./src/components/vendor-portal/VendorPortal.tsx", [
    { s: "bg-[#091815]", r: "bg-status-success/10" },
    { s: "bg-[#1c090d]", r: "bg-status-error/10" },
    { s: "bg-[#1c1409]", r: "bg-status-warning/10" },
    { s: "text-[#00d4a0]", r: "text-status-success" },
    { s: "text-[#00d4a0]/80", r: "text-status-success/80" },
    { s: "text-[#ff3d5a]", r: "text-status-error" },
    { s: "text-[#ff9b36]", r: "text-status-warning" }
]);
replaceInFile("./src/components/reconciliation/ReconciliationOverview.tsx", [
    { s: "bg-[#0a101f]", r: "bg-surface-elevated" },
    { s: "text-[#8ea8d4]", r: "text-content-secondary" },
    { s: "bg-[#141d30]/65", r: "bg-surface-header" },
    { s: "bg-[#ff9b36]/5", r: "bg-status-warning/5" },
    { s: "border-[#ff9b36]/10", r: "border-status-warning/10" }
]);
replaceInFile("./src/components/reconciliation/ReconciliationDrillDown.tsx", [
    { s: "text-[#8ea8d4]", r: "text-content-secondary" },
    { s: "text-[#ff9b36]", r: "text-status-warning" },
    { s: "bg-[#ff9b36]", r: "bg-status-warning" },
    { s: "text-[#000]", r: "text-black" }
]);
replaceInFile("./src/components/reconciliation/ReconciliationView.tsx", [
    { s: "bg-[#090d16]", r: "bg-surface-header" },
    { s: "bg-[#ff9b36]", r: "bg-status-warning" }
]);
replaceInFile("./src/components/search/SearchView.tsx", [
    { s: "bg-[#0b1220]", r: "bg-surface-elevated" }
]);
replaceInFile("./src/components/reports/ReportsView.tsx", [
    { s: "border-[#ff9b36]/20", r: "border-status-warning/20" },
    { s: "border-[#ff9b36]/30", r: "border-status-warning/30" },
    { s: "bg-[#ff9b36]/10", r: "bg-status-warning/10" },
    { s: "text-[#ff9b36]", r: "text-status-warning" },
    { s: "border-[#ff9b36]", r: "border-status-warning" },
    { s: "bg-[#ff9b36]", r: "bg-status-warning" }
]);
replaceInFile("./src/components/taxonomy/TaxonomyGraphEditor.tsx", [
    { s: "bg-[#03050a]", r: "bg-surface-canvas" },
    { s: "bg-[#070a13]", r: "bg-surface-card" },
    { s: "bg-[#0b1220]", r: "bg-surface-elevated" }
]);
replaceInFile("./src/components/cleansing/CleansingView.tsx", [
    { s: "text-[#10b981]", r: "text-status-success" },
    { s: "bg-[#10b981]/15", r: "bg-status-success/15" },
    { s: "text-[#6366f1]", r: "text-brand-indigo" },
    { s: "bg-[#6366f1]/15", r: "bg-brand-indigo/15" },
    { s: "text-[#f59e0b]", r: "text-status-warning" },
    { s: "bg-[#f59e0b]/15", r: "bg-status-warning/15" }
]);
