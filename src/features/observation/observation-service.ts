import {
  Observation,
  ObservationSchema,
  ObservationScoreItem,
  ObservationScoreItemSchema,
  FactNote,
  FactNoteSchema,
  Teacher,
} from "@/contracts/schemas";
import { SEED_INDICATORS, SEED_MOCK_TEACHERS } from "@/contracts/seed-data";
import {
  calculateObservationTotalScore,
  calculateObservationPercentage,
  determinePredicate,
  calculateAspectAverage,
  determinePriorityAspect,
} from "@/domain/scoring";
import { AspectCode } from "@/contracts/enums";
import { SettingsService } from "../settings/settings-service";
import { TeacherService } from "../teachers/teacher-service";

const STORAGE_KEY_OBSERVATIONS = "smart_supervisi_observations_db";
const STORAGE_KEY_SCORES = "smart_supervisi_observation_scores_db";
const STORAGE_KEY_FACT_NOTES = "smart_supervisi_fact_notes_db";

let _cachedObservations: Observation[] | null = null;
let _cachedScores: ObservationScoreItem[] | null = null;

export interface ObservationCalculationResult {
  completedCount: number;
  totalScore: number | null;
  percentage: number | null;
  predikat: string | null;
  aspectAverages: Partial<Record<AspectCode, number | null>>;
  priorityAspect: AspectCode | null;
}

// Data awal contoh observasi selesai (Obs-1 Aini Supiyah, S.Pd, MM)
const SEED_OBSERVATION_1: Observation = {
  id: "o1111111-1111-1111-1111-111111111111",
  schedule_id: "s1111111-1111-1111-1111-111111111111",
  teacher_id: "a1111111-1111-1111-1111-111111111111", // Aini Supiyah, S.Pd, MM
  supervisor_id: "00000000-0000-0000-0000-000000000001",
  semester: "2026/2027 Ganjil",
  sesi_ke: 1,
  tanggal_observasi: "2026-08-15",
  jam_mulai: "07:30",
  jam_selesai: "08:50",
  kelas: "9-A",
  jumlah_siswa_hadir: 32,
  catatan_umum: "Pembelajaran IPS materi interaksi antarruang berjalan aktif dengan metode PBL berdiferensiasi.",
  status: "Final",
  is_locked: true,
  alasan_buka_kunci: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

// 28 skor awal untuk Obs-1 (Aini Supiyah) bernilai rata-rata 3.5 (Total skor 99 = 88.4% Baik)
const SEED_SCORES_1: ObservationScoreItem[] = SEED_INDICATORS.map((ind, idx) => ({
  observation_id: "o1111111-1111-1111-1111-111111111111",
  kode_indikator: ind.kode,
  skor: idx % 3 === 0 ? 4 : 3, // variasi skor 3 dan 4
  bukti_nyata: `Teramati guru menerapkan ${ind.pernyataan.slice(0, 40)}... secara konsisten.`,
  catatan: "Berjalan baik.",
}));

const SEED_FACT_NOTES_1: FactNote[] = [
  {
    id: "fn-1",
    observation_id: "o1111111-1111-1111-1111-111111111111",
    menit_ke: 4,
    fakta_terlihat: "Guru menyapa siswa dan memutar video pendek tentang tarif parkir mall.",
    ucapan_guru_verbatim: "'Coba cermati mengapa struk parkir mobil dan motor memiliki pola tarif yang berbeda?'",
    respons_ucapan_siswa: "Siswa serentak menjawab: 'Karena ukuran kendaraan dan durasinya Pak!'",
    jumlah_siswa_terlibat: 32,
    bukti_artefak_teks: "Tayangan slide apersepsi video konteks nyata.",
    foto_artefak_url: null,
    dampak_pembelajaran: "Siswa termotivasi dan antusias sejak menit awal.",
    kode_indikator_tertaut: "A2",
    created_at: new Date().toISOString(),
  },
  {
    id: "fn-2",
    observation_id: "o1111111-1111-1111-1111-111111111111",
    menit_ke: 22,
    fakta_terlihat: "Guru berkeliling mendampingi kelompok 4 yang kesulitan memisahkan variabel x, y, dan z.",
    ucapan_guru_verbatim: "'Perhatikan kata kuncinya, mana yang menyatakan jumlah unit dan mana yang menyatakan harga per unit?'",
    respons_ucapan_siswa: "'Oh iya Pak, x untuk motor dan y untuk mobil.'",
    jumlah_siswa_terlibat: 5,
    bukti_artefak_teks: "LKPD kelompok 4 yang dicoret perbaikan.",
    foto_artefak_url: null,
    dampak_pembelajaran: "Kelompok 4 berhasil menyelesaikan pemodelan mandiri.",
    kode_indikator_tertaut: "D3",
    created_at: new Date().toISOString(),
  },
];

export const ObservationService = {
  getObservations(): Observation[] {
    if (typeof window === "undefined") return [SEED_OBSERVATION_1];
    if (_cachedObservations) return _cachedObservations;
    try {
      const data = localStorage.getItem(STORAGE_KEY_OBSERVATIONS);
      if (data) {
        const parsed: Observation[] = JSON.parse(data);
        _cachedObservations = parsed;
        return parsed;
      }
    } catch (e) {
      console.warn("Gagal membaca observasi dari storage:", e);
    }
    _cachedObservations = [SEED_OBSERVATION_1];
    return [SEED_OBSERVATION_1];
  },

  getObservationById(id: string): Observation | undefined {
    return this.getObservations().find((o) => o.id === id);
  },

  getObservationByTeacherAndSemester(teacherId: string, semester: string): Observation | undefined {
    return this.getObservations().find(
      (o) => o.teacher_id === teacherId && o.semester === semester
    );
  },

  /**
   * Mengambil sesi observasi spesifik berdasarkan guru, semester, dan nomor sesi
   */
  getObservationByTeacherSemesterAndSession(
    teacherId: string,
    semester: string,
    sesiKe: number
  ): Observation | undefined {
    return this.getObservations().find(
      (o) => o.teacher_id === teacherId && o.semester === semester && o.sesi_ke === sesiKe
    );
  },

  /**
   * Mengambil seluruh sesi observasi milik seorang guru di semester tertentu
   */
  getObservationsByTeacherAndSemester(teacherId: string, semester: string): Observation[] {
    return this.getObservations()
      .filter((o) => o.teacher_id === teacherId && o.semester === semester)
      .sort((a, b) => a.sesi_ke - b.sesi_ke);
  },

  /**
   * Membuat draf sesi observasi baru jika belum tersedia
   */
  createObservationSession(
    teacherId: string,
    semester: string,
    sesiKe: number,
    initialData?: Partial<Observation>
  ): Observation {
    const teacher = TeacherService.getTeacherById(teacherId);
    const newObs: Observation = {
      id: crypto.randomUUID(),
      schedule_id: crypto.randomUUID(),
      teacher_id: teacherId,
      supervisor_id: "00000000-0000-0000-0000-000000000001",
      semester,
      sesi_ke: sesiKe,
      tanggal_observasi: initialData?.tanggal_observasi || new Date().toISOString().split("T")[0],
      jam_mulai: initialData?.jam_mulai || "08:00",
      jam_selesai: initialData?.jam_selesai || "09:30",
      kelas: initialData?.kelas || (teacher ? teacher.kelas_diampu : "X-A"),
      jumlah_siswa_hadir: initialData?.jumlah_siswa_hadir ?? 32,
      catatan_umum: initialData?.catatan_umum || "",
      status: "Draf",
      is_locked: false,
      alasan_buka_kunci: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1,
    };
    return this.saveObservation(newObs);
  },

  getAllScores(observationId: string): ObservationScoreItem[] {
    if (typeof window === "undefined") {
      return observationId === SEED_OBSERVATION_1.id ? SEED_SCORES_1 : [];
    }
    if (_cachedScores) {
      return _cachedScores.filter((s) => s.observation_id === observationId);
    }
    try {
      const data = localStorage.getItem(STORAGE_KEY_SCORES);
      if (data) {
        const all: ObservationScoreItem[] = JSON.parse(data);
        _cachedScores = all;
        return all.filter((s) => s.observation_id === observationId);
      }
    } catch (e) {
      console.warn("Gagal membaca skor dari storage:", e);
    }
    _cachedScores = [...SEED_SCORES_1];
    return observationId === SEED_OBSERVATION_1.id ? SEED_SCORES_1 : [];
  },

  getAllFactNotes(observationId: string): FactNote[] {
    if (typeof window === "undefined") {
      return observationId === SEED_OBSERVATION_1.id ? SEED_FACT_NOTES_1 : [];
    }
    try {
      const data = localStorage.getItem(STORAGE_KEY_FACT_NOTES);
      if (data) {
        const all: FactNote[] = JSON.parse(data);
        return all.filter((fn) => fn.observation_id === observationId);
      }
    } catch (e) {
      console.warn("Gagal membaca fact notes:", e);
    }
    return observationId === SEED_OBSERVATION_1.id ? SEED_FACT_NOTES_1 : [];
  },

  calculateObservationMetrics(scores: ObservationScoreItem[]): ObservationCalculationResult {
    const gradingSettings = SettingsService.getGradingSettings();
    const scoreMap = new Map(scores.map((s) => [s.kode_indikator, s.skor]));

    // Rata-rata per aspek
    const aspectAverages: Partial<Record<AspectCode, number | null>> = {};
    const aspects: AspectCode[] = ["A", "B", "C", "D", "E", "F", "G"];

    for (const asp of aspects) {
      const indScores = [1, 2, 3, 4]
        .map((num) => scoreMap.get(`${asp}${num}`))
        .filter((s): s is number => typeof s === "number");

      aspectAverages[asp] = calculateAspectAverage(indScores);
    }

    const priorityAspect = determinePriorityAspect(aspectAverages);

    // Hitung total dan persentase
    const all28Scores = SEED_INDICATORS.map((ind) => scoreMap.get(ind.kode)).filter(
      (s): s is number => typeof s === "number"
    );

    const completedCount = all28Scores.length;
    const totalScore = calculateObservationTotalScore(all28Scores);
    const percentage = calculateObservationPercentage(totalScore);
    const predikat = determinePredicate(percentage, gradingSettings);

    return {
      completedCount,
      totalScore,
      percentage,
      predikat,
      aspectAverages,
      priorityAspect,
    };
  },

  saveObservation(observation: Observation): Observation {
    const list = this.getObservations();
    const index = list.findIndex((o) => o.id === observation.id);

    const updated: Observation = {
      ...observation,
      updated_at: new Date().toISOString(),
      version: observation.version + 1,
    };

    const validated = ObservationSchema.parse(updated);

    if (index >= 0) {
      list[index] = validated;
    } else {
      list.unshift(validated);
    }

    _cachedObservations = list;

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_OBSERVATIONS, JSON.stringify(list));
      SettingsService.recordAuditLog({
        aksi: "SIMPAN_OBSERVASI",
        entitas: "observations",
        entitas_id: validated.id,
        actor_email: "admin@sekolah.sch.id",
        nilai_sesudah: validated as unknown as Record<string, unknown>,
      });
    }

    return validated;
  },

  saveScoreItem(item: ObservationScoreItem): void {
    if (typeof window === "undefined") return;

    try {
      const validated = ObservationScoreItemSchema.parse(item);
      const data = localStorage.getItem(STORAGE_KEY_SCORES);
      let all: ObservationScoreItem[] = data ? JSON.parse(data) : [...SEED_SCORES_1];

      const index = all.findIndex(
        (s) => s.observation_id === item.observation_id && s.kode_indikator === item.kode_indikator
      );

      if (index >= 0) {
        all[index] = validated;
      } else {
        all.push(validated);
      }

      _cachedScores = all;

      localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(all));
    } catch (e) {
      console.warn("Gagal menyimpan skor indikator:", e);
    }
  },

  saveFactNote(note: Omit<FactNote, "id" | "created_at">): FactNote {
    const newNote: FactNote = {
      ...note,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    const validated = FactNoteSchema.parse(newNote);

    if (typeof window !== "undefined") {
      const data = localStorage.getItem(STORAGE_KEY_FACT_NOTES);
      const all: FactNote[] = data ? JSON.parse(data) : [...SEED_FACT_NOTES_1];
      all.unshift(validated);
      localStorage.setItem(STORAGE_KEY_FACT_NOTES, JSON.stringify(all));
    }

    return validated;
  },

  deleteFactNote(id: string): void {
    if (typeof window === "undefined") return;
    try {
      const data = localStorage.getItem(STORAGE_KEY_FACT_NOTES);
      if (data) {
        const all: FactNote[] = JSON.parse(data);
        const filtered = all.filter((n) => n.id !== id);
        localStorage.setItem(STORAGE_KEY_FACT_NOTES, JSON.stringify(filtered));
      }
    } catch (e) {
      console.warn("Gagal menghapus fact note:", e);
    }
  },

  finalizeObservation(observationId: string): Observation {
    const obs = this.getObservationById(observationId);
    if (!obs) throw new Error("Observasi tidak ditemukan.");

    const scores = this.getAllScores(observationId);
    if (scores.length < 28) {
      throw new Error(`Observasi belum lengkap (${scores.length}/28 indikator terisi). Seluruh 28 indikator wajib dinilai sebelum finalisasi.`);
    }

    const missingBukti = scores.filter((s) => !s.bukti_nyata || s.bukti_nyata.trim().length === 0);
    if (missingBukti.length > 0) {
      throw new Error(
        `Terdapat ${missingBukti.length} indikator yang belum diisi bukti nyatanya (${missingBukti
          .map((m) => m.kode_indikator)
          .slice(0, 4)
          .join(", ")}${missingBukti.length > 4 ? "..." : ""}). Seluruh indikator wajib memiliki bukti nyata sebelum finalisasi.`
      );
    }

    obs.status = "Final";
    obs.is_locked = true;

    return this.saveObservation(obs);
  },

  unlockObservation(observationId: string, alasan: string, actorEmail: string = "admin@sekolah.sch.id"): Observation {
    if (!alasan || alasan.trim().length < 5) {
      throw new Error("Alasan buka kunci wajib diisi minimal 5 karakter.");
    }

    const obs = this.getObservationById(observationId);
    if (!obs) throw new Error("Observasi tidak ditemukan.");

    obs.is_locked = false;
    obs.alasan_buka_kunci = alasan;

    const saved = this.saveObservation(obs);

    SettingsService.recordAuditLog({
      aksi: "BUKA_KUNCI_OBSERVASI",
      entitas: "observations",
      entitas_id: observationId,
      actor_email: actorEmail,
      nilai_sesudah: { alasan_buka_kunci: alasan },
    });

    return saved;
  },
};
