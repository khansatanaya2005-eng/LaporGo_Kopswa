import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList, Clock, Eye, Loader2, RefreshCw,
  CheckCircle2, AlertTriangle, Search, Calendar,
  FileCheck, FileClock, FileX2
} from "lucide-react";
import { getMyLaporanList, isSupabaseConfigured } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { formatRupiah } from "../utils/cn";

const WorkflowBadge = ({ status }) => {
  if (status === "Di verifikasi")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Di Verifikasi
      </span>
    );
  if (status === "Di review")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
        <FileClock className="w-3.5 h-3.5" />
        Di Review
      </span>
    );
  if (status === "Arsip")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
        <FileCheck className="w-3.5 h-3.5" />
        Arsip
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
      <Clock className="w-3.5 h-3.5" />
      Belum di Review
    </span>
  );
};

const MyReview = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const fetchReports = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured() && user?.id) {
        const data = await getMyLaporanList(user.id);
        setReports(data || []);
      }
    } catch (err) {
      console.error("Error fetching my reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [user?.id]);

  const filtered = reports.filter(r => {
    const matchSearch = r.tanggal?.includes(searchQuery);
    const matchStatus = filterStatus === "ALL" || r.status_workflow === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: reports.length,
    belum: reports.filter(r => !r.status_workflow || r.status_workflow === "Belum di review").length,
    review: reports.filter(r => r.status_workflow === "Di review").length,
    verified: reports.filter(r => r.status_workflow === "Di verifikasi").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-[#0A4D68]" />
            Status Laporan Saya
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau status review laporan yang telah Anda kirimkan.
          </p>
        </div>
        <button
          onClick={fetchReports}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Laporan", count: counts.all, color: "bg-slate-50 border-slate-200 text-slate-700", icon: <ClipboardList className="w-5 h-5" /> },
          { label: "Belum di Review", count: counts.belum, color: "bg-amber-50 border-amber-200 text-amber-700", icon: <Clock className="w-5 h-5" /> },
          { label: "Sedang Di Review", count: counts.review, color: "bg-blue-50 border-blue-200 text-blue-700", icon: <FileClock className="w-5 h-5" /> },
          { label: "Di Verifikasi", count: counts.verified, color: "bg-emerald-50 border-emerald-200 text-emerald-700", icon: <CheckCircle2 className="w-5 h-5" /> },
        ].map((card, i) => (
          <div key={i} className={`p-4 rounded-2xl border ${card.color} flex items-center justify-between`}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{card.label}</p>
              <p className="text-2xl font-bold mt-1">{card.count}</p>
            </div>
            <div className="opacity-40">{card.icon}</div>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari tanggal laporan..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4D68]"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { val: "ALL", label: "Semua" },
            { val: "Belum di review", label: "Belum di Review" },
            { val: "Di review", label: "Di Review" },
            { val: "Di verifikasi", label: "Di Verifikasi" },
          ].map(opt => (
            <button
              key={opt.val}
              onClick={() => setFilterStatus(opt.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                filterStatus === opt.val
                  ? "bg-[#0A4D68] text-white border-[#0A4D68]"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Memuat laporan Anda...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
            <FileX2 className="w-10 h-10 text-slate-300" />
            <p className="text-sm font-semibold">Belum ada laporan yang dikirim.</p>
            <p className="text-xs">Laporan yang Anda kirim ke review akan muncul di sini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-5">Tanggal</th>
                  <th className="py-3.5 px-5">Total Debit</th>
                  <th className="py-3.5 px-5">Balance</th>
                  <th className="py-3.5 px-5">Status Review</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50 transition">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <Calendar className="w-4 h-4 text-[#0A4D68]" />
                        {row.tanggal}
                      </div>
                      <p className="text-[10px] text-slate-400 ml-6 mt-0.5">
                        {new Date(row.created_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                      </p>
                    </td>
                    <td className="py-4 px-5 font-mono font-medium text-slate-800 text-xs">
                      {formatRupiah(row.total_debit)}
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        row.status_balance === "Balance"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {row.status_balance === "Balance"
                          ? <CheckCircle2 className="w-3 h-3" />
                          : <AlertTriangle className="w-3 h-3" />}
                        {row.status_balance || "Draft"}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <WorkflowBadge status={row.status_workflow} />
                    </td>
                    <td className="py-4 px-5 text-right">
                      <Link
                        to={`/kelola/${row.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#0A4D68] bg-[#0A4D68]/10 hover:bg-[#0A4D68]/20 px-3 py-1.5 rounded-lg border border-[#0A4D68]/20 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Detail</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReview;
