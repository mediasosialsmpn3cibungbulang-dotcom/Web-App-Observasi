import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Pemetaan kunci storage lokal dengan ID dokumen sinkronisasi di Cloud Supabase
 */
export const SYNC_STORAGE_KEYS = {
  TEACHERS: "smart_supervisi_teachers_db",
  TEACHING_SCHEDULES: "smart_supervisi_teaching_schedules_db",
  SCHEDULES: "smart_supervisi_schedules_db",
  OBSERVATIONS: "smart_supervisi_observations_db",
  SCORES: "smart_supervisi_scores_db",
  FACT_NOTES: "smart_supervisi_fact_notes_db",
  PRE_OBS: "smart_supervisi_pre_obs_db",
  COACHING_SESSIONS: "smart_supervisi_coaching_sessions_db",
  SESSION_QUESTIONS: "smart_supervisi_session_questions_db",
  FOLLOWUPS: "smart_supervisi_followups_db",
  CHECKS: "smart_supervisi_checks_db",
  CHECKLIST: "smart_supervisi_checklist_db",
  SCHOOL_SETTINGS: "smart_supervisi_school_settings_db",
  GRADING_SETTINGS: "smart_supervisi_grading_settings_db",
  AUDIT_LOGS: "smart_supervisi_audit_logs_db",
} as const;

export type SyncStorageKey = typeof SYNC_STORAGE_KEYS[keyof typeof SYNC_STORAGE_KEYS];

/**
 * UUID tetap di tabel public.school_settings untuk partisi namespace penyimpanan Cloud
 */
const CLOUD_SYNC_DOC_IDS: Record<string, string> = {
  [SYNC_STORAGE_KEYS.TEACHING_SCHEDULES]: "c0000001-0000-0000-0000-000000000001",
  [SYNC_STORAGE_KEYS.SCHEDULES]: "c0000001-0000-0000-0000-000000000002",
  [SYNC_STORAGE_KEYS.OBSERVATIONS]: "c0000001-0000-0000-0000-000000000003",
  [SYNC_STORAGE_KEYS.SCORES]: "c0000001-0000-0000-0000-000000000004",
  [SYNC_STORAGE_KEYS.FACT_NOTES]: "c0000001-0000-0000-0000-000000000005",
  [SYNC_STORAGE_KEYS.PRE_OBS]: "c0000001-0000-0000-0000-000000000006",
  [SYNC_STORAGE_KEYS.COACHING_SESSIONS]: "c0000001-0000-0000-0000-000000000007",
  [SYNC_STORAGE_KEYS.SESSION_QUESTIONS]: "c0000001-0000-0000-0000-000000000008",
  [SYNC_STORAGE_KEYS.FOLLOWUPS]: "c0000001-0000-0000-0000-000000000009",
  [SYNC_STORAGE_KEYS.CHECKS]: "c0000001-0000-0000-0000-000000000010",
  [SYNC_STORAGE_KEYS.CHECKLIST]: "c0000001-0000-0000-0000-000000000011",
  [SYNC_STORAGE_KEYS.GRADING_SETTINGS]: "c0000001-0000-0000-0000-000000000012",
  [SYNC_STORAGE_KEYS.AUDIT_LOGS]: "c0000001-0000-0000-0000-000000000013",
  [SYNC_STORAGE_KEYS.TEACHERS]: "c0000001-0000-0000-0000-000000000014",
};

const REALTIME_CHANNEL_NAME = "smart_supervisi_realtime_sync_v1";
const SYNC_EVENT_NAME = "smart-supervisi-data-synced";

export type SyncStatus = "synced" | "syncing" | "offline" | "error";

type StatusListener = (status: SyncStatus, lastSyncTime: Date | null) => void;

class CloudSyncManager {
  private currentStatus: SyncStatus = "synced";
  private lastSyncTime: Date | null = null;
  private listeners: Set<StatusListener> = new Set();
  private realtimeChannel: any = null;
  private isPulling: boolean = false;
  private isPushing: boolean = false;
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    if (typeof window !== "undefined") {
      this.initNetworkListeners();
    }
  }

  private initNetworkListeners() {
    window.addEventListener("online", () => {
      this.setStatus("syncing");
      this.pullAllFromCloud();
    });

    window.addEventListener("offline", () => {
      this.setStatus("offline");
    });

    // Sinkronkan saat pengguna kembali membuka tab atau aplikasi PWA
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        this.pullAllFromCloud();
      }
    });

    window.addEventListener("focus", () => {
      this.pullAllFromCloud();
    });
  }

  public subscribeStatus(listener: StatusListener): () => void {
    this.listeners.add(listener);
    listener(this.currentStatus, this.lastSyncTime);
    return () => this.listeners.delete(listener);
  }

  private setStatus(status: SyncStatus) {
    this.currentStatus = status;
    if (status === "synced") {
      this.lastSyncTime = new Date();
    }
    this.listeners.forEach((fn) => fn(this.currentStatus, this.lastSyncTime));
  }

  /**
   * Menginisialisasi koneksi Realtime WebSocket Supabase untuk sinkronisasi antar perangkat
   */
  public initRealtime(): void {
    if (typeof window === "undefined" || !supabase || !isSupabaseConfigured()) {
      this.setStatus("offline");
      return;
    }

    if (this.realtimeChannel) {
      return;
    }

    try {
      this.realtimeChannel = supabase.channel(REALTIME_CHANNEL_NAME, {
        config: {
          broadcast: { ack: false, self: false },
        },
      });

      // Dengarkan siaran perubahan data dari Chrome / PWA lain
      this.realtimeChannel.on(
        "broadcast",
        { event: "cloud_data_updated" },
        (response: { payload?: { storageKey: string; timestamp: number } }) => {
          if (response?.payload?.storageKey) {
            console.log("⚡ [CloudSync] Menerima update data real-time:", response.payload.storageKey);
            this.pullSingleFromCloud(response.payload.storageKey as SyncStorageKey, false);
          }
        }
      );

      this.realtimeChannel.subscribe((status: string) => {
        if (status === "SUBSCRIBED") {
          console.log("🟢 [CloudSync] Terhubung ke Supabase Realtime Channel.");
          this.setStatus("synced");
        } else if (status === "CHANNEL_ERROR") {
          console.warn("⚠️ [CloudSync] Gagal terhubung ke Realtime channel.");
          this.setStatus("offline");
        }
      });
    } catch (e) {
      console.warn("Gagal inisialisasi Realtime channel:", e);
      this.setStatus("offline");
    }
  }

  /**
   * Tarik (PULL) seluruh data terbaru dari Cloud Supabase ke browser lokal
   */
  public async pullAllFromCloud(): Promise<void> {
    if (typeof window === "undefined" || !supabase || !isSupabaseConfigured()) {
      return;
    }

    if (this.isPulling) return;
    this.isPulling = true;
    this.setStatus("syncing");

    try {
      // 1. Tarik seluruh partisi dokumen dari tabel school_settings
      const docIds = Object.values(CLOUD_SYNC_DOC_IDS);
      const { data: cloudDocs, error } = await supabase
        .from("school_settings")
        .select("id, nama_sekolah, alamat, updated_at")
        .in("id", docIds);

      if (!error && cloudDocs && cloudDocs.length > 0) {
        let hasNewData = false;

        // Balikkan lookup dari docId ke storageKey
        const idToKeyMap = new Map<string, string>();
        Object.entries(CLOUD_SYNC_DOC_IDS).forEach(([key, id]) => {
          idToKeyMap.set(id, key);
        });

        cloudDocs.forEach((doc) => {
          const storageKey = idToKeyMap.get(doc.id);
          if (storageKey && doc.alamat) {
            try {
              const localDataStr = localStorage.getItem(storageKey);
              // Jika data lokal belum ada atau berbeda, perbarui penyimpanan lokal
              if (localDataStr !== doc.alamat) {
                localStorage.setItem(storageKey, doc.alamat);
                hasNewData = true;
              }
            } catch (err) {
              console.warn(`Gagal menyimpan data cloud untuk ${storageKey}:`, err);
            }
          }
        });

        // 2. Tarik juga data guru langsung dari tabel teachers jika ada
        try {
          const { data: teachersData } = await supabase
            .from("teachers")
            .select("*")
            .eq("aktif", true)
            .order("nama_lengkap", { ascending: true });

          if (teachersData && teachersData.length > 0) {
            localStorage.setItem(SYNC_STORAGE_KEYS.TEACHERS, JSON.stringify(teachersData));
            hasNewData = true;
          }
        } catch {
          // toleransi jika error
        }

        // 3. Tarik data pengaturan sekolah utama (baris sekolah resmi)
        try {
          const { data: mainSetting } = await supabase
            .from("school_settings")
            .select("*")
            .not("id", "in", `(${docIds.map((id) => `'${id}'`).join(",")})`)
            .limit(1);

          if (mainSetting && mainSetting.length > 0) {
            localStorage.setItem(SYNC_STORAGE_KEYS.SCHOOL_SETTINGS, JSON.stringify(mainSetting[0]));
            hasNewData = true;
          }
        } catch {
          // toleransi
        }

        if (hasNewData) {
          this.notifyLocalComponents();
        }
      }

      this.setStatus("synced");
    } catch (err) {
      console.warn("Gagal menarik data dari Supabase Cloud:", err);
      this.setStatus("offline");
    } finally {
      this.isPulling = false;
    }
  }

  /**
   * Tarik satu entitas spesifik dari Cloud
   */
  public async pullSingleFromCloud(storageKey: SyncStorageKey, triggerNotify: boolean = true): Promise<void> {
    if (typeof window === "undefined" || !supabase || !isSupabaseConfigured()) {
      return;
    }

    const docId = CLOUD_SYNC_DOC_IDS[storageKey];
    if (!docId) return;

    try {
      const { data, error } = await supabase
        .from("school_settings")
        .select("alamat, updated_at")
        .eq("id", docId)
        .single();

      if (!error && data && data.alamat) {
        const localDataStr = localStorage.getItem(storageKey);
        if (localDataStr !== data.alamat) {
          localStorage.setItem(storageKey, data.alamat);
          if (triggerNotify) {
            this.notifyLocalComponents(storageKey);
          }
        }
      }
    } catch (err) {
      console.warn(`Gagal menarik data ${storageKey} dari cloud:`, err);
    }
  }

  /**
   * Kirim (PUSH) data lokal ke Cloud Supabase dan broadcast ke seluruh Chrome/PWA lain
   */
  public pushToCloud(storageKey: SyncStorageKey, data: any): void {
    if (typeof window === "undefined" || !supabase || !isSupabaseConfigured()) {
      return;
    }

    // Debounce agar tidak membombardir Cloud jika ada banyak perubahan berturut-turut
    const existingTimer = this.debounceTimers.get(storageKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(async () => {
      this.debounceTimers.delete(storageKey);
      await this.executePush(storageKey, data);
    }, 300);

    this.debounceTimers.set(storageKey, timer);
  }

  private async executePush(storageKey: SyncStorageKey, data: any): Promise<void> {
    const docId = CLOUD_SYNC_DOC_IDS[storageKey];
    if (!docId || !supabase) return;

    this.setStatus("syncing");

    try {
      const payloadString = typeof data === "string" ? data : JSON.stringify(data);

      // Simpan ke partisi dokumen Supabase
      const { error } = await supabase.from("school_settings").upsert(
        {
          id: docId,
          nama_sekolah: `SYNC_DOC_${storageKey.toUpperCase()}`,
          alamat: payloadString,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (error) {
        console.warn(`Supabase upsert warning [${storageKey}]:`, error.message);
      } else {
        // Broadcast ke semua perangkat lain via Realtime WebSocket
        if (this.realtimeChannel) {
          this.realtimeChannel.send({
            type: "broadcast",
            event: "cloud_data_updated",
            payload: {
              storageKey,
              timestamp: Date.now(),
            },
          });
        }
        this.setStatus("synced");
      }
    } catch (err) {
      console.warn(`Gagal push ${storageKey} ke Cloud:`, err);
      this.setStatus("error");
    }
  }

  /**
   * Picu event lokal agar seluruh halaman React me-refresh tampilannya secara mulus
   */
  private notifyLocalComponents(storageKey?: string) {
    if (typeof window === "undefined") return;

    window.dispatchEvent(
      new CustomEvent(SYNC_EVENT_NAME, {
        detail: { storageKey, timestamp: Date.now() },
      })
    );
    window.dispatchEvent(new Event("storage"));
  }

  /**
   * Helper untuk mendaftarkan listener pembaruan data lokal
   */
  public onDataSynced(callback: (detail?: { storageKey?: string; timestamp?: number }) => void): () => void {
    if (typeof window === "undefined") return () => {};

    const handler = (e: Event) => {
      const customEvent = e as CustomEvent;
      callback(customEvent.detail);
    };

    window.addEventListener(SYNC_EVENT_NAME, handler);
    window.addEventListener("storage", handler);

    return () => {
      window.removeEventListener(SYNC_EVENT_NAME, handler);
      window.removeEventListener("storage", handler);
    };
  }
}

export const CloudSyncService = new CloudSyncManager();
