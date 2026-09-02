import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Trash2, 
  Edit3, 
  X
} from 'lucide-react';
import { MOCK_USERS } from '../data/mockData';

const UserManagement = () => {
  const [users, setUsers] = useState(MOCK_USERS);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'Staff'
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({ full_name: '', email: '', role: 'Staff' });
    setShowModal(true);
  };

  const handleOpenEdit = (usr) => {
    setEditingUser(usr);
    setFormData({ full_name: usr.full_name, email: usr.email, role: usr.role });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.full_name) return;

    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
    } else {
      const newUser = {
        id: `usr-${Date.now()}`,
        ...formData,
        created_at: new Date().toISOString().split('T')[0]
      };
      setUsers(prev => [...prev, newUser]);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen User</h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola hak akses pengguna dan peran (Admin vs Staff) sistem LaporGo.
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
                <th className="py-3.5 px-5">Email</th>
                <th className="py-3.5 px-5">Role / Peran</th>
                <th className="py-3.5 px-5">Tanggal Dibuat</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((usr) => (
                <tr key={usr.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-5 font-semibold text-slate-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#0A4D68]/10 text-[#0A4D68] flex items-center justify-center font-bold text-xs">
                      {usr.full_name.charAt(0)}
                    </div>
                    <span>{usr.full_name}</span>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-slate-600">{usr.email}</td>
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
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(usr.id)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
                {editingUser ? 'Edit Hak Akses User' : 'Tambah User Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@kopswa.id"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4D68]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Peran / Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4D68]"
                >
                  <option value="Staff">Staff (Input & View Laporan)</option>
                  <option value="Admin">Admin (Full Access & User Management)</option>
                </select>
              </div>

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
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#0A4D68] hover:bg-[#088395] rounded-lg shadow-sm"
                >
                  {editingUser ? 'Simpan Perubahan' : 'Tambah User'}
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
