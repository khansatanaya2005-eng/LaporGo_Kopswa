// src/utils/api.js
// Utility untuk memanggil backend Express / Vercel API

export const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Kirim file ke /api/process-laporan
 * @param {Object} fileSlots - slot file dari UploadReport
 * @returns {Promise<{success, data: {omsetRows, summary, warnings}}>}
 */
export async function processLaporan(fileSlots) {
  const {
    omiPerTanggal = [],
    omiTutupHarian = [],
    smartFiles = [],     // multi-upload TOKO+LOGO
    omiMember = [],
    detailSmart = [],
  } = fileSlots;

  const form = new FormData();
  if (omiPerTanggal[0])  form.append('omi_per_tanggal',  omiPerTanggal[0]);
  if (omiTutupHarian[0]) form.append('omi_tutup_harian', omiTutupHarian[0]);
  smartFiles.forEach(f   => form.append('smart_files', f));
  if (omiMember[0])      form.append('omi_member',      omiMember[0]);
  if (detailSmart[0])    form.append('detail_smart',    detailSmart[0]);

  const resp = await fetch(`${API_BASE}/api/process-laporan`, {
    method: 'POST',
    body: form,
  });

  const json = await resp.json();
  if (!resp.ok || !json.success) {
    throw new Error(json.error || `Server error ${resp.status}`);
  }
  return json;
}

/**
 * Download Excel dari server (gunakan lastResult di server)
 */
export async function downloadExcel(filename = 'Laporan_Gabungan.xlsx') {
  const resp = await fetch(`${API_BASE}/api/download-excel`, { method: 'POST' });
  if (!resp.ok) throw new Error('Gagal mengunduh file Excel dari server');
  const blob = await resp.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Format angka ke Rupiah singkat untuk display */
export function fmtRupiah(n) {
  if (!n || n === 0) return '-';
  return new Intl.NumberFormat('id-ID').format(n);
}
