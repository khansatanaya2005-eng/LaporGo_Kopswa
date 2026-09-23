// ─────────────────────────────────────────────────────────
// api.js — LaporGo Frontend API Utility
// Di Vercel: frontend & backend satu domain → pakai relative path
// Di lokal  : backend di localhost:5000 → pakai VITE_API_BASE_URL
// ─────────────────────────────────────────────────────────

// Kalau VITE_API_BASE_URL tidak diset (production Vercel), gunakan '' (relative)
// Kalau diset (local dev: http://localhost:5000/api), strip /api suffix
const _raw = import.meta.env.VITE_API_BASE_URL || '';
const BASE_URL = _raw ? _raw.replace(/\/api\/?$/, '') : '';

/**
 * Kirim semua file laporan ke backend untuk diproses.
 * @param {Object} fileSlots - Object berisi array File dari tiap slot
 * @returns {Promise<{success: boolean, data: Object}>}
 */
export async function processLaporan(fileSlots, allowNoSmart = false, smartConfirmation = null) {
  const {
    omiPerTanggal = [],
    omiTutupHarian = [],
    smartFiles = [],
    smartToko = [],
    smartLogo = [],
    omiMember = [],
    perStrukFiles = [],
    detailSmart = [],
    omiPerStruk = [],
    omiDiscItem = [],
    omiPareto = [],
    omiAnalisa = [],
    omiPersediaan = [],
  } = fileSlots;

  const formData = new FormData();

  // Berkas Utama OMI
  if (omiPerTanggal[0]) formData.append('omi_per_tanggal', omiPerTanggal[0]);
  omiTutupHarian.forEach(f => formData.append('omi_tutup_harian', f));
  if (omiMember[0]) formData.append('omi_member', omiMember[0]);

  // Berkas Struk Kasir Kredit
  perStrukFiles.forEach(f => formData.append('per_struk', f));

  // Berkas SMART
  smartFiles.forEach(f => formData.append('smart_files', f));
  if (smartToko[0]) formData.append('smart_toko', smartToko[0]);
  if (smartLogo[0]) formData.append('smart_logo', smartLogo[0]);
  if (detailSmart[0]) formData.append('detail_smart', detailSmart[0]);

  if (allowNoSmart) {
    formData.append('allow_no_smart', 'true');
  }
  if (smartConfirmation) {
    formData.append('smart_confirmation', smartConfirmation);
  }

  // Berkas Pendukung OMI
  if (omiPerStruk[0]) formData.append('omi_per_struk', omiPerStruk[0]);
  if (omiDiscItem[0]) formData.append('omi_disc_item', omiDiscItem[0]);
  if (omiPareto[0]) formData.append('omi_pareto', omiPareto[0]);
  if (omiAnalisa[0]) formData.append('omi_analisa', omiAnalisa[0]);
  if (omiPersediaan[0]) formData.append('omi_persediaan', omiPersediaan[0]);

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
export async function downloadExcel(omsetRows, summary, tanggal, filename = 'Laporan_Gabungan.xlsx', reportId = null) {
  const res = await fetch(`${BASE_URL}/api/download-excel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ omsetRows, summary, tanggal, reportId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `Gagal download: ${res.status}`);
  }

  // Buat blob dan trigger download otomatis
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
