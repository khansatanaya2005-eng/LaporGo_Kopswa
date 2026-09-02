const express = require('express');
const cors = require('cors');
const multer = require('multer');
const ExcelJS = require('exceljs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Memory storage for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Healthcheck endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'LaporGo Express backend stub running on port ' + PORT });
});

/**
 * Stub Endpoint 1: Upload & Process Files
 * Receives OMI (.xls/.xlsx/.txt) & SMART (.xlsx) files
 */
app.post('/api/process-laporan', upload.fields([
  { name: 'omi_files', maxCount: 10 },
  { name: 'smart_files', maxCount: 10 }
]), (req, res) => {
  console.log('Received files for processing...');
  
  // Return stubbed processed JSON response matching frontend OMSET structure
  const stubResponse = {
    summary: {
      totalDebit: 43490000,
      totalKredit: 43490000,
      selisih: 0,
      jumlahTransaksi: 142,
      statusBalance: 'Balance'
    },
    omsetRows: [
      {
        no: 1,
        nama_ref: "PENJUALAN TUNAI OMI 01",
        jenis_transaksi: "PENJUALAN TUNAI",
        kwitansi: "KW-20260901-001",
        keterangan: "Penjualan Toko OMI Pagi",
        tag_promo: "-",
        giro_udp: 0,
        piutang: 0,
        pendapatan_toko: 15400000,
        pendapatan_logo: 0,
        pendapatan_kerjasama: 0,
        non_pajak: 0,
        ppn_pk: 1694000,
        ppn_wapu: 0,
        beban_toko: 0,
        beban_logo: 0,
        persediaan_toko: 12000000,
        persediaan_logo: 0,
        simsem_uks: 0,
        kas_uks: 17094000,
        piutang_padi: 0,
        piutang_edc: 0,
        beban_promosi: 0
      },
      {
        no: 2,
        nama_ref: "PAYMENT QRIS BCA SMART",
        jenis_transaksi: "QRIS",
        kwitansi: "KW-20260901-002",
        keterangan: "Transaksi QRIS Kasir 2",
        tag_promo: "PROMO_MEMBER",
        giro_udp: 0,
        piutang: 0,
        pendapatan_toko: 8500000,
        pendapatan_logo: 500000,
        pendapatan_kerjasama: 0,
        non_pajak: 0,
        ppn_pk: 935000,
        ppn_wapu: 0,
        beban_toko: 50000,
        beban_logo: 0,
        persediaan_toko: 6500000,
        persediaan_logo: 400000,
        simsem_uks: 0,
        kas_uks: 0,
        piutang_padi: 0,
        piutang_edc: 9885000,
        beban_promosi: 100000
      }
    ]
  };

  res.json(stubResponse);
});

/**
 * Stub Endpoint 2: Generate & Download Excel
 */
app.post('/api/download-excel', async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('OMSET');

    sheet.columns = [
      { header: 'NO', key: 'no', width: 5 },
      { header: 'NAMA DAN REF', key: 'nama_ref', width: 25 },
      { header: 'JENIS TRANSAKSI', key: 'jenis_transaksi', width: 20 },
      { header: 'KWITANSI', key: 'kwitansi', width: 18 },
      { header: 'KETERANGAN', key: 'keterangan', width: 25 },
      { header: 'PENDAPATAN TOKO', key: 'pendapatan_toko', width: 18 },
      { header: 'KAS UKS', key: 'kas_uks', width: 18 }
    ];

    const data = req.body?.omsetRows || [];
    data.forEach(item => sheet.addRow(item));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Laporan_Gabungan.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate Excel file' });
  }
});

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
