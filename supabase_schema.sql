-- ============================================================
-- LaporGo — Supabase Schema Lengkap (Idempotent Migration)
-- Jalankan seluruh file ini di Supabase SQL Editor
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. TABLE: profiles
--    Extends Supabase Auth users
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       VARCHAR(255) NOT NULL UNIQUE,
    full_name   VARCHAR(255),
    role        VARCHAR(20) NOT NULL DEFAULT 'Staff' CHECK (role IN ('Admin', 'Staff')),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 2. TABLE: laporan
--    Header / summary per laporan harian
-- ============================================================
CREATE TABLE IF NOT EXISTS public.laporan (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tanggal           DATE NOT NULL DEFAULT CURRENT_DATE,
    status_balance    VARCHAR(20) NOT NULL DEFAULT 'Unbalance'
                          CHECK (status_balance IN ('Balance', 'Unbalance')),
    total_debit       NUMERIC(15, 0) NOT NULL DEFAULT 0,
    total_kredit      NUMERIC(15, 0) NOT NULL DEFAULT 0,
    selisih           NUMERIC(15, 0) DEFAULT 0,
    jumlah_transaksi  INT DEFAULT 0,
    dibuat_oleh       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    file_output_url   TEXT,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migrasi: Tambah kolom baru ke tabel `laporan` jika tabel sudah ada dari versi sebelumnya
ALTER TABLE public.laporan ADD COLUMN IF NOT EXISTS jumlah_baris INT DEFAULT 0;
ALTER TABLE public.laporan ADD COLUMN IF NOT EXISTS jumlah_warnings INT DEFAULT 0;
ALTER TABLE public.laporan ADD COLUMN IF NOT EXISTS catatan TEXT;
ALTER TABLE public.laporan ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ============================================================
-- 3. TABLE: omset_rows
--    Baris data OMSET (9 baris per laporan = 23 kolom)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.omset_rows (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    laporan_id              UUID NOT NULL REFERENCES public.laporan(id) ON DELETE CASCADE,
    no                      SMALLINT NOT NULL,
    nama_ref                VARCHAR(100),
    jenis_transaksi         VARCHAR(100),
    kwitansi                VARCHAR(50),
    keterangan              VARCHAR(255),
    -- Kolom Debit
    tag_promo               NUMERIC(15, 0) DEFAULT 0,
    giro_udp                NUMERIC(15, 0) DEFAULT 0,
    piutang                 NUMERIC(15, 0) DEFAULT 0,
    beban_toko              NUMERIC(15, 0) DEFAULT 0,
    beban_logo              NUMERIC(15, 0) DEFAULT 0,
    kas_uks                 NUMERIC(15, 0) DEFAULT 0,
    piutang_padi            NUMERIC(15, 0) DEFAULT 0,
    piutang_edc             NUMERIC(15, 0) DEFAULT 0,
    beban_promosi           NUMERIC(15, 0) DEFAULT 0,
    -- Kolom Kredit
    pendapatan_toko         NUMERIC(15, 0) DEFAULT 0,
    pendapatan_logo         NUMERIC(15, 0) DEFAULT 0,
    pendapatan_kerjasama    NUMERIC(15, 0) DEFAULT 0,
    non_pajak               NUMERIC(15, 0) DEFAULT 0,
    ppn_pk                  NUMERIC(15, 0) DEFAULT 0,
    ppn_wapu                NUMERIC(15, 0) DEFAULT 0,
    persediaan_toko         NUMERIC(15, 0) DEFAULT 0,
    persediaan_logo         NUMERIC(15, 0) DEFAULT 0,
    simsem_uks              NUMERIC(15, 0) DEFAULT 0,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 4. TABLE: laporan_files
--    File sumber yang diupload per laporan
-- ============================================================
CREATE TABLE IF NOT EXISTS public.laporan_files (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    laporan_id      UUID NOT NULL REFERENCES public.laporan(id) ON DELETE CASCADE,
    nama_file       VARCHAR(255) NOT NULL,
    kategori        VARCHAR(50) NOT NULL DEFAULT 'omi',
    ukuran_bytes    BIGINT DEFAULT 0,
    storage_path    TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.laporan_files ADD COLUMN IF NOT EXISTS kategori VARCHAR(50) DEFAULT 'omi';
ALTER TABLE public.laporan_files ADD COLUMN IF NOT EXISTS ukuran_bytes BIGINT DEFAULT 0;

-- ============================================================
-- 5. TABLE: laporan_warnings
--    Peringatan validasi silang per laporan
-- ============================================================
CREATE TABLE IF NOT EXISTS public.laporan_warnings (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    laporan_id  UUID NOT NULL REFERENCES public.laporan(id) ON DELETE CASCADE,
    type        VARCHAR(50) NOT NULL,
    severity    VARCHAR(10) NOT NULL DEFAULT 'WARNING',
    message     TEXT NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_laporan_tanggal      ON public.laporan(tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_laporan_dibuat_oleh  ON public.laporan(dibuat_oleh);
CREATE INDEX IF NOT EXISTS idx_laporan_status       ON public.laporan(status_balance);
CREATE INDEX IF NOT EXISTS idx_omset_rows_laporan   ON public.omset_rows(laporan_id, no);
CREATE INDEX IF NOT EXISTS idx_laporan_files_laporan ON public.laporan_files(laporan_id);
CREATE INDEX IF NOT EXISTS idx_warnings_laporan     ON public.laporan_warnings(laporan_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laporan          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omset_rows       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laporan_files    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laporan_warnings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (idempotent)
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

DROP POLICY IF EXISTS "laporan_select" ON public.laporan;
DROP POLICY IF EXISTS "laporan_insert" ON public.laporan;
DROP POLICY IF EXISTS "laporan_update" ON public.laporan;
DROP POLICY IF EXISTS "laporan_delete" ON public.laporan;
DROP POLICY IF EXISTS "Laporan viewable by authenticated users" ON public.laporan;
DROP POLICY IF EXISTS "Laporan insertable by authenticated users" ON public.laporan;

DROP POLICY IF EXISTS "omset_rows_select" ON public.omset_rows;
DROP POLICY IF EXISTS "omset_rows_insert" ON public.omset_rows;
DROP POLICY IF EXISTS "omset_rows_delete" ON public.omset_rows;

DROP POLICY IF EXISTS "laporan_files_select" ON public.laporan_files;
DROP POLICY IF EXISTS "laporan_files_insert" ON public.laporan_files;

DROP POLICY IF EXISTS "laporan_warnings_select" ON public.laporan_warnings;
DROP POLICY IF EXISTS "laporan_warnings_insert" ON public.laporan_warnings;

-- Re-create Policies
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "laporan_select" ON public.laporan FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "laporan_insert" ON public.laporan FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "laporan_update" ON public.laporan FOR UPDATE USING (dibuat_oleh = auth.uid() OR auth.role() = 'authenticated');

CREATE POLICY "omset_rows_select" ON public.omset_rows FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "omset_rows_insert" ON public.omset_rows FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "laporan_files_select" ON public.laporan_files FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "laporan_files_insert" ON public.laporan_files FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "laporan_warnings_select" ON public.laporan_warnings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "laporan_warnings_insert" ON public.laporan_warnings FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- TRIGGER: auto-create profile saat user signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        COALESCE(new.raw_user_meta_data->>'role', 'Staff')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- VIEWS: untuk query dashboard & riwayat
-- ============================================================

-- Drop views if exist
DROP VIEW IF EXISTS public.v_laporan_with_profile CASCADE;
DROP VIEW IF EXISTS public.v_statistik_bulanan CASCADE;

-- View: laporan dengan info pembuat
CREATE VIEW public.v_laporan_with_profile AS
SELECT
    l.id,
    l.tanggal,
    l.status_balance,
    l.total_debit,
    l.total_kredit,
    l.selisih,
    COALESCE(l.jumlah_baris, 0) AS jumlah_baris,
    COALESCE(l.jumlah_warnings, 0) AS jumlah_warnings,
    l.catatan,
    l.file_output_url,
    l.created_at,
    l.updated_at,
    p.full_name  AS dibuat_oleh_nama,
    p.email      AS dibuat_oleh_email,
    p.role       AS dibuat_oleh_role
FROM public.laporan l
LEFT JOIN public.profiles p ON l.dibuat_oleh = p.id
ORDER BY l.tanggal DESC, l.created_at DESC;

-- View: statistik per bulan
CREATE VIEW public.v_statistik_bulanan AS
SELECT
    TO_CHAR(tanggal, 'YYYY-MM')       AS bulan,
    COUNT(*)                           AS jumlah_laporan,
    SUM(CASE WHEN status_balance = 'Balance' THEN 1 ELSE 0 END)   AS balance_count,
    SUM(CASE WHEN status_balance = 'Unbalance' THEN 1 ELSE 0 END) AS unbalance_count,
    SUM(total_debit)                   AS total_omset,
    AVG(total_debit)                   AS rata_omset_harian
FROM public.laporan
GROUP BY TO_CHAR(tanggal, 'YYYY-MM')
ORDER BY bulan DESC;
