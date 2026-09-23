import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  FilePlus, 
  TrendingUp, 
  ArrowRight,
  Clock,
  Eye,
  Loader2,
  ClipboardList,
  FileClock,
  CheckCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { getLaporanList, getMyLaporanList } from '../lib/supabaseClient';
import { formatRupiah } from '../utils/cn';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); // '7d', '30d', '3m', '6m', '1y'

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user?.role === 'Staff') {
        const myData = await getMyLaporanList(user?.id);
        setMyReports(myData || []);
      }
      const data = await getLaporanList();
      setReports(data || []);
    } catch (err) {
      console.error("Gagal mengambil data dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  // Hitung Laporan Terakhir
  const latestReport = reports.length > 0 ? reports[0] : null;

  // Hitung Total Laporan Bulan Ini
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const reportsThisMonth = reports.filter(r => r.tanggal && r.tanggal.startsWith(currentMonthStr));
  const totalReportsThisMonth = reportsThisMonth.length > 0 ? reportsThisMonth.length : reports.length;

  // Hitung Laporan Unbalance
  const unbalanceCount = reports.filter(l => l.status_balance === 'Unbalance').length;

  // Filter Data Grafik Berdasarkan Rentang Waktu
  const getFilteredChartReports = () => {
    if (reports.length === 0) return [];

    const sorted = [...reports].sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
    const latestDate = new Date(sorted[sorted.length - 1].tanggal);

    let startDate = new Date(latestDate);

    if (timeRange === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeRange === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (timeRange === '3m') {
      startDate.setMonth(startDate.getMonth() - 3);
    } else if (timeRange === '6m') {
      startDate.setMonth(startDate.getMonth() - 6);
    } else if (timeRange === '1y') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const filtered = sorted.filter(r => {
      const itemDate = new Date(r.tanggal);
      return itemDate >= startDate;
    });

    // Jika hasil filter kosong (misal data sedikit), fallback tampilkan seluruh data
    return filtered.length > 0 ? filtered : sorted;
  };

  const filteredReports = getFilteredChartReports();

  const chartData = filteredReports.map(r => {
    const dateObj = new Date(r.tanggal);
    let shortDate = r.tanggal;
    if (!isNaN(dateObj.getTime())) {
      shortDate = dateObj.toLocaleDateString('id-ID', { 
        day: '2-digit', 
        month: timeRange === '1y' || timeRange === '6m' ? 'short' : 'short' 
      });
    }

    return {
      tgl: shortDate,
      omset: Number(r.total_debit) || 0
    };
  });

  const rangeButtons = [
    { id: '7d', label: '7 Hari' },
    { id: '30d', label: '30 Hari' },
    { id: '3m', label: '3 Bulan' },
    { id: '6m', label: '6 Bulan' },
    { id: '1y', label: '1 Tahun' },
  ];

  if (user?.role === 'Staff') {
    const totalMyReports = myReports.length;
    const pendingReviewCount = myReports.filter(r => !r.status_workflow || r.status_workflow === 'Belum di review').length;
    const verifiedCount = myReports.filter(r => r.status_workflow === 'Di verifikasi' || r.status_workflow === 'Arsip').length;

    return (
      <div className="space-y-6">
        {/* Welcome Banner Staff */}
        <div className="bg-gradient-to-r from-[#051923] via-[#0A4D68] to-[#088395] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-full bg-white/5 transform skew-x-12 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="inline-block px-3 py-1 bg-white/10 text-teal-200 text-xs font-bold rounded-full mb-2">
                Dasbor Operasional Staff
              </span>
              <h1 className="text-2xl font-bold tracking-tight">
                Halo, {user?.name || 'Staff Koperasi'} 👋
              </h1>
              <p className="text-teal-100/90 text-sm mt-1">
                Upload laporan harian Anda, lalu pantau status review dan verifikasi dari Admin.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <Link
                to="/upload"
                className="inline-flex items-center justify-center gap-2 bg-[#FF5000] hover:bg-[#e04600] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <FilePlus className="w-4 h-4" />
                <span>Proses Laporan Baru</span>
              </Link>
              <Link
                to="/my-review"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-bold text-xs border border-white/20 transition-all active:scale-95"
              >
                <ClipboardList className="w-4 h-4" />
                <span>Status Review Saya</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stat Cards Staff */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Laporan Diproses Saya</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{totalMyReports}</h3>
              <p className="text-xs text-slate-500 mt-1">Total laporan tersimpan</p>
            </div>
            <div className="p-3 bg-blue-50 text-[#0A4D68] rounded-2xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Belum di Review Admin</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{pendingReviewCount}</h3>
              <p className="text-xs text-slate-500 mt-1">Menunggu pemeriksaan</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <FileClock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Telah di Verifikasi</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{verifiedCount}</h3>
              <p className="text-xs text-slate-500 mt-1">Disetujui Admin</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <CheckCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Table Laporan Terbaru Saya */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Laporan Terakhir Saya</h2>
            <Link to="/my-review" className="text-xs font-semibold text-[#0A4D68] hover:text-[#088395] flex items-center gap-1">
              <span>Lihat Status Review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-5">Tanggal</th>
                  <th className="py-3.5 px-5">Status Balance</th>
                  <th className="py-3.5 px-5">Status Review</th>
                  <th className="py-3.5 px-5">Total Debit</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400 text-xs">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0A4D68]" />
                      <span>Memuat data...</span>
                    </td>
                  </tr>
                ) : myReports.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400 text-xs">
                      Belum ada laporan yang Anda kirimkan. Silakan klik "Proses Laporan Baru".
                    </td>
                  </tr>
                ) : (
                  myReports.slice(0, 5).map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition">
                      <td className="py-4 px-5 font-bold text-slate-900">{row.tanggal}</td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                          row.status_balance === 'Balance' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {row.status_balance === 'Balance' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                          {row.status_balance}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                          row.status_workflow === 'Di verifikasi'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : row.status_workflow === 'Di review'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          <Clock className="w-3.5 h-3.5" />
                          {row.status_workflow || 'Belum di review'}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono text-xs font-medium text-slate-800">
                        {formatRupiah(row.total_debit)}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Link
                          to={`/kelola/${row.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0A4D68] bg-[#0A4D68]/10 hover:bg-[#0A4D68]/20 px-3 py-1.5 rounded-lg border border-[#0A4D68]/20 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner Admin */}
      <div className="bg-gradient-to-r from-[#051923] via-[#0A4D68] to-[#088395] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-white/5 transform skew-x-12 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Ringkasan Laporan Harian (Admin)</h1>
            <p className="text-teal-100/90 text-sm mt-1">
              Pantau status sinkronisasi laporan keuangan OMI & SMART KOPSWA serta verifikasi laporan.
            </p>
          </div>
          <Link
            to="/review"
            className="inline-flex items-center justify-center gap-2 bg-[#FF5000] hover:bg-[#e04600] text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all shrink-0 active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Review Laporan Masuk</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Laporan Terakhir */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Laporan Terakhir</p>
            {loading ? (
              <div className="h-6 w-28 bg-slate-200 animate-pulse rounded mt-2"></div>
            ) : latestReport ? (
              <>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{latestReport.tanggal}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                    latestReport.status_balance === 'Balance' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {latestReport.status_balance === 'Balance' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {latestReport.status_balance}
                  </span>
                  <span className="text-xs text-slate-500">{formatRupiah(latestReport.total_debit)}</span>
                </div>
              </>
            ) : (
              <h3 className="text-sm font-semibold text-slate-400 mt-2">Belum ada laporan</h3>
            )}
          </div>
          <div className="p-3 bg-[#0A4D68]/10 text-[#0A4D68] rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Laporan Bulan Ini */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Laporan</p>
            {loading ? (
              <div className="h-6 w-20 bg-slate-200 animate-pulse rounded mt-2"></div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{totalReportsThisMonth} Laporan</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 font-semibold">Tersimpan di LaporGo</span>
                </p>
              </>
            )}
          </div>
          <div className="p-3 bg-[#0A4D68]/10 text-[#0A4D68] rounded-xl">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Status Unbalance */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Laporan Unbalance</p>
            {loading ? (
              <div className="h-6 w-20 bg-slate-200 animate-pulse rounded mt-2"></div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{unbalanceCount} Laporan</h3>
                <p className="text-xs text-slate-500 mt-2">
                  {unbalanceCount > 0 ? 'Perlu penyesuaian/pemeriksaan' : 'Semua laporan balance!'}
                </p>
              </>
            )}
          </div>
          <div className={`p-3 rounded-xl ${unbalanceCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Tren Omset Harian</h2>
            <p className="text-xs text-slate-500">Visualisasi total transaksi debit harian gabungan OMI & SMART</p>
          </div>

          {/* Filter Time Range Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-start sm:self-auto">
            {rangeButtons.map(btn => (
              <button
                key={btn.id}
                onClick={() => setTimeRange(btn.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  timeRange === btn.id
                    ? 'bg-[#0A4D68] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Memuat grafik omset...
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Belum ada data laporan untuk ditampilkan pada grafik.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOmset" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0A4D68" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0A4D68" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="tgl" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis 
                  tickFormatter={(val) => `Rp ${val >= 1000000 ? (val / 1000000).toFixed(1) + 'M' : (val / 1000).toFixed(0) + 'K'}`} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  axisLine={false} 
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(val) => [formatRupiah(val), "Total Omset"]}
                  contentStyle={{ backgroundColor: '#051923', borderRadius: '8px', border: 'none', color: '#fff' }}
                  itemStyle={{ color: '#FF5000' }}
                />
                <Area type="monotone" dataKey="omset" stroke="#0A4D68" strokeWidth={3} fillOpacity={1} fill="url(#colorOmset)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Laporan Terbaru</h2>
          <Link to="/riwayat" className="text-xs font-semibold text-[#0A4D68] hover:text-[#088395] flex items-center gap-1">
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-100">
              <tr>
                <th className="py-3 px-5">Tanggal</th>
                <th className="py-3 px-5">Jumlah Transaksi</th>
                <th className="py-3 px-5">Total Debit</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Dibuat Oleh</th>
                <th className="py-3 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 text-xs">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0A4D68]" />
                    <span>Memuat data laporan...</span>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 text-xs">
                    Belum ada laporan yang tersimpan.
                  </td>
                </tr>
              ) : (
                reports.slice(0, 5).map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">{row.tanggal}</td>
                    <td className="py-3.5 px-5">{row.jumlah_transaksi || 0} Transaksi</td>
                    <td className="py-3.5 px-5 font-mono">{formatRupiah(row.total_debit)}</td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        row.status_balance === 'Balance' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {row.status_balance === 'Balance' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        {row.status_balance}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500">{row.dibuat_oleh_nama || 'System'}</td>
                    <td className="py-3.5 px-5 text-right">
                      <Link
                        to={`/kelola/${row.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#0A4D68] bg-[#0A4D68]/10 hover:bg-[#0A4D68]/20 px-3 py-1.5 rounded-lg border border-[#0A4D68]/20 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Kelola</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
