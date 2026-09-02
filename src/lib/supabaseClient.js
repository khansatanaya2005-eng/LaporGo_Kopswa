import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return (
    Boolean(supabaseUrl) && 
    Boolean(supabaseAnonKey) && 
    !supabaseUrl.includes('your-supabase-project') &&
    !supabaseAnonKey.includes('your-anon-key')
  );
};

export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-key'
);

// --- Database Helper Functions ---

/**
 * Fetch list of recent reports from table `laporan`
 */
export async function getLaporanList(limit = 10) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('laporan')
    .select(`
      *,
      profiles:dibuat_oleh (full_name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching laporan:', error);
    return null;
  }
  return data;
}

/**
 * Insert a new report into Supabase table `laporan`
 */
export async function saveLaporanToSupabase(laporanData, fileList = []) {
  if (!isSupabaseConfigured()) return null;
  
  const { data: { user } } = await supabase.auth.getUser();
  
  // 1. Insert header laporan
  const { data: laporanInserted, error: errLaporan } = await supabase
    .from('laporan')
    .insert([
      {
        tanggal: laporanData.tanggal || new Date().toISOString().split('T')[0],
        status_balance: laporanData.summary.statusBalance,
        total_debit: laporanData.summary.totalDebit,
        total_kredit: laporanData.summary.totalKredit,
        selisih: laporanData.summary.selisih,
        jumlah_transaksi: laporanData.summary.jumlahTransaksi,
        dibuat_oleh: user?.id || null,
        file_output_url: laporanData.file_output_url || null
      }
    ])
    .select()
    .single();

  if (errLaporan) {
    console.error('Error saving laporan:', errLaporan);
    return null;
  }

  // 2. Insert uploaded file records into `laporan_files`
  if (fileList.length > 0 && laporanInserted) {
    const fileRecords = fileList.map(f => ({
      laporan_id: laporanInserted.id,
      nama_file: f.name,
      tipe: f.type,
      storage_path: f.storage_path || `laporan-files/${laporanInserted.id}/${f.name}`
    }));

    await supabase.from('laporan_files').insert(fileRecords);
  }

  return laporanInserted;
}

/**
 * Fetch user profiles list (for Admin management)
 */
export async function getProfiles() {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching profiles:', error);
    return null;
  }
  return data;
}

