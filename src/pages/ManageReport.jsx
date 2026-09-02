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
  Store
} from 'lucide-react';
import { MOCK_OMSET_DATA, MOCK_HISTORY_LAPORAN } from '../data/mockData';
import { formatRupiah } from '../utils/cn';

const ManageReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
    { id: 1, name: 'LAPORAN PER TANGGAL.xls', type: 'omi', size: '1.2 MB' },
    { id: 2, name: 'LAPORAN PENJUALAN ANGGOTA PER MEMBER.xls', type: 'omi', size: '850 KB' },
    { id: 3, name: 'LAPORAN DISC. ITEM.xls', type: 'omi', size: '420 KB' },
    { id: 4, name: 'detail smart.xlsx', type: 'smart', size: '2.1 MB' },
    { id: 5, name: 'ringkasan pembayaran logo.xlsx', type: 'smart', size: '940 KB' },
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
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
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
          <span className="text-[11px] text-slate-400 font-medium">5 Berkas Tersimpan</span>
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
              
              <button
                onClick={() => alert(`Mengunduh berkas mentah: ${file.name}`)}
                className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 transition cursor-pointer shrink-0 ml-2"
                title={`Download berkas mentah ${file.name}`}
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageReport;
