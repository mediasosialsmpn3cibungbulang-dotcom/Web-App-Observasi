"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, AlertTriangle, Check } from "lucide-react";
import { Schedule, Teacher } from "@/contracts/schemas";
import { Button } from "@/components/ui/Button";
import { TeacherService } from "../teachers/teacher-service";
import { SettingsService } from "../settings/settings-service";

interface ScheduleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Schedule, "id" | "created_at" | "version">) => void;
  initialData?: Schedule | null;
}

export const ScheduleFormModal: React.FC<ScheduleFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [formData, setFormData] = useState({
    teacher_id: "",
    gelombang: "2 Reguler" as "1 Prioritas" | "2 Reguler",
    rencana_pra_observasi: "",
    rencana_observasi: "",
    rencana_coaching: "",
    supervisor_id: "00000000-0000-0000-0000-000000000001",
  });

  const [warnings, setWarnings] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const list = TeacherService.getTeachers().filter((t) => t.aktif);
    setTeachers(list);

    if (initialData) {
      setFormData({
        teacher_id: initialData.teacher_id,
        gelombang: initialData.gelombang,
        rencana_pra_observasi: initialData.rencana_pra_observasi,
        rencana_observasi: initialData.rencana_observasi,
        rencana_coaching: initialData.rencana_coaching,
        supervisor_id: initialData.supervisor_id,
      });
    } else {
      const defaultTeacherId = list.length > 0 ? list[0].id : "";
      const today = new Date();
      // Default tanggal: H-5, Obs, H+2
      const praDate = new Date(today.getTime() + 2 * 24 * 3600 * 1000).toISOString().split("T")[0];
      const obsDate = new Date(today.getTime() + 7 * 24 * 3600 * 1000).toISOString().split("T")[0];
      const coachDate = new Date(today.getTime() + 9 * 24 * 3600 * 1000).toISOString().split("T")[0];

      setFormData({
        teacher_id: defaultTeacherId,
        gelombang: "2 Reguler",
        rencana_pra_observasi: praDate,
        rencana_observasi: obsDate,
        rencana_coaching: coachDate,
        supervisor_id: "00000000-0000-0000-0000-000000000001",
      });
    }
  }, [initialData, isOpen]);

  // Validasi jarak waktu dinamis (BR-14)
  useEffect(() => {
    const warn: string[] = [];
    if (formData.rencana_pra_observasi && formData.rencana_observasi) {
      const pra = new Date(formData.rencana_pra_observasi).getTime();
      const obs = new Date(formData.rencana_observasi).getTime();
      const diffDays = Math.round((obs - pra) / (1000 * 3600 * 24));

      if (diffDays < 5) {
        warn.push(`Jarak Pra-Observasi ke Observasi adalah ${diffDays} hari (disarankan minimal 5 hari sebelum observasi).`);
      }
    }

    if (formData.rencana_observasi && formData.rencana_coaching) {
      const obs = new Date(formData.rencana_observasi).getTime();
      const coach = new Date(formData.rencana_coaching).getTime();
      const diffDays = Math.round((coach - obs) / (1000 * 3600 * 24));

      if (diffDays > 3) {
        warn.push(`Jarak Observasi ke Coaching adalah ${diffDays} hari (disarankan paling lambat H+3 setelah observasi).`);
      }
      if (diffDays < 0) {
        warn.push("Tanggal Coaching tidak boleh mendahului tanggal Observasi.");
      }
    }

    setWarnings(warn);
  }, [formData.rencana_pra_observasi, formData.rencana_observasi, formData.rencana_coaching]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.teacher_id) {
      setErrorMsg("Pilih guru sasaran supervisi terlebih dahulu.");
      return;
    }

    const currentSemester = SettingsService.getSchoolSettings().semester_aktif;

    try {
      onSubmit({
        ...formData,
        semester: currentSemester,
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Gagal menyimpan jadwal.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-surface border border-border rounded-panel max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-base font-bold font-serif text-foreground">
            {initialData ? "Ubah Jadwal Supervisi" : "Tambah Rencana Jadwal Supervisi"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-control bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-muted mb-1">
              Guru Sasaran Supervisi *
            </label>
            <select
              value={formData.teacher_id}
              onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nama_lengkap} ({t.mata_pelajaran} - {t.status_kepegawaian})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-muted mb-1">
              Gelombang Pelaksanaan *
            </label>
            <select
              value={formData.gelombang}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  gelombang: e.target.value as "1 Prioritas" | "2 Reguler",
                })
              }
              className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="1 Prioritas">Gelombang 1 (Prioritas - Guru Baru & Skor Rendah)</option>
              <option value="2 Reguler">Gelombang 2 (Reguler - Siklus Rutin)</option>
            </select>
          </div>

          <div className="space-y-3 pt-2 border-t border-border">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1">
                Rencana Tanggal Pra-Observasi (H-5) *
              </label>
              <input
                type="date"
                value={formData.rencana_pra_observasi}
                onChange={(e) => setFormData({ ...formData, rencana_pra_observasi: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1">
                Rencana Tanggal Observasi Kelas (1 JP) *
              </label>
              <input
                type="date"
                value={formData.rencana_observasi}
                onChange={(e) => setFormData({ ...formData, rencana_observasi: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-mono font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted mb-1">
                Rencana Tanggal Sesi Coaching (Maks. H+3) *
              </label>
              <input
                type="date"
                value={formData.rencana_coaching}
                onChange={(e) => setFormData({ ...formData, rencana_coaching: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          {/* Banner Peringatan Jarak Waktu (Lunak / Non-blocking) */}
          {warnings.length > 0 && (
            <div className="p-3 rounded-control bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Peringatan Jarak Waktu (SOP BR-14):</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                {warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              <Check className="w-4 h-4 mr-1.5" />
              Simpan Jadwal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
