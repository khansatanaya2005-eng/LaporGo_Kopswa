import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Play, 
  Loader2, 
  FolderCheck,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import UploadZone from '../components/UploadZone';
import { useNavigate } from 'react-router-dom';

const UploadReport = () => {
  const navigate = useNavigate();

  // Accordion Expand/Collapse States
  const [isOmiExpanded, setIsOmiExpanded] = useState(true);
  const [isSmartExpanded, setIsSmartExpanded] = useState(true);

  // File list States
  const [omiFiles, setOmiFiles] = useState([]);
  const [smartFiles, setSmartFiles] = useState([]);

  // Process Loading State
  const [isProcessing, setIsProcessing] = useState(false);

  // --- OMI File Classification Logic ---
  const classifyOmiFile = (file) => {
    const filenameUpper = file.name.toUpperCase();
    const isTxt = filenameUpper.endsWith('.TXT');

    let isMandatory = false;
    if (
      filenameUpper.includes('LAPORAN PER TANGGAL') ||
      filenameUpper.includes('LAPORAN PENJUALAN ANGGOTA PER MEMBER') ||
      filenameUpper.includes('LAPORAN DISC. ITEM') ||
      isTxt
    ) {
      isMandatory = true;
    }

    return {
      id: `omi-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: file.name,
      size: file.size,
      rawFile: file,
      isMandatory,
      isTxt
    };
  };

  // --- SMART File Classification Logic ---
  const classifySmartFile = (file) => {
    const filenameLower = file.name.toLowerCase();
    let isMandatory = false;

    if (
      filenameLower.includes('detail smart') ||
      filenameLower.includes('ringkasan pembayaran logo')
    ) {
      isMandatory = true;
    }

    return {
      id: `smart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: file.name,
      size: file.size,
      rawFile: file,
      isMandatory,
      isTxt: false
    };
  };

  // Handlers for adding files
  const handleAddOmiFiles = (newFiles) => {
    const classified = newFiles.map(classifyOmiFile);
    setOmiFiles(prev => [...prev, ...classified]);
  };

  const handleAddSmartFiles = (newFiles) => {
    const classified = newFiles.map(classifySmartFile);
    setSmartFiles(prev => [...prev, ...classified]);
  };

  // Handlers for removing files
  const handleRemoveOmiFile = (id) => {
    setOmiFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleRemoveSmartFile = (id) => {
    setSmartFiles(prev => prev.filter(f => f.id !== id));
  };

  // Reset all files
  const handleResetAll = () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua file yang di-upload?')) {
      setOmiFiles([]);
      setSmartFiles([]);
    }
  };

  // --- VALIDATION LOGIC ---
  const checkOmiMandatoryStatus = () => {
    const hasPerTanggal = omiFiles.some(f => f.name.toUpperCase().includes('LAPORAN PER TANGGAL'));
    const hasPerMember = omiFiles.some(f => f.name.toUpperCase().includes('LAPORAN PENJUALAN ANGGOTA PER MEMBER'));
    const hasDiscItem = omiFiles.some(f => f.name.toUpperCase().includes('LAPORAN DISC. ITEM'));
    const hasStrukTxt = omiFiles.some(f => f.isTxt);

    const isComplete = hasPerTanggal && hasPerMember && hasDiscItem && hasStrukTxt;
    return {
      isComplete,
      hasPerTanggal,
      hasPerMember,
      hasDiscItem,
      hasStrukTxt
    };
  };

  const checkSmartMandatoryStatus = () => {
    const hasDetailSmart = smartFiles.some(f => f.name.toLowerCase().includes('detail smart'));
    const hasRingkasanPembayaran = smartFiles.some(f => f.name.toLowerCase().includes('ringkasan pembayaran logo'));

    const isComplete = hasDetailSmart && hasRingkasanPembayaran;
    return {
      isComplete,
      hasDetailSmart,
      hasRingkasanPembayaran
    };
  };

  const omiStatus = checkOmiMandatoryStatus();
  const smartStatus = checkSmartMandatoryStatus();
  const isAllMandatoryComplete = omiStatus.isComplete && smartStatus.isComplete;

  // Process Report Simulation
  const handleProcessReport = () => {
    if (!isAllMandatoryComplete) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/preview?id=new-laporan-01');
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>📤 Buat Laporan Harian</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Unggah seluruh berkas laporan toko OMI dan SMART untuk diproses dan digabungkan otomatis.
          </p>
        </div>

        {/* Global Reset Button */}
        {(omiFiles.length > 0 || smartFiles.length > 0) && (
          <button
            onClick={handleResetAll}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl text-xs font-semibold border border-slate-200 hover:border-red-200 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Semua File</span>
          </button>
        )}
      </div>

      {/* Accordion 1: LAPORAN OMI */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all">
        <button
          onClick={() => setIsOmiExpanded(!isOmiExpanded)}
          className="w-full px-6 py-4 bg-slate-50/70 hover:bg-slate-100/80 border-b border-slate-200/60 flex items-center justify-between transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">📁</span>
            <div className="text-left">
              <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase">
                LAPORAN OMI
              </h3>
              <p className="text-[11px] text-slate-400">
                Ekstensi: .xls, .xlsx, .txt &bull; <span className="text-red-500 font-semibold">Wajib Dipenuhi</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              omiStatus.isComplete 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {omiStatus.isComplete ? '✓ Wajib Lengkap' : 'Belum Lengkap'}
            </span>

            {isOmiExpanded ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </button>

        <AnimatePresence initial={false}>
          {isOmiExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="p-6 border-t border-slate-100"
            >
              {/* Mandatory Checklist Indicators */}
              <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className={`flex items-center gap-1.5 font-medium ${omiStatus.hasPerTanggal ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  {omiStatus.hasPerTanggal ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />}
                  <span className="truncate">LAPORAN PER TANGGAL</span>
                </div>
                <div className={`flex items-center gap-1.5 font-medium ${omiStatus.hasPerMember ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  {omiStatus.hasPerMember ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />}
                  <span className="truncate">PENJUALAN PER MEMBER</span>
                </div>
                <div className={`flex items-center gap-1.5 font-medium ${omiStatus.hasDiscItem ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  {omiStatus.hasDiscItem ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />}
                  <span className="truncate">LAPORAN DISC. ITEM</span>
                </div>
                <div className={`flex items-center gap-1.5 font-medium ${omiStatus.hasStrukTxt ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  {omiStatus.hasStrukTxt ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />}
                  <span className="truncate">File Struk (*.txt)</span>
                </div>
              </div>

              <UploadZone
                categoryTitle="OMI"
                accept=".xls,.xlsx,.txt"
                onFilesAdded={handleAddOmiFiles}
                files={omiFiles}
                onRemoveFile={handleRemoveOmiFile}
                isOmi={true}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Accordion 2: LAPORAN SMART */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all">
        <button
          onClick={() => setIsSmartExpanded(!isSmartExpanded)}
          className="w-full px-6 py-4 bg-slate-50/70 hover:bg-slate-100/80 border-b border-slate-200/60 flex items-center justify-between transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">📁</span>
            <div className="text-left">
              <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase">
                LAPORAN SMART
              </h3>
              <p className="text-[11px] text-slate-400">
                Ekstensi: .xlsx, .xls &bull; <span className="text-red-500 font-semibold">Wajib Dipenuhi</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              smartStatus.isComplete 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {smartStatus.isComplete ? '✓ Wajib Lengkap' : 'Belum Lengkap'}
            </span>

            {isSmartExpanded ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </button>

        <AnimatePresence initial={false}>
          {isSmartExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="p-6 border-t border-slate-100"
            >
              {/* Mandatory Checklist Indicators */}
              <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className={`flex items-center gap-1.5 font-medium ${smartStatus.hasDetailSmart ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  {smartStatus.hasDetailSmart ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />}
                  <span className="truncate">detail smart.xlsx</span>
                </div>
                <div className={`flex items-center gap-1.5 font-medium ${smartStatus.hasRingkasanPembayaran ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  {smartStatus.hasRingkasanPembayaran ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />}
                  <span className="truncate">ringkasan pembayaran logo.xlsx</span>
                </div>
              </div>

              <UploadZone
                categoryTitle="SMART"
                accept=".xlsx,.xls"
                onFilesAdded={handleAddSmartFiles}
                files={smartFiles}
                onRemoveFile={handleRemoveSmartFile}
                isOmi={false}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Summary Completeness Bar & Action Button */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Text & Indicators */}
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            isAllMandatoryComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
          }`}>
            {isAllMandatoryComplete ? <FileCheck2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {isAllMandatoryComplete ? 'Semua Berkas Wajib Siap!' : 'File Wajib Belum Lengkap'}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              OMI: <span className={omiStatus.isComplete ? 'font-bold text-emerald-600' : 'text-amber-600 font-semibold'}>{omiFiles.length} file terupload</span> &bull; SMART: <span className={smartStatus.isComplete ? 'font-bold text-emerald-600' : 'text-amber-600 font-semibold'}>{smartFiles.length} file terupload</span>
            </p>
          </div>
        </div>

        {/* Process Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {(omiFiles.length > 0 || smartFiles.length > 0) && (
            <button
              onClick={handleResetAll}
              disabled={isProcessing}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
            >
              Reset All
            </button>
          )}

          <button
            onClick={handleProcessReport}
            disabled={!isAllMandatoryComplete || isProcessing}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
              isAllMandatoryComplete && !isProcessing
                ? 'bg-[#FF5000] hover:bg-[#e04600] text-white active:scale-95 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses Laporan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Proses Laporan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadReport;
