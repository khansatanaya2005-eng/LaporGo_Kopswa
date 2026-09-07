import React, { useState } from 'react';
import { FileText, X, Download } from 'lucide-react';

const VoucherModal = ({ isOpen, onClose, onConfirm, defaultDate = '' }) => {
  const [voucherNo, setVoucherNo] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(voucherNo.trim());
    setVoucherNo('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#0A4D68]/10 text-[#0A4D68] rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Cetak Voucher Akuntansi</h3>
              <p className="text-[11px] text-slate-500">Koperasi Swadharma</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nomor Voucher (Opsional)
            </label>
            <input
              type="text"
              autoFocus
              placeholder="Contoh: J26090009"
              value={voucherNo}
              onChange={(e) => setVoucherNo(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4D68] focus:border-transparent transition"
            />
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
              Jika dikosongkan, nomor voucher pada lembar PDF otomatis akan dicetak tanda strip (<span className="font-mono font-bold text-slate-700">-</span>).
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0A4D68] hover:bg-[#088395] text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Voucher PDF</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VoucherModal;
