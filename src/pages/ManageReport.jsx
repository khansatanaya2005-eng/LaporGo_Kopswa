import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Download, Printer, ArrowLeft, CheckCircle2,
  AlertTriangle, Clock, Search, ArrowUpDown,
  FileText, Layers, Building, Store, Eye, X, Loader2
} from 'lucide-react';
import { formatRupiah } from '../utils/cn';
import { getLaporanById, isSupabaseConfigured } from '../lib/supabaseClient';
import { downloadExcel } from '../utils/api';
import { MOCK_OMSET_DATA } from '../data/mockData';

const ManageReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [report, setReport]   = useState(null);
  const [activeTab, setActiveTab] = useState('OMSET');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedPreviewFile, setSelectedPreviewFile] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      try {
        if (isSupabaseConfigured() && id && id !== 'lap-001') {
          const data = await getLaporanById(id);
          if (data) {
            setReport(data);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Error loading report detail:', err);
      }

      // Fallback data jika tidak ada Supabase / id mock
      setReport({
        id: id || 'lap-001',
        tanggal: '2026-08-31',
        status_balance: 'Balance',
        total_debit: 4920676,
        total_kredit: 4920676,
        selisih: 0,
        jumlah_transaksi: 9,
        dibuat_oleh_nama: 'Staff Koperasi',
        omsetRows: MOCK_OMSET_DATA,
        warnings: [],
        files: [
          { id: 1, nama_file: 'LAPORAN PER TANGGAL.xls', kategori: 'omi_per_tanggal', ukuran_bytes: 1200000 },
          { id: 2, nama_file: 'LAPORAN TUTUP HARIAN.txt', kategori: 'omi_tutup_harian', ukuran_bytes: 45000 },
          { id: 3, nama_file: 'ringkasan toko.xlsx', kategori: 'smart_toko', ukuran_bytes: 940000 },
          { id: 4, nama_file: 'ringkasan logo.xlsx', kategori: 'smart_logo', ukuran_bytes: 940000 },
        ],
      });
      setLoading(false);
    }

    loadDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-[#0A4D68]" />
        <span className="text-sm font-semibold">Memuat detail laporan...</span>
      </div>
    );
  }

  const omsetRows = report?.omsetRows || MOCK_OMSET_DATA;
  const isBalance = report?.status_balance === 'Balance';
  const isDraft   = report?.status_balance === 'Draft';

  const filteredRows = omsetRows.filter(row => {
    const term = searchTerm.toLowerCase();
    return (
      (row.nama_ref || '').toLowerCase().includes(term) ||
      (row.jenis_transaksi || '').toLowerCase().includes(term) ||
      (row.keterangan || '').toLowerCase().includes(term)
    );
  });

  const sortedRows = [...filteredRows].sort((a, b) => {
    return sortAsc ? (a.no || 0) - (b.no || 0) : (b.no || 0) - (a.no || 0);
  });

  const handleDownloadExcel = async () => {
    setDownloading(true);
    try {
      if (report?.file_output_url) {
        window.open(report.file_output_url, '_blank');
      } else {
        await downloadExcel(`Laporan_Gabungan_${report.tanggal || 'export'}.xlsx`);
      }
    } catch (e) {
      alert('Gagal download: ' + e.message);
    } finally {
      setDownloading(false);
    }
  };

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
                ID: {report.id}
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Tanggal Laporan: {report.tanggal} &bull; Diproses oleh: {report.dibuat_oleh_nama || 'System'}
            </p>
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
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak PDF</span>
          </button>

          <button
            onClick={handleDownloadExcel}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Mengunduh...' : 'Download Excel'}</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Debit</p>
          <p className="text-lg font-bold text-slate-900 mt-1 font-mono">{formatRupiah(report.total_debit)}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Kredit</p>
          <p className="text-lg font-bold text-slate-900 mt-1 font-mono">{formatRupiah(report.total_kredit)}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Jumlah Baris</p>
          <p className="text-lg font-bold text-slate-900 mt-1">{omsetRows.length} Item</p>
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
              <span className="font-mono font-bold text-xs text-amber-800">{formatRupiah(report.selisih)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main OMSET Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
                <tr key={row.no || Math.random()} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-semibold text-slate-700">{row.no}</td>
                  <td className="p-3 font-semibold text-slate-900">{row.nama_ref}</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded">{row.jenis_transaksi || '-'}</span></td>
                  <td className="p-3 font-mono text-slate-600">{row.kwitansi || '-'}</td>
                  <td className="p-3 text-slate-600 max-w-xs truncate">{row.keterangan || '-'}</td>
                  <td className="p-3 font-mono text-right">{row.tag_promo ? formatRupiah(row.tag_promo) : '-'}</td>
                  <td className="p-3 font-mono text-right">{row.giro_udp ? formatRupiah(row.giro_udp) : '-'}</td>
                  <td className="p-3 font-mono text-right">{row.piutang ? formatRupiah(row.piutang) : '-'}</td>
                  <td className="p-3 font-mono text-right text-emerald-700 font-medium">{row.pendapatan_toko ? formatRupiah(row.pendapatan_toko) : '-'}</td>
                  <td className="p-3 font-mono text-right">{row.pendapatan_logo ? formatRupiah(row.pendapatan_logo) : '-'}</td>
                  <td className="p-3 font-mono text-right">{row.pendapatan_kerjasama ? formatRupiah(row.pendapatan_kerjasama) : '-'}</td>
                  <td className="p-3 font-mono text-right">{row.non_pajak ? formatRupiah(row.non_pajak) : '-'}</td>
                  <td className="p-3 font-mono text-right">{row.ppn_pk ? formatRupiah(row.ppn_pk) : '-'}</td>
                  <td className="p-3 font-mono text-right">{row.ppn_wapu ? formatRupiah(row.ppn_wapu) : '-'}</td>
                  <td className="p-3 font-mono text-right">{row.beban_toko ? formatRupiah(row.beban_toko) : '-'}</td>
                  <td className="p-3 font-mono text-right">{row.beban_logo ? formatRupiah(row.beban_logo) : '-'}</td>
                  <td className="p-3 font-mono text-right">{row.persediaan_toko ? formatRupiah(row.persediaan_toko) : '-'}</td>
                  <td className="p-3 font-mono text-right">{row.persediaan_logo ? formatRupiah(row.persediaan_logo) : '-'}</td>
                  <td className="p-3 font-mono text-right">{row.simsem_uks ? formatRupiah(row.simsem_uks) : '-'}</td>
                  <td className="p-3 font-mono text-right text-blue-700 font-medium">{row.kas_uks ? formatRupiah(row.kas_uks) : '-'}</td>
                  <td className="p-3 font-mono text-right">{row.piutang_padi ? formatRupiah(row.piutang_padi) : '-'}</td>
                  <td className="p-3 font-mono text-right">{row.piutang_edc ? formatRupiah(row.piutang_edc) : '-'}</td>
                  <td className="p-3 font-mono text-right">{row.beban_promosi ? formatRupiah(row.beban_promosi) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dokumen Sumber Laporan */}
      {report?.files && report.files.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0A4D68]" />
              <span>Dokumen Sumber Laporan (OMI & SMART)</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">{report.files.length} Berkas Tersimpan</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {report.files.map((file) => (
              <div key={file.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:border-slate-300 transition">
                <div className="flex items-center gap-2.5 truncate">
                  {file.kategori?.includes('omi') ? (
                    <Store className="w-4 h-4 text-[#FF5000] shrink-0" />
                  ) : (
                    <Building className="w-4 h-4 text-[#0A4D68] shrink-0" />
                  )}
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-800 truncate" title={file.nama_file}>{file.nama_file}</p>
                    <p className="text-[10px] text-slate-400 font-mono uppercase">
                      {file.kategori} &bull; {file.ukuran_bytes ? (file.ukuran_bytes / 1024).toFixed(0) + ' KB' : '-'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReport;
