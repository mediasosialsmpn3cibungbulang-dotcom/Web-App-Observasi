// Layanan pengelolaan Checklist Semesteran 29 Kegiatan Supervisi (Sheet Checklist SSOT)

import { ChecklistItem, ChecklistItemSchema } from "@/contracts/schemas";
import { SEED_CHECKLIST_TEMPLATES } from "@/contracts/seed-data";
import { calculateChecklistProgress } from "@/domain/scoring";
import { SettingsService } from "../settings/settings-service";

const STORAGE_KEY_CHECKLIST = "smart_supervisi_checklist_db";

function generateInitialChecklist(): ChecklistItem[] {
  const currentSemester = "2026/2027 Ganjil";
  const now = new Date().toISOString();

  return SEED_CHECKLIST_TEMPLATES.map((tpl, idx) => {
    // Generate valid UUID dummy untuk butir checklist
    const hex = idx.toString().padStart(4, "0");
    const uuid = `c0000000-0000-0000-0000-00000000${hex}`;

    return {
      ...tpl,
      id: uuid,
      semester: currentSemester,
      updated_at: now,
    };
  });
}

export const ChecklistService = {
  getChecklistItems(): ChecklistItem[] {
    if (typeof window === "undefined") return generateInitialChecklist();
    try {
      const data = localStorage.getItem(STORAGE_KEY_CHECKLIST);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn("Gagal membaca checklist:", e);
    }
    const initial = generateInitialChecklist();
    try {
      localStorage.setItem(STORAGE_KEY_CHECKLIST, JSON.stringify(initial));
    } catch {}
    return initial;
  },

  updateItem(item: ChecklistItem): ChecklistItem {
    const list = this.getChecklistItems();
    const idx = list.findIndex((c) => c.id === item.id);

    const updated: ChecklistItem = {
      ...item,
      updated_at: new Date().toISOString(),
    };

    const validated = ChecklistItemSchema.parse(updated);

    if (idx >= 0) {
      list[idx] = validated;
    } else {
      list.push(validated);
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_CHECKLIST, JSON.stringify(list));
      SettingsService.recordAuditLog({
        aksi: "UPDATE_CHECKLIST",
        entitas: "checklist_items",
        entitas_id: validated.id,
        actor_email: "admin@sekolah.sch.id",
        nilai_sesudah: { nomor_kode: validated.nomor_kode, status: validated.status },
      });
    }

    return validated;
  },

  updateStatus(
    id: string,
    status: ChecklistItem["status"],
    tanggalDeadlineAktual?: string,
    keterangan?: string
  ): ChecklistItem {
    const list = this.getChecklistItems();
    const item = list.find((c) => c.id === id);
    if (!item) throw new Error("Item checklist tidak ditemukan.");

    item.status = status;
    if (tanggalDeadlineAktual !== undefined) {
      item.tanggal_deadline_aktual = tanggalDeadlineAktual || undefined;
    }
    if (keterangan !== undefined) {
      item.keterangan = keterangan || undefined;
    }

    return this.updateItem(item);
  },

  calculateProgress() {
    const items = this.getChecklistItems();
    const statuses = items.map((i) => i.status);
    return calculateChecklistProgress(statuses);
  },

  resetToDefault(): ChecklistItem[] {
    const initial = generateInitialChecklist();
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_CHECKLIST, JSON.stringify(initial));
    }
    return initial;
  },
};
