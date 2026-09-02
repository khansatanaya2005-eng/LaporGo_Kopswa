import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  ArrowUpDown, 
  FileSpreadsheet,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { MOCK_OMSET_DATA } from '../data/mockData';
import { formatRupiah } from '../utils/cn';

const ReportPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Load state or fallback mock data
  const reportData = location.state?.reportData || {
    summary: {
      totalDebit: 43490000,
      totalKredit: 43490000,
      selisih: 0,
      jumlahTransaksi: 142,
      statusBalance: 'Balance'
    },
    omsetRows: MOCK_OMSET_DATA
  };

  const [activeTab, setActiveTab] = useState('OMSET');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const tabs = [
    { id: 'OMSET', label: 'Sheet OMSET' },
    { id: 'DETAIL_SMART', label: 'Detail SMART' },
    { id: 'RINGKASAN_TOKO', label: 'Ringkasan Toko' },
    { id: 'RINGKASAN_LOGO', label: 'Ringkasan Logo' },
    { id: 'OMI_PERTANGGAL', label: 'OMI Pertanggal' },
    { id: 'OMI_MEMBER', label: 'OMI Member' },
  ];

  // Filtering & Sorting OMSET
  const filteredRows = reportData.omsetRows.filter((row) => {
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

  const handleDownloadExcel = async () => {
    setDownloading(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiBase}/download-excel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      }).catch(() => null);

      if (response && response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Laporan_Gabungan_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        // Fallback simulation download
        alert("Simulasi Download Excel: Endpoint backend Express dapat dipanggil untuk menggenerate file .xlsx sesungguhnya.");
      }
    } catch (e) {
      alert("Terjadi kesalahan saat download.");
    } finally {
      setDownloading(false);
    }
  };

  const isBalance = reportData.summary.statusBalance === 'Balance';

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer shrink-0"
            title="Kembali ke Halaman Sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Preview Hasil Penggabungan Laporan</h1>
            <p className="text-xs text-slate-500 mt-0.5">Tanggal Laporan: {new Date().toLocaleDateString('id-ID')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/upload')}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Proses Ulang</span>
          </button>

          <button
            onClick={() => alert("Laporan berhasil disimpan ke Database & Riwayat!")}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FF5000] hover:bg-[#e04600] text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer active:scale-95"
          >
            <span>💾 Simpan Ke Database</span>
          </button>
          
          <button
            onClick={handleDownloadExcel}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Mengunduh...' : 'Download Excel (.xlsx)'}</span>
          </button>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Debit</p>
          <p className="text-lg font-bold text-slate-900 mt-1 font-mono">{formatRupiah(reportData.summary.totalDebit)}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Kredit</p>
          <p className="text-lg font-bold text-slate-900 mt-1 font-mono">{formatRupiah(reportData.summary.totalKredit)}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Jumlah Transaksi</p>
          <p className="text-lg font-bold text-slate-900 mt-1">{reportData.summary.jumlahTransaksi} Item</p>
        </div>

        <div className={`p-4 rounded-xl border shadow-sm flex items-center justify-between ${
          isBalance ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-amber-50/60 border-amber-200 text-amber-900'
        }`}>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Status Balance</p>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-base">
              {isBalance ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-emerald-700">BALANCE ✅</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span className="text-amber-700">UNBALANCE ⚠️</span>
                </>
              )}
            </div>
          </div>
          {!isBalance && (
            <div className="text-right">
              <span className="text-[10px] text-amber-600 block">Selisih:</span>
              <span className="font-mono font-bold text-xs text-amber-800">{formatRupiah(reportData.summary.selisih)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 px-3 pt-2 gap-1 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition shrink-0 ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 border-t-2 border-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'OMSET' ? (
          <div>
            {/* Table Controls (Search & Sort) */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari transaksi, kwitansi, ref..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setSortAsc(!sortAsc)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>Urutan NO ({sortAsc ? 'Asc' : 'Desc'})</span>
                </button>
              </div>
            </div>

            {/* Render OMSET Table (23 Columns) */}
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-900 text-white sticky top-0 font-semibold z-10">
                  <tr>
                    <th className="p-3 border-b border-slate-700">NO</th>
                    <th className="p-3 border-b border-slate-700">NAMA DAN REF</th>
                    <th className="p-3 border-b border-slate-700">JENIS TRANSAKSI</th>
                    <th className="p-3 border-b border-slate-700">KWITANSI</th>
                    <th className="p-3 border-b border-slate-700">KETERANGAN</th>
                    <th className="p-3 border-b border-slate-700">TAG PROMO</th>
                    <th className="p-3 border-b border-slate-700">GIRO UDP</th>
                    <th className="p-3 border-b border-slate-700">PIUTANG</th>
                    <th className="p-3 border-b border-slate-700">PENDAPATAN TOKO</th>
                    <th className="p-3 border-b border-slate-700">PENDAPATAN LOGO</th>
                    <th className="p-3 border-b border-slate-700">PENDAPATAN KERJASAMA</th>
                    <th className="p-3 border-b border-slate-700">NON PAJAK</th>
                    <th className="p-3 border-b border-slate-700">PPN PK</th>
                    <th className="p-3 border-b border-slate-700">PPN WAPU</th>
                    <th className="p-3 border-b border-slate-700">BEBAN TOKO</th>
                    <th className="p-3 border-b border-slate-700">BEBAN LOGO</th>
                    <th className="p-3 border-b border-slate-700">PERSEDIAAN TOKO</th>
                    <th className="p-3 border-b border-slate-700">PERSEDIAAN LOGO</th>
                    <th className="p-3 border-b border-slate-700">SIMSEM UKS</th>
                    <th className="p-3 border-b border-slate-700">KAS UKS</th>
                    <th className="p-3 border-b border-slate-700">PIUTANG PADI</th>
                    <th className="p-3 border-b border-slate-700">PIUTANG EDC</th>
                    <th className="p-3 border-b border-slate-700">BEBAN PROMOSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedRows.map((row) => (
                    <tr key={row.no} className="hover:bg-blue-50/50 transition font-sans">
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

            {/* Pagination Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>Menampilkan {sortedRows.length} dari {reportData.omsetRows.length} entri</span>
              <div className="flex items-center gap-1">
                <button disabled className="p-1 border rounded bg-white opacity-50 cursor-not-allowed"><ChevronLeft className="w-4 h-4" /></button>
                <span className="px-3 py-1 font-semibold text-slate-800">1</span>
                <button disabled className="p-1 border rounded bg-white opacity-50 cursor-not-allowed"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            <Layers className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">Halaman Sheet: {tabs.find(t => t.id === activeTab)?.label}</p>
            <p className="text-xs mt-1 max-w-sm mx-auto">
              Data sheet ini akan diisi secara otomatis oleh backend service setelah proses penggabungan selesai.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPreview;
