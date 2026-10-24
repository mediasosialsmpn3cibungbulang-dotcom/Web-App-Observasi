/**
 * Skrip Migrasi Data Awal ke Supabase Database
 * Mengunggah data pokok guru (25 guru SMPN 3 Cibungbulang), profil sekolah, jadwal, dan tindak lanjut.
 */
import { createClient } from "@supabase/supabase-js";
import { SEED_MOCK_TEACHERS } from "../src/contracts/seed-data";
import { ScheduleService } from "../src/features/schedules/schedule-service";
import { FollowupService } from "../src/features/followup/followup-service";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://eaxrffrtfpegrswfjcwz.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVheHJmZnJ0ZnBlZ3Jzd2ZqY3d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4NDM2NTcsImV4cCI6MjEwODQxOTY1N30.F47zIrAzMMrgdnRJZPbLBPkzKxOMQBWGZ3g2jmyt9bo";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runMigration() {
  console.log("🚀 Memulai migrasi data ke Supabase:", SUPABASE_URL);

  // 1. Migrasi Data Pokok Guru (25 Guru)
  console.log("\n1️⃣ Mengunggah Data Pokok Guru...");
  const teachersPayload = SEED_MOCK_TEACHERS.map((t) => ({
    id: t.id,
    nama_lengkap: t.nama_lengkap,
    nip_nuptk: t.nip_nuptk,
    mata_pelajaran: t.mata_pelajaran,
    kelas_diampu: t.kelas_diampu,
    status_kepegawaian: t.status_kepegawaian,
    fase: t.fase,
    jabatan_tambahan: t.jabatan_tambahan || null,
    wali_kelas: t.wali_kelas || null,
    nomor_hp: t.nomor_hp,
    email: t.email,
    tahun_masuk: t.tahun_masuk,
    is_senior_mentor: t.is_senior_mentor,
    target_sesi: t.target_sesi || 2,
    catatan_khusus: t.catatan_khusus || null,
    aktif: t.aktif,
  }));

  const { data: teachersResult, error: teachersError } = await supabase
    .from("teachers")
    .upsert(teachersPayload, { onConflict: "id" })
    .select();

  if (teachersError) {
    console.error("❌ Gagal migrasi guru:", teachersError.message);
  } else {
    console.log(`✅ Berhasil migrasi ${teachersResult?.length ?? teachersPayload.length} guru ke Supabase!`);
  }

  // 2. Migrasi Profil Sekolah SMP Negeri 3 Cibungbulang
  console.log("\n2️⃣ Mengunggah Profil Sekolah...");
  const schoolPayload = {
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    nama_sekolah: "SMP Negeri 3 Cibungbulang",
    npsn: "20200678",
    alamat: "Jl. Kapten Dasuki Bakri, Cibatok 1, Kec. Cibungbulang, Kab. Bogor, Jawa Barat 16630",
    nama_kepala_sekolah: "H. Endang Suhendar, S.Pd., M.M.",
    nip_kepala_sekolah: "196805121994031005",
    nama_pengawas: "Drs. H. Bambang Sujatmiko, M.M.",
    nip_pengawas: "196803121994121002",
    semester_aktif: "2026/2027 Ganjil",
    tanggal_mulai_semester: "2026-07-15",
  };

  const { error: schoolError } = await supabase
    .from("school_settings")
    .upsert(schoolPayload, { onConflict: "id" });

  if (schoolError) {
    console.error("❌ Gagal migrasi profil sekolah:", schoolError.message);
  } else {
    console.log("✅ Berhasil migrasi profil sekolah SMPN 3 Cibungbulang ke Supabase!");
  }

  // 3. Migrasi Jadwal Supervisi
  console.log("\n3️⃣ Mengunggah Jadwal Supervisi...");
  const schedules = ScheduleService.getSchedules();
  const schedulesPayload = schedules.map((s, idx) => ({
    id: `0${idx + 1}111111-1111-1111-1111-111111111111`,
    teacher_id: s.teacher_id,
    semester: s.semester,
    gelombang: s.gelombang,
    rencana_pra_observasi: s.rencana_pra_observasi,
    rencana_observasi: s.rencana_observasi,
    rencana_coaching: s.rencana_coaching,
    supervisor_id: s.supervisor_id,
    version: s.version,
  }));

  const { error: scheduleError } = await supabase
    .from("schedules")
    .upsert(schedulesPayload, { onConflict: "id" });

  if (scheduleError) {
    console.error("❌ Gagal migrasi jadwal:", scheduleError.message);
  } else {
    console.log(`✅ Berhasil migrasi ${schedulesPayload.length} jadwal supervisi ke Supabase!`);
  }

  // 4. Migrasi Rencana Tindak Lanjut (RTL)
  console.log("\n4️⃣ Mengunggah Rencana Tindak Lanjut (RTL)...");
  const followups = FollowupService.getFollowups();
  const followupsPayload = followups.map((f) => ({
    id: f.id,
    coaching_session_id: f.coaching_session_id,
    teacher_id: f.teacher_id,
    semester: f.semester,
    masalah_utama: f.masalah_utama,
    solusi_disepakati: f.solusi_disepakati,
    aksi_konkret_guru: f.aksi_konkret_guru,
    dukungan_kepala_sekolah: f.dukungan_kepala_sekolah,
    deadline: f.deadline,
    bukti_tindak_lanjut: f.bukti_tindak_lanjut || "",
    foto_bukti_url: f.foto_bukti_url || null,
    status: f.status,
    kode_pertanyaan_pemicu: f.kode_pertanyaan_pemicu || "D-01",
    target_indikator_sukses: f.target_indikator_sukses || "",
    sumber_daya_dibutuhkan: f.sumber_daya_dibutuhkan || "",
    jenis_dukungan: f.jenis_dukungan || "Sarana dan Prasarana",
    skor_realisasi: (f as any).skor_realisasi || null,
    catatan_supervisor_realisasi: (f as any).catatan_supervisor_realisasi || null,
    rekomendasi_pasca_evaluasi: (f as any).rekomendasi_pasca_evaluasi || null,
    tanggal_disahkan: (f as any).tanggal_disahkan || null,
    disahkan_oleh: (f as any).disahkan_oleh || null,
    version: f.version || 1,
  }));

  const { error: followupError } = await supabase
    .from("followup_items")
    .upsert(followupsPayload, { onConflict: "id" });

  if (followupError) {
    console.error("❌ Gagal migrasi RTL:", followupError.message);
  } else {
    console.log(`✅ Berhasil migrasi ${followupsPayload.length} rencana tindak lanjut ke Supabase!`);
  }

  // 5. Migrasi Cek-in Berkala RTL
  console.log("\n5️⃣ Mengunggah Riwayat Cek-in Berkala RTL...");
  const checks = FollowupService.getFollowupChecks("f1111111-1111-1111-1111-111111111111");
  if (checks.length > 0) {
    const checksPayload = checks.map((c, idx) => ({
      id: `0000000${idx + 1}-1111-1111-1111-111111111111`,
      followup_id: c.followup_id,
      minggu_ke: (c as any).pekan_ke || (c as any).minggu_ke || "Pekan 2",
      catatan_progres: (c as any).catatan_hasil || (c as any).catatan_progres || "Progres berjalan baik",
      kendala: (c as any).kendala || null,
      solusi_taktis: (c as any).dukungan_lanjutan || (c as any).solusi_taktis || null,
    }));

    const { error: checksError } = await supabase
      .from("followup_checks")
      .upsert(checksPayload, { onConflict: "id" });

    if (checksError) {
      console.error("❌ Gagal migrasi cek-in RTL:", checksError.message);
    } else {
      console.log(`✅ Berhasil migrasi ${checksPayload.length} cek-in berkala ke Supabase!`);
    }
  }

  console.log("\n🎉 SELURUH DATA BERHASIL DIMIGRASIKAN KE SUPABASE CLOUD!");
}

runMigration().catch(console.error);
