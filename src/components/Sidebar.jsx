import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FilePlus, 
  History, 
  Users, 
  Settings 
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Buat Laporan', path: '/upload', icon: FilePlus },
    { label: 'Riwayat Laporan', path: '/riwayat', icon: History },
  ];

  if (user?.role === 'Admin') {
    navItems.push({ label: 'Manajemen User', path: '/users', icon: Users });
  }

  navItems.push({ label: 'Pengaturan', path: '/pengaturan', icon: Settings });

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full shadow-xl border-r border-slate-800 z-20">
      {/* Brand Header with Corporate Logos */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/50">
        {/* Utama: Logo Koperasi Swadharma */}
        <div className="bg-white p-2.5 rounded-xl shadow-md border border-slate-800 flex items-center justify-center">
          <img 
            src="/Logo_Kopswa.png" 
            alt="Koperasi Swadharma" 
            className="h-9 object-contain"
          />
        </div>

        {/* Sub-Brand Logos: OMI & SMART */}
        <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg flex-1 justify-center border border-slate-700/50">
            <span className="text-[9px] text-slate-400 font-semibold uppercase">Unit:</span>
            <img src="/smartlogo.png" alt="SMART" className="h-4 object-contain" />
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg flex-1 justify-center border border-slate-700/50">
            <span className="text-[9px] text-slate-400 font-semibold uppercase">Mitra:</span>
            <img src="/logo_omi.png" alt="OMI" className="h-4 object-contain" />
          </div>
        </div>

        <div className="mt-3 text-center">
          <span className="inline-block px-2.5 py-0.5 bg-blue-900/60 text-blue-300 text-[10px] font-bold rounded-full border border-blue-700/50">
            LaporGo System
          </span>
        </div>
      </div>


      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Menu Utama
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400 text-center">
        <span className="font-medium text-slate-300">KOPSWA System</span> &copy; 2026
      </div>
    </aside>
  );
};

export default Sidebar;
