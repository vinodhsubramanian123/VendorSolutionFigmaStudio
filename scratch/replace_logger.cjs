const fs = require('fs');

function replaceServer() {
  const file = 'server.ts';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import express from "express";/g, 'import express from "express";\nimport { logger } from "./server/logger";');
  content = content.replace(/console\.log\(/g, 'logger.info(');
  content = content.replace(/console\.error\(/g, 'logger.error(');
  fs.writeFileSync(file, content);
}

replaceServer();
console.log("Done");
