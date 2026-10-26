import {
  CoachingSession,
  CoachingSessionSchema,
  CoachingSessionQuestionItem,
  CoachingSessionQuestionItemSchema,
  Teacher,
} from "@/contracts/schemas";
import { SEED_COACHING_QUESTIONS } from "@/contracts/seed-data";
import { SettingsService } from "../settings/settings-service";
import { ObservationService } from "../observation/observation-service";
import { FollowupService } from "../followup/followup-service";
import { CloudSyncService, SYNC_STORAGE_KEYS } from "@/services/cloud-sync-service";

const STORAGE_KEY_COACHING_SESSIONS = "smart_supervisi_coaching_sessions_db";
const STORAGE_KEY_SESSION_QUESTIONS = "smart_supervisi_coaching_session_questions_db";

const SEED_COACHING_SESSION_1: CoachingSession = {
  id: "c1111111-1111-1111-1111-111111111111",
  observation_id: "o1111111-1111-1111-1111-111111111111",
  teacher_id: "a1111111-1111-1111-1111-111111111111", // Aini Supiyah, S.Pd, MM
  supervisor_id: "00000000-0000-0000-0000-000000000001",
  semester: "2026/2027 Ganjil",
  tanggal_coaching: "2026-08-18",
  waktu_mulai: "10:00",
  tempat: "Ruang Konsultasi Akademik",
  nomor_dokumen: "NC/2026/08/001",
  refleksi_guru: {
    hal_sudah_baik: "Apersepsi kontekstual struk parkir berhasil menarik perhatian siswa sejak awal.",
    hal_perlu_ditingkatkan: "Pembagian waktu diskusi kelompok agak molor dan scaffolding kelompok 4 belum tuntas.",
    tantangan_terbesar: "Menjembatani perbedaan kecepatan pemahaman konsep aljabar pada siswa yang heterogen.",
    perasaan_setelah_mengajar: "Lega namun terdorong untuk memperbaiki teknik scaffolding berdiferensiasi.",
  },
  temuan_aspek: {
    A: "Apersepsi sangat kuat dan kontekstual.",
    B: "Penyampaian materi runtut dan analogi jelas.",
    C: "Komunikasi dua arah berjalan hidup.",
    D: "Diferensiasi proses mulai tampak namun butuh scaffolding bertahap.",
    E: "Asesmen formatif berkala perlu diperjelas rubriknya.",
    F: "Pengelolaan kelas dan transisi waktu kelompok perlu diefisiensikan.",
    G: "Rangkuman kesimpulan terlaksana baik di akhir sesi.",
  },
  poin_kunci_dialog: "Mendiskusikan solusi agar siswa di kelompok yang kesulitan aljabar dapat belajar mandiri tanpa terus bergantung pada penjelasan guru.",
  insight_utama_guru: "Guru menyadari perlunya lembar bantuan visual (scaffolding sheet) berjenjang sebelum latihan soal dimulai.",
  komitmen_utama_guru: "Akan menyusun dan mempraktikkan LKPD berjenjang 2 tingkat kesulitan pada pertemuan pekan depan.",
  rencana_monitoring_berikutnya: "2026-09-01", // Pekan ke-2
  catatan_supervisor: "Guru sangat terbuka terhadap umpan balik reflektif dan memiliki inisiatif solusi mandiri yang luar biasa.",
  status: "Final",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

const SEED_SESSION_QUESTIONS_1: CoachingSessionQuestionItem[] = [
  {
    session_id: "c1111111-1111-1111-1111-111111111111",
    kode_pertanyaan: "A-01",
    urutan: 1,
    jawaban_ringkas_guru: "Merasa cukup puas namun agak lelah karena banyak mendampingi kelompok yang kesulitan.",
  },
  {
    session_id: "c1111111-1111-1111-1111-111111111111",
    kode_pertanyaan: "A-04",
    urutan: 2,
    jawaban_ringkas_guru: "Momen terbaik saat siswa menyadari hubungan persamaan linear dengan tarif parkir harian mereka.",
  },
  {
    session_id: "c1111111-1111-1111-1111-111111111111",
    kode_pertanyaan: "D-01",
    urutan: 3,
    jawaban_ringkas_guru: "Akan membuat 2 varian LKPD berdiferensiasi dan memantau siswa pasif di baris belakang.",
  },
];

export const CoachingService = {
  getSessions(): CoachingSession[] {
    if (typeof window === "undefined") return [SEED_COACHING_SESSION_1];
    try {
      const data = localStorage.getItem(STORAGE_KEY_COACHING_SESSIONS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn("Gagal membaca coaching sessions:", e);
    }
    return [SEED_COACHING_SESSION_1];
  },

  getSessionById(id: string): CoachingSession | undefined {
    return this.getSessions().find((s) => s.id === id);
  },

  getSessionByObservationId(observationId: string): CoachingSession | undefined {
    return this.getSessions().find((s) => s.observation_id === observationId);
  },

  getSessionQuestions(sessionId: string): CoachingSessionQuestionItem[] {
    if (typeof window === "undefined") {
      return sessionId === SEED_COACHING_SESSION_1.id ? SEED_SESSION_QUESTIONS_1 : [];
    }
    try {
      const data = localStorage.getItem(STORAGE_KEY_SESSION_QUESTIONS);
      if (data) {
        const all: CoachingSessionQuestionItem[] = JSON.parse(data);
        return all.filter((q) => q.session_id === sessionId);
      }
    } catch (e) {
      console.warn("Gagal membaca session questions:", e);
    }
    return sessionId === SEED_COACHING_SESSION_1.id ? SEED_SESSION_QUESTIONS_1 : [];
  },

  saveSession(session: CoachingSession): CoachingSession {
    const list = this.getSessions();
    const index = list.findIndex(
      (s) =>
        s.id === session.id ||
        (session.observation_id && s.observation_id === session.observation_id)
    );

    const updated: CoachingSession = {
      ...session,
      updated_at: new Date().toISOString(),
      version: session.version + 1,
    };

    const validated = CoachingSessionSchema.parse(updated);

    if (index >= 0) {
      list[index] = validated;
    } else {
      list.unshift(validated);
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_COACHING_SESSIONS, JSON.stringify(list));
      CloudSyncService.pushToCloud(SYNC_STORAGE_KEYS.COACHING_SESSIONS, list);

      SettingsService.recordAuditLog({
        aksi: "SIMPAN_SESI_COACHING",
        entitas: "coaching_sessions",
        entitas_id: validated.id,
        actor_email: "admin@sekolah.sch.id",
        nilai_sesudah: validated as unknown as Record<string, unknown>,
      });
    }

    return validated;
  },

  saveSessionQuestions(sessionId: string, questions: CoachingSessionQuestionItem[]): void {
    if (typeof window === "undefined") return;
    try {
      const data = localStorage.getItem(STORAGE_KEY_SESSION_QUESTIONS);
      let all: CoachingSessionQuestionItem[] = data ? JSON.parse(data) : [...SEED_SESSION_QUESTIONS_1];
      all = all.filter((q) => q.session_id !== sessionId);
      all.push(...questions);
      localStorage.setItem(STORAGE_KEY_SESSION_QUESTIONS, JSON.stringify(all));
      CloudSyncService.pushToCloud(SYNC_STORAGE_KEYS.SESSION_QUESTIONS, all);
    } catch (e) {
      console.warn("Gagal menyimpan session questions:", e);
    }
  },

  finalizeSession(sessionId: string): CoachingSession {
    const session = this.getSessionById(sessionId);
    if (!session) throw new Error("Sesi coaching tidak ditemukan.");

    // Syarat kelulusan finalisasi sesuai PRD M7:
    // 1. Minimal 3 pertanyaan terpilih
    const questions = this.getSessionQuestions(sessionId);
    if (questions.length < 3) {
      throw new Error(`Sesi coaching wajib memuat minimal 3 pertanyaan percakapan reflektif (saat ini ${questions.length} terpilih).`);
    }

    // 2. Intisari dialog wajib diisi lengkap saat finalisasi
    if (!session.poin_kunci_dialog || session.poin_kunci_dialog.trim().length === 0) {
      throw new Error("Poin kunci dialog wajib diisi sebelum finalisasi sesi coaching.");
    }
    if (!session.insight_utama_guru || session.insight_utama_guru.trim().length === 0) {
      throw new Error("Insight / kesadaran baru guru wajib diisi sebelum finalisasi sesi coaching.");
    }
    if (!session.komitmen_utama_guru || session.komitmen_utama_guru.trim().length === 0) {
      throw new Error("Komitmen aksi nyata guru wajib diisi sebelum finalisasi sesi coaching.");
    }

    // 3. Tanggal monitoring berikutnya terisi
    if (!session.rencana_monitoring_berikutnya) {
      throw new Error("Tanggal monitoring berikutnya wajib ditetapkan sebelum finalisasi.");
    }

    // 4. Kesepakatan tindak lanjut minimal 1 baris
    const followups = FollowupService.getFollowupsByCoachingSessionId(sessionId);
    if (followups.length === 0) {
      throw new Error("Sesi coaching wajib menghasilkan minimal 1 butir kesepakatan tindak lanjut nyata.");
    }

    session.status = "Final";
    return this.saveSession(session);
  },
};
