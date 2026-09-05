import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatRupiah } from './cn';

/**
 * Generate dan langsung mengunduh PDF Laporan Gabungan Harian Toko OMI & SMART
 */
export function exportReportToPdf(report, rows, totalDebit, totalKredit, selisih) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth  = doc.internal.pageSize.getWidth();  // ~297 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // ~210 mm

  // 1. Header Banner Atas (#051923)
  doc.setFillColor(5, 25, 35);
  doc.rect(0, 0, pageWidth, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('KOPERASI SWADHARMA', 14, 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text('LaporGo - Sistem Penggabungan Laporan Harian Toko OMI & SMART', 14, 16.5);

  // Status Badge di kanan banner
  const isBalance  = totalDebit === totalKredit;
  const statusText = isBalance ? 'STATUS: BALANCE' : 'STATUS: UNBALANCE';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  
  if (isBalance) {
    doc.setFillColor(22, 163, 74); // green
  } else {
    doc.setFillColor(217, 119, 6); // amber
  }
  doc.roundedRect(pageWidth - 56, 5.5, 42, 11, 2.5, 2.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text(statusText, pageWidth - 35, 12.5, { align: 'center' });

  // 2. Metadata Laporan
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN GABUNGAN OMSET HARIAN', 14, 30);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const tglStr = report?.tanggal || '-';
  const idStr  = report?.id || '-';
  const userStr= report?.dibuat_oleh_nama || 'System';
  doc.text(`Tanggal Laporan: ${tglStr}   |   ID Laporan: ${idStr}   |   Diproses Oleh: ${userStr}`, 14, 35.5);

  // 3. Ringkasan Kartu Stats (Total Debit, Total Kredit, Selisih)
  const cardWidth = (pageWidth - 28 - 8) / 3; // ~85mm masing-masing
  const cardY = 39;
  const cardHeight = 13;

  // Card 1: TOTAL DEBIT
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, cardY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL DEBIT', 18, cardY + 4.5);
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(formatRupiah(totalDebit), 18, cardY + 10);

  // Card 2: TOTAL KREDIT
  const card2X = 14 + cardWidth + 4;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(card2X, cardY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL KREDIT', card2X + 4, cardY + 4.5);
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(formatRupiah(totalKredit), card2X + 4, cardY + 10);

  // Card 3: SELISIH
  const card3X = card2X + cardWidth + 4;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(card3X, cardY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('SELISIH', card3X + 4, cardY + 4.5);
  doc.setFontSize(9.5);
  if (selisih === 0) {
    doc.setTextColor(22, 163, 74);
  } else {
    doc.setTextColor(217, 119, 6);
  }
  doc.text(formatRupiah(selisih), card3X + 4, cardY + 10);

  // 4. Data Tabel 23 Kolom
  const headers = [
    'NO', 'NAMA & REF', 'JENIS', 'KWITANSI', 'KETERANGAN',
    'TAG PROMO', 'GIRO UDP', 'PIUTANG', 'PEND. TOKO', 'PEND. LOGO',
    'PEND. KERJASAMA', 'NON PAJAK', 'PPN PK', 'PPN WAPU', 'BEBAN TOKO',
    'BEBAN LOGO', 'PERS. TOKO', 'PERS. LOGO', 'SIMSEM UKS', 'KAS UKS',
    'PIUTANG PADI', 'PIUTANG EDC', 'BEBAN PROMOSI'
  ];

  const colKeys = [
    'tag_promo', 'giro_udp', 'piutang', 'pendapatan_toko', 'pendapatan_logo',
    'pendapatan_kerjasama', 'non_pajak', 'ppn_pk', 'ppn_wapu', 'beban_toko',
    'beban_logo', 'persediaan_toko', 'persediaan_logo', 'simsem_uks', 'kas_uks',
    'piutang_padi', 'piutang_edc', 'beban_promosi'
  ];

  const tableBody = rows.map((r, i) => [
    r.no || i + 1,
    r.nama_ref || '-',
    r.jenis_transaksi || '-',
    r.kwitansi || '-',
    r.keterangan || '-',
    ...colKeys.map(k => r[k] ? formatRupiah(r[k]) : '-')
  ]);

  const sumCol = (col) => rows.reduce((s, r) => s + (Number(r[col]) || 0), 0);

  const COLS_DEBIT  = ['tag_promo','giro_udp','piutang','beban_toko','beban_logo','kas_uks','piutang_padi','piutang_edc','beban_promosi'];
  const COLS_KREDIT = ['pendapatan_toko','pendapatan_logo','pendapatan_kerjasama','non_pajak','ppn_pk','ppn_wapu','persediaan_toko','persediaan_logo','simsem_uks'];

  // Baris Total Debit
  const totalDebitRow = [
    '', 'TOTAL DEBIT', '', '', '',
    ...colKeys.map(k => COLS_DEBIT.includes(k) ? formatRupiah(sumCol(k)) : '-')
  ];

  // Baris Total Kredit
  const totalKreditRow = [
    '', 'TOTAL KREDIT', '', '', '',
    ...colKeys.map(k => COLS_KREDIT.includes(k) ? formatRupiah(sumCol(k)) : '-')
  ];

  // Baris Selisih
  const selisihRow = [
    '', 'SELISIH', '', '', '',
    ...colKeys.map((k, idx) => idx === colKeys.length - 1 ? formatRupiah(selisih) : '-')
  ];

  autoTable(doc, {
    startY: 56,
    head: [headers],
    body: [...tableBody, totalDebitRow, totalKreditRow, selisihRow],
    styles: {
      fontSize: 5.5,
      cellPadding: 1.2,
      valign: 'middle',
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [5, 25, 35],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 5.5,
    },
    columnStyles: {
      0: { cellWidth: 7, halign: 'center' },
      1: { cellWidth: 16 },
      2: { cellWidth: 15 },
      3: { cellWidth: 14 },
      4: { cellWidth: 20 },
    },
    didParseCell: function(data) {
      // Style khusus untuk 3 baris total di bagian bawah tabel
      if (data.row.index >= tableBody.length) {
        data.cell.styles.fontStyle = 'bold';
        if (data.row.index === tableBody.length) {
          data.cell.styles.fillColor = [219, 234, 254]; // TOTAL DEBIT (blue)
        } else if (data.row.index === tableBody.length + 1) {
          data.cell.styles.fillColor = [209, 250, 229]; // TOTAL KREDIT (green)
        } else if (data.row.index === tableBody.length + 2) {
          data.cell.styles.fillColor = selisih === 0 ? [240, 253, 244] : [254, 242, 242];
          data.cell.styles.textColor = selisih === 0 ? [22, 163, 74] : [220, 38, 38];
        }
      }
    },
    margin: { top: 10, right: 10, bottom: 12, left: 10 },
  });

  // Footer di setiap halaman
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('LaporGo Kopswa © 2026   |   Dokumen Resmi Koperasi Swadharma', 14, pageHeight - 5);
    doc.text(`Halaman ${i} dari ${pageCount}`, pageWidth - 14, pageHeight - 5, { align: 'right' });
  }

  // Auto download file PDF
  doc.save(`Laporan_Gabungan_${report?.tanggal || 'export'}.pdf`);
}
