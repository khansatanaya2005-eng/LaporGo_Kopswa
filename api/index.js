import express from 'express';
import cors from 'cors';
import multer from 'multer';
import XLSX from 'xlsx';
import ExcelJS from 'exceljs';

const app = express();
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

function findHeaderRow(ws, maxRow = 20) {
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
  for (let r = range.s.r; r <= Math.min(range.e.r, maxRow); r++) {
    for (let c = 0; c <= 40; c++) {
      const v = String(getCellVal(ws, r, c) ?? '').toUpperCase();
      if (v === 'TUNAI' || v === 'KREDIT' || v === 'DEBIT') return r;
    }
  }
  return -1;
}

function findColByHeader(ws, headerRow, label) {
  if (headerRow === -1) return -1;
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
  for (let c = range.s.c; c <= range.e.c; c++) {
    const v = String(getCellVal(ws, headerRow, c) ?? '').toUpperCase();
    if (v.includes(label.toUpperCase())) return c;
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
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];

  const rowBKP      = findRowByText(ws, 'BRG KENA PAJAK');
  const rowCukai    = findRowByText(ws, 'BRG KENA CUKAI');
  const rowPpnBebas = findRowByText(ws, 'PPN BEBAS');
  const rowTotal    = findRowByText(ws, 'TOTAL');

  if (rowBKP === -1 || rowTotal === -1) {
    throw new Error('PER TANGGAL: Baris "BRG KENA PAJAK" atau "TOTAL" tidak ditemukan');
  }

  const headerRow     = findHeaderRow(ws);
  const debitColIdx   = findColByHeader(ws, headerRow, 'debit');
  const voucherColIdx = findColByHeader(ws, headerRow, 'voucher');

  // Col indices (0-based): N=13, S=18, X=23, AH=33, AJ=35
  const g = (row, c) => Number(getCellVal(ws, row, c)) || 0;

  const cukai    = rowCukai    !== -1 ? g(rowCukai, 33)    : 0;
  const ppnBebas = rowPpnBebas !== -1 ? g(rowPpnBebas, 33) : 0;

  return {
    dppBKP          : g(rowBKP, 33),   // col AH baris BRG KENA PAJAK → bersih
    cukai           : cukai,
    ppnBebas        : ppnBebas,
    nonPajak        : cukai + ppnBebas, // col AH baris BRG KENA CUKAI + PPN BEBAS
    ppnOmi          : Math.round(g(rowTotal, 23)),  // col X  baris TOTAL
    hppOmi          : Math.round(g(rowTotal, 35)),  // col AJ baris TOTAL
    kredit          : g(rowTotal, 13),              // col N  baris TOTAL
    emoney          : g(rowTotal, 18),              // col S  baris TOTAL
    debitCard       : debitColIdx !== -1 ? g(rowTotal, debitColIdx) : 0,
    voucherPotongan : voucherColIdx !== -1 ? g(rowTotal, voucherColIdx) : 0,
  };
}

// ─────────────────────────────────────────────
// PARSER 2: LAPORAN TUTUP HARIAN.txt
// ─────────────────────────────────────────────
function parseTutupHarian(buffer) {
  const lines = buffer.toString('latin1').split('\n');
  let potProduk = 0, tunai = 0, kredit = 0, emoney = 0, ppn = 0, tanggal = '';
  let debitCard = 0, creditCard = 0, voucherPotongan = 0;

  for (const raw of lines) {
    const line = raw.replace(/\r/, '').trim();
    if (/Pot\.Produk/i.test(line))                    potProduk       = parseTxtAmount(line);
    else if (/^-\s*Tunai/i.test(line))                tunai           = parseTxtAmount(line);
    else if (/^-\s*Kredit/i.test(line))               kredit          = parseTxtAmount(line);
    else if (/^-\s*E-Money/i.test(line))              emoney          = parseTxtAmount(line);
    else if (/^-\s*Debit\s*Card/i.test(line))         debitCard       = parseTxtAmount(line);
    else if (/^-\s*Credit\s*Card/i.test(line))        creditCard      = parseTxtAmount(line);
    else if (/^-\s*Voucher/i.test(line))              voucherPotongan = parseTxtAmount(line);
    else if (/^-\s*PPN\s+[\d]/i.test(line) ||
             /^-\s*PPN$/.test(line.replace(/\s+[\d.,]+$/, ''))) ppn = parseTxtAmount(line);

    // TODO: Point Belanja   — belum ada arahan masuk kolom jurnal mana
    // TODO: Pot.GWP         — belum ada arahan
    // TODO: Disc.Tot.Struk  — belum ada arahan
    // TODO: Kas Aktual      — belum ada arahan
    // TODO: Ambil Tunai     — belum ada arahan
    // TODO: Ambil Drawer    — belum ada arahan
    // TODO: Pay Out         — belum ada arahan

    const mTgl = raw.match(/Tanggal\s*:\s*(\d{2}-\d{2}-\d{4})/i);
    if (mTgl && !tanggal) tanggal = mTgl[1];
  }

  return { potProduk, tunai, kredit, emoney, ppn, tanggal, debitCard, creditCard, voucherPotongan };
}

// ─────────────────────────────────────────────
// PARSER 3: ringkasan pembayaran (TOKO / LOGO)
// ─────────────────────────────────────────────
function parseSmartRingkasan(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];

  const header = String(ws['B5']?.v || '');
  let category = 'UNKNOWN';
  if (header.includes('Kategori LOGO') || sheetName.toUpperCase() === 'LOGO') category = 'LOGO';
  else if (header.includes('Kategori TOKO') || sheetName.toUpperCase() === 'TOKO') category = 'TOKO';

  if (category === 'UNKNOWN') {
    throw new Error(`File SMART tidak dikenali. Header B5: "${header}", Sheet: "${sheetName}"`);
  }

  const parseLine = (v) => {
    const m = String(v || '').match(/([\d.,]+)\s*$/);
    return m ? parseRupiah('Rp ' + m[1]) : 0;
  };

  const rowPenjualan = findRowByText(ws, 'Penjualan :');
  const rowDpp       = findRowByText(ws, 'DPP :');
  const rowPpnS      = findRowByText(ws, 'PPN :');
  const rowHpp       = findRowByText(ws, 'HPP :');

  const summary = {
    penjualan : rowPenjualan !== -1 ? parseLine(getCellVal(ws, rowPenjualan, 1)) : 0,
    dpp       : rowDpp       !== -1 ? parseLine(getCellVal(ws, rowDpp,       1)) : 0,
    ppn       : rowPpnS      !== -1 ? parseLine(getCellVal(ws, rowPpnS,      1)) : 0,
    hpp       : rowHpp       !== -1 ? parseLine(getCellVal(ws, rowHpp,       1)) : 0,
  };

  // Loop entri voucher
  const entries = [];
  let currentSection = null;
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
  for (let r = 9; r <= range.e.r; r++) {
    const bVal = String(getCellVal(ws, r, 1) ?? '').trim();
    if (bVal.startsWith('Penjualan :')) break;
    if (bVal === '* Voucher') { currentSection = 'VOUCHER'; continue; }
    if (bVal === '* Piutang') { currentSection = 'PIUTANG'; continue; }
    if (bVal.startsWith('  - Voucher:')) {
      const voucherName = bVal.replace('  - Voucher:', '').trim();
      const pelanggan   = String(getCellVal(ws, r, 2) ?? voucherName);
      const total       = parseRupiah(String(getCellVal(ws, r, 3) ?? '0'));
      const dpp         = Math.round(total / 1.11);
      const ppn         = total - dpp;
      entries.push({ section: currentSection, voucherName, pelanggan, total, dpp, ppn });
    }
  }

  return { category, summary, entries };
}

// ─────────────────────────────────────────────
// KLASIFIKASI ENTITAS & HELPER NON-TUNAI
// ─────────────────────────────────────────────
const E_WALLET_KEYWORDS = ['QRIS', 'DANA', 'OVO', 'GOPAY', 'SHOPEEPAY', 'LINKAJA'];

function isElectronicWallet(nama) {
  const upper = String(nama || '').toUpperCase();
  return E_WALLET_KEYWORDS.some(kw => upper.includes(kw));
}

function classifyEntitas(nama, noAnggota = '') {
  const trimmed = String(nama || '').trim();
  const noStr   = String(noAnggota || '').trim();
  if (
    trimmed.startsWith('~') ||
    trimmed.startsWith('@') ||
    noStr.startsWith('100') ||
    /DIVISI|PT\.|PT |KCP|KANTOR|CABANG/i.test(trimmed)
  ) {
    const cleanName = trimmed.replace(/^[~@]/, '').trim();
    return { tipe: 'DIVISI', namaBersih: cleanName };
  }
  return { tipe: 'PERORANGAN', namaBersih: trimmed };
}

// ─────────────────────────────────────────────
// PARSER 4: LAPORAN PER STRUK (.txt)
// ─────────────────────────────────────────────
function parseLaporanPerStruk(buffer, filename = '') {
  const lines = buffer.toString('latin1').split('\n').map(l => l.replace(/\r/, ''));

  let noAnggota = '', namaAnggota = '', noStruk = '';
  let totalBelanja = 0, potonganProduk = 0, totalSetelahDiskon = 0, pembayaranKredit = 0;

  // Coba ekstrak noStruk dari nama file: "[TANGGAL] [NAMA] [NOMOR].txt"
  const fileMatch = filename.match(/(\d+)\.txt$/i);
  if (fileMatch) noStruk = fileMatch[1];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let m;
    if (m = line.match(/No\.Anggota\s*:\s*(\d+)/i))            noAnggota          = m[1];
    if (m = line.match(/Nama Anggota\s*:\s*(.+)/i))             namaAnggota        = m[1].trim();
    if (/TOTAL BELANJA/i.test(line))                             totalBelanja       = parseTxtAmount(line);
    if (/POTONGAN PRODUK/i.test(line))                          potonganProduk     = parseTxtAmount(line);
    if (/^TOTAL[^B]/i.test(line) && !/BELANJA/i.test(line))    totalSetelahDiskon = parseTxtAmount(line);
    if (/PEMBAYARAN KREDIT/i.test(line))                        pembayaranKredit   = parseTxtAmount(line);
  }

  // Hanya proses DIVISI, skip PERORANGAN
  const { tipe, namaBersih } = classifyEntitas(namaAnggota, noAnggota);
  if (tipe !== 'DIVISI') return null;

  // Blok pajak — LOOP (bukan if/else), support 1-3 blok sekaligus
  let dpp_ppn = 0, ppn_ppn = 0, nonPajak = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const next = lines[i + 1] || '';

    // BLOK 1: "N Item PPN" (bukan PPN Bebas)
    if (/\d+\s*Item PPN/i.test(line) && !/PPN Bebas/i.test(line)) {
      const mD = next.match(/DPP=\s*([0-9.]+)/i);
      const mP = next.match(/PPN=\s*([0-9.]+)/i);
      if (mD) dpp_ppn += parseInt(mD[1].replace(/\./g, '')) || 0;
      if (mP) ppn_ppn += parseInt(mP[1].replace(/\./g, '')) || 0;
    }
    // BLOK 2: "**** : N Item PPN Bebas" — DPP masuk nonPajak, PPN diabaikan
    if (/\*{4}\s*:\s*\d+\s*Item PPN Bebas/i.test(line)) {
      const mD = next.match(/DPP=\s*([0-9.]+)/i);
      if (mD) nonPajak += parseInt(mD[1].replace(/\./g, '')) || 0;
    }
    // BLOK 3: "** : N Item Kena Cukai" — DPP masuk nonPajak, tidak ada PPN
    if (/\*{2}\s*:\s*\d+\s*Item Kena Cukai/i.test(line) && !/\*{4}/.test(line)) {
      const mD = next.match(/DPP=\s*([0-9.]+)/i);
      if (mD) nonPajak += parseInt(mD[1].replace(/\./g, '')) || 0;
    }
  }

  // Validasi internal (toleransi ±5 untuk pembulatan)
  const totalPajak    = dpp_ppn + ppn_ppn + nonPajak;
  const totalExpected = totalSetelahDiskon + potonganProduk;
  if (Math.abs(totalPajak - totalExpected) > 5) {
    console.warn(`[parseLaporanPerStruk] WARNING ${filename}: ` +
      `dpp+ppn+nonPajak=${totalPajak} != total+potongan=${totalExpected}`);
  }

  return {
    section: 'DIVISI',
    nama: namaBersih,
    noAnggota,
    noStruk: noStruk || noAnggota,
    totalBelanja, potonganProduk, totalSetelahDiskon, pembayaranKredit,
    dpp: dpp_ppn, ppn: ppn_ppn, nonPajak,
  };
}

// ─────────────────────────────────────────────
// PARSER 5: LAPORAN PER MEMBER (.xlsx/.xls)
// ─────────────────────────────────────────────
function parseLaporanPerMember(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');

  let totalPerorangan = 0;
  let currentTipe = null;

  for (let r = range.s.r; r <= range.e.r; r++) {
    const cellB = String(getCellVal(ws, r, 1) ?? '').trim();
    // Deteksi baris "NAMA :"
    if (/^NAMA\s*:/i.test(cellB)) {
      const namaVal = String(getCellVal(ws, r, 3) ?? '').trim(); // Kolom D
      const noAnggotaVal = String(getCellVal(ws, r, 14) ?? '').trim(); // Kolom O
      currentTipe = classifyEntitas(namaVal, noAnggotaVal).tipe;
      continue;
    }
    // Ambil nilai TOTAL hanya dari blok PERORANGAN
    if (/^TOTAL$/i.test(cellB) && currentTipe === 'PERORANGAN') {
      // Nilai Net berada di kolom AF (idx 31)
      let netVal = Number(getCellVal(ws, r, 31)) || 0;
      if (!netVal) {
        // Fallback scan dari kanan kolom baris jika bergeser
        for (let c = Math.min(range.e.c, 40); c >= 15; c--) {
          const v = Number(getCellVal(ws, r, c));
          if (v && v > 0) { netVal = v; break; }
        }
      }
      totalPerorangan += netVal;
      currentTipe = null;
    }
  }

  return { total: totalPerorangan };
}

// ─────────────────────────────────────────────
// BUILD OMSET ROWS
// ─────────────────────────────────────────────
function buildOmsetRows({ txt, omi, smartResults, divisiStrukList = [], memberData = { total: 0 } }) {
  const rows = [];
  const tokoData = smartResults.find(s => s.category === 'TOKO') || null;
  const logoData = smartResults.find(s => s.category === 'LOGO') || null;
  const add = (fields) => rows.push({ ...defaultRow(), ...fields });

  // Pre-compute SUM dari semua struk DIVISI (untuk rumus pengurangan agregat)
  const sumDivDpp      = divisiStrukList.reduce((s, d) => s + d.dpp,      0);
  const sumDivPpn      = divisiStrukList.reduce((s, d) => s + d.ppn,      0);
  const sumDivNonPajak = divisiStrukList.reduce((s, d) => s + d.nonPajak, 0);

  // Helper untuk filter entri SMART yang dipecah single-line
  const epToko = tokoData
    ? tokoData.entries.filter(e => e.section === 'PIUTANG' && !isElectronicWallet(e.pelanggan))
    : [];
  const sumSmartTokoPiutangDpp = epToko.reduce((s, e) => s + e.dpp, 0);
  const sumSmartTokoPiutangPpn = epToko.reduce((s, e) => s + e.ppn, 0);

  const epLogo = logoData
    ? logoData.entries.filter(e => e.section === 'PIUTANG' && !isElectronicWallet(e.pelanggan))
    : [];
  const sumSmartLogoPiutangDpp = epLogo.reduce((s, e) => s + e.dpp, 0);
  const sumSmartLogoPiutangPpn = epLogo.reduce((s, e) => s + e.ppn, 0);

  // 1. Promo
  add({ nama_ref: 'PROMO ', keterangan: 'Potongan Produk / Diskon', tag_promo: txt.potProduk });

  // 2. Omset OMI (rumus pengurangan agregat)
  add({
    nama_ref        : 'OMSET OMI',
    keterangan      : 'Penjualan Toko OMI',
    pendapatan_toko : Math.round(omi.dppBKP - sumDivDpp),
    ppn_pk          : Math.round(omi.ppnOmi - sumDivPpn),
    non_pajak       : Math.round((omi.cukai + omi.ppnBebas) - sumDivNonPajak),
    beban_toko      : omi.hppOmi,
    persediaan_toko : omi.hppOmi,
  });

  // 3. Omset SMART TOKO (rumus pengurangan agregat)
  if (tokoData) {
    add({
      nama_ref        : 'OMSET SMART ',
      keterangan      : 'Penjualan SMART TOKO',
      pendapatan_toko : Math.round(tokoData.summary.dpp - sumSmartTokoPiutangDpp),
      ppn_pk          : Math.round(tokoData.summary.ppn - sumSmartTokoPiutangPpn),
      beban_toko      : tokoData.summary.hpp,
      persediaan_toko : tokoData.summary.hpp,
    });
  }

  // 4. Omset SMART LOGO (rumus pengurangan agregat)
  if (logoData) {
    add({
      nama_ref        : 'OMSET LOGO ',
      keterangan      : 'Penjualan SMART LOGO',
      pendapatan_toko : Math.round(logoData.summary.dpp - sumSmartLogoPiutangDpp),
      ppn_pk          : Math.round(logoData.summary.ppn - sumSmartLogoPiutangPpn),
      beban_toko      : logoData.summary.hpp,
      persediaan_toko : logoData.summary.hpp,
    });
  }

  // 5. E-Money
  if (omi.emoney > 0) {
    add({ nama_ref: 'E-MONEY ', keterangan: 'Transaksi E-Money OMI', piutang_edc: omi.emoney });
  }

  // 6. EDC / Debit Card
  if (omi.debitCard > 0) {
    add({ nama_ref: 'EDC', keterangan: 'Transaksi Debit Card OMI', piutang_edc: omi.debitCard });
  }

  // 7. Pegawai / Perorangan (diambil dari rekap Laporan Per Member)
  add({ nama_ref: 'PEGAWAI ', keterangan: 'Kredit Anggota Pegawai', piutang: memberData.total });

  // 8. Tunai
  add({ nama_ref: 'TUNAI ', keterangan: 'Kas Tunai Aktual', kas_uks: txt.tunai });

  // 9. Beban Promosi dari Tutup Harian
  if (txt.voucherPotongan > 0) {
    add({ nama_ref: 'BEBAN PROMOSI', keterangan: 'Voucher / Promo Tutup Harian', beban_promosi: txt.voucherPotongan });
  }

  // 10. Struk DIVISI OMI (Single-Row per Transaksi!)
  divisiStrukList.forEach(struk => {
    add({
      nama_ref        : struk.nama,
      kwitansi        : struk.noStruk || '',
      keterangan      : 'Kredit Anggota Divisi',
      tag_promo       : struk.potonganProduk > 0 ? struk.potonganProduk : 0,
      piutang         : struk.pembayaranKredit,
      pendapatan_toko : struk.dpp,
      ppn_pk          : struk.ppn,
      non_pajak       : struk.nonPajak > 0 ? struk.nonPajak : 0,
    });
  });

  // 11. SMART TOKO entries per section (Single-Row per Transaksi!)
  if (tokoData) {
    tokoData.entries.forEach(e => {
      if (e.section === 'VOUCHER') {
        add({
          nama_ref        : e.pelanggan,
          jenis_transaksi : e.voucherName,
          keterangan      : 'Beban Promosi SMART TOKO',
          beban_promosi   : e.total,
        });
      } else if (e.section === 'PIUTANG') {
        if (isElectronicWallet(e.pelanggan)) {
          add({
            nama_ref        : e.pelanggan,
            jenis_transaksi : e.voucherName,
            keterangan      : 'Pembayaran E-Wallet SMART TOKO',
            piutang_edc     : e.total,
          });
        } else {
          // Institusi/Divisi — Single Row (Debit: Piutang, Kredit: Pendapatan + PPN)
          add({
            nama_ref        : e.pelanggan,
            jenis_transaksi : e.voucherName,
            keterangan      : 'Piutang SMART TOKO',
            piutang         : e.total,
            pendapatan_toko : e.dpp,
            ppn_pk          : e.ppn,
          });
        }
      }
    });
  }

  // 12. SMART LOGO entries (Single-Row per Transaksi!)
  if (logoData) {
    logoData.entries.forEach(e => {
      if (e.section === 'VOUCHER') {
        add({
          nama_ref        : e.pelanggan,
          jenis_transaksi : e.voucherName,
          keterangan      : 'Beban Promosi SMART LOGO',
          beban_promosi   : e.total,
        });
      } else if (e.section === 'PIUTANG') {
        if (isElectronicWallet(e.pelanggan)) {
          add({
            nama_ref        : e.pelanggan,
            jenis_transaksi : e.voucherName,
            keterangan      : 'Pembayaran E-Wallet SMART LOGO',
            piutang_edc     : e.total,
          });
        } else {
          add({
            nama_ref        : e.pelanggan,
            jenis_transaksi : e.voucherName,
            keterangan      : 'Piutang SMART LOGO',
            piutang         : e.total,
            pendapatan_toko : e.dpp,
            ppn_pk          : e.ppn,
          });
        }
      }
    });
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
function runValidations({ txt, omi, divisiStrukList = [], memberData = { total: 0 } }) {
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

  // Rekonsiliasi Kredit Anggota (Bagian 5)
  const totalKreditSeharusnya = (divisiStrukList || []).reduce((s, d) => s + d.pembayaranKredit, 0)
                              + (memberData?.total || 0);
  if (totalKreditSeharusnya !== omi.kredit) {
    warns.push({ type: 'REKON_KREDIT', severity: 'WARNING',
      message: `Rekonsiliasi Kredit Anggota tidak cocok: Divisi+Perorangan=${totalKreditSeharusnya}, OMI.kredit=${omi.kredit}. Kemungkinan ada struk yang belum diupload atau perorangan salah tandai.` });
  }

  // Validasi total pembayaran vs total penjualan (Bagian 5)
  const totalPembayaranAktual = txt.tunai + txt.kredit + txt.emoney +
                                (txt.debitCard || 0) + (txt.creditCard || 0);
  const totalPenjualan = omi.dppBKP + omi.ppnOmi + omi.nonPajak;
  const TOLERANSI = 5000; // Rp 5.000
  if (Math.abs(totalPembayaranAktual - totalPenjualan) > TOLERANSI) {
    warns.push({ type: 'REKON_PEMBAYARAN', severity: 'WARNING',
      message: `Total pembayaran aktual (${totalPembayaranAktual}) selisih Rp${Math.abs(totalPembayaranAktual - totalPenjualan)} dari total penjualan (${totalPenjualan}).` });
  }

  return warns;
}

// In-memory cache for raw sheet buffers (auto-cleaned after 2 hours)
const reportBuffersCache = new Map();
function cleanOldBuffers() {
  const now = Date.now();
  for (const [key, val] of reportBuffersCache.entries()) {
    if (now - val.timestamp > 2 * 60 * 60 * 1000) {
      reportBuffersCache.delete(key);
    }
  }
}

// ─────────────────────────────────────────────
// ENDPOINT: POST /api/process-laporan
// ─────────────────────────────────────────────
app.post('/api/process-laporan', upload.fields([
  { name: 'omi_per_tanggal',  maxCount: 1   },
  { name: 'omi_tutup_harian', maxCount: 1   },
  { name: 'smart_files',      maxCount: 5   },
  { name: 'smart_toko',       maxCount: 1   },
  { name: 'smart_logo',       maxCount: 1   },
  { name: 'omi_member',       maxCount: 1   },
  { name: 'per_struk',        maxCount: 100 },
  { name: 'detail_smart',     maxCount: 1   },
  { name: 'omi_per_struk',    maxCount: 1   },
  { name: 'omi_disc_item',    maxCount: 1   },
  { name: 'omi_pareto',       maxCount: 1   },
  { name: 'omi_analisa',      maxCount: 1   },
  { name: 'omi_persediaan',   maxCount: 1   },
]), (req, res) => {
  try {
    cleanOldBuffers();
    const files = req.files || {};

    const missing = [];
    if (!files.omi_per_tanggal?.[0])  missing.push('LAPORAN PER TANGGAL');
    if (!files.omi_tutup_harian?.[0]) missing.push('LAPORAN TUTUP HARIAN');
    if (missing.length) return res.status(400).json({ success: false, error: `File wajib kurang: ${missing.join(', ')}` });

    const omi = parseLaporanPerTanggal(files.omi_per_tanggal[0].buffer);
    const txt = parseTutupHarian(files.omi_tutup_harian[0].buffer);

    const warnings = [];

    // Parse omi_member
    let memberData = { total: 0 };
    if (files.omi_member?.[0]) {
      try {
        memberData = parseLaporanPerMember(files.omi_member[0].buffer);
      } catch (e) {
        warnings.push({ type: 'MEMBER_PARSE_ERROR', severity: 'WARNING', message: e.message });
      }
    } else {
      warnings.push({ type: 'MEMBER_MISSING', severity: 'WARNING',
        message: 'Laporan Per Member tidak diupload — kredit perorangan tidak akan terhitung.' });
    }

    // Parse per_struk (multiple files)
    const divisiStrukList = [];
    for (const f of (files.per_struk || [])) {
      try {
        const result = parseLaporanPerStruk(f.buffer, f.originalname);
        if (result) divisiStrukList.push(result); // null = PERORANGAN, di-skip
      } catch (e) {
        warnings.push({ type: 'STRUK_PARSE_ERROR', severity: 'ERROR',
          message: `${f.originalname}: ${e.message}` });
      }
    }
    if (!files.per_struk?.length) {
      warnings.push({ type: 'STRUK_MISSING', severity: 'WARNING',
        message: 'Laporan Per Struk tidak diupload — kredit divisi tidak akan terhitung.' });
    }

    const smartAllFiles = [
      ...(files.smart_files || []),
      ...(files.smart_toko || []),
      ...(files.smart_logo || []),
    ];

    const smartResults = [];
    const smartErrors  = [];
    for (const f of smartAllFiles) {
      try {
        smartResults.push(parseSmartRingkasan(f.buffer));
      } catch (e) {
        smartErrors.push(`${f.originalname}: ${e.message}`);
      }
    }

    const smartConfirmation = req.body.smart_confirmation || null;

    const omsetRows = buildOmsetRows({ txt, omi, smartResults, divisiStrukList, memberData });
    const summary   = calculateTotals(omsetRows);
    const valWarnings = runValidations({ txt, omi, divisiStrukList, memberData });
    warnings.push(...valWarnings);

    if (smartErrors.length) {
      smartErrors.forEach(e => warnings.push({ type: 'SMART_PARSE_ERROR', severity: 'ERROR', message: e }));
    }

    // Simpan buffer file sumber untuk multi-sheet Excel generator
    const reportId = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    reportBuffersCache.set(reportId, {
      timestamp: Date.now(),
      detailSmartBuffer   : files.detail_smart?.[0]?.buffer || null,
      perStrukXlsBuffer   : files.omi_per_struk?.[0]?.buffer || null,
      smartTokoBuffer     : (files.smart_toko?.[0] || smartAllFiles.find(f => /toko/i.test(f.originalname)))?.buffer || null,
      smartLogoBuffer     : (files.smart_logo?.[0] || smartAllFiles.find(f => /logo/i.test(f.originalname)))?.buffer || null,
      omiPerTanggalBuffer : files.omi_per_tanggal?.[0]?.buffer || null,
      omiMemberBuffer     : files.omi_member?.[0]?.buffer || null,
    });

    return res.status(200).json({
      success: true,
      data: {
        reportId,
        omsetRows,
        summary: {
          ...summary,
          jumlahTransaksi : omsetRows.length,
          tanggal         : txt.tanggal,
          smartConfirmation,
        },
        warnings,
      }
    });
  } catch (err) {
    console.error('[process-laporan]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────
// GENERATE EXCEL (MULTI-SHEET: OMSET, detail smart, Sheet1, ringkasan, omi)
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

function appendSourceSheet(wbOut, sheetName, buffer) {
  if (!buffer) return;
  try {
    const wbSrc = XLSX.read(buffer, { type: 'buffer' });
    const firstSheet = wbSrc.Sheets[wbSrc.SheetNames[0]];
    if (!firstSheet) return;
    const sheetData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
    const ws = wbOut.addWorksheet(sheetName);
    sheetData.forEach(row => ws.addRow(row));
  } catch (err) {
    console.warn(`[appendSourceSheet] Error adding ${sheetName}:`, err.message);
  }
}

async function generateExcel({ omsetRows, summary, reportId = null }) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('OMSET');
  ws.columns = OMSET_COL_DEFS;

  const hRow = ws.getRow(1);
  hRow.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 };
  hRow.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF051923' } };
  hRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  hRow.height    = 35;

  omsetRows.forEach(row => {
    const r = ws.addRow(row);
    r.eachCell({ includeEmpty: false }, (cell, colNum) => {
      if (colNum >= 6) { cell.numFmt = '#,##0'; cell.alignment = { horizontal: 'right' }; }
    });
  });

  ws.addRow({});

  const grandTotalDebit  = summary?.totalDebit  ?? COLS_DEBIT.reduce((s, c) => s + sumCol(omsetRows, c), 0);
  const grandTotalKredit = summary?.totalKredit ?? COLS_KREDIT.reduce((s, c) => s + sumCol(omsetRows, c), 0);
  const currentSelisih   = summary?.selisih ?? Math.abs(grandTotalDebit - grandTotalKredit);

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
  selRow.getCell(OMSET_COL_DEFS.length).value  = currentSelisih;
  selRow.getCell(OMSET_COL_DEFS.length).numFmt = '#,##0';
  selRow.font = { bold: true, color: { argb: currentSelisih === 0 ? 'FF16A34A' : 'FFDC2626' } };
  selRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: currentSelisih === 0 ? 'FFF0FDF4' : 'FFFEF2F2' } };

  // ── TABEL RINGKASAN TERPISAH
  ws.addRow({});
  ws.addRow({});

  const sumHeaderRow = ws.addRow({});
  sumHeaderRow.getCell(2).value = 'RINGKASAN LAPORAN';
  sumHeaderRow.getCell(3).value = 'JUMLAH (RP)';
  sumHeaderRow.getCell(2).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 };
  sumHeaderRow.getCell(3).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 };
  sumHeaderRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF051923' } };
  sumHeaderRow.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF051923' } };
  sumHeaderRow.getCell(3).alignment = { horizontal: 'right' };

  const sumDebitRow = ws.addRow({});
  sumDebitRow.getCell(2).value = 'TOTAL DEBIT';
  sumDebitRow.getCell(3).value = grandTotalDebit;
  sumDebitRow.getCell(3).numFmt = '#,##0';
  sumDebitRow.getCell(3).alignment = { horizontal: 'right' };
  sumDebitRow.font = { bold: true };
  sumDebitRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };

  const sumKreditRow = ws.addRow({});
  sumKreditRow.getCell(2).value = 'TOTAL KREDIT';
  sumKreditRow.getCell(3).value = grandTotalKredit;
  sumKreditRow.getCell(3).numFmt = '#,##0';
  sumKreditRow.getCell(3).alignment = { horizontal: 'right' };
  sumKreditRow.font = { bold: true };
  sumKreditRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };

  const sumSelisihRow = ws.addRow({});
  sumSelisihRow.getCell(2).value = 'SELISIH';
  sumSelisihRow.getCell(3).value = currentSelisih;
  sumSelisihRow.getCell(3).numFmt = '#,##0';
  sumSelisihRow.getCell(3).alignment = { horizontal: 'right' };
  sumSelisihRow.font = { bold: true, color: { argb: currentSelisih === 0 ? 'FF16A34A' : 'FFDC2626' } };
  sumSelisihRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: currentSelisih === 0 ? 'FFF0FDF4' : 'FFFEF2F2' } };

  ws.views = [{ state: 'frozen', ySplit: 1 }];

  // ── GABUNGKAN SHEET SUMBER JIKA BUFFER TERSEDIA ──
  if (reportId && reportBuffersCache.has(reportId)) {
    const raw = reportBuffersCache.get(reportId);
    appendSourceSheet(wb, 'detail smart ', raw.detailSmartBuffer);
    appendSourceSheet(wb, 'Sheet1',        raw.perStrukXlsBuffer);
    appendSourceSheet(wb, 'ringkasan toko', raw.smartTokoBuffer);
    appendSourceSheet(wb, 'ringkasan logo', raw.smartLogoBuffer);
    appendSourceSheet(wb, 'omi pertanggal ', raw.omiPerTanggalBuffer);
    appendSourceSheet(wb, 'omi member ',   raw.omiMemberBuffer);
  }

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}

// ─────────────────────────────────────────────
// ENDPOINT: POST /api/download-excel
// ─────────────────────────────────────────────
app.post('/api/download-excel', async (req, res) => {
  try {
    const { omsetRows, summary, tanggal, reportId } = req.body || {};
    
    if (!omsetRows || !summary) {
      return res.status(400).json({ error: 'Data laporan tidak lengkap' });
    }

    const excelBuf = await generateExcel({ omsetRows, summary, reportId });
    const filename = `Laporan_Gabungan_${tanggal || 'export'}.xlsx`.replace(/[/\\]/g, '-');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(excelBuf);
  } catch (err) {
    console.error('[download-excel] ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'LaporGo API running on Vercel', version: '2.1.0' });
});

export {
  parseLaporanPerTanggal,
  parseTutupHarian,
  parseSmartRingkasan,
  parseLaporanPerStruk,
  classifyEntitas,
  isElectronicWallet,
  buildOmsetRows,
  calculateTotals,
  runValidations,
  generateExcel
};

export default app;
