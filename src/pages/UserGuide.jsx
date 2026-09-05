import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  ArrowLeft, 
  UserCheck, 
  ShieldCheck, 
  Code2,
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  UploadCloud, 
  Search, 
  Sliders, 
  Users, 
  Download, 
  Printer, 
  FileText,
  Sparkles,
  Server,
  Database,
  Terminal,
  Layers,
  Cpu,
  Workflow,
  Key,
  FolderTree,
  GitBranch,
  Rocket,
  Eye,
  Trash2,
  RotateCcw,
  Undo,
  Redo,
  Save,
  Lock
} from 'lucide-react';

const UserGuide = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('staff'); // 'staff' | 'admin' | 'it'

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-16">
      {/* Header Sederhana (Public Access) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/Logo_Kopswa.png" alt="Koperasi Swadharma" className="h-9 object-contain" />
            <div className="h-5 w-[1px] bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#0A4D68]">LaporGo System</span>
              <span className="text-[10px] font-bold bg-[#0A4D68]/10 text-[#0A4D68] px-2.5 py-0.5 rounded-full">
                Pusat Panduan & Dokumentasi Teknikal v2.0
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#0A4D68] bg-[#0A4D68]/10 hover:bg-[#0A4D68]/20 rounded-xl transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Login</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Banner Hero */}
        <div className="bg-gradient-to-r from-[#051923] via-[#0A4D68] to-[#088395] text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center justify-center pr-10 pointer-events-none">
            <BookOpen className="w-72 h-72 text-white" />
          </div>

          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-teal-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dokumentasi Resmi Penggunaan & Handover IT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Pusat Panduan & Arsitektur LaporGo
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Dokumentasi terpadu panduan operasional Staff, Administrator, serta panduan arsitektur teknis handover untuk Developer / Tim IT Koperasi Swadharma.
            </p>
          </div>
        </div>

        {/* Tab Navigation Roles */}
        <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-xs sm:text-sm border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'staff'
                ? 'border-[#FF5000] text-[#FF5000] bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>1. Panduan Staff Operasional</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-xs sm:text-sm border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'admin'
                ? 'border-[#FF5000] text-[#FF5000] bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>2. Panduan Administrator</span>
          </button>

          <button
            onClick={() => setActiveTab('it')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-xs sm:text-sm border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'it'
                ? 'border-[#0A4D68] text-[#0A4D68] bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4 text-[#0A4D68]" />
            <span>3. Spesifikasi Teknis & Handover Developer</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: PANDUAN STAFF OPERASIONAL */}
        {/* ======================================================== */}
        {activeTab === 'staff' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-10">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#0A4D68]" />
                <span>Daftar Isi - Panduan Staff Operasional</span>
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#0A4D68] font-semibold">
                <li><a href="#staff-1" className="hover:underline">1. Cara Login ke Sistem</a></li>
                <li><a href="#staff-2" className="hover:underline">2. Membaca & Memahami Dashboard</a></li>
                <li><a href="#staff-3" className="hover:underline">3. Prosedur Upload Berkas Laporan</a></li>
                <li><a href="#staff-4" className="hover:underline">4. Memproses Laporan Harian</a></li>
                <li><a href="#staff-5" className="hover:underline">5. Pengeditan Sel, Undo & Redo</a></li>
                <li><a href="#staff-6" className="hover:underline">6. Download Excel & Direct PDF</a></li>
                <li><a href="#staff-7" className="hover:underline">7. Mengakses Riwayat & Tempat Sampah</a></li>
                <li><a href="#staff-8" className="hover:underline">8. Panduan Troubleshooting Staff</a></li>
              </ul>
            </div>

            <section id="staff-1" className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#0A4D68] text-white flex items-center justify-center text-xs font-extrabold">1</span>
                <span>Cara Login ke Sistem LaporGo</span>
              </h2>
              <ol className="list-decimal pl-5 text-xs text-slate-600 space-y-2 leading-relaxed">
                <li>Buka alamat web LaporGo pada browser Anda.</li>
                <li>Formulir login akan diawali secara bersih (kosong tanpa auto-fill demo).</li>
                <li>Masukkan alamat **Email terdaftar** dengan domain resmi Koperasi Swadharma (contoh: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[#0A4D68]">staff@kopswa.id</code> atau <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[#0A4D68]">admin@kopswa.id</code>) dan **Password**.</li>
                <li>Gunakan tombol ikon mata (<Eye className="w-3.5 h-3.5 inline text-slate-500" />) pada kolom password untuk menampilkan/menyembunyikan kata kunci yang diketik.</li>
                <li>Klik tombol **"Masuk ke Dashboard"**. Sistem akan mengarahkan Anda ke Halaman Dashboard Utama.</li>
              </ol>
            </section>

            <section id="staff-2" className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#0A4D68] text-white flex items-center justify-center text-xs font-extrabold">2</span>
                <span>Membaca & Memahami Dashboard</span>
              </h2>
              <p className="text-xs text-slate-600">
                Dashboard memberikan gambaran umum ringkasan performa penjualan dan status laporan:
              </p>
              <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1.5">
                <li>**KPI Card 1 (Laporan Terakhir)**: Menampilkan tanggal transaksi laporan paling baru beserta total nominal gabungan dan indikator keserasian data (*Balance / Unbalance*).</li>
                <li>**KPI Card 2 (Total Laporan Bulan Ini)**: Menampilkan jumlah berkas laporan harian yang telah diproses pada bulan berjalan.</li>
                <li>**KPI Card 3 (Laporan Unbalance)**: Menampilkan jumlah laporan yang terdeteksi selisih dan membutuhkan pemeriksaan ulang.</li>
                <li>**Grafik Omset Harian**: Grafik area visual tren perkembangan total omset harian Toko OMI & SMART 7 hari terakhir.</li>
              </ul>
            </section>

            <section id="staff-3" className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#0A4D68] text-white flex items-center justify-center text-xs font-extrabold">3</span>
                <span>Prosedur Upload Berkas Laporan (`/upload`)</span>
              </h2>
              <p className="text-xs text-slate-600">
                Buka menu **"Buat Laporan"**. Unggah berkas wajib berikut di slot masing-masing:
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-[#0A4D68] text-white">
                    <tr>
                      <th className="p-2.5">Kategori</th>
                      <th className="p-2.5">Nama Berkas Spesifik</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Format</th>
                      <th className="p-2.5">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    <tr className="bg-white">
                      <td className="p-2.5 font-bold text-[#0A4D68]" rowSpan={3}>OMI</td>
                      <td className="p-2.5 font-mono">LAPORAN PER TANGGAL.xls</td>
                      <td className="p-2.5 font-bold text-red-600">* Wajib</td>
                      <td className="p-2.5">.xls / .xlsx</td>
                      <td className="p-2.5">Total Penjualan Toko OMI, PPN, HPP, Cash, Kredit</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-2.5 font-mono font-bold">LAPORAN TUTUP HARIAN.txt</td>
                      <td className="p-2.5 font-bold text-red-600">* Wajib</td>
                      <td className="p-2.5">.txt</td>
                      <td className="p-2.5">Struk teks resmi tutup harian kasir OMI</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-2.5 font-mono">LAPORAN PENJUALAN MEMBER.xls</td>
                      <td className="p-2.5 font-medium text-slate-500">Opsional</td>
                      <td className="p-2.5">.xls / .xlsx</td>
                      <td className="p-2.5">Data rincian piutang anggota pegawai OMI</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-2.5 font-bold text-[#0A4D68]" rowSpan={3}>SMART</td>
                      <td className="p-2.5 font-mono">Ringkasan Pembayaran SMART</td>
                      <td className="p-2.5 font-bold text-red-600">* Wajib</td>
                      <td className="p-2.5">.xlsx / .xls</td>
                      <td className="p-2.5">Auto-detect kategori TOKO (163152) & LOGO (163151)</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-2.5 font-mono">detail smart.xlsx</td>
                      <td className="p-2.5 font-medium text-slate-500">Opsional</td>
                      <td className="p-2.5">.xlsx / .xls</td>
                      <td className="p-2.5">Rincian item produk SMART</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Catatan Penting:</span>
                </p>
                <p>Seluruh berkas bertanda bintang merah **`*` (Wajib)** harus diunggah. Jika berkas wajib belum terisi, tombol *"Proses Laporan"* tidak dapat diklik.</p>
              </div>
            </section>

            <section id="staff-4" className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#0A4D68] text-white flex items-center justify-center text-xs font-extrabold">4</span>
                <span>Memproses Laporan Harian (Engine Active)</span>
              </h2>
              <ol className="list-decimal pl-5 text-xs text-slate-600 space-y-2">
                <li>Setelah seluruh berkas wajib diunggah, tombol **"Proses Laporan"** akan aktif berwarna **Orange (`#FF5000`)**.</li>
                <li>Klik tombol **"Proses Laporan"**. Backend parser Express Engine akan membaca sel-sel Excel & teks secara realtime.</li>
                <li>Sistem akan otomatis menghitung Total Debit, Total Kredit, Selisih, dan menyusun 23 kolom tabel laporan gabungan.</li>
                <li>Setelah selesai, Anda akan otomatis diarahkan ke Halaman **Kelola Laporan** (`/kelola/:id`).</li>
              </ol>
            </section>

            <section id="staff-5" className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#0A4D68] text-white flex items-center justify-center text-xs font-extrabold">5</span>
                <span>Fitur Kelola Laporan: Pengeditan Sel, Undo & Redo (`/kelola/:id`)</span>
              </h2>
              <p className="text-xs text-slate-600">
                Halaman Kelola Laporan memberikan keleluasaan penuh bagi Staff untuk melakukan penyesuaian angka transaksi secara interaktif:
              </p>
              <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1.5">
                <li>**Edit Sel Langsung**: Klik sel mana saja pada tabel 23 kolom untuk mengubah nilai nominal transaksi secara langsung.</li>
                <li>**Tombol Undo (<Undo className="w-3 h-3 inline text-slate-600" />) & Redo (<Redo className="w-3 h-3 inline text-slate-600" />)**: Memungkinkan Anda membatalkan atau mengulangi riwayat perubahan sel tanpa takut salah ketik.</li>
                <li>**Kalkulasi Otomatis Selisih**: Setiap kali sel diubah, angka *Total Debit*, *Total Kredit*, dan indikator *SELISIH* akan terhitung ulang secara real-time.</li>
                <li>**Simpan Perubahan (<Save className="w-3 h-3 inline text-[#0A4D68]" />)**: Klik tombol Simpan Perubahan di bagian atas untuk memperbarui data permanen ke database LaporGo.</li>
              </ul>
            </section>

            <section id="staff-6" className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#0A4D68] text-white flex items-center justify-center text-xs font-extrabold">6</span>
                <span>Download Excel & Direct PDF Export</span>
              </h2>
              <p className="text-xs text-slate-600">
                Di bagian header halaman Kelola Laporan, tersedia 2 tombol ekspor dokumen resmi:
              </p>
              <ul className="list-disc pl-5 text-xs text-slate-600 space-y-2">
                <li>
                  **Tombol Unduh PDF (<FileText className="w-3.5 h-3.5 inline text-red-600" />)**: 
                  Mengunduh langsung file PDF resmi berformat **A4 Landscape** yang dilengkapi banner header Koperasi Swadharma, status *BALANCE / UNBALANCE*, kartu ringkasan total, dan tabel 23 kolom secara presisi tanpa dialog print browser.
                </li>
                <li>
                  **Tombol Download Excel (<Download className="w-3.5 h-3.5 inline text-emerald-600" />)**: 
                  Mengunduh spreadsheet `.xlsx` yang menyertakan rincian 23 kolom serta **Tabel Ringkasan Laporan** (*Grand Total Debit*, *Grand Total Kredit*, *Selisih*) terpisah di bawah tabel utama.
                </li>
              </ul>
            </section>

            <section id="staff-7" className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#0A4D68] text-white flex items-center justify-center text-xs font-extrabold">7</span>
                <span>Mengakses Riwayat Laporan & Tempat Sampah (`/riwayat`)</span>
              </h2>
              <ol className="list-decimal pl-5 text-xs text-slate-600 space-y-1.5">
                <li>Buka menu **"Riwayat Laporan"**.</li>
                <li>Gunakan **Search Bar** untuk mencari laporan berdasarkan tanggal.</li>
                <li>Klik tombol **"Detail"** pada baris laporan untuk membuka halaman Kelola Laporan.</li>
                <li>**Fitur Tempat Sampah (Trash Bin)**: Laporan yang dihapus akan disimpan sementara di Tempat Sampah selama 30 hari. Anda dapat memulihkan laporan (*Pulihkan*) atau menghapusnya secara permanen (*Hapus Permanen*).</li>
              </ol>
            </section>

            <section id="staff-8" className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#0A4D68] text-white flex items-center justify-center text-xs font-extrabold">8</span>
                <span>Panduan Troubleshooting Staff</span>
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-2.5">Kendala / Masalah</th>
                      <th className="p-2.5">Penyebab Umum</th>
                      <th className="p-2.5">Solusi / Langkah Perbaikan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-600">
                    <tr>
                      <td className="p-2.5 font-bold text-slate-800">Tombol "Proses Laporan" tidak aktif</td>
                      <td className="p-2.5">Ada berkas wajib (`*`) yang belum di-upload</td>
                      <td className="p-2.5">Cek kembali slot OMI dan SMART, pastikan semua slot terisi file sesuai ketentuan.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-800">File gagal ter-upload / ditolak</td>
                      <td className="p-2.5">Format file tidak sesuai (misal: PDF atau JPG)</td>
                      <td className="p-2.5">Pastikan file bertipe `.xls`, `.xlsx`, atau `.txt` sesuai ketentuan slot.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-800">Hasil Laporan Unbalance</td>
                      <td className="p-2.5">Ada selisih transaksi antara kasir OMI & SMART</td>
                      <td className="p-2.5">Gunakan fitur Edit Sel pada halaman Kelola Laporan untuk menyesuaikan nilai nominal, lalu klik Simpan Perubahan.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: PANDUAN ADMINISTRATOR */}
        {/* ======================================================== */}
        {activeTab === 'admin' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-10">
            <div className="p-4 bg-[#0A4D68]/10 border border-[#0A4D68]/20 rounded-xl flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#0A4D68] shrink-0" />
              <div className="text-xs text-[#0A4D68]">
                <p className="font-bold">Panduan Khusus Administrator Sistem</p>
                <p>Panduan ini mencakup pengelolaan akun pengguna, perlindungan akun utama super admin, dan manajemen 2-way auto sync Supabase Auth & Database Profiles.</p>
              </div>
            </div>

            <section className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Users className="w-5 h-5 text-[#0A4D68]" />
                <span>1. Manajemen User & Perlindungan Akun Utama (`/users`)</span>
              </h2>
              <p className="text-xs text-slate-600">
                Menu ini dikelola oleh role **Admin** untuk menambah, mengedit, dan mencabut akses login pengguna:
              </p>
              <ul className="list-disc pl-5 text-xs text-slate-600 space-y-2">
                <li>
                  **Kartu Akun Utama (Super Admin)**: Akun utama (<code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[#0A4D68]">mainaccount@admin.kopswa.id</code>) dipisahkan secara khusus pada kartu paling atas. Akun ini dilindungi (*view-only*) dan tidak dapat diubah maupun dihapus oleh siapapun.
                </li>
                <li>
                  **Menambah User Baru**: Klik tombol *"Tambah User"*, masukkan Nama, Email (`@staff.kopswa.id` atau `@admin.kopswa.id`), Password, dan Role.
                </li>
                <li>
                  **Mengubah Role & Password**: Klik tombol Edit pada baris tabel pengguna untuk memperbarui nama, role, atau mereset password. Gunakan tombol mata (<Eye className="w-3.5 h-3.5 inline text-slate-500" />) untuk memastikan pengetikan password.
                </li>
                <li>
                  **Penghapusan User**: Hapus user akan memicu penghapusan otomatis 2-arah pada Supabase Auth dan tabel `profiles`.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Sliders className="w-5 h-5 text-[#0A4D68]" />
                <span>2. Pengaturan Keyword Filter & Mapping (`/pengaturan`)</span>
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fitur ini mengatur kata kunci (*keyword*) yang digunakan oleh backend parser untuk memisahkan dan memetakan baris transaksi laporan ke kategori **Debit** atau **Kredit** secara otomatis.
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold text-slate-800">Cara Menambah Keyword Baru:</h4>
                <ol className="list-decimal pl-5 text-slate-600 space-y-1">
                  <li>Buka menu **Pengaturan**.</li>
                  <li>Ketik Kata Kunci baru pada kolom input (contoh: <code className="bg-white px-1.5 py-0.5 border rounded font-mono">QRIS BNI</code>).</li>
                  <li>Pilih Kategori Finansial yang sesuai (**Debit** atau **Kredit**).</li>
                  <li>Klik **"Tambah Keyword"**, lalu klik **"Simpan Konfigurasi"**.</li>
                </ol>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Trash2 className="w-5 h-5 text-[#0A4D68]" />
                <span>3. Manajemen Tempat Sampah Laporan (Trash Bin Modal)</span>
              </h2>
              <ol className="list-decimal pl-5 text-xs text-slate-600 space-y-2">
                <li>Buka Halaman **Riwayat Laporan**.</li>
                <li>Klik tombol **"Tempat Sampah"** di bagian kanan atas tabel.</li>
                <li>Anda dapat memulihkan laporan yang terhapus secara acak maupun sekaligus via pilihan checkbox batch.</li>
                <li>Laporan di tempat sampah yang tidak dipulihkan akan otomatis terhapus secara permanen dari Supabase DB setelah 30 hari.</li>
              </ol>
            </section>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: PANDUAN IT & HANDOVER DEVELOPER */}
        {/* ======================================================== */}
        {activeTab === 'it' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-10">
            {/* Banner Handover IT */}
            <div className="p-4 bg-[#0A4D68] text-white rounded-xl flex items-center gap-3 shadow-md">
              <Cpu className="w-6 h-6 text-teal-300 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-sm">Dokumentasi Teknis & Handover Developer v2.0</p>
                <p className="text-slate-200 mt-0.5">Spesifikasi arsitektur fullstack, skema database Supabase PostgreSQL, trigger 2-way sync, dan modul ekspor PDF/Excel.</p>
              </div>
            </div>

            {/* Section IT 1: Arsitektur Sistem */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Workflow className="w-5 h-5 text-[#0A4D68]" />
                <span>1. Arsitektur Sistem & Alasan Pemisahan Layer</span>
              </h2>
              <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto space-y-2 border border-slate-800">
                <p className="text-teal-400 font-bold">// DIAGRAM ALUR ARSITEKTUR LAPORGO</p>
                <p>[ Client Browser (React 19 + Vite) ]</p>
                <p>   ├── Auth & Session ──▶ [ Supabase Auth + Trigger 2-Way Sync Profiles ]</p>
                <p>   ├── Process Upload ──▶ [ Node.js Express Server (/api/process-laporan) ]</p>
                <p>   │                           ├── Multer File Storage & Parser (.xls, .xlsx, .txt)</p>
                <p>   │                           └── ExcelJS / XLSX Reconciliation Formula</p>
                <p>   ├── Export Engine   ──▶ [ Direct PDF Generator (jsPDF + autotable A4 Landscape) ]</p>
                <p>   └── Save & History ──▶ [ Supabase PostgreSQL DB & Storage Bucket ]</p>
              </div>

              <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <p><strong>Komponen Utama System:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>**Frontend (React 19 + Vite)**: Dideploy ke Vercel CDN, berfokus penuh pada UI/UX interaktif, routing terlindungi, dan pengeditan sel live.</li>
                  <li>**Express Backend Engine (`server.js` & `api/index.js`)**: Modul parsing file OMI & SMART yang memproses berkas Excel/teks dan menghasilkan struktur 23 kolom omset.</li>
                  <li>**Direct PDF Engine (`src/utils/pdfGenerator.js`)**: Modul pemicu unduh langsung file PDF A4 Landscape dengan banner resmi Swadharma tanpa dialog print browser.</li>
                  <li>**Supabase PostgreSQL**: Otentikasi JWT, trigger sinkronisasi profil user, dan penyimpan riwayat laporan.</li>
                </ul>
              </div>
            </section>

            {/* Section IT 2: Struktur Folder */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <FolderTree className="w-5 h-5 text-[#0A4D68]" />
                <span>2. Struktur Folder & Modul Pengembang</span>
              </h2>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-700 space-y-1.5 overflow-x-auto">
                <p className="font-bold text-[#0A4D68]">LaporGo_Kopswa/</p>
                <p>├── public/                # Asset statis, logo Kopswa, OMI, SMART & favicon.svg</p>
                <p>├── src/</p>
                <p>│   ├── components/        # Komponen UI Reusable (Layout, Topbar, Sidebar, FileSlotRow, UploadZone)</p>

                <p>│   ├── context/           # AuthContext.jsx (State autentikasi Supabase & session user)</p>
                <p>│   ├── lib/               # supabaseClient.js (Helper CRUD database & auth Supabase)</p>
                <p>│   ├── pages/             # Halaman Utama (Login, Dashboard, UploadReport, ManageReport, ReportHistory, UserManagement, Settings, UserGuide)</p>
                <p>│   ├── utils/             # api.js, cn.js & pdfGenerator.js (Fungsi unduh PDF A4 & Excel)</p>
                <p>│   ├── App.jsx            # Routing React Router DOM (Public vs Protected Routes)</p>
                <p>│   └── main.jsx           # Entry point React 19</p>
                <p>├── api/index.js           # Serverless Vercel Backend Handler</p>
                <p>├── server.js              # Express Backend Engine Local Server (Port 5000)</p>
                <p>└── supabase_schema.sql    # DDL Script tabel PostgreSQL, RLS Policies, & Trigger Auto Sync</p>
              </div>
            </section>

            {/* Section IT 3: Skema Database */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Database className="w-5 h-5 text-[#0A4D68]" />
                <span>3. Skema Database PostgreSQL & Trigger Auto Sync</span>
              </h2>
              <p className="text-xs text-slate-600">
                Skema database terdiri dari 3 tabel utama yang dilengkapi trigger otomatis 2-arah:
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-2.5">Nama Tabel</th>
                      <th className="p-2.5">Kolom Utama</th>
                      <th className="p-2.5">Status & Trigger Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-600">
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-[#0A4D68]">public.profiles</td>
                      <td className="p-2.5 font-mono">id, email, full_name, role</td>
                      <td className="p-2.5 font-medium text-emerald-600">✓ Active (Tersinkronisasi 2-arah via Trigger Supabase Auth)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-[#0A4D68]">public.laporan</td>
                      <td className="p-2.5 font-mono">id, tanggal, status_balance, total_debit, total_kredit, selisih, is_deleted, deleted_at</td>
                      <td className="p-2.5 font-medium text-emerald-600">✓ Active (Menyimpan data header laporan & status balance)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-[#0A4D68]">public.laporan_omset_rows</td>
                      <td className="p-2.5 font-mono">id, laporan_id, no, nama_ref, 18 kolom finansial</td>
                      <td className="p-2.5 font-medium text-emerald-600">✓ Active (Menyimpan 23 kolom transaksi omset harian)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section IT 4: Status Pengerjaan (Checklist Handover) */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>4. Status Pengerjaan (100% Fully Completed)</span>
              </h2>

              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2 text-xs">
                <h4 className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>SELESAI 100% (Frontend & Backend Engine Production Ready)</span>
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-emerald-700">
                  <li>✓ Backend Parser Real File OMI & SMART</li>
                  <li>✓ Generator Excel (`exceljs`) + Tabel Ringkasan</li>
                  <li>✓ Autentikasi Supabase & Role Guard</li>
                  <li>✓ Direct PDF Download (jsPDF + autotable A4)</li>
                  <li>✓ Trigger 2-Way Sync Profiles & Auth</li>
                  <li>✓ Pengeditan Sel Interaktif & Undo/Redo</li>
                  <li>✓ Tempat Sampah Laporan (30-Day Trash Bin)</li>
                  <li>✓ Perlindungan Akun Utama Super Admin</li>
                </ul>
              </div>
            </section>

            {/* Section IT 5: Running & Deployment */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Rocket className="w-5 h-5 text-[#0A4D68]" />
                <span>5. Instuksi Jalankan di Lokal & Panduan Deployment</span>
              </h2>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-[#0A4D68]" />
                    <span>A. Cara Run Local Development:</span>
                  </h4>
                  <ol className="list-decimal pl-5 space-y-1 font-mono">
                    <li>Clone repository: <code className="bg-white px-1 py-0.5 border rounded">git clone https://github.com/khansatanaya2005-eng/LaporGo_Kopswa.git</code></li>
                    <li>Install dependencies: <code className="bg-white px-1 py-0.5 border rounded">npm install</code></li>
                    <li>Buat file <code className="bg-white px-1 py-0.5 border rounded">.env</code> dan masukkan Environment Variables:
                      <div className="p-2 bg-slate-900 text-teal-300 rounded mt-1 text-[11px]">
                        VITE_SUPABASE_URL=https://your-supabase-url.supabase.co<br />
                        VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
                      </div>
                    </li>
                    <li>Jalankan Frontend React: <code className="bg-white px-1 py-0.5 border rounded">npm run dev</code> (Buka http://localhost:5173)</li>
                    <li>Jalankan Express Backend Engine: <code className="bg-white px-1 py-0.5 border rounded">node server.js</code> (Port 5000)</li>
                  </ol>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <GitBranch className="w-4 h-4 text-[#0A4D68]" />
                    <span>B. Deployment Vercel & Supabase:</span>
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>**Vercel CI/CD**: Terhubung otomatis ke branch `main`. Setiap `git push origin main` akan mentrigger auto-build.</li>
                    <li>**Environment Variables di Vercel**: Pastikan variabel `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` tersimpan pada pengaturan *Environment Variables* di dashboard Vercel.</li>
                    <li>**Supabase DDL Setup**: Eksekusi seluruh script di <code className="bg-white px-1 py-0.5 border rounded font-mono">supabase_schema.sql</code> melalui SQL Editor Supabase untuk membuat tabel dan trigger profiles.</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserGuide;
