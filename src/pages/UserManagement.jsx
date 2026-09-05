import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Trash2, 
  Edit3, 
  X,
  Loader2,
  Lock
} from 'lucide-react';
import { MOCK_USERS } from '../data/mockData';
import { 
  getProfiles, 
  createUserInSupabase, 
  deleteUserFromSupabase, 
  updateUserProfile 
} from '../lib/supabaseClient';

const UserManagement = () => {
  const [users, setUsers] = useState(MOCK_USERS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    domain: '@staff_kopswa.id',
    role: 'Staff',
    password: ''
  });

  // Load profiles from Supabase on mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const liveProfiles = await getProfiles();
        if (liveProfiles && liveProfiles.length > 0) {
          setUsers(liveProfiles.map(p => ({
            id: p.id,
            full_name: p.full_name || p.email.split('@')[0],
            email: p.email,
            role: p.role || 'Staff',
            created_at: p.created_at ? p.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
          })));
        }
      } catch (err) {
        console.warn('Gagal memuat profiles Supabase, menggunakan data default:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = (newRole) => {
    setFormData(prev => ({
      ...prev,
      role: newRole,
      domain: newRole === 'Admin' ? '@admin_kopswa.id' : '@staff_kopswa.id'
    }));
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      full_name: '',
      username: '',
      domain: '@staff_kopswa.id',
      role: 'Staff',
      password: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (usr) => {
    setEditingUser(usr);
    const emailParts = usr.email.split('@');
    const uname = emailParts[0] || '';
    const dom = emailParts[1] ? `@${emailParts[1]}` : (usr.role === 'Admin' ? '@admin_kopswa.id' : '@staff_kopswa.id');

    setFormData({ 
      full_name: usr.full_name, 
      username: uname,
      domain: dom,
      role: usr.role,
      password: ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus user ini dari Supabase?')) {
      try {
        await deleteUserFromSupabase(id);
        setUsers(prev => prev.filter(u => u.id !== id));
      } catch (err) {
        alert('Gagal menghapus user: ' + err.message);
      }
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
          role: formData.role
        });
        setUsers(prev => prev.map(u => u.id === editingUser.id ? { 
          ...u, 
          full_name: formData.full_name,
          role: formData.role,
          email: finalEmail
        } : u));
      } else {
        // Create user in Supabase
        const result = await createUserInSupabase({
          full_name: formData.full_name,
          email: finalEmail,
          role: formData.role,
          password: formData.password || '12345678'
        });

        const newUser = {
          id: result?.id || `usr-${Date.now()}`,
          full_name: formData.full_name,
          email: finalEmail,
          role: formData.role,
          created_at: new Date().toISOString().split('T')[0]
        };
        setUsers(prev => [newUser, ...prev]);
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
            Kelola akun pengguna real Supabase (@admin_kopswa.id vs @staff_kopswa.id).
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

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
                    <p className="text-xs font-medium">Memuat daftar user dari Supabase...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    <p className="text-xs font-medium">Belum ada user terdaftar.</p>
                  </td>
                </tr>
              ) : (
                users.map((usr) => (
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
                          onClick={() => handleDelete(usr.id)}
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

      {/* Modal Add / Edit User */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">
                {editingUser ? 'Edit Hak Akses User' : 'Tambah User Baru (Supabase)'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Pengguna</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Contoh: Ahmad Subagyo"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4D68]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Peran / Role Akun</label>
                <select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4D68]"
                >
                  <option value="Staff">Staff (@staff_kopswa.id)</option>
                  <option value="Admin">Admin (@admin_kopswa.id)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Username / Email</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingUser)}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="nama.user"
                    className="w-full pl-3 pr-32 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4D68] font-mono disabled:opacity-60"
                  />
                  {!formData.username.includes('@') && (
                    <span className="absolute right-2 px-2 py-0.5 bg-slate-200/80 text-slate-700 font-mono text-[11px] rounded font-semibold pointer-events-none select-none">
                      {formData.domain}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                  Email lengkap: {formData.username.includes('@') ? formData.username : `${formData.username || 'username'}${formData.domain}`}
                </p>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password Awal</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4D68]"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#0A4D68] hover:bg-[#088395] rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingUser ? 'Simpan Perubahan' : 'Tambah User Supabase'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

