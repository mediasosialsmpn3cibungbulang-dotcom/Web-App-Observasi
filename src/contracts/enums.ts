import { z } from "zod";

/**
 * Enumerasi peran pengguna dalam aplikasi
 */
export const RoleSchema = z.enum([
  "admin",
  "supervisor",
  "operator",
  "guru",
  "pengawas",
]);
export type Role = z.infer<typeof RoleSchema>;

/**
 * Status kepegawaian guru sesuai data kepegawaian sekolah
 */
export const EmploymentStatusSchema = z.enum([
  "ASN",
  "PPPK",
  "GTY",
  "GTT",
  "Honorer",
  "Lainnya",
]);
export type EmploymentStatus = z.infer<typeof EmploymentStatusSchema>;

/**
 * Fase kurikulum merdeka (Fase A s.d. Fase F)
 */
export const LearningPhaseSchema = z.enum(["A", "B", "C", "D", "E", "F"]);
export type LearningPhase = z.infer<typeof LearningPhaseSchema>;

/**
 * Kode 7 aspek observasi kelas
 */
export const AspectCodeSchema = z.enum(["A", "B", "C", "D", "E", "F", "G"]);
export type AspectCode = z.infer<typeof AspectCodeSchema>;

/**
 * Predikat hasil evaluasi observasi
 */
export const PredicateSchema = z.enum([
  "Amat Baik",
  "Baik",
  "Cukup",
  "Perlu Pembinaan",
]);
export type Predicate = z.infer<typeof PredicateSchema>;

/**
 * Status siklus supervisi guru per semester
 */
export const SupervisionStatusSchema = z.enum([
  "Belum Mulai",
  "Dalam Proses",
  "Selesai",
]);
export type SupervisionStatus = z.infer<typeof SupervisionStatusSchema>;

/**
 * Status sesi observasi atau coaching
 */
export const SessionStatusSchema = z.enum(["Draf", "Final"]);
export type SessionStatus = z.infer<typeof SessionStatusSchema>;

/**
 * Status kesepakatan tindak lanjut
 */
export const FollowupStatusSchema = z.enum([
  "Selesai",
  "Berjalan",
  "Pending",
  "Belum Dimulai",
]);
export type FollowupStatus = z.infer<typeof FollowupStatusSchema>;

/**
 * Kategori bank pertanyaan coaching (A s.d. G)
 */
export const QuestionCategorySchema = z.enum([
  "A", // Reflektif
  "B", // Eksplorasi
  "C", // Strategi
  "D", // Komitmen
  "E", // Apresiasi
  "F", // Situasi Khusus
  "G", // Monitoring
]);
export type QuestionCategory = z.infer<typeof QuestionCategorySchema>;

/**
 * Status item kegiatan checklist semester
 */
export const ChecklistStatusSchema = z.enum([
  "Selesai",
  "Berjalan",
  "Belum",
  "Tidak Berlaku",
]);
export type ChecklistStatus = z.infer<typeof ChecklistStatusSchema>;

/**
 * Tren perkembangan nilai guru
 */
export const TrendSchema = z.enum(["Meningkat", "Stagnan", "Menurun"]);
export type Trend = z.infer<typeof TrendSchema>;

/**
 * Status pencapaian target guru
 */
export const TargetStatusSchema = z.enum([
  "Tercapai",
  "Belum Tercapai",
  "Belum Ada Data",
]);
export type TargetStatus = z.infer<typeof TargetStatusSchema>;

/**
 * Derajat urgensi temuan supervisi
 */
export const FindingUrgencySchema = z.enum([
  "Sedang",
  "Kritis",
  "Sangat Kritis",
]);
export type FindingUrgency = z.infer<typeof FindingUrgencySchema>;

/**
 * Jenis dukungan yang dibutuhkan untuk RTL guru
 */
export const RTLSupportTypeSchema = z.enum([
  "Waktu dan Penjadwalan",
  "Sumber Belajar atau Referensi",
  "Pendampingan Langsung",
  "Sarana dan Prasarana",
  "Kolaborasi dengan Rekan Guru",
]);
export type RTLSupportType = z.infer<typeof RTLSupportTypeSchema>;

/**
 * Periode monitoring mandiri guru
 */
export const SelfMonitoringPeriodSchema = z.enum([
  "2 Minggu ke-1",
  "2 Minggu ke-2",
  "1 Bulan",
  "Akhir Semester",
]);
export type SelfMonitoringPeriod = z.infer<typeof SelfMonitoringPeriodSchema>;

/**
 * Label nama aspek observasi resmi
 */
export const ASPECT_NAMES: Record<AspectCode, string> = {
  A: "Pembukaan",
  B: "Penyampaian Materi",
  C: "Interaksi Guru-Siswa",
  D: "Diferensiasi Pembelajaran",
  E: "Asesmen dalam Proses",
  F: "Pengelolaan Kelas",
  G: "Penutup",
};
