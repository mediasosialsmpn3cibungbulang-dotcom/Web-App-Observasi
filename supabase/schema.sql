-- ==============================================================================
-- SKEMA DATABASE SUPABASE: SMART SUPERVISI & COACHING GURU
-- SMP NEGERI 3 CIBUNGBULANG
-- ==============================================================================

-- 1. TABEL DATA POKOK GURU (teachers)
create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  nama_lengkap text not null,
  nip_nuptk text not null,
  mata_pelajaran text not null,
  kelas_diampu text not null,
  status_kepegawaian text not null default 'ASN',
  fase text not null default 'Fase D (Kelas VII, VIII, IX)',
  jabatan_tambahan text,
  wali_kelas text,
  nomor_hp text not null default '081234567890',
  email text not null default 'guru@smpn3cibungbulang.sch.id',
  tahun_masuk integer not null default 2020,
  is_senior_mentor boolean default false,
  target_sesi integer default 2,
  catatan_khusus text,
  aktif boolean default true,
  created_at timestamp with time zone default now()
);

-- 2. TABEL RENCANA TINDAK LANJUT / RTL (followup_items)
create table if not exists public.followup_items (
  id uuid primary key default gen_random_uuid(),
  coaching_session_id text not null,
  teacher_id uuid references public.teachers(id) on delete cascade,
  semester text not null,
  masalah_utama text not null default '',
  solusi_disepakati text not null default '',
  aksi_konkret_guru text not null default '',
  dukungan_kepala_sekolah text not null default '',
  deadline text not null default '',
  bukti_tindak_lanjut text default '',
  foto_bukti_url text,
  status text not null default 'Belum Dimulai',
  kode_pertanyaan_pemicu text default 'D-01',
  target_indikator_sukses text default '',
  sumber_daya_dibutuhkan text default '',
  jenis_dukungan text default 'Sarana dan Prasarana',
  skor_realisasi integer,
  catatan_supervisor_realisasi text,
  rekomendasi_pasca_evaluasi text,
  tanggal_disahkan text,
  disahkan_oleh text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  version integer default 1
);

-- 3. TABEL CEK-IN BERKALA RTL (followup_checks)
create table if not exists public.followup_checks (
  id uuid primary key default gen_random_uuid(),
  followup_id uuid references public.followup_items(id) on delete cascade,
  minggu_ke text not null,
  catatan_progres text not null,
  kendala text,
  solusi_taktis text,
  created_at timestamp with time zone default now()
);

-- 4. TABEL JADWAL SUPERVISI (schedules)
create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references public.teachers(id) on delete cascade,
  semester text not null,
  gelombang text default '2 Reguler',
  rencana_pra_observasi date,
  rencana_observasi date,
  rencana_coaching date,
  supervisor_id uuid,
  created_at timestamp with time zone default now(),
  version integer default 1
);

-- 5. TABEL PENGATURAN SEKOLAH (school_settings)
create table if not exists public.school_settings (
  id uuid primary key default gen_random_uuid(),
  nama_sekolah text not null default 'SMP Negeri 3 Cibungbulang',
  npsn text not null default '20200000',
  alamat text not null default 'Jl. Raya Cibungbulang, Kab. Bogor',
  nama_kepala_sekolah text not null default 'Kepala Sekolah, M.Pd.',
  nip_kepala_sekolah text not null default '197501012000011001',
  nama_pengawas text,
  nip_pengawas text,
  logo_url text,
  kop_surat_url text,
  semester_aktif text not null default '2026/2027 Ganjil',
  tanggal_mulai_semester date default current_date,
  updated_at timestamp with time zone default now()
);

-- ==============================================================================
-- KEBIJAKAN AKSES KEAMANAN (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

alter table public.teachers enable row level security;
create policy "Akses Publik Teachers Select" on public.teachers for select using (true);
create policy "Akses Publik Teachers Insert" on public.teachers for insert with check (true);
create policy "Akses Publik Teachers Update" on public.teachers for update using (true);
create policy "Akses Publik Teachers Delete" on public.teachers for delete using (true);

alter table public.followup_items enable row level security;
create policy "Akses Publik Followup Select" on public.followup_items for select using (true);
create policy "Akses Publik Followup Insert" on public.followup_items for insert with check (true);
create policy "Akses Publik Followup Update" on public.followup_items for update using (true);
create policy "Akses Publik Followup Delete" on public.followup_items for delete using (true);

alter table public.followup_checks enable row level security;
create policy "Akses Publik Checks Select" on public.followup_checks for select using (true);
create policy "Akses Publik Checks Insert" on public.followup_checks for insert with check (true);
create policy "Akses Publik Checks Update" on public.followup_checks for update using (true);
create policy "Akses Publik Checks Delete" on public.followup_checks for delete using (true);

alter table public.schedules enable row level security;
create policy "Akses Publik Schedules Select" on public.schedules for select using (true);
create policy "Akses Publik Schedules Insert" on public.schedules for insert with check (true);
create policy "Akses Publik Schedules Update" on public.schedules for update using (true);
create policy "Akses Publik Schedules Delete" on public.schedules for delete using (true);

alter table public.school_settings enable row level security;
create policy "Akses Publik Settings Select" on public.school_settings for select using (true);
create policy "Akses Publik Settings Insert" on public.school_settings for insert with check (true);
create policy "Akses Publik Settings Update" on public.school_settings for update using (true);
create policy "Akses Publik Settings Delete" on public.school_settings for delete using (true);
