import { PreObservation, PreObservationSchema, Teacher } from "@/contracts/schemas";
import { SettingsService } from "../settings/settings-service";
import { TeacherService } from "../teachers/teacher-service";
import { ScheduleService } from "../schedules/schedule-service";

const STORAGE_KEY_PRE_OBS = "smart_supervisi_pre_obs_db";

const SEED_PRE_OBSERVATION: PreObservation = {
  id: "p1111111-1111-1111-1111-111111111111",
  schedule_id: "s1111111-1111-1111-1111-111111111111",
  teacher_id: "a1111111-1111-1111-1111-111111111111", // Aini Supiyah, S.Pd, MM
  supervisor_id: "00000000-0000-0000-0000-000000000001",
  semester: "2026/2027 Ganjil",
  tanggal_pelaksanaan: "2026-08-10",
  topik_pembelajaran: "Keragaman Aktivitas Ekonomi & Interaksi Antarruang di Indonesia",
  tujuan_pembelajaran: "Siswa mampu menganalisis peran perdagangan antarpulau dalam pengembangan ekonomi maritim dan agrikultur secara kritis.",
  metode_pembelajaran: "Problem-Based Learning (PBL) Berdiferensiasi",
  media_alat: "Lembar Kerja Peserta Didik (LKPD), Peta Tematik Ekonomi Indonesia, LCD Proyektor",
  teknik_asesmen: "Asesmen Formatif (Kuis Cepat Exit Ticket) & Rubrik Diskusi Kelompok",
  alokasi_waktu: "2 JP (2 x 40 Menit)",
  jumlah_siswa: 32,
  karakteristik_siswa: "Kesiapan belajar beragam: 10 siswa mahir literasi spasial, 16 siswa sedang, 6 siswa butuh pendampingan khusus.",
  tantangan_dihadapi: "Siswa cenderung pasif saat peralihan dari membaca peta tematik ke analisis perbandingan komoditas.",
  rencana_diferensiasi: "Menyediakan LKPD berjenjang (scaffolding) dan membagi kelompok belajar berdasarkan profil minat.",
  harapan_guru: "Mendapatkan masukan konstruktif mengenai proporsi waktu saat membimbing kelompok yang tertinggal.",
  fokus_amatan: [
    {
      aspek: "D",
      indikator_sukses: "Pemberian scaffolding berjenjang tepat sasaran pada kelompok siswa yang mengalami kesulitan.",
      catatan_khusus: "Perhatikan interaksi di kelompok 4 dan 5.",
    },
    {
      aspek: "C",
      indikator_sukses: "Pemerataan pertanyaan pemantik analitis (HOTS) agar menjangkau barisan tengah dan belakang.",
      catatan_khusus: "Gunakan waktu tunggu (wait time) minimal 5 detik.",
    },
    {
      aspek: "F",
      indikator_sukses: "Efisiensi transisi waktu dari penjelasan klasikal menuju kerja kelompok maksimal 5 menit.",
      catatan_khusus: "Amati penggunaan timer visual di layar kelas.",
    },
  ],
  status: "Final",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const PreObservationService = {
  getPreObservations(): PreObservation[] {
    if (typeof window === "undefined") return [SEED_PRE_OBSERVATION];
    try {
      const data = localStorage.getItem(STORAGE_KEY_PRE_OBS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn("Gagal membaca pra-observasi dari storage:", e);
    }
    return [SEED_PRE_OBSERVATION];
  },

  getByTeacherId(teacherId: string): PreObservation | undefined {
    return this.getPreObservations().find((p) => p.teacher_id === teacherId);
  },

  savePreObservation(payload: PreObservation): PreObservation {
    const list = this.getPreObservations();
    const index = list.findIndex((p) => p.id === payload.id);

    const updated: PreObservation = {
      ...payload,
      updated_at: new Date().toISOString(),
      version: payload.version + 1,
    };

    const validated = PreObservationSchema.parse(updated);

    if (index >= 0) {
      list[index] = validated;
    } else {
      list.unshift(validated);
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_PRE_OBS, JSON.stringify(list));

      SettingsService.recordAuditLog({
        aksi: "SIMPAN_PRA_OBSERVASI",
        entitas: "pre_observations",
        entitas_id: validated.id,
        actor_email: "admin@sekolah.sch.id",
        nilai_sesudah: validated as unknown as Record<string, unknown>,
      });
    }

    return validated;
  },
};
