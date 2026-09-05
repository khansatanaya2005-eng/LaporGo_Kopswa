import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  History, Search, Calendar, Download, Eye,
  CheckCircle2, AlertTriangle, Clock, Filter,
  FileText, Loader2, RefreshCw, DatabaseZap,
  Trash2, RotateCcw, AlertOctagon, X, CheckSquare, Square
} from 'lucide-react';
import { formatRupiah } from '../utils/cn';
import {
  getLaporanList, getTrashLaporanList, softDeleteLaporan,
  restoreLaporan, deleteLaporanPermanently, isSupabaseConfigured
} from '../lib/supabaseClient';
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
  const [reports,         setReports]         = useState([]);
  const [trashReports,    setTrashReports]    = useState([]);
  const [selectedIds,     setSelectedIds]     = useState([]);
  const [trashSelectedIds,setTrashSelectedIds] = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [usingMock,       setUsingMock]       = useState(false);
  const [filterStatus,    setFilterStatus]    = useState('ALL');
  const [searchQuery,     setSearchQuery]     = useState('');
  const [showTrashModal,  setShowTrashModal]  = useState(false);
  const [processing,      setProcessing]      = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const data = await getLaporanList(50);
        const trashData = await getTrashLaporanList();
        if (data) {
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
          setTrashReports((trashData || []).map(r => {
            const calculatedSelisih = Math.abs((Number(r.total_debit) || 0) - (Number(r.total_kredit) || 0));
            return {
              id:               r.id,
              tanggal:          r.tanggal,
              status_balance:   r.status_balance,
              total_debit:      r.total_debit,
              total_kredit:     r.total_kredit,
              selisih:          calculatedSelisih,
              dibuat_oleh_nama: r.profiles?.full_name || r.dibuat_oleh || 'System',
              deleted_at:       r.deleted_at,
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

  // ── Select Handlers (Main Table) ────────────────────────
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // ── Soft Delete Selected ──────────────────────────────────
  const handleSoftDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Pindahkan ${selectedIds.length} laporan terpilih ke Tempat Sampah?`)) return;

    setProcessing(true);
    try {
      if (isSupabaseConfigured()) {
        await softDeleteLaporan(selectedIds);
      }
      // Update local state
      const deletedItems = reports.filter(r => selectedIds.includes(r.id));
      setReports(prev => prev.filter(r => !selectedIds.includes(r.id)));
      setTrashReports(prev => [
        ...deletedItems.map(item => ({ ...item, deleted_at: new Date().toISOString() })),
        ...prev
      ]);
      setSelectedIds([]);
    } catch (e) {
      alert('Gagal memindahkan ke tempat sampah: ' + e.message);
    } finally {
      setProcessing(false);
    }
  };

  // ── Select Handlers (Trash Modal Table) ──────────────────
  const handleTrashSelectAll = (e) => {
    if (e.target.checked) {
      setTrashSelectedIds(trashReports.map(r => r.id));
    } else {
      setTrashSelectedIds([]);
    }
  };

  const handleTrashSelectRow = (id) => {
    setTrashSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // ── Restore Selected ─────────────────────────────────────
  const handleRestoreSelected = async (targetIds = trashSelectedIds) => {
    if (targetIds.length === 0) return;
    setProcessing(true);
    try {
      if (isSupabaseConfigured()) {
        await restoreLaporan(targetIds);
      }
      const restoredItems = trashReports.filter(r => targetIds.includes(r.id));
      setTrashReports(prev => prev.filter(r => !targetIds.includes(r.id)));
      setReports(prev => [...restoredItems, ...prev]);
      setTrashSelectedIds(prev => prev.filter(id => !targetIds.includes(id)));
    } catch (e) {
      alert('Gagal memulihkan laporan: ' + e.message);
    } finally {
      setProcessing(false);
    }
  };

  // ── Delete Permanently Selected ──────────────────────────
  const handlePermanentDeleteSelected = async (targetIds = trashSelectedIds) => {
    if (targetIds.length === 0) return;
    if (!confirm(`HAPUS PERMANEN ${targetIds.length} laporan? Data yang terhapus tidak dapat dikembalikan dari database!`)) return;

    setProcessing(true);
    try {
      if (isSupabaseConfigured()) {
        await deleteLaporanPermanently(targetIds);
      }
      setTrashReports(prev => prev.filter(r => !targetIds.includes(r.id)));
      setTrashSelectedIds(prev => prev.filter(id => !targetIds.includes(id)));
    } catch (e) {
      alert('Gagal menghapus permanen: ' + e.message);
    } finally {
      setProcessing(false);
    }
  };

  // ── Empty Trash (Hapus Semua Sampah) ────────────────────
  const handleEmptyTrash = async () => {
    if (trashReports.length === 0) return;
    if (!confirm(`APAKAH ANDA YAKIN ingin mengosongkan tempat sampah? Seluruh ${trashReports.length} laporan akan dihapus PERMANEN dari database!`)) return;

    setProcessing(true);
    try {
      const allTrashIds = trashReports.map(r => r.id);
      if (isSupabaseConfigured()) {
        await deleteLaporanPermanently(allTrashIds);
      }
      setTrashReports([]);
      setTrashSelectedIds([]);
    } catch (e) {
      alert('Gagal mengosongkan tempat sampah: ' + e.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async (row) => {
    if (row.file_output_url && row.file_output_url !== '#') {
      window.open(row.file_output_url, '_blank');
    } else {
      alert(`File Excel untuk laporan ${row.tanggal} tidak tersedia.\nSilakan proses ulang laporan ini.`);
    }
  };

  const getDaysLeft = (deletedAtStr) => {
    if (!deletedAtStr) return 30;
    const deletedTime = new Date(deletedAtStr).getTime();
    const expiryTime  = deletedTime + 30 * 24 * 60 * 60 * 1000;
    const diffDays    = Math.ceil((expiryTime - Date.now()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Riwayat Laporan</h1>
          <p className="text-sm text-slate-500 mt-1">
            Arsip laporan harian gabungan Toko OMI &amp; SMART.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tombol Tempat Sampah */}
          <button
            onClick={() => setShowTrashModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer relative"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-600" />
            <span>Tempat Sampah</span>
            {trashReports.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-red-500 text-white text-[10px] font-bold rounded-full">
                {trashReports.length}
              </span>
            )}
          </button>

          <button onClick={fetchReports} disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Mock Data Notice */}
      {usingMock && (
        <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
          <DatabaseZap className="w-4 h-4 shrink-0" />
          <span>Menampilkan <strong>data contoh</strong> — Supabase belum terkonfigurasi atau tidak ada laporan tersimpan.</span>
        </div>
      )}

      {/* Filter Toolbar & Actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input type="text" placeholder="Cari tanggal atau pembuat..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4D68]" />
          </div>

          {/* Tombol Hapus Terpilih */}
          {selectedIds.length > 0 && (
            <button
              onClick={handleSoftDeleteSelected}
              disabled={processing}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus ({selectedIds.length})</span>
            </button>
          )}
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
                  <th className="py-3.5 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && selectedIds.length === filtered.length}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-[#0A4D68] focus:ring-[#0A4D68] cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-5">Tanggal</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Total Debit / Kredit</th>
                  <th className="py-3.5 px-5">Selisih</th>
                  <th className="py-3.5 px-5">Dibuat Oleh</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length > 0 ? filtered.map(row => {
                  const isSelected = selectedIds.includes(row.id);
                  return (
                    <tr key={row.id} className={`transition ${isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(row.id)}
                          className="rounded border-slate-300 text-[#0A4D68] focus:ring-[#0A4D68] cursor-pointer"
                        />
                      </td>
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
                  );
                }) : (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400 text-xs">
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

      {/* ── MODAL TEMPAT SAMPAH (TRASH BIN) ────────────────────── */}
      {showTrashModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-100 text-red-600 rounded-xl">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    <span>Tempat Sampah Laporan</span>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                      {trashReports.length} Item
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Laporan di sini akan otomatis dihapus permanen dari database setelah 30 hari.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTrashModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Actions Bar */}
            {trashReports.length > 0 && (
              <div className="px-5 py-3 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRestoreSelected()}
                    disabled={trashSelectedIds.length === 0 || processing}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition disabled:opacity-40 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Pulihkan Terpilih ({trashSelectedIds.length})</span>
                  </button>

                  <button
                    onClick={() => handlePermanentDeleteSelected()}
                    disabled={trashSelectedIds.length === 0 || processing}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition disabled:opacity-40 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Permanen Terpilih ({trashSelectedIds.length})</span>
                  </button>
                </div>

                <button
                  onClick={handleEmptyTrash}
                  disabled={processing}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-bold rounded-lg transition cursor-pointer"
                >
                  <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
                  <span>Kosongkan Tempat Sampah</span>
                </button>
              </div>
            )}

            {/* Modal Table Content */}
            <div className="p-5 overflow-y-auto flex-1">
              {trashReports.length === 0 ? (
                <div className="text-center py-16 text-slate-400 space-y-2">
                  <Trash2 className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
                  <p className="font-semibold text-slate-600 text-sm">Tempat sampah kosong</p>
                  <p className="text-xs">Tidak ada laporan yang telah dihapus.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={trashReports.length > 0 && trashSelectedIds.length === trashReports.length}
                            onChange={handleTrashSelectAll}
                            className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                          />
                        </th>
                        <th className="p-3">TANGGAL LAPORAN</th>
                        <th className="p-3">STATUS</th>
                        <th className="p-3">TOTAL DEBIT</th>
                        <th className="p-3">SISA WAKTU</th>
                        <th className="p-3 text-right">AKSI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {trashReports.map(item => {
                        const daysLeft = getDaysLeft(item.deleted_at);
                        const isSelected = trashSelectedIds.includes(item.id);
                        return (
                          <tr key={item.id} className={isSelected ? 'bg-red-50/50' : 'hover:bg-slate-50'}>
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleTrashSelectRow(item.id)}
                                className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                              />
                            </td>
                            <td className="p-3 font-bold text-slate-800 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span>{item.tanggal}</span>
                            </td>
                            <td className="p-3"><StatusBadge status={item.status_balance} /></td>
                            <td className="p-3 font-mono font-medium text-slate-700">{formatRupiah(item.total_debit)}</td>
                            <td className="p-3">
                              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-semibold text-[10px]">
                                {daysLeft} hari lagi
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleRestoreSelected([item.id])}
                                  className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold rounded-lg transition cursor-pointer"
                                  title="Pulihkan Laporan Ini"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Pulihkan</span>
                                </button>
                                <button
                                  onClick={() => handlePermanentDeleteSelected([item.id])}
                                  className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-bold rounded-lg transition cursor-pointer"
                                  title="Hapus Permanen"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Hapus</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowTrashModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportHistory;
