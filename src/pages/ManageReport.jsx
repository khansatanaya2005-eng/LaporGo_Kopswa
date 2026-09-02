import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Download, 
  Printer, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  Search, 
  ArrowUpDown, 
  FileText,
  Layers,
  FileCheck,
  Building,
  Store,
  Eye,
  X
} from 'lucide-react';
import { MOCK_OMSET_DATA, MOCK_HISTORY_LAPORAN } from '../data/mockData';
import { formatRupiah } from '../utils/cn';

const ManageReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Modal preview state
  const [selectedPreviewFile, setSelectedPreviewFile] = useState(null);

  // Find report detail or fallback
  const reportDetail = MOCK_HISTORY_LAPORAN.find(r => r.id === id) || {
    id: id || "lap-001",
    tanggal: "2026-09-01",
    status_balance: "Balance",
    total_debit: 43490000,
    total_kredit: 43490000,
    selisih: 0,
    jumlah_transaksi: 142,
    dibuat_oleh_nama: "Ahmad Staff"
  };

  const [activeTab, setActiveTab] = useState('OMSET');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  // Mock list file used (from laporan_files table)
  const uploadedFilesList = [
    { id: 1, name: 'LAPORAN PER TANGGAL.xls', format: 'excel', type: 'omi', size: '1.2 MB' },
    { id: 2, name: 'LAPORAN PENJUALAN ANGGOTA PER MEMBER.xls', format: 'excel', type: 'omi', size: '850 KB' },
    { id: 3, name: 'LAPORAN DISC. ITEM.xls', format: 'excel', type: 'omi', size: '420 KB' },
    { id: 4, name: 'detail smart.xlsx', format: 'excel', type: 'smart', size: '2.1 MB' },
    { id: 5, name: 'ringkasan pembayaran logo.xlsx', format: 'excel', type: 'smart', size: '940 KB' },
    { id: 6, name: 'struk_kasir_shift_pagi.txt', format: 'txt', type: 'omi', size: '45 KB' },
  ];

  const tabs = [
    { id: 'OMSET', label: 'Sheet OMSET' },
    { id: 'DETAIL_SMART', label: 'Detail SMART' },
    { id: 'RINGKASAN_TOKO', label: 'Ringkasan Toko' },
    { id: 'RINGKASAN_LOGO', label: 'Ringkasan Logo' },
    { id: 'OMI_PERTANGGAL', label: 'OMI Pertanggal' },
    { id: 'OMI_MEMBER', label: 'OMI Member' },
  ];

  // Filtering & Sorting
  const filteredRows = MOCK_OMSET_DATA.filter((row) => {
    const term = searchTerm.toLowerCase();
    return (
      row.nama_ref.toLowerCase().includes(term) ||
      row.jenis_transaksi.toLowerCase().includes(term) ||
      row.kwitansi.toLowerCase().includes(term) ||
      row.keterangan.toLowerCase().includes(term)
    );
  });

  const sortedRows = [...filteredRows].sort((a, b) => {
    if (sortAsc) return a.no - b.no;
    return b.no - a.no;
  });

  const handleDownloadExcel = () => {
    alert(`Mengunduh file Excel laporan ID: ${reportDetail.id}`);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const isBalance = reportDetail.status_balance === 'Balance';
  const isDraft = reportDetail.status_balance === 'Draft';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 relative">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/riwayat')}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer shrink-0"
            title="Kembali ke Riwayat"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>Kelola Laporan</span>
              <span className="text-xs bg-slate-100 text-[#0A4D68] px-2.5 py-0.5 rounded-full font-mono font-semibold">
                ID: {reportDetail.id}
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Tanggal Laporan: {reportDetail.tanggal} &bull; Diproses oleh: {reportDetail.dibuat_oleh_nama}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/riwayat')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Riwayat</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak PDF</span>
          </button>

          <button
            onClick={handleDownloadExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Excel</span>
          </button>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Debit</p>
          <p className="text-lg font-bold text-slate-900 mt-1 font-mono">{formatRupiah(reportDetail.total_debit)}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Kredit</p>
          <p className="text-lg font-bold text-slate-900 mt-1 font-mono">{formatRupiah(reportDetail.total_kredit)}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Jumlah Transaksi</p>
          <p className="text-lg font-bold text-slate-900 mt-1">{reportDetail.jumlah_transaksi} Item</p>
        </div>

        <div className={`p-4 rounded-xl border shadow-sm flex items-center justify-between ${
          isBalance 
            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' 
            : isDraft 
            ? 'bg-slate-50 border-slate-200 text-slate-800' 
            : 'bg-amber-50/60 border-amber-200 text-amber-900'
        }`}>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Status Laporan</p>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-base">
              {isBalance ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-emerald-700">BALANCE ✅</span>
                </>
              ) : isDraft ? (
                <>
                  <Clock className="w-5 h-5 text-slate-500" />
                  <span className="text-slate-700">DRAFT 📑</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span className="text-amber-700">UNBALANCE ⚠️</span>
                </>
              )}
            </div>
          </div>
          {!isBalance && !isDraft && (
            <div className="text-right">
              <span className="text-[10px] text-amber-600 block">Selisih:</span>
              <span className="font-mono font-bold text-xs text-amber-800">{formatRupiah(reportDetail.selisih)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main OMSET Table Component (Hasil Penggabungan) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 px-3 pt-2 gap-1 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-[#0A4D68] border-t-2 border-[#0A4D68] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'OMSET' ? (
          <div>
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari transaksi, kwitansi, ref..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4D68]"
                />
              </div>

              <button
                onClick={() => setSortAsc(!sortAsc)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Urutan NO ({sortAsc ? 'Asc' : 'Desc'})</span>
              </button>
            </div>

            {/* 23 Columns OMSET Table */}
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-[#051923] text-white sticky top-0 font-semibold z-10">
                  <tr>
                    <th className="p-3 border-b border-slate-800">NO</th>
                    <th className="p-3 border-b border-slate-800">NAMA DAN REF</th>
                    <th className="p-3 border-b border-slate-800">JENIS TRANSAKSI</th>
                    <th className="p-3 border-b border-slate-800">KWITANSI</th>
                    <th className="p-3 border-b border-slate-800">KETERANGAN</th>
                    <th className="p-3 border-b border-slate-800">TAG PROMO</th>
                    <th className="p-3 border-b border-slate-800">GIRO UDP</th>
                    <th className="p-3 border-b border-slate-800">PIUTANG</th>
                    <th className="p-3 border-b border-slate-800">PENDAPATAN TOKO</th>
                    <th className="p-3 border-b border-slate-800">PENDAPATAN LOGO</th>
                    <th className="p-3 border-b border-slate-800">PENDAPATAN KERJASAMA</th>
                    <th className="p-3 border-b border-slate-800">NON PAJAK</th>
                    <th className="p-3 border-b border-slate-800">PPN PK</th>
                    <th className="p-3 border-b border-slate-800">PPN WAPU</th>
                    <th className="p-3 border-b border-slate-800">BEBAN TOKO</th>
                    <th className="p-3 border-b border-slate-800">BEBAN LOGO</th>
                    <th className="p-3 border-b border-slate-800">PERSEDIAAN TOKO</th>
                    <th className="p-3 border-b border-slate-800">PERSEDIAAN LOGO</th>
                    <th className="p-3 border-b border-slate-800">SIMSEM UKS</th>
                    <th className="p-3 border-b border-slate-800">KAS UKS</th>
                    <th className="p-3 border-b border-slate-800">PIUTANG PADI</th>
                    <th className="p-3 border-b border-slate-800">PIUTANG EDC</th>
                    <th className="p-3 border-b border-slate-800">BEBAN PROMOSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedRows.map((row) => (
                    <tr key={row.no} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-semibold text-slate-700">{row.no}</td>
                      <td className="p-3 font-semibold text-slate-900">{row.nama_ref}</td>
                      <td className="p-3"><span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded">{row.jenis_transaksi}</span></td>
                      <td className="p-3 font-mono text-slate-600">{row.kwitansi}</td>
                      <td className="p-3 text-slate-600 max-w-xs truncate">{row.keterangan}</td>
                      <td className="p-3 text-slate-500">{row.tag_promo}</td>
                      <td className="p-3 font-mono">{formatRupiah(row.giro_udp)}</td>
                      <td className="p-3 font-mono">{formatRupiah(row.piutang)}</td>
                      <td className="p-3 font-mono text-emerald-700 font-medium">{formatRupiah(row.pendapatan_toko)}</td>
                      <td className="p-3 font-mono">{formatRupiah(row.pendapatan_logo)}</td>
                      <td className="p-3 font-mono">{formatRupiah(row.pendapatan_kerjasama)}</td>
                      <td className="p-3 font-mono">{formatRupiah(row.non_pajak)}</td>
                      <td className="p-3 font-mono">{formatRupiah(row.ppn_pk)}</td>
                      <td className="p-3 font-mono">{formatRupiah(row.ppn_wapu)}</td>
                      <td className="p-3 font-mono">{formatRupiah(row.beban_toko)}</td>
                      <td className="p-3 font-mono">{formatRupiah(row.beban_logo)}</td>
                      <td className="p-3 font-mono">{formatRupiah(row.persediaan_toko)}</td>
                      <td className="p-3 font-mono">{formatRupiah(row.persediaan_logo)}</td>
                      <td className="p-3 font-mono">{formatRupiah(row.simsem_uks)}</td>
                      <td className="p-3 font-mono text-blue-700 font-medium">{formatRupiah(row.kas_uks)}</td>
                      <td className="p-3 font-mono">{formatRupiah(row.piutang_padi)}</td>
                      <td className="p-3 font-mono">{formatRupiah(row.piutang_edc)}</td>
                      <td className="p-3 font-mono">{formatRupiah(row.beban_promosi)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            <Layers className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">Halaman Sheet: {tabs.find(t => t.id === activeTab)?.label}</p>
            <p className="text-xs mt-1 max-w-sm mx-auto">Data detail rincian disajikan dari backend service.</p>
          </div>
        )}
      </div>

      {/* Daftar File Yang Digunakan (from laporan_files) - Scroll Down Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0A4D68]" />
            <span>Dokumen Sumber Laporan (OMI & SMART)</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">{uploadedFilesList.length} Berkas Tersimpan</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
          {uploadedFilesList.map((file) => (
            <div key={file.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:border-slate-300 transition">
              <div className="flex items-center gap-2.5 truncate">
                {file.type === 'omi' ? (
                  <Store className="w-4 h-4 text-[#FF5000] shrink-0" />
                ) : (
                  <Building className="w-4 h-4 text-[#0A4D68] shrink-0" />
                )}
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-800 truncate" title={file.name}>{file.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono uppercase">{file.type} &bull; {file.size}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button
                  onClick={() => setSelectedPreviewFile(file)}
                  className="p-1.5 text-slate-600 hover:text-[#0A4D68] hover:bg-slate-200/60 rounded-lg border border-slate-200 transition cursor-pointer"
                  title={`Preview berkas ${file.name}`}
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => alert(`Mengunduh berkas sumber: ${file.name}`)}
                  className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-slate-200 transition cursor-pointer"
                  title={`Download berkas sumber ${file.name}`}
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Preview Berkas Sumber (Sesuai Format File) */}
      {selectedPreviewFile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                {selectedPreviewFile.format === 'excel' ? (
                  <FileText className="w-5 h-5 text-emerald-600" />
                ) : (
                  <FileText className="w-5 h-5 text-amber-600" />
                )}
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedPreviewFile.name}</h3>
                  <p className="text-[10px] text-slate-500 font-mono uppercase">Format: {selectedPreviewFile.format} &bull; Tipe: {selectedPreviewFile.type} &bull; Size: {selectedPreviewFile.size}</p>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedPreviewFile(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Based on Format */}
            <div className="p-4 overflow-y-auto flex-1 bg-slate-100">
              {selectedPreviewFile.format === 'excel' ? (
                /* Modal Format Preview Excel (Tabel Mini Excel) */
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100 text-[11px] font-bold text-emerald-800 flex items-center justify-between">
                    <span>📊 Preview Lembar Kerja Excel (10 Baris Pertama)</span>
                    <span className="text-[10px] bg-emerald-200/60 px-2 py-0.5 rounded font-mono">Sheet1</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-slate-800 text-white font-mono text-[11px]">
                        <tr>
                          <th className="p-2 border-b">Row</th>
                          <th className="p-2 border-b">A: TANGGAL</th>
                          <th className="p-2 border-b">B: NO_KWITANSI</th>
                          <th className="p-2 border-b">C: DEPARTEMEN</th>
                          <th className="p-2 border-b">D: NOMINAL</th>
                          <th className="p-2 border-b">E: METODE_BAYAR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 bg-slate-100 font-bold text-slate-500 border-r">{idx}</td>
                            <td className="p-2 text-slate-800">2026-09-01</td>
                            <td className="p-2 text-slate-600">KW-RAW-00{idx}</td>
                            <td className="p-2 text-slate-600">{selectedPreviewFile.type === 'omi' ? 'TOKO OMI' : 'UNIT SMART'}</td>
                            <td className="p-2 text-emerald-700 font-bold">Rp {(idx * 150000).toLocaleString('id-ID')}</td>
                            <td className="p-2 text-slate-500">{idx % 2 === 0 ? 'TUNAI' : 'QRIS'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* Modal Format Preview Text (Tampilan Struk Kasir) */
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-inner text-emerald-400 font-mono text-xs space-y-2 overflow-x-auto max-w-xl mx-auto">
                  <div className="text-center border-b border-slate-800 pb-3 text-slate-300">
                    <p className="font-bold text-sm text-white">=== PREVIEW STRUK TEXT (RAW) ===</p>
                    <p className="text-[10px] text-slate-400">{selectedPreviewFile.name}</p>
                  </div>
                  <pre className="whitespace-pre text-emerald-400 font-mono text-[11px] leading-relaxed">
{`KOPERASI SWADHARMA - SHIFT PAGI
TANGGAL: 2026-09-01 08:30:12
KASIR  : OPERATOR 01

--------------------------------
ITEM 01: VOUCHER KOPSWA    x 2  Rp  40.000
ITEM 02: PENDAPATAN TOKO   x 1  Rp 150.000
ITEM 03: NON PAJAK PROMO   x 1  Rp  25.000
--------------------------------
TOTAL DEBIT  : Rp 215.000
TOTAL KREDIT : Rp 215.000
STATUS       : OK (BALANCE)

[END OF FILE - STRUK TEXT]`}</pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">Menampilkan preview format asli berkas sumber.</span>
              <button
                onClick={() => setSelectedPreviewFile(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition cursor-pointer"
              >
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReport;

