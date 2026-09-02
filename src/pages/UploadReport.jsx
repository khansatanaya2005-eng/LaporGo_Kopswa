import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Sparkles, 
  Loader2, 
  FileCheck2
} from 'lucide-react';
import FileSlotRow from '../components/FileSlotRow';
import { useNavigate } from 'react-router-dom';

const UploadReport = () => {
  const navigate = useNavigate();

  // Accordion Expand / Collapse (Default closed)
  const [isOmiExpanded, setIsOmiExpanded] = useState(false);
  const [isSmartExpanded, setIsSmartExpanded] = useState(false);

  // Loading State
  const [isProcessing, setIsProcessing] = useState(false);

  // --- STATE SLOT FILE OMI ---
  const [omiPerTanggal, setOmiPerTanggal] = useState([]);
  const [omiPerMember, setOmiPerMember] = useState([]);
  const [omiDiscItem, setOmiDiscItem] = useState([]);
  const [omiStrukTxt, setOmiStrukTxt] = useState([]);

  const [omiPareto, setOmiPareto] = useState([]);
  const [omiAnalisa, setOmiAnalisa] = useState([]);
  const [omiPerStruk, setOmiPerStruk] = useState([]);
  const [omiPersediaan, setOmiPersediaan] = useState([]);
  const [omiTutupHarian, setOmiTutupHarian] = useState([]);

  // --- STATE SLOT FILE SMART ---
  const [smartDetail, setSmartDetail] = useState([]);
  const [smartRingkasan, setSmartRingkasan] = useState([]);

  // --- VALIDATION CHECKERS ---
  const isOmiMandatoryComplete = 
    omiPerTanggal.length > 0 &&
    omiPerMember.length > 0 &&
    omiDiscItem.length > 0;

  const isSmartMandatoryComplete = 
    smartDetail.length > 0 &&
    smartRingkasan.length > 0;

  const isAllMandatoryComplete = isOmiMandatoryComplete && isSmartMandatoryComplete;

  // --- RESET ALL ---
  const handleResetAll = () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua file di semua slot?')) {
      setOmiPerTanggal([]);
      setOmiPerMember([]);
      setOmiDiscItem([]);
      setOmiStrukTxt([]);
      setOmiPareto([]);
      setOmiAnalisa([]);
      setOmiPerStruk([]);
      setOmiPersediaan([]);
      setOmiTutupHarian([]);
      setSmartDetail([]);
      setSmartRingkasan([]);
    }
  };

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
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>📤 Upload Laporan Harian</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Unggah berkas laporan sesuai slot baris yang telah ditentukan untuk Toko OMI dan SMART. <span className="text-red-500 font-bold">* Tanda bintang menandakan berkas wajib</span>
          </p>
        </div>

        <button
          onClick={handleResetAll}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl text-xs font-semibold border border-slate-200 hover:border-red-200 transition active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Semua Slot</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* KATEGORI 1: LAPORAN OMI */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all">
        <button
          onClick={() => setIsOmiExpanded(!isOmiExpanded)}
          className="w-full px-6 py-4 bg-slate-50/70 hover:bg-slate-100/80 border-b border-slate-200/60 flex items-center justify-between transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📁</span>
            <div className="text-left">
              <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase">
                LAPORAN OMI
              </h3>
              <p className="text-[11px] text-slate-400">
                Ekstensi: .xls, .xlsx, .txt
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              isOmiMandatoryComplete 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {isOmiMandatoryComplete ? '✓ Lengkap' : 'Belum Lengkap'}
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
              className="p-6 space-y-6 border-t border-slate-100"
            >
              {/* BERKAS UTAMA OMI */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <h4 className="text-xs font-extrabold text-[#0A4D68] uppercase tracking-wider">
                    BERKAS UTAMA
                  </h4>
                  <span className="text-[10px] text-slate-400">Diperlukan untuk pemrosesan</span>
                </div>

                <div className="space-y-2.5">
                  <FileSlotRow
                    title="LAPORAN PER TANGGAL.xls"
                    description="Total Penjualan, PPN, HPP, Cash, Kredit, dan E-Money"
                    accept=".xls,.xlsx"
                    isMandatory={true}
                    uploadedFiles={omiPerTanggal}
                    onUpload={(files) => setOmiPerTanggal(files)}
                    onRemove={() => setOmiPerTanggal([])}
                  />

                  <FileSlotRow
                    title="LAPORAN PENJUALAN ANGGOTA PER MEMBER.xls"
                    description="Total kredit pegawai / anggota koperasi"
                    accept=".xls,.xlsx"
                    isMandatory={true}
                    uploadedFiles={omiPerMember}
                    onUpload={(files) => setOmiPerMember(files)}
                    onRemove={() => setOmiPerMember([])}
                  />

                  <FileSlotRow
                    title="LAPORAN DISC. ITEM.xls"
                    description="Total diskon / promo barang harian"
                    accept=".xls,.xlsx"
                    isMandatory={true}
                    uploadedFiles={omiDiscItem}
                    onUpload={(files) => setOmiDiscItem(files)}
                    onRemove={() => setOmiDiscItem([])}
                  />
                </div>
              </div>

              {/* BERKAS PENDUKUNG OMI */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 pt-2">
                  <h4 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                    BERKAS PENDUKUNG
                  </h4>
                  <span className="text-[10px] text-slate-400">Tambahan opsional</span>
                </div>

                <div className="space-y-2.5">
                  <FileSlotRow
                    title="BERKAS STRUK TXT (*.txt)"
                    description="Bisa upload lebih dari 1 file struk (.txt) sekaligus jika diperlukan"
                    accept=".txt"
                    isMandatory={false}
                    isMulti={true}
                    isStruk={true}
                    uploadedFiles={omiStrukTxt}
                    onUpload={(files) => setOmiStrukTxt(prev => [...prev, ...files])}
                    onRemove={(singleIdx) => {
                      if (typeof singleIdx === 'number') {
                        setOmiStrukTxt(prev => prev.filter((_, idx) => idx !== singleIdx));
                      } else {
                        setOmiStrukTxt([]);
                      }
                    }}
                  />

                  <FileSlotRow
                    title="LAPORAN PARETO.xls"
                    description="Validasi silang total penjualan barang"
                    accept=".xls,.xlsx"
                    isMandatory={false}
                    uploadedFiles={omiPareto}
                    onUpload={(files) => setOmiPareto(files)}
                    onRemove={() => setOmiPareto([])}
                  />

                  <FileSlotRow
                    title="LAPORAN ANALISA PENJUALAN & MARGIN.xls"
                    description="Deteksi BTKP per item produk"
                    accept=".xls,.xlsx"
                    isMandatory={false}
                    uploadedFiles={omiAnalisa}
                    onUpload={(files) => setOmiAnalisa(files)}
                    onRemove={() => setOmiAnalisa([])}
                  />

                  <FileSlotRow
                    title="LAPORAN PENJUALAN PER STRUK.xls"
                    description="Detail rincian per transaksi struk"
                    accept=".xls,.xlsx"
                    isMandatory={false}
                    uploadedFiles={omiPerStruk}
                    onUpload={(files) => setOmiPerStruk(files)}
                    onRemove={() => setOmiPerStruk([])}
                  />

                  <FileSlotRow
                    title="LAPORAN POSISI PERSEDIAAN.xls"
                    description="Pemeriksaan stok barang harian"
                    accept=".xls,.xlsx"
                    isMandatory={false}
                    uploadedFiles={omiPersediaan}
                    onUpload={(files) => setOmiPersediaan(files)}
                    onRemove={() => setOmiPersediaan([])}
                  />

                  <FileSlotRow
                    title="LAPORAN TUTUP HARIAN.txt"
                    description="Validasi data kasir akhir hari"
                    accept=".txt"
                    isMandatory={false}
                    isStruk={true}
                    uploadedFiles={omiTutupHarian}
                    onUpload={(files) => setOmiTutupHarian(files)}
                    onRemove={() => setOmiTutupHarian([])}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ======================================================== */}
      {/* KATEGORI 2: LAPORAN SMART */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all">
        <button
          onClick={() => setIsSmartExpanded(!isSmartExpanded)}
          className="w-full px-6 py-4 bg-slate-50/70 hover:bg-slate-100/80 border-b border-slate-200/60 flex items-center justify-between transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📁</span>
            <div className="text-left">
              <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase">
                LAPORAN SMART
              </h3>
              <p className="text-[11px] text-slate-400">
                Ekstensi: .xlsx, .xls
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              isSmartMandatoryComplete 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {isSmartMandatoryComplete ? '✓ Lengkap' : 'Belum Lengkap'}
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
              className="p-6 space-y-3 border-t border-slate-100"
            >
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <h4 className="text-xs font-extrabold text-[#0A4D68] uppercase tracking-wider">
                  BERKAS UTAMA
                </h4>
                <span className="text-[10px] text-slate-400">Diperlukan untuk pemrosesan</span>
              </div>

              <div className="space-y-2.5">
                <FileSlotRow
                  title="detail smart.xlsx"
                  description="Data POS 163151 (LOGO) & POS 163152 (TOKO)"
                  accept=".xlsx,.xls"
                  isMandatory={true}
                  uploadedFiles={smartDetail}
                  onUpload={(files) => setSmartDetail(files)}
                  onRemove={() => setSmartDetail([])}
                />

                <FileSlotRow
                  title="ringkasan pembayaran logo.xlsx"
                  description="Ringkasan pembayaran kategori TOKO & LOGO"
                  accept=".xlsx,.xls"
                  isMandatory={true}
                  uploadedFiles={smartRingkasan}
                  onUpload={(files) => setSmartRingkasan(files)}
                  onRemove={() => setSmartRingkasan([])}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ======================================================== */}
      {/* SUMMARY STATUS & ACTION BUTTON */}
      {/* ======================================================== */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            isAllMandatoryComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
          }`}>
            {isAllMandatoryComplete ? <FileCheck2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {isAllMandatoryComplete ? 'Semua Berkas Utama Siap Diproses!' : 'Berkas Utama Belum Lengkap'}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Status OMI: <span className={isOmiMandatoryComplete ? 'font-bold text-emerald-600' : 'text-amber-600 font-semibold'}>{isOmiMandatoryComplete ? 'LENGKAP' : 'BELUM LENGKAP'}</span> &bull; Status SMART: <span className={isSmartMandatoryComplete ? 'font-bold text-emerald-600' : 'text-amber-600 font-semibold'}>{isSmartMandatoryComplete ? 'LENGKAP' : 'BELUM LENGKAP'}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleProcessReport}
          disabled={!isAllMandatoryComplete || isProcessing}
          className={`w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
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
  );
};

export default UploadReport;
