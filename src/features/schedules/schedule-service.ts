import { Schedule, ScheduleSchema, Teacher } from "@/contracts/schemas";
import { isScheduleMissed } from "@/domain/scoring";
import { validateObservationDateAgainstSchedule } from "@/contracts/teaching-schedules";
import { SettingsService } from "../settings/settings-service";
import { TeacherService } from "../teachers/teacher-service";
import { PreObservationService } from "../pre-observation/pre-observation-service";
import { ObservationService } from "../observation/observation-service";
import { CoachingService } from "../coaching/coaching-service";
import { CloudSyncService, SYNC_STORAGE_KEYS } from "@/services/cloud-sync-service";

const STORAGE_KEY_SCHEDULES = "smart_supervisi_schedules_db";

export interface ScheduleWithDetails extends Schedule {
  teacher: Teacher;
  isMissed: boolean;
  warnings: string[];
  realisasiPraObs: boolean;
  realisasiObs: boolean;
  realisasiCoaching: boolean;
}

// Data awal contoh jadwal realistis selaras aSc Timetables SMPN 3 Cibungbulang
const SEED_SCHEDULES: Schedule[] = [
  {
    id: "s1111111-1111-1111-1111-111111111111",
    teacher_id: "a1111111-1111-1111-1111-111111111111", // Aini Supiyah, S.Pd, MM (Wakasek Humas)
    semester: "2026/2027 Ganjil",
    gelombang: "2 Reguler",
    rencana_pra_observasi: "2026-08-05", // Rabu (H-5)
    rencana_observasi: "2026-08-10",     // Senin (Jadwal mengajar kelas 8G)
    rencana_coaching: "2026-08-12",      // Rabu (H+2)
    supervisor_id: "00000000-0000-0000-0000-000000000001",
    jam_observasi: "Jam Ke 1-2 (08:00 - 09:10)",
    kelas_observasi: "8G",
    mapel_observasi: "Ilmu Pengetahuan Sosial",
    hari_observasi: "Senin",
    created_at: new Date().toISOString(),
    version: 1,
  },
  {
    id: "s2222222-2222-2222-2222-222222222222",
    teacher_id: "a2222222-2222-2222-2222-222222222222", // Lilis Yuliati, M.Pd (Wakasek Kesiswaan)
    semester: "2026/2027 Ganjil",
    gelombang: "1 Prioritas",
    rencana_pra_observasi: "2026-09-01", // Selasa (H-7)
    rencana_observasi: "2026-09-08",     // Selasa (Jadwal mengajar kelas 8F)
    rencana_coaching: "2026-09-10",      // Kamis (H+2)
    supervisor_id: "00000000-0000-0000-0000-000000000001",
    jam_observasi: "Jam Ke 5-6 (10:15 - 12:00)",
    kelas_observasi: "8F",
    mapel_observasi: "Ilmu Pengetahuan Alam",
    hari_observasi: "Selasa",
    created_at: new Date().toISOString(),
    version: 1,
  },
  {
    id: "s3333333-3333-3333-3333-333333333333",
    teacher_id: "a3333333-3333-3333-3333-333333333333", // Hj. Heny Susana, S.Pd (Wali Kelas 9C)
    semester: "2026/2027 Ganjil",
    gelombang: "2 Reguler",
    rencana_pra_observasi: "2026-10-15", // Kamis (H-7)
    rencana_observasi: "2026-10-22",     // Kamis (Jadwal mengajar kelas 7F)
    rencana_coaching: "2026-10-23",      // Jumat (H+1)
    supervisor_id: "00000000-0000-0000-0000-000000000001",
    jam_observasi: "Jam Ke 1-2 (07:30 - 08:40)",
    kelas_observasi: "7F",
    mapel_observasi: "Pendidikan Pancasila",
    hari_observasi: "Kamis",
    created_at: new Date().toISOString(),
    version: 1,
  },
];

export const ScheduleService = {
  getSchedules(): Schedule[] {
    if (typeof window === "undefined") return SEED_SCHEDULES;
    try {
      const data = localStorage.getItem(STORAGE_KEY_SCHEDULES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn("Gagal membaca jadwal dari storage:", e);
    }
    return SEED_SCHEDULES;
  },

  getSchedulesWithDetails(): ScheduleWithDetails[] {
    const schedules = this.getSchedules();
    const teachers = TeacherService.getTeachers();
    const teacherMap = new Map(teachers.map((t) => [t.id, t]));
    const today = new Date();

    const preObservations = PreObservationService.getPreObservations();
    const observations = ObservationService.getObservations();
    const coachingSessions = CoachingService.getSessions();

    return schedules
      .map((s) => {
        const teacher = teacherMap.get(s.teacher_id);
        if (!teacher || !teacher.aktif) return null;

        // Validasi jarak waktu BR-14
        const warnings: string[] = [];
        const praDate = new Date(s.rencana_pra_observasi);
        const obsDate = new Date(s.rencana_observasi);
        const coachDate = new Date(s.rencana_coaching);

        // Selisih hari
        const daysPraToObs = Math.round((obsDate.getTime() - praDate.getTime()) / (1000 * 3600 * 24));
        const daysObsToCoach = Math.round((coachDate.getTime() - obsDate.getTime()) / (1000 * 3600 * 24));

        if (daysPraToObs < 5) {
          warnings.push(`Pra-observasi dilakukan ${daysPraToObs} hari sebelum observasi (anjuran minimal H-5).`);
        }
        if (daysObsToCoach > 3) {
          warnings.push(`Coaching dijadwalkan ${daysObsToCoach} hari sesudah observasi (anjuran maksimal H+3).`);
        }
        if (daysObsToCoach < 0) {
          warnings.push("Tanggal coaching tidak boleh mendahului tanggal observasi kelas.");
        }

        // Realisasi Pra-Observasi (P):
        // Terlaksana HANYA jika data hasil diskusi pra-observasi untuk jadwal ini (schedule_id === s.id) telah disimpan
        const isPraRealized = preObservations.some(
          (p) =>
            p.schedule_id === s.id &&
            (p.status === "Final" || Boolean(p.topik_pembelajaran && p.topik_pembelajaran.trim() !== ""))
        );

        // Realisasi Observasi (O):
        // Terlaksana HANYA jika sesi observasi kelas untuk jadwal ini (schedule_id === s.id) telah difinalisasi, dikunci, atau telah memiliki butir skor
        const scheduleObs = observations.filter((o) => o.schedule_id === s.id);
        const isObsRealized = scheduleObs.some((o) => {
          if (o.status === "Final" || o.is_locked) return true;
          const scores = ObservationService.getAllScores(o.id);
          return scores.length > 0;
        });

        // Realisasi Coaching (C):
        // Terlaksana HANYA jika sesi percakapan coaching untuk observasi jadwal ini telah difinalisasi atau dialog/refleksi telah disimpan
        let isCoachingRealized = false;
        if (scheduleObs.length > 0) {
          const obsIds = new Set(scheduleObs.map((o) => o.id));
          isCoachingRealized = coachingSessions.some(
            (c) =>
              obsIds.has(c.observation_id) &&
              (c.status === "Final" ||
                Boolean(c.poin_kunci_dialog && c.poin_kunci_dialog.trim() !== "") ||
                Boolean(c.refleksi_guru?.hal_sudah_baik) ||
                CoachingService.getSessionQuestions(c.id).length > 0)
          );
        }

        const isMissed = isScheduleMissed(s.rencana_observasi, isObsRealized, today);

        return {
          ...s,
          teacher,
          isMissed,
          warnings,
          realisasiPraObs: isPraRealized,
          realisasiObs: isObsRealized,
          realisasiCoaching: isCoachingRealized,
        };
      })
      .filter((s): s is ScheduleWithDetails => s !== null);
  },

  createSchedule(payload: Omit<Schedule, "id" | "created_at" | "version">): Schedule {
    // Validasi keselarasan jadwal mengajar riil guru (aSc Timetables)
    if (payload.teacher_id && payload.rencana_observasi) {
      const check = validateObservationDateAgainstSchedule(payload.teacher_id, payload.rencana_observasi);
      if (!check.isValid) {
        throw new Error(check.message || "Tanggal observasi tidak sesuai dengan jadwal mengajar guru.");
      }
      if (!payload.hari_observasi && check.dayName) {
        payload.hari_observasi = check.dayName;
      }
    }

    const schedules = this.getSchedules();
    const newSchedule: Schedule = {
      ...payload,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      version: 1,
    };

    const validated = ScheduleSchema.parse(newSchedule);

    if (typeof window !== "undefined") {
      const updatedList = [validated, ...schedules];
      localStorage.setItem(STORAGE_KEY_SCHEDULES, JSON.stringify(updatedList));
      CloudSyncService.pushToCloud(SYNC_STORAGE_KEYS.SCHEDULES, updatedList);

      SettingsService.recordAuditLog({
        aksi: "TAMBAH_JADWAL",
        entitas: "schedules",
        entitas_id: validated.id,
        actor_email: "admin@sekolah.sch.id",
        nilai_sesudah: validated as unknown as Record<string, unknown>,
      });
    }

    return validated;
  },

  updateSchedule(id: string, payload: Partial<Schedule>): Schedule {
    const schedules = this.getSchedules();
    const index = schedules.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error("Jadwal tidak ditemukan.");
    }

    const prev = schedules[index];
    const targetTeacherId = payload.teacher_id || prev.teacher_id;
    const targetObsDate = payload.rencana_observasi || prev.rencana_observasi;

    // Validasi keselarasan jadwal mengajar riil guru (aSc Timetables)
    if (targetTeacherId && targetObsDate) {
      const check = validateObservationDateAgainstSchedule(targetTeacherId, targetObsDate);
      if (!check.isValid) {
        throw new Error(check.message || "Tanggal observasi tidak sesuai dengan jadwal mengajar guru.");
      }
      if (!payload.hari_observasi && check.dayName) {
        payload.hari_observasi = check.dayName;
      }
    }

    const updated: Schedule = {
      ...prev,
      ...payload,
      version: prev.version + 1,
    };

    const validated = ScheduleSchema.parse(updated);
    schedules[index] = validated;

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_SCHEDULES, JSON.stringify(schedules));
      CloudSyncService.pushToCloud(SYNC_STORAGE_KEYS.SCHEDULES, schedules);

      SettingsService.recordAuditLog({
        aksi: "UPDATE_JADWAL",
        entitas: "schedules",
        entitas_id: id,
        actor_email: "admin@sekolah.sch.id",
        nilai_sebelum: prev as unknown as Record<string, unknown>,
        nilai_sesudah: validated as unknown as Record<string, unknown>,
      });
    }

    return validated;
  },

  deleteSchedule(id: string): void {
    const schedules = this.getSchedules();
    const filtered = schedules.filter((s) => s.id !== id);

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_SCHEDULES, JSON.stringify(filtered));
      CloudSyncService.pushToCloud(SYNC_STORAGE_KEYS.SCHEDULES, filtered);

      SettingsService.recordAuditLog({
        aksi: "HAPUS_JADWAL",
        entitas: "schedules",
        entitas_id: id,
        actor_email: "admin@sekolah.sch.id",
      });
    }
  },
};
