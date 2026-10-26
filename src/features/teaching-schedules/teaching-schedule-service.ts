import {
  DayName,
  TeachingSlot,
  TeacherSchedule,
  TEACHER_SCHEDULES,
  getDayNameFromDate,
} from "@/contracts/teaching-schedules";
import { TeacherService } from "../teachers/teacher-service";
import { SettingsService } from "../settings/settings-service";

const STORAGE_KEY_TEACHING_SCHEDULES = "smart_supervisi_teaching_schedules_db";

let inMemorySchedules: Record<string, TeacherSchedule> | null = null;

/**
 * Service pengelola jadwal mengajar KBM riil guru
 * Menyimpan data dinamis ke localStorage dan menyediakan fallback ke data bawaan aSc Timetables
 */
export const TeachingScheduleService = {
  /**
   * Dapatkan seluruh jadwal mengajar semua guru dari penyimpanan lokal atau fallback bawaan
   */
  getAllSchedules(): Record<string, TeacherSchedule> {
    if (inMemorySchedules) {
      return inMemorySchedules;
    }

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_TEACHING_SCHEDULES);
        if (stored) {
          const parsed = JSON.parse(stored) as Record<string, TeacherSchedule>;
          inMemorySchedules = parsed;
          return parsed;
        }
      } catch (e) {
        console.warn("Gagal membaca jadwal mengajar dari localStorage, menggunakan data default aSc:", e);
      }

      // Jika belum tersimpan di localStorage, inisialisasi dengan data default aSc Timetables
      try {
        localStorage.setItem(STORAGE_KEY_TEACHING_SCHEDULES, JSON.stringify(TEACHER_SCHEDULES));
      } catch (e) {
        console.warn("Gagal menyimpan inisialisasi jadwal mengajar ke localStorage:", e);
      }
    }

    inMemorySchedules = { ...TEACHER_SCHEDULES };
    return inMemorySchedules;
  },

  /**
   * Dapatkan jadwal mengajar untuk guru tertentu
   */
  getTeacherSchedule(teacherId: string, teacherName?: string): TeacherSchedule | null {
    const all = this.getAllSchedules();
    if (all[teacherId]) {
      return all[teacherId];
    }

    // Jika tidak ditemukan berdasarkan ID, cari berdasarkan nama guru
    if (teacherName) {
      const normalizedQuery = teacherName.toLowerCase().replace(/[^a-z]/g, "");
      const foundEntry = Object.values(all).find((sch) => {
        const normalizedTarget = sch.nama_lengkap.toLowerCase().replace(/[^a-z]/g, "");
        return normalizedTarget.includes(normalizedQuery) || normalizedQuery.includes(normalizedTarget);
      });
      if (foundEntry) return foundEntry;
    }

    // Jika guru ada di data guru aktif, buatkan jadwal kosong siap diisi
    const teachers = TeacherService.getTeachers();
    const targetTeacher = teachers.find((t) => t.id === teacherId);
    if (targetTeacher) {
      return {
        teacher_id: targetTeacher.id,
        nama_lengkap: targetTeacher.nama_lengkap,
        slots: [],
      };
    }

    return null;
  },

  /**
   * Dapatkan daftar hari mengajar aktif seorang guru
   */
  getTeachingDays(teacherId: string): DayName[] {
    const schedule = this.getTeacherSchedule(teacherId);
    if (!schedule || schedule.slots.length === 0) return [];

    const days = Array.from(new Set(schedule.slots.map((s) => s.hari)));
    const order: DayName[] = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
    return order.filter((d) => days.includes(d));
  },

  /**
   * Dapatkan slot mengajar guru pada hari tertentu
   */
  getTeachingSlotsByDay(teacherId: string, day: DayName): TeachingSlot[] {
    const schedule = this.getTeacherSchedule(teacherId);
    if (!schedule) return [];
    return schedule.slots.filter((s) => s.hari === day);
  },

  /**
   * Validasi tanggal observasi terhadap jadwal mengajar dinamis guru
   */
  validateObservationDateAgainstSchedule(
    teacherId: string,
    dateStr: string
  ): {
    isValid: boolean;
    dayName: string | null;
    slots: TeachingSlot[];
    message?: string;
  } {
    const day = getDayNameFromDate(dateStr);
    if (!day) {
      return {
        isValid: false,
        dayName: null,
        slots: [],
        message: "Tanggal yang dipilih jatuh pada hari libur akhir pekan (Sabtu/Minggu). Observasi hanya dapat dijadwalkan pada hari efektif belajar (Senin s.d. Jumat).",
      };
    }

    const schedule = this.getTeacherSchedule(teacherId);
    if (!schedule || schedule.slots.length === 0) {
      // Jika guru belum diisi slot mengajarnya, beri izin dengan catatan peringatan
      return {
        isValid: true,
        dayName: day,
        slots: [],
      };
    }

    const slots = schedule.slots.filter((s) => s.hari === day);
    if (slots.length === 0) {
      const availableDays = this.getTeachingDays(teacherId).join(", ");
      return {
        isValid: false,
        dayName: day,
        slots: [],
        message: `Guru ${schedule.nama_lengkap} tidak memiliki jadwal mengajar pada hari ${day}. Hari mengajar yang tersedia: ${availableDays || "Belum diatur"}.`,
      };
    }

    return {
      isValid: true,
      dayName: day,
      slots,
    };
  },

  /**
   * Simpan seluruh jadwal seorang guru
   */
  saveTeacherSchedule(schedule: TeacherSchedule): void {
    const all = this.getAllSchedules();
    const updated = {
      ...all,
      [schedule.teacher_id]: schedule,
    };
    inMemorySchedules = updated;

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_TEACHING_SCHEDULES, JSON.stringify(updated));

      SettingsService.recordAuditLog({
        aksi: "UPDATE_JADWAL_GURU",
        entitas: "teaching_schedules",
        entitas_id: schedule.teacher_id,
        actor_email: "admin@sekolah.sch.id",
        nilai_sesudah: {
          teacher_id: schedule.teacher_id,
          nama_lengkap: schedule.nama_lengkap,
          jumlah_slot: schedule.slots.length,
        },
      });
    }
  },

  /**
   * Tambah slot mengajar baru ke jadwal guru
   */
  addSlot(
    teacherId: string,
    slotData: Omit<TeachingSlot, "id">,
    teacherName?: string
  ): TeachingSlot {
    const schedule = this.getTeacherSchedule(teacherId, teacherName) || {
      teacher_id: teacherId,
      nama_lengkap: teacherName || "Guru",
      slots: [],
    };

    const newSlot: TeachingSlot = {
      ...slotData,
      id: `slot-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };

    const updatedSlots = [...schedule.slots, newSlot];

    // Urutkan slot berdasarkan hari dan jam
    const dayOrder: Record<DayName, number> = {
      Senin: 1,
      Selasa: 2,
      Rabu: 3,
      Kamis: 4,
      Jumat: 5,
    };

    updatedSlots.sort((a, b) => {
      const dayDiff = dayOrder[a.hari] - dayOrder[b.hari];
      if (dayDiff !== 0) return dayDiff;
      return a.waktu.localeCompare(b.waktu);
    });

    this.saveTeacherSchedule({
      ...schedule,
      slots: updatedSlots,
    });

    return newSlot;
  },

  /**
   * Perbarui slot mengajar yang sudah ada
   */
  updateSlot(
    teacherId: string,
    slotId: string,
    updatedData: Partial<Omit<TeachingSlot, "id">>
  ): void {
    const schedule = this.getTeacherSchedule(teacherId);
    if (!schedule) throw new Error("Jadwal guru tidak ditemukan.");

    const slotIndex = schedule.slots.findIndex((s) => s.id === slotId);
    if (slotIndex === -1) throw new Error("Slot jadwal tidak ditemukan.");

    const updatedSlot: TeachingSlot = {
      ...schedule.slots[slotIndex],
      ...updatedData,
    };

    const updatedSlots = [...schedule.slots];
    updatedSlots[slotIndex] = updatedSlot;

    this.saveTeacherSchedule({
      ...schedule,
      slots: updatedSlots,
    });
  },

  /**
   * Hapus slot mengajar dari jadwal guru
   */
  deleteSlot(teacherId: string, slotId: string): void {
    const schedule = this.getTeacherSchedule(teacherId);
    if (!schedule) return;

    const filteredSlots = schedule.slots.filter((s) => s.id !== slotId);
    this.saveTeacherSchedule({
      ...schedule,
      slots: filteredSlots,
    });
  },

  /**
   * Kembalikan jadwal ke setelan bawaan aSc Timetables resmi
   */
  resetToDefault(teacherId?: string): void {
    if (teacherId) {
      const defaultForTeacher = TEACHER_SCHEDULES[teacherId];
      if (defaultForTeacher) {
        this.saveTeacherSchedule(defaultForTeacher);
      }
    } else {
      inMemorySchedules = { ...TEACHER_SCHEDULES };
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_TEACHING_SCHEDULES, JSON.stringify(TEACHER_SCHEDULES));

        SettingsService.recordAuditLog({
          aksi: "RESET_JADWAL_GURU",
          entitas: "teaching_schedules",
          entitas_id: "ALL",
          actor_email: "admin@sekolah.sch.id",
        });
      }
    }
  },

  /**
   * Hitung total statistik jam mengajar seluruh sekolah
   */
  getStatistics(): {
    totalGuruTerjadwal: number;
    totalJamPelajaran: number;
    rataRataJamPerGuru: number;
    distribusiHari: Record<DayName, number>;
  } {
    const all = this.getAllSchedules();
    const schedulesList = Object.values(all);
    const totalGuru = schedulesList.filter((s) => s.slots.length > 0).length;
    let totalJP = 0;
    const distribusiHari: Record<DayName, number> = {
      Senin: 0,
      Selasa: 0,
      Rabu: 0,
      Kamis: 0,
      Jumat: 0,
    };

    schedulesList.forEach((s) => {
      totalJP += s.slots.length;
      s.slots.forEach((slot) => {
        if (distribusiHari[slot.hari] !== undefined) {
          distribusiHari[slot.hari] += 1;
        }
      });
    });

    const rataRata = totalGuru > 0 ? Number((totalJP / totalGuru).toFixed(1)) : 0;

    return {
      totalGuruTerjadwal: totalGuru,
      totalJamPelajaran: totalJP,
      rataRataJamPerGuru: rataRata,
      distribusiHari,
    };
  },
};