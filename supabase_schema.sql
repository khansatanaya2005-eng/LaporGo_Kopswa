-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: profiles (Extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'Staff' CHECK (role IN ('Admin', 'Staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table: laporan
CREATE TABLE IF NOT EXISTS public.laporan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    status_balance VARCHAR(20) NOT NULL CHECK (status_balance IN ('Balance', 'Unbalance')),
    total_debit NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_kredit NUMERIC(15, 2) NOT NULL DEFAULT 0,
    selisih NUMERIC(15, 2) DEFAULT 0,
    jumlah_transaksi INT DEFAULT 0,
    dibuat_oleh UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    file_output_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table: laporan_files
CREATE TABLE IF NOT EXISTS public.laporan_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    laporan_id UUID NOT NULL REFERENCES public.laporan(id) ON DELETE CASCADE,
    nama_file VARCHAR(255) NOT NULL,
    tipe VARCHAR(20) NOT NULL CHECK (tipe IN ('omi', 'smart')),
    storage_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laporan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laporan_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies Example
-- Profiles: readable by authenticated users, editable by user or Admin
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Laporan: viewable and insertable by authenticated users
CREATE POLICY "Laporan viewable by authenticated users" 
ON public.laporan FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Laporan insertable by authenticated users" 
ON public.laporan FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Trigger to auto-create profile on Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', COALESCE(new.raw_user_meta_data->>'role', 'Staff'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Supabase Storage Buckets Setup Note:
-- Create a public or private bucket named `laporan-files` in Supabase Storage UI.
