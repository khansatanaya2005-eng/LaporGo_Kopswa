import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Database, AlertCircle } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabaseClient';

const Topbar = () => {
  const { user, logout } = useAuth();
  const hasSupabase = isSupabaseConfigured();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm z-10">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-slate-700 hidden sm:block">
          Sistem Penggabungan Laporan Harian Toko OMI & SMART
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Supabase Connection Status Badge */}
        <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
          hasSupabase ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}>
          <Database className="w-3.5 h-3.5" />
          <span>{hasSupabase ? 'Supabase Connected' : 'Supabase (Perlu Credential .env)'}</span>
        </div>

        {/* User Profile Badge */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-full py-1.5 px-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="text-xs text-left pr-1">
            <p className="font-semibold text-slate-800 leading-none truncate max-w-[120px]">
              {user?.name || user?.email}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${user?.role === 'Admin' ? 'bg-purple-500' : 'bg-emerald-500'}`}></span>
              <span className="text-[10px] text-slate-500 font-medium">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Keluar"
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg border border-slate-200 hover:border-red-200 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
