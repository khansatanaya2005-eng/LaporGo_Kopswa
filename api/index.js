const express = require('express');
const cors = require('cors');
const multer = require('multer');
const XLSX = require('xlsx');
const ExcelJS = require('exceljs');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }
});

const OMSET_COL_DEFS = [
  'no', 'nama_ref', 'jenis_transaksi', 'kwitansi', 'keterangan',
  'tag_promo', 'giro_udp', 'piutang',
  'pendapatan_toko', 'pendapatan_logo', 'pendapatan_kerjasama', 'non_pajak', 'ppn_pk', 'ppn_wapu',
  'beban_toko', 'beban_logo',
  'persediaan_toko', 'persediaan_logo',
  'simsem_uks', 'kas_uks', 'piutang_padi', 'piutang_edc', 'beban_promosi',
];

const COLS_DEBIT  = [5, 6, 7, 14, 15, 19, 20, 21, 22];
const COLS_KREDIT = [8, 9, 10, 11, 12, 13, 16, 17, 18];

// ─────────────────────────────────────────────
// PARSERS
// ─────────────────────────────────────────────

function parseOmiPerTanggal(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

  let bkpBersih = 0, bkpPpn = 0, bkpTotal = 0;
  let nonBkpBersih = 0, grandTotalBersih = 0;

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    const colB = String(row[1] || '').trim().toUpperCase();

    if (colB.includes('BRG KENA PAJAK (BKP)')) {
      bkpBersih = parseFloat(row[7]) || 0;
      bkpPpn    = parseFloat(row[8]) || 0;
      bkpTotal  = parseFloat(row[9]) || 0;
    } else if (colB.includes('BRG TDK KENA PAJAK (NON BKP)')) {
      nonBkpBersih = parseFloat(row[7]) || 0;
    } else if (colB.includes('GRAND TOTAL')) {
      grandTotalBersih = parseFloat(row[7]) || 0;
    }
  }

  const dppTotal = bkpBersih + nonBkpBersih;
  return { bkpBersih, bkpPpn, bkpTotal, nonBkpBersih, grandTotalBersih, dppTotal };
}

function parseOmiTutupHarian(buffer) {
  const text = buffer.toString('utf-8');
  const findVal = (pattern) => {
    const m = text.match(pattern);
    if (!m) return 0;
    const cleanStr = m[1].replace(/\./g, '').replace(',', '.').trim();
    return parseFloat(cleanStr) || 0;
  };

  const promo      = findVal(/PROMO\s*:\s*([\d.,]+)/i);
  const kreditPgw  = findVal(/KREDIT\s+PEGAWAI\s*:\s*([\d.,]+)/i);
  const emoney     = findVal(/E-MONEY\s*:\s*([\d.,]+)/i);
  const tunaiAktual= findVal(/KAS\s+AKTUALL?\s*:\s*([\d.,]+)/i);
  const totalOmset = findVal(/TOTAL\s+OMSET\s*:\s*([\d.,]+)/i);

  return { promo, kreditPgw, emoney, tunaiAktual, totalOmset };
}

function parseSmartFile(buffer, originalFilename = '') {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

  let kategori = null;
  for (let r = 0; r < Math.min(10, rows.length); r++) {
    const rowStr = rows[r].join(' ').toUpperCase();
    if (rowStr.includes('KATEGORI TOKO') || rowStr.includes('RINGKASAN TOKO')) { kategori = 'TOKO'; break; }
    if (rowStr.includes('KATEGORI LOGO') || rowStr.includes('RINGKASAN LOGO')) { kategori = 'LOGO'; break; }
  }
  if (!kategori) {
    const fname = originalFilename.toUpperCase();
    if (fname.includes('TOKO')) kategori = 'TOKO';
    else if (fname.includes('LOGO')) kategori = 'LOGO';
    else kategori = 'TOKO';
  }

  let totalBni = 0, totalQris = 0;
  for (let r = 0; r < rows.length; r++) {
    const label = String(rows[r][1] || rows[r][0] || '').trim().toUpperCase();
    const val   = parseFloat(rows[r][4] || rows[r][3] || rows[r][2]) || 0;
    if (label.includes('BNI') && !label.includes('QRIS')) totalBni += val;
    else if (label.includes('QRIS')) totalQris += val;
  }

  return { kategori, totalBni, totalQris, totalSmart: totalBni + totalQris };
}

function buildEmptyRow(no, namaRef, jenisTx, kwitansi, keterangan) {
  const r = { no, nama_ref: namaRef, jenis_transaksi: jenisTx, kwitansi: kwitansi || '', keterangan: keterangan || '' };
  OMSET_COL_DEFS.slice(5).forEach(c => r[c] = 0);
  return r;
}

function buildOmsetRows(parsedData) {
  const { omiXls, omiTxt, smartToko, smartLogo } = parsedData;
  const rows = [];

  // Baris 1: promo
  const r1 = buildEmptyRow(1, 'promo', '', '', 'Potongan Produk / Diskon');
  r1.tag_promo = omiTxt.promo;
  r1.kas_uks   = omiTxt.promo;
  rows.push(r1);

  // Baris 2: omset omi
  const r2 = buildEmptyRow(2, 'omset omi', '', '', 'Penjualan Toko OMI');
  r2.pendapatan_toko = omiXls.bkpBersih;
  r2.non_pajak       = omiXls.nonBkpBersih;
  r2.ppn_pk          = omiXls.bkpPpn;
  r2.beban_toko      = omiXls.dppTotal;
  r2.persediaan_toko = omiXls.dppTotal;
  rows.push(r2);

  // Baris 3: omset smart
  const r3 = buildEmptyRow(3, 'omset smart', '', '', 'Penjualan SMART TOKO');
  if (smartToko.totalSmart > 0) {
    const dpp = Math.round(smartToko.totalSmart / 1.11);
    const ppn = smartToko.totalSmart - dpp;
    r3.pendapatan_toko = dpp;
    r3.ppn_pk          = ppn;
    r3.beban_toko      = dpp;
    r3.persediaan_toko = dpp;
  }
  rows.push(r3);

  // Baris 4: omset logo
  const r4 = buildEmptyRow(4, 'omset logo', '', '', 'Penjualan SMART LOGO');
  if (smartLogo.totalSmart > 0) {
    const dpp = Math.round(smartLogo.totalSmart / 1.11);
    const ppn = smartLogo.totalSmart - dpp;
    r4.pendapatan_logo = dpp;
    r4.ppn_pk          = ppn;
    r4.beban_logo      = dpp;
    r4.persediaan_logo = dpp;
  }
  rows.push(r4);

  // Baris 5: pegawai
  const r5 = buildEmptyRow(5, 'pegawai', '', '', 'Kredit Anggota Pegawai');
  r5.piutang = omiTxt.kreditPgw;
  rows.push(r5);

  // Baris 6: e-money
  const r6 = buildEmptyRow(6, 'e-money', '', '', 'Transaksi E-Money OMI');
  r6.piutang_edc = omiTxt.emoney;
  rows.push(r6);

  // Baris 7: tunai
  const r7 = buildEmptyRow(7, 'tunai', '', '', 'Kas Tunai Aktual');
  r7.kas_uks = omiTxt.tunaiAktual;
  rows.push(r7);

  // Baris 8: QRIS BNI BNI
  const r8 = buildEmptyRow(8, 'QRIS BNI BNI', 'QRIS BNI', '', 'Pembayaran SMART TOKO');
  r8.piutang_edc = smartToko.totalSmart;
  rows.push(r8);

  // Baris 9: BNI DIVISI INS1 BNI DIVISI INS1
  const r9 = buildEmptyRow(9, 'BNI DIVISI INS1 BNI DIVISI INS1', 'BNI DIVISI INS1', '', 'Pembelian SMART LOGO');
  r9.piutang = smartLogo.totalSmart;
  rows.push(r9);

  return rows;
}

function calculateSummary(rows) {
  let totalDebit = 0, totalKredit = 0;
  rows.forEach(r => {
    COLS_DEBIT.forEach(idx  => { totalDebit  += (r[OMSET_COL_DEFS[idx]]  || 0); });
    COLS_KREDIT.forEach(idx => { totalKredit += (r[OMSET_COL_DEFS[idx]] || 0); });
  });

  const selisih = Math.abs(totalDebit - totalKredit);
  const status_balance = selisih <= 1 ? 'Balance' : 'Unbalance';

  return {
    tanggal: new Date().toISOString().split('T')[0],
    status_balance,
    total_debit: totalDebit,
    total_kredit: totalKredit,
    selisih,
    jumlah_transaksi: rows.length,
  };
}

// ─────────────────────────────────────────────
// ENDPOINTS
// ─────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'LaporGo Vercel Serverless Function active', version: '2.0.0' });
});

app.post('/api/process-laporan', upload.fields([
  { name: 'omi_per_tanggal',  maxCount: 1 },
  { name: 'omi_tutup_harian', maxCount: 1 },
  { name: 'smart_files',      maxCount: 5 },
  { name: 'omi_member',       maxCount: 1 },
  { name: 'detail_smart',     maxCount: 1 },
]), async (req, res) => {
  try {
    const files = req.files || {};
    if (!files['omi_per_tanggal']?.[0] || !files['omi_tutup_harian']?.[0]) {
      return res.status(400).json({ error: 'File wajib OMI (Per Tanggal .xls & Tutup Harian .txt) belum lengkap.' });
    }

    const omiXls = parseOmiPerTanggal(files['omi_per_tanggal'][0].buffer);
    const omiTxt = parseOmiTutupHarian(files['omi_tutup_harian'][0].buffer);

    let smartToko = { totalSmart: 0 }, smartLogo = { totalSmart: 0 };
    if (files['smart_files']) {
      files['smart_files'].forEach(f => {
        const parsed = parseSmartFile(f.buffer, f.originalname);
        if (parsed.kategori === 'LOGO') smartLogo = parsed;
        else smartToko = parsed;
      });
    }

    const omsetRows = buildOmsetRows({ omiXls, omiTxt, smartToko, smartLogo });
    const summary   = calculateSummary(omsetRows);

    return res.json({
      success: true,
      data: { omsetRows, summary, warnings: [] }
    });
  } catch (err) {
    console.error('[process-laporan error]', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = app;
