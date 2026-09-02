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
  FileCheck2,
  Save,
  Download,
  Check,
  Search,
  ArrowUpDown,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import FileSlotRow from '../components/FileSlotRow';
import { useNavigate } from 'react-router-dom';
import { MOCK_OMSET_DATA } from '../data/mockData';
import { formatRupiah } from '../utils/cn';

const UploadReport = () => {
  const navigate = useNavigate();

  // Accordion Expand / Collapse (Default closed)
  const [isOmiExpanded, setIsOmiExpanded] = useState(false);
  const [isSmartExpanded, setIsSmartExpanded] = useState(false);

  // Processing & State
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Result state
  const [reportResult, setReportResult] = useState(null);

  // Table filtering & sorting state inside same page
  const [activeTab, setActiveTab] = useState('OMSET');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

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
      setHasProcessed(false);
      setReportResult(null);
      setIsSaved(false);
    }
  };

  // Process Report Action (Simulasi backend merge)
  const handleProcessReport = () => {
    if (!isAllMandatoryComplete) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setHasProcessed(true);
      setReportResult({
        summary: {
          totalDebit: 43490000,
          totalKredit: 43490000,
          selisih: 0,
          jumlahTransaksi: 142,
          statusBalance: 'Balance'
        },
        omsetRows: MOCK_OMSET_DATA
      });
      // Scroll to result table
      setTimeout(() => {
        document.getElementById('hasil-gabungan-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 1800);
  };

  // Save Report Action
  const handleSaveReport = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
    }, 1200);
  };

  // Download Excel Action
  const handleDownloadExcel = () => {
    alert("Simulasi Download Excel: Berkas Laporan Gabungan OMSET .xlsx berhasil diunduh.");
  };

  // Filtering & Sorting OMSET Data
  const filteredRows = (reportResult?.omsetRows || []).filter((row) => {
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

  const tabs = [
    { id: 'OMSET', label: 'Sheet OMSET' },
    { id: 'DETAIL_SMART', label: 'Detail SMART' },
    { id: 'RINGKASAN_TOKO', label: 'Ringkasan Toko' },
    { id: 'RINGKASAN_LOGO', label: 'Ringkasan Logo' },
    { id: 'OMI_PERTANGGAL', label: 'OMI Pertanggal' },
    { id: 'OMI_MEMBER', label: 'OMI Member' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>⚙️ Proses Laporan Harian</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Unggah berkas laporan sesuai slot baris yang telah ditentukan untuk Toko OMI dan SMART. <span className="text-red-500 font-bold">* Tanda bintang menandakan berkas wajib</span>
          </p>
        </div>

        <button
          onClick={handleResetAll}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl text-xs font-semibold border border-slate-200 hover:border-red-200 transition active:scale-95 cursor-pointer"
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
          className="w-full px-6 py-4 bg-slate-50/70 hover:bg-slate-100/80 border-b border-slate-200/60 flex items-center justify-between transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📁</span>
            <div className="text-left">
              <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase">
                LAPORAN OMI
              </h3>
              <p className="text-[11px] text-slate-400">
                Ekstensi: .xls, .xlsx, .txt (Multi-file)
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
          className="w-full px-6 py-4 bg-slate-50/70 hover:bg-slate-100/80 border-b border-slate-200/60 flex items-center justify-between transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📁</span>
            <div className="text-left">
              <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase">
                LAPORAN SMART
              </h3>
              <p className="text-[11px] text-slate-400">
                Ekstensi: .xlsx, .xls (Multi-file)
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
      {/* SUMMARY STATUS & PROCESS BUTTON */}
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

      {/* ======================================================== */}
      {/* HASIL GABUNGAN (OMSET) IN SAME PAGE */}
      {/* ======================================================== */}
      {hasProcessed && reportResult && (
        <div id="hasil-gabungan-section" className="space-y-6 pt-6 border-t-2 border-slate-200">
          <div className="bg-gradient-to-r from-[#051923] via-[#0A4D68] to-[#088395] p-6 rounded-2xl text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-teal-200 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Penggabungan Berkas Berhasil!</span>
              </div>
              <h2 className="text-xl font-extrabold">Hasil Penggabungan Laporan (OMSET)</h2>
              <p className="text-xs text-slate-200 mt-1">Data gabungan otomatis dari file OMI & SMART yang diunggah.</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={handleDownloadExcel}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Excel</span>
              </button>

              <button
                onClick={handleSaveReport}
                disabled={isSaving || isSaved}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition cursor-pointer ${
                  isSaved 
                    ? 'bg-emerald-500 text-white cursor-default' 
                    : 'bg-[#FF5000] hover:bg-[#e04600] text-white active:scale-95'
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : isSaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tersimpan di Database</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan Laporan</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Table Controls (Search & Tabs) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 px-3 pt-2 gap-1 scrollbar-none">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition shrink-0 cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white text-[#0A4D68] border-t-2 border-[#0A4D68] shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'OMSET' ? (
              <div>
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

                {/* 23 Columns Table */}
                <div className="overflow-x-auto max-h-[450px]">
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
                        <tr key={row.no} className="hover:bg-slate-50 transition">
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
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500">
                <Layers className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-700">Halaman Sheet: {tabs.find(t => t.id === activeTab)?.label}</p>
                <p className="text-xs mt-1 max-w-sm mx-auto">Data sheet detail ini secara otomatis diisi oleh backend service.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadReport;
