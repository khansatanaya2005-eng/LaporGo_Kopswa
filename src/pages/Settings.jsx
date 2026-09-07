import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Plus, Trash2, Save, Key, Sliders, CheckCircle2, BookOpen, RotateCcw } from 'lucide-react';
import { MOCK_KEYWORDS, DEFAULT_COA_MAP } from '../data/mockData';

const Settings = () => {
  const [keywords, setKeywords] = useState(MOCK_KEYWORDS);
  const [newKeyword, setNewKeyword] = useState('');
  const [newCategory, setNewCategory] = useState('EDC / Bank');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // State Pengaturan Bagan Akun (COA)
  const [coaList, setCoaList] = useState(() => {
    const saved = localStorage.getItem('laporgo_coa_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_COA_MAP;
  });
  const [coaSuccess, setCoaSuccess] = useState(false);

  const handleUpdateCoa = (id, field, value) => {
    setCoaList(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSaveCoa = () => {
    localStorage.setItem('laporgo_coa_settings', JSON.stringify(coaList));
    setCoaSuccess(true);
    setTimeout(() => setCoaSuccess(false), 3000);
  };

  const handleResetCoa = () => {
    if (confirm('Kembalikan bagan akun (COA) ke pengaturan bawaan awal?')) {
      setCoaList(DEFAULT_COA_MAP);
      localStorage.setItem('laporgo_coa_settings', JSON.stringify(DEFAULT_COA_MAP));
      setCoaSuccess(true);
      setTimeout(() => setCoaSuccess(false), 3000);
    }
  };


  const handleAddKeyword = (e) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    const item = {
      id: `kw-${Date.now()}`,
      keyword: newKeyword.trim().toUpperCase(),
      category: newCategory,
      status: 'Aktif'
    };
    setKeywords(prev => [...prev, item]);
    setNewKeyword('');
  };

  const handleDeleteKeyword = (id) => {
    setKeywords(prev => prev.filter(k => k.id !== id));
  };

  const handleSaveAll = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pengaturan & Konfigurasi</h1>
        <p className="text-sm text-slate-500 mt-1">
          Konfigurasi keyword filter (BNI, QRIS, Voucher, dll) untuk pemetaaan kolom otomatis backend.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Pengaturan keyword berhasil disimpan!</span>
        </div>
      )}

      {/* Form Konfigurasi Keyword */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-2.5 bg-[#0A4D68]/10 text-[#0A4D68] rounded-xl">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Keyword Filter Transaksi</h2>
            <p className="text-xs text-slate-500">Kata kunci yang digunakan backend untuk memisahkan kategori debit/kredit</p>
          </div>
        </div>

        {/* Input Tambah Keyword */}
        <form onSubmit={handleAddKeyword} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Tambah keyword (mis. BNI, QRIS)..."
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4D68]"
          />

          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#0A4D68]"
          >
            <option value="EDC / Bank">EDC / Bank</option>
            <option value="Digital Payment">Digital Payment</option>
            <option value="Diskon / Promo">Diskon / Promo</option>
            <option value="Koperasi UKS">Koperasi UKS</option>
            <option value="Piutang B2B">Piutang B2B</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-[#0A4D68] hover:bg-[#088395] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah</span>
          </button>
        </form>

        {/* Keyword Chips/Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-2.5 px-4 rounded-l-lg">Keyword</th>
                <th className="py-2.5 px-4">Kategori Mapping</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right rounded-r-lg">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {keywords.map((kw) => (
                <tr key={kw.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-[#0A4D68] font-mono">{kw.keyword}</td>
                  <td className="py-3 px-4 text-slate-700">{kw.category}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded text-[10px]">
                      {kw.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteKeyword(kw.id)}
                      className="text-slate-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-6 py-2.5 bg-[#0A4D68] hover:bg-[#088395] text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Konfigurasi</span>
          </button>
        </div>
      </div>

      {/* ── BAGIAN PENGATURAN COA (CHART OF ACCOUNTS) ── */}
      {coaSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Pengaturan Bagan Akun (COA) berhasil disimpan!</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0A4D68]/10 text-[#0A4D68] rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Bagan Akun (Chart of Accounts / COA)</h2>
              <p className="text-xs text-slate-500">Sesuaikan nomor dan nama akun akuntansi yang dicetak pada Voucher PDF</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetCoa}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Bawaan</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-2.5 px-3">Kategori Transaksi</th>
                <th className="py-2.5 px-3 w-40">Nomor Akun</th>
                <th className="py-2.5 px-3">Nama Akun Akuntansi</th>
                <th className="py-2.5 px-3 text-center">Posisi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coaList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{item.kategori}</td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={item.nomor}
                      onChange={(e) => handleUpdateCoa(item.id, 'nomor', e.target.value)}
                      className="w-full px-2.5 py-1 text-xs font-mono font-bold text-[#0A4D68] bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0A4D68]"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={item.nama}
                      onChange={(e) => handleUpdateCoa(item.id, 'nama', e.target.value)}
                      className="w-full px-2.5 py-1 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0A4D68]"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.posisi === 'DEBET' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {item.posisi}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleSaveCoa}
            className="px-6 py-2.5 bg-[#0A4D68] hover:bg-[#088395] text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Bagan Akun (COA)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

