import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Download, Printer, ArrowLeft, CheckCircle2,
  AlertTriangle, Clock, Search, ArrowUpDown,
  FileText, Layers, Building, Store, Eye, X, Loader2,
  Pencil, Undo, Redo, Check, Save
} from 'lucide-react';
import { formatRupiah } from '../utils/cn';
import { getLaporanById, updateOmsetRow, updateLaporan, isSupabaseConfigured } from '../lib/supabaseClient';
import { downloadExcel } from '../utils/api';
import { MOCK_OMSET_DATA } from '../data/mockData';

const ManageReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [report, setReport]   = useState(null);
  // State edit tabel
  const [rows, setRows]               = useState([]);   // local editable copy
  const [originalRows, setOriginalRows] = useState([]); // baseline copy to detect unsaved changes
  const [past, setPast]               = useState([]);
  const [future, setFuture]           = useState([]);
  const [editingCell, setEditingCell] = useState(null); // { rowId, colKey }
  const [editValue, setEditValue]     = useState('');
  const [hoveredCell, setHoveredCell] = useState(null);
  const [saving, setSaving]           = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab]     = useState('OMSET');
  const [searchTerm, setSearchTerm]  = useState('');
  const [sortAsc, setSortAsc]         = useState(true);
  const [selectedPreviewFile, setSelectedPreviewFile] = useState(null);
  const [previewData, setPreviewData]  = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      try {
        if (isSupabaseConfigured() && id && id !== 'lap-001') {
          const data = await getLaporanById(id);
          if (data) {
            setReport(data);
            setRows(data.omsetRows || []);
            setOriginalRows(data.omsetRows || []);
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
      setRows(MOCK_OMSET_DATA);
      setOriginalRows(MOCK_OMSET_DATA);
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

  const omsetRows = rows;
  const isBalance = report?.status_balance === 'Balance';
  const isDraft   = report?.status_balance === 'Draft';

  // ── Kolom numerik & debit/kredit (sama dgn ReportPreview) ──
  const NUMERIC_COLS = new Set(['tag_promo','giro_udp','piutang','beban_toko','beban_logo','kas_uks','piutang_padi','piutang_edc','beban_promosi','pendapatan_toko','pendapatan_logo','pendapatan_kerjasama','non_pajak','ppn_pk','ppn_wapu','persediaan_toko','persediaan_logo','simsem_uks']);
  const COLS_DEBIT  = ['tag_promo','giro_udp','piutang','beban_toko','beban_logo','kas_uks','piutang_padi','piutang_edc','beban_promosi'];
  const COLS_KREDIT = ['pendapatan_toko','pendapatan_logo','pendapatan_kerjasama','non_pajak','ppn_pk','ppn_wapu','persediaan_toko','persediaan_logo','simsem_uks'];
  const sumCol = (col) => rows.reduce((s, r) => s + (Number(r[col]) || 0), 0);
  const totalDebit  = COLS_DEBIT.reduce((s, c) => s + sumCol(c), 0);
  const totalKredit = COLS_KREDIT.reduce((s, c) => s + sumCol(c), 0);

  // Cek apakah ada perubahan belum disimpan
  const isDirty = JSON.stringify(rows) !== JSON.stringify(originalRows);

  // ── Simpan Perubahan ke Supabase (Tombol Save Manual) ─────────
  const handleSaveChanges = async () => {
    if (!isDirty) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      if (isSupabaseConfigured() && id && !id.startsWith('mock')) {
        for (const row of rows) {
          const origRow = originalRows.find(r => r.id === row.id);
          if (origRow && row.id && !String(row.id).startsWith('mock')) {
            const updates = {};
            for (const col of Object.keys(row)) {
              if (row[col] !== origRow[col] && col !== 'id') {
                updates[col] = row[col];
              }
            }
            if (Object.keys(updates).length > 0) {
              await updateOmsetRow(row.id, updates);
            }
          }
        }

        // Hitung status balance baru & update header laporan di Supabase
        const newSelisih = Math.abs(totalDebit - totalKredit);
        const newStatus = totalDebit === totalKredit ? 'Balance' : 'Unbalance';
        await updateLaporan(id, {
          total_debit: totalDebit,
          total_kredit: totalKredit,
          selisih: newSelisih,
          status_balance: newStatus
        });
        
        setReport(prev => prev ? {
          ...prev,
          total_debit: totalDebit,
          total_kredit: totalKredit,
          selisih: newSelisih,
          status_balance: newStatus
        } : prev);
      }
      setOriginalRows(rows);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error('[Save] Gagal menyimpan perubahan:', e);
      alert('Gagal menyimpan perubahan ke database: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Undo / Redo ──────────────────────────────────────────
  const handleUndo = () => {
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    setPast(past.slice(0, -1));
    setFuture([rows, ...future]);
    setRows(prev);
    setEditingCell(null);
  };
  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture(future.slice(1));
    setPast([...past, rows]);
    setRows(next);
    setEditingCell(null);
  };

  // ── Edit Cell (Hanya ubah state lokal, simpan dilakukan via tombol Save) ──
  const startEdit = (rowId, colKey, currentVal) => {
    setEditingCell({ rowId, colKey });
    setEditValue(NUMERIC_COLS.has(colKey) ? (currentVal || 0) : (currentVal || ''));
  };

  const commitEdit = () => {
    if (!editingCell) return;
    const { rowId, colKey } = editingCell;
    const parsedVal = NUMERIC_COLS.has(colKey)
      ? (parseFloat(String(editValue).replace(/[^0-9.-]/g, '')) || 0)
      : editValue;
    const targetRow = rows.find(r => r.id === rowId);
    if (!targetRow || targetRow[colKey] === parsedVal) { setEditingCell(null); return; }
    const newRows = rows.map(r => r.id === rowId ? { ...r, [colKey]: parsedVal } : r);
    setPast([...past, rows]);
    setRows(newRows);
    setFuture([]);
    setEditingCell(null);
  };

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

  // ── Preview Dokumen Sumber ─────────────────────────────────
  const handlePreviewFile = async (file) => {
    if (!file.storage_path) {
      alert('File ini tidak memiliki URL storage. Silakan upload ulang laporan.');
      return;
    }
    setSelectedPreviewFile(file);
    setPreviewData(null);
    setPreviewLoading(true);
    try {
      const ext = file.nama_file.split('.').pop().toLowerCase();
      const res = await fetch(file.storage_path);
      if (!res.ok) throw new Error('Gagal mengambil file dari storage');

      if (ext === 'txt') {
        const text = await res.text();
        setPreviewData({ type: 'txt', content: text });
      } else if (['xls', 'xlsx'].includes(ext)) {
        const buffer = await res.arrayBuffer();
        const wb = XLSX.read(buffer, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        setPreviewData({ type: 'excel', content: rows, sheetName: wb.SheetNames[0] });
      } else {
        setPreviewData({ type: 'unknown', content: null });
      }
    } catch (err) {
      setPreviewData({ type: 'error', content: err.message });
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setSelectedPreviewFile(null);
    setPreviewData(null);
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
          {/* Tombol Simpan Perubahan jika data di-edit */}
          <button
            onClick={handleSaveChanges}
            disabled={!isDirty || saving}
            className={`flex items-center gap-2 px-4 py-2 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isDirty 
                ? 'bg-blue-600 hover:bg-blue-700 animate-pulse' 
                : saveSuccess 
                ? 'bg-emerald-600' 
                : 'bg-slate-700'
            }`}
            title={isDirty ? "Simpan Perubahan ke Database" : "Tidak ada perubahan"}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Tersimpan!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isDirty ? 'Simpan Perubahan' : 'Tersimpan'}</span>
              </>
            )}
          </button>

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
          <p className="text-lg font-bold text-slate-900 mt-1 font-mono">{formatRupiah(totalDebit)}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Kredit</p>
          <p className="text-lg font-bold text-slate-900 mt-1 font-mono">{formatRupiah(totalKredit)}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Jumlah Baris</p>
          <p className="text-lg font-bold text-slate-900 mt-1">{omsetRows.length} Item</p>
        </div>

        <div className={`p-4 rounded-xl border shadow-sm flex items-center justify-between ${
          totalDebit === totalKredit 
            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' 
            : 'bg-amber-50/60 border-amber-200 text-amber-900'
        }`}>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Status Laporan</p>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-base">
              {totalDebit === totalKredit ? (
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

          {/* Save button & Undo/Redo */}
          <div className="flex items-center gap-3">
            {isDirty && (
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                Ada perubahan belum disimpan
              </span>
            )}

            <button
              onClick={handleSaveChanges}
              disabled={!isDirty || saving}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                isDirty 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' 
                  : saveSuccess 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : saveSuccess ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{saving ? 'Menyimpan...' : saveSuccess ? 'Tersimpan' : 'Simpan'}</span>
            </button>

            <div className="h-4 w-px bg-slate-200" />

            <button onClick={handleUndo} disabled={past.length === 0}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition" title="Undo">
              <Undo className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleRedo} disabled={future.length === 0}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition" title="Redo">
              <Redo className="w-3.5 h-3.5" />
            </button>
          </div>
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
              {sortedRows.map((row) => {
                const mkCell = (colKey, content, extraClass = '') => {
                  const isEditing = editingCell?.rowId === row.id && editingCell?.colKey === colKey;
                  const isHovered = hoveredCell?.rowId === row.id && hoveredCell?.colKey === colKey;
                  return (
                    <td key={colKey}
                      className={`p-3 relative group ${extraClass}`}
                      onMouseEnter={() => setHoveredCell({ rowId: row.id, colKey })}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            autoFocus
                            type={NUMERIC_COLS.has(colKey) ? 'number' : 'text'}
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={commitEdit}
                            onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingCell(null); }}
                            className="w-full text-xs border border-blue-400 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300 font-mono"
                          />
                          <button onClick={commitEdit} className="p-1 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"><Check className="w-3 h-3" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="flex-1 min-w-0">{content}</span>
                          {isHovered && (
                            <button
                              onClick={() => startEdit(row.id, colKey, row[colKey])}
                              className="p-0.5 text-slate-300 hover:text-[#0A4D68] rounded transition cursor-pointer shrink-0 opacity-0 group-hover:opacity-100"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  );
                };
                return (
                <tr key={row.id || row.no} className="hover:bg-slate-50/80 transition">
                  <td className="p-3 font-semibold text-slate-700">{row.no}</td>
                  {mkCell('nama_ref',             <span className="font-semibold text-slate-900">{row.nama_ref}</span>)}
                  {mkCell('jenis_transaksi',       <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded">{row.jenis_transaksi || '-'}</span>)}
                  {mkCell('kwitansi',              <span className="font-mono text-slate-600">{row.kwitansi || '-'}</span>)}
                  {mkCell('keterangan',            <span className="text-slate-600 max-w-xs truncate block">{row.keterangan || '-'}</span>)}
                  {mkCell('tag_promo',             <span className="font-mono">{row.tag_promo ? formatRupiah(row.tag_promo) : '-'}</span>, 'text-right')}
                  {mkCell('giro_udp',              <span className="font-mono">{row.giro_udp ? formatRupiah(row.giro_udp) : '-'}</span>, 'text-right')}
                  {mkCell('piutang',               <span className="font-mono">{row.piutang ? formatRupiah(row.piutang) : '-'}</span>, 'text-right')}
                  {mkCell('pendapatan_toko',       <span className="font-mono text-emerald-700 font-medium">{row.pendapatan_toko ? formatRupiah(row.pendapatan_toko) : '-'}</span>, 'text-right')}
                  {mkCell('pendapatan_logo',       <span className="font-mono">{row.pendapatan_logo ? formatRupiah(row.pendapatan_logo) : '-'}</span>, 'text-right')}
                  {mkCell('pendapatan_kerjasama',  <span className="font-mono">{row.pendapatan_kerjasama ? formatRupiah(row.pendapatan_kerjasama) : '-'}</span>, 'text-right')}
                  {mkCell('non_pajak',             <span className="font-mono">{row.non_pajak ? formatRupiah(row.non_pajak) : '-'}</span>, 'text-right')}
                  {mkCell('ppn_pk',                <span className="font-mono">{row.ppn_pk ? formatRupiah(row.ppn_pk) : '-'}</span>, 'text-right')}
                  {mkCell('ppn_wapu',              <span className="font-mono">{row.ppn_wapu ? formatRupiah(row.ppn_wapu) : '-'}</span>, 'text-right')}
                  {mkCell('beban_toko',            <span className="font-mono">{row.beban_toko ? formatRupiah(row.beban_toko) : '-'}</span>, 'text-right')}
                  {mkCell('beban_logo',            <span className="font-mono">{row.beban_logo ? formatRupiah(row.beban_logo) : '-'}</span>, 'text-right')}
                  {mkCell('persediaan_toko',       <span className="font-mono">{row.persediaan_toko ? formatRupiah(row.persediaan_toko) : '-'}</span>, 'text-right')}
                  {mkCell('persediaan_logo',       <span className="font-mono">{row.persediaan_logo ? formatRupiah(row.persediaan_logo) : '-'}</span>, 'text-right')}
                  {mkCell('simsem_uks',            <span className="font-mono">{row.simsem_uks ? formatRupiah(row.simsem_uks) : '-'}</span>, 'text-right')}
                  {mkCell('kas_uks',               <span className="font-mono text-blue-700 font-medium">{row.kas_uks ? formatRupiah(row.kas_uks) : '-'}</span>, 'text-right')}
                  {mkCell('piutang_padi',          <span className="font-mono">{row.piutang_padi ? formatRupiah(row.piutang_padi) : '-'}</span>, 'text-right')}
                  {mkCell('piutang_edc',           <span className="font-mono">{row.piutang_edc ? formatRupiah(row.piutang_edc) : '-'}</span>, 'text-right')}
                  {mkCell('beban_promosi',         <span className="font-mono">{row.beban_promosi ? formatRupiah(row.beban_promosi) : '-'}</span>, 'text-right')}
                </tr>
              );
              })}
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
                {file.storage_path && (
                  <button
                    onClick={() => handlePreviewFile(file)}
                    className="ml-2 p-1.5 text-slate-400 hover:text-[#0A4D68] hover:bg-blue-50 rounded-lg transition shrink-0 cursor-pointer"
                    title="Preview isi dokumen"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Preview Dokumen */}
      {selectedPreviewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-5 h-5 text-[#0A4D68] shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{selectedPreviewFile.nama_file}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-mono">{selectedPreviewFile.kategori}</p>
                </div>
              </div>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-slate-100 rounded-xl transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-auto flex-1 p-4">
              {previewLoading && (
                <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-[#0A4D68]" />
                  <span className="text-sm">Memuat isi dokumen...</span>
                </div>
              )}

              {!previewLoading && previewData?.type === 'txt' && (
                <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {previewData.content}
                </pre>
              )}

              {!previewLoading && previewData?.type === 'excel' && (
                <div>
                  <p className="text-[10px] text-slate-400 mb-2 font-mono">Sheet: {previewData.sheetName} · {previewData.content.length} baris</p>
                  <div className="overflow-auto rounded-xl border border-slate-200">
                    <table className="text-xs border-collapse w-full">
                      <tbody>
                        {previewData.content.slice(0, 200).map((row, ri) => (
                          <tr key={ri} className={ri === 0 ? 'bg-[#0A4D68] text-white font-bold sticky top-0' : ri % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            {row.map((cell, ci) => (
                              <td key={ci} className="px-3 py-1.5 border border-slate-200 whitespace-nowrap">
                                {cell !== null && cell !== undefined ? String(cell) : ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {previewData.content.length > 200 && (
                    <p className="text-[10px] text-slate-400 mt-2 text-center">Menampilkan 200 baris pertama dari {previewData.content.length} baris total</p>
                  )}
                </div>
              )}

              {!previewLoading && previewData?.type === 'error' && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-sm text-red-700">{previewData.content}</p>
                </div>
              )}

              {!previewLoading && previewData?.type === 'unknown' && (
                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  <p className="text-sm text-amber-700">Format file tidak didukung untuk preview langsung.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 flex justify-between items-center shrink-0">
              <p className="text-[10px] text-slate-400">
                {selectedPreviewFile.ukuran_bytes ? (selectedPreviewFile.ukuran_bytes / 1024).toFixed(1) + ' KB' : '-'}
              </p>
              <div className="flex gap-2">
                <a
                  href={selectedPreviewFile.storage_path}
                  download={selectedPreviewFile.nama_file}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>
                <button
                  onClick={closePreview}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReport;
