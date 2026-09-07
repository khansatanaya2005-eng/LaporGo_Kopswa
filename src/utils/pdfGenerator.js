import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { terbilang } from './terbilang';
import { DEFAULT_COA_MAP } from '../data/mockData';

// Helper format angka tanpa desimal (titik ribuan)
function formatNumber(num) {
  if (!num || num === 0) return '0';
  return Math.round(Number(num) || 0).toLocaleString('id-ID');
}

// Helper format tanggal ke format teks Indonesia (contoh: 01 September 2026)
function formatTanggalIndo(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const bulan = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const day = String(d.getDate()).padStart(2, '0');
    return `${day} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
  } catch (e) {
    return dateStr;
  }
}

// Helper format DD-MM-YYYY untuk kolom TGL. TRANS
function formatTanggalTrans(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}-${month}-${d.getFullYear()}`;
  } catch (e) {
    return dateStr;
  }
}

/**
 * Mengubah baris omset menjadi baris jurnal Voucher (Debet & Kredit)
 */
function buildVoucherJournalRows(rows, tglTrans, coaMap) {
  const journal = [];

  const getCoa = (key) => {
    const item = coaMap.find(c => c.key === key);
    return item || { nomor: '-', nama: '-' };
  };

  const addEntry = ({ coaKey, debet = 0, kredit = 0, prefix = '', kwitansi = '' }) => {
    const coa = getCoa(coaKey);
    let keterangan = '';
    
    // Format Keterangan: [AWALAN] + [KWITANSI] + [TEKS STANDAR]
    const kwtPart = kwitansi && kwitansi !== '-' ? `(kwt ${kwitansi}) ` : '';
    const prefixPart = prefix ? `${prefix} ` : '';
    keterangan = `${prefixPart}${kwtPart}Omset Penjualan Toko SMart Saharjo Tgl ${tglTrans} (Upload)`.replace(/\s+/g, ' ').trim();

    journal.push({
      nomor: coa.nomor,
      nama: coa.nama,
      tgl: tglTrans,
      debet: Math.round(Number(debet) || 0),
      kredit: Math.round(Number(kredit) || 0),
      keterangan: keterangan
    });
  };

  // Iterasi baris tabel OMSET
  rows.forEach(r => {
    const namaRef = (r.nama_ref || '').trim();
    const namaRefUpper = namaRef.toUpperCase();
    const kwitansi = r.kwitansi || '';

    // 1. Tag Promo
    if (r.tag_promo && Number(r.tag_promo) > 0) {
      addEntry({
        coaKey: 'PROMO',
        debet: r.tag_promo,
        kredit: 0,
        prefix: '', // baris promo di foto tidak ada awalan
        kwitansi
      });
    }

    // 2. Pendapatan Toko
    if (r.pendapatan_toko && Number(r.pendapatan_toko) > 0) {
      let pfx = '';
      if (namaRefUpper.includes('OMI')) pfx = 'OMSET OMI';
      else if (namaRefUpper.includes('SMART')) pfx = 'OMSET SMART';
      else pfx = `${namaRef} ${namaRef}`; // Pada contoh baris 18: BNI DIVISI INS1 BNI DIVISI INS1

      addEntry({
        coaKey: 'PENDAPATAN_BARANG',
        debet: 0,
        kredit: r.pendapatan_toko,
        prefix: pfx,
        kwitansi
      });
    }

    // 3. Non Pajak
    if (r.non_pajak && Number(r.non_pajak) > 0) {
      addEntry({
        coaKey: 'NON_PAJAK',
        debet: 0,
        kredit: r.non_pajak,
        prefix: 'OMSET OMI',
        kwitansi
      });
    }

    // 4. PPN PK
    if (r.ppn_pk && Number(r.ppn_pk) > 0) {
      let pfx = '';
      if (namaRefUpper.includes('OMI')) pfx = 'OMSET OMI';
      else if (namaRefUpper.includes('SMART')) pfx = 'OMSET SMART';
      else pfx = `${namaRef} ${namaRef}`; // Pada contoh baris 19: BNI DIVISI INS1 BNI DIVISI INS1

      addEntry({
        coaKey: 'PPN_PK',
        debet: 0,
        kredit: r.ppn_pk,
        prefix: pfx,
        kwitansi
      });
    }

    // 5. Beban Toko & Persediaan Toko (HPP)
    if (r.beban_toko && Number(r.beban_toko) > 0) {
      const hppVal = Number(r.beban_toko);
      // Beban Pokok (Debet)
      addEntry({
        coaKey: 'HPP_BEBAN',
        debet: hppVal,
        kredit: 0,
        prefix: '',
        kwitansi
      });
      // Persediaan (Kredit)
      addEntry({
        coaKey: 'PERSEDIAAN',
        debet: 0,
        kredit: hppVal,
        prefix: '',
        kwitansi
      });
    }

    // 6. Piutang (Pegawai / Divisi)
    if (r.piutang && Number(r.piutang) > 0) {
      let pfx = '';
      if (namaRefUpper === 'PEGAWAI' || namaRefUpper.includes('PEGAWAI')) {
        pfx = 'PEGAWAI';
      } else {
        pfx = `${namaRef} ${namaRef}`; // Pada contoh baris 17: BNI DIVISI INS1 BNI DIVISI INS1
      }

      addEntry({
        coaKey: 'PIUTANG_TOKO',
        debet: r.piutang,
        kredit: 0,
        prefix: pfx,
        kwitansi
      });
    }

    // 7. Piutang EDC / E-Money
    if (r.piutang_edc && Number(r.piutang_edc) > 0) {
      addEntry({
        coaKey: 'PIUTANG_EDC',
        debet: r.piutang_edc,
        kredit: 0,
        prefix: '',
        kwitansi
      });
    }

    // 8. Kas UKS (Tunai)
    if (r.kas_uks && Number(r.kas_uks) > 0) {
      addEntry({
        coaKey: 'KAS_UKS',
        debet: r.kas_uks,
        kredit: 0,
        prefix: 'TUNAI',
        kwitansi
      });
    }
  });

  return journal;
}

/**
 * Generate dan unduh PDF Voucher Akuntansi Koperasi Swadharma
 * Didesain presisi untuk A4 Portrait sesuai bukti fisik resmi.
 */
export async function exportReportToPdf(report, rows, totalDebit, totalKredit, selisih, options = {}) {
  const {
    voucherNo = '',
    userName = 'Staff',
    coaSettings = null
  } = options;

  // Baca pengaturan COA (dari parameter atau localStorage atau fallback default)
  let coaMap = coaSettings;
  if (!coaMap) {
    try {
      const saved = localStorage.getItem('laporgo_coa_settings');
      if (saved) coaMap = JSON.parse(saved);
    } catch (e) {}
  }
  if (!coaMap || !Array.isArray(coaMap)) coaMap = DEFAULT_COA_MAP;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();   // 210 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm
  const leftMargin = 12;
  const rightMargin = pageWidth - 12;

  const tglLaporan = report?.tanggal || '';
  const tglIndo = formatTanggalIndo(tglLaporan);
  const tglTrans = formatTanggalTrans(tglLaporan);

  // ── 1. LOGO & KOP SURAT ────────────────────────────────────────
  // ── 1. KOP SURAT ATAS (Logo di kiri, No & Tgl di kanan) ──────
  // Pasang Logo Koperasi Swadharma monochrome jika tersedia
  try {
    doc.addImage('/Logo_Kopswa_mono.png', 'PNG', leftMargin, 10, 48, 12);
  } catch (e) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text('KOPERASI SWADHARMA', leftMargin, 16);
  }

  // Info Kanan Atas: No. Voucher & Tanggal (Sejajar dengan area logo)
  doc.setFont('courier', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  
  const displayVoucherNo = voucherNo && voucherNo.trim() !== '' ? `${voucherNo.trim()} ( - )` : '-';
  doc.text('No.  : ' + displayVoucherNo, rightMargin - 65, 14);
  doc.text('Tgl. : ' + tglIndo, rightMargin - 65, 19);

  // ── 2. JUDUL VOUCHER (Diturunkan sedikit di bawah header logo) ─
  const voucherTitleY = 24;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  const titleText = 'V O U C H E R';
  const titleWidth = doc.getTextWidth(titleText);
  const titleX = pageWidth / 2 - titleWidth / 2;
  doc.text(titleText, titleX, voucherTitleY);
  doc.setLineWidth(0.35);
  doc.line(titleX - 10, voucherTitleY + 1.8, titleX + titleWidth + 10, voucherTitleY + 1.8);

  // ── 3. METADATA TRANSAKSI ──────────────────────────────────────
  const metaY = 32;
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);

  // Uraian
  doc.text('Uraian', leftMargin, metaY);
  doc.text(':', leftMargin + 20, metaY);
  doc.text(`Omset Penjualan Toko SMart Saharjo Tgl ${tglTrans} (Upload)`, leftMargin + 23, metaY);

  // Jumlah
  doc.text('Jumlah', leftMargin, metaY + 4.2);
  doc.text(':', leftMargin + 20, metaY + 4.2);
  doc.setFont('courier', 'bold');
  doc.text(`Rp ${formatNumber(totalDebit)}`, leftMargin + 23, metaY + 4.2);
  doc.setFont('courier', 'normal');

  // Terbilang
  doc.text('Terbilang', leftMargin, metaY + 8.4);
  doc.text(':', leftMargin + 20, metaY + 8.4);
  const kalimatTerbilang = terbilang(totalDebit);
  const splitTerbilang = doc.splitTextToSize(kalimatTerbilang, pageWidth - leftMargin - 35);
  doc.text(splitTerbilang, leftMargin + 23, metaY + 8.4);

  const startTableY = metaY + 11.5 + (splitTerbilang.length > 1 ? (splitTerbilang.length - 1) * 3.5 : 0);

  // ── 4. DATA TABEL JURNAL AKUNTANSI ────────────────────────────
  const journalRows = buildVoucherJournalRows(rows, tglTrans, coaMap);

  const headers = ['#', 'NOMOR', 'NAMA', 'TGL. TRANS', 'DEBET (Rp)', 'KREDIT (Rp)', 'KETERANGAN'];

  const tableBody = journalRows.map((r, i) => [
    `${i + 1}.`,
    r.nomor,
    r.nama,
    r.tgl,
    formatNumber(r.debet),
    formatNumber(r.kredit),
    r.keterangan
  ]);

  // Baris Total Jumlah
  const totalRow = [
    '',
    '',
    'Jumlah :',
    '',
    formatNumber(totalDebit),
    formatNumber(totalKredit),
    ''
  ];

  autoTable(doc, {
    startY: startTableY,
    head: [headers],
    body: [...tableBody, totalRow],
    theme: 'plain',
    styles: {
      font: 'courier',
      fontSize: 6.8,
      cellPadding: { top: 1.25, bottom: 1.25, left: 1, right: 1 },
      textColor: [0, 0, 0],
      valign: 'top',
      lineColor: [220, 220, 220],
      lineWidth: 0,
      overflow: 'linebreak',
    },
    headStyles: {
      font: 'courier',
      fontStyle: 'bold',
      fontSize: 7.2,
      textColor: [0, 0, 0],
      halign: 'left',
      cellPadding: { top: 1.8, bottom: 1.8, left: 1, right: 1 },
      lineWidth: { top: 0.35, bottom: 0.35 },
      lineColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: 7, halign: 'center' },   // #
      1: { cellWidth: 16, halign: 'left' },    // NOMOR (COA)
      2: { cellWidth: 41, halign: 'left' },    // NAMA AKUN
      3: { cellWidth: 18, halign: 'center' },  // TGL TRANS
      4: { cellWidth: 18, halign: 'right' },   // DEBET
      5: { cellWidth: 18, halign: 'right' },   // KREDIT
      6: { cellWidth: 68, halign: 'left' },    // KETERANGAN (diperlebar agar tidak wrap banyak baris)
    },
    didParseCell: function(data) {
      // Style khusus untuk baris Total Jumlah di akhir
      if (data.row.index === tableBody.length) {
        data.cell.styles.fontStyle = 'bold';
        if (data.column.index === 2) {
          data.cell.styles.halign = 'right';
        }
        data.cell.styles.lineWidth = { top: 0.35, bottom: 0.35 };
        data.cell.styles.lineColor = [0, 0, 0];
        data.cell.styles.cellPadding = { top: 2, bottom: 2, left: 1, right: 1 };
      }
    },
    margin: { left: leftMargin, right: 12, bottom: 35 },
  });

  // ── 5. KOLOM TANDA TANGAN & FOOTER ────────────────────────────
  const tableBottomY = doc.lastAutoTable.finalY;
  const colWidth = (pageWidth - 24) / 3;

  // Letakkan tanda tangan dengan jarak 7mm setelah tabel total
  const finalY = tableBottomY + 7;

  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);

  // 3 Kolom Tanda Tangan: Mengetahui, Menyetujui, Penerima
  const sig1X = leftMargin + colWidth * 0.5;
  const sig2X = leftMargin + colWidth * 1.5;
  const sig3X = leftMargin + colWidth * 2.5;

  doc.text('Mengetahui', sig1X, finalY, { align: 'center' });
  doc.text('Menyetujui', sig2X, finalY, { align: 'center' });
  doc.text('Penerima', sig3X, finalY, { align: 'center' });

  // Ruang Tanda Tangan (Garis kurung tanda tangan)
  const sigLineY = finalY + 16;
  doc.text('(                          )', sig1X, sigLineY, { align: 'center' });
  doc.text('(                          )', sig2X, sigLineY, { align: 'center' });
  doc.text('(                          )', sig3X, sigLineY, { align: 'center' });

  // ── 6. CATATAN PEMBUAT DI POJOK KIRI BAWAH ────────────────────
  const now = new Date();
  const dayStr = String(now.getDate()).padStart(2, '0');
  const monthStr = String(now.getMonth() + 1).padStart(2, '0');
  const yearStr = now.getFullYear();
  const hoursStr = String(now.getHours()).padStart(2, '0');
  const minsStr = String(now.getMinutes()).padStart(2, '0');
  const secsStr = String(now.getSeconds()).padStart(2, '0');
  const stampTime = `${dayStr}/${monthStr}/${yearStr} ${hoursStr}:${minsStr}:${secsStr}`;

  const currentUserName = userName || 'Staff';

  doc.setFont('courier', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(80, 80, 80);
  doc.text(`Pembuat : ${currentUserName}`, leftMargin, pageHeight - 10);
  doc.text(stampTime, leftMargin, pageHeight - 7);

  // Simpan/Unduh file PDF
  const filename = `VOUCHER_${tglLaporan || 'export'}.pdf`;
  doc.save(filename);
}


