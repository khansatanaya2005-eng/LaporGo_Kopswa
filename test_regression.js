import fs from 'fs';
import path from 'path';
import {
  parseLaporanPerTanggal,
  parseTutupHarian,
  parseSmartRingkasan,
  buildOmsetRows,
  calculateTotals,
  runValidations
} from './server.js';

console.log('==================================================');
console.log('🧪 RUNNING REGRESSION TEST SUITE FOR LAPORGO');
console.log('==================================================\n');

const testCases = [
  {
    folder: '28 agustus 2026',
    omiFile: '28 AGUSTUS 2026 LAPORAN PENJUALAN PER TANGGAL.xls',
    txtFile: '28 AGUSTUS 2026 LAPORAN TUTUP HARIAN.txt',
    smartFiles: [
      '28 agustus 2026 ringkasan pembayaran smart .xlsx',
      '28 agustus 2026 ringkasan pembayaran logo .xlsx'
    ],
    expectedVouchersCount: 3
  },
  {
    folder: '31 agustus 2026',
    omiFile: '31 AGUSTUS 2026 LAPORAN PENJUALAN PER TANGGAL.xls',
    txtFile: '31 AGUSTUS 2026 LAPORAN TUTUP HARIAN.txt',
    smartFiles: [
      '31 agustsu 2026 ringkasan pembayaran toko.xlsx',
      '31 agustsu 2026 ringkasan pembayaran logo.xlsx'
    ],
    expectedVouchersCount: 1
  }
];

let totalPassed = 0;

testCases.forEach((tc, idx) => {
  console.log(`[TEST CASE ${idx + 1}] Dataset: ${tc.folder}`);
  const folderPath = path.join('C:/Users/khans/Downloads', tc.folder);

  try {
    // 1. Test OMI parsing
    const omiBuf = fs.readFileSync(path.join(folderPath, tc.omiFile));
    const omi = parseLaporanPerTanggal(omiBuf);
    console.log(`  ✓ OMI Parsed: DPP BKP = Rp ${omi.dppBKP.toLocaleString('id-ID')}, HPP = Rp ${omi.hppOmi.toLocaleString('id-ID')}`);
    if (!omi.dppBKP || !omi.hppOmi) throw new Error('OMI parsing mengembalikan angka 0 untuk DPP/HPP');

    // 2. Test Tutup Harian parsing
    const txtBuf = fs.readFileSync(path.join(folderPath, tc.txtFile));
    const txt = parseTutupHarian(txtBuf);
    console.log(`  ✓ Tutup Harian Parsed: Tanggal = ${txt.tanggal}, Tunai = Rp ${txt.tunai.toLocaleString('id-ID')}, PotProduk = Rp ${txt.potProduk.toLocaleString('id-ID')}`);
    if (!txt.tanggal) throw new Error('Tutup Harian gagal membaca tanggal');

    // 3. Test SMART parsing
    const smartResults = [];
    tc.smartFiles.forEach(sf => {
      const sBuf = fs.readFileSync(path.join(folderPath, sf));
      const res = parseSmartRingkasan(sBuf);
      smartResults.push(res);
      console.log(`  ✓ SMART Parsed (${res.category}): DPP = Rp ${res.summary.dpp.toLocaleString('id-ID')}, HPP = Rp ${res.summary.hpp.toLocaleString('id-ID')}, Voucher Entries = ${res.entries.length}`);
      if (res.summary.dpp === 0 && res.entries.length > 0) {
        throw new Error(`SMART ${res.category} mempunyai voucher tapi ringkasan DPP terbaca Rp 0 (Bug B12 hardcoded!)`);
      }
    });

    // 4. Test Build Omset Rows & Totals
    const omsetRows = buildOmsetRows({ txt, omi, smartResults });
    const summary = calculateTotals(omsetRows);
    const warnings = runValidations({ txt, omi });

    console.log(`  ✓ Omset Rows Created: ${omsetRows.length} baris`);
    console.log(`  ✓ Total Debit  = Rp ${summary.totalDebit.toLocaleString('id-ID')}`);
    console.log(`  ✓ Total Kredit = Rp ${summary.totalKredit.toLocaleString('id-ID')}`);
    console.log(`  ✓ Status       = ${summary.statusBalance} (Selisih = Rp ${summary.selisih.toLocaleString('id-ID')})`);
    console.log(`  ✓ Warnings     = ${warnings.length} warning`);

    console.log(`  ✅ RESULT ${tc.folder}: LULUS REGRESSION TEST!\n`);
    totalPassed++;
  } catch (err) {
    console.error(`  ❌ RESULT ${tc.folder}: GAGAL REGRESSION TEST!`);
    console.error(`     Error: ${err.message}\n`);
  }
});

console.log('==================================================');
if (totalPassed === testCases.length) {
  console.log(`🎉 ALL ${totalPassed}/${testCases.length} REGRESSION TESTS PASSED 100%!`);
} else {
  console.log(`⚠️ ${totalPassed}/${testCases.length} REGRESSION TESTS PASSED.`);
}
console.log('==================================================');
