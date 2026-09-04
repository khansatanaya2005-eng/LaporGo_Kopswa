/**
 * test_api.cjs — Test /api/process-laporan dengan file real
 */
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const DIR = 'C:\\Users\\khans\\Downloads\\laporansmarttgl31agustus2026';

async function main() {
  const form = new FormData();
  form.append('omi_per_tanggal',  fs.createReadStream(path.join(DIR, '31 AGUSTUS 2026 LAPORAN PENJUALAN PER TANGGAL.xls')),  { filename: 'LAPORAN PER TANGGAL.xls' });
  form.append('omi_tutup_harian', fs.createReadStream(path.join(DIR, '31 AGUSTUS 2026 LAPORAN TUTUP HARIAN.txt')),           { filename: 'LAPORAN TUTUP HARIAN.txt' });
  form.append('smart_files',      fs.createReadStream(path.join(DIR, '31 agustsu 2026 ringkasan pembayaran logo .xlsx')),     { filename: 'ringkasan toko.xlsx' });
  form.append('smart_files',      fs.createReadStream(path.join(DIR, '31 agustsu 2026 ringkasan pembayaran logo.xlsx')),      { filename: 'ringkasan logo.xlsx' });

  console.log('Sending request to /api/process-laporan ...');
  const resp = await fetch('http://localhost:5000/api/process-laporan', { method: 'POST', body: form });
  const json = await resp.json();

  if (!json.success) {
    console.error('ERROR:', json.error);
    return;
  }

  const { summary, omsetRows, warnings } = json.data;
  console.log('\n=== SUMMARY ===');
  console.log('Tanggal       :', summary.tanggal);
  console.log('Total Debit   :', summary.totalDebit.toLocaleString('id'));
  console.log('Total Kredit  :', summary.totalKredit.toLocaleString('id'));
  console.log('Selisih       :', summary.selisih);
  console.log('Status        :', summary.statusBalance);
  console.log('Jumlah baris  :', omsetRows.length);

  console.log('\n=== BARIS OMSET ===');
  omsetRows.forEach(r => {
    const vals = Object.entries(r)
      .filter(([k,v]) => !['no','jenis_transaksi','kwitansi','keterangan'].includes(k) && v !== 0 && v !== '')
      .map(([k,v]) => `${k}=${typeof v === 'number' ? v.toLocaleString('id') : v}`)
      .join(', ');
    console.log(`  [${r.no}] ${r.nama_ref.padEnd(35)} | ${vals}`);
  });

  if (warnings.length) {
    console.log('\n=== WARNINGS ===');
    warnings.forEach(w => console.log(`  [${w.severity}] ${w.type}: ${w.message}`));
  }

  // Test download
  console.log('\nDownloading Excel...');
  const dlResp = await fetch('http://localhost:5000/api/download-excel', { method: 'POST' });
  const buf = Buffer.from(await dlResp.arrayBuffer());
  const outPath = path.join(DIR, 'OUTPUT_Laporan_Gabungan.xlsx');
  fs.writeFileSync(outPath, buf);
  console.log('✅ Excel saved to:', outPath);
}

main().catch(console.error);
