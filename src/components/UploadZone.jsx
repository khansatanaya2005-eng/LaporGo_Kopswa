import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, FileText, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

const UploadZone = ({ categoryTitle, accept, onFilesAdded, files = [], onRemoveFile, isOmi }) => {
  const [isDragOver, setIsDragOver] = useState(false);

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
      onFilesAdded(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(Array.from(e.target.files));
      e.target.value = null; // Reset input file
    }
  };

  // Group files into mandatory vs optional
  const mandatoryFiles = files.filter(f => f.isMandatory);
  const optionalFiles = files.filter(f => !f.isMandatory);

  return (
    <div className="space-y-4">
      {/* Dropzone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 ${
          isDragOver 
            ? 'border-[#0A4D68] bg-[#0A4D68]/10 scale-[1.01]' 
            : 'border-slate-300 hover:border-[#0A4D68]/50 bg-slate-50/50'
        }`}
      >
        <div className="w-12 h-12 bg-[#0A4D68]/10 text-[#0A4D68] rounded-xl flex items-center justify-center mx-auto mb-3 shadow-inner">
          <UploadCloud className="w-6 h-6" />
        </div>
        
        <h4 className="text-sm font-bold text-slate-800 mb-1">
          Tarik & Lepaskan File {categoryTitle} di Sini
        </h4>
        <p className="text-xs text-slate-400 mb-3">
          Mendukung multiple file upload (Ekstensi: {accept})
        </p>

        <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A4D68] hover:bg-[#088395] text-white font-semibold text-xs rounded-xl cursor-pointer shadow-sm transition active:scale-95">
          <UploadCloud className="w-4 h-4" />
          <span>Pilih File</span>
          <input
            type="file"
            multiple
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </div>

      {/* Teruploaded Files Section */}
      {files.length > 0 && (
        <div className="space-y-3 pt-2">
          {/* Mandatory Files */}
          {mandatoryFiles.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-md inline-flex items-center gap-1 uppercase tracking-wider">
                🔥 File Wajib ({mandatoryFiles.length})
              </span>
              <div className="grid grid-cols-1 gap-2">
                {mandatoryFiles.map((fileItem) => (
                  <div 
                    key={fileItem.id}
                    className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-[#0A4D68]/30 transition"
                  >
                    <div className="flex items-center gap-3 truncate pr-2">
                      <div className="p-2 bg-[#0A4D68]/10 text-[#0A4D68] rounded-lg shrink-0">
                        {fileItem.isTxt ? <FileText className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-800 truncate">{fileItem.name}</p>
                          {fileItem.isTxt && (
                            <span className="text-[9px] font-bold bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded uppercase shrink-0">
                              📄 Struk
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">{(fileItem.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveFile(fileItem.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0"
                      title="Hapus File"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional Files */}
          {optionalFiles.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md inline-flex items-center gap-1 uppercase tracking-wider">
                ⭕ File Opsional ({optionalFiles.length})
              </span>
              <div className="grid grid-cols-1 gap-2">
                {optionalFiles.map((fileItem) => (
                  <div 
                    key={fileItem.id}
                    className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition"
                  >
                    <div className="flex items-center gap-3 truncate pr-2">
                      <div className="p-2 bg-slate-100 text-slate-600 rounded-lg shrink-0">
                        {fileItem.isTxt ? <FileText className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium text-slate-700 truncate">{fileItem.name}</p>
                          {fileItem.isTxt && (
                            <span className="text-[9px] font-bold bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded uppercase shrink-0">
                              📄 Struk
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">{(fileItem.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveFile(fileItem.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0"
                      title="Hapus File"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadZone;
