import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  History, 
  Search, 
  Calendar, 
  Download, 
  Eye, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  Filter,
  FileText
} from 'lucide-react';
import { MOCK_HISTORY_LAPORAN } from '../data/mockData';
import { formatRupiah } from '../utils/cn';

const ReportHistory = () => {
  const [filterMonth, setFilterMonth] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const reports = MOCK_HISTORY_LAPORAN.filter(row => {
    const matchesSearch = row.tanggal.includes(searchQuery) || row.dibuat_oleh_nama.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMonth = filterMonth === 'ALL' || row.tanggal.startsWith(filterMonth);
    const matchesStatus = filterStatus === 'ALL' || row.status_balance === filterStatus;
    return matchesSearch && matchesMonth && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Balance':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Balance</span>
          </span>
        );
      case 'Unbalance':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Unbalance</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Draft</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Riwayat Laporan</h1>
        <p className="text-sm text-slate-500 mt-1">
          Daftar seluruh arsip laporan harian gabungan Toko OMI & SMART yang telah tersimpan.
        </p>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari tanggal atau pembuat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4D68]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#0A4D68]"
            >
              <option value="ALL">Semua Bulan</option>
              <option value="2026-09">September 2026</option>
              <option value="2026-08">Agustus 2026</option>
              <option value="2026-07">Juli 2026</option>
            </select>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#0A4D68]"
          >
            <option value="ALL">Semua Status</option>
            <option value="Balance">Balance</option>
            <option value="Unbalance">Unbalance</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Tanggal</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Total Debit / Kredit</th>
                <th className="py-3.5 px-5">File Upload</th>
                <th className="py-3.5 px-5">Dibuat Oleh</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.length > 0 ? (
                reports.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition">
                    <td className="py-4 px-5 font-semibold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#0A4D68]" />
                      <span className="font-bold text-slate-900">{row.tanggal}</span>
                    </td>
                    <td className="py-4 px-5">
                      {getStatusBadge(row.status_balance)}
                    </td>
                    <td className="py-4 px-5 font-mono font-medium text-slate-800">
                      {formatRupiah(row.total_debit)}
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <FileText className="w-3.5 h-3.5 text-[#0A4D68]" />
                        <span>5 File (3 OMI, 2 SMART)</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-slate-500">{row.dibuat_oleh_nama}</td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/kelola/${row.id}`}
                          title="Kelola Laporan"
                          className="flex items-center gap-1 text-xs font-semibold text-[#0A4D68] bg-[#0A4D68]/10 hover:bg-[#0A4D68]/20 px-3 py-1.5 rounded-lg border border-[#0A4D68]/20 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </Link>
                        <button
                          onClick={() => alert(`Mengunduh ulang laporan tanggal ${row.tanggal}`)}
                          title="Download Excel"
                          className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg border border-slate-200 transition cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 text-xs">
                    Tidak ditemukan laporan yang sesuai kriteria pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportHistory;
