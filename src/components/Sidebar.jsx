import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FilePlus, 
  History, 
  Users, 
  Settings, 
  FileSpreadsheet 
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
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
          <FileSpreadsheet className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-white text-lg leading-none">LaporGo</h1>
          <p className="text-xs text-slate-400 mt-1">OMI & SMART Integration</p>
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
