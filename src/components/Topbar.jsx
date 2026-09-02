import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const Topbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm z-10">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-slate-800 hidden sm:block">
          Sistem Penggabungan Laporan Harian Toko OMI & SMART
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* User Profile Badge */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-full py-1.5 px-3">
          <div className="w-8 h-8 rounded-full bg-[#0A4D68]/10 text-[#0A4D68] flex items-center justify-center font-bold text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="text-xs text-left pr-1">
            <p className="font-semibold text-slate-800 leading-none truncate max-w-[150px]">
              {user?.name || user?.email}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${user?.role === 'Admin' ? 'bg-[#FF5000]' : 'bg-emerald-500'}`}></span>
              <span className="text-[10px] text-slate-500 font-medium">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Keluar"
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg border border-slate-200 hover:border-red-200 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
