import { z } from "zod";
import {
  RoleSchema,
  EmploymentStatusSchema,
  LearningPhaseSchema,
  AspectCodeSchema,
  PredicateSchema,
  SupervisionStatusSchema,
  SessionStatusSchema,
  FollowupStatusSchema,
  QuestionCategorySchema,
  ChecklistStatusSchema,
  TrendSchema,
  TargetStatusSchema,
  FindingUrgencySchema,
  RTLSupportTypeSchema,
  SelfMonitoringPeriodSchema,
} from "./enums";

/**
 * Profil pengguna akun aplikasi
 */
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  nama: z.string().min(1, "Nama wajib diisi"),
  peran: RoleSchema,
  teacher_id: z.string().uuid().nullable().optional(),
  aktif: z.boolean().default(true),
  created_at: z.string().datetime(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

/**
 * Pengaturan identitas dan profil sekolah
 */
export const SchoolSettingsSchema = z.object({
  id: z.string().uuid(),
  nama_sekolah: z.string().min(1, "Nama sekolah wajib diisi"),
  npsn: z.string().regex(/^\d{8}$/, "NPSN harus 8 digit angka"),
  alamat: z.string().min(1, "Alamat sekolah wajib diisi"),
  nama_kepala_sekolah: z.string().min(1, "Nama kepala sekolah wajib diisi"),
  nip_kepala_sekolah: z.string().min(1, "NIP kepala sekolah wajib diisi"),
  nama_pengawas: z.string().optional(),
  nip_pengawas: z.string().optional(),
  logo_url: z.string().url().nullable().optional(),
  kop_surat_url: z.string().url().nullable().optional(),
  semester_aktif: z.string().regex(/^\d{4}\/\d{4} (Ganjil|Genap)$/, "Format semester: YYYY/YYYY (Ganjil|Genap)"),
  tanggal_mulai_semester: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal: YYYY-MM-DD"),
  updated_at: z.string().datetime(),
});
export type SchoolSettings = z.infer<typeof SchoolSettingsSchema>;

/**
 * Pengaturan standar skoring dan ambang batas evaluasi
 */
export const GradingSettingsSchema = z.object({
  id: z.string().uuid(),
  ambang_amat_baik: z.number().min(0).max(100).default(90),
  ambang_baik: z.number().min(0).max(100).default(75),
  ambang_cukup: z.number().min(0).max(100).default(60),
  ambang_aspek_prioritas: z.number().min(1).max(4).default(3.0),
  target_default: z.number().min(0).max(100).default(80),
  toleransi_tren_stagnan: z.number().min(0).max(10).default(2.0),
  batas_nilai_prioritas: z.number().min(0).max(100).default(70),
  updated_at: z.string().datetime(),
});
export type GradingSettings = z.infer<typeof GradingSettingsSchema>;

/**
 * Data pokok guru dalam database sekolah
 */
export const TeacherSchema = z.object({
  id: z.string().uuid(),
  nama_lengkap: z.string().min(1, "Nama lengkap beserta gelar wajib diisi"),
  nip_nuptk: z.string().regex(/^\d{15,18}$/, "NIP/NUPTK harus berupa 15-18 digit angka"),
  mata_pelajaran: z.string().min(1, "Mata pelajaran wajib diisi"),
  kelas_diampu: z.string().min(1, "Kelas yang diampu wajib diisi"),
  status_kepegawaian: EmploymentStatusSchema,
  fase: LearningPhaseSchema,
  jabatan_tambahan: z.string().nullable().optional(),
  wali_kelas: z.string().nullable().optional(),
  nomor_hp: z.string().min(10, "Nomor HP minimal 10 digit").max(16),
  email: z.string().email(),
  tahun_masuk: z.number().int().min(1970).max(2100),
  is_senior_mentor: z.boolean().default(false),
  target_sesi: z.number().int().min(1).max(10).nullable().optional(),
  catatan_khusus: z.string().nullable().optional(),
  aktif: z.boolean().default(true),
  created_at: z.string().datetime(),
});
export type Teacher = z.infer<typeof TeacherSchema>;

/**
 * 28 Indikator observasi kelas dalam 7 aspek
 */
export const IndicatorSchema = z.object({
  kode: z.string().regex(/^[A-G][1-4]$/, "Kode indikator contoh: A1, B3"),
  aspek: AspectCodeSchema,
  nomor_urut: z.number().int().min(1).max(4),
  pernyataan: z.string().min(1),
  panduan_skor: z.object({
    skor_1: z.string(),
    skor_2: z.string(),
    skor_3: z.string(),
    skor_4: z.string(),
  }),
});
export type Indicator = z.infer<typeof IndicatorSchema>;

/**
 * Bank pertanyaan percakapan coaching
 */
export const CoachingQuestionSchema = z.object({
  kode: z.string().regex(/^[A-G]-\d{2}$/, "Kode contoh: A-01, G-05"),
  kategori: QuestionCategorySchema,
  pertanyaan: z.string().min(1),
  tujuan: z.string().min(1),
  kapan_efektif: z.string().min(1),
  is_default: z.boolean().default(true),
  jumlah_dipakai: z.number().int().min(0).default(0),
});
export type CoachingQuestion = z.infer<typeof CoachingQuestionSchema>;

/**
 * Jadwal rencana dan realisasi supervisi guru
 */
export const ScheduleSchema = z.object({
  id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  semester: z.string(),
  gelombang: z.enum(["1 Prioritas", "2 Reguler"]).default("2 Reguler"),
  rencana_pra_observasi: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  rencana_observasi: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  rencana_coaching: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  supervisor_id: z.string().uuid(),
  jam_observasi: z.string().nullable().optional(),
  kelas_observasi: z.string().nullable().optional(),
  mapel_observasi: z.string().nullable().optional(),
  hari_observasi: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  version: z.number().int().default(1),
});
export type Schedule = z.infer<typeof ScheduleSchema>;

/**
 * Formulir dan berita acara pra-observasi
 */
export const PreObservationSchema = z.object({
  id: z.string().uuid(),
  schedule_id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  supervisor_id: z.string().uuid(),
  semester: z.string(),
  tanggal_pelaksanaan: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  // Rencana pembelajaran (oleh Guru)
  topik_pembelajaran: z.string().min(1),
  tujuan_pembelajaran: z.string().min(1),
  metode_pembelajaran: z.string().min(1),
  media_alat: z.string().min(1),
  teknik_asesmen: z.string().min(1),
  alokasi_waktu: z.string().min(1),
  // Karakteristik & tantangan kelas (oleh Guru)
  jumlah_siswa: z.number().int().positive(),
  karakteristik_siswa: z.string().min(1),
  tantangan_dihadapi: z.string().min(1),
  rencana_diferensiasi: z.string().min(1),
  harapan_guru: z.string().min(1),
  // Fokus amatan bersama (maksimal 5 baris)
  fokus_amatan: z.array(
    z.object({
      aspek: AspectCodeSchema,
      indikator_sukses: z.string().min(1),
      catatan_khusus: z.string().optional(),
    })
  ).min(1).max(5),
  status: SessionStatusSchema.default("Draf"),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  version: z.number().int().default(1),
});
export type PreObservation = z.infer<typeof PreObservationSchema>;

/**
 * Sesi observasi kelas
 */
export const ObservationSchema = z.object({
  id: z.string().uuid(),
  schedule_id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  supervisor_id: z.string().uuid(),
  semester: z.string(),
  sesi_ke: z.number().int().positive(),
  tanggal_observasi: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  jam_mulai: z.string().regex(/^\d{2}:\d{2}$/),
  jam_selesai: z.string().regex(/^\d{2}:\d{2}$/),
  kelas: z.string().min(1),
  jumlah_siswa_hadir: z.number().int().nonnegative(),
  catatan_umum: z.string().optional(),
  status: SessionStatusSchema.default("Draf"),
  is_locked: z.boolean().default(false),
  alasan_buka_kunci: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  version: z.number().int().default(1),
});
export type Observation = z.infer<typeof ObservationSchema>;

/**
 * Butir skor per indikator observasi (28 indikator)
 */
export const ObservationScoreItemSchema = z.object({
  observation_id: z.string().uuid(),
  kode_indikator: z.string().regex(/^[A-G][1-4]$/),
  skor: z.number().int().min(1).max(4),
  bukti_nyata: z.string().default(""),
  catatan: z.string().optional(),
});
export type ObservationScoreItem = z.infer<typeof ObservationScoreItemSchema>;

/**
 * Catatan fakta langsung saat observasi di kelas
 */
export const FactNoteSchema = z.object({
  id: z.string().uuid(),
  observation_id: z.string().uuid(),
  menit_ke: z.number().int().nonnegative(),
  fakta_terlihat: z.string().min(1, "Fakta teramati wajib diisi"),
  ucapan_guru_verbatim: z.string().optional(),
  respons_ucapan_siswa: z.string().optional(),
  jumlah_siswa_terlibat: z.number().int().nonnegative().optional(),
  bukti_artefak_teks: z.string().optional(),
  foto_artefak_url: z.string().url().nullable().optional(),
  dampak_pembelajaran: z.string().optional(),
  kode_indikator_tertaut: z.string().regex(/^[A-G][1-4]$/).nullable().optional(),
  created_at: z.string().datetime(),
});
export type FactNote = z.infer<typeof FactNoteSchema>;

/**
 * Sesi percakapan coaching
 */
export const CoachingSessionSchema = z.object({
  id: z.string().uuid(),
  observation_id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  supervisor_id: z.string().uuid(),
  semester: z.string(),
  tanggal_coaching: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  waktu_mulai: z.string().regex(/^\d{2}:\d{2}$/),
  tempat: z.string().min(1),
  nomor_dokumen: z.string().min(1),
  // Refleksi guru mandiri (Doc 5 bagian A)
  refleksi_guru: z.object({
    hal_sudah_baik: z.string().optional(),
    hal_perlu_ditingkatkan: z.string().optional(),
    tantangan_terbesar: z.string().optional(),
    perasaan_setelah_mengajar: z.string().optional(),
  }).optional(),
  // Temuan supervisor per 7 aspek (Doc 5 bagian B)
  temuan_aspek: z.record(AspectCodeSchema, z.string()).optional(),
  // Inti percakapan
  poin_kunci_dialog: z.string().default(""),
  insight_utama_guru: z.string().default(""),
  komitmen_utama_guru: z.string().default(""),
  rencana_monitoring_berikutnya: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  catatan_supervisor: z.string().optional(),
  status: SessionStatusSchema.default("Draf"),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  version: z.number().int().default(1),
});
export type CoachingSession = z.infer<typeof CoachingSessionSchema>;

/**
 * Pertanyaan coaching yang dipilih dalam suatu sesi
 */
export const CoachingSessionQuestionItemSchema = z.object({
  session_id: z.string().uuid(),
  kode_pertanyaan: z.string().regex(/^[A-G]-\d{2}$/),
  urutan: z.number().int().positive(),
  jawaban_ringkas_guru: z.string().default(""),
});
export type CoachingSessionQuestionItem = z.infer<typeof CoachingSessionQuestionItemSchema>;

/**
 * Kesepakatan tindak lanjut dan Rencana Tindak Lanjut (RTL) guru
 */
export const FollowupItemSchema = z.object({
  id: z.string().uuid(),
  coaching_session_id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  semester: z.string(),
  masalah_utama: z.string().default(""),
  solusi_disepakati: z.string().default(""),
  aksi_konkret_guru: z.string().default(""),
  dukungan_kepala_sekolah: z.string().default(""),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  bukti_tindak_lanjut: z.string().optional(),
  foto_bukti_url: z.string().url().nullable().optional(),
  status: FollowupStatusSchema.default("Belum Dimulai"),
  kode_pertanyaan_pemicu: z.string().optional(),
  // Bagian tambahan RTL mandiri Guru
  target_indikator_sukses: z.string().optional(),
  sumber_daya_dibutuhkan: z.string().optional(),
  jenis_dukungan: RTLSupportTypeSchema.optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  version: z.number().int().default(1),
});
export type FollowupItem = z.infer<typeof FollowupItemSchema>;

/**
 * Cek berkala tindak lanjut (pekan ke-2, 4, 8/9)
 */
export const FollowupCheckSchema = z.object({
  id: z.string().uuid(),
  followup_id: z.string().uuid(),
  pekan_ke: z.enum(["2", "4", "8", "9"]),
  tanggal_cek: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  kode_pertanyaan_g: z.string().regex(/^G-\d{2}$/),
  catatan_hasil: z.string().min(1),
  dukungan_lanjutan: z.string().optional(),
  created_at: z.string().datetime(),
});
export type FollowupCheck = z.infer<typeof FollowupCheckSchema>;

/**
 * Refleksi komitmen akhir guru
 */
export const TeacherReflectionSchema = z.object({
  id: z.string().uuid(),
  coaching_session_id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  insight_terpenting: z.string().min(1),
  kekuatan_dikembangkan: z.string().min(1),
  perubahan_terpenting: z.string().min(1),
  komitmen_pribadi: z.string().min(1),
  created_at: z.string().datetime(),
});
export type TeacherReflection = z.infer<typeof TeacherReflectionSchema>;

/**
 * Target pencapaian kinerja individu guru per semester
 */
export const TeacherTargetSchema = z.object({
  id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  semester: z.string(),
  target_khusus: z.number().min(0).max(100).nullable().optional(),
  fokus_pengembangan: z.string().optional(),
  strategi_dukungan: z.string().optional(),
  batas_waktu: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  catatan: z.string().optional(),
  updated_at: z.string().datetime(),
});
export type TeacherTarget = z.infer<typeof TeacherTargetSchema>;

/**
 * Program tindak lanjut institusi sekolah
 */
export const SchoolProgramSchema = z.object({
  id: z.string().uuid(),
  semester: z.string(),
  nama_program: z.string().min(1),
  deskripsi: z.string().min(1),
  sasaran_guru: z.string().min(1),
  waktu_pelaksanaan: z.string().min(1),
  penanggung_jawab: z.string().min(1),
  status: z.enum(["Rencana", "Berjalan", "Selesai"]).default("Rencana"),
});
export type SchoolProgram = z.infer<typeof SchoolProgramSchema>;

/**
 * Narasi evaluasi resmi laporan supervisi akademik (Bab I s.d. IV)
 */
export const ReportNarrativeSchema = z.object({
  id: z.string().uuid(),
  semester: z.string(),
  latar_belakang: z.string().min(1),
  tujuan: z.string().min(1),
  kekuatan_umum_sekolah: z.string().min(1),
  masalah_dominan_sekolah: z.string().min(1),
  rekomendasi_semester_berikutnya: z.string().min(1),
  updated_at: z.string().datetime(),
});
export type ReportNarrative = z.infer<typeof ReportNarrativeSchema>;

/**
 * Item 29 kegiatan checklist supervisi semesteran
 */
export const ChecklistItemSchema = z.object({
  id: z.string().uuid(),
  semester: z.string(),
  nomor_kode: z.string().regex(/^\d\.\d$/), // contoh: 1.1, 3.2
  fase_nama: z.string().min(1),
  kegiatan: z.string().min(1),
  dokumen_dihasilkan: z.string().min(1),
  pic_peran: z.string().min(1),
  deadline_deskripsi: z.string().min(1),
  tanggal_deadline_aktual: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  durasi_estimasi: z.string().min(1),
  status: ChecklistStatusSchema.default("Belum"),
  keterangan: z.string().optional(),
  is_auto_detected: z.boolean().default(false),
  updated_at: z.string().datetime(),
});
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;

/**
 * Jejak audit aktivitas keamanan dan perubahan data kritis
 */
export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  actor_id: z.string().uuid(),
  actor_email: z.string().email(),
  aksi: z.string().min(1),
  entitas: z.string().min(1),
  entitas_id: z.string(),
  nilai_sebelum: z.record(z.unknown()).nullable().optional(),
  nilai_sesudah: z.record(z.unknown()).nullable().optional(),
  request_id: z.string(),
});
export type AuditLog = z.infer<typeof AuditLogSchema>;

/**
 * Pencatatan dokumen cetak resmi
 */
export const DocumentLogSchema = z.object({
  id: z.string().uuid(),
  jenis_dokumen: z.string().min(1),
  nomor_dokumen: z.string().min(1),
  dicetak_oleh_id: z.string().uuid(),
  dicetak_pada: z.string().datetime(),
});
export type DocumentLog = z.infer<typeof DocumentLogSchema>;
