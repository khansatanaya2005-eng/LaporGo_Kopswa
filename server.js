import express from 'express';
import cors from 'cors';
import multer from 'multer';
import ExcelJS from 'exceljs';
import XLSX from 'xlsx';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function parseRupiah(str) {
  if (str == null) return 0;
  return parseInt(String(str).replace(/Rp\s*/i, '').replace(/\./g, '').replace(/,.*$/, '').trim()) || 0;
}

function parseTxtAmount(line) {
  const m = line.match(/([\d.]+)\s*$/);
  return m ? parseInt(m[1].replace(/\./g, '')) || 0 : 0;
}

function readWb(buffer) {
  return XLSX.read(buffer, { type: 'buffer' });
}

function getCellVal(ws, r, c) {
  return ws[XLSX.utils.encode_cell({ r, c })]?.v ?? null;
}

function findRowByText(ws, text, colIdx = 1, maxRow = 120) {
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
  for (let r = range.s.r; r <= Math.min(range.e.r, maxRow); r++) {
    const v = String(getCellVal(ws, r, colIdx) ?? '');
    if (v.toUpperCase().includes(text.toUpperCase())) return r;
  }
  return -1;
}

function defaultRow() {
  return {
    no: 0, nama_ref: '', jenis_transaksi: '', kwitansi: '', keterangan: '',
    tag_promo: 0, giro_udp: 0, piutang: 0,
    pendapatan_toko: 0, pendapatan_logo: 0, pendapatan_kerjasama: 0,
    non_pajak: 0, ppn_pk: 0, ppn_wapu: 0,
    beban_toko: 0, beban_logo: 0,
    persediaan_toko: 0, persediaan_logo: 0,
    simsem_uks: 0, kas_uks: 0,
    piutang_padi: 0, piutang_edc: 0, beban_promosi: 0,
  };
}

// ─────────────────────────────────────────────
// PARSER 1: LAPORAN PENJUALAN PER TANGGAL.xls
// ─────────────────────────────────────────────
function parseLaporanPerTanggal(buffer) {
  const wb = readWb(buffer);
  const ws = wb.Sheets[wb.SheetNames[0]];

  const rowBKP   = findRowByText(ws, 'BRG KENA PAJAK');
  const rowCukai = findRowByText(ws, 'BRG KENA CUKAI');
  const rowTotal = findRowByText(ws, 'TOTAL');

  if (rowBKP === -1 || rowTotal === -1) {
    throw new Error('PER TANGGAL: Baris "BRG KENA PAJAK" atau "TOTAL" tidak ditemukan');
  }

  // Col indices (0-based): E=4, N=13, S=18, X=23, AH=33, AJ=35
  const g = (row, c) => Number(getCellVal(ws, row, c)) || 0;

  return {
    dppBKP  : g(rowBKP,   33),   // col AH baris BRG KENA PAJAK → bersih
    nonPajak: rowCukai !== -1 ? g(rowCukai, 33) : 0,  // col AH baris BRG KENA CUKAI
    ppnOmi  : Math.round(g(rowTotal, 23)),  // col X  baris TOTAL
    hppOmi  : Math.round(g(rowTotal, 35)),  // col AJ baris TOTAL
    kredit  : g(rowTotal, 13),              // col N  baris TOTAL
    emoney  : g(rowTotal, 18),              // col S  baris TOTAL
  };
}

// ─────────────────────────────────────────────
// PARSER 2: LAPORAN TUTUP HARIAN.txt
// ─────────────────────────────────────────────
function parseTutupHarian(buffer) {
  const lines = buffer.toString('latin1').split('\n');
  let potProduk = 0, tunai = 0, kredit = 0, emoney = 0, ppn = 0, tanggal = '';

  for (const raw of lines) {
    const line = raw.replace(/\r/, '').trim();
    if (/Pot\.Produk/i.test(line))                    potProduk = parseTxtAmount(line);
    else if (/^-\s*Tunai/i.test(line))                tunai     = parseTxtAmount(line);
    else if (/^-\s*Kredit/i.test(line))               kredit    = parseTxtAmount(line);
    else if (/^-\s*E-Money/i.test(line))              emoney    = parseTxtAmount(line);
    else if (/^-\s*PPN\s+[\d]/i.test(line) ||
             /^-\s*PPN$/.test(line.replace(/\s+[\d.,]+$/, ''))) ppn = parseTxtAmount(line);

    const mTgl = raw.match(/Tanggal\s*:\s*(\d{2}-\d{2}-\d{4})/i);
    if (mTgl && !tanggal) tanggal = mTgl[1];
  }

  return { potProduk, tunai, kredit, emoney, ppn, tanggal };
}

// ─────────────────────────────────────────────
// PARSER 3: ringkasan pembayaran logo.xlsx
// ─────────────────────────────────────────────
function parseSmartRingkasan(buffer) {
  const wb = readWb(buffer);
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];

  // Auto-detect TOKO / LOGO
  const header = String(ws['B5']?.v || '');
  let category = 'UNKNOWN';
  if (header.includes('Kategori LOGO') || sheetName.toUpperCase() === 'LOGO') category = 'LOGO';
  else if (header.includes('Kategori TOKO') || sheetName.toUpperCase() === 'TOKO') category = 'TOKO';

  if (category === 'UNKNOWN') {
    throw new Error(`File SMART tidak dikenali. Header B5: "${header}", Sheet: "${sheetName}"`);
  }

  // Parse summary baris B12-B16
  const parseLine = (v) => {
    const m = String(v || '').match(/([\d.,]+)\s*$/);
    return m ? parseRupiah('Rp ' + m[1]) : 0;
  };
  const summary = {
    penjualan : parseLine(ws['B12']?.v),
    dpp       : parseLine(ws['B13']?.v),
    ppn       : parseLine(ws['B14']?.v),
    hpp       : parseLine(ws['B15']?.v),
  };

  // Loop entri pembayaran B10+ sampai "Penjualan :"
  const entries = [];
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
  for (let r = 9; r <= range.e.r; r++) {
    const bVal = String(getCellVal(ws, r, 1) ?? '');
    if (bVal.startsWith('Penjualan :')) break;
    if (bVal.startsWith('  - Voucher:')) {
      const voucherName = bVal.replace('  - Voucher:', '').trim();
      const pelanggan   = String(getCellVal(ws, r, 2) ?? voucherName);
      const total       = parseRupiah(String(getCellVal(ws, r, 3) ?? '0'));
      const dpp         = Math.round(total / 1.11);
      const ppn         = total - dpp;
      entries.push({ voucherName, pelanggan, total, dpp, ppn });
    }
  }

  return { category, summary, entries };
}

// ─────────────────────────────────────────────
// BUILD OMSET ROWS
// ─────────────────────────────────────────────
function buildOmsetRows({ txt, omi, smartResults }) {
  const rows = [];
  const tokoData = smartResults.find(s => s.category === 'TOKO') || null;
  const logoData = smartResults.find(s => s.category === 'LOGO') || null;

  const add = (fields) => rows.push({ ...defaultRow(), ...fields });

  add({ nama_ref: 'promo',       keterangan: 'Potongan Produk / Diskon',   tag_promo: txt.potProduk });
  add({ nama_ref: 'omset omi',   keterangan: 'Penjualan Toko OMI',
        pendapatan_toko: Math.round(omi.dppBKP), non_pajak: Math.round(omi.nonPajak),
        ppn_pk: omi.ppnOmi, beban_toko: omi.hppOmi, persediaan_toko: omi.hppOmi });

  if (tokoData) {
    add({ nama_ref: 'omset smart', keterangan: 'Penjualan SMART TOKO',
          pendapatan_toko: tokoData.summary.dpp, ppn_pk: tokoData.summary.ppn,
          beban_toko: tokoData.summary.hpp, persediaan_toko: tokoData.summary.hpp });
  }
  if (logoData) {
    add({ nama_ref: 'omset logo', keterangan: 'Penjualan SMART LOGO',
          beban_toko: logoData.summary.hpp, persediaan_toko: logoData.summary.hpp });
  }

  add({ nama_ref: 'pegawai',  keterangan: 'Kredit Anggota Pegawai',  piutang: omi.kredit });
  add({ nama_ref: 'e-money',  keterangan: 'Transaksi E-Money OMI',   piutang_edc: omi.emoney });
  add({ nama_ref: 'tunai',    keterangan: 'Kas Tunai Aktual',        kas_uks: txt.tunai });

  if (tokoData) {
    tokoData.entries.forEach(e => add({
      nama_ref: e.pelanggan, jenis_transaksi: e.voucherName,
      keterangan: 'Pembayaran SMART TOKO', piutang_edc: e.total,
    }));
  }
  if (logoData) {
    logoData.entries.forEach(e => add({
      nama_ref: e.pelanggan, jenis_transaksi: e.voucherName,
      keterangan: 'Pembelian SMART LOGO',
      piutang: e.total, pendapatan_toko: e.dpp, ppn_pk: e.ppn,
    }));
  }

  return rows.map((r, i) => ({ ...r, no: i + 1 }));
}

// ─────────────────────────────────────────────
// HITUNG TOTAL
// ─────────────────────────────────────────────
const COLS_DEBIT  = ['tag_promo','giro_udp','piutang','beban_toko','beban_logo','kas_uks','piutang_padi','piutang_edc','beban_promosi'];
const COLS_KREDIT = ['pendapatan_toko','pendapatan_logo','pendapatan_kerjasama','non_pajak','ppn_pk','ppn_wapu','persediaan_toko','persediaan_logo','simsem_uks'];

function sumCol(rows, col) { return rows.reduce((s, r) => s + (Number(r[col]) || 0), 0); }

function calculateTotals(rows) {
  const totalDebit  = COLS_DEBIT.reduce((s, c)  => s + sumCol(rows, c), 0);
  const totalKredit = COLS_KREDIT.reduce((s, c) => s + sumCol(rows, c), 0);
  const selisih     = totalDebit - totalKredit;
  return { totalDebit, totalKredit, selisih, statusBalance: selisih === 0 ? 'Balance' : 'Unbalance' };
}

// ─────────────────────────────────────────────
// VALIDASI SILANG
// ─────────────────────────────────────────────
function runValidations({ txt, omi }) {
  const warns = [];
  if (omi.kredit !== txt.kredit)
    warns.push({ type: 'MISMATCH_KREDIT', severity: 'WARNING',
      message: `Kredit pegawai tidak cocok: OMI=${omi.kredit}, TXT=${txt.kredit}` });
  if (omi.emoney !== txt.emoney)
    warns.push({ type: 'MISMATCH_EMONEY', severity: 'WARNING',
      message: `E-Money tidak cocok: OMI=${omi.emoney}, TXT=${txt.emoney}` });
  if (Math.abs(omi.ppnOmi - txt.ppn) > 1)
    warns.push({ type: 'MISMATCH_PPN', severity: 'WARNING',
      message: `PPN selisih > 1: OMI=${omi.ppnOmi}, TXT=${txt.ppn}` });
  return warns;
}

// ─────────────────────────────────────────────
// GENERATE EXCEL (6 SHEETS)
// ─────────────────────────────────────────────
const OMSET_COL_DEFS = [
  { header: 'NO',                        key: 'no',                   width: 5  },
  { header: 'NAMA DAN REF',              key: 'nama_ref',             width: 30 },
  { header: 'JENIS TRANSAKSI',           key: 'jenis_transaksi',      width: 20 },
  { header: 'KWITANSI',                  key: 'kwitansi',             width: 12 },
  { header: 'KETERANGAN',               key: 'keterangan',            width: 25 },
  { header: 'TAG PROMO SMART KOTA (D)', key: 'tag_promo',             width: 14 },
  { header: 'GIRO UDP (D)',             key: 'giro_udp',              width: 12 },
  { header: 'PIUTANG (D)',              key: 'piutang',               width: 15 },
  { header: 'PENDAPATAN TOKO (K)',      key: 'pendapatan_toko',       width: 15 },
  { header: 'PENDAPATAN LOGO (K)',      key: 'pendapatan_logo',       width: 15 },
  { header: 'PENDAPATAN KERJASAMA (K)',key: 'pendapatan_kerjasama',   width: 16 },
  { header: 'NON PAJAK (K)',            key: 'non_pajak',             width: 12 },
  { header: 'PPN PK (K)',              key: 'ppn_pk',                 width: 12 },
  { header: 'PPN WAPU (K)',            key: 'ppn_wapu',               width: 12 },
  { header: 'BEBAN TOKO (D)',          key: 'beban_toko',             width: 15 },
  { header: 'BEBAN LOGO (D)',          key: 'beban_logo',             width: 15 },
  { header: 'PERSEDIAAN TOKO (K)',     key: 'persediaan_toko',        width: 15 },
  { header: 'PERSEDIAAN LOGO (K)',     key: 'persediaan_logo',        width: 15 },
  { header: 'SIMSEM UKS (K)',         key: 'simsem_uks',             width: 12 },
  { header: 'KAS UKS (D)',            key: 'kas_uks',                width: 12 },
  { header: 'PIUTANG PADI (D)',       key: 'piutang_padi',           width: 12 },
  { header: 'PIUTANG EDC (D)',        key: 'piutang_edc',            width: 15 },
  { header: 'BEBAN PROMOSI (D)',      key: 'beban_promosi',          width: 12 },
];

async function generateExcel({ omsetRows, summary, sourceBuffers }) {
  const wb = new ExcelJS.Workbook();

  /* ---- Sheet 1: OMSET ---- */
  const ws = wb.addWorksheet('OMSET');
  ws.columns = OMSET_COL_DEFS;

  // Style header
  const hRow = ws.getRow(1);
  hRow.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 };
  hRow.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF051923' } };
  hRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  hRow.height    = 35;

  // Data rows
  omsetRows.forEach(row => {
    const r = ws.addRow(row);
    r.eachCell({ includeEmpty: false }, (cell, colNum) => {
      if (colNum >= 6) { cell.numFmt = '#,##0'; cell.alignment = { horizontal: 'right' }; }
    });
  });

  ws.addRow({});

  // Total rows helper
  const addTotalRow = (label, cols, bgColor, fontColor = 'FF000000') => {
    const r = ws.addRow({});
    r.getCell(2).value = label;
    cols.forEach(col => {
      const colDef = OMSET_COL_DEFS.find(d => d.key === col);
      if (!colDef) return;
      const idx = OMSET_COL_DEFS.indexOf(colDef) + 1;
      r.getCell(idx).value  = sumCol(omsetRows, col);
      r.getCell(idx).numFmt = '#,##0';
      r.getCell(idx).alignment = { horizontal: 'right' };
    });
    r.font = { bold: true, color: { argb: fontColor } };
    r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
    return r;
  };

  addTotalRow('TOTAL DEBIT',  COLS_DEBIT,  'FFDBEAFE');
  addTotalRow('TOTAL KREDIT', COLS_KREDIT, 'FFD1FAE5');

  const selRow = ws.addRow({});
  selRow.getCell(2).value  = 'SELISIH';
  selRow.getCell(OMSET_COL_DEFS.length).value  = summary.selisih;
  selRow.getCell(OMSET_COL_DEFS.length).numFmt = '#,##0';
  selRow.font = { bold: true, color: { argb: summary.selisih === 0 ? 'FF16A34A' : 'FFDC2626' } };
  selRow.fill = { type: 'pattern', pattern: 'solid',
    fgColor: { argb: summary.selisih === 0 ? 'FFF0FDF4' : 'FFFEF2F2' } };

  ws.views = [{ state: 'frozen', ySplit: 1 }];

  /* ---- Sheets 2-6: copy source files ---- */
  const sourceCfg = [
    { name: 'detail smart',   key: 'detailSmart'   },
    { name: 'ringkasan toko', key: 'smartToko'      },
    { name: 'ringkasan logo', key: 'smartLogo'      },
    { name: 'omi pertanggal', key: 'omiPerTanggal'  },
    { name: 'omi member',     key: 'omiMember'      },
  ];

  for (const cfg of sourceCfg) {
    const sheet = wb.addWorksheet(cfg.name);
    const buf   = sourceBuffers[cfg.key];
    if (buf) {
      try {
        const srcWb  = XLSX.read(buf, { type: 'buffer' });
        const srcWs  = srcWb.Sheets[srcWb.SheetNames[0]];
        const data   = XLSX.utils.sheet_to_json(srcWs, { header: 1, defval: '' });
        data.forEach(rowArr => sheet.addRow(rowArr));
      } catch (e) {
        sheet.addRow([`Error: ${e.message}`]);
      }
    } else {
      sheet.addRow(['(File tidak diupload)']);
    }
  }

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}

// ─────────────────────────────────────────────
// ENDPOINT: POST /api/process-laporan
// ─────────────────────────────────────────────
app.post('/api/process-laporan', upload.fields([
  { name: 'omi_per_tanggal',  maxCount: 1 },
  { name: 'omi_tutup_harian', maxCount: 1 },
  { name: 'smart_files',      maxCount: 5 },
  { name: 'omi_member',       maxCount: 1 },
  { name: 'detail_smart',     maxCount: 1 },
]), async (req, res) => {
  try {
    const files = req.files || {};

    // Validasi wajib
    const missing = [];
    if (!files.omi_per_tanggal?.[0])  missing.push('LAPORAN PER TANGGAL');
    if (!files.omi_tutup_harian?.[0]) missing.push('LAPORAN TUTUP HARIAN');
    if (!files.smart_files?.length)   missing.push('ringkasan pembayaran SMART');
    if (missing.length) return res.status(400).json({ success: false, error: `File wajib kurang: ${missing.join(', ')}` });

    // Parse file wajib
    const omi = parseLaporanPerTanggal(files.omi_per_tanggal[0].buffer);
    const txt = parseTutupHarian(files.omi_tutup_harian[0].buffer);

    // Parse semua file SMART (auto-detect TOKO/LOGO)
    const smartResults = [];
    const smartErrors  = [];
    for (const f of files.smart_files) {
      try {
        smartResults.push(parseSmartRingkasan(f.buffer));
      } catch (e) {
        smartErrors.push(`${f.originalname}: ${e.message}`);
      }
    }

    // Build OMSET rows
    const omsetRows = buildOmsetRows({ txt, omi, smartResults });

    // Hitung total & validasi
    const summary  = calculateTotals(omsetRows);
    const warnings = runValidations({ txt, omi });
    if (smartErrors.length) {
      smartErrors.forEach(e => warnings.push({ type: 'SMART_PARSE_ERROR', severity: 'ERROR', message: e }));
    }

    // Simpan buffer untuk download nanti (simpan ke memory, max 10 menit)
    const sourceBuffers = {
      omiPerTanggal : files.omi_per_tanggal[0].buffer,
      detailSmart   : files.detail_smart?.[0]?.buffer || null,
      smartToko     : smartResults.find(s => s.category === 'TOKO') ? files.smart_files.find(() => true)?.buffer : null,
      smartLogo     : smartResults.find(s => s.category === 'LOGO') ? files.smart_files.find(() => true)?.buffer : null,
      omiMember     : files.omi_member?.[0]?.buffer || null,
    };

    // Tandai sumber TOKO/LOGO dari file SMART
    for (const f of files.smart_files) {
      try {
        const wb  = readWb(f.buffer);
        const ws  = wb.Sheets[wb.SheetNames[0]];
        const hdr = String(ws['B5']?.v || '');
        const sn  = wb.SheetNames[0].toUpperCase();
        if (hdr.includes('Kategori TOKO') || sn === 'TOKO') sourceBuffers.smartToko = f.buffer;
        else if (hdr.includes('Kategori LOGO') || sn === 'LOGO') sourceBuffers.smartLogo = f.buffer;
      } catch (_) {}
    }

    res.json({
      success: true,
      data: {
        omsetRows,
        summary: {
          ...summary,
          jumlahTransaksi : omsetRows.length,
          tanggal         : txt.tanggal,
        },
        warnings,
        _sourceBuffers: null, // tidak dikirim ke frontend
      }
    });

    // Simpan ke global temp untuk download (sederhana, single-user)
    app.locals.lastResult = { omsetRows, summary, sourceBuffers, tanggal: txt.tanggal };

  } catch (err) {
    console.error('[process-laporan] ERROR:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────
// ENDPOINT: POST /api/download-excel
// ─────────────────────────────────────────────
app.post('/api/download-excel', async (req, res) => {
  try {
    // Bisa pakai lastResult atau terima data dari body
    let omsetRows, summary, sourceBuffers, tanggal;

    if (app.locals.lastResult) {
      ({ omsetRows, summary, sourceBuffers, tanggal } = app.locals.lastResult);
    } else if (req.body?.omsetRows) {
      omsetRows     = req.body.omsetRows;
      summary       = req.body.summary;
      sourceBuffers = {};
      tanggal       = req.body.summary?.tanggal || 'export';
    } else {
      return res.status(400).json({ error: 'Tidak ada data laporan. Jalankan /api/process-laporan dulu.' });
    }

    const excelBuf = await generateExcel({ omsetRows, summary, sourceBuffers });
    const filename = `Laporan_Gabungan_${tanggal || 'export'}.xlsx`.replace(/[/\\]/g, '-');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(excelBuf);
  } catch (err) {
    console.error('[download-excel] ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// ENDPOINT: GET /api/health
// ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: `LaporGo server running on port ${PORT}`, version: '2.0.0' });
});

module.exports = app;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`✅ LaporGo server running → http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
  });
}
