import { Schedule, ScheduleSchema, Teacher } from "@/contracts/schemas";
import { isScheduleMissed } from "@/domain/scoring";
import { SettingsService } from "../settings/settings-service";
import { TeacherService } from "../teachers/teacher-service";

const STORAGE_KEY_SCHEDULES = "smart_supervisi_schedules_db";

export interface ScheduleWithDetails extends Schedule {
  teacher: Teacher;
  isMissed: boolean;
  warnings: string[];
  realisasiPraObs: boolean;
  realisasiObs: boolean;
  realisasiCoaching: boolean;
}

// Data awal contoh jadwal realistis
const SEED_SCHEDULES: Schedule[] = [
  {
    id: "s1111111-1111-1111-1111-111111111111",
    teacher_id: "a1111111-1111-1111-1111-111111111111", // Ahmad Fauzi (Senior)
    semester: "2026/2027 Ganjil",
    gelombang: "2 Reguler",
    rencana_pra_observasi: "2026-08-10",
    rencana_observasi: "2026-08-15", // H-5 tepat
    rencana_coaching: "2026-08-18",  // H+3 tepat
    supervisor_id: "00000000-0000-0000-0000-000000000001",
    created_at: new Date().toISOString(),
    version: 1,
  },
  {
    id: "s2222222-2222-2222-2222-222222222222",
    teacher_id: "a2222222-2222-2222-2222-222222222222", // Siti Nurhaliza (Guru Baru)
    semester: "2026/2027 Ganjil",
    gelombang: "1 Prioritas",
    rencana_pra_observasi: "2026-09-02",
    rencana_observasi: "2026-09-08",
    rencana_coaching: "2026-09-10",
    supervisor_id: "00000000-0000-0000-0000-000000000001",
    created_at: new Date().toISOString(),
    version: 1,
  },
  {
    id: "s3333333-3333-3333-3333-333333333333",
    teacher_id: "a3333333-3333-3333-3333-333333333333", // Budi Santoso (Reguler)
    semester: "2026/2027 Ganjil",
    gelombang: "2 Reguler",
    rencana_pra_observasi: "2026-10-15",
    rencana_observasi: "2026-10-22",
    rencana_coaching: "2026-10-25",
    supervisor_id: "00000000-0000-0000-0000-000000000001",
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

        // Simulasi realisasi berdasarkan data contoh
        const isObsRealized = s.id === "s1111111-1111-1111-1111-111111111111";
        const isPraRealized = isObsRealized || s.id === "s2222222-2222-2222-2222-222222222222";
        const isCoachingRealized = isObsRealized;

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
    const updated: Schedule = {
      ...prev,
      ...payload,
      version: prev.version + 1,
    };

    const validated = ScheduleSchema.parse(updated);
    schedules[index] = validated;

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_SCHEDULES, JSON.stringify(schedules));

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

      SettingsService.recordAuditLog({
        aksi: "HAPUS_JADWAL",
        entitas: "schedules",
        entitas_id: id,
        actor_email: "admin@sekolah.sch.id",
      });
    }
  },
};
