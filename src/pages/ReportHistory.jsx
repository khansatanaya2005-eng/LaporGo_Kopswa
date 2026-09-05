import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  History, Search, Calendar, Download, Eye,
  CheckCircle2, AlertTriangle, Clock, Filter,
  FileText, Loader2, RefreshCw, DatabaseZap
} from 'lucide-react';
import { formatRupiah } from '../utils/cn';
import { getLaporanList, isSupabaseConfigured } from '../lib/supabaseClient';
import { MOCK_HISTORY_LAPORAN } from '../data/mockData';

const StatusBadge = ({ status }) => {
  if (status === 'Balance')
    return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
      <CheckCircle2 className="w-3.5 h-3.5" /><span>Balance</span></span>;
  if (status === 'Unbalance')
    return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
      <AlertTriangle className="w-3.5 h-3.5" /><span>Unbalance</span></span>;
  return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
    <Clock className="w-3.5 h-3.5" /><span>Draft</span></span>;
};

const ReportHistory = () => {
  const [reports,      setReports]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [usingMock,    setUsingMock]    = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery,  setSearchQuery]  = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const data = await getLaporanList(50);
        if (data) {
          // Normalisasi field dari Supabase
          setReports(data.map(r => {
            const calculatedSelisih = Math.abs((Number(r.total_debit) || 0) - (Number(r.total_kredit) || 0));
            const calculatedStatus  = calculatedSelisih === 0 ? 'Balance' : 'Unbalance';
            return {
              id:               r.id,
              tanggal:          r.tanggal,
              status_balance:   r.status_balance === 'Draft' ? 'Draft' : calculatedStatus,
              total_debit:      r.total_debit,
              total_kredit:     r.total_kredit,
              selisih:          calculatedSelisih,
              jumlah_transaksi: r.jumlah_transaksi,
              dibuat_oleh_nama: r.profiles?.full_name || r.dibuat_oleh || 'System',
              created_at:       r.created_at,
              file_output_url:  r.file_output_url,
            };
          }));
          setUsingMock(false);
          setLoading(false);
          return;
        }
      }
      // Fallback ke mock data
      const mappedMock = MOCK_HISTORY_LAPORAN.map(r => {
        const calculatedSelisih = Math.abs((Number(r.total_debit) || 0) - (Number(r.total_kredit) || 0));
        const calculatedStatus  = calculatedSelisih === 0 ? 'Balance' : 'Unbalance';
        return {
          ...r,
          status_balance: r.status_balance === 'Draft' ? 'Draft' : calculatedStatus,
          selisih: calculatedSelisih
        };
      });
      setReports(mappedMock);
      setUsingMock(true);
    } catch (err) {
      console.error('Error fetching reports:', err);
      const mappedMock = MOCK_HISTORY_LAPORAN.map(r => {
        const calculatedSelisih = Math.abs((Number(r.total_debit) || 0) - (Number(r.total_kredit) || 0));
        const calculatedStatus  = calculatedSelisih === 0 ? 'Balance' : 'Unbalance';
        return {
          ...r,
          status_balance: r.status_balance === 'Draft' ? 'Draft' : calculatedStatus,
          selisih: calculatedSelisih
        };
      });
      setReports(mappedMock);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const filtered = reports.filter(r => {
    const matchSearch = r.tanggal?.includes(searchQuery) ||
      r.dibuat_oleh_nama?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || r.status_balance === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleDownload = async (row) => {
    if (row.file_output_url && row.file_output_url !== '#') {
      window.open(row.file_output_url, '_blank');
    } else {
      alert(`File Excel untuk laporan ${row.tanggal} tidak tersedia.\nSilakan proses ulang laporan ini.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Riwayat Laporan</h1>
          <p className="text-sm text-slate-500 mt-1">
            Arsip laporan harian gabungan Toko OMI &amp; SMART.
          </p>
        </div>
        <button onClick={fetchReports} disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Mock Data Notice */}
      {usingMock && (
        <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
          <DatabaseZap className="w-4 h-4 shrink-0" />
          <span>Menampilkan <strong>data contoh</strong> — Supabase belum terkonfigurasi atau tidak ada laporan tersimpan.</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input type="text" placeholder="Cari tanggal atau pembuat..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4D68]" />
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#0A4D68]">
              <option value="ALL">Semua Status</option>
              <option value="Balance">Balance</option>
              <option value="Unbalance">Unbalance</option>
            </select>
          </div>
          <span className="text-xs text-slate-400">{filtered.length} laporan</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Memuat data dari database...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-5">Tanggal</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Total Debit / Kredit</th>
                  <th className="py-3.5 px-5">Selisih</th>
                  <th className="py-3.5 px-5">Dibuat Oleh</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length > 0 ? filtered.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50 transition">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <Calendar className="w-4 h-4 text-[#0A4D68]" />
                        <span>{row.tanggal}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 ml-6 mt-0.5">
                        {new Date(row.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                    </td>
                    <td className="py-4 px-5"><StatusBadge status={row.status_balance} /></td>
                    <td className="py-4 px-5 font-mono font-medium text-slate-800 text-xs">
                      <div>{formatRupiah(row.total_debit)}</div>
                      <div className="text-slate-400">{formatRupiah(row.total_kredit)}</div>
                    </td>
                    <td className="py-4 px-5 font-mono text-xs">
                      <span className={row.selisih === 0 ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>
                        {formatRupiah(row.selisih || 0)}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-500 text-xs">{row.dibuat_oleh_nama}</td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/kelola/${row.id}`}
                          className="flex items-center gap-1 text-xs font-semibold text-[#0A4D68] bg-[#0A4D68]/10 hover:bg-[#0A4D68]/20 px-3 py-1.5 rounded-lg border border-[#0A4D68]/20 transition">
                          <Eye className="w-3.5 h-3.5" /><span>Detail</span>
                        </Link>
                        <button onClick={() => handleDownload(row)}
                          className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg border border-slate-200 transition cursor-pointer"
                          title="Download Excel">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400 text-xs">
                      <History className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p>Tidak ditemukan laporan yang sesuai.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportHistory;
