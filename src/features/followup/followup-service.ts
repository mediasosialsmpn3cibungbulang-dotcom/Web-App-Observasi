import {
  FollowupItem,
  FollowupItemSchema,
  FollowupCheck,
  FollowupCheckSchema,
} from "@/contracts/schemas";
import { isFollowupOverdue } from "@/domain/scoring";
import { SettingsService } from "../settings/settings-service";

const STORAGE_KEY_FOLLOWUPS = "smart_supervisi_followups_db";
const STORAGE_KEY_CHECKS = "smart_supervisi_followup_checks_db";

const SEED_FOLLOWUP_1: FollowupItem = {
  id: "f1111111-1111-1111-1111-111111111111",
  coaching_session_id: "c1111111-1111-1111-1111-111111111111",
  teacher_id: "a1111111-1111-1111-1111-111111111111", // Ahmad Fauzi
  semester: "2026/2027 Ganjil",
  masalah_utama: "Siswa di kelompok 4 dan 5 pasif saat peralihan dari soal cerita ke formulasi simbolik SPLTV.",
  solusi_disepakati: "Mengembangkan LKPD berdiferensiasi dengan scaffolding visual bertingkat untuk membantu abstraksi aljabar.",
  aksi_konkret_guru: "Menyusun dan membagikan 2 varian LKPD (bantuan dasar & tantangan lanjut) serta memantau siswa pasif.",
  dukungan_kepala_sekolah: "Memfasilitasi modul ajar referensi kurikulum merdeka dan penggandaan lembar LKPD sekolah.",
  deadline: "2026-09-15",
  bukti_tindak_lanjut: "Berkas modul LKPD berdiferensiasi dan hasil kerja siswa kelompok 4.",
  foto_bukti_url: null,
  status: "Berjalan",
  kode_pertanyaan_pemicu: "D-01",
  target_indikator_sukses: "Minimal 80% siswa di kelompok kesulitan mampu merumuskan persamaan SPLTV secara mandiri.",
  sumber_daya_dibutuhkan: "Kertas kerja HVS & contoh aplikasi kontekstual.",
  jenis_dukungan: "Sarana dan Prasarana",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

const SEED_CHECK_1: FollowupCheck = {
  id: "fc-1",
  followup_id: "f1111111-1111-1111-1111-111111111111",
  pekan_ke: "2",
  tanggal_cek: "2026-09-01",
  kode_pertanyaan_g: "G-01",
  catatan_hasil: "Guru telah menyusun draft LKPD 2 tingkat dan mengujicobakan pada 1 kelas paralel.",
  dukungan_lanjutan: "Penggandaan materi untuk kelas lainnya telah disetujui.",
  created_at: new Date().toISOString(),
};

export const FollowupService = {
  getFollowups(): FollowupItem[] {
    if (typeof window === "undefined") return [SEED_FOLLOWUP_1];
    try {
      const data = localStorage.getItem(STORAGE_KEY_FOLLOWUPS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn("Gagal membaca followups:", e);
    }
    return [SEED_FOLLOWUP_1];
  },

  getFollowupById(id: string): FollowupItem | undefined {
    return this.getFollowups().find((f) => f.id === id);
  },

  getFollowupsByCoachingSessionId(sessionId: string): FollowupItem[] {
    return this.getFollowups().filter((f) => f.coaching_session_id === sessionId);
  },

  getFollowupsByTeacherId(teacherId: string): FollowupItem[] {
    return this.getFollowups().filter((f) => f.teacher_id === teacherId);
  },

  saveFollowupItem(item: FollowupItem): FollowupItem {
    const list = this.getFollowups();
    const index = list.findIndex((f) => f.id === item.id);

    const updated: FollowupItem = {
      ...item,
      updated_at: new Date().toISOString(),
      version: item.version + 1,
    };

    const validated = FollowupItemSchema.parse(updated);

    if (index >= 0) {
      list[index] = validated;
    } else {
      list.unshift(validated);
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_FOLLOWUPS, JSON.stringify(list));
      SettingsService.recordAuditLog({
        aksi: "SIMPAN_TINDAK_LANJUT",
        entitas: "followup_items",
        entitas_id: validated.id,
        actor_email: "admin@sekolah.sch.id",
        nilai_sesudah: validated as unknown as Record<string, unknown>,
      });
    }

    return validated;
  },

  updateStatus(
    id: string,
    newStatus: "Selesai" | "Berjalan" | "Pending" | "Belum Dimulai",
    isSupervisorOrAdmin: boolean = true
  ): FollowupItem {
    const item = this.getFollowupById(id);
    if (!item) throw new Error("Kesepakatan tindak lanjut tidak ditemukan.");

    // Aturan status PRD M8: status Selesai hanya boleh diberikan supervisor/admin
    if (newStatus === "Selesai" && !isSupervisorOrAdmin) {
      throw new Error("Penetapan status 'Selesai' hanya dapat disahkan oleh Supervisor atau Kepala Sekolah setelah memverifikasi dokumen bukti.");
    }

    item.status = newStatus;
    return this.saveFollowupItem(item);
  },

  getFollowupChecks(followupId: string): FollowupCheck[] {
    if (typeof window === "undefined") {
      return followupId === SEED_FOLLOWUP_1.id ? [SEED_CHECK_1] : [];
    }
    try {
      const data = localStorage.getItem(STORAGE_KEY_CHECKS);
      if (data) {
        const all: FollowupCheck[] = JSON.parse(data);
        return all.filter((c) => c.followup_id === followupId);
      }
    } catch (e) {
      console.warn("Gagal membaca followup checks:", e);
    }
    return followupId === SEED_FOLLOWUP_1.id ? [SEED_CHECK_1] : [];
  },

  saveFollowupCheck(check: Omit<FollowupCheck, "id" | "created_at">): FollowupCheck {
    const newCheck: FollowupCheck = {
      ...check,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    const validated = FollowupCheckSchema.parse(newCheck);

    if (typeof window !== "undefined") {
      const data = localStorage.getItem(STORAGE_KEY_CHECKS);
      const all: FollowupCheck[] = data ? JSON.parse(data) : [SEED_CHECK_1];
      all.push(validated);
      localStorage.setItem(STORAGE_KEY_CHECKS, JSON.stringify(all));
    }

    return validated;
  },

  isOverdue(item: FollowupItem): boolean {
    return isFollowupOverdue(item.deadline, item.status);
  },
};
