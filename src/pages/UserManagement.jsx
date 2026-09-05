import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Trash2, 
  Edit3, 
  X,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import { 
  getProfiles, 
  createUserInSupabase, 
  deleteUserFromSupabase, 
  updateUserProfile 
} from '../lib/supabaseClient';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Custom Delete Confirm Modal State
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    domain: '@staff.kopswa.id',
    role: 'Staff',
    password: ''
  });

  // Load profiles from Supabase on mount
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const liveProfiles = await getProfiles();
      if (Array.isArray(liveProfiles)) {
        setUsers(liveProfiles.map(p => ({
          id: p.id,
          full_name: p.full_name || p.email.split('@')[0],
          email: p.email,
          role: p.role || 'Staff',
          raw_password: p.raw_password || '',
          created_at: p.created_at ? p.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
        })));
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.warn('Gagal memuat profiles:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = (newRole) => {
    setFormData(prev => ({
      ...prev,
      role: newRole,
      domain: newRole === 'Admin' ? '@admin.kopswa.id' : '@staff.kopswa.id'
    }));
  };

  const isMainAccount = (email) => {
    return email?.toLowerCase().includes('mainaccount');
  };

  const handleOpenViewMain = (usr) => {
    setEditingUser(usr);
    setShowPassword(false);
    const emailParts = usr.email.split('@');
    const uname = emailParts[0] || '';
    const dom = emailParts[1] ? `@${emailParts[1]}` : '@admin.kopswa.id';

    setFormData({ 
      full_name: usr.full_name, 
      username: uname,
      domain: dom,
      role: usr.role,
      password: usr.raw_password || 'admin123',
      isReadOnly: true
    });
    setShowModal(true);
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setShowPassword(false);
    setFormData({
      full_name: '',
      username: '',
      domain: '@staff.kopswa.id',
      role: 'Staff',
      password: '',
      isReadOnly: false
    });
    setShowModal(true);
  };

  const handleOpenEdit = (usr) => {
    if (isMainAccount(usr.email)) {
      handleOpenViewMain(usr);
      return;
    }

    setEditingUser(usr);
    setShowPassword(false);
    const emailParts = usr.email.split('@');
    const uname = emailParts[0] || '';
    const dom = emailParts[1] ? `@${emailParts[1]}` : (usr.role === 'Admin' ? '@admin.kopswa.id' : '@staff.kopswa.id');

    setFormData({ 
      full_name: usr.full_name, 
      username: uname,
      domain: dom,
      role: usr.role,
      password: usr.raw_password || '',
      isReadOnly: false
    });
    setShowModal(true);
  };

  const mainAccountUser = users.find(u => isMainAccount(u.email));
  const regularUsers = users.filter(u => !isMainAccount(u.email));

  const confirmDelete = (usr) => {
    setDeleteConfirmUser(usr);
  };

  const handleExecuteDelete = async () => {
    if (!deleteConfirmUser) return;
    setDeleting(true);
    try {
      await deleteUserFromSupabase(deleteConfirmUser.id);
      setUsers(prev => prev.filter(u => u.id !== deleteConfirmUser.id));
      setDeleteConfirmUser(null);
    } catch (err) {
      alert('Gagal menghapus user: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.full_name) return;

    setSaving(true);
    const finalEmail = formData.username.includes('@') 
      ? formData.username 
      : `${formData.username}${formData.domain}`;

    try {
      if (editingUser) {
        // Update user
        await updateUserProfile(editingUser.id, {
          full_name: formData.full_name,
          email: finalEmail,
          role: formData.role,
          password: formData.password || null
        });
        fetchUsers();
      } else {
        // Create user
        const result = await createUserInSupabase({
          full_name: formData.full_name,
          email: finalEmail,
          role: formData.role,
          password: formData.password || '12345678'
        });
        fetchUsers();
      }
      setShowModal(false);
    } catch (err) {
      alert('Terjadi kesalahan saat menyimpan user: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen User</h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola akun pengguna sistem (@admin.kopswa.id vs @staff.kopswa.id).
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0A4D68] hover:bg-[#088395] text-white font-semibold text-xs rounded-xl shadow-md transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah User Baru</span>
        </button>
      </div>

      {/* Main Account Special Section */}
      {mainAccountUser && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50/60 to-orange-500/10 border border-amber-200/70 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-amber-500/20">
                M
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">{mainAccountUser.full_name}</h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 border border-amber-300">
                    <Shield className="w-3 h-3 text-amber-600" />
                    Akun Utama (Super Admin)
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-600 mt-0.5">{mainAccountUser.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-medium text-amber-800/80 bg-amber-100/60 px-3 py-1.5 rounded-xl border border-amber-200/80">
                🔒 Akun dilindungi system (Tidak dapat diubah / dihapus)
              </span>
              <button
                onClick={() => handleOpenViewMain(mainAccountUser)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold rounded-xl shadow-sm transition"
              >
                <Eye className="w-4 h-4 text-amber-600" />
                <span>Lihat Detail</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Daftar Pengguna Sistem ({regularUsers.length})</h2>
          <span className="text-xs text-slate-400 font-mono">Dapat dikelola (Edit / Hapus)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Nama Pengguna</th>
                <th className="py-3.5 px-5">Email Akun</th>
                <th className="py-3.5 px-5">Role / Peran</th>
                <th className="py-3.5 px-5">Tanggal Dibuat</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0A4D68]" />
                    <p className="text-xs font-medium">Memuat daftar user...</p>
                  </td>
                </tr>
              ) : regularUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    <p className="text-xs font-medium">Belum ada user tambahan terdaftar.</p>
                  </td>
                </tr>
              ) : (
                regularUsers.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-5 font-semibold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#0A4D68]/10 text-[#0A4D68] flex items-center justify-center font-bold text-xs">
                        {usr.full_name ? usr.full_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span>{usr.full_name}</span>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-600 font-medium">
                      {usr.email}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        usr.role === 'Admin' 
                          ? 'bg-[#FF5000]/10 text-[#FF5000] border border-[#FF5000]/20' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        <Shield className="w-3 h-3" />
                        {usr.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500">{usr.created_at}</td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(usr)}
                          className="p-1.5 text-slate-500 hover:text-[#0A4D68] hover:bg-[#0A4D68]/10 rounded-lg transition"
                          title="Edit User"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(usr)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit / View User */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">
                {formData.isReadOnly ? 'Detail Akun Utama (Read-Only)' : (editingUser ? 'Edit Hak Akses User' : 'Tambah User Baru')}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Pengguna</label>
                <input
                  type="text"
                  required
                  disabled={formData.isReadOnly}
                  readOnly={formData.isReadOnly}
                  autoComplete="off"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Contoh: Ahmad Subagyo"
                  className={`w-full px-3 py-2 text-xs border border-slate-200 rounded-lg ${
                    formData.isReadOnly ? 'bg-slate-100 text-slate-600 cursor-not-allowed' : 'bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4D68]'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Peran / Role Akun</label>
                <select
                  value={formData.role}
                  disabled={formData.isReadOnly}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className={`w-full px-3 py-2 text-xs border border-slate-200 rounded-lg ${
                    formData.isReadOnly ? 'bg-slate-100 text-slate-600 cursor-not-allowed' : 'bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4D68]'
                  }`}
                >
                  <option value="Staff">Staff (@staff.kopswa.id)</option>
                  <option value="Admin">Admin (@admin.kopswa.id)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Username / Email</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    disabled={formData.isReadOnly}
                    readOnly={formData.isReadOnly}
                    autoComplete="off"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="nama.user"
                    className={`w-full pl-3 pr-32 py-2 text-xs border border-slate-200 rounded-lg font-mono ${
                      formData.isReadOnly ? 'bg-slate-100 text-slate-600 cursor-not-allowed' : 'bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4D68]'
                    }`}
                  />
                  {!formData.username.includes('@') && (
                    <span className="absolute right-2 px-2 py-0.5 bg-slate-200/80 text-slate-700 font-mono text-[11px] rounded font-semibold pointer-events-none select-none">
                      {formData.domain}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password Akun
                </label>
                <div 
                  className="relative flex items-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 z-10 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!editingUser}
                    readOnly
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Password akun"
                    className="w-full pl-8 pr-10 py-2 text-xs border border-slate-200 rounded-lg font-mono bg-slate-50 text-slate-700 cursor-pointer select-none focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPassword(!showPassword);
                    }}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer z-10"
                    title={showPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-sans">
                  Klik kolom ini atau ikon mata untuk melihat password.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  {formData.isReadOnly ? 'Tutup' : 'Batal'}
                </button>
                {!formData.isReadOnly && (
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#0A4D68] hover:bg-[#088395] rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingUser ? 'Simpan Perubahan' : 'Tambah User'}</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Hapus Pengguna?</h3>
            <p className="text-xs text-slate-500 mb-6">
              Apakah Anda yakin ingin menghapus pengguna <span className="font-semibold text-slate-800">{deleteConfirmUser.full_name}</span> ({deleteConfirmUser.email})? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="w-full py-2.5 px-4 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleExecuteDelete}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 transition"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

