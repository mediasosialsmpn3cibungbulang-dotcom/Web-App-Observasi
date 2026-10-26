import { SchoolSettings, GradingSettings, AuditLog } from "@/contracts/schemas";
import { SEED_SCHOOL_SETTINGS, SEED_GRADING_SETTINGS } from "@/contracts/seed-data";
import { CloudSyncService, SYNC_STORAGE_KEYS } from "@/services/cloud-sync-service";

const STORAGE_KEY_SCHOOL_SETTINGS = "smart_supervisi_school_settings";
const STORAGE_KEY_GRADING_SETTINGS = "smart_supervisi_grading_settings";
const STORAGE_KEY_AUDIT_LOGS = "smart_supervisi_audit_logs";

let _cachedSchoolSettings: SchoolSettings | null = null;
let _cachedGradingSettings: GradingSettings | null = null;

/**
 * Layanan manajemen pengaturan sekolah dan standar penilaian (SSOT)
 */
export const SettingsService = {
  getSchoolSettings(): SchoolSettings {
    if (typeof window === "undefined") return SEED_SCHOOL_SETTINGS;
    if (_cachedSchoolSettings) return _cachedSchoolSettings;
    try {
      const data = localStorage.getItem(STORAGE_KEY_SCHOOL_SETTINGS);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.nama_sekolah?.includes("Prestasi Bangsa") || parsed.nama_sekolah?.includes("SMA Negeri 1") || parsed.nama_sekolah?.includes("SMAN 1")) {
          parsed.nama_sekolah = "SMPN 3 Cibungbulang";
          parsed.alamat = "Jl. Raya Cibungbulang, Kab. Bogor, Jawa Barat";
          parsed.npsn = "20200551";
          localStorage.setItem(STORAGE_KEY_SCHOOL_SETTINGS, JSON.stringify(parsed));
        }
        _cachedSchoolSettings = parsed;
        return parsed;
      }
    } catch (e) {
      console.warn("Gagal membaca pengaturan sekolah dari storage:", e);
    }
    _cachedSchoolSettings = SEED_SCHOOL_SETTINGS;
    return SEED_SCHOOL_SETTINGS;
  },

  saveSchoolSettings(settings: SchoolSettings, actorEmail: string = "admin@sekolah.sch.id"): SchoolSettings {
    const prev = this.getSchoolSettings();
    const updated: SchoolSettings = {
      ...settings,
      updated_at: new Date().toISOString(),
    };

    _cachedSchoolSettings = updated;

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_SCHOOL_SETTINGS, JSON.stringify(updated));
      CloudSyncService.pushToCloud(SYNC_STORAGE_KEYS.SCHOOL_SETTINGS, updated);
      this.recordAuditLog({
        aksi: "UPDATE_PENGATURAN_SEKOLAH",
        entitas: "school_settings",
        entitas_id: updated.id,
        actor_email: actorEmail,
        nilai_sebelum: prev as unknown as Record<string, unknown>,
        nilai_sesudah: updated as unknown as Record<string, unknown>,
      });
    }

    return updated;
  },

  getGradingSettings(): GradingSettings {
    if (typeof window === "undefined") return SEED_GRADING_SETTINGS;
    if (_cachedGradingSettings) return _cachedGradingSettings;
    try {
      const data = localStorage.getItem(STORAGE_KEY_GRADING_SETTINGS);
      if (data) {
        const parsed = JSON.parse(data);
        _cachedGradingSettings = parsed;
        return parsed;
      }
    } catch (e) {
      console.warn("Gagal membaca pengaturan skoring dari storage:", e);
    }
    _cachedGradingSettings = SEED_GRADING_SETTINGS;
    return SEED_GRADING_SETTINGS;
  },

  saveGradingSettings(settings: GradingSettings, actorEmail: string = "admin@sekolah.sch.id"): GradingSettings {
    // Validasi ambang batas harus menurun (Amat Baik > Baik > Cukup)
    if (
      settings.ambang_amat_baik <= settings.ambang_baik ||
      settings.ambang_baik <= settings.ambang_cukup
    ) {
      throw new Error("Ambang batas nilai harus menurun: Amat Baik > Baik > Cukup");
    }

    const prev = this.getGradingSettings();
    const updated: GradingSettings = {
      ...settings,
      updated_at: new Date().toISOString(),
    };

    _cachedGradingSettings = updated;

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_GRADING_SETTINGS, JSON.stringify(updated));
      CloudSyncService.pushToCloud(SYNC_STORAGE_KEYS.GRADING_SETTINGS, updated);
      this.recordAuditLog({
        aksi: "UPDATE_STANDAR_PENILAIAN",
        entitas: "grading_settings",
        entitas_id: updated.id,
        actor_email: actorEmail,
        nilai_sebelum: prev as unknown as Record<string, unknown>,
        nilai_sesudah: updated as unknown as Record<string, unknown>,
      });
    }

    return updated;
  },

  getAuditLogs(): AuditLog[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn("Gagal membaca audit logs:", e);
    }
    return [];
  },

  recordAuditLog(params: {
    aksi: string;
    entitas: string;
    entitas_id: string;
    actor_email: string;
    nilai_sebelum?: Record<string, unknown> | null;
    nilai_sesudah?: Record<string, unknown> | null;
  }): void {
    if (typeof window === "undefined") return;
    try {
      const currentLogs = this.getAuditLogs();
      const newLog: AuditLog = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        actor_id: "00000000-0000-0000-0000-000000000001",
        actor_email: params.actor_email,
        aksi: params.aksi,
        entitas: params.entitas,
        entitas_id: params.entitas_id,
        nilai_sebelum: params.nilai_sebelum || null,
        nilai_sesudah: params.nilai_sesudah || null,
        request_id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      };
      localStorage.setItem(
        STORAGE_KEY_AUDIT_LOGS,
        JSON.stringify([newLog, ...currentLogs.slice(0, 99)])
      );
    } catch (e) {
      console.warn("Gagal mencatat audit log:", e);
    }
  },
};
