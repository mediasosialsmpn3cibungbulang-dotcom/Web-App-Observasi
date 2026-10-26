"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Calendar, AlertTriangle, Check, Clock, BookOpen, UserCheck, AlertCircle, Sparkles, ChevronRight } from "lucide-react";
import { Schedule, Teacher } from "@/contracts/schemas";
import { Button } from "@/components/ui/Button";
import { TeacherService } from "../teachers/teacher-service";
import { SettingsService } from "../settings/settings-service";
import {
  getTeacherSchedule,
  getTeachingDays,
  validateObservationDateAgainstSchedule,
  getDayNameFromDate,
  TeachingSlot,
  DayName,
} from "@/contracts/teaching-schedules";

interface ScheduleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Schedule, "id" | "created_at" | "version">) => void;
  initialData?: Schedule | null;
}

/**
 * Mencari tanggal berikutnya yang jatuh pada salah satu hari sekolah yang dipilih
 */
function findNextDateForDay(targetDay: DayName, baseDate: Date = new Date()): string {
  const dayIndexMap: Record<DayName, number> = {
    Senin: 1,
    Selasa: 2,
    Rabu: 3,
    Kamis: 4,
    Jumat: 5,
  };
  const targetDayIdx = dayIndexMap[targetDay];
  const currentDayIdx = baseDate.getDay();
  let diff = targetDayIdx - currentDayIdx;
  if (diff < 0) {
    diff += 7;
  } else if (diff === 0) {
    diff = 7; // Ambil pekan berikutnya jika hari yang sama
  }
  const result = new Date(baseDate.getTime() + diff * 24 * 3600 * 1000);
  return result.toISOString().split("T")[0];
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
    jam_observasi: "",
    kelas_observasi: "",
    mapel_observasi: "",
    hari_observasi: "",
  });

  const [warnings, setWarnings] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");

  // Inisialisasi daftar guru dan data form
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
        jam_observasi: initialData.jam_observasi || "",
        kelas_observasi: initialData.kelas_observasi || "",
        mapel_observasi: initialData.mapel_observasi || "",
        hari_observasi: initialData.hari_observasi || "",
      });
    } else {
      const defaultTeacherId = list.length > 0 ? list[0].id : "";
      const today = new Date();

      // Cari hari mengajar yang valid untuk guru pertama
      const teachingDays = getTeachingDays(defaultTeacherId);
      const targetDay: DayName = teachingDays.length > 0 ? teachingDays[0] : "Senin";
      const obsDate = findNextDateForDay(targetDay, new Date(today.getTime() + 5 * 24 * 3600 * 1000));
      
      const obsDateObj = new Date(obsDate);
      const praDate = new Date(obsDateObj.getTime() - 5 * 24 * 3600 * 1000).toISOString().split("T")[0];
      const coachDate = new Date(obsDateObj.getTime() + 2 * 24 * 3600 * 1000).toISOString().split("T")[0];

      setFormData({
        teacher_id: defaultTeacherId,
        gelombang: "2 Reguler",
        rencana_pra_observasi: praDate,
        rencana_observasi: obsDate,
        rencana_coaching: coachDate,
        supervisor_id: "00000000-0000-0000-0000-000000000001",
        jam_observasi: "",
        kelas_observasi: "",
        mapel_observasi: "",
        hari_observasi: targetDay,
      });
    }
  }, [initialData, isOpen]);

  // Dapatkan profil jadwal aSc guru yang dipilih
  const currentTeacherSchedule = useMemo(() => {
    return getTeacherSchedule(formData.teacher_id);
  }, [formData.teacher_id]);

  const teacherTeachingDays = useMemo(() => {
    return getTeachingDays(formData.teacher_id);
  }, [formData.teacher_id]);

  // Validasi real-time tanggal observasi terhadap jadwal mengajar resmi
  const scheduleValidation = useMemo(() => {
    if (!formData.teacher_id || !formData.rencana_observasi) {
      return {
        isValid: false,
        dayName: null,
        slots: [] as TeachingSlot[],
        message: "Pilih guru dan tanggal observasi terlebih dahulu.",
      };
    }
    return validateObservationDateAgainstSchedule(formData.teacher_id, formData.rencana_observasi);
  }, [formData.teacher_id, formData.rencana_observasi]);

  // Sinkronisasi slot jam mengajar saat tanggal/guru berubah
  useEffect(() => {
    if (!scheduleValidation.isValid) {
      setSelectedSlotId("");
      return;
    }

    const slots = scheduleValidation.slots;
    if (slots.length > 0) {
      // Cari apakah slot sebelumnya masih cocok
      const existingSlot = slots.find(
        (s) =>
          formData.jam_observasi.includes(s.waktu) &&
          (formData.kelas_observasi === "" || formData.kelas_observasi === s.kelas)
      );

      if (existingSlot) {
        setSelectedSlotId(existingSlot.id);
      } else {
        // Otomatis pilih slot pertama dari hari yang sah
        const firstSlot = slots[0];
        setSelectedSlotId(firstSlot.id);
        const formattedJam = firstSlot.jam_ke
          ? `${firstSlot.jam_ke} (${firstSlot.waktu})`
          : firstSlot.waktu;
        setFormData((prev) => ({
          ...prev,
          jam_observasi: formattedJam,
          kelas_observasi: firstSlot.kelas,
          mapel_observasi: firstSlot.mata_pelajaran,
          hari_observasi: firstSlot.hari,
        }));
      }
    } else {
      setSelectedSlotId("");
      if (scheduleValidation.dayName) {
        setFormData((prev) => ({
          ...prev,
          hari_observasi: scheduleValidation.dayName || "",
        }));
      }
    }
  }, [scheduleValidation.isValid, scheduleValidation.slots, scheduleValidation.dayName]);

  // Handler saat slot jam mengajar dipilih
  const handleSlotSelect = (slot: TeachingSlot) => {
    setSelectedSlotId(slot.id);
    const formattedJam = slot.jam_ke ? `${slot.jam_ke} (${slot.waktu})` : slot.waktu;
    setFormData((prev) => ({
      ...prev,
      jam_observasi: formattedJam,
      kelas_observasi: slot.kelas,
      mapel_observasi: slot.mata_pelajaran,
      hari_observasi: slot.hari,
    }));
  };

  // Handler jalan pintas: alihkan tanggal ke hari mengajar guru yang sah
  const handleQuickSwitchDay = (day: DayName) => {
    const nextDate = findNextDateForDay(day);
    const nextDateObj = new Date(nextDate);
    const praDate = new Date(nextDateObj.getTime() - 5 * 24 * 3600 * 1000).toISOString().split("T")[0];
    const coachDate = new Date(nextDateObj.getTime() + 2 * 24 * 3600 * 1000).toISOString().split("T")[0];

    setFormData((prev) => ({
      ...prev,
      rencana_observasi: nextDate,
      rencana_pra_observasi: praDate,
      rencana_coaching: coachDate,
      hari_observasi: day,
    }));
    setErrorMsg(null);
  };

  // Validasi jarak waktu dinamis SOP (BR-14)
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

    if (!scheduleValidation.isValid) {
      setErrorMsg(scheduleValidation.message || "Tanggal observasi tidak valid sesuai jadwal mengajar guru.");
      return;
    }

    if (scheduleValidation.slots.length > 0 && !formData.jam_observasi) {
      setErrorMsg("Pilih salah satu jam mengajar dan kelas observasi yang tersedia.");
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

  const selectedTeacher = teachers.find((t) => t.id === formData.teacher_id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/60 backdrop-blur-xs select-none animate-fadeIn">
      <div className="bg-surface border border-border rounded-panel max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-border bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-foreground">
                {initialData ? "Ubah Rencana Jadwal Supervisi" : "Tambah Rencana Jadwal Supervisi"}
              </h3>
              <p className="text-xs text-muted">
                Tersinkronisasi 100% dengan Jadwal Mengajar Resmi aSc Timetables
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-control bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Pilihan Guru Sasaran */}
          <div>
            <label className="block text-xs font-semibold uppercase text-muted mb-1.5 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-primary" />
              Guru Sasaran Supervisi *
            </label>
            <select
              value={formData.teacher_id}
              onChange={(e) => {
                const newTeacherId = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  teacher_id: newTeacherId,
                  jam_observasi: "",
                  kelas_observasi: "",
                  mapel_observasi: "",
                }));
              }}
              className="w-full px-3.5 py-2.5 text-sm rounded-control border border-border bg-surface text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
              required
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nama_lengkap} ({t.mata_pelajaran} - {t.status_kepegawaian})
                </option>
              ))}
            </select>
          </div>

          {/* Banner Informasi Hari Mengajar Guru dari aSc Timetables */}
          {teacherTeachingDays.length > 0 && (
            <div className="p-3 rounded-control bg-slate-50 dark:bg-slate-900/60 border border-border text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  Hari Mengajar Resmi Guru (aSc):
                </span>
                <span className="text-[11px] text-muted">
                  Total {currentTeacherSchedule?.slots.length || 0} Jam Pelajaran
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 items-center">
                {teacherTeachingDays.map((d) => {
                  const isCurrentDay = scheduleValidation.dayName === d;
                  return (
                    <button
                      type="button"
                      key={d}
                      onClick={() => handleQuickSwitchDay(d)}
                      title={`Klik untuk mengatur jadwal observasi ke hari ${d} berikutnya`}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
                        isCurrentDay
                          ? "bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/30"
                          : "bg-surface text-foreground border border-border hover:border-primary/50 hover:bg-primary/5"
                      }`}
                    >
                      {d}
                      {isCurrentDay && <Check className="w-3 h-3 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Gelombang Supervisi */}
          <div>
            <label className="block text-xs font-semibold uppercase text-muted mb-1.5">
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
              className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
            >
              <option value="1 Prioritas">Gelombang 1 (Prioritas - Guru Baru & Skor Rendah)</option>
              <option value="2 Reguler">Gelombang 2 (Reguler - Siklus Rutin)</option>
            </select>
          </div>

          {/* Baris Tanggal Siklus 3 Tahap */}
          <div className="space-y-3 pt-3 border-t border-border">
            {/* Input Tanggal Observasi (Fokus Utama) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase text-primary flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Rencana Tanggal Observasi Kelas (Wajib Hari Mengajar) *
                </label>
                {scheduleValidation.dayName && (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      scheduleValidation.isValid
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    Hari {scheduleValidation.dayName}
                  </span>
                )}
              </div>
              <input
                type="date"
                value={formData.rencana_observasi}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rencana_observasi: e.target.value,
                  })
                }
                className={`w-full px-3.5 py-2.5 text-sm rounded-control border bg-surface text-foreground font-mono font-semibold focus:outline-none focus:ring-2 shadow-xs ${
                  scheduleValidation.isValid
                    ? "border-primary text-primary focus:ring-primary"
                    : "border-rose-500 text-rose-600 focus:ring-rose-500"
                }`}
                required
              />

              {/* Status Validasi Tanggal Observasi */}
              {!scheduleValidation.isValid ? (
                <div className="mt-2 p-3 rounded-control bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                    <span>Tanggal Tidak Sesuai Jadwal Mengajar:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {scheduleValidation.message}
                  </p>
                  {teacherTeachingDays.length > 0 && (
                    <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-semibold text-rose-900 dark:text-rose-100">
                        Pilih tanggal hari mengajar:
                      </span>
                      {teacherTeachingDays.map((d) => (
                        <button
                          type="button"
                          key={d}
                          onClick={() => handleQuickSwitchDay(d)}
                          className="px-2 py-0.5 rounded bg-rose-600 text-white text-[11px] font-medium hover:bg-rose-700 transition-colors"
                        >
                          Pilih {d}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Tanggal observasi sah (Hari {scheduleValidation.dayName} merupakan jadwal mengajar aktif).
                </div>
              )}
            </div>

            {/* Pemilihan Slot Jam Pelajaran & Kelas yang Tersedia Pada Hari Tersebut */}
            {scheduleValidation.isValid && scheduleValidation.slots.length > 0 && (
              <div className="p-3.5 rounded-control bg-primary/5 border border-primary/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    Pilih Jam Mengajar & Kelas Observasi *
                  </label>
                  <span className="text-[10px] text-muted uppercase tracking-wider font-mono">
                    {scheduleValidation.slots.length} Slot Tersedia
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {scheduleValidation.slots.map((slot) => {
                    const isSelected =
                      selectedSlotId === slot.id ||
                      (formData.jam_observasi.includes(slot.waktu) && formData.kelas_observasi === slot.kelas);
                    return (
                      <button
                        type="button"
                        key={slot.id}
                        onClick={() => handleSlotSelect(slot)}
                        className={`text-left p-2.5 rounded-control border transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-xs ring-2 ring-primary/30"
                            : "bg-surface text-foreground border-border hover:border-primary/40 hover:bg-black/5 dark:hover:bg-white/5"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? "border-primary-foreground bg-primary-foreground text-primary"
                              : "border-muted"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold truncate">
                              {slot.jam_ke || "Jam KBM"}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                                isSelected
                                  ? "bg-primary-foreground/20 text-primary-foreground"
                                  : "bg-black/5 dark:bg-white/5 text-muted"
                              }`}
                            >
                              {slot.waktu}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="font-semibold underline decoration-dotted">
                              Kelas {slot.kelas}
                            </span>
                            <span className="truncate opacity-90">
                              • {slot.mata_pelajaran}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {formData.jam_observasi && (
                  <div className="pt-1.5 border-t border-primary/20 flex items-center justify-between text-[11px] text-muted">
                    <span>Terpilih: <strong>{formData.jam_observasi}</strong></span>
                    <span>Kelas: <strong>{formData.kelas_observasi}</strong></span>
                  </div>
                )}
              </div>
            )}

            {/* Input Tanggal Pra-Observasi & Coaching */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Rencana Pra-Observasi (H-5) *
                </label>
                <input
                  type="date"
                  value={formData.rencana_pra_observasi}
                  onChange={(e) =>
                    setFormData({ ...formData, rencana_pra_observasi: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Rencana Coaching (Maks. H+3) *
                </label>
                <input
                  type="date"
                  value={formData.rencana_coaching}
                  onChange={(e) =>
                    setFormData({ ...formData, rencana_coaching: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                  required
                />
              </div>
            </div>
          </div>

          {/* Banner Peringatan Jarak Waktu (Lunak / Non-blocking BR-14) */}
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

          {/* Aksi Tombol */}
          <div className="pt-4 border-t border-border flex justify-end items-center gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={
                !scheduleValidation.isValid ||
                (scheduleValidation.slots.length > 0 && !formData.jam_observasi)
              }
              title={
                !scheduleValidation.isValid
                  ? "Pilih tanggal observasi yang sesuai dengan hari mengajar guru"
                  : scheduleValidation.slots.length > 0 && !formData.jam_observasi
                  ? "Pilih jam mengajar dan kelas observasi terlebih dahulu"
                  : "Simpan Jadwal Supervisi"
              }
            >
              <Check className="w-4 h-4 mr-1.5" />
              Simpan Jadwal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};