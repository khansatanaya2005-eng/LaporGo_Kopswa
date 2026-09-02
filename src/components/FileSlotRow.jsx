import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  FileText, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  FileCheck
} from 'lucide-react';

const FileSlotRow = ({ 
  title, 
  description, 
  accept, 
  isMandatory, 
  isMulti = false, 
  isStruk = false,
  uploadedFiles = [], // Array of File objects for this slot
  onUpload, 
  onRemove 
}) => {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const isUploaded = uploadedFiles.length > 0;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArr = Array.from(e.dataTransfer.files);
      onUpload(isMulti ? filesArr : [filesArr[0]]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files);
      onUpload(isMulti ? filesArr : [filesArr[0]]);
      e.target.value = null;
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`p-4 rounded-xl border transition-all duration-200 ${
        isUploaded 
          ? 'bg-emerald-50/40 border-emerald-200' 
          : isDragOver 
          ? 'bg-[#0A4D68]/10 border-[#0A4D68] scale-[1.005]' 
          : isMandatory 
          ? 'bg-white border-slate-200 shadow-sm hover:border-slate-300' 
          : 'bg-slate-50/50 border-slate-200/80 hover:border-slate-300'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Side: Info File Slot */}
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl shrink-0 ${
            isUploaded 
              ? 'bg-emerald-100 text-emerald-700' 
              : isMandatory 
              ? 'bg-red-50 text-red-600 border border-red-100' 
              : 'bg-slate-100 text-slate-500'
          }`}>
            {isStruk ? <FileText className="w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5" />}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs font-bold text-slate-800 tracking-wide">{title}</h4>
              
              {isMandatory ? (
                <span className="text-[10px] font-extrabold bg-red-100 text-red-700 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  🔥 Wajib
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-slate-200/80 text-slate-600 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  ⭕ Opsional
                </span>
              )}

              {isStruk && (
                <span className="text-[10px] font-bold bg-sky-100 text-sky-700 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  📄 Multi-Struk TXT
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
          </div>
        </div>

        {/* Right Side: Upload Control & Status */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <input 
            type="file" 
            ref={fileInputRef}
            accept={accept}
            multiple={isMulti}
            onChange={handleFileChange}
            className="hidden"
          />

          {!isUploaded ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0A4D68] hover:bg-[#088395] text-white font-semibold text-xs rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload File</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {isMulti ? `${uploadedFiles.length} File Struk` : 'Ter-upload'}
                </span>
              </span>

              {isMulti && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 text-[#0A4D68] bg-[#0A4D68]/10 hover:bg-[#0A4D68]/20 rounded-lg transition"
                  title="Tambah File Struk Lainnya"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => onRemove()}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Hapus / Reset Slot Ini"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail Uploaded Files List (If uploaded) */}
      {isUploaded && (
        <div className="mt-3 pt-3 border-t border-emerald-200/60 space-y-1.5">
          {uploadedFiles.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs bg-white/80 p-2 rounded-lg border border-emerald-100">
              <div className="flex items-center gap-2 truncate pr-2">
                <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-800 truncate">{file.name}</span>
                <span className="text-[10px] text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>

              {isMulti && (
                <button
                  onClick={() => onRemove(idx)}
                  className="text-slate-400 hover:text-red-600 p-1"
                  title="Hapus Struk Ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileSlotRow;
