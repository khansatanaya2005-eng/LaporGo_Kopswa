/**
 * analyze_files.js
 * Script untuk menganalisis struktur file mentah laporan OMI & SMART
 * Run: node analyze_files.js
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const DIR = 'C:\\Users\\khans\\Downloads\\laporansmarttgl31agustus2026';

// ============================================================
// HELPER: Print all cells in a sheet with their addresses
// ============================================================
function dumpSheetStructure(wb, sheetName, maxRows = 100) {
  const ws = wb.Sheets[sheetName];
  if (!ws) return null;

  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
  const rows = [];

  for (let r = range.s.r; r <= Math.min(range.e.r, maxRows - 1); r++) {
    const row = [];
    for (let c = range.s.c; c <= range.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = ws[addr];
      row.push({
        addr,
        col: XLSX.utils.encode_col(c),
        rowNum: r + 1,
        val: cell ? cell.v : null,
        type: cell ? cell.t : null
      });
    }
    if (row.some(c => c.val !== null && c.val !== '')) {
      rows.push(row);
    }
  }
  return rows;
}

function printRows(rows) {
  if (!rows) { console.log('  (empty)'); return; }
  rows.forEach(row => {
    const nonEmpty = row.filter(c => c.val !== null && c.val !== '');
    if (nonEmpty.length > 0) {
      const rowNum = nonEmpty[0].rowNum;
      const line = nonEmpty.map(c => `[${c.addr}]="${c.val}"`).join('  |  ');
      console.log(`  R${String(rowNum).padStart(3)}: ${line}`);
    }
  });
}

// ============================================================
// ANALYZE: LAPORAN PER TANGGAL.xls (OMI)
// ============================================================
function analyzeLaporanPerTanggal() {
  const filePath = path.join(DIR, '31 AGUSTUS 2026 LAPORAN PENJUALAN PER TANGGAL.xls');
  console.log('\n' + '='.repeat(70));
  console.log('FILE 1: LAPORAN PENJUALAN PER TANGGAL.xls (OMI)');
  console.log('='.repeat(70));

  const wb = XLSX.readFile(filePath, { type: 'file' });
  console.log('Sheets:', wb.SheetNames);

  wb.SheetNames.forEach(sheetName => {
    console.log(`\n--- Sheet: "${sheetName}" ---`);
    printRows(dumpSheetStructure(wb, sheetName, 120));
  });
}

// ============================================================
// ANALYZE: LAPORAN TUTUP HARIAN.txt (OMI)
// ============================================================
function analyzeLaporanTutupHarian() {
  const filePath = path.join(DIR, '31 AGUSTUS 2026 LAPORAN TUTUP HARIAN.txt');
  console.log('\n' + '='.repeat(70));
  console.log('FILE 2: LAPORAN TUTUP HARIAN.txt (OMI)');
  console.log('='.repeat(70));

  // Try different encodings
  let content;
  try {
    content = fs.readFileSync(filePath, 'latin1');
  } catch(e) {
    content = fs.readFileSync(filePath, 'utf8');
  }
  
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    console.log(`  Line ${String(i + 1).padStart(3)}: ${line.replace(/\r/g, '')}`);
  });
}

// ============================================================
// ANALYZE: ringkasan pembayaran logo.xlsx (SMART)
// ============================================================
function analyzeRingkasanPembayaran() {
  const filePath = path.join(DIR, '31 agustsu 2026 ringkasan pembayaran logo.xlsx');
  console.log('\n' + '='.repeat(70));
  console.log('FILE 3: ringkasan pembayaran logo.xlsx (SMART)');
  console.log('='.repeat(70));

  const wb = XLSX.readFile(filePath, { type: 'file' });
  console.log('Sheets:', wb.SheetNames);

  wb.SheetNames.forEach(sheetName => {
    console.log(`\n--- Sheet: "${sheetName}" ---`);
    printRows(dumpSheetStructure(wb, sheetName, 150));
  });
}

// ============================================================
// ANALYZE: template baru.xls (TARGET OUTPUT)
// ============================================================
function analyzeTemplateBaru() {
  const filePath = path.join(DIR, '31 agustus 2026 template baru.xls');
  console.log('\n' + '='.repeat(70));
  console.log('FILE 4: template baru.xls (TARGET OUTPUT)');
  console.log('='.repeat(70));

  const wb = XLSX.readFile(filePath, { type: 'file' });
  console.log('Sheets:', wb.SheetNames);

  wb.SheetNames.forEach(sheetName => {
    console.log(`\n--- Sheet: "${sheetName}" (max 100 rows) ---`);
    printRows(dumpSheetStructure(wb, sheetName, 100));
  });
}

// ============================================================
// ANALYZE: LAPORAN PENJUALAN ANGGOTA PER MEMBER.xls (OPSIONAL)
// ============================================================
function analyzeLaporanPerMember() {
  const filePath = path.join(DIR, '31 AGUSTUS 2026 LAPORAN PENJUALAN ANGGOTA PER MEMBER.xls');
  console.log('\n' + '='.repeat(70));
  console.log('FILE 5: LAPORAN PENJUALAN ANGGOTA PER MEMBER.xls (OPSIONAL)');
  console.log('='.repeat(70));

  const wb = XLSX.readFile(filePath, { type: 'file' });
  console.log('Sheets:', wb.SheetNames);

  wb.SheetNames.forEach(sheetName => {
    console.log(`\n--- Sheet: "${sheetName}" ---`);
    printRows(dumpSheetStructure(wb, sheetName, 80));
  });
}

// ============================================================
// RUN ALL
// ============================================================
console.log('LaporGo - File Structure Analyzer');
console.log('Analyzing files in:', DIR);

try { analyzeLaporanPerTanggal(); } 
catch(e) { console.error('ERROR File 1:', e.message); }

try { analyzeLaporanTutupHarian(); } 
catch(e) { console.error('ERROR File 2:', e.message); }

try { analyzeRingkasanPembayaran(); } 
catch(e) { console.error('ERROR File 3:', e.message); }

try { analyzeTemplateBaru(); } 
catch(e) { console.error('ERROR File 4:', e.message); }

try { analyzeLaporanPerMember(); } 
catch(e) { console.error('ERROR File 5:', e.message); }

console.log('\n\n✅ Analisis selesai!');
