import { AspectCode, Predicate, SupervisionStatus, Trend, TargetStatus } from "../contracts/enums";
import { GradingSettings } from "../contracts/schemas";

/**
 * Pengaturan standar penilaian default jika tidak disediakan
 */
export const DEFAULT_GRADING_SETTINGS: GradingSettings = {
  id: "default-settings",
  ambang_amat_baik: 90,
  ambang_baik: 75,
  ambang_cukup: 60,
  ambang_aspek_prioritas: 3.0,
  target_default: 80,
  toleransi_tren_stagnan: 2.0,
  batas_nilai_prioritas: 70,
  updated_at: new Date().toISOString(),
};

/**
 * BR-01: Menghitung total skor observasi dari 28 butir indikator (skor 1 s.d. 4).
 * Mengembalikan total skor jika seluruh 28 indikator terisi lengkap.
 * Jika belum lengkap, mengembalikan null.
 */
export function calculateObservationTotalScore(scores: number[]): number | null {
  if (scores.length !== 28) return null;
  for (const s of scores) {
    if (s < 1 || s > 4 || !Number.isInteger(s)) return null;
  }
  return scores.reduce((sum, current) => sum + current, 0);
}

/**
 * BR-02: Menghitung persentase nilai observasi.
 * Rumus: (total / 112) * 100 dibulatkan ke 1 desimal.
 */
export function calculateObservationPercentage(totalScore: number | null): number | null {
  if (totalScore === null || totalScore < 28 || totalScore > 112) return null;
  const percentage = (totalScore / 112) * 100;
  return Math.round(percentage * 10) / 10;
}

/**
 * BR-03: Menentukan predikat berdasarkan persentase nilai dan pengaturan ambang batas.
 */
export function determinePredicate(
  percentage: number | null,
  settings: GradingSettings = DEFAULT_GRADING_SETTINGS
): Predicate | null {
  if (percentage === null) return null;
  if (percentage >= settings.ambang_amat_baik) return "Amat Baik";
  if (percentage >= settings.ambang_baik) return "Baik";
  if (percentage >= settings.ambang_cukup) return "Cukup";
  return "Perlu Pembinaan";
}

/**
 * BR-04: Menghitung rata-rata skor per aspek pembelajaran.
 * Masing-masing aspek wajib memiliki tepat 4 indikator terisi.
 */
export function calculateAspectAverage(fourScores: number[]): number | null {
  if (fourScores.length !== 4) return null;
  for (const s of fourScores) {
    if (s < 1 || s > 4 || !Number.isInteger(s)) return null;
  }
  const avg = fourScores.reduce((a, b) => a + b, 0) / 4;
  return Math.round(avg * 100) / 100;
}

/**
 * BR-04 lanjutan: Menentukan aspek prioritas guru (aspek dengan nilai rata-rata terendah).
 * Jika terjadi nilai seri (tie), pilih aspek yang urutan alfabetisnya lebih dahulu (A s.d. G).
 */
export function determinePriorityAspect(
  aspectAverages: Partial<Record<AspectCode, number | null>>
): AspectCode | null {
  const codes: AspectCode[] = ["A", "B", "C", "D", "E", "F", "G"];
  let lowestAspect: AspectCode | null = null;
  let lowestValue = Infinity;

  for (const code of codes) {
    const val = aspectAverages[code];
    if (typeof val === "number" && val < lowestValue) {
      lowestValue = val;
      lowestAspect = code;
    }
  }

  return lowestAspect;
}

/**
 * BR-06 & BR-07: Menghitung selisih perkembangan dan menentukan status tren nilai.
 */
export function calculateProgressAndTrend(
  initialScore: number | null,
  latestScore: number | null,
  tolerance: number = DEFAULT_GRADING_SETTINGS.toleransi_tren_stagnan
): { progress: number | null; trend: Trend | null } {
  if (initialScore === null || latestScore === null) {
    return { progress: null, trend: null };
  }

  const progress = Math.round((latestScore - initialScore) * 10) / 10;
  let trend: Trend = "Stagnan";

  if (progress > tolerance) {
    trend = "Meningkat";
  } else if (progress < -tolerance) {
    trend = "Menurun";
  }

  return { progress, trend };
}

/**
 * BR-08: Menentukan status pencapaian target guru.
 */
export function evaluateTargetStatus(
  latestScore: number | null,
  customTarget: number | null | undefined,
  defaultTarget: number = DEFAULT_GRADING_SETTINGS.target_default
): TargetStatus {
  if (latestScore === null) {
    return "Belum Ada Data";
  }
  const effectiveTarget = customTarget != null ? customTarget : defaultTarget;
  return latestScore >= effectiveTarget ? "Tercapai" : "Belum Tercapai";
}

/**
 * BR-09: Menentukan semester akademik berdasarkan tanggal ISO (YYYY-MM-DD atau Date).
 * Bulan 7 s.d. 12: Tahun / (Tahun + 1) Ganjil
 * Bulan 1 s.d. 6: (Tahun - 1) / Tahun Genap
 */
export function deriveAcademicSemester(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const month = date.getMonth() + 1; // 1-12
  const year = date.getFullYear();

  if (month >= 7) {
    return `${year}/${year + 1} Ganjil`;
  } else {
    return `${year - 1}/${year} Genap`;
  }
}

/**
 * BR-10: Menentukan status supervisi guru secara komputasi runtime.
 */
export function determineSupervisionStatus(params: {
  hasCompletedObservation: boolean;
  hasFollowup: boolean;
  hasPreObservation: boolean;
  hasDraftObservation: boolean;
}): SupervisionStatus {
  if (params.hasCompletedObservation && params.hasFollowup) {
    return "Selesai";
  }
  if (
    params.hasPreObservation ||
    params.hasDraftObservation ||
    params.hasCompletedObservation ||
    params.hasFollowup
  ) {
    return "Dalam Proses";
  }
  return "Belum Mulai";
}

/**
 * BR-11: Memeriksa apakah suatu item tindak lanjut berstatus Terlambat.
 */
export function isFollowupOverdue(
  deadlineString: string,
  status: string,
  today: Date = new Date()
): boolean {
  if (status === "Selesai") return false;
  const deadline = new Date(deadlineString);
  // Nol-kan jam agar perbandingan berbasis tanggal murni
  deadline.setHours(23, 59, 59, 999);
  return deadline.getTime() < today.getTime();
}

/**
 * BR-12: Memeriksa apakah suatu jadwal observasi terlewat.
 */
export function isScheduleMissed(
  plannedDateString: string,
  hasRealizedObservation: boolean,
  today: Date = new Date()
): boolean {
  if (hasRealizedObservation) return false;
  const plannedDate = new Date(plannedDateString);
  plannedDate.setHours(23, 59, 59, 999);
  return plannedDate.getTime() < today.getTime();
}

/**
 * BR-13 & BR-15: Menghitung frekuensi minimum supervisi wajib per semester.
 */
export function calculateMinimumSupervisionFrequency(params: {
  tahunMasuk: number;
  currentYear: number;
  isSeniorMentor: boolean;
  latestScore: number | null;
  priorityThreshold?: number;
}): number {
  const priorityThreshold = params.priorityThreshold ?? DEFAULT_GRADING_SETTINGS.batas_nilai_prioritas;
  const isGuruBaru = params.currentYear - params.tahunMasuk < 3;
  const isUnderPrioritas = params.latestScore !== null && params.latestScore < priorityThreshold;

  let freq = 2; // Reguler standar

  if (params.isSeniorMentor) {
    freq = 1;
  }
  if (isGuruBaru || isUnderPrioritas) {
    freq = 3;
  }

  return freq;
}

/**
 * BR-16: Memberikan rekomendasi pembinaan otomatis berbasis predikat dan aspek prioritas.
 */
export function generateAutoRecommendation(
  predicate: Predicate | null,
  priorityAspectName: string | null
): string {
  if (!predicate) return "Belum ada data observasi yang diselesaikan.";
  const aspectText = priorityAspectName ? ` pada aspek ${priorityAspectName}` : "";

  switch (predicate) {
    case "Amat Baik":
      return `Pertahankan prestasi, pertimbangkan sebagai mentor rekan sejawat${aspectText}.`;
    case "Baik":
      return `Tingkatkan kompetensi dengan fokus pendampingan${aspectText}.`;
    case "Cukup":
      return `Lakukan coaching terjadwal dan tindak lanjut terarah${aspectText}.`;
    case "Perlu Pembinaan":
      return `Pembinaan intensif berkala serta observasi ulang${aspectText}.`;
  }
}
