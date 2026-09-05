import { createClient } from '@supabase/supabase-js';

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL     || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () =>
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  !supabaseUrl.includes('your-supabase') &&
  !supabaseAnonKey.includes('your-anon-key');

export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl     : 'https://placeholder.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-key'
);

// ─────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  return data;
}

// ─────────────────────────────────────────────────────────────
// LAPORAN — CREATE (Save Laporan + Rows + Warnings)
// ─────────────────────────────────────────────────────────────

/**
 * Simpan laporan lengkap ke Supabase:
 * 1. Insert header ke tabel `laporan`
 * 2. Insert baris OMSET ke tabel `omset_rows`
 * 3. Insert warnings ke tabel `laporan_warnings`
 * 4. Insert metadata file ke tabel `laporan_files`
 *
 * @param {Object} laporanData - { tanggal, summary, omsetRows, warnings }
 * @param {Array}  filesMeta   - [{ nama_file, kategori, ukuran_bytes }]
 * @returns {Object} laporan yang berhasil disimpan
 */
export async function saveLaporanToSupabase(laporanData, filesMeta = []) {
  if (!isSupabaseConfigured()) return null;

  const user = await getCurrentUser();
  const { tanggal, summary, omsetRows = [], warnings = [] } = laporanData;

  // ── 1. Insert header laporan ─────────────────────────────
  const { data: laporan, error: errLaporan } = await supabase
    .from('laporan')
    .insert([{
      tanggal:         tanggal || new Date().toISOString().split('T')[0],
      status_balance:  summary.statusBalance,
      total_debit:     summary.totalDebit,
      total_kredit:    summary.totalKredit,
      selisih:         summary.selisih,
      jumlah_baris:    omsetRows.length,
      jumlah_warnings: warnings.length,
      dibuat_oleh:     user?.id || null,
    }])
    .select()
    .single();

  if (errLaporan) {
    console.error('[Supabase] Error insert laporan:', errLaporan);
    throw new Error(errLaporan.message);
  }

  const laporanId = laporan.id;

  // ── 2. Insert omset_rows (batch) ─────────────────────────
  if (omsetRows.length > 0) {
    const rowsPayload = omsetRows.map(r => ({
      laporan_id:           laporanId,
      no:                   r.no,
      nama_ref:             r.nama_ref             || '',
      jenis_transaksi:      r.jenis_transaksi      || '',
      kwitansi:             r.kwitansi             || '',
      keterangan:           r.keterangan           || '',
      tag_promo:            r.tag_promo            || 0,
      giro_udp:             r.giro_udp             || 0,
      piutang:              r.piutang              || 0,
      beban_toko:           r.beban_toko           || 0,
      beban_logo:           r.beban_logo           || 0,
      kas_uks:              r.kas_uks              || 0,
      piutang_padi:         r.piutang_padi         || 0,
      piutang_edc:          r.piutang_edc          || 0,
      beban_promosi:        r.beban_promosi        || 0,
      pendapatan_toko:      r.pendapatan_toko      || 0,
      pendapatan_logo:      r.pendapatan_logo      || 0,
      pendapatan_kerjasama: r.pendapatan_kerjasama || 0,
      non_pajak:            r.non_pajak            || 0,
      ppn_pk:               r.ppn_pk               || 0,
      ppn_wapu:             r.ppn_wapu             || 0,
      persediaan_toko:      r.persediaan_toko      || 0,
      persediaan_logo:      r.persediaan_logo      || 0,
      simsem_uks:           r.simsem_uks           || 0,
    }));

    const { error: errRows } = await supabase
      .from('omset_rows')
      .insert(rowsPayload);

    if (errRows) console.error('[Supabase] Error insert omset_rows:', errRows);
  }

  // ── 3. Insert laporan_warnings ───────────────────────────
  if (warnings.length > 0) {
    const warningsPayload = warnings.map(w => ({
      laporan_id: laporanId,
      type:       w.type     || 'UNKNOWN',
      severity:   w.severity || 'WARNING',
      message:    w.message  || '',
    }));

    const { error: errWarn } = await supabase
      .from('laporan_warnings')
      .insert(warningsPayload);

    if (errWarn) console.error('[Supabase] Error insert warnings:', errWarn);
  }

  // ── 4. Insert laporan_files metadata ────────────────────
  if (filesMeta.length > 0) {
    const filesPayload = filesMeta.map(f => ({
      laporan_id:    laporanId,
      nama_file:     f.nama_file    || f.name || 'unknown',
      kategori:      f.kategori     || 'lainnya',
      ukuran_bytes:  f.ukuran_bytes || f.size || 0,
      storage_path:  f.storage_path || null,
    }));

    const { error: errFiles } = await supabase
      .from('laporan_files')
      .insert(filesPayload);

    if (errFiles) console.error('[Supabase] Error insert laporan_files:', errFiles);
  }

  return laporan;
}

// ─────────────────────────────────────────────────────────────
// LAPORAN FILES — UPLOAD TO STORAGE
// ─────────────────────────────────────────────────────────────

/**
 * Upload file asli ke Supabase Storage dan simpan metadata ke laporan_files
 * @param {string} laporanId - UUID laporan
 * @param {Array}  allFiles  - [{ file: File, kategori: string }]
 */
export async function uploadLaporanFilesToStorage(laporanId, allFiles = []) {
  if (!isSupabaseConfigured() || allFiles.length === 0) return;

  for (const { file, kategori } of allFiles) {
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._\-]/g, '_');
      const storagePath = `laporan/${laporanId}/${kategori}/${safeName}`;

      // Upload ke bucket laporan-files
      const { error: uploadError } = await supabase.storage
        .from('laporan-files')
        .upload(storagePath, file, { upsert: true });

      if (uploadError) {
        console.error(`[Storage] Gagal upload ${file.name}:`, uploadError);
        continue;
      }

      // Ambil public URL
      const { data: urlData } = supabase.storage
        .from('laporan-files')
        .getPublicUrl(storagePath);

      // Simpan metadata ke laporan_files
      const { error: dbError } = await supabase.from('laporan_files').insert({
        laporan_id:   laporanId,
        nama_file:    file.name,
        kategori,
        ukuran_bytes: file.size,
        storage_path: urlData.publicUrl,
      });

      if (dbError) console.error(`[Storage] Gagal simpan metadata ${file.name}:`, dbError);
    } catch (err) {
      console.error(`[Storage] Error pada ${file.name}:`, err);
    }
  }
}

// ─────────────────────────────────────────────────────────────
// LAPORAN — READ (List & Detail)
// ─────────────────────────────────────────────────────────────


/**
 * Ambil daftar laporan (dari view v_laporan_with_profile)
 * @param {number} limit - max jumlah data
 * @param {Object} filters - { status_balance, bulan } (opsional)
 */
export async function getLaporanList(limit = 20, filters = {}) {
  if (!isSupabaseConfigured()) return null;

  let query = supabase
    .from('v_laporan_with_profile')
    .select('*, omset_rows(*)')
    .order('tanggal', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (filters.bulan) {
    query = query
      .gte('tanggal', `${filters.bulan}-01`)
      .lte('tanggal', `${filters.bulan}-31`);
  }

  const { data, error } = await query;
  if (error) { console.error('[Supabase] getLaporanList:', error); return null; }
  
  const COLS_DEBIT  = ['tag_promo','giro_udp','piutang','beban_toko','beban_logo','kas_uks','piutang_padi','piutang_edc','beban_promosi'];
  const COLS_KREDIT = ['pendapatan_toko','pendapatan_logo','pendapatan_kerjasama','non_pajak','ppn_pk','ppn_wapu','persediaan_toko','persediaan_logo','simsem_uks'];

  const processedData = (data || [])
    .filter(item => !item.is_trashed && !item.deleted_at && !(item.catatan || '').includes('[TRASHED]'))
    .map(item => {
      const rows = item.omset_rows || [];
      if (rows.length > 0) {
        const sumCol = (col) => rows.reduce((s, r) => s + (Number(r[col]) || 0), 0);
        const computedDebit  = COLS_DEBIT.reduce((s, c) => s + sumCol(c), 0);
        const computedKredit = COLS_KREDIT.reduce((s, c) => s + sumCol(c), 0);
        const computedSelisih = Math.abs(computedDebit - computedKredit);
        const computedStatus = computedSelisih === 0 ? 'Balance' : 'Unbalance';

        return {
          ...item,
          total_debit: computedDebit,
          total_kredit: computedKredit,
          selisih: computedSelisih,
          status_balance: item.status_balance === 'Draft' ? 'Draft' : computedStatus
        };
      }
      return item;
    });

  if (filters.status_balance && filters.status_balance !== 'ALL') {
    return processedData.filter(r => r.status_balance === filters.status_balance);
  }

  return processedData;
}

/**
 * Ambil detail laporan berdasarkan ID (termasuk omset_rows + warnings + files)
 * @param {string} laporanId - UUID laporan
 */
export async function getLaporanById(laporanId) {
  if (!isSupabaseConfigured()) return null;

  // Fetch header
  const { data: laporan, error: errLaporan } = await supabase
    .from('v_laporan_with_profile')
    .select('*')
    .eq('id', laporanId)
    .single();

  if (errLaporan) { console.error('[Supabase] getLaporanById header:', errLaporan); return null; }

  // Fetch omset rows (urut berdasarkan no)
  const { data: omsetRows, error: errRows } = await supabase
    .from('omset_rows')
    .select('*')
    .eq('laporan_id', laporanId)
    .order('no', { ascending: true });

  if (errRows) console.error('[Supabase] getLaporanById omset_rows:', errRows);

  // Fetch warnings
  const { data: warnings, error: errWarn } = await supabase
    .from('laporan_warnings')
    .select('*')
    .eq('laporan_id', laporanId)
    .order('created_at', { ascending: true });

  if (errWarn) console.error('[Supabase] getLaporanById warnings:', errWarn);

  // Fetch source files
  const { data: files, error: errFiles } = await supabase
    .from('laporan_files')
    .select('*')
    .eq('laporan_id', laporanId)
    .order('kategori', { ascending: true });

  if (errFiles) console.error('[Supabase] getLaporanById files:', errFiles);

  return {
    ...laporan,
    omsetRows:  omsetRows  || [],
    warnings:   warnings   || [],
    files:      files      || [],
  };
}

// ─────────────────────────────────────────────────────────────
// LAPORAN — UPDATE
// ─────────────────────────────────────────────────────────────

/**
 * Update catatan atau file_output_url laporan
 */
export async function updateLaporan(laporanId, updates = {}) {
  if (!isSupabaseConfigured()) return null;

  const allowed = ['catatan', 'file_output_url', 'status_balance', 'total_debit', 'total_kredit', 'selisih'];
  const payload = Object.fromEntries(
    Object.entries(updates).filter(([k]) => allowed.includes(k))
  );

  const { data, error } = await supabase
    .from('laporan')
    .update(payload)
    .eq('id', laporanId)
    .select()
    .single();

  if (error) { console.error('[Supabase] updateLaporan:', error); throw new Error(error.message); }
  return data;
}

/**
 * Soft Delete laporan (set is_trashed = true, or fallback to deleted_at / catatan flag)
 */
export async function softDeleteLaporan(ids = []) {
  if (!isSupabaseConfigured() || ids.length === 0) return null;
  const now = new Date().toISOString();

  // 1. Coba update is_trashed
  const { error: err1 } = await supabase
    .from('laporan')
    .update({ is_trashed: true, deleted_at: now })
    .in('id', ids);
  if (!err1) return true;

  // 2. Fallback: update is_trashed saja
  const { error: err2 } = await supabase
    .from('laporan')
    .update({ is_trashed: true })
    .in('id', ids);
  if (!err2) return true;

  // 3. Fallback: update deleted_at saja
  const { error: err3 } = await supabase
    .from('laporan')
    .update({ deleted_at: now })
    .in('id', ids);
  if (!err3) return true;

  // 4. Fallback: simpan flag '[TRASHED]' di catatan (tanpa merusak check constraint status_balance)
  const { data: currentLaporan } = await supabase
    .from('laporan')
    .select('id, catatan')
    .in('id', ids);

  if (currentLaporan && currentLaporan.length > 0) {
    for (const item of currentLaporan) {
      const oldNotes = item.catatan || '';
      if (!oldNotes.includes('[TRASHED]')) {
        await supabase
          .from('laporan')
          .update({ catatan: `${oldNotes} [TRASHED]`.trim() })
          .eq('id', item.id);
      }
    }
  }
  return true;
}

/**
 * Ambil daftar laporan di Tempat Sampah
 */
export async function getTrashLaporanList() {
  if (!isSupabaseConfigured()) return [];

  // 1. Coba via is_trashed
  const { data: d1, error: err1 } = await supabase
    .from('v_laporan_with_profile')
    .select('*')
    .eq('is_trashed', true)
    .order('created_at', { ascending: false });
  if (!err1 && d1) return d1;

  // 2. Coba via deleted_at
  const { data: d2, error: err2 } = await supabase
    .from('v_laporan_with_profile')
    .select('*')
    .not('deleted_at', 'is', null)
    .order('created_at', { ascending: false });
  if (!err2 && d2) return d2;

  // 3. Fallback via catatan [TRASHED]
  const { data: d3 } = await supabase
    .from('v_laporan_with_profile')
    .select('*')
    .ilike('catatan', '%[TRASHED]%')
    .order('created_at', { ascending: false });

  return d3 || [];
}

/**
 * Pulihkan laporan dari tempat sampah
 */
export async function restoreLaporan(ids = []) {
  if (!isSupabaseConfigured() || ids.length === 0) return null;

  // 1. Coba reset is_trashed & deleted_at
  await supabase
    .from('laporan')
    .update({ is_trashed: false, deleted_at: null })
    .in('id', ids);

  // 2. Reset flag [TRASHED] di catatan jika ada
  const { data: currentLaporan } = await supabase
    .from('laporan')
    .select('id, catatan')
    .in('id', ids);

  if (currentLaporan && currentLaporan.length > 0) {
    for (const item of currentLaporan) {
      if (item.catatan && item.catatan.includes('[TRASHED]')) {
        const cleanNotes = item.catatan.replace(/\[TRASHED\]/g, '').trim();
        await supabase
          .from('laporan')
          .update({ catatan: cleanNotes })
          .eq('id', item.id);
      }
    }
  }
  return true;
}

/**
 * Hapus laporan secara permanen dari database
 */
export async function deleteLaporanPermanently(ids = []) {
  if (!isSupabaseConfigured() || ids.length === 0) return null;
  // Hapus omset_rows & files terlebih dahulu
  await supabase.from('omset_rows').delete().in('laporan_id', ids);
  await supabase.from('laporan_warnings').delete().in('laporan_id', ids);
  await supabase.from('laporan_files').delete().in('laporan_id', ids);
  const { data, error } = await supabase
    .from('laporan')
    .delete()
    .in('id', ids);
  if (error) { console.error('[Supabase] deleteLaporanPermanently:', error); throw new Error(error.message); }
  return data;
}

/**
 * Update satu kolom pada baris omset_rows
 * @param {string} rowId   - UUID baris omset_rows
 * @param {Object} updates - { colKey: newValue }
 */
export async function updateOmsetRow(rowId, updates = {}) {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('omset_rows')
    .update(updates)
    .eq('id', rowId)
    .select()
    .single();

  if (error) { console.error('[Supabase] updateOmsetRow:', error); throw new Error(error.message); }
  return data;
}

// ─────────────────────────────────────────────────────────────
// LAPORAN — DELETE (Admin only)
// ─────────────────────────────────────────────────────────────

export async function deleteLaporan(laporanId) {
  if (!isSupabaseConfigured()) return null;

  // omset_rows, warnings, files akan auto-delete karena ON DELETE CASCADE
  const { error } = await supabase
    .from('laporan')
    .delete()
    .eq('id', laporanId);

  if (error) { console.error('[Supabase] deleteLaporan:', error); throw new Error(error.message); }
  return true;
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD — STATISTIK
// ─────────────────────────────────────────────────────────────

/**
 * Ambil statistik bulanan dari view v_statistik_bulanan
 * @param {number} limit - berapa bulan terakhir
 */
export async function getStatistikBulanan(limit = 6) {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('v_statistik_bulanan')
    .select('*')
    .limit(limit);

  if (error) { console.error('[Supabase] getStatistikBulanan:', error); return null; }
  return data;
}

/**
 * Ambil ringkasan untuk dashboard:
 * - Total laporan bulan ini
 * - Balance vs Unbalance
 * - Total omset bulan ini
 * - Laporan terbaru
 */
export async function getDashboardSummary() {
  if (!isSupabaseConfigured()) return null;

  const thisMonth = new Date().toISOString().slice(0, 7); // "2026-09"
  const startDate = `${thisMonth}-01`;
  const endDate   = `${thisMonth}-31`;

  // Query 1: statistik bulan ini
  const { data: bulanIni } = await supabase
    .from('laporan')
    .select('id, status_balance, total_debit')
    .gte('tanggal', startDate)
    .lte('tanggal', endDate);

  // Query 2: laporan terbaru (5 terakhir)
  const { data: recent } = await supabase
    .from('v_laporan_with_profile')
    .select('id, tanggal, status_balance, total_debit, dibuat_oleh_nama')
    .order('tanggal', { ascending: false })
    .limit(5);

  // Query 3: total laporan all-time
  const { count: totalAllTime } = await supabase
    .from('laporan')
    .select('id', { count: 'exact', head: true });

  const bulanIniList   = bulanIni || [];
  const balanceCount   = bulanIniList.filter(r => r.status_balance === 'Balance').length;
  const unbalanceCount = bulanIniList.filter(r => r.status_balance === 'Unbalance').length;
  const totalOmset     = bulanIniList.reduce((s, r) => s + (Number(r.total_debit) || 0), 0);

  return {
    bulanIni: {
      jumlahLaporan: bulanIniList.length,
      balanceCount,
      unbalanceCount,
      totalOmset,
    },
    totalAllTime: totalAllTime || 0,
    recentLaporan: recent || [],
  };
}

// ─────────────────────────────────────────────────────────────
// PROFILES — USER MANAGEMENT (Admin)
// ─────────────────────────────────────────────────────────────

export async function getProfiles() {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) { console.error('[Supabase] getProfiles:', error); return null; }
  return data;
}

export async function updateProfileRole(userId, role) {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single();

  if (error) { console.error('[Supabase] updateProfileRole:', error); throw new Error(error.message); }
  return data;
}

export async function updateProfileName(userId, full_name) {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name })
    .eq('id', userId)
    .select()
    .single();

  if (error) { console.error('[Supabase] updateProfileName:', error); throw new Error(error.message); }
  return data;
}

export async function createUserInSupabase({ full_name, email, role, password }) {
  if (!isSupabaseConfigured()) return null;

  // 1. Coba panggil RPC Function create_new_user jika tersedia di Supabase DB
  try {
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('create_new_user', {
      user_email: email,
      user_password: password || '12345678',
      user_full_name: full_name,
      user_role: role || 'Staff'
    });

    if (!rpcErr && rpcRes?.success) {
      return { id: rpcRes.id, email, full_name, role, created_at: new Date().toISOString().split('T')[0] };
    }
  } catch (e) {
    console.warn('[Supabase] RPC create_new_user tidak tersedia, menggunakan fallback auth.signUp');
  }

  // 2. Fallback: SignUp via Supabase Auth
  let authUserId = null;
  if (password) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name, role }
        }
      });
      if (authData?.user) {
        authUserId = authData.user.id;
      }
    } catch (e) {
      console.warn('[Supabase] Auth signUp warning:', e);
    }
  }

  const userId = authUserId || `usr-${Date.now()}`;

  // 3. Insert/Upsert ke tabel profiles
  const { data, error } = await supabase
    .from('profiles')
    .upsert([{
      id: userId,
      email,
      full_name,
      role: role || 'Staff',
      updated_at: new Date().toISOString()
    }], { onConflict: 'email' })
    .select()
    .single();

  if (error) {
    console.error('[Supabase] insert profile error:', error);
    return { id: userId, email, full_name, role, created_at: new Date().toISOString().split('T')[0] };
  }

  return data;
}

export async function deleteUserFromSupabase(userId) {
  if (!isSupabaseConfigured()) return true;

  // 1. Coba panggil RPC delete_user_by_admin agar terhapus juga dari auth.users
  try {
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('delete_user_by_admin', {
      target_user_id: userId
    });
    if (!rpcErr && rpcRes?.success) {
      return true;
    }
  } catch (e) {
    console.warn('[Supabase] RPC delete_user_by_admin gagal, fallback ke delete profiles');
  }

  // 2. Fallback: hapus dari tabel profiles
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) {
    console.error('[Supabase] deleteUserFromSupabase error:', error);
    throw new Error(error.message);
  }
  return true;
}

export async function updateUserProfile(userId, { full_name, email, role, password }) {
  if (!isSupabaseConfigured()) return null;

  // 1. Coba panggil RPC update_user_by_admin agar ter-update di auth.users & profiles (termasuk password jika diisi)
  try {
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('update_user_by_admin', {
      target_user_id: userId,
      new_email: email,
      new_full_name: full_name,
      new_role: role,
      new_password: password || null
    });
    if (!rpcErr && rpcRes?.success) {
      return { id: userId, full_name, email, role };
    }
  } catch (e) {
    console.warn('[Supabase] RPC update_user_by_admin gagal, fallback ke update profiles');
  }

  // 2. Fallback: update tabel profiles
  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name, email, role, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] updateUserProfile error:', error);
    throw new Error(error.message);
  }
  return data;
}


// ─────────────────────────────────────────────────────────────
// STORAGE — Upload & Download file Excel output
// ─────────────────────────────────────────────────────────────

/**
 * Upload file Excel hasil generate ke Supabase Storage
 * @param {Blob|Buffer} fileBlob
 * @param {string} laporanId
 * @param {string} tanggal - "31-08-2026"
 */
export async function uploadOutputExcel(fileBlob, laporanId, tanggal) {
  if (!isSupabaseConfigured()) return null;

  const filename = `${laporanId}/Laporan_Gabungan_${tanggal}.xlsx`;

  const { data, error } = await supabase.storage
    .from('laporan-files')
    .upload(filename, fileBlob, {
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      upsert: true,
    });

  if (error) { console.error('[Supabase Storage] upload:', error); return null; }

  // Ambil signed URL (berlaku 7 hari)
  const { data: urlData } = await supabase.storage
    .from('laporan-files')
    .createSignedUrl(filename, 60 * 60 * 24 * 7);

  return urlData?.signedUrl || null;
}

/**
 * Ambil daftar file di storage untuk laporan tertentu
 */
export async function listStorageFiles(laporanId) {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase.storage
    .from('laporan-files')
    .list(laporanId);

  if (error) { console.error('[Supabase Storage] list:', error); return []; }
  return data || [];
}
