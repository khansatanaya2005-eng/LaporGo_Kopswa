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
    <aside className="w-64 bg-[#051923] text-slate-300 flex flex-col h-full shadow-xl border-r border-[#0A4D68]/30 z-20">
      {/* Compact Brand Header with Corporate Logos */}
      <div className="px-4 py-3.5 border-b border-[#0A4D68]/30 bg-[#030F16]">
        {/* Utama: Logo Koperasi Swadharma */}
        <div className="bg-white px-2.5 py-1.5 rounded-lg shadow-sm flex items-center justify-center">
          <img 
            src="/Logo_Kopswa.png" 
            alt="Koperasi Swadharma" 
            className="h-6 object-contain"
          />
        </div>

        {/* Sub-Brand Logos: SMART & OMI in 1 slim bar */}
        <div className="flex items-center justify-between gap-1.5 mt-2">
          <div className="flex items-center justify-center gap-1 bg-[#0A4D68]/30 px-2 py-0.5 rounded flex-1 border border-slate-700/30">
            <span className="text-[8px] text-slate-400 font-bold uppercase">SMART</span>
            <img src="/smartlogo.png" alt="SMART" className="h-2.5 object-contain" />
          </div>
          <span className="text-[10px] text-slate-600 font-bold">&</span>
          <div className="flex items-center justify-center gap-1 bg-[#0A4D68]/30 px-2 py-0.5 rounded flex-1 border border-slate-700/30">
            <span className="text-[8px] text-slate-400 font-bold uppercase">OMI</span>
            <img src="/logo_omi.png" alt="OMI" className="h-2.5 object-contain" />
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Menu Utama
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#0A4D68] text-white shadow-md font-semibold border-l-4 border-[#FF5000]'
                    : 'text-slate-400 hover:text-white hover:bg-[#0A4D68]/30'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Compact Footer info */}
      <div className="p-3 border-t border-[#0A4D68]/30 text-[10px] text-slate-400 text-center bg-[#030F16]">
        <span className="font-semibold text-slate-300">LaporGo</span> &copy; 2026 Koperasi Swadharma
      </div>
    </aside>
  );
};

export default Sidebar;
