import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Download, RefreshCw, CheckCircle2, AlertTriangle,
  Search, ArrowUpDown, Layers, ChevronLeft, ChevronRight,
  Save, Loader2, Check, Info, Pencil, Undo, Redo
} from 'lucide-react';
import { formatRupiah } from '../utils/cn';
import { downloadExcel } from '../utils/api';
import { saveLaporanToSupabase, uploadOutputExcel, updateLaporan, isSupabaseConfigured } from '../lib/supabaseClient';

const OMSET_HEADERS = [
  'NO','NAMA DAN REF','JENIS TRANSAKSI','KWITANSI','KETERANGAN',
  'TAG PROMO','GIRO UDP','PIUTANG',
  'PENDAPATAN TOKO','PENDAPATAN LOGO','PENDAPATAN KERJASAMA',
  'NON PAJAK','PPN PK','PPN WAPU',
  'BEBAN TOKO','BEBAN LOGO',
  'PERSEDIAAN TOKO','PERSEDIAAN LOGO',
  'SIMSEM UKS','KAS UKS','PIUTANG PADI','PIUTANG EDC','BEBAN PROMOSI'
];

const OMSET_KEYS = [
  'no','nama_ref','jenis_transaksi','kwitansi','keterangan',
  'tag_promo','giro_udp','piutang',
  'pendapatan_toko','pendapatan_logo','pendapatan_kerjasama',
  'non_pajak','ppn_pk','ppn_wapu',
  'beban_toko','beban_logo',
  'persediaan_toko','persediaan_logo',
  'simsem_uks','kas_uks','piutang_padi','piutang_edc','beban_promosi'
];

const NUMERIC_COLS = new Set(OMSET_KEYS.slice(5)); // kolom 6–23 adalah angka

const COLS_DEBIT = ['tag_promo','giro_udp','piutang','beban_toko','beban_logo','kas_uks','piutang_padi','piutang_edc','beban_promosi'];
const COLS_KREDIT = ['pendapatan_toko','pendapatan_logo','pendapatan_kerjasama','non_pajak','ppn_pk','ppn_wapu','persediaan_toko','persediaan_logo','simsem_uks'];

const ReportPreview = () => {
  const location = useLocation();
  const navigate  = useNavigate();

  const { reportData, sourceFiles } = location.state || {};

  // Redirect jika tidak ada data
  if (!reportData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-500">
        <Layers className="w-12 h-12 text-slate-300" />
        <p className="font-semibold">Tidak ada data laporan.</p>
        <button onClick={() => navigate('/upload')}
          className="px-5 py-2 bg-[#FF5000] text-white text-xs font-bold rounded-xl cursor-pointer">
          Kembali ke Upload
        </button>
      </div>
    );
  }

  const { omsetRows: initialOmsetRows = [], summary: initialSummary = {}, warnings = [] } = reportData;

  const [past, setPast] = useState([]);
  const [present, setPresent] = useState(initialOmsetRows);
  const [future, setFuture] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [hoveredCell, setHoveredCell] = useState(null);

  const [activeTab,    setActiveTab]    = useState('OMSET');
  const [searchTerm,   setSearchTerm]   = useState('');
  const [sortAsc,      setSortAsc]      = useState(true);
  const [downloading,  setDownloading]  = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [customDate,   setCustomDate]   = useState('');

  const sumCol = (rows, col) => rows.reduce((s, r) => s + (Number(r[col]) || 0), 0);

  const totalDebit  = COLS_DEBIT.reduce((s, c)  => s + sumCol(present, c), 0);
  const totalKredit = COLS_KREDIT.reduce((s, c) => s + sumCol(present, c), 0);
  const selisih     = totalDebit - totalKredit;
  const isBalance   = selisih === 0;

  const dynamicSummary = {
    ...initialSummary,
    totalDebit,
    totalKredit,
    selisih,
    statusBalance: isBalance ? 'Balance' : 'Unbalance'
  };

  const handleUndo = () => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast(past.slice(0, past.length - 1));
    setFuture([present, ...future]);
    setPresent(previous);
    setEditingCell(null);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture(future.slice(1));
    setPast([...past, present]);
    setPresent(next);
    setEditingCell(null);
  };

  const saveEdit = () => {
    if (!editingCell) return;
    const parsedVal = parseInt(String(editValue).replace(/\./g, '').replace(/Rp\s*/i, '')) || 0;
    
    const targetRow = present.find(r => r.no === editingCell.rowNo);
    if (!targetRow || targetRow[editingCell.colKey] === parsedVal) {
      setEditingCell(null);
      return;
    }

    const newPresent = present.map(r => 
      r.no === editingCell.rowNo ? { ...r, [editingCell.colKey]: parsedVal } : r
    );

    setPast([...past, present]);
    setPresent(newPresent);
    setFuture([]);
    setEditingCell(null);
  };

  const handleSetToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setCustomDate(today);
  };

  const tabs = [
    { id: 'OMSET',  label: 'Sheet OMSET' },
    { id: 'DETAIL', label: 'Ringkasan' },
  ];

  const filteredRows = present.filter(r => {
    const t = searchTerm.toLowerCase();
    return r.nama_ref?.toLowerCase().includes(t) ||
           r.jenis_transaksi?.toLowerCase().includes(t) ||
           r.keterangan?.toLowerCase().includes(t);
  });
  const sortedRows = [...filteredRows].sort((a, b) => sortAsc ? a.no - b.no : b.no - a.no);

  // Download Excel dari backend
  const handleDownloadExcel = async () => {
    if (!customDate) return alert("Pilih tanggal laporan terlebih dahulu!");
    setDownloading(true);
    try {
      await downloadExcel(present, dynamicSummary, customDate, `Laporan_Gabungan_${customDate}.xlsx`);
    } catch (e) {
      alert('Gagal mengunduh Excel: ' + e.message);
    } finally {
      setDownloading(false);
    }
  };

  // Simpan ke Supabase (laporan + omset_rows + warnings)
  const handleSave = async () => {
    if (saved) return;
    setSaving(true);
    try {
      if (isSupabaseConfigured()) {
        // Buat file metadata dari sourceFiles (wajib + opsional)
        const toFilesMeta = (names, kategori) =>
          (names || []).filter(Boolean).map(n => ({ nama_file: n, kategori }));

        const filesMeta = [
          // Wajib
          sourceFiles?.omiPerTanggal && { nama_file: sourceFiles.omiPerTanggal, kategori: 'omi_per_tanggal' },
          ...toFilesMeta(sourceFiles?.omiTutupHarian, 'omi_tutup_harian'),
          ...toFilesMeta(sourceFiles?.smartFiles,     'smart_toko'),
          // Opsional OMI
          ...toFilesMeta(sourceFiles?.omiPerMember,  'omi_per_member'),
          ...toFilesMeta(sourceFiles?.omiDiscItem,   'omi_disc_item'),
          ...toFilesMeta(sourceFiles?.omiStrukTxt,   'omi_struk_txt'),
          ...toFilesMeta(sourceFiles?.omiPareto,     'omi_pareto'),
          ...toFilesMeta(sourceFiles?.omiAnalisa,    'omi_analisa'),
          ...toFilesMeta(sourceFiles?.omiPerStruk,   'omi_per_struk'),
          ...toFilesMeta(sourceFiles?.omiPersediaan, 'omi_persediaan'),
          // Opsional SMART
          ...toFilesMeta(sourceFiles?.smartDetail,   'smart_detail'),
        ].filter(Boolean);

        await saveLaporanToSupabase(
          { tanggal: customDate, summary: dynamicSummary, omsetRows: present, warnings },
          filesMeta
        );
      }
      setSaved(true);
    } catch (e) {
      alert('Gagal menyimpan: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 mb-1">Preview Hasil Penggabungan Laporan</h1>
            <div className="flex items-center gap-2 mt-1">
              <label className="text-xs font-semibold text-slate-600">Tanggal:</label>
              <input 
                type="date" 
                value={customDate} 
                onChange={e => setCustomDate(e.target.value)} 
                className="text-xs px-2 py-1 border border-slate-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
              />
              <button 
                onClick={handleSetToday}
                className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition cursor-pointer"
              >
                Hari Ini
              </button>
              <span className="text-xs text-slate-400 ml-2">· {present.length} baris OMSET</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button onClick={() => navigate('/upload')}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Proses Ulang</span>
          </button>
          <button onClick={handleSave} disabled={saving || saved || !customDate}
            className={`flex items-center gap-1.5 px-4 py-2 font-bold text-xs rounded-xl shadow-md transition cursor-pointer ${
              saved ? 'bg-emerald-500 text-white' : 
              !customDate ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 
              'bg-[#FF5000] hover:bg-[#e04600] text-white active:scale-95'}`}>
            {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Menyimpan...</span></>
              : saved ? <><Check className="w-3.5 h-3.5" /><span>Tersimpan</span></>
              : <><Save className="w-3.5 h-3.5" /><span>Simpan ke Database</span></>}
          </button>
          <button onClick={handleDownloadExcel} disabled={downloading || !customDate}
            className={`flex items-center gap-2 px-5 py-2 font-bold text-xs rounded-xl shadow-md transition cursor-pointer ${
              !customDate ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Mengunduh...' : 'Download Excel'}</span>
          </button>
        </div>
      </div>

      {/* Warning Banner */}
      {warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>{warnings.length} Peringatan Validasi</span>
          </div>
          {warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-amber-700">
              <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                w.severity === 'ERROR' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                {w.severity}
              </span>
              <span>{w.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Debit',  val: formatRupiah(dynamicSummary.totalDebit),  color: 'text-slate-900' },
          { label: 'Total Kredit', val: formatRupiah(dynamicSummary.totalKredit), color: 'text-slate-900' },
          { label: 'Selisih',      val: formatRupiah(dynamicSummary.selisih),     color: isBalance ? 'text-emerald-700' : 'text-red-600' },
          { label: 'Jumlah Baris', val: `${dynamicSummary.jumlahTransaksi || present.length} item`, color: 'text-slate-900' },
        ].map((c, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">{c.label}</p>
            <p className={`text-lg font-bold mt-1 font-mono ${c.color}`}>{c.val}</p>
          </div>
        ))}
      </div>

      {/* Status Balance */}
      <div className={`flex items-center gap-3 p-4 rounded-2xl border ${
        isBalance ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
        {isBalance
          ? <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          : <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />}
        <div>
          <p className={`font-bold text-sm ${isBalance ? 'text-emerald-700' : 'text-red-600'}`}>
            {isBalance ? '✅ BALANCE — Debit = Kredit' : '⚠️ UNBALANCE — Debit ≠ Kredit'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {isBalance
              ? 'Laporan siap untuk didownload dan disimpan.'
              : `Selisih: ${formatRupiah(dynamicSummary.selisih)}. Periksa kembali file sumber atau edit baris terkait.`}
          </p>
        </div>
      </div>

      {/* Tabs + Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 px-3 pt-2 gap-1 scrollbar-none">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 border-t-2 border-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* OMSET Table */}
        {activeTab === 'OMSET' && (
          <div>
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input type="text" placeholder="Cari nama ref, keterangan..."
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex items-center gap-1 border-l border-slate-200 pl-2 ml-1">
                  <button onClick={handleUndo} disabled={past.length === 0} title="Undo (Kembali)"
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer">
                    <Undo className="w-4 h-4" />
                  </button>
                  <button onClick={handleRedo} disabled={future.length === 0} title="Redo (Maju)"
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer">
                    <Redo className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button onClick={() => setSortAsc(!sortAsc)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Urutan ({sortAsc ? 'Asc' : 'Desc'})</span>
              </button>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-900 text-white sticky top-0 font-semibold z-10">
                  <tr>
                    {OMSET_HEADERS.map(h => (
                      <th key={h} className="p-3 border-b border-slate-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedRows.map(row => (
                    <tr key={row.no} className="hover:bg-blue-50/50 transition">
                      {OMSET_KEYS.map(k => {
                        const isNumeric = NUMERIC_COLS.has(k);
                        const isEditing = editingCell?.rowNo === row.no && editingCell?.colKey === k;
                        
                        return (
                          <td key={k} 
                            className={`p-3 relative group ${
                              k === 'nama_ref' ? 'font-semibold text-slate-900' :
                              k === 'pendapatan_toko' ? 'font-mono text-emerald-700 font-medium' :
                              k === 'kas_uks' ? 'font-mono text-blue-700 font-medium' :
                              isNumeric ? 'font-mono text-right' : ''
                            }`}
                            onMouseEnter={() => isNumeric && setHoveredCell({ rowNo: row.no, colKey: k })}
                            onMouseLeave={() => isNumeric && setHoveredCell(null)}
                          >
                            {isEditing ? (
                              <div className="flex items-center justify-end">
                                <input
                                  type="number"
                                  autoFocus
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                  onBlur={saveEdit}
                                  className="w-24 text-xs font-mono text-right px-1 py-0.5 border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            ) : (
                              <div className={`flex items-center gap-2 h-full ${isNumeric ? 'justify-end' : 'justify-start'}`}>
                                {isNumeric && hoveredCell?.rowNo === row.no && hoveredCell?.colKey === k && (
                                  <button 
                                    onClick={() => {
                                      setEditingCell({ rowNo: row.no, colKey: k });
                                      setEditValue(row[k] || 0);
                                    }}
                                    className="p-1 text-slate-400 hover:text-blue-600 transition cursor-pointer absolute left-1"
                                    title="Edit Nilai"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                )}
                                <span>
                                  {isNumeric
                                    ? (row[k] && row[k] !== 0 ? formatRupiah(row[k]) : '-')
                                    : (row[k] || '')}
                                </span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* --- SUMMARY ROWS --- */}
                  <tr className="bg-blue-50/80 font-bold border-t-2 border-slate-300">
                    {OMSET_KEYS.map(k => {
                      if (k === 'no') return <td key={k} className="p-3"></td>;
                      if (k === 'nama_ref') return <td key={k} className="p-3 text-slate-900">TOTAL DEBIT</td>;
                      if (NUMERIC_COLS.has(k)) {
                        const val = COLS_DEBIT.includes(k) ? sumCol(present, k) : 0;
                        return <td key={k} className="p-3 font-mono text-right text-slate-800">{val !== 0 ? formatRupiah(val) : '-'}</td>;
                      }
                      return <td key={k} className="p-3"></td>;
                    })}
                  </tr>
                  <tr className="bg-blue-50/80 font-bold">
                    {OMSET_KEYS.map(k => {
                      if (k === 'no') return <td key={k} className="p-3"></td>;
                      if (k === 'nama_ref') return <td key={k} className="p-3 text-slate-900">TOTAL KREDIT</td>;
                      if (NUMERIC_COLS.has(k)) {
                        const val = COLS_KREDIT.includes(k) ? sumCol(present, k) : 0;
                        return <td key={k} className="p-3 font-mono text-right text-slate-800">{val !== 0 ? formatRupiah(val) : '-'}</td>;
                      }
                      return <td key={k} className="p-3"></td>;
                    })}
                  </tr>

                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>Menampilkan {sortedRows.length} dari {present.length} baris</span>
              <div className="flex items-center gap-1">
                <button disabled className="p-1 border rounded bg-white opacity-40"><ChevronLeft className="w-4 h-4" /></button>
                <span className="px-3 py-1 font-semibold text-slate-800">1</span>
                <button disabled className="p-1 border rounded bg-white opacity-40"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        )}

        {/* Ringkasan Tab */}
        {activeTab === 'DETAIL' && (
          <div className="p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Ringkasan Per Baris OMSET</h3>
            <div className="space-y-2">
              {present.map(row => {
                const debit  = (row.tag_promo||0)+(row.giro_udp||0)+(row.piutang||0)+(row.beban_toko||0)+(row.beban_logo||0)+(row.kas_uks||0)+(row.piutang_padi||0)+(row.piutang_edc||0)+(row.beban_promosi||0);
                const kredit = (row.pendapatan_toko||0)+(row.pendapatan_logo||0)+(row.pendapatan_kerjasama||0)+(row.non_pajak||0)+(row.ppn_pk||0)+(row.ppn_wapu||0)+(row.persediaan_toko||0)+(row.persediaan_logo||0)+(row.simsem_uks||0);
                return (
                  <div key={row.no} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-xs">
                    <span className="w-6 h-6 bg-[#051923] text-white rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">{row.no}</span>
                    <span className="font-semibold text-slate-800 w-40 truncate">{row.nama_ref}</span>
                    {debit > 0 && <span className="text-red-600 font-mono">D: {formatRupiah(debit)}</span>}
                    {kredit > 0 && <span className="text-emerald-600 font-mono">K: {formatRupiah(kredit)}</span>}
                  </div>
                );
              })}
            </div>

            {sourceFiles && (
              <div className="mt-4 p-4 bg-slate-100 rounded-xl text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-700 flex items-center gap-1"><Info className="w-3.5 h-3.5" /> File Sumber</p>
                <p>OMI Per Tanggal: <span className="font-mono">{sourceFiles.omiPerTanggal}</span></p>
                <p>OMI Tutup Harian: <span className="font-mono">{sourceFiles.omiTutupHarian}</span></p>
                <p>SMART: <span className="font-mono">{sourceFiles.smartFiles?.join(', ')}</span></p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPreview;
