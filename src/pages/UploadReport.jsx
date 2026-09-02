import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { MOCK_OMSET_DATA } from '../data/mockData';

const UploadReport = () => {
  const [omiFiles, setOmiFiles] = useState([]);
  const [smartFiles, setSmartFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleOmiUpload = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 0) {
      const valid = selected.map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: 'omi'
      }));
      setOmiFiles(prev => [...prev, ...valid]);
    }
  };

  const handleSmartUpload = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 0) {
      const valid = selected.map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: 'smart'
      }));
      setSmartFiles(prev => [...prev, ...valid]);
    }
  };

  const removeOmiFile = (id) => {
    setOmiFiles(prev => prev.filter(f => f.id !== id));
  };

  const removeSmartFile = (id) => {
    setSmartFiles(prev => prev.filter(f => f.id !== id));
  };

  const canProcess = omiFiles.length > 0 && smartFiles.length > 0;

  const handleProcess = async () => {
    if (!canProcess) return;
    setProcessing(true);
    setErrorMessage('');

    try {
      // Stub call to local backend Express.js server on port 5000
      const formData = new FormData();
      omiFiles.forEach(f => formData.append('omi_files', f.file));
      smartFiles.forEach(f => formData.append('smart_files', f.file));

      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${apiBase}/process-laporan`, {
        method: 'POST',
        body: formData,
      }).catch(() => null);

      if (response && response.ok) {
        const result = await response.json();
        navigate('/preview', { state: { reportData: result } });
      } else {
        // Fallback demo mock navigation if local backend express server is offline
        setTimeout(() => {
          setProcessing(false);
          navigate('/preview', { 
            state: { 
              reportData: {
                summary: {
                  totalDebit: 43490000,
                  totalKredit: 43490000,
                  selisih: 0,
                  jumlahTransaksi: 142,
                  statusBalance: 'Balance'
                },
                omsetRows: MOCK_OMSET_DATA
              }
            } 
          });
        }, 1500);
      }
    } catch (err) {
      setErrorMessage('Gagal menghubungi server backend. Menampilkan preview simulasi.');
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Upload & Proses Laporan Baru</h1>
        <p className="text-sm text-slate-500 mt-1">
          Unggah file laporan harian dari Toko OMI dan Toko SMART untuk digabungkan secara otomatis.
        </p>
      </div>

      {/* Two Dropzones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dropzone OMI */}
        <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase">
                Toko OMI (Franchise)
              </span>
              <span className="text-xs text-slate-400">Format: .xls, .xlsx, .txt</span>
            </div>

            <div className="text-center py-6">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <UploadCloud className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Pilih atau Tarik File OMI</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">Dapat memilih lebih dari satu file</p>
              
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-xl cursor-pointer transition">
                <span>Browse File OMI</span>
                <input
                  type="file"
                  multiple
                  accept=".xls,.xlsx,.txt"
                  onChange={handleOmiUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* List File OMI */}
          {omiFiles.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase">File Ter-upload ({omiFiles.length})</p>
              {omiFiles.map(file => (
                <div key={file.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileSpreadsheet className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-medium text-slate-700 truncate">{file.name}</span>
                    <span className="text-slate-400 text-[10px]">({file.size})</span>
                  </div>
                  <button onClick={() => removeOmiFile(file.id)} className="text-slate-400 hover:text-red-600 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dropzone SMART */}
        <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-emerald-200 hover:border-emerald-400 transition-colors shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase">
                Toko SMART (Milik Perusahaan)
              </span>
              <span className="text-xs text-slate-400">Format: .xlsx</span>
            </div>

            <div className="text-center py-6">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <UploadCloud className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Pilih atau Tarik File SMART</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">Dapat memilih lebih dari satu file</p>
              
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-xl cursor-pointer transition">
                <span>Browse File SMART</span>
                <input
                  type="file"
                  multiple
                  accept=".xlsx"
                  onChange={handleSmartUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* List File SMART */}
          {smartFiles.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase">File Ter-upload ({smartFiles.length})</p>
              {smartFiles.map(file => (
                <div key={file.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium text-slate-700 truncate">{file.name}</span>
                    <span className="text-slate-400 text-[10px]">({file.size})</span>
                  </div>
                  <button onClick={() => removeSmartFile(file.id)} className="text-slate-400 hover:text-red-600 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Validation Banner */}
      {!canProcess && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-800 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="font-semibold">Persyaratan Dokumen Belum Terpenuhi</p>
            <p className="mt-0.5 text-amber-700">
              Harap unggah sekurang-kurangnya 1 file OMI dan 1 file SMART sebelum melanjutkan proses penggabungan.
            </p>
          </div>
        </div>
      )}

      {/* Action Process Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleProcess}
          disabled={!canProcess || processing}
          className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Memproses & Menggabungkan File...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Proses Gabungkan Laporan</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default UploadReport;
