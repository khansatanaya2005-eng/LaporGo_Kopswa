import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronUp, CheckCircle2, AlertCircle,
  RotateCcw, Sparkles, Loader2, FileCheck2, AlertTriangle,
  CloudUpload, X, FileText
} from 'lucide-react';
import FileSlotRow from '../components/FileSlotRow';
import { useNavigate } from 'react-router-dom';
import { processLaporan } from '../utils/api';

const UploadReport = () => {
  const navigate = useNavigate();

  const [isOmiExpanded,   setIsOmiExpanded]   = useState(true);
  const [isSmartExpanded, setIsSmartExpanded] = useState(true);
  const [isProcessing,    setIsProcessing]    = useState(false);
  const [processError,    setProcessError]    = useState('');

  // ── Slot OMI ──────────────────────────────────────
  const [omiPerTanggal,  setOmiPerTanggal]  = useState([]);  // WAJIB
  const [omiTutupHarian, setOmiTutupHarian] = useState([]);  // WAJIB
  const [omiPerMember,   setOmiPerMember]   = useState([]);  // opsional
  const [omiDiscItem,    setOmiDiscItem]    = useState([]);  // opsional
  const [omiStrukTxt,    setOmiStrukTxt]    = useState([]);  // opsional
  const [omiPareto,      setOmiPareto]      = useState([]);  // opsional
  const [omiAnalisa,     setOmiAnalisa]     = useState([]);  // opsional
  const [omiPerStruk,    setOmiPerStruk]    = useState([]);  // opsional
  const [omiPersediaan,  setOmiPersediaan]  = useState([]);  // opsional

  // ── Slot SMART ────────────────────────────────────
  const [smartFiles,  setSmartFiles]  = useState([]);  // WAJIB (multi, auto-detect TOKO/LOGO)
  const [smartDetail, setSmartDetail] = useState([]);  // opsional

  // ── Validasi mandatory ────────────────────────────
  const isOmiOk   = omiPerTanggal.length > 0 && omiTutupHarian.length > 0;
  const isSmartOk = smartFiles.length > 0;
  const isAllOk   = isOmiOk && isSmartOk;

  const handleResetAll = () => {
    if (!confirm('Reset semua slot file?')) return;
    setOmiPerTanggal([]); setOmiTutupHarian([]); setOmiPerMember([]);
    setOmiDiscItem([]); setOmiStrukTxt([]); setOmiPareto([]);
    setOmiAnalisa([]); setOmiPerStruk([]); setOmiPersediaan([]);
    setSmartFiles([]); setSmartDetail([]);
    setProcessError('');
  };

  // ── Proses Laporan ────────────────────────────────
  const handleProcessReport = async () => {
    if (!isAllOk) return;
    setIsProcessing(true);
    setProcessError('');

    try {
      const result = await processLaporan({
        omiPerTanggal,
        omiTutupHarian,
        smartFiles,
        omiMember:   omiPerMember,
        detailSmart: smartDetail,
      });

      navigate('/preview', {
        state: {
          reportData: result.data,
          sourceFiles: {
            omiPerTanggal:  omiPerTanggal[0]?.name,
            omiTutupHarian: omiTutupHarian[0]?.name,
            smartFiles:     smartFiles.map(f => f.name),
          }
        }
      });
    } catch (err) {
      setProcessError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>⚙️ Proses Laporan Harian</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Unggah berkas laporan sesuai slot. <span className="text-red-500 font-bold">* Berkas wajib</span>
          </p>
        </div>
        <button onClick={handleResetAll} disabled={isProcessing}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl text-xs font-semibold border border-slate-200 hover:border-red-200 transition cursor-pointer">
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Semua Slot</span>
        </button>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {processError && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-700">Gagal Memproses Laporan</p>
              <p className="text-xs text-red-600 mt-0.5">{processError}</p>
            </div>
            <button onClick={() => setProcessError('')} className="ml-auto cursor-pointer text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LAPORAN OMI ──────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <button onClick={() => setIsOmiExpanded(!isOmiExpanded)}
          className="w-full px-6 py-4 bg-slate-50/70 hover:bg-slate-100/80 border-b border-slate-200/60 flex items-center justify-between transition cursor-pointer">
          <div className="flex items-center gap-3">
            <span className="text-xl">📁</span>
            <div className="text-left">
              <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase">LAPORAN OMI</h3>
              <p className="text-[11px] text-slate-400">Ekstensi: .xls, .xlsx, .txt</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              isOmiOk ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
              {isOmiOk ? '✓ Lengkap' : 'Belum Lengkap'}
            </span>
            {isOmiExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </div>
        </button>

        <AnimatePresence initial={false}>
          {isOmiExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
              className="p-6 space-y-6 border-t border-slate-100">

              {/* Berkas Utama */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <h4 className="text-xs font-extrabold text-[#0A4D68] uppercase tracking-wider">BERKAS UTAMA</h4>
                  <span className="text-[10px] text-slate-400">Diperlukan untuk pemrosesan</span>
                </div>
                <div className="space-y-2.5">
                  <FileSlotRow title="LAPORAN PENJUALAN PER TANGGAL.xls" isMandatory
                    description="Sumber: HPP, PPN, Cash, Kredit, E-Money" accept=".xls,.xlsx"
                    uploadedFiles={omiPerTanggal} onUpload={setOmiPerTanggal} onRemove={() => setOmiPerTanggal([])} />
                  <FileSlotRow title="LAPORAN TUTUP HARIAN.txt" isMandatory
                    description="Sumber: Diskon (Pot.Produk) dan Tunai aktual" accept=".txt" isStruk
                    uploadedFiles={omiTutupHarian} onUpload={setOmiTutupHarian} onRemove={() => setOmiTutupHarian([])} />
                </div>
              </div>

              {/* Berkas Pendukung */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 pt-2">
                  <h4 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">BERKAS PENDUKUNG</h4>
                  <span className="text-[10px] text-slate-400">Opsional (validasi silang)</span>
                </div>
                <div className="space-y-2.5">
                  <FileSlotRow title="LAPORAN PENJUALAN ANGGOTA PER MEMBER.xls"
                    description="Validasi total kredit pegawai" accept=".xls,.xlsx"
                    uploadedFiles={omiPerMember} onUpload={setOmiPerMember} onRemove={() => setOmiPerMember([])} />
                  <FileSlotRow title="LAPORAN DISC. ITEM.xls"
                    description="Rincian diskon per item" accept=".xls,.xlsx"
                    uploadedFiles={omiDiscItem} onUpload={setOmiDiscItem} onRemove={() => setOmiDiscItem([])} />
                  <FileSlotRow title="BERKAS STRUK (.txt)" isMulti isStruk
                    description="Upload lebih dari 1 file struk kasir/anggota sekaligus" accept=".txt"
                    uploadedFiles={omiStrukTxt}
                    onUpload={(f) => setOmiStrukTxt(p => [...p, ...f])}
                    onRemove={(idx) => typeof idx === 'number'
                      ? setOmiStrukTxt(p => p.filter((_, i) => i !== idx))
                      : setOmiStrukTxt([])} />
                  <FileSlotRow title="LAPORAN PARETO.xls" accept=".xls,.xlsx"
                    description="Validasi silang total penjualan barang"
                    uploadedFiles={omiPareto} onUpload={setOmiPareto} onRemove={() => setOmiPareto([])} />
                  <FileSlotRow title="LAPORAN ANALISA PENJUALAN & MARGIN.xls" accept=".xls,.xlsx"
                    description="Deteksi BTKP per item produk"
                    uploadedFiles={omiAnalisa} onUpload={setOmiAnalisa} onRemove={() => setOmiAnalisa([])} />
                  <FileSlotRow title="LAPORAN PENJUALAN PER STRUK.xls" accept=".xls,.xlsx"
                    description="Detail rincian per transaksi struk"
                    uploadedFiles={omiPerStruk} onUpload={setOmiPerStruk} onRemove={() => setOmiPerStruk([])} />
                  <FileSlotRow title="LAPORAN POSISI PERSEDIAAN.xls" accept=".xls,.xlsx"
                    description="Pemeriksaan stok barang harian"
                    uploadedFiles={omiPersediaan} onUpload={setOmiPersediaan} onRemove={() => setOmiPersediaan([])} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── LAPORAN SMART ────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <button onClick={() => setIsSmartExpanded(!isSmartExpanded)}
          className="w-full px-6 py-4 bg-slate-50/70 hover:bg-slate-100/80 border-b border-slate-200/60 flex items-center justify-between transition cursor-pointer">
          <div className="flex items-center gap-3">
            <span className="text-xl">📁</span>
            <div className="text-left">
              <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase">LAPORAN SMART</h3>
              <p className="text-[11px] text-slate-400">Ekstensi: .xlsx — sistem auto-detect TOKO & LOGO</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              isSmartOk ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
              {isSmartOk ? `✓ ${smartFiles.length} file` : 'Belum Lengkap'}
            </span>
            {isSmartExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </div>
        </button>

        <AnimatePresence initial={false}>
          {isSmartExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
              className="p-6 space-y-4 border-t border-slate-100">

              {/* Multi-upload ringkasan */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <h4 className="text-xs font-extrabold text-[#0A4D68] uppercase tracking-wider">RINGKASAN PEMBAYARAN *</h4>
                  <span className="text-[10px] text-slate-400">Upload file TOKO + LOGO sekaligus</span>
                </div>
                <div className="p-4 bg-blue-50/50 border border-blue-200/70 rounded-xl text-xs text-blue-700 mb-3">
                  <span className="font-bold">💡 Cara upload:</span> Pilih semua file ringkasan sekaligus (TOKO + LOGO).
                  Sistem otomatis mendeteksi kategorinya dari isi file.
                </div>

                {/* Drop zone multi-file */}
                <SmartMultiUpload
                  files={smartFiles}
                  onAdd={(newFiles) => setSmartFiles(p => [...p, ...newFiles])}
                  onRemove={(idx) => setSmartFiles(p => p.filter((_, i) => i !== idx))}
                />
              </div>

              {/* Detail Smart (opsional) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">BERKAS DETAIL (Opsional)</h4>
                </div>
                <FileSlotRow title="detail smart.xlsx" accept=".xlsx,.xls"
                  description="Validasi silang detail transaksi per POS"
                  uploadedFiles={smartDetail} onUpload={setSmartDetail} onRemove={() => setSmartDetail([])} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Status + Tombol Proses ────────────────────── */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            isAllOk ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
            {isAllOk ? <FileCheck2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {isAllOk ? 'Semua Berkas Utama Siap Diproses!' : 'Berkas Utama Belum Lengkap'}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              OMI: <span className={isOmiOk ? 'font-bold text-emerald-600' : 'text-amber-600 font-semibold'}>
                {isOmiOk ? 'LENGKAP' : 'BELUM (Per Tanggal + Tutup Harian)'}
              </span>
              {' · '}
              SMART: <span className={isSmartOk ? 'font-bold text-emerald-600' : 'text-amber-600 font-semibold'}>
                {isSmartOk ? `LENGKAP (${smartFiles.length} file)` : 'BELUM'}
              </span>
            </p>
          </div>
        </div>

        <button onClick={handleProcessReport} disabled={!isAllOk || isProcessing}
          className={`w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
            isAllOk && !isProcessing
              ? 'bg-[#FF5000] hover:bg-[#e04600] text-white active:scale-95 cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}>
          {isProcessing
            ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Memproses Laporan...</span></>
            : <><Sparkles className="w-4 h-4" /><span>Proses Laporan</span></>}
        </button>
      </div>
    </div>
  );
};

// ── Komponen SmartMultiUpload ─────────────────────────────────
const SmartMultiUpload = ({ files, onAdd, onRemove }) => {
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.name.match(/\.(xlsx|xls)$/i));
    if (dropped.length) onAdd(dropped);
  };

  const handleSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length) onAdd(selected);
    e.target.value = '';
  };

  return (
    <div className="space-y-2">
      <label
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition ${
          dragging ? 'border-blue-400 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-[#0A4D68]'}`}>
        <CloudUpload className={`w-8 h-8 ${dragging ? 'text-blue-500' : 'text-slate-400'}`} />
        <div className="text-center">
          <p className="text-xs font-semibold text-slate-700">Drag & drop atau klik untuk memilih</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Format: .xlsx, .xls — bisa pilih beberapa file</p>
        </div>
        <input type="file" multiple accept=".xlsx,.xls" className="hidden" onChange={handleSelect} />
      </label>

      {/* Daftar file yang sudah dipilih */}
      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
              <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-emerald-800 truncate flex-1">{f.name}</span>
              <span className="text-slate-400 shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
              <button onClick={() => onRemove(i)} className="text-slate-400 hover:text-red-500 cursor-pointer ml-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadReport;
