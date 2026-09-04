import * as XLSX from 'xlsx';

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

function getCellVal(ws, r, c) {
  const cellAddress = XLSX.utils.encode_cell({ r, c });
  return ws[cellAddress]?.v ?? null;
}

function findRowByText(ws, text, colIdx = 1, maxRow = 150) {
  const ref = ws['!ref'] || 'A1:AJ150';
  const range = XLSX.utils.decode_range(ref);
  for (let r = range.s.r; r <= Math.min(range.e.r, maxRow); r++) {
    const v = String(getCellVal(ws, r, colIdx) ?? '');
    if (v.toUpperCase().includes(text.toUpperCase())) return r;
  }
  return -1;
}

function parseRupiah(str) {
  if (str == null) return 0;
  return parseInt(String(str).replace(/Rp\s*/i, '').replace(/\./g, '').replace(/,.*$/, '').trim()) || 0;
}

function parseTxtAmount(line) {
  const m = line.match(/([\d.]+)\s*$/);
  return m ? parseInt(m[1].replace(/\./g, '')) || 0 : 0;
}

async function parseOmiPerTanggal(file) {
  if (!file) return { bkpBersih: 0, bkpPpn: 0, bkpTotal: 0, nonBkpBersih: 0, grandTotalBersih: 0, dppTotal: 0 };
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];

  const rowBKP   = findRowByText(ws, 'BRG KENA PAJAK');
  const rowCukai = findRowByText(ws, 'BRG KENA CUKAI');

  const g = (r, c) => Number(getCellVal(ws, r, c)) || 0;

  const bkpBersih    = rowBKP !== -1 ? g(rowBKP, 33) : 0;
  const nonBkpBersih = rowCukai !== -1 ? g(rowCukai, 33) : 0;
  const bkpPpn       = rowBKP !== -1 ? g(rowBKP, 23) : 0;

  const dppTotal = bkpBersih + nonBkpBersih;
  return { bkpBersih, bkpPpn, bkpTotal: bkpBersih + bkpPpn, nonBkpBersih, dppTotal };
}

async function parseOmiTutupHarian(files = []) {
  const fileArray = Array.isArray(files) ? files : [files];
  let fullText = '';
  for (const f of fileArray) {
    if (f && typeof f.text === 'function') {
      fullText += '\n' + (await f.text());
    }
  }
  if (!fullText.trim()) return { promo: 0, kreditPgw: 0, emoney: 0, tunaiAktual: 0, totalOmset: 0 };

  const lines = fullText.split('\n');
  let potProduk = 0, tunai = 0, kredit = 0, emoney = 0;

  for (const raw of lines) {
    const line = raw.replace(/\r/, '').trim();
    if (/Pot\.Produk/i.test(line)) potProduk = parseTxtAmount(line);
    else if (/^-\s*Tunai/i.test(line)) tunai = parseTxtAmount(line);
    else if (/^-\s*Kredit/i.test(line)) kredit = parseTxtAmount(line);
    else if (/^-\s*E-Money/i.test(line)) emoney = parseTxtAmount(line);
  }

  return { promo: potProduk, kreditPgw: kredit, emoney, tunaiAktual: tunai, totalOmset: tunai + kredit + emoney };
}

async function parseSmartFile(file) {
  if (!file) return { kategori: 'TOKO', totalBni: 0, totalQris: 0, totalSmart: 0 };
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];

  const header = String(ws['B5']?.v || '');
  let kategori = 'TOKO';
  if (header.includes('Kategori LOGO') || wb.SheetNames[0].toUpperCase().includes('LOGO')) {
    kategori = 'LOGO';
  }

  const parseLine = (v) => {
    const m = String(v || '').match(/([\d.,]+)\s*$/);
    return m ? parseRupiah('Rp ' + m[1]) : 0;
  };

  const totalSmart = parseLine(ws['B12']?.v) || parseLine(ws['B13']?.v) || 0;

  return { kategori, totalBni: totalSmart, totalQris: 0, totalSmart };
}

function buildEmptyRow(no, namaRef, jenisTx, kwitansi, keterangan) {
  const r = { no, nama_ref: namaRef, jenis_transaksi: jenisTx, kwitansi: kwitansi || '', keterangan: keterangan || '' };
  OMSET_COL_DEFS.slice(5).forEach(c => r[c] = 0);
  return r;
}

function buildOmsetRows(parsedData) {
  const { omiXls, omiTxt, smartToko, smartLogo } = parsedData;
  const rows = [];

  const r1 = buildEmptyRow(1, 'promo', '', '', 'Potongan Produk / Diskon');
  r1.tag_promo = omiTxt.promo;
  r1.kas_uks   = omiTxt.promo;
  rows.push(r1);

  const r2 = buildEmptyRow(2, 'omset omi', '', '', 'Penjualan Toko OMI');
  r2.pendapatan_toko = omiXls.bkpBersih;
  r2.non_pajak       = omiXls.nonBkpBersih;
  r2.ppn_pk          = omiXls.bkpPpn;
  r2.beban_toko      = omiXls.dppTotal;
  r2.persediaan_toko = omiXls.dppTotal;
  rows.push(r2);

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

  const r5 = buildEmptyRow(5, 'pegawai', '', '', 'Kredit Anggota Pegawai');
  r5.piutang = omiTxt.kreditPgw;
  rows.push(r5);

  const r6 = buildEmptyRow(6, 'e-money', '', '', 'Transaksi E-Money OMI');
  r6.piutang_edc = omiTxt.emoney;
  rows.push(r6);

  const r7 = buildEmptyRow(7, 'tunai', '', '', 'Kas Tunai Aktual');
  r7.kas_uks = omiTxt.tunaiAktual;
  rows.push(r7);

  const r8 = buildEmptyRow(8, 'QRIS BNI BNI', 'QRIS BNI', '', 'Pembayaran SMART TOKO');
  r8.piutang_edc = smartToko.totalSmart;
  rows.push(r8);

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

export async function processLaporan(fileSlots) {
  const {
    omiPerTanggal = [],
    omiTutupHarian = [],
    omiStrukTxt = [],
    smartFiles = [],
  } = fileSlots;

  const allTxtFiles = [...omiTutupHarian, ...omiStrukTxt];
  const omiXls = await parseOmiPerTanggal(omiPerTanggal[0]);
  const omiTxt = await parseOmiTutupHarian(allTxtFiles);

  let smartToko = { totalSmart: 0 }, smartLogo = { totalSmart: 0 };
  for (const f of smartFiles) {
    const parsed = await parseSmartFile(f);
    if (parsed.kategori === 'LOGO') smartLogo = parsed;
    else smartToko = parsed;
  }

  const omsetRows = buildOmsetRows({ omiXls, omiTxt, smartToko, smartLogo });
  const summary   = calculateSummary(omsetRows);

  return {
    success: true,
    data: { omsetRows, summary, warnings: [] }
  };
}

export async function downloadExcel(filename = 'Laporan_Gabungan.xlsx') {
  alert('Gunakan Simpan ke Database untuk mengunduh laporan dari Supabase.');
}

export function fmtRupiah(n) {
  if (!n || n === 0) return '-';
  return new Intl.NumberFormat('id-ID').format(n);
}
