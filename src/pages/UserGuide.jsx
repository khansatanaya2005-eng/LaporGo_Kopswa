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
  Rocket
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
              <span className="text-[10px] font-bold bg-[#0A4D68]/10 text-[#0A4D68] px-2 py-0.5 rounded-full">
                Pusat Panduan & Dokumentasi Teknikal
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
                <li><a href="#staff-5" className="hover:underline">5. Membaca & Menindaklanjuti Preview</a></li>
                <li><a href="#staff-6" className="hover:underline">6. Download Excel & Cetak PDF</a></li>
                <li><a href="#staff-7" className="hover:underline">7. Mengakses Riwayat Laporan</a></li>
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
                <li>Masukkan alamat **Email terdaftar** (contoh: <code className="bg-slate-100 px-1 py-0.5 rounded text-[#0A4D68]">staff@kopswa.id</code>) dan **Password** Anda.</li>
                <li>Klik tombol **"Masuk ke Dashboard"**.</li>
                <li>Setelah berhasil, sistem akan mengarahkan Anda ke Halaman Dashboard Utama.</li>
              </ol>
              <div className="p-3 bg-slate-100 rounded-xl text-center text-xs font-mono text-slate-500 border border-dashed border-slate-300">
                [SCREENSHOT: Form Login LaporGo System]
              </div>
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
              <div className="p-3 bg-slate-100 rounded-xl text-center text-xs font-mono text-slate-500 border border-dashed border-slate-300">
                [SCREENSHOT: Tampilan Dashboard dengan KPI Cards & Grafik]
              </div>
            </section>

            <section id="staff-3" className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#0A4D68] text-white flex items-center justify-center text-xs font-extrabold">3</span>
                <span>Prosedur Upload Berkas Laporan (`/upload`)</span>
              </h2>
              <p className="text-xs text-slate-600">
                Buka menu **"Buat Laporan"**. Halaman ini memiliki 2 folder kategori: **LAPORAN OMI** dan **LAPORAN SMART**.
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
                      <td className="p-2.5 font-bold text-[#0A4D68]" rowSpan={4}>OMI</td>
                      <td className="p-2.5 font-mono">LAPORAN PER TANGGAL.xls</td>
                      <td className="p-2.5 font-bold text-red-600">* Wajib</td>
                      <td className="p-2.5">.xls / .xlsx</td>
                      <td className="p-2.5">Total Penjualan, PPN, HPP, Cash, Kredit</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-2.5 font-mono">LAPORAN PENJUALAN ANGGOTA PER MEMBER.xls</td>
                      <td className="p-2.5 font-bold text-red-600">* Wajib</td>
                      <td className="p-2.5">.xls / .xlsx</td>
                      <td className="p-2.5">Total transaksi kredit pegawai</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-2.5 font-mono">LAPORAN DISC. ITEM.xls</td>
                      <td className="p-2.5 font-bold text-red-600">* Wajib</td>
                      <td className="p-2.5">.xls / .xlsx</td>
                      <td className="p-2.5">Total promo / diskon harian</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-2.5 font-mono">BERKAS STRUK TXT (*.txt)</td>
                      <td className="p-2.5 font-medium text-slate-500">Opsional</td>
                      <td className="p-2.5">.txt</td>
                      <td className="p-2.5">Multi-upload file struk (.txt)</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-2.5 font-bold text-[#0A4D68]" rowSpan={2}>SMART</td>
                      <td className="p-2.5 font-mono">detail smart.xlsx</td>
                      <td className="p-2.5 font-bold text-red-600">* Wajib</td>
                      <td className="p-2.5">.xlsx / .xls</td>
                      <td className="p-2.5">Data POS 163151 (LOGO) & 163152 (TOKO)</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-2.5 font-mono">ringkasan pembayaran logo.xlsx</td>
                      <td className="p-2.5 font-bold text-red-600">* Wajib</td>
                      <td className="p-2.5">.xlsx / .xls</td>
                      <td className="p-2.5">Ringkasan pembayaran TOKO & LOGO</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>⚠️ Catatan Penting:</span>
                </p>
                <p>Seluruh berkas bertanda bintang merah **`*` (Wajib)** harus diunggah di slot masing-masing. Jika ada berkas wajib yang belum diunggah, tombol *"Proses Laporan"* akan tetap non-aktif.</p>
              </div>

              <div className="p-3 bg-slate-100 rounded-xl text-center text-xs font-mono text-slate-500 border border-dashed border-slate-300">
                [SCREENSHOT: Slot Baris Upload File OMI & SMART]
              </div>
            </section>

            <section id="staff-4" className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#0A4D68] text-white flex items-center justify-center text-xs font-extrabold">4</span>
                <span>Memproses Laporan Harian</span>
              </h2>
              <ol className="list-decimal pl-5 text-xs text-slate-600 space-y-2">
                <li>Setelah seluruh berkas wajib diunggah, tombol **"Proses Laporan"** di bagian bawah akan berubah menjadi warna **Orange (`#FF5000`)**.</li>
                <li>Klik tombol **"Proses Laporan"**.</li>
                <li>Sistem akan menampilkan animasi *loading spinner* dan memproses penggabungan data secara otomatis. <span className="font-semibold text-amber-700">[SEMENTARA - MENUNGGU BACKEND LOGIC]</span></li>
                <li>Setelah selesai, Anda akan otomatis diarahkan ke Halaman **Preview Laporan**.</li>
              </ol>
            </section>

            <section id="staff-5" className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#0A4D68] text-white flex items-center justify-center text-xs font-extrabold">5</span>
                <span>Membaca & Menindaklanjuti Preview Laporan</span>
              </h2>
              <p className="text-xs text-slate-600">
                Halaman Preview Laporan memiliki 3 Tab Navigasi utama:
              </p>
              <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1.5">
                <li>**Tab Laporan Gabungan**: Menampilkan total penerimaan Debit, Kredit, dan status keserasian (*Balance / Unbalance*).</li>
                <li>**Tab Detail Toko OMI**: Menampilkan rincian kalkulasi khusus Toko OMI.</li>
                <li>**Tab Detail Toko SMART**: Menampilkan rincian kalkulasi khusus Toko SMART.</li>
              </ul>

              <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Langkah Tindakan Jika Status: UNBALANCE</span>
                </h4>
                <ol className="list-decimal pl-5 text-xs text-red-700 space-y-1">
                  <li>Buka **Tab Detail Toko OMI** dan **Tab Detail Toko SMART** untuk melihat kolom nominal yang mengalami selisih.</li>
                  <li>Periksa kembali berkas fisik atau file `.xls` yang diunggah, pastikan tidak ada file yang salah tanggal.</li>
                  <li>Jika terdapat transaksi non-tunai baru (seperti QRIS / Bank baru) yang belum terpotong otomatis, **laporkan ke Administrator** untuk penambahan keyword mapping.</li>
                </ol>
              </div>

              <div className="p-3 bg-slate-100 rounded-xl text-center text-xs font-mono text-slate-500 border border-dashed border-slate-300">
                [SCREENSHOT: Halaman Preview Laporan & Badge Status Balance/Unbalance]
              </div>
            </section>

            <section id="staff-6" className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#0A4D68] text-white flex items-center justify-center text-xs font-extrabold">6</span>
                <span>Download Excel & Cetak PDF</span>
              </h2>
              <p className="text-xs text-slate-600">
                Di pojok kanan atas halaman Preview, terdapat 2 tombol aksi:
              </p>
              <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
                <li>**Tombol Export Excel**: Mengunduh seluruh data gabungan dan detail ke dalam file spreadsheet `.xlsx`.</li>
                <li>**Tombol Cetak PDF**: Membuka dialog cetak browser untuk mencetak langsung dokumen laporan rekonsiliasi.</li>
              </ul>
            </section>

            <section id="staff-7" className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#0A4D68] text-white flex items-center justify-center text-xs font-extrabold">7</span>
                <span>Mengakses Riwayat Laporan (`/riwayat`)</span>
              </h2>
              <ol className="list-decimal pl-5 text-xs text-slate-600 space-y-1.5">
                <li>Buka menu **"Riwayat Laporan"**.</li>
                <li>Gunakan **Search Bar** untuk mencari berdasarkan tanggal laporan.</li>
                <li>Gunakan filter status (*Balance / Unbalance*) untuk menyaring laporan.</li>
                <li>Klik tombol **"Preview"** di baris laporan untuk membuka kembali pratinjau laporan terdahulu.</li>
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
                      <td className="p-2.5">Cek kembali slot OMI dan SMART, pastikan semua slot berbintang merah terisi file.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-800">File gagal ter-upload / ditolak</td>
                      <td className="p-2.5">Format file tidak sesuai (misal: PDF atau JPG)</td>
                      <td className="p-2.5">Pastikan file bertipe `.xls`, `.xlsx`, atau `.txt` sesuai ketentuan slot.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-800">Hasil Laporan Unbalance terus menerus</td>
                      <td className="p-2.5">Ada kata kunci transaksi baru yang belum terpetakan</td>
                      <td className="p-2.5">Hubungi Admin untuk memeriksa konfigurasi Keyword Mapping di menu Pengaturan.</td>
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
                <p>Panduan ini mencakup seluruh fungsi Staff Operasional ditambah fitur manajemen user, konfigurasi keyword parser backend, dan langkah investigasi teknis.</p>
              </div>
            </div>

            <section className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Users className="w-5 h-5 text-[#0A4D68]" />
                <span>1. Manajemen User (`/users`)</span>
              </h2>
              <p className="text-xs text-slate-600">
                Menu ini hanya dapat diakses oleh akun ber-role **Admin** untuk mengelola akun pengguna sistem LaporGo:
              </p>
              <ol className="list-decimal pl-5 text-xs text-slate-600 space-y-2">
                <li>**Menambah User Baru**: Klik tombol *"Tambah User"*, isi Nama, Email, Password, dan Pilih Role (Staff / Admin). Klik Simpan.</li>
                <li>**Mengubah Role User**: Klik ikon Edit pada baris user, ubah role sesuai kebutuhan, lalu simpan.</li>
                <li>**Menghapus User**: Klik ikon Hapus (Trash) untuk mencabut akses login pengguna.</li>
              </ol>

              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>⚠️ Catatan Penting Keamanan:</span>
                </p>
                <p>Jangan berikan role Administrator kepada pengguna yang tidak berwenang karena Admin memiliki akses penuh untuk merubah sistem dan kata kunci kalkulasi.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Sliders className="w-5 h-5 text-[#0A4D68]" />
                <span>2. Pengaturan Keyword Filter & Mapping (`/pengaturan`)</span>
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fitur ini mengatur kata kunci (*keyword*) yang digunakan oleh backend parser untuk memisahkan dan memetakan baris transaksi laporan ke kategori **Debit** atau **Kredit** secara otomatis. <span className="font-semibold text-amber-700">[SEMENTARA - MENUNGGU BACKEND LOGIC]</span>
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold text-slate-800">Cara Menambah Keyword Baru:</h4>
                <ol className="list-decimal pl-5 text-slate-600 space-y-1">
                  <li>Buka menu **Pengaturan**.</li>
                  <li>Ketik Kata Kunci baru pada kolom input (contoh: <code className="bg-white px-1.5 py-0.5 border rounded font-mono">QRIS BNI</code> atau <code className="bg-white px-1.5 py-0.5 border rounded font-mono">VOUCHER KOPSWA</code>).</li>
                  <li>Pilih Kategori Finansial yang sesuai (**Debit** atau **Kredit**).</li>
                  <li>Klik **"Tambah Keyword"**, lalu klik **"Simpan Konfigurasi"**.</li>
                </ol>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Search className="w-5 h-5 text-[#0A4D68]" />
                <span>3. Investigasi Teknis Laporan Unbalance</span>
              </h2>
              <ol className="list-decimal pl-5 text-xs text-slate-600 space-y-2">
                <li>Buka Halaman **Preview Laporan** yang berstatus *Unbalance*.</li>
                <li>Bandingkan angka Total Penjualan OMI pada `LAPORAN PER TANGGAL.xls` dengan angka ringkasan SMART pada `ringkasan pembayaran logo.xlsx`.</li>
                <li>Periksa apakah ada nama metode pembayaran baru di file kasir OMI yang belum terdaftar di menu **Pengaturan Keyword Filter**. Jika ada, tambahkan kata kunci tersebut.</li>
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
                <p className="font-bold text-sm">Dokumentasi Teknis & Handover Developer</p>
                <p className="text-slate-200 mt-0.5">Panduan arsitektur, skema database, instruksi deployment, dan checklist pengerjaan backend untuk pengembang baru.</p>
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
                <p>[ Client Browser (React + Vite) ]</p>
                <p>   ├── Auth & Session  ──▶ [ Supabase Auth (JWT & RLS) ]</p>
                <p>   ├── Process Upload ──▶ [ Node.js Express Backend (/api/process-laporan) ]</p>
                <p>   │                           ├── ExcelJS / Multer File Parser</p>
                <p>   │                           └── Formula & Rekonsiliasi DPP PPN</p>
                <p>   └── Save & History ──▶ [ Supabase PostgreSQL DB & Storage Bucket ]</p>
              </div>

              <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <p><strong>Alasan Pemisahan Layer Arsitektur:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>**Frontend (React + Vite)**: Berfokus penuh pada pengalaman pengguna (UI/UX), animasi interaktif, dan validasi form client-side agar responsif di Vercel CDN.</li>
                  <li>**Node.js / Express Backend (`server.js`)**: Diperlukan khusus untuk pemrosesan file berat (`.xls`, `.xlsx`, `.txt`) menggunakan `multer` dan `exceljs` yang tidak efisien jika dijalankan langsung di browser.</li>
                  <li>**Supabase (PostgreSQL + Auth + Storage)**: Menyediakan backend-as-a-service yang aman untuk otentikasi JWT, manajemen peran user, penyimpan file fisik laporan, dan panyimpanan database terstruktur.</li>
                </ul>
              </div>
            </section>

            {/* Section IT 2: Struktur Folder */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <FolderTree className="w-5 h-5 text-[#0A4D68]" />
                <span>2. Struktur Folder & Fungsi Komponen</span>
              </h2>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-700 space-y-1.5 overflow-x-auto">
                <p className="font-bold text-[#0A4D68]">LaporGo_Kopswa/</p>
                <p>├── public/                # Asset statis, logo Kopswa, OMI, SMART & favicon.svg</p>
                <p>├── src/</p>
                <p>│   ├── components/        # Komponen UI Reusable (Layout, Topbar, Sidebar, FileSlotRow, UploadZone)</p>
                <p>│   ├── context/           # AuthContext.jsx (State autentikasi Supabase & session user)</p>
                <p>│   ├── data/              # mockData.js (Data simulasi awal dashboard & preview)</p>
                <p>│   ├── pages/             # Halaman Utama (Login, Dashboard, UploadReport, ReportPreview, ReportHistory, UserManagement, Settings, UserGuide)</p>
                <p>│   ├── App.jsx            # Routing React Router DOM (Public vs Protected Routes)</p>
                <p>│   └── main.jsx           # Entry point React 18</p>
                <p>├── server.js              # Express Backend Server (Parser file excel, multer & exceljs generator)</p>
                <p>├── supabase_schema.sql    # DDL Script tabel PostgreSQL, RLS Policies, dan Trigger User Profile</p>
                <p>└── tailwind.config.js     # Konfigurasi Tailwind CSS v4 & custom colors</p>
              </div>
            </section>

            {/* Section IT 3: Skema Database */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Database className="w-5 h-5 text-[#0A4D68]" />
                <span>3. Skema Database PostgreSQL (Supabase)</span>
              </h2>
              <p className="text-xs text-slate-600">
                Skema database terdiri dari 3 tabel utama (tersedia script DDL lengkap pada <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[#0A4D68]">supabase_schema.sql</code>):
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-2.5">Nama Tabel</th>
                      <th className="p-2.5">Kolom Utama</th>
                      <th className="p-2.5">Status Kolom yang Belum Terisi/Dipakai Backend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-600">
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-[#0A4D68]">public.profiles</td>
                      <td className="p-2.5 font-mono">id, email, full_name, role</td>
                      <td className="p-2.5 font-medium text-emerald-600">✓ Sudah Terpakai (Auto trigger Supabase Auth)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-[#0A4D68]">public.laporan</td>
                      <td className="p-2.5 font-mono">id, tanggal, status_balance, total_debit, total_kredit, selisih, file_output_url</td>
                      <td className="p-2.5 text-amber-700 font-semibold">⚠️ `file_output_url` dan kalkulasi `selisih` masih menunggu API penggabungan backend nyata.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-[#0A4D68]">public.laporan_files</td>
                      <td className="p-2.5 font-mono">id, laporan_id, nama_file, tipe, storage_path</td>
                      <td className="p-2.5 text-amber-700 font-semibold">⚠️ `storage_path` masih menunggu pengunggahan berkas fisik ke Supabase Storage Bucket `laporan-files`.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section IT 4: Status Pengerjaan (Checklist Handover) */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>4. Status Pengerjaan & Checklist Priorities Handover</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Selesai */}
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>SELESAI (Frontend & UI/UX Ready)</span>
                  </h4>
                  <ul className="list-disc pl-5 text-emerald-700 space-y-1">
                    <li>Desain UI/UX & Tema Korporat Swadharma Teal (`#0A4D68`) & Orange (`#FF5000`).</li>
                    <li>Sistem Autentikasi Supabase & Role Guard (Admin/Staff).</li>
                    <li>Halaman Buat Laporan dengan Slot Baris & Multi-Struk TXT.</li>
                    <li>Halaman Dashboard, Preview Multi-Tab, Riwayat, & User Management.</li>
                    <li>Favicon & Titling Tab Browser Swadharma.</li>
                  </ul>
                </div>

                {/* Belum Selesai (Prioritas Tim Baru) */}
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-amber-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>BELUM SELESAI (Prioritas Backend Developer Baru)</span>
                  </h4>
                  <ul className="list-disc pl-5 text-amber-700 space-y-1">
                    <li>**Parser File `.xls` / `.xlsx` Real**: Membaca sel-sel tabel dari file OMI & SMART di `server.js`.</li>
                    <li>**Formula Rekonsiliasi DPP & PPN**: Menyusun formula matematika pemisah PPN WAPU/PK dan BTKP.</li>
                    <li>**Integrasi Keyword Mapping Real**: Menghubungkan keyword di database ke logic parsing.</li>
                    <li>**Upload Storage Bucket**: Pengunggahan berkas fisik ke Supabase Storage Bucket.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section IT 5: Running & Deployment */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Rocket className="w-5 h-5 text-[#0A4D68]" />
                <span>5. Cara Menjalankan di Lokal & Panduan Deployment</span>
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
                    <li>Jalankan Express Backend Stub: <code className="bg-white px-1 py-0.5 border rounded">node server.js</code> (Port 5000)</li>
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
