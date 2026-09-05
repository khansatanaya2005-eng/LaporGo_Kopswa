import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileSpreadsheet, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loginType, setLoginType] = useState('staff'); // 'staff' | 'admin'

  const handleRoleChange = (type) => {
    setLoginType(type);
    if (email && email.includes('@')) {
      const prefix = email.split('@')[0];
      setEmail(`${prefix}${type === 'admin' ? '@admin_kopswa.id' : '@staff_kopswa.id'}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Email / Username dan password wajib diisi');
      return;
    }

    let fullEmail = email.trim();
    if (!fullEmail.includes('@')) {
      fullEmail = `${fullEmail}${loginType === 'admin' ? '@admin_kopswa.id' : '@staff_kopswa.id'}`;
    }

    setErrorMsg('');
    setSubmitting(true);
    try {
      const res = await login(fullEmail, password);
      if (res?.success) {
        navigate('/dashboard');
      } else {
        setErrorMsg(res?.error || 'Login gagal. Periksa kembali email dan password.');
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan saat menghubungi server');
    } finally {
      setSubmitting(false);
    }
  };

  const fillQuickAcc = (type) => {
    setLoginType(type);
    if (type === 'admin') {
      setEmail('admin@admin_kopswa.id');
      setPassword('admin123');
    } else {
      setEmail('staff@staff_kopswa.id');
      setPassword('staff123');
    }
  };

  const activeSuffix = loginType === 'admin' ? '@admin_kopswa.id' : '@staff_kopswa.id';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001518] via-[#00252a] to-[#004b54] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#00606b]/30 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#ff5000]/20 rounded-full blur-3xl"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-teal-100 z-10"
      >
        <div className="p-8">
          {/* Logo & Title */}
          <div className="flex flex-col items-center text-center mb-6">
            {/* Logo Utama: Koperasi Swadharma */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm mb-4">
              <img 
                src="/Logo_Kopswa.png" 
                alt="Koperasi Swadharma" 
                className="h-12 object-contain"
              />
            </div>

            {/* Sub-Logos: SMART & OMI */}
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="flex items-center gap-1.5 bg-teal-50/70 border border-teal-100 px-3 py-1 rounded-lg">
                <span className="text-[10px] text-teal-800 font-semibold uppercase">Unit</span>
                <img src="/smartlogo.png" alt="SMART" className="h-5 object-contain" />
              </div>
              <span className="text-teal-300 font-bold">&</span>
              <div className="flex items-center gap-1.5 bg-teal-50/70 border border-teal-100 px-3 py-1 rounded-lg">
                <span className="text-[10px] text-teal-800 font-semibold uppercase">Mitra</span>
                <img src="/logo_omi.png" alt="OMI" className="h-5 object-contain" />
              </div>
            </div>

            <h1 className="text-xl font-bold text-slate-900 mt-1">LaporGo System</h1>
            <p className="text-xs text-slate-500 mt-0.5">Penggabungan Laporan Harian Toko OMI & SMART</p>
          </div>

          {/* Role Selection Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-5">
            <button
              type="button"
              onClick={() => handleRoleChange('staff')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                loginType === 'staff'
                  ? 'bg-white text-[#00606b] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Staf</span>
              <span className="text-[10px] opacity-75 font-mono">@staff_kopswa.id</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                loginType === 'admin'
                  ? 'bg-white text-[#ff5000] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Admin</span>
              <span className="text-[10px] opacity-75 font-mono">@admin_kopswa.id</span>
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded">
              {errorMsg}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {loginType === 'admin' ? 'Email Admin' : 'Email Staf'}
                </label>
                <span className="text-[10px] font-mono font-medium text-slate-400">
                  {activeSuffix}
                </span>
              </div>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 z-10 pointer-events-none" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={loginType === 'admin' ? "username@admin_kopswa.id" : "username@staff_kopswa.id"}
                  className="w-full pl-9 pr-32 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00606b] focus:border-transparent transition-all font-mono"
                />
                {!email.includes('@') && (
                  <span className="absolute right-2 px-2 py-1 bg-slate-200/70 text-slate-600 font-mono text-[11px] rounded font-semibold pointer-events-none select-none">
                    {activeSuffix}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00606b] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-[#00606b] to-[#004b54] hover:from-[#004b54] hover:to-[#00373e] text-white font-bold text-sm rounded-lg shadow-md shadow-teal-900/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Masuk ke Dashboard ({loginType === 'admin' ? 'Admin' : 'Staf'})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Selector */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider mb-2">
              Akun Demo Cepat
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillQuickAcc('staff')}
                className="text-xs bg-teal-50 hover:bg-teal-100 text-[#00606b] font-semibold py-1.5 px-3 rounded text-center transition cursor-pointer"
              >
                Staff Demo (@staff_kopswa.id)
              </button>
              <button
                type="button"
                onClick={() => fillQuickAcc('admin')}
                className="text-xs bg-orange-50 hover:bg-orange-100 text-[#ff5000] font-semibold py-1.5 px-3 rounded text-center transition cursor-pointer"
              >
                Admin Demo (@admin_kopswa.id)
              </button>
            </div>
          </div>

          {/* Link Panduan Penggunaan LaporGo */}
          <div className="mt-4 text-center">
            <Link
              to="/panduan"
              className="text-xs text-slate-500 hover:text-[#0A4D68] font-medium underline transition"
            >
              Panduan Penggunaan LaporGo
            </Link>
          </div>
        </div>

        <div className="bg-slate-50 px-8 py-3 text-center border-t border-slate-100">
          <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Terhubung ke Supabase Auth & DB
          </p>
        </div>

      </motion.div>
    </div>
  );

};

export default Login;
