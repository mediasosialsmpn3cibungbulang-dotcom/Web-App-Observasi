import { Teacher, TeacherSchema } from "@/contracts/schemas";
import { SEED_MOCK_TEACHERS } from "@/contracts/seed-data";
import { calculateMinimumSupervisionFrequency } from "@/domain/scoring";
import { SettingsService } from "../settings/settings-service";

const STORAGE_KEY_TEACHERS = "smart_supervisi_teachers_db";

export interface ImportPreviewResult {
  valid: Teacher[];
  invalid: {
    baris: number;
    nama: string;
    nip: string;
    alasan: string[];
  }[];
}

/**
 * Layanan data pokok guru, validasi NIP unik, soft delete, dan impor Sheet 2 Excel
 */
export const TeacherService = {
  getTeachers(): Teacher[] {
    if (typeof window === "undefined") return SEED_MOCK_TEACHERS;
    try {
      const data = localStorage.getItem(STORAGE_KEY_TEACHERS);
      if (data) {
        const parsed: Teacher[] = JSON.parse(data);
        // Validasi jika data di penyimpanan lokal sudah berupa 25 guru terbaru (Fase D SMP)
        if (
          Array.isArray(parsed) &&
          parsed.length >= 25 &&
          parsed.some((t) => t.nama_lengkap.includes("Aini Supiyah"))
        ) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Gagal membaca database guru dari storage:", e);
    }
    // Segarkan penyimpanan lokal secara otomatis dengan 25 guru terbaru
    try {
      localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(SEED_MOCK_TEACHERS));
    } catch (e) {
      console.warn("Gagal memperbarui database guru ke storage:", e);
    }
    return SEED_MOCK_TEACHERS;
  },

  getTeacherById(id: string): Teacher | undefined {
    return this.getTeachers().find((t) => t.id === id);
  },

  createTeacher(payload: Omit<Teacher, "id" | "created_at">): Teacher {
    const teachers = this.getTeachers();

    // Validasi NIP/NUPTK unik (T1)
    const duplicate = teachers.find(
      (t) => t.nip_nuptk === payload.nip_nuptk && t.aktif
    );
    if (duplicate) {
      throw new Error(`Guru dengan NIP/NUPTK ${payload.nip_nuptk} sudah terdaftar (${duplicate.nama_lengkap}).`);
    }

    const newTeacher: Teacher = {
      ...payload,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    // Validasi Zod strict
    const validated = TeacherSchema.parse(newTeacher);

    if (typeof window !== "undefined") {
      const updatedList = [validated, ...teachers];
      localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(updatedList));

      SettingsService.recordAuditLog({
        aksi: "TAMBAH_GURU",
        entitas: "teachers",
        entitas_id: validated.id,
        actor_email: "admin@sekolah.sch.id",
        nilai_sesudah: validated as unknown as Record<string, unknown>,
      });
    }

    return validated;
  },

  updateTeacher(id: string, payload: Partial<Teacher>): Teacher {
    const teachers = this.getTeachers();
    const index = teachers.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error("Data guru tidak ditemukan.");
    }

    // Periksa duplikasi NIP jika NIP diubah
    if (payload.nip_nuptk && payload.nip_nuptk !== teachers[index].nip_nuptk) {
      const dup = teachers.find(
        (t) => t.nip_nuptk === payload.nip_nuptk && t.id !== id && t.aktif
      );
      if (dup) {
        throw new Error(`NIP/NUPTK ${payload.nip_nuptk} sudah digunakan oleh ${dup.nama_lengkap}.`);
      }
    }

    const prev = teachers[index];
    const updated: Teacher = {
      ...prev,
      ...payload,
    };

    const validated = TeacherSchema.parse(updated);
    teachers[index] = validated;

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(teachers));

      SettingsService.recordAuditLog({
        aksi: "UPDATE_GURU",
        entitas: "teachers",
        entitas_id: validated.id,
        actor_email: "admin@sekolah.sch.id",
        nilai_sebelum: prev as unknown as Record<string, unknown>,
        nilai_sesudah: validated as unknown as Record<string, unknown>,
      });
    }

    return validated;
  },

  deactivateTeacher(id: string): void {
    const teachers = this.getTeachers();
    const index = teachers.findIndex((t) => t.id === id);
    if (index === -1) return;

    // Soft delete: tandai aktif = false agar riwayat supervisi tetap utuh (PRD M2)
    teachers[index].aktif = false;

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(teachers));

      SettingsService.recordAuditLog({
        aksi: "NONAKTIFKAN_GURU",
        entitas: "teachers",
        entitas_id: id,
        actor_email: "admin@sekolah.sch.id",
      });
    }
  },

  /**
   * Menghitung frekuensi supervisi minimum per semester (BR-13)
   * Memprioritaskan target sesi kustom yang ditentukan supervisor jika ada
   */
  getRequiredFrequency(teacher: Teacher, latestScore: number | null = null): number {
    if (typeof teacher.target_sesi === "number" && teacher.target_sesi > 0) {
      return teacher.target_sesi;
    }
    const currentYear = new Date().getFullYear();
    return calculateMinimumSupervisionFrequency({
      tahunMasuk: teacher.tahun_masuk,
      currentYear,
      isSeniorMentor: teacher.is_senior_mentor,
      latestScore,
    });
  },

  /**
   * Mengurai teks CSV/TSV salinan dari Sheet 2 Excel
   */
  parseImportData(rawText: string): ImportPreviewResult {
    const lines = rawText.trim().split("\n");
    const existingNIPs = new Set(this.getTeachers().map((t) => t.nip_nuptk));
    const seenInFile = new Set<string>();

    const valid: Teacher[] = [];
    const invalid: ImportPreviewResult["invalid"] = [];

    // Format kolom yang diharapkan:
    // Nama Lengkap | NIP/NUPTK | Mapel | Kelas | Status | Fase | No HP | Email | Tahun Masuk | Senior/Mentor (Y/N)
    lines.forEach((line, index) => {
      // Abaikan header jika ada kata 'nama' atau 'nip'
      if (index === 0 && (line.toLowerCase().includes("nama") || line.toLowerCase().includes("nip"))) {
        return;
      }

      // Deteksi pembatas (koma atau tab)
      const delimiter = line.includes("\t") ? "\t" : ",";
      const cols = line.split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ""));

      if (cols.length < 5) {
        invalid.push({
          baris: index + 1,
          nama: cols[0] || "(Kosong)",
          nip: cols[1] || "-",
          alasan: ["Format kolom tidak lengkap (minimal 5 kolom dasar)"],
        });
        return;
      }

      const nama_lengkap = cols[0];
      const nip_nuptk = cols[1].replace(/\D/g, ""); // hanya digit
      const mata_pelajaran = cols[2];
      const kelas_diampu = cols[3] || "X";
      const status_kepegawaian = cols[4] || "ASN";
      const fase = (cols[5] && ["A", "B", "C", "D", "E", "F"].includes(cols[5].toUpperCase()) ? cols[5].toUpperCase() : "E") as any;
      const nomor_hp = cols[6] || "081234567890";
      const email = cols[7] || `guru_${nip_nuptk}@sekolah.sch.id`;
      const tahun_masuk = parseInt(cols[8], 10) || 2020;
      const is_senior_mentor = cols[9] ? ["y", "ya", "true", "1"].includes(cols[9].toLowerCase()) : false;

      const errors: string[] = [];

      if (!nama_lengkap) errors.push("Nama lengkap wajib diisi");
      if (nip_nuptk.length < 15 || nip_nuptk.length > 18) {
        errors.push(`NIP/NUPTK harus 15-18 digit angka (terbaca ${nip_nuptk.length} digit)`);
      }
      if (seenInFile.has(nip_nuptk)) {
        errors.push("NIP/NUPTK terduplikasi di dalam berkas impor");
      }
      if (existingNIPs.has(nip_nuptk)) {
        errors.push("NIP/NUPTK sudah ada di database sekolah");
      }

      if (errors.length > 0) {
        invalid.push({
          baris: index + 1,
          nama: nama_lengkap || "(Kosong)",
          nip: nip_nuptk || "-",
          alasan: errors,
        });
      } else {
        seenInFile.add(nip_nuptk);
        valid.push({
          id: crypto.randomUUID(),
          nama_lengkap,
          nip_nuptk,
          mata_pelajaran,
          kelas_diampu,
          status_kepegawaian: status_kepegawaian as any,
          fase,
          jabatan_tambahan: null,
          wali_kelas: null,
          nomor_hp,
          email,
          tahun_masuk,
          is_senior_mentor,
          catatan_khusus: "Hasil impor Excel",
          aktif: true,
          created_at: new Date().toISOString(),
        });
      }
    });

    return { valid, invalid };
  },

  commitImport(validTeachers: Teacher[]): void {
    const existing = this.getTeachers();
    const merged = [...validTeachers, ...existing];

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(merged));

      SettingsService.recordAuditLog({
        aksi: "IMPOR_EXCEL_GURU",
        entitas: "teachers",
        entitas_id: "bulk_import",
        actor_email: "admin@sekolah.sch.id",
        nilai_sesudah: { jumlah_diimpor: validTeachers.length },
      });
    }
  },
};
