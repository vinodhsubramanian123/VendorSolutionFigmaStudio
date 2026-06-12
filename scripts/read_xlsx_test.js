import XLSX from 'xlsx';
import path from 'path';

try {
  const filePath = path.resolve('./CLIC_Advice_TempUCID.xlsx');
  const workbook = XLSX.readFile(filePath);
  console.log("Sheet Names in CLIC_Advice_TempUCID.xlsx:", workbook.SheetNames);
  
  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n--- Sheet: ${sheetName} ---`);
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    console.log("Row count:", data.length);
    console.log("First 3 rows:", JSON.stringify(data.slice(0, 3), null, 2));
  });
} catch (e) {
  console.error("Error reading file:", e);
}
