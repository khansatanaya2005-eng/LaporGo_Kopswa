import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  ArrowLeft, 
  UserCheck, 
  ShieldCheck, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  UploadCloud, 
  Search, 
  Sliders, 
  Users, 
  HelpCircle, 
  Download, 
  Printer, 
  FileText,
  Sparkles,
  Info
} from 'lucide-react';

const UserGuide = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('staff'); // 'staff' | 'admin'

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
                Dokumen Panduan Penggunaan
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
              <span>Panduan Resmi Pengoperasian Sistem</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Panduan Penggunaan LaporGo System
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Panduan lengkap langkah demi langkah pengoperasian sistem penggabungan dan rekonsiliasi laporan harian Toko OMI & SMART Koperasi Swadharma.
            </p>
          </div>
        </div>

        {/* Tab Navigation Roles */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex items-center gap-2 px-6 py-3 font-bold text-xs sm:text-sm border-b-2 transition cursor-pointer ${
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
            className={`flex items-center gap-2 px-6 py-3 font-bold text-xs sm:text-sm border-b-2 transition cursor-pointer ${
              activeTab === 'admin'
                ? 'border-[#FF5000] text-[#FF5000] bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>2. Panduan Administrator</span>
          </button>
        </div>

        {/* TAB 1: PANDUAN STAFF */}
        {activeTab === 'staff' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-10">
            {/* Daftar Isi Staff */}
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

            {/* Step 1: Login */}
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

            {/* Step 2: Dashboard */}
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

            {/* Step 3: Prosedur Upload */}
            <section id="staff-3" className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#0A4D68] text-white flex items-center justify-center text-xs font-extrabold">3</span>
                <span>Prosedur Upload Berkas Laporan (`/upload`)</span>
              </h2>
              <p className="text-xs text-slate-600">
                Buka menu **"Buat Laporan"**. Halaman ini memiliki 2 folder kategori: **LAPORAN OMI** dan **LAPORAN SMART**.
              </p>

              {/* Tabel Ketentuan Berkas */}
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

            {/* Step 4: Memproses Laporan */}
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

            {/* Step 5: Preview & Unbalance Action */}
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

              {/* Box Langkah Unbalance */}
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

            {/* Step 6: Download & Print */}
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

            {/* Step 7: Riwayat Laporan */}
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

            {/* Step 8: Troubleshooting Staff */}
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

        {/* TAB 2: PANDUAN ADMINISTRATOR */}
        {activeTab === 'admin' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-10">
            {/* Notification Admin */}
            <div className="p-4 bg-[#0A4D68]/10 border border-[#0A4D68]/20 rounded-xl flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#0A4D68] shrink-0" />
              <div className="text-xs text-[#0A4D68]">
                <p className="font-bold">Panduan Khusus Administrator Sistem</p>
                <p>Panduan ini mencakup seluruh fungsi Staff Operasional ditambah fitur manajemen user, konfigurasi keyword parser backend, dan langkah investigasi teknis.</p>
              </div>
            </div>

            {/* Section Admin 1: User Management */}
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

            {/* Section Admin 2: Keyword Settings */}
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

            {/* Section Admin 3: Unbalance Investigation */}
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

            {/* Section Admin 4: Escalation to Dev */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <HelpCircle className="w-5 h-5 text-[#0A4D68]" />
                <span>4. Kontak Eskalasi Tim Developer</span>
              </h2>
              <p className="text-xs text-slate-600">
                Jika ditemukan kendala sistemik (bug aplikasi, error database Supabase, atau kegagalan server deployment), silakan hubungi tim developer internal:
              </p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 text-slate-700 font-mono">
                <p><strong>Tim IT & Developer LaporGo KOPSWA</strong></p>
                <p>Email Support: <span className="text-[#0A4D68] underline">it-support@kopswa.id</span></p>
                <p>Repository: <span className="text-slate-500">khansatanaya2005-eng/LaporGo_Kopswa</span></p>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserGuide;
