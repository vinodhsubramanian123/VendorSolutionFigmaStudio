const fs = require("fs");
const path = require("path");

const colorMap = {
  // Backgrounds
  "#03050a": "bg-canvas",
  "#070a13": "bg-card",
  "#0b1220": "bg-elevated",
  
  // Accents / Status
  "#4a85fd": "indigo-accent",
  "#a855f7": "violet-accent",
  "#00d4a0": "success",
  "#ff9b36": "warning",
  "#ff3d5a": "error",
  
  // Text
  "#dde6ff": "text-primary",
  "#8ba4cc": "text-secondary",
  "#5d7899": "text-muted",
};

// Also replace arbitrary values that match
const exactReplacements = [
  { search: /bg-\[#03050a\]/g, replace: "bg-surface-canvas" },
  { search: /bg-\[#070a13\]/g, replace: "bg-surface-card" },
  { search: /bg-\[#0b1220\]/g, replace: "bg-surface-elevated" },
  { search: /bg-\[#090d19\]/g, replace: "bg-surface-header" },
  { search: /bg-\[#06080e\]/g, replace: "bg-surface-canvas" },
  
  { search: /text-\[#dde6ff\]/g, replace: "text-content-primary" },
  { search: /text-\[#8ba4cc\]/g, replace: "text-content-secondary" },
  { search: /text-\[#5d7899\]/g, replace: "text-content-muted" },
  
  { search: /text-\[#00d4a0\]/g, replace: "text-status-success" },
  { search: /text-\[#ff9b36\]/g, replace: "text-status-warning" },
  { search: /text-\[#ff3d5a\]/g, replace: "text-status-error" },
  
  { search: /text-\[#4a85fd\]/g, replace: "text-brand-indigo" },
  
  // Some standard tailwind re-mapping
  { search: /text-\[#10b981\]/g, replace: "text-emerald-500" },
  { search: /bg-\[#10b981\]/g, replace: "bg-emerald-500" },
  { search: /border-\[#10b981\]/g, replace: "border-emerald-500" },
  
  { search: /text-\[#ef4444\]/g, replace: "text-red-500" },
  { search: /bg-\[#ef4444\]/g, replace: "bg-red-500" },
  { search: /border-\[#ef4444\]/g, replace: "border-red-500" },

  { search: /text-\[#f59e0b\]/g, replace: "text-amber-500" },
  { search: /bg-\[#f59e0b\]/g, replace: "bg-amber-500" },
  { search: /border-\[#f59e0b\]/g, replace: "border-amber-500" },
  
  { search: /text-\[#3b82f6\]/g, replace: "text-blue-500" },
  { search: /bg-\[#3b82f6\]/g, replace: "bg-blue-500" },
  { search: /border-\[#3b82f6\]/g, replace: "border-blue-500" },

  { search: /text-\[#a855f7\]/g, replace: "text-purple-500" },
  { search: /bg-\[#a855f7\]/g, replace: "bg-purple-500" },
  { search: /border-\[#a855f7\]/g, replace: "border-purple-500" },
  
  { search: /text-\[#eab308\]/g, replace: "text-yellow-500" },
  { search: /bg-\[#eab308\]/g, replace: "bg-yellow-500" },
  { search: /border-\[#eab308\]/g, replace: "border-yellow-500" },

  { search: /border-\[rgba\(74,133,253,0\.15\)\]/g, replace: "border-brand-indigo/15" },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  let modified = false;

  for (const rep of exactReplacements) {
    if (rep.search.test(content)) {
      content = content.replace(rep.search, rep.replace);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`Updated colors in ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes("node_modules")) walkDir(fullPath);
    } else if (fullPath.endsWith(".tsx") || fullPath.endsWith(".ts")) {
      processFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, "src"));
console.log("Color refactor complete!");
