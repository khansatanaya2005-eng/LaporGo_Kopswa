/**
 * check_ringkasan.cjs
 * Cek SEMUA sheet dari kedua file ringkasan pembayaran
 */
const XLSX = require('xlsx');
const path = require('path');
const DIR = 'C:\\Users\\khans\\Downloads\\laporansmarttgl31agustus2026';

function dumpFile(filename) {
  const filePath = path.join(DIR, filename);
  console.log('\n' + '='.repeat(60));
  console.log('FILE:', filename);
  console.log('='.repeat(60));
  try {
    const wb = XLSX.readFile(filePath, { type: 'file' });
    console.log('Sheets:', wb.SheetNames);
    wb.SheetNames.forEach(sheetName => {
      const ws = wb.Sheets[sheetName];
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
      console.log(`\n  Sheet: "${sheetName}" (${range.e.r+1} rows x ${range.e.c+1} cols)`);
      for (let r = 0; r <= Math.min(range.e.r, 50); r++) {
        const rowCells = [];
        for (let c = 0; c <= range.e.c; c++) {
          const addr = XLSX.utils.encode_cell({ r, c });
          const cell = ws[addr];
          if (cell && cell.v !== null && cell.v !== '') {
            rowCells.push(`[${addr}]="${cell.v}"`);
          }
        }
        if (rowCells.length > 0) {
          console.log(`  R${String(r+1).padStart(3)}: ${rowCells.join('  |  ')}`);
        }
      }
    });
  } catch(e) {
    console.error('ERROR:', e.message);
  }
}

// Cek kedua file ringkasan
dumpFile('31 agustsu 2026 ringkasan pembayaran logo.xlsx');
dumpFile('31 agustsu 2026 ringkasan pembayaran logo .xlsx');

console.log('\n\nDone!');
