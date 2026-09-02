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
      {/* Balanced Corporate Brand Header */}
      <div className="p-4 border-b border-[#0A4D68]/30 bg-[#030F16]">
        {/* Logo Utama: Koperasi Swadharma */}
        <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
          <img 
            src="/Logo_Kopswa.png" 
            alt="Koperasi Swadharma" 
            className="h-8 object-contain"
          />
        </div>

        {/* Sub-Brand Logos: SMART & OMI */}
        <div className="grid grid-cols-2 gap-2 mt-2.5">
          <div className="bg-white/95 px-2 py-1.5 rounded-lg flex items-center justify-center border border-slate-200/20 shadow-inner">
            <img src="/smartlogo.png" alt="SMART" className="h-5 object-contain" />
          </div>
          <div className="bg-white/95 px-2 py-1.5 rounded-lg flex items-center justify-center border border-slate-200/20 shadow-inner">
            <img src="/logo_omi.png" alt="OMI" className="h-5 object-contain" />
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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

      {/* Footer info */}
      <div className="p-3.5 border-t border-[#0A4D68]/30 text-[11px] text-slate-400 text-center bg-[#030F16]">
        <span className="font-semibold text-slate-300">LaporGo</span> &copy; 2026 Koperasi Swadharma
      </div>
    </aside>
  );
};

export default Sidebar;
