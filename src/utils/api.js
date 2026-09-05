// ─────────────────────────────────────────────────────────
// api.js — LaporGo Frontend API Utility
// Di Vercel: frontend & backend satu domain → pakai relative path
// Di lokal  : backend di localhost:5000 → pakai VITE_API_BASE_URL
// ─────────────────────────────────────────────────────────

// Kalau VITE_API_BASE_URL tidak diset (production Vercel), gunakan '' (relative)
// Kalau diset (local dev: http://localhost:5000/api), strip /api suffix
const _raw     = import.meta.env.VITE_API_BASE_URL || '';
const BASE_URL = _raw ? _raw.replace(/\/api\/?$/, '') : '';

/**
 * Kirim semua file laporan ke backend untuk diproses.
 * @param {Object} fileSlots - Object berisi array File dari tiap slot
 * @returns {Promise<{success: boolean, data: Object}>}
 */
export async function processLaporan(fileSlots) {
  const {
    omiPerTanggal  = [],
    omiTutupHarian = [],
    smartFiles     = [],
    omiMember      = [],
    detailSmart    = [],
  } = fileSlots;

  const formData = new FormData();

  // File wajib OMI
  if (omiPerTanggal[0])  formData.append('omi_per_tanggal',  omiPerTanggal[0]);
  if (omiTutupHarian[0]) formData.append('omi_tutup_harian', omiTutupHarian[0]);

  // File SMART (bisa lebih dari 1 — TOKO + LOGO)
  smartFiles.forEach(f => formData.append('smart_files', f));

  // File opsional
  if (omiMember[0])   formData.append('omi_member',   omiMember[0]);
  if (detailSmart[0]) formData.append('detail_smart', detailSmart[0]);

  const res = await fetch(`${BASE_URL}/api/process-laporan`, {
    method: 'POST',
    body: formData,
    // JANGAN set Content-Type — biarkan browser set multipart/form-data otomatis
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error || `Server error: ${res.status}`);
  }

  return json;
}

/**
 * Download hasil Excel dari backend.
 * Memanfaatkan data yang sudah diproses sebelumnya (tersimpan di app.locals.lastResult).
 * @param {string} filename - Nama file yang akan didownload
 */
export async function downloadExcel(filename = 'Laporan_Gabungan.xlsx') {
  const res = await fetch(`${BASE_URL}/api/download-excel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `Gagal download: ${res.status}`);
  }

  // Buat blob dan trigger download otomatis
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Format angka ke format Rupiah: 1.234.567
 */
export function fmtRupiah(n) {
  if (!n || n === 0) return '-';
  return new Intl.NumberFormat('id-ID').format(n);
}
